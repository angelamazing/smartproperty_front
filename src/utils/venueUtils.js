/**
 * 球馆预约工具类
 * 提供场地预约相关的工具方法和常量
 */

import { TimeUtils } from './timeUtils.js'

/**
 * 场地类型配置
 */
export const VENUE_TYPES = {
  badminton: {
    label: '羽毛球',
    icon: '🏸',
    color: '#4CAF50',
    value: 'badminton'
  },
  pingpong: {
    label: '乒乓球',
    icon: '🏓',
    color: '#FF9800',
    value: 'pingpong'
  },
  basketball: {
    label: '篮球',
    icon: '🏀',
    color: '#2196F3',
    value: 'basketball'
  },
  meeting: {
    label: '会议室',
    icon: '🏢',
    color: '#9C27B0',
    value: 'meeting'
  },
  other: {
    label: '其他',
    icon: '🏟️',
    color: '#607D8B',
    value: 'other'
  }
}

/**
 * 场地状态配置
 */
export const VENUE_STATUS = {
  open: {
    label: '开放',
    color: '#4CAF50',
    value: 'open'
  },
  closed: {
    label: '关闭',
    color: '#F44336',
    value: 'closed'
  },
  maintenance: {
    label: '维护中',
    color: '#FF9800',
    value: 'maintenance'
  }
}

/**
 * 预约状态配置
 */
export const RESERVATION_STATUS = {
  pending: {
    label: '待审核',
    color: '#FF9800',
    value: 'pending'
  },
  approved: {
    label: '已通过',
    color: '#4CAF50',
    value: 'approved'
  },
  rejected: {
    label: '已拒绝',
    color: '#F44336',
    value: 'rejected'
  },
  cancelled: {
    label: '已取消',
    color: '#9E9E9E',
    value: 'cancelled'
  },
  completed: {
    label: '已完成',
    color: '#2196F3',
    value: 'completed'
  }
}

/**
 * 时间段状态配置
 */
export const TIME_SLOT_STATUS = {
  available: {
    label: '可预约',
    color: '#4CAF50',
    value: 'available'
  },
  booked: {
    label: '已预约',
    color: '#F44336',
    value: 'booked'
  },
  unavailable: {
    label: '不可用',
    color: '#9E9E9E',
    value: 'unavailable'
  },
  maintenance: {
    label: '维护中',
    color: '#FF9800',
    value: 'maintenance'
  }
}

export class VenueUtils {
  /**
   * 获取场地类型信息
   * @param {string} type - 场地类型
   * @returns {Object} 场地类型信息
   */
  static getVenueTypeInfo(type) {
    return VENUE_TYPES[type] || VENUE_TYPES.other
  }

  /**
   * 获取场地状态信息
   * @param {string} status - 场地状态
   * @returns {Object} 场地状态信息
   */
  static getVenueStatusInfo(status) {
    return VENUE_STATUS[status] || VENUE_STATUS.closed
  }

  /**
   * 获取预约状态信息
   * @param {string} status - 预约状态
   * @returns {Object} 预约状态信息
   */
  static getReservationStatusInfo(status) {
    return RESERVATION_STATUS[status] || RESERVATION_STATUS.pending
  }

  /**
   * 获取时间段状态信息
   * @param {string} status - 时间段状态
   * @returns {Object} 时间段状态信息
   */
  static getTimeSlotStatusInfo(status) {
    return TIME_SLOT_STATUS[status] || TIME_SLOT_STATUS.unavailable
  }

  /**
   * 生成时间段列表
   * @param {string} openTime - 开放时间 (HH:mm)
   * @param {string} closeTime - 关闭时间 (HH:mm)
   * @param {number} slotDuration - 时间段长度（小时）
   * @param {Array} bookedSlots - 已预约时间段
   * @returns {Array} 时间段列表
   */
  static generateTimeSlots(openTime, closeTime, slotDuration = 1, bookedSlots = []) {
    const slots = []
    const openHour = parseInt(openTime.split(':')[0])
    const closeHour = parseInt(closeTime.split(':')[0])
    
    for (let hour = openHour; hour < closeHour; hour += slotDuration) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endHour = Math.min(hour + slotDuration, closeHour)
      const endTime = `${endHour.toString().padStart(2, '0')}:00`
      
      // 检查是否被预约
      const isBooked = bookedSlots.some(booked => {
        const bookedStart = parseInt(booked.startTime.split(':')[0])
        const bookedEnd = parseInt(booked.endTime.split(':')[0])
        return hour >= bookedStart && hour < bookedEnd
      })
      
      slots.push({
        id: `${hour}-${endHour}`,
        startTime,
        endTime,
        status: isBooked ? 'booked' : 'available',
        duration: slotDuration
      })
    }
    
    return slots
  }

  /**
   * 检查时间段是否可用
   * @param {string} startTime - 开始时间
   * @param {string} endTime - 结束时间
   * @param {Array} bookedSlots - 已预约时间段
   * @returns {boolean} 是否可用
   */
  static isTimeSlotAvailable(startTime, endTime, bookedSlots = []) {
    const startHour = parseInt(startTime.split(':')[0])
    const endHour = parseInt(endTime.split(':')[0])
    
    return !bookedSlots.some(booked => {
      const bookedStart = parseInt(booked.startTime.split(':')[0])
      const bookedEnd = parseInt(booked.endTime.split(':')[0])
      return (startHour < bookedEnd && endHour > bookedStart)
    })
  }

  /**
   * 格式化价格显示
   * @param {string|number} price - 价格
   * @returns {string} 格式化后的价格
   */
  static formatPrice(price) {
    const numPrice = parseFloat(price)
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
  }

  /**
   * 计算预约费用
   * @param {string|number} pricePerHour - 每小时价格
   * @param {number} duration - 预约时长（小时）
   * @returns {number} 总费用
   */
  static calculateCost(pricePerHour, duration) {
    const price = parseFloat(pricePerHour)
    const hours = parseFloat(duration)
    return isNaN(price) || isNaN(hours) ? 0 : price * hours
  }

  /**
   * 验证预约时间
   * @param {string} date - 预约日期
   * @param {string} startTime - 开始时间
   * @param {string} endTime - 结束时间
   * @param {Object} venue - 场地信息
   * @returns {Object} 验证结果
   */
  static validateReservationTime(date, startTime, endTime, venue) {
    const now = new Date()
    const reservationDate = new Date(date)
    const reservationDateTime = new Date(`${date} ${startTime}`)
    
    // 检查日期是否有效
    if (reservationDate < now) {
      return {
        valid: false,
        message: '预约日期不能早于今天'
      }
    }
    
    // 检查时间是否在开放时间内
    const startHour = parseInt(startTime.split(':')[0])
    const endHour = parseInt(endTime.split(':')[0])
    const openHour = parseInt(venue.openTime.split(':')[0])
    const closeHour = parseInt(venue.closeTime.split(':')[0])
    
    if (startHour < openHour || endHour > closeHour) {
      return {
        valid: false,
        message: `预约时间必须在 ${venue.openTime} - ${venue.closeTime} 之间`
      }
    }
    
    // 检查预约时长
    const duration = endHour - startHour
    if (duration < venue.minBookingHours) {
      return {
        valid: false,
        message: `预约时长不能少于 ${venue.minBookingHours} 小时`
      }
    }
    
    if (duration > venue.maxBookingHours) {
      return {
        valid: false,
        message: `预约时长不能超过 ${venue.maxBookingHours} 小时`
      }
    }
    
    // 检查提前预约天数
    const daysDiff = Math.ceil((reservationDate - now) / (1000 * 60 * 60 * 24))
    if (daysDiff > venue.advanceBookingDays) {
      return {
        valid: false,
        message: `最多只能提前 ${venue.advanceBookingDays} 天预约`
      }
    }
    
    return {
      valid: true,
      message: '时间验证通过'
    }
  }

  /**
   * 格式化预约时间显示
   * @param {string} date - 日期
   * @param {string} startTime - 开始时间
   * @param {string} endTime - 结束时间
   * @returns {string} 格式化后的时间显示
   */
  static formatReservationTime(date, startTime, endTime) {
    const formattedDate = TimeUtils.formatTime(date, 'YYYY-MM-DD')
    return `${formattedDate} ${startTime}-${endTime}`
  }

  /**
   * 获取场地类型选项
   * @returns {Array} 场地类型选项
   */
  static getVenueTypeOptions() {
    return Object.values(VENUE_TYPES)
  }

  /**
   * 获取预约状态选项
   * @returns {Array} 预约状态选项
   */
  static getReservationStatusOptions() {
    return Object.values(RESERVATION_STATUS)
  }

  /**
   * 检查场地是否需要审批
   * @param {Object} venue - 场地信息
   * @returns {boolean} 是否需要审批
   */
  static requiresApproval(venue) {
    return venue.requireApproval === 1
  }

  /**
   * 检查场地是否允许取消
   * @param {Object} venue - 场地信息
   * @returns {boolean} 是否允许取消
   */
  static allowsCancellation(venue) {
    return venue.allowCancellation === 1
  }

  /**
   * 获取场地状态文本
   * @param {string} status - 场地状态
   * @returns {string} 状态文本
   */
  static getVenueStatusText(status) {
    return this.getVenueStatusInfo(status).label
  }

  /**
   * 获取场地类型文本
   * @param {string} type - 场地类型
   * @returns {string} 类型文本
   */
  static getVenueTypeText(type) {
    return this.getVenueTypeInfo(type).label
  }

  /**
   * 获取场地类型图标
   * @param {string} type - 场地类型
   * @returns {string} 类型图标
   */
  static getVenueTypeIcon(type) {
    return this.getVenueTypeInfo(type).icon
  }

  /**
   * 获取预约状态文本
   * @param {string} status - 预约状态
   * @returns {string} 状态文本
   */
  static getReservationStatusText(status) {
    return this.getReservationStatusInfo(status).label
  }

  /**
   * 获取时间段状态文本
   * @param {string} status - 时间段状态
   * @returns {string} 状态文本
   */
  static getTimeSlotStatusText(status) {
    return this.getTimeSlotStatusInfo(status).label
  }
}

export default VenueUtils
