"use strict";

var $editingElement = null;

$(document).ready(function(){
});

// +
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

// +
$.fn.extend({initPreviewField : function( fieldType ){
  var $field  = $(this);
  var fieldId = $field.attr('data-field-id');

  var previewItemName  = 'field-preview-item-' + fieldId;
  var previewLabelName = 'field-preview-item-label-' + fieldId;
  var previewLabel, previewItem;

  previewLabel = document.createElement("label");
  previewLabel.setAttribute("id", previewLabelName);
  previewLabel.setAttribute("for", previewItemName);

  switch( fieldType ) {
    case 'heading' :
        previewItem = '';
        previewLabel = document.createElement("h3");
        previewLabel.id = previewLabelName;
        break;

    case 'text'  :
    case 'email' :
        previewItem = document.createElement("input");
        previewItem.type = fieldType;
        break;

    case 'textarea' :
        previewItem = document.createElement("textarea");
        break;

    case 'select' :
        previewItem = document.createElement("select");
        break;

    case 'checkbox' :
        previewItem = document.createElement("div");
        break;

    case 'radio' :
        previewItem = document.createElement("div");
        break;
  }

  if( previewItem ) {
    previewItem.class = "field-preview-item";
    previewItem.id = previewItemName;
  }

  $field.find('.field-preview').append(previewLabel).append(previewItem);
}});

// +
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

// +
$.fn.extend({editFieldSettings : function(){
  if( ajaxIsActive ) return false;

  $editingElement = $(this);

  $('#editor-sidebar-header').hide();
  $('#editor-sidebar-form-holder').hide();
  $('#editor-sidebar-form-loader').show();

  var fieldId = $editingElement.attr('data-field-id');

  $('li.field-row').removeClass('editing');
  $editingElement.addClass('editing');
  $('body').animate({ scrollTop: $("body").offset().top }, 500);

  var request = ajaxCall(
    globalBaseUrl,
    { 'task': 'ajax_get_form', 'id': fieldId },
    { 'response_type': 'html', 'disabled_block': '#template-main > .wrapper' }
  );

  if( request ) {
    request.done(function(response) {
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

// +
function saveFieldSettings()
{
  if( ajaxIsActive || !$editingElement || !$editingElement.length ) return false;

  var $fieldForm = $('#field-edit-form');
  if( $fieldForm.length ) {
    var data = new FormData( $fieldForm[0] );
    data.append('task', 'ajax_controller');
    data.append('action', 'save_field_settings');

    var $options = $('#options-holder .option-row');
    $options.each(function(index, item) {
      if( item.getAttribute('data-option-id') ) {
        var name = "field_setting_options[" + item.getAttribute('data-option-id') + "]";
        data.append(name + "[label]", $(item).find('.option-title').text());
        data.append(name + "[checked]", ($(item).hasClass('row-checked') ? 1 : 0));
      }
    });

    $('#editor-sidebar-form-loader').show();
    $('#editor-sidebar-form-holder').hide();

    var request = ajaxCallForm(globalBaseUrl, data, { 'disabled_block': '#template-main > .wrapper' });
    if( request ) {
      request.done(function(response) {
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

// +
function cancelEditField()
{
  closeEditFieldForm();
}

// +
function saveFieldsParams()
{
  if( ajaxIsActive ) ajaxIsActive = false;

  var $li = $("#fields-holder > li");
  var data = [];

  $('#easyorder-tabs-loader').show();
  $li.each(function(i, item) {
    data.push({ "y": i, "field_id": item.getAttribute('data-field-id') || 0 });
  });

  var request = ajaxCall(
    globalBaseUrl,
    { 'task': 'ajax_controller', 'action': 'save_fields', 'data' : data },
    { 'disabled_block': '#template-main > .wrapper' }
  );

  if( request ) {
    request.done(function(response) {
      $('#easyorder-tabs-loader').hide();
    });
  }
}

// +
function editField( btn )
{
  var $el = $(btn).parent().closest('li.field-row');
  $el.editFieldSettings();
}

// +
function deleteField( fieldId )
{
  if( !fieldId ) return;

  if( isset(ShopifyApp) ) {
    ShopifyApp.Modal.confirm('Are you sure?', function(result){ if(result) _deleteField(); } );
  } else {
    if( confirm('Are you sure?') ) _deleteField();
  }

  var _deleteField = function(){
    $('#fields-holder > li[data-field-id=' + fieldId + ']').remove();
    closeEditFieldForm();

    $('#easyorder-tabs-loader').show();
    var request = ajaxCall(
      globalBaseUrl,
      { 'task': 'ajax_controller', 'action': 'delete_field', 'field_id' : fieldId },
      { 'disabled_block': '#template-main > .wrapper' }
    );

    if( request ) {
      request.done(function(response) {
        $('#easyorder-tabs-loader').hide();
      });
    }
  }
}

// +
function closeEditFieldForm()
{
  $('#editor-sidebar-form-holder').empty();
  $('#editor-sidebar-header').show();

  if( $editingElement ) {
    $editingElement.removeClass('editing');

    var fieldId = $editingElement.attr('data-field-id');
    var request = ajaxCall(
      globalBaseUrl,
      { 'task': 'ajax_get_form', 'id': fieldId },
      { 'response_type': 'html', 'disabled_block': '#template-main > .wrapper' }
    );

    if( request ) {
      request.done(function(response) {
        if( response ) {
          $('#editor-sidebar-form-holder').hide().html(response).show();

          $('[data-form]').each(function(i, val){
            $(this).setPreviewFieldValue();
          });
          if( $('#options-container').length ) {
            $('#options-container').setPreviewFieldValue();
          }

          $('#editor-sidebar-form-holder').empty().show();
        }
      });
    }
  }
  $editingElement = null;
}

// +
$.fn.extend({setPreviewFieldValue : function(){
  var $self = $(this);
  var previewSelector = $self.attr('data-preview-selector');
  var previewType     = $self.attr('data-type');
  var previewValue    = $self.val();
  var $previewElement = $(previewSelector);

  if( $previewElement.length ) {
    if( previewType == "simple-select" ) {
      $previewElement.empty();
      $previewElement.html($self.html());
      $previewElement.val($self.val());

    } else if( previewType == "select" ) {
      $previewElement.empty();

      var $rows = $self.find('.option-row');
      $.each($rows, function(index, o) {
        var selected = $(o).hasClass('row-checked') ? ' selected' : '';
        $previewElement.append("<option" + selected + ">" + $(o).find('.option-title').html() + "</option>");
      });

    } else if( previewType == "checkbox" ) {
      $previewElement.empty();

      var $rows = $self.find('.option-row');
      $.each($rows, function(index, o) {
        var checked = $(o).hasClass('row-checked') ? ' checked' : '';
        $previewElement.append("<div class='preview-checkbox-holder'><input type='checkbox' " + checked + " /><label>" + $(o).find('.option-title').html() + "</label></div>");
      });

    } else if( previewType == "radio" ) {
      $previewElement.empty();

      var fieldId = $('#edited-field-id').val();
      var $rows = $self.find('.option-row');
      $.each($rows, function(index, o) {
        var checked = $(o).hasClass('row-checked') ? ' checked' : '';
        $previewElement.append("<div class='preview-radio-holder'><input type='radio' name='radiogroup" + fieldId + "' " + checked + " /><label>" + $(o).find('.option-title').html() + "</label></div>");
      });

    } else if( previewType == "required" ) {
      if( $self.prop('checked') ) $previewElement.addClass('required');
      else $previewElement.removeClass('required');

    } else if( previewType == "placeholder" ) {
      $previewElement.attr( 'placeholder', previewValue );

    } else if( previewType == 'hide-title' ) {
      if( $self.prop('checked') ) $previewElement.addClass('hidden-title');
      else $previewElement.removeClass('hidden-title');

    } else {
      $previewElement.text( previewValue );
    }
  }
}});

// +
function addField( type, typeSpec, typeName )
{
  if( ajaxIsActive ) return;

  $('#easyorder-tabs-loader').show();
  var request = ajaxCall(
    globalBaseUrl,
    { 'task': 'ajax_controller', 'action': 'create_field', 'field_type': type, 'field_type_spec': typeSpec },
    { 'disabled_block': '#template-main > .wrapper' }
  );

  if( request ) {
    request.done(function(response) {
      if( response.error || !response.data ) window.location.reload();

      $('#easyorder-tabs-loader').hide();
      var $li = $('<li class="field-row ' + type + '-row ui-sortable-handle"></li>').attr('data-field-id', response.data.id);
      $li.append([
        '<div class="field-preview"></div>',
        '<div class="field-actions">',
        '  <button class="info-field tooltip-holder">',
        '    <i class="fa fa-question"></i>',
        '    <div class="tool-tip">' + typeName + '</div>',
        '  </button>',
        '  <button class="edit-field" onclick="editField(this)">',
        '    <i class="fa fa-gear"></i>',
        '  </button>',
        '  <button class="delete-field" onclick="deleteField(' + response.data.id + ')">',
        '    <i class="fa fa-close"></i>',
        '  </button>',
        '  <i class="fa fa-arrows"></i>',
        '</div>'
      ].join(''));

      $li.initPreviewField(type);
      $('#fields-holder').append($li);

      setTimeout(function(){ $li.editFieldSettings(); }, 50);
    });
  }
}

// +
function initOptionsGrid()
{
  var $optionsEl = $('#options-holder');
  if( !$optionsEl.length ) return;

  var fieldsList = $optionsEl.sortable({
    update: function( ) {
      $('#options-container').setPreviewFieldValue();
    }
  });
}

// +
function addOption(type)
{
  var $labelEl = $('#new-option-label');
  var labelText = escapeHtml( $labelEl.val() );
  if( labelText == '' ) return;

  var id = getTimedId('new_');
  $labelEl.val('');

  $('#options-holder').append([
    '<li class="option-row" data-option-id="' + id + '">',
    '  <div class="option-title">' + labelText + '</div>',
    '    <div class="option-actions">',
    '      <button class="check-option" onclick="populateOptions(this)"><i class="fa fa-check"></i></button>',
    '      <button class="edit-option" onclick="editOption(this)"><i class="fa fa-gear"></i></button>',
    '      <button class="delete-option" onclick="deleteOption(this)"><i class="fa fa-close"></i></button>',
    '      <i class="fa fa-arrows"></i>',
    '    </div>',
    '</li>'
  ].join(''));

  $('#options-container').setPreviewFieldValue();
}

// +
function editOption(el)
{
  var $editingOption = $(el).parent().closest('li.option-row');
  var optionId = $editingOption.attr('data-option-id');
  var $form = $('#edit-option-holder');

  $editingOption.append($form.show());

  $('#edit-option-label').val( $editingOption.find('.option-title').text() );
}

// +
function deleteOption(el)
{
  $(el).parent().closest('.option-row').remove();
  $('#options-container').setPreviewFieldValue();
}

// +
function updateOption(el)
{
  var $labelEl = $('#edit-option-label');
  var labelText = escapeHtml( $labelEl.val() );
  if( labelText == '' ) return;

  var $row = $(el).parent().closest('.option-row');
  if( !$row.length ) return;

  $row.find('.option-title').html( labelText );

  $('#options-container').setPreviewFieldValue();
  cancelOption();
}

// +
function cancelOption()
{
  $('#edit-option-label').empty();
  $('#edit-option-holder').hide();
}

// +
function changeRelatingOptions(el)
{
  var val = parseInt($(el).val());
  $('.relating-options-list').hide();

  if( val && $('#field-relating-options-list-' + val).length ) {
    $('#relating-options-container').show();
    $('#field-relating-options-list-' + val).show();
  } else {
    $('#relating-options-container').hide();
  }
}

// +
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

function populateOptions( el )
{
  var $row = $(el).parent().closest('.option-row');
  var $optionsContainer = $('#options-container');

  if( $optionsContainer.attr('data-type') == 'checkbox' ) {
    if( $row.hasClass('row-checked') ) {
      $row.removeClass('row-checked');
    } else {
      $row.addClass('row-checked');
    }
  } else {
    if( $row.hasClass('row-checked') ) {;
      $optionsContainer.find('.row-checked').removeClass('row-checked');
    } else {
      $optionsContainer.find('.row-checked').removeClass('row-checked');
      $row.addClass('row-checked');
    }
  }

  $optionsContainer.setPreviewFieldValue();
}

function saveFormSettings()
{
  if( ajaxIsActive ) return;

  var form = $('#form-edit-form');
  if( form.length ) {
    var data = new FormData( form[0] );
    data.append('task', 'ajax_controller');
    data.append('action', 'save_form_settings');

    $('#easyorder-tabs-loader').show();
    $('body').animate({ scrollTop: $("body").offset().top }, 500);

    var request = ajaxCallForm(globalBaseUrl, data, { 'disabled_block': '#template-settings > .wrapper' });
    if( request ) {
      request.done(function(response) {
        $('#easyorder-tabs-loader').hide();
        if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Your changes have been saved");
      });
    }
  }
}

function reinstallCode()
{
  if( ajaxIsActive ) return;

  var request = ajaxCall(
    globalBaseUrl,
    { 'task': 'ajax_controller', 'action': 'reinstall' },
    { 'disabled_block': '#instructions-container' }
  );

  if( request ) {
    request.done(function(response) {
      if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Install complete");
    });
  }
}