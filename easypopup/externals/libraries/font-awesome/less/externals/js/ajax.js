var ajaxRequest = null;
var ajaxIsActive = false;

window.onbeforeunload = function()
{
  if( ajaxRequest !== null ) {
    ajaxRequest.abort();
  }
};


function ajaxCall(url, params, dt, rt)
{
  if( ajaxIsActive ) return false;

  var dataType    = dt || 'html';
  var requestType = rt || 'POST';
  var ajaxParams  = {'ajax' : true};

  $.extend(ajaxParams, params);
  ajaxBefore(params);

  ajaxRequest = $.ajax({
    type: requestType,
    url: url,
    dataType: dataType,
    data: ajaxParams,
    complete: function(response) {
      ajaxAfter(response);
    }
  });

  return ajaxRequest;
}


function ajaxCallForm(url, form, dt)
{
  if( ajaxIsActive ) return false;

  var dataType = dt || 'html';
  form.append('ajax',  1);
  ajaxBefore();

  ajaxRequest = $.ajax({
    type: 'POST',
    url: url,
    dataType: dataType,
    data: form,
    processData: false,
    contentType: false,
    complete: function(response) {
      ajaxAfter(response);
    }
  })
  return ajaxRequest;
}


function ajaxBefore(params)
{
  var params = params || '';
  ajaxIsActive = true;
  $('#layout-row, #editor-sidebar-form-container .column-menu').addClass('easypopup-disabled');

  var syncNotice = $('#sync-layout-notice');

  if( syncNotice.length && syncNotice.is(":visible") && params && isset(params.task) && params.task == 'ajax_layout_editor' ) {
    syncNotice.remove();
    $('#unsync-layout-notice').show();
  }
}

function ajaxAfter(response)
{
  if( !ajaxCheckResponse(response) ) return;

  $('div.loader').hide();
  $('#layout-row, #editor-sidebar-form-container .column-menu').removeClass('easypopup-disabled');
  ajaxIsActive = false;
}

function ajaxCheckResponse(response)
{
  if( globalAppCurrentUrl ) {
    if( typeof(response) == 'string' && response == 'invalid shop' ) {
      window.top.location.href = globalAppCurrentUrl;
      return false;
    } else if( typeof(response) == 'object' && isset(response.responseText) && response.responseText == 'invalid shop' ) {
      window.top.location.href = globalAppCurrentUrl;
      return false;
    }
  }
  return true;
}