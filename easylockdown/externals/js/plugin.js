"use strict";

var gSubmitHasError = false;

$(document).ready(function(){ });


// ------------------------------------------ Main ------------------------------------------
function removeLockdown( id )
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


// ------------------------------------------ Common  ------------------------------------------
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
        .attr('placeholder', 'Start typing product title…')
        .autocomplete({
          delay: 500,
          minLength: 1,
          source: $.proxy( this, "_source" ),
          appendTo: '#' + $holder.attr('id'),
          select: function( event, ui ) {
            $holder.find('.ui-autocomplete-input').val( ui.item.label );
            event.preventDefault();
            createQuickLinks();
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

function initAutocomplete( $holder )
{
  var $comboboxHolder = $holder.find('.autocomplete-combobox');
  $comboboxHolder.combobox($holder);
}

function getContentTitleByType( type )
{
  switch( type ) {
    case 'website':    return 'Whole Website'; break;
    case 'index':      return 'Home Page'; break;
    case 'signup':     return 'Sign Up Page'; break;
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

function createQuickLinks()
{
  var $qlHolder = $('#lockdown-customers-quicklinks').empty();
  var shopURL = $('#shop-url').text();
  var hash = '#easylockdownpwd' + $('#lockdown-customers-password').val();
  var secondaryType, $tertiaryHolder;

  function _addQL( shortUrl )
  {
    var link = shopURL + shortUrl + hash;
    $qlHolder.append('<span><a href="' + link + '" target="_blank">' + link +'</a></span>');
  }

  $('.content-type-primary input[type=radio]:checked').each(function(i, el) {
    var $container  = $(el).parent().closest('.content-type-container');
    var primaryType = $(el).val();
    var $secondaryHolder = $container.find('.content-type-secondary[data-rel=' + primaryType + ']');

    if( $secondaryHolder.length ) {
      secondaryType = $secondaryHolder.find('select').val();
      $tertiaryHolder = $container.find('.content-type-tertiary[data-rel=' + secondaryType + ']');
    } else {
      secondaryType = '';
      $tertiaryHolder = $container.find('.content-type-tertiary[data-rel=' + primaryType + ']');
    }

    if( primaryType == 'website' ) {
      _addQL('');

    } else if( primaryType == 'pages' ) {
      if( secondaryType == 'index' ) {
        _addQL('');

      } else if( secondaryType == 'signup' ) {
        _addQL('account/register');

      } else if( secondaryType == 'cart' ) {
        _addQL('cart');

      } else if( secondaryType == 'search' ) {
        _addQL('search');

      } else if( secondaryType == 'pages' ) {
        var $sels = $tertiaryHolder.find('.content-data-holder select');
        $sels.each(function(i, el) {
          var selVal = $(el).val();
          var handle = $(el).children('option[value=' + $(el).val() + ']').attr('data-handle');
          if( handle ) _addQL('pages/' + handle + '/');
        });
      }

    } else if( primaryType == 'blogs' ) {
      var $sels = $tertiaryHolder.find('.content-data-holder select');
      $sels.each(function(i, el) {
        var selVal = $(el).val();
        var handle = $(el).children('option[value=' + $(el).val() + ']').attr('data-handle');
        if( handle ) _addQL('blogs/' + handle + '/');
      });

    } else if( primaryType == 'collections' && (secondaryType == 'collections' || secondaryType == 'collection_products') ) {
      var $sels = $tertiaryHolder.find('.content-data-holder select');
      $sels.each(function(i, el) {
        var selVal = $(el).val();
        var handle = $(el).children('option[value=' + $(el).val() + ']').attr('data-handle');
        if( handle ) _addQL('collections/' + handle + '/');
      });

    } else if( primaryType == 'products' || (primaryType == 'view-only' && secondaryType == 'product_view_onlys') ) {
      var $sels = $tertiaryHolder.find('.content-data-holder select');
      $sels.each(function(i, el) {
        var selVal = $(el).val();
        var handle = $(el).children('option[value=' + $(el).val() + ']').attr('data-handle');
        if( handle ) _addQL('products/' + handle + '/');
      });
    }
  });

  $('#lockdown-customers-quicklinks-holder').toggle( $qlHolder.text() != '' );
}

function initWYSIWYG()
{
  var $wysiwygEls = $('textarea[data-spec=wysiwyg]');
  if( $wysiwygEls.length ) {
    $wysiwygEls.each(function(){
      var $wysiwygEl = $(this);
      var $valueEl = $wysiwygEl.next('[data-spec=wysiwyg-init-value]');
      if( $valueEl.length ) $wysiwygEl.val($valueEl.html());

      var editor = new tinymce.Editor($wysiwygEl.attr('id'), {
        theme: "modern",
        skin: 'light',
        branding: false,
        menubar: false,
        statusbar: false,
        height: 200,
        /*content_css : "externals/css/base.css,externals/libraries/tinymce/base.css",*/
        plugins: [
          "advlist link textcolor code hr directionality lineheight"
        ],
        toolbar: "bold,italic,underline,strikethrough,|,forecolor,backcolor,|,alignleft,aligncenter,alignright,alignjustify,|,ltr,rtl,|,link,unlink,|,code,|,hr,|,removeformat,|,bullist,numlist,|,fontselect,formatselect,|,fontsizeselect,lineheightselect,",
        fontsize_formats: '8px 10px 12px 14px 18px 24px 36px 48px 60px 72px 90px',
        lineheight_formats: '8px 10px 12px 14px 18px 24px 36px 48px 60px 72px 90px',
        font_formats: "Arial=arial,helvetica,sans-serif;Arial Black=arial black,gadget,sans-serif;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier, monospace;Georgia=georgia,serif;Impact=impact,charcoal,sans-serif;Lucida Console=lucida console,Monaco,monospace;Lucida Sans Unicode=lucida sans unicode,lucida grande, sans-serif;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Trebuchet MS=trebuchet ms,helvetica,geneva;Verdana=verdana,geneva,sans-serif;Comfortaa=Comfortaa;Courgette=Courgette;Federo=Federo;Josefin Slab=Josefin Slab;Montserrat=Montserrat;Niconne=Niconne;Old Standard TT=Old Standard TT;Open Sans=Open Sans;Raleway=Raleway;Roboto Condensed=Roboto Condensed;Titillium Web=Titillium Web;"

      }, tinymce.EditorManager);

      editor.render();
    });
  }
}

function hideAndShow()
{
  var $accessModeEl = $("input:radio[name='lockdown_customers[access_mode]']:checked");
  if( !$accessModeEl.length ) return;

  var accessMode = parseInt($("input:radio[name='lockdown_customers[access_mode]']:checked").val());

  if( accessMode ) {
    $('#lockdown-customers-type-authorized-selector').hide();
    if( $('#lockdown-customers-type-authorized').prop('checked') ) {
      $('#lockdown-customers-type-logged-in').prop("checked", true);
    }
  } else {
    $('#lockdown-customers-type-authorized-selector').show();
  }

  var permissionType = $("input:radio[name='lockdown_customers[type]']:checked").val();
  if( permissionType && $('.master-step-3').length ) $('.master-step-3').removeClass('master-step-holder').removeClass(' master-step-3');

  var primaryTypes = [];
  $.each($('.content-type-primary input[type=radio]:checked'), function(i, radio){ primaryTypes.push( radio.value ) });
  if( !primaryTypes.length ) return;

  if( $('.master-step-4').length ) $('.master-step-4').removeClass('master-step-holder').removeClass(' master-step-4');
  if( $('.master-step-5').length ) $('.master-step-5').removeClass('master-step-holder').removeClass(' master-step-5');

  if( $.inArray('hide_price', primaryTypes) >= 0 ) {
    $('#lockdown-customers-type-authorized-selector').hide();
    if( $('#lockdown-customers-type-authorized').prop('checked') ) {
      $('#lockdown-customers-type-logged-in').prop("checked", true);
    }

    $('#how-to-lock-section').hide();
    $('#additional-settings-section').hide();
    $('#hide-links-section').hide();
    $('#hide-price-custom-section').show();

    $('.customers-type-secondary').hide();
    if( permissionType == 'selected' || permissionType == 'location' ) {
      $('.customers-type-secondary[data-rel=' + permissionType +']').show();
    }

    var mode = $("input:radio[name='lockdown_redirect[hide_price_link_mode]']:checked").val();
    if( accessMode && permissionType == 'logged_in' ) {
      $('#lockdown-hide-price-login-holder').hide();
      if( mode == 'login' ) {
        $('#lockdown-hide-price-no-link').prop("checked", true);
        mode = '';
      }
    } else {
      $('#lockdown-hide-price-login-holder').show();
    }

    if( mode == 'page' || mode == 'login' ) {
      $('#hide-price-text-holder').show();
    } else {
      $('#hide-price-text-holder').hide();
    }

  } else {
    var $redirectModeEl = $("input:radio[name='lockdown_redirect[mode]']:checked");
    if( $('.master-step-6').length && ($redirectModeEl.length || permissionType == 'authorized') ) $('.master-step-6').removeClass('master-step-holder').removeClass(' master-step-6');

    $('#how-to-lock-section').show();
    $('#additional-settings-section').show();
    $('#hide-price-custom-section').hide();

    var hideHowToLockSection = false;
    var hideAdditionalSettingsSection = false;

    if( $.inArray('website', primaryTypes) >= 0 ) {
      $('#hide-links-section').hide();

    } else {
      var showHideLinksByFilter = false;
      var showHideLinksByJS = false;

      if( $.inArray('pages', primaryTypes) >= 0 || $.inArray('blogs', primaryTypes) >= 0 || $.inArray('collections', primaryTypes) >= 0 || $.inArray('products', primaryTypes) >= 0 ) {
        if( $.inArray('pages', primaryTypes) ) {
          var secondaryTypes = [];

          $.each($('.content-type-primary input[type=radio]:checked'), function(i, radio){
            var $sh = $(radio).parent().closest('.content-type-holder').find('.content-type-secondary[data-rel=' + radio.value + ']');
            if( $sh.length && $sh.find('select').length ) secondaryTypes.push( $sh.find('select').val() );
          });

          if( $.inArray('pages', secondaryTypes) ) showHideLinksByFilter = true;

        } else {
          showHideLinksByFilter = true;
        }
        showHideLinksByJS = ((showHideLinksByFilter && $('#hide-links-by-filters').prop('checked')) || !showHideLinksByFilter);

      } else if( $.inArray('view-only', primaryTypes) >= 0 ) {
        hideHowToLockSection = true;
        hideAdditionalSettingsSection = true;
      }

      $('#hide-links-section').toggle(showHideLinksByFilter || showHideLinksByJS);
      $('#hide-links-by-filters-holder').toggle(showHideLinksByFilter);
      $('#hide-links-by-js-holder').toggle(showHideLinksByJS);
      if( !showHideLinksByJS ) $('#hide-links-by-js').prop('checked', false);
    }

    $('.customers-type-secondary').hide();
    $('.customers-type-secondary[data-rel=' + permissionType +']').show();
    if( permissionType == 'authorized' ) {
      hideAdditionalSettingsSection = true;
      hideHowToLockSection = true;
    }

    if( hideHowToLockSection ) $('#how-to-lock-section').hide();
    if( hideAdditionalSettingsSection ) $('#additional-settings-section').hide();
  }
}

function hideAndShowVS( type )
{
  if( type != 'customers' && type != 'redirect' && type != 'hide-price' ) return;

  var primaryFieldName;
  if( type == 'customers' )  primaryFieldName = 'lockdown_customers[type]';
  if( type == 'redirect' )   primaryFieldName = 'lockdown_redirect[mode]';
  if( type == 'hide-price' ) primaryFieldName = 'lockdown_redirect[hide_price_link_mode]';

  $('.' + type + '-type-secondary').hide();
  $('.' + type + '-type-tertiary').hide();
  var primaryType = $("input:radio[name='" + primaryFieldName + "']:checked").val();
  if( !primaryType ) return;

  var $secondaryHolder = $('.' + type + '-type-secondary[data-rel=' + primaryType + ']');
  if( $secondaryHolder.length ) $secondaryHolder.show();

  hideAndShow();
}

function hideAndShowVSContent( el )
{
  var $container = $(el).closest('.content-type-container');
  var group = $container.attr('data-content-group');

  var primaryType = $("input:radio[name='lockdown-content-vs-type[" + group + "]']:checked").val();
  $container.find('.content-type-secondary').hide();
  $container.find('.content-type-tertiary').hide();
  if( !primaryType ) return;

  if( primaryType == 'website' || primaryType == 'hide_price' ) {
    if( $container.siblings('.content-type-container').length ) {
      var text = ( primaryType == 'website' ) ? "Whole website will override all other selected content, so other rules will be deleted. Are you sure?" : "Prices will override all other selected content, so other rules will be deleted. Are you sure?"
      ShopifyApp.Modal.confirm(text, function(result){
        if( result ) {
          $('#add-content-container-holder').hide();
          $container.siblings('.content-type-container').remove();
        } else {
          clearContentContainer( $container, true );
        }

        createQuickLinks();
        hideAndShow();
      });
    } else {
      $('#add-content-container-holder').hide();
    }

  } else {
    $('#add-content-container-holder').show();
    var $secondaryHolder = $container.find('.content-type-secondary[data-rel=' + primaryType + ']');
    var $tertiaryHolder = null;

    if( $secondaryHolder.length ) {
      $secondaryHolder.show();
      var secondaryType = $secondaryHolder.find("select[name='lockdown-content-vs-" + primaryType + '[' + group + "]']").val();
      if( secondaryType ) $tertiaryHolder = $container.find('.content-type-tertiary[data-rel=' + secondaryType + ']');

    } else {
      $tertiaryHolder = $container.find('.content-type-tertiary[data-rel=' + primaryType + ']');
    }

    if( $tertiaryHolder && $tertiaryHolder.length ) $tertiaryHolder.show();
  }

  removeExceptionsByContent();
  createQuickLinks();
  hideAndShow();
}

function hideAndShowVSExceptions( el )
{
  var $container = $(el).closest('.exceptions-type-container');
  var group = $container.attr('data-exceptions-group');

  var primaryType = $("input:radio[name='lockdown-exceptions-vs-type[" + group + "]']:checked").val();
  $container.find('.exceptions-type-secondary').hide();
  $container.find('.exceptions-type-tertiary').hide();
  if( !primaryType ) return;

  var $secondaryHolder = $container.find('.exceptions-type-secondary[data-rel=' + primaryType + ']');
  var $tertiaryHolder = null;

  if( $secondaryHolder.length ) {
    $secondaryHolder.show();
    var secondaryType = $secondaryHolder.find("select[name='lockdown-exceptions-vs-" + primaryType + '[' + group + "]']").val();
    if( secondaryType ) $tertiaryHolder = $container.find('.exceptions-type-tertiary[data-rel=' + secondaryType + ']');

  } else {
    $tertiaryHolder = $container.find('.exceptions-type-tertiary[data-rel=' + primaryType + ']');
  }

  if( $tertiaryHolder && $tertiaryHolder.length ) $tertiaryHolder.show();

  hideAndShow();
}

function showAdditionalSettingsContainer()
{
  $('.additional-setting-container').removeClass('hidden');
  $('#show-additional-setting-holder').remove();

  $('body.template-lockdown').animate({ scrollTop: $('#additional-settings-section').offset().top }, 500);
}


/* ----------------------------------------------------------- content ----------------------------------------------------------- */
function disableContentVariations( el )
{
  var $holder = $(el).closest('.content-data-list');
  if( !$holder.length ) return;

  var allOptionsSelector = [];
  var $sels = $holder.find('select');
  if( !$sels.length ) {
    createQuickLinks();
    return;
  }

  $sels.each(function(i, el){
    $(el).parent().closest('.content-data-holder').attr('data-id', $(el).val());
    allOptionsSelector.push('option[value="' + $(el).val() + '"]');
  });

  $sels.each(function(){
    $(this).children('option[disabled]:not(option[data-disabled])').prop('disabled', false);
    $(this).children( allOptionsSelector.join(',') ).filter(':not(option[value="' + $(this).val() + '"])').prop('disabled', true);
  });
}

function renderContentData( holder )
{
  var $holder  = $(holder);
  var dataId   = $holder.attr('data-id');
  var dataType = $holder.attr('data-type');
  var dataTitle  = $holder.attr('data-title');
  var dataHandle = $holder.attr('data-handle');

  var contentType = dataType;
  if( contentType == 'collection_products' ) contentType = 'collections';

  if( dataType == 'pages' || dataType == 'blogs' || dataType == 'collections' || dataType == 'collection_products' ) {
    var $data = $('#supporting-' + contentType + '-list');
    if( !$data.length ) return;

    $data = $data.clone();
    $data.children('select').attr('onchange', 'disableContentVariations(this);');
    if( dataId ) $data.val( dataId ).find('option[value="' + dataId + '"]').attr('selected', true);

    var render = [
      '<div class="lockdown-content-data-holder">',
        $data.html(),
      '</div>',
      '<div class="lockdown-content-remove-holder">',
        '<svg width="16px" height="16px" onclick="removeContentItem(this)">',
          '<g transform="translate(-813.000000, -522.000000)" fill="#919EAB">',
            '<path d="M819.87323,530.121285 C819.395949,530.585884 818.91823,531.050076 818.444259,531.518111 C818.229173,531.730479 818.226674,531.932819 818.42739,532.145874 C818.534449,532.259462 818.645381,532.369395 818.754877,532.480671 C819.010137,532.74018 819.194546,532.741617 819.459615,532.483389 C819.858454,532.094891 820.257542,531.706549 820.653507,531.315083 C820.76294,531.2069 820.861658,531.087845 820.979744,530.957825 C821.046035,531.035362 821.080867,531.081035 821.120636,531.121896 C821.585109,531.599334 822.048739,532.077615 822.516024,532.552273 C822.737483,532.777231 822.938354,532.775794 823.16653,532.556896 C823.290458,532.438029 823.41398,532.318599 823.53441,532.196202 C823.720974,532.006514 823.72769,531.818325 823.554216,531.615922 C823.486613,531.537011 823.411169,531.464784 823.338536,531.390246 C822.892338,530.932489 822.44589,530.474889 821.989977,530.007479 C822.090569,529.910729 822.184569,529.821383 822.277383,529.730819 C822.694528,529.323796 823.113422,528.918522 823.527475,528.508375 C823.772113,528.266016 823.771051,528.048212 823.534941,527.804323 C823.42279,527.688424 823.311233,527.571681 823.195083,527.459811 C823.050974,527.32095 822.883747,527.295989 822.70996,527.394363 C822.629768,527.439786 822.556198,527.501204 822.489657,527.565683 C822.033744,528.007507 821.580548,528.452143 821.126165,528.895561 C821.090552,528.930299 821.052626,528.962664 821.046222,528.968506 C820.771437,528.710684 820.501588,528.465857 820.241516,528.211097 C819.992535,527.967145 819.7563,527.71026 819.509693,527.463841 C819.271802,527.226106 819.056497,527.226293 818.8172,527.456312 C818.71967,527.550063 818.623638,527.645375 818.527576,527.740688 C818.292996,527.973549 818.285405,528.183887 818.503709,528.434586 C818.548069,528.485538 818.596772,528.532773 818.643976,528.581195 C819.097671,529.046543 819.55146,529.511766 820.025993,529.998326 C819.97023,530.042811 819.917747,530.077956 819.87323,530.121285 M820.974527,536.613697 C824.752262,536.603387 827.74391,533.50718 827.627448,529.748314 C827.517265,526.191631 824.590815,523.272022 820.873248,523.31179 C817.270768,523.350372 814.320044,526.370948 814.332102,529.966055 C814.344192,533.575408 817.244589,536.59514 820.974527,536.613697 M820.502775,522 L821.533688,522 C821.583609,522.010684 821.633124,522.024211 821.683577,522.031646 C822.012344,522.080161 822.345329,522.108558 822.669536,522.178098 C824.365263,522.541854 825.796577,523.372021 826.955761,524.660881 C827.971336,525.790075 828.611783,527.106957 828.874166,528.604125 C828.926055,528.900184 828.958576,529.199649 829,529.497552 L829,530.528465 C828.989097,530.578136 828.975133,530.62737 828.967854,530.677604 C828.920838,531.001373 828.894941,531.32961 828.825994,531.648568 C828.433123,533.466256 827.530761,534.987446 826.088107,536.160657 C824.112284,537.76757 821.849023,538.32445 819.358711,537.817054 C817.209475,537.379103 815.517746,536.207111 814.315077,534.373616 C813.105284,532.529249 812.738623,530.502192 813.180291,528.344584 C813.531333,526.629801 814.38268,525.187709 815.688753,524.022152 C816.813323,523.018605 818.122615,522.385062 819.608848,522.125178 C819.905064,522.073351 820.204716,522.041205 820.502775,522" id="ic-remove"></path>',
          '</g>',
        '</svg>',
      '</div>'
    ].join('');

    $holder.html( render );

  } else if( dataType == 'products' || dataType == 'product_view_onlys' ) {
    var render = [
      '<div class="lockdown-content-data-holder"></div>',
      '<div class="lockdown-content-remove-holder">',
        '<svg width="16px" height="16px" onclick="removeContentItem(this)">',
          '<g transform="translate(-813.000000, -522.000000)" fill="#919EAB">',
            '<path d="M819.87323,530.121285 C819.395949,530.585884 818.91823,531.050076 818.444259,531.518111 C818.229173,531.730479 818.226674,531.932819 818.42739,532.145874 C818.534449,532.259462 818.645381,532.369395 818.754877,532.480671 C819.010137,532.74018 819.194546,532.741617 819.459615,532.483389 C819.858454,532.094891 820.257542,531.706549 820.653507,531.315083 C820.76294,531.2069 820.861658,531.087845 820.979744,530.957825 C821.046035,531.035362 821.080867,531.081035 821.120636,531.121896 C821.585109,531.599334 822.048739,532.077615 822.516024,532.552273 C822.737483,532.777231 822.938354,532.775794 823.16653,532.556896 C823.290458,532.438029 823.41398,532.318599 823.53441,532.196202 C823.720974,532.006514 823.72769,531.818325 823.554216,531.615922 C823.486613,531.537011 823.411169,531.464784 823.338536,531.390246 C822.892338,530.932489 822.44589,530.474889 821.989977,530.007479 C822.090569,529.910729 822.184569,529.821383 822.277383,529.730819 C822.694528,529.323796 823.113422,528.918522 823.527475,528.508375 C823.772113,528.266016 823.771051,528.048212 823.534941,527.804323 C823.42279,527.688424 823.311233,527.571681 823.195083,527.459811 C823.050974,527.32095 822.883747,527.295989 822.70996,527.394363 C822.629768,527.439786 822.556198,527.501204 822.489657,527.565683 C822.033744,528.007507 821.580548,528.452143 821.126165,528.895561 C821.090552,528.930299 821.052626,528.962664 821.046222,528.968506 C820.771437,528.710684 820.501588,528.465857 820.241516,528.211097 C819.992535,527.967145 819.7563,527.71026 819.509693,527.463841 C819.271802,527.226106 819.056497,527.226293 818.8172,527.456312 C818.71967,527.550063 818.623638,527.645375 818.527576,527.740688 C818.292996,527.973549 818.285405,528.183887 818.503709,528.434586 C818.548069,528.485538 818.596772,528.532773 818.643976,528.581195 C819.097671,529.046543 819.55146,529.511766 820.025993,529.998326 C819.97023,530.042811 819.917747,530.077956 819.87323,530.121285 M820.974527,536.613697 C824.752262,536.603387 827.74391,533.50718 827.627448,529.748314 C827.517265,526.191631 824.590815,523.272022 820.873248,523.31179 C817.270768,523.350372 814.320044,526.370948 814.332102,529.966055 C814.344192,533.575408 817.244589,536.59514 820.974527,536.613697 M820.502775,522 L821.533688,522 C821.583609,522.010684 821.633124,522.024211 821.683577,522.031646 C822.012344,522.080161 822.345329,522.108558 822.669536,522.178098 C824.365263,522.541854 825.796577,523.372021 826.955761,524.660881 C827.971336,525.790075 828.611783,527.106957 828.874166,528.604125 C828.926055,528.900184 828.958576,529.199649 829,529.497552 L829,530.528465 C828.989097,530.578136 828.975133,530.62737 828.967854,530.677604 C828.920838,531.001373 828.894941,531.32961 828.825994,531.648568 C828.433123,533.466256 827.530761,534.987446 826.088107,536.160657 C824.112284,537.76757 821.849023,538.32445 819.358711,537.817054 C817.209475,537.379103 815.517746,536.207111 814.315077,534.373616 C813.105284,532.529249 812.738623,530.502192 813.180291,528.344584 C813.531333,526.629801 814.38268,525.187709 815.688753,524.022152 C816.813323,523.018605 818.122615,522.385062 819.608848,522.125178 C819.905064,522.073351 820.204716,522.041205 820.502775,522" id="ic-remove"></path>',
          '</g>',
        '</svg>',
      '</div>'
    ].join('');

    $holder.html( render );
    var $dataHolder = $holder.find('.lockdown-content-data-holder');

    var $select = $('<select class="">');
    if( dataId && dataTitle ) $select.addClass('autocomplete-combobox').html('<option value="' + dataId + '" data-handle="' + dataHandle + '">' + dataTitle + '</option>');
    else $select.addClass('autocomplete-combobox').html('<option value=""></option>');
    $dataHolder.append($select).append('<div class="autocomplete-loader loader"><div class="next-spinner"><svg class="next-icon next-icon--20" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div></div>');

    initAutocomplete( $dataHolder );
  }
}

function addContentItem( btn )
{
  var $container = $(btn).parent().closest('.content-type-tertiary');
  var type = $container.attr('data-rel');

  var $holder = $('<div class="content-data-holder" data-type="' + type + '">');
  $container.children('.content-data-list').append( $holder );

  renderContentData( $holder );
  disableContentVariations( $holder );
  createQuickLinks();
}

function removeContentItem( btn )
{
  var $holder = $(btn).parent().closest('.content-data-list');

  $(btn).parent().closest('.content-data-holder').remove();
  disableContentVariations($holder);
  createQuickLinks();
}

function addContentContainer()
{
  var $container = $('#content-section .content-type-container:first').clone();
  var group;

  do {
    group = getRandomInt(1000000, 9999999);
  } while( $('.content-type-container[data-content-group=' + group + ']').lenght );

  var htmlNew = $container.html();
  htmlNew = htmlNew.replace(new RegExp(/(lockdown-content-vs)-\d+?-/, 'gi'), '$1-' + group + '-');
  htmlNew = htmlNew.replace(new RegExp(/(lockdown-content-vs-.+?)\[\d+?\]/, 'gi'), '$1[' + group + ']');
  $container.attr('data-content-group', group).html( htmlNew );

  clearContentContainer( $container );
  $('#add-content-container-holder').before( $container );
  $('.lockdown-content-container-remove-holder').show();

  createQuickLinks();
  $('body.template-lockdown').animate({ scrollTop: $container.offset().top }, 500);
}

function removeContentContainer( btn )
{
  var $container = $(btn).parent().closest('.content-type-container');

  if( $container.siblings('.content-type-container').length ) {
    if( $container.siblings('.content-type-container').length == 1 ) {
      $('.lockdown-content-container-remove-holder').hide();
    }
    $container.remove();
  }

  createQuickLinks();
}

function clearContentContainer( $container, ligthClear )
{
  $container.find('.content-type-primary input[type=radio]:checked').prop('checked', false);

  if( !ligthClear ) {
    $container.find('.content-type-secondary select > option:selected').prop('selected', false);

    var $ctts = $container.find('.content-type-tertiary');
    var list = ['pages', 'blogs', 'collections', 'products'];

    $ctts.each(function(i, ctt){
      $.each(list, function(j, type){
        var $el = $('<div class="content-data-holder" data-type="' + type + '" data-id=""></div>');
        $(ctt).find('.content-' + type + '-list').html($el);
        renderContentData( $el );
      });
    });
  }

  hideAndShowVSContent($container);
}


/* ----------------------------------------------------------- exceptions ----------------------------------------------------------- */
function disableExceptionsVariations( el )
{
  var $holder = $(el).closest('.exceptions-data-list');
  if( !$holder.length ) return;

  var allOptionsSelector = [];
  var $sels = $holder.find('select');
  if( !$sels.length ) return;

  $sels.each(function(i, el){
    $(el).parent().closest('.exceptions-data-holder').attr('data-id', $(el).val());
    allOptionsSelector.push('option[value="' + $(el).val() + '"]');
  });

  $sels.each(function(){
    $(this).children('option[disabled]:not(option[data-disabled])').prop('disabled', false);
    $(this).children( allOptionsSelector.join(',') ).filter(':not(option[value="' + $(this).val() + '"])').prop('disabled', true);
  });
}

function renderExceptionsData( holder )
{
  var $holder   = $(holder);
  var dataId    = $holder.attr('data-id');
  var dataType  = $holder.attr('data-type');
  var dataTitle = $holder.attr('data-title');

  var exceptionType = dataType;
  if( exceptionType == 'collection_products' ) exceptionType = 'collections';

  if( dataType == 'pages' || dataType == 'blogs' || dataType == 'collections' || dataType == 'collection_products' ) {
    var $data = $('#supporting-' + exceptionType + '-list');
    if( !$data.length ) return;

    $data = $data.clone();
    $data.children('select').attr('onchange', 'disableExceptionsVariations(this);');
    if( dataId ) $data.val( dataId ).find('option[value="' + dataId + '"]').attr('selected', true);

    var render = [
      '<div class="lockdown-exceptions-data-holder">',
        $data.html(),
      '</div>',
      '<div class="lockdown-exceptions-remove-holder">',
        '<svg width="16px" height="16px" onclick="removeExceptionItem(this)">',
          '<g transform="translate(-813.000000, -522.000000)" fill="#919EAB">',
            '<path d="M819.87323,530.121285 C819.395949,530.585884 818.91823,531.050076 818.444259,531.518111 C818.229173,531.730479 818.226674,531.932819 818.42739,532.145874 C818.534449,532.259462 818.645381,532.369395 818.754877,532.480671 C819.010137,532.74018 819.194546,532.741617 819.459615,532.483389 C819.858454,532.094891 820.257542,531.706549 820.653507,531.315083 C820.76294,531.2069 820.861658,531.087845 820.979744,530.957825 C821.046035,531.035362 821.080867,531.081035 821.120636,531.121896 C821.585109,531.599334 822.048739,532.077615 822.516024,532.552273 C822.737483,532.777231 822.938354,532.775794 823.16653,532.556896 C823.290458,532.438029 823.41398,532.318599 823.53441,532.196202 C823.720974,532.006514 823.72769,531.818325 823.554216,531.615922 C823.486613,531.537011 823.411169,531.464784 823.338536,531.390246 C822.892338,530.932489 822.44589,530.474889 821.989977,530.007479 C822.090569,529.910729 822.184569,529.821383 822.277383,529.730819 C822.694528,529.323796 823.113422,528.918522 823.527475,528.508375 C823.772113,528.266016 823.771051,528.048212 823.534941,527.804323 C823.42279,527.688424 823.311233,527.571681 823.195083,527.459811 C823.050974,527.32095 822.883747,527.295989 822.70996,527.394363 C822.629768,527.439786 822.556198,527.501204 822.489657,527.565683 C822.033744,528.007507 821.580548,528.452143 821.126165,528.895561 C821.090552,528.930299 821.052626,528.962664 821.046222,528.968506 C820.771437,528.710684 820.501588,528.465857 820.241516,528.211097 C819.992535,527.967145 819.7563,527.71026 819.509693,527.463841 C819.271802,527.226106 819.056497,527.226293 818.8172,527.456312 C818.71967,527.550063 818.623638,527.645375 818.527576,527.740688 C818.292996,527.973549 818.285405,528.183887 818.503709,528.434586 C818.548069,528.485538 818.596772,528.532773 818.643976,528.581195 C819.097671,529.046543 819.55146,529.511766 820.025993,529.998326 C819.97023,530.042811 819.917747,530.077956 819.87323,530.121285 M820.974527,536.613697 C824.752262,536.603387 827.74391,533.50718 827.627448,529.748314 C827.517265,526.191631 824.590815,523.272022 820.873248,523.31179 C817.270768,523.350372 814.320044,526.370948 814.332102,529.966055 C814.344192,533.575408 817.244589,536.59514 820.974527,536.613697 M820.502775,522 L821.533688,522 C821.583609,522.010684 821.633124,522.024211 821.683577,522.031646 C822.012344,522.080161 822.345329,522.108558 822.669536,522.178098 C824.365263,522.541854 825.796577,523.372021 826.955761,524.660881 C827.971336,525.790075 828.611783,527.106957 828.874166,528.604125 C828.926055,528.900184 828.958576,529.199649 829,529.497552 L829,530.528465 C828.989097,530.578136 828.975133,530.62737 828.967854,530.677604 C828.920838,531.001373 828.894941,531.32961 828.825994,531.648568 C828.433123,533.466256 827.530761,534.987446 826.088107,536.160657 C824.112284,537.76757 821.849023,538.32445 819.358711,537.817054 C817.209475,537.379103 815.517746,536.207111 814.315077,534.373616 C813.105284,532.529249 812.738623,530.502192 813.180291,528.344584 C813.531333,526.629801 814.38268,525.187709 815.688753,524.022152 C816.813323,523.018605 818.122615,522.385062 819.608848,522.125178 C819.905064,522.073351 820.204716,522.041205 820.502775,522" id="ic-remove"></path>',
          '</g>',
        '</svg>',
      '</div>'
    ].join('');

    $holder.html( render );

  } else if( dataType == 'products' ) {
    var render = [
      '<div class="lockdown-exceptions-data-holder"></div>',
      '<div class="lockdown-exceptions-remove-holder">',
        '<svg width="16px" height="16px" onclick="removeExceptionItem(this)">',
          '<g transform="translate(-813.000000, -522.000000)" fill="#919EAB">',
            '<path d="M819.87323,530.121285 C819.395949,530.585884 818.91823,531.050076 818.444259,531.518111 C818.229173,531.730479 818.226674,531.932819 818.42739,532.145874 C818.534449,532.259462 818.645381,532.369395 818.754877,532.480671 C819.010137,532.74018 819.194546,532.741617 819.459615,532.483389 C819.858454,532.094891 820.257542,531.706549 820.653507,531.315083 C820.76294,531.2069 820.861658,531.087845 820.979744,530.957825 C821.046035,531.035362 821.080867,531.081035 821.120636,531.121896 C821.585109,531.599334 822.048739,532.077615 822.516024,532.552273 C822.737483,532.777231 822.938354,532.775794 823.16653,532.556896 C823.290458,532.438029 823.41398,532.318599 823.53441,532.196202 C823.720974,532.006514 823.72769,531.818325 823.554216,531.615922 C823.486613,531.537011 823.411169,531.464784 823.338536,531.390246 C822.892338,530.932489 822.44589,530.474889 821.989977,530.007479 C822.090569,529.910729 822.184569,529.821383 822.277383,529.730819 C822.694528,529.323796 823.113422,528.918522 823.527475,528.508375 C823.772113,528.266016 823.771051,528.048212 823.534941,527.804323 C823.42279,527.688424 823.311233,527.571681 823.195083,527.459811 C823.050974,527.32095 822.883747,527.295989 822.70996,527.394363 C822.629768,527.439786 822.556198,527.501204 822.489657,527.565683 C822.033744,528.007507 821.580548,528.452143 821.126165,528.895561 C821.090552,528.930299 821.052626,528.962664 821.046222,528.968506 C820.771437,528.710684 820.501588,528.465857 820.241516,528.211097 C819.992535,527.967145 819.7563,527.71026 819.509693,527.463841 C819.271802,527.226106 819.056497,527.226293 818.8172,527.456312 C818.71967,527.550063 818.623638,527.645375 818.527576,527.740688 C818.292996,527.973549 818.285405,528.183887 818.503709,528.434586 C818.548069,528.485538 818.596772,528.532773 818.643976,528.581195 C819.097671,529.046543 819.55146,529.511766 820.025993,529.998326 C819.97023,530.042811 819.917747,530.077956 819.87323,530.121285 M820.974527,536.613697 C824.752262,536.603387 827.74391,533.50718 827.627448,529.748314 C827.517265,526.191631 824.590815,523.272022 820.873248,523.31179 C817.270768,523.350372 814.320044,526.370948 814.332102,529.966055 C814.344192,533.575408 817.244589,536.59514 820.974527,536.613697 M820.502775,522 L821.533688,522 C821.583609,522.010684 821.633124,522.024211 821.683577,522.031646 C822.012344,522.080161 822.345329,522.108558 822.669536,522.178098 C824.365263,522.541854 825.796577,523.372021 826.955761,524.660881 C827.971336,525.790075 828.611783,527.106957 828.874166,528.604125 C828.926055,528.900184 828.958576,529.199649 829,529.497552 L829,530.528465 C828.989097,530.578136 828.975133,530.62737 828.967854,530.677604 C828.920838,531.001373 828.894941,531.32961 828.825994,531.648568 C828.433123,533.466256 827.530761,534.987446 826.088107,536.160657 C824.112284,537.76757 821.849023,538.32445 819.358711,537.817054 C817.209475,537.379103 815.517746,536.207111 814.315077,534.373616 C813.105284,532.529249 812.738623,530.502192 813.180291,528.344584 C813.531333,526.629801 814.38268,525.187709 815.688753,524.022152 C816.813323,523.018605 818.122615,522.385062 819.608848,522.125178 C819.905064,522.073351 820.204716,522.041205 820.502775,522" id="ic-remove"></path>',
          '</g>',
        '</svg>',
      '</div>'
    ].join('');

    $holder.html( render );
    var $dataHolder = $holder.find('.lockdown-exceptions-data-holder');

    var $select = $('<select class="">');
    if( dataId && dataTitle ) $select.addClass('autocomplete-combobox').html('<option value="' + dataId + '">' + dataTitle + '</option>');
    else $select.addClass('autocomplete-combobox').html('<option value=""></option>');
    $dataHolder.append($select).append('<div class="autocomplete-loader loader"><div class="next-spinner"><svg class="next-icon next-icon--20" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div></div>');

    initAutocomplete( $dataHolder );
  }
}

function addExceptionItem( btn )
{
  var $container = $(btn).parent().closest('.exceptions-type-tertiary');
  var type = $container.attr('data-rel');

  var $holder = $('<div class="exceptions-data-holder" data-type="' + type + '">');
  $container.children('.exceptions-data-list').append( $holder );

  renderExceptionsData( $holder );
  disableExceptionsVariations( $holder );
}

function removeExceptionItem( btn )
{
  var $holder = $(btn).parent().closest('.exceptions-data-list');

  $(btn).parent().closest('.exceptions-data-holder').remove();
  disableExceptionsVariations($holder);
}

function addExceptionsContainer()
{
  var $container = $('#exceptions-section .exceptions-type-container:first');
  if( $container.hasClass('hidden') ) {
    $container.removeClass('hidden');
    $('body.template-lockdown').animate({ scrollTop: $container.offset().top }, 500);
    return;
  }

  $container = $container.clone();
  var group;

  do {
    group = getRandomInt(1000000, 9999999);
  } while( $('.exceptions-type-container[data-exceptions-group=' + group + ']').lenght );

  var htmlNew = $container.html();
  htmlNew = htmlNew.replace(new RegExp(/(lockdown-exceptions-vs)-\d+?-/, 'gi'), '$1-' + group + '-');
  htmlNew = htmlNew.replace(new RegExp(/(lockdown-exceptions-vs-.+?)\[\d+?\]/, 'gi'), '$1[' + group + ']');
  $container.attr('data-exceptions-group', group).html( htmlNew );

  clearExceptionsContainer( $container );
  $('#add-exceptions-container-holder').before( $container );

  $('body.template-lockdown').animate({ scrollTop: $container.offset().top }, 500);
}

function removeExceptionsContainer( el )
{
  var $container = $(el).closest('.exceptions-type-container');

  if( $container.siblings('.exceptions-type-container').length ) {
    $container.remove();
  } else {
    clearExceptionsContainer( $container );
    $container.addClass('hidden')
  }
}

function testExceptionsBeforeRemove( label )
{
  var $label = $(label);
  var $radio = $label.prev('input[type=radio]');

  var newActivePrimaryType = $radio.val();
  var currentActivePrimaryType = $("input[type=radio][name='" + $radio.attr('name') + "']:checked").val();

  if( newActivePrimaryType == currentActivePrimaryType )
  if( newActivePrimaryType == 'website' ) return true;

  var $container = $radio.parent().closest('.content-type-container');
  var $otherContainer = $container.siblings('.content-type-container');

  var contentPrimaryTypes = [];
  $.each($otherContainer.find('.content-type-primary input[type=radio]:checked'), function(i, radio){ contentPrimaryTypes.push( radio.value ) });
  contentPrimaryTypes.push( newActivePrimaryType );

  if( $.inArray('website', contentPrimaryTypes) >= 0 ) return true;

  var showConfirm = !!$('.exceptions-vs-type-pages input[type=radio]:checked').length;
  if( !showConfirm ) showConfirm = !!$('.exceptions-vs-type-blogs input[type=radio]:checked').length;

  if( !showConfirm ) {
    if( $.inArray('collections', contentPrimaryTypes) < 0 ) showConfirm = !!$('.exceptions-vs-type-collections input[type=radio]:checked').length;
  }

  if( !showConfirm ) {
    if( $.inArray('collections', contentPrimaryTypes) < 0 && $.inArray('view-only', contentPrimaryTypes) < 0 ) showConfirm = !!$('.exceptions-vs-type-products input[type=radio]:checked').length;
  }

  if( showConfirm ) {
    ShopifyApp.Modal.confirm('Exceptions that can not work with this content type will be deleted automatically. Continue?', function(result){
      if( result ) {
        $radio.prop('checked', true).trigger('change');
      }
    });
    return false;
  }

  return true;
}

function removeExceptionsByContent( test )
{
  // ShopifyApp.Modal.confirm('are you sure?', function(result){
  // if( result ) {
  // } else {
  // }
  var contentPrimaryTypes = [];
  $.each($('.content-type-primary input[type=radio]:checked'), function(i, radio){ contentPrimaryTypes.push( radio.value ) });

  $('.exceptions-type-primary > .visual-setting').removeClass('hidden');

  if( $.inArray('website', contentPrimaryTypes) >= 0 ) {
    $('#exceptions-section').show();

  } else {
    $('.exceptions-vs-type-pages input[type=radio]:checked').closest('.exceptions-type-container').each(function(i, el){
      removeExceptionsContainer( el )
    });
    $('.exceptions-vs-type-pages').addClass('hidden');

    $('.exceptions-vs-type-blogs input[type=radio]:checked').closest('.exceptions-type-container').each(function(i, el){
      removeExceptionsContainer( el )
    });
    $('.exceptions-vs-type-blogs').addClass('hidden');

    if( $.inArray('collections', contentPrimaryTypes) < 0 ) {
      $('.exceptions-vs-type-collections input[type=radio]:checked').closest('.exceptions-type-container').each(function(i, el){
        removeExceptionsContainer( el )
      });
      $('.exceptions-vs-type-collections').addClass('hidden');
    }

    if( $.inArray('collections', contentPrimaryTypes) < 0 && $.inArray('view-only', contentPrimaryTypes) < 0 ) {
      $('.exceptions-vs-type-products input[type=radio]:checked').closest('.exceptions-type-container').each(function(i, el){
        removeExceptionsContainer( el )
      });
      $('.exceptions-vs-type-products').addClass('hidden');
    }

    if( $('.exceptions-type-container:first .exceptions-type-primary .visual-setting.hidden').length < 4 ) {
      $('#exceptions-section').show();
    } else {
      $('#exceptions-section').hide();
    }
  }
}

function clearExceptionsContainer( $container )
{
  $container.find('.exceptions-type-primary   input[type=radio]:checked').prop('checked', false);
  $container.find('.exceptions-type-secondary select > option:selected').prop('selected', false);

  var $etts = $container.find('.exceptions-type-tertiary');
  var list = ['pages', 'blogs', 'collections', 'products'];

  $etts.each(function(i, ett){
    $.each(list, function(j, type){
      var $el = $('<div class="exceptions-data-holder" data-type="' + type + '" data-id=""></div>');
      $(ett).find('.exceptions-' + type + '-list').html($el);
      renderExceptionsData( $el );
    });
  });

  hideAndShowVSExceptions($container);
}


/* ----------------------------------------------------------- customers ----------------------------------------------------------- */
function changeSelectedCustomersData( el )
{
  var $el = $(el);
  var $holder = $el.parent().closest('.customers-filter-data-holder');

  if( $el.hasClass('lockdown-customers-filter-primary') ) {
    $holder.attr('data-type', $el.val());
    $holder.attr('data-operator', '');
    $holder.attr('data-value', '');
  } else {
    $holder.attr('data-operator', $el.val());
    $holder.attr('data-value', '');
  }

  renderSelectedCustomersData( $holder );
  createQuickLinks();
}

function renderSelectedCustomersData( holder )
{
  var $holder = $(holder);

  var dataGroup    = $holder.attr('data-group');
  var dataType     = $holder.attr('data-type');
  var dataOperator = $holder.attr('data-operator');
  var dataValue    = $holder.attr('data-value');

  if( !dataType ) {
    dataOperator = '';
    dataValue = '';
  }

  var render = [
    '<div class="filter-form">',
    '  <div class="lockdown-customers-filter-primary-holder">',
    '    <select class="lockdown-customers-filter-primary" onchange="changeSelectedCustomersData(this);">',
    '      <option value="">Select a filter...</option>',
    '      <option value="money_spent"'  + ( dataType == 'money_spent'  ? ' selected' : '') + '>Money spent</option>',
    '      <option value="orders_count"' + ( dataType == 'orders_count' ? ' selected' : '') + '>Number of orders</option>',
    '      <option value="placed_order"' + ( dataType == 'placed_order' ? ' selected' : '') + '>Placed an order</option>',
    '      <option value="marketing"'    + ( dataType == 'marketing'    ? ' selected' : '') + '>Accepts marketing</option>',
    '      <option value="tagged"'       + ( dataType == 'tagged'       ? ' selected' : '') + '>Tagged with</option>',
    '      <option value="location"'     + ( dataType == 'location'     ? ' selected' : '') + '>Located in (based on shipping address)</option>',
    '    </select>',
    '  </div>'
  ].join('');

  if( dataType == 'money_spent' || dataType == 'orders_count' ) {
    render += [
      '<div class="lockdown-customers-filter-secondary-holder">',
      '  <select class="lockdown-customers-filter-secondary" onchange="changeSelectedCustomersData(this);">',
      '    <option value="equals"'       + ( dataOperator == 'equals'       ? ' selected' : '') + '>equal to</option>',
      '    <option value="not_equals"'   + ( dataOperator == 'not_equals'   ? ' selected' : '') + '>not equal to</option>',
      '    <option value="less_than"'    + ( dataOperator == 'less_than'    ? ' selected' : '') + '>less than</option>',
      '    <option value="greater_than"' + ( dataOperator == 'greater_than' ? ' selected' : '') + '>greater than</option>',
      '  </select>',
      '</div>',
      '<div class="lockdown-customers-filter-tertiary-holder">',
      '  <input type="number" name="lockdown_customers[' + dataGroup + '][' + dataType + '][' + dataOperator + '][]" class="lockdown-customers-filter-tertiary" maxlength="10" value="' + dataValue + '" />',
      '</div>'
    ].join('');

  } else if( dataType == 'placed_order' ) {
    var inputType = (dataOperator == 'less_than' || dataOperator == 'greater_than' ) ? 'text' : 'hidden';
    render += [
      '<div class="lockdown-customers-filter-secondary-holder">',
      '  <select class="lockdown-customers-filter-secondary" onchange="changeSelectedCustomersData(this);">',
      '    <option value="past_week"'    + ( dataOperator == 'past_week'    ? ' selected' : '') + '>in the last week</option>',
      '    <option value="past_month"'   + ( dataOperator == 'past_month'   ? ' selected' : '') + '>in the last month</option>',
      '    <option value="past_quarter"' + ( dataOperator == 'past_quarter' ? ' selected' : '') + '>in the last 3 months</option>',
      '    <option value="past_year"'    + ( dataOperator == 'past_year'    ? ' selected' : '') + '>in the last year</option>',
      '    <option value="less_than"'    + ( dataOperator == 'less_than'    ? ' selected' : '') + '>on or before</option>',
      '    <option value="greater_than"' + ( dataOperator == 'greater_than' ? ' selected' : '') + '>on or after</option>',
      '  </select>',
      '</div>',
      '<div class="lockdown-customers-filter-tertiary-holder" ' + (inputType == 'hidden' ? 'style="margin-right:0;"' : '') + '>',
      '  <input type="' + inputType + '" name="lockdown_customers[' + dataGroup + '][' + dataType + '][' + dataOperator + '][]" class="datepicker lockdown-customers-filter-tertiary" maxlength="10" value="' + dataValue + '" />',
      '</div>'
    ].join('');

  } else if( dataType == 'marketing' ) {
    render += [
      '<div class="lockdown-customers-filter-secondary-holder">',
      '  <select class="lockdown-customers-filter-secondary" name="lockdown_customers[' + dataGroup + '][' + dataType + '][' + dataOperator + '][]">',
      '    <option value="0"' + ( dataOperator == '0' ? ' selected' : '') + '>no</option>',
      '    <option value="1"' + ( dataOperator == '1' ? ' selected' : '') + '>yes</option>',
      '  </select>',
      '</div>'
    ].join('');

  } else if( dataType == 'tagged' ) {
    render += [
      '<div class="lockdown-customers-filter-secondary-holder">',
      '  <input type="text" class="lockdown-customers-filter-secondary" name="lockdown_customers[' + dataGroup + '][' + dataType + '][]" maxlength="120" value="' + dataValue + '" />',
      '</div>'
    ].join('');

  } else if( dataType == 'location' ) {
    var $locations = $('#supporting-locations-list').clone();
    $locations.children('select').attr('name', 'lockdown_customers[' + dataGroup + '][' + dataType + '][]');
    if( dataValue ) $locations.val( dataValue ).find('option[value="' + dataValue + '"]').attr('selected', true);

    render += [
      '<div class="lockdown-customers-filter-secondary-holder">',
      $locations.html(),
      '</div>'
    ].join('');
  }

  render += [
    '<div class="lockdown-customers-remove-holder">',
      '<svg width="16px" height="16px" onclick="removeRule(this)">',
        '<g transform="translate(-813.000000, -522.000000)" fill="#919EAB">',
          '<path d="M819.87323,530.121285 C819.395949,530.585884 818.91823,531.050076 818.444259,531.518111 C818.229173,531.730479 818.226674,531.932819 818.42739,532.145874 C818.534449,532.259462 818.645381,532.369395 818.754877,532.480671 C819.010137,532.74018 819.194546,532.741617 819.459615,532.483389 C819.858454,532.094891 820.257542,531.706549 820.653507,531.315083 C820.76294,531.2069 820.861658,531.087845 820.979744,530.957825 C821.046035,531.035362 821.080867,531.081035 821.120636,531.121896 C821.585109,531.599334 822.048739,532.077615 822.516024,532.552273 C822.737483,532.777231 822.938354,532.775794 823.16653,532.556896 C823.290458,532.438029 823.41398,532.318599 823.53441,532.196202 C823.720974,532.006514 823.72769,531.818325 823.554216,531.615922 C823.486613,531.537011 823.411169,531.464784 823.338536,531.390246 C822.892338,530.932489 822.44589,530.474889 821.989977,530.007479 C822.090569,529.910729 822.184569,529.821383 822.277383,529.730819 C822.694528,529.323796 823.113422,528.918522 823.527475,528.508375 C823.772113,528.266016 823.771051,528.048212 823.534941,527.804323 C823.42279,527.688424 823.311233,527.571681 823.195083,527.459811 C823.050974,527.32095 822.883747,527.295989 822.70996,527.394363 C822.629768,527.439786 822.556198,527.501204 822.489657,527.565683 C822.033744,528.007507 821.580548,528.452143 821.126165,528.895561 C821.090552,528.930299 821.052626,528.962664 821.046222,528.968506 C820.771437,528.710684 820.501588,528.465857 820.241516,528.211097 C819.992535,527.967145 819.7563,527.71026 819.509693,527.463841 C819.271802,527.226106 819.056497,527.226293 818.8172,527.456312 C818.71967,527.550063 818.623638,527.645375 818.527576,527.740688 C818.292996,527.973549 818.285405,528.183887 818.503709,528.434586 C818.548069,528.485538 818.596772,528.532773 818.643976,528.581195 C819.097671,529.046543 819.55146,529.511766 820.025993,529.998326 C819.97023,530.042811 819.917747,530.077956 819.87323,530.121285 M820.974527,536.613697 C824.752262,536.603387 827.74391,533.50718 827.627448,529.748314 C827.517265,526.191631 824.590815,523.272022 820.873248,523.31179 C817.270768,523.350372 814.320044,526.370948 814.332102,529.966055 C814.344192,533.575408 817.244589,536.59514 820.974527,536.613697 M820.502775,522 L821.533688,522 C821.583609,522.010684 821.633124,522.024211 821.683577,522.031646 C822.012344,522.080161 822.345329,522.108558 822.669536,522.178098 C824.365263,522.541854 825.796577,523.372021 826.955761,524.660881 C827.971336,525.790075 828.611783,527.106957 828.874166,528.604125 C828.926055,528.900184 828.958576,529.199649 829,529.497552 L829,530.528465 C828.989097,530.578136 828.975133,530.62737 828.967854,530.677604 C828.920838,531.001373 828.894941,531.32961 828.825994,531.648568 C828.433123,533.466256 827.530761,534.987446 826.088107,536.160657 C824.112284,537.76757 821.849023,538.32445 819.358711,537.817054 C817.209475,537.379103 815.517746,536.207111 814.315077,534.373616 C813.105284,532.529249 812.738623,530.502192 813.180291,528.344584 C813.531333,526.629801 814.38268,525.187709 815.688753,524.022152 C816.813323,523.018605 818.122615,522.385062 819.608848,522.125178 C819.905064,522.073351 820.204716,522.041205 820.502775,522" id="ic-remove"></path>',
        '</g>',
      '</svg>',
    '</div>'
  ].join('');
  //render += '<div class="lockdown-customers-remove-holder"><button type="button" class="btn" onclick="removeRule(this)"><i class="fa fa-close"></i></button></div>';
  render += '</div>'; // filter-form

  $holder.html( render );
  $holder.find('.datepicker').datepicker( {"dateFormat": "yy-mm-dd"} );
}

function addOrRule( btn )
{
  var $groupHolder = $(btn).parent().closest('.customers-filter-group-holder');
  var group = $groupHolder.attr('data-group');
  var $holder = $('<div class="customers-filter-data-holder" data-group="' + group + '"></div>');
  $groupHolder.find('.add-or-holder').before($holder);

  renderSelectedCustomersData( $holder );
}

function removeRule( btn )
{
  var $group = $(btn).parent().closest('.customers-filter-group-holder');

  $(btn).parent().closest('.customers-filter-data-holder').remove();
  if( !$group.find('.customers-filter-data-holder').length ) $group.remove();
}

function addRulesGroup( btn )
{
  var group;
  do {
    group = getRandomInt(1000000, 9999999);
  } while( $('.customers-filter-group-holder[data-group=' + group + ']').lenght );

  var $groupHolder = $('<div class="customers-filter-group-holder">').attr('data-group', group);
  $groupHolder.append('<div class="customers-filter-data-holder" data-group="' + group + '"></div>');
  $groupHolder.append('<div class="add-or-holder"></div>');
  $groupHolder.children('.add-or-holder').append('<button type="button" class="btn add-or" onclick="addOrRule(this);">Add OR rule</button>');
  $groupHolder.children('.add-or-holder').append('<div class="tooltip-holder">' + gOrOpertorNote + '<div class="tooltip-pointer"></div></div>');

  $('#add-and-holder').before($groupHolder);
  renderSelectedCustomersData( $groupHolder.children('.customers-filter-data-holder') );
}

function removeRulesGroup( btn )
{
  $(btn).parent().closest('.customers-filter-group-holder').remove();
}


function disableCustomersLocations()
{
  var allOptionsSelector = [];
  var $sels = $('#lockdown-customers-locations-list select');
  if( !$sels.length ) return;

  $sels.each(function(i, el){
    $(el).parent().attr('data-value', $(el).val());
    allOptionsSelector.push('option[value="' + $(el).val() + '"]');
  });

  $sels.each(function(){
    $(this).children('option[disabled]').prop('disabled', false);
    $(this).children( allOptionsSelector.join(',') ).filter(':not(option[value="' + $(this).val() + '"])').prop('disabled', true);
  });
}

function renderCustomersLocationData( holder )
{
  var $holder = $(holder);
  var dataValue = $holder.attr('data-value');

  var $locations = $('#supporting-iso-locations-list').clone();
  $locations.children('select').attr('name', 'lockdown_customers[location][]').attr('onchange', 'disableCustomersLocations();');
  if( dataValue ) $locations.val( dataValue ).find('option[value="' + dataValue + '"]').attr('selected', true);

   var render = [
    '<div class="lockdown-customers-locations-holder">',
      $locations.html(),
    '</div>',
    '<div class="lockdown-customers-locations-remove-holder">',
      '<svg width="16px" height="16px" onclick="removeLocationItem(this)">',
        '<g transform="translate(-813.000000, -522.000000)" fill="#919EAB">',
          '<path d="M819.87323,530.121285 C819.395949,530.585884 818.91823,531.050076 818.444259,531.518111 C818.229173,531.730479 818.226674,531.932819 818.42739,532.145874 C818.534449,532.259462 818.645381,532.369395 818.754877,532.480671 C819.010137,532.74018 819.194546,532.741617 819.459615,532.483389 C819.858454,532.094891 820.257542,531.706549 820.653507,531.315083 C820.76294,531.2069 820.861658,531.087845 820.979744,530.957825 C821.046035,531.035362 821.080867,531.081035 821.120636,531.121896 C821.585109,531.599334 822.048739,532.077615 822.516024,532.552273 C822.737483,532.777231 822.938354,532.775794 823.16653,532.556896 C823.290458,532.438029 823.41398,532.318599 823.53441,532.196202 C823.720974,532.006514 823.72769,531.818325 823.554216,531.615922 C823.486613,531.537011 823.411169,531.464784 823.338536,531.390246 C822.892338,530.932489 822.44589,530.474889 821.989977,530.007479 C822.090569,529.910729 822.184569,529.821383 822.277383,529.730819 C822.694528,529.323796 823.113422,528.918522 823.527475,528.508375 C823.772113,528.266016 823.771051,528.048212 823.534941,527.804323 C823.42279,527.688424 823.311233,527.571681 823.195083,527.459811 C823.050974,527.32095 822.883747,527.295989 822.70996,527.394363 C822.629768,527.439786 822.556198,527.501204 822.489657,527.565683 C822.033744,528.007507 821.580548,528.452143 821.126165,528.895561 C821.090552,528.930299 821.052626,528.962664 821.046222,528.968506 C820.771437,528.710684 820.501588,528.465857 820.241516,528.211097 C819.992535,527.967145 819.7563,527.71026 819.509693,527.463841 C819.271802,527.226106 819.056497,527.226293 818.8172,527.456312 C818.71967,527.550063 818.623638,527.645375 818.527576,527.740688 C818.292996,527.973549 818.285405,528.183887 818.503709,528.434586 C818.548069,528.485538 818.596772,528.532773 818.643976,528.581195 C819.097671,529.046543 819.55146,529.511766 820.025993,529.998326 C819.97023,530.042811 819.917747,530.077956 819.87323,530.121285 M820.974527,536.613697 C824.752262,536.603387 827.74391,533.50718 827.627448,529.748314 C827.517265,526.191631 824.590815,523.272022 820.873248,523.31179 C817.270768,523.350372 814.320044,526.370948 814.332102,529.966055 C814.344192,533.575408 817.244589,536.59514 820.974527,536.613697 M820.502775,522 L821.533688,522 C821.583609,522.010684 821.633124,522.024211 821.683577,522.031646 C822.012344,522.080161 822.345329,522.108558 822.669536,522.178098 C824.365263,522.541854 825.796577,523.372021 826.955761,524.660881 C827.971336,525.790075 828.611783,527.106957 828.874166,528.604125 C828.926055,528.900184 828.958576,529.199649 829,529.497552 L829,530.528465 C828.989097,530.578136 828.975133,530.62737 828.967854,530.677604 C828.920838,531.001373 828.894941,531.32961 828.825994,531.648568 C828.433123,533.466256 827.530761,534.987446 826.088107,536.160657 C824.112284,537.76757 821.849023,538.32445 819.358711,537.817054 C817.209475,537.379103 815.517746,536.207111 814.315077,534.373616 C813.105284,532.529249 812.738623,530.502192 813.180291,528.344584 C813.531333,526.629801 814.38268,525.187709 815.688753,524.022152 C816.813323,523.018605 818.122615,522.385062 819.608848,522.125178 C819.905064,522.073351 820.204716,522.041205 820.502775,522" id="ic-remove"></path>',
        '</g>',
      '</svg>',
    '</div>'
  ].join('');

  $holder.html( render );
}

function addLocationItem()
{
  var $holder = $('<div class="customers-location-data-holder" data-value="">');
  $('#lockdown-customers-locations-list').append( $holder );

  renderCustomersLocationData( $holder );
}

function removeLocationItem( btn )
{
  var $holder = $(btn).parent().closest('.exceptions-data-list');

  $(btn).parent().closest('.customers-location-data-holder').remove();
  disableCustomersLocations($holder);
}


/* ----------------------------------------------------------- form ----------------------------------------------------------- */
function initLockdownForm()
{
  // events
  $(".checkbox-hover").click(function(){
    var checkboxId = $(this).attr('data-rel');
    $('#' + checkboxId).click();
  })

  $('.template-lockdown').on('click', 'ul.dropdown > li > a', function(){
    var $li = $(this).parent();
    if( $li.hasClass('active') ) {
      $li.removeClass('active').children('div').slideUp(200);
    } else {
      $li.siblings('li').removeClass('active').children('div').slideUp(200);
      $li.addClass('active').children('div').slideDown(200);
    }
  });

  $('#form-lockdown .content-type-primary').on('click', '.visual-setting > label', function(){
    return testExceptionsBeforeRemove( this );
  });

  $('#form-lockdown').on('click', '.error-section', function(){
    $(this).removeClass('error-section');
  });

  // hide and show
  if( $('#content-section .content-type-container').length > 1 ) {
    $('.lockdown-content-container-remove-holder').show();
  }

  $('.content-type-container').each(function(i, el) {
    hideAndShowVSContent(el);
  });
  $('.exceptions-type-container').each(function(i, el) {
    hideAndShowVSExceptions(el);
  });

  hideAndShowVS('customers');
  hideAndShowVS('redirect');
  hideAndShowVS('hide-price');

  // rendering
  $('.customers-filter-data-holder').each(function(i, el) {
    renderSelectedCustomersData( el );
  });
  $('.customers-location-data-holder').each(function(i, el) {
    renderCustomersLocationData( el );
  });

  $('.content-data-list').each(function(i, holder) {
    $(holder).find('.content-data-holder').each(function(j, el) {
      renderContentData( el );
    });
    disableContentVariations( holder );
  });

  $('.exceptions-data-list').each(function(i, holder) {
    $(holder).find('.exceptions-data-holder').each(function(j, el) {
      renderExceptionsData( el );
    });
    disableExceptionsVariations( holder );
  });

  // additional actions
  createQuickLinks();
  initWYSIWYG();
}

function submitLockdownForm()
{
  var $form = $('#form-lockdown');
  var $hidden, $container, $sels, primaryType, group, isEmpty;
  gSubmitHasError = false;

  $('.template-lockdown > .wrapper').addClass('easy-disabled');

  // prepare customers data
  primaryType = $("input:radio[name='lockdown_customers[access_mode]']:checked").val();
  if( !primaryType ) return submitError('access');

  primaryType = $("input:radio[name='lockdown_customers[type]']:checked").val();
  if( !primaryType ) return submitError('customers');

  if( primaryType == 'selected' ) {
    if( $('.customers-filter-group-holder').length ) {
      isEmpty = true;
      $('.customers-filter-group-holder').each(function(i, group) {
        $('.customers-filter-data-holder').each(function(i, row) {
          var $row = $(row);
          var primaryValue = $row.find('.lockdown-customers-filter-primary').val();

          if( primaryValue && $.inArray(primaryValue, ['money_spent', 'orders_count', 'placed_order', 'marketing', 'tagged', 'location']) >= 0 ) {
            var secondaryValue = $row.find('.lockdown-customers-filter-secondary').val();

            if( secondaryValue ) {
              if( $.inArray(primaryValue, ['money_spent', 'orders_count', 'placed_order']) >= 0 ) {
                if( primaryValue == 'placed_order' && (secondaryValue != 'less_than' && secondaryValue != 'greater_than') ) {
                  isEmpty = false;
                } else {
                  var tertiaryValue = $row.find('.lockdown-customers-filter-tertiary').val();
                  if( tertiaryValue ) isEmpty = false;
                }

              } else {
                isEmpty = false;
              }
            }
          }
          if( !isEmpty ) return false;
        });
        if( !isEmpty ) return false;
      });
      if( isEmpty ) return submitError('customers-selected');

    } else {
      return submitError('customers-selected');
    }

  } else if( primaryType == 'authorized' ) {
    if( !$('#lockdown-customers-password').val() ) return submitError('customers-password');

  } else if( primaryType == 'location' ) {
    if( $('.lockdown-customers-locations-holder').length ) {
      isEmpty = true;
      $('.lockdown-customers-locations-holder').each(function(i, row) {
        if( $(row).find('.lockdown-customers-filter-secondary').val() ) {
          isEmpty = false;
          return false;
        }
      });
      if( isEmpty ) return submitError('customers-location');

    } else {
      return submitError('customers-location');
    }

  } else if( primaryType != 'logged_in' ) {
    return submitError('customers');
  }
  if( gSubmitHasError ) return;

  // prepare content data
  var $contentItems = $('.content-type-container');
  if( !$contentItems.length ) return submitError('content');

  $contentItems.each(function(i, el) {
    $hidden = $('<input type="hidden" class="submit-data">');
    $container = $(el);
    group = $container.attr('data-content-group');

    primaryType = $("input:radio[name='lockdown-content-vs-type[" + group + "]']:checked").val();
    if( !primaryType ) return submitError('content', $container);

    var $secondaryHolder = $container.find('.content-type-secondary[data-rel=' + primaryType + ']');
    var $tertiaryHolder = null;

    if( $secondaryHolder.length ) {
      var secondaryType = $secondaryHolder.find("select[name='lockdown-content-vs-" + primaryType + '[' + group + "]']").val();
      if( secondaryType ) $tertiaryHolder = $container.find('.content-type-tertiary[data-rel=' + secondaryType + ']');
    } else {
      $tertiaryHolder = $container.find('.content-type-tertiary[data-rel=' + primaryType + ']');
    }

    if( primaryType == 'website' ) {
      $form.append( $hidden.attr('name', 'lockdown_content[' + primaryType + ']').val(1) );
      return false; // break;

    } else if( primaryType == 'pages' ) {
      if( secondaryType == 'index' || secondaryType == 'signup' || secondaryType == 'cart' || secondaryType == 'search' ) {
        $form.append( $hidden.attr('name', 'lockdown_content[' + secondaryType + ']').val(1) );

      } else if( secondaryType == 'pages' ) {
        isEmpty = true;
        $sels = $tertiaryHolder.find('.content-data-holder select');
        $sels.each(function(i, el) {
          if( $(el).val() ) {
            isEmpty = false;
            $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
            $form.append( $hidden.attr('name', 'lockdown_content[' + secondaryType + '][' + $(el).val() + ']') );
          }
        });
        if( isEmpty ) return submitError('content-pages', $container);

      } else {
        return submitError('content', $container);
      }

    } else if( primaryType == 'blogs' ) {
      isEmpty = true;
      $sels = $tertiaryHolder.find('.content-data-holder select');
      $sels.each(function(i, el) {
        if( $(el).val() ) {
          isEmpty = false;
          $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
          $form.append( $hidden.attr('name', 'lockdown_content[' + primaryType + '][' + $(el).val() + ']') );
        }
      });
      if( isEmpty ) return submitError('content-blogs', $container);

    } else if( primaryType == 'collections' ) {
      if( secondaryType == 'all_collections' ) {
        $form.append( $hidden.attr('name', 'lockdown_content[' + secondaryType + ']').val(1) );

      } else if( secondaryType == 'collections' || secondaryType == 'collection_products' ) {
        isEmpty = true;
        $sels = $tertiaryHolder.find('.content-data-holder select');
        $sels.each(function(i, el) {
          if( $(el).val() ) {
            isEmpty = false;
            $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
            $form.append( $hidden.attr('name', 'lockdown_content[' + secondaryType + '][' + $(el).val() + ']') );
          }
        });
        if( isEmpty ) return submitError('content-collections', $container);

      } else {
        return submitError('content', $container);
      }

    } else if( primaryType == 'products' ) {
      isEmpty = true;
      $sels = $tertiaryHolder.find('.content-data-holder select');
      $sels.each(function(i, el) {
        if( $(el).val() ) {
          isEmpty = false;
          $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
          $form.append( $hidden.attr('name', 'lockdown_content[' + primaryType + '][' + $(el).val() + ']') );
        }
      });
      if( isEmpty ) return submitError('content-products', $container);

    } else if( primaryType == 'view-only' ) {
      if( secondaryType == 'all_products_view_only' ) {
        $form.append( $hidden.attr('name', 'lockdown_content[' + secondaryType + ']').val(1) );

      } else if( secondaryType == 'product_view_onlys' ) {
        isEmpty = true;
        $sels = $tertiaryHolder.find('.content-data-holder select');
        $sels.each(function(i, el) {
          if( $(el).val() ) {
            isEmpty = false;
            $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
            $form.append( $hidden.attr('name', 'lockdown_content[' + secondaryType + '][' + $(el).val() + ']') );
          }
        });
        if( isEmpty ) return submitError('content-products', $container);

      } else {
        return submitError('content', $container);
      }

    } else if( primaryType == 'hide_price' ) {
      var linkMode = $("input:radio[name='lockdown_redirect[hide_price_link_mode]']:checked").val();
      if( linkMode && !$('#lockdown-hide-price-redirect-text').val() ) return submitError('redirect-prices-text', $container);

      $form.append( $hidden.attr('name', 'lockdown_content[' + primaryType + ']').val(1) );

    } else {
      return submitError('content-type', $container);
    }
  });
  if( gSubmitHasError ) return;

  // prepare exceptions data
  $('.exceptions-type-container').each(function(i, el) {
    if( $(el).hasClass('hidden') ) return; // continue

    $hidden = $('<input type="hidden" class="submit-data">');
    $container = $(el);
    group = $container.attr('data-exceptions-group');
    primaryType = $("input:radio[name='lockdown-exceptions-vs-type[" + group + "]']:checked").val();

    if( primaryType ) {
      var $secondaryHolder = $container.find('.exceptions-type-secondary[data-rel=' + primaryType + ']');
      var $tertiaryHolder = null;

      if( $secondaryHolder.length ) {
        var secondaryType = $secondaryHolder.find("select[name='lockdown-exceptions-vs-" + primaryType + '[' + group + "]']").val();
        if( secondaryType ) $tertiaryHolder = $container.find('.exceptions-type-tertiary[data-rel=' + secondaryType + ']');
      } else {
        $tertiaryHolder = $container.find('.exceptions-type-tertiary[data-rel=' + primaryType + ']');
      }

      if( primaryType == 'pages' ) {
        if( secondaryType == 'index' || secondaryType == 'cart' || secondaryType == 'search' ) {
          $form.append( $hidden.attr('name', 'lockdown_exceptions[' + secondaryType + ']').val(1) );

        } else if( secondaryType == 'pages' ) {
          isEmpty = true;
          $sels = $tertiaryHolder.find('.exceptions-data-holder select');
          $sels.each(function(i, el) {
            if( $(el).val() ) {
              isEmpty = false;
              var $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
              $form.append( $hidden.attr('name', 'lockdown_exceptions[' + secondaryType + '][' + $(el).val() + ']') );
            }
          });
          if( isEmpty ) return submitError('exceptions-pages', $container);
        }

      } else if( primaryType == 'blogs' ) {
        isEmpty = true;
        $sels = $tertiaryHolder.find('.exceptions-data-holder select');
        $sels.each(function(i, el) {
          if( $(el).val() ) {
            isEmpty = false;
            var $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
            $form.append( $hidden.attr('name', 'lockdown_exceptions[' + primaryType + '][' + $(el).val() + ']') );
          }
        });
        if( isEmpty ) return submitError('exceptions-blogs', $container);

      } else if( primaryType == 'collections' ) {
        if( secondaryType == 'collections' || secondaryType == 'collection_products' ) {
          isEmpty = true;
          $sels = $tertiaryHolder.find('.exceptions-data-holder select');
          $sels.each(function(i, el) {
            if( $(el).val() ) {
              isEmpty = false;
              var $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
              $form.append( $hidden.attr('name', 'lockdown_exceptions[' + secondaryType + '][' + $(el).val() + ']') );
            }
          });
          if( isEmpty ) return submitError('exceptions-collections', $container);
        }

      } else if( primaryType == 'products' ) {
        isEmpty = true;
        $sels = $tertiaryHolder.find('.exceptions-data-holder select');
        $sels.each(function(i, el) {
          if( $(el).val() ) {
            isEmpty = false;
            var $hidden = $('<input type="hidden" class="submit-data">').val( $(el).children('option:selected').text() );
            $form.append( $hidden.attr('name', 'lockdown_exceptions[' + primaryType + '][' + $(el).val() + ']') );
          }
        });
        if( isEmpty ) return submitError('exceptions-products', $container);
      }
    }
  });
  if( gSubmitHasError ) return;

  // prepare redirect data
  primaryType = $("input:radio[name='lockdown_redirect[mode]']:checked").val();
  if( primaryType == 'url' && !$('#redirect-url-holder input[name="lockdown_redirect[url]"]').val() ) return submitError('redirect-url');

  ShopifyApp.Bar.loadingOn();
  $form.submit();
}

function submitError( errorCode, $container )
{
  var errorText = '';
  var errorSection = '';
  gSubmitHasError = true;

  $('input[type=hidden][class=submit-data]').remove();
  $('.template-lockdown > .wrapper').removeClass('easy-disabled');

  switch( errorCode ) {
    case 'access':
        errorText = 'Lockdown type is required.';
        errorSection = 'who-may-access-section';
        break;

    case 'customers':
        errorText = 'Please choose who may access your locked page.';
        errorSection = 'who-may-access-section';
        break;
    case 'customers-selected':
        errorText = 'Please set at least one customer group who may access locked page.';
        errorSection = 'who-may-access-section';
        break;
    case 'customers-password':
        errorText = 'Access password is required.';
        errorSection = 'who-may-access-section';
        break;
    case 'customers-location':
        errorText = 'Customer location is required.';
        errorSection = 'who-may-access-section';
        break;

    case 'content':
        errorText = 'Please select content you’d like to lock';
        break;
    case 'content-type':
        errorText = 'Unexpected error, please try again';
        break;
    case 'content-pages':
        errorText = 'Please choose at least one page to lock';
        break;
    case 'content-blogs':
        errorText = 'Please choose at least one blog to lock';
        break;
    case 'content-collections':
        errorText = 'Please choose at least one collection to lock';
        break;
    case 'content-products':
        errorText = 'Please choose at least one product to lock';
        break;

    case 'exceptions-pages':
        errorText = 'Please choose at least one page for exception';
        break;
    case 'exceptions-blogs':
        errorText = 'Please choose at least one blogs for exception';
        break;
    case 'exceptions-collections':
        errorText = 'Please choose at least one collection for exception';
        break;
    case 'exceptions-products':
        errorText = 'Please choose at least one product for exception';
        break;

    case 'redirect-url':
        errorText = 'URL is required.';
        errorSection = 'how-to-lock-section';
        break;
    case 'redirect-prices-text':
        errorText = 'Locked price text is required.';
        errorSection = 'how-to-lock-section';
        break;
  }

  if( errorText ) ShopifyApp.flashError(errorText);
  if( $container && $container.length ) $container.addClass('error-section');
  else if( errorSection ) $( '#' + errorSection + ' .section-main-content').addClass('error-section');

  return false;
}