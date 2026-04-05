import { MAPBOX_ACCESS_TOKEN, hasMapboxAccessToken } from '../config/apiKeys';
import { JournalLocation } from '../features/journal/types';

type GeocodingResponse = {
  features?: Array<{
    place_name?: string;
    text?: string;
    context?: Array<{
      id?: string;
      text?: string;
      short_code?: string;
    }>;
  }>;
};

function pickReadablePlace(response: GeocodingResponse) {
  const firstResult = response.features?.[0];

  if (!firstResult) {
    return null;
  }

  const locality = firstResult.context?.find(component =>
    component.id?.startsWith('place'),
  );
  const adminArea = firstResult.context?.find(component =>
    component.id?.startsWith('region'),
  );
  const country = firstResult.context?.find(component =>
    component.id?.startsWith('country'),
  );

  const placeParts = [
    locality?.text ?? firstResult.text,
    adminArea?.text,
    country?.text,
  ].filter(Boolean);

  return placeParts.length
    ? Array.from(new Set(placeParts)).join(', ')
    : firstResult.place_name ?? null;
}

export async function reverseGeocodeLocation(location: JournalLocation) {
  if (!location || !hasMapboxAccessToken()) {
    return null;
  }

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`,
  );

  if (!response.ok) {
    throw new Error('Unable to geocode location.');
  }
  console.log(response, 'response from geo');

  const data = (await response.json()) as GeocodingResponse;
  return pickReadablePlace(data);
}
