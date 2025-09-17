/**
 * API服务封装
 * 统一管理所有REST API调用
 */

// URLSearchParams兼容性工具函数（微信小程序不支持URLSearchParams）
function buildQueryString(params) {
  if (typeof URLSearchParams !== 'undefined') {
    return new URLSearchParams(params).toString()
  }
  
  // 微信小程序兼容方案
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

// API配置
const API_CONFIG = {
  // 生产环境地址
  PROD_BASE_URL: 'https://uauotggfeiao.sealosbja.site',
  // 开发环境地址
  DEV_BASE_URL: 'http://localhost:3000',
  // 请求超时时间
  TIMEOUT: 10000
}

// 获取当前环境的基础URL
function getBaseUrl() {
  // 根据构建环境或运行时环境判断
  // 开发环境：使用开发服务器地址
  // 生产环境：使用生产服务器地址

  // 方法1：通过环境变量判断（推荐）
  // 检查是否为开发环境
  const isDev = process.env.NODE_ENV === 'development'

  // 方法2：通过 uni-app 的条件编译判断
  // #ifdef MP-WEIXIN || MP-ALIPAY
  //   return API_CONFIG.PROD_BASE_URL // 小程序使用生产环境
  // #endif

  // 方法3：通过构建模式判断
  // 如果是开发模式，使用开发服务器
  if (isDev) {
    console.log('当前为开发环境，使用本地开发服务器:', API_CONFIG.DEV_BASE_URL)
    return API_CONFIG.DEV_BASE_URL
  }

  // 默认使用生产环境
  console.log('当前为生产环境，使用生产服务器:', API_CONFIG.PROD_BASE_URL)
  return API_CONFIG.PROD_BASE_URL
}

/**
 * 通用请求方法
 * @param {Object} options 请求配置
 * @param {string} options.url 请求路径
 * @param {string} options.method 请求方法
 * @param {Object} options.data 请求数据
 * @param {Object} options.header 请求头
 * @param {boolean} options.needAuth 是否需要认证
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 构建完整URL
    const fullUrl = getBaseUrl() + options.url
    
    // 构建请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    // 如果需要认证，添加Token
    if (options.needAuth !== false) {
      const token = uni.getStorageSync('userToken')
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }
    }
    
    // 发起请求
    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data,
      header: header,
      timeout: API_CONFIG.TIMEOUT,
      success: (res) => {
        console.log(`API请求成功 ${options.method || 'GET'} ${options.url}:`, res.data)
        
        // 检查HTTP状态码
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // 检查是否是登录请求，如果是则返回具体错误信息
          if (options.url.includes('/api/auth/')) {
            // 登录相关请求，返回后端的具体错误信息
            const errorData = res.data || {}
            const error = new Error(errorData.message || '用户名或密码错误')
            error.response = { data: errorData, status: res.statusCode }
            reject(error)
          } else {
            // 其他请求的401错误，认为是Token过期
            handleAuthError()
            reject(new Error('登录已过期，请重新登录'))
          }
        } else if (res.statusCode === 403) {
          reject(new Error('权限不足'))
        } else if (res.statusCode === 404) {
          // 404错误：返回后端的具体错误信息
          const errorData = res.data || {}
          const error = new Error(errorData.message || '请求的资源不存在')
          error.response = { data: errorData, status: res.statusCode }
          reject(error)
        } else if (res.statusCode === 429) {
          reject(new Error('请求过于频繁，请稍后再试'))
        } else {
          // 其他错误：返回后端的具体错误信息
          const errorData = res.data || {}
          const error = new Error(errorData.message || '请求失败')
          error.response = { data: errorData, status: res.statusCode }
          reject(error)
        }
      },
      fail: (error) => {
        console.error(`API请求失败 ${options.method || 'GET'} ${options.url}:`, error)
        
        // 网络错误处理
        if (error.errMsg && error.errMsg.includes('timeout')) {
          reject(new Error('请求超时，请检查网络连接'))
        } else if (error.errMsg && error.errMsg.includes('fail')) {
          reject(new Error('网络连接失败，请检查网络设置'))
        } else {
          reject(new Error(error.errMsg || '网络请求失败'))
        }
      }
    })
  })
}

/**
 * 处理认证错误
 */
function handleAuthError() {
  // 清除本地存储的认证信息
  try {
    uni.removeStorageSync('userToken')
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('isGuest')
  } catch (e) {
    console.error('清除本地存储失败:', e)
  }
  
  // 显示提示
  uni.showToast({
    title: '登录已过期',
    icon: 'none'
  })
  
  // 跳转到登录页
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }, 1500)
}

// API服务对象
const api = {
  // GET请求
  get: (url, data = {}, options = {}) => {
    const queryString = Object.keys(data).length > 0 
      ? '?' + Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&')
      : ''
    
    return request({
      url: url + queryString,
      method: 'GET',
      ...options
    })
  },
  
  // POST请求
  post: (url, data = {}, options = {}) => {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    })
  },
  
  // PUT请求
  put: (url, data = {}, options = {}) => {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },
  
  // DELETE请求
  delete: (url, data = {}, options = {}) => {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  },

  // 上传文件
  upload: (url, filePath) => {
    return new Promise((resolve, reject) => {
      // 获取存储的token
      const token = uni.getStorageSync('userToken')
      if (!token) {
        reject(new Error('未找到访问令牌，请重新登录'))
        return
      }

      console.log('开始上传文件:', {
        url: getBaseUrl() + url,
        filePath: filePath,
        token: token ? '已设置' : '未设置',
        platform: (() => {
          try {
            // 优先使用现代化API
            if (typeof wx !== 'undefined' && wx.getDeviceInfo) {
              return wx.getDeviceInfo().platform
            }
            // 兜底使用uni-app API
            return uni.getSystemInfoSync().platform
          } catch (error) {
            console.warn('[API] 获取平台信息失败:', error)
            return 'unknown'
          }
        })()
      })

      // 检查运行环境
      // #ifdef H5
      // H5环境：使用uni.uploadFile但确保字段名正确
      uni.uploadFile({
        url: getBaseUrl() + url,
        filePath: filePath,
        name: 'avatar', // 后端期望的字段名
        header: {
          'Authorization': `Bearer ${token}`
          // 不设置Content-Type，让uni-app自动处理
        },
        success: (res) => {
          console.log('文件上传成功，响应:', res)
          console.log('响应状态码:', res.statusCode)
          console.log('响应头:', res.header)
          
          // 检查HTTP状态码
          if (res.statusCode !== 200) {
            console.error(`HTTP错误: ${res.statusCode}`)
            reject(new Error(`上传失败: HTTP ${res.statusCode}`))
            return
          }
          
          try {
            const data = JSON.parse(res.data)
            console.log('解析后的数据:', data)
            
            if (data.success) {
              resolve(data)
            } else {
              reject(new Error(data.message || '文件上传失败'))
            }
          } catch (parseError) {
            console.error('解析上传响应失败:', parseError)
            console.error('原始响应数据:', res.data)
            reject(new Error('文件上传失败'))
          }
        },
        fail: (error) => {
          console.error(`文件上传失败 ${url}:`, error)
          console.error('错误详情:', {
            errMsg: error.errMsg,
            statusCode: error.statusCode,
            header: error.header
          })
          reject(new Error(error.errMsg || '文件上传失败'))
        }
      })
      // #endif

      // #ifdef APP-PLUS
      // App环境：使用getFileSystemManager读取文件
      if (uni.getFileSystemManager) {
        uni.getFileSystemManager().readFile({
          filePath: filePath,
          success: (res) => {
            console.log('文件读取成功，大小:', res.data.byteLength || res.data.length)
            
            // 创建FormData
            const formData = new FormData()
            formData.append('avatar', res.data, filePath.split('/').pop())
            
            // 使用uni.request上传，符合后端FormData要求
            uni.request({
              url: getBaseUrl() + url,
              method: 'POST',
              data: formData,
              header: {
                'Authorization': `Bearer ${token}`
              },
              success: (res) => {
                console.log('文件上传成功，响应:', res)
                if (res.statusCode === 200) {
                  resolve(res.data)
                } else {
                  reject(new Error(`上传失败: HTTP ${res.statusCode}`))
                }
              },
              fail: (error) => {
                console.error(`文件上传失败 ${url}:`, error)
                reject(new Error(error.errMsg || '文件上传失败'))
              }
            })
          },
          fail: (error) => {
            console.error('读取文件失败:', error)
            reject(new Error('读取文件失败'))
          }
        })
      } else {
        // 回退到uploadFile
        uni.uploadFile({
          url: getBaseUrl() + url,
          filePath: filePath,
          name: 'avatar',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.statusCode === 200) {
              try {
                const data = JSON.parse(res.data)
                if (data.success) {
                  resolve(data)
                } else {
                  reject(new Error(data.message || '文件上传失败'))
                }
              } catch (parseError) {
                reject(new Error('文件上传失败'))
              }
            } else {
              reject(new Error(`上传失败: HTTP ${res.statusCode}`))
            }
          },
          fail: (error) => {
            reject(new Error(error.errMsg || '文件上传失败'))
          }
        })
      }
      // #endif
    })
  }
}

// 导出API服务模块
export default {
  // 基础配置
  config: API_CONFIG,
  getBaseUrl,
  
  // 通用请求方法
  request: (url, options = {}) => {
    return new Promise((resolve, reject) => {
      // 获取存储的token
      const token = uni.getStorageSync('userToken')
      
      // 构建请求头
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      }
      
      // 如果需要认证且存在token，添加认证头
      if (options.needAuth !== false && token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      // 构建请求配置
      const requestConfig = {
        url: getBaseUrl() + url,
        method: options.method || 'GET',
        data: options.data || {},
        header: headers,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          console.error(`请求失败 ${url}:`, error)
          reject(new Error(error.errMsg || '请求失败'))
        }
      }
      
      // 发送请求
      uni.request(requestConfig)
    })
  },
  
  // HTTP方法
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
  
  // 1. 用户认证模块
  auth: {
    // 微信授权登录
    wechatLogin: (code, userInfo) => api.post('/api/auth/wechat-login', { code, userInfo }, { needAuth: false }),
    
    // 手机号验证码登录
    phoneLogin: (phoneNumber, verificationCode) => api.post('/api/auth/phone-login', { phoneNumber, verificationCode }, { needAuth: false }),
    
    // 手机号密码登录
    phonePasswordLogin: (phoneNumber, password) => api.post('/api/auth/phone-password-login', { phoneNumber, password }, { needAuth: false }),
    
    // 发送验证码
    sendVerificationCode: (phoneNumber) => api.post('/api/auth/send-verification-code', { phoneNumber }, { needAuth: false }),
    
    // Token验证
    validateToken: (token) => api.post('/api/auth/validate-token', { token }, { needAuth: false }),
    
    // 测试登录
    testLogin: () => api.post('/api/auth/test-login', {}, { needAuth: false }),

    // 部门管理员测试登录
    testLoginAsAdmin: () => api.post('/api/auth/test-login-admin', {}, { needAuth: false }),

    // 系统管理员测试登录
    testLoginAsSysAdmin: () => api.post('/api/auth/test-login-sys-admin', {}, { needAuth: false }),

    // 管理员测试登录（带参数）
    testLoginAdmin: (loginData) => api.post('/api/auth/test-login-admin', loginData, { needAuth: false }),
    
    // 部门管理员登录（带手机号参数）
    testLoginDeptAdmin: (phoneNumber) => api.post('/api/auth/test-login-admin', { phoneNumber }, { needAuth: false }),
    
    // 普通用户测试登录
    testLoginUser: () => api.post('/api/auth/test-login', {}, { needAuth: false }),
    
    // 系统管理员测试登录
    testLoginSysAdmin: () => api.post('/api/auth/test-login-sys-admin', {}, { needAuth: false }),
    
    // 指定部门管理员测试登录
    testLoginSpecificDeptAdmin: (departmentCode) => api.post('/api/auth/test-login-dept-admin', { departmentCode }, { needAuth: false }),
    
    // 用户登出
    logout: () => api.post('/api/auth/logout'),
    
    // 刷新Token
    refreshToken: (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken }, { needAuth: false })
  },
  
  // 2. 用户信息模块
  user: {
    // 获取用户统计数据
    getStats: () => api.get('/api/user/stats'),
    
    // 获取当前用户信息
    getInfo: () => api.get('/api/user/info'),
    
    // 更新用户头像URL
    updateAvatar: (avatarUrl) => api.put('/api/user/avatar', { avatarUrl }),
    
    // 更新用户资料
    updateProfile: (profileData) => api.put('/api/user/profile', profileData),
    
    // 获取用户列表（管理员功能）
    getList: (params = {}) => api.get('/api/user/list', params),
    
    // 获取指定用户信息（管理员功能）
    getUserById: (userId) => api.get(`/api/user/${userId}`),
    
    // 更新用户状态（管理员功能）
    updateStatus: (userId, status) => api.put(`/api/user/${userId}/status`, { status }),
    
    // 批量更新用户状态（管理员功能）
    batchUpdateStatus: (userIds, status) => api.put('/api/user/batch/status', { userIds, status }),
    
    // 更新用户角色（系统管理员功能）
    updateRole: (userId, role) => api.put(`/api/user/${userId}/role`, { role }),
    
    // 删除用户（系统管理员功能）
    deleteUser: (userId) => api.delete(`/api/user/${userId}`),
    
    // 修改密码
    changePassword: (passwordData) => api.put('/api/user/change-password', passwordData),
    
    // 提交反馈
    submitFeedback: (feedbackData) => api.post('/api/user/feedback', feedbackData),
    
    // 获取通知设置
    getNotificationSettings: () => api.get('/api/user/notification-settings'),
    
    // 更新通知设置
    updateNotificationSettings: (settings) => api.put('/api/user/notification-settings', settings)
  },
  
  // 3. 日常报餐模块
  dining: {
    // 获取菜单信息
    getMenu: (date, mealType) => api.get('/api/dining/menu', { date, mealType }),
    
    // 获取部门成员
    getDeptMembers: () => api.get('/api/dining/dept-members'),
    
    // 提交部门报餐
    submitDeptOrder: (orderData) => api.post('/api/dining/dept-order', orderData),
    
    // 获取报餐记录（支持时间段查询）
    getRecords: (params = {}) => api.get('/api/dining/records', params),
    
    // 获取报餐记录详情（包含具体人员名单）
    getRecordDetail: (recordId) => api.get(`/api/dining/records/${recordId}/detail`),
    
    // 获取个人报餐状态
    getPersonalStatus: (date) => api.get('/api/dining/personal-status', { date }),
    
    // 取消报餐订单
    cancelOrder: (orderId) => api.put(`/api/dining/orders/${orderId}/cancel`),
    
    // 获取报餐统计（管理员功能）
    getStats: (date) => api.get('/api/dining/stats', { date }),
    
    // 确认报餐订单（管理员功能）
    confirmOrder: (orderId) => api.put(`/api/dining/orders/${orderId}/confirm`),
    
    // 批量确认报餐订单（管理员功能）
    batchConfirmOrders: (orderIds) => api.put('/api/dining/orders/batch/confirm', { orderIds })
  },
  
  
  // 5. 球馆预约模块
  venue: {
    // 获取场地列表
    getList: (params = {}) => api.get('/api/venue/list', params),
    
    // 获取场地详情
    getDetail: (venueId) => api.get(`/api/venue/${venueId}`),
    
    // 获取场地时间安排
    getSchedule: (venueId, date) => api.get(`/api/venue/${venueId}/schedule`, { date }),
    
    // 检查时间段可用性
    checkAvailability: (venueId, date, startTime, endTime) => 
      api.get('/api/venue/check-availability', { venueId, date, startTime, endTime }),
    
    // 提交场地预约
    submitReservation: (reservationData) => api.post('/api/venue/reservation', reservationData),
    
    // 获取我的预约记录
    getMyReservations: (params = {}) => api.get('/api/venue/my-reservations', params),
    
    // 取消预约
    cancelReservation: (reservationId) => api.put(`/api/venue/reservations/${reservationId}/cancel`),
    
    // 获取预约详情
    getReservationDetail: (reservationId) => api.get(`/api/venue/reservations/${reservationId}`),
    
    // 获取场地安排表（兼容旧接口）
    getScheduleByType: (date, venueType) => api.get('/api/venue/schedule', { date, venueType })
  },
  
  // 5.1 球馆管理模块（管理员）
  venueAdmin: {
    // 获取所有场地列表（管理员）
    getAllVenues: (params = {}) => api.get('/api/admin/venues', params),
    
    // 创建场地
    createVenue: (venueData) => api.post('/api/admin/venues', venueData),
    
    // 更新场地信息
    updateVenue: (venueId, venueData) => api.put(`/api/admin/venues/${venueId}`, venueData),
    
    // 删除场地
    deleteVenue: (venueId) => api.delete(`/api/admin/venues/${venueId}`),
    
    // 获取所有预约记录（管理员）
    getAllReservations: (params = {}) => api.get('/api/admin/venue-reservations', params),
    
    // 审核预约
    auditReservation: (reservationId, action, comment) => 
      api.put(`/api/admin/venue-reservations/${reservationId}/audit`, { action, comment }),
    
    // 获取场地统计信息
    getVenueStats: (params = {}) => api.get('/api/admin/venue-stats', params)
  },
  
  // 6. 用餐验证模块
  verification: {
    // 用餐验证
    verify: (verificationData) => api.post('/api/verification/verify', verificationData),
    
    // 获取验证记录
    getHistory: (params = {}) => api.get('/api/verification/history', params)
  },
  
  // 7. 系统管理模块
  system: {
    // 获取今日统计
    getTodayStats: () => api.get('/api/system/today-stats'),
    
    // 获取今日菜单 - 根据当前时间自动判断餐次
    getTodayMenu: () => {
      // 导入TimeUtils工具类
      const { TimeUtils } = require('./timeUtils.js')
      
      const date = TimeUtils.getCurrentDate() // YYYY-MM-DD
      const mealType = TimeUtils.getCurrentMealType() || 'lunch' // 获取当前餐次，默认午餐
      
      return api.get('/api/admin/menu/by-date', { date, mealType })
    },
    
    // 获取最近活动
    getRecentActivities: () => api.get('/api/system/recent-activities'),
    
    // 获取系统公告
    getNotice: () => api.get('/api/system/notice'),
    
    // 健康检查
    healthCheck: () => api.get('/health', {}, { needAuth: false })
  },

  // 8. 确认就餐模块
  diningConfirmation: {
    // 获取用户就餐确认状态
    getStatus: (date) => api.get('/api/dining-confirmation/status', { date }),
    
    // 用户手动确认就餐
    manualConfirm: (orderId, confirmationType = 'manual') => 
      api.post(`/api/dining-confirmation/manual/${orderId}`, { confirmationType }),
    
    // 获取就餐确认历史记录
    getHistory: (params = {}) => api.get('/api/dining-confirmation/history', params),
    
    // 管理员代确认就餐
    adminConfirm: (orderId, remark) => 
      api.post(`/api/dining-confirmation/admin/${orderId}`, { remark }),
    
    // 批量确认就餐
    batchConfirm: (orderIds, remark) => 
      api.post('/api/dining-confirmation/batch', { orderIds, remark }),
    
    // 获取待确认就餐列表
    getPendingList: (params = {}) => api.get('/api/dining-confirmation/pending', params),
    
    // 获取就餐确认统计
    getStats: (date, departmentId) => 
      api.get('/api/dining-confirmation/stats', { date, departmentId })
  },

  // 9. 扫码确认就餐模块（保留核心功能）
  qrScan: {
    // 扫码确认就餐（核心功能）
    scan: (qrCode = 'DINING_QR_MAIN_001', scanTime) => 
      api.post('/api/qr-scan/scan', { qrCode, scanTime }),
    
    // 获取用户就餐确认状态
    getDiningStatus: (date = null) => {
      const params = date ? { date } : {}
      return api.get('/api/dining-confirmation/status', params)
    }
  },

  // 4. 管理员模块
  admin: {
    // 用户管理
    getUsers: (params = {}) => api.get('/api/user/list', params), // 更新为正确的API路径
    getUsersList: (params = {}) => api.get('/api/user/list', params), // 更新为正确的API路径
    getUserById: (userId) => api.get(`/api/admin/users/${userId}`),
    getUserDetail: (userId) => api.get(`/api/admin/users/${userId}`), // 别名
    createUser: (userData) => api.post('/api/admin/users', userData),
    updateUser: (userId, userData) => api.put(`/api/admin/users/${userId}`, userData),
    deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
    updateUserStatus: (userId, status) => api.put(`/api/admin/users/${userId}/status`, { status }),
    updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role`, { role }),
    batchDeleteUsers: (userIds) => api.post('/api/admin/users/batch-delete', { userIds }),
    
    // 重置用户密码（管理员功能）
    resetUserPassword: (userId, newPassword) => api.put(`/api/user/${userId}/reset-password`, { newPassword }),
    
    // 头像上传（管理员专用）
    uploadAvatar: (filePath) => api.upload('/api/admin/upload/avatar', filePath),
    
    // 管理员更新用户头像
    updateUserAvatar: (userId, avatarUrl) => api.put('/api/admin/user/avatar', { userId, avatarUrl }),
    
    // 菜单管理 - 严格按照接口文档规范
    // 1. 保存菜单草稿
    saveMenuDraft: (menuData) => api.post('/api/admin/menu/draft', menuData),
    
    // 2. 发布菜单
    publishMenu: (menuData) => api.post('/api/admin/menu/publish', menuData),
    
    // 3. 获取菜单历史
    getMenuHistory: (params = {}) => api.get('/api/admin/menu/history', params),
    
    // 4. 根据日期和餐次获取菜单
    getMenuByDate: (date, mealType) => api.get('/api/admin/menu/by-date', { date, mealType }),
    
    // 5. 撤回菜单
    revokeMenu: (menuId) => api.put(`/api/admin/menu/${menuId}/revoke`),
    
    // 6. 获取菜单的菜品列表
    getMenuDishes: (menuId) => api.get(`/api/admin/menu/${menuId}/dishes`),
    
    // 7. 批量获取菜品详情
    getDishesDetails: (dishIds) => api.post('/api/admin/dishes/batch', { dishIds }),
    
    // 8. 删除菜单（仅草稿状态）
    deleteMenu: (menuId) => api.delete(`/api/admin/menu/${menuId}`),

    // 角色管理
    getRolesList: () => api.get('/api/admin/roles'),
    getRoleDetail: (roleId) => api.get(`/api/admin/roles/${roleId}`),
    createRole: (roleData) => api.post('/api/admin/roles', roleData),
    updateRole: (roleId, roleData) => api.put(`/api/admin/roles/${roleId}`, roleData),
    deleteRole: (roleId) => api.delete(`/api/admin/roles/${roleId}`),
    assignRole: (userId, roleId) => api.post('/api/admin/roles/assign', { userId, roleId }),

    // 部门管理
    getDepartmentsList: () => api.get('/api/department/list'),
    getDepartmentDetail: (deptId) => api.get(`/api/department/${deptId}`),
    getMyDepartment: () => api.get('/api/department/my'),
    getDepartmentMembers: (deptId, params = {}) => api.get(`/api/department/${deptId}/members`, params),
    getDeptAdminInfo: () => api.get('/api/department/admin/my-info'),
    createDepartment: (deptData) => api.post('/api/department', deptData),
    updateDepartment: (deptId, deptData) => api.put(`/api/admin/departments/${deptId}`, deptData),
    deleteDepartment: (deptId) => api.delete(`/api/admin/departments/${deptId}`),

    // 菜品管理
    getDishesList: (params = {}) => api.get('/api/admin/dishes', params),
    getDishDetail: (dishId) => api.get(`/api/admin/dishes/${dishId}`),
    createDish: (dishData) => api.post('/api/admin/dishes', dishData),
    updateDish: (dishId, dishData) => api.put(`/api/admin/dishes/${dishId}`, dishData),
    deleteDish: (dishId) => api.delete(`/api/admin/dishes/${dishId}`),
    batchUpdateDishStatus: (dishIds, status) => api.put('/api/admin/dishes/batch/status', { dishIds, status }),
    batchDeleteDishes: (dishIds) => api.post('/api/admin/dishes/batch-delete', { dishIds }),
    updateDishStatus: (dishId, status) => api.put(`/api/admin/dishes/${dishId}/status`, { status }),
    
    // 按餐次类型获取菜品
    getDishesByMealType: (mealType, params = {}) => api.get(`/api/admin/dishes/meal/${mealType}`, params),
    uploadDishImage: (dishId, imageFile) => {
      const formData = new FormData()
      formData.append('image', imageFile)
      return api.post(`/api/admin/dishes/${dishId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    getDishCategories: () => api.get('/api/admin/dishes/categories'),
    createDishCategory: (categoryData) => api.post('/api/admin/dishes/categories', categoryData),
    updateDishCategory: (categoryId, categoryData) => api.put(`/api/admin/dishes/categories/${categoryId}`, categoryData),
    deleteDishCategory: (categoryId) => api.delete(`/api/admin/dishes/categories/${categoryId}`),
    
    // 营养模板管理
    getNutritionTemplates: () => api.get('/api/admin/dishes/nutrition-templates'),
    createNutritionTemplate: (templateData) => api.post('/api/admin/dishes/nutrition-templates', templateData),
    updateNutritionTemplate: (templateId, templateData) => api.put(`/api/admin/dishes/nutrition-templates/${templateId}`, templateData),
    deleteNutritionTemplate: (templateId) => api.delete(`/api/admin/dishes/nutrition-templates/${templateId}`),

    // 场地管理
    getVenuesList: (params = {}) => api.get('/api/admin/venues', params),
    getVenueDetail: (venueId) => api.get(`/api/admin/venues/${venueId}`),
    createVenue: (venueData) => api.post('/api/admin/venues', venueData),
    updateVenue: (venueId, venueData) => api.put(`/api/admin/venues/${venueId}`, venueData),
    updateVenueStatus: (venueId, status) => api.put(`/api/admin/venues/${venueId}/status`, { status }),
    deleteVenue: (venueId) => api.delete(`/api/admin/venues/${venueId}`),
    batchDeleteVenues: (venueIds) => api.post('/api/admin/venues/batch-delete', { venueIds }),
    uploadVenueImage: (imageFile) => api.post('/api/admin/venues/upload-image', imageFile),
    getVenueSchedule: (venueId, date) => api.get(`/api/admin/venues/${venueId}/schedule`, { date }),
    updateVenueSchedule: (venueId, scheduleData) => api.put(`/api/admin/venues/${venueId}/schedule`, scheduleData),
    
    // 时间段管理
    createTimeSlot: (slotData) => api.post('/api/admin/time-slots', slotData),
    batchCreateTimeSlots: (slotsData) => api.post('/api/admin/time-slots/batch', slotsData),
    updateTimeSlot: (slotId, slotData) => api.put(`/api/admin/time-slots/${slotId}`, slotData),
    updateTimeSlotStatus: (slotId, status) => api.put(`/api/admin/time-slots/${slotId}/status`, { status }),
    deleteTimeSlot: (slotId) => api.delete(`/api/admin/time-slots/${slotId}`),
    
    // 预约管理  
    getReservationsList: (params = {}) => api.get('/api/admin/reservations', params),
    confirmReservation: (reservationId) => api.put(`/api/admin/reservations/${reservationId}/confirm`),
    rejectReservation: (reservationId) => api.put(`/api/admin/reservations/${reservationId}/reject`),
    cancelReservation: (reservationId) => api.put(`/api/admin/reservations/${reservationId}/cancel`),

    // 增强版报餐功能
    getDeptMembersForDining: (params = {}) => api.get('/api/dining/enhanced/dept-members', params),
    createDepartmentOrder: (orderData) => api.post('/api/dining/enhanced/department-order', orderData),
    getDepartmentOrders: (params = {}) => api.get('/api/dining/enhanced/department-orders', params),
    getDepartmentStats: (params = {}) => api.get('/api/dining/enhanced/department-stats', params),
    getDepartmentOverview: () => api.get('/api/dining/enhanced/department-overview'),

    // 系统设置
    getSystemConfig: () => api.get('/api/admin/system/config'),
    updateSystemConfig: (configData) => api.put('/api/admin/system/config', configData),
    getVerificationSchemes: () => api.get('/api/admin/system/verification-schemes'),
    updateVerificationSchemes: (schemesData) => api.put('/api/admin/system/verification-schemes', schemesData),
    updateVerificationScheme: (schemeId, schemeData) => api.put(`/api/admin/system/verification-schemes/${schemeId}`, schemeData),
    
    // 数据统计
    getOverallStats: (params = {}) => api.get('/api/admin/stats/overall', params),
    getDiningStats: (params = {}) => api.get('/api/admin/stats/dining', params),
    getReservationStats: (params = {}) => api.get('/api/admin/stats/reservations', params),
    getUserStats: (params = {}) => api.get('/api/admin/stats/users', params),
    getUserActivities: (userId) => api.get(`/api/admin/users/${userId}/activities`),
    getSystemLogs: (params = {}) => api.get('/api/admin/system/logs', params),
    getSystemStatus: () => api.get('/api/admin/system/status'),
    getSystemStats: () => api.get('/api/admin/system-stats'), // 新增

    // 数据导出
    exportDiningData: (params = {}) => api.get('/api/admin/export/dining', params),
    exportReservationData: (params = {}) => api.get('/api/admin/export/reservations', params),
    exportUserData: (params = {}) => api.get('/api/admin/export/users', params),
    exportStatisticsData: (params = {}) => api.get('/api/admin/export/statistics', params),

    // 系统维护
    clearCache: () => api.post('/api/admin/system/clear-cache'),
    backupData: () => api.post('/api/admin/system/backup'),
    restoreData: (backupFile) => api.post('/api/admin/system/restore', backupFile),
    
    // 通知管理
    sendNotification: (notificationData) => api.post('/api/admin/notifications', notificationData),
    getNotificationHistory: (params = {}) => api.get('/api/admin/notifications/history', params),
    
    // 公告管理 - 完全按照接口文档v4/公告文档.md实现
    // 1. 创建公告 - POST /api/admin/notices
    createNotice: (noticeData) => api.post('/api/admin/notices', noticeData),
    
    // 2. 更新公告 - PUT /api/admin/notices/:noticeId  
    updateNotice: (noticeId, noticeData) => api.put(`/api/admin/notices/${noticeId}`, noticeData),
    
    // 3. 获取公告列表 - GET /api/admin/notices
    getNotices: (params = {}) => api.get('/api/admin/notices', params),
    getNoticesList: (params = {}) => api.get('/api/admin/notices', params), // 别名，与页面代码保持一致
    
    // 其他公告相关接口（非文档规范，为项目完整性保留）
    getNoticeById: (noticeId) => api.get(`/api/admin/notices/${noticeId}`),
    deleteNotice: (noticeId) => api.delete(`/api/admin/notices/${noticeId}`),
    
    // 状态更新使用通用更新接口（按文档规范）
    updateNoticeStatus: (noticeId, status) => api.put(`/api/admin/notices/${noticeId}`, { status }),
    
    // 批量操作（非文档规范，但项目需要）
    batchDeleteNotices: (noticeIds) => api.post('/api/admin/notices/batch-delete', { noticeIds }),
    batchUpdateNoticeStatus: (noticeIds, status) => api.put('/api/admin/notices/batch/status', { noticeIds, status }),
    
    // 发布状态管理（非文档规范，但项目需要）
    publishNotice: (noticeId) => api.post(`/api/admin/notices/${noticeId}/publish`),
    unpublishNotice: (noticeId) => api.post(`/api/admin/notices/${noticeId}/unpublish`),
    archiveNotice: (noticeId) => api.post(`/api/admin/notices/${noticeId}/archive`),
    
    // 系统通知 - 使用新的公告管理接口
    getSystemNotice: (params = {}) => api.get('/api/admin/notices', {
      status: 'published',
      page: 1,
      limit: 1,
      sortBy: 'priority',
      sortOrder: 'desc',
      ...params
    }),
    getSystemNotices: (params = {}) => api.get('/api/admin/notices', {
      status: 'published',
      ...params
    }),
    
    // 用户通知设置
    getUserNotificationSettings: () => api.get('/api/user/notification-settings'),
    updateUserNotificationSettings: (settings) => api.put('/api/user/notification-settings', settings),
    resetUserNotificationSettings: () => api.post('/api/user/notification-settings/reset'),
    
    // 通知历史
    getNotificationHistory: (params = {}) => api.get('/api/user/notifications/history', params),
    markNotificationAsRead: (notificationId) => api.put(`/api/user/notifications/${notificationId}/read`),
    markAllNotificationsAsRead: () => api.put('/api/user/notifications/mark-all-read'),
    deleteNotification: (notificationId) => api.delete(`/api/user/notifications/${notificationId}`),
    clearNotificationHistory: () => api.delete('/api/user/notifications/clear-history')
  }
}
