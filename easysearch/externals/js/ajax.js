"use strict";

var ajaxRequest = null;
var ajaxIsActive = false;
var $ajaxDisabledBlock = null;

window.onbeforeunload = function()
{
  if( ajaxRequest !== null ) {
    ajaxRequest.abort();
  }
};


function ajaxCall(url, params, dt, rt, dbs)
{
  if( ajaxIsActive ) return false;

  var dataType    = dt || 'html';
  var requestType = rt || 'POST';
  $ajaxDisabledBlock = $(dbs).length ? $(dbs) : null;

  var ajaxParams  = {'ajax' : true};

  $.extend(ajaxParams, params);
  ajaxBefore();

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


function ajaxCallForm(url, form, dt, dbs)
{
  if( ajaxIsActive ) return false;

  var dataType = dt || 'html';
  $ajaxDisabledBlock = $(dbs).length ? $(dbs) : null;

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
  });

  return ajaxRequest;
}

function ajaxBefore()
{
  if( $ajaxDisabledBlock && $ajaxDisabledBlock.length ) $ajaxDisabledBlock.addClass('easysearch-disabled');
  ajaxIsActive = true;
}

function ajaxAfter(response)
{
  if( !ajaxCheckResponse(response) ) return;

  $('.loader').hide();
  ajaxIsActive = false;
  if( $ajaxDisabledBlock && $ajaxDisabledBlock.length ) $ajaxDisabledBlock.removeClass('easysearch-disabled');
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