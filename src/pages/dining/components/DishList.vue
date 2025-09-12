<template>
  <view class="dish-list">
    <!-- 搜索和筛选 -->
    <view class="filter-section">
      <view class="search-box">
        <input
          class="search-input"
          v-model="searchText"
          placeholder="搜索菜品..."
          @input="onSearchInput"
        />
        <text class="search-icon">🔍</text>
      </view>
      
      <view class="filter-tabs">
        <view
          class="filter-tab"
          :class="{ active: selectedCategory === 'all' }"
          @click="selectCategory('all')"
        >
          <text class="filter-text">全部</text>
        </view>
        <view
          class="filter-tab"
          :class="{ active: selectedCategory === category.value }"
          v-for="category in categories"
          :key="category.value"
          @click="selectCategory(category.value)"
        >
          <text class="filter-text">{{ category.label }}</text>
        </view>
      </view>
    </view>

    <!-- 菜品列表 -->
    <view class="dishes-container" v-if="filteredDishes.length > 0">
      <view
        class="dish-item"
        v-for="dish in filteredDishes"
        :key="dish._id"
        @click="selectDish(dish)"
      >
        <view class="dish-image">
          <text class="dish-emoji">{{ getDishEmoji(dish.category) }}</text>
        </view>
        
        <view class="dish-info">
          <text class="dish-name">{{ dish.name || dish.dishName }}</text>
          <text class="dish-category">{{ dish.category || dish.categoryName }}</text>
          <text class="dish-price">¥{{ dish.price || '0.00' }}</text>
          <text class="dish-desc" v-if="dish.description">{{ dish.description }}</text>
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
      <text class="empty-desc">当前筛选条件下没有找到菜品</text>
    </view>
  </view>
</template>

<script>
import { debounce } from '@/utils/debounce.js'

export default {
  name: 'DishList',
  props: {
    dishes: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchText: '',
      selectedCategory: 'all'
    }
  },
  computed: {
    filteredDishes() {
      let dishes = this.dishes || []

      // 分类筛选
      if (this.selectedCategory !== 'all') {
        dishes = dishes.filter(dish => 
          (dish.category || dish.categoryName) === this.selectedCategory
        )
      }

      // 搜索筛选
      if (this.searchText.trim()) {
        const searchText = this.searchText.trim().toLowerCase()
        dishes = dishes.filter(dish => 
          (dish.name || dish.dishName).toLowerCase().includes(searchText)
        )
      }

      return dishes
    }
  },
  methods: {
    onSearchInput: debounce(function() {
      // 搜索防抖处理
    }, 300),

    selectCategory(category) {
      this.selectedCategory = category
    },

    selectDish(dish) {
      this.$emit('select-dish', dish)
    },

    addDish(dish) {
      this.$emit('add-dish', dish)
    },

    getDishEmoji(category) {
      const emojiMap = {
        '主食': '🍚',
        '主菜': '🥩',
        '素菜': '🥬',
        '汤品': '🍲',
        '饮品': '🥤',
        '小食': '🍪',
        '甜品': '🍰',
        '水果': '🍎'
      }
      return emojiMap[category] || '🍽️'
    }
  }
}
</script>

<style scoped>
.dish-list {
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

.search-input:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.1);
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

.dishes-container {
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
  border: 2rpx solid transparent;
}

.dish-item:active {
  background: #e9ecef;
  transform: scale(0.98);
  border-color: #667eea;
}

.dish-image {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.dish-emoji {
  font-size: 40rpx;
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
  margin-bottom: 4rpx;
}

.dish-desc {
  display: block;
  font-size: 20rpx;
  color: #999;
  line-height: 1.4;
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
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.add-btn:active {
  background: #5a6fd8;
  transform: scale(0.9);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.4);
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
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.empty-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}
</style>
