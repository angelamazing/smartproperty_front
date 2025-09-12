#!/usr/bin/env node

/**
 * 回退中英文混杂修复
 * 将中文恢复为英文，回到修复前的状态
 */

const fs = require('fs');
const path = require('path');

// 需要恢复为英文的映射表（与fix-mixed-language.js相反）
const CHINESE_TO_ENGLISH = {
  // 用户界面相关
  '用户': 'User',
  '管理员': 'Admin', 
  '部门': 'Department',
  '信息': 'Info',
  '编辑': 'Edit',
  '修改': 'Modify',
  '确认': 'Confirm',
  '验证': 'Verify',
  
  // 状态相关
  '成功': 'Success',
  '失败': 'Failed',
  '错误': 'Error',
  '警告': 'Warning',
  
  // 操作相关
  '保存': 'Save',
  '取消': 'Cancel',
  '删除': 'Delete',
  '添加': 'Add',
  '重置': 'Reset',
  '提交': 'Submit',
  
  // 时间相关
  '今天': 'Today',
  '昨天': 'Yesterday',
  '明天': 'Tomorrow',
  '本周': 'This Week',
  '本月': 'This Month',
  
  // 部门相关
  '人事部': 'HR Department',
  '技术部': 'Technology Department',
  '财务部': 'Finance Department',
  
  // 其他
  '是': 'Yes',
  '否': 'No',
  '开启': 'On',
  '关闭': 'Off',
  '启用': 'Enabled',
  '禁用': 'Disabled',
  '正常': 'Normal',
  '异常': 'Abnormal',
  '活跃': 'Active',
  '非活跃': 'Inactive',
  
  // 表单相关
  '请输入': 'Please enter',
  '必填': 'Required',
  '可选': 'Optional',
  
  // 密码强度相关
  '弱': 'Weak',
  '一般': 'Fair', 
  '良好': 'Good',
  '强': 'Strong',
  '密码强度：': 'Password Strength:'
};

/**
 * 回退文件中的中英文混杂修复
 * @param {string} filePath 文件路径
 */
function revertMixedLanguageInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 替换中文为英文
    Object.entries(CHINESE_TO_ENGLISH).forEach(([chinese, english]) => {
      const regex = new RegExp(chinese, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, english);
        modified = true;
        console.log(`  ✓ 回退 "${chinese}" -> "${english}"`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ 文件已回退: ${filePath}`);
    } else {
      console.log(`  ℹ️  文件无需回退: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`  ❌ 处理文件失败: ${filePath}`, error.message);
    return false;
  }
}

/**
 * 递归处理目录中的所有Vue文件
 * @param {string} dir 目录路径
 * @returns {Object} 处理结果统计
 */
function processDirectory(dir) {
  const stats = {
    total: 0,
    modified: 0,
    errors: 0
  };
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // 跳过node_modules和dist目录
        if (file === 'node_modules' || file === 'dist' || file === '.git') {
          return;
        }
        
        const subStats = processDirectory(filePath);
        stats.total += subStats.total;
        stats.modified += subStats.modified;
        stats.errors += subStats.errors;
      } else if (file.endsWith('.vue')) {
        stats.total++;
        console.log(`\n📄 处理文件: ${filePath}`);
        
        const modified = revertMixedLanguageInFile(filePath);
        if (modified) {
          stats.modified++;
        }
      }
    });
  } catch (error) {
    console.error(`❌ 处理目录失败: ${dir}`, error.message);
    stats.errors++;
  }
  
  return stats;
}

/**
 * 回退底部导航栏字体大小调整
 */
function revertBottomNavFontSize() {
  const pagesJsonPath = path.join(__dirname, '../src/pages.json');
  
  try {
    let content = fs.readFileSync(pagesJsonPath, 'utf8');
    const pagesConfig = JSON.parse(content);
    
    // 检查是否有tabBar配置
    if (pagesConfig.tabBar && pagesConfig.tabBar.list) {
      // 移除字体大小配置
      delete pagesConfig.tabBar.fontSize;
      delete pagesConfig.tabBar.selectedFontSize;
      
      const updatedContent = JSON.stringify(pagesConfig, null, 2);
      fs.writeFileSync(pagesJsonPath, updatedContent, 'utf8');
      
      console.log('✅ 已回退底部导航栏字体大小调整');
      console.log('   - 移除了自定义字体大小配置');
      console.log('   - 恢复为系统默认字体大小');
    }
  } catch (error) {
    console.error('❌ 回退底部导航栏字体大小调整失败:', error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔄 开始回退中英文混杂修复...\n');
  
  const srcDir = path.join(__dirname, '../src');
  
  // 检查源文件目录是否存在
  if (!fs.existsSync(srcDir)) {
    console.error('❌ 源文件目录不存在:', srcDir);
    process.exit(1);
  }
  
  // 处理源文件
  console.log('📁 处理源文件目录:', srcDir);
  const stats = processDirectory(srcDir);
  
  // 回退底部导航栏字体大小调整
  console.log('\n🔧 回退底部导航栏字体大小调整...');
  revertBottomNavFontSize();
  
  // 输出统计结果
  console.log('\n📊 回退结果统计:');
  console.log(`  总文件数: ${stats.total}`);
  console.log(`  回退文件数: ${stats.modified}`);
  console.log(`  错误数: ${stats.errors}`);
  
  console.log('\n🎉 中英文混杂修复回退完成！');
  
  if (stats.modified > 0) {
    console.log('\n📝 回退内容:');
    console.log('  1. 用户界面词汇恢复为英文');
    console.log('  2. 操作按钮恢复为英文');
    console.log('  3. 状态显示恢复为英文');
    console.log('  4. 底部导航栏字体大小恢复为默认');
    console.log('\n⚠️  注意: 现在界面会显示中英文混杂状态');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  revertMixedLanguageInFile,
  processDirectory,
  revertBottomNavFontSize,
  CHINESE_TO_ENGLISH
};
