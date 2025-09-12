<template>
  <view class="reservation-container">
    <!-- 顶部操作栏 -->
    <view class="action-bar">
      <view class="action-tabs">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'venue' }"
          @click="switchTab('venue')"
        >
          <text class="tab-text">场地预约</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'record' }"
          @click="switchTab('record')"
        >
          <text class="tab-text">预约记录</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'schedule' }"
          @click="switchTab('schedule')"
        >
          <text class="tab-text">场地安排</text>
        </view>
      </view>
    </view>

    <!-- 场地预约标签页 -->
    <view class="tab-content" v-if="currentTab === 'venue'">
      <view class="venue-header">
        <!-- 日期选择器 - 优化布局 -->
        <view class="date-section">
          <text class="section-title">选择日期</text>
          <view class="date-selector-wrapper">
            <view class="date-navigation">
              <button class="nav-btn" @click="previousDate">
                <text class="nav-icon">❮</text>
              </button>
              <picker
                mode="date"
                :value="selectedDate"
                @change="onDatePickerChange"
                class="date-picker-container"
              >
                <view class="date-display">
                  <text class="date-text">{{ formatDisplayDate(selectedDate) }}</text>
                  <text class="date-hint">点击选择日期</text>
                </view>
              </picker>
              <button class="nav-btn" @click="nextDate">
                <text class="nav-icon">❯</text>
              </button>
            </view>
          </view>
        </view>
        
        <!-- 场地类型选择器 -->
        <view class="venue-type-section">
          <text class="section-title">场地类型</text>
          <scroll-view class="venue-type-scroll" scroll-x="true" :show-scrollbar="false">
            <view class="venue-type-container">
              <view 
                class="type-card" 
                :class="{ active: selectedVenueType === type.value }"
                v-for="type in venueTypes" 
                :key="type.value"
                @click="selectVenueType(type.value)"
              >
                <view class="type-icon">{{ getVenueTypeIcon(type.value) }}</view>
                <text class="type-text">{{ type.label }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <view class="venue-list" v-if="venues && venues.length > 0">
        <view 
          class="venue-item" 
          v-for="venue in venues" 
          :key="venue._id"
        >
          <view class="venue-info">
            <view class="venue-header">
              <text class="venue-name">{{ venue.name }}</text>
              <text class="venue-status" :class="getVenueStatusClass(venue.status)">
                {{ getVenueStatusText(venue.status) }}
              </text>
            </view>
            <view class="venue-details">
              <text class="venue-type">{{ getVenueTypeText(venue.type) }}</text>
              <text class="venue-capacity">容纳: {{ venue.capacity }}人</text>
              <text class="venue-price">¥{{ venue.price }}/小时</text>
            </view>
            <view class="venue-description">
              <text class="description-text">{{ venue.description }}</text>
            </view>
          </view>

          <view class="time-slots">
            <text class="slots-title">可预约时段</text>
            <view class="slots-grid">
              <view 
                class="time-slot" 
                v-for="slot in (venue.timeSlots || [])" 
                :key="slot.id"
                :class="getSlotClass(slot)"
                @click="selectTimeSlot(venue, slot)"
              >
                <text class="slot-time">{{ slot.startTime }}-{{ slot.endTime }}</text>
                <text class="slot-status">{{ getSlotStatusText(slot.status) }}</text>
              </view>
            </view>
          </view>

          <view class="venue-actions">
            <button 
              class="btn-secondary" 
              @click="viewVenueDetail(venue)"
            >
              查看详情
            </button>
            <button 
              class="btn-primary" 
              @click="makeReservation(venue)"
              :disabled="!hasAvailableSlots(venue)"
            >
              立即预约
            </button>
          </view>
        </view>
      </view>

      <view class="empty-venues" v-else>
        <view class="empty-icon">🏸</view>
        <text class="empty-text">该日期暂无可用场地</text>
        <text class="empty-desc">请选择其他日期或场地类型</text>
      </view>
    </view>

    <!-- 预约记录标签页 -->
    <view class="tab-content" v-if="currentTab === 'record'">
      <view class="record-header">
        <text class="record-title">我的预约</text>
        <view class="record-filters">
          <picker 
            mode="date" 
            :value="recordFilter.date" 
            @change="onRecordDateChange"
            class="filter-picker"
          >
            <view class="filter-value">{{ recordFilter.date }}</view>
          </picker>
          <picker 
            mode="selector" 
            :range="statusOptions" 
            :value="statusIndex" 
            @change="onStatusChange"
            class="filter-picker"
          >
            <view class="filter-value">{{ recordFilter.status }}</view>
          </picker>
        </view>
      </view>

      <view class="record-list" v-if="reservationRecords && reservationRecords.length > 0">
        <view 
          class="record-item" 
          v-for="record in reservationRecords" 
          :key="record._id"
          @click="viewRecordDetail(record)"
        >
          <view class="record-header">
            <text class="record-date">{{ formatDate(record.reservationDate) }}</text>
            <text class="record-status" :class="getStatusClass(record.status)">
              {{ getStatusText(record.status) }}
            </text>
          </view>
          <view class="record-content">
            <view class="record-info">
              <text class="record-venue">{{ record.venueName }}</text>
              <text class="record-time">{{ record.startTime }}-{{ record.endTime }}</text>
            </view>
            <view class="record-details">
              <text class="detail-item">预约人: {{ record.userName }}</text>
              <text class="detail-item">联系电话: {{ record.phoneNumber }}</text>
              <text class="detail-item">预约用途: {{ record.purpose }}</text>
            </view>
            <view class="record-time">
              <text class="time-label">预约时间:</text>
              <text class="time-value">{{ $formatTime(record.createTime) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-record" v-else>
        <view class="empty-icon">📋</view>
        <text class="empty-text">暂无预约记录</text>
        <text class="empty-desc">开始预约场地吧</text>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMoreRecords">
        <button class="load-more-btn" @click="loadMoreRecords" :loading="isLoadingMore">
          {{ isLoadingMore ? '加载中...' : '加载更多' }}
        </button>
      </view>
    </view>

    <!-- 场地安排标签页 -->
    <view class="tab-content" v-if="currentTab === 'schedule'">
      <view class="schedule-header">
        <text class="schedule-title">场地安排表</text>
        <view class="schedule-filters">
          <picker 
            mode="date" 
            :value="scheduleFilter.date" 
            @change="onScheduleDateChange"
            class="filter-picker"
          >
            <view class="filter-value">{{ scheduleFilter.date }}</view>
          </picker>
          <picker 
            mode="selector" 
            :range="venueTypeOptions" 
            :value="venueTypeIndex" 
            @change="onVenueTypeChange"
            class="filter-picker"
          >
            <view class="filter-value">{{ scheduleFilter.venueType }}</view>
          </picker>
        </view>
      </view>

      <view class="schedule-table" v-if="scheduleData && scheduleData.length > 0">
        <view class="table-header">
          <view class="time-column">时间</view>
          <view 
            class="venue-column" 
            v-for="venue in (scheduleData[0] && scheduleData[0].venues) || []" 
            :key="venue.id"
          >
            {{ venue.name }}
          </view>
        </view>
        <view 
          class="table-row" 
          v-for="timeSlot in scheduleData" 
          :key="timeSlot.id"
        >
          <view class="time-column">{{ timeSlot.time }}</view>
          <view 
            class="venue-column" 
            v-for="venue in (timeSlot.venues || [])" 
            :key="venue.id"
            :class="getScheduleCellClass(venue.status)"
            @click="viewScheduleDetail(venue, timeSlot)"
          >
            <text class="cell-text">{{ getScheduleCellText(venue) }}</text>
          </view>
        </view>
      </view>

      <view class="empty-schedule" v-else>
        <view class="empty-icon">📅</view>
        <text class="empty-text">该日期暂无场地安排</text>
        <text class="empty-desc">请选择其他日期</text>
      </view>
    </view>

    <!-- 预约弹窗 -->
    <view class="reservation-modal" v-if="showReservationModal">
      <view class="modal-mask" @click="closeReservationModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">场地预约</text>
          <button class="close-btn" @click="closeReservationModal">×</button>
        </view>
        
        <view class="modal-body">
          <view class="venue-summary">
            <text class="summary-title">{{ selectedVenue.name }}</text>
            <text class="summary-type">{{ getVenueTypeText(selectedVenue.type) }}</text>
            <text class="summary-price">¥{{ selectedVenue.price }}/小时</text>
          </view>

          <view class="reservation-form">
            <view class="form-row">
              <text class="form-label">预约日期</text>
              <text class="form-value">{{ selectedDate }}</text>
            </view>
            <view class="form-row">
              <text class="form-label">预约时段</text>
              <text class="form-value">{{ selectedTimeSlot.startTime }}-{{ selectedTimeSlot.endTime }}</text>
            </view>
            <view class="form-row">
              <text class="form-label">预约人</text>
              <input 
                class="form-input" 
                v-model="reservationForm.userName" 
                placeholder="请输入预约人姓名"
              />
            </view>
            <view class="form-row">
              <text class="form-label">联系电话</text>
              <input 
                class="form-input" 
                v-model="reservationForm.phoneNumber" 
                placeholder="请输入联系电话"
                type="number"
              />
            </view>
            <view class="form-row">
              <text class="form-label">预约用途</text>
              <textarea 
                class="form-textarea" 
                v-model="reservationForm.purpose" 
                placeholder="请输入预约用途"
                maxlength="100"
              ></textarea>
            </view>
            <view class="form-row">
              <text class="form-label">备注信息</text>
              <textarea 
                class="form-textarea" 
                v-model="reservationForm.remark" 
                placeholder="请输入备注信息（可选）"
                maxlength="200"
              ></textarea>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-secondary" @click="closeReservationModal">取消</button>
          <button 
            class="btn-primary" 
            @click="submitReservation"
            :disabled="!can提交Reservation || is提交ting"
            :loading="is提交ting"
          >
            {{ is提交ting ? '提交中...' : '确认预约' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
  </view>
</template>

<script>
import auth from '@/utils/auth.js'
import api from '@/utils/api.js'
import TimeUtils from '@/utils/timeUtils.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'Reservation',
  mixins: [timeMixin],
  components: {
  },
  data() {
    return {
      currentTab: 'venue',
      isLoading: false,
      
      // 场地相关
      selectedDate: '',
      selectedVenueType: 'all',
      venues: [],
      
      // 预约表单
      reservationForm: {
        userName: '',
        phoneNumber: '',
        purpose: '',
        remark: ''
      },
      
      // 预约弹窗
      showReservationModal: false,
      selectedVenue: {},
      selectedTimeSlot: {},
      
      // 预约记录
      reservationRecords: [],
      recordFilter: {
        date: '',
        status: '全部'
      },
      
      // 场地安排
      scheduleData: [],
      scheduleFilter: {
        date: '',
        venueType: '全部'
      },
      
      // 分页
      page: 1,
      pageSize: 10,
      hasMoreRecords: true,
      isLoadingMore: false,
      
      // 提交状态
      is提交ting: false
    }
  },

  computed: {
    venueTypes() {
      return [
        { label: '全部', value: 'all' },
        { label: '羽毛球', value: 'badminton' },
        { label: '乒乓球', value: 'pingpong' },
        { label: '篮球', value: 'basketball' },
        { label: '其他', value: 'other' }
      ]
    },

    venueTypeOptions() {
      return (this.venueTypes || []).map(item => item.label)
    },

    venueTypeIndex() {
      return (this.venueTypes || []).findIndex(item => item.label === this.scheduleFilter.venueType)
    },

    statusOptions() {
      return ['全部', '待确认', '已确认', '已完成', '已取消']
    },

    statusIndex() {
      return (this.statusOptions || []).findIndex(item => item === this.recordFilter.status)
    },

    can提交Reservation() {
      return this.reservationForm.userName && 
             this.reservationForm.phoneNumber && 
             this.reservationForm.purpose
    }
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.refreshData()
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      uni.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.currentTab === 'record' && this.hasMoreRecords && !this.isLoadingMore) {
      this.loadMoreRecords()
    }
  },

  methods: {
    /**
     * 初始化页面
     */
    async initPage() {
      try {
        this.isLoading = true
        
        // 设置默认日期为今天
        this.selectedDate = this.$getCurrentDate()
        this.recordFilter.date = this.$getCurrentDate()
        this.scheduleFilter.date = this.$getCurrentDate()
        
        // 加载初始数据
        await this.loadInitialData()
      } catch (error) {
        console.error('页面初始化失败:', error)
        uni.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载初始数据
     */
    async loadInitialData() {
      try {
        // 并行加载数据
        const [venues, records, schedule] = await Promise.all([
          this.loadVenues(),
          this.loadReservationRecords(),
          this.loadScheduleData()
        ])

        this.venues = venues
        this.reservationRecords = records
        this.scheduleData = schedule
      } catch (error) {
        console.error('加载初始数据失败:', error)
      }
    },

    /**
     * 刷新数据
     */
    async refreshData() {
      try {
        switch (this.currentTab) {
          case 'venue':
            await this.loadVenues()
            break
          case 'record':
            this.page = 1
            this.hasMoreRecords = true
            await this.loadReservationRecords()
            break
          case 'schedule':
            await this.loadScheduleData()
            break
        }
      } catch (error) {
        console.error('刷新数据失败:', error)
      }
    },

    /**
     * 切换标签页
     */
    switchTab(tab) {
      this.currentTab = tab
      this.refreshData()
    },

    /**
     * 选择日期
     */
    previousDate() {
      const date = this.$createDate(this.selectedDate)
      const previousDay = date.subtract(1, 'day')
      this.selectedDate = this.$formatDate(previousDay)
      this.loadVenues()
    },

    nextDate() {
      const date = this.$createDate(this.selectedDate)
      const nextDay = date.add(1, 'day')
      this.selectedDate = this.$formatDate(nextDay)
      this.loadVenues()
    },

    /**
     * 选择场地类型
     */
    selectVenueType(venueType) {
      this.selectedVenueType = venueType
      this.loadVenues()
    },

    /**
     * 加载场地列表
     */
    async loadVenues() {
      try {
        const type = this.selectedVenueType === 'all' ? '' : this.selectedVenueType
        const result = await api.venue.getList(this.selectedDate, type)
        
        this.venues = result.data || []
      } catch (error) {
        console.error('加载场地失败:', error)
        this.venues = []
      }
    },

    /**
     * 加载预约记录
     */
    async loadReservationRecords() {
      try {
        const params = {
          date: this.recordFilter.date,
          status: this.recordFilter.status === '全部' ? '' : this.recordFilter.status,
          page: this.page,
          pageSize: this.pageSize
        }
        
        const result = await api.venue.getReservations(params)
        
        if (this.page === 1) {
          this.reservationRecords = result.data?.records || []
        } else {
          this.reservationRecords = [...(this.reservationRecords || []), ...(result.data?.records || [])]
        }
        
        this.hasMoreRecords = result.data?.hasMore || false
      } catch (error) {
        console.error('加载预约记录失败:', error)
        this.reservationRecords = []
        this.hasMoreRecords = false
      }
    },

    /**
     * 加载场地安排
     */
    async loadScheduleData() {
      try {
        const venueType = this.scheduleFilter.venueType === '全部' ? '' : this.scheduleFilter.venueType
        const result = await api.venue.getSchedule(this.scheduleFilter.date, venueType)
        
        this.scheduleData = result.data || []
      } catch (error) {
        console.error('加载场地安排失败:', error)
        this.scheduleData = []
      }
    },

    /**
     * 加载更多记录
     */
    async loadMoreRecords() {
      if (this.isLoadingMore) return
      
      try {
        this.isLoadingMore = true
        this.page++
        await this.loadReservationRecords()
      } catch (error) {
        console.error('加载更多记录失败:', error)
        this.page--
      } finally {
        this.isLoadingMore = false
      }
    },

    /**
     * 选择时间段
     */
    selectTimeSlot(venue, timeSlot) {
      if (timeSlot.status === 'available') {
        this.selectedVenue = venue
        this.selectedTimeSlot = timeSlot
        this.showReservationModal = true
      }
    },

    /**
     * 关闭预约弹窗
     */
    closeReservationModal() {
      this.showReservationModal = false
      this.selectedVenue = {}
      this.selectedTimeSlot = {}
      this.reservationForm = {
        userName: '',
        phoneNumber: '',
        purpose: '',
        remark: ''
      }
    },

    /**
     * 提交预约
     */
    async submitReservation() {
      if (!this.can提交Reservation) return
      
      try {
        this.is提交ting = true
        
        const reservationData = {
          venueId: this.selectedVenue._id,
          date: this.selectedDate,
          startTime: this.selectedTimeSlot.startTime,
          endTime: this.selectedTimeSlot.endTime,
          ...this.reservationForm
        }
        
        const result = await api.venue.submitReservation(reservationData)
        
        if (result && result.success) {
          uni.showToast({
            title: '预约提交成功',
            icon: 'success'
          })
          
          // 关闭弹窗
          this.closeReservationModal()
          
          // 刷新数据
          this.refreshData()
        } else {
          throw new Error(result.message || '提交失败')
        }
      } catch (error) {
        console.error('提交预约失败:', error)
        uni.showToast({
          title: error.message || '提交失败，请重试',
          icon: 'none'
        })
      } finally {
        this.is提交ting = false
      }
    },

    /**
     * 查看场地详情
     */
    viewVenueDetail(venue) {
      uni.navigateTo({
        url: `/pages/venue-detail/venue-detail?id=${venue._id}`
      })
    },

    /**
     * 查看预约记录详情
     */
    viewRecordDetail(record) {
      uni.navigateTo({
        url: `/pages/reservation-detail/reservation-detail?id=${record._id}`
      })
    },

    /**
     * 查看场地安排详情
     */
    viewScheduleDetail(venue, timeSlot) {
      if (venue.status !== 'available') {
        uni.navigateTo({
          url: `/pages/schedule-detail/schedule-detail?venueId=${venue.id}&timeSlot=${timeSlot.id}`
        })
      }
    },

    /**
     * 立即预约
     */
    makeReservation(venue) {
      const availableSlot = (venue.timeSlots || []).find(slot => slot.status === 'available')
      if (availableSlot) {
        this.selectTimeSlot(venue, availableSlot)
      }
    },

    /**
     * 检查是否有可用时间段
     */
    hasAvailableSlots(venue) {
      return (venue.timeSlots || []).some(slot => slot.status === 'available')
    },

    /**
     * 获取场地状态样式类
     */
    getVenueStatusClass(status) {
      return `status-${status}`
    },

    /**
     * 获取场地状态文本
     */
    getVenueStatusText(status) {
      const statusMap = {
        'open': '开放',
        'closed': '关闭',
        'maintenance': '维护中'
      }
      return statusMap[status] || '未知状态'
    },

    /**
     * 获取场地类型文本
     */
    getVenueTypeText(type) {
      const typeMap = {
        'badminton': '羽毛球',
        'pingpong': '乒乓球',
        'basketball': '篮球',
        'other': '其他'
      }
      return typeMap[type] || '未知类型'
    },

    /**
     * 获取时间段样式类
     */
    getSlotClass(slot) {
      return `slot-${slot.status}`
    },

    /**
     * 获取时间段状态文本
     */
    getSlotStatusText(status) {
      const statusMap = {
        'available': '可预约',
        'reserved': '已预约',
        'maintenance': '维护中'
      }
      return statusMap[status] || '未知状态'
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || '未知状态'
    },

    /**
     * 获取状态样式类
     */
    getStatusClass(status) {
      return `status-${status}`
    },

    /**
     * 获取安排表单元格样式类
     */
    getScheduleCellClass(status) {
      return `cell-${status}`
    },

    /**
     * 获取安排表单元格文本
     */
    getScheduleCellText(venue) {
      if (venue.status === 'available') {
        return '可预约'
      } else if (venue.status === 'reserved') {
        return venue.userName || '已预约'
      } else if (venue.status === 'maintenance') {
        return '维护中'
      }
      return '未知'
    },

    /**
     * 记录筛选日期变化
     */
    onRecordDateChange(e) {
      this.recordFilter.date = e.detail.value
      this.page = 1
      this.hasMoreRecords = true
      this.loadReservationRecords()
    },

    /**
     * 记录筛选状态变化
     */
    onStatusChange(e) {
      this.recordFilter.status = this.statusOptions[e.detail.value]
      this.page = 1
      this.hasMoreRecords = true
      this.loadReservationRecords()
    },

    /**
     * 安排表筛选日期变化
     */
    onScheduleDateChange(e) {
      this.scheduleFilter.date = e.detail.value
      this.loadScheduleData()
    },

    /**
     * 安排表筛选场地类型变化
     */
    onVenueTypeChange(e) {
      this.scheduleFilter.venueType = this.venueTypeOptions[e.detail.value]
      this.loadScheduleData()
    },

    /**
     * 格式化日期
     */
    formatDate(date) {
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDate(date)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return '未知日期'
      }
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return ''
      
      try {
        // 使用统一的 TimeUtils 工具类
        return TimeUtils.formatTime(time, 'short')
      } catch (error) {
        console.error('时间格式化失败:', error, '原始时间:', time)
        return '--'
      }
    },

    /**
     * 格式化显示日期
     */
    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      
      try {
        // 使用TimeUtils确保iOS兼容性
        const dayjsTime = this.$createDate(dateStr)
        if (!dayjsTime) return ''
        
        const today = this.$createDate()
        const tomorrow = today.add(1, 'day')
        
        // 判断是否为今天或明天
        if (dayjsTime.isSame(today, 'day')) {
          return `今天 ${dayjsTime.format('M月D日')}`
        } else if (dayjsTime.isSame(tomorrow, 'day')) {
          return `明天 ${dayjsTime.format('M月D日')}`
        } else {
          return dayjsTime.format('M月D日 dddd')
        }
      } catch (error) {
        console.error('日期格式化错误:', error)
        return ''
      }
    },

    /**
     * 判断是否为同一天
     */
    isSameDate(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    },

    /**
     * 格式化短日期
     */
    formatDateShort(date) {
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    },

    /**
     * 格式化带星期的日期
     */
    formatDateWithWeekday(date) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekday = weekdays[date.getDay()]
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day} ${weekday}`
    },

    /**
     * 获取场地类型图标
     */
    getVenueTypeIcon(type) {
      const iconMap = {
        'all': '🏟️',
        'badminton': '🏸',
        'pingpong': '🏓',
        'basketball': '🏀',
        'other': '⚽'
      }
      return iconMap[type] || '🏟️'
    },

    /**
     * 日期选择器变化
     */
    onDatePickerChange(e) {
      this.selectedDate = e.detail.value
      this.loadVenues()
    }
  }
}
</script>

<style lang="scss" scoped>
.reservation-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
  padding-bottom: 120rpx;
}

/* 操作栏 */
.action-bar {
  background: rgba(255, 255, 255, 0.95);
  padding: 25rpx;
  margin: 20rpx 20rpx 25rpx 20rpx;
  border-radius: 25rpx;
  box-shadow: 0 8rpx 35rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.action-tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 8rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.tab-item.active {
  background: #667eea;
  color: #fff;
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
}

/* 标签页内容 */
.tab-content {
  padding: 0 20rpx 20rpx 20rpx;
}

/* 场地头部 */
.venue-header {
  background: linear-gradient(135deg, #fff 0%, #f8f9fc 100%);
  border-radius: 25rpx;
  padding: 35rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 8rpx 35rpx rgba(0, 0, 0, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

/* 日期选择区域 */
.venue-header .date-section {
  margin-bottom: 30rpx;
}

.venue-header .date-section .section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.date-selector-wrapper {
  width: 100%;
}

.date-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.3);
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10rpx);
}

.nav-btn:active {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0.95);
}

.nav-icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}

.date-picker-container {
  flex: 1;
  margin: 0 20rpx;
}

.date-display {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 25rpx 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
}

.date-text {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.date-hint {
  font-size: 22rpx;
  color: #666;
  opacity: 0.8;
}

/* 场地类型选择区域 */
.venue-header .venue-type-section {
  margin-bottom: 20rpx;
}

.venue-header .venue-type-section .section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.venue-type-scroll {
  width: 100%;
  overflow: hidden;
}

.venue-type-container {
  display: flex;
  gap: 15rpx;
  padding: 10rpx 0;
  width: max-content;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25rpx 30rpx;
  background: #f8f9fa;
  border: 3rpx solid #e9ecef;
  border-radius: 20rpx;
  transition: all 0.3s ease;
  min-width: 120rpx;
  min-height: 120rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.type-card.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #fff;
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 35rpx rgba(102, 126, 234, 0.4);
}

.type-card:active {
  transform: translateY(-2rpx) scale(0.98);
}

.type-icon {
  font-size: 44rpx;
  margin-bottom: 12rpx;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.type-card.active .type-icon {
  opacity: 1;
  transform: scale(1.1);
}

.type-text {
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

/* 场地列表 */
.venue-list {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.venue-item {
  background: linear-gradient(135deg, #fff 0%, #fafbff 100%);
  border-radius: 25rpx;
  padding: 35rpx;
  box-shadow: 0 8rpx 35rpx rgba(0, 0, 0, 0.12);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.venue-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 25rpx 25rpx 0 0;
}

.venue-item:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 45rpx rgba(0, 0, 0, 0.18);
}

.venue-info {
  margin-bottom: 30rpx;
}

.venue-item .venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.venue-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.venue-status {
  padding: 10rpx 18rpx;
  border-radius: 25rpx;
  font-size: 22rpx;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.status-open {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border: 1rpx solid #b8dacc;
}

.status-closed {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  border: 1rpx solid #f1b0b7;
}

.status-maintenance {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  color: #856404;
  border: 1rpx solid #fada5e;
}

.venue-details {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.venue-type,
.venue-capacity,
.venue-price {
  font-size: 24rpx;
  color: #666;
}

.venue-price {
  color: #e74c3c;
  font-weight: 600;
}

.venue-description {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  border-left: 4rpx solid #667eea;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.description-text {
  font-size: 24rpx;
  color: #495057;
  line-height: 1.5;
}

/* 时间段 */
.time-slots {
  margin-bottom: 30rpx;
}

.slots-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx;
}

.time-slot {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 22rpx;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.time-slot.available {
  border-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  cursor: pointer;
  transform: scale(1);
}

.time-slot.available:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 15rpx rgba(40, 167, 69, 0.3);
}

.time-slot.reserved {
  border-color: #dc3545;
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  opacity: 0.7;
}

.time-slot.maintenance {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  opacity: 0.8;
}

.time-slot:active {
  transform: scale(0.98);
}

.slot-time {
  display: block;
  font-size: 22rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.slot-status {
  font-size: 20rpx;
  color: #666;
}

/* 场地操作 */
.venue-actions {
  display: flex;
  gap: 20rpx;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.btn-secondary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  border: 2rpx solid #dee2e6;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: 2rpx solid transparent;
}

.btn-primary:disabled {
  background: linear-gradient(135deg, #ccc 0%, #999 100%);
  color: #666;
  opacity: 0.6;
}

.btn-secondary:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
}

/* 空场地状态 */
.empty-venues {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #666;
}

/* 预约记录 */
.record-header {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.record-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.record-filters {
  display: flex;
  gap: 20rpx;
}

.filter-picker {
  flex: 1;
}

.filter-value {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 24rpx;
  color: #333;
  text-align: center;
}

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.record-item:active {
  transform: scale(0.98);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.record-date {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.record-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.record-info {
  display: flex;
  gap: 20rpx;
}

.record-venue {
  font-size: 24rpx;
  color: #333;
}

.record-time {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.record-details {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 15rpx;
}

.detail-item {
  display: block;
  font-size: 22rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.record-time {
  display: flex;
  gap: 10rpx;
}

.time-label {
  font-size: 22rpx;
  color: #666;
}

.time-value {
  font-size: 22rpx;
  color: #333;
}

/* 空记录状态 */
.empty-record {
  text-align: center;
  padding: 100rpx 40rpx;
}

/* 场地安排 */
.schedule-header {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.schedule-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.schedule-filters {
  display: flex;
  gap: 20rpx;
}

/* 安排表 */
.schedule-table {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  background: #667eea;
  color: #fff;
}

.time-column,
.venue-column {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
}

.time-column {
  flex: 0 0 120rpx;
}

.venue-column:last-child {
  border-right: none;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #e9ecef;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row .time-column {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.table-row .venue-column {
  cursor: pointer;
  transition: all 0.3s ease;
}

.table-row .venue-column:active {
  transform: scale(0.98);
}

.cell-available {
  background: #d4edda;
  color: #155724;
}

.cell-reserved {
  background: #f8d7da;
  color: #721c24;
}

.cell-maintenance {
  background: #fff3cd;
  color: #856404;
}

.cell-text {
  font-size: 22rpx;
  font-weight: 500;
}

/* 空安排状态 */
.empty-schedule {
  text-align: center;
  padding: 100rpx 40rpx;
}

/* 预约弹窗 */
.reservation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
}

.venue-summary {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.summary-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.summary-type {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.summary-price {
  font-size: 26rpx;
  color: #e74c3c;
  font-weight: 600;
}

.reservation-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.form-row {
  display: flex;
  align-items: center;
}

.form-label {
  width: 160rpx;
  font-size: 26rpx;
  color: #333;
}

.form-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.form-input {
  flex: 1;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
}

.form-textarea {
  flex: 1;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
  height: 80rpx;
  resize: none;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 2rpx solid #f0f0f0;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 40rpx;
}

.load-more-btn {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 20rpx 40rpx;
  font-size: 26rpx;
  color: #666;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 26rpx;
  color: #666;
}

/* 响应式设计 */
@media screen and (min-width: 750px) {
  .venue-header .venue-type-selector {
    grid-template-columns: repeat(5, 1fr) !important;
    gap: 20rpx !important;
  }
  
  .venue-header .type-tab {
    min-height: 140rpx;
    padding: 30rpx 20rpx;
  }
  
  .venue-header .type-icon {
    font-size: 48rpx;
    margin-bottom: 12rpx;
  }
  
  .venue-header .type-text {
    font-size: 26rpx;
  }
  
  .venue-header .date-selector {
    padding: 20rpx 25rpx !important;
  }
  
  .venue-header .current-date {
    font-size: 36rpx;
    padding: 20rpx 25rpx;
  }
  
  .venue-header .date-row {
    gap: 30rpx !important;
  }
}

@media screen and (max-width: 600rpx) {
  .venue-header .venue-type-selector {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12rpx !important;
  }
  
  .venue-header .type-tab {
    min-height: 100rpx;
    padding: 20rpx 15rpx;
  }
  
  .venue-header .type-icon {
    font-size: 32rpx;
    margin-bottom: 6rpx;
  }
  
  .venue-header .type-text {
    font-size: 22rpx;
  }
  
  .venue-header .section-title {
    font-size: 26rpx !important;
  }
  
  .venue-header .current-date {
    font-size: 26rpx;
    padding: 12rpx 15rpx;
  }
  
  .venue-header .date-btn {
    width: 50rpx;
    height: 50rpx;
  }
  
  .venue-header .date-picker {
    margin: 0 10rpx;
  }
  
  .venue-header .date-icon {
    font-size: 20rpx;
  }
  
  .venue-header .date-row {
    gap: 15rpx !important;
  }
  
  .venue-header .date-selector {
    padding: 12rpx 15rpx !important;
  }
}

/* 3D效果增强 */
.type-tab {
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.type-tab.active {
  box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
}

.date-btn {
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.1);
}

.date-btn:active {
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

/* 动画优化 */
.type-tab {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
