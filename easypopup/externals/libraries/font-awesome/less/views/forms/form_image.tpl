<form id="widget-edit-form" class="next-card" onsubmit="return false;">
  <div id="form-type-text">
    <div id="widget-edit-error" class="stat--red"></div>

    <label for="widget_setting_image">Image</label>
    <input type="file" name="image" id="widget_setting_image" />

    <input type="checkbox" name="widget_setting_stretch" id="widget_setting_stretch"
           data-type="widget-style" data-preview-selector="#preview-image" data-style="width-full"
           <?php if( isset($cp['stretch']) and $cp['stretch'] ) echo 'checked'?> />
    <label for="widget_setting_stretch">Stretch to full width</label>

    <?php include 'common_widget_fields.tpl';?>

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveWidgetContentParams();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditWidget();">Cancel</button>
    </div>

  </div>
</form>