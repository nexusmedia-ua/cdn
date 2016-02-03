<?php include "views/header.tpl"; ?>

<section>
  <div class="grid">
    <div id="layout-list-container" class="grid__item large--one-whole medium--one-whole small--one-whole">
      <div class="next-card no-padding">
        <ul id="layout-list-holder" class="next-list--divided">
          <?php if( $totalLayouts ) : ?>
            <?php foreach ($layouts as $layout) : ?>
              <li id="layout-item-<?php echo $layout['layout_id']?>">
                <div>
                  <a href="<?php echo SCRIPT_URL_LAYOUT_EDITOR . '&layout_id=' . $layout['layout_id']?>" class="layout-item-title">
                    <?php echo $layout['title']?>
                  </a>
                </div>
                <div class="layout-item-actions">
                  <?php if( $layout['enabled'] ) : ?>
                    <span class="layout-item-status tooltip-holder">enabled<div class="tool-tip">Popup is enabled</div></span>
                  <?php else : ?>
                    <span class="layout-item-status tooltip-holder layout-disabled">disabled<div class="tool-tip">Popup is disabled</div></span>
                  <?php endif; ?>

                  <a href="#" onclick="showPopup('<?php echo $layout['layout_id']?>')"
                     class="preview tooltip-holder"><div class="tool-tip">Preview popup</div></a>
                  <a href="<?php echo SCRIPT_URL_LAYOUT_EDITOR . '&layout_id=' . $layout['layout_id']?>"
                     class="edit-widgets tooltip-holder"><div class="tool-tip">Edit Widgets</div></a>
                  <a href="javascript:void(0)" onclick="editLayout('<?php echo $layout['layout_id']?>');"
                     class="edit-layout tooltip-holder"><div class="tool-tip">Edit Settings</div></a>
                  <a href="javascript:void(0)" onclick="duplicateLayout('<?php echo $layout['layout_id']?>');"
                     class="duplicate-layout tooltip-holder"><div class="tool-tip">Duplicate Popup</div></a>
                  <a href="javascript:void(0)" onclick="deleteLayout('<?php echo $layout['layout_id']?>');"
                     class="delete-layout tooltip-holder"><div class="tool-tip right">Delete Popup</div></a>
                </div>
              </li>
            <?php endforeach; ?>
          <?php endif; ?>
        </ul>
        <div id="no-layout" class="notice no-padding-bottom" <?php if( !$totalLayouts ) echo "style='display:block'"?>>
          You don't have any Popups yet. <a href="javascript:void(0);" onclick="editLayout();">Click here to create a new one!</a>
        </div>
      </div>
    </div>

    <div class="grid__item large--one-third medium--one-third small--one-whole">
      <div class="next-pane__body">
        <section id="layout-edit-container" class="next-card">
          <div id="layout-edit-loader" class="loader">
            <div class="next-spinner">
              <svg class="next-icon next-icon--40" preserveAspectRatio="xMinYMin">
                <circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle>
              </svg>
            </div>
          </div>

          <div id="layout-edit-form-holder" class="next-pane__body"></div>
        </section>
      </div>
    </div>
  </div>
</section>

<div id="layout-preview-container" class="lightbox">
  <div class="layout-preview-content">
    <div class="loader">
      <div class="next-spinner">
        <svg class="next-icon next-icon--40" preserveAspectRatio="xMinYMin">
          <circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle>
        </svg>
      </div>
    </div>
  </div>
</div>

<script type="text/javascript">
  ShopifyApp.ready(function(){
    createLayoutButtonToggle(true);
  });
</script>

<?php include "views/footer.tpl"; ?>