"use strict";

var $editingElement = null;
var mainGridController;
var optionsGridController;

$(document).ready(function(){
  $('document').on('click', '.easyorder-disabled', function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
  });

  $('div').on('dragstart', function(e) {
    if( ajaxIsActive ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
});

function mainController(widgets)
{
  var self = this;
  this.widgets = ko.observableArray(widgets);

  this.add_new_content = function(controller, type, typeSpec, typeName) {
    if( ajaxIsActive ) return false;

    var h = globalGridOptions.base;
    switch( type ) {
      case 'text'    :
      case 'email'   :
      case 'select'  : h = globalGridOptions.text; break;
      case 'textarea': h = globalGridOptions.textarea; break;
    }

    this.widgets.push({
      x: 0,
      y: 0,
      width: 12,
      min_width: 12,
      max_width: 12,
      height: h,
      max_height: h,
      min_height: h,
      field_id: 0,
      field_type: type,
      field_type_spec: typeSpec || '',
      field_type_name: typeName || '',
      auto_position: true
    });
  };


  this.edit_field = function(item, event) {
    if( ajaxIsActive || !isset(event) || !isset(event.target) ) return false;

    var $el = $(event.target).parent().closest('.form-field');
    $el.editFieldSettings();
  }


  this.delete_field = function(item, event) {
    if( ajaxIsActive ) return;
    if( isset(ShopifyApp) ) {
      ShopifyApp.Modal.confirm('Are you sure?', function(result){ if(result) _deleteField(item, event); } );
    } else {
      if( confirm('Are you sure?') ) _deleteField(item, event);
    }

    var _deleteField = function(item, event){
      var $deletingElement = $(event.target).parent().closest('.grid-stack-item');
      var fieldId = $deletingElement.attr('data-field-id');
      closeEditFieldForm();

      self.widgets.remove(item);
      $('#easyorder-tabs-loader').show();

      var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_form_editor', 'action': 'delete_field', 'field_id': fieldId});
      if( request ) {
        request.done(function(response) {
          if( !ajaxCheckResponse(response) ) return;

          $('#easyorder-tabs-loader').hide();
          setTimeout(function(){saveFieldsParams();}, 50);
        });
      }
    }

  };
};

function optionsController(widgets)
{
  var self = this;
  this.widgets = ko.observableArray(widgets);

  this.add_new_content = function(controller, label, value) {
    this.widgets.push({
      x: 0,
      y: 0,
      width: 12,
      min_width: 12,
      max_width: 12,
      height: globalGridOptions.option,
      max_height: globalGridOptions.option,
      min_height: globalGridOptions.option,
      option_id: 0,
      option_label: label,
      option_value: value,
      option_class: '',
      auto_position: true
    });
  };

  this.delete_option = function(item, event) {
    //if( ajaxIsActive ) return;
    $('#easyorder-tabs-loader').show();

    var $deletingElement = $(event.target).parent().closest('.grid-stack-item');
    var optionId = $deletingElement.attr('data-option-id');

    if( $('#field_setting_edit_option_option_id').val() == optionId ) {
      $('#edit-option-holder').hide();
    }

    self.widgets.remove(item);
    $('#options-container').setPreviewFieldValue();
  };
};

function koMainRegister(name)
{
  ko.components.register(name, {
    viewModel: {
      createViewModel: function (controller, componentInfo) {
        var ViewModel = function (controller, componentInfo) {
          var grid = null;
          this.widgets = controller.widgets;

          this.afterAddWidget = function (items) {
            var item  = _.find(items, function (i) { return i.nodeType == 1 });
            var $item = $(item);
            if( grid == null ) {
              grid = $(componentInfo.element).find('.grid-stack').gridstack({
                auto: false,
                cell_height: globalGridOptions.rate,
                vertical_margin: 0
              }).data('gridstack');
            }

            grid.add_widget(item);
            ko.utils.domNodeDisposal.addDisposeCallback(item, function () {
              grid.remove_widget(item);
            });


            $item.addClass('form-field');
            if( item.getAttribute('data-field-type-spec') == 'superemail' ) {
              $item.find('.delete-field').remove();
            }

            if( item.getAttribute('data-field-id') == '0' ) {
              $('#easyorder-tabs-loader').show();

              var fp = {
                "y": item.getAttribute('data-gs-y') || 0,
                "type": item.getAttribute('data-field-type') || '',
                "type_spec": item.getAttribute('data-field-type-spec') || ''
              };

              var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_form_editor', 'action': 'create_field', 'form_id': formId, 'field_params' : fp}, 'JSON');
              if( request ) {
                request.done(function(response) {
                  if( !ajaxCheckResponse(response) ) return;
                  if( response.error || !response.data ) window.location.reload();

                  $item.attr('id', response.data.name).attr('data-field-id', response.data.id);
                  $('#easyorder-tabs-loader').hide();
                  $item.initPreviewField();

                  setTimeout(function(){$item.editFieldSettings();}, 50);
                });
              }
            } else {
              $item.initPreviewField();
            }
          };
        };

        return new ViewModel(controller, componentInfo);
      }
    },
    template:
      [
        '<div class="grid-stack" data-bind="foreach: {data: widgets, afterRender: afterAddWidget}">',
        '  <div class="grid-stack-item" data-bind="attr: { \'id\': $data.field_name, \'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-max-width\': $data.width, \'data-gs-min-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-min-height\': $data.min_height, \'data-gs-auto-position\': $data.auto_position, \'data-field-id\': $data.field_id, \'data-field-type\': $data.field_type, \'data-field-type-spec\': $data.field_type_spec}">',
        '    <div class="grid-stack-item-content">',
        '      <div class="field-preview"></div>',
        '      <div class="move-icon"></div>',
        '    </div>',
        '    <button class="info-field tooltip-holder"><div class="tool-tip" data-bind="text: $data.field_type_name"></div></button>',
        '    <button class="edit-field" data-bind="click: function(){ $root.edit_field($data, event) }"></button>',
        '    <button class="delete-field" data-bind="click: function(){ $root.delete_field($data, event) }"></button>',
        '  </div>',
        '</div>'
      ].join('')
  });
}

function koOptionsRegister(name)
{
  ko.components.register(name, {
    viewModel: {
      createViewModel: function (controller, componentInfo) {
        var ViewModel = function (controller, componentInfo) {
          var grid = null;
          this.widgets = controller.widgets;

          this.afterAddOption = function (items) {
            var item  = _.find(items, function (i) { return i.nodeType == 1 });
            var $item = $(item);

            if( grid == null ) {
              grid = $(componentInfo.element).find('.grid-stack').gridstack({
                auto: false,
                cell_height: globalGridOptions.rate,
                vertical_margin: 0
              }).data('gridstack');
            }

            grid.add_widget(item);
            ko.utils.domNodeDisposal.addDisposeCallback(item, function () {
              grid.remove_widget(item);
            });

            $item.addClass('field-option');

            if( item.getAttribute('data-option-id') == '0' ) {
              var d = new Date();
              var h = addZero(d.getHours(), 2);
              var m = addZero(d.getMinutes(), 2);
              var s = addZero(d.getSeconds(), 2);
              var ms= addZero(d.getMilliseconds(), 3);
              var tmpOprionName = "new_" + h + "_" + m + "_" + s + "_" + ms;
              $item.attr('id', tmpOprionName).attr('data-option-id', tmpOprionName);
              $('#options-container').setPreviewFieldValue();
            }
          };
        };

        return new ViewModel(controller, componentInfo);
      }
    },
    template:
      [
        '<div class="grid-stack" data-bind="foreach: {data: widgets, afterRender: afterAddOption}">',
        '  <div class="grid-stack-item" data-bind="attr: {\'id\': $data.option_name, \'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-max-width\': $data.width, \'data-gs-min-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-max-height\': $data.height, \'data-gs-min-height\': $data.height, \'data-gs-auto-position\': $data.auto_position, \'data-option-id\': $data.option_id, \'class\': $data.option_class}">',
        '    <div class="grid-stack-item-content grid">',
        '      <div class="option-edit-row" data-bind="click: function(){ populateOptions($data, event); }">',
        '        <div class="option-label grid__item large--one-half medium--one-half small--one-whole" data-bind="text: $data.option_label"></div>',
        '        <div class="option-value grid__item large--one-half medium--one-half small--one-whole" data-bind="text: $data.option_value"></div>',
        '        <div class="move-icon"></div>',
        '      </div>',
        '      <button class="edit-option" data-bind="click: function(){ editOptionForm(event); }">Edit</button>',
        '      <button class="delete-option" data-bind="click: function(){ $root.delete_option($data, event); }">Delete</button>',
        '     </div>',
        '  </div>',
        '</div>'
      ].join('')
  });
}

function showMainMenu()
{
  var $menu = $('#main-menu-hidden-holder > ul');
  if( $menu.length ) {
    closeEditFieldForm();
    $('#editor-sidebar-header').hide();
    $('#editor-sidebar-form-holder').html($menu.clone()).show();
  }
  $('body').animate({ scrollTop: $("body").offset().top }, 500);
}

$.fn.extend({initPreviewField : function(){
  var $field = $(this);
  var fieldId   = $field.attr('data-field-id');
  var fieldType = $field.attr('data-field-type');
  var settings;
  if( formFieldsSettings[fieldId] ) {
    settings = formFieldsSettings[fieldId];
    delete formFieldsSettings[fieldId];
  } else {
    settings = [];
  }

  var fieldRequired = parseInt(settings['required']) || 0;
  var fieldHideTitle = parseInt(settings['hide_title']) || 0;

  var previewItemName  = 'field-preview-item-' + fieldId;
  var previewLabelName = 'field-preview-item-label-' + fieldId;
  var previewLabel, previewItem;
  var labelOrderASC = true;

  previewLabel = document.createElement("label");
  previewLabel.setAttribute("id", previewLabelName);
  previewLabel.setAttribute("for", previewItemName);

  previewLabel.innerHTML = settings['title'] || '';
  if( fieldHideTitle ) {
    previewLabel.className += " hidden-title";
  }
  if( fieldRequired ) {
    previewLabel.className += " required";
  }

  switch( fieldType ) {
    case 'heading' :
        previewItem = '';
        previewLabel = document.createElement("h3");
        previewLabel.id = previewLabelName;
        previewLabel.innerHTML = settings['title'] || '';
        break;

    case 'text'  :
    case 'email' :
        previewItem = document.createElement("input");
        previewItem.type = fieldType;
        previewItem.placeholder = settings['placeholder'] || '';
        break;

    case 'textarea' :
        previewItem = document.createElement("textarea");
        previewItem.placeholder = settings['placeholder'] || '';
        break;

    case 'select' :
        previewItem = document.createElement("select");
        if( !empty(settings['options']) ) {
          $.each(settings['options'], function(index, o) {
            var selected = (parseInt(o.checked) ? ' selected' : '');
            previewItem.innerHTML += "<option" + selected + ">" + o.label + "</option>";
          });
        }
        break;

    case 'checkbox' :
        previewItem = document.createElement("div");
        if( !empty(settings['options']) ) {
          $.each(settings['options'], function(index, o) {
            var checked = (parseInt(o.checked) ? 'checked' : '');
            previewItem.innerHTML += "<div class='preview-checkbox-holder'><input type='checkbox' " + checked + " /><label>" + o.label + "</label></div>";
          });
        }
        break;

    case 'radio' :
        previewItem = document.createElement("div");
        if( !empty(settings['options']) ) {
          $.each(settings['options'], function(index, o) {
            var checked = (parseInt(o.checked) ? 'checked' : '');
            previewItem.innerHTML += "<div class='preview-radio-holder'><input type='radio' " + checked + " name='radiogroup" + fieldId + "' /><label>" + o.label + "</label></div>";
          });
        }
        break;
  }

  if( previewItem ) {
    previewItem.class = "field-preview-item";
    previewItem.id = previewItemName;
  }

  if( labelOrderASC ) {
    $field.find('.field-preview').append(previewLabel).append(previewItem);
  } else {
    $field.find('.field-preview').append(previewItem).append(previewLabel);
  }
}});

function bindFieldPreview()
{
  $('[data-form]').each(function(i, val){
    $(this).setPreviewFieldValue();
  });
  $('[data-form]').change(function(){
    $(this).setPreviewFieldValue();
  });
  $('textarea[data-form], input[type=text][data-form]').keyup(function(){
    $(this).setPreviewFieldValue();
  });
}

$.fn.extend({editFieldSettings : function(){
  if( ajaxIsActive ) return false;
  $editingElement = $(this);

  $('#editor-sidebar-header').hide();
  $('#editor-sidebar-form-holder').hide();
  $('#editor-sidebar-form-loader').show();

  var fieldId = $editingElement.attr('data-field-id');
  var fieldType = $editingElement.attr('data-field-type');

  $('.grid-stack-item').removeClass('editing');
  $editingElement.addClass('editing');
  $('body').animate({ scrollTop: $("body").offset().top }, 500);

  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_get_form', 'id': fieldId, 'type' : fieldType});
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;
      if( !response ) {
        closeEditFieldForm();
        return;
      }

      $('#editor-sidebar-form-loader').hide();
      $('#editor-sidebar-form-holder').html(response).show();

      bindFieldPreview();
      initOptionsGrid();
    });
  }
}});

function initOptionsGrid()
{
  var $optionsEl = $('#options-holder');
  if( !$optionsEl.length ) return;

  var optionsParams = JSON.parse($optionsEl.text());
  $optionsEl.text('').show();

  optionsGridController = new optionsController(optionsParams);
  ko.applyBindings(optionsGridController, document.getElementById('options-container'));

  $optionsEl.on('change', function (event, ui) {
    $('#options-container').setPreviewFieldValue();
  });
}

function saveFieldSettings()
{
  if( ajaxIsActive || !$editingElement || !$editingElement.length ) return false;

  var fieldForm = $('#field-edit-form');
  if( fieldForm.length ) {
    var data = new FormData( fieldForm[0] );
    data.append('task', 'ajax_form_editor');
    data.append('action', 'save_field_settings');

    var allOptions = $('#options-holder .field-option');
    allOptions.each(function(index, item) {
      var $item = $(item);
      var elY = "field_setting_options[" + item.getAttribute('data-gs-y') + "]";
      data.append(elY + "[option_id]", (item.getAttribute('data-option-id') || 0));
      data.append(elY + "[label]", $item.find('.option-label').text());
      data.append(elY + "[value]", $item.find('.option-value').text());
      data.append(elY + "[checked]", ($item.hasClass('row-checked') ? 1 : 0));
    });

    $('#editor-sidebar-form-loader').show();
    $('#editor-sidebar-form-holder').hide();

    var request = ajaxCallForm(globalBaseUrl, data, 'JSON');
    if( request ) {
      request.done(function(response) {
        if( !ajaxCheckResponse(response) ) return;

        $('#editor-sidebar-form-loader').hide();
        if( !response.error ) {
          closeEditFieldForm();
          if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Field settings saved");
        } else {
          $('#field-edit-error').text(response.error).show();
          $('#editor-sidebar-form-holder').show();
        }
      });
    }
  }
}

function cancelEditField()
{
  closeEditFieldForm();
}

function saveFieldsParams()
{
  if( ajaxIsActive ) ajaxIsActive = false;

  var allFields = $('#fields-holder .form-field');
  var fp, data = [];
  $('#easyorder-tabs-loader').show();

  allFields.each(function(index, item) {
    fp = {
      "y": item.getAttribute('data-gs-y') || 0,
      "field_id": item.getAttribute('data-field-id') || 0
    };

    data.push(fp);
  });

  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_form_editor', 'action': 'save_fields', 'form_id': formId, 'data' : data}, 'JSON');
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;
      $('#easyorder-tabs-loader').hide();
    });
  }
}

function closeEditFieldForm()
{
  $('#editor-sidebar-form-holder').empty();
  $('#editor-sidebar-header').show();

  if( $editingElement ) $editingElement.removeClass('editing');
  $editingElement = null;
}

$.fn.extend({setPreviewFieldValue : function(){
  var $self = $(this);
  var previewSelector = $self.attr('data-preview-selector');
  var previewType     = $self.attr('data-type');
  var previewValue    = $self.val();
  var $previewElement = $(previewSelector);

  if( $previewElement.length ) {
    if( previewType == "field-select" ) {
      $previewElement.empty();
      $previewElement.html($self.html());
      $previewElement.val($self.val());

    } else if( previewType == "field-select-grid" ) {
      $previewElement.empty();

      var rows = $self.find('.field-option');
      var sorted = [];
      $.each(rows, function(index, o) {
        var selected = '';
        if( $(o).hasClass('row-checked') ) selected = ' selected';
        sorted[o.getAttribute('data-gs-y')] = "<option" + selected + ">" + $(o).find('.option-label').text() + "</option>";
      });

      $.each(sorted, function(index, o) {
        $previewElement.append(o);
      });

    } else if( previewType == "field-checkbox-grid" ) {
      $previewElement.empty();
      var $gridsRow = $previewElement.parent().closest('.grid-stack-item');

      var $rows = $self.find('.field-option');
      var sorted = [];
      $.each($rows, function(index, o) {
        var checked = '';
        if( $(o).hasClass('row-checked') ) checked = 'checked';
        sorted[o.getAttribute('data-gs-y')] = "<div class='preview-checkbox-holder'><input type='checkbox' " + checked + " /><label>" + $(o).find('.option-label').text() + "</label></div>";
      });

      $.each(sorted, function(index, o) {
        $previewElement.append(o);
      });

      var grid = $('#fields-holder .grid-stack').data('gridstack');
      var height = globalGridOptions.base + Math.ceil( $rows.length * globalGridOptions.radio );
      grid.resize($gridsRow[0], null, height);

    } else if( previewType == "field-radio-grid" ) {
      $previewElement.empty();
      var $gridsRow = $previewElement.parent().closest('.grid-stack-item');

      var $rows = $self.find('.field-option');
      var sorted = [];
      $.each($rows, function(index, o) {
        var checked = '';
        if( $(o).hasClass('row-checked') ) checked = 'checked';
        sorted[o.getAttribute('data-gs-y')] = "<div class='preview-radio-holder'><input type='radio' name='radiogroup" + $gridsRow.attr('data-field-id') + "' " + checked + " /><label>" + $(o).find('.option-label').text() + "</label></div>";
      });

      $.each(sorted, function(index, o) {
        $previewElement.append(o);
      });

      var grid = $('#fields-holder .grid-stack').data('gridstack');
      var height = globalGridOptions.base + Math.ceil( $rows.length * globalGridOptions.radio );
      grid.resize($gridsRow[0], null, height);

    } else if( previewType == "field-required" ) {
      if( $self.prop('checked') ) $previewElement.addClass('required');
      else $previewElement.removeClass('required');
    } else if( previewType == "field-placeholder" ) {
      $previewElement.attr( 'placeholder', previewValue );
    } else if( previewType == 'hide-title' ) {
      if( $self.prop('checked') ) $previewElement.addClass('hidden-title');
      else $previewElement.removeClass('hidden-title');
    } else {
      $previewElement.html( previewValue );
    }
  }
}});

function addField(type, typeSpec, typeName)
{
  if( ajaxIsActive ) return;
  mainGridController.add_new_content(mainGridController, type, typeSpec, typeName);
}

function addOption(type)
{
  if( ajaxIsActive ) return;

  var labelEl = $('#field_setting_new_option_label');
  var valueEl = $('#field_setting_new_option_value');
  var label = labelEl.val().replace(/[<>]/g, '');
  var value = valueEl.val().replace(/[^a-zA-Z0-9_]/g, '');

  if( type != 'select' && label == '' ) {
    labelEl.val(label);
    return;
  }

  labelEl.val('');
  valueEl.val('');

  optionsGridController.add_new_content(optionsGridController, label, value);
}

function editOptionForm(event)
{
  var $editingOption = $(event.target).parent().closest('.grid-stack-item');
  var optionId = $editingOption.attr('data-option-id');

  $('#field_setting_edit_option_label').val( $editingOption.find('.option-label').text() );
  $('#field_setting_edit_option_value').val( $editingOption.find('.option-value').text() );
  $('#field_setting_edit_option_option_id').val( optionId );
  $('#edit-option-holder').show();
  $('body').animate({ scrollTop: $('#edit-option-holder').offset().top }, 500);
}

function updateOption(type)
{
  var labelEl = $('#field_setting_edit_option_label');
  var valueEl = $('#field_setting_edit_option_value');
  var optionEl = $('#field_setting_edit_option_option_id');

  var optionId = optionEl.val();
  var $optionRow = $('#options-holder .field-option[data-option-id=' + optionId + ']');
  if( $optionRow.length ) {
    var label = labelEl.val().replace(/[<>]/g, '');
    var value = valueEl.val().replace(/[^a-zA-Z0-9_]/g, '');

    if( type != 'select' && label == '' ) {
      labelEl.val(label);
      return;
    }

    labelEl.val('');
    valueEl.val('');

    $optionRow.find('.option-label').text( label );
    $optionRow.find('.option-value').text( value );
    $('#edit-option-holder').hide();

    $('#options-container').setPreviewFieldValue();
  } else {
    labelEl.val('');
    valueEl.val('');
    optionEl.val('');
    $('#edit-option-holder').hide();
  }
}

function changeRelatingOptions(el)
{
  var val = parseInt($(el).val());
  $('.relating_options_list').hide();

  if( val ) {
    $('#relating_options_container').show();
    $('#field_relating_options_list_' + val).show();
  } else {
    $('#relating_options_container').hide();
  }
}

function changeRequiredCheckbox(el)
{
  var $tooltipHolder = $(el).parent().next('.required-tooltip-text-holder');
  if( !$tooltipHolder.length ) return;

  if( el.checked ) {
    $tooltipHolder.show();
  } else {
    $tooltipHolder.hide();
  }
}

function populateOptions($data, event)
{
  if( ajaxIsActive ) return;

  var $row = $(event.target).parent().closest('.field-option');
  var $optionsContainer = $('#options-container');

  if( $optionsContainer.attr('data-type') == 'field-checkbox-grid' ) {
    if( $row.hasClass('row-checked') ) {
      $row.removeClass('row-checked');
    } else {
      $row.addClass('row-checked');
    }
  } else {
    if( $row.hasClass('row-checked') ) {;
      $optionsContainer.find('.grid-stack-item.row-checked').removeClass('row-checked');
    } else {
      $optionsContainer.find('.grid-stack-item.row-checked').removeClass('row-checked');
      $row.addClass('row-checked');
    }
  }

  $('#options-container').setPreviewFieldValue();
}

function saveFormSettings()
{
  if( ajaxIsActive ) return;

  var form = $('#form-edit-form');
  if( form.length ) {
    var data = new FormData( form[0] );
    data.append('task', 'ajax_form_editor');
    data.append('action', 'save_form_settings');

    $('#easyorder-tabs-loader').show();
    $('body').animate({ scrollTop: $("body").offset().top }, 500);

    var request = ajaxCallForm(globalBaseUrl, data, 'JSON');
    if( request ) {
      request.done(function(response) {
        if( !ajaxCheckResponse(response) ) return;

        if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Your changes have been saved");
      });
    }
  }
}

function reinstallCode()
{
  if( ajaxIsActive ) return;

  $('#instructions-container').addClass('easyorder-disabled');

  var request = ajaxCall(globalBaseUrl, {'task': 'ajax_form_editor',  'action': 'reinstall' });
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      $('#instructions-container').removeClass('easyorder-disabled');
      if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Intall complete");
    });
  }
}