export class TextureLoader {
  constructor(device, imageURL) {
    this.device = device;
    this.imageURL = imageURL;
  }

  async load() {
    const img = new Image();
    img.src = this.imageURL;
    await img.decode();

    const imageBitmap = await createImageBitmap(img);

    this.texture = this.device.createTexture({
      size: [imageBitmap.width, imageBitmap.height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING |
             GPUTextureUsage.COPY_DST |
             GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      { texture: this.texture },
      [imageBitmap.width, imageBitmap.height]
    );

    this.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      ],
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: this.texture.createView() },
      ],
    });
  }

  getBindGroupLayout() {
    return this.bindGroupLayout;
  }

  getBindGroup() {
    return this.bindGroup;
  }
}
