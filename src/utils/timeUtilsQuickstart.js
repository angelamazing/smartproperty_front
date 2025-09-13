/**
 * TimeUtils 快速启动指南
 * 
 * 这个文件提供了使用增强版 TimeUtils 解决 iOS 日期兼容性问题的快速实施方案
 * 
 * 问题：new Date("9/13/2025, 5:39:15 PM") 在 iOS 上不兼容
 * 解决：使用 TimeUtils.parseTime() 替代
 */

import { TimeUtils } from '@/utils/timeUtils.js';

// ==================== 立即可用的解决方案 ====================

/**
 * 1. 基本用法 - 替代 new Date()
 */
export function quickExample() {
  const problematicDateString = "9/13/2025, 5:39:15 PM";
  
  console.log('🔧 iOS 日期兼容性修复演示:');
  
  // ❌ 原来可能出错的方式
  console.log('❌ 原来的方式（可能在 iOS 上失败）:');
  try {
    const originalDate = new Date(problematicDateString);
    console.log('   结果:', originalDate.toString());
  } catch (error) {
    console.log('   错误:', error.message);
  }
  
  // ✅ 现在推荐的方式
  console.log('✅ 新的方式（iOS 兼容）:');
  const parsedTime = TimeUtils.parseTime(problematicDateString);
  const formatted = TimeUtils.formatTime(parsedTime, 'YYYY-MM-DD HH:mm:ss');
  
  console.log('   解析结果:', parsedTime ? parsedTime.toString() : 'null');
  console.log('   格式化结果:', formatted);
  
  return { parsedTime, formatted };
}

/**
 * 2. 在 Vue 组件中的使用方法
 */
export const VueComponentExample = {
  data() {
    return {
      rawTime: "9/13/2025, 5:39:15 PM",
      userRegistrationTime: "12/25/2025, 11:59:59 PM",
      appointmentTime: "1/1/2026, 12:00:00 AM"
    };
  },
  
  computed: {
    // 格式化显示时间
    formattedTime() {
      const parsed = TimeUtils.parseTime(this.rawTime);
      return TimeUtils.formatTime(parsed, 'YYYY-MM-DD HH:mm:ss');
    },
    
    // 显示相对时间
    relativeTime() {
      const parsed = TimeUtils.parseTime(this.rawTime);
      return parsed ? TimeUtils.getRelativeTime(parsed) : '--';
    },
    
    // 格式化注册时间
    registrationDisplay() {
      return TimeUtils.formatTime(
        TimeUtils.parseTime(this.userRegistrationTime), 
        'YYYY年MM月DD日 HH:mm'
      );
    },
    
    // 预约时间处理
    appointmentDisplay() {
      const parsed = TimeUtils.parseTime(this.appointmentTime);
      return TimeUtils.formatForDisplay(parsed);
    }
  },
  
  methods: {
    // 处理时间选择
    handleTimeSelection(selectedTime) {
      const parsed = TimeUtils.parseTime(selectedTime);
      if (parsed) {
        // 转换为提交格式
        const submitFormat = TimeUtils.toUTCForSubmit(parsed);
        console.log('提交到后端的时间:', submitFormat);
        return submitFormat;
      }
      return null;
    },
    
    // 检查时间有效性
    isValidTime(timeString) {
      const parsed = TimeUtils.parseTime(timeString);
      return parsed && parsed.isValid();
    }
  }
};

/**
 * 3. 常用格式化方法
 */
export class QuickTimeFormatter {
  
  // 格式化为中文显示
  static toChinese(timeString) {
    const parsed = TimeUtils.parseTime(timeString);
    return TimeUtils.formatTime(parsed, 'YYYY年MM月DD日 HH:mm:ss');
  }
  
  // 格式化为简短显示
  static toShort(timeString) {
    const parsed = TimeUtils.parseTime(timeString);
    return TimeUtils.formatTime(parsed, 'MM-DD HH:mm');
  }
  
  // 格式化为日期
  static toDateOnly(timeString) {
    const parsed = TimeUtils.parseTime(timeString);
    return TimeUtils.formatTime(parsed, 'YYYY-MM-DD');
  }
  
  // 格式化为时间
  static toTimeOnly(timeString) {
    const parsed = TimeUtils.parseTime(timeString);
    return TimeUtils.formatTime(parsed, 'HH:mm:ss');
  }
  
  // 智能显示（今天、昨天、明天）
  static toSmart(timeString) {
    return TimeUtils.formatForDisplay(timeString);
  }
}

/**
 * 4. 批量处理时间数据
 */
export function batchProcessTimes(timeArray) {
  return timeArray.map(timeString => {
    const parsed = TimeUtils.parseTime(timeString);
    return {
      original: timeString,
      parsed: parsed ? parsed.toISOString() : null,
      formatted: TimeUtils.formatTime(parsed, 'YYYY-MM-DD HH:mm:ss'),
      isValid: parsed && parsed.isValid(),
      relativeTime: parsed ? TimeUtils.getRelativeTime(parsed) : '--'
    };
  });
}

/**
 * 5. API 数据处理示例
 */
export function handleApiResponse(apiData) {
  // 假设后端返回的数据结构
  const processedData = {
    ...apiData,
    // 处理注册时间
    registerTime: apiData.registerTime ? 
      TimeUtils.formatTime(TimeUtils.parseTime(apiData.registerTime), 'YYYY-MM-DD HH:mm:ss') : '--',
    
    // 处理最后登录时间
    lastLoginTime: apiData.lastLoginTime ? 
      TimeUtils.formatForDisplay(apiData.lastLoginTime) : '从未登录',
    
    // 处理创建时间
    createTime: apiData.createTime ? 
      TimeUtils.formatTime(TimeUtils.parseTime(apiData.createTime), 'YYYY年MM月DD日') : '--',
    
    // 处理更新时间
    updateTime: apiData.updateTime ? 
      TimeUtils.getRelativeTime(apiData.updateTime) : '--'
  };
  
  return processedData;
}

/**
 * 6. 表单时间处理
 */
export class FormTimeHandler {
  
  // 处理表单提交时间
  static prepareForSubmit(formData) {
    const processed = { ...formData };
    
    // 转换所有时间字段为 UTC 格式
    const timeFields = ['startTime', 'endTime', 'appointmentTime', 'deadline'];
    
    timeFields.forEach(field => {
      if (processed[field]) {
        const parsed = TimeUtils.parseTime(processed[field]);
        if (parsed) {
          processed[field] = TimeUtils.toUTCForSubmit(parsed);
        }
      }
    });
    
    return processed;
  }
  
  // 处理表单显示时间
  static prepareForDisplay(formData) {
    const processed = { ...formData };
    
    // 转换所有时间字段为显示格式
    const timeFields = ['startTime', 'endTime', 'appointmentTime', 'deadline'];
    
    timeFields.forEach(field => {
      if (processed[field]) {
        const parsed = TimeUtils.parseTime(processed[field]);
        processed[field] = TimeUtils.formatTime(parsed, 'YYYY-MM-DD HH:mm');
      }
    });
    
    return processed;
  }
}

/**
 * 7. 快速测试函数
 */
export function quickTest() {
  console.log('🧪 开始快速测试 TimeUtils...');
  
  const testCases = [
    "9/13/2025, 5:39:15 PM",     // 主要问题格式
    "1/1/2026, 12:00:00 AM",     // 午夜时间
    "12/25/2025, 11:59:59 PM",   // 晚上时间
    "9/2/2025, 3:35:21 AM",      // 凌晨时间
    "9/13/2025",                 // 纯日期格式
    "2025-09-13T17:39:15.000Z",  // ISO 格式
    "2025-09-13 17:39:15",       // 标准格式
  ];
  
  const results = testCases.map((testCase, index) => {
    const parsed = TimeUtils.parseTime(testCase);
    const formatted = TimeUtils.formatTime(parsed, 'YYYY-MM-DD HH:mm:ss');
    const isValid = parsed && parsed.isValid();
    
    console.log(`测试 ${index + 1}: ${testCase}`);
    console.log(`  解析结果: ${isValid ? '✅ 成功' : '❌ 失败'}`);
    console.log(`  格式化: ${formatted}`);
    console.log('');
    
    return { testCase, isValid, formatted };
  });
  
  const successCount = results.filter(r => r.isValid).length;
  console.log(`📊 测试完成: ${successCount}/${results.length} 通过`);
  
  return results;
}

// ==================== 导出所有功能 ====================
export default {
  TimeUtils,
  quickExample,
  VueComponentExample,
  QuickTimeFormatter,
  batchProcessTimes,
  handleApiResponse,
  FormTimeHandler,
  quickTest
};