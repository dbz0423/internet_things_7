import { View, Text, Navigator } from "@tarojs/components";
import { AtInput, AtButton } from "taro-ui";
import { useState } from "react";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View className="login-container">
      <View className="header">
        <Text className="title">创建账户</Text>
        <Text className="subtitle">加入智慧校园管理系统</Text>
      </View>

      <View className="form-wrapper">
        <AtInput
          name="username"
          type="text"
          placeholder="用户名"
          value={username}
          onChange={setUsername}
        />

        <AtInput
          name="password"
          type="password"
          placeholder="密码"
          value={password}
          onChange={setPassword}
        />

        <AtInput
          name="confirmPassword"
          type="password"
          placeholder="确认密码"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <AtButton
          type="primary"
          className="login-btn"
          onClick={() => {
            if (!username || !password || password !== confirmPassword) {
              Taro.showToast({ title: "请检查输入信息", icon: "none" });
              return;
            }
            // 注册成功后跳转登录页
            Taro.navigateTo({ url: "/pages/login/index" });
          }}
        >
          注册
        </AtButton>

        <View className="register-row">
          <Text>已有账户？</Text>
          <Navigator url="/pages/login/index" className="register-link">
            立即登录
          </Navigator>
        </View>
      </View>
    </View>
  );
}
