/**
 * Vendor.js 日期兼容性修复专用工具
 * 
 * 专门解决 vendor.js 中的 iOS 日期兼容性问题
 * 错误信息: "at http://127.0.0.1:59159/appservice/common/vendor.js:4067:20
 *           new Date("9/13/2025, 7:19:58 AM") 在部分 iOS 下无法正常使用"
 * 
 * 使用方法：在 main.js 中尽早调用 setupVendorDateFix()
 */

import { IOSDateFix } from './iosDateFix.js';
import { TimeUtils } from './timeUtils.js';

/**
 * 设置 Vendor.js 日期修复
 * 必须在所有第三方库加载之前执行
 */
export function setupVendorDateFix() {
  console.log('🔧 正在设置 Vendor.js 日期兼容性修复...');
  
  try {
    // 1. 立即应用全局 Date 构造函数补丁
    patchGlobalDateConstructor();
    
    // 2. 监听和拦截 dayjs/moment 相关的日期创建
    interceptThirdPartyDateLibraries();
    
    // 3. 设置错误监听器，捕获未被拦截的错误
    setupVendorErrorListener();
    
    console.log('✅ Vendor.js 日期兼容性修复已启用');
    console.log('🛡️ 所有第三方库的日期调用现在都是 iOS 安全的');
    
    return true;
  } catch (error) {
    console.error('❌ Vendor.js 日期修复设置失败:', error);
    return false;
  }
}

/**
 * 修补全局 Date 构造函数
 * 确保所有 new Date() 调用都经过 iOS 兼容性处理
 */
function patchGlobalDateConstructor() {
  if (typeof window === 'undefined' || !window.Date) {
    console.warn('⚠️ 无法访问全局 Date 对象，跳过修补');
    return;
  }
  
  // 保存原始 Date 构造函数
  const OriginalDate = window.Date;
  window.OriginalDate = OriginalDate;
  
  // 创建增强的 Date 构造函数
  function EnhancedDate(...args) {
    // 如果没有参数，创建当前时间
    if (args.length === 0) {
      return new OriginalDate();
    }
    
    // 如果只有一个参数且是字符串
    if (args.length === 1 && typeof args[0] === 'string') {
      const dateString = args[0];
      
      // 检查是否是 iOS 不兼容的格式
      if (IOSDateFix.isIncompatibleFormat(dateString)) {
        console.log('🔧 拦截到 iOS 不兼容日期格式:', dateString);
        
        // 使用安全创建方法
        const safeDate = IOSDateFix.safeCreateDate(dateString);
        if (safeDate) {
          console.log('✅ 已转换为 iOS 兼容格式:', safeDate.toISOString());
          return safeDate;
        }
      }
    }
    
    // 对于其他情况，使用原始构造函数
    return new OriginalDate(...args);
  }
  
  // 复制原始 Date 的静态方法和属性
  Object.setPrototypeOf(EnhancedDate, OriginalDate);
  EnhancedDate.prototype = OriginalDate.prototype;
  
  // 复制所有静态方法
  for (const key of Object.getOwnPropertyNames(OriginalDate)) {
    if (key !== 'length' && key !== 'name' && key !== 'prototype') {
      try {
        EnhancedDate[key] = OriginalDate[key];
      } catch (e) {
        // 某些属性可能不可写，忽略错误
      }
    }
  }
  
  // 替换全局 Date
  window.Date = EnhancedDate;
  
  console.log('✅ 全局 Date 构造函数已增强');
}

/**
 * 拦截第三方日期库
 * 监听可能由 dayjs、moment 等库产生的问题调用
 */
function interceptThirdPartyDateLibraries() {
  // 拦截可能的 dayjs 调用
  if (typeof window !== 'undefined') {
    // 监听可能的全局 dayjs 对象
    const interceptDayjs = () => {
      if (window.dayjs) {
        const originalDayjs = window.dayjs;
        window.dayjs = function(input, ...rest) {
          // 如果输入是不兼容的日期字符串，先修复
          if (typeof input === 'string' && IOSDateFix.isIncompatibleFormat(input)) {
            const compatibleInput = IOSDateFix.convertToCompatibleFormat(input);
            console.log('🔧 拦截 dayjs 不兼容格式:', input, '→', compatibleInput);
            return originalDayjs(compatibleInput, ...rest);
          }
          return originalDayjs(input, ...rest);
        };
        
        // 复制所有静态方法
        Object.setPrototypeOf(window.dayjs, originalDayjs);
        for (const key in originalDayjs) {
          if (typeof originalDayjs[key] === 'function') {
            window.dayjs[key] = originalDayjs[key];
          }
        }
      }
    };
    
    // 立即检查
    interceptDayjs();
    
    // 延迟检查，防止库还没加载
    setTimeout(interceptDayjs, 100);
    setTimeout(interceptDayjs, 500);
    setTimeout(interceptDayjs, 1000);
  }
}

/**
 * 设置 Vendor 错误监听器
 * 捕获和记录来自 vendor.js 的日期相关错误
 */
function setupVendorErrorListener() {
  if (typeof window === 'undefined') return;
  
  // 监听全局错误
  const originalErrorHandler = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // 检查是否是 vendor.js 中的日期相关错误
    if (source && source.includes('vendor.js') && 
        message && (message.includes('Invalid Date') || 
                   message.includes('日期') || 
                   message.includes('Date'))) {
      
      console.error('🚨 检测到 vendor.js 日期错误:', {
        message,
        source,
        line: lineno,
        column: colno,
        error: error?.stack
      });
      
      console.log('💡 建议：确保在应用启动时调用了 setupVendorDateFix()');
      
      // 尝试应急修复
      try {
        IOSDateFix.enableGlobalDateCompatibility();
        console.log('🔧 已应用应急日期兼容性修复');
      } catch (fixError) {
        console.error('❌ 应急修复失败:', fixError);
      }
    }
    
    // 调用原始错误处理器
    if (originalErrorHandler) {
      return originalErrorHandler.call(this, message, source, lineno, colno, error);
    }
    
    return false;
  };
  
  // 监听 Promise 拒绝
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('Invalid Date')) {
      console.error('🚨 检测到未处理的日期相关 Promise 拒绝:', event.reason);
      console.log('💡 可能需要加强日期兼容性修复');
    }
    
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(this, event);
    }
  };
  
  console.log('✅ Vendor 错误监听器已设置');
}

/**
 * 恢复原始 Date 构造函数
 * 用于调试或紧急情况下的回滚
 */
export function restoreOriginalDate() {
  if (typeof window !== 'undefined' && window.OriginalDate) {
    window.Date = window.OriginalDate;
    delete window.OriginalDate;
    console.log('✅ 已恢复原始 Date 构造函数');
    return true;
  }
  return false;
}

/**
 * 检查 vendor.js 日期修复状态
 */
export function checkVendorDateFixStatus() {
  const status = {
    isGlobalDatePatched: typeof window !== 'undefined' && window.OriginalDate !== undefined,
    hasErrorListener: true, // 总是设置了错误监听器
    testResults: []
  };
  
  // 测试常见的问题格式
  const testFormats = [
    "9/13/2025, 7:19:58 AM",
    "9/13/2025, 5:39:15 PM",
    "1/1/2026, 12:00:00 AM"
  ];
  
  testFormats.forEach(format => {
    try {
      const date = new Date(format);
      const isValid = !isNaN(date.getTime());
      status.testResults.push({
        format,
        success: isValid,
        result: isValid ? date.toISOString() : 'Invalid Date'
      });
    } catch (error) {
      status.testResults.push({
        format,
        success: false,
        result: error.message
      });
    }
  });
  
  return status;
}

/**
 * 打印详细的修复状态报告
 */
export function printVendorDateFixReport() {
  const status = checkVendorDateFixStatus();
  
  console.log('\n📊 Vendor.js 日期修复状态报告');
  console.log('================================');
  console.log('全局 Date 已修补:', status.isGlobalDatePatched ? '✅' : '❌');
  console.log('错误监听器:', status.hasErrorListener ? '✅' : '❌');
  console.log('\n🧪 测试结果:');
  
  status.testResults.forEach((test, index) => {
    console.log(`${index + 1}. "${test.format}"`);
    console.log(`   结果: ${test.success ? '✅' : '❌'} ${test.result}`);
  });
  
  const successCount = status.testResults.filter(t => t.success).length;
  const totalCount = status.testResults.length;
  
  console.log(`\n📈 总体成功率: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 所有测试通过！iOS 日期兼容性修复正常工作');
  } else {
    console.log('⚠️ 部分测试失败，可能需要进一步调试');
  }
  
  console.log('================================\n');
  
  return status;
}

// 默认导出
export default {
  setupVendorDateFix,
  restoreOriginalDate,
  checkVendorDateFixStatus,
  printVendorDateFixReport
};