<form id="widget-edit-form" class="next-card" onsubmit="return false;">
  <div id="form-type-text">
    <div id="widget-edit-error" class="stat--red"></div>

    <input type="checkbox" name="widget_setting_fb" id="widget_setting_fb"
           data-type="widget-style" data-style="show" data-preview-selector=".popup-social-buttons li:eq(0)"
           <?php if( isset($cp['fb']) and $cp['fb'] ) echo 'checked'?> />
    <label for="widget_setting_fb">Show facebook share button</label>

    <input type="checkbox" name="widget_setting_tw" id="widget_setting_tw"
            data-type="widget-style" data-style="show" data-preview-selector=".popup-social-buttons li:eq(1)"
           <?php if( isset($cp['tw']) and $cp['tw'] ) echo 'checked'?> />
    <label for="widget_setting_tw">Show twitter share button</label>

    <input type="checkbox" name="widget_setting_pinterest" id="widget_setting_pinterest"
           data-type="widget-style" data-style="show" data-preview-selector=".popup-social-buttons li:eq(2),#media-url-holder"
           <?php if( isset($cp['pinterest']) and $cp['pinterest'] ) echo 'checked'?> />
    <label for="widget_setting_tw">Show pinterest share button</label>

    <input type="checkbox" name="widget_setting_gplus" id="widget_setting_gplus"
           data-type="widget-style" data-style="show" data-preview-selector=".popup-social-buttons li:eq(3)"
           <?php if( isset($cp['gplus']) and $cp['gplus'] ) echo 'checked'?> />
    <label for="widget_setting_gplus">Show google plus share button</label>

    <label for="widget_setting_url">Sharing URL</label>
    <input type="text" name="widget_setting_url" id="widget_setting_url" placeholder="https://<?php echo $shop?>"
           value="<?php if( isset($cp['url']) ) echo $cp['url']?>" />

    <div id="media-url-holder">
      <label for="widget_setting_media_url">Pin Image URL</label>
      <input type="text" name="widget_setting_media_url" id="widget_setting_media_url" placeholder="https://"
             value="<?php if( isset($cp['media_url']) ) echo $cp['media_url']?>" />
    </div>

   <label for="widget_setting_btn_size">Button size</label>
    <input type="number" name="widget_setting_btn_size" id="widget_setting_btn_size" min="12" max="60"
           data-type="widget-style" data-style="btn-size" data-preview-selector=".popup-social-buttons li i"
           value="<?php if( isset($cp['btn_size']) ) echo $cp['btn_size']?>" />

    <?php include 'common_widget_fields.tpl';?>

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveWidgetContentParams();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditWidget();">Cancel</button>
    </div>

    <div class="preview-object">
      <ul class="popup-social-buttons popup-widget-share">
        <li id="share-button-fb"><a href="javascript:void(0);"><i class="fa fa-facebook"></i></a></li>
        <li id="share-button-tw"><a href="javascript:void(0);"><i class="fa fa-twitter"></i></a></li>
        <li id="share-button-pinterest"><a href="javascript:void(0);"><i class="fa fa-pinterest"></i></a></li>
        <li id="share-button-gplus"><a href="javascript:void(0);"><i class="fa fa-google-plus"></i></a></li>
      </ul>
    </div>
  </div>
</form>