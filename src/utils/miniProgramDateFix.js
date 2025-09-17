/**
 * 微信小程序专用的 iOS 日期兼容性修复
 * 这个版本更加保守，避免全局替换带来的问题
 * 
 * @author Linus 风格的保守修复
 */

import { IOSCompatibleDate } from './iosCompatibleDate.js';

/**
 * 检查是否为微信小程序环境
 */
export function isMiniProgramEnvironment() {
  // 优先检查新API
  return typeof wx !== 'undefined' && 
         (wx.getDeviceInfo || wx.getSystemInfoSync);
}

/**
 * 检查是否为微信小程序 iOS 环境
 */
export function isMiniProgramIOS() {
  if (!isMiniProgramEnvironment()) return false;
  
  try {
    // 优先使用新的设备信息API
    if (wx.getDeviceInfo) {
      const deviceInfo = wx.getDeviceInfo();
      return deviceInfo.platform === 'ios';
    }
    
    // 兜底使用旧API
    if (wx.getSystemInfoSync) {
      console.warn('使用已弃用的wx.getSystemInfoSync，建议升级到wx.getDeviceInfo');
      const systemInfo = wx.getSystemInfoSync();
      return systemInfo.platform === 'ios';
    }
    
    return false;
  } catch (error) {
    console.warn('⚠️ 无法获取系统信息:', error);
    return false;
  }
}

/**
 * 微信小程序安全的日期创建函数
 */
export function createSafeDate(input) {
  // 如果在微信小程序 iOS 环境中，使用兼容版本
  if (isMiniProgramIOS()) {
    // 特殊处理：当 input 为 undefined 时，直接创建当前时间
    if (input === undefined) {
      return new Date();
    }
    return IOSCompatibleDate.create(input);
  }
  
  // 其他环境直接使用原生 Date
  if (input === undefined) {
    return new Date();
  }
  return new Date(input);
}

/**
 * 微信小程序安全的日期格式化函数
 */
export function formatSafeDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  
  if (isMiniProgramIOS()) {
    return IOSCompatibleDate.format(date, format);
  }
  
  // 简单的格式化逻辑，兼容性好
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  switch (format.toUpperCase()) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'YYYY-MM-DD HH:MM:SS':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case 'HH:MM':
      return `${hours}:${minutes}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * 微信小程序环境的 Vue 混入
 */
export const miniProgramDateMixin = {
  methods: {
    // 安全创建日期
    $createSafeDate(input) {
      return createSafeDate(input);
    },
    
    // 安全格式化日期
    $formatSafeDate(date, format = 'YYYY-MM-DD') {
      return formatSafeDate(date, format);
    },
    
    // 检查是否为微信小程序 iOS
    $isMiniProgramIOS() {
      return isMiniProgramIOS();
    }
  }
};

/**
 * 备份原始的 Date 构造函数
 */
let OriginalDate = Date;

/**
 * 微信小程序 iOS 兼容的 Date 构造函数
 */
function MiniProgramCompatibleDate(...args) {
  // 如果没有参数，返回当前时间
  if (args.length === 0) {
    return new OriginalDate();
  }
  
  // 如果只有一个参数且是字符串，进行兼容性处理
  if (args.length === 1 && typeof args[0] === 'string') {
    // 在微信小程序 iOS 环境中使用兼容处理
    if (isMiniProgramIOS()) {
      const compatibleDate = IOSCompatibleDate.create(args[0]);
      if (compatibleDate) {
        return compatibleDate;
      }
    }
    
    // 其他情况直接使用原始构造函数
    return new OriginalDate(args[0]);
  }
  
  // 多个参数的情况，直接使用原始构造函数
  return new OriginalDate(...args);
}

/**
 * 复制原始 Date 的所有静态方法和属性
 */
function setupDatePrototype() {
  try {
    // 复制原型
    MiniProgramCompatibleDate.prototype = OriginalDate.prototype;
    
    // 复制静态方法
    Object.getOwnPropertyNames(OriginalDate).forEach(name => {
      if (name !== 'length' && name !== 'name' && name !== 'prototype') {
        try {
          const descriptor = Object.getOwnPropertyDescriptor(OriginalDate, name);
          if (descriptor) {
            Object.defineProperty(MiniProgramCompatibleDate, name, descriptor);
          }
        } catch (error) {
          // 某些属性可能无法复制，忽略即可
        }
      }
    });

    // 特殊处理 Date.parse
    MiniProgramCompatibleDate.parse = function(dateString) {
      if (isMiniProgramIOS()) {
        const compatibleDate = IOSCompatibleDate.create(dateString);
        if (compatibleDate) {
          return compatibleDate.getTime();
        }
      }
      return OriginalDate.parse(dateString);
    };
  } catch (error) {
    console.warn('⚠️ 无法设置 Date 原型:', error);
  }
}

/**
 * 安装全局 Date 替换（微信小程序专用）
 */
function installGlobalDateReplacement() {
  try {
    // 设置原型
    setupDatePrototype();
    
    // 替换全局 Date
    if (typeof globalThis !== 'undefined') {
      globalThis.Date = MiniProgramCompatibleDate;
    }
    
    // 微信小程序环境的额外处理
    if (typeof global !== 'undefined') {
      global.Date = MiniProgramCompatibleDate;
    }
    
    // 直接替换当前作用域的 Date
    Date = MiniProgramCompatibleDate;
    
    console.log('✅ 微信小程序全局 Date 替换已安装');
    return true;
  } catch (error) {
    console.warn('⚠️ 全局 Date 替换失败:', error);
    return false;
  }
}

/**
 * 非侵入式的初始化函数
 */
export function initMiniProgramDateFix() {
  if (isMiniProgramEnvironment()) {
    console.log('🍎 微信小程序环境检测完成');
    
    if (isMiniProgramIOS()) {
      console.log('✅ iOS 微信小程序，开始安装日期兼容性修复');
      
      // 在 iOS 微信小程序中安装全局替换
      const success = installGlobalDateReplacement();
      if (success) {
        console.log('🎯 全局 Date 替换成功，vendor.js 中的问题应该已解决');
      } else {
        console.log('⚠️ 全局 Date 替换失败，请使用安全方法');
      }
    } else {
      console.log('ℹ️ 非 iOS 微信小程序，无需日期修复');
    }
  } else {
    console.log('ℹ️ 非微信小程序环境');
  }
}

export default {
  createSafeDate,
  formatSafeDate,
  isMiniProgramIOS,
  initMiniProgramDateFix,
  miniProgramDateMixin
};
