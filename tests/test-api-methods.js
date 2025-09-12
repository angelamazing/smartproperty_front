/**
 * 测试API方法是否正确定义
 * 运行: node test-api-methods.js
 */

// 模拟uni-app环境
global.uni = {
  getStorageSync: (key) => {
    if (key === 'userToken') return 'test-token'
    return null
  },
  request: (options) => {
    console.log('模拟请求:', options.url, options.method)
    return Promise.resolve({
      statusCode: 200,
      data: { success: true, message: '测试成功' }
    })
  },
  uploadFile: (options) => {
    console.log('模拟上传:', options.url)
    return Promise.resolve({
      statusCode: 200,
      data: JSON.stringify({ success: true, message: '上传成功' })
    })
  }
}

// 模拟window对象
global.window = {
  location: {
    href: 'http://localhost:8080'
  }
}

// 模拟process对象
global.process = {
  env: {
    NODE_ENV: 'development'
  }
}

// 导入API模块
const api = require('./src/utils/api.js')

/**
 * 测试API方法是否存在
 */
function testApiMethods() {
  console.log('🚀 开始测试API方法定义...\n')
  
  const testCases = [
    // 认证模块
    { module: 'auth', methods: ['login', 'register', 'logout', 'sendVerificationCode'] },
    
    // 用户模块
    { module: 'user', methods: ['getInfo', 'updateAvatar', 'updateProfile', 'getList'] },
    
    // 日常报餐模块
    { module: 'dining', methods: ['getMenu', 'getDeptMembers', 'submitDeptOrder'] },
    
    // 特殊预约模块
    { module: 'reservation', methods: ['submit', 'getList', 'audit'] },
    
    // 球馆预约模块
    { module: 'venue', methods: ['getList', 'submitReservation', 'getReservations'] },
    
    // 用餐验证模块
    { module: 'verification', methods: ['verify', 'getHistory'] },
    
    // 系统模块
    { module: 'system', methods: ['getTodayStats', 'getTodayMenu', 'healthCheck'] },
    
    // 管理员模块
    { module: 'admin', methods: [
      'getUsers', 'getUsersList', 'getUserById', 'getUserDetail',
      'createUser', 'updateUser', 'deleteUser', 'batchDeleteUsers',
      'uploadAvatar', 'getMenuByDate', 'getMenuDetail', 'saveMenuDraft',
      'publishMenu', 'getMenuHistory', 'getMenuTemplates',
      'getDishesList', 'getDishCategories', 'createDish', 'updateDish',
      'deleteDish', 'batchUpdateDishStatus', 'uploadDishImage',
      'getVenuesList', 'getVenueDetail', 'createVenue', 'updateVenue',
      'deleteVenue', 'batchDeleteVenues', 'uploadVenueImage',
      'getSystemConfig', 'updateSystemConfig', 'getSystemStatus',
      'getSystemStats', 'getOverallStats', 'getDiningStats',
      'getReservationStats', 'getUserStats', 'getUserActivities',
      'getSystemLogs', 'clearCache', 'backupData',
      'sendNotification', 'getNotificationHistory'
    ] }
  ]
  
  let totalTests = 0
  let passedTests = 0
  let failedTests = 0
  
  testCases.forEach(({ module, methods }) => {
    console.log(`📦 测试模块: ${module}`)
    
    methods.forEach(method => {
      totalTests++
      
      try {
        if (api[module] && typeof api[module][method] === 'function') {
          console.log(`  ✅ ${method}`)
          passedTests++
        } else {
          console.log(`  ❌ ${method} - 方法不存在或不是函数`)
          failedTests++
        }
      } catch (error) {
        console.log(`  ❌ ${method} - 错误: ${error.message}`)
        failedTests++
      }
    })
    
    console.log('') // 空行分隔
  })
  
  console.log('📊 测试结果统计:')
  console.log(`  总测试数: ${totalTests}`)
  console.log(`  通过: ${passedTests}`)
  console.log(`  失败: ${failedTests}`)
  console.log(`  成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`)
  
  if (failedTests === 0) {
    console.log('\n🎉 所有API方法测试通过！')
  } else {
    console.log('\n⚠️  有API方法缺失，请检查上述错误')
  }
}

// 运行测试
testApiMethods()

