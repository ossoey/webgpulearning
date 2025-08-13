
export class SwirlDataBuffer {
  constructor(device, maxCount = 16) {
    this.device = device;
    this.maxCount = maxCount;
    const headerSize = 16;
    
    this.bufferSize = headerSize + this.structSize * this.maxCount;

// Align buffer size to next multiple of 16:
   this.bufferSize = Math.ceil(this.bufferSize / 16) * 16;

// Force override: just in case
  this.bufferSize = 288;

    this.buffer = device.createBuffer({
      size: this.bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    this.swirls = []; // current active swirls
  }

  setSwirls(swirls) {
    const bufferData = new Float32Array(this.bufferSize / 4);
    bufferData[0] = swirls.length; // count

   const baseOffset = 4 + 3; // 4 = count (1 float), 3 = padding (vec3<u32>)
   swirls.forEach((s, i) => {
    const o = baseOffset + i * 4;
    bufferData[o + 0] = s.center[0];
    bufferData[o + 1] = s.center[1];
    bufferData[o + 2] = s.radius;
    bufferData[o + 3] = s.strength;
   });

    this.device.queue.writeBuffer(this.buffer, 0, bufferData.buffer);
    this.swirls = swirls;
  }

  getBindGroupLayout() {
    return this.device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: 'read-only-storage' }
      }]
    });
  }

  getBindGroup() {
    return this.device.createBindGroup({
      layout: this.getBindGroupLayout(),
      entries: [{
        binding: 0,
        resource: { buffer: this.buffer },
      }],
    });
  }
}