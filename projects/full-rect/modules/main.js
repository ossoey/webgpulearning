// Minimal, focused project: create pipeline, vertex buffer, draw 6 verts.
import rectWGSL from '../shaders/rect.wgsl?raw';

export async function createProject(env) {
  const { device, context, format, msaa } = env;

  // 1) Shader
  const shader = device.createShaderModule({ code: rectWGSL });

  // 2) Vertex buffer: 6 verts, each [x, y, r, g, b]
  // Full-rect formed by two triangles
  const verts = new Float32Array([
    // x,   y,     r,   g,   b
    -1,  -1,     1,   0,   0,   // tri 1
     1,  -1,     0,   1,   0,
     1,   1,     0,   0,   1,

    -1,  -1,     1,   0,   0,   // tri 2
     1,   1,     0,   0,   1,
    -1,   1,     1,   1,   0,
  ]);
  const vbuf = device.createBuffer({
    size: verts.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float32Array(vbuf.getMappedRange()).set(verts);
  vbuf.unmap();

  // 3) Pipeline
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shader,
      entryPoint: 'vs_main',
      buffers: [
        {
          arrayStride: 5 * 4, // 5 floats per vertex
          attributes: [
            { shaderLocation: 0, offset: 0,            format: 'float32x2' }, // pos
            { shaderLocation: 1, offset: 2 * 4,        format: 'float32x3' }, // col
          ],
        },
      ],
    },
    fragment: {
      module: shader,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    multisample: {
      count: msaa.getSampleCount()?? 4,
    },
    primitive: { topology: 'triangle-list' },
  });

  // 4) Frame: clear + draw
  function frame(/* dt */) {
    const currentView = context.getCurrentTexture().createView();

    const encoder = device.createCommandEncoder();

    // MSAA: render to msaa.colorView and resolve into swapchain view
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: msaa.getTextureView(),                 // multisampled color
        resolveTarget: currentView,           // resolve to swapchain
        clearValue: { r: 0.04, g: 0.05, b: 0.08, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vbuf);
    pass.draw(6);
    pass.end();

    device.queue.submit([encoder.finish()]);
  }

  // 5) Cleanup
  function destroy() {
    try { vbuf.destroy(); } catch {}
    // shader/pipeline are freed with device lifetime; explicit destroy not required
  }

  return { frame, destroy };
}
