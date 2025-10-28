// 多语言配置
export type Language = 'en' | 'zh-CN' | 'ja';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  }
};

export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * 检测浏览器语言
 */
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('ja')) return 'ja';
  return 'en';
}

/**
 * 保存语言偏好
 */
export function saveLanguagePreference(lang: Language): void {
  localStorage.setItem('preferredLanguage', lang);
}

/**
 * 加载语言偏好
 */
export function loadLanguagePreference(): Language {
  const saved = localStorage.getItem('preferredLanguage') as Language;
  return saved || detectBrowserLanguage();
}

