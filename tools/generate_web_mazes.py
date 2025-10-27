#!/usr/bin/env python3
"""
为Web应用生成迷宫库
"""
import json
import sys
import os

# 添加src目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from maze import Maze


def generate_maze_library():
    """生成各种规模的迷宫库"""
    library = {
        "version": "1.0",
        "presets": []
    }
    
    configs = [
        # (宽度, 高度, 难度标签, 复杂度, 密度, 数量)
        (15, 15, "easy", 0.6, 0.6, 5),
        (21, 21, "medium", 0.75, 0.75, 5),
        (31, 31, "hard", 0.85, 0.85, 3),
    ]
    
    print("正在生成迷宫库...")
    
    for width, height, difficulty, complexity, density, count in configs:
        print(f"  生成 {difficulty} 难度 ({width}×{height})...")
        
        for i in range(count):
            maze = Maze(width, height)
            maze.generate_maze(complexity=complexity, density=density)
            
            library["presets"].append({
                "id": f"{difficulty}_{width}x{height}_{i}",
                "name": f"{difficulty.capitalize()} Maze {i+1}",
                "difficulty": difficulty,
                "width": width,
                "height": height,
                "grid": maze.grid.tolist(),
                "start": list(maze.start),
                "end": list(maze.end)
            })
    
    return library


def main():
    """主函数"""
    # 生成迷宫库
    library = generate_maze_library()
    
    # 保存到Web项目
    output_dir = os.path.join(
        os.path.dirname(__file__), 
        '../web/public/mazes'
    )
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, 'library.json')
    
    with open(output_file, 'w') as f:
        json.dump(library, f, indent=2)
    
    print(f"\n✓ 成功生成 {len(library['presets'])} 个迷宫")
    print(f"✓ 保存到: {output_file}")
    
    # 生成一个示例迷宫用于演示
    demo_maze = Maze(21, 21)
    demo_maze.generate_maze(complexity=0.75, density=0.75)
    
    demo_data = {
        "id": "demo",
        "width": 21,
        "height": 21,
        "grid": demo_maze.grid.tolist(),
        "start": list(demo_maze.start),
        "end": list(demo_maze.end)
    }
    
    demo_file = os.path.join(output_dir, 'demo.json')
    with open(demo_file, 'w') as f:
        json.dump(demo_data, f, indent=2)
    
    print(f"✓ 生成演示迷宫: {demo_file}")


if __name__ == '__main__':
    main()

