<form id="widget-edit-form" class="next-card" onsubmit="return false;">
  <div id="form-type-text">
    <div id="widget-edit-error" class="stat--red"></div>

    <label for="widget_setting_url">MailChimp URL</label>
    <input type="text" name="widget_setting_url" id="widget_setting_url"
           value="<?php if( isset($cp['url']) ) echo $cp['url']?>" />

    <label for="widget_setting_label">Label</label>
    <input type="text" name="widget_setting_label" id="widget_setting_label"
       data-type="widget-value" data-preview-selector="label"
       value="<?php if( isset($cp['label']) ) echo $cp['label']?>" />

    <label for="widget_setting_placeholder">Placeholder</label>
    <input type="text" name="widget_setting_placeholder" id="widget_setting_placeholder"
       data-type="widget-attr" data-attr="placeholder" data-preview-selector="input"
       value="<?php if( isset($cp['placeholder']) ) echo $cp['placeholder']?>" />

    <?php include 'common_button_params.tpl';?>

    <?php include 'common_widget_fields.tpl';?>

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveWidgetContentParams();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditWidget();">Cancel</button>
    </div>
  </div>
</form>