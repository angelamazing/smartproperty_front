<template>
  <view v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ is编辑 ? '编辑菜品' : '新建菜品' }}</text>
        <button class="close-btn" @click="close">✕</button>
      </view>
      
      <view class="modal-body">
        <form class="dish-form" @submit.prevent="handle提交">
          <!-- 基本信息 -->
          <view class="form-section">
            <view class="section-title">基本信息</view>
            
            <view class="form-item">
              <text class="form-label">菜品名称 *</text>
              <view class="input-wrapper">
                <input 
                  ref="nameInput"
                  class="form-textarea" 
                  :value="formData.name"
                  @input="handleNameInput"
                  placeholder="请输入菜品名称"
                  maxlength="100"
                  required
                />
              </view>
              <text class="char-count">{{ formData.name.length }}/100</text>
              <text class="debug-text">当前值: {{ formData.name }}</text>
            </view>

            <view class="form-item">
              <text class="form-label">菜品描述</text>
              <textarea 
                ref="descInput"
                class="form-textarea" 
                :value="formData.description"
                @input="handleDescriptionInput"
                placeholder="请输入菜品描述"
                maxlength="500"
              />
              <text class="char-count">{{ formData.description.length }}/500</text>
            </view>

            <view class="form-item">
              <text class="form-label">分类 *</text>
              <view class="category-grid">
                <view 
                  v-for="(category, index) in categoryOptions" 
                  :key="category.id"
                  class="category-item"
                  :class="{ 'selected': selectedCategoryId === String(category.id) }"
                  @click="selectCategory(category)"
                >
                  <view class="category-radio">
                    <view class="radio" :class="{ 'checked': selectedCategoryId === String(category.id) }">
                      <view v-if="selectedCategoryId === String(category.id)" class="radio-dot"></view>
                    </view>
                  </view>
                  <text class="category-name">{{ category.name }}</text>
                </view>
              </view>
            </view>

            <view class="form-item">
              <text class="form-label">价格 *</text>
              <view class="input-wrapper">
                <input 
                  ref="priceInput"
                  class="form-textarea" 
                  :value="formData.price"
                  @input="handlePriceInput"
                  type="number"
                  placeholder="请输入价格"
                  step="0.01"
                  min="0"
                  required
                />
              </view>
              <text class="debug-text">当前值: {{ formData.price }}</text>
            </view>
          </view>

          <!-- 营养信息 -->
          <view class="form-section">
            <view class="section-title">
              营养信息
              <button class="template-btn" @click="showNutritionTemplates">选择模板</button>
            </view>
            
            <view class="nutrition-grid">
              <view class="nutrition-item">
                <text class="nutrition-label">卡路里</text>
                <input 
                  ref="caloriesInput"
                  class="nutrition-input" 
                  :value="formData.calories"
                  @input="handleCaloriesInput"
                  type="number"
                  placeholder="请输入卡路里"
                  min="0"
                />
              </view>
              <view class="nutrition-item">
                <text class="nutrition-label">蛋白质(g)</text>
                <input 
                  ref="proteinInput"
                  class="nutrition-input" 
                  :value="formData.protein"
                  @input="handleProteinInput"
                  type="number"
                  placeholder="请输入蛋白质含量"
                  step="0.1"
                  min="0"
                />
              </view>
              <view class="nutrition-item">
                <text class="nutrition-label">脂肪(g)</text>
                <input 
                  ref="fatInput"
                  class="nutrition-input" 
                  :value="formData.fat"
                  @input="handleFatInput"
                  type="number"
                  placeholder="请输入脂肪含量"
                  step="0.1"
                  min="0"
                />
              </view>
              <view class="nutrition-item">
                <text class="nutrition-label">碳水化合物(g)</text>
                <input 
                  ref="carbohydrateInput"
                  class="nutrition-input" 
                  :value="formData.carbohydrate"
                  @input="handleCarbohydrateInput"
                  type="number"
                  placeholder="请输入碳水化合物含量"
                  step="0.1"
                  min="0"
                />
              </view>
            </view>
          </view>

          <!-- 其他设置 -->
          <view class="form-section">
            <view class="section-title">其他设置</view>
            
            <view class="form-item">
              <text class="form-label">推荐菜品</text>
              <switch 
                :checked="formData.isRecommended" 
                @change="onRecommendChange"
              />
            </view>

            <view class="form-item">
              <text class="form-label">菜品状态</text>
              <view class="status-options">
                <view class="status-option" :class="{ 'selected': formData.status === 'active' }" @click="setDishStatus('active')">
                  <text class="status-radio">{{ formData.status === 'active' ? '●' : '○' }}</text>
                  <text class="status-text">已上架</text>
                </view>
                <view class="status-option" :class="{ 'selected': formData.status === 'inactive' }" @click="setDishStatus('inactive')">
                  <text class="status-radio">{{ formData.status === 'inactive' ? '●' : '○' }}</text>
                  <text class="status-text">已下架</text>
                </view>
              </view>
            </view>

            <view class="form-item">
              <text class="form-label">菜品标签</text>
              <textarea 
                ref="tagInput"
                class="form-textarea"
                :value="newTag"
                @input="handleTagInput"
                placeholder="输入标签后按添加按钮"
                maxlength="100"
              />
              <view class="tag-actions">
                <text class="char-count">{{ newTag.length }}/100</text>
                <button class="add-tag-btn" @click="addTag" :disabled="!newTag.trim()">添加标签</button>
              </view>
              <view class="tags-container">
                <view v-for="(tag, index) in formData.tags" :key="index" class="tag-item">
                  <text class="tag-text">{{ tag }}</text>
                  <text class="tag-remove" @click="removeTag(index)">×</text>
                </view>
              </view>
            </view>

            <view class="form-item">
              <text class="form-label">菜品图片</text>
              <button class="upload-btn" @click="uploadImage">
                <text class="upload-icon">📷</text>
                <text>上传图片</text>
              </button>
              <image 
                v-if="formData.image" 
                :src="formData.image" 
                class="preview-image" 
                mode="aspectFill"
              />
            </view>
          </view>
        </form>
      </view>

      <view class="modal-footer">
        <button class="modal-btn secondary" @click="close">取消</button>
        <button class="modal-btn primary" @click="handle提交" :disabled="!can保存">
          {{ is编辑 ? '保存修改' : '创建菜品' }}
        </button>
      </view>
    </view>

    <!-- 营养信息模板弹窗 -->
    <view v-if="showNutritionModal" class="nutrition-modal-overlay" @click="closeNutritionModal">
      <view class="nutrition-modal-content" @click.stop>
        <view class="nutrition-modal-header">
          <text class="nutrition-modal-title">选择营养信息模板</text>
          <button class="close-btn" @click="closeNutritionModal">✕</button>
        </view>

        <view class="nutrition-modal-body">
          <view class="template-grid">
            <view 
              v-for="template in nutritionTemplates" 
              :key="template.name"
              class="template-item"
              @click="selectNutritionTemplate(template)"
            >
              <text class="template-name">{{ template.name }}</text>
              <view class="template-nutrition">
                <text class="nutrition-item">卡路里: {{ template.calories }}</text>
                <text class="nutrition-item">蛋白质: {{ template.protein }}g</text>
                <text class="nutrition-item">脂肪: {{ template.fat }}g</text>
                <text class="nutrition-item">碳水: {{ template.carbohydrate }}g</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Dish编辑Modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dish: {
      type: Object,
      default: null
    },
    categories: {
      type: Array,
      default: () => []
    },
    is编辑: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 在Options API中直接定义响应式数据
      formData: {
        name: '',
        description: '',
        categoryId: '',
        price: '',
        calories: '',
        protein: '',
        fat: '',
        carbohydrate: '',
        image: '',
        isRecommended: false,
        tags: [],
        status: 'active'
      },
      newTag: '',
      showNutritionModal: false,
      nutritionTemplates: [
        { name: '米饭', calories: 130, protein: 2.7, fat: 0.3, carbohydrate: 28.2 },
        { name: '面条', calories: 131, protein: 5.0, fat: 1.1, carbohydrate: 25.0 },
        { name: '鸡蛋', calories: 155, protein: 13.0, fat: 11.0, carbohydrate: 1.1 },
        { name: '猪肉', calories: 143, protein: 20.3, fat: 6.2, carbohydrate: 0 },
        { name: '牛肉', calories: 250, protein: 26.0, fat: 15.0, carbohydrate: 0 },
        { name: '鸡肉', calories: 165, protein: 31.0, fat: 3.6, carbohydrate: 0 },
        { name: '鱼肉', calories: 206, protein: 22.0, fat: 12.0, carbohydrate: 0 },
        { name: '豆腐', calories: 76, protein: 8.1, fat: 4.2, carbohydrate: 1.9 },
        { name: '青菜', calories: 25, protein: 2.9, fat: 0.3, carbohydrate: 4.3 },
        { name: '土豆', calories: 77, protein: 2.0, fat: 0.1, carbohydrate: 17.5 }
      ]
    }
  },
  computed: {
    // 简化分类选项处理，确保所有分类都显示
    categoryOptions() {
      // 确保总是返回一个有默认分类的数组
      // 默认分类 - 使用有效的UUID格式ID
      const defaultCategories = [
        { id: '846dad48-b408-4c44-ba27-00f4d193fcf6', name: '主食' },
        { id: '4a100eca-009d-465f-b785-b237a75fa4f0', name: '素菜' },
        { id: 'fb195e2c-ed19-4ee7-a169-5e4f2db2af33', name: '荤菜' },
        { id: '3e50e11e-3c9c-4a64-a575-8e931ad6b722', name: '汤品' },
        { id: 'e55c23bc-3a41-45fe-b94c-ffbccfdf6edb', name: '饮品' }
      ]
      
      // 如果有传入分类，合并到默认分类中
      if (this.categories && Array.isArray(this.categories)) {
        // 创建一个Map来避免重复ID
        const categoryMap = new Map()
        
        // 先添加默认分类到Map
        defaultCategories.forEach(cat => {
          categoryMap.set(cat.id, cat)
        })
        
        // 再添加传入的分类（如有相同ID，会覆盖默认分类）
        this.categories.forEach(cat => {
          if (cat && cat.id && cat.name) {
            const id = String(cat.id)
            categoryMap.set(id, { id: id, name: cat.name })
          }
        })
        
        return Array.from(categoryMap.values())
      }
      
      // 如果没有传入分类，直接返回默认分类
      return defaultCategories
    },
    
    // 用于模板中统一比较分类ID的计算属性
    selectedCategoryId() {
      return String(this.formData.categoryId)
    },
    
    can保存() {
      return this.formData.name.trim() && 
             this.formData.categoryId && 
             this.formData.price > 0
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm()
      }
    },
    dish: {
      handler() {
        if (this.visible) {
          this.initializeForm()
        }
      },
      deep: true
    }
  },
  methods: {
    initializeForm() {
      console.log('初始化表单', { is编辑: this.is编辑, dish: this.dish, categories: this.categories })
      
      if (this.is编辑 && this.dish) {
        // 编辑模式 - 逐个更新属性，保持响应性
        // 增加数据结构兼容性处理
        const dishData = this.dish
        this.formData.name = dishData.name || dishData.title || dishData.dishName || ''
        this.formData.description = dishData.description || dishData.desc || ''
        
        // 处理分类ID，确保是字符串
        const categoryId = dishData.categoryId || dishData.category || ''
        this.formData.categoryId = String(categoryId)
        
        // 处理价格，确保正确显示
        const price = dishData.price || dishData.cost || dishData.value || ''
        // 转换为字符串以保持输入框的正确显示格式
        this.formData.price = price !== '' ? String(price) : ''
        
        this.formData.calories = dishData.calories || ''
        this.formData.protein = dishData.protein || ''
        this.formData.fat = dishData.fat || ''
        this.formData.carbohydrate = dishData.carbohydrate || ''
        this.formData.image = dishData.image || dishData.img || ''
        this.formData.isRecommended = dishData.isRecommended || dishData.recommended || false
        this.formData.tags = Array.isArray(dishData.tags) ? [...dishData.tags] : []
        this.formData.status = dishData.status || 'active'
      } else {
        // 新建模式 - 逐个重置属性，保持响应性
        this.formData.name = ''
        this.formData.description = ''
        this.formData.categoryId = ''
        this.formData.price = ''
        this.formData.calories = ''
        this.formData.protein = ''
        this.formData.fat = ''
        this.formData.carbohydrate = ''
        this.formData.image = ''
        this.formData.isRecommended = false
        this.formData.tags = []
        this.formData.status = 'active'
      }
      
      console.log('表单数据初始化完成', this.formData)
      console.log('分类选项:', this.categoryOptions)
    },

    // 分类选择逻辑
    selectCategory(category) {
      // 确保设置字符串类型的分类ID
      const categoryId = String(category.id)
      console.log('选择分类:', category, '分类ID:', categoryId)
      this.formData.categoryId = categoryId
    },

    // 按照uni-app/微信小程序规范处理输入事件
    handleNameInput(e) {
      this.formData.name = e.detail.value;
      console.log('菜品名称输入:', e.detail.value)
    },

    handleDescriptionInput(e) {
      this.formData.description = e.detail.value;
      console.log('菜品描述输入:', e.detail.value)
    },

    handlePriceInput(e) {
      let value = e.detail.value;
      // 添加价格验证，确保是数字且不小于0
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        this.formData.price = value;
        console.log('价格输入:', value)
      }
    },

    handleCaloriesInput(e) {
      let value = e.detail.value;
      // 添加验证，确保是数字且不小于0
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        this.formData.calories = value;
        console.log('卡路里输入:', value)
      }
    },

    handleProteinInput(e) {
      let value = e.detail.value;
      // 添加验证，确保是数字且不小于0
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        this.formData.protein = value;
        console.log('蛋白质输入:', value)
      }
    },

    handleFatInput(e) {
      let value = e.detail.value;
      // 添加验证，确保是数字且不小于0
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        this.formData.fat = value;
        console.log('脂肪输入:', value)
      }
    },

    handleCarbohydrateInput(e) {
      let value = e.detail.value;
      // 添加验证，确保是数字且不小于0
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        this.formData.carbohydrate = value;
        console.log('碳水化合物输入:', value)
      }
    },

    // 菜品状态设置
    setDishStatus(status) {
      this.formData.status = status;
      console.log('设置菜品状态:', status)
    },

    // 标签管理
    addTag() {
      const tag = this.newTag.trim();
      if (tag && !this.formData.tags.includes(tag)) {
        this.formData.tags.push(tag);
        console.log('添加标签:', tag)
      }
      this.newTag = '';
    },

    removeTag(index) {
      const removedTag = this.formData.tags.splice(index, 1);
      console.log('移除标签:', removedTag)
    },

    // 处理标签输入
    handleTagInput(e) {
      this.newTag = e.detail.value;
      console.log('标签输入:', e.detail.value)
    },



    onRecommendChange(e) {
      // 确保获取到正确的开关状态值
      const value = e && e.detail && typeof e.detail.value !== 'undefined' ? e.detail.value : false
      console.log('推荐状态改变为:', value)
      this.formData.isRecommended = value
    },

    showNutritionTemplates() {
      this.showNutritionModal = true
    },

    selectNutritionTemplate(template) {
      this.formData.calories = template.calories
      this.formData.protein = template.protein
      this.formData.fat = template.fat
      this.formData.carbohydrate = template.carbohydrate
      this.showNutritionModal = false
      
      uni.showToast({
        title: `已应用${template.name}营养信息`,
        icon: 'success'
      })
    },

    closeNutritionModal() {
      this.showNutritionModal = false
    },

    async uploadImage() {
      try {
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        })
        
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          const imagePath = res.tempFilePaths[0]
          // 这里应该调用图片上传API
          // 暂时使用本地路径
          this.formData.image = imagePath
        }
      } catch (error) {
        console.error('选择图片失败:', error)
      }
    },

    handle提交() {
      // 菜品名称验证
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入菜品名称',
          icon: 'none'
        })
        // 聚焦到名称输入框
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus()
        }
        return
      }
      
      // 分类选择验证
      if (!this.formData.categoryId) {
        uni.showToast({
          title: '请选择菜品分类',
          icon: 'none'
        })
        return
      }
      
      // 价格验证
      if (!this.formData.price || Number(this.formData.price) <= 0) {
        uni.showToast({
          title: '请输入有效的价格',
          icon: 'none'
        })
        // 聚焦到价格输入框
        if (this.$refs.priceInput) {
          this.$refs.priceInput.focus()
        }
        return
      }

      const dishData = {
        name: this.formData.name.trim(),
        description: this.formData.description.trim(),
        categoryId: this.formData.categoryId,
        price: Number(this.formData.price),
        calories: this.formData.calories ? Number(this.formData.calories) : undefined,
        protein: this.formData.protein ? Number(this.formData.protein) : undefined,
        fat: this.formData.fat ? Number(this.formData.fat) : undefined,
        carbohydrate: this.formData.carbohydrate ? Number(this.formData.carbohydrate) : undefined,
        image: this.formData.image || undefined,
        isRecommended: this.formData.isRecommended,
        tags: this.formData.tags,
        status: this.formData.status
      }

      this.$emit('save', dishData)
    },

    close() {
      this.$emit('close')
    },

    handleOverlayClick() {
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  overflow: hidden;
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
  background: none;
  border: none;
}

.modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6rpx;
  padding: 8rpx 16rpx;
  font-size: 22rpx;
}

.form-item {
  margin-bottom: 30rpx;
  transition: all 0.3s ease;
}

.form-label {
  font-size: 26rpx;
  color: #555;
  margin-bottom: 10rpx;
  display: block;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 22rpx 26rpx;
  background: white;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  position: relative;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.tag-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.add-tag-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.add-tag-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-input:focus, .form-textarea:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.2);
  transform: translateY(-2rpx);
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.form-textarea {
  min-height: 100rpx;
  padding-top: 10rpx;
  resize: none;
}

.char-count {
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
  text-align: right;
}

.debug-text {
  font-size: 20rpx;
  color: #ff6b6b;
  margin-top: 5rpx;
  display: none; /* 隐藏调试信息 */
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item.selected {
  background: #e3f2fd;
  border-color: #667eea;
}

.category-radio {
  margin-right: 12rpx;
}

.radio {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.3s ease;
}

.radio.checked {
  border-color: #667eea;
}

.radio-dot {
  width: 16rpx;
  height: 16rpx;
  background: #667eea;
  border-radius: 50%;
}

.category-name {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.nutrition-item {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 8rpx;
  text-align: center;
}

.nutrition-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.nutrition-input {
  font-size: 28rpx;
  color: #333;
  text-align: center;
  background: none;
  border: none;
  width: 100%;
  position: relative;
  z-index: 1;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.upload-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 15rpx 25rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.upload-icon {
  font-size: 28rpx;
}

.preview-image {
  width: 100%;
  height: 150rpx;
  border-radius: 8rpx;
  margin-top: 10rpx;
  object-fit: cover;
}

.modal-footer {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 30rpx;
  border-top: 2rpx solid #eee;
}

.modal-btn {
  padding: 22rpx 40rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  transition: all 0.3s ease;
  min-width: 200rpx;
  font-weight: 500;
}

.modal-btn:active {
  transform: scale(0.96);
}

.modal-btn.secondary {
  background: #f8f9fa;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.modal-btn.primary {
  background: #667eea;
  color: white;
}

.modal-btn:disabled {
  background: #ccc;
  color: #999;
}

/* 营养信息模板弹窗 */
.nutrition-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
}

.nutrition-modal-content {
  background: white;
  border-radius: 20rpx;
  width: 90%;
  max-width: 700rpx;
  max-height: 80%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.nutrition-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #eee;
}

.nutrition-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nutrition-modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.template-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.template-item:active {
  transform: scale(0.98);
  background: #e9ecef;
  border-color: #667eea;
}

.template-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.template-nutrition {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.nutrition-item {
  font-size: 22rpx;
  color: #666;
}

/* 状态选择样式 */
.status-options {
  display: flex;
  gap: 30rpx;
  margin-top: 10rpx;
}

.status-option {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 6rpx;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-option.selected {
  border-color: #667eea;
  background: #e3f2fd;
}

.status-radio {
  font-size: 24rpx;
  color: #667eea;
  margin-right: 10rpx;
}

.status-text {
  font-size: 26rpx;
  color: #333;
}

/* 标签样式 */
.tags-input-wrapper {
  margin-bottom: 20rpx;
}

.tag-input {
  width: 100%;
  padding: 20rpx 26rpx;
  background: white;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;
  box-sizing: border-box;
}

.tag-input:focus {
  border-color: #667eea;
  outline: none;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background: #667eea;
  color: white;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.tag-text {
  margin-right: 8rpx;
}

.tag-remove {
  font-size: 28rpx;
  line-height: 1;
  cursor: pointer;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .nutrition-grid {
    grid-template-columns: 1fr;
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .category-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .status-options {
    flex-direction: column;
    gap: 15rpx;
  }
}
</style>