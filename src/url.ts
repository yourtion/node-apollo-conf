import { createQuery } from "./utils";

/**
 * URL生成与构建
 * @link https://github.com/ctripcorp/apollo/wiki/%E5%85%B6%E5%AE%83%E8%AF%AD%E8%A8%80%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%8E%A5%E5%85%A5%E6%8C%87%E5%8D%97
 */
export interface IQueryConfig {
  // Apollo配置服务的地址
  url: string;
  // 应用的appId
  appId: string;
  // 集群名
  cluster: string;
  // Namespace的名字
  namespace: string;
  // 应用部署的机器ip（用来实现灰度发布）
  ip?: string;
  // dataCenter: optional
  dataCenter?: string;
  // messages: optional
  messages?: string;
}
export interface ICacheConfig extends IQueryConfig {
  // 上一次的releaseKey（用来给服务端比较版本）
  releaseKey?: string;
}
export interface INoticConfig extends IQueryConfig {
  // notifications信息
  notifications: Record<string, any>;
}

/** 通过不带缓存的Http接口从Apollo读取配置 */
export function queryConfig({ url, appId, cluster, namespace, releaseKey, ip, dataCenter, messages }: ICacheConfig) {
  return `${url}/configs/${appId}/${cluster}/${namespace}${createQuery({ releaseKey, ip, dataCenter, messages })}`;
}

/** 通过带缓存的Http接口从Apollo读取配置 */
export function queryConfigAsJson({ url, appId, cluster, namespace, ip, dataCenter, messages }: IQueryConfig) {
  return `${url}/configfiles/json/${appId}/${cluster}/${namespace}${createQuery({ ip, dataCenter, messages })}`;
}

/** 配置更新推送 */
export function queryUpdate({ url, appId, cluster, notifications }: INoticConfig) {
  return `${url}/notifications/v2${createQuery({ appId, cluster, notifications: JSON.stringify(notifications) })}`;
}
