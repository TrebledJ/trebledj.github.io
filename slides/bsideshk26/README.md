# BSidesHK 26

- `npm install`
- `npm run dev`

Custom Port: `npm run dev -- --port 8000`  
Bind to 0.0.0.0: `npm run dev -- --port 8000 --remote`  
Export HTML: `npm run build -- --base /talks/bsideshk26/`  

To Export Handout:

1. `npm run dev`
2. Note: Due to some quirkiness in slidev, need to change the background so that the moving tiles are static:
    - Change `const EXPORT = false;` to `const EXPORT = true;` in global-bottom.vue.
    - This workaround is currently needed since `$renderContext` seems to not work...
3. Open the exporter at `http://localhost:{port}/export`

