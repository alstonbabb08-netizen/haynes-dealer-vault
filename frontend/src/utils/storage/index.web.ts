import AsyncStorage from "@react-native-async-storage/async-storage";
import { AssertNoExtras, StorageBase, StorageItemValue } from "./storage-base";

export class Storage extends StorageBase {
  async getItem<F extends StorageItemValue>(key:string,fallback:F){try{return this.retrieve(await AsyncStorage.getItem(key),fallback);}catch(e){this.warn('getItem',key,e);return fallback;}}
  async setItem<V extends StorageItemValue>(key:string,value:V){try{await AsyncStorage.setItem(key,JSON.stringify(value));return true;}catch(e){this.warn('setItem',key,e);return false;}}
  async removeItem(key:string){try{await AsyncStorage.removeItem(key);return true;}catch(e){this.warn('removeItem',key,e);return false;}}
  async secureGet<F extends StorageItemValue>(key:string,fallback:F){return this.getItem(key,fallback);}
  async secureSet<V extends StorageItemValue>(key:string,value:V){return this.setItem(key,value);}
  async secureRemove(key:string){return this.removeItem(key);}
}
export const storage = new Storage();
type _NoExtras = AssertNoExtras<Exclude<keyof Storage, keyof StorageBase>>;
