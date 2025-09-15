/**
 * iOS 日期格式兼容性修复工具
 * 
 * 问题描述：
 * iOS Safari 对 Date 构造函数的日期格式解析非常严格，
 * 不支持如 "9/13/2025, 5:39:15 PM" 这样的格式
 * 
 * 支持的格式：
 * - "yyyy/MM/dd"
 * - "yyyy/MM/dd HH:mm:ss"
 * - "yyyy-MM-dd"
 * - "yyyy-MM-ddTHH:mm:ss"
 * - "yyyy-MM-ddTHH:mm:ss+HH:mm"
 * 
 * 本工具提供全面的iOS兼容性修复方案
 */

import dayjs from 'dayjs';
import { TimeUtils } from './timeUtils.js';

/**
 * iOS 日期兼容性修复工具类
 */
export class IOSDateFix {
  /**
   * 不兼容的日期格式正则表达式集合
   */
  static INCOMPATIBLE_PATTERNS = [
    // M/D/YYYY, H:mm:ss AM/PM 格式
    /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM)/i,
    // M/D/YYYY, H:mm AM/PM 格式 (没有秒)
    /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2})\s*(AM|PM)/i,
    // M/D/YYYY 格式
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // MM/DD/YYYY HH:mm:ss 格式 (24小时制)
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
    // 含有逗号的美式日期格式
    /(\d{1,2})\/(\d{1,2})\/(\d{4}),/
  ];

  /**
   * 检测字符串是否为iOS不兼容的日期格式
   * @param {string} dateString - 日期字符串
   * @returns {boolean} 是否不兼容
   */
  static isIncompatibleFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return false;
    }

    return this.INCOMPATIBLE_PATTERNS.some(pattern => pattern.test(dateString.trim()));
  }

  /**
   * 转换iOS不兼容的日期格式为兼容格式
   * @param {string} dateString - 原始日期字符串
   * @returns {string} iOS兼容的日期字符串
   */
  static convertToCompatibleFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return dateString;
    }

    let cleanString = dateString.trim();

    try {
      // 处理 "9/13/2025, 5:39:15 PM" 或 "9/13/2025 5:39:15 PM" 格式
      const ampmWithSecondsMatch = cleanString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM)/i);
      if (ampmWithSecondsMatch) {
        let [, month, day, year, hour, minute, second, ampm] = ampmWithSecondsMatch;
        
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
        
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
      }

      // 处理 "9/13/2025, 5:39 PM" 或 "9/13/2025 5:39 PM" 格式 (没有秒)
      const ampmWithoutSecondsMatch = cleanString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2})\s*(AM|PM)/i);
      if (ampmWithoutSecondsMatch) {
        let [, month, day, year, hour, minute, ampm] = ampmWithoutSecondsMatch;
        
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
        
        return `${year}-${month}-${day}T${hour}:${minute}:00`;
      }

      // 处理 "9/13/2025" 格式
      const dateOnlyMatch = cleanString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dateOnlyMatch) {
        const [, month, day, year] = dateOnlyMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // 处理 "9/13/2025 17:39:15" 格式 (24小时制)
      const time24Match = cleanString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
      if (time24Match) {
        const [, month, day, year, hour, minute, second] = time24Match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
      }

      // 如果没有匹配任何模式，返回原字符串
      return dateString;

    } catch (error) {
      console.error('日期格式转换失败:', error, '原始字符串:', dateString);
      return dateString;
    }
  }

  /**
   * 安全创建Date对象 (iOS兼容版本)
   * @param {string|Date|number} input - 日期输入
   * @returns {Date|null} Date对象，失败返回null
   */
  static safeCreateDate(input) {
    // 如果已经是Date对象
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input;
    }

    // 如果是数字 (时间戳)
    if (typeof input === 'number') {
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }

    // 如果是字符串
    if (typeof input === 'string') {
      try {
        // 检查是否为不兼容格式
        if (this.isIncompatibleFormat(input)) {
          const compatibleFormat = this.convertToCompatibleFormat(input);
          const date = new Date(compatibleFormat);
          return isNaN(date.getTime()) ? null : date;
        }

        // 直接尝试创建Date对象
        const date = new Date(input);
        return isNaN(date.getTime()) ? null : date;
      } catch (error) {
        console.error('创建Date对象失败:', error, '输入:', input);
        return null;
      }
    }

    return null;
  }

  /**
   * 替换原生Date构造函数 (全局修复)
   * 注意：这是一个激进的修复方案，请谨慎使用
   */
  static patchGlobalDate() {
    if (typeof window !== 'undefined' && window.Date) {
      const OriginalDate = window.Date;
      
      // 保存原始构造函数的引用
      window.OriginalDate = OriginalDate;
      
      // 创建新的Date构造函数
      function PatchedDate(...args) {
        if (args.length === 0) {
          return new OriginalDate();
        }
        
        if (args.length === 1) {
          const input = args[0];
          
          // 如果是字符串且为不兼容格式，先转换
          if (typeof input === 'string' && IOSDateFix.isIncompatibleFormat(input)) {
            const compatibleFormat = IOSDateFix.convertToCompatibleFormat(input);
            return new OriginalDate(compatibleFormat);
          }
        }
        
        // 其他情况直接使用原始构造函数
        return new OriginalDate(...args);
      }
      
      // 复制静态方法
      Object.setPrototypeOf(PatchedDate, OriginalDate);
      PatchedDate.prototype = OriginalDate.prototype;
      
      // 复制静态属性
      Object.getOwnPropertyNames(OriginalDate).forEach(name => {
        if (name !== 'length' && name !== 'name' && name !== 'prototype') {
          PatchedDate[name] = OriginalDate[name];
        }
      });
      
      // 替换全局Date
      window.Date = PatchedDate;
      
      console.log('✅ iOS Date 兼容性补丁已应用');
    }
  }

  /**
   * 恢复原始Date构造函数
   */
  static restoreGlobalDate() {
    if (typeof window !== 'undefined' && window.OriginalDate) {
      window.Date = window.OriginalDate;
      delete window.OriginalDate;
      console.log('✅ 原始 Date 构造函数已恢复');
    }
  }

  /**
   * 监听并修复所有不兼容的日期操作
   */
  static enableGlobalDateCompatibility() {
    // 修复 Date 构造函数
    this.patchGlobalDate();
    
    // 监听并修复可能产生不兼容格式的方法
    if (typeof window !== 'undefined' && window.Date && window.Date.prototype) {
      const originalToLocaleString = Date.prototype.toLocaleString;
      const originalToLocaleDateString = Date.prototype.toLocaleDateString;
      const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
      
      // 重写 toLocaleString 方法
      Date.prototype.toLocaleString = function(locales, options) {
        try {
          // 优先使用手动格式化，确保iOS兼容
          const year = this.getFullYear();
          const month = String(this.getMonth() + 1).padStart(2, '0');
          const day = String(this.getDate()).padStart(2, '0');
          const hours = String(this.getHours()).padStart(2, '0');
          const minutes = String(this.getMinutes()).padStart(2, '0');
          const seconds = String(this.getSeconds()).padStart(2, '0');
          
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
          // 如果出错，使用原始方法
          return originalToLocaleString.call(this, locales, options);
        }
      };
      
      // 重写 toLocaleDateString 方法
      Date.prototype.toLocaleDateString = function(locales, options) {
        try {
          const year = this.getFullYear();
          const month = String(this.getMonth() + 1).padStart(2, '0');
          const day = String(this.getDate()).padStart(2, '0');
          
          return `${year}-${month}-${day}`;
        } catch (error) {
          return originalToLocaleDateString.call(this, locales, options);
        }
      };
      
      // 重写 toLocaleTimeString 方法
      Date.prototype.toLocaleTimeString = function(locales, options) {
        try {
          const hours = String(this.getHours()).padStart(2, '0');
          const minutes = String(this.getMinutes()).padStart(2, '0');
          const seconds = String(this.getSeconds()).padStart(2, '0');
          
          return `${hours}:${minutes}:${seconds}`;
        } catch (error) {
          return originalToLocaleTimeString.call(this, locales, options);
        }
      };
      
      console.log('✅ 日期格式化方法兼容性补丁已应用');
    }
  }

  /**
   * 测试iOS兼容性修复效果
   */
  static testCompatibilityFix() {
    console.log('🧪 开始测试iOS日期兼容性修复...');
    
    const testCases = [
      "9/13/2025, 5:39:15 PM",
      "9/2/2025, 3:35:21 AM",
      "12/25/2025, 11:59:59 PM",
      "1/1/2026, 12:00:00 AM",
      "9/13/2025",
      "2025-09-13T17:39:15.000Z",
      "2025-09-13 17:39:15",
      "invalid-date",
      "",
      null,
      undefined
    ];
    
    console.log('测试用例结果:');
    testCases.forEach((testCase, index) => {
      try {
        const isIncompatible = this.isIncompatibleFormat(testCase);
        const converted = this.convertToCompatibleFormat(testCase);
        const safeDate = this.safeCreateDate(testCase);
        
        console.log(`测试 ${index + 1}:`, {
          输入: testCase,
          不兼容: isIncompatible,
          转换后: converted !== testCase ? converted : '无需转换',
          创建结果: safeDate ? safeDate.toISOString() : 'null',
          成功: safeDate !== null
        });
      } catch (error) {
        console.error(`测试 ${index + 1} 失败:`, error);
      }
    });
    
    console.log('✅ iOS日期兼容性测试完成');
  }

  /**
   * 获取兼容性修复的使用指南
   */
  static getUsageGuide() {
    return {
      推荐使用方式: {
        方式1: "使用 IOSDateFix.safeCreateDate() 替代 new Date()",
        方式2: "在应用启动时调用 IOSDateFix.enableGlobalDateCompatibility()",
        方式3: "使用 TimeUtils 类的方法，它们已经内置了iOS兼容性处理"
      },
      
      示例代码: {
        安全创建日期: `
          // ❌ 可能出错
          const date = new Date("9/13/2025, 5:39:15 PM");
          
          // ✅ 安全方式
          const date = IOSDateFix.safeCreateDate("9/13/2025, 5:39:15 PM");
        `,
        
        全局修复: `
          // 在 main.js 中添加
          import { IOSDateFix } from '@/utils/iosDateFix.js';
          IOSDateFix.enableGlobalDateCompatibility();
        `,
        
        使用TimeUtils: `
          // 推荐方式
          import { TimeUtils } from '@/utils/timeUtils.js';
          const formatted = TimeUtils.formatTime("9/13/2025, 5:39:15 PM");
        `
      },
      
      注意事项: [
        "全局修复可能影响其他库的行为，请谨慎使用",
        "推荐优先使用 TimeUtils 类的方法",
        "如果遇到问题，可以使用 IOSDateFix.restoreGlobalDate() 恢复",
        "建议在开发和测试环境中充分验证修复效果"
      ]
    };
  }
}

// 导出默认实例，方便直接使用
export default IOSDateFix;