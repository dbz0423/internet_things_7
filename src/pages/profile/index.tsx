import { View, Text, Button, Input, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { logout, updateUser, getPkgVersion } from "../../service/user";
import "./index.scss";
import image_url from "../../static/images/default-avatar.png";

export default function ProfilePage() {
  // 添加状态声明
  const [editMode, setEditMode] = useState(false);
  const [tempInfo, setTempInfo] = useState({
    username: "",
    mobile: "",
    nickname: "",
    avatar: "",
  });
  const [userInfo, setUserInfo] = useState({
    avatar: image_url,
    nickname: "默认昵称",
    username: "默认用户",
    mobile: "13XXXXXXXXXX",
    tenantName: "默认租户",
  });
  const [version, setVersion] = useState("1.0.0");
  const getVersion = async () => {
    const res = await getPkgVersion();
    if (res.code === 0) {
      if (res.data.versionNumber !== version) {
        const newVersion = res.data.versionNumber;
        Taro.showModal({
          title: "版本更新",
          content: newVersion,
          showCancel: false,
          confirmText: "确定",
          confirmColor: "#007AFF",
          success: (res) => {
            if (res.confirm) {
              setVersion(newVersion);
              Taro.showToast({ title: "版本更新成功", icon: "none" });
              // Taro.navigateTo({ url: "/pages/version/index" });
            }
          },
        });
      } else {
        Taro.showToast({ title: "已是最新版本", icon: "none" });
      }
    }
  };
  useEffect(() => {
    getVersion();
    // 从本地存储中获取用户信息并设置到状态中
    const userInfo = Taro.getStorageSync("user");
    if (userInfo) {
      setUserInfo(userInfo);
      setTempInfo(userInfo);
    }
  }, []);
  // 添加保存处理函数
  const handleSave = async () => {
    try {
      if (tempInfo.nickname === "") {
        Taro.showToast({ title: "昵称不能为空", icon: "none" });
        return;
      }
      if (tempInfo.mobile === "") {
        Taro.showToast({ title: "手机号不能为空", icon: "none" });
        return;
      }
      if (tempInfo.username === "") {
        Taro.showToast({ title: "用户名不能为空", icon: "none" });
        return;
      }
      if (
        tempInfo.nickname === userInfo.nickname &&
        tempInfo.mobile === userInfo.mobile &&
        tempInfo.username === userInfo.username
      ) {
        Taro.showToast({ title: "没有修改", icon: "none" });
        setEditMode(false);
        return;
      }
      await updateUser(tempInfo);
      const newTempInfo = { ...tempInfo, tenantName: userInfo.tenantName };
      setUserInfo(newTempInfo);
      setEditMode(false);
      Taro.showToast({ title: "保存成功", icon: "success" });
      Taro.removeStorageSync("token");
      Taro.removeStorageSync("user");
      Taro.reLaunch({ url: "/pages/login/index" });
    } catch (error) {
      Taro.showToast({ title: "保存失败", icon: "none" });
    }
  };

  // 添加退出登录处理函数
  const handleLogout = async () => {
    await logout();
    Taro.removeStorageSync("token");
    Taro.removeStorageSync("user");
    Taro.reLaunch({ url: "/pages/login/index" });
  };

  return (
    <View className="profile-page min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 个人信息卡片 */}
      <View className="flex-row items-center mb-4">
        <Image className="avatar" src={userInfo.avatar} mode="aspectFill" />
        <View className="ml-4">
          {editMode ? (
            <Input
              className="input-filed text-white text-xl"
              value={tempInfo.nickname}
              onInput={(e) =>
                setTempInfo({ ...tempInfo, nickname: e.detail.value })
              }
            />
          ) : (
            <Text className="nickname">{userInfo.nickname}</Text>
          )}
        </View>
      </View>

      <View className="input-group">
        <Text>用户名</Text>
        {editMode ? (
          <Input
            className="input-filed"
            value={tempInfo.username}
            onInput={(e) =>
              setTempInfo({ ...tempInfo, username: e.detail.value })
            }
          />
        ) : (
          <Text className="info-value">{userInfo.username}</Text>
        )}
      </View>

      <View className="input-group">
        <Text>手机号</Text>
        {editMode ? (
          <Input
            className="margin-top-100"
            value={tempInfo.mobile}
            type="number"
            onInput={(e) =>
              setTempInfo({ ...tempInfo, mobile: e.detail.value })
            }
          />
        ) : (
          <Text className="info-value">{userInfo.mobile}</Text>
        )}
      </View>

      <View className="input-group">
        <Text>租户</Text>
        <Text className="info-value">{userInfo.tenantName}</Text>
      </View>

      {editMode ? (
        <Button className="primary-button" onClick={handleSave}>
          保存修改
        </Button>
      ) : (
        <Button className="secondary-button" onClick={() => setEditMode(true)}>
          修改信息
        </Button>
      )}

      {/* 功能操作区 */}
      <View className="action-group">
        <View className="action-item" onClick={handleLogout}>
          <Text className="logout-text">退出登录</Text>
          <Text className="icon">›</Text>
        </View>
      </View>

      {/* 版本信息 */}
      <View className="version-info">
        <Text>当前版本：{version}</Text>
        <Text>© 2025 智慧校园管理系统</Text>
      </View>
    </View>
  );
}
