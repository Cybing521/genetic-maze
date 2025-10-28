// 混合遗传算法 - 集成所有新算子
import { GeneticAlgorithm } from './GeneticAlgorithm';
import { Individual } from './Individual';
import { SelectionOperators } from './operators/SelectionOperators';
import { CrossoverOperators } from './operators/CrossoverOperators';
import { MutationOperators } from './operators/MutationOperators';
import { FitnessFunction, FITNESS_PRESETS } from './fitness/FitnessFunction';
import type { SelectionMethod } from './operators/SelectionOperators';
import type { CrossoverMethod } from './operators/CrossoverOperators';
import type { MutationMethod } from './operators/MutationOperators';
import type { FitnessWeights } from './fitness/FitnessFunction';
import { AStar } from '../algorithms/AStar';
import type { GAConfig } from '../types';
import { Maze } from '../maze/Maze';

export interface HybridGAConfig extends GAConfig {
  selectionMethod: SelectionMethod;
  crossoverMethod: CrossoverMethod;
  mutationMethod: MutationMethod;
  useAStarInit: boolean;
  astarInitRatio: number; // A*初始化的个体比例 (0-1)
  fitnessWeights: FitnessWeights;
  diversityThreshold: number; // 多样性阈值，低于此值注入随机个体
  localSearchInterval: number; // 每隔N代对精英进行局部搜索
}

export class HybridGA extends GeneticAlgorithm {
  hybridConfig: HybridGAConfig;

  constructor(maze: Maze, config: HybridGAConfig) {
    super(maze, config);
    this.hybridConfig = config;
  }

  /**
   * 初始化种群 - 使用A*启发式
   */
  initialize(): void {
    this.population = [];
    
    const astarCount = this.hybridConfig.useAStarInit 
      ? Math.floor(this.config.populationSize * this.hybridConfig.astarInitRatio)
      : 0;

    // A*初始化的个体
    for (let i = 0; i < astarCount; i++) {
      const noise = i / astarCount; // 逐渐增加噪声
      const path = AStar.findPathWithNoise(this.maze, noise, this.config.maxSteps);
      
      if (path.length > 0) {
        this.population.push(new Individual(this.maze, path, this.config.maxSteps));
      } else {
        // A*失败，生成随机个体
        this.population.push(new Individual(this.maze, [], this.config.maxSteps));
      }
    }

    // 剩余随机个体
    for (let i = astarCount; i < this.config.populationSize; i++) {
      this.population.push(new Individual(this.maze, [], this.config.maxSteps));
    }

    this.updateBest();
  }

  /**
   * 重写适应度计算 - 使用多目标适应度
   */
  protected evaluateWithMultiObjective(individual: Individual): void {
    const result = FitnessFunction.multiObjective(
      individual.path,
      this.maze,
      this.config.maxSteps,
      this.hybridConfig.fitnessWeights,
      this.generation
    );
    
    individual.fitness = result.fitness;
    individual.reachedEnd = result.reachedEnd;
  }

  /**
   * 选择 - 使用配置的方法
   */
  protected selection(): Individual {
    return SelectionOperators.select(
      this.hybridConfig.selectionMethod,
      this.population,
      { tournamentSize: 5 }
    );
  }

  /**
   * 交叉 - 使用配置的方法
   */
  protected crossover(parent1: Individual, parent2: Individual): [Individual, Individual] {
    if (Math.random() > this.config.crossoverRate) {
      return [parent1.clone(), parent2.clone()];
    }

    return CrossoverOperators.crossover(
      this.hybridConfig.crossoverMethod,
      parent1,
      parent2,
      this.maze,
      this.config.maxSteps,
      (path) => this.repairPath(path)
    );
  }

  /**
   * 变异 - 使用配置的方法
   */
  protected mutation(individual: Individual): Individual {
    if (Math.random() > this.config.mutationRate) {
      return individual.clone();
    }

    return MutationOperators.mutate(
      this.hybridConfig.mutationMethod,
      individual,
      this.maze,
      this.config.maxSteps
    );
  }

  /**
   * 进化 - 增强版本
   */
  evolve(): Individual {
    // 重新计算适应度（使用多目标）
    this.population.forEach(ind => this.evaluateWithMultiObjective(ind));

    // 检查多样性
    const diversity = this.calculateDiversity();
    
    // 多样性过低，注入随机个体
    if (diversity < this.hybridConfig.diversityThreshold) {
      const injectCount = Math.floor(this.config.populationSize * 0.1);
      const sorted = [...this.population].sort((a, b) => a.fitness - b.fitness);
      
      for (let i = 0; i < injectCount; i++) {
        sorted[i] = new Individual(this.maze, [], this.config.maxSteps);
      }
      
      this.population = sorted;
    }

    const newPopulation: Individual[] = [];

    // 精英保留
    const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
    for (let i = 0; i < this.config.elitismCount; i++) {
      newPopulation.push(sorted[i].clone());
    }

    // 局部搜索优化精英
    if (this.hybridConfig.localSearchInterval > 0 && 
        this.generation % this.hybridConfig.localSearchInterval === 0) {
      for (let i = 0; i < Math.min(3, this.config.elitismCount); i++) {
        newPopulation[i] = MutationOperators.mutate(
          'local-search',
          newPopulation[i],
          this.maze,
          this.config.maxSteps
        );
      }
    }

    // 生成新个体
    while (newPopulation.length < this.config.populationSize) {
      const parent1 = this.selection();
      const parent2 = this.selection();
      const [child1, child2] = this.crossover(parent1, parent2);

      newPopulation.push(this.mutation(child1));
      if (newPopulation.length < this.config.populationSize) {
        newPopulation.push(this.mutation(child2));
      }
    }

    this.population = newPopulation;
    this.updateBest();

    // 记录历史
    const avgFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length;
    this.fitnessHistory.push({
      generation: this.generation,
      best: this.bestIndividual!.fitness,
      avg: avgFitness
    });

    this.generation++;
    return this.bestIndividual!;
  }
}

/**
 * 创建默认混合GA配置
 */
export function createHybridGAConfig(baseConfig: GAConfig): HybridGAConfig {
  return {
    ...baseConfig,
    selectionMethod: 'tournament',
    crossoverMethod: 'order',
    mutationMethod: 'guided',
    useAStarInit: true,
    astarInitRatio: 0.15, // 15%使用A*初始化
    fitnessWeights: FITNESS_PRESETS.balanced,
    diversityThreshold: 10,
    localSearchInterval: 10 // 每10代进行一次局部搜索
  };
}

