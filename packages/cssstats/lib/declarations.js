var getPropertyResets = require('./get-property-resets')
var getUniquePropertyCount = require('./get-unique-property-count')
var getPropertyValueCount = require('./get-property-value-count')
var getVendorPrefixedProperties = require('./get-vendor-prefixed-properties')
var getAllFontSizes = require('./get-all-font-sizes')
var getAllFontFamilies = require('./get-all-font-families')

module.exports = function(root, opts) {
  var result = {
    total: 0,
    unique: 0,
    uniqueToTotalRatio: 0,
    important: [],
    properties: {},
    getPropertyResets: getPropertyResets,
    getUniquePropertyCount: getUniquePropertyCount,
    getPropertyValueCount: getPropertyValueCount,
    getVendorPrefixed: getVendorPrefixedProperties,
    getAllFontSizes: getAllFontSizes,
    getAllFontFamilies: getAllFontFamilies
  }

  root.walkRules(function(rule) {
    rule.walkDecls(function(declaration) {
      var prop = declaration.prop
      const getFullSelector = (declaration) => {
        const selectors = [];
        let decl = declaration;
        while(decl.parent) {
          selectors.unshift(decl.parent.selector);
          decl = decl.parent;
        }
        return selectors.join(' ');
      }

      result.total++

      if (declaration.important) {
        result.important.push({
          property: declaration.prop,
          value: declaration.value
        })
      }

      result.properties[prop] = result.properties[prop] || []
      result.properties[prop].push({
        selector: getFullSelector(declaration),
        value: declaration.value
      })
    })
  })

  result.unique = Object.keys(result.properties).reduce(function(a, property) {
    return a + getUniquePropertyCount.call(result, property)
  }, 0)

  result.uniqueToTotalRatio = (result.unique / result.total)

  if (opts.propertyResets) {
    result.resets = result.getPropertyResets()
  }

  if (opts.vendorPrefixedProperties) {
    result.vendorPrefixes = result.getVendorPrefixed()
  }

  if (!opts.importantDeclarations) {
    delete result.important
  }

  return result
}
