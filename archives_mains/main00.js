import { Utils } from '../modules/utils.js';
import { Uniforms } from '../modules/uniforms.js';
import { MultisampleRenderTarget } from '../modules/multisampleRenderTarget.js';
import { CanvasManager } from '../modules/canvasManager.js';
import { AnimatedGeometry } from '../modules/archives/animatedGeometry.js';

import { vertexShaderCode } from '../shaders/shader.js';
import { fragmentShaderCode } from '../shaders/shader.js';

const canvas = document.getElementById('webgpu-canvas');




const canvasManager = new CanvasManager(canvas);
canvasManager.resize(); 

window.addEventListener('resize', () => {
  canvasManager.resize();
 
});

const [width, height] = canvasManager.getSize();

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');

const format = navigator.gpu.getPreferredCanvasFormat();

context.configure({ device, format, alphaMode: 'opaque' });


const msaaTarget = new MultisampleRenderTarget(device, format, width, height);


// Define WGSL shaders
// const vertexShaderCode = `
//   struct VertexOutput {
//     @builtin(position) Position : vec4<f32>,
//     @location(0) fragColor : vec3<f32>,
//   };

//   @vertex
//   fn main(
//     @location(0) position : vec2<f32>,
//     @location(1) color : vec3<f32>
//   ) -> VertexOutput {
//     var output : VertexOutput;
//     output.Position = vec4<f32>(position, 0.0, 1.0);
//     output.fragColor = color;
//     return output;
//   }
// `;

// const fragmentShaderCode = `
//   @fragment
//   fn main(@location(0) fragColor : vec3<f32>) -> @location(0) vec4<f32> {
//     return vec4<f32>(fragColor, 1.0);
//   }
// `;

// Create shader modules
const vertexModule = device.createShaderModule({ code: vertexShaderCode });
const fragmentModule = device.createShaderModule({ code: fragmentShaderCode });



 
// const vertexData = Utils.buildVertexData32([
//   { pos: [0.0, 0.5], color: [0.0, 0.0, 1.0] },   // blue
//   { pos: [-0.5, -0.5], color: [1.0, 0.0, 0.0] }, // red
//   { pos: [0.5, -0.5], color: [0.0, 1.0, 0.0] },  // green
// ]);



const geometry = new AnimatedGeometry(device);

const uniforms = new Uniforms(device);

// Create pipeline
const pipeline = device.createRenderPipeline({
  layout: device.createPipelineLayout({
    bindGroupLayouts: [uniforms.getLayout()]
  }),

  vertex: {
    module: vertexModule,
    entryPoint: 'main',
    buffers: [{
      arrayStride: 32,
      attributes: [
        { shaderLocation: 0, offset: 0,  format: 'float32x2' }, // position
        { shaderLocation: 1, offset: 16, format: 'float32x3' }, // color
      ],
    }],
  },
  fragment: {
    module: fragmentModule,
    entryPoint: 'main',
    targets: [{ format }],
  },
  primitive: {
    topology: 'triangle-list',
  },
  
  multisample: {
    count:  msaaTarget.getSampleCount(),
  },
});

let time = 0;
let time1 = 0;
function frame() {
  time += 0.001;
  time1+= 0.007;
  uniforms.updateAngle(time);
  geometry.update(time1);

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: msaaTarget.getTextureView(),  
      resolveTarget: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
    }],
  });

  pass.setPipeline(pipeline);
  pass.setVertexBuffer(0, geometry.getBuffer());
  pass.setBindGroup(0, uniforms.getBindGroup());
  pass.draw(3, 1, 0, 0);
  pass.end();

  device.queue.submit([encoder.finish()]);
  requestAnimationFrame(frame);
}

frame();
