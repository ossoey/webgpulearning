// main.js
import { WebGPUSetup } from './modules/setupWebGPU.js';
import { CanvasManager } from './modules/canvasManager.js';
import { MultisampleRenderTarget } from './modules/multisampleRenderTarget.js';
import { ProjectRunner } from './modules/projectRunner.js';

import { discoverProjects } from './modules/projectRegistry.js';
import { GalleryController } from './modules/galleryController.js';
import { OverlayController } from './modules/overlayController.js';
 

class AppShell {
  constructor(canvas, { alphaMode = 'opaque', sampleCount = 4 } = {}) {
    this.canvas = canvas;
    this.alphaMode = alphaMode;
    this.sampleCount = sampleCount;

    // Will be filled in init()
    this.device = null;
    this.context = null;
    this.format = null;

    this.canvasManager = null;
    this.msaa = null;

    // Render loop state (we’ll attach a project later)
    this.prevTime = 0;
    this.current = { frame: null, destroy: null };
    this._onResize = this._onResize.bind(this);
    this._loop = this._loop.bind(this);
  }

  async init() {
    // 1) WebGPU (device/context/format)
    const webGPU = new WebGPUSetup(this.canvas);
    const { device, context, format } = await webGPU.initialize(this.alphaMode);
    this.device = device;
    this.context = context;
    this.format = format;

    // 2) Canvas sizing
    this.canvasManager = new CanvasManager(this.canvas);
    this.canvasManager.resize();

    // 3) MSAA target (color buffer we’ll resolve into the swapchain each frame)
    const [width, height] = this.canvasManager.getSize();
    this.msaa = new MultisampleRenderTarget(
      this.device,
      this.format,
      width,
      height,
      this.sampleCount
    );

    // 4) Listen to window resizes and update both canvas + MSAA
    window.addEventListener('resize', this._onResize);
  }

  // Called when window size changes
  _onResize() {
    this.canvasManager.resize();
    const [w, h] = this.canvasManager.getSize();
    this.msaa.resize(w, h); // assumes your class exposes resize(width, height)
    // If your WebGPUSetup/config requires re-configuring the context, do it here.
    // (Some setups reconfigure after size change; if your setup handles it, skip.)
  }

  // Attach a project later (we’ll build this in next steps)
  setProject(api) {
    // Clean any previous project
    if (this.current.destroy) {
      try { this.current.destroy(); } catch (e) { console.warn('destroy error:', e); }
    }
    this.current = api || { frame: null, destroy: null };
  }

  // Simple loop skeleton (no drawing yet)
  _loop(t) {
    const dt = (t - this.prevTime) / 1000;
    this.prevTime = t;

    if (this.current.frame) {
      // We’ll pass env shortly; for now, project frame just gets dt
      this.current.frame(dt);
    }
    requestAnimationFrame(this._loop);
  }

  run() {
    requestAnimationFrame(this._loop);
  }

  // (Optional) Environment object passed to projects later
  get env() {
    return {
      device: this.device,
      context: this.context,
      format: this.format,
      canvas: this.canvas,
      canvasManager: this.canvasManager,
      msaa: this.msaa,
      
    };
  }
}



const slider = document.getElementById('overlayOpacity');
const out = document.getElementById('overlayOpacityVal');

// Attach to :root so it affects all sections (you could target just the main section if you prefer)
const overlayCtl = new OverlayController({
  sliderEl: slider,
  valueEl: out,
  target: document.documentElement
});

// (optional) if you want to initialize from current computed value instead of slider default:
const current = getComputedStyle(document.documentElement).getPropertyValue('--overlay-opacity').trim();
if (current) {
  slider.value = current;
  out.textContent = parseFloat(current).toFixed(2);
}


// --- Bootstrap: Step 1 only ---
const canvas = document.getElementById('gfx');
const app = new AppShell(canvas, { alphaMode: 'opaque', sampleCount: 4 });
await app.init();
app.run();

const runner = new ProjectRunner(app);



// 1) Discover projects
const registry = discoverProjects();

// 2) Build gallery and hook selection
const galleryEl = document.getElementById('gallery');

const gallery = new GalleryController({ listEl: galleryEl, registry, runner });

gallery.render();

// 3) Auto-select the first project if none selected
if (registry.items.length > 0) {
  gallery.select(registry.items[0]);
}



//await runner.loadFromModule(FullRect);


// For now, there’s no project attached.
// Next step we’ll add a tiny “ProjectRunner” and hook up the gallery selection to app.setProject(...).



// import { Utils } from './modules/utils.js';
// import { Uniforms } from './modules/archives/uniforms.js';
// import { MultisampleRenderTarget } from './modules/multisampleRenderTarget.js';
// import { CanvasManager } from './modules/canvasManager.js';
// import {WebGPUSetup} from './modules/setupWebGPU.js'
// import {TimeUniform} from './modules/timeUniform.js'


// import {SwirlDataBuffer} from './modules/swirlDataBuffer.js'
// import {TextureLoader} from './modules/textureLoader.js'

 

// import {UVQuadGeometry} from './modules/UVQuadGeometry.js'


// import { shaderCode} from './shaders/shader.js';


// const canvas = document.getElementById('webgpu-canvas');

// const webGPUSetup = new WebGPUSetup(canvas);

// const {device, context, format} = await webGPUSetup.initialize("opaque"); 



// const canvasManager = new CanvasManager(canvas);
// canvasManager.resize(); 

// window.addEventListener('resize', () => {
//   canvasManager.resize();
 
// });

// const [width, height] = canvasManager.getSize();

// const msaaTarget = new MultisampleRenderTarget(device, format, width, height);


// const timeUniform = new TimeUniform(device);

// // const swirls = new SwirlDataBuffer(device);
// // swirls.setSwirls([
// //   { center: [0.3, 0.3], radius: 0.3, strength: 3.0 },
// //   { center: [0.7, 0.5], radius: 0.2, strength: 2.0 },
// //   { center: [0.5, 0.7], radius: 0.25, strength: 2.5 },
// // ]);

// const textureLoader  = new TextureLoader(device, "./assets/sample.jpg")
// await textureLoader.load(); 


// const quad  = new UVQuadGeometry(device);


// // const vertexShaderCode = `
// //   struct VertexOutput {
// //     @builtin(position) Position : vec4<f32>,
// //     @location(0) fragColor : vec3<f32>,
// //   };

// //   @vertex
// //   fn main(
// //     @location(0) position : vec2<f32>,
// //     @location(1) color : vec3<f32>
// //   ) -> VertexOutput {
// //     var output : VertexOutput;
// //     output.Position = vec4<f32>(position, 0.0, 1.0);
// //     output.fragColor = color;
// //     return output;
// //   }
// // `;

// // const fragmentShaderCode = `
// //   @fragment
// //   fn main(@location(0) fragColor : vec3<f32>) -> @location(0) vec4<f32> {
// //     return vec4<f32>(fragColor, 1.0);
// //   }
// // `;

// // Create shader modules
// const vertexModule = device.createShaderModule({ code: shaderCode });
// const fragmentModule = device.createShaderModule({ code: shaderCode });





 

// // Create pipeline
// const pipeline = device.createRenderPipeline({
//   layout: device.createPipelineLayout({
//     bindGroupLayouts: [ timeUniform.getLayout(), 
//                          textureLoader.getBindGroupLayout()   ]
//   }),

//   vertex: {
//     module: vertexModule,
//     entryPoint: 'vs_main',
//     buffers: [{
//       arrayStride: 16,
//       attributes: [
//         { shaderLocation: 0, offset: 0,  format: 'float32x2' }, // position
//         { shaderLocation: 1, offset: 8, format: 'float32x2' }, // uv
//       ],
//     }],
//   },
//   fragment: {
//     module: fragmentModule,
//     entryPoint: 'fs_main',
//     targets: [{ format }],
//   },
//   primitive: {
//     topology: 'triangle-list',
//   },
  
//   multisample: {
//     count:  msaaTarget.getSampleCount(),
//   },
// });

// let time = 0.09;

// function frame() {
//   time += 0.007;


//   timeUniform.updateTime(time);
//   const encoder = device.createCommandEncoder();
//   const pass = encoder.beginRenderPass({
//     colorAttachments: [{
//       view: msaaTarget.getTextureView(),  
//       resolveTarget: context.getCurrentTexture().createView(),
//       loadOp: 'clear',
//       storeOp: 'store',
//       clearValue: { r: 0, g: 0, b: 0, a: 1 },
//     }],
//   });


//  pass.setPipeline(pipeline);
//  pass.setBindGroup(0, timeUniform.getBindGroup());    
//  pass.setBindGroup(1, textureLoader.getBindGroup());   
//  pass.setVertexBuffer(0, quad.getVertexBuffer());
//  pass.setIndexBuffer(quad.getIndexBuffer(), 'uint16');
//  pass.drawIndexed(quad.getIndexCount(), 1, 0, 0, 0);
//  pass.end();

//   device.queue.submit([encoder.finish()]);
//   requestAnimationFrame(frame);
// }

// frame();
