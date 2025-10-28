# 3D可视化与数据导出功能指南 v2.1.0

## 🌐 3D适应度景观可视化

### 功能概述
使用Three.js实现的3D适应度景观（Fitness Landscape），可视化展示遗传算法在进化过程中的适应度变化趋势。

### 主要特性
- **实时3D渲染**: 将进化历史数据转换为立体曲面
- **交互控制**: 鼠标拖动旋转、滚轮缩放
- **自动旋转**: 持续旋转展示全方位视图
- **路径追踪**: 黄色线条标记最佳适应度演化路径
- **专业视觉**: Nord深色主题，青色发光效果

### 使用方法
1. 运行算法至少2代以上
2. 点击右侧面板 **"🌐 3D Landscape"** 按钮
3. 在弹出的全屏3D视图中：
   - **拖动鼠标**: 旋转视角
   - **滚轮滚动**: 缩放视图
   - **ESC或Close按钮**: 关闭3D视图

### 技术实现
```typescript
// 文件: src/vis/FitnessLandscape3D.tsx
// 使用Three.js + WebGL渲染
- PlaneGeometry: 创建地形网格
- VertexHeights: 基于适应度值调整高度
- Phong材质: 实现光照和反射效果
- WireframeGeometry: 网格线框叠加
```

### 可视化说明
- **X轴**: 进化代数（Generation）
- **Y轴**: 0固定平面
- **Z轴**: 适应度值（对数缩放）
- **曲面颜色**: 青色半透明
- **网格线框**: 青色线条（30%透明度）
- **路径线**: 黄色实线标记演化轨迹

---

## 📊 实时统计分析面板

### 功能概述
实时计算并展示遗传算法运行的各项统计指标，提供专业级性能分析。

### 统计指标分类

#### 1. 收敛性能 (CONVERGENCE)
| 指标 | 说明 | 意义 |
|------|------|------|
| First Solution | 首次找到解的代数 | 越小越好，表示收敛快 |
| 90% Optimal | 达到90%最优的代数 | 衡量收敛速度 |
| Avg Improvement | 平均每代提升量 | 正值表示持续进步 |

#### 2. 时间性能 (PERFORMANCE)
| 指标 | 说明 | 参考值 |
|------|------|--------|
| Total Time | 总运行时间 | - |
| Speed | 迭代速度（iter/s） | > 5 优秀 |
| Avg Gen Time | 平均每代时间 | < 200ms 良好 |

#### 3. 解的质量 (SOLUTION QUALITY)
| 指标 | 说明 | 优秀标准 |
|------|------|----------|
| Path Length | 路径总步数 | 越短越好 |
| Uniqueness | 唯一步数比例 | > 90% |
| Smoothness | 平滑度（非转向） | > 70% |
| Status | 求解状态 | ✅ Solved |

#### 4. 多样性分析 (DIVERSITY)
| 指标 | 说明 | 健康标准 |
|------|------|----------|
| Average | 平均多样性 | - |
| Trend | 趋势方向 | Stable最佳 |
| Variance | 适应度方差 | - |

#### 5. 当前状态 (CURRENT STATUS)
实时显示当前代的各项数值

### 智能建议系统
根据统计数据自动生成优化建议：
- 未找到解 → 建议增大代数或种群
- 路径含环路 → 建议启用插入变异
- 过早收敛 → 建议提高变异率
- 收敛慢 → 建议使用Hybrid GA
- 路径转折多 → 建议启用局部搜索
- 性能低 → 建议减小种群或关闭可视化

### 使用方法
1. 统计面板默认开启（右侧面板底部）
2. 点击 **"📊 Hide Stats"** 隐藏
3. 点击 **"📊 Show Stats"** 显示
4. 运行过程中实时更新

---

## 📥 数据导出系统

### 导出格式

#### 1. JSON完整数据 (📥 Export JSON)
**内容**: 完整实验数据
```json
{
  "config": { ... },           // GA配置参数
  "algorithmType": "hybrid",   // 算法类型
  "mazeSize": 21,              // 迷宫大小
  "startTime": 1234567890,     // 开始时间戳
  "endTime": 1234567900,       // 结束时间戳
  "totalGenerations": 100,     // 总代数
  "history": [ ... ],          // 每代详细数据
  "finalBestPath": { ... },    // 最终最佳路径
  "statistics": { ... }        // 统计指标
}
```

**用途**: 
- 完整数据备份
- 后续深度分析
- 实验结果复现
- 跨平台数据交换

#### 2. CSV适应度历史 (📊 Export CSV)
**内容**: 适应度曲线数据
```csv
Generation,BestFitness,AvgFitness,Diversity,PathLength,ReachedEnd
0,150.32,85.67,45.23,89,No
1,185.67,95.34,42.11,75,No
2,220.45,110.23,38.90,68,No
...
```

**用途**:
- Excel分析
- 绘制曲线图
- 统计分析软件
- 论文数据表格

#### 3. Markdown报告 (📄 Export Report)
**内容**: 完整分析报告
```markdown
# Genetic Algorithm Experiment Report

## Configuration
- Algorithm: Hybrid GA
- Maze Size: 21×21
- Population: 300
...

## Performance Summary
### Convergence
- First Solution Found: Generation 45
- 90% Optimal Reached: Generation 32
...

## Conclusion
✅ Fast convergence: Solution found early...
⚠️ Path contains loops: Consider...
```

**用途**:
- 实验报告
- 论文附录
- 结果展示
- 优化分析

#### 4. 最佳路径 (🛤️ Export Path)
**内容**: 最佳解路径坐标
```json
{
  "generation": 45,
  "pathLength": 68,
  "path": [[1,1], [1,2], [2,2], ...],
  "reachedEnd": true,
  "exportTime": "2025-10-28T12:00:00Z"
}
```

**用途**:
- 路径复现
- 可视化展示
- 路径对比
- 算法验证

### 使用方法
1. 运行算法至少1代
2. 在右侧面板找到 **"Visualization & Export"** 区域
3. 点击对应导出按钮
4. 文件自动下载到浏览器默认下载目录

### 文件命名规则
- JSON: `maze-ga-experiment-{timestamp}.json`
- CSV: `maze-ga-fitness-{timestamp}.csv`
- Report: `maze-ga-report-{timestamp}.md`
- Path: `best-path-gen{N}-{timestamp}.json`

---

## 📈 性能分析详解

### 自动计算指标（15+）

#### 收敛类指标
```typescript
convergenceGeneration: number     // 首次找到解的代数
convergenceSpeed: number          // 达到90%最优的代数
avgFitnessImprovement: number     // 平均每代改进量
```

#### 时间类指标
```typescript
totalTime: number                 // 总运行时间（ms）
avgGenerationTime: number         // 平均每代时间（ms）
iterationsPerSecond: number       // 迭代速度（iter/s）
```

#### 质量类指标
```typescript
finalPathLength: number           // 最终路径长度
pathUniqueness: number            // 唯一步数比例（0-1）
pathSmoothness: number            // 平滑度（0-1）
```

#### 多样性类指标
```typescript
avgDiversity: number              // 平均多样性
diversityTrend: string            // 趋势（increasing/stable/decreasing）
fitnessVariance: number           // 适应度方差
```

### 分析算法

#### 1. 收敛速度计算
```typescript
// 首次找到解
convergenceGen = history.findIndex(gen => gen.best.reachedEnd)

// 达到90%最优
target = finalBestFitness * 0.9
convergenceSpeed = history.findIndex(gen => gen.bestFitness >= target)
```

#### 2. 多样性趋势
```typescript
firstHalfAvg = avg(diversities[0 : length/2])
secondHalfAvg = avg(diversities[length/2 : end])

if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'increasing'
else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'decreasing'
else trend = 'stable'
```

#### 3. 路径质量
```typescript
// 唯一性
uniqueSteps = Set(path).size
uniqueness = uniqueSteps / pathLength

// 平滑度
turns = countDirectionChanges(path)
smoothness = 1 - (turns / pathLength)
```

### 结论生成逻辑
自动分析并生成优化建议：
- 快速收敛 ✅
- 高质量路径 ✅
- 过早收敛 ⚠️
- 性能良好 ✅

---

## 🎯 使用场景示例

### 场景1: 算法性能对比
```
目的: 对比Standard GA、Adaptive GA、Hybrid GA性能

步骤:
1. 使用相同迷宫运行3种算法
2. 分别导出CSV数据
3. 在Excel中绘制对比曲线图
4. 导出Markdown报告对比指标
5. 使用3D视图直观比较收敛趋势
```

### 场景2: 参数优化实验
```
目的: 找到最佳mutation rate

步骤:
1. 设置变异率0.01, 0.02, 0.05, 0.1, 0.2
2. 每组运行5次，导出JSON数据
3. 使用统计面板记录convergenceGeneration
4. 分析平均收敛代数，选择最优参数
5. 导出最佳配置的完整报告
```

### 场景3: 论文数据准备
```
目的: 为学术论文准备实验数据

步骤:
1. 运行算法记录完整历史
2. 导出CSV用于绘制Figure曲线
3. 导出Markdown报告作为附录
4. 截图3D可视化作为插图
5. 导出JSON作为实验可复现数据
```

### 场景4: 教学演示
```
目的: 向学生展示GA原理

步骤:
1. 运行算法并暂停
2. 展示实时统计面板讲解指标
3. 打开3D视图展示适应度景观
4. 导出报告展示完整分析
5. 使用不同参数对比效果
```

---

## 🔧 高级技巧

### 技巧1: 批量实验
```typescript
// 自动化多次实验
const experiments = [];
for (let i = 0; i < 10; i++) {
  run GA with different seed
  store history in experiments[i]
}
// 导出所有实验数据
experiments.forEach(exp => exportJSON(exp))
```

### 技巧2: 数据后处理
```python
# Python分析导出的CSV
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('maze-ga-fitness-xxx.csv')
plt.plot(df['Generation'], df['BestFitness'])
plt.xlabel('Generation')
plt.ylabel('Best Fitness')
plt.title('Convergence Curve')
plt.show()
```

### 技巧3: 性能基准
```
建立性能基准数据库：
1. 不同迷宫大小的平均收敛代数
2. 不同算法的性能对比
3. 参数敏感性分析
4. 用于指导新实验配置
```

### 技巧4: 3D景观对比
```
同一迷宫不同算法：
1. Standard GA → 平缓起伏
2. Adaptive GA → 后期陡峭
3. Hybrid GA → 早期快速上升
直观展示算法差异
```

---

## 📊 数据格式规范

### JSON Schema
```typescript
interface ExperimentData {
  config: GAConfig;
  algorithmType: string;
  mazeSize: number;
  startTime: number;
  endTime: number;
  totalGenerations: number;
  history: GenerationResult[];
  finalBestPath: Individual;
  statistics: ExperimentStatistics;
}
```

### CSV Format
```
Standard CSV (RFC 4180)
- UTF-8编码
- 逗号分隔
- 带标题行
- 数值保留2位小数
```

### Markdown Format
```
符合CommonMark规范
- ATX风格标题
- 表格对齐
- 代码块标记
- 列表缩进
```

---

## ⚡ 性能优化

### 3D渲染优化
- 使用OffscreenCanvas离屏渲染
- 限制最大顶点数（50×10）
- requestAnimationFrame控制帧率
- 及时dispose释放资源

### 统计计算优化
- 增量计算而非全量重算
- 缓存中间结果
- 使用TypedArray加速
- 异步计算避免阻塞UI

### 导出优化
- 使用Blob异步生成
- 大数据分块处理
- URL.createObjectURL避免内存溢出
- 及时revokeObjectURL释放内存

---

## 🐛 常见问题

### Q1: 3D视图打不开？
**A**: 
- 确保运行至少2代数据
- 检查浏览器是否支持WebGL
- 尝试刷新页面

### Q2: 导出按钮是灰色的？
**A**: 
- 运行算法至少1代
- 等待算法完成或暂停后导出

### Q3: Markdown报告乱码？
**A**: 
- 使用支持UTF-8的编辑器打开
- 推荐Typora、VS Code、Obsidian

### Q4: CSV在Excel中乱码？
**A**: 
- 使用"数据→从文本"导入
- 选择UTF-8编码
- 或使用Google Sheets直接打开

### Q5: 统计面板显示不准？
**A**: 
- 统计基于当前历史数据实时计算
- 运行完整实验后数据最准确
- 暂停状态下数据已固定

---

## 📚 参考资料

### 相关文件
- `src/vis/FitnessLandscape3D.tsx` - 3D可视化组件
- `src/ui/StatisticsPanel.tsx` - 统计面板组件
- `src/utils/DataExporter.ts` - 数据导出工具

### 扩展阅读
- Three.js官方文档: https://threejs.org/docs/
- WebGL性能优化: https://www.khronos.org/webgl/
- CSV规范: RFC 4180
- Markdown规范: CommonMark Spec

---

**版本**: v2.1.0  
**日期**: 2025-10-28  
**作者**: Maze GA Project

🎉 享受可视化与数据分析的乐趣！

