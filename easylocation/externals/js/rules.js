var firstBlock = document.querySelector('html');
showLoaderWhenPageLoad(firstBlock);
document.addEventListener('DOMContentLoaded', getRules);
window.rulesJSON = null;

function getRules() {
    apiRequest('GET', '&task=rules', renderRules);
}

function renderRules(rulesJSON) {
    window.rulesJSON = rulesJSON;
    document.querySelector('#rules tbody').innerHTML = '';
    document.querySelector('.next-card').style.display = 'block';
    var rules = rulesJSON.content;
    if (rules === null || rules.length === 0) {
        setStartPage();
    }
    if (rules) {
        for (var i = 0; i < rules.length; i++) {
            createRule(rules[i]);
        }
    }
}

function setStartPage() {
    var mainBlock = document.querySelector('.section-table');
    if (mainBlock.querySelector('#tbody').rows.length - 1 === 0 || mainBlock.querySelector('#tbody').rows.length - 1 === -1) {
        mainBlock.querySelector('.start-section').style.display = 'block';
        mainBlock.querySelector('.next-card').style.display = 'none';
    }
}

function createRule(item) {
    var countries = item.countries,
        ip = item.ip,
        countriesList = '',
        ipList = '';
    if (Array.isArray(item.ip)) {
        var ip = item.ip;
    } else {
        var ip = item.ip.split(",");
    }
    for (var i = 0; i < countries.length; i++) {
        if (countries[i] !== "") {
            countriesList += '<span><span class="title country-title">' + countries[i] + '</span></span>'
        }
    }
    for (var i = 0; i < ip.length; i++) {
        ipList += '<span><span class="title ip-title">' + ip[i] + '</span></span>'
    }
    var switchClass = '';
    if (item.enabled === '1') {
        switchClass = 'on';
    }
    else {
        switchClass = 'off';
    }
    var child = document.createElement('tr');
    if (ip[0] === "") {
        var values = countriesList;
    } else {
        var values = countriesList + ipList;
    }

    if (item.link === 'about:blank') {
        var linkValue = '<span class="redirect-value">Blocked</span>';
    } else {
        var linkValue = '<a target="_blank" href="' + item.link + '" class="redirect-value">' + item.link + '</a>';
    }
    child.innerHTML = '<td class="text-left draggable"><i class="fa fa-bars handle"></i></td><td class="text-left switch"><span class="layout-item-status tooltip-holder layout-disabled" data-status="' + item.enabled + '" onclick="layoutStatusToggle(this);"><i class="fa fa-toggle-' + switchClass + '"></i></span></td><td class="input-countries"><div class="tag green-tag">' + values + '</div></td><td class="input-store-name"><span>' + item.store_name + '</span></td><td class="redirect-to-block">'+ linkValue +'</td><td class="text-right nowrap button-save-and-delete"><button class="btn btn-edit">Edit</button><button class="btn delete-btn" onclick="deleteNode(this);">&times;</button></td>';
    if (item.link === 'about:blank') {
        child.setAttribute('data-is_blocked', true);
    }
    child.setAttribute('data-is_domain_redirect', (item.domain_redirect === '1'));
    child.setAttribute('data-is_edit_mode', false);
    child.className = 'dragable';
    child.id = item.id;
    child.setAttribute('data-rule-id', item.id);
    document.querySelector('#rules tbody').appendChild(child);
    child.querySelector('button.btn-edit').addEventListener('click', changeToEditUI);
}

var availableTags = ['All countries', 'Africa', 'Asia', 'Australia', 'Europe', 'South America', 'North America', 'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua & Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Ascension Island', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia & Herzegovina', 'Botswana', 'Brazil', 'British Indian Ocean Territory', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Canary Islands', 'Cape Verde', 'Caribbean Netherlands', 'Cayman Islands', 'Central African Republic', 'Ceuta & Melilla', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo - Brazzaville', 'Congo - Kinshasa', 'Cook Islands', 'Costa Rica', 'Côte d’Ivoire', 'Croatia', 'Cuba', 'Curaçao', 'Cyprus', 'Czech Republic', 'Denmark', 'Diego Garcia', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong SAR China', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau SAR China', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar (Burma)', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'North Korea', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestinian Territories', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn Islands', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Réunion', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', 'São Tomé & Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia & South Sandwich Islands', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'St. Barthélemy', 'St. Helena', 'St. Kitts & Nevis', 'St. Lucia', 'St. Martin', 'St. Pierre & Miquelon', 'St. Vincent & Grenadines', 'Sudan', 'Suriname', 'Svalbard & Jan Mayen', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad & Tobago', 'Tristan da Cunha', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks & Caicos Islands', 'Tuvalu', 'U.S. Outlying Islands', 'U.S. Virgin Islands', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Wallis & Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'];

function addCountryBlock() {
    var tr = this.closest('tr');
    var singleValues = tr.querySelector('.inputAutocomplete').value;
    var tagEditBlock = tr.querySelector('.tag-edit');
    var countryExist = checkIfCountryAlredyExist(tagEditBlock, singleValues);
    if (singleValues !== '' && availableTags.indexOf(singleValues) !== -1 && countryExist === false) {
        var newSpan = document.createElement('span');
        newSpan.innerHTML = '<span class="title country-title">' + singleValues + '</span><span class="close">&times;</span>';
        tagEditBlock.appendChild(newSpan);
        newSpan.querySelector('.close').addEventListener('click', function (event) {
            var toDelete = event.target.parentNode;
            toDelete.parentNode.removeChild(toDelete);
        });
        tr.querySelector('.inputAutocomplete').value = '';
    }
}

function addIpBlock() {
    var tr = this.closest('tr');
    var singleValues = tr.querySelector('.inputAutocomplete').value;
    var tagEditBlock = tr.querySelector('.tag-edit');
    var errorString = verifyIP(singleValues);
    if (errorString === '') {
        var newSpan = document.createElement('span');
        newSpan.innerHTML = '<span class="title ip-title">' + singleValues + '</span><span class="close">&times;</span>';
        tagEditBlock.appendChild(newSpan);
        newSpan.querySelector('.close').addEventListener('click', function (event) {
            var toDelete = event.target.parentNode;
            toDelete.parentNode.removeChild(toDelete);
        });
        tr.querySelector('.inputAutocomplete').value = '';
    }
    else {
        flashTrWhenIpNotCorrect(tr, errorString)
    }
}

function verifyIP(IpValue) {
    var errorString = "";
    var theName = "IP address";
    var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    var ipArray = IpValue.match(ipPattern);
    if (IpValue === "0.0.0.0")
        errorString = errorString + theName + ': ' + IpValue + ' this is a special IP address and cannot be used.';
    else if (IpValue === "255.255.255.255")
        errorString = errorString + theName + ': ' + IpValue + ' this is a special IP address and cannot be used.';
    if (ipArray === null)
        errorString = errorString + theName + ': ' + IpValue + ' is not a valid IP address.';
    else {
        for (var i = 0; i < 4; i++) {
            var thisSegment = ipArray[i];
            if (thisSegment > 255) {
                errorString = errorString + theName + ': ' + IpValue + ' is not a valid IP address.';
                i = 4;
            }
            if ((i === 0) && (thisSegment > 255)) {
                errorString = errorString + theName + ': ' + IpValue + ' this is a special IP address and cannot be used.';
                i = 4;
            }
        }
    }
    return errorString;
}

function checkIfCountryAlredyExist(tagEditBlock, country, ip) {
    var countryTitles = tagEditBlock.querySelectorAll('.title');
    for (var i = 0; i < countryTitles.length; i++) {
        if (countryTitles[i].innerText === country || countryTitles[i].innerText === ip) {
            return true;
        }
    }
    return false;
}

function changeToEditUI() {
    var tbody = document.querySelector('#rules tbody');
    var tr = searchesTheInput(tbody);
    if (tr) {
        flashTrWhenError(tr);
    }
    else {
        var rule = this.closest('tr');
        rule.setAttribute('data-is_edit_mode', true);
        changeBtnBlockStyle(this);
        setStoreNameToInput(rule);
        setRedirectValue(rule);
        addCountrySearchInput(rule);
        rule.querySelector('button.add-country-btn').addEventListener('click', addCountryBlock);
        rule.querySelector('button.add-ip-btn').addEventListener('click', addIpBlock);
        rule.querySelector('.inputAutocomplete').addEventListener('keypress', addCountryBlock);
        rule.querySelector('input.inputAutocomplete').addEventListener('keydown', runAutocomplete);

        var prevState = rule.getAttribute('data-is_blocked') === 'true';
        rule.querySelector('.btn-blocker').innerText = (prevState) ? 'Unblock' : 'Block';
    }
}

function changeBtnBlockStyle(item) {
    var btnParentBlock = item.closest('td');
    btnParentBlock.innerHTML = '<td class="text-right nowrap btn-block button-save-and-delete"><button class="btn delete-btn" onclick="cancelEdit();">Cancel</button>&nbsp;<button class="btn btn-primary save-btn">Save</button></td>';
    btnParentBlock.querySelector('button.save-btn').addEventListener('click', saveChangesToBase);
}

function setStoreNameToInput(rule) {
    var store = rule.querySelector('.input-store-name');
    store.innerHTML = '<div class="quick-response-form"><input class="store-name" type="text" value="' + store.innerText + '"/></div>';
    store.setAttribute('valign', 'top');
}

function setRedirectValue(rule) {
    var redirect = rule.querySelector('.redirect-value');
    var redirectValue = redirect.innerText;
    var redirectRule = redirect.closest('td');
    var blockButtonText = (redirectValue === 'about:blank') ? 'Unblock' : 'Block';
    redirectRule.innerHTML = '<div class="right-blocker"><div class="or">or&nbsp</div><div class="blocker-div"><button class="btn btn-primary btn-blocker" onclick="blockRule(this);">' + blockButtonText + '</button></div></div><div class="quick-response-form redirect-link-div"><div class="left-blocker"><input class="redirect-link" type="text" value="' + redirectValue + '"/><button class="btn btn-primary domain-redirect-btn tooltip" onclick="domainRedirect(this);"><span class="tooltiptext"></span>Domain Redirect</button><span class="domain-redirect-text"><i><b>Domain Redirect</b> is enabled</i></span></div></div>';
    redirectRule.setAttribute('valign', 'top');
    addTooltip(redirectRule);
    redirectRule.querySelector('.redirect-link').addEventListener('keyup', function (e) {
        addTooltip(e.target.parentNode.parentNode);
    });
}

function addCountrySearchInput(rule) {
    var tagEditBlock = rule.querySelector('div.tag');
    tagEditBlock.classList.add("tag-edit");
    var tagEditBlockTD = tagEditBlock.closest('td');
    var addCountryInput = document.createElement("div");
    addCountryInput.className = 'quick-response-form';
    addCountryInput.innerHTML = '<div class="ui-widget"><input placeholder="Region, country or IP..." class="inputAutocomplete"></div><button class="btn btn-primary add-country-btn">Add country</button> <button class="btn btn-primary add-ip-btn">Add IP</button>';
    tagEditBlockTD.insertBefore(addCountryInput, tagEditBlock);
    setCountryTitleFromList(tagEditBlockTD);
}

function setCountryTitleFromList(tagEditBlockTD) {
    var countryTitleBlocks = tagEditBlockTD.querySelectorAll('.title');
    for (var i = 0; i < countryTitleBlocks.length; i++) {
        var spanCloseBtn = document.createElement("span");
        spanCloseBtn.className = 'close';
        spanCloseBtn.innerHTML = '×';
        countryTitleBlocks[i].parentNode.appendChild(spanCloseBtn);
        countryTitleBlocks[i].parentNode.querySelector('.close').addEventListener('click', function (event) {
            var toDelete = event.target.parentNode;
            toDelete.parentNode.removeChild(toDelete);
        });
    }
}

function saveChangesToBase() {
    var tr = this.closest('tr');
    var data = new Object();
    if (tr.getAttribute('data-rule-id') !== null) {
        data.id = tr.getAttribute('data-rule-id');
    }
    data.enabled = tr.querySelector('.layout-item-status').getAttribute('data-status');
    data.domain_redirect = (tr.getAttribute('data-is_domain_redirect') === 'true');
    data.countries = [];
    data.ip = [];
    const countryTitles = tr.querySelectorAll('.title');
    var k = 0,
        n = 0;
    for (var i = 0; i < countryTitles.length; i++) {
        if (countryTitles[i].classList.contains("country-title")) {
            data.countries[k] = countryTitles[i].innerHTML;
            k++;
        } else if (countryTitles[i].classList.contains("ip-title")) {
            data.ip[n] = countryTitles[i].innerHTML;
            n++;
        }

    }
    data.store_name = tr.querySelector('input.store-name').value;
    data.link = tr.querySelector('.redirect-link').value;
    if (data.link === 'Blocked') {
        data.link = 'about:blank';
    }
    if (data.store_name.length !== 0 && data.link.length !== 0 && (data.countries.length !== 0 || data.ip.length !== 0)) {
        showLoaderWhenPageLoad(firstBlock);
        apiRequest('POST', '&task=postrule', renderSaved, data, failSaved);
    }
    else {
        flashTrWhenError(tr);
    }
}

function showLoaderWhenPageLoad(firstBlock) {
    var loaderBlock = document.querySelector('.loader');
    if (loaderBlock === null) {
        var loaderBlock = document.createElement('div');
        loaderBlock.className = 'loader';
        loaderBlock.innerHTML = '<div class="loader-background"></div><div class="next-spinner"><svg class="next-icon next-icon--40" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg></div>';
        firstBlock.appendChild(loaderBlock);
    } else {
        loaderBlock.style.display = "block";
    }
}

function failSaved() {
    ShopifyApp.flashError("Could not be saved.");
}

function renderSaved(data) {
    ShopifyApp.flashNotice("Successfully saved.");
    renderRules(data);
}

function runAutocomplete() {
    jQuery(this).autocomplete({
        source: availableTags
    });
}

jQuery(function ($) {
    $('#rules tbody').sortable({
        handle: ".handle",
        items: "> tr.dragable",
        opacity: 0.5,
        stop: function (event) {
            const listId = event.target.querySelectorAll('tr.dragable');
            var ids = [];
            for (var i = 0; i < listId.length; i++) {
                ids[i] = listId[i].getAttribute('data-rule-id');
            }
            var data = new Object();
            data.ids = ids;
            showLoaderWhenPageLoad(firstBlock);
            apiRequest('POST', '&task=updateorder', function () {
                console.log('send');
            }, data);
        }
    });
});

function layoutStatusToggle(node) {

    var i = node.querySelector('i');
    var span = i.parentNode;
    var newStatus = span.getAttribute('data-status') === '0' ? '1' : '0';
    span.setAttribute('data-status', newStatus);
    var spanParentNode = span.parentNode.parentNode;
    var spanParentNodeID = spanParentNode.getAttribute('id');
    if (newStatus === '0') {
        i.className = 'fa fa-toggle-off'
    }
    else {
        i.className = 'fa fa-toggle-on'
    }
    if (spanParentNodeID) {
        showLoaderWhenPageLoad(firstBlock);
        sentRequestDataStatus(newStatus, spanParentNodeID);
    }
}

function sentRequestDataStatus(newStatus, spanParentNodeID) {
    var data = new Object();
    data.enabled = newStatus;
    data.id = spanParentNodeID;
    if (spanParentNodeID !== null && newStatus !== null) {
        apiRequest('POST', '&task=postrule', function () {
            console.log('done');
        }, data);
    }
}

function cancelEdit() {
    renderRules(window.rulesJSON);
}

function deleteNode(node) {
    if (node.getAttribute('data-confirm') === 'true') {
        node.innerText = 'Deleting...';
        node.style.color = 'orange';
        var nodeParentNode = node.parentNode.parentNode;
        var nodeParentNodeID = nodeParentNode.getAttribute('id');
        sendDeleteRequest(node, nodeParentNodeID);
        setStartPageAfterClosetAllRules();
    } else {
        node.setAttribute('data-confirm', 'true');
        node.innerText = 'Delete?';
        node.style.color = 'red';
    }
}

function blockRule(button) {
    var tr = button.parentNode.parentNode.parentNode.parentNode;
    var prevState = tr.getAttribute('data-is_blocked') === 'true';
    tr.setAttribute('data-is_blocked', !prevState);
    var div = tr.querySelector('.redirect-value');
    var input = tr.querySelector('.redirect-link');
    button.innerText = (prevState) ? 'Block' : 'Unblock';
    if (div) div.innerText = (prevState) ? '' : 'about:blank';
    if (input) input.value = (prevState) ? '' : 'about:blank';
}

function domainRedirect(button){
    var tr = button.closest('tr');
    var prevState = tr.getAttribute('data-is_domain_redirect') === 'true';
    tr.setAttribute('data-is_domain_redirect', !prevState);
}

function setStartPageAfterClosetAllRules() {
    if (document.querySelector('#tbody').rows.length - 1 === 0) {
        setStartPage();
    }
}

function sendDeleteRequest(node, ruleID) {
    var data = new Object();
    data.id = ruleID;
    if (ruleID !== null) {
        apiRequest('POST', '&task=deleterule', function () {
            deleteRule(node);
        }, data);
    }
    else {
        setTimeout(function () {
            deleteRule(node);
        }, 500);
    }
}

function deleteRule(node) {
    var ruleTr = node.closest('tr');
    ruleTr.parentNode.removeChild(ruleTr);
}

function newRow() {
    var tbody = document.querySelector('#rules tbody');
    var tr = searchesTheInput(tbody);
    if (tr) {
        flashTrWhenError(tr);
    }
    else {
        addNewRuleBlock(tbody);
    }
}

function addNewRuleBlock(tbody) {
    var newtr = document.createElement("tr");
    newtr.setAttribute('data-is_edit_mode', 'true');
    newtr.innerHTML = '<tr class="dragable"><td class="text-left draggable"><i class="fa fa-bars handle"></i></td><td class="text-left switch"><div class="layout-item-status tooltip-holder layout-enabled" data-status="1" onclick="layoutStatusToggle(this)"><i class="fa fa-toggle-on" onclick=""></i></div></td><td class="input-countries"><div class="quick-response-form"><div class="ui-widget"><input placeholder="Start typing country or region name" class="inputAutocomplete"></div><button class="btn btn-primary add-country-btn">Add country</button><button class="btn btn-primary add-ip-btn">Add IP</button></div><div class="tag green-tag tag-edit"></div></td><td valign="top" class="input-store-name"><div class="quick-response-form"><input class="store-name" type="text" placeholder="Enter your Store Name..."/></div></td><td valign="top" class="redirect-to-block"><div class="right-blocker"><div class="or">or&nbsp</div><div class="blocker-div"><button class="btn btn-primary btn-blocker" onclick="blockRule(this);">Block</button></div></div><div class="quick-response-form redirect-link-div"><div class="left-blocker"><input class="redirect-link" type="text" value=""/><button class="btn btn-primary domain-redirect-btn tooltip" onclick="domainRedirect(this);"><span class="tooltiptext"></span>Domain Redirect</button><span class="domain-redirect-text"><i><b>Domain Redirect</b> is enabled</i></span></div></div></td><td class="text-right nowrap btn-block button-save-and-delete"><button class="btn delete-btn" onclick="cancelEdit();">Cancel</button>&nbsp;<button class="btn btn-primary save-btn">Save</button></td></tr>';
    visibilityofblock(tbody);
    tbody.appendChild(newtr);
    addTooltip(newtr);
    newtr.querySelector('.redirect-link').addEventListener('keyup', function (e) {
        addTooltip(e.target.parentNode.parentNode);
    });
    newtr.querySelector('button.add-country-btn').addEventListener('click', addCountryBlock);
    newtr.querySelector('button.add-ip-btn').addEventListener('click', addIpBlock);
    newtr.querySelector(".inputAutocomplete").addEventListener('keypress', addCountryBlock);
    newtr.querySelector('input.inputAutocomplete').addEventListener('keydown', runAutocomplete);
    newtr.querySelector('button.save-btn').addEventListener('click', saveChangesToBase);
}

function addTooltip(newtr) {
    var redirect = newtr.querySelector('.redirect-link').value;
    if (redirect.slice(-1) === '/') {
        redirect = redirect.slice(0, -1);
    }
    newtr.querySelector('.domain-redirect-btn .tooltiptext').innerHTML = 'For ex. <span class="bold-tip">http://' + getShop() + '/pages/faq</span> → <span class="bold-tip">' + redirect + '/pages/faq</span>';
}

function flashTrWhenError(tr) {
    tr.style.backgroundColor = '#fff0f0';
    ShopifyApp.flashError("All fields must be filled and saved!");
    setTimeout(function () {
        tr.style.backgroundColor = '';
    }, 1000);
}
function flashTrWhenIpNotCorrect(tr, errorString) {
    tr.style.backgroundColor = '#fff0f0';
    ShopifyApp.flashError(errorString);
    setTimeout(function () {
        tr.style.backgroundColor = '';
    }, 1000);
}

function visibilityofblock(tbody) {
    tbody.closest('div').style.display = 'block';
    tbody.closest('section').querySelector('.start-section').style.display = 'none';
}

function searchesTheInput(block) {
    var inputAutocomplete = block.querySelector('.inputAutocomplete');
    if (inputAutocomplete) {
        return inputAutocomplete.closest('tr')
    }
    return false;
}