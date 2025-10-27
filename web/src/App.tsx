import { useEffect, useRef, useState } from 'react';
import { Maze } from './maze/Maze';
import { GeneticAlgorithm } from './ga/GeneticAlgorithm';
import { AdaptiveGeneticAlgorithm } from './ga/AdaptiveGA';
import { MazeRenderer } from './vis/MazeRenderer';
import { AnimationManager } from './vis/AnimationManager';
import { FitnessChart } from './vis/FitnessChart';
import { WebMRecorder } from './utils/recorder';
import type { GAConfig, GenerationResult } from './types';
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
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentGen, setCurrentGen] = useState<GenerationResult | null>(null);
  const [fps, setFps] = useState<number>(60);

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

    // 生成默认迷宫
    const maze = new Maze(mazeSize, mazeSize);
    maze.generate();
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

    const GA = config.useAdaptive ? AdaptiveGeneticAlgorithm : GeneticAlgorithm;
    const ga = new GA(mazeRef.current, config);

    await animManagerRef.current.start(ga);
    setIsRunning(false);
    setIsPaused(false);
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
      maze.generate();
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

  return (
    <div className="app">
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
          <canvas ref={canvasRef} />
          <canvas ref={chartCanvasRef} className="fitness-chart" />
        </div>

        {/* 控制面板 */}
        <div className="control-panel">
          <h3>Parameters</h3>
          
          <div className="control-group">
            <label>Maze Size: {mazeSize}×{mazeSize}</label>
            <input
              type="range"
              min="15"
              max="51"
              step="2"
              value={mazeSize}
              onChange={(e) => setMazeSize(parseInt(e.target.value))}
              disabled={isRunning}
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
            >
              {isPaused ? 'Resume' : 'Pause'}
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

          <div className="info-panel">
            <h4>Algorithm Info</h4>
            <p>Type: {config.useAdaptive ? 'Adaptive GA' : 'Standard GA'}</p>
            <p>Elitism: {config.elitismCount}</p>
            <p>Max Steps: {config.maxSteps}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
