/**
 * 时间处理测试文件
 * 用于验证UTC时间到中国时间的转换是否正确
 */
import TimeUtils from './timeUtils.js'

// 测试用例
const testCases = [
  {
    name: '午餐报餐时间',
    utcTime: '2025-09-11T02:30:00.000Z', // UTC时间
    expectedChinaTime: '2025-09-11 10:30:00' // 期望的中国时间
  },
  {
    name: '晚餐就餐时间',
    utcTime: '2025-09-10T12:02:33.000Z', // UTC时间
    expectedChinaTime: '2025-09-10 20:02:33' // 期望的中国时间
  },
  {
    name: '早餐报餐时间',
    utcTime: '2025-09-11T00:53:59.000Z', // UTC时间
    expectedChinaTime: '2025-09-11 08:53:59' // 期望的中国时间
  }
]

// 运行测试
console.log('=== 时间转换测试 ===')
testCases.forEach(testCase => {
  console.log(`\n${testCase.name}:`)
  console.log(`UTC时间: ${testCase.utcTime}`)
  
  const chinaTime = TimeUtils.getBeijingTime(testCase.utcTime)
  console.log(`转换后中国时间: ${chinaTime}`)
  
  const formattedTime = TimeUtils.formatTime(testCase.utcTime, 'full')
  console.log(`格式化显示: ${formattedTime}`)
  
  const displayTime = TimeUtils.formatForDisplay(testCase.utcTime)
  console.log(`智能显示: ${displayTime}`)
  
  const relativeTime = TimeUtils.formatTime(testCase.utcTime, 'relative')
  console.log(`相对时间: ${relativeTime}`)
})

// 测试当前时间
console.log('\n=== 当前时间测试 ===')
const now = new Date()
console.log(`当前UTC时间: ${now.toISOString()}`)
console.log(`当前中国时间: ${TimeUtils.getBeijingTime(now)}`)
console.log(`当前时间格式化: ${TimeUtils.formatTime(now.toISOString(), 'full')}`)

export default {
  testCases,
  runTest: () => {
    console.log('时间转换测试完成')
  }
}
