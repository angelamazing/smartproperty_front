// 🚨 重要：必须最先导入早期日期修复，在任何其他代码之前
import './utils/earlyDateFix.js';

import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import { initNavigationFix } from './utils/navigationFix.js';
import { initMiniProgramDateFix } from './utils/miniProgramDateFix.js';

// 初始化导航修复
initNavigationFix();

// 初始化微信小程序日期兼容性修复（安全版本）
try {
  initMiniProgramDateFix();
} catch (error) {
  console.warn('⚠️ 微信小程序日期修复初始化失败:', error);
}

export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}
