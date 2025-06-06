import { View, Text, Image } from "@tarojs/components";
import { useState, useEffect, useCallback } from "react";
import Taro from "@tarojs/taro";
import { getDeviceDetails, setDeviceMode } from "../../../../service/device";
import "./index.scss";

// 设备数据类型
interface BurglarAlarmDevice {
  id: number;
  deviceId: string;
  name: string;
  // 0: 撤防(安全), 1: 布防, 2: 报警中(入侵) - 报警状态可能需要通过websocket更新
  alarmStatus: 0 | 1 | 2;
  lastAlertTime?: string;
}

// 记录数据类型
interface ActivityLog {
  id: number;
  icon: string;
  title: string;
  time: string;
}

const StatusView = ({
  device,
  onRefresh,
}: {
  device: BurglarAlarmDevice;
  onRefresh: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [currentModeName, setCurrentModeName] = useState<string | null>(null);

  useEffect(() => {
    if (device.alarmStatus === 1) {
      // 1 表示布防状态
      const savedMode = Taro.getStorageSync("selectedMode");
      if (savedMode && savedMode.name) {
        setCurrentModeName(savedMode.name);
      } else {
        setCurrentModeName("未知模式");
      }
    } else {
      setCurrentModeName(null);
    }
  }, [device.alarmStatus]);

  const mockLogs: ActivityLog[] = [
    { id: 1, icon: "user-check", title: "检测到移动", time: "今天 14:32:05" },
    { id: 2, icon: "volume-x", title: "警报已静音", time: "今天 14:32:50" },
    { id: 3, icon: "shield", title: "系统布防", time: "今天 08:00:12" },
  ];

  const getStatusIndicatorClass = () => {
    switch (device.alarmStatus) {
      case 0:
        return "status-indicator safe";
      case 1:
        return "status-indicator armed";
      case 2:
        return "status-indicator alert";
      default:
        return "";
    }
  };

  const getStatusInfo = () => {
    const iconUrl = "https://unpkg.com/lucide-static@latest/icons/";
    switch (device.alarmStatus) {
      case 0:
        return {
          icon: `${iconUrl}shield-check.svg`,
          text: "系统安全",
          subtext: "已撤防",
          color: "text-green-200",
        };
      case 1:
        return {
          icon: `${iconUrl}shield.svg`,
          text: "系统已布防",
          subtext: "守护中",
          color: "text-blue-200",
        };
      case 2:
        return {
          icon: `${iconUrl}shield-alert.svg`,
          text: "检测到入侵!",
          subtext: device.lastAlertTime,
          color: "text-red-200",
        };
      default:
        return {
          icon: `${iconUrl}shield-off.svg`,
          text: "状态未知",
          subtext: "",
          color: "text-gray-400",
        };
    }
  };

  const handleArm = async () => {
    const mode = Taro.getStorageSync("selectedMode");
    if (!mode || !mode.value) {
      Taro.showToast({
        title: "请先前往布防设置选择一个模式",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    await handleSetArmStatus(mode.value);
  };

  const handleDisarm = async () => {
    await handleSetArmStatus("0");
  };

  const handleSetArmStatus = async (modeValue: string) => {
    if (loading) return;
    setLoading(true);
    Taro.showLoading({ title: "请稍候..." });
    try {
      await setDeviceMode(device.deviceId, "BurglarAlarm", modeValue);
      Taro.showToast({
        title: modeValue === "0" ? "撤防成功" : "布防成功",
        icon: "success",
      });

      // 手动更新模式名称以确保UI实时刷新
      if (modeValue !== "0") {
        const savedMode = Taro.getStorageSync("selectedMode");
        if (savedMode && savedMode.name) {
          setCurrentModeName(savedMode.name);
        }
      } else {
        setCurrentModeName(null);
      }

      onRefresh(); // 操作成功后刷新数据
    } catch (error) {
      Taro.showToast({ title: error.message || "操作失败", icon: "none" });
    } finally {
      Taro.hideLoading();
      setLoading(false);
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View className="flex flex-col items-center justify-center space-y-6 my-4 w-full">
      {/* 状态指示器 */}
      <View
        className={`${getStatusIndicatorClass()} w-48 h-48 rounded-full flex flex-col items-center justify-center p-4 text-center`}
      >
        <Image
          src={statusInfo.icon}
          className="lucide-lg mb-2"
          style={{ width: "60px", height: "60px" }}
        />
        <Text className={`text-xl font-bold ${statusInfo.color}`}>
          {statusInfo.text}
        </Text>
        {currentModeName && (
          <Text
            className={`text-sm font-semibold ${statusInfo.color.replace(
              "200",
              "300"
            )} mt-1`}
          >
            模式: {currentModeName}
          </Text>
        )}
        <Text className={`text-xs ${statusInfo.color.replace("200", "300")}`}>
          {statusInfo.subtext}
        </Text>
      </View>

      {/* 布防/撤防按钮 */}
      <View className="grid grid-cols-2 gap-4 w-full max-w-xs">
        <View
          className={`action-button arm col-span-1 py-4 flex items-center justify-center space-x-2 ${
            loading ? "opacity-50" : ""
          }`}
          onClick={handleArm}
        >
          <Image
            src="https://unpkg.com/lucide-static@latest/icons/shield.svg"
            className="lucide w-5 h-5"
            style={{ width: "20px", height: "20px" }}
          />
          <Text>布 防</Text>
        </View>
        <View
          className={`action-button disarm col-span-1 py-4 flex items-center justify-center space-x-2 ${
            loading ? "opacity-50" : ""
          }`}
          onClick={handleDisarm}
        >
          <Image
            src="https://unpkg.com/lucide-static@latest/icons/shield-off.svg"
            className="lucide w-5 h-5"
            style={{ width: "20px", height: "20px" }}
          />
          <Text>撤 防</Text>
        </View>
      </View>

      {/* 导航到其他页面 */}
      <View className="grid grid-cols-2 gap-4 w-full max-w-xs mt-4">
        <View
          className="nav-button"
          onClick={() =>
            Taro.navigateTo({
              url: `/pages/device/burglarAlarm/logs/index?deviceId=${device.deviceId}`,
            })
          }
        >
          <Image
            src="https://unpkg.com/lucide-static@latest/icons/history.svg"
            className="lucide-sm"
          />
          <Text>活动记录</Text>
        </View>
        <View
          className="nav-button"
          onClick={() =>
            Taro.navigateTo({
              url: `/pages/device/burglarAlarm/settings/index?deviceId=${device.deviceId}`,
            })
          }
        >
          <Image
            src="https://unpkg.com/lucide-static@latest/icons/settings-2.svg"
            className="lucide-sm"
          />
          <Text>布防设置</Text>
        </View>
      </View>

      {/* 最近活动记录 (简化版) */}
      <View className="glass-card w-full max-w-xs mt-6">
        <h3 className="text-md font-semibold text-blue-200 mb-2 border-b border-white/10 pb-1.5">
          最近活动
        </h3>
        <View className="space-y-1 text-sm">
          {mockLogs.map((log) => (
            <View
              key={log.id}
              className="log-item flex justify-between items-center"
            >
              <View>
                <Text className="text-blue-100">{log.title}</Text>
                <Text className="text-xs text-blue-400 block">{log.time}</Text>
              </View>
              <Image
                src={`https://unpkg.com/lucide-static@latest/icons/${log.icon}.svg`}
                className="lucide-sm"
                style={{ width: "20px", height: "20px" }}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
// #endregion

// ======================================================================================
// 主页面组件
// ======================================================================================
export default function BurglarAlarmPage() {
  const [device, setDevice] = useState<BurglarAlarmDevice | null>(null);

  const fetchDeviceData = useCallback(async (deviceId: string) => {
    Taro.showLoading({ title: "加载中..." });
    try {
      const res = await getDeviceDetails(deviceId);
      const backendDevice = res.data;
      if (!backendDevice || typeof backendDevice.deviceId !== "string") {
        Taro.showToast({ title: "设备数据格式错误", icon: "none" });
        return;
      }
      setDevice({
        id: backendDevice.id,
        deviceId: backendDevice.deviceId,
        name: backendDevice.name,
        // 0: 撤防, 1: 布防, 2: 报警
        alarmStatus:
          backendDevice.deviceStatus === 0
            ? 0
            : backendDevice.deviceStatus === 2
            ? 2
            : 1,
        lastAlertTime: backendDevice.lastAlertTime || "未知时间",
      });
    } catch (error) {
      Taro.showToast({ title: error.message || "加载设备失败", icon: "none" });
    } finally {
      Taro.hideLoading();
    }
  }, []);

  useEffect(() => {
    const router = Taro.getCurrentInstance().router;
    const deviceId = router?.params.deviceId;
    if (deviceId) {
      fetchDeviceData(deviceId);
    }
  }, [fetchDeviceData]);

  if (!device) {
    return (
      <View className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950">
        <Text className="text-white">正在加载设备信息...</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col text-white p-5 bg-gradient-to-b from-slate-900 via-gray-900 to-indigo-950 min-h-screen">
      <View>
        <h1 className="text-xl font-semibold text-white">{device.name}</h1>
      </View>

      <View className="flex-grow flex flex-col items-center justify-center">
        <StatusView
          device={device}
          onRefresh={() => fetchDeviceData(device.deviceId)}
        />
      </View>
    </View>
  );
}
