import { View, Text } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import "./index.scss";

// 后端返回的设备数据类型 (DeviceDTO)
interface Device {
  id: number; // 或 string，根据后端实际情况
  deviceId: string;
  name: string;
  type: number;
  deviceStatus: number;
  deviceOnline: 0 | 1; // 0为离线，1为在线
  // 可能还有其他字段，如 createTime, updateTime 等，但前端卡片暂时不展示
}

// 场景数据类型
interface Scene {
  id: number; // 或 string
  name: string;
  // 可能还有其他字段
}


export default function Index() {
  const [scenes, setScenes] = useState<Scene[]>([]); // 存储从后端获取的场景列表
  const [activeTab, setActiveTab] = useState<string>(""); // 当前选中的场景名称
  const [sceneDevices, setSceneDevices] = useState<Device[]>([]); // 当前场景下的设备列表
  const [isLoadingScenes, setIsLoadingScenes] = useState<boolean>(true);
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(false);

  // 获取场景列表
  useEffect(() => {
    const userInfo = Taro.getStorageSync("user");
    const token = Taro.getStorageSync("token");

    if (userInfo && userInfo.id && token) {
      setIsLoadingScenes(true);
      Taro.request({
        url: `/api/user/${userInfo.id}/scenes`,
        method: "GET",
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: function (res) {
          if (res.statusCode === 200 && res.data && res.data.code === 0) {
            const fetchedScenes: Scene[] = res.data.data || [];
            if (fetchedScenes.length > 0) {
              setScenes(fetchedScenes);
              setActiveTab(fetchedScenes[0].name); // 默认选中第一个场景
            } else {
              setScenes([]);
              setActiveTab("暂无场景");
            }
          } else {
            console.error("获取场景列表失败:", res);
            setActiveTab("场景加载失败");
          }
        },
        fail: function (err) {
          console.error("请求场景列表接口失败:", err);
          setActiveTab("网络错误");
        },
        complete: function () {
          setIsLoadingScenes(false);
        },
      });
    } else {
      console.log("用户未登录或信息不全");
      setActiveTab("请先登录");
      setIsLoadingScenes(false);
    }
  }, []);

  // 根据选中的场景 (activeTab) 获取设备列表
  useEffect(() => {
    if (
      !activeTab ||
      isLoadingScenes ||
      activeTab === "暂无场景" ||
      activeTab === "场景加载失败" ||
      activeTab === "网络错误" ||
      activeTab === "请先登录"
    ) {
      setSceneDevices([]);
      return;
    }

    const currentScene = scenes.find((scene) => scene.name === activeTab);
    if (currentScene && currentScene.id) {
      const sceneId = currentScene.id;
      const token = Taro.getStorageSync("token");

      if (!token) {
        console.error("无法获取设备：token不存在");
        setSceneDevices([]);
        return;
      }

      setIsLoadingDevices(true);
      setSceneDevices([]); // 清空旧设备列表

      Taro.request({
        url: `/api/scenes/${sceneId}/devices`,
        method: "GET",
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: function (res) {
          if (res.statusCode === 200 && res.data && res.data.code === 0) {
            const fetchedDevices: Device[] = res.data.data || [];
            setSceneDevices(fetchedDevices);
          } else {
            console.error(
              `获取场景 ${activeTab} (ID: ${sceneId}) 的设备列表失败:`,
              res
            );
            setSceneDevices([]); // 出错时清空设备
          }
        },
        fail: function (err) {
          console.error(
            `请求场景 ${activeTab} (ID: ${sceneId}) 设备列表接口失败:`,
            err
          );
          setSceneDevices([]);
        },
        complete: function () {
          setIsLoadingDevices(false);
        },
      });
    } else {
      setSceneDevices([]); // 如果找不到场景ID，也清空设备
    }
  }, [activeTab, scenes, isLoadingScenes]);

  // 设备卡片渲染
  const renderDeviceCard = (device: Device) => {
    const onlineStatus = device.deviceOnline === 1 ? "在线" : "离线";
    const statusColor =
      device.deviceOnline === 1 ? "text-green-400" : "text-sky-300";
    // 暂时使用固定图标或根据类型简单映射
    const getDeviceIcon = (type: number) => {
      // TODO: 根据设备类型返回不同图标, 例如 type 1 = 💡, type 2 = 🚪 etc.
      // 示例：
      if (type === 1) return "💡";
      if (type === 2) return "🚪";
      return "📱"; // 默认图标
    };

    return (
      <View
        key={device.id || device.deviceId} // deviceId 应该更唯一
        className="bg-[rgba(45,55,72,0.5)] backdrop-blur-md border border-[rgba(255,255,255,0.15)] rounded-2xl p-4 shadow-lg flex flex-col items-start justify-between aspect-square hover:bg-[rgba(55,65,82,0.6)] transition-all cursor-pointer space-y-2"
      >
        <Text className="text-3xl">{getDeviceIcon(device.type)}</Text>
        <View className="flex-grow" />
        <View>
          <Text className="block text-md font-semibold text-sky-50">
            {device.name}
          </Text>
          <Text className={`block text-xs ${statusColor}`}>{onlineStatus}</Text>
        </View>
      </View>
    );
  };

  // 标签页内容渲染函数
  const renderTabContent = () => {
    if (isLoadingScenes) {
      return (
        <View className="p-4 text-center text-sky-400">
          <Text>正在加载场景...</Text>
        </View>
      );
    }
    if (
      activeTab === "暂无场景" ||
      activeTab === "场景加载失败" ||
      activeTab === "网络错误" ||
      activeTab === "请先登录" ||
      scenes.length === 0
    ) {
      return (
        <View className="p-4 text-center text-sky-400">
          <Text>{activeTab || "请先添加或选择场景"}</Text>
        </View>
      );
    }
    if (isLoadingDevices) {
      return (
        <View className="p-4 text-center text-sky-400">
          <Text>正在加载设备...</Text>
        </View>
      );
    }
    if (sceneDevices.length === 0) {
      return (
        <View className="p-4 text-center text-sky-400">
          <Text>此空间暂无设备</Text>
        </View>
      );
    }
    return (
      <View className="grid grid-cols-2 gap-4 p-4">
        {sceneDevices.map(renderDeviceCard)}
      </View>
    );
  };

  const sceneTabs = scenes.map((s) => s.name);

  return (
    <View className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-sky-100 flex flex-col">
      <View className="p-4 pt-6 flex justify-between items-center bg-transparent">
        <View className="flex items-center">
          <Text className="text-xl font-semibold text-sky-50 mr-1">
            {Taro.getStorageSync("user")?.nickname || "我的家"}
          </Text>
          <Text className="text-sm text-sky-200">▼</Text>
        </View>
        <View className="flex items-center space-x-5">
          <Text className="text-2xl text-sky-100 cursor-pointer hover:text-sky-50 transition">
            💬
          </Text>
          <Text className="text-2xl text-sky-100 cursor-pointer hover:text-sky-50 transition">
            ➕
          </Text>
        </View>
      </View>

      <View className="px-2 py-3 bg-transparent shadow-sm overflow-x-auto whitespace-nowrap no-scrollbar">
        {isLoadingScenes && sceneTabs.length === 0 ? (
          <Text className="inline-block px-4 py-2 text-sm font-medium text-sky-200">
            场景加载中...
          </Text>
        ) : sceneTabs.length > 0 ? (
          sceneTabs.map((tabName) => (
            <Text
              key={tabName}
              className={`inline-block px-4 py-2 text-sm font-medium rounded-lg cursor-pointer mr-2 ${
                activeTab === tabName
                  ? "bg-sky-500 text-white shadow-md"
                  : "text-sky-200 hover:bg-sky-700/[0.5] hover:text-sky-50"
              }`}
              onClick={() => setActiveTab(tabName)}
            >
              {tabName}
            </Text>
          ))
        ) : (
          <Text className="inline-block px-4 py-2 text-sm font-medium text-sky-200">
            {activeTab || "无可用场景"}
          </Text>
        )}
      </View>

      <View className="flex-grow overflow-y-auto">{renderTabContent()}</View>
    </View>
  );
}
