"""
遗传算法模块 - 用于求解迷宫路径问题
"""
import random
import numpy as np
from typing import List, Tuple
from maze import Maze


class Individual:
    """个体类，表示一个可能的路径解"""
    
    def __init__(self, maze: Maze, path: List[Tuple[int, int]] = None, max_steps: int = 200):
        """
        初始化个体
        
        Args:
            maze: 迷宫对象
            path: 路径（如果为None则随机生成）
            max_steps: 最大步数
        """
        self.maze = maze
        self.max_steps = max_steps
        
        if path is None:
            self.path = self._generate_random_path()
        else:
            self.path = path
            
        self.fitness = 0
        self.reached_end = False
        self.calculate_fitness()
        
    def _generate_random_path(self) -> List[Tuple[int, int]]:
        """生成随机路径"""
        path = [self.maze.start]
        current = self.maze.start
        
        for _ in range(self.max_steps):
            if current == self.maze.end:
                break
                
            neighbors = self.maze.get_valid_neighbors(current)
            if not neighbors:
                break
                
            # 随机选择下一步，但有偏向终点的倾向
            if random.random() < 0.7:  # 70%概率朝向终点
                next_pos = min(neighbors, 
                             key=lambda p: self.maze.calculate_distance(p, self.maze.end))
            else:  # 30%概率随机探索
                next_pos = random.choice(neighbors)
                
            # 避免立即回到上一个位置
            if len(path) > 1 and next_pos == path[-2]:
                if len(neighbors) > 1:
                    neighbors.remove(next_pos)
                    next_pos = random.choice(neighbors)
                    
            path.append(next_pos)
            current = next_pos
            
        return path
    
    def calculate_fitness(self):
        """
        计算个体适应度
        适应度考虑：
        1. 是否到达终点（最重要）
        2. 到终点的距离
        3. 路径长度（越短越好）
        4. 路径重复率（越少越好）
        """
        if not self.path:
            self.fitness = 0
            return
            
        current_pos = self.path[-1]
        distance_to_end = self.maze.calculate_distance(current_pos, self.maze.end)
        
        # 检查是否到达终点
        self.reached_end = (current_pos == self.maze.end)
        
        if self.reached_end:
            # 到达终点：路径越短越好
            path_length = len(self.path)
            unique_steps = len(set(self.path))  # 不重复的步数
            
            # 基础分数很高
            self.fitness = 10000
            # 路径越短奖励越高
            self.fitness += (self.max_steps - path_length) * 10
            # 重复步数越少奖励越高
            self.fitness += unique_steps * 5
        else:
            # 未到达终点：距离越近越好
            self.fitness = 1000 / (1 + distance_to_end)
            # 路径长度适中较好（太短可能没有充分探索）
            self.fitness += min(len(self.path), self.max_steps // 2)
            # 减少重复步数的惩罚
            unique_ratio = len(set(self.path)) / len(self.path) if self.path else 0
            self.fitness += unique_ratio * 100


class GeneticAlgorithm:
    """遗传算法类"""
    
    def __init__(self, maze: Maze, 
                 population_size: int = 100,
                 max_generations: int = 500,
                 mutation_rate: float = 0.1,
                 crossover_rate: float = 0.7,
                 elitism_count: int = 2,
                 max_steps: int = 200):
        """
        初始化遗传算法
        
        Args:
            maze: 迷宫对象
            population_size: 种群大小
            max_generations: 最大代数
            mutation_rate: 变异率
            crossover_rate: 交叉率
            elitism_count: 精英保留数量
            max_steps: 每个个体的最大步数
        """
        self.maze = maze
        self.population_size = population_size
        self.max_generations = max_generations
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.elitism_count = elitism_count
        self.max_steps = max_steps
        
        self.population: List[Individual] = []
        self.best_individual: Individual = None
        self.generation = 0
        self.fitness_history = []
        self.best_individuals_history = []  # 记录每一代的最佳个体（用于动画）
        
    def initialize_population(self):
        """初始化种群"""
        self.population = [Individual(self.maze, max_steps=self.max_steps) 
                          for _ in range(self.population_size)]
        self._update_best_individual()
        
    def _update_best_individual(self):
        """更新最佳个体"""
        current_best = max(self.population, key=lambda ind: ind.fitness)
        if self.best_individual is None or current_best.fitness > self.best_individual.fitness:
            self.best_individual = current_best
            
    def selection(self) -> Individual:
        """
        锦标赛选择
        
        Returns:
            选中的个体
        """
        tournament_size = 5
        tournament = random.sample(self.population, tournament_size)
        return max(tournament, key=lambda ind: ind.fitness)
    
    def crossover(self, parent1: Individual, parent2: Individual) -> Tuple[Individual, Individual]:
        """
        交叉操作 - 单点交叉
        
        Args:
            parent1: 父代1
            parent2: 父代2
            
        Returns:
            两个子代
        """
        if random.random() > self.crossover_rate:
            return parent1, parent2
            
        # 找到两条路径的公共部分
        min_len = min(len(parent1.path), len(parent2.path))
        if min_len <= 1:
            return parent1, parent2
            
        # 在公共部分随机选择交叉点
        crossover_point = random.randint(1, min_len - 1)
        
        # 创建新路径
        child1_path = parent1.path[:crossover_point] + parent2.path[crossover_point:]
        child2_path = parent2.path[:crossover_point] + parent1.path[crossover_point:]
        
        # 确保路径连续性（如果不连续，则修复）
        child1_path = self._repair_path(child1_path)
        child2_path = self._repair_path(child2_path)
        
        child1 = Individual(self.maze, child1_path, self.max_steps)
        child2 = Individual(self.maze, child2_path, self.max_steps)
        
        return child1, child2
    
    def _repair_path(self, path: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """
        修复不连续的路径
        
        Args:
            path: 原始路径
            
        Returns:
            修复后的路径
        """
        if not path:
            return [self.maze.start]
            
        repaired = [path[0]]
        
        for i in range(1, len(path)):
            current = repaired[-1]
            next_pos = path[i]
            
            # 检查是否相邻
            if self.maze.calculate_distance(current, next_pos) == 1:
                if self.maze.is_valid_position(next_pos):
                    repaired.append(next_pos)
            else:
                # 如果不相邻，尝试找到一个有效的邻居
                neighbors = self.maze.get_valid_neighbors(current)
                if neighbors:
                    repaired.append(random.choice(neighbors))
                    
        return repaired
    
    def mutation(self, individual: Individual) -> Individual:
        """
        变异操作
        
        Args:
            individual: 个体
            
        Returns:
            变异后的个体
        """
        if random.random() > self.mutation_rate:
            return individual
            
        path = individual.path.copy()
        
        if len(path) <= 2:
            return individual
            
        # 随机选择变异点
        mutation_point = random.randint(1, len(path) - 1)
        
        # 从变异点开始重新生成路径
        current = path[mutation_point - 1]
        new_path = path[:mutation_point]
        
        steps_to_generate = min(random.randint(5, 20), self.max_steps - len(new_path))
        
        for _ in range(steps_to_generate):
            if current == self.maze.end:
                break
                
            neighbors = self.maze.get_valid_neighbors(current)
            if not neighbors:
                break
                
            next_pos = random.choice(neighbors)
            new_path.append(next_pos)
            current = next_pos
            
        return Individual(self.maze, new_path, self.max_steps)
    
    def evolve(self) -> Individual:
        """
        执行一代进化
        
        Returns:
            当前代的最佳个体
        """
        new_population = []
        
        # 精英保留
        sorted_population = sorted(self.population, key=lambda ind: ind.fitness, reverse=True)
        new_population.extend(sorted_population[:self.elitism_count])
        
        # 生成新个体
        while len(new_population) < self.population_size:
            parent1 = self.selection()
            parent2 = self.selection()
            
            child1, child2 = self.crossover(parent1, parent2)
            
            child1 = self.mutation(child1)
            child2 = self.mutation(child2)
            
            new_population.append(child1)
            if len(new_population) < self.population_size:
                new_population.append(child2)
                
        self.population = new_population
        self._update_best_individual()
        
        # 记录统计信息
        avg_fitness = sum(ind.fitness for ind in self.population) / len(self.population)
        self.fitness_history.append({
            'generation': self.generation,
            'best_fitness': self.best_individual.fitness,
            'avg_fitness': avg_fitness,
            'reached_end': self.best_individual.reached_end
        })
        
        # 保存当前代的最佳个体（用于动画）
        # 创建副本以避免引用问题
        best_copy = Individual(self.maze, self.best_individual.path.copy(), self.max_steps)
        self.best_individuals_history.append(best_copy)
        
        self.generation += 1
        return self.best_individual
    
    def run(self, verbose: bool = True) -> Individual:
        """
        运行遗传算法
        
        Args:
            verbose: 是否打印进度
            
        Returns:
            最佳个体
        """
        self.initialize_population()
        
        if verbose:
            print(f"初始种群大小: {self.population_size}")
            print(f"最大代数: {self.max_generations}")
            print(f"变异率: {self.mutation_rate}")
            print(f"交叉率: {self.crossover_rate}\n")
            
        for gen in range(self.max_generations):
            best = self.evolve()
            
            if verbose and (gen % 50 == 0 or best.reached_end):
                status = "已到达终点!" if best.reached_end else "未到达终点"
                print(f"代数 {gen}: 最佳适应度 = {best.fitness:.2f}, "
                      f"路径长度 = {len(best.path)}, {status}")
                      
            # 如果找到解决方案，提前结束
            if best.reached_end and gen > 50:
                if verbose:
                    print(f"\n在第 {gen} 代找到解决方案!")
                break
                
        if verbose:
            print(f"\n最终结果:")
            print(f"最佳适应度: {self.best_individual.fitness:.2f}")
            print(f"路径长度: {len(self.best_individual.path)}")
            print(f"是否到达终点: {'是' if self.best_individual.reached_end else '否'}")
            
        return self.best_individual

