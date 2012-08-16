(function ($, window) {
  "use strict";

  var init = function () {
    $('#b0').click(onB0Click);
    $('#b1').click(onB1Click);
    $('#b2').click(onB2Click);
  };

  var onB0Click = function (ev) {
    ev.preventDefault();
    $('#serif').find('.container').texthinge(
      {
        callback: function (textfragment, counter) {
          var text = this.innerHTML;
          $(this).html(
            [
              text.substring(0, textfragment.length), '<br />', 
              text.slice(textfragment.length)
            ].join('')
          );
          return false;
        }
      }
    );
  };

  var onB1Click = function (ev) {
    var firstline;
    ev.preventDefault();
    $('#sans-serif').find('.container').texthinge(
      {
        callback: function (textfragment, counter) {
          console.log('callback: "' + textfragment + '"');
          if (counter === 0) {
            firstline = textfragment;
          }
          else {
            this.innerHTML = [
              firstline, '<br />', 
              textfragment, '<br />', 
              this.innerHTML.slice(firstline.length + textfragment.length)
            ].join('');
          }
          return (counter > 0 ? false : true);
        },
        finish: function (text, arr) {
          console.log('finished!');
          console.log(arr);
          for (var i = 0, len = arr.length; i < len; ++i) {
            if (i < len - 1) {
              console.log('"' + text.substring(arr[i], arr[i + 1]) + '"');
            }
            else {
              console.log('"' + text.slice(arr[i]) + '"');
            }
          }
        }
      }
    );
  };

  var onB2Click = function (ev) {
    ev.preventDefault();
    $('#comic-sans').find('.container').texthinge(
      {
        finish: function (text, arr) {
          console.log('finished!');
          console.log(arr);
          console.log(text);
          var result = [];
          for (var i = 0, len = arr.length; i < len; ++i) {
            if (i < len - 1) {
              result.push( text.substring(arr[i], arr[i + 1]));
              result.push( '<br />');
            }
            else {
              result.push( text.substring(arr[i], arr[i + 1]));
            }
          }
          this.innerHTML = result.join('');
        }
      }
    );
  };

  $(init);
})(jQuery, window);