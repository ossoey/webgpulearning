
export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.dpr = window.devicePixelRatio || 1;
  }

  resize() {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    this.canvas.width = Math.floor(displayWidth * this.dpr);
    this.canvas.height = Math.floor(displayHeight * this.dpr);

    // Keep logical CSS size unchanged (prevents blur)
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;
  }

  getSize() {
    return [this.canvas.width, this.canvas.height];
  }

  getAspectRatio() {
    return this.canvas.width / this.canvas.height;
  }
}