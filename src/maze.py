"""
迷宫模块 - 用于生成和表示迷宫
"""
import random
import numpy as np
from typing import Tuple, List


class Maze:
    """迷宫类，用于表示和操作迷宫"""
    
    def __init__(self, width: int, height: int):
        """
        初始化迷宫
        
        Args:
            width: 迷宫宽度
            height: 迷宫高度
        """
        self.width = width
        self.height = height
        self.grid = np.ones((height, width), dtype=int)  # 1表示墙，0表示路
        self.start = (1, 1)  # 起点
        self.end = (height - 2, width - 2)  # 终点
        
    def generate_maze(self, complexity: float = 0.75, density: float = 0.75):
        """
        使用随机算法生成迷宫
        
        Args:
            complexity: 迷宫复杂度 (0-1)
            density: 迷宫密度 (0-1)
        """
        # 创建边界
        self.grid = np.zeros((self.height, self.width), dtype=int)
        self.grid[0, :] = self.grid[-1, :] = 1
        self.grid[:, 0] = self.grid[:, -1] = 1
        
        # 生成内部墙壁
        complexity = int(complexity * (5 * (self.height + self.width)))
        density = int(density * ((self.height // 2) * (self.width // 2)))
        
        for _ in range(density):
            x = random.randint(0, self.width // 2) * 2
            y = random.randint(0, self.height // 2) * 2
            self.grid[y, x] = 1
            
            for _ in range(complexity):
                neighbours = []
                if x > 1:
                    neighbours.append((y, x - 2))
                if x < self.width - 2:
                    neighbours.append((y, x + 2))
                if y > 1:
                    neighbours.append((y - 2, x))
                if y < self.height - 2:
                    neighbours.append((y + 2, x))
                    
                if neighbours:
                    y_, x_ = neighbours[random.randint(0, len(neighbours) - 1)]
                    if self.grid[y_, x_] == 0:
                        self.grid[y_, x_] = 1
                        self.grid[y_ + (y - y_) // 2, x_ + (x - x_) // 2] = 1
                        x, y = x_, y_
        
        # 确保起点和终点是通路
        self.grid[self.start[0], self.start[1]] = 0
        self.grid[self.end[0], self.end[1]] = 0
        
    def is_valid_position(self, position: Tuple[int, int]) -> bool:
        """
        检查位置是否有效（在边界内且不是墙）
        
        Args:
            position: (y, x) 坐标
            
        Returns:
            是否有效
        """
        y, x = position
        if 0 <= y < self.height and 0 <= x < self.width:
            return self.grid[y, x] == 0
        return False
    
    def get_valid_neighbors(self, position: Tuple[int, int]) -> List[Tuple[int, int]]:
        """
        获取位置的所有有效邻居
        
        Args:
            position: (y, x) 坐标
            
        Returns:
            有效邻居列表
        """
        y, x = position
        neighbors = [
            (y - 1, x),  # 上
            (y + 1, x),  # 下
            (y, x - 1),  # 左
            (y, x + 1),  # 右
        ]
        return [n for n in neighbors if self.is_valid_position(n)]
    
    def calculate_distance(self, pos1: Tuple[int, int], pos2: Tuple[int, int]) -> float:
        """
        计算两点之间的曼哈顿距离
        
        Args:
            pos1: 第一个位置
            pos2: 第二个位置
            
        Returns:
            曼哈顿距离
        """
        return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])
    
    def __str__(self) -> str:
        """返回迷宫的字符串表示"""
        result = []
        for y in range(self.height):
            row = []
            for x in range(self.width):
                if (y, x) == self.start:
                    row.append('S')
                elif (y, x) == self.end:
                    row.append('E')
                elif self.grid[y, x] == 1:
                    row.append('█')
                else:
                    row.append(' ')
            result.append(''.join(row))
        return '\n'.join(result)

