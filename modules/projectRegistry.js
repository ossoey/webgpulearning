// File: modules/projectRegistry.js
export function discoverProjects() {
  // Eagerly load JSON metadata
  const metaModules = import.meta.glob('/projects/**/project.json', { eager: true });
  // Lazily load JS entries
  const entryLoaders = import.meta.glob('/projects/**/modules/*.js');

  const items = Object.entries(metaModules)
    .map(([jsonPath, mod]) => {
      const dir = jsonPath.slice(0, jsonPath.lastIndexOf('/')); // '/projects/foo'
      const data = mod?.default || {};
      return {
        dir,
        id: data.id,
        name: data.name,
        description: data.description || '',
        entry: data.entry || './modules/main.js',
        tags: data.tags || [],
      };
    })
    .filter(p => p.id && p.name && p.entry)
    .filter(p => !/\/template$/i.test(p.dir)) // hide template
    .sort((a, b) => a.name.localeCompare(b.name));

  function resolveEntryPath(p) {
    // e.g. '/projects/full-rect' + '/' + 'modules/main.js'
    return `${p.dir}/${p.entry.replace('./', '')}`;
  }

  function getEntryLoader(p) {
    const key = resolveEntryPath(p);
    return entryLoaders[key];
  }

  return { items, getEntryLoader };
}
