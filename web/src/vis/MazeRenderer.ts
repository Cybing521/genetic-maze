// 迷宫渲染器 - 高性能Canvas渲染
import { Maze } from '../maze/Maze';
import type { Position } from '../types';

export class MazeRenderer {
  offscreenCanvas: HTMLCanvasElement;
  offscreenCtx: CanvasRenderingContext2D;
  cellSize: number = 20;
  mazeCache: ImageData | null = null;
  maze: Maze | null = null;

  // Nord主题配色
  private readonly COLORS = {
    background: '#2E3440',
    wall: '#4C566A',
    path: '#ECEFF4',
    start: '#A3BE8C',
    end: '#BF616A',
    pathGlow: '#88C0D0',
    grid: '#3B4252'
  };

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
  }

  setMaze(maze: Maze): void {
    this.maze = maze;
    
    // 计算最佳单元格大小 - 考虑整个canvas区域
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    // 留出边距
    const padding = 100;
    const availableWidth = canvasWidth - padding * 2;
    const availableHeight = canvasHeight - padding * 2;
    
    this.cellSize = Math.min(
      Math.floor(availableWidth / maze.width),
      Math.floor(availableHeight / maze.height),
      25  // 最大单元格大小
    );

    // 调整离屏canvas大小
    const mazeWidth = maze.width * this.cellSize;
    const mazeHeight = maze.height * this.cellSize;
    
    this.offscreenCanvas.width = mazeWidth;
    this.offscreenCanvas.height = mazeHeight;

    // 清除旧缓存
    this.mazeCache = null;
    
    // 缓存新迷宫
    this.cacheMaze(maze);
  }

  private cacheMaze(maze: Maze): void {
    const ctx = this.offscreenCtx;
    
    // 绘制迷宫
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        ctx.fillStyle = maze.grid[y][x] === 1 ? this.COLORS.wall : this.COLORS.path;
        ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        
        // 网格线
        if (maze.grid[y][x] === 0) {
          ctx.strokeStyle = this.COLORS.grid;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }

    this.mazeCache = ctx.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
  }

  clear(): void {
    this.ctx.fillStyle = this.COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderMaze(): void {
    if (this.mazeCache && this.maze) {
      // 居中显示迷宫
      const x = (this.canvas.width - this.maze.width * this.cellSize) / 2;
      const y = 80;  // 顶部留空间给HUD
      this.ctx.putImageData(this.mazeCache, x, y);
    }
  }
  
  getOffset(): { x: number; y: number } {
    if (!this.maze) return { x: 0, y: 0 };
    return {
      x: (this.canvas.width - this.maze.width * this.cellSize) / 2,
      y: 80
    };
  }

  renderStartEnd(maze: Maze): void {
    const [sy, sx] = maze.start;
    const [ey, ex] = maze.end;
    const offset = this.getOffset();

    this.ctx.save();
    
    // 起点
    this.ctx.fillStyle = this.COLORS.start;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = this.COLORS.start;
    this.ctx.beginPath();
    this.ctx.arc(
      offset.x + (sx + 0.5) * this.cellSize,
      offset.y + (sy + 0.5) * this.cellSize,
      this.cellSize * 0.4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // 终点
    this.ctx.fillStyle = this.COLORS.end;
    this.ctx.shadowColor = this.COLORS.end;
    const rectSize = this.cellSize * 0.6;
    this.ctx.fillRect(
      offset.x + (ex + 0.5) * this.cellSize - rectSize / 2,
      offset.y + (ey + 0.5) * this.cellSize - rectSize / 2,
      rectSize,
      rectSize
    );

    this.ctx.restore();
  }

  renderPaths(paths: Position[][], alpha: number = 0.4): void {
    const offset = this.getOffset();
    
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.globalCompositeOperation = 'lighter';

    paths.forEach((path, idx) => {
      if (path.length < 2) return;
      
      const hue = (idx * 40) % 360;
      this.ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.beginPath();
      path.forEach((pos, i) => {
        const x = offset.x + (pos[1] + 0.5) * this.cellSize;
        const y = offset.y + (pos[0] + 0.5) * this.cellSize;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  renderBestPath(path: Position[], _animate: boolean = true): void {
    if (path.length < 2) return;

    const offset = this.getOffset();
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    
    // 绘制发光路径
    for (let i = 0; i < path.length - 1; i++) {
      const t = i / (path.length - 1);
      const color = this.interpolatePathColor(t);
      
      const x1 = offset.x + (path[i][1] + 0.5) * this.cellSize;
      const y1 = offset.y + (path[i][0] + 0.5) * this.cellSize;
      const x2 = offset.x + (path[i + 1][1] + 0.5) * this.cellSize;
      const y2 = offset.y + (path[i + 1][0] + 0.5) * this.cellSize;

      // 外层光晕
      this.ctx.strokeStyle = color;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = color;
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = 'round';
      
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();

      // 内层亮线
      this.ctx.shadowBlur = 5;
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private interpolatePathColor(t: number): string {
    const r = Math.round(136 + (191 - 136) * t);
    const g = Math.round(192 + (97 - 192) * t);
    const b = Math.round(208 + (106 - 208) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

