// Island GA 配置面板
import type { IslandConfig } from '../ga/IslandGA';
import type { Translations } from '../i18n/translations';

interface IslandControlPanelProps {
  config: IslandConfig;
  onChange: (config: IslandConfig) => void;
  disabled?: boolean;
  t: Translations;
}

export function IslandControlPanel({ config, onChange, disabled = false, t }: IslandControlPanelProps) {
  const handleChange = (key: keyof IslandConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <div className="control-group">
        <label>
          {t.islands}: {config.numIslands}
          <span style={{ 
            fontSize: '10px', 
            color: 'var(--nord13)', 
            marginLeft: '5px' 
          }}>
            ({navigator.hardwareConcurrency || 4} {t.coresAvailable})
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
        <label>{t.migrationInterval}: {config.migrationInterval} {t.generations}</label>
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
        <label>{t.migrationSize}: {config.migrationSize} {t.individuals}</label>
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
        <label>{t.migrationTopology}</label>
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
          <option value="ring">{t.ring}</option>
          <option value="star">{t.star}</option>
          <option value="full">{t.full}</option>
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
          ℹ️ {t.islandModelInfo}
        </div>
        <div>• {config.numIslands} {t.parallelPopulations}</div>
        <div>• ~{Math.floor(300 / config.numIslands)} {t.individualsPerIsland}</div>
        <div>• {t.migrationEvery} {config.migrationInterval} {t.generations}</div>
        <div>• {t.expectedSpeedup}: {config.numIslands >= 4 ? '2-3x' : config.numIslands >= 2 ? '1.5-2x' : '1x'}</div>
      </div>
    </div>
  );
}

