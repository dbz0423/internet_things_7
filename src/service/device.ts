import Taro from "@tarojs/taro";

const request = (options) => {
  const token = Taro.getStorageSync("token");
  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
  };

  return Taro.request({
    ...options,
    header: {
      ...defaultHeaders,
      ...options.header,
    },
  }).then((res) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.data?.code === 0) {
        return res.data;
      }
      // Promise.reject a custom error object
      return Promise.reject({
        message: res.data?.msg || "业务错误",
        response: res,
      });
    }
    return Promise.reject({
      message: `网络请求错误, 状态码: ${res.statusCode}`,
      response: res,
    });
  });
};

/**
 * 获取设备详情
 * @param deviceId 设备ID
 */
export const getDeviceDetails = (deviceId: string) => {
  return request({
    url: `/api/iot/device/${deviceId}`,
    method: "GET",
  });
};

/**
 * 设置设备模式
 * @param deviceId 设备ID
 * @param modeValue 模式值
 */
export const setDeviceMode = (
  deviceId: string,
  modeName: string,
  modeValue: string
) => {
  return request({
    url: `/api/iot/device/setMode`,
    method: "POST",
    data: {
      deviceId,
      modeName,
      modeValue,
    },
  });
};
