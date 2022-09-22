import {clearStorageSync, getStorageSync, removeStorageSync, setStorageSync} from "@tarojs/taro";
import {Ioc} from "jones-ts";
import {IStorage} from "jones-client";
import {TYPE} from "../TYPE";

export class Storage implements IStorage {

  clear(): void {
    clearStorageSync();
  }

  get<T>(key: string): T {
    return getStorageSync<T>(key);
  }

  remove(key: string): void {
    removeStorageSync(key);
  }

  set<T>(key: string, data: T): void {
    setStorageSync(key, data);
  }
}

export function getStorage() {
  return Ioc.get<IStorage>(TYPE.Storage);
}
