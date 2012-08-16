(function ($, window, document) {

"use strict";

var DEFAULTS = {
  callback: null,
  finish: null
};

var DEFAULT_CSS = {
  position: 'absolute',
  top: '0',
  left: '0',
  display: 'block',
  visibility: 'hidden'
};

var instance = {};

var dup_property = ['font-family', 'font-style', 'font-variant', 'font-weight', 'font-size', 'font-size-adjust', 'font-stretch', 'word-spacing', 'letter-spacing', 'text-decoration', 'text-transform', 'line-height'];

var init = function (_i, elm, opts, ns) {
  var inst = instance[ns];
  var $measure, i, hinge_index, fragment;
  var $elm = $(elm);
  var width = $elm.width();
  var text = $.trim($elm.text());
  var len = text.length;
  var arr = [];
  var hinges = [0];
  var isCallback = typeof opts.callback === 'function';
  var isFinish = typeof opts.finish === 'function';

  if (!inst.measure) {
    inst.measure = createMeasure(elm);
    document.body.appendChild(inst.measure);
  }
  inst.measure.innerHTML = '';
  $measure = $(inst.measure);

  loop:for (i = 0; i < len; ++i) {
    if (0 !== i && ' ' === text[i]) {
      arr.push(i);
    }
    $measure.append(text[i]);

    if (width < $measure.width()) {
      hinge_index = arr[arr.length - 1];
      fragment = text.substring(hinges[hinges.length - 1], hinge_index + 1);
      if (isCallback) {
        if (! opts.callback.apply(elm, [fragment, hinges.length - 1]) ) {
          if (isFinish) {
            isCallback = false;
          }
          else {
            break loop;
          }
        }
      }
      $measure.html('');
      hinges.push(hinge_index + 1);
      i = hinge_index;
    }
  }
  if (isFinish) {
    opts.finish.apply(elm, [text, hinges]);
  }
  cleanup(ns);
};

var createMeasure = function (parent) {
  var dom = document.createElement('hinge');
  var css = $.extend({}, DEFAULT_CSS);
  var $p = $(parent);
  $.each(
    dup_property,
    function (i, elm) {
      css[elm] = $p.css(elm);
    }
  );
  $(dom).css(css);
  return dom;
};

var cleanup = function (ns) {
  var inst = instance[ns];
  ++inst.counter;
  if (inst.length !== inst.counter) {
    return;
  }
  if (inst.measure) {
    document.body.removeChild(inst.measure);
    inst.measure = null;
  }
  delete instance[ns];
};

$.fn.texthinge = function (_o) {
  var opts = $.extend({}, DEFAULTS, _o || {});
  var ns = 'th' + ('' + (new Date()).valueOf()).slice(-6);
  var inst = instance[ns] = {length: this.length, counter: 0};

  return this.each(
    function (i, elm) {
      init(i, elm, opts, ns);
    }
  );
};

})(jQuery, window, document);