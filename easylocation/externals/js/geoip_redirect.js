'use strict';

(function () {
    var urlLocation = 'https://apps.nexusmedia-ua.com/geoip/';
    var urlIp = 'https://apps.nexusmedia-ua.com/geoip/ip.php';
    var parameters = {
        "redirect_text": "It seems you're in %COUNTRY%. Redirect to %STORENAME%?",
        "yes": "Yes, please",
        "no": "No, thanks",
        "background-color": "0096ff",
        "text-color": "ffffff",
        "yes-background-color": "005493",
        "yes-text-color": "ffffff",
        "no-background-color": "005493",
        "no-text-color": "ffffff",
        "layout-selector": "top"
    };
    window.locationData = null;

    run();

    function run() {
        if (!getCookie('geoip-redirect-closed')) {
            getLocation(loadParameters);
        }
    }

    function loadParameters() {
        var config = infoFromMeta();
        if (typeof config.parameters !== 'undefined' && config.parameters !== null) {
            parameters = config.parameters;
        }
        if (typeof config.rulesList !== 'undefined') {
            implementRules(config.rulesList);
        } else {
            //console.error('cant load rules');
        }
    }

    function implementRules(rules) {
        for (var i = 0; i < rules.length; i++) {
            if (compareCountries(rules[i])) {
                goRedirect(rules[i]);
                break;
            }
        }
    }

    function goRedirect(rule) {
        if (rule.domain_redirect === '1' && rule.link !== 'about:blank') {
            rule.link = getDomainLink(rule.link);
        }
        if ((parameters['layout-selector'] === 'top' || parameters['layout-selector'] === 'popup') && rule.link !== 'about:blank') {
            setTemplateBanner(rule);
        } else {
            pureRedirect(rule);
        }
    }

    function getJSON(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
                callback(null, xhr.response);
            } else {
                callback(status);
            }
        };
        xhr.send();
    }

    function getDomainLink(link) {
        if (link.slice(-1) === '/') {
            return link + window.location.pathname.substring(1);
        }
        return link + window.location.pathname;
    }

    function getLocation(callback) {
        if (window.locationData === null) {
            var verificationOfCookie = getCookie("geoip-location");
            if (verificationOfCookie === null) {
                getJSON(urlLocation,
                    function (err, data) {
                        if (typeof data !== 'object') {
                            data = JSON.parse(data);
                        }
                        if (err === null) {
                            getJSON(urlIp, function (status, ip) {
                                data.ip = ip;
                                window.locationData = data;
                                setCookieLocation("geoip-location", data);
                                callback(window.locationData);
                                window.geoIpDataMyIp = data;
                            });

                        }
                    });
            } else {
                window.locationData = verificationOfCookie;
                callback(verificationOfCookie);
            }
        }
    }

    function setCookieLocation(cookieName, value) {
        var date = new Date();
        date.setDate(date.getDate() + 1);
        document.cookie = cookieName + '=' + escape(JSON.stringify(value)) + "; expires=" + date.toUTCString();
    }

    function setCookie(cookieName, value) {
        document.cookie = cookieName + '=' + escape(JSON.stringify(value));
    }

    function getCookie(cookieName) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + cookieName + "=");
        if (parts.length === 2) {
            var cookie = parts.pop().split(";").shift();
            if (cookie) {
                return JSON.parse(unescape(cookie));
            }
        }
        return null;
    }

    function compareCountries(rule) {
        var arrCountries = [];
        if (Array.isArray(rule.countries)) {
            arrCountries = rule.countries
        } else {
            arrCountries = rule.countries.split(',');
        }
        if (checkIp(rule.ip) === true) {
            return true;
        }
        for (var i = 0; i < arrCountries.length; i++) {
            var position = arrCountries[i];
            if (position === 'All countries' || checkCountry(position) || checkRegion(position)) {
                return true;
            }
        }
        return false;
    }

    function checkCountry(position) {
        var currentCountry = window.locationData.country.names.en;
        return currentCountry === position;
    }

    function checkRegion(position) {
        var currentRegion = window.locationData.continent.names.en;
        return currentRegion === position;
    }

    function checkIp(ipList) {
        return ipList.split(",").indexOf(window.locationData.ip) !== -1
    }

    function pureRedirect(item) {
        window.location = item.link;
    }

    function infoFromMeta() {
        var infoMeta = document.querySelector('meta.geo-ip');
        if (!infoMeta) return false; 
        var contentMetaJson = infoMeta.content;
        return JSON.parse(contentMetaJson);
    }

    function setTemplateBanner(rule) {
        var wrapperDiv = document.createElement('div');
        wrapperDiv.id = 'geoip-banner';
        var topDiv = document.createElement('div');
        topDiv.className = 'geoip-' + parameters['layout-selector'] + '-banner';
        topDiv.style.backgroundColor = '#' + parameters['background-color'];
        var storeCountryName = setStoreCountryName(rule, parameters);
        topDiv.innerHTML = '<div class="geoip-main-block"><div style="color:#' + parameters['text-color'] + '" class="geoip-text-block">' + storeCountryName + '</div><div class = "geoip-button-block"><button style="color:#' + parameters['yes-text-color'] + ';background-color:#' + parameters['yes-background-color'] + '" class="geoip-yes-btn">' + parameters['yes'] + '</button><button  style="color:#' + parameters['no-text-color'] + ';background-color:#' + parameters['no-background-color'] + '" class="geoip-no-btn">' + parameters['no'] + '</button></div></div><span style="color:#' + parameters['text-color'] + '" class="geoip-close-icon">&times;</span>';
        var body = document.querySelector('body');
        if (parameters['layout-selector'] === 'popup') {
            addPopupStyles(wrapperDiv);
        }
        wrapperDiv.appendChild(topDiv);
        body.insertBefore(wrapperDiv, body.firstChild);
        topDiv.querySelector('button.geoip-no-btn').addEventListener('click', closeBanner);
        topDiv.querySelector('button.geoip-yes-btn').addEventListener('click', function () {
            pureRedirect(rule);
        });
        topDiv.querySelector('.geoip-close-icon').addEventListener('click', hideBanner);
        addStylesBlock(wrapperDiv);
    }

    function addPopupStyles(wrapperDiv) {
        wrapperDiv.style.height = '100%';
        wrapperDiv.style.width = '100%';
        wrapperDiv.style.position = 'absolute';
        wrapperDiv.style.zIndex = '9999999999999';
        wrapperDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    }

    function setStoreCountryName(rule) {
        var allText = parameters.redirect_text;
        var storeName = rule.store_name;
        var countryName = window.locationData.country.names.en;
        var replased = allText.replace('%STORENAME%', '<span class="geoip-store-name"><a href = "' + rule.link + '">' + storeName + '</a></span>');
        return replased.replace('%COUNTRY%', '<span class="geoip-country-name">' + countryName + '</span>');
    }

    function closeBanner(e) {
        setCookie('geoip-redirect-closed', true);
        hideBanner(e);
    }

    function hideBanner(e) {
        var topDiv = document.querySelector('div#geoip-banner');
        topDiv.style.opacity = 0;
        topDiv.style.transition = 'opacity 0.3s';
        setTimeout(function () {
            topDiv.parentNode.removeChild(topDiv);
        }, 300);
    }

    function addStylesBlock(wrapperDiv) {
        var newStyleTag = document.createElement('style');
        newStyleTag.innerHTML = '.geoip-store-name a:hover{color:inherit;} .geoip-popup-banner .geoip-main-block button:first-child{ margin-left: 0;} .geoip-top-banner .geoip-close-icon{ display:none} .geoip-top-banner{ text-align:center} .geoip-top-banner .geoip-button-block{ display:inline-block; margin:5px;} .geoip-top-banner .geoip-text-block{ margin-right:20px; display: inline-block;} .geoip-store-name{ font-weight:bolder} .geoip-store-name a{ color:inherit;text-decoration: underline;} .geoip-country-name{ font-weight:bolder} .geoip-text-block{ line-height:28px; font-size:15px; font-family:sans-serif; margin-right:10px; font-weight:lighter} .geoip-main-block button{ background:none; border:0; font-size:14px;  margin-left:10px; cursor:pointer; padding:3px 11px 3px} .geoip-main-block button:hover{ opacity:0.8} .geoip-popup-banner{z-index:99999999999; position:fixed; left:0; top:0; right:0; bottom:0; margin:auto; width:450px; height:200px} .geoip-popup-banner .geoip-main-block{ position:relative; top:50%; transform:translateY(-50%)} .geoip-close-icon{ position:absolute; right:10px; top:5px; cursor:pointer} .geoip-popup-banner .geoip-text-block{ text-align:center; width:60%; margin:0 auto; line-height:16px; padding-bottom:20px} .geoip-popup-banner .geoip-button-block{ margin:0 auto; text-align:center} .geoip-button-block:first-child{ margin-left:0} .geoip-button-block button{ margin-left:20px} @media screen and (max-width:480px){ .geoip-text-block{ width:100%; float:left} .geoip-main-block button{ margin-bottom:10px} .geoip-popup-banner{ width:100%} .geoip-popup-banner .geoip-text-block{ width:100%}}';
        wrapperDiv.appendChild(newStyleTag);
    }
})();