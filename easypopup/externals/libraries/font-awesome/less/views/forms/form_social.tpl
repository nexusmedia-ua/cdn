<form id="widget-edit-form" class="next-card" onsubmit="return false;">
  <div id="form-type-text">
    <div id="widget-edit-error" class="stat--red"></div>

    <label for="widget_setting_btn_icon_color">Icon color</label>
    <input type="text" name="widget_setting_btn_icon_color" id="widget_setting_btn_icon_color"
           data-type="widget-style" data-style="color" data-preview-selector=".popup-social-buttons li i" data-spec="colorpicker"
           value="<?php if( isset($cp['btn_icon_color']) ) echo $cp['btn_icon_color']?>" />

    <label for="widget_setting_btn_background">Button background color</label>
    <input type="text" name="widget_setting_btn_background_color" id="widget_setting_btn_background_color"
           data-type="widget-style" data-style="background" data-preview-selector=".popup-social-buttons li i" data-spec="colorpicker"
           value="<?php if( isset($cp['btn_background_color']) ) echo $cp['btn_background_color']?>" />

    <label for="widget_setting_btn_size">Button size</label>
    <input type="number" name="widget_setting_btn_size" id="widget_setting_btn_size" min="12" max="60"
           data-type="widget-style" data-style="btn-size" data-preview-selector=".popup-social-buttons li i"
           value="<?php if( isset($cp['btn_size']) ) echo $cp['btn_size']?>" />

    <label for="widget_setting_fb_url">Facebook URL</label>
    <input type="text" name="widget_setting_fb_url" id="widget_setting_fb_url"
           data-type="widget-style" data-style="show-field" data-preview-selector=".popup-social-buttons li:eq(0)"
           value="<?php if( isset($cp['fb_url']) ) echo $cp['fb_url']?>" />

    <label for="widget_setting_tw_url">Twitter URL</label>
    <input type="text" name="widget_setting_tw_url" id="widget_setting_tw_url"
           data-type="widget-style" data-style="show-field" data-preview-selector=".popup-social-buttons li:eq(1)"
           value="<?php if( isset($cp['tw_url']) ) echo $cp['tw_url']?>" />

    <label for="widget_setting_instagram_url">Instagram URL</label>
    <input type="text" name="widget_setting_instagram_url" id="widget_setting_instagram_url"
           data-type="widget-style" data-style="show-field" data-preview-selector=".popup-social-buttons li:eq(2)"
           value="<?php if( isset($cp['instagram_url']) ) echo $cp['instagram_url']?>" />

    <label for="widget_setting_tumblr_url">Tumblr URL</label>
    <input type="text" name="widget_setting_tumblr_url" id="widget_setting_tumblr_url"
           data-type="widget-style" data-style="show-field" data-preview-selector=".popup-social-buttons li:eq(3)"
           value="<?php if( isset($cp['tumblr_url']) ) echo $cp['tumblr_url']?>" />

    <label for="widget_setting_pinterest_url">Pinterest URL</label>
    <input type="text" name="widget_setting_pinterest_url" id="widget_setting_pinterest_url"
           data-type="widget-style" data-style="show-field" data-preview-selector=".popup-social-buttons li:eq(4)"
           value="<?php if( isset($cp['pinterest_url']) ) echo $cp['pinterest_url']?>" />

    <?php include 'common_widget_fields.tpl';?>

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveWidgetContentParams();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditWidget();">Cancel</button>
    </div>

    <div class="preview-object">
      <ul id="popup-social-buttons" class="popup-social-buttons">
        <li><a href="javascript:void(0);" id="share-button-fb"><i class="fa fa-facebook"></i></a></li>
        <li><a href="javascript:void(0);" id="share-button-tw"><i class="fa fa-twitter"></i></a></li>
        <li><a href="javascript:void(0);" id="share-button-instagram"><i class="fa fa-instagram"></i></a></li>
        <li><a href="javascript:void(0);" id="share-button-tumblr"><i class="fa fa-tumblr"></i></a></li>
        <li><a href="javascript:void(0);" id="share-button-pinterest"><i class="fa fa-pinterest"></i></a></li>
      </ul>
    </div>

  </div>
</form>