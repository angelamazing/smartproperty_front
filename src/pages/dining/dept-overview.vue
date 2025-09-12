<template>
  <view class="dept-overview-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">部门报餐概览</text>
      <text class="page-subtitle">{{ overviewData.departmentName || '加载中...' }}</text>
      <text class="page-date">{{ overviewData.date || '今日' }}</text>
      
      <!-- 数据状态指示器 -->
      <view class="data-status-indicator" :class="{ 'inconsistent': hasDataInconsistency }">
        <text class="status-icon">{{ hasDataInconsistency ? '⚠️' : '✅' }}</text>
        <text class="status-text">{{ hasDataInconsistency ? '数据不一致' : '数据正常' }}</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-label">部门总人数</text>
        <text class="stat-number">{{ overviewData.totalMembers || 0 }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">今日报餐</text>
        <text class="stat-number">{{ overviewData.todayStats?.totalOrders || 0 }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">报餐人数</text>
        <text class="stat-number">{{ overviewData.todayStats?.uniqueUsers || 0 }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">参与率</text>
        <text class="stat-number">{{ overviewData.todayStats?.participationRate || 0 }}%</text>
      </view>
    </view>

    <!-- 餐次统计 -->
    <view class="meal-stats-section">
      <text class="section-title">今日餐次统计</text>
      <view class="meal-stats">
        <view class="meal-stat-item">
          <text class="meal-label">早餐</text>
          <text class="meal-count">{{ overviewData.todayStats?.mealTypeStats?.breakfast || 0 }}</text>
        </view>
        <view class="meal-stat-item">
          <text class="meal-label">午餐</text>
          <text class="meal-count">{{ overviewData.todayStats?.mealTypeStats?.lunch || 0 }}</text>
        </view>
        <view class="meal-stat-item">
          <text class="meal-label">晚餐</text>
          <text class="meal-count">{{ overviewData.todayStats?.mealTypeStats?.dinner || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 成员状态列表 -->
    <view class="members-section">
      <view class="section-header">
        <text class="section-title">成员报餐状态</text>
        <button class="refresh-btn" @click="loadOverviewData">
          <text class="btn-icon">🔄</text>
          <text>刷新</text>
        </button>
      </view>
      
      <!-- 搜索框 -->
      <view class="search-container">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            type="text" 
            placeholder="搜索成员姓名或部门..."
            v-model="searchKeyword"
            @input="handleSearch"
          />
          <button v-if="searchKeyword" class="clear-search-btn" @click="clearSearch">
            <text class="clear-icon">✕</text>
          </button>
        </view>
      </view>
      
      <!-- 搜索结果提示 -->
      <view v-if="searchKeyword && filteredMembers.length === 0" class="no-results">
        <text class="no-results-icon">🔍</text>
        <text class="no-results-text">未找到匹配的成员</text>
        <text class="no-results-hint">请尝试其他关键词</text>
      </view>

      <view class="members-list">
        <view 
          v-for="member in filteredMembers" 
          :key="member._id"
          class="member-item"
          :class="{ 'has-ordered': member.hasOrdered }"
        >
          <view class="member-avatar">
            <UserAvatar :user="member" size="small" />
          </view>
          
          <view class="member-info">
            <text class="member-name">{{ member.name || member.nickName }}</text>
            <text class="member-role">{{ member.role || '普通用户' }}</text>
            <text v-if="member.departmentName" class="member-department">{{ member.departmentName }}</text>
          </view>
          
          <view class="member-status">
            <view v-if="isMemberOrdered(member)" class="status-badge ordered">
              <text class="status-text">已报餐</text>
              <text class="meal-type">{{ getMealTypesDisplay(member.orderInfo) }}</text>
            </view>
            <view v-else class="status-badge not-ordered">
              <text class="status-text">未报餐</text>
            </view>
          </view>
        </view>
      </view>
    </view>


    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="action-btn primary" @click="goToOrder">
        <text class="btn-icon">🍽️</text>
        <text>去报餐</text>
      </button>
      <button class="action-btn secondary" @click="goToStats">
        <text class="btn-icon">📈</text>
        <text>查看统计</text>
      </button>
      <button class="action-btn test" @click="loadMockData">
        <text class="btn-icon">🧪</text>
        <text>加载测试数据</text>
      </button>
      <button class="action-btn fix" @click="fixDataInconsistency" v-if="hasDataInconsistency">
        <text class="btn-icon">🔧</text>
        <text>修复数据</text>
      </button>
      <button class="action-btn toggle" @click="toggleMealDisplay">
        <text class="btn-icon">{{ useSimplifiedMealDisplay ? '📝' : '🔤' }}</text>
        <text>{{ useSimplifiedMealDisplay ? '完整显示' : '简化显示' }}</text>
      </button>
    </view>

    <!-- 加载提示 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
  import UserAvatar from '@/components/UserAvatar.vue'
import api from '@/utils/api.js'

export default {
  name: 'DeptOverview',
  components: {
    UserAvatar
  },
  data() {
    return {
      overviewData: {},
      loading: false,
      hasDataInconsistency: false,
      useSimplifiedMealDisplay: true, // 是否使用简化餐次显示
      searchKeyword: '', // 搜索关键词
      filteredMembers: [] // 过滤后的成员列表
    }
  },
  mounted() {
    this.loadOverviewData()
  },
  methods: {
    // 加载概览数据
    async loadOverviewData() {
      try {
        this.loading = true
        const response = await api.admin.getDepartmentOverview()
        
        if (response.success) {
          // 处理不同的数据结构
          this.overviewData = this.processOverviewData(response.data)
          
          // Debug logging removed - functionality simplified
          
          // 初始化过滤后的成员列表
          this.filteredMembers = this.overviewData.members || []
          
          // 检查数据一致性
          this.checkDataConsistency()
        } else {
          console.error('获取概览数据失败:', response.message)
          uni.showToast({
            title: '获取数据失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('获取概览数据失败:', error)
        
        let errorMessage = '获取概览数据失败'
        
        // 处理特定错误类型
        if (error.message) {
          if (error.message.includes('权限') || error.message.includes('权限不足')) {
            errorMessage = '权限不足，需要部门管理员及以上权限'
          } else if (error.message.includes('网络') || error.message.includes('timeout')) {
            errorMessage = '网络连接失败，请检查网络设置'
          } else if (error.message.includes('日期')) {
            errorMessage = '日期无效，请重新选择'
          } else {
            errorMessage = error.message
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    // 处理概览数据，兼容不同的数据结构
    processOverviewData(data) {
      // 如果是系统管理员查看所有部门的数据
      if (data.viewType === 'all_departments' && data.departments) {
        // 使用总统计数据
        return {
          date: data.date,
          departmentName: '全部门概览',
          totalMembers: data.totalStats.totalMembers,
          todayStats: {
            totalOrders: data.totalStats.totalOrders,
            uniqueUsers: data.totalStats.uniqueUsers,
            participationRate: data.totalStats.participationRate,
            mealTypeStats: data.totalStats.mealTypeStats
          },
          members: this.getAllDepartmentMembers(data.departments)
        }
      }
      
      // 如果是部门管理员查看单个部门的数据，直接返回
      return data
    },

    // 获取所有部门的成员数据
    getAllDepartmentMembers(departments) {
      const allMembers = []
      
      departments.forEach(dept => {
        if (dept.members && dept.members.length > 0) {
          dept.members.forEach(member => {
            // 为每个成员添加部门信息
            allMembers.push({
              ...member,
              departmentName: dept.departmentName,
              departmentCode: dept.departmentCode
            })
          })
        }
      })
      
      return allMembers
    },



    // 检查数据一致性
    checkDataConsistency() {
      const { todayStats, members } = this.overviewData
      
      if (!todayStats || !members) {
        console.warn('数据不完整，无法进行一致性检查')
        return
      }
      
      // 统计已报餐的成员数量 - 兼容不同的数据结构
      const orderedMembers = members.filter(member => {
        // 优先检查 hasOrdered 字段
        if (member.hasOrdered !== undefined) {
          return member.hasOrdered
        }
        
        // 检查 orderInfo 数组
        if (member.orderInfo && Array.isArray(member.orderInfo) && member.orderInfo.length > 0) {
          return true
        }
        
        // 检查单个 orderInfo 对象
        if (member.orderInfo && typeof member.orderInfo === 'object' && member.orderInfo.mealType) {
          return true
        }
        
        // 检查 mealTypes 数组
        if (member.mealTypes && Array.isArray(member.mealTypes) && member.mealTypes.length > 0) {
          return true
        }
        
        return false
      })
      
      const orderedCount = orderedMembers.length
      
      console.log('数据一致性检查:')
      console.log('- 统计显示报餐人数:', todayStats.uniqueUsers)
      console.log('- 实际已报餐成员数:', orderedCount)
      console.log('- 统计显示参与率:', todayStats.participationRate + '%')
      console.log('- 计算参与率:', Math.round((orderedCount / members.length) * 100) + '%')
      console.log('- 已报餐成员:', orderedMembers.map(m => m.name || m.nickName))
      console.log('- 成员数据结构示例:', members[0])
      
      // 检查数据一致性
      const isConsistent = todayStats.uniqueUsers === orderedCount
      this.hasDataInconsistency = !isConsistent
      
      if (!isConsistent) {
        console.warn('数据不一致：统计报餐人数与实际已报餐成员数不匹配')
        
        // 显示详细的数据不一致信息
        const message = `数据不一致：统计显示${todayStats.uniqueUsers}人报餐，实际${orderedCount}人报餐`
        uni.showModal({
          title: '数据不一致警告',
          content: message + '\n\n可能原因：\n1. 统计数据与成员列表不同步\n2. 缓存问题\n3. 成员列表不完整\n\n建议：\n1. 点击刷新按钮重新加载数据\n2. 检查网络连接\n3. 联系管理员',
          confirmText: '刷新数据',
          cancelText: '忽略',
          success: (res) => {
            if (res.confirm) {
              this.loadOverviewData()
            }
          }
        })
      } else {
        this.hasDataInconsistency = false
      }
    },

    // 获取餐次类型标签
    getMealTypeLabel(mealType) {
      const labels = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐'
      }
      return labels[mealType] || '未知'
    },

    // 获取多个餐次类型的显示文本
    getMealTypesDisplay(orderInfo) {
      if (!orderInfo) return '未知'
      
      // 新版本：orderInfo 是报餐记录数组
      if (Array.isArray(orderInfo)) {
        // 提取所有餐次类型并去重
        const mealTypes = [...new Set(orderInfo.map(item => item.mealType || item))]
        
        // 如果只有一个餐次，直接返回
        if (mealTypes.length === 1) {
          return this.getMealTypeLabel(mealTypes[0])
        }
        
        // 多个餐次时，根据设置选择显示方式
        if (this.useSimplifiedMealDisplay) {
          return this.getSimplifiedMealTypes(mealTypes)
        } else {
          const mealLabels = mealTypes.map(mealType => this.getMealTypeLabel(mealType))
          return mealLabels.join('、')
        }
      }
      
      // 兼容版本：如果 orderInfo 有 mealTypes 数组
      if (orderInfo.mealTypes && Array.isArray(orderInfo.mealTypes)) {
        const mealTypes = [...new Set(orderInfo.mealTypes)]
        if (mealTypes.length === 1) {
          return this.getMealTypeLabel(mealTypes[0])
        }
        if (this.useSimplifiedMealDisplay) {
          return this.getSimplifiedMealTypes(mealTypes)
        } else {
          const mealLabels = mealTypes.map(mealType => this.getMealTypeLabel(mealType))
          return mealLabels.join('、')
        }
      }
      
      // 兼容版本：如果 orderInfo 有单个 mealType
      if (orderInfo.mealType) {
        return this.getMealTypeLabel(orderInfo.mealType)
      }
      
      // 兼容版本：如果 orderInfo 本身就是餐次类型字符串
      if (typeof orderInfo === 'string') {
        return this.getMealTypeLabel(orderInfo)
      }
      
      return '未知'
    },

    // 获取简化的餐次显示（如：中晚、早中晚）
    getSimplifiedMealTypes(mealTypes) {
      // 按餐次顺序排序：早餐、午餐、晚餐
      const mealOrder = ['breakfast', 'lunch', 'dinner']
      const sortedMealTypes = mealTypes.sort((a, b) => {
        return mealOrder.indexOf(a) - mealOrder.indexOf(b)
      })
      
      // 生成简化显示
      const simplifiedLabels = sortedMealTypes.map(mealType => {
        const labels = {
          'breakfast': '早',
          'lunch': '中',
          'dinner': '晚'
        }
        return labels[mealType] || mealType
      })
      
      return simplifiedLabels.join('')
    },

    // 跳转到报餐页面
    goToOrder() {
      uni.navigateTo({
        url: '/pages/dining/dept-order'
      })
    },

    // 跳转到统计页面
    goToStats() {
      uni.navigateTo({
        url: '/pages/dining/dept-stats'
      })
    },

    // toggleDebug信息 method removed - debug functionality simplified

    // Debug methods removed - functionality simplified

    // 加载模拟测试数据
    loadMockData() {
      // 模拟系统管理员查看所有部门的数据
      const mockSystemAdminData = {
        date: '2025-09-03',
        viewType: 'all_departments',
        totalStats: {
          totalOrders: 5,
          uniqueUsers: 6,
          totalMembers: 56,
          mealTypeStats: {
            breakfast: 5,
            lunch: 4,
            dinner: 2
          },
          participationRate: 11 // 6/56 = 11%
        },
        departments: [
          {
            departmentName: '地质数据中心',
            departmentCode: 'GEO_DATA',
            totalMembers: 6,
            todayStats: {
              totalOrders: 5,
              uniqueUsers: 6,
              participationRate: 100,
              mealTypeStats: {
                breakfast: 5,
                lunch: 4,
                dinner: 2
              }
            },
            members: [
              {
                _id: '1',
                name: '地质数据中心管理员',
                nickName: '地质数据中心管理员',
                role: '部门管理员',
                hasOrdered: true,
                orderInfo: [
                  { mealType: 'lunch', orderTime: '2025-09-02T12:00:00.000Z', status: 'confirmed' },
                  { mealType: 'dinner', orderTime: '2025-09-02T18:00:00.000Z', status: 'confirmed' }
                ]
              },
              {
                _id: '2',
                name: '张数据员',
                nickName: '张数据员',
                role: '普通用户',
                hasOrdered: true,
                orderInfo: [
                  { mealType: 'breakfast', orderTime: '2025-09-02T08:00:00.000Z', status: 'confirmed' },
                  { mealType: 'lunch', orderTime: '2025-09-02T12:00:00.000Z', status: 'confirmed' },
                  { mealType: 'dinner', orderTime: '2025-09-02T18:00:00.000Z', status: 'confirmed' }
                ]
              },
              {
                _id: '3',
                name: '李数据员',
                nickName: '李数据员',
                role: '普通用户',
                hasOrdered: true,
                orderInfo: [
                  { mealType: 'breakfast', orderTime: '2025-09-02T08:00:00.000Z', status: 'confirmed' },
                  { mealType: 'lunch', orderTime: '2025-09-02T12:00:00.000Z', status: 'confirmed' }
                ]
              },
              {
                _id: '4',
                name: '王数据员',
                nickName: '王数据员',
                role: '普通用户',
                hasOrdered: true,
                orderInfo: [
                  { mealType: 'breakfast', orderTime: '2025-09-02T08:00:00.000Z', status: 'confirmed' }
                ]
              },
              {
                _id: '5',
                name: '赵数据员',
                nickName: '赵数据员',
                role: '普通用户',
                hasOrdered: true,
                orderInfo: [
                  { mealType: 'breakfast', orderTime: '2025-09-02T08:00:00.000Z', status: 'confirmed' }
                ]
              },
              {
                _id: '6',
                name: '陈数据员',
                nickName: '陈数据员',
                role: '普通用户',
                hasOrdered: true,
                orderInfo: [
                  { mealType: 'breakfast', orderTime: '2025-09-02T08:00:00.000Z', status: 'confirmed' }
                ]
              }
            ]
          },
          {
            departmentName: '地质工程中心',
            departmentCode: 'GEO_ENG',
            totalMembers: 6,
            todayStats: {
              totalOrders: 0,
              uniqueUsers: 0,
              participationRate: 0,
              mealTypeStats: { breakfast: null, lunch: null, dinner: null }
            },
            members: [
              {
                _id: '7',
                name: '地质工程中心管理员',
                nickName: '地质工程中心管理员',
                role: '部门管理员',
                hasOrdered: false,
                orderInfo: null
              },
              {
                _id: '8',
                name: '张工程师',
                nickName: '张工程师',
                role: '普通用户',
                hasOrdered: false,
                orderInfo: null
              }
            ]
          }
        ]
      }
      
            // 处理数据
      this.overviewData = this.processOverviewData(mockSystemAdminData)
      
      // 检查数据一致性
      this.checkDataConsistency()
      
      uni.showToast({
        title: '测试数据已加载',
        icon: 'success'
      })
    },

    // 修复数据不一致
    fixDataInconsistency() {
      uni.showModal({
        title: '修复数据不一致',
        content: '将根据实际成员状态修正统计数据，确保数据一致性。是否继续？',
        confirmText: '修复',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.performDataFix()
          }
        }
      })
    },

    // 执行数据修复
    performDataFix() {
      const { todayStats, members } = this.overviewData
      
      if (!todayStats || !members) {
        uni.showToast({
          title: '数据不完整，无法修复',
          icon: 'error'
        })
        return
      }
      
      // 计算实际的统计数据
      const actualOrderedCount = this.getOrderedMembersCount()
      const actualParticipationRate = this.getCalculatedParticipationRate()
      
      // 修复统计数据
      this.overviewData.todayStats = {
        ...todayStats,
        uniqueUsers: actualOrderedCount,
        participationRate: actualParticipationRate
      }
      
      // 标记数据已修复
      this.hasDataInconsistency = false
      
      uni.showToast({
        title: '数据已修复',
        icon: 'success'
      })
      
      console.log('数据修复完成:', {
        修复前: {
          报餐人数: todayStats.uniqueUsers,
          参与率: todayStats.participationRate
        },
        修复后: {
          报餐人数: actualOrderedCount,
          参与率: actualParticipationRate
        }
             })
     },

     // 切换餐次显示模式
     toggleMealDisplay() {
       this.useSimplifiedMealDisplay = !this.useSimplifiedMealDisplay
       uni.showToast({
         title: this.useSimplifiedMealDisplay ? '已切换到简化显示' : '已切换到完整显示',
         icon: 'success',
         duration: 1500
       })
     },

     // 处理搜索
     handleSearch() {
       this.filterMembers()
     },

     // 过滤成员
     filterMembers() {
       if (!this.searchKeyword.trim()) {
         this.filteredMembers = this.overviewData.members || []
         return
       }

       const keyword = this.searchKeyword.toLowerCase().trim()
       this.filteredMembers = (this.overviewData.members || []).filter(member => {
         const name = (member.name || member.nickName || '').toLowerCase()
         const department = (member.departmentName || '').toLowerCase()
         const role = (member.role || '').toLowerCase()
         
         return name.includes(keyword) || 
                department.includes(keyword) || 
                role.includes(keyword)
       })
     },

     // 清除搜索
     clearSearch() {
       this.searchKeyword = ''
       this.filteredMembers = this.overviewData.members || []
     },

     // 判断成员是否已报餐
     isMemberOrdered(member) {
       // 优先检查 hasOrdered 字段
       if (member.hasOrdered !== undefined) {
         return member.hasOrdered
       }
       
       // 检查 orderInfo 数组
       if (member.orderInfo && Array.isArray(member.orderInfo) && member.orderInfo.length > 0) {
         return true
       }
       
       // 检查单个 orderInfo 对象
       if (member.orderInfo && typeof member.orderInfo === 'object' && member.orderInfo.mealType) {
         return true
       }
       
       // 检查 mealTypes 数组
       if (member.mealTypes && Array.isArray(member.mealTypes) && member.mealTypes.length > 0) {
         return true
       }
       
       return false
     },

     // Debug methods removed - functionality simplified
   }
 }
</script>

<style lang="scss" scoped>
.dept-overview-container {
  padding: 20rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 25rpx;
  text-align: center;
  background: white;
  border-radius: 16rpx;
  padding: 20rpx 15rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2c3e50;
  display: block;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
}

.page-subtitle {
  font-size: 24rpx;
  color: #3498db;
  font-weight: 600;
  display: block;
  margin-bottom: 6rpx;
}

.page-date {
  font-size: 20rpx;
  color: #7f8c8d;
  display: block;
  margin-bottom: 15rpx;
}

/* 数据状态指示器 */
.data-status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 18rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border: 2rpx solid #4caf50;
  margin-top: 10rpx;
  box-shadow: 0 3rpx 10rpx rgba(76, 175, 80, 0.2);
}

.data-status-indicator.inconsistent {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: #f44336;
  box-shadow: 0 3rpx 10rpx rgba(244, 67, 54, 0.2);
}

.status-icon {
  font-size: 22rpx;
}

.status-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #2e7d32;
}

.data-status-indicator.inconsistent .status-text {
  color: #c62828;
}

.stats-cards {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 12rpx;
  margin-bottom: 25rpx;
  width: 100%;
}

.stat-card {
  background: white;
  border-radius: 16rpx;
  padding: 12rpx 8rpx;
  text-align: center;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 90rpx;
  width: 100%;
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
}

.stat-label {
  font-size: 18rpx;
  color: #7f8c8d;
  display: block;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 6rpx;
}

.stat-number {
  font-size: 28rpx;
  font-weight: 700;
  color: #2980b9;
  display: block;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  line-height: 1.2;
}

.meal-stats-section {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.section-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15rpx;
  display: block;
  text-align: center;
  letter-spacing: 1rpx;
}

.meal-stats {
  display: flex;
  justify-content: space-around;
  gap: 8rpx;
}

.meal-stat-item {
  text-align: center;
  flex: 1;
  padding: 12rpx 8rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: all 0.3s ease;
}

.meal-stat-item:hover {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  transform: scale(1.03);
}

.meal-label {
  font-size: 20rpx;
  color: #6c757d;
  display: block;
  margin-bottom: 6rpx;
  font-weight: 500;
}

.meal-count {
  font-size: 28rpx;
  font-weight: 700;
  color: #1976d2;
  display: block;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.members-section {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

/* 搜索框样式 */
.search-container {
  margin-bottom: 15rpx;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: #3498db;
  background: white;
  box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.2);
}

.search-icon {
  font-size: 24rpx;
  color: #7f8c8d;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 24rpx;
  color: #333;
  outline: none;
}

.search-input::placeholder {
  color: #adb5bd;
}

.clear-search-btn {
  position: absolute;
  right: 12rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #dee2e6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-search-btn:active {
  background: #adb5bd;
  transform: translateY(-50%) scale(0.9);
}

.clear-icon {
  font-size: 18rpx;
  color: #6c757d;
  font-weight: bold;
}

/* 无搜索结果样式 */
.no-results {
  text-align: center;
  padding: 40rpx 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  margin-bottom: 15rpx;
}

.no-results-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 12rpx;
  opacity: 0.6;
}

.no-results-text {
  font-size: 28rpx;
  color: #6c757d;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.no-results-hint {
  font-size: 24rpx;
  color: #adb5bd;
  display: block;
}

.refresh-btn {
  padding: 10rpx 16rpx;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 20rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6rpx;
  transition: all 0.3s ease;
  box-shadow: 0 3rpx 10rpx rgba(52, 152, 219, 0.3);
}

.refresh-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 6rpx rgba(52, 152, 219, 0.4);
}

.btn-icon {
  font-size: 20rpx;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12rpx;
  transition: all 0.3s ease;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.member-item:hover {
  transform: translateX(2rpx);
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.1);
}

.member-item.has-ordered {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border: 2rpx solid #4caf50;
  box-shadow: 0 3rpx 12rpx rgba(76, 175, 80, 0.2);
}

.member-avatar {
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.member-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.2;
}

.member-role {
  font-size: 20rpx;
  color: #7f8c8d;
  font-weight: 500;
  line-height: 1.2;
}

.member-department {
  font-size: 18rpx;
  color: #3498db;
  font-weight: 500;
  line-height: 1.2;
  margin-top: 2rpx;
}



.member-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 8rpx 14rpx;
  border-radius: 20rpx;
  text-align: center;
  min-width: 100rpx;
  max-width: 180rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.status-badge.ordered {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
}

.status-badge.not-ordered {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
}

.status-text {
  font-size: 18rpx;
  font-weight: 600;
  display: block;
  line-height: 1.2;
}

.meal-type {
  font-size: 16rpx;
  opacity: 0.9;
  display: block;
  margin-top: 1rpx;
  font-weight: 500;
  line-height: 1.2;
  word-break: keep-all;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 8rpx;
  margin-bottom: 25rpx;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.action-btn {
  flex: 0 0 auto;
  min-width: 100rpx;
  padding: 12rpx 10rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
  box-shadow: 0 3rpx 12rpx rgba(102, 126, 234, 0.2);
}

/* Debug button styles removed - functionality simplified */

.action-btn.test {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: white;
  box-shadow: 0 3rpx 12rpx rgba(156, 39, 176, 0.3);
}

.action-btn.fix {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 3rpx 12rpx rgba(244, 67, 54, 0.3);
}

.action-btn.toggle {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  box-shadow: 0 3rpx 12rpx rgba(23, 162, 184, 0.3);
}

.action-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: #333;
}

/* Debug panel styles removed - functionality simplified */

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 8rpx;
  }
  
  .action-buttons {
    flex-direction: row;
    gap: 6rpx;
    overflow-x: auto;
    padding-bottom: 4rpx;
  }
  
  .action-btn {
    min-width: 90rpx;
    padding: 10rpx 8rpx;
    font-size: 18rpx;
    flex-shrink: 0;
  }
  
  .meal-stats {
    flex-direction: row;
    gap: 6rpx;
  }
  
  .meal-stat-item {
    padding: 10rpx 6rpx;
  }
  
  .member-item {
    padding: 12rpx;
    gap: 10rpx;
  }
  
  .member-name {
    font-size: 22rpx;
  }
  
  .member-role {
    font-size: 18rpx;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 6rpx;
  }
  
  .action-buttons {
    flex-direction: row;
    gap: 4rpx;
    overflow-x: auto;
  }
  
  .action-btn {
    min-width: 80rpx;
    padding: 8rpx 6rpx;
    font-size: 16rpx;
    flex-shrink: 0;
  }
}
</style>
