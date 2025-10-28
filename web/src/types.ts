// 全局类型定义

export type Position = [number, number]; // [y, x]

export interface MazeData {
  width: number;
  height: number;
  grid: number[][];
  start: Position;
  end: Position;
}

// 算子类型
export type SelectionMethod = 'tournament' | 'roulette' | 'rank' | 'sus';
export type CrossoverMethod = 'single-point' | 'two-point' | 'uniform' | 'order' | 'pmx';
export type MutationMethod = 'random' | 'guided' | 'inversion' | 'insertion' | 'local-search';
export type AlgorithmType = 'standard' | 'adaptive' | 'hybrid' | 'island';

// Island GA类型
export interface IslandConfig {
  numIslands: number;
  migrationInterval: number;
  migrationSize: number;
  migrationTopology: 'ring' | 'star' | 'full';
}

export interface GAConfig {
  populationSize: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  maxSteps: number;
  useAdaptive: boolean;
  adaptiveMode?: 'diversity' | 'fitness' | 'hybrid';
}

export interface GenerationResult {
  generation: number;
  best: Individual;
  population: Individual[];
  avgFitness: number;
  bestFitness: number;
  diversity: number;
}

export interface Individual {
  path: Position[];
  fitness: number;
  reachedEnd: boolean;
}

