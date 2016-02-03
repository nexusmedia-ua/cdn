<form id="layout-edit-form" onsubmit="return false;">
  <div id="form-type-text">
    <div id="layout-edit-error" class="stat--red"></div>

    <label for="layout_setting_title">Title</label>
    <input type="text" name="layout_setting_title" id="layout_setting_title"
           value="<?php if( isset($layout['title']) ) echo htmlspecialchars($layout['title'])?>" />

    <input type="checkbox" name="layout_setting_enabled" id="layout_setting_enabled" value="1"
           <?php if( !isset($layout['enabled']) or $layout['enabled'] ) echo 'checked'?> />
    <label for="layout_setting_enabled">Enabled</label>

    <label for="layout_setting_event">Trigger Event</label>
    <select name="layout_setting_event" id="layout_setting_event">
      <option value="welcome" <?php if( isset($layout['event']) and $layout['event'] == 'welcome' ) echo 'selected'?>>
        Welcome Popup
      </option>
      <option value="exit" <?php if( isset($layout['event']) and $layout['event'] == 'exit' ) echo 'selected'?>>
        Exit Popup
      </option>
      <option value="click" <?php if( isset($layout['event']) and $layout['event'] == 'click' ) echo 'selected'?>>
        On Click
      </option>
    </select>

    <div id="layout_setting_various_welcome" class="layout-setting-various">
      <label for="layout_setting_welcome_pages">Pages to show</label>
      <select name="layout_setting_welcome_pages" id="layout_setting_welcome_pages" onchange="layoutEditFieldsToggle(this, 'welcome');">
        <option value="all"        <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'all' ) echo 'selected'?>>All</option>
        <option value="home"       <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'index' ) echo 'selected'?>>Home</option>
        <option value="product"    <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'product' ) echo 'selected'?>>Product</option>
        <option value="collection" <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'collection' ) echo 'selected'?>>Collection</option>
        <option value="blog"       <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'blog' ) echo 'selected'?>>Blog</option>
        <option value="article"    <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'article' ) echo 'selected'?>>Article</option>
        <option value="cart"       <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'cart' ) echo 'selected'?>>Cart</option>
        <option value="account"    <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'account' ) echo 'selected'?>>Account pages</option>
      </select>

      <div id="layout-setting-welcome-products-holder" class="layout-setting-welcome-holders"
           <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'product' ) echo 'style="display:block"'?>>
        <label for="layout_setting_welcome_products">Show for certain Products only <br/>(product handles separated by comma)</label>
        <input type="text" name="layout_setting_welcome_products" id="layout_setting_welcome_products"
               value="<?php if( isset($p['welcome_products']) ) echo implode(', ', $p['welcome_products'])?>" />
      </div>

      <div id="layout-setting-welcome-collections-holder" class="layout-setting-welcome-holders"
           <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'collection' ) echo 'style="display:block"'?>>
        <label for="layout_setting_welcome_collections">Show for certain Collections only</label>
        <select name="layout_setting_welcome_collections[]" id="layout_setting_welcome_collections" multiple>
          <?php foreach( $collections as $collection ) : ?>
            <option value="<?php echo $collection['handle']?>"
                    <?php if( isset($p['welcome_blogs']) and in_array( $collection['handle'], $p['welcome_collections']) ) echo 'selected'?>>
              <?php echo $collection['title']?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>

      <div id="layout-setting-welcome-blogs-holder" class="layout-setting-welcome-holders"
           <?php if( isset($p['welcome_pages']) and $p['welcome_pages'] == 'blog' ) echo 'style="display:block"'?>>
        <label for="layout_setting_welcome_blogs">Show for certain Blogs only</label>
        <select name="layout_setting_welcome_blogs[]" id="layout_setting_welcome_blogs" multiple>
          <?php foreach( $blogs as $blog ) : ?>
            <option value="<?php echo $blog['handle']?>"
                    <?php if( isset($p['welcome_blogs']) and in_array( $blog['handle'], $p['welcome_blogs']) ) echo 'selected'?>>
              <?php echo $blog['title']?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>

      <label for="layout_setting_welcome_period">Display period</label>
      <select name="layout_setting_welcome_period" id="layout_setting_welcome_period">
        <option value="315360000" <?php if( isset($p['welcome_period']) and $p['welcome_period'] == 315360000 ) echo 'selected'?>>only once</option>
        <option value="86400"   <?php if( isset($p['welcome_period']) and $p['welcome_period'] == 86400 )   echo 'selected'?>>once per day</option>
        <option value="259200"  <?php if( isset($p['welcome_period']) and $p['welcome_period'] == 259200 )  echo 'selected'?>>once per 3 days</option>
        <option value="604800"  <?php if( isset($p['welcome_period']) and $p['welcome_period'] == 604800 )  echo 'selected'?>>once per week</option>
        <option value="1209600" <?php if( isset($p['welcome_period']) and $p['welcome_period'] == 1209600 ) echo 'selected'?>>once per 2 weeks</option>
        <option value="2592000" <?php if( isset($p['welcome_period']) and $p['welcome_period'] == 2592000 ) echo 'selected'?>>once per month</option>
      </select>
    </div>

    <div id="layout_setting_various_exit" class="layout-setting-various">
      <label for="layout_setting_exit_pages">Pages to show</label>
      <select name="layout_setting_exit_pages" id="layout_setting_exit_pages" onchange="layoutEditFieldsToggle(this, 'exit');">
        <option value="all"        <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'all' ) echo 'selected'?>>All</option>
        <option value="home"       <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'index' ) echo 'selected'?>>Home</option>
        <option value="product"    <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'product' ) echo 'selected'?>>Product</option>
        <option value="collection" <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'collection' ) echo 'selected'?>>Collection</option>
        <option value="blog"       <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'blog' ) echo 'selected'?>>Blog</option>
        <option value="article"    <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'article' ) echo 'selected'?>>Article</option>
        <option value="cart"       <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'cart' ) echo 'selected'?>>Cart</option>
        <option value="account"    <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'account' ) echo 'selected'?>>Account pages</option>
      </select>

      <div id="layout-setting-exit-products-holder" class="layout-setting-exit-holders"
           <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'product' ) echo 'style="display:block"'?>>
        <label for="layout_setting_exit_products">Show for certain Products only <br/>(product handles separated by comma)</label>
        <input type="text" name="layout_setting_exit_products" id="layout_setting_exit_products"
               value="<?php if( isset($p['exit_products']) ) echo implode(', ', $p['exit_products'])?>" />
      </div>

      <div id="layout-setting-exit-collections-holder" class="layout-setting-exit-holders"
           <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'collection' ) echo 'style="display:block"'?>>
        <label for="layout_setting_exit_collections">Show for certain Collections only</label>
        <select name="layout_setting_exit_collections[]" id="layout_setting_exit_collections" multiple>
          <?php foreach( $collections as $collection ) : ?>
            <option value="<?php echo $collection['handle']?>"
                    <?php if( isset($p['exit_blogs']) and in_array( $collection['handle'], $p['exit_collections']) ) echo 'selected'?>>
              <?php echo $collection['title']?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>

      <div id="layout-setting-exit-blogs-holder" class="layout-setting-exit-holders"
           <?php if( isset($p['exit_pages']) and $p['exit_pages'] == 'blog' ) echo 'style="display:block"'?>>
        <label for="layout_setting_exit_blogs">Show for certain Blogs only</label>
        <select name="layout_setting_exit_blogs[]" id="layout_setting_exit_blogs" multiple>
          <?php foreach( $blogs as $blog ) : ?>
            <option value="<?php echo $blog['handle']?>"
                    <?php if( isset($p['exit_blogs']) and in_array( $blog['handle'], $p['exit_blogs']) ) echo 'selected'?>>
              <?php echo $blog['title']?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>

      <label for="layout_setting_exit_period">Display period</label>
      <select name="layout_setting_exit_period" id="layout_setting_exit_period">
        <option value="315360000" <?php if( isset($p['exit_period']) and $p['exit_period'] == 315360000 ) echo 'selected'?>>only once</option>
        <option value="86400"   <?php if( isset($p['exit_period']) and $p['exit_period'] == 86400 )   echo 'selected'?>>once per day</option>
        <option value="259200"  <?php if( isset($p['exit_period']) and $p['exit_period'] == 259200 )  echo 'selected'?>>once per 3 days</option>
        <option value="604800"  <?php if( isset($p['exit_period']) and $p['exit_period'] == 604800 )  echo 'selected'?>>once per week</option>
        <option value="1209600" <?php if( isset($p['exit_period']) and $p['exit_period'] == 1209600 ) echo 'selected'?>>once per 2 weeks</option>
        <option value="2592000" <?php if( isset($p['exit_period']) and $p['exit_period'] == 2592000 ) echo 'selected'?>>once per month</option>
      </select>
    </div>

    <div id="layout_setting_various_click" class="layout-setting-various">
      <label for="layout_setting_click_link">Attached link ID</label>
      <input type="text" name="layout_setting_click_link" id="layout_setting_click_link"
             value="<?php if( isset($p['click_link']) ) echo $p['click_link']?>" />
    </div>


    <label for="layout_setting_main_width">Width for desktop (px)</label>
    <input type="text" name="layout_setting_main_width" id="layout_setting_main_width"
           value="<?php if( isset($p['main_width']) ) echo $p['main_width']?>" />

   <label for="layout_setting_tablet_width">Width for tablet (px)</label>
    <input type="text" name="layout_setting_tablet_width" id="layout_setting_tablet_width"
           value="<?php if( isset($p['tablet_width']) ) echo $p['tablet_width']?>" />

    <label for="layout_setting_close_button_color">Close button color</label>
    <input type="text" name="layout_setting_close_button_color" id="layout_setting_close_button_color" data-spec="colorpicker"
           value="<?php if( isset($p['close_button_color']) ) echo $p['close_button_color']?>" />

    <label for="layout_setting_background_color">Background color</label>
    <input type="text" name="layout_setting_background_color" id="layout_setting_background_color"  data-spec="colorpicker"
           value="<?php if( isset($p['background_color']) ) echo $p['background_color']?>" />

    <label for="layout_setting_background_image">Background image</label>
    <input type="file" name="image" id="layout_setting_background_image" />

    <?php if( !empty($p['background_image_url']) ) : ?>
      <div><img src="<?php echo $p['background_image_url']?>" style="max-width: 100%; max-height: 100px;" /></div><br/>
    <?php endif; ?>

    <label for="layout_setting_background_style">Background style</label>
    <select name="layout_setting_background_style" id="layout_setting_background_style">
      <option value="center" <?php if( isset($p['background_style']) and $p['background_style'] == 'center' ) echo 'selected'?>>Center</option>
      <option value="left" <?php if( isset($p['background_style']) and $p['background_style'] == 'left' ) echo 'selected'?>>Left</option>
      <option value="right" <?php if( isset($p['background_style']) and $p['background_style'] == 'right' ) echo 'selected'?>>Right</option>
      <option value="stretch" <?php if( isset($p['background_style']) and $p['background_style'] == 'stretch' ) echo 'selected'?>>Stretch</option>
      <option value="tile" <?php if( isset($p['background_style']) and $p['background_style'] == 'tile' ) echo 'selected'?>>Tile</option>
    </select>

    <input type="checkbox" name="layout_setting_background_image_remove" id="layout_setting_background_image_remove" />
    <label for="layout_setting_background_image_remove">Remove image</label>
    <br/>

    <input type="hidden" name="layout_id" value="<?php echo $id?>" />

    <div class="next-pane__body">
      <button type="button" class="btn btn-large btn-primary" onclick="saveLayoutSettings();">Save</button>
      <button type="button" class="btn btn-large" onclick="cancelEditLayout();">Cancel</button>
    </div>
  </div>
</form>