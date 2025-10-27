"""
自适应遗传算法模块 - 动态调整参数
"""
import numpy as np
from typing import List
from genetic_algorithm import GeneticAlgorithm, Individual
from maze import Maze


class AdaptiveGeneticAlgorithm(GeneticAlgorithm):
    """自适应遗传算法 - 根据进化状态动态调整参数"""
    
    def __init__(self, maze: Maze, 
                 population_size: int = 100,
                 max_generations: int = 500,
                 initial_mutation_rate: float = 0.3,
                 initial_crossover_rate: float = 0.7,
                 elitism_count: int = 2,
                 max_steps: int = 200,
                 adaptive_mode: str = 'diversity'):
        """
        初始化自适应遗传算法
        
        Args:
            adaptive_mode: 自适应模式
                - 'diversity': 基于种群多样性调整
                - 'fitness': 基于适应度改进调整
                - 'hybrid': 混合模式
        """
        super().__init__(maze, population_size, max_generations, 
                        initial_mutation_rate, initial_crossover_rate,
                        elitism_count, max_steps)
        
        self.initial_mutation_rate = initial_mutation_rate
        self.initial_crossover_rate = initial_crossover_rate
        self.adaptive_mode = adaptive_mode
        
        # 自适应参数历史
        self.mutation_history = []
        self.crossover_history = []
        self.diversity_history = []
        
    def calculate_diversity(self) -> float:
        """计算种群多样性（适应度标准差）"""
        if not self.population:
            return 0.0
        fitness_values = [ind.fitness for ind in self.population]
        return float(np.std(fitness_values))
    
    def calculate_improvement_rate(self) -> float:
        """计算适应度改进率"""
        if len(self.fitness_history) < 2:
            return 1.0
        
        recent = min(10, len(self.fitness_history))
        recent_best = [h['best_fitness'] for h in self.fitness_history[-recent:]]
        
        if len(recent_best) < 2:
            return 1.0
        
        improvement = recent_best[-1] - recent_best[0]
        return max(0.0, min(1.0, improvement / (recent_best[0] + 1)))
    
    def adapt_parameters(self):
        """根据种群状态自适应调整参数"""
        diversity = self.calculate_diversity()
        self.diversity_history.append(diversity)
        
        if self.adaptive_mode == 'diversity':
            # 基于多样性调整
            # 多样性低 → 增加变异率，促进探索
            # 多样性高 → 降低变异率，促进收敛
            if len(self.diversity_history) > 1:
                avg_diversity = np.mean(self.diversity_history[-10:])
                
                if diversity < avg_diversity * 0.5:  # 多样性过低
                    self.mutation_rate = min(0.4, self.mutation_rate * 1.2)
                    self.crossover_rate = max(0.5, self.crossover_rate * 0.95)
                elif diversity > avg_diversity * 1.5:  # 多样性过高
                    self.mutation_rate = max(0.05, self.mutation_rate * 0.9)
                    self.crossover_rate = min(0.9, self.crossover_rate * 1.05)
        
        elif self.adaptive_mode == 'fitness':
            # 基于适应度改进调整
            improvement_rate = self.calculate_improvement_rate()
            
            if improvement_rate < 0.01:  # 停滞不前
                self.mutation_rate = min(0.5, self.mutation_rate * 1.3)
            elif improvement_rate > 0.1:  # 快速改进
                self.mutation_rate = max(0.05, self.mutation_rate * 0.9)
        
        elif self.adaptive_mode == 'hybrid':
            # 混合模式：综合考虑
            diversity = self.calculate_diversity()
            improvement_rate = self.calculate_improvement_rate()
            progress = self.generation / self.max_generations
            
            # 初期：高变异率促进探索
            # 后期：低变异率促进收敛
            base_mutation = self.initial_mutation_rate * (1 - progress * 0.7)
            
            # 根据多样性和改进率微调
            if diversity < 10 and improvement_rate < 0.01:
                self.mutation_rate = min(0.5, base_mutation * 1.5)
            else:
                self.mutation_rate = max(0.05, base_mutation)
            
            # 交叉率随进度略微调整
            self.crossover_rate = self.initial_crossover_rate * (1 + progress * 0.2)
        
        # 记录参数变化
        self.mutation_history.append(self.mutation_rate)
        self.crossover_history.append(self.crossover_rate)
    
    def evolve(self) -> Individual:
        """执行一代进化（带自适应）"""
        # 先自适应调整参数
        if self.generation > 0:
            self.adapt_parameters()
        
        # 调用父类的evolve方法
        return super().evolve()
    
    def run(self, verbose: bool = True) -> Individual:
        """运行自适应遗传算法"""
        self.initialize_population()
        
        if verbose:
            print(f"自适应遗传算法 (模式: {self.adaptive_mode})")
            print(f"初始变异率: {self.initial_mutation_rate}")
            print(f"初始交叉率: {self.initial_crossover_rate}\n")
        
        for gen in range(self.max_generations):
            best = self.evolve()
            
            if verbose and (gen % 50 == 0 or best.reached_end):
                status = "已到达终点!" if best.reached_end else "未到达终点"
                print(f"代数 {gen}: 适应度={best.fitness:.2f}, "
                      f"路径长度={len(best.path)}, {status} | "
                      f"变异率={self.mutation_rate:.3f}, "
                      f"交叉率={self.crossover_rate:.3f}")
            
            if best.reached_end and gen > 50:
                if verbose:
                    print(f"\n在第 {gen} 代找到解决方案!")
                break
        
        if verbose:
            print(f"\n最终结果:")
            print(f"最佳适应度: {self.best_individual.fitness:.2f}")
            print(f"路径长度: {len(self.best_individual.path)}")
            print(f"最终变异率: {self.mutation_rate:.3f}")
            print(f"最终交叉率: {self.crossover_rate:.3f}")
        
        return self.best_individual

