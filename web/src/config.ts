// 配置文件 - 基于用户规格
export const CONFIG = {
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#0f1115'
  },
  
  maze: {
    wallColor: '#1c1f26',
    pathColor: {
      default: 'rgba(255, 255, 255, 0.18)',
      best: 'rgba(0, 255, 255, 1.0)'
    },
    bestPathGlow: {
      radius: 8,
      color: 'rgba(0, 255, 255, 0.8)'
    },
    gridLines: {
      enabled: true,
      color: 'rgba(255, 255, 255, 0.15)'
    }
  },
  
  animation: {
    frameRate: 60,
    generationDelay: 200,  // 每代停留时间
    transitionDuration: 300,  // 过渡动画时长
    easing: 'easeInOutCubic',
    smoothTransitions: true,
    fadeTrails: true
  },
  
  pathTrail: {
    enabled: true,
    fadeDuration: 60,
    color: 'rgba(255, 255, 255, 0.18)'
  },
  
  ga: {
    populationSize: 300,
    crossoverRate: 0.8,
    mutationRate: 0.02,
    eliteRate: 0.05,
    maxSteps: 200
  },
  
  performance: {
    fpsTarget: 60,
    showFPS: true,
    canvasOptimization: true,
    batchRendering: true,
    offscreenCanvas: true
  }
} as const;

