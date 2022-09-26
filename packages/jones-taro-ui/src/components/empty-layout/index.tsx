import {ReactNode} from "react";
import {
  Empty,
  EmptyFailure,
  EmptyLoading,
  EmptyState,
  EmptyStateEmptyFailure,
  EmptyStateEmptyLoading,
  EmptyStateHasContent
} from "@jonests/core";

export interface EmptyLayoutAdapter {
  createLoadingView(emptyLoading: EmptyLoading): ReactNode;
  createEmptyView(empty: Empty, onRetry?: () => Promise<void>): ReactNode;
  createEmptyFailureView(emptyFailure: EmptyFailure, onRetry?: () => Promise<void>): ReactNode;
}

export class EmptyLayoutConfig {
  private static readonly _config = new EmptyLayoutConfig();
  adapter: EmptyLayoutAdapter;

  static get(): EmptyLayoutConfig {
    return this._config;
  }

  setAdapter(adapter: EmptyLayoutAdapter) {
    if (this.adapter != null) {
      throw new Error("EmptyLayoutAdapter不能重复配置");
    }
    this.adapter = adapter;
  }
}

type EmptyLayoutProps = {
  emptyState: EmptyState;
  isShowEmptyLoading?: boolean;
  adapter?: EmptyLayoutAdapter;
  children: ReactNode;
  onEmptyRetry?: () => Promise<void>;
  onFailureRetry?: () => Promise<void>;
};

export function EmptyLayout({ emptyState, isShowEmptyLoading, adapter, children, onEmptyRetry, onFailureRetry }: EmptyLayoutProps) {
  const emptyLayoutConfigAdapter = EmptyLayoutConfig.get().adapter;
  // console.log("emptyState：");
  // console.log(emptyState.kind);

  const render = (): ReactNode => {
    if (emptyState.kind === EmptyStateHasContent) {
      return children;
    }

    if (emptyState.kind === EmptyStateEmptyLoading) {
      if (isShowEmptyLoading) {
        return (adapter?.createLoadingView(emptyState) ?? emptyLayoutConfigAdapter?.createLoadingView(emptyState));
      }
      return null;
    }

    if (emptyState.kind === EmptyStateEmptyFailure) {
      return (adapter?.createEmptyFailureView(emptyState, onFailureRetry) ?? emptyLayoutConfigAdapter?.createEmptyFailureView(emptyState, onFailureRetry));
    }

    return (adapter?.createEmptyView(emptyState, onEmptyRetry) ?? emptyLayoutConfigAdapter?.createEmptyView(emptyState, onEmptyRetry));
  }

  return(<>{render()}</>);
}
