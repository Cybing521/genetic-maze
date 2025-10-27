// 动画管理器
import type { GenerationResult, Position } from '../types';
import { GeneticAlgorithm } from '../ga/GeneticAlgorithm';
import { MazeRenderer } from './MazeRenderer';
import { FitnessChart } from './FitnessChart';

export class AnimationManager {
  gaIterator: AsyncGenerator<GenerationResult> | null = null;
  animationId: number | null = null;
  isRunning: boolean = false;
  isPaused: boolean = false;
  
  // 动画控制
  frameDelay: number = 300;  // 每代之间的延迟（毫秒） - 增加到300ms
  transitionDuration: number = 500;  // 过渡时间（毫秒） - 增加到500ms
  lastFrameTime: number = 0;
  previousGeneration: GenerationResult | null = null;
  currentGeneration: GenerationResult | null = null;
  transitionProgress: number = 1;  // 0-1，1表示完成过渡
  
  // 轨迹淡出
  pathTrails: Array<{ path: Position[]; alpha: number; generation: number }> = [];
  maxTrails: number = 5;
  trailFadeDuration: number = 60;  // 帧数
  
  // FPS统计
  fps: number = 60;
  frameCount: number = 0;
  lastFpsUpdate: number = 0;

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
    this.config = ga.config;  // 保存配置引用
    this.gaIterator = ga.runWithAnimation();
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = performance.now();
    this.animate();
  }

  private async animate(): Promise<void> {
    if (!this.isRunning || this.isPaused || !this.gaIterator) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    // 更新FPS
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }

    // 如果还在过渡中，继续渲染过渡动画
    if (this.transitionProgress < 1) {
      this.transitionProgress = Math.min(1, this.transitionProgress + deltaTime / this.transitionDuration);
      this.renderTransition();
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }

    // 检查是否应该获取下一代
    if (deltaTime < this.frameDelay) {
      // 继续渲染当前代
      if (this.currentGeneration) {
        this.render(this.currentGeneration);
      }
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }

    // 获取下一代
    const result = await this.gaIterator.next();

    if (!result.done) {
      this.lastFrameTime = currentTime;
      this.previousGeneration = this.currentGeneration;
      this.currentGeneration = result.value;
      this.transitionProgress = 0;  // 开始新的过渡
      
      if (this.onUpdate) {
        this.onUpdate(result.value);
      }

      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isRunning = false;
    }
  }
  
  private renderTransition(): void {
    // 使用缓动函数平滑过渡
    const t = this.easeInOutCubic(this.transitionProgress);
    
    if (this.previousGeneration && this.currentGeneration) {
      // 清空画布
      this.renderer.clear();
      
      // 绘制迷宫
      this.renderer.renderMaze();
      
      // 绘制历史轨迹（淡出效果）
      this.renderTrails();
      
      // 插值渲染路径
      const prevPaths = this.previousGeneration.population.map(ind => ind.path);
      const currPaths = this.currentGeneration.population.map(ind => ind.path);
      
      // 渲染种群路径（渐变消失旧的，渐入新的）
      this.renderer.renderPaths(prevPaths, 0.18 * (1 - t));
      this.renderer.renderPaths(currPaths, 0.18 * t);
      
      // 最佳路径使用插值
      const prevBest = this.previousGeneration.best.path;
      const currBest = this.currentGeneration.best.path;
      const interpolatedPath = this.interpolatePaths(prevBest, currBest, t);
      
      this.renderer.renderBestPath(interpolatedPath, true);
      
      // 添加当前最佳路径到轨迹
      if (t === 1 || this.transitionProgress >= 0.99) {
        this.addTrail(currBest, this.currentGeneration.generation);
      }
      
      // 绘制起终点
      const maze = this.renderer.maze;
      if (maze) {
        this.renderer.renderStartEnd(maze);
      }
      
      // 更新图表
      this.fitnessChart.addPoint(
        this.currentGeneration.generation,
        this.currentGeneration.bestFitness,
        this.currentGeneration.avgFitness
      );
      this.fitnessChart.render();
    } else if (this.currentGeneration) {
      this.render(this.currentGeneration);
    }
  }
  
  private addTrail(path: Position[], generation: number): void {
    this.pathTrails.push({
      path: [...path],
      alpha: 1.0,
      generation
    });
    
    // 限制轨迹数量
    if (this.pathTrails.length > this.maxTrails) {
      this.pathTrails.shift();
    }
  }
  
  private renderTrails(): void {
    // 更新并渲染淡出的轨迹
    this.pathTrails.forEach((trail) => {
      trail.alpha = Math.max(0, trail.alpha - 1 / this.trailFadeDuration);
    });
    
    // 移除完全透明的轨迹
    this.pathTrails = this.pathTrails.filter(t => t.alpha > 0.01);
    
    // 渲染轨迹
    const offset = this.renderer.getOffset();
    this.renderer.ctx.save();
    this.renderer.ctx.globalCompositeOperation = 'lighter';
    
    this.pathTrails.forEach((trail) => {
      if (trail.path.length < 2) return;
      
      this.renderer.ctx.strokeStyle = `rgba(0, 255, 255, ${trail.alpha * 0.3})`;
      this.renderer.ctx.lineWidth = 1.5;
      this.renderer.ctx.lineCap = 'round';
      this.renderer.ctx.lineJoin = 'round';
      
      this.renderer.ctx.beginPath();
      trail.path.forEach((pos, i) => {
        const x = offset.x + (pos[1] + 0.5) * this.renderer.cellSize;
        const y = offset.y + (pos[0] + 0.5) * this.renderer.cellSize;
        if (i === 0) this.renderer.ctx.moveTo(x, y);
        else this.renderer.ctx.lineTo(x, y);
      });
      this.renderer.ctx.stroke();
    });
    
    this.renderer.ctx.restore();
  }
  
  private interpolatePaths(path1: Position[], path2: Position[], t: number): Position[] {
    // 简单插值：如果路径长度不同，使用较短的长度
    const minLen = Math.min(path1.length, path2.length);
    const result: Position[] = [];
    
    for (let i = 0; i < minLen; i++) {
      const y = Math.round(path1[i][0] * (1 - t) + path2[i][0] * t);
      const x = Math.round(path1[i][1] * (1 - t) + path2[i][1] * t);
      result.push([y, x]);
    }
    
    // 如果path2更长，添加剩余部分
    if (t > 0.5 && path2.length > minLen) {
      result.push(...path2.slice(minLen));
    }
    
    return result;
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private render(result: GenerationResult): void {
    // 清空画布
    this.renderer.clear();
    
    // 绘制迷宫
    this.renderer.renderMaze();
    
    // 绘制历史轨迹
    this.renderTrails();
    
    // 绘制种群路径（增强可见性）
    const populationPaths = result.population.map(ind => ind.path);
    this.renderer.renderPaths(populationPaths, 0.25);  // 稍微增加透明度
    
    // 绘制最佳路径（高亮）
    this.renderer.renderBestPath(result.best.path, true);
    
    // 绘制起终点
    const maze = this.renderer.maze;
    if (maze) {
      this.renderer.renderStartEnd(maze);
    }
    
    // 绘制种群信息文本
    this.renderPopulationInfo(result);
    
    // 更新适应度图表
    this.fitnessChart.addPoint(result.generation, result.bestFitness, result.avgFitness);
    this.fitnessChart.render();
  }
  
  private renderPopulationInfo(result: GenerationResult): void {
    const ctx = this.renderer.ctx;
    const offset = this.renderer.getOffset();
    
    // 在迷宫左下角显示种群信息
    ctx.save();
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.fillText(
      `Population: ${result.population.length} paths shown`,
      offset.x,
      offset.y + (this.renderer.maze?.height ?? 0) * this.renderer.cellSize + 25
    );
    ctx.fillText(
      `(Displaying top ${result.population.length} of ${this.config.populationSize})`,
      offset.x,
      offset.y + (this.renderer.maze?.height ?? 0) * this.renderer.cellSize + 40
    );
    ctx.restore();
  }
  
  // 添加config引用
  private config: any;

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

