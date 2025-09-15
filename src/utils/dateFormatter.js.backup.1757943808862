/**
 * 日期格式化工具类
 * 解决JavaScript中Date对象没有format方法的问题
 * 提供统一的日期格式化功能
 */

/**
 * 扩展Date原型，添加format方法
 * 参考用户提供的自定义格式化函数方案
 */
if (!Date.prototype.format) {
  Date.prototype.format = function(formatString) {
    if (!formatString) {
      formatString = 'YYYY-MM-DD';
    }
    
    var month = this.getMonth() + 1;
    var day = this.getDate();
    var year = this.getFullYear();
    var hours = this.getHours();
    var minutes = this.getMinutes();
    var seconds = this.getSeconds();
    var milliseconds = this.getMilliseconds();

    // 替换年份
    formatString = formatString.replace(/YYYY/g, year);
    formatString = formatString.replace(/YY/g, year.toString().slice(-2));
    
    // 替换月份
    formatString = formatString.replace(/MM/g, month < 10 ? "0" + month : month);
    formatString = formatString.replace(/M/g, month);
    
    // 替换日期
    formatString = formatString.replace(/DD/g, day < 10 ? "0" + day : day);
    formatString = formatString.replace(/D/g, day);
    
    // 替换小时
    formatString = formatString.replace(/HH/g, hours < 10 ? "0" + hours : hours);
    formatString = formatString.replace(/H/g, hours);
    
    // 替换分钟
    formatString = formatString.replace(/mm/g, minutes < 10 ? "0" + minutes : minutes);
    formatString = formatString.replace(/m/g, minutes);
    
    // 替换秒
    formatString = formatString.replace(/ss/g, seconds < 10 ? "0" + seconds : seconds);
    formatString = formatString.replace(/s/g, seconds);
    
    // 替换毫秒
    formatString = formatString.replace(/SSS/g, milliseconds.toString().padStart(3, '0'));
    formatString = formatString.replace(/SS/g, Math.floor(milliseconds / 10).toString().padStart(2, '0'));
    formatString = formatString.replace(/S/g, Math.floor(milliseconds / 100));

    return formatString;
  };
}

/**
 * 日期格式化工具类
 */
export class DateFormatter {
  /**
   * 格式化日期
   * @param {Date|string|number} dateInput - 日期输入
   * @param {string} format - 格式字符串，默认为 'YYYY-MM-DD'
   * @returns {string} 格式化后的日期字符串
   */
  static format(dateInput, format = 'YYYY-MM-DD') {
    if (!dateInput) return '';
    
    try {
      let date;
      
      if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else {
        return '';
      }
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.format(format);
    } catch (error) {
      console.error('日期格式化错误:', error, '输入:', dateInput);
      return '';
    }
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   * @param {Date|string|number} dateInput - 日期输入
   * @returns {string} 格式化后的日期字符串
   */
  static formatDate(dateInput) {
    return this.format(dateInput, 'YYYY-MM-DD');
  }

  /**
   * 格式化时间为 HH:mm:ss
   * @param {Date|string|number} dateInput - 日期输入
   * @returns {string} 格式化后的时间字符串
   */
  static formatTime(dateInput) {
    return this.format(dateInput, 'HH:mm:ss');
  }

  /**
   * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
   * @param {Date|string|number} dateInput - 日期输入
   * @returns {string} 格式化后的日期时间字符串
   */
  static formatDateTime(dateInput) {
    return this.format(dateInput, 'YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 格式化日期时间为 YYYY-MM-DD HH:mm
   * @param {Date|string|number} dateInput - 日期输入
   * @returns {string} 格式化后的日期时间字符串
   */
  static formatDateTimeShort(dateInput) {
    return this.format(dateInput, 'YYYY-MM-DD HH:mm');
  }

  /**
   * 获取当前日期格式化字符串
   * @param {string} format - 格式字符串，默认为 'YYYY-MM-DD'
   * @returns {string} 当前日期的格式化字符串
   */
  static getCurrentDate(format = 'YYYY-MM-DD') {
    return this.format(new Date(), format);
  }

  /**
   * 获取当前时间格式化字符串
   * @param {string} format - 格式字符串，默认为 'HH:mm:ss'
   * @returns {string} 当前时间的格式化字符串
   */
  static getCurrentTime(format = 'HH:mm:ss') {
    return this.format(new Date(), format);
  }

  /**
   * 获取当前日期时间格式化字符串
   * @param {string} format - 格式字符串，默认为 'YYYY-MM-DD HH:mm:ss'
   * @returns {string} 当前日期时间的格式化字符串
   */
  static getCurrentDateTime(format = 'YYYY-MM-DD HH:mm:ss') {
    return this.format(new Date(), format);
  }

  /**
   * 安全格式化日期（带默认值）
   * @param {Date|string|number} dateInput - 日期输入
   * @param {string} format - 格式字符串
   * @param {string} defaultValue - 默认值
   * @returns {string} 格式化后的日期字符串或默认值
   */
  static safeFormat(dateInput, format = 'YYYY-MM-DD', defaultValue = '未设置') {
    const result = this.format(dateInput, format);
    return result || defaultValue;
  }
}

/**
 * 创建Vue混入对象，提供统一的日期格式化方法
 */
export const dateFormatterMixin = {
  methods: {
    /**
     * 格式化日期
     * @param {Date|string|number} dateInput - 日期输入
     * @param {string} format - 格式字符串，默认为 'YYYY-MM-DD'
     * @returns {string} 格式化后的日期字符串
     */
    $formatDate(dateInput, format = 'YYYY-MM-DD') {
      return DateFormatter.format(dateInput, format);
    },

    /**
     * 格式化时间
     * @param {Date|string|number} dateInput - 日期输入
     * @param {string} format - 格式字符串，默认为 'HH:mm:ss'
     * @returns {string} 格式化后的时间字符串
     */
    $formatTime(dateInput, format = 'HH:mm:ss') {
      return DateFormatter.format(dateInput, format);
    },

    /**
     * 格式化日期时间
     * @param {Date|string|number} dateInput - 日期输入
     * @param {string} format - 格式字符串，默认为 'YYYY-MM-DD HH:mm:ss'
     * @returns {string} 格式化后的日期时间字符串
     */
    $formatDateTime(dateInput, format = 'YYYY-MM-DD HH:mm:ss') {
      return DateFormatter.format(dateInput, format);
    },

    /**
     * 安全格式化日期（带默认值）
     * @param {Date|string|number} dateInput - 日期输入
     * @param {string} format - 格式字符串
     * @param {string} defaultValue - 默认值
     * @returns {string} 格式化后的日期字符串或默认值
     */
    $safeFormatDate(dateInput, format = 'YYYY-MM-DD', defaultValue = '未设置') {
      return DateFormatter.safeFormat(dateInput, format, defaultValue);
    }
  }
};

export default DateFormatter;