(function () {

    var container = null;
    window.userdata = getInfoFromMeta();
    userdata['fbPageUrl'] = 'https://www.facebook.com/' + window.userdata.social_page_id + '/';
    userdata['data-hash'] = '01234567890';

    function createCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function eraseCookie(name) {
        createCookie(name,"",-1);
    }

    function getInfoFromMeta() {
        var infoMeta = document.querySelector('meta.easybot');
        if (!infoMeta) return false;
        var contentMetaJson = infoMeta.content;
        return JSON.parse(contentMetaJson)[0];
    }


    function run() {
        if (window.userdata['fbPageUrl'] !== 'undefined' && window.userdata['status'] === 1 && window.userdata.social_page_id !== null) {
            container = createMessagesWrapper();
            setContainerHandler(container);
            renderMessages();
            checkEasybotChatTextBlock(container);
            addEventListeners(container);
            if (is_touch_device()) {
                container.querySelector('.div-closed-easybot-block').style.display = 'block';
            }
        }
        else {
            //console.log("EasyMessenger: FB Page not found");
        }
    }

    function is_touch_device() {
        return !!('ontouchstart' in window);
    }

    function checkEasybotChatTextBlockPosition(container) {
        if (document.documentElement.clientWidth < 465 && userdata['position'] !== 'top') {
            container.querySelector('.easybot-chat-text-block').style.top = "auto";
            container.querySelector('.easybot-chat-text-block').style.bottom = '100px';
        } else if (userdata['position'] === 'top' && document.documentElement.clientWidth > 465) {
            container.querySelector('.easybot-chat-text-block').style.bottom = "auto";
            container.querySelector('.easybot-chat-text-block').style.top = '100px';
        } else if (userdata['position'] === 'top' && document.documentElement.clientWidth < 465) {
            container.querySelector('.easybot-chat-text-block').style.bottom = "auto";
            container.querySelector('.easybot-chat-text-block').style.top = 100 + 'px';
        }
        if (document.documentElement.clientWidth < 465 && container.querySelector('.easybot-chat-text-block').offsetHeight + 115 > document.documentElement.clientHeight) {
            container.querySelector('.easybot-chat-text-block').style.bottom = "auto";
            container.querySelector('.easybot-chat-text-block').style.top = 85 + 'px';
            container.querySelector('.easybot-messenger-white-block').style.height = (document.documentElement.clientHeight - 245) + 'px';
            //container.querySelector('.easybot-messenger-white-block').style.overflow = 'auto';
        } else if (document.documentElement.clientHeight < container.querySelector('.easybot-messenger-white-block').offsetHeight + 240) {
            container.querySelector('.easybot-messenger-white-block').style.height = document.documentElement.clientHeight - 255 + 'px';
            //container.querySelector('.easybot-messenger-white-block').style.overflow = 'auto';
            setTimeout(function () {
                setClosedButtonPosition(container)
            }, 500);
        } else{
            container.querySelector('.easybot-messenger-white-block').style.maxHeight = container.querySelector('.easybot-messenger-white-block').scrollHeight + 'px';
            container.querySelector('.easybot-messenger-white-block').style.height = document.documentElement.clientHeight - 255 + 'px';
            // Fix for FF Quantum
            setTimeout(function () {
                container.querySelector('.easybot-messenger-white-block').style.maxHeight = "";
                container.querySelector('.easybot-messenger-white-block').style.height = "";
                container.querySelector('.easybot-messenger-white-block').style.maxHeight = container.querySelector('.easybot-messenger-white-block').scrollHeight + 'px';
                container.querySelector('.easybot-messenger-white-block').style.height = document.documentElement.clientHeight - 255 + 'px';
            }, 250);
            setTimeout(function () {
                setClosedButtonPosition(container)
            }, 500);
        }
    }

    function setClosedButtonPosition(container) {
        container.querySelector('.div-closed-easybot-block').style.bottom = container.querySelector('.easybot-messenger-white-block').offsetHeight + 60 + 'px';
    }

    function checkEasybotChatTextBlock(container) {
        if (getCookie('OpenChatTextBlock') === null && window.userdata['message_text'] !== '') {
            var delay = Number(window.userdata['display_timeout']);
            var dateWhenOpenedChatTextBlock = new Date;
            dateWhenOpenedChatTextBlock.setSeconds(dateWhenOpenedChatTextBlock.getSeconds() + delay);
            createCookie("OpenChatTextBlock", dateWhenOpenedChatTextBlock);
            showEasybotChatTextBlock(delay * 1000);

        } else if (window.userdata['message_text'] !== '' && getCookie('EasybotChatTextBlock') === null) {
            showEasybotChatTextBlock(calculateTimeout());
        }
    }

    function showEasybotChatTextBlock(timeout) {
        container.querySelector('.easybot-messenger-white-block').innerHTML = window.userdata['message_text'];
        if (window.userdata['reply_text']) { container.querySelector('.easybot-messenger-reply').innerHTML = window.userdata['reply_text']; }
        setTimeout(function () {
            fade(container.querySelector('.easybot-chat-text-block'));
            setClosedButtonPosition(container);
            checkEasybotChatTextBlockPosition(container);
        }, timeout);
    }

    function calculateTimeout() {
        var delayBeforeTheOpeningChatTextBlock = ((Date.parse(getCookie('OpenChatTextBlock')) - Date.parse(new Date))),
            timeout;

        if (delayBeforeTheOpeningChatTextBlock < 0) {
            timeout = 100;
        } else {
            timeout = delayBeforeTheOpeningChatTextBlock;
        }
        return timeout;
    }

    function addEventListeners(container) {
        container.querySelector('.easybot-chat-text-block').addEventListener('mouseover', showClosedEasybotBlock);
        container.querySelector('.easybot-chat-text-block').addEventListener('mouseout', hideClosedEasybotBlock);
        container.querySelector('.easybot-messenger-white-block').addEventListener('click', clickChatButton);
        container.querySelector('.easybot-messenger-grey-block').addEventListener('click', clickChatButton);
        container.querySelector('.closed-easybot-block').addEventListener('click', closeEasybotChatTextBlock);
        window.onresize = function () {
            checkEasybotChatTextBlockPosition(container);
            setPositionChat();
        }
    }

    function showClosedEasybotBlock() {
        this.querySelector('.div-closed-easybot-block').style.display = 'block';
    }

    function hideClosedEasybotBlock() {
        if (!is_touch_device()) {
            this.querySelector('.div-closed-easybot-block').style.display = 'none';
        }
    }

    function closeEasybotChatTextBlock() {
        var easybotChatTextBlock = document.querySelector('.easybot-chat-text-block');
        if (easybotChatTextBlock.style.display === 'block') {
            createCookie('EasybotChatTextBlock', 'closed');
            document.querySelector('.easybot-chat-text-block').style.display = 'none';
        }
    }

    function apiRequest(handler, type, data) {
        var request = new XMLHttpRequest();
        request.addEventListener("load", handler);
        request.open("POST", type);
        request.send(JSON.stringify(data));
    }

    function setContainerHandler(container) {
        var toggler = container.querySelector('.easybot_messenger_button_wrapper');
        toggler.addEventListener('click', clickChatButton);
        if (window.userdata.border_color) {
            document.querySelector('.easybot_messenger_button').style.borderColor = '#' + window.userdata.border_color;
        }
    }

    function clickChatButton() {
        if (window.userdata['userflow'] === '1' || navigator.appVersion.indexOf('Android') !== -1 || navigator.appVersion.indexOf('iPhone') !== -1) {
            window.open('http://m.me/' + window.userdata['social_page_id'], '_newtab');
            closeEasybotChatTextBlock();
        } else {
            openContainer(container);
        }
    }

    function openContainer(container) {
        container.setAttribute('data-container-open', true);
        var easybots = container.querySelectorAll('.easybot');
        for (var i = 0; i < easybots.length; i++) {
            var easybot = easybots[i];
            openPopup(easybot, true);
            if (easybot.style.display === 'none') {
                easybot.style.display = 'block';
                setTimeout(function () {
                    easybot.style.opacity = '';
                }, 500);
            }
        }
    }

    function openPopup(easybot) {
        easybot.setAttribute('data-is_open', true);
        easybot.setAttribute('data-show_content', true);
        easybot.querySelector('.easybot_messenger_footer').style.display = 'block';
        easybot.querySelector('.easybot_messenger_footer').style.opacity = 1;
        closeEasybotChatTextBlock();
    }

    function createMessagesWrapper() {
        var newContainer = document.createElement('div');
        newContainer.id = 'easybot-wrapper';
        openContainer(newContainer);
        newContainer.className = 'easybot-wrapper';
        document.querySelector('body').appendChild(newContainer);
        newContainer.innerHTML = wrapperHtml;
        var newMainContainer = document.createElement('div');
        newMainContainer.className = 'easybot-wrapper-main';
        newContainer.insertBefore(newMainContainer, newContainer.firstChild);
        return newContainer;
    }


    function renderMessages() {
        setFbChat();
        document.querySelector('.easybot-wrapper').style.display = 'block';
        setTimeout(function () {
            document.querySelector('.easybot-wrapper').style.opacity = 1;
        }, 200);
    }

    function setFbChat() {
        setTemplate();
        setPositionChat();
        getUserDataFb();
        closeFbChat();
    }

    function setPositionChat() {
        var easybotToggle = document.querySelector('.easybot-toggle');
        if (userdata['position'] === 'top') {
            easybotToggle.querySelector('.easybot_messenger_button_wrapper').style.bottom = 'auto';
            easybotToggle.querySelector('.easybot_messenger_button_wrapper').style.top = '20px';
            easybotToggle.querySelector('.easybot-chat-text-block').style.top = -(window.innerHeight - 125) + 'px';
            easybotToggle.querySelector('.easybot-messenger-white-block').classList.add('easybot-messenger-white-block-top');
            easybotToggle.querySelector('.easybot-messenger-grey-block').classList.add('easybot-messenger-grey-block-top');
            easybotToggle.querySelector('.div-closed-easybot-block').classList.add('div-closed-easybot-block-top');
        }
        checkEasybotChatTextBlockPosition(easybotToggle);
    }

    function closeFbChat() {
        var button = document.querySelector(".close-fbchat");
        button.addEventListener("click", function () {
            document.querySelector('.easybot_messenger_box').setAttribute('data-is_open', 'false');
            document.querySelector('.easybot_messenger_footer').style.display = 'none';
            document.querySelector('.easybot-wrapper').setAttribute('data-container-open', 'false');
        });
    }

    function setTemplate() {
        document.querySelector('.easybot-wrapper-main').innerHTML = getTmpl('fbchat');
        document.querySelector('.easybot-wrapper').setAttribute('data-container-open', 'false');
    }

    var UrlObj = {};

    function connectionUrl() {
        var fbPageUrl = userdata['fbPageUrl'];
        var fbUrl = 'https://www.facebook.com/plugins/page.php?href=';
        var fbUrlEnd = '&tabs=messages&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId=1262045467217804';
        UrlObj.urlTrue = fbUrl + fbPageUrl + fbUrlEnd;
    }

    function getUserDataFb() {

        if (!userdata) return false;

        connectionUrl();
        var urlTrue = UrlObj.urlTrue;

        var borderColor = userdata['border_color'];
        if (borderColor !== undefined) {
            document.querySelector('.easybot_messenger_button').style.borderColor = borderColor;
        }
        else {
            document.querySelector('.easybot_messenger_button').style.borderColor = '';
        }

        var title = userdata['chat_title'];
        if (title !== undefined) {
            document.querySelector('.easybot_messenger_header_title').innerHTML = title;
        }
        else {
            document.querySelector('.easybot_messenger_header_title').innerHTML = '';
        }

        if (!userdata['small_icon']) {
            document.querySelector('.easybot_messenger_icon').style.display = 'none';
        }

        var icon = userdata['icon_image'];
        //console.log(icon);
        var icon_tag = document.querySelector('.easybot_messenger_icon_tag');
        icon_tag.addEventListener('load', function () {
            fade(container.querySelector('.easybot_messenger_button_wrapper'));
        });

        if (icon && (icon.indexOf('https://cdn.shopify.com') !== -1) || (icon.indexOf(';base64') !== -1)) {
            icon_tag.setAttribute('src', icon);
        } else {
            var standartImg = 'http://graph.facebook.com/' + window.userdata.social_page_id + '/picture?type=large';
            icon_tag.setAttribute('src', standartImg);
        }

        var hash = userdata['hash'];
        if (hash !== undefined) {
            if (hash.charAt(0) == 1) {
                document.querySelector('.easybot_messenger_footer').style.display = 'none';
                document.querySelector('.easybot_messenger_footer').style.height = 0 + 'px';
            }
        }
        var adminBar = document.querySelector('#admin_bar_iframe');
        if (adminBar) {
            var height = +window.innerHeight - document.querySelector('.easybot_messenger_header').offsetHeight - document.querySelector('.easybot_messenger_footer').offsetHeight - adminBar.offsetHeight;
            document.querySelector('#easybot-wrapper').style.marginTop = adminBar.offsetHeight + 'px';
        } else {
            var height = +window.innerHeight - document.querySelector('.easybot_messenger_header').offsetHeight - document.querySelector('.easybot_messenger_footer').offsetHeight;
        }
        var width = document.querySelector('.easybot_messenger_box').offsetWidth;
        var urlWithHeightAndWidth = urlTrue + '&height=' + height + '&width=' + width;
        document.querySelector('.easybot_messenger_box iframe').setAttribute('height', height);
        document.querySelector('.easybot_messenger_box iframe').setAttribute('width', width);
        document.querySelector('.easybot_messenger_box iframe').setAttribute('src', urlTrue + urlWithHeightAndWidth);

    }

    window.addEventListener("resize", getUserDataFb);

    // function pingClose(easybot) {
    //     apiRequest(function () {
    //     }, PING_URL, {"type": "close", "id": easybot.getAttribute('data-server-message-id'), "action": "close"})
    // }
    //
    // function pingOpen(easybot) {
    //     apiRequest(function () {
    //     }, PING_URL, {"type": "open", "id": easybot.id, "action": "open"})
    // }

    function getTmpl(tmplName) {
        switch (tmplName) {
            case ("fbchat"): {
                return '<div class="easybot_messenger_box easybot" data-is_open="false"><div class="easybot_messenger_header"><div class="easybot_messenger_header_title"></div><span class="close-fbchat">&times;</span></div><iframe data-width="100%" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe><div class="easybot_messenger_footer">Powered with <a href="https://apps.shopify.com/easymessenger-livechat-messenger-as-a-live-chat" target="_blank">EasyMessenger:LiveChat</a></div></div>';
            }
        }
    }

    function fade(element) {
        element.style.opacity = 0;
        element.style.display = 'block';
        var op = 0;  // initial opacity
        var timer = setInterval(function () {
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op += 0.1;
            if (op >= 1) {
                clearInterval(timer);
            }
        }, 10);
    }

    var wrapperHtml = '<style> #easybot-wrapper * { box-sizing: border-box; } div.div-closed-easybot-block-top {left: 5px;top:-40px;} div.easybot-messenger-grey-block-top {position: static;margin-top: 10px;} div.easybot-messenger-white-block-top {position: static;}.easybot-chat-text-block{display:none; width: 335px; height: 200px; position: fixed; top: auto; bottom: 100px} .div-closed-easybot-block{width:36px; height:56px; position: absolute; right: 0px; display: none;} .closed-easybot-block{cursor: pointer; width:36px; height:36px; right: 0px; border: 4px #fff solid; box-shadow: 0px 0px 10px #ccc;} .write-reply-easybot_messenger_icon{border-radius: 10px;width: 15px;height: 15px; float: right;margin-top: 4px;} .easybot-messenger-white-block{background-color: #fff; color: #565867; overflow: auto; box-shadow: 0 0px 60px 5px rgba(15,15,15,0.2); padding: 20px; border-radius: 5px; position: absolute; width: 330px; font-size: 14px; right: 0; bottom: 70px;} .easybot-messenger-grey-block{color: #565867; background-color: #f4f7f9; cursor: text; padding: 20px; box-shadow: 0 0px 60px 5px rgba(15,15,15,0.2); position: absolute; top: 140px; width: 330px; height: 60px; font-size: 16px; border-radius: 5px; right: 0;} .easybot_messenger_header_title{padding-right: 32px;height: 50px;overflow: hidden; font-size: 15px;} .easybot-wrapper{z-index:999999999}.easybot-wrapper[data-container-open="false"]{padding-bottom:0 !important;transition:all 0.3s}.easybot-wrapper[data-container-open="true"] .easybot-toggle{display:none; opacity:0}.easybot-wrapper[data-container-open="true"]{top:0}@media screen and (max-width:480px){.easybot-wrapper-main .easybot_messenger_box{width:100%}.easybot-wrapper{width:100%}}.easybot-toggle{margin-left:30px;     position: relative;}.easybot[data-is_open="false"]{opacity:0;transition:opacity 0.3s, max-height 0.5s;max-height:0}.easybot[data-is_open="true"]{opacity:1;transition:all 0.3s;max-height:10000px}.easybot-wrapper{position:fixed;right:0;bottom:0;transition:opacity 0.3s}.easybot_messenger_box{top:0;right:0;bottom:0;width:380px;margin:0;padding:0;border-left:1px #e9ebee solid;box-sizing:border-box}.easybot_messenger_box iframe{margin-top:49px;margin-left:-1px}.easybot_messenger_header{border:1px #e9ebee solid;margin:0;padding:0;height:49px;top:0;left:0;right:0;background:#fff;font-family:sans-serif;line-height:50px;font-size:18px;color:#39515c;text-align:center;font-weight:bold;position:absolute}.easybot_messenger_header span{position:absolute;right:14px;font-weight:normal;font-size:30px;cursor:pointer;color:#69818c;top:-2px}.easybot_messenger_header span:hover{color:#39515c}.easybot_messenger_footer{opacity:0; position:absolute;background:#e9ebee;bottom:0;left:0;right:0;font-size:11px;font-family:sans-serif;line-height:22px;text-align:center;color:#999}.easybot_messenger_button_wrapper{display:none;position:fixed;right:20px;bottom:20px;width:64px;height:64px;margin:0;padding:0;box-sizing:border-box;cursor:pointer;z-index:999999999}.easybot_messenger_button{width:64px;height:64px;margin:0;padding:0;border:3px #06a8f3 solid;box-sizing:border-box;overflow:hidden;border-radius:100%;box-shadow: 0 0px 60px 5px rgba(15,15,15,0.2);}.easybot_messenger_button img{max-width:100%;object-fit:cover;width:100%;height:100%}.easybot_messenger_button .easybot_messenger_icon{width:20px;height:20px;border:3px #fff solid;position:absolute;bottom:-3px;right:-3px;border-radius:100%;box-shadow:0px 0px 3px #777}.easybot_messenger_footer a,.easybot_messenger_footer a:hover,.easybot_messenger_footer a:visited{color:#999;text-decoration:underline}@media (max-width:480px){.easybot-chat-text-block { position: fixed; width: 90%; top: auto; bottom: 100px; right: 10px; height: auto;}  .div-closed-easybot-block { top: -45px; }  .easybot-messenger-white-block { position: static; width: auto; margin-bottom: 10px; } .easybot-messenger-grey-block { position: static; width: auto; }}</style><div class="easybot-toggle"><div class="easybot-chat-text-block"><div class="div-closed-easybot-block"><img class="closed-easybot-block" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAABh2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjarY4xS1tRGIafE2NVDBhKsA4iBxTpcFNSHTTWJSZgIg4SLSTZbm5uonCTHG5OSPsD3Fx0EF0U9S+ILg6O4qCDIAjB3yAIgpRwO1w0U9ul7/R8z/B+LwS0qZQTBKo17WYXF2QuX5B9bQYJ8ZE5PplWQyVWVpb5Y17uEQB3UVMpp5x5fZjfbB2efljaH5vTBn/PYMluWCD6AavUsKogHMCwlKtB7AHRllYaxBUQcXP5Aog2EKn4/AREirl8AQJBIOKuZZMQGAHCRZ8/A+GKz7NA2Fo3SxBIA4a/AYCBdErOxOLRBP85Vaf59kMAIbv2fRUIA6OkSSGZIUacKAlt/9AAybr66W5U1rVMKOXYMlmvqqa2XUNmatYXQ07FvsYAcvmC9KufswhADN92Xf0I4uPQs9V1xV04v4CR666bOIChb3B2o0zXfB8uXoL/uhvl6SmfQwvQ++h5z5PQtwOdbc/7dex5nRPoacOl8xskd2ngHvi02wAAACBjSFJNAABtmAAAc44AAPYzAACBQAAAcG4AAONiAAAxeAAAE3KUweRMAAAY0ElEQVR42sSb+bclVZXnP/ucExF3eC/JJEkUGii7ZBYyExKKQdtywKmlGhwAS13Vv/aPvfovqP+g+7f+pZarSixbRFdRWF0mhZZlIxQ0AsksohZCoqKZkG+4Q8QZdv9wIuLel+NDXKtjrfPufe++G3HOPnv47u/eR1JKdJeIcPylqls+SylhjEEB1TxE8kjkoQopgnWwtl7z6uFfcfiXr+pvj/yOjWNrTOs5fl4za+ZIUkxZsjocMRiP2bm6ytnn7uE9F14k553/LnbvHOIDiAFnICpYgRQU59o5aUK0W0MixYQYwRhLSidfV/c36RZ4sqv7TFWJMWKtxRhDUohRsVZQBQzEBNZA08Crrx/mpRd/oj956aesb87xTSBpwoghaRZ4994au+WZMUU0KtZZbGE5azziivddzlVXXC67d+9mZaVkMmsYD0tSAGuz8Gk3QlWRVhpN01CWg9Ou76QCWF44gDGGug4UhUMMeJ8fHAHvlaISmgYeffQxPfTk06xPNmlmM5qoGHGoMTjnsvBiJKbU74ARIaliOjVS7X8XBDTS+BqjkfPOO5991+zlAx+4QbQVuDUwqyOlsaQUqEqHCHjvKYqCk2n4skacUgDLqp8lWUH7PZ8gBjBFnvPB7/5Q//WRfwXnEAyT2YRhNUSsI0WImtAAahKSDFjFiSNJwqghSYIkRA0QBaxS2JLSWTYm6wyGAypnWw0JSFKuu+4AH/rIB2VlaJjOIivDVpMS1E1DWZaIKCGEfl1GDMaa7QmgVxFjmM8bBoOSEGBzc8p4x4j5LPHscy/w4IPf07XNTYbDFXwMNPOAqwo0gKuKPGkUgpKMYpNBHRCUKAmrBrVgkyGahET6/xMLMUZGwyG+nrO5uUk1KDEIw2GJKyw3XHcdH73lJplNAkVpMQrOCcZAarXkZL5s2xqgmNb5gfeRamg5cmTCfX9/v77yyi9JGMQVNPOAsQ6M4GxBVVasra2RBIqyQERa+5SFcEVOUFFj8vNCCAQfGBQDVCOKYp0hhciwKtnYXGNlPGS6sc5ll1/KZ26/TcYrQ0aVMJk0jMcl3ifKwpBSQpMiRhCR7WlAiqnVKINzwnyeGAwM//wvj+nBgw8wXtnBZDJDxYKxDKsRPiWCD4hYmhiw1hJCQ1G2mhDjll3In2cV1ZTnYV12tNnxKoKlKEskKiHUlJVjMtlkNKyYTTbYs3sXa2vHEDyf/dxn5X2XX87KStZW1YQVJWnqBd458lMKoNt9TUpSATE5vCX43vd/oE8+8RRJhel0nuNcKwBfBzQlrHNYW6BWiCGiRJxzfSQxxmzRhpQS1lpEhBhjH2Y7IQWfMMZRmPydpp7hygIlUTrLbLKBsbAyHBJCzYc/9KfywQ++n5gUJ1CWgrThu3PoJ0SBZdWMIWJbh9N48Cl7+a/81df19d+8wWwypxyNWD+2yY6zdtIED6mNxwZM2qpNyZ46zJ7sWjYRVcUax/Fz7AWoWVipaRgOS7yviU3N/mv3y5133spsklgdG1TBNzmKaYqtI9SFBnQ3715jiPgQKauSWYBv3nu/vvyzl2kaTwhKUVQYV2SVXlo8QIZISwIQ3pEAuh3rnRhbd9C2sT/UNcZCVTrqesY1e/fL5++4FVKeU1UKdR0oy6xtoZnjyhITQ9xyw7oOiLEMBiUA3/rmffryz15mfX0D60oGwwFREyEECleSzGLx3YLf7qJPfyVU4ykjVVQQZ7GlQw1Ia5ZPPv2Ufuf+g0hrBknBh9BvtCscTV1juriYUl5UVTli6wC/+90H9eWXX2IymXDuue9mOpkQExjjQIV6XvOHvpYj0PJCT/U5QD1rsLagLAbMJjWj0RjrCp578QV94IHv0zSKCIzHA5qmFaZayqrCIIICMQmuKIkJXGF48Hs/1B8/eYiggrUV3ntcMaCLWuLslp0/Yd8kZYDzDq6TYfheENIOzbC5Dp6IogJNDCQx1CHyo4cf0ScPPUMToElQlJagCYwABuODx/uEc5ITmgSvvPobHnr4YZIaNjcmrK7s4K1jGwyHY5xzRLJHL4qC/9+XiFCWZWt3hmowJEXQKNSzmuFwzMGDB/WNN95EY16fM5amabKPcbbAWoNXmNaKcfC/Dz6gxhW8ubbO2efsYX1zynhllY31TXxMoDmezut6sRPt+EPs9jJqM2owak75uVjHrJ4jzoAYosK8CRTDIaPVHWxOZ0xnDQcf+Ce1BTRRmTaBoixJtDlIjDmbwgiPPPoUv3j5FzhbUZVDmiaHjRSU4WiY1TsmxJo+XL5Tmz/d72cyiYwtHEVRMJvOMnQejbHWsrE+abNBw+9+d5R/euAhdU4YlA7vc3Zq+nBiYDar+dFDj2g5GrM5a1BjSAjWOJIh206L1kLrUbezuJQyErPWYq3dAoWPh8bGmCUkuPD+KaX+PifAWRFCSJTVAIzgY6BuPNVoTN1EBqNVfv3Gb3nhpZf5zW+PkbTFEijG+7zzSeH/Pvq4rk2mqBjqJoDYHhX+PirdIbqiKDDG4L3He98jsg71dQuMMRJj7ON/JyxjDEVR9Cn1MnY57Sao4KqKWe1Z3bGTo0eO8twzLygCQUGTZBMwFo4dm3Ho0CHqeY0xDk2SIW2EKHpK1czPVwQFXXh9owZLBh3ee0IIvQZ0u+mc6xe8vPtdrO60JgOdhtj4LeAoa0jmoTKyy8xQftsKCYNYR4hKRHj08ceZzZUQUkauzuUJv/jiT1mfTBFT5FBYVSQ5/eKPt9njHVVKiWY6xzlHWZY5wwuBsiwpimILjuh2cxmrL2tFim1Gt/Q/p0pxt8wvKRpBWw89mU547PHHGQwtKSlGFeo68cQTP1ZEMNbkXTFCDAlEMShKft8N6XddO56k9dogSdGQiCEyGA7QENEQGRQllSvwszoLxhhK63BiMBmMoCEiSbEIhbH4uUcwDAZDBoMhxkomRVCcNf08+p3vNDDlERTUCgnFmoLCVTx96Jneqo33cOToW7x2+DVUwdgCNTbfVsgT+z3DmSg9XrDW0tQNTd3gCkdZlXl3jtOgbnQmUJTlwgx81qDOGW4nciiKiMVgwQghRY6+eZRXXjmMMa02Pf/8cwqGtGSLy7YmIlikFUbaMnpur915kmLImmRdtvl6XvcLL8qi9wHVoOpT4OMJkc6EyqrKmWnd0DQNaYlPXCZTOg015GENiBGsyYIfDofMpjXOlcxnDS+++FLmc42D5597kXIwQlX6yaWUICkJOeOOn5DBtQux1qIxYCxYJ4hoPzLr07TfTa29e2L0qEZE8gY0fo4mpSgLBsNBH1GWn3m6y7QhbzqbMhwNqec15aDipy//PGv8kbemHNuc0KSEGEcS0+KChTomZCnLMxlDdwgtRYzmjM2YzI9EIlEDTT3HFYbPfuZ2rrjsUowoYpQQGoIGIjETo4XB+xokMawKLn7vH3PnHXdgJRMoIXoQxYemD5+dWSxr4LK5JlWSRmL0FKVFjRA0YVxBU3vW1zd58+gm5leHf4MPMfMA6BbCIZ0kDT1ZFPCN7ycG4NrQ4qqCL3zhi+y7+r3cedetXHbpJTTNDNXAjvEQJWJFEY1YK6yMh1x40YV86Uu3c/mlF/LnX/wyvqmpBlV/727xTdP0zzmthrZMkrZaJiLYsiKEwGuHX8Mcfv2wqi4kuizV3pOJniTby8MYx3A0bgslBSKWeu4xxtHUDc888zRRIQT4zGdv5dr91yIo9WyKE9DgGVYl0ddccvEl3HnnZ5CsZDz99KF+0h0m6BBoFxLPKIDOhHVhMtnHJV5//XU1x946hrVui+c9no05kwbMpjOKouhjdjWo8I2nrEqeevJJvv2t71CUMKjg1j/7JNdfdz0x1lhNOKtM1tc4cO21fPJTn2Q4gLqG++77Lk8+8QTWWbz3vYOMIQOnsiq3cP5nmuMCcWYtEmPZWF/HfvTjn/7LtfWNXNNDEFl44Y7MPC1f4xNlWdLMG5zNhZGmbqiq7OF9M2NzssFvf32E9/z7y6hKeM+F72EyWefIkd+SYmDv3qu56/O3YWxOzP7u23/PM8882xKsjhgWqNE428/Ne7+IVCfsfPtDMwYAMNaAKqoRa4TBoMS+/z985C+n8zonCMYiYk7g8E93FdYRfNgS0pxz1HWNsYaV8RAj8Ktfv85kMmHv+y6msIaL//i9HFs7yo7RmC9/+S40ga+V+//hu7z4wvN479mx4yx8iNDuvm88g9GQEMIJKPBUAhAMUXPB1NiM/VVjhu0p4Gaz2cLxLalL59ROKYTWpurgW36tycmLzd8bDEYokelkTtQ5w6ri8ccfpZlt8BdfvoPQJD53221UhaX2uWjxjwf/gaeefIpqMKIoYD6fI2JboiZRVmXvDLtibZ9xyiLsnUz9E10muTDr2WyKiSm2qrbg5o/nz093uSJ74q740WlOCAFNymA4YDAYEmNidWWVF59/nr/56tdZGZWgSt0ERJR777mXRx55mFFVtWivDW/G9chvNBwyn83f1vwCqU/ClvnEPtO0xjKfz/qqyXI5fDtXl80lyeywT5E6ZKdVlCVN0zCfz1gZr3DkyO8YjzOtNp00lKUjhkCMAWsMZ+/a1WeNg+GAZin7C5o4trlBNah6pLqMBE+hoLm4WzcUruwdaFEUzGbTXCUSgcFgmDO3ptkire34gE5zvPf4xmOtZTxewVrLZHMTgNFozOZ0kz17zuX8Cy7gS1+8k+FKiQKj0QBjCj7/hc/x3vdeDM4SgqepZ5nsnM96LqCD1T342YYWiEi+TzPva5RN0zAcDHNkqapBb++9vaRtsLktPlguORlrEKMogSgRRLGWVrg1F19yCX/xn/+cea0Ehb++++v8zd3fACM0jfLZz32Oyy69vH/EoM0DYow5nfYBV2Tv32nrdq4ufHbvNSmoUJUjzOrqDrxvetXo6gPbfUCnih1rk4srdY8HQoz4xnPDDTdy221/xmyiuFL45rfu55lnn+UXr/ySb3zz27hScAbuuPN2rrj8SlxRMJlMex8z2Zz0iLAsS5q62ZaGdjbvCtfjhrIqmddzVlZXMTt27FhI5rjGiDNhgMwPGhAlppDzdAPGSqsdGbW974orue32T+AKGKwIX/vbb/PDh37Ejp1nExMcevY5vnr3vQRy58ldX7idKy+7ot/pEPLOz2dzBoNB/r0sCHF7UF3Tgm3qhOCMY3VlFbNr1y6KIufcvsnOyzm3PTPoCNW25NzhgM6PxBC58oor+fwdt+VOkQB/+7X7ePlnv+Dd7zqf2gfmTcC5ip///N+45xt/lztQPNz1hf/I3n37elDVob/pZEpZltuen7Cg4MqyJMWU0+PRkN3n7MZceOGF0lFPXQPBcjfYmQj/lELuIjCQfVLODFUjmMSNN95A0sw7/q+v38trhw9T1w114wlJCElxRYlYx09++hL3fOM7WAuzOdx0041tS072Ab7xFGXRO+vt2v8WU21bRkKMXHTRRWLOP/986vmU4DNXt9zIsB0va21BCAHvMzApiqrH3BqFr3zlr/jNG0e5+6/v5We/+DeOHTvG6uoqs7rBGIurBjShIaVcmn/m2ef46t338Oovf83X7r4b20Lfplk0WmSnFrYXBcyipF7Pa8rSURUFm5vr/LsLzkNmUfnv/+N/6trGlNj29zlXEpUc1ljgg6SJKK1mnOAjcq+aaLZ/2lejCSWS1WBBlWsSMk9rEZM7QZBFyptCJKXcbnO8Am6tPm81BctCMyKKmBagxQApUtjMIe4+a4X/9l//ixhNsH//XtHomU82GQ4GNHWT006zlXUxYraoVP67LCHxrannwlG0TIkaUIN2K9D2XqllomLeAE2CGNer6/HZ+Ol4yuVstjNR72tiCjhn8D4wKByXXHIxHb3DJZdehoihKEpCi+yqNgYbJ6gkokkke2LDQq6pLbHES8zx8ZTZmcrgPRXXARhrT3BBJ/YfmC1juYK0DNayOSjG5mzwqquvkhhbv3XOrl2cc87ZVMOS+XxKUdp+Ec65vn/gZBN8O2zxMudwppr/260tntD+JoITg8ZEWThKa4g+4MQyGo0477x3Y23WasZjy959+6Su55nNtZbJ5kZe+Kk6PiRtHS1LbHTrSGJOOyKSeUhj+9H9Peipd16P071OVTQDEUQNgiEE3/MGKQZC8uzbfzWDKu++EZP904Fr9rM6GlFYQ9JA4XLe3OXeHZDoTSDJthOmt6Mhb1crjmeHlxnjFBOlc8T5HCG/Xx0OufnGmyUFCEGzCdR1ZMdqwYHrrsM6Q4wZfDhZcAKLm2YPL5IdmrRjYYcnUdHjmwjaISxwhqa2tLj02UIDl/n/dse3ON+Tl9mjZsfnCtP2GBbs27ef8XhRkDWiUJXZlq+7/oBUzoKm3EVVmJ5XXy5RL3bMnAQkma3vVba1gyerM26L9DyJ7XcVoRQTopGqKvBNjUW56cY/kaYB56As23S4wxNn7xpx7YEDrIxX8GFRhTFRiPOATQYjjhgUg8WozfF8effaVpWTacPbLa5uiRLdOEW+0n83JNTnTNQVOU9p6gnn7NzJNQf2c845YwZlpt+6mWI143QSfPyWD8i7zt3DoHBIiogmrLMLrr+t83VJhYhkMLMEQP6wfXLptL6i6z6NIfZzVBIr4zFoZD6bMKoK9py7m0994sNi2lyjrPJZB9PdqnJQGHACn/jYLVIVFjS2SY3HFgaM4mdTRGM+8JDS1p1W0/cNJnJFaQsueLvjOJwpW4xLMAgroxVSiFgD0Tf5DAHKsaNHsVYoJDdKfvyWj4qS6xNdb5cImFzLy8dcclclvOfCPXzoTz9M8p7CCs18hp/PMcZQDoqWovbtbix1arzDtrjfp2VuY32del5nLiPmlLwcFtjCMKxKBlXBTTffxB/90Xm5iuXrLYVVyV2YJvf/tc+YTnO7+T8e/Bf9wf95FFuWFM7lLlJrsLZg3vgtaXPXs7ew2MWOGX0HBrDE7fURZbmhQltaDiWGhhgiZeWAxPrGm9z+6U/xgZtvkNxOZ/s5dT3RbZNUaEEBTCY143GJKtxyy4fkmv1XMawc88kEJBGamqaZ5979FnIuHJP2i+/E8E4Wv53uMWMMPjTMZ1PEQlk5NjaOoSRu+pMb+ciH3i8dfplM5ktEjl1ogKYI4raUkHyT3U9Q+NZ99+uhp56mGg0xYpnVDRiHqiAnS0mXTMEm84dxhbKV7jXtaTAfmpY/LBCjJN+QSFx1+ZXcedd/klg3VKWjKEx/kKrLddp2+bZKIq79h0iMgaqqEANNgDpEvv/9H+gjjz6GRrBlRUIIiS2nSk6IydvRgNS2oZzhtU8g22daaQXQ1AyHJSkFYlODUa6/7npu/fQnpHQQm8SgMn2/UZfbbDkwcbJ2k9xEYwgp4UrLdBZ58HsP6pOHnmZjOmNQjXLXKIZyMCJGZT6bt62rCzZXYq76dCGqiWErB5kEMdqmzKl/7XgCMMTocWTWua7nWGcZlgXT2YSitIgmNjfWOGf3Tq6++ipu+djHZDh0+ShdVEwbSpfJkRPODZ6y50YMIhDagPfPP3xYH/rRIzQ+5uMyiZzYxPxaWkdUcrMTQlEW+Ma3FVlBTZvmaq4eZe+dTnpAs6PlDLnhypVd9SpHp9xZ0mBEKZ3hk5/6lBw4cE17lK5mXFWwdKjyZEfn5FQL7yfU+QSFGBRXCG+uzbnnnnv11cOvE7zHuQJrCqIKJG0PURqKsqJpGkLLxR1vIv0p1FNAYFXFJLBW+laapm4oSkNVODY21xmWjsuvuIyb33+TXHTReTR1ZFhZGh8pC9t3kJ26kes0x+YyDdZVYbJTjAl8zPT1Qw//WB979FEm8xo/89jCYsThYyA2CTEGcY4k4GyBGAg+kjuPTNtuZ3JDhEru4ogLTbBCfyJkurlBUZWsjEZMJ5tglT27dnH9Dddx7TX7ZDwuT8hGZBnpnYI7OOXR2eV/rn1DWZT49tyu95nlFQPTWeJHjzymTzz2GEfX1ijFYYqCwlrEFnilbY81bc5h2u4yi2psz/YqSUwLe5eqVClRWsFYoXKOSGKyscHKeMiNN97E9dcfkJ07h4tCrXQpbj43uB1ALmdsgGjV1LeHlVXz4c7ppKYqq3xw2sHaWzOee+F5Dj1xSF//1eukEDGuwA6G+JgydHUWSYpPsedNido3MHQ5h4i0/KCH2FAWlvl0xp5zz+X9N98oe/fuY3U1O9WYFlHX+5rhsELIpfXBYPDOBdBd3Q17HrS9JpOGoiopXYsbajh6bI0Xnn2Op597VtcmU2of8oJN7s2PgJN88NdhiegSl5cPVBtrKazhrJUxl156MXuvfp9ccMG5pAB1nY/25A1SykJ6bK8Kvq77/sIzqcG2BNBrQXsgOYZsXHWdJR6Cto4qJxshRJyzOAdv/G6Tw786zGuHD+tbb77JxsYG0+mUup7TeI+vA4PBkOEwj9XVVfbsOZcLLrhA9rxrN2fvPIvxwBACpJTv22GvEJTCSX+MJ4Ts+FobJoaALU9/quX/DQBJoLkByj18DAAAAABJRU5ErkJggg=="/></div><div class="easybot-messenger-white-block"><span><b>Team Sales</b><br><span>Got some question about pricing?</span></span></div><div class="easybot-messenger-grey-block"><span class="easybot-messenger-reply">Write a reply...</span><img class="write-reply-easybot_messenger_icon" src="data:image/png;base64,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" /></div></div><div class="easybot_messenger_button_wrapper"><div class="easybot_messenger_button"><img class="easybot_messenger_icon_tag" src=""><img class="easybot_messenger_icon" src="data:image/png;base64,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" /></div></div></div>';

    run();
})();

