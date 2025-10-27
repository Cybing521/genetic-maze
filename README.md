# 遗传算法求解迷宫问题

这是一个使用遗传算法（Genetic Algorithm）来寻找迷宫最优路径的Python项目。项目演示了如何将遗传算法应用于路径规划问题。

## 项目简介

遗传算法是一种模拟自然选择和遗传机制的优化算法。本项目将遗传算法应用于迷宫求解问题，通过模拟"适者生存"的进化过程来寻找从起点到终点的最优路径。

### 主要特性

- 🧬 **遗传算法实现**: 完整的遗传算法框架（选择、交叉、变异）
- 🗺️ **迷宫生成**: 自动生成随机迷宫
- 📊 **可视化优化**: 迷宫、路径和适应度演化的可视化
  - ✨ 自动配置中文字体（跨平台）
  - 📏 动态调整图像大小
  - 🎨 Nord主题深色UI
  - 📈 完整的迭代过程仪表盘
  - 🌈 渐变色路径显示
- 🔧 **多种模式**: 基础示例、测试、对比、自定义
- 📈 **性能分析**: 参数对比实验功能

## 项目结构

```
program2/
├── main.py              # 主程序（唯一入口）
├── requirements.txt     # 依赖包列表
├── README.md           # 本文档
├── venv/               # 虚拟环境（不上传到git）
├── src/                # 源代码目录
│   ├── __init__.py
│   ├── maze.py         # 迷宫类和生成器
│   ├── genetic_algorithm.py # 遗传算法核心
│   └── visualizer.py   # 可视化模块
└── docs/               # 文档目录
    ├── QUICKSTART.md
    ├── PROJECT_SUMMARY.md
    ├── INSTALL.md
    └── PROJECT_COMPLETION.md
```

## 快速开始

### 1. 环境准备

```bash
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

# 快速测试
python main.py --mode test

# 参数对比
python main.py --mode comparison

# 自定义参数
python main.py --mode custom --width 15 --height 15 --population 150
```

### 3. 查看帮助

```bash
python main.py --help
```

## 运行模式

### basic（基础示例）
默认模式，生成21×21迷宫，使用标准参数运行算法并显示可视化结果。

```bash
python main.py
# 或
python main.py --mode basic
```

### test（快速测试）
使用小迷宫（11×11）快速验证算法功能。

```bash
python main.py --mode test
```

### comparison（参数对比）
比较不同种群大小（50、100、200）的性能差异。

```bash
python main.py --mode comparison
```

### custom（自定义配置）
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

## 参数说明

| 参数 | 说明 | 默认值 | 推荐范围 |
|------|------|--------|----------|
| `--width` | 迷宫宽度 | 21 | 11-51 |
| `--height` | 迷宫高度 | 21 | 11-51 |
| `--population` | 种群大小 | 100 | 50-500 |
| `--generations` | 最大代数 | 500 | 200-2000 |
| `--mutation` | 变异率 | 0.15 | 0.05-0.3 |
| `--crossover` | 交叉率 | 0.7 | 0.6-0.9 |

## 算法原理

### 遗传算法流程

1. **初始化种群**: 随机生成路径个体
2. **适应度评估**: 评估每个个体的质量
3. **选择**: 锦标赛选择优秀个体
4. **交叉**: 交换父代基因产生子代
5. **变异**: 随机修改路径片段
6. **精英保留**: 保留最优个体
7. **迭代**: 重复直到找到解或达到代数上限

### 适应度函数

```python
如果到达终点:
    适应度 = 10000 + (最大步数 - 路径长度) × 10 + 不重复步数 × 5
否则:
    适应度 = 1000 / (1 + 到终点距离) + 路径长度奖励 + 不重复率 × 100
```

## 依赖项

- **Python**: 3.7+
- **numpy**: >=1.21.0 (数值计算)
- **matplotlib**: >=3.4.0 (可视化)

## 使用场景

- 🎓 **教学**: 理解遗传算法原理
- 🔬 **研究**: 测试不同遗传策略
- 🤖 **应用**: 路径规划、游戏AI
- 📚 **学习**: Python编程实践

## 可视化功能 (v1.1.0 新增)

### 进化过程仪表盘

运行程序后会显示一个综合仪表盘，包含：

1. **迷宫和最佳路径** (左侧)
   - 渐变色显示路径进度
   - 起点/终点醒目标记

2. **适应度演化曲线** (右上)
   - 最佳适应度和平均适应度对比
   - 填充区域显示差异

3. **统计信息面板** (右中)
   - 代数、适应度、路径长度
   - 成功率和唯一步数

4. **收敛分析** (右下)
   - 标注关键改进点
   - 分析收敛速度

详细说明请查看 `docs/VISUALIZATION_GUIDE.md`

---

## 常见问题

### Q1: 中文显示为方块？

**已解决！** v1.1.0 自动配置中文字体：
- macOS: Arial Unicode MS
- Windows: Microsoft YaHei  
- Linux: Droid Sans Fallback

失败时自动使用英文标签。

### Q2: 图像太大？

**已优化！** 根据迷宫尺寸自动调整：
- 小迷宫(≤15): 6×6英寸
- 中等(≤25): 8×8英寸
- 大型(>25): 10×10英寸

### Q3: 算法无法找到解决方案？

增加种群大小和代数：
```bash
python main.py --mode custom --population 200 --generations 1000
```

### Q4: 可视化无法显示？

无图形环境下保存图片：
```python
viz.plot_evolution_dashboard(
    fitness_history=ga.fitness_history,
    best_individual=best,
    save_path='result.png'  # 保存图片
)
```

### Q5: 在虚拟环境中运行？

```bash
# 确保激活虚拟环境
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# 然后运行
python main.py
```

## 性能参考

| 迷宫大小 | 种群 | 代数 | 平均时间 | 成功率 |
|----------|------|------|----------|--------|
| 11×11 | 50 | 200 | ~5秒 | >90% |
| 21×21 | 100 | 500 | ~30秒 | >70% |
| 31×31 | 150 | 1000 | ~120秒 | >60% |

*注: 性能因硬件而异*

## 扩展建议

### 算法改进
- 自适应参数调整
- 岛屿模型（多种群）
- 混合A*算法

### 功能扩展
- 3D迷宫支持
- 动态障碍处理
- Web界面

### 性能优化
- GPU加速
- 并行计算
- 算法向量化

## 文档

- **快速入门**: `docs/QUICKSTART.md`
- **安装指南**: `docs/INSTALL.md`
- **可视化指南**: `docs/VISUALIZATION_GUIDE.md` ⭐ 新增
- **技术总结**: `docs/PROJECT_SUMMARY.md`
- **完成报告**: `docs/PROJECT_COMPLETION.md`

## 代码示例

```python
from src.maze import Maze
from src.genetic_algorithm import GeneticAlgorithm
from src.visualizer import MazeVisualizer

# 创建迷宫
maze = Maze(21, 21)
maze.generate_maze()

# 运行遗传算法
ga = GeneticAlgorithm(maze, population_size=100, max_generations=500)
best = ga.run()

# 可视化
viz = MazeVisualizer(maze)
viz.plot_maze(best.path)
viz.plot_fitness_history(ga.fitness_history)
```

## 许可证

MIT License

## 贡献

欢迎提交问题和改进建议！

## 参考文献

- Holland, J. H. (1992). *Adaptation in Natural and Artificial Systems*
- Goldberg, D. E. (1989). *Genetic Algorithms in Search, Optimization, and Machine Learning*

---

**版本**: 1.1.0  
**最后更新**: 2025-10-27  
**作者**: Maze GA Project
