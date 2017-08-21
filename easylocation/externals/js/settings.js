var shopIp = '';

document.addEventListener('DOMContentLoaded', run);
var shopCountry = '';
var shopName = '';

function run() {
    getSettings();
    setFormHandler();
    switchLayout();
    pickAColor();
}

function pickAColor() {
    $(".pick-a-color").pickAColor({
        inlineDropdown: true,
        showAdvanced: false,
        showSavedColors: false
    });
}

function setDefaultColors() {
    var squareColorPreview = document.querySelectorAll('span.color-preview.current-color');
    for (var i = 0; i<squareColorPreview.length; i++){
        var valueColor = closest(squareColorPreview[i],'.input-group').querySelector('input').value;
        squareColorPreview[i].style.backgroundColor = '#'+valueColor;

    }
}

function getShopData(data) {
    if (data !== 'undefined' && data !== null && data.shopdata !== 'undefined' && data.shopdata !== null) {
        shopCountry = data.shopdata.country_name;
        shopIp = data.shopdata.ip;
        shopName = data.shopdata.name;
    }
}

function setFormHandler() {
    document.querySelector('#geo-ip-save').addEventListener('click', function (e) {
        e.preventDefault();
        setRequiredFields();
    });
}

function addSpinnerWhenSaving() {
    var loaderBlock = document.createElement('div');
    loaderBlock.className = 'loader-main';
    loaderBlock.innerHTML = '<div class="loader"><div class="next-spinner"><svg class="next-icon next-icon--40" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div></div>';
    var loader = document.querySelector('.geoip-loader-block');
    loader.innerHTML = '';
    loader.appendChild(loaderBlock);
}

function setRequiredFields() {
    var a = 0;
    var data = getData();
    var inputs = document.querySelectorAll('.geoip-fields');
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            if (inputs[i].value === '') {
                inputs[i].style.borderColor = 'red';
                inputs[i].addEventListener('focus', setStandartBorder.bind(event));
                afterSettingsSaveFail();
            }
        }
        else if (inputs[i].value !== '') {
            a++;
            if (a === inputs.length) {
                addSpinnerWhenSaving();
                apiRequest('POST', '&task=postsettings', afterSettingsSave, data);
            }
        }
    }
}

function setStandartBorder(event) {
    event.target.style.borderColor = '';
}

function getData() {
    var form = document.querySelector('#setting-form');
    var data = [];
    data['redirect_text'] =form.querySelector('#redirect_text').value;
    data['yes'] = form.querySelector('#yes').value;
    data['no'] = form.querySelector('#no').value;
    data['background-color'] =form.querySelector('#background-color').value;
    data['text-color'] =form.querySelector('#text-color').value;
    data['yes-background-color'] =form.querySelector('#yes-background-color').value;
    data['yes-text-color'] =form.querySelector('#yes-text-color').value;
    data['no-background-color'] =form.querySelector('#no-background-color').value;
    data['no-text-color'] = form.querySelector('#no-text-color').value;
    var type = form.querySelector('.layout-selector-selected');
    if (type) {
        data['layout-selector'] = type.getAttribute('data-value');
    }
    return data;
}

function afterSettingsSave() {
    ShopifyApp.flashNotice("Settings successfully saved.");

}

function afterSettingsSaveFail() {
    ShopifyApp.flashError("Settings not saved.");
}

function switchLayout() {
    var layouts = document.querySelectorAll('.layout-selector');
    for (var i = 0; i < layouts.length; i++) {
        layouts[i].addEventListener('click', setActiveLayout);
    }
}

function setActiveLayout() {
    var layouts = document.querySelectorAll('.layout-selector');
    for (var i = 0; i < layouts.length; i++) {
        layouts[i].className = 'layout-selector';
    }
    this.className = "layout-selector layout-selector-selected";
    switchSettings(this.getAttribute('data-value') === 'redirect');
    renderPreview();
}

function getSettings() {
    apiRequest('POST', '&task=getsettings', renderSettings);
}

function renderSettings(data) {
    getShopData(data);
    if (data !== 'undefined' && data !== null && data.content !== 'undefined' && data.content !== null) {
        var keys = Object.keys(data.content);
        for (var i = 0; i < keys.length; i++) {
            var input = document.querySelector('#' + keys[i]);
            if (input !== null) {
                input.value = data.content[keys[i]];
            } else if (keys[i]['layout-selector'] !== '') {
                document.querySelector('.layout-selector[data-value="' + data.content[keys[i]] + '"]').className = "layout-selector layout-selector-selected";
                switchSettings(data.content[keys[i]] === 'redirect');
            }

        }
        addSettingsListener();
        renderPreview();
        setDefaultColors();
    }
    else {
        data.content = {
            'background-color': "0096ff",
            'layout-selector': "top",
            'no': "No, thanks",
            'no-background-color': "005493",
            'no-text-color': "ffffff",
            'redirect_text': "It seems you're in %COUNTRY%. Redirect to %STORENAME%?",
            'text-color': "ffffff",
            'yes': "Yes, please",
            'yes-background-color': "005493",
            'yes-text-color': "ffffff"
        };
        renderSettings(data);
    }
}

function addSettingsListener() {
    var inputs = document.querySelector('section.next-pane__body');
    inputs.addEventListener('input', renderPreview);
    $("input").on("change", function () {
        renderPreview ();
    });
}

function renderPreview() {
    var data = getData();
    setTopTemplate(data);
}

function setTopTemplate(data) {
    var mainTplBlock = document.querySelector('div.geoip-tpl-block div.next-card');
    var topDiv = document.createElement('div');
    topDiv.className = 'geoip-' + data['layout-selector'] + '-banner';
    topDiv.style.backgroundColor ='#' + data['background-color'];
    var dataText = ifRedirectTextEmpty(data);
    var dataYesText = ifYesButtonYesEmpty(data['yes']);
    var dataNoText = ifYesButtonNoEmpty(data['no']);
    if (data['layout-selector'] === 'top') {
        topDiv.style.width = 100 + '%';
        topDiv.style.position = 'absolute';
        mainTplBlock.innerText = '';
        topDiv.innerHTML = '<div class="geoip-main-block"><span style="color:#' + data['text-color'] + '" class="geoip-text-block">' + dataText + '</span><div class = "geoip-button-block"><button style="color:#' + data['yes-text-color'] + ';background-color:#'+ data['yes-background-color'] + '" class="geoip-yes-btn">' + dataYesText + '</button><button  style="color:#' + data['no-text-color'] + ';background-color:#' + data['no-background-color'] + '" class="geoip-no-btn">' + dataNoText + '</button></div></div>';
    } else if (data['layout-selector'] === 'popup') {
        mainTplBlock.innerText = '';
        topDiv.style.width = 40 + '%';
        topDiv.style.height = 30 + '%';
        topDiv.style.position = 'absolute';
        topDiv.style.left = 30 + '%';
        topDiv.style.top = 30 + '%';
        topDiv.innerHTML = '<div class="geoip-main-block"><div class="geoip-text-block" style="color:#' + data['text-color'] + '">' + dataText + '</div><div class="geoip-button-block"><button style="color:#' + data['yes-text-color'] + ';background-color:#' + data['yes-background-color'] + '" class="geoip-yes-btn">' + dataYesText + '</button><button  style="color:#' + data['no-text-color'] + ';background-color:#' + data['no-background-color'] + '" class="geoip-no-btn">' + dataNoText + '</button></div></div><span style="color:#' + data['text-color'] + '" class="geoip-close-icon">&times;</span>';
    } else if (data['layout-selector'] === 'redirect') {
        mainTplBlock.innerHTML = '<span class="instant">Instant Redirect</span>';
    }
    mainTplBlock.appendChild(topDiv);
    if (data['layout-selector'] === 'popup') {
        addPopupStyles(mainTplBlock);
    } else {
        addNoPopupStyles(mainTplBlock);
    }
    addStylesBlock(mainTplBlock);
}
function addPopupStyles(wrapperDiv) {
    wrapperDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
}
function addNoPopupStyles(wrapperDiv) {
    wrapperDiv.style.backgroundColor = 'white';
}

function setStylesToPartsOfText(dataText) {
    var replaced = dataText.replace('%STORENAME%', '<span class="geoip-store-name">' + shopName + '</span>');
        return replaced.replace('%COUNTRY%', '<span class="geoip-country-name">' + shopCountry + '</span>');
}

function ifRedirectTextEmpty(data) {
    if (data['redirect_text'].length !== 0) {
        return setStylesToPartsOfText(data['redirect_text']);
    }
    else {
        return "It seems you're in " + '<span class="geoip-country-name"> %COUNTRY%</span>' + ". Redirect to" + '<span class="geoip-store-name"> %STORENAME%</span>' + "?";
    }
}

function ifYesButtonYesEmpty(data) {
    if (data.length === 0) {
        return "Yes, please";
    }
    else {
        return data;
    }
}

function ifYesButtonNoEmpty(data) {
    if (data.length === 0) {
        return "No, thanks";
    }
    else {
        return data;
    }
}


function addStylesBlock(mainTplBlock) {
    var newStyleTag = document.createElement('style');
    newStyleTag.innerHTML = '.geoip-popup-banner .geoip-main-block button:first-child{ margin-left: 0;} .geoip-top-banner{ text-align:center; background-color: rgb(0, 150, 255);} .geoip-top-banner .geoip-button-block{ display:inline-block; margin: 5px;} .geoip-top-banner .geoip-text-block{ margin-right:20px; color: #ffffff;} .geoip-store-name{ font-weight:bolder; text-decoration: underline;} .geoip-store-name a{ color:inherit} .geoip-country-name{ font-weight:bolder} .geoip-text-block{ line-height:28px; font-size:15px; font-family:sans-serif; margin-right:10px; font-weight:lighter} .geoip-main-block button{ background:none; border:0; font-size:14px; margin-left:10px; cursor:pointer; padding:3px 11px 3px} .geoip-main-block button:hover{ opacity:0.8} .geoip-popup-banner{ margin:auto; width:450px; height:200px; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.1);    background-color: rgb(0, 150, 255);} .geoip-popup-banner .geoip-main-block{ position:relative; top:50%; transform:translateY(-50%)} .geoip-close-icon{ position:absolute; right:10px; top:5px; cursor:pointer;color: white;} .geoip-popup-banner .geoip-text-block{ text-align:center; width:60%; margin:0 auto; line-height:16px; padding-bottom:20px; color: #ffffff;} .geoip-popup-banner .geoip-button-block{ margin:0 auto; text-align:center} .geoip-button-block:first-child{ margin-left:0} .geoip-button-block button{ margin-left:20px; color: #ffffff;background-color: #005493;} @media screen and (max-width:480px){ .geoip-text-block{ width:100%; float:left} .geoip-main-block button{ margin-bottom:10px} .geoip-popup-banner{ width:100%} .geoip-popup-banner .geoip-text-block{ width:100%} }';
    mainTplBlock.appendChild(newStyleTag);
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

function switchSettings(isInstant) {
    if (isInstant) {
        document.getElementById('redirect-text').style.display = 'none';
        document.getElementById('redirect-color').style.display = 'none';
    } else {
        document.getElementById('redirect-text').style.display = 'block';
        document.getElementById('redirect-color').style.display = 'block';
    }
}