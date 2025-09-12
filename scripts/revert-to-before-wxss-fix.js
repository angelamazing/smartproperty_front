#!/usr/bin/env node

/**
 * 回退到第一次修复微信编译问题之前的状态
 * 这个脚本将项目完全回退到修复微信小程序WXSS编译错误之前的状态
 */

const fs = require('fs');
const path = require('path');

/**
 * 恢复change-password.vue中的CSS样式
 */
function restoreChangePasswordCSS() {
  console.log('\n🔧 恢复change-password.vue中的CSS样式...');
  
  const changePasswordFile = path.join(__dirname, '../src/pages/change-password/change-password.vue');
  
  try {
    let content = fs.readFileSync(changePasswordFile, 'utf8');
    let modified = false;
    
    // 恢复CSS伪类选择器
    if (content.includes('/* .visibility-toggle:hover')) {
      content = content.replace(
        '/* .visibility-toggle:hover',
        '.visibility-toggle:hover'
      );
      content = content.replace(
        '} */',
        '}'
      );
      modified = true;
      console.log('  ✓ 恢复了 .visibility-toggle:hover 伪类');
    }
    
    if (content.includes('/* .submit-btn:hover')) {
      content = content.replace(
        '/* .submit-btn:hover',
        '.submit-btn:hover'
      );
      content = content.replace(
        '} */',
        '}'
      );
      modified = true;
      console.log('  ✓ 恢复了 .submit-btn:hover 伪类');
    }
    
    // 恢复box-shadow属性
    if (content.includes('/* box-shadow: 0 2px 8px rgba(0,0,0,0.1); */')) {
      content = content.replace(
        '/* box-shadow: 0 2px 8px rgba(0,0,0,0.1); */',
        'box-shadow: 0 2px 8px rgba(0,0,0,0.1);'
      );
      modified = true;
      console.log('  ✓ 恢复了 .form-section 的 box-shadow');
    }
    
    if (content.includes('/* box-shadow: 0 1px 3px rgba(0,0,0,0.1); */')) {
      content = content.replace(
        '/* box-shadow: 0 1px 3px rgba(0,0,0,0.1); */',
        'box-shadow: 0 1px 3px rgba(0,0,0,0.1);'
      );
      modified = true;
      console.log('  ✓ 恢复了 .input-field 的 box-shadow');
    }
    
    if (content.includes('/* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */')) {
      content = content.replace(
        '/* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */',
        'box-shadow: 0 2px 4px rgba(0,0,0,0.1);'
      );
      modified = true;
      console.log('  ✓ 恢复了 .submit-btn 的 box-shadow');
    }
    
    // 恢复中文注释
    if (content.includes('/* Form section styles */')) {
      content = content.replace(
        '/* Form section styles */',
        '/* 表单区域样式 */'
      );
      modified = true;
      console.log('  ✓ 恢复了中文注释');
    }
    
    if (modified) {
      fs.writeFileSync(changePasswordFile, content, 'utf8');
      console.log('  ✅ change-password.vue CSS样式已恢复');
    } else {
      console.log('  ℹ️  change-password.vue CSS样式无需恢复');
    }
    
  } catch (error) {
    console.error('  ❌ 恢复change-password.vue CSS样式失败:', error.message);
  }
}

/**
 * 恢复所有Vue文件中的中文界面文本
 */
function restoreChineseText() {
  console.log('\n🔧 恢复所有Vue文件中的中文界面文本...');
  
  // 需要恢复的英文到中文映射
  const ENGLISH_TO_CHINESE = {
    'User': '用户',
    'Admin': '管理员',
    'Department': '部门',
    'Info': '信息',
    'Edit': '编辑',
    'Modify': '修改',
    'Confirm': '确认',
    'Verify': '验证',
    'Success': '成功',
    'Failed': '失败',
    'Error': '错误',
    'Warning': '警告',
    'Save': '保存',
    'Cancel': '取消',
    'Delete': '删除',
    'Add': '添加',
    'Reset': '重置',
    'Submit': '提交',
    'Today': '今天',
    'Yesterday': '昨天',
    'Tomorrow': '明天',
    'This Week': '本周',
    'This Month': '本月',
    'Yes': '是',
    'No': '否',
    'On': '开启',
    'Off': '关闭',
    'Enabled': '启用',
    'Disabled': '禁用',
    'Normal': '正常',
    'Abnormal': '异常',
    'Active': '活跃',
    'Inactive': '非活跃',
    'Please enter': '请输入',
    'Required': '必填',
    'Optional': '可选',
    'Weak': '弱',
    'Fair': '一般',
    'Good': '良好',
    'Strong': '强',
    'Password Strength:': '密码强度：'
  };
  
  const srcDir = path.join(__dirname, '../src');
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  function processDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (file === 'node_modules' || file === 'dist' || file === '.git') {
            return;
          }
          processDirectory(filePath);
        } else if (file.endsWith('.vue')) {
          totalFiles++;
          let content = fs.readFileSync(filePath, 'utf8');
          let modified = false;
          
          Object.entries(ENGLISH_TO_CHINESE).forEach(([english, chinese]) => {
            const regex = new RegExp(english, 'g');
            if (regex.test(content)) {
              content = content.replace(regex, chinese);
              modified = true;
            }
          });
          
          if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            modifiedFiles++;
            console.log(`  ✓ 恢复文件: ${filePath}`);
          }
        }
      });
    } catch (error) {
      console.error(`  ❌ 处理目录失败: ${dir}`, error.message);
    }
  }
  
  processDirectory(srcDir);
  console.log(`  ✅ 中文界面文本已恢复 (${modifiedFiles}/${totalFiles} 文件)`);
}

/**
 * 重新创建部门编辑页面
 */
function recreateDepartmentEditPage() {
  console.log('\n🔧 重新创建部门编辑页面...');
  
  const deptEditFile = path.join(__dirname, '../src/pages/admin/dept-edit.vue');
  
  // 部门编辑页面的完整内容
  const deptEditContent = `<template>
  <view class="dept-edit-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">{{ isEdit ? '编辑部门' : '新建部门' }}</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <view class="form-section">
        <text class="section-title">基本信息</text>
        
        <view class="form-item">
          <view class="input-container">
            <text class="input-label">部门名称 <text class="required">*</text></text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'name', 'error': formErrors.name }">
                <input 
                  class="input-text"
                  :value="formData.name"
                  @input="handleNameInput"
                  placeholder="请输入部门名称"
                  maxlength="50"
                  @focus="onFieldFocus('name')"
                  @blur="onFieldBlur('name')"
                />
              </view>
              <view class="input-footer">
                <text v-if="formErrors.name" class="error-message">{{ formErrors.name }}</text>
                <text class="char-counter">{{ formData.name.length }}/50</text>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="input-container">
            <text class="input-label">部门编码 <text class="required">*</text></text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'code', 'error': formErrors.code }">
                <input 
                  class="input-text"
                  :value="formData.code"
                  @input="handleCodeInput"
                  placeholder="请输入部门编码"
                  maxlength="20"
                  @focus="onFieldFocus('code')"
                  @blur="onFieldBlur('code')"
                />
              </view>
              <view class="input-footer">
                <text v-if="formErrors.code" class="error-message">{{ formErrors.code }}</text>
                <text class="char-counter">{{ formData.code.length }}/20</text>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="input-container">
            <text class="input-label">部门描述</text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'description' }">
                <textarea 
                  class="input-textarea"
                  :value="formData.description"
                  @input="handleDescriptionInput"
                  placeholder="请输入部门描述"
                  maxlength="200"
                  @focus="onFieldFocus('description')"
                  @blur="onFieldBlur('description')"
                />
              </view>
              <view class="input-footer">
                <text class="char-counter">{{ formData.description.length }}/200</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">其他信息</text>
        
        <view class="form-item">
          <view class="input-container">
            <text class="input-label">排序值</text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'sort' }">
                <input 
                  class="input-text"
                  type="number"
                  :value="formData.sort"
                  @input="handleSortInput"
                  placeholder="请输入排序值"
                  @focus="onFieldFocus('sort')"
                  @blur="onFieldBlur('sort')"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="action-btn cancel-btn" @click="goBack">取消</button>
      <button class="action-btn save-btn" @click="saveDepartment" :disabled="!canSave">保存</button>
    </view>
  </view>
</template>

<script>
import { createDepartment, updateDepartment, getDepartmentDetail } from '@/utils/api'

export default {
  name: 'DeptEdit',
  data() {
    return {
      isEdit: false,
      departmentId: null,
      focusedField: null,
      formData: {
        name: '',
        code: '',
        description: '',
        sort: 0
      },
      formErrors: {
        name: '',
        code: ''
      }
    }
  },
  computed: {
    canSave() {
      return this.formData.name.trim() && 
             this.formData.code.trim() && 
             !this.formErrors.name && 
             !this.formErrors.code
    }
  },
  onLoad(options) {
    this.isEdit = options.action === 'edit'
    this.departmentId = options.id
    
    if (this.isEdit && this.departmentId) {
      this.loadDepartmentDetail()
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载部门详情
    async loadDepartmentDetail() {
      try {
        const response = await getDepartmentDetail(this.departmentId)
        if (response.success) {
          this.formData = {
            name: response.data.name || '',
            code: response.data.code || '',
            description: response.data.description || '',
            sort: response.data.sort || 0
          }
        }
      } catch (error) {
        console.error('加载部门详情失败:', error)
        uni.showToast({
          title: '加载部门详情失败',
          icon: 'none'
        })
      }
    },
    
    // 字段聚焦
    onFieldFocus(field) {
      this.focusedField = field
    },
    
    // 字段失焦
    onFieldBlur(field) {
      this.focusedField = null
      this.validateField(field)
    },
    
    // 验证字段
    validateField(field) {
      switch (field) {
        case 'name':
          if (!this.formData.name.trim()) {
            this.formErrors.name = '部门名称不能为空'
          } else if (this.formData.name.length < 2) {
            this.formErrors.name = '部门名称至少2个字符'
          } else {
            this.formErrors.name = ''
          }
          break
        case 'code':
          if (!this.formData.code.trim()) {
            this.formErrors.code = '部门编码不能为空'
          } else if (!/^[A-Z_]+$/.test(this.formData.code)) {
            this.formErrors.code = '部门编码只能包含大写字母和下划线'
          } else {
            this.formErrors.code = ''
          }
          break
      }
    },
    
    // 处理名称输入
    handleNameInput(e) {
      this.formData.name = e.detail.value
      this.validateField('name')
    },
    
    // 处理编码输入
    handleCodeInput(e) {
      this.formData.code = e.detail.value.toUpperCase()
      this.validateField('code')
    },
    
    // 处理描述输入
    handleDescriptionInput(e) {
      this.formData.description = e.detail.value
    },
    
    // 处理排序输入
    handleSortInput(e) {
      this.formData.sort = parseInt(e.detail.value) || 0
    },
    
    // 保存部门
    async saveDepartment() {
      if (!this.canSave) {
        uni.showToast({
          title: '请完善必填信息',
          icon: 'none'
        })
        return
      }
      
      try {
        const data = {
          name: this.formData.name.trim(),
          code: this.formData.code.trim(),
          description: this.formData.description.trim(),
          sort: this.formData.sort
        }
        
        let response
        if (this.isEdit) {
          response = await updateDepartment(this.departmentId, data)
        } else {
          response = await createDepartment(data)
        }
        
        if (response.success) {
          uni.showToast({
            title: this.isEdit ? '更新部门成功' : '创建部门成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '操作失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存部门失败:', error)
        uni.showToast({
          title: '保存部门失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.dept-edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #667eea;
  color: white;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 36rpx;
  margin-right: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
}

.form-container {
  padding: 30rpx;
}

.form-section {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.input-container {
  width: 100%;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.required {
  color: #ff4757;
}

.input-field-wrapper {
  width: 100%;
}

.input-field {
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.input-field.focused {
  border-color: #667eea;
  background-color: white;
}

.input-field.error {
  border-color: #ff4757;
}

.input-text {
  width: 100%;
  font-size: 28rpx;
  color: #333;
  background: none;
  border: none;
  outline: none;
}

.input-textarea {
  width: 100%;
  min-height: 120rpx;
  font-size: 28rpx;
  color: #333;
  background: none;
  border: none;
  outline: none;
  resize: none;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.error-message {
  font-size: 24rpx;
  color: #ff4757;
}

.char-counter {
  font-size: 24rpx;
  color: #999;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 30rpx;
  background-color: white;
  border-top: 1rpx solid #e0e0e0;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  margin: 0 10rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.save-btn {
  background-color: #667eea;
  color: white;
}

.save-btn:disabled {
  background-color: #ccc;
  color: #999;
}
</style>`;
  
  try {
    fs.writeFileSync(deptEditFile, deptEditContent, 'utf8');
    console.log('  ✓ 重新创建了部门编辑页面: dept-edit.vue');
  } catch (error) {
    console.error('  ❌ 重新创建部门编辑页面失败:', error.message);
  }
}

/**
 * 恢复pages.json中的部门编辑页面路由
 */
function restoreDepartmentEditRoute() {
  console.log('\n🔧 恢复pages.json中的部门编辑页面路由...');
  
  const pagesJsonFile = path.join(__dirname, '../src/pages.json');
  
  try {
    let content = fs.readFileSync(pagesJsonFile, 'utf8');
    const pagesConfig = JSON.parse(content);
    
    // 检查是否已经有部门编辑页面
    const deptEditPage = pagesConfig.pages.find(page => 
      page.path === 'pages/admin/dept-edit'
    );
    
    if (!deptEditPage) {
      // 添加部门编辑页面
      pagesConfig.pages.push({
        "path": "pages/admin/dept-edit",
        "style": {
          "navigationBarTitleText": "部门编辑",
          "navigationBarBackgroundColor": "#667eea",
          "navigationBarTextStyle": "white"
        }
      });
      
      const updatedContent = JSON.stringify(pagesConfig, null, 2);
      fs.writeFileSync(pagesJsonFile, updatedContent, 'utf8');
      console.log('  ✓ 恢复了部门编辑页面路由');
    } else {
      console.log('  ℹ️  部门编辑页面路由已存在');
    }
  } catch (error) {
    console.error('  ❌ 恢复部门编辑页面路由失败:', error.message);
  }
}

/**
 * 恢复API地址
 */
function restoreAPIAddress() {
  console.log('\n🔧 恢复API地址...');
  
  const apiFile = path.join(__dirname, '../src/utils/api.js');
  
  try {
    let content = fs.readFileSync(apiFile, 'utf8');
    let modified = false;
    
    // 恢复API地址
    if (content.includes('PROD_BASE_URL: \'https://uauotggfeiao.sealosbja.site\'')) {
      content = content.replace(
        'PROD_BASE_URL: \'https://uauotggfeiao.sealosbja.site\'',
        'PROD_BASE_URL: \'https://jamgqxlbeeho.sealosbja.site\''
      );
      modified = true;
      console.log('  ✓ 恢复了API地址');
    }
    
    if (modified) {
      fs.writeFileSync(apiFile, content, 'utf8');
      console.log('  ✅ API地址已恢复');
    } else {
      console.log('  ℹ️  API地址无需恢复');
    }
    
  } catch (error) {
    console.error('  ❌ 恢复API地址失败:', error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔄 开始回退到第一次修复微信编译问题之前的状态...\n');
  
  // 执行各项恢复操作
  restoreChangePasswordCSS();
  restoreChineseText();
  recreateDepartmentEditPage();
  restoreDepartmentEditRoute();
  restoreAPIAddress();
  
  console.log('\n🎉 回退到第一次修复微信编译问题之前的状态完成！');
  console.log('\n📝 恢复内容总结:');
  console.log('  1. 恢复了change-password.vue中的CSS样式');
  console.log('  2. 恢复了所有Vue文件中的中文界面文本');
  console.log('  3. 重新创建了部门编辑页面');
  console.log('  4. 恢复了部门编辑页面路由');
  console.log('  5. 恢复了API地址');
  
  console.log('\n✅ 项目现在处于第一次修复微信编译问题之前的状态');
  console.log('    - 界面显示中文');
  console.log('    - CSS样式完整（包括box-shadow、:hover等）');
  console.log('    - 部门管理功能完整');
  console.log('    - API地址正确');
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  restoreChangePasswordCSS,
  restoreChineseText,
  recreateDepartmentEditPage,
  restoreDepartmentEditRoute,
  restoreAPIAddress
};
