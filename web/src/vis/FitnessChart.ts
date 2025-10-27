// 适应度图表 - Canvas实现
export class FitnessChart {
  bestData: number[] = [];
  avgData: number[] = [];
  maxDataPoints: number = 500;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  addPoint(_generation: number, bestFitness: number, avgFitness: number): void {
    this.bestData.push(bestFitness);
    this.avgData.push(avgFitness);

    if (this.bestData.length > this.maxDataPoints) {
      this.bestData.shift();
      this.avgData.shift();
    }
  }

  clear(): void {
    this.bestData = [];
    this.avgData = [];
  }

  render(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const padding = 40;

    // 清空
    this.ctx.fillStyle = '#3B4252';
    this.ctx.fillRect(0, 0, width, height);

    if (this.bestData.length < 2) return;

    // 计算范围
    const allData = [...this.bestData, ...this.avgData];
    const minFit = Math.min(...allData);
    const maxFit = Math.max(...allData);
    const range = maxFit - minFit || 1;

    // 绘制网格
    this.ctx.strokeStyle = '#4C566A';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * i / 5;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(width - padding, y);
      this.ctx.stroke();
    }

    // 绘制曲线
    const drawLine = (data: number[], color: string, lineWidth: number) => {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.beginPath();
      data.forEach((value, idx) => {
        const x = padding + (width - 2 * padding) * idx / (data.length - 1);
        const y = height - padding - ((value - minFit) / range) * (height - 2 * padding);
        
        if (idx === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();
    };

    // 平均适应度（虚线）
    this.ctx.setLineDash([5, 5]);
    drawLine(this.avgData, '#D08770', 2);
    
    // 最佳适应度（实线）
    this.ctx.setLineDash([]);
    drawLine(this.bestData, '#88C0D0', 3);

    // 图例
    this.ctx.font = '12px -apple-system, sans-serif';
    this.ctx.fillStyle = '#ECEFF4';
    this.ctx.fillText('Best', width - 100, 20);
    this.ctx.fillStyle = '#D08770';
    this.ctx.fillText('Avg', width - 50, 20);
  }
}

