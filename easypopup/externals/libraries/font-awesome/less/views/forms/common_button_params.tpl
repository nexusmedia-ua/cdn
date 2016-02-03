<label for="widget_setting_btn_text">Button text</label>
<input type="text" name="widget_setting_btn_text" id="widget_setting_btn_text"
       data-type="widget-value" data-preview-selector="a"
       value="<?php if( isset($cp['btn_text']) ) echo $cp['btn_text']?>" />

<label for="widget_setting_btn_text_color">Button text color</label>
<input type="text" name="widget_setting_btn_text_color" id="widget_setting_btn_text_color"
       data-type="widget-style" data-preview-selector="a" data-style="color" data-spec="colorpicker"
       value="<?php if( isset($cp['btn_text_color']) ) echo $cp['btn_text_color']?>" />

<label for="widget_setting_btn_background">Button background color</label>
<input type="text" name="widget_setting_btn_background_color" id="widget_setting_btn_background_color"
       data-type="widget-style" data-preview-selector="a" data-style="background" data-spec="colorpicker"
       value="<?php if( isset($cp['btn_background_color']) ) echo $cp['btn_background_color']?>" />

<label for="widget_setting_btn_padding_v">Button padding top/bottom</label>
<select name="widget_setting_btn_padding_v" id="widget_setting_btn_padding_v"
        data-type="widget-style" data-preview-selector="a" data-style="padding-v">
  <option value="0"  <?php if( empty($cp['btn_padding_v']) ) echo 'selected'?>>none</option>
  <option value="5"  <?php if( isset($cp['btn_padding_v']) and $cp['btn_padding_v'] == 5 ) echo 'selected'?>>5px</option>
  <option value="10" <?php if( isset($cp['btn_padding_v']) and $cp['btn_padding_v'] == 10 ) echo 'selected'?>>10px</option>
  <option value="15" <?php if( isset($cp['btn_padding_v']) and $cp['btn_padding_v'] == 15 ) echo 'selected'?>>15px</option>
  <option value="20" <?php if( isset($cp['btn_padding_v']) and $cp['btn_padding_v'] == 20 ) echo 'selected'?>>20px</option>
  <option value="25" <?php if( isset($cp['btn_padding_v']) and $cp['btn_padding_v'] == 25 ) echo 'selected'?>>25px</option>
  <option value="30" <?php if( isset($cp['btn_padding_v']) and $cp['btn_padding_v'] == 30 ) echo 'selected'?>>30px</option>
</select>

<label for="widget_setting_btn_padding_h">Button padding left/right</label>
<select name="widget_setting_btn_padding_h" id="widget_setting_btn_padding_h"
        data-type="widget-style" data-preview-selector="a" data-style="padding-h">
  <option value="0"  <?php if( empty($cp['btn_padding_h']) ) echo 'selected'?>>none</option>
  <option value="5"  <?php if( isset($cp['btn_padding_h']) and $cp['btn_padding_h'] == 5 ) echo 'selected'?>>5px</option>
  <option value="10" <?php if( isset($cp['btn_padding_h']) and $cp['btn_padding_h'] == 10 ) echo 'selected'?>>10px</option>
  <option value="15" <?php if( isset($cp['btn_padding_h']) and $cp['btn_padding_h'] == 15 ) echo 'selected'?>>15px</option>
  <option value="20" <?php if( isset($cp['btn_padding_h']) and $cp['btn_padding_h'] == 20 ) echo 'selected'?>>20px</option>
  <option value="25" <?php if( isset($cp['btn_padding_h']) and $cp['btn_padding_h'] == 25 ) echo 'selected'?>>25px</option>
  <option value="30" <?php if( isset($cp['btn_padding_h']) and $cp['btn_padding_h'] == 30 ) echo 'selected'?>>30px</option>
</select>

<label for="widget_setting_btn_border_width">Button border width</label>
<select name="widget_setting_btn_border_width" id="widget_setting_btn_border_width"
        data-type="widget-style" data-preview-selector="a" data-style="border-width">
  <option value="0" <?php if( empty($cp['btn_border_width']) ) echo 'selected'?>>none</option>
  <option value="1" <?php if( isset($cp['btn_border_width']) and $cp['btn_border_width'] == 1 ) echo 'selected'?>>1px</option>
  <option value="2" <?php if( isset($cp['btn_border_width']) and $cp['btn_border_width'] == 2 ) echo 'selected'?>>2px</option>
  <option value="3" <?php if( isset($cp['btn_border_width']) and $cp['btn_border_width'] == 3 ) echo 'selected'?>>3px</option>
  <option value="4" <?php if( isset($cp['btn_border_width']) and $cp['btn_border_width'] == 4 ) echo 'selected'?>>4px</option>
  <option value="5" <?php if( isset($cp['btn_border_width']) and $cp['btn_border_width'] == 5 ) echo 'selected'?>>5px</option>
</select>

<label for="widget_setting_btn_border_color">Button border color</label>
<input type="text" name="widget_setting_btn_border_color" id="widget_setting_btn_border_color"
       data-type="widget-style" data-preview-selector="a" data-style="border-color" data-spec="colorpicker"
       value="<?php if( isset($cp['btn_border_color']) ) echo $cp['btn_border_color']?>" />

<label for="widget_setting_btn_border_radius">Button border radius</label>
<select name="widget_setting_btn_border_radius" id="widget_setting_btn_border_radius"
        data-type="widget-style" data-preview-selector="a" data-style="border-radius">
  <?php for( $i = 0; $i <= 20; $i++ ) : ?>
    <option value="<?php echo $i?>" <?php if( isset($cp['btn_border_radius']) and $cp['btn_border_radius'] == $i ) echo 'selected'?>>
      <?php echo $i ? $i . 'px' : 'none'?>
    </option>
  <?php endfor; ?>
</select>

<input type="checkbox" name="widget_setting_btn_full_width" id="widget_setting_btn_full_width"
       data-type="widget-style" data-preview-selector="a" data-style="display-block"
    <?php if( isset($cp['btn_full_width']) and $cp['btn_full_width'] ) echo 'checked'?> />
<label for="widget_setting_fb">Button full width</label>

<label for="widget_setting_btn_font_size">Font size (px)</label>
<input type="number" name="widget_setting_btn_font_size" id="widget_setting_btn_font_size" min="8" max="24"
       data-type="widget-style" data-preview-selector="a" data-style="font-size"
       value="<?php if( isset($cp['btn_font_size']) ) echo $cp['btn_font_size']?>" />

<label for="widget_setting_btn_font_style">Font style</label>
<select name="widget_setting_btn_font_style" id="widget_setting_btn_font_style"
        data-type="widget-style" data-preview-selector="a" data-style="font-style">
  <option value="normal" <?php if( isset($cp['btn_font_style']) and $cp['btn_font_style'] == 'normal' ) echo 'selected'?>>normal</option>
  <option value="italic" <?php if( isset($cp['btn_font_style']) and $cp['btn_font_style'] == 'italic' ) echo 'selected'?>>italic</option>
  <option value="bold"   <?php if( isset($cp['btn_font_style']) and $cp['btn_font_style'] == 'bold' ) echo 'selected'?>>bold</option>
  <option value="bold_italic" <?php if( isset($cp['btn_font_style']) and $cp['btn_font_style'] == 'bold_italic' ) echo 'selected'?>>bold italic</option>
</select>