// 测试登录云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 测试登录处理
 * @param {Object} event 事件参数
 */
exports.main = async (event, context) => {
  try {
    // 生成测试用户数据
    const testUserData = {
      _id: 'test_user_' + Date.now(),
      openid: 'test_openid_' + Date.now(),
      nickName: '测试用户',
      avatarUrl: '/static/default-avatar.png',
      role: 'user',
      department: '测试部门',
      phoneNumber: '13800138000',
      email: 'test@example.com',
      createTime: new Date(),
      lastLoginTime: new Date(),
      isTestUser: true
    }
    
    // 生成测试token
    const testToken = 'test_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // 保存或更新测试用户到数据库
    try {
      // 检查是否已存在测试用户
      const existingUser = await db.collection('users').where({
        isTestUser: true
      }).limit(1).get()
      
      if (existingUser.data.length > 0) {
        // 更新现有测试用户
        await db.collection('users').doc(existingUser.data[0]._id).update({
          data: {
            lastLoginTime: new Date(),
            nickName: testUserData.nickName,
            department: testUserData.department
          }
        })
        testUserData._id = existingUser.data[0]._id
        testUserData.openid = existingUser.data[0].openid
      } else {
        // 创建新的测试用户
        const result = await db.collection('users').add({
          data: testUserData
        })
        testUserData._id = result._id
      }
    } catch (dbError) {
      console.log('数据库操作失败，使用内存数据:', dbError)
      // 如果数据库操作失败，仍然返回测试数据
    }
    
    // 保存token到数据库（可选）
    try {
      await db.collection('user_tokens').add({
        data: {
          token: testToken,
          userId: testUserData._id,
          openid: testUserData.openid,
          expireTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
          createTime: new Date(),
          isTestToken: true
        }
      })
    } catch (tokenError) {
      console.log('Token保存失败:', tokenError)
    }
    
    // 返回登录成功数据
    return {
      success: true,
      message: '测试登录成功',
      token: testToken,
      userInfo: testUserData,
      isTestLogin: true
    }
    
  } catch (error) {
    console.error('测试登录失败:', error)
    return {
      success: false,
      message: '测试登录失败: ' + error.message,
      isTestLogin: true
    }
  }
}
