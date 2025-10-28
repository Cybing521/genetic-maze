// 选择算子集合
import { Individual } from '../Individual';

export type SelectionMethod = 'tournament' | 'roulette' | 'rank' | 'sus';

export class SelectionOperators {
  /**
   * 锦标赛选择（Tournament Selection）
   * 随机选择k个个体，返回其中最优的
   */
  static tournament(population: Individual[], tournamentSize: number = 5): Individual {
    const tournament: Individual[] = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * population.length);
      tournament.push(population[idx]);
    }
    
    return tournament.reduce((best, ind) => 
      ind.fitness > best.fitness ? ind : best
    );
  }

  /**
   * 轮盘赌选择（Roulette Wheel Selection）
   * 基于适应度比例的概率选择
   */
  static roulette(population: Individual[]): Individual {
    // 处理负适应度：找到最小值并平移
    const minFitness = Math.min(...population.map(ind => ind.fitness));
    const offset = minFitness < 0 ? Math.abs(minFitness) + 1 : 0;
    
    const totalFitness = population.reduce((sum, ind) => sum + ind.fitness + offset, 0);
    
    if (totalFitness === 0) {
      // 所有适应度为0，随机选择
      return population[Math.floor(Math.random() * population.length)];
    }
    
    let random = Math.random() * totalFitness;
    
    for (const individual of population) {
      random -= (individual.fitness + offset);
      if (random <= 0) {
        return individual;
      }
    }
    
    return population[population.length - 1];
  }

  /**
   * 排序选择（Rank Selection）
   * 基于排名而非适应度值进行选择，避免超级个体垄断
   */
  static rank(population: Individual[]): Individual {
    // 按适应度排序
    const sorted = [...population].sort((a, b) => a.fitness - b.fitness);
    
    // 使用线性排名：rank 1, 2, 3, ..., n
    // 总和 = n(n+1)/2
    const n = sorted.length;
    const totalRank = n * (n + 1) / 2;
    
    let random = Math.random() * totalRank;
    
    for (let i = 0; i < n; i++) {
      const rank = i + 1; // rank从1开始
      random -= rank;
      if (random <= 0) {
        return sorted[i];
      }
    }
    
    return sorted[n - 1];
  }

  /**
   * 随机通用采样（Stochastic Universal Sampling）
   * 改进的轮盘赌，使用多个等距指针，选择更均匀
   */
  static stochasticUniversalSampling(population: Individual[], count: number): Individual[] {
    const minFitness = Math.min(...population.map(ind => ind.fitness));
    const offset = minFitness < 0 ? Math.abs(minFitness) + 1 : 0;
    
    const totalFitness = population.reduce((sum, ind) => sum + ind.fitness + offset, 0);
    
    if (totalFitness === 0) {
      // 随机选择
      return Array.from({ length: count }, () => 
        population[Math.floor(Math.random() * population.length)]
      );
    }
    
    const pointerDistance = totalFitness / count;
    const start = Math.random() * pointerDistance;
    
    const selected: Individual[] = [];
    let currentMember = 0;
    let currentSum = population[0].fitness + offset;
    
    for (let i = 0; i < count; i++) {
      const pointer = start + i * pointerDistance;
      
      while (currentSum < pointer && currentMember < population.length - 1) {
        currentMember++;
        currentSum += population[currentMember].fitness + offset;
      }
      
      selected.push(population[currentMember]);
    }
    
    return selected;
  }

  /**
   * 根据方法名选择
   */
  static select(method: SelectionMethod, population: Individual[], params?: any): Individual {
    switch (method) {
      case 'tournament':
        return this.tournament(population, params?.tournamentSize || 5);
      case 'roulette':
        return this.roulette(population);
      case 'rank':
        return this.rank(population);
      case 'sus':
        // SUS通常一次选择多个，这里选择第一个
        return this.stochasticUniversalSampling(population, 1)[0];
      default:
        return this.tournament(population);
    }
  }
}

