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

    // Special selectors for MagicZoom plugin support + adding delay for touch events
    ev$('.MagicZoomPlus figure > img').hide();
    ev$('.MagicZoomPlus > img').hide();
    setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev$('.MagicZoomPlus > img').hide(); ev_main_img.hide(); }, 50);
    setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev$('.MagicZoomPlus > img').hide(); ev_main_img.hide(); }, 150);
    setTimeout(function(){ ev$('.MagicZoomPlus figure > img').hide(); ev$('.MagicZoomPlus > img').hide(); ev_main_img.hide(); }, 300);
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
      easyVideoSetup();
    }


    function easyVideoSetup() {

      // Fix for Owl Slider on PhotoBooth theme
      ev$("#product-images .owl-item div img[alt*='youtube.com/watch']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", ev$("#product-images").width() * 0.5625).css("height", ev$("#product-images").width() * 0.5625 + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
        }
      });
      ev$("#product-images .owl-item div img[alt*='youtu.be/']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://youtu.be/", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", ev$("#product-images").width() * 0.5625).css("height", ev$("#product-images").width() * 0.5625 + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
        }
      });
      ev$("#product-images .owl-item div img[alt*='//vimeo.com/']").each(function(){
        var video_link = ev$(this).prop("alt");
        ev$(this).parent().html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", ev$("#product-images").width() * 0.5625).css("height", ev$("#product-images").width() * 0.5625 + "px");
        if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
          video_width = ev$('#easyvideo_video').find("iframe").width();
          ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
        }
      });


      // Fix for Retina theme
      ev$('.flexslider .slides li .video-container').each(function(){
        var video_link = ev$(this).find('a').html();
        flexwidth = ev$('.flexslider').width();
        if (parseInt(flexwidth) == 0) flexwidth = 505;
        if ( video_link.toLowerCase().indexOf("youtube.com/watch") >= 0 ) {
          ev$(this).html('<iframe width="100%"  src="https://www.youtube.com/embed/' + video_link.replace("https://www.youtube.com/watch?v=", "").trim() + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", flexwidth * 0.5625).css("height", flexwidth * 0.5625 + "px");
          if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
            video_width = ev$('#easyvideo_video').find("iframe").width();
            ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
          }
        }
        if ( video_link.toLowerCase().indexOf("//vimeo.com/") >= 0 ) {
          ev$(this).html('<iframe src="https://player.vimeo.com/video/' + video_link.replace("https://", "").replace("http://", "").replace("vimeo.com/","").trim() + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", flexwidth * 0.5625).css("height", flexwidth * 0.5625 + "px");
          if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
            video_width = ev$('#easyvideo_video').find("iframe").width();
            ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
          }
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
          //console.log('Min Img Load Fired: ' + ev_video_is_show);
          if (!ev_video_is_show) {
            console.log('showing image by this selector: ' + ev_main_img_selector);
            ev_main_img_parent.find("img").first().show();
            if (is_zoom) ev_container.addClass(zoom_class);
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
            ev$('.MagicZoomPlus').css('display','block');
          }
        }, 50);
      });

      if (ev$("img[alt*='youtu.be/']").filter("img[src*='" + ev_main_img_url + "_']").size() > 0) {
          hideMainImage(ev$, ev_main_img);

          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$("img[alt*='youtu.be/']").filter("img[src*='" + ev_main_img_url + "_']").first().prop('alt').replace("https://youtu.be/", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", video_width * 0.5625);
          if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
            video_width = ev$('#easyvideo_video').find("iframe").width();
            ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
          }
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", ev$('#easyvideo_video').find("iframe").width() * 0.5625); }, 150);

          showVideoBlock(ev$);
      }

      ev$("img[alt*='youtu.be/']").on("touchend click", function(){
        if (!ev$(this).is(ev_main_img_parent.find("img").first())) {
          ev_video_is_show = true;

          hideMainImage(ev$, ev_main_img);

          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$(this).prop('alt').replace("https://youtu.be/", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", video_width * 0.5625);
           if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
            video_width = ev$('#easyvideo_video').find("iframe").width();
            ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
          }
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", ev$('#easyvideo_video').find("iframe").width() * 0.5625); }, 150);

          showVideoBlock(ev$);
        }
      });



      if (ev$("img[alt*='youtube.com/watch']").filter("img[src*='" + ev_main_img_url + "_']").size() > 0) {
          hideMainImage(ev$, ev_main_img);

          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$("img[alt*='youtube.com/watch']").filter("img[src*='" + ev_main_img_url + "_']").first().prop('alt').replace("https://www.youtube.com/watch?v=", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", video_width * 0.5625);
          if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
            video_width = ev$('#easyvideo_video').find("iframe").width();
            ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
          }
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", ev$('#easyvideo_video').find("iframe").width() * 0.5625); }, 150);

          showVideoBlock(ev$);
      }

      ev$("img[alt*='youtube.com/watch']").on("touchend click", function(){
        if (!ev$(this).is(ev_main_img_parent.find("img").first())) {
          ev_video_is_show = true;
          hideMainImage(ev$, ev_main_img);
          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$(this).prop('alt').replace("https://www.youtube.com/watch?v=", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", video_width * 0.5625);
          if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
            video_width = ev$('#easyvideo_video').find("iframe").width();
            ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
          }
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", ev$('#easyvideo_video').find("iframe").width() * 0.5625); }, 150);
          showVideoBlock(ev$);
        }
      });


      ev$("img[alt*='//vimeo.com/']").on("touchend click", function(){
        if (!ev$(this).is(ev_main_img_parent.find("img").first())) {
          ev_video_is_show = true;

          hideMainImage(ev$, ev_main_img);

          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe src="https://player.vimeo.com/video/' + ev$(this).prop('alt').replace("https://", "").replace("http://", "").replace("vimeo.com/","") + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", video_width * 0.5625);
          if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
            video_width = ev$('#easyvideo_video').find("iframe").width();
            ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
          }
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", ev$('#easyvideo_video').find("iframe").width() * 0.5625); }, 150);

          showVideoBlock(ev$);
        }
      });

      if (ev$("img[alt*='//vimeo.com/']").filter("img[src*='" + ev_main_img_url + "_']").size() > 0) {
          hideMainImage(ev$, ev_main_img);

          ev$('#easyvideo_video').css("line-height","0").css("position","relative").css("z-index", "999").html('<iframe src="https://player.vimeo.com/video/' + ev$("img[alt*='//vimeo.com/']").filter("img[src*='" + ev_main_img_url + "_']").first().prop('alt').replace("https://", "").replace("http://", "").replace("vimeo.com/","") + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", video_width * 0.5625);
          if ( ev$('#easyvideo_video').find("iframe").width() > 0) {
            video_width = ev$('#easyvideo_video').find("iframe").width();
            ev$('#easyvideo_video').find("iframe").attr("height", video_width * 0.5625);
          }
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", ev$('#easyvideo_video').find("iframe").width() * 0.5625); }, 150);

          showVideoBlock(ev$);
      }

    }
});