/**
 * 平台兼容性工具
 * 处理不同平台间的API差异
 */

/**
 * 检查当前运行环境
 */
export function getPlatform() {
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  
  // #ifdef MP-ALIPAY
  return 'mp-alipay'
  // #endif
  
  // #ifdef MP-BAIDU
  return 'mp-baidu'
  // #endif
  
  // #ifdef MP-TOUTIAO
  return 'mp-toutiao'
  // #endif
  
  // #ifdef H5
  return 'h5'
  // #endif
  
  // #ifdef APP-PLUS
  return 'app-plus'
  // #endif
  
  // #ifdef QUICKAPP
  return 'quickapp'
  // #endif
  
  return 'unknown'
}

/**
 * 检查是否在微信小程序环境
 */
export function isWeixinMiniProgram() {
  return getPlatform() === 'mp-weixin'
}

/**
 * 检查是否在H5环境
 */
export function isH5() {
  return getPlatform() === 'h5'
}

/**
 * 检查是否在App环境
 */
export function isApp() {
  return getPlatform() === 'app-plus'
}

/**
 * 安全地调用微信API
 * @param {Function} callback 回调函数，参数为wx对象
 * @param {Function} fallback 降级处理函数
 */
export function safeWxCall(callback, fallback) {
  try {
    if (typeof wx !== 'undefined' && wx) {
      return callback(wx)
    } else {
      console.warn('当前环境不支持微信API')
      if (fallback) {
        return fallback()
      }
      return null
    }
  } catch (error) {
    console.error('调用微信API失败:', error)
    if (fallback) {
      return fallback()
    }
    return null
  }
}

/**
 * 安全地调用uni API
 * @param {Function} callback 回调函数，参数为uni对象
 * @param {Function} fallback 降级处理函数
 */
export function safeUniCall(callback, fallback) {
  try {
    if (typeof uni !== 'undefined' && uni) {
      return callback(uni)
    } else {
      console.warn('当前环境不支持uni API')
      if (fallback) {
        return fallback()
      }
      return null
    }
  } catch (error) {
    console.error('调用uni API失败:', error)
    if (fallback) {
      return fallback()
    }
    return null
  }
}

/**
 * 云开发初始化（跨平台兼容）
 * @param {Object} config 配置对象
 */
export function initCloud(config = {}) {
  return safeWxCall((wx) => {
    if (wx.cloud) {
      wx.cloud.init({
        env: config.env || 'your-env-id',
        traceUser: config.traceUser !== false
      })
      console.log('云开发初始化成功')
      return true
    } else {
      console.warn('当前微信版本不支持云开发')
      return false
    }
  }, () => {
    console.log('当前环境不支持云开发功能')
    return false
  })
}

/**
 * 获取用户信息（跨平台兼容）
 */
export function getUserInfo() {
  return safeWxCall((wx) => {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo)
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }, () => {
    return Promise.reject(new Error('当前环境不支持获取用户信息'))
  })
}

/**
 * 微信登录（跨平台兼容）
 */
export function wxLogin() {
  return safeWxCall((wx) => {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject(new Error('获取登录凭证失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }, () => {
    return Promise.reject(new Error('当前环境不支持微信登录'))
  })
}

/**
 * 显示Toast（跨平台兼容）
 */
export function showToast(options) {
  return safeUniCall((uni) => {
    showToast(options)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(options.title || '提示')
    }
  })
}

/**
 * 显示Modal（跨平台兼容）
 */
export function showModal(options) {
  return safeUniCall((uni) => {
    showModal(options)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && window.confirm) {
      const result = window.confirm(options.content || '确认操作？')
      if (options.success) {
        options.success({ confirm: result, cancel: !result })
      }
    }
  })
}

/**
 * 页面跳转（跨平台兼容）
 */
export function navigateTo(options) {
  return safeUniCall((uni) => {
    uni.navigateTo(options)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && options.url) {
      window.location.href = options.url
    }
  })
}

/**
 * 页面重定向（跨平台兼容）
 */
export function redirectTo(options) {
  return safeUniCall((uni) => {
    uni.redirectTo(options)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && options.url) {
      window.location.replace(options.url)
    }
  })
}

/**
 * 切换Tab（跨平台兼容）
 */
export function switchTab(options) {
  return safeUniCall((uni) => {
    uni.switchTab(options)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && options.url) {
      window.location.href = options.url
    }
  })
}

/**
 * 返回上一页（跨平台兼容）
 */
export function navigateBack(options = {}) {
  return safeUniCall((uni) => {
    uni.navigateBack(options)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && window.history) {
      window.history.back()
    }
  })
}

/**
 * 重新启动（跨平台兼容）
 */
export function reLaunch(options) {
  return safeUniCall((uni) => {
    uni.reLaunch(options)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && options.url) {
      window.location.href = options.url
    }
  })
}

/**
 * 存储数据（跨平台兼容）
 */
export function setStorageSync(key, data) {
  return safeUniCall((uni) => {
    setStorageSync(key, data)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, JSON.stringify(data))
      } catch (error) {
        console.error('存储数据失败:', error)
      }
    }
  })
}

/**
 * 获取存储数据（跨平台兼容）
 */
export function getStorageSync(key) {
  return safeUniCall((uni) => {
    return getStorageSync(key)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const data = window.localStorage.getItem(key)
        return data ? JSON.parse(data) : null
      } catch (error) {
        console.error('获取存储数据失败:', error)
        return null
      }
    }
    return null
  })
}

/**
 * 移除存储数据（跨平台兼容）
 */
export function removeStorageSync(key) {
  return safeUniCall((uni) => {
    removeStorageSync(key)
  }, () => {
    // H5环境降级处理
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        console.error('移除存储数据失败:', error)
      }
    }
  })
}

export default {
  getPlatform,
  isWeixinMiniProgram,
  isH5,
  isApp,
  safeWxCall,
  safeUniCall,
  initCloud,
  getUserInfo,
  wxLogin,
  showToast,
  showModal,
  navigateTo,
  navigateBack,
  redirectTo,
  switchTab,
  reLaunch,
  setStorageSync,
  getStorageSync,
  removeStorageSync
}
