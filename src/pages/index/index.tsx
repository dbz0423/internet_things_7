import { View, Text } from "@tarojs/components";
import { useState, useEffect, useRef } from "react";
import Taro from "@tarojs/taro";
import {
  getScenes,
  getDevicesBySceneId,
  getAllDevices,
} from "../../service/scene";
import "./index.scss";

// 后端返回的设备数据类型 (DeviceDTO)
interface Device {
  id: number;
  deviceId: string;
  name: string;
  type: number;
  deviceStatus: number;
  deviceOnline: 0 | 1;
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
  const socketTaskRef = useRef<Taro.SocketTask | null>(null);

  // 获取场景列表
  useEffect(() => {
    const fetchScenes = async () => {
      setIsLoadingScenes(true);
      try {
        const fetchedScenes = await getScenes();
        console.log("获取的场景列表:", fetchedScenes);

        if (fetchedScenes.length > 0) {
          const allScene = {
            id: 100,
            name: "全部",
          };
          const newFetchedScenes = [allScene, ...fetchedScenes];
          setScenes(newFetchedScenes);
          setActiveTab(newFetchedScenes[0].name);
        } else {
          setScenes([]);
          setActiveTab("暂无场景");
        }
      } catch (error) {
        console.error("获取场景列表失败:", error);
        setActiveTab("场景加载失败");
      } finally {
        setIsLoadingScenes(false);
      }
    };

    // 检查登录状态
    const userInfo = Taro.getStorageSync("user");
    if (userInfo && userInfo.id) {
      fetchScenes();
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
      const fetchDevices = async (sceneId: number | string) => {
        setIsLoadingDevices(true);
        setSceneDevices([]); // 清空旧设备列表
        try {
          if (sceneId === 100) {
            let params = {
              tenantId: Taro.getStorageSync("user").tenantId,
              userId: Taro.getStorageSync("user").id,
            };
            const allDevices = await getAllDevices(params);
            setSceneDevices(allDevices);
            setIsLoadingDevices(false);
            return;
          }
          const fetchedDevices = await getDevicesBySceneId(sceneId);
          setSceneDevices(fetchedDevices);
        } catch (error) {
          console.error(
            `获取场景 ${activeTab} (ID: ${sceneId}) 的设备列表失败:`,
            error
          );
          setSceneDevices([]); // 出错时清空设备
        } finally {
          setIsLoadingDevices(false);
        }
      };

      fetchDevices(currentScene.id);
    } else {
      setSceneDevices([]); // 如果找不到场景ID，也清空设备
    }
  }, [activeTab, scenes, isLoadingScenes]);

  // WebSocket 实时更新
  useEffect(() => {
    // 只有当设备列表加载完成后才建立连接
    if (isLoadingDevices || sceneDevices.length === 0) {
      return;
    }

    // 防止重复连接
    if (socketTaskRef.current && socketTaskRef.current.readyState < 2) {
      return;
    }

    const connectSocket = async () => {
      try {
        const task = await Taro.connectSocket({
          url: "ws://192.168.100.254:8183/ws/device/status",
        });
        socketTaskRef.current = task;

        socketTaskRef.current.onOpen(() => {
          console.log("WebSocket [首页] 连接已打开");
        });

        socketTaskRef.current.onMessage((res) => {
          try {
            const data = JSON.parse(res.data as string);
            console.log("WebSocket [首页] 收到消息:", data);

            // 更新设备列表中的状态
            setSceneDevices((prevDevices) => {
              return prevDevices.map((device) => {
                if (device.deviceId === data.deviceId) {
                  console.log(`匹配到设备 ${device.deviceId}, 更新状态...`);
                  // 返回一个*新*的设备对象
                  return {
                    ...device,
                    deviceOnline: data.deviceOnline,
                    deviceStatus: data.deviceStatus,
                  };
                }
                return device; // 未匹配的设备返回原样
              });
            });
          } catch (e) {
            console.error("WebSocket [首页] 解析消息失败:", e);
          }
        });

        socketTaskRef.current.onError((err) => {
          console.error("WebSocket [首页] 连接出错:", err);
          socketTaskRef.current = null;
        });

        socketTaskRef.current.onClose((res) => {
          console.log("WebSocket [首页] 连接已关闭", res);
          socketTaskRef.current = null;
        });
      } catch (error) {
        console.error("WebSocket [首页] 连接失败:", error);
      }
    };

    connectSocket();

    return () => {
      if (socketTaskRef.current) {
        console.log("WebSocket [首页] 关闭连接");
        socketTaskRef.current.close({});
        socketTaskRef.current = null;
      }
    };
    // 依赖项：当场景或设备列表加载状态变化时，重新评估是否需要连接
  }, [isLoadingDevices, sceneDevices]);

  // 点击设备卡片的处理函数
  const handleDeviceClick = (device: Device) => {
    // 检查是否为防盗报警器
    if (device.deviceId && device.deviceId.startsWith("BurglarAlarm_")) {
      Taro.navigateTo({
        url: `/pages/device/burglarAlarm/status/index?deviceId=${device.deviceId}`,
      });
    } else {
      // 对其他设备可以进行不同的处理，或暂时不处理
      console.log("点击了其他设备:", device.name);
      Taro.showToast({
        title: `暂未开放'${device.name}'的详情页`,
        icon: "none",
        duration: 2000,
      });
    }
  };

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
        onClick={() => handleDeviceClick(device)} // 添加点击事件
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
