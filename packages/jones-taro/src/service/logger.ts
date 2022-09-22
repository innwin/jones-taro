import {getLogManager} from "@tarojs/taro";
import {ILogger, Ioc} from "jones-ts";
import {TYPE} from "../TYPE";

export class Logger implements ILogger {

  debug(message?: any, ...optionalParams: any[]): void {
    if (process.env.TARO_ENV == "weapp") {
      getLogManager().debug(message, optionalParams);
    } else {
      console.debug(message, optionalParams);
    }
  }

  info(message?: any, ...optionalParams: any[]): void {
    if (process.env.TARO_ENV == "weapp") {
      getLogManager().info(message, optionalParams);
    } else {
      console.info(message, optionalParams);
    }
  }

  log(message?: any, ...optionalParams: any[]): void {
    if (process.env.TARO_ENV == "weapp") {
      getLogManager().log(message, optionalParams);
    } else {
      console.log(message, optionalParams);
    }
  }

  warn(message?: any, ...optionalParams: any[]): void {
    if (process.env.TARO_ENV == "weapp") {
      getLogManager().warn(message, optionalParams);
    } else {
      console.warn(message, optionalParams);
    }
  }

  error(message?: any, ...optionalParams: any[]): void {
    if (process.env.TARO_ENV == "weapp") {
      getLogManager().warn(message, optionalParams);
    } else {
      console.error(message, optionalParams);
    }
  }
}

export function getLogger() {
  return Ioc.get<ILogger>(TYPE.Logger);
}
