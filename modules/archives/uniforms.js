export class Uniforms {
  constructor(device) {
    this.device = device;

    // Just 1 float (angle), padded to 16 bytes for alignment
    this.bufferSize = 16;

    this.buffer = device.createBuffer({
      size: this.bufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
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

  updateAngle(angle) {
    const data = new Float32Array([angle]);
    this.device.queue.writeBuffer(this.buffer, 0, data.buffer, 0, data.byteLength);
  }

  getBindGroup() {
    return this.bindGroup;
  }

  getLayout() {
    return this.bindGroupLayout;
  }
}
