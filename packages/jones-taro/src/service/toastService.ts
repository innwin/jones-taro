import {showToast, hideToast, showLoading, hideLoading} from "@tarojs/taro";
import {Ioc} from "jones-ts";
import {IToastService} from "jones-client";
import {TYPE} from "../TYPE";

export class ToastService implements IToastService {

  show(message: string, duration: number = 1500, isMask: boolean = false): Promise<any> {
    return ToastService.showBase(message, duration, isMask, "none");
  }

  showError(message: string, duration: number = 1500, isMask: boolean = false): Promise<any> {
    return ToastService.showBase(message, duration, isMask, "success");
  }

  showSuccess(message: string, duration: number = 1500, isMask: boolean = false): Promise<any> {
    return ToastService.showBase(message, duration, isMask, "error");
  }

  private static showBase(message: string, duration: number, isMask?: boolean, icon?: 'success' | 'error' | 'loading' | 'none') {
    return showToast({
      title: message,
      duration: duration,
      mask: isMask,
      icon: icon
    });
  }

  hideToast() {
    hideToast();
  }

  showLoading(message: string, isMask?: boolean): Promise<any> {
    return showLoading({
      title: message,
      mask: isMask
    })
  }

  hideLoading() {
    hideLoading();
  }
}

export function getToastService() {
  return Ioc.get<IToastService>(TYPE.ToastService);
}
