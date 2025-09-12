import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import { initNavigationFix } from './utils/navigationFix.js';

// 初始化导航修复
initNavigationFix();

export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}
