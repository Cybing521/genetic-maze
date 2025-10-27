# 遗传算法求解迷宫问题

> 使用遗传算法（Genetic Algorithm）寻找迷宫最优路径的Python项目

[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-v1.6.0-orange.svg)](#版本历史)

---

## 📋 目录

- [项目简介](#项目简介)
- [主要特性](#主要特性)
- [快速开始](#快速开始)
- [运行模式](#运行模式)
- [可视化功能](#可视化功能)
- [算法原理](#算法原理)
- [配置参数](#配置参数)
- [安装指南](#安装指南)
- [使用示例](#使用示例)
- [性能参考](#性能参考)
- [常见问题](#常见问题)
- [扩展建议](#扩展建议)
- [版本历史](#版本历史)

---

## 项目简介

遗传算法是一种模拟自然选择和遗传机制的优化算法。本项目将遗传算法应用于迷宫求解问题，通过模拟"适者生存"的进化过程来寻找从起点到终点的最优路径。

### 主要特性

- 🧬 **遗传算法实现**: 完整的遗传算法框架（选择、交叉、变异）
- 🗺️ **迷宫生成**: 自动生成随机迷宫，可调节复杂度和密度
- 📊 **可视化优化**: 专业级可视化效果
  - ✨ 自动配置中文字体（跨平台支持）
  - 📏 动态调整图像大小
  - 🎨 Nord主题深色UI
  - 📈 完整的迭代过程仪表盘
  - 🌈 渐变色路径显示
  - 🎬 **进化动画** (v1.3.0+): 生成GIF动画展示每一代的演化过程
- 🔧 **多种模式**: basic（基础示例）、test（快速测试）、comparison（参数对比）、custom（自定义）
- 📈 **性能分析**: 参数对比实验功能
- 🐍 **单文件启动**: 仅需运行`main.py`

### 项目结构

```
program2/
├── main.py              # 主程序（唯一入口）✨
├── requirements.txt     # 依赖包列表
├── README.md           # 本文档
├── .gitignore          # Git忽略配置
├── .cursorrules        # Cursor规则配置
├── venv/               # 虚拟环境（本地）
└── src/                # 源代码目录
    ├── __init__.py
    ├── maze.py         # 迷宫类和生成器
    ├── genetic_algorithm.py # 遗传算法核心
    └── visualizer.py   # 可视化模块
```

---

## 快速开始

### 1. 环境准备

```bash
# 克隆或下载项目
cd program2

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 运行程序

```bash
# 基础示例（推荐首次运行）
python main.py

# 或指定模式
python main.py --mode basic

# 生成进化动画（新功能！）
python main.py --animate best          # 最佳路径演化
python main.py --animate population    # 种群演化（展示多个体的随机过程）✨
python main.py --animate both          # 生成两种动画
```

你将看到：
1. ✅ 迷宫生成（终端文本展示）
2. ✅ 算法运行进度（代数、适应度）
3. ✅ 完整的进化过程仪表盘
4. ✅ 最终结果统计
5. ✅ 进化动画GIF（如果使用--animate）

### 3. 查看帮助

```bash
python main.py --help
```

---

## 运行模式

### 📌 basic - 基础示例（默认）

生成21×21迷宫，使用标准参数运行算法。

```bash
python main.py
# 或
python main.py --mode basic
```

**特点**：
- 迷宫大小: 21×21
- 种群大小: 100
- 最大代数: 500
- 显示完整的进化仪表盘

---

### 🔬 test - 快速测试

使用小迷宫（11×11）快速验证算法功能。

```bash
python main.py --mode test
```

**特点**：
- 迷宫大小: 11×11
- 种群大小: 50
- 最大代数: 200
- 运行时间: ~5秒
- 显示紧凑型结果图

---

### 📊 comparison - 参数对比

比较不同种群大小（50、100、200）的性能差异。

```bash
python main.py --mode comparison
```

**特点**：
- 同一迷宫测试3种配置
- 并排对比可视化
- 分析参数影响

---

### ⚙️ custom - 自定义配置

使用自定义参数运行算法。

```bash
python main.py --mode custom \
    --width 31 \
    --height 31 \
    --population 150 \
    --generations 1000 \
    --mutation 0.2 \
    --crossover 0.8
```

**可选参数**：

| 参数 | 说明 | 默认值 | 推荐范围 |
|------|------|--------|----------|
| `--width` | 迷宫宽度 | 21 | 11-51 |
| `--height` | 迷宫高度 | 21 | 11-51 |
| `--population` | 种群大小 | 100 | 50-500 |
| `--generations` | 最大代数 | 500 | 200-2000 |
| `--mutation` | 变异率 | 0.15 | 0.05-0.3 |
| `--crossover` | 交叉率 | 0.7 | 0.6-0.9 |

---

## 可视化功能

### 🎬 进化动画 (v1.3.0+ 新功能)

生成GIF动画，展示算法每一代的演化过程！

#### 两种动画模式

**1. 最佳路径演化动画** (`--animate best`)
- 展示每一代的最佳个体路径
- 适合观察算法收敛过程
- 文件：`evolution_best.gif`

**2. 种群演化动画** (`--animate population`) ⭐ v1.4.0新增
- 同时展示前10个优秀个体的路径
- 体现随机性和种群多样性
- 显示种群从分散到收敛的过程
- 包含种群多样性指标图表
- 文件：`evolution_population.gif`

#### 使用方法

```bash
# 生成最佳路径动画
python main.py --animate best

# 生成种群演化动画（推荐！展示随机无序过程）
python main.py --animate population

# 生成两种动画
python main.py --animate both
```

#### 动画内容

**最佳路径动画** (`evolution_best.gif`)：

**左侧**：迷宫和最佳路径
- 实时显示每一代的最佳路径
- 路径用渐变色表示
- 动态更新代数、适应度、步数
- 找到解决方案时背景变绿

**右侧**：适应度曲线
- 灰色虚线：最终的完整曲线（参考）
- 彩色实线：当前进化到的部分
- 红色圆点：当前代的适应度位置
- 实时显示算法收敛过程

---

**种群演化动画** (`evolution_population.gif`) ⭐ 新增：

**左侧**：迷宫和多条路径（前10名个体）
- 🌈 同时显示10个个体的路径
- 颜色越亮表示适应度越高
- 透明度表示排名（第1名最不透明）
- 最佳路径用粗线高亮显示
- 体现种群的**随机性和无序性**

**右上**：适应度演化曲线
- 最佳适应度和平均适应度
- 实时动态绘制

**右下**：种群多样性指标
- 显示适应度的标准差
- 反映种群的分散程度
- 观察从**多样性→收敛**的过程

#### 代码示例

**最佳路径动画**：
```python
from src.maze import Maze
from src.genetic_algorithm import GeneticAlgorithm
from src.visualizer import MazeVisualizer

maze = Maze(21, 21)
maze.generate_maze()
ga = GeneticAlgorithm(maze, population_size=100, max_generations=200)
best = ga.run()

viz = MazeVisualizer(maze)
viz.create_evolution_animation(
    best_individuals_history=ga.best_individuals_history,
    fitness_history=ga.fitness_history,
    save_path="best_evolution.gif",
    fps=5
)
```

**种群演化动画** ⭐ 新增：
```python
# 同样的设置，但使用种群历史
viz.create_population_evolution_animation(
    population_history=ga.population_history,
    fitness_history=ga.fitness_history,
    save_path="population_evolution.gif",
    fps=5,
    show_diversity=True  # 显示多样性指标
)
```

#### 动画参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `save_path` | `evolution.gif` | 输出文件路径 |
| `fps` | `5` | 帧率（每秒帧数）|
| `interval_ms` | `200` | 每帧间隔（毫秒）|

**文件格式**：
- `.gif` - GIF动画（推荐，无需额外依赖）
- `.mp4` - MP4视频（需要安装ffmpeg）

---

### 🎨 进化过程仪表盘 (v1.1.0+)

运行程序后会显示一个综合仪表盘，实时展示算法迭代过程：

#### 布局结构

```
┌─────────────────┬──────────────────────────┐
│                 │   适应度演化曲线          │
│   迷宫和        │   - Best Fitness         │
│   最佳路径      │   - Average Fitness      │
│   (渐变色显示)  │   - 填充区域显示差异     │
│                 ├────────────┬─────────────┤
│                 │  统计信息  │  收敛分析   │
│                 │  详细面板  │  改进点标注 │
└─────────────────┴────────────┴─────────────┘
```

#### 四大组件

**1. 迷宫和最佳路径（左侧大图）**
- 使用渐变色显示路径进度（蓝→紫）
- 起点/终点醒目标记（绿色圆圈/红色方块）
- 白色边框高亮关键位置
- 顶部显示状态：SUCCESS ✓ 或 INCOMPLETE ⚠

**2. 适应度演化曲线（右上）**
- 蓝色实线：最佳适应度（Best Fitness）
- 橙色虚线：平均适应度（Average Fitness）
- 填充区域：显示种群多样性
- 标记采样点：每20代标注一次

**3. 统计信息面板（右中）**
```
STATISTICS
━━━━━━━━━━━━━━━━
Total Generations: 150
Best Fitness: 10485.00
Path Length: 43
Unique Steps: 38
Success Rate: 88.4%
━━━━━━━━━━━━━━━━
Status: ✓ Completed
```

**4. 收敛分析（右下）**
- 三角形标记：每次适应度改进的代数
- 趋势线：显示收敛速度
- 帮助分析算法效率

### 🎨 Nord主题配色

```python
深色背景: #2E3440
墙壁颜色: #4C566A
路径颜色: #88C0D0 (渐变)
起点颜色: #A3BE8C (绿)
终点颜色: #BF616A (红)
文字颜色: #ECEFF4
强调色:   #5E81AC
```

### 💾 保存图片

```python
from src.maze import Maze
from src.genetic_algorithm import GeneticAlgorithm
from src.visualizer import MazeVisualizer

maze = Maze(21, 21)
maze.generate_maze()
ga = GeneticAlgorithm(maze)
best = ga.run()

viz = MazeVisualizer(maze)
viz.plot_evolution_dashboard(
    fitness_history=ga.fitness_history,
    best_individual=best,
    save_path="result.png"  # 保存图片
)
```

支持格式：`.png`, `.jpg`, `.pdf`, `.svg`

---

## 算法原理

### 遗传算法流程

```
1. 初始化种群
   ↓
2. 评估适应度
   ↓
3. 选择（锦标赛选择）
   ↓
4. 交叉（单点交叉 + 路径修复）
   ↓
5. 变异（随机片段重生成）
   ↓
6. 精英保留（保护最优个体）
   ↓
7. 判断终止条件
   - 找到解决方案 → 结束
   - 达到最大代数 → 结束
   - 否则返回步骤2
```

### 适应度函数

```python
if 到达终点:
    基础分 = 10000
    步数奖励 = (最大步数 - 实际步数) × 10
    唯一性奖励 = 不重复步数 × 5
    适应度 = 基础分 + 步数奖励 + 唯一性奖励
else:
    距离分 = 1000 / (1 + 到终点距离)
    长度奖励 = min(路径长度, 最大步数/2)
    唯一率奖励 = (不重复步数 / 总步数) × 100
    适应度 = 距离分 + 长度奖励 + 唯一率奖励
```

**设计理念**：
- 到达终点是最高优先级（基础分10000）
- 鼓励路径简短（步数奖励）
- 避免重复访问（唯一性奖励）
- 未到达时鼓励接近终点（距离分）

### 核心操作

**选择（Selection）**：锦标赛选择
- 随机选5个个体
- 选择其中适应度最高的

**交叉（Crossover）**：单点交叉
- 随机选择交叉点
- 交换父代基因片段
- 修复不连续路径

**变异（Mutation）**：随机片段重生成
- 随机选择变异点
- 从该点重新生成路径
- 保持路径有效性

**精英保留（Elitism）**：
- 保留前2名优秀个体
- 确保最优解不丢失

---

## 配置参数

### 算法参数详解

| 参数 | 说明 | 默认值 | 影响 |
|------|------|--------|------|
| **population_size** | 种群大小 | 100 | 越大越多样，但计算慢 |
| **max_generations** | 最大代数 | 500 | 越多越可能找到解 |
| **mutation_rate** | 变异率 | 0.15 | 过高不稳定，过低难跳出局部最优 |
| **crossover_rate** | 交叉率 | 0.7 | 影响信息交换速度 |
| **elitism_count** | 精英数量 | 2 | 保护最优解 |
| **max_steps** | 单个体最大步数 | 200 | 限制路径长度 |

### 迷宫参数

| 参数 | 说明 | 默认值 | 影响 |
|------|------|--------|------|
| **width** | 迷宫宽度 | 21 | 影响难度和运行时间 |
| **height** | 迷宫高度 | 21 | 影响难度和运行时间 |
| **complexity** | 复杂度 | 0.75 | 0-1，墙壁复杂程度 |
| **density** | 密度 | 0.75 | 0-1，墙壁密集程度 |

### 参数调优建议

**场景1：快速测试**
```bash
python main.py --mode custom \
    --width 11 --height 11 \
    --population 50 --generations 200
```

**场景2：标准求解**
```bash
python main.py --mode custom \
    --width 21 --height 21 \
    --population 100 --generations 500
```

**场景3：困难迷宫**
```bash
python main.py --mode custom \
    --width 41 --height 41 \
    --population 200 --generations 1500
```

---

## 安装指南

### 系统要求

- **Python**: 3.7 或更高版本
- **操作系统**: Windows, Linux, 或 macOS
- **内存**: 至少 512MB RAM
- **磁盘空间**: 约 50MB

### 依赖包

```txt
numpy>=1.21.0       # 数值计算
matplotlib>=3.4.0   # 数据可视化
```

### 详细安装步骤

#### 1. 检查Python版本

```bash
python --version
# 或
python3 --version
```

确保版本 >= 3.7

#### 2. 创建虚拟环境（推荐）

**macOS/Linux**:
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows**:
```bash
python -m venv venv
venv\Scripts\activate
```

**Windows PowerShell** (如遇权限问题):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
venv\Scripts\activate
```

#### 3. 安装依赖

```bash
pip install -r requirements.txt
```

**如遇网络问题，使用国内镜像**:
```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

#### 4. 验证安装

```bash
python main.py --mode test
```

如果看到迷宫和进度输出，说明安装成功！

### 常见安装问题

**Q: matplotlib安装失败？**
```bash
# 使用预编译包
pip install --only-binary :all: matplotlib

# 或升级pip
pip install --upgrade pip setuptools wheel
pip install matplotlib
```

**Q: 中文显示异常？**

v1.1.0+ 已自动配置中文字体，无需手动设置。

**Q: 无图形界面怎么办？**

使用保存图片功能：
```python
viz.plot_evolution_dashboard(..., save_path="output.png")
```

---

## 使用示例

### 示例1：基础使用

```python
from src.maze import Maze
from src.genetic_algorithm import GeneticAlgorithm
from src.visualizer import MazeVisualizer

# 创建迷宫
maze = Maze(21, 21)
maze.generate_maze()

# 打印迷宫
print(maze)

# 运行遗传算法
ga = GeneticAlgorithm(maze, population_size=100, max_generations=500)
best = ga.run()

# 可视化
viz = MazeVisualizer(maze)
viz.plot_evolution_dashboard(ga.fitness_history, best)
```

### 示例2：自定义配置

```python
# 创建大迷宫
maze = Maze(width=41, height=41)
maze.generate_maze(complexity=0.8, density=0.8)

# 使用更激进的参数
ga = GeneticAlgorithm(
    maze=maze,
    population_size=200,
    max_generations=1500,
    mutation_rate=0.25,
    crossover_rate=0.8,
    elitism_count=5,
    max_steps=400
)

best = ga.run(verbose=True)
```

### 示例3：保存结果

```python
# 运行算法
ga = GeneticAlgorithm(maze)
best = ga.run()

# 保存可视化结果
viz = MazeVisualizer(maze)

# 保存仪表盘
viz.plot_evolution_dashboard(
    ga.fitness_history, 
    best,
    save_path="dashboard.png"
)

# 保存紧凑图
viz.plot_maze_compact(
    path=best.path,
    title="Solution",
    generation=ga.generation,
    fitness=best.fitness,
    save_path="solution.png"
)
```

### 示例4：批量实验

```python
import matplotlib.pyplot as plt

results = []
for size in [50, 100, 150, 200]:
    print(f"Testing population size: {size}")
    
    maze = Maze(21, 21)
    maze.generate_maze()
    
    ga = GeneticAlgorithm(maze, population_size=size, max_generations=300)
    best = ga.run(verbose=False)
    
    results.append({
        'size': size,
        'fitness': best.fitness,
        'reached': best.reached_end,
        'length': len(best.path)
    })

# 分析结果
for r in results:
    print(f"Size {r['size']}: Fitness={r['fitness']:.2f}, "
          f"Success={r['reached']}, Length={r['length']}")
```

---

## 性能参考

### 测试环境

- **CPU**: Intel Core i5 / Apple M1
- **内存**: 8GB RAM
- **Python**: 3.9+
- **OS**: macOS / Linux / Windows

### 性能数据

| 迷宫大小 | 种群 | 代数 | 平均时间 | 成功率 | 平均路径长度 |
|----------|------|------|----------|--------|--------------|
| 11×11 | 50 | 200 | ~5秒 | >90% | 15-25 |
| 21×21 | 100 | 500 | ~30秒 | >70% | 35-55 |
| 31×31 | 150 | 1000 | ~120秒 | >60% | 60-90 |
| 41×41 | 200 | 1500 | ~300秒 | >50% | 90-130 |

*注: 实际性能因硬件和迷宫复杂度而异*

### 优化建议

**提高成功率**：
- 增加种群大小
- 增加最大代数
- 调整变异率（0.15-0.2）

**提高速度**：
- 减小迷宫尺寸
- 减小种群大小
- 提前终止（找到解即停止）

**提高路径质量**：
- 延长运行时间
- 调整适应度函数权重
- 降低变异率保持优良基因

---

## 常见问题

### Q1: 中文显示为方块？ ✅ 已解决

**v1.1.0+ 自动配置中文字体**：
- macOS: `Arial Unicode MS`
- Windows: `Microsoft YaHei`
- Linux: `Droid Sans Fallback`

失败时自动使用英文标签，无需担心。

### Q2: 图像太大？ ✅ 已优化

**v1.1.0+ 动态调整图像大小**：
- 小迷宫(≤15): 6×6英寸
- 中等(≤25): 8×8英寸
- 大型(>25): 10×10英寸

图像体积减少约**75%**。

### Q3: 算法无法找到解决方案？

**解决方法**：
```bash
# 方法1: 增加种群和代数
python main.py --mode custom --population 200 --generations 1000

# 方法2: 降低迷宫难度
python main.py --mode custom --width 15 --height 15

# 方法3: 调整变异率
python main.py --mode custom --mutation 0.2
```

**多次运行**：由于算法随机性，多运行几次可能找到解。

### Q4: 可视化无法显示？

**无图形环境**（SSH远程）：
```python
# 设置非交互式后端
import matplotlib
matplotlib.use('Agg')

# 保存图片
viz.plot_evolution_dashboard(..., save_path='result.png')
```

### Q5: 运行速度慢？

**优化方法**：
- 使用`verbose=False`减少输出
- 减小种群大小
- 减小迷宫尺寸
- 使用`--mode test`快速测试

### Q6: 如何退出虚拟环境？

```bash
deactivate
```

### Q7: 如何删除虚拟环境？

```bash
# 先退出虚拟环境
deactivate

# 删除虚拟环境目录
rm -rf venv  # macOS/Linux
rd /s /q venv  # Windows
```

---

## 扩展建议

### 短期扩展

#### 1. 算法改进
- **自适应参数**: 根据收敛情况动态调整变异率
- **多种群**: 岛屿模型，多个种群并行进化
- **混合算法**: 结合A*算法进行局部优化

#### 2. 功能增强
- **多目标优化**: 同时优化路径长度和平滑度
- **动态障碍**: 支持移动障碍物
- **多起终点**: 寻找访问多个目标点的最优路径

#### 3. 界面优化
- **实时可视化**: 显示每代最优路径的变化
- **Web界面**: Flask/Django部署
- **交互式参数调整**: 实时修改参数观察效果

### 长期扩展

#### 1. 应用拓展
- **3D迷宫**: 扩展到三维空间
- **机器人路径规划**: 实际应用场景
- **游戏AI**: NPC寻路行为
- **物流优化**: 配送路径规划

#### 2. 性能优化
- **GPU加速**: 使用CUDA加速计算
- **并行计算**: multiprocessing多核利用
- **算法向量化**: NumPy优化

#### 3. 研究方向
- **深度学习结合**: 神经网络编码路径
- **强化学习对比**: 与Q-Learning比较
- **自适应遗传算子**: 学习最佳操作策略

### 参考实现

**自适应变异率**:
```python
def adaptive_mutation_rate(generation, max_gen):
    """根据代数调整变异率"""
    return 0.3 * (1 - generation / max_gen) + 0.05
```

**多起终点**:
```python
class MultiTargetMaze(Maze):
    def __init__(self, width, height, targets):
        super().__init__(width, height)
        self.targets = targets  # 多个目标点
```

---

## 🌐 Web版本

现在提供了功能完整的Web应用版本！

📂 **位置**: `../maze-ga-web/`  
🚀 **运行**: `cd ../maze-ga-web && npm install && npm run dev`  
✨ **特性**: 60 FPS Canvas动画、实时参数调整、WebM录制

详见：[Web App README](../maze-ga-web/README.md)

---

## 版本历史

查看详细的更新内容请使用：`git log`

- **v1.6.0** (2025-10-27) - 创建完整Web版本（TypeScript + Vite）+ 工具脚本
- **v1.5.1** (2025-10-27) - Bug修复和UI改进
- **v1.5.0** (2025-10-27) - 高级算法：自适应参数、岛屿模型、混合A*、路径平滑优化
- **v1.4.0** (2025-10-27) - 种群演化动画
- **v1.3.0** (2025-10-27) - 进化动画生成
- **v1.2.0** (2025-10-27) - 文档重构和版本管理
- **v1.1.0** (2025-10-27) - 可视化优化和UI美化
- **v1.0.0** (2025-10-27) - 初始版本发布

---

## 使用场景

- 🎓 **教学**: 理解遗传算法原理和进化过程
- 🔬 **研究**: 测试不同遗传策略和参数影响
- 🤖 **应用**: 路径规划、游戏AI开发
- 📚 **学习**: Python编程实践和算法可视化

---

## 依赖项

- **Python** 3.7+
- **numpy** >=1.21.0
- **matplotlib** >=3.4.0

---

## 许可证

MIT License - 详见LICENSE文件

---

## 贡献

欢迎提交问题和改进建议！

---

## 联系方式

- **项目**: Maze GA Project
- **当前版本**: v1.6.0
- **最后更新**: 2025-10-27

---

**⭐ 如果这个项目对你有帮助，请给个星标！**
