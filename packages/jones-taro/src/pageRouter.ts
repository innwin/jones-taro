import {QueryParameter} from "jones-ts";
import {navigateTo, redirectTo, reLaunch, switchTab} from "@tarojs/taro";

const paramsUselessKeys = ["package", "path"];

export interface IPage extends Record<string, any> {
  package?: string;
  path: string;
}

/** https://github.com/lblblong/tarojs-router-next/blob/master/packages/tarojs-router-next/src/router/index.ts */
export class PageRouter {

  /** 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。使用 Router.back 可以返回到原页面。小程序中页面栈最多十层。 */
  static navigateTo(page: IPage): Promise<TaroGeneral.CallbackResult> {
    return navigateTo({
      url: PageRouter.getUrl(page)
    });
  }

  /** 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面。 */
  static redirectTo(page: IPage): Promise<TaroGeneral.CallbackResult> {
    return redirectTo({
      url: PageRouter.getUrl(page)
    });
  }

  /** 关闭所有页面，打开到应用内的某个页面 */
  static reLaunch(page: IPage): Promise<TaroGeneral.CallbackResult> {
    return reLaunch({
      url: PageRouter.getUrl(page)
    });
  }

  /** 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面 */
  static switchTab(page: IPage): Promise<TaroGeneral.CallbackResult> {
    return switchTab({
      url: PageRouter.getUrl(page)
    });
  }

  private static getUrl(page: IPage) {
    const url = PageRouter.getPagePath(page);
    // const urlSearchParams = new URLSearchParams(page);
    // paramsUselessKeys.forEach((value) => urlSearchParams.delete(value));
    // const queryParameters = urlSearchParams.toString();
    const queryParameters = new QueryParameter(page).omit(paramsUselessKeys).toUrlQueryParameters();
    return queryParameters
      ? url + "?" + queryParameters
      : url;
  }

  private static getPagePath(page: IPage): string {
    let path = page.package == null ? "" : page.package + "/";
    return "/" + path + (page.path ?? "pages/" + page.constructor.name + "/index");
  }
}
