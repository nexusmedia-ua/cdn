function initConnectPage( initData )
{
  toggleStatusBar( initData.status );

  // userflow
  if( typeof initData.userflow != 'undefined' ) {
    $('.messenger-userflow[data-userflow="' + initData.userflow + '"]').addClass('selected');
    $('.advanced-settings').toggle( (initData.userflow !== 2) );
  }

  // message text
  if( typeof initData.message_text != 'undefined' ) {
    $('#input-message-text').val( initData.message_text );
  }

  // display timeout
  if( typeof initData.display_timeout != 'undefined' ) {
    $('#input-display-timeout').val( initData.display_timeout );
  }

  // button icon
  if( typeof initData.icon_image != 'undefined' && initData.icon_image ) {
    $('.messenger-button-avatar').attr('src', initData.icon_image);
  } else {
    $('.messenger-button-avatar').attr('src', $('#fb-avatar').attr('src'));
  }

  // button small icon
  $('.easybot_messenger_icon').toggleClass( 'hidden', !initData.small_icon );
  $('#show-messenger-icon').prop('checked', !!initData.small_icon );

  // chat title
  if( typeof initData.chat_title != 'undefined' ) {
    $('#input-title-live-chat').val( initData.chat_title );
  }

  // border color
  if( typeof initData.border_color != 'undefined' ) {
    $('#input-chat-icon-border-color').val( initData.border_color );
    $('.easybot-messenger-button').css('border-color', '#' + initData.border_color);
  }

  // reply text
  if( typeof initData.reply_text != 'undefined' ) {
    $('#input-reply-text').val( initData.reply_text );
  }

  // position
  if( typeof initData.position != 'undefined' ) {
    $('.messenger-position[data-position="' + initData.position + '"]').addClass('selected');
  }


  initSymbolCounter($('#input-title-live-chat'), 40);
  initSymbolCounter($('#input-reply-text'), 40);

  // event listeners
  $('body').on('click', '.messenger-userflow', changeUserflow);
  $('body').on('click', '.messenger-position', changePosition);
  $('body').on('click', '.enable-disable-button', changeCurrentStatus);

  $('body').on('click', '.use-fb-icon', function(){
    $('.messenger-button-avatar').attr('src', $('#fb-avatar').attr('src'));
  });

  $('body').on('change', '#show-messenger-icon', function(){
    $('.easybot_messenger_icon').toggleClass('hidden', !this.checked);
  });

  $('body').on('change', '#input-chat-icon-border-color', function(){
    $('.easybot-messenger-button').css('border-color', '#' + this.value);
  });

  $('body').on('change', '.upload-icon-input', function(){
    if( this.files[0] ) {
      var fr = new FileReader();
      fr.addEventListener('load', function(){
        $('.messenger-button-avatar').attr('src', fr.result);
      }, false);
      fr.readAsDataURL(this.files[0]);
    }
  });

  $('body').on('focus', 'input[type=text]', function(){
    $(this).removeClass('error-field');
    $('.form-field-error[rel=' + this.id + ']').hide();
  });
}

// +
function toggleStatusBar( status )
{
  if( status === 1 ) {
    $('.current-status-text').text('enabled');
    $('.enable-disable-button').removeClass('Polaris-Button--primary').find('.button-label').text('Disable');

  } else {
    $('.current-status-text').text('disabled');
    $('.enable-disable-button').addClass('Polaris-Button--primary').find('.button-label').text('Enable');
  }

  $('.settings-block').toggle( !!status );
}

// +
function changeCurrentStatus()
{
  var status = $('.current-status-text').text() == 'disabled' ? 1 : 0;
  toggleStatusBar( status );

  saveSingleSetting('status', status);
}

// +
function changeUserflow( e )
{
  var $el = $(e.currentTarget);
  $('.messenger-userflow').removeClass('selected');
  $el.addClass('selected');

  var value = $el.attr('data-userflow') ? parseInt($el.attr('data-userflow')) : 0;
  $('.advanced-settings').toggle( (value !== 2) );

  saveSingleSetting('userflow', value);
}

// +
function changePosition( e )
{
  var $el = $(e.currentTarget);
  $('.messenger-position').removeClass('selected');
  $el.addClass('selected');

  var value = $el.attr('data-position') ? $el.attr('data-position') : 'bottom';

  saveSingleSetting('position', value);
}

// +
function saveSingleSetting( field, value )
{
  var request = ajaxCall(
    globalBaseUrl,
    { task : 'ajax_controller', action: 'update_single_setting', field: field, value: value },
    { disabled_block: '.template-connect > .wrapper' },
    successNotification,
    failtureNotification
  );
}

// +
function saveSeveralSettings()
{
  if( $.trim($('#input-title-live-chat').val()) == '' ) {
    $('#input-title-live-chat').addClass('error-field');
    $('.form-field-error[rel=input-title-live-chat]').show();
    return false;
  }

  var settings = {};

  settings['message_text'] = $('#input-message-text').val();
  settings['display_timeout'] = $('#input-display-timeout').val();

  settings['icon_image'] = $('.messenger-button-avatar').attr('src').indexOf('scontent.xx.fbcdn.net') === -1 ? $('.messenger-button-avatar').attr('src') : '';
  settings['small_icon'] = $('#show-messenger-icon').prop('checked') ? 1 : 0;

  settings['chat_title'] = $('#input-title-live-chat').val();
  settings['border_color'] = $('#input-chat-icon-border-color').val();
  settings['reply_text'] = $('#input-reply-text').val();

  var request = ajaxCall(
    globalBaseUrl,
    { task : 'ajax_controller', action: 'update_several_settings', settings: settings },
    { disabled_block: '.template-connect > .wrapper' },
    successNotification,
    failtureNotification
  );
}

function successNotification()
{
  ShopifyApp.flashNotice("Settings successfully saved.");
}

function failtureNotification()
{
  ShopifyApp.flashError("Please try later");
}