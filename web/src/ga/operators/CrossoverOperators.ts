// 交叉算子集合
import { Individual } from '../Individual';
import type { Position } from '../../types';
import { Maze } from '../../maze/Maze';

export type CrossoverMethod = 'single-point' | 'two-point' | 'uniform' | 'order' | 'pmx';

export class CrossoverOperators {
  /**
   * 单点交叉（Single-Point Crossover）
   */
  static singlePoint(
    parent1: Individual,
    parent2: Individual,
    maze: Maze,
    maxSteps: number,
    repairFn: (path: Position[]) => Position[]
  ): [Individual, Individual] {
    const minLen = Math.min(parent1.path.length, parent2.path.length);
    if (minLen <= 1) {
      return [parent1.clone(), parent2.clone()];
    }

    const point = Math.floor(Math.random() * (minLen - 1)) + 1;
    
    const child1Path = [...parent1.path.slice(0, point), ...parent2.path.slice(point)];
    const child2Path = [...parent2.path.slice(0, point), ...parent1.path.slice(point)];

    return [
      new Individual(maze, repairFn(child1Path), maxSteps),
      new Individual(maze, repairFn(child2Path), maxSteps)
    ];
  }

  /**
   * 两点交叉（Two-Point Crossover）
   * 在两个点之间交换基因段
   */
  static twoPoint(
    parent1: Individual,
    parent2: Individual,
    maze: Maze,
    maxSteps: number,
    repairFn: (path: Position[]) => Position[]
  ): [Individual, Individual] {
    const minLen = Math.min(parent1.path.length, parent2.path.length);
    if (minLen <= 2) {
      return [parent1.clone(), parent2.clone()];
    }

    let point1 = Math.floor(Math.random() * (minLen - 1)) + 1;
    let point2 = Math.floor(Math.random() * (minLen - 1)) + 1;
    
    if (point1 > point2) [point1, point2] = [point2, point1];
    if (point1 === point2) point2 = Math.min(point1 + 1, minLen - 1);

    const child1Path = [
      ...parent1.path.slice(0, point1),
      ...parent2.path.slice(point1, point2),
      ...parent1.path.slice(point2)
    ];
    
    const child2Path = [
      ...parent2.path.slice(0, point1),
      ...parent1.path.slice(point1, point2),
      ...parent2.path.slice(point2)
    ];

    return [
      new Individual(maze, repairFn(child1Path), maxSteps),
      new Individual(maze, repairFn(child2Path), maxSteps)
    ];
  }

  /**
   * 均匀交叉（Uniform Crossover）
   * 每个基因位以50%概率来自父代1或父代2
   */
  static uniform(
    parent1: Individual,
    parent2: Individual,
    maze: Maze,
    maxSteps: number,
    repairFn: (path: Position[]) => Position[]
  ): [Individual, Individual] {
    const minLen = Math.min(parent1.path.length, parent2.path.length);
    const maxLen = Math.max(parent1.path.length, parent2.path.length);
    
    const child1Path: Position[] = [];
    const child2Path: Position[] = [];

    for (let i = 0; i < minLen; i++) {
      if (Math.random() < 0.5) {
        child1Path.push(parent1.path[i]);
        child2Path.push(parent2.path[i]);
      } else {
        child1Path.push(parent2.path[i]);
        child2Path.push(parent1.path[i]);
      }
    }

    // 处理长度不同的情况
    if (parent1.path.length > minLen) {
      child1Path.push(...parent1.path.slice(minLen));
    } else if (parent2.path.length > minLen) {
      child2Path.push(...parent2.path.slice(minLen));
    }

    return [
      new Individual(maze, repairFn(child1Path), maxSteps),
      new Individual(maze, repairFn(child2Path), maxSteps)
    ];
  }

  /**
   * 顺序交叉（Order Crossover, OX）
   * 特别适合路径问题，保持相对顺序
   */
  static order(
    parent1: Individual,
    parent2: Individual,
    maze: Maze,
    maxSteps: number,
    repairFn: (path: Position[]) => Position[]
  ): [Individual, Individual] {
    const len1 = parent1.path.length;
    const len2 = parent2.path.length;
    const minLen = Math.min(len1, len2);
    
    if (minLen <= 2) {
      return [parent1.clone(), parent2.clone()];
    }

    // 选择交叉区间
    let point1 = Math.floor(Math.random() * (minLen - 1));
    let point2 = Math.floor(Math.random() * (minLen - 1));
    if (point1 > point2) [point1, point2] = [point2, point1];

    // 创建子代1
    const child1Path: Position[] = new Array(len1);
    const child2Path: Position[] = new Array(len2);

    // 复制交叉区间
    for (let i = point1; i <= point2 && i < minLen; i++) {
      child1Path[i] = parent1.path[i];
      child2Path[i] = parent2.path[i];
    }

    // 填充其余部分（保持parent2的顺序，避免已有的）
    const fillChild = (child: Position[], parent: Individual, otherParent: Individual, len: number) => {
      const usedPositions = new Set(
        child.filter(p => p).map(p => `${p[0]},${p[1]}`)
      );
      
      let childIdx = (point2 + 1) % len;
      let parentIdx = (point2 + 1) % otherParent.path.length;
      
      while (child.some(p => !p)) {
        const pos = otherParent.path[parentIdx];
        const posKey = `${pos[0]},${pos[1]}`;
        
        if (!usedPositions.has(posKey)) {
          child[childIdx] = pos;
          usedPositions.add(posKey);
          childIdx = (childIdx + 1) % len;
        }
        
        parentIdx = (parentIdx + 1) % otherParent.path.length;
        
        // 防止无限循环
        if (parentIdx === (point2 + 1) % otherParent.path.length && child.some(p => !p)) {
          break;
        }
      }
      
      // 填充空位
      for (let i = 0; i < len; i++) {
        if (!child[i]) {
          child[i] = parent.path[i] || maze.start;
        }
      }
    };

    fillChild(child1Path, parent1, parent2, len1);
    fillChild(child2Path, parent2, parent1, len2);

    return [
      new Individual(maze, repairFn(child1Path.filter(p => p)), maxSteps),
      new Individual(maze, repairFn(child2Path.filter(p => p)), maxSteps)
    ];
  }

  /**
   * 部分匹配交叉（Partially Mapped Crossover, PMX）
   * 建立映射关系，适合排列问题
   */
  static pmx(
    parent1: Individual,
    parent2: Individual,
    maze: Maze,
    maxSteps: number,
    repairFn: (path: Position[]) => Position[]
  ): [Individual, Individual] {
    const minLen = Math.min(parent1.path.length, parent2.path.length);
    
    if (minLen <= 2) {
      return [parent1.clone(), parent2.clone()];
    }

    let point1 = Math.floor(Math.random() * (minLen - 1));
    let point2 = Math.floor(Math.random() * (minLen - 1));
    if (point1 > point2) [point1, point2] = [point2, point1];

    const child1Path = [...parent1.path];
    const child2Path = [...parent2.path];

    // 创建映射
    const mapping1 = new Map<string, Position>();
    const mapping2 = new Map<string, Position>();

    for (let i = point1; i <= point2 && i < minLen; i++) {
      const pos1 = parent1.path[i];
      const pos2 = parent2.path[i];
      const key1 = `${pos1[0]},${pos1[1]}`;
      const key2 = `${pos2[0]},${pos2[1]}`;
      
      mapping1.set(key2, pos1);
      mapping2.set(key1, pos2);
      
      child1Path[i] = pos2;
      child2Path[i] = pos1;
    }

    // 应用映射到其余位置
    for (let i = 0; i < minLen; i++) {
      if (i >= point1 && i <= point2) continue;
      
      let pos = child1Path[i];
      let key = `${pos[0]},${pos[1]}`;
      while (mapping1.has(key)) {
        pos = mapping1.get(key)!;
        key = `${pos[0]},${pos[1]}`;
      }
      child1Path[i] = pos;
      
      pos = child2Path[i];
      key = `${pos[0]},${pos[1]}`;
      while (mapping2.has(key)) {
        pos = mapping2.get(key)!;
        key = `${pos[0]},${pos[1]}`;
      }
      child2Path[i] = pos;
    }

    return [
      new Individual(maze, repairFn(child1Path), maxSteps),
      new Individual(maze, repairFn(child2Path), maxSteps)
    ];
  }

  /**
   * 根据方法名交叉
   */
  static crossover(
    method: CrossoverMethod,
    parent1: Individual,
    parent2: Individual,
    maze: Maze,
    maxSteps: number,
    repairFn: (path: Position[]) => Position[]
  ): [Individual, Individual] {
    switch (method) {
      case 'single-point':
        return this.singlePoint(parent1, parent2, maze, maxSteps, repairFn);
      case 'two-point':
        return this.twoPoint(parent1, parent2, maze, maxSteps, repairFn);
      case 'uniform':
        return this.uniform(parent1, parent2, maze, maxSteps, repairFn);
      case 'order':
        return this.order(parent1, parent2, maze, maxSteps, repairFn);
      case 'pmx':
        return this.pmx(parent1, parent2, maze, maxSteps, repairFn);
      default:
        return this.singlePoint(parent1, parent2, maze, maxSteps, repairFn);
    }
  }
}

