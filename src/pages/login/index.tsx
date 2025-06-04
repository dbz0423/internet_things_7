import { View, Text, Image, Input, Button } from "@tarojs/components";
import "./index.scss";
import logo from "../../static/images/new-logo.png";

export default function Login() {
  return (
    <View className="login-container">
      <View className="logo">
        <Image
          className="logo-image"
          src="https://unpkg.com/lucide-static@0.513.0/icons/brain-circuit.svg"
        />
      </View>

      <Text className="title">欢迎回来！</Text>
      <Text className="subtitle">登录以继续管理您的智能校园设备</Text>

      <View className="input-group">
        <Input type="text" placeholder="用户名或手机号" />
      </View>

      <View className="input-group">
        <Input type="password" placeholder="密码" />
      </View>

      <View className="link-group">
        <Text className="forgot-password">忘记密码？</Text>
        <Text className="sms-login">手机验证码登录</Text>
      </View>

      <Button className="login-button">登录</Button>

      <View className="register-link">
        <Text>没有账户？</Text>
        <Text className="register-text">立即注册</Text>
      </View>
    </View>
  );
}
