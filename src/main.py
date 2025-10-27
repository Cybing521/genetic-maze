"""
主程序 - 遗传算法求解迷宫问题
"""
import sys
import argparse
from maze import Maze
from genetic_algorithm import GeneticAlgorithm, Individual
from visualizer import MazeVisualizer, plot_comparison


def run_basic_example():
    """运行基础示例"""
    print("="*60)
    print("基础示例：使用遗传算法求解迷宫")
    print("="*60)
    
    # 创建迷宫
    print("\n1. 生成迷宫...")
    maze = Maze(width=21, height=21)
    maze.generate_maze(complexity=0.75, density=0.75)
    
    print("\n迷宫结构:")
    print(maze)
    
    # 运行遗传算法
    print("\n2. 运行遗传算法...")
    ga = GeneticAlgorithm(
        maze=maze,
        population_size=100,
        max_generations=500,
        mutation_rate=0.15,
        crossover_rate=0.7,
        max_steps=200
    )
    
    best_individual = ga.run(verbose=True)
    
    # 可视化结果
    print("\n3. 可视化结果...")
    visualizer = MazeVisualizer(maze)
    
    title = f"遗传算法求解迷宫\n适应度: {best_individual.fitness:.2f}"
    visualizer.plot_maze(best_individual.path, title=title)
    
    # 绘制适应度历史
    visualizer.plot_fitness_history(ga.fitness_history)
    

def run_parameter_comparison():
    """运行参数对比实验"""
    print("="*60)
    print("参数对比实验：不同种群大小的影响")
    print("="*60)
    
    # 创建迷宫
    maze = Maze(width=21, height=21)
    maze.generate_maze(complexity=0.75, density=0.75)
    
    print("\n迷宫结构:")
    print(maze)
    
    # 测试不同的种群大小
    population_sizes = [50, 100, 200]
    results = []
    
    for pop_size in population_sizes:
        print(f"\n测试种群大小: {pop_size}")
        print("-"*40)
        
        ga = GeneticAlgorithm(
            maze=maze,
            population_size=pop_size,
            max_generations=300,
            mutation_rate=0.15,
            crossover_rate=0.7,
            max_steps=200
        )
        
        best = ga.run(verbose=False)
        
        print(f"结果: 适应度={best.fitness:.2f}, "
              f"路径长度={len(best.path)}, "
              f"到达终点={'是' if best.reached_end else '否'}")
        
        results.append((f"种群大小={pop_size}", maze, best))
    
    # 绘制对比图
    print("\n绘制对比结果...")
    plot_comparison(results)


def run_custom_maze(width: int, height: int, population_size: int, 
                   max_generations: int, mutation_rate: float):
    """运行自定义参数的迷宫求解"""
    print("="*60)
    print("自定义参数迷宫求解")
    print("="*60)
    print(f"迷宫尺寸: {width}x{height}")
    print(f"种群大小: {population_size}")
    print(f"最大代数: {max_generations}")
    print(f"变异率: {mutation_rate}")
    
    # 创建迷宫
    print("\n生成迷宫...")
    maze = Maze(width=width, height=height)
    maze.generate_maze()
    
    print("\n迷宫结构:")
    print(maze)
    
    # 运行遗传算法
    print("\n运行遗传算法...")
    ga = GeneticAlgorithm(
        maze=maze,
        population_size=population_size,
        max_generations=max_generations,
        mutation_rate=mutation_rate,
        crossover_rate=0.7,
        max_steps=width * height
    )
    
    best_individual = ga.run(verbose=True)
    
    # 可视化结果
    print("\n可视化结果...")
    visualizer = MazeVisualizer(maze)
    
    title = f"自定义参数求解结果\n适应度: {best_individual.fitness:.2f}"
    visualizer.plot_maze(best_individual.path, title=title)
    visualizer.plot_fitness_history(ga.fitness_history)


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='遗传算法求解迷宫问题')
    parser.add_argument('--mode', type=str, default='basic',
                       choices=['basic', 'comparison', 'custom'],
                       help='运行模式: basic(基础示例), comparison(参数对比), custom(自定义)')
    parser.add_argument('--width', type=int, default=21,
                       help='迷宫宽度 (仅用于custom模式)')
    parser.add_argument('--height', type=int, default=21,
                       help='迷宫高度 (仅用于custom模式)')
    parser.add_argument('--population', type=int, default=100,
                       help='种群大小 (仅用于custom模式)')
    parser.add_argument('--generations', type=int, default=500,
                       help='最大代数 (仅用于custom模式)')
    parser.add_argument('--mutation', type=float, default=0.15,
                       help='变异率 (仅用于custom模式)')
    
    args = parser.parse_args()
    
    try:
        if args.mode == 'basic':
            run_basic_example()
        elif args.mode == 'comparison':
            run_parameter_comparison()
        elif args.mode == 'custom':
            run_custom_maze(
                width=args.width,
                height=args.height,
                population_size=args.population,
                max_generations=args.generations,
                mutation_rate=args.mutation
            )
    except KeyboardInterrupt:
        print("\n\n程序被用户中断")
        sys.exit(0)
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

