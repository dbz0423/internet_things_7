import { View, Text, Image, Input, Button, Picker } from "@tarojs/components";
import { useState, useEffect } from "react";
import {
  sendCode,
  mobileLogin,
  getUserInfo,
  accountLogin,
  getTenants,
} from "../../service/user";
import { isPhoneAvailable, isCodeAvailable } from "../../utils/validate";
import Taro from "@tarojs/taro";
import { setUserInfo } from "../store/user";
import { useAppDispatch } from "../store";
import "./index.scss";

export default function Login() {
  // 倒计时
  const [count, setCount] = useState(60);
  const [timer, setTimer] = useState(false);
  // 登录表单
  const [form, setForm] = useState<MobileLoginDTO>({
    mobile: "15358154781",
    code: "",
  });
  // 用户名密码表单
  const [usernameForm, setUsernameForm] = useState({
    username: "",
    password: "",
  });

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

  const checkLoginStatus = async () => {
    const user = Taro.getStorageSync("user");
    const token = Taro.getStorageSync("token");

    if (user && token) {
      Taro.showToast({
        title: "自动登录成功",
        icon: "success",
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Taro.switchTab({ url: "/pages/index/index" });
    }
  };

  useEffect(() => {
    checkLoginStatus();
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
  }, [timer]);
  // 发送⼿机验证码
  const sendMobileCode = async () => {
    if (form.mobile && isPhoneAvailable(form.mobile)) {
      setTimer(true);
      const res = await sendCode(form.mobile);
      if (res.code === 0) {
        Taro.showToast({
          title: "验证码发送成功",
          icon: "success",
        });
      } else {
        Taro.showToast({
          title: "验证码发送失败",
          icon: "error",
        });
      }
    } else {
      Taro.showToast({
        title: "请输入正确的手机号",
        icon: "error",
      });
    }
  };

  const handleAccountLogin = async () => {
    if (!usernameForm.username) {
      Taro.showToast({
        title: "请输入用户名",
        icon: "error",
      });
      return;
    }

    if (!usernameForm.password) {
      Taro.showToast({
        title: "请输入密码",
        icon: "error",
      });
      return;
    }

    try {
      const res = await accountLogin({
        username: usernameForm.username,
        password: usernameForm.password,
        tenantId: selectedCampusId,
      });
      if (res.code === 0) {
        Taro.setStorageSync("token", res.data.accessToken);
        getLoginUserInfo();
        Taro.showModal({
          title: "登录成功",
          success: () => {
            Taro.switchTab({
              url: "/pages/index/index",
            });
          },
        });
      } else {
        Taro.showToast({
          title: res.msg || "登录失败",
          icon: "error",
        });
      }
    } catch (error) {
      Taro.showToast({
        title: "登录失败",
        icon: "error",
      });
    }
  };

  const toRegister = async () => {
    Taro.navigateTo({
      url: "/pages/register/index",
    });
  };

  const dispatch = useAppDispatch();
  const getLoginUserInfo = async () => {
    const res = await getUserInfo();
    if (res.code === 0) {
      dispatch(setUserInfo(res.data));
      const newRes = {
        ...res.data,
        tenantName: selectedCampus,
      };
      console.log(newRes);
      Taro.setStorageSync("user", newRes);
    } else {
      Taro.showToast({
        title: res.msg,
        icon: "none",
      });
    }
  };
  // 手机号验证码登录
  const handleLoginClick = async () => {
    // 短信登录逻辑
    if (!form.mobile || !isPhoneAvailable(form.mobile)) {
      Taro.showToast({
        title: "请输⼊正确的⼿机号",
        icon: "none",
      });
      return;
    }
    if (!form.code || !isCodeAvailable(form.code)) {
      Taro.showToast({
        title: "请输⼊正确的验证码",
        icon: "none",
      });
      return;
    }
    const res = await mobileLogin(form);
    if (res.code === 0) {
      Taro.setStorageSync("token", res.data.accessToken);
      getLoginUserInfo();
      Taro.showModal({
        title: "登录成功",
        success: () => {
          Taro.switchTab({
            url: "/pages/index/index",
          });
        },
      });
    } else {
      Taro.showToast({
        title: res.msg,
        icon: "none",
      });
      return;
    }
  };
  const handleInputCode = (e) => {
    setForm({ ...form, code: e.detail.value });
  };
  const handleInputPhone = (e) => {
    setForm({ ...form, mobile: e.detail.value });
  };
  const [activeTab, setActiveTab] = useState("username");

  const [selectedCampus, setSelectedCampus] = useState("");
  const [campuses, setCampuses] = useState([
    { name: "浙江大学", id: "1" },
    { name: "杭州电子科技大学", id: "2" },
    { name: "浙江工业大学", id: "3" },
  ]);
  const [selectedCampusId, setSelectedCampusId] = useState(0);

  const handleForgotPassword = async () => {
    Taro.navigateTo({
      url: "/pages/forget-password/index",
    });
  };

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
              value={usernameForm.username}
              onInput={(e) =>
                setUsernameForm({ ...usernameForm, username: e.detail.value })
              }
            />
          </View>

          <View className="input-group">
            <Input
              type="password"
              placeholder="密码"
              value={usernameForm.password}
              onInput={(e) =>
                setUsernameForm({ ...usernameForm, password: e.detail.value })
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
              onInput={handleInputPhone}
            />
          </View>

          <View className="input-group">
            <Input
              type="text"
              placeholder="验证码"
              value={form.code}
              onInput={handleInputCode}
            />
            <Button onClick={sendMobileCode} disabled={timer}>
              {timer ? `${count}秒后重试` : "获取验证码"}
            </Button>
          </View>
        </>
      )}

      <View className="link-group">
        <Text className="forgot-password" onClick={handleForgotPassword}>
          忘记密码？
        </Text>
        <Text
          className="sms-login"
          onClick={() =>
            setActiveTab(activeTab === "username" ? "mobile" : "username")
          }
        >
          {activeTab === "username" ? "手机验证码登录" : "账号密码登录"}
        </Text>
      </View>

      <Button
        className="login-button"
        onClick={
          activeTab === "username" ? handleAccountLogin : handleLoginClick
        }
      >
        登录
      </Button>

      <View className="login-link">
        <Text>没有账户？</Text>
        <Text className="login-text" onClick={toRegister}>
          立即注册
        </Text>
      </View>
    </View>
  );
}
