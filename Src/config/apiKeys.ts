export const MAPBOX_ACCESS_TOKEN = 'key';
export const AZURE_VISION_ENDPOINT = 'key';
export const AZURE_VISION_API_KEY = 'key';

export const WEB_CLIENT_ID =
  '237608787999-aso9qbrd89bhkfpadhc8td0vm8b6ouge.apps.googleusercontent.com';

export function hasMapboxAccessToken() {
  return MAPBOX_ACCESS_TOKEN.trim().length > 0;
}

export function hasAzureVisionConfig() {
  return (
    AZURE_VISION_ENDPOINT.trim().length > 0 &&
    AZURE_VISION_API_KEY.trim().length > 0
  );
}
