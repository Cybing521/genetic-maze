// 翻译文本
import type { Language } from './languages';

export interface Translations {
  // 标题
  title: string;
  
  // HUD
  generation: string;
  bestFitness: string;
  avgFitness: string;
  diversity: string;
  steps: string;
  fps: string;
  difficulty: string;
  
  // 状态
  success: string;
  evolving: string;
  solved: string;
  searching: string;
  optimal: string;
  
  // 控制按钮
  start: string;
  pause: string;
  resume: string;
  reset: string;
  running: string;
  record: string;
  stopSave: string;
  
  // 算法配置
  algorithmConfig: string;
  algorithmType: string;
  standardGA: string;
  adaptiveGA: string;
  hybridGA: string;
  islandGA: string;
  experimental: string;
  
  // 算子
  selectionMethod: string;
  crossoverMethod: string;
  mutationMethod: string;
  
  // 选择算子
  tournament: string;
  roulette: string;
  rank: string;
  sus: string;
  
  // 交叉算子
  singlePoint: string;
  twoPoint: string;
  uniform: string;
  orderCrossover: string;
  pmx: string;
  
  // 变异算子
  random: string;
  guided: string;
  inversion: string;
  insertion: string;
  localSearch: string;
  
  // Island GA
  islands: string;
  migrationInterval: string;
  migrationSize: string;
  migrationTopology: string;
  ring: string;
  star: string;
  full: string;
  islandModelInfo: string;
  parallelPopulations: string;
  individualsPerIsland: string;
  migrationEvery: string;
  expectedSpeedup: string;
  globalBest: string;
  
  // 迷宫设置
  mazeSettings: string;
  mazeSize: string;
  animationSpeed: string;
  showExplorationProcess: string;
  adaptiveParameters: string;
  
  // 参数
  population: string;
  mutationRate: string;
  crossoverRate: string;
  eliteRate: string;
  maxGenerations: string;
  
  // 可视化与导出
  visualizationExport: string;
  landscape3D: string;
  hideStats: string;
  showStats: string;
  exportJSON: string;
  exportCSV: string;
  exportReport: string;
  exportPath: string;
  
  // 算法信息
  algorithmInfo: string;
  type: string;
  selection: string;
  crossover: string;
  mutation: string;
  astarInit: string;
  individuals: string;
  elitism: string;
  maxSteps: string;
  popPerIsland: string;
  
  // 统计
  statistics: string;
  convergence: string;
  performance: string;
  solutionQuality: string;
  currentStatus: string;
  recommendations: string;
  firstSolution: string;
  optimalReached: string;
  avgImprovement: string;
  totalTime: string;
  speed: string;
  avgGenTime: string;
  pathLength: string;
  uniqueness: string;
  smoothness: string;
  status: string;
  average: string;
  trend: string;
  variance: string;
  notFound: string;
  increasing: string;
  stable: string;
  decreasing: string;
  
  // 预设
  parameterPresets: string;
  fastConvergence: string;
  qualityFirst: string;
  balanced: string;
  research: string;
  highDiversity: string;
  clickPreset: string;
  
  // 键盘快捷键
  keyboardShortcuts: string;
  control: string;
  data: string;
  ui: string;
  playPause: string;
  resetMaze: string;
  singleStep: string;
  exportData: string;
  showHideHelp: string;
  toggleFullscreen: string;
  closeDialogs: string;
  setSpeed: string;
  tip: string;
  shortcutsWork: string;
  anytime: string;
  
  // 难度
  easy: string;
  medium: string;
  hard: string;
  expert: string;
  extreme: string;
  
  // Toast消息
  jsonExported: string;
  csvExported: string;
  reportExported: string;
  pathExported: string;
  resetDone: string;
  speedSet: string;
  fullscreenMode: string;
  exitedFullscreen: string;
  presetLoaded: string;
  
  // 3D可视化
  fitnessLandscape3D: string;
  dragToRotate: string;
  scrollToZoom: string;
  escToClose: string;
  close: string;
  
  // Island状态
  islandStatus: string;
  islandsActive: string;
  island: string;
  
  // 其他
  generations: string;
  coresAvailable: string;
  runAlgorithm: string;
}

export const translations: Record<Language, Translations> = {
  'en': {
    title: 'Genetic Algorithm Maze Solver',
    generation: 'Generation',
    bestFitness: 'Best Fitness',
    avgFitness: 'Avg Fitness',
    diversity: 'Diversity',
    steps: 'Steps',
    fps: 'FPS',
    difficulty: 'DIFFICULTY',
    success: 'SUCCESS',
    evolving: 'EVOLVING',
    solved: 'SOLVED!',
    searching: 'Searching...',
    optimal: 'Optimal',
    
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    reset: 'Reset',
    running: 'Running...',
    record: 'Record',
    stopSave: 'Stop & Save',
    
    algorithmConfig: 'Algorithm Configuration',
    algorithmType: 'Algorithm Type',
    standardGA: 'Standard GA',
    adaptiveGA: 'Adaptive GA',
    hybridGA: 'Hybrid GA',
    islandGA: 'Island GA',
    experimental: 'Experimental',
    
    selectionMethod: 'Selection Method',
    crossoverMethod: 'Crossover Method',
    mutationMethod: 'Mutation Method',
    
    tournament: 'Tournament',
    roulette: 'Roulette Wheel',
    rank: 'Rank Selection',
    sus: 'Stochastic Universal Sampling',
    
    singlePoint: 'Single-Point',
    twoPoint: 'Two-Point',
    uniform: 'Uniform',
    orderCrossover: 'Order Crossover (OX)',
    pmx: 'Partially Mapped (PMX)',
    
    random: 'Random',
    guided: 'Guided (Heuristic)',
    inversion: 'Inversion',
    insertion: 'Insertion (Loop Removal)',
    localSearch: 'Local Search (2-opt)',
    
    islands: 'Number of Islands',
    migrationInterval: 'Migration Interval',
    migrationSize: 'Migration Size',
    migrationTopology: 'Migration Topology',
    ring: 'Ring (环形) - Sequential migration',
    star: 'Star (星形) - Exchange with best',
    full: 'Full (全连接) - Pairwise exchange',
    islandModelInfo: 'Island Model Info',
    parallelPopulations: 'parallel populations',
    individualsPerIsland: 'individuals/island',
    migrationEvery: 'Migration every',
    expectedSpeedup: 'Expected speedup',
    globalBest: 'Global Best',
    
    mazeSettings: 'Maze Settings',
    mazeSize: 'Maze Size',
    animationSpeed: 'Animation Speed',
    showExplorationProcess: 'Show Exploration Process',
    adaptiveParameters: 'Adaptive Parameters',
    
    population: 'Population',
    mutationRate: 'Mutation Rate',
    crossoverRate: 'Crossover Rate',
    eliteRate: 'Elite Rate',
    maxGenerations: 'Max Generations',
    
    visualizationExport: 'Visualization & Export',
    landscape3D: '3D Landscape',
    hideStats: 'Hide Stats',
    showStats: 'Show Stats',
    exportJSON: 'Export JSON',
    exportCSV: 'Export CSV',
    exportReport: 'Export Report',
    exportPath: 'Export Path',
    
    algorithmInfo: 'Algorithm Info',
    type: 'Type',
    selection: 'Selection',
    crossover: 'Crossover',
    mutation: 'Mutation',
    astarInit: 'A* Init',
    individuals: 'individuals',
    elitism: 'Elitism',
    maxSteps: 'Max Steps',
    popPerIsland: 'Pop/Island',
    
    statistics: 'Statistics',
    convergence: 'CONVERGENCE',
    performance: 'PERFORMANCE',
    solutionQuality: 'SOLUTION QUALITY',
    currentStatus: 'CURRENT STATUS',
    recommendations: 'RECOMMENDATIONS',
    firstSolution: 'First Solution',
    optimalReached: '90% Optimal',
    avgImprovement: 'Avg Improvement',
    totalTime: 'Total Time',
    speed: 'Speed',
    avgGenTime: 'Avg Gen Time',
    pathLength: 'Path Length',
    uniqueness: 'Uniqueness',
    smoothness: 'Smoothness',
    status: 'Status',
    average: 'Average',
    trend: 'Trend',
    variance: 'Variance',
    notFound: 'Not found',
    increasing: 'Increasing',
    stable: 'Stable',
    decreasing: 'Decreasing',
    
    parameterPresets: 'Parameter Presets',
    fastConvergence: 'Fast Convergence',
    qualityFirst: 'Quality First',
    balanced: 'Balanced',
    research: 'Research',
    highDiversity: 'High Diversity',
    clickPreset: 'Click a preset to load optimized parameters',
    
    keyboardShortcuts: 'Keyboard Shortcuts',
    control: 'Control',
    data: 'Data',
    ui: 'UI',
    playPause: 'Play / Pause',
    resetMaze: 'Reset maze and algorithm',
    singleStep: 'Single step (next generation)',
    exportData: 'Export JSON data',
    showHideHelp: 'Show/Hide this help panel',
    toggleFullscreen: 'Toggle fullscreen',
    closeDialogs: 'Close dialogs',
    setSpeed: 'Set animation speed (1=slow, 9=fast)',
    tip: 'Tip',
    shortcutsWork: 'Keyboard shortcuts work when you\'re not typing in input fields.',
    anytime: 'anytime to toggle this panel.',
    
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
    extreme: 'Extreme',
    
    jsonExported: 'JSON exported successfully!',
    csvExported: 'CSV exported successfully!',
    reportExported: 'Report exported successfully!',
    pathExported: 'Path exported successfully!',
    resetDone: 'Reset',
    speedSet: 'Speed',
    fullscreenMode: 'Fullscreen mode',
    exitedFullscreen: 'Exited fullscreen',
    presetLoaded: 'Loaded preset',
    
    fitnessLandscape3D: 'Fitness Landscape 3D',
    dragToRotate: 'Drag to rotate',
    scrollToZoom: 'Scroll to zoom',
    escToClose: 'ESC to close',
    close: 'Close',
    
    islandStatus: 'Island Status',
    islandsActive: 'islands active',
    island: 'Island',
    
    generations: 'generations',
    coresAvailable: 'cores available',
    runAlgorithm: 'Run the algorithm to see statistics...'
  },
  
  'zh-CN': {
    title: '遗传算法迷宫求解器',
    generation: '代数',
    bestFitness: '最佳适应度',
    avgFitness: '平均适应度',
    diversity: '多样性',
    steps: '步数',
    fps: '帧率',
    difficulty: '难度',
    success: '成功',
    evolving: '进化中',
    solved: '已求解！',
    searching: '搜索中...',
    optimal: '最优',
    
    start: '开始',
    pause: '暂停',
    resume: '继续',
    reset: '重置',
    running: '运行中...',
    record: '录制',
    stopSave: '停止并保存',
    
    algorithmConfig: '算法配置',
    algorithmType: '算法类型',
    standardGA: '标准遗传算法',
    adaptiveGA: '自适应遗传算法',
    hybridGA: '混合遗传算法',
    islandGA: '岛屿遗传算法',
    experimental: '实验性',
    
    selectionMethod: '选择方法',
    crossoverMethod: '交叉方法',
    mutationMethod: '变异方法',
    
    tournament: '锦标赛选择',
    roulette: '轮盘赌选择',
    rank: '排序选择',
    sus: '随机通用采样',
    
    singlePoint: '单点交叉',
    twoPoint: '两点交叉',
    uniform: '均匀交叉',
    orderCrossover: '顺序交叉 (OX)',
    pmx: '部分匹配交叉 (PMX)',
    
    random: '随机变异',
    guided: '导向变异（启发式）',
    inversion: '逆序变异',
    insertion: '插入变异（删除环路）',
    localSearch: '局部搜索 (2-opt)',
    
    islands: '岛屿数量',
    migrationInterval: '迁移间隔',
    migrationSize: '迁移个体数',
    migrationTopology: '迁移拓扑',
    ring: '环形 - 顺序迁移',
    star: '星形 - 与最优岛交换',
    full: '全连接 - 两两交换',
    islandModelInfo: '岛屿模型信息',
    parallelPopulations: '个并行种群',
    individualsPerIsland: '个体/岛屿',
    migrationEvery: '每',
    expectedSpeedup: '预期加速',
    globalBest: '全局最优',
    
    mazeSettings: '迷宫设置',
    mazeSize: '迷宫大小',
    animationSpeed: '动画速度',
    showExplorationProcess: '显示探索过程',
    adaptiveParameters: '自适应参数',
    
    population: '种群大小',
    mutationRate: '变异率',
    crossoverRate: '交叉率',
    eliteRate: '精英率',
    maxGenerations: '最大代数',
    
    visualizationExport: '可视化与导出',
    landscape3D: '3D景观',
    hideStats: '隐藏统计',
    showStats: '显示统计',
    exportJSON: '导出JSON',
    exportCSV: '导出CSV',
    exportReport: '导出报告',
    exportPath: '导出路径',
    
    algorithmInfo: '算法信息',
    type: '类型',
    selection: '选择',
    crossover: '交叉',
    mutation: '变异',
    astarInit: 'A*初始化',
    individuals: '个个体',
    elitism: '精英保留',
    maxSteps: '最大步数',
    popPerIsland: '种群/岛',
    
    statistics: '统计信息',
    convergence: '收敛性能',
    performance: '时间性能',
    solutionQuality: '解的质量',
    currentStatus: '当前状态',
    recommendations: '优化建议',
    firstSolution: '首次找到解',
    optimalReached: '达到90%最优',
    avgImprovement: '平均改进',
    totalTime: '总时间',
    speed: '速度',
    avgGenTime: '平均代时间',
    pathLength: '路径长度',
    uniqueness: '唯一性',
    smoothness: '平滑度',
    status: '状态',
    average: '平均',
    trend: '趋势',
    variance: '方差',
    notFound: '未找到',
    increasing: '上升',
    stable: '稳定',
    decreasing: '下降',
    
    parameterPresets: '参数预设',
    fastConvergence: '快速收敛',
    qualityFirst: '质量优先',
    balanced: '平衡模式',
    research: '科研实验',
    highDiversity: '高多样性',
    clickPreset: '点击预设加载优化参数',
    
    keyboardShortcuts: '键盘快捷键',
    control: '控制',
    data: '数据',
    ui: '界面',
    playPause: '播放 / 暂停',
    resetMaze: '重置迷宫和算法',
    singleStep: '单步执行（下一代）',
    exportData: '导出JSON数据',
    showHideHelp: '显示/隐藏帮助面板',
    toggleFullscreen: '切换全屏',
    closeDialogs: '关闭对话框',
    setSpeed: '设置动画速度（1=慢，9=快）',
    tip: '提示',
    shortcutsWork: '键盘快捷键在非输入状态下有效。',
    anytime: '随时切换此面板。',
    
    easy: '简单',
    medium: '中等',
    hard: '困难',
    expert: '专家',
    extreme: '极限',
    
    jsonExported: 'JSON导出成功！',
    csvExported: 'CSV导出成功！',
    reportExported: '报告导出成功！',
    pathExported: '路径导出成功！',
    resetDone: '已重置',
    speedSet: '速度',
    fullscreenMode: '全屏模式',
    exitedFullscreen: '退出全屏',
    presetLoaded: '已加载预设',
    
    fitnessLandscape3D: '适应度景观 3D',
    dragToRotate: '拖动旋转',
    scrollToZoom: '滚轮缩放',
    escToClose: 'ESC关闭',
    close: '关闭',
    
    islandStatus: '岛屿状态',
    islandsActive: '个岛屿活跃',
    island: '岛屿',
    
    generations: '代',
    coresAvailable: '核心可用',
    runAlgorithm: '运行算法以查看统计信息...'
  },
  
  'ja': {
    title: '遺伝的アルゴリズム迷路ソルバー',
    generation: '世代',
    bestFitness: '最良適応度',
    avgFitness: '平均適応度',
    diversity: '多様性',
    steps: 'ステップ',
    fps: 'FPS',
    difficulty: '難易度',
    success: '成功',
    evolving: '進化中',
    solved: '解決！',
    searching: '探索中...',
    optimal: '最適',
    
    start: '開始',
    pause: '一時停止',
    resume: '再開',
    reset: 'リセット',
    running: '実行中...',
    record: '録画',
    stopSave: '停止して保存',
    
    algorithmConfig: 'アルゴリズム設定',
    algorithmType: 'アルゴリズムタイプ',
    standardGA: '標準GA',
    adaptiveGA: '適応的GA',
    hybridGA: 'ハイブリッドGA',
    islandGA: 'アイランドGA',
    experimental: '実験的',
    
    selectionMethod: '選択方法',
    crossoverMethod: '交叉方法',
    mutationMethod: '突然変異方法',
    
    tournament: 'トーナメント',
    roulette: 'ルーレット',
    rank: 'ランク選択',
    sus: '確率的ユニバーサルサンプリング',
    
    singlePoint: '一点交叉',
    twoPoint: '二点交叉',
    uniform: '一様交叉',
    orderCrossover: '順序交叉 (OX)',
    pmx: '部分写像交叉 (PMX)',
    
    random: 'ランダム',
    guided: 'ガイド付き（ヒューリスティック）',
    inversion: '反転',
    insertion: '挿入（ループ削除）',
    localSearch: '局所探索 (2-opt)',
    
    islands: '島の数',
    migrationInterval: '移住間隔',
    migrationSize: '移住個体数',
    migrationTopology: '移住トポロジー',
    ring: 'リング - 順次移住',
    star: 'スター - 最良と交換',
    full: 'フル - ペア交換',
    islandModelInfo: '島モデル情報',
    parallelPopulations: '並列集団',
    individualsPerIsland: '個体/島',
    migrationEvery: '移住間隔',
    expectedSpeedup: '予想高速化',
    globalBest: 'グローバル最良',
    
    mazeSettings: '迷路設定',
    mazeSize: '迷路サイズ',
    animationSpeed: 'アニメーション速度',
    showExplorationProcess: '探索プロセスを表示',
    adaptiveParameters: '適応的パラメータ',
    
    population: '集団サイズ',
    mutationRate: '突然変異率',
    crossoverRate: '交叉率',
    eliteRate: 'エリート率',
    maxGenerations: '最大世代数',
    
    visualizationExport: '可視化とエクスポート',
    landscape3D: '3D景観',
    hideStats: '統計を隠す',
    showStats: '統計を表示',
    exportJSON: 'JSONエクスポート',
    exportCSV: 'CSVエクスポート',
    exportReport: 'レポートエクスポート',
    exportPath: 'パスエクスポート',
    
    algorithmInfo: 'アルゴリズム情報',
    type: 'タイプ',
    selection: '選択',
    crossover: '交叉',
    mutation: '突然変異',
    astarInit: 'A*初期化',
    individuals: '個体',
    elitism: 'エリート',
    maxSteps: '最大ステップ',
    popPerIsland: '集団/島',
    
    statistics: '統計情報',
    convergence: '収束性能',
    performance: '時間性能',
    solutionQuality: '解の品質',
    currentStatus: '現在の状態',
    recommendations: '推奨事項',
    firstSolution: '初回解決',
    optimalReached: '90%最適到達',
    avgImprovement: '平均改善',
    totalTime: '合計時間',
    speed: '速度',
    avgGenTime: '平均世代時間',
    pathLength: 'パス長',
    uniqueness: '一意性',
    smoothness: '滑らかさ',
    status: '状態',
    average: '平均',
    trend: 'トレンド',
    variance: '分散',
    notFound: '見つかりません',
    increasing: '増加',
    stable: '安定',
    decreasing: '減少',
    
    parameterPresets: 'パラメータプリセット',
    fastConvergence: '高速収束',
    qualityFirst: '品質優先',
    balanced: 'バランス',
    research: '研究',
    highDiversity: '高多様性',
    clickPreset: 'プリセットをクリックして最適化されたパラメータを読み込む',
    
    keyboardShortcuts: 'キーボードショートカット',
    control: '制御',
    data: 'データ',
    ui: 'UI',
    playPause: '再生 / 一時停止',
    resetMaze: '迷路とアルゴリズムをリセット',
    singleStep: 'シングルステップ（次世代）',
    exportData: 'JSONデータをエクスポート',
    showHideHelp: 'ヘルプパネルを表示/非表示',
    toggleFullscreen: 'フルスクリーン切替',
    closeDialogs: 'ダイアログを閉じる',
    setSpeed: 'アニメーション速度を設定（1=遅い、9=速い）',
    tip: 'ヒント',
    shortcutsWork: '入力フィールドに入力していないときにキーボードショートカットが機能します。',
    anytime: 'でいつでもこのパネルを切り替えできます。',
    
    easy: '簡単',
    medium: '中程度',
    hard: '難しい',
    expert: 'エキスパート',
    extreme: '極限',
    
    jsonExported: 'JSONエクスポート成功！',
    csvExported: 'CSVエクスポート成功！',
    reportExported: 'レポートエクスポート成功！',
    pathExported: 'パスエクスポート成功！',
    resetDone: 'リセット完了',
    speedSet: '速度',
    fullscreenMode: 'フルスクリーンモード',
    exitedFullscreen: 'フルスクリーン終了',
    presetLoaded: 'プリセット読み込み',
    
    fitnessLandscape3D: '適応度景観 3D',
    dragToRotate: 'ドラッグで回転',
    scrollToZoom: 'スクロールでズーム',
    escToClose: 'ESCで閉じる',
    close: '閉じる',
    
    islandStatus: '島の状態',
    islandsActive: '島がアクティブ',
    island: '島',
    
    generations: '世代',
    coresAvailable: 'コア利用可能',
    runAlgorithm: 'アルゴリズムを実行して統計を表示...'
  }
};

