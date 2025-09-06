// main.js
import { WebGPUSetup } from './modules/webgpuSetup.js';
import { ColorRect } from './projects/color-rect/modules/main.js';

const canvas = document.getElementById('gfx');
const webgpu = await new WebGPUSetup(canvas).initialize();

// Manually pick which project to run (one at a time for now)
const colorRect = new ColorRect(webgpu);
await colorRect.init();
   colorRect.loop();

// Later: to stop/dispose manually
// colorRect.stop();
// colorRect.dispose();