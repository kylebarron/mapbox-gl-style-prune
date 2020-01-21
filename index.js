const styleSpec = require('@mapbox/mapbox-gl-style-spec')
const style = require('./style.json')

function prune(style, options) {
  const {modifyStyle = false} = options;
  let hasDefaults = false;

  // Run pruneLayer on each layer
  styleSpec.visit.eachLayer(style, layer => {
    const pruned = pruneLayer(layer, modifyStyle);
    if (pruned) {
      hasDefaults = true;
    }
  })

  if (hasDefaults) {
    console.log('style has defaults')
  }
  return JSON.stringify(style);
}

function pruneLayer(layer, modifyStyle) {
  // Layer options from spec to prune
  const specLayers = ['paint', 'layout'];

  // Toggle for whether a default value was found
  let hasDefaults = false;

  // Loop over paint and layout
  for (const specLayer of specLayers) {
    // If key does not exist in layer, pass
    if (specLayer in layer) {
      // Get object of allowed layers for type of layer from style spec, e.g.
      // paint_fill-extrusion or layout_fill
      const specProps = styleSpec.latest[`${specLayer}_${layer.type}`];
      // Loop over key-value combinations in layer from user-provided style
      for (const key of Object.keys(layer[specLayer])) {
        const val = layer[specLayer][key];
        // Check if default property for this layer from the spec matches the actual value
        if (specProps[key].default === val) {
          // Toggle
          hasDefaults = true;
          if (modifyStyle) {
            delete layer[specLayer][key]
          }
        }
      }
    }
  }
  return hasDefaults;
}

module.exports = prune;
