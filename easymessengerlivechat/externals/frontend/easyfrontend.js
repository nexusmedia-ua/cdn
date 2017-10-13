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
      // to do
    }
  }

  easypopup.loadScript(easypopup.jq191Src, easypopup.initPage);
}