import { View, Text, Navigator } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import { useState } from 'react' // 新增导入 useState
import Taro from '@tarojs/taro' // 新增解构导入 useState
import './index.scss'

export default function LoginPage() {
  // 直接使用解构出的 useState
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View className="login-container">
      {/* 标题 */}
      <View className="header">
        <Text className="title">欢迎回来！</Text>
        <Text className="subtitle">登录以继续管理您的智能校园设备</Text>
      </View>

      {/* 表单区域 */}
      <View className="form-wrapper">
        <AtInput
          name="username"
          title=""
          type="text"
          placeholder="用户名或手机号"
          value={username}
          onChange={(value) => setUsername(value.toString())}
        />

        <AtInput
          name="password"
          title=""
          type="password"
          placeholder="密码"
          value={password}
          onChange={(value) => setPassword(value.toString())}
          className="password-input"
        />

        {/* 辅助操作 */}
        <View className="action-row">
          <Navigator url="/pages/forgot-password" className="link">
            忘记密码？
          </Navigator>
          <Navigator url="/pages/sms-login" className="link">
            手机验证码登录
          </Navigator>
        </View>

        {/* 登录按钮 */}
        <AtButton
          type="primary"
          className="login-btn"
          onClick={async () => {
            // 简单验证：用户名和密码非空
            if (!username || !password) {
              Taro.showToast({ title: '请填写用户名和密码', icon: 'none' })
              return
            }
            // 模拟 API 请求（实际需替换为真实接口）
            try {
              const res = await Taro.request({
                url: 'https://api.example.com/login',
                method: 'POST',
                data: { username, password },
              })
              if (res.data.code === 200) {
                Taro.showToast({ title: '登录成功' })
                // 跳转至首页或其他目标页
                Taro.navigateTo({ url: '/pages/index/index' })
              } else {
                Taro.showToast({
                  title: res.data.msg || '登录失败',
                  icon: 'none',
                })
              }
            } catch (error) {
              Taro.showToast({ title: '网络请求失败', icon: 'none' })
            }
          }}
        >
          登录
        </AtButton>

        {/* 注册提示 */}
        <View className="register-row">
          <Text>没有账户？</Text>
          <Navigator url="/pages/register" className="register-link">
            立即注册
          </Navigator>
        </View>
      </View>
    </View>
  )
}
