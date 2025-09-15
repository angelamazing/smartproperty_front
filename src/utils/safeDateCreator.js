/**
 * 安全的日期创建工具 - iOS兼容版本
 * 
 * 基于你提到的解决方案：将'-'直接替换为'/'
 * 参考：https://blog.csdn.net/m0_61470782/article/details/138912084
 * 
 * @author Linus 风格的实用工具
 */

/**
 * 创建iOS兼容的Date对象
 * 
 * @param {string|Date|number} input - 日期输入
 * @returns {Date} 安全的Date对象
 * 
 * @example
 * // ❌ 不安全的方式 (iOS可能失败)
 * new Date("2024-05-15 08:00:00")
 * 
 * // ✅ 安全的方式
 * createSafeDate("2024-05-15 08:00:00")
 */
export function createSafeDate(input) {
  // 如果没有输入，返回当前时间
  if (input === undefined || input === null) {
    return new Date();
  }

  // 如果已经是Date对象，直接返回
  if (input instanceof Date) {
    return input;
  }

  // 如果是数字，直接创建
  if (typeof input === 'number') {
    return new Date(input);
  }

  // 如果是字符串，进行iOS兼容性处理
  if (typeof input === 'string') {
    console.log(`🔧 [SafeDateCreator] 处理日期字符串: "${input}"`);
    
    // 🎯 核心修复：将连字符替换为斜杠 (来自CSDN文章的建议)
    const iosCompatible = input.replace(/-/g, '/');
    
    if (iosCompatible !== input) {
      console.log(`✅ [SafeDateCreator] 连字符已替换: "${input}" → "${iosCompatible}"`);
    }
    
    try {
      const result = new Date(iosCompatible);
      
      if (isNaN(result.getTime())) {
        console.warn(`⚠️ [SafeDateCreator] 日期创建失败: "${input}"`);
        return new Date(); // 返回当前时间作为fallback
      }
      
      console.log(`✅ [SafeDateCreator] 日期创建成功: "${input}" → ${result.toISOString()}`);
      return result;
    } catch (error) {
      console.error(`❌ [SafeDateCreator] 日期创建异常: "${input}"`, error);
      return new Date(); // 返回当前时间作为fallback
    }
  }

  // 其他类型，尝试直接创建
  try {
    return new Date(input);
  } catch (error) {
    console.error(`❌ [SafeDateCreator] 未知类型日期创建失败:`, input, error);
    return new Date();
  }
}

/**
 * 格式化日期为iOS兼容字符串
 * 
 * @param {Date} date - Date对象 
 * @param {string} format - 格式类型: 'date', 'time', 'datetime'
 * @returns {string} iOS兼容的日期字符串
 */
export function formatSafeDate(date, format = 'datetime') {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('⚠️ [SafeDateCreator] 无效的Date对象');
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'date':
      return `${year}/${month}/${day}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'datetime':
    default:
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }
}

/**
 * 安全解析日期字符串
 * 
 * @param {string} dateString - 日期字符串
 * @returns {Date|null} 解析成功返回Date对象，失败返回null
 */
export function parseSafeDate(dateString) {
  try {
    const date = createSafeDate(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error(`❌ [SafeDateCreator] 解析失败: "${dateString}"`, error);
    return null;
  }
}

/**
 * 检查日期字符串是否可能有iOS兼容性问题
 * 
 * @param {string} dateString - 日期字符串
 * @returns {boolean} true表示可能有问题
 */
export function hasIOSCompatibilityIssue(dateString) {
  if (typeof dateString !== 'string') return false;

  // 检查是否包含连字符
  const hasHyphen = dateString.includes('-');
  
  // 检查是否是AM/PM格式
  const hasAMPM = /\s+(AM|PM)$/i.test(dateString);
  
  // 检查是否是M/d/yyyy格式
  const isMDY = /^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString);
  
  return hasHyphen || hasAMPM || isMDY;
}

/**
 * 批量转换日期数组
 * 
 * @param {Array} dateArray - 包含日期字符串的数组
 * @returns {Array} 转换后的Date对象数组
 */
export function convertDateArray(dateArray) {
  if (!Array.isArray(dateArray)) {
    console.warn('⚠️ [SafeDateCreator] 输入不是数组');
    return [];
  }

  return dateArray.map((item, index) => {
    try {
      return createSafeDate(item);
    } catch (error) {
      console.error(`❌ [SafeDateCreator] 数组索引${index}转换失败:`, item, error);
      return new Date(); // fallback to current time
    }
  });
}

// 导出默认的安全Date创建函数
export default createSafeDate;

// 📋 使用示例和建议
if (typeof console !== 'undefined') {
  console.log(`
📋 SafeDateCreator 使用建议:

✅ 推荐方式:
import { createSafeDate } from '@/utils/safeDateCreator.js'
const date = createSafeDate("2024-05-15 08:00:00")

❌ 避免方式:
const date = new Date("2024-05-15 08:00:00")  // iOS可能失败

🔧 核心原理:
自动将 "2024-05-15 08:00:00" 转换为 "2024/05/15 08:00:00"
  `);
}
