// 参数预设配置
import type { GAConfig } from '../types';

export interface PresetConfig {
  name: string;
  displayName: string;
  icon: string;
  description: string;
  config: Partial<GAConfig>;
}

export const PARAMETER_PRESETS: Record<string, PresetConfig> = {
  fast: {
    name: 'fast',
    displayName: 'Fast Convergence',
    icon: '⚡',
    description: '快速收敛，适合简单迷宫和演示',
    config: {
      populationSize: 100,
      mutationRate: 0.05,
      crossoverRate: 0.85,
      elitismCount: 5,
      maxGenerations: 200,
      maxSteps: 300
    }
  },

  quality: {
    name: 'quality',
    displayName: 'Quality First',
    icon: '🏆',
    description: '追求最优解，适合复杂迷宫',
    config: {
      populationSize: 500,
      mutationRate: 0.01,
      crossoverRate: 0.9,
      elitismCount: 25,
      maxGenerations: 1000,
      maxSteps: 800
    }
  },

  balanced: {
    name: 'balanced',
    displayName: 'Balanced',
    icon: '⚖️',
    description: '平衡速度与质量，通用推荐',
    config: {
      populationSize: 300,
      mutationRate: 0.02,
      crossoverRate: 0.8,
      elitismCount: 15,
      maxGenerations: 500,
      maxSteps: 500
    }
  },

  research: {
    name: 'research',
    displayName: 'Research',
    icon: '🔬',
    description: '科研实验，保持高多样性',
    config: {
      populationSize: 400,
      mutationRate: 0.03,
      crossoverRate: 0.75,
      elitismCount: 20,
      maxGenerations: 800,
      maxSteps: 600
    }
  },

  exploration: {
    name: 'exploration',
    displayName: 'High Diversity',
    icon: '🌈',
    description: '高多样性探索，避免过早收敛',
    config: {
      populationSize: 350,
      mutationRate: 0.08,
      crossoverRate: 0.7,
      elitismCount: 10,
      maxGenerations: 600,
      maxSteps: 500
    }
  }
};

/**
 * 应用预设到当前配置
 */
export function applyPreset(currentConfig: GAConfig, presetName: string): GAConfig {
  const preset = PARAMETER_PRESETS[presetName];
  if (!preset) return currentConfig;

  return {
    ...currentConfig,
    ...preset.config
  };
}

/**
 * 获取预设列表
 */
export function getPresetList(): PresetConfig[] {
  return Object.values(PARAMETER_PRESETS);
}

