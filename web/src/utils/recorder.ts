// WebM录制器
export class WebMRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private isRecording: boolean = false;

  async start(canvas: HTMLCanvasElement, fps: number = 30): Promise<void> {
    if (this.isRecording) return;

    try {
      const stream = canvas.captureStream(fps);
      
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      };

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Not recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        this.isRecording = false;
        console.log('Recording stopped, size:', blob.size);
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  download(blob: Blob, filename: string = 'evolution.webm'): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

