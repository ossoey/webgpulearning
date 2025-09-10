
import {BootstrappingProject} from './bootstrappingProject.js';

const canvas = document.getElementById('gfx');

const app = new BootstrappingProject(canvas,
     {maxDPR: 2, alphaMode: 'premultiplied', powerPreference: 'high-performance'});

    app.start(); 

     window._app = app;

console.log('En route pour le développement');