// File: modules/renderers/setupWebGPU.js

export class WebGPUSetup {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('webgpu');
    this.device = null;
    this.format = null;
  }

  async initialize(alphaMode = "opaque") {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported in this browser.');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('Failed to get GPU adapter');
    }

    this.device = await adapter.requestDevice();
    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode
    });

    return {
      device: this.device,
      context: this.context,
      format: this.format,
      canvas: this.canvas
    };
  }
}
