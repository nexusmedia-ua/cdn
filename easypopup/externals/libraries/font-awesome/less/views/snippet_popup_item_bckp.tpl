<?php $containerName = getPopupName($layout['layout_id']) . '_' . (empty($layoutType) ? 'main' : $layoutType); ?>

<script type="text/javascript">
  document.addEventListener('easypopup_init', function (e) {
    var content = jQuery191('#<?php echo $containerName?>');
    if( content.length ) {
      <?php if( $layout['event'] == 'welcome' ) : ?>
        var easypopup<?php echo $layout['layout_id']?> = jQuery191.featherlight(content, {});
      <?php elseif( $layout['event'] == 'click' ) : ?>
        <?php if( !empty($layout['click_link']) ) : ?>
          jQuery191('#<?php echo $layout["click_link"]?>').click( function(){
            var easypopup<?php echo $layout['layout_id']?> = jQuery191.featherlight(content, {});
          })
        <?php endif; ?>
      <?php else : ?>
      <?php endif; ?>
    }
  }, false);
</script>

<div id="<?php echo $containerName?>">
  <?php for( $y = 0; $y <= $maxLevel; $y++ ) : ?>
    <?php $level = !empty($levels[$y]) ? $levels[$y] : null;?>

    <section>
      <?php if( !empty($level) ) : ?>

        <?php $totalWidth = 0; ?>
        <?php foreach( $level as $x => $widget ) : ?>
          <?php if( $x >= $maxWidth ) break; ?>

          <?php $width = $widget['width']; ?>
          <?php if( $width > $maxWidth - $x ) $width = $maxWidth - $x; ?>

          <?php if( $totalWidth < $x ) : ?>
            <?php $offsetWidth = $x - $totalWidth; ?>
            <?php $cssOffset = getWidthClassName($offsetWidth); ?>
            <?php $totalWidth += $offsetWidth; ?>

            <div class="grid">
              <div class="grid__item large--<?php echo $cssOffset?> medium--<?php echo $cssOffset?> small--one-whole"></div>
            </div>
          <?php endif; ?>
          <?php $totalWidth += $width; ?>

          <?php $cssWidth = getWidthClassName($width); ?>
          <?php $cp = $widget['cp']; ?>
          <div class="grid">
            <div class="grid__item large--<?php echo $cssWidth?> medium--<?php echo $cssWidth?> small--one-whole">
              <div class="popup-widget-holder"
                   style="
                    <?php if( !empty($cp['padding_v']) )        echo 'padding-top: ' . $cp['padding_v'] . 'px; padding-bottom: ' . $cp['padding_v'] . 'px;'?>
                    <?php if( !empty($cp['padding_h']) )        echo 'padding-left: ' . $cp['padding_h'] . 'px; padding-right: ' . $cp['padding_h'] . 'px;'?>
                    <?php if( !empty($cp['background_color']) ) echo 'background: #' . $cp['background_color'] . ';'?>
                    <?php if( !empty($cp['border_width']) )     echo 'border: ' . $cp['border_width'] . 'px solid transparent;'?>
                    <?php if( !empty($cp['border_color']) )     echo 'border-color: #' . $cp['border_color'] . ';'?>
                    <?php if( !empty($cp['border_radius']) )    echo 'border-radius: ' . $cp['border_radius'] . 'px;'?>
                    <?php if( !empty($cp['text_color']) )       echo 'color: #' . $cp['text_color'] . ';'?>
                    <?php if( !empty($cp['font_size']) )        echo 'font-size: ' . $cp['font_size'] . 'px;'?>
                    <?php if( !empty($cp['font_style']) )       echo 'font-style: ' . $cp['font_style'] . ';'?>
                    <?php if( !empty($cp['text_align']) )       echo 'text-align: ' . $cp['text_align'] . ';'?>
                   ">

                <div class="popup-widget-<?php echo $widget['type']?>">
                  <?php if( $widget['type'] == 'text' and !empty($cp['text']) ) echo nl2br($cp['text'])?>

                  <?php if( $widget['type'] == 'html' and !empty($cp['html']) ) echo nl2br($cp['html'])?>

                  <?php if( $widget['type'] == 'image' and !empty($cp['image_url']) ) : ?>
                    <img src="<?php echo $cp['image_url']?>" <?php if( !empty($cp['stretch']) ) echo "style='width: 100%'"?> />
                  <?php endif; ?>

                  <?php if( $widget['type'] == 'share' ) : ?>
                    <ul class="popup-social-buttons">
                      <?php if( !empty($cp['fb']) ) : ?>
                        <li><a href="//www.facebook.com/sharer.php?u=https://<?php echo $shop?>"><i class="fa fa-facebook"></i></a></li>
                      <?php endif; ?>

                      <?php if( !empty($cp['tw']) ) : ?>
                        <li><a href="//twitter.com/share?url=https://<?php echo $shop?>"><i class="fa fa-twitter"></i></a></li>
                      <?php endif; ?>

                      <?php if( !empty($cp['gplus']) ) : ?>
                        <li><a href="//pinterest.com/pin/create/link/?url=https://<?php echo $shop?>"><i class="fa fa-pinterest"></i></a></li>
                      <?php endif; ?>

                      <?php if( !empty($cp['gplus']) ) : ?>
                        <li><a href="//plus.google.com/share?url=https://<?php echo $shop?>"><i class="fa fa-google-plus"></i></a></li>
                      <?php endif; ?>
                    </ul>
                  <?php endif; ?>

                  <?php if( $widget['type'] == 'button' and !empty($cp['url']) and !empty($cp['text']) ) : ?>
                    <a href="<?php echo $cp['url']?>" <?php if( $cp['btn_full_width'] ) echo 'class="small--one-whole"'?>
                       style="
                        <?php if( !empty($cp['btn_padding_v']) )        echo 'padding-top: ' . $cp['btn_padding_v'] . 'px; padding-bottom: ' . $cp['btn_padding_v'] . 'px;'?>
                        <?php if( !empty($cp['btn_padding_h']) )        echo 'padding-left: ' . $cp['btn_padding_h'] . 'px; padding-right: ' . $cp['btn_padding_h'] . 'px;'?>
                        <?php if( !empty($cp['btn_background_color']) ) echo 'background: #' . $cp['btn_background_color'] . ';'?>
                        <?php if( !empty($cp['btn_border_width']) )     echo 'border: ' . $cp['btn_border_width'] . 'px solid transparent;'?>
                        <?php if( !empty($cp['btn_border_color']) )     echo 'border-color: #' . $cp['btn_border_color'] . ';'?>
                        <?php if( !empty($cp['btn_border_radius']) )    echo 'border-radius: ' . $cp['btn_border_radius'] . 'px;'?>
                        <?php if( !empty($cp['text_color']) )           echo 'color: #' . $cp['text_color'] . ';'?>
                      ">
                      <?php echo $cp['text']?>
                    </a>
                  <?php endif; ?>

                  <?php if( $widget['type'] == 'social' ) : ?>
                    <ul class="popup-social-buttons">
                      <?php if( !empty($cp['fb_url']) ) : ?>
                        <li>
                          <a href="<?php echo $cp['fb_url']?>" <?php if( !empty($cp['btn_icon_color']) ) echo 'style="color: #' . $cp['btn_icon_color'] . ';"';?>>
                            <i class="fa fa-facebook" <?php if( !empty($cp['btn_background_color']) ) echo 'style="background: #' . $cp['btn_background_color'] . ';"';?>></i>
                          </a>
                        </li>
                      <?php endif; ?>

                      <?php if( !empty($cp['tw_url']) ) : ?>
                        <li>
                          <a href="<?php echo $cp['tw_url']?>" <?php if( !empty($cp['btn_icon_color']) ) echo 'style="color: #' . $cp['btn_icon_color'] . ';"';?>>
                            <i class="fa fa-twitter" <?php if( !empty($cp['btn_background_color']) ) echo 'style="background: #' . $cp['btn_background_color'] . ';"';?>></i>
                          </a>
                        </li>
                      <?php endif; ?>

                      <?php if( !empty($cp['instagram_url']) ) : ?>
                        <li>
                          <a href="<?php echo $cp['instagram_url']?>" <?php if( !empty($cp['btn_icon_color']) ) echo 'style="color: #' . $cp['btn_icon_color'] . ';"';?>>
                            <i class="fa fa-instagram" <?php if( !empty($cp['btn_background_color']) ) echo 'style="background: #' . $cp['btn_background_color'] . ';"';?>></i>
                          </a>
                        </li>
                      <?php endif; ?>

                      <?php if( !empty($cp['tumblr_url']) ) : ?>
                        <li>
                          <a href="<?php echo $cp['tumblr_url']?>" <?php if( !empty($cp['btn_icon_color']) ) echo 'style="color: #' . $cp['btn_icon_color'] . ';"';?>>
                            <i class="fa fa-tumblr" <?php if( !empty($cp['btn_background_color']) ) echo 'style="background: #' . $cp['btn_background_color'] . ';"';?>></i>
                          </a>
                        </li>
                      <?php endif; ?>

                      <?php if( !empty($cp['pinterest_url']) ) : ?>
                        <li>
                          <a href="<?php echo $cp['pinterest_url']?>" <?php if( !empty($cp['btn_icon_color']) ) echo 'style="color: #' . $cp['btn_icon_color'] . ';"';?>>
                            <i class="fa fa-pinterest" <?php if( !empty($cp['btn_background_color']) ) echo 'style="background: #' . $cp['btn_background_color'] . ';"';?>></i>
                          </a>
                        </li>
                      <?php endif; ?>
                    </ul>
                  <?php endif; ?>
                </div>

              </div>
            </div>
          </div>
        <?php endforeach; ?>
      <?php else : ?>
        <div class="grid">
          <div class="grid__item large--full medium--full small--one-whole"></div>
        </div>
      <?php endif; ?>
    </section>
  <?php endfor; ?>
</div>