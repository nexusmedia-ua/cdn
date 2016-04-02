"use strict";

var $editingElement = null;
var mainGridController;

$(document).ready(function(){
  $('document').on('click', '.easysearch-disabled', function(e){
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
      $('#easysearch-tabs-loader').show();

      var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_controller', 'action': 'delete_field', 'field_id': fieldId});
      if( request ) {
        request.done(function(response) {
          if( !ajaxCheckResponse(response) ) return;

          $('#easysearch-tabs-loader').hide();
          setTimeout(function(){saveFieldsParams();}, 50);
        });
      }
    }

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

            if( $item.attr('data-field-id') == '0' ) {
              setTimeout(function(){
                  $('#easysearch-tabs-loader').show();

                  var fp = { "y": $item.attr('data-gs-y') || 0 };

                  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_controller', 'action': 'create_field', 'form_id': formId, 'field_params' : fp}, 'JSON');
                  if( request ) {
                    request.done(function(response) {
                      if( !ajaxCheckResponse(response) ) return;
                      if( response.error || !response.data ) window.location.reload();

                      $item.attr('id', response.data.name).attr('data-field-id', response.data.id);
                      $('#easysearch-tabs-loader').hide();
                      $item.initPreviewField();

                      setTimeout(function(){$item.editFieldSettings();}, 50);
                    });
                  }
                }, 50
              );
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
        '  <div class="grid-stack-item" data-bind="attr: { \'id\': $data.field_name, \'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-max-width\': $data.width, \'data-gs-min-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-min-height\': $data.min_height, \'data-gs-auto-position\': $data.auto_position, \'data-field-id\': $data.field_id}">',
        '    <div class="grid-stack-item-content">',
        '      <div class="field-preview"></div>',
        '      <div class="move-icon"></div>',
        '    </div>',
        '    <button class="edit-field" data-bind="click: function(){ $root.edit_field($data, event) }"></button>',
        '    <button class="delete-field" data-bind="click: function(){ $root.delete_field($data, event) }"></button>',
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

  var fieldId = $editingElement.attr('data-field-id');

  $('.grid-stack-item').removeClass('editing');
  $editingElement.addClass('editing');
  $('body').animate({ scrollTop: $("body").offset().top }, 500);

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
  $('#easysearch-tabs-loader').show();

  allFields.each(function(index, item) {
    fp = {
      "y": item.getAttribute('data-gs-y') || 0,
      "field_id": item.getAttribute('data-field-id') || 0
    };

    data.push(fp);
  });

  var request = ajaxCall(globalBaseUrl, {'task' : 'ajax_controller', 'action': 'save_fields', 'form_id': formId, 'data' : data}, 'JSON');
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
  if( ajaxIsActive ) return;
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
          secondary: [
            {
              label: "Restore",
              loading: false,
              callback: function(message, data){ loadCSV(); }
            },
            {
              label: "Clear",
              loading: false,
              callback: function(message, data){ clearDatabase(); }
            }
          ]
        }
      });
    });
  });
}


function fillSelects()
{
  if( !globalDatabaseUrl ) return;
  var selectName = '';

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
            select.sort();
            if( orders[i] == 2 ) select.reverse();
          }

          $.each(select, function(j, value){
            $sel.append('<option>' + value + '</option>');
          });
        });
      }
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