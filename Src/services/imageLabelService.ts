import RNBlobUtil from 'react-native-blob-util';
import {
  AZURE_VISION_API_KEY,
  AZURE_VISION_ENDPOINT,
  hasAzureVisionConfig,
} from '../config/apiKeys';

type AzureVisionTagResponse = {
  tags?: Array<{
    name?: string;
    confidence?: number;
  }>;
};

function normalizeImagePath(uri: string) {
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}

async function resolveImagePath(uri: string) {
  const normalizedPath = normalizeImagePath(uri);

  try {
    await RNBlobUtil.fs.stat(normalizedPath);
    return normalizedPath;
  } catch {
    const stat = await RNBlobUtil.fs.stat(uri);
    return stat.path;
  }
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.trim().replace(/\/+$/, '');
}

export async function detectImageLabels(photo: string) {
  if (!photo || !hasAzureVisionConfig()) {
    return [];
  }

  const endpoint = normalizeEndpoint(AZURE_VISION_ENDPOINT);
  const requestUrl = `${endpoint}/vision/v3.2/tag?language=en`;
  const imagePath = await resolveImagePath(photo);
  const response = await RNBlobUtil.fetch(
    'POST',
    requestUrl,
    {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': AZURE_VISION_API_KEY,
    },
    RNBlobUtil.wrap(imagePath),
  );

  if (response.info().status >= 400) {
    throw new Error('Unable to detect image labels.');
  }

  const data = response.json() as AzureVisionTagResponse;
  return (
    data.tags
      ?.map(tag => tag.name?.trim().toLowerCase())
      .filter((label): label is string => Boolean(label))
      .slice(0, 2) ?? []
  );
}
