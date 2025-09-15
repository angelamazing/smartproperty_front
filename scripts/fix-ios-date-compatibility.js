/**
 * iOS 日期兼容性修复脚本
 * 这个脚本将扫描整个项目，找到所有可能有 iOS 兼容性问题的日期代码并修复
 * 
 * 运行方式：node scripts/fix-ios-date-compatibility.js
 * 
 * @author Linus 风格的代码修复
 */

const fs = require('fs');
const path = require('path');

// 需要扫描的目录
const SRC_DIR = path.join(__dirname, '..', 'src');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const UTILS_DIR = path.join(SRC_DIR, 'utils');

// 需要扫描的文件扩展名
const FILE_EXTENSIONS = ['.vue', '.js'];

// 问题模式和修复建议
const PROBLEMATIC_PATTERNS = [
  {
    // new Date() 直接调用字符串参数
    pattern: /new Date\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    fix: 'this.$createDate("$1")',
    description: '将 new Date() 替换为 iOS 兼容的 $createDate() 方法'
  },
  {
    // new Date() 变量参数
    pattern: /new Date\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/g,
    fix: 'this.$createDate($1)',
    description: '将 new Date() 替换为 iOS 兼容的 $createDate() 方法'
  },
  {
    // Date.parse()
    pattern: /Date\.parse\s*\(\s*(['"`]?)([^'"`\)]+)\1\s*\)/g,
    fix: 'this.$createDate("$2")?.getTime() || 0',
    description: '将 Date.parse() 替换为 iOS 兼容的 $createDate() 方法'
  },
  {
    // 直接的日期格式化调用
    pattern: /\.format\s*\(\s*(['"`][^'"`]*['"`])\s*\)/g,
    fix: '.format && this.$formatDate(date, $1) || this.$formatDate(date, $1)',
    description: '确保格式化方法的 iOS 兼容性'
  }
];

// 特殊的 Vue 模板模式
const VUE_TEMPLATE_PATTERNS = [
  {
    pattern: /\{\{\s*new Date\s*\([^}]+\)\s*\}\}/g,
    fix: '{{ $formatDate(dateValue) }}',
    description: 'Vue 模板中的日期显示修复'
  }
];

/**
 * 递归获取所有文件
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      // 跳过 node_modules 和 .git 目录
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      // 只处理指定扩展名的文件
      if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * 分析文件中的问题
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    PROBLEMATIC_PATTERNS.forEach((pattern, index) => {
      const matches = [...content.matchAll(pattern.pattern)];
      matches.forEach(match => {
        issues.push({
          type: 'script',
          pattern: index,
          match: match[0],
          line: content.substring(0, match.index).split('\n').length,
          fix: pattern.fix,
          description: pattern.description
        });
      });
    });
    
    // 如果是 Vue 文件，检查模板部分
    if (filePath.endsWith('.vue')) {
      VUE_TEMPLATE_PATTERNS.forEach((pattern, index) => {
        const matches = [...content.matchAll(pattern.pattern)];
        matches.forEach(match => {
          issues.push({
            type: 'template',
            pattern: index,
            match: match[0],
            line: content.substring(0, match.index).split('\n').length,
            fix: pattern.fix,
            description: pattern.description
          });
        });
      });
    }
    
    return { content, issues };
  } catch (error) {
    console.error(`❌ 读取文件失败: ${filePath}`, error);
    return { content: '', issues: [] };
  }
}

/**
 * 修复文件中的问题
 */
function fixFile(filePath, content, issues) {
  let fixedContent = content;
  let fixCount = 0;
  
  // 按照位置倒序排列，避免修复时位置偏移
  issues.sort((a, b) => b.line - a.line);
  
  issues.forEach(issue => {
    if (issue.type === 'script') {
      const pattern = PROBLEMATIC_PATTERNS[issue.pattern];
      const oldMatch = issue.match;
      
      // 简单的替换策略
      if (oldMatch.includes('new Date(') && oldMatch.includes('"')) {
        // 提取字符串参数
        const stringMatch = oldMatch.match(/new Date\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
        if (stringMatch) {
          const newCode = `this.$createDate("${stringMatch[1]}")`;
          fixedContent = fixedContent.replace(oldMatch, newCode);
          fixCount++;
        }
      } else if (oldMatch.includes('new Date(') && !oldMatch.includes('"')) {
        // 变量参数
        const varMatch = oldMatch.match(/new Date\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/);
        if (varMatch) {
          const newCode = `this.$createDate(${varMatch[1]})`;
          fixedContent = fixedContent.replace(oldMatch, newCode);
          fixCount++;
        }
      } else if (oldMatch.includes('Date.parse(')) {
        const parseMatch = oldMatch.match(/Date\.parse\s*\(\s*(['"`]?)([^'"`\)]+)\1\s*\)/);
        if (parseMatch) {
          const newCode = `(this.$createDate("${parseMatch[2]}")?.getTime() || 0)`;
          fixedContent = fixedContent.replace(oldMatch, newCode);
          fixCount++;
        }
      }
    }
  });
  
  return { fixedContent, fixCount };
}

/**
 * 添加必要的导入和混入
 */
function ensureImportsAndMixins(filePath, content) {
  let updatedContent = content;
  
  if (filePath.endsWith('.vue')) {
    // 检查是否已经导入了 timeMixin
    if (!content.includes('timeMixin') && !content.includes('iosDateMixin')) {
      // 查找 script 标签
      const scriptMatch = content.match(/<script[^>]*>/);
      if (scriptMatch) {
        const scriptStart = content.indexOf(scriptMatch[0]) + scriptMatch[0].length;
        
        // 查找是否已有 import 语句
        const scriptContent = content.substring(scriptStart);
        const importMatch = scriptContent.match(/import\s+[^;]+;/);
        
        if (importMatch) {
          // 在最后一个 import 后添加
          const lastImportEnd = scriptStart + scriptContent.lastIndexOf('import');
          const afterLastImport = content.substring(lastImportEnd).indexOf(';') + lastImportEnd + 1;
          
          const importStatement = "\nimport timeMixin from '@/mixins/timeMixin.js'";
          updatedContent = content.slice(0, afterLastImport) + importStatement + content.slice(afterLastImport);
        } else {
          // 在 script 标签后直接添加
          const importStatement = "\nimport timeMixin from '@/mixins/timeMixin.js'\n";
          updatedContent = content.slice(0, scriptStart) + importStatement + content.slice(scriptStart);
        }
        
        // 添加 mixin
        if (!content.includes('mixins:') && !content.includes('mixins [')) {
          const exportMatch = updatedContent.match(/export\s+default\s*\{/);
          if (exportMatch) {
            const exportStart = updatedContent.indexOf(exportMatch[0]) + exportMatch[0].length;
            const mixinStatement = "\n  mixins: [timeMixin],";
            updatedContent = updatedContent.slice(0, exportStart) + mixinStatement + updatedContent.slice(exportStart);
          }
        } else {
          // 在现有 mixins 数组中添加
          if (updatedContent.includes('mixins: [') && !updatedContent.includes('timeMixin')) {
            updatedContent = updatedContent.replace(/mixins:\s*\[/, 'mixins: [timeMixin, ');
          }
        }
      }
    }
  }
  
  return updatedContent;
}

/**
 * 主修复函数
 */
function main() {
  console.log('🍎 开始 iOS 日期兼容性修复...\n');
  
  const allFiles = getAllFiles(SRC_DIR);
  const report = {
    totalFiles: allFiles.length,
    analyzedFiles: 0,
    filesWithIssues: 0,
    totalIssues: 0,
    fixedFiles: 0,
    fixedIssues: 0,
    details: []
  };
  
  allFiles.forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath);
    const analysis = analyzeFile(filePath);
    
    report.analyzedFiles++;
    
    if (analysis.issues.length > 0) {
      report.filesWithIssues++;
      report.totalIssues += analysis.issues.length;
      
      console.log(`\n📁 ${relativePath}`);
      console.log(`   发现 ${analysis.issues.length} 个问题:`);
      
      analysis.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. 第${issue.line}行: ${issue.description}`);
        console.log(`      问题代码: ${issue.match}`);
      });
      
      // 尝试自动修复
      const { fixedContent, fixCount } = fixFile(filePath, analysis.content, analysis.issues);
      
      if (fixCount > 0) {
        // 添加必要的导入和混入
        const finalContent = ensureImportsAndMixins(filePath, fixedContent);
        
        try {
          // 创建备份
          const backupPath = filePath + '.backup.' + Date.now();
          fs.writeFileSync(backupPath, analysis.content);
          
          // 写入修复后的内容
          fs.writeFileSync(filePath, finalContent);
          
          report.fixedFiles++;
          report.fixedIssues += fixCount;
          
          console.log(`   ✅ 已修复 ${fixCount} 个问题`);
          console.log(`   💾 备份已保存: ${path.basename(backupPath)}`);
          
          report.details.push({
            file: relativePath,
            issues: analysis.issues.length,
            fixed: fixCount,
            backup: backupPath
          });
        } catch (error) {
          console.log(`   ❌ 修复失败: ${error.message}`);
        }
      } else {
        console.log(`   ⚠️  需要手动修复`);
        report.details.push({
          file: relativePath,
          issues: analysis.issues.length,
          fixed: 0,
          needsManualFix: true
        });
      }
    }
  });
  
  // 输出总结报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 iOS 日期兼容性修复报告');
  console.log('='.repeat(60));
  console.log(`📁 扫描文件总数: ${report.totalFiles}`);
  console.log(`🔍 分析文件数量: ${report.analyzedFiles}`);
  console.log(`⚠️  有问题的文件: ${report.filesWithIssues}`);
  console.log(`🐛 发现问题总数: ${report.totalIssues}`);
  console.log(`✅ 修复文件数量: ${report.fixedFiles}`);
  console.log(`🔧 修复问题数量: ${report.fixedIssues}`);
  
  if (report.fixedIssues > 0) {
    console.log('\n✨ 修复完成！下一步建议：');
    console.log('1. 测试修复后的代码是否正常工作');
    console.log('2. 在 iOS Safari 中测试日期功能');
    console.log('3. 如果有问题，可以使用备份文件恢复');
    console.log('4. 检查手动修复的文件');
  }
  
  if (report.totalIssues > report.fixedIssues) {
    console.log('\n⚠️  仍有未修复的问题需要手动处理');
  }
  
  // 保存详细报告
  const reportPath = path.join(__dirname, '..', 'ios-date-fix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 详细报告已保存: ${reportPath}`);
}

// 运行修复
if (require.main === module) {
  main();
}

module.exports = { main, analyzeFile, fixFile };
