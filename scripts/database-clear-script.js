/**
 * 数据库清空脚本
 * 用于清空智慧物业管理系统的数据库记录，保留表结构和系统管理员
 * 
 * ⚠️ 警告：这是一个危险操作，会永久删除数据！
 * 请确保在操作前已备份数据库
 */

const mysql = require('mysql2/promise');

// 数据库配置 - 请根据实际情况修改
const dbConfig = {
  host: 'uauotggfeiao.sealosbja.site',  // 远程数据库地址
  port: 3306,
  user: 'smart_user',                    // 数据库用户名
  password: 'your_password',             // 数据库密码 - 需要替换为实际密码
  database: 'smart_property',            // 数据库名称
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

// 需要保留系统管理员的表
const userTablesToPreserve = [
  'users'  // 只清空非系统管理员用户
];

class DatabaseClearer {
  constructor() {
    this.connection = null;
    this.stats = {
      cleared: 0,
      preserved: 0,
      errors: []
    };
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
   * 检查表是否存在
   */
  async checkTableExists(tableName) {
    try {
      const [rows] = await this.connection.execute(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = ? AND table_name = ?`,
        [dbConfig.database, tableName]
      );
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
        return;
      }

      const count = await this.getTableCount(tableName);
      if (count === 0) {
        console.log(`⏭️ 表 ${tableName} 已为空，跳过`);
        return;
      }

      console.log(`🗑️ 正在清空表 ${tableName} (${count} 条记录)...`);
      
      await this.connection.execute(`DELETE FROM ${tableName}`);
      
      this.stats.cleared += count;
      console.log(`✅ 表 ${tableName} 清空完成`);
      
    } catch (error) {
      const errorMsg = `清空表 ${tableName} 失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
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
        return;
      }

      // 先统计要删除和保留的用户数
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
        return;
      }

      console.log(`👥 用户表统计:`);
      console.log(`   - 将删除: ${deleteCount} 个用户`);
      console.log(`   - 将保留: ${preserveCount} 个系统管理员`);

      // 删除非系统管理员用户
      await this.connection.execute(
        `DELETE FROM users WHERE role != 'sys_admin'`
      );

      this.stats.cleared += deleteCount;
      this.stats.preserved += preserveCount;
      console.log('✅ 用户表清空完成（已保留系统管理员）');

    } catch (error) {
      const errorMsg = `清空用户表失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
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
   * 执行清空操作
   */
  async clearDatabase() {
    console.log('🚀 开始清空数据库...');
    console.log('⚠️ 警告：此操作将永久删除数据！');
    
    try {
      // 1. 清空普通表
      console.log('\n📋 第一步：清空业务数据表...');
      for (const tableName of tablesToClear) {
        await this.clearTable(tableName);
      }

      // 2. 清空用户表（保留系统管理员）
      console.log('\n👥 第二步：清空用户表（保留系统管理员）...');
      await this.clearUsersTable();

      // 3. 重置自增ID
      console.log('\n🔄 第三步：重置自增ID...');
      await this.resetAutoIncrement();

      // 4. 显示统计信息
      console.log('\n📊 清空操作完成统计:');
      console.log(`   - 已删除记录: ${this.stats.cleared} 条`);
      console.log(`   - 已保留记录: ${this.stats.preserved} 条`);
      console.log(`   - 错误数量: ${this.stats.errors.length} 个`);

      if (this.stats.errors.length > 0) {
        console.log('\n❌ 错误详情:');
        this.stats.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }

      console.log('\n✅ 数据库清空操作完成！');

    } catch (error) {
      console.error('❌ 清空操作失败:', error.message);
      throw error;
    }
  }
}

// 主函数
async function main() {
  const clearer = new DatabaseClearer();
  
  try {
    await clearer.connect();
    await clearer.clearDatabase();
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  } finally {
    await clearer.disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('⚠️ 数据库清空脚本');
  console.log('⚠️ 请确保已备份数据库！');
  console.log('⚠️ 此操作将永久删除数据！');
  console.log('');
  
  // 检查数据库配置
  if (dbConfig.password === 'your_password') {
    console.error('❌ 请先修改数据库密码配置！');
    console.error('   编辑 scripts/database-clear-script.js 文件');
    console.error('   修改 dbConfig.password 为实际密码');
    process.exit(1);
  }
  
  // 确认操作
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('确认要清空数据库吗？输入 "YES" 继续: ', (answer) => {
    if (answer === 'YES') {
      main();
    } else {
      console.log('❌ 操作已取消');
      process.exit(0);
    }
    rl.close();
  });
}

module.exports = DatabaseClearer;
