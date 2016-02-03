var ajaxRequest = null;
var ajaxIsActive = false;
var backgroundAjaxRequest = null;

window.onbeforeunload = function()
{
  if( ajaxRequest !== null ) {
    ajaxRequest.abort();
  }
  if( popupUpdated || backgroundAjaxRequest ) {
    if( isset(ShopifyApp) ) ShopifyApp.Modal.alert("Please wait, we're saving your changes.");
    if( popupUpdated ) backgroundSaveSnippet(true);
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
    async: true,
    dataType: dataType,
    data: ajaxParams,
    complete: function(response) {
      ajaxAfter(response);
    }
  });

  return ajaxRequest;
}


function backgroundSaveSnippet(showLoader)
{
  var dataType    = 'json';
  var requestType = 'POST';
  var ajaxParams  = {'ajax' : true, 'task' : 'ajax_layout_editor', 'action': 'update_snippet', 'content_id': layoutId};
  if( showLoader ) $('#layout-editor-loader').show();
  popupUpdated = false;

  backgroundAjaxRequest = $.ajax({
    type: requestType,
    url: globalBaseUrl,
    async: true,
    dataType: dataType,
    data: ajaxParams,
    complete: function(response) {
      backgroundAjaxRequest = null;
      $('#layout-editor-loader').hide();
      if( isset(ShopifyApp) ) ShopifyApp.Modal.close();
    }
  });

  return backgroundAjaxRequest;
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
  $('.grid-stack-item.ui-draggable').draggable('disable');

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

  $('.grid-stack-item.ui-draggable').draggable('enable');
  $('#layout-row, #editor-sidebar-form-container .column-menu').removeClass('easypopup-disabled');
  ajaxIsActive = false;
  ajaxRequest = null;
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