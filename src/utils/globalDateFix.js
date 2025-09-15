/**
 * 全局日期修复器 - iOS 兼容性
 * 这个文件要解决所有该死的 iOS 日期兼容性问题
 * 
 * 使用方法：在应用启动时导入这个文件即可
 * import './utils/globalDateFix.js'
 * 
 * @author Linus style fix
 */

import { IOSCompatibleDate } from './iosCompatibleDate.js';

/**
 * 获取全局环境对象
 */
function getGlobalThis() {
  // 按优先级检查不同的全局对象
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  if (typeof self !== 'undefined') return self;
  
  // 微信小程序环境
  if (typeof wx !== 'undefined' && typeof Date !== 'undefined') {
    return { Date: Date };
  }
  
  // 如果都没有，抛出错误
  throw new Error('无法找到全局环境对象');
}

/**
 * 备份原始的 Date 构造函数
 */
let globalEnv;
let OriginalDate;

try {
  globalEnv = getGlobalThis();
  OriginalDate = globalEnv.Date;
} catch (error) {
  console.warn('⚠️ 无法获取全局环境，跳过 Date 修复:', error.message);
  OriginalDate = Date; // 使用当前环境的 Date
}

/**
 * 创建 iOS 兼容的 Date 构造函数
 */
function IOSCompatibleDateConstructor(...args) {
  // 确保 OriginalDate 存在
  if (!OriginalDate) {
    console.warn('⚠️ OriginalDate 不存在，使用系统 Date');
    OriginalDate = Date;
  }
  
  try {
    // 如果没有参数，返回当前时间
    if (args.length === 0) {
      return new OriginalDate();
    }
    
    // 如果只有一个参数且是字符串，使用我们的兼容解析器
    if (args.length === 1 && typeof args[0] === 'string') {
      const compatibleDate = IOSCompatibleDate.create(args[0]);
      if (compatibleDate) {
        return compatibleDate;
      }
      // 如果兼容解析器失败，回退到原始构造函数
      return new OriginalDate(args[0]);
    }
    
    // 其他情况（多个参数、数字等），直接使用原始构造函数
    return new OriginalDate(...args);
  } catch (error) {
    console.warn('⚠️ iOS 兼容 Date 构造失败，使用原始方法:', error);
    return new OriginalDate(...args);
  }
}

/**
 * 复制原始 Date 的所有静态方法和属性
 */
try {
  if (OriginalDate) {
    Object.setPrototypeOf(IOSCompatibleDateConstructor, OriginalDate);
    IOSCompatibleDateConstructor.prototype = OriginalDate.prototype;

    // 复制静态方法
    Object.getOwnPropertyNames(OriginalDate).forEach(name => {
      if (name !== 'length' && name !== 'name' && name !== 'prototype') {
        try {
          Object.defineProperty(IOSCompatibleDateConstructor, name, 
            Object.getOwnPropertyDescriptor(OriginalDate, name)
          );
        } catch (propError) {
          // 某些属性可能无法复制，跳过即可
        }
      }
    });
  }
} catch (error) {
  console.warn('⚠️ 无法复制 Date 静态方法:', error.message);
}

/**
 * 特殊处理 Date.parse
 */
IOSCompatibleDateConstructor.parse = function(dateString) {
  const compatibleDate = IOSCompatibleDate.create(dateString);
  if (compatibleDate) {
    return compatibleDate.getTime();
  }
  return OriginalDate.parse(dateString);
};

/**
 * 安装全局修复
 */
export function installGlobalDateFix() {
  try {
    if (!globalEnv) {
      globalEnv = getGlobalThis();
    }
    
    // 替换全局的 Date 构造函数
    globalEnv.Date = IOSCompatibleDateConstructor;
    
    // 确保在不同环境下都能工作
    if (typeof window !== 'undefined') {
      window.Date = IOSCompatibleDateConstructor;
    }
    if (typeof global !== 'undefined') {
      global.Date = IOSCompatibleDateConstructor;
    }
    if (typeof globalThis !== 'undefined') {
      globalThis.Date = IOSCompatibleDateConstructor;
    }
    
    console.log('✅ iOS 日期兼容性修复已安装');
  } catch (error) {
    console.warn('⚠️ 无法安装全局 Date 修复:', error.message);
  }
}

/**
 * 卸载全局修复（测试用）
 */
export function uninstallGlobalDateFix() {
  try {
    if (globalEnv) {
      globalEnv.Date = OriginalDate;
    }
    if (typeof window !== 'undefined') {
      window.Date = OriginalDate;
    }
    if (typeof global !== 'undefined') {
      global.Date = OriginalDate;
    }
    if (typeof globalThis !== 'undefined') {
      globalThis.Date = OriginalDate;
    }
    console.log('❌ iOS 日期兼容性修复已卸载');
  } catch (error) {
    console.warn('⚠️ 无法卸载全局 Date 修复:', error.message);
  }
}

/**
 * 检查当前环境是否为 iOS
 */
export function isIOSEnvironment() {
  // 微信小程序环境检查
  if (typeof wx !== 'undefined') {
    try {
      const systemInfo = wx.getSystemInfoSync();
      return systemInfo.platform === 'ios';
    } catch (error) {
      // 如果获取系统信息失败，默认不是 iOS
      return false;
    }
  }
  
  // 浏览器环境检查
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * 条件安装：只在 iOS 环境中安装修复
 */
export function conditionalInstall() {
  if (isIOSEnvironment()) {
    installGlobalDateFix();
    console.log('🍎 检测到 iOS 环境，已安装日期兼容性修复');
  } else {
    console.log('🖥️ 非 iOS 环境，跳过日期兼容性修复');
  }
}

// 自动安装（可以根据需要注释掉这行）
// installGlobalDateFix();
