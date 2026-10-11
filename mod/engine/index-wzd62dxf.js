import {
  source_default,
  stripAnsi,
  GRADIENT_PRESET_NAMES,
  stripOscCodes,
  getVisibleWidth,
  truncateStyledText,
  COLOR_MAP,
  getChalkColor,
  applyColors,
  getColorDisplayName,
  getAvailableColorsForUI,
  getAvailableBackgroundColorsForUI,
  getBackgroundColorsForPowerline,
  getPowerlineThemes,
  getPowerlineTheme,
  getDefaultPowerlineTheme,
  getColorLevelString,
  NUMBER_KINDS,
  DefaultPaddingSideSchema,
  generateGuid,
  getPackageVersion,
  canDetectTerminalWidth,
  getMatchSegments,
  EDIT_LABEL_ACTION,
  getLabel,
  clearLabel,
  setLabel,
  getLabelKeybind,
  getLabelModifierText,
  EDIT_HIDE_STATES_ACTION,
  MERGE_TARGET_HIDDEN_HIDEABLE_STATE,
  getEnabledHideStates,
  setEnabledHideStates,
  getHideKeybind,
  getHideModifierText,
  require_react,
  Box_default,
  Text,
  render_default,
  Transform,
  use_input_default,
  use_app_default,
  getPlainInput,
  shouldInsertInput,
  require_jsx_runtime,
  useTextCursor,
  CYCLE_NUMBER_STYLE_ACTION,
  getNumberFormatKeybind,
  getNumberFormatModifierText,
  getNextNumberStyle,
  cycleNumberStyle,
  countPowerlineStartCapSlots,
  preRenderAllWidgets,
  calculateMaxWidthsFromPreRendered,
  renderStatusLineWithInfo,
  CCSTATUSLINE_COMMANDS,
  PINNED_INSTALL_COMMANDS,
  isKnownCommand,
  getClaudeSettingsPath,
  isInstalled,
  getPackageCommandAvailability,
  isClaudeCodeVersionAtLeast,
  buildStatusLineCommand,
  classifyInstallation,
  installStatusLine,
  uninstallStatusLine,
  getExistingStatusLine,
  getRefreshInterval,
  setRefreshInterval,
  getWidget,
  getWidgetCatalog,
  getWidgetCatalogCategories,
  filterWidgetCatalog,
  getConfigLoadError,
  getConfigPath,
  isCustomConfigPath,
  loadSettings,
  saveSettings,
  exportConfig,
  validateImportFile,
  applyImport,
  saveInstallationMetadata
} from "./ccstatusline-tgzfz3x2.js";
import {
  assignPowerlineThemeSlots,
  advanceGlobalPowerlineThemeIndex,
  advanceGlobalSeparatorIndex
} from "./ccstatusline-rdsx5ab1.js";
import {
  __toESM,
  __commonJS
} from "./ccstatusline-22jkk6wg.js";

// node_modules/tinycolor2/cjs/tinycolor.js
var require_tinycolor = __commonJS(function(exports, module) {
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.tinycolor = factory());
  })(exports, function() {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(obj) {
        return typeof obj;
      } : function(obj) {
        return obj && typeof Symbol == "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }
    var trimLeft = /^\s+/;
    var trimRight = /\s+$/;
    function tinycolor(color, opts) {
      color = color ? color : "";
      opts = opts || {};
      if (color instanceof tinycolor) {
        return color;
      }
      if (!(this instanceof tinycolor)) {
        return new tinycolor(color, opts);
      }
      var rgb = inputToRGB(color);
      this._originalInput = color, this._r = rgb.r, this._g = rgb.g, this._b = rgb.b, this._a = rgb.a, this._roundA = Math.round(100 * this._a) / 100, this._format = opts.format || rgb.format;
      this._gradientType = opts.gradientType;
      if (this._r < 1)
        this._r = Math.round(this._r);
      if (this._g < 1)
        this._g = Math.round(this._g);
      if (this._b < 1)
        this._b = Math.round(this._b);
      this._ok = rgb.ok;
    }
    tinycolor.prototype = {
      isDark: function isDark() {
        return this.getBrightness() < 128;
      },
      isLight: function isLight() {
        return !this.isDark();
      },
      isValid: function isValid() {
        return this._ok;
      },
      getOriginalInput: function getOriginalInput() {
        return this._originalInput;
      },
      getFormat: function getFormat() {
        return this._format;
      },
      getAlpha: function getAlpha() {
        return this._a;
      },
      getBrightness: function getBrightness() {
        var rgb = this.toRgb();
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      },
      getLuminance: function getLuminance() {
        var rgb = this.toRgb();
        var RsRGB, GsRGB, BsRGB, R, G, B;
        RsRGB = rgb.r / 255;
        GsRGB = rgb.g / 255;
        BsRGB = rgb.b / 255;
        if (RsRGB <= 0.03928)
          R = RsRGB / 12.92;
        else
          R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
        if (GsRGB <= 0.03928)
          G = GsRGB / 12.92;
        else
          G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
        if (BsRGB <= 0.03928)
          B = BsRGB / 12.92;
        else
          B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      },
      setAlpha: function setAlpha(value) {
        this._a = boundAlpha(value);
        this._roundA = Math.round(100 * this._a) / 100;
        return this;
      },
      toHsv: function toHsv() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        return {
          h: hsv.h * 360,
          s: hsv.s,
          v: hsv.v,
          a: this._a
        };
      },
      toHsvString: function toHsvString() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        var h = Math.round(hsv.h * 360), s = Math.round(hsv.s * 100), v = Math.round(hsv.v * 100);
        return this._a == 1 ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
      },
      toHsl: function toHsl() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        return {
          h: hsl.h * 360,
          s: hsl.s,
          l: hsl.l,
          a: this._a
        };
      },
      toHslString: function toHslString() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        var h = Math.round(hsl.h * 360), s = Math.round(hsl.s * 100), l = Math.round(hsl.l * 100);
        return this._a == 1 ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
      },
      toHex: function toHex(allow3Char) {
        return rgbToHex(this._r, this._g, this._b, allow3Char);
      },
      toHexString: function toHexString(allow3Char) {
        return "#" + this.toHex(allow3Char);
      },
      toHex8: function toHex8(allow4Char) {
        return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
      },
      toHex8String: function toHex8String(allow4Char) {
        return "#" + this.toHex8(allow4Char);
      },
      toRgb: function toRgb() {
        return {
          r: Math.round(this._r),
          g: Math.round(this._g),
          b: Math.round(this._b),
          a: this._a
        };
      },
      toRgbString: function toRgbString() {
        return this._a == 1 ? "rgb(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ")" : "rgba(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ", " + this._roundA + ")";
      },
      toPercentageRgb: function toPercentageRgb() {
        return {
          r: Math.round(bound01(this._r, 255) * 100) + "%",
          g: Math.round(bound01(this._g, 255) * 100) + "%",
          b: Math.round(bound01(this._b, 255) * 100) + "%",
          a: this._a
        };
      },
      toPercentageRgbString: function toPercentageRgbString() {
        return this._a == 1 ? "rgb(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%)" : "rgba(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
      },
      toName: function toName() {
        if (this._a === 0) {
          return "transparent";
        }
        if (this._a < 1) {
          return false;
        }
        return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
      },
      toFilter: function toFilter(secondColor) {
        var hex8String = "#" + rgbaToArgbHex(this._r, this._g, this._b, this._a);
        var secondHex8String = hex8String;
        var gradientType = this._gradientType ? "GradientType = 1, " : "";
        if (secondColor) {
          var s = tinycolor(secondColor);
          secondHex8String = "#" + rgbaToArgbHex(s._r, s._g, s._b, s._a);
        }
        return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=" + hex8String + ",endColorstr=" + secondHex8String + ")";
      },
      toString: function toString(format) {
        var formatSet = !!format;
        format = format || this._format;
        var formattedString = false;
        var hasAlpha = this._a < 1 && this._a >= 0;
        var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");
        if (needsAlphaFormat) {
          if (format === "name" && this._a === 0) {
            return this.toName();
          }
          return this.toRgbString();
        }
        if (format === "rgb") {
          formattedString = this.toRgbString();
        }
        if (format === "prgb") {
          formattedString = this.toPercentageRgbString();
        }
        if (format === "hex" || format === "hex6") {
          formattedString = this.toHexString();
        }
        if (format === "hex3") {
          formattedString = this.toHexString(true);
        }
        if (format === "hex4") {
          formattedString = this.toHex8String(true);
        }
        if (format === "hex8") {
          formattedString = this.toHex8String();
        }
        if (format === "name") {
          formattedString = this.toName();
        }
        if (format === "hsl") {
          formattedString = this.toHslString();
        }
        if (format === "hsv") {
          formattedString = this.toHsvString();
        }
        return formattedString || this.toHexString();
      },
      clone: function clone() {
        return tinycolor(this.toString());
      },
      _applyModification: function _applyModification(fn, args) {
        var color = fn.apply(null, [this].concat([].slice.call(args)));
        this._r = color._r;
        this._g = color._g;
        this._b = color._b;
        this.setAlpha(color._a);
        return this;
      },
      lighten: function lighten() {
        return this._applyModification(_lighten, arguments);
      },
      brighten: function brighten() {
        return this._applyModification(_brighten, arguments);
      },
      darken: function darken() {
        return this._applyModification(_darken, arguments);
      },
      desaturate: function desaturate() {
        return this._applyModification(_desaturate, arguments);
      },
      saturate: function saturate() {
        return this._applyModification(_saturate, arguments);
      },
      greyscale: function greyscale() {
        return this._applyModification(_greyscale, arguments);
      },
      spin: function spin() {
        return this._applyModification(_spin, arguments);
      },
      _applyCombination: function _applyCombination(fn, args) {
        return fn.apply(null, [this].concat([].slice.call(args)));
      },
      analogous: function analogous() {
        return this._applyCombination(_analogous, arguments);
      },
      complement: function complement() {
        return this._applyCombination(_complement, arguments);
      },
      monochromatic: function monochromatic() {
        return this._applyCombination(_monochromatic, arguments);
      },
      splitcomplement: function splitcomplement() {
        return this._applyCombination(_splitcomplement, arguments);
      },
      triad: function triad() {
        return this._applyCombination(polyad, [3]);
      },
      tetrad: function tetrad() {
        return this._applyCombination(polyad, [4]);
      }
    };
    tinycolor.fromRatio = function(color, opts) {
      if (_typeof(color) == "object") {
        var newColor = {};
        for (var i in color) {
          if (color.hasOwnProperty(i)) {
            if (i === "a") {
              newColor[i] = color[i];
            } else {
              newColor[i] = convertToPercentage(color[i]);
            }
          }
        }
        color = newColor;
      }
      return tinycolor(color, opts);
    };
    function inputToRGB(color) {
      var rgb = {
        r: 0,
        g: 0,
        b: 0
      };
      var a = 1;
      var s = null;
      var v = null;
      var l = null;
      var ok = false;
      var format = false;
      if (typeof color == "string") {
        color = stringInputToObject(color);
      }
      if (_typeof(color) == "object") {
        if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
          rgb = rgbToRgb(color.r, color.g, color.b);
          ok = true;
          format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
        } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
          s = convertToPercentage(color.s);
          v = convertToPercentage(color.v);
          rgb = hsvToRgb(color.h, s, v);
          ok = true;
          format = "hsv";
        } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
          s = convertToPercentage(color.s);
          l = convertToPercentage(color.l);
          rgb = hslToRgb(color.h, s, l);
          ok = true;
          format = "hsl";
        }
        if (color.hasOwnProperty("a")) {
          a = color.a;
        }
      }
      a = boundAlpha(a);
      return {
        ok,
        format: color.format || format,
        r: Math.min(255, Math.max(rgb.r, 0)),
        g: Math.min(255, Math.max(rgb.g, 0)),
        b: Math.min(255, Math.max(rgb.b, 0)),
        a
      };
    }
    function rgbToRgb(r, g, b) {
      return {
        r: bound01(r, 255) * 255,
        g: bound01(g, 255) * 255,
        b: bound01(b, 255) * 255
      };
    }
    function rgbToHsl(r, g, b) {
      r = bound01(r, 255);
      g = bound01(g, 255);
      b = bound01(b, 255);
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
      if (max == min) {
        h = s = 0;
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      return {
        h,
        s,
        l
      };
    }
    function hslToRgb(h, s, l) {
      var r, g, b;
      h = bound01(h, 360);
      s = bound01(s, 100);
      l = bound01(l, 100);
      function hue2rgb(p, q, t) {
        if (t < 0)
          t += 1;
        if (t > 1)
          t -= 1;
        if (t < 1 / 6)
          return p + (q - p) * 6 * t;
        if (t < 1 / 2)
          return q;
        if (t < 2 / 3)
          return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      }
      if (s === 0) {
        r = g = b = l;
      } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return {
        r: r * 255,
        g: g * 255,
        b: b * 255
      };
    }
    function rgbToHsv(r, g, b) {
      r = bound01(r, 255);
      g = bound01(g, 255);
      b = bound01(b, 255);
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, v = max;
      var d = max - min;
      s = max === 0 ? 0 : d / max;
      if (max == min) {
        h = 0;
      } else {
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      return {
        h,
        s,
        v
      };
    }
    function hsvToRgb(h, s, v) {
      h = bound01(h, 360) * 6;
      s = bound01(s, 100);
      v = bound01(v, 100);
      var i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), mod = i % 6, r = [v, q, p, p, t, v][mod], g = [t, v, v, q, p, p][mod], b = [p, p, t, v, v, q][mod];
      return {
        r: r * 255,
        g: g * 255,
        b: b * 255
      };
    }
    function rgbToHex(r, g, b, allow3Char) {
      var hex = [pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16))];
      if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
      }
      return hex.join("");
    }
    function rgbaToHex(r, g, b, a, allow4Char) {
      var hex = [pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16)), pad2(convertDecimalToHex(a))];
      if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
      }
      return hex.join("");
    }
    function rgbaToArgbHex(r, g, b, a) {
      var hex = [pad2(convertDecimalToHex(a)), pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16))];
      return hex.join("");
    }
    tinycolor.equals = function(color1, color2) {
      if (!color1 || !color2)
        return false;
      return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };
    tinycolor.random = function() {
      return tinycolor.fromRatio({
        r: Math.random(),
        g: Math.random(),
        b: Math.random()
      });
    };
    function _desaturate(color, amount) {
      amount = amount === 0 ? 0 : amount || 10;
      var hsl = tinycolor(color).toHsl();
      hsl.s -= amount / 100;
      hsl.s = clamp01(hsl.s);
      return tinycolor(hsl);
    }
    function _saturate(color, amount) {
      amount = amount === 0 ? 0 : amount || 10;
      var hsl = tinycolor(color).toHsl();
      hsl.s += amount / 100;
      hsl.s = clamp01(hsl.s);
      return tinycolor(hsl);
    }
    function _greyscale(color) {
      return tinycolor(color).desaturate(100);
    }
    function _lighten(color, amount) {
      amount = amount === 0 ? 0 : amount || 10;
      var hsl = tinycolor(color).toHsl();
      hsl.l += amount / 100;
      hsl.l = clamp01(hsl.l);
      return tinycolor(hsl);
    }
    function _brighten(color, amount) {
      amount = amount === 0 ? 0 : amount || 10;
      var rgb = tinycolor(color).toRgb();
      rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
      rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
      rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
      return tinycolor(rgb);
    }
    function _darken(color, amount) {
      amount = amount === 0 ? 0 : amount || 10;
      var hsl = tinycolor(color).toHsl();
      hsl.l -= amount / 100;
      hsl.l = clamp01(hsl.l);
      return tinycolor(hsl);
    }
    function _spin(color, amount) {
      var hsl = tinycolor(color).toHsl();
      var hue = (hsl.h + amount) % 360;
      hsl.h = hue < 0 ? 360 + hue : hue;
      return tinycolor(hsl);
    }
    function _complement(color) {
      var hsl = tinycolor(color).toHsl();
      hsl.h = (hsl.h + 180) % 360;
      return tinycolor(hsl);
    }
    function polyad(color, number) {
      if (isNaN(number) || number <= 0) {
        throw new Error("Argument to polyad must be a positive number");
      }
      var hsl = tinycolor(color).toHsl();
      var result = [tinycolor(color)];
      var step = 360 / number;
      for (var i = 1;i < number; i++) {
        result.push(tinycolor({
          h: (hsl.h + i * step) % 360,
          s: hsl.s,
          l: hsl.l
        }));
      }
      return result;
    }
    function _splitcomplement(color) {
      var hsl = tinycolor(color).toHsl();
      var h = hsl.h;
      return [tinycolor(color), tinycolor({
        h: (h + 72) % 360,
        s: hsl.s,
        l: hsl.l
      }), tinycolor({
        h: (h + 216) % 360,
        s: hsl.s,
        l: hsl.l
      })];
    }
    function _analogous(color, results, slices) {
      results = results || 6;
      slices = slices || 30;
      var hsl = tinycolor(color).toHsl();
      var part = 360 / slices;
      var ret = [tinycolor(color)];
      for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360;--results; ) {
        hsl.h = (hsl.h + part) % 360;
        ret.push(tinycolor(hsl));
      }
      return ret;
    }
    function _monochromatic(color, results) {
      results = results || 6;
      var hsv = tinycolor(color).toHsv();
      var { h, s, v } = hsv;
      var ret = [];
      var modification = 1 / results;
      while (results--) {
        ret.push(tinycolor({
          h,
          s,
          v
        }));
        v = (v + modification) % 1;
      }
      return ret;
    }
    tinycolor.mix = function(color1, color2, amount) {
      amount = amount === 0 ? 0 : amount || 50;
      var rgb1 = tinycolor(color1).toRgb();
      var rgb2 = tinycolor(color2).toRgb();
      var p = amount / 100;
      var rgba = {
        r: (rgb2.r - rgb1.r) * p + rgb1.r,
        g: (rgb2.g - rgb1.g) * p + rgb1.g,
        b: (rgb2.b - rgb1.b) * p + rgb1.b,
        a: (rgb2.a - rgb1.a) * p + rgb1.a
      };
      return tinycolor(rgba);
    };
    tinycolor.readability = function(color1, color2) {
      var c1 = tinycolor(color1);
      var c2 = tinycolor(color2);
      return (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) / (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05);
    };
    tinycolor.isReadable = function(color1, color2, wcag2) {
      var readability = tinycolor.readability(color1, color2);
      var wcag2Parms, out;
      out = false;
      wcag2Parms = validateWCAG2Parms(wcag2);
      switch (wcag2Parms.level + wcag2Parms.size) {
        case "AAsmall":
        case "AAAlarge":
          out = readability >= 4.5;
          break;
        case "AAlarge":
          out = readability >= 3;
          break;
        case "AAAsmall":
          out = readability >= 7;
          break;
      }
      return out;
    };
    tinycolor.mostReadable = function(baseColor, colorList, args) {
      var bestColor = null;
      var bestScore = 0;
      var readability;
      var includeFallbackColors, level, size;
      args = args || {};
      includeFallbackColors = args.includeFallbackColors;
      level = args.level;
      size = args.size;
      for (var i = 0;i < colorList.length; i++) {
        readability = tinycolor.readability(baseColor, colorList[i]);
        if (readability > bestScore) {
          bestScore = readability;
          bestColor = tinycolor(colorList[i]);
        }
      }
      if (tinycolor.isReadable(baseColor, bestColor, {
        level,
        size
      }) || !includeFallbackColors) {
        return bestColor;
      } else {
        args.includeFallbackColors = false;
        return tinycolor.mostReadable(baseColor, ["#fff", "#000"], args);
      }
    };
    var names = tinycolor.names = {
      aliceblue: "f0f8ff",
      antiquewhite: "faebd7",
      aqua: "0ff",
      aquamarine: "7fffd4",
      azure: "f0ffff",
      beige: "f5f5dc",
      bisque: "ffe4c4",
      black: "000",
      blanchedalmond: "ffebcd",
      blue: "00f",
      blueviolet: "8a2be2",
      brown: "a52a2a",
      burlywood: "deb887",
      burntsienna: "ea7e5d",
      cadetblue: "5f9ea0",
      chartreuse: "7fff00",
      chocolate: "d2691e",
      coral: "ff7f50",
      cornflowerblue: "6495ed",
      cornsilk: "fff8dc",
      crimson: "dc143c",
      cyan: "0ff",
      darkblue: "00008b",
      darkcyan: "008b8b",
      darkgoldenrod: "b8860b",
      darkgray: "a9a9a9",
      darkgreen: "006400",
      darkgrey: "a9a9a9",
      darkkhaki: "bdb76b",
      darkmagenta: "8b008b",
      darkolivegreen: "556b2f",
      darkorange: "ff8c00",
      darkorchid: "9932cc",
      darkred: "8b0000",
      darksalmon: "e9967a",
      darkseagreen: "8fbc8f",
      darkslateblue: "483d8b",
      darkslategray: "2f4f4f",
      darkslategrey: "2f4f4f",
      darkturquoise: "00ced1",
      darkviolet: "9400d3",
      deeppink: "ff1493",
      deepskyblue: "00bfff",
      dimgray: "696969",
      dimgrey: "696969",
      dodgerblue: "1e90ff",
      firebrick: "b22222",
      floralwhite: "fffaf0",
      forestgreen: "228b22",
      fuchsia: "f0f",
      gainsboro: "dcdcdc",
      ghostwhite: "f8f8ff",
      gold: "ffd700",
      goldenrod: "daa520",
      gray: "808080",
      green: "008000",
      greenyellow: "adff2f",
      grey: "808080",
      honeydew: "f0fff0",
      hotpink: "ff69b4",
      indianred: "cd5c5c",
      indigo: "4b0082",
      ivory: "fffff0",
      khaki: "f0e68c",
      lavender: "e6e6fa",
      lavenderblush: "fff0f5",
      lawngreen: "7cfc00",
      lemonchiffon: "fffacd",
      lightblue: "add8e6",
      lightcoral: "f08080",
      lightcyan: "e0ffff",
      lightgoldenrodyellow: "fafad2",
      lightgray: "d3d3d3",
      lightgreen: "90ee90",
      lightgrey: "d3d3d3",
      lightpink: "ffb6c1",
      lightsalmon: "ffa07a",
      lightseagreen: "20b2aa",
      lightskyblue: "87cefa",
      lightslategray: "789",
      lightslategrey: "789",
      lightsteelblue: "b0c4de",
      lightyellow: "ffffe0",
      lime: "0f0",
      limegreen: "32cd32",
      linen: "faf0e6",
      magenta: "f0f",
      maroon: "800000",
      mediumaquamarine: "66cdaa",
      mediumblue: "0000cd",
      mediumorchid: "ba55d3",
      mediumpurple: "9370db",
      mediumseagreen: "3cb371",
      mediumslateblue: "7b68ee",
      mediumspringgreen: "00fa9a",
      mediumturquoise: "48d1cc",
      mediumvioletred: "c71585",
      midnightblue: "191970",
      mintcream: "f5fffa",
      mistyrose: "ffe4e1",
      moccasin: "ffe4b5",
      navajowhite: "ffdead",
      navy: "000080",
      oldlace: "fdf5e6",
      olive: "808000",
      olivedrab: "6b8e23",
      orange: "ffa500",
      orangered: "ff4500",
      orchid: "da70d6",
      palegoldenrod: "eee8aa",
      palegreen: "98fb98",
      paleturquoise: "afeeee",
      palevioletred: "db7093",
      papayawhip: "ffefd5",
      peachpuff: "ffdab9",
      peru: "cd853f",
      pink: "ffc0cb",
      plum: "dda0dd",
      powderblue: "b0e0e6",
      purple: "800080",
      rebeccapurple: "663399",
      red: "f00",
      rosybrown: "bc8f8f",
      royalblue: "4169e1",
      saddlebrown: "8b4513",
      salmon: "fa8072",
      sandybrown: "f4a460",
      seagreen: "2e8b57",
      seashell: "fff5ee",
      sienna: "a0522d",
      silver: "c0c0c0",
      skyblue: "87ceeb",
      slateblue: "6a5acd",
      slategray: "708090",
      slategrey: "708090",
      snow: "fffafa",
      springgreen: "00ff7f",
      steelblue: "4682b4",
      tan: "d2b48c",
      teal: "008080",
      thistle: "d8bfd8",
      tomato: "ff6347",
      turquoise: "40e0d0",
      violet: "ee82ee",
      wheat: "f5deb3",
      white: "fff",
      whitesmoke: "f5f5f5",
      yellow: "ff0",
      yellowgreen: "9acd32"
    };
    var hexNames = tinycolor.hexNames = flip(names);
    function flip(o) {
      var flipped = {};
      for (var i in o) {
        if (o.hasOwnProperty(i)) {
          flipped[o[i]] = i;
        }
      }
      return flipped;
    }
    function boundAlpha(a) {
      a = parseFloat(a);
      if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
      }
      return a;
    }
    function bound01(n, max) {
      if (isOnePointZero(n))
        n = "100%";
      var processPercent = isPercentage(n);
      n = Math.min(max, Math.max(0, parseFloat(n)));
      if (processPercent) {
        n = parseInt(n * max, 10) / 100;
      }
      if (Math.abs(n - max) < 0.000001) {
        return 1;
      }
      return n % max / parseFloat(max);
    }
    function clamp01(val) {
      return Math.min(1, Math.max(0, val));
    }
    function parseIntFromHex(val) {
      return parseInt(val, 16);
    }
    function isOnePointZero(n) {
      return typeof n == "string" && n.indexOf(".") != -1 && parseFloat(n) === 1;
    }
    function isPercentage(n) {
      return typeof n === "string" && n.indexOf("%") != -1;
    }
    function pad2(c) {
      return c.length == 1 ? "0" + c : "" + c;
    }
    function convertToPercentage(n) {
      if (n <= 1) {
        n = n * 100 + "%";
      }
      return n;
    }
    function convertDecimalToHex(d) {
      return Math.round(parseFloat(d) * 255).toString(16);
    }
    function convertHexToDecimal(h) {
      return parseIntFromHex(h) / 255;
    }
    var matchers = function() {
      var CSS_INTEGER = "[-\\+]?\\d+%?";
      var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";
      var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";
      var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
      var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
      return {
        CSS_UNIT: new RegExp(CSS_UNIT),
        rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
        rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
        hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
        hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
        hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
        hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
      };
    }();
    function isValidCSSUnit(color) {
      return !!matchers.CSS_UNIT.exec(color);
    }
    function stringInputToObject(color) {
      color = color.replace(trimLeft, "").replace(trimRight, "").toLowerCase();
      var named = false;
      if (names[color]) {
        color = names[color];
        named = true;
      } else if (color == "transparent") {
        return {
          r: 0,
          g: 0,
          b: 0,
          a: 0,
          format: "name"
        };
      }
      var match;
      if (match = matchers.rgb.exec(color)) {
        return {
          r: match[1],
          g: match[2],
          b: match[3]
        };
      }
      if (match = matchers.rgba.exec(color)) {
        return {
          r: match[1],
          g: match[2],
          b: match[3],
          a: match[4]
        };
      }
      if (match = matchers.hsl.exec(color)) {
        return {
          h: match[1],
          s: match[2],
          l: match[3]
        };
      }
      if (match = matchers.hsla.exec(color)) {
        return {
          h: match[1],
          s: match[2],
          l: match[3],
          a: match[4]
        };
      }
      if (match = matchers.hsv.exec(color)) {
        return {
          h: match[1],
          s: match[2],
          v: match[3]
        };
      }
      if (match = matchers.hsva.exec(color)) {
        return {
          h: match[1],
          s: match[2],
          v: match[3],
          a: match[4]
        };
      }
      if (match = matchers.hex8.exec(color)) {
        return {
          r: parseIntFromHex(match[1]),
          g: parseIntFromHex(match[2]),
          b: parseIntFromHex(match[3]),
          a: convertHexToDecimal(match[4]),
          format: named ? "name" : "hex8"
        };
      }
      if (match = matchers.hex6.exec(color)) {
        return {
          r: parseIntFromHex(match[1]),
          g: parseIntFromHex(match[2]),
          b: parseIntFromHex(match[3]),
          format: named ? "name" : "hex"
        };
      }
      if (match = matchers.hex4.exec(color)) {
        return {
          r: parseIntFromHex(match[1] + "" + match[1]),
          g: parseIntFromHex(match[2] + "" + match[2]),
          b: parseIntFromHex(match[3] + "" + match[3]),
          a: convertHexToDecimal(match[4] + "" + match[4]),
          format: named ? "name" : "hex8"
        };
      }
      if (match = matchers.hex3.exec(color)) {
        return {
          r: parseIntFromHex(match[1] + "" + match[1]),
          g: parseIntFromHex(match[2] + "" + match[2]),
          b: parseIntFromHex(match[3] + "" + match[3]),
          format: named ? "name" : "hex"
        };
      }
      return false;
    }
    function validateWCAG2Parms(parms) {
      var level, size;
      parms = parms || {
        level: "AA",
        size: "small"
      };
      level = (parms.level || "AA").toUpperCase();
      size = (parms.size || "small").toLowerCase();
      if (level !== "AA" && level !== "AAA") {
        level = "AA";
      }
      if (size !== "small" && size !== "large") {
        size = "small";
      }
      return {
        level,
        size
      };
    }
    return tinycolor;
  });
});

// node_modules/tinygradient/index.js
var require_tinygradient = __commonJS(function(exports, module) {
  var tinycolor = require_tinycolor();
  var RGBA_MAX = { r: 256, g: 256, b: 256, a: 1 };
  var HSVA_MAX = { h: 360, s: 1, v: 1, a: 1 };
  function stepize(start, end, steps) {
    let step = {};
    for (let k in start) {
      if (start.hasOwnProperty(k)) {
        step[k] = steps === 0 ? 0 : (end[k] - start[k]) / steps;
      }
    }
    return step;
  }
  function interpolate(step, start, i, max) {
    let color = {};
    for (let k in start) {
      if (start.hasOwnProperty(k)) {
        color[k] = step[k] * i + start[k];
        color[k] = color[k] < 0 ? color[k] + max[k] : max[k] !== 1 ? color[k] % max[k] : color[k];
      }
    }
    return color;
  }
  function interpolateRgb(stop1, stop2, steps) {
    const start = stop1.color.toRgb();
    const end = stop2.color.toRgb();
    const step = stepize(start, end, steps);
    let gradient = [stop1.color];
    for (let i = 1;i < steps; i++) {
      const color = interpolate(step, start, i, RGBA_MAX);
      gradient.push(tinycolor(color));
    }
    return gradient;
  }
  function interpolateHsv(stop1, stop2, steps, mode) {
    const start = stop1.color.toHsv();
    const end = stop2.color.toHsv();
    if (start.s === 0 || end.s === 0) {
      return interpolateRgb(stop1, stop2, steps);
    }
    let trigonometric;
    if (typeof mode === "boolean") {
      trigonometric = mode;
    } else {
      const trigShortest = start.h < end.h && end.h - start.h < 180 || start.h > end.h && start.h - end.h > 180;
      trigonometric = mode === "long" && trigShortest || mode === "short" && !trigShortest;
    }
    const step = stepize(start, end, steps);
    let gradient = [stop1.color];
    let diff;
    if (start.h <= end.h && !trigonometric || start.h >= end.h && trigonometric) {
      diff = end.h - start.h;
    } else if (trigonometric) {
      diff = 360 - end.h + start.h;
    } else {
      diff = 360 - start.h + end.h;
    }
    step.h = Math.pow(-1, trigonometric ? 1 : 0) * Math.abs(diff) / steps;
    for (let i = 1;i < steps; i++) {
      const color = interpolate(step, start, i, HSVA_MAX);
      gradient.push(tinycolor(color));
    }
    return gradient;
  }
  function computeSubsteps(stops, steps) {
    const l = stops.length;
    steps = parseInt(steps, 10);
    if (isNaN(steps) || steps < 2) {
      throw new Error("Invalid number of steps (< 2)");
    }
    if (steps < l) {
      throw new Error("Number of steps cannot be inferior to number of stops");
    }
    let substeps = [];
    for (let i = 1;i < l; i++) {
      const step = (steps - 1) * (stops[i].pos - stops[i - 1].pos);
      substeps.push(Math.max(1, Math.round(step)));
    }
    let totalSubsteps = 1;
    for (let n = l - 1;n--; )
      totalSubsteps += substeps[n];
    while (totalSubsteps !== steps) {
      if (totalSubsteps < steps) {
        const min = Math.min.apply(null, substeps);
        substeps[substeps.indexOf(min)]++;
        totalSubsteps++;
      } else {
        const max = Math.max.apply(null, substeps);
        substeps[substeps.indexOf(max)]--;
        totalSubsteps--;
      }
    }
    return substeps;
  }
  function computeAt(stops, pos, method, max) {
    if (pos < 0 || pos > 1) {
      throw new Error("Position must be between 0 and 1");
    }
    let start, end;
    for (let i = 0, l = stops.length;i < l - 1; i++) {
      if (pos >= stops[i].pos && pos < stops[i + 1].pos) {
        start = stops[i];
        end = stops[i + 1];
        break;
      }
    }
    if (!start) {
      start = end = stops[stops.length - 1];
    }
    const step = stepize(start.color[method](), end.color[method](), (end.pos - start.pos) * 100);
    const color = interpolate(step, start.color[method](), (pos - start.pos) * 100, max);
    return tinycolor(color);
  }

  class TinyGradient {
    constructor(stops) {
      if (stops.length < 2) {
        throw new Error("Invalid number of stops (< 2)");
      }
      const havingPositions = stops[0].pos !== undefined;
      let l = stops.length;
      let p = -1;
      let lastColorLess = false;
      this.stops = stops.map((stop, i) => {
        const hasPosition = stop.pos !== undefined;
        if (havingPositions ^ hasPosition) {
          throw new Error("Cannot mix positionned and not posionned color stops");
        }
        if (hasPosition) {
          const hasColor = stop.color !== undefined;
          if (!hasColor && (lastColorLess || i === 0 || i === l - 1)) {
            throw new Error("Cannot define two consecutive position-only stops");
          }
          lastColorLess = !hasColor;
          stop = {
            color: hasColor ? tinycolor(stop.color) : null,
            colorLess: !hasColor,
            pos: stop.pos
          };
          if (stop.pos < 0 || stop.pos > 1) {
            throw new Error("Color stops positions must be between 0 and 1");
          } else if (stop.pos < p) {
            throw new Error("Color stops positions are not ordered");
          }
          p = stop.pos;
        } else {
          stop = {
            color: tinycolor(stop.color !== undefined ? stop.color : stop),
            pos: i / (l - 1)
          };
        }
        return stop;
      });
      if (this.stops[0].pos !== 0) {
        this.stops.unshift({
          color: this.stops[0].color,
          pos: 0
        });
        l++;
      }
      if (this.stops[l - 1].pos !== 1) {
        this.stops.push({
          color: this.stops[l - 1].color,
          pos: 1
        });
      }
    }
    reverse() {
      let stops = [];
      this.stops.forEach(function(stop) {
        stops.push({
          color: stop.color,
          pos: 1 - stop.pos
        });
      });
      return new TinyGradient(stops.reverse());
    }
    loop() {
      let stops1 = [];
      let stops2 = [];
      this.stops.forEach((stop) => {
        stops1.push({
          color: stop.color,
          pos: stop.pos / 2
        });
      });
      this.stops.slice(0, -1).forEach((stop) => {
        stops2.push({
          color: stop.color,
          pos: 1 - stop.pos / 2
        });
      });
      return new TinyGradient(stops1.concat(stops2.reverse()));
    }
    rgb(steps) {
      const substeps = computeSubsteps(this.stops, steps);
      let gradient = [];
      this.stops.forEach((stop, i) => {
        if (stop.colorLess) {
          stop.color = interpolateRgb(this.stops[i - 1], this.stops[i + 1], 2)[1];
        }
      });
      for (let i = 0, l = this.stops.length;i < l - 1; i++) {
        const rgb = interpolateRgb(this.stops[i], this.stops[i + 1], substeps[i]);
        gradient.splice(gradient.length, 0, ...rgb);
      }
      gradient.push(this.stops[this.stops.length - 1].color);
      return gradient;
    }
    hsv(steps, mode) {
      const substeps = computeSubsteps(this.stops, steps);
      let gradient = [];
      this.stops.forEach((stop, i) => {
        if (stop.colorLess) {
          stop.color = interpolateHsv(this.stops[i - 1], this.stops[i + 1], 2, mode)[1];
        }
      });
      for (let i = 0, l = this.stops.length;i < l - 1; i++) {
        const hsv = interpolateHsv(this.stops[i], this.stops[i + 1], substeps[i], mode);
        gradient.splice(gradient.length, 0, ...hsv);
      }
      gradient.push(this.stops[this.stops.length - 1].color);
      return gradient;
    }
    css(mode, direction) {
      mode = mode || "linear";
      direction = direction || (mode === "linear" ? "to right" : "ellipse at center");
      let css = mode + "-gradient(" + direction;
      this.stops.forEach(function(stop) {
        css += ", " + (stop.colorLess ? "" : stop.color.toRgbString() + " ") + stop.pos * 100 + "%";
      });
      css += ")";
      return css;
    }
    rgbAt(pos) {
      return computeAt(this.stops, pos, "toRgb", RGBA_MAX);
    }
    hsvAt(pos) {
      return computeAt(this.stops, pos, "toHsv", HSVA_MAX);
    }
  }
  module.exports = function(stops) {
    if (arguments.length === 1) {
      if (!Array.isArray(arguments[0])) {
        throw new Error('"stops" is not an array');
      }
      stops = arguments[0];
    } else {
      stops = Array.prototype.slice.call(arguments);
    }
    return new TinyGradient(stops);
  };
});

// node_modules/pluralize/pluralize.js
var require_pluralize = __commonJS(function(exports, module) {
  (function(root, pluralize) {
    if (typeof exports === "object" && typeof module === "object") {
      module.exports = pluralize();
    } else if (typeof define === "function" && define.amd) {
      define(function() {
        return pluralize();
      });
    } else {
      root.pluralize = pluralize();
    }
  })(exports, function() {
    var pluralRules = [];
    var singularRules = [];
    var uncountables = {};
    var irregularPlurals = {};
    var irregularSingles = {};
    function sanitizeRule(rule) {
      if (typeof rule === "string") {
        return new RegExp("^" + rule + "$", "i");
      }
      return rule;
    }
    function restoreCase(word, token) {
      if (word === token)
        return token;
      if (word === word.toLowerCase())
        return token.toLowerCase();
      if (word === word.toUpperCase())
        return token.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
      }
      return token.toLowerCase();
    }
    function interpolate(str, args) {
      return str.replace(/\$(\d{1,2})/g, function(match, index) {
        return args[index] || "";
      });
    }
    function replace(word, rule) {
      return word.replace(rule[0], function(match, index) {
        var result = interpolate(rule[1], arguments);
        if (match === "") {
          return restoreCase(word[index - 1], result);
        }
        return restoreCase(match, result);
      });
    }
    function sanitizeWord(token, word, rules) {
      if (!token.length || uncountables.hasOwnProperty(token)) {
        return word;
      }
      var len = rules.length;
      while (len--) {
        var rule = rules[len];
        if (rule[0].test(word))
          return replace(word, rule);
      }
      return word;
    }
    function replaceWord(replaceMap, keepMap, rules) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) {
          return restoreCase(word, token);
        }
        if (replaceMap.hasOwnProperty(token)) {
          return restoreCase(word, replaceMap[token]);
        }
        return sanitizeWord(token, word, rules);
      };
    }
    function checkWord(replaceMap, keepMap, rules, bool) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token))
          return true;
        if (replaceMap.hasOwnProperty(token))
          return false;
        return sanitizeWord(token, token, rules) === token;
      };
    }
    function pluralize(word, count, inclusive) {
      var pluralized = count === 1 ? pluralize.singular(word) : pluralize.plural(word);
      return (inclusive ? count + " " : "") + pluralized;
    }
    pluralize.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
    pluralize.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
    pluralize.addPluralRule = function(rule, replacement) {
      pluralRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize.addSingularRule = function(rule, replacement) {
      singularRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize.addUncountableRule = function(word) {
      if (typeof word === "string") {
        uncountables[word.toLowerCase()] = true;
        return;
      }
      pluralize.addPluralRule(word, "$0");
      pluralize.addSingularRule(word, "$0");
    };
    pluralize.addIrregularRule = function(single, plural) {
      plural = plural.toLowerCase();
      single = single.toLowerCase();
      irregularSingles[single] = plural;
      irregularPlurals[plural] = single;
    };
    [
      ["I", "we"],
      ["me", "us"],
      ["he", "they"],
      ["she", "they"],
      ["them", "them"],
      ["myself", "ourselves"],
      ["yourself", "yourselves"],
      ["itself", "themselves"],
      ["herself", "themselves"],
      ["himself", "themselves"],
      ["themself", "themselves"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["this", "these"],
      ["that", "those"],
      ["echo", "echoes"],
      ["dingo", "dingoes"],
      ["volcano", "volcanoes"],
      ["tornado", "tornadoes"],
      ["torpedo", "torpedoes"],
      ["genus", "genera"],
      ["viscus", "viscera"],
      ["stigma", "stigmata"],
      ["stoma", "stomata"],
      ["dogma", "dogmata"],
      ["lemma", "lemmata"],
      ["schema", "schemata"],
      ["anathema", "anathemata"],
      ["ox", "oxen"],
      ["axe", "axes"],
      ["die", "dice"],
      ["yes", "yeses"],
      ["foot", "feet"],
      ["eave", "eaves"],
      ["goose", "geese"],
      ["tooth", "teeth"],
      ["quiz", "quizzes"],
      ["human", "humans"],
      ["proof", "proofs"],
      ["carve", "carves"],
      ["valve", "valves"],
      ["looey", "looies"],
      ["thief", "thieves"],
      ["groove", "grooves"],
      ["pickaxe", "pickaxes"],
      ["passerby", "passersby"]
    ].forEach(function(rule) {
      return pluralize.addIrregularRule(rule[0], rule[1]);
    });
    [
      [/s?$/i, "s"],
      [/[^\u0000-\u007F]$/i, "$0"],
      [/([^aeiou]ese)$/i, "$1"],
      [/(ax|test)is$/i, "$1es"],
      [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
      [/(e[mn]u)s?$/i, "$1s"],
      [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
      [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
      [/(seraph|cherub)(?:im)?$/i, "$1im"],
      [/(her|at|gr)o$/i, "$1oes"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
      [/sis$/i, "ses"],
      [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
      [/([^aeiouy]|qu)y$/i, "$1ies"],
      [/([^ch][ieo][ln])ey$/i, "$1ies"],
      [/(x|ch|ss|sh|zz)$/i, "$1es"],
      [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
      [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
      [/(pe)(?:rson|ople)$/i, "$1ople"],
      [/(child)(?:ren)?$/i, "$1ren"],
      [/eaux$/i, "$0"],
      [/m[ae]n$/i, "men"],
      ["thou", "you"]
    ].forEach(function(rule) {
      return pluralize.addPluralRule(rule[0], rule[1]);
    });
    [
      [/s$/i, ""],
      [/(ss)$/i, "$1"],
      [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
      [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
      [/ies$/i, "y"],
      [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
      [/\b(mon|smil)ies$/i, "$1ey"],
      [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
      [/(seraph|cherub)im$/i, "$1"],
      [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"],
      [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, "$1sis"],
      [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
      [/(test)(?:is|es)$/i, "$1is"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
      [/(alumn|alg|vertebr)ae$/i, "$1a"],
      [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
      [/(matr|append)ices$/i, "$1ix"],
      [/(pe)(rson|ople)$/i, "$1rson"],
      [/(child)ren$/i, "$1"],
      [/(eau)x?$/i, "$1"],
      [/men$/i, "man"]
    ].forEach(function(rule) {
      return pluralize.addSingularRule(rule[0], rule[1]);
    });
    [
      "adulthood",
      "advice",
      "agenda",
      "aid",
      "aircraft",
      "alcohol",
      "ammo",
      "analytics",
      "anime",
      "athletics",
      "audio",
      "bison",
      "blood",
      "bream",
      "buffalo",
      "butter",
      "carp",
      "cash",
      "chassis",
      "chess",
      "clothing",
      "cod",
      "commerce",
      "cooperation",
      "corps",
      "debris",
      "diabetes",
      "digestion",
      "elk",
      "energy",
      "equipment",
      "excretion",
      "expertise",
      "firmware",
      "flounder",
      "fun",
      "gallows",
      "garbage",
      "graffiti",
      "hardware",
      "headquarters",
      "health",
      "herpes",
      "highjinks",
      "homework",
      "housework",
      "information",
      "jeans",
      "justice",
      "kudos",
      "labour",
      "literature",
      "machinery",
      "mackerel",
      "mail",
      "media",
      "mews",
      "moose",
      "music",
      "mud",
      "manga",
      "news",
      "only",
      "personnel",
      "pike",
      "plankton",
      "pliers",
      "police",
      "pollution",
      "premises",
      "rain",
      "research",
      "rice",
      "salmon",
      "scissors",
      "series",
      "sewage",
      "shambles",
      "shrimp",
      "software",
      "species",
      "staff",
      "swine",
      "tennis",
      "traffic",
      "transportation",
      "trout",
      "tuna",
      "wealth",
      "welfare",
      "whiting",
      "wildebeest",
      "wildlife",
      "you",
      /pok[eé]mon$/i,
      /[^aeiou]ese$/i,
      /deer$/i,
      /fish$/i,
      /measles$/i,
      /o[iu]s$/i,
      /pox$/i,
      /sheep$/i
    ].forEach(pluralize.addUncountableRule);
    return pluralize;
  });
});

// node_modules/ink-gradient/dist/index.js
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var import_react = __toESM(require_react(), 1);

// node_modules/gradient-string/node_modules/chalk/source/vendor/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    blackBright: [90, 39],
    gray: [90, 39],
    grey: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = new Map;
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/gradient-string/node_modules/chalk/source/vendor/supports-color/index.js
import process2 from "node:process";
import os from "node:os";
import tty from "node:tty";
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : process2.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
var { env } = process2;
var flagForceColor;
if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
  flagForceColor = 0;
} else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
  flagForceColor = 1;
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== undefined) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === undefined) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (process2.platform === "win32") {
    const osRelease = os.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if (["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI"].some((key) => (key in env))) {
      return 3;
    }
    if (["TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => (sign in env)) || env.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if (env.TERM === "xterm-kitty") {
    return 3;
  }
  if (env.TERM === "xterm-ghostty") {
    return 3;
  }
  if (env.TERM === "wezterm") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env.TERM_PROGRAM) {
      case "iTerm.app": {
        return version >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var supportsColor = {
  stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
  stderr: createSupportsColor({ isTTY: tty.isatty(2) })
};
var supports_color_default = supportsColor;

// node_modules/gradient-string/node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? `\r
` : `
`) + postfix;
    endIndex = index + 1;
    index = string.indexOf(`
`, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}

// node_modules/gradient-string/node_modules/chalk/source/index.js
var { stdout: stdoutColor, stderr: stderrColor } = supports_color_default;
var GENERATOR = Symbol("GENERATOR");
var STYLER = Symbol("STYLER");
var IS_EMPTY = Symbol("IS_EMPTY");
var levelMapping = [
  "ansi",
  "ansi",
  "ansi256",
  "ansi16m"
];
var styles2 = Object.create(null);
var applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === undefined ? colorLevel : options.level;
};
var chalkFactory = (options) => {
  const chalk = (...strings) => strings.join(" ");
  applyOptions(chalk, options);
  Object.setPrototypeOf(chalk, createChalk.prototype);
  return chalk;
};
function createChalk(options) {
  return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansi_styles_default)) {
  styles2[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles2.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level, type, ...arguments_) => {
  if (model === "rgb") {
    if (level === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level === "ansi256") {
      return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
    }
    return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level, type, ...ansi_styles_default.hexToRgb(...arguments_));
  }
  return ansi_styles_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles2[model] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles2[bgModel] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {}, {
  ...styles2,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level) {
      this[GENERATOR].level = level;
    }
  }
});
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === undefined) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self2, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self2;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self2, string) => {
  if (self2.level <= 0 || !string) {
    return self2[IS_EMPTY] ? "" : string;
  }
  let styler = self2[STYLER];
  if (styler === undefined) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== undefined) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf(`
`);
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles2);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
var source_default2 = chalk;

// node_modules/gradient-string/dist/index.js
var import_tinygradient = __toESM(require_tinygradient(), 1);
var gradient = (...colors) => {
  let gradient;
  let options;
  if (colors.length === 0) {
    throw new Error("Missing gradient colors");
  }
  if (!Array.isArray(colors[0])) {
    if (colors.length === 1) {
      throw new Error(`Expected an array of colors, received ${JSON.stringify(colors[0])}`);
    }
    gradient = import_tinygradient.default(...colors);
  } else {
    gradient = import_tinygradient.default(colors[0]);
    options = validateOptions(colors[1]);
  }
  const fn = (str, deprecatedOptions) => {
    return applyGradient(str ? str.toString() : "", gradient, deprecatedOptions ?? options);
  };
  fn.multiline = (str, deprecatedOptions) => multiline(str ? str.toString() : "", gradient, deprecatedOptions ?? options);
  return fn;
};
var getColors = (gradient, options, count) => {
  return options.interpolation?.toLowerCase() === "hsv" ? gradient.hsv(count, options.hsvSpin?.toLowerCase() || false) : gradient.rgb(count);
};
function applyGradient(str, gradient, opts) {
  const options = validateOptions(opts);
  const colorsCount = Math.max(str.replace(/\s/g, "").length, gradient.stops.length);
  const colors = getColors(gradient, options, colorsCount);
  let result = "";
  for (const s of str) {
    result += s.match(/\s/g) ? s : source_default2.hex(colors.shift()?.toHex() || "#000")(s);
  }
  return result;
}
function multiline(str, gradient, opts) {
  const options = validateOptions(opts);
  const lines = str.split(`
`);
  const maxLength = Math.max(...lines.map((l) => l.length), gradient.stops.length);
  const colors = getColors(gradient, options, maxLength);
  const results = [];
  for (const line of lines) {
    const lineColors = colors.slice(0);
    let lineResult = "";
    for (const l of line) {
      lineResult += source_default2.hex(lineColors.shift()?.toHex() || "#000")(l);
    }
    results.push(lineResult);
  }
  return results.join(`
`);
}
function validateOptions(opts) {
  const options = { interpolation: "rgb", hsvSpin: "short", ...opts };
  if (opts !== undefined && typeof opts !== "object") {
    throw new TypeError(`Expected \`options\` to be an \`object\`, got \`${typeof opts}\``);
  }
  if (typeof options.interpolation !== "string") {
    throw new TypeError(`Expected \`options.interpolation\` to be \`rgb\` or \`hsv\`, got \`${typeof options.interpolation}\``);
  }
  if (options.interpolation.toLowerCase() === "hsv" && typeof options.hsvSpin !== "string") {
    throw new TypeError(`Expected \`options.hsvSpin\` to be a \`short\` or \`long\`, got \`${typeof options.hsvSpin}\``);
  }
  return options;
}
var aliases = {
  atlas: { colors: ["#feac5e", "#c779d0", "#4bc0c8"], options: {} },
  cristal: { colors: ["#bdfff3", "#4ac29a"], options: {} },
  teen: { colors: ["#77a1d3", "#79cbca", "#e684ae"], options: {} },
  mind: { colors: ["#473b7b", "#3584a7", "#30d2be"], options: {} },
  morning: { colors: ["#ff5f6d", "#ffc371"], options: { interpolation: "hsv" } },
  vice: { colors: ["#5ee7df", "#b490ca"], options: { interpolation: "hsv" } },
  passion: { colors: ["#f43b47", "#453a94"], options: {} },
  fruit: { colors: ["#ff4e50", "#f9d423"], options: {} },
  instagram: { colors: ["#833ab4", "#fd1d1d", "#fcb045"], options: {} },
  retro: {
    colors: ["#3f51b1", "#5a55ae", "#7b5fac", "#8f6aae", "#a86aa4", "#cc6b8e", "#f18271", "#f3a469", "#f7c978"],
    options: {}
  },
  summer: { colors: ["#fdbb2d", "#22c1c3"], options: {} },
  rainbow: { colors: ["#ff0000", "#ff0100"], options: { interpolation: "hsv", hsvSpin: "long" } },
  pastel: { colors: ["#74ebd5", "#74ecd5"], options: { interpolation: "hsv", hsvSpin: "long" } }
};
function gradientAlias(alias) {
  const result = (str) => gradient(...alias.colors)(str, alias.options);
  result.multiline = (str = "") => gradient(...alias.colors).multiline(str, alias.options);
  return result;
}
var dist_default = gradient;
var atlas = gradientAlias(aliases.atlas);
var cristal = gradientAlias(aliases.cristal);
var teen = gradientAlias(aliases.teen);
var mind = gradientAlias(aliases.mind);
var morning = gradientAlias(aliases.morning);
var vice = gradientAlias(aliases.vice);
var passion = gradientAlias(aliases.passion);
var fruit = gradientAlias(aliases.fruit);
var instagram = gradientAlias(aliases.instagram);
var retro = gradientAlias(aliases.retro);
var summer = gradientAlias(aliases.summer);
var rainbow = gradientAlias(aliases.rainbow);
var pastel = gradientAlias(aliases.pastel);
gradient.atlas = atlas;
gradient.cristal = cristal;
gradient.teen = teen;
gradient.mind = mind;
gradient.morning = morning;
gradient.vice = vice;
gradient.passion = passion;
gradient.fruit = fruit;
gradient.instagram = instagram;
gradient.retro = retro;
gradient.summer = summer;
gradient.rainbow = rainbow;
gradient.pastel = pastel;

// node_modules/ink-gradient/dist/index.js
var Gradient = (props) => {
  if (props.name && props.colors) {
    throw new Error("The `name` and `colors` props are mutually exclusive");
  }
  let gradient;
  if (props.name) {
    gradient = dist_default[props.name];
  } else if (props.colors) {
    gradient = dist_default(props.colors);
  } else {
    throw new Error("Either `name` or `colors` prop must be provided");
  }
  const applyGradient = (text) => gradient.multiline(stripAnsi(text));
  const containsBoxDescendant = (nodeChildren) => {
    let hasBox = false;
    const search = (value) => {
      import_react.Children.forEach(value, (child) => {
        if (hasBox) {
          return;
        }
        if (!import_react.isValidElement(child)) {
          return;
        }
        if (child.type === Box_default) {
          hasBox = true;
          return;
        }
        const childProps = child.props;
        if (Object.hasOwn(childProps, "children")) {
          search(childProps["children"]);
        }
      });
    };
    search(nodeChildren);
    return hasBox;
  };
  const hasChildrenProp = (props) => Object.hasOwn(props, "children");
  const isPlainTextNode = (node) => typeof node === "string" || typeof node === "number";
  const isNonRenderableChild = (node) => node === null || node === undefined || typeof node === "boolean";
  const childrenCount = import_react.Children.count(props.children);
  if (isPlainTextNode(props.children)) {
    return import_jsx_runtime.jsx(Transform, { transform: applyGradient, children: props.children });
  }
  if (childrenCount === 1 && !containsBoxDescendant(props.children)) {
    return import_jsx_runtime.jsx(Transform, { transform: applyGradient, children: props.children });
  }
  const applyGradientToChildren = (children) => {
    const nodes = [];
    let bufferedText = "";
    let nodeIndex = 0;
    const createKey = () => `gradient-node-${nodeIndex++}`;
    const pushTransformed = (node, key) => {
      nodes.push(import_jsx_runtime.jsx(Transform, { transform: applyGradient, children: node }, key));
    };
    const flushText = () => {
      if (bufferedText === "") {
        return;
      }
      const text = bufferedText;
      bufferedText = "";
      pushTransformed(import_jsx_runtime.jsx(Text, { children: text }), createKey());
    };
    import_react.Children.forEach(children, (child) => {
      if (isNonRenderableChild(child)) {
        return;
      }
      if (isPlainTextNode(child)) {
        bufferedText += String(child);
        return;
      }
      flushText();
      if (import_react.isValidElement(child)) {
        const childKey = child.key ?? createKey();
        const childProps = child.props;
        if (child.type === Text) {
          pushTransformed(child, childKey);
          return;
        }
        if (child.type === Box_default) {
          if (hasChildrenProp(childProps)) {
            const childChildren = childProps["children"];
            nodes.push(import_react.cloneElement(child, { key: childKey }, applyGradientToChildren(childChildren)));
            return;
          }
          nodes.push(import_react.cloneElement(child, { key: childKey }));
          return;
        }
        if (hasChildrenProp(childProps)) {
          const childChildren = childProps["children"];
          if (!containsBoxDescendant(childChildren)) {
            pushTransformed(child, childKey);
            return;
          }
          nodes.push(import_react.cloneElement(child, { key: childKey }, applyGradientToChildren(childChildren)));
          return;
        }
        pushTransformed(child, childKey);
        return;
      }
      nodes.push(child);
    });
    flushText();
    return nodes;
  };
  return import_jsx_runtime.jsx(import_jsx_runtime.Fragment, { children: applyGradientToChildren(props.children) });
};
var dist_default2 = Gradient;

// src/tui/App.tsx
var import_react21 = __toESM(require_react(), 1);

// src/utils/clone-settings.ts
function cloneSettings(settings) {
  const cloneFn = globalThis.structuredClone;
  if (typeof cloneFn === "function") {
    return cloneFn(settings);
  }
  return JSON.parse(JSON.stringify(settings));
}

// src/utils/global-command-resolution.ts
import { execFileSync } from "node:child_process";
import * as path from "node:path";

// src/utils/package-manager-executable.ts
function getPackageManagerShellOptions(executable, platform = process.platform) {
  return platform === "win32" && /\.(?:cmd|bat)$/i.test(executable) ? { shell: true } : {};
}
function getPackageManagerExecutable(packageManager, platform = process.platform) {
  return packageManager === "npm" && platform === "win32" ? "npm.cmd" : packageManager;
}

// src/utils/global-command-resolution.ts
var COMMAND_LOOKUP_TIMEOUT_MS = 5000;
function splitCommandOutput(output) {
  const seen = new Set;
  const paths = [];
  for (const line of output.split(/\r?\n/)) {
    const candidate = line.trim();
    if (!candidate || seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    paths.push(candidate);
  }
  return paths;
}
function isTransientBunxStatusLinePath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return /(?:^|\/)bunx-[^/]*ccstatusline@[^/]+\/node_modules\/\.bin\/ccstatusline(?:\.(?:cmd|ps1))?$/i.test(normalized);
}
function getPersistentCommandResolutionPaths(paths) {
  return paths.filter((path) => !isTransientBunxStatusLinePath(path));
}
function getCommandResolutionPaths(command, { platform = process.platform } = {}) {
  try {
    const output = platform === "win32" ? execFileSync("where", [command], {
      encoding: "utf-8",
      timeout: COMMAND_LOOKUP_TIMEOUT_MS,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"]
    }) : execFileSync("which", ["-a", command], {
      encoding: "utf-8",
      timeout: COMMAND_LOOKUP_TIMEOUT_MS,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"]
    });
    return splitCommandOutput(output);
  } catch {
    return [];
  }
}
function getNpmGlobalBinDir(platform) {
  try {
    const executable = getPackageManagerExecutable("npm", platform);
    const prefix = execFileSync(executable, ["prefix", "-g"], {
      encoding: "utf-8",
      timeout: COMMAND_LOOKUP_TIMEOUT_MS,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
      ...getPackageManagerShellOptions(executable, platform)
    }).trim();
    if (!prefix) {
      return null;
    }
    return platform === "win32" || /^[a-z]:[\\/]/i.test(prefix) ? prefix : path.join(prefix, "bin");
  } catch {
    return null;
  }
}
function getBunGlobalBinDir() {
  try {
    const binDir = execFileSync("bun", ["pm", "bin", "-g"], {
      encoding: "utf-8",
      timeout: COMMAND_LOOKUP_TIMEOUT_MS,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return binDir || null;
  } catch {
    return null;
  }
}
function getExpectedGlobalBinDir(packageManager, { platform = process.platform } = {}) {
  return packageManager === "npm" ? getNpmGlobalBinDir(platform) : getBunGlobalBinDir();
}
function trimTrailingSlashes(value) {
  if (/^[a-z]:\/$/i.test(value) || value === "/") {
    return value;
  }
  return value.replace(/\/+$/, "");
}
function normalizePathForComparison(filePath) {
  const normalized = trimTrailingSlashes(filePath.trim().replace(/\\/g, "/"));
  return /^[a-z]:\//i.test(normalized) || normalized.startsWith("/mnt/") ? normalized.toLowerCase() : normalized;
}
function getPathComparisonVariants(filePath) {
  const normalized = normalizePathForComparison(filePath);
  const variants = new Set([normalized]);
  const driveMatch = /^([a-z]):\/(.*)$/i.exec(normalized);
  if (driveMatch) {
    variants.add(`/mnt/${driveMatch[1]?.toLowerCase()}/${driveMatch[2] ?? ""}`);
  }
  const wslMountMatch = /^\/mnt\/([a-z])\/(.*)$/i.exec(normalized);
  if (wslMountMatch) {
    variants.add(`${wslMountMatch[1]?.toLowerCase()}:/${wslMountMatch[2] ?? ""}`);
  }
  return Array.from(variants);
}
function getDirectoryName(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const lastSlashIndex = normalized.lastIndexOf("/");
  return lastSlashIndex === -1 ? "" : normalized.slice(0, lastSlashIndex);
}
function getUniqueResolvedDirs(resolvedPaths) {
  const seen = new Set;
  const dirs = [];
  for (const resolvedPath of resolvedPaths) {
    const dir = getDirectoryName(resolvedPath);
    const comparableDir = normalizePathForComparison(dir);
    if (seen.has(comparableDir)) {
      continue;
    }
    seen.add(comparableDir);
    dirs.push(dir);
  }
  return dirs;
}
function isPathInsideDir(filePath, dir) {
  const pathVariants = getPathComparisonVariants(filePath);
  const dirVariants = getPathComparisonVariants(dir);
  return pathVariants.some((pathVariant) => dirVariants.some((dirVariant) => {
    const withSlash = dirVariant.endsWith("/") ? dirVariant : `${dirVariant}/`;
    return pathVariant === dirVariant || pathVariant.startsWith(withSlash);
  }));
}
function formatPathList(paths) {
  return paths.join(", ");
}
function getResolutionWarning(packageManager, resolvedPaths, expectedBinDir) {
  const firstResolvedPath = resolvedPaths[0] ?? null;
  if (!firstResolvedPath) {
    return "⚠ ccstatusline is not currently resolvable on PATH. Claude Code runs ccstatusline, so restart your shell or update PATH if it cannot launch.";
  }
  const resolvedDirs = getUniqueResolvedDirs(resolvedPaths);
  if (resolvedDirs.length > 1) {
    return `⚠ Multiple ccstatusline binaries are on PATH. Claude Code will run the first match: ${firstResolvedPath}.
Other matches: ${formatPathList(resolvedPaths.slice(1))}`;
  }
  if (expectedBinDir && !isPathInsideDir(firstResolvedPath, expectedBinDir)) {
    return `⚠ ccstatusline resolves to ${firstResolvedPath}, which is outside the ${packageManager} global bin directory (${expectedBinDir}). Claude Code will run the first PATH match.`;
  }
  return null;
}
function inspectGlobalCommandResolution(packageManager, options = {}) {
  const resolvedPaths = getPersistentCommandResolutionPaths(getCommandResolutionPaths("ccstatusline", options));
  const expectedBinDir = getExpectedGlobalBinDir(packageManager, options);
  return {
    resolvedPaths,
    firstResolvedPath: resolvedPaths[0] ?? null,
    expectedBinDir,
    warning: getResolutionWarning(packageManager, resolvedPaths, expectedBinDir)
  };
}

// src/utils/global-package-manager.ts
import {
  execFile,
  execFileSync as execFileSync2
} from "node:child_process";
import * as fs from "node:fs";
var GLOBAL_PACKAGE_TIMEOUT_MS = 120000;
var VERSION_LOOKUP_TIMEOUT_MS = 5000;
var WINDOWS_SHIM_EXTENSIONS = [
  "",
  ".cmd",
  ".ps1"
];
function isWindowsStylePath(filePath) {
  return /^[a-z]:[\\/]/i.test(filePath);
}
function trimTrailingSeparators(filePath) {
  return filePath.replace(/[\\/]+$/, "");
}
function appendPathSegment(dir, segment) {
  const separator = dir.includes("\\") && !dir.includes("/") ? "\\" : "/";
  return `${trimTrailingSeparators(dir)}${separator}${segment}`;
}
function toWindowsPath(filePath) {
  const match = /^\/mnt\/([a-z])\/(.*)$/i.exec(filePath.replace(/\\/g, "/"));
  if (!match) {
    return null;
  }
  return `${match[1]?.toUpperCase()}:\\${(match[2] ?? "").replace(/\//g, "\\")}`;
}
function toWslPath(filePath) {
  const match = /^([a-z]):[\\/](.*)$/i.exec(filePath);
  if (!match) {
    return null;
  }
  return `/mnt/${match[1]?.toLowerCase()}/${(match[2] ?? "").replace(/\\/g, "/")}`;
}
function getFilesystemPathVariants(filePath) {
  const variants = new Set([filePath]);
  const windowsPath = toWindowsPath(filePath);
  const wslPath = toWslPath(filePath);
  if (windowsPath) {
    variants.add(windowsPath);
  }
  if (wslPath) {
    variants.add(wslPath);
  }
  return Array.from(variants);
}
function getBinaryPathCandidates(binDir, platform) {
  const extensions = platform === "win32" || isWindowsStylePath(binDir) ? WINDOWS_SHIM_EXTENSIONS : [""];
  return extensions.map((extension) => appendPathSegment(binDir, `ccstatusline${extension}`));
}
function hasBinaryOnDisk(binDir, platform) {
  return getBinaryPathCandidates(binDir, platform).some((candidate) => getFilesystemPathVariants(candidate).some((variant) => fs.existsSync(variant)));
}
function hasResolvedBinaryInDir(resolvedPaths, binDir) {
  return resolvedPaths.some((resolvedPath) => isPathInsideDir(resolvedPath, binDir));
}
function getDirectoryName2(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const lastSlashIndex = normalized.lastIndexOf("/");
  return lastSlashIndex === -1 ? "" : normalized.slice(0, lastSlashIndex);
}
function getComparablePath(filePath) {
  return filePath.replace(/\\/g, "/").toLowerCase().replace(/\/+$/, "");
}
function getUniqueResolvedDirs2(resolvedPaths) {
  const seen = new Set;
  const dirs = [];
  for (const resolvedPath of resolvedPaths) {
    const dir = getDirectoryName2(resolvedPath);
    const comparableDir = getComparablePath(dir);
    if (seen.has(comparableDir)) {
      continue;
    }
    seen.add(comparableDir);
    dirs.push(dir);
  }
  return dirs;
}
function formatPathList2(paths) {
  return paths.join(", ");
}
function readPackageVersion(packageJsonPath) {
  for (const variant of getFilesystemPathVariants(packageJsonPath)) {
    try {
      if (!fs.existsSync(variant)) {
        continue;
      }
      const packageJson = JSON.parse(fs.readFileSync(variant, "utf-8"));
      return typeof packageJson.version === "string" ? packageJson.version : null;
    } catch {
      return null;
    }
  }
  return null;
}
function getNpmGlobalPackageVersion(platform) {
  try {
    const executable = getPackageManagerExecutable("npm", platform);
    const rootDir = execFileSync2(executable, ["root", "-g"], {
      encoding: "utf-8",
      timeout: VERSION_LOOKUP_TIMEOUT_MS,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
      ...getPackageManagerShellOptions(executable, platform)
    }).trim();
    return rootDir ? readPackageVersion(appendPathSegment(appendPathSegment(rootDir, "ccstatusline"), "package.json")) : null;
  } catch {
    return null;
  }
}
function getBunInstallRoot(binDir) {
  const normalized = trimTrailingSeparators(binDir.replace(/\\/g, "/"));
  const lower = normalized.toLowerCase();
  return lower.endsWith("/bin") ? normalized.slice(0, -4) : normalized;
}
function getBunGlobalPackageVersion(binDir) {
  if (!binDir) {
    return null;
  }
  return readPackageVersion(appendPathSegment(appendPathSegment(appendPathSegment(appendPathSegment(appendPathSegment(getBunInstallRoot(binDir), "install"), "global"), "node_modules"), "ccstatusline"), "package.json"));
}
function getGlobalPackageVersion(packageManager, binDir, platform) {
  if (packageManager === "npm") {
    return getNpmGlobalPackageVersion(platform);
  }
  if (packageManager === "bun") {
    return getBunGlobalPackageVersion(binDir);
  }
  return null;
}
function inspectPackageManager(packageManager, available, resolvedPaths, platform) {
  const binDir = available ? getExpectedGlobalBinDir(packageManager, { platform }) : null;
  return {
    packageManager,
    available,
    installed: !!binDir && (hasBinaryOnDisk(binDir, platform) || hasResolvedBinaryInDir(resolvedPaths, binDir)),
    binDir
  };
}
function getManagerBinDir(packageManager, available, platform) {
  return available ? getExpectedGlobalBinDir(packageManager, { platform }) : null;
}
function getActivePackageManager(resolvedPath, managerBins) {
  if (managerBins.bun && isPathInsideDir(resolvedPath, managerBins.bun)) {
    return {
      packageManager: "bun",
      binDir: managerBins.bun
    };
  }
  if (managerBins.npm && isPathInsideDir(resolvedPath, managerBins.npm)) {
    return {
      packageManager: "npm",
      binDir: managerBins.npm
    };
  }
  return {
    packageManager: "unknown",
    binDir: null
  };
}
function getActiveResolutionWarning(resolvedPaths, active) {
  if (!active.resolvedPath) {
    return "⚠ ccstatusline is not currently resolvable on PATH. Claude Code runs ccstatusline, so restart your shell or update PATH if it cannot launch.";
  }
  const resolvedDirs = getUniqueResolvedDirs2(resolvedPaths);
  if (resolvedDirs.length > 1) {
    return `⚠ Multiple ccstatusline binaries are on PATH. Claude Code will run the first match: ${active.resolvedPath}.
Other matches: ${formatPathList2(resolvedPaths.slice(1))}`;
  }
  if (active.packageManager === "unknown") {
    return `⚠ ccstatusline resolves to ${active.resolvedPath}, but it is outside the detected npm and bun global bin directories.`;
  }
  return null;
}
function inspectActiveGlobalCommand({
  commandAvailability,
  platform = process.platform
}) {
  const resolvedPaths = getPersistentCommandResolutionPaths(getCommandResolutionPaths("ccstatusline", { platform }));
  const resolvedPath = resolvedPaths[0] ?? null;
  const managerBins = {
    npm: getManagerBinDir("npm", commandAvailability.npm, platform),
    bun: getManagerBinDir("bun", commandAvailability.bun, platform)
  };
  const active = resolvedPath ? getActivePackageManager(resolvedPath, managerBins) : { packageManager: "unknown", binDir: null };
  return {
    ...active,
    resolvedPath,
    resolvedPaths,
    version: resolvedPath ? getGlobalPackageVersion(active.packageManager, active.binDir, platform) : null,
    warning: getActiveResolutionWarning(resolvedPaths, {
      packageManager: active.packageManager,
      resolvedPath
    })
  };
}
function inspectGlobalPackageInstallations({
  commandAvailability,
  platform = process.platform
}) {
  const resolvedPaths = getPersistentCommandResolutionPaths(getCommandResolutionPaths("ccstatusline", { platform }));
  return [
    inspectPackageManager("npm", commandAvailability.npm, resolvedPaths, platform),
    inspectPackageManager("bun", commandAvailability.bun, resolvedPaths, platform)
  ];
}
function runGlobalPackageUninstall(packageManager, { platform = process.platform } = {}) {
  const executable = getPackageManagerExecutable(packageManager, platform);
  const args = packageManager === "npm" ? ["uninstall", "-g", "ccstatusline"] : ["remove", "-g", "ccstatusline"];
  return new Promise((resolve, reject) => {
    execFile(executable, args, {
      timeout: GLOBAL_PACKAGE_TIMEOUT_MS,
      windowsHide: true,
      ...getPackageManagerShellOptions(executable, platform)
    }, (error) => {
      if (error) {
        reject(error instanceof Error ? error : new Error("Global uninstall command failed"));
        return;
      }
      resolve();
    });
  });
}

// src/utils/open-url.ts
import { spawnSync } from "node:child_process";
import * as os2 from "node:os";
function runOpenCommand(command, args) {
  const result = spawnSync(command, args, {
    stdio: "ignore",
    windowsHide: true
  });
  if (result.error) {
    return result.error.message;
  }
  if (result.status !== 0) {
    return `Command exited with status ${result.status}`;
  }
  if (result.signal) {
    return `Command terminated by signal ${result.signal}`;
  }
  return null;
}
var PLATFORM_OPEN_PLANS = {
  darwin: [
    {
      command: "open",
      args: (url) => [url]
    }
  ],
  win32: [
    {
      command: "cmd",
      args: (url) => ["/c", "start", "", url]
    }
  ],
  linux: [
    {
      command: "xdg-open",
      args: (url) => [url],
      errorPrefix: "xdg-open failed: "
    },
    {
      command: "gio",
      args: (url) => ["open", url],
      errorPrefix: "gio open failed: "
    }
  ]
};
function openExternalUrl(url) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      success: false,
      error: "Invalid URL"
    };
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return {
      success: false,
      error: "Only http(s) URLs are supported"
    };
  }
  const platform2 = os2.platform();
  const plans = PLATFORM_OPEN_PLANS[platform2];
  if (!plans) {
    return {
      success: false,
      error: `Unsupported platform: ${platform2}`
    };
  }
  const errors = [];
  for (const plan of plans) {
    const commandError = runOpenCommand(plan.command, plan.args(url));
    if (!commandError) {
      return { success: true };
    }
    if (plan.errorPrefix) {
      errors.push(`${plan.errorPrefix}${commandError}`);
    } else {
      errors.push(commandError);
    }
  }
  return {
    success: false,
    error: errors.join("; ")
  };
}

// src/utils/powerline.ts
import {
  execFileSync as execFileSync3,
  execSync
} from "node:child_process";
import * as fs2 from "node:fs";
import * as os3 from "node:os";
import * as path2 from "node:path";
var fontsInstalledThisSession = false;
function checkPowerlineFonts() {
  if (process.env.DEBUG_FONT_INSTALL === "1" && !fontsInstalledThisSession) {
    return {
      installed: false,
      checkedSymbol: ""
    };
  }
  try {
    const testSymbols = {
      rightArrow: "",
      rightThinArrow: "",
      leftArrow: "",
      leftThinArrow: ""
    };
    const platform = os3.platform();
    let fontPaths = [];
    if (platform === "darwin") {
      fontPaths = [
        path2.join(os3.homedir(), "Library", "Fonts"),
        "/Library/Fonts",
        "/System/Library/Fonts"
      ];
    } else if (platform === "linux") {
      fontPaths = [
        path2.join(os3.homedir(), ".local", "share", "fonts"),
        path2.join(os3.homedir(), ".fonts"),
        "/usr/share/fonts",
        "/usr/local/share/fonts"
      ];
    } else if (platform === "win32") {
      fontPaths = [
        path2.join(os3.homedir(), "AppData", "Local", "Microsoft", "Windows", "Fonts"),
        "C:\\Windows\\Fonts"
      ];
    }
    const powerlineFontPatterns = [
      /powerline/i,
      /nerd font/i,
      /for powerline/i,
      /meslo.*lg/i,
      /source.*code.*pro.*powerline/i,
      /dejavu.*powerline/i,
      /ubuntu.*mono.*powerline/i,
      /cascadia.*code.*pl/i,
      /fira.*code.*nerd/i
    ];
    for (const fontPath of fontPaths) {
      if (fs2.existsSync(fontPath)) {
        try {
          const files = fs2.readdirSync(fontPath);
          for (const file of files) {
            for (const pattern of powerlineFontPatterns) {
              if (pattern.test(file)) {
                return {
                  installed: true,
                  checkedSymbol: testSymbols.rightArrow
                };
              }
            }
          }
        } catch {}
      }
    }
    return {
      installed: false,
      checkedSymbol: testSymbols.rightArrow
    };
  } catch {
    return { installed: false };
  }
}
async function checkPowerlineFontsAsync() {
  await Promise.resolve();
  if (process.env.DEBUG_FONT_INSTALL === "1" && !fontsInstalledThisSession) {
    return {
      installed: false,
      checkedSymbol: ""
    };
  }
  try {
    const quickCheck = checkPowerlineFonts();
    if (quickCheck.installed) {
      return quickCheck;
    }
    const platform = os3.platform();
    if (platform === "linux" || platform === "darwin") {
      try {
        const { exec } = await import("node:child_process");
        const { promisify } = await import("node:util");
        const execAsync = promisify(exec);
        const { stdout } = await execAsync("fc-list 2>/dev/null | grep -i powerline", {
          encoding: "utf8",
          windowsHide: true
        });
        if (stdout.trim()) {
          return {
            installed: true,
            checkedSymbol: ""
          };
        }
      } catch {}
    }
    return quickCheck;
  } catch {
    return { installed: false };
  }
}
async function installPowerlineFonts() {
  await Promise.resolve();
  try {
    const platform = os3.platform();
    let fontDir;
    if (platform === "darwin") {
      fontDir = path2.join(os3.homedir(), "Library", "Fonts");
    } else if (platform === "linux") {
      fontDir = path2.join(os3.homedir(), ".local", "share", "fonts");
    } else if (platform === "win32") {
      fontDir = path2.join(os3.homedir(), "AppData", "Local", "Microsoft", "Windows", "Fonts");
    } else {
      return {
        success: false,
        message: "Unsupported platform for font installation"
      };
    }
    if (!fs2.existsSync(fontDir)) {
      fs2.mkdirSync(fontDir, { recursive: true });
    }
    const tempDir = fs2.mkdtempSync(path2.join(os3.tmpdir(), "ccstatusline-powerline-fonts-"));
    try {
      execFileSync3("git", ["clone", "--depth=1", "https://github.com/powerline/fonts.git", tempDir], {
        stdio: "pipe",
        encoding: "utf8",
        windowsHide: true
      });
      if (platform === "darwin" || platform === "linux") {
        const installScript = path2.join(tempDir, "install.sh");
        if (fs2.existsSync(installScript)) {
          fs2.chmodSync(installScript, 493);
          execFileSync3(installScript, [], {
            cwd: tempDir,
            stdio: "pipe",
            encoding: "utf8",
            windowsHide: true
          });
          if (platform === "linux") {
            try {
              execSync("fc-cache -f -v", {
                stdio: "pipe",
                encoding: "utf8",
                windowsHide: true
              });
            } catch {}
          }
          if (process.env.DEBUG_FONT_INSTALL === "1") {
            fontsInstalledThisSession = true;
          }
          return {
            success: true,
            message: 'Powerline fonts installed successfully! Please restart your terminal and select a Powerline font (e.g., "Source Code Pro for Powerline", "Meslo LG S for Powerline", etc.)'
          };
        } else {
          throw new Error("Install script not found in Powerline fonts repository");
        }
      } else {
        let findFontFiles = function(dir) {
          const files = fs2.readdirSync(dir);
          for (const file of files) {
            const filePath = path2.join(dir, file);
            const stat = fs2.statSync(filePath);
            if (stat.isDirectory() && !file.startsWith(".")) {
              findFontFiles(filePath);
            } else if (file.endsWith(".ttf") || file.endsWith(".otf")) {
              if (filePath.toLowerCase().includes("powerline")) {
                fontFiles.push(filePath);
              }
            }
          }
        };
        const fontFiles = [];
        findFontFiles(tempDir);
        let installedCount = 0;
        for (const fontFile of fontFiles) {
          const fileName = path2.basename(fontFile);
          const destPath = path2.join(fontDir, fileName);
          try {
            fs2.copyFileSync(fontFile, destPath);
            installedCount++;
          } catch {}
        }
        if (installedCount > 0) {
          return {
            success: true,
            message: `Installed ${installedCount} Powerline fonts. Please restart your terminal and select a Powerline font from your terminal settings.`
          };
        } else {
          throw new Error("No fonts were installed");
        }
      }
      return {
        success: false,
        message: "Platform-specific installation not implemented"
      };
    } finally {
      if (fs2.existsSync(tempDir)) {
        try {
          fs2.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("git")) {
      return {
        success: false,
        message: "Git is required to install Powerline fonts. Please install Git and try again."
      };
    }
    return {
      success: false,
      message: `Failed to install Powerline fonts: ${errorMessage}. You can manually install fonts from: https://github.com/powerline/fonts`
    };
  }
}

// src/utils/update-checker.ts
import { execFile as execFile2 } from "node:child_process";
import * as https from "node:https";
var NPM_REGISTRY_LATEST_URL = "https://registry.npmjs.org/ccstatusline/latest";
var DEFAULT_REGISTRY_TIMEOUT_MS = 5000;
var GLOBAL_UPDATE_TIMEOUT_MS = 120000;
var RELEASE_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
function isReleaseVersion(version) {
  return RELEASE_VERSION.test(version);
}
function parseVersion(version) {
  return version.split(/[.-]/).map((part) => {
    const parsed = Number.parseInt(part, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  });
}
function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let i = 0;i < length; i += 1) {
    const leftPart = leftParts[i] ?? 0;
    const rightPart = rightParts[i] ?? 0;
    if (leftPart > rightPart) {
      return 1;
    }
    if (leftPart < rightPart) {
      return -1;
    }
  }
  return 0;
}
function getGlobalUpdateAction(packageManager, latestVersion, commandAvailability) {
  if (packageManager === "npm") {
    return {
      id: "npm-global",
      packageManager,
      command: PINNED_INSTALL_COMMANDS.NPM(latestVersion),
      version: latestVersion,
      available: commandAvailability.npm
    };
  }
  return {
    id: "bun-global",
    packageManager,
    command: PINNED_INSTALL_COMMANDS.BUN(latestVersion),
    version: latestVersion,
    available: commandAvailability.bun
  };
}
function getAutoUpdateLaunchCommand(installation) {
  if (installation.method !== "auto-update") {
    return;
  }
  return installation.packageManager === "bun" ? buildStatusLineCommand("auto-bunx") : buildStatusLineCommand("auto-npx");
}
function getUpdateActions(installation, latestVersion, commandAvailability) {
  if (installation.method === "auto-update") {
    return [];
  }
  if (installation.method === "pinned" || installation.method === "self-managed") {
    if (installation.packageManager === "npm") {
      return [getGlobalUpdateAction("npm", latestVersion, commandAvailability)];
    }
    if (installation.packageManager === "bun") {
      return [getGlobalUpdateAction("bun", latestVersion, commandAvailability)];
    }
  }
  return [
    getGlobalUpdateAction("npm", latestVersion, commandAvailability),
    getGlobalUpdateAction("bun", latestVersion, commandAvailability)
  ];
}
function getResolvedInstallation(installedCommand, installationMetadata) {
  const installation = classifyInstallation(installedCommand, installationMetadata);
  if (installation.method === "self-managed" && installationMetadata?.method === "self-managed") {
    return {
      ...installation,
      packageManager: installationMetadata.packageManager
    };
  }
  if (installation.method !== "pinned") {
    return installation;
  }
  return {
    ...installation,
    packageManager: installationMetadata?.method === "pinned" && "packageManager" in installationMetadata ? installationMetadata.packageManager : "unknown"
  };
}
function buildUpdateCheckResult({
  currentVersion,
  latestVersion,
  installedCommand,
  installationMetadata,
  commandAvailability
}) {
  const installation = getResolvedInstallation(installedCommand, installationMetadata);
  if (compareVersions(latestVersion, currentVersion) <= 0) {
    return {
      status: "up-to-date",
      currentVersion,
      latestVersion,
      installation
    };
  }
  return {
    status: "update-available",
    currentVersion,
    latestVersion,
    installation,
    actions: getUpdateActions(installation, latestVersion, commandAvailability),
    autoUpdateLaunchCommand: getAutoUpdateLaunchCommand(installation)
  };
}
function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to query npm registry";
}
async function checkForUpdates({
  currentVersion,
  installedCommand,
  installationMetadata,
  commandAvailability,
  timeoutMs = DEFAULT_REGISTRY_TIMEOUT_MS,
  latestVersionFetcher = fetchLatestNpmVersion
}) {
  try {
    const latestVersion = await latestVersionFetcher(timeoutMs);
    if (!isReleaseVersion(latestVersion)) {
      throw new Error("npm registry returned an invalid version");
    }
    return buildUpdateCheckResult({
      currentVersion,
      latestVersion,
      installedCommand,
      installationMetadata,
      commandAvailability
    });
  } catch (error) {
    return {
      status: "registry-failure",
      currentVersion,
      installation: getResolvedInstallation(installedCommand, installationMetadata),
      errorMessage: getErrorMessage(error)
    };
  }
}
function fetchLatestNpmVersion(timeoutMs = DEFAULT_REGISTRY_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const request2 = https.request(NPM_REGISTRY_LATEST_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ccstatusline"
      }
    }, (response) => {
      if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`npm registry returned HTTP ${response.statusCode ?? "unknown"}`));
        return;
      }
      response.setEncoding("utf8");
      let body = "";
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (typeof parsed.version !== "string" || parsed.version.trim() === "") {
            reject(new Error("npm registry response did not include a version"));
            return;
          }
          resolve(parsed.version);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    });
    request2.setTimeout(timeoutMs, () => {
      request2.destroy(new Error(`npm registry request timed out after ${timeoutMs}ms`));
    });
    request2.on("error", reject);
    request2.end();
  });
}
function runGlobalPackageInstall(packageManager, version, { platform = process.platform } = {}) {
  if (!isReleaseVersion(version)) {
    return Promise.reject(new Error("Not a release version of ccstatusline"));
  }
  const executable = getPackageManagerExecutable(packageManager, platform);
  const args = packageManager === "npm" ? ["install", "-g", `ccstatusline@${version}`] : ["add", "-g", `ccstatusline@${version}`];
  return new Promise((resolve, reject) => {
    execFile2(executable, args, {
      timeout: GLOBAL_UPDATE_TIMEOUT_MS,
      windowsHide: true,
      ...getPackageManagerShellOptions(executable, platform)
    }, (error) => {
      if (error) {
        reject(error instanceof Error ? error : new Error("Global update command failed"));
        return;
      }
      resolve();
    });
  });
}
function runGlobalUpdateAction(action) {
  return runGlobalPackageInstall(action.packageManager, action.version);
}

// src/tui/claude-status.ts
async function loadClaudeStatusLineState() {
  const [
    existingStatusLine,
    refreshInterval
  ] = await Promise.all([
    getExistingStatusLine(),
    getRefreshInterval()
  ]);
  return {
    existingStatusLine,
    refreshInterval
  };
}

// node_modules/ink-select-input/build/Indicator.js
var import_react2 = __toESM(require_react(), 1);

// node_modules/is-unicode-supported/index.js
import process3 from "node:process";
function isUnicodeSupported() {
  const { env } = process3;
  const { TERM, TERM_PROGRAM } = env;
  if (process3.platform !== "win32") {
    return TERM !== "linux";
  }
  return Boolean(env.WT_SESSION) || Boolean(env.TERMINUS_SUBLIME) || env.ConEmuTask === "{cmd::Cmder}" || TERM_PROGRAM === "Terminus-Sublime" || TERM_PROGRAM === "vscode" || TERM === "xterm-256color" || TERM === "alacritty" || TERM === "rxvt-unicode" || TERM === "rxvt-unicode-256color" || env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}

// node_modules/figures/index.js
var common = {
  circleQuestionMark: "(?)",
  questionMarkPrefix: "(?)",
  square: "█",
  squareDarkShade: "▓",
  squareMediumShade: "▒",
  squareLightShade: "░",
  squareTop: "▀",
  squareBottom: "▄",
  squareLeft: "▌",
  squareRight: "▐",
  squareCenter: "■",
  bullet: "●",
  dot: "․",
  ellipsis: "…",
  pointerSmall: "›",
  triangleUp: "▲",
  triangleUpSmall: "▴",
  triangleDown: "▼",
  triangleDownSmall: "▾",
  triangleLeftSmall: "◂",
  triangleRightSmall: "▸",
  home: "⌂",
  heart: "♥",
  musicNote: "♪",
  musicNoteBeamed: "♫",
  arrowUp: "↑",
  arrowDown: "↓",
  arrowLeft: "←",
  arrowRight: "→",
  arrowLeftRight: "↔",
  arrowUpDown: "↕",
  almostEqual: "≈",
  notEqual: "≠",
  lessOrEqual: "≤",
  greaterOrEqual: "≥",
  identical: "≡",
  infinity: "∞",
  subscriptZero: "₀",
  subscriptOne: "₁",
  subscriptTwo: "₂",
  subscriptThree: "₃",
  subscriptFour: "₄",
  subscriptFive: "₅",
  subscriptSix: "₆",
  subscriptSeven: "₇",
  subscriptEight: "₈",
  subscriptNine: "₉",
  oneHalf: "½",
  oneThird: "⅓",
  oneQuarter: "¼",
  oneFifth: "⅕",
  oneSixth: "⅙",
  oneEighth: "⅛",
  twoThirds: "⅔",
  twoFifths: "⅖",
  threeQuarters: "¾",
  threeFifths: "⅗",
  threeEighths: "⅜",
  fourFifths: "⅘",
  fiveSixths: "⅚",
  fiveEighths: "⅝",
  sevenEighths: "⅞",
  line: "─",
  lineBold: "━",
  lineDouble: "═",
  lineDashed0: "┄",
  lineDashed1: "┅",
  lineDashed2: "┈",
  lineDashed3: "┉",
  lineDashed4: "╌",
  lineDashed5: "╍",
  lineDashed6: "╴",
  lineDashed7: "╶",
  lineDashed8: "╸",
  lineDashed9: "╺",
  lineDashed10: "╼",
  lineDashed11: "╾",
  lineDashed12: "−",
  lineDashed13: "–",
  lineDashed14: "‐",
  lineDashed15: "⁃",
  lineVertical: "│",
  lineVerticalBold: "┃",
  lineVerticalDouble: "║",
  lineVerticalDashed0: "┆",
  lineVerticalDashed1: "┇",
  lineVerticalDashed2: "┊",
  lineVerticalDashed3: "┋",
  lineVerticalDashed4: "╎",
  lineVerticalDashed5: "╏",
  lineVerticalDashed6: "╵",
  lineVerticalDashed7: "╷",
  lineVerticalDashed8: "╹",
  lineVerticalDashed9: "╻",
  lineVerticalDashed10: "╽",
  lineVerticalDashed11: "╿",
  lineDownLeft: "┐",
  lineDownLeftArc: "╮",
  lineDownBoldLeftBold: "┓",
  lineDownBoldLeft: "┒",
  lineDownLeftBold: "┑",
  lineDownDoubleLeftDouble: "╗",
  lineDownDoubleLeft: "╖",
  lineDownLeftDouble: "╕",
  lineDownRight: "┌",
  lineDownRightArc: "╭",
  lineDownBoldRightBold: "┏",
  lineDownBoldRight: "┎",
  lineDownRightBold: "┍",
  lineDownDoubleRightDouble: "╔",
  lineDownDoubleRight: "╓",
  lineDownRightDouble: "╒",
  lineUpLeft: "┘",
  lineUpLeftArc: "╯",
  lineUpBoldLeftBold: "┛",
  lineUpBoldLeft: "┚",
  lineUpLeftBold: "┙",
  lineUpDoubleLeftDouble: "╝",
  lineUpDoubleLeft: "╜",
  lineUpLeftDouble: "╛",
  lineUpRight: "└",
  lineUpRightArc: "╰",
  lineUpBoldRightBold: "┗",
  lineUpBoldRight: "┖",
  lineUpRightBold: "┕",
  lineUpDoubleRightDouble: "╚",
  lineUpDoubleRight: "╙",
  lineUpRightDouble: "╘",
  lineUpDownLeft: "┤",
  lineUpBoldDownBoldLeftBold: "┫",
  lineUpBoldDownBoldLeft: "┨",
  lineUpDownLeftBold: "┥",
  lineUpBoldDownLeftBold: "┩",
  lineUpDownBoldLeftBold: "┪",
  lineUpDownBoldLeft: "┧",
  lineUpBoldDownLeft: "┦",
  lineUpDoubleDownDoubleLeftDouble: "╣",
  lineUpDoubleDownDoubleLeft: "╢",
  lineUpDownLeftDouble: "╡",
  lineUpDownRight: "├",
  lineUpBoldDownBoldRightBold: "┣",
  lineUpBoldDownBoldRight: "┠",
  lineUpDownRightBold: "┝",
  lineUpBoldDownRightBold: "┡",
  lineUpDownBoldRightBold: "┢",
  lineUpDownBoldRight: "┟",
  lineUpBoldDownRight: "┞",
  lineUpDoubleDownDoubleRightDouble: "╠",
  lineUpDoubleDownDoubleRight: "╟",
  lineUpDownRightDouble: "╞",
  lineDownLeftRight: "┬",
  lineDownBoldLeftBoldRightBold: "┳",
  lineDownLeftBoldRightBold: "┯",
  lineDownBoldLeftRight: "┰",
  lineDownBoldLeftBoldRight: "┱",
  lineDownBoldLeftRightBold: "┲",
  lineDownLeftRightBold: "┮",
  lineDownLeftBoldRight: "┭",
  lineDownDoubleLeftDoubleRightDouble: "╦",
  lineDownDoubleLeftRight: "╥",
  lineDownLeftDoubleRightDouble: "╤",
  lineUpLeftRight: "┴",
  lineUpBoldLeftBoldRightBold: "┻",
  lineUpLeftBoldRightBold: "┷",
  lineUpBoldLeftRight: "┸",
  lineUpBoldLeftBoldRight: "┹",
  lineUpBoldLeftRightBold: "┺",
  lineUpLeftRightBold: "┶",
  lineUpLeftBoldRight: "┵",
  lineUpDoubleLeftDoubleRightDouble: "╩",
  lineUpDoubleLeftRight: "╨",
  lineUpLeftDoubleRightDouble: "╧",
  lineUpDownLeftRight: "┼",
  lineUpBoldDownBoldLeftBoldRightBold: "╋",
  lineUpDownBoldLeftBoldRightBold: "╈",
  lineUpBoldDownLeftBoldRightBold: "╇",
  lineUpBoldDownBoldLeftRightBold: "╊",
  lineUpBoldDownBoldLeftBoldRight: "╉",
  lineUpBoldDownLeftRight: "╀",
  lineUpDownBoldLeftRight: "╁",
  lineUpDownLeftBoldRight: "┽",
  lineUpDownLeftRightBold: "┾",
  lineUpBoldDownBoldLeftRight: "╂",
  lineUpDownLeftBoldRightBold: "┿",
  lineUpBoldDownLeftBoldRight: "╃",
  lineUpBoldDownLeftRightBold: "╄",
  lineUpDownBoldLeftBoldRight: "╅",
  lineUpDownBoldLeftRightBold: "╆",
  lineUpDoubleDownDoubleLeftDoubleRightDouble: "╬",
  lineUpDoubleDownDoubleLeftRight: "╫",
  lineUpDownLeftDoubleRightDouble: "╪",
  lineCross: "╳",
  lineBackslash: "╲",
  lineSlash: "╱"
};
var specialMainSymbols = {
  tick: "✔",
  info: "ℹ",
  warning: "⚠",
  cross: "✘",
  squareSmall: "◻",
  squareSmallFilled: "◼",
  circle: "◯",
  circleFilled: "◉",
  circleDotted: "◌",
  circleDouble: "◎",
  circleCircle: "ⓞ",
  circleCross: "ⓧ",
  circlePipe: "Ⓘ",
  radioOn: "◉",
  radioOff: "◯",
  checkboxOn: "☒",
  checkboxOff: "☐",
  checkboxCircleOn: "ⓧ",
  checkboxCircleOff: "Ⓘ",
  pointer: "❯",
  triangleUpOutline: "△",
  triangleLeft: "◀",
  triangleRight: "▶",
  lozenge: "◆",
  lozengeOutline: "◇",
  hamburger: "☰",
  smiley: "㋡",
  mustache: "෴",
  star: "★",
  play: "▶",
  nodejs: "⬢",
  oneSeventh: "⅐",
  oneNinth: "⅑",
  oneTenth: "⅒"
};
var specialFallbackSymbols = {
  tick: "√",
  info: "i",
  warning: "‼",
  cross: "×",
  squareSmall: "□",
  squareSmallFilled: "■",
  circle: "( )",
  circleFilled: "(*)",
  circleDotted: "( )",
  circleDouble: "( )",
  circleCircle: "(○)",
  circleCross: "(×)",
  circlePipe: "(│)",
  radioOn: "(*)",
  radioOff: "( )",
  checkboxOn: "[×]",
  checkboxOff: "[ ]",
  checkboxCircleOn: "(×)",
  checkboxCircleOff: "( )",
  pointer: ">",
  triangleUpOutline: "∆",
  triangleLeft: "◄",
  triangleRight: "►",
  lozenge: "♦",
  lozengeOutline: "◊",
  hamburger: "≡",
  smiley: "☺",
  mustache: "┌─┐",
  star: "✶",
  play: "►",
  nodejs: "♦",
  oneSeventh: "1/7",
  oneNinth: "1/9",
  oneTenth: "1/10"
};
var mainSymbols = { ...common, ...specialMainSymbols };
var fallbackSymbols = { ...common, ...specialFallbackSymbols };
var shouldUseMain = isUnicodeSupported();
var figures = shouldUseMain ? mainSymbols : fallbackSymbols;
var figures_default = figures;
var replacements = Object.entries(specialMainSymbols);

// node_modules/ink-select-input/build/Indicator.js
function Indicator({ isSelected = false }) {
  return import_react2.default.createElement(Box_default, { marginRight: 1 }, isSelected ? import_react2.default.createElement(Text, { color: "blue" }, figures_default.pointer) : import_react2.default.createElement(Text, null, " "));
}
var Indicator_default = Indicator;
// node_modules/ink-select-input/build/Item.js
var React2 = __toESM(require_react(), 1);
function Item({ isSelected = false, label }) {
  return React2.createElement(Text, { color: isSelected ? "blue" : undefined }, label);
}
var Item_default = Item;
// node_modules/ink-select-input/build/SelectInput.js
var import_react3 = __toESM(require_react(), 1);
import { isDeepStrictEqual } from "node:util";

// node_modules/to-rotated/index.js
function toRotated(array, steps) {
  if (!Array.isArray(array)) {
    throw new TypeError(`Expected an array, got \`${typeof array}\`.`);
  }
  if (!Number.isSafeInteger(steps)) {
    throw new TypeError(`The \`steps\` parameter must be an integer, got ${steps}.`);
  }
  const { length } = array;
  if (length === 0) {
    return [...array];
  }
  const normalizedSteps = (steps % length + length) % length;
  if (normalizedSteps === 0) {
    return [...array];
  }
  return [
    ...array.slice(-normalizedSteps),
    ...array.slice(0, -normalizedSteps)
  ];
}

// node_modules/ink-select-input/build/SelectInput.js
function SelectInput({ items = [], isFocused = true, initialIndex = 0, indicatorComponent = Indicator_default, itemComponent = Item_default, limit: customLimit, onSelect, onHighlight }) {
  const hasLimit = typeof customLimit === "number" && items.length > customLimit;
  const limit = hasLimit ? Math.min(customLimit, items.length) : items.length;
  const lastIndex = limit - 1;
  const [rotateIndex, setRotateIndex] = import_react3.useState(initialIndex > lastIndex ? lastIndex - initialIndex : 0);
  const [selectedIndex, setSelectedIndex] = import_react3.useState(initialIndex ? initialIndex > lastIndex ? lastIndex : initialIndex : 0);
  const previousItems = import_react3.useRef(items);
  import_react3.useEffect(() => {
    if (!isDeepStrictEqual(previousItems.current.map((item) => item.value), items.map((item) => item.value))) {
      setRotateIndex(0);
      setSelectedIndex(0);
    }
    previousItems.current = items;
  }, [items]);
  use_input_default(import_react3.useCallback((input, key) => {
    if (input === "k" || key.upArrow) {
      const lastIndex = (hasLimit ? limit : items.length) - 1;
      const atFirstIndex = selectedIndex === 0;
      const nextIndex = hasLimit ? selectedIndex : lastIndex;
      const nextRotateIndex = atFirstIndex ? rotateIndex + 1 : rotateIndex;
      const nextSelectedIndex = atFirstIndex ? nextIndex : selectedIndex - 1;
      setRotateIndex(nextRotateIndex);
      setSelectedIndex(nextSelectedIndex);
      const slicedItems = hasLimit ? toRotated(items, nextRotateIndex).slice(0, limit) : items;
      if (typeof onHighlight === "function") {
        onHighlight(slicedItems[nextSelectedIndex]);
      }
    }
    if (input === "j" || key.downArrow) {
      const atLastIndex = selectedIndex === (hasLimit ? limit : items.length) - 1;
      const nextIndex = hasLimit ? selectedIndex : 0;
      const nextRotateIndex = atLastIndex ? rotateIndex - 1 : rotateIndex;
      const nextSelectedIndex = atLastIndex ? nextIndex : selectedIndex + 1;
      setRotateIndex(nextRotateIndex);
      setSelectedIndex(nextSelectedIndex);
      const slicedItems = hasLimit ? toRotated(items, nextRotateIndex).slice(0, limit) : items;
      if (typeof onHighlight === "function") {
        onHighlight(slicedItems[nextSelectedIndex]);
      }
    }
    if (/^[1-9]$/.test(input)) {
      const targetIndex = Number.parseInt(input, 10) - 1;
      const visibleItems = hasLimit ? toRotated(items, rotateIndex).slice(0, limit) : items;
      if (targetIndex >= 0 && targetIndex < visibleItems.length) {
        const selectedItem = visibleItems[targetIndex];
        if (selectedItem) {
          onSelect?.(selectedItem);
        }
      }
    }
    if (key.return) {
      const slicedItems = hasLimit ? toRotated(items, rotateIndex).slice(0, limit) : items;
      if (typeof onSelect === "function") {
        onSelect(slicedItems[selectedIndex]);
      }
    }
  }, [
    hasLimit,
    limit,
    rotateIndex,
    selectedIndex,
    items,
    onSelect,
    onHighlight
  ]), { isActive: isFocused });
  const slicedItems = hasLimit ? toRotated(items, rotateIndex).slice(0, limit) : items;
  return import_react3.default.createElement(Box_default, { flexDirection: "column" }, slicedItems.map((item, index) => {
    const isSelected = index === selectedIndex;
    return import_react3.default.createElement(Box_default, { key: item.key ?? item.value }, import_react3.default.createElement(indicatorComponent, { isSelected }), import_react3.default.createElement(itemComponent, { ...item, isSelected }));
  }));
}
var SelectInput_default = SelectInput;
// src/tui/components/ColorMenu.tsx
var import_react5 = __toESM(require_react(), 1);

// src/tui/components/List.tsx
var import_react4 = __toESM(require_react(), 1);
var jsx_runtime = __toESM(require_jsx_runtime(), 1);
function List({
  items,
  onSelect,
  onSelectionChange,
  initialSelection = 0,
  showBackButton,
  color,
  wrapNavigation = true,
  ...boxProps
}) {
  const [selectedIndex, setSelectedIndex] = import_react4.useState(initialSelection);
  const latestOnSelectionChangeRef = import_react4.useRef(onSelectionChange);
  const _items = import_react4.useMemo(() => {
    if (showBackButton) {
      return [...items, "-", { label: "← Back", value: "back" }];
    }
    return items;
  }, [items, showBackButton]);
  const selectableItems = _items.filter((item) => item !== "-" && !item.disabled);
  const selectedItem = selectableItems[selectedIndex];
  const selectedValue = selectedItem?.value;
  const actualIndex = _items.findIndex((item) => item === selectedItem);
  import_react4.useEffect(() => {
    latestOnSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);
  import_react4.useEffect(() => {
    const maxIndex = Math.max(selectableItems.length - 1, 0);
    setSelectedIndex(Math.min(initialSelection, maxIndex));
  }, [initialSelection, selectableItems.length]);
  import_react4.useEffect(() => {
    if (selectedValue !== undefined) {
      latestOnSelectionChangeRef.current?.(selectedValue, selectedIndex);
    }
  }, [selectedIndex, selectedValue]);
  use_input_default((_, key) => {
    if (key.upArrow) {
      const prev = selectedIndex - 1;
      const prevIndex = prev < 0 ? wrapNavigation ? selectableItems.length - 1 : 0 : prev;
      setSelectedIndex(prevIndex);
      return;
    }
    if (key.downArrow) {
      const next = selectedIndex + 1;
      const nextIndex = next > selectableItems.length - 1 ? wrapNavigation ? 0 : selectableItems.length - 1 : next;
      setSelectedIndex(nextIndex);
      return;
    }
    if (key.return && selectedItem) {
      onSelect(selectedItem.value, selectedIndex);
      return;
    }
  });
  return /* @__PURE__ */ jsx_runtime.jsxs(Box_default, {
    flexDirection: "column",
    ...boxProps,
    children: [
      _items.map((item, index) => {
        if (item === "-") {
          return /* @__PURE__ */ jsx_runtime.jsx(ListSeparator, {}, index);
        }
        const isSelected = index === actualIndex;
        return /* @__PURE__ */ jsx_runtime.jsx(ListItem, {
          isSelected,
          color,
          disabled: item.disabled,
          ...item.props,
          children: /* @__PURE__ */ jsx_runtime.jsxs(Text, {
            children: [
              /* @__PURE__ */ jsx_runtime.jsx(Text, {
                children: item.label
              }),
              item.sublabel && /* @__PURE__ */ jsx_runtime.jsxs(Text, {
                dimColor: !isSelected,
                children: [
                  " ",
                  item.sublabel
                ]
              })
            ]
          })
        }, index);
      }),
      selectedItem?.description && /* @__PURE__ */ jsx_runtime.jsx(Box_default, {
        marginTop: 1,
        paddingLeft: 2,
        children: /* @__PURE__ */ jsx_runtime.jsx(Text, {
          dimColor: true,
          wrap: "wrap",
          children: selectedItem.description
        })
      })
    ]
  });
}
function ListItem({
  children,
  isSelected,
  color = "green",
  disabled,
  ...boxProps
}) {
  return /* @__PURE__ */ jsx_runtime.jsx(Box_default, {
    ...boxProps,
    children: /* @__PURE__ */ jsx_runtime.jsxs(Text, {
      color: isSelected ? color : undefined,
      dimColor: disabled,
      children: [
        /* @__PURE__ */ jsx_runtime.jsx(Text, {
          children: isSelected ? "▶  " : "   "
        }),
        /* @__PURE__ */ jsx_runtime.jsx(Text, {
          children
        })
      ]
    })
  });
}
function ListSeparator() {
  return /* @__PURE__ */ jsx_runtime.jsx(Text, {
    children: " "
  });
}

// src/tui/components/ConfirmDialog.tsx
var jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var CONFIRM_OPTIONS = [
  {
    label: "Yes",
    value: true
  },
  {
    label: "No",
    value: false
  }
];
var ConfirmDialog = ({ message, onConfirm, onCancel, inline = false, busy = false }) => {
  use_input_default((_, key) => {
    if (key.escape && !busy) {
      onCancel();
    }
  });
  if (inline) {
    return /* @__PURE__ */ jsx_runtime2.jsx(List, {
      items: CONFIRM_OPTIONS,
      onSelect: (confirmed) => {
        if (confirmed) {
          onConfirm();
          return;
        }
        onCancel();
      },
      color: "cyan"
    });
  }
  return /* @__PURE__ */ jsx_runtime2.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx(Text, {
        children: message
      }),
      /* @__PURE__ */ jsx_runtime2.jsx(Box_default, {
        marginTop: 1,
        children: busy ? /* @__PURE__ */ jsx_runtime2.jsx(Text, {
          color: "yellow",
          children: "Working... This may take a moment."
        }) : /* @__PURE__ */ jsx_runtime2.jsx(List, {
          items: CONFIRM_OPTIONS,
          onSelect: (confirmed) => {
            if (confirmed) {
              onConfirm();
              return;
            }
            onCancel();
          },
          color: "cyan"
        })
      })
    ]
  });
};

// src/tui/components/color-menu/mutations.ts
function updateWidgetById(widgets, widgetId, updater) {
  return widgets.map((widget) => widget.id === widgetId ? updater(widget) : widget);
}
function setWidgetColor(widgets, widgetId, color, editingBackground) {
  return updateWidgetById(widgets, widgetId, (widget) => {
    if (editingBackground) {
      return {
        ...widget,
        backgroundColor: color
      };
    }
    return {
      ...widget,
      color
    };
  });
}
function toggleWidgetBold(widgets, widgetId) {
  return updateWidgetById(widgets, widgetId, (widget) => ({
    ...widget,
    bold: !widget.bold
  }));
}
function cycleWidgetDim(widgets, widgetId) {
  return updateWidgetById(widgets, widgetId, (widget) => {
    if (widget.dim === true) {
      return {
        ...widget,
        dim: "parens"
      };
    }
    if (widget.dim === "parens") {
      const { dim, ...restWidget } = widget;
      return restWidget;
    }
    return {
      ...widget,
      dim: true
    };
  });
}
function resetWidgetStyling(widgets, widgetId) {
  return updateWidgetById(widgets, widgetId, (widget) => {
    const {
      color,
      backgroundColor,
      bold,
      dim,
      ...restWidget
    } = widget;
    return restWidget;
  });
}
function clearAllWidgetStyling(widgets) {
  return widgets.map((widget) => {
    const {
      color,
      backgroundColor,
      bold,
      dim,
      ...restWidget
    } = widget;
    return restWidget;
  });
}
function getDefaultForegroundColor(widget) {
  if (widget.type === "separator" || widget.type === "flex-separator") {
    return "white";
  }
  const widgetImpl = getWidget(widget.type);
  return widgetImpl ? widgetImpl.getDefaultColor() : "white";
}
function getNextIndex(currentIndex, length, direction) {
  if (direction === "right") {
    return (currentIndex + 1) % length;
  }
  return currentIndex === 0 ? length - 1 : currentIndex - 1;
}
function cycleWidgetColor({
  widgets,
  widgetId,
  direction,
  editingBackground,
  colors,
  backgroundColors
}) {
  return updateWidgetById(widgets, widgetId, (widget) => {
    if (editingBackground) {
      if (backgroundColors.length === 0) {
        return widget;
      }
      const currentBgColor = widget.backgroundColor ?? "";
      let currentBgColorIndex = backgroundColors.indexOf(currentBgColor);
      if (currentBgColorIndex === -1) {
        currentBgColorIndex = 0;
      }
      const nextBgColorIndex = getNextIndex(currentBgColorIndex, backgroundColors.length, direction);
      const nextBgColor = backgroundColors[nextBgColorIndex];
      return {
        ...widget,
        backgroundColor: nextBgColor === "" ? undefined : nextBgColor
      };
    }
    if (colors.length === 0) {
      return widget;
    }
    const defaultColor = getDefaultForegroundColor(widget);
    let currentColor = widget.color ?? defaultColor;
    if (currentColor === "dim") {
      currentColor = defaultColor;
    }
    let currentColorIndex = colors.indexOf(currentColor);
    if (currentColorIndex === -1) {
      currentColorIndex = 0;
    }
    const nextColorIndex = getNextIndex(currentColorIndex, colors.length, direction);
    const nextColor = colors[nextColorIndex];
    return {
      ...widget,
      color: nextColor
    };
  });
}

// src/tui/components/ColorMenu.tsx
var jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var ColorMenu = ({ widgets, lineIndex, settings, onUpdate, onBack }) => {
  const [showSeparators, setShowSeparators] = import_react5.useState(false);
  const [hexInputMode, setHexInputMode] = import_react5.useState(false);
  const [hexInput, setHexInput] = import_react5.useState("");
  const [ansi256InputMode, setAnsi256InputMode] = import_react5.useState(false);
  const [ansi256Input, setAnsi256Input] = import_react5.useState("");
  const [showClearConfirm, setShowClearConfirm] = import_react5.useState(false);
  const [gradientMode, setGradientMode] = import_react5.useState(false);
  const [gradientIndex, setGradientIndex] = import_react5.useState(0);
  const [gradientCustomStep, setGradientCustomStep] = import_react5.useState(null);
  const [gradientStartHex, setGradientStartHex] = import_react5.useState("");
  const [gradientHexInput, setGradientHexInput] = import_react5.useState("");
  const powerlineEnabled = settings.powerline.enabled;
  const colorableWidgets = widgets.filter((widget) => {
    if (widget.type === "separator") {
      return showSeparators;
    }
    const widgetInstance = getWidget(widget.type);
    return widgetInstance ? widgetInstance.supportsColors(widget) : true;
  });
  const [highlightedItemId, setHighlightedItemId] = import_react5.useState(colorableWidgets[0]?.id ?? null);
  const [editingBackground, setEditingBackground] = import_react5.useState(false);
  const hasNoItems = colorableWidgets.length === 0;
  use_input_default((input, key) => {
    const shortcut = getPlainInput(input, key);
    if (hasNoItems) {
      onBack();
      return;
    }
    if (showClearConfirm) {
      return;
    }
    if (hexInputMode) {
      if (key.upArrow || key.downArrow) {
        return;
      }
      if (key.escape) {
        setHexInputMode(false);
        setHexInput("");
      } else if (key.return) {
        if (hexInput.length === 6) {
          const hexColor = `hex:${hexInput}`;
          const selectedWidget = colorableWidgets.find((widget) => widget.id === highlightedItemId);
          if (selectedWidget) {
            const newItems = setWidgetColor(widgets, selectedWidget.id, hexColor, editingBackground);
            onUpdate(newItems);
          }
          setHexInputMode(false);
          setHexInput("");
        }
      } else if (key.backspace || key.delete) {
        setHexInput(hexInput.slice(0, -1));
      } else if (shouldInsertInput(input, key) && hexInput.length < 6) {
        const upperInput = input.toUpperCase();
        if (/^[0-9A-F]$/.test(upperInput)) {
          setHexInput(hexInput + upperInput);
        }
      }
      return;
    }
    if (ansi256InputMode) {
      if (key.upArrow || key.downArrow) {
        return;
      }
      if (key.escape) {
        setAnsi256InputMode(false);
        setAnsi256Input("");
      } else if (key.return) {
        const code = Number.parseInt(ansi256Input, 10);
        if (!Number.isNaN(code) && code >= 0 && code <= 255) {
          const ansiColor = `ansi256:${code}`;
          const selectedWidget = colorableWidgets.find((widget) => widget.id === highlightedItemId);
          if (selectedWidget) {
            const newItems = setWidgetColor(widgets, selectedWidget.id, ansiColor, editingBackground);
            onUpdate(newItems);
            setAnsi256InputMode(false);
            setAnsi256Input("");
          }
        }
      } else if (key.backspace || key.delete) {
        setAnsi256Input(ansi256Input.slice(0, -1));
      } else if (shouldInsertInput(input, key) && ansi256Input.length < 3) {
        if (/^[0-9]$/.test(input)) {
          const newInput = ansi256Input + input;
          const code = Number.parseInt(newInput, 10);
          if (code <= 255) {
            setAnsi256Input(newInput);
          }
        }
      }
      return;
    }
    if (gradientMode) {
      const exitGradient = () => {
        setGradientMode(false);
        setGradientCustomStep(null);
        setGradientStartHex("");
        setGradientHexInput("");
      };
      const applyGradientValue = (value) => {
        const selectedWidget = colorableWidgets.find((widget) => widget.id === highlightedItemId);
        if (selectedWidget) {
          onUpdate(setWidgetColor(widgets, selectedWidget.id, value, false));
        }
        exitGradient();
      };
      if (gradientCustomStep) {
        if (key.escape) {
          setGradientCustomStep(null);
          setGradientHexInput("");
        } else if (key.return) {
          if (gradientHexInput.length === 6) {
            if (gradientCustomStep === "start") {
              setGradientStartHex(gradientHexInput);
              setGradientHexInput("");
              setGradientCustomStep("end");
            } else {
              applyGradientValue(`gradient:${gradientStartHex}-${gradientHexInput}`);
            }
          }
        } else if (key.backspace || key.delete) {
          setGradientHexInput(gradientHexInput.slice(0, -1));
        } else if (shouldInsertInput(input, key) && gradientHexInput.length < 6) {
          const upperInput = input.toUpperCase();
          if (/^[0-9A-F]$/.test(upperInput)) {
            setGradientHexInput(gradientHexInput + upperInput);
          }
        }
        return;
      }
      const total = GRADIENT_PRESET_NAMES.length + 1;
      if (key.escape) {
        exitGradient();
      } else if (key.upArrow) {
        setGradientIndex((gradientIndex - 1 + total) % total);
      } else if (key.downArrow) {
        setGradientIndex((gradientIndex + 1) % total);
      } else if (key.return) {
        if (gradientIndex < GRADIENT_PRESET_NAMES.length) {
          applyGradientValue(`gradient:${GRADIENT_PRESET_NAMES[gradientIndex]}`);
        } else {
          setGradientStartHex("");
          setGradientHexInput("");
          setGradientCustomStep("start");
        }
      }
      return;
    }
    if (input && /^[0-9]$/.test(input)) {
      return;
    }
    if (key.escape) {
      if (editingBackground) {
        setEditingBackground(false);
      } else {
        onBack();
      }
    } else if (key.return) {
      if (highlightedItemId === "back") {
        onBack();
      }
    } else if (shortcut === "h" || shortcut === "H") {
      if (highlightedItemId && highlightedItemId !== "back" && settings.colorLevel === 3) {
        setHexInputMode(true);
        setHexInput("");
      }
    } else if (shortcut === "a" || shortcut === "A") {
      if (highlightedItemId && highlightedItemId !== "back" && settings.colorLevel === 2) {
        setAnsi256InputMode(true);
        setAnsi256Input("");
      }
    } else if (shortcut === "g" || shortcut === "G") {
      if (highlightedItemId && highlightedItemId !== "back" && !editingBackground && settings.colorLevel >= 2) {
        setGradientMode(true);
        setGradientIndex(0);
        setGradientCustomStep(null);
        setGradientStartHex("");
        setGradientHexInput("");
      }
    } else if (shortcut === "s" || shortcut === "S") {
      if (!settings.powerline.enabled && !settings.defaultSeparator) {
        setShowSeparators(!showSeparators);
        const highlightedWidget = colorableWidgets.find((widget) => widget.id === highlightedItemId);
        if (showSeparators && highlightedWidget?.type === "separator") {
          setHighlightedItemId(colorableWidgets.find((widget) => widget.type !== "separator")?.id ?? null);
        }
      }
    } else if (shortcut === "f" || shortcut === "F") {
      if (colorableWidgets.length > 0) {
        setEditingBackground(!editingBackground);
      }
    } else if (shortcut === "b" || shortcut === "B") {
      if (highlightedItemId && highlightedItemId !== "back") {
        const selectedWidget = colorableWidgets.find((widget) => widget.id === highlightedItemId);
        if (selectedWidget) {
          const newItems = toggleWidgetBold(widgets, selectedWidget.id);
          onUpdate(newItems);
        }
      }
    } else if (shortcut === "d" || shortcut === "D") {
      if (highlightedItemId && highlightedItemId !== "back") {
        const selectedWidget = colorableWidgets.find((widget) => widget.id === highlightedItemId);
        if (selectedWidget) {
          const newItems = cycleWidgetDim(widgets, selectedWidget.id);
          onUpdate(newItems);
        }
      }
    } else if (shortcut === "r" || shortcut === "R") {
      if (highlightedItemId && highlightedItemId !== "back") {
        const selectedWidget = colorableWidgets.find((widget) => widget.id === highlightedItemId);
        if (selectedWidget) {
          const newItems = resetWidgetStyling(widgets, selectedWidget.id);
          onUpdate(newItems);
        }
      }
    } else if (shortcut === "c" || shortcut === "C") {
      setShowClearConfirm(true);
    } else if (key.leftArrow || key.rightArrow) {
      if (highlightedItemId && highlightedItemId !== "back") {
        const selectedWidget = colorableWidgets.find((widget) => widget.id === highlightedItemId);
        if (selectedWidget) {
          const newItems = cycleWidgetColor({
            widgets,
            widgetId: selectedWidget.id,
            direction: key.rightArrow ? "right" : "left",
            editingBackground,
            colors,
            backgroundColors: bgColors
          });
          onUpdate(newItems);
        }
      }
    }
  });
  if (hasNoItems) {
    return /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
          bold: true,
          children: [
            "Configure Colors",
            lineIndex !== undefined ? ` - Line ${lineIndex + 1}` : ""
          ]
        }),
        /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            dimColor: true,
            children: "No colorable widgets in the status line."
          })
        }),
        /* @__PURE__ */ jsx_runtime3.jsx(Text, {
          dimColor: true,
          children: "Add a widget first to continue."
        }),
        /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            children: "Press any key to go back..."
          })
        })
      ]
    });
  }
  const getItemLabel = (widget) => {
    if (widget.type === "separator") {
      const char = widget.character ?? "|";
      return `Separator: ${char === " " ? "space" : char}`;
    }
    if (widget.type === "flex-separator") {
      return "Flex Separator";
    }
    const widgetImpl = getWidget(widget.type);
    return widgetImpl ? widgetImpl.getDisplayName() : `Unknown: ${widget.type}`;
  };
  const colorOptions = getAvailableColorsForUI();
  const colors = colorOptions.map((c) => c.value || "");
  const bgColorOptions = getAvailableBackgroundColorsForUI();
  const bgColors = bgColorOptions.map((c) => c.value || "");
  const menuItems = colorableWidgets.map((widget, index) => {
    const label = `${index + 1}: ${getItemLabel(widget)}`;
    const level = getColorLevelString(settings.colorLevel);
    let defaultColor = "white";
    if (widget.type !== "separator" && widget.type !== "flex-separator") {
      const widgetImpl = getWidget(widget.type);
      if (widgetImpl) {
        defaultColor = widgetImpl.getDefaultColor();
      }
    }
    const styledLabel = applyColors(label, widget.color ?? defaultColor, widget.backgroundColor, widget.bold, level, widget.dim);
    return {
      label: styledLabel,
      value: widget.id
    };
  });
  menuItems.push({ label: "← Back", value: "back" });
  const handleHighlight = (item) => {
    setHighlightedItemId(item.value);
  };
  const selectedWidget = highlightedItemId && highlightedItemId !== "back" ? colorableWidgets.find((widget) => widget.id === highlightedItemId) : null;
  const currentColor = editingBackground ? selectedWidget?.backgroundColor ?? "" : selectedWidget ? selectedWidget.color ?? (() => {
    if (selectedWidget.type !== "separator" && selectedWidget.type !== "flex-separator") {
      const widgetImpl = getWidget(selectedWidget.type);
      return widgetImpl ? widgetImpl.getDefaultColor() : "white";
    }
    return "white";
  })() : "white";
  const colorList = editingBackground ? bgColors : colors;
  const colorIndex = colorList.indexOf(currentColor);
  const colorNumber = colorIndex === -1 ? "custom" : colorIndex + 1;
  let colorDisplay;
  if (editingBackground) {
    if (!currentColor || currentColor === "") {
      colorDisplay = source_default.gray("(no background)");
    } else {
      let displayName;
      if (currentColor.startsWith("ansi256:")) {
        displayName = `ANSI ${currentColor.substring(8)}`;
      } else if (currentColor.startsWith("hex:")) {
        displayName = `#${currentColor.substring(4)}`;
      } else {
        const colorOption = bgColorOptions.find((c) => c.value === currentColor);
        displayName = colorOption ? colorOption.name : currentColor;
      }
      const level = getColorLevelString(settings.colorLevel);
      colorDisplay = applyColors(` ${displayName} `, undefined, currentColor, false, level);
    }
  } else {
    if (!currentColor || currentColor === "") {
      colorDisplay = source_default.gray("(default)");
    } else {
      let displayName;
      if (currentColor.startsWith("ansi256:")) {
        displayName = `ANSI ${currentColor.substring(8)}`;
      } else if (currentColor.startsWith("hex:")) {
        displayName = `#${currentColor.substring(4)}`;
      } else if (currentColor.startsWith("gradient:")) {
        const body = currentColor.substring(9);
        if (GRADIENT_PRESET_NAMES.includes(body.toLowerCase())) {
          displayName = `Gradient: ${body.toLowerCase()}`;
        } else {
          displayName = `Gradient: ${body}`;
        }
      } else {
        const colorOption = colorOptions.find((c) => c.value === currentColor);
        displayName = colorOption ? colorOption.name : currentColor;
      }
      const level = getColorLevelString(settings.colorLevel);
      colorDisplay = applyColors(displayName, currentColor, undefined, false, level);
    }
  }
  const styleIndicators = [
    selectedWidget?.bold ? "[BOLD]" : null,
    selectedWidget?.dim === true ? "[DIM]" : null,
    selectedWidget?.dim === "parens" ? "[DIM ()]" : null
  ].filter((indicator) => indicator !== null).join(" ");
  if (gradientMode) {
    const level = getColorLevelString(settings.colorLevel);
    const widgetName = selectedWidget ? getItemLabel(selectedWidget) : "";
    if (gradientCustomStep) {
      return /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
            bold: true,
            children: [
              "Custom Gradient",
              widgetName ? ` - ${widgetName}` : ""
            ]
          }),
          /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
            marginTop: 1,
            flexDirection: "column",
            children: [
              /* @__PURE__ */ jsx_runtime3.jsx(Text, {
                children: gradientCustomStep === "start" ? "Enter START hex color (without #):" : "Enter END hex color (without #):"
              }),
              gradientCustomStep === "end" && /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
                dimColor: true,
                children: [
                  "Start: #",
                  gradientStartHex
                ]
              }),
              /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
                children: [
                  "#",
                  gradientHexInput,
                  /* @__PURE__ */ jsx_runtime3.jsx(Text, {
                    dimColor: true,
                    children: gradientHexInput.length < 6 ? "_".repeat(6 - gradientHexInput.length) : ""
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime3.jsx(Text, {
                children: " "
              }),
              /* @__PURE__ */ jsx_runtime3.jsx(Text, {
                dimColor: true,
                children: "Press Enter when done, ESC to go back"
              })
            ]
          })
        ]
      });
    }
    return /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
          bold: true,
          children: [
            "Select Gradient",
            widgetName ? ` - ${widgetName}` : ""
          ]
        }),
        /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            dimColor: true,
            children: "↑↓ to select, Enter to apply, ESC to cancel"
          })
        }),
        /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
          marginTop: 1,
          flexDirection: "column",
          children: [
            GRADIENT_PRESET_NAMES.map((name, idx) => /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
              children: [
                idx === gradientIndex ? "▶ " : "  ",
                applyColors(name, `gradient:${name}`, undefined, idx === gradientIndex, level)
              ]
            }, name)),
            /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
              children: [
                gradientIndex === GRADIENT_PRESET_NAMES.length ? "▶ " : "  ",
                "Custom (enter two hex stops)"
              ]
            }, "custom")
          ]
        })
      ]
    });
  }
  if (showClearConfirm) {
    return /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime3.jsx(Text, {
          bold: true,
          color: "yellow",
          children: "⚠ Confirm Clear All Colors"
        }),
        /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
          marginTop: 1,
          flexDirection: "column",
          children: [
            /* @__PURE__ */ jsx_runtime3.jsx(Text, {
              children: "This will reset all colors for all widgets to their defaults."
            }),
            /* @__PURE__ */ jsx_runtime3.jsx(Text, {
              color: "red",
              children: "This action cannot be undone!"
            })
          ]
        }),
        /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
          marginTop: 2,
          children: /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            children: "Continue?"
          })
        }),
        /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime3.jsx(ConfirmDialog, {
            inline: true,
            onConfirm: () => {
              const newItems = clearAllWidgetStyling(widgets);
              onUpdate(newItems);
              setShowClearConfirm(false);
            },
            onCancel: () => {
              setShowClearConfirm(false);
            }
          })
        })
      ]
    });
  }
  const hasGlobalFgOverride = !!settings.overrideForegroundColor;
  const hasGlobalBgOverride = !!settings.overrideBackgroundColor && !powerlineEnabled;
  const globalOverrideMessage = hasGlobalFgOverride && hasGlobalBgOverride ? "⚠ Global override for FG and BG active" : hasGlobalFgOverride ? "⚠ Global override for FG active" : hasGlobalBgOverride ? "⚠ Global override for BG active" : null;
  return /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
        children: [
          /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
            bold: true,
            children: [
              "Configure Colors",
              lineIndex !== undefined ? ` - Line ${lineIndex + 1}` : "",
              editingBackground && source_default.yellow(" [Background Mode]")
            ]
          }),
          globalOverrideMessage && /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
            color: "yellow",
            dimColor: true,
            children: [
              ".  ",
              globalOverrideMessage
            ]
          })
        ]
      }),
      hexInputMode ? /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            children: "Enter 6-digit hex color code (without #):"
          }),
          /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
            children: [
              "#",
              hexInput,
              /* @__PURE__ */ jsx_runtime3.jsx(Text, {
                dimColor: true,
                children: hexInput.length < 6 ? "_".repeat(6 - hexInput.length) : ""
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            children: " "
          }),
          /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            dimColor: true,
            children: "Press Enter when done, ESC to cancel"
          })
        ]
      }) : ansi256InputMode ? /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            children: "Enter ANSI 256 color code (0-255):"
          }),
          /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
            children: [
              ansi256Input,
              /* @__PURE__ */ jsx_runtime3.jsx(Text, {
                dimColor: true,
                children: ansi256Input.length === 0 ? "___" : ansi256Input.length === 1 ? "__" : ansi256Input.length === 2 ? "_" : ""
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            children: " "
          }),
          /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            dimColor: true,
            children: "Press Enter when done, ESC to cancel"
          })
        ]
      }) : /* @__PURE__ */ jsx_runtime3.jsxs(jsx_runtime3.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
            dimColor: true,
            children: [
              "↑↓ to select, ←→ to cycle",
              " ",
              editingBackground ? "background" : "foreground",
              ", (f) to toggle bg/fg, (b)old, (d)im,",
              settings.colorLevel === 3 ? " (h)ex," : settings.colorLevel === 2 ? " (a)nsi256," : "",
              !editingBackground && settings.colorLevel >= 2 ? " (g)radient," : "",
              " ",
              "(r)eset, (c)lear all, ESC to go back"
            ]
          }),
          !settings.powerline.enabled && !settings.defaultSeparator && /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
            dimColor: true,
            children: [
              "(s)how separators:",
              showSeparators ? source_default.green("ON") : source_default.gray("OFF")
            ]
          }),
          selectedWidget ? /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
              children: [
                "Current",
                " ",
                editingBackground ? "background" : "foreground",
                " ",
                "(",
                colorNumber === "custom" ? "custom" : `${colorNumber}/${colorList.length}`,
                "):",
                " ",
                colorDisplay,
                styleIndicators && ` ${styleIndicators}`
              ]
            })
          }) : /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime3.jsx(Text, {
              children: " "
            })
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
        marginTop: 1,
        children: hexInputMode || ansi256InputMode ? /* @__PURE__ */ jsx_runtime3.jsx(Box_default, {
          flexDirection: "column",
          children: menuItems.map((item) => /* @__PURE__ */ jsx_runtime3.jsxs(Text, {
            color: item.value === highlightedItemId ? "cyan" : "white",
            bold: item.value === highlightedItemId,
            children: [
              item.value === highlightedItemId ? "▶ " : "  ",
              item.label
            ]
          }, item.value))
        }) : /* @__PURE__ */ jsx_runtime3.jsx(SelectInput_default, {
          items: menuItems,
          onHighlight: handleHighlight,
          initialIndex: Math.max(0, menuItems.findIndex((item) => item.value === highlightedItemId)),
          indicatorComponent: ({ isSelected }) => /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            children: isSelected ? "▶" : "  "
          }),
          itemComponent: ({ isSelected, label }) => /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            children: ` ${label}`
          })
        }, `${showSeparators}-${highlightedItemId}`)
      }),
      /* @__PURE__ */ jsx_runtime3.jsxs(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            color: "yellow",
            children: "⚠ VSCode Users: "
          }),
          /* @__PURE__ */ jsx_runtime3.jsx(Text, {
            dimColor: true,
            wrap: "wrap",
            children: 'If colors appear incorrect in the VSCode integrated terminal, the "Terminal › Integrated: Minimum Contrast Ratio" (`terminal.integrated.minimumContrastRatio`) setting is forcing a minimum contrast between foreground and background colors. You can adjust this setting to 1 to disable the contrast enforcement, or use a standalone terminal for accurate colors.'
          })
        ]
      })
    ]
  });
};
// src/tui/components/ExportConfigDialog.tsx
var import_react6 = __toESM(require_react(), 1);
import * as os4 from "node:os";
import * as path3 from "node:path";
var jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var DEFAULT_EXPORT_PATH = path3.join(os4.homedir(), "ccstatusline-config.json");
function ExportConfigDialog({ onExport, onCancel }) {
  const [inputValue, setInputValue] = import_react6.useState(DEFAULT_EXPORT_PATH);
  use_input_default((input, key) => {
    if (key.return) {
      onExport(inputValue);
    } else if (key.escape) {
      onCancel();
    } else if (key.backspace) {
      setInputValue(inputValue.slice(0, -1));
    } else if (shouldInsertInput(input, key)) {
      setInputValue(inputValue + input);
    }
  });
  return /* @__PURE__ */ jsx_runtime4.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime4.jsx(Text, {
        bold: true,
        children: "Export Config"
      }),
      /* @__PURE__ */ jsx_runtime4.jsx(Text, {
        dimColor: true,
        children: "Enter the file path to export your configuration to:"
      }),
      /* @__PURE__ */ jsx_runtime4.jsxs(Box_default, {
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_runtime4.jsx(Text, {
            children: "Path: "
          }),
          /* @__PURE__ */ jsx_runtime4.jsx(Text, {
            children: inputValue
          }),
          /* @__PURE__ */ jsx_runtime4.jsx(Text, {
            inverse: true,
            children: " "
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime4.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime4.jsx(Text, {
          dimColor: true,
          children: "Enter to confirm, Escape to cancel"
        })
      })
    ]
  });
}
// src/tui/components/ImportConfigDialog.tsx
var import_react7 = __toESM(require_react(), 1);
var jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
function ImportConfigDialog({ onFileChosen, onCancel }) {
  const [inputValue, setInputValue] = import_react7.useState("");
  use_input_default((input, key) => {
    if (key.return) {
      onFileChosen(inputValue);
    } else if (key.escape) {
      onCancel();
    } else if (key.backspace) {
      setInputValue(inputValue.slice(0, -1));
    } else if (shouldInsertInput(input, key)) {
      setInputValue(inputValue + input);
    }
  });
  return /* @__PURE__ */ jsx_runtime5.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime5.jsx(Text, {
        bold: true,
        children: "Import Config"
      }),
      /* @__PURE__ */ jsx_runtime5.jsx(Text, {
        dimColor: true,
        children: "Enter the file path to import configuration from:"
      }),
      /* @__PURE__ */ jsx_runtime5.jsxs(Box_default, {
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_runtime5.jsx(Text, {
            children: "Path: "
          }),
          /* @__PURE__ */ jsx_runtime5.jsx(Text, {
            children: inputValue
          }),
          /* @__PURE__ */ jsx_runtime5.jsx(Text, {
            inverse: true,
            children: " "
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime5.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime5.jsx(Text, {
          dimColor: true,
          children: "Enter to confirm, Escape to cancel"
        })
      })
    ]
  });
}
// src/tui/components/ImportPreviewDialog.tsx
var import_react8 = __toESM(require_react(), 1);
var jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var EXCLUDED_KEYS = new Set(["version", "installation", "updatemessage"]);
function getImportPreviewKeys(current, imported) {
  const keys = new Set([
    ...Object.keys(current),
    ...Object.keys(imported)
  ]);
  return [...keys].filter((key) => !EXCLUDED_KEYS.has(key));
}
function getImportPreviewSettings(current, validation, mode) {
  return applyImport(current, validation.data, mode, validation.presentKeys);
}
function escapeControlCharacters(text) {
  return text.replace(/[\x00-\x1f\x7f-\x9f]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
function formatScalar(value) {
  if (value === null || value === undefined) {
    return "none";
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    return escapeControlCharacters(value) || "(empty)";
  }
  return escapeControlCharacters(JSON.stringify(value));
}
function getCustomCommands(settings) {
  return settings.lines.flat().filter((widget) => widget.type === "custom-command" && widget.commandPath).map((widget) => widget.commandPath ?? "");
}
function getImportedCommands(current, preview) {
  const existing = new Set(getCustomCommands(current));
  return [...new Set(getCustomCommands(preview).filter((command) => !existing.has(command)))];
}
function diffObject(current, imported, prefix) {
  const keys = new Set([...Object.keys(current), ...Object.keys(imported)]);
  const entries = [];
  for (const key of keys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const a = current[key];
    const b = imported[key];
    if (JSON.stringify(a) === JSON.stringify(b)) {
      continue;
    }
    if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
      entries.push(...diffObject(a, b, path));
    } else {
      entries.push({ path, current: a, imported: b });
    }
  }
  return entries;
}
function diffLines(currentLines, importedLines) {
  const entries = [];
  const lineCount = Math.max(currentLines.length, importedLines.length);
  for (let li = 0;li < lineCount; li++) {
    const curLine = currentLines[li] ?? [];
    const impLine = importedLines[li] ?? [];
    const widgetCount = Math.max(curLine.length, impLine.length);
    for (let wi = 0;wi < widgetCount; wi++) {
      const curWidget = curLine[wi];
      const impWidget = impLine[wi];
      if (JSON.stringify(curWidget) === JSON.stringify(impWidget)) {
        continue;
      }
      if (!curWidget) {
        const addedType = impWidget?.type ?? "unknown";
        entries.push({ path: `line ${li + 1} +${addedType}`, current: undefined, imported: "[added]" });
        continue;
      }
      if (!impWidget) {
        entries.push({ path: `line ${li + 1} -${curWidget.type}`, current: "[removed]", imported: undefined });
        continue;
      }
      const label = `${curWidget.type} (line ${li + 1})`;
      const widgetKeys = new Set([...Object.keys(curWidget), ...Object.keys(impWidget)]);
      for (const key of widgetKeys) {
        if (key === "id") {
          continue;
        }
        const a = curWidget[key];
        const b = impWidget[key];
        if (JSON.stringify(a) !== JSON.stringify(b)) {
          entries.push({ path: `${label} ${key}`, current: a, imported: b });
        }
      }
    }
  }
  return entries;
}
function ImportPreviewDialog({
  validation,
  currentSettings,
  onApply,
  onCancel
}) {
  const [previewMode, setPreviewMode] = import_react8.useState("replace");
  const [pendingMode, setPendingMode] = import_react8.useState(null);
  const previewSettings = getImportPreviewSettings(currentSettings, validation, previewMode);
  const topLevelKeys = getImportPreviewKeys(currentSettings, previewSettings);
  const importedCommands = getImportedCommands(currentSettings, previewSettings);
  const items = [
    { label: "Replace All", value: "replace", description: "Overwrite all settings with the imported config" },
    { label: "Merge", value: "merge", description: "Overlay imported settings on top of current settings" },
    "-",
    { label: "Cancel", value: "cancel" }
  ];
  function handleSelect(value) {
    if (value === "cancel" || value === "back") {
      onCancel();
      return;
    }
    const commands = getImportedCommands(currentSettings, getImportPreviewSettings(currentSettings, validation, value));
    if (commands.length > 0) {
      setPendingMode(value);
      return;
    }
    onApply(value);
  }
  if (pendingMode) {
    const commands = getImportedCommands(currentSettings, getImportPreviewSettings(currentSettings, validation, pendingMode));
    const confirmItems = [
      { label: "Cancel", value: "cancel", description: "Go back to the preview without importing" },
      { label: "Apply and run these commands", value: "confirm", description: "Import the settings, including the commands above" }
    ];
    return /* @__PURE__ */ jsx_runtime6.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime6.jsx(Text, {
          bold: true,
          children: "Import Preview"
        }),
        /* @__PURE__ */ jsx_runtime6.jsx(Text, {
          color: "yellow",
          children: `Apply this import? It adds ${commands.length === 1 ? "a shell command" : `${commands.length} shell commands`} that will run on every status line render:`
        }),
        /* @__PURE__ */ jsx_runtime6.jsx(Box_default, {
          flexDirection: "column",
          marginLeft: 4,
          children: commands.map((command, index) => /* @__PURE__ */ jsx_runtime6.jsx(Text, {
            children: `$ ${escapeControlCharacters(command)}`
          }, index))
        }),
        /* @__PURE__ */ jsx_runtime6.jsx(List, {
          items: confirmItems,
          onSelect: (choice) => {
            if (choice === "confirm") {
              onApply(pendingMode);
              return;
            }
            setPendingMode(null);
          }
        })
      ]
    });
  }
  function handleSelectionChange(value) {
    if (value === "replace" || value === "merge") {
      setPreviewMode(value);
    }
  }
  const diffRows = [];
  for (const key of topLevelKeys) {
    const current = currentSettings[key];
    const imported = previewSettings[key];
    const changed = JSON.stringify(current) !== JSON.stringify(imported);
    if (!changed) {
      diffRows.push(/* @__PURE__ */ jsx_runtime6.jsx(Box_default, {
        children: /* @__PURE__ */ jsx_runtime6.jsx(Text, {
          dimColor: true,
          children: `  ${key}: ${formatScalar(current)}`
        })
      }, key));
      continue;
    }
    if (key === "lines") {
      const entries = diffLines(current, imported);
      diffRows.push(/* @__PURE__ */ jsx_runtime6.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime6.jsx(Text, {
            children: `  ${key}:`
          }),
          entries.map((e, i) => /* @__PURE__ */ jsx_runtime6.jsxs(Box_default, {
            marginLeft: 4,
            children: [
              /* @__PURE__ */ jsx_runtime6.jsx(Text, {
                children: `${escapeControlCharacters(e.path)}: `
              }),
              /* @__PURE__ */ jsx_runtime6.jsx(Text, {
                color: "red",
                children: formatScalar(e.current)
              }),
              /* @__PURE__ */ jsx_runtime6.jsx(Text, {
                children: " → "
              }),
              /* @__PURE__ */ jsx_runtime6.jsx(Text, {
                color: "green",
                children: formatScalar(e.imported)
              })
            ]
          }, i))
        ]
      }, key));
      continue;
    }
    if (current && imported && typeof current === "object" && typeof imported === "object" && !Array.isArray(current)) {
      const entries = diffObject(current, imported, key);
      diffRows.push(/* @__PURE__ */ jsx_runtime6.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime6.jsx(Text, {
            children: `  ${key}:`
          }),
          entries.map((e, i) => /* @__PURE__ */ jsx_runtime6.jsxs(Box_default, {
            marginLeft: 4,
            children: [
              /* @__PURE__ */ jsx_runtime6.jsx(Text, {
                children: `${escapeControlCharacters(e.path)}: `
              }),
              /* @__PURE__ */ jsx_runtime6.jsx(Text, {
                color: "red",
                children: formatScalar(e.current)
              }),
              /* @__PURE__ */ jsx_runtime6.jsx(Text, {
                children: " → "
              }),
              /* @__PURE__ */ jsx_runtime6.jsx(Text, {
                color: "green",
                children: formatScalar(e.imported)
              })
            ]
          }, i))
        ]
      }, key));
      continue;
    }
    diffRows.push(/* @__PURE__ */ jsx_runtime6.jsxs(Box_default, {
      children: [
        /* @__PURE__ */ jsx_runtime6.jsx(Text, {
          children: `  ${escapeControlCharacters(key)}: `
        }),
        /* @__PURE__ */ jsx_runtime6.jsx(Text, {
          color: "red",
          children: formatScalar(current)
        }),
        /* @__PURE__ */ jsx_runtime6.jsx(Text, {
          children: " → "
        }),
        /* @__PURE__ */ jsx_runtime6.jsx(Text, {
          color: "green",
          children: formatScalar(imported)
        })
      ]
    }, key));
  }
  return /* @__PURE__ */ jsx_runtime6.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime6.jsx(Text, {
        bold: true,
        children: "Import Preview"
      }),
      /* @__PURE__ */ jsx_runtime6.jsx(Text, {
        dimColor: true,
        children: "Changes that will be applied:"
      }),
      /* @__PURE__ */ jsx_runtime6.jsx(Box_default, {
        flexDirection: "column",
        children: diffRows
      }),
      importedCommands.length > 0 && /* @__PURE__ */ jsx_runtime6.jsxs(Box_default, {
        flexDirection: "column",
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_runtime6.jsx(Text, {
            color: "yellow",
            children: "This import adds shell commands that run on every status line render:"
          }),
          /* @__PURE__ */ jsx_runtime6.jsx(Box_default, {
            flexDirection: "column",
            marginLeft: 4,
            children: importedCommands.map((command, index) => /* @__PURE__ */ jsx_runtime6.jsx(Text, {
              children: `$ ${escapeControlCharacters(command)}`
            }, index))
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime6.jsx(List, {
        items,
        onSelect: handleSelect,
        onSelectionChange: handleSelectionChange
      })
    ]
  });
}
// src/tui/components/GlobalOverridesMenu.tsx
var import_react9 = __toESM(require_react(), 1);
var jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var NUMBER_FORMAT_KIND_WIDTH = Math.max(...NUMBER_KINDS.map((kind) => kind.length));
function cycleGlobalNumberStyle(settings, kind) {
  const current = settings.numberFormat?.[kind]?.style;
  const nextStyle = getNextNumberStyle(current);
  const kindFormat = { ...settings.numberFormat?.[kind] };
  if (nextStyle === undefined) {
    delete kindFormat.style;
  } else {
    kindFormat.style = nextStyle;
  }
  const { [kind]: removedKind, ...restGlobal } = settings.numberFormat ?? {};
  const nextGlobal = Object.keys(kindFormat).length > 0 ? { ...restGlobal, [kind]: kindFormat } : restGlobal;
  return {
    ...settings,
    numberFormat: Object.keys(nextGlobal).length > 0 ? nextGlobal : undefined
  };
}
var GlobalOverridesMenu = ({ settings, onUpdate, onBack }) => {
  const [editingPadding, setEditingPadding] = import_react9.useState(false);
  const [editingSeparator, setEditingSeparator] = import_react9.useState(false);
  const [confirmingSeparator, setConfirmingSeparator] = import_react9.useState(false);
  const [paddingInput, setPaddingInput] = import_react9.useState(settings.defaultPadding ?? "");
  const [separatorInput, setSeparatorInput] = import_react9.useState(settings.defaultSeparator ?? "");
  const [inheritColors, setInheritColors] = import_react9.useState(settings.inheritSeparatorColors);
  const [globalBold, setGlobalBold] = import_react9.useState(settings.globalBold);
  const [minimalistMode, setMinimalistMode] = import_react9.useState(settings.minimalistMode);
  const [numberFormatMode, setNumberFormatMode] = import_react9.useState(false);
  const [numberFormatKindIndex, setNumberFormatKindIndex] = import_react9.useState(0);
  const [gradientMode, setGradientMode] = import_react9.useState(false);
  const [gradientIndex, setGradientIndex] = import_react9.useState(0);
  const [gradientCustomStep, setGradientCustomStep] = import_react9.useState(null);
  const [gradientStartHex, setGradientStartHex] = import_react9.useState("");
  const [gradientHexInput, setGradientHexInput] = import_react9.useState("");
  const isPowerlineEnabled = settings.powerline.enabled;
  const hasManualSeparators = settings.lines.some((line) => line.some((item) => item.type === "separator"));
  const bgColors = ["none", ...COLOR_MAP.filter((c) => c.isBackground).map((c) => c.name)];
  const fgColors = ["none", ...COLOR_MAP.filter((c) => !c.isBackground).map((c) => c.name)];
  const currentBgIndex = bgColors.indexOf(settings.overrideBackgroundColor ?? "none");
  const currentFgIndex = fgColors.indexOf(settings.overrideForegroundColor ?? "none");
  use_input_default((input, key) => {
    const shortcut = getPlainInput(input, key);
    if (editingPadding) {
      if (key.return) {
        const updatedSettings = {
          ...settings,
          defaultPadding: paddingInput
        };
        onUpdate(updatedSettings);
        setEditingPadding(false);
      } else if (key.escape) {
        setPaddingInput(settings.defaultPadding ?? "");
        setEditingPadding(false);
      } else if (key.backspace) {
        setPaddingInput(paddingInput.slice(0, -1));
      } else if (key.delete) {} else if (shouldInsertInput(input, key)) {
        setPaddingInput(paddingInput + input);
      }
    } else if (editingSeparator) {
      if (key.return) {
        if (separatorInput && hasManualSeparators) {
          setEditingSeparator(false);
          setConfirmingSeparator(true);
        } else {
          const updatedSettings = {
            ...settings,
            defaultSeparator: separatorInput || undefined,
            lines: separatorInput ? settings.lines.map((line) => line.filter((item) => item.type !== "separator")) : settings.lines
          };
          onUpdate(updatedSettings);
          setEditingSeparator(false);
        }
      } else if (key.escape) {
        setSeparatorInput(settings.defaultSeparator ?? "");
        setEditingSeparator(false);
      } else if (key.backspace) {
        setSeparatorInput(separatorInput.slice(0, -1));
      } else if (key.delete) {} else if (shouldInsertInput(input, key)) {
        setSeparatorInput(separatorInput + input);
      }
    } else if (confirmingSeparator) {
      return;
    } else if (gradientMode) {
      const exitGradient = () => {
        setGradientMode(false);
        setGradientCustomStep(null);
        setGradientStartHex("");
        setGradientHexInput("");
      };
      const applyGradientValue = (value) => {
        onUpdate({
          ...settings,
          overrideForegroundColor: value
        });
        exitGradient();
      };
      if (gradientCustomStep) {
        if (key.escape) {
          setGradientCustomStep(null);
          setGradientHexInput("");
        } else if (key.return) {
          if (gradientHexInput.length === 6) {
            if (gradientCustomStep === "start") {
              setGradientStartHex(gradientHexInput);
              setGradientHexInput("");
              setGradientCustomStep("end");
            } else {
              applyGradientValue(`gradient:${gradientStartHex}-${gradientHexInput}`);
            }
          }
        } else if (key.backspace || key.delete) {
          setGradientHexInput(gradientHexInput.slice(0, -1));
        } else if (shouldInsertInput(input, key) && gradientHexInput.length < 6) {
          const upperInput = input.toUpperCase();
          if (/^[0-9A-F]$/.test(upperInput)) {
            setGradientHexInput(gradientHexInput + upperInput);
          }
        }
        return;
      }
      const total = GRADIENT_PRESET_NAMES.length + 1;
      if (key.escape) {
        exitGradient();
      } else if (key.upArrow) {
        setGradientIndex((gradientIndex - 1 + total) % total);
      } else if (key.downArrow) {
        setGradientIndex((gradientIndex + 1) % total);
      } else if (key.return) {
        if (gradientIndex < GRADIENT_PRESET_NAMES.length) {
          applyGradientValue(`gradient:${GRADIENT_PRESET_NAMES[gradientIndex]}`);
        } else {
          setGradientStartHex("");
          setGradientHexInput("");
          setGradientCustomStep("start");
        }
      }
    } else if (numberFormatMode) {
      if (key.escape) {
        setNumberFormatMode(false);
      } else if (key.upArrow) {
        setNumberFormatKindIndex((numberFormatKindIndex - 1 + NUMBER_KINDS.length) % NUMBER_KINDS.length);
      } else if (key.downArrow) {
        setNumberFormatKindIndex((numberFormatKindIndex + 1) % NUMBER_KINDS.length);
      } else if (key.leftArrow || key.rightArrow) {
        const kind = NUMBER_KINDS[numberFormatKindIndex];
        if (kind) {
          onUpdate(cycleGlobalNumberStyle(settings, kind));
        }
      }
    } else {
      if (key.escape) {
        onBack();
      } else if (shortcut === "p" || shortcut === "P") {
        setEditingPadding(true);
      } else if ((shortcut === "s" || shortcut === "S") && !isPowerlineEnabled) {
        setEditingSeparator(true);
      } else if ((shortcut === "i" || shortcut === "I") && !isPowerlineEnabled) {
        const newInheritColors = !inheritColors;
        setInheritColors(newInheritColors);
        const updatedSettings = {
          ...settings,
          inheritSeparatorColors: newInheritColors
        };
        onUpdate(updatedSettings);
      } else if ((shortcut === "b" || shortcut === "B") && !isPowerlineEnabled) {
        const nextIndex = (currentBgIndex + 1) % bgColors.length;
        const nextBgColor = bgColors[nextIndex];
        const updatedSettings = {
          ...settings,
          overrideBackgroundColor: nextBgColor === "none" ? undefined : nextBgColor
        };
        onUpdate(updatedSettings);
      } else if ((shortcut === "c" || shortcut === "C") && !isPowerlineEnabled) {
        const updatedSettings = {
          ...settings,
          overrideBackgroundColor: undefined
        };
        onUpdate(updatedSettings);
      } else if (shortcut === "o" || shortcut === "O") {
        const newGlobalBold = !globalBold;
        setGlobalBold(newGlobalBold);
        const updatedSettings = {
          ...settings,
          globalBold: newGlobalBold
        };
        onUpdate(updatedSettings);
      } else if (shortcut === "m" || shortcut === "M") {
        const newMinimalistMode = !minimalistMode;
        setMinimalistMode(newMinimalistMode);
        const updatedSettings = {
          ...settings,
          minimalistMode: newMinimalistMode
        };
        onUpdate(updatedSettings);
      } else if (shortcut === "n" || shortcut === "N") {
        setNumberFormatMode(true);
        setNumberFormatKindIndex(0);
      } else if (shortcut === "f" || shortcut === "F") {
        const nextIndex = (currentFgIndex + 1) % fgColors.length;
        const nextFgColor = fgColors[nextIndex];
        const updatedSettings = {
          ...settings,
          overrideForegroundColor: nextFgColor === "none" ? undefined : nextFgColor
        };
        onUpdate(updatedSettings);
      } else if (shortcut === "g" || shortcut === "G") {
        setGradientMode(true);
        setGradientIndex(0);
        setGradientCustomStep(null);
        setGradientStartHex("");
        setGradientHexInput("");
      } else if (shortcut === "x" || shortcut === "X") {
        const updatedSettings = {
          ...settings,
          overrideForegroundColor: undefined
        };
        onUpdate(updatedSettings);
      } else if (shortcut === "d" || shortcut === "D") {
        const paddingSides = DefaultPaddingSideSchema.options;
        const currentIndex = paddingSides.indexOf(settings.defaultPaddingSide);
        const nextSide = paddingSides[(currentIndex + 1) % paddingSides.length] ?? "both";
        const updatedSettings = {
          ...settings,
          defaultPaddingSide: nextSide
        };
        onUpdate(updatedSettings);
      }
    }
  });
  if (numberFormatMode) {
    return /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime7.jsx(Text, {
          bold: true,
          children: "Global Number Formatting"
        }),
        /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime7.jsx(Text, {
            dimColor: true,
            children: "↑↓ to select a number type, ←→ to cycle its style, ESC to go back"
          })
        }),
        /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
          marginTop: 1,
          flexDirection: "column",
          children: NUMBER_KINDS.map((kind, idx) => {
            const style = settings.numberFormat?.[kind]?.style ?? "precise (default)";
            return /* @__PURE__ */ jsx_runtime7.jsxs(Text, {
              color: idx === numberFormatKindIndex ? "cyan" : undefined,
              children: [
                idx === numberFormatKindIndex ? "▶ " : "  ",
                kind.padStart(NUMBER_FORMAT_KIND_WIDTH),
                ": ",
                style
              ]
            }, kind);
          })
        }),
        /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
          marginTop: 1,
          flexDirection: "column",
          children: [
            /* @__PURE__ */ jsx_runtime7.jsx(Text, {
              dimColor: true,
              children: "precise = keep trailing zeros (1.0M), compact = trim them (1M / 1.1M), whole = no decimals (1M)."
            }),
            /* @__PURE__ */ jsx_runtime7.jsx(Text, {
              dimColor: true,
              children: "A global style forces that type across every widget. Decimal places are set per-widget or in settings.json."
            })
          ]
        })
      ]
    });
  }
  if (gradientMode) {
    const level = getColorLevelString(settings.colorLevel);
    if (gradientCustomStep) {
      return /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime7.jsx(Text, {
            bold: true,
            children: "Custom Gradient - Override FG Color"
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            marginTop: 1,
            flexDirection: "column",
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: gradientCustomStep === "start" ? "Enter START hex color (without #):" : "Enter END hex color (without #):"
              }),
              gradientCustomStep === "end" && /* @__PURE__ */ jsx_runtime7.jsxs(Text, {
                dimColor: true,
                children: [
                  "Start: #",
                  gradientStartHex
                ]
              }),
              /* @__PURE__ */ jsx_runtime7.jsxs(Text, {
                children: [
                  "#",
                  gradientHexInput,
                  /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    dimColor: true,
                    children: gradientHexInput.length < 6 ? "_".repeat(6 - gradientHexInput.length) : ""
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: " "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: "Press Enter when done, ESC to go back"
              })
            ]
          })
        ]
      });
    }
    return /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime7.jsx(Text, {
          bold: true,
          children: "Select Gradient - Override FG Color"
        }),
        /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime7.jsx(Text, {
            dimColor: true,
            children: "↑↓ to select, Enter to apply, ESC to cancel"
          })
        }),
        /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
          marginTop: 1,
          flexDirection: "column",
          children: [
            GRADIENT_PRESET_NAMES.map((name, idx) => /* @__PURE__ */ jsx_runtime7.jsxs(Text, {
              children: [
                idx === gradientIndex ? "▶ " : "  ",
                applyColors(name, `gradient:${name}`, undefined, idx === gradientIndex, level)
              ]
            }, name)),
            /* @__PURE__ */ jsx_runtime7.jsxs(Text, {
              children: [
                gradientIndex === GRADIENT_PRESET_NAMES.length ? "▶ " : "  ",
                "Custom (enter two hex stops)"
              ]
            }, "custom")
          ]
        })
      ]
    });
  }
  return /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime7.jsx(Text, {
        bold: true,
        children: "Global Overrides"
      }),
      /* @__PURE__ */ jsx_runtime7.jsx(Text, {
        dimColor: true,
        children: "Configure automatic padding and separators between widgets"
      }),
      isPowerlineEnabled && /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime7.jsx(Text, {
          color: "yellow",
          children: "⚠ Some options are disabled while Powerline mode is active"
        })
      }),
      /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
        marginTop: 1
      }),
      editingPadding ? /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "Enter default padding (applied per the Padding Side setting): "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                color: "cyan",
                children: paddingInput ? `"${paddingInput}"` : "(empty)"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsx(Text, {
            dimColor: true,
            children: "Press Enter to save, ESC to cancel"
          })
        ]
      }) : editingSeparator ? /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "Enter default separator (placed between widgets): "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                color: "cyan",
                children: separatorInput ? `"${separatorInput}"` : "(empty - no separator will be added)"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsx(Text, {
            dimColor: true,
            children: "Press Enter to save, ESC to cancel"
          })
        ]
      }) : confirmingSeparator ? /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
            marginBottom: 1,
            children: /* @__PURE__ */ jsx_runtime7.jsx(Text, {
              color: "yellow",
              children: "⚠ Warning: Setting a default separator will remove all existing manual separators from your status lines."
            })
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "New default separator: "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                color: "cyan",
                children: separatorInput ? `"${separatorInput}"` : "(empty)"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime7.jsx(Text, {
              children: "Do you want to continue? "
            })
          }),
          /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime7.jsx(ConfirmDialog, {
              inline: true,
              onConfirm: () => {
                const updatedSettings = {
                  ...settings,
                  defaultSeparator: separatorInput,
                  lines: settings.lines.map((line) => line.filter((item) => item.type !== "separator"))
                };
                onUpdate(updatedSettings);
                setConfirmingSeparator(false);
              },
              onCancel: () => {
                setSeparatorInput(settings.defaultSeparator ?? "");
                setConfirmingSeparator(false);
              }
            })
          })
        ]
      }) : /* @__PURE__ */ jsx_runtime7.jsxs(jsx_runtime7.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "      Global Bold: "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                color: globalBold ? "green" : "red",
                children: globalBold ? "✓ Enabled" : "✗ Disabled"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: " - Press (o) to toggle"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "  Minimalist Mode: "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                color: minimalistMode ? "green" : "red",
                children: minimalistMode ? "✓ Enabled" : "✗ Disabled"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: " - Press (m) to toggle"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "Number Formatting: "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                color: "cyan",
                children: settings.numberFormat ? "customized" : "(defaults)"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: " - Press (n) to configure per-type"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "  Default Padding: "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                color: "cyan",
                children: settings.defaultPadding ? `"${settings.defaultPadding}"` : "(none)"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: " - Press (p) to edit"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "     Padding Side: "
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                color: "cyan",
                children: settings.defaultPaddingSide === "left" ? "Left only" : settings.defaultPaddingSide === "right" ? "Right only" : "Both"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: " - Press (d) to cycle"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "Override FG Color: "
              }),
              (() => {
                const fgColor = settings.overrideForegroundColor ?? "none";
                if (fgColor === "none") {
                  return /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    color: "gray",
                    children: "(none)"
                  });
                } else if (fgColor.startsWith("gradient:")) {
                  const body = fgColor.substring(9);
                  const displayName = GRADIENT_PRESET_NAMES.includes(body.toLowerCase()) ? `Gradient: ${body.toLowerCase()}` : `Gradient: ${body}`;
                  const level = getColorLevelString(settings.colorLevel);
                  return /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    children: applyColors(displayName, fgColor, undefined, false, level)
                  });
                } else {
                  const displayName = getColorDisplayName(fgColor);
                  const fgChalk = getChalkColor(fgColor, "ansi16", false);
                  const display = fgChalk ? fgChalk(displayName) : displayName;
                  return /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    children: display
                  });
                }
              })(),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: " - (f) cycle, (g) gradient, (x) clear"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "Override BG Color: "
              }),
              isPowerlineEnabled ? /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: "[disabled - Powerline active]"
              }) : /* @__PURE__ */ jsx_runtime7.jsxs(jsx_runtime7.Fragment, {
                children: [
                  (() => {
                    const bgColor = settings.overrideBackgroundColor ?? "none";
                    if (bgColor === "none") {
                      return /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                        color: "gray",
                        children: "(none)"
                      });
                    } else {
                      const displayName = getColorDisplayName(bgColor);
                      const bgChalk = getChalkColor(bgColor, "ansi16", true);
                      const display = bgChalk ? bgChalk(` ${displayName} `) : displayName;
                      return /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                        children: display
                      });
                    }
                  })(),
                  /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    dimColor: true,
                    children: " - (b) cycle, (c) clear"
                  })
                ]
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "   Inherit Colors: "
              }),
              isPowerlineEnabled ? /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: "[disabled - Powerline active]"
              }) : /* @__PURE__ */ jsx_runtime7.jsxs(jsx_runtime7.Fragment, {
                children: [
                  /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    color: inheritColors ? "green" : "red",
                    children: inheritColors ? "✓ Enabled" : "✗ Disabled"
                  }),
                  /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    dimColor: true,
                    children: " - Press (i) to toggle"
                  })
                ]
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                children: "Default Separator: "
              }),
              isPowerlineEnabled ? /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                children: "[disabled - Powerline active]"
              }) : /* @__PURE__ */ jsx_runtime7.jsxs(jsx_runtime7.Fragment, {
                children: [
                  /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    color: "cyan",
                    children: settings.defaultSeparator ? `"${settings.defaultSeparator}"` : "(none)"
                  }),
                  /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                    dimColor: true,
                    children: " - Press (s) to edit"
                  })
                ]
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime7.jsx(Box_default, {
            marginTop: 2,
            children: /* @__PURE__ */ jsx_runtime7.jsx(Text, {
              dimColor: true,
              children: "Press ESC to go back"
            })
          }),
          /* @__PURE__ */ jsx_runtime7.jsxs(Box_default, {
            marginTop: 1,
            flexDirection: "column",
            children: [
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                wrap: "wrap",
                children: "Note: These settings are applied during rendering and don't add widgets to your widget list."
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                wrap: "wrap",
                children: "• Padding Side: Choose whether default padding applies to both sides, left only, or right only"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                wrap: "wrap",
                children: "• Inherit colors: Separators will use colors from the preceding widget"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                wrap: "wrap",
                children: "• Global Bold: Makes all text bold regardless of individual settings"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                wrap: "wrap",
                children: "• Minimalist Mode: Strips decorative prefixes and labels from widgets"
              }),
              /* @__PURE__ */ jsx_runtime7.jsx(Text, {
                dimColor: true,
                wrap: "wrap",
                children: "• Override colors: All widgets will use these colors instead of their configured colors"
              })
            ]
          })
        ]
      })
    ]
  });
};
// src/tui/components/HideStatesEditor.tsx
var import_react10 = __toESM(require_react(), 1);
var jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
var HideStatesEditor = ({ widget, states, onComplete, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = import_react10.useState(0);
  const [enabledKeys, setEnabledKeys] = import_react10.useState(() => getEnabledHideStates(widget, states));
  use_input_default((input, key) => {
    const shortcut = getPlainInput(input, key);
    if (key.return) {
      onComplete(setEnabledHideStates(widget, states, enabledKeys));
    } else if (key.escape) {
      onCancel();
    } else if (key.upArrow && states.length > 0) {
      setSelectedIndex(selectedIndex - 1 < 0 ? states.length - 1 : selectedIndex - 1);
    } else if (key.downArrow && states.length > 0) {
      setSelectedIndex(selectedIndex + 1 > states.length - 1 ? 0 : selectedIndex + 1);
    } else if (shortcut === " ") {
      const state = states[selectedIndex];
      if (state) {
        setEnabledKeys(enabledKeys.includes(state.key) ? enabledKeys.filter((enabledKey) => enabledKey !== state.key) : [...enabledKeys, state.key]);
      }
    }
  });
  return /* @__PURE__ */ jsx_runtime8.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime8.jsx(Text, {
        bold: true,
        children: "Hide"
      }),
      /* @__PURE__ */ jsx_runtime8.jsx(Text, {
        dimColor: true,
        children: "↑↓ select, Space toggle, Enter save, ESC cancel"
      }),
      /* @__PURE__ */ jsx_runtime8.jsx(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: states.map((state, index) => {
          const isSelected = index === selectedIndex;
          const isEnabled = enabledKeys.includes(state.key);
          return /* @__PURE__ */ jsx_runtime8.jsxs(Box_default, {
            flexDirection: "row",
            flexWrap: "nowrap",
            children: [
              /* @__PURE__ */ jsx_runtime8.jsx(Box_default, {
                width: 3,
                children: /* @__PURE__ */ jsx_runtime8.jsx(Text, {
                  color: isSelected ? "green" : undefined,
                  children: isSelected ? "▶ " : "  "
                })
              }),
              /* @__PURE__ */ jsx_runtime8.jsx(Text, {
                color: isSelected ? "green" : undefined,
                children: `[${isEnabled ? "x" : " "}] ${state.label}`
              }),
              state.key === MERGE_TARGET_HIDDEN_HIDEABLE_STATE.key && !widget.merge && /* @__PURE__ */ jsx_runtime8.jsx(Text, {
                dimColor: true,
                children: " (requires merge)"
              })
            ]
          }, state.key);
        })
      })
    ]
  });
};
// src/tui/components/InstallMenu.tsx
var import_react11 = __toESM(require_react(), 1);
var jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
var AUTO_UPDATE_DESCRIPTION = "Runs `@latest` through npx/bunx. Stays current automatically, with a small startup cost when the package runner checks or resolves the package. Because it follows the latest published package, pinned install is available if you prefer explicit updates.";
function getPinnedDescription(currentVersion) {
  return `Installs \`ccstatusline@${currentVersion}\` globally and Claude Code runs \`ccstatusline\`. Fast on each render because Claude Code runs the installed ccstatusline binary directly. The version changes only when you update the global install.`;
}
function getStyleItems(currentVersion) {
  return [
    {
      label: "Pinned global install",
      value: "pinned",
      description: getPinnedDescription(currentVersion)
    },
    {
      label: "Auto-update",
      value: "auto-update",
      description: AUTO_UPDATE_DESCRIPTION
    }
  ];
}
function getManagerItems(updateStyle, commandAvailability, currentVersion) {
  if (updateStyle === "auto-update") {
    return [
      {
        label: CCSTATUSLINE_COMMANDS.AUTO_NPX,
        value: "npm",
        disabled: !commandAvailability.npx,
        sublabel: commandAvailability.npx ? undefined : "(npx not installed)"
      },
      {
        label: CCSTATUSLINE_COMMANDS.AUTO_BUNX,
        value: "bun",
        disabled: !commandAvailability.bunx,
        sublabel: commandAvailability.bunx ? undefined : "(bunx not installed)"
      }
    ];
  }
  return [
    {
      label: PINNED_INSTALL_COMMANDS.NPM(currentVersion),
      value: "npm",
      disabled: !commandAvailability.npm,
      sublabel: commandAvailability.npm ? undefined : "(npm not installed)"
    },
    {
      label: PINNED_INSTALL_COMMANDS.BUN(currentVersion),
      value: "bun",
      disabled: !commandAvailability.bun,
      sublabel: commandAvailability.bun ? undefined : "(bun not installed)"
    }
  ];
}
function buildSelection(updateStyle, packageManager, currentVersion) {
  if (updateStyle === "auto-update") {
    return {
      updateStyle,
      packageManager,
      commandMode: packageManager === "bun" ? "auto-bunx" : "auto-npx",
      displayedCommand: packageManager === "bun" ? CCSTATUSLINE_COMMANDS.AUTO_BUNX : CCSTATUSLINE_COMMANDS.AUTO_NPX,
      metadata: {
        method: "auto-update",
        packageManager
      }
    };
  }
  return {
    updateStyle,
    packageManager,
    commandMode: "global",
    displayedCommand: packageManager === "bun" ? PINNED_INSTALL_COMMANDS.BUN(currentVersion) : PINNED_INSTALL_COMMANDS.NPM(currentVersion),
    globalInstallCommand: packageManager === "bun" ? PINNED_INSTALL_COMMANDS.BUN(currentVersion) : PINNED_INSTALL_COMMANDS.NPM(currentVersion),
    metadata: {
      method: "pinned",
      installedVersion: currentVersion
    }
  };
}
var InstallMenu = ({
  commandAvailability,
  currentVersion,
  existingStatusLine,
  onSelect,
  onCancel,
  initialPackageSelection = 0
}) => {
  const [step, setStep] = import_react11.useState("style");
  const [updateStyle, setUpdateStyle] = import_react11.useState("pinned");
  use_input_default((_, key) => {
    if (key.escape) {
      if (step === "manager") {
        setStep("style");
        return;
      }
      onCancel();
    }
  });
  return /* @__PURE__ */ jsx_runtime9.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime9.jsx(Text, {
        bold: true,
        children: "Install ccstatusline to Claude Code"
      }),
      existingStatusLine && /* @__PURE__ */ jsx_runtime9.jsx(Box_default, {
        marginBottom: 1,
        children: /* @__PURE__ */ jsx_runtime9.jsxs(Text, {
          color: "yellow",
          children: [
            '⚠ Current status line: "',
            existingStatusLine,
            '"'
          ]
        })
      }),
      step === "style" && /* @__PURE__ */ jsx_runtime9.jsxs(jsx_runtime9.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime9.jsx(Box_default, {
            children: /* @__PURE__ */ jsx_runtime9.jsx(Text, {
              dimColor: true,
              children: "Select update style:"
            })
          }),
          /* @__PURE__ */ jsx_runtime9.jsx(List, {
            color: "blue",
            marginTop: 1,
            items: getStyleItems(currentVersion),
            onSelect: (value) => {
              if (value === "back") {
                onCancel();
                return;
              }
              setUpdateStyle(value);
              setStep("manager");
            },
            initialSelection: 0,
            showBackButton: true
          })
        ]
      }),
      step === "manager" && /* @__PURE__ */ jsx_runtime9.jsxs(jsx_runtime9.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime9.jsx(Box_default, {
            children: /* @__PURE__ */ jsx_runtime9.jsx(Text, {
              dimColor: true,
              children: "Select package manager:"
            })
          }),
          /* @__PURE__ */ jsx_runtime9.jsx(List, {
            color: "blue",
            marginTop: 1,
            items: getManagerItems(updateStyle, commandAvailability, currentVersion),
            onSelect: (value) => {
              if (value === "back") {
                setStep("style");
                return;
              }
              onSelect(buildSelection(updateStyle, value, currentVersion));
            },
            initialSelection: initialPackageSelection,
            showBackButton: true
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime9.jsx(Box_default, {
        marginTop: 2,
        children: /* @__PURE__ */ jsx_runtime9.jsxs(Text, {
          dimColor: true,
          children: [
            "The selected command will be written to",
            " ",
            getClaudeSettingsPath()
          ]
        })
      }),
      /* @__PURE__ */ jsx_runtime9.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime9.jsx(Text, {
          dimColor: true,
          children: "Press Enter to select, ESC to go back"
        })
      })
    ]
  });
};
// src/tui/components/ItemsEditor.tsx
var import_react12 = __toESM(require_react(), 1);

// src/tui/components/LabelEditor.tsx
var jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
var LabelEditor = ({ widget, defaultLabel, onComplete, onCancel }) => {
  const { getText, display, handleInput } = useTextCursor(getLabel(widget, defaultLabel));
  use_input_default((input, key) => {
    if (key.return) {
      onComplete(setLabel(widget, getText()));
    } else if (key.escape) {
      onCancel();
    } else if (key.tab) {
      onComplete(clearLabel(widget));
    } else {
      handleInput(input, key);
    }
  });
  return /* @__PURE__ */ jsx_runtime10.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime10.jsx(Text, {
        bold: true,
        children: "Label"
      }),
      /* @__PURE__ */ jsx_runtime10.jsx(Text, {
        dimColor: true,
        children: "←→ move cursor, Ctrl+←→ jump to start/end, Tab reset to default, Enter save, ESC cancel"
      }),
      /* @__PURE__ */ jsx_runtime10.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime10.jsxs(Text, {
          children: [
            `"${display}"`,
            /* @__PURE__ */ jsx_runtime10.jsx(Text, {
              dimColor: true,
              children: ` (default: ${JSON.stringify(defaultLabel)})`
            })
          ]
        })
      })
    ]
  });
};

// src/utils/move-item.ts
function moveItem(items, fromIndex, toIndex) {
  const moved = [...items];
  const [item] = moved.splice(fromIndex, 1);
  if (item !== undefined) {
    moved.splice(toIndex, 0, item);
  }
  return moved;
}

// src/tui/components/items-editor/input-handlers.ts
function setPickerState(setWidgetPicker, normalizeState, updater) {
  setWidgetPicker((prev) => {
    if (!prev) {
      return prev;
    }
    return normalizeState(updater(prev));
  });
}
function getPickerCategories(widgetCategories) {
  return [...widgetCategories];
}
function normalizePickerState(state, widgetCatalog, widgetCategories) {
  const filteredCategories = getPickerCategories(widgetCategories);
  const selectedCategory = state.selectedCategory && filteredCategories.includes(state.selectedCategory) ? state.selectedCategory : filteredCategories[0] ?? null;
  const hasTopLevelSearch = state.level === "category" && state.categoryQuery.trim().length > 0;
  const effectiveCategory = hasTopLevelSearch ? "All" : selectedCategory ?? "All";
  const effectiveQuery = hasTopLevelSearch ? state.categoryQuery : state.widgetQuery;
  const filteredWidgets = filterWidgetCatalog(widgetCatalog, effectiveCategory, effectiveQuery);
  const hasSelectedType = state.selectedType ? filteredWidgets.some((entry) => entry.type === state.selectedType) : false;
  return {
    ...state,
    selectedCategory,
    selectedType: hasSelectedType ? state.selectedType : filteredWidgets[0]?.type ?? null
  };
}
function getPickerViewState(widgetPicker, widgetCatalog, widgetCategories) {
  const filteredCategories = getPickerCategories(widgetCategories);
  const selectedCategory = widgetPicker.selectedCategory && filteredCategories.includes(widgetPicker.selectedCategory) ? widgetPicker.selectedCategory : filteredCategories[0] ?? null;
  const hasTopLevelSearch = widgetPicker.level === "category" && widgetPicker.categoryQuery.trim().length > 0;
  const topLevelSearchEntries = hasTopLevelSearch ? filterWidgetCatalog(widgetCatalog, "All", widgetPicker.categoryQuery) : [];
  const topLevelSelectedEntry = topLevelSearchEntries.find((entry) => entry.type === widgetPicker.selectedType) ?? topLevelSearchEntries[0];
  const filteredWidgets = filterWidgetCatalog(widgetCatalog, selectedCategory ?? "All", widgetPicker.widgetQuery);
  const selectedEntry = filteredWidgets.find((entry) => entry.type === widgetPicker.selectedType) ?? filteredWidgets[0];
  return {
    filteredCategories,
    selectedCategory,
    hasTopLevelSearch,
    topLevelSearchEntries,
    topLevelSelectedEntry,
    filteredWidgets,
    selectedEntry
  };
}
function handlePickerInputMode({
  input,
  key,
  widgetPicker,
  widgetCatalog,
  widgetCategories,
  setWidgetPicker,
  applyWidgetPickerSelection
}) {
  const normalizeState = (state) => normalizePickerState(state, widgetCatalog, widgetCategories);
  const {
    filteredCategories,
    selectedCategory,
    hasTopLevelSearch,
    topLevelSearchEntries,
    topLevelSelectedEntry,
    filteredWidgets,
    selectedEntry
  } = getPickerViewState(widgetPicker, widgetCatalog, widgetCategories);
  if (widgetPicker.level === "category") {
    if (key.escape) {
      if (widgetPicker.categoryQuery.length > 0) {
        setPickerState(setWidgetPicker, normalizeState, (prev) => ({
          ...prev,
          categoryQuery: ""
        }));
      } else {
        setWidgetPicker(null);
      }
    } else if (key.return) {
      if (hasTopLevelSearch) {
        if (topLevelSelectedEntry) {
          applyWidgetPickerSelection(topLevelSelectedEntry.type);
        }
      } else if (selectedCategory) {
        setPickerState(setWidgetPicker, normalizeState, (prev) => ({
          ...prev,
          level: "widget",
          selectedCategory
        }));
      }
    } else if (key.upArrow || key.downArrow) {
      if (hasTopLevelSearch) {
        if (topLevelSearchEntries.length === 0) {
          return;
        }
        let currentIndex = topLevelSearchEntries.findIndex((entry) => entry.type === widgetPicker.selectedType);
        if (currentIndex === -1) {
          currentIndex = 0;
        }
        const nextIndex = key.downArrow ? currentIndex + 1 > topLevelSearchEntries.length - 1 ? 0 : currentIndex + 1 : currentIndex - 1 < 0 ? topLevelSearchEntries.length - 1 : currentIndex - 1;
        const nextType = topLevelSearchEntries[nextIndex]?.type ?? null;
        setPickerState(setWidgetPicker, normalizeState, (prev) => ({
          ...prev,
          selectedType: nextType
        }));
      } else {
        if (filteredCategories.length === 0) {
          return;
        }
        let currentIndex = filteredCategories.findIndex((category) => category === selectedCategory);
        if (currentIndex === -1) {
          currentIndex = 0;
        }
        const nextIndex = key.downArrow ? currentIndex + 1 > filteredCategories.length - 1 ? 0 : currentIndex + 1 : currentIndex - 1 < 0 ? filteredCategories.length - 1 : currentIndex - 1;
        const nextCategory = filteredCategories[nextIndex] ?? null;
        setPickerState(setWidgetPicker, normalizeState, (prev) => ({
          ...prev,
          selectedCategory: nextCategory
        }));
      }
    } else if (key.backspace || key.delete) {
      setPickerState(setWidgetPicker, normalizeState, (prev) => ({
        ...prev,
        categoryQuery: prev.categoryQuery.slice(0, -1),
        selectedType: null
      }));
    } else if (input && !key.ctrl && !key.meta && !key.tab) {
      setPickerState(setWidgetPicker, normalizeState, (prev) => ({
        ...prev,
        categoryQuery: prev.categoryQuery + input,
        selectedType: null
      }));
    }
  } else {
    if (key.escape) {
      if (widgetPicker.widgetQuery.length > 0) {
        setPickerState(setWidgetPicker, normalizeState, (prev) => ({
          ...prev,
          widgetQuery: ""
        }));
      } else {
        setPickerState(setWidgetPicker, normalizeState, (prev) => ({
          ...prev,
          level: "category"
        }));
      }
    } else if (key.return) {
      if (selectedEntry) {
        applyWidgetPickerSelection(selectedEntry.type);
      }
    } else if (key.upArrow || key.downArrow) {
      if (filteredWidgets.length === 0) {
        return;
      }
      let currentIndex = filteredWidgets.findIndex((entry) => entry.type === widgetPicker.selectedType);
      if (currentIndex === -1) {
        currentIndex = 0;
      }
      const nextIndex = key.downArrow ? currentIndex + 1 > filteredWidgets.length - 1 ? 0 : currentIndex + 1 : currentIndex - 1 < 0 ? filteredWidgets.length - 1 : currentIndex - 1;
      const nextType = filteredWidgets[nextIndex]?.type ?? null;
      setPickerState(setWidgetPicker, normalizeState, (prev) => ({
        ...prev,
        selectedType: nextType
      }));
    } else if (key.backspace || key.delete) {
      setPickerState(setWidgetPicker, normalizeState, (prev) => ({
        ...prev,
        widgetQuery: prev.widgetQuery.slice(0, -1),
        selectedType: null
      }));
    } else if (input && !key.ctrl && !key.meta && !key.tab) {
      setPickerState(setWidgetPicker, normalizeState, (prev) => ({
        ...prev,
        widgetQuery: prev.widgetQuery + input,
        selectedType: null
      }));
    }
  }
}
function handleMoveInputMode({
  key,
  widgets,
  selectedIndex,
  onUpdate,
  setSelectedIndex,
  setMoveMode
}) {
  if (key.upArrow && widgets.length > 1) {
    const targetIndex = selectedIndex - 1 < 0 ? widgets.length - 1 : selectedIndex - 1;
    onUpdate(moveItem(widgets, selectedIndex, targetIndex));
    setSelectedIndex(targetIndex);
  } else if (key.downArrow && widgets.length > 1) {
    const targetIndex = selectedIndex + 1 > widgets.length - 1 ? 0 : selectedIndex + 1;
    onUpdate(moveItem(widgets, selectedIndex, targetIndex));
    setSelectedIndex(targetIndex);
  } else if (key.escape || key.return) {
    setMoveMode(false);
  }
}
function handleNormalInputMode({
  input,
  key,
  widgets,
  selectedIndex,
  canExcludeAlign = false,
  separatorChars,
  onBack,
  onUpdate,
  setSelectedIndex,
  setMoveMode,
  setShowClearConfirm,
  openWidgetPicker,
  getCustomKeybindsForWidget,
  setCustomEditorWidget,
  getUniqueBackgroundColor
}) {
  const shortcut = getPlainInput(input, key);
  if (key.upArrow && widgets.length > 0) {
    setSelectedIndex(selectedIndex - 1 < 0 ? widgets.length - 1 : selectedIndex - 1);
  } else if (key.downArrow && widgets.length > 0) {
    setSelectedIndex(selectedIndex + 1 > widgets.length - 1 ? 0 : selectedIndex + 1);
  } else if (key.leftArrow && widgets.length > 0) {
    openWidgetPicker("change");
  } else if (key.rightArrow && widgets.length > 0) {
    openWidgetPicker("change");
  } else if (key.return && widgets.length > 0) {
    setMoveMode(true);
  } else if (shortcut === "a") {
    openWidgetPicker("add");
  } else if (shortcut === "i") {
    openWidgetPicker("insert");
  } else if (shortcut === "d" && widgets.length > 0) {
    const newWidgets = widgets.filter((_, i) => i !== selectedIndex);
    onUpdate(newWidgets);
    if (selectedIndex >= newWidgets.length && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  } else if (shortcut === "k" && widgets.length > 0) {
    const source = widgets[selectedIndex];
    if (!source) {
      return;
    }
    const insertIndex = selectedIndex + 1;
    const newBg = getUniqueBackgroundColor?.(insertIndex);
    const clone = {
      ...source,
      id: generateGuid(),
      ...source.metadata && { metadata: { ...source.metadata } },
      ...newBg && { backgroundColor: newBg }
    };
    const newWidgets = [
      ...widgets.slice(0, insertIndex),
      clone,
      ...widgets.slice(insertIndex)
    ];
    onUpdate(newWidgets);
    setSelectedIndex(insertIndex);
  } else if (shortcut === "c") {
    if (widgets.length > 0) {
      setShowClearConfirm(true);
    }
  } else if (shortcut === " " && widgets.length > 0) {
    const currentWidget = widgets[selectedIndex];
    if (currentWidget?.type === "separator") {
      const currentChar = currentWidget.character ?? "|";
      const currentCharIndex = separatorChars.indexOf(currentChar);
      const nextChar = separatorChars[(currentCharIndex + 1) % separatorChars.length];
      const newWidgets = [...widgets];
      newWidgets[selectedIndex] = { ...currentWidget, character: nextChar };
      onUpdate(newWidgets);
    }
  } else if (shortcut === "r" && widgets.length > 0) {
    const currentWidget = widgets[selectedIndex];
    if (currentWidget && currentWidget.type !== "separator" && currentWidget.type !== "flex-separator") {
      const widgetImpl = getWidget(currentWidget.type);
      if (!widgetImpl?.supportsRawValue()) {
        return;
      }
      const newWidgets = [...widgets];
      newWidgets[selectedIndex] = { ...currentWidget, rawValue: !currentWidget.rawValue };
      onUpdate(newWidgets);
    }
  } else if (shortcut === "m" && widgets.length > 0) {
    const currentWidget = widgets[selectedIndex];
    const isLastWidget = selectedIndex === widgets.length - 1;
    if (currentWidget && (!isLastWidget || currentWidget.merge) && currentWidget.type !== "separator" && currentWidget.type !== "flex-separator") {
      const newWidgets = [...widgets];
      let nextMergeState;
      if (currentWidget.merge === undefined) {
        nextMergeState = true;
      } else if (currentWidget.merge === true && !isLastWidget) {
        nextMergeState = "no-padding";
      } else {
        nextMergeState = undefined;
      }
      if (nextMergeState === undefined) {
        const { merge, ...rest } = currentWidget;
        newWidgets[selectedIndex] = rest;
      } else {
        newWidgets[selectedIndex] = { ...currentWidget, merge: nextMergeState };
      }
      onUpdate(newWidgets);
    }
  } else if (shortcut === "x" && widgets.length > 0) {
    const currentWidget = widgets[selectedIndex];
    if (canExcludeAlign && currentWidget && currentWidget.type !== "separator" && currentWidget.type !== "flex-separator") {
      const newWidgets = [...widgets];
      if (currentWidget.excludeFromAutoAlign) {
        const { excludeFromAutoAlign, ...rest } = currentWidget;
        newWidgets[selectedIndex] = rest;
      } else {
        newWidgets[selectedIndex] = { ...currentWidget, excludeFromAutoAlign: true };
      }
      onUpdate(newWidgets);
    }
  } else if (key.escape) {
    onBack();
  } else if (widgets.length > 0) {
    const currentWidget = widgets[selectedIndex];
    if (currentWidget && currentWidget.type !== "separator" && currentWidget.type !== "flex-separator") {
      const widgetImpl = getWidget(currentWidget.type);
      if (!widgetImpl) {
        return;
      }
      const customKeybinds = getCustomKeybindsForWidget(widgetImpl, currentWidget);
      const matchedKeybind = customKeybinds.find((kb) => kb.key === shortcut);
      if (matchedKeybind) {
        if (matchedKeybind.action === EDIT_HIDE_STATES_ACTION || matchedKeybind.action === EDIT_LABEL_ACTION) {
          setCustomEditorWidget({ widget: currentWidget, impl: widgetImpl, action: matchedKeybind.action });
          return;
        }
        if (matchedKeybind.action === CYCLE_NUMBER_STYLE_ACTION) {
          const newWidgets = [...widgets];
          newWidgets[selectedIndex] = cycleNumberStyle(currentWidget);
          onUpdate(newWidgets);
        } else if (widgetImpl.handleEditorAction) {
          const updatedWidget = widgetImpl.handleEditorAction(matchedKeybind.action, currentWidget);
          if (updatedWidget) {
            const newWidgets = [...widgets];
            newWidgets[selectedIndex] = updatedWidget;
            onUpdate(newWidgets);
          } else if (widgetImpl.renderEditor) {
            setCustomEditorWidget({ widget: currentWidget, impl: widgetImpl, action: matchedKeybind.action });
          }
        } else if (widgetImpl.renderEditor) {
          setCustomEditorWidget({ widget: currentWidget, impl: widgetImpl, action: matchedKeybind.action });
        }
      }
    }
  }
}

// src/tui/components/ItemsEditor.tsx
var jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
function isMergedIntoPreviousWidget(widgets, index) {
  if (index <= 0) {
    return false;
  }
  return Boolean(widgets[index - 1]?.merge);
}
var ItemsEditor = ({ widgets, onUpdate, onBack, lineNumber, settings }) => {
  const [selectedIndex, setSelectedIndex] = import_react12.useState(0);
  const [moveMode, setMoveMode] = import_react12.useState(false);
  const [customEditorWidget, setCustomEditorWidget] = import_react12.useState(null);
  const [widgetPicker, setWidgetPicker] = import_react12.useState(null);
  const [showClearConfirm, setShowClearConfirm] = import_react12.useState(false);
  const separatorChars = ["|", "-", ",", " "];
  const widgetCatalog = getWidgetCatalog(settings);
  const widgetCategories = ["All", ...getWidgetCatalogCategories(widgetCatalog)];
  const getUniqueBackgroundColor = (insertIndex) => {
    if (!settings.powerline.enabled || settings.powerline.theme === "custom") {
      return;
    }
    const bgColors = getBackgroundColorsForPowerline();
    const prevWidget = insertIndex > 0 ? widgets[insertIndex - 1] : null;
    const nextWidget = insertIndex < widgets.length ? widgets[insertIndex] : null;
    const prevBg = prevWidget?.backgroundColor;
    const nextBg = nextWidget?.backgroundColor;
    const availableColors = bgColors.filter((color) => color !== prevBg && color !== nextBg);
    if (availableColors.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      return availableColors[randomIndex];
    }
    return bgColors.find((c) => c !== prevBg) ?? bgColors[0];
  };
  const handleEditorComplete = (updatedWidget) => {
    const newWidgets = [...widgets];
    newWidgets[selectedIndex] = updatedWidget;
    onUpdate(newWidgets);
    setCustomEditorWidget(null);
  };
  const handleEditorCancel = () => {
    setCustomEditorWidget(null);
  };
  const getCustomKeybindsForWidget = (widgetImpl, widget) => {
    const keybinds = widgetImpl.getCustomKeybinds ? [...widgetImpl.getCustomKeybinds(widget)] : [];
    if (widgetImpl.supportsNumberFormat?.()) {
      keybinds.push(getNumberFormatKeybind());
    }
    if ((widgetImpl.getHideableStates?.().length ?? 0) > 0) {
      keybinds.push(getHideKeybind());
    }
    if (widgetImpl.getLabelPrefix && !widget.rawValue) {
      keybinds.push(getLabelKeybind());
    }
    return keybinds;
  };
  const openWidgetPicker = (action) => {
    if (widgetCatalog.length === 0) {
      return;
    }
    const currentType = widgets[selectedIndex]?.type;
    const selectedType = action === "change" ? currentType ?? null : null;
    setWidgetPicker(normalizePickerState({
      action,
      level: "category",
      selectedCategory: "All",
      categoryQuery: "",
      widgetQuery: "",
      selectedType
    }, widgetCatalog, widgetCategories));
  };
  const applyWidgetPickerSelection = (selectedType) => {
    if (!widgetPicker) {
      return;
    }
    if (widgetPicker.action === "change") {
      const currentWidget = widgets[selectedIndex];
      if (currentWidget) {
        const newWidgets = [...widgets];
        newWidgets[selectedIndex] = currentWidget.type === selectedType ? currentWidget : { ...clearLabel(currentWidget), type: selectedType };
        onUpdate(newWidgets);
      }
    } else {
      const insertIndex = widgetPicker.action === "add" ? widgets.length > 0 ? selectedIndex + 1 : 0 : selectedIndex;
      const backgroundColor = getUniqueBackgroundColor(insertIndex);
      const newWidget = {
        id: generateGuid(),
        type: selectedType,
        ...backgroundColor && { backgroundColor }
      };
      const newWidgets = [...widgets];
      newWidgets.splice(insertIndex, 0, newWidget);
      onUpdate(newWidgets);
      setSelectedIndex(insertIndex);
    }
    setWidgetPicker(null);
  };
  const currentWidget = widgets[selectedIndex];
  const isSeparator = currentWidget?.type === "separator";
  const isFlexSeparator = currentWidget?.type === "flex-separator";
  let canToggleRaw = false;
  let customKeybinds = [];
  if (currentWidget && !isSeparator && !isFlexSeparator) {
    const widgetImpl = getWidget(currentWidget.type);
    if (widgetImpl) {
      canToggleRaw = widgetImpl.supportsRawValue();
      customKeybinds = getCustomKeybindsForWidget(widgetImpl, currentWidget);
    } else {
      canToggleRaw = false;
    }
  }
  const canMerge = currentWidget && (selectedIndex < widgets.length - 1 || Boolean(currentWidget.merge)) && !isSeparator && !isFlexSeparator;
  const canExcludeAlign = Boolean(currentWidget) && !isSeparator && !isFlexSeparator && settings.powerline.enabled && settings.powerline.autoAlign && !isMergedIntoPreviousWidget(widgets, selectedIndex);
  const hasWidgets = widgets.length > 0;
  use_input_default((input, key) => {
    if (customEditorWidget) {
      return;
    }
    if (showClearConfirm) {
      return;
    }
    if (widgetPicker) {
      handlePickerInputMode({
        input,
        key,
        widgetPicker,
        widgetCatalog,
        widgetCategories,
        setWidgetPicker,
        applyWidgetPickerSelection
      });
      return;
    }
    if (moveMode) {
      handleMoveInputMode({
        key,
        widgets,
        selectedIndex,
        onUpdate,
        setSelectedIndex,
        setMoveMode
      });
      return;
    }
    handleNormalInputMode({
      input,
      key,
      widgets,
      selectedIndex,
      canExcludeAlign,
      separatorChars,
      onBack,
      onUpdate,
      setSelectedIndex,
      setMoveMode,
      setShowClearConfirm,
      openWidgetPicker,
      getCustomKeybindsForWidget,
      setCustomEditorWidget,
      getUniqueBackgroundColor
    });
  });
  const getWidgetDisplay = (widget) => {
    if (widget.type === "separator") {
      const char = widget.character ?? "|";
      const charDisplay = char === " " ? "(space)" : char;
      return `Separator ${charDisplay}`;
    }
    if (widget.type === "flex-separator") {
      return "Flex Separator";
    }
    const widgetImpl = getWidget(widget.type);
    if (widgetImpl) {
      const { displayText, modifierText } = widgetImpl.getEditorDisplay(widget);
      return displayText + (modifierText ? ` ${modifierText}` : "");
    }
    return `Unknown: ${widget.type}`;
  };
  const hasFlexSeparator = widgets.some((widget) => widget.type === "flex-separator");
  const widthDetectionAvailable = canDetectTerminalWidth();
  const pickerCategories = widgetPicker ? [...widgetCategories] : [];
  const selectedPickerCategory = widgetPicker ? widgetPicker.selectedCategory && pickerCategories.includes(widgetPicker.selectedCategory) ? widgetPicker.selectedCategory : pickerCategories[0] ?? null : null;
  const topLevelSearchEntries = widgetPicker?.level === "category" && widgetPicker.categoryQuery.trim().length > 0 ? filterWidgetCatalog(widgetCatalog, "All", widgetPicker.categoryQuery) : [];
  const selectedTopLevelSearchEntry = widgetPicker ? topLevelSearchEntries.find((entry) => entry.type === widgetPicker.selectedType) ?? topLevelSearchEntries[0] : null;
  const pickerEntries = widgetPicker ? filterWidgetCatalog(widgetCatalog, selectedPickerCategory ?? "All", widgetPicker.widgetQuery) : [];
  const selectedPickerEntry = widgetPicker ? pickerEntries.find((entry) => entry.type === widgetPicker.selectedType) ?? pickerEntries[0] : null;
  let helpText = hasWidgets ? "↑↓ select, ←→ open type picker" : "(a)dd via picker, (i)nsert via picker";
  if (isSeparator) {
    helpText += ", Space edit separator";
  }
  if (hasWidgets) {
    helpText += ", Enter to move, (a)dd via picker, (i)nsert via picker, (k) clone, (d)elete, (c)lear line";
  }
  if (canToggleRaw) {
    helpText += ", (r)aw value";
  }
  if (canMerge) {
    helpText += ", (m)erge";
  }
  if (canExcludeAlign) {
    helpText += ", e(x)clude align";
  }
  helpText += ", ESC back";
  const customKeybindsText = customKeybinds.map((kb) => kb.label).join(", ");
  const pickerActionLabel = widgetPicker?.action === "add" ? "Add Widget" : widgetPicker?.action === "insert" ? "Insert Widget" : "Change Widget Type";
  if (customEditorWidget?.action === EDIT_HIDE_STATES_ACTION) {
    return /* @__PURE__ */ jsx_runtime11.jsx(HideStatesEditor, {
      widget: customEditorWidget.widget,
      states: customEditorWidget.impl.getHideableStates?.() ?? [],
      onComplete: handleEditorComplete,
      onCancel: handleEditorCancel
    });
  }
  if (customEditorWidget?.action === EDIT_LABEL_ACTION && customEditorWidget.impl.getLabelPrefix) {
    return /* @__PURE__ */ jsx_runtime11.jsx(LabelEditor, {
      widget: customEditorWidget.widget,
      defaultLabel: customEditorWidget.impl.getLabelPrefix(customEditorWidget.widget),
      onComplete: handleEditorComplete,
      onCancel: handleEditorCancel
    });
  }
  if (customEditorWidget?.impl.renderEditor) {
    return customEditorWidget.impl.renderEditor({
      widget: customEditorWidget.widget,
      onComplete: handleEditorComplete,
      onCancel: handleEditorCancel,
      action: customEditorWidget.action
    });
  }
  if (showClearConfirm) {
    return /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime11.jsx(Text, {
          bold: true,
          color: "yellow",
          children: "⚠ Confirm Clear Line"
        }),
        /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
          marginTop: 1,
          flexDirection: "column",
          children: [
            /* @__PURE__ */ jsx_runtime11.jsxs(Text, {
              children: [
                "This will remove all widgets from Line",
                " ",
                lineNumber,
                "."
              ]
            }),
            /* @__PURE__ */ jsx_runtime11.jsx(Text, {
              color: "red",
              children: "This action cannot be undone!"
            })
          ]
        }),
        /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
          marginTop: 2,
          children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
            children: "Continue?"
          })
        }),
        /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime11.jsx(ConfirmDialog, {
            inline: true,
            onConfirm: () => {
              onUpdate([]);
              setSelectedIndex(0);
              setShowClearConfirm(false);
            },
            onCancel: () => {
              setShowClearConfirm(false);
            }
          })
        })
      ]
    });
  }
  return /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
        children: [
          /* @__PURE__ */ jsx_runtime11.jsxs(Text, {
            bold: true,
            children: [
              "Edit Line",
              " ",
              lineNumber,
              " "
            ]
          }),
          moveMode && /* @__PURE__ */ jsx_runtime11.jsx(Text, {
            color: "blue",
            children: "[MOVE MODE]"
          }),
          widgetPicker && /* @__PURE__ */ jsx_runtime11.jsx(Text, {
            color: "cyan",
            children: `[${pickerActionLabel.toUpperCase()}]`
          }),
          (settings.powerline.enabled || Boolean(settings.defaultSeparator)) && /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
            marginLeft: 2,
            children: /* @__PURE__ */ jsx_runtime11.jsxs(Text, {
              color: "yellow",
              children: [
                "⚠",
                " ",
                settings.powerline.enabled ? "Powerline mode active: manual separators disabled" : "Default separator active: manual separators disabled"
              ]
            })
          })
        ]
      }),
      moveMode ? /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
        flexDirection: "column",
        marginBottom: 1,
        children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
          dimColor: true,
          children: "↑↓ to move widget, ESC or Enter to exit move mode"
        })
      }) : widgetPicker ? /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
        flexDirection: "column",
        children: widgetPicker.level === "category" ? /* @__PURE__ */ jsx_runtime11.jsxs(jsx_runtime11.Fragment, {
          children: [
            widgetPicker.categoryQuery.trim().length > 0 ? /* @__PURE__ */ jsx_runtime11.jsx(Text, {
              dimColor: true,
              children: "↑↓ select widget match, Enter apply, ESC clear/cancel"
            }) : /* @__PURE__ */ jsx_runtime11.jsx(Text, {
              dimColor: true,
              children: "↑↓ select category, type to search all widgets, Enter continue, ESC cancel"
            }),
            /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
              children: [
                /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                  dimColor: true,
                  children: "Search: "
                }),
                /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                  color: "cyan",
                  children: widgetPicker.categoryQuery || "(none)"
                })
              ]
            })
          ]
        }) : /* @__PURE__ */ jsx_runtime11.jsxs(jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime11.jsx(Text, {
              dimColor: true,
              children: "↑↓ select widget, type to search widgets, Enter apply, ESC back"
            }),
            /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
              children: [
                /* @__PURE__ */ jsx_runtime11.jsxs(Text, {
                  dimColor: true,
                  children: [
                    "Category:",
                    " ",
                    selectedPickerCategory ?? "(none)",
                    " ",
                    "| Search:",
                    " "
                  ]
                }),
                /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                  color: "cyan",
                  children: widgetPicker.widgetQuery || "(none)"
                })
              ]
            })
          ]
        })
      }) : /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime11.jsx(Text, {
            dimColor: true,
            children: helpText
          }),
          /* @__PURE__ */ jsx_runtime11.jsx(Text, {
            dimColor: true,
            children: customKeybindsText || " "
          })
        ]
      }),
      hasFlexSeparator && !widthDetectionAvailable && /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_runtime11.jsx(Text, {
            color: "yellow",
            children: "⚠ Note: Terminal width detection is currently unavailable in your environment."
          }),
          /* @__PURE__ */ jsx_runtime11.jsx(Text, {
            dimColor: true,
            children: "  Flex separators will act as normal separators until width detection is available."
          })
        ]
      }),
      widgetPicker && /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: widgetPicker.level === "category" ? widgetPicker.categoryQuery.trim().length > 0 ? topLevelSearchEntries.length === 0 ? /* @__PURE__ */ jsx_runtime11.jsx(Text, {
          dimColor: true,
          children: "No widgets match the search."
        }) : /* @__PURE__ */ jsx_runtime11.jsxs(jsx_runtime11.Fragment, {
          children: [
            topLevelSearchEntries.map((entry, index) => {
              const isSelected = entry.type === selectedTopLevelSearchEntry?.type;
              const segments = getMatchSegments(entry.displayName, widgetPicker.categoryQuery);
              return /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
                flexDirection: "row",
                flexWrap: "nowrap",
                children: [
                  /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
                    width: 3,
                    children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                      color: isSelected ? "green" : undefined,
                      children: isSelected ? "▶ " : "  "
                    })
                  }),
                  /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    color: isSelected ? "green" : undefined,
                    children: `${index + 1}. `
                  }),
                  segments.map((seg, i) => /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    color: isSelected ? "green" : seg.matched ? "yellowBright" : undefined,
                    bold: isSelected ? true : seg.matched,
                    children: seg.text
                  }, i))
                ]
              }, entry.type);
            }),
            selectedTopLevelSearchEntry && /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
              marginTop: 1,
              paddingLeft: 2,
              children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                dimColor: true,
                children: selectedTopLevelSearchEntry.description
              })
            })
          ]
        }) : pickerCategories.length === 0 ? /* @__PURE__ */ jsx_runtime11.jsx(Text, {
          dimColor: true,
          children: "No categories available."
        }) : /* @__PURE__ */ jsx_runtime11.jsxs(jsx_runtime11.Fragment, {
          children: [
            pickerCategories.map((category, index) => {
              const isSelected = category === selectedPickerCategory;
              return /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
                flexDirection: "row",
                flexWrap: "nowrap",
                children: [
                  /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
                    width: 3,
                    children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                      color: isSelected ? "green" : undefined,
                      children: isSelected ? "▶ " : "  "
                    })
                  }),
                  /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    color: isSelected ? "green" : undefined,
                    children: `${index + 1}. ${category}`
                  })
                ]
              }, category);
            }),
            selectedPickerCategory === "All" && /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
              marginTop: 1,
              paddingLeft: 2,
              children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                dimColor: true,
                children: "Search across all widget categories."
              })
            })
          ]
        }) : pickerEntries.length === 0 ? /* @__PURE__ */ jsx_runtime11.jsx(Text, {
          dimColor: true,
          children: "No widgets match the current category/search."
        }) : /* @__PURE__ */ jsx_runtime11.jsxs(jsx_runtime11.Fragment, {
          children: [
            pickerEntries.map((entry, index) => {
              const isSelected = entry.type === selectedPickerEntry?.type;
              const segments = getMatchSegments(entry.displayName, widgetPicker.widgetQuery);
              return /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
                flexDirection: "row",
                flexWrap: "nowrap",
                children: [
                  /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
                    width: 3,
                    children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                      color: isSelected ? "green" : undefined,
                      children: isSelected ? "▶ " : "  "
                    })
                  }),
                  /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    color: isSelected ? "green" : undefined,
                    children: `${index + 1}. `
                  }),
                  segments.map((seg, i) => /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    color: isSelected ? "green" : seg.matched ? "yellowBright" : undefined,
                    bold: seg.matched,
                    children: seg.text
                  }, i))
                ]
              }, entry.type);
            }),
            selectedPickerEntry && /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
              marginTop: 1,
              paddingLeft: 2,
              children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                dimColor: true,
                children: selectedPickerEntry.description
              })
            })
          ]
        })
      }),
      !widgetPicker && /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: widgets.length === 0 ? /* @__PURE__ */ jsx_runtime11.jsx(Text, {
          dimColor: true,
          children: "No widgets. Press 'a' to add one."
        }) : /* @__PURE__ */ jsx_runtime11.jsxs(jsx_runtime11.Fragment, {
          children: [
            widgets.map((widget, index) => {
              const isSelected = index === selectedIndex;
              const widgetImpl = widget.type !== "separator" && widget.type !== "flex-separator" ? getWidget(widget.type) : null;
              const { displayText, modifierText } = widgetImpl?.getEditorDisplay(widget) ?? { displayText: getWidgetDisplay(widget) };
              const supportsRawValue = widgetImpl?.supportsRawValue() ?? false;
              const numberFormatModifierText = widgetImpl?.supportsNumberFormat?.() ? getNumberFormatModifierText(widget) : undefined;
              const hideModifierText = widgetImpl ? getHideModifierText(widget, widgetImpl.getHideableStates?.() ?? []) : undefined;
              const labelModifierText = widgetImpl?.getLabelPrefix && !widget.rawValue ? getLabelModifierText(widget) : undefined;
              return /* @__PURE__ */ jsx_runtime11.jsxs(Box_default, {
                flexDirection: "row",
                flexWrap: "nowrap",
                children: [
                  /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
                    width: 3,
                    children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                      color: isSelected ? moveMode ? "blue" : "green" : undefined,
                      children: isSelected ? moveMode ? "◆ " : "▶ " : "  "
                    })
                  }),
                  /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    color: isSelected ? moveMode ? "blue" : "green" : undefined,
                    children: `${index + 1}. ${displayText || getWidgetDisplay(widget)}`
                  }),
                  modifierText && /* @__PURE__ */ jsx_runtime11.jsxs(Text, {
                    dimColor: true,
                    children: [
                      " ",
                      modifierText
                    ]
                  }),
                  numberFormatModifierText && /* @__PURE__ */ jsx_runtime11.jsxs(Text, {
                    dimColor: true,
                    children: [
                      " ",
                      numberFormatModifierText
                    ]
                  }),
                  hideModifierText && /* @__PURE__ */ jsx_runtime11.jsxs(Text, {
                    dimColor: true,
                    children: [
                      " ",
                      hideModifierText
                    ]
                  }),
                  labelModifierText && /* @__PURE__ */ jsx_runtime11.jsxs(Text, {
                    dimColor: true,
                    children: [
                      " ",
                      labelModifierText
                    ]
                  }),
                  supportsRawValue && widget.rawValue && /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    dimColor: true,
                    children: " (raw value)"
                  }),
                  widget.merge === true && /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    dimColor: true,
                    children: " (merged→)"
                  }),
                  widget.merge === "no-padding" && /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    dimColor: true,
                    children: " (merged-no-pad→)"
                  }),
                  widget.excludeFromAutoAlign && settings.powerline.enabled && settings.powerline.autoAlign && !isMergedIntoPreviousWidget(widgets, index) && /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                    dimColor: true,
                    children: " (no-align)"
                  })
                ]
              }, widget.id);
            }),
            currentWidget && /* @__PURE__ */ jsx_runtime11.jsx(Box_default, {
              marginTop: 1,
              paddingLeft: 2,
              children: /* @__PURE__ */ jsx_runtime11.jsx(Text, {
                dimColor: true,
                children: (() => {
                  if (currentWidget.type === "separator") {
                    return "A separator character between status line widgets";
                  } else if (currentWidget.type === "flex-separator") {
                    return "Expands to fill available terminal width";
                  } else {
                    const widgetImpl = getWidget(currentWidget.type);
                    return widgetImpl ? widgetImpl.getDescription() : "Unknown widget type";
                  }
                })()
              })
            })
          ]
        })
      })
    ]
  });
};
// src/tui/components/LineSelector.tsx
var import_pluralize = __toESM(require_pluralize(), 1);
var import_react13 = __toESM(require_react(), 1);
var jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
var LineSelector = ({
  lines,
  onSelect,
  onBack,
  onLinesUpdate,
  initialSelection = 0,
  title,
  blockIfPowerlineActive = false,
  settings,
  allowEditing = false
}) => {
  const [selectedIndex, setSelectedIndex] = import_react13.useState(initialSelection);
  const [showDeleteDialog, setShowDeleteDialog] = import_react13.useState(false);
  const [moveMode, setMoveMode] = import_react13.useState(false);
  const [localLines, setLocalLines] = import_react13.useState(lines);
  import_react13.useEffect(() => {
    setLocalLines(lines);
  }, [lines]);
  import_react13.useEffect(() => {
    setSelectedIndex(initialSelection);
  }, [initialSelection]);
  const selectedLine = import_react13.useMemo(() => localLines[selectedIndex], [localLines, selectedIndex]);
  const appendLine = () => {
    const newLines = [...localLines, []];
    setLocalLines(newLines);
    onLinesUpdate(newLines);
    setSelectedIndex(newLines.length - 1);
  };
  const deleteLine = (lineIndex) => {
    if (localLines.length <= 1) {
      return;
    }
    const newLines = [...localLines];
    newLines.splice(lineIndex, 1);
    setLocalLines(newLines);
    onLinesUpdate(newLines);
  };
  const powerlineEnabled = settings ? settings.powerline.enabled : false;
  const powerlineTheme = settings ? settings.powerline.theme : undefined;
  const isThemeManaged = blockIfPowerlineActive && powerlineEnabled && powerlineTheme && powerlineTheme !== "custom";
  use_input_default((input, key) => {
    const shortcut = getPlainInput(input, key);
    if (showDeleteDialog) {
      return;
    }
    if (isThemeManaged) {
      onBack();
      return;
    }
    if (moveMode) {
      if (key.upArrow && localLines.length > 1) {
        const targetIndex = selectedIndex - 1 < 0 ? localLines.length - 1 : selectedIndex - 1;
        const newLines = moveItem(localLines, selectedIndex, targetIndex);
        setLocalLines(newLines);
        onLinesUpdate(newLines);
        setSelectedIndex(targetIndex);
      } else if (key.downArrow && localLines.length > 1) {
        const targetIndex = selectedIndex + 1 > localLines.length - 1 ? 0 : selectedIndex + 1;
        const newLines = moveItem(localLines, selectedIndex, targetIndex);
        setLocalLines(newLines);
        onLinesUpdate(newLines);
        setSelectedIndex(targetIndex);
      } else if (key.escape || key.return) {
        setMoveMode(false);
      }
      return;
    }
    switch (shortcut) {
      case "a":
        if (allowEditing) {
          appendLine();
        }
        return;
      case "d":
        if (allowEditing && localLines.length > 1 && selectedIndex < localLines.length) {
          setShowDeleteDialog(true);
        }
        return;
      case "m":
        if (allowEditing && localLines.length > 1 && selectedIndex < localLines.length) {
          setMoveMode(true);
        }
        return;
    }
    if (key.escape) {
      onBack();
    }
  });
  if (isThemeManaged) {
    return /* @__PURE__ */ jsx_runtime12.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime12.jsx(Text, {
          bold: true,
          children: title ?? "Select Line"
        }),
        /* @__PURE__ */ jsx_runtime12.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
            color: "yellow",
            children: [
              "⚠ Colors are currently managed by the Powerline theme:",
              " " + powerlineTheme.charAt(0).toUpperCase() + powerlineTheme.slice(1)
            ]
          })
        }),
        /* @__PURE__ */ jsx_runtime12.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime12.jsx(Text, {
            dimColor: true,
            children: "To customize colors, either:"
          })
        }),
        /* @__PURE__ */ jsx_runtime12.jsx(Box_default, {
          marginLeft: 2,
          children: /* @__PURE__ */ jsx_runtime12.jsx(Text, {
            dimColor: true,
            children: "• Change to 'Custom' theme in Powerline Configuration → Themes"
          })
        }),
        /* @__PURE__ */ jsx_runtime12.jsx(Box_default, {
          marginLeft: 2,
          children: /* @__PURE__ */ jsx_runtime12.jsx(Text, {
            dimColor: true,
            children: "• Disable Powerline mode in Powerline Configuration"
          })
        }),
        /* @__PURE__ */ jsx_runtime12.jsx(Box_default, {
          marginTop: 2,
          children: /* @__PURE__ */ jsx_runtime12.jsx(Text, {
            children: "Press any key to go back..."
          })
        })
      ]
    });
  }
  if (showDeleteDialog && selectedLine) {
    const suffix = selectedLine.length > 0 ? import_pluralize.default("widget", selectedLine.length, true) : "empty";
    return /* @__PURE__ */ jsx_runtime12.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime12.jsxs(Box_default, {
          flexDirection: "column",
          gap: 1,
          children: [
            /* @__PURE__ */ jsx_runtime12.jsx(Text, {
              bold: true,
              children: /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
                children: [
                  /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
                    children: [
                      "☰ Line",
                      selectedIndex + 1
                    ]
                  }),
                  " ",
                  /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
                    dimColor: true,
                    children: [
                      "(",
                      suffix,
                      ")"
                    ]
                  })
                ]
              })
            }),
            /* @__PURE__ */ jsx_runtime12.jsx(Text, {
              bold: true,
              children: "Are you sure you want to delete line?"
            })
          ]
        }),
        /* @__PURE__ */ jsx_runtime12.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime12.jsx(ConfirmDialog, {
            inline: true,
            onConfirm: () => {
              deleteLine(selectedIndex);
              setSelectedIndex(Math.max(0, selectedIndex - 1));
              setShowDeleteDialog(false);
            },
            onCancel: () => {
              setShowDeleteDialog(false);
            }
          })
        })
      ]
    });
  }
  const lineItems = localLines.map((line, index) => ({
    label: `☰ Line ${index + 1}`,
    sublabel: `(${line.length > 0 ? import_pluralize.default("widget", line.length, true) : "empty"})`,
    value: index
  }));
  return /* @__PURE__ */ jsx_runtime12.jsx(jsx_runtime12.Fragment, {
    children: /* @__PURE__ */ jsx_runtime12.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime12.jsxs(Box_default, {
          children: [
            /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
              bold: true,
              children: [
                title ?? "Select Line to Edit",
                " "
              ]
            }),
            moveMode && /* @__PURE__ */ jsx_runtime12.jsx(Text, {
              color: "blue",
              children: "[MOVE MODE]"
            })
          ]
        }),
        /* @__PURE__ */ jsx_runtime12.jsx(Text, {
          dimColor: true,
          children: "Choose which status line to configure"
        }),
        moveMode ? /* @__PURE__ */ jsx_runtime12.jsx(Text, {
          dimColor: true,
          children: "↑↓ to move line, ESC or Enter to exit move mode"
        }) : /* @__PURE__ */ jsx_runtime12.jsx(Text, {
          dimColor: true,
          children: allowEditing ? localLines.length > 1 ? "(a) to append new line, (d) to delete line, (m) to move line, ESC to go back" : "(a) to append new line, ESC to go back" : "ESC to go back"
        }),
        moveMode ? /* @__PURE__ */ jsx_runtime12.jsx(Box_default, {
          marginTop: 1,
          flexDirection: "column",
          children: localLines.map((line, index) => {
            const isSelected = selectedIndex === index;
            const suffix = line.length ? import_pluralize.default("widget", line.length, true) : "empty";
            return /* @__PURE__ */ jsx_runtime12.jsx(Box_default, {
              children: /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
                color: isSelected ? "blue" : undefined,
                children: [
                  /* @__PURE__ */ jsx_runtime12.jsx(Text, {
                    children: isSelected ? "◆  " : "   "
                  }),
                  /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
                    children: [
                      /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
                        children: [
                          "☰ Line",
                          " ",
                          index + 1
                        ]
                      }),
                      " ",
                      /* @__PURE__ */ jsx_runtime12.jsxs(Text, {
                        dimColor: !isSelected,
                        children: [
                          "(",
                          suffix,
                          ")"
                        ]
                      })
                    ]
                  })
                ]
              })
            }, index);
          })
        }) : /* @__PURE__ */ jsx_runtime12.jsx(List, {
          marginTop: 1,
          items: lineItems,
          onSelect: (line) => {
            if (line === "back") {
              onBack();
              return;
            }
            onSelect(line);
          },
          onSelectionChange: (_, index) => {
            setSelectedIndex(index);
          },
          initialSelection: selectedIndex,
          showBackButton: true
        })
      ]
    })
  });
};
// src/tui/components/MainMenu.tsx
var jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function usesManageInstallation(installation) {
  return installation?.method === "pinned" || installation?.method === "self-managed";
}
function getInstallationMenuItem(isClaudeInstalled, installation) {
  if (!isClaudeInstalled) {
    return {
      label: "\uD83D\uDCE6 Install to Claude Code",
      value: "install",
      description: "Add ccstatusline to your Claude Code settings for automatic status line rendering"
    };
  }
  if (usesManageInstallation(installation)) {
    return {
      label: "\uD83E\uDDF0 Manage Installation",
      value: "manageInstallation",
      description: "Check pinned global package updates or uninstall ccstatusline"
    };
  }
  return {
    label: "\uD83D\uDD0C Uninstall from Claude Code",
    value: "install",
    description: "Remove ccstatusline from your Claude Code settings"
  };
}
function buildMainMenuItems(isClaudeInstalled, hasChanges, installation) {
  const menuItems = [
    {
      label: "\uD83D\uDCDD Edit Lines",
      value: "lines",
      description: "Configure any number of status lines with various widgets like model info, git status, and token usage"
    },
    {
      label: "\uD83C\uDFA8 Edit Colors",
      value: "colors",
      description: "Customize colors for each widget including foreground, background, and bold styling"
    },
    {
      label: "⚡ Powerline Setup",
      value: "powerline",
      description: "Install Powerline fonts for enhanced visual separators and symbols in your status line"
    },
    "-",
    {
      label: "\uD83D\uDCBB Terminal Options",
      value: "terminalConfig",
      description: "Configure terminal-specific settings for optimal display"
    },
    {
      label: "\uD83C\uDF10 Global Overrides",
      value: "globalOverrides",
      description: "Set global padding, separators, and color overrides that apply to all widgets"
    },
    {
      label: "\uD83D\uDD27 Configure Status Line",
      sublabel: isClaudeInstalled ? undefined : "(install first)",
      disabled: !isClaudeInstalled,
      value: "configureStatusLine",
      description: "Configure Claude Code status line settings like refresh interval"
    },
    "-",
    {
      label: "\uD83D\uDCE4 Export Config",
      value: "exportConfig",
      description: "Save your current configuration to a JSON file for backup or sharing"
    },
    {
      label: "\uD83D\uDCE5 Import Config",
      value: "importConfig",
      description: "Load configuration from a previously exported JSON file"
    },
    "-",
    getInstallationMenuItem(isClaudeInstalled, installation)
  ];
  if (hasChanges) {
    menuItems.push("-", {
      label: "\uD83D\uDCBE Save & Exit",
      value: "save",
      description: "Save all changes and exit the configuration tool"
    }, {
      label: "❌ Exit without saving",
      value: "exit",
      description: "Exit without saving your changes"
    }, "-", {
      label: "⭐ Like ccstatusline? Star us on GitHub",
      value: "starGithub",
      description: "Open the ccstatusline GitHub repository in your browser so you can star the project"
    });
  } else {
    menuItems.push("-", {
      label: "\uD83D\uDEAA Exit",
      value: "exit",
      description: "Exit the configuration tool"
    }, "-", {
      label: "⭐ Like ccstatusline? Star us on GitHub",
      value: "starGithub",
      description: "Open the ccstatusline GitHub repository in your browser so you can star the project"
    });
  }
  return menuItems;
}
function getMainMenuSelectionIndex(items, option) {
  let selectionIndex = 0;
  for (const item of items) {
    if (item === "-") {
      continue;
    }
    if (item.value === option) {
      return selectionIndex;
    }
    if (!item.disabled) {
      selectionIndex += 1;
    }
  }
  return 0;
}
function getMainMenuInstallSelectionIndex(isClaudeInstalled, installation) {
  const option = isClaudeInstalled && usesManageInstallation(installation) ? "manageInstallation" : "install";
  return getMainMenuSelectionIndex(buildMainMenuItems(isClaudeInstalled, false, installation), option);
}
var MainMenu = ({
  onSelect,
  isClaudeInstalled,
  hasChanges,
  initialSelection = 0,
  powerlineFontStatus,
  settings,
  installation,
  previewIsTruncated
}) => {
  const menuItems = buildMainMenuItems(isClaudeInstalled, hasChanges, installation);
  const showTruncationWarning = previewIsTruncated && settings?.flexMode === "full-minus-40";
  return /* @__PURE__ */ jsx_runtime13.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      showTruncationWarning && /* @__PURE__ */ jsx_runtime13.jsx(Box_default, {
        marginBottom: 1,
        children: /* @__PURE__ */ jsx_runtime13.jsx(Text, {
          color: "yellow",
          children: "⚠ Some lines are truncated, see Terminal Options → Terminal Width for info"
        })
      }),
      /* @__PURE__ */ jsx_runtime13.jsx(Text, {
        bold: true,
        children: "Main Menu"
      }),
      /* @__PURE__ */ jsx_runtime13.jsx(List, {
        items: menuItems,
        marginTop: 1,
        onSelect: (value, index) => {
          if (value === "back") {
            return;
          }
          onSelect(value, index);
        },
        initialSelection
      })
    ]
  });
};
// src/tui/components/ManageInstallationMenu.tsx
var jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
function getInstallationLabel(installation) {
  if (installation.method === "pinned") {
    const version = installation.installedVersion ? ` ${installation.installedVersion}` : "";
    const manager = installation.packageManager === "unknown" ? "" : ` via ${installation.packageManager}`;
    return `Pinned global install${manager}${version}`;
  }
  if (installation.method === "self-managed") {
    return "Self-managed/global install";
  }
  if (installation.method === "auto-update") {
    return `Auto-update via ${installation.packageManager}`;
  }
  return "Unknown installation";
}
function getActiveCommandLabel(activeCommand) {
  if (!activeCommand?.resolvedPath) {
    return null;
  }
  if (activeCommand.packageManager === "unknown") {
    return `Active PATH match: ${activeCommand.resolvedPath}`;
  }
  const version = activeCommand.version ? ` ${activeCommand.version}` : "";
  return `Active PATH match: ${activeCommand.packageManager} global${version} (${activeCommand.resolvedPath})`;
}
function buildManageInstallationItems() {
  return [
    {
      label: "\uD83D\uDD04 Check for Updates",
      value: "checkUpdates",
      description: "Check npm for the latest ccstatusline version and update the pinned global package"
    },
    {
      label: "\uD83D\uDD0C Uninstall",
      value: "uninstall",
      description: "Remove ccstatusline from Claude Code settings, optionally removing global npm/bun packages"
    }
  ];
}
function formatPackageManagers(packageManagers) {
  return packageManagers.join(" + ");
}
function buildUninstallItems(installations) {
  const removableManagers = installations.filter((installation) => installation.installed && installation.available).map((installation) => installation.packageManager);
  const items = [
    {
      label: "Remove from Claude Code settings only",
      value: { packageManagers: [] },
      description: "Leaves any global npm or bun ccstatusline packages installed"
    }
  ];
  for (const packageManager of removableManagers) {
    items.push({
      label: `Remove Claude settings and ${packageManager} global package`,
      value: { packageManagers: [packageManager] },
      description: `Runs ${packageManager === "npm" ? "npm uninstall -g ccstatusline" : "bun remove -g ccstatusline"} after removing Claude Code settings`
    });
  }
  if (removableManagers.length > 1) {
    items.push({
      label: `Remove Claude settings and ${formatPackageManagers(removableManagers)} global packages`,
      value: { packageManagers: removableManagers },
      description: "Removes every detected global ccstatusline package after removing Claude Code settings"
    });
  }
  return items;
}
var ManageInstallationMenu = ({
  installation,
  activeCommand,
  onSelect,
  onBack
}) => {
  const activeCommandLabel = getActiveCommandLabel(activeCommand);
  use_input_default((_, key) => {
    if (key.escape) {
      onBack();
    }
  });
  return /* @__PURE__ */ jsx_runtime14.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime14.jsx(Text, {
        bold: true,
        children: "Manage Installation"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime14.jsxs(Text, {
          children: [
            "Current:",
            " ",
            getInstallationLabel(installation)
          ]
        })
      }),
      activeCommandLabel && /* @__PURE__ */ jsx_runtime14.jsx(Box_default, {
        children: /* @__PURE__ */ jsx_runtime14.jsx(Text, {
          dimColor: true,
          children: activeCommandLabel
        })
      }),
      activeCommand?.warning && /* @__PURE__ */ jsx_runtime14.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime14.jsx(Text, {
          color: "yellow",
          wrap: "wrap",
          children: activeCommand.warning
        })
      }),
      /* @__PURE__ */ jsx_runtime14.jsx(List, {
        marginTop: 1,
        items: buildManageInstallationItems(),
        onSelect: (value) => {
          if (value === "back") {
            onBack();
            return;
          }
          onSelect(value);
        },
        showBackButton: true
      })
    ]
  });
};
var UninstallMenu = ({
  installations,
  onSelect,
  onBack
}) => {
  const items = buildUninstallItems(installations);
  const detectedManagers = installations.filter((installation) => installation.installed && installation.available).map((installation) => installation.packageManager);
  use_input_default((_, key) => {
    if (key.escape) {
      onBack();
    }
  });
  return /* @__PURE__ */ jsx_runtime14.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime14.jsx(Text, {
        bold: true,
        children: "Uninstall ccstatusline"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime14.jsx(Text, {
          dimColor: true,
          children: "Choose what to remove from this machine."
        })
      }),
      detectedManagers.length === 0 && /* @__PURE__ */ jsx_runtime14.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime14.jsx(Text, {
          dimColor: true,
          children: "No global npm or bun ccstatusline package was detected."
        })
      }),
      /* @__PURE__ */ jsx_runtime14.jsx(List, {
        marginTop: 1,
        items,
        onSelect: (value) => {
          if (value === "back") {
            onBack();
            return;
          }
          onSelect(value);
        },
        showBackButton: true
      })
    ]
  });
};
// src/tui/components/PowerlineSetup.tsx
var import_react16 = __toESM(require_react(), 1);
import * as os5 from "node:os";

// src/utils/powerline-settings.ts
function resolveEnabledPowerlineTheme(theme) {
  if (!theme || theme === "custom") {
    return getDefaultPowerlineTheme();
  }
  return theme;
}
function buildEnabledPowerlineSettings(settings, removeManualSeparators) {
  const powerlineConfig = settings.powerline;
  const lines = removeManualSeparators ? settings.lines.map((line) => line.filter((item) => item.type !== "separator")) : settings.lines;
  return {
    ...settings,
    powerline: {
      ...powerlineConfig,
      enabled: true,
      theme: resolveEnabledPowerlineTheme(powerlineConfig.theme),
      separators: powerlineConfig.separators,
      separatorInvertBackground: powerlineConfig.separatorInvertBackground
    },
    defaultPadding: " ",
    lines
  };
}

// src/tui/components/PowerlineSeparatorEditor.tsx
var import_react14 = __toESM(require_react(), 1);
var jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var PowerlineSeparatorEditor = ({
  settings,
  mode,
  onUpdate,
  onBack
}) => {
  const powerlineConfig = settings.powerline;
  const getItems = () => {
    switch (mode) {
      case "separator":
        return powerlineConfig.separators;
      case "startCap":
        return powerlineConfig.startCaps;
      case "endCap":
        return powerlineConfig.endCaps;
    }
  };
  const separators = getItems();
  const invertBgs = mode === "separator" ? separators.map((_, i) => powerlineConfig.separatorInvertBackground[i] ?? false) : [];
  const [selectedIndex, setSelectedIndex] = import_react14.useState(0);
  const [hexInputMode, setHexInputMode] = import_react14.useState(false);
  const [hexInput, setHexInput] = import_react14.useState("");
  const [cursorPos, setCursorPos] = import_react14.useState(0);
  const getPresets = () => {
    if (mode === "separator") {
      return [
        { char: "", name: "Triangle Right", hex: "E0B0" },
        { char: "", name: "Triangle Left", hex: "E0B2" },
        { char: "", name: "Round Right", hex: "E0B4" },
        { char: "", name: "Round Left", hex: "E0B6" }
      ];
    } else if (mode === "startCap") {
      return [
        { char: "", name: "Triangle", hex: "E0B2" },
        { char: "", name: "Round", hex: "E0B6" },
        { char: "", name: "Lower Triangle", hex: "E0BA" },
        { char: "", name: "Diagonal", hex: "E0BE" }
      ];
    } else {
      return [
        { char: "", name: "Triangle", hex: "E0B0" },
        { char: "", name: "Round", hex: "E0B4" },
        { char: "", name: "Lower Triangle", hex: "E0B8" },
        { char: "", name: "Diagonal", hex: "E0BC" }
      ];
    }
  };
  const presetSeparators = getPresets();
  const getSeparatorDisplay = (char, index) => {
    const preset = presetSeparators.find((p) => p.char === char);
    const invertBg = invertBgs[index] ?? false;
    if (preset) {
      const inversionText = mode === "separator" && invertBg ? " [Inverted]" : "";
      return `${preset.char} - ${preset.name}${inversionText}`;
    }
    const codePoint = char.codePointAt(0) ?? 0;
    const hexCode = codePoint.toString(16).toUpperCase().padStart(4, "0");
    return `${char} - Custom (U+${hexCode})${invertBg ? " [Inverted]" : ""}`;
  };
  const updateSeparators = (newSeparators, newInvertBgs) => {
    const updatedPowerline = { ...powerlineConfig };
    switch (mode) {
      case "separator":
        updatedPowerline.separators = newSeparators;
        updatedPowerline.separatorInvertBackground = newInvertBgs ?? newSeparators.map((_, i) => invertBgs[i] ?? false);
        break;
      case "startCap":
        updatedPowerline.startCaps = newSeparators;
        break;
      case "endCap":
        updatedPowerline.endCaps = newSeparators;
        break;
    }
    onUpdate({
      ...settings,
      powerline: updatedPowerline
    });
  };
  use_input_default((input, key) => {
    const shortcut = getPlainInput(input, key);
    if (hexInputMode) {
      if (key.escape) {
        setHexInputMode(false);
        setHexInput("");
        setCursorPos(0);
      } else if (key.return) {
        if (hexInput.length >= 4 && hexInput.length <= 6) {
          const codePoint = Number.parseInt(hexInput, 16);
          if (codePoint >= 0 && codePoint <= 1114111) {
            const char = String.fromCodePoint(codePoint);
            const newSeparators = [...separators];
            if (separators.length === 0) {
              newSeparators.push(char);
            } else {
              newSeparators[selectedIndex] = char;
            }
            updateSeparators(newSeparators);
            setHexInputMode(false);
            setHexInput("");
            setCursorPos(0);
          }
        }
      } else if (key.backspace && cursorPos > 0) {
        setHexInput(hexInput.slice(0, cursorPos - 1) + hexInput.slice(cursorPos));
        setCursorPos(cursorPos - 1);
      } else if (shouldInsertInput(input, key) && /[0-9a-fA-F]/.test(input) && hexInput.length < 6) {
        setHexInput(hexInput.slice(0, cursorPos) + input.toUpperCase() + hexInput.slice(cursorPos));
        setCursorPos(cursorPos + 1);
      }
    } else {
      if (key.escape) {
        onBack();
      } else if (key.upArrow && separators.length > 0) {
        setSelectedIndex(selectedIndex - 1 < 0 ? separators.length - 1 : selectedIndex - 1);
      } else if (key.downArrow && separators.length > 0) {
        setSelectedIndex(selectedIndex + 1 > separators.length - 1 ? 0 : selectedIndex + 1);
      } else if ((key.leftArrow || key.rightArrow) && separators.length > 0) {
        const currentChar = separators[selectedIndex] ?? "";
        const currentPresetIndex = presetSeparators.findIndex((p) => p.char === currentChar);
        const newSeparators = [...separators];
        const newInvertBgs = mode === "separator" ? [...invertBgs] : [];
        let newIndex;
        if (currentPresetIndex !== -1) {
          if (key.rightArrow) {
            newIndex = (currentPresetIndex + 1) % presetSeparators.length;
          } else {
            newIndex = currentPresetIndex === 0 ? presetSeparators.length - 1 : currentPresetIndex - 1;
          }
        } else {
          if (key.rightArrow) {
            newIndex = 0;
          } else {
            newIndex = presetSeparators.length - 1;
          }
        }
        const newChar = presetSeparators[newIndex]?.char ?? presetSeparators[0]?.char ?? "";
        newSeparators[selectedIndex] = newChar;
        if (mode === "separator") {
          const isLeftFacing = newChar === "" || newChar === "";
          newInvertBgs[selectedIndex] = isLeftFacing;
        }
        updateSeparators(newSeparators, mode === "separator" ? newInvertBgs : undefined);
      } else if (shortcut === "a" || shortcut === "A") {
        const newSeparators = [...separators];
        const newInvertBgs = mode === "separator" ? [...invertBgs] : [];
        const defaultChar = presetSeparators[0]?.char ?? "";
        const isLeftFacing = defaultChar === "" || defaultChar === "";
        if (separators.length === 0) {
          newSeparators.push(defaultChar);
          if (mode === "separator") {
            newInvertBgs.push(isLeftFacing);
          }
          updateSeparators(newSeparators, newInvertBgs);
          setSelectedIndex(0);
        } else {
          newSeparators.splice(selectedIndex + 1, 0, defaultChar);
          if (mode === "separator") {
            newInvertBgs.splice(selectedIndex + 1, 0, isLeftFacing);
          }
          updateSeparators(newSeparators, newInvertBgs);
          setSelectedIndex(selectedIndex + 1);
        }
      } else if (shortcut === "i" || shortcut === "I") {
        const newSeparators = [...separators];
        const newInvertBgs = mode === "separator" ? [...invertBgs] : [];
        const defaultChar = presetSeparators[0]?.char ?? "";
        const isLeftFacing = defaultChar === "" || defaultChar === "";
        if (separators.length === 0) {
          newSeparators.push(defaultChar);
          if (mode === "separator") {
            newInvertBgs.push(isLeftFacing);
          }
          updateSeparators(newSeparators, newInvertBgs);
          setSelectedIndex(0);
        } else {
          newSeparators.splice(selectedIndex, 0, defaultChar);
          if (mode === "separator") {
            newInvertBgs.splice(selectedIndex, 0, isLeftFacing);
          }
          updateSeparators(newSeparators, newInvertBgs);
        }
      } else if ((shortcut === "d" || shortcut === "D") && (mode !== "separator" || separators.length > 1)) {
        const newSeparators = separators.filter((_, i) => i !== selectedIndex);
        const newInvertBgs = mode === "separator" ? invertBgs.filter((_, i) => i !== selectedIndex) : [];
        updateSeparators(newSeparators, newInvertBgs);
        setSelectedIndex(Math.min(selectedIndex, Math.max(0, newSeparators.length - 1)));
      } else if (shortcut === "c" || shortcut === "C") {
        if (mode === "separator") {
          updateSeparators([""], [false]);
        } else {
          updateSeparators([]);
        }
        setSelectedIndex(0);
      } else if (shortcut === "h" || shortcut === "H") {
        setHexInputMode(true);
        setHexInput("");
        setCursorPos(0);
      } else if ((shortcut === "t" || shortcut === "T") && mode === "separator") {
        const newInvertBgs = [...invertBgs];
        newInvertBgs[selectedIndex] = !(newInvertBgs[selectedIndex] ?? false);
        updateSeparators(separators, newInvertBgs);
      }
    }
  });
  const getTitle = () => {
    switch (mode) {
      case "separator":
        return "Powerline Separator Configuration";
      case "startCap":
        return "Powerline Start Cap Configuration";
      case "endCap":
        return "Powerline End Cap Configuration";
    }
  };
  const canDelete = mode !== "separator" || separators.length > 1;
  return /* @__PURE__ */ jsx_runtime15.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime15.jsx(Text, {
        bold: true,
        children: getTitle()
      }),
      hexInputMode ? /* @__PURE__ */ jsx_runtime15.jsxs(Box_default, {
        marginTop: 2,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime15.jsxs(Text, {
            children: [
              "Enter hex code (4-6 digits) for",
              " ",
              mode === "separator" ? "separator" : "cap",
              separators.length > 0 ? ` ${selectedIndex + 1}` : "",
              ":"
            ]
          }),
          /* @__PURE__ */ jsx_runtime15.jsxs(Text, {
            children: [
              "U+",
              hexInput.slice(0, cursorPos),
              /* @__PURE__ */ jsx_runtime15.jsx(Text, {
                backgroundColor: "gray",
                color: "black",
                children: hexInput[cursorPos] ?? "_"
              }),
              hexInput.slice(cursorPos + 1),
              hexInput.length < 6 && hexInput.length === cursorPos && /* @__PURE__ */ jsx_runtime15.jsx(Text, {
                dimColor: true,
                children: "_".repeat(6 - hexInput.length - 1)
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime15.jsx(Text, {
            dimColor: true,
            children: "Enter 4-6 hex digits (0-9, A-F) for a Unicode code point, then press Enter. ESC to cancel."
          }),
          /* @__PURE__ */ jsx_runtime15.jsx(Text, {
            dimColor: true,
            children: "Examples: E0B0 (powerline), 1F984 (\uD83E\uDD84), 2764 (❤)"
          })
        ]
      }) : /* @__PURE__ */ jsx_runtime15.jsxs(jsx_runtime15.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime15.jsx(Box_default, {
            children: /* @__PURE__ */ jsx_runtime15.jsx(Text, {
              dimColor: true,
              children: `↑↓ select, ← → cycle, (a)dd, (i)nsert${canDelete ? ", (d)elete" : ""}, (c)lear, (h)ex${mode === "separator" ? ", (t)oggle invert" : ""}, ESC back`
            })
          }),
          /* @__PURE__ */ jsx_runtime15.jsx(Box_default, {
            marginTop: 2,
            flexDirection: "column",
            children: separators.length > 0 ? separators.map((sep, index) => /* @__PURE__ */ jsx_runtime15.jsx(Box_default, {
              children: /* @__PURE__ */ jsx_runtime15.jsxs(Text, {
                color: index === selectedIndex ? "green" : undefined,
                children: [
                  index === selectedIndex ? "▶  " : "   ",
                  `${index + 1}: ${getSeparatorDisplay(sep, index)}`
                ]
              })
            }, index)) : /* @__PURE__ */ jsx_runtime15.jsx(Text, {
              dimColor: true,
              children: "(none configured - press 'a' to add)"
            })
          })
        ]
      })
    ]
  });
};

// src/tui/components/PowerlineThemeSelector.tsx
var import_react15 = __toESM(require_react(), 1);
var jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
function buildPowerlineThemeItems(themes, originalTheme) {
  return themes.map((themeName) => {
    const theme = getPowerlineTheme(themeName);
    return {
      label: theme?.name ?? themeName,
      sublabel: themeName === originalTheme ? "(original)" : undefined,
      value: themeName,
      description: theme?.description ?? ""
    };
  });
}
function applyCustomPowerlineTheme(settings, themeName) {
  const theme = getPowerlineTheme(themeName);
  if (!theme || themeName === "custom") {
    return null;
  }
  const colorLevel = getColorLevelString(settings.colorLevel);
  const colorLevelKey = colorLevel === "ansi16" ? "1" : colorLevel === "ansi256" ? "2" : "3";
  const themeColors = theme[colorLevelKey];
  if (!themeColors) {
    return null;
  }
  let nextLineSlot = 0;
  const lines = settings.lines.map((line) => {
    const { slots, nextSlot } = assignPowerlineThemeSlots(line, settings.powerline.continueThemeAcrossLines ? nextLineSlot : 0);
    nextLineSlot = nextSlot;
    return line.map((widget, index) => {
      const slot = slots[index];
      if (typeof slot !== "number") {
        return widget;
      }
      const fgColor = themeColors.fg[slot % themeColors.fg.length];
      const bgColor = themeColors.bg[slot % themeColors.bg.length];
      return {
        ...widget,
        color: fgColor,
        backgroundColor: bgColor
      };
    });
  });
  return {
    ...settings,
    powerline: {
      ...settings.powerline,
      theme: "custom"
    },
    lines
  };
}
var PowerlineThemeSelector = ({
  settings,
  onUpdate,
  onBack
}) => {
  const themes = import_react15.useMemo(() => getPowerlineThemes(), []);
  const currentTheme = settings.powerline.theme ?? "custom";
  const [selectedIndex, setSelectedIndex] = import_react15.useState(Math.max(0, themes.indexOf(currentTheme)));
  const [showCustomizeConfirm, setShowCustomizeConfirm] = import_react15.useState(false);
  const originalThemeRef = import_react15.useRef(currentTheme);
  const originalSettingsRef = import_react15.useRef(settings);
  const latestSettingsRef = import_react15.useRef(settings);
  const latestOnUpdateRef = import_react15.useRef(onUpdate);
  const didHandleInitialSelectionRef = import_react15.useRef(false);
  import_react15.useEffect(() => {
    latestSettingsRef.current = settings;
    latestOnUpdateRef.current = onUpdate;
  }, [settings, onUpdate]);
  import_react15.useEffect(() => {
    const themeName = themes[selectedIndex];
    if (!themeName) {
      return;
    }
    if (!didHandleInitialSelectionRef.current) {
      didHandleInitialSelectionRef.current = true;
      return;
    }
    latestOnUpdateRef.current({
      ...latestSettingsRef.current,
      powerline: {
        ...latestSettingsRef.current.powerline,
        theme: themeName
      }
    });
  }, [selectedIndex, themes]);
  use_input_default((input, key) => {
    const shortcut = getPlainInput(input, key);
    if (showCustomizeConfirm) {
      return;
    }
    if (key.escape) {
      onUpdate(originalSettingsRef.current);
      onBack();
    } else if (shortcut === "c" || shortcut === "C") {
      const currentThemeName = themes[selectedIndex];
      if (currentThemeName && currentThemeName !== "custom") {
        setShowCustomizeConfirm(true);
      }
    }
  });
  const selectedThemeName = themes[selectedIndex];
  const themeItems = import_react15.useMemo(() => buildPowerlineThemeItems(themes, originalThemeRef.current), [themes]);
  if (showCustomizeConfirm) {
    return /* @__PURE__ */ jsx_runtime16.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime16.jsx(Text, {
          bold: true,
          color: "yellow",
          children: "⚠ Confirm Customization"
        }),
        /* @__PURE__ */ jsx_runtime16.jsxs(Box_default, {
          marginTop: 1,
          flexDirection: "column",
          children: [
            /* @__PURE__ */ jsx_runtime16.jsx(Text, {
              children: "This will copy the current theme colors to your widgets"
            }),
            /* @__PURE__ */ jsx_runtime16.jsx(Text, {
              children: "and switch to Custom theme mode."
            }),
            /* @__PURE__ */ jsx_runtime16.jsx(Text, {
              color: "red",
              children: "This will overwrite any existing custom colors!"
            })
          ]
        }),
        /* @__PURE__ */ jsx_runtime16.jsx(Box_default, {
          marginTop: 2,
          children: /* @__PURE__ */ jsx_runtime16.jsx(Text, {
            children: "Continue?"
          })
        }),
        /* @__PURE__ */ jsx_runtime16.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime16.jsx(ConfirmDialog, {
            inline: true,
            onConfirm: () => {
              if (selectedThemeName) {
                const updatedSettings = applyCustomPowerlineTheme(settings, selectedThemeName);
                if (updatedSettings) {
                  onUpdate(updatedSettings);
                }
              }
              setShowCustomizeConfirm(false);
              onBack();
            },
            onCancel: () => {
              setShowCustomizeConfirm(false);
            }
          })
        })
      ]
    });
  }
  return /* @__PURE__ */ jsx_runtime16.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime16.jsxs(Text, {
        bold: true,
        children: [
          `Powerline Theme Selection  |  `,
          /* @__PURE__ */ jsx_runtime16.jsx(Text, {
            dimColor: true,
            children: `Original: ${originalThemeRef.current}`
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime16.jsx(Box_default, {
        children: /* @__PURE__ */ jsx_runtime16.jsx(Text, {
          dimColor: true,
          children: `↑↓ navigate, Enter apply${selectedThemeName && selectedThemeName !== "custom" ? ", (c)ustomize theme" : ""}, ESC cancel`
        })
      }),
      /* @__PURE__ */ jsx_runtime16.jsx(List, {
        marginTop: 1,
        items: themeItems,
        onSelect: () => {
          onBack();
        },
        onSelectionChange: (themeName, index) => {
          if (themeName === "back") {
            return;
          }
          setSelectedIndex(index);
        },
        initialSelection: selectedIndex
      }),
      selectedThemeName && selectedThemeName !== "custom" && /* @__PURE__ */ jsx_runtime16.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime16.jsx(Text, {
          dimColor: true,
          children: "Press (c) to customize this theme - copies colors to widgets"
        })
      }),
      settings.colorLevel === 1 && /* @__PURE__ */ jsx_runtime16.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime16.jsx(Text, {
          color: "yellow",
          children: "⚠ 16 color mode themes have a very limited palette, we recommend switching color level in Terminal Options"
        })
      })
    ]
  });
};

// src/tui/components/PowerlineSetup.tsx
var jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
var POWERLINE_MENU_LABEL_WIDTH = 11;
function formatPowerlineMenuLabel(label) {
  return label.padEnd(POWERLINE_MENU_LABEL_WIDTH, " ");
}
function getSeparatorDisplay(powerlineConfig) {
  const seps = powerlineConfig.separators;
  if (seps.length > 1) {
    return "multiple";
  }
  const sep = seps[0] ?? "";
  const presets = [
    { char: "", name: "Triangle Right" },
    { char: "", name: "Triangle Left" },
    { char: "", name: "Round Right" },
    { char: "", name: "Round Left" }
  ];
  const preset = presets.find((item) => item.char === sep);
  if (preset) {
    return `${preset.char} - ${preset.name}`;
  }
  return `${sep} - Custom`;
}
function getCapDisplay(powerlineConfig, type) {
  const caps = type === "start" ? powerlineConfig.startCaps : powerlineConfig.endCaps;
  if (caps.length === 0) {
    return "none";
  }
  if (caps.length > 1) {
    return "multiple";
  }
  const cap = caps[0];
  if (!cap) {
    return "none";
  }
  const presets = type === "start" ? [
    { char: "", name: "Triangle" },
    { char: "", name: "Round" },
    { char: "", name: "Lower Triangle" },
    { char: "", name: "Diagonal" }
  ] : [
    { char: "", name: "Triangle" },
    { char: "", name: "Round" },
    { char: "", name: "Lower Triangle" },
    { char: "", name: "Diagonal" }
  ];
  const preset = presets.find((item) => item.char === cap);
  if (preset) {
    return `${preset.char} - ${preset.name}`;
  }
  return `${cap} - Custom`;
}
function getThemeDisplay(powerlineConfig) {
  const theme = powerlineConfig.theme;
  if (!theme || theme === "custom") {
    return "Custom";
  }
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}
function buildPowerlineSetupMenuItems(powerlineConfig) {
  const disabled = !powerlineConfig.enabled;
  return [
    {
      label: formatPowerlineMenuLabel("Separator"),
      sublabel: `(${getSeparatorDisplay(powerlineConfig)})`,
      value: "separator",
      disabled,
      description: "Choose the glyph used between powerline segments."
    },
    {
      label: formatPowerlineMenuLabel("Start Cap"),
      sublabel: `(${getCapDisplay(powerlineConfig, "start")})`,
      value: "startCap",
      disabled,
      description: "Configure the cap glyph that appears at the start of each powerline line."
    },
    {
      label: formatPowerlineMenuLabel("End Cap"),
      sublabel: `(${getCapDisplay(powerlineConfig, "end")})`,
      value: "endCap",
      disabled,
      description: "Configure the cap glyph that appears at the end of each powerline line."
    },
    {
      label: formatPowerlineMenuLabel("Themes"),
      sublabel: `(${getThemeDisplay(powerlineConfig)})`,
      value: "themes",
      disabled,
      description: "Preview built-in powerline themes or copy a theme into custom widget colors."
    }
  ];
}
var PowerlineSetup = ({
  settings,
  powerlineFontStatus,
  onUpdate,
  onBack,
  onInstallFonts,
  installingFonts,
  fontInstallMessage,
  onClearMessage
}) => {
  const powerlineConfig = settings.powerline;
  const [screen, setScreen] = import_react16.useState("menu");
  const [selectedMenuItem, setSelectedMenuItem] = import_react16.useState(0);
  const [confirmingEnable, setConfirmingEnable] = import_react16.useState(false);
  const [confirmingFontInstall, setConfirmingFontInstall] = import_react16.useState(false);
  const hasManualSeparatorItems = settings.lines.some((line) => line.some((item) => item.type === "separator"));
  const hasGlobalFgOverride = Boolean(settings.overrideForegroundColor && settings.overrideForegroundColor !== "none");
  const globalOverrideMessage = hasGlobalFgOverride ? "⚠ Global override for FG active" : null;
  use_input_default((input, key) => {
    const shortcut = getPlainInput(input, key);
    if (fontInstallMessage || installingFonts) {
      if (fontInstallMessage && !key.escape) {
        onClearMessage();
      }
      return;
    }
    if (confirmingFontInstall || confirmingEnable) {
      return;
    }
    if (screen === "menu") {
      if (key.escape) {
        onBack();
      } else if (shortcut === "t" || shortcut === "T") {
        if (!powerlineConfig.enabled) {
          if (hasManualSeparatorItems) {
            setConfirmingEnable(true);
          } else {
            onUpdate(buildEnabledPowerlineSettings(settings, false));
          }
        } else {
          onUpdate({
            ...settings,
            powerline: {
              ...powerlineConfig,
              enabled: false
            }
          });
        }
      } else if (shortcut === "i" || shortcut === "I") {
        setConfirmingFontInstall(true);
      } else if ((shortcut === "a" || shortcut === "A") && powerlineConfig.enabled) {
        onUpdate({
          ...settings,
          powerline: {
            ...powerlineConfig,
            autoAlign: !powerlineConfig.autoAlign
          }
        });
      } else if ((shortcut === "c" || shortcut === "C") && powerlineConfig.enabled) {
        onUpdate({
          ...settings,
          powerline: {
            ...powerlineConfig,
            continueThemeAcrossLines: !powerlineConfig.continueThemeAcrossLines
          }
        });
      }
    }
  });
  if (screen === "separator") {
    return /* @__PURE__ */ jsx_runtime17.jsx(PowerlineSeparatorEditor, {
      settings,
      mode: "separator",
      onUpdate,
      onBack: () => {
        setScreen("menu");
      }
    });
  }
  if (screen === "startCap") {
    return /* @__PURE__ */ jsx_runtime17.jsx(PowerlineSeparatorEditor, {
      settings,
      mode: "startCap",
      onUpdate,
      onBack: () => {
        setScreen("menu");
      }
    });
  }
  if (screen === "endCap") {
    return /* @__PURE__ */ jsx_runtime17.jsx(PowerlineSeparatorEditor, {
      settings,
      mode: "endCap",
      onUpdate,
      onBack: () => {
        setScreen("menu");
      }
    });
  }
  if (screen === "themes") {
    return /* @__PURE__ */ jsx_runtime17.jsx(PowerlineThemeSelector, {
      settings,
      onUpdate,
      onBack: () => {
        setScreen("menu");
      }
    });
  }
  return /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      !confirmingFontInstall && !installingFonts && !fontInstallMessage && /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
        children: [
          /* @__PURE__ */ jsx_runtime17.jsx(Text, {
            bold: true,
            children: "Powerline Setup"
          }),
          globalOverrideMessage && /* @__PURE__ */ jsx_runtime17.jsxs(Text, {
            color: "yellow",
            dimColor: true,
            children: [
              ".  ",
              globalOverrideMessage
            ]
          })
        ]
      }),
      confirmingFontInstall ? /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
            marginBottom: 1,
            children: /* @__PURE__ */ jsx_runtime17.jsx(Text, {
              color: "cyan",
              bold: true,
              children: "Font Installation"
            })
          }),
          /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
            marginBottom: 1,
            flexDirection: "column",
            children: [
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                bold: true,
                children: "What will happen:"
              }),
              /* @__PURE__ */ jsx_runtime17.jsxs(Text, {
                children: [
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "• Clone fonts from "
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    color: "blue",
                    children: "https://github.com/powerline/fonts"
                  })
                ]
              }),
              os5.platform() === "darwin" && /* @__PURE__ */ jsx_runtime17.jsxs(jsx_runtime17.Fragment, {
                children: [
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "• Run install.sh script which will:"
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "  - Copy all .ttf/.otf files to ~/Library/Fonts"
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "  - Register fonts with macOS"
                  })
                ]
              }),
              os5.platform() === "linux" && /* @__PURE__ */ jsx_runtime17.jsxs(jsx_runtime17.Fragment, {
                children: [
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "• Run install.sh script which will:"
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "  - Copy all .ttf/.otf files to ~/.local/share/fonts"
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "  - Run fc-cache to update font cache"
                  })
                ]
              }),
              os5.platform() === "win32" && /* @__PURE__ */ jsx_runtime17.jsxs(jsx_runtime17.Fragment, {
                children: [
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "• Copy Powerline .ttf/.otf files to:"
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "  AppData\\Local\\Microsoft\\Windows\\Fonts"
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                dimColor: true,
                children: "• Clean up temporary files"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
            marginBottom: 1,
            children: [
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                color: "yellow",
                bold: true,
                children: "Requirements: "
              }),
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                dimColor: true,
                children: "Git installed, Internet connection, Write permissions"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
            marginBottom: 1,
            flexDirection: "column",
            children: [
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                color: "green",
                bold: true,
                children: "After install:"
              }),
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                dimColor: true,
                children: "• Restart terminal"
              }),
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                dimColor: true,
                children: "• Select a Powerline font"
              }),
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                dimColor: true,
                children: '  (e.g. "Meslo LG S for Powerline")'
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime17.jsx(Text, {
              children: "Proceed? "
            })
          }),
          /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime17.jsx(ConfirmDialog, {
              inline: true,
              onConfirm: () => {
                setConfirmingFontInstall(false);
                onInstallFonts();
              },
              onCancel: () => {
                setConfirmingFontInstall(false);
              }
            })
          })
        ]
      }) : confirmingEnable ? /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
        flexDirection: "column",
        marginTop: 1,
        children: [
          hasManualSeparatorItems && /* @__PURE__ */ jsx_runtime17.jsxs(jsx_runtime17.Fragment, {
            children: [
              /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
                children: /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                  color: "yellow",
                  children: "⚠ Warning: Enabling Powerline mode will remove all existing manual separators from your status lines."
                })
              }),
              /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
                marginBottom: 1,
                children: /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                  dimColor: true,
                  children: "Powerline mode uses its own separator system and is incompatible with manual separators."
                })
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
            marginTop: hasManualSeparatorItems ? 1 : 0,
            children: /* @__PURE__ */ jsx_runtime17.jsx(Text, {
              children: "Do you want to continue? "
            })
          }),
          /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime17.jsx(ConfirmDialog, {
              inline: true,
              onConfirm: () => {
                onUpdate(buildEnabledPowerlineSettings(settings, true));
                setConfirmingEnable(false);
              },
              onCancel: () => {
                setConfirmingEnable(false);
              }
            })
          })
        ]
      }) : installingFonts ? /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
        children: /* @__PURE__ */ jsx_runtime17.jsx(Text, {
          color: "yellow",
          children: "Installing Powerline fonts... This may take a moment."
        })
      }) : fontInstallMessage ? /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime17.jsx(Text, {
            color: fontInstallMessage.includes("success") ? "green" : "red",
            children: fontInstallMessage
          }),
          /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime17.jsx(Text, {
              dimColor: true,
              children: "Press any key to continue..."
            })
          })
        ]
      }) : /* @__PURE__ */ jsx_runtime17.jsxs(jsx_runtime17.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
            flexDirection: "column",
            children: /* @__PURE__ */ jsx_runtime17.jsxs(Text, {
              children: [
                "    Font Status: ",
                powerlineFontStatus.installed ? /* @__PURE__ */ jsx_runtime17.jsxs(jsx_runtime17.Fragment, {
                  children: [
                    /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                      color: "green",
                      children: "✓ Installed"
                    }),
                    /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                      dimColor: true,
                      children: " - Ensure fonts are active in your terminal"
                    })
                  ]
                }) : /* @__PURE__ */ jsx_runtime17.jsxs(jsx_runtime17.Fragment, {
                  children: [
                    /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                      color: "yellow",
                      children: "✗ Not Installed"
                    }),
                    /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                      dimColor: true,
                      children: " - Press (i) to install Powerline fonts"
                    })
                  ]
                })
              ]
            })
          }),
          /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
            children: [
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                children: " Powerline Mode: "
              }),
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                color: powerlineConfig.enabled ? "green" : "red",
                children: powerlineConfig.enabled ? "✓ Enabled  " : "✗ Disabled "
              }),
              /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                dimColor: true,
                children: " - Press (t) to toggle"
              })
            ]
          }),
          powerlineConfig.enabled && /* @__PURE__ */ jsx_runtime17.jsxs(jsx_runtime17.Fragment, {
            children: [
              /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
                children: [
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    children: "  Align Widgets: "
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    color: powerlineConfig.autoAlign ? "green" : "red",
                    children: powerlineConfig.autoAlign ? "✓ Enabled  " : "✗ Disabled "
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: " - Press (a) to toggle"
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
                children: [
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    children: " Continue Theme: "
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    color: powerlineConfig.continueThemeAcrossLines ? "green" : "red",
                    children: powerlineConfig.continueThemeAcrossLines ? "✓ Enabled  " : "✗ Disabled "
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: " - Press (c) to toggle"
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime17.jsxs(Box_default, {
                flexDirection: "column",
                marginTop: 1,
                children: [
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "Powerline mode uses its own separator system"
                  }),
                  /* @__PURE__ */ jsx_runtime17.jsx(Text, {
                    dimColor: true,
                    children: "Continue Theme keeps the Powerline color sequence running across lines"
                  })
                ]
              })
            ]
          }),
          !powerlineConfig.enabled && /* @__PURE__ */ jsx_runtime17.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime17.jsx(Text, {
              dimColor: true,
              children: "Enable Powerline mode to configure separators, caps, and themes."
            })
          }),
          /* @__PURE__ */ jsx_runtime17.jsx(List, {
            marginTop: 1,
            items: buildPowerlineSetupMenuItems(powerlineConfig),
            onSelect: (value) => {
              if (value === "back") {
                onBack();
                return;
              }
              setScreen(value);
            },
            onSelectionChange: (_, index) => {
              setSelectedMenuItem(index);
            },
            initialSelection: selectedMenuItem,
            showBackButton: true
          })
        ]
      })
    ]
  });
};
// src/tui/components/RefreshIntervalMenu.tsx
var import_react17 = __toESM(require_react(), 1);
var jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
function getRefreshInputValue(interval) {
  return interval === null ? "" : String(interval);
}
function getRefreshIntervalSublabel(interval, supported) {
  if (!supported) {
    return "(requires Claude Code >=2.1.97)";
  }
  if (interval === null) {
    return "(not set)";
  }
  return `(${interval}s)`;
}
function getGitCacheTtlSublabel(ttlSeconds) {
  return ttlSeconds === 0 ? "(mtime only)" : `(${ttlSeconds}s)`;
}
function getCacheTtlSublabel(ttlSeconds) {
  return ttlSeconds === 0 ? "(disabled)" : `(${ttlSeconds}s)`;
}
function buildConfigureStatusLineItems(refreshInterval, supportsRefreshInterval, gitCacheTtlSeconds, customCommandCacheTtlSeconds, terminalWidthCacheTtlSeconds) {
  return [
    {
      label: "\uD83D\uDD04 Refresh Interval",
      sublabel: getRefreshIntervalSublabel(refreshInterval, supportsRefreshInterval),
      value: "refreshInterval",
      disabled: !supportsRefreshInterval,
      description: supportsRefreshInterval ? "How often Claude Code refreshes the status line by re-running the command. Enter value in seconds (1-60), or leave empty to remove." : "This setting requires Claude Code version 2.1.97 or later. Please update Claude Code to use this feature."
    },
    {
      label: "\uD83E\uDDEE Git Cache TTL",
      sublabel: getGitCacheTtlSublabel(gitCacheTtlSeconds),
      value: "gitCacheTtl",
      description: `How long git widget subprocess output can be reused while .git/HEAD and .git/index are unchanged. Enter 0-60 seconds;
0 disables age-based expiry, so cached output is reused until those git metadata mtimes change.`
    },
    {
      label: "\uD83D\uDD27 Custom Command Cache TTL",
      sublabel: getCacheTtlSublabel(customCommandCacheTtlSeconds),
      value: "customCommandCacheTtl",
      description: `How long custom command output is reused before the command runs again. Enter 0-60 seconds;
0 disables caching, so every status line render spawns the command.`
    },
    {
      label: "\uD83D\uDDA5️  Terminal Width Cache TTL",
      sublabel: getCacheTtlSublabel(terminalWidthCacheTtlSeconds),
      value: "terminalWidthCacheTtl",
      description: `How long a cached "no TTY detected" result is trusted before re-probing the terminal width. Enter 0-300 seconds;
0 disables the cache (always re-probes). A detected width is never cached across renders, only this no-TTY result is.`
    }
  ];
}
function validateRefreshIntervalInput(value) {
  if (value === "") {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return "Please enter a valid number";
  }
  if (parsed < 1) {
    return `Minimum interval is 1s (you entered ${parsed}s)`;
  }
  if (parsed > 60) {
    return `Maximum interval is 60s (you entered ${parsed}s)`;
  }
  return null;
}
function validateTtlInput(value, label, maximum = 60) {
  const parsed = Number.parseInt(value, 10);
  if (value === "" || Number.isNaN(parsed)) {
    return "Please enter a valid number";
  }
  if (parsed < 0) {
    return `Minimum ${label} is 0s (you entered ${parsed}s)`;
  }
  if (parsed > maximum) {
    return `Maximum ${label} is ${maximum}s (you entered ${parsed}s)`;
  }
  return null;
}
function validateGitCacheTtlInput(value) {
  return validateTtlInput(value, "Git cache TTL");
}
function validateCustomCommandCacheTtlInput(value) {
  return validateTtlInput(value, "custom command cache TTL");
}
function validateTerminalWidthCacheTtlInput(value) {
  return validateTtlInput(value, "Terminal Width cache TTL", 300);
}
var RefreshIntervalMenu = ({
  currentInterval,
  supportsRefreshInterval,
  gitCacheTtlSeconds,
  customCommandCacheTtlSeconds,
  terminalWidthCacheTtlSeconds,
  onUpdate,
  onGitCacheTtlUpdate,
  onCustomCommandCacheTtlUpdate,
  onTerminalWidthCacheTtlUpdate,
  onBack
}) => {
  const [editingRefreshInterval, setEditingRefreshInterval] = import_react17.useState(false);
  const [editingTtlField, setEditingTtlField] = import_react17.useState(null);
  const [refreshInput, setRefreshInput] = import_react17.useState(() => getRefreshInputValue(currentInterval));
  const [ttlInput, setTtlInput] = import_react17.useState(() => String(gitCacheTtlSeconds));
  const [validationError, setValidationError] = import_react17.useState(null);
  const ttlFields = {
    gitCacheTtl: {
      currentValue: gitCacheTtlSeconds,
      maxInputLength: 2,
      prompt: "Enter Git cache TTL in seconds (0-60):",
      helperText: "This affects how quickly git widgets notice unstaged and untracked working-tree changes.",
      hint: "0 disables age-based expiry; cache validity uses .git/HEAD and .git/index mtimes only.",
      validate: validateGitCacheTtlInput,
      onSave: onGitCacheTtlUpdate
    },
    customCommandCacheTtl: {
      currentValue: customCommandCacheTtlSeconds,
      maxInputLength: 2,
      prompt: "Enter custom command cache TTL in seconds (0-60):",
      helperText: "This affects how quickly custom command widgets show new output, and how often they spawn a shell.",
      hint: "0 disables caching; every status line render spawns the command again.",
      validate: validateCustomCommandCacheTtlInput,
      onSave: onCustomCommandCacheTtlUpdate
    },
    terminalWidthCacheTtl: {
      currentValue: terminalWidthCacheTtlSeconds,
      maxInputLength: 3,
      prompt: "Enter Terminal Width cache TTL in seconds (0-300):",
      helperText: 'Controls how long a "no TTY detected" result is cached. A detected width is always re-probed on the next render so resizes take effect immediately.',
      hint: "0 disables the cache (always re-probes).",
      validate: validateTerminalWidthCacheTtlInput,
      onSave: onTerminalWidthCacheTtlUpdate
    }
  };
  use_input_default((input, key) => {
    if (editingRefreshInterval) {
      if (key.return) {
        if (refreshInput === "") {
          onUpdate(null);
          setEditingRefreshInterval(false);
          setValidationError(null);
          return;
        }
        const error = validateRefreshIntervalInput(refreshInput);
        if (error) {
          setValidationError(error);
        } else {
          const value = Number.parseInt(refreshInput, 10);
          onUpdate(value);
          setEditingRefreshInterval(false);
          setValidationError(null);
        }
      } else if (key.escape) {
        setRefreshInput(getRefreshInputValue(currentInterval));
        setEditingRefreshInterval(false);
        setValidationError(null);
      } else if (key.backspace) {
        setRefreshInput(refreshInput.slice(0, -1));
        setValidationError(null);
      } else if (key.delete) {} else if (shouldInsertInput(input, key) && /\d/.test(input)) {
        const newValue = refreshInput + input;
        if (newValue.length <= 2) {
          setRefreshInput(newValue);
          setValidationError(null);
        }
      }
      return;
    }
    if (editingTtlField) {
      const field = ttlFields[editingTtlField];
      if (key.return) {
        const error = field.validate(ttlInput);
        if (error) {
          setValidationError(error);
        } else {
          const value = Number.parseInt(ttlInput, 10);
          field.onSave(value);
          setEditingTtlField(null);
          setValidationError(null);
        }
      } else if (key.escape) {
        setTtlInput(String(field.currentValue));
        setEditingTtlField(null);
        setValidationError(null);
      } else if (key.backspace) {
        setTtlInput(ttlInput.slice(0, -1));
        setValidationError(null);
      } else if (key.delete) {} else if (shouldInsertInput(input, key) && /\d/.test(input)) {
        const newValue = ttlInput + input;
        if (newValue.length <= field.maxInputLength) {
          setTtlInput(newValue);
          setValidationError(null);
        }
      }
      return;
    }
    if (key.escape) {
      onBack();
    }
  });
  return /* @__PURE__ */ jsx_runtime18.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime18.jsx(Text, {
        bold: true,
        children: "Configure Status Line"
      }),
      /* @__PURE__ */ jsx_runtime18.jsx(Text, {
        color: "white",
        children: "Configure Claude Code status line settings"
      }),
      editingRefreshInterval ? /* @__PURE__ */ jsx_runtime18.jsxs(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime18.jsxs(Text, {
            children: [
              "Enter refresh interval in seconds (1-60):",
              " ",
              refreshInput,
              refreshInput.length > 0 ? "s" : ""
            ]
          }),
          validationError ? /* @__PURE__ */ jsx_runtime18.jsx(Text, {
            color: "red",
            children: validationError
          }) : /* @__PURE__ */ jsx_runtime18.jsx(Text, {
            dimColor: true,
            children: "Press Enter to confirm, ESC to cancel. Leave empty to remove."
          })
        ]
      }) : editingTtlField ? /* @__PURE__ */ jsx_runtime18.jsxs(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime18.jsxs(Text, {
            children: [
              ttlFields[editingTtlField].prompt,
              " ",
              ttlInput,
              ttlInput.length > 0 ? "s" : ""
            ]
          }),
          /* @__PURE__ */ jsx_runtime18.jsx(Text, {
            children: " "
          }),
          /* @__PURE__ */ jsx_runtime18.jsx(Text, {
            dimColor: true,
            wrap: "wrap",
            children: ttlFields[editingTtlField].helperText
          }),
          validationError ? /* @__PURE__ */ jsx_runtime18.jsx(Text, {
            color: "red",
            children: validationError
          }) : /* @__PURE__ */ jsx_runtime18.jsx(Text, {
            dimColor: true,
            children: ttlFields[editingTtlField].hint
          }),
          /* @__PURE__ */ jsx_runtime18.jsx(Text, {
            dimColor: true,
            children: "Press Enter to confirm, ESC to cancel."
          })
        ]
      }) : /* @__PURE__ */ jsx_runtime18.jsx(List, {
        marginTop: 1,
        items: buildConfigureStatusLineItems(currentInterval, supportsRefreshInterval, gitCacheTtlSeconds, customCommandCacheTtlSeconds, terminalWidthCacheTtlSeconds),
        onSelect: (value) => {
          if (value === "back") {
            onBack();
            return;
          }
          if (value === "refreshInterval") {
            setRefreshInput(getRefreshInputValue(currentInterval));
            setEditingRefreshInterval(true);
            return;
          }
          setTtlInput(String(ttlFields[value].currentValue));
          setEditingTtlField(value);
        },
        showBackButton: true
      })
    ]
  });
};
// src/tui/components/StatusLinePreview.tsx
var import_react18 = __toESM(require_react(), 1);
var jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
var renderSingleLine = (widgets, terminalWidth, settings, lineIndex, globalSeparatorIndex, globalPowerlineThemeIndex, globalPowerlineStartCapIndex, preRenderedWidgets, preCalculatedMaxWidths) => {
  const context = {
    terminalWidth,
    isPreview: true,
    minimalist: settings.minimalistMode,
    gitCacheTtlSeconds: settings.gitCacheTtlSeconds,
    customCommandCacheTtlSeconds: settings.customCommandCacheTtlSeconds,
    lineIndex,
    globalSeparatorIndex,
    globalPowerlineThemeIndex,
    globalPowerlineStartCapIndex
  };
  return renderStatusLineWithInfo(widgets, settings, context, preRenderedWidgets, preCalculatedMaxWidths);
};
var PREVIEW_LINE_INDENT = "  ";
function preparePreviewLineForTerminal(line, terminalWidth) {
  const printableLine = stripOscCodes(line);
  const availableWidth = Math.max(0, terminalWidth - getVisibleWidth(PREVIEW_LINE_INDENT));
  return truncateStyledText(printableLine, availableWidth, { ellipsis: true });
}
var StatusLinePreview = ({ lines, terminalWidth, settings, onTruncationChange }) => {
  const { renderedLines, anyTruncated } = import_react18.default.useMemo(() => {
    if (!settings)
      return { renderedLines: [], anyTruncated: false };
    const preRenderedLines = preRenderAllWidgets(lines, settings, {
      terminalWidth,
      isPreview: true,
      minimalist: settings.minimalistMode,
      gitCacheTtlSeconds: settings.gitCacheTtlSeconds,
      customCommandCacheTtlSeconds: settings.customCommandCacheTtlSeconds
    });
    const preCalculatedMaxWidths = calculateMaxWidthsFromPreRendered(preRenderedLines, settings);
    let globalSeparatorIndex = 0;
    let globalPowerlineThemeIndex = 0;
    let globalPowerlineStartCapIndex = 0;
    const result = [];
    let truncated = false;
    for (let i = 0;i < lines.length; i++) {
      const lineItems = lines[i];
      if (lineItems && lineItems.length > 0) {
        const preRenderedWidgets = preRenderedLines[i] ?? [];
        const renderResult = renderSingleLine(lineItems, terminalWidth, settings, i, globalSeparatorIndex, globalPowerlineThemeIndex, globalPowerlineStartCapIndex, preRenderedWidgets, preCalculatedMaxWidths);
        result.push(renderResult.line);
        if (renderResult.wasTruncated) {
          truncated = true;
        }
        globalSeparatorIndex = advanceGlobalSeparatorIndex(globalSeparatorIndex, lineItems, preRenderedWidgets);
        if (settings.powerline.enabled) {
          globalPowerlineStartCapIndex += countPowerlineStartCapSlots(lineItems, preRenderedWidgets);
        }
        if (settings.powerline.enabled && settings.powerline.continueThemeAcrossLines) {
          globalPowerlineThemeIndex = advanceGlobalPowerlineThemeIndex(globalPowerlineThemeIndex, preRenderedWidgets);
        }
      }
    }
    return { renderedLines: result, anyTruncated: truncated };
  }, [lines, terminalWidth, settings]);
  import_react18.default.useEffect(() => {
    onTruncationChange?.(anyTruncated);
  }, [anyTruncated, onTruncationChange]);
  return /* @__PURE__ */ jsx_runtime19.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime19.jsx(Box_default, {
        borderStyle: "round",
        borderColor: "gray",
        borderDimColor: true,
        width: "100%",
        paddingLeft: 1,
        children: /* @__PURE__ */ jsx_runtime19.jsxs(Text, {
          children: [
            ">",
            /* @__PURE__ */ jsx_runtime19.jsx(Text, {
              dimColor: true,
              children: " Preview  (ctrl+s to save configuration at any time)"
            })
          ]
        })
      }),
      renderedLines.map((line, index) => /* @__PURE__ */ jsx_runtime19.jsxs(Text, {
        wrap: "truncate",
        children: [
          PREVIEW_LINE_INDENT,
          preparePreviewLineForTerminal(line, terminalWidth),
          source_default.reset("")
        ]
      }, index))
    ]
  });
};
// src/tui/components/TerminalOptionsMenu.tsx
var import_react19 = __toESM(require_react(), 1);

// src/utils/color-sanitize.ts
function isCustomColor(value) {
  if (!value) {
    return false;
  }
  return value.startsWith("ansi256:") || value.startsWith("hex:");
}
function isIncompatibleForLevel(value, nextLevel) {
  if (!isCustomColor(value)) {
    return false;
  }
  if (nextLevel === 2) {
    return Boolean(value?.startsWith("hex:"));
  }
  if (nextLevel === 3) {
    return Boolean(value?.startsWith("ansi256:"));
  }
  return true;
}
function resetWidgetForegroundToDefault(widget, nextWidget) {
  if (widget.type === "separator" || widget.type === "flex-separator") {
    return nextWidget;
  }
  const widgetImpl = getWidget(widget.type);
  if (!widgetImpl) {
    return nextWidget;
  }
  return {
    ...nextWidget,
    color: widgetImpl.getDefaultColor()
  };
}
function hasCustomWidgetColors(lines) {
  return lines.some((line) => line.some((widget) => isCustomColor(widget.color) || isCustomColor(widget.backgroundColor)));
}
function sanitizeLinesForColorLevel(lines, nextLevel) {
  return lines.map((line) => line.map((widget) => {
    let nextWidget = { ...widget };
    if (isIncompatibleForLevel(widget.color, nextLevel)) {
      nextWidget = resetWidgetForegroundToDefault(widget, nextWidget);
    }
    if (isIncompatibleForLevel(widget.backgroundColor, nextLevel)) {
      nextWidget = {
        ...nextWidget,
        backgroundColor: undefined
      };
    }
    return nextWidget;
  }));
}

// src/tui/components/TerminalOptionsMenu.tsx
var jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
function getNextColorLevel(level) {
  return (level + 1) % 4;
}
function shouldWarnOnColorLevelChange(currentLevel, nextLevel, hasCustomColors) {
  return hasCustomColors && (currentLevel === 2 && nextLevel !== 2 || currentLevel === 3 && nextLevel !== 3);
}
function buildTerminalOptionsItems(colorLevel) {
  return [
    {
      label: "◱ Terminal Width",
      value: "width",
      description: "Configure how the status line uses available terminal width and when it should compact."
    },
    {
      label: "▓ Color Level",
      sublabel: `(${getColorLevelLabel(colorLevel)})`,
      value: "colorLevel",
      description: [
        "Color level affects how colors are rendered:",
        "• Truecolor: Full 24-bit RGB colors (16.7M colors)",
        "• 256 Color: Extended color palette (256 colors)",
        "• Basic: Standard 16-color terminal palette",
        "• No Color: Disables all color output"
      ].join(`
`)
    }
  ];
}
var TerminalOptionsMenu = ({
  settings,
  onUpdate,
  onBack
}) => {
  const [showColorWarning, setShowColorWarning] = import_react19.useState(false);
  const [pendingColorLevel, setPendingColorLevel] = import_react19.useState(null);
  const handleSelect = (value) => {
    if (value === "back") {
      onBack();
      return;
    }
    if (value === "width") {
      onBack("width");
      return;
    }
    const hasCustomColors = hasCustomWidgetColors(settings.lines);
    const currentLevel = settings.colorLevel;
    const nextLevel = getNextColorLevel(currentLevel);
    if (shouldWarnOnColorLevelChange(currentLevel, nextLevel, hasCustomColors)) {
      setShowColorWarning(true);
      setPendingColorLevel(nextLevel);
      return;
    }
    source_default.level = nextLevel;
    const cleanedLines = sanitizeLinesForColorLevel(settings.lines, nextLevel);
    onUpdate({
      ...settings,
      lines: cleanedLines,
      colorLevel: nextLevel
    });
  };
  const handleColorConfirm = () => {
    if (pendingColorLevel !== null) {
      source_default.level = pendingColorLevel;
      const cleanedLines = sanitizeLinesForColorLevel(settings.lines, pendingColorLevel);
      onUpdate({
        ...settings,
        lines: cleanedLines,
        colorLevel: pendingColorLevel
      });
    }
    setShowColorWarning(false);
    setPendingColorLevel(null);
  };
  const handleColorCancel = () => {
    setShowColorWarning(false);
    setPendingColorLevel(null);
  };
  use_input_default((_, key) => {
    if (key.escape && !showColorWarning) {
      onBack();
    }
  });
  return /* @__PURE__ */ jsx_runtime20.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime20.jsx(Text, {
        bold: true,
        children: "Terminal Options"
      }),
      showColorWarning ? /* @__PURE__ */ jsx_runtime20.jsxs(Box_default, {
        flexDirection: "column",
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_runtime20.jsx(Text, {
            color: "yellow",
            children: "⚠ Warning: Custom colors detected!"
          }),
          /* @__PURE__ */ jsx_runtime20.jsx(Text, {
            children: "Switching color modes will reset custom ansi256 or hex colors to defaults."
          }),
          /* @__PURE__ */ jsx_runtime20.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime20.jsx(ConfirmDialog, {
              message: "Continue?",
              onConfirm: handleColorConfirm,
              onCancel: handleColorCancel,
              inline: true
            })
          })
        ]
      }) : /* @__PURE__ */ jsx_runtime20.jsxs(jsx_runtime20.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime20.jsx(Text, {
            color: "white",
            children: "Configure terminal-specific settings for optimal display"
          }),
          /* @__PURE__ */ jsx_runtime20.jsx(List, {
            marginTop: 1,
            items: buildTerminalOptionsItems(settings.colorLevel),
            onSelect: handleSelect,
            showBackButton: true
          })
        ]
      })
    ]
  });
};
var getColorLevelLabel = (level) => {
  switch (level) {
    case 0:
      return "No Color";
    case 1:
      return "Basic";
    case 2:
    case undefined:
      return "256 Color (default)";
    case 3:
      return "Truecolor";
    default:
      return "256 Color (default)";
  }
};
// src/tui/components/TerminalWidthMenu.tsx
var import_react20 = __toESM(require_react(), 1);
var jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
var TERMINAL_WIDTH_OPTIONS = ["full", "full-minus-40", "full-until-compact"];
function getTerminalWidthSelectionIndex(selectedOption) {
  const selectedIndex = TERMINAL_WIDTH_OPTIONS.indexOf(selectedOption);
  return selectedIndex >= 0 ? selectedIndex : 0;
}
function validateCompactThresholdInput(value) {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    return "Please enter a valid number";
  }
  if (parsedValue < 1 || parsedValue > 99) {
    return `Value must be between 1 and 99 (you entered ${parsedValue})`;
  }
  return null;
}
function buildTerminalWidthItems(selectedOption, compactThreshold) {
  return [
    {
      value: "full",
      label: "Full width always",
      sublabel: selectedOption === "full" ? "(active)" : undefined,
      description: `Uses the full terminal width minus 4 characters for terminal padding. If the auto-compact message appears, it may cause the line to wrap.

NOTE: If /ide integration is enabled, it is not recommended to use this mode.`
    },
    {
      value: "full-minus-40",
      label: "Full width minus 40",
      sublabel: selectedOption === "full-minus-40" ? "(active)" : "(default)",
      description: "Leaves a gap to the right of the status line to accommodate the auto-compact message. This prevents wrapping but may leave unused space. This limitation exists because we cannot detect when the message will appear."
    },
    {
      value: "full-until-compact",
      label: "Full width until compact",
      sublabel: selectedOption === "full-until-compact" ? `(threshold ${compactThreshold}%, active)` : `(threshold ${compactThreshold}%)`,
      description: `Dynamically adjusts width based on context usage. When context reaches ${compactThreshold}%, it switches to leaving space for the auto-compact message.

NOTE: If /ide integration is enabled, it is not recommended to use this mode.`
    }
  ];
}
var TerminalWidthMenu = ({
  settings,
  onUpdate,
  onBack
}) => {
  const [selectedOption, setSelectedOption] = import_react20.useState(settings.flexMode);
  const [compactThreshold, setCompactThreshold] = import_react20.useState(settings.compactThreshold);
  const [editingThreshold, setEditingThreshold] = import_react20.useState(false);
  const [thresholdInput, setThresholdInput] = import_react20.useState(String(settings.compactThreshold));
  const [validationError, setValidationError] = import_react20.useState(null);
  use_input_default((input, key) => {
    if (editingThreshold) {
      if (key.return) {
        const error = validateCompactThresholdInput(thresholdInput);
        if (error) {
          setValidationError(error);
        } else {
          const value = Number.parseInt(thresholdInput, 10);
          setCompactThreshold(value);
          const updatedSettings = {
            ...settings,
            flexMode: selectedOption,
            compactThreshold: value
          };
          onUpdate(updatedSettings);
          setEditingThreshold(false);
          setValidationError(null);
        }
      } else if (key.escape) {
        setThresholdInput(String(compactThreshold));
        setEditingThreshold(false);
        setValidationError(null);
      } else if (key.backspace) {
        setThresholdInput(thresholdInput.slice(0, -1));
        setValidationError(null);
      } else if (key.delete) {} else if (shouldInsertInput(input, key) && /\d/.test(input)) {
        const newValue = thresholdInput + input;
        if (newValue.length <= 2) {
          setThresholdInput(newValue);
          setValidationError(null);
        }
      }
      return;
    }
    if (key.escape) {
      onBack();
    }
  });
  return /* @__PURE__ */ jsx_runtime21.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime21.jsx(Text, {
        bold: true,
        children: "Terminal Width"
      }),
      /* @__PURE__ */ jsx_runtime21.jsx(Text, {
        color: "white",
        children: "These settings affect where long lines are truncated, and where right-alignment occurs when using flex separators"
      }),
      /* @__PURE__ */ jsx_runtime21.jsx(Text, {
        dimColor: true,
        wrap: "wrap",
        children: "Claude code does not currently provide an available width variable for the statusline and features like IDE integration, auto-compaction notices, etc all cause the statusline to wrap if we do not truncate it"
      }),
      editingThreshold ? /* @__PURE__ */ jsx_runtime21.jsxs(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime21.jsxs(Text, {
            children: [
              "Enter compact threshold (1-99):",
              " ",
              thresholdInput,
              "%"
            ]
          }),
          validationError ? /* @__PURE__ */ jsx_runtime21.jsx(Text, {
            color: "red",
            children: validationError
          }) : /* @__PURE__ */ jsx_runtime21.jsx(Text, {
            dimColor: true,
            children: "Press Enter to confirm, ESC to cancel"
          })
        ]
      }) : /* @__PURE__ */ jsx_runtime21.jsx(List, {
        marginTop: 1,
        items: buildTerminalWidthItems(selectedOption, compactThreshold),
        initialSelection: getTerminalWidthSelectionIndex(selectedOption),
        onSelect: (value) => {
          if (value === "back") {
            onBack();
            return;
          }
          setSelectedOption(value);
          const updatedSettings = {
            ...settings,
            flexMode: value,
            compactThreshold
          };
          onUpdate(updatedSettings);
          if (value === "full-until-compact") {
            setEditingThreshold(true);
          }
        },
        showBackButton: true
      })
    ]
  });
};
// src/tui/components/UpdateCheckerMenu.tsx
var jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
function getInstallationLabel2(result) {
  const { installation } = result;
  if (installation.method === "auto-update") {
    return `Auto-update via ${installation.packageManager}`;
  }
  if (installation.method === "pinned") {
    const version = installation.installedVersion ? ` ${installation.installedVersion}` : "";
    const manager = installation.packageManager === "unknown" ? "" : ` via ${installation.packageManager}`;
    return `Pinned global install${manager}${version}`;
  }
  if (installation.method === "self-managed") {
    return "Self-managed/global install";
  }
  return "Unknown or not installed";
}
function getActionLabel(action) {
  return `Run ${action.command}`;
}
function getActionSublabel(action) {
  if (action.available) {
    return;
  }
  return action.packageManager === "npm" ? "(npm not installed)" : "(bun not installed)";
}
function getActionItems(actions) {
  return [
    ...actions.map((action) => ({
      label: getActionLabel(action),
      value: action,
      disabled: !action.available,
      sublabel: getActionSublabel(action)
    })),
    {
      label: "Check again",
      value: "refresh"
    }
  ];
}
var UpdateCheckerMenu = ({
  state,
  onBack,
  onRefresh,
  onRunAction
}) => {
  use_input_default((_, key) => {
    if (key.escape) {
      onBack();
    }
  });
  if (state.status === "checking") {
    return /* @__PURE__ */ jsx_runtime22.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime22.jsx(Text, {
          bold: true,
          children: "Check for Updates"
        }),
        /* @__PURE__ */ jsx_runtime22.jsx(Box_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_runtime22.jsx(Text, {
            dimColor: true,
            children: "Checking npm registry..."
          })
        })
      ]
    });
  }
  return /* @__PURE__ */ jsx_runtime22.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime22.jsx(Text, {
        bold: true,
        children: "Check for Updates"
      }),
      /* @__PURE__ */ jsx_runtime22.jsxs(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime22.jsxs(Text, {
            children: [
              "Current:",
              " ",
              state.currentVersion
            ]
          }),
          state.status !== "registry-failure" && /* @__PURE__ */ jsx_runtime22.jsxs(Text, {
            children: [
              "Latest:",
              " ",
              state.latestVersion
            ]
          }),
          /* @__PURE__ */ jsx_runtime22.jsxs(Text, {
            children: [
              "Install:",
              " ",
              getInstallationLabel2(state)
            ]
          })
        ]
      }),
      state.status === "registry-failure" && /* @__PURE__ */ jsx_runtime22.jsxs(jsx_runtime22.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime22.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime22.jsxs(Text, {
              color: "red",
              children: [
                "Registry check failed:",
                " ",
                state.errorMessage
              ]
            })
          }),
          /* @__PURE__ */ jsx_runtime22.jsx(List, {
            marginTop: 1,
            items: [{ label: "Check again", value: "refresh" }],
            onSelect: (value) => {
              if (value === "back") {
                onBack();
                return;
              }
              onRefresh();
            },
            showBackButton: true
          })
        ]
      }),
      state.status === "up-to-date" && /* @__PURE__ */ jsx_runtime22.jsxs(jsx_runtime22.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime22.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime22.jsx(Text, {
              color: "green",
              children: "ccstatusline is up to date."
            })
          }),
          /* @__PURE__ */ jsx_runtime22.jsx(List, {
            marginTop: 1,
            items: [{ label: "Check again", value: "refresh" }],
            onSelect: (value) => {
              if (value === "back") {
                onBack();
                return;
              }
              onRefresh();
            },
            showBackButton: true
          })
        ]
      }),
      state.status === "update-available" && /* @__PURE__ */ jsx_runtime22.jsxs(jsx_runtime22.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime22.jsx(Box_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_runtime22.jsx(Text, {
              color: "yellow",
              children: "An update is available."
            })
          }),
          state.installation.method === "auto-update" && /* @__PURE__ */ jsx_runtime22.jsxs(Box_default, {
            marginTop: 1,
            flexDirection: "column",
            children: [
              /* @__PURE__ */ jsx_runtime22.jsx(Text, {
                children: "No manual hook change is needed. Claude Code already runs @latest."
              }),
              /* @__PURE__ */ jsx_runtime22.jsx(Text, {
                children: "The next @latest invocation will resolve the latest package."
              }),
              /* @__PURE__ */ jsx_runtime22.jsxs(Text, {
                children: [
                  "Launch command for a fresh TUI:",
                  " ",
                  state.autoUpdateLaunchCommand
                ]
              })
            ]
          }),
          state.actions.length > 0 && /* @__PURE__ */ jsx_runtime22.jsx(List, {
            marginTop: 1,
            items: getActionItems(state.actions),
            onSelect: (value) => {
              if (value === "back") {
                onBack();
                return;
              }
              if (value === "refresh") {
                onRefresh();
                return;
              }
              onRunAction(value);
            },
            showBackButton: true
          }),
          state.actions.length === 0 && /* @__PURE__ */ jsx_runtime22.jsx(List, {
            marginTop: 1,
            items: [{ label: "Check again", value: "refresh" }],
            onSelect: (value) => {
              if (value === "back") {
                onBack();
                return;
              }
              onRefresh();
            },
            showBackButton: true
          })
        ]
      })
    ]
  });
};
// src/tui/App.tsx
var jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
var GITHUB_REPO_URL = "https://github.com/sirmalloc/ccstatusline";
var NOTICE_ITEMS = [
  {
    label: "Continue",
    value: "continue"
  }
];
var FlowNotice = ({
  title,
  message,
  color,
  onContinue
}) => {
  use_input_default((_, key) => {
    if (key.escape) {
      onContinue();
    }
  });
  return /* @__PURE__ */ jsx_runtime23.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime23.jsx(Text, {
        bold: true,
        children: title
      }),
      /* @__PURE__ */ jsx_runtime23.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime23.jsx(Text, {
          color,
          wrap: "wrap",
          children: message
        })
      }),
      /* @__PURE__ */ jsx_runtime23.jsx(List, {
        marginTop: 1,
        items: NOTICE_ITEMS,
        onSelect: () => {
          onContinue();
        },
        color: "cyan"
      })
    ]
  });
};
function getPinnedMismatchItems(mismatch, canRunPackageManager) {
  const items = [];
  if (mismatch.canUpdateToRunningVersion) {
    items.push({
      label: `Update ${mismatch.packageManager} global install to v${mismatch.runningVersion}`,
      value: "update",
      disabled: !canRunPackageManager,
      sublabel: canRunPackageManager ? undefined : `(${mismatch.packageManager} not installed)`,
      description: `Runs ${mismatch.packageManager === "npm" ? `npm install -g ccstatusline@${mismatch.runningVersion}` : `bun add -g ccstatusline@${mismatch.runningVersion}`}`
    });
  }
  items.push({
    label: "Exit",
    value: "exit",
    description: `Relaunch manually with ${mismatch.relaunchCommand}`
  });
  return items;
}
var PinnedVersionMismatchScreen = ({
  mismatch,
  canRunPackageManager,
  updating,
  onUpdate,
  onExit
}) => {
  use_input_default((_, key) => {
    if (key.escape && !updating) {
      onExit();
    }
  });
  return /* @__PURE__ */ jsx_runtime23.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime23.jsx(Text, {
        bold: true,
        children: "Pinned Install Version Mismatch"
      }),
      /* @__PURE__ */ jsx_runtime23.jsxs(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_runtime23.jsxs(Text, {
            color: "yellow",
            children: [
              "Claude Code is pinned to ccstatusline v",
              mismatch.installedVersion,
              ", but this TUI is v",
              mismatch.runningVersion,
              "."
            ]
          }),
          /* @__PURE__ */ jsx_runtime23.jsx(Text, {
            dimColor: true,
            wrap: "wrap",
            children: "To avoid writing config that the pinned runtime may not support, update the pinned global install or exit and relaunch the pinned version."
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime23.jsx(Box_default, {
        marginTop: 1,
        flexDirection: "column",
        children: /* @__PURE__ */ jsx_runtime23.jsxs(Text, {
          children: [
            "Current pinned version:",
            " ",
            mismatch.relaunchCommand
          ]
        })
      }),
      updating ? /* @__PURE__ */ jsx_runtime23.jsx(Box_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_runtime23.jsx(Text, {
          color: "yellow",
          children: `Updating ${mismatch.packageManager} global install to v${mismatch.runningVersion}... This may take a moment.`
        })
      }) : /* @__PURE__ */ jsx_runtime23.jsx(List, {
        marginTop: 1,
        items: getPinnedMismatchItems(mismatch, canRunPackageManager),
        onSelect: (value) => {
          if (value === "back") {
            return;
          }
          if (value === "update") {
            onUpdate();
            return;
          }
          onExit();
        },
        color: "cyan"
      })
    ]
  });
};
function getGlobalUninstallCommand(packageManager) {
  return packageManager === "npm" ? "npm uninstall -g ccstatusline" : "bun remove -g ccstatusline";
}
function buildUninstallConfirmMessage(selection) {
  if (selection.packageManagers.length === 0) {
    return `This will remove ccstatusline from ${getClaudeSettingsPath()}. Continue?`;
  }
  const commands = selection.packageManagers.map((packageManager) => getGlobalUninstallCommand(packageManager)).join(`
`);
  return `This will remove ccstatusline from ${getClaudeSettingsPath()} and run:

${commands}

Continue?`;
}
function clearInstallationMetadata(settings) {
  if (!settings) {
    return settings;
  }
  const { installation, ...next } = settings;
  return next;
}
function getCurrentInstallation(isClaudeInstalled, existingStatusLine, settings) {
  return isClaudeInstalled && !existingStatusLine && settings.installation ? settings.installation : classifyInstallation(existingStatusLine, settings.installation);
}
function trimTrailingSeparators2(filePath) {
  return filePath.replace(/[\\/]+$/, "");
}
function joinCommandPath(dir, command) {
  const separator = dir.includes("\\") && !dir.includes("/") ? "\\" : "/";
  return `${trimTrailingSeparators2(dir)}${separator}${command}`;
}
function getCommandFileName(globalBinDir, platform) {
  if (platform === "win32" || /^[a-z]:[\\/]/i.test(globalBinDir)) {
    return "ccstatusline.cmd";
  }
  return "ccstatusline";
}
function getPinnedGlobalRelaunchCommand(packageManager) {
  const resolution = inspectGlobalCommandResolution(packageManager);
  if (resolution.firstResolvedPath && (!resolution.expectedBinDir || isPathInsideDir(resolution.firstResolvedPath, resolution.expectedBinDir))) {
    return resolution.firstResolvedPath;
  }
  if (resolution.expectedBinDir) {
    return joinCommandPath(resolution.expectedBinDir, getCommandFileName(resolution.expectedBinDir, process.platform));
  }
  return "ccstatusline";
}
function getPinnedVersionMismatch(installation, runningVersion, relaunchCommand, versionInstalledThisSession = null) {
  if (installation.method !== "pinned" || !installation.installedVersion || installation.packageManager === "unknown" || !runningVersion || installation.installedVersion === runningVersion || installation.installedVersion === versionInstalledThisSession) {
    return null;
  }
  return {
    packageManager: installation.packageManager,
    installedVersion: installation.installedVersion,
    runningVersion,
    relaunchCommand,
    canUpdateToRunningVersion: compareVersions(runningVersion, installation.installedVersion) > 0
  };
}
function getPathInferredInstallation(installation, activeCommand) {
  if (installation.method === "pinned") {
    return {
      ...installation,
      packageManager: activeCommand?.packageManager ?? "unknown",
      installedVersion: activeCommand?.version ?? installation.installedVersion
    };
  }
  if (activeCommand && activeCommand.packageManager !== "unknown" && installation.method === "self-managed") {
    return {
      ...installation,
      packageManager: activeCommand.packageManager
    };
  }
  return installation;
}
function getConfirmCancelScreen(confirmDialog) {
  return confirmDialog?.cancelScreen ?? "main";
}
function applyTuiImport(current, imported, mode, presentKeys) {
  const nextSettings = applyImport(current, imported, mode, presentKeys);
  source_default.level = nextSettings.colorLevel;
  return nextSettings;
}
function clearInstallMenuSelection(menuSelections) {
  if (menuSelections.install === undefined && menuSelections.installPackage === undefined) {
    return menuSelections;
  }
  const next = { ...menuSelections };
  delete next.install;
  delete next.installPackage;
  return next;
}
function buildConfigLoadWarning(configLoadError) {
  if (!configLoadError) {
    return null;
  }
  return `⚠ ${configLoadError} — showing defaults; saving here overwrites the file.`;
}
function buildInvalidConfigSaveConfirm(configLoadError, onConfirm, returnScreen = "main") {
  if (!configLoadError) {
    return null;
  }
  return {
    message: `${configLoadError} and is preserved on disk. Saving replaces it with the current configuration. Continue?`,
    action: () => {
      onConfirm();
      return Promise.resolve();
    },
    cancelScreen: returnScreen
  };
}
var App = () => {
  const { exit } = use_app_default();
  const [settings, setSettings] = import_react21.useState(null);
  const [originalSettings, setOriginalSettings] = import_react21.useState(null);
  const [hasChanges, setHasChanges] = import_react21.useState(false);
  const [configLoadError, setConfigLoadError] = import_react21.useState(null);
  const [screen, setScreen] = import_react21.useState("main");
  const [selectedLine, setSelectedLine] = import_react21.useState(0);
  const [menuSelections, setMenuSelections] = import_react21.useState({});
  const [confirmDialog, setConfirmDialog] = import_react21.useState(null);
  const [isClaudeInstalled, setIsClaudeInstalled] = import_react21.useState(false);
  const [terminalWidth, setTerminalWidth] = import_react21.useState(process.stdout.columns || 80);
  const [powerlineFontStatus, setPowerlineFontStatus] = import_react21.useState({ installed: false });
  const [installingFonts, setInstallingFonts] = import_react21.useState(false);
  const [fontInstallMessage, setFontInstallMessage] = import_react21.useState(null);
  const [existingStatusLine, setExistingStatusLine] = import_react21.useState(null);
  const [flashMessage, setFlashMessage] = import_react21.useState(null);
  const [previewIsTruncated, setPreviewIsTruncated] = import_react21.useState(false);
  const [currentRefreshInterval, setCurrentRefreshInterval] = import_react21.useState(null);
  const [supportsRefreshInterval] = import_react21.useState(() => isClaudeCodeVersionAtLeast("2.1.97"));
  const [commandAvailability] = import_react21.useState(() => getPackageCommandAvailability());
  const [updateCheckerState, setUpdateCheckerState] = import_react21.useState({ status: "checking" });
  const [flowNotice, setFlowNotice] = import_react21.useState(null);
  const [globalPackageInstallations, setGlobalPackageInstallations] = import_react21.useState([]);
  const [updatesReturnScreen, setUpdatesReturnScreen] = import_react21.useState("main");
  const [versionInstalledThisSession, setVersionInstalledThisSession] = import_react21.useState(null);
  const [hasLoadedClaudeStatus, setHasLoadedClaudeStatus] = import_react21.useState(false);
  const [hasLoadedInstalledState, setHasLoadedInstalledState] = import_react21.useState(false);
  const [importValidation, setImportValidation] = import_react21.useState(null);
  const [actionInFlight, setActionInFlight] = import_react21.useState(false);
  const actionInFlightRef = import_react21.useRef(false);
  import_react21.useEffect(() => {
    loadClaudeStatusLineState().then((statusLineState) => {
      setExistingStatusLine(statusLineState.existingStatusLine);
      setCurrentRefreshInterval(statusLineState.refreshInterval);
    }).catch(() => {
      setExistingStatusLine(null);
      setCurrentRefreshInterval(null);
    }).finally(() => {
      setHasLoadedClaudeStatus(true);
    });
    loadSettings().then((loadedSettings) => {
      source_default.level = loadedSettings.colorLevel;
      setSettings(loadedSettings);
      setOriginalSettings(cloneSettings(loadedSettings));
      setConfigLoadError(getConfigLoadError());
    });
    isInstalled().then(setIsClaudeInstalled).catch(() => {
      setIsClaudeInstalled(false);
    }).finally(() => {
      setHasLoadedInstalledState(true);
    });
    const fontStatus = checkPowerlineFonts();
    setPowerlineFontStatus(fontStatus);
    checkPowerlineFontsAsync().then((asyncStatus) => {
      setPowerlineFontStatus(asyncStatus);
    });
    const handleResize = () => {
      setTerminalWidth(process.stdout.columns || 80);
    };
    process.stdout.on("resize", handleResize);
    return () => {
      process.stdout.off("resize", handleResize);
    };
  }, []);
  import_react21.useEffect(() => {
    if (originalSettings) {
      const hasAnyChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasChanges(hasAnyChanges);
    }
  }, [settings, originalSettings]);
  import_react21.useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 2000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [flashMessage]);
  use_input_default((input, key) => {
    if (key.ctrl && input === "c") {
      exit();
    }
    if (key.ctrl && input === "s" && settings && screen !== "confirm") {
      const installation = getCurrentInstallation(isClaudeInstalled, existingStatusLine, settings);
      const activeCommand = installation.method === "pinned" || installation.method === "self-managed" ? inspectActiveGlobalCommand({ commandAvailability }) : null;
      const effectiveInstallation = getPathInferredInstallation(installation, activeCommand);
      const mismatch = getPinnedVersionMismatch(effectiveInstallation, getPackageVersion(), "ccstatusline", versionInstalledThisSession);
      if (mismatch) {
        return;
      }
      const performSave = () => {
        (async () => {
          try {
            await saveSettings(settings);
            setOriginalSettings(cloneSettings(settings));
            setHasChanges(false);
            setConfigLoadError(null);
            setFlashMessage({
              text: "✓ Configuration saved",
              color: "green"
            });
          } catch {
            setFlashMessage({
              text: "✗ Could not save configuration",
              color: "red"
            });
          }
        })();
      };
      const returnScreen = screen;
      const saveGuard = buildInvalidConfigSaveConfirm(configLoadError, () => {
        setConfirmDialog(null);
        setScreen(returnScreen);
        performSave();
      }, returnScreen);
      if (saveGuard) {
        setConfirmDialog(saveGuard);
        setScreen("confirm");
      } else {
        performSave();
      }
    }
  });
  const getGlobalResolutionWarning = import_react21.useCallback((packageManager) => inspectGlobalCommandResolution(packageManager).warning, []);
  const handleInstallSelection = import_react21.useCallback((selection) => {
    getExistingStatusLine().then((existing) => {
      const isAlreadyInstalled = isKnownCommand(existing ?? "");
      const finalCommand = buildStatusLineCommand(selection.commandMode);
      const hookCommand = `${finalCommand} --hook`;
      const sideEffects = [
        `Claude settings path: ${getClaudeSettingsPath()}`,
        ...selection.globalInstallCommand ? [`Global install command before settings write: ${selection.globalInstallCommand}`] : [],
        `Final statusLine.command: ${finalCommand}`,
        `Hook command behavior: hook-enabled widgets run ${hookCommand}`
      ];
      let message = sideEffects.join(`
`);
      if (existing && !isAlreadyInstalled) {
        message = `A status line is already configured: "${existing}"

${message}

Replace it?`;
      } else if (isAlreadyInstalled) {
        message = `ccstatusline is already installed.

${message}

Update it?`;
      } else {
        message = `${message}

Continue?`;
      }
      setConfirmDialog({
        message,
        cancelScreen: "install",
        action: async () => {
          try {
            if (selection.globalInstallCommand) {
              await runGlobalPackageInstall(selection.packageManager, getPackageVersion());
            }
            await installStatusLine({
              commandMode: selection.commandMode,
              supportsRefreshInterval,
              installationMetadata: selection.metadata
            });
            setConfigLoadError(getConfigLoadError());
            const installedStatusLineState = await loadClaudeStatusLineState();
            setIsClaudeInstalled(true);
            setExistingStatusLine(installedStatusLineState.existingStatusLine ?? finalCommand);
            setCurrentRefreshInterval(installedStatusLineState.refreshInterval);
            setSettings((prev) => prev ? { ...prev, installation: selection.metadata } : prev);
            setOriginalSettings((prev) => prev ? { ...prev, installation: selection.metadata } : prev);
            setMenuSelections((prev) => ({
              ...prev,
              main: getMainMenuInstallSelectionIndex(true, selection.metadata)
            }));
            const resolutionWarning = selection.globalInstallCommand ? getGlobalResolutionWarning(selection.packageManager) : null;
            if (resolutionWarning) {
              setFlashMessage(null);
              setFlowNotice({
                title: "Install Complete",
                message: `Installed to Claude Code.

${resolutionWarning}`,
                color: "yellow",
                continueScreen: "main"
              });
              setScreen("flowNotice");
            } else {
              setScreen("main");
              setFlashMessage({
                text: "✓ Installed to Claude Code",
                color: "green"
              });
            }
          } catch (err) {
            setFlashMessage(null);
            setFlowNotice({
              title: "Install Failed",
              message: err instanceof Error ? err.message : String(err),
              color: "red",
              continueScreen: "install"
            });
            setScreen("flowNotice");
          }
          setConfirmDialog(null);
        }
      });
      setScreen("confirm");
    });
  }, [getGlobalResolutionWarning, supportsRefreshInterval]);
  const handleInstallMenuCancel = import_react21.useCallback(() => {
    setMenuSelections(clearInstallMenuSelection);
    setScreen("main");
  }, []);
  const handleUpdateCheck = import_react21.useCallback(() => {
    setUpdateCheckerState({ status: "checking" });
    const installation = settings ? getCurrentInstallation(isClaudeInstalled, existingStatusLine, settings) : classifyInstallation(existingStatusLine, undefined);
    const activeCommand = installation.method === "pinned" || installation.method === "self-managed" ? inspectActiveGlobalCommand({ commandAvailability }) : null;
    const effectiveUpdateInstallation = getPathInferredInstallation(installation, activeCommand);
    const currentUpdateVersion = effectiveUpdateInstallation.method === "pinned" && effectiveUpdateInstallation.installedVersion ? effectiveUpdateInstallation.installedVersion : getPackageVersion();
    checkForUpdates({
      currentVersion: currentUpdateVersion,
      installedCommand: existingStatusLine,
      installationMetadata: effectiveUpdateInstallation,
      commandAvailability
    }).then(setUpdateCheckerState);
  }, [commandAvailability, existingStatusLine, isClaudeInstalled, settings]);
  const handleRunUpdateAction = import_react21.useCallback((action) => {
    setConfirmDialog({
      message: `Run global update command?

${action.command}

Claude settings will not be changed.`,
      cancelScreen: "updates",
      action: async () => {
        try {
          await runGlobalUpdateAction(action);
          setVersionInstalledThisSession(action.version);
          const installation = {
            method: "pinned",
            installedVersion: action.version
          };
          await saveInstallationMetadata(installation);
          setConfigLoadError(getConfigLoadError());
          setSettings((prev) => prev ? { ...prev, installation } : prev);
          setOriginalSettings((prev) => prev ? { ...prev, installation } : prev);
          const resolutionWarning = getGlobalResolutionWarning(action.packageManager);
          if (resolutionWarning) {
            setFlashMessage(null);
            setFlowNotice({
              title: "Update Complete",
              message: `Global package updated.

${resolutionWarning}`,
              color: "yellow",
              continueScreen: "updates"
            });
            setScreen("flowNotice");
          } else {
            setFlashMessage({
              text: "✓ Global package updated",
              color: "green"
            });
            setScreen("updates");
          }
        } catch {
          setFlashMessage({
            text: "✗ Global update failed",
            color: "red"
          });
          setScreen("updates");
        }
        setConfirmDialog(null);
      }
    });
    setScreen("confirm");
  }, [getGlobalResolutionWarning]);
  const handleExportConfig = import_react21.useCallback(async (filePath) => {
    try {
      if (!settings) {
        return;
      }
      await exportConfig(settings, filePath);
      setFlashMessage({ text: `Config exported to ${filePath}`, color: "green" });
    } catch (err) {
      setFlowNotice({
        title: "Export Failed",
        message: err instanceof Error ? err.message : String(err),
        color: "red",
        continueScreen: "main"
      });
      setScreen("flowNotice");
      return;
    }
    setScreen("main");
  }, [settings]);
  const handleImportFileChosen = import_react21.useCallback(async (filePath) => {
    const result = await validateImportFile(filePath);
    if (result.status === "invalid") {
      setFlowNotice({
        title: "Import Failed",
        message: result.reason,
        color: "red",
        continueScreen: "main"
      });
      setScreen("flowNotice");
    } else {
      setImportValidation(result);
      setScreen("importPreview");
    }
  }, []);
  const handleImportApply = import_react21.useCallback((mode) => {
    if (!settings || importValidation?.status !== "valid") {
      return;
    }
    const importedSettings = applyTuiImport(settings, importValidation.data, mode, importValidation.presentKeys);
    setSettings(importedSettings);
    setHasChanges(true);
    setImportValidation(null);
    setFlashMessage({ text: "Config imported — review and save", color: "green" });
    setScreen("main");
  }, [importValidation, settings]);
  if (!settings || !hasLoadedClaudeStatus || !hasLoadedInstalledState) {
    return /* @__PURE__ */ jsx_runtime23.jsx(Text, {
      children: "Loading settings..."
    });
  }
  const runningVersion = getPackageVersion();
  const currentInstallation = getCurrentInstallation(isClaudeInstalled, existingStatusLine, settings);
  const activeGlobalCommand = currentInstallation.method === "pinned" || currentInstallation.method === "self-managed" ? inspectActiveGlobalCommand({ commandAvailability }) : null;
  const effectiveInstallation = getPathInferredInstallation(currentInstallation, activeGlobalCommand);
  const pinnedVersionMismatch = effectiveInstallation.method === "pinned" && effectiveInstallation.packageManager !== "unknown" ? getPinnedVersionMismatch(effectiveInstallation, runningVersion, getPinnedGlobalRelaunchCommand(effectiveInstallation.packageManager), versionInstalledThisSession) : null;
  const runActionOnce = (action) => {
    if (actionInFlightRef.current) {
      return;
    }
    actionInFlightRef.current = true;
    setActionInFlight(true);
    action().finally(() => {
      actionInFlightRef.current = false;
      setActionInFlight(false);
    });
  };
  const handlePinnedVersionMismatchUpdate = async (mismatch) => {
    try {
      await runGlobalPackageInstall(mismatch.packageManager, mismatch.runningVersion);
      const installation = {
        method: "pinned",
        installedVersion: mismatch.runningVersion
      };
      await saveInstallationMetadata(installation);
      setConfigLoadError(getConfigLoadError());
      setSettings((prev) => prev ? { ...prev, installation } : prev);
      setOriginalSettings((prev) => prev ? { ...prev, installation } : prev);
      const resolutionWarning = getGlobalResolutionWarning(mismatch.packageManager);
      if (resolutionWarning) {
        setFlashMessage(null);
        setFlowNotice({
          title: "Update Complete",
          message: `Global package updated.

${resolutionWarning}`,
          color: "yellow",
          continueScreen: "main"
        });
        setScreen("flowNotice");
      } else {
        setFlashMessage({
          text: "✓ Global package updated",
          color: "green"
        });
        setScreen("main");
      }
    } catch {
      setFlashMessage({
        text: "✗ Global update failed",
        color: "red"
      });
    }
  };
  const handleUninstallSelection = (selection, cancelScreen) => {
    setConfirmDialog({
      message: buildUninstallConfirmMessage(selection),
      cancelScreen,
      action: async () => {
        let removedClaudeSettings = false;
        try {
          await uninstallStatusLine();
          setConfigLoadError(getConfigLoadError());
          removedClaudeSettings = true;
          for (const packageManager of selection.packageManagers) {
            await runGlobalPackageUninstall(packageManager);
          }
          setIsClaudeInstalled(false);
          setExistingStatusLine(null);
          setCurrentRefreshInterval(null);
          setSettings(clearInstallationMetadata);
          setOriginalSettings(clearInstallationMetadata);
          setMenuSelections((prev) => ({
            ...prev,
            main: getMainMenuInstallSelectionIndex(false)
          }));
          setFlashMessage({
            text: selection.packageManagers.length > 0 ? "✓ Uninstalled from Claude Code and removed global package" : "✓ Uninstalled from Claude Code",
            color: "green"
          });
          setScreen("main");
        } catch {
          if (removedClaudeSettings) {
            setIsClaudeInstalled(false);
            setExistingStatusLine(null);
            setCurrentRefreshInterval(null);
            setSettings(clearInstallationMetadata);
            setOriginalSettings(clearInstallationMetadata);
            setMenuSelections((prev) => ({
              ...prev,
              main: getMainMenuInstallSelectionIndex(false)
            }));
            setFlashMessage({
              text: "✗ Removed Claude settings, but global package removal failed",
              color: "red"
            });
            setScreen("main");
          } else {
            setFlashMessage({
              text: "✗ Uninstall failed",
              color: "red"
            });
            setScreen(cancelScreen);
          }
        }
        setConfirmDialog(null);
      }
    });
    setScreen("confirm");
  };
  const handleInstallUninstall = () => {
    if (isClaudeInstalled) {
      handleUninstallSelection({ packageManagers: [] }, "main");
    } else {
      setScreen("install");
    }
  };
  const handleManageInstallationSelect = (action) => {
    if (action === "checkUpdates") {
      setUpdatesReturnScreen("manageInstallation");
      setScreen("updates");
      handleUpdateCheck();
      return;
    }
    setGlobalPackageInstallations(inspectGlobalPackageInstallations({ commandAvailability }));
    setScreen("uninstallOptions");
  };
  const handleMainMenuSelect = async (value) => {
    switch (value) {
      case "lines":
        setScreen("lines");
        break;
      case "colors":
        setScreen("colorLines");
        break;
      case "terminalConfig":
        setScreen("terminalConfig");
        break;
      case "globalOverrides":
        setScreen("globalOverrides");
        break;
      case "powerline":
        setScreen("powerline");
        break;
      case "install":
        handleInstallUninstall();
        break;
      case "manageInstallation":
        setScreen("manageInstallation");
        break;
      case "checkUpdates":
        setUpdatesReturnScreen("main");
        setScreen("updates");
        handleUpdateCheck();
        break;
      case "configureStatusLine":
        setScreen("refreshInterval");
        break;
      case "exportConfig":
        setScreen("exportConfig");
        break;
      case "importConfig":
        setScreen("importConfig");
        break;
      case "starGithub":
        setConfirmDialog({
          message: `Open the ccstatusline GitHub repository in your browser?

${GITHUB_REPO_URL}`,
          action: () => {
            const result = openExternalUrl(GITHUB_REPO_URL);
            if (result.success) {
              setFlashMessage({
                text: "✓ Opened GitHub repository in browser",
                color: "green"
              });
            } else {
              setFlashMessage({
                text: `✗ Could not open browser. Visit: ${GITHUB_REPO_URL}`,
                color: "red"
              });
            }
            setScreen("main");
            setConfirmDialog(null);
            return Promise.resolve();
          }
        });
        setScreen("confirm");
        break;
      case "save": {
        const saveAndExit = async () => {
          try {
            await saveSettings(settings);
            setOriginalSettings(cloneSettings(settings));
            setHasChanges(false);
            exit();
          } catch {
            setFlashMessage({
              text: "✗ Could not save configuration",
              color: "red"
            });
          }
        };
        const saveGuard = buildInvalidConfigSaveConfirm(configLoadError, () => {
          setConfirmDialog(null);
          setScreen("main");
          saveAndExit();
        });
        if (saveGuard) {
          setConfirmDialog(saveGuard);
          setScreen("confirm");
        } else {
          await saveAndExit();
        }
        break;
      }
      case "exit":
        exit();
        break;
    }
  };
  if (pinnedVersionMismatch) {
    return /* @__PURE__ */ jsx_runtime23.jsxs(Box_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_runtime23.jsxs(Box_default, {
          marginBottom: 1,
          children: [
            /* @__PURE__ */ jsx_runtime23.jsx(Text, {
              bold: true,
              children: /* @__PURE__ */ jsx_runtime23.jsx(dist_default2, {
                name: "retro",
                children: "CCStatusline Configuration"
              })
            }),
            /* @__PURE__ */ jsx_runtime23.jsx(Text, {
              bold: true,
              children: ` | ${runningVersion && `v${runningVersion}`}`
            }),
            flashMessage && /* @__PURE__ */ jsx_runtime23.jsx(Text, {
              color: flashMessage.color,
              bold: true,
              children: `  ${flashMessage.text}`
            })
          ]
        }),
        /* @__PURE__ */ jsx_runtime23.jsx(PinnedVersionMismatchScreen, {
          mismatch: pinnedVersionMismatch,
          canRunPackageManager: commandAvailability[pinnedVersionMismatch.packageManager],
          updating: actionInFlight,
          onUpdate: () => {
            runActionOnce(() => handlePinnedVersionMismatchUpdate(pinnedVersionMismatch));
          },
          onExit: exit
        })
      ]
    });
  }
  const updateLine = (lineIndex, widgets) => {
    const newLines = [...settings.lines];
    newLines[lineIndex] = widgets;
    setSettings({ ...settings, lines: newLines });
  };
  const updateLines = (newLines) => {
    setSettings({ ...settings, lines: newLines });
  };
  const handleLineSelect = (lineIndex) => {
    setSelectedLine(lineIndex);
    setScreen("items");
  };
  const configWarning = buildConfigLoadWarning(configLoadError);
  return /* @__PURE__ */ jsx_runtime23.jsxs(Box_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_runtime23.jsxs(Box_default, {
        marginBottom: 1,
        children: [
          /* @__PURE__ */ jsx_runtime23.jsx(Text, {
            bold: true,
            children: /* @__PURE__ */ jsx_runtime23.jsx(dist_default2, {
              name: "retro",
              children: "CCStatusline Configuration"
            })
          }),
          /* @__PURE__ */ jsx_runtime23.jsx(Text, {
            bold: true,
            children: ` | ${runningVersion && `v${runningVersion}`}`
          }),
          flashMessage && /* @__PURE__ */ jsx_runtime23.jsx(Text, {
            color: flashMessage.color,
            bold: true,
            children: `  ${flashMessage.text}`
          })
        ]
      }),
      configWarning && /* @__PURE__ */ jsx_runtime23.jsx(Text, {
        color: "red",
        wrap: "wrap",
        children: configWarning
      }),
      isCustomConfigPath() && /* @__PURE__ */ jsx_runtime23.jsx(Text, {
        dimColor: true,
        children: `Config: ${getConfigPath()}`
      }),
      /* @__PURE__ */ jsx_runtime23.jsx(StatusLinePreview, {
        lines: settings.lines,
        terminalWidth,
        settings,
        onTruncationChange: setPreviewIsTruncated
      }),
      /* @__PURE__ */ jsx_runtime23.jsxs(Box_default, {
        marginTop: 1,
        children: [
          screen === "main" && /* @__PURE__ */ jsx_runtime23.jsx(MainMenu, {
            onSelect: (value, index) => {
              if (value !== "save" && value !== "exit") {
                setMenuSelections((prev) => ({ ...prev, main: index }));
              }
              handleMainMenuSelect(value);
            },
            isClaudeInstalled,
            hasChanges,
            initialSelection: menuSelections.main,
            powerlineFontStatus,
            settings,
            installation: effectiveInstallation,
            previewIsTruncated
          }),
          screen === "lines" && /* @__PURE__ */ jsx_runtime23.jsx(LineSelector, {
            lines: settings.lines,
            onSelect: (line) => {
              setMenuSelections((prev) => ({ ...prev, lines: line }));
              handleLineSelect(line);
            },
            onLinesUpdate: updateLines,
            onBack: () => {
              setMenuSelections((prev) => ({ ...prev, main: 0 }));
              setScreen("main");
            },
            initialSelection: menuSelections.lines,
            title: "Select Line to Edit Items",
            allowEditing: true
          }),
          screen === "items" && /* @__PURE__ */ jsx_runtime23.jsx(ItemsEditor, {
            widgets: settings.lines[selectedLine] ?? [],
            onUpdate: (widgets) => {
              updateLine(selectedLine, widgets);
            },
            onBack: () => {
              setMenuSelections((prev) => ({ ...prev, lines: selectedLine }));
              setScreen("lines");
            },
            lineNumber: selectedLine + 1,
            settings
          }),
          screen === "colorLines" && /* @__PURE__ */ jsx_runtime23.jsx(LineSelector, {
            lines: settings.lines,
            onLinesUpdate: updateLines,
            onSelect: (line) => {
              setMenuSelections((prev) => ({ ...prev, lines: line }));
              setSelectedLine(line);
              setScreen("colors");
            },
            onBack: () => {
              setMenuSelections((prev) => ({ ...prev, main: 1 }));
              setScreen("main");
            },
            initialSelection: menuSelections.lines,
            title: "Select Line to Edit Colors",
            blockIfPowerlineActive: true,
            settings,
            allowEditing: false
          }),
          screen === "colors" && /* @__PURE__ */ jsx_runtime23.jsx(ColorMenu, {
            widgets: settings.lines[selectedLine] ?? [],
            lineIndex: selectedLine,
            settings,
            onUpdate: (updatedWidgets) => {
              const newLines = [...settings.lines];
              newLines[selectedLine] = updatedWidgets;
              setSettings({ ...settings, lines: newLines });
            },
            onBack: () => {
              setScreen("colorLines");
            }
          }),
          screen === "terminalConfig" && /* @__PURE__ */ jsx_runtime23.jsx(TerminalOptionsMenu, {
            settings,
            onUpdate: (updatedSettings) => {
              setSettings(updatedSettings);
            },
            onBack: (target) => {
              if (target === "width") {
                setScreen("terminalWidth");
              } else {
                setMenuSelections((prev) => ({ ...prev, main: 3 }));
                setScreen("main");
              }
            }
          }),
          screen === "terminalWidth" && /* @__PURE__ */ jsx_runtime23.jsx(TerminalWidthMenu, {
            settings,
            onUpdate: (updatedSettings) => {
              setSettings(updatedSettings);
            },
            onBack: () => {
              setScreen("terminalConfig");
            }
          }),
          screen === "globalOverrides" && /* @__PURE__ */ jsx_runtime23.jsx(GlobalOverridesMenu, {
            settings,
            onUpdate: (updatedSettings) => {
              setSettings(updatedSettings);
            },
            onBack: () => {
              setMenuSelections((prev) => ({ ...prev, main: 4 }));
              setScreen("main");
            }
          }),
          screen === "confirm" && confirmDialog && /* @__PURE__ */ jsx_runtime23.jsx(ConfirmDialog, {
            message: confirmDialog.message,
            busy: actionInFlight,
            onConfirm: () => {
              runActionOnce(confirmDialog.action);
            },
            onCancel: () => {
              setScreen(getConfirmCancelScreen(confirmDialog));
              setConfirmDialog(null);
            }
          }),
          screen === "flowNotice" && flowNotice && /* @__PURE__ */ jsx_runtime23.jsx(FlowNotice, {
            ...flowNotice,
            onContinue: () => {
              setScreen(flowNotice.continueScreen);
              setFlowNotice(null);
            }
          }),
          screen === "install" && /* @__PURE__ */ jsx_runtime23.jsx(InstallMenu, {
            commandAvailability,
            currentVersion: getPackageVersion(),
            existingStatusLine,
            onSelect: (selection) => {
              setMenuSelections((prev) => ({
                ...prev,
                installPackage: selection.packageManager === "bun" ? 1 : 0
              }));
              handleInstallSelection(selection);
            },
            onCancel: handleInstallMenuCancel,
            initialPackageSelection: menuSelections.installPackage
          }),
          screen === "manageInstallation" && /* @__PURE__ */ jsx_runtime23.jsx(ManageInstallationMenu, {
            installation: effectiveInstallation,
            activeCommand: activeGlobalCommand,
            onSelect: handleManageInstallationSelect,
            onBack: () => {
              setMenuSelections((prev) => ({
                ...prev,
                main: getMainMenuInstallSelectionIndex(true, effectiveInstallation)
              }));
              setScreen("main");
            }
          }),
          screen === "uninstallOptions" && /* @__PURE__ */ jsx_runtime23.jsx(UninstallMenu, {
            installations: globalPackageInstallations,
            onSelect: (selection) => {
              handleUninstallSelection(selection, "uninstallOptions");
            },
            onBack: () => {
              setScreen("manageInstallation");
            }
          }),
          screen === "updates" && /* @__PURE__ */ jsx_runtime23.jsx(UpdateCheckerMenu, {
            state: updateCheckerState,
            onBack: () => {
              setScreen(updatesReturnScreen);
            },
            onRefresh: handleUpdateCheck,
            onRunAction: handleRunUpdateAction
          }),
          screen === "refreshInterval" && /* @__PURE__ */ jsx_runtime23.jsx(RefreshIntervalMenu, {
            currentInterval: currentRefreshInterval,
            supportsRefreshInterval,
            gitCacheTtlSeconds: settings.gitCacheTtlSeconds,
            terminalWidthCacheTtlSeconds: settings.terminalWidthCacheTtlSeconds,
            customCommandCacheTtlSeconds: settings.customCommandCacheTtlSeconds,
            onUpdate: (interval) => {
              const previous = currentRefreshInterval;
              setCurrentRefreshInterval(interval);
              setRefreshInterval(interval).then(() => {
                setFlashMessage({
                  text: "✓ Refresh interval updated",
                  color: "green"
                });
              }).catch(() => {
                setCurrentRefreshInterval(previous);
                setFlashMessage({
                  text: "✗ Failed to save refresh interval",
                  color: "red"
                });
              });
              setScreen("main");
            },
            onGitCacheTtlUpdate: (ttlSeconds) => {
              setSettings({
                ...settings,
                gitCacheTtlSeconds: ttlSeconds
              });
              setFlashMessage({
                text: "✓ Git cache TTL updated",
                color: "green"
              });
              setScreen("main");
            },
            onTerminalWidthCacheTtlUpdate: (ttlSeconds) => {
              setSettings({
                ...settings,
                terminalWidthCacheTtlSeconds: ttlSeconds
              });
              setFlashMessage({
                text: "✓ Terminal Width cache TTL updated",
                color: "green"
              });
              setScreen("main");
            },
            onCustomCommandCacheTtlUpdate: (ttlSeconds) => {
              setSettings({
                ...settings,
                customCommandCacheTtlSeconds: ttlSeconds
              });
              setFlashMessage({
                text: "✓ Custom command cache TTL updated",
                color: "green"
              });
              setScreen("main");
            },
            onBack: () => {
              setScreen("main");
            }
          }),
          screen === "powerline" && /* @__PURE__ */ jsx_runtime23.jsx(PowerlineSetup, {
            settings,
            powerlineFontStatus,
            onUpdate: (updatedSettings) => {
              setSettings(updatedSettings);
            },
            onBack: () => {
              setScreen("main");
            },
            onInstallFonts: () => {
              setInstallingFonts(true);
              setTimeout(() => {
                installPowerlineFonts().then((result) => {
                  setInstallingFonts(false);
                  setFontInstallMessage(result.message);
                  checkPowerlineFontsAsync().then((asyncStatus) => {
                    setPowerlineFontStatus(asyncStatus);
                  });
                });
              }, 50);
            },
            installingFonts,
            fontInstallMessage,
            onClearMessage: () => {
              setFontInstallMessage(null);
            }
          }),
          screen === "exportConfig" && /* @__PURE__ */ jsx_runtime23.jsx(ExportConfigDialog, {
            onExport: (filePath) => {
              handleExportConfig(filePath);
            },
            onCancel: () => {
              setScreen("main");
            }
          }),
          screen === "importConfig" && /* @__PURE__ */ jsx_runtime23.jsx(ImportConfigDialog, {
            onFileChosen: (filePath) => {
              handleImportFileChosen(filePath);
            },
            onCancel: () => {
              setScreen("main");
            }
          }),
          screen === "importPreview" && importValidation?.status === "valid" && /* @__PURE__ */ jsx_runtime23.jsx(ImportPreviewDialog, {
            validation: importValidation,
            currentSettings: settings,
            onApply: (mode) => {
              handleImportApply(mode);
            },
            onCancel: () => {
              setImportValidation(null);
              setScreen("main");
            }
          })
        ]
      })
    ]
  });
};
function runTUI() {
  process.stdout.write("\x1B[2J\x1B[H");
  render_default(/* @__PURE__ */ jsx_runtime23.jsx(App, {}));
}
export {
  runTUI
};
