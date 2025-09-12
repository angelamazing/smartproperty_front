#!/usr/bin/env node

/**
 * 修复组件名称错误
 * 将中文组件名修复为正确的英文组件名
 */

const fs = require('fs');
const path = require('path');

// 需要修复的组件名映射
const COMPONENT_FIXES = [
  {
    oldName: '用户Avatar',
    newName: 'UserAvatar',
    oldPath: '@/components/用户Avatar.vue',
    newPath: '@/components/UserAvatar.vue'
  },
  {
    oldName: 'System否tice',
    newName: 'SystemNotice',
    oldPath: '@/components/System否tice.vue',
    newPath: '@/components/SystemNotice.vue'
  }
];

/**
 * 修复文件中的组件名称
 * @param {string} filePath 文件路径
 */
function fixComponentNamesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    COMPONENT_FIXES.forEach(fix => {
      // 修复组件标签名
      const tagRegex = new RegExp(`<${fix.oldName}`, 'g');
      if (tagRegex.test(content)) {
        content = content.replace(tagRegex, `<${fix.newName}`);
        modified = true;
        console.log(`  ✓ 修复组件标签: ${fix.oldName} -> ${fix.newName}`);
      }
      
      // 修复import路径
      if (content.includes(fix.oldPath)) {
        content = content.replace(fix.oldPath, fix.newPath);
        modified = true;
        console.log(`  ✓ 修复import路径: ${fix.oldPath} -> ${fix.newPath}`);
      }
      
      // 修复组件注册
      const componentRegex = new RegExp(`\\s*${fix.oldName},?`, 'g');
      if (componentRegex.test(content)) {
        content = content.replace(componentRegex, `    ${fix.newName},`);
        modified = true;
        console.log(`  ✓ 修复组件注册: ${fix.oldName} -> ${fix.newName}`);
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
        
        const modified = fixComponentNamesInFile(filePath);
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
  console.log('🔧 开始修复组件名称错误...\n');
  
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
  
  console.log('\n🎉 组件名称错误修复完成！');
  
  if (stats.modified > 0) {
    console.log('\n📝 修复内容:');
    console.log('  1. 修复了组件标签名称');
    console.log('  2. 修复了import路径');
    console.log('  3. 修复了组件注册');
    console.log('\n✅ 现在可以正常编译微信小程序了');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  fixComponentNamesInFile,
  processDirectory,
  COMPONENT_FIXES
};
