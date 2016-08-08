"use strict";

var catGridController;
var navGridController;
var $draggableParent = null;


$(document).ready(function(){
  resizeDevicePreview();
  $(window).resize(function(){
    resizeDevicePreview();
  });

  $('input[data-device-preview-selector]').change(function(event) {
    $(this).previewImplementation();
  });

  $('document').on('click', '.easymobile-disabled', function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
  });

  if( $('.device-container').length ) {
    $(window).on('scroll', function() {
      var scrolltop = $(this).scrollTop();
      var $deviceContainer = $('.device-container');

      if( scrolltop > $('.device-tab-list').offset().top + $('.device-tab-list').height() ) {
        $deviceContainer.addClass('fixed-device-container');
        resizeDevicePreview();
      } else {
        $deviceContainer.removeClass('fixed-device-container');
      }
    });
  }

  $('.next-tab-disclosure-container').click(function(e){
    $(this).children('.dropdown').toggle(600);
  });
  if( $('.tab_list_dropdown').length ) {
    resizeMainMenu();
    $(window).resize(resizeMainMenu);
  }
});


// ------------------------------------- Main ---------------------------------------------
function showPushDetils(el, pos)
{
  var $activeInfo = $(el).next();
  $activeInfo.siblings('.push-stats-details').hide();
  $activeInfo.toggle(400);

  if( doughnutData[pos] ) {
    var $deliveryBlock = $activeInfo.find('.delivery-holder');
    var ctx = $deliveryBlock.find(".delivery-chart-area")[0].getContext("2d");
    var deliveryGraph = new Chart(ctx).Doughnut(doughnutData[pos]['delivery'], {responsive : true});
    $deliveryBlock.append(deliveryGraph.generateLegend());

    var $conversionBlock = $activeInfo.find('.conversion-holder');
    var ctx = $conversionBlock.find(".conversion-chart-area")[0].getContext("2d");
    var conversionGraph = new Chart(ctx).Doughnut(doughnutData[pos]['conversion'], {responsive : true});
    $conversionBlock.append(conversionGraph.generateLegend());

    delete doughnutData[pos];
  }
}

// ------------------------------------- Catalog ---------------------------------------------
function addCollection($placement)
{
  var $newRow = $('<li class="sortable-list-row"></li>');
  $newRow.append($('#hidden-data').html());
  $newRow.append('<a href="javascript:void(0)" class="btn-plus" onclick="addSubCollection(this);"><i class="fa fa-plus-circle"></i></a>');
  $newRow.append('<ol class="jq-sortable-sublist"></ol>');

  $placement.append($newRow);
  refreshDeviceCollections();
}

function addSubCollection(el)
{
  var $parent = $(el).parent().closest('.sortable-list-row');
  if( !$parent.length ) return;

  var $newRow = $('<li class="sortable-list-row" data-subcol="1"></li>');
  $newRow.append($('#hidden-data').html());

  $parent.find('.jq-sortable-sublist').append($newRow);
}

function deleteRow(el)
{
  if( isset(ShopifyApp) ) {
    ShopifyApp.Modal.confirm('Are you sure?', function(result){ if(result) _deleteContent(el);} );
  } else {
    if( confirm('Are you sure?') ) _deleteContent(el);
  }

  var _deleteContent = function(el) {
    $(el).parent().closest('.sortable-list-row').remove();
    refreshDeviceCollections();
  }
}

function saveCatalog()
{
  var d, data = [];
  $('#catalog-holder > .sortable-list-row').each(function(i, col){
    var $col = $(col);

    var sub = [];
    var $subColls = $col.find('.jq-sortable-sublist select');
    $.each($subColls, function(i, subcol){
      sub.push({ 'collection_id': $(subcol).val() });
    });

    d = {
      'collection_id': $col.children('.collections-list-holder').find('select').val(),
      'collections' : sub
    }
    data.push(d);
  });

  $('#catalog-data').val(JSON.stringify(data));
  $('#save-catalog-form').submit();
}

function refreshDeviceCollections()
{
  var tableTemplate = '';
  var gridTemplate  = '';
  var $tableHolder = $('.device-body-content-collections .device-table-view:visible');
  var $gridHolder = $('.device-body-content-collections .device-grid-view:visible');
  if( !$tableHolder.length && !$gridHolder.length ) return;

  $('#catalog-holder > li.sortable-list-row').each(function(){
    var id = $(this).find('select').val();
    if( id && collectionsInfo[id]['title'] ) {
      if( $tableHolder.length ) {
        tableTemplate += [
          '<div class="one-whole secondary-bg">',
          ' <div class="device-table-cell-cover">',
          '  <div class="device-table-cell-title-holder">',
          '   <div class="device-table-cell-title">' + collectionsInfo[id]['title'] + '</div>',
          '  </div>',
          ' </div>',
          '</div>'
        ].join('');
      }

      if( $gridHolder.length ) {
        var image = collectionsInfo[id]['image'] ? 'style="background: url(' + collectionsInfo[id]['image']['src'] + ') 50% 50% / contain no-repeat;"' : '';
        gridTemplate += [
          '<div class="grid__item one-half">',
          ' <div class="secondary-bg">',
          '  <div class="device-grid-cell-image" ' + image + '></div>',
          '  <div class="device-grid-cell-title">' + collectionsInfo[id]['title'] + '</div>',
          ' </div>',
          '</div>'
        ].join('');
      }
    }

    if( $tableHolder.length ) $tableHolder.html(tableTemplate);
    if( $gridHolder.length )  {
      $gridHolder.html(gridTemplate);
      resizeDevicePreview();
    }
  });
}

// ------------------------------------- Navigation ---------------------------------------------
function addNavigation($placement)
{
  var $newRow = $('<li class="sortable-list-row"></li>');
  $newRow.append($('#nav-hidden-row').html());
  $newRow.children('.nav-fields').attr('id', 'nav-fields-' + getTimedId());

  $placement.append($newRow);
}

function navTypeUpdate(el, value)
{
  var $el = $(el);
  value = value || {};

  createNavLinkField($el.closest('.nav-fields'), $el.val(), value);
}

function createNavLinkField($navFields, type, linkParam)
{
  var value = linkParam.value || '';
  var label = linkParam.label || '';

  var $linkHolder = $navFields.find('.nav-link-holder');
  var navFieldsId = $navFields.attr('id');

  $linkHolder.text('');
  $navFields.children('.ui-autocomplete').remove();

  if( type == 'page' ) {
    var $sel = $('#nav-hidden-pages-list').clone();
    $sel.removeAttr('id').addClass('nav-link').val(value);
    $linkHolder.html($sel);

  } else if( type == 'collection' ) {
    var $sel = $('#nav-hidden-collections-list').clone();
    $sel.removeAttr('id').addClass('nav-link').val(value);
    $linkHolder.html($sel);

  } else if( type == 'product' ) {
    $linkHolder.html('<select class="autocomplete-combobox nav-link"><option value="' + value + '">' + label + '</option></select>');
    $linkHolder.append('<div class="autocomplete-loader loader"><div class="next-spinner"><svg class="next-icon next-icon--20" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div></div>');

    initAutocomplete( $linkHolder, navFieldsId );

  } else if( type == 'url' ) {
    $linkHolder.html('<input type="text" placeholder="URL" class="nav-link" value="' + value + '" />');
  }
}

function saveNavigation()
{
  var d, data = [];

  $('.sortable-list-row').each(function(i, nav){
    var $nav = $(nav);

    d = {
      'title': $nav.find('.nav-title-holder').val(),
      'type' : $nav.find('.nav-type-holder').val(),
      'link' : $nav.find('.nav-link').val() || '',
    }
    data.push(d);
  });

  $('#navigation-data').val(JSON.stringify(data));
  $('#save-navigation-form').submit();
}

// ------------------------------------- Home ---------------------------------------------
function setBannerLinkField(pageSel, i)
{
  var $pageSel = $(pageSel);
  var $linkHolder = $pageSel.closest('.grid--wide').find('.link-holder').text('');
  var name = 'banners[' + i + '][link]';
  var id = 'banner' + i + '_link';

  if( $pageSel.val() == 'collection' ) {
    var $sel = $('#home-hidden-collections-list').clone();
    $sel.attr('id', id).attr('name', name);
    $linkHolder.html('<label for="' + id + '">Collection URL</label>');
    $linkHolder.append($sel);

  } else if( $pageSel.val() == 'page' ) {
    var $sel = $('#home-hidden-pages-list').clone();
    $sel.attr('id', id).attr('name', name);
    $linkHolder.html('<label for="' + id + '">Page URL</label>');
    $linkHolder.append($sel);

  } else if( $pageSel.val() == 'product' ) {
    $linkHolder.html('<label for="' + id + '">Product Title</label>');
    $linkHolder.append('<select id="' + id + '" class="autocomplete-combobox" name="' + name + '"></select>');
    $linkHolder.append('<div class="autocomplete-loader loader"><div class="next-spinner"><svg class="next-icon next-icon--20" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div></div>');

    initAutocomplete( $linkHolder, id + '_ac_list' );

  } else {
    $linkHolder.html('<label for="' + id + '">Banner link URL</label>');
    $linkHolder.append('<input type="text" id="' + id + '" name="' + name + '" size="30" value="" />');
  }
}

// ------------------------------------- Common ---------------------------------------------
function devicePreviewToggle(tab, mode)
{
  $(tab).addClass('active').parent().siblings('li').children('a').removeClass('active');
  $('.device-header-' + mode + '-view').show().siblings('div.device-header').hide();
  $('.device-body-content-' + mode + '-view').show().siblings('div').hide();
}

function resizeDevicePreview()
{
  var $device = $('.device-container');
  if( $device.length ) {
    var w = parseInt($device.parent().width()) - 40;
    $device.css('width', w);
    $device.css('height', w * 2);
    $('body').css('min-height', w * 2 + 50);
  }
}

function removeImage(btn, devicePreviewEl)
{
  var $container = $(btn).closest('.image-preview-container');

  $container.children('input').val(1);
  $container.children('.image-preview-holder').remove();

  if( devicePreviewEl ) $(devicePreviewEl).remove();
}

$.fn.extend({previewImplementation : function() {
  var previewId  = '.device-holder ' + $(this).attr('data-device-preview-selector');
  var $previewEl = $(previewId);
  var style = $(this).attr('data-device-style');
  var value = $(this).val();

  if( $previewEl.length && style ) {
    if( value ) {
      switch( style ) {
        case 'color':
        case 'background':
        case 'background-color':
        case 'border-color':
                $previewEl.css(style, '#' + value);
                break;

        case 'footer-fill':
                $previewEl.children().css('color', '#' + value);
                $previewEl.find('rect').css('fill', '#' + value);
                break;

        case 'show-one':
                if( $(this).prop('checked') ) {
                  $previewEl.show();
                  $previewEl.siblings().hide();
                } else {
                  $previewEl.hide();
                }
                break;
      }
    } else {
      switch( style ) {
        case 'background':
        case 'background-color':
                $previewEl.css(style, 'transparent');
                break;
      }
    }
  }
}});

/*
function initAutocomplete($holder, listHolderSelector)
{
  var $labelHolder = $holder.find('.autocomplete-label');
  var $valueHolder = $holder.find('.autocomplete-value');

  $labelHolder.autocomplete({
    minLength: 2,
    source: function(text, callback){
      var request = ajaxCall(
        globalBaseUrl,
        { 'task': 'ajax_controller', 'action': 'get_products', 'text': text.term }
      );

      if( request ) {
        request.done(function(response) {
          if( response && response.data ) {
            callback( response.data );
          } else {
            callback([]);
          }
        });
      }
    },
    //source: autocompleteData,
    deferRequestBy: 300,
    appendTo: '#' + listHolderSelector,

    select: function( event, ui ) {
      $labelHolder.val( ui.item.label );
      $valueHolder.val( ui.item.value );
      event.preventDefault();
    },

    focus: function (event, ui) {
      $labelHolder.val( ui.item.label );
      $valueHolder.val( ui.item.value );
      event.preventDefault();
    },

    search: function(event, ui) {
      $holder.find('.autocomplete-loader').show();
    },

    response: function(event, ui) {
      $holder.find('.autocomplete-loader').hide();
    }
  }).autocomplete( "instance" )._renderItem = function( ul, item ) {
    return $( "<li>" )
      .append( item.label )
      .appendTo( ul );
  };
}
*/


(function( $ ) {
  $.widget( "custom.combobox", {
    _create: function() {
      this.wrapper = $( "<span>" ).addClass( "custom-combobox" ).insertAfter( this.element );
      this.element.hide();
      this._createAutocomplete();
    },

    _createAutocomplete: function() {
      var selected = this.element.children( ":selected" );
      var value = selected.val() ? selected.text() : "";
      var $holder = this.wrapper.closest('.link-holder');

      this.input = $( "<input>" )
        .appendTo( this.wrapper )
        .val( value )
        .attr("title", "")
        .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
        .autocomplete({
          delay: 0,
          minLength: 1,
          source: $.proxy( this, "_source" ),
          appendTo: '#' + $holder.attr('id'),
          select: function( event, ui ) {
            $holder.find('.ui-autocomplete-input').val( ui.item.label );
            event.preventDefault();
          },
          focus: function (event, ui) {
            $holder.find('.ui-autocomplete-input').val( ui.item.label );
            event.preventDefault();
          },
          search: function(event, ui) {
            $holder.find('.autocomplete-loader').show();
          },
          response: function(event, ui) {
            $holder.find('.autocomplete-loader').hide();
          }
        });

      this._on( this.input, {
        autocompleteselect: function( event, ui ) {
          ui.item.option.selected = true;
          this._trigger( "select", event, {
            item: ui.item.option
          });
        },

        autocompletechange: "_removeIfInvalid"
      });
    },

    _source: function(text, callback){
      var $select = this.element;
      if( ajaxRequest !== null ) {
        ajaxRequest.abort();
      }

      var request = ajaxCall(
        globalBaseUrl,
        { 'task': 'ajax_controller', 'action': 'get_products', 'text': text.term }
      );

      if( request ) {
        request.done(function(response) {
          $select.empty();

          if( response && response.data ) {
            $.each(response.data, function(i, value){
              $('<option>').text(value.label).attr('value', value.value).appendTo($select);
            });

            callback( $select.children("option").map(function() {
              return {
                label: $(this).text(),
                value: $(this).val(),
                option: this
              };
            }));
          } else {
            callback([]);
          }
        });
      }
    },

    _removeIfInvalid: function( event, ui ) {
      // Selected an item, nothing to do
      if ( ui.item ) return;

      // Search for a match (case-insensitive)
      var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;

      this.element.children("option").each(function() {
        if ( $( this ).text().toLowerCase() === valueLowerCase ) {
          this.selected = valid = true;
          return false;
        }
      });

      // Found a match, nothing to do
      if ( valid ) return;

      // Remove invalid value
      this.input.val("");
      this.input.autocomplete( "instance" ).term = "";
      this.element.val("");
      this.element.parent().find('.autocomplete-loader').hide();
    },

    _destroy: function() {
      this.wrapper.remove();
      this.element.show();
    }
  });
})( jQuery );

function initAutocomplete($holder)
{
  var $comboboxHolder = $holder.find('.autocomplete-combobox');
  $comboboxHolder.combobox($holder);
}