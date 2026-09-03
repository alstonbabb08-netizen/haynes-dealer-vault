import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { AssertNoExtras, StorageBase, StorageItemValue } from "./storage-base";

export class Storage extends StorageBase {
  async getItem<F extends StorageItemValue>(key:string,fallback:F){try{return this.retrieve(await AsyncStorage.getItem(key),fallback);}catch(e){this.warn('getItem',key,e);return fallback;}}
  async setItem<V extends StorageItemValue>(key:string,value:V){try{await AsyncStorage.setItem(key,JSON.stringify(value));return true;}catch(e){this.warn('setItem',key,e);return false;}}
  async removeItem(key:string){try{await AsyncStorage.removeItem(key);return true;}catch(e){this.warn('removeItem',key,e);return false;}}
  async secureGet<F extends StorageItemValue>(key:string,fallback:F){try{return this.retrieve(await SecureStore.getItemAsync(key),fallback);}catch(e){this.warn('secureGet',key,e);return fallback;}}
  async secureSet<V extends StorageItemValue>(key:string,value:V){try{await SecureStore.setItemAsync(key,JSON.stringify(value));return true;}catch(e){this.warn('secureSet',key,e);return false;}}
  async secureRemove(key:string){try{await SecureStore.deleteItemAsync(key);return true;}catch(e){this.warn('secureRemove',key,e);return false;}}
}
export const storage = new Storage();
type _NoExtras = AssertNoExtras<Exclude<keyof Storage, keyof StorageBase>>;
