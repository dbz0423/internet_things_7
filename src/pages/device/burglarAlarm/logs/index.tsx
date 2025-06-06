import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./index.scss";

const BurglarAlarmLogs = () => {
  // TODO: Fetch and display logs
  const mockLogs = [
    { id: 1, title: "检测到移动", time: "今天 14:32:05" },
    { id: 2, title: "警报已静音", time: "今天 14:32:50" },
    { id: 3, title: "系统布防", time: "今天 08:00:12" },
    { id: 4, title: "系统撤防", time: "昨天 18:05:00" },
  ];

  return (
    <View className="p-4 bg-gray-100 min-h-screen font-sans">
      <View className="bg-white rounded-lg shadow-md p-4">
        <Text className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          活动日志
        </Text>
        <View className="space-y-4">
          {mockLogs.map((log) => (
            <View key={log.id} className="flex justify-between items-center">
              <View>
                <Text className="text-base text-gray-800">{log.title}</Text>
                <Text className="text-sm text-gray-500">{log.time}</Text>
              </View>
              {/* Icon can be added here if needed */}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default BurglarAlarmLogs;
