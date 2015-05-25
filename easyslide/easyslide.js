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
        jQuery191(".product-description-slider").accordion( { heightStyle: "content", animate: 200 } );
        jQuery191(".product-description-slider .ui-accordion-header").bind("click",function(){ theOffset = jQuery191(this).parent().offset().top; jQuery191("html, body").animate({scrollTop: (theOffset-50)}, 200);   });
    });
});