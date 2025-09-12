// 微信登录云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 微信登录处理
 * @param {Object} event 事件参数
 * @param {string} event.code 微信登录凭证
 * @param {Object} event.userInfo 用户信息
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code, userInfo } = event
  
  try {
    // 获取微信用户openid
    const openid = wxContext.OPENID
    const unionid = wxContext.UNIONID
    
    if (!openid) {
      return {
        success: false,
        message: '获取用户标识失败'
      }
    }
    
    // 查询用户是否已存在
    let user = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (user.data.length === 0) {
      // 新用户，创建用户记录
      const userData = {
        openid: openid,
        unionid: unionid || '',
        nickName: userInfo.nickName || '',
        avatarUrl: userInfo.avatarUrl || '',
        gender: userInfo.gender || 0,
        country: userInfo.country || '',
        province: userInfo.province || '',
        city: userInfo.city || '',
        language: userInfo.language || 'zh_CN',
        role: 'user', // 默认角色
        status: 'active', // 默认状态
        createTime: new Date(),
        updateTime: new Date(),
        lastLoginTime: new Date()
      }
      
      const result = await db.collection('users').add({
        data: userData
      })
      
      user = {
        _id: result._id,
        ...userData
      }
    } else {
      // 老用户，更新登录时间
      user = user.data[0]
      await db.collection('users').doc(user._id).update({
        data: {
          lastLoginTime: new Date(),
          updateTime: new Date()
        }
      })
    }
    
    // 生成登录token（这里简化处理，实际应该使用JWT等token机制）
    const token = generateToken(user._id, openid)
    
    // 保存token到数据库（可选，用于token管理）
    await db.collection('user_tokens').add({
      data: {
        userId: user._id,
        openid: openid,
        token: token,
        createTime: new Date(),
        expireTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天过期
      }
    })
    
    // 返回登录成功信息
    return {
      success: true,
      message: '登录成功',
      token: token,
      userInfo: {
        _id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status
      }
    }
    
  } catch (error) {
    console.error('微信登录失败:', error)
    return {
      success: false,
      message: '登录失败，请重试',
      error: error.message
    }
  }
}

/**
 * 生成简单的token（实际项目中应使用JWT等标准token）
 * @param {string} userId 用户ID
 * @param {string} openid 微信openid
 * @returns {string} token字符串
 */
function generateToken(userId, openid) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${userId}_${openid}_${timestamp}_${random}`
}
