// 数据导出工具
import type { GenerationResult, GAConfig } from '../types';

export interface ExperimentData {
  config: GAConfig;
  algorithmType: string;
  mazeSize: number;
  startTime: number;
  endTime: number;
  totalGenerations: number;
  history: GenerationResult[];
  finalBestPath: any;
  statistics: ExperimentStatistics;
}

export interface ExperimentStatistics {
  // 收敛性能
  convergenceGeneration: number; // 首次找到解的代数
  finalBestFitness: number;
  avgFitnessImprovement: number;
  
  // 时间性能
  totalTime: number; // 毫秒
  avgGenerationTime: number;
  iterationsPerSecond: number;
  
  // 解的质量
  finalPathLength: number;
  pathUniqueness: number; // 唯一步数比例
  pathSmoothness: number; // 转向次数
  
  // 多样性
  avgDiversity: number;
  diversityTrend: 'increasing' | 'stable' | 'decreasing';
  
  // 稳定性
  fitnessVariance: number;
  convergenceSpeed: number; // 达到90%最优解的代数
}

export class DataExporter {
  /**
   * 计算实验统计数据
   */
  static calculateStatistics(
    history: GenerationResult[],
    _config: GAConfig,
    startTime: number,
    endTime: number
  ): ExperimentStatistics {
    if (history.length === 0) {
      return this.getEmptyStatistics();
    }

    const totalTime = endTime - startTime;
    const finalGen = history[history.length - 1];
    
    // 收敛代数：首次找到解
    const convergenceGen = history.findIndex(gen => gen.best.reachedEnd);
    
    // 适应度改进
    const firstFitness = history[0].bestFitness;
    const lastFitness = finalGen.bestFitness;
    const avgImprovement = (lastFitness - firstFitness) / history.length;

    // 多样性趋势
    const diversities = history.map(gen => gen.diversity);
    const firstHalfAvg = diversities.slice(0, Math.floor(diversities.length / 2))
      .reduce((a, b) => a + b, 0) / Math.floor(diversities.length / 2);
    const secondHalfAvg = diversities.slice(Math.floor(diversities.length / 2))
      .reduce((a, b) => a + b, 0) / Math.ceil(diversities.length / 2);
    
    let diversityTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (secondHalfAvg > firstHalfAvg * 1.1) diversityTrend = 'increasing';
    else if (secondHalfAvg < firstHalfAvg * 0.9) diversityTrend = 'decreasing';

    // 路径分析
    const finalPath = finalGen.best.path;
    const uniqueSteps = new Set(finalPath.map(p => `${p[0]},${p[1]}`)).size;
    const pathUniqueness = uniqueSteps / finalPath.length;
    
    // 计算转向次数
    let turns = 0;
    for (let i = 2; i < finalPath.length; i++) {
      const dx1 = finalPath[i-1][1] - finalPath[i-2][1];
      const dy1 = finalPath[i-1][0] - finalPath[i-2][0];
      const dx2 = finalPath[i][1] - finalPath[i-1][1];
      const dy2 = finalPath[i][0] - finalPath[i-1][0];
      if (dx1 !== dx2 || dy1 !== dy2) turns++;
    }

    // 适应度方差
    const fitnesses = history.map(gen => gen.bestFitness);
    const avgFitness = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length;
    const variance = fitnesses.reduce((sum, f) => sum + Math.pow(f - avgFitness, 2), 0) / fitnesses.length;

    // 收敛速度：达到90%最优的代数
    const target = lastFitness * 0.9;
    const convergenceSpeed = history.findIndex(gen => gen.bestFitness >= target);

    return {
      convergenceGeneration: convergenceGen >= 0 ? convergenceGen : history.length,
      finalBestFitness: lastFitness,
      avgFitnessImprovement: avgImprovement,
      
      totalTime,
      avgGenerationTime: totalTime / history.length,
      iterationsPerSecond: (history.length / totalTime) * 1000,
      
      finalPathLength: finalPath.length,
      pathUniqueness,
      pathSmoothness: finalPath.length > 0 ? turns / finalPath.length : 0,
      
      avgDiversity: diversities.reduce((a, b) => a + b, 0) / diversities.length,
      diversityTrend,
      
      fitnessVariance: variance,
      convergenceSpeed: convergenceSpeed >= 0 ? convergenceSpeed : history.length
    };
  }

  /**
   * 导出为JSON
   */
  static exportJSON(data: ExperimentData): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadBlob(blob, `maze-ga-experiment-${Date.now()}.json`);
  }

  /**
   * 导出为CSV（适应度历史）
   */
  static exportCSV(history: GenerationResult[]): void {
    const headers = ['Generation', 'BestFitness', 'AvgFitness', 'Diversity', 'PathLength', 'ReachedEnd'];
    const rows = history.map(gen => [
      gen.generation,
      gen.bestFitness.toFixed(2),
      gen.avgFitness.toFixed(2),
      gen.diversity.toFixed(2),
      gen.best.path.length,
      gen.best.reachedEnd ? 'Yes' : 'No'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    this.downloadBlob(blob, `maze-ga-fitness-${Date.now()}.csv`);
  }

  /**
   * 导出为Markdown报告
   */
  static exportMarkdownReport(data: ExperimentData): void {
    const { config, algorithmType, mazeSize, statistics, history } = data;
    
    const report = `# Genetic Algorithm Experiment Report

## Configuration

- **Algorithm**: ${algorithmType}
- **Maze Size**: ${mazeSize}×${mazeSize}
- **Population Size**: ${config.populationSize}
- **Mutation Rate**: ${(config.mutationRate * 100).toFixed(1)}%
- **Crossover Rate**: ${(config.crossoverRate * 100).toFixed(1)}%
- **Elitism**: ${config.elitismCount} (${((config.elitismCount/config.populationSize)*100).toFixed(1)}%)
- **Max Steps**: ${config.maxSteps}
- **Max Generations**: ${config.maxGenerations}

## Performance Summary

### Convergence
- **First Solution Found**: Generation ${statistics.convergenceGeneration}
- **90% Optimal Reached**: Generation ${statistics.convergenceSpeed}
- **Final Best Fitness**: ${statistics.finalBestFitness.toFixed(2)}
- **Avg Improvement/Gen**: ${statistics.avgFitnessImprovement.toFixed(2)}

### Time Performance
- **Total Time**: ${(statistics.totalTime / 1000).toFixed(2)}s
- **Avg Time/Generation**: ${statistics.avgGenerationTime.toFixed(2)}ms
- **Iterations/Second**: ${statistics.iterationsPerSecond.toFixed(2)}

### Solution Quality
- **Path Length**: ${statistics.finalPathLength} steps
- **Path Uniqueness**: ${(statistics.pathUniqueness * 100).toFixed(1)}%
- **Path Smoothness**: ${(statistics.pathSmoothness * 100).toFixed(1)}% turns
${data.finalBestPath.reachedEnd ? '✅ **Solution Found**' : '❌ **No Solution**'}

### Diversity Analysis
- **Average Diversity**: ${statistics.avgDiversity.toFixed(2)}
- **Diversity Trend**: ${statistics.diversityTrend}
- **Fitness Variance**: ${statistics.fitnessVariance.toFixed(2)}

## Generation History

| Gen | Best Fitness | Avg Fitness | Diversity | Path Length | Status |
|-----|--------------|-------------|-----------|-------------|--------|
${history.slice(0, 10).map(gen => 
  `| ${gen.generation} | ${gen.bestFitness.toFixed(2)} | ${gen.avgFitness.toFixed(2)} | ${gen.diversity.toFixed(2)} | ${gen.best.path.length} | ${gen.best.reachedEnd ? '✅' : '⏳'} |`
).join('\n')}
${history.length > 10 ? `| ... | ... | ... | ... | ... | ... |\n` : ''}
${history.length > 10 ? 
  `| ${history[history.length-1].generation} | ${history[history.length-1].bestFitness.toFixed(2)} | ${history[history.length-1].avgFitness.toFixed(2)} | ${history[history.length-1].diversity.toFixed(2)} | ${history[history.length-1].best.path.length} | ${history[history.length-1].best.reachedEnd ? '✅' : '⏳'} |`
: ''}

## Conclusion

${this.generateConclusion(statistics)}

---

*Generated on ${new Date().toLocaleString()}*
*Maze GA Project v2.0*
`;

    const blob = new Blob([report], { type: 'text/markdown' });
    this.downloadBlob(blob, `maze-ga-report-${Date.now()}.md`);
  }

  /**
   * 导出最佳路径（JSON）
   */
  static exportBestPath(path: any[], generation: number): void {
    const data = {
      generation,
      pathLength: path.length,
      path,
      reachedEnd: true,
      exportTime: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadBlob(blob, `best-path-gen${generation}-${Date.now()}.json`);
  }

  /**
   * 生成结论
   */
  private static generateConclusion(stats: ExperimentStatistics): string {
    const conclusions: string[] = [];

    if (stats.convergenceGeneration < stats.convergenceSpeed * 0.5) {
      conclusions.push('✅ Fast convergence: Solution found early in the evolution process.');
    } else {
      conclusions.push('⚠️ Slow convergence: Consider increasing mutation rate or population size.');
    }

    if (stats.pathUniqueness > 0.9) {
      conclusions.push('✅ High-quality path: Minimal backtracking detected.');
    } else {
      conclusions.push('⚠️ Path contains loops: Consider enabling loop removal mutation.');
    }

    if (stats.diversityTrend === 'decreasing' && stats.convergenceGeneration > 50) {
      conclusions.push('⚠️ Premature convergence detected: Diversity decreased too quickly.');
    }

    if (stats.iterationsPerSecond > 10) {
      conclusions.push(`✅ Good performance: ${stats.iterationsPerSecond.toFixed(1)} iterations/second.`);
    }

    return conclusions.join('\n\n');
  }

  /**
   * 下载Blob
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 空统计数据
   */
  private static getEmptyStatistics(): ExperimentStatistics {
    return {
      convergenceGeneration: 0,
      finalBestFitness: 0,
      avgFitnessImprovement: 0,
      totalTime: 0,
      avgGenerationTime: 0,
      iterationsPerSecond: 0,
      finalPathLength: 0,
      pathUniqueness: 0,
      pathSmoothness: 0,
      avgDiversity: 0,
      diversityTrend: 'stable',
      fitnessVariance: 0,
      convergenceSpeed: 0
    };
  }
}

