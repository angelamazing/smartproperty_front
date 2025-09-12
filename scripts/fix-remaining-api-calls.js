#!/usr/bin/env node

/**
 * 修复剩余的API调用问题
 * 将中文API调用修复为英文
 */

const fs = require('fs');
const path = require('path');

// 需要修复的API调用映射
const API_CALL_MAPPING = {
  // admin相关
  'api.admin.getDept管理员信息': 'api.admin.getDeptAdminInfo',
  'api.admin.get用户sList': 'api.admin.getUsersList',
  'api.admin.get部门sList': 'api.admin.getDepartmentsList',
  'api.admin.reset用户Password': 'api.admin.resetUserPassword',
  'api.admin.update用户Status': 'api.admin.updateUserStatus',
  'api.admin.delete用户': 'api.admin.deleteUser',
  'api.admin.batch删除用户s': 'api.admin.batchDeleteUsers',
  'api.admin.delete部门': 'api.admin.deleteDepartment',
  'api.admin.get部门Overview': 'api.admin.getDepartmentOverview',
  'api.admin.get用户Stats': 'api.admin.getUserStats',
  'api.admin.batch删除否tices': 'api.admin.batchDeleteNotices',
  'api.admin.update用户': 'api.admin.updateUser',
  'api.admin.create用户': 'api.admin.createUser',
  'api.admin.get用户Detail': 'api.admin.getUserDetail',
  'api.admin.get用户Activities': 'api.admin.getUserActivities',
  'api.admin.get部门Detail': 'api.admin.getDepartmentDetail',
  'api.admin.get部门Members': 'api.admin.getDepartmentMembers',
  'api.admin.get部门Stats': 'api.admin.getDepartmentStats',
  'api.admin.batch删除Venues': 'api.admin.batchDeleteVenues',
  'api.admin.create部门Order': 'api.admin.createDepartmentOrder',
  
  // auth相关
  'api.auth.testLoginDept管理员': 'api.auth.testLoginDeptAdmin',
  'api.auth.testLoginSpecificDept管理员': 'api.auth.testLoginSpecificDeptAdmin',
  'api.auth.testLogin用户': 'api.auth.testLoginUser'
};

/**
 * 修复文件中的API调用
 */
function fixApiCallsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(API_CALL_MAPPING).forEach(([chinese, english]) => {
      if (content.includes(chinese)) {
        content = content.replace(new RegExp(chinese, 'g'), english);
        modified = true;
        console.log(`  ✓ 修复API调用: ${chinese} -> ${english}`);
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
 * 处理目录
 */
function processDirectory(dir) {
  const stats = { total: 0, modified: 0, errors: 0 };
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
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
  console.log('🔧 开始修复剩余的API调用问题...\n');
  
  const srcDir = path.join(__dirname, '../src');
  const stats = processDirectory(srcDir);
  
  console.log('\n📊 修复结果统计:');
  console.log(`  总文件数: ${stats.total}`);
  console.log(`  修复文件数: ${stats.modified}`);
  console.log(`  错误数: ${stats.errors}`);
  
  console.log('\n🎉 剩余API调用问题修复完成！');
}

if (require.main === module) {
  main();
}
