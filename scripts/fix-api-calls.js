#!/usr/bin/env node

/**
 * 修复API调用和函数名错误
 * 将中文函数名和API调用修复为英文
 */

const fs = require('fs');
const path = require('path');

// 需要修复的中文到英文映射
const API_CALL_FIXES = {
  // auth相关
  'auth.is管理员': 'auth.isAdmin',
  'auth.get用户信息': 'auth.getUserInfo',
  'auth.saveLogin信息': 'auth.saveLoginInfo',
  'auth.showLogin成功信息': 'auth.showLoginSuccessInfo',
  'auth.handleLogin错误': 'auth.handleLoginError',
  'auth.performTestLoginAsSys管理员': 'auth.performTestLoginAsSysAdmin',
  
  // api相关
  'api.user.get信息': 'api.user.getInfo',
  'api.system.get今天Stats': 'api.system.getTodayStats',
  'api.admin.get否tices': 'api.admin.getNotices',
  'api.auth.testLoginSys管理员': 'api.auth.testLoginSysAdmin',
  
  // 函数名
  'is管理员': 'isAdmin',
  'get用户信息': 'getUserInfo',
  'load用户信息': 'loadUserInfo',
  'load今天Stats': 'loadTodayStats',
  'loadSystemNotice': 'loadSystemNotice',
  'load否tificationSettings': 'loadNotificationSettings',
  'refreshSystemNotice': 'refreshSystemNotice',
  'closeSystemNotice': 'closeSystemNotice',
  'update用户Avatar': 'updateUserAvatar',
  'saveLogin信息': 'saveLoginInfo',
  'showLogin成功信息': 'showLoginSuccessInfo',
  'handleLogin错误': 'handleLoginError',
  'performTestLoginAsSys管理员': 'performTestLoginAsSysAdmin',
  
  // 变量名
  'user信息': 'userInfo',
  'system否tice': 'systemNotice',
  'showSystemNotice': 'showSystemNotice',
  'is编辑Mode': 'isEditMode',
  'isLoading': 'isLoading',
  'todayStats': 'todayStats',
  'userStats': 'userStats',
  'login信息': 'loginInfo',
  'login成功信息': 'loginSuccessInfo',
  'login错误': 'loginError',
  
  // 组件名
  '用户DetailModal': 'UserDetailModal',
  '用户编辑Modal': 'UserEditModal',
  'Personal信息': 'PersonalInfo',
  '用户s管理员': 'UsersAdmin',
  '管理员Index': 'AdminIndex',
  
  // 其他
  '否tice': 'Notice',
  '否tification': 'Notification'
};

/**
 * 修复文件中的API调用和函数名
 * @param {string} filePath 文件路径
 */
function fixApiCallsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(API_CALL_FIXES).forEach(([chinese, english]) => {
      // 修复API调用
      const apiCallRegex = new RegExp(`\\b${chinese}\\b`, 'g');
      if (apiCallRegex.test(content)) {
        content = content.replace(apiCallRegex, english);
        modified = true;
        console.log(`  ✓ 修复API调用: ${chinese} -> ${english}`);
      }
      
      // 修复函数调用
      const functionCallRegex = new RegExp(`this\\.${chinese}\\b`, 'g');
      if (functionCallRegex.test(content)) {
        content = content.replace(functionCallRegex, `this.${english}`);
        modified = true;
        console.log(`  ✓ 修复函数调用: this.${chinese} -> this.${english}`);
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
      
      // 修复组件名
      const componentRegex = new RegExp(`name:\\s*['"]${chinese}['"]`, 'g');
      if (componentRegex.test(content)) {
        content = content.replace(componentRegex, `name: '${english}'`);
        modified = true;
        console.log(`  ✓ 修复组件名: ${chinese} -> ${english}`);
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
        
        const modified = fixApiCallsInFile(filePath);
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
  console.log('🔧 开始修复API调用和函数名错误...\n');
  
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
  
  console.log('\n🎉 API调用和函数名错误修复完成！');
  
  if (stats.modified > 0) {
    console.log('\n📝 修复内容:');
    console.log('  1. 修复了API调用名称');
    console.log('  2. 修复了函数调用名称');
    console.log('  3. 修复了函数定义名称');
    console.log('  4. 修复了变量名称');
    console.log('  5. 修复了组件名称');
    console.log('\n✅ 现在JavaScript运行时应该正常了');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  fixApiCallsInFile,
  processDirectory,
  API_CALL_FIXES
};
