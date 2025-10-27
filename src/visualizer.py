"""
可视化模块 - 用于可视化迷宫和路径
"""
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.animation import FuncAnimation
import numpy as np
from typing import List, Tuple, Optional
import platform

# 配置matplotlib中文字体
def setup_chinese_font():
    """配置中文字体支持"""
    system = platform.system()
    try:
        if system == 'Darwin':  # macOS
            plt.rcParams['font.sans-serif'] = ['Arial Unicode MS', 'Heiti TC', 'STHeiti']
        elif system == 'Windows':
            plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'KaiTi']
        elif system == 'Linux':
            plt.rcParams['font.sans-serif'] = ['Droid Sans Fallback', 'WenQuanYi Micro Hei']
        
        plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题
    except:
        # 如果字体配置失败，使用英文
        print("Warning: Chinese font not available, using English labels")


# 初始化字体
setup_chinese_font()


class MazeVisualizer:
    """迷宫可视化器 - 优化版"""
    
    # 配色方案
    COLORS = {
        'background': '#2E3440',
        'wall': '#4C566A',
        'path_color': '#88C0D0',
        'start': '#A3BE8C',
        'end': '#BF616A',
        'grid': '#3B4252',
        'text': '#ECEFF4',
        'accent': '#5E81AC'
    }
    
    def __init__(self, maze):
        """
        初始化可视化器
        
        Args:
            maze: 迷宫对象
        """
        self.maze = maze
        
    def plot_maze_compact(self, path: List[Tuple[int, int]] = None, 
                         title: str = "Maze Solution",
                         generation: int = 0,
                         fitness: float = 0,
                         save_path: str = None):
        """
        紧凑型迷宫可视化 - 解决图像过大问题
        
        Args:
            path: 路径列表
            title: 图表标题
            generation: 当前代数
            fitness: 适应度
            save_path: 保存路径
        """
        # 根据迷宫大小调整图像大小
        size = max(self.maze.width, self.maze.height)
        if size <= 15:
            figsize = (6, 6)
        elif size <= 25:
            figsize = (8, 8)
        else:
            figsize = (10, 10)
        
        fig, ax = plt.subplots(figsize=figsize, facecolor=self.COLORS['background'])
        ax.set_facecolor(self.COLORS['grid'])
        
        # 使用更美观的配色
        cmap = plt.cm.colors.ListedColormap(['#ECEFF4', '#4C566A'])
        ax.imshow(self.maze.grid, cmap=cmap, interpolation='nearest')
        
        # 绘制起点和终点
        start_y, start_x = self.maze.start
        end_y, end_x = self.maze.end
        
        ax.plot(start_x, start_y, 'o', color=self.COLORS['start'], 
               markersize=12, label='Start', markeredgecolor='white', markeredgewidth=2)
        ax.plot(end_x, end_y, 's', color=self.COLORS['end'], 
               markersize=12, label='End', markeredgecolor='white', markeredgewidth=2)
        
        # 绘制路径
        if path and len(path) > 0:
            path_array = np.array(path)
            
            # 使用渐变色表示路径进度
            colors = plt.cm.cool(np.linspace(0, 1, len(path)))
            
            # 绘制路径线
            for i in range(len(path) - 1):
                ax.plot([path_array[i, 1], path_array[i+1, 1]], 
                       [path_array[i, 0], path_array[i+1, 0]], 
                       color=colors[i], linewidth=2, alpha=0.7)
            
            # 标记路径点
            ax.scatter(path_array[:, 1], path_array[:, 0], 
                      c=colors, s=15, alpha=0.5, edgecolors='white', linewidths=0.5)
        
        # 添加信息文本
        info_text = f"Gen: {generation} | Fitness: {fitness:.1f} | Steps: {len(path) if path else 0}"
        ax.text(0.5, -0.05, info_text, transform=ax.transAxes,
               ha='center', va='top', fontsize=10, color=self.COLORS['text'],
               bbox=dict(boxstyle='round', facecolor=self.COLORS['wall'], alpha=0.8))
        
        ax.set_title(title, fontsize=14, color=self.COLORS['text'], pad=15, weight='bold')
        ax.legend(loc='upper right', framealpha=0.9, facecolor=self.COLORS['wall'],
                 edgecolor=self.COLORS['text'])
        ax.axis('off')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=100, bbox_inches='tight', 
                       facecolor=self.COLORS['background'])
            print(f"Image saved: {save_path}")
        
        plt.show()
        plt.close()
        
    def plot_evolution_dashboard(self, fitness_history: List[dict], 
                                best_individual=None,
                                save_path: str = None):
        """
        进化过程仪表盘 - 展示完整的迭代过程
        
        Args:
            fitness_history: 适应度历史
            best_individual: 最佳个体
            save_path: 保存路径
        """
        if not fitness_history:
            return
        
        fig = plt.figure(figsize=(14, 8), facecolor=self.COLORS['background'])
        gs = fig.add_gridspec(2, 3, hspace=0.3, wspace=0.3)
        
        # 1. 迷宫和最佳路径 (左侧大图)
        ax_maze = fig.add_subplot(gs[:, 0])
        ax_maze.set_facecolor(self.COLORS['grid'])
        
        cmap = plt.cm.colors.ListedColormap(['#ECEFF4', '#4C566A'])
        ax_maze.imshow(self.maze.grid, cmap=cmap, interpolation='nearest')
        
        start_y, start_x = self.maze.start
        end_y, end_x = self.maze.end
        ax_maze.plot(start_x, start_y, 'o', color=self.COLORS['start'], 
                    markersize=10, markeredgecolor='white', markeredgewidth=2)
        ax_maze.plot(end_x, end_y, 's', color=self.COLORS['end'], 
                    markersize=10, markeredgecolor='white', markeredgewidth=2)
        
        if best_individual and best_individual.path:
            path = np.array(best_individual.path)
            colors = plt.cm.cool(np.linspace(0, 1, len(path)))
            
            for i in range(len(path) - 1):
                ax_maze.plot([path[i, 1], path[i+1, 1]], 
                           [path[i, 0], path[i+1, 0]], 
                           color=colors[i], linewidth=2.5, alpha=0.8)
            
            ax_maze.scatter(path[:, 1], path[:, 0], c=colors, s=20, alpha=0.6,
                          edgecolors='white', linewidths=0.5)
        
        status = "SUCCESS" if best_individual and best_individual.reached_end else "INCOMPLETE"
        color = self.COLORS['start'] if best_individual and best_individual.reached_end else self.COLORS['end']
        ax_maze.set_title(f"Best Solution - {status}", 
                         fontsize=12, color=color, weight='bold')
        ax_maze.axis('off')
        
        # 2. 适应度演化曲线
        ax_fitness = fig.add_subplot(gs[0, 1:])
        ax_fitness.set_facecolor(self.COLORS['grid'])
        
        generations = [h['generation'] for h in fitness_history]
        best_fitness = [h['best_fitness'] for h in fitness_history]
        avg_fitness = [h['avg_fitness'] for h in fitness_history]
        
        ax_fitness.plot(generations, best_fitness, color='#88C0D0', 
                       linewidth=2.5, label='Best Fitness', marker='o', 
                       markersize=3, markevery=max(1, len(generations)//20))
        ax_fitness.plot(generations, avg_fitness, color='#D08770', 
                       linewidth=2, label='Avg Fitness', linestyle='--', alpha=0.8)
        
        ax_fitness.fill_between(generations, avg_fitness, best_fitness, 
                               alpha=0.2, color='#5E81AC')
        
        ax_fitness.set_xlabel('Generation', fontsize=11, color=self.COLORS['text'])
        ax_fitness.set_ylabel('Fitness', fontsize=11, color=self.COLORS['text'])
        ax_fitness.set_title('Evolution Progress', fontsize=12, 
                           color=self.COLORS['text'], weight='bold')
        ax_fitness.legend(framealpha=0.9, facecolor=self.COLORS['wall'])
        ax_fitness.grid(True, alpha=0.2, color=self.COLORS['text'])
        ax_fitness.tick_params(colors=self.COLORS['text'])
        
        # 3. 统计信息
        ax_stats = fig.add_subplot(gs[1, 1])
        ax_stats.set_facecolor(self.COLORS['background'])
        ax_stats.axis('off')
        
        if best_individual:
            stats_text = f"""
STATISTICS
━━━━━━━━━━━━━━━━
Total Generations: {len(fitness_history)}
Best Fitness: {best_fitness[-1]:.2f}
Path Length: {len(best_individual.path)}
Unique Steps: {len(set(best_individual.path))}
Success Rate: {len(set(best_individual.path))/len(best_individual.path)*100:.1f}%
━━━━━━━━━━━━━━━━
Status: {'✓ Completed' if best_individual.reached_end else '⚠ Incomplete'}
            """
            ax_stats.text(0.1, 0.5, stats_text, fontsize=10, 
                         color=self.COLORS['text'], family='monospace',
                         verticalalignment='center',
                         bbox=dict(boxstyle='round', facecolor=self.COLORS['wall'], 
                                 alpha=0.8, pad=1))
        
        # 4. 收敛分析
        ax_convergence = fig.add_subplot(gs[1, 2])
        ax_convergence.set_facecolor(self.COLORS['grid'])
        
        # 计算改进率
        if len(best_fitness) > 1:
            improvements = []
            for i in range(1, len(best_fitness)):
                if best_fitness[i] > best_fitness[i-1]:
                    improvements.append(i)
            
            # 绘制改进点
            if improvements:
                ax_convergence.scatter(improvements, 
                                      [best_fitness[i] for i in improvements],
                                      color=self.COLORS['start'], s=50, 
                                      alpha=0.6, marker='^', 
                                      label='Improvements')
            
            ax_convergence.plot(generations, best_fitness, 
                              color=self.COLORS['accent'], linewidth=2)
            ax_convergence.set_xlabel('Generation', fontsize=10, color=self.COLORS['text'])
            ax_convergence.set_ylabel('Best Fitness', fontsize=10, color=self.COLORS['text'])
            ax_convergence.set_title('Convergence Analysis', fontsize=11, 
                                   color=self.COLORS['text'], weight='bold')
            ax_convergence.grid(True, alpha=0.2, color=self.COLORS['text'])
            ax_convergence.tick_params(colors=self.COLORS['text'])
            if improvements:
                ax_convergence.legend(framealpha=0.9, facecolor=self.COLORS['wall'])
        
        plt.suptitle('Genetic Algorithm Evolution Dashboard', 
                    fontsize=16, color=self.COLORS['text'], weight='bold', y=0.98)
        
        if save_path:
            plt.savefig(save_path, dpi=100, bbox_inches='tight',
                       facecolor=self.COLORS['background'])
            print(f"Dashboard saved: {save_path}")
        
        plt.show()
        plt.close()
    
    def plot_fitness_history(self, fitness_history: List[dict], save_path: str = None):
        """
        简化版适应度历史图
        
        Args:
            fitness_history: 适应度历史记录
            save_path: 保存路径
        """
        if not fitness_history:
            return
        
        generations = [h['generation'] for h in fitness_history]
        best_fitness = [h['best_fitness'] for h in fitness_history]
        avg_fitness = [h['avg_fitness'] for h in fitness_history]
        
        fig, ax = plt.subplots(figsize=(10, 5), facecolor=self.COLORS['background'])
        ax.set_facecolor(self.COLORS['grid'])
        
        ax.plot(generations, best_fitness, color='#88C0D0', 
               linewidth=2.5, label='Best', marker='o', markersize=4)
        ax.plot(generations, avg_fitness, color='#D08770', 
               linewidth=2, label='Average', linestyle='--')
        
        ax.fill_between(generations, avg_fitness, best_fitness, 
                       alpha=0.2, color='#5E81AC')
        
        ax.set_xlabel('Generation', fontsize=12, color=self.COLORS['text'])
        ax.set_ylabel('Fitness', fontsize=12, color=self.COLORS['text'])
        ax.set_title('Fitness Evolution', fontsize=14, 
                    color=self.COLORS['text'], weight='bold')
        ax.legend(framealpha=0.9, facecolor=self.COLORS['wall'])
        ax.grid(True, alpha=0.2, color=self.COLORS['text'])
        ax.tick_params(colors=self.COLORS['text'])
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=100, bbox_inches='tight',
                       facecolor=self.COLORS['background'])
            print(f"Fitness history saved: {save_path}")
        
        plt.show()
        plt.close()


def plot_comparison(results: List[Tuple[str, any, any]], save_path: str = None):
    """
    绘制多个结果的对比
    
    Args:
        results: 结果列表，每个元素为 (标签, 迷宫, 个体)
        save_path: 保存路径
    """
    n = len(results)
    fig_width = min(5 * n, 15)  # 限制最大宽度
    fig, axes = plt.subplots(1, n, figsize=(fig_width, 5))
    
    if n == 1:
        axes = [axes]
    
    colors = MazeVisualizer.COLORS
    
    for idx, (label, maze, individual) in enumerate(results):
        ax = axes[idx]
        ax.set_facecolor(colors['grid'])
        
        # 绘制迷宫
        cmap = plt.cm.colors.ListedColormap(['#ECEFF4', '#4C566A'])
        ax.imshow(maze.grid, cmap=cmap, interpolation='nearest')
        
        # 绘制起点和终点
        start_y, start_x = maze.start
        end_y, end_x = maze.end
        
        ax.plot(start_x, start_y, 'o', color=colors['start'], 
               markersize=10, markeredgecolor='white', markeredgewidth=1.5)
        ax.plot(end_x, end_y, 's', color=colors['end'], 
               markersize=10, markeredgecolor='white', markeredgewidth=1.5)
        
        # 绘制路径
        if individual and individual.path:
            path_array = np.array(individual.path)
            path_colors = plt.cm.cool(np.linspace(0, 1, len(individual.path)))
            
            for i in range(len(individual.path) - 1):
                ax.plot([path_array[i, 1], path_array[i+1, 1]], 
                       [path_array[i, 0], path_array[i+1, 0]], 
                       color=path_colors[i], linewidth=2, alpha=0.7)
        
        status = "SUCCESS" if individual and individual.reached_end else "FAIL"
        color = colors['start'] if individual and individual.reached_end else colors['end']
        
        ax.set_title(f'{label}\nSteps: {len(individual.path) if individual else 0} | {status}',
                    fontsize=10, color=color, weight='bold')
        ax.axis('off')
    
    fig.patch.set_facecolor(colors['background'])
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=100, bbox_inches='tight',
                   facecolor=colors['background'])
        print(f"Comparison saved: {save_path}")
    
    plt.show()
    plt.close()
