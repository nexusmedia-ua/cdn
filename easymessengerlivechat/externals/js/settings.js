window.document.addEventListener('DOMContentLoaded', run);
var wrapper = '';
var data = [];

function run() {
    wrapper = document.querySelector('.wrapper');
    apiRequest('GET', '&task=get_current_status', getCurrentSettings);
    setEventListener();
    previewDownloadImage();
}

function getCurrentSettings(data) {
    if (data) var settings = data.content;
    if (checkFbStatus(data)) {
        if (typeof settings !== 'undefined') {
            checkMessengerWidgetPosition(typeof settings.position === 'undefined' ? null : settings.position);
            checkSmallIcon(typeof settings.small_icon === 'undefined' ? "true" : settings.small_icon);
            checkBorderColor(typeof settings.border_color === 'undefined' ? null : settings.border_color);
            checkChatTitle(typeof settings.chat_title === 'undefined' ? null : settings.chat_title);
            checkMessageText(typeof settings.message_text === 'undefined' ? null : settings.message_text);
            checkDisplayDelay(typeof settings.display_timeout === 'undefined' ? null : settings.display_timeout);
            checkIcon(typeof settings.icon_image === 'undefined' ? null : settings.icon_image);
            checkStatus(typeof settings.status === 'undefined' ? null : settings.status);
            checkMessengerUserflow(typeof settings.userflow === 'undefined' ? null : settings.userflow)
        } else {
            checkMessengerWidgetPosition();
            checkSmallIcon();
            checkBorderColor();
            checkChatTitle();
            checkMessageText();
            checkDisplayDelay();
            checkIcon();
            checkStatus();
            checkMessengerUserflow()
        }
    }
}

function checkFbStatus(data) {
    if (data && data.content.facebook[0].facebook_enabled !== '0' && wrapper.querySelector('.connect-step2') === null) {
        var contentStep3Blocks = wrapper.querySelectorAll('.connect-step3');
        for (var i = 0; i < contentStep3Blocks.length; i++) {
            contentStep3Blocks[i].style.display = 'block';
        }
        return true;
    }
    return false;
}

function checkStatus(status) {
    var currentStatusText = wrapper.querySelector('.current-status-text');
    var currentStatusBtn = wrapper.querySelector('.enable-disable-button');
    if (status === 1) {
        currentStatusText.innerText = 'enabled';
        currentStatusBtn.innerText = 'Disable';
        displayOtherSettings(status);
    } else {
        currentStatusText.innerText = 'disabled';
        currentStatusBtn.innerText = 'Enable';
        currentStatusBtn.classList.add('btn-primary');
        displayOtherSettings(0);
    }
}

function setEventListener() {
    var messengerPositionBlocks = wrapper.querySelectorAll('.messenger-position'),
        messengerUserflowBlocks = wrapper.querySelectorAll('.messenger-userflow');
    if (wrapper.querySelector('.enable-disable-button')) wrapper.querySelector('.enable-disable-button').addEventListener('click', changeCurrentStatus);
    wrapper.querySelector('#save-button').addEventListener('click', postSettings);
    wrapper.querySelector('.use-fb-icon').addEventListener('click', showFbIcon);
    wrapper.querySelector('.show-messenger-icon').addEventListener('change', displaySmallIcon);
    wrapper.querySelector('.input-chat-icon-border-color').addEventListener('change', changeBorderColor);
    wrapper.querySelector('.input-title-live-chat').addEventListener('keyup', calcLettersInInput);
    for (var i = 0; i < messengerPositionBlocks.length; i++) {
        messengerPositionBlocks[i].addEventListener('click', postSettings);
    }
    for (var i = 0; i < messengerUserflowBlocks.length; i++) {
        messengerUserflowBlocks[i].addEventListener('click', postSettings);
    }
}

function postPosition() {
    var enable_value = [];
    enable_value['position'] = wrapper.querySelector('a.messenger-position.selected').getAttribute('data_position');;
    enable_value['action'] = 'update_position';
    wrapper.querySelector('.loader').style.display = 'block';
    apiRequest('POST', '&task=post_current_status', showSaveConfirmation, enable_value, ifHaveFails, enable_value);
}

function postUserflow() {
    var enable_value = [];
    enable_value['userflow'] = wrapper.querySelector('a.messenger-userflow.selected').getAttribute('data_userflow');
    enable_value['action'] = 'update_userflow';
    wrapper.querySelector('.loader').style.display = 'block';
    apiRequest('POST', '&task=post_current_status', showSaveConfirmation, enable_value, ifHaveFails, enable_value);
}

function changeBorderColor() {
    wrapper.querySelector('.easybot_messenger_button').style.borderColor = '#' + this.value;
}

function displaySmallIcon() {
    var smallIcon = wrapper.querySelector('.easybot_messenger_icon');
    if (smallIcon.getAttribute('data-visible_small_icon') === 'false') {
        smallIcon.setAttribute('data-visible_small_icon', 'true');
    } else {
        smallIcon.setAttribute('data-visible_small_icon', 'false');
    }
}

function previewDownloadImage() {
    wrapper.querySelector('.upload-icon-input').addEventListener('change', function () {
        if (this.files[0]) {
            var fr = new FileReader();
            fr.addEventListener('load', function () {
                wrapper.querySelector('.easybot_messenger_icon_tag').src = fr.result;
            }, false);
            fr.readAsDataURL(this.files[0]);
        }
    });
}

function showFbIcon() {
    wrapper.querySelector('.easybot_messenger_icon_tag').src = wrapper.querySelector('.connect-step3 img').src;
}

function changeCurrentStatus() {
    if (this.innerText === 'Enable') {
        this.innerText = 'Disable';
        this.classList.remove('btn-primary');
        closest(this,'.Polaris-Card').querySelector('.current-status-text').innerText = 'enabled';
        data['status'] = 1;
        displayOtherSettings(data['status']);
    } else {
        this.innerText = 'Enable';
        closest(this,'.Polaris-Card').querySelector('.current-status-text').innerText = 'disabled';
        this.classList.add('btn-primary');
        data['status'] = 0;
        displayOtherSettings(data['status']);
    }
    changeEnabledValue();
}

function changeEnabledValue() {
    var enable_value = [];
    enable_value['status'] = data['status'];
    enable_value['action'] = 'update_enable_value';
    wrapper.querySelector('.loader').style.display = 'block';
    apiRequest('POST', '&task=post_current_status', callback, enable_value, ifHaveFails, enable_value);
}

function callback(savedData) {
    getCurrentSettings(savedData);
    showSaveConfirmation();
}

function getData() {
    data['position'] = wrapper.querySelector('a.messenger-position.selected').getAttribute('data_position');
    data['userflow'] = wrapper.querySelector('a.messenger-userflow.selected').getAttribute('data_userflow');
    if (data['status'] === undefined) {
        data['status'] = 1;
    }
    data['border_color'] = wrapper.querySelector('.input-chat-icon-border-color').value;
    if (wrapper.querySelector('.easybot_messenger_icon_tag').src.indexOf('scontent.xx.fbcdn.net') !== -1) {
        data['icon_image'] = wrapper.querySelector('.easybot_messenger_icon_tag').src;
    } else {
        data['icon_image'] = wrapper.querySelector('.easybot_messenger_icon_tag').src;
    }
    data['chat_title'] = wrapper.querySelector('.input-title-live-chat').value;
    data['message_text'] = wrapper.querySelector('.input-message-text').value;
    data['display_timeout'] = wrapper.querySelector('.input-display-timeout').value;
    data['small_icon'] = (wrapper.querySelector('.easybot_messenger_icon').getAttribute('data-visible_small_icon') === "false") ? 0 : 1;
}

function postSettings() {
    wrapper.querySelector('.jscolor').jscolor.hide();
    if (checkTitle()) {
        getData();
        wrapper.querySelector('.loader').style.display = 'block';
        apiRequest('POST', '&task=post_current_status', callback, data, ifHaveFails, data);
    }
}

function ifHaveFails() {
    ShopifyApp.flashError("Please try later");
}

function checkTitle() {
    if (wrapper.querySelector('.input-title-live-chat').value === '' && wrapper.querySelector('.enable-disable-button') && wrapper.querySelector('.enable-disable-button').innerText === 'Disable') {
        wrapper.querySelector('.tooltip-required-title').style.display = 'block';
        wrapper.querySelector('.input-title-live-chat').classList.add('input-title-required');
        wrapper.querySelector('.input-title-required').addEventListener('focus', cancelRequiredStyle);
        return false;
    } else if (wrapper.querySelector('.input-title-live-chat').value === '' && wrapper.querySelector('.enable-disable-button') && wrapper.querySelector('.enable-disable-button').innerText === 'Enable') {
        wrapper.querySelector('.input-title-live-chat').value = 'Chat with ' + globalShopName;
        return true;
    } else {
        return true;
    }
}

function cancelRequiredStyle() {
    this.classList.remove('input-title-required');
    wrapper.querySelector('.tooltip-required-title').style.display = 'none';
}

function displayOtherSettings(data) {
    var sections = wrapper.querySelectorAll('.other-settings');
    for (var i = 0; i < sections.length; i++) {
        if (data === 1) {
            sections[i].style.display = 'block';
        } else {
            sections[i].style.display = 'none';
        }
    }
}

function checkMessengerWidgetPosition(data) {
    var messengerWidgetPosition = wrapper.querySelectorAll('.messenger-position');
    if (typeof(data) === 'undefined') {
        // messengerWidgetPosition[0].classList.add('selected');
    } else {
        for (var i = 0; i < messengerWidgetPosition.length; i++) {
            if (data === messengerWidgetPosition[i].getAttribute('data_position') && !messengerWidgetPosition[i].classList.contains('selected')) {
                messengerWidgetPosition[i].classList.add('selected');
                messengerWidgetPosition[i - 1].classList.remove('selected');
                break
            } else if (data === messengerWidgetPosition[i].getAttribute('data_position') && !messengerWidgetPosition[i].classList.contains('selected')) {
                messengerWidgetPosition[i].classList.add('selected');
                messengerWidgetPosition[i + 1].classList.remove('selected');
                break
            }
        }
    }
}

function checkMessengerUserflow(userflow) {
    $('.messenger-userflow').removeClass('selected');
    $(wrapper.querySelector('a.messenger-userflow[data_userflow="' + userflow + '"]')).addClass('selected');
}

function checkSmallIcon(iconValue) {
    var smallIcon = wrapper.querySelector('.easybot_messenger_icon');
    if (typeof(iconValue) === 'undefined') {
        smallIcon.setAttribute('data-visible_small_icon', 'true');
    } else {
        if (iconValue === 0) {
            smallIcon.setAttribute('data-visible_small_icon', 'false');
            wrapper.querySelector('.show-messenger-icon').removeAttribute('checked');
        } else {
            smallIcon.setAttribute('data-visible_small_icon', 'true');
            wrapper.querySelector('.show-messenger-icon').setAttribute('checked', "checked");
        }
    }
}

function checkBorderColor(borderColor) {
    if (typeof(borderColor) !== 'undefined') {
        wrapper.querySelector('.input-chat-icon-border-color').value = borderColor;
        wrapper.querySelector('.easybot_messenger_button').style.borderColor = '#' + borderColor;
    } else {
        wrapper.querySelector('.input-chat-icon-border-color').value = '0084ff';
    }
}

function checkChatTitle(title) {
    if (title === '' || typeof(title) === 'undefined') {
        wrapper.querySelector('.input-title-live-chat').value = 'Message us';
    } else {
        wrapper.querySelector('.input-title-live-chat').value = title;
    }
}

function checkMessageText(message) {
    if (message === '' || typeof(message) === 'undefined') {
        wrapper.querySelector('.input-message-text').value = '';
    } else {
        wrapper.querySelector('.input-message-text').value = message;
    }
}

function checkDisplayDelay(delay) {
    if (delay === '' || typeof(delay) === 'undefined') {
        wrapper.querySelector('.input-display-timeout').value = '';
    } else {
        wrapper.querySelector('.input-display-timeout').value = delay;
    }
}

function checkIcon(image) {
    if (!image || image.length === 0) {
        wrapper.querySelector('.easybot_messenger_icon_tag').src = wrapper.querySelector('.connect-step3 table tbody td img').src;
    } else {
        wrapper.querySelector('.easybot_messenger_icon_tag').src = image;
    }
}

function calcLettersInInput() {
    var charactersLeft = 40 - this.value.length;
    wrapper.querySelector('#value-length').innerHTML = 'You have entered ' + this.value.length + " characters, " + charactersLeft + " characters left ";
}

function showSaveConfirmation() {
    ShopifyApp.flashNotice("Settings successfully saved.");
}

function closest(el, selector) {
    var matchesFn;
    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
        if (typeof document.body[fn] === 'function') {
            matchesFn = fn;
            return true;
        }
        return false;
    });
    var parent;
    while (el) {
        parent = el.parentElement;
        if (parent && parent[matchesFn](selector)) {
            return parent;
        }
        el = parent;
    }
    return null;
}