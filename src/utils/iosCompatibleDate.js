/**
 * iOS 兼容的日期处理工具类
 * 解决 iOS Safari 日期格式兼容性问题
 * 
 * iOS 只支持以下日期格式：
 * - "yyyy/MM/dd"
 * - "yyyy/MM/dd HH:mm:ss"  
 * - "yyyy-MM-dd"
 * - "yyyy-MM-ddTHH:mm:ss"
 * - "yyyy-MM-ddTHH:mm:ss+HH:mm"
 * 
 * @author Linus (致敬内核之父的简洁风格)
 */

/**
 * iOS 兼容的日期创建器
 * 这个类就是要解决那些该死的 iOS 日期兼容性问题
 */
export class IOSCompatibleDate {
  /**
   * 安全创建 Date 对象，确保 iOS 兼容性
   * @param {string|Date|number} input - 日期输入
   * @returns {Date|null} 创建的 Date 对象，失败返回 null
   */
  static create(input) {
    // 特殊处理：当 input 为 undefined 时，返回当前时间
    if (input === undefined) {
      return new Date();
    }
    
    // 如果 input 为 null 或空字符串，返回 null
    if (!input) return null;
    
    // 如果已经是 Date 对象，直接返回
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input;
    }
    
    // 如果是数字（时间戳），直接创建
    if (typeof input === 'number') {
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // 字符串处理 - 这里是关键
    if (typeof input === 'string') {
      return this._createFromString(input.trim());
    }
    
    return null;
  }
  
  /**
   * 从字符串创建日期，处理各种不兼容格式
   * @private
   */
  static _createFromString(dateStr) {
    if (!dateStr) return null;
    
    try {
      // 1. 处理已经符合 iOS 格式的字符串
      if (this._isIOSCompatible(dateStr)) {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      }
      
      // 2. 转换不兼容格式为兼容格式
      const converted = this._convertToIOSFormat(dateStr);
      if (converted) {
        const date = new Date(converted);
        return isNaN(date.getTime()) ? null : date;
      }
      
      // 3. 最后尝试：使用正则解析
      return this._parseWithRegex(dateStr);
      
    } catch (error) {
      console.warn('iOS日期创建失败:', dateStr, error);
      return null;
    }
  }
  
  /**
   * 检查字符串是否已经是 iOS 兼容格式
   * @private
   */
  static _isIOSCompatible(dateStr) {
    const patterns = [
      /^\d{4}\/\d{2}\/\d{2}$/,                          // yyyy/MM/dd
      /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/,       // yyyy/MM/dd HH:mm:ss
      /^\d{4}-\d{2}-\d{2}$/,                            // yyyy-MM-dd
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,         // yyyy-MM-ddTHH:mm:ss
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/, // yyyy-MM-ddTHH:mm:ss.sssZ
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/ // yyyy-MM-ddTHH:mm:ss+HH:mm
    ];
    
    return patterns.some(pattern => pattern.test(dateStr));
  }
  
  /**
   * 转换各种格式为 iOS 兼容格式
   * @private
   */
  static _convertToIOSFormat(dateStr) {
    // 处理 "M/d/yyyy" 格式（如 "9/12/2025"）
    const mdyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    let match = mdyPattern.exec(dateStr);
    if (match) {
      const [, month, day, year] = match;
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
    }
    
    // 处理 "M/d/yyyy, h:mm:ss AM/PM" 格式
    const mdyTimePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i;
    match = mdyTimePattern.exec(dateStr);
    if (match) {
      const [, month, day, year, hour, minute, second, ampm] = match;
      let hour24 = parseInt(hour);
      if (ampm.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
      if (ampm.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;
      
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${hour24.toString().padStart(2, '0')}:${minute}:${second}`;
    }
    
    // 处理 "dd/MM/yyyy" 格式
    const dmyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    match = dmyPattern.exec(dateStr);
    if (match) {
      const [, day, month, year] = match;
      // 注意：这里假设是 dd/MM/yyyy 格式，如果你的项目是 MM/dd/yyyy，需要调整
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
    }
    
    // 处理 "yyyy.MM.dd" 格式
    const dotPattern = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/;
    match = dotPattern.exec(dateStr);
    if (match) {
      const [, year, month, day] = match;
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
    }
    
    // 处理中文日期格式 "2024年1月15日"
    const chinesePattern = /^(\d{4})年(\d{1,2})月(\d{1,2})日?$/;
    match = chinesePattern.exec(dateStr);
    if (match) {
      const [, year, month, day] = match;
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
    }
    
    return null;
  }
  
  /**
   * 使用正则表达式解析日期（最后手段）
   * @private
   */
  static _parseWithRegex(dateStr) {
    // 提取年月日时分秒
    const numberPattern = /\d+/g;
    const numbers = dateStr.match(numberPattern);
    
    if (!numbers || numbers.length < 3) return null;
    
    try {
      // 假设至少有年月日三个数字
      let year, month, day, hour = 0, minute = 0, second = 0;
      
      // 根据数字个数判断格式
      if (numbers.length >= 3) {
        // 尝试不同的解析顺序
        if (numbers[0].length === 4) {
          // 可能是 yyyy-MM-dd 格式
          [year, month, day] = numbers;
        } else if (numbers[2].length === 4) {
          // 可能是 MM-dd-yyyy 或 dd-MM-yyyy 格式
          [month, day, year] = numbers; // 假设是美式格式
        } else {
          return null;
        }
        
        if (numbers.length >= 6) {
          [, , , hour, minute, second] = numbers;
        } else if (numbers.length >= 5) {
          [, , , hour, minute] = numbers;
        } else if (numbers.length >= 4) {
          [, , , hour] = numbers;
        }
      }
      
      // 创建 iOS 兼容的日期字符串
      const isoStr = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
      
      const date = new Date(isoStr);
      return isNaN(date.getTime()) ? null : date;
      
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 格式化日期为 iOS 兼容的字符串
   * @param {Date} date - 要格式化的日期
   * @param {string} format - 格式类型
   * @returns {string} 格式化后的字符串
   */
  static format(date, format = 'YYYY-MM-DD') {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    
    switch (format.toUpperCase()) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'YYYY/MM/DD':
        return `${year}/${month}/${day}`;
      case 'YYYY-MM-DD HH:MM:SS':
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case 'YYYY/MM/DD HH:MM:SS':
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
      case 'ISO':
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}Z`;
      case 'HH:MM':
        return `${hours}:${minutes}`;
      case 'HH:MM:SS':
        return `${hours}:${minutes}:${seconds}`;
      default:
        return this._customFormat(date, format);
    }
  }
  
  /**
   * 自定义格式化
   * @private
   */
  static _customFormat(date, format) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    return format
      .replace(/YYYY/g, year)
      .replace(/YY/g, year.toString().slice(-2))
      .replace(/MM/g, month.toString().padStart(2, '0'))
      .replace(/M/g, month)
      .replace(/DD/g, day.toString().padStart(2, '0'))
      .replace(/D/g, day)
      .replace(/HH/g, hours.toString().padStart(2, '0'))
      .replace(/H/g, hours)
      .replace(/mm/g, minutes.toString().padStart(2, '0'))
      .replace(/m/g, minutes)
      .replace(/ss/g, seconds.toString().padStart(2, '0'))
      .replace(/s/g, seconds);
  }
  
  /**
   * 获取今天的日期字符串（iOS 兼容格式）
   * @param {string} format - 格式
   * @returns {string} 今天的日期
   */
  static today(format = 'YYYY-MM-DD') {
    return this.format(new Date(), format);
  }
  
  /**
   * 比较两个日期是否是同一天
   * @param {Date|string} date1 - 日期1
   * @param {Date|string} date2 - 日期2
   * @returns {boolean} 是否同一天
   */
  static isSameDay(date1, date2) {
    const d1 = this.create(date1);
    const d2 = this.create(date2);
    
    if (!d1 || !d2) return false;
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
  
  /**
   * 添加天数
   * @param {Date|string} date - 基础日期
   * @param {number} days - 要添加的天数
   * @returns {Date|null} 新日期
   */
  static addDays(date, days) {
    const d = this.create(date);
    if (!d) return null;
    
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result;
  }
}

/**
 * 全局日期创建函数（替代 new Date()）
 * 这是你应该在整个项目中使用的函数
 */
export function createDate(input) {
  return IOSCompatibleDate.create(input);
}

/**
 * 安全的日期格式化函数
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  return IOSCompatibleDate.format(date, format);
}

/**
 * Vue 混入对象，提供 iOS 兼容的日期方法
 */
export const iosDateMixin = {
  methods: {
    // 安全创建日期
    $createDate(input) {
      return createDate(input);
    },
    
    // 格式化日期
    $formatDate(date, format = 'YYYY-MM-DD') {
      return formatDate(date, format);
    },
    
    // 获取今天
    $today(format = 'YYYY-MM-DD') {
      return IOSCompatibleDate.today(format);
    },
    
    // 比较日期
    $isSameDay(date1, date2) {
      return IOSCompatibleDate.isSameDay(date1, date2);
    },
    
    // 添加天数
    $addDays(date, days) {
      return IOSCompatibleDate.addDays(date, days);
    }
  }
};

export default IOSCompatibleDate;
