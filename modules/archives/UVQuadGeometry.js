import { Utils } from '../utils.js';

export class UVQuadGeometry {
  constructor(device) {
    this.device = device;

    // Position in NDC (X, Y), UV (U, V)
    this.vertices = [
      //  X     Y       U    V
      { pos: [-1, -1], uv: [0, 1] },
      { pos: [ 1, -1], uv: [1, 1] },
      { pos: [-1,  1], uv: [0, 0] },
      { pos: [ 1,  1], uv: [1, 0] },
    ];

    // Triangle strip index order
    this.indices = new Uint16Array([0, 1, 2, 2, 1, 3]);

    const vertexData = UVQuadGeometry.buildVertexData(this.vertices);

    this.vertexBuffer = device.createBuffer({
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
    this.vertexBuffer.unmap();

    this.indexBuffer = device.createBuffer({
      size: this.indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Uint16Array(this.indexBuffer.getMappedRange()).set(this.indices);
    this.indexBuffer.unmap();
  }

  static buildVertexData(verts) {
    const floatsPerVertex = 4; // vec2 position + vec2 uv
    const data = new Float32Array(verts.length * floatsPerVertex);
    verts.forEach((v, i) => {
      const vertexNdx = i * floatsPerVertex;
      data[vertexNdx + 0] = v.pos[0];
      data[vertexNdx + 1] = v.pos[1];
      data[vertexNdx + 2] = v.uv[0];
      data[vertexNdx + 3] = v.uv[1];
    });
    return data;
  }

  getVertexBuffer() {
    return this.vertexBuffer;
  }

  getIndexBuffer() {
    return this.indexBuffer;
  }

  getIndexCount() {
    return this.indices.length;
  }
}
