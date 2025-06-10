import {
  View,
  Text,
  Button,
  Input,
  Navigator,
  Picker,
} from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { forgetPassword, getTenants } from "../../service/user";
import "./index.scss";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    code: "",
    accessToken: "",
  });
  const [count, setCount] = useState(60);
  const [timer, setTimer] = useState(false);

  const initTenant = async () => {
    const res = await getTenants();
    if (res.code === 0) {
      setCampuses(res.data);
    } else {
      Taro.showToast({
        title: res.msg,
        icon: "none",
      });
    }
  };

  useEffect(() => {
    initTenant();
    let interval;
    if (timer) {
      interval = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount === 1) {
            clearInterval(interval);
            setTimer(false);
            return 60;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleRegister = async () => {
    if (!form.username || form.username.length < 4) {
      Taro.showToast({ title: "用户名至少4位", icon: "none" });
      return;
    }
    if (!form.password || form.password.length < 6) {
      Taro.showToast({ title: "密码至少6位", icon: "none" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      Taro.showToast({ title: "两次密码不一致", icon: "none" });
      return;
    }

    console.log("找回表单", form);

    try {
      const newForm = { ...form, tenantId: selectedCampusId };
      const res = await forgetPassword(newForm);
      console.log("找回结果", res.code + res.msg + res.data);

      if (res.code === 0) {
        Taro.showModal({
          title: "密码找回成功",
          content: "请登录您的账号",
          success: () => {
            Taro.navigateTo({ url: "/pages/login/index" });
          },
        });
      } else {
        Taro.showToast({ title: res.msg || "找回失败", icon: "none" });
      }
    } catch (error) {
      console.log("找回失败", error);

      Taro.showToast({ title: "找回失败", icon: "none" });
    }
  };
  const [selectedCampus, setSelectedCampus] = useState("");
  const [campuses, setCampuses] = useState([
    { name: "浙江大学", id: "1" },
    { name: "杭州电子科技大学", id: "2" },
    { name: "浙江工业大学", id: "3" },
  ]);
  const [selectedCampusId, setSelectedCampusId] = useState(0);
  return (
    <View className="register-container">
      <Text className="title">找回密码</Text>
      <Text className="subtitle">
        输入用户名和密码以重新进入智慧校园管理系统
      </Text>

      <View className="input-group campus-selector">
        <Picker
          mode="selector"
          range={campuses}
          rangeKey="name"
          onChange={(e) => {
            const index = e.detail.value;
            setSelectedCampus(campuses[index].name);
            setSelectedCampusId(campuses[index].id);
          }}
        >
          <View className="picker">{selectedCampus || "请选择所在学校"}</View>
        </Picker>
      </View>

      <View className="input-group">
        <Input
          type="text"
          placeholder="用户名"
          value={form.username}
          onInput={(e) => setForm({ ...form, username: e.detail.value })}
        />
      </View>

      <View className="input-group">
        <Input
          type="password"
          placeholder="密码"
          value={form.password}
          onInput={(e) => setForm({ ...form, password: e.detail.value })}
        />
      </View>

      <View className="input-group">
        <Input
          type="password"
          placeholder="确认密码"
          value={form.confirmPassword}
          onInput={(e) => setForm({ ...form, confirmPassword: e.detail.value })}
        />
      </View>

      <Button className="register-button" onClick={handleRegister}>
        找回密码
      </Button>
    </View>
  );
}
