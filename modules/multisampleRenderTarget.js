export class MultisampleRenderTarget {
  constructor(device, format, width, height, sampleCount = 4) {
    this.device = device;
    this.format = format;
    this.sampleCount = sampleCount;

    this.resize(width, height);
  }

  resize(width, height) {
    this.texture = this.device.createTexture({
      size: [width, height],
      format: this.format,
      sampleCount: this.sampleCount,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this._view = this.texture.createView();
  }

  getTextureView() {
    return  this._view ?? this.texture.createView();
  }

  getSampleCount() {
    return this.sampleCount;
  }
}