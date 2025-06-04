import { View, Text } from "@tarojs/components";
import { useState } from "react";
import "./index.scss";

// 标签页数据
const TABS = ["全屋", "客厅", "卧室", "办公室", "厨房", "浴室"];

// 模拟不同标签页下的设备数据
// 图标暂时用emoji，建议后续替换为SVG图标
const devicesData = {
  全屋: [
    { id: "d1", icon: "💡", name: "智能灯泡", status: "在线" },
    { id: "d2", icon: "🚪", name: "门窗传感器", status: "已关" },
    { id: "d3", icon: "💨", name: "空气净化器", status: "自动模式" },
    { id: "d4", icon: "🌡️", name: "环境监测仪", status: "24°C | 60%" },
  ],
  客厅: [
    { id: "d5", icon: "📺", name: "智能电视", status: "已关闭" },
    { id: "d6", icon: "🎶", name: "智能音箱", status: "播放中" },
  ],
  卧室: [
    { id: "d1", icon: "💡", name: "卧室灯", status: "50%亮度" },
    { id: "d7", icon: "😴", name: "睡眠监测器", status: "小王 熟睡" },
  ],
  办公室: [{ id: "d8", icon: "💻", name: "工作电脑", status: "在线" }],
  厨房: [],
  浴室: [],
};

export default function Index() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const currentDevices = devicesData[activeTab] || [];

  // 设备卡片渲染
  const renderDeviceCard = (device) => (
    <View
      key={device.id}
      className="bg-[rgba(45,55,72,0.5)] backdrop-blur-md border border-[rgba(255,255,255,0.15)] rounded-2xl p-4 shadow-lg flex flex-col items-start justify-between aspect-square hover:bg-[rgba(55,65,82,0.6)] transition-all cursor-pointer space-y-2"
      // aspect-square 尝试保持卡片为方形，内容较多时可能需要调整高度或min-height
    >
      <Text className="text-3xl">{device.icon}</Text>
      <View className="flex-grow" />{" "}
      {/* 用于将下面的文本推到底部，如果内容固定可以不用 */}
      <View>
        <Text className="block text-md font-semibold text-sky-50">
          {device.name}
        </Text>
        <Text className="block text-xs text-sky-300">{device.status}</Text>
      </View>
    </View>
  );

  // 标签页内容渲染函数 - 现在是设备网格
  const renderTabContent = () => {
    if (currentDevices.length === 0) {
      return (
        <View className="p-4 text-center text-sky-400">
          <Text>此空间暂无设备</Text>
        </View>
      );
    }
    return (
      <View className="grid grid-cols-2 gap-4 p-4">
        {currentDevices.map(renderDeviceCard)}
      </View>
    );
  };

  return (
    // 整体背景和文字颜色，采用HTML原型中的深色渐变主题
    <View className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-sky-100 flex flex-col">
      {/* 头部区域 - 米家风格，深色主题 */}
      <View className="p-4 pt-6 flex justify-between items-center bg-transparent">
        <View className="flex items-center">
          <Text className="text-xl font-semibold text-sky-50 mr-1">
            3026455131的家
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

      {/* 顶部标签页导航 - 米家风格，深色主题 */}
      <View className="px-2 py-3 bg-transparent shadow-sm overflow-x-auto whitespace-nowrap no-scrollbar">
        {TABS.map((tab) => (
          <Text
            key={tab}
            className={`inline-block px-4 py-2 text-sm font-medium rounded-lg cursor-pointer mr-2
                        ${
                          activeTab === tab
                            ? "bg-sky-500 text-white shadow-md"
                            : "text-sky-200 hover:bg-sky-700/[0.5] hover:text-sky-50"
                        }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Text>
        ))}
      </View>

      {/* 主内容区域 - 设备网格 */}
      <View className="flex-grow overflow-y-auto">{renderTabContent()}</View>

      {/* 底部导航栏 - 暂时不实现，若需要可在此添加 */}
      {/* <View className='h-16 bg-red-500'>底部导航</View> */}
    </View>
  );
}

// 辅助类，用于隐藏滚动条 (在Taro H5中可能需要针对性处理)
// Tailwind本身没有直接的 no-scrollbar，但可以通过插件或自定义CSS实现
// 对于小程序，overflow-x-auto 通常不会显示滚动条
// .no-scrollbar::-webkit-scrollbar { display: none; }
// .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
