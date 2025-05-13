/**
 * Electron主进程模块 - 负责应用生命周期管理和窗口控制
 * @module main
 * @requires electron - Electron框架
 * @requires ./server - 自定义后端服务模块
 * @requires path - 路径处理模块
 */

const { app, BrowserWindow } = require('electron');
const { createServer, closeServer } = require('./server');
const path = require('path');

// 模块路径修正（解决打包环境依赖问题）
// 说明：确保在不同打包环境下都能正确找到node_modules
process.env.NODE_MODULE_PATH = path.join(__dirname, 'node_modules');
require('module').globalPaths.push(process.env.NODE_MODULE_PATH);

// 全局窗口引用
let mainWindow = null;

/**
 * 创建应用窗口和后台服务
 * @function createWindow
 * @description
 * 1. 启动HTTP服务器
 * 2. 配置Electron窗口参数
 * 3. 加载前端界面
 * 4. 开发模式开启调试工具
 * 5. 注册窗口关闭清理事件
 */
function createWindow() {
    // 初始化后端HTTP服务（端口3000）
    createServer();

    // 创建主浏览器窗口配置
    mainWindow = new BrowserWindow({
        width: 1280,         // 默认宽度
        height: 800,        // 默认高度
        minWidth: 800,      // 最小宽度限制
        minHeight: 600,     // 最小高度限制
        webPreferences: {
            nodeIntegration: true,       // 启用Node集成
            contextIsolation: false      // 关闭上下文隔离（注意安全风险）
        },
        icon: path.join(__dirname, 'assets/icon.png')  // 应用图标路径
    });

    // 加载本地开发服务器地址
    mainWindow.loadURL('http://localhost:3000');

    // 开发模式配置
    if (process.env.NODE_ENV === 'development') {
        // 开启开发者工具（默认右侧显示）
        mainWindow.webContents.openDevTools({ mode: 'right' });
    }

    // 窗口关闭事件处理
    mainWindow.on('closed', () => {
        closeServer();     // 关闭HTTP服务器
        mainWindow = null; // 释放窗口引用（GC准备）
    });
}

/**
 * 应用生命周期管理
 * @description Electron标准生命周期事件处理
 */

// 当Electron完成初始化时创建窗口
app.whenReady().then(createWindow);

// 所有窗口关闭时的退出逻辑（macOS特殊处理）
app.on('window-all-closed', () => {
    // macOS通常应用会保持激活直到明确退出
    if (process.platform !== 'darwin') {
        closeServer();   // 关闭后台服务
        app.quit();      // 退出应用进程
    }
});

// macOS应用dock图标点击事件（重新创建窗口）
app.on('activate', () => {
    // 当没有活动窗口时重新创建主窗口
    if (mainWindow === null) {
        createWindow();
    }
});

/**
 * 进程信号处理 - 实现优雅退出
 * @description 捕获系统终止信号执行清理操作
 */
process.on('SIGTERM', () => {
    closeServer();    // 关闭HTTP服务器
    app.quit();       // 强制退出应用
});

/* 安全配置提示（维护注意事项）
1. 生产环境应考虑启用 contextIsolation 和禁用 nodeIntegration
2. 图标文件路径需要确保在不同打包环境下有效
3. 开发环境检测逻辑可扩展为根据构建模式判断
4. 窗口尺寸限制可能需要根据实际需求调整
5. SIGTERM信号处理在容器化部署环境中尤为重要
*/