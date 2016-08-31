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
    	var params = { collapsible: true, heightStyle: "content", animate: 100 };
        if (jQuery191("#easyslide_all_closed").size() > 0 && jQuery191("#easyslide_all_closed").val() == "1") {
            params.active = false;
        } 

        if (jQuery191("#easyslide_all_openable").size() > 0 && jQuery191("#easyslide_all_openable").val() == "1") {

                params.beforeActivate = function(event, ui) {

		             // The accordion believes a panel is being opened
		            if (ui.newHeader[0]) {
		                var currHeader  = ui.newHeader;
		                var currContent = currHeader.next('.ui-accordion-content');
		             // The accordion believes a panel is being closed
		            } else {
		                var currHeader  = ui.oldHeader;
		                var currContent = currHeader.next('.ui-accordion-content');
		            }
		             // Since we've changed the default behavior, this detects the actual status
		            var isPanelSelected = currHeader.attr('aria-selected') == 'true';
		            
		             // Toggle the panel's header
		            currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
		            
		            // Toggle the panel's icon
		            currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
		            
		             // Toggle the panel's content
		            currContent.toggleClass('accordion-content-active',!isPanelSelected)    
		            if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

		            return false; // Cancels the default action
		        };
            } 

        jQuery191(".product-description-slider").accordion( params );

        if (jQuery191("#scroll_to_accordion").val() == "1") jQuery191(".product-description-slider .ui-accordion-header").bind("click",function(){ theOffset = jQuery191(this).parent().offset().top; jQuery191("html, body").animate({scrollTop: (theOffset-50)}, 100).finish(100);   });
        if (navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf("Trident") != -1) {
          setTimeout(function(){

          	var params = { collapsible: true, heightStyle: "content", animate: 100 };

            if (jQuery191("#easyslide_all_closed").size() > 0 && jQuery191("#easyslide_all_closed").val() == "1") {
                params.active = false;
            } 
            if (jQuery191("#easyslide_all_openable").size() > 0 && jQuery191("#easyslide_all_openable").val() == "1") {

                params.beforeActivate = function(event, ui) {
                	 // The accordion believes a panel is being opened
		            if (ui.newHeader[0]) {
		                var currHeader  = ui.newHeader;
		                var currContent = currHeader.next('.ui-accordion-content');
		             // The accordion believes a panel is being closed
		            } else {
		                var currHeader  = ui.oldHeader;
		                var currContent = currHeader.next('.ui-accordion-content');
		            }
		             // Since we've changed the default behavior, this detects the actual status
		            var isPanelSelected = currHeader.attr('aria-selected') == 'true';
		            
		             // Toggle the panel's header
		            currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
		            
		            // Toggle the panel's icon
		            currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
		            
		             // Toggle the panel's content
		            currContent.toggleClass('accordion-content-active',!isPanelSelected)    
		            if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

		            return false; // Cancels the default action
		        };
            } 

            jQuery191(".product-description-slider").accordion( params );
            if (jQuery191("#scroll_to_accordion").val() == "1") jQuery191(".product-description-slider .ui-accordion-header").bind("click",function(){ theOffset = jQuery191(this).parent().offset().top; jQuery191("html, body").animate({scrollTop: (theOffset-50)}, 100).finish(100);   });
          }, 100);
        }
    });
});