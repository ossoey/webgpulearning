// File: modules/projectRunner.js
export class ProjectRunner {
  constructor(appShell) {
    this.app = appShell;   // expects your AppShell instance
    this.api = null;       // { frame, destroy } from the project
  }

  async loadFromModule(mod) {
    if (!mod || typeof mod.createProject !== 'function') {
      throw new Error('Project module must export createProject(env)');
    }
    return this.load(mod.createProject);
  }

  async load(createProject) {
    await this.unload(); // ensure previous project is cleaned up

    const env = this.app.env; // { device, context, format, canvas, canvasManager, msaa }
    const api = await createProject(env); // expect { frame, destroy }
    this._validate(api);

    this.api = api;
    this.app.setProject(api);
    return api;
  }

  async unload() {
    if (this.api && typeof this.api.destroy === 'function') {
      try { this.api.destroy(); } catch (e) { console.warn('Project destroy error:', e); }
    }
    this.api = null;
    this.app.setProject(null);
  }

  _validate(api) {
    const ok = api && typeof api.frame === 'function' && typeof api.destroy === 'function';
    if (!ok) throw new Error('createProject(env) must return { frame, destroy }');
  }
}
