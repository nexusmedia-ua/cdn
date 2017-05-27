"use strict";

var contentGroup = 0;
$(document).ready(function(){
  $( ".datepicker" ).datepicker( {"dateFormat": "yy-mm-dd"} );
});


// ------------------------------------------ Content  ------------------------------------------

function removeLockdown(id)
{
  if( ajaxIsActive || !id ) return;

  if( isset(ShopifyApp) ) {
    ShopifyApp.Modal.confirm('Are you sure?', function(result){ if(result) _deleteLockdown(id); } );
  } else {
    if( confirm('Are you sure?') ) _deleteLockdown(id);
  }

  var _deleteLockdown = function(id) {
    var $row = $('#lockdown-row-holder-' + id);
    $row.find('.lockdown-actions').html('<div class="remove-lockdown-loader loader"><div class="next-spinner"><svg class="next-icon next-icon--20" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div></div>');

    var request = ajaxCall(
      globalBaseUrl,
      { 'task': 'ajax_controller', 'action': 'remove_lockdown', 'id': id },
      { 'disabled_block': 'body > .wrapper' }
    );

    if( request ) {
      if( isset(ShopifyApp) ) ShopifyApp.Bar.loadingOn();

      request.done(function(response) {
        $row.remove();
        if( isset(ShopifyApp) ) ShopifyApp.Bar.loadingOff();
        if( $('#lockdowns-list tr').length <= 1) {
          $('#lockdowns-list-holder').hide();
          $('#lockdowns-list-empty').show();
        }
      });
    }
  }
}

function lockdownStatusToggle( id )
{
  if( ajaxIsActive || !id ) return;

  var $statusEl = $('#lockdown-row-holder-' + id + ' .lockdown-status');
  if( !$statusEl.length ) return;

  var status = parseInt($statusEl.attr('data-status'));
  $statusEl.children('i').attr('class', 'fa fa-gears');

  var request = ajaxCall(
    globalBaseUrl,
    { 'task': 'ajax_controller', 'action': 'change_status', 'id': id, 'status': status },
    { 'disabled_block': '#lockdowns-list' }
  );

  if( request ) {
    request.done(function(response) {
      if( status ) {
        $statusEl.children('i').attr('class', 'fa fa-toggle-off');
        $statusEl.attr('data-status', 0);
      } else {
        $statusEl.children('i').attr('class', 'fa fa-toggle-on');
        $statusEl.attr('data-status', 1);
      }
    });
  }
}

// ------------------------------------------ Content  ------------------------------------------

(function( $ ) {
  $.widget( "custom.combobox", {
    _create: function() {
      this.wrapper = $("<span>").addClass("custom-combobox").insertAfter( this.element );
      this.element.hide();
      this._createAutocomplete();
    },

    _createAutocomplete: function() {
      var selected = this.element.children(":selected");
      var value = selected.val() ? selected.text() : "";
      var $holder = this.wrapper.parent();

      this.input = $( "<input>" )
        .appendTo( this.wrapper )
        .val( value )
        .attr("title", "")
        .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
        .autocomplete({
          delay: 500,
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
            if( ajaxRequest !== null ) ajaxRequest.abort();
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
      if( ajaxRequest !== null ) ajaxRequest.abort();

      var request = ajaxCall(
        globalBaseUrl,
        { 'task': 'ajax_controller', 'action': 'get_content', 'type': 'product', 'text': text.term }
      );

      if( request ) {
        request.done(function(response) {
          $select.empty();

          if( response && response.data ) {
            $.each(response.data, function(i, value){
              $('<option>').text(value.title).attr('value', value.value).attr('data-handle', value.handle).appendTo($select);
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

function showFilterForm(btn)
{
  $('#add-filter-form').show();
  contentGroup = 0;

  if( btn && $(btn).length ) {
    if( $(btn).parent().attr('data-group') ) contentGroup = $(btn).parent().attr('data-group');
  }

  $('#lockdown-customers-filters .tag > span').removeClass('active');
  $('#lockdown-customers-filters .tag > span[data-group=' + contentGroup + ']').addClass('active');
}

function showContent(el)
{
  var type = $(el).val();
  var $container = $('#lockdown-content-container').hide();
  var $holder = $('#lockdown-content-holder').empty();
  var $select = $('<select id="lockdown-content-id" name="lockdown_content_id">');

  if( type == 'page' || type == 'blog' || type == 'collection' || type == 'collection_product' ) {
    $holder.append($select);
    $('.content-type-loader').show();

    var request = ajaxCall(
      globalBaseUrl,
      { 'task': 'ajax_controller', 'action': 'get_content', 'type': type }
    );

    if( request ) {
      request.done(function(response) {
        if( response && response.data ) {
          $.each(response.data, function(id, item){
            $('<option>').text(item.title).attr('value', id).attr('data-handle', item.handle).appendTo($select);
          });
          $container.show();
        }
      });
    }
  }

  if( type == 'product' || type == 'product_view_only' ) {
    var value = "";
    var label = "";
    $select.addClass('autocomplete-combobox').html('<option value="' + value + '">' + label + '</option>');
    $holder.append($select).append('<div class="autocomplete-loader loader"><div class="next-spinner"><svg class="next-icon next-icon--20" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div></div>');
    $container.show();

    initAutocomplete( $holder );
  }
}

function addContent()
{
  $('#lockdown-content-holder').find('.field-error').removeClass('field-error');
  var type   = $('#lockdown-content-type').val();
  var id     = $('#lockdown-content-id').val();
  var title  = $('#lockdown-content-id').children('option:selected').text();
  var handle = $('#lockdown-content-id').children('option:selected').attr('data-handle');

  if( !type ) return;

  var $content = $('<span>');
  var $hidden  = $('<input type="hidden">');
  var typeTitle = getContentTitleByType(type);

  if( type == 'page' || type == 'collection' || type == 'collection_product' || type == 'blog' || type == 'product' || type == 'product_view_only' ) {
    if( !id ) {
      if( type == 'product' || type == 'product_view_only' ) $('input.ui-autocomplete-input').addClass('field-error');
      else $('#lockdown-content-id').addClass('field-error');
      return;
    }

    $content.attr('data-type', type + 's');
    if( handle ) $content.attr('data-handle', handle);
    $content.append( '<b>' + typeTitle + ':</b> ' + title + '<span class="close" onclick="removeContent(this);">x</span>' );
    $content.append( $hidden.attr('name', 'lockdown_content[' + type + 's][' + id + ']').val(title) );

  } else {
    $content.attr('data-type', type);
    $content.append( '<b>' + typeTitle + '</b><span class="close" onclick="removeContent(this);">x</span>' );
    $content.append( $hidden.attr('name', 'lockdown_content[' + type + ']').val(1) );
  }

  if( type == 'website' ) $('#lockdown-content-values > span').remove();
  else $('#lockdown-content-values > span[data-type=website]').remove();

  if( type == 'hide_price' ) {
    $('#lockdown-content-values > span').remove();
    $('#exceptions-section').hide();
    $('#lockdown-customers-type-authorized-selector').hide();
    $('#lockdown-customers-password-holder').hide();
    $('#how-to-lock-section').show();
    $('#additional-settings-section').hide();
    $('#hide-links-holder').hide();

    if( $('#lockdown-customers-type-authorized').prop('checked') ) {
      $('#lockdown-customers-type-logged-in').prop("checked", true);
    }

  } else {
    $('#lockdown-content-values > span[data-type=hide_price]').remove();
    $('#exceptions-section').show();
    $('#additional-settings-section').show();
    $('#how-to-lock-section').show();

    if( type == 'website' ) $('#hide-links-holder').hide();
    else $('#hide-links-holder').show();

    if( $('#lockdown-customers-access-mode-0').prop('checked') ) {
      $('#lockdown-customers-type-authorized-selector').show();
    }
  }

  $('#lockdown-content-errors').remove();
  $('#lockdown-content-values').append($content);

  cancelContent();
  createQuickLinks();
}

function cancelContent()
{
  $('#lockdown-content-type').val('');
  $('#lockdown-content-container').hide();
  $('#lockdown-content-holder').empty();
  $('#add-content-form').hide();
}

function removeContent(el)
{
  var $parent = $(el).parent();
  if( $parent.siblings('span[data-type=website]').length ) {
    $('#hide-links-holder').hide();
  } else {
    $('#hide-links-holder').show();
  }
  $parent.remove();

  createQuickLinks();
}

function showException(el)
{
  var type = $(el).val();
  var $container = $('#lockdown-exception-container').hide();
  var $holder = $('#lockdown-exception-holder').empty();
  var $select = $('<select id="lockdown-exception-id" name="lockdown_exception_id">');

  if( type == 'page' || type == 'blog' || type == 'collection' || type == 'collection_product' ) {
    $holder.append($select);
    $('.exception-type-loader').show();

    var request = ajaxCall(
      globalBaseUrl,
      { 'task': 'ajax_controller', 'action': 'get_content', 'type': type }
    );

    if( request ) {
      request.done(function(response) {
        if( response && response.data ) {
          $.each(response.data, function(id, item){
            $('<option>').text(item.title).attr('value', id).appendTo($select);
          });
          $container.show();
        }
      });
    }
  }

  if( type == 'product' ) {
    var value = "";
    var label = "";
    $select.addClass('autocomplete-combobox').html('<option value="' + value + '">' + label + '</option>');
    $holder.append($select).append('<div class="autocomplete-loader loader"><div class="next-spinner"><svg class="next-icon next-icon--20" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div></div>');
    $container.show();

    initAutocomplete( $holder );
  }
}

function addException()
{
  $('#lockdown-exceptions-holder').find('.field-error').removeClass('field-error');
  var type  = $('#lockdown-exception-type').val();
  var id    = $('#lockdown-exception-id').val();
  var title = $('#lockdown-exception-id').children('option:selected').text();

  if( !type ) return;

  var $content = $('<span>');
  var $hidden  = $('<input type="hidden">');
  var typeTitle = getContentTitleByType(type);

  if( type == 'page' || type == 'collection' || type == 'collection_product' || type == 'blog' || type == 'product' ) {
    if( !id ) {
      if( type == 'product' ) $('input.ui-autocomplete-input').addClass('field-error');
      else $('#lockdown-exception-id').addClass('field-error');
      return;
    }

    $content.append( '<b>' + typeTitle + ':</b> ' + title + '<span class="close" onclick="removeException(this);">x</span>' );
    $content.append( $hidden.attr('name', 'lockdown_exceptions[' + type + 's][' + id + ']').val(title) );

  } else {
    $content.append( '<b>' + typeTitle + '</b><span class="close" onclick="removeException(this);">x</span>' );
    $content.append( $hidden.attr('name', 'lockdown_exceptions[' + type + ']').val(1) );
  }

  $('#lockdown-exceptions-errors').remove();
  $('#lockdown-exceptions-values').append($content);
  cancelException();
}

function cancelException()
{
  $('#lockdown-exception-type').val('');
  $('#lockdown-exception-container').hide();
  $('#lockdown-exception-holder').empty();
  $('#add-exception-form').hide();
}

function removeException(el)
{
  $(el).parent().remove();
}

function getContentTitleByType( type )
{
  switch( type ) {
    case 'website':    return 'Whole Website'; break;
    case 'index':      return 'Home Page'; break;
    case 'cart':       return 'Cart Page'; break;
    case 'search':     return 'Search Page'; break;
    case 'page':       return 'Page'; break;
    case 'blog':       return 'Blog'; break;
    case 'collection': return 'Collection only'; break;
    case 'product':    return 'Product'; break;
    case 'all_collections':        return 'All Collections and Products'; break;
    case 'collection_product':     return 'Collection and Products'; break;
    case 'product_view_only':      return 'Product (view only)'; break;
    case 'all_products_view_only': return 'All products (view only)'; break;
    case 'hide_price':             return 'Prices (whole website)'; break;
  }
  return '';
}


// ------------------------------------------ Customers  ------------------------------------------

function selectCustomersType(el)
{
  cancelFilter();

  var selectedType = $(el).val();
  if( selectedType == 'logged_in' ) {
    $('.lockdown-customers-holders').hide();
    $('#who-may-access-section > hr').show();
    $('#how-to-lock-section').show();
    $('#locked-page-info').show();

  } else if( selectedType == 'selected' ) {
    $('.lockdown-customers-holders').hide();
    $('#lockdown-customers-filters-holder').show();
    $('#who-may-access-section > hr').show();
    $('#how-to-lock-section').show();
    $('#locked-page-info').show();

  } else if( selectedType == 'location' ) {
    $('.lockdown-customers-holders').hide();
    $('#lockdown-customers-location-holder').show();
    $('#who-may-access-section > hr').show();
    $('#how-to-lock-section').show();
    $('#locked-page-info').show();

  } else if( selectedType == 'authorized' ) {
    $('.lockdown-customers-holders').hide();
    $('#lockdown-customers-password-holder').show();
    $('#who-may-access-section > hr').hide();
    $('#how-to-lock-section').hide();
    $('#locked-page-info').hide();
  }

  if( !$('#lockdown-content-values > span[data-type=website], #lockdown-content-values > span[data-type=hide_price]').length ) {
    $('#hide-links-holder').show();
  }
}

function showFilterContent(el)
{
  var val = $(el).val();
  $('#lockdown-customers-filter-secondary > div').hide();
  $('div[data-rel=' + val + ']').show();
}

function showFilterDate(el)
{
  var $el = $(el);
  var value = $el.val();
  if( value == 'less_than' || value == 'greater_than' ) {
    $el.next('.datepicker').show();
  } else {
    $el.next('.datepicker').val('').hide();
  }
}

function addFilter()
{
  $('#lockdown-customers-filter-secondary').find('.field-error').removeClass('field-error');
  var $main = $('#lockdown-customers-filter');
  var value1 = $main.val();
  if( !$main.length || !value1 ) return;

  var $secondaryFilters = $('div[data-rel=' + value1 + ']');
  if( !$secondaryFilters.length ) return;

  var $second = $secondaryFilters.find('.lockdown-customers-filter-2');
  var value2 = $second.val();
  if( !$second.length || !value2 ) {
    $second.addClass('field-error');
    return;
  }

  var $third = $secondaryFilters.find('.lockdown-customers-filter-3');
  var value3 = $third.val();
  if( $third.length && $third.is(':visible') && !value3 ) {
    $third.addClass('field-error');
    return;
  }

  if( value1 == 'money_spent' ) {
    value3 = parseFloat(value3);
    if( isNaN(value3) || isNaN(value3) ) {
      $third.addClass('field-error');
      return;
    }
    value3 = value3.toFixed(2);
  }
  if( value1 == 'orders_count' ) {
    value3 = parseInt(value3);
    if( isNaN(value3) || isNaN(value3) ) {
      $third.addClass('field-error');
      return;
    }
  }

  var title1 = $main.children(':selected').text().capitalizeFirstLetter();
  var title2 = ($second.prop('tagName') == 'SELECT') ? $second.children(':selected').text() : value2;

  var group = contentGroup;
  var itemNum = 1;
  if( !group ) {
    do {
      group = getRandomInt(1000000, 9999999);
    } while( $('span[data-group=' + group + ']').lenght )
  }

  var $dataGroup = $('span[data-group=' + group + ']');
  if( $dataGroup.length ) {
    $dataGroup.removeClass('group-tag-last');
    $dataGroup.each(function() {
      var value = parseInt($(this).attr('data-item'));
      itemNum = (value > itemNum) ? value : itemNum;
    });
    itemNum++;
  }

  var $content = $('<span data-group=' + group + ' data-item=' + itemNum + ' class="group-tag-last">');
  var $hidden  = $('<input type="hidden">');

  if( $third.length ) {
    if( value1 == 'money_spent' ) title2 += ' ' + $('#money_format').val().replace('{{amount}}', value3);
    else title2 += ' ' + value3;

    $content.append('<b>' + title1 + ':</b>');
    $content.append(' ' + title2);
    $content.append('<span class="add-or" onclick="showFilterForm(this);">+OR</span>');
    $content.append('<span class="close" onclick="removeFilter(this);">x</span>');
    $content.append( $hidden.attr('name', 'lockdown_customers[' + group + '][' + value1 + '][' + value2 + '][]').val(value3) );

  } else {
    $content.append('<b>' + title1 + ':</b>');
    $content.append(' ' + title2);
    $content.append('<span class="add-or" onclick="showFilterForm(this);">+OR</span>');
    $content.append('<span class="close" onclick="removeFilter(this);">x</span>');
    $content.append( $hidden.attr('name', 'lockdown_customers[' + group + '][' + value1 + '][]').val(value2) );
  }

  $('#lockdown-customers-errors').remove();


  if( $dataGroup.length ) {
    $dataGroup.last().after($content);
  } else {
    $('#lockdown-customers-filters > div').append($content);
  }

  cancelFilter();
}

function cancelFilter()
{
  $('#lockdown-customers-filter').val('');
  $('.lockdown-customers-filter-2').val('');
  $('.lockdown-customers-filter-3').val('');
  $('#lockdown-customers-filter-secondary > div').hide();
  $('#lockdown-customers-filter-secondary').find('.field-error').removeClass('field-error');
  $('#lockdown-customers-filters .tag > span').removeClass('active');
  $('#add-filter-form').hide();
}

function removeFilter(el)
{
  var group = parseInt($(el).parent().attr('data-group'));
  $(el).parent().remove();

  $('span[data-group=' + group + ']').last().addClass('group-tag-last');
}

function initWYSIWYG()
{
  var $wysiwygEl = $('textarea[data-spec=wysiwyg]');
  if( $wysiwygEl.length ) {
    var $valueEl = $wysiwygEl.next('[data-spec=wysiwyg-init-value]');
    if( $valueEl.length ) $wysiwygEl.val($valueEl.html());

    var editor = new tinymce.Editor($wysiwygEl.attr('id'), {
      menubar: false,
      statusbar: false,
      height: 160,
      content_css : "externals/css/base.css,externals/libraries/tinymce/base.css",
      plugins: [
        "advlist link textcolor code hr directionality lineheight"
      ],
      toolbar: "bold,italic,underline,strikethrough,|,forecolor,backcolor,|,alignleft,aligncenter,alignright,alignjustify,|,bullist,numlist,|,fontselect,formatselect,|,fontsizeselect,lineheightselect,|,ltr,rtl,|,link,unlink,code,|,hr,removeformat,",
      fontsize_formats: '8px 10px 12px 14px 18px 24px 36px 48px 60px 72px 90px',
      lineheight_formats: '8px 10px 12px 14px 18px 24px 36px 48px 60px 72px 90px',
      font_formats: "Arial=arial,helvetica,sans-serif;Arial Black=arial black,gadget,sans-serif;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier, monospace;Georgia=georgia,serif;Impact=impact,charcoal,sans-serif;Lucida Console=lucida console,Monaco,monospace;Lucida Sans Unicode=lucida sans unicode,lucida grande, sans-serif;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Trebuchet MS=trebuchet ms,helvetica,geneva;Verdana=verdana,geneva,sans-serif;Comfortaa=Comfortaa;Courgette=Courgette;Federo=Federo;Josefin Slab=Josefin Slab;Montserrat=Montserrat;Niconne=Niconne;Old Standard TT=Old Standard TT;Open Sans=Open Sans;Raleway=Raleway;Roboto Condensed=Roboto Condensed;Titillium Web=Titillium Web;"

    }, tinymce.EditorManager);

    editor.render();
  }
}

function createQuickLinks()
{
  var $contents = $('#lockdown-content-values > span');
  var $qlHolder = $('#lockdown-customers-quicklinks').empty();
  var shopURL = $('#shop-url').text();
  var hash = '#easylockdownpwd' + $('#lockdown-customers-password').val();

  $contents.each(function(i, el) {
    var type = $(el).attr('data-type');
    var link = '';

    if( type == 'website' || type == 'index' ) {
      link = shopURL + hash;

    } else if( type == 'cart' ) {
      link = shopURL + 'cart' + hash;

    } else if( type == 'search' ) {
      link = shopURL + 'search' + hash;

    } else {
      var handle = $(el).attr('data-handle') + '/' + hash;
      if( handle ) {
        if( type == 'pages' ) {
          link = shopURL + 'pages/' + handle;

        } else if( type == 'blogs' ) {
          link = shopURL + 'blogs/' + handle;

        } else if( type == 'collections' || type == 'collection_products' ) {
          link = shopURL + 'collections/' + handle;

        } else if( type == 'products' || type == 'product_view_onlys' ) {
          link = shopURL + 'products/' + handle;
        }
      }
    }

    if( link ) $qlHolder.append('<span><a href="' + link + '" target="_blank">' + link +'</a></span>');
  });
}

function changeAccessMode( el )
{
  if( (el.checked && el.value == '1') || (!el.checked && el.value != '1') ) {
    $('#lockdown-customers-password-holder').hide();
    $('#lockdown-customers-type-authorized-selector').hide();
    if( $('#lockdown-customers-type-authorized').prop('checked') ) {
      $('#lockdown-customers-type-logged-in').prop("checked", true);
    }

  } else {
    if( !$('#lockdown-content-values > span[data-type=hide_price]').length ) {
      $('#lockdown-customers-type-authorized-selector').show();
    }
    if( $('#lockdown-customers-type-authorized').prop('checked') ) {
      $('#lockdown-customers-password-holder').show();
    }
  }
}