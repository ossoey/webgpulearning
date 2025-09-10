
import { WebGPUSetup } from "../../../modules/webgpuSetup.js";

export class BootstrappingProject {

    constructor(canvas, options = {}) {
     
         // inputs and initialisation refs

        this.canvas = canvas; 
        this.setup = new WebGPUSetup(canvas, options);

         // webGpu and clear ref
        this.device = null;
        this.context = null;
        this.format = null; 
        this.pipeline = null; 
        this.vBuf = null;    

        this._useAltClear = false; 
        this.clearA = {r: 0.9, g: 0.9, b: 0.9, a: 1.0};
        this.clearB = {r: 0.1, g: 0.1, b: 0.33, a: 1.0};

         // display ref

        this.hud = null;
        this._lastT = 0;
        this._accum = 0;
        this._frames = 0;

        //animation 
        this._raf = 0;

        // bind ref 
        this._onKey = this._onKey.bind(this);
        this._installHUD = this._installHUD.bind(this);
        this._updateFPS = this._updateFPS.bind(this);
        this._frame = this._frame.bind(this);
        
    }

    async start () {

        // Device info

        const {device, context, format} = await this.setup.init();

        this.device = device; 
        this.context  = context; 
        this.format  = format; 
        
        // Create data

        const verts = new Float32Array([
            0.0, 0.6, 
            -0.6 , -0.4, 
            0.6, -0.4,
            0.0, 0.6, 
        ]);

        this.vBuf = this.device.createBuffer({
                size: verts.byteLength, 
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation : true

        });

        new Float32Array(this.vBuf.getMappedRange()).set(verts);
        this.vBuf.unmap();

        //create shader

        const shaderURL = new  URL('../shaders/hello-triangle.wgsl', import.meta.url);
        const code =   await(await (fetch(shaderURL))).text();
        const module = this.device.createShaderModule({code});

         
        // create pipeline
        this.device.pushErrorScope('internal'); 
        this.device.pushErrorScope('validation');
        
        this.pipeline = await this.device.createRenderPipelineAsync({
            layout : 'auto', 
            vertex: {
                module,
                entryPoint: 'vs_main', 
                buffers : [
                  {
                    arrayStride: 2*4, 
                    stepMode : 'vertex', 
                    attributes : [
                        {
                            shaderLocation : 0, 
                            offset : 0, 
                            format: 'float32x2'
                        }
                    ]
                  }
                ]

            } ,  
            fragment: {
                module, 
                entryPoint: 'fs_main', 
                targets : [{format: this.format}]
            } , 
            primitive: {
                topology : 'triangle-list', 
                cullMode: 'none'
            }
        })
        

        const intErr = await this.device.popErrorScope();
        const valErr = await this.device.popErrorScope();

        if (intErr || valErr) throw (intErr|| valErr);

        // create ui
        this._installHUD();
        
        // events

        window.addEventListener('keydown', this._onKey);
        

        // Start animation
          this._raf = requestAnimationFrame(this._frame);

    }

    _onKey (e) {

         console.log('key pressed');

          if(e.key && e.key.toLowerCase() === 'c') {
             this._useAltClear = !this._useAltClear;
          }
    }

    _installHUD () {
        const div  = document.createElement('div');
        div.className = 'hud';
        div.textContent = 'FPS:... [C] toggle clear';
        document.body.appendChild(div);
        this.hud = div; 
    }

    _updateFPS(t) {

        if(!this._lastT) this._lastT = t; 
        const dt = (t - this._lastT)/1000; 
        this._lastT = t; 
        this._accum += dt; 
        this._frames += 1; 
        
        if(this._accum >=0.5) {

            const fps = Math.round(this._frames / this._accum);
            if(this.hud) this.hud.textContent =  `FPS: ${fps},  [C] toggle clear`;
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
                    loadOp: 'clear', 
                    clearValue : this._useAltClear? this.clearA : this.clearB,  
                    storeOp : 'store'
                }
            ]
        });

        pass.setPipeline(this.pipeline);
        pass.setVertexBuffer(0, this.vBuf);
        pass.draw(4);
        pass.end();

        this.device.queue.submit([encoder.finish()]);


        this._updateFPS(t);

        this.raf = requestAnimationFrame(this._frame);

    }

    dispose() {

      // animation
        if(this._raf) cancelAnimationFrame();

      // events; 
         window.removeEventListener('keydown', this._onKey);


      // ui 

        if(this.hud?.parentNode) this.hud.parentNode.removeChild(this.hud);

      // gpu

        try {this.vBuf?.detroy()} catch {}

        this.setup.destroy();

    }

}