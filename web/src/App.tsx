import { useEffect, useRef, useState } from 'react';
import { Maze } from './maze/Maze';
import { GeneticAlgorithm } from './ga/GeneticAlgorithm';
import { AdaptiveGeneticAlgorithm } from './ga/AdaptiveGA';
import { HybridGA, createHybridGAConfig } from './ga/HybridGA';
import { DetailedGeneticAlgorithm } from './ga/DetailedGA';
import { MazeRenderer } from './vis/MazeRenderer';
import { AnimationManager } from './vis/AnimationManager';
import { FitnessChart } from './vis/FitnessChart';
import { FitnessLandscape3D } from './vis/FitnessLandscape3D';
import { StatisticsPanel } from './ui/StatisticsPanel';
import { IslandControlPanel } from './ui/IslandControlPanel';
import { IslandVisualizer } from './ui/IslandVisualizer';
import { KeyboardHelpPanel } from './ui/KeyboardHelpPanel';
import { PresetSelector } from './ui/PresetSelector';
import { IslandGA, createDefaultIslandConfig } from './ga/IslandGA';
import { WebMRecorder } from './utils/recorder';
import { DataExporter, type ExperimentData } from './utils/DataExporter';
import { MazeDifficulty, type DifficultyMetrics } from './utils/MazeDifficulty';
import { applyPreset, PARAMETER_PRESETS } from './config/presets';
import { useKeyboard } from './hooks/useKeyboard';
import { useTranslation } from './i18n/useTranslation';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import type { GAConfig, GenerationResult, AlgorithmType, SelectionMethod, CrossoverMethod, MutationMethod, IslandConfig } from './types';
import './App.css';

function App() {
  const { t, currentLang, changeLanguage } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [config, setConfig] = useState<GAConfig>({
    populationSize: 300,
    maxGenerations: 500,
    mutationRate: 0.02,
    crossoverRate: 0.8,
    elitismCount: 15,  // 5% of 300
    maxSteps: 500,  // 增大到500，适应更大迷宫
    useAdaptive: true,
    adaptiveMode: 'hybrid'
  });

  const [mazeSize, setMazeSize] = useState<number>(21);
  const [animationSpeed, setAnimationSpeed] = useState<number>(5);  // 1-10，越大越快
  const [showDetailedProcess, setShowDetailedProcess] = useState<boolean>(true);  // 展示详细过程
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [processMessage, setProcessMessage] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentGen, setCurrentGen] = useState<GenerationResult | null>(null);
  const [fps, setFps] = useState<number>(60);

  // 新增：算法和算子选择
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('hybrid');
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>('tournament');
  const [crossoverMethod, setCrossoverMethod] = useState<CrossoverMethod>('order');
  const [mutationMethod, setMutationMethod] = useState<MutationMethod>('guided');

  // 新增：3D可视化和数据导出
  const [show3D, setShow3D] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [historyData, setHistoryData] = useState<GenerationResult[]>([]);
  const [startTimeRef, setStartTimeRef] = useState<number>(Date.now());

  // Island GA配置和状态
  const [islandConfig, setIslandConfig] = useState<IslandConfig>(createDefaultIslandConfig());
  const [islandResults, setIslandResults] = useState<GenerationResult[]>([]);
  const [islandGA, setIslandGA] = useState<IslandGA | null>(null);

  // 快捷键和帮助
  const [showHelp, setShowHelp] = useState(false);
  const [showToast, setShowToast] = useState<string>('');

  // 迷宫难度
  const [mazeDifficulty, setMazeDifficulty] = useState<DifficultyMetrics | null>(null);

  const mazeRef = useRef<Maze | null>(null);
  const animManagerRef = useRef<AnimationManager | null>(null);
  const recorderRef = useRef<WebMRecorder>(new WebMRecorder());
  const fpsIntervalRef = useRef<number | null>(null);

  // 初始化
  useEffect(() => {
    if (!canvasRef.current || !chartCanvasRef.current) return;

    const canvas = canvasRef.current;
    const chartCanvas = chartCanvasRef.current;
    
    // 设置Canvas尺寸 - 基于用户规格
    canvas.width = Math.min(800, window.innerWidth * 0.7);
    canvas.height = Math.min(600, window.innerHeight - 200);
    chartCanvas.width = Math.min(800, window.innerWidth * 0.7);
    chartCanvas.height = 120;

    const ctx = canvas.getContext('2d')!;
    const chartCtx = chartCanvas.getContext('2d')!;

    // 创建渲染器
    const renderer = new MazeRenderer(canvas, ctx);
    const fitnessChart = new FitnessChart(chartCanvas, chartCtx);

    // 创建动画管理器
    const animManager = new AnimationManager(
      renderer,
      fitnessChart,
      (result) => {
        setCurrentGen(result);
        setHistoryData(prev => [...prev, result]);
        // 更新FPS显示
        if (animManager.fps) {
          setFps(animManager.fps);
        }
      }
    );
    animManagerRef.current = animManager;
    
    // FPS更新循环
    fpsIntervalRef.current = window.setInterval(() => {
      if (animManager && animManager.isRunning) {
        setFps(animManager.fps);
      }
    }, 100);

    // 生成默认迷宫（增加难度）
    const maze = new Maze(mazeSize, mazeSize);
    maze.generate(0.85, 0.85);  // 更高的复杂度和密度
    mazeRef.current = maze;
    renderer.setMaze(maze);
    renderer.clear();
    renderer.renderMaze();
    renderer.renderStartEnd(maze);

    // 评估迷宫难度
    const difficulty = MazeDifficulty.evaluate(maze);
    setMazeDifficulty(difficulty);
    
    // 清理函数
    return () => {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
      }
    };

  }, [mazeSize]);  // 添加mazeSize依赖，大小变化时重新初始化

  const handleStart = async () => {
    if (!mazeRef.current || !animManagerRef.current) return;

    setIsRunning(true);
    setIsPaused(false);
    setHistoryData([]);
    setStartTimeRef(Date.now());

    if (showDetailedProcess) {
      // 使用详细展示版本
      const ga = new DetailedGeneticAlgorithm(mazeRef.current, config);
      await animManagerRef.current.startDetailed(ga, setProcessMessage);
    } else {
      // 根据选择的算法类型创建GA实例
      let ga;
      
      switch (algorithmType) {
        case 'standard':
          ga = new GeneticAlgorithm(mazeRef.current, config);
          break;
        case 'adaptive':
          ga = new AdaptiveGeneticAlgorithm(mazeRef.current, config);
          break;
        case 'hybrid':
          const hybridConfig = createHybridGAConfig(config);
          hybridConfig.selectionMethod = selectionMethod;
          hybridConfig.crossoverMethod = crossoverMethod;
          hybridConfig.mutationMethod = mutationMethod;
          ga = new HybridGA(mazeRef.current, hybridConfig);
          break;
        case 'island':
          // Island GA特殊处理：使用Web Workers并行
          const island = new IslandGA(
            mazeRef.current, 
            config, 
            islandConfig,
            (results) => {
              setIslandResults(results);
              // 更新主显示为全局最优
              if (results.length > 0) {
                const globalBest = results.reduce((best, r) => 
                  r.bestFitness > best.bestFitness ? r : best
                , results[0]);
                setCurrentGen(globalBest);
                setHistoryData(prev => [...prev, globalBest]);
              }
            }
          );
          setIslandGA(island);
          
          // 初始化并运行
          await island.initialize();
          await island.start();
          
          // 清理
          island.destroy();
          setIslandGA(null);
          return; // Island GA自己管理流程，直接返回
        default:
          ga = new GeneticAlgorithm(mazeRef.current, config);
      }
      
      await animManagerRef.current.start(ga);
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setProcessMessage('');
  };

  const handlePause = () => {
    if (!animManagerRef.current || !isRunning) return;
    
    if (isPaused) {
      animManagerRef.current.resume();
      setIsPaused(false);
    } else {
      animManagerRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleReset = () => {
    if (animManagerRef.current) {
      animManagerRef.current.reset();
      animManagerRef.current.pathTrails = [];  // 清空轨迹
    }
    
    // 停止Island GA（如果正在运行）
    if (islandGA) {
      islandGA.destroy();
      setIslandGA(null);
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setCurrentGen(null);
    setFps(60);
    setIslandResults([]);

    // 重新生成迷宫 - 使用当前的mazeSize
    if (canvasRef.current && chartCanvasRef.current) {
      const canvas = canvasRef.current;
      const chartCanvas = chartCanvasRef.current;
      
      const maze = new Maze(mazeSize, mazeSize);  // 使用状态中的mazeSize
      maze.generate(0.85, 0.85);  // 更高的复杂度和密度
      mazeRef.current = maze;
      
      const ctx = canvas.getContext('2d')!;
      const chartCtx = chartCanvas.getContext('2d')!;
      
      const renderer = new MazeRenderer(canvas, ctx);
      const fitnessChart = new FitnessChart(chartCanvas, chartCtx);
      
      renderer.setMaze(maze);
      renderer.clear();
      renderer.renderMaze();
      renderer.renderStartEnd(maze);

      // 评估迷宫难度
      const difficulty = MazeDifficulty.evaluate(maze);
      setMazeDifficulty(difficulty);
      
      // 更新动画管理器的renderer
      const animManager = new AnimationManager(
        renderer,
        fitnessChart,
        (result) => {
          setCurrentGen(result);
          if (animManager.fps) {
            setFps(animManager.fps);
          }
        }
      );
      animManagerRef.current = animManager;
    }
  };

  const handleStartRecording = async () => {
    if (!canvasRef.current) return;
    await recorderRef.current.start(canvasRef.current, 30);
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    const blob = await recorderRef.current.stop();
    recorderRef.current.download(blob);
    setIsRecording(false);
  };

  const handleExportJSON = () => {
    if (historyData.length === 0 || !currentGen) return;
    
    const experimentData: ExperimentData = {
      config,
      algorithmType,
      mazeSize,
      startTime: startTimeRef,
      endTime: Date.now(),
      totalGenerations: historyData.length,
      history: historyData,
      finalBestPath: currentGen.best,
      statistics: DataExporter.calculateStatistics(historyData, config, startTimeRef, Date.now())
    };

    DataExporter.exportJSON(experimentData);
    showToastMessage('📥 JSON exported successfully!');
  };

  const handleLoadPreset = (presetName: string) => {
    const newConfig = applyPreset(config, presetName);
    setConfig(newConfig);
    showToastMessage(`${PARAMETER_PRESETS[presetName].icon} Loaded preset: ${PARAMETER_PRESETS[presetName].displayName}`);
  };

  const showToastMessage = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(''), 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      showToastMessage('🖥️ Fullscreen mode');
    } else {
      document.exitFullscreen();
      showToastMessage('🪟 Exited fullscreen');
    }
  };

  const handleExportCSV = () => {
    if (historyData.length === 0) return;
    DataExporter.exportCSV(historyData, algorithmType, mazeSize);
    showToastMessage('📊 CSV exported successfully!');
  };

  const handleExportReport = () => {
    if (historyData.length === 0 || !currentGen) return;
    
    const experimentData: ExperimentData = {
      config,
      algorithmType,
      mazeSize,
      startTime: startTimeRef,
      endTime: Date.now(),
      totalGenerations: historyData.length,
      history: historyData,
      finalBestPath: currentGen.best,
      statistics: DataExporter.calculateStatistics(historyData, config, startTimeRef, Date.now())
    };

    DataExporter.exportMarkdownReport(experimentData);
    showToastMessage('📄 Report exported successfully!');
  };

  const handleExportPath = () => {
    if (!currentGen) return;
    DataExporter.exportBestPath(currentGen.best.path, currentGen.generation, algorithmType, mazeSize);
    showToastMessage('🛤️ Path exported successfully!');
  };

  // 键盘快捷键
  useKeyboard({
    onSpacePress: () => {
      if (isRunning) {
        handlePause();
      } else {
        handleStart();
      }
    },
    onReset: () => {
      if (!isRunning) {
        handleReset();
        showToastMessage('🔄 Reset');
      }
    },
    onExport: () => {
      if (!isRunning && historyData.length > 0) {
        handleExportJSON();
      }
    },
    onHelp: () => {
      setShowHelp(!showHelp);
    },
    onFullscreen: toggleFullscreen,
    onEscape: () => {
      if (show3D) setShow3D(false);
      else if (showHelp) setShowHelp(false);
    },
    onSpeed: (speed) => {
      setAnimationSpeed(speed);
      if (animManagerRef.current) {
        animManagerRef.current.frameDelay = 1100 - speed * 100;
        animManagerRef.current.transitionDuration = 1100 - speed * 100;
      }
      showToastMessage(`⚡ Speed: ${speed}/10`);
    }
  }, !isRunning || isPaused); // 运行时某些快捷键仍可用

  return (
    <div className="app">
      {/* Toast通知 */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: 'rgba(136, 192, 208, 0.95)',
          color: 'var(--nord0)',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 3000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease'
        }}>
          {showToast}
        </div>
      )}

      {/* 键盘帮助面板 */}
      {showHelp && <KeyboardHelpPanel onClose={() => setShowHelp(false)} t={t} />}

      {/* 3D可视化覆盖层 */}
      {show3D && historyData.length > 0 && (
        <FitnessLandscape3D 
          history={historyData} 
          onClose={() => setShow3D(false)}
          t={t}
        />
      )}

      {/* HUD */}
      <div className="hud">
        <div className="hud-left">
          <h1>{t.title}</h1>
          
          {/* 语言切换器 */}
          <LanguageSwitcher currentLang={currentLang} onChange={changeLanguage} />
          {currentGen && (
            <div className="hud-stats">
              <div className="stat">
                <span className="label">{t.generation}</span>
                <span className="value highlight">{currentGen.generation}</span>
              </div>
              <div className="stat">
                <span className="label">{t.bestFitness}</span>
                <span 
                  className={`value ${currentGen.best.reachedEnd ? 'success' : 'normal'}`}
                  style={{
                    fontSize: currentGen.best.reachedEnd ? '16px' : '14px',
                    fontWeight: currentGen.best.reachedEnd ? '700' : '600'
                  }}
                >
                  {currentGen.bestFitness.toFixed(0)}
                </span>
                {currentGen.best.reachedEnd && (
                  <div className="fitness-badge">{t.solved}</div>
                )}
              </div>
              <div className="stat">
                <span className="label">{t.avgFitness}</span>
                <span className="value">{currentGen.avgFitness.toFixed(0)}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, (currentGen.avgFitness / currentGen.bestFitness) * 100)}%`
                    }}
                  />
                </div>
              </div>
              <div className="stat">
                <span className="label">{t.diversity}</span>
                <span 
                  className="value"
                  style={{
                    color: currentGen.diversity > 100 ? '#EBCB8B' : 
                           currentGen.diversity > 50 ? 'rgba(0, 255, 255, 0.9)' : '#A3BE8C'
                  }}
                >
                  {currentGen.diversity.toFixed(0)}
                </span>
              </div>
              <div className="stat">
                <span className="label">{t.steps}</span>
                <span className="value">{currentGen.best.path.length}</span>
                <span className="sub-value">
                  {currentGen.best.reachedEnd ? t.optimal : t.searching}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="hud-right">
          {/* 迷宫难度显示 */}
          {mazeDifficulty && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '4px 12px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginRight: '10px'
            }}>
              <span style={{
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                textTransform: 'uppercase'
              }}>
                {t.difficulty}
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: MazeDifficulty.getLevelDisplay(mazeDifficulty.level).color
              }}>
                {MazeDifficulty.renderStars(mazeDifficulty.stars)}
              </span>
              <span style={{
                fontSize: '10px',
                color: MazeDifficulty.getLevelDisplay(mazeDifficulty.level).color
              }}>
                {MazeDifficulty.getLevelDisplay(mazeDifficulty.level).label}
              </span>
            </div>
          )}

          <div className="fps-display">
            <span className="label">{t.fps}</span>
            <span className="value" style={{
              color: fps >= 58 ? '#A3BE8C' : fps >= 50 ? '#EBCB8B' : '#BF616A',
              fontSize: '20px'
            }}>
              {fps}
            </span>
          </div>
          
          {/* 帮助按钮 */}
          <button
            onClick={() => setShowHelp(true)}
            title="Keyboard shortcuts (H)"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--nord8)',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(136, 192, 208, 0.2)';
              e.currentTarget.style.borderColor = 'var(--nord8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ?
          </button>

          {currentGen && (
            <div className={`status ${currentGen.best.reachedEnd ? 'success' : 'running'}`}>
              {currentGen.best.reachedEnd ? `✓ ${t.success}` : `⚡ ${t.evolving}`}
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        {/* Canvas区域 */}
        <div className="canvas-area">
          {processMessage && (
            <div className="process-message">
              {processMessage}
            </div>
          )}
          <canvas ref={canvasRef} />
          <canvas ref={chartCanvasRef} className="fitness-chart" />
        </div>

        {/* 控制面板 */}
        <div className="control-panel">
          <h3>{t.algorithmConfig}</h3>

          {/* 参数预设选择器 */}
          <PresetSelector 
            onSelectPreset={handleLoadPreset}
            disabled={isRunning}
            t={t}
          />
          
          <div className="control-group">
            <label>{t.algorithmType}</label>
            <select 
              value={algorithmType} 
              onChange={(e) => setAlgorithmType(e.target.value as AlgorithmType)}
              disabled={isRunning}
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
              <option value="standard">{t.standardGA}</option>
              <option value="adaptive">{t.adaptiveGA}</option>
              <option value="hybrid">{t.hybridGA} ⭐</option>
              <option value="island">{t.islandGA}</option>
            </select>
          </div>

          {algorithmType === 'hybrid' && (
            <>
              <div className="control-group">
                <label>{t.selectionMethod}</label>
                <select 
                  value={selectionMethod} 
                  onChange={(e) => setSelectionMethod(e.target.value as SelectionMethod)}
                  disabled={isRunning}
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
                  <option value="tournament">{t.tournament}</option>
                  <option value="roulette">{t.roulette}</option>
                  <option value="rank">{t.rank}</option>
                  <option value="sus">{t.sus}</option>
                </select>
              </div>

              <div className="control-group">
                <label>{t.crossoverMethod}</label>
                <select 
                  value={crossoverMethod} 
                  onChange={(e) => setCrossoverMethod(e.target.value as CrossoverMethod)}
                  disabled={isRunning}
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
                  <option value="single-point">{t.singlePoint}</option>
                  <option value="two-point">{t.twoPoint}</option>
                  <option value="uniform">{t.uniform}</option>
                  <option value="order">{t.orderCrossover} ⭐</option>
                  <option value="pmx">{t.pmx}</option>
                </select>
              </div>

              <div className="control-group">
                <label>{t.mutationMethod}</label>
                <select 
                  value={mutationMethod} 
                  onChange={(e) => setMutationMethod(e.target.value as MutationMethod)}
                  disabled={isRunning}
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
                  <option value="random">{t.random}</option>
                  <option value="guided">{t.guided} ⭐</option>
                  <option value="inversion">{t.inversion}</option>
                  <option value="insertion">{t.insertion}</option>
                  <option value="local-search">{t.localSearch}</option>
                </select>
              </div>
            </>
          )}

          {algorithmType === 'island' && (
            <IslandControlPanel
              config={islandConfig}
              onChange={setIslandConfig}
              disabled={isRunning}
              t={t}
            />
          )}

          <h3 style={{ marginTop: '20px' }}>{t.mazeSettings}</h3>
          
          <div className="control-group">
            <label>{t.mazeSize}: {mazeSize}×{mazeSize}</label>
            <input
              type="range"
              min="15"
              max="101"
              step="2"
              value={mazeSize}
              onChange={(e) => setMazeSize(parseInt(e.target.value))}
              disabled={isRunning}
            />
          </div>
          
          <div className="control-group">
            <label>{t.animationSpeed}: {animationSpeed}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={animationSpeed}
              onChange={(e) => {
                const speed = parseInt(e.target.value);
                setAnimationSpeed(speed);
                // 更新动画管理器的速度
                if (animManagerRef.current) {
                  // 速度1-10 映射到 frameDelay 1000-100ms
                  animManagerRef.current.frameDelay = 1100 - speed * 100;
                  animManagerRef.current.transitionDuration = 1100 - speed * 100;
                }
              }}
            />
          </div>

          <div className="control-group">
            <label>{t.population}: {config.populationSize}</label>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={config.populationSize}
              onChange={(e) => setConfig({...config, populationSize: parseInt(e.target.value)})}
              disabled={isRunning}
            />
          </div>

          <div className="control-group">
            <label>{t.mutationRate}: {(config.mutationRate * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={config.mutationRate}
              onChange={(e) => setConfig({...config, mutationRate: parseFloat(e.target.value)})}
              disabled={isRunning}
            />
          </div>

          <div className="control-group">
            <label>{t.crossoverRate}: {(config.crossoverRate * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={config.crossoverRate}
              onChange={(e) => setConfig({...config, crossoverRate: parseFloat(e.target.value)})}
              disabled={isRunning}
            />
          </div>
          
          <div className="control-group">
            <label>{t.eliteRate}: {((config.elitismCount / config.populationSize) * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={config.elitismCount}
              onChange={(e) => setConfig({...config, elitismCount: parseInt(e.target.value)})}
              disabled={isRunning}
            />
          </div>

          <div className="control-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={showDetailedProcess}
                onChange={(e) => setShowDetailedProcess(e.target.checked)}
                disabled={isRunning}
              />
              {t.showExplorationProcess} ⭐
            </label>
          </div>
          
          <div className="control-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.useAdaptive}
                onChange={(e) => setConfig({...config, useAdaptive: e.target.checked})}
                disabled={isRunning}
              />
              {t.adaptiveParameters}
            </label>
          </div>

          <div className="button-group">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="btn-primary"
            >
              {isRunning ? t.running : t.start}
            </button>
            
            <button
              onClick={handlePause}
              disabled={!isRunning}
              className="btn-secondary"
              style={{
                opacity: !isRunning ? 0.5 : 1,
                cursor: !isRunning ? 'not-allowed' : 'pointer'
              }}
            >
              {isPaused ? `▶ ${t.resume}` : `⏸ ${t.pause}`}
            </button>
            
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              {t.reset}
            </button>
          </div>

          <div className="button-group">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="btn-record"
                disabled={!isRunning}
              >
                🔴 {t.record}
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="btn-record recording"
              >
                ⏹️ {t.stopSave}
              </button>
            )}
          </div>

          <h3 style={{ marginTop: '20px' }}>{t.visualizationExport}</h3>

          <div className="button-group">
            <button
              onClick={() => setShow3D(true)}
              disabled={historyData.length < 2}
              className="btn-secondary"
              style={{
                background: historyData.length < 2 ? 'var(--nord3)' : 'var(--nord10)',
                cursor: historyData.length < 2 ? 'not-allowed' : 'pointer'
              }}
            >
              🌐 {t.landscape3D}
            </button>
            
            <button
              onClick={() => setShowStats(!showStats)}
              className="btn-secondary"
            >
              {showStats ? `📊 ${t.hideStats}` : `📊 ${t.showStats}`}
            </button>
          </div>

          <div className="button-group">
            <button
              onClick={handleExportJSON}
              disabled={historyData.length === 0}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              📥 {t.exportJSON}
            </button>
            
            <button
              onClick={handleExportCSV}
              disabled={historyData.length === 0}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              📊 {t.exportCSV}
            </button>
          </div>

          <div className="button-group">
            <button
              onClick={handleExportReport}
              disabled={historyData.length === 0}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              📄 {t.exportReport}
            </button>
            
            <button
              onClick={handleExportPath}
              disabled={!currentGen}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              🛤️ {t.exportPath}
            </button>
          </div>

          <div className="info-panel">
            <h4>{t.algorithmInfo}</h4>
            <p>{t.type}: {algorithmType.charAt(0).toUpperCase() + algorithmType.slice(1)} GA</p>
            {algorithmType === 'hybrid' && (
              <>
                <p>{t.selection}: {selectionMethod}</p>
                <p>{t.crossover}: {crossoverMethod}</p>
                <p>{t.mutation}: {mutationMethod}</p>
                <p>{t.astarInit}: 15%</p>
              </>
            )}
            {algorithmType === 'island' && (
              <>
                <p>{t.islands}: {islandConfig.numIslands}</p>
                <p>{t.migrationEvery} {islandConfig.migrationInterval} {t.generations}</p>
                <p>{t.migrationTopology}: {islandConfig.migrationTopology}</p>
                <p>{t.popPerIsland}: ~{Math.floor(config.populationSize / islandConfig.numIslands)}</p>
              </>
            )}
            <p>{t.population}: {config.populationSize} {t.individuals}</p>
            <p>{t.elitism}: {config.elitismCount} ({((config.elitismCount/config.populationSize)*100).toFixed(1)}%)</p>
            <p>{t.maxSteps}: {config.maxSteps}</p>
            <p>{t.maxGenerations}: {config.maxGenerations}</p>
          </div>

          {/* Island GA状态可视化 */}
          {algorithmType === 'island' && islandResults.length > 0 && (
            <IslandVisualizer islands={islandResults} t={t} />
          )}
          
          <div className="control-group">
            <label>{t.maxGenerations}: {config.maxGenerations}</label>
            <input
              type="range"
              min="5"
              max="2000"
              step="10"
              value={config.maxGenerations}
              onChange={(e) => setConfig({...config, maxGenerations: parseInt(e.target.value)})}
              disabled={isRunning}
            />
          </div>

          {/* 统计面板 */}
          {showStats && (
            <StatisticsPanel 
              history={historyData}
              startTime={startTimeRef}
              isRunning={isRunning}
              t={t}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
