// 统计分析面板
import { useEffect, useState } from 'react';
import type { GenerationResult } from '../types';
import type { ExperimentStatistics } from '../utils/DataExporter';
import { DataExporter } from '../utils/DataExporter';

interface StatisticsPanelProps {
  history: GenerationResult[];
  startTime: number;
  isRunning: boolean;
}

export function StatisticsPanel({ history, startTime, isRunning }: StatisticsPanelProps) {
  const [stats, setStats] = useState<ExperimentStatistics | null>(null);

  useEffect(() => {
    if (history.length === 0) {
      setStats(null);
      return;
    }

    const endTime = Date.now();
    const calculated = DataExporter.calculateStatistics(
      history,
      { populationSize: 300, maxGenerations: 500, mutationRate: 0.02, crossoverRate: 0.8, elitismCount: 15, maxSteps: 500, useAdaptive: true },
      startTime,
      endTime
    );
    setStats(calculated);
  }, [history, startTime]);

  if (!stats || history.length === 0) {
    return (
      <div style={{
        background: 'var(--nord1)',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h4 style={{ marginBottom: '15px', color: 'var(--nord8)' }}>Statistics</h4>
        <p style={{ color: 'var(--nord4)', fontSize: '13px' }}>
          Run the algorithm to see statistics...
        </p>
      </div>
    );
  }

  const currentGen = history[history.length - 1];

  return (
    <div style={{
      background: 'var(--nord1)',
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <h4 style={{ marginBottom: '15px', color: 'var(--nord8)', fontSize: '16px' }}>
        📊 Real-time Statistics
      </h4>

      {/* 收敛性能 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          color: 'var(--nord13)', 
          fontSize: '12px', 
          fontWeight: 600,
          marginBottom: '8px'
        }}>
          CONVERGENCE
        </div>
        <StatRow 
          label="First Solution" 
          value={stats.convergenceGeneration < history.length ? `Gen ${stats.convergenceGeneration}` : 'Not found'}
          good={stats.convergenceGeneration < history.length}
        />
        <StatRow 
          label="90% Optimal" 
          value={`Gen ${stats.convergenceSpeed}`}
          good={stats.convergenceSpeed < history.length * 0.5}
        />
        <StatRow 
          label="Avg Improvement" 
          value={`+${stats.avgFitnessImprovement.toFixed(2)}/gen`}
        />
      </div>

      {/* 时间性能 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          color: 'var(--nord13)', 
          fontSize: '12px', 
          fontWeight: 600,
          marginBottom: '8px'
        }}>
          PERFORMANCE
        </div>
        <StatRow 
          label="Total Time" 
          value={`${(stats.totalTime / 1000).toFixed(2)}s`}
        />
        <StatRow 
          label="Speed" 
          value={`${stats.iterationsPerSecond.toFixed(1)} iter/s`}
          good={stats.iterationsPerSecond > 5}
        />
        <StatRow 
          label="Avg Gen Time" 
          value={`${stats.avgGenerationTime.toFixed(0)}ms`}
        />
      </div>

      {/* 解的质量 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          color: 'var(--nord13)', 
          fontSize: '12px', 
          fontWeight: 600,
          marginBottom: '8px'
        }}>
          SOLUTION QUALITY
        </div>
        <StatRow 
          label="Path Length" 
          value={`${stats.finalPathLength} steps`}
        />
        <StatRow 
          label="Uniqueness" 
          value={`${(stats.pathUniqueness * 100).toFixed(1)}%`}
          good={stats.pathUniqueness > 0.9}
        />
        <StatRow 
          label="Smoothness" 
          value={`${(100 - stats.pathSmoothness * 100).toFixed(1)}%`}
          good={stats.pathSmoothness < 0.3}
        />
        <StatRow 
          label="Status" 
          value={currentGen.best.reachedEnd ? '✅ Solved' : '⏳ Searching'}
          good={currentGen.best.reachedEnd}
        />
      </div>

      {/* 多样性 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          color: 'var(--nord13)', 
          fontSize: '12px', 
          fontWeight: 600,
          marginBottom: '8px'
        }}>
          DIVERSITY
        </div>
        <StatRow 
          label="Average" 
          value={stats.avgDiversity.toFixed(2)}
        />
        <StatRow 
          label="Trend" 
          value={
            stats.diversityTrend === 'increasing' ? '📈 Increasing' :
            stats.diversityTrend === 'decreasing' ? '📉 Decreasing' :
            '➡️ Stable'
          }
          good={stats.diversityTrend !== 'decreasing' || stats.convergenceGeneration < history.length}
        />
        <StatRow 
          label="Variance" 
          value={stats.fitnessVariance.toFixed(2)}
        />
      </div>

      {/* 实时指标 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          color: 'var(--nord13)', 
          fontSize: '12px', 
          fontWeight: 600,
          marginBottom: '8px'
        }}>
          CURRENT STATUS
        </div>
        <StatRow 
          label="Generation" 
          value={`${currentGen.generation} / ${currentGen.generation}`}
        />
        <StatRow 
          label="Best Fitness" 
          value={currentGen.bestFitness.toFixed(0)}
        />
        <StatRow 
          label="Population Avg" 
          value={currentGen.avgFitness.toFixed(0)}
        />
        <StatRow 
          label="Current Diversity" 
          value={currentGen.diversity.toFixed(2)}
        />
      </div>

      {/* 建议 */}
      {!isRunning && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'var(--nord0)',
          borderLeft: '3px solid var(--nord13)',
          borderRadius: '4px'
        }}>
          <div style={{ 
            color: 'var(--nord13)', 
            fontSize: '11px', 
            fontWeight: 600,
            marginBottom: '5px'
          }}>
            💡 RECOMMENDATIONS
          </div>
          {generateRecommendations(stats, currentGen).map((rec, idx) => (
            <div key={idx} style={{ 
              color: 'var(--nord4)', 
              fontSize: '11px',
              marginBottom: '3px'
            }}>
              • {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px',
      fontSize: '12px'
    }}>
      <span style={{ color: 'var(--nord5)' }}>{label}</span>
      <span style={{ 
        color: good === undefined ? 'var(--nord8)' : good ? '#A3BE8C' : '#EBCB8B',
        fontWeight: 600
      }}>
        {value}
      </span>
    </div>
  );
}

function generateRecommendations(stats: ExperimentStatistics, currentGen: any): string[] {
  const recommendations: string[] = [];

  if (stats.convergenceGeneration === currentGen.generation && !currentGen.best.reachedEnd) {
    recommendations.push('No solution found yet. Try increasing max generations or population size.');
  }

  if (stats.pathUniqueness < 0.8) {
    recommendations.push('Path contains many loops. Enable "Insertion" mutation to remove loops.');
  }

  if (stats.diversityTrend === 'decreasing' && stats.convergenceGeneration > 50) {
    recommendations.push('Premature convergence detected. Increase mutation rate to 5-10%.');
  }

  if (stats.convergenceSpeed > currentGen.generation * 0.8) {
    recommendations.push('Slow convergence. Try using Hybrid GA with A* initialization.');
  }

  if (stats.pathSmoothness > 0.4) {
    recommendations.push('Path has many turns. Use "Local Search" mutation for path optimization.');
  }

  if (stats.iterationsPerSecond < 3) {
    recommendations.push('Low performance. Reduce population size or disable detailed visualization.');
  }

  if (recommendations.length === 0 && currentGen.best.reachedEnd) {
    recommendations.push('✅ Excellent performance! Solution found with good quality.');
  }

  return recommendations;
}

