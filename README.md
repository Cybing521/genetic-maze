# 遗传算法求解迷宫问题

这是一个使用遗传算法（Genetic Algorithm）来寻找迷宫最优路径的项目。该项目演示了如何将遗传算法应用于路径规划问题。

## 项目简介

遗传算法是一种模拟自然选择和遗传机制的优化算法。本项目将遗传算法应用于迷宫求解问题，通过模拟"适者生存"的进化过程来寻找从起点到终点的最优路径。

### 主要特性

- 🧬 **遗传算法实现**: 完整的遗传算法框架，包括选择、交叉、变异操作
- 🗺️ **迷宫生成**: 自动生成随机迷宫
- 📊 **可视化**: 提供迷宫、路径和适应度演化的可视化
- 🔧 **参数可调**: 支持自定义种群大小、变异率等参数
- 📈 **性能分析**: 提供参数对比实验功能

## 项目结构

```
program2/
├── src/
│   ├── __init__.py          # 包初始化文件
│   ├── maze.py              # 迷宫类和生成器
│   ├── genetic_algorithm.py # 遗传算法核心实现
│   ├── visualizer.py        # 可视化模块
│   └── main.py              # 主程序入口
├── tests/                   # 测试文件目录
├── docs/                    # 文档目录
├── README.md                # 项目说明文档
└── requirements.txt         # 依赖包列表
```

## 安装依赖

```bash
pip install -r requirements.txt
```

### 依赖包

- `numpy`: 数值计算
- `matplotlib`: 数据可视化

## 使用方法

### 1. 基础示例

运行默认配置的示例：

```bash
cd src
python main.py --mode basic
```

这将：
- 生成一个 21x21 的迷宫
- 使用默认参数运行遗传算法
- 显示迷宫、最优路径和适应度演化图

### 2. 参数对比实验

比较不同种群大小的性能：

```bash
python main.py --mode comparison
```

这将测试不同种群大小（50, 100, 200）的效果并进行可视化对比。

### 3. 自定义参数

使用自定义参数运行：

```bash
python main.py --mode custom \
    --width 31 \
    --height 31 \
    --population 150 \
    --generations 1000 \
    --mutation 0.2
```

参数说明：
- `--width`: 迷宫宽度
- `--height`: 迷宫高度
- `--population`: 种群大小
- `--generations`: 最大进化代数
- `--mutation`: 变异率 (0-1之间)

## 算法原理

### 遗传算法流程

1. **初始化种群**: 随机生成一定数量的路径个体
2. **适应度评估**: 评估每个个体到达终点的能力
3. **选择操作**: 使用锦标赛选择优秀个体
4. **交叉操作**: 交换两个父代的路径片段产生子代
5. **变异操作**: 随机修改路径的某些部分
6. **精英保留**: 保留最优个体到下一代
7. **迭代**: 重复步骤2-6直到满足终止条件

### 适应度函数

适应度评估考虑以下因素：

- **是否到达终点** (最重要): 到达终点的个体获得高分
- **到终点的距离**: 越接近终点分数越高
- **路径长度**: 路径越短越好
- **路径重复率**: 重复访问位置越少越好

适应度计算公式：

```
如果到达终点:
    适应度 = 10000 + (最大步数 - 路径长度) × 10 + 不重复步数 × 5
否则:
    适应度 = 1000 / (1 + 到终点距离) + 路径长度奖励 + 不重复率 × 100
```

## 测试方案

### 测试场景

#### 测试1: 简单迷宫
**目的**: 验证算法基本功能

```bash
python main.py --mode custom --width 11 --height 11 --population 50 --generations 200
```

**预期结果**:
- 应该在较少代数内找到解决方案（< 100代）
- 路径长度合理（接近最短路径）

#### 测试2: 中等复杂度迷宫
**目的**: 测试算法在标准场景下的性能

```bash
python main.py --mode basic
```

**预期结果**:
- 在 300 代内找到解决方案
- 适应度持续上升
- 平均适应度和最佳适应度差距逐渐缩小

#### 测试3: 复杂迷宫
**目的**: 测试算法在困难场景下的表现

```bash
python main.py --mode custom --width 41 --height 41 --population 200 --generations 1000
```

**预期结果**:
- 可能需要更多代数才能找到解决方案
- 需要较大的种群规模
- 最终能够找到可行路径

#### 测试4: 参数敏感性分析
**目的**: 分析不同参数对性能的影响

```bash
python main.py --mode comparison
```

**预期结果**:
- 较大的种群规模通常能找到更好的解
- 但计算时间也会增加
- 存在性能和效率的平衡点

### 性能指标

评估算法性能的关键指标：

1. **成功率**: 能够找到到达终点路径的概率
2. **收敛速度**: 找到解决方案所需的代数
3. **路径质量**: 找到的路径长度与理论最短路径的比值
4. **稳定性**: 多次运行结果的方差

### 测试脚本

创建一个批量测试脚本 `tests/run_tests.py`:

```python
import sys
sys.path.append('../src')

from maze import Maze
from genetic_algorithm import GeneticAlgorithm

def test_small_maze():
    """测试小迷宫"""
    print("测试1: 小迷宫 (11x11)")
    maze = Maze(11, 11)
    maze.generate_maze()
    
    ga = GeneticAlgorithm(maze, population_size=50, max_generations=200)
    best = ga.run(verbose=False)
    
    assert best.reached_end, "算法应该找到解决方案"
    print(f"✓ 测试通过: 路径长度={len(best.path)}")

def test_medium_maze():
    """测试中等迷宫"""
    print("\n测试2: 中等迷宫 (21x21)")
    maze = Maze(21, 21)
    maze.generate_maze()
    
    ga = GeneticAlgorithm(maze, population_size=100, max_generations=500)
    best = ga.run(verbose=False)
    
    print(f"结果: 到达终点={best.reached_end}, 路径长度={len(best.path)}")
    print(f"✓ 测试完成")

def test_parameter_stability():
    """测试参数稳定性"""
    print("\n测试3: 参数稳定性（运行5次）")
    maze = Maze(21, 21)
    maze.generate_maze()
    
    results = []
    for i in range(5):
        ga = GeneticAlgorithm(maze, population_size=100, max_generations=300)
        best = ga.run(verbose=False)
        results.append(best.reached_end)
        print(f"  运行 {i+1}: {'成功' if best.reached_end else '失败'}")
    
    success_rate = sum(results) / len(results) * 100
    print(f"✓ 成功率: {success_rate}%")

if __name__ == '__main__':
    test_small_maze()
    test_medium_maze()
    test_parameter_stability()
    print("\n所有测试完成!")
```

## 实验结果分析

### 预期观察

1. **适应度曲线**
   - 最佳适应度应该单调递增（由于精英保留）
   - 平均适应度应该整体上升趋势
   - 两条曲线逐渐靠近表示种群趋于收敛

2. **路径特征**
   - 初期路径可能较长且有大量重复
   - 随着进化，路径逐渐变短且更直接
   - 最终路径应该相对平滑，避免不必要的绕路

3. **参数影响**
   - **种群大小**: 更大的种群提供更多样性，但计算成本高
   - **变异率**: 适中的变异率（0.1-0.2）通常效果最好
   - **交叉率**: 较高的交叉率（0.7-0.9）有利于信息交换

## 扩展建议

### 算法改进

1. **自适应参数**: 根据收敛情况动态调整变异率和交叉率
2. **多目标优化**: 同时优化路径长度和平滑度
3. **混合算法**: 结合A*算法进行局部优化
4. **并行计算**: 利用多核CPU加速适应度评估

### 功能扩展

1. **3D迷宫**: 扩展到三维空间
2. **动态障碍**: 处理移动的障碍物
3. **多起点/终点**: 寻找访问多个目标点的最优路径
4. **实时可视化**: 显示进化过程的动画

## 常见问题

### Q1: 算法无法找到解决方案怎么办？

**A**: 尝试以下方法：
- 增加种群大小（如 200-500）
- 增加最大代数（如 1000-2000）
- 适当提高变异率（如 0.2-0.3）
- 增加个体的最大步数限制

### Q2: 运行速度很慢怎么办？

**A**: 
- 减小迷宫尺寸
- 减小种群大小
- 减少可视化频率
- 关闭详细输出（verbose=False）

### Q3: 找到的路径质量不高怎么办？

**A**:
- 调整适应度函数权重
- 增加精英保留数量
- 降低变异率以保持优良基因
- 延长运行时间让算法充分收敛

## 贡献

欢迎提交问题报告和改进建议！

## 许可证

MIT License

## 参考资料

- Holland, J. H. (1992). Adaptation in Natural and Artificial Systems
- Goldberg, D. E. (1989). Genetic Algorithms in Search, Optimization, and Machine Learning
- [遗传算法入门](https://en.wikipedia.org/wiki/Genetic_algorithm)

---

**作者**: Maze GA Project  
**版本**: 1.0.0  
**最后更新**: 2025-10-27

