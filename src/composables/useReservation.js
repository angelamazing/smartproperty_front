/**
 * 预约管理组合式API
 * 提供预约相关的状态管理和业务逻辑
 * 
 * @author Linus (致敬内核之父的严谨风格)
 */

import { ref, computed, reactive } from 'vue'
import { useApi } from '@/composables/useApi'
import { cachedRequest, debounce } from '@/utils/apiCache'

export function useReservation() {
  const { request } = useApi()
  
  // 状态管理
  const state = reactive({
    venues: [],
    reservations: [],
    schedule: [],
    loading: {
      venues: false,
      reservations: false,
      schedule: false
    },
    error: {
      venues: null,
      reservations: null,
      schedule: null
    }
  })
  
  // 计算属性
  const isLoading = computed(() => {
    return Object.values(state.loading).some(loading => loading)
  })
  
  const hasError = computed(() => {
    return Object.values(state.error).some(error => error !== null)
  })
  
  // 获取场地列表 - 带缓存和防抖优化
  const loadVenues = debounce(async (params = {}) => {
    state.loading.venues = true
    state.error.venues = null
    
    try {
      console.log('🚀 开始加载场地列表，参数:', params)
      
      const requestFn = () => request({
        url: '/api/reservation/venues',
        method: 'GET',
        data: {
          date: params.date || '',
          type: params.type || '',
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          ...params
        }
      })
      
      // 使用缓存请求
      const response = await cachedRequest(
        requestFn,
        '/api/reservation/venues',
        params,
        {
          ttl: 2 * 60 * 1000, // 2分钟缓存
          forceRefresh: params.forceRefresh || false
        }
      )
      
      console.log('📡 场地列表API响应:', response)
      
      if (response && response.success) {
        // 按照文档规范，数据在 response.data.list 中
        state.venues = response.data?.list || []
        console.log('✅ 场地列表加载成功，数量:', state.venues.length)
        return response.data
      } else {
        const errorMsg = response?.message || '获取场地列表失败'
        console.error('❌ API返回失败:', errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('❌ 加载场地列表失败:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        params: params
      })
      
      // 设置错误状态
      state.error.venues = error.message || '加载场地列表失败'
      
      // 如果是网络错误，提供更友好的提示
      if (error.message.includes('网络') || error.message.includes('Network')) {
        state.error.venues = '网络连接失败，请检查网络设置'
      } else if (error.message.includes('500')) {
        state.error.venues = '服务器内部错误，请稍后重试'
      } else if (error.message.includes('404')) {
        state.error.venues = 'API接口不存在，请联系管理员'
      }
      
      throw error
    } finally {
      state.loading.venues = false
    }
  }, 300) // 300ms防抖
  
  // 获取预约记录 - 带缓存优化
  const loadReservations = debounce(async (params = {}) => {
    state.loading.reservations = true
    state.error.reservations = null
    
    try {
      const requestFn = () => request({
        url: '/api/venue/reservations',
        method: 'GET',
        data: {
          date: params.date || '',
          status: params.status || '',
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          ...params
        }
      })
      
      // 使用缓存请求
      const response = await cachedRequest(
        requestFn,
        '/api/venue/reservations',
        params,
        {
          ttl: 1 * 60 * 1000, // 1分钟缓存
          forceRefresh: params.forceRefresh || false
        }
      )
      
      if (response.success) {
        state.reservations = response.data.reservations || []
        return response.data
      } else {
        throw new Error(response.message || '获取预约记录失败')
      }
    } catch (error) {
      console.error('加载预约记录失败:', error)
      state.error.reservations = error.message || '加载预约记录失败'
      throw error
    } finally {
      state.loading.reservations = false
    }
  }, 300) // 300ms防抖
  
  // 获取场地安排 - 带缓存优化
  const loadSchedule = debounce(async (params = {}) => {
    state.loading.schedule = true
    state.error.schedule = null
    
    try {
      const requestFn = () => request({
        url: '/api/venue/schedule',
        method: 'GET',
        data: {
          date: params.date || '',
          venueType: params.venueType || '',
          ...params
        }
      })
      
      // 使用缓存请求
      const response = await cachedRequest(
        requestFn,
        '/api/venue/schedule',
        params,
        {
          ttl: 3 * 60 * 1000, // 3分钟缓存
          forceRefresh: params.forceRefresh || false
        }
      )
      
      if (response.success) {
        state.schedule = response.data.schedule || []
        return response.data
      } else {
        throw new Error(response.message || '获取场地安排失败')
      }
    } catch (error) {
      console.error('加载场地安排失败:', error)
      state.error.schedule = error.message || '加载场地安排失败'
      throw error
    } finally {
      state.loading.schedule = false
    }
  }, 300) // 300ms防抖
  
  // 创建预约
  const createReservation = async (reservationData) => {
    try {
      const response = await request({
        url: '/api/venue/reservations',
        method: 'POST',
        data: reservationData
      })
      
      if (response.success) {
        // 刷新相关数据
        await Promise.all([
          loadVenues({ date: reservationData.date }),
          loadReservations({ date: reservationData.date })
        ])
        return response.data
      } else {
        throw new Error(response.message || '创建预约失败')
      }
    } catch (error) {
      console.error('创建预约失败:', error)
      throw error
    }
  }
  
  // 取消预约
  const cancelReservation = async (reservationId) => {
    try {
      const response = await request({
        url: `/api/venue/reservations/${reservationId}`,
        method: 'DELETE'
      })
      
      if (response.success) {
        // 刷新预约记录
        await loadReservations()
        return response.data
      } else {
        throw new Error(response.message || '取消预约失败')
      }
    } catch (error) {
      console.error('取消预约失败:', error)
      throw error
    }
  }
  
  // 获取场地类型
  const loadVenueTypes = async () => {
    try {
      const response = await request({
        url: '/api/venue/types',
        method: 'GET'
      })
      
      if (response.success) {
        return response.data.types || []
      } else {
        throw new Error(response.message || '获取场地类型失败')
      }
    } catch (error) {
      console.error('加载场地类型失败:', error)
      throw error
    }
  }
  
  // 检查是否可以取消预约
  const canCancelReservation = (reservation) => {
    if (reservation.status !== 'confirmed') return false
    
    try {
      const reservationDate = new Date(reservation.reservationDate)
      const reservationTime = parseTime(reservation.startTime)
      
      if (!reservationDate || !reservationTime) return false
      
      // 设置预约的具体时间
      const reservationDateTime = new Date(reservationDate)
      reservationDateTime.setHours(reservationTime.getHours(), reservationTime.getMinutes(), 0, 0)
      
      const now = new Date()
      const timeDiff = reservationDateTime.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)
      
      // 预约开始前2小时内不能取消
      return hoursDiff > 2
    } catch (error) {
      console.error('检查取消条件失败:', error)
      return false
    }
  }
  
  // 解析时间字符串
  const parseTime = (timeStr) => {
    if (!timeStr) return null
    
    try {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes, 0, 0)
      return date
    } catch (error) {
      console.error('解析时间失败:', error)
      return null
    }
  }
  
  // 重置状态
  const resetState = () => {
    state.venues = []
    state.reservations = []
    state.schedule = []
    state.loading = {
      venues: false,
      reservations: false,
      schedule: false
    }
    state.error = {
      venues: null,
      reservations: null,
      schedule: null
    }
  }
  
  return {
    // 状态
    state,
    isLoading,
    hasError,
    
    // 方法
    loadVenues,
    loadReservations,
    loadSchedule,
    createReservation,
    cancelReservation,
    loadVenueTypes,
    canCancelReservation,
    parseTime,
    resetState
  }
}
