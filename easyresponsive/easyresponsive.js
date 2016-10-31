'use strict';
(function(funcName, baseObj) {
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;
    function ready() {
        if (!readyFired) {
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            readyList = [];
        }
    }
    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }
    baseObj[funcName] = function(callback, context) {
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            readyList.push({fn: callback, ctx: context});
        }
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", ready, false);
                window.addEventListener("load", ready, false);
            } else {
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("documentReady", window);

documentReady(function(){
    
    var er = {};

    er.listen = function(obj, type, fn) {
      if (obj.attachEvent) {
        obj['e'+type+fn] = fn;
        obj[type+fn] = function() {
          obj['e'+type+fn](window.event);
        };
        obj.attachEvent('on'+type, obj[type+fn]);
      } else {
        obj.addEventListener(type, fn, false);
      }
    };

    er.each = function(items, action) {  
      for (var i = 0, len = items.length; i < len; i++) {
        action(items[i], i);
      }
    } // End of my own forEach implementation

    er.filter = function(items, test) {  
      var filtered = [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (test(item, i)) filtered.push(item);
      }

      return filtered;
    } // End of my own filter implementation

    er.debounce = function(func, wait, immediate) {  
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }

    er.resize = function(video, newWidth) {  

	  var isGMap = /(google.com\/maps)/i; 
      if (isGMap.test(video.getAttribute('src'))) { 
      	// That's Google Map 
      	if (document.getElementById("er_map_width") && document.getElementById("er_map_height")) {
          var width = parseInt(document.getElementById("er_map_width").getAttribute("content"));
          var height = parseInt(document.getElementById("er_map_height").getAttribute("content"));
        }
      } else {
      	// That's YouTube or Vimeo video
      	if (document.getElementById("er_video_width") && document.getElementById("er_video_height")) {
          var width = parseInt(document.getElementById("er_video_width").getAttribute("content"));
          var height = parseInt(document.getElementById("er_video_height").getAttribute("content"));
        }
      }

      if (height > 0 && width > 0 && (newWidth.toString() + "px") !== oldWidth) {
        var ASPECT_RATIO = height/width; // 16:9
        var newHeight    = (ASPECT_RATIO * newWidth);
  
        video.removeAttribute('width');
        video.removeAttribute('height');

	    var oldWidth = video.style.width;      
	    video.style.width = newWidth.toString() + "px";
	    video.style.height = newHeight.toString() + "px";
	    setTimeout(function(){ video.style.transition = "width 1s, height 1s"; }, 1000);

	    // If that's map - reload it on resize
        if (isGMap.test(video.getAttribute('src')) && (newWidth.toString() + "px") !== oldWidth) {
          video.src = video.src;
        }

      }
    } // End of resizing a single video element

    var iframes = document.getElementsByTagName('iframe');
    var isVideo = /(youtube)|(vimeo)|(google.com\/maps)/i;
    var videos  = er.filter(iframes, function(iframe) {
      return isVideo.test(iframe.getAttribute('src'));
    });

    var resizeVideos = function() {
      er.each(videos, function(video) {
        var newWidth = video.parentElement.offsetWidth;
        er.resize(video, newWidth);
      });
    }; // End of resizing all videos

    resizeVideos();

    er.listen(window, 'resize', er.debounce(resizeVideos, 70));                                                      

});