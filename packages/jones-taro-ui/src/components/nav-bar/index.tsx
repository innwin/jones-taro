import {ReactNode} from "react";
import classNames from 'classnames';
import {View, Text} from "@tarojs/components";

type Props = {
  className?: string;
  border?: boolean;
  fixed?: boolean;
  safeAreaInsetTop?: boolean;
  title?: string;
  renderLeft?: ReactNode;
  renderContent?: ReactNode;
  renderRight?: ReactNode;
};

export function NavBar(
  {
    className,
    border = false,
    fixed = false,
    safeAreaInsetTop = false,
    title,
    renderLeft, renderContent, renderRight
  }: Props) {

  const classes = classNames({
    [`nav-bar-border`]: border,
    [`nav-bar-fixed`]: fixed,
    [`nav-bar-safe-area-inset-top`]: safeAreaInsetTop,
  });
  const cls = classNames('nav-bar', classes, className);

  const renderLeftLayout = () => {
    return (<View className='left'>
      {renderLeft}
    </View>);
  }

  const renderContentLayout = () => {
    return (
      <View className="content">
        { renderContent || <Text className='title'>{title}</Text> }
      </View>
    );
  }

  const renderRightLayout = () => {
    return (<View className='right'>
      {renderRight}
    </View>);
  }

  return (
    <View className={cls}>
      {renderLeftLayout()}
      {renderContentLayout()}
      {renderRightLayout()}
    </View>
  );
}
