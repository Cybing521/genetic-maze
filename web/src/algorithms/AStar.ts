// A* 寻路算法
import type { Position } from '../types';
import { Maze } from '../maze/Maze';

interface AStarNode {
  position: Position;
  g: number; // 从起点到当前点的实际代价
  h: number; // 从当前点到终点的启发式估计
  f: number; // f = g + h
  parent: AStarNode | null;
}

export class AStar {
  /**
   * A*算法找到最优路径
   * @returns 找到的路径，如果无解返回空数组
   */
  static findPath(maze: Maze, maxSteps: number = 1000): Position[] {
    const start = maze.start;
    const goal = maze.end;

    const openSet: AStarNode[] = [];
    const closedSet = new Set<string>();

    const startNode: AStarNode = {
      position: start,
      g: 0,
      h: maze.manhattanDistance(start, goal),
      f: maze.manhattanDistance(start, goal),
      parent: null
    };

    openSet.push(startNode);
    const positionToNode = new Map<string, AStarNode>();
    positionToNode.set(this.posKey(start), startNode);

    let iterations = 0;

    while (openSet.length > 0 && iterations < maxSteps) {
      iterations++;

      // 找到f值最小的节点
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;

      // 找到目标
      if (this.posEqual(current.position, goal)) {
        return this.reconstructPath(current);
      }

      closedSet.add(this.posKey(current.position));

      // 检查邻居
      const neighbors = maze.getNeighbors(current.position);

      for (const neighbor of neighbors) {
        const neighborKey = this.posKey(neighbor);

        if (closedSet.has(neighborKey)) {
          continue;
        }

        const tentativeG = current.g + 1;

        let neighborNode = positionToNode.get(neighborKey);

        if (!neighborNode) {
          // 新节点
          neighborNode = {
            position: neighbor,
            g: tentativeG,
            h: maze.manhattanDistance(neighbor, goal),
            f: tentativeG + maze.manhattanDistance(neighbor, goal),
            parent: current
          };
          openSet.push(neighborNode);
          positionToNode.set(neighborKey, neighborNode);
        } else if (tentativeG < neighborNode.g) {
          // 找到更好的路径
          neighborNode.g = tentativeG;
          neighborNode.f = tentativeG + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    // 没有找到路径
    return [];
  }

  /**
   * 生成带噪声的A*路径（用于GA初始化）
   * @param noise 噪声级别 0-1，0=纯A*，1=完全随机
   */
  static findPathWithNoise(maze: Maze, noise: number = 0.2, maxSteps: number = 1000): Position[] {
    if (noise === 0) {
      return this.findPath(maze, maxSteps);
    }

    const start = maze.start;
    const goal = maze.end;
    const path: Position[] = [start];
    let current = start;
    let steps = 0;

    while (!this.posEqual(current, goal) && steps < maxSteps) {
      steps++;
      const neighbors = maze.getNeighbors(current);
      
      if (neighbors.length === 0) break;

      let next: Position;

      // 以(1-noise)的概率选择最优方向，noise的概率随机
      if (Math.random() > noise) {
        // 选择距离终点最近的邻居
        next = neighbors.reduce((best, n) =>
          maze.manhattanDistance(n, goal) < maze.manhattanDistance(best, goal) ? n : best
        );
      } else {
        // 随机选择
        next = neighbors[Math.floor(Math.random() * neighbors.length)];
      }

      // 避免立即回头
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

  /**
   * 重建路径
   */
  private static reconstructPath(node: AStarNode): Position[] {
    const path: Position[] = [];
    let current: AStarNode | null = node;

    while (current !== null) {
      path.unshift(current.position);
      current = current.parent;
    }

    return path;
  }

  private static posKey(pos: Position): string {
    return `${pos[0]},${pos[1]}`;
  }

  private static posEqual(p1: Position, p2: Position): boolean {
    return p1[0] === p2[0] && p1[1] === p2[1];
  }
}

