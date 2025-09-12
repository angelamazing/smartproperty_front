<!--
 * @Author: Jerry Han angelamazing@163.com
 * @Date: 2025-08-28 15:41:46
 * @LastEditors: Jerry Han angelamazing@163.com
 * @LastEditTime: 2025-09-11 16:09:06
 * @FilePath: \my-vue3-project\src\components\form\SwitchField.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="switch-field">
    <switch 
      :checked="isActive" 
      @change="onSwitchChange"
      color="#667eea"
    />
    <text class="switch-text">{{ displayText }}</text>
  </view>
</template>

<script>
export default {
  name: 'SwitchField',
  props: {
    modelValue: {
      type: [String, Boolean],
      default: false
    },
    activeValue: {
      type: [String, Boolean],
      default: true
    },
    inactiveValue: {
      type: [String, Boolean],
      default: false
    },
    activeText: {
      type: String,
      default: '开启'
    },
    inactiveText: {
      type: String,
      default: '关闭'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    isActive() {
      return this.modelValue === this.activeValue
    },
    
    displayText() {
      return this.isActive ? this.activeText : this.inactiveText
    }
  },
  methods: {
    onSwitchChange(e) {
      const newValue = e.detail.value ? this.activeValue : this.inactiveValue
      this.$emit('update:modelValue', newValue)
    }
  }
}
</script>

<style lang="scss" scoped>
.switch-field {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.switch-text {
  font-size: 26rpx;
  color: #666;
}
</style>
