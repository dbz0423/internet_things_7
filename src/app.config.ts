export default defineAppConfig({
  pages: ["pages/index/index", "pages/device/index", "pages/profile/index"],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#0f172a",
    navigationBarTitleText: "智慧校园",
    navigationBarTextStyle: "white",
  },
  tabBar: {
    color: "#a0aec0",
    selectedColor: "#38bdf8",
    backgroundColor: "#1e293b",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/index/index",
        iconPath: "static/tabs/index_default.png",
        selectedIconPath: "static/tabs/index_selected.png",
        text: "首页",
      },
      {
        pagePath: "pages/device/index",
        iconPath: "static/tabs/device_default.png",
        selectedIconPath: "static/tabs/device_selected.png",
        text: "设备",
      },
      {
        pagePath: "pages/profile/index",
        iconPath: "static/tabs/profile_default.png",
        selectedIconPath: "static/tabs/profile_selected.png",
        text: "我的",
      },
    ],
  },
});
