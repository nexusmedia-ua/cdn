<?php $gridstack = true;?>

<?php include "views/header.tpl"; ?>

<div class="grid <?php echo $layout['view_type']?>-view">
  <div class="grid__item large--two-thirds medium--two-thirds small--one-whole">
    <section id="layout-editor-grid-holder">
      <ul id="layout-editor-tabs" class="tab_list" role="tablist">
        <li>
          <a href="javascript:void(0)" role="tab" tabindex="0" <?php if( $layout['view_type'] == 'desktop' ) echo 'class="active"'; ?>
             onclick="window.location.href = '<?php echo SCRIPT_URL_LAYOUT_EDITOR . '&layout_id=' . $layoutsFamily['desktop']['layout_id']?>'">
            Desktop View
          </a>
        </li>

        <li>
          <a href="javascript:void(0)" role="tab" tabindex="1" <?php if( $layout['view_type'] == 'tablet' ) echo 'class="active"'; ?>
             onclick="window.location.href = '<?php echo SCRIPT_URL_LAYOUT_EDITOR . '&layout_id=' . $layoutsFamily['tablet']['layout_id']?>'">
            Tablet View
          </a>
        </li>

        <li>
          <a href="javascript:void(0)" role="tab" tabindex="2" <?php if( $layout['view_type'] == 'mobile' ) echo 'class="active"'; ?>
             onclick="window.location.href = '<?php echo SCRIPT_URL_LAYOUT_EDITOR . '&layout_id=' . $layoutsFamily['mobile']['layout_id']?>'">
            Mobile View
          </a>
        </li>

        <li id="layout-editor-loader" class="loader">
          <div class="next-spinner">
            <svg class="next-icon next-icon--20" preserveAspectRatio="xMinYMin">
              <circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle>
            </svg>
          </div>
        </li>
      </ul>

      <div id="component-holder" class="next-card next-pane__body">
        <div id="empty-layout-notice" class="notice" <?php if( count($containers) ) echo 'style="display: none;"'?>>
          <!-- Please add widgets column with "New Column" button -->
          You don't have any Columns yet.
          <a href="javascript:void(0)" id="empty-layout-notice-link">Click here to create a new one!</a>
        </div>

        <?php if( $layout['view_type'] == 'tablet' or $layout['view_type'] == 'mobile' ) : ?>
          <?php if( $layout['sync'] ) : ?>
            <div id="sync-layout-notice" class="notice">
              <strong>IMPORTANT:</strong> If you'll edit widgets in this view, all your widgets will no longer replicate settings from Desktop view and you'll need configure ALL the widgets in this View separately
            </div>
            <div id="unsync-layout-notice" class="notice" style="display: none;">
              <strong>PLEASE NOTE:</strong> Current View is already customized and do not replicate your further changes in Desktop View. You should edit this View separately now.
            </div>
          <?php else : ?>
            <div id="unsync-layout-notice" class="notice">
              <strong>PLEASE NOTE:</strong> Current View is already customized and do not replicate your further changes in Desktop View. You should edit this View separately now.
            </div>
          <?php endif; ?>
        <?php endif; ?>

        <div id="layout-editor-big-cancel">
          <a href="javascript:void(0);" onclick="cancelEditWidget();">
            Click here if you want to discard changes and get back to the pop up grid view
          </a>
        </div>

        <div id="layout-row" class="layout-row" data-bind="component: {name: 'layout-row', params: $data}"></div>
      </div>

    </section>

    <section>
      <div id="widget-preview-container">
        <div id="popup-widget-preview-content" class="next-card"></div>
      </div>
    </section>
  </div>

  <div class="grid__item large--one-third medium--one-third small--one-whole">
    <section>
      <div id="editor-sidebar-header" class="next-card next-pane__body">
        <header class="next-pane__header">
          <section>Select some Widget to customize it...</section>
        </header>
      </div>

      <div id="editor-sidebar-form-container" class="next-card next-pane__body">
        <div id="editor-sidebar-form-loader" class="loader">
          <div class="next-spinner">
            <svg class="next-icon next-icon--40" preserveAspectRatio="xMinYMin">
              <circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle>
            </svg>
          </div>
        </div>

        <div id="editor-sidebar-form-holder" class="next-pane__body"></div>
      </div>
    </section>
  </div>
</div>

<div id="layout-preview-container" class="lightbox <?php echo $layout['view_type']?>-view">
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
  var layoutId = '<?php echo $layoutId?>';
  var minGridWidth = '<?php echo $minWidth?>';
  var layoutContainersParams = <?php echo $containersParams?>;
  var layoutWidgetsParams = <?php echo $widgetsParams?>;

  $(function () {
    var controller = new Controller(layoutContainersParams);

    koRegister('layout-row');
    ko.applyBindings(controller, document.getElementById('component-holder'));
    updateQuickPreviewContent();

    $('#layout-row').on('change', function (event, ui) {
      var column = $(event.target).parents('.layout-column');
      if( !column.length ) {
        saveAllColumnsParams();
      } else {
        saveAllWidgetsParams(column.attr('data-content-id'));
      }
    });

    $('#empty-layout-notice-link').click(addColumn);

    ShopifyApp.ready(function(){
      ShopifyApp.Bar.initialize({
        title: "<?php echo addslashes($layout['title'])?>",

        buttons: {
          primary: [
            {
              label: "Back to Popups List",
              loading: false,
              callback: function(message, data){ window.location.href = '<?php echo SCRIPT_URL?>'; }
            },
          ],
          secondary: [
            { label: "Preview",
              message: '<?php echo $layoutId?>',
              loading: false,
              callback: function(message, data){ showPopup( message, true ); }
            },
            { label: "New Column",
              message: 'column',
              loading: false,
              callback: function(message, data){ addColumn(); }
            }
          ]
        }
      });
    });

    function addColumn()
    {
      if( ajaxIsActive ) return;

      $('#empty-layout-notice').hide();
      controller.add_new_content(controller, 'column');
    }
  });

</script>

<?php include "views/footer.tpl"; ?>