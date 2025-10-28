// 迷宫难度评估系统
import { Maze } from '../maze/Maze';
import { AStar } from '../algorithms/AStar';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert' | 'extreme';

export interface DifficultyMetrics {
  shortestPath: number;      // A*最短路径长度
  deadEnds: number;          // 死胡同数量
  branchingFactor: number;   // 平均分支因子
  openSpaceRatio: number;    // 通路比例
  complexityScore: number;   // 综合复杂度 (0-100)
  level: DifficultyLevel;    // 难度等级
  stars: number;             // 星级 (1-5)
}

export class MazeDifficulty {
  /**
   * 评估迷宫难度
   */
  static evaluate(maze: Maze): DifficultyMetrics {
    // 1. 使用A*计算最短路径
    const shortestPath = AStar.findPath(maze, maze.width * maze.height);
    const shortestPathLength = shortestPath.length;

    // 2. 计算死胡同数量
    const deadEnds = this.countDeadEnds(maze);

    // 3. 计算平均分支因子
    const branchingFactor = this.calculateBranchingFactor(maze);

    // 4. 计算通路比例
    const openSpaceRatio = this.calculateOpenSpaceRatio(maze);

    // 5. 综合复杂度评分
    const complexityScore = this.calculateComplexity(
      shortestPathLength,
      deadEnds,
      branchingFactor,
      openSpaceRatio,
      maze.width * maze.height
    );

    // 6. 确定难度等级
    const { level, stars } = this.getDifficultyLevel(complexityScore, shortestPathLength);

    return {
      shortestPath: shortestPathLength,
      deadEnds,
      branchingFactor,
      openSpaceRatio,
      complexityScore,
      level,
      stars
    };
  }

  /**
   * 计算死胡同数量
   */
  private static countDeadEnds(maze: Maze): number {
    let count = 0;
    
    for (let y = 1; y < maze.height - 1; y++) {
      for (let x = 1; x < maze.width - 1; x++) {
        if (maze.grid[y][x] === 0) {
          const neighbors = maze.getNeighbors([y, x]);
          if (neighbors.length === 1) {
            count++;
          }
        }
      }
    }
    
    return count;
  }

  /**
   * 计算平均分支因子
   */
  private static calculateBranchingFactor(maze: Maze): number {
    let totalNeighbors = 0;
    let validCells = 0;

    for (let y = 1; y < maze.height - 1; y++) {
      for (let x = 1; x < maze.width - 1; x++) {
        if (maze.grid[y][x] === 0) {
          const neighbors = maze.getNeighbors([y, x]);
          totalNeighbors += neighbors.length;
          validCells++;
        }
      }
    }

    return validCells > 0 ? totalNeighbors / validCells : 0;
  }

  /**
   * 计算通路比例
   */
  private static calculateOpenSpaceRatio(maze: Maze): number {
    let openCells = 0;
    const totalCells = maze.width * maze.height;

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        if (maze.grid[y][x] === 0) {
          openCells++;
        }
      }
    }

    return openCells / totalCells;
  }

  /**
   * 计算综合复杂度
   */
  private static calculateComplexity(
    shortestPath: number,
    deadEnds: number,
    branchingFactor: number,
    openSpaceRatio: number,
    totalCells: number
  ): number {
    // 归一化各个因素
    const pathFactor = Math.min(shortestPath / (Math.sqrt(totalCells) * 2), 1) * 30;
    const deadEndFactor = Math.min(deadEnds / (totalCells * 0.1), 1) * 25;
    const branchingFactorScore = Math.min(branchingFactor / 3, 1) * 20;
    const openSpaceScore = (1 - Math.abs(openSpaceRatio - 0.5) * 2) * 25;

    return pathFactor + deadEndFactor + branchingFactorScore + openSpaceScore;
  }

  /**
   * 根据复杂度确定难度等级
   */
  private static getDifficultyLevel(
    complexity: number,
    pathLength: number
  ): { level: DifficultyLevel; stars: number } {
    // 同时考虑复杂度和路径长度
    let level: DifficultyLevel;
    let stars: number;

    if (complexity < 30 || pathLength < 30) {
      level = 'easy';
      stars = 1;
    } else if (complexity < 50 || pathLength < 60) {
      level = 'medium';
      stars = 2;
    } else if (complexity < 70 || pathLength < 100) {
      level = 'hard';
      stars = 3;
    } else if (complexity < 85 || pathLength < 150) {
      level = 'expert';
      stars = 4;
    } else {
      level = 'extreme';
      stars = 5;
    }

    return { level, stars };
  }

  /**
   * 获取难度等级的显示信息
   */
  static getLevelDisplay(level: DifficultyLevel): { color: string; label: string } {
    const displays = {
      easy: { color: '#A3BE8C', label: 'Easy' },
      medium: { color: '#EBCB8B', label: 'Medium' },
      hard: { color: '#D08770', label: 'Hard' },
      expert: { color: '#BF616A', label: 'Expert' },
      extreme: { color: '#B48EAD', label: 'Extreme' }
    };
    return displays[level];
  }

  /**
   * 渲染星级
   */
  static renderStars(stars: number): string {
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  }
}

