# 🚀 快速运行指南

## 项目位置

```
/Users/cyibin/Documents/研一/项目/program2/
```

---

## 🌐 Web版本（推荐⭐）

### 3步运行

```bash
# 1. 进入Web目录
cd /Users/cyibin/Documents/研一/项目/program2/web

# 2. 安装依赖（首次运行）
npm install

# 3. 启动开发服务器
npm run dev
```

然后打开浏览器访问显示的URL（通常是 http://localhost:5173）

### 使用界面

1. **调整参数** - 右侧面板滑动条
2. **点击Start** - 开始运行算法
3. **观察动画** - 60 FPS流畅演示
4. **录制视频** - 点击Record按钮
5. **下载视频** - 点击Stop & Save

---

## 🐍 Python版本

### 3步运行

```bash
# 1. 进入项目目录
cd /Users/cyibin/Documents/研一/项目/program2

# 2. 激活虚拟环境
source venv/bin/activate

# 3. 运行程序
python main.py
```

### 不同模式

```bash
# 基础示例
python main.py

# 快速测试
python main.py --mode test

# 参数对比
python main.py --mode comparison

# 生成种群演化动画
python main.py --animate population

# 自定义参数
python main.py --mode custom --width 15 --height 15
```

---

## 🔧 重新生成迷宫数据

如需重新生成Web应用的迷宫数据：

```bash
cd /Users/cyibin/Documents/研一/项目/program2
source venv/bin/activate
python tools/generate_web_mazes.py
```

会生成到 `web/public/mazes/` 目录

---

## 📦 项目结构

```
program2/
├── main.py                  # Python启动文件
├── src/                     # Python源码
├── tools/                   # 工具脚本
├── web/                     # Web应用 ✨
│   ├── src/                 # TypeScript源码
│   ├── public/mazes/        # 迷宫数据
│   └── package.json
└── venv/                    # Python虚拟环境
```

---

## ⚡ 快速对比

| 特性 | Python | Web |
|------|--------|-----|
| 启动速度 | 慢 | 快 |
| 视觉效果 | 静态图 | 60 FPS动画 |
| 交互性 | 无 | 实时 |
| 学习曲线 | 易 | 中 |
| 推荐用途 | 学习算法 | 演示展示 |

---

## 🎯 选择建议

**首次体验** → Web版本（视觉效果好）  
**学习算法** → Python版本（代码简单）  
**制作演示** → Web版本（录制视频）  
**数据分析** → Python版本（批量测试）

---

## 📝 常见问题

### Q: Web版本端口被占用？

```bash
# 指定端口
npm run dev -- --port 3000
```

### Q: Python版本找不到模块？

```bash
# 确保激活虚拟环境
source venv/bin/activate
```

### Q: Web版本录制失败？

- 使用Chrome或Edge浏览器
- Safari可能不支持MediaRecorder

---

## 🎊 就这么简单！

选择你喜欢的版本开始体验吧！🚀

**Web版本**: `cd web && npm run dev`  
**Python版本**: `source venv/bin/activate && python main.py`

