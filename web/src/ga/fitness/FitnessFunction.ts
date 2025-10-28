// 适应度函数系统
import type { Position } from '../../types';
import { Maze } from '../../maze/Maze';

export interface FitnessWeights {
  reachGoal: number;      // w1: 到达奖励
  pathLength: number;     // w2: 路径长度倒数
  uniqueness: number;     // w3: 唯一步数
  smoothness: number;     // w4: 平滑度
  efficiency: number;     // w5: 探索效率
}

export class FitnessFunction {
  /**
   * 多目标适应度计算
   */
  static multiObjective(
    path: Position[],
    maze: Maze,
    maxSteps: number,
    weights: FitnessWeights,
    generation?: number
  ): { fitness: number; reachedEnd: boolean; components: any } {
    if (path.length === 0) {
      return { fitness: 0, reachedEnd: false, components: {} };
    }

    const current = path[path.length - 1];
    const distanceToEnd = maze.manhattanDistance(current, maze.end);
    const reachedEnd = this.posEqual(current, maze.end);

    // 动态权重：基于代数调整
    const dynamicWeights = this.adjustWeights(weights, generation);

    // 计算各个分量
    const components = {
      reachGoal: this.calculateReachGoal(reachedEnd, path.length, maxSteps),
      pathLength: this.calculatePathLength(path.length, maxSteps),
      uniqueness: this.calculateUniqueness(path),
      smoothness: this.calculateSmoothness(path, maze),
      efficiency: this.calculateEfficiency(path, maze, distanceToEnd)
    };

    // 加权求和
    const fitness = 
      dynamicWeights.reachGoal * components.reachGoal +
      dynamicWeights.pathLength * components.pathLength +
      dynamicWeights.uniqueness * components.uniqueness +
      dynamicWeights.smoothness * components.smoothness +
      dynamicWeights.efficiency * components.efficiency;

    return { fitness, reachedEnd, components };
  }

  /**
   * 到达目标奖励
   */
  private static calculateReachGoal(reachedEnd: boolean, pathLength: number, maxSteps: number): number {
    if (reachedEnd) {
      // 找到解：奖励基础分 + 路径越短奖励越高
      return 10000 + (maxSteps - pathLength) * 20;
    }
    return 0;
  }

  /**
   * 路径长度评分
   */
  private static calculatePathLength(pathLength: number, maxSteps: number): number {
    // 鼓励适中的路径长度
    const ratio = pathLength / maxSteps;
    if (ratio < 0.3) {
      // 太短，可能没有充分探索
      return ratio * 100;
    } else if (ratio > 0.8) {
      // 太长，惩罚
      return (1 - ratio) * 100;
    } else {
      // 适中
      return 50 + (0.5 - Math.abs(ratio - 0.5)) * 100;
    }
  }

  /**
   * 唯一性评分：惩罚重复访问
   */
  private static calculateUniqueness(path: Position[]): number {
    const uniquePositions = new Set(path.map(p => `${p[0]},${p[1]}`)).size;
    const uniquenessRatio = uniquePositions / path.length;
    return uniquenessRatio * 200; // 完全不重复得200分
  }

  /**
   * 平滑度评分：奖励直线路径，惩罚频繁转向
   */
  private static calculateSmoothness(path: Position[], maze: Maze): number {
    if (path.length < 3) return 0;

    let directionChanges = 0;
    let previousDirection: string | null = null;

    for (let i = 1; i < path.length; i++) {
      const dy = path[i][0] - path[i - 1][0];
      const dx = path[i][1] - path[i - 1][1];
      const direction = `${dy},${dx}`;

      if (previousDirection && direction !== previousDirection) {
        directionChanges++;
      }
      previousDirection = direction;
    }

    // 转向次数越少越好
    const smoothness = Math.max(0, 100 - directionChanges * 2);
    return smoothness;
  }

  /**
   * 探索效率：接近终点的程度
   */
  private static calculateEfficiency(path: Position[], maze: Maze, distanceToEnd: number): number {
    const startDistance = maze.manhattanDistance(maze.start, maze.end);
    
    // 距离减少的比例
    const progress = (startDistance - distanceToEnd) / startDistance;
    
    // 额外奖励：检测是否有朝向终点的总体趋势
    let approachingEnd = 0;
    const sampleSize = Math.min(10, path.length);
    for (let i = path.length - sampleSize; i < path.length - 1; i++) {
      if (i < 0) continue;
      const dist1 = maze.manhattanDistance(path[i], maze.end);
      const dist2 = maze.manhattanDistance(path[i + 1], maze.end);
      if (dist2 < dist1) approachingEnd++;
    }

    const trendBonus = (approachingEnd / sampleSize) * 50;

    return progress * 500 + trendBonus;
  }

  /**
   * 动态权重调整：基于进化代数
   */
  private static adjustWeights(weights: FitnessWeights, generation?: number): FitnessWeights {
    if (generation === undefined) return weights;

    // 早期：重视探索效率和唯一性
    // 后期：重视到达目标和路径长度/平滑度
    const progress = Math.min(generation / 200, 1); // 200代作为过渡期

    return {
      reachGoal: weights.reachGoal,
      pathLength: weights.pathLength * (0.5 + progress * 0.5), // 后期更重要
      uniqueness: weights.uniqueness * (1 - progress * 0.3), // 早期更重要
      smoothness: weights.smoothness * (0.5 + progress * 0.5), // 后期更重要
      efficiency: weights.efficiency * (1 - progress * 0.4) // 早期更重要
    };
  }

  /**
   * 检测环路
   */
  static detectLoops(path: Position[]): number {
    const visited = new Map<string, number>();
    let loopCount = 0;

    path.forEach((pos, idx) => {
      const key = `${pos[0]},${pos[1]}`;
      if (visited.has(key)) {
        loopCount++;
      }
      visited.set(key, idx);
    });

    return loopCount;
  }

  /**
   * 检测回头（相邻三个点形成折返）
   */
  static detectBacktracking(path: Position[]): number {
    if (path.length < 3) return 0;

    let backtrackCount = 0;
    for (let i = 0; i < path.length - 2; i++) {
      if (this.posEqual(path[i], path[i + 2])) {
        backtrackCount++;
      }
    }

    return backtrackCount;
  }

  private static posEqual(p1: Position, p2: Position): boolean {
    return p1[0] === p2[0] && p1[1] === p2[1];
  }
}

/**
 * 预设的权重配置
 */
export const FITNESS_PRESETS = {
  balanced: {
    reachGoal: 1.0,
    pathLength: 0.3,
    uniqueness: 0.2,
    smoothness: 0.15,
    efficiency: 0.35
  },
  qualityFocused: {
    reachGoal: 1.0,
    pathLength: 0.5,
    uniqueness: 0.1,
    smoothness: 0.4,
    efficiency: 0.2
  },
  explorationFocused: {
    reachGoal: 1.0,
    pathLength: 0.1,
    uniqueness: 0.4,
    smoothness: 0.1,
    efficiency: 0.5
  }
};

