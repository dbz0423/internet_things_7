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
import { sendCode, register, getTenants } from "../../service/user";
import { isPhoneAvailable, isCodeAvailable } from "../../utils/validate";
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
  const [activeTab, setActiveTab] = useState("username");

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

  const sendMobileCode = async () => {
    if (form.mobile && isPhoneAvailable(form.mobile)) {
      setTimer(true);
      const res = await sendCode(form.mobile);
      if (res.code === 0) {
        Taro.showToast({ title: "验证码发送成功", icon: "success" });
      } else {
        Taro.showToast({ title: "验证码发送失败", icon: "error" });
      }
    } else {
      Taro.showToast({ title: "请输入正确的手机号", icon: "error" });
    }
  };

  const toLogin = async () => {
    Taro.navigateTo({
      url: "/pages/login/index",
    });
  };

  const handleRegister = async () => {
    if (activeTab === "username") {
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
    } else {
      if (!form.mobile || !isPhoneAvailable(form.mobile)) {
        Taro.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (!form.code || !isCodeAvailable(form.code)) {
        Taro.showToast({ title: "请输入正确的验证码", icon: "none" });
        return;
      }
    }
    console.log("注册表单", form, "注册类型", activeTab);

    try {
      const newForm = { ...form, tenantId: selectedCampusId };
      const res = await register(newForm);
      console.log("结果", res.code + res.msg + res.data);

      if (res.code === 0) {
        Taro.showModal({
          title: "注册成功",
          content: "请登录您的账号",
          success: () => {
            Taro.navigateTo({ url: "/pages/login/index" });
          },
        });
      } else {
        Taro.showToast({ title: res.msg || "注册失败", icon: "none" });
      }
    } catch (error) {
      Taro.showToast({ title: "注册失败", icon: "none" });
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
      <Text className="title">创建账户</Text>
      <Text className="subtitle">加入智慧校园管理系统</Text>

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

      {activeTab === "username" ? (
        <>
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
              onInput={(e) =>
                setForm({ ...form, confirmPassword: e.detail.value })
              }
            />
          </View>
        </>
      ) : (
        <>
          <View className="input-group">
            <Input
              type="text"
              placeholder="手机号"
              value={form.mobile}
              onInput={(e) => setForm({ ...form, mobile: e.detail.value })}
            />
          </View>

          <View className="input-group">
            <Input
              type="text"
              placeholder="验证码"
              value={form.code}
              onInput={(e) => setForm({ ...form, code: e.detail.value })}
            />
            <Button
              className="code-button"
              onClick={sendMobileCode}
              disabled={timer}
            >
              {timer ? `${count}秒` : "获取验证码"}
            </Button>
          </View>
        </>
      )}

      <View className="link-group">
        <Text
          onClick={() =>
            setActiveTab(activeTab === "username" ? "mobile" : "username")
          }
        >
          {activeTab === "username" ? "手机号注册" : "用户名注册"}
        </Text>
      </View>

      <Button className="register-button" onClick={handleRegister}>
        注册
      </Button>

      <View className="register-link">
        <Text>已有账户？</Text>
        <Text className="register-text" onClick={toLogin}>
          立即登录
        </Text>
      </View>
    </View>
  );
}
