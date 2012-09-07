(function ($, window, document) {

"use strict";

/**
 * copy-n-paste from: https://github.com/beatak/each_html_char-js
 * probably i should come up with the better way to depend
 * on my other project.
 */

var COUNT_AS_ONE = -1;
var IGNORE = 0;
var RAW_PROCESS = 1;
var REGEX_ENTITY = /&(?:[a-z\d]+|#\d+|#x[a-f\d]+);/i;
var REGEX_TAG = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;

/**
 * iterates a given string as HTML character.
 * @param str {string}
 * @param cb {function} [optional]
 * @param opt {object} [optional]
 * @returns {Array}
 */
var eachHtmlChar = function (str, cb, opt) {
  var type_arg0 = typeof str;
  var isCallback = true;
  var i, len, next, cbr;
  var result = [];
  var opt_entity = COUNT_AS_ONE;
  var opt_tag = COUNT_AS_ONE;

  // argument check
  if (arguments.length < 1) {
    throw new Error('You need at least pass a string. eg) proess("some string&hellip;")');
  }
  if (type_arg0 !== 'string') {
    if (type_arg0 === 'boolean' || type_arg0 === 'function' || type_arg0 === 'undefined' || (type_arg0 === 'object' && !str.toString)) {
      throw new Error('First argument needs to be a string.');
    }
    str = '' + str;
  }
  if (typeof cb !== 'function') {
    isCallback = false;
  }
  if (typeof opt === 'object') {
    if (opt.entity !== undefined) {
      if (RAW_PROCESS == opt.entity) {
        opt_entity = RAW_PROCESS;
      }
      else if (IGNORE == opt.entity) {
        opt_entity = IGNORE;
      }
    }
    if (opt.tag !== undefined) {
      if (RAW_PROCESS == opt.tag) {
        opt_tag = RAW_PROCESS;
      }
      else if (IGNORE == opt.tag) {
        opt_tag = IGNORE;
      }
    }
  }

  // start the process!
  i = 0;
  len = str.length;
  loop:do{
    next = getNext(str.slice(i), opt_entity, opt_tag);
    if (next.word !== null) {
      result.push(next.word);
      if (isCallback) {
        cbr = cb(i, next.word);
        if (false === cbr) {
          break loop;
        }
        else if ('number' === typeof cbr && cbr !== 0) {
          i += cbr;
        }
      }
    }
    i += next.incr;
  } while (i < len);

  // return an array of text.
  return result;
};

var getNext = function (str, ent, tag) {
  var word = str[0];
  var matched;
  var result = {word: word, incr: 1};
  if (word === '&') {
    if (ent !== RAW_PROCESS) {
      matched = getFirstAppearingEntity(str);
      if (matched !== null) {
        switch (ent) {
          case COUNT_AS_ONE:
            word = matched;
            result = {word: word, incr: word.length};
          break;
          case IGNORE:
            word = null;
            result = {word: word, incr: matched.length};
          break;
        }
      }
    }
  }
  else if (word === '<') {
    if (tag !== RAW_PROCESS) {
      matched = getFirstAppearingTag(str);
      if (matched !== null) {
        switch (tag) {
          case COUNT_AS_ONE:
            word = matched;
            result = {word: word, incr: word.length};
          break;
          case IGNORE:
            word = null;
            result = {word: word, incr: matched.length};
          break;
        }
      }
    }
  }
  return result;
};

var getFirstAppearingEntity = function (str) {
  var matches = REGEX_ENTITY.exec(str);
  var result;
  if (null === matches) {
    result = null;
  }
  else {
    result = matches[0];
  }
  return result;
};

var getFirstAppearingTag = function (str) {
  var matches = REGEX_TAG.exec(str);
  var result;
  if (null === matches) {
    result = null;
  }
  else {
    result = matches[0];
  }
  return result;
};

/**
 * jQuery.fn.texthinge()
 * wrap around a given long text by pixel width.
 */
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
  var $measure;
  var $elm = $(elm);
  var width = $elm.width();
  var text = $.trim($elm.html());
  var len = text.length;
  var space_indices = [];
  var hinges = [0];
  var isCallback = typeof opts.callback === 'function';
  var isFinish = typeof opts.finish === 'function';

  if (!inst.measure) {
    inst.measure = createMeasure(elm);
    document.body.appendChild(inst.measure);
  }
  inst.measure.innerHTML = '';
  $measure = $(inst.measure);

  eachHtmlChar(
    text,
    function (i, word) {
      var hinge_index, fragment, new_hinge;

      // find space here
      if (0 !== i && ' ' === word) {
        space_indices.push(i);
      }

      // insert the word
      $measure.append(word);
      if (width < $measure.width()) {

        var last_hinge = hinges[hinges.length - 1];
        hinge_index = space_indices.length > 1 ? space_indices[space_indices.length - 1] : -1;
        new_hinge = hinge_index + 1;

        if (last_hinge >= hinge_index) {
          new_hinge = i - 1;
          space_indices.push(new_hinge);          
        }

        if (isCallback) {
          fragment = text.substring(last_hinge, new_hinge);
          if (! opts.callback.apply(elm, [fragment, hinges.length - 1]) ) {
            if (isFinish) {
              isCallback = false;
            }
            else {
              return false;
            }
          }
        }
        hinges.push(new_hinge);
        $measure.html('');

        // index minipulation
        return new_hinge - i;
      }
    }
  );

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
      return elm;
    }
  );
};

})(jQuery, window, document);