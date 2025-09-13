/**
 * main.js 中集成 iOS 日期兼容性修复
 * 
 * 使用方法：
 * 1. 在 main.js 中导入并调用 setupIOSDateCompatibility()
 * 2. 这将启用全局 iOS 日期兼容性修复
 * 3. 项目中所有的日期操作将自动兼容 iOS
 */

import { TimeUtils } from '@/utils/timeUtils.js';
import { IOSDateFix } from '@/utils/iosDateFix.js';

/**
 * 设置 iOS 日期兼容性
 * @param {Object} options - 配置选项
 */
export function setupIOSDateCompatibility(options = {}) {
  const {
    enableGlobalPatch = false, // 是否启用全局修复
    enableConsoleWarnings = true, // 是否启用控制台警告
    enableTesting = false, // 是否运行测试
    logLevel = 'info' // 日志级别: 'silent', 'error', 'warn', 'info', 'debug'
  } = options;

  console.log('🚀 正在设置 iOS 日期兼容性...');

  try {
    // 1. 如果启用全局修复，应用全局补丁
    if (enableGlobalPatch) {
      TimeUtils.enableGlobalIOSCompatibility();
      console.log('✅ 全局 iOS 日期兼容性补丁已应用');
    } else {
      console.log('ℹ️  全局补丁未启用，使用 TimeUtils 方法获得 iOS 兼容性');
    }

    // 2. 设置控制台警告
    if (enableConsoleWarnings && logLevel !== 'silent') {
      setupDateUsageWarnings();
    }

    // 3. 运行兼容性测试
    if (enableTesting) {
      console.log('🧪 运行 iOS 兼容性测试...');
      TimeUtils.testIOSCompatibility();
    }

    // 4. 显示使用建议
    if (logLevel === 'info' || logLevel === 'debug') {
      displayUsageRecommendations();
    }

    // 5. 返回工具函数供项目使用
    return {
      TimeUtils,
      IOSDateFix,
      // 便捷方法
      parseTime: TimeUtils.parseTime.bind(TimeUtils),
      formatTime: TimeUtils.formatTime.bind(TimeUtils),
      safeCreateDate: IOSDateFix.safeCreateDate.bind(IOSDateFix),
      isIncompatibleFormat: IOSDateFix.isIncompatibleFormat.bind(IOSDateFix)
    };

  } catch (error) {
    console.error('❌ iOS 日期兼容性设置失败:', error);
    throw error;
  }
}

/**
 * 设置日期使用警告
 * 监听可能的问题日期操作
 */
function setupDateUsageWarnings() {
  // 监听可能的问题操作
  if (typeof window !== 'undefined') {
    // 重写 console.error 以捕获日期解析错误
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      
      // 检查是否是日期相关错误
      if (message.includes('Invalid Date') || 
          message.includes('时间解析') || 
          message.includes('日期格式')) {
        console.warn('⚠️  检测到日期相关错误，建议使用 TimeUtils.parseTime() 方法');
        console.warn('💡 使用指南: TimeUtils.getIOSCompatibilityGuide()');
      }
      
      // 调用原始 console.error
      originalConsoleError.apply(console, args);
    };
  }
}

/**
 * 显示使用建议
 */
function displayUsageRecommendations() {
  console.log('\n📋 iOS 日期兼容性使用建议:');
  console.log('   1. 优先使用 TimeUtils.parseTime() 替代 new Date()');
  console.log('   2. 使用 TimeUtils.formatTime() 进行日期格式化');
  console.log('   3. 避免使用 toLocaleDateString(), toLocaleTimeString()');
  console.log('   4. 统一使用 ISO 8601 格式进行数据传输');
  console.log('   5. 如需全局修复，设置 enableGlobalPatch: true\n');
}

/**
 * Vue 3 插件形式的 iOS 日期兼容性
 * 
 * 使用方法：
 * import { createApp } from 'vue'
 * import { IOSDateCompatibilityPlugin } from './utils/iosDateMain.js'
 * 
 * const app = createApp(App)
 * app.use(IOSDateCompatibilityPlugin, {
 *   enableGlobalPatch: false,
 *   enableTesting: true
 * })
 */
export const IOSDateCompatibilityPlugin = {
  install(app, options = {}) {
    const dateUtils = setupIOSDateCompatibility(options);
    
    // 将工具方法添加到全局属性
    app.config.globalProperties.$parseTime = dateUtils.parseTime;
    app.config.globalProperties.$formatTime = dateUtils.formatTime;
    app.config.globalProperties.$safeCreateDate = dateUtils.safeCreateDate;
    app.config.globalProperties.$isIncompatibleDateFormat = dateUtils.isIncompatibleFormat;
    
    // 添加到 provide/inject 系统
    app.provide('dateUtils', dateUtils);
    
    console.log('✅ iOS 日期兼容性插件已安装');
  }
};

/**
 * 针对问题格式的快速修复函数
 * 专门处理错误报告中的格式："9/13/2025, 5:39:15 PM"
 */
export function quickFixProblematicDateString(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return dateString;
  }

  // 专门处理报告中的问题格式
  if (dateString.match(/\d{1,2}\/\d{1,2}\/\d{4},?\s*\d{1,2}:\d{1,2}:\d{1,2}\s*(AM|PM)/i)) {
    console.log('🔧 检测到问题日期格式，正在修复:', dateString);
    const fixed = IOSDateFix.convertToCompatibleFormat(dateString);
    console.log('✅ 修复完成:', fixed);
    return fixed;
  }

  return dateString;
}

/**
 * 应急修复方案
 * 当遇到 "new Date() 无法使用" 的错误时，快速应用修复
 * 专门针对 vendor.js 中的 "9/13/2025, 7:19:58 AM" 错误
 */
export function emergencyIOSDateFix() {
  console.log('🚨 应急 iOS 日期修复启动...');
  console.log('🎯 专门处理 vendor.js 中的日期兼容性问题');
  
  try {
    // 立即启用全局修复
    TimeUtils.enableGlobalIOSCompatibility();
    
    // 专门测试问题格式
    const problematicFormats = [
      "9/13/2025, 7:19:58 AM",
      "9/13/2025, 5:39:15 PM", 
      "1/1/2026, 12:00:00 AM",
      "12/25/2025, 11:59:59 PM"
    ];
    
    let successCount = 0;
    problematicFormats.forEach((format, index) => {
      try {
        const testResult = IOSDateFix.safeCreateDate(format);
        if (testResult) {
          console.log(`✅ 测试 ${index + 1}: "${format}" 修复成功`);
          console.log(`   结果: ${testResult.toISOString()}`);
          successCount++;
        } else {
          console.log(`❌ 测试 ${index + 1}: "${format}" 修复失败`);
        }
      } catch (error) {
        console.log(`❌ 测试 ${index + 1}: "${format}" 出现异常:`, error.message);
      }
    });
    
    if (successCount === problematicFormats.length) {
      console.log('✅ 应急修复成功! 所有问题格式都已修复');
      console.log('📱 iOS设备现在可以正常使用日期功能了');
      
      // 在全局对象上添加标记
      if (typeof window !== 'undefined') {
        window.iosDateFixApplied = true;
        window.iosDateFixTimestamp = new Date().toISOString();
      }
      
      return true;
    } else {
      console.log(`⚠️ 部分修复失败：${successCount}/${problematicFormats.length} 成功`);
      return false;
    }
  } catch (error) {
    console.error('❌ 应急修复过程中出错:', error);
    console.error('📊 错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

/**
 * 在开发环境中的调试助手
 */
export function debugIOSDateIssues() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🔍 iOS 日期兼容性调试模式');
  
  // 显示当前环境信息
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  
  console.log('📱 设备信息:');
  console.log('   iOS 设备:', isIOS);
  console.log('   Safari 浏览器:', isSafari);
  console.log('   User Agent:', userAgent);
  
  // 运行完整测试
  TimeUtils.testIOSCompatibility();
  
  // 提供调试函数到 window
  if (typeof window !== 'undefined') {
    window.debugIOSDate = {
      TimeUtils,
      IOSDateFix,
      testCompatibility: TimeUtils.testIOSCompatibility.bind(TimeUtils),
      quickFix: quickFixProblematicDateString,
      emergencyFix: emergencyIOSDateFix
    };
    
    console.log('🛠️  调试工具已添加到 window.debugIOSDate');
  }
}

// 默认导出
export default {
  setupIOSDateCompatibility,
  IOSDateCompatibilityPlugin,
  quickFixProblematicDateString,
  emergencyIOSDateFix,
  debugIOSDateIssues
};