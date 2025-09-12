// 获取用户统计数据云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 获取用户统计数据
 * @param {Object} event 事件参数
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const userId = wxContext.OPENID
    
    if (!userId) {
      return {
        success: false,
        message: '用户未登录'
      }
    }
    
    // 并行查询各项统计数据
    const [diningCount, reservationCount, verificationCount] = await Promise.all([
      // 报餐次数
      db.collection('dining_orders')
        .where({
          userId: userId,
          status: db.command.in(['confirmed', 'completed'])
        })
        .count(),
      
      // 预约次数
      db.collection('reservations')
        .where({
          userId: userId,
          status: db.command.in(['confirmed', 'completed'])
        })
        .count(),
      
      // 验证次数
      db.collection('dining_verifications')
        .where({
          verifierId: userId,
          status: 'verified'
        })
        .count()
    ])
    
    return {
      success: true,
      diningCount: diningCount.total,
      reservationCount: reservationCount.total,
      verificationCount: verificationCount.total
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    return {
      success: false,
      message: '获取统计数据失败',
      diningCount: 0,
      reservationCount: 0,
      verificationCount: 0
    }
  }
}
