// projects/color-rect/modules/main.js
export class ColorRect {
  constructor(webgpu) {
    this.webgpu = webgpu; // { device, format, canvas, context }
    this.device = webgpu.device;
    this.format = webgpu.format;

    this.pipeline = null;
    this.uniformBuffer = null;
    this.bindGroup = null;

    this._running = false;
    this._raf = 0;
    this._t0 = 0;
    this._frameCount = 0;
  }

  async init() {
    // Load WGSL
    const shaderURL = './projects/color-rect/shaders/color_rect.wgsl';
    const code = await (await fetch(shaderURL)).text();
    const shaderModule = this.device.createShaderModule({ code });

    // Uniform buffer (16 bytes min alignment)
    this.uniformBuffer = this.device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }
      ]
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main'
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format: this.format }]
      },
      primitive: { topology: 'triangle-list' }
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } }
      ]
    });
  }

  loop() {
    if (this._running) return;
    this._running = true;
    this._t0 = performance.now();

    const frame = () => {
      if (!this._running) return;

      

      const t = (performance.now() - this._t0) / 1000; // seconds
      // write time into 16-byte uniform buffer
      const tmp = new ArrayBuffer(32);
      new DataView(tmp).setFloat32(0, t, true);
      this.device.queue.writeBuffer(this.uniformBuffer, 0, tmp);

      new DataView(tmp).setUint16(16, this._frameCount % 100, true);
      this.device.queue.writeBuffer(this.uniformBuffer, 0, tmp);

      const view = this.webgpu.createView();

      const encoder = this.device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view,
          clearValue: { r: 0.05, g: 0.06, b: 0.09, a: 1 },
          loadOp: 'clear',
          storeOp: 'store'
        }]
      });

      pass.setPipeline(this.pipeline);
      pass.setBindGroup(0, this.bindGroup);
      pass.draw(6, 1, 0, 0); // fullscreen triangle
      pass.end();

      this.device.queue.submit([encoder.finish()]);

      this._frameCount +=1;
     console.log(this._frameCount, t);

      this._raf = requestAnimationFrame(frame);
    };

    this._raf = requestAnimationFrame(frame);
  }

  stop() {
    if (!this._running) return;
    this._running = false;
    cancelAnimationFrame(this._raf);
  }

  dispose() {
    this.stop();
    // Destroy GPU resources that have explicit destroy()
    // (Buffers, textures. Pipelines/shaders are GC'ed.)
    this.uniformBuffer?.destroy?.();
  }
}
