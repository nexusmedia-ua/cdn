"use strict";

var $editingElement = null;
var mainGridController;

$(document).ready(function(){
  $('document').on('click', '.easysearch-disabled', function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
  });
});

function mainController(widgets)
{
  var self = this;
  this.widgets = ko.observableArray(widgets);

  this.add_new_content = function(controller) {
    if( ajaxIsActive ) return false;

    var h = globalGridOptions.base;

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
      auto_position: true
    });
  };
};

function editField(el)
{
  if( ajaxIsActive ) return;

  var $ff = $(el).parent().closest('.form-field');
  $ff.editFieldSettings();
}

function deleteField(el)
{
  if( ajaxIsActive ) return;

  if( isset(ShopifyApp) ) {
    ShopifyApp.Modal.confirm('Are you sure?', function(result){ if(result) _deleteField(el); } );
  } else {
    if( confirm('Are you sure?') ) _deleteField(el);
  }

  var _deleteField = function(el){
    var $deletingElement = $(el).parent().closest('.grid-stack-item');
    var fieldId = $deletingElement.attr('data-field-id');
    var $gridStack = $(el).parent().closest('.grid-stack');

    closeEditFieldForm();

    $gridStack.data('gridstack').remove_widget($deletingElement[0], true);
    $('#easysearch-tabs-loader').show();
    saveFieldsParams(fieldId);
  }
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
            $item.initPreviewField();

            if( $item.attr('data-field-id') == '0' ) {
              setTimeout(function(){$item.editFieldSettings();}, 50);
            }
          };
        };

        return new ViewModel(controller, componentInfo);
      }
    },
    template:
      [
        '<div class="grid-stack" data-bind="foreach: {data: widgets, afterRender: afterAddWidget}">',
        '  <div class="grid-stack-item" data-bind="attr: { \'id\': $data.field_name, \'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-max-width\': $data.width, \'data-gs-min-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-min-height\': $data.min_height, \'data-gs-auto-position\': $data.auto_position, \'data-field-id\': $data.field_id}">',
        '    <div class="grid-stack-item-content">',
        '      <div class="field-preview"></div>',
        '      <div class="move-icon"></div>',
        '    </div>',
        '    <button class="edit-field" onclick="editField(this);"></button>',
        '    <button class="delete-field" onclick="deleteField(this);"></button>',
        '  </div>',
        '</div>'
      ].join('')
  });
}

$.fn.extend({initPreviewField : function(){
  var $field  = $(this);
  var fieldId = $field.attr('data-field-id');
  var settings;

  if( formFieldsSettings[fieldId] ) {
    settings = formFieldsSettings[fieldId];
    delete formFieldsSettings[fieldId];
  } else {
    settings = [];
  }

  var fieldHideTitle = parseInt(settings['hide_title']) || 0;

  var previewItemName  = 'field-preview-item-' + fieldId;
  var previewLabelName = 'field-preview-item-label-' + fieldId;
  var previewLabel, previewItem;

  previewLabel = document.createElement("label");
  previewLabel.setAttribute("id", previewLabelName);
  previewLabel.setAttribute("for", previewItemName);

  previewLabel.innerHTML = settings['title'] || '';
  if( fieldHideTitle ) {
    previewLabel.className += " hidden-title";
  }

  previewItem = document.createElement("select");
  previewItem.innerHTML += "<option class='placeholder' selected>" + (settings['placeholder'] || '') + "</option>";

  if( !empty(settings['options']) ) {
    $.each(settings['options'], function(index, o) {
      var selected = (parseInt(o.checked) ? ' selected' : '');
      previewItem.innerHTML += "<option" + selected + ">" + o.label + "</option>";
    });
  }

  previewItem.class = "field-preview-item";
  previewItem.id = previewItemName;

  $field.find('.field-preview').append(previewLabel).append(previewItem);
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

  var fieldId = parseInt($editingElement.attr('data-field-id'));

  $('.grid-stack-item').removeClass('editing');
  $editingElement.addClass('editing');
  $('body').animate({ scrollTop: $("body").offset().top }, 500);

  $('#fields-holder').addClass('easysearch-disabled');
  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_get_form', 'type': 'field', 'id': fieldId});
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;
      if( !response ) {
        closeEditFieldForm();
        return;
      }

      $('#editor-sidebar-form-loader').hide();
      $('#editor-sidebar-form-holder').html(response).show();
      if( fieldId ) {
        $('#fields-holder').removeClass('easysearch-disabled');
      }

      bindFieldPreview();
    });
  }
}});

function saveFieldSettings()
{
  if( ajaxIsActive || !$editingElement || !$editingElement.length ) return false;

  var fieldForm = $('#field-edit-form');
  if( fieldForm.length ) {
    var data = new FormData( fieldForm[0] );
    data.append('task', 'ajax_controller');
    data.append('action', 'save_field_settings');
    data.append('field_setting_position', $editingElement.attr('data-gs-y') || 0);

    $('#editor-sidebar-form-loader').show();
    $('#editor-sidebar-form-holder').hide();

    var request = ajaxCallForm(globalBaseUrl, data, 'JSON', '#fields-holder');
    if( request ) {
      request.done(function(response) {
        if( !ajaxCheckResponse(response) ) return;

        $('#editor-sidebar-form-loader').hide();
        if( !response.error ) {
          $editingElement.attr('id', response.data.name).attr('data-field-id', response.data.id);
          $editingElement.find('label').attr('id', 'field-preview-item-label-' + response.data.id).attr('for', 'field-preview-item-' + response.data.id);
          $editingElement.find('select').attr('id', 'field-preview-item-' + response.data.id);

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
  if( $editingElement && $editingElement.length && !parseInt($editingElement.attr('data-field-id')) ) {
    var $gridStack = $editingElement.closest('.grid-stack');
    $gridStack.data('gridstack').remove_widget($editingElement[0], true);
    $('#fields-holder').removeClass('easysearch-disabled');
  }
  closeEditFieldForm();
}

function saveFieldsParams(removedFieldID)
{
  if( ajaxIsActive ) ajaxIsActive = false;

  removedFieldID = removedFieldID || 0;
  var allFields = $('#fields-holder .form-field');
  var fp, data = [];
  $('#easysearch-tabs-loader').show();

  allFields.each(function(index, item) {
    fp = {
      "y": item.getAttribute('data-gs-y') || 0,
      "field_id": item.getAttribute('data-field-id') || 0
    };

    data.push(fp);
  });

  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_controller', 'action': 'save_fields', 'form_id': formId, 'removed_field_id': removedFieldID, 'data' : data}, 'JSON', '', '#fields-holder');
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;
      $('#easysearch-tabs-loader').hide();
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
    if( previewType == 'field-hide-title' ) {
      if( $self.prop('checked') ) $previewElement.addClass('hidden-title');
      else $previewElement.removeClass('hidden-title');
    } else if( previewType == 'field-sort-order' ) {
      var i = $previewElement.parent().closest('.form-field').attr('data-gs-y');
      if( typeof selects[i] !== 'undefined' ) {
        var select = JSON.parse(JSON.stringify(selects[i]));
        if( previewValue == 1 ) select.sort();
        else if( previewValue == 2 ) select.reverse();
        $previewElement.children().not('.placeholder').remove();
        $.each(select, function(j, value){
          $previewElement.append('<option>' + value + '</option>');
        });
      }
    } else {
      $previewElement.text( previewValue );
    }
  }
}});

function addField()
{
  if( ajaxIsActive || $('#fields-holder .grid-stack-item[data-field-id=0]').length ) return;
  mainGridController.add_new_content(mainGridController);
}


// Database Editor
function loadCSV( noAlert, url )
{
  var noAlert = noAlert || false;
  var url = url || globalDatabaseUrl;
  if( !url ) return;

  $('#easysearch-tabs-loader').show();
  Papa.parse(url, {
    download: true,
    header: false,

    complete: function(resp){
      $('#easysearch-tabs-loader').hide();

      if( typeof resp !== 'undefined' && typeof resp.data !== 'undefined' ) {
        excelTable.loadData(resp.data);
        excelTable.render();
        if( !noAlert && isset(ShopifyApp) ) ShopifyApp.flashNotice("Database loaded");
      } else {
        excelTable.loadData([]);
        excelTable.render();
      }
    },
    error: function() {
      $('#easysearch-tabs-loader').hide();
      excelTable.loadData([]);
      excelTable.render();
    }
  });
}

function saveCSV()
{
  var sel = excelTable.getSelected();
  if( sel ) excelTable.selectCell(sel[0],sel[1]);

  var csv = Papa.unparse(excelTable.getData());

  $('#easysearch-tabs-loader').show();
  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_controller', 'action': 'save_database', 'content': csv}, 'JSON');
  if( request ) {
    request.done(function(response) {
      if( !ajaxCheckResponse(response) ) return;

      if( response.data && response.data.url ) {
        $('#export-link').attr('href', response.data.url).show();
      } else {
        $('#export-link').attr('href', 'javascript:void(0);').hide();
      }

      $('#easysearch-tabs-loader').hide();
      if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Database saved");
    });
  }
}

function clearDatabase()
{
  excelTable.loadData([]);
  excelTable.render();
}

var excelTableHolder;
function initExcelTable()
{
  $(function () {
    excelTableHolder = document.getElementById('database-holder');
    excelTable = new Handsontable(excelTableHolder, {
      height: 320,
      data: [[]],
      colHeaders: databaseHeaders,
      rowHeaders: true,
      columns: databaseColumns,
      minSpareCols: 0,
      minSpareRows: 1,
      startCols: columnsCount,
      contextMenu: ['row_above', 'row_below', 'remove_row', '---------', 'undo', 'redo'],
      stretchH: 'all',
      debug: false
    });

    $('#import-button').click(function(){
      var $file = $('#import-file');
      if( !$file.val() || $file.val().toLowerCase().substr(-4) != '.csv' ) return;

      $('#import-box').hide();
      $('#easysearch-tabs-loader').show();

      $file.parse({
        config: {
          header: false,

          complete: function(resp){
            $('#easysearch-tabs-loader').hide();
            if( typeof resp !== 'undefined' && typeof resp.data !== 'undefined' ) {
              excelTable.loadData(resp.data);
              excelTable.render();

              if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Database loaded");
              $file.val('');
            }
          }
        },

        error: function(err, file, inputElem, reason){
          $('#easysearch-tabs-loader').hide();
          if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Invalid Import");
        }
      });
    });

    loadCSV( true );

    ShopifyApp.ready(function(){
      ShopifyApp.Bar.initialize({
        buttons: {
          primary: [
            { label: "Save",
              loading: false,
              callback: function(message, data){ saveCSV(); }
            }
          ],
          secondary: [{
            label: 'More Apps...',
            href: globalAppStoreMoreUrl,
            target: '_blank'
          },{
            label: "Restore",
            loading: false,
            callback: function(message, data){ loadCSV(); }
          },{
              label: "Clear",
              loading: false,
              callback: function(message, data){ clearDatabase(); }
          }]
        }
      });
    });
  });
}


function fillSelects()
{
  if( !globalDatabaseUrl ) return;
  var selectName = '';

  $('#fields-holder').addClass('easysearch-disabled');
  $('#easysearch-tabs-loader').show();

  Papa.parse(globalDatabaseUrl, {
    download: true,
    header: false,
    skipEmptyLines: true,

    complete: function(resp){
      if( typeof resp !== 'undefined' && typeof resp.data !== 'undefined' ) {
        $.each(resp.data, function(rowI, row){
          var i = 0;
          $.each(row, function(field, value){
            if( value && typeof selects[i] === 'object' && $.inArray(value, selects[i]) === -1 ) {
              selects[i].push(value);
            }
            i++;
          });
        });

        var s = JSON.parse(JSON.stringify(selects));
        $.each(s, function(i, select){
          var $sel = $('#fields-holder .form-field:eq(' + i + ') select');
          if( typeof orders[i] !== 'undefined' && orders[i]) {
            select.sort();
            if( orders[i] == 2 ) select.reverse();
          }

          $.each(select, function(j, value){
            $sel.append('<option>' + value + '</option>');
          });
        });
      }

      $('#fields-holder').removeClass('easysearch-disabled');
      $('#easysearch-tabs-loader').hide();
    },
    error: function() {}
  });
}


// Instalation Settings

function saveInstallationSettings()
{
  if( ajaxIsActive ) return;

  var form = $('#form-installation');
  if( form.length ) {
    var data = new FormData( form[0] );
    data.append('task', 'ajax_controller');
    data.append('action', 'save_installation_settings');

    $('#easysearch-tabs-loader').show();

    var request = ajaxCallForm(globalBaseUrl, data, 'JSON');
    if( request ) {
      request.done(function(response) {
        if( !ajaxCheckResponse(response) ) return;

        if( isset(ShopifyApp) ) ShopifyApp.flashNotice("Saved");
      });
    }
  }
}