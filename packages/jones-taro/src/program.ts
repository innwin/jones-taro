import {ILogger, IObjectContainerRegister} from "jones-ts";
import {IDialogService, IStorage, IToastService} from "jones-client";
import {TYPE} from "./TYPE";
import {Logger} from "./service/logger";
import {ToastService} from "./service/toastService";
import {DialogService} from "./service/dialogService";
import {Storage} from "./service/storage";

export class TaroProgram {
    static addTaroService(iocRegister: IObjectContainerRegister): IObjectContainerRegister {
        iocRegister.registerSingleton<ILogger>(TYPE.Logger, () => new Logger());
        iocRegister.registerSingleton<IStorage>(TYPE.Storage, () => new Storage());
        iocRegister.registerSingleton<IToastService>(TYPE.ToastService, () => new ToastService());
        iocRegister.registerSingleton<IDialogService>(TYPE.DialogService, () => new DialogService());
    }
}