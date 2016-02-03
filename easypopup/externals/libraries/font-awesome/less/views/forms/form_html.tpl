<form id="widget-edit-form" class="next-card" onsubmit="return false;">
  <div id="form-type-text">
    <div id="widget-edit-error" class="stat--red"></div>

    <label for="widget_setting_html">HTML</label>
    <textarea name="widget_setting_html" id="widget_setting_html" data-type="widget-value"
              data-preview-selector=".popup-widget-html"><?php if( isset($cp['html']) ) echo $cp['html']?></textarea>

    <?php include 'common_widget_fields.tpl';?>

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveWidgetContentParams();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditWidget();">Cancel</button>
    </div>
  </div>
</form>