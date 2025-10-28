# 多语言国际化（i18n）实现指南

## 🌍 方案概述

本项目采用**轻量级自定义i18n方案**，无需额外依赖库，完全基于React Hooks实现。

### 为什么不用i18next等库？
- ✅ **零依赖**: 不增加bundle大小
- ✅ **完全可控**: 自定义翻译逻辑
- ✅ **类型安全**: TypeScript全链路类型检查
- ✅ **性能优化**: 无额外抽象层开销
- ✅ **简单易懂**: 代码量少，易于维护

---

## 🏗️ 架构设计

### 核心组件

```
i18n系统架构:

┌─────────────────────────────────────┐
│        languages.ts                 │
│  - 语言配置                         │
│  - 浏览器语言检测                   │
│  - localStorage持久化               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       translations.ts               │
│  - 所有翻译文本                     │
│  - 3种语言（en/zh-CN/ja）           │
│  - TypeScript类型定义               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      useTranslation.ts              │
│  - React Hook                       │
│  - 提供t对象和切换函数              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       LanguageSwitcher.tsx          │
│  - UI语言切换组件                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│           App.tsx                   │
│  - 使用t.xxx获取翻译文本            │
│  - 传递t给子组件                    │
└─────────────────────────────────────┘
```

---

## 📁 文件结构

```
web/src/
├── i18n/                          ← i18n核心
│   ├── languages.ts              ← 语言配置
│   ├── translations.ts           ← 翻译文本
│   └── useTranslation.ts         ← React Hook
├── ui/
│   └── LanguageSwitcher.tsx      ← 语言切换UI
└── App.tsx                        ← 使用i18n
```

---

## 🔧 实现细节

### 1. 语言配置 (languages.ts)

```typescript
// 定义支持的语言类型
export type Language = 'en' | 'zh-CN' | 'ja';

// 语言配置接口
export interface LanguageConfig {
  code: Language;
  name: string;        // 英文名
  nativeName: string;  // 本地名
  flag: string;        // 旗帜emoji
}

// 语言列表
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

// 浏览器语言检测
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language;
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('ja')) return 'ja';
  return 'en';
}

// localStorage持久化
export function saveLanguagePreference(lang: Language): void {
  localStorage.setItem('preferredLanguage', lang);
}

export function loadLanguagePreference(): Language {
  const saved = localStorage.getItem('preferredLanguage') as Language;
  return saved || detectBrowserLanguage();
}
```

**设计要点**:
- 🎯 类型安全：Language类型确保只能是支持的语言
- 💾 持久化：用户选择保存到localStorage
- 🌐 智能检测：自动检测浏览器语言
- 🚀 易扩展：添加新语言只需加一项配置

---

### 2. 翻译文本 (translations.ts)

```typescript
// 翻译接口 - 定义所有需要翻译的字段
export interface Translations {
  title: string;
  generation: string;
  bestFitness: string;
  // ... 100+ 字段
}

// 翻译内容
export const translations: Record<Language, Translations> = {
  'en': {
    title: 'Genetic Algorithm Maze Solver',
    generation: 'Generation',
    bestFitness: 'Best Fitness',
    // ...
  },
  'zh-CN': {
    title: '遗传算法迷宫求解器',
    generation: '代数',
    bestFitness: '最佳适应度',
    // ...
  },
  'ja': {
    title: '遺伝的アルゴリズム迷路ソルバー',
    generation: '世代',
    bestFitness: '最良適応度',
    // ...
  }
};
```

**设计要点**:
- 📝 接口优先：Translations接口确保所有语言字段一致
- 🔍 IDE支持：TypeScript提供自动补全
- ⚠️ 编译检查：缺失翻译会报错
- 📦 集中管理：所有翻译在一个文件

---

### 3. React Hook (useTranslation.ts)

```typescript
export function useTranslation() {
  // 1. 加载保存的语言偏好
  const [currentLang, setCurrentLang] = useState<Language>(
    loadLanguagePreference()
  );
  
  // 2. 根据语言获取翻译文本
  const [t, setT] = useState<Translations>(
    translations[currentLang]
  );

  // 3. 语言变化时更新翻译
  useEffect(() => {
    setT(translations[currentLang]);
  }, [currentLang]);

  // 4. 切换语言函数
  const changeLanguage = (lang: Language) => {
    setCurrentLang(lang);
    saveLanguagePreference(lang); // 持久化
  };

  // 5. 返回t对象和切换函数
  return {
    t,              // 翻译文本对象
    currentLang,    // 当前语言
    changeLanguage  // 切换函数
  };
}
```

**设计要点**:
- 🎣 Hook模式：符合React最佳实践
- 💾 自动保存：切换语言自动持久化
- 🔄 响应式：语言变化立即生效
- 🎯 简洁API：只暴露必要接口

---

### 4. 语言切换器 (LanguageSwitcher.tsx)

```typescript
export function LanguageSwitcher({ currentLang, onChange }) {
  const langs = Object.values(LANGUAGES);

  return (
    <div>
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          style={{
            background: currentLang === lang.code 
              ? 'var(--nord8)'   // 高亮当前语言
              : 'transparent'
          }}
        >
          <span>{lang.flag}</span>  {/* 旗帜 */}
          <span>{lang.code === 'zh-CN' ? '中文' : ...}</span>
        </button>
      ))}
    </div>
  );
}
```

**设计要点**:
- 🎨 视觉反馈：当前语言高亮
- 🌍 国旗标识：直观易识别
- 🖱️ 悬停效果：交互友好
- 📱 响应式：适配小屏幕

---

## 💻 使用方式

### 在App.tsx中使用

```typescript
function App() {
  // 1. 使用Hook获取翻译
  const { t, currentLang, changeLanguage } = useTranslation();

  // 2. 在JSX中使用t对象
  return (
    <div>
      <h1>{t.title}</h1>
      <button>{t.start}</button>
      <label>{t.population}: {value}</label>
      
      {/* 3. 添加语言切换器 */}
      <LanguageSwitcher 
        currentLang={currentLang}
        onChange={changeLanguage}
      />
    </div>
  );
}
```

### 在子组件中使用

```typescript
// 方式1: 父组件传递t对象（推荐）
function ChildComponent({ t }: { t: Translations }) {
  return <div>{t.someText}</div>;
}

// 父组件
<ChildComponent t={t} />

// 方式2: 子组件自己调用Hook
function ChildComponent() {
  const { t } = useTranslation();
  return <div>{t.someText}</div>;
}
```

**推荐方式1**的原因：
- 避免多次调用Hook
- 组件更纯粹（props明确）
- 易于测试

---

## 🔄 工作流程

### 用户切换语言时的流程

```
1. 用户点击 🇨🇳 按钮
   ↓
2. onChange('zh-CN') 被调用
   ↓
3. changeLanguage('zh-CN') 执行
   ↓
4. setCurrentLang('zh-CN')
   ↓
5. localStorage.setItem('preferredLanguage', 'zh-CN')
   ↓
6. useEffect触发
   ↓
7. setT(translations['zh-CN'])
   ↓
8. 组件重新渲染，显示中文 ✅
```

### 首次访问时的流程

```
1. App组件加载
   ↓
2. useTranslation() 调用
   ↓
3. loadLanguagePreference() 检查localStorage
   ↓
4. 如果有保存 → 使用保存的语言
   如果没有 → detectBrowserLanguage()
   ↓
5. 自动选择最合适的语言 ✅
```

---

## 🎯 关键技术点

### 1. TypeScript类型安全

```typescript
// ✅ 编译时检查
interface Translations {
  title: string;
  start: string;
  // ...
}

// 缺失翻译会报错
const translations: Record<Language, Translations> = {
  'en': { 
    title: 'xxx',
    // start: 'xxx',  ← 缺失会报错！
  }
};

// 使用时有自动补全
t.title  // ✅ IDE自动提示
t.unknown  // ❌ 编译错误
```

### 2. 响应式设计

```typescript
// Hook确保语言变化立即生效
useEffect(() => {
  setT(translations[currentLang]);
}, [currentLang]);

// 所有使用t的组件自动更新
<h1>{t.title}</h1>  ← 语言切换时自动变化
```

### 3. 性能优化

```typescript
// 翻译文本是静态对象，不重复创建
const translations = { ... };  // 只创建一次

// Hook中使用useState缓存
const [t, setT] = useState(...);  // 避免每次render重新计算

// 子组件接收t作为props，避免重复调用Hook
<Child t={t} />  // 推荐
// vs
<Child />  // 内部调用useTranslation()  ← 不推荐
```

### 4. localStorage持久化

```typescript
// 用户选择保存在浏览器
saveLanguagePreference('zh-CN');

// 下次访问自动加载
const lang = loadLanguagePreference();  // 'zh-CN'

// 跨会话保持语言设置 ✅
```

---

## 📝 添加新翻译的步骤

### 步骤1: 在Translations接口中添加字段

```typescript
// web/src/i18n/translations.ts
export interface Translations {
  // ...现有字段
  newFeature: string;  // ← 新增
}
```

### 步骤2: 为每种语言添加翻译

```typescript
export const translations: Record<Language, Translations> = {
  'en': {
    // ...
    newFeature: 'New Feature',
  },
  'zh-CN': {
    // ...
    newFeature: '新功能',
  },
  'ja': {
    // ...
    newFeature: '新機能',
  }
};
```

### 步骤3: 在组件中使用

```typescript
function MyComponent({ t }: { t: Translations }) {
  return <div>{t.newFeature}</div>;
}
```

**TypeScript会自动检查**:
- ❌ 如果忘记添加某个语言的翻译 → 编译错误
- ❌ 如果拼写错误 → IDE红色波浪线
- ✅ 自动补全 → 输入t.后立即提示

---

## 🌍 支持的语言

### 当前支持
1. **English (en)** 🇺🇸
   - 默认语言
   - 完整翻译（100+字段）
   
2. **简体中文 (zh-CN)** 🇨🇳
   - 完整翻译
   - 适合中国用户
   
3. **日本語 (ja)** 🇯🇵
   - 完整翻译
   - 适合日本用户

### 添加新语言（例如韩语）

```typescript
// Step 1: 在Language类型中添加
export type Language = 'en' | 'zh-CN' | 'ja' | 'ko';

// Step 2: 在LANGUAGES中添加配置
export const LANGUAGES = {
  // ...
  'ko': {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷'
  }
};

// Step 3: 在translations中添加翻译
export const translations = {
  // ...
  'ko': {
    title: '유전 알고리즘 미로 솔버',
    // ... 翻译所有字段
  }
};

// 完成！TypeScript会确保你翻译了所有字段
```

---

## 🎨 UI集成示例

### HUD标题

```typescript
// 之前
<h1>Genetic Algorithm Maze Solver</h1>

// 现在
<h1>{t.title}</h1>

// 效果:
// en: Genetic Algorithm Maze Solver
// zh-CN: 遗传算法迷宫求解器
// ja: 遺伝的アルゴリズム迷路ソルバー
```

### 按钮文本

```typescript
// 之前
<button>{isRunning ? 'Running...' : 'Start'}</button>

// 现在
<button>{isRunning ? t.running : t.start}</button>

// 效果:
// en: Running... / Start
// zh-CN: 运行中... / 开始
// ja: 実行中... / 開始
```

### 带变量的文本

```typescript
// 方式1: 字符串拼接
<label>{t.population}: {config.populationSize}</label>

// 方式2: 模板字符串
<label>{`${t.mazeSize}: ${mazeSize}×${mazeSize}`}</label>

// 效果:
// en: Population: 300
// zh-CN: 种群大小: 300
// ja: 集団サイズ: 300
```

---

## 🔍 已翻译的区域

### ✅ HUD区域
- [x] 标题
- [x] 代数、适应度、多样性、步数
- [x] 难度显示
- [x] FPS显示
- [x] 状态（SUCCESS/EVOLVING）

### ✅ 控制面板
- [x] 所有section标题
- [x] 算法类型选项
- [x] 所有算子名称
- [x] 参数标签
- [x] 按钮文本

### ✅ Island GA
- [x] 配置参数标签
- [x] 拓扑选项
- [x] 状态显示
- [x] 迷你图表

### ✅ 数据导出
- [x] 按钮文本
- [x] Toast通知

### ✅ 帮助面板
- [x] 标题
- [x] 快捷键说明
- [x] 分类标签
- [x] 提示文本

### ✅ 3D可视化
- [x] 标题
- [x] 操作提示
- [x] 按钮文本

### ✅ 参数预设
- [x] 预设名称
- [x] 提示文本

### ✅ 统计面板
- [x] 标题和分类
- [x] 所有指标名称
- [x] 状态文本

---

## 🎯 优势分析

### vs i18next等库

| 特性 | 自定义方案 | i18next |
|------|-----------|---------|
| Bundle大小 | +0KB | +50KB |
| 学习成本 | 极低 | 中等 |
| 类型安全 | 完美 | 需要配置 |
| 性能 | 最优 | 良好 |
| 灵活性 | 完全可控 | 高级但复杂 |
| 维护成本 | 低 | 中 |

### vs 内联多语言

```typescript
// ❌ 内联方式（不推荐）
<h1>
  {lang === 'en' ? 'Title' : 
   lang === 'zh' ? '标题' : 
   'タイトル'}
</h1>

// ✅ i18n方式（推荐）
<h1>{t.title}</h1>
```

**i18n方式的优势**:
- 代码更简洁
- 翻译集中管理
- 易于维护
- IDE支持好

---

## 🚀 性能特性

### 1. 懒加载（可选，未实现）

```typescript
// 当前：所有语言一次加载
import { translations } from './translations';

// 优化：按需加载
const loadTranslations = async (lang: Language) => {
  const module = await import(`./locales/${lang}.ts`);
  return module.default;
};
```

### 2. 缓存机制

```typescript
// Hook内部使用useState缓存
const [t, setT] = useState(translations[currentLang]);

// 只在语言变化时更新
useEffect(() => {
  setT(translations[currentLang]);
}, [currentLang]);
```

### 3. 避免重复调用

```typescript
// ✅ 推荐：App中调用一次，传递给子组件
function App() {
  const { t } = useTranslation();
  return <Child t={t} />;
}

// ❌ 不推荐：每个组件都调用
function Child() {
  const { t } = useTranslation();  // 重复调用
  return <div>{t.text}</div>;
}
```

---

## 🎓 使用示例

### 示例1: 简单文本

```typescript
// 翻译定义
interface Translations {
  greeting: string;
}

const translations = {
  'en': { greeting: 'Hello' },
  'zh-CN': { greeting: '你好' },
  'ja': { greeting: 'こんにちは' }
};

// 组件使用
function Greeting({ t }) {
  return <div>{t.greeting}</div>;
}
```

### 示例2: 带参数文本

```typescript
// 翻译定义
interface Translations {
  welcomeUser: string;
}

const translations = {
  'en': { welcomeUser: 'Welcome' },
  'zh-CN': { welcomeUser: '欢迎' },
  'ja': { welcomeUser: 'ようこそ' }
};

// 组件使用
function Welcome({ t, username }) {
  return <div>{t.welcomeUser}, {username}!</div>;
}
// 输出: Welcome, John! / 欢迎, John! / ようこそ, John!
```

### 示例3: 条件文本

```typescript
// 翻译定义
const translations = {
  'en': { 
    running: 'Running...', 
    start: 'Start' 
  },
  'zh-CN': { 
    running: '运行中...', 
    start: '开始' 
  }
};

// 组件使用
<button>{isRunning ? t.running : t.start}</button>
```

---

## 📊 翻译覆盖率

### 当前状态
```
总字段数: 120+
英文翻译: 100%
中文翻译: 100%
日语翻译: 100%

覆盖率: 100% ✅
```

### 翻译字段分类
```
UI标签: 40个
按钮文本: 15个
算法术语: 30个
统计指标: 20个
提示信息: 15个
```

---

## 🔧 技术细节

### 类型定义的优势

```typescript
// 1. IDE自动补全
t.  ← 输入点后立即显示所有可用字段

// 2. 拼写检查
t.titel  ← IDE标红，提示正确是title

// 3. 重构安全
// 重命名title → 所有使用处自动更新

// 4. 编译检查
const text = t.unknownField;  ← 编译错误
```

### localStorage策略

```typescript
// 存储格式
localStorage.setItem('preferredLanguage', 'zh-CN');

// 读取逻辑
const saved = localStorage.getItem('preferredLanguage');
// saved: 'zh-CN' | null

// 降级策略
return saved || detectBrowserLanguage() || 'en';
```

### 浏览器语言检测

```typescript
navigator.language  // 'zh-CN', 'en-US', 'ja-JP'

// 智能匹配
if (browserLang.startsWith('zh')) return 'zh-CN';
if (browserLang.startsWith('ja')) return 'ja';
return 'en';  // 默认英文
```

---

## 🌟 用户体验设计

### 语言切换器位置

```
HUD布局:
┌────────────────────────────────────┐
│ 标题  [🇺🇸EN] [🇨🇳中文] [🇯🇵日本語] │ ← 显眼位置
│                            FPS  ?   │
└────────────────────────────────────┘
```

### 切换效果

```
点击前: [🇺🇸EN] 高亮
点击🇨🇳: 
  → localStorage保存
  → Hook更新
  → 界面切换为中文
  → [🇨🇳中文] 高亮
  
无需刷新页面 ✅
```

### Toast通知

```typescript
切换语言时显示:
"🇨🇳 语言已切换为中文"
"🇺🇸 Language switched to English"
"🇯🇵 言語が日本語に切り替わりました"
```

---

## 📚 最佳实践

### DO ✅
1. ✅ 所有用户可见文本都翻译
2. ✅ 使用语义化的key名称（如`start`而非`btn1`）
3. ✅ 保持翻译简洁准确
4. ✅ 在Translations接口中添加注释
5. ✅ 测试所有语言的UI布局

### DON'T ❌
1. ❌ 硬编码文本在组件中
2. ❌ 使用神秘的key名（如`t1`, `s2`）
3. ❌ 翻译过长导致UI溢出
4. ❌ 翻译不一致（同一概念不同译法）
5. ❌ 忘记更新所有语言

---

## 🧪 测试建议

### 功能测试
```
1. 切换到中文 → 检查所有文本
2. 切换到日语 → 检查所有文本
3. 切换回英文 → 检查所有文本
4. 刷新页面 → 检查语言保持
5. 清除localStorage → 检查自动检测
```

### UI测试
```
1. 检查文本是否溢出
2. 检查按钮宽度是否合适
3. 检查长文本的换行
4. 检查不同语言的字体渲染
```

### 浏览器测试
```
1. Chrome（英文系统）
2. Safari（中文系统）
3. Firefox（日文系统）
```

---

## 🔮 未来增强

### 计划中的功能
```
1. [ ] 添加繁体中文（zh-TW）
2. [ ] 添加韩语（ko）
3. [ ] 添加法语（fr）
4. [ ] 添加德语（de）
5. [ ] 添加西班牙语（es）
```

### 可能的优化
```
1. [ ] 翻译文件按语言拆分
2. [ ] 异步加载语言包
3. [ ] 翻译缓存优化
4. [ ] 支持RTL语言（阿拉伯语等）
5. [ ] 数字/日期本地化
```

---

## 📖 相关文档

- `web/src/i18n/languages.ts` - 语言配置
- `web/src/i18n/translations.ts` - 翻译文本（738行）
- `web/src/i18n/useTranslation.ts` - React Hook
- `web/src/ui/LanguageSwitcher.tsx` - 切换UI

---

## 🎉 总结

### 方案特点
- ✅ **轻量级**: 零额外依赖
- ✅ **类型安全**: TypeScript全程保障
- ✅ **高性能**: 无抽象层开销
- ✅ **易维护**: 代码简洁清晰
- ✅ **用户友好**: 自动检测+持久化

### 适用场景
本方案特别适合：
- 中小型项目（如本项目）
- TypeScript项目
- 追求bundle大小的项目
- 翻译文本量适中的项目

### 不适合的场景
如果需要：
- 复数规则处理
- 复杂的参数格式化
- 翻译文本动态加载
- 上百种语言支持

→ 考虑使用i18next等成熟库

---

**版本**: v1.0  
**实现日期**: 2025-10-28  
**语言支持**: 3种（en/zh-CN/ja）  
**翻译完成度**: 100%  
**状态**: ✅ Production Ready

🌍 **让世界各地的用户都能使用我们的工具！** 🚀

