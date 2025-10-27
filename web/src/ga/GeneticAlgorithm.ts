// 遗传算法核心
import type { Position, GAConfig, GenerationResult } from '../types';
import { Maze } from '../maze/Maze';
import { Individual } from './Individual';

export class GeneticAlgorithm {
  population: Individual[] = [];
  generation: number = 0;
  bestIndividual: Individual | null = null;
  fitnessHistory: { generation: number; best: number; avg: number; }[] = [];

  maze: Maze;
  config: GAConfig;

  constructor(
    maze: Maze,
    config: GAConfig
  ) {
    this.maze = maze;
    this.config = config;
  }

  initialize(): void {
    this.population = [];
    for (let i = 0; i < this.config.populationSize; i++) {
      this.population.push(new Individual(this.maze, [], this.config.maxSteps));
    }
    this.updateBest();
  }

  protected updateBest(): void {
    const current = this.population.reduce((best, ind) =>
      ind.fitness > best.fitness ? ind : best
    );
    
    if (!this.bestIndividual || current.fitness > this.bestIndividual.fitness) {
      this.bestIndividual = current.clone();
    }
  }

  protected selection(): Individual {
    // 锦标赛选择
    const tournamentSize = 5;
    const tournament: Individual[] = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[idx]);
    }
    
    return tournament.reduce((best, ind) => 
      ind.fitness > best.fitness ? ind : best
    );
  }

  protected crossover(parent1: Individual, parent2: Individual): [Individual, Individual] {
    if (Math.random() > this.config.crossoverRate) {
      return [parent1.clone(), parent2.clone()];
    }

    const minLen = Math.min(parent1.path.length, parent2.path.length);
    if (minLen <= 1) {
      return [parent1.clone(), parent2.clone()];
    }

    const point = Math.floor(Math.random() * (minLen - 1)) + 1;
    
    const child1Path = [...parent1.path.slice(0, point), ...parent2.path.slice(point)];
    const child2Path = [...parent2.path.slice(0, point), ...parent1.path.slice(point)];

    return [
      new Individual(this.maze, this.repairPath(child1Path), this.config.maxSteps),
      new Individual(this.maze, this.repairPath(child2Path), this.config.maxSteps)
    ];
  }

  protected repairPath(path: Position[]): Position[] {
    if (path.length === 0) return [this.maze.start];
    
    const repaired: Position[] = [path[0]];
    
    for (let i = 1; i < path.length; i++) {
      const current = repaired[repaired.length - 1];
      const next = path[i];
      
      if (this.maze.manhattanDistance(current, next) === 1 && this.maze.isValid(next)) {
        repaired.push(next);
      } else {
        const neighbors = this.maze.getNeighbors(current);
        if (neighbors.length > 0) {
          repaired.push(neighbors[Math.floor(Math.random() * neighbors.length)]);
        }
      }
    }
    
    return repaired;
  }

  protected mutation(individual: Individual): Individual {
    if (Math.random() > this.config.mutationRate) {
      return individual.clone();
    }

    const path = [...individual.path];
    if (path.length <= 2) return individual.clone();

    const point = Math.floor(Math.random() * (path.length - 1)) + 1;
    const newPath = path.slice(0, point);
    let current = path[point - 1];

    const steps = Math.min(20, this.config.maxSteps - newPath.length);
    for (let i = 0; i < steps; i++) {
      if (this.posEqual(current, this.maze.end)) break;

      const neighbors = this.maze.getNeighbors(current);
      if (neighbors.length === 0) break;

      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      newPath.push(next);
      current = next;
    }

    return new Individual(this.maze, newPath, this.config.maxSteps);
  }

  evolve(): Individual {
    const newPopulation: Individual[] = [];

    // 精英保留
    const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
    for (let i = 0; i < this.config.elitismCount; i++) {
      newPopulation.push(sorted[i].clone());
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

  async *runWithAnimation(): AsyncGenerator<GenerationResult> {
    this.initialize();

    for (let gen = 0; gen < this.config.maxGenerations; gen++) {
      const best = this.evolve();
      const avgFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length;
      const diversity = this.calculateDiversity();

      yield {
        generation: gen,
        best: best.clone(),
        population: this.population.slice(0, 10).map(ind => ind.clone()),
        avgFitness,
        bestFitness: best.fitness,
        diversity
      };

      // 让出控制权保证60 FPS
      await new Promise(resolve => setTimeout(resolve, 0));

      if (best.reachedEnd && gen > 50) break;
    }
  }

  protected calculateDiversity(): number {
    const fitnesses = this.population.map(ind => ind.fitness);
    const avg = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
    const variance = fitnesses.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / fitnesses.length;
    return Math.sqrt(variance);
  }

  protected posEqual(p1: Position, p2: Position): boolean {
    return p1[0] === p2[0] && p1[1] === p2[1];
  }
}

