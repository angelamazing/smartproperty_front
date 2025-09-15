/**
 * 时间处理混入
 * 为Vue组件提供统一的时间处理功能
 * 基于新的TimeUtils工具类，支持UTC时间和北京时间的正确转换
 * 集成 iOS 兼容性支持（包括微信小程序安全版本）
 */
import { TimeUtils, TimeCache } from '@/utils/timeUtils.js'
import { iosDateMixin } from '@/utils/iosCompatibleDate.js'
import { miniProgramDateMixin } from '@/utils/miniProgramDateFix.js'

export default {
  // 合并 iOS 兼容性混入
  ...iosDateMixin,
  // 合并微信小程序安全版本混入
  ...miniProgramDateMixin,
  methods: {
    // 添加 iOS 兼容性方法
    ...iosDateMixin.methods,
    // 添加微信小程序安全方法
    ...miniProgramDateMixin.methods,
    /**
     * 格式化时间
     * @param {string|Date} timeString - 时间字符串
     * @param {string} format - 格式化模式
     * @returns {string} 格式化后的时间
     */
    $formatTime(timeString, format = 'YYYY-MM-DD HH:mm') {
      return TimeUtils.formatTime(timeString, format)
    },

    /**
     * 格式化时间用于显示（智能选择格式）
     * @param {string|Date} timeString - 时间字符串
     * @returns {string} 格式化后的时间
     */
    $formatTimeForDisplay(timeString) {
      return TimeUtils.formatForDisplay(timeString)
    },

    /**
     * 格式化UTC时间为北京时间显示（按照文档要求）
     * @param {string} utcTimeString - UTC时间字符串
     * @param {string} format - 显示格式
     * @returns {string} 格式化的北京时间字符串
     */
    $formatUTCTime(utcTimeString, format = 'datetime') {
      return TimeUtils.formatUTCTime(utcTimeString, format)
    },

    /**
     * 格式化报餐时间
     * @param {string} utcTimeString - UTC时间字符串
     * @returns {string} 格式化的报餐时间
     */
    $formatRegisterTime(utcTimeString) {
      return TimeUtils.formatRegisterTime(utcTimeString)
    },

    /**
     * 格式化就餐时间
     * @param {string} utcTimeString - UTC时间字符串
     * @returns {string} 格式化的就餐时间
     */
    $formatDiningTime(utcTimeString) {
      return TimeUtils.formatDiningTime(utcTimeString)
    },

    /**
     * 格式化扫码时间
     * @param {string} utcTimeString - UTC时间字符串
     * @returns {string} 格式化的扫码时间
     */
    $formatScanTime(utcTimeString) {
      return TimeUtils.formatScanTime(utcTimeString)
    },

    /**
     * 格式化确认时间
     * @param {string} utcTimeString - UTC时间字符串
     * @returns {string} 格式化的确认时间
     */
    $formatConfirmTime(utcTimeString) {
      return TimeUtils.formatConfirmTime(utcTimeString)
    },

    /**
     * 格式化相对时间
     * @param {string|Date} timeString - 时间字符串
     * @returns {string} 相对时间字符串
     */
    $formatRelativeTime(timeString) {
      return TimeUtils.getRelativeTime(timeString)
    },

    /**
     * 格式化完整时间
     * @param {string|Date} timeString - 时间字符串
     * @returns {string} 完整时间字符串
     */
    $formatFullTime(timeString) {
      return TimeUtils.formatTime(timeString, 'YYYY-MM-DD HH:mm:ss')
    },

    /**
     * 格式化简短时间
     * @param {string|Date} timeString - 时间字符串
     * @returns {string} 简短时间字符串
     */
    $formatShortTime(timeString) {
      return TimeUtils.formatTime(timeString, 'MM-DD HH:mm')
    },

    /**
     * 格式化日期
     * @param {string|Date} timeString - 时间字符串
     * @returns {string} 日期字符串
     */
    $formatDate(timeString) {
      return TimeUtils.formatTime(timeString, 'YYYY-MM-DD')
    },

    /**
     * 格式化时间（仅时间部分）
     * @param {string|Date} timeString - 时间字符串
     * @returns {string} 时间字符串
     */
    $formatTimeOnly(timeString) {
      return TimeUtils.formatTime(timeString, 'HH:mm')
    },

    /**
     * 验证时间是否有效
     * @param {string|Date} timeString - 时间字符串
     * @returns {boolean} 是否有效
     */
    $isValidTime(timeString) {
      return TimeUtils.isValidTime(timeString)
    },

    /**
     * 检查是否为今天
     * @param {string|Date} date - 日期
     * @returns {boolean} 是否为今天
     */
    $isToday(date) {
      return TimeUtils.isToday(date)
    },

    /**
     * 检查是否为昨天
     * @param {string|Date} date - 日期
     * @returns {boolean} 是否为昨天
     */
    $isYesterday(date) {
      return TimeUtils.isYesterday(date)
    },

    /**
     * 检查是否为明天
     * @param {string|Date} date - 日期
     * @returns {boolean} 是否为明天
     */
    $isTomorrow(date) {
      return TimeUtils.isTomorrow(date)
    },

    /**
     * 计算时间差
     * @param {string|Date} startTime - 开始时间
     * @param {string|Date} endTime - 结束时间
     * @returns {Object} 时间差对象
     */
    $getTimeDifference(startTime, endTime) {
      return TimeUtils.getTimeDifference(startTime, endTime)
    },

    /**
     * 获取当前时间戳
     * @returns {string} 当前时间戳
     */
    $getCurrentTimestamp() {
      return TimeUtils.getCurrentTimestamp()
    },

    /**
     * 获取今天的日期
     * @returns {string} 今天的日期
     */
    $getToday() {
      return TimeUtils.getToday()
    },

    /**
     * 获取明天的日期
     * @returns {string} 明天的日期
     */
    $getTomorrow() {
      return TimeUtils.getTomorrow()
    },

    /**
     * 获取昨天的日期
     * @returns {string} 昨天的日期
     */
    $getYesterday() {
      return TimeUtils.getYesterday()
    },

    /**
     * 安全的时间格式化，包含错误处理
     * @param {string|Date} time - 时间
     * @param {string} format - 格式
     * @returns {string} 格式化后的时间字符串或占位符
     */
    $safeFormatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
      return TimeUtils.safeFormatTime(time, format)
    },

    /**
     * 获取时间状态信息
     * @param {string|Date} time - 时间
     * @returns {Object} 时间状态对象 {status, text, color}
     */
    $getTimeStatus(time) {
      return TimeUtils.getTimeStatus(time)
    },

    /**
     * 将北京时间转换为UTC时间用于提交给后端
     * @param {string|Date} beijingTime - 北京时间
     * @returns {string} ISO 8601格式的UTC时间字符串
     */
    $toUTCForSubmit(beijingTime) {
      return TimeUtils.toUTCForSubmit(beijingTime)
    },

    /**
     * 获取当前日期字符串（YYYY-MM-DD格式）
     * @returns {string} 当前日期
     */
    $getCurrentDate() {
      return TimeUtils.getCurrentDate()
    },

    /**
     * 获取当前时间字符串（HH:mm格式）
     * @returns {string} 当前时间
     */
    $getCurrentTime() {
      return TimeUtils.getCurrentTime()
    },

    /**
     * 获取日期范围数组
     * @param {string|Date} startDate - 开始日期
     * @param {string|Date} endDate - 结束日期
     * @param {string} format - 返回格式
     * @returns {string[]} 日期数组
     */
    $getDateRange(startDate, endDate, format = 'YYYY-MM-DD') {
      return TimeUtils.getDateRange(startDate, endDate, format)
    },

    /**
     * 获取指定日期的前一天
     * @param {string|Date} date - 日期
     * @param {string} format - 返回格式
     * @returns {string} 前一天的日期字符串
     */
    $getPreviousDay(date, format = 'YYYY-MM-DD') {
      return TimeUtils.getPreviousDay(date, format)
    },

    /**
     * 获取指定日期的后一天
     * @param {string|Date} date - 日期
     * @param {string} format - 返回格式
     * @returns {string} 后一天的日期字符串
     */
    $getNextDay(date, format = 'YYYY-MM-DD') {
      return TimeUtils.getNextDay(date, format)
    },

    /**
     * 获取指定日期的开始时间（00:00:00）
     * @param {string|Date} date - 日期
     * @returns {string} 该日期开始时间的UTC字符串
     */
    $getDayStartTime(date) {
      return TimeUtils.getDayStartTime(date)
    },

    /**
     * 获取指定日期的结束时间（23:59:59）
     * @param {string|Date} date - 日期
     * @returns {string} 该日期结束时间的UTC字符串
     */
    $getDayEndTime(date) {
      return TimeUtils.getDayEndTime(date)
    },

    /**
     * 格式化时间用于表格显示
     * @param {string|Date} timeString - 时间字符串
     * @returns {Object} 包含显示文本和完整时间的对象
     */
    $formatForTable(timeString) {
      return TimeUtils.formatForTable(timeString)
    },

    // ==================== 业务相关方法 ====================

    /**
     * 检查是否在就餐时间内
     * @param {string} mealType - 餐次类型 (breakfast/lunch/dinner)
     * @returns {Object} 检查结果
     */
    $checkMealTime(mealType) {
      return TimeUtils.checkMealTime(mealType)
    },

    /**
     * 获取餐次信息
     * @param {string} mealType - 餐次类型
     * @returns {Object} 餐次信息
     */
    $getMealInfo(mealType) {
      return TimeUtils.getMealInfo(mealType)
    },

    /**
     * 获取当前餐次
     * @returns {string|null} 当前餐次类型
     */
    $getCurrentMealType() {
      return TimeUtils.getCurrentMealType()
    },

    /**
     * 获取下一个餐次
     * @returns {Object} 下一个餐次信息
     */
    $getNextMeal() {
      return TimeUtils.getNextMeal()
    },

    /**
     * 格式化餐次时间显示
     * @param {string} mealType - 餐次类型
     * @returns {string} 格式化的时间显示
     */
    $formatMealTime(mealType) {
      return TimeUtils.formatMealTime(mealType)
    },

    /**
     * 检查时间是否在指定范围内
     * @param {string|Date} time - 要检查的时间
     * @param {string} mealType - 餐次类型
     * @returns {boolean} 是否在范围内
     */
    $isTimeInMealRange(time, mealType) {
      return TimeUtils.isTimeInMealRange(time, mealType)
    },

    // ==================== 缓存相关方法 ====================

    /**
     * 使用缓存格式化时间（用于大量数据渲染优化）
     * @param {string|Date} time - 时间
     * @param {string} format - 格式
     * @returns {string} 格式化后的时间
     */
    $formatTimeWithCache(time, format) {
      return TimeCache.format(time, format)
    },

    /**
     * 清除时间格式化缓存
     */
    $clearTimeCache() {
      TimeCache.clear()
    },

    /**
     * 获取时间缓存大小
     * @returns {number} 缓存条目数
     */
    $getTimeCacheSize() {
      return TimeCache.getSize()
    },

    // ==================== iOS兼容性方法 ====================

    /**
     * 安全创建Date对象（iOS兼容版本）
     * @param {string|Date|number} timeInput - 时间输入
     * @returns {Date|null} Date对象，如果无效则返回null
     */
    $createDate(timeInput) {
      return TimeUtils.createDate(timeInput)
    },

    /**
     * 创建当前时间的Date对象（iOS兼容版本）
     * @returns {Date} 当前时间的Date对象
     */
    $createCurrentDate() {
      return TimeUtils.createCurrentDate()
    },

    /**
     * 安全创建Date对象（iOS兼容版本）
     * @param {string|Date|number} timeInput - 时间输入
     * @returns {Date|null} Date对象，如果无效则返回null
     */
    $safeCreateDate(timeInput) {
      return TimeUtils.safeCreateDate(timeInput)
    },

    /**
     * 将yyyy-MM-dd HH:mm:ss格式转换为yyyy/MM/dd HH:mm:ss格式（iOS兼容）
     * @param {string} dateString - yyyy-MM-dd HH:mm:ss格式的日期字符串
     * @returns {string} yyyy/MM/dd HH:mm:ss格式的日期字符串
     */
    $convertToIOSFormat(dateString) {
      return TimeUtils.convertToIOSFormat(dateString)
    },

    /**
     * 将yyyy/MM/dd HH:mm:ss格式转换为yyyy-MM-dd HH:mm:ss格式
     * @param {string} dateString - yyyy/MM/dd HH:mm:ss格式的日期字符串
     * @returns {string} yyyy-MM-dd HH:mm:ss格式的日期字符串
     */
    $convertFromIOSFormat(dateString) {
      return TimeUtils.convertFromIOSFormat(dateString)
    },

    /**
     * 格式化时间为iOS兼容格式（yyyy/MM/dd HH:mm:ss）
     * @param {string|Date} time - 时间字符串或Date对象
     * @returns {string} iOS兼容格式的时间字符串
     */
    $formatForIOS(time) {
      return TimeUtils.formatForIOS(time)
    }
  }
}