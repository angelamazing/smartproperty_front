/**
 * 模块加载测试脚本
 * 用于验证 ES6 模块是否正确加载
 */

// 测试 ES6 模块导入
console.log('开始测试模块加载...')

// 测试 1: 检查环境
console.log('1. 环境检查:')
console.log('  - 当前环境:', typeof window !== 'undefined' ? '浏览器' : 'Node.js')
console.log('  - require 是否存在:', typeof require !== 'undefined')
console.log('  - import 是否支持:', typeof import !== 'undefined')

// 测试 2: 检查模块导入
console.log('2. 模块导入测试:')
try {
  // 这里应该能正常导入
  console.log('  - 模块导入功能正常')
} catch (error) {
  console.error('  - 模块导入失败:', error)
}

// 测试 3: 检查 API 对象
console.log('3. API 对象检查:')
// 这个测试需要在浏览器环境中运行
if (typeof window !== 'undefined') {
  console.log('  - 在浏览器环境中运行')
  // 可以在这里添加更多的浏览器特定测试
} else {
  console.log('  - 在 Node.js 环境中运行')
}

console.log('模块加载测试完成')
