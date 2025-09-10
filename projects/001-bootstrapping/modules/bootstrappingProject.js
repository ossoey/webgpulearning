
import {WebGPUSetup} from './webgpuSetup.js';
import { Lines } from '../../../ebika/lines.js';
import { Points } from '../../../ebika/points.js';

export class  BootstrappingProject {


    constructor(canvas, options = {}) {
        //input and canvas
          this.canvas = canvas; 
          this.setup = new WebGPUSetup(canvas, options);
          this.line = new Lines({segment: [[0.1, 0.0], [0.3, 0.4]]});
          this.points = new Points({points: [[0.1, 0.0], [0.3, 0.4], [0.1, 0.4] ], sizes: [0.009, 0.019, 0.019 ]}); 

        //gpu ref
          this.device = null; 
          this.context = null;
          this.format = null; 
          this.vBuf = null; 
          this.pipeline = null; 

          this.vBufLine = null; 
          this.pipelineLine = null; 

          this.vBufPoint = null; 
          this.pipelinePoint = null;

        //Clear ref
          this._useAltClear = false;   
          this._clearA = {r: 0.1, g: 0.3, b: 0.6, a: 1};
          this._clearB = {r: 0.3, g: 0.1, b: 0.7, a: 1}; 
          
        // events
        

        // UI
          this.hud = null;   
        // animation 
        this._raf = 0; 
        this._lastT = 0; 
        this._accum = 0; 
        this._frames = 0; 

        //bind
        this._onKey = this._onKey.bind(this);
        this._installHUD = this._installHUD.bind(this);
        this._updateFPS = this._updateFPS.bind(this);
        this._frame = this._frame.bind(this);


    }

    async start() {

        //device
        await this.setup.init();

       const {device, context, format} = this.setup.deviceInfo; 


        this.device = device; 
        this.context = context;
        this.format = format;
        
        // geometry data, 

         const vertices = new Float32Array([
            0.0, 0.6, 
            -0.6, -0.4, 
            0.6, -0.4
         ]);

         

         this.vBuf = this.device.createBuffer({
            size: vertices.byteLength, 
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
         });

         new Float32Array(   this.vBuf.getMappedRange() ).set(vertices);
         
         this.vBuf.unmap();


       const lineVerts = new Float32Array( this.line.info.segmentFlat);

       this.vBufLine = this.device.createBuffer({
            size : lineVerts.byteLength, 
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, 
            mappedAtCreation : true
       }); 

       new Float32Array(this.vBufLine.getMappedRange()).set(lineVerts);
       
       this.vBufLine.unmap(); 


 

       const pointVerts = new Float32Array( this.points.info.vertices);

       this.vBufPoint = this.device.createBuffer({
            size : pointVerts.byteLength, 
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, 
            mappedAtCreation : true
       }); 

       new Float32Array(this.vBufPoint.getMappedRange()).set(pointVerts);
       
       this.vBufPoint.unmap(); 


              // create shader
         const shaderURL = new URL('../shaders/hello-triangle.wgsl', import.meta.url);
         const code = await( await fetch(shaderURL)).text();
         const module = this.device.createShaderModule({code});


         const shaderURLLine = new URL('../shaders/line.wgsl', import.meta.url);
         const codeLine = await( await fetch(shaderURLLine)).text();
         const moduleLine = this.device.createShaderModule({code: codeLine});

        
         const shaderURLPoint = new URL('../shaders/point.wgsl', import.meta.url);
         const codePoint= await( await fetch(shaderURLPoint)).text();
         const modulePoint = this.device.createShaderModule({code: codePoint});




         this.device.pushErrorScope('internal');
         this.device.pushErrorScope('validation');

        // //  create pipeline

        this.pipeline = await this.device.createRenderPipelineAsync(
            {
                layout: 'auto', 
                vertex: {
                    module, 
                    entryPoint: 'vs_main', 
                    buffers : [
                        {
                            attributes : [{shaderLocation: 0, offset: 0, format: 'float32x2'}], 
                            arrayStride: 2*4
                            
                        }
                    ]
                }  , 

                fragment: {
                     module, 
                     entryPoint: 'fs_main', 
                     targets: [{format: this.format}]   

                } , 

                primitive : {

                    topology: 'triangle-list'
                }

            }
        );


       this.pipelineLine = await this.device.createRenderPipelineAsync(
            {
                layout: 'auto', 
                vertex: {
                    module: moduleLine, 
                    entryPoint: 'vs_main', 
                    buffers : [
                        {
                            attributes : [{shaderLocation: 0, offset: 0, format: 'float32x2'}], 
                            arrayStride: 2*4
                            
                        }
                    ]
                }  , 

                fragment: {
                     module: moduleLine, 
                     entryPoint: 'fs_main', 
                     targets: [{format: this.format}]   

                } , 

                primitive : {

                    topology: 'line-list'
                }

            }
        );


        this.pipelinePoint = await this.device.createRenderPipelineAsync(
            {
                layout: 'auto', 
                vertex: {
                    module: modulePoint, 
                    entryPoint: 'vs_main', 
                    buffers : [
                        {
                            attributes : [{shaderLocation: 0, offset: 0, format: 'float32x2'}], 
                            arrayStride: 2*4
                            
                        }
                    ]
                }  , 

                fragment: {
                     module: modulePoint, 
                     entryPoint: 'fs_main', 
                     targets: [{format: this.format}]   

                } , 

                primitive : {

                    topology: 'triangle-list'
                }

            }
        )


         const errInt = await this.device.popErrorScope(); 
        const errVal = await this.device.popErrorScope();
        
          if (errVal || errInt) throw (errVal || errInt);

        // install HUD
        this._installHUD();

        this._displayTitre();

        window.addEventListener('keydown', this._onKey); 

        this._raf = requestAnimationFrame(this._frame);
    }

    _onKey(e){

        if(e.key && e.key.toLowerCase() === 'c') {

            this._useAltClear = !this._useAltClear; 
        }

    }

    _displayTitre() {

        const titre = document.getElementById('titre'); 
        titre.textContent = 'WebGPU Gallery — Chapter 001 (Bootstrapping)';
    }

    _installHUD() {
       const div = document.createElement('div');
       div.className = 'hud';
       div.textContent = 'FPS: ... [C] toggle clear'; 
       document.body.appendChild(div);
       this.hud = div; 
    }

    _updateFPS(t) {

        if(!this._lastT) this._lastT = t; 
        const dt = (t - this._lastT)/1000; 
        this._lastT = t; 

        this._accum += dt; 
        this._frames += 1; 

        if (this._accum >= 0.5) {

            const fps = Math.round(this._frames / this._accum);
            this.hud.textContent = `FPS: ${fps}, [c] toggle clear`; 
            this._accum = 0;
            this._frames = 0;

        }
    }

    _frame(t) {

        this.setup.resize(); 

        const encoder = this.device.createCommandEncoder();

        const view = this.context.getCurrentTexture().createView();

        const pass = encoder.beginRenderPass({
            colorAttachments : [
               {
                 view, 
                 loadOp : 'clear', 
                 clearValue: this._useAltClear ? this._clearA : this._clearB, 
                 storeOp : 'store'
               }

            ]
        });

        pass.setPipeline(this.pipeline);
        pass.setVertexBuffer(0, this.vBuf);
        pass.draw(3);

      
        pass.setPipeline(this.pipelineLine);
        pass.setVertexBuffer(0, this.vBufLine);
        pass.draw(2);


        pass.setPipeline(this.pipelinePoint);
        pass.setVertexBuffer(0, this.vBufPoint);
        pass.draw(this.points.info.vertsCount);
        

        pass.end();

        this.device.queue.submit([encoder.finish()]);

        this._updateFPS(t);

        this._raf = requestAnimationFrame(this._frame);

    }

    dispose() {

        // animation
         if(this._raf) cancelAnimationFrame(this._raf);

        // event 
        window.removeEventListener('keydown', this._onKey);
    
        // ui
        if(this.hud?.parentNode) this.hud.parentNode.removeChild(this.hud);

        // gpu
        try { this.vBuf?.destroy()} catch {}

        this.setup.destroy(); 

    }


}