// 岛屿遗传算法 - 使用Web Workers实现并行计算
import { Maze } from '../maze/Maze';
import type { GAConfig, GenerationResult, MazeData } from '../types';

export interface IslandConfig {
  numIslands: number; // 岛屿数量
  migrationInterval: number; // 迁移间隔（代数）
  migrationSize: number; // 每次迁移的个体数量
  migrationTopology: 'ring' | 'star' | 'full'; // 迁移拓扑
}

interface IslandState {
  id: number;
  worker: Worker;
  generation: number;
  bestFitness: number;
  avgFitness: number;
  diversity: number;
  bestIndividual: any;
}

export class IslandGA {
  maze: Maze;
  config: GAConfig;
  islandConfig: IslandConfig;
  islands: IslandState[] = [];
  globalBest: any = null;
  isRunning: boolean = false;
  onUpdate?: (results: GenerationResult[]) => void;

  constructor(
    maze: Maze,
    config: GAConfig,
    islandConfig: IslandConfig,
    onUpdate?: (results: GenerationResult[]) => void
  ) {
    this.maze = maze;
    this.config = config;
    this.islandConfig = islandConfig;
    this.onUpdate = onUpdate;
  }

  /**
   * 初始化所有岛屿
   */
  async initialize(): Promise<void> {
    const mazeData: MazeData = this.maze.toJSON();

    for (let i = 0; i < this.islandConfig.numIslands; i++) {
      // 创建Worker
      const worker = new Worker(
        new URL('../workers/IslandWorker.ts', import.meta.url),
        { type: 'module' }
      );

      // 创建岛屿状态
      const island: IslandState = {
        id: i,
        worker,
        generation: 0,
        bestFitness: 0,
        avgFitness: 0,
        diversity: 0,
        bestIndividual: null
      };

      // 设置消息处理
      worker.onmessage = (event) => this.handleWorkerMessage(island, event.data);
      worker.onerror = (error) => console.error(`Island ${i} error:`, error);

      this.islands.push(island);

      // 每个岛屿使用稍微不同的参数
      const islandConfig = this.createIslandConfig(i);

      // 初始化Worker
      await new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'initialized') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
        
        worker.postMessage({
          type: 'init',
          data: {
            mazeData,
            config: islandConfig,
            islandId: i
          }
        });
      });
    }
  }

  /**
   * 为每个岛屿创建略微不同的配置
   */
  private createIslandConfig(islandId: number): GAConfig {
    const variance = 0.2; // 参数变异范围
    const offset = (islandId / this.islandConfig.numIslands) * variance;

    return {
      ...this.config,
      mutationRate: this.config.mutationRate * (1 - variance / 2 + offset),
      crossoverRate: this.config.crossoverRate * (1 - variance / 2 + offset),
      populationSize: Math.floor(this.config.populationSize / this.islandConfig.numIslands)
    };
  }

  /**
   * 开始进化
   */
  async start(): Promise<void> {
    this.isRunning = true;

    // 让所有岛屿并行进化
    const promises = this.islands.map(island =>
      this.evolveIsland(island)
    );

    await Promise.all(promises);
    this.isRunning = false;
  }

  /**
   * 单个岛屿的进化循环
   */
  private async evolveIsland(island: IslandState): Promise<void> {
    const generationsPerCycle = this.islandConfig.migrationInterval;

    for (let cycle = 0; cycle < Math.ceil(this.config.maxGenerations / generationsPerCycle); cycle++) {
      if (!this.isRunning) break;

      // 进化一定代数
      await new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'completed' && event.data.data.islandId === island.id) {
            island.worker.removeEventListener('message', handler);
            resolve();
          }
        };
        island.worker.addEventListener('message', handler);

        island.worker.postMessage({
          type: 'evolve',
          data: {
            generations: generationsPerCycle,
            islandId: island.id
          }
        });
      });

      // 迁移
      if (this.isRunning) {
        await this.performMigration();
      }

      // 检查全局最优是否找到解
      if (this.globalBest?.reachedEnd) {
        break;
      }
    }
  }

  /**
   * 处理Worker消息
   */
  private handleWorkerMessage(island: IslandState, message: any): void {
    switch (message.type) {
      case 'generation':
        {
          const { generation, best, avgFitness, diversity } = message.data;
          
          island.generation = generation;
          island.bestFitness = best.fitness;
          island.avgFitness = avgFitness;
          island.diversity = diversity;
          island.bestIndividual = best;

          // 更新全局最优
          if (!this.globalBest || best.fitness > this.globalBest.fitness) {
            this.globalBest = best;
          }

          // 触发更新回调
          if (this.onUpdate) {
            this.onUpdate(this.getIslandResults());
          }
        }
        break;

      case 'error':
        console.error(`Island ${island.id} error:`, message.data);
        break;
    }
  }

  /**
   * 执行迁移
   */
  private async performMigration(): Promise<void> {
    const { migrationSize, migrationTopology } = this.islandConfig;

    switch (migrationTopology) {
      case 'ring':
        // 环形迁移：每个岛屿向下一个岛屿发送个体
        for (let i = 0; i < this.islands.length; i++) {
          const source = this.islands[i];
          const target = this.islands[(i + 1) % this.islands.length];
          await this.migrate(source, target, migrationSize);
        }
        break;

      case 'star':
        // 星形迁移：所有岛屿与最佳岛屿交换
        const bestIsland = this.islands.reduce((best, island) =>
          island.bestFitness > best.bestFitness ? island : best
        );
        
        for (const island of this.islands) {
          if (island.id !== bestIsland.id) {
            await this.migrate(bestIsland, island, migrationSize);
          }
        }
        break;

      case 'full':
        // 全连接：所有岛屿两两交换
        for (let i = 0; i < this.islands.length; i++) {
          for (let j = i + 1; j < this.islands.length; j++) {
            await this.migrate(this.islands[i], this.islands[j], migrationSize);
          }
        }
        break;
    }
  }

  /**
   * 从源岛屿迁移个体到目标岛屿
   */
  private async migrate(source: IslandState, target: IslandState, _size: number): Promise<void> {
    if (!source.bestIndividual) return;

    // 发送最优个体
    const individuals = [source.bestIndividual];

    target.worker.postMessage({
      type: 'migrate',
      data: {
        individuals,
        islandId: target.id
      }
    });
  }

  /**
   * 获取所有岛屿的结果
   */
  private getIslandResults(): GenerationResult[] {
    return this.islands.map(island => ({
      generation: island.generation,
      best: island.bestIndividual,
      population: [], // Worker中不返回完整种群以节省通信开销
      avgFitness: island.avgFitness,
      bestFitness: island.bestFitness,
      diversity: island.diversity
    }));
  }

  /**
   * 停止所有岛屿
   */
  stop(): void {
    this.isRunning = false;
    this.islands.forEach(island => {
      island.worker.postMessage({ type: 'stop' });
    });
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stop();
    this.islands.forEach(island => {
      island.worker.terminate();
    });
    this.islands = [];
  }
}

/**
 * 创建默认岛屿配置
 */
export function createDefaultIslandConfig(): IslandConfig {
  const numCores = navigator.hardwareConcurrency || 4;
  return {
    numIslands: Math.min(numCores, 4), // 最多4个岛屿
    migrationInterval: 20, // 每20代迁移一次
    migrationSize: 1, // 每次迁移1个个体
    migrationTopology: 'ring'
  };
}

