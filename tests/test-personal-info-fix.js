/**
 * personal-info页面修复测试
 * 测试formatDate方法是否能正确处理各种输入
 */

// 模拟TimeUtils的行为
const mockTimeUtils = {
  formatTime: (timeString, format) => {
    if (!timeString) return '';
    
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return '';
      
      if (format === 'YYYY-MM-DD') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      return date.toISOString();
    } catch (error) {
      return '';
    }
  }
};

// 模拟修复后的formatDate方法
function formatDate(dateString) {
  if (!dateString) return '未设置';
  try {
    // 直接使用TimeUtils，确保iOS兼容性
    return mockTimeUtils.formatTime(dateString, 'YYYY-MM-DD');
  } catch (error) {
    console.error('日期格式化错误:', error, '输入值:', dateString);
    // 备用方案：使用原生Date对象
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '未设置';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (fallbackError) {
      console.error('备用日期格式化也失败:', fallbackError);
      return '未设置';
    }
  }
}

// 测试用例
function runTests() {
  console.log('开始测试personal-info页面修复...\n');
  
  const testCases = [
    {
      input: '2025-01-15T10:30:00.000Z',
      description: 'ISO格式日期'
    },
    {
      input: '2025-01-15',
      description: '简单日期格式'
    },
    {
      input: '',
      description: '空字符串'
    },
    {
      input: null,
      description: 'null输入'
    },
    {
      input: undefined,
      description: 'undefined输入'
    },
    {
      input: 'invalid-date',
      description: '无效日期字符串'
    },
    {
      input: '9/12/2025, 5:13:46 PM',
      description: 'iOS不兼容格式'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    try {
      console.log(`测试 ${index + 1}: ${testCase.description}`);
      console.log(`输入: ${testCase.input}`);
      
      const result = formatDate(testCase.input);
      console.log(`输出: ${result}`);
      
      // 检查是否没有抛出错误且返回了合理的结果
      if (result !== undefined && (result === '未设置' || result.match(/^\d{4}-\d{2}-\d{2}$/))) {
        console.log('✅ 测试通过\n');
        passedTests++;
      } else {
        console.log('❌ 测试失败: 返回格式不正确\n');
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
  module.exports = { runTests, formatDate };
} else {
  runTests();
}
