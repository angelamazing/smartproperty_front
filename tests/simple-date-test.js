// 简单测试日期格式化修复
console.log('开始测试日期格式化修复...');

// 模拟修复后的方法
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  
  try {
    // 模拟 TimeUtils.safeCreateDate 可能返回 null 的情况
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return '';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // 简单的日期比较
    const isSameDate = (date1, date2) => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    };
    
    if (isSameDate(targetDate, today)) {
      return `今天 ${targetDate.getMonth() + 1}-${targetDate.getDate()}`;
    } else if (isSameDate(targetDate, tomorrow)) {
      return `明天 ${targetDate.getMonth() + 1}-${targetDate.getDate()}`;
    } else {
      return `${targetDate.getMonth() + 1}-${targetDate.getDate()}`;
    }
  } catch (error) {
    console.error('日期格式化错误:', error, '输入值:', dateStr);
    return '';
  }
}

// 测试用例
const testCases = [
  '2025-09-12',
  '',
  null,
  'invalid-date',
  new Date().toISOString().split('T')[0]
];

console.log('测试用例:');
testCases.forEach((input, index) => {
  try {
    const result = formatDisplayDate(input);
    console.log(`测试 ${index + 1}: 输入=${input}, 输出=${result}`);
  } catch (error) {
    console.log(`测试 ${index + 1}: 输入=${input}, 错误=${error.message}`);
  }
});

console.log('测试完成！');
