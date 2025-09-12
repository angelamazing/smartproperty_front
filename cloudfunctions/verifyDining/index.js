const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const {
      verificationCode,
      diningPeople,
      remarks,
      verifyTime
    } = event

    // 验证必填字段
    if (!verificationCode || !diningPeople) {
      return {
        success: false,
        message: '请完善验证信息'
      }
    }

    // 验证用餐人数
    const peopleCount = parseInt(diningPeople)
    if (peopleCount < 1 || peopleCount > 20) {
      return {
        success: false,
        message: '用餐人数应在1-20人之间'
      }
    }

    // 查找验证码对应的餐桌信息
    const tableResult = await db.collection('dining_tables').where({
      verificationCode: verificationCode,
      status: 'available' // 餐桌可用
    }).get()

    if (tableResult.data.length === 0) {
      return {
        success: false,
        message: '验证码无效或餐桌已被占用'
      }
    }

    const tableInfo = tableResult.data[0]

    // 检查餐桌容量
    if (peopleCount > tableInfo.maxCapacity) {
      return {
        success: false,
        message: `该餐桌最多容纳${tableInfo.maxCapacity}人，请选择其他餐桌`
      }
    }

    // 更新餐桌状态为已占用
    await db.collection('dining_tables').doc(tableInfo._id).update({
      data: {
        status: 'occupied',
        currentPeople: peopleCount,
        occupiedTime: new Date(),
        remarks: remarks || ''
      }
    })

    // 记录用餐验证记录
    const verificationRecord = {
      verificationCode,
      tableId: tableInfo._id,
      tableName: tableInfo.tableName,
      tableLocation: tableInfo.location,
      diningPeople: peopleCount,
      remarks: remarks || '',
      verifyTime: new Date(verifyTime),
      status: 'verified',
      createTime: new Date()
    }

    const recordResult = await db.collection('dining_verifications').add({
      data: verificationRecord
    })

    // 发送通知（可选）
    // await sendVerificationNotification(verificationRecord)

    return {
      success: true,
      message: '用餐验证成功',
      verificationId: recordResult._id,
      tableInfo: {
        tableName: tableInfo.tableName,
        location: tableInfo.location,
        maxCapacity: tableInfo.maxCapacity,
        currentPeople: peopleCount
      },
      data: verificationRecord
    }

  } catch (error) {
    console.error('用餐验证失败:', error)
    return {
      success: false,
      message: '验证失败: ' + error.message
    }
  }
}

// 发送验证通知函数（可选实现）
async function sendVerificationNotification(verificationRecord) {
  try {
    // 这里可以集成短信、邮件或其他通知服务
    console.log('用餐验证通知:', {
      table: verificationRecord.tableName,
      people: verificationRecord.diningPeople,
      time: verificationRecord.verifyTime,
      message: `餐桌${verificationRecord.tableName}验证成功，用餐人数：${verificationRecord.diningPeople}人`
    })
  } catch (error) {
    console.error('发送通知失败:', error)
  }
}
