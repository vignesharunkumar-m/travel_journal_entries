import EncryptedStorage from 'react-native-encrypted-storage';

export async function storeInLocalStorage(key: string, payload: any) {
  try {
    const value =
      typeof payload === 'string' || typeof payload === 'number'
        ? payload.toString()
        : JSON.stringify(payload);

    await EncryptedStorage.setItem(key, value);
  } catch (error) {
    console.log('Store error:', error);
  }
}

export async function retrieveFromLocalStorage(key: string) {
  try {
    const session = await EncryptedStorage.getItem(key);

    if (!session) return null;

    try {
      return JSON.parse(session);
    } catch {
      return session;
    }
  } catch (error) {
    console.log('Retrieve error:', error);
    return null;
  }
}

export async function removeFromLocalStorage(key: string) {
  try {
    await EncryptedStorage.removeItem(key);
  } catch (error) {
    console.log('Remove error:', error);
  }
}

export async function clearStorage() {
  try {
    await EncryptedStorage.clear();
    return true;
  } catch (error) {
    console.log('Clear error:', error);
    return false;
  }
}
