import {ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
  View,
  ITouchEvent,
  ScrollView,
  CustomWrapper,
  BaseEventOrig,
  ScrollViewProps, StandardProps,
} from '@tarojs/components'
import { TaroElement } from '@tarojs/runtime'
import { useTouch } from './useTouch'
import { scrollOffset, preventDefault, debounce } from './utils'

// https://github.com/AntmJS/vantui/blob/main/packages/vantui/src/power-scroll-view/index.tsx

export type PullRefreshStatus =
  | 'normal'
  | 'loading'
  | 'loosing'
  | 'pulling'
  | 'success'

interface PullRefreshProps {
  disabled?: boolean
  headerClass?: string
  headHeight?: number | string
  pullDistance?: number | string
  successDuration?: number | string
  animationDuration?: number | string
  pullRefreshLayoutAdapter?: PullRefreshLayoutAdapter
}

export interface PullRefreshLayoutAdapter {
  get isShowSuccessTip(): boolean;
  render(status: PullRefreshStatus, distance: number): ReactNode;
}

export interface LoadMoreLayoutAdapter {
  renderLoading(): ReactNode;
  renderError(onRetry?: () => Promise<void>): ReactNode;
  renderFinished(): ReactNode;
}

type eventType = {
  page: number
  pageSize: number
}

interface PowerScrollViewProps<T extends number | undefined>
  extends StandardProps,
    PullRefreshProps,
    Omit<ScrollViewProps, 'onScrollToUpper' | 'onScrollToLower'> {
  offset?: number
  total?: T
  children: ReactNode
  current?: number
  pageSize?: number
  minTriggerTopDistance?: number
  isFinished?: boolean
  errorText?: string
  isShowFinishedLayout?: boolean
  loadMoreLayoutAdapter?: LoadMoreLayoutAdapter
  onRefresh?: (event: T extends number ? eventType : number) => Promise<void>
  onLoadMore?: (event: T extends number ? eventType : number) => Promise<void>
  // Scroll
  onScrollToUpper?: (
    event: T extends number ? eventType : number,
  ) => Promise<void>
  onScrollToLower?: (
    event: T extends number ? eventType : number,
  ) => Promise<void>
}

/**
 * bem helper
 * b() // 'button'
 * b('text') // 'button__text'
 * b({ disabled }) // 'button button--disabled'
 * b('text', { disabled }) // 'button__text button__text--disabled'
 * b(['disabled', 'primary']) // 'button button--disabled button--primary'
 */
// const [name, bem, t] = createNamespace('pull-refresh')
// const pullRefreshBem = (name?: string) =>
//   name ? 'van-pull-refresh__' + name : 'van-pull-refresh'
const bem = (name?: string) =>
  name ? 'power-scroll-view__' + name : 'power-scroll-view'
const sleep = (t: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, t)
  })
const DEFAULT_HEAD_HEIGHT = 60
const MIN_TRIGGER_TOP_DISTANCE = 150

// const RenderStatus: React.FC<{}> = (props) => {}
export function PowerScrollView<T extends number | undefined>(
  props: PowerScrollViewProps<T>,
) {
  const {
    minTriggerTopDistance = MIN_TRIGGER_TOP_DISTANCE,
    headerClass,
    headHeight = DEFAULT_HEAD_HEIGHT,
    successDuration = 500,
    animationDuration = 300,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    disabled,
    pullDistance = props.refresherThreshold || props.pullDistance,
    onRefresh,
    pullRefreshLayoutAdapter,
    children,
    onLoadMore,
    onScroll: onScrollEvent,
    scrollTop,
    offset,
    isShowFinishedLayout,
    loadMoreLayoutAdapter,
    isFinished: _isFinished,
    errorText,
    total,
    current,
    pageSize = 20,
    //命名以scrollView 为准
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    upperThreshold,
    lowerThreshold = props.lowerThreshold || props.offset || 250,
    // 重复的属性  以 vant 为准
    refresherEnabled = props.refresherEnabled ?? props.disabled ?? true,
    onScrollToLower = props.onScrollToLower || props.onLoadMore,
    onScrollToUpper = props.onScrollToUpper || props.onRefresh,
    scrollY = props.scrollY ?? true,
    className,
    ...rest
  } = props
  // ==LIST=======================================
  // 是否到底了
  // const reachDownRef = useRef(false)
  // 是否显示 loading
  // ts推断
  const loadingRef = useRef(false)
  // 是否显示 报错
  const errorRef = useRef(false)
  // 分页
  const paginationRef = useRef({
    page: 0,
    pageSize,
  })

  const startTop = useRef(0)

  const [finished, setFinished] = useState<boolean>(_isFinished || false)
  const currentCount = current ?? Array.from(children as any).length
  const listCount = useRef(0)
  useEffect(() => {
    const { pageSize } = paginationRef.current
    if (currentCount <= pageSize) {
      paginationRef.current.page = 1
      setFinished(false)
    }
    // 传入finished
    if (_isFinished !== undefined) {
      setFinished(_isFinished)
      return
    }
    // 都没有传
    if (total === undefined) {
      const addCount = currentCount - listCount.current
      if (
        currentCount === 0 ||
        (listCount.current !== 0 &&
          addCount > -1 &&
          addCount < paginationRef.current.pageSize)
      ) {
        setFinished(true)
      }
      listCount.current = currentCount
      return
    }
    // 传入total
    if (currentCount >= total) {
      setFinished(true)
    } else {
      setFinished(false)
    }
  }, [total, currentCount, _isFinished])

  const [isError, setError] = useState(false)
  // 是否滚动最上面了
  const reachTopRef = useRef(true)
  const [status, setState] = useState<PullRefreshStatus>('normal')
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const touch = useTouch()
  const headStyle = useMemo((): { height: string } | string => {
    if (headHeight !== DEFAULT_HEAD_HEIGHT) {
      return {
        height: `${headHeight}px`,
      }
    }
    return ''
  }, [headHeight])

  const getScrollTop = useCallback(async () => {
    const { scrollTop } = await scrollOffset(scrollRef.current!)
    return scrollTop
  }, [])

  const isTouchable = useCallback(() => {
    return (
      status !== 'loading' &&
      status !== 'success' &&
      refresherEnabled &&
      !loadingRef.current
    )
  }, [refresherEnabled, status])

  const ease = useCallback(
    (distance: number) => {
      const _pullDistance = +(pullDistance || headHeight)

      if (distance > _pullDistance) {
        if (distance < _pullDistance * 2) {
          distance = _pullDistance + (distance - _pullDistance) / 2
        } else {
          distance = _pullDistance * 1.5 + (distance - _pullDistance * 2) / 4
        }
      }

      return Math.round(distance)
    },
    [headHeight, pullDistance],
  )

  const setStatus = useCallback(
    (distance: number, isLoading?: boolean) => {
      const _pullDistance = +(pullDistance || headHeight)
      setDistance(distance);
      if (isLoading) {
        setState('loading')
        loadingRef.current = true
      } else if (distance === 0) {
        setState('normal')
      } else if (distance < _pullDistance) {
        setState('pulling')
      } else {
        setState('loosing')
      }
    },
    [headHeight, pullDistance],
  )

  const renderStatus = useMemo((): ReactNode => {
    return pullRefreshLayoutAdapter?.render(status, distance);
  }, [distance, status, pullRefreshLayoutAdapter])

  const showSuccessTip = useCallback(async () => {
    // state.status = 'success'
    setState('success')
    await sleep(+successDuration)
  }, [successDuration])

  // 提前把reachTopRef.current的值 求出来
  const debounceScrollOffset = useMemo(() => {
    const _getScrollTop = async () => {
      const _scrollTop = await getScrollTop()
      reachTopRef.current = _scrollTop <= 0
      return _scrollTop
    }
    return debounce(_getScrollTop, 200)
  }, [getScrollTop])
  // 如果这是了 scrollTop 要触发ScrollOffset计算
  useEffect(() => {
    // 立马执行一次
    if (scrollTop) {
      reachTopRef.current = false
    }
  }, [scrollTop])
  const onScroll = useCallback(
    (e: BaseEventOrig<ScrollViewProps.onScrollDetail>) => {
      onScrollEvent?.(e)
      // 模拟器 上 滑到顶  e.detail.scrollTop 不等于0, 低端机可能会出现
      // reachTopRef.current = e.detail.scrollTop === 0
      debounceScrollOffset()
    },
    [debounceScrollOffset, onScrollEvent],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkPosition = useCallback(
    async (event: ITouchEvent) => {
      // const { scrollTop } = await scrollOffset(scrollRef.current!)
      // reachTopRef.current = scrollTop === 0
      if (reachTopRef.current) {
        setDuration(0)
        touch.start(event)
      }
    },
    [touch],
  )

  const isStartRef = useRef(false);

  const onTouchStart = useCallback(
    async (event: ITouchEvent) => {
      if (isTouchable()) {
        isStartRef.current = false;
        const data = await getScrollTop()
        isStartRef.current = true;
        startTop.current = data
        await checkPosition(event)
      }
    },
    [checkPosition, getScrollTop, isTouchable],
  )

  // list
  const onTouchMove = useCallback(
    (event: ITouchEvent): void => {
      if (isTouchable() && startTop.current < minTriggerTopDistance) {
        if (!isStartRef.current) {
          return;
        }
        const { deltaY } = touch
        touch.move(event)
        if (reachTopRef.current && deltaY.current >= 0 && touch.isVertical()) {
          preventDefault(event, true)
          setStatus(ease(deltaY.current))
        }
      }
    },
    [ease, isTouchable, minTriggerTopDistance, setStatus, touch],
  )

  // list
  const refresh = useCallback(async () => {
    try {
      errorRef.current = false
      setStatus(+headHeight, true)
      setError(false)
      paginationRef.current.page = 1
      const event = total === undefined ? 0 : paginationRef.current
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await onScrollToUpper?.(event)
      setDuration(+animationDuration)
      if (pullRefreshLayoutAdapter?.isShowSuccessTip == true) {
        // 添加等待时间
        await showSuccessTip()
      }
      // 阻止下拉过程中 二次触发下拉
    } finally {
      setStatus(0, false)
      loadingRef.current = false
    }
  }, [
    animationDuration,
    distance,
    headHeight,
    onScrollToUpper,
    pullRefreshLayoutAdapter,
    setStatus,
    showSuccessTip,
    total,
  ])
  const onTouchEnd = useCallback(async () => {
    if (reachTopRef.current && touch.deltaY.current && isTouchable()) {
      // state.duration = +animationDuration
      setDuration(+animationDuration)

      if (status === 'loosing') {
        await refresh()
      } else {
        setStatus(0)
      }
    } else {
      setStatus(0)
    }
  }, [
    refresh,
    isTouchable,
    animationDuration,
    setStatus,
    status,
    touch.deltaY,
  ])
  const trackStyle = useMemo(
    () => ({
      transitionDuration: `${duration}ms`,
      transform: distance ? `translate3d(0,${distance}px, 0)` : '',
    }),
    [distance, duration],
  )

  const scrollRef = useRef<TaroElement>()

  // ==LIST=======================================
  const isBanLoad = useCallback(() => {
    return (
      finished || status !== 'normal' || loadingRef.current || errorRef.current
    )
  }, [finished, status])

  const loadNext = useCallback(async () => {
    if (currentCount === 0 || isBanLoad()) return;
    try {
      loadingRef.current = true
      paginationRef.current.page += 1
      const event = total === undefined ? currentCount : paginationRef.current
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await onScrollToLower?.(event)
    } catch (e) {
      paginationRef.current.page -= 1
      errorRef.current = true
      setError(true)
      // 这里要主动触发刷新
      // throw e
    } finally {
      loadingRef.current = false
    }
  }, [currentCount, isBanLoad, onScrollToLower, total])

  const renderFinishedText = useMemo((): ReactNode => {
    if (isShowFinishedLayout == true && finished) {
      return loadMoreLayoutAdapter?.renderFinished();
    }
    return null;
  }, [finished, loadMoreLayoutAdapter])

  const renderLoadingText = useMemo((): ReactNode => {
    if (!finished && scrollY) {
      return loadMoreLayoutAdapter?.renderLoading();
    }
    return null
  }, [finished, scrollY, loadMoreLayoutAdapter])

  const clickErrorTextHandle = useCallback(async () => {
    setError(false)
    errorRef.current = false
    await loadNext()
    // web 很奇怪的问题
  }, [loadNext])

  const renderErrorText = useMemo((): ReactNode => {
    if (isError) {
      return loadMoreLayoutAdapter?.renderError(clickErrorTextHandle);
    }
    return null
  }, [clickErrorTextHandle, isError, loadMoreLayoutAdapter])
  // 如果不定高 一直下拉

  const ListScrollContent = useMemo(() => {
    // if (finished && currentCount === 0) {
    //   // return <Empty description={emptyDescription} image={emptyImage} />
    //   return (
    //     renderEmpty ? (
    //       renderEmpty
    //     ) : (
    //         <Text>暂无记录</Text>
    //       )
    //   );
    // }
    if (isError) {
      return renderErrorText
    }

    if (finished) {
      return renderFinishedText
    }

    return renderLoadingText
  }, [
    finished,
    isError,
    renderLoadingText,
    renderErrorText,
    renderFinishedText,
  ])

  const renderStatusBody = (
    <View className={headerClass || bem('head')} style={headStyle}>
      {renderStatus}
    </View>
  )
  const headElement =
    process.env.TARO_ENV === 'weapp' ? (
      <CustomWrapper>{renderStatusBody}</CustomWrapper>
    ) : (
      renderStatusBody
    )

  return (
    <ScrollView
      ref={scrollRef}
      lowerThreshold={lowerThreshold}
      onScroll={onScroll}
      scrollTop={scrollTop}
      onScrollToLower={loadNext}
      scrollY={scrollY}
      className={`${bem()} ${className || ''}`}
      {...rest}
    >
      <View
        className={ currentCount === 0 ? '' : bem('track')}
        style={ trackStyle}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onTouchStart={onTouchStart}
      >
        {headElement}
        {children}
        {currentCount !== 0 && ListScrollContent}
      </View>
    </ScrollView>
  )
}

export class PullRefreshLayoutConfig {
  private static readonly _config = new PullRefreshLayoutConfig();
  adapter: PullRefreshLayoutAdapter;

  static get(): PullRefreshLayoutConfig {
    return this._config;
  }

  setAdapter(adapter: PullRefreshLayoutAdapter) {
    if (this.adapter != null) {
      throw new Error("PullRefreshLayoutAdapter不能重复配置");
    }
    this.adapter = adapter;
  }
}

export class LoadMoreLayoutConfig {
  private static readonly _config = new LoadMoreLayoutConfig();
  adapter: LoadMoreLayoutAdapter;

  static get(): LoadMoreLayoutConfig {
    return this._config;
  }

  setAdapter(adapter: LoadMoreLayoutAdapter) {
    if (this.adapter != null) {
      throw new Error("LoadMoreLayoutAdapter不能重复配置");
    }
    this.adapter = adapter;
  }
}
