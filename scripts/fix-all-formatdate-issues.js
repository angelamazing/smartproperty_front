/**
 * 批量修复所有 $formatDate 相关问题
 * 确保所有使用 $formatDate 的文件都正确导入了 timeMixin
 */

const fs = require('fs');
const path = require('path');

// 需要检查的文件列表
const filesToCheck = [
  'src/pages/admin/users.vue',
  'src/pages/admin/venues.vue',
  'src/pages/admin/departments.vue',
  'src/pages/dining/components/RecordTab.vue',
  'src/components/UserDetailModal.vue',
  'src/pages/admin/menu.vue',
  'src/pages/admin/dept-admin.vue',
  'src/pages/dining/dining.vue',
  'src/pages/test-time-optimization.vue',
  'src/pages/reservation/reservation.vue'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 检查是否使用了 $formatDate 但没有导入 timeMixin
    const hasFormatDate = content.includes('$formatDate') || content.includes('$formatTime') || content.includes('$formatDateTime');
    const hasTimeMixinImport = content.includes("import timeMixin from '@/mixins/timeMixin'");
    const hasTimeMixinMixin = content.includes('mixins: [timeMixin]') || content.includes('mixins:[timeMixin]');

    if (hasFormatDate && (!hasTimeMixinImport || !hasTimeMixinMixin)) {
      console.log(`修复文件: ${filePath}`);
      
      // 添加 timeMixin 导入
      if (!hasTimeMixinImport) {
        // 查找最后一个 import 语句
        const importRegex = /import\s+[^;]+;?\s*$/gm;
        const imports = content.match(importRegex);
        if (imports && imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          const newImport = lastImport.replace(/;?\s*$/, '') + '\nimport timeMixin from \'@/mixins/timeMixin\'';
          content = content.replace(lastImport, newImport);
          modified = true;
        }
      }

      // 添加 timeMixin 到 mixins
      if (!hasTimeMixinMixin) {
        // 查找 export default 对象
        const exportDefaultRegex = /export\s+default\s*\{/;
        const match = content.match(exportDefaultRegex);
        if (match) {
          const exportDefaultIndex = content.indexOf(match[0]);
          const afterExportDefault = content.substring(exportDefaultIndex + match[0].length);
          
          // 查找第一个属性
          const firstPropertyMatch = afterExportDefault.match(/\s*(\w+):/);
          if (firstPropertyMatch) {
            const firstPropertyIndex = exportDefaultIndex + match[0].length + afterExportDefault.indexOf(firstPropertyMatch[0]);
            const beforeFirstProperty = content.substring(0, firstPropertyIndex);
            const afterFirstProperty = content.substring(firstPropertyIndex);
            
            content = beforeFirstProperty + '\n  mixins: [timeMixin],' + afterFirstProperty;
            modified = true;
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 已修复: ${filePath}`);
        return true;
      }
    } else if (hasFormatDate) {
      console.log(`⏭️ 无需修复: ${filePath} (已正确配置)`);
    } else {
      console.log(`⏭️ 跳过: ${filePath} (未使用 $formatDate)`);
    }

    return false;
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
    return false;
  }
}

function main() {
  console.log('开始批量修复所有 $formatDate 相关问题...\n');
  
  let fixedCount = 0;
  let totalCount = filesToCheck.length;

  filesToCheck.forEach(filePath => {
    if (fixFile(filePath)) {
      fixedCount++;
    }
  });

  console.log(`\n修复完成: ${fixedCount}/${totalCount} 个文件已修复`);
  
  if (fixedCount > 0) {
    console.log('\n建议运行以下命令重新构建项目:');
    console.log('npm run build:mp-weixin');
  }
}

// 运行修复
if (require.main === module) {
  main();
}

module.exports = { fixFile, filesToCheck };
