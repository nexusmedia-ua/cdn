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
      var ev_main_img = ev$("img[src*='" + ev_main_img_url + "']");

      if (ev_main_img.length < 2) {
        var ev_main_img_url = ev$("#easyvideo_featured_product_image").attr("content");
        var ev_main_img = ev$("img[src*='" + ev_main_img_url + "']");
      }

      if (ev$('.easyvideo_main_image').length > 0) {
        var ev_main_img = ev$('.easyvideo_main_image');
      } else if (ev$("#easyvideo_selector").attr("content") != "") {
        var ev_main_img = ev$( ev$("#easyvideo_selector").attr("content") );
        if (ev_main_img.length < 1) return false;
        if (ev_main_img.length >= 2) {
          ev_main_img = ev_main_img.first();
        }
      } else {
        if (ev_main_img.length >= 2) {
          ev_main_img = ev_main_img.first();
        } else return false;
      }


      var ev_container = ev_main_img.closest("div");
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
            ev_main_img.show();
            if (is_zoom) ev_container.addClass(zoom_class);
            ev$('#easyvideo_video').hide();
          } else {
            ev_video_is_show = false;
          }
        }, 50);
      });

      ev$("img[alt*='youtube.com/watch']").click(function(){
        if (!ev$(this).is(ev_main_img)) {
          ev_video_is_show = true;
          ev_main_img.hide();
          ev$('#easyvideo_video').css("position","relative").css("z-index", "99999").html('<iframe width="100%"  src="https://www.youtube.com/embed/' + ev$(this).prop('alt').replace("https://www.youtube.com/watch?v=", "") + '" frameborder="0" allowfullscreen></iframe>').find("iframe").attr("height", ev$("#easyvideo_video").parent().width() * 0.5625);
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", ev$("#easyvideo_video").parent().width() * 0.5625); }, 50);
          ev$('#easyvideo_video').show();
        }
      });
      ev$("img[alt*='youtube.com/watch']").filter("img[src*='" + ev_main_img_url + "_']").last().trigger('click');

      ev$("img[alt*='//vimeo.com/']").click(function(){
        if (!ev$(this).is(ev_main_img)) {
          ev_video_is_show = true;
          ev_main_img.hide();
          ev$('#easyvideo_video').css("position","relative").css("z-index", "99999").html('<iframe src="https://player.vimeo.com/video/' + ev$(this).prop('alt').replace("https://", "").replace("http://", "").replace("vimeo.com/","") + '" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>').find("iframe").attr("height", ev$("#easyvideo_video").parent().width() * 0.5625);
          setTimeout(function(){ if (is_zoom) ev_container.removeClass(zoom_class); ev$('#easyvideo_video').find("iframe").attr("height", ev$("#easyvideo_video").parent().width() * 0.5625); }, 50);
          ev$('#easyvideo_video').show();
        }
      });
      ev$("img[alt*='//vimeo.com/']").filter("img[src*='" + ev_main_img_url + "_']").last().trigger('click');
    }
});