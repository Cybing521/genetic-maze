"""
混合遗传算法 - 结合A*算法进行局部优化
"""
import heapq
from typing import List, Tuple, Optional
from genetic_algorithm import GeneticAlgorithm, Individual
from maze import Maze


class HybridGeneticAlgorithm(GeneticAlgorithm):
    """混合A*和遗传算法"""
    
    def __init__(self, maze: Maze, *args, use_astar_probability: float = 0.3, **kwargs):
        """
        Args:
            use_astar_probability: 使用A*优化的概率
        """
        super().__init__(maze, *args, **kwargs)
        self.use_astar_probability = use_astar_probability
    
    def astar_local_search(self, start: Tuple[int, int], 
                          goal: Tuple[int, int], max_steps: int = 50) -> Optional[List[Tuple[int, int]]]:
        """A*局部搜索"""
        import random
        
        open_set = []
        heapq.heappush(open_set, (0, start))
        came_from = {start: None}
        g_score = {start: 0}
        
        while open_set and len(came_from) < max_steps:
            _, current = heapq.heappop(open_set)
            
            if current == goal:
                # 重建路径
                path = []
                while current:
                    path.append(current)
                    current = came_from[current]
                return path[::-1]
            
            for neighbor in self.maze.get_valid_neighbors(current):
                tentative_g = g_score[current] + 1
                
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + self.maze.calculate_distance(neighbor, goal)
                    heapq.heappush(open_set, (f_score, neighbor))
        
        return None
    
    def hybrid_mutation(self, individual: Individual) -> Individual:
        """混合变异：部分使用A*优化"""
        import random
        
        if random.random() < self.use_astar_probability and len(individual.path) > 10:
            # 随机选择路径中的一段进行A*优化
            segment_start = random.randint(0, len(individual.path) - 5)
            segment_end = min(segment_start + 20, len(individual.path) - 1)
            
            start_pos = individual.path[segment_start]
            end_pos = individual.path[segment_end]
            
            # 尝试用A*找到更优路径
            astar_path = self.astar_local_search(start_pos, end_pos)
            
            if astar_path and len(astar_path) < (segment_end - segment_start):
                # 使用A*路径替换
                new_path = (individual.path[:segment_start] + 
                          astar_path + 
                          individual.path[segment_end+1:])
                return Individual(self.maze, new_path, self.max_steps)
        
        # 否则使用标准变异
        return super().mutation(individual)
    
    def mutation(self, individual: Individual) -> Individual:
        """重写变异方法"""
        return self.hybrid_mutation(individual)
    
    def run(self, verbose: bool = True) -> Individual:
        """运行混合遗传算法"""
        if verbose:
            print(f"混合遗传算法 (A*概率: {self.use_astar_probability})")
        return super().run(verbose)


def calculate_path_smoothness(path: List[Tuple[int, int]]) -> float:
    """计算路径平滑度（转向次数越少越平滑）"""
    if len(path) < 3:
        return 1.0
    
    direction_changes = 0
    for i in range(2, len(path)):
        prev_dir = (path[i-1][0] - path[i-2][0], path[i-1][1] - path[i-2][1])
        curr_dir = (path[i][0] - path[i-1][0], path[i][1] - path[i-1][1])
        if prev_dir != curr_dir:
            direction_changes += 1
    
    return 1.0 / (1.0 + direction_changes / len(path))


class SmoothPathGeneticAlgorithm(GeneticAlgorithm):
    """优化路径长度和平滑度的遗传算法"""
    
    def __init__(self, maze: Maze, *args, smoothness_weight: float = 0.2, **kwargs):
        """
        Args:
            smoothness_weight: 平滑度权重 (0-1)
        """
        super().__init__(maze, *args, **kwargs)
        self.smoothness_weight = smoothness_weight
    
    def evaluate_individual(self, individual: Individual) -> float:
        """重新评估个体，考虑平滑度"""
        # 原始适应度
        base_fitness = individual.fitness
        
        # 平滑度奖励
        if individual.path:
            smoothness = calculate_path_smoothness(individual.path)
            smoothness_bonus = smoothness * 500 * self.smoothness_weight
            
            # 路径长度惩罚（鼓励更短路径）
            if individual.reached_end:
                length_penalty = len(individual.path) * 2
                return base_fitness + smoothness_bonus - length_penalty
        
        return base_fitness
    
    def evolve(self) -> Individual:
        """重写evolve，使用新的评估函数"""
        result = super().evolve()
        
        # 重新评估所有个体
        for ind in self.population:
            ind.fitness = self.evaluate_individual(ind)
        
        self._update_best_individual()
        return self.best_individual

