<template>
  <view class="venues-admin-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">球馆管理</view>
      <view class="header-subtitle">管理场地信息、时间段和预约策略</view>
    </view>

    <!-- 功能导航 -->
    <view class="tab-navigation">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'venues' }"
        @click="switchTab('venues')"
      >
        <text>场地管理</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'schedule' }"
        @click="switchTab('schedule')"
      >
        <text>时间管理</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'reservations' }"
        @click="switchTab('reservations')"
      >
        <text>预约管理</text>
      </view>
    </view>

    <!-- 场地管理标签页 -->
    <view v-if="activeTab === 'venues'" class="tab-content">
      <!-- 搜索和筛选 -->
      <view class="search-section">
        <view class="search-bar">
          <input 
            class="search-input" 
            placeholder="搜索场地名称"
            v-model="searchKeyword"
            @input="onSearchInput"
          />
          <button class="search-btn" @click="searchVenues">
            <text>🔍</text>
          </button>
        </view>
        
        <view class="filter-row">
          <picker :range="typeOptions" @change="onTypeFilterChange">
            <view class="filter-picker">
              <text>{{ typeOptions[typeFilterIndex] }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
          
          <picker :range="statusOptions" @change="onStatusFilterChange">
            <view class="filter-picker">
              <text>{{ statusOptions[statusFilterIndex] }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
          
          <button class="filter-btn" @click="resetFilter">
            重置
          </button>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="action-btn primary" @click="addVenue">
          + 添加场地
        </button>
        <button class="action-btn secondary" @click="exportVenues">
          导出数据
        </button>
        <button 
          v-if="selectedVenues.length > 0" 
          class="action-btn danger" 
          @click="batchDeleteVenues"
        >
          批量删除 ({{ selectedVenues.length }})
        </button>
      </view>

      <!-- 场地列表 -->
      <view class="venues-list">
        <view v-if="venuesList.length === 0" class="empty-state">
          <text class="empty-text">暂无场地数据</text>
          <text class="empty-hint">添加场地后将在此显示</text>
        </view>
        
        <view v-else class="list-header">
          <checkbox 
            class="select-all-checkbox" 
            :checked="isAllSelected"
            @change="toggleSelectAll"
          />
          <text class="header-label">全选</text>
          <text class="venue-count">共 {{ totalVenues }} 个场地</text>
        </view>
        
        <view class="venues-grid">
          <view 
            v-for="venue in venuesList" 
            :key="venue.id"
            class="venue-card"
          >
            <checkbox 
              class="venue-checkbox" 
              :checked="selectedVenues.includes(venue.id)"
              @change="toggleVenueSelect(venue.id)"
              @click.stop
            />
            
            <image 
              :src="venue.image || '/static/default-venue.png'" 
              class="venue-image" 
              mode="aspectFill"
              @click="viewVenueDetail(venue)"
            />
            
            <view class="venue-info">
              <view class="venue-header">
                <text class="venue-name">{{ venue.name }}</text>
                <view class="venue-status" :class="venue.status">
                  <text>{{ getStatusText(venue.status) }}</text>
                </view>
              </view>
              
              <view class="venue-type">
                <text class="type-icon">{{ getTypeIcon(venue.type) }}</text>
                <text class="type-name">{{ getTypeText(venue.type) }}</text>
              </view>
              
              <view class="venue-capacity">
                <text class="capacity-label">容量：</text>
                <text class="capacity-value">{{ venue.capacity || 0 }}人</text>
              </view>
              
              <view class="venue-price">
                <text class="price-label">价格：</text>
                <text class="price-value">¥{{ venue.pricePerHour || '0.00' }}/小时</text>
              </view>
              
              <view class="venue-features">
                <text 
                  v-for="feature in venue.features" 
                  :key="feature"
                  class="feature-tag"
                >
                  {{ feature }}
                </text>
              </view>
              
              <view class="venue-stats">
                <text class="stat-item">今日预约: {{ venue.todayReservations || 0 }}</text>
                <text class="stat-item">使用率: {{ venue.utilizationRate || 0 }}%</text>
              </view>
              
              <view class="venue-meta">
                <text class="create-time">创建: {{ formatDate(venue.createTime) }}</text>
                <text class="update-time">更新: {{ formatDate(venue.updateTime) }}</text>
              </view>
            </view>
            
            <view class="venue-actions">
              <button class="action-btn small" @click="editVenue(venue)">
                编辑
              </button>
              <button class="action-btn small secondary" @click="manageSchedule(venue)">
                时间管理
              </button>
              <button 
                class="action-btn small" 
                :class="venue.status === 'active' ? 'danger' : 'success'"
                @click="toggleVenueStatus(venue)"
              >
                {{ venue.status === 'active' ? '停用' : '启用' }}
              </button>
              <button class="action-btn small danger" @click="deleteVenue(venue)">
                删除
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 分页 -->
      <view v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        
        <text class="page-info">{{ currentPage }} / {{ totalPages }}</text>
        
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </view>
    </view>

    <!-- 时间管理标签页 -->
    <view v-if="activeTab === 'schedule'" class="tab-content">
      <!-- 场地选择 -->
      <view class="venue-selector">
        <text class="selector-label">选择场地：</text>
        <picker :range="venueOptions" @change="onVenueChange">
          <view class="venue-picker">
            <text>{{ venueOptions[selectedVenueIndex] || '请选择场地' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <!-- 日期选择 -->
      <view class="date-selector">
        <text class="selector-label">选择日期：</text>
        <picker mode="date" :value="selectedDate" @change="onDateChange">
          <view class="date-picker">
            <text>{{ selectedDate || '请选择日期' }}</text>
            <text class="picker-icon">📅</text>
          </view>
        </picker>
      </view>

      <!-- 时间段管理 -->
      <view v-if="selectedVenueIndex > 0" class="schedule-section">
        <view class="section-title">
          <text>时间段配置</text>
          <button class="add-slot-btn" @click="addTimeSlot">+ 添加时间段</button>
        </view>
        
        <view v-if="timeSlots.length === 0" class="empty-state">
          <text class="empty-text">暂无时间段配置</text>
          <text class="empty-hint">添加时间段来开放预约</text>
        </view>
        
        <view v-else class="time-slots-list">
          <view 
            v-for="slot in timeSlots" 
            :key="slot.id"
            class="time-slot-item"
            :class="{ 
              available: slot.status === 'available',
              booked: slot.status === 'booked',
              maintenance: slot.status === 'maintenance'
            }"
          >
            <view class="slot-time">
              <text class="start-time">{{ slot.startTime }}</text>
              <text class="time-separator">-</text>
              <text class="end-time">{{ slot.endTime }}</text>
            </view>
            
            <view class="slot-info">
              <view class="slot-status" :class="slot.status">
                <text>{{ getSlotStatusText(slot.status) }}</text>
              </view>
              <text class="slot-price">¥{{ slot.price || '0.00' }}</text>
            </view>
            
            <view class="slot-reservation" v-if="slot.reservation">
              <text class="reservation-user">预约人: {{ slot.reservation.userName }}</text>
              <text class="reservation-phone">联系方式: {{ slot.reservation.phoneNumber }}</text>
            </view>
            
            <view class="slot-actions">
              <button 
                v-if="slot.status === 'available'"
                class="action-btn small secondary" 
                @click="editTimeSlot(slot)"
              >
                编辑
              </button>
              <button 
                v-if="slot.status === 'booked'"
                class="action-btn small warning" 
                @click="cancelReservation(slot)"
              >
                取消预约
              </button>
              <button 
                class="action-btn small" 
                :class="slot.status === 'maintenance' ? 'success' : 'danger'"
                @click="toggleSlotMaintenance(slot)"
              >
                {{ slot.status === 'maintenance' ? '恢复' : '维护' }}
              </button>
              <button 
                v-if="slot.status === 'available'"
                class="action-btn small danger" 
                @click="deleteTimeSlot(slot)"
              >
                删除
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 预约管理标签页 -->
    <view v-if="activeTab === 'reservations'" class="tab-content">
      <!-- 筛选条件 -->
      <view class="reservation-filters">
        <view class="filter-row">
          <picker mode="date" :value="filterDate" @change="onFilterDateChange">
            <view class="filter-picker">
              <text>{{ filterDate || '选择日期' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
          
          <picker :range="venueFilterOptions" @change="onVenueFilterChange">
            <view class="filter-picker">
              <text>{{ venueFilterOptions[venueFilterIndex] }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
          
          <picker :range="reservationStatusOptions" @change="onReservationStatusChange">
            <view class="filter-picker">
              <text>{{ reservationStatusOptions[reservationStatusIndex] }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 预约列表 -->
      <view class="reservations-list">
        <view v-if="reservationsList.length === 0" class="empty-state">
          <text class="empty-text">暂无预约记录</text>
          <text class="empty-hint">用户预约后将在此显示</text>
        </view>
        
        <view 
          v-for="reservation in reservationsList" 
          :key="reservation.id"
          class="reservation-item"
        >
          <view class="reservation-header">
            <text class="venue-name">{{ reservation.venueName }}</text>
            <view class="reservation-status" :class="reservation.status">
              <text>{{ getReservationStatusText(reservation.status) }}</text>
            </view>
          </view>
          
          <view class="reservation-time">
            <text class="date">{{ formatDate(reservation.date) }}</text>
            <text class="time">{{ reservation.startTime }} - {{ reservation.endTime }}</text>
          </view>
          
          <view class="reservation-user">
            <text class="user-name">预约人: {{ reservation.userName }}</text>
            <text class="user-phone">联系方式: {{ reservation.phoneNumber }}</text>
          </view>
          
          <view class="reservation-details">
            <text class="price">费用: ¥{{ reservation.totalPrice }}</text>
            <text class="create-time">预约时间: {{ formatDateTime(reservation.createTime) }}</text>
          </view>
          
          <view v-if="reservation.remark" class="reservation-remark">
            <text>备注: {{ reservation.remark }}</text>
          </view>
          
          <view class="reservation-actions">
            <button 
              v-if="reservation.status === 'pending'"
              class="action-btn small success" 
              @click="confirmReservation(reservation)"
            >
              确认
            </button>
            <button 
              v-if="reservation.status === 'pending'"
              class="action-btn small danger" 
              @click="rejectReservation(reservation)"
            >
              拒绝
            </button>
            <button 
              v-if="reservation.status === 'confirmed'"
              class="action-btn small warning" 
              @click="cancelReservation(reservation)"
            >
              取消
            </button>
            <button class="action-btn small secondary" @click="viewReservationDetail(reservation)">
              详情
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 场地编辑弹窗 -->
    <VenueEditModal 
      v-if="showVenueEditModal"
      :visible="showVenueEditModal"
      :venue="selectedVenueForEdit"
      @close="showVenueEditModal = false"
      @saved="onVenueSaved"
    />

    <!-- 时间段编辑弹窗 -->
    <TimeSlotEditModal 
      v-if="showTimeSlotEditModal"
      :visible="showTimeSlotEditModal"
      :timeSlot="selectedTimeSlotForEdit"
      :venueId="selectedVenueId"
      @close="showTimeSlotEditModal = false"
      @saved="onTimeSlotSaved"
    />

    <!-- 底部导航 -->
    <BottomNav :currentPage="'/pages/admin/venues'" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import VenueEditModal from '@/components/VenueEditModal.vue'
import TimeSlotEditModal from '@/components/TimeSlotEditModal.vue'
import api from '@/utils/api'

export default {
  name: 'VenuesAdmin',
  components: {
    BottomNav,
    VenueEditModal,
    TimeSlotEditModal
  },
  data() {
    return {
      activeTab: 'venues',
      
      // 搜索和筛选
      searchKeyword: '',
      typeFilterIndex: 0,
      statusFilterIndex: 0,
      typeOptions: ['全部类型', '篮球场', '羽毛球场', '乒乓球场', '网球场', '足球场'],
      statusOptions: ['全部状态', 'normal', '维护中', '停用'],
      
      // 场地数据
      venuesList: [],
      selectedVenues: [],
      totalVenues: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      
      // 时间管理
      selectedVenueIndex: 0,
      selectedVenueId: '',
      selectedDate: '',
      venueOptions: ['请选择场地'],
      timeSlots: [],
      
      // 预约管理
      filterDate: '',
      venueFilterIndex: 0,
      reservationStatusIndex: 0,
      venueFilterOptions: ['全部场地'],
      reservationStatusOptions: ['全部状态', '待确认', '已确认', '已完成', '已取消'],
      reservationsList: [],
      
      // 弹窗控制
      showVenueEditModal: false,
      showTimeSlotEditModal: false,
      selectedVenueForEdit: null,
      selectedTimeSlotForEdit: null,
      
      loading: false
    }
  },
  computed: {
    isAllSelected() {
      return this.venuesList.length > 0 && this.selectedVenues.length === this.venuesList.length
    }
  },
  onLoad() {
    this.checkAdminPermission()
    this.loadVenues()
    this.loadVenueOptions()
  },
  methods: {
    /**
     * 检查管理员权限
     */
    async checkAdminPermission() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.role || !['admin', 'sys_admin'].includes(userInfo.role)) {
          uni.showToast({
            title: '权限不足',
            icon: 'error'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
          return false
        }
        return true
      } catch (error) {
        console.error('检查权限失败:', error)
        return false
      }
    },

    /**
     * 切换标签页
     */
    switchTab(tab) {
      this.activeTab = tab
      if (tab === 'venues') {
        this.loadVenues()
      } else if (tab === 'schedule') {
        this.loadVenueOptions()
      } else if (tab === 'reservations') {
        this.loadReservations()
      }
    },

    /**
     * 搜索场地
     */
    onSearchInput(e) {
      this.searchKeyword = e.detail.value
      // 防抖搜索
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.searchVenues()
      }, 500)
    },

    searchVenues() {
      this.currentPage = 1
      this.loadVenues()
    },

    /**
     * 筛选条件变化
     */
    onTypeFilterChange(e) {
      this.typeFilterIndex = e.detail.value
      this.currentPage = 1
      this.loadVenues()
    },

    onStatusFilterChange(e) {
      this.statusFilterIndex = e.detail.value
      this.currentPage = 1
      this.loadVenues()
    },

    resetFilter() {
      this.searchKeyword = ''
      this.typeFilterIndex = 0
      this.statusFilterIndex = 0
      this.currentPage = 1
      this.loadVenues()
    },

    /**
     * 加载场地列表
     */
    async loadVenues() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        }

        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }

        if (this.typeFilterIndex > 0) {
          const types = ['', 'basketball', 'badminton', 'pingpong', 'tennis', 'football']
          params.type = types[this.typeFilterIndex]
        }

        if (this.statusFilterIndex > 0) {
          const statuses = ['', 'active', 'maintenance', 'inactive']
          params.status = statuses[this.statusFilterIndex]
        }

        const response = await api.admin.getVenuesList(params)
        if (response.success) {
          this.venuesList = response.data.list || []
          this.totalVenues = response.data.total || 0
          this.totalPages = Math.ceil(this.totalVenues / this.pageSize)
        }
      } catch (error) {
        console.error('加载场地列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载场地选项
     */
    async loadVenueOptions() {
      try {
        const response = await api.admin.getVenuesList({ pageSize: 10 })
        if (response.success) {
          const venues = response.data.list || []
          this.venueOptions = ['请选择场地', ...venues.map(venue => venue.name)]
          this.venueFilterOptions = ['全部场地', ...venues.map(venue => venue.name)]
        }
      } catch (error) {
        console.error('加载场地选项失败:', error)
      }
    },

    /**
     * 时间管理相关
     */
    onVenueChange(e) {
      this.selectedVenueIndex = e.detail.value
      if (this.selectedVenueIndex > 0) {
        // 获取选中场地的ID
        this.selectedVenueId = this.venuesList[this.selectedVenueIndex - 1]?.id || ''
        this.loadTimeSlots()
      }
    },

    onDateChange(e) {
      this.selectedDate = e.detail.value
      if (this.selectedVenueId) {
        this.loadTimeSlots()
      }
    },

    async loadTimeSlots() {
      if (!this.selectedVenueId || !this.selectedDate) return
      
      try {
        const response = await api.admin.getVenueSchedule(this.selectedVenueId, this.selectedDate)
        if (response.success) {
          this.timeSlots = response.data || []
        }
      } catch (error) {
        console.error('加载时间段失败:', error)
      }
    },

    addTimeSlot() {
      if (!this.selectedVenueId) {
        uni.showToast({
          title: '请先选择场地',
          icon: 'error'
        })
        return
      }
      this.selectedTimeSlotForEdit = null
      this.showTimeSlotEditModal = true
    },

    editTimeSlot(slot) {
      this.selectedTimeSlotForEdit = slot
      this.showTimeSlotEditModal = true
    },

    async deleteTimeSlot(slot) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除时间段 ${slot.startTime}-${slot.endTime} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.deleteTimeSlot(slot.id)
              if (response.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadTimeSlots()
              }
            } catch (error) {
              console.error('删除时间段失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'error'
              })
            }
          }
        }
      })
    },

    async toggleSlotMaintenance(slot) {
      const newStatus = slot.status === 'maintenance' ? 'available' : 'maintenance'
      const actionText = newStatus === 'maintenance' ? '维护' : '恢复'
      
      try {
        const response = await api.admin.updateTimeSlotStatus(slot.id, newStatus)
        if (response.success) {
          uni.showToast({
            title: `${actionText}成功`,
            icon: 'success'
          })
          this.loadTimeSlots()
        }
      } catch (error) {
        console.error(`${actionText}时间段失败:`, error)
        uni.showToast({
          title: `${actionText}失败`,
          icon: 'error'
        })
      }
    },

    /**
     * 预约管理相关
     */
    onFilterDateChange(e) {
      this.filterDate = e.detail.value
      this.loadReservations()
    },

    onVenueFilterChange(e) {
      this.venueFilterIndex = e.detail.value
      this.loadReservations()
    },

    onReservationStatusChange(e) {
      this.reservationStatusIndex = e.detail.value
      this.loadReservations()
    },

    async loadReservations() {
      try {
        const params = {}
        
        if (this.filterDate) {
          params.date = this.filterDate
        }
        
        if (this.venueFilterIndex > 0) {
          // 根据场地名称获取场地ID
          params.venueName = this.venueFilterOptions[this.venueFilterIndex]
        }
        
        if (this.reservationStatusIndex > 0) {
          const statuses = ['', 'pending', 'confirmed', 'completed', 'cancelled']
          params.status = statuses[this.reservationStatusIndex]
        }

        const response = await api.admin.getReservationsList(params)
        if (response.success) {
          this.reservationsList = response.data || []
        }
      } catch (error) {
        console.error('加载预约列表失败:', error)
      }
    },

    async confirmReservation(reservation) {
      try {
        const response = await api.admin.confirmReservation(reservation.id)
        if (response.success) {
          uni.showToast({
            title: '确认成功',
            icon: 'success'
          })
          this.loadReservations()
        }
      } catch (error) {
        console.error('确认预约失败:', error)
        uni.showToast({
          title: '确认失败',
          icon: 'error'
        })
      }
    },

    async rejectReservation(reservation) {
      uni.showModal({
        title: '确认拒绝',
        content: `确定要拒绝 ${reservation.userName} 的预约吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.rejectReservation(reservation.id)
              if (response.success) {
                uni.showToast({
                  title: '已拒绝预约',
                  icon: 'success'
                })
                this.loadReservations()
              }
            } catch (error) {
              console.error('拒绝预约失败:', error)
              uni.showToast({
                title: '操作失败',
                icon: 'error'
              })
            }
          }
        }
      })
    },

    viewReservationDetail(reservation) {
      uni.navigateTo({
        url: `/pages/admin/reservation-detail?id=${reservation.id}`
      })
    },

    /**
     * 场地选择
     */
    toggleSelectAll(e) {
      if (e.detail.value) {
        this.selectedVenues = this.venuesList.map(venue => venue.id)
      } else {
        this.selectedVenues = []
      }
    },

    toggleVenueSelect(venueId) {
      const index = this.selectedVenues.indexOf(venueId)
      if (index > -1) {
        this.selectedVenues.splice(index, 1)
      } else {
        this.selectedVenues.push(venueId)
      }
    },

    /**
     * 分页
     */
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.loadVenues()
      }
    },

    /**
     * 场地操作
     */
    addVenue() {
      this.selectedVenueForEdit = null
      this.showVenueEditModal = true
    },

    viewVenueDetail(venue) {
      this.editVenue(venue)
    },

    editVenue(venue) {
      this.selectedVenueForEdit = venue
      this.showVenueEditModal = true
    },

    manageSchedule(venue) {
      this.activeTab = 'schedule'
      // 设置选中的场地
      const venueIndex = this.venueOptions.findIndex(name => name === venue.name)
      if (venueIndex > 0) {
        this.selectedVenueIndex = venueIndex
        this.selectedVenueId = venue.id
        this.selectedDate = this.getTodayDate()
        this.loadTimeSlots()
      }
    },

    async toggleVenueStatus(venue) {
      const newStatus = venue.status === 'active' ? 'inactive' : 'active'
      const actionText = newStatus === 'active' ? '启用' : '停用'
      
      uni.showModal({
        title: `确认${actionText}`,
        content: `确定要${actionText}场地"${venue.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.updateVenueStatus(venue.id, newStatus)
              if (response.success) {
                uni.showToast({
                  title: `${actionText}成功`,
                  icon: 'success'
                })
                this.loadVenues()
              }
            } catch (error) {
              console.error(`${actionText}场地失败:`, error)
              uni.showToast({
                title: `${actionText}失败`,
                icon: 'error'
              })
            }
          }
        }
      })
    },

    async deleteVenue(venue) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除场地"${venue.name}"吗？此操作不可恢复。`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.deleteVenue(venue.id)
              if (response.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadVenues()
              }
            } catch (error) {
              console.error('删除场地失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'error'
              })
            }
          }
        }
      })
    },

    async batchDeleteVenues() {
      uni.showModal({
        title: '确认批量删除',
        content: `确定要删除选中的 ${this.selectedVenues.length} 个场地吗？此操作不可恢复。`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.batchDeleteVenues(this.selectedVenues)
              if (response.success) {
                uni.showToast({
                  title: '批量删除成功',
                  icon: 'success'
                })
                this.selectedVenues = []
                this.loadVenues()
              }
            } catch (error) {
              console.error('批量删除失败:', error)
              uni.showToast({
                title: '批量删除失败',
                icon: 'error'
              })
            }
          }
        }
      })
    },

    exportVenues() {
      uni.showToast({
        title: '导出功能开发中',
        icon: 'none'
      })
    },

    /**
     * 事件处理
     */
    onVenueSaved() {
      this.loadVenues()
      this.loadVenueOptions()
      this.showVenueEditModal = false
    },

    onTimeSlotSaved() {
      this.loadTimeSlots()
      this.showTimeSlotEditModal = false
    },

    /**
     * 工具方法
     */
    getTodayDate() {
      return this.$getCurrentDate()
    },

    formatDate(dateStr) {
      if (!dateStr) return '未知'
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDate(dateStr)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return '未知'
      }
    },

    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '未知'
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDateTime(dateTimeStr)
      } catch (error) {
        console.error('日期时间格式化错误:', error)
        return '未知'
      }
    },

    getStatusText(status) {
      const texts = {
        active: 'normal',
        maintenance: '维护中',
        inactive: '停用'
      }
      return texts[status] || status
    },

    getTypeText(type) {
      const texts = {
        basketball: '篮球场',
        badminton: '羽毛球场',
        pingpong: '乒乓球场',
        tennis: '网球场',
        football: '足球场'
      }
      return texts[type] || type
    },

    getTypeIcon(type) {
      const icons = {
        basketball: '🏀',
        badminton: '🏸',
        pingpong: '🏓',
        tennis: '🎾',
        football: '⚽'
      }
      return icons[type] || '🏟️'
    },

    getSlotStatusText(status) {
      const texts = {
        available: '可预约',
        booked: '已预约',
        maintenance: '维护中'
      }
      return texts[status] || status
    },

    getReservationStatusText(status) {
      const texts = {
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        cancelled: '已取消'
      }
      return texts[status] || status
    }
  }
}
</script>

<style lang="scss" scoped>
.venues-admin-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 120rpx; /* 为底部导航栏预留空间 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 40rpx;
  color: white;
}

.header-title {
  font-size: 44rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.header-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
}

/* 标签导航 */
.tab-navigation {
  background: white;
  display: flex;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  padding: 30rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  border-bottom: 4rpx solid transparent;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 500;
}

/* 标签内容 */
.tab-content {
  padding: 30rpx;
}

/* 搜索区域 */
.search-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 2rpx solid #e9ecef;
  font-size: 26rpx;
  margin-right: 16rpx;
}

.search-btn {
  width: 80rpx;
  height: 80rpx;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.filter-row {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.filter-picker {
  flex: 1;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
}

.picker-arrow {
  color: #999;
  font-size: 20rpx;
}

.filter-btn {
  padding: 20rpx 30rpx;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

/* 操作区域 */
.action-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.action-btn {
  padding: 20rpx 30rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.action-btn.danger {
  background: #e74c3c;
  color: white;
}

.action-btn.small {
  padding: 12rpx 20rpx;
  font-size: 22rpx;
}

.action-btn.success {
  background: #27ae60;
  color: white;
}

.action-btn.warning {
  background: #f39c12;
  color: white;
}

/* 场地列表 */
.venues-list {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.list-header {
  padding: 30rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #e9ecef;
}

.select-all-checkbox {
  margin-right: 20rpx;
}

.header-label {
  font-size: 26rpx;
  color: #333;
  margin-right: auto;
}

.venue-count {
  font-size: 24rpx;
  color: #666;
}

.venues-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 20rpx;
}

.venue-card {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.venue-card:active {
  transform: scale(0.98);
}

.venue-checkbox {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  z-index: 2;
}

.venue-image {
  width: 100%;
  height: 240rpx;
  background: #f8f9fa;
}

.venue-info {
  padding: 20rpx;
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.venue-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 12rpx;
}

.venue-status {
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: white;
}

.venue-status.active {
  background: #27ae60;
}

.venue-status.maintenance {
  background: #f39c12;
}

.venue-status.inactive {
  background: #e74c3c;
}

.venue-type {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.type-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.type-name {
  font-size: 24rpx;
  color: #666;
}

.venue-capacity,
.venue-price {
  margin-bottom: 12rpx;
}

.capacity-label,
.price-label {
  font-size: 24rpx;
  color: #666;
}

.capacity-value {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
}

.price-value {
  font-size: 26rpx;
  font-weight: bold;
  color: #e74c3c;
}

.venue-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.feature-tag {
  font-size: 20rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
}

.venue-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.stat-item {
  font-size: 22rpx;
  color: #666;
}

.venue-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.create-time,
.update-time {
  font-size: 20rpx;
  color: #999;
}

.venue-actions {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

/* 场地和日期选择器 */
.venue-selector,
.date-selector {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.selector-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.venue-picker,
.date-picker {
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
}

.picker-icon {
  font-size: 32rpx;
}

/* 时间段管理 */
.schedule-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.add-slot-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.time-slots-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.time-slot-item {
  padding: 24rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.time-slot-item.available {
  background: rgba(39, 174, 96, 0.05);
  border-color: #27ae60;
}

.time-slot-item.booked {
  background: rgba(231, 76, 60, 0.05);
  border-color: #e74c3c;
}

.time-slot-item.maintenance {
  background: rgba(243, 156, 18, 0.05);
  border-color: #f39c12;
}

.slot-time {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.start-time,
.end-time {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.time-separator {
  margin: 0 16rpx;
  font-size: 28rpx;
  color: #666;
}

.slot-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.slot-status {
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: white;
}

.slot-status.available {
  background: #27ae60;
}

.slot-status.booked {
  background: #e74c3c;
}

.slot-status.maintenance {
  background: #f39c12;
}

.slot-price {
  font-size: 26rpx;
  font-weight: bold;
  color: #e74c3c;
}

.slot-reservation {
  background: #f8f9fa;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.reservation-user,
.reservation-phone {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.slot-actions {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

/* 预约管理 */
.reservation-filters {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.reservation-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.reservation-status {
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: white;
}

.reservation-status.pending {
  background: #f39c12;
}

.reservation-status.confirmed {
  background: #27ae60;
}

.reservation-status.completed {
  background: #667eea;
}

.reservation-status.cancelled {
  background: #e74c3c;
}

.reservation-time {
  margin-bottom: 16rpx;
}

.date {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}

.time {
  font-size: 26rpx;
  color: #666;
}

.reservation-user {
  margin-bottom: 16rpx;
}

.user-name,
.user-phone {
  font-size: 24rpx;
  color: #666;
  margin-right: 20rpx;
}

.reservation-details {
  margin-bottom: 16rpx;
}

.price,
.create-time {
  font-size: 24rpx;
  color: #666;
  margin-right: 20rpx;
}

.reservation-remark {
  background: #f8f9fa;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: #666;
}

.reservation-actions {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  margin-top: 30rpx;
}

.page-btn {
  padding: 20rpx 30rpx;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.page-btn:disabled {
  background: #ccc;
  color: #999;
}

.page-info {
  font-size: 26rpx;
  color: #333;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
}

.empty-text {
  font-size: 28rpx;
  margin-bottom: 12rpx;
  display: block;
}

.empty-hint {
  font-size: 24rpx;
  display: block;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .venues-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 15rpx;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .venue-actions,
  .slot-actions,
  .reservation-actions {
    justify-content: flex-start;
  }
}
</style>
