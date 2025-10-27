"""
可视化模块 - 用于可视化迷宫和路径
"""
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.animation import FuncAnimation
import numpy as np
from typing import List, Tuple
from maze import Maze
from genetic_algorithm import Individual


class MazeVisualizer:
    """迷宫可视化器"""
    
    def __init__(self, maze: Maze):
        """
        初始化可视化器
        
        Args:
            maze: 迷宫对象
        """
        self.maze = maze
        
    def plot_maze(self, path: List[Tuple[int, int]] = None, title: str = "迷宫", 
                  save_path: str = None):
        """
        绘制迷宫和路径
        
        Args:
            path: 路径列表
            title: 图表标题
            save_path: 保存路径（如果提供）
        """
        fig, ax = plt.subplots(figsize=(12, 12))
        
        # 绘制迷宫
        ax.imshow(self.maze.grid, cmap='binary', interpolation='nearest')
        
        # 绘制起点和终点
        start_y, start_x = self.maze.start
        end_y, end_x = self.maze.end
        
        ax.plot(start_x, start_y, 'go', markersize=15, label='起点')
        ax.plot(end_x, end_y, 'ro', markersize=15, label='终点')
        
        # 绘制路径
        if path:
            path_array = np.array(path)
            ax.plot(path_array[:, 1], path_array[:, 0], 'b-', linewidth=2, 
                   alpha=0.6, label=f'路径 (长度: {len(path)})')
            
            # 标记路径上的点
            ax.scatter(path_array[:, 1], path_array[:, 0], c='blue', 
                      s=20, alpha=0.3)
        
        ax.set_title(title, fontsize=16, fontproperties='SimHei')
        ax.legend(prop={'family': 'SimHei'})
        ax.axis('off')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"图像已保存到: {save_path}")
        
        plt.show()
        
    def plot_fitness_history(self, fitness_history: List[dict], save_path: str = None):
        """
        绘制适应度历史
        
        Args:
            fitness_history: 适应度历史记录
            save_path: 保存路径（如果提供）
        """
        if not fitness_history:
            return
            
        generations = [h['generation'] for h in fitness_history]
        best_fitness = [h['best_fitness'] for h in fitness_history]
        avg_fitness = [h['avg_fitness'] for h in fitness_history]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        ax.plot(generations, best_fitness, 'b-', linewidth=2, label='最佳适应度')
        ax.plot(generations, avg_fitness, 'r--', linewidth=2, label='平均适应度')
        
        ax.set_xlabel('代数', fontsize=12, fontproperties='SimHei')
        ax.set_ylabel('适应度', fontsize=12, fontproperties='SimHei')
        ax.set_title('遗传算法适应度演化', fontsize=14, fontproperties='SimHei')
        ax.legend(prop={'family': 'SimHei'})
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"图像已保存到: {save_path}")
            
        plt.show()
        
    def create_animation(self, path: List[Tuple[int, int]], save_path: str = None):
        """
        创建路径动画
        
        Args:
            path: 路径列表
            save_path: 保存路径（如果提供）
        """
        fig, ax = plt.subplots(figsize=(12, 12))
        
        # 绘制迷宫
        ax.imshow(self.maze.grid, cmap='binary', interpolation='nearest')
        
        # 绘制起点和终点
        start_y, start_x = self.maze.start
        end_y, end_x = self.maze.end
        
        ax.plot(start_x, start_y, 'go', markersize=15, label='起点')
        ax.plot(end_x, end_y, 'ro', markersize=15, label='终点')
        
        # 初始化路径线
        line, = ax.plot([], [], 'b-', linewidth=2, alpha=0.6)
        scatter = ax.scatter([], [], c='blue', s=30, alpha=0.5)
        
        ax.set_title('路径搜索动画', fontsize=16, fontproperties='SimHei')
        ax.legend(prop={'family': 'SimHei'})
        ax.axis('off')
        
        def init():
            line.set_data([], [])
            scatter.set_offsets(np.empty((0, 2)))
            return line, scatter
        
        def update(frame):
            if frame < len(path):
                current_path = path[:frame+1]
                path_array = np.array(current_path)
                line.set_data(path_array[:, 1], path_array[:, 0])
                scatter.set_offsets(path_array[:, [1, 0]])
            return line, scatter
        
        anim = FuncAnimation(fig, update, init_func=init, 
                           frames=len(path), interval=50, 
                           blit=True, repeat=True)
        
        if save_path:
            anim.save(save_path, writer='pillow', fps=20)
            print(f"动画已保存到: {save_path}")
        
        plt.show()


def plot_comparison(results: List[Tuple[str, Maze, Individual]], save_path: str = None):
    """
    绘制多个结果的对比
    
    Args:
        results: 结果列表，每个元素为 (标签, 迷宫, 个体)
        save_path: 保存路径（如果提供）
    """
    n = len(results)
    fig, axes = plt.subplots(1, n, figsize=(6*n, 6))
    
    if n == 1:
        axes = [axes]
    
    for idx, (label, maze, individual) in enumerate(results):
        ax = axes[idx]
        
        # 绘制迷宫
        ax.imshow(maze.grid, cmap='binary', interpolation='nearest')
        
        # 绘制起点和终点
        start_y, start_x = maze.start
        end_y, end_x = maze.end
        
        ax.plot(start_x, start_y, 'go', markersize=12, label='起点')
        ax.plot(end_x, end_y, 'ro', markersize=12, label='终点')
        
        # 绘制路径
        if individual and individual.path:
            path_array = np.array(individual.path)
            ax.plot(path_array[:, 1], path_array[:, 0], 'b-', linewidth=2, alpha=0.6)
            
        status = "成功" if individual and individual.reached_end else "失败"
        ax.set_title(f'{label}\n路径长度: {len(individual.path) if individual else 0}\n状态: {status}',
                    fontsize=12, fontproperties='SimHei')
        ax.legend(prop={'family': 'SimHei', 'size': 8})
        ax.axis('off')
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        print(f"对比图已保存到: {save_path}")
    
    plt.show()

