"""
可视化模块 - 用于可视化迷宫和路径
"""
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.animation import FuncAnimation, PillowWriter
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
    
    def create_evolution_animation(self, best_individuals_history: List,
                                   fitness_history: List[dict],
                                   save_path: str = "evolution.gif",
                                   fps: int = 5,
                                   interval_ms: int = 200):
        """
        创建进化过程动画 - 展示每一代的最佳路径演化
        
        Args:
            best_individuals_history: 每一代的最佳个体列表
            fitness_history: 适应度历史
            save_path: 保存路径（支持.gif, .mp4）
            fps: 帧率
            interval_ms: 每帧间隔（毫秒）
        """
        if not best_individuals_history:
            print("No evolution history to animate")
            return
        
        # 创建图形
        fig = plt.figure(figsize=(14, 7), facecolor=self.COLORS['background'])
        gs = fig.add_gridspec(1, 2, wspace=0.3)
        
        # 左侧：迷宫和路径
        ax_maze = fig.add_subplot(gs[0])
        ax_maze.set_facecolor(self.COLORS['grid'])
        
        # 右侧：适应度曲线
        ax_fitness = fig.add_subplot(gs[1])
        ax_fitness.set_facecolor(self.COLORS['grid'])
        
        # 绘制迷宫背景
        cmap = plt.cm.colors.ListedColormap(['#ECEFF4', '#4C566A'])
        ax_maze.imshow(self.maze.grid, cmap=cmap, interpolation='nearest')
        
        # 绘制起点和终点
        start_y, start_x = self.maze.start
        end_y, end_x = self.maze.end
        ax_maze.plot(start_x, start_y, 'o', color=self.COLORS['start'], 
                    markersize=12, markeredgecolor='white', markeredgewidth=2)
        ax_maze.plot(end_x, end_y, 's', color=self.COLORS['end'], 
                    markersize=12, markeredgecolor='white', markeredgewidth=2)
        
        # 初始化路径线和点
        line, = ax_maze.plot([], [], linewidth=2.5, alpha=0.8)
        scatter = ax_maze.scatter([], [], s=30, alpha=0.6, edgecolors='white', linewidths=0.5)
        
        # 信息文本
        info_text = ax_maze.text(0.5, -0.05, '', transform=ax_maze.transAxes,
                                ha='center', va='top', fontsize=11, 
                                color=self.COLORS['text'], weight='bold',
                                bbox=dict(boxstyle='round', facecolor=self.COLORS['wall'], alpha=0.9))
        
        ax_maze.set_title('Best Path Evolution', fontsize=14, 
                         color=self.COLORS['text'], weight='bold', pad=15)
        ax_maze.axis('off')
        
        # 设置适应度曲线
        generations = list(range(len(fitness_history)))
        all_best_fitness = [h['best_fitness'] for h in fitness_history]
        all_avg_fitness = [h['avg_fitness'] for h in fitness_history]
        
        ax_fitness.plot(generations, all_best_fitness, color='#88C0D0', 
                       linewidth=1, alpha=0.3, label='Best (Final)')
        ax_fitness.plot(generations, all_avg_fitness, color='#D08770', 
                       linewidth=1, alpha=0.3, linestyle='--', label='Avg (Final)')
        
        # 动态曲线（会更新）
        best_line, = ax_fitness.plot([], [], color='#88C0D0', linewidth=2.5, 
                                     marker='o', markersize=4, label='Best (Current)')
        avg_line, = ax_fitness.plot([], [], color='#D08770', linewidth=2, 
                                    linestyle='--', label='Avg (Current)')
        current_point = ax_fitness.scatter([], [], s=100, color='#BF616A', 
                                          marker='o', zorder=5, edgecolors='white', linewidths=2)
        
        ax_fitness.set_xlabel('Generation', fontsize=11, color=self.COLORS['text'])
        ax_fitness.set_ylabel('Fitness', fontsize=11, color=self.COLORS['text'])
        ax_fitness.set_title('Fitness Evolution', fontsize=14, 
                            color=self.COLORS['text'], weight='bold', pad=15)
        ax_fitness.legend(loc='lower right', framealpha=0.9, 
                         facecolor=self.COLORS['wall'], prop={'size': 9})
        ax_fitness.grid(True, alpha=0.2, color=self.COLORS['text'])
        ax_fitness.tick_params(colors=self.COLORS['text'])
        ax_fitness.set_xlim(-1, len(generations))
        
        # 设置y轴范围
        all_fitness = all_best_fitness + all_avg_fitness
        y_min, y_max = min(all_fitness), max(all_fitness)
        y_range = y_max - y_min
        ax_fitness.set_ylim(y_min - y_range*0.1, y_max + y_range*0.1)
        
        def init():
            """初始化动画"""
            line.set_data([], [])
            scatter.set_offsets(np.empty((0, 2)))
            best_line.set_data([], [])
            avg_line.set_data([], [])
            current_point.set_offsets(np.empty((0, 2)))
            info_text.set_text('')
            return line, scatter, best_line, avg_line, current_point, info_text
        
        def update(frame):
            """更新每一帧"""
            if frame >= len(best_individuals_history):
                frame = len(best_individuals_history) - 1
            
            # 获取当前代的最佳个体
            individual = best_individuals_history[frame]
            path = individual.path
            
            # 更新路径
            if path:
                path_array = np.array(path)
                colors = plt.cm.cool(np.linspace(0, 1, len(path)))
                
                # 绘制路径
                line.set_data(path_array[:, 1], path_array[:, 0])
                line.set_color(self.COLORS['path_color'])
                scatter.set_offsets(path_array[:, [1, 0]])
                scatter.set_color(colors)
            
            # 更新信息文本
            gen = frame
            fitness = individual.fitness
            length = len(path)
            status = "SUCCESS ✓" if individual.reached_end else "SEARCHING..."
            status_color = self.COLORS['start'] if individual.reached_end else self.COLORS['accent']
            
            info_str = f"Gen: {gen} | Fitness: {fitness:.1f} | Steps: {length} | {status}"
            info_text.set_text(info_str)
            info_text.set_bbox(dict(boxstyle='round', 
                                   facecolor=self.COLORS['wall'] if not individual.reached_end else '#A3BE8C',
                                   alpha=0.9))
            
            # 更新适应度曲线
            current_gens = generations[:frame+1]
            current_best = all_best_fitness[:frame+1]
            current_avg = all_avg_fitness[:frame+1]
            
            best_line.set_data(current_gens, current_best)
            avg_line.set_data(current_gens, current_avg)
            current_point.set_offsets([[gen, fitness]])
            
            return line, scatter, best_line, avg_line, current_point, info_text
        
        # 创建动画
        total_frames = len(best_individuals_history)
        print(f"Creating animation with {total_frames} frames...")
        
        anim = FuncAnimation(fig, update, init_func=init,
                           frames=total_frames, interval=interval_ms,
                           blit=True, repeat=True)
        
        # 保存动画
        try:
            if save_path.endswith('.gif'):
                print(f"Saving as GIF (this may take a while)...")
                writer = PillowWriter(fps=fps)
                anim.save(save_path, writer=writer)
                print(f"✓ Animation saved: {save_path}")
            elif save_path.endswith('.mp4'):
                print(f"Saving as MP4...")
                anim.save(save_path, writer='ffmpeg', fps=fps)
                print(f"✓ Animation saved: {save_path}")
            else:
                print(f"Warning: Unsupported format, saving as GIF")
                save_path = save_path.rsplit('.', 1)[0] + '.gif'
                writer = PillowWriter(fps=fps)
                anim.save(save_path, writer=writer)
                print(f"✓ Animation saved: {save_path}")
        except Exception as e:
            print(f"Error saving animation: {e}")
            print("Trying to display instead...")
            plt.show()
        
        plt.close()
    
    def create_population_evolution_animation(self, population_history: List[List],
                                              fitness_history: List[dict],
                                              save_path: str = "population_evolution.gif",
                                              fps: int = 5,
                                              interval_ms: int = 200,
                                              show_diversity: bool = True):
        """
        创建种群演化动画 - 展示多个个体的演化过程，体现随机性和收敛
        
        Args:
            population_history: 每一代的种群快照（包含多个个体）
            fitness_history: 适应度历史
            save_path: 保存路径
            fps: 帧率
            interval_ms: 每帧间隔
            show_diversity: 是否显示种群多样性指标
        """
        if not population_history:
            print("No population history to animate")
            return
        
        # 创建图形 - 三面板布局
        fig = plt.figure(figsize=(16, 7), facecolor=self.COLORS['background'])
        if show_diversity:
            gs = fig.add_gridspec(2, 3, hspace=0.3, wspace=0.3, 
                                 height_ratios=[2, 1])
        else:
            gs = fig.add_gridspec(1, 2, wspace=0.3)
        
        # 左侧：迷宫和多条路径
        if show_diversity:
            ax_maze = fig.add_subplot(gs[:, 0])
        else:
            ax_maze = fig.add_subplot(gs[0])
        ax_maze.set_facecolor(self.COLORS['grid'])
        
        # 右上：适应度曲线
        if show_diversity:
            ax_fitness = fig.add_subplot(gs[0, 1:])
        else:
            ax_fitness = fig.add_subplot(gs[1])
        ax_fitness.set_facecolor(self.COLORS['grid'])
        
        # 右下：种群多样性（可选）
        if show_diversity:
            ax_diversity = fig.add_subplot(gs[1, 1:])
            ax_diversity.set_facecolor(self.COLORS['grid'])
        
        # 绘制迷宫背景
        cmap = plt.cm.colors.ListedColormap(['#ECEFF4', '#4C566A'])
        ax_maze.imshow(self.maze.grid, cmap=cmap, interpolation='nearest')
        
        # 绘制起点和终点
        start_y, start_x = self.maze.start
        end_y, end_x = self.maze.end
        ax_maze.plot(start_x, start_y, 'o', color=self.COLORS['start'], 
                    markersize=12, markeredgecolor='white', markeredgewidth=2, zorder=10)
        ax_maze.plot(end_x, end_y, 's', color=self.COLORS['end'], 
                    markersize=12, markeredgecolor='white', markeredgewidth=2, zorder=10)
        
        # 初始化多条路径线（最多显示10个个体）
        max_paths = 10
        path_lines = []
        path_scatters = []
        for i in range(max_paths):
            line, = ax_maze.plot([], [], linewidth=1.5, alpha=0.4, zorder=i)
            scatter = ax_maze.scatter([], [], s=15, alpha=0.3, zorder=i)
            path_lines.append(line)
            path_scatters.append(scatter)
        
        # 最佳路径（高亮显示）
        best_line, = ax_maze.plot([], [], linewidth=3, alpha=0.9, 
                                  color=self.COLORS['path_color'], zorder=max_paths+1)
        best_scatter = ax_maze.scatter([], [], s=40, alpha=0.7, 
                                       edgecolors='white', linewidths=1, zorder=max_paths+1)
        
        # 信息文本
        info_text = ax_maze.text(0.5, -0.05, '', transform=ax_maze.transAxes,
                                ha='center', va='top', fontsize=11, 
                                color=self.COLORS['text'], weight='bold',
                                bbox=dict(boxstyle='round', facecolor=self.COLORS['wall'], alpha=0.9))
        
        ax_maze.set_title('Population Evolution (Top 10 Individuals)', fontsize=14, 
                         color=self.COLORS['text'], weight='bold', pad=15)
        ax_maze.axis('off')
        
        # 设置适应度曲线
        generations = list(range(len(fitness_history)))
        all_best_fitness = [h['best_fitness'] for h in fitness_history]
        all_avg_fitness = [h['avg_fitness'] for h in fitness_history]
        
        # 背景参考线
        ax_fitness.plot(generations, all_best_fitness, color='#88C0D0', 
                       linewidth=1, alpha=0.2)
        ax_fitness.plot(generations, all_avg_fitness, color='#D08770', 
                       linewidth=1, alpha=0.2, linestyle='--')
        
        # 动态曲线
        best_line_fit, = ax_fitness.plot([], [], color='#88C0D0', linewidth=2.5, 
                                         marker='o', markersize=4, label='Best')
        avg_line_fit, = ax_fitness.plot([], [], color='#D08770', linewidth=2, 
                                        linestyle='--', label='Average')
        current_point_fit = ax_fitness.scatter([], [], s=100, color='#BF616A', 
                                               marker='o', zorder=5, edgecolors='white', linewidths=2)
        
        ax_fitness.set_xlabel('Generation', fontsize=11, color=self.COLORS['text'])
        ax_fitness.set_ylabel('Fitness', fontsize=11, color=self.COLORS['text'])
        ax_fitness.set_title('Fitness Evolution', fontsize=13, 
                            color=self.COLORS['text'], weight='bold')
        ax_fitness.legend(loc='lower right', framealpha=0.9, facecolor=self.COLORS['wall'])
        ax_fitness.grid(True, alpha=0.2, color=self.COLORS['text'])
        ax_fitness.tick_params(colors=self.COLORS['text'])
        ax_fitness.set_xlim(-1, len(generations))
        
        all_fitness = all_best_fitness + all_avg_fitness
        y_min, y_max = min(all_fitness), max(all_fitness)
        y_range = y_max - y_min
        ax_fitness.set_ylim(y_min - y_range*0.1, y_max + y_range*0.1)
        
        # 种群多样性图表
        if show_diversity:
            diversity_data = []
            for gen_pop in population_history:
                if gen_pop:
                    fitness_vals = [ind.fitness for ind in gen_pop]
                    diversity = np.std(fitness_vals) if len(fitness_vals) > 1 else 0
                    diversity_data.append(diversity)
                else:
                    diversity_data.append(0)
            
            ax_diversity.plot(generations, diversity_data, color='#5E81AC', 
                            linewidth=1, alpha=0.3)
            diversity_line, = ax_diversity.plot([], [], color='#5E81AC', 
                                               linewidth=2.5, marker='s', markersize=3)
            
            ax_diversity.set_xlabel('Generation', fontsize=10, color=self.COLORS['text'])
            ax_diversity.set_ylabel('Diversity (Std)', fontsize=10, color=self.COLORS['text'])
            ax_diversity.set_title('Population Diversity', fontsize=12, 
                                  color=self.COLORS['text'], weight='bold')
            ax_diversity.grid(True, alpha=0.2, color=self.COLORS['text'])
            ax_diversity.tick_params(colors=self.COLORS['text'])
            ax_diversity.set_xlim(-1, len(generations))
            ax_diversity.set_ylim(0, max(diversity_data) * 1.1 if diversity_data else 1)
        
        def init():
            """初始化动画"""
            for line, scatter in zip(path_lines, path_scatters):
                line.set_data([], [])
                scatter.set_offsets(np.empty((0, 2)))
            best_line.set_data([], [])
            best_scatter.set_offsets(np.empty((0, 2)))
            best_line_fit.set_data([], [])
            avg_line_fit.set_data([], [])
            current_point_fit.set_offsets(np.empty((0, 2)))
            if show_diversity:
                diversity_line.set_data([], [])
                return (*path_lines, *path_scatters, best_line, best_scatter, 
                       best_line_fit, avg_line_fit, current_point_fit, 
                       diversity_line, info_text)
            return (*path_lines, *path_scatters, best_line, best_scatter, 
                   best_line_fit, avg_line_fit, current_point_fit, info_text)
        
        def update(frame):
            """更新每一帧"""
            if frame >= len(population_history):
                frame = len(population_history) - 1
            
            gen_population = population_history[frame]
            
            # 颜色方案：根据适应度排名
            colors_palette = plt.cm.viridis(np.linspace(0.2, 0.9, max_paths))
            
            # 更新每个个体的路径
            for i, (line, scatter) in enumerate(zip(path_lines, path_scatters)):
                if i < len(gen_population):
                    individual = gen_population[i]
                    path = individual.path
                    if path:
                        path_array = np.array(path)
                        line.set_data(path_array[:, 1], path_array[:, 0])
                        line.set_color(colors_palette[i])
                        line.set_alpha(0.6 - i * 0.05)  # 越优秀越不透明
                        scatter.set_offsets(path_array[:, [1, 0]])
                        scatter.set_color(colors_palette[i])
                        scatter.set_alpha(0.4 - i * 0.03)
                else:
                    line.set_data([], [])
                    scatter.set_offsets(np.empty((0, 2)))
            
            # 更新最佳路径（高亮）
            if gen_population:
                best_ind = gen_population[0]  # 第一个是最佳
                if best_ind.path:
                    best_path_array = np.array(best_ind.path)
                    best_line.set_data(best_path_array[:, 1], best_path_array[:, 0])
                    
                    # 渐变色
                    best_colors = plt.cm.cool(np.linspace(0, 1, len(best_ind.path)))
                    best_scatter.set_offsets(best_path_array[:, [1, 0]])
                    best_scatter.set_color(best_colors)
                    
                    # 更新信息
                    status = "SUCCESS ✓" if best_ind.reached_end else f"EVOLVING... ({len(gen_population)} paths)"
                    info_str = f"Gen: {frame} | Best Fitness: {best_ind.fitness:.1f} | Best Steps: {len(best_ind.path)} | {status}"
                    info_text.set_text(info_str)
                    
                    bg_color = '#A3BE8C' if best_ind.reached_end else self.COLORS['wall']
                    info_text.set_bbox(dict(boxstyle='round', facecolor=bg_color, alpha=0.9))
            
            # 更新适应度曲线
            current_gens = generations[:frame+1]
            current_best = all_best_fitness[:frame+1]
            current_avg = all_avg_fitness[:frame+1]
            
            best_line_fit.set_data(current_gens, current_best)
            avg_line_fit.set_data(current_gens, current_avg)
            if gen_population:
                current_point_fit.set_offsets([[frame, gen_population[0].fitness]])
            
            # 更新多样性曲线
            if show_diversity:
                diversity_line.set_data(current_gens, diversity_data[:frame+1])
                return (*path_lines, *path_scatters, best_line, best_scatter, 
                       best_line_fit, avg_line_fit, current_point_fit, 
                       diversity_line, info_text)
            
            return (*path_lines, *path_scatters, best_line, best_scatter, 
                   best_line_fit, avg_line_fit, current_point_fit, info_text)
        
        # 创建动画
        total_frames = len(population_history)
        print(f"Creating population evolution animation with {total_frames} frames...")
        print(f"Showing up to {max_paths} individuals per generation")
        
        anim = FuncAnimation(fig, update, init_func=init,
                           frames=total_frames, interval=interval_ms,
                           blit=True, repeat=True)
        
        # 保存动画
        try:
            if save_path.endswith('.gif'):
                print(f"Saving as GIF (this may take a while)...")
                writer = PillowWriter(fps=fps)
                anim.save(save_path, writer=writer)
                print(f"✓ Population evolution animation saved: {save_path}")
            elif save_path.endswith('.mp4'):
                print(f"Saving as MP4...")
                anim.save(save_path, writer='ffmpeg', fps=fps)
                print(f"✓ Population evolution animation saved: {save_path}")
            else:
                print(f"Warning: Unsupported format, saving as GIF")
                save_path = save_path.rsplit('.', 1)[0] + '.gif'
                writer = PillowWriter(fps=fps)
                anim.save(save_path, writer=writer)
                print(f"✓ Population evolution animation saved: {save_path}")
        except Exception as e:
            print(f"Error saving animation: {e}")
            print("Trying to display instead...")
            plt.show()
        
        plt.close()


def plot_comparison(results: List[Tuple], save_path: str = None):
    """
    绘制多个结果的精美对比图
    
    Args:
        results: 结果列表，每个元素为 (标签, 迷宫, 个体, 代数)
        save_path: 保存路径
    """
    n = len(results)
    colors = MazeVisualizer.COLORS
    
    # 创建垂直布局，每个结果占一行
    fig = plt.figure(figsize=(16, 5*n), facecolor=colors['background'])
    gs = fig.add_gridspec(n, 3, hspace=0.4, wspace=0.3, width_ratios=[2, 1, 1])
    
    for idx, result_data in enumerate(results):
        # 解包结果（兼容新旧格式）
        if len(result_data) == 4:
            label, maze, individual, generation = result_data
        else:
            label, maze, individual = result_data
            generation = 0
        
        # 左侧：迷宫和路径
        ax_maze = fig.add_subplot(gs[idx, 0])
        ax_maze.set_facecolor(colors['grid'])
        
        # 绘制迷宫
        cmap = plt.cm.colors.ListedColormap(['#ECEFF4', '#4C566A'])
        ax_maze.imshow(maze.grid, cmap=cmap, interpolation='nearest')
        
        # 绘制起点和终点
        start_y, start_x = maze.start
        end_y, end_x = maze.end
        
        ax_maze.plot(start_x, start_y, 'o', color=colors['start'], 
                    markersize=12, markeredgecolor='white', markeredgewidth=2, label='Start')
        ax_maze.plot(end_x, end_y, 's', color=colors['end'], 
                    markersize=12, markeredgecolor='white', markeredgewidth=2, label='End')
        
        # 绘制路径（渐变色）
        if individual and individual.path and len(individual.path) > 0:
            path_array = np.array(individual.path)
            path_colors = plt.cm.cool(np.linspace(0, 1, len(individual.path)))
            
            # 绘制路径线段
            for i in range(len(individual.path) - 1):
                ax_maze.plot([path_array[i, 1], path_array[i+1, 1]], 
                           [path_array[i, 0], path_array[i+1, 0]], 
                           color=path_colors[i], linewidth=2.5, alpha=0.8)
            
            # 绘制路径点
            ax_maze.scatter(path_array[:, 1], path_array[:, 0], 
                          c=path_colors, s=25, alpha=0.6, 
                          edgecolors='white', linewidths=0.5)
        
        # 标题
        status = "SUCCESS ✓" if individual and individual.reached_end else "INCOMPLETE"
        title_color = colors['start'] if individual and individual.reached_end else colors['end']
        ax_maze.set_title(f'{label} | {status}',
                         fontsize=13, color=title_color, weight='bold', pad=10)
        ax_maze.legend(loc='upper right', framealpha=0.9, facecolor=colors['wall'], fontsize=8)
        ax_maze.axis('off')
        
        # 中间：统计信息
        ax_stats = fig.add_subplot(gs[idx, 1])
        ax_stats.set_facecolor(colors['background'])
        ax_stats.axis('off')
        
        stats_text = f"""
STATISTICS
━━━━━━━━━━━━━
Generations: {generation}
Fitness: {individual.fitness:.1f}
Path Length: {len(individual.path)}
Unique: {len(set(individual.path))}
Efficiency: {len(set(individual.path))/len(individual.path)*100:.1f}%
━━━━━━━━━━━━━
Status: {status}
        """
        
        ax_stats.text(0.5, 0.5, stats_text, 
                     fontsize=10, color=colors['text'],
                     family='monospace', ha='center', va='center',
                     bbox=dict(boxstyle='round,pad=1', 
                             facecolor=colors['wall'], 
                             edgecolor=title_color, linewidth=2,
                             alpha=0.9))
        
        # 右侧：路径可视化（简化版）
        ax_path = fig.add_subplot(gs[idx, 2])
        ax_path.set_facecolor(colors['grid'])
        
        if individual and individual.path:
            # 绘制路径轨迹图
            path_array = np.array(individual.path)
            
            # 创建热力图显示路径访问
            heatmap = np.zeros_like(maze.grid, dtype=float)
            for pos in individual.path:
                heatmap[pos[0], pos[1]] += 1
            
            # 归一化
            if heatmap.max() > 0:
                heatmap = heatmap / heatmap.max()
            
            ax_path.imshow(heatmap, cmap='YlOrRd', alpha=0.7, interpolation='nearest')
            ax_path.imshow(maze.grid, cmap='binary', alpha=0.3, interpolation='nearest')
            
            ax_path.plot(start_x, start_y, 'o', color=colors['start'], 
                        markersize=10, markeredgecolor='white', markeredgewidth=2)
            ax_path.plot(end_x, end_y, 's', color=colors['end'], 
                        markersize=10, markeredgecolor='white', markeredgewidth=2)
        
        ax_path.set_title('Path Heatmap', fontsize=11, 
                         color=colors['text'], weight='bold')
        ax_path.axis('off')
    
    # 总标题
    plt.suptitle('Parameter Comparison Results', 
                fontsize=16, color=colors['text'], weight='bold', y=0.98)
    
    if save_path:
        plt.savefig(save_path, dpi=100, bbox_inches='tight',
                   facecolor=colors['background'])
        print(f"Comparison saved: {save_path}")
    
    plt.show()
    plt.close()
