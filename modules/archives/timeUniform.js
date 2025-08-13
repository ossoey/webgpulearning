export class TimeUniform {
  constructor(device) {
    this.device = device;
    this.bufferSize = 16; // 4-byte float + 12-byte pad

    this.buffer = device.createBuffer({
      size: this.bufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      }],
    });

    this.bindGroup = device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [{
        binding: 0,
        resource: { buffer: this.buffer },
      }],
    });
  }

  updateTime(t) {
    const data = new Float32Array([t]);
    this.device.queue.writeBuffer(this.buffer, 0, data.buffer, 0, data.byteLength);
  }

  getBindGroup() {
    return this.bindGroup;
  }

  getLayout() {
    return this.bindGroupLayout;
  }
}
