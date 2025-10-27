// 动画管理器
import type { GenerationResult } from '../types';
import { GeneticAlgorithm } from '../ga/GeneticAlgorithm';
import { MazeRenderer } from './MazeRenderer';
import { FitnessChart } from './FitnessChart';

export class AnimationManager {
  gaIterator: AsyncGenerator<GenerationResult> | null = null;
  animationId: number | null = null;
  isRunning: boolean = false;
  isPaused: boolean = false;

  renderer: MazeRenderer;
  fitnessChart: FitnessChart;
  onUpdate?: (result: GenerationResult) => void;

  constructor(
    renderer: MazeRenderer,
    fitnessChart: FitnessChart,
    onUpdate?: (result: GenerationResult) => void
  ) {
    this.renderer = renderer;
    this.fitnessChart = fitnessChart;
    this.onUpdate = onUpdate;
  }

  async start(ga: GeneticAlgorithm): Promise<void> {
    this.isRunning = true;
    this.isPaused = false;
    this.gaIterator = ga.runWithAnimation();
    this.animate();
  }

  private async animate(): Promise<void> {
    if (!this.isRunning || this.isPaused || !this.gaIterator) return;

    const result = await this.gaIterator.next();

    if (!result.done) {
      this.render(result.value);
      
      if (this.onUpdate) {
        this.onUpdate(result.value);
      }

      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isRunning = false;
    }
  }

  private render(result: GenerationResult): void {
    // 清空画布
    this.renderer.clear();
    
    // 绘制迷宫
    this.renderer.renderMaze();
    
    // 绘制种群路径（半透明）
    const populationPaths = result.population.map(ind => ind.path);
    this.renderer.renderPaths(populationPaths, 0.3);
    
    // 绘制最佳路径（高亮）
    this.renderer.renderBestPath(result.best.path, true);
    
    // 绘制起终点
    const maze = (this.renderer as any).maze;
    if (maze) {
      this.renderer.renderStartEnd(maze);
    }
    
    // 更新适应度图表
    this.fitnessChart.addPoint(result.generation, result.bestFitness, result.avgFitness);
    this.fitnessChart.render();
  }

  pause(): void {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.animate();
    }
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  reset(): void {
    this.stop();
    this.gaIterator = null;
  }
}

