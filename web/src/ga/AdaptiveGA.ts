// 增强自适应遗传算法
import { GeneticAlgorithm } from './GeneticAlgorithm';
import { Maze } from '../maze/Maze';
import { Individual } from './Individual';
import type { GAConfig } from '../types';

export class AdaptiveGeneticAlgorithm extends GeneticAlgorithm {
  private initialMutationRate: number;
  private initialCrossoverRate: number;
  private initialPopulationSize: number;
  private diversityHistory: number[] = [];
  private stagnationCounter: number = 0;
  private lastBestFitness: number = 0;

  constructor(maze: Maze, config: GAConfig) {
    super(maze, config);
    this.initialMutationRate = config.mutationRate;
    this.initialCrossoverRate = config.crossoverRate;
    this.initialPopulationSize = config.populationSize;
  }

  evolve() {
    // 自适应调整参数
    if (this.generation > 0) {
      this.adaptParameters();
    }
    return super.evolve();
  }

  private adaptParameters(): void {
    const diversity = this.calculateDiversity();
    this.diversityHistory.push(diversity);

    const progress = this.generation / this.config.maxGenerations;
    const currentBest = this.bestIndividual?.fitness || 0;

    // 检测停滞
    if (Math.abs(currentBest - this.lastBestFitness) < 0.1) {
      this.stagnationCounter++;
    } else {
      this.stagnationCounter = 0;
    }
    this.lastBestFitness = currentBest;

    if (this.config.adaptiveMode === 'diversity') {
      this.adaptByDiversity(diversity);
    } else if (this.config.adaptiveMode === 'hybrid') {
      this.adaptHybrid(diversity, progress);
    }

    // 自适应种群大小
    this.adaptPopulationSize(progress);
  }

  /**
   * 基于多样性的自适应策略
   */
  private adaptByDiversity(diversity: number): void {
    if (this.diversityHistory.length > 10) {
      const avgDiversity = this.diversityHistory.slice(-10).reduce((a, b) => a + b) / 10;
      
      // 多样性过低：增加变异率，降低交叉率
      if (diversity < avgDiversity * 0.5) {
        this.config.mutationRate = Math.min(0.4, this.config.mutationRate * 1.2);
        this.config.crossoverRate = Math.max(0.5, this.config.crossoverRate * 0.95);
      } 
      // 多样性过高：降低变异率，增加交叉率
      else if (diversity > avgDiversity * 1.5) {
        this.config.mutationRate = Math.max(0.01, this.config.mutationRate * 0.9);
        this.config.crossoverRate = Math.min(0.95, this.config.crossoverRate * 1.05);
      }
    }
  }

  /**
   * 混合自适应策略：结合进化进度、多样性、停滞检测
   */
  private adaptHybrid(diversity: number, progress: number): void {
    // 1. 基于进化进度的基础调整
    const baseMutation = this.initialMutationRate * (1 - progress * 0.6);
    const baseCrossover = this.initialCrossoverRate * (1 + progress * 0.15);

    // 2. 根据停滞情况调整
    if (this.stagnationCounter > 20) {
      // 长期停滞：大幅提高变异率
      this.config.mutationRate = Math.min(0.5, baseMutation * 2.0);
      this.config.crossoverRate = Math.max(0.5, baseCrossover * 0.8);
      
      // 注入随机个体
      if (this.stagnationCounter > 30 && this.stagnationCounter % 10 === 0) {
        this.injectRandomIndividuals(0.1); // 注入10%随机个体
      }
    } else if (this.stagnationCounter > 10) {
      // 轻微停滞：适度调整
      this.config.mutationRate = Math.min(0.3, baseMutation * 1.3);
    } else {
      // 正常进化
      this.config.mutationRate = baseMutation;
      this.config.crossoverRate = baseCrossover;
    }

    // 3. 根据多样性微调
    if (diversity < 10 && this.fitnessHistory.length > 10) {
      const recentImprovement = this.fitnessHistory[this.fitnessHistory.length - 1].best - 
                               this.fitnessHistory[this.fitnessHistory.length - 10].best;
      if (recentImprovement < 5) {
        this.config.mutationRate = Math.min(0.5, this.config.mutationRate * 1.2);
      }
    }

    // 确保参数在合理范围内
    this.config.mutationRate = Math.max(0.01, Math.min(0.5, this.config.mutationRate));
    this.config.crossoverRate = Math.max(0.5, Math.min(0.95, this.config.crossoverRate));
  }

  /**
   * 自适应种群大小
   */
  private adaptPopulationSize(progress: number): void {
    // 后期收敛时缩减种群以节省计算
    if (progress > 0.7 && this.bestIndividual?.reachedEnd) {
      const targetSize = Math.max(
        Math.floor(this.initialPopulationSize * 0.6),
        this.config.elitismCount * 3
      );
      
      if (this.population.length > targetSize) {
        // 保留精英和部分优秀个体
        const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
        this.population = sorted.slice(0, targetSize);
        this.config.populationSize = targetSize;
      }
    }
  }

  /**
   * 注入随机个体以增加多样性
   */
  private injectRandomIndividuals(ratio: number): void {
    const injectCount = Math.floor(this.population.length * ratio);
    const sorted = [...this.population].sort((a, b) => a.fitness - b.fitness);
    
    for (let i = 0; i < injectCount; i++) {
      sorted[i] = new Individual(this.maze, [], this.config.maxSteps);
    }
    
    this.population = sorted;
    this.stagnationCounter = 0; // 重置停滞计数
  }

  /**
   * 自适应选择压力
   */
  protected selection(): Individual {
    // 根据进化阶段调整锦标赛大小
    const progress = this.generation / this.config.maxGenerations;
    const tournamentSize = Math.floor(3 + progress * 4); // 3到7之间
    
    const tournament: Individual[] = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[idx]);
    }
    
    return tournament.reduce((best, ind) => 
      ind.fitness > best.fitness ? ind : best
    );
  }
}

