/**
 * 认证工具类
 * 管理用户登录状态、token验证、权限检查等功能
 */

import api from '@/utils/api.js'

class Auth {
  constructor() {
    this.tokenKey = 'userToken'
    this.userInfoKey = 'userInfo'
    this.isGuestKey = 'isGuest'
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    try {
      const token = uni.getStorageSync(this.tokenKey)
      const userInfo = uni.getStorageSync(this.userInfoKey)
      return !!(token && userInfo)
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  }

  /**
   * 检查是否为游客模式
   * @returns {boolean} 是否为游客
   */
  isGuest() {
    try {
      return uni.getStorageSync(this.isGuestKey) === true
    } catch (error) {
      console.error('检查游客状态失败:', error)
      return false
    }
  }

  /**
   * 获取用户token
   * @returns {string|null} 用户token
   */
  getToken() {
    try {
      return uni.getStorageSync(this.tokenKey)
    } catch (error) {
      console.error('获取token失败:', error)
      return null
    }
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  getUserInfo() {
    try {
      return uni.getStorageSync(this.userInfoKey)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 保存登录信息
   * @param {Object} loginData 登录数据
   * @param {string} loginData.token 用户token
   * @param {Object} loginData.userInfo 用户信息
   */
  saveLoginInfo(loginData) {
    try {
      const { token, userInfo } = loginData
      
      if (token) {
        uni.setStorageSync(this.tokenKey, token)
      }
      
      if (userInfo) {
        uni.setStorageSync(this.userInfoKey, userInfo)
      }
      
      // 清除游客标识
      uni.removeStorageSync(this.isGuestKey)
      
      console.log('登录信息保存成功')
    } catch (error) {
      console.error('保存登录信息失败:', error)
      throw error
    }
  }

  /**
   * 清除登录信息
   */
  clearLoginInfo() {
    try {
      uni.removeStorageSync(this.tokenKey)
      uni.removeStorageSync(this.userInfoKey)
      uni.removeStorageSync(this.isGuestKey)
      
      console.log('登录信息清除成功')
    } catch (error) {
      console.error('清除登录信息失败:', error)
      throw error
    }
  }

  /**
   * 设置游客模式
   */
  setGuestMode() {
    try {
      uni.setStorageSync(this.isGuestKey, true)
      console.log('游客模式设置成功')
    } catch (error) {
      console.error('设置游客模式失败:', error)
      throw error
    }
  }

  /**
   * 验证token有效性
   * @returns {Promise<boolean>} token是否有效
   */
  async validateToken() {
    try {
      const token = this.getToken()
      
      if (!token) {
        return false
      }

      // 使用REST API验证token
      const result = await api.auth.validateToken(token)

      if (result && result.success && result.data.isValid) {
        // 更新用户信息
        if (result.data.userInfo) {
          uni.setStorageSync(this.userInfoKey, result.data.userInfo)
        }
        return true
      } else {
        // token无效，清除登录信息
        this.clearLoginInfo()
        return false
      }
    } catch (error) {
      console.error('验证token失败:', error)
      // 验证失败，清除登录信息
      this.clearLoginInfo()
      return false
    }
  }

  /**
   * 检查用户权限
   * @param {string} requiredRole 所需角色
   * @returns {boolean} 是否有权限
   */
  hasPermission(requiredRole) {
    try {
      const userInfo = this.getUserInfo()
      
      if (!userInfo || !userInfo.role) {
        return false
      }

      // 角色权限等级
      const roleLevels = {
        'user': 1,
        'dept_admin': 2,
        'sys_admin': 3,
        'verifier': 2
      }

      const userLevel = roleLevels[userInfo.role] || 0
      const requiredLevel = roleLevels[requiredRole] || 0

      return userLevel >= requiredLevel
    } catch (error) {
      console.error('检查权限失败:', error)
      return false
    }
  }

  /**
   * 获取用户角色
   * @returns {string} 用户角色
   */
  getUserRole() {
    try {
      const userInfo = this.getUserInfo()
      return userInfo ? userInfo.role : 'guest'
    } catch (error) {
      console.error('获取用户角色失败:', error)
      return 'guest'
    }
  }

  /**
   * 检查是否为管理员
   * @returns {boolean} 是否为管理员
   */
  isAdmin() {
    return this.hasPermission('sys_admin')
  }

  /**
   * 检查是否为部门管理员
   * @returns {boolean} 是否为部门管理员
   */
  isDeptAdmin() {
    return this.hasPermission('dept_admin')
  }

  /**
   * 检查是否为验证员
   * @returns {boolean} 是否为验证员
   */
  isVerifier() {
    return this.hasPermission('verifier')
  }

  /**
   * 自动登录检查
   * 在应用启动时调用，检查登录状态并自动跳转
   */
  async autoLoginCheck() {
    try {
      if (this.isLoggedIn()) {
        // 验证token有效性
        const isValid = await this.validateToken()
        if (isValid) {
          // token有效，跳转到首页
          this.redirectToHome()
          return true
        }
      }
      
      // 未登录或token无效，跳转到登录页
      this.redirectToLogin()
      return false
    } catch (error) {
      console.error('自动登录检查失败:', error)
      this.redirectToLogin()
      return false
    }
  }

  /**
   * 跳转到首页
   */
  redirectToHome() {
    try {
      uni.switchTab({
        url: '/pages/index/index'
      })
    } catch (error) {
      console.error('跳转首页失败:', error)
    }
  }

  /**
   * 跳转到登录页
   */
  redirectToLogin() {
    try {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    } catch (error) {
      console.error('跳转登录页失败:', error)
    }
  }

  /**
   * 登出
   */
  async logout() {
    try {
      console.log('开始登出流程...')
      console.log('api对象:', api)
      
      // 调用后端登出接口
      try {
        console.log('调用后端登出接口...')
        await api.auth.logout()
        console.log('后端登出成功')
      } catch (error) {
        console.log('后端登出失败，继续本地登出:', error)
      }
      
      // 清除本地登录信息
      console.log('清除本地登录信息...')
      this.clearLoginInfo()
      this.redirectToLogin()
      
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })
    } catch (error) {
      console.error('登出失败:', error)
      console.error('错误堆栈:', error.stack)
    }
  }
}

// 创建单例实例
const auth = new Auth()

export default auth
