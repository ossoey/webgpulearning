import { Utils } from '../utils.js';

export class AnimatedGeometry {
  constructor(device) {
    this.device = device;

    // Original base positions (not scaled)
    this.baseVertices = [
      { pos: [ 0.0,  0.5], color: [0.0, 0.0, 1.0] },  // top → blue
      { pos: [-0.5, -0.5], color: [1.0, 0.0, 0.0] },  // left → red
      { pos: [ 0.5, -0.5], color: [0.0, 1.0, 0.0] },  // right → green
    ];

    this.vertexBuffer = device.createBuffer({
      size: Utils.buildVertexData32(this.baseVertices).byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
  }

  update(time) {
    // Animate scale factor: 1.0 → 1.2 → 1.0 → ...
    const scale = 1.0 + 0.2 * Math.sin(time);
    const offsetY = 0.2 * Math.sin(time);

    const scaledVertices = this.baseVertices.map((v, i) => {

     const phase = time + i * 2.0;

    const r = 0.5 + 0.5 * Math.sin(phase);
    const g = 0.5 + 0.5 * Math.sin(phase + Math.PI * 0.66);
    const b = 0.5 + 0.5 * Math.sin(phase + Math.PI * 1.33);
    const pos = [v.pos[0]*scale, v.pos[1]*scale];

    return {
      pos,          // fixed position
      color: [r, g, b],         // animated color
     };

   
    });

    const vertexData = Utils.buildVertexData32(scaledVertices);
    this.device.queue.writeBuffer(this.vertexBuffer, 0, vertexData);
  }

  getBuffer() {
    return this.vertexBuffer;
  }
}