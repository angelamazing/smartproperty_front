// 手机号登录云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 手机号登录处理
 * @param {Object} event 事件参数
 * @param {string} event.phoneNumber 手机号
 * @param {string} event.verificationCode 验证码
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { phoneNumber, verificationCode } = event
  
  try {
    // 验证手机号格式
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      return {
        success: false,
        message: '手机号格式不正确'
      }
    }
    
    // 验证验证码格式
    if (!verificationCode || !/^\d{6}$/.test(verificationCode)) {
      return {
        success: false,
        message: '验证码格式不正确'
      }
    }
    
    // 验证验证码有效性
    const codeValid = await validateVerificationCode(phoneNumber, verificationCode)
    if (!codeValid) {
      return {
        success: false,
        message: '验证码错误或已过期'
      }
    }
    
    // 查询用户是否已存在
    let user = await db.collection('users').where({
      phoneNumber: phoneNumber
    }).get()
    
    if (user.data.length === 0) {
      // 新用户，创建用户记录
      const userData = {
        openid: wxContext.OPENID || '',
        unionid: wxContext.UNIONID || '',
        phoneNumber: phoneNumber,
        nickName: `用户${phoneNumber.substr(-4)}`, // 默认昵称
        avatarUrl: '', // 默认头像
        gender: 0,
        country: '',
        province: '',
        city: '',
        language: 'zh_CN',
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
      // 老用户，更新登录时间和openid
      user = user.data[0]
      const updateData = {
        lastLoginTime: new Date(),
        updateTime: new Date()
      }
      
      // 如果openid为空，更新openid
      if (!user.openid && wxContext.OPENID) {
        updateData.openid = wxContext.OPENID
      }
      
      await db.collection('users').doc(user._id).update({
        data: updateData
      })
    }
    
    // 生成登录token
    const token = generateToken(user._id, phoneNumber)
    
    // 保存token到数据库
    await db.collection('user_tokens').add({
      data: {
        userId: user._id,
        phoneNumber: phoneNumber,
        token: token,
        createTime: new Date(),
        expireTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天过期
      }
    })
    
    // 清除已使用的验证码
    await clearVerificationCode(phoneNumber, verificationCode)
    
    // 返回登录成功信息
    return {
      success: true,
      message: '登录成功',
      token: token,
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
    console.error('手机号登录失败:', error)
    return {
      success: false,
      message: '登录失败，请重试',
      error: error.message
    }
  }
}

/**
 * 验证验证码有效性
 * @param {string} phoneNumber 手机号
 * @param {string} verificationCode 验证码
 * @returns {boolean} 验证结果
 */
async function validateVerificationCode(phoneNumber, verificationCode) {
  try {
    const result = await db.collection('verification_codes').where({
      phoneNumber: phoneNumber,
      code: verificationCode,
      status: 'unused',
      expireTime: db.command.gt(new Date())
    }).get()
    
    return result.data.length > 0
  } catch (error) {
    console.error('验证验证码失败:', error)
    return false
  }
}

/**
 * 清除已使用的验证码
 * @param {string} phoneNumber 手机号
 * @param {string} verificationCode 验证码
 */
async function clearVerificationCode(phoneNumber, verificationCode) {
  try {
    await db.collection('verification_codes').where({
      phoneNumber: phoneNumber,
      code: verificationCode
    }).update({
      data: {
        status: 'used',
        usedTime: new Date()
      }
    })
  } catch (error) {
    console.error('清除验证码失败:', error)
  }
}

/**
 * 生成简单的token
 * @param {string} userId 用户ID
 * @param {string} phoneNumber 手机号
 * @returns {string} token字符串
 */
function generateToken(userId, phoneNumber) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${userId}_${phoneNumber}_${timestamp}_${random}`
}
