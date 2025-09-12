/**
 * 时间工具类测试
 * 验证时间处理逻辑是否正确
 */

import TimeUtils from '../src/utils/timeUtils.js'

console.log('=== 时间工具类测试 ===')

// 测试当前时间
console.log('当前时间:', TimeUtils.getCurrentBeijingTime())
console.log('当前日期:', TimeUtils.formatDate(TimeUtils.getCurrentBeijingTime()))

// 测试时间格式化
const testTime = '2025-01-11T12:02:00'
console.log('测试时间:', testTime)
console.log('格式化显示:', TimeUtils.formatForDisplay(testTime))
console.log('是否为今天:', TimeUtils.isToday(testTime))
console.log('是否为昨天:', TimeUtils.isYesterday(testTime))

// 测试餐次时间检查
console.log('当前餐次:', TimeUtils.getCurrentMealType())
console.log('早餐时间检查:', TimeUtils.checkMealTime('breakfast'))
console.log('午餐时间检查:', TimeUtils.checkMealTime('lunch'))
console.log('晚餐时间检查:', TimeUtils.checkMealTime('dinner'))

// 测试餐次信息
console.log('早餐信息:', TimeUtils.getMealInfo('breakfast'))
console.log('午餐信息:', TimeUtils.getMealInfo('lunch'))
console.log('晚餐信息:', TimeUtils.getMealInfo('dinner'))

console.log('=== 测试完成 ===')
