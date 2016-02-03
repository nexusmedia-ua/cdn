<form id="widget-edit-form" class="next-card" onsubmit="return false;">
  <div id="form-type-text">
    <div id="widget-edit-error" class="stat--red"></div>

    <label for="widget_setting_url">Video URL</label>
    <input type="text" name="widget_setting_url" id="widget_setting_url"
           value="<?php if( isset($cp['url']) ) echo $cp['url']?>" />

    <?php include 'common_widget_fields.tpl';?>

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveWidgetContentParams();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditWidget();">Cancel</button>
    </div>
  </div>
</form>