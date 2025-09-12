#!/usr/bin/env node

/**
 * 修复中文函数名和变量名
 * 将中文函数名和变量名修复为英文
 */

const fs = require('fs');
const path = require('path');

// 需要修复的中文到英文映射
const CHINESE_TO_ENGLISH_NAMES = {
  // 函数名
  'testLoginSys管理员': 'testLoginSysAdmin',
  'saveLogin信息': 'saveLoginInfo',
  'showLogin成功信息': 'showLoginSuccessInfo',
  'handleLogin错误': 'handleLoginError',
  'performTestLoginAsSys管理员': 'performTestLoginAsSysAdmin',
  'update用户Avatar': 'updateUserAvatar',
  'getConfirmationErrorMessage': 'getConfirmationErrorMessage',
  
  // 变量名
  'user信息': 'userInfo',
  'system否tice': 'systemNotice',
  'showSystemNotice': 'showSystemNotice',
  'refreshSystemNotice': 'refreshSystemNotice',
  'test用户': 'testUser',
  'login信息': 'loginInfo',
  'login成功信息': 'loginSuccessInfo',
  'login错误': 'loginError',
  
  // 错误对象
  'new 错误': 'new Error',
  
  // 其他
  '否tice': 'Notice'
};

/**
 * 修复文件中的中文函数名和变量名
 * @param {string} filePath 文件路径
 */
function fixChineseNamesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(CHINESE_TO_ENGLISH_NAMES).forEach(([chinese, english]) => {
      // 修复函数调用
      const functionCallRegex = new RegExp(`\\b${chinese}\\s*\\(`, 'g');
      if (functionCallRegex.test(content)) {
        content = content.replace(functionCallRegex, `${english}(`);
        modified = true;
        console.log(`  ✓ 修复函数调用: ${chinese} -> ${english}`);
      }
      
      // 修复函数定义
      const functionDefRegex = new RegExp(`\\b${chinese}\\s*\\(`, 'g');
      if (functionDefRegex.test(content)) {
        content = content.replace(functionDefRegex, `${english}(`);
        modified = true;
        console.log(`  ✓ 修复函数定义: ${chinese} -> ${english}`);
      }
      
      // 修复变量名
      const variableRegex = new RegExp(`\\b${chinese}\\b`, 'g');
      if (variableRegex.test(content)) {
        content = content.replace(variableRegex, english);
        modified = true;
        console.log(`  ✓ 修复变量名: ${chinese} -> ${english}`);
      }
      
      // 修复对象属性
      const propertyRegex = new RegExp(`\\.${chinese}\\b`, 'g');
      if (propertyRegex.test(content)) {
        content = content.replace(propertyRegex, `.${english}`);
        modified = true;
        console.log(`  ✓ 修复对象属性: .${chinese} -> .${english}`);
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
        
        const modified = fixChineseNamesInFile(filePath);
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
 * 主函数
 */
function main() {
  console.log('🔧 开始修复中文函数名和变量名...\n');
  
  const srcDir = path.join(__dirname, '../src');
  
  // 检查源文件目录是否存在
  if (!fs.existsSync(srcDir)) {
    console.error('❌ 源文件目录不存在:', srcDir);
    process.exit(1);
  }
  
  // 处理源文件
  console.log('📁 处理源文件目录:', srcDir);
  const stats = processDirectory(srcDir);
  
  // 输出统计结果
  console.log('\n📊 修复结果统计:');
  console.log(`  总文件数: ${stats.total}`);
  console.log(`  修复文件数: ${stats.modified}`);
  console.log(`  错误数: ${stats.errors}`);
  
  console.log('\n🎉 中文函数名和变量名修复完成！');
  
  if (stats.modified > 0) {
    console.log('\n📝 修复内容:');
    console.log('  1. 修复了函数调用名称');
    console.log('  2. 修复了函数定义名称');
    console.log('  3. 修复了变量名称');
    console.log('  4. 修复了对象属性名称');
    console.log('\n✅ 现在JavaScript语法应该正确了');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  fixChineseNamesInFile,
  processDirectory,
  CHINESE_TO_ENGLISH_NAMES
};
