#!/usr/bin/env python3
"""
简单示例 - 快速演示遗传算法求解迷宫
可以直接运行这个文件来查看效果
"""
import sys
import os

# 添加src目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from maze import Maze
from genetic_algorithm import GeneticAlgorithm
from visualizer import MazeVisualizer


def main():
    print("="*60)
    print("遗传算法求解迷宫 - 简单演示")
    print("="*60)
    
    # 1. 创建一个小迷宫
    print("\n【步骤1】创建迷宫...")
    maze = Maze(width=15, height=15)
    maze.generate_maze(complexity=0.7, density=0.7)
    
    print("\n迷宫结构（S=起点, E=终点, █=墙）:")
    print(maze)
    print(f"\n起点: {maze.start}")
    print(f"终点: {maze.end}")
    
    # 2. 配置并运行遗传算法
    print("\n【步骤2】运行遗传算法...")
    print("参数配置:")
    print("  - 种群大小: 80")
    print("  - 最大代数: 300")
    print("  - 变异率: 0.15")
    print("  - 交叉率: 0.7")
    print()
    
    ga = GeneticAlgorithm(
        maze=maze,
        population_size=80,
        max_generations=300,
        mutation_rate=0.15,
        crossover_rate=0.7,
        elitism_count=2,
        max_steps=150
    )
    
    # 运行算法
    best_individual = ga.run(verbose=True)
    
    # 3. 显示结果
    print("\n【步骤3】结果分析...")
    print(f"最终结果:")
    print(f"  ✓ 适应度得分: {best_individual.fitness:.2f}")
    print(f"  ✓ 路径长度: {len(best_individual.path)} 步")
    print(f"  ✓ 不重复步数: {len(set(best_individual.path))} 步")
    print(f"  ✓ 到达终点: {'是 ✓' if best_individual.reached_end else '否 ✗'}")
    print(f"  ✓ 进化代数: {ga.generation} 代")
    
    if best_individual.reached_end:
        efficiency = len(set(best_individual.path)) / len(best_individual.path) * 100
        print(f"  ✓ 路径效率: {efficiency:.1f}% (不重复率)")
    
    # 4. 可视化
    print("\n【步骤4】生成可视化图表...")
    visualizer = MazeVisualizer(maze)
    
    try:
        # 绘制迷宫和路径
        title = f"遗传算法求解结果\n适应度: {best_individual.fitness:.2f} | 路径长度: {len(best_individual.path)}"
        visualizer.plot_maze(best_individual.path, title=title)
        
        # 绘制适应度演化
        visualizer.plot_fitness_history(ga.fitness_history)
        
        print("✓ 可视化完成！请查看弹出的图表窗口。")
        
    except Exception as e:
        print(f"⚠ 可视化时出现问题: {e}")
        print("  可能是因为没有图形界面或matplotlib配置问题。")
    
    # 5. 输出路径详情（可选）
    if best_individual.reached_end and len(best_individual.path) < 100:
        print("\n【可选】路径详情（前20步）:")
        for i, pos in enumerate(best_individual.path[:20]):
            print(f"  步骤 {i+1}: {pos}", end="")
            if i == 0:
                print(" (起点)", end="")
            elif pos == maze.end:
                print(" (终点)", end="")
            print()
        if len(best_individual.path) > 20:
            print(f"  ... (还有 {len(best_individual.path)-20} 步)")
    
    print("\n" + "="*60)
    print("演示完成！")
    print("="*60)
    print("\n提示:")
    print("  - 可以多次运行观察不同的结果")
    print("  - 修改参数尝试不同的配置")
    print("  - 查看 README.md 了解更多功能")
    print("  - 运行 tests/run_tests.py 进行完整测试")
    

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n程序被用户中断")
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()

