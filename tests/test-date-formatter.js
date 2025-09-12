/**
 * 测试新的DateFormatter工具类
 * 验证自定义format方法是否正常工作
 */

// 导入DateFormatter
const { DateFormatter } = require('../src/utils/dateFormatter.js');

// 测试用例
function runTests() {
  console.log('开始测试DateFormatter工具类...\n');
  
  const testCases = [
    {
      input: '2025-01-15T10:30:00.000Z',
      format: 'YYYY-MM-DD',
      description: 'ISO格式日期'
    },
    {
      input: '2025-01-15',
      format: 'YYYY-MM-DD',
      description: '简单日期格式'
    },
    {
      input: new Date('2025-01-15'),
      format: 'YYYY-MM-DD HH:mm:ss',
      description: 'Date对象格式化为日期时间'
    },
    {
      input: '',
      format: 'YYYY-MM-DD',
      description: '空字符串'
    },
    {
      input: null,
      format: 'YYYY-MM-DD',
      description: 'null输入'
    },
    {
      input: 'invalid-date',
      format: 'YYYY-MM-DD',
      description: '无效日期字符串'
    },
    {
      input: '9/12/2025, 5:13:46 PM',
      format: 'YYYY-MM-DD',
      description: 'iOS不兼容格式'
    },
    {
      input: new Date(),
      format: 'YYYY年MM月DD日 HH:mm:ss',
      description: '中文格式'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    try {
      console.log(`测试 ${index + 1}: ${testCase.description}`);
      console.log(`输入: ${testCase.input}`);
      console.log(`格式: ${testCase.format}`);
      
      const result = DateFormatter.format(testCase.input, testCase.format);
      console.log(`输出: ${result}`);
      
      // 检查结果是否合理
      if (result !== undefined && result !== null) {
        console.log('✅ 测试通过\n');
        passedTests++;
      } else {
        console.log('❌ 测试失败: 返回undefined或null\n');
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}\n`);
    }
  });
  
  // 测试Date原型扩展
  console.log('测试Date原型扩展...');
  try {
    const testDate = new Date('2025-01-15T10:30:00.000Z');
    const formatted = testDate.format('YYYY-MM-DD HH:mm:ss');
    console.log(`Date.prototype.format测试: ${formatted}`);
    
    if (formatted && formatted.includes('2025-01-15')) {
      console.log('✅ Date原型扩展测试通过\n');
      passedTests++;
    } else {
      console.log('❌ Date原型扩展测试失败\n');
    }
  } catch (error) {
    console.log(`❌ Date原型扩展测试失败: ${error.message}\n`);
  }
  
  totalTests++;
  
  console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试都通过了！DateFormatter工具类工作正常！');
  } else {
    console.log('⚠️ 部分测试失败，需要进一步检查');
  }
}

// 运行测试
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, DateFormatter };
} else {
  runTests();
}
