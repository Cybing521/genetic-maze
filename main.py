#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
遗传算法求解迷宫问题 - 主程序
使用方式：python main.py [选项]
"""
import sys
import os
import argparse

# 添加src目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.maze import Maze
from src.genetic_algorithm import GeneticAlgorithm
from src.visualizer import MazeVisualizer, plot_comparison


def run_basic(create_animation=False):
    """基础示例：运行标准配置的遗传算法"""
    print("="*70)
    print("遗传算法求解迷宫 - 基础示例")
    if create_animation:
        print("（含动画生成）")
    print("="*70)
    
    # 创建迷宫
    print("\n【步骤1】生成迷宫...")
    maze = Maze(width=21, height=21)
    maze.generate_maze(complexity=0.75, density=0.75)
    
    print("\n迷宫结构（S=起点, E=终点, █=墙）:")
    print(maze)
    print(f"\n起点: {maze.start}")
    print(f"终点: {maze.end}")
    
    # 运行遗传算法
    print("\n【步骤2】运行遗传算法...")
    print("参数配置: 种群=100, 代数=500, 变异率=0.15, 交叉率=0.7\n")
    
    ga = GeneticAlgorithm(
        maze=maze,
        population_size=100,
        max_generations=500,
        mutation_rate=0.15,
        crossover_rate=0.7,
        max_steps=200
    )
    
    best = ga.run(verbose=True)
    
    # 可视化结果
    print("\n【步骤3】生成可视化...")
    visualizer = MazeVisualizer(maze)
    
    try:
        # 使用新的仪表盘展示完整迭代过程
        visualizer.plot_evolution_dashboard(
            fitness_history=ga.fitness_history,
            best_individual=best
        )
        print("✓ 可视化完成！")
        
        # 生成动画
        if create_animation:
            print("\n【步骤4】生成进化动画...")
            visualizer.create_evolution_animation(
                best_individuals_history=ga.best_individuals_history,
                fitness_history=ga.fitness_history,
                save_path="evolution.gif",
                fps=5
            )
    except Exception as e:
        print(f"⚠ 可视化错误: {e}")
        import traceback
        traceback.print_exc()


def run_test():
    """测试模式：快速验证算法功能"""
    print("="*70)
    print("遗传算法求解迷宫 - 测试模式")
    print("="*70)
    
    # 测试小迷宫
    print("\n【测试1】小迷宫 (11×11)")
    maze = Maze(11, 11)
    maze.generate_maze()
    
    print("迷宫结构:")
    print(maze)
    
    ga = GeneticAlgorithm(maze, population_size=50, max_generations=200)
    best = ga.run(verbose=False)
    
    print(f"\n结果:")
    print(f"  - 是否到达终点: {'是 ✓' if best.reached_end else '否 ✗'}")
    print(f"  - 路径长度: {len(best.path)}")
    print(f"  - 适应度: {best.fitness:.2f}")
    
    if best.reached_end:
        print("✓ 测试通过！")
    else:
        print("⚠ 未找到完整路径（可以多次运行尝试）")
    
    # 可视化
    try:
        visualizer = MazeVisualizer(maze)
        visualizer.plot_maze_compact(
            path=best.path,
            title="Test Result",
            generation=ga.generation,
            fitness=best.fitness
        )
    except Exception as e:
        print(f"⚠ 可视化跳过: {e}")


def run_comparison():
    """对比模式：比较不同参数的效果"""
    print("="*70)
    print("遗传算法求解迷宫 - 参数对比")
    print("="*70)
    
    # 创建迷宫
    maze = Maze(width=21, height=21)
    maze.generate_maze()
    
    print("\n迷宫结构:")
    print(maze)
    
    # 测试不同种群大小
    population_sizes = [50, 100, 200]
    results = []
    
    print(f"\n对比不同种群大小: {population_sizes}")
    print("-"*70)
    
    for pop_size in population_sizes:
        print(f"\n测试种群大小 = {pop_size}")
        ga = GeneticAlgorithm(
            maze=maze,
            population_size=pop_size,
            max_generations=300,
            mutation_rate=0.15,
            crossover_rate=0.7,
            max_steps=200
        )
        
        best = ga.run(verbose=False)
        
        print(f"  结果: {'成功' if best.reached_end else '失败'} | "
              f"适应度={best.fitness:.2f} | "
              f"路径长度={len(best.path)}")
        
        results.append((f"种群={pop_size}", maze, best))
    
    # 对比可视化
    print("\n生成对比图...")
    try:
        plot_comparison(results)
        print("✓ 对比完成！")
    except Exception as e:
        print(f"⚠ 可视化错误: {e}")
        import traceback
        traceback.print_exc()


def run_custom(args):
    """自定义模式：使用用户指定的参数"""
    print("="*70)
    print("遗传算法求解迷宫 - 自定义配置")
    print("="*70)
    
    print(f"\n配置参数:")
    print(f"  - 迷宫尺寸: {args.width}×{args.height}")
    print(f"  - 种群大小: {args.population}")
    print(f"  - 最大代数: {args.generations}")
    print(f"  - 变异率: {args.mutation}")
    print(f"  - 交叉率: {args.crossover}")
    
    # 创建迷宫
    print("\n生成迷宫...")
    maze = Maze(width=args.width, height=args.height)
    maze.generate_maze()
    
    print("\n迷宫结构:")
    print(maze)
    
    # 运行遗传算法
    print("\n运行遗传算法...")
    ga = GeneticAlgorithm(
        maze=maze,
        population_size=args.population,
        max_generations=args.generations,
        mutation_rate=args.mutation,
        crossover_rate=args.crossover,
        max_steps=args.width * args.height
    )
    
    best = ga.run(verbose=True)
    
    # 可视化
    print("\n生成可视化...")
    try:
        visualizer = MazeVisualizer(maze)
        # 使用仪表盘展示完整结果
        visualizer.plot_evolution_dashboard(
            fitness_history=ga.fitness_history,
            best_individual=best
        )
        print("✓ 完成！")
    except Exception as e:
        print(f"⚠ 可视化错误: {e}")
        import traceback
        traceback.print_exc()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='遗传算法求解迷宫问题',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
运行示例:
  python main.py                           # 默认运行基础示例
  python main.py --animate                 # 运行并生成动画
  python main.py --mode test               # 快速测试
  python main.py --mode comparison         # 参数对比
  python main.py --mode custom --width 15 --height 15 --population 150
        """
    )
    
    parser.add_argument('--mode', type=str, default='basic',
                       choices=['basic', 'test', 'comparison', 'custom'],
                       help='运行模式 (默认: basic)')
    
    parser.add_argument('--animate', action='store_true',
                       help='生成进化过程动画 (GIF格式)')
    
    # 自定义模式参数
    parser.add_argument('--width', type=int, default=21,
                       help='迷宫宽度 (custom模式, 默认: 21)')
    parser.add_argument('--height', type=int, default=21,
                       help='迷宫高度 (custom模式, 默认: 21)')
    parser.add_argument('--population', type=int, default=100,
                       help='种群大小 (custom模式, 默认: 100)')
    parser.add_argument('--generations', type=int, default=500,
                       help='最大代数 (custom模式, 默认: 500)')
    parser.add_argument('--mutation', type=float, default=0.15,
                       help='变异率 (custom模式, 默认: 0.15)')
    parser.add_argument('--crossover', type=float, default=0.7,
                       help='交叉率 (custom模式, 默认: 0.7)')
    
    args = parser.parse_args()
    
    try:
        if args.mode == 'basic':
            run_basic(create_animation=args.animate)
        elif args.mode == 'test':
            run_test()
        elif args.mode == 'comparison':
            run_comparison()
        elif args.mode == 'custom':
            run_custom(args)
            
        print("\n" + "="*70)
        print("程序执行完成！")
        print("="*70)
        
    except KeyboardInterrupt:
        print("\n\n程序被用户中断")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

