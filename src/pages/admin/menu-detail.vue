<template>
  <view class="menu-detail-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">{{ formatDetailDate(menuDetail.publishDate) }} {{ getMealTypeText(menuDetail.mealType) }}</text>
      <text :class="['status-badge', `status-${menuDetail.publishStatus}`]">
        {{ getStatusText(menuDetail.publishStatus) }}
      </text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @click="loadMenuDetail">重试</button>
    </view>

    <!-- 菜单内容 -->
    <view v-else class="menu-content">
      <!-- 菜单基本信息 -->
      <view v-if="menuDetail.description" class="menu-description">
        <text>{{ menuDetail.description }}</text>
      </view>

      <!-- 菜品列表 -->
      <view class="dishes-section">
        <view class="section-title">
          <text>菜品列表 ({{ (menuDetail.dishes || []).length }}道)</text>
        </view>
        
        <view v-if="!menuDetail.dishes || menuDetail.dishes.length === 0" class="empty-dishes">
          <text>暂无菜品</text>
        </view>
        
        <view v-else class="dishes-list">
          <view 
            v-for="(dish, index) in menuDetail.dishes" 
            :key="dish.dishId || index"
            class="dish-item"
          >
            <view class="dish-info">
              <text class="dish-name">{{ dish.dishName || dish.name }}</text>
              <view class="dish-meta">
                <text class="dish-category">{{ dish.categoryName || '未分类' }}</text>
                <view v-if="dish.meal_types && dish.meal_types.length > 0" class="meal-types">
                  <text 
                    v-for="mealType in dish.meal_types" 
                    :key="mealType" 
                    class="meal-type-tag"
                  >
                    {{ getMealTypeText(mealType) }}
                  </text>
                </view>
              </view>
            </view>
            <text class="dish-price">¥{{ formatPrice(dish.price || dish.dishPrice || dish.originalPrice || dish.currentPrice || '0') }}</text>
          </view>
        </view>
      </view>

      <!-- 总价 -->
      <view class="total-price">
        <text>总价：¥{{ formatPrice(menuDetail.totalPrice) }}</text>
      </view>

    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'MenuDetail',
  data() {
    return {
      loading: false,
      error: '',
      menuId: '',
      menuDetail: {}
    }
  },
  
  onLoad(options) {
    console.log('菜单详情页面 onLoad', options)
    if (options.menuId) {
      this.menuId = options.menuId
      this.loadMenuDetail()
    } else {
      this.error = '缺少菜单ID参数'
    }
  },
  
  methods: {
    // 加载菜单详情（优先使用缓存数据）
    async loadMenuDetail() {
      if (!this.menuId) {
        this.error = '菜单ID不能为空'
        return
      }
      
      this.loading = true
      this.error = ''
      
      try {
        // 优先尝试从缓存中获取菜单数据
        const cachedMenuDetail = uni.getStorageSync('currentMenuDetail')
        
        if (cachedMenuDetail && cachedMenuDetail._id === this.menuId) {
          console.log('使用缓存的菜单详情数据:', cachedMenuDetail)
          this.menuDetail = cachedMenuDetail
          
          // 调试：检查缓存菜品数据结构
          if (this.menuDetail.dishes && Array.isArray(this.menuDetail.dishes)) {
            console.log('缓存菜品数据结构检查:')
            this.menuDetail.dishes.forEach((dish, index) => {
              console.log(`缓存菜品${index + 1}:`, {
                name: dish.dishName || dish.name,
                price: dish.price,
                priceType: typeof dish.price,
                allFields: Object.keys(dish)
              })
            })
            
            this.menuDetail.totalPrice = this.menuDetail.dishes.reduce((total, dish) => {
              // 尝试多种可能的价格字段名
              const priceValue = dish.price || dish.dishPrice || dish.originalPrice || dish.currentPrice || '0'
              const price = parseFloat(priceValue) || 0
              console.log(`缓存菜品 ${dish.dishName || dish.name} 价格字段: price=${dish.price}, dishPrice=${dish.dishPrice}, 解析值: ${priceValue} -> ${price}`)
              return total + price
            }, 0)
            this.menuDetail.dishCount = this.menuDetail.dishes.length
            
            console.log('缓存计算出的总价:', this.menuDetail.totalPrice)
          }
          
          // 清除缓存数据
          uni.removeStorageSync('currentMenuDetail')
          this.loading = false
          return
        }
        
        console.log('缓存中无数据，通过历史接口加载菜单详情，ID:', this.menuId)
        
        // 使用菜单历史接口，通过menuId查找对应的菜单
        const response = await api.admin.getMenuHistory({
          page: 1,
          pageSize: 100, // 设置较大的页面大小以确保能找到目标菜单
        })
        
        console.log('菜单历史API响应:', response)
        
        if (response && response.success && response.data && response.data.list) {
          // 从历史列表中找到对应ID的菜单
          const targetMenu = response.data.list.find(menu => menu._id === this.menuId)
          
          if (targetMenu) {
            this.menuDetail = targetMenu
            console.log('菜单详情加载成功:', this.menuDetail)
            
            // 调试：检查菜品数据结构
            if (this.menuDetail.dishes && Array.isArray(this.menuDetail.dishes)) {
              console.log('菜品数据结构检查:')
              this.menuDetail.dishes.forEach((dish, index) => {
                console.log(`菜品${index + 1}:`, {
                  name: dish.dishName || dish.name,
                  price: dish.price,
                  priceType: typeof dish.price,
                  allFields: Object.keys(dish)
                })
              })
              
              this.menuDetail.totalPrice = this.menuDetail.dishes.reduce((total, dish) => {
                // 尝试多种可能的价格字段名
                const priceValue = dish.price || dish.dishPrice || dish.originalPrice || dish.currentPrice || '0'
                const price = parseFloat(priceValue) || 0
                console.log(`菜品 ${dish.dishName || dish.name} 价格字段: price=${dish.price}, dishPrice=${dish.dishPrice}, 解析值: ${priceValue} -> ${price}`)
                return total + price
              }, 0)
              this.menuDetail.dishCount = this.menuDetail.dishes.length
              
              console.log('计算出的总价:', this.menuDetail.totalPrice)
            }
          } else {
            throw new Error('未找到指定的菜单')
          }
        } else {
          throw new Error(response?.message || '获取菜单历史失败')
        }
      } catch (error) {
        console.error('加载菜单详情失败:', error)
        this.error = error.message || '加载失败，请重试'
      } finally {
        this.loading = false
      }
    },



    // 格式化详细日期
    formatDetailDate(dateString) {
      if (!dateString) return '未知日期'
      
      console.log('菜单详情页面 formatDetailDate 输入:', dateString, '类型:', typeof dateString)
      
      try {
        let date
        
        // 处理多种可能的日期格式
        if (typeof dateString === 'string') {
          // 去掉可能的时间部分，只保留日期
          let cleanDateStr = dateString.split('T')[0].split(' ')[0]
          
          // 替换斜杠为短横线，确保格式一致
          cleanDateStr = cleanDateStr.replace(/\//g, '-')
          
          console.log('清理后的日期字符串:', cleanDateStr)
          
          // 尝试直接解析
          date = new Date(cleanDateStr + 'T00:00:00')
          
          // 如果解析失败，尝试其他格式
          if (isNaN(date.getTime())) {
            // 尝试原始字符串
            date = new Date(dateString)
            
            // 如果还是失败，尝试手动解析
            if (isNaN(date.getTime())) {
              const parts = cleanDateStr.split('-')
              if (parts.length >= 3) {
                const year = parseInt(parts[0])
                const month = parseInt(parts[1]) - 1 // 月份从0开始
                const day = parseInt(parts[2])
                date = new Date(year, month, day)
              }
            }
          }
        } else {
          date = new Date(dateString)
        }
        
        console.log('解析后的日期对象:', date, '有效性:', !isNaN(date.getTime()))
        
        if (isNaN(date.getTime())) {
          console.error('无法解析日期:', dateString)
          return '未知日期'
        }
        
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekdays = ['日', '一', '二', '三', '四', '五', '六']
        const weekday = weekdays[date.getDay()]
        
        const result = `${year}年${month}月${day}日 周${weekday}`
        console.log('格式化结果:', result)
        
        return result
      } catch (error) {
        console.error('日期格式化失败:', error, '原始数据:', dateString)
        return '未知日期'
      }
    },

    // 格式化时间
    formatTime(dateString) {
      if (!dateString) return '未知时间'
      try {
        // 安全的日期创建，避免iOS兼容性问题
        let date
        if (typeof dateString === 'string') {
          // 对于时间，保留完整的时间信息
          const cleanDateStr = dateString.replace(/\//g, '-')
          date = new Date(cleanDateStr)
        } else {
          date = new Date(dateString)
        }
        
        // 检查日期有效性（原生JavaScript方式）
        if (!date || isNaN(date.getTime())) {
          console.error('无效的时间:', dateString)
          return '未知时间'
        }
        
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${year}年${month}月${day}日 ${hours}:${minutes}`
      } catch (error) {
        console.error('时间格式化失败:', error)
        return '未知时间'
      }
    },

    // 格式化价格
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    },

    // 获取餐次类型文本
    getMealTypeText(mealType) {
      const mealMap = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐'
      }
      return mealMap[mealType] || mealType
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'draft': '草稿',
        'published': '已发布',
        'revoked': '已撤回'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.menu-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.2);
}

.status-badge.status-published {
  background-color: #67c23a;
}

.status-badge.status-draft {
  background-color: #e6a23c;
}

.status-badge.status-revoked {
  background-color: #f56c6c;
}

/* 加载和错误状态 */
.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.error-container {
  text-align: center;
  padding: 60px 20px;
  color: #f56c6c;
}

.error-text {
  margin-bottom: 20px;
}

.retry-btn {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
}

/* 内容区域 */
.menu-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.menu-description {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

/* 菜品列表 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.empty-dishes {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.dishes-list {
  margin-bottom: 20px;
}

.dish-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.dish-item:last-child {
  border-bottom: none;
}

.dish-info {
  flex: 1;
}

.dish-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.dish-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dish-category {
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.meal-types {
  display: flex;
  gap: 4px;
}

.meal-type-tag {
  font-size: 10px;
  color: #fff;
  background-color: #667eea;
  padding: 2px 6px;
  border-radius: 3px;
}

.dish-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b35;
}

/* 总价 */
.total-price {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding: 15px 0;
  border-top: 2px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
