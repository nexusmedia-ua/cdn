<form id="widget-edit-form" class="next-card" onsubmit="return false;">
  <div id="form-type-text">
    <div id="widget-edit-error" class="stat--red"></div>

    <label for="widget_setting_url">URL</label>
    <input type="text" name="widget_setting_url" id="widget_setting_url" placeholder="http://somedomain.com"
           value="<?php if( isset($cp['url']) ) echo $cp['url']?>" />

    <?php include 'common_button_params.tpl';?>
    <?php include 'common_widget_fields.tpl';?>

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveWidgetContentParams();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditWidget();">Cancel</button>
    </div>

    <div class="preview-object">
      <a href="javascript:void(0);" id="preview-button"></a>
    </div>
  </div>
</form>