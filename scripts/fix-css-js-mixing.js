/**
 * 修复CSS中混入JavaScript代码的问题
 */

const fs = require('fs');
const path = require('path');

// 需要检查的文件列表
const filesToCheck = [
  'src/pages/admin/menu.vue',
  'src/pages/reservation/reservation.vue',
  'src/pages/test-time-optimization.vue',
  'src/pages/dining/dining.vue',
  'src/pages/admin/dept-admin.vue',
  'src/components/UserDetailModal.vue',
  'src/pages/dining/components/RecordTab.vue',
  'src/pages/admin/departments.vue',
  'src/pages/admin/venues.vue',
  'src/pages/admin/users.vue'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 查找CSS中混入的JavaScript代码
    const cssJsPattern = /(\s*)([a-zA-Z-]+:\s*[^;]+;?\s*)\n(import\s+[^;]+;?\s*)\n(\s*[a-zA-Z-]+:\s*[^;]+;?\s*)/g;
    const matches = content.match(cssJsPattern);
    
    if (matches) {
      console.log(`修复文件: ${filePath}`);
      
      // 替换混入的代码
      content = content.replace(cssJsPattern, (match, before, css1, js, css2) => {
        // 移除JavaScript代码，保留CSS
        return before + css1 + '\n' + before + css2;
      });
      
      modified = true;
    }

    // 查找其他可能的混入模式
    const otherPatterns = [
      // 模式1: CSS属性后直接跟import
      /([a-zA-Z-]+:\s*[^;]+;?\s*)\n(import\s+[^;]+;?\s*)\n/g,
      // 模式2: 缺少分号的CSS属性后跟import
      /([a-zA-Z-]+:\s*[^;]+)\n(import\s+[^;]+;?\s*)\n/g
    ];

    otherPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`修复文件: ${filePath} (其他模式)`);
        content = content.replace(pattern, (match, css, js) => {
          // 确保CSS属性有分号，移除JavaScript代码
          const cssWithSemicolon = css.endsWith(';') ? css : css + ';';
          return cssWithSemicolon + '\n';
        });
        modified = true;
      }
    });

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
  console.log('开始修复CSS中混入JavaScript代码的问题...\n');
  
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
