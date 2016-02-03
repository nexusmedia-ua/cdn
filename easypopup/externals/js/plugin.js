var $editingElement = null;
var $draggableParent = null;
var popupEnabledPhrase = 'enabled<div class="tool-tip">Popup is now Enabled, click to Disable it</div>';
var popupDisabledPhrase = 'disabled<div class="tool-tip">Popup is now Disabled, click to Enable it</div>';
var popupUpdated = false;

$(document).ready(function(){
  $('div, a, button, span').on('click', function(e) {
    if( ajaxIsActive ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
});

// --------------------------------------------- Layout Editor ---------------------------------------------
function Controller(widgets)
{
  var self = this;
  this.widgets = ko.observableArray(widgets);

  this.add_new_content = function(controller, type) {
    if( ajaxIsActive ) return;

    var minW = minGridWidth || 1;
    this.widgets.push({
      content_id: 0,
      x: 0,
      y: 0,
      width: 12,
      height: 1,
      max_height: 1,
      min_height: 1,
      min_width: minW,
      content_type: type,
      auto_position: true,
    });
  };


  this.edit_content = function(item, event) {
    if( ajaxIsActive ) return;

    var $editingElement = $(event.target).parent().closest('.grid-stack-item');
    var contentType = $editingElement.attr('data-content-type');

    if( contentType == 'column' ) {
      showWidgetsMenu($editingElement);
    } else {
      editWidgetContent(item, $editingElement);
    }
  }


  this.delete_content = function(item, event) {
    if( ajaxIsActive ) return;

    if( isset(ShopifyApp) ) {
      ShopifyApp.Modal.confirm('Are you sure?', function(result){ if(result) _deleteContent(item, event); } );
    } else {
      if( confirm('Are you sure?') ) _deleteContent(item, event);
    }

    var _deleteContent = function(item, event){

      var $deletingElement = $(event.target).parent().closest('.grid-stack-item');
      var contentId = $deletingElement.attr('data-content-id');
      var contentType = $deletingElement.attr('data-content-type');

      if( contentType == 'column' ) {
        var columnsGrid = $('#layout-row > .grid-stack').data('gridstack');
        columnsGrid.remove_widget($deletingElement[0], true);

        self.widgets.remove(item);
        $('#layout-editor-loader').show();

        if( !$('.layout-column').length ) {
          $('#empty-layout-notice').show();
        }

        var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_editor', 'action': 'delete_container', 'content_id': contentId});
        if( request ) {
          request.done(function(response) {
            if( !ajaxCheckResponse(response) ) return;

            ajaxIsActive = false;
            popupUpdated = false;
            saveAllColumnsParams();
          });
        }

      } else {
        $column = $deletingElement.parent().closest('.layout-column');
        if( !$column.length ) return;

        self.widgets.remove(item);
        $('#layout-editor-loader').show();

        if( !$column.find('.layout-widget').length ) {
          $column.find('.column-empty-notice').show();
        }

        var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_editor', 'action': 'delete_widget', 'content_id': contentId});
        if( request ) {
          request.done(function(response) {
            if( !ajaxCheckResponse(response) ) return;

            ajaxIsActive = false;
            popupUpdated = false;
            saveAllWidgetsParams( $column.attr('data-content-id') );
          });
        }
      }

      if( $deletingElement.length && $deletingElement.hasClass('editing') ) {
        _hideEditWidgetForm();
      }
    }

  };
};

function koRegister(name) {
  ko.components.register(name, {
    viewModel: {
      createViewModel: function (controller, componentInfo) {
        var ViewModel = function (controller, componentInfo) {
          var grid = null;
          this.widgets = controller.widgets;

          this.afterAddWidget = function (items) {
            var item  = _.find(items, function (i) { return i.nodeType == 1 });
            var $item = $(item)

            var $componentElement = $(componentInfo.element);
            if( !$item.parent().closest('.layout-column').length ) {
              // column
              if( componentInfo.element.id != 'layout-row' ) componentInfo.element = document.getElementById('layout-row');
              isColumn = true;
              cellHeight = 280;
            } else {
              // widget
              if( !$componentElement.hasClass('column-widget-holder') ) {
                window.location.reload();
                return;
              }
              isColumn = false;
              cellHeight = 60;
            }

            if( grid ) grid = $componentElement.children('.grid-stack').data('gridstack');
            if( grid == null ) {
              grid = $componentElement.children('.grid-stack').gridstack({
                auto: false,
                cell_height: cellHeight,
                draggable: {
                  containment: '#layout-row',
                  appendTo: '#layout-row'
                }
              }).data('gridstack');
            }

            grid.add_widget(item);
            ko.utils.domNodeDisposal.addDisposeCallback(item, function () {
              grid.remove_widget(item);
            });

            // column/container
            if( isColumn ) {
              $item.addClass('layout-column ui-droppable');

              // ----------------------------------------------------
              $item.droppable({
                accept: ".grid-stack-item",
                tolerance: 'pointer',
                drop: function( event, ui ) {
                  if( $draggableParent ) {
                    var parentGrid = $draggableParent.find('.column-widget-holder > .grid-stack').data('gridstack');
                    grid = $item.find('.column-widget-holder > .grid-stack').data('gridstack');

                    if( grid == null ) {
                      grid = $item.find('.column-widget-holder > .grid-stack').gridstack({
                        auto: false,
                        cell_height: 60,
                        draggable: {
                          containment: '#layout-row',
                          appendTo: '#layout-row'
                        }
                      }).data('gridstack');
                    }

                    var widget = ui.draggable;
                    var widgetItem = widget[0];
                    var originalWidgetInfo = $(widgetItem).data('_gridstack_node');

                    var containerTop = $item.offset().top - $('#layout-row').offset().top;
                    var containerLeft = $item.offset().left - $('#layout-row').offset().left;
                    ui.position.top = ui.position.top - containerTop;
                    ui.position.left = ui.position.left - containerLeft;

                    var cell = grid.get_cell_from_pixel(ui.position);

                    parentGrid.remove_widget(widgetItem, false);
                    grid.add_widget(widgetItem, cell.x, cell.y, originalWidgetInfo.width, originalWidgetInfo.height, false);

                    if( $item.attr('data-content-id') != $draggableParent.attr('data-content-id') ) {
                      $item.find('.column-empty-notice').hide();
                      if( !$draggableParent.find('.layout-widget').length ) {
                        $draggableParent.find('.column-empty-notice').show();
                      }

                      saveAllWidgetsParams($item.attr('data-content-id'));
                      ajaxIsActive = false;
                      saveAllWidgetsParams($draggableParent.attr('data-content-id'));
                    } else {
                      if( originalWidgetInfo.x != cell.x || originalWidgetInfo.y != cell.y ) {
                        saveAllWidgetsParams($item.attr('data-content-id'));
                      }
                    }

                    $draggableParent = null;
                  }
                }
              });
              // ----------------------------------------------------

              $('#empty-layout-notice').hide();

              if( item.getAttribute('data-content-id') == '0' ) {
                var cp = {
                  "x": item.getAttribute('data-gs-x') || 0,
                  "y": item.getAttribute('data-gs-y') || 0,
                  "width": item.getAttribute('data-gs-width') || 1,
                };
                $('#layout-editor-loader').show();

                var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_editor', 'action': 'create_container', 'content_id': layoutId, 'container_params' : cp}, 'JSON');
                if( request ) {
                  request.done(function(response) {
                    if( !ajaxCheckResponse(response) ) return;
                    if( response.error || !response.data ) window.location.reload();

                    $item.attr('id', response.data.name).attr('data-content-id', response.data.id);
                    $('#layout-editor-loader').hide();
                    initColumnContainer($item, response.data.id);

                    if( typeof response.preview === 'string' ) updateQuickPreviewContent( response.preview );

                    popupUpdated = true;
                    showWidgetsMenu($item);
                  });
                }
              } else {
                initColumnContainer($item, item.getAttribute('data-content-id'));
              }

            // widget
            } else {
              $item.addClass('layout-widget');
              var $column = $item.parent().closest('.layout-column');
              if( !$column.length ) return;

              $column.find('.column-empty-notice').hide();

              // ----------------------------------------------------
              $item.draggable({
                containment: '#layout-row',
                appendTo: '#layout-row',
                distance: 10,
                cursorAt: {left: parseInt($item.children('.grid-stack-item-content').width() / 2), top: 30},
                helper: function(event,ui){
                  $item.draggable("option", "cursorAt", {
                    left: parseInt($item.children('.grid-stack-item-content').width() / 2),
                    top: 30
                  });

                  var $el = $item.clone(true, true);

                  $el.children('.grid-stack-item-content')
                      .css('width', $item.children('.grid-stack-item-content').width())
                      .css('height', 60);
                  $item.hide();
                  $draggableParent = $item.parent().closest('.layout-column');
                  return $el;
                }
              });
              // ----------------------------------------------------

              if( item.getAttribute('data-content-id') == '0' ) {
                var columnId = $column.attr('data-content-id');

                var wp = {
                  "x": item.getAttribute('data-gs-x') || 0,
                  "y": item.getAttribute('data-gs-y') || 0,
                  "width": item.getAttribute('data-gs-width') || 1,
                  "widget_type" : item.getAttribute('data-content-type') || 'text'
                };

                $('#layout-editor-loader').show();
                var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_editor', 'action': 'create_widget', 'content_id': columnId, 'widget_params' : wp}, 'JSON');
                if( request ) {
                  request.done(function(response) {
                    if( !ajaxCheckResponse(response) ) return;
                    if( response.error || !response.data ) window.location.reload();

                    $item.attr('id', response.data.name).attr('data-content-id', response.data.id);
                    $('#layout-editor-loader').hide();

                    ajaxIsActive = false;
                    popupUpdated = true;
                    editWidgetContent({content_type: wp.widget_type}, $item);
                  });
                }
              }
            }

          };
        };

        return new ViewModel(controller, componentInfo);
      }
    },
    template:
      [
        '<div class="grid-stack" data-bind="foreach: {data: widgets, afterRender: afterAddWidget}">',
        '  <div class="grid-stack-item" data-bind="attr: { \'id\': $data.content_name, \'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-auto-position\': $data.auto_position, \'data-gs-max-height\': $data.max_height, \'data-gs-min-height\':  $data.min_height, \'data-gs-min-width\':  $data.min_width, \'data-content-id\': $data.content_id, \'data-content-type\': $data.content_type}">',
        '    <div class="grid-stack-item-content">',
        '      <div class="widget-type-preview text-center tooltip-holder" data-bind="attr:{\'data-widget-type-icon\': $data.content_type}, click: function(){ $root.edit_content($data, event)}"><div class="grid-tool-tip" data-bind="text: $data.content_type"></div></div>',
        '     </div>',
        '     <button class="delete-content" data-bind="click: function(){ $root.delete_content($data, event) }"></button>',
        '     <button class="edit-content" data-bind="click: function(){ $root.edit_content($data, event) }"></button>',
        '  </div>',
        '</div>'
      ].join('')
  });
}

function initColumnContainer( $column, id )
{
  var columnWrapperName = 'column-wrapper-' + id;
  var columnHolderName  = 'column-widget-holder-' + id;

  $column.find('.grid-stack-item-content').html(
    [
      '<div class="column-wrapper" id="' + columnWrapperName + '">',
      '  <div class="column-empty-notice">',
      '   <a href="javascript:void(0)" data-bind="click: function(){ $root.edit_content($data, event) }">Add widget here</a>',
      '  </div>',
      '  <div class="column-menu-holder">',
      '    <header class="next-pane__header">',
      '      <h3>Add widget to the column</h3>',
      '    </header>',
      '    <ul class="column-menu next-list--divided">',
      '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_content($data, \'text\')}">Text</a></li>',
      '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_content($data, \'image\')}">Image</a></li>',
      '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_content($data, \'html\')}">HTML</a></li>',
      '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_content($data, \'social\')}">Social Buttons</a></li>',
      '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_content($data, \'button\')}">Button</a></li>',
      '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_content($data, \'share\')}">Share Buttons</a></li>',
      '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_content($data, \'video\')}">Video</a></li>',
      '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_content($data, \'subscribe\')}">Subscribe</a></li>',
      '    </ul>',
      '  </div>',
      '  <div id="' + columnHolderName + '" class="column-widget-holder" data-bind="component: {name: \'' + columnHolderName + '\', params: $data}">',
      '  </div>',
      '</div>'
    ].join('')
  );

  var widgets = layoutWidgetsParams[id] || [];
  var controller = new Controller(widgets);
  koRegister(columnHolderName);

  ko.applyBindings(controller, document.getElementById(columnWrapperName));
}

function showWidgetsMenu( $column )
{
  var $menu = $column.find('.column-menu-holder');

  $('.grid-stack-item').removeClass('editing');
  $column.addClass('editing');

  $('#widget-preview-object').removeAttr('style');
  $('#editor-sidebar-header').hide();
  $('#editor-sidebar-form-loader').hide();
  $('#editor-sidebar-form-holder').html($menu.clone(true, true)).show();
  $('#editor-sidebar-form-container').show();
}

function editWidgetContent(params, $editingWidget)
{
  if( ajaxIsActive || !$editingWidget || !$editingWidget.length ) return false;

  $('#editor-sidebar-form-loader').show();
  $('#editor-sidebar-header').hide();
  $('#editor-sidebar-form-holder').hide();
  $('#editor-sidebar-form-container').show();

  $editingElement = $editingWidget;
  var widgetId = $editingElement.attr('data-content-id');
  var contentType = params.content_type;

  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_form', 'id': widgetId, 'type' : contentType});
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      $('.grid-stack-item').removeClass('editing');
      $editingElement.addClass('editing');

      $('#editor-sidebar-form-loader').hide();
      $('#editor-sidebar-form-holder').html(response).show();

      initWidgetPreview(contentType);
      initColorpicker();
      initWYSIWYG();
    });
  }
}

function saveWidgetContentParams()
{
  if( ajaxIsActive || !$editingElement || !$editingElement.length ) return false;

  var form = $('#widget-edit-form');
  if( form.length ) {
    var data = new FormData( form[0] );
    data.append('task', 'ajax_layout_editor');
    data.append('action', 'save_widget_content');

    $('#editor-sidebar-form-loader').show();
    $('#editor-sidebar-form-holder').hide();

    var request = ajaxCallForm(globalBaseUrl, data, 'JSON');
    if( request ) {
      request.done(function(response) {
        if( !ajaxCheckResponse(response) ) return;

        $('#editor-sidebar-form-loader').hide();
        if( !response.error ) {
          _hideEditWidgetForm();
          $editingElement.removeClass('editing');
          $editingElement = null;

          if( typeof response.preview === 'string' ) updateQuickPreviewContent( response.preview );
          if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Widget content saved");

          popupUpdated = true;
        } else {
          $('#widget-edit-error').text(response.error).show();
          $('#editor-sidebar-form-holder').show();
        }
      });
    }
  }
}

function cancelEditWidget()
{
  _hideEditWidgetForm();
  $editingElement = null;
  $('.grid-stack-item').removeClass('editing');
}

function saveAllColumnsParams()
{
  if( ajaxIsActive ) return;

  var allContainers = $('#layout-row .layout-column');
  var cp, data = [];
  $('#layout-editor-loader').show();

  allContainers.each(function(index, item) {
    cp = {
      "x": item.getAttribute('data-gs-x') || 0,
      "y": item.getAttribute('data-gs-y') || 0,
      "width": item.getAttribute('data-gs-width') || 2,
      "container_id": item.getAttribute('data-content-id') || 0
    };

    data.push(cp);
  });

  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_editor', 'action': 'save_containers', 'content_id': layoutId, 'data' : data}, 'JSON');
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      $('#layout-editor-loader').hide();
      if( typeof response.preview === 'string' ) updateQuickPreviewContent( response.preview );

      popupUpdated = true;
    });
  }
}

function saveAllWidgetsParams( containerId )
{
  if( ajaxIsActive ) return;

  var allContainerWidgets = $('#column-widget-holder-' + containerId + ' .layout-widget');
  var wp, data = [];
  $('#layout-editor-loader').show();

  allContainerWidgets.each(function(index, item) {
    wp = {
      "x": item.getAttribute('data-gs-x') || 0,
      "y": item.getAttribute('data-gs-y') || 0,
      "width": item.getAttribute('data-gs-width') || 2,
      "widget_id": item.getAttribute('data-content-id') || 0
    };

    data.push(wp);
  });

  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_editor', 'action': 'save_widgets', 'content_id': containerId, 'data' : data}, 'JSON');
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      $('#layout-editor-loader').hide();
      if( typeof response.preview === 'string' ) updateQuickPreviewContent( response.preview );

      popupUpdated = true;
    });
  }
}

function _hideEditWidgetForm()
{
  clearWidgetPreview(true);
  $('#editor-sidebar-form-container').hide();
  $('#editor-sidebar-form-holder').empty();
  $('#editor-sidebar-header').show();
}

function clearWidgetPreview( updatePreview )
{
  $('#layout-editor-big-cancel').hide();
  $('#widget-preview-object').removeAttr('style');
  $('#layout-row').show();
  $('#popup-widget-preview-content').empty();
  if( updatePreview ) updateQuickPreviewContent();
}

function initWidgetPreview(type)
{
  if( $('.preview-object').length ) {
    clearWidgetPreview(false);
    updateQuickPreviewContent( $('.preview-object').html() );
    $('.preview-object').remove();
  } else {
    clearWidgetPreview(true);
  }

  $('[data-type=widget-style]').each(function(i, val){
    $(this).setPreviewWidgetStyle();
  });
  $('[data-type=widget-style]').change(function(){
    $(this).setPreviewWidgetStyle();
  });
  $('input[type=text][data-style=show-field]').keyup(function(){
    $(this).setPreviewWidgetStyle();
  });

  $('[data-type=widget-value]').each(function(i, val){
    $(this).setPreviewWidgetValue();
  });
  $('[data-type=widget-value]').change(function(){
    $(this).setPreviewWidgetValue();
  });
  $('textarea[data-type=widget-value], input[type=text][data-type=widget-value]').keyup(function(){
    $(this).setPreviewWidgetValue();
  });

  $('[data-type=widget-attr]').each(function(i, val){
    $(this).setPreviewWidgetAttr();
  });
  $('[data-type=widget-attr]').change(function(){
    $(this).setPreviewWidgetAttr();
  });
  $('textarea[data-type=widget-attr], input[type=text][data-type=widget-attr]').keyup(function(){
    $(this).setPreviewWidgetAttr();
  });

  $('#layout-row').hide();
  $('#layout-editor-big-cancel ').show();
}

function updateQuickPreviewContent( html )
{
  var $holder = $('#popup-widget-preview-content');
  if( !$holder.length ) return;

  if( typeof html === 'string' ) {
    $holder.html( html );
  } else {
    var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_show', 'layout_id': layoutId, 'preview': 1});
    if( request ) {
      request.done(function(response) {
        if( !ajaxCheckResponse(response) ) return;
        $holder.html( response );
      });
    }
  }

  $holder.find('a, button').click(function(event){
    event.preventDefault();
  });
}

$.fn.extend({setPreviewWidgetStyle : function() {
  var previewId = '#widget-preview-object ' + $(this).attr('data-preview-selector');
  var previewStyle = $(this).attr('data-style');
  var value = $(this).val();

  if( previewStyle && previewId ) {
    var $previewElement = $(previewId);
    if( !$previewElement.length ) return;

    if( value ) {
      switch( previewStyle ) {
        case 'color':
        case 'background':
        case 'background-color':
        case 'border-color':
                value = '#' + value;
                break;

        case 'font-size':
        case 'width':
        case 'height':
        case 'border-width':
        case 'border-radius':
        case 'margin-top':
        case 'margin-bottom':
        case 'margin-left':
        case 'margin-right':
                value = parseInt(value);

                if( previewStyle == 'font-size' && !value ) {
                  value = 13;
                }

                if( previewStyle == 'width' && !value ) return;
                if( value ) value = value + 'px';

                break;

        case 'padding-v':
        case 'padding-h':
                value = parseInt(value) + 'px';
                if( previewStyle == 'padding-v' ) {
                  $previewElement.css('padding-top', value);
                  previewStyle = 'padding-bottom';
                } else {
                  $previewElement.css('padding-left', value);
                  previewStyle = 'padding-right';
                }
                break;

        case 'font-style':
                if( value == 'bold' ) {
                  $previewElement.css('font-style', 'normal');
                  previewStyle = 'font-weight';
                } else if( value == 'bold_italic' ) {
                  $previewElement.css('font-weight', 'bold');
                  value = 'italic';
                } else {
                  $previewElement.css('font-weight', 'normal');
                }
                break;

        case 'background-image':
                value = "url('" + value + "')";
                break;

        case 'background-repeat':
                value = parseInt(value);
                switch( value ) {
                  case 0 : $previewElement.css('background-repeat', 'no-repeat');
                           $previewElement.css('background-position', 'top center');
                           break;
                  case 1 : $previewElement.css('background-repeat', 'repeat-x')
                           $previewElement.css('background-position', 'top left');
                           break;
                  case 2 : $previewElement.css('background-repeat', 'repeat-y')
                           $previewElement.css('background-position', 'top left');
                           break;
                  case 3 : $previewElement.css('background-repeat', 'repeat')
                           $previewElement.css('background-position', 'top left');
                           break;
                }
                break;

        case 'width-full':
                  previewStyle = 'width';
                  value = $(this).is(':checked') ? '100%' : 'auto';
                  break;

        case 'btn-size':
                  previewStyle = 'width';
                  value = value + 'px';
                  $previewElement.css('height', value);
                  $previewElement.css('line-height', value);

                  var fontSize = parseInt(parseInt(value) * 0.6) + 'px';
                  $previewElement.css('font-size', fontSize);
                  break;

        case 'hide':
                  previewStyle = 'display';
                  value = $(this).is(':checked') ? 'none' : '';
                  break;

        case 'show':
                  previewStyle = 'display';
                  value = $(this).is(':checked') ? '' : 'none';
                  break;

        case 'show-field':
                  previewStyle = 'display';
                  value = '';
                  break;


        case 'display-block':
                  previewStyle = 'display';
                  value = $(this).is(':checked') ? 'block' : '';
                  break;

        case 'placeholder':
                  $previewElement.attr('placeholder', value);
                  return;
                  break;
      }
    } else {
      switch( previewStyle ) {
        case 'background':
        case 'background-color':
                           value = 'transparent';
                           break;
        case 'show-field': previewStyle = 'display';
                           value = 'none';
                           break;
      }
    }

    $previewElement.css(previewStyle, value);
  }
}});

$.fn.extend({setPreviewWidgetValue : function() {
  var previewId = '#widget-preview-object ' + $(this).attr('data-preview-selector');
  var $previewElement = $(previewId);
  if( $previewElement.length ) $previewElement.html( $(this).val() );
}});

$.fn.extend({setPreviewWidgetAttr : function() {
  var previewId = '#widget-preview-object ' + $(this).attr('data-preview-selector');
  var $previewElement = $(previewId);
  if( $previewElement.length ) {
    $previewElement.attr( $(this).attr('data-attr'), $(this).val() );
  }
}});


// --------------------------------------------- Layout Actions ---------------------------------------------
function editLayout( layoutId )
{
  layoutId = layoutId || 0;

  $('#layout-list-container').addClass('large--two-thirds medium--two-thirds');
  $('#layout-edit-form-holder').empty().show();
  $('#layout-edit-loader').show();
  $('#layout-edit-container').show();

  var request = ajaxCall(globalBaseUrl, {'task': 'ajax_form', 'id': layoutId, 'type': 'layout' });
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      $('#layout-edit-loader').hide();
      $('#layout-edit-form-holder').html(response);
      createLayoutButtonToggle(false);
      initColorpicker();

      var eventSetting = $('#layout_setting_event');
      layoutEditVariousSettingsToggle( eventSetting );
      eventSetting.change( function(e){ layoutEditVariousSettingsToggle( $(this) ) } );
    });
  }
}

function duplicateLayout( layoutId )
{
  if( ajaxIsActive || !layoutId ) return;

  var $row = $('#layout-item-' + layoutId);

  $row.find('.layout-item-status').text('duplicating');
  $row.find('a').removeAttr('onclick');
  $('#layout-list-holder').addClass('easypopup-disabled');

  var request = ajaxCall(globalBaseUrl, {'task': 'ajax_layout_actions',  'action': 'duplicate', 'layout_id': layoutId });
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;
      window.location.reload();
      return;
    });
  }
}

function layoutEditVariousSettingsToggle( el )
{
  if( !isset(el) || !el.length ) return;
  var value = el.val();

  $('.layout-setting-various').hide();
  $('#layout_setting_various_' + value).show();
}

function layoutEditFieldsToggle( el, type )
{
  if( !isset(el) || !$(el).length ) return;
  var value = $(el).val();

  $('.layout-setting-' + type  + '-holders').hide();
  $('#layout-setting-' + type  + '-' + value + 's-holder').show();
}

function saveLayoutSettings()
{
  var form = $('#layout-edit-form');
  $('#layout-edit-loader').show();
  $('#layout-edit-form-holder').hide();
  var layoutId = parseInt( form.find('[name=layout_id]').val() );

  if( form.length ) {
    var data = new FormData( form[0] );
    data.append('task', 'ajax_layout_actions');
    data.append('action', 'save');
    $('#layout-list-holder').addClass('easypopup-disabled');

    var request = ajaxCallForm(globalBaseUrl, data, 'JSON');
    if( request ) {
      request.done(function(response) {
        if( !ajaxCheckResponse(response) ) return;

        if( !response.error ) {
          cancelEditLayout();

          if( !layoutId ) {
            if( response.data.id ) {
              window.location.href = globalBaseUrl + '&task=layout_editor&layout_id=' + response.data.id;
            } else {
              window.location.reload();
            }
            return;
          }

          $('#layout-item-' + layoutId + ' .layout-item-title').text(response.data.title);
          if( response.data.status == 1 ) {
            $('#layout-item-' + layoutId + ' .layout-item-status').removeClass('layout-disabled').html(popupEnabledPhrase);
          } else {
            $('#layout-item-' + layoutId + ' .layout-item-status').addClass('layout-disabled').html(popupDisabledPhrase);
          }

          if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Popup saved");
        } else {
          $('#layout-edit-loader').hide();
          $('#layout-edit-form-holder').show();
          $('#layout-edit-error').text(response.error).show();
        }

        $('#layout-list-holder').removeClass('easypopup-disabled');
      });
    }
  }
}

function layoutStatusToggle( layoutId )
{
  if( ajaxIsActive || !layoutId ) return;

  var $statusEl = $('#layout-item-' + layoutId + ' .layout-item-status');
  var status = parseInt($statusEl.attr('data-status'));
  $statusEl.text('saving...');
  $('#layout-list-holder').addClass('easypopup-disabled');

  var request = ajaxCall(globalBaseUrl, {'task': 'ajax_layout_actions',  'action': 'change_status', 'layout_id': layoutId, 'status': status });
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      if( status ) {
        $statusEl.attr('data-status', 0).html(popupDisabledPhrase).addClass('layout-disabled');
      } else {
        $statusEl.attr('data-status', 1).html(popupEnabledPhrase).removeClass('layout-disabled');
      }

      $('#layout-list-holder').removeClass('easypopup-disabled');
    });
  }
}

function cancelEditLayout()
{
  $('#layout-edit-container').hide();
  $('#layout-edit-form-holder').empty();
  $('#layout-list-container').removeClass('large--two-thirds medium--two-thirds');
  createLayoutButtonToggle(true);
}

function deleteLayout( layoutId )
{
  if( ajaxIsActive || !layoutId ) return;

  if( isset(ShopifyApp) ) {
    ShopifyApp.Modal.confirm('Are you sure?', function(result){ if(result) _deleteLayout(layoutId); } );
  } else {
    if( confirm('Are you sure?') ) _deleteLayout(layoutId);
  }

  var _deleteLayout = function(layoutId) {
    var $row = $('#layout-item-' + layoutId);

    $row.find('.layout-item-status').text('deleting');
    $row.find('a').removeAttr('onclick');
    $('#layout-list-holder').addClass('easypopup-disabled');

    var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_actions', 'action': 'delete', 'layout_id': layoutId});
    if( request ) {
      request.done(function(response) {
        if( !ajaxCheckResponse(response) ) return;

        $row.remove();
        $('#layout-list-holder').removeClass('easypopup-disabled');
        if( !$('#layout-list-holder > li').length ) $('#no-layout').show();
      });
    }
  }
}

function showPopup( layoutId, previewMode )
{
  var preview = previewMode || false;
  var $popup = $('#layout-preview-container');
  if( !$popup.length || !layoutId || ajaxIsActive ) return;

  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_layout_show', 'layout_id': layoutId, 'preview': preview});
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      if( response ) {
        var fl = $.featherlight($popup, {uniqueClass: 'easypopup_container_' + layoutId});

        var content = $('.ep_featherlight-content .layout-preview-content');
        if( content.length ) {
          content.html(response);
          content.find('a').click(function(event){
            event.preventDefault();
          });
        }
      } else {
        if( isset(ShopifyApp) ) {
          ShopifyApp.Modal.alert('Popup is empty. Please fill it.');
        } else {
          alert('Popup is empty. Please fill it.');
        }
      }
    });
  }
}

function createLayoutButtonToggle( createOn )
{
  var $editedLayoutId = $('#layout-edit-form input[name=layout_id]');

  if( createOn || !$editedLayoutId.length || !$editedLayoutId.val() ) {
    ShopifyApp.Bar.initialize({
      title: "Popups List",

      buttons: {
        primary: [{
          label: "Create New",
          loading: false,
          callback: function(message, data){ editLayout(); }
        }],
        secondary: [{
          label: "Instuctions",
          loading: false,
          callback: function(message, data){ window.location.href = globalBaseUrl + '&task=instructions'; }
        }]
      }
    });
  } else {
    ShopifyApp.Bar.initialize({
      title: "Popups List",

      buttons: {
        primary: [{
          label: "Save",
          loading: false,
          callback: function(message, data){ saveLayoutSettings(); }
        }],
        secondary: [{
          label: "Instuctions",
          loading: false,
          callback: function(message, data){ window.location.href = globalBaseUrl + '&task=instructions'; }
        }]
      }
    });
  }
}

function reinstallCode()
{
  if( ajaxIsActive ) return;

  $('#instructions-container').addClass('easypopup-disabled');

  var request = ajaxCall(globalBaseUrl, {'task': 'ajax_layout_actions',  'action': 'reinstall' });
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      $('#instructions-container').removeClass('easypopup-disabled');
      if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Intall complete");
    });
  }
}

// --------------------------------------------- Common ---------------------------------------------
function initColorpicker()
{
  $('input[data-spec=colorpicker]').ColorPicker({
    onSubmit: function(hsb, hex, rgb, el) {
      $(el).val(hex);
      $(el).ColorPickerHide();
    },
    onChange: function(hsb, hex, rgb, el) {
      $(el).val(hex);
      if( $.isFunction($(el).setPreviewWidgetStyle) ) $(el).setPreviewWidgetStyle();
    },
    onBeforeShow: function () {
      $(this).ColorPickerSetColor(this.value);
    }
  })
  .bind('keyup', function(){
    var $this = $(this);
    $this.ColorPickerSetColor(this.value);
    if( $.isFunction($this.setPreviewWidgetStyle) ) $this.setPreviewWidgetStyle();
  });
}

function initWYSIWYG()
{
  var $wysiwygEl = $('textarea[data-spec=wysiwyg]');
  if( $wysiwygEl.length ) {

    var editor = new tinymce.Editor($wysiwygEl.attr('id'), {
      menubar: false,
      statusbar: false,
      height: 200,
      content_css : "externals/css/base.css,externals/libraries/tinymce/base.css",
      plugins: [
        "advlist link textcolor code hr directionality"
      ],
      toolbar: "bold,italic,underline,strikethrough,|,forecolor,backcolor,|,alignleft,aligncenter,alignright,alignjustify,|,bullist,numlist,|,formatselect,|,ltr,rtl,|,link,unlink,code,|,hr,removeformat,"

    }, tinymce.EditorManager);

    editor.on('NodeChange', function(e) {
      var originalEl = editor.getElement();
      $(originalEl).html(editor.getBody().innerHTML).setPreviewWidgetValue();
    });

    editor.on('keyup', function(e) {
      var originalEl = editor.getElement();
      $(originalEl).html(editor.getBody().innerHTML).setPreviewWidgetValue();
    });

    editor.render();
  }
}