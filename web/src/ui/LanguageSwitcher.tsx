// 语言切换器
import { LANGUAGES, type Language } from '../i18n/languages';

interface LanguageSwitcherProps {
  currentLang: Language;
  onChange: (lang: Language) => void;
}

export function LanguageSwitcher({ currentLang, onChange }: LanguageSwitcherProps) {
  const langs = Object.values(LANGUAGES);

  return (
    <div style={{
      display: 'flex',
      gap: '5px',
      alignItems: 'center'
    }}>
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          title={lang.nativeName}
          style={{
            background: currentLang === lang.code ? 'var(--nord8)' : 'transparent',
            border: `1px solid ${currentLang === lang.code ? 'var(--nord8)' : 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: '6px',
            padding: '6px 12px',
            color: currentLang === lang.code ? 'var(--nord0)' : 'var(--nord5)',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: currentLang === lang.code ? 600 : 400,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onMouseEnter={(e) => {
            if (currentLang !== lang.code) {
              e.currentTarget.style.background = 'rgba(136, 192, 208, 0.1)';
              e.currentTarget.style.borderColor = 'var(--nord8)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentLang !== lang.code) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
          }}
        >
          <span style={{ fontSize: '16px' }}>{lang.flag}</span>
          <span>{lang.code === 'zh-CN' ? '中文' : lang.code === 'ja' ? '日本語' : 'EN'}</span>
        </button>
      ))}
    </div>
  );
}

