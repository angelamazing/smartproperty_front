/**
 * 数据库备份和清空脚本
 * 先备份数据库，然后直接操作数据库清空数据
 * 
 * ⚠️ 警告：这是一个危险操作，会永久删除数据！
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置 - 请根据实际情况修改
const dbConfig = {
  host: 'uauotggfeiao.sealosbja.site',
  port: 3306,
  user: 'smart_user',                    // 需要替换为实际用户名
  password: 'your_password',             // 需要替换为实际密码
  database: 'smart_property',
  charset: 'utf8mb4'
};

// 需要清空的表列表（按依赖关系排序）
const tablesToClear = [
  // 1. 日志和记录表（无外键依赖）
  'dining_confirmation_logs',
  'dining_registrations', 
  'qr_scan_logs',
  'verification_logs',
  'audit_logs',
  'system_logs',
  
  // 2. 业务数据表
  'dining_orders',
  'special_dining_reservations',
  'venue_reservations',
  'reservation_audit_logs',
  'dining_verification',
  
  // 3. 菜单相关表
  'menu_dishes',
  'menus',
  'menu_templates',
  
  // 4. 菜品相关表
  'dish_categories',
  'dishes',
  'nutrition_templates',
  
  // 5. 场地相关表
  'venue_schedules',
  'time_slots',
  'venues',
  
  // 6. 通知和公告表
  'notifications',
  'notices',
  'user_notifications',
  
  // 7. 用户相关表（保留系统管理员）
  'user_sessions',
  'user_tokens',
  'user_feedback',
  'user_activities'
];

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.backupFile = null;
  }

  /**
   * 连接数据库
   */
  async connect() {
    try {
      console.log('🔌 正在连接数据库...');
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }

  /**
   * 创建备份目录
   */
  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 创建备份目录: ${this.backupDir}`);
    }
  }

  /**
   * 备份数据库
   */
  async backupDatabase() {
    try {
      console.log('💾 开始备份数据库...');
      
      // 创建备份目录
      this.createBackupDir();
      
      // 生成备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);
      
      console.log(`📄 备份文件: ${this.backupFile}`);
      
      // 获取所有表结构
      const [tables] = await this.connection.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ? 
        ORDER BY table_name
      `, [dbConfig.database]);
      
      let backupContent = `-- 数据库备份文件\n`;
      backupContent += `-- 备份时间: ${new Date().toISOString()}\n`;
      backupContent += `-- 数据库: ${dbConfig.database}\n\n`;
      
      // 备份每个表
      for (const table of tables) {
        const tableName = table.table_name;
        console.log(`   备份表: ${tableName}`);
        
        // 获取表结构
        const [createTable] = await this.connection.execute(`SHOW CREATE TABLE ${tableName}`);
        backupContent += `\n-- 表结构: ${tableName}\n`;
        backupContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        backupContent += `${createTable[0]['Create Table']};\n\n`;
        
        // 获取表数据
        const [rows] = await this.connection.execute(`SELECT * FROM ${tableName}`);
        if (rows.length > 0) {
          backupContent += `-- 表数据: ${tableName}\n`;
          backupContent += `INSERT INTO \`${tableName}\` VALUES\n`;
          
          const values = rows.map(row => {
            const values = Object.values(row).map(value => {
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              return value;
            });
            return `(${values.join(', ')})`;
          });
          
          backupContent += values.join(',\n') + ';\n\n';
        }
      }
      
      // 写入备份文件
      fs.writeFileSync(this.backupFile, backupContent, 'utf8');
      
      console.log(`✅ 数据库备份完成: ${this.backupFile}`);
      console.log(`📊 备份大小: ${(fs.statSync(this.backupFile).size / 1024).toFixed(2)} KB`);
      
      return this.backupFile;
    } catch (error) {
      console.error('❌ 数据库备份失败:', error.message);
      throw error;
    }
  }

  /**
   * 检查表是否存在
   */
  async checkTableExists(tableName) {
    try {
      const [rows] = await this.connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
      `, [dbConfig.database, tableName]);
      return rows[0].count > 0;
    } catch (error) {
      console.warn(`⚠️ 检查表 ${tableName} 时出错:`, error.message);
      return false;
    }
  }

  /**
   * 获取表记录数
   */
  async getTableCount(tableName) {
    try {
      const [rows] = await this.connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      return rows[0].count;
    } catch (error) {
      console.warn(`⚠️ 获取表 ${tableName} 记录数时出错:`, error.message);
      return 0;
    }
  }

  /**
   * 清空普通表
   */
  async clearTable(tableName) {
    try {
      const exists = await this.checkTableExists(tableName);
      if (!exists) {
        console.log(`⏭️ 表 ${tableName} 不存在，跳过`);
        return { cleared: 0, errors: 0 };
      }

      const count = await this.getTableCount(tableName);
      if (count === 0) {
        console.log(`⏭️ 表 ${tableName} 已为空，跳过`);
        return { cleared: 0, errors: 0 };
      }

      console.log(`🗑️ 正在清空表 ${tableName} (${count} 条记录)...`);
      
      await this.connection.execute(`DELETE FROM ${tableName}`);
      
      console.log(`✅ 表 ${tableName} 清空完成`);
      return { cleared: count, errors: 0 };
      
    } catch (error) {
      const errorMsg = `清空表 ${tableName} 失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      return { cleared: 0, errors: 1 };
    }
  }

  /**
   * 清空用户表（保留系统管理员）
   */
  async clearUsersTable() {
    try {
      const exists = await this.checkTableExists('users');
      if (!exists) {
        console.log('⏭️ 用户表不存在，跳过');
        return { cleared: 0, errors: 0 };
      }

      // 统计要删除和保留的用户数
      const [deleteRows] = await this.connection.execute(
        `SELECT COUNT(*) as count FROM users WHERE role != 'sys_admin'`
      );
      const [preserveRows] = await this.connection.execute(
        `SELECT COUNT(*) as count FROM users WHERE role = 'sys_admin'`
      );

      const deleteCount = deleteRows[0].count;
      const preserveCount = preserveRows[0].count;

      if (deleteCount === 0) {
        console.log('⏭️ 没有需要删除的用户，跳过');
        return { cleared: 0, errors: 0 };
      }

      console.log(`👥 用户表统计:`);
      console.log(`   - 将删除: ${deleteCount} 个用户`);
      console.log(`   - 将保留: ${preserveCount} 个系统管理员`);

      // 删除非系统管理员用户
      await this.connection.execute(
        `DELETE FROM users WHERE role != 'sys_admin'`
      );

      console.log('✅ 用户表清空完成（已保留系统管理员）');
      return { cleared: deleteCount, errors: 0 };

    } catch (error) {
      const errorMsg = `清空用户表失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      return { cleared: 0, errors: 1 };
    }
  }

  /**
   * 重置自增ID
   */
  async resetAutoIncrement() {
    const tablesWithAutoIncrement = [
      'users', 'menus', 'dishes', 'dining_orders', 'venues', 
      'notifications', 'notices', 'dining_confirmation_logs'
    ];

    console.log('🔄 正在重置自增ID...');
    
    for (const tableName of tablesWithAutoIncrement) {
      try {
        const exists = await this.checkTableExists(tableName);
        if (exists) {
          await this.connection.execute(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
          console.log(`✅ 表 ${tableName} 自增ID已重置`);
        }
      } catch (error) {
        console.warn(`⚠️ 重置表 ${tableName} 自增ID失败:`, error.message);
      }
    }
  }

  /**
   * 执行完整的清空流程
   */
  async execute() {
    const stats = {
      cleared: 0,
      errors: 0,
      tables: 0
    };

    try {
      console.log('🚀 数据库备份和清空工具');
      console.log('⚠️ 警告：此操作将永久删除数据！');
      console.log('');

      // 1. 连接数据库
      await this.connect();

      // 2. 备份数据库
      const backupFile = await this.backupDatabase();

      // 3. 清空普通表
      console.log('\n📋 开始清空业务数据表...');
      for (const tableName of tablesToClear) {
        const result = await this.clearTable(tableName);
        stats.cleared += result.cleared;
        stats.errors += result.errors;
        if (result.cleared > 0) stats.tables++;
      }

      // 4. 清空用户表（保留系统管理员）
      console.log('\n👥 开始清空用户表（保留系统管理员）...');
      const userResult = await this.clearUsersTable();
      stats.cleared += userResult.cleared;
      stats.errors += userResult.errors;
      if (userResult.cleared > 0) stats.tables++;

      // 5. 重置自增ID
      console.log('\n🔄 重置自增ID...');
      await this.resetAutoIncrement();

      // 6. 显示统计信息
      console.log('\n📊 清空操作完成统计:');
      console.log(`   - 已删除记录: ${stats.cleared} 条`);
      console.log(`   - 已清空表: ${stats.tables} 个`);
      console.log(`   - 错误数量: ${stats.errors} 个`);
      console.log(`   - 备份文件: ${backupFile}`);

      if (stats.errors > 0) {
        console.log('\n⚠️ 部分操作出现错误，请检查日志');
      }

      console.log('\n✅ 数据库清空操作完成！');
      console.log(`💾 备份文件已保存: ${backupFile}`);

    } catch (error) {
      console.error('❌ 清空操作失败:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// 主函数
async function main() {
  const manager = new DatabaseManager();
  
  try {
    await manager.execute();
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('⚠️ 数据库备份和清空脚本');
  console.log('⚠️ 请确保已修改数据库连接配置！');
  console.log('⚠️ 此操作将永久删除数据！');
  console.log('');
  
  // 检查数据库配置
  if (dbConfig.password === 'your_password') {
    console.error('❌ 请先修改数据库密码配置！');
    console.error('   编辑 scripts/database-backup-and-clear.js 文件');
    console.error('   修改 dbConfig.password 为实际密码');
    process.exit(1);
  }
  
  // 确认操作
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('确认要备份并清空数据库吗？输入 "YES" 继续: ', (answer) => {
    if (answer === 'YES') {
      main();
    } else {
      console.log('❌ 操作已取消');
      process.exit(0);
    }
    rl.close();
  });
}

module.exports = DatabaseManager;
