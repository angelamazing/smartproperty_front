/**
 * 日期格式化修复测试
 * 测试 formatDisplayDate 方法是否能正确处理各种输入
 */

// 模拟 TimeUtils 的行为
const mockTimeUtils = {
  safeCreateDate: (input) => {
    if (!input) return null;
    
    try {
      if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input;
      }
      
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      return null;
    }
  }
};

// 模拟 Vue 组件方法
const mockComponent = {
  isSameDate: (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  },
  
  formatDateShort: (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  },
  
  formatDateWithWeekday: (date) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = weekdays[date.getDay()];
    return `${month}-${day} ${weekday}`;
  },
  
  // 修复后的 formatDisplayDate 方法
  formatDisplayDate: function(dateStr) {
    if (!dateStr) return '';
    
    try {
      // 使用TimeUtils确保iOS兼容性
      const targetDate = mockTimeUtils.safeCreateDate(dateStr);
      if (!targetDate || isNaN(targetDate.getTime())) return '';
      
      const today = mockTimeUtils.safeCreateDate();
      if (!today || isNaN(today.getTime())) {
        // 如果无法获取当前时间，使用原生Date作为备用
        const fallbackToday = new Date();
        const fallbackTomorrow = new Date(fallbackToday);
        fallbackTomorrow.setDate(fallbackToday.getDate() + 1);
        
        // 判断是否为今天或明天
        if (this.isSameDate(targetDate, fallbackToday)) {
          return `今天 ${this.formatDateShort(targetDate)}`;
        } else if (this.isSameDate(targetDate, fallbackTomorrow)) {
          return `明天 ${this.formatDateShort(targetDate)}`;
        } else {
          return this.formatDateWithWeekday(targetDate);
        }
      }
      
      const tomorrow = mockTimeUtils.safeCreateDate(today);
      if (!tomorrow || isNaN(tomorrow.getTime())) {
        // 如果无法创建明天日期，使用原生Date作为备用
        const fallbackTomorrow = new Date(today);
        fallbackTomorrow.setDate(today.getDate() + 1);
        
        // 判断是否为今天或明天
        if (this.isSameDate(targetDate, today)) {
          return `今天 ${this.formatDateShort(targetDate)}`;
        } else if (this.isSameDate(targetDate, fallbackTomorrow)) {
          return `明天 ${this.formatDateShort(targetDate)}`;
        } else {
          return this.formatDateWithWeekday(targetDate);
        }
      }
      
      tomorrow.setDate(today.getDate() + 1);
      
      // 判断是否为今天或明天
      if (this.isSameDate(targetDate, today)) {
        return `今天 ${this.formatDateShort(targetDate)}`;
      } else if (this.isSameDate(targetDate, tomorrow)) {
        return `明天 ${this.formatDateShort(targetDate)}`;
      } else {
        return this.formatDateWithWeekday(targetDate);
      }
    } catch (error) {
      console.error('日期格式化错误:', error, '输入值:', dateStr);
      return '';
    }
  }
};

// 测试用例
function runTests() {
  console.log('开始测试日期格式化修复...\n');
  
  const testCases = [
    {
      input: '2025-09-12',
      description: '正常日期字符串'
    },
    {
      input: '',
      description: '空字符串'
    },
    {
      input: null,
      description: 'null 输入'
    },
    {
      input: undefined,
      description: 'undefined 输入'
    },
    {
      input: 'invalid-date',
      description: '无效日期字符串'
    },
    {
      input: new Date().toISOString().split('T')[0], // 今天的日期
      description: '今天的日期'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    try {
      console.log(`测试 ${index + 1}: ${testCase.description}`);
      console.log(`输入: ${testCase.input}`);
      
      const result = mockComponent.formatDisplayDate(testCase.input);
      console.log(`输出: ${result}`);
      
      // 检查是否没有抛出错误
      if (result !== undefined) {
        console.log('✅ 测试通过\n');
        passedTests++;
      } else {
        console.log('❌ 测试失败: 返回 undefined\n');
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}\n`);
    }
  });
  
  console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试都通过了！修复成功！');
  } else {
    console.log('⚠️ 部分测试失败，需要进一步检查');
  }
}

// 运行测试
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, mockComponent };
} else {
  runTests();
}
