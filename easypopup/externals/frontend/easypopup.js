if( typeof easypopup == 'undefined' || typeof easypopup.jq191Src == 'undefined' || typeof easypopup.jq == 'undefined' ) {
  var easypopup = {
    jq191Src: '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
    jq: null,

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

    initPage: function()
    {
      if( !easypopup.jq && typeof jQuery == 'function' && jQuery.fn.jquery == "1.9.1" ) easypopup.jq = jQuery.noConflict(true);
      if( !easypopup.jq ) return;

      easypopup.jq('.easypopup_popups').each(function(){
        if( this.innerHTML.substring(0, 12) == "Liquid error" ) this.remove();
      });

      easypopup.initFeatherlight();
      var event = document.createEvent('Event');
      event.initEvent('easypopup_init', true, true);
      document.dispatchEvent(event);
    },

    getCookie: function(name)
    {
      var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    setCookie: function(name, value, options)
    {
      options = options || {};

      var expires = options.expires;
      if( expires ) {
        expires = parseInt(expires);
        var d = new Date();
        d.setTime(d.getTime() + (expires * 1000));
        expires = options.expires = d;
      }

      if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
      }

      value = encodeURIComponent(value);

      var updatedCookie = name + "=" + value;

      for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
          updatedCookie += "=" + propValue;
        }
      }
      updatedCookie += ";path=/";

      document.cookie = updatedCookie;
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

      if('undefined' === typeof easypopup.jq) {
        if('console' in window){ window.console.info('Too much lightness, Featherlight needs jQuery v1.9.1.'); }
        return;
      }

      /* Featherlight is exported as easypopup.jq.featherlight.
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
          opened = easypopup.jq.grep(opened, function(fl) {
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
        easypopup.jq.each(Featherlight.opened().reverse(), function() {
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
            var events = easypopup.jq.map(eventMap, function(_, name) { return name+'.'+Featherlight.prototype.namespace; } ).join(' ');
            easypopup.jq(window)[set ? 'on' : 'off'](events, globalEventHandler);
          }
        };

      Featherlight.prototype = {
        constructor: Featherlight,
        /*** defaults ***/
        /* extend featherlight with defaults and methods */
        uniqueClass:  '',
        namespace:    'ep_featherlight',  /* Name of the events and css class prefix */
        targetAttr:   'data-featherlight',    /* Attribute of the triggered element that contains the selector to the lightbox content */
        variant:      null,                   /* Class that will be added to change look of the lightbox */
        resetCss:     false,                  /* Reset all css */
        background:   null,                   /* Custom DOM for the background, wrapper and the closebutton */
        openTrigger:  'click',                /* Event that triggers the lightbox */
        closeTrigger: 'click',                /* Event that triggers the closing of the lightbox */
        filter:       null,                   /* Selector to filter events. Think easypopup.jq(...).on('click', filter, eventHandler) */
        root:         '#easypopup-popups-holder', /* Where to append featherlights */
        openSpeed:    250,                    /* Duration of opening animation */
        closeSpeed:   250,                    /* Duration of closing animation */
        closeOnClick: 'background',           /* Close lightbox on click ('background', 'anywhere' or false) */
        closeOnEsc:   true,                   /* Close lightbox when pressing esc */
        closeIcon:    '&#10005;',             /* Close icon */
        loading:      '',                     /* Content to show while initial content is loading */
        persist:      false,                  /* If set, the content persist and will be shown again when opened again. 'shared' is a special value when binding multiple elements for them to share the same content */
        otherClose:   null,                   /* Selector for alternate close buttons (e.g. "a.close") */
        beforeOpen:   easypopup.jq.noop,                 /* Called before open. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */
        beforeContent: easypopup.jq.noop,                /* Called when content is loaded. Gets event as parameter, this contains all data */
        beforeClose:  easypopup.jq.noop,                 /* Called before close. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */
        afterOpen:    easypopup.jq.noop,                 /* Called after open. Gets event as parameter, this contains all data */
        afterContent: easypopup.jq.noop,                 /* Called after content is ready and has been set. Gets event as parameter, this contains all data */
        afterClose:   easypopup.jq.noop,                 /* Called after close. Gets event as parameter, this contains all data */
        onKeyUp:      easypopup.jq.noop,                 /* Called on key down for the frontmost featherlight */
        onResize:     easypopup.jq.noop,                 /* Called after new content and when a window is resized */
        type:         null,                   /* Specify type of lightbox. If unset, it will check for the targetAttrs value. */
        contentFilters: ['jquery', 'image', 'html', 'ajax', 'iframe', 'text'], /* List of content filters to use to determine the content */

        /*** methods ***/
        /* setup iterates over a single instance of featherlight and prepares the background and binds the events */
        setup: function(target, config){
          /* all arguments are optional */
          if (typeof target === 'object' && target instanceof easypopup.jq === false && !config) {
            config = target;
            target = undefined;
          }

          var self = easypopup.jq.extend(this, config, {target: target}),
            css = !self.resetCss ? self.namespace : self.namespace+'-reset', /* by adding -reset to the classname, we reset all the default css */
            $background = easypopup.jq(self.background || [
              '<div class="'+css+'-loading '+css+'">',
                '<div class="'+css+'-content '+self.uniqueClass+'">',
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
            var $target = easypopup.jq(event.target);
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
            easypopup.jq.each(self.contentFilters, function() {
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
          if($content.is('iframe') || easypopup.jq('iframe', $content).length > 0){
            self.$instance.addClass(self.namespace+'-iframe');
          }

          self.$instance.removeClass(self.namespace+'-loading');

          /* replace content by appending to existing one before it is removed
             this insures that featherlight-inner remain at the same relative
             position to any other items added to featherlight-content */
          self.$instance.find('.'+self.namespace+'-inner')
            .not($content)                /* excluded new content, important if persisted */
            .slice(1).remove().end()      /* In the unexpected event where there are many inner elements, remove all but the first one */
            .replaceWith(easypopup.jq.contains(self.$instance[0], $content[0]) ? '' : $content);

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
              return easypopup.jq.when($content)
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
          return easypopup.jq.Deferred().reject().promise();
        },

        /* closes the lightbox. "this" contains $instance with the lightbox, and with the config
          returns a promise, resolved after the lightbox is successfully closed. */
        close: function(event){
          var self = this,
            deferred = easypopup.jq.Deferred();

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
            this[name] = easypopup.jq.proxy(chain[name], this, easypopup.jq.proxy(this[name], this));
          }
        }
      };

      easypopup.jq.extend(Featherlight, {
        id: 0,                                    /* Used to id single featherlight instances */
        autoBind:       '[data-featherlight]',    /* Will automatically bind elements matching this selector. Clear or set before onReady */
        defaults:       Featherlight.prototype,   /* You can access and override all defaults using easypopup.jq.featherlight.defaults, which is just a synonym for easypopup.jq.featherlight.prototype */
        /* Contains the logic to determine content */
        contentFilters: {
          jquery: {
            regex: /^[#.]\w/,         /* Anything that starts with a class name or identifiers */
            test: function(elem)    { return elem instanceof easypopup.jq && elem; },
            process: function(elem) { return this.persist !== false ? easypopup.jq(elem) : easypopup.jq(elem).clone(true); }
          },
          image: {
            regex: /\.(png|jpg|jpeg|gif|tiff|bmp)(\?\S*)?$/i,
            process: function(url)  {
              var self = this,
                deferred = easypopup.jq.Deferred(),
                img = new Image(),
                $img = easypopup.jq('<img src="'+url+'" alt="" class="'+self.namespace+'-image" />');
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
            process: function(html) { return easypopup.jq(html); }
          },
          ajax: {
            regex: /./,            /* At this point, any content is assumed to be an URL */
            process: function(url)  {
              var self = this,
                deferred = easypopup.jq.Deferred();
              /* we are using load so one can specify a target with: url.html #targetelement */
              var $container = easypopup.jq('<div></div>').load(url, function(response, status){
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
              var deferred = new easypopup.jq.Deferred();
              var $content = easypopup.jq('<iframe/>')
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
            process: function(text) { return easypopup.jq('<div>', {text: text}); }
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
            easypopup.jq.each(element.attributes, function(){
              var match = this.name.match(regexp);
              if (match) {
                var val = this.value,
                  name = easypopup.jq.camelCase(match[1]);
                if (easypopup.jq.inArray(name, Klass.functionAttributes) >= 0) {  /* jshint -W054 */
                  val = new Function(val);                           /* jshint +W054 */
                } else {
                  try { val = easypopup.jq.parseJSON(val); }
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
          easypopup.jq.extend(child, this, defaults);
          child.defaults = child.prototype;
          return child;
        },

        attach: function($source, $content, config) {
          var Klass = this;
          if (typeof $content === 'object' && $content instanceof easypopup.jq === false && !config) {
            config = $content;
            $content = undefined;
          }
          /* make a copy */
          config = easypopup.jq.extend({}, config);

          /* Only for openTrigger and namespace... */
          var namespace = config.namespace || Klass.defaults.namespace,
            tempConfig = easypopup.jq.extend({}, Klass.defaults, Klass.readElementConfig($source[0], namespace), config),
            sharedPersist;

          $source.on(tempConfig.openTrigger+'.'+tempConfig.namespace, tempConfig.filter, function(event) {
            /* ... since we might as well compute the config on the actual target */
            var elemConfig = easypopup.jq.extend(
              {$source: $source, $currentTarget: easypopup.jq(this)},
              Klass.readElementConfig($source[0], tempConfig.namespace),
              Klass.readElementConfig(this, tempConfig.namespace),
              config);
            var fl = sharedPersist || easypopup.jq(this).data('featherlight-persisted') || new Klass($content, elemConfig);
            if(fl.persist === 'shared') {
              sharedPersist = fl;
            } else if(fl.persist !== false) {
              easypopup.jq(this).data('featherlight-persisted', fl);
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
          return easypopup.jq.grep(opened, function(fl) { return fl instanceof klass; } );
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
            Klass.attach(easypopup.jq(document), {filter: Klass.autoBind});
            /* Auto bound elements with attr-featherlight-filter won't work
               (since we already used it to bind on document), so bind these
               directly. We can't easily support dynamically added element with filters */
            easypopup.jq(Klass.autoBind).filter('[data-featherlight-filter]').each(function(){
              Klass.attach(easypopup.jq(this));
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

      easypopup.jq.featherlight = Featherlight;

      /* bind jQuery elements to trigger featherlight */
      easypopup.jq.fn.featherlight = function($content, config) {
        return Featherlight.attach(this, $content, config);
      };

      /* bind featherlight on ready if config autoBind is set */
      easypopup.jq(document).ready(function(){ Featherlight._onReady(); });
    }
  }

  easypopup.loadLink('https://nexusmedia-ua.github.io/cdn/easypopup/externals/frontend/featherlight.css');
  easypopup.loadLink('https://nexusmedia-ua.github.io/cdn/easypopup/externals/frontend/grid.css');
  easypopup.loadLink('https://nexusmedia-ua.github.io/cdn/easypopup/externals/frontend/plugin.css');
  easypopup.loadLink('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.css');
  easypopup.loadScript(easypopup.jq191Src, easypopup.initPage);
}