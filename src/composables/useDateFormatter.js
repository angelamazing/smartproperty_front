/**
 * 日期格式化组合式API
 * 提供统一的日期处理功能，确保iOS兼容性
 * 
 * @author Linus (致敬内核之父的严谨风格)
 */

import { IOSCompatibleDate } from '@/utils/iosCompatibleDate.js'

export function useDateFormatter() {
  /**
   * 格式化显示日期（今天/明天/具体日期）
   * @param {string} dateStr - 日期字符串
   * @returns {string} 格式化后的显示文本
   */
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return ''
    
    try {
      const targetDate = IOSCompatibleDate.create(dateStr)
      if (!targetDate || isNaN(targetDate.getTime())) return ''
      
      const today = IOSCompatibleDate.create(new Date())
      if (!today || isNaN(today.getTime())) {
        console.warn('无法获取当前日期，使用目标日期格式化')
        return formatDateWithWeekday(targetDate)
      }
      
      const tomorrow = IOSCompatibleDate.create(today)
      if (!tomorrow || isNaN(tomorrow.getTime())) {
        console.warn('无法创建明天日期，使用目标日期格式化')
        return formatDateWithWeekday(targetDate)
      }
      
      tomorrow.setDate(today.getDate() + 1)
      
      // 判断是否为今天或明天
      if (isSameDate(targetDate, today)) {
        return `今天 ${formatDateShort(targetDate)}`
      } else if (isSameDate(targetDate, tomorrow)) {
        return `明天 ${formatDateShort(targetDate)}`
      } else {
        return formatDateWithWeekday(targetDate)
      }
    } catch (error) {
      console.error('日期格式化错误:', error, '输入值:', dateStr)
      return ''
    }
  }
  
  /**
   * 格式化日期为选择器格式
   * @param {Date|string} date - 日期
   * @returns {string} YYYY-MM-DD格式
   */
  const formatDateForPicker = (date) => {
    const dateObj = IOSCompatibleDate.create(date)
    if (!dateObj || isNaN(dateObj.getTime())) {
      return IOSCompatibleDate.today('YYYY-MM-DD')
    }
    return IOSCompatibleDate.format(dateObj, 'YYYY-MM-DD')
  }
  
  /**
   * 添加天数
   * @param {Date|string} date - 基础日期
   * @param {number} days - 要添加的天数
   * @returns {Date} 新日期
   */
  const addDays = (date, days) => {
    const dateObj = IOSCompatibleDate.create(date)
    if (!dateObj || isNaN(dateObj.getTime())) {
      return IOSCompatibleDate.create()
    }
    return IOSCompatibleDate.addDays(dateObj, days)
  }
  
  /**
   * 格式化短日期
   * @param {Date} date - 日期对象
   * @returns {string} MM/DD格式
   */
  const formatDateShort = (date) => {
    if (!date || isNaN(date.getTime())) return ''
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
  }
  
  /**
   * 格式化带星期的日期
   * @param {Date} date - 日期对象
   * @returns {string} MM/DD 星期X格式
   */
  const formatDateWithWeekday = (date) => {
    if (!date || isNaN(date.getTime())) return ''
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = getWeekdayText(date.getDay())
    
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')} ${weekday}`
  }
  
  /**
   * 获取星期文本
   * @param {number} day - 星期几 (0-6)
   * @returns {string} 星期文本
   */
  const getWeekdayText = (day) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[day] || ''
  }
  
  /**
   * 判断是否为同一天
   * @param {Date} date1 - 日期1
   * @param {Date} date2 - 日期2
   * @returns {boolean} 是否同一天
   */
  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false
    return IOSCompatibleDate.isSameDay(date1, date2)
  }
  
  /**
   * 获取今天的日期字符串
   * @param {string} format - 格式，默认为YYYY-MM-DD
   * @returns {string} 今天的日期
   */
  const getToday = (format = 'YYYY-MM-DD') => {
    try {
      const today = IOSCompatibleDate.create(new Date())
      if (today && !isNaN(today.getTime())) {
        return IOSCompatibleDate.format(today, format)
      }
      // 如果IOSCompatibleDate失败，使用原生Date作为fallback
      const fallbackDate = new Date()
      const year = fallbackDate.getFullYear()
      const month = (fallbackDate.getMonth() + 1).toString().padStart(2, '0')
      const day = fallbackDate.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error('获取今天日期失败:', error)
      // 最后的fallback
      const fallbackDate = new Date()
      const year = fallbackDate.getFullYear()
      const month = (fallbackDate.getMonth() + 1).toString().padStart(2, '0')
      const day = fallbackDate.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
  
  /**
   * 获取最小可选日期（今天）
   * @returns {string} 最小日期
   */
  const getMinDate = () => {
    return getToday('YYYY-MM-DD')
  }
  
  /**
   * 获取最大可选日期（30天后）
   * @returns {string} 最大日期
   */
  const getMaxDate = () => {
    try {
      const today = IOSCompatibleDate.create(new Date())
      if (today && !isNaN(today.getTime())) {
        const maxDate = IOSCompatibleDate.addDays(today, 30)
        return IOSCompatibleDate.format(maxDate, 'YYYY-MM-DD')
      }
      
      // 如果IOSCompatibleDate失败，使用原生Date作为fallback
      const fallbackDate = new Date()
      fallbackDate.setDate(fallbackDate.getDate() + 30)
      const year = fallbackDate.getFullYear()
      const month = (fallbackDate.getMonth() + 1).toString().padStart(2, '0')
      const day = fallbackDate.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error('获取最大日期失败:', error)
      // 最后的fallback
      const fallbackDate = new Date()
      fallbackDate.setDate(fallbackDate.getDate() + 30)
      const year = fallbackDate.getFullYear()
      const month = (fallbackDate.getMonth() + 1).toString().padStart(2, '0')
      const day = fallbackDate.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
  
  return {
    formatDisplayDate,
    formatDateForPicker,
    addDays,
    formatDateShort,
    formatDateWithWeekday,
    isSameDate,
    getToday,
    getMinDate,
    getMaxDate
  }
}
