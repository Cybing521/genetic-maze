// Island GA Worker - 在独立线程中运行遗传算法
import { Maze } from '../maze/Maze';
import { GeneticAlgorithm } from '../ga/GeneticAlgorithm';
import { Individual } from '../ga/Individual';
import type { GAConfig, MazeData } from '../types';

// Worker消息类型
interface WorkerMessage {
  type: 'init' | 'evolve' | 'migrate' | 'stop';
  data?: any;
}

interface WorkerResponse {
  type: 'initialized' | 'generation' | 'completed' | 'error';
  data?: any;
}

let ga: GeneticAlgorithm | null = null;
let isRunning = false;

// 接收主线程消息
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'init':
        handleInit(data);
        break;
      case 'evolve':
        handleEvolve(data);
        break;
      case 'migrate':
        handleMigrate(data);
        break;
      case 'stop':
        handleStop();
        break;
    }
  } catch (error: any) {
    postResponse({ type: 'error', data: { message: error.message } });
  }
};

/**
 * 初始化GA
 */
function handleInit(data: { mazeData: MazeData; config: GAConfig; islandId: number }) {
  const { mazeData, config, islandId } = data;
  
  // 重建迷宫对象
  const maze = Maze.fromJSON(mazeData);
  
  // 创建GA实例
  ga = new GeneticAlgorithm(maze, config);
  ga.initialize();

  postResponse({
    type: 'initialized',
    data: { islandId }
  });
}

/**
 * 执行进化
 */
function handleEvolve(data: { generations: number; islandId: number }) {
  if (!ga) {
    throw new Error('GA not initialized');
  }

  const { generations, islandId } = data;
  isRunning = true;

  for (let i = 0; i < generations && isRunning; i++) {
    const best = ga.evolve();
    
    // 每代发送结果
    postResponse({
      type: 'generation',
      data: {
        islandId,
        generation: ga.generation,
        best: {
          path: best.path,
          fitness: best.fitness,
          reachedEnd: best.reachedEnd
        },
        avgFitness: ga.population.reduce((sum, ind) => sum + ind.fitness, 0) / ga.population.length,
        diversity: calculateDiversity(ga.population)
      }
    });
  }

  if (isRunning) {
    postResponse({
      type: 'completed',
      data: { islandId }
    });
  }

  isRunning = false;
}

/**
 * 处理迁移：接收来自其他岛屿的个体
 */
function handleMigrate(data: { individuals: any[]; islandId: number }) {
  if (!ga) {
    throw new Error('GA not initialized');
  }

  const { individuals } = data;
  
  // 将接收到的个体数据重建为Individual对象
  const migratedIndividuals = individuals.map(indData => {
    const ind = new Individual(ga!.maze, indData.path, ga!.config.maxSteps);
    ind.fitness = indData.fitness;
    ind.reachedEnd = indData.reachedEnd;
    return ind;
  });

  // 替换种群中最差的个体
  const sorted = [...ga.population].sort((a, b) => a.fitness - b.fitness);
  
  for (let i = 0; i < migratedIndividuals.length && i < sorted.length; i++) {
    sorted[i] = migratedIndividuals[i];
  }
  
  ga.population = sorted;
}

/**
 * 停止运行
 */
function handleStop() {
  isRunning = false;
}

/**
 * 发送响应到主线程
 */
function postResponse(response: WorkerResponse) {
  self.postMessage(response);
}

/**
 * 计算种群多样性
 */
function calculateDiversity(population: Individual[]): number {
  const fitnesses = population.map(ind => ind.fitness);
  const avg = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
  const variance = fitnesses.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / fitnesses.length;
  return Math.sqrt(variance);
}

