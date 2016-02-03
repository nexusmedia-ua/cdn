<?php if( $widget['widget_type'] != 'text' ) : ?>
  <label for="widget_setting_text_align">Align</label>
  <select name="widget_setting_text_align" id="widget_setting_text_align"
          data-type="widget-style" data-preview-selector="" data-style="text-align">
    <option value="center" <?php if( isset($cp['text_align']) and $cp['text_align'] == 'center' ) echo 'selected'?>>center</option>
    <option value="left"   <?php if( isset($cp['text_align']) and $cp['text_align'] == 'left' ) echo 'selected'?>>left</option>
    <option value="right"  <?php if( isset($cp['text_align']) and $cp['text_align'] == 'right' ) echo 'selected'?>>right</option>
  </select>
<?php endif; ?>

<label for="widget_setting_padding_v">Padding top/bottom</label>
<select name="widget_setting_padding_v" id="widget_setting_padding_v"
        data-type="widget-style" data-preview-selector="" data-style="padding-v">
  <option value="0"  <?php if( empty($cp['padding_v']) ) echo 'selected'?>>none</option>
  <option value="5"  <?php if( isset($cp['padding_v']) and $cp['padding_v'] == 5 ) echo 'selected'?>>5px</option>
  <option value="10" <?php if( isset($cp['padding_v']) and $cp['padding_v'] == 10 ) echo 'selected'?>>10px</option>
  <option value="15" <?php if( isset($cp['padding_v']) and $cp['padding_v'] == 15 ) echo 'selected'?>>15px</option>
  <option value="20" <?php if( isset($cp['padding_v']) and $cp['padding_v'] == 20 ) echo 'selected'?>>20px</option>
  <option value="25" <?php if( isset($cp['padding_v']) and $cp['padding_v'] == 25 ) echo 'selected'?>>25px</option>
  <option value="30" <?php if( isset($cp['padding_v']) and $cp['padding_v'] == 30 ) echo 'selected'?>>30px</option>
</select>

<label for="widget_setting_padding_h">Padding left/right</label>
<select name="widget_setting_padding_h" id="widget_setting_padding_h"
        data-type="widget-style" data-preview-selector="" data-style="padding-h">
  <option value="0"  <?php if( empty($cp['padding_h']) ) echo 'selected'?>>none</option>
  <option value="5"  <?php if( isset($cp['padding_h']) and $cp['padding_h'] == 5 ) echo 'selected'?>>5px</option>
  <option value="10" <?php if( isset($cp['padding_h']) and $cp['padding_h'] == 10 ) echo 'selected'?>>10px</option>
  <option value="15" <?php if( isset($cp['padding_h']) and $cp['padding_h'] == 15 ) echo 'selected'?>>15px</option>
  <option value="20" <?php if( isset($cp['padding_h']) and $cp['padding_h'] == 20 ) echo 'selected'?>>20px</option>
  <option value="25" <?php if( isset($cp['padding_h']) and $cp['padding_h'] == 25 ) echo 'selected'?>>25px</option>
  <option value="30" <?php if( isset($cp['padding_h']) and $cp['padding_h'] == 30 ) echo 'selected'?>>30px</option>
</select>

<label for="widget_setting_background_color">Background color (empty field - transparent)</label>
<input type="text" name="widget_setting_background_color" id="widget_setting_background_color"
       data-type="widget-style" data-preview-selector="" data-style="background" data-spec="colorpicker"
       value="<?php if( isset($cp['background_color']) ) echo $cp['background_color']?>" />

<label for="widget_setting_border_width">Border width</label>
<select name="widget_setting_border_width" id="widget_setting_border_width"
        data-type="widget-style" data-preview-selector="" data-style="border-width">
  <option value="0" <?php if( empty($cp['border_width']) ) echo 'selected'?>>none</option>
  <option value="1" <?php if( isset($cp['border_width']) and $cp['border_width'] == 1 ) echo 'selected'?>>1px</option>
  <option value="2" <?php if( isset($cp['border_width']) and $cp['border_width'] == 2 ) echo 'selected'?>>2px</option>
  <option value="3" <?php if( isset($cp['border_width']) and $cp['border_width'] == 3 ) echo 'selected'?>>3px</option>
  <option value="4" <?php if( isset($cp['border_width']) and $cp['border_width'] == 4 ) echo 'selected'?>>4px</option>
  <option value="5" <?php if( isset($cp['border_width']) and $cp['border_width'] == 5 ) echo 'selected'?>>5px</option>
</select>

<label for="widget_setting_border_color">Border color</label>
<input type="text" name="widget_setting_border_color" id="widget_setting_border_color"
       data-type="widget-style" data-preview-selector="" data-style="border-color" data-spec="colorpicker"
       value="<?php if( isset($cp['border_color']) ) echo $cp['border_color']?>" />

<label for="widget_setting_border_radius">Border radius</label>
<select name="widget_setting_border_radius" id="widget_setting_border_radius"
        data-type="widget-style" data-preview-selector="" data-style="border-radius">
  <?php for( $i = 0; $i <= 20; $i++ ) : ?>
    <option value="<?php echo $i?>" <?php if( isset($cp['border_radius']) and $cp['border_radius'] == $i ) echo 'selected'?>>
      <?php echo $i ? $i . 'px' : 'none'?>
    </option>
  <?php endfor; ?>
</select>

<input type="hidden" name="content_id" value="<?php if( isset($id) ) echo $id?>" />

<div class="preview-object">
  <?php echo $previewWidgetObject?>
</div>