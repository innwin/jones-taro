import {showModal, showActionSheet} from "@tarojs/taro";
import {Ioc} from "@jonests/core";
import {ActionSheet, Dialog, IDialogService} from "@jonests/client";
import {TYPE} from "../TYPE";

export class DialogService implements IDialogService {

  show(option?: Dialog.Option): Promise<Dialog.SuccessCallbackResult> {
    return showModal(option);
  }

  showActionSheet(option: ActionSheet.Option): Promise<ActionSheet.SuccessCallbackResult> {
    return showActionSheet(option);
  }
}

export function getDialogService() {
  return Ioc.get<IDialogService>(TYPE.DialogService);
}
