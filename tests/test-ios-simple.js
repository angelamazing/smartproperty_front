/**
 * 简化版 iOS 日期兼容性测试
 * CommonJS 格式，可以直接在 Node.js 中运行
 */

console.log('🧪 开始 iOS 日期格式兼容性测试');
console.log('=============================================');

// 测试用例：iOS 不兼容的日期格式
const testCases = [
  {
    input: "9/13/2025, 5:39:15 PM",
    description: "美式日期格式 with AM/PM - 主要问题格式"
  },
  {
    input: "1/1/2026, 12:00:00 AM",
    description: "午夜时间 (12:00 AM)"
  },
  {
    input: "12/25/2025, 11:59:59 PM",
    description: "晚上11:59 (11:59 PM)"
  },
  {
    input: "9/2/2025, 3:35:21 AM",
    description: "凌晨时间"
  },
  {
    input: "9/13/2025",
    description: "纯日期格式"
  }
];

// ==================== 基础兼容性检测 ====================
console.log('\n📋 测试1: 基础日期格式兼容性检测');
console.log('-------------------------------------------');

function isIOSIncompatibleFormat(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const patterns = [
    // M/D/YYYY, H:mm:ss AM/PM 格式
    /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM)/i,
    // M/D/YYYY, H:mm AM/PM 格式 (没有秒)
    /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2})\s*(AM|PM)/i,
    // M/D/YYYY 格式
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // 含有逗号的美式日期格式
    /(\d{1,2})\/(\d{1,2})\/(\d{4}),/
  ];

  return patterns.some(pattern => pattern.test(dateString.trim()));
}

testCases.forEach((testCase, index) => {
  const isIncompatible = isIOSIncompatibleFormat(testCase.input);
  
  console.log(`测试 ${index + 1}: ${testCase.description}`);
  console.log(`  输入: ${testCase.input}`);
  console.log(`  检测结果: ${isIncompatible ? '❌ iOS 不兼容' : '✅ 兼容'}`);
  console.log('');
});

// ==================== 格式转换测试 ====================
console.log('\n🔄 测试2: 格式转换功能');
console.log('-------------------------------------------');

function convertToIOSCompatibleFormat(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return dateString;
  }

  let cleanString = dateString.trim();

  try {
    // 处理 "9/13/2025, 5:39:15 PM" 格式
    const ampmWithSecondsMatch = cleanString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM)/i);
    if (ampmWithSecondsMatch) {
      let [, month, day, year, hour, minute, second, ampm] = ampmWithSecondsMatch;
      
      // 转换AM/PM为24小时制
      let hour24 = parseInt(hour);
      if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      // 补零
      month = month.padStart(2, '0');
      day = day.padStart(2, '0');
      hour = hour24.toString().padStart(2, '0');
      minute = minute.padStart(2, '0');
      second = second.padStart(2, '0');
      
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }

    // 处理 "9/13/2025" 格式
    const dateOnlyMatch = cleanString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dateOnlyMatch) {
      const [, month, day, year] = dateOnlyMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return dateString;
  } catch (error) {
    console.error('日期格式转换失败:', error);
    return dateString;
  }
}

testCases.forEach((testCase, index) => {
  const converted = convertToIOSCompatibleFormat(testCase.input);
  const isChanged = converted !== testCase.input;
  
  console.log(`测试 ${index + 1}: ${testCase.description}`);
  console.log(`  输入: ${testCase.input}`);
  console.log(`  转换结果: ${converted}`);
  console.log(`  状态: ${isChanged ? '✅ 已转换' : '➡️  无需转换'}`);
  console.log('');
});

// ==================== 实际Date创建测试 ====================
console.log('\n🛡️ 测试3: Date 对象创建验证');
console.log('-------------------------------------------');

function safeCreateDate(input) {
  if (!input) return null;
  
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  
  if (typeof input === 'string') {
    try {
      // 检查是否为不兼容格式
      if (isIOSIncompatibleFormat(input)) {
        const compatibleFormat = convertToIOSCompatibleFormat(input);
        const date = new Date(compatibleFormat);
        return isNaN(date.getTime()) ? null : date;
      }
      
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('创建Date对象失败:', error);
      return null;
    }
  }
  
  return null;
}

testCases.forEach((testCase, index) => {
  console.log(`测试 ${index + 1}: ${testCase.description}`);
  console.log(`  输入: ${testCase.input}`);
  
  // 测试原生 new Date()
  let originalResult = null;
  let originalError = null;
  try {
    originalResult = new Date(testCase.input);
    if (isNaN(originalResult.getTime())) {
      originalError = 'Invalid Date';
    }
  } catch (error) {
    originalError = error.message;
  }
  
  // 测试安全创建方法
  const safeResult = safeCreateDate(testCase.input);
  
  console.log(`  原生 new Date(): ${originalError ? '❌ ' + originalError : '✅ ' + originalResult.toISOString()}`);
  console.log(`  安全创建方法: ${safeResult ? '✅ ' + safeResult.toISOString() : '❌ 失败'}`);
  console.log(`  修复效果: ${originalError && safeResult ? '✅ 成功修复' : originalError ? '❌ 仍有问题' : '✅ 正常'}`);
  console.log('');
});

// ==================== 性能基准测试 ====================
console.log('\n⚡ 测试4: 性能基准测试');
console.log('-------------------------------------------');

const performanceTestInput = "9/13/2025, 5:39:15 PM";
const iterations = 1000;

console.time('格式检测性能 (1000次)');
for (let i = 0; i < iterations; i++) {
  isIOSIncompatibleFormat(performanceTestInput);
}
console.timeEnd('格式检测性能 (1000次)');

console.time('格式转换性能 (1000次)');
for (let i = 0; i < iterations; i++) {
  convertToIOSCompatibleFormat(performanceTestInput);
}
console.timeEnd('格式转换性能 (1000次)');

console.time('安全Date创建性能 (1000次)');
for (let i = 0; i < iterations; i++) {
  safeCreateDate(performanceTestInput);
}
console.timeEnd('安全Date创建性能 (1000次)');

// ==================== 边界情况测试 ====================
console.log('\n🔍 测试5: 边界情况测试');
console.log('-------------------------------------------');

const edgeCases = [
  "2/29/2024, 11:59:59 PM", // 闰年
  "12/31/2025, 11:59:59 PM", // 年末
  "1/1/2026, 12:00:00 AM", // 年初
  "9/13/2025 5:39:15 PM", // 没有逗号
  "9/13/2025,5:39:15PM", // 没有空格
  "09/13/2025, 05:39:15 PM", // 补零格式
  null,
  undefined,
  "",
  "invalid-date"
];

edgeCases.forEach((edgeCase, index) => {
  console.log(`边界测试 ${index + 1}:`);
  console.log(`  输入: ${edgeCase} (${typeof edgeCase})`);
  
  try {
    const isIncompatible = isIOSIncompatibleFormat(edgeCase);
    const converted = convertToIOSCompatibleFormat(edgeCase);
    const safeResult = safeCreateDate(edgeCase);
    
    console.log(`  不兼容: ${isIncompatible ? '是' : '否'}`);
    console.log(`  转换结果: ${converted}`);
    console.log(`  安全创建: ${safeResult ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`  ❌ 异常: ${error.message}`);
  }
  console.log('');
});

// ==================== 测试结果汇总 ====================
console.log('\n📊 测试结果汇总');
console.log('=============================================');

let totalTests = 0;
let passedTests = 0;

// 统计主要测试用例的成功率
testCases.forEach((testCase) => {
  totalTests++;
  const safeResult = safeCreateDate(testCase.input);
  if (safeResult) {
    passedTests++;
  }
});

console.log(`✅ 测试完成!`);
console.log(`📋 总测试数: ${totalTests}`);
console.log(`✅ 通过测试: ${passedTests}`);
console.log(`❌ 失败测试: ${totalTests - passedTests}`);
console.log(`📊 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 所有测试通过! iOS 日期兼容性修复成功!');
} else {
  console.log('\n⚠️  部分测试失败，需要进一步优化');
}

console.log('\n💡 使用建议:');
console.log('1. 在项目中使用 safeCreateDate() 替代 new Date()');
console.log('2. 优先使用 convertToIOSCompatibleFormat() 预处理日期字符串');
console.log('3. 在 iOS 设备上进行实际测试验证');
console.log('4. 考虑使用 TimeUtils 类获得更完整的解决方案');

console.log('\n=============================================');
console.log('🧪 iOS 日期格式兼容性测试完成!');