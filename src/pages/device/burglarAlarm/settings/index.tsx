import Taro, { useRouter } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { useState, useEffect } from "react";
import "./index.scss";

const BurglarAlarmSettings = () => {
  const router = useRouter();
  const deviceId = router.params.deviceId || "";
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  useEffect(() => {
    // 页面加载时，从缓存读取已保存的模式
    const savedMode = Taro.getStorageSync("selectedMode");
    if (savedMode && savedMode.value) {
      setSelectedMode(savedMode.value);
    }
  }, []);

  const modes = [
    { name: "迎宾模式", value: "1" },
    { name: "在家警戒模式", value: "2" },
    { name: "离家警戒模式", value: "3" },
    { name: "静默报警模式", value: "4" },
  ];

  const handleSetMode = (mode: { name: string; value: string }) => {
    if (!deviceId) return;
    // 如果点击的已经是选中的模式，则不作任何操作
    if (selectedMode === mode.value) return;

    setSelectedMode(mode.value);
    // 存储完整的模式对象，以便状态页可以获取名称
    Taro.setStorageSync("selectedMode", mode);
    Taro.showToast({
      title: `已选择: ${mode.name}`,
      icon: "success",
      duration: 1500,
    });
  };

  return (
    <View className="page-container">
      <View className="glass-card p-4">
        <Text className="card-title">布防模式设置</Text>
        <View className="mt-3">
          {modes.map((mode) => (
            <View
              key={mode.value}
              className="setting-item"
              onClick={() => handleSetMode(mode)}
            >
              <Text className="setting-item-label">{mode.name}</Text>
              <View
                className={`toggle-switch ${
                  selectedMode === mode.value ? "active" : ""
                }`}
              >
                <View className="toggle-switch-handle" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default BurglarAlarmSettings;
