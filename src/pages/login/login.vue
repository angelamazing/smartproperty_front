<template>
  <view class="login-container">
    <!-- 头部Logo区域 -->
    <view class="header">
      <view class="logo-container">
        <image class="logo-icon" src="/static/logo.png" mode="aspectFit"></image>
        <view class="logo-text">
          <text class="logo-title">湖北地质</text>
          <text class="logo-subtitle">HUBEI GEOLOGY</text>
        </view>
      </view>
      <text class="system-title">智慧物业管理系统</text>
      <text class="system-subtitle">湖北省地质局第三地质大队</text>
    </view>

    <!-- 登录表单区域 -->
    <view class="login-form" v-if="showLoginForm">
      <!-- 微信授权登录 -->
      <view class="login-section">
        <text class="section-title">微信授权登录</text>
        <button 
          class="wechat-login-btn" 
          open-type="get用户信息" 
          @getuserinfo="handleWechatLogin"
          :loading="wechatLoading"
        >
          <text class="btn-icon">🔐</text>
          <text class="btn-text">{{ wechatLoading ? '登录中...' : '微信一键登录' }}</text>
        </button>
        <text class="login-tip">点击按钮授权微信登录</text>
      </view>

      <!-- 手机号密码登录 -->
      <view class="login-section">
        <text class="section-title">手机号密码登录</text>
        <view class="input-group">
          <view class="input-item">
            <text class="input-label">手机号</text>
            <input 
              class="phone-input" 
              type="number" 
              placeholder="请输入手机号" 
              maxlength="11"
              v-model="phoneNumber"
              @input="handlePhoneInput"
            />
          </view>
          <view class="input-item">
            <text class="input-label">密码</text>
            <view class="password-input-group">
              <input 
                class="password-input" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码" 
                v-model="password"
                @input="handlePasswordInput"
              />
              <button 
                class="password-toggle-btn" 
                @click="togglePasswordVisibility"
                type="button"
              >
                <text class="toggle-icon">{{ showPassword ? '👁️' : '🙈' }}</text>
              </button>
            </view>
          </view>
        </view>
        <button 
          class="phone-login-btn" 
          :disabled="!isFormValid || phoneLoading"
          @click="handlePhonePasswordLogin"
          :loading="phoneLoading"
        >
          <text class="btn-icon">🔑</text>
          <text class="btn-text">{{ phoneLoading ? '登录中...' : '手机号登录' }}</text>
        </button>
        <text class="login-tip">输入手机号和密码登录</text>
      </view>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <text class="other-title">其他登录方式</text>
        <view class="other-buttons">
          <button class="other-btn" @click="handleGuestLogin">
            <text class="other-icon">👤</text>
            <text class="other-text">游客访问</text>
          </button>
          <button class="other-btn" @click="handleTestLogin">
            <text class="other-icon">🧪</text>
            <text class="other-text">普通用户测试</text>
          </button>
          <button class="other-btn" @click="handleTestLoginAs管理员">
            <text class="other-icon">👨‍💼</text>
            <text class="other-text">部门管理员测试</text>
          </button>
          <button class="other-btn" @click="handleTestLoginAsSys管理员">
            <text class="other-icon">👑</text>
            <text class="other-text">系统管理员测试</text>
          </button>
          <button class="other-btn" @click="handleHelp">
            <text class="other-icon">❓</text>
            <text class="other-text">帮助中心</text>
          </button>
        </view>
      </view>

      <!-- 部门管理员选择器 -->
      <view class="dept-admin-section" v-if="showDeptSelector">
        <view class="dept-header">
          <text class="section-title">选择部门管理员</text>
          <button class="close-dept-selector" @click="closeDeptSelector">
            <text class="close-icon">✕</text>
          </button>
        </view>
        <text class="section-desc">选择要测试的部门管理员账号</text>
        <view class="dept-grid">
          <button 
            v-for="dept in departments" 
            :key="dept.code"
            class="dept-btn"
            @click="handleSpecificDeptLogin(dept)"
          >
            <text class="dept-icon">🏢</text>
            <text class="dept-name">{{ dept.name }}</text>
            <text class="dept-phone">{{ dept.phone }}</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer-info">
      <text class="footer-text">登录即表示同意</text>
      <text class="footer-link" @click="showPrivacyPolicy">《用户协议》</text>
      <text class="footer-text">和</text>
      <text class="footer-link" @click="showPrivacyPolicy">《隐私政策》</text>
    </view>

    <!-- 加载提示 -->
    <view class="loading-mask" v-if="showLoading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import auth from '@/utils/auth.js'

export default {
  name: 'Login',
  data() {
    return {
      // 微信登录相关
      wechatLoading: false,
      
      // 手机号登录相关
      phoneNumber: '',
      password: '',
      phoneLoading: false,
      showPassword: false, // 确保密码默认隐藏
      
      // 表单验证
      isPhoneValid: false,
      isPasswordValid: false,
      
      // 加载状态
      showLoading: false,
      loadingText: '正在登录...',
      
      // 登录状态管理
      isLoggedIn: false,
      isGuestMode: false,
      current用户: null,
      showLoginForm: true,
      
      // 部门选择器
      showDeptSelector: false,
      departments: [
        { code: 'GEO_DATA', name: '地质数据中心', phone: '13800001001' },
        { code: 'GEO_ENG', name: '地质工程中心', phone: '13800001002' },
        { code: 'ECO_ENV', name: '生态环境中心', phone: '13800001003' },
        { code: 'GEO_ENV', name: '地质环境中心', phone: '13800001004' },
        { code: 'GEO_SURVEY', name: '地质调查中心', phone: '13800001005' },
        { code: 'HUANGMEI', name: '黄梅分站', phone: '13800001006' },
        { code: 'MINING_CO', name: '矿业有限责任公司', phone: '13800001007' },
        { code: 'PROPERTY', name: '物业中心', phone: '13800001008' },
        { code: 'ADMIN', name: '机关科室', phone: '13800001009' },
        { code: 'TECH', name: 'Technology 部门', phone: '13800000001' }
      ]
    }
  },
  
  computed: {
    isFormValid() {
      return this.isPhoneValid && this.isPasswordValid
    }
  },
  
  onLoad() {
    // 页面加载时检查登录状态
    this.checkLoginStatus()
  },
  
  onUnload() {
    // 页面卸载时清除定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },
  
  methods: {
    /**
     * 检查登录状态
     */
    checkLoginStatus() {
      try {
        const token = uni.getStorageSync('userToken')
        const userInfo = uni.getStorageSync('userInfo')
        
        if (token && userInfo) {
          // 验证token有效性
          this.validateToken(token)
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
      }
    },
    
    /**
     * 验证token有效性
     */
    async validateToken(token) {
      try {
        // 调用REST API验证token
        const result = await api.auth.validateToken(token)
        
        if (result && result.success && result.data.isValid) {
          // token有效，跳转到首页
          this.current用户 = result.data.userInfo
          this.isLoggedIn = true
          this.navigateToHome()
        }
      } catch (error) {
        console.error('验证token失败:', error)
        // 清除无效的登录信息
        this.clearLogin信息()
      }
    },
    
    /**
     * 微信授权登录
     */
    async handleWechatLogin(e) {
      if (e.detail.errMsg !== 'get用户信息:ok') {
        uni.showToast({
          title: '用户取消授权',
          icon: 'none'
        })
        return
      }
      
      this.wechatLoading = true
      this.showLoading = true
      this.loadingText = '正在获取用户信息...'
      
      try {
        // 获取用户信息
        const userInfo = e.detail.userInfo
        
        // 获取微信登录凭证
        const loginResult = await uni.login()
        
        if (loginResult.code) {
          // 调用REST API进行微信登录
          const result = await api.auth.wechatLogin(loginResult.code, userInfo)
          
          if (result && result.success) {
            // 保存登录信息
            this.saveLoginInfo(result.data)
            
            // 显示登录成功信息
            this.showLoginSuccessInfo(result.data.userInfo)
          } else {
            throw new Error(result.message || '登录失败')
          }
        } else {
          throw new Error('获取微信登录凭证失败')
        }
      } catch (error) {
        console.error('微信登录失败:', error)
        
        // 根据错误类型显示不同的提示信息
        let errorMessage = '微信登录失败，请重试'
        
        if (error.message) {
          if (error.message.includes('授权') || error.message.includes('authorize')) {
            errorMessage = '微信授权失败，请重新授权'
          } else if (error.message.includes('网络') || error.message.includes('timeout')) {
            errorMessage = '网络连接失败，请检查网络后重试'
          } else if (error.message.includes('用户') || error.message.includes('user')) {
            errorMessage = '用户信息获取失败，请重试'
          } else {
            errorMessage = error.message
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.wechatLoading = false
        this.showLoading = false
      }
    },
    
    /**
     * 手机号输入处理
     */
    handlePhoneInput(e) {
      this.phoneNumber = e.detail.value
      this.validatePhone()
    },
    
    /**
     * 密码输入处理
     */
    handlePasswordInput(e) {
      this.password = e.detail.value
      this.validatePassword()
    },
    
    /**
     * 验证手机号格式
     */
    validatePhone() {
      const phoneRegex = /^1[3-9]\d{9}$/
      this.isPhoneValid = phoneRegex.test(this.phoneNumber)
    },
    
    /**
     * 验证密码格式
     */
    validatePassword() {
      // 密码长度6-20位
      this.isPasswordValid = this.password.length >= 6 && this.password.length <= 20
    },
    
    /**
     * 切换密码显示状态
     */
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    
    /**
     * 手机号密码登录
     */
    async handlePhonePasswordLogin() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请完善登录信息',
          icon: 'none'
        })
        return
      }
      
      this.phoneLoading = true
      this.showLoading = true
      this.loadingText = '正在验证登录信息...'
      
      try {
        // 调用REST API进行手机号密码登录
        const result = await api.auth.phonePasswordLogin(this.phoneNumber, this.password)
        
        if (result && result.success) {
          // 保存登录信息
          this.saveLoginInfo(result.data)
          
          // 显示登录成功信息
          this.showLoginSuccessInfo(result.data.userInfo)
        } else {
          throw new Error(result.message || '登录失败')
        }
      } catch (error) {
        console.error('手机号登录失败:', error)
        
        // 根据错误类型显示不同的提示信息
        let errorMessage = '登录失败，请重试'
        
        if (error.message) {
          if (error.message.includes('密码') || error.message.includes('password')) {
            errorMessage = '密码错误，请重新输入'
          } else if (error.message.includes('手机号') || error.message.includes('phone')) {
            errorMessage = '手机号不存在，请检查后重试'
          } else if (error.message.includes('用户') || error.message.includes('user')) {
            errorMessage = '用户不存在，请检查手机号'
          } else if (error.message.includes('网络') || error.message.includes('timeout')) {
            errorMessage = '网络连接失败，请检查网络后重试'
          } else {
            errorMessage = error.message
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.phoneLoading = false
        this.showLoading = false
      }
    },
    
    /**
     * 游客访问
     */
    handleGuestLogin() {
      uni.showModal({
        title: '游客访问',
        content: '游客模式功能受限，建议登录后使用完整功能',
        confirmText: '继续访问',
        cancelText: '去登录',
        success: (res) => {
          if (res.confirm) {
            // 设置游客模式标识
            uni.setStorageSync('isGuest', true)
            
            // 游客模式也跳转到首页，但功能受限
            this.navigateToHome()
          }
        }
      })
    },
    
    /**
     * 普通用户测试登录
     */
    handleTestLogin() {
      uni.showModal({
        title: '普通用户测试登录',
        content: '将使用普通用户测试账号直接登录系统，用于功能测试',
        confirmText: '普通用户测试登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.performTestLogin()
          }
        }
      })
    },

    /**
     * 部门管理员测试登录
     */
    handleTestLoginAs管理员() {
      // 显示部门选择器
      this.showDeptSelector = true
    },

    /**
     * 系统管理员测试登录
     */
    handleTestLoginAsSys管理员() {
      uni.showModal({
        title: '系统管理员测试登录',
        content: '将使用系统管理员测试账号登录系统，可以测试所有管理功能',
        confirmText: '系统管理员测试登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.performTestLoginAsSysAdmin()
          }
        }
      })
    },

    async performTestLoginAs管理员() {
      this.showLoading = true
      this.loadingText = '正在测试登录（部门管理员）...'

      try {
        // 调用REST API部门管理员测试登录，使用文档中指定的手机号
        const result = await api.auth.testLoginDeptAdmin('13800001001')

        if (result && result.success) {
          // 保存测试登录信息
          this.saveLoginInfo(result.data)

          // 显示测试登录成功提示
          uni.showToast({
            title: '部门管理员测试登录成功',
            icon: 'success',
            duration: 3000
          })

          // 更新页面状态，显示登录成功信息
          this.showLoginSuccessInfo(result.data.userInfo)

        } else {
          throw new Error(result.message || '部门管理员测试登录失败')
        }

      } catch (error) {
        console.error('部门管理员测试登录失败:', error)
        uni.showModal({
          title: '登录失败',
          content: error.message || '部门管理员测试登录失败，请重试',
          show取消: false
        })
      } finally {
        this.showLoading = false
      }
    },

    /**
     * 系统管理员测试登录
     */
    async performTestLoginAsSysAdmin() {
      this.showLoading = true
      this.loadingText = '正在测试登录（系统管理员）...'

      try {
        // 调用系统管理员测试登录API
        const result = await api.auth.testLoginSysAdmin()

        if (result && result.success) {
          // 保存测试登录信息
          this.saveLoginInfo(result.data)

          // 显示测试登录成功提示
          uni.showToast({
            title: '系统管理员测试登录成功',
            icon: 'success',
            duration: 3000
          })

          // 更新页面状态，显示登录成功信息
          this.showLoginSuccessInfo(result.data.userInfo)

        } else {
          throw new Error(result.message || '系统管理员测试登录失败')
        }

      } catch (error) {
        console.error('系统管理员测试登录失败:', error)
        this.handleLoginError(error, '系统管理员测试登录失败')
      } finally {
        this.showLoading = false
      }
    },

    /**
     * 指定部门管理员登录
     */
    async handleSpecificDeptLogin(dept) {
      this.showLoading = true
      this.loadingText = `正在登录${dept.name}管理员...`

      try {
        // 调用指定部门管理员测试登录API
        const result = await api.auth.testLoginSpecificDeptAdmin(dept.code)

        if (result && result.success) {
          // 保存登录信息
          this.saveLoginInfo(result.data)

          // 显示登录成功信息
          uni.showToast({
            title: `${dept.name}管理员登录成功`,
            icon: 'success',
            duration: 3000
          })

          // 关闭部门选择器
          this.showDeptSelector = false

          // 显示登录成功信息并跳转
          this.showLoginSuccessInfo(result.data.userInfo)
        } else {
          throw new Error(result.message || '部门管理员登录失败')
        }
      } catch (error) {
        console.error('部门管理员登录失败:', error)
        uni.showModal({
          title: '登录失败',
          content: error.message || '部门管理员登录失败，请重试',
          show取消: false
        })
      } finally {
        this.showLoading = false
      }
    },

    /**
     * 关闭部门选择器
     */
    closeDeptSelector() {
      this.showDeptSelector = false
    },

    /**
     * 执行测试登录
     */
    async performTestLogin() {
      this.showLoading = true
      this.loadingText = '正在测试登录...'
      
      try {
        // 调用普通用户测试登录API
        const result = await api.auth.testLoginUser()

        if (result && result.success) {
          // 保存测试登录信息
          this.saveLoginInfo(result.data)

          // 显示测试登录成功提示
          uni.showToast({
            title: '普通用户测试登录成功',
            icon: 'success',
            duration: 3000
          })

          // 更新页面状态，显示登录成功信息
          this.showLoginSuccessInfo(result.data.userInfo)

        } else {
          throw new Error(result.message || '测试登录失败')
        }

      } catch (error) {
        console.error('测试登录失败:', error)
        
        // 如果API调用失败，使用本地测试数据作为备选方案
        try {
          const localTestData = {
            token: 'test_token_' + Date.now(),
            userInfo: {
              _id: 'test_user_id',
              openid: 'test_openid',
              nickName: '测试用户',
              avatarUrl: '/static/logo.png',
              role: 'user',
              department: '测试部门',
              phoneNumber: '13800138000',
              email: 'test@example.com',
              createTime: new Date(),
              lastLoginTime: new Date()
            }
          }
          
          this.saveLoginInfo(localTestData)
          
          uni.showToast({
            title: '本地测试登录成功',
            icon: 'success',
            duration: 3000
          })
          
          // 更新页面状态，显示登录成功信息
          this.showLoginSuccessInfo(localTestData.userInfo)
          
        } catch (local错误) {
          console.error('本地测试登录也失败:', local错误)
          uni.showToast({
            title: '测试登录失败，请重试',
            icon: 'none'
          })
        }
      } finally {
        this.showLoading = false
      }
    },
    
    /**
     * 显示登录成功信息
     */
    showLoginSuccessInfo(userInfo) {
      // 更新页面数据，显示用户信息
      this.current用户 = userInfo
      this.isLoggedIn = true
      
      // 跳转到首页
      this.navigateToHome()
    },
    
    /**
     * 帮助中心
     */
    handleHelp() {
      // 跳转到帮助页面（如果存在）或显示提示
      uni.showToast({
        title: '帮助中心功能开发中',
        icon: 'none'
      })
    },
    
    /**
     * 显示隐私政策
     */
    showPrivacyPolicy() {
      // 显示隐私政策弹窗
      uni.showModal({
        title: '隐私政策',
        content: '我们承诺保护您的个人隐私信息，不会向第三方泄露您的个人信息。',
        show取消: false,
        confirmText: '我知道了'
      })
    },
    
    /**
     * 保存登录信息
     */
    saveLoginInfo(loginData) {
      try {
        // 使用auth工具类保存登录信息
        auth.saveLoginInfo(loginData)
        
        // 显示登录成功提示
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('保存登录信息失败:', error)
      }
    },
    
    /**
     * 清除登录信息
     */
    clearLogin信息() {
      try {
        // 使用auth工具类清除登录信息
        auth.clearLogin信息()
      } catch (error) {
        console.error('清除登录信息失败:', error)
      }
    },
    
    /**
     * 跳转到首页
     */
    navigateToHome() {
      // 使用 switchTab 跳转到 tabBar 页面
      uni.switchTab({
        url: '/pages/index/index',
        success: () => {
          console.log('跳转首页成功')
        },
        fail: (error) => {
          console.error('跳转首页失败:', error)
          // 如果跳转失败，显示错误提示
          uni.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 严格按照form/index.html模板的样式设计 */

.login-container {
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 头部 - 严格按照模板的渐变背景和布局 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  text-align: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.logo-icon {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.logo-text {
  text-align: left;
}

.logo-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
}

.logo-subtitle {
  display: block;
  font-size: 12px;
  opacity: 0.9;
  color: #fff;
}

.system-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.system-subtitle {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  color: #fff;
}

/* 登录表单区域 - 使用模板的卡片样式 */
.login-form {
  background: white;
  margin: 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 40px;
}

.login-section {
  margin-bottom: 30px;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

/* 微信登录按钮 - 使用模板的渐变样式 */
.wechat-login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.wechat-login-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.btn-icon {
  margin-right: 8px;
  font-size: 18px;
}

.btn-text {
  font-size: 16px;
}

/* 输入框组 - 使用模板的样式 */
.input-group {
  margin-bottom: 20px;
}

.input-item {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.phone-input {
  width: 100%;
  height: 44px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.phone-input:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.password-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.password-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.password-input:focus {
  border-color: #667eea;
  background: #fff;
  outline: none;
}

.password-toggle-btn {
  width: 44px;
  height: 44px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  color: #666;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.password-toggle-btn:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.password-toggle-btn:active {
  transform: scale(0.95);
}

.toggle-icon {
  font-size: 16px;
}

/* 手机号登录按钮 - 使用模板的渐变样式 */
.phone-login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.phone-login-btn:disabled {
  background: #ccc;
  color: #999;
  box-shadow: none;
}

.phone-login-btn:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.login-tip {
  display: block;
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* 其他登录方式 - 使用模板的网格布局 */
.other-login {
  margin-top: 30px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-top: 2px solid #f0f0f0;
}

.other-title {
  display: block;
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
}

.other-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.other-btn {
  height: 60px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  color: #666;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
}

.other-btn:active {
  transform: scale(0.98);
  background: #f8f9fa;
  border-color: #667eea;
}

.other-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.other-text {
  font-size: 12px;
}

/* 底部信息 */
.footer-info {
  text-align: center;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.footer-text {
  font-size: 12px;
  color: #666;
}

.footer-link {
  font-size: 12px;
  color: #667eea;
  text-decoration: underline;
  margin: 0 4px;
}

/* 加载遮罩 - 使用模板的样式 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #333;
}

/* 部门选择器样式 */
.dept-admin-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.dept-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-desc {
  display: block;
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
}

.dept-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.dept-btn {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dept-btn:active {
  transform: scale(0.98);
  background: #f8f9fa;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.dept-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 8px;
}

.dept-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.2;
}

.dept-phone {
  display: block;
  font-size: 12px;
  color: #666;
}

.close-dept-selector {
  width: 32px;
  height: 32px;
  background: #6c757d;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.close-dept-selector:active {
  transform: scale(0.95);
  background: #5a6268;
}

.close-icon {
  font-size: 16px;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .header {
    padding: 15px;
  }
  
  .login-form {
    margin: 15px;
    padding: 15px;
  }
  
  .system-title {
    font-size: 16px;
  }
  
  .logo-icon {
    width: 50px;
    height: 50px;
  }
  
  .other-buttons {
    gap: 10px;
  }
  
  .other-btn {
    height: 50px;
  }
  
  .dept-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .dept-btn {
    padding: 12px 8px;
  }
  
  .dept-name {
    font-size: 13px;
  }
  
  .dept-phone {
    font-size: 11px;
  }
}
</style>
