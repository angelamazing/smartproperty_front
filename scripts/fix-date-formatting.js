/**
 * 批量修复日期格式化问题
 * 将所有使用$formatDate的文件替换为使用新的DateFormatter工具类
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/pages/admin/venues.vue',
  'src/pages/admin/users.vue',
  'src/pages/admin/departments.vue',
  'src/pages/dining/components/RecordTab.vue',
  'src/components/UserDetailModal.vue',
  'src/pages/admin/menu.vue',
  'src/pages/admin/dept-admin.vue',
  'src/pages/dining/dining.vue',
  'src/pages/test-time-optimization.vue',
  'src/pages/reservation/reservation.vue'
];

// 修复规则
const fixRules = [
  {
    // 修复$formatDate调用
    pattern: /this\.\$formatDate\(([^)]+)\)/g,
    replacement: 'this.$formatDate($1, "YYYY-MM-DD")'
  },
  {
    // 修复$formatDateTime调用
    pattern: /this\.\$formatDateTime\(([^)]+)\)/g,
    replacement: 'this.$formatDateTime($1, "YYYY-MM-DD HH:mm:ss")'
  },
  {
    // 修复$formatTime调用
    pattern: /this\.\$formatTime\(([^)]+)\)/g,
    replacement: 'this.$formatTime($1, "HH:mm:ss")'
  },
  {
    // 添加DateFormatter导入
    pattern: /import timeMixin from ['"]@\/mixins\/timeMixin['"]/g,
    replacement: 'import timeMixin from \'@/mixins/timeMixin\'\nimport { DateFormatter } from \'@/utils/dateFormatter.js\''
  }
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 应用修复规则
    fixRules.forEach(rule => {
      const newContent = content.replace(rule.pattern, rule.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // 如果文件被修改，写回文件
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已修复: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ 无需修复: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
    return false;
  }
}

function main() {
  console.log('开始批量修复日期格式化问题...\n');
  
  let fixedCount = 0;
  let totalCount = filesToFix.length;

  filesToFix.forEach(filePath => {
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

module.exports = { fixFile, fixRules };
