/**
 * iOS日期兼容性使用示例
 * 
 * 这个文件展示了如何正确使用iOS兼容的日期工具
 * 替代有问题的 new Date() 调用
 * 
 * @author Linus (致敬内核之父的简洁风格)
 */

import { createSafeDate } from './globalDateFix.js'
import { IOSCompatibleDate } from './iosCompatibleDate.js'

/**
 * 示例1：基本用法
 */
export function basicUsageExample() {
  console.log('=== 基本用法示例 ===')
  
  // ❌ 错误用法（iOS不兼容）
  const badDate1 = new Date("9/17/2025, 7:27:32 AM")
  console.log('原生Date结果:', badDate1) // iOS: Invalid Date
  
  // ✅ 正确用法（iOS兼容）
  const goodDate1 = createSafeDate("9/17/2025, 7:27:32 AM")
  console.log('iOS兼容结果:', goodDate1) // 正常工作
  
  // ✅ 其他格式也兼容
  const goodDate2 = createSafeDate("2024-12-25")
  const goodDate3 = createSafeDate("2024/12/25 08:30:00")
  
  console.log('日期1:', goodDate1?.toISOString())
  console.log('日期2:', goodDate2?.toISOString())
  console.log('日期3:', goodDate3?.toISOString())
}

/**
 * 示例2：在Vue组件中使用
 */
export function vueComponentExample() {
  console.log('=== Vue组件使用示例 ===')
  
  // 假设这是在Vue组件的方法中
  const methods = {
    // ❌ 错误用法
    badMethod() {
      const date = new Date("9/17/2025, 7:27:32 AM")
      return date
    },
    
    // ✅ 正确用法（需要引入timeMixin）
    goodMethod() {
      // 使用 this.$newDate() 替代 new Date()
      const date = this.$newDate("9/17/2025, 7:27:32 AM")
      return date
    },
    
    // ✅ 或者直接使用工具类
    alternativeMethod() {
      const date = createSafeDate("9/17/2025, 7:27:32 AM")
      return date
    }
  }
  
  console.log('Vue组件方法示例已定义')
}

/**
 * 示例3：处理各种日期格式
 */
export function formatHandlingExample() {
  console.log('=== 格式处理示例 ===')
  
  const testCases = [
    "9/17/2025, 7:27:32 AM",    // 用户主要问题格式
    "9/17/2025, 7:27:32 PM",    // PM格式
    "12/25/2024, 11:59:59 PM",  // 年末
    "1/1/2025, 12:00:00 AM",    // 年初
    "2024-12-25",               // ISO日期
    "2024-12-25 08:30:00",      // ISO日期时间
    "2024/12/25",               // 斜杠日期
    "2024/12/25 08:30:00",      // 斜杠日期时间
    "2024-12-25T08:30:00",      // ISO时间
    "2024-12-25T08:30:00Z"      // UTC时间
  ]
  
  testCases.forEach((testCase, index) => {
    console.log(`\n测试用例 ${index + 1}: "${testCase}"`)
    
    // 原生Date（可能失败）
    try {
      const nativeDate = new Date(testCase)
      console.log('  原生Date:', isNaN(nativeDate.getTime()) ? '❌ Invalid Date' : '✅ 成功')
    } catch (error) {
      console.log('  原生Date:', '❌ 错误:', error.message)
    }
    
    // iOS兼容工具（应该成功）
    try {
      const iosDate = createSafeDate(testCase)
      console.log('  iOS兼容:', iosDate && !isNaN(iosDate.getTime()) ? '✅ 成功' : '❌ 失败')
      if (iosDate && !isNaN(iosDate.getTime())) {
        console.log('  结果:', iosDate.toISOString())
      }
    } catch (error) {
      console.log('  iOS兼容:', '❌ 错误:', error.message)
    }
  })
}

/**
 * 示例4：错误处理
 */
export function errorHandlingExample() {
  console.log('=== 错误处理示例 ===')
  
  const invalidInputs = [
    "invalid date string",
    "",
    null,
    undefined,
    "13/45/2025",  // 无效日期
    "2025-13-45"   // 无效日期
  ]
  
  invalidInputs.forEach((input, index) => {
    console.log(`\n无效输入 ${index + 1}:`, input)
    
    const result = createSafeDate(input)
    if (result && !isNaN(result.getTime())) {
      console.log('  结果:', result.toISOString())
    } else {
      console.log('  结果:', '❌ 无效日期，返回null')
    }
  })
}

/**
 * 示例5：性能测试
 */
export function performanceExample() {
  console.log('=== 性能测试示例 ===')
  
  const testString = "9/17/2025, 7:27:32 AM"
  const iterations = 1000
  
  // 测试原生Date性能
  console.time('原生Date性能')
  for (let i = 0; i < iterations; i++) {
    try {
      new Date(testString)
    } catch (error) {
      // 忽略错误
    }
  }
  console.timeEnd('原生Date性能')
  
  // 测试iOS兼容工具性能
  console.time('iOS兼容工具性能')
  for (let i = 0; i < iterations; i++) {
    createSafeDate(testString)
  }
  console.timeEnd('iOS兼容工具性能')
}

/**
 * 运行所有示例
 */
export function runAllExamples() {
  console.log('🚀 开始运行iOS日期兼容性示例...\n')
  
  basicUsageExample()
  vueComponentExample()
  formatHandlingExample()
  errorHandlingExample()
  performanceExample()
  
  console.log('\n✅ 所有示例运行完成！')
}

// 如果直接运行此文件，执行所有示例
if (typeof window !== 'undefined') {
  // 浏览器环境
  runAllExamples()
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js环境
  module.exports = {
    basicUsageExample,
    vueComponentExample,
    formatHandlingExample,
    errorHandlingExample,
    performanceExample,
    runAllExamples
  }
}
