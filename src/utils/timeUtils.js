/**
 * 前端时间处理工具类
 * 统一处理从后端接收的UTC时间，并转换为北京时间显示
 * 
 * 核心原则：
 * 1. 后端返回：所有时间字段都是UTC时间（ISO 8601格式）
 * 2. 前端显示：统一转换为北京时间显示
 * 3. 前端提交：将北京时间转换为UTC时间提交给后端
 * 4. 工具类：使用统一的时间处理工具类，禁止直接使用原生Date对象
 * 
 * 时间格式约定：
 * - API返回格式：2024-01-15T10:30:00.000Z（UTC时间）
 * - 前端显示格式：2024-01-15 18:30:00（北京时间）
 * - 前端提交格式：2024-01-15T10:30:00.000Z（UTC时间）
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/zh-cn';

// 配置插件
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('zh-cn');

/**
 * 前端时间处理工具类
 * 统一处理从后端接收的UTC时间，并转换为北京时间显示
 */
export class TimeUtils {
  /**
   * 解析时间字符串或Date对象为dayjs对象（iOS兼容版本）
   * @param {string|Date} timeString - 时间字符串或Date对象
   * @returns {dayjs|null} dayjs对象，如果输入无效则返回null
   */
  static parseTime(timeString) {
    if (!timeString) return null;
    
    try {
      // 如果传入的是Date对象，直接转换为dayjs对象
      if (timeString instanceof Date) {
        return dayjs(timeString);
      }
      
      // 如果传入的不是字符串，先转换为字符串
      if (typeof timeString !== 'string') {
        timeString = String(timeString);
      }
      
      // 处理iOS不兼容的日期格式
      let cleanTimeString = timeString.trim();
      
      // 处理 "9/12/2025, 2:02:03 PM" 这种格式（iOS不兼容）
      if (cleanTimeString.includes(',') && (cleanTimeString.includes('AM') || cleanTimeString.includes('PM'))) {
        // 将 "9/12/2025, 2:02:03 PM" 转换为 "2025-09-12T14:02:03"
        const match = cleanTimeString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM)/i);
        if (match) {
          let [, month, day, year, hour, minute, second, ampm] = match;
          
          // 转换AM/PM为24小时制
          let hour24 = parseInt(hour);
          if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
            hour24 += 12;
          } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
            hour24 = 0;
          }
          
          // 补零
          month = month.padStart(2, '0');
          day = day.padStart(2, '0');
          hour = hour24.toString().padStart(2, '0');
          minute = minute.padStart(2, '0');
          second = second.padStart(2, '0');
          
          cleanTimeString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
        }
      }
      
      // 处理 "9/12/2025, 2:02:03 PM" 格式（没有秒数的情况）
      else if (cleanTimeString.includes(',') && (cleanTimeString.includes('AM') || cleanTimeString.includes('PM'))) {
        const match = cleanTimeString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2})\s*(AM|PM)/i);
        if (match) {
          let [, month, day, year, hour, minute, ampm] = match;
          
          // 转换AM/PM为24小时制
          let hour24 = parseInt(hour);
          if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
            hour24 += 12;
          } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
            hour24 = 0;
          }
          
          // 补零
          month = month.padStart(2, '0');
          day = day.padStart(2, '0');
          hour = hour24.toString().padStart(2, '0');
          minute = minute.padStart(2, '0');
          
          cleanTimeString = `${year}-${month}-${day}T${hour}:${minute}:00`;
        }
      }
      
      // 处理其他iOS不兼容的格式
      else if (cleanTimeString.includes('/') && !cleanTimeString.includes('T')) {
        // 将 "MM/DD/YYYY" 转换为 "YYYY-MM-DD"
        const dateMatch = cleanTimeString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (dateMatch) {
          const [, month, day, year] = dateMatch;
          cleanTimeString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      // 处理 "MM/DD/YYYY HH:mm:ss" 格式
      else if (cleanTimeString.includes('/') && cleanTimeString.includes(' ')) {
        const match = cleanTimeString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
        if (match) {
          const [, month, day, year, hour, minute, second] = match;
          cleanTimeString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
        }
      }
      
      // 确保格式符合iOS要求
      if (cleanTimeString.includes(' ') && !cleanTimeString.includes('T')) {
        // 将空格替换为T，确保ISO格式
        cleanTimeString = cleanTimeString.replace(' ', 'T');
      }
      
      // 如果没有时区信息，添加Z表示UTC
      if (!cleanTimeString.includes('Z') && !cleanTimeString.includes('+') && !cleanTimeString.includes('-', 10)) {
        cleanTimeString += 'Z';
      }
      
      // 使用dayjs解析，避免直接使用new Date()
      const parsed = dayjs(cleanTimeString);
      return parsed.isValid() ? parsed : null;
    } catch (error) {
      console.error('时间解析错误:', error, '原始字符串:', timeString);
      return null;
    }
  }

  /**
   * 格式化UTC时间为北京时间字符串
   * @param {string|Date} time - UTC时间字符串或Date对象
   * @param {string} format - 格式类型
   * @returns {string} 格式化后的北京时间字符串
   */
  static formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!time) return '';
    
    try {
      // 解析时间字符串
      const parsedTime = this.parseTime(time);
      if (!parsedTime || !parsedTime.isValid()) {
        console.warn('时间解析失败:', time);
        return '--';
      }
      
      // 使用安全的时区转换方法，避免iOS兼容性问题
      return this.safeTimezoneFormat(parsedTime, format);
    } catch (error) {
      console.error('时间格式化错误:', error, '原始时间:', time);
      return '--';
    }
  }

  /**
   * 安全的时区转换方法（iOS兼容版本）
   * @param {dayjs} dayjsTime - dayjs时间对象
   * @param {string} format - 格式
   * @returns {string} 格式化后的时间字符串
   */
  static safeTimezoneFormat(dayjsTime, format = 'YYYY-MM-DD HH:mm:ss') {
    try {
      // 先尝试使用timezone插件
      if (dayjsTime.tz) {
        return dayjsTime.tz('Asia/Shanghai').format(format);
      }
      
      // 如果timezone插件不可用，使用utcOffset方法
      return dayjsTime.utcOffset(8).format(format);
    } catch (error) {
      console.warn('时区转换失败，使用默认方法:', error);
      // 最后的备用方案：直接格式化
      return dayjsTime.format(format);
    }
  }

  /**
   * 将UTC时间转换为北京时间显示（按照文档要求）
   * @param {string|Date} utcTimeString - UTC时间字符串或Date对象 (格式: 2025-09-12T08:21:00.000Z)
   * @param {string} format - 显示格式 ('datetime' | 'date' | 'time')
   * @returns {string} 格式化的北京时间字符串
   */
  static formatUTCTime(utcTimeString, format = 'datetime') {
    if (!utcTimeString) return '-';
    
    try {
      const utcTime = this.parseTime(utcTimeString);
      if (!utcTime || !utcTime.isValid()) {
        console.warn('UTC时间解析失败:', utcTimeString);
        return '-';
      }
      
      // 使用安全的时区转换方法
      const beijingTime = this.safeTimezoneFormat(utcTime, 'YYYY-MM-DD HH:mm:ss');
      
      switch (format) {
        case 'date':
          return beijingTime.split(' ')[0];
        case 'time':
          return beijingTime.split(' ')[1];
        default:
          return beijingTime;
      }
    } catch (error) {
      console.error('UTC时间转换错误:', error, '原始时间:', utcTimeString);
      return '-';
    }
  }

  /**
   * 获取相对时间（如：3分钟前、2小时前）
   * @param {string|Date} time - UTC时间字符串或Date对象
   * @returns {string} 相对时间字符串
   */
  static getRelativeTime(time) {
    if (!time) return '';
    return dayjs(time).fromNow();
  }

  /**
   * 将北京时间转换为UTC时间用于提交给后端
   * @param {string|Date} beijingTime - 北京时间
   * @returns {string} ISO 8601格式的UTC时间字符串
   */
  static toUTCForSubmit(beijingTime) {
    if (!beijingTime) return '';
    // 判断输入是否为日期时间字符串
    if (typeof beijingTime === 'string') {
      // 尝试解析不同格式的日期时间
      let parsed;
      if (beijingTime.includes('T')) {
        // ISO格式字符串
        parsed = dayjs(beijingTime);
      } else if (beijingTime.includes(' ')) {
        // YYYY-MM-DD HH:mm:ss格式
        parsed = dayjs(beijingTime, 'YYYY-MM-DD HH:mm:ss');
      } else if (beijingTime.length === 10) {
        // YYYY-MM-DD格式
        parsed = dayjs(beijingTime, 'YYYY-MM-DD');
      } else {
        // 其他格式，尝试自动解析
        parsed = dayjs(beijingTime);
      }
      
      if (parsed.isValid()) {
        // 转换为UTC时间
        return parsed.utc().toISOString();
      }
      return '';
    }
    
    // 如果是Date对象，直接转换
    return dayjs(beijingTime).utc().toISOString();
  }

  /**
   * 获取当前日期字符串（YYYY-MM-DD格式）
   * @returns {string} 当前日期
   */
  static getCurrentDate() {
    return this.safeTimezoneFormat(dayjs(), 'YYYY-MM-DD');
  }

  /**
   * 获取当前时间字符串（HH:mm格式）
   * @returns {string} 当前时间
   */
  static getCurrentTime() {
    return this.safeTimezoneFormat(dayjs(), 'HH:mm');
  }

  /**
   * 验证时间格式是否有效
   * @param {string} timeString - 时间字符串
   * @returns {boolean} 是否有效
   */
  static isValidTime(timeString) {
    if (!timeString) return false;
    return dayjs(timeString).isValid();
  }

  /**
   * 计算两个时间之间的差值（分钟）
   * @param {string|Date} startTime - 开始时间
   * @param {string|Date} endTime - 结束时间
   * @returns {number} 时间差（分钟）
   */
  static getTimeDiff(startTime, endTime) {
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    
    if (!start || !end) return 0;
    
    return end.diff(start, 'minute');
  }

  /**
   * 检查日期是否为今天
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为今天
   */
  static isToday(date) {
    if (!date) return false;
    const targetDate = this.parseTime(date);
    const today = dayjs();
    
    return targetDate && targetDate.isSame(today, 'day');
  }

  /**
   * 检查日期是否为过去
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为过去
   */
  static isPastDate(date) {
    if (!date) return false;
    const targetDate = this.parseTime(date);
    const today = dayjs().startOf('day');
    
    return targetDate && targetDate.isBefore(today);
  }

  /**
   * 检查日期是否为未来
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为未来
   */
  static isFutureDate(date) {
    if (!date) return false;
    const targetDate = this.parseTime(date);
    const today = dayjs().endOf('day');
    
    return targetDate && targetDate.isAfter(today);
  }

  /**
   * 安全的时间格式化，包含错误处理
   * @param {string|Date} time - 时间
   * @param {string} format - 格式
   * @returns {string} 格式化后的时间字符串或占位符
   */
  static safeFormatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
    try {
      if (!time) return '--';
      if (!this.isValidTime(time)) return '无效时间';
      return this.formatTime(time, format);
    } catch (error) {
      console.error('时间格式化错误:', error);
      return '--';
    }
  }

  /**
   * 处理不同时区的时间显示（iOS兼容版本）
   * @param {string|Date} time - 时间
   * @param {string} timezone - 时区，默认Asia/Shanghai
   * @param {string} format - 格式
   * @returns {string} 格式化后的时间字符串
   */
  static formatTimeWithTimezone(time, timezone = 'Asia/Shanghai', format = 'YYYY-MM-DD HH:mm:ss') {
    try {
      if (!time) return '--';
      
      // 使用dayjs处理时区转换，避免iOS兼容性问题
      const dayjsTime = this.parseTime(time);
      if (!dayjsTime || !dayjsTime.isValid()) {
        return this.safeFormatTime(time, format);
      }
      
      return this.safeTimezoneFormat(dayjsTime, format);
    } catch (error) {
      console.error('时区转换错误:', error);
      return this.safeFormatTime(time, format);
    }
  }

  /**
   * 获取指定日期的开始时间（00:00:00）
   * @param {string|Date} date - 日期
   * @returns {string} 该日期开始时间的UTC字符串
   */
  static getDayStartTime(date) {
    if (!date) return '';
    const targetDate = dayjs(date);
    if (!targetDate.isValid()) return '';
    
    return targetDate.startOf('day').utc().toISOString();
  }

  /**
   * 获取指定日期的结束时间（23:59:59）
   * @param {string|Date} date - 日期
   * @returns {string} 该日期结束时间的UTC字符串
   */
  static getDayEndTime(date) {
    if (!date) return '';
    const targetDate = dayjs(date);
    if (!targetDate.isValid()) return '';
    
    return targetDate.endOf('day').utc().toISOString();
  }

  /**
   * 获取指定日期的前一天
   * @param {string|Date} date - 日期
   * @param {string} format - 返回格式
   * @returns {string} 前一天的日期字符串
   */
  static getPreviousDay(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    const targetDate = this.parseTime(date);
    
    return targetDate ? targetDate.subtract(1, 'day').format(format) : '';
  }

  /**
   * 获取指定日期的后一天（或指定天数后）
   * @param {string|Date} date - 日期
   * @param {string|number} formatOrDays - 返回格式或天数
   * @param {string} format - 返回格式（当第二个参数是数字时使用）
   * @returns {string} 后一天的日期字符串
   */
  static getNextDay(date, formatOrDays = 'YYYY-MM-DD', format = 'YYYY-MM-DD') {
    if (!date) return '';
    const targetDate = this.parseTime(date);
    
    if (!targetDate) return '';
    
    // 如果第二个参数是数字，表示要增加的天数
    if (typeof formatOrDays === 'number') {
      return targetDate.add(formatOrDays, 'day').format(format);
    }
    
    // 否则第二个参数是格式
    return targetDate.add(1, 'day').format(formatOrDays);
  }

  /**
   * 获取日期范围数组
   * @param {string|Date} startDate - 开始日期
   * @param {string|Date} endDate - 结束日期
   * @param {string} format - 返回格式
   * @returns {string[]} 日期数组
   */
  static getDateRange(startDate, endDate, format = 'YYYY-MM-DD') {
    const start = this.parseTime(startDate);
    const end = this.parseTime(endDate);
    
    if (!start || !end || start.isAfter(end)) return [];
    
    const dates = [];
    let current = start;
    
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format(format));
      current = current.add(1, 'day');
    }
    
    return dates;
  }

  /**
   * 获取时间状态信息
   * @param {string|Date} time - 时间
   * @returns {Object} 时间状态对象 {status, text, color}
   */
  static getTimeStatus(time) {
    if (!time) return { status: 'invalid', text: '--', color: 'gray' };
    
    const targetTime = this.parseTime(time);
    const now = dayjs();
    const diff = now.diff(targetTime, 'minute');
    
    if (diff < 5) return { status: 'new', text: '刚刚', color: 'green' };
    if (diff < 30) return { status: 'recent', text: `${diff}分钟前`, color: 'blue' };
    if (diff < 60) return { status: 'old', text: `${Math.floor(diff / 60)}小时前`, color: 'orange' };
    if (diff < 1440) return { status: 'very-old', text: `${Math.floor(diff / 1440)}天前`, color: 'red' };
    
    return { status: 'past', text: this.formatTime(time, 'YYYY-MM-DD'), color: 'gray' };
  }

  // ==================== 兼容性方法 ====================
  // 为了保持向后兼容，保留原有的一些方法名和功能

  /**
   * 获取北京时间（兼容性方法）
   * @param {string|Date} timeString - 时间字符串或Date对象
   * @returns {Date} 北京时间
   */
  static getBeijingTime(timeString = null) {
    if (timeString) {
      const parsed = this.parseTime(timeString);
      return parsed ? parsed.toDate() : dayjs().toDate();
    } else {
      return dayjs().toDate();
    }
  }

  /**
   * 格式化日期 (YYYY-MM-DD)（兼容性方法）
   * @param {string|Date} timeString - 时间字符串
   * @returns {string} 格式化后的日期
   */
  static formatDate(timeString) {
    return this.formatTime(timeString, 'YYYY-MM-DD');
  }

  /**
   * 格式化时间 (HH:mm)（兼容性方法）
   * @param {string|Date} timeString - 时间字符串
   * @returns {string} 格式化后的时间
   */
  static formatTimeOnly(timeString) {
    return this.formatTime(timeString, 'HH:mm');
  }

  /**
   * 格式化日期时间 (YYYY-MM-DD HH:mm)（兼容性方法）
   * @param {string|Date} timeString - 时间字符串
   * @returns {string} 格式化后的日期时间
   */
  static formatDateTime(timeString) {
    return this.formatTime(timeString, 'YYYY-MM-DD HH:mm');
  }

  /**
   * 格式化完整日期时间 (YYYY-MM-DD HH:mm:ss)（兼容性方法）
   * @param {string|Date} timeString - 时间字符串
   * @returns {string} 格式化后的完整日期时间
   */
  static formatFullDateTime(timeString) {
    return this.formatTime(timeString, 'YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 格式化简短日期时间 (MM-DD HH:mm)（兼容性方法）
   * @param {string|Date} timeString - 时间字符串
   * @returns {string} 格式化后的简短日期时间
   */
  static formatShortDateTime(timeString) {
    return this.formatTime(timeString, 'MM-DD HH:mm');
  }

  /**
   * 格式化相对时间（兼容性方法）
   * @param {string|Date} timeString - 时间字符串
   * @returns {string} 相对时间字符串
   */
  static formatRelativeTime(timeString) {
    return this.getRelativeTime(timeString);
  }

  /**
   * 计算时间差（兼容性方法）
   * @param {string|Date} startTime - 开始时间
   * @param {string|Date} endTime - 结束时间
   * @returns {Object} 时间差对象
   */
  static getTimeDifference(startTime, endTime) {
    try {
      const start = this.parseTime(startTime);
      const end = this.parseTime(endTime);
      
      if (!start || !end) return null;
      
      const diff = end.diff(start);
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      return {
        total: diff,
        days,
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60
      };
    } catch (error) {
      console.error('计算时间差失败:', error);
      return null;
    }
  }

  /**
   * 获取当前时间戳（兼容性方法）
   * @returns {string} 当前时间戳
   */
  static getCurrentTimestamp() {
    return dayjs().toISOString();
  }

  /**
   * 安全创建Date对象（iOS兼容版本）
   * @param {string|Date|number} timeInput - 时间输入
   * @returns {Date|null} Date对象，如果无效则返回null
   */
  static safeCreateDate(timeInput) {
    if (!timeInput) return null;
    
    try {
      // 如果已经是Date对象，直接返回
      if (timeInput instanceof Date) {
        return isNaN(timeInput.getTime()) ? null : timeInput;
      }
      
      // 如果是数字，使用dayjs创建Date对象
      if (typeof timeInput === 'number') {
        const dayjsTime = dayjs(timeInput);
        return dayjsTime.isValid() ? dayjsTime.toDate() : null;
      }
      
      // 如果是字符串，先通过dayjs解析再转换
      const dayjsTime = this.parseTime(timeInput);
      if (!dayjsTime || !dayjsTime.isValid()) {
        return null;
      }
      
      return dayjsTime.toDate();
    } catch (error) {
      console.error('安全创建Date对象失败:', error, '输入:', timeInput);
      return null;
    }
  }

  /**
   * 将yyyy-MM-dd HH:mm:ss格式的日期字符串替换成yyyy/MM/dd HH:mm:ss格式
   * @param {string} dateString - yyyy-MM-dd HH:mm:ss格式的日期字符串
   * @returns {string} yyyy/MM/dd HH:mm:ss格式的日期字符串
   */
  static convertToIOSFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return dateString;
    }
    
    // 将 yyyy-MM-dd HH:mm:ss 格式转换为 yyyy/MM/dd HH:mm:ss 格式
    return dateString.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3');
  }

  /**
   * 将yyyy/MM/dd HH:mm:ss格式的日期字符串替换成yyyy-MM-dd HH:mm:ss格式
   * @param {string} dateString - yyyy/MM/dd HH:mm:ss格式的日期字符串
   * @returns {string} yyyy-MM-dd HH:mm:ss格式的日期字符串
   */
  static convertFromIOSFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return dateString;
    }
    
    // 将 yyyy/MM/dd HH:mm:ss 格式转换为 yyyy-MM-dd HH:mm:ss 格式
    return dateString.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3');
  }

  /**
   * 格式化时间为iOS兼容格式（yyyy/MM/dd HH:mm:ss）
   * @param {string|Date} time - 时间字符串或Date对象
   * @returns {string} iOS兼容格式的时间字符串
   */
  static formatForIOS(time) {
    if (!time) return '';
    
    try {
      const parsedTime = this.parseTime(time);
      if (!parsedTime || !parsedTime.isValid()) {
        return '';
      }
      
      // 先格式化为标准格式，然后转换为iOS格式
      const standardFormat = this.safeTimezoneFormat(parsedTime, 'YYYY-MM-DD HH:mm:ss');
      return this.convertToIOSFormat(standardFormat);
    } catch (error) {
      console.error('iOS格式转换错误:', error, '原始时间:', time);
      return '';
    }
  }

  /**
   * 创建当前时间的Date对象（iOS兼容版本）
   * @returns {Date} 当前时间的Date对象
   */
  static createCurrentDate() {
    return dayjs().toDate();
  }

  /**
   * 创建指定时间的Date对象（iOS兼容版本）
   * @param {string|Date|number} timeInput - 时间输入
   * @returns {Date|null} Date对象，如果无效则返回null
   */
  static createDate(timeInput) {
    return this.safeCreateDate(timeInput);
  }

  /**
   * 获取当前时间（Date对象，iOS兼容）
   * @returns {Date} 当前时间的Date对象
   */
  static getCurrentDateObject() {
    return dayjs().toDate();
  }

  /**
   * 格式化日期为iOS兼容的字符串
   * @param {string|Date} date - 日期
   * @param {string} format - 格式，默认为'YYYY-MM-DD'
   * @returns {string} 格式化后的日期字符串
   */
  static formatDateForIOS(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    const dayjsTime = this.parseTime(date);
    if (!dayjsTime || !dayjsTime.isValid()) {
      return '';
    }
    
    return dayjsTime.format(format);
  }

  /**
   * 获取今天的日期（兼容性方法）
   * @returns {string} 今天的日期 (YYYY-MM-DD)
   */
  static getToday() {
    return this.getCurrentDate();
  }

  /**
   * 获取明天的日期（兼容性方法）
   * @returns {string} 明天的日期 (YYYY-MM-DD)
   */
  static getTomorrow() {
    return this.getNextDay(this.getCurrentDate());
  }

  /**
   * 获取昨天的日期（兼容性方法）
   * @returns {string} 昨天的日期 (YYYY-MM-DD)
   */
  static getYesterday() {
    return this.getPreviousDay(this.getCurrentDate());
  }

  /**
   * 检查是否为昨天（兼容性方法）
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为昨天
   */
  static isYesterday(date) {
    if (!date) return false;
    const targetDate = this.parseTime(date);
    const yesterday = dayjs().subtract(1, 'day');
    
    return targetDate && targetDate.isSame(yesterday, 'day');
  }

  /**
   * 检查是否为明天（兼容性方法）
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为明天
   */
  static isTomorrow(date) {
    if (!date) return false;
    const targetDate = this.parseTime(date);
    const tomorrow = dayjs().add(1, 'day');
    
    return targetDate && targetDate.isSame(tomorrow, 'day');
  }

  /**
   * 格式化时间用于显示（智能选择格式）（兼容性方法）
   * @param {string|Date} timeString - 时间字符串
   * @returns {string} 格式化后的时间
   */
  static formatForDisplay(timeString) {
    if (!timeString) return '';
    
    try {
      if (this.isToday(timeString)) {
        return `今天 ${this.formatTimeOnly(timeString)}`;
      } else if (this.isYesterday(timeString)) {
        return `昨天 ${this.formatTimeOnly(timeString)}`;
      } else if (this.isTomorrow(timeString)) {
        return `明天 ${this.formatTimeOnly(timeString)}`;
      } else {
        return this.formatShortDateTime(timeString);
      }
    } catch (error) {
      console.error('时间显示格式化失败:', error);
      return timeString;
    }
  }

  /**
   * 格式化时间用于表格显示（兼容性方法）
   * @param {string|Date} timeString - 时间字符串
   * @returns {Object} 包含显示文本和完整时间的对象
   */
  static formatForTable(timeString) {
    if (!timeString) return { display: '', full: '' };
    
    try {
      const display = this.formatForDisplay(timeString);
      const full = this.formatFullDateTime(timeString);
      
      return { display, full };
    } catch (error) {
      console.error('表格时间格式化失败:', error);
      return { display: timeString, full: timeString };
    }
  }

  /**
   * 获取当前北京时间（兼容性方法）
   * @returns {Date} 北京时间
   */
  static getCurrentBeijingTime() {
    return this.getBeijingTime();
  }

  // ==================== 业务相关方法 ====================

  /**
   * 格式化报餐时间显示
   * @param {string} utcTimeString - UTC时间字符串
   * @returns {string} 格式化的报餐时间
   */
  static formatRegisterTime(utcTimeString) {
    return this.formatUTCTime(utcTimeString, 'datetime');
  }

  /**
   * 格式化就餐时间显示
   * @param {string} utcTimeString - UTC时间字符串
   * @returns {string} 格式化的就餐时间
   */
  static formatDiningTime(utcTimeString) {
    return this.formatUTCTime(utcTimeString, 'datetime');
  }

  /**
   * 格式化扫码时间显示
   * @param {string} utcTimeString - UTC时间字符串
   * @returns {string} 格式化的扫码时间
   */
  static formatScanTime(utcTimeString) {
    return this.formatUTCTime(utcTimeString, 'datetime');
  }

  /**
   * 格式化确认时间显示
   * @param {string} utcTimeString - UTC时间字符串
   * @returns {string} 格式化的确认时间
   */
  static formatConfirmTime(utcTimeString) {
    return this.formatUTCTime(utcTimeString, 'datetime');
  }

  /**
   * 格式化创建时间显示
   * @param {string} utcTimeString - UTC时间字符串
   * @returns {string} 格式化的创建时间
   */
  static formatCreateTime(utcTimeString) {
    return this.formatUTCTime(utcTimeString, 'datetime');
  }

  /**
   * 格式化更新时间显示
   * @param {string} utcTimeString - UTC时间字符串
   * @returns {string} 格式化的更新时间
   */
  static formatUpdateTime(utcTimeString) {
    return this.formatUTCTime(utcTimeString, 'datetime');
  }

  /**
   * 检查是否在就餐时间内
   * @param {string} mealType - 餐次类型 (breakfast/lunch/dinner)
   * @returns {Object} 检查结果
   */
  static checkMealTime(mealType) {
    const now = dayjs();
    const currentHour = now.hour();
    
    const mealTimeRanges = {
      'breakfast': { start: 6, end: 10, name: '早餐' },
      'lunch': { start: 11, end: 14, name: '午餐' },
      'dinner': { start: 17, end: 20, name: '晚餐' }
    }

    const timeRange = mealTimeRanges[mealType];
    if (!timeRange) {
      return { 
        valid: false, 
        message: '无效的餐次类型',
        currentTime: now.format('HH:mm'),
        timeRange: '--:--'
      }
    }

    const isValid = currentHour >= timeRange.start && currentHour <= timeRange.end;
    
    return {
      valid: isValid,
      message: isValid 
        ? `当前时间可以确认${timeRange.name}就餐`
        : `当前时间不在${timeRange.name}就餐时间内 (${timeRange.start}:00-${timeRange.end}:00)`,
      currentTime: now.format('HH:mm'),
      timeRange: `${timeRange.start}:00-${timeRange.end}:00`
    }
  }

  /**
   * 获取餐次信息
   * @param {string} mealType - 餐次类型
   * @returns {Object} 餐次信息
   */
  static getMealInfo(mealType) {
    const mealTypes = {
      'breakfast': { name: '早餐', order: 1, icon: '🌅' },
      'lunch': { name: '午餐', order: 2, icon: '☀️' },
      'dinner': { name: '晚餐', order: 3, icon: '🌙' }
    }
    
    return mealTypes[mealType] || { name: '未知餐次', order: 0, icon: '❓' }
  }

  /**
   * 获取当前餐次
   * @returns {string|null} 当前餐次类型
   */
  static getCurrentMealType() {
    const now = dayjs();
    const currentHour = now.hour();
    
    if (currentHour >= 6 && currentHour <= 10) {
      return 'breakfast'
    } else if (currentHour >= 11 && currentHour <= 14) {
      return 'lunch'
    } else if (currentHour >= 17 && currentHour <= 20) {
      return 'dinner'
    }
    
    return null
  }

  /**
   * 获取下一个餐次
   * @returns {Object} 下一个餐次信息
   */
  static getNextMeal() {
    const now = dayjs();
    const currentHour = now.hour();
    
    if (currentHour < 6) {
      return { type: 'breakfast', name: '早餐', time: '06:00', hoursLeft: 6 - currentHour }
    } else if (currentHour < 11) {
      return { type: 'lunch', name: '午餐', time: '11:00', hoursLeft: 11 - currentHour }
    } else if (currentHour < 17) {
      return { type: 'dinner', name: '晚餐', time: '17:00', hoursLeft: 17 - currentHour }
    } else {
      // 明天早餐
      const tomorrow = now.add(1, 'day').hour(6).minute(0).second(0).millisecond(0);
      const hoursLeft = Math.ceil(tomorrow.diff(now, 'hour', true));
      return { type: 'breakfast', name: '早餐', time: '06:00', hoursLeft }
    }
  }

  /**
   * 格式化餐次时间显示
   * @param {string} mealType - 餐次类型
   * @returns {string} 格式化的时间显示
   */
  static formatMealTime(mealType) {
    const mealTimeRanges = {
      'breakfast': '06:00-10:00',
      'lunch': '11:00-14:00', 
      'dinner': '17:00-20:00'
    }
    
    return mealTimeRanges[mealType] || '--:--'
  }

  /**
   * 检查时间是否在指定范围内
   * @param {string|Date} time - 要检查的时间
   * @param {string} mealType - 餐次类型
   * @returns {boolean} 是否在范围内
   */
  static isTimeInMealRange(time, mealType) {
    const targetTime = this.parseTime(time);
    if (!targetTime) return false;
    
    const hour = targetTime.hour();
    
    const mealTimeRanges = {
      'breakfast': { start: 6, end: 10 },
      'lunch': { start: 11, end: 14 },
      'dinner': { start: 17, end: 20 }
    }
    
    const range = mealTimeRanges[mealType];
    if (!range) return false;
    
    return hour >= range.start && hour <= range.end;
  }
}

/**
 * 时间格式化缓存工具类
 * 用于优化大量数据的时间格式化性能
 */
export class TimeCache {
  static cache = new Map();
  static maxSize = 1000; // 缓存最大条目数
  
  /**
   * 格式化时间并缓存结果
   * @param {string|Date} time - 时间
   * @param {string} format - 格式
   * @returns {string} 格式化后的时间
   */
  static format(time, format) {
    if (!time) return '';
    
    const key = `${time}_${format}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // 缓存大小控制
    if (this.cache.size >= this.maxSize) {
      // 删除最早添加的缓存项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const formatted = TimeUtils.formatTime(time, format);
    this.cache.set(key, formatted);
    return formatted;
  }
  
  /**
   * 清除缓存
   */
  static clear() {
    this.cache.clear();
  }
  
  /**
   * 获取缓存大小
   * @returns {number} 缓存条目数
   */
  static getSize() {
    return this.cache.size;
  }
}

export default TimeUtils;