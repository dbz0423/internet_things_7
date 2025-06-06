import Taro from "@tarojs/taro";

/**
 * 从本地存储中获取Token
 * @returns {string | null} 返回存储的Token，如果不存在则返回null
 */
export const getToken = (): string | null => {
  return Taro.getStorageSync("token");
};
