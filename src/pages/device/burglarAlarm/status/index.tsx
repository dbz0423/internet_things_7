import { View, Text, Image, Button } from "@tarojs/components";
import { useState, useEffect, useCallback } from "react";
import Taro, { useLoad } from "@tarojs/taro";
import { getDeviceDetails, setDeviceMode } from "../../../../service/device";
import { AtIcon, AtList, AtListItem, AtCard, AtButton } from "taro-ui";
import { getAlarmLogPage } from "../../../../service/log"; // 引入获取日志的服务
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

// 定义日志项的数据结构，以便复用
interface LogItem {
  id: number;
  eventTypeName: string;
  eventLevel: "Critical" | "Warning" | "Info";
  logContent: string;
  eventTime: string;
  deviceId: string;
}

// 子组件：只负责显示状态和触发操作
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

      setTimeout(() => {
        onRefresh(); // 刷新设备状态
      }, 1000);
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
              url: `/pages/alarm-log/index?deviceId=${device.deviceId}`,
            })
          }
        >
          <Image
            src="https://unpkg.com/lucide-static@latest/icons/history.svg"
            className="lucide-sm"
          />
          <Text>报警日志</Text>
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
    </View>
  );
};

// ======================================================================================
// 主页面组件
// ======================================================================================
export default function BurglarAlarmPage() {
  const [device, setDevice] = useState<BurglarAlarmDevice | null>(null);
  const [latestLogs, setLatestLogs] = useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getIconInfo = (level?: string | null) => {
    const iconMap = {
      Critical: { icon: "alert-circle", color: "#FF4949" },
      Warning: { icon: "alert-triangle", color: "#FFC82C" },
      Info: { icon: "info", color: "#13CE66" },
    };
    // 默认图标，用于未知或未定义的级别
    const defaultIcon = { icon: "bell", color: "#999" };

    if (!level) return defaultIcon;

    const key = Object.keys(iconMap).find(
      (k) => k.toLowerCase() === level.toLowerCase()
    );
    // 如果找到匹配的级别，则返回对应的图标信息；否则返回默认图标
    return key ? iconMap[key] : defaultIcon;
  };

  const fetchLatestLogs = async (deviceId: string) => {
    try {
      const res = (await getAlarmLogPage({ page: 1, size: 3, deviceId })) as {
        code: number;
        data?: { list: LogItem[] };
      };
      if (res.code === 0 && res.data && res.data.list) {
        setLatestLogs(res.data.list);
      }
    } catch (error) {
      console.error("获取最新报警日志失败", error);
    }
  };

  const fetchDeviceData = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    try {
      const backendDevice = await getDeviceDetails(deviceId);
      if (backendDevice.code === 0 && backendDevice.data) {
        const deviceData = backendDevice.data;
        setDevice({
          id: deviceData.id,
          deviceId: deviceData.deviceId,
          name: deviceData.name,
          alarmStatus: deviceData.alarmStatus || 0,
          lastAlertTime: deviceData.lastAlertTime || "未知时间",
        });
        await fetchLatestLogs(deviceData.deviceId);
      } else {
        throw new Error(backendDevice.msg || "加载设备数据失败");
      }
    } catch (error) {
      Taro.showToast({ title: error.message || "加载设备失败", icon: "none" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useLoad((options) => {
    if (options.deviceId) {
      fetchDeviceData(options.deviceId);
    } else {
      Taro.showToast({ title: "缺少设备ID", icon: "none" });
      setIsLoading(false);
    }
  });

  const navigateToLogs = () => {
    if (device?.deviceId) {
      Taro.navigateTo({
        url: `/pages/alarm-log/index?deviceId=${device.deviceId}`,
      });
    }
  };

  if (isLoading) {
    return <View className="burglar-alarm-page-loading">加载中...</View>;
  }

  if (!device) {
    return (
      <View className="burglar-alarm-page-loading">设备加载失败或无此设备</View>
    );
  }

  return (
    <View className="burglar-alarm-page-container">
      <StatusView
        device={device}
        onRefresh={() => fetchDeviceData(device.deviceId)}
      />

      {/* -- START: Refined Latest Logs List -- */}
      <View className="latest-logs-container">
        <View className="logs-header">
          <Text className="logs-title">最新报警日志</Text>
          {latestLogs.length > 0 && (
            <Text className="view-all-link" onClick={navigateToLogs}>
              查看全部 →
            </Text>
          )}
        </View>

        <View className="log-list-wrapper">
          {latestLogs.length > 0 ? (
            latestLogs.map((log) => (
              <View key={log.id} className="log-item" onClick={navigateToLogs}>
                <View className="log-icon">
                  <AtIcon
                    value={getIconInfo(log.eventLevel).icon}
                    size="24"
                    color={getIconInfo(log.eventLevel).color}
                  />
                </View>
                <View className="log-content">
                  <View className="log-header">
                    <Text className="log-title">{log.eventTypeName}</Text>
                    <Text className="log-time">
                      {new Date(log.eventTime).toLocaleString()}
                    </Text>
                  </View>
                  <Text className="log-description">{log.logContent}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className="log-item">
              <Text className="log-description">暂无相关日志</Text>
            </View>
          )}
        </View>
      </View>
      {/* -- END: Refined Latest Logs List -- */}
    </View>
  );
}
