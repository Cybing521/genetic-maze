"""
岛屿模型遗传算法 - 多种群并行进化
"""
import random
from typing import List
from genetic_algorithm import GeneticAlgorithm, Individual
from maze import Maze


class IslandGeneticAlgorithm:
    """岛屿模型 - 多个独立种群并行进化，定期迁移"""
    
    def __init__(self, maze: Maze,
                 num_islands: int = 4,
                 population_per_island: int = 50,
                 max_generations: int = 500,
                 migration_interval: int = 20,
                 migration_size: int = 2):
        """
        初始化岛屿模型
        
        Args:
            num_islands: 岛屿（种群）数量
            population_per_island: 每个岛屿的种群大小
            migration_interval: 迁移间隔（代数）
            migration_size: 每次迁移的个体数量
        """
        self.maze = maze
        self.num_islands = num_islands
        self.migration_interval = migration_interval
        self.migration_size = migration_size
        self.max_generations = max_generations
        
        # 创建多个独立的遗传算法实例
        self.islands: List[GeneticAlgorithm] = []
        for i in range(num_islands):
            # 每个岛屿使用略微不同的参数
            mutation_rate = 0.1 + i * 0.05  # 0.1, 0.15, 0.2, 0.25...
            ga = GeneticAlgorithm(
                maze=maze,
                population_size=population_per_island,
                max_generations=max_generations,
                mutation_rate=mutation_rate,
                crossover_rate=0.7,
                max_steps=200
            )
            self.islands.append(ga)
        
        self.best_individual = None
        self.generation = 0
    
    def migrate(self):
        """执行种群间迁移"""
        for i in range(self.num_islands):
            source_island = self.islands[i]
            target_island = self.islands[(i + 1) % self.num_islands]
            
            # 选择源岛屿的最优个体
            sorted_pop = sorted(source_island.population, 
                              key=lambda ind: ind.fitness, reverse=True)
            migrants = sorted_pop[:self.migration_size]
            
            # 替换目标岛屿的最差个体
            target_sorted = sorted(target_island.population,
                                 key=lambda ind: ind.fitness)
            for j in range(self.migration_size):
                if j < len(migrants) and j < len(target_sorted):
                    # 创建副本
                    target_island.population[target_sorted[j]] = Individual(
                        self.maze, migrants[j].path.copy(), migrants[j].max_steps
                    )
    
    def run(self, verbose: bool = True) -> Individual:
        """运行岛屿模型遗传算法"""
        # 初始化所有岛屿
        for island in self.islands:
            island.initialize_population()
        
        if verbose:
            print(f"岛屿模型遗传算法")
            print(f"岛屿数量: {self.num_islands}")
            print(f"每岛种群: {self.islands[0].population_size}")
            print(f"迁移间隔: {self.migration_interval} 代\n")
        
        for gen in range(self.max_generations):
            self.generation = gen
            
            # 每个岛屿独立进化一代
            for island_idx, island in enumerate(self.islands):
                island.evolve()
            
            # 定期迁移
            if gen > 0 and gen % self.migration_interval == 0:
                self.migrate()
                if verbose:
                    print(f"代数 {gen}: 执行种群迁移")
            
            # 找出所有岛屿中的最佳个体
            all_best = [island.best_individual for island in self.islands]
            current_best = max(all_best, key=lambda ind: ind.fitness)
            
            if self.best_individual is None or current_best.fitness > self.best_individual.fitness:
                self.best_individual = current_best
            
            if verbose and (gen % 50 == 0 or current_best.reached_end):
                island_status = [f"岛{i+1}:{island.best_individual.fitness:.0f}" 
                               for i, island in enumerate(self.islands)]
                status_str = ", ".join(island_status)
                print(f"代数 {gen}: {status_str} | "
                      f"全局最佳: {self.best_individual.fitness:.2f}")
            
            # 检查是否找到解决方案
            if current_best.reached_end and gen > 50:
                if verbose:
                    print(f"\n岛屿 {all_best.index(current_best) + 1} "
                          f"在第 {gen} 代找到解决方案!")
                break
        
        if verbose:
            print(f"\n最终结果:")
            print(f"最佳适应度: {self.best_individual.fitness:.2f}")
            print(f"路径长度: {len(self.best_individual.path)}")
        
        return self.best_individual

