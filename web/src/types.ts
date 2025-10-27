// 全局类型定义

export type Position = [number, number]; // [y, x]

export interface MazeData {
  width: number;
  height: number;
  grid: number[][];
  start: Position;
  end: Position;
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

