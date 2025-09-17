/*
 * @Author: Jerry Han angelamazing@163.com
 * @Date: 2025-09-17 17:09:30
 * @LastEditors: Jerry Han angelamazing@163.com
 * @LastEditTime: 2025-09-17 17:14:56
 * @FilePath: \my-vue3-project\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 🚨 重要：必须最先导入早期日期修复，在任何其他代码之前
import './utils/earlyDateFix.js';

import {
	createSSRApp
} from "vue";
import App from "./App.vue";

// 注意：早期日期修复已经足够解决iOS兼容性问题
// 其他修复工具在需要时可以手动调用
console.log('✅ 应用启动，早期日期修复已激活');

export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}
