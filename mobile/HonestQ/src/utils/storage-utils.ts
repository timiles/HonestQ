import { AsyncStorage } from 'react-native';

export async function storeData(key: string, data: any) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function getData(key: string, handleData: (data: any) => void) {
  const value = await AsyncStorage.getItem(key);
  handleData(value ? JSON.parse(value) : null);
}

export async function removeData(key: string) {
  await AsyncStorage.removeItem(key);
}
