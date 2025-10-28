# 快速入门指南

## 5分钟上手遗传算法迷宫求解

### 第一步：准备环境

```bash
# 创建并激活虚拟环境
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 第二步：运行基础示例

```bash
# 在项目根目录运行
python main.py
```

你将看到：
1. 生成的迷宫结构（在终端显示）
2. 算法运行进度
3. 最终结果的可视化图像
4. 适应度演化曲线

### 第三步：运行测试

```bash
# 快速测试模式
python main.py --mode test
```

这将使用小迷宫快速验证算法功能。

### 第四步：尝试不同模式

```bash
# 参数对比实验
python main.py --mode comparison

# 自定义参数
python main.py --mode custom --width 15 --height 15 --population 150

# 查看所有选项
python main.py --help
```

## 核心概念

### 遗传算法参数

- **种群大小 (population)**: 每代个体数量，越大越能探索更多可能性
- **代数 (generations)**: 进化的轮数，越多越有机会找到更好的解
- **变异率 (mutation)**: 随机改变的概率，帮助跳出局部最优
- **交叉率 (crossover)**: 父代交换基因的概率，用于信息共享

### 迷宫参数

- **宽度/高度 (width/height)**: 迷宫尺寸，越大越复杂
- **复杂度 (complexity)**: 墙的复杂程度
- **密度 (density)**: 墙的密集程度

## 理解输出

### 终端输出示例

```
代数 0: 最佳适应度 = 156.32, 路径长度 = 87, 未到达终点
代数 50: 最佳适应度 = 289.45, 路径长度 = 134, 未到达终点
代数 100: 最佳适应度 = 10485.00, 路径长度 = 43, 已到达终点!

在第 100 代找到解决方案!

最终结果:
最佳适应度: 10485.00
路径长度: 43
是否到达终点: 是
```

### 可视化图表

1. **迷宫和路径图**
   - 黑色：墙壁
   - 白色：通路
   - 绿点：起点
   - 红点：终点
   - 蓝线：找到的路径

2. **适应度演化图**
   - 蓝线：最佳适应度（单调递增）
   - 红线：平均适应度（整体上升）
   - 收敛时两线接近

## 常见问题

**Q: 算法运行很久还没找到解决方案？**

A: 尝试增加种群大小或代数，或者使用更简单的迷宫。

**Q: 找到的路径看起来很长？**

A: 这是正常的，遗传算法找到的是"可行解"，不一定是"最优解"。可以增加运行时间让算法继续优化。

**Q: 如何保存结果图像？**

A: 修改visualizer.py中的plot_maze函数，添加save_path参数。

## 下一步

- 阅读 README.md 了解详细信息
- 查看源代码理解算法实现
- 尝试修改适应度函数
- 实现自己的改进版本

## 代码示例

### 最简单的使用方式

```python
from src.maze import Maze
from src.genetic_algorithm import GeneticAlgorithm
from src.visualizer import MazeVisualizer

# 创建迷宫
maze = Maze(21, 21)
maze.generate_maze()

# 运行遗传算法
ga = GeneticAlgorithm(maze)
best = ga.run()

# 可视化
viz = MazeVisualizer(maze)
viz.plot_maze(best.path)
```

### 自定义配置

```python
# 创建更大的迷宫
maze = Maze(width=41, height=41)
maze.generate_maze(complexity=0.8, density=0.8)

# 使用更激进的参数
ga = GeneticAlgorithm(
    maze=maze,
    population_size=200,
    max_generations=1000,
    mutation_rate=0.25,
    crossover_rate=0.8,
    elitism_count=5
)

best = ga.run(verbose=True)

# 保存结果
viz = MazeVisualizer(maze)
viz.plot_maze(best.path, save_path='result.png')
viz.plot_fitness_history(ga.fitness_history, save_path='fitness.png')
```

## 实验建议

1. **参数调优实验**
   - 固定迷宫，改变种群大小
   - 观察成功率和收敛速度的变化

2. **规模测试**
   - 测试不同尺寸迷宫的求解难度
   - 记录所需时间和资源

3. **算法改进**
   - 修改适应度函数
   - 实现新的选择/交叉/变异策略
   - 比较改进前后的效果

祝你探索愉快！🎉

