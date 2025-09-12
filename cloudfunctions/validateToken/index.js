// Token验证云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * Token验证处理
 * @param {Object} event 事件参数
 * @param {string} event.token 用户token
 */
exports.main = async (event, context) => {
  const { token } = event
  
  try {
    if (!token) {
      return {
        success: false,
        message: 'Token不能为空',
        isValid: false
      }
    }
    
    // 查询token是否有效
    const tokenResult = await db.collection('user_tokens').where({
      token: token,
      expireTime: db.command.gt(new Date())
    }).get()
    
    if (tokenResult.data.length === 0) {
      return {
        success: true,
        message: 'Token已过期或无效',
        isValid: false
      }
    }
    
    const tokenInfo = tokenResult.data[0]
    
    // 查询用户信息
    const userResult = await db.collection('users').doc(tokenInfo.userId).get()
    
    if (!userResult.data) {
      return {
        success: true,
        message: '用户不存在',
        isValid: false
      }
    }
    
    const user = userResult.data
    
    // 检查用户状态
    if (user.status !== 'active') {
      return {
        success: true,
        message: '用户账号已被禁用',
        isValid: false
      }
    }
    
    // 更新token最后使用时间
    await db.collection('user_tokens').doc(tokenInfo._id).update({
      data: {
        lastUsedTime: new Date()
      }
    })
    
    return {
      success: true,
      message: 'Token验证成功',
      isValid: true,
      userInfo: {
        _id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status
      }
    }
    
  } catch (error) {
    console.error('Token验证失败:', error)
    return {
      success: false,
      message: 'Token验证失败',
      isValid: false,
      error: error.message
    }
  }
}
