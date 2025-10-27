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
    populationSize: 100,
    maxGenerations: 500,
    mutationRate: 0.15,
    crossoverRate: 0.7,
    elitismCount: 2,
    maxSteps: 200,
    useAdaptive: false,
    adaptiveMode: 'hybrid'
  });

  const [mazeSize, setMazeSize] = useState<number>(21);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentGen, setCurrentGen] = useState<GenerationResult | null>(null);

  const mazeRef = useRef<Maze | null>(null);
  const animManagerRef = useRef<AnimationManager | null>(null);
  const recorderRef = useRef<WebMRecorder>(new WebMRecorder());

  // 初始化
  useEffect(() => {
    if (!canvasRef.current || !chartCanvasRef.current) return;

    const canvas = canvasRef.current;
    const chartCanvas = chartCanvasRef.current;
    
    // 设置Canvas尺寸
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight - 100;
    chartCanvas.width = window.innerWidth * 0.7;
    chartCanvas.height = 150;

    const ctx = canvas.getContext('2d')!;
    const chartCtx = chartCanvas.getContext('2d')!;

    // 创建渲染器
    const renderer = new MazeRenderer(canvas, ctx);
    const fitnessChart = new FitnessChart(chartCanvas, chartCtx);

    // 创建动画管理器
    const animManager = new AnimationManager(
      renderer,
      fitnessChart,
      (result) => setCurrentGen(result)
    );
    animManagerRef.current = animManager;

    // 生成默认迷宫
    const maze = new Maze(mazeSize, mazeSize);
    maze.generate();
    mazeRef.current = maze;
    renderer.setMaze(maze);
    renderer.clear();
    renderer.renderMaze();
    renderer.renderStartEnd(maze);

  }, []);

  const handleStart = async () => {
    if (!mazeRef.current || !animManagerRef.current) return;

    setIsRunning(true);
    setIsPaused(false);

    const GA = config.useAdaptive ? AdaptiveGeneticAlgorithm : GeneticAlgorithm;
    const ga = new GA(mazeRef.current, config);

    await animManagerRef.current.start(ga);
    setIsRunning(false);
  };

  const handlePause = () => {
    if (animManagerRef.current) {
      if (isPaused) {
        animManagerRef.current.resume();
      } else {
        animManagerRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const handleReset = () => {
    if (animManagerRef.current) {
      animManagerRef.current.reset();
    }
    setIsRunning(false);
    setIsPaused(false);
    setCurrentGen(null);

    // 重新生成迷宫
    if (canvasRef.current && mazeRef.current) {
      const maze = new Maze(mazeSize, mazeSize);
      maze.generate();
      mazeRef.current = maze;
      
      const ctx = canvasRef.current.getContext('2d')!;
      const renderer = new MazeRenderer(canvasRef.current, ctx);
      renderer.setMaze(maze);
      renderer.clear();
      renderer.renderMaze();
      renderer.renderStartEnd(maze);
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
        <h1>Genetic Algorithm Maze Solver</h1>
        {currentGen && (
          <div className="hud-stats">
            <span>Gen: {currentGen.generation}</span>
            <span>Best Fitness: {currentGen.bestFitness.toFixed(1)}</span>
            <span>Steps: {currentGen.best.path.length}</span>
            <span>Status: {currentGen.best.reachedEnd ? '✓ SUCCESS' : '⚡ EVOLVING'}</span>
          </div>
        )}
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
              max="41"
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
            <label>Mutation Rate: {config.mutationRate.toFixed(2)}</label>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={config.mutationRate}
              onChange={(e) => setConfig({...config, mutationRate: parseFloat(e.target.value)})}
              disabled={isRunning}
            />
          </div>

          <div className="control-group">
            <label>Crossover Rate: {config.crossoverRate.toFixed(2)}</label>
            <input
              type="range"
              min="0.5"
              max="0.9"
              step="0.1"
              value={config.crossoverRate}
              onChange={(e) => setConfig({...config, crossoverRate: parseFloat(e.target.value)})}
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
