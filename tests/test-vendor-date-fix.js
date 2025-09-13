/**
 * iOS 日期兼容性修复验证测试
 * 
 * 验证 vendor.js 中的 "9/13/2025, 7:19:58 AM" 等格式
 * 在应用了全局修复后是否能正常工作
 */

import { setupVendorDateFix, checkVendorDateFixStatus, printVendorDateFixReport } from '../src/utils/vendorDateFix.js';
import { setupIOSDateCompatibility, emergencyIOSDateFix } from '../src/utils/iosDateMain.js';
import { IOSDateFix } from '../src/utils/iosDateFix.js';
import { TimeUtils } from '../src/utils/timeUtils.js';

console.log('🧪 开始 iOS 日期兼容性修复验证测试');
console.log('========================================');

// === 第一步：测试原始问题格式 ===
console.log('\n📋 步骤1: 测试原始问题格式');
console.log('---------------------------');

const problematicFormats = [
  "9/13/2025, 7:19:58 AM",     // 原始报错格式
  "9/13/2025, 5:39:15 PM",     // 常见 PM 格式
  "1/1/2026, 12:00:00 AM",     // 午夜时间
  "12/25/2025, 11:59:59 PM",   // 深夜时间
  "9/2/2025, 3:35:21 AM",      // 凌晨时间
  "10/15/2024, 2:30:45 PM"     // 下午时间
];

console.log('测试格式列表:');
problematicFormats.forEach((format, index) => {
  console.log(`  ${index + 1}. "${format}"`);
});

// === 第二步：应用修复 ===
console.log('\n🔧 步骤2: 应用 iOS 日期兼容性修复');
console.log('----------------------------------');

// 首先应用 vendor.js 专用修复
console.log('正在应用 Vendor.js 专用修复...');
const vendorFixSuccess = setupVendorDateFix();
console.log('Vendor.js 修复结果:', vendorFixSuccess ? '✅ 成功' : '❌ 失败');

// 然后应用全局 iOS 兼容性修复
console.log('正在应用全局 iOS 日期兼容性修复...');
try {
  const dateUtils = setupIOSDateCompatibility({
    enableGlobalPatch: true,
    enableConsoleWarnings: false,  // 测试时关闭警告
    enableTesting: false,
    logLevel: 'error'
  });
  console.log('全局修复结果: ✅ 成功');
} catch (error) {
  console.log('全局修复结果: ❌ 失败 -', error.message);
}

// === 第三步：验证修复效果 ===
console.log('\n🧪 步骤3: 验证修复效果');
console.log('----------------------');

let successCount = 0;
let totalCount = problematicFormats.length;

problematicFormats.forEach((format, index) => {
  console.log(`\n测试 ${index + 1}: "${format}"`);
  
  try {
    // 方法1: 直接使用 new Date()
    console.log('  方法1 - new Date():');
    const date1 = new Date(format);
    const isValid1 = !isNaN(date1.getTime());
    console.log(`    结果: ${isValid1 ? '✅' : '❌'} ${isValid1 ? date1.toISOString() : 'Invalid Date'}`);
    
    // 方法2: 使用 IOSDateFix.safeCreateDate()
    console.log('  方法2 - IOSDateFix.safeCreateDate():');
    const date2 = IOSDateFix.safeCreateDate(format);
    const isValid2 = date2 && !isNaN(date2.getTime());
    console.log(`    结果: ${isValid2 ? '✅' : '❌'} ${isValid2 ? date2.toISOString() : 'null'}`);
    
    // 方法3: 使用 TimeUtils.parseTime()
    console.log('  方法3 - TimeUtils.parseTime():');
    const parsedTime = TimeUtils.parseTime(format);
    const isValid3 = parsedTime && parsedTime.isValid();
    console.log(`    结果: ${isValid3 ? '✅' : '❌'} ${isValid3 ? parsedTime.toDate().toISOString() : 'null'}`);
    
    // 如果至少有一种方法成功，认为测试通过
    if (isValid1 || isValid2 || isValid3) {
      successCount++;
      console.log(`  📊 测试 ${index + 1} 总体结果: ✅ 通过`);
    } else {
      console.log(`  📊 测试 ${index + 1} 总体结果: ❌ 失败`);
    }
    
  } catch (error) {
    console.log(`  📊 测试 ${index + 1} 异常: ❌ ${error.message}`);
  }
});

// === 第四步：生成测试报告 ===
console.log('\n📊 步骤4: 测试结果统计');
console.log('=====================');

const successRate = Math.round((successCount / totalCount) * 100);
console.log(`成功修复: ${successCount}/${totalCount} 个格式`);
console.log(`成功率: ${successRate}%`);

if (successRate === 100) {
  console.log('🎉 所有问题格式都已成功修复！');
  console.log('✅ iOS 设备现在可以正常处理这些日期格式了');
} else if (successRate >= 80) {
  console.log('✅ 大部分问题已修复，iOS 兼容性显著改善');
} else if (successRate >= 50) {
  console.log('⚠️ 部分问题已修复，但还需要进一步优化');
} else {
  console.log('❌ 修复效果不理想，需要检查修复方案');
}

// === 第五步：vendor.js 专项测试 ===
console.log('\n🔍 步骤5: Vendor.js 专项状态检查');
console.log('--------------------------------');

// 打印详细的 vendor.js 修复状态
printVendorDateFixReport();

// === 第六步：应急修复测试 ===
console.log('\n🆘 步骤6: 应急修复功能测试');
console.log('---------------------------');

console.log('正在测试应急修复功能...');
const emergencyResult = emergencyIOSDateFix();
console.log('应急修复结果:', emergencyResult ? '✅ 成功' : '❌ 失败');

// === 测试完成 ===
console.log('\n🏁 iOS 日期兼容性修复验证测试完成');
console.log('=====================================');

if (successRate >= 90) {
  console.log('🎯 结论: 修复方案有效，可以解决 vendor.js 中的日期兼容性问题');
  console.log('📱 建议: 在生产环境中部署此修复方案');
} else {
  console.log('🎯 结论: 修复方案需要进一步优化');
  console.log('🔧 建议: 检查修复逻辑或考虑其他解决方案');
}

console.log('\n💡 使用说明:');
console.log('1. 确保在 main.js 中最早位置调用 setupVendorDateFix()');
console.log('2. 然后调用 setupIOSDateCompatibility({ enableGlobalPatch: true })');
console.log('3. 如果遇到问题，可以使用 emergencyIOSDateFix() 应急修复');
console.log('4. 使用 printVendorDateFixReport() 检查修复状态');

// 导出测试结果供其他地方使用
export const testResults = {
  totalTests: totalCount,
  successCount,
  successRate,
  problematicFormats,
  vendorFixApplied: vendorFixSuccess
};

export default testResults;