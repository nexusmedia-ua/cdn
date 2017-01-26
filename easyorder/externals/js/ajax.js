"use strict";

var ajaxRequest = null;
var ajaxIsActive = false;
var $ajaxDisabledBlock = null;

window.onbeforeunload = function()
{
  if( isset(ShopifyApp) ) ShopifyApp.Bar.loadingOn();

  if( ajaxRequest !== null ) {
    ajaxRequest.abort();
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

  if( $ajaxDisabledBlock && $ajaxDisabledBlock.length ) $ajaxDisabledBlock.addClass('easy-disabled');
}

function ajaxAfter(response)
{
  if( $ajaxDisabledBlock && $ajaxDisabledBlock.length ) $ajaxDisabledBlock.removeClass('easy-disabled');

  ajaxIsActive = false;
  ajaxRequest = null;
  $ajaxDisabledBlock = null;
}