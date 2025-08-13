export class Utils {
  /**
   * Build vertex data padded to 32 bytes per vertex:
   * - pos: vec2<f32> (2 floats)
   * - padding (2 floats)
   * - color: vec3<f32> (3 floats)
   * - tail padding (1 float)
   * => total: 8 floats = 32 bytes
   * 
   * @param {Array<{pos: [number, number], color: [number, number, number]}>} vertices 
   * @returns {Float32Array}
   */
  static buildVertexData32(vertices) {
    const floatsPerVertex = 8;
    const data = new Float32Array(vertices.length * floatsPerVertex);

    vertices.forEach((v, i) => {
      const offset = i * floatsPerVertex;
      const [x, y] = v.pos;
      const [r, g, b] = v.color;

      data[offset + 0] = x; // pos.x
      data[offset + 1] = y; // pos.y
      data[offset + 2] = 0; // padding
      data[offset + 3] = 0; // padding
      data[offset + 4] = r; // color.r
      data[offset + 5] = g; // color.g
      data[offset + 6] = b; // color.b
      data[offset + 7] = 0; // tail padding
    });

    return data;
  }
}
