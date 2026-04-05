import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../../Hooks/useAuth';
import { COLORS } from '../../Utility/Colors';
import CustomButton from '../../Components/CustomButton';
import StyledText from '../../Components/StyledText';
import { FONTS } from '../../Utility/Fonts';
import { FONTSIZES } from '../../Utility/FontSizes';
import { getMessaging } from '@react-native-firebase/messaging';

export default function LoginScreen() {
  const { signInWithGoogle, signingIn, error } = useAuth();
  const [pushId, setPushId] = useState<string | null>(null);

  useEffect(() => {
    getMessaging()
      .getToken()
      .then(token => {
        setPushId(token);
      })
      .catch(e => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />
      <View style={styles.overlay}>
        <View style={styles.heroCard}>
          <StyledText style={styles.eyebrow}>Travel Journal</StyledText>
          <StyledText style={styles.title}>
            Capture the places that changed your day
          </StyledText>
          <StyledText style={styles.subtitle}>
            Save your routes, photos, and small details even when the network is
            weak. We will sync them when you are back online.
          </StyledText>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <StyledText style={styles.featureTitle}>
                Offline-first notes
              </StyledText>
              <StyledText style={styles.featureCopy}>
                Write now, sync later, and keep every memory close at hand.
              </StyledText>
            </View>
            <View style={styles.featureItem}>
              <StyledText style={styles.featureTitle}>
                Journey timeline
              </StyledText>
              <StyledText style={styles.featureCopy}>
                Revisit each stop with date, location, photos, and smart labels.
              </StyledText>
            </View>
          </View>

          {error ? <StyledText style={styles.error}>{error}</StyledText> : null}

          <CustomButton
            title={signingIn ? 'Signing in...' : 'Continue with Google'}
            leftIcon="google_icon"
            onPress={signInWithGoogle}
            isDisabled={signingIn}
            customButtonStyle={styles.buttonStyle}
          />

          {signingIn ? (
            <ActivityIndicator
              size="small"
              color={COLORS.white}
              style={styles.loader}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b87b45',
  },
  topGlow: {
    position: 'absolute',
    top: -70,
    right: -30,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 226, 175, 0.28)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -110,
    left: -50,
    width: 290,
    height: 290,
    borderRadius: 999,
    backgroundColor: 'rgba(104, 63, 26, 0.34)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 28, 10, 0.38)',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  heroCard: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: 'rgba(252, 246, 239, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  eyebrow: {
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: FONTSIZES.extraSmall,
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    color: COLORS.textDark,
    fontSize: FONTSIZES.max,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    color: COLORS.textMid,
    fontSize: FONTSIZES.small,
    lineHeight: 21,
    marginBottom: 20,
  },
  featureList: {
    gap: 12,
    marginBottom: 18,
  },
  featureItem: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.74)',
  },
  featureTitle: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textDark,
    fontSize: FONTSIZES.small,
    marginBottom: 4,
  },
  featureCopy: {
    fontFamily: FONTS.medium,
    color: COLORS.textMid,
    lineHeight: 19,
  },
  error: {
    color: COLORS.error,
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
  buttonStyle: {
    minHeight: 52,
  },
  loader: {
    marginTop: 14,
  },
});
