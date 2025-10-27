// 路径动画器 - 逐步绘制路径
import type { Position } from '../types';

export interface PathDrawState {
  path: Position[];
  currentStep: number;  // 当前绘制到第几步
  isComplete: boolean;
  color: string;
  lineWidth: number;
}

export class PathAnimator {
  pathStates: PathDrawState[] = [];
  stepsPerFrame: number = 2;  // 每帧绘制几步
  ctx: CanvasRenderingContext2D;
  getOffset: () => { x: number; y: number };
  cellSize: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    getOffset: () => { x: number; y: number },
    cellSize: number
  ) {
    this.ctx = ctx;
    this.getOffset = getOffset;
    this.cellSize = cellSize;
  }

  // 添加要绘制的路径
  addPaths(paths: Position[][], colors?: string[], lineWidths?: number[]): void {
    this.pathStates = paths.map((path, idx) => ({
      path,
      currentStep: 0,
      isComplete: false,
      color: colors?.[idx] || 'rgba(255, 255, 255, 0.5)',
      lineWidth: lineWidths?.[idx] || 1.5
    }));
  }

  // 更新并绘制（返回是否全部完成）
  updateAndRender(): boolean {
    let allComplete = true;

    this.pathStates.forEach((state) => {
      if (!state.isComplete) {
        // 增加绘制步数
        state.currentStep = Math.min(
          state.currentStep + this.stepsPerFrame,
          state.path.length
        );

        if (state.currentStep >= state.path.length) {
          state.isComplete = true;
        } else {
          allComplete = false;
        }
      }

      // 绘制当前进度的路径
      this.renderPath(state);
    });

    return allComplete;
  }

  private renderPath(state: PathDrawState): void {
    if (state.currentStep < 2) return;

    const offset = this.getOffset();
    const path = state.path.slice(0, state.currentStep);

    this.ctx.save();
    this.ctx.strokeStyle = state.color;
    this.ctx.lineWidth = state.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // 绘制路径的当前部分
    this.ctx.beginPath();
    path.forEach((pos, i) => {
      const x = offset.x + (pos[1] + 0.5) * this.cellSize;
      const y = offset.y + (pos[0] + 0.5) * this.cellSize;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.stroke();

    // 绘制当前位置的小圆点
    if (state.currentStep < state.path.length) {
      const currentPos = path[path.length - 1];
      const x = offset.x + (currentPos[1] + 0.5) * this.cellSize;
      const y = offset.y + (currentPos[0] + 0.5) * this.cellSize;
      
      this.ctx.fillStyle = state.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  clear(): void {
    this.pathStates = [];
  }

  setSpeed(stepsPerFrame: number): void {
    this.stepsPerFrame = Math.max(1, stepsPerFrame);
  }

  isAnimating(): boolean {
    return this.pathStates.some(state => !state.isComplete);
  }
}

