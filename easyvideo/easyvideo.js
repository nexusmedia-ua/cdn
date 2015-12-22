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

var ev$;
loadScriptEasyVideo("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", function(){
    ev$ = jQuery.noConflict(true);

    if (ev$('#easyvideo_enabled').attr('content') == "1") {
      easyVideoSetup();
    }


    function easyVideoSetup() {

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


      var ev_container = ev_main_img.closest("div,section,span,a");
      var ev_video_is_show = false;

      ev_container.append("<div id='easyvideo_video' />");
      var is_zoom = false;
      if (ev_container.hasClass("image-zoom")) {
        is_zoom = true;
        var zoom_class = "image-zoom";
      }

      ev_main_img.load(function () {
        setTimeout(function(){
          if (!ev_video_is_show) {
            ev$( ev_main_img_selector ).show();
            if (is_zoom) ev_container.addClass(zoom_class);
            ev$('#easyvideo_video').hide();
          } else {
            ev_video_is_show = false;
          }
        }, 50);
      });

      ev$(".MagicToolboxSelectorsContainer a").on("touchend click", function () {
        setTimeout(function(){
          if (!ev_video_is_show) {
            setTimeout(function(){ ev$('.MagicZoomPlus figure > img').show(); }, 50);
            setTimeout(function(){ ev$('.MagicZoomPlus figure > img').show(); }, 150);
            setTimeout(function(){ ev$('.MagicZoomPlus figure > img').show(); }, 300);
            ev$('#easyvideo_video').hide();
          } else {
            ev_video_is_show = false;
          }
        }, 50);
      });

      ev$("img[alt*='youtu.be/']").on("touchend click", function(){
        if (!ev$(this).is(ev$( ev_main_img_selector ))) {
          ev_video_is_show = true;
          ev_main_img.hide();

          // Special selectors for MagicZoom plugin support + adding delay for touch events
          ev$('.MagicZoomPlus figure > img').hide();
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 50);
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 150);
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 300);

          var width = ev$("#easyvideo_video").width();
          if (ev$("#easyvideo_video").parent().width() > width) width = ev$("#easyvideo_video").parent().width();
          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "9999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$(this).prop('alt').replace("https://youtu.be/", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", width * 0.5625);
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", width * 0.5625); }, 50);

          // Adding delay for touch events
          ev$('#easyvideo_video').show();
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 50);
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 150);
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 300);
        }
      });
      ev$("img[alt*='youtu.be/']").filter("img[src*='" + ev_main_img_url + "_']").last().trigger('click');

      ev$("img[alt*='youtube.com/watch']").on("touchend click", function(){
        if (!ev$(this).is(ev$( ev_main_img_selector ))) {
          ev_video_is_show = true;
          ev_main_img.hide();

          // Special selectors for MagicZoom plugin support + adding delay for touch events
          ev$('.MagicZoomPlus figure > img').hide();
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 50);
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 150);
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 300);

          var width = ev$("#easyvideo_video").width();
          if (ev$("#easyvideo_video").parent().width() > width) width = ev$("#easyvideo_video").parent().width();
          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "9999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$(this).prop('alt').replace("https://www.youtube.com/watch?v=", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", width * 0.5625);
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", width * 0.5625); }, 50);

          // Adding delay for touch events
          ev$('#easyvideo_video').show();
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 50);
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 150);
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 300);
        }
      });
      ev$("img[alt*='youtube.com/watch']").filter("img[src*='" + ev_main_img_url + "_']").last().trigger('click');

      ev$("img[alt*='//vimeo.com/']").on("touchend click", function(){
        if (!ev$(this).is(ev$( ev_main_img_selector ))) {
          ev_video_is_show = true;
          ev_main_img.hide();

          // Special selectors for MagicZoom plugin support + adding delay for touch events
          ev$('.MagicZoomPlus figure > img').hide();
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 50);
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 150);
          setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev_main_img.hide(); }, 300);

          var width = ev$("#easyvideo_video").width();
          if (ev$("#easyvideo_video").parent().width() > width) width = ev$("#easyvideo_video").parent().width();
          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "9999").html('<iframe src="https://player.vimeo.com/video/' + ev$(this).prop('alt').replace("https://", "").replace("http://", "").replace("vimeo.com/","") + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", width * 0.5625);
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", width * 0.5625); }, 50);

          // Adding delay for touch events
          ev$('#easyvideo_video').show();
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 50);
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 150);
          setTimeout(function(){ ev$('#easyvideo_video').show(); }, 300);
        }
      });
      ev$("img[alt*='//vimeo.com/']").filter("img[src*='" + ev_main_img_url + "_']").last().trigger('click');
    }
});