"use strict";

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
  });

  return ajaxRequest;
}

function ajaxBefore()
{
  $('#fields-holder, #editor-sidebar-form-holder').find('a, button').addClass('easysearch-disabled');
  ajaxIsActive = true;
}

function ajaxAfter(response)
{
  if( !ajaxCheckResponse(response) ) return;

  $('.loader').hide();
  ajaxIsActive = false;
  $('#fields-holder, #editor-sidebar-form-holder').find('a, button').removeClass('easysearch-disabled');
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