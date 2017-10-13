"use strict";

var ajaxRequest = null;
var ajaxIsActive = false;
var $ajaxDisabledBlock = null;
var config = [];

window.onbeforeunload = function()
{
  if( isset(ShopifyApp) ) {
    ShopifyApp.Bar.loadingOn();
    ShopifyApp.ready(function(){
      ShopifyApp.Bar.initialize({
        buttons: {}
      });
    });
  }

  if( ajaxRequest !== null ) {
    ajaxRequest.abort();
  }
};

function apiRequest(type, task, callback, data, failCallback, ignore) {
    var ajaxRequest = ajaxCall(globalBaseUrl + task, data, config, callback, failCallback, ignore);
}

function ajaxCall(url, data, config, callback, failCallback)
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
        type: requestType,
        url: url,
        async: true,
        dataType: responseType,
        data: ajaxParams,
        complete: function (response) {
            if (response.status === 200) {
                if (typeof callback === 'function') {
                    callback(response.responseJSON);
                }
            } else {
                if (typeof failCallback === 'function') {
                    failCallback(response.responseJSON);
                }
            }
            if (!doubleAjax) ajaxAfter(response);
        },
        success: function (data) {
        },
        error: function (data) {
        },
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
  $('div.loader').hide();
  if( $ajaxDisabledBlock && $ajaxDisabledBlock.length ) $ajaxDisabledBlock.removeClass('easy-disabled');

  ajaxIsActive = false;
  ajaxRequest = null;
  $ajaxDisabledBlock = null;
}