// 参数预设选择器
import { PARAMETER_PRESETS, type PresetConfig } from '../config/presets';
import type { Translations } from '../i18n/translations';

interface PresetSelectorProps {
  onSelectPreset: (presetName: string) => void;
  disabled?: boolean;
  t: Translations;
}

export function PresetSelector({ onSelectPreset, disabled = false, t }: PresetSelectorProps) {
  const presets = Object.values(PARAMETER_PRESETS);

  return (
    <div style={{ marginTop: '15px', marginBottom: '15px' }}>
      <label style={{
        display: 'block',
        marginBottom: '10px',
        fontSize: '13px',
        color: 'var(--nord5)',
        fontWeight: 600
      }}>
        {t.parameterPresets}
      </label>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      }}>
        {presets.map((preset: PresetConfig) => (
          <button
            key={preset.name}
            onClick={() => onSelectPreset(preset.name)}
            disabled={disabled}
            title={preset.description}
            style={{
              padding: '10px 12px',
              background: 'var(--nord0)',
              border: '1px solid var(--nord3)',
              borderRadius: '6px',
              color: 'var(--nord5)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              opacity: disabled ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = 'var(--nord2)';
                e.currentTarget.style.borderColor = 'var(--nord8)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--nord0)';
              e.currentTarget.style.borderColor = 'var(--nord3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '18px' }}>{preset.icon}</span>
            <span>{preset.displayName}</span>
          </button>
        ))}
      </div>

      <div style={{
        marginTop: '8px',
        padding: '8px',
        background: 'var(--nord0)',
        borderRadius: '4px',
        fontSize: '10px',
        color: 'var(--nord4)',
        textAlign: 'center'
      }}>
        {t.clickPreset}
      </div>
    </div>
  );
}

