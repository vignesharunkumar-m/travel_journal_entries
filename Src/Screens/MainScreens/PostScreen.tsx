import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import TextInputBox from '../../Components/TextInputBox';
import CustomDateTimePicker from '../../Components/CustomDateTimePicker';
import HOCView from '../../Components/HOCView';
import StyledText from '../../Components/StyledText';
import ToastHelper from '../../Components/ToastHelper';
import SvgIcon from '../../Components/SvgIcon';
import { MainStackParamsList } from '../../@types/NavigationTypes';
import { useAuth } from '../../Hooks/useAuth';
import { useThemeMode } from '../../Hooks/useThemeMode';
import { useAppDispatch } from '../../Store/StoreConfig';
import {
  createJournalEntry,
  syncJournalEntries,
  updateJournalEntry,
} from '../../Store/Slices/journalSlice';
import { FONTS } from '../../Utility/Fonts';
import { FONTSIZES } from '../../Utility/FontSizes';
import { COLORS } from '../../Utility/Colors';
import {
  requestCameraPermission,
  requestGalleryPermission,
  requestLocationPermission,
} from '../../Utility/Permissions';
import { reverseGeocodeLocation } from '../../services/geocodingService';

type ImageItem = { id: string; uri: string };
const DATE_TIME_FORMAT = 'DD-MM-YYYY HH:mm';

const PostSchema = Yup.object().shape({
  title: Yup.string().trim().required('Title is required'),
  description: Yup.string().trim().required('Description is required'),
  dateTime: Yup.string().required('Date & Time is required'),
  images: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
        uri: Yup.string().required(),
      }),
    )
    .min(1, 'Please add at least one image')
    .max(5, 'Max 5 photos allowed'),
});

const PostScreen = () => {
  const { colors } = useThemeMode();
  const navigation =
    useNavigation<StackNavigationProp<MainStackParamsList, 'PostScreen'>>();
  const route = useRoute<any>();
  const editEntry = route?.params?.entry ?? null;
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [capturedLocation, setCapturedLocation] = useState(
    editEntry?.location ?? null,
  );
  const [placeName, setPlaceName] = useState<string | null>(
    editEntry?.place ?? null,
  );
  const autoLocationRequestedRef = useRef(false);
  const lastResolvedLocationRef = useRef<string | null>(null);

  const initialImages = useMemo(
    () =>
      (editEntry?.photos ?? []).map((uri: string, index: number) => ({
        id: `${index}-${uri}`,
        uri,
      })),
    [editEntry?.photos],
  );

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        title: editEntry?.title ?? '',
        description: editEntry?.description ?? '',
        dateTime: editEntry?.createdAt
          ? moment(editEntry.createdAt).format(DATE_TIME_FORMAT)
          : moment().format(DATE_TIME_FORMAT),
        images: initialImages as ImageItem[],
      },
      validationSchema: PostSchema,
      onSubmit: async vals => {
        if (!user?.uid || isSubmitting) {
          ToastHelper.fail('Please sign in again');
          return;
        }

        setIsSubmitting(true);
        const input = {
          title: vals.title,
          description: vals.description,
          photos: vals.images.map(image => image.uri),
          imageTags: editEntry?.imageTags ?? {},
          location: capturedLocation,
          place: placeName,
          timestamp: moment(vals.dateTime, DATE_TIME_FORMAT).valueOf(),
        };

        try {
          if (editEntry?.id) {
            await dispatch(
              updateJournalEntry({
                userId: user.uid,
                input: {
                  id: editEntry.id,
                  ...input,
                },
              }),
            ).unwrap();
            ToastHelper.success('Entry updated');
          } else {
            await dispatch(
              createJournalEntry({
                userId: user.uid,
                input,
              }),
            ).unwrap();
            ToastHelper.success('Entry saved');
          }
        } catch {
          setIsSubmitting(false);
          ToastHelper.fail('Unable to save the entry');
          return;
        }

        setIsSubmitting(false);

        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('HomeScreen');
        }

        // Refresh cloud state in the background without blocking navigation.
        dispatch(syncJournalEntries(user.uid));
      },
    });

  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: Platform.OS === 'android',
      authorizationLevel: 'whenInUse',
      locationProvider: Platform.OS === 'android' ? 'playServices' : undefined,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !(
        state.isConnected && state.isInternetReachable !== false
      );
      setIsOffline(offline);
    });

    return unsubscribe;
  }, []);

  const resolvePlaceName = useCallback(
    async (location: { lat: number; lng: number }) => {
      setIsResolvingPlace(true);

      try {
        const resolvedPlace = await reverseGeocodeLocation(location);
        setPlaceName(resolvedPlace);
      } catch {
        setPlaceName(null);
      } finally {
        setIsResolvingPlace(false);
      }
    },
    [],
  );

  const fetchCurrentLocation = useCallback(async () => {
    if (isFetchingLocation) {
      return;
    }

    const granted = await requestLocationPermission();
    if (!granted) {
      return;
    }

    setIsFetchingLocation(true);

    await new Promise<void>(resolve => {
      Geolocation.getCurrentPosition(
        async position => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCapturedLocation(location);
          lastResolvedLocationRef.current = null;
          if (isOffline) {
            setPlaceName(null);
          } else {
            lastResolvedLocationRef.current = `${location.lat}:${location.lng}`;
            await resolvePlaceName(location);
          }
          setIsFetchingLocation(false);
          resolve();
        },
        () => {
          setIsFetchingLocation(false);
          setPlaceName(null);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }, [isFetchingLocation, isOffline, resolvePlaceName]);

  useEffect(() => {
    if (
      editEntry?.location ||
      capturedLocation ||
      autoLocationRequestedRef.current
    ) {
      return;
    }

    autoLocationRequestedRef.current = true;
    fetchCurrentLocation();
  }, [capturedLocation, editEntry?.location, fetchCurrentLocation]);

  useEffect(() => {
    if (!capturedLocation || placeName || isOffline || isResolvingPlace) {
      return;
    }

    const locationKey = `${capturedLocation.lat}:${capturedLocation.lng}`;

    if (lastResolvedLocationRef.current === locationKey) {
      return;
    }

    lastResolvedLocationRef.current = locationKey;
    resolvePlaceName(capturedLocation);
  }, [
    capturedLocation,
    isOffline,
    isResolvingPlace,
    placeName,
    resolvePlaceName,
  ]);

  const addImage = (uri?: string | null) => {
    if (!uri) {
      return;
    }

    if (values.images.length >= 5) {
      ToastHelper.fail('Max 5 photos allowed');
      return;
    }

    setFieldValue('images', [
      ...values.images,
      { id: `${Date.now()}-${uri}`, uri },
    ]);
  };

  const handleSelectFromGallery = async () => {
    const ok = await requestGalleryPermission();
    if (!ok) {
      return;
    }

    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (response.didCancel || response.errorCode) {
      return;
    }

    addImage(response.assets?.[0]?.uri);
  };

  const handleOpenCamera = async () => {
    const ok = await requestCameraPermission();
    if (!ok) {
      return;
    }

    const response = await launchCamera({
      mediaType: 'photo',
      saveToPhotos: false,
      presentationStyle: 'fullScreen',
    });

    if (response.didCancel || response.errorCode) {
      return;
    }
    addImage(response.assets?.[0]?.uri);
  };

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<ImageItem>) => (
    <ScaleDecorator activeScale={1.06}>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[styles.imgBox, isActive && styles.imgBoxActive]}
      >
        <Image source={{ uri: item.uri }} style={styles.imgThumb} />
        <TouchableOpacity
          style={styles.imgClose}
          onPress={() =>
            setFieldValue(
              'images',
              values.images.filter(image => image.id !== item.id),
            )
          }
        >
          <Text style={styles.imgCloseText}>X</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <HOCView
      isEnableScrollView
      isShowHeader
      bgColor={colors.background}
      scrollViewContentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      headerProps={{
        isShowBorder: true,
        title: editEntry ? 'Edit Entry' : 'New Journal Entry',
        onBackPress: () => navigation.goBack(),
        isShowBackArrow: true,
      }}
    >
      <TextInputBox
        title="Title"
        value={values.title}
        onChangeText={handleChange('title')}
        placeHolder="Enter title..."
        maxLength={100}
        isRequired
        errorText={touched.title && errors.title ? errors.title : ''}
      />

      <TextInputBox
        title="Description"
        value={values.description}
        onChangeText={handleChange('description')}
        placeHolder="Write about your journey..."
        multiline={true}
        isRequired
        maxLength={1000}
        isEnableScrollBar={true}
        inputContainerStyle={styles.descriptionBox}
        errorText={
          touched.description && errors.description ? errors.description : ''
        }
      />

      <CustomDateTimePicker
        title="Date & time"
        mode="datetime"
        isRequired
        value={values.dateTime}
        format={DATE_TIME_FORMAT}
        onSelect={(date: Date) =>
          setFieldValue('dateTime', moment(date).format(DATE_TIME_FORMAT))
        }
        errorText={touched.dateTime && errors.dateTime}
      />

      <View
        style={[
          styles.locationCard,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View>
          <Text style={[styles.locationTitle, { color: colors.textPrimary }]}>
            Location name
          </Text>
          <Text style={[styles.locationValue, { color: colors.textSecondary }]}>
            {isFetchingLocation || isResolvingPlace
              ? 'Fetching location name...'
              : placeName
              ? placeName
              : isOffline
              ? 'Location not available'
              : capturedLocation
              ? 'Location saved. Place name will update soon.'
              : 'Location name will be attached automatically'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: colors.accent }]}
          onPress={fetchCurrentLocation}
          disabled={isFetchingLocation || isResolvingPlace}
        >
          {isFetchingLocation || isResolvingPlace ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Text style={styles.locationButtonText}>
              {capturedLocation ? 'Refresh' : 'Retry'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        Media
      </Text>
      <View style={styles.mediaActionRow}>
        <TouchableOpacity
          style={styles.mediaActionButton}
          onPress={handleSelectFromGallery}
        >
          <View
            style={[
              styles.mediaIconWrap,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <SvgIcon icon="photos" size={24} />
          </View>
          <Text style={[styles.mediaActionText, { color: colors.textPrimary }]}>
            Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaActionButton}
          onPress={handleOpenCamera}
        >
          <View
            style={[
              styles.mediaIconWrap,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <SvgIcon icon="camera" size={24} />
          </View>
          <Text style={[styles.mediaActionText, { color: colors.textPrimary }]}>
            Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mediaActionButton} onPress={() => {}}>
          <View
            style={[
              styles.mediaIconWrap,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <SvgIcon icon="mic" size={24} />
          </View>
          <Text style={[styles.mediaActionText, { color: colors.textPrimary }]}>
            Mic
          </Text>
        </TouchableOpacity>
      </View>

      {values.images.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Images ({values.images.length}/5)
          </Text>
          <DraggableFlatList
            data={values.images}
            keyExtractor={item => item.id}
            horizontal
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imgList}
            onDragEnd={({ data }) => setFieldValue('images', data)}
            renderItem={renderItem}
          />
        </>
      )}

      {errors.images && touched.images ? (
        <StyledText style={styles.errorTxt}>
          {errors.images as string}
        </StyledText>
      ) : null}

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.accent }]}
        onPress={() => handleSubmit()}
      >
        <Text style={styles.submitText}>
          {isSubmitting
            ? 'Saving...'
            : editEntry
            ? 'Update Entry'
            : 'Save Journal Entry'}
        </Text>
      </TouchableOpacity>
    </HOCView>
  );
};

export default PostScreen;

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMid,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionBox: {
    height: 120,
  },
  locationCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  locationValue: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMid,
  },
  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  locationButtonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  mediaActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  mediaActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  mediaIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  imgList: {
    paddingVertical: 4,
    gap: 10,
    marginBottom: 4,
  },
  imgBox: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imgBoxActive: {
    opacity: 0.75,
  },
  imgThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  imgClose: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgCloseText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  submitBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorTxt: {
    fontFamily: FONTS.medium,
    fontSize: FONTSIZES.tiny,
    color: COLORS.error,
    marginTop: 6,
  },
});
