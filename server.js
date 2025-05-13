/**
 * 服务器模块 - 提供Web服务和金融市场数据接口
 * @module server
 * @requires express - Web框架
 * @requires yahoo-finance2 - 雅虎金融数据接口
 * @requires path - 路径处理模块
 */

const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const path = require('path');

// 全局变量存储HTTP服务器实例
let httpServer = null;

/**
 * 创建并配置Express服务器
 * @function createServer
 * @returns {Object} HTTP服务器实例
 * 
 * @description
 * 1. 配置静态文件服务
 * 2. 设置主路由返回前端页面
 * 3. 创建金融数据API端点
 * 4. 启动HTTP服务器监听3000端口
 */
function createServer() {
    // 初始化Express应用
    const app = express();

    // 配置静态文件中间件（服务前端资源）
    // 注意：确保__dirname路径包含前端构建文件
    app.use(express.static(path.join(__dirname)));

    /**
     * 主路由 - 返回前端单页应用入口文件
     * @name GET /
     * @description 服务前端应用的HTML入口文件
     */
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    /**
     * 金融市场价格数据API端点
     * @name GET /api/price/:pair
     * @param {string} pair - 货币对代码（例如USDJPY）
     * 
     * @description
     * 1. 接收货币对参数并转换为雅虎金融格式（追加=X后缀）
     * 2. 获取最近24小时内的30分钟间隔数据
     * 3. 过滤无效数据点
     * 4. 格式化日期和价格数据
     * 
     * @returns {Object[]} 格式化的价格数据数组
     * @example
     * [
     *   { date: "09:30", close: 134.56 },
     *   { date: "10:00", close: 134.61 }
     * ]
     */
    app.get('/api/price/:pair', async (req, res) => {
        // 构造雅虎金融要求的货币对格式（示例：USDJPY=X）
        const pair = req.params.pair + '=X';
        
        try {
            // 设置时间范围（最近24小时）
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

            // 调用雅虎金融API获取图表数据
            const result = await yahooFinance.chart(pair, {
                period1: startDate,  // 起始时间
                period2: endDate,    // 结束时间
                interval: '30m'      // 30分钟间隔
            });

            // 数据清洗与格式化
            const formattedData = result.quotes
                // 过滤掉收盘价为null的数据点
                .filter(q => q.close != null)
                // 转换时间格式和价格精度
                .map(q => ({
                    date: new Date(q.date).toLocaleTimeString([], { 
                        hour: '2-digit',   // 12小时制
                        minute: '2-digit'  // 补零分钟数
                    }),
                    close: Number(q.close.toFixed(4))  // 保留4位小数
                }));

            res.json(formattedData);
        } catch (error) {
            // 错误处理（记录日志并返回500状态）
            console.error('API Error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to fetch price data' 
            });
        }
    });

    // 启动HTTP服务器并存储实例引用
    httpServer = app.listen(3000);
    return httpServer;
}

/**
 * 关闭HTTP服务器
 * @function closeServer
 * @description 
 * 1. 安全关闭HTTP服务器
 * 2. 清理服务器实例引用
 * 3. 输出关闭日志
 */
function closeServer() {
    if (httpServer) {
        httpServer.close(() => {
            console.log('HTTP server closed');
            httpServer = null;  // 清除实例引用
        });
    }
}

// 模块导出（支持被其他模块调用）
module.exports = { 
    createServer,  // 用于程序化启动服务器
    closeServer    // 用于程序化关闭服务器
};

/**
 * 直接启动模式 - 当文件被直接运行时启动服务器
 * @description
 * 检测是否是直接通过node启动（非模块引入方式）
 * 便于开发调试时的直接启动：node server.js
 */
if (require.main === module) {
    createServer().on('listening', () => {
      console.log(`Server running on http://localhost:3000`);
      console.log(`API Endpoint: http://localhost:3000/api/price/:pair`);
      console.log(`Press CTRL+C to stop`);
    });
}