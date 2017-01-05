if( typeof easyorder == 'undefined' || typeof easyorder.jq191Src == 'undefined' || typeof easyorder.jq == 'undefined' ) {
  var easyorder = {
    jq191Src: '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
    jq: null,
    showProducts: true,
    showVendor: true,

    loadScript: function(url, callback)
    {
      var script = document.createElement("script");
      script.type = "text/javascript";

      if( script.readyState ) {
        script.onreadystatechange = function () {
          if (script.readyState == "loaded" || script.readyState == "complete") {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {
        script.onload = function () {
          callback();
        }
      }

      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
    },

    loadLink: function(url)
    {
      var link = document.createElement("link");
      link.type = "text/css"
      link.rel  = "stylesheet";
      link.href = url;
      document.getElementsByTagName("head")[0].appendChild(link);
    },

    initOrderPopup: function(url)
    {
      var params = {};
      easyorder.jq.featherlight("#easyorder-popup", params);
      easyorder.jq('.easyorder-popup-content').show();
      easyorder.jq('.easyorder-popup-result').hide();

      var $easyorderPopup = easyorder.jq('.eorder_featherlight #easyorder-popup');
      $easyorderPopup.find('.easyorder-popup-submit').attr('data-url', url);

      $easyorderPopup.find('input[type=checkbox]').change(function(){
        var optionId = parseInt(this.getAttribute('data-option-id'));
        if( !optionId ) return;

        $field = $easyorderPopup.find('div[data-related-to=' + optionId + ']');
        easyorder.updateFieldsTree($field, this.checked);
      });

      $easyorderPopup.find('input[type=radio]').change(function(){
        $field = easyorder.jq(this).parent().closest('.radio-holder');
        easyorder.updateFieldsTree($field, true);
      });

      $easyorderPopup.find('select').change(function(){
        var $this = easyorder.jq(this);
        var selectedOption = $this.children('option:selected');
        if( !selectedOption.length ) return;

        $field = $this.parent();
        easyorder.updateFieldsTree($field, true);
      });

      $easyorderPopup.find('.easyorder-field-holder[data-related-to=0]').find('input[type=checkbox], input[type=radio], select').trigger('change');
    },

    popupOpen: function($form, showProducts, showVendor, singlePurchase)
    {
      var actionUrl = $form.attr('action');
      easyorder.showProducts = showProducts;
      easyorder.showVendor = showVendor;
      singlePurchase = singlePurchase || false;

      if( actionUrl == '/cart' ) {
        easyorder.initOrderPopup(actionUrl);
        easyorder.popupUpdate();
      } else {
        var params = {
          type: 'POST',
          url: '/cart/add.js',
          data: $form.serialize(),
          dataType: 'json',
          success: function(data, textStatus) {
            easyorder.initOrderPopup(actionUrl);
            easyorder.popupUpdate();
          },
          error: function(XMLHttpRequest, textStatus) {
            var error = JSON.parse(XMLHttpRequest.responseText);

            easyorder.initOrderPopup(actionUrl);
            easyorder.popupUpdate(error.description);
          }
        };

        if( singlePurchase ) {
          easyorder.jq.post('/cart/clear.js').always(function(){
            easyorder.jq.ajax(params);
          });
        } else {
          easyorder.jq.ajax(params);
        }
      }
    },

    popupUpdate: function( errorMessage )
    {
      errorMessage = errorMessage || '';

      easyorder.jq.ajax({
        type: 'GET',
        url: '/cart.js',
        dataType: 'json',
        success: function(data) {
          var $easyorderPopup = easyorder.jq('.eorder_featherlight #easyorder-popup');
          var $productsList = $easyorderPopup.find('.easyorder-popup-products').empty().show();
          if( errorMessage ) $productsList.append('<div class="easyorder-add-error">' + errorMessage + '</div>');

          if (data.items.length > 0) {
            if( easyorder.showProducts ) {
              var currencyEl = $easyorderPopup.find('.easyorder-popup-currency:first');
              var currency = currencyEl.length ? currencyEl.text() : '';
              var totalPrice = parseFloat(data.total_price / 100).toFixed(2);

              easyorder.jq.each(data.items, function(){
                $productsList.append(
                  [
                    '<div class="easyorder-products-holder grid">',
                      '<div class="grid__item two-fifths easyorder-product-image-holder">',
                        '<div class="easyorder-field-holder">',
                          '<input type="hidden" name="id[' + this.variant_id + '][quantity]"   value="' + this.quantity + '" />',
                          '<input type="hidden" name="id[' + this.variant_id + '][properties]" value="' + encodeURIComponent(JSON.stringify(this.properties)) + '" />',
                          '<input type="hidden" name="id[' + this.variant_id + '][gift_card]"  value="' + (this.gift_card ? 1 : 0) + '" />',
                          '<input type="hidden" name="id[' + this.variant_id + '][grams]" value="' + this.grams + '" />',
                          '<input type="hidden" name="id[' + this.variant_id + '][sku]"   value="' + this.sku + '" />',
                          '<input type="hidden" name="id[' + this.variant_id + '][requires_shipping]" value="' + (this.requires_shipping ? 1 : 0) + '" />',
                        '</div>',
                        '<a href="' + this.url + '">',
                          '<img src="' + this.image + '" />',
                        '</a>',
                      '</div>',
                      '<div class="grid__item three-fifths easyorder-product-desc-holder">',
                        '<h4 class="easyorder-product-title">',
                          '<a href="' + this.url + '">',
                            this.product_title,
                          '</a>',
                        '</h4>',
                        (easyorder.showVendor ? '<p>' + this.vendor + '</p>' : ''),
                        '<p class="easyorder-item-price-holder">',
                          '<b class="easyorder-item-price-price">' + currency + parseFloat(this.line_price / 100).toFixed(2) + '</b>',
                          '<span class="easyorder-item-price-separator">, </span>',
                          '<small><span class="easyorder-item-price-quantity">' + this.quantity + '</span> x ' + currency + parseFloat(this.price / 100).toFixed(2) + '</small>',
                        '</p>',
                        '<p class="easyorder-item-remove-holder"><a href="#" onclick="easyorder.popupRemove(' + this.variant_id + ');return false;">Remove</a></p>',
                      '</div>',
                    '</div>'
                  ].join('')
                );
              });

              $productsList.append('<h4 class="easyorder-text-left">Total: ' + currency + '<span>' + totalPrice + '</span></h4>');
            } else {
              easyorder.jq.each(data.items, function(){
                $easyorderPopup.find('.easyorder-popup-form-fields:first').append(
                  [
                    '<div class="easyorder-field-holder">',
                      '<input type="hidden" name="id[' + this.variant_id + '][quantity]"   value="' + this.quantity + '" />',
                      '<input type="hidden" name="id[' + this.variant_id + '][properties]" value="' + encodeURIComponent(JSON.stringify(this.properties)) + '" />',
                      '<input type="hidden" name="id[' + this.variant_id + '][gift_card]"  value="' + (this.gift_card ? 1 : 0) + '" />',
                      '<input type="hidden" name="id[' + this.variant_id + '][grams]" value="' + this.grams + '" />',
                      '<input type="hidden" name="id[' + this.variant_id + '][sku]"   value="' + this.sku + '" />',
                      '<input type="hidden" name="id[' + this.variant_id + '][requires_shipping]" value="' + (this.requires_shipping ? 1 : 0) + '" />',
                    '</div>'
                  ].join('')
                );
              });
            }

          } else {
            if( !errorMessage ) easyorder.jq.featherlight.close();
          }
        }
      });
    },

    popupRemove: function(id)
    {
      var params = {
        type: 'POST',
        url: '/cart/change.js',
        data: "id=" + id + "&quantity=0",
        dataType: 'json',
        success: function(data, textStatus) { easyorder.popupUpdate() },
        error: function(XMLHttpRequest, textStatus) {API.onError(XMLHttpRequest);}
      };
      easyorder.jq.ajax(params);
    },

    isValidEmailAddress: function(emailAddress)
    {
      var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*){2,}|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)){2,})@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]){2,}|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]){2,}))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
      return pattern.test(emailAddress);
    },

    updateFieldsTree: function($field, display)
    {
      var display = display || false;
      var subOptions = $field.find('input[type=checkbox], input[type=radio], select > option');
      if( subOptions.length ) {
        subOptions.each(function(i, el){
          var optionId = el.getAttribute('data-option-id');
          var subFieldRow = easyorder.jq(".eorder_featherlight #easyorder-popup div[data-related-to=" + optionId + "]");

          if( subFieldRow.length ) {
            displayNext = (display && (el.checked || el.selected));
            easyorder.updateFieldsTree(subFieldRow, displayNext);
          }
        });
      }
      $field.toggle(display);
    },

    initPage: function()
    {
      if( !easyorder.jq && typeof jQuery == 'function' && jQuery.fn.jquery == "1.9.1" ) easyorder.jq = jQuery.noConflict(true);
      if( !easyorder.jq ) return;

      easyorder.initFeatherlight();
      var event = document.createEvent('Event');
      event.initEvent('easyorder_init', true, true);
      document.dispatchEvent(event);
    },

    validateForm: function(visibleFields, requiredFields)
    {
      var error = false;
      requiredFields.find('input[type=text]').each(function(){
        if( this.value == "" ) {
          easyorder.jq(this).addClass("error"); error = true;
        } else easyorder.jq(this).removeClass("error");
      });

      visibleFields.find('input[type=email]').each(function(){
        if( (this.value == "" && easyorder.jq(this).parent().closest('.easyorder-field-holder').attr('data-required') == 1) || (this.value != "" && !easyorder.isValidEmailAddress(this.value)) ) {
          easyorder.jq(this).addClass("error"); error = true;
        } else easyorder.jq(this).removeClass("error");
      });

      requiredFields.find('textarea').each(function(){
        if( this.value == "" ) {
          easyorder.jq(this).addClass("error"); error = true;
        } else easyorder.jq(this).removeClass("error");
      });

      requiredFields.find('select').each(function(){
        if( this.value == "" ) {
          easyorder.jq(this).addClass("error"); error = true;
        } else easyorder.jq(this).removeClass("error");
      });

      requiredFields.each(function(){
        var fieldsRadios = easyorder.jq(this).find('input[type=radio]');
        if( !fieldsRadios.length ) return;

        var isChecked = fieldsRadios.filter(':checked').length;
        if( !isChecked ) {
          fieldsRadios.parent().closest('.radio-holder').addClass("error"); error = true;
        } else fieldsRadios.parent().closest('.radio-holder').removeClass("error");
      });

      requiredFields.each(function(){
        var fieldsCheckboxes = easyorder.jq(this).find('input[type=checkbox]');
        if( !fieldsCheckboxes.length ) return;

        var isChecked = fieldsCheckboxes.filter(':checked').length;
        if( !isChecked ) {
          fieldsCheckboxes.parent().closest('.checkbox-holder').addClass("error"); error = true;
        } else fieldsCheckboxes.parent().closest('.checkbox-holder').removeClass("error");
      });

      return error;
    },

    initFeatherlight: function()
    {
      /**
       * Featherlight - ultra slim jQuery lightbox
       * Version 1.3.1 - http://noelboss.github.io/featherlight/
       *
       * Copyright 2015, Noël Raoul Bossart (http://www.noelboss.com)
       * MIT Licensed.
      **/

      "use strict";

      if('undefined' === typeof easyorder.jq) {
        if('console' in window){ window.console.info('Too much lightness, Featherlight needs jQuery v1.9.1.'); }
        return;
      }

      /* Featherlight is exported as easyorder.jq.featherlight.
         It is a function used to open a featherlight lightbox.

         [tech]
         Featherlight uses prototype inheritance.
         Each opened lightbox will have a corresponding object.
         That object may have some attributes that override the
         prototype's.
         Extensions created with Featherlight.extend will have their
         own prototype that inherits from Featherlight's prototype,
         thus attributes can be overriden either at the object level,
         or at the extension level.
         To create callbacks that chain themselves instead of overriding,
         use chainCallbacks.
         For those familiar with CoffeeScript, this correspond to
         Featherlight being a class and the Gallery being a class
         extending Featherlight.
         The chainCallbacks is used since we don't have access to
         CoffeeScript's `super`.
      */

      function Featherlight($content, config) {
        if(this instanceof Featherlight) {  /* called with new */
          this.id = Featherlight.id++;
          this.setup($content, config);
          this.chainCallbacks(Featherlight._callbackChain);
        } else {
          var fl = new Featherlight($content, config);
          fl.open();
          return fl;
        }
      }

      var opened = [];
      var pruneOpened = function(remove) {
          opened = easyorder.jq.grep(opened, function(fl) {
            return fl !== remove && fl.$instance.closest('body').length > 0;
          } );
          return opened;
        };

      // structure({iframeMinHeight: 44, foo: 0}, 'iframe')
      //   #=> {min-height: 44}
      var structure = function(obj, prefix) {
        var result = {},
          regex = new RegExp('^' + prefix + '([A-Z])(.*)');
        for (var key in obj) {
          var match = key.match(regex);
          if (match) {
            var dasherized = (match[1] + match[2].replace(/([A-Z])/g, '-$1')).toLowerCase();
            result[dasherized] = obj[key];
          }
        }
        return result;
      };

      /* document wide key handler */
      var eventMap = { keyup: 'onKeyUp', resize: 'onResize' };

      var globalEventHandler = function(event) {
        easyorder.jq.each(Featherlight.opened().reverse(), function() {
          if (!event.isDefaultPrevented()) {
            if (false === this[eventMap[event.type]](event)) {
              event.preventDefault(); event.stopPropagation(); return false;
            }
          }
        });
      };

      var toggleGlobalEvents = function(set) {
          if(set !== Featherlight._globalHandlerInstalled) {
            Featherlight._globalHandlerInstalled = set;
            var events = easyorder.jq.map(eventMap, function(_, name) { return name+'.'+Featherlight.prototype.namespace; } ).join(' ');
            easyorder.jq(window)[set ? 'on' : 'off'](events, globalEventHandler);
          }
        };

      Featherlight.prototype = {
        constructor: Featherlight,
        /*** defaults ***/
        /* extend featherlight with defaults and methods */
        namespace:    'eorder_featherlight',  /* Name of the events and css class prefix */
        targetAttr:   'data-featherlight',    /* Attribute of the triggered element that contains the selector to the lightbox content */
        variant:      null,                   /* Class that will be added to change look of the lightbox */
        resetCss:     false,                  /* Reset all css */
        background:   null,                   /* Custom DOM for the background, wrapper and the closebutton */
        openTrigger:  'click',                /* Event that triggers the lightbox */
        closeTrigger: 'click',                /* Event that triggers the closing of the lightbox */
        filter:       null,                   /* Selector to filter events. Think easyorder.jq(...).on('click', filter, eventHandler) */
        root:         '#easyorder-popup-holder',  /* Where to append featherlights */
        openSpeed:    250,                    /* Duration of opening animation */
        closeSpeed:   250,                    /* Duration of closing animation */
        closeOnClick: 'background',           /* Close lightbox on click ('background', 'anywhere' or false) */
        closeOnEsc:   true,                   /* Close lightbox when pressing esc */
        closeIcon:    '&#10005;',             /* Close icon */
        loading:      '',                     /* Content to show while initial content is loading */
        persist:      false,                  /* If set, the content persist and will be shown again when opened again. 'shared' is a special value when binding multiple elements for them to share the same content */
        otherClose:   null,                   /* Selector for alternate close buttons (e.g. "a.close") */
        beforeOpen:   easyorder.jq.noop,                 /* Called before open. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */
        beforeContent: easyorder.jq.noop,                /* Called when content is loaded. Gets event as parameter, this contains all data */
        beforeClose:  easyorder.jq.noop,                 /* Called before close. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */
        afterOpen:    easyorder.jq.noop,                 /* Called after open. Gets event as parameter, this contains all data */
        afterContent: easyorder.jq.noop,                 /* Called after content is ready and has been set. Gets event as parameter, this contains all data */
        afterClose:   easyorder.jq.noop,                 /* Called after close. Gets event as parameter, this contains all data */
        onKeyUp:      easyorder.jq.noop,                 /* Called on key down for the frontmost featherlight */
        onResize:     easyorder.jq.noop,                 /* Called after new content and when a window is resized */
        type:         null,                   /* Specify type of lightbox. If unset, it will check for the targetAttrs value. */
        contentFilters: ['jquery', 'image', 'html', 'ajax', 'iframe', 'text'], /* List of content filters to use to determine the content */

        /*** methods ***/
        /* setup iterates over a single instance of featherlight and prepares the background and binds the events */
        setup: function(target, config){
          /* all arguments are optional */
          if (typeof target === 'object' && target instanceof easyorder.jq === false && !config) {
            config = target;
            target = undefined;
          }

          var self = easyorder.jq.extend(this, config, {target: target}),
            css = !self.resetCss ? self.namespace : self.namespace+'-reset', /* by adding -reset to the classname, we reset all the default css */
            $background = easyorder.jq(self.background || [
              '<div class="'+css+'-loading '+css+'">',
                '<div class="'+css+'-content">',
                  '<span class="'+css+'-close-icon '+ self.namespace + '-close">',
                    self.closeIcon,
                  '</span>',
                  '<div class="'+self.namespace+'-inner">' + self.loading + '</div>',
                '</div>',
              '</div>'].join('')),
            closeButtonSelector = '.'+self.namespace+'-close' + (self.otherClose ? ',' + self.otherClose : '');

          self.$instance = $background.clone().addClass(self.variant); /* clone DOM for the background, wrapper and the close button */

          /* close when click on background/anywhere/null or closebox */
          self.$instance.on(self.closeTrigger+'.'+self.namespace, function(event) {
            var $target = easyorder.jq(event.target);
            if( ('background' === self.closeOnClick  && $target.is('.'+self.namespace))
              || 'anywhere' === self.closeOnClick
              || $target.closest(closeButtonSelector).length ){
              event.preventDefault();
              self.close();
            }
          });

          return this;
        },

        /* this method prepares the content and converts it into a jQuery object or a promise */
        getContent: function(){
          if(this.persist !== false && this.$content) {
            return this.$content;
          }
          var self = this,
            filters = this.constructor.contentFilters,
            readTargetAttr = function(name){ return self.$currentTarget && self.$currentTarget.attr(name); },
            targetValue = readTargetAttr(self.targetAttr),
            data = self.target || targetValue || '';

          /* Find which filter applies */
          var filter = filters[self.type]; /* check explicit type like {type: 'image'} */

          /* check explicit type like data-featherlight="image" */
          if(!filter && data in filters) {
            filter = filters[data];
            data = self.target && targetValue;
          }
          data = data || readTargetAttr('href') || '';

          /* check explicity type & content like {image: 'photo.jpg'} */
          if(!filter) {
            for(var filterName in filters) {
              if(self[filterName]) {
                filter = filters[filterName];
                data = self[filterName];
              }
            }
          }

          /* otherwise it's implicit, run checks */
          if(!filter) {
            var target = data;
            data = null;
            easyorder.jq.each(self.contentFilters, function() {
              filter = filters[this];
              if(filter.test)  {
                data = filter.test(target);
              }
              if(!data && filter.regex && target.match && target.match(filter.regex)) {
                data = target;
              }
              return !data;
            });
            if(!data) {
              if('console' in window){ window.console.error('Featherlight: no content filter found ' + (target ? ' for "' + target + '"' : ' (no target specified)')); }
              return false;
            }
          }
          /* Process it */
          return filter.process.call(self, data);
        },

        /* sets the content of $instance to $content */
        setContent: function($content){
          var self = this;
          /* we need a special class for the iframe */
          if($content.is('iframe') || easyorder.jq('iframe', $content).length > 0){
            self.$instance.addClass(self.namespace+'-iframe');
          }

          self.$instance.removeClass(self.namespace+'-loading');

          /* replace content by appending to existing one before it is removed
             this insures that featherlight-inner remain at the same relative
             position to any other items added to featherlight-content */
          self.$instance.find('.'+self.namespace+'-inner')
            .not($content)                /* excluded new content, important if persisted */
            .slice(1).remove().end()      /* In the unexpected event where there are many inner elements, remove all but the first one */
            .replaceWith(easyorder.jq.contains(self.$instance[0], $content[0]) ? '' : $content);

          self.$content = $content.addClass(self.namespace+'-inner');

          return self;
        },

        /* opens the lightbox. "this" contains $instance with the lightbox, and with the config.
          Returns a promise that is resolved after is successfully opened. */
        open: function(event){
          var self = this;
          self.$instance.hide().appendTo(self.root);
          if((!event || !event.isDefaultPrevented())
            && self.beforeOpen(event) !== false) {

            if(event){
              event.preventDefault();
            }
            var $content = self.getContent();

            if($content) {
              opened.push(self);

              toggleGlobalEvents(true);

              self.$instance.fadeIn(self.openSpeed);
              self.beforeContent(event);

              /* Set content and show */
              return easyorder.jq.when($content)
                .always(function($content){
                  self.setContent($content);
                  self.afterContent(event);
                })
                .then(self.$instance.promise())
                /* Call afterOpen after fadeIn is done */
                .done(function(){ self.afterOpen(event); });
            }
          }
          self.$instance.detach();
          return easyorder.jq.Deferred().reject().promise();
        },

        /* closes the lightbox. "this" contains $instance with the lightbox, and with the config
          returns a promise, resolved after the lightbox is successfully closed. */
        close: function(event){
          var self = this,
            deferred = easyorder.jq.Deferred();

          if(self.beforeClose(event) === false) {
            deferred.reject();
          } else {

            if (0 === pruneOpened(self).length) {
              toggleGlobalEvents(false);
            }

            self.$instance.fadeOut(self.closeSpeed,function(){
              self.$instance.detach();
              self.afterClose(event);
              deferred.resolve();
            });
          }
          return deferred.promise();
        },

        /* Utility function to chain callbacks
           [Warning: guru-level]
           Used be extensions that want to let users specify callbacks but
           also need themselves to use the callbacks.
           The argument 'chain' has callback names as keys and function(super, event)
           as values. That function is meant to call `super` at some point.
        */
        chainCallbacks: function(chain) {
          for (var name in chain) {
            this[name] = easyorder.jq.proxy(chain[name], this, easyorder.jq.proxy(this[name], this));
          }
        }
      };

      easyorder.jq.extend(Featherlight, {
        id: 0,                                    /* Used to id single featherlight instances */
        autoBind:       '[data-featherlight]',    /* Will automatically bind elements matching this selector. Clear or set before onReady */
        defaults:       Featherlight.prototype,   /* You can access and override all defaults using easyorder.jq.featherlight.defaults, which is just a synonym for easyorder.jq.featherlight.prototype */
        /* Contains the logic to determine content */
        contentFilters: {
          jquery: {
            regex: /^[#.]\w/,         /* Anything that starts with a class name or identifiers */
            test: function(elem)    { return elem instanceof easyorder.jq && elem; },
            process: function(elem) { return this.persist !== false ? easyorder.jq(elem) : easyorder.jq(elem).clone(true); }
          },
          image: {
            regex: /\.(png|jpg|jpeg|gif|tiff|bmp)(\?\S*)?$/i,
            process: function(url)  {
              var self = this,
                deferred = easyorder.jq.Deferred(),
                img = new Image(),
                $img = easyorder.jq('<img src="'+url+'" alt="" class="'+self.namespace+'-image" />');
              img.onload  = function() {
                /* Store naturalWidth & height for IE8 */
                $img.naturalWidth = img.width; $img.naturalHeight = img.height;
                deferred.resolve( $img );
              };
              img.onerror = function() { deferred.reject($img); };
              img.src = url;
              return deferred.promise();
            }
          },
          html: {
            regex: /^\s*<[\w!][^<]*>/, /* Anything that starts with some kind of valid tag */
            process: function(html) { return easyorder.jq(html); }
          },
          ajax: {
            regex: /./,            /* At this point, any content is assumed to be an URL */
            process: function(url)  {
              var self = this,
                deferred = easyorder.jq.Deferred();
              /* we are using load so one can specify a target with: url.html #targetelement */
              var $container = easyorder.jq('<div></div>').load(url, function(response, status){
                if ( status !== "error" ) {
                  deferred.resolve($container.contents());
                }
                deferred.fail();
              });
              return deferred.promise();
            }
          },
          iframe: {
            process: function(url) {
              var deferred = new easyorder.jq.Deferred();
              var $content = easyorder.jq('<iframe/>')
                .hide()
                .attr('src', url)
                .css(structure(this, 'iframe'))
                .on('load', function() { deferred.resolve($content.show()); })
                // We can't move an <iframe> and avoid reloading it,
                // so let's put it in place ourselves right now:
                .appendTo(this.$instance.find('.' + this.namespace + '-content'));
              return deferred.promise();
            }
          },
          text: {
            process: function(text) { return easyorder.jq('<div>', {text: text}); }
          }
        },

        functionAttributes: ['beforeOpen', 'afterOpen', 'beforeContent', 'afterContent', 'beforeClose', 'afterClose'],

        /*** class methods ***/
        /* read element's attributes starting with data-featherlight- */
        readElementConfig: function(element, namespace) {
          var Klass = this,
            regexp = new RegExp('^data-' + namespace + '-(.*)'),
            config = {};
          if (element && element.attributes) {
            easyorder.jq.each(element.attributes, function(){
              var match = this.name.match(regexp);
              if (match) {
                var val = this.value,
                  name = easyorder.jq.camelCase(match[1]);
                if (easyorder.jq.inArray(name, Klass.functionAttributes) >= 0) {  /* jshint -W054 */
                  val = new Function(val);                           /* jshint +W054 */
                } else {
                  try { val = easyorder.jq.parseJSON(val); }
                  catch(e) {}
                }
                config[name] = val;
              }
            });
          }
          return config;
        },

        /* Used to create a Featherlight extension
           [Warning: guru-level]
           Creates the extension's prototype that in turn
           inherits Featherlight's prototype.
           Could be used to extend an extension too...
           This is pretty high level wizardy, it comes pretty much straight
           from CoffeeScript and won't teach you anything about Featherlight
           as it's not really specific to this library.
           My suggestion: move along and keep your sanity.
        */
        extend: function(child, defaults) {
          /* Setup class hierarchy, adapted from CoffeeScript */
          var Ctor = function(){ this.constructor = child; };
          Ctor.prototype = this.prototype;
          child.prototype = new Ctor();
          child.__super__ = this.prototype;
          /* Copy class methods & attributes */
          easyorder.jq.extend(child, this, defaults);
          child.defaults = child.prototype;
          return child;
        },

        attach: function($source, $content, config) {
          var Klass = this;
          if (typeof $content === 'object' && $content instanceof easyorder.jq === false && !config) {
            config = $content;
            $content = undefined;
          }
          /* make a copy */
          config = easyorder.jq.extend({}, config);

          /* Only for openTrigger and namespace... */
          var namespace = config.namespace || Klass.defaults.namespace,
            tempConfig = easyorder.jq.extend({}, Klass.defaults, Klass.readElementConfig($source[0], namespace), config),
            sharedPersist;

          $source.on(tempConfig.openTrigger+'.'+tempConfig.namespace, tempConfig.filter, function(event) {
            /* ... since we might as well compute the config on the actual target */
            var elemConfig = easyorder.jq.extend(
              {$source: $source, $currentTarget: easyorder.jq(this)},
              Klass.readElementConfig($source[0], tempConfig.namespace),
              Klass.readElementConfig(this, tempConfig.namespace),
              config);
            var fl = sharedPersist || easyorder.jq(this).data('featherlight-persisted') || new Klass($content, elemConfig);
            if(fl.persist === 'shared') {
              sharedPersist = fl;
            } else if(fl.persist !== false) {
              easyorder.jq(this).data('featherlight-persisted', fl);
            }
            fl.open(event);
          });
          return $source;
        },

        current: function() {
          var all = this.opened();
          return all[all.length - 1] || null;
        },

        opened: function() {
          var klass = this;
          pruneOpened();
          return easyorder.jq.grep(opened, function(fl) { return fl instanceof klass; } );
        },

        close: function() {
          var cur = this.current();
          if(cur) { return cur.close(); }
        },

        /* Does the auto binding on startup.
           Meant only to be used by Featherlight and its extensions
        */
        _onReady: function() {
          var Klass = this;
          if(Klass.autoBind){
            /* First, bind click on document, so it will work for items added dynamically */
            Klass.attach(easyorder.jq(document), {filter: Klass.autoBind});
            /* Auto bound elements with attr-featherlight-filter won't work
               (since we already used it to bind on document), so bind these
               directly. We can't easily support dynamically added element with filters */
            easyorder.jq(Klass.autoBind).filter('[data-featherlight-filter]').each(function(){
              Klass.attach(easyorder.jq(this));
            });
          }
        },

        /* Featherlight uses the onKeyUp callback to intercept the escape key.
           Private to Featherlight.
        */
        _callbackChain: {
          onKeyUp: function(_super, event){
            if(27 === event.keyCode) {
              if (this.closeOnEsc) {
                this.$instance.find('.'+this.namespace+'-close:first').click();
              }
              return false;
            } else {
              return _super(event);
            }
          },

          onResize: function(_super, event){
            if (this.$content.naturalWidth) {
              var w = this.$content.naturalWidth, h = this.$content.naturalHeight;
              /* Reset apparent image size first so container grows */
              this.$content.css('width', '').css('height', '');
              /* Calculate the worst ratio so that dimensions fit */
              var ratio = Math.max(
                w  / parseInt(this.$content.parent().css('width'),10),
                h / parseInt(this.$content.parent().css('height'),10));
              /* Resize content */
              if (ratio > 1) {
                this.$content.css('width', '' + w / ratio + 'px').css('height', '' + h / ratio + 'px');
              }
            }
            return _super(event);
          },

          afterContent: function(_super, event){
            var r = _super(event);
            this.onResize(event);
            return r;
          }
        }
      });

      easyorder.jq.featherlight = Featherlight;

      /* bind jQuery elements to trigger featherlight */
      easyorder.jq.fn.featherlight = function($content, config) {
        return Featherlight.attach(this, $content, config);
      };

      /* bind featherlight on ready if config autoBind is set */
      easyorder.jq(document).ready(function(){ Featherlight._onReady(); });
    },

    facebookConversionPixel: function (fbPixel, fbPrice, fbCurrency)
    {
      if( typeof fbPixel != 'undefined' && typeof fbq == 'function' ) {
        var params = {'value': fbPrice, 'currency': fbCurrency};
        fbq('track', 'Purchase', params);
      }
    }
  }

  easyorder.loadLink('https://nexusmedia-ua.github.io/cdn/easyorder/externals/frontend/featherlight.css');
  easyorder.loadLink('https://nexusmedia-ua.github.io/cdn/easyorder/externals/frontend/grid.css');
  easyorder.loadLink('https://nexusmedia-ua.github.io/cdn/easyorder/externals/frontend/plugin.css');
  easyorder.loadScript(easyorder.jq191Src, easyorder.initPage);
}