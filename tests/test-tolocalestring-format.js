/**
 * 测试使用toLocaleString()的formatDate方法
 */

// 模拟改进后的formatDate方法
function formatDate(dateString) {
  if (!dateString) return '未设置';
  
  try {
    // 使用toLocaleString()方法，支持本地化格式
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '未设置';
    
    // 使用toLocaleString()格式化日期，24小时制
    const formattedDate = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false
    });
    
    // 提取日期部分（去掉时间部分）
    return formattedDate.split(' ')[0];
  } catch (error) {
    console.error('日期格式化错误:', error, '输入值:', dateString);
    // 备用方案：手动格式化
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
  console.log('开始测试toLocaleString()格式化的formatDate方法...\n');
  
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
      input: '2025-12-25T15:30:45.123Z',
      description: '带时间的ISO格式'
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
      input: 'invalid-date',
      description: '无效日期字符串'
    },
    {
      input: '9/12/2025, 5:13:46 PM',
      description: 'iOS不兼容格式'
    },
    {
      input: '2025-03-08T14:25:30.000Z',
      description: '国际妇女节日期'
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
      
      // 检查结果格式是否正确（YYYY-MM-DD格式）
      if (result === '未设置' || result.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log('✅ 测试通过\n');
        passedTests++;
      } else {
        console.log('❌ 测试失败: 格式不正确\n');
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}\n`);
    }
  });
  
  console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试都通过了！toLocaleString()方法工作正常！');
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
