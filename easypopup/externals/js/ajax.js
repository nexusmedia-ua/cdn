"use strict";

var ajaxRequest = null;
var ajaxIsActive = false;
var $ajaxDisabledBlock = null;
var backgroundAjaxRequest = null;

window.onbeforeunload = function()
{
  if( ajaxRequest !== null ) {
    ajaxRequest.abort();
  }
  if( popupUpdated || backgroundAjaxRequest ) {
    if( isset(ShopifyApp) ) {
      ShopifyApp.Modal.alert("Please wait, we're saving your changes.");
      // safari hack
      if( navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 ) {
        ShopifyApp.Modal.alert("Please wait, we're saving your changes.");
      }
    }
    if( popupUpdated ) backgroundSaveSnippet(true);
  }
};

function ajaxCall(url, data, config)
{
  if( ajaxIsActive ) return false;

  var ajaxParams   = {'ajax' : true, 'ahmac' : globalAhmac};
  var responseType = config && typeof config['response_type'] === 'string' ? config['response_type'] : 'json';
  var requestType  = config && typeof config['request_type']  === 'string' ? config['request_type']  : 'POST';
  var doubleAjax   = config && typeof config['double_ajax']   === 'boolean'? config['double_ajax']   : false;
  $ajaxDisabledBlock = config && typeof config['disabled_block'] === 'string' && $(config['disabled_block']).length ? $(config['disabled_block']) : null;

  $.extend(ajaxParams, data);
  ajaxBefore(data);

  ajaxRequest = $.ajax({
    type : requestType,
    url  : url,
    async: true,
    dataType: responseType,
    data : ajaxParams,
    complete: function(response) {
      if( !doubleAjax ) ajaxAfter(response);
    }
  });

  return ajaxRequest;
}

function ajaxCallForm(url, form, config)
{
  if( ajaxIsActive ) return false;

  var responseType   = config && typeof config['response_type']  === 'string' ? config['response_type'] : 'json';
  $ajaxDisabledBlock = config && typeof config['disabled_block'] === 'string' && $(config['disabled_block']).length ? $(config['disabled_block']) : null;

  form.append('ajax',  1);
  form.append('ahmac', globalAhmac);
  ajaxBefore(config);

  ajaxRequest = $.ajax({
    type: 'POST',
    url: url,
    dataType: responseType,
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
  var params = params || {};
  ajaxIsActive = true;

  if( $ajaxDisabledBlock && $ajaxDisabledBlock.length ) $ajaxDisabledBlock.addClass('easypopup-disabled');
  $('.grid-stack-item.ui-draggable').draggable('disable');
  $('.mce-menu').hide();

  if( params && isset(params.task) && params.task == 'ajax_layout_editor' && params.action != 'get_templates' ) {
    var syncNotice = $('#sync-layout-notice');
    if( syncNotice.length && syncNotice.is(":visible") ) {
      syncNotice.remove();
      $('#layout-editor-tabs .active .fa-link').remove();
      $('#unsync-layout-notice').show();
    }
  }
}

function ajaxAfter(response)
{
  if( !ajaxCheckResponse(response) ) return;

  $('div.loader').hide();
  $('.grid-stack-item.ui-draggable').draggable('enable');
  if( $ajaxDisabledBlock && $ajaxDisabledBlock.length ) $ajaxDisabledBlock.removeClass('easypopup-disabled');

  ajaxIsActive = false;
  ajaxRequest = null;
  $ajaxDisabledBlock = null;
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

function backgroundCheckPopupToUpdate()
{
  $.ajax({
    type: 'POST',
    url: globalBaseUrl,
    dataType: 'json',
    data: {'ajax' : true, 'ahmac' : globalAhmac, 'task': 'ajax_layout_actions', 'action': 'check_to_update'},
    success: function(response) {
      if( response.data ) $('#popup-save-inprogress').show();
      else $('#popup-save-inprogress').hide();
    }
  });
}

function backgroundSaveSnippet(showLoader)
{
  var dataType    = 'json';
  var requestType = 'POST';
  var ajaxParams  = {'ajax' : true, 'ahmac' : globalAhmac, 'task' : 'ajax_layout_editor', 'action': 'update_snippet', 'content_id': layoutId};
  if( showLoader ) $('#layout-editor-loader').show();

  backgroundAjaxRequest = $.ajax({
    type: requestType,
    url: globalBaseUrl,
    async: true,
    dataType: dataType,
    data: ajaxParams,
    complete: function(response) {
      backgroundAjaxRequest = null;
      $('#layout-editor-loader').hide();
      $('#popup-save-inprogress').hide();
      popupUpdated = false;
      if( isset(ShopifyApp) ) ShopifyApp.Modal.close();
    }
  });

  return backgroundAjaxRequest;
}