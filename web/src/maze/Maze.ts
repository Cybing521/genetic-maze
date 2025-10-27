// 迷宫类
import type { MazeData, Position } from '../types';

export class Maze {
  grid: number[][];
  start: Position;
  end: Position;
  width: number;
  height: number;

  constructor(
    width: number,
    height: number
  ) {
    this.width = width;
    this.height = height;
    this.grid = Array(height).fill(0).map(() => Array(width).fill(1));
    this.start = [1, 1];
    this.end = [height - 2, width - 2];
  }

  static fromJSON(data: MazeData): Maze {
    const maze = new Maze(data.width, data.height);
    maze.grid = data.grid;
    maze.start = data.start;
    maze.end = data.end;
    return maze;
  }

  generate(complexity: number = 0.85, density: number = 0.85, seed?: number): void {
    // 初始化
    this.grid = Array(this.height).fill(0).map(() => Array(this.width).fill(0));
    
    // 边界
    for (let i = 0; i < this.width; i++) {
      this.grid[0][i] = 1;
      this.grid[this.height - 1][i] = 1;
    }
    for (let i = 0; i < this.height; i++) {
      this.grid[i][0] = 1;
      this.grid[i][this.width - 1] = 1;
    }

    // 随机生成墙壁
    const rng = seed !== undefined ? this.seededRandom(seed) : Math.random;
    const complexityVal = Math.floor(complexity * 5 * (this.height + this.width));
    const densityVal = Math.floor(density * (this.height / 2) * (this.width / 2));

    for (let i = 0; i < densityVal; i++) {
      let x = Math.floor(rng() * (this.width / 2)) * 2;
      let y = Math.floor(rng() * (this.height / 2)) * 2;
      this.grid[y][x] = 1;

      for (let j = 0; j < complexityVal; j++) {
        const neighbors: Position[] = [];
        if (x > 1) neighbors.push([y, x - 2]);
        if (x < this.width - 2) neighbors.push([y, x + 2]);
        if (y > 1) neighbors.push([y - 2, x]);
        if (y < this.height - 2) neighbors.push([y + 2, x]);

        if (neighbors.length > 0) {
          const [ny, nx] = neighbors[Math.floor(rng() * neighbors.length)];
          if (this.grid[ny][nx] === 0) {
            this.grid[ny][nx] = 1;
            this.grid[y + Math.floor((ny - y) / 2)][x + Math.floor((nx - x) / 2)] = 1;
            x = nx;
            y = ny;
          }
        }
      }
    }

    // 确保起点和终点可通行
    this.grid[this.start[0]][this.start[1]] = 0;
    this.grid[this.end[0]][this.end[1]] = 0;
  }

  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  isValid(pos: Position): boolean {
    const [y, x] = pos;
    return y >= 0 && y < this.height && x >= 0 && x < this.width && this.grid[y][x] === 0;
  }

  getNeighbors(pos: Position): Position[] {
    const [y, x] = pos;
    const neighbors: Position[] = [
      [y - 1, x],
      [y + 1, x],
      [y, x - 1],
      [y, x + 1]
    ];
    return neighbors.filter(n => this.isValid(n));
  }

  manhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
  }

  toJSON(): MazeData {
    return {
      width: this.width,
      height: this.height,
      grid: this.grid,
      start: this.start,
      end: this.end
    };
  }
}

