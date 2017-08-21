$(document).ready(function(){
  // $('body').on('contextmenu', 'a.easypopup-link', function(){
  //   return false;
  // });

  // $('a.easypopup-link').on('click', function(e) {
  //   if( !ajaxIsActive && this.getAttribute('data-href') ) {
  //     window.location.href = this.getAttribute('data-href');
  //   }
  // });

  $('div, a, button, span').on('click', function(e) {
    if( ajaxIsActive ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
});