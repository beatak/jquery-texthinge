(
function () {
  var init = function () {
    $('#b0').click(onB0Click);
    $('#b1').click(onB1Click);
  };

  var onB0Click = function (ev) {
    ev.preventDefault();
    hingewrap($('#serif').find('.container'));
  };

  var onB1Click = function (ev) {
    ev.preventDefault();
    hingewrap($('#sans-serif').find('.container'));
  };

  var hingewrap = function ($j) {
    $j.texthinge(
      {
        callback: function (textfragment, counter) {
          $(this).html(this.innerHTML.substring(0, textfragment.length) + '<br />' + this.innerHTML.slice(textfragment.length + 1));
          return false;
        }
      }
    );
  };

  $(init);
})();