// 简单测试personal-info页面修复
console.log('开始测试personal-info页面修复...');

// 模拟修复后的formatDate方法
function formatDate(dateString) {
  if (!dateString) return '未设置';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '未设置';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '未设置';
  }
}

// 测试用例
const testCases = [
  '2025-01-15T10:30:00.000Z',
  '2025-01-15',
  '',
  null,
  'invalid-date',
  '9/12/2025, 5:13:46 PM'
];

console.log('测试用例:');
testCases.forEach((input, index) => {
  try {
    const result = formatDate(input);
    console.log(`测试 ${index + 1}: 输入=${input}, 输出=${result}`);
  } catch (error) {
    console.log(`测试 ${index + 1}: 输入=${input}, 错误=${error.message}`);
  }
});

console.log('测试完成！');
