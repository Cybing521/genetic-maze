"""
测试脚本 - 用于验证遗传算法功能
"""
import sys
import os

# 添加src目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from maze import Maze
from genetic_algorithm import GeneticAlgorithm


def test_small_maze():
    """测试小迷宫"""
    print("="*60)
    print("测试1: 小迷宫 (11x11)")
    print("="*60)
    
    maze = Maze(11, 11)
    maze.generate_maze()
    
    print("迷宫已生成")
    print(maze)
    
    print("\n运行遗传算法...")
    ga = GeneticAlgorithm(
        maze, 
        population_size=50, 
        max_generations=200,
        mutation_rate=0.15,
        crossover_rate=0.7
    )
    best = ga.run(verbose=False)
    
    print(f"\n结果:")
    print(f"  - 是否到达终点: {'是' if best.reached_end else '否'}")
    print(f"  - 路径长度: {len(best.path)}")
    print(f"  - 适应度: {best.fitness:.2f}")
    
    if best.reached_end:
        print("✓ 测试通过: 算法成功找到解决方案")
    else:
        print("⚠ 警告: 算法未找到完整解决方案，但这在小迷宫中较少见")
    
    return best.reached_end


def test_medium_maze():
    """测试中等迷宫"""
    print("\n" + "="*60)
    print("测试2: 中等迷宫 (21x21)")
    print("="*60)
    
    maze = Maze(21, 21)
    maze.generate_maze()
    
    print("迷宫已生成")
    
    print("\n运行遗传算法...")
    ga = GeneticAlgorithm(
        maze, 
        population_size=100, 
        max_generations=500,
        mutation_rate=0.15,
        crossover_rate=0.7
    )
    best = ga.run(verbose=False)
    
    print(f"\n结果:")
    print(f"  - 是否到达终点: {'是' if best.reached_end else '否'}")
    print(f"  - 路径长度: {len(best.path)}")
    print(f"  - 适应度: {best.fitness:.2f}")
    print(f"  - 收敛代数: {ga.generation}")
    
    print("✓ 测试完成")
    
    return best.reached_end


def test_parameter_stability():
    """测试参数稳定性"""
    print("\n" + "="*60)
    print("测试3: 参数稳定性（运行5次）")
    print("="*60)
    
    # 使用相同的迷宫进行多次测试
    maze = Maze(21, 21)
    maze.generate_maze()
    
    print("使用相同迷宫运行5次，测试算法稳定性...")
    
    results = []
    fitness_scores = []
    path_lengths = []
    
    for i in range(5):
        print(f"\n运行 {i+1}/5...")
        ga = GeneticAlgorithm(
            maze, 
            population_size=100, 
            max_generations=300,
            mutation_rate=0.15,
            crossover_rate=0.7
        )
        best = ga.run(verbose=False)
        
        results.append(best.reached_end)
        fitness_scores.append(best.fitness)
        path_lengths.append(len(best.path) if best.reached_end else None)
        
        print(f"  结果: {'成功到达' if best.reached_end else '未到达'} | "
              f"适应度: {best.fitness:.2f} | "
              f"路径长度: {len(best.path)}")
    
    # 统计结果
    success_count = sum(results)
    success_rate = success_count / len(results) * 100
    avg_fitness = sum(fitness_scores) / len(fitness_scores)
    
    successful_paths = [p for p in path_lengths if p is not None]
    avg_path_length = sum(successful_paths) / len(successful_paths) if successful_paths else 0
    
    print(f"\n统计结果:")
    print(f"  - 成功率: {success_rate:.1f}% ({success_count}/5)")
    print(f"  - 平均适应度: {avg_fitness:.2f}")
    if successful_paths:
        print(f"  - 平均路径长度: {avg_path_length:.1f}")
        print(f"  - 最短路径: {min(successful_paths)}")
        print(f"  - 最长路径: {max(successful_paths)}")
    
    if success_rate >= 60:
        print("✓ 测试通过: 算法稳定性良好")
    else:
        print("⚠ 警告: 成功率较低，可能需要调整参数")
    
    return success_rate >= 60


def test_different_sizes():
    """测试不同迷宫尺寸"""
    print("\n" + "="*60)
    print("测试4: 不同迷宫尺寸")
    print("="*60)
    
    sizes = [(11, 11), (21, 21), (31, 31)]
    
    for width, height in sizes:
        print(f"\n测试 {width}x{height} 迷宫:")
        
        maze = Maze(width, height)
        maze.generate_maze()
        
        # 根据迷宫大小调整参数
        pop_size = max(50, width * height // 4)
        max_gens = max(200, width * height * 2)
        max_steps = width * height
        
        ga = GeneticAlgorithm(
            maze,
            population_size=pop_size,
            max_generations=max_gens,
            mutation_rate=0.15,
            crossover_rate=0.7,
            max_steps=max_steps
        )
        
        best = ga.run(verbose=False)
        
        print(f"  结果: {'成功' if best.reached_end else '失败'} | "
              f"代数: {ga.generation} | "
              f"路径长度: {len(best.path)}")
    
    print("\n✓ 尺寸测试完成")


def test_maze_generation():
    """测试迷宫生成"""
    print("\n" + "="*60)
    print("测试5: 迷宫生成验证")
    print("="*60)
    
    maze = Maze(21, 21)
    maze.generate_maze()
    
    print("验证迷宫属性:")
    
    # 验证起点和终点是通路
    assert maze.is_valid_position(maze.start), "起点应该是有效位置"
    assert maze.is_valid_position(maze.end), "终点应该是有效位置"
    print("  ✓ 起点和终点有效")
    
    # 验证边界是墙
    assert all(maze.grid[0, :] == 1), "上边界应该是墙"
    assert all(maze.grid[-1, :] == 1), "下边界应该是墙"
    assert all(maze.grid[:, 0] == 1), "左边界应该是墙"
    assert all(maze.grid[:, -1] == 1), "右边界应该是墙"
    print("  ✓ 边界都是墙")
    
    # 验证迷宫有通路
    start_neighbors = maze.get_valid_neighbors(maze.start)
    assert len(start_neighbors) > 0, "起点应该至少有一个可通行的邻居"
    print(f"  ✓ 起点有 {len(start_neighbors)} 个可通行邻居")
    
    # 统计墙和路的比例
    total_cells = maze.width * maze.height
    wall_cells = (maze.grid == 1).sum()
    path_cells = (maze.grid == 0).sum()
    wall_ratio = wall_cells / total_cells * 100
    
    print(f"  ✓ 墙占比: {wall_ratio:.1f}%")
    print(f"  ✓ 通路占比: {100-wall_ratio:.1f}%")
    
    print("\n✓ 迷宫生成测试通过")


def main():
    """运行所有测试"""
    print("\n" + "="*60)
    print("遗传算法迷宫求解 - 测试套件")
    print("="*60)
    
    test_results = []
    
    try:
        # 运行各项测试
        test_maze_generation()
        
        result1 = test_small_maze()
        test_results.append(("小迷宫测试", result1))
        
        result2 = test_medium_maze()
        test_results.append(("中等迷宫测试", result2))
        
        result3 = test_parameter_stability()
        test_results.append(("稳定性测试", result3))
        
        test_different_sizes()
        
        # 总结
        print("\n" + "="*60)
        print("测试总结")
        print("="*60)
        
        for test_name, result in test_results:
            status = "✓ 通过" if result else "✗ 失败"
            print(f"{test_name}: {status}")
        
        passed = sum(1 for _, result in test_results if result)
        total = len(test_results)
        
        print(f"\n总计: {passed}/{total} 测试通过")
        
        if passed == total:
            print("\n🎉 所有测试通过！")
        else:
            print(f"\n⚠ {total - passed} 个测试失败")
            
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

