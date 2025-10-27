// 详细展示版遗传算法 - 展示每一代的探索过程
import { GeneticAlgorithm } from './GeneticAlgorithm';
import { Individual } from './Individual';

export interface ExplorationFrame {
  type: 'init' | 'evaluate' | 'select' | 'crossover' | 'mutate' | 'complete';
  population: any[];  // 使用any避免循环引用
  highlight?: number[];  // 高亮显示的个体索引
  message: string;
  progress: number;  // 0-1
}

export class DetailedGeneticAlgorithm extends GeneticAlgorithm {
  
  async *runWithDetailedAnimation(): AsyncGenerator<ExplorationFrame> {
    this.initialize();
    
    // 初始种群展示
    yield {
      type: 'init',
      population: this.population.map(ind => ind.clone()),
      message: `初始化 ${this.config.populationSize} 个个体`,
      progress: 0
    };
    
    await this.delay(500);

    for (let gen = 0; gen < this.config.maxGenerations; gen++) {
      // 1. 评估阶段
      yield {
        type: 'evaluate',
        population: this.population.map(ind => ind.clone()),
        message: `第 ${gen} 代：评估适应度`,
        progress: gen / this.config.maxGenerations
      };
      
      await this.delay(200);

      // 2. 排序展示
      const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
      yield {
        type: 'evaluate',
        population: sorted.map(ind => ind.clone()),
        highlight: Array.from({length: this.config.elitismCount}, (_, i) => i),
        message: `排序完成，精英保留前 ${this.config.elitismCount} 名`,
        progress: gen / this.config.maxGenerations
      };
      
      await this.delay(300);

      // 3. 执行进化（内部）
      const newPopulation: Individual[] = [];
      
      // 精英保留
      for (let i = 0; i < this.config.elitismCount; i++) {
        newPopulation.push(sorted[i].clone());
      }

      // 4. 生成新个体（分批展示）
      let batchCount = 0;
      while (newPopulation.length < this.config.populationSize) {
        const parent1 = this.selection();
        const parent2 = this.selection();
        const [child1, child2] = this.crossover(parent1, parent2);

        newPopulation.push(this.mutation(child1));
        if (newPopulation.length < this.config.populationSize) {
          newPopulation.push(this.mutation(child2));
        }

        // 每10个新个体展示一次
        if (newPopulation.length % 10 === 0 || newPopulation.length >= this.config.populationSize) {
          batchCount++;
          yield {
            type: 'crossover',
            population: newPopulation.map(ind => ind.clone()),
            message: `交叉和变异：已生成 ${newPopulation.length}/${this.config.populationSize} 个新个体`,
            progress: gen / this.config.maxGenerations
          };
          
          await this.delay(100);
        }
      }

      // 5. 替换种群
      this.population = newPopulation;
      this.updateBest();

      // 记录历史
      const avgFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length;
      this.fitnessHistory.push({
        generation: this.generation,
        best: this.bestIndividual!.fitness,
        avg: avgFitness
      });

      // 6. 本代完成
      yield {
        type: 'complete',
        population: this.population.slice(0, 10).map(ind => ind.clone()),
        highlight: [0],
        message: `第 ${gen} 代完成！最佳适应度: ${this.bestIndividual!.fitness.toFixed(0)}`,
        progress: gen / this.config.maxGenerations
      };

      this.generation++;
      
      await this.delay(400);

      // 检查是否找到解
      if (this.bestIndividual!.reachedEnd && gen > 50) {
        yield {
          type: 'complete',
          population: [this.bestIndividual!.clone()],
          message: `✓ 在第 ${gen} 代找到解决方案！`,
          progress: 1
        };
        break;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

