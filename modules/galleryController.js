// File: modules/galleryController.js
export class GalleryController {
  constructor({ listEl, registry, runner }) {
    this.listEl = listEl;
    this.registry = registry; // { items, getEntryLoader }
    this.runner = runner;
    this.activeId = null;
  }

  render() {
    this.listEl.innerHTML = '';
    for (const p of this.registry.items) {
      const li = document.createElement('li');
      li.textContent = p.name;
      li.dataset.id = p.id;
      li.tabIndex = 0;

      li.addEventListener('click', () => this.select(p));
      li.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          this.select(p);
        }
      });

      this.listEl.appendChild(li);
    }
  }

  async select(p) {
    // mark active
    this.activeId = p.id;
    [...this.listEl.children].forEach(li => {
      li.classList.toggle('active', li.dataset.id === p.id);
      li.setAttribute('data-active', li.dataset.id === p.id ? 'true' : 'false');
    });

    // load via runner
    const loader = this.registry.getEntryLoader(p);
    if (!loader) {
      console.error('No entry loader for', p.id);
      return;
    }
    const mod = await loader();
    await this.runner.loadFromModule(mod);
  }
}
