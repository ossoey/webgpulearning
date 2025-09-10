import {BootstrappingProject} from './bootstrappingProject.js';

const canvas = document.getElementById('gfx');

const app = new BootstrappingProject(canvas, {alphaMode : 'opaque', maxDPR: 2 , powerPreference: 'high-performance'});

app.start(); 

window._app = app; 

console.log('Pourquoi ça ne s affiche pas, je me pose la question ');