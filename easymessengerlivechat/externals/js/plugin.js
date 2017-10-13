(function( $ ) {
  var selected = false;
  $.widget( "custom.combobox", {
    _create: function() {
      this.wrapper = $("<span>").addClass("fa custom-combobox").insertAfter( this.element );
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
        .attr("placeholder", "Type product title here")
        .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
        .autocomplete({
          delay: 500,
          minLength: 1,
          source: $.proxy( this, "_source" ),
          appendTo: '#' + $holder.attr('id'),

          select: function( event, ui ) {
            event.preventDefault();
            selected = true;

            var $a = $('#ac-li-item-' + ui.item.value + ' > a');
            if( $a.length ) {
              if( $a.hasClass('selected-product') ) $a.removeClass('selected-product');
              else $a.addClass('selected-product');
            }

            $holder.find('.ui-autocomplete-input').val( ui.item.label );
            if( $($holder.parentNode).find('.product-' + ui.item.value).length ) {
              removeAttachementProduct($holder.getElementsByClassName('product-' + ui.item.value)[0], $holder);
            } else {
              addAttachementProduct(ui.item, $holder);
            }
            $('.custom-combobox-input').val('');
          },

          focus: function (event, ui) {
            event.preventDefault();
          },

          search: function(event, ui) {
            if( ajaxRequest !== null ) ajaxRequest.abort();
            $holder.find('.autocomplete-loader').show();
          },

          response: function(event, ui) {
            $holder.find('.autocomplete-loader').hide();
            $holder.find('.autocomplete-tooltip').show();
          },

          create: function () {
            $(this).data('ui-autocomplete')._renderItem = function (ul, item) {
              var $li = $('<li>').attr('id', 'ac-li-item-' + item.value);
              if( $($holder.parentNode).find('.product-' + item.value).length ) {
                $li.append('<a class="selected-product"><i class="fa fa-check"></i><div class="ac-title">' + item.label + '</div></a>');
              } else {
                $li.append('<a><i class="fa fa-check"></i><div class="ac-title">' + item.label + '</div></a>');
              }
              return $li.appendTo(ul);
            };
          },

          close: function(event, ui) {
            $holder.find('.autocomplete-tooltip').hide();
          }
        }).on('focus', function(){ $(this).autocomplete("search"); } );

        var originalCloseMethod = this.input.data('ui-autocomplete').close;
        this.input.data("ui-autocomplete").close = function(event) {
          if (!selected){
            //close requested by someone else, let it pass
            originalCloseMethod.apply( this, arguments );
          }
          selected = false;
        };

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
        { 'task': 'ajax_controller', 'action': 'get_products', 'text': text.term }
      );

      if( request ) {
        request.done(function(response) {
          $select.empty();

          if( response && response.data ) {
            $.each(response.data, function(i, value){
              var $opt = $('<option>').text(value.title).attr('value', value.value);
              if( typeof value.image !== 'undefined' && typeof value.image.src !== 'undefined' ) $opt.attr('data-img', value.image.src);
              $opt.appendTo($select);
            });

            callback( $select.children("option").map(function() {
              return {
                label: $(this).text(),
                value: $(this).val(),
                image: $(this).attr('data-img'),
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
      //this.input.val("");
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


function addAttachementProduct(item, $holder)
{
  gSortedProductList.push(item.label);
  gSortedProductList.sort();
  var newRowPosition = gSortedProductList.indexOf(item.label);

  var row = [
    '<tbody class="product-' + item.value + '">',
      '<tr>',
        '<td style="width: 40px">',
          '<div class="image-holder">',
            '<img src="' + item.image + '" title="' + item.label + '">',
          '</div>',
        '</td>',
        '<td>',
          item.label,
          '<input type="hidden" name="attachement[data][products][' + item.value + ']" value="' + item.label + '" />',
        '</td>',
        '<td style="width: 40px">',
          '<button type="button" class="btn btn--plain btn--plain--flush-right" onclick="removeAttachementProduct(this)">',
            '<i class="fa fa-close"></i>',
          '</button>',
        '</td>',
      '</tr>',
    '</tbody>'
  ].join('');
    var component = $($holder[0].parentNode.querySelector('.attachement-product-values'));
    if (newRowPosition == 0) {
        component.prepend(row);
    } else if (newRowPosition >= gSortedProductList.length - 1) {
        component.append(row);
    } else {
        $($holder[0].parentNode).find('.attachement-product-values tbody:eq(' + newRowPosition + ')').before(row);
  }
}

function removeAttachementProduct(el, $holder)
{
  $(el).closest('tbody').remove();
  if($holder) {
      var component = $($holder[0].parentNode);
  } else {
      var component = $(el).closest('.attachement-product-values')
  }
    gSortedProductList = [];
  component.find('.attachement-product-values input[type=hidden]').each(function(i, el){
    gSortedProductList.push(el.value);
  });
  gSortedProductList.sort();
}
