import {ReactNode} from "react";
import {EmptyState, ResultFailure} from "@jonests/core";
import {
  LoadMoreLayoutAdapter,
  LoadMoreLayoutConfig,
  PowerScrollView,
  PullRefreshLayoutAdapter,
  PullRefreshLayoutConfig
} from "../power-scroll-view";
import {EmptyLayout, EmptyLayoutAdapter} from "../empty-layout";

type ScrollContainerProps = {
  initView?: ReactNode;
  children?: ReactNode;
  className?: string;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
  emptyState?: EmptyState;
  isHasMore?: boolean;
  refresh?(): Promise<any>;
  loadMore?(): Promise<any>;
  isUseCustomWrapper?: boolean;
  emptyLayoutAdapter?: EmptyLayoutAdapter;
  pullRefreshLayoutAdapter?: PullRefreshLayoutAdapter;
  loadMoreLayoutAdapter?: LoadMoreLayoutAdapter;
};

export function ScrollContainer(
  {
    initView, children, className, isRefreshing, isLoadingMore, emptyState, isHasMore, refresh, loadMore,
    emptyLayoutAdapter,
    isUseCustomWrapper = false,
    pullRefreshLayoutAdapter = PullRefreshLayoutConfig.get().adapter,
    loadMoreLayoutAdapter = LoadMoreLayoutConfig.get().adapter,
  }: ScrollContainerProps) {

  const onLoadNext = async ()  => {
    if (isRefreshing || isLoadingMore || !isHasMore) {
      return;
    }
    const result = await loadMore?.();
    if (result.hasOwnProperty("kind") && result.kind == ResultFailure) {
      throw result.error;
    }
  };

  return(
    <PowerScrollView
      // style={ height && `height: ${height}`}
      className={`scroll-container-content ${className || ''}`}
      current={emptyState?.isHasContent() == true ? 1 : 0}
      isFinished={!isHasMore}
      isShowFinishedLayout={loadMore != null}
      isUseCustomWrapper={isUseCustomWrapper}
      pullRefreshLayoutAdapter={pullRefreshLayoutAdapter}
      loadMoreLayoutAdapter={loadMoreLayoutAdapter}
      onRefresh={refresh}
      onLoadMore={onLoadNext}
      refresherEnabled={emptyState?.isHasContent() == true}
    >
      {!emptyState && initView}
      {
        emptyState &&
        <EmptyLayout emptyState={emptyState} adapter={emptyLayoutAdapter} isShowEmptyLoading={true} onEmptyRetry={refresh} onFailureRetry={refresh}>
          {children}
        </EmptyLayout>
      }
    </PowerScrollView>
  );
}
