// modules/webgpuSetup.js
export class WebGPUSetup {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('webgpu');
    this.device = null;
    this.format = null;
    this.depthTexture = null;
  }

  async initialize(alphaMode = "opaque") {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported in this browser.');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('Failed to get GPU adapter');

    this.device = await adapter.requestDevice();
    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.configureContext(alphaMode);
    window.addEventListener('resize', () => this.configureContext(alphaMode));

    return this;
  }

  configureContext(alphaMode) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.floor(this.canvas.clientWidth || window.innerWidth);
    const height = Math.floor(this.canvas.clientHeight || window.innerHeight);
    this.canvas.width = Math.max(1, Math.floor(width * dpr));
    this.canvas.height = Math.max(1, Math.floor(height * dpr));

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode
    });
  }

  createView() {
    return this.context.getCurrentTexture().createView();
  }
}
