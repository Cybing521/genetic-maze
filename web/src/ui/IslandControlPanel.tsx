// Island GA 配置面板
import type { IslandConfig } from '../ga/IslandGA';

interface IslandControlPanelProps {
  config: IslandConfig;
  onChange: (config: IslandConfig) => void;
  disabled?: boolean;
}

export function IslandControlPanel({ config, onChange, disabled = false }: IslandControlPanelProps) {
  const handleChange = (key: keyof IslandConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <div className="control-group">
        <label>
          Number of Islands: {config.numIslands}
          <span style={{ 
            fontSize: '10px', 
            color: 'var(--nord13)', 
            marginLeft: '5px' 
          }}>
            ({navigator.hardwareConcurrency || 4} cores available)
          </span>
        </label>
        <input
          type="range"
          min="2"
          max={Math.min(navigator.hardwareConcurrency || 4, 8)}
          step="1"
          value={config.numIslands}
          onChange={(e) => handleChange('numIslands', parseInt(e.target.value))}
          disabled={disabled}
        />
      </div>

      <div className="control-group">
        <label>Migration Interval: {config.migrationInterval} generations</label>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={config.migrationInterval}
          onChange={(e) => handleChange('migrationInterval', parseInt(e.target.value))}
          disabled={disabled}
        />
      </div>

      <div className="control-group">
        <label>Migration Size: {config.migrationSize} individual(s)</label>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={config.migrationSize}
          onChange={(e) => handleChange('migrationSize', parseInt(e.target.value))}
          disabled={disabled}
        />
      </div>

      <div className="control-group">
        <label>Migration Topology</label>
        <select
          value={config.migrationTopology}
          onChange={(e) => handleChange('migrationTopology', e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            background: 'var(--nord0)',
            color: 'var(--nord5)',
            border: '1px solid var(--nord3)',
            fontSize: '13px'
          }}
        >
          <option value="ring">Ring (环形) - 顺序迁移</option>
          <option value="star">Star (星形) - 与最优岛交换</option>
          <option value="full">Full (全连接) - 两两交换</option>
        </select>
      </div>

      <div style={{
        marginTop: '10px',
        padding: '10px',
        background: 'var(--nord0)',
        borderRadius: '4px',
        borderLeft: '3px solid var(--nord14)',
        fontSize: '11px',
        color: 'var(--nord4)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '5px', color: 'var(--nord14)' }}>
          ℹ️ Island Model Info
        </div>
        <div>• {config.numIslands} parallel populations</div>
        <div>• ~{Math.floor(300 / config.numIslands)} individuals/island</div>
        <div>• Migration every {config.migrationInterval} generations</div>
        <div>• Expected speedup: {config.numIslands >= 4 ? '2-3x' : config.numIslands >= 2 ? '1.5-2x' : '1x'}</div>
      </div>
    </div>
  );
}

