// 获取场地列表云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 获取场地列表
 * @param {Object} event 事件参数
 * @param {string} event.date 查询日期
 * @param {string} event.type 场地类型
 */
exports.main = async (event, context) => {
  const { date, type } = event
  
  try {
    let query = {}
    
    // 按场地类型筛选
    if (type && type !== 'all') {
      query.type = type
    }
    
    // 查询场地基本信息
    const venuesResult = await db.collection('venues')
      .where(query)
      .get()
    
    if (venuesResult.data.length === 0) {
      return []
    }
    
    // 查询指定日期的预约情况
    const reservationsResult = await db.collection('reservations')
      .where({
        reservationDate: date,
        status: db.command.in(['pending', 'confirmed'])
      })
      .get()
    
    // 构建时间段数据
    const timeSlots = [
      { id: 1, startTime: '08:00', endTime: '10:00' },
      { id: 2, startTime: '10:00', endTime: '12:00' },
      { id: 3, startTime: '14:00', endTime: '16:00' },
      { id: 4, startTime: '16:00', endTime: '18:00' },
      { id: 5, startTime: '18:00', endTime: '20:00' },
      { id: 6, startTime: '20:00', endTime: '22:00' }
    ]
    
    // 为每个场地添加时间段状态
    const venues = venuesResult.data.map(venue => {
      const venueReservations = reservationsResult.data.filter(
        res => res.venueId === venue._id
      )
      
      const timeSlotsWithStatus = timeSlots.map(slot => {
        const isReserved = venueReservations.some(res => 
          res.startTime === slot.startTime && res.endTime === slot.endTime
        )
        
        return {
          ...slot,
          status: isReserved ? 'reserved' : 'available'
        }
      })
      
      return {
        ...venue,
        timeSlots: timeSlotsWithStatus
      }
    })
    
    return venues
  } catch (error) {
    console.error('获取场地列表失败:', error)
    throw new Error('获取场地列表失败')
  }
}
