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
import { WebMRecorder } from './utils/recorder';
import { DataExporter, type ExperimentData } from './utils/DataExporter';
import type { GAConfig, GenerationResult, AlgorithmType, SelectionMethod, CrossoverMethod, MutationMethod } from './types';
import './App.css';

function App() {
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
          // TODO: 岛屿模型需要特殊处理
          ga = new AdaptiveGeneticAlgorithm(mazeRef.current, config);
          break;
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
    setIsRunning(false);
    setIsPaused(false);
    setCurrentGen(null);
    setFps(60);

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
  };

  const handleExportCSV = () => {
    if (historyData.length === 0) return;
    DataExporter.exportCSV(historyData);
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
  };

  const handleExportPath = () => {
    if (!currentGen) return;
    DataExporter.exportBestPath(currentGen.best.path, currentGen.generation);
  };

  return (
    <div className="app">
      {/* 3D可视化覆盖层 */}
      {show3D && historyData.length > 0 && (
        <FitnessLandscape3D 
          history={historyData} 
          onClose={() => setShow3D(false)}
        />
      )}

      {/* HUD */}
      <div className="hud">
        <div className="hud-left">
          <h1>Genetic Algorithm Maze Solver</h1>
          {currentGen && (
            <div className="hud-stats">
              <div className="stat">
                <span className="label">Generation</span>
                <span className="value highlight">{currentGen.generation}</span>
              </div>
              <div className="stat">
                <span className="label">Best Fitness</span>
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
                  <div className="fitness-badge">SOLVED!</div>
                )}
              </div>
              <div className="stat">
                <span className="label">Avg Fitness</span>
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
                <span className="label">Diversity</span>
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
                <span className="label">Steps</span>
                <span className="value">{currentGen.best.path.length}</span>
                <span className="sub-value">
                  {currentGen.best.reachedEnd ? 'Optimal' : 'Searching...'}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="hud-right">
          <div className="fps-display">
            <span className="label">FPS</span>
            <span className="value" style={{
              color: fps >= 58 ? '#A3BE8C' : fps >= 50 ? '#EBCB8B' : '#BF616A',
              fontSize: '20px'
            }}>
              {fps}
            </span>
          </div>
          {currentGen && (
            <div className={`status ${currentGen.best.reachedEnd ? 'success' : 'running'}`}>
              {currentGen.best.reachedEnd ? '✓ SUCCESS' : '⚡ EVOLVING'}
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
          <h3>Algorithm Configuration</h3>
          
          <div className="control-group">
            <label>Algorithm Type</label>
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
              <option value="standard">Standard GA</option>
              <option value="adaptive">Adaptive GA</option>
              <option value="hybrid">Hybrid GA ⭐</option>
              <option value="island">Island GA (Experimental)</option>
            </select>
          </div>

          {algorithmType === 'hybrid' && (
            <>
              <div className="control-group">
                <label>Selection Method</label>
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
                  <option value="tournament">Tournament</option>
                  <option value="roulette">Roulette Wheel</option>
                  <option value="rank">Rank Selection</option>
                  <option value="sus">Stochastic Universal Sampling</option>
                </select>
              </div>

              <div className="control-group">
                <label>Crossover Method</label>
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
                  <option value="single-point">Single-Point</option>
                  <option value="two-point">Two-Point</option>
                  <option value="uniform">Uniform</option>
                  <option value="order">Order Crossover (OX) ⭐</option>
                  <option value="pmx">Partially Mapped (PMX)</option>
                </select>
              </div>

              <div className="control-group">
                <label>Mutation Method</label>
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
                  <option value="random">Random</option>
                  <option value="guided">Guided (Heuristic) ⭐</option>
                  <option value="inversion">Inversion</option>
                  <option value="insertion">Insertion (Loop Removal)</option>
                  <option value="local-search">Local Search (2-opt)</option>
                </select>
              </div>
            </>
          )}

          <h3 style={{ marginTop: '20px' }}>Maze Settings</h3>
          
          <div className="control-group">
            <label>Maze Size: {mazeSize}×{mazeSize}</label>
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
            <label>Animation Speed: {animationSpeed}/10</label>
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
            <label>Population: {config.populationSize}</label>
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
            <label>Mutation Rate: {(config.mutationRate * 100).toFixed(0)}%</label>
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
            <label>Crossover Rate: {(config.crossoverRate * 100).toFixed(0)}%</label>
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
            <label>Elite Rate: {((config.elitismCount / config.populationSize) * 100).toFixed(0)}%</label>
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
              Show Exploration Process ⭐
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
              Adaptive Parameters
            </label>
          </div>

          <div className="button-group">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="btn-primary"
            >
              {isRunning ? 'Running...' : 'Start'}
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
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>

          <div className="button-group">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="btn-record"
                disabled={!isRunning}
              >
                🔴 Record
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="btn-record recording"
              >
                ⏹️ Stop & Save
              </button>
            )}
          </div>

          <h3 style={{ marginTop: '20px' }}>Visualization & Export</h3>

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
              🌐 3D Landscape
            </button>
            
            <button
              onClick={() => setShowStats(!showStats)}
              className="btn-secondary"
            >
              {showStats ? '📊 Hide Stats' : '📊 Show Stats'}
            </button>
          </div>

          <div className="button-group">
            <button
              onClick={handleExportJSON}
              disabled={historyData.length === 0}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              📥 Export JSON
            </button>
            
            <button
              onClick={handleExportCSV}
              disabled={historyData.length === 0}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              📊 Export CSV
            </button>
          </div>

          <div className="button-group">
            <button
              onClick={handleExportReport}
              disabled={historyData.length === 0}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              📄 Export Report
            </button>
            
            <button
              onClick={handleExportPath}
              disabled={!currentGen}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              🛤️ Export Path
            </button>
          </div>

          <div className="info-panel">
            <h4>Algorithm Info</h4>
            <p>Type: {algorithmType.charAt(0).toUpperCase() + algorithmType.slice(1)} GA</p>
            {algorithmType === 'hybrid' && (
              <>
                <p>Selection: {selectionMethod}</p>
                <p>Crossover: {crossoverMethod}</p>
                <p>Mutation: {mutationMethod}</p>
                <p>A* Init: 15%</p>
              </>
            )}
            <p>Population: {config.populationSize} individuals</p>
            <p>Elitism: {config.elitismCount} ({((config.elitismCount/config.populationSize)*100).toFixed(1)}%)</p>
            <p>Max Steps: {config.maxSteps}</p>
            <p>Max Generations: {config.maxGenerations}</p>
          </div>
          
          <div className="control-group">
            <label>Max Generations: {config.maxGenerations}</label>
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
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
