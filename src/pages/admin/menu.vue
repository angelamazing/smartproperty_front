<template>
  <view class="menu-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">菜单管理</view>
      <view class="header-subtitle">管理每日菜单，包括创建、发布、撤回等操作</view>
    </view>

    <!-- 操作工具栏 -->
    <view class="toolbar">
      <view class="toolbar-left">
        <button class="action-btn primary" @click="createMenu">
          <text class="btn-icon">+</text>
          <text>创建菜单</text>
        </button>
        <button class="action-btn secondary" @click="showTemplateModal">
          <text class="btn-icon">📋</text>
          <text>菜单模板</text>
        </button>
      </view>
      
      <view class="toolbar-right">
        <picker 
          class="date-picker" 
          mode="date" 
          :value="selectedDate" 
          @change="onDateChange"
        >
          <view class="picker-text">
            {{ formatDate(selectedDate) }}
          </view>
        </picker>
        
        <picker 
          class="meal-picker" 
          :value="selectedMealIndex" 
          :range="mealOptions" 
          range-key="name"
          @change="onMealChange"
        >
          <view class="picker-text">
            {{ mealOptions[selectedMealIndex].name }}
          </view>
        </picker>
      </view>
    </view>

    <!-- 今日菜单状态 -->
    <view class="today-menu-section">
      <view class="section-header">
        <text class="section-title">今日菜单</text>
        <text class="section-subtitle">{{ formatDate(selectedDate) }} {{ mealOptions[selectedMealIndex].name }}</text>
      </view>
      
      <view v-if="todayMenu" class="menu-status-card">
        <view class="status-info">
          <view class="status-badge" :class="getStatusClass(todayMenu.status)">
            {{ getStatusText(todayMenu.status) }}
          </view>
          <text class="menu-description">{{ todayMenu.description || '暂无描述' }}</text>
          <text class="dish-count">{{ todayMenu.dishes?.length || 0 }} 道菜品</text>
        </view>
        
        <view class="status-actions">
          <button 
            v-if="todayMenu.status === 'draft'" 
            class="action-btn primary" 
            @click="publishMenu(todayMenu)"
          >
            发布菜单
          </button>
          <button 
            v-if="todayMenu.status === 'published'" 
            class="action-btn danger" 
            @click="revokeMenu(todayMenu._id)"
          >
            撤回菜单
          </button>
          <button class="action-btn secondary" @click="editMenu(todayMenu)">
            编辑菜单
          </button>
        </view>
      </view>
      
      <view v-else class="no-menu-state">
        <text class="no-menu-icon">🍽️</text>
        <text class="no-menu-text">今日暂无菜单</text>
        <text class="no-menu-hint">点击"创建菜单"开始制作</text>
        <button class="create-menu-btn" @click="createMenu">
          创建菜单
        </button>
      </view>
    </view>

    <!-- 菜单历史 -->
    <view class="menu-history-section">
      <view class="section-header">
        <text class="section-title">菜单历史</text>
        <button class="view-all-btn" @click="viewAllHistory">查看全部</button>
      </view>
      
      <view v-if="menuHistory.length === 0" class="empty-history">
        <text class="empty-text">暂无菜单历史</text>
      </view>
      
      <view v-else class="history-list">
        <view 
          v-for="menu in menuHistory" 
          :key="menu._id" 
          class="history-item"
          @click="viewMenuDetail(menu)"
        >
          <view class="history-info">
            <view class="history-date-section">
              <text class="history-date">{{ formatDate(menu.publishDate) }}</text>
              <text class="history-meal">{{ getMealTypeText(menu.mealType) }}</text>
            </view>
            <text class="history-status" :class="getStatusClass(menu.publishStatus)">
              {{ getStatusText(menu.publishStatus) }}
            </text>
          </view>
          
          <view class="history-meta">
            <text class="dish-count">{{ menu.dishCount || 0 }} 道菜品</text>
            <text class="publish-time">{{ $formatTime(menu.createTime) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建/编辑菜单弹窗 -->
    <view v-if="showMenuModal" class="modal-overlay" @click="closeMenuModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ is编辑 ? '编辑菜单' : '创建菜单' }}</text>
          <button class="close-btn" @click="closeMenuModal">✕</button>
        </view>

        <view class="modal-body">
          <form @submit="saveMenu">
            <!-- 基本信息 -->
            <view class="form-section">
              <view class="section-title">基本信息</view>
              
              <view class="form-item">
                <text class="form-label">菜单日期 *</text>
                <picker 
                  class="form-picker" 
                  mode="date" 
                  :value="menuForm.date" 
                  @change="onMenuDateChange"
                >
                  <view class="picker-text">
                    {{ formatDate(menuForm.date) }}
                  </view>
                </picker>
              </view>

              <view class="form-item">
                <text class="form-label">餐次类型 *</text>
                <picker 
                  class="form-picker" 
                  :value="menuForm.mealIndex" 
                  :range="mealOptions" 
                  range-key="name"
                  @change="onMenuMealChange"
                >
                  <view class="picker-text">
                    {{ menuForm.mealIndex >= 0 ? mealOptions[menuForm.mealIndex].name : '请选择餐次' }}
                  </view>
                </picker>
              </view>

              <view class="form-item">
                <text class="form-label">菜单描述</text>
                <textarea 
                  class="form-textarea" 
                  v-model="menuForm.description" 
                  placeholder="请输入菜单描述"
                  maxlength="200"
                />
                <text class="char-count">{{ menuForm.description.length }}/200</text>
              </view>
            </view>

            <!-- 菜品选择 -->
            <view class="form-section">
              <view class="section-title">
                <text>菜品选择</text>
                <text class="dish-count-text">已选 {{ menuForm.dishes.length }} 道</text>
              </view>
              
              <view class="selected-dishes">
                <view 
                  v-for="dish in menuForm.dishes" 
                  :key="dish.dishId" 
                  class="selected-dish-item"
                >
                  <image 
                    :src="dish.image || '/static/logo.png'" 
                    class="dish-thumbnail" 
                    mode="aspectFill"
                  />
                  <view class="dish-info">
                    <text class="dish-name">{{ dish.dishName }}</text>
                    <text class="dish-category">{{ dish.categoryName }}</text>
                  </view>
                  <view class="dish-price-input">
                    <text class="price-label">价格:</text>
                    <input 
                      class="price-input" 
                      v-model="dish.price" 
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </view>
                  <button 
                    class="remove-dish-btn" 
                    @click="removeDish(dish.dishId)"
                  >
                    ✕
                  </button>
                </view>
              </view>
              
              <button class="select-dishes-btn" @click="showDishSelector">
                <text class="btn-icon">+</text>
                <text>{{ menuForm.dishes.length > 0 ? '添加更多菜品' : '选择菜品' }}</text>
              </button>
            </view>
          </form>
        </view>

        <view class="modal-footer">
          <button class="modal-btn secondary" @click="closeMenuModal">取消</button>
          <button class="modal-btn secondary" @click="saveAsDraft" :disabled="!can保存">
            保存草稿
          </button>
          <button class="modal-btn primary" @click="publishMenuDirect" :disabled="!can保存">
            {{ is编辑 ? '更新并发布' : '创建并发布' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 菜品选择器弹窗 -->
    <DishSelector
      :visible="showDishSelectorModal"
      :selectedDishIds="getSelectedDishIds()"
      @confirm="onDishesSelected"
      @close="closeDishSelector"
    />

    <!-- 模板管理弹窗 -->
    <view v-if="showTemplateModal" class="modal-overlay" @click="closeTemplateModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">菜单模板</text>
          <button class="close-btn" @click="closeTemplateModal">✕</button>
        </view>

        <view class="modal-body">
          <view class="template-actions">
            <button class="template-btn primary" @click="createTemplate">
              <text class="btn-icon">+</text>
              <text>新建模板</text>
            </button>
          </view>
          
          <view v-if="templates.length === 0" class="empty-templates">
            <text class="empty-text">暂无菜单模板</text>
            <text class="empty-hint">创建模板可快速生成菜单</text>
          </view>
          
          <view v-else class="template-list">
            <view 
              v-for="template in templates" 
              :key="template._id" 
              class="template-item"
            >
              <view class="template-info">
                <text class="template-name">{{ template.name }}</text>
                <text class="template-description">{{ template.description }}</text>
                <text class="template-dish-count">{{ template.dishes?.length || 0 }} 道菜品</text>
              </view>
              
              <view class="template-actions">
                <button class="template-action-btn" @click="useTemplate(template)">
                  使用模板
                </button>
                <button class="template-action-btn secondary" @click="editTemplate(template)">
                  编辑
                </button>
                <button class="template-action-btn danger" @click="deleteTemplate(template._id)">
                  删除
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
import DishSelector from '@/components/DishSelector.vue'
import timeMixin from '@/mixins/timeMixin.js'
import { TimeUtils } from '@/utils/timeUtils.js'

export default {
  name: 'MenuManagement',
  mixins: [timeMixin],
  components: {
    DishSelector
  },
  data() {
    return {
      // 当前选择
      selectedDate: (() => {
        return TimeUtils.getCurrentDate()
      })(),
      selectedMealIndex: 0,
      
      // 菜单数据
      todayMenu: null,
      menuHistory: [],
      templates: [],
      
      // 弹窗状态
      showMenuModal: false,
      showDishSelectorModal: false,
      showTemplateModal: false,
      is编辑: false,
      
      // 表单数据
      menuForm: {
        date: (() => {
          return TimeUtils.getCurrentDate()
        })(),
        mealIndex: 0,
        description: '',
        dishes: []
      }
    }
  },
  computed: {
    mealOptions() {
      return [
        { value: 'breakfast', name: '早餐' },
        { value: 'lunch', name: '午餐' },
        { value: 'dinner', name: '晚餐' }
      ]
    },
    
    can保存() {
      return this.menuForm.date && 
             this.menuForm.mealIndex >= 0 && 
             this.menuForm.dishes.length > 0
    }
  },
  onLoad() {
    this.load今天Menu()
    this.loadMenuHistory()
    this.loadTemplates()
  },
  methods: {
    /**
     * 加载今日菜单
     */
    async load今天Menu() {
      try {
        const date = this.selectedDate
        const mealType = this.mealOptions[this.selectedMealIndex].value
        
        console.log('正在加载今日菜单，参数:', { date, mealType })
        const response = await api.admin.getMenuByDate(date, mealType)
        console.log('今日菜单API响应:', response)
        
        if (response && response.success) {
          this.todayMenu = response.data
          
          // 检查菜品数据
          if (this.todayMenu && this.todayMenu.dishes) {
            console.log('菜单菜品数据:', this.todayMenu.dishes)
            if (Array.isArray(this.todayMenu.dishes)) {
              console.log('菜品数量:', this.todayMenu.dishes.length)
            } else {
              console.warn('菜品数据不是数组:', typeof this.todayMenu.dishes)
            }
          } else {
            console.warn('菜单中没有菜品数据或dishes为null，尝试单独获取菜品数据')
            
            // 如果菜品数据为空，尝试单独获取菜品列表
            if (this.todayMenu && this.todayMenu._id) {
              await this.loadMenuDishes(this.todayMenu._id)
            }
          }
        } else {
          console.warn('获取菜单失败:', response?.message)
          this.todayMenu = null
        }
      } catch (error) {
        console.error('加载今日菜单失败:', error)
        this.todayMenu = null
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
          if (this.todayMenu) {
            this.todayMenu.dishes = response.data
            console.log('菜品数据加载成功，数量:', this.todayMenu.dishes.length)
          }
        } else {
          console.warn('获取菜品数据失败:', response?.message)
        }
      } catch (error) {
        console.error('加载菜品数据失败:', error)
      }
    },

    /**
     * 加载菜单历史
     */
    async loadMenuHistory() {
      try {
        const params = {
          page: 1,
          pageSize: 10,
          startDate: this.getDateBefore(7), // 最近7天
          endDate: this.selectedDate
        }
        
        console.log('加载菜单历史，参数:', params)
        const response = await api.admin.getMenuHistory(params)
        console.log('菜单历史API响应:', response)
        
        if (response && response.success) {
          this.menuHistory = response.data.list || []
          console.log('菜单历史数据:', this.menuHistory)
          
          // 调试：检查每个菜单项的字段
          this.menuHistory.forEach((menu, index) => {
            console.log(`菜单${index + 1}:`, {
              _id: menu._id,
              name: menu.name,
              publishDate: menu.publishDate,
              mealType: menu.mealType,
              publishStatus: menu.publishStatus,
              dishCount: menu.dishCount
            })
          })
        }
      } catch (error) {
        console.error('加载菜单历史失败:', error)
        this.menuHistory = []
      }
    },

    /**
     * 加载菜单模板
     */
    async loadTemplates() {
      try {
        const response = await api.admin.getMenuTemplates()
        if (response && response.success) {
          this.templates = response.data || []
        }
      } catch (error) {
        console.error('加载菜单模板失败:', error)
        this.templates = []
      }
    },

    /**
     * 创建菜单
     */
    createMenu() {
      uni.navigateTo({
        url: '/pages/admin/menu-edit'
      })
    },

    /**
     * 编辑菜单
     */
    editMenu(menu) {
      uni.navigateTo({
        url: `/pages/admin/menu-edit?menuId=${menu._id}`
      })
    },

    /**
     * 重置表单
     */
    resetMenuForm() {
      this.menuForm = {
        date: this.formatDateForPicker(TimeUtils.createCurrentDate()),
        mealIndex: 0,
        description: '',
        dishes: []
      }
    },

    /**
     * 日期选择
     */
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.load今天Menu()
    },

    onMenuDateChange(e) {
      this.menuForm.date = e.detail.value
    },

    /**
     * 餐次选择
     */
    onMealChange(e) {
      this.selectedMealIndex = e.detail.value
      this.load今天Menu()
    },

    onMenuMealChange(e) {
      this.menuForm.mealIndex = e.detail.value
    },

    /**
     * 显示菜品选择器
     */
    showDishSelector() {
      this.showDishSelectorModal = true
    },

    /**
     * 菜品选择完成
     */
    onDishesSelected(dishes) {
      console.log('菜品选择完成，接收到的菜品:', dishes)
      
      // 确保dishes是数组
      if (!Array.isArray(dishes)) {
        console.error('菜品数据格式错误:', dishes)
        uni.showToast({
          title: '菜品数据格式错误',
          icon: 'error'
        })
        return
      }
      
      // 合并新选择的菜品，避免重复
      const existingDishIds = this.menuForm.dishes.map(d => d.dishId)
      const newDishes = dishes.filter(dish => !existingDishIds.includes(dish.id))
      
      // 确保数据结构与菜品管理一致
      this.menuForm.dishes = [
        ...this.menuForm.dishes,
        ...newDishes.map(dish => ({
          dishId: dish.id,
          dishName: dish.name,
          categoryName: dish.categoryName,
          image: dish.image,
          price: dish.price || 0,
          sort: this.menuForm.dishes.length + 1
        }))
      ]
      
      console.log('更新后的菜单菜品:', this.menuForm.dishes)
      this.closeDishSelector()
    },

    /**
     * 移除菜品
     */
    removeDish(dishId) {
      const index = this.menuForm.dishes.findIndex(d => d.dishId === dishId)
      if (index > -1) {
        this.menuForm.dishes.splice(index, 1)
        // 重新排序
        this.menuForm.dishes.forEach((dish, idx) => {
          dish.sort = idx + 1
        })
      }
    },

    /**
     * 获取已选菜品ID列表
     */
    getSelectedDishIds() {
      return this.menuForm.dishes.map(d => d.dishId)
    },

    /**
     * 保存草稿
     */
    async saveAsDraft() {
      if (!this.can保存) {
        uni.showToast({
          title: '请完善必填信息',
          icon: 'none'
        })
        return
      }

      try {
        const menuData = {
          date: this.menuForm.date,
          mealType: this.mealOptions[this.menuForm.mealIndex].value,
          description: this.menuForm.description.trim(),
          dishes: this.menuForm.dishes
        }

        let response
        if (this.is编辑) {
          response = await api.admin.updateMenu(this.todayMenu._id, menuData)
        } else {
          response = await api.admin.saveMenuDraft(menuData)
        }

        if (response && response.success) {
          uni.showToast({
            title: '草稿保存成功',
            icon: 'success'
          })
          this.closeMenuModal()
          this.load今天Menu()
        }
      } catch (error) {
        console.error('保存草稿失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      }
    },

    /**
     * 直接发布菜单
     */
    async publishMenuDirect() {
      if (!this.can保存) {
        uni.showToast({
          title: '请完善必填信息',
          icon: 'none'
        })
        return
      }

      try {
        const menuData = {
          date: this.menuForm.date,
          mealType: this.mealOptions[this.menuForm.mealIndex].value,
          description: this.menuForm.description.trim(),
          dishes: this.menuForm.dishes
        }

        let response
        if (this.is编辑) {
          response = await api.admin.updateMenu(this.todayMenu._id, menuData)
        } else {
          response = await api.admin.publishMenu(menuData)
        }

        if (response && response.success) {
          uni.showToast({
            title: '菜单发布成功',
            icon: 'success'
          })
          this.closeMenuModal()
          this.load今天Menu()
        }
      } catch (error) {
        console.error('发布菜单失败:', error)
        uni.showToast({
          title: error.message || '发布失败',
          icon: 'error'
        })
      }
    },

    /**
     * 发布菜单
     */
    async publishMenu(menu) {
      try {
        const result = await uni.showModal({
          title: '确认发布',
          content: `确定要发布 ${menu.date} ${this.getMealTypeText(menu.mealType)} 菜单吗？`,
          confirmText: '发布',
          confirmColor: '#667eea'
        })
        
        if (result.confirm) {
          const response = await api.admin.publishMenu({
            date: menu.date,
            mealType: menu.mealType,
            description: menu.description,
            dishes: menu.dishes
          })
          
          if (response && response.success) {
            uni.showToast({
              title: '菜单发布成功',
              icon: 'success'
            })
            this.load今天Menu()
          }
        }
      } catch (error) {
        console.error('发布菜单失败:', error)
        uni.showToast({
          title: '发布失败',
          icon: 'error'
        })
      }
    },

    /**
     * 撤回菜单
     */
    async revokeMenu(menuId) {
      try {
        const result = await uni.showModal({
          title: '确认撤回',
          content: '确定要撤回这个菜单吗？撤回后用户将无法看到此菜单。',
          confirmText: '撤回',
          confirmColor: '#e74c3c'
        })
        
        if (result.confirm) {
          const response = await api.admin.revokeMenu(menuId)
          if (response && response.success) {
            uni.showToast({
              title: '菜单撤回成功',
              icon: 'success'
            })
            this.load今天Menu()
          }
        }
      } catch (error) {
        console.error('撤回菜单失败:', error)
        uni.showToast({
          title: '撤回失败',
          icon: 'error'
        })
      }
    },

    /**
     * 查看菜单详情
     */
    viewMenuDetail(menu) {
      // 可以跳转到详情页面或显示详情弹窗
      uni.showToast({
        title: '查看详情功能开发中',
        icon: 'none'
      })
    },

    /**
     * 查看全部历史
     */
    viewAllHistory() {
      uni.navigateTo({
        url: '/pages/admin/menu-history'
      })
    },

    /**
     * 模板相关操作
     */
    showTemplateModal() {
      this.showTemplateModal = true
    },

    createTemplate() {
      uni.navigateTo({
        url: '/pages/admin/template-edit?action=create'
      })
    },

    editTemplate(template) {
      uni.navigateTo({
        url: `/pages/admin/template-edit?action=edit&id=${template._id}`
      })
    },

    async deleteTemplate(templateId) {
      try {
        const result = await uni.showModal({
          title: '确认删除',
          content: '确定要删除这个菜单模板吗？',
          confirmText: '删除',
          confirmColor: '#e74c3c'
        })
        
        if (result.confirm) {
          const response = await api.admin.deleteMenuTemplate(templateId)
          if (response && response.success) {
            uni.showToast({
              title: '模板删除成功',
              icon: 'success'
            })
            this.loadTemplates()
          }
        }
      } catch (error) {
        console.error('删除模板失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    },

    useTemplate(template) {
      // 使用模板创建菜单
      this.menuForm.dishes = template.dishes.map(dish => ({
        dishId: dish.dishId,
        dishName: dish.dishName || '未知菜品',
        categoryName: dish.categoryName || '未分类',
        image: dish.image || '/static/logo.png',
        price: dish.price || 0,
        sort: dish.sort || 1
      }))
      
      this.closeTemplateModal()
      this.showMenuModal = true
    },

    /**
     * 关闭弹窗
     */
    closeMenuModal() {
      this.showMenuModal = false
      this.resetMenuForm()
    },

    closeDishSelector() {
      this.showDishSelectorModal = false
    },

    closeTemplateModal() {
      this.showTemplateModal = false
    },

    /**
     * 工具方法
     */
    formatDateForPicker(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    formatDate(dateStr) {
      console.log('formatDate 输入:', dateStr, '类型:', typeof dateStr)
      if (!dateStr) {
        console.log('日期字符串为空，返回未知日期')
        return '未知日期'
      }
      try {
        const formatted = this.$formatDate(dateStr)
        const date = this.$createDate(dateStr)
        if (!date) {
          return '未知日期'
        }
        const month = date.getMonth() + 1
        const day = date.getDate()
        const result = `${month}月${day}日`
        return result
      } catch (error) {
        console.error('日期格式化失败:', error)
        return '未知日期'
      }
    },

    formatTime(timeStr) {
      return this.$formatTimeOnly(timeStr)
    },

    getDateBefore(days) {
      const date = TimeUtils.createCurrentDate()
      date.setDate(date.getDate() - days)
      return this.formatDateForPicker(date)
    },

    getMealTypeText(mealType) {
      const mealMap = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐'
      }
      return mealMap[mealType] || mealType
    },

    getStatusText(status) {
      const statusMap = {
        'draft': '草稿',
        'published': '已发布',
        'revoked': '已撤回'
      }
      return statusMap[status] || status
    },

    getStatusClass(status) {
      const classMap = {
        'draft': 'status-draft',
        'published': 'status-published',
        'revoked': 'status-revoked'
      }
      return classMap[status] || ''
    },

    /**
     * 获取分类名称
     */
    getCategoryName(categoryId) {
      if (!categoryId) return '未分类'
      
      const defaultNames = {
        'main': '主菜',
        'meat': '荤菜',
        'vegetable': '素菜',
        'soup': '汤类',
        'dessert': '甜点',
        'staple': '主食'
      }
      
      return defaultNames[categoryId] || '未分类'
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-container {
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

/* 操作工具栏 */
.toolbar {
  background: white;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

.toolbar-left {
  display: flex;
  gap: 20rpx;
}

.toolbar-right {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.date-picker, .meal-picker {
  padding: 10rpx 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 2rpx solid #e9ecef;
  font-size: 28rpx;
  color: #333;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.btn-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

/* 今日菜单状态 */
.today-menu-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-subtitle {
  font-size: 24rpx;
  color: #666;
  margin-left: 20rpx;
}

.menu-status-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
  color: white;
}

.status-badge.status-draft {
  background: #95a5a6;
}

.status-badge.status-published {
  background: #27ae60;
}

.status-badge.status-revoked {
  background: #e74c3c;
}

.menu-description {
  font-size: 26rpx;
  color: #555;
  line-height: 1.4;
}

.dish-count {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

.status-actions {
  display: flex;
  gap: 12rpx;
  justify-content: flex-end;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
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

.no-menu-state {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
}

.no-menu-icon {
  font-size: 60rpx;
  margin-bottom: 15rpx;
}

.no-menu-text {
  font-size: 28rpx;
  margin-bottom: 12rpx;
  display: block;
}

.no-menu-hint {
  font-size: 24rpx;
  display: block;
}

.create-menu-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

/* 菜单历史 */
.menu-history-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.view-all-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.empty-history {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
}

.history-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.history-date-section {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.history-date {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.history-meal {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: white;
  background: #e74c3c;
  font-weight: 500;
}

.history-status {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: white;
}

.history-status.status-draft {
  background: #95a5a6;
}

.history-status.status-published {
  background: #27ae60;
}

.history-status.status-revoked {
  background: #e74c3c;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.dish-count {
  font-size: 24rpx;
  color: #666;
}

.publish-time {
  font-size: 22rpx;
  color: #999;
}

/* 创建/编辑菜单弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #eee;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx;
  overflow-y: auto;
  flex-grow: 1;
}

.form-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 28rpx;
  color: #555;
  margin-bottom: 10rpx;
  display: block;
}

.form-picker {
  width: 100%;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  font-size: 28rpx;
  color: #333;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.char-count {
  text-align: right;
  font-size: 22rpx;
  color: #999;
}

.selected-dishes {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.selected-dish-item {
  display: flex;
  align-items: center;
  padding: 15rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
}

.dish-thumbnail {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  margin-right: 15rpx;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dish-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.dish-category {
  font-size: 24rpx;
  color: #666;
}

.dish-price-input {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  gap: 10rpx;
}

.price-label {
  font-size: 26rpx;
  color: #555;
}

.price-input {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  padding: 8rpx 12rpx;
}

.select-dishes-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 15rpx 25rpx;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  border-top: 2rpx solid #eee;
}

.modal-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
}

.modal-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.modal-btn.primary {
  background: #667eea;
  color: white;
}

.modal-btn.primary:disabled {
  background: #ccc;
  color: #999;
}

/* 模板管理弹窗 */
.template-actions {
  display: flex;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.template-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 15rpx 25rpx;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.empty-templates {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.template-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.template-description {
  font-size: 24rpx;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-dish-count {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.template-actions {
  display: flex;
  gap: 12rpx;
  justify-content: flex-end;
}

.template-action-btn {
  padding: 10rpx 15rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
}

.template-action-btn.primary {
  background: #667eea;
  color: white;
}

.template-action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.template-action-btn.danger {
  background: #e74c3c;
  color: white;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 15rpx;
  }

  .toolbar-left, .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .meal-picker {
    width: 45%; /* Adjust for smaller screens */
  }

  .modal-content {
    width: 95%;
    max-height: 95%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>
