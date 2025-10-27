// 自适应遗传算法
import { GeneticAlgorithm } from './GeneticAlgorithm';
import { Maze } from '../maze/Maze';
import type { GAConfig } from '../types';

export class AdaptiveGeneticAlgorithm extends GeneticAlgorithm {
  private initialMutationRate: number;
  private diversityHistory: number[] = [];

  constructor(maze: Maze, config: GAConfig) {
    super(maze, config);
    this.initialMutationRate = config.mutationRate;
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

    if (this.config.adaptiveMode === 'diversity') {
      // 基于多样性
      if (this.diversityHistory.length > 10) {
        const avgDiversity = this.diversityHistory.slice(-10).reduce((a, b) => a + b) / 10;
        
        if (diversity < avgDiversity * 0.5) {
          this.config.mutationRate = Math.min(0.4, this.config.mutationRate * 1.2);
        } else if (diversity > avgDiversity * 1.5) {
          this.config.mutationRate = Math.max(0.05, this.config.mutationRate * 0.9);
        }
      }
    } else if (this.config.adaptiveMode === 'hybrid') {
      // 混合模式：初期高变异，后期低变异
      const baseMutation = this.initialMutationRate * (1 - progress * 0.7);
      
      if (diversity < 10 && this.fitnessHistory.length > 10) {
        const recentImprovement = this.fitnessHistory[this.fitnessHistory.length - 1].best - 
                                 this.fitnessHistory[this.fitnessHistory.length - 10].best;
        if (recentImprovement < 10) {
          this.config.mutationRate = Math.min(0.5, baseMutation * 1.5);
        }
      } else {
        this.config.mutationRate = Math.max(0.05, baseMutation);
      }
    }
  }
}

