/**
 * 修复缺少 timeMixin 导入的文件
 */

const fs = require('fs');
const path = require('path');

// 需要检查的文件列表
const filesToCheck = [
  'src/components/UserDetailModal.vue',
  'src/pages/dining/components/RecordTab.vue',
  'src/pages/admin/venues.vue',
  'src/pages/dining/dining.vue',
  'src/pages/admin/users.vue',
  'src/pages/reservation/reservation.vue',
  'src/pages/admin/departments.vue',
  'src/pages/admin/menu.vue',
  'src/pages/personal-info/personal-info.vue',
  'src/pages/admin/menu-history.vue',
  'src/components/NotificationManager.vue',
  'src/pages/dining/dept-order.vue',
  'src/pages/dining/dept-stats.vue',
  'src/components/SystemNotice.vue',
  'src/pages/dining/dining-status.vue',
  'src/pages/verification/verification.vue',
  'src/pages/dining/qr-scan.vue',
  'src/pages/dining/dining-confirmation-history.vue',
  'src/pages/admin/notices.vue',
  'src/pages/admin/qr-management.vue',
  'src/pages/admin/index.vue',
  'src/pages/dining/qr-scan-history.vue',
  'src/pages/index/index.vue'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 检查是否使用了 timeMixin 但没有导入
    const hasTimeMixinUsage = content.includes('mixins: [timeMixin]') || content.includes('mixins:[timeMixin]');
    const hasTimeMixinImport = content.includes("import timeMixin from '@/mixins/timeMixin'");
    const hasFormatDateUsage = content.includes('$formatDate') || content.includes('$formatTime') || content.includes('$formatDateTime');

    if ((hasTimeMixinUsage || hasFormatDateUsage) && !hasTimeMixinImport) {
      console.log(`修复文件: ${filePath}`);
      
      // 查找 script 标签
      const scriptMatch = content.match(/<script>[\s\S]*?<\/script>/);
      if (scriptMatch) {
        const scriptContent = scriptMatch[0];
        
        // 查找第一个 import 语句
        const importMatch = scriptContent.match(/import\s+[^;]+;?\s*/);
        if (importMatch) {
          // 在第一个 import 后添加 timeMixin 导入
          const newImport = importMatch[0] + "import timeMixin from '@/mixins/timeMixin'\n";
          content = content.replace(importMatch[0], newImport);
          modified = true;
        } else {
          // 如果没有 import 语句，在 script 标签后添加
          const scriptTagMatch = content.match(/<script>/);
          if (scriptTagMatch) {
            const newImport = scriptTagMatch[0] + "\nimport timeMixin from '@/mixins/timeMixin'\n";
            content = content.replace(scriptTagMatch[0], newImport);
            modified = true;
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 已修复: ${filePath}`);
        return true;
      }
    } else if (hasTimeMixinUsage && hasTimeMixinImport) {
      console.log(`⏭️ 无需修复: ${filePath} (已正确配置)`);
    } else if (hasFormatDateUsage && !hasTimeMixinImport) {
      console.log(`⚠️ 警告: ${filePath} 使用了 $formatDate 但没有导入 timeMixin`);
    } else {
      console.log(`⏭️ 跳过: ${filePath} (未使用 timeMixin)`);
    }

    return false;
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
    return false;
  }
}

function main() {
  console.log('开始修复缺少 timeMixin 导入的文件...\n');
  
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
