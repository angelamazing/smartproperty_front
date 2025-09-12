<template>
  <view class="dining-container">
    <!-- 顶部操作栏 -->
    <view class="action-bar">
      <view class="action-tabs">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'menu' }"
          @click="switchTab('menu')"
        >
          <text class="tab-text">今日菜单</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'order' }"
          @click="switchTab('order')"
        >
          <text class="tab-text">部门报餐</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'record' }"
          @click="switchTab('record')"
        >
          <text class="tab-text">报餐记录</text>
        </view>
      </view>
    </view>

    <!-- 今日菜单标签页 -->
    <view class="tab-content" v-if="currentTab === 'menu'">
      <view class="menu-header">
        <view class="date-selector">
          <button class="date-btn" @click="previousDate">
            <text class="date-icon">◀</text>
          </button>
          <text class="current-date">{{ selectedDate }}</text>
          <button class="date-btn" @click="nextDate">
            <text class="date-icon">▶</text>
          </button>
        </view>
        <view class="meal-selector">
          <view
            class="meal-tab"
            :class="{ active: selectedMeal === meal.value }"
            v-for="meal in mealTypes || []"
            :key="meal.value"
            @click="selectMeal(meal.value)"
          >
            <text class="meal-text">{{ meal.label }}</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-menu" v-if="isLoading">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载菜单...</text>
      </view>

      <view class="menu-content" v-if="currentMenu && currentMenu._id">
         <view class="menu-info">
           <text class="menu-title">{{ getMealTypeText(currentMenu.mealType) }}菜单</text>
           <text class="menu-time">{{ currentMenu.mealTime }}</text>
           <text class="menu-status" :class="getStatusClass(currentMenu.publishStatus)">
             {{ getStatusText(currentMenu.publishStatus) }}
           </text>
         </view>

         <view class="dish-categories">
           <view 
             class="category-section" 
             v-for="category in dishCategories || []" 
             :key="category.value"
           >
             <view class="category-header">
               <text class="category-title">{{ category.label }}</text>
               <text class="dish-count">{{ getDishesByCategory(category.value).length }}道</text>
             </view>
             <view class="dish-list" v-if="getDishesByCategory(category.value).length > 0">
               <view 
                 class="dish-item" 
                 v-for="dish in getDishesByCategory(category.value) || []" 
                 :key="dish._id || dish.id"
               >
                 <view class="dish-info">
                   <text class="dish-name">{{ dish.dishName || dish.name || '未知菜品' }}</text>
                   <text class="dish-description">{{ dish.dishDescription || dish.description || '' }}</text>
                   <view class="dish-tags">
                     <text class="tag" v-if="dish.isSpicy">🌶️ 辣</text>
                     <text class="tag" v-if="dish.isVegetarian">🥬 素</text>
                     <text class="tag" v-if="dish.isRecommended">⭐ 推荐</text>
                   </view>
                 </view>
                 <view class="dish-nutrition" v-if="dish.calories || dish.protein || dish.fat">
                   <text class="nutrition-item" v-if="dish.calories">热量: {{ dish.calories }}kcal</text>
                   <text class="nutrition-item" v-if="dish.protein">蛋白质: {{ dish.protein }}g</text>
                   <text class="nutrition-item" v-if="dish.fat">脂肪: {{ dish.fat }}g</text>
                 </view>
               </view>
             </view>
           </view>
         </view>
      </view>

      <view class="empty-menu" v-else-if="!isLoading">
        <view class="empty-icon">🍽️</view>
        <text class="empty-text">该日期暂无菜单</text>
        <text class="empty-desc">请选择其他日期或餐次</text>
      </view>

      <view class="empty-menu" v-else>
        <view class="empty-icon">🍽️</view>
        <text class="empty-text">该日期暂无菜单</text>
        <text class="empty-desc">请选择其他日期或餐次</text>
      </view>
    </view>

    <!-- 部门报餐标签页 -->
    <view class="tab-content" v-if="currentTab === 'order'">
      <!-- 权限检查提示 -->
      <view v-if="!hasDept管理员Permission" class="permission-denied">
        <view class="permission-icon">🚫</view>
        <text class="permission-title">权限不足</text>
        <text class="permission-desc">部门报餐功能需要部门管理员或系统管理员权限</text>
        <view class="permission-info">
          <text class="info-item">当前角色: {{ getRoleText(userRole) }}</text>
        </view>
      </view>

      <!-- 部门报餐入口 -->
      <view v-else class="dept-order-entry">
        <view class="entry-header">
          <text class="entry-title">部门报餐管理</text>
          <text class="entry-desc">为部门成员统一报餐，查看报餐统计和概览</text>
        </view>
        
        <view class="entry-actions">
          <button class="entry-btn primary" @click="goToDeptOrder">
            <text class="btn-icon">🍽️</text>
            <text class="btn-text">部门报餐</text>
            <text class="btn-desc">为部门成员报餐</text>
          </button>
          
          <button class="entry-btn secondary" @click="goToDeptOverview">
            <text class="btn-icon">📊</text>
            <text class="btn-text">报餐概览</text>
            <text class="btn-desc">查看今日报餐状态</text>
          </button>
          
          <button class="entry-btn secondary" @click="goToDeptStats">
            <text class="btn-icon">📈</text>
            <text class="btn-text">报餐统计</text>
            <text class="btn-desc">查看历史统计数据</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 报餐记录标签页 -->
    <view class="tab-content record-tab" v-if="currentTab === 'record'">
      <!-- 顶部标题区域 -->
      <!-- <view class="record-page-header">
        <text class="page-title">报餐记录</text>
        <text class="page-subtitle">查看和管理报餐记录</text>
      </view> -->

      <!-- 查询卡片 -->
      <view class="query-card">
        <!-- 查询模式选择 -->
        <view class="query-mode-section">
          <text class="section-label">查询方式</text>
          <view class="mode-selector">
            <view 
              class="mode-option" 
              :class="{ active: recordFilter.queryMode === 'single' }"
              @click="switchQueryMode('single')"
            >
              <view class="mode-icon">📅</view>
              <text class="mode-text">单日查询</text>
            </view>
            <view 
              class="mode-option" 
              :class="{ active: recordFilter.queryMode === 'range' }"
              @click="switchQueryMode('range')"
            >
              <view class="mode-icon">📊</view>
              <text class="mode-text">时间段查询</text>
            </view>
          </view>
        </view>

        <!-- 日期选择区域 -->
        <view class="date-section">
          <text class="section-label">选择日期</text>
          
          <!-- 单日查询 -->
          <view v-if="recordFilter.queryMode === 'single'" class="date-picker-container">
            <picker 
              mode="date" 
              :value="recordFilter.date" 
              @change="onRecordDateChange"
              class="date-picker"
            >
              <view class="date-picker-content">
                <view class="date-icon">📅</view>
                <view class="date-info">
                  <text class="date-label">查询日期</text>
                  <text class="date-value">{{ recordFilter.date || '请选择日期' }}</text>
                </view>
                <view class="date-arrow">›</view>
              </view>
            </picker>
          </view>
          
          <!-- 时间段查询 -->
          <view v-if="recordFilter.queryMode === 'range'" class="date-range-container">
            <picker 
              mode="date" 
              :value="recordFilter.startDate" 
              @change="onStartDateChange"
              class="date-picker"
            >
              <view class="date-picker-content">
                <view class="date-icon">📅</view>
                <view class="date-info">
                  <text class="date-label">开始日期</text>
                  <text class="date-value">{{ recordFilter.startDate || '请选择开始日期' }}</text>
                </view>
                <view class="date-arrow">›</view>
              </view>
            </picker>
            
            <view class="date-separator">
              <view class="separator-line"></view>
              <text class="separator-text">至</text>
              <view class="separator-line"></view>
            </view>
            
            <picker 
              mode="date" 
              :value="recordFilter.endDate" 
              @change="onEndDateChange"
              class="date-picker"
            >
              <view class="date-picker-content">
                <view class="date-icon">📅</view>
                <view class="date-info">
                  <text class="date-label">结束日期</text>
                  <text class="date-value">{{ recordFilter.endDate || '请选择结束日期' }}</text>
                </view>
                <view class="date-arrow">›</view>
              </view>
            </picker>
          </view>
        </view>

        <!-- 状态筛选区域 -->
        <view class="status-section">
          <text class="section-label">状态筛选</text>
          <view class="status-filter-container">
            <picker 
              mode="selector" 
              :range="statusOptions" 
              :value="statusIndex" 
              @change="onStatusChange"
              class="status-picker"
            >
              <view class="status-picker-content">
                <view class="status-icon">🔍</view>
                <view class="status-info">
                  <text class="status-label">筛选状态</text>
                  <text class="status-value">{{ recordFilter.status }}</text>
                </view>
                <view class="status-arrow">›</view>
              </view>
            </picker>
            <button class="reset-btn" @click="resetRecordFilters">
              <view class="reset-icon">🔄</view>
              <text class="reset-text">重置</text>
            </button>
          </view>
        </view>

        <!-- 个人状态查询区域 -->
        <view class="personal-status-section">
          <button class="personal-status-btn" @click="loadPersonalStatus">
            <view class="btn-icon-container">
              <view class="btn-icon">👤</view>
            </view>
            <view class="btn-content">
              <text class="btn-title">个人报餐状态</text>
              <text class="btn-desc">查看我的报餐记录</text>
            </view>
            <view class="btn-arrow">›</view>
          </button>
        </view>

        <!-- 查询结果统计 -->
        <view class="query-stats" v-if="diningRecords && diningRecords.length > 0">
          <view class="stats-icon">📈</view>
          <view class="stats-content">
            <text class="stats-text">共找到 {{ diningRecords.length }} 条记录</text>
            <text class="stats-desc" v-if="recordFilter.queryMode === 'range'">
              {{ recordFilter.startDate }} 至 {{ recordFilter.endDate }}
            </text>
            <text class="stats-desc" v-else-if="recordFilter.queryMode === 'single'">
              {{ recordFilter.date }}
            </text>
          </view>
        </view>
      </view>

      <view class="record-list" v-if="diningRecords && diningRecords.length > 0">
        <view 
          class="record-item" 
          v-for="record in diningRecords || []" 
          :key="record._id"
          @click="viewRecordDetail(record)"
        >
          <view class="record-header">
            <text class="record-date">{{ $formatDate(record.diningDate) }}</text>
            <text class="record-status" :class="getStatusClass(record.status)">
              {{ getStatusText(record.status) }}
            </text>
          </view>
          <view class="record-content">
            <view class="record-info">
              <text class="record-type">{{ getMealTypeText(record.mealType) }}</text>
              <text class="record-count">{{ record.memberCount }}人</text>
            </view>
            <view class="record-members">
              <text class="members-text">{{ record.memberNames.join('、') }}</text>
            </view>
            <view class="record-time">
              <text class="time-label">提交时间:</text>
              <text class="time-value">{{ $formatTime(record.createTime) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态卡片 -->
      <view class="empty-state-card" v-else>
        <view class="empty-illustration">
          <view class="empty-icon">📋</view>
          <view class="empty-decoration">
            <view class="decoration-dot"></view>
            <view class="decoration-dot"></view>
            <view class="decoration-dot"></view>
          </view>
        </view>
        <view class="empty-content">
          <text class="empty-title">暂无报餐记录</text>
          <text class="empty-desc">还没有找到符合条件的报餐记录，试试调整筛选条件或开始为部门成员报餐</text>
        </view>
        <view class="empty-actions">
          <button class="primary-action-btn" @click="switchTab('order')">
            <view class="btn-icon">🍽️</view>
            <text class="btn-text">去报餐</text>
          </button>
          <button class="secondary-action-btn" @click="resetRecordFilters">
            <view class="btn-icon">🔄</view>
            <text class="btn-text">重置筛选</text>
          </button>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMoreRecords">
        <button class="load-more-btn" @click="loadMoreRecords" :loading="isLoadingMore">
          {{ isLoadingMore ? '加载中...' : '加载更多' }}
        </button>
      </view>
      
      <!-- 底部安全区域 -->
      <view class="bottom-safe-area"></view>
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
import UserAvatar from '@/components/UserAvatar.vue'
import MenuTab from './components/MenuTab.vue'
import OrderTab from './components/OrderTab.vue'
import RecordTab from './components/RecordTab.vue'
import DishList from './components/DishList.vue'
import QueryCard from './components/QueryCard.vue'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'Dining',
  mixins: [timeMixin],
  components: {
    UserAvatar,
    MenuTab,
    OrderTab,
    RecordTab,
    DishList,
    QueryCard
  },
  data() {
    return {
      currentTab: 'menu',
      isLoading: false,

      // 权限相关
      userRole: 'user',
      hasDept管理员Permission: false,

      // 成员列表搜索和筛选
      memberSearchText: '',
      currentRoleFilter: 'all',
      memberPageSize: 20,
      memberCurrentPage: 1,
      hasMoreMembers: false,
      isPreviewExpanded: false,

      // 菜单相关
      selectedDate: '', // 将在mounted中初始化
      selectedMeal: 'lunch',
       currentMenu: null,
       
       // 过滤相关
       dishSearchText: '',
       selectedCategoryFilter: 'all',
       activeTagFilters: [],
       priceRange: {
         min: '',
         max: ''
       },

      // 报餐表单
      orderForm: {
        date: '',
        mealType: '午餐',
        remark: ''
      },

      // 部门成员
      deptMembers: [],
      selectedMembers: [],

      // 报餐记录
      diningRecords: [],
      recordFilter: {
        date: '',
        startDate: '',
        endDate: '',
        status: '全部',
        queryMode: 'single' // 'single' | 'range' | 'start' | 'end'
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
    mealTypes() {
      return [
        { label: '早餐', value: 'breakfast' },
        { label: '午餐', value: 'lunch' },
        { label: '晚餐', value: 'dinner' }
      ]
    },

    mealTypeOptions() {
      return this.mealTypes.map(item => item.label)
    },

    mealTypeIndex() {
      return this.mealTypes.findIndex(item => item.label === this.orderForm.mealType)
    },

         dishCategories() {
       // 根据实际API返回的分类动态生成
       if (!this.currentMenu || !this.currentMenu.dishes) {
         return [
           { label: '主食', value: '主食' },
           { label: '主菜', value: '主菜' },
           { label: '素菜', value: '素菜' },
           { label: '汤品', value: '汤品' },
           { label: '饮品', value: '饮品' },
           { label: '小食', value: '小食' }
         ]
       }
       
       // 从菜品数据中提取实际存在的分类
       const categories = [...new Set(this.currentMenu.dishes.map(dish => 
         dish.categoryName || dish.category || '未分类'
       ))]
       
       return categories.map(category => ({
         label: category,
         value: category
       }))
     },
     
     // 所有分类列表（用于过滤）
     allCategories() {
       if (!this.currentMenu || !this.currentMenu.dishes) return []
       return [...new Set(this.currentMenu.dishes.map(dish => 
         dish.categoryName || dish.category || '未分类'
       ))]
     },
     
     // 过滤后的菜品数据
     filteredDishes() {
       if (!this.currentMenu || !this.currentMenu.dishes) return []
       
       let dishes = [...this.currentMenu.dishes]
       
       // 1. 搜索过滤
       if (this.dishSearchText.trim()) {
         const searchText = this.dishSearchText.trim().toLowerCase()
         dishes = dishes.filter(dish => {
           const dishName = (dish.dishName || dish.name || '').toLowerCase()
           const description = (dish.dishDescription || dish.description || '').toLowerCase()
           return dishName.includes(searchText) || description.includes(searchText)
         })
       }
       
       // 2. 分类过滤
       if (this.selectedCategoryFilter !== 'all') {
         dishes = dishes.filter(dish => {
           const dishCategory = dish.categoryName || dish.category || '未分类'
           return dishCategory === this.selectedCategoryFilter
         })
       }
       
       // 3. 标签过滤
       if (this.activeTagFilters.length > 0) {
         dishes = dishes.filter(dish => {
           return this.activeTagFilters.every(tag => {
             switch (tag) {
               case 'spicy':
                 return dish.isSpicy === true
               case 'vegetarian':
                 return dish.isVegetarian === true
               case 'recommended':
                 return dish.isRecommended === true
               default:
                 return true
             }
           })
         })
       }
       
       // 4. 价格过滤
       if (this.priceRange.min !== '' || this.priceRange.max !== '') {
         dishes = dishes.filter(dish => {
           const price = dish.price || 0
           const min = this.priceRange.min !== '' ? parseFloat(this.priceRange.min) : 0
           const max = this.priceRange.max !== '' ? parseFloat(this.priceRange.max) : Infinity
           return price >= min && price <= max
         })
       }
       
       return dishes
     },

    statusOptions() {
      return ['全部', '待确认', '已确认', '已完成', '已取消']
    },

    statusIndex() {
      return this.statusOptions.findIndex(item => item === this.recordFilter.status)
    },

    isAllSelected() {
      return (this.deptMembers || []).length > 0 && this.selectedMembers.length === (this.deptMembers || []).length
    },

        can提交() {
      const hasMembers = this.selectedMembers && this.selectedMembers.length > 0
      const hasDate = this.orderForm.date && this.orderForm.date.trim() !== ''
      const hasMealType = this.orderForm.mealType && this.orderForm.mealType.trim() !== ''

      console.log('can提交检查:', {
        hasMembers,
        hasDate,
        hasMealType,
        selectedMembers: this.selectedMembers,
        date: this.orderForm.date,
        mealType: this.orderForm.mealType
      })

      return hasMembers && hasDate && hasMealType
    },

    // 角色筛选选项
    roleFilterOptions() {
      return [
        { label: '全部', value: 'all' },
        { label: '员工', value: '员工' },
        { label: '管理员', value: '部门管理员' },
        { label: '其他', value: 'other' }
      ]
    },

    // 筛选后的成员列表
    filteredMembers() {
      let members = this.deptMembers || []
      
      // 角色筛选
      if (this.currentRoleFilter !== 'all') {
        if (this.currentRoleFilter === 'other') {
          members = members.filter(member => 
            member.role !== '员工' && member.role !== '部门管理员'
          )
        } else {
          members = members.filter(member => member.role === this.currentRoleFilter)
        }
      }
      
      // 搜索筛选
      if (this.memberSearchText.trim()) {
        const searchText = this.memberSearchText.trim().toLowerCase()
        members = members.filter(member => 
          member.name.toLowerCase().includes(searchText) ||
          (member.department && member.department.toLowerCase().includes(searchText))
        )
      }
      
      return members
    },

    // 成员列表高度（动态计算）
    memberListHeight() {
      const memberCount = this.filteredMembers.length
      if (memberCount === 0) return '200rpx'
      if (memberCount <= 3) return '300rpx'
      if (memberCount <= 6) return '400rpx'
      return '500rpx'
    },

    // 已选择的成员详情
    selectedMemberDetails() {
      const members = this.deptMembers || []
      return this.selectedMembers.map(id => 
        members.find(member => member._id === id)
      ).filter(Boolean)
    }
  },

  onLoad(options) {
    // 处理URL参数
    if (options.mealType) {
      this.selectedMeal = options.mealType
      this.orderForm.mealType = this.getMealTypeText(options.mealType)
    }
    
    if (options.date) {
      this.selectedDate = options.date
      this.orderForm.date = options.date
    }
    
    console.log('dining页面加载，参数:', options)
    console.log('设置后的值:', {
      selectedMeal: this.selectedMeal,
      selectedDate: this.selectedDate,
      orderForm: this.orderForm
    })
    
    this.initPage()
  },

  onShow() {
    // 如果当前是菜单标签页且没有菜单数据，则重新加载
    if (this.currentTab === 'menu' && (!this.currentMenu || !this.currentMenu.dishes)) {
      console.log('页面显示时检测到菜单数据为空，重新加载')
      // 确保日期已初始化
      if (!this.selectedDate) {
        this.selectedDate = this.$getCurrentDate()
        console.log('onShow - 初始化日期:', this.selectedDate)
      }
      this.loadMenu()
    }
    
    // 调试：检查当前数据状态
    console.log('onShow - 当前数据状态:', {
      currentTab: this.currentTab,
      currentMenu: this.currentMenu,
      hasDishes: !!this.currentMenu?.dishes,
      dishesLength: this.currentMenu?.dishes?.length || 0,
      selectedDate: this.selectedDate,
      selectedMeal: this.selectedMeal
    })
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

  mounted() {
    // 初始化选中日期为今天
    this.selectedDate = this.$getCurrentDate()
    this.orderForm.date = this.$getCurrentDate()
    console.log('mounted - 初始化日期:', this.selectedDate)
  },

  methods: {
    /**
     * 初始化页面
     */
    async initPage() {
      try {
        this.isLoading = true
        
        // 检查登录状态
        if (!auth.isLoggedIn() && !auth.isGuest()) {
          auth.redirectToLogin()
          return
        }

        // 从API获取最新的用户信息
        await this.loadUserInfo()
        
        // 检查用户权限
        await this.check用户Permission()
        
        // 设置默认日期为今天
        this.selectedDate = this.$getCurrentDate()
        this.orderForm.date = this.$getCurrentDate()
        this.recordFilter.date = this.$getCurrentDate()
        
        console.log('设置默认日期:', this.selectedDate)
        
        // 加载初始数据
        await this.loadInitialData()
        
        // 检查初始化后的数据状态
        console.log('=== 页面初始化完成 ===')
        console.log('当前菜单:', this.currentMenu)
        console.log('菜单ID:', this.currentMenu?._id)
        console.log('菜品数量:', this.currentMenu?.dishes?.length || 0)
        console.log('选中日期:', this.selectedDate)
        console.log('选中餐次:', this.selectedMeal)
        console.log('=====================')
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
     * 加载用户信息
     */
    async loadUserInfo() {
      try {
        const response = await api.user.getInfo()
        if (response.success) {
          this.userInfo = response.data
        } else {
          // 如果API获取失败，回退到本地存储
          this.userInfo = auth.getUserInfo() || {}
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果API获取失败，回退到本地存储
        this.userInfo = auth.getUserInfo() || {}
      }
    },

    /**
     * 检查用户权限
     */
    async check用户Permission() {
      try {
        // 使用已经加载的用户信息
        if (this.userInfo) {
          this.userRole = this.userInfo.role || 'user'
          this.hasDept管理员Permission = ['dept_admin', 'sys_admin'].includes(this.userRole)
        } else {
          // 如果没有用户信息，尝试重新获取
          const result = await api.user.getInfo()
          if (result && result.success && result.data) {
            this.userInfo = result.data
            this.userRole = result.data.role || 'user'
            this.hasDept管理员Permission = ['dept_admin', 'sys_admin'].includes(this.userRole)
          }
        }

        console.log('用户角色:', this.userRole, '部门管理员权限:', this.hasDept管理员Permission)
      } catch (error) {
        console.error('检查用户权限失败:', error)
        this.userRole = 'user'
        this.hasDept管理员Permission = false
      }
    },

    /**
     * 加载初始数据
     */
    async loadInitialData() {
      try {
        // 优先加载菜单数据
        await this.loadMenu()
        
        // 然后并行加载其他数据
        const [members, records] = await Promise.all([
          this.loadDeptMembers(),
          this.loadDiningRecords()
        ])

        this.deptMembers = members
        this.diningRecords = records
        
        console.log('初始数据加载完成，菜单数据:', this.currentMenu)
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
          case 'menu':
            await this.loadMenu()
            break
          case 'order':
            await this.loadDeptMembers()
            break
          case 'record':
            this.page = 1
            this.hasMoreRecords = true
            await this.loadDiningRecords()
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
      this.selectedDate = this.$getPreviousDay(this.selectedDate)
      this.loadMenu()
    },

    nextDate() {
      this.selectedDate = this.$getNextDay(this.selectedDate)
      this.loadMenu()
    },

    /**
     * 选择餐次
     */
    selectMeal(mealType) {
      this.selectedMeal = mealType
      this.loadMenu()
    },

    /**
     * 加载菜单
     */
    async loadMenu() {
      try {
        // 确保selectedDate不为空
        if (!this.selectedDate) {
          console.log('selectedDate为空，设置为今天')
          this.selectedDate = this.$getCurrentDate()
        }
        
        console.log('正在加载菜单，参数:', { date: this.selectedDate, mealType: this.selectedMeal })
        
        // 使用正确的管理员接口获取菜单
        const result = await api.admin.getMenuByDate(this.selectedDate, this.selectedMeal)
        
        console.log('菜单API响应:', result)
        
        if (result && result.success && result.data) {
          this.currentMenu = result.data
          console.log('菜单加载成功:', this.currentMenu)
          
          // 检查菜品数据结构
          if (this.currentMenu.dishes && this.currentMenu.dishes.length > 0) {
            console.log('菜品数据:', this.currentMenu.dishes)
            this.currentMenu.dishes.forEach((dish, index) => {
              console.log(`菜品${index}:`, dish.name || dish.dishName, '分类:', dish.category || dish.categoryName)
            })
          } else {
            console.log('没有菜品数据，尝试单独获取菜品')
            
            // 如果菜品数据为空，尝试单独获取菜品列表
            if (this.currentMenu && this.currentMenu._id) {
              await this.loadMenuDishes(this.currentMenu._id)
            }
          }
          
          // 强制更新界面
          this.$forceUpdate()
          console.log('菜单数据设置完成，当前菜单:', this.currentMenu)
        } else {
          this.currentMenu = null
          console.log('菜单数据为空或请求失败:', result)
        }
      } catch (error) {
        console.error('加载菜单失败:', error)
        this.currentMenu = null
      }
    },

    /**
     * 单独加载菜单菜品数据
     */
    async loadMenuDishes(menuId) {
      try {
        console.log('正在加载菜单菜品数据，菜单ID:', menuId)
        const response = await api.admin.getMenuDishes(menuId)
        console.log('菜品数据API响应:', response)
        
        if (response && response.success && response.data) {
          // 更新菜单的菜品数据
          if (this.currentMenu) {
            this.currentMenu.dishes = response.data
            console.log('菜品数据加载成功，数量:', this.currentMenu.dishes.length)
          }
        } else {
          console.warn('获取菜品数据失败:', response?.message)
        }
      } catch (error) {
        console.error('加载菜品数据失败:', error)
      }
    },

    /**
     * 加载部门成员
     */
    async loadDeptMembers() {
      try {
        const result = await api.dining.getDeptMembers()

        if (result && result.success) {
          this.deptMembers = result.data || []
          this.selectedMembers = []

          console.log('加载部门成员成功:', this.deptMembers.length, '人')

          // 如果没有部门成员，显示提示
          if (this.deptMembers.length === 0) {
            uni.showToast({
              title: '暂无部门成员数据',
              icon: 'none',
              duration: 1500
            })
          }
        } else {
          throw new Error(result?.message || '获取部门成员失败')
        }
      } catch (error) {
        console.error('加载部门成员失败:', error)
        this.deptMembers = []

        let errorMessage = '加载部门成员失败'
        if (error.message) {
          if (error.message.includes('权限')) {
            errorMessage = '权限不足，无法获取部门成员'
          } else if (error.message.includes('网络')) {
            errorMessage = '网络连接失败，请检查网络'
          } else {
            errorMessage = error.message
          }
        }

        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        })
      }
    },

    /**
     * 加载报餐记录
     */
    async loadDiningRecords() {
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize
        }
        
        // 根据查询模式设置参数
        if (this.recordFilter.queryMode === 'single') {
          params.date = this.recordFilter.date
        } else if (this.recordFilter.queryMode === 'range') {
          if (this.recordFilter.startDate) {
            params.startDate = this.recordFilter.startDate
          }
          if (this.recordFilter.endDate) {
            params.endDate = this.recordFilter.endDate
          }
        }
        
        // 状态筛选
        if (this.recordFilter.status && this.recordFilter.status !== '全部') {
          params.status = this.recordFilter.status
        }
        
        console.log('加载报餐记录参数:', params)
        
        const result = await api.dining.getRecords(params)
        
        if (this.page === 1) {
          this.diningRecords = result.data.records || []
        } else {
          this.diningRecords = [...this.diningRecords, ...(result.data.records || [])]
        }
        
        this.hasMoreRecords = result.data.hasMore || false
      } catch (error) {
        console.error('加载报餐记录失败:', error)
        this.diningRecords = []
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
        await this.loadDiningRecords()
      } catch (error) {
        console.error('加载更多记录失败:', error)
        this.page--
      } finally {
        this.isLoadingMore = false
      }
    },

    /**
     * 切换全选
     */
    toggleSelectAll() {
      console.log('切换全选，当前状态:', this.isAllSelected, '部门成员:', this.deptMembers)
      if (this.isAllSelected) {
        this.selectedMembers = []
      } else {
        // 创建新数组确保响应性
        this.selectedMembers = [...(this.deptMembers || []).map(member => member._id)]
      }
      console.log('全选后选中:', this.selectedMembers)
      
      // 强制更新界面
      this.$forceUpdate()
    },

    /**
     * 切换成员选择
     */
    toggleMember(memberId) {
      console.log('切换成员选择:', memberId, '当前选中:', this.selectedMembers)
      const index = this.selectedMembers.indexOf(memberId)
      if (index > -1) {
        // 使用Vue的响应式方法
        this.$set(this.selectedMembers, index, null)
        this.selectedMembers = this.selectedMembers.filter(id => id !== null)
      } else {
        // 创建新数组确保响应性
        this.selectedMembers = [...this.selectedMembers, memberId]
      }
      console.log('切换后选中:', this.selectedMembers)
      
      // 强制更新界面
      this.$forceUpdate()
    },

    /**
     * 检查成员是否被选中
     */
    isMemberSelected(memberId) {
      return this.selectedMembers.includes(memberId)
    },

    /**
     * 获取成员状态
     */
    getMemberStatusText(memberId) {
      // 这里可以根据实际业务逻辑判断成员状态
      return '可报餐'
    },

    getMemberStatusClass(memberId) {
      return 'status-available'
    },

    /**
     * 表单日期变化
     */
    onDateChange(e) {
      this.orderForm.date = e.detail.value
    },

    /**
     * 表单餐次变化
     */
    onMealTypeChange(e) {
      this.orderForm.mealType = this.mealTypeOptions[e.detail.value]
    },

    /**
     * 切换查询模式
     */
    switchQueryMode(mode) {
      this.recordFilter.queryMode = mode
      this.page = 1
      this.hasMoreRecords = true
      
      // 清空日期选择
      if (mode === 'single') {
        this.recordFilter.startDate = ''
        this.recordFilter.endDate = ''
      } else if (mode === 'range') {
        this.recordFilter.date = ''
      }
      
      this.loadDiningRecords()
    },

    /**
     * 记录筛选日期变化
     */
    onRecordDateChange(e) {
      this.recordFilter.date = e.detail.value
      this.page = 1
      this.hasMoreRecords = true
      this.loadDiningRecords()
    },

    /**
     * 开始日期变化
     */
    onStartDateChange(e) {
      this.recordFilter.startDate = e.detail.value
      this.page = 1
      this.hasMoreRecords = true
      this.loadDiningRecords()
    },

    /**
     * 结束日期变化
     */
    onEndDateChange(e) {
      this.recordFilter.endDate = e.detail.value
      this.page = 1
      this.hasMoreRecords = true
      this.loadDiningRecords()
    },

    /**
     * 记录筛选状态变化
     */
    onStatusChange(e) {
      this.recordFilter.status = this.statusOptions[e.detail.value]
      this.page = 1
      this.hasMoreRecords = true
      this.loadDiningRecords()
    },

    /**
     * 重置报餐记录筛选器
     */
    resetRecordFilters() {
      this.recordFilter = {
        date: this.$getCurrentDate(),
        startDate: '',
        endDate: '',
        status: '全部',
        queryMode: 'single'
      }
      this.page = 1
      this.hasMoreRecords = true
      this.loadDiningRecords()
      
      uni.showToast({
        title: '筛选器已重置',
        icon: 'success',
        duration: 1500
      })
    },

    /**
     * 加载个人报餐状态
     */
    async loadPersonalStatus() {
      try {
        // 显示日期选择器
        uni.showActionSheet({
          itemList: ['今天', '昨天', '选择日期'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 今天
              const today = this.$getCurrentDate()
              this.showPersonalStatus(today)
            } else if (res.tapIndex === 1) {
              // 昨天
              const yesterday = this.$getYesterday()
              this.showPersonalStatus(yesterday)
            } else if (res.tapIndex === 2) {
              // 选择日期
              this.showDatePickerForPersonalStatus()
            }
          }
        })
      } catch (error) {
        console.error('加载个人报餐状态失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    /**
     * 显示日期选择器用于个人状态查询
     */
    showDatePickerForPersonalStatus() {
      // 这里可以使用uni-app的日期选择器
      // 由于uni-app的限制，我们使用一个简单的输入框
      uni.showModal({
        title: '选择日期',
        content: '请输入查询日期（格式：YYYY-MM-DD）',
        editable: true,
        placeholderText: '2025-01-15',
        success: (res) => {
          if (res.confirm && res.content) {
            // 简单的日期格式验证
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (dateRegex.test(res.content)) {
              this.showPersonalStatus(res.content)
            } else {
              uni.showToast({
                title: '日期格式不正确',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    /**
     * 显示个人报餐状态
     */
    async showPersonalStatus(date) {
      try {
        uni.showLoading({
          title: '加载中...'
        })

        const result = await api.dining.getPersonalStatus(date)
        
        uni.hideLoading()

        if (result && result.success && result.data) {
          this.displayPersonalStatus(result.data, date)
        } else {
          throw new Error(result?.message || '获取个人报餐状态失败')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('获取个人报餐状态失败:', error)
        
        uni.showModal({
          title: '获取失败',
          content: error.message || '无法获取个人报餐状态，请稍后重试',
          show取消: false
        })
      }
    },

    /**
     * 显示个人报餐状态详情
     */
    displayPersonalStatus(data, date) {
      const { mealStatus, summary } = data
      
      let content = `查询日期: ${date}\n\n`
      
      // 早餐状态
      const breakfast = mealStatus.breakfast
      content += `🌅 早餐: ${breakfast.statusText}\n`
      if (breakfast.isRegistered) {
        content += `   菜单: ${breakfast.menuName}\n`
        content += `   金额: ¥${breakfast.totalAmount}\n`
        content += `   时间: ${this.$formatTime(breakfast.registerTime)}\n`
      }
      content += '\n'
      
      // 午餐状态
      const lunch = mealStatus.lunch
      content += `🌞 午餐: ${lunch.statusText}\n`
      if (lunch.isRegistered) {
        content += `   菜单: ${lunch.menuName}\n`
        content += `   金额: ¥${lunch.totalAmount}\n`
        content += `   时间: ${this.$formatTime(lunch.registerTime)}\n`
      }
      content += '\n'
      
      // 晚餐状态
      const dinner = mealStatus.dinner
      content += `🌙 晚餐: ${dinner.statusText}\n`
      if (dinner.isRegistered) {
        content += `   菜单: ${dinner.menuName}\n`
        content += `   金额: ¥${dinner.totalAmount}\n`
        content += `   时间: ${this.$formatTime(dinner.registerTime)}\n`
      }
      content += '\n'
      
      // 汇总信息
      content += `📊 汇总信息:\n`
      content += `   已报餐: ${summary.totalRegistered}餐\n`
      content += `   总金额: ¥${summary.totalAmount}\n`
      content += `   已确认: ${summary.confirmedCount}餐\n`
      content += `   待确认: ${summary.pendingCount}餐\n`
      content += `   未报餐: ${summary.unregisteredCount}餐`

      uni.showModal({
        title: '个人报餐状态',
        content: content,
        show取消: false,
        confirmText: '确定'
      })
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.orderForm = {
        date: this.$getCurrentDate(),
        mealType: '午餐',
        remark: ''
      }
      this.selectedMembers = []
    },

    /**
     * 提交报餐
     */
    async submitOrder() {
      if (!this.can提交) return

      // 再次检查权限
      if (!this.hasDept管理员Permission) {
        uni.showToast({
          title: '权限不足，无法提交报餐',
          icon: 'none'
        })
        return
      }

      // 数据验证
      if (this.selectedMembers.length === 0) {
        uni.showToast({
          title: '请至少选择一位部门成员',
          icon: 'none'
        })
        return
      }

      if (!this.orderForm.date) {
        uni.showToast({
          title: '请选择用餐日期',
          icon: 'none'
        })
        return
      }

      if (!this.orderForm.mealType) {
        uni.showToast({
          title: '请选择餐次类型',
          icon: 'none'
        })
        return
      }

      // 检查日期是否合理
      const selectedDate = this.orderForm.date
      const today = this.$getCurrentDate()

      if (selectedDate < today) {
        uni.showToast({
          title: '不能为过去的日期报餐',
          icon: 'none'
        })
        return
      }

      try {
        this.is提交ting = true

        const orderData = {
          date: this.orderForm.date,
          mealType: this.getMealTypeValue(this.orderForm.mealType),
          memberIds: this.selectedMembers,
          remark: this.orderForm.remark
        }

        console.log('提交报餐数据:', orderData)

        const result = await api.dining.submitDeptOrder(orderData)

        if (result && result.success) {
          const data = result.data || {}
          const successCount = data.successCount || this.selectedMembers.length
          const totalCount = data.totalCount || this.selectedMembers.length

          uni.showToast({
            title: `报餐提交成功 (${successCount}/${totalCount})`,
            icon: 'success',
            duration: 2000
          })

          // 重置表单
          this.resetForm()

          // 刷新记录
          this.switchTab('record')
        } else {
          throw new Error(result?.message || '提交失败')
        }
      } catch (error) {
        console.error('提交报餐失败:', error)

        let errorMessage = '提交失败，请重试'

        // 处理特定错误类型
        if (error.message) {
          if (error.message.includes('权限')) {
            errorMessage = '权限不足，请联系管理员'
          } else if (error.message.includes('日期')) {
            errorMessage = '日期无效，请重新选择'
          } else if (error.message.includes('成员')) {
            errorMessage = '成员信息有误，请重新选择'
          } else if (error.message.includes('网络') || error.message.includes('timeout')) {
            errorMessage = '网络连接失败，请检查网络'
          } else {
            errorMessage = error.message
          }
        }

        uni.showModal({
          title: '提交失败',
          content: errorMessage,
          show取消: false,
          confirmText: '确定'
        })
      } finally {
        this.is提交ting = false
      }
    },

    /**
     * 查看记录详情
     */
    async viewRecordDetail(record) {
      console.log('查看报餐记录详情:', record)
      
      // 显示加载提示
      uni.showLoading({
        title: '加载详情中...'
      })
      
      try {
        // 调用后端接口获取详细的人员名单
        const result = await api.dining.getRecordDetail(record._id)
        console.log('获取记录详情结果:', result)
        
        uni.hideLoading()
        
        if (result && result.success && result.data) {
          const detailData = result.data
          const memberNames = detailData.memberNames && detailData.memberNames.length > 0 
            ? detailData.memberNames.join('、') 
            : '无成员信息'
          
          const statusText = this.getStatusText(detailData.status || record.status)
          const mealTypeText = this.getMealTypeText(detailData.mealType || record.mealType)
          const createTime = this.$formatTime(detailData.createTime || record.createTime)
          
          // 显示详细信息模态框
          uni.showModal({
            title: '报餐记录详情',
            content: `用餐日期: ${detailData.diningDate || record.diningDate}\n餐次类型: ${mealTypeText}\n用餐人数: ${detailData.memberCount || record.memberCount}人\n用餐成员: ${memberNames}\n订单状态: ${statusText}\n提交时间: ${createTime}\n备注信息: ${detailData.remark || record.remark || '无'}`,
            show取消: false,
            confirmText: '确定'
          })
        } else {
          // 接口调用失败，使用原有数据显示
          console.warn('获取记录详情失败，使用本地数据')
          this.showRecordDetailFallback(record)
        }
      } catch (error) {
        console.error('获取报餐记录详情失败:', error)
        uni.hideLoading()
        
        // 网络错误或其他异常，询问用户是否查看基本信息
        uni.showModal({
          title: '获取详情失败',
          content: '无法获取完整的人员名单信息，是否查看基本记录信息？',
          success: (res) => {
            if (res.confirm) {
              this.showRecordDetailFallback(record)
            }
          }
        })
      }
    },

    /**
     * 显示记录详情的备用方法（当接口调用失败时使用）
     */
    showRecordDetailFallback(record) {
      const memberNames = record.memberNames ? record.memberNames.join('、') : '无成员信息'
      const statusText = this.getStatusText(record.status)
      const mealTypeText = this.getMealTypeText(record.mealType)
      const createTime = this.$formatTime(record.createTime)
      
      uni.showModal({
        title: '报餐记录详情（基本信息）',
        content: `用餐日期: ${record.diningDate}\n餐次类型: ${mealTypeText}\n用餐人数: ${record.memberCount}人\n用餐成员: ${memberNames}\n订单状态: ${statusText}\n提交时间: ${createTime}\n备注信息: ${record.remark || '无'}`,
        show取消: false,
        confirmText: '确定'
      })
    },

    /**
     * 获取餐次类型值
     */
    getMealTypeValue(mealTypeText) {
      const meal = this.mealTypes.find(item => item.label === mealTypeText)
      return meal ? meal.value : 'lunch'
    },

    /**
     * 根据分类获取菜品
     */
    getDishesByCategory(category) {
      console.log('getDishesByCategory调用:', {
        category,
        currentMenu: this.currentMenu,
        hasDishes: !!this.currentMenu?.dishes,
        dishesLength: this.currentMenu?.dishes?.length || 0
      })
      
      if (!this.currentMenu) {
        console.log('currentMenu为空')
        return []
      }
      
      if (!this.currentMenu.dishes) {
        console.log('currentMenu.dishes为空')
        return []
      }
      
      if (!Array.isArray(this.currentMenu.dishes)) {
        console.log('currentMenu.dishes不是数组:', typeof this.currentMenu.dishes)
        return []
      }
      
      // 修复字段匹配：使用正确的字段名
      const dishes = this.currentMenu.dishes.filter(dish => {
        const dishCategory = dish.categoryName || dish.category || '未分类'
        const matches = dishCategory === category
        console.log(`菜品"${dish.dishName || dish.name}"分类"${dishCategory}"匹配"${category}":`, matches)
        return matches
      })
      
      console.log(`分类"${category}"的菜品:`, dishes)
      return dishes
    },

    /**
     * 获取餐次类型文本
     */
    getMealTypeText(mealType) {
      const meal = this.mealTypes.find(item => item.value === mealType)
      return meal ? meal.label : '未知餐次'
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'draft': '草稿',
        'published': '已发布',
        'confirmed': '已确认',
        'completed': '已完成',
        'cancelled': '已取消',
        'pending': '待确认'
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
     * 获取角色文本
     */
    getRoleText(role) {
      const roleMap = {
        'user': '普通用户',
        'dept_admin': '部门管理员',
        'sys_admin': '系统管理员',
        'verifier': '验证员',
        'guest': '游客'
      }
      return roleMap[role] || '未知角色'
    },

    /**
     * 头像加载失败处理
     */
    handleAvatar错误(e) {
      console.log('头像加载失败:', e)
      // 可以设置默认头像
      e.target.src = '/static/logo.png'
    },

    /**
     * 成员搜索
     */
    onMemberSearch() {
      console.log('搜索成员:', this.memberSearchText)
      // 搜索逻辑由 computed 属性 filteredMembers 处理
    },

    /**
     * 设置角色筛选
     */
    setRoleFilter(role) {
      console.log('设置角色筛选:', role)
      this.currentRoleFilter = role
    },

    /**
     * 按角色选择成员
     */
    selectByRole(role) {
      console.log('按角色选择成员:', role)
      const members = this.deptMembers || []
      const roleMembers = members.filter(member => member.role === role)
      const roleIds = roleMembers.map(member => member._id)
      
      // 合并到现有选择中
      const newSelected = [...new Set([...this.selectedMembers, ...roleIds])]
      this.selectedMembers = newSelected
      
      uni.showToast({
        title: `已选择${roleMembers.length}个${role}`,
        icon: 'success'
      })
      
      this.$forceUpdate()
    },

    /**
     * 选择当前显示的所有成员
     */
    selectVisible() {
      console.log('选择当前显示的成员')
      const visibleIds = this.filteredMembers.map(member => member._id)
      const newSelected = [...new Set([...this.selectedMembers, ...visibleIds])]
      this.selectedMembers = newSelected
      
      uni.showToast({
        title: `已选择${visibleIds.length}个成员`,
        icon: 'success'
      })
      
      this.$forceUpdate()
    },

    /**
     * 清空选择
     */
    clearSelection() {
      console.log('清空选择')
      this.selectedMembers = []
      uni.showToast({
        title: '已清空选择',
        icon: 'success'
      })
      this.$forceUpdate()
    },

    /**
     * 加载更多成员
     */
    loadMoreMembers() {
      console.log('加载更多成员')
      // 这里可以实现分页加载逻辑
      // 当前为简单实现，实际可能需要调用API
    },

    /**
     * 切换预览展开状态
     */
    togglePreviewExpanded() {
      this.isPreviewExpanded = !this.isPreviewExpanded
    },

    /**
     * 重置过滤器
     */
    resetFilters() {
      this.dishSearchText = ''
      this.selectedCategoryFilter = 'all'
      this.activeTagFilters = []
      this.priceRange = { min: '', max: '' }
      this.loadMenu() // 重新加载菜单以应用新的过滤条件
    },

    /**
     * 价格过滤输入变化
     */
    onPriceFilterChange() {
      // 这里可以添加价格过滤的逻辑，例如实时更新 filteredDishes
      // 例如：this.loadMenu()
    },

    // debugDataState method removed - debug functionality simplified

    /**
     * 加载菜单
     */

    // 导航到部门报餐页面
    goToDeptOrder() {
      uni.navigateTo({
        url: '/pages/dining/dept-order'
      })
    },

    // 导航到部门报餐概览页面
    goToDeptOverview() {
      uni.navigateTo({
        url: '/pages/dining/dept-overview'
      })
    },

    // 导航到部门报餐统计页面
    goToDeptStats() {
      uni.navigateTo({
        url: '/pages/dining/dept-stats'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dining-container {
  min-height: 100vh;
  background: #f8f9fa;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: 120rpx; /* 为底部导航栏预留空间 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 操作栏 */
.action-bar {
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
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
  padding: 20rpx;
  min-height: calc(100vh - 140rpx);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

/* 报餐记录标签页特殊处理 */
.tab-content.record-tab {
  padding: 0;
  background: #f8f9fa;
  height: calc(100vh - 140rpx);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-content.record-tab .record-page-header {
  margin: 0;
  border-radius: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-content.record-tab .query-card,
.tab-content.record-tab .record-list,
.tab-content.record-tab .empty-state-card {
  margin: 0 20rpx 20rpx;
}

/* 确保记录列表可以normal滚动 */
.record-list {
  padding-bottom: 20rpx;
}

/* 菜单头部 */
.menu-header {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.date-btn {
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20rpx;
}

.date-icon {
  font-size: 24rpx;
  color: #666;
}

.current-date {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.meal-selector {
  display: flex;
  gap: 20rpx;
}

.meal-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.meal-tab.active {
  background: #667eea;
  color: #fff;
}

.meal-text {
  font-size: 26rpx;
  font-weight: 500;
}

/* 菜单内容 */
.menu-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.menu-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.menu-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.menu-time {
  font-size: 24rpx;
  color: #666;
  margin-right: 20rpx;
}

.menu-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.status-published {
  background: #d4edda;
  color: #155724;
}

.status-draft {
  background: #f8d7da;
  color: #721c24;
}

/* 菜品分类 */
.dish-categories {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.category-section {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.category-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.dish-count {
  font-size: 22rpx;
  color: #666;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.dish-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
}

.dish-info {
  margin-bottom: 15rpx;
}

.dish-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.dish-description {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
  margin-bottom: 10rpx;
}

.dish-tags {
  display: flex;
  gap: 10rpx;
}

.tag {
  font-size: 20rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.dish-nutrition {
  display: flex;
  gap: 20rpx;
}

.nutrition-item {
  font-size: 20rpx;
  color: #999;
}

/* 空菜单状态 */
.empty-menu {
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

/* 权限不足提示 */
.permission-denied {
  text-align: center;
  padding: 100rpx 40rpx;
}

/* 部门报餐入口 */
.dept-order-entry {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.entry-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.entry-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.entry-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

.entry-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.entry-btn {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-radius: 16rpx;
  border: none;
  transition: all 0.3s ease;
  text-align: left;
}

.entry-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
}

.entry-btn.secondary {
  background: #f8f9fa;
  color: #333;
  border: 2rpx solid #e9ecef;
}

.entry-btn:active {
  transform: scale(0.98);
}

.entry-btn .btn-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.entry-btn .btn-text {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 5rpx;
}

.entry-btn .btn-desc {
  font-size: 22rpx;
  opacity: 0.8;
  display: block;
}

.permission-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.permission-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
}

.permission-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  margin-bottom: 30rpx;
}

.permission-info {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.info-item {
  font-size: 24rpx;
  color: #333;
}

/* 报餐表单 */
.order-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.order-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.order-subtitle {
  font-size: 24rpx;
  color: #666;
}

.order-form {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 40rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.form-label {
  width: 160rpx;
  font-size: 26rpx;
  color: #333;
}

.form-picker {
  flex: 1;
}

.picker-value {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
}

.form-textarea {
  width: 100%;
  height: 120rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.char-count {
  text-align: right;
  font-size: 22rpx;
  color: #999;
}

/* 部门成员 */
.member-list {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #e9ecef;
}

.select-all {
  display: flex;
  align-items: center;
}

.select-checkbox {
  margin-right: 10rpx;
}

.select-text {
  font-size: 26rpx;
  color: #333;
}

.member-count {
  font-size: 22rpx;
  color: #666;
}

.member-items {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.member-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  transition: all 0.3s ease;
}

.member-item:active {
  transform: scale(0.98);
}

.member-checkbox {
  margin-right: 20rpx;
}

.member-avatar-wrapper {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.member-info {
  flex: 1;
}

.member-name {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 5rpx;
}

.member-role {
  font-size: 22rpx;
  color: #666;
}

.member-status {
  padding: 6rpx 12rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
}

.status-available {
  background: #d4edda;
  color: #155724;
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
  padding-top: 20rpx;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
}

.btn-primary {
  background: #667eea;
  color: #fff;
}

.btn-primary:disabled {
  background: #ccc;
  color: #999;
}

.btn-secondary:active,
.btn-primary:active {
  transform: scale(0.98);
}

/* 报餐记录页面样式 */
.record-page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30rpx 20rpx 40rpx;
  margin: -20rpx -20rpx 20rpx;
  border-radius: 0 0 30rpx 30rpx;
  position: relative;
  overflow: hidden;
}

.record-page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpace开启Use"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.page-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
  position: relative;
  z-index: 1;
}

.page-subtitle {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

/* 查询卡片 */
.query-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;
}

.query-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* 查询模式选择 */
.query-mode-section {
  margin-bottom: 24rpx;
}

.section-label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.mode-selector {
  display: flex;
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 8rpx;
  gap: 8rpx;
}

.mode-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 12rpx;
  border-radius: 12rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mode-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mode-option.active::before {
  opacity: 1;
}

.mode-option.active {
  color: #fff;
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.mode-icon {
  font-size: 28rpx;
  margin-bottom: 6rpx;
  position: relative;
  z-index: 1;
}

.mode-text {
  font-size: 22rpx;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

/* 日期选择区域 */
.date-section {
  margin-bottom: 24rpx;
}

.date-picker-container,
.date-range-container {
  margin-top: 16rpx;
}

.date-picker {
  width: 100%;
}

.date-picker-content {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx;
  transition: all 0.3s ease;
}

.date-picker-content:active {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.1);
}

.date-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: #667eea;
}

.date-info {
  flex: 1;
}

.date-label {
  display: block;
  font-size: 20rpx;
  color: #666;
  margin-bottom: 2rpx;
}

.date-value {
  display: block;
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.date-arrow {
  font-size: 28rpx;
  color: #999;
  font-weight: 300;
}

/* 日期范围分隔符 */
.date-separator {
  display: flex;
  align-items: center;
  margin: 12rpx 0;
  gap: 16rpx;
}

.separator-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #e9ecef 50%, transparent 100%);
}

.separator-text {
  font-size: 24rpx;
  color: #999;
  font-weight: 500;
  padding: 0 20rpx;
}

/* 状态筛选区域 */
.status-section {
  margin-bottom: 24rpx;
}

.status-filter-container {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.status-picker {
  flex: 1;
}

.status-picker-content {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx;
  transition: all 0.3s ease;
}

.status-picker-content:active {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.1);
}

.status-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: #667eea;
}

.status-info {
  flex: 1;
}

.status-label {
  display: block;
  font-size: 20rpx;
  color: #666;
  margin-bottom: 2rpx;
}

.status-value {
  display: block;
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.status-arrow {
  font-size: 28rpx;
  color: #999;
  font-weight: 300;
}

.reset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx 12rpx;
  min-width: 100rpx;
  transition: all 0.3s ease;
}

.reset-btn:active {
  border-color: #667eea;
  background: #f8f9fa;
  transform: scale(0.98);
}

.reset-icon {
  font-size: 24rpx;
  margin-bottom: 6rpx;
  color: #667eea;
}

.reset-text {
  font-size: 20rpx;
  color: #333;
  font-weight: 500;
}

/* 个人状态查询区域 */
.personal-status-section {
  margin-bottom: 20rpx;
}

.personal-status-btn {
  display: flex;
  align-items: center;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.personal-status-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.personal-status-btn:active::before {
  left: 100%;
}

.personal-status-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.btn-icon-container {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.btn-icon {
  font-size: 28rpx;
  color: #fff;
}

.btn-content {
  flex: 1;
}

.btn-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4rpx;
}

.btn-desc {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.btn-arrow {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

/* 查询结果统计 */
.query-stats {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12rpx;
  padding: 16rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.1);
}

.stats-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: #667eea;
}

.stats-content {
  flex: 1;
}

.stats-text {
  display: block;
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 2rpx;
}

.stats-desc {
  display: block;
  font-size: 20rpx;
  color: #666;
}

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.record-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.record-item:active {
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.12);
}

.record-item:active::before {
  opacity: 1;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f8f9fa;
}

.record-date {
  font-size: 26rpx;
  font-weight: 700;
  color: #333;
  position: relative;
}

.record-date::before {
  content: '📅';
  margin-right: 8rpx;
  font-size: 24rpx;
}

.record-status {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}

.status-pending {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  color: #d63031;
}

.status-confirmed {
  background: linear-gradient(135deg, #a8e6cf 0%, #7fcdcd 100%);
  color: #00b894;
}

.status-completed {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: #fff;
}

.status-cancelled {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  color: #fff;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.record-type {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #333;
  font-weight: 500;
}

.record-type::before {
  content: '🍽️';
  margin-right: 6rpx;
  font-size: 20rpx;
}

.record-count {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #667eea;
  font-weight: 700;
  background: rgba(102, 126, 234, 0.1);
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
}

.record-count::before {
  content: '👥';
  margin-right: 6rpx;
  font-size: 20rpx;
}

.record-members {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12rpx;
  padding: 12rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.1);
}

.members-text {
  font-size: 22rpx;
  color: #333;
  line-height: 1.5;
  font-weight: 500;
}

.record-time {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 12rpx;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.1);
}

.time-label {
  font-size: 20rpx;
  color: #666;
  font-weight: 500;
}

.time-value {
  font-size: 20rpx;
  color: #333;
  font-weight: 600;
}

.time-label::before {
  content: '⏰';
  margin-right: 6rpx;
  font-size: 18rpx;
}

/* 空状态卡片 */
.empty-state-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 60rpx 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.empty-state-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.empty-illustration {
  position: relative;
  margin-bottom: 30rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 16rpx;
  opacity: 0.8;
  position: relative;
  z-index: 1;
}

.empty-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
}

.decoration-dot {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #667eea;
  border-radius: 50%;
  opacity: 0.3;
  animation: float 3s ease-in-out infinite;
}

.decoration-dot:nth-child(1) {
  top: -20rpx;
  left: -30rpx;
  animation-delay: 0s;
}

.decoration-dot:nth-child(2) {
  top: 10rpx;
  right: -20rpx;
  animation-delay: 1s;
}

.decoration-dot:nth-child(3) {
  bottom: -10rpx;
  left: 20rpx;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-10rpx); opacity: 0.6; }
}

.empty-content {
  margin-bottom: 40rpx;
}

.empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-desc {
  display: block;
  font-size: 22rpx;
  color: #666;
  line-height: 1.5;
  max-width: 500rpx;
  margin: 0 auto;
}

.empty-actions {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-action-btn,
.secondary-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18rpx 32rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
}

.primary-action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.primary-action-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.secondary-action-btn {
  background: #fff;
  color: #667eea;
  border: 2rpx solid #e9ecef;
}

.secondary-action-btn:active {
  background: #f8f9fa;
  border-color: #667eea;
  transform: translateY(2rpx);
}

.btn-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 40rpx 20rpx;
}

.load-more-btn {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 20rpx 40rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s ease;
}

.load-more-btn:active {
  background: #e9ecef;
  transform: scale(0.98);
}

/* 底部安全区域 */
.bottom-safe-area {
  height: 40rpx;
  background: transparent;
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

/* 搜索和筛选样式 */
.member-filters {
  margin-bottom: 20rpx;
}

.search-box {
  position: relative;
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  padding: 20rpx 60rpx 20rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #fafafa;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #2196f3;
  background: #fff;
}

.search-icon {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: #999;
}

.role-filters {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.role-filter-item {
  padding: 12rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  background: #fff;
  transition: all 0.3s ease;
}

.role-filter-item.active {
  background: #2196f3;
  color: #fff;
  border-color: #2196f3;
}

.role-filter-item:active {
  transform: scale(0.95);
}

/* 快速选择样式 */
.quick-select {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: #f0f7ff;
  border-radius: 8rpx;
  border: 2rpx solid #e3f2fd;
}

.quick-select-label {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.quick-select-actions {
  display: flex;
  gap: 15rpx;
  flex-wrap: wrap;
}

.quick-action {
  padding: 8rpx 16rpx;
  background: #2196f3;
  color: #fff;
  font-size: 22rpx;
  border-radius: 6rpx;
  transition: all 0.3s ease;
}

.quick-action:active {
  background: #1976d2;
  transform: scale(0.95);
}

/* 成员列表容器 */
.member-items-container {
  border: 2rpx solid #f0f0f0;
  border-radius: 8rpx;
  background: #fafafa;
}

.member-items-scroll {
  width: 100%;
}

.member-item.selected {
  background: #e3f2fd !important;
  border-color: #2196f3 !important;
  box-shadow: 0 4rpx 8rpx rgba(33,150,243,0.15);
}

.member-item:active {
  transform: scale(0.98);
}

.member-dept {
  font-size: 22rpx;
  color: #999;
}

/* 加载更多 */
.load-more {
  padding: 30rpx;
  text-align: center;
}

.load-more-text {
  font-size: 26rpx;
  color: #999;
}

/* 无匹配结果 */
.no-members {
  padding: 60rpx 20rpx;
  text-align: center;
}

.no-members-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.no-members-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.no-members-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
}

/* 选中成员预览 */
.selected-members-preview {
  margin-top: 20rpx;
  border: 2rpx solid #e3f2fd;
  border-radius: 8rpx;
  background: #f8fdff;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 2rpx solid #e3f2fd;
}

.preview-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.preview-toggle {
  font-size: 24rpx;
  color: #2196f3;
  padding: 8rpx 16rpx;
  border: 2rpx solid #2196f3;
  border-radius: 6rpx;
  transition: all 0.3s ease;
}

.preview-toggle:active {
  background: #2196f3;
  color: #fff;
}

.preview-content {
  padding: 20rpx;
}

.selected-member-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.selected-member-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 12rpx;
  background: #2196f3;
  color: #fff;
  border-radius: 20rpx;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.selected-member-tag:active {
  background: #1976d2;
  transform: scale(0.95);
}

.tag-name {
  font-size: 22rpx;
}

.tag-close {
  font-size: 28rpx;
  font-weight: bold;
  margin-left: 4rpx;
}

/* 价格过滤 */
.price-filter {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
}

.price-label {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.price-input {
  flex: 1;
  padding: 10rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;
  background: #fff;
}

.price-separator {
  font-size: 26rpx;
  color: #666;
}

/* 重置按钮 */
.reset-filters {
  margin-top: 20rpx;
  padding: 15rpx 30rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
  text-align: center;
  transition: all 0.3s ease;
}

.reset-filters:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.reset-text {
  font-size: 26rpx;
  font-weight: 500;
}

/* 过滤工具栏 */
.filter-toolbar {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 2rpx solid #e9ecef;
}

/* 搜索容器 */
.search-container {
  position: relative;
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  padding: 20rpx 60rpx 20rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 26rpx;
  background: #fff;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #667eea;
  outline: none;
}

.search-icon {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  color: #999;
}

/* 分类过滤 */
.category-filters {
  display: flex;
  gap: 15rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.category-filter-item {
  padding: 12rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  background: #fff;
  transition: all 0.3s ease;
}

.category-filter-item.active {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}

.category-filter-item:active {
  transform: scale(0.95);
}

/* 标签过滤 */
.tag-filters {
  display: flex;
  gap: 15rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.tag-filter-item {
  padding: 10rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #666;
  background: #fff;
  transition: all 0.3s ease;
}

.tag-filter-item.active {
  background: #28a745;
  color: #fff;
  border-color: #28a745;
}

.tag-filter-item:active {
  transform: scale(0.95);
}

/* Debug button styles removed - functionality simplified */
</style>
