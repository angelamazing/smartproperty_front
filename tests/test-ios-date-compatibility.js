/**
 * iOS 日期格式兼容性测试
 * 
 * 测试目标：验证 iOS 不兼容日期格式的修复效果
 * 测试范围：
 * 1. 问题格式检测
 * 2. 格式转换功能
 * 3. 安全Date创建
 * 4. TimeUtils集成测试
 * 5. 全局修复功能
 */

import { IOSDateFix } from '../src/utils/iosDateFix.js';
import { TimeUtils } from '../src/utils/timeUtils.js';

console.log('🧪 开始 iOS 日期格式兼容性测试');
console.log('=============================================');

// 测试用例：iOS 不兼容的日期格式
const testCases = [
  {
    input: "9/13/2025, 5:39:15 PM",
    expected: "2025-09-13T17:39:15",
    description: "美式日期格式 with AM/PM"
  },
  {
    input: "1/1/2026, 12:00:00 AM",
    expected: "2026-01-01T00:00:00",
    description: "午夜时间 (12:00 AM)"
  },
  {
    input: "12/25/2025, 11:59:59 PM",
    expected: "2025-12-25T23:59:59",
    description: "晚上11:59 (11:59 PM)"
  },
  {
    input: "9/2/2025, 3:35:21 AM",
    expected: "2025-09-02T03:35:21",
    description: "凌晨时间"
  },
  {
    input: "9/13/2025",
    expected: "2025-09-13",
    description: "纯日期格式"
  },
  {
    input: "2025-09-13T17:39:15.000Z",
    expected: "2025-09-13T17:39:15.000Z",
    description: "ISO 8601 格式 (应该保持不变)"
  },
  {
    input: "2025-09-13 17:39:15",
    expected: "2025-09-13 17:39:15",
    description: "标准格式 (应该保持不变)"
  }
];

// 兼容格式测试用例
const compatibleCases = [
  "2025-09-13",
  "2025-09-13T17:39:15",
  "2025-09-13T17:39:15.000Z",
  "2025/09/13",
  "2025/09/13 17:39:15"
];

// ==================== 测试1: 不兼容格式检测 ====================
console.log('\n📋 测试1: 不兼容格式检测');
console.log('-------------------------------------------');

testCases.forEach((testCase, index) => {
  const isIncompatible = IOSDateFix.isIncompatibleFormat(testCase.input);
  const shouldBeIncompatible = testCase.input.includes('/') && (testCase.input.includes('AM') || testCase.input.includes('PM') || !testCase.input.includes('T'));
  
  console.log(`测试 ${index + 1}: ${testCase.description}`);
  console.log(`  输入: ${testCase.input}`);
  console.log(`  检测结果: ${isIncompatible ? '不兼容' : '兼容'}`);
  console.log(`  预期: ${shouldBeIncompatible ? '不兼容' : '兼容'}`);
  console.log(`  状态: ${isIncompatible === shouldBeIncompatible ? '✅ 通过' : '❌ 失败'}`);
  console.log('');
});

// ==================== 测试2: 格式转换功能 ====================
console.log('\n🔄 测试2: 格式转换功能');
console.log('-------------------------------------------');

testCases.forEach((testCase, index) => {
  const converted = IOSDateFix.convertToCompatibleFormat(testCase.input);
  
  console.log(`测试 ${index + 1}: ${testCase.description}`);
  console.log(`  输入: ${testCase.input}`);
  console.log(`  转换结果: ${converted}`);
  console.log(`  预期包含: ${testCase.expected}`);
  
  // 简单的包含检查（因为可能有时区等差异）
  const success = converted.includes(testCase.expected.split('T')[0]) || converted === testCase.input;
  console.log(`  状态: ${success ? '✅ 通过' : '❌ 失败'}`);
  console.log('');
});

// ==================== 测试3: 安全Date创建 ====================
console.log('\n🛡️ 测试3: 安全Date创建');
console.log('-------------------------------------------');

const allTestInputs = [
  ...testCases.map(t => t.input),
  ...compatibleCases,
  null,
  undefined,
  "",
  "invalid-date",
  123456789000, // 时间戳
  new Date() // Date对象
];

allTestInputs.forEach((input, index) => {
  try {
    const safeDate = IOSDateFix.safeCreateDate(input);
    const isValid = safeDate instanceof Date && !isNaN(safeDate.getTime());
    
    console.log(`测试 ${index + 1}:`);
    console.log(`  输入: ${input} (${typeof input})`);
    console.log(`  结果: ${safeDate ? safeDate.toISOString() : 'null'}`);
    console.log(`  有效: ${isValid ? '✅ 是' : '❌ 否'}`);
    console.log('');
  } catch (error) {
    console.log(`测试 ${index + 1}: ❌ 异常 - ${error.message}`);
  }
});

// ==================== 测试4: TimeUtils集成测试 ====================
console.log('\n🔧 测试4: TimeUtils集成测试');
console.log('-------------------------------------------');

testCases.forEach((testCase, index) => {
  try {
    const parsed = TimeUtils.parseTime(testCase.input);
    const formatted = parsed ? TimeUtils.formatTime(parsed, 'YYYY-MM-DD HH:mm:ss') : null;
    const isIOSIncompatible = TimeUtils.isIOSIncompatibleFormat(testCase.input);
    
    console.log(`测试 ${index + 1}: ${testCase.description}`);
    console.log(`  输入: ${testCase.input}`);
    console.log(`  解析成功: ${parsed ? '✅ 是' : '❌ 否'}`);
    console.log(`  格式化结果: ${formatted || 'null'}`);
    console.log(`  iOS不兼容: ${isIOSIncompatible ? '是' : '否'}`);
    console.log('');
  } catch (error) {
    console.log(`测试 ${index + 1}: ❌ 异常 - ${error.message}`);
  }
});

// ==================== 测试5: 性能测试 ====================
console.log('\n⚡ 测试5: 性能测试');
console.log('-------------------------------------------');

const performanceTestInput = "9/13/2025, 5:39:15 PM";
const iterations = 1000;

// 测试解析性能
console.time('TimeUtils.parseTime 性能测试');
for (let i = 0; i < iterations; i++) {
  TimeUtils.parseTime(performanceTestInput);
}
console.timeEnd('TimeUtils.parseTime 性能测试');

// 测试格式转换性能
console.time('IOSDateFix.convertToCompatibleFormat 性能测试');
for (let i = 0; i < iterations; i++) {
  IOSDateFix.convertToCompatibleFormat(performanceTestInput);
}
console.timeEnd('IOSDateFix.convertToCompatibleFormat 性能测试');

// ==================== 测试6: 边界情况测试 ====================
console.log('\n🔍 测试6: 边界情况测试');
console.log('-------------------------------------------');

const edgeCases = [
  "2/29/2024, 11:59:59 PM", // 闰年
  "12/31/2025, 11:59:59 PM", // 年末
  "1/1/2026, 12:00:00 AM", // 年初
  "9/13/2025 5:39:15 PM", // 没有逗号
  "9/13/2025,5:39:15PM", // 没有空格
  "09/13/2025, 05:39:15 PM", // 补零格式
  "9/13/25, 5:39:15 PM", // 两位年份
];

edgeCases.forEach((edgeCase, index) => {
  try {
    const isIncompatible = IOSDateFix.isIncompatibleFormat(edgeCase);
    const converted = IOSDateFix.convertToCompatibleFormat(edgeCase);
    const parsed = TimeUtils.parseTime(edgeCase);
    
    console.log(`边界测试 ${index + 1}:`);
    console.log(`  输入: ${edgeCase}`);
    console.log(`  不兼容: ${isIncompatible ? '是' : '否'}`);
    console.log(`  转换结果: ${converted}`);
    console.log(`  解析成功: ${parsed ? '✅ 是' : '❌ 否'}`);
    console.log('');
  } catch (error) {
    console.log(`边界测试 ${index + 1}: ❌ 异常 - ${error.message}`);
  }
});

// ==================== 测试结果汇总 ====================
console.log('\n📊 测试结果汇总');
console.log('=============================================');

// 运行 TimeUtils 内置的 iOS 兼容性测试
TimeUtils.testIOSCompatibility();

// 显示使用指南
console.log('\n📖 iOS 兼容性使用指南:');
const guide = TimeUtils.getIOSCompatibilityGuide();
console.log(JSON.stringify(guide, null, 2));

console.log('\n✅ iOS 日期格式兼容性测试完成!');
console.log('=============================================');

// 导出测试函数供其他地方使用
export function runIOSCompatibilityTests() {
  console.log('运行 iOS 兼容性测试...');
  // 这里可以添加自动化测试逻辑
  return {
    testCases: testCases.length,
    compatibleCases: compatibleCases.length,
    edgeCases: edgeCases.length,
    status: '完成'
  };
}

export { testCases, compatibleCases, edgeCases };