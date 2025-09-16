/**
 * 最早期的 iOS 日期兼容性修复
 * 这个文件必须在任何其他 JavaScript 代码之前加载
 * 专门解决 vendor.js 等第三方库中的 iOS 日期问题
 * 
 * @author Linus 风格的强力修复
 */

// 立即执行，不等待任何模块加载
(function() {
  'use strict';
  
  console.log('🚀 启动早期 iOS 日期兼容性修复...');

  /**
   * 检查是否为微信小程序 iOS 环境
   */
  function isWechatMiniProgramIOS() {
    try {
      // 优先使用新的设备信息API
      if (typeof wx !== 'undefined' && wx.getDeviceInfo) {
        const deviceInfo = wx.getDeviceInfo();
        return deviceInfo.platform === 'ios';
      }
      
      // 兜底：检查是否有旧API
      if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
        console.warn('⚠️ 使用已弃用的wx.getSystemInfoSync，建议升级到wx.getDeviceInfo');
        const systemInfo = wx.getSystemInfoSync();
        return systemInfo.platform === 'ios';
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ 无法检测微信小程序 iOS 环境:', error);
      return false;
    }
  }

  /**
   * iOS 兼容的日期格式转换
   * 专门处理 "9/15/2025, 8:41:44 AM" 这种导致vendor.js错误的格式
   */
  function convertToIOSCompatibleFormat(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') {
      return dateStr;
    }

    console.log(`🔍 [EarlyDateFix] 检查日期格式: "${dateStr}"`);

    // 🎯 重点处理 "M/d/yyyy, h:mm:ss AM/PM" 格式 (如 "9/15/2025, 8:41:44 AM")
    const mdyTimePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i;
    let match = mdyTimePattern.exec(dateStr);
    if (match) {
      const [, month, day, year, hour, minute, second, ampm] = match;
      let hour24 = parseInt(hour);
      if (ampm.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
      if (ampm.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;
      
      const converted = `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${hour24.toString().padStart(2, '0')}:${minute}:${second}`;
      console.log(`✅ [EarlyDateFix] 转换AM/PM格式: "${dateStr}" → "${converted}"`);
      return converted;
    }

    // 处理 "M/d/yyyy" 格式  
    const mdyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    match = mdyPattern.exec(dateStr);
    if (match) {
      const [, month, day, year] = match;
      const converted = `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
      console.log(`✅ [EarlyDateFix] 转换日期格式: "${dateStr}" → "${converted}"`);
      return converted;
    }

    // 处理 "yyyy.MM.dd" 格式
    const dotPattern = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/;
    match = dotPattern.exec(dateStr);
    if (match) {
      const [, year, month, day] = match;
      const converted = `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
      console.log(`✅ [EarlyDateFix] 转换点分格式: "${dateStr}" → "${converted}"`);
      return converted;
    }

    // 🎯 处理 "YYYY-MM-DD hh:mm:ss" 格式 (iOS不兼容的连字符格式)
    const dashTimePattern = /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})$/;
    match = dashTimePattern.exec(dateStr);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      const converted = `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute}:${second}`;
      console.log(`✅ [EarlyDateFix] 转换连字符时间格式: "${dateStr}" → "${converted}"`);
      return converted;
    }

    // 🎯 处理 "YYYY-MM-DD" 格式 (纯日期连字符格式)
    const dashDatePattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    match = dashDatePattern.exec(dateStr);
    if (match) {
      const [, year, month, day] = match;
      const converted = `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
      console.log(`✅ [EarlyDateFix] 转换连字符日期格式: "${dateStr}" → "${converted}"`);
      return converted;
    }

    // 处理其他可能的问题格式
    // "M/d/yy" 格式 (两位年份)
    const mdyShortPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/;
    match = mdyShortPattern.exec(dateStr);
    if (match) {
      const [, month, day, year] = match;
      const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
      const converted = `${fullYear}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
      console.log(`✅ [EarlyDateFix] 转换短年份格式: "${dateStr}" → "${converted}"`);
      return converted;
    }

    console.log(`ℹ️ [EarlyDateFix] 格式已兼容，无需转换: "${dateStr}"`);
    return dateStr;
  }

  // 备份原始的 Date 构造函数
  const OriginalDate = Date;

  /**
   * 创建 iOS 兼容的 Date 对象
   * 专门拦截并修复 vendor.js 中的问题调用
   */
  function createIOSCompatibleDate(...args) {
    // 无参数，返回当前时间
    if (args.length === 0) {
      return new OriginalDate();
    }

    // 单个字符串参数，进行格式转换
    if (args.length === 1 && typeof args[0] === 'string') {
      const originalFormat = args[0];
      const convertedFormat = convertToIOSCompatibleFormat(originalFormat);
      
      // 如果格式发生了转换，说明是我们要修复的问题格式
      if (convertedFormat !== originalFormat) {
        console.log(`🎯 [EarlyDateFix] 拦截vendor.js问题调用: new Date("${originalFormat}")`);
        console.log(`🔧 [EarlyDateFix] 修复为iOS兼容格式: new Date("${convertedFormat}")`);
      }
      
      try {
        const result = new OriginalDate(convertedFormat);
        if (convertedFormat !== originalFormat) {
          console.log(`✅ [EarlyDateFix] 成功创建兼容Date对象:`, result.toString());
        }
        return result;
      } catch (error) {
        console.error(`❌ [EarlyDateFix] iOS兼容日期创建失败: "${convertedFormat}"`, error);
        console.log('🔄 [EarlyDateFix] 尝试使用原始格式...');
        try {
          return new OriginalDate(originalFormat);
        } catch (fallbackError) {
          console.error(`❌ [EarlyDateFix] 原始格式也失败: "${originalFormat}"`, fallbackError);
          console.log('💀 [EarlyDateFix] 返回当前时间作为fallback');
          return new OriginalDate();
        }
      }
    }

    // 其他情况，直接使用原始构造函数
    return new OriginalDate(...args);
  }

  // 检查是否需要应用修复
  // 🚨 为了彻底解决vendor.js问题，在所有环境中都启用修复
  const shouldApplyFix = true; // 强制启用
  const isIOS = isWechatMiniProgramIOS();
  
  if (shouldApplyFix) {
    console.log(isIOS ? 
      '🍎 检测到微信小程序 iOS 环境，应用早期日期修复' : 
      '🔧 为防止vendor.js问题，在所有环境中应用早期日期修复');

    try {
      // 复制原始 Date 的原型和静态方法
      Object.setPrototypeOf(createIOSCompatibleDate, OriginalDate);
      createIOSCompatibleDate.prototype = OriginalDate.prototype;

      // 复制静态方法
      Object.getOwnPropertyNames(OriginalDate).forEach(name => {
        if (name !== 'length' && name !== 'name' && name !== 'prototype') {
          try {
            const descriptor = Object.getOwnPropertyDescriptor(OriginalDate, name);
            if (descriptor) {
              Object.defineProperty(createIOSCompatibleDate, name, descriptor);
            }
          } catch (error) {
            // 忽略无法复制的属性
          }
        }
      });

      // 特殊处理 Date.parse
      createIOSCompatibleDate.parse = function(dateString) {
        const converted = convertToIOSCompatibleFormat(dateString);
        return OriginalDate.parse(converted);
      };

      // 全局替换 Date 构造函数 - 适配微信小程序环境
      if (typeof globalThis !== 'undefined') {
        globalThis.Date = createIOSCompatibleDate;
      }
      if (typeof global !== 'undefined') {
        global.Date = createIOSCompatibleDate;
      }

      // 微信小程序环境中的 Date 替换
      if (typeof window !== 'undefined') {
        // Web环境或支持window的环境
        window.Date = createIOSCompatibleDate;
      } else {
        // 微信小程序环境，直接在当前上下文替换
        try {
          // 在微信小程序中，直接替换全局Date
          Date = createIOSCompatibleDate;
        } catch (replaceError) {
          console.warn('⚠️ 无法在微信小程序中直接替换Date，使用备选方案');
          // 备选方案：确保其他全局对象已设置
          if (typeof globalThis !== 'undefined') {
            globalThis.Date = createIOSCompatibleDate;
          }
        }
      }
      
      console.log('✅ 早期 iOS 日期兼容性修复安装成功');
      console.log('🎯 现在 vendor.js 中的 new Date() 调用将自动兼容 iOS');

    } catch (error) {
      console.error('❌ 早期 iOS 日期兼容性修复安装失败:', error);
    }

  } else {
    console.log('ℹ️ 非微信小程序 iOS 环境，跳过早期日期修复');
  }

})();

// 导出一个标记，表示早期修复已执行
export const EARLY_DATE_FIX_APPLIED = true;
