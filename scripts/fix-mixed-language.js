#!/usr/bin/env node

/**
 * 修复中英文混杂问题
 * 将不合适的英文替换回中文，保持界面的一致性
 */

const fs = require('fs');
const path = require('path');

// 需要恢复为中文的映射表
const ENGLISH_TO_CHINESE = {
  // 用户界面相关
  'User': '用户',
  'Admin': '管理员', 
  'Department': '部门',
  'Info': '信息',
  'Edit': '编辑',
  'Modify': '修改',
  'Confirm': '确认',
  'Verify': '验证',
  
  // 状态相关
  'Success': '成功',
  'Failed': '失败',
  'Error': '错误',
  'Warning': '警告',
  'Info': '信息',
  
  // 操作相关
  'Save': '保存',
  'Cancel': '取消',
  'Delete': '删除',
  'Add': '添加',
  'Reset': '重置',
  'Submit': '提交',
  
  // 时间相关
  'Today': '今天',
  'Yesterday': '昨天',
  'Tomorrow': '明天',
  'This Week': '本周',
  'This Month': '本月',
  
  // 部门相关
  'HR Department': '人事部',
  'Technology Department': '技术部',
  'Finance Department': '财务部',
  
  // 其他
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
  
  // 表单相关
  'Please enter': '请输入',
  'Required': '必填',
  'Optional': '可选',
  
  // 密码强度相关 - 这些保持英文，因为已经在CSS中处理
  'Weak': '弱',
  'Fair': '一般', 
  'Good': '良好',
  'Strong': '强',
  'Password Strength:': '密码强度：'
};

/**
 * 修复文件中的中英文混杂问题
 * @param {string} filePath 文件路径
 */
function fixMixedLanguageInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 替换不合适的英文为中文
    Object.entries(ENGLISH_TO_CHINESE).forEach(([english, chinese]) => {
      const regex = new RegExp(english, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, chinese);
        modified = true;
        console.log(`  ✓ 替换 "${english}" -> "${chinese}"`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ 文件已修复: ${filePath}`);
    } else {
      console.log(`  ℹ️  文件无需修复: ${filePath}`);
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
        
        const modified = fixMixedLanguageInFile(filePath);
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
 * 调整底部导航栏字体大小
 */
function adjustBottomNavFontSize() {
  const pagesJsonPath = path.join(__dirname, '../src/pages.json');
  
  try {
    let content = fs.readFileSync(pagesJsonPath, 'utf8');
    const pagesConfig = JSON.parse(content);
    
    // 检查是否有tabBar配置
    if (pagesConfig.tabBar && pagesConfig.tabBar.list) {
      // 为tabBar添加字体大小配置
      pagesConfig.tabBar.fontSize = '28rpx';
      pagesConfig.tabBar.selectedFontSize = '30rpx';
      
      // 确保每个tab项都有合适的配置
      pagesConfig.tabBar.list.forEach(tab => {
        if (!tab.text) {
          tab.text = tab.pagePath.split('/').pop() || '未知';
        }
      });
      
      const updatedContent = JSON.stringify(pagesConfig, null, 2);
      fs.writeFileSync(pagesJsonPath, updatedContent, 'utf8');
      
      console.log('✅ 已调整底部导航栏字体大小');
      console.log('   - 默认字体大小: 28rpx');
      console.log('   - 选中字体大小: 30rpx');
    }
  } catch (error) {
    console.error('❌ 调整底部导航栏字体大小失败:', error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始修复中英文混杂问题...\n');
  
  const srcDir = path.join(__dirname, '../src');
  
  // 检查源文件目录是否存在
  if (!fs.existsSync(srcDir)) {
    console.error('❌ 源文件目录不存在:', srcDir);
    process.exit(1);
  }
  
  // 处理源文件
  console.log('📁 处理源文件目录:', srcDir);
  const stats = processDirectory(srcDir);
  
  // 调整底部导航栏字体大小
  console.log('\n🔧 调整底部导航栏字体大小...');
  adjustBottomNavFontSize();
  
  // 输出统计结果
  console.log('\n📊 处理结果统计:');
  console.log(`  总文件数: ${stats.total}`);
  console.log(`  修改文件数: ${stats.modified}`);
  console.log(`  错误数: ${stats.errors}`);
  
  console.log('\n🎉 中英文混杂问题修复完成！');
  
  if (stats.modified > 0) {
    console.log('\n📝 建议后续操作:');
    console.log('  1. 重新编译项目: npm run build:mp-weixin');
    console.log('  2. 检查界面显示是否恢复正常');
    console.log('  3. 测试微信小程序是否正常编译');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  fixMixedLanguageInFile,
  processDirectory,
  adjustBottomNavFontSize,
  ENGLISH_TO_CHINESE
};
