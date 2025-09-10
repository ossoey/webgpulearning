
export class WebGPUSetup {

    constructor (canvas, 
                {alphaMode = 'apaque', maxDPR = 2, powerPreference = 'high-performance'} = {}) {

                this.canvas = canvas; 
                this.alphaMode = alphaMode; 
                this.maxDPR = maxDPR; 
                this.powerPreference = powerPreference;

                this.device = null; 
                this.adapter = null;
                this.context = null; 
                this.format = null; 

    }

    async init() {

        if(!('gpu' in navigator) ) {
            throw new Error('Webgpu not support');
        }
       
        this.context = this.canvas.getContext('webgpu');
     

        this.adapter = await navigator.gpu.requestAdapter();
                       
        
        if(!this.adapter) {
            throw new Error('failed to get GPU Adapter');
        }  

        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.device = await this.adapter.requestDevice(); 

        this.resize(); 

        this.context.configure({
            device: this.device, 
            format: this.format, 
            alphaMode: this.alphaMode
        });

        this.device.lost.then(info => {

            console.warn('GPU Device lost', info.message);
        });

        return this;
    }


    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, this.maxDPR);
        const w = Math.max(1, Math.floor(this.canvas.clientWidth*dpr));
        const h = Math.max(1, Math.floor(this.canvas.clientHeight*dpr));

        if( w !== this.canvas.width || h !== this.canvas.height) {
            this.canvas.width = w; 
            this.canvas.height = h;
        }
    }

    get deviceInfo() {

        return {device: this.device, context: this.context, format: this.format}

    }

    destroy() {

    }

}