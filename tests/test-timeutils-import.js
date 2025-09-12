/**
 * 测试TimeUtils导入和formatDate方法
 */

// 模拟TimeUtils类
class MockTimeUtils {
  static formatTime(timeString, format) {
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
}

// 模拟修复后的formatDate方法
function formatDate(dateString) {
  if (!dateString) return '未设置';
  try {
    // 直接使用TimeUtils，确保iOS兼容性
    return MockTimeUtils.formatTime(dateString, 'YYYY-MM-DD');
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
  console.log('开始测试TimeUtils导入和formatDate方法...\n');
  
  const testCases = [
    {
      input: '2025-01-15T10:30:00.000Z',
      description: 'ISO格式日期',
      expected: '2025-01-15'
    },
    {
      input: '2025-01-15',
      description: '简单日期格式',
      expected: '2025-01-15'
    },
    {
      input: '',
      description: '空字符串',
      expected: '未设置'
    },
    {
      input: null,
      description: 'null输入',
      expected: '未设置'
    },
    {
      input: 'invalid-date',
      description: '无效日期字符串',
      expected: '未设置'
    },
    {
      input: '9/12/2025, 5:13:46 PM',
      description: 'iOS不兼容格式',
      expected: '2025-09-12'
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
      console.log(`期望: ${testCase.expected}`);
      
      // 检查结果是否正确
      if (result === testCase.expected) {
        console.log('✅ 测试通过\n');
        passedTests++;
      } else {
        console.log('❌ 测试失败: 结果不匹配\n');
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
  module.exports = { runTests, formatDate, MockTimeUtils };
} else {
  runTests();
}
