function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState) {
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
}

var jQuery191;
loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", function(){
    jQuery191 = jQuery.noConflict(true);
    loadScript("//nexusmedia-ua.github.io/cdn/easyslide/jquery191-ui-1.10.4.min.js", function(){
        if (jQuery191("#easyslide_all_closed").size() > 0 && jQuery191("#easyslide_all_closed").val() == "1") {
            jQuery191(".product-description-slider").accordion( { active: false, collapsible: true, heightStyle: "content", animate: 100 } );
        } else {
            jQuery191(".product-description-slider").accordion( { collapsible: true, heightStyle: "content", animate: 100 } );
        }
        if (jQuery191("#scroll_to_accordion").val() == "1") jQuery191(".product-description-slider .ui-accordion-header").bind("click",function(){ theOffset = jQuery191(this).parent().offset().top; jQuery191("html, body").animate({scrollTop: (theOffset-50)}, 100).finish(100);   });
        if (navigator.userAgent.indexOf("Opera") != -1) {
          setTimeout(function(){
            if (jQuery191("#easyslide_all_closed").size() > 0 && jQuery191("#easyslide_all_closed").val() == "1") {
                jQuery191(".product-description-slider").accordion( { active: false, collapsible: true, heightStyle: "content", animate: 100 } );
            } else {
                jQuery191(".product-description-slider").accordion( { collapsible: true, heightStyle: "content", animate: 100 } );
            }
            if (jQuery191("#scroll_to_accordion").val() == "1") jQuery191(".product-description-slider .ui-accordion-header").bind("click",function(){ theOffset = jQuery191(this).parent().offset().top; jQuery191("html, body").animate({scrollTop: (theOffset-50)}, 100).finish(100);   });
          }, 100);
        }
    });
});