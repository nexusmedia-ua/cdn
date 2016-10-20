function loadScriptEasyVideo(url, callback) {
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

function hideMainImage(ev$, ev_main_img) {

    ev_main_img.hide();
    ev_main_img.removeAttr('data-zoom-image');

    // Special selectors for MagicZoom plugin support + adding delay for touch events
    ev$('.MagicZoomPlus figure > img').hide();
    ev$('.MagicZoomPlus > img').hide();
    ev$('.zoomContainer').css('height', '0px');
    ev$('.mousetrap').css('display', 'none');    
    setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev$('.MagicZoomPlus > img').hide(); ev$('.zoomContainer').css('height', '0px'); ev_main_img.hide(); ev$('.mousetrap').css('display', 'none'); }, 50);
    setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev$('.MagicZoomPlus > img').hide(); ev$('.zoomContainer').css('height', '0px'); ev_main_img.hide(); ev$('.mousetrap').css('display', 'none'); }, 150);
    setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev$('.MagicZoomPlus > img').hide(); ev$('.zoomContainer').css('height', '0px'); ev_main_img.hide(); ev$('.mousetrap').css('display', 'none'); }, 300);
}

function showVideoBlock(ev$) {

    ev$('#easyvideo_video').show();

    // Adding delay for touch events
    setTimeout(function(){ ev$('#easyvideo_video').show(); }, 50);
    setTimeout(function(){ ev$('#easyvideo_video').show(); }, 150);
    setTimeout(function(){ ev$('#easyvideo_video').show(); }, 300);


}

var ev$;
loadScriptEasyVideo("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", function(){
    ev$ = jQuery.noConflict(true);

    if (ev$('#easyvideo_enabled').attr('content') == "1") {
      ev$("img[alt*='//vimeo.com/']").show();
      ev$("img[alt*='youtube.com/watch']").show();
      ev$("img[alt*='youtu.be/']").show();
      easyVideoSetup();
    }


    ev$(window).load(function(){
      ev$('.video-container').parent().height(ev$('.video-container').parent().parent().height());
    });
    ev$(window).resize(function(){
      ev$('.video-container').parent().height(ev$('.video-container').parent().parent().height());
    });

    function easyVideoSetup() {

      var ev_dimensions = ev$("#easyvideo_dimensions").attr("content");
      if (!ev_dimensions) ev_dimensions = 0.5625;

      // Fix for Owl Slider on PhotoBooth theme
      ev$("#product-images .owl-item div img[alt*='youtube.com/watch']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#product-images").width() * ev_dimensions)).css("height", Math.round(ev$("#product-images").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });
      ev$("#product-images-portrait .owl-item div img[alt*='youtube.com/watch']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#product-images-portrait").width() * ev_dimensions)).css("height", Math.round(ev$("#product-images-portrait").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });
      ev$("#mob-product-images .owl-item div img[alt*='youtube.com/watch']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#mob-product-images").width() * ev_dimensions)).css("height", Math.round(ev$("#mob-product-images").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });
      ev$("#product-images .owl-item div img[alt*='youtu.be/']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://youtu.be/", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#product-images").width() * ev_dimensions)).css("height", Math.round(ev$("#product-images").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });
      ev$("#product-images-portrait .owl-item div img[alt*='youtu.be/']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://youtu.be/", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#product-images-portrait").width() * ev_dimensions)).css("height", Math.round(ev$("#product-images-portrait").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });        
      ev$("#mob-product-images .owl-item div img[alt*='youtu.be/']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://youtu.be/", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#mob-product-images").width() * ev_dimensions)).css("height", Math.round(ev$("#mob-product-images").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });
      ev$("#product-images .owl-item div img[alt*='//vimeo.com/']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#product-images").width() * ev_dimensions)).css("height", Math.round(ev$("#product-images").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });
      ev$("#product-images-portrait .owl-item div img[alt*='//vimeo.com/']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#product-images-portrait").width() * ev_dimensions)).css("height", Math.round(ev$("#product-images-portrait").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });        
      ev$("#mob-product-images .owl-item div img[alt*='//vimeo.com/']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", Math.round(ev$("#mob-product-images").width() * ev_dimensions)).css("height", Math.round(ev$("#mob-product-images").width() * ev_dimensions) + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
        }
      });


      // Fix for Retina theme
      ev$('.flexslider .slides li .video-container').each(function(){
        var video_link = ev$(this).find('a').html();
        flexwidth = ev$('.flexslider').width();
        if (parseInt(flexwidth) == 0) flexwidth = 505;
        if ( video_link.toLowerCase().indexOf("youtube.com/watch") >= 0 ) {
          ev$(this).html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").replace("&", "?").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
        if ( video_link.toLowerCase().indexOf("youtu.be/") >= 0 ) {
          ev$(this).html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://youtu.be/", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
        if ( video_link.toLowerCase().indexOf("//vimeo.com/") >= 0 ) {
          ev$(this).html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", flexwidth * Math.round(ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
      });
      
      // Fix for Brooklyn theme
      ev$('.product-single__photos .product-single__photo').each(function(){
        var video_link = ev$(this).attr('alt');
        flexwidth = ev$(this).parent().parent().width();
        if (parseInt(flexwidth) == 0) flexwidth = 505;
        if ( video_link.toLowerCase().indexOf("youtube.com/watch") >= 0 ) {
          ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").replace("&", "?").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
        if ( video_link.toLowerCase().indexOf("youtu.be/") >= 0 ) {
          ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://youtu.be/", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
        if ( video_link.toLowerCase().indexOf("//vimeo.com/") >= 0 ) {
          ev$(this).parent().html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
      });

      // Fix for Boundless theme
      ev$('.product__photo > img, .mobile-gallery > .slides > li > img').each(function(){
        var video_link = ev$(this).attr('alt');
        flexwidth = ev$(this).parent().width();
        if (parseInt(flexwidth) == 0) flexwidth = 505;
        if ( video_link.toLowerCase().indexOf("youtube.com/watch") >= 0 ) {
          ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").replace("&", "?").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
        if ( video_link.toLowerCase().indexOf("youtu.be/") >= 0 ) {
          ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://youtu.be/", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
        if ( video_link.toLowerCase().indexOf("//vimeo.com/") >= 0 ) {
          ev$(this).parent().html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
      });   

      // Fix for Blockshop theme
      ev$('.photos > .container > .photo > img').each(function(){
        var video_link = ev$(this).attr('alt');
        flexwidth = ev$(this).parent().parent().width();
        if (parseInt(flexwidth) == 0) flexwidth = 505;
        if ( video_link.toLowerCase().indexOf("youtube.com/watch") >= 0 ) {
          ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").replace("&", "?").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
        if ( video_link.toLowerCase().indexOf("youtu.be/") >= 0 ) {
          ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://youtu.be/", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
        if ( video_link.toLowerCase().indexOf("//vimeo.com/") >= 0 ) {
          ev$(this).parent().html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", Math.round(flexwidth * ev_dimensions)).css("height", Math.round(flexwidth * ev_dimensions) + "px");
        }
      });          
        
      var ev_main_img_url = ev$("#easyvideo_featured_main_image").attr("content");
      var ev_main_img_selector = "img[src*='" + ev_main_img_url + "']";
      var ev_main_img = ev$( ev_main_img_selector );

      if (ev_main_img.length < 2) {
        ev_main_img_url = ev$("#easyvideo_featured_product_image").attr("content");
        ev_main_img_selector = "img[src*='" + ev_main_img_url + "']";
        ev_main_img = ev$( ev_main_img_selector );
      }

      if (ev$('.easyvideo_main_image').length > 0) {
        ev_main_img_selector = '.easyvideo_main_image';
        ev_main_img = ev$( ev_main_img_selector );
      } else if (ev$("#easyvideo_selector").attr("content") != "") {
        ev_main_img_selector = ev$("#easyvideo_selector").attr("content") ;
        ev_main_img = ev$( ev_main_img_selector );
        if (ev_main_img.length < 1) return false;
        if (ev_main_img.length >= 2) {
          ev_main_img = ev_main_img.first();
        }
      } else {
        if (ev_main_img.length >= 2) {
          ev_main_img = ev_main_img.first();
        } else return false;
      }


      var ev_main_img_parent = ev_main_img.parent();
      var ev_container = ev_main_img.closest("div,section,span,a");
      var ev_video_is_show = false;

      var video_width = ev_main_img.width();
      if (ev$("#easyvideo_video").width() > video_width) video_width = ev$("#easyvideo_video").width();
      if (ev$("#easyvideo_video").parent().width() > video_width) video_width = ev$("#easyvideo_video").parent().width();
      if (video_width == 0) video_width = ev$("#easyvideo_video").parent().parent().width();
      if (video_width == 0) video_width = 300;

      ev_container.append("<div id='easyvideo_video' />");
      var is_zoom = false;
      if (ev_container.hasClass("image-zoom")) {
        is_zoom = true;
        var zoom_class = "image-zoom";
      }

      ev_main_img.load(function () {
        setTimeout(function(){
          //console.log('Main Img Load Fired: ' + ev_video_is_show);
          if (!ev_video_is_show) {
            //console.log('showing image by this selector: ' + ev_main_img_selector);
            ev_main_img_parent.find("img").first().show();
            if (is_zoom) ev_container.addClass(zoom_class);

            // fix for ElevateZoom
            ev$('.zoomContainer').css('height', ev_main_img_parent.find("img").first().height() + 'px').css('width', ev_main_img_parent.find("img").first().width() + 'px')
            //ev$('.mousetrap').css('display', '');  
            ev$('#easyvideo_video').hide();
          } else {
            ev_video_is_show = false;
          }
        }, 50);
      });

      // Fix for MagicZoom
      ev$(".MagicToolboxSelectorsContainer a").on("touchend click", function () {
        setTimeout(function(){
          //console.log('MagicToolboxSelectorsContainer a Touchend Fired: ' + ev_video_is_show);
          if (!ev_video_is_show) {
            setTimeout(function(){ ev$('.MagicZoomPlus figure > img').show(); ev$('.MagicZoomPlus > img').show(); }, 50);
            setTimeout(function(){ ev$('.MagicZoomPlus figure > img').show(); ev$('.MagicZoomPlus > img').show(); }, 150);
            setTimeout(function(){ ev$('.MagicZoomPlus figure > img').show(); ev$('.MagicZoomPlus > img').show(); }, 300);
            ev$('#easyvideo_video').hide();
          } else {
            ev_video_is_show = false;
          }
        }, 50);
        ev$('.MagicZoomPlus').css('display','block');
      });


      if (ev$('#easyvideo_popup').attr('content') == "1") {

        var waitForFinalEvent = (function () {
          var timers = {};
          return function (callback, ms, uniqueId) {
            if (!uniqueId) {
              uniqueId = "Don't call this twice without a uniqueId";
            }
            if (timers[uniqueId]) {
              clearTimeout (timers[uniqueId]);
            }
            timers[uniqueId] = setTimeout(callback, ms);
          };
        })();

        function evClosePopupWindow() {
          console.log('closing');
          $(document).unbind("keyup", escKeyHandler);
          ev$("#easyvideo_popup_wrapper").css("opacity", 0);
          setTimeout(function(){
            ev$("#easyvideo_popup_wrapper").remove();
          },201);
        }

        var escKeyHandler = function(e){
          if(e.keyCode === 27) evClosePopupWindow();
        }

        function evShowPopupVideo(e, type) {
          if (!ev$(this).is(ev_main_img_parent.find("img").first())) {

            if (type == "youtube") {
              var lnk = "https://www.youtube.com/watch?v=";
              var src = "https://www.youtube.com/embed/";
            } else if (type == "youtu.be") {
              var lnk = "https://youtu.be/";
              var src = "https://www.youtube.com/embed/";
            } else if (type == "vimeo") {
              var lnk = "https://vimeo.com/";
              var src = "https://player.vimeo.com/video/";
            } else return false;

            var youtubelink = e.prop('alt').replace(lnk, "");

            var wrapper = jQuery('<div/>', {
                id: 'easyvideo_popup_wrapper'
            }).css("position","fixed")
              .css("top","0")
              .css("bottom","0")
              .css("left","0")
              .css("right","0")
              .css("background","rgba(0,0,0,.6)")
              .css("z-index","999999")
              .css("opacity", "0")
              .css("transition", "visibility 0s, opacity 0.2s linear")
              .appendTo('body')
              .html('<iframe width="100%" id="easyvideo_popup_video" style="max-width: 800px; margin: auto" src="' + src + youtubelink + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe><a id="easyvideo_popup_close" href="#"><img width="50" height="50" src="https://nexusmedia-ua.github.io/cdn/easyvideo/cross.svg" /></a>');

            var video_width = ev$('#easyvideo_popup_video').width();
            wrapper.css( "opacity", 1 );
            ev$("#easyvideo_popup_video").attr("height", Math.round(video_width * ev_dimensions))
              .css("width", video_width + "px")
              .css('position', 'absolute')
              .css('top', '50%')
              .css('left', '50%')
              .css('margin-left', '-' + Math.round(video_width/2) + 'px')
              .css('margin-top', '-' + Math.round(video_width * ev_dimensions / 2) + 'px');

            ev$("#easyvideo_popup_close")
              .css("position", "absolute")
              .css("top", "50%")
              .css("left", "50%")
              .css("color", "#ffffff")
              .css('margin-left', ( Math.round(video_width/2) - 43 ) + 'px')
              .css('margin-top', '-' + ( Math.round(video_width * ev_dimensions / 2) +50 ) + 'px').click(function(e){
                 e.preventDefault();
                 evClosePopupWindow();
              });

            ev$('#easyvideo_popup_wrapper').click(function(){
               evClosePopupWindow();
            });

            $(document).bind("keyup", escKeyHandler);

          }          
        }

        ev$("img[alt*='youtube.com/watch']").unbind("click").on("touchend click", function(e){
          e.preventDefault();
          evShowPopupVideo(ev$(this), "youtube");
        });

        ev$("img[alt*='youtu.be/']").on("touchend click", function(e){
          e.preventDefault();
          evShowPopupVideo(ev$(this), "youtu.be");
        });

        ev$("img[alt*='//vimeo.com/']").on("touchend click", function(e){
          e.preventDefault();
          evShowPopupVideo(ev$(this), "vimeo");
        });

        if (typeof $ == 'function') {
          $("img[alt*='youtube.com/watch']").unbind("click").parent().unbind("click");
          $("img[alt*='youtu.be/']").unbind("click").parent().unbind("click");
          $("img[alt*='vimeo.com/']").unbind("click").parent().unbind("click");
        }

        ev$(window).resize(function () {
            waitForFinalEvent(function(){
              ev$("#easyvideo_popup_video").css("width", "100%");
              var d_video_width = ev$('#easyvideo_popup_video').width();

              ev$("#easyvideo_popup_video").attr("height", Math.round(d_video_width * ev_dimensions))
                .css("width", d_video_width + "px")
                .css('margin-left', '-' + Math.round(d_video_width/2) + 'px')
                .css('margin-top', '-' + Math.round(d_video_width * ev_dimensions / 2) + 'px');  

              ev$("#easyvideo_popup_close")
                .css('margin-left', ( Math.round(d_video_width/2) - 50 ) + 'px')
                .css('margin-top', '-' + ( Math.round(d_video_width * ev_dimensions / 2) + 50 ) + 'px');

            }, 200, "ev_win_resize");
        });

      } else {

        if (ev$("img[alt*='youtu.be/']").filter("img[src*='" + ev_main_img_url + "']").size() > 0) {
            hideMainImage(ev$, ev_main_img);

            ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$("img[alt*='youtu.be/']").filter("img[src*='" + ev_main_img_url + "']").first().prop('alt').replace("https://youtu.be/", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
            if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
              video_width = ev$('#easyvideo_video').find("iframe").width();
              ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
            }
            setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", Math.round(ev$('#easyvideo_video').find("iframe").width() * ev_dimensions)); }, 150);

            showVideoBlock(ev$);
        }

        ev$("img[alt*='youtu.be/']").on("touchend click", function(){
          if (!ev$(this).is(ev_main_img_parent.find("img").first())) {
            ev_video_is_show = true;

            hideMainImage(ev$, ev_main_img);

            ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$(this).prop('alt').replace("https://youtu.be/", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
             if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
              video_width = ev$('#easyvideo_video').find("iframe").width();
              ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
            }
            setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", Math.round( ev$('#easyvideo_video').find("iframe").width() * ev_dimensions)); }, 150);

            showVideoBlock(ev$);
          }
        });



        if (ev$("img[alt*='youtube.com/watch']").filter("img[src*='" + ev_main_img_url + "']").size() > 0) {
            hideMainImage(ev$, ev_main_img);

            ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$("img[alt*='youtube.com/watch']").filter("img[src*='" + ev_main_img_url + "']").first().prop('alt').replace("https://www.youtube.com/watch?v=", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
            if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
              video_width = ev$('#easyvideo_video').find("iframe").width();
              ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
            }
            setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", Math.round( ev$('#easyvideo_video').find("iframe").width() * ev_dimensions)); }, 150);

            showVideoBlock(ev$);
        }

        ev$("img[alt*='youtube.com/watch']").on("touchend click", function(){
          if (!ev$(this).is(ev_main_img_parent.find("img").first())) {
            ev_video_is_show = true;
            hideMainImage(ev$, ev_main_img);
            ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$(this).prop('alt').replace("https://www.youtube.com/watch?v=", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
            if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
              video_width = ev$('#easyvideo_video').find("iframe").width();
              ev$('#easyvideo_video').find("iframe").attr("height", Math.round(video_width * ev_dimensions));
            }
            setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", Math.round( ev$('#easyvideo_video').find("iframe").width() * ev_dimensions)); }, 150);
            showVideoBlock(ev$);
          }
        });


        ev$("img[alt*='//vimeo.com/']").on("touchend click", function(){
          if (!ev$(this).is(ev_main_img_parent.find("img").first())) {
            ev_video_is_show = true;

            hideMainImage(ev$, ev_main_img);

            ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe src="https://player.vimeo.com/video/' + ev$(this).prop('alt').replace("https://", "").replace("http://", "").replace("vimeo.com/","") + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", Math.round( video_width * ev_dimensions));
            if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
              video_width = ev$('#easyvideo_video').find("iframe").width();
              ev$('#easyvideo_video').find("iframe").attr("height", Math.round( video_width * ev_dimensions));
            }
            setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", Math.round( ev$('#easyvideo_video').find("iframe").width() * ev_dimensions)); }, 150);

            showVideoBlock(ev$);
          }
        });

        if (ev$("img[alt*='//vimeo.com/']").filter("img[src*='" + ev_main_img_url + "']").size() > 0) {
            hideMainImage(ev$, ev_main_img);

            ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe src="https://player.vimeo.com/video/' + ev$("img[alt*='//vimeo.com/']").filter("img[src*='" + ev_main_img_url + "']").first().prop('alt').replace("https://", "").replace("http://", "").replace("vimeo.com/","") + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", Math.round( video_width * ev_dimensions ));
            if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
              video_width = ev$('#easyvideo_video').find("iframe").width();
              ev$('#easyvideo_video').find("iframe").attr("height", Math.round( video_width * ev_dimensions));
            }
            setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", Math.round( ev$('#easyvideo_video').find("iframe").width() * ev_dimensions)); }, 150);

            showVideoBlock(ev$);
        }

        ev$("img").not("img[alt*='youtu.be/']").not("img[alt*='youtube.com/watch']").not("img[alt*='//vimeo.com/']").on("touchend click", function(){
            ev_video_is_show = false;
        });
        
      }

    }
});