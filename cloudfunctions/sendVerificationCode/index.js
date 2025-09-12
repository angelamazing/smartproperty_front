// 发送验证码云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 发送验证码处理
 * @param {Object} event 事件参数
 * @param {string} event.phoneNumber 手机号
 */
exports.main = async (event, context) => {
  const { phoneNumber } = event
  
  try {
    // 验证手机号格式
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      return {
        success: false,
        message: '手机号格式不正确'
      }
    }
    
    // 检查发送频率限制（同一手机号1分钟内只能发送一次）
    const lastSendTime = await getLastSendTime(phoneNumber)
    if (lastSendTime && Date.now() - lastSendTime.getTime() < 60000) {
      return {
        success: false,
        message: '发送过于频繁，请稍后再试'
      }
    }
    
    // 生成6位随机验证码
    const verificationCode = generateVerificationCode()
    
    // 保存验证码到数据库
    await saveVerificationCode(phoneNumber, verificationCode)
    
    // 发送验证码（这里简化处理，实际应该调用短信服务）
    const sendResult = await sendSMS(phoneNumber, verificationCode)
    
    if (sendResult.success) {
      return {
        success: true,
        message: '验证码发送成功',
        code: verificationCode // 开发环境返回验证码，生产环境不返回
      }
    } else {
      throw new Error(sendResult.message || '发送失败')
    }
    
  } catch (error) {
    console.error('发送验证码失败:', error)
    return {
      success: false,
      message: '发送失败，请重试',
      error: error.message
    }
  }
}

/**
 * 获取上次发送时间
 * @param {string} phoneNumber 手机号
 * @returns {Date|null} 上次发送时间
 */
async function getLastSendTime(phoneNumber) {
  try {
    const result = await db.collection('verification_codes').where({
      phoneNumber: phoneNumber
    }).orderBy('createTime', 'desc').limit(1).get()
    
    if (result.data.length > 0) {
      return result.data[0].createTime
    }
    return null
  } catch (error) {
    console.error('获取上次发送时间失败:', error)
    return null
  }
}

/**
 * 生成6位随机验证码
 * @returns {string} 验证码
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 保存验证码到数据库
 * @param {string} phoneNumber 手机号
 * @param {string} verificationCode 验证码
 */
async function saveVerificationCode(phoneNumber, verificationCode) {
  try {
    // 设置验证码5分钟后过期
    const expireTime = new Date(Date.now() + 5 * 60 * 1000)
    
    await db.collection('verification_codes').add({
      data: {
        phoneNumber: phoneNumber,
        code: verificationCode,
        status: 'unused', // unused, used, expired
        createTime: new Date(),
        expireTime: expireTime
      }
    })
  } catch (error) {
    console.error('保存验证码失败:', error)
    throw error
  }
}

/**
 * 发送短信验证码（模拟实现）
 * @param {string} phoneNumber 手机号
 * @param {string} verificationCode 验证码
 * @returns {Object} 发送结果
 */
async function sendSMS(phoneNumber, verificationCode) {
  try {
    // 这里是模拟实现，实际项目中应该调用真实的短信服务
    // 例如：阿里云短信、腾讯云短信等
    
    // 模拟发送延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟发送成功
    console.log(`模拟发送验证码到 ${phoneNumber}: ${verificationCode}`)
    
    return {
      success: true,
      message: '发送成功'
    }
    
    // 实际短信服务调用示例：
    /*
    const result = await cloud.callFunction({
      name: 'sendSMS',
      data: {
        phoneNumber: phoneNumber,
        templateId: 'SMS_TEMPLATE_ID',
        templateParams: {
          code: verificationCode
        }
      }
    })
    
    return result.result
    */
    
  } catch (error) {
    console.error('发送短信失败:', error)
    return {
      success: false,
      message: '短信发送失败'
    }
  }
}
