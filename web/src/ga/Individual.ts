// 个体类
import type { Position, Individual as IIndividual } from '../types';
import { Maze } from '../maze/Maze';

export class Individual implements IIndividual {
  fitness: number = 0;
  reachedEnd: boolean = false;
  maze: Maze;
  maxSteps: number;
  path: Position[];

  constructor(
    maze: Maze,
    path: Position[],
    maxSteps: number = 200
  ) {
    this.maze = maze;
    this.maxSteps = maxSteps;
    this.path = path;
    if (path.length === 0) {
      this.path = this.generateRandomPath();
    }
    this.calculateFitness();
  }

  private generateRandomPath(): Position[] {
    const path: Position[] = [this.maze.start];
    let current = this.maze.start;

    for (let i = 0; i < this.maxSteps; i++) {
      if (this.posEqual(current, this.maze.end)) break;

      const neighbors = this.maze.getNeighbors(current);
      if (neighbors.length === 0) break;

      // 70%朝向终点，30%随机探索
      let next: Position;
      if (Math.random() < 0.7) {
        next = neighbors.reduce((best, n) =>
          this.maze.manhattanDistance(n, this.maze.end) <
          this.maze.manhattanDistance(best, this.maze.end) ? n : best
        );
      } else {
        next = neighbors[Math.floor(Math.random() * neighbors.length)];
      }

      // 避免回头
      if (path.length > 1 && this.posEqual(next, path[path.length - 2]) && neighbors.length > 1) {
        const filtered = neighbors.filter(n => !this.posEqual(n, next));
        if (filtered.length > 0) {
          next = filtered[Math.floor(Math.random() * filtered.length)];
        }
      }

      path.push(next);
      current = next;
    }

    return path;
  }

  calculateFitness(): void {
    if (this.path.length === 0) {
      this.fitness = 0;
      return;
    }

    const current = this.path[this.path.length - 1];
    const distanceToEnd = this.maze.manhattanDistance(current, this.maze.end);
    this.reachedEnd = this.posEqual(current, this.maze.end);

    if (this.reachedEnd) {
      const uniqueSteps = new Set(this.path.map(p => `${p[0]},${p[1]}`)).size;
      this.fitness = 10000 + (this.maxSteps - this.path.length) * 10 + uniqueSteps * 5;
    } else {
      const uniqueRatio = new Set(this.path.map(p => `${p[0]},${p[1]}`)).size / this.path.length;
      this.fitness = 1000 / (1 + distanceToEnd) + 
                     Math.min(this.path.length, this.maxSteps / 2) + 
                     uniqueRatio * 100;
    }
  }

  private posEqual(p1: Position, p2: Position): boolean {
    return p1[0] === p2[0] && p1[1] === p2[1];
  }

  clone(): Individual {
    return new Individual(this.maze, [...this.path], this.maxSteps);
  }
}

