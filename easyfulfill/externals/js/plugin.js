$(document).ready(function(){
  $('div, a, button, span').on('click', function(e) {
    if( ajaxIsActive ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
});

function applyOrdersFilters( el )
{
  $('#template-main > .wrapper').addClass('easy-disabled');
  var params = "&page=1";

  if( $('#paid-only').prop('checked') )     params += "&paid_only=1";
  if( $('#imported-only').prop('checked') ) params += "&imported_only=1";

  window.location.href = globalBaseUrl + params;
}

function editCarrier( cid )
{
  if( ajaxIsActive ) return;
  cid = cid || 0;

  $('#carriers-container').addClass('large--two-thirds medium--two-thirds');
  $('#carrier-edit-form-holder').empty().show();
  $('#carrier-edit-loader').show();
  $('#carrier-edit-container').show();

  var request = ajaxCall(
    globalBaseUrl,
    { 'task': 'ajax_form', 'id': cid, 'type': 'carrier' },
    { 'response_type': 'html', 'disabled_block': '#template-carriers-list > .wrapper' }
  );

  if( request ) {
    request.done(function(response) {
      $('#carrier-edit-loader').hide();

      if( response != 'error' ) {
        $('#carrier-edit-form-holder').html(response);
        $('#carrier-setting-carrier-name').focus();
      } else {
        cancelEditCarrier();
      }
    });
  }
}

function cancelEditCarrier()
{
  $('#carrier-edit-container').hide();
  $('#carrier-edit-form-holder').empty();
  $('#carriers-container').removeClass('large--two-thirds medium--two-thirds');
}

function saveCarrier()
{
  var $form = $('#carrier-edit-form');
  if( !$form.length ) return;

  var data = new FormData( $form[0] );
  data.append('task', 'ajax_controller');
  data.append('action', 'save_carrier');

  var request = ajaxCallForm(
    globalBaseUrl,
    data,
    { 'disabled_block': '#template-carriers-list > .wrapper' }
  );

  if( request ) {
    request.done(function(response) {
      if( response.error ) {
        $('#carrier-edit-error').show().children().html(response.error);
      } else {
        window.location.href = globalBaseUrl + '&task=carriers_list';
      }
    })
  }
}

function removeCarrier( el )
{
  var $row = $(el).parent().closest('.carrier-row');
  if( !$row.length ) return;

  var carrierId = $row.attr('data-carrier-id');
  if( !carrierId ) return;

  if( isset(ShopifyApp) ) {
    ShopifyApp.Modal.confirm('Are you sure?', function(result){ if(result) _removeCarrier(); } );
  } else {
    if( confirm('Are you sure?') ) _removeCarrier();
  }

  var _removeCarrier = function(){
    $row.find('a.carrier-item-status').removeAttr('onclick').children('i').attr('class', 'fa fa-gears');

    var request = ajaxCall(
      globalBaseUrl,
      { 'task': 'ajax_controller', 'action': 'remove_carrier', 'id': carrierId},
      { 'disabled_block': '#template-carriers-list > .wrapper' }
    );

    if( request ) {
      request.done(function(response) {
        if( response.error ) {
          window.location.reload();
          return;
        }

        $row.remove();
        if( !$('#carriers-holder > li.carrier-row').length ) {
          window.location.href = globalBaseUrl;
        }
      });
    }
  }
}

function saveCarriersOrder()
{
  if( ajaxIsActive ) ajaxIsActive = false;

  var $li = $("#carriers-holder > li");
  var data = [];

  $li.each(function(i, item) {
    data.push(item.getAttribute('data-carrier-id') || 0);
  });

  var request = ajaxCall(
    globalBaseUrl,
    { 'task': 'ajax_controller', 'action': 'save_carriers_order', 'data' : data },
    { 'disabled_block': '#template-carriers-list > .wrapper' }
  );
}

function carrierStatusToggle( el )
{
  var $el = $(el);
  var $row = $(el).parent().closest('.carrier-row');
  if( !$row.length ) return;

  var carrierId = $row.attr('data-carrier-id');
  if( !carrierId ) return;

  var newStatus = 1;
  var newClass  = 'fa fa-toggle-on';
  if( $el.attr('data-status') == '1' ) {
    $newStatus = 0;
    newClass   = 'fa fa-toggle-off';
  }

  $newStatus = $el.attr('data-status') == '1' ? 0 : 1;
  $el.removeAttr('onclick').children('i').attr('class', 'fa fa-gears');

  var request = ajaxCall(
    globalBaseUrl,
    { 'task': 'ajax_controller', 'action': 'update_status', 'id': carrierId, 'status': $newStatus },
    { 'disabled_block': '#template-carriers-list > .wrapper' }
  );

  if( request ) {
    request.done(function(response) {
      if( response.error ) {
        window.location.reload();
        return;
      }

      $el.attr('data-status', $newStatus).attr('onclick','carrierStatusToggle(this);').children('i').attr('class', newClass);
    });
  }
}

function uploadCSV( el )
{
  $.featherlight.close();
  $('#template-main > .wrapper').addClass('easy-disabled');
  $(el).parent().closest('form').submit();
}

function closeErrors()
{
  $('#orders-main-holder').remove();
}

function showUploadPopup()
{
  $.featherlight($('#upload-popup-holder'), {uniqueClass: 'upload-popup'});
}

function notifiesToggle( el )
{
  $('.notify-order').prop('checked', el.checked);
}

function addCode( el, code )
{
  var $codesHolder  = $(el).parent();
  var $codesHolders = $codesHolder.siblings('.codes-holder');

  if( !$codesHolder.length || $codesHolders.length >= 40 ) return;

  $codesHolder.after([
      '<div class="codes-holder">',
      '  <input type="text" name=orders[' + code + '][codes][] value="">',
      '  <a href="javascript:void(0)" class="remove-code" onclick="removeCode(this)"><i class="fa fa-minus"></i></a>',
      '</div>'
    ].join('')
  );


  var $row = $codesHolder.closest('tr');
  var $sel = $row.find('.order-item-carriers > select:first').clone();

  $row.find('.order-item-carriers > select:first').after( $sel );
}

function removeCode( el )
{
  var $row = $(el).parent().closest('tr');
  var index = $(el).parent().index();

  $(el).parent().remove();
  $row.find('.order-item-carriers > select:eq(' + index + ')').remove();
}