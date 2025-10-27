# Genetic Algorithm Maze Solver - Web App

> 高性能Web可视化应用 - 使用TypeScript + Vite + Canvas 2D实现60 FPS流畅动画

## ✨ 特性

- 🎯 **纯前端实现** - 无需后端服务器
- ⚡ **60 FPS流畅动画** - 使用requestAnimationFrame
- 🎨 **Nord深色主题** - 专业美观的UI设计
- 📊 **实时可视化** - Canvas 2D高性能渲染
- 🎬 **WebM录制** - 一键导出进化过程视频
- 🔧 **完全可配置** - 所有参数实时可调
- 📱 **响应式设计** - 适配各种屏幕尺寸

## 🚀 快速开始

### 1. 安装依赖

```bash
cd maze-ga-web
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
npm run preview
```

## 📁 项目结构

```
maze-ga-web/
├── src/
│   ├── ga/                      # 遗传算法核心
│   │   ├── Individual.ts        # 个体类
│   │   ├── GeneticAlgorithm.ts  # 基础GA
│   │   └── AdaptiveGA.ts        # 自适应GA
│   ├── maze/                    # 迷宫模块
│   │   └── Maze.ts              # 迷宫类和生成器
│   ├── vis/                     # 可视化渲染
│   │   ├── MazeRenderer.ts      # 迷宫渲染器
│   │   ├── AnimationManager.ts  # 动画管理
│   │   └── FitnessChart.ts      # 适应度图表
│   ├── utils/                   # 工具函数
│   │   ├── easing.ts            # 缓动函数
│   │   └── recorder.ts          # WebM录制
│   ├── App.tsx                  # 主应用
│   ├── App.css                  # 样式
│   └── types.ts                 # 类型定义
├── public/
│   └── mazes/                   # 预设迷宫（Python生成）
│       ├── library.json
│       └── demo.json
└── package.json
```

## 🎮 使用说明

### 基本操作

1. **Start** - 开始运行遗传算法
2. **Pause/Resume** - 暂停/继续
3. **Reset** - 重置并生成新迷宫
4. **Record** - 录制WebM视频
5. **Stop & Save** - 停止录制并下载

### 参数调整

- **Maze Size** - 迷宫尺寸 (15-41)
- **Population** - 种群大小 (50-500)
- **Mutation Rate** - 变异率 (0.05-0.5)
- **Crossover Rate** - 交叉率 (0.5-0.9)
- **Adaptive Parameters** - 启用自适应参数

### 可视化说明

**主Canvas**：
- 深色背景（Nord主题）
- 白色/浅灰=通路，深灰=墙壁
- 绿色圆点=起点，红色方块=终点
- 半透明多彩线条=种群路径（前10名）
- 高亮发光线条=最佳路径（渐变色）

**底部图表**：
- 蓝色实线=最佳适应度
- 橙色虚线=平均适应度
- 实时更新

**顶部HUD**：
- 当前代数
- 最佳适应度
- 路径长度
- 状态（EVOLVING / SUCCESS）

## 🎨 渲染特性

### 高性能优化

- **离屏Canvas缓存** - 迷宫只渲染一次
- **批量绘制** - 减少draw calls
- **requestAnimationFrame** - 保证60 FPS
- **Canvas Compositing** - lighter模式实现光晕

### 视觉效果

- **发光路径** - shadowBlur + composite
- **渐变色** - 路径进度可视化
- **缓动动画** - easeInOutCubic平滑过渡
- **响应式** - 自适应屏幕大小

## 🔧 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Canvas 2D** - 渲染引擎
- **MediaRecorder API** - 视频录制

## 📊 性能指标

- **帧率**: 60 FPS (M1/M2 Mac)
- **渲染延迟**: <16ms per frame
- **内存占用**: ~50MB
- **支持迷宫**: 最大51×51

## 🛠️ 开发

### 本地开发

```bash
npm run dev
```

### 类型检查

```bash
npm run type-check
```

### 构建

```bash
npm run build
```

## 📦 部署

支持部署到：
- **Vercel** - `vercel --prod`
- **Netlify** - 拖放dist目录
- **GitHub Pages** - 使用GitHub Actions

## 🔗 相关项目

- Python版本: `../program2`
- 迷宫生成工具: `../program2/tools/generate_web_mazes.py`

## 📄 许可证

MIT License

---

**版本**: 1.2.1  
**作者**: Maze GA Project  
**最后更新**: 2025-10-27

## 更新日志

### v1.2.1 (2025-10-27)
- 修复Pause按钮无法点击的问题
- 减慢动画速度：过渡从300ms→500ms
- 增大最大步数：200→500（支持更大迷宫）
- 增大迷宫尺寸范围：最大41→51
- 增强种群可见性：显示"Population: 10 paths shown"提示
- 添加算法逻辑说明文档

### v1.2.0 (2025-10-27)
- 全新视觉设计（基于用户规格JSON）
- 配色方案：深色背景(#0f1115) + 青色发光路径
- 实现轨迹淡出效果（历史最佳路径渐隐）
- 优化HUD布局（5个实时指标）
- 添加FPS实时显示（颜色编码性能）
- 调整默认参数：种群300，变异2%，交叉80%
- 修复所有坐标错位问题

### v1.1.0 (2025-10-27)
- 修复迷宫大小改变后的错位问题
- 添加平滑路径过渡动画（300ms缓动）
- 减慢演化速度（200ms/代）让变化更明显
- 路径插值实现平滑移动效果
- 优化坐标系统使用offset居中显示

### v1.0.0 (2025-10-27)
- 初始版本发布
