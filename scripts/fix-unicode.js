#!/usr/bin/env node

/**
 * Unicode转义字符修复脚本
 * 解决微信小程序WXSS编译错误问题
 */

const fs = require('fs');
const path = require('path');

// 中文字符到英文的映射表
const CHINESE_TO_ENGLISH = {
  // 密码强度相关
  '弱': 'Weak',
  '一般': 'Fair',
  '良好': 'Good', 
  '强': 'Strong',
  '密码强度': 'Password Strength:',
  
  // 状态相关
  '成功': 'Success',
  '失败': 'Failed',
  '错误': 'Error',
  '警告': 'Warning',
  '信息': 'Info',
  
  // 操作相关
  '确认': 'Confirm',
  '取消': 'Cancel',
  '保存': 'Save',
  '删除': 'Delete',
  '编辑': 'Edit',
  '添加': 'Add',
  '修改': 'Modify',
  '提交': 'Submit',
  '重置': 'Reset',
  
  // 表单相关
  '请输入': 'Please enter',
  '必填': 'Required',
  '可选': 'Optional',
  '验证': 'Verify',
  '验证码': 'Verification Code',
  
  // 时间相关
  '今天': 'Today',
  '昨天': 'Yesterday',
  '明天': 'Tomorrow',
  '本周': 'This Week',
  '上周': 'Last Week',
  '本月': 'This Month',
  '上月': 'Last Month',
  
  // 用户相关
  '用户': 'User',
  '管理员': 'Admin',
  '系统管理员': 'System Admin',
  '普通用户': 'Regular User',
  
  // 部门相关
  '部门': 'Department',
  '人事部': 'HR Department',
  '技术部': 'Technology Department',
  '财务部': 'Finance Department',
  
  // 其他常用词汇
  '是': 'Yes',
  '否': 'No',
  '开启': 'On',
  '关闭': 'Off',
  '启用': 'Enabled',
  '禁用': 'Disabled',
  '正常': 'Normal',
  '异常': 'Abnormal',
  '活跃': 'Active',
  '非活跃': 'Inactive'
};

/**
 * 修复文件中的Unicode转义字符
 * @param {string} filePath 文件路径
 */
function fixUnicodeInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 替换中文字符
    Object.entries(CHINESE_TO_ENGLISH).forEach(([chinese, english]) => {
      const regex = new RegExp(chinese, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, english);
        modified = true;
        console.log(`  ✓ 替换 "${chinese}" -> "${english}"`);
      }
    });
    
    // 检查是否还有中文字符
    const chineseRegex = /[\u4e00-\u9fff]/g;
    const chineseMatches = content.match(chineseRegex);
    if (chineseMatches) {
      const uniqueChinese = [...new Set(chineseMatches)];
      console.log(`  ⚠️  发现未处理的中文字符: ${uniqueChinese.join(', ')}`);
    }
    
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
        
        const modified = fixUnicodeInFile(filePath);
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
 * 检查编译后的WXSS文件
 * @param {string} distDir 编译输出目录
 */
function checkCompiledWXSS(distDir) {
  console.log('\n🔍 检查编译后的WXSS文件...');
  
  try {
    const wxssFiles = [];
    
    function findWXSSFiles(dir) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          findWXSSFiles(filePath);
        } else if (file.endsWith('.wxss')) {
          wxssFiles.push(filePath);
        }
      });
    }
    
    findWXSSFiles(distDir);
    
    let hasUnicodeIssues = false;
    
    wxssFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const unicodeMatches = content.match(/\\[0-9a-fA-F]{4}/g);
      
      if (unicodeMatches) {
        console.log(`⚠️  ${filePath} 包含Unicode转义字符: ${unicodeMatches.join(', ')}`);
        hasUnicodeIssues = true;
      }
    });
    
    if (!hasUnicodeIssues) {
      console.log('✅ 所有WXSS文件都没有Unicode转义字符问题');
    }
    
  } catch (error) {
    console.error('❌ 检查WXSS文件失败:', error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始修复Unicode转义字符问题...\n');
  
  const srcDir = path.join(__dirname, '../src');
  const distDir = path.join(__dirname, '../dist/build/mp-weixin');
  
  // 检查源文件目录是否存在
  if (!fs.existsSync(srcDir)) {
    console.error('❌ 源文件目录不存在:', srcDir);
    process.exit(1);
  }
  
  // 处理源文件
  console.log('📁 处理源文件目录:', srcDir);
  const stats = processDirectory(srcDir);
  
  // 输出统计结果
  console.log('\n📊 处理结果统计:');
  console.log(`  总文件数: ${stats.total}`);
  console.log(`  修改文件数: ${stats.modified}`);
  console.log(`  错误数: ${stats.errors}`);
  
  // 检查编译后的文件
  if (fs.existsSync(distDir)) {
    checkCompiledWXSS(distDir);
  } else {
    console.log('\n⚠️  编译目录不存在，跳过WXSS文件检查');
    console.log('   请先运行: npm run build:mp-weixin');
  }
  
  console.log('\n🎉 Unicode转义字符修复完成！');
  
  if (stats.modified > 0) {
    console.log('\n📝 建议后续操作:');
    console.log('  1. 重新编译项目: npm run build:mp-weixin');
    console.log('  2. 测试微信小程序是否正常编译');
    console.log('  3. 检查所有界面显示是否正常');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  fixUnicodeInFile,
  processDirectory,
  checkCompiledWXSS,
  CHINESE_TO_ENGLISH
};
