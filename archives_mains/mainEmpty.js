import { Utils } from '../modules/utils.js';

import { MultisampleRenderTarget } from '../modules/multisampleRenderTarget.js';
import { CanvasManager } from '../modules/canvasManager.js';
import {WebGPUSetup} from '../modules/setupWebGPU.js'
import {TimeUniform} from '../modules/timeUniform.js';



import { shaderCode} from '../shaders/shader.js';


const canvas = document.getElementById('webgpu-canvas');

const webGPUSetup = new WebGPUSetup(canvas);

const {device, context, format} = await webGPUSetup.initialize(); 




const canvasManager = new CanvasManager(canvas);
canvasManager.resize(); 

window.addEventListener('resize', () => {
  canvasManager.resize();
 
});

const [width, height] = canvasManager.getSize();

const msaaTarget = new MultisampleRenderTarget(device, format, width, height);


const timeUniform = new TimeUniform(device);


// Create shader modules
const vertexModule = device.createShaderModule({ code: shaderCode });
const fragmentModule = device.createShaderModule({ code: shaderCode });



// Create pipeline
const pipeline = device.createRenderPipeline({
  layout: device.createPipelineLayout({
    bindGroupLayouts: [ timeUniform.getLayout()  ]
  }),

  vertex: {
    module: vertexModule,
    entryPoint: 'vs_main',
    buffers: [{
      arrayStride: 16,
      attributes: [
        { shaderLocation: 0, offset: 0,  format: 'float32x2' }, // position
        { shaderLocation: 1, offset: 8, format: 'float32x2' }, // uv
      ],
    }],
  },
  fragment: {
    module: fragmentModule,
    entryPoint: 'fs_main',
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

function frame() {
  time += 0.001;
  timeUniform.updateTime(time);
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
 pass.setBindGroup(0, timeUniform.getBindGroup());      
 pass.setBindGroup(1, {});   
 pass.setVertexBuffer(0, {});
 pass.setIndexBuffer({}, 'uint16');
 pass.drawIndexed({}, 1, 0, 0, 0);
 pass.end();

  device.queue.submit([encoder.finish()]);
  requestAnimationFrame(frame);
}

frame();
