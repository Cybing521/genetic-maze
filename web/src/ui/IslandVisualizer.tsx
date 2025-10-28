// Island GA 可视化 - 显示多个岛屿的状态
import type { GenerationResult } from '../types';
import type { Translations } from '../i18n/translations';

interface IslandVisualizerProps {
  islands: GenerationResult[];
  t: Translations;
}

export function IslandVisualizer({ islands, t }: IslandVisualizerProps) {
  if (islands.length === 0) return null;

  const globalBest = islands.reduce((best, island) => 
    island.bestFitness > best.bestFitness ? island : best
  , islands[0]);

  return (
    <div style={{
      background: 'var(--nord1)',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <h4 style={{ 
        marginBottom: '15px', 
        color: 'var(--nord8)',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🏝️ {t.islandStatus}</span>
        <span style={{ 
          fontSize: '11px', 
          color: 'var(--nord13)',
          fontWeight: 'normal'
        }}>
          {islands.length} {t.islandsActive}
        </span>
      </h4>

      <div style={{
        display: 'grid',
        gridTemplateColumns: islands.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
        gap: '10px'
      }}>
        {islands.map((island, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--nord0)',
              padding: '12px',
              borderRadius: '6px',
              border: island === globalBest ? '2px solid var(--nord14)' : '1px solid var(--nord3)',
              position: 'relative'
            }}
          >
            {island === globalBest && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '8px',
                background: 'var(--nord14)',
                color: 'var(--nord0)',
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '8px',
                fontWeight: 700
              }}>
                BEST
              </div>
            )}

            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--nord8)',
              marginBottom: '8px'
            }}>
              {t.island} #{idx + 1}
            </div>

            <div style={{ fontSize: '10px', color: 'var(--nord5)' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <span>{t.generation}:</span>
                <span style={{ fontWeight: 600, color: 'var(--nord8)' }}>
                  {island.generation}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <span>{t.bestFitness}:</span>
                <span style={{ 
                  fontWeight: 600, 
                  color: island.best.reachedEnd ? 'var(--nord14)' : 'var(--nord8)'
                }}>
                  {island.bestFitness.toFixed(0)}
                  {island.best.reachedEnd && ' ✓'}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <span>{t.avgFitness}:</span>
                <span style={{ fontWeight: 600, color: 'var(--nord8)' }}>
                  {island.avgFitness.toFixed(0)}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between'
              }}>
                <span>{t.diversity}:</span>
                <span style={{ 
                  fontWeight: 600, 
                  color: island.diversity > 50 ? 'var(--nord13)' : 
                         island.diversity > 20 ? 'var(--nord8)' : 'var(--nord14)'
                }}>
                  {island.diversity.toFixed(1)}
                </span>
              </div>
            </div>

            {/* 迷你适应度图表 */}
            <div style={{ marginTop: '8px' }}>
              <MiniChart 
                bestFitness={island.bestFitness}
                avgFitness={island.avgFitness}
                maxFitness={globalBest.bestFitness}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 全局统计 */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: 'var(--nord0)',
        borderRadius: '4px',
        fontSize: '11px',
        borderLeft: '3px solid var(--nord14)'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--nord14)', marginBottom: '5px' }}>
          🏆 {t.globalBest}
        </div>
        <div style={{ color: 'var(--nord5)' }}>
          <span>{t.island} #{islands.indexOf(globalBest) + 1}</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>{t.bestFitness}: {globalBest.bestFitness.toFixed(0)}</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>{t.generation}: {globalBest.generation}</span>
          {globalBest.best.reachedEnd && (
            <>
              <span style={{ margin: '0 8px' }}>•</span>
              <span style={{ color: 'var(--nord14)', fontWeight: 600 }}>{t.solved} ✓</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 迷你图表组件
function MiniChart({ bestFitness, avgFitness, maxFitness }: { 
  bestFitness: number; 
  avgFitness: number;
  maxFitness: number;
}) {
  const bestHeight = maxFitness > 0 ? (bestFitness / maxFitness) * 100 : 0;
  const avgHeight = maxFitness > 0 ? (avgFitness / maxFitness) * 100 : 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      height: '30px',
      gap: '4px',
      padding: '5px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '4px'
    }}>
      <div
        title={`Best: ${bestFitness.toFixed(0)}`}
        style={{
          flex: 1,
          height: `${bestHeight}%`,
          background: 'linear-gradient(180deg, var(--nord8), var(--nord10))',
          borderRadius: '2px',
          minHeight: '2px'
        }}
      />
      <div
        title={`Avg: ${avgFitness.toFixed(0)}`}
        style={{
          flex: 1,
          height: `${avgHeight}%`,
          background: 'linear-gradient(180deg, var(--nord12), var(--nord13))',
          borderRadius: '2px',
          minHeight: '2px',
          opacity: 0.7
        }}
      />
    </div>
  );
}

