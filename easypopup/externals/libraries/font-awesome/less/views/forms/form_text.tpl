<form id="widget-edit-form" class="next-card" onsubmit="return false;">
  <div id="form-type-text">
    <div id="widget-edit-error" class="stat--red"></div>

    <label for="widget_setting_text">Text</label>
    <textarea name="widget_setting_text" id="widget_setting_text" data-spec="wysiwyg"
              data-type="widget-value" data-preview-selector=".popup-widget-text"><?php if( isset($cp['text']) ) echo $cp['text']?></textarea>

    <br/>
    <?php include 'common_widget_fields.tpl';?>

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveWidgetContentParams();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditWidget();">Cancel</button>
    </div>
  </div>
</form>