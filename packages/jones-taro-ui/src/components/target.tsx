import { ReactNode } from "react"
import {getEnv} from "@tarojs/taro";

interface TargetProps {
  type?: TaroGeneral.ENV_TYPE
  children?: ReactNode
}

export function Target(props: TargetProps) {
  const { type, children } = props;
  return <>{type === getEnv() && children}</>
}

export function TargetElse(props: TargetProps) {
  const { type, children } = props;
  return <>{type !== getEnv() && children}</>
}
