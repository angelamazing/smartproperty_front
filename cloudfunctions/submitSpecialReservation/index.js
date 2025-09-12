const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const {
      name,
      phone,
      department,
      date,
      mealTime,
      peopleCount,
      specialRequirements,
      selectedDishes,
      totalAmount
    } = event

    // 验证必填字段
    if (!name || !phone || !department || !date || !mealTime || !peopleCount || !selectedDishes || selectedDishes.length === 0) {
      return {
        success: false,
        message: '请完善所有必填信息'
      }
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return {
        success: false,
        message: '请输入正确的手机号'
      }
    }

    // 验证用餐人数
    const peopleCountNum = parseInt(peopleCount)
    if (peopleCountNum < 1 || peopleCountNum > 20) {
      return {
        success: false,
        message: '用餐人数应在1-20人之间'
      }
    }

    // 验证预约日期（至少提前24小时）
    const reservationDate = new Date(date)
    const now = new Date()
    const timeDiff = reservationDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    
    if (hoursDiff < 24) {
      return {
        success: false,
        message: '特殊预约需提前24小时提交'
      }
    }

    // 构建预约数据
    const reservationData = {
      name,
      phone,
      department,
      date,
      mealTime,
      peopleCount: peopleCountNum,
      specialRequirements: specialRequirements || '',
      selectedDishes,
      totalAmount: totalAmount || 0,
      status: 'pending', // pending, approved, rejected, completed
      submitTime: new Date(),
      updateTime: new Date(),
      isSpecialReservation: true
    }

    // 保存到数据库
    const result = await db.collection('special_reservations').add({
      data: reservationData
    })

    // 发送通知（可选）
    // await sendNotification(reservationData)

    return {
      success: true,
      message: '特殊预约提交成功',
      reservationId: result._id,
      data: reservationData
    }

  } catch (error) {
    console.error('特殊预约提交失败:', error)
    return {
      success: false,
      message: '预约提交失败: ' + error.message
    }
  }
}

// 发送通知函数（可选实现）
async function sendNotification(reservationData) {
  try {
    // 这里可以集成短信、邮件或其他通知服务
    console.log('预约通知:', {
      to: reservationData.phone,
      message: `您的特殊预约已提交成功，预约日期：${reservationData.date}，用餐时段：${reservationData.mealTime}`
    })
  } catch (error) {
    console.error('发送通知失败:', error)
  }
}
