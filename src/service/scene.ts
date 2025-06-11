import Taro from "@tarojs/taro";
import { getToken } from "../utils/auth"; // 修正导入路径

const BASE_URL = ""; // 如果有统一的API网关前缀，可以在此定义

/**
 * 获取当前用户的所有场景
 */
export const getScenes = async () => {
  const userInfo = Taro.getStorageSync("user");
  if (!userInfo || !userInfo.id) {
    throw new Error("用户未登录或信息不全");
  }

  const token = getToken();
  if (!token) {
    throw new Error("无法获取场景：token不存在");
  }

  const res = await Taro.request({
    url: `${BASE_URL}/api/user/${userInfo.id}/${userInfo.tenantId}/scenes`,
    method: "GET",
    header: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.statusCode === 200 && res.data && res.data.code === 0) {
    return res.data.data || [];
  } else {
    throw new Error(res.data?.msg || "获取场景列表失败");
  }
};

/**
 * 根据场景ID获取设备列表
 * @param sceneId 场景的ID
 */
export const getDevicesBySceneId = async (sceneId: number | string) => {
  const token = getToken();
  if (!token) {
    throw new Error("无法获取设备：token不存在");
  }

  const res = await Taro.request({
    url: `${BASE_URL}/api/scenes/${sceneId}/devices`,
    method: "GET",
    header: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.statusCode === 200 && res.data && res.data.code === 0) {
    return res.data.data || [];
  } else {
    throw new Error(res.data?.msg || "获取设备列表失败");
  }
};

export const getAllDevices = async (params: any) => {
  console.log("获取所有设备", params);

  const token = getToken();
  if (!token) {
    throw new Error("无法获取设备：token不存在");
  }

  const res = await Taro.request({
    url: `${BASE_URL}/api/iot/device/list`,
    method: "GET",
    header: {
      Authorization: `Bearer ${token}`,
    },
    data: params,
  });

  if (res.statusCode === 200 && res.data && res.data.code === 0) {
    return res.data.data || [];
  } else {
    throw new Error(res.data?.msg || "获取设备列表失败");
  }
};
