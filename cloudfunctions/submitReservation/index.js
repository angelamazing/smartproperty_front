// 提交预约云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 提交预约
 * @param {Object} event 事件参数
 * @param {string} event.venueId 场地ID
 * @param {string} event.date 预约日期
 * @param {string} event.startTime 开始时间
 * @param {string} event.endTime 结束时间
 * @param {string} event.userName 预约人姓名
 * @param {string} event.phoneNumber 联系电话
 * @param {string} event.purpose 预约用途
 * @param {string} event.remark 备注信息
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { 
    venueId, 
    date, 
    startTime, 
    endTime, 
    userName, 
    phoneNumber, 
    purpose, 
    remark 
  } = event
  
  try {
    // 验证参数
    if (!venueId || !date || !startTime || !endTime || !userName || !phoneNumber || !purpose) {
      return {
        success: false,
        message: '请填写完整的预约信息'
      }
    }
    
    // 检查场地是否存在
    const venueResult = await db.collection('venues')
      .doc(venueId)
      .get()
    
    if (!venueResult.data) {
      return {
        success: false,
        message: '场地不存在'
      }
    }
    
    const venue = venueResult.data
    
    // 检查时间段是否已被预约
    const existingReservation = await db.collection('reservations')
      .where({
        venueId: venueId,
        reservationDate: date,
        startTime: startTime,
        endTime: endTime,
        status: db.command.in(['pending', 'confirmed'])
      })
      .get()
    
    if (existingReservation.data.length > 0) {
      return {
        success: false,
        message: '该时间段已被预约'
      }
    }
    
    // 创建预约记录
    const reservationData = {
      venueId: venueId,
      venueName: venue.name,
      reservationDate: date,
      startTime: startTime,
      endTime: endTime,
      userName: userName,
      phoneNumber: phoneNumber,
      purpose: purpose,
      remark: remark || '',
      userId: wxContext.OPENID,
      status: 'pending',
      createTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection('reservations').add({
      data: reservationData
    })
    
    if (result._id) {
      // 发送通知给管理员
      await sendNotificationToAdmin(reservationData)
      
      return {
        success: true,
        message: '预约提交成功',
        reservationId: result._id
      }
    } else {
      return {
        success: false,
        message: '预约提交失败'
      }
    }
  } catch (error) {
    console.error('提交预约失败:', error)
    return {
      success: false,
      message: '预约提交失败，请重试'
    }
  }
}

/**
 * 发送通知给管理员
 */
async function sendNotificationToAdmin(reservationData) {
  try {
    // 这里可以集成推送服务，如微信模板消息
    // 暂时记录到日志
    console.log('预约通知:', {
      type: 'new_reservation',
      data: reservationData,
      time: new Date()
    })
  } catch (error) {
    console.error('发送通知失败:', error)
  }
}
