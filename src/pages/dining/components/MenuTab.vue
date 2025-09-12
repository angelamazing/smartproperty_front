<template>
  <view class="menu-tab">
    <!-- 菜单头部 -->
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
          v-for="meal in mealTypes"
          :key="meal.value"
          @click="selectMeal(meal.value)"
        >
          <text class="meal-text">{{ meal.label }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单内容 -->
    <view class="menu-content" v-if="currentMenu">
      <!-- 搜索和筛选 -->
      <view class="filter-section">
        <view class="search-box">
          <input
            class="search-input"
            v-model="dishSearchText"
            placeholder="搜索菜品..."
            @input="onSearchInput"
          />
          <text class="search-icon">🔍</text>
        </view>
        
        <view class="filter-tabs">
          <view
            class="filter-tab"
            :class="{ active: selectedCategoryFilter === 'all' }"
            @click="selectCategoryFilter('all')"
          >
            <text class="filter-text">全部</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: selectedCategoryFilter === category.value }"
            v-for="category in dishCategories"
            :key="category.value"
            @click="selectCategoryFilter(category.value)"
          >
            <text class="filter-text">{{ category.label }}</text>
          </view>
        </view>
      </view>

      <!-- 菜品列表 -->
      <view class="dish-list" v-if="filteredDishes.length > 0">
        <view
          class="dish-item"
          v-for="dish in filteredDishes"
          :key="dish._id"
          @click="selectDish(dish)"
        >
          <view class="dish-info">
            <text class="dish-name">{{ dish.name || dish.dishName }}</text>
            <text class="dish-category">{{ dish.category || dish.categoryName }}</text>
            <text class="dish-price">¥{{ dish.price || '0.00' }}</text>
          </view>
          <view class="dish-actions">
            <button class="add-btn" @click.stop="addDish(dish)">
              <text class="add-icon">+</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">🍽️</text>
        <text class="empty-text">暂无菜品</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-else>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { debounce } from '@/utils/debounce.js'

export default {
  name: 'MenuTab',
  props: {
    currentMenu: {
      type: Object,
      default: null
    },
    selectedDate: {
      type: String,
      required: true
    },
    selectedMeal: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dishSearchText: '',
      selectedCategoryFilter: 'all',
      activeTagFilters: [],
      priceRange: {
        min: '',
        max: ''
      }
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

    dishCategories() {
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
      
      const categories = [...new Set(this.currentMenu.dishes.map(dish => 
        dish.categoryName || dish.category || '未分类'
      ))]
      
      return categories.map(category => ({
        label: category,
        value: category
      }))
    },

    filteredDishes() {
      if (!this.currentMenu || !this.currentMenu.dishes) {
        return []
      }

      let dishes = this.currentMenu.dishes

      // 分类筛选
      if (this.selectedCategoryFilter !== 'all') {
        dishes = dishes.filter(dish => 
          (dish.category || dish.categoryName) === this.selectedCategoryFilter
        )
      }

      // 搜索筛选
      if (this.dishSearchText.trim()) {
        const searchText = this.dishSearchText.trim().toLowerCase()
        dishes = dishes.filter(dish => 
          (dish.name || dish.dishName).toLowerCase().includes(searchText)
        )
      }

      return dishes
    }
  },
  methods: {
    previousDate() {
      this.$emit('previous-date')
    },

    nextDate() {
      this.$emit('next-date')
    },

    selectMeal(mealType) {
      this.$emit('select-meal', mealType)
    },

    selectCategoryFilter(category) {
      this.selectedCategoryFilter = category
    },

    onSearchInput: debounce(function() {
      // 搜索防抖处理
    }, 300),

    selectDish(dish) {
      this.$emit('select-dish', dish)
    },

    addDish(dish) {
      this.$emit('add-dish', dish)
    }
  }
}
</script>

<style scoped>
.menu-tab {
  padding: 20rpx;
}

.menu-header {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
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
  color: #667eea;
}

.current-date {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.meal-selector {
  display: flex;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 8rpx;
}

.meal-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx;
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

.menu-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.filter-section {
  margin-bottom: 30rpx;
}

.search-box {
  position: relative;
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 0 60rpx 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.search-icon {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: #999;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 12rpx 24rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
  transition: all 0.3s ease;
}

.filter-tab.active {
  background: #667eea;
  color: #fff;
}

.filter-text {
  font-size: 24rpx;
  font-weight: 500;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.dish-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.dish-item:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.dish-info {
  flex: 1;
}

.dish-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.dish-category {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.dish-price {
  display: block;
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.dish-actions {
  margin-left: 20rpx;
}

.add-btn {
  width: 60rpx;
  height: 60rpx;
  background: #667eea;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-btn:active {
  background: #5a6fd8;
  transform: scale(0.9);
}

.add-icon {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading-state {
  text-align: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}
</style>
