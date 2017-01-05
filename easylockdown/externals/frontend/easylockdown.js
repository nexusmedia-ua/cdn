if( typeof easylockdown == 'undefined' || typeof easylockdown.router == 'undefined' ) {
  var easylockdown = {
    jq191Src: '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
    jq: null,
    checkPasswordUrl: '//shopifier.net/app/easylockdown/check_password.php',
    hideLinks: [],
    gotoUrl: '',
    activeId: '',
    showContent: false,

    loadScript: function(url, callback)
    {
      var script = document.createElement("script");
      script.type = "text/javascript";

      if( script.readyState ) {
        script.onreadystatechange = function () {
          if( script.readyState == "loaded" || script.readyState == "complete" ) {
            script.onreadystatechange = null;
            if( typeof callback === 'function' ) callback();
          }
        };
      } else {
        script.onload = function () {
          if( typeof callback === 'function' ) callback();
        }
      }

      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
    },

    initPage: function()
    {
      if( !easylockdown.jq && typeof jQuery == 'function' && jQuery.fn.jquery == "1.9.1" ) easylockdown.jq = jQuery.noConflict(true);

      if( !easylockdown.jq ) {
        easylockdown.loadScript(easylockdown.jq191Src, easylockdown.initPage);
        return;
      }
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

    router: function( h )
    {
      if( easylockdown.gotoUrl ) window.location.href = easylockdown.gotoUrl;

      if( easylockdown.activeId && h ) {
        var ch = easylockdown.getCookie(h[1] + h[5] + h[8] + h[11] + h[13] + easylockdown.activeId);
        if( ch && ch == h ) {
          easylockdown.jq('#easylockdown-content').show();
          easylockdown.showContent = true;
          return;
        }
      }
    },

    unhide: function( h )
    {
      if( easylockdown.activeId && h ) {
        var ch = easylockdown.getCookie(h[1] + h[5] + h[8] + h[11] + h[13] + easylockdown.activeId);
        if( ch && ch == h ) {
          easylockdown.jq("form[action='/cart/add']").show();
          easylockdown.showContent = true;
          return;
        }
      }
    },

    getSearchParameters: function()
    {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != '' ? easylockdown.transformToAssocArray(prmstr) : {};
    },

    transformToAssocArray: function( prmstr )
    {
      var params = {};
      var prmarr = prmstr.split("&");
      for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
      }
      return params;
    },

    insertAfter: function( referenceNode, newNode )
    {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    },

    checkUnlockPassword: function( btn )
    {
      if( !easylockdown.activeId ) return;

      var $passField = easylockdown.jq(btn).parent().closest('#easylockdown-password-form').find('#easylockdown-password');
      if( $passField.length ) {

        easylockdown.jq.ajax({
          type: 'POST',
          url: easylockdown.checkPasswordUrl,
          async: true,
          dataType: 'json',
          data: {'password': $passField.val(), 'aid': easylockdown.activeId},
          success: function(response) {
            if( response.success && response.h ) {
              var h = response.h;
              easylockdown.jq('#easylockdown-password-error').hide();
              easylockdown.jq('#easylockdown-password').removeClass('easylockdown-error');
              easylockdown.setCookie(h[1] + h[5] + h[8] + h[11] + h[13] + easylockdown.activeId, h);
              window.location.reload(true);
            } else {
              easylockdown.jq('#easylockdown-password-error').show();
              easylockdown.jq('#easylockdown-password').addClass('easylockdown-error');
            }
          }
        });
      }
    }
  }

  var loginRegex = new RegExp('\/account\/login');
  if( loginRegex.test(window.location.href)){
    var params = easylockdown.getSearchParameters();

    if( typeof params['return_to'] == 'string' ) {
      var returnToEl = document.getElementsByName("checkout_url");

      if( typeof returnToEl[0] == 'object') {
        returnToEl[0].setAttribute('value', params['return_to']);

      } else {
        var emailEl = document.getElementsByName("customer[email]");

        if( typeof emailEl[0] == 'object') {
          returnToEl = document.createElement("input");
          returnToEl.setAttribute('type', 'hidden');
          returnToEl.setAttribute('name', 'checkout_url');
          returnToEl.setAttribute('value', params['return_to']);
          easylockdown.insertAfter(emailEl[0], returnToEl);
        }
      }
    }
  }

  easylockdown.loadScript(easylockdown.jq191Src, easylockdown.initPage);
}