import { View, Text, ScrollView } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro, {
  useReachBottom,
  useLoad,
  usePullDownRefresh,
} from "@tarojs/taro";
import { AtIcon, AtDivider, AtLoadMore } from "taro-ui";
import { getAlarmLogPage } from "../../service/log";
import "./index.scss";

// 为 getAlarmLogPage 的响应定义更具体的类型
interface LogPageResult {
  list: LogItem[];
  total: number;
}

// 定义日志项的数据结构
interface LogItem {
  id: number;
  eventTypeName: string;
  eventLevel: "Critical" | "Warning" | "Info";
  logContent: string;
  eventTime: string;
  deviceId: string;
}

const AlarmLog = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [deviceId, setDeviceId] = useState("");

  useLoad((options) => {
    // 从页面参数中获取 deviceId
    if (options.deviceId) {
      setDeviceId(options.deviceId);
      Taro.setNavigationBarTitle({ title: `${options.deviceId} - 报警日志` });
    } else {
      Taro.setNavigationBarTitle({ title: "报警日志" });
    }
  });

  // 首次加载和 deviceId 变化时加载数据
  useEffect(() => {
    if (deviceId) {
      fetchLogs(true);
    }
  }, [deviceId]);

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchLogs(true);
  });

  const fetchLogs = async (isInitial = false) => {
    if (!hasMore || loading) {
      return;
    }

    setLoading(true);
    const currentPage = isInitial ? 1 : page;

    try {
      const res = (await getAlarmLogPage({
        page: currentPage,
        size: 15,
        deviceId: deviceId,
      })) as { code: number; data?: LogPageResult; msg?: string };

      if (res.code === 0 && res.data) {
        const newLogs = res.data.list;
        // 在这里预先格式化时间
        const formattedLogs = newLogs.map((log) => ({
          ...log,
          eventTime: new Date(log.eventTime).toLocaleString(),
        }));

        setLogs(isInitial ? formattedLogs : [...logs, ...formattedLogs]);
        setPage(currentPage + 1);
        setHasMore(
          res.data.total >
            (isInitial
              ? formattedLogs.length
              : logs.length + formattedLogs.length)
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("获取报警日志失败", error);
      Taro.showToast({ title: "加载失败", icon: "none" });
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  };

  // 触底加载更多
  useReachBottom(() => {
    fetchLogs();
  });

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

  return (
    <View className="alarm-log-page">
      {logs.length > 0 ? (
        <ScrollView scrollY className="log-list">
          {logs.map((log) => (
            <View key={log.id} className="log-item">
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
                  <Text className="log-time">{log.eventTime}</Text>
                </View>
                <Text className="log-description">{log.logContent}</Text>
              </View>
            </View>
          ))}
          <AtLoadMore
            onClick={() => fetchLogs()}
            status={loading ? "loading" : hasMore ? "more" : "noMore"}
          />
        </ScrollView>
      ) : (
        <View className="empty-state">
          <AtIcon value="file-generic" size="60" color="#ccc"></AtIcon>
          <Text className="empty-text">暂无报警日志</Text>
        </View>
      )}
    </View>
  );
};

export default AlarmLog;
