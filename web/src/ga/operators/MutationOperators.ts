// 变异算子集合
import { Individual } from '../Individual';
import type { Position } from '../../types';
import { Maze } from '../../maze/Maze';

export type MutationMethod = 'random' | 'guided' | 'inversion' | 'insertion' | 'local-search';

export class MutationOperators {
  /**
   * 随机变异（Random Mutation）
   * 从某个点开始重新随机生成路径
   */
  static random(individual: Individual, maze: Maze, maxSteps: number): Individual {
    const path = [...individual.path];
    if (path.length <= 2) return individual.clone();

    const point = Math.floor(Math.random() * (path.length - 1)) + 1;
    const newPath = path.slice(0, point);
    let current = path[point - 1];

    const steps = Math.min(20, maxSteps - newPath.length);
    for (let i = 0; i < steps; i++) {
      if (this.posEqual(current, maze.end)) break;

      const neighbors = maze.getNeighbors(current);
      if (neighbors.length === 0) break;

      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      newPath.push(next);
      current = next;
    }

    return new Individual(maze, newPath, maxSteps);
  }

  /**
   * 导向变异（Guided Mutation）
   * 朝着终点方向进行变异，更有启发性
   */
  static guided(individual: Individual, maze: Maze, maxSteps: number): Individual {
    const path = [...individual.path];
    if (path.length <= 2) return individual.clone();

    const point = Math.floor(Math.random() * (path.length - 1)) + 1;
    const newPath = path.slice(0, point);
    let current = path[point - 1];

    const steps = Math.min(30, maxSteps - newPath.length);
    for (let i = 0; i < steps; i++) {
      if (this.posEqual(current, maze.end)) break;

      const neighbors = maze.getNeighbors(current);
      if (neighbors.length === 0) break;

      // 80%朝向终点，20%随机探索
      let next: Position;
      if (Math.random() < 0.8) {
        next = neighbors.reduce((best, n) =>
          maze.manhattanDistance(n, maze.end) < maze.manhattanDistance(best, maze.end) ? n : best
        );
      } else {
        next = neighbors[Math.floor(Math.random() * neighbors.length)];
      }

      // 避免回头
      if (newPath.length > 1 && this.posEqual(next, newPath[newPath.length - 2]) && neighbors.length > 1) {
        const filtered = neighbors.filter(n => !this.posEqual(n, next));
        if (filtered.length > 0) {
          next = filtered[Math.floor(Math.random() * filtered.length)];
        }
      }

      newPath.push(next);
      current = next;
    }

    return new Individual(maze, newPath, maxSteps);
  }

  /**
   * 逆序变异（Inversion Mutation）
   * 随机选择一段路径并翻转
   */
  static inversion(individual: Individual, maze: Maze, maxSteps: number): Individual {
    const path = [...individual.path];
    if (path.length <= 3) return individual.clone();

    let point1 = Math.floor(Math.random() * (path.length - 1));
    let point2 = Math.floor(Math.random() * (path.length - 1));
    
    if (point1 > point2) [point1, point2] = [point2, point1];
    if (point2 - point1 < 2) return individual.clone();

    // 翻转区间
    const segment = path.slice(point1, point2 + 1).reverse();
    const newPath = [...path.slice(0, point1), ...segment, ...path.slice(point2 + 1)];

    // 修复不连续的路径
    return new Individual(maze, this.repairPath(newPath, maze), maxSteps);
  }

  /**
   * 插入变异（Insertion Mutation）
   * 删除路径中的环路，优化路径
   */
  static insertion(individual: Individual, maze: Maze, maxSteps: number): Individual {
    const path = [...individual.path];
    if (path.length <= 3) return individual.clone();

    // 检测环路：找到重复访问的位置
    const visited = new Map<string, number>();
    const loops: [number, number][] = [];

    path.forEach((pos, idx) => {
      const key = `${pos[0]},${pos[1]}`;
      if (visited.has(key)) {
        const startIdx = visited.get(key)!;
        loops.push([startIdx, idx]);
      }
      visited.set(key, idx);
    });

    if (loops.length === 0) {
      // 没有环路，执行随机删除并插入
      return this.random(individual, maze, maxSteps);
    }

    // 删除第一个环路
    const [start, end] = loops[0];
    const newPath = [...path.slice(0, start + 1), ...path.slice(end + 1)];

    return new Individual(maze, newPath.length > 0 ? newPath : [maze.start], maxSteps);
  }

  /**
   * 局部搜索变异（Local Search Mutation）
   * 应用2-opt优化
   */
  static localSearch(individual: Individual, maze: Maze, maxSteps: number): Individual {
    let path = [...individual.path];
    if (path.length <= 3) return individual.clone();

    let improved = true;
    let iterations = 0;
    const maxIterations = 5;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      // 2-opt: 尝试交换两条边
      for (let i = 0; i < path.length - 2; i++) {
        for (let j = i + 2; j < path.length - 1; j++) {
          // 尝试翻转i+1到j之间的路径
          const newPath = [
            ...path.slice(0, i + 1),
            ...path.slice(i + 1, j + 1).reverse(),
            ...path.slice(j + 1)
          ];

          // 检查新路径是否更短且有效
          if (this.isValidPath(newPath, maze) && newPath.length <= path.length) {
            const newPathLen = this.calculatePathLength(newPath, maze);
            const oldPathLen = this.calculatePathLength(path, maze);
            
            if (newPathLen < oldPathLen) {
              path = newPath;
              improved = true;
            }
          }
        }
      }
    }

    return new Individual(maze, path, maxSteps);
  }

  /**
   * 根据方法名变异
   */
  static mutate(
    method: MutationMethod,
    individual: Individual,
    maze: Maze,
    maxSteps: number
  ): Individual {
    switch (method) {
      case 'random':
        return this.random(individual, maze, maxSteps);
      case 'guided':
        return this.guided(individual, maze, maxSteps);
      case 'inversion':
        return this.inversion(individual, maze, maxSteps);
      case 'insertion':
        return this.insertion(individual, maze, maxSteps);
      case 'local-search':
        return this.localSearch(individual, maze, maxSteps);
      default:
        return this.random(individual, maze, maxSteps);
    }
  }

  // 辅助方法
  private static posEqual(p1: Position, p2: Position): boolean {
    return p1[0] === p2[0] && p1[1] === p2[1];
  }

  private static repairPath(path: Position[], maze: Maze): Position[] {
    if (path.length === 0) return [maze.start];
    
    const repaired: Position[] = [path[0]];
    
    for (let i = 1; i < path.length; i++) {
      const current = repaired[repaired.length - 1];
      const next = path[i];
      
      if (maze.manhattanDistance(current, next) === 1 && maze.isValid(next)) {
        repaired.push(next);
      } else {
        const neighbors = maze.getNeighbors(current);
        if (neighbors.length > 0) {
          repaired.push(neighbors[Math.floor(Math.random() * neighbors.length)]);
        }
      }
    }
    
    return repaired;
  }

  private static isValidPath(path: Position[], maze: Maze): boolean {
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      if (!maze.isValid(current) || !maze.isValid(next)) {
        return false;
      }
      
      if (maze.manhattanDistance(current, next) !== 1) {
        return false;
      }
    }
    return true;
  }

  private static calculatePathLength(path: Position[], maze: Maze): number {
    let length = 0;
    for (let i = 0; i < path.length - 1; i++) {
      length += maze.manhattanDistance(path[i], path[i + 1]);
    }
    return length;
  }
}

