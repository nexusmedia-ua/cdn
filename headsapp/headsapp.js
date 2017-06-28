(function () {

    const BASEURL = "https://apps.nexusmedia-ua.com/headsapp/api/public";
    const CONFIG_URL = BASEURL + "/config";
    const PING_URL = BASEURL + "/ping";
    const EMAIL_URL = BASEURL + "/mail";
    const STARS_URL = BASEURL + "/stars";

    const CLOSED_MESSAGES_COOKIE = "headsapp-closed-messages";
    const OPENED_MESSAGES_COOKIE = "headsapp-opened-messages";
    const USERDATA_COOKIE = "headsapp-userdata";

    var container = null;
    var inProgress = false;
    var numberOfStars = "";

    const userdata = document.querySelector('script[data-headsapp_api_key]').dataset;
    var cookieData = getUserData();
    userdata.user_id = cookieData.user_id;
    userdata.user_first_time = cookieData.user_first_time;

    function apiRequest(handler, type, data) {
        const request = new XMLHttpRequest();
        request.addEventListener("load", handler);
        request.open("POST", type);
        request.send(JSON.stringify(data));
    }

    function getTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    function setUserData() {
        var user_id = Math.random().toString(36).substr(2, 9);
        var user_first_time = getTimestamp();
        setCookie(USERDATA_COOKIE, {"user_id": user_id, "user_first_time": user_first_time});
    }

    function getUserData() {
        var userdata = getCookie(USERDATA_COOKIE);
        if (typeof userdata !== 'undefined' && userdata !== null && typeof userdata.user_id !== 'undefined' && typeof userdata.user_first_time !== 'undefined') {
            return userdata;
        } else {
            setUserData();
            return getCookie(USERDATA_COOKIE);
        }
    }

    function setCookie(cookieName, value) {
        document.cookie = cookieName + '=' + JSON.stringify(value);
    }

    function getCookie(cookieName) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + cookieName + "=");
        if (parts.length === 2) {
            var cookie = parts.pop().split(";").shift();
            if (cookie) {
                return JSON.parse(cookie);
            }
        }
        return null;
    }

    function saveToCookieDeletedMessage(headsapp) {
        const id = headsapp.getAttribute('data-server-message-id');
        if (headsapp.getAttribute('data-display-interval') !== null) {
            setCookie('headsapp-closed-time-' + id, getTimestamp());
        } else if (!headsapp.getAttribute('data-display')) {
            var closedIds = getCookie(CLOSED_MESSAGES_COOKIE);
            if (!closedIds) {
                closedIds = [];
            }
            closedIds.push(id);
            setCookie(CLOSED_MESSAGES_COOKIE, closedIds);

        } else if (headsapp.getAttribute('data-display') === 'opened') {
            var openedIds = getCookie(OPENED_MESSAGES_COOKIE);
            if (!openedIds) {
                openedIds = [];
            }
            if (openedIds.indexOf(id) === -1) {
                openedIds.push(id);
            }
            setCookie(OPENED_MESSAGES_COOKIE, openedIds);
        }
    }

    function setIdForMessage(id, headsapp) {
        headsapp.setAttribute('data-server-message-id', id);
    }

    function setMessage(headsapp, message) {
        var messageItem = headsapp.querySelector('.headsapp-message');
        if (messageItem) {
            messageItem.innerText = message;
        }
    }

    function setAvatar(headsapp, avatarUrl) {
        headsapp.querySelector('.headsapp-avatar').setAttribute('src', avatarUrl);
    }

    function setName(headsapp, name) {
        headsapp.querySelector('.headsapp-name').innerText = name;
    }

    function setTitle(headsapp, title) {
        headsapp.querySelector('.headsapp-title').innerText = title;
    }

    function setAttrAfterTimeout(headsapp, remove) {
        headsapp.setAttribute('data-show_content', false);
        if (typeof remove !== 'undefined' && remove === true) {
            headsapp.parentNode.removeChild(headsapp);
            pingClose(headsapp);
        }
        inProgress = false;
    }

    function setPopupHandler(headsapp) {
        headsapp.querySelector('.headsapp-close').addEventListener('click', function (e) {
            if (!inProgress) {
                inProgress = true;
                e.stopPropagation();
                if (headsapp.getAttribute('data-display') !== 'default' && headsapp.getAttribute('data-display') !== 'opened') {
                    setFadeEffectToBlock(headsapp);
                    checkingIfAllMessagesClosed(headsapp);
                    closePopup(headsapp, true);
                }
                else {
                    hidePopupWhenDefault(headsapp);
                }
                if (isAllMessagesClosed(headsapp, true)) {
                    hideIcon();
                }
                saveToCookieDeletedMessage(headsapp);
            }
        });
        headsapp.addEventListener('click', choosePopup);
    }

    function checkingIfAllMessagesClosed(headsapp) {
        container = document.querySelector('.headsapp-wrapper');
        const headsapps = container.querySelectorAll('.headsapp');
        for (var i = 0; i < headsapps.length; i++) {
            const headsapp = headsapps[i];
            if (headsapp.getAttribute('data-is_open') === 'false') {
                container.setAttribute('data-container-open', 'false');
            }
        }
    }

    function setFadeEffectToBlock(headsapp) {
        if (headsapp.classList.contains('headsapp-blur')) {
            headsapp.style.filter = 'blur(2px)';
        }
        if (headsapp.classList.contains('headsapp-darken')) {
            headsapp.style.filter = 'contrast(30%)';
        }
    }

    function hidePopupWhenDefault(headsapp) {
        setFadeEffectToBlock(headsapp);
        headsapp.style.opacity = 0;
        headsapp.setAttribute('data-maximized', false);
        headsapp.setAttribute('data-is_open', false);
        headsapp.querySelector('.headsapp-body').style.height = 75 + 'px';
        headsapp.style.filter = '';
        setTimeout(function () {
            headsapp.style.display = 'none';
        }, 500);
        inProgress = false;
    }

    function changeIconToMail() {
        document.querySelector('#headsapp-wrapper').setAttribute('data-container-open', 'false');
    }

    function hideIcon() {
        setTimeout(function () {
            document.querySelector('.headsapp-wrapper').style.opacity = 0;
            setTimeout(function () {
                document.querySelector('.headsapp-wrapper').style.display = 'none';
            }, 500)
        }, 1000);
    }

    function isAllMessagesClosed(headsapp) {
        var openedHiddenBlocks = 0;
        var lengthHeadsapps = document.querySelector('.headsapp-wrapper-main').children;
        var lengthHiddenBlocks = document.querySelectorAll('.headsapp[data-display]');
        if (lengthHeadsapps.length <= 1 && lengthHiddenBlocks.length === 0) {
            return true;
        }
        else if ((lengthHeadsapps.length - lengthHiddenBlocks.length === 0 || lengthHeadsapps.length - lengthHiddenBlocks.length === lengthHiddenBlocks.length)) {
            for (var i = 0; i < lengthHeadsapps.length; i++) {
                if (getComputedStyle(lengthHeadsapps[i]).display !== "none") {
                    openedHiddenBlocks++;
                }
            }
            if (openedHiddenBlocks === 1) {
                changeIconToMail();
                inProgress = false;
            }
        }
    }


    function setContainerHandler(container) {
        const toggler = container.querySelector('.headsapp-toggle');
        toggler.addEventListener('click', function () {
            if (!inProgress) {
                inProgress = true;
                if (container.getAttribute('data-container-open') === 'true') {
                    closeContainer(container);
                } else {
                    openContainer(container);
                }
            }
        });
    }

    function closeContainer(container) {
        container.setAttribute('data-container-open', false);
        const headsapps = container.querySelectorAll('.headsapp');
        for (var i = 0; i < headsapps.length; i++) {
            const headsapp = headsapps[i];
            closePopup(headsapp);
            if (headsapp.getAttribute('data-maximized') === 'true') {
                headsapp.querySelector('.headsapp-close').click();
            }
            if (headsapp.getAttribute('data-maximized') === 'true' && headsapp.getAttribute('data-display') === 'opened') {
                hidePopupWhenDefault(headsapp);
                saveToCookieDeletedMessage(headsapp);
            }
        }
    }

    function openContainer(container) {
        inProgress = false;
        container.setAttribute('data-container-open', true);
        const headsapps = container.querySelectorAll('.headsapp');
        for (var i = 0; i < headsapps.length; i++) {
            const headsapp = headsapps[i];
            openPopup(headsapp, true);
            if (headsapp.style.display === 'none') {
                headsapp.setAttribute('data-is_open', true);
                headsapp.style.display = 'block';
                headsapp.style.opacity = '';
            }
            setTimeout(setScrollWhenScreenSmall, 100);
        }
    }

    function closePopup(headsapp, remove) {
        setTimeout(function () {
            var openconatiner = remove && headsapp.getAttribute('data-maximized');
            document.querySelector('.headsapp-wrapper-main').style.height = '';
            headsapp.setAttribute('data-is_open', false);
            setTimeout(setAttrAfterTimeout, 600, headsapp, remove, openconatiner);
        }, 500);
    }


    function openPopup(headsapp) {
        if (!inProgress)
            headsapp.setAttribute('data-is_open', true);
        headsapp.setAttribute('data-show_content', true);

    }

    function setHeightWhenSmall(headsapp) {
        if (headsapp.querySelector('.headsapp-body-wrapper').offsetHeight + 200 > document.documentElement.clientHeight) {
            document.querySelector('.headsapp-wrapper-main').style.height = document.documentElement.clientHeight - 40 + 'px';
        }
    }

    function styleForMessage(headsapp) {
        const el = headsapp.querySelector('.headsapp-message');
        if (el) {
            if (headsapp.querySelector('.headsapp-message').offsetHeight > 100) {
                headsapp.querySelector('.headsapp-body').style.height = document.documentElement.clientHeight - 300 + 'px';
                headsapp.querySelector('.headsapp-body').style.overflowY = 'scroll';
                headsapp.querySelector('.headsapp-body').style.marginRight = 15 + 'px';
                headsapp.querySelector('.headsapp-body').style.paddingRight = 15 + 'px';
            }
            else {
                headsapp.querySelector('.headsapp-body').style.height = getHeight(headsapp.querySelector('.headsapp-body-wrapper')) + 'px';
            }
        }
    }

    function styleForBodyWrapperSuccess(headsapp) {
        const en = headsapp.querySelector('.headsapp-body-wrapper-success');
        if (en) {
            headsapp.querySelector('.headsapp-message-sent-icon').style.display = 'block';
            setTimeout(function () {
                headsapp.querySelector('.headsapp-message-sent-icon').style.opacity = 1;
                headsapp.querySelector('.headsapp-message-sent-icon').style.transition = 'opacity 0.5s';
            }, 100);
            headsapp.querySelector('.headsapp-body').style.height = headsapp.querySelector('.headsapp-body-wrapper-success').offsetHeight + 'px';
        }
    }

    function styleForBodyStarsBlock(headsapp) {
        const er = headsapp.querySelector('.headsapp-body-stars-block');
        if (er) {
            headsapp.querySelector('.headsapp-body-stars-block').style.overflowY = '';
            headsapp.querySelector('.headsapp-body-stars-block').style.marginRight = '';
            headsapp.querySelector('.headsapp-body-stars-block').style.paddingRight = '';
            if (document.querySelector('.headsapp-form-contact').style.display === 'none') {
                headsapp.querySelector('.headsapp-body-stars-block').style.height = headsapp.querySelector('.headsapp-body-wrapper').offsetHeight + 'px';
            }
            else {

                const we = headsapp.querySelector('.headsapp-body-wrapper');
                if (we) {
                    headsapp.querySelector('.headsapp-body-stars-block').style.height = headsapp.querySelector('.headsapp-body-wrapper').offsetHeight + 'px';
                }
                else {
                    headsapp.querySelector('.headsapp-body-stars-block').style.height = headsapp.querySelector('.headsapp-body-wrapper-success').offsetHeight + 'px';
                }
            }
        }
    }

    function styleForMessageLong(headsapp) {
        const eq = headsapp.querySelector('.headsapp-message-long');
        if (eq) {
            if (headsapp.querySelector('.headsapp-container').style.height < document.documentElement.clientHeight) {
                headsapp.querySelector('.headsapp-body').style.height = getHeight(headsapp.querySelector('.headsapp-body-wrapper')) + 'px';
                headsapp.querySelector('.headsapp-body').style.overflowY = '';
                headsapp.querySelector('.headsapp-body').style.marginRight = '';
                headsapp.querySelector('.headsapp-body').style.paddingRight = '';
            }
        }
    }

    function changeHeadsappBodyHeightOnMobile(headsapp) {
        if (window.matchMedia('(max-device-width: 740px)').matches || window.matchMedia('(max-width: 740px)').matches) {
            var mql = window.matchMedia("(orientation: portrait)");
            if (mql.matches) {
            } else {
                const el = headsapp.querySelector('.headsapp-form-contact');
                if (el) {
                    headsapp.querySelector('.headsapp-body').style.height = document.documentElement.clientHeight - 290 + 'px';
                    headsapp.querySelector('.headsapp-body').style.overflowY = 'auto';
                }
            }
        }
    }

    function maximizePopup(headsapp) {
        pingOpen(headsapp);
        headsapp.setAttribute('data-maximized', true);
        document.querySelector('.headsapp-wrapper-main').style.height = '';
        setHeightWhenSmall(headsapp);
        styleForMessage(headsapp);
        styleForBodyWrapperSuccess(headsapp);
        styleForBodyStarsBlock(headsapp);
        styleForMessageLong(headsapp);
        changeHeadsappBodyHeightOnMobile(headsapp);
        inProgress = false;
    }

    function choosePopup(event) {
        if (!inProgress) {
            inProgress = true;
            var hiddenBlocks = 0;
            var headsapp = event.target.closest('.headsapp');
            if (headsapp.getAttribute('data-maximized') === 'false') {
                var id = headsapp.id;
                const popups = container.querySelectorAll('.headsapp');
                for (var i = 0; i < popups.length; i++) {
                    if (popups[i].id !== id) {
                        closePopup(popups[i]);
                        if (popups[i].style.display === 'none') {
                            hiddenBlocks++;
                        }
                    }
                }
                var main = document.querySelector('.headsapp-wrapper-main');
                if (main.childNodes.length > 1 && hiddenBlocks === 0) {
                    setTimeout(maximizePopup, 1200, headsapp);
                }
                else {
                    console.log(1);
                    maximizePopup(headsapp);
                }
            }
            else {
                inProgress = false;
            }
        }
    }

    const b = document.getElementsByName('body');
    if (typeof b === 'undefined' || b === null || b.length === 0) {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    function createMessagesWrapper() {
        var newContainer = document.createElement('div');
        newContainer.id = 'headsapp-wrapper';
        openContainer(newContainer);
        newContainer.className = 'headsapp-wrapper';
        document.querySelector('body').appendChild(newContainer);
        newContainer.innerHTML = wrapperHtml;
        var newMainContainer = document.createElement('div');
        newMainContainer.className = 'headsapp-wrapper-main';
        newContainer.insertBefore(newMainContainer, newContainer.firstChild);
        setTimeout(setScrollWhenScreenSmall, 600);
        return newContainer;
    }

    function setScrollWhenScreenSmall() {
        var newMainContainer = document.querySelector('.headsapp-wrapper-main');
        if (newMainContainer.scrollHeight > document.documentElement.clientHeight) {
            newMainContainer.style.height = document.documentElement.clientHeight - 40 + 'px';
            newMainContainer.style.overflowY = 'auto';
            newMainContainer.scrollTop = newMainContainer.scrollHeight - newMainContainer.clientHeight;
        } else {
            newMainContainer.style.height = 'auto';
        }
    }

    window.onresize = setScrollWhenScreenSmall;

    function run() {
        container = createMessagesWrapper();
        setContainerHandler(container);
        apiRequest(renderMessages, CONFIG_URL, userdata);
        document.addEventListener('click', function (event) {
            if (event.target.closest('.headsapp-wrapper') === null) {
                minimizePopups();
            }
        })
    }

    function renderMessages() {
        var config = JSON.parse(this.responseText);
        var messages = config.messages;
        if (config.messages) {
            document.querySelector('.headsapp-wrapper').style.display = 'block';
            setTimeout(function () {
                document.querySelector('.headsapp-wrapper').style.opacity = 1;
            }, 200);
            if (messages) {
                for (var i = 0; i < messages.length; i++) {
                    renderMessage(messages[i]);
                }
            }
        }
    }

    function isMessageValid(item) {
        return typeof item !== 'undefined'
            && typeof item.text !== 'undefined'
            && typeof item.staff_icon !== 'undefined'
            && typeof item.staff_name !== 'undefined'
            && typeof item.staff_title !== 'undefined';
    }

    function isMessageForShow(item) {
        return !isMessageWasClosedByUser(item) && isMessageForShowAfterDelay(item) && isMessageInDisplayInterval(item) && !isDisplayAttribute(item);
    }

    function isDisplayAttribute(item) {
        if (typeof item.display_attribute !== 'undefined' && typeof item.dispaly_attribute_value !== 'undefined') {
            if (userdata[item.display_attribute] !== item.dispaly_attribute_value) {
                hideIconWhenNoMessage();
                return true;
            }
        }
        return false;
    }

    function isMessageInDisplayInterval(item) {
        if (typeof item.display_interval !== 'undefined') {
            var lastClose = getCookie('headsapp-closed-time-' + item.id);
            if (lastClose) {
                if ((lastClose + item.display_interval * 60) > getTimestamp()) {
                    hideIconWhenNoMessage();
                    return false;
                }
            }
        }
        return true
    }

    function hideIconWhenNoMessage() {
        setTimeout(function () {
            var lengthHeadsapps = document.querySelector('.headsapp-wrapper-main').children.length;
            if (lengthHeadsapps === 0) {
                hideIconWhenDelay();
            }
        }, 100);
    }

    function isMessageForShowAfterDelay(item) {
        if (typeof item.delay !== 'undefined') {
            var now = getTimestamp();
            if (+(+userdata.user_first_time + +(item.delay * 60)) > now) {
                hideIconWhenNoMessage();
                return false;
            }
        }
        return true;
    }

    function hideIconWhenDelay() {
        document.querySelector('.headsapp-wrapper').style.display = 'none';
    }

    function isMessageWasClosedByUser(item) {
        var closedMessages = getCookie('headsapp-closed-messages');
        if (closedMessages !== null) {
            if (closedMessages.indexOf('' + item.id) !== -1) {
                hideIconWhenNoMessage();
                return true;
            }
        }
        return false;
    }

    function renderMessage(item) {
        if (isMessageValid(item) && isMessageForShow(item)) {

            var type = 'notification';
            const headsapp = createPopup();//new popup for each message
            if (typeof typeof item.type !== 'undefined' && item.type === "notification") {
                if (typeof typeof item.action_type !== 'undefined') {
                    type = setActionTemplate(headsapp, item.action_type);
                }
            } else if (typeof typeof item.type !== 'undefined' && item.type === "stars") {
                type = setActionTemplate(headsapp, item.type);
                starsBlock(headsapp);
            }
            setMessage(headsapp, item.text);
            setAvatar(headsapp, item.staff_icon);
            setName(headsapp, item.staff_name);
            setTitle(headsapp, item.staff_title);
            openPopup(headsapp);

            if (type === 'contact') {
                setDefaultEmailAndNameFromUserData(headsapp);
                setContactHandler(headsapp);
            }

            if (type === 'stars') {
                setDefaultEmailAndNameFromUserData(headsapp);
                setRateHandler(headsapp);
                setContactHandler(headsapp);
                setFormText(headsapp, item.text);
                setStarsText(headsapp, item.stars_text);
                setFormTextStar(headsapp, item.form_text);
                setHeightStarsBlock();
            }

            if (typeof item.text !== 'undefined') {
                getLength(item.text);
            }
            if (typeof item.button_background_color !== 'undefined') {
                setButtonBackground(headsapp, item.button_background_color);
            }
            if (typeof item.button_text_color !== 'undefined') {
                setButtonColor(headsapp, item.button_text_color);
            }
            if (typeof item.heading_background_color !== 'undefined') {
                setHeadingBackgroundColor(headsapp, item.heading_background_color);
            }
            if (typeof item.heading_text_color !== 'undefined') {
                setHeadingTextColor(headsapp, item.heading_text_color);
            }
            if (typeof item.action_url !== 'undefined') {
                setActionUrl(headsapp, item.action_url);
            }
            if (typeof item.action_text !== 'undefined') {
                setActionText(headsapp, item.action_text);
            }
            if (typeof item.fade !== 'undefined') {
                setFadeEffect(headsapp, item.fade);
            }
            if (typeof item.id !== 'undefined') {
                setIdForMessage(item.id, headsapp);
            }
            if (typeof item.display_interval !== 'undefined') {
                headsapp.setAttribute('data-display-interval', item.display_interval)
            }
            if (typeof item.delay !== 'undefined') {
                headsapp.setAttribute('data-display-delay', item.delay)
            }
            if (typeof item.display !== 'undefined') {
                headsapp.setAttribute('data-display', item.display);
                if (item.display === "default") {
                    headsapp.style.display = 'none';
                } else {
                    var openedIds = getCookie(OPENED_MESSAGES_COOKIE);
                    if (openedIds !== null && openedIds.indexOf(item.id) === -1) {
                        headsapp.setAttribute('data-is_open', false);
                        headsapp.style.display = 'none';
                    }
                }
                if (allBlocksInvisible() !== true) {
                    changeIconToMail()
                }
            }

        }
    }

    function allBlocksInvisible() {
        var blocks = document.querySelectorAll(".headsapp");
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].getAttribute('data-is_open') === 'true') {
                return true
            }
        }
    }

    function setFormTextStar(headsapp, form_text) {
        const el = headsapp.querySelector('.headsapp-message-text');
        if (el) {
            el.innerHTML = form_text;
        }
    }

    function setStarsText(headsapp, stars_text) {
        const el = headsapp.querySelector('.headsapp-question');
        if (el) {
            el.innerHTML = stars_text;
        }
    }

    function setFormText(headsapp, text) {
        var messageItem = headsapp.querySelector('.headsapp-message-gorgeous');
        messageItem.innerText = text;
    }


    function setFadeEffect(headsapp, fade) {
        headsapp.classList.add('headsapp-' + fade);
    }

    function starsBlock(headsapp) {
        headsapp.querySelector('.headsapp-body').classList.add('headsapp-body-stars-block');
    }

    function setActionUrl(headsapp, formUrl) {
        const el = headsapp.querySelector('form.headsapp-url-action');
        if (el) {
            el.setAttribute("action", formUrl);
            el.setAttribute("target", "_blank");
        }
    }

    function setActionText(headsapp, text) {
        headsapp.querySelector('button').innerText = text;
    }

    function getLength(text) {
        var sliced = text.slice(0, 100);
        if (sliced.length < text.length) {
            const words = sliced.split(' ');
            words.pop();
            sliced = words.join(' ');
            sliced = sliced.replace(/[,\!\?\:\;\.]$/, '');
            sliced += '...';
            const el = document.querySelector('#headsapp-star-block');
            if (!el) {
                var shortMessageBlock = document.createElement('div');
                shortMessageBlock.className = "headsapp-message-short";
                shortMessageBlock.innerHTML = sliced;
                var headsappBodyWrapper = document.querySelector('.headsapp-body-wrapper');
                headsappBodyWrapper.insertBefore(shortMessageBlock, headsappBodyWrapper.firstChild);
                var heightShortMessageBlock = shortMessageBlock.offsetHeight;
                document.querySelector('.headsapp-body').style.height = heightShortMessageBlock + "px";
                document.querySelector('.headsapp-message').classList.add("headsapp-message-long");
            }
        }
        else {
            document.querySelector('.headsapp-message').style.display = "block";
        }
    }

    function deleteHeightFromPopupI(popups) {
        const messageBlock = popups.querySelector('.headsapp-message');
        if (messageBlock) {
            popups.querySelector('.headsapp-body').style.height = '';
        }
    }

    function styleForPopupIMessageShort(popups) {
        const el = popups.querySelector('.headsapp-message-short');
        if (el) {
            popups.querySelector('.headsapp-body').style.height = popups.querySelector('.headsapp-message-short').offsetHeight + 'px';
            popups.querySelector('.headsapp-body').style.overflowY = '';
            popups.querySelector('.headsapp-body').style.marginRight = '';
            popups.querySelector('.headsapp-body').style.paddingRight = '';
        }
    }

    function styleForPopupIBodyWrapperSuccess(popups) {
        const en = popups.querySelector('.headsapp-body-wrapper-success');
        if (en) {
            popups.querySelector('.headsapp-body').style.height = popups.querySelector('.headsapp-your-message-sent-text').offsetHeight + 'px';
            popups.querySelector('.headsapp-message-sent-icon').style.opacity = 0;
            popups.querySelector('.headsapp-message-sent-icon').style.transition = 'opacity 0.5s';
            popups.querySelector('.headsapp-message-sent-icon').style.display = 'none';
        }
    }

    function minimizePopups() {
        inProgress = false;
        container = document.querySelector('.headsapp-wrapper');
        if (container.getAttribute('data-container-open') === 'true') {
            const popups = container.querySelectorAll('.headsapp');
            for (var i = 0; i < popups.length; i++) {
                openPopup(popups[i]);
                popups[i].setAttribute('data-maximized', false);
                deleteHeightFromPopupI(popups[i]);
                setTimeout(setScrollWhenScreenSmall, 600);
                document.querySelector('.headsapp-wrapper-main').scrollTop = document.querySelector('.headsapp-wrapper-main').scrollHeight;
                styleForPopupIMessageShort(popups[i]);
                styleForPopupIBodyWrapperSuccess(popups[i]);

                const er = container.querySelector('.headsapp-body-stars-block');
                if (er) {
                    const containerBodyWrapper = container.querySelector('.headsapp-body-wrapper');
                    if (containerBodyWrapper) {
                        const starsFormBlock = container.querySelector('.headsapp-form-contact');
                        if (starsFormBlock) {
                            if (starsFormBlock.style.display === 'block') {
                                container.querySelector('.headsapp-body-stars-block').style.height = container.querySelector('.headsapp-message-text').offsetHeight + 'px';
                            }
                            else {
                                setHeightStarsBlock();
                            }
                            const gorgeous = container.querySelector('.headsapp-message-gorgeous');
                            if (gorgeous) {
                                if (gorgeous.style.display === 'block') {
                                    container.querySelector('.headsapp-body-stars-block').style.height = gorgeous.offsetHeight + 'px';
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function setDefaultEmailAndNameFromUserData(headsapp) {
        headsapp.querySelector('input[name="user_name"]').value = userdata.user_name;
        headsapp.querySelector('input[name="user_email"]').value = userdata.user_email;
    }

    function setHeightStarsBlock() {
        const el = document.querySelector('.headsapp-body-wrapper-success');
        if (!el) {
            const el = document.querySelector('.headsapp-body-stars-block');
            if (el) {
                el.style.height = document.querySelector('#headsapp-star-block').offsetHeight + 'px';
            }
        }
    }

    function setButtonBackground(headsapp, buttonBackground) {
        const el = headsapp.querySelector('button');
        if (el) {
            el.style.backgroundColor = buttonBackground;
        }
    }

    function setButtonColor(headsapp, buttonColor) {
        const el = headsapp.querySelector('button');
        if (el) {
            el.style.color = buttonColor;
        }
    }

    function getHeight(el) {
        var elHeight = el.offsetHeight;
        elHeight += parseInt(window.getComputedStyle(el).getPropertyValue('margin-top'));
        elHeight += parseInt(window.getComputedStyle(el).getPropertyValue('margin-bottom'));
        return elHeight;
    }

    function setHeadingBackgroundColor(headsapp, headingBackgroundColor) {
        headsapp.querySelector('.headsapp-header').style.backgroundColor = headingBackgroundColor;
    }

    function setHeadingTextColor(headsapp, headingTextColor) {
        headsapp.querySelector('.headsapp-userinfo').style.color = headingTextColor;
    }

    function setActionTemplate(headsapp, tmplName) {
        headsapp.querySelector('.headsapp-body-wrapper').innerHTML = getTmpl(tmplName);
        return tmplName;
    }

    function setContactHandler(headsapp) {
        headsapp.querySelector('.headsapp-form-contact').addEventListener('submit', sendContactForm);
    }

    function clickRate(event) {
        setTimeout(function () {
            inProgress = false;
            var headsapp = getPopupByinternalNode(event.target);
            headsapp.querySelector('.headsapp-question').style.display = 'none';
            headsapp.querySelector('.headsapp-review-stars').style.display = 'none';
            headsapp.querySelector('.headsapp-message-text').style.display = 'inline';
            setTimeout(function () {
                headsapp.querySelector('.headsapp-body').style.height = headsapp.querySelector('#headsapp-star-block').offsetHeight + 'px';
            }, 100);

            if (event.target.title === 'gorgeous') {
                headsapp.querySelector('.headsapp-btn-send').style.display = 'block';
                headsapp.querySelector('.headsapp-message-gorgeous').style.display = 'block';
                headsapp.querySelector('.headsapp-message-text').style.display = 'none';
            } else {
                headsapp.querySelector('.headsapp-form-contact').style.display = 'block';
            }
            apiRequest(function () {
            }, STARS_URL, {"rate": event.target.title});
        }, 1200);
        if (event.target.title === 'gorgeous') {
            numberOfStars = "✭ ✭ ✭ ✭ ✭"
        } else if (event.target.title === 'good') {
            numberOfStars = "✭ ✭ ✭ ✭"
        } else if (event.target.title === 'regular') {
            numberOfStars = "✭ ✭ ✭"
        } else if (event.target.title === 'poor') {
            numberOfStars = "✭ ✭"
        } else if (event.target.title === 'bad') {
            numberOfStars = "✭"
        }
    }

    function setRateHandler(headsapp) {
        const labels = headsapp.querySelectorAll('label');
        for (var i = 0; i < labels.length; i++) {
            labels[i].addEventListener('click', clickRate);
        }
    }

    function sendContactForm(event) {
        inProgress = false;
        event.preventDefault();
        const headsapp = getPopupByinternalNode(event.target);
        removeTooltips(headsapp);
        const inputs = headsapp.querySelectorAll('input, textarea');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].style.borderColor = '#eeeeee';
        }

        var userNameField = headsapp.querySelector('input[name="user_name"]');
        var userEmailField = headsapp.querySelector('input[name="user_email"]');
        var userMessageField = headsapp.querySelector('textarea[name="message"]');

        var isFormValid = true;

        if (!checkName(userNameField)) {
            isFormValid = false
        }
        if (!checkEmail(userEmailField)) {
            isFormValid = false
        }
        if (!checkMessage(userMessageField)) {
            isFormValid = false
        }
        if (isFormValid) {
            var data = {};
            data.type = 'contact';
            data.id = headsapp.id;
            data.user_name = userNameField.value;
            data.user_email = userEmailField.value;
            data.rate = numberOfStars;
            data.message = userMessageField.value;
            headsapp.querySelector('.headsapp-loader-main').style.opacity = 1;
            headsapp.querySelector('.headsapp-loader-main').style.transition = 'opacity 0.5s';
            headsapp.querySelector('.headsapp-loader-main').style.zIndex = 1;
            apiRequest(contactAfter, EMAIL_URL, data);
            numberOfStars = '';
        }
    }

    function removeTooltips(headsapp) {
        var tips = headsapp.querySelectorAll('.headsapp-tooltiptext');
        for (var i = 0; i < tips.length; i++) {
            var tip = tips[i];
            tip.parentNode.removeChild(tip);
        }

        const inputs = headsapp.querySelectorAll('input, textarea');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].oninput = function (el) {
                this.style.borderColor = '';
                var items = this.parentNode.querySelectorAll('.headsapp-tooltiptext');
                for (var k = 0; k < items.length; k++) {
                    var item = items[k];
                    item.parentNode.removeChild(item)
                }
            }
        }
    }

    function checkName(field) {
        if (!validateField(field.value)) {
            addTooltip(field, 'Name is required');
            return false;
        }
        return true;
    }

    function checkEmail(field) {
        if (!validateField(field.value)) {
            addTooltip(field, 'Email is require');
            return false;
        } else {
            if (!validateEmail(field)) {
                addTooltip(field, 'Please enter correct email address');
                return false;
            }
        }
        return true;
    }

    function checkMessage(field) {
        if (!validateField(field.value)) {
            addTooltip(field, 'Message field is required');
            return false;
        }
        return true;
    }

    function addTooltip(field, text) {
        field.style.borderColor = 'red';
        const tooltip = document.createElement('span');
        tooltip.className = 'headsapp-tooltiptext';
        field.parentElement.appendChild(tooltip);
        tooltip.innerHTML = text;
    }

    function validateField(value) {
        return value.length > 0;
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.value);
    }

    function contactAfter() {
        var resp = JSON.parse(this.responseText);
        if (resp.success) {
            getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body-wrapper').style.opacity = 0;
            getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body-wrapper').style.transition = 'opacity 0.5s';
            setTimeout(function () {
                getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body').innerHTML = getTmpl('success');
                getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body').style.height = 'auto';
                getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body-wrapper-success').style.opacity = 1;
                getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body-wrapper-success').style.transition = 'opacity 1s';
            }, 200);
            setTimeout(function () {
                document.querySelector('.headsapp-wrapper-main').innerHTML = '';
                run();
            }, 2000);
        }
    }

    function reRendering() {
        document.querySelector('.headsapp-wrapper-main').innerHTML = '';
        run();
    }

    function pingClose(headsapp) {
        apiRequest(function () {
        }, PING_URL, {"type": "close", "id": headsapp.getAttribute('data-server-message-id'), "action": "close"})
    }

    function pingOpen(headsapp) {
        apiRequest(function () {
        }, PING_URL, {"type": "open", "id": headsapp.id, "action": "open"})
    }

    function getPopupByinternalNode(internalNode) {
        return internalNode.closest('.headsapp');
    }

    function getTmpl(tmplName) {
        switch (tmplName) {
            case ("stars"): {
                return '<div class="headsapp-loader-main"> <div class="headsapp-loader"> <div class="headsapp-next-spinner"> <svg class="headsapp-next-icon headsapp-next-icon--40" preserveAspectRatio="xMinYMin"><circle class="headsapp-next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg> </div> </div> </div> <div id="headsapp-star-block"> <div class="headsapp-question"></div> <div class="headsapp-message-gorgeous" style="display: none;"></div> <div class="headsapp-message-text" style="display: none;"></div> <div class="headsapp-review-stars"> <input id="headsapp-star-4" type="radio" name="reviewStars"> <label title="gorgeous" value="5-stars" for="headsapp-star-4"></label> <input id="headsapp-star-3" type="radio" name="reviewStars"> <label title="good" value="4-stars" for="headsapp-star-3"></label> <input id="headsapp-star-2" type="radio" name="reviewStars"> <label title="regular" value="3-stars" for="headsapp-star-2"></label> <input id="headsapp-star-1" type="radio" name="reviewStars"> <label title="poor" value="2-stars" for="headsapp-star-1"></label> <input id="headsapp-star-0" type="radio" name="reviewStars"> <label title="bad" value="1-star" for="headsapp-star-0"></label> </div> <div class="headsapp-btn-send" style="display: none"> <form class="headsapp-url-action"> <button class="headsapp-button-send type="submit">URL</button> </form> </div> <form class="headsapp-form-contact" style="display: none;" action=""> <div class="headsapp-name headsapp-input">Name<input class="headsapp-input-field" maxlength="30" type="text" name="user_name" value=""> </div> <div class="headsapp-name-email headsapp-input">Email<input class="headsapp-input-field" type="text" name="user_email" value="" type="email"> </div> <div class="headsapp-name-message headsapp-input"> Message<textarea name="message" contenteditable="" class="headsapp-message-editor"></textarea> </div> <div class="headsapp-btn-send"> <button class="headsapp-button-send" type="submit">Send</button> </div> </form> <div style="clear:both;"></div> </div>';
            }

            case ("contact"): {
                return '<div class="headsapp-loader-main"> <div class="headsapp-loader"> <div class="headsapp-next-spinner"> <svg class="headsapp-next-icon headsapp-next-icon--40" preserveAspectRatio="xMinYMin"><circle class="headsapp-next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg> </div> </div> </div> <div class="headsapp-message"></div> <form class="headsapp-form-contact" action=""> <div class="headsapp-name headsapp-input"> <span class="headsapp-input-title">Name</span><input class="headsapp-input-field" maxlength="30" type="text" name="user_name" value = ""> </div> <div class="headsapp-name-email headsapp-input"> <span class="headsapp-input-title">Email</span><input class="headsapp-input-field" type="text" name="user_email" type="email" value=""> </div> <div class="headsapp-name-message headsapp-input"> <span class="headsapp-input-title">Message</span><textarea name="message" contenteditable="" class="headsapp-message-editor"></textarea> </div> <div class="headsapp-btn-send"> <button class="headsapp-button-send" type="submit">Send</button> </div> </form>';
            }

            case ( "url"): {
                return '<span class="headsapp-message"></span> <div class="headsapp-btn-send"> <form> <button class="headsapp-button-send" type="submit">URL</button> </form> </div>';
            }

            case ( "success"): {
                return ' <div class="headsapp-body-wrapper-success"> <div class="headsapp-message-sent-icon"> <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDoAABSCAABFVgAADqXAAAXb9daH5AAACRASURBVHgBADAkz9sBdvMiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWAAAAQQAAADgAAAAoAAAAIQAAABUAAAALAAAAAAAAAPUAAADrAAAA3wAAANcAAADJAAAAvwAAAOoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEwAAAF4AAABaAAAAMwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAEgAAACcAAABIAAAAAAAAAP8AAADNAAAApgAAAKIAAADtAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF28yIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZAAAAdAAAAGcAAAALAAAAAAAAAPUAAADEAAAAwQAAANYAAADaAAAA6QAAAPQAAAAAAAAADAAAABcAAAAmAAAAKgAAAD4AAAA9AAAACwAAAAAAAAD2AAAAngAAAIYAAADnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABdvMiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAABxAAAAfgAAAAwAAAD/AAAAuQAAAJ8AAACzAAAA9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAE0AAABhAAAARwAAAAEAAAD0AAAAggAAAI8AAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXbzIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACUAAACpAAAAMQAAAAAAAACuAAAAggAAANEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC8AAACAAAAAUAAAAAAAAADQAAAAWwAAANYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8AAADMAAAAMQAAAN0AAABGAAAAUwAAANEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADRAAAAUQAAAEYAAADdAAAAMAAAAMkAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGYAAACtAAAADgAAAKkAAAAyAAAAuwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC7AAAAMgAAAKgAAAAMAAAArAAAAGYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGkAAACZAAAAAgAAAHwAAABYAAAA8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPIAAABZAAAAfAAAAAIAAACPAAAAHQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE4AAACTAAAA/wAAAG0AAACVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIUAAADqAAAA3wAAAOMAAAAAAAAAAAAAAAoAAAA1AAAAwQAAAAACAAAAAAAAAAAAAAAAAAAAAAAAACkAAAClAAAAAwAAAHoAAACVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmwAAALwAAAAAAAAAAAAAAAoAAACxAAAAugAAAE4AAAAABAAAAAAAAAAAAAAAAAAAAAUAAACnAAAADAAAAKgAAACIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAC5AAAALQAAAOcAAADaAAAAAAIAAAAAAAAAAAAAAAAAAABwAAAALwAAAN0AAABnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAC5AAAALQAAAOsAAABCAAAA2AAAAAACAAAAAAAAAAAAAAAaAAAAfgAAAAAAAABpAAAA8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAALQAAAPYAAABaAAAA2AAAAAAAAAAAAgAAAAAAAAAAAAAAegAAAAwAAACuAAAAuwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABDAAAAvAAAAAAAAAAAAAAAAAQAAAAAAAAAFAAAAGIAAAD/AAAAggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAFwAAAAJAAAAugAAANEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAGQAAAFIAAAAABAAAAAAAAABcAAAAAAAAAJ8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAEQAAAL4AAAD0AAAArgQAAAAWAAAAMgAAAPUAAACxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAPcAAAAdAAAACgAAABoCAAAAQgAAAAEAAADEAAAA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAxAAAAAEAAABBAgAAADcAAAAAAAAAwQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAzwAAAIcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMEAAAAAAAAANAIAAAAoAAAAAAAAANQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJwAAABMAAAB4AAAAhwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUAAAAAAAAACcCAAAAJAAAAAAAAADbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALEAAABaAAAA+gAAAHgAAACHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2wAAAAAAAAAlAgAAABcAAAAAAAAA6wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArQAAAFoAAAD6AAAAeAAAAIcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOsAAAAAAAAAFwIAAAANAAAAAAAAAPMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACtAAAAWgAAAPoAAAB4AAAAhwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADzAAAAAAAAAA0CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK0AAABaAAAA+gAAAHgAAACHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD6AgAAAPMAAAAAAAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArQAAAFoAAAD6AAAAeAAAAIcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0AAAAAAAAA8wIAAADpAAAAAAAAABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACtAAAAWQAAAPoAAAB4AAAAhwAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABBAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVAAAAAAAAAO8CAAAA3AAAAAAAAAAlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK4AAABZAAAA+gAAAHgAAACHAAAAAAAAAAoAAACxAAAARAAAAOcAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJQAAAAAAAADbAgAAANgAAAAAAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArgAAAFkAAAD6AAAAeAAAAIsAAACxAAAARAAAAOcAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAAAAA2QIAAADJAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACuAAAAWQAAAPoAAAB0AAAARAAAAOcAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAM0CAAAAvwAAAP8AAAA9AAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK4AAABaAAAA+gAAAOcAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAPQAAAP8AAAC+AgAAAOkAAADOAAAACwAAAE8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArQAAAFUAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATgAAAAsAAADOAAAA5gIAAAAAAAAApAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAApgAAAAACAAAAAAAAAKQAAAD3AAAARwAAAC4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4AAABIAAAA9wAAAKIAAAAAAgAAAAAAAADsAAAAnwAAAAEAAAB/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAQAAAJ8AAADsAAAAAAIAAAAAAAAAAAAAAIUAAAD0AAAAUgAAAEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAAUwAAAPQAAACFAAAAAAAAAAACAAAAAAAAAAAAAADmAAAAggAAAAAAAACXAAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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"> </div> <div class="headsapp-your-message-sent-text">Thank you for contacting us, we&#39;ll get back to you within several hours! </div> </div> ';
            }
            default: {
                return '<span class="headsapp-message"></span>';
            }
        }
    }

    function createPopup() {
        const id = Math.random().toString(36).substr(2, 9);
        var child = document.createElement('div');
        child.innerHTML = '<div id="' + id + '" class="headsapp" data-is_open="false" data-show_content="false" data-maximized="false"> <div class="headsapp-container"> <div class="headsapp-header"> <div class="headsapp-close"> <i aria-hidden="true">×</i> </div> <div class="headsapp-userdata">  <img class="headsapp-avatar" src="" alt="avatar"> <div class="headsapp-userinfo"> <span class="headsapp-name"></span> <span class="headsapp-title"></span> </div> </div> <div class="headsapp-clear"></div> </div> <div class="headsapp-body"> <div class="headsapp-body-wrapper"> </div> </div> </div> </div>';
        headsapp = child.firstChild;
        container = document.querySelector('.headsapp-wrapper-main');
        container.insertBefore(headsapp, container.querySelector('div'));
        setPopupHandler(headsapp);
        return headsapp;
    }

    const wrapperHtml = '<style> @media screen and (max-width: 740px),(max-device-width: 740px){#headsapp-wrapper{width:85%;right:0;margin-right:31px}body #headsapp-wrapper .headsapp-toggle .is-close-icon{right:-15px;bottom:-24px}body .headsapp .headsapp-name{overflow:hidden;text-overflow:ellipsis}.headsapp-wrapper .headsapp{width:100%}}.headsapp .headsapp-name{display:block;font-weight:400}.headsapp .headsapp-message-gorgeous,.headsapp .headsapp-message-text{font-size:19px}body .headsapp-wrapper .headsapp .headsapp-message-long{font-size:17px;line-height:23px}.headsapp-wrapper-main::-webkit-scrollbar{width:0}.headsapp-wrapper-main{-ms-overflow-style:none;overflow:-moz-scrollbars-none;padding-left: 10px;padding-right: 10px;padding-bottom: 10px;}.headsapp .headsapp-input{position:relative;font-size:15px;font-weight:inherit;margin-top:1em;margin-bottom:1em}.headsapp .headsapp-tooltiptext{background-color:red;color:#fff;text-align:center;border-radius:6px;padding:5px 10px;position:absolute;font-weight:900;left:50%;top:7px;transform:translate(-50%,-50%);white-space:nowrap}.headsapp .headsapp-tooltiptext::after{content:"";position:absolute;top:100%;left:50%;margin-left:-5px;border-width:5px;border-style:solid;border-color:red transparent transparent}.headsapp .headsapp-loader-main{z-index:-1;position:absolute;width:100%;height:100%;background-color:rgba(255,255,255,0.7);opacity:0}.headsapp .headsapp-loader{width:40px;height:30px;position:absolute;top:50%;left:50%;margin:-20px 0 0 -15px}.headsapp .headsapp-loader .headsapp-next-spinner{display:inline-block;-webkit-animation:headsapp-next-spinner-rotate 600ms linear infinite;animation:headsapp-next-spinner-rotate 600ms linear infinite;position:relative;line-height:0}.headsapp .headsapp-loader .headsapp-next-spinner>.headsapp-next-icon{position:static;width:40px;height:40px;background-size:contain;background-position:center;background-repeat:no-repeat;top:-.15em;display:inline-block}.headsapp .headsapp-loader .headsapp-next-spinner .headsapp-next-spinner__ring{stroke:#479ccf;stroke-dasharray:100%;stroke-width:2px;stroke-linecap:round;fill:none}@-webkit-keyframes headsapp-next-spinner-rotate{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes headsapp-next-spinner-rotate{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.headsapp .headsapp-body-wrapper-success{opacity:0}.headsapp .headsapp-body-stars-block .headsapp-message{font-size:19px}.headsapp[data-maximized="false"] .headsapp-message{display:none}.headsapp[data-maximized="true"] .headsapp-body{cursor:default}.headsapp[data-maximized="true"] .headsapp-message-short{display:none}.headsapp .headsapp-message-short{font-size:19px;line-height:25px}.headsapp{font-family:sans-serif;bottom:40px;right:40px;background-color:#fffeff;box-shadow:0 0 8px -4px #000 inset;font-size:13px;font-weight:100;width:400px;border-radius:5px;color:#3b4347}.headsapp .headsapp-avatar{display:inline-block;max-height:50px;max-width:50px;border-radius:50%;margin:9px 6px 5px}.headsapp .headsapp-userinfo{float:right;margin:16px 13px 13px;color:#373737;font-size:initial}.headsapp .headsapp-userdata{display:inline-block}.headsapp .headsapp-close{font-size:30px;right:30px;top:16px;font-family:sans-serif;position:absolute;cursor:pointer}.headsapp .headsapp-clear{clear:both}body .headsapp-wrapper div.headsapp-toggle i{height:56px;width:56px;line-height:53px;font-size:30px;right:-18px;bottom:-18px;font-family:sans-serif;transition:all .3s;cursor:pointer;opacity:1;float:right;position:absolute;background-color:#03a9f4;border-radius:50%;color:#fff;text-align:center;box-shadow:0 0 2px #535353;text-decoration:none;font-style:normal}.headsapp-wrapper div.headsapp-toggle:hover i{background-color:#0a8cd1;color:#f9fcfd}.headsapp-wrapper .headsapp i{text-decoration:none;font-style:normal}.headsapp .headsapp-title{font-size:12px;line-height:1.3rem;clear:both}.headsapp .headsapp-message,.headsapp .headsapp-question{font-size:19px;display:block}body .headsapp .headsapp-name-email input.headsapp-input-field,body .headsapp .headsapp-name input.headsapp-input-field{border-left:0;border-right:0;border-top:0;outline:none;width:100%;line-height:34px;font-size:16px;color:inherit;background-color:transparent;transition:border-color .5s;height:initial;padding:0;border-bottom:2px solid #eee;box-shadow:none;border-radius:0}body .headsapp .headsapp-head-email{font-size:20px;padding-bottom:10px}body .headsapp .headsapp-body{margin:30px;position:relative;cursor:pointer;-webkit-overflow-scrolling:touch;transition:height .3s ease-out;overflow:hidden}body .headsapp .headsapp-name-message .headsapp-message-editor{border-left:0;border-right:0;border-top:0;border-bottom:2px solid #eee;outline:none;width:100%;line-height:25px;font-size:16px;color:inherit;font-weight:inherit;cursor:auto;transition:border-color .5s;min-height:initial;height:initial;padding:initial;box-shadow:none;border-radius:0}body .headsapp .headsapp-btn-send{text-align:center;margin-top:10px}.headsapp .headsapp-btn-send button.headsapp-button-send{border:0;border-radius:4px;background-color:#00a1f5;color:#fff;font-size:16px;outline:none;cursor:pointer;padding:12px 15px;font-weight:500}.headsapp .headsapp-btn-send button.headsapp-button-send:active{opacity:.9}body .headsapp .headsapp-wrapper div.headsapp-toggle i{height:56px;width:56px;line-height:53px;font-size:30px;right:-28px;bottom:-28px;font-family:sans-serif;transition:all .3s;cursor:pointer;opacity:1;text-align:center}body .headsapp .headsapp-header{box-shadow:inset 0 -8px 15px -15px #000;border-top-left-radius:5px;border-top-right-radius:5px;padding:2px 13px;position:relative;background-color:#f1f1f1}body .headsapp .headsapp-incomin-message{background-color:#f1f1f1;border:1px solid #e7e7e7;border-radius:5px;padding:10px;color:#2e393d;font-weight:400;line-height:23px;float:left;margin:10px 0}body .headsapp .headsapp-outgoing-message{float:right;margin-right:10px;background-color:#00a1f5;color:#fff;position:relative}body .headsapp .headsapp-outgoing-message:after{position:absolute;right:0;border-right:45px solid #00a1f5;border-bottom:44px solid transparent}body .headsapp .headsapp-header:before{content:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAYCAYAAAB0kZQKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDoAABSCAABFVgAADqXAAAXb9daH5AAAALgSURBVHjaxJZBaxNBGIa/b3bTya5Z4xpSJVBICLZpFdI0u9A0TdIiJAcRLBowS7x4iL0V+gMEDy1407teRG/+hP6IFk2h6tJ6iI2QUluNNjbZ9ZIN0yVtTNvVvXwz7MD38M7MOy+apgn/+8P5+fnOuMv/f0LIM83Zav5LGJ5pTNoVmcZGuzoKQRgAbnp6WlxeXr4NAK42IGcDcwzCqpzf75e8Xu/TWCx2EQAGGBjiJMgRJfb39wcIIWFN0x4DgBsAaBvEUUUIcya4RqPBAwB4PJ5Hi4uLWQAQ2iCObg0LQTY3N5vWPBwOP5+bm4swII4pQthxpVJpdSaEyLOzsy9UVQ0AgOgkCLGbl2EYdWvicrmCmqa9HBsbu+IkCLGbkWEY39kFbrf7RqlUeqUoiqWIu31zzu3WsEoYAACtVmvHvohSer1YLL5Op9PBY0DOBEMYRzQBwDg8PKx2W0gpHc7n828LhYICABfO88Cy22ECgHFwcPD5WI/n+aupVOrNwsLCHQDwMKrYTQ1Pq4QBAEa9XtdPfHYRxUgk8mxpaemJz+e71EUVvl8QTlGUjmMCAB8IBLhQKKT1igCCIESTyeRNSZLera+vf2Ma960EpyhKxzEBwKXr+o9sNvsQEQd6PsE87w8Gg/fi8Tiurq6WG40G2CDwhKzSFYIAANdsNvmZmZkYpTT8V6kIkZMkKZFKpbKDg4Mf19bWdmxnA3vBsBCWGtz4+Lggy3Kur2DC876hoaG76XT6GsdxH3Rd/2m7vsfCWBBH1Njd3f2qquoDRKT9xkVK6fDIyEhhcnJSqlar72u1WrNXbLRDIACQWq1mTE1NXRZFMX6q4IrIi6KoqKp6P5FIuPb29ja2t7d/2zypA2OH6GQM0zQ/jY6O5hFROHWKRhREUUxOTEwUM5mMIMvyRrlcrtsjIwtxBGZra+tXNBqter3eW2eO9IhuSmkyFAqVcrlcOJPJfFlZWalYIH8GAK7nwS6rWCe6AAAAAElFTkSuQmCC");bottom:4px;left:50px;border:0;width:26px;height:20px;position:absolute}body .headsapp .headsapp-btn-send-chat{padding-bottom:34px;padding-top:20px;width:100%;border-top:2px solid #eee;margin-top:10px}body .headsapp .headsapp-btn-send-chat-text{width:80%;float:left;font-size:15px;line-height:22px;font-weight:400}body .headsapp .headsapp-btn-send-chat button{border-radius:4px;background-color:transparent;border:2px solid #00a1f5;color:#00a1f5;padding:10px 17px;font-size:15px;outline:none;cursor:pointer;float:right}body .headsapp .headsapp-btn-send-chat button:active{opacity:.7}body .headsapp .headsapp-btn-send-chat-text .headsapp-message-editor{outline:none;padding-bottom:20px} @-moz-document url-prefix() @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {body .headsapp-wrapper[data-container-open="true"] .headsapp-toggle .is-close-icon {bottom: -20px !important;}} body .headsapp-wrapper[data-container-open="true"] div.headsapp-toggle i .x-icon img {opacity:1;height: 15px;width: 15px;margin-left: -7px;margin-top: -7px;}body .headsapp .headsapp-chat{max-height:400px;float:left;overflow-y:scroll;position:absolute;right:-24px}body .headsapp .headsapp-chat-main{height:440px}.headsapp.headsapp-review-stars input:checked ~ label,.headsapp .headsapp-review-stars label,.headsapp .headsapp-review-stars label:hover,.headsapp .headsapp-review-stars label:hover ~ label{background:url(data:image/png;base64,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AHwABQgAAAUJAAAAAIgAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHQABgoWAAEDAAADBQAABQgsAAAAXwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAABzAAUIAAAA/wAAAP8AAAUIAAAAAIEAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBAAYKCgAAAQAA//8AAP//AAABAwAABQgcAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApAAAAYQAFCAAAAP8AAAD/AAAA/wAAAP8AAAUIAAAAAHcAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhgAGCgQA//8AAP//AAD//wAA//8AAP//AAAAAQAABQgPAAAAewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAACBFAAAwUAAP/+AAD//gAA//4AAP/+AAD//gAA//4AAAQHAAAAAGoAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABUAAAAyAAAAMQAAAGAAAwUAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAgGAPz4pwAAAKoAAADNAAAA0AAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAHQAAADEAAAAyAAAAMQAAADIAAQEcAAEDAAACAgAAAwUAAAECAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFAAACAjYA/vw2AP79AAD//gAA///dAAAAzwAAAM4AAADPAAAAzQAAAOsAAAAAAAAAAAAAAAAB/9BGBgAAAH4AAAA0AAAAMgABARUAAQIAAAIDAAABAgAAAQIAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/+AAD//gAA/v4AAP/+AAD//gAA///lAAAAzQAAAMMAAACNBAAAAPoAAADYAAAAegAFCQEAAQEAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAQMAAAMDAAAAAAAAAAAAAP79GwD8+RUAAACRAC+5/wQAAAAAAAAApAAAABQA/fuPAAMEAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/+AAD8+f0AAABYAC+5vgAAAAAEAAAAAAAAAAAAAACQAP78FAAA/3sAAgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD8+v8AAABnAC+5rwAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAHwA/v0SAAAAaQACAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/AAAAAB5AC+5nQAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAbQD+/Q8A//9aAAECAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAA//6IAAAAiQAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAP0AAABhAP/+EgAA/0gAAQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAA//+bAAAAegAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+gAAAFMA///IAP79AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD+/QAA//+uAAAAaQAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2AAAASAAAANMA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAAAAC+AAAAWQAAAP0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPEAAAByAAAAAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAAAAAAAAAAZQAAAPoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFgD//wAA//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAECAAAAARgAAADeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAD/AAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAP//AAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf8AAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAD//gAA//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8BAAABAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAA//4AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/gAAAgAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAP/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBAAAAgMAAAAAAAD+/AAA/v0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAP//CAD//wAA//8AAP//AAD//wAA//8AAAIDAAAFCf0AAwWoAAECMAABAj8AAwa3AAQHAAABAwAA//8AAP//AAD//wAA//8AAP7+AAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAA/wAAAP8AAAD/AAAA/wAAAwQAAAYK+gADBpsAAAAoAAAAWQAAANEAAADCAAAASgABAjIABAarAAYK/gADBAAAAP8AAAD/AAAA/wAA//8JAAAAFgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAA//4AAAAAAAADBQAABgv1AAMGjgAAACIAAABmAAAA3AAAAAAAAAAAAAAAAAAAAAAAAADPAAAAVgAAACkAAwafAAYL+gACBQAA//8AAAD+AAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAP/+AAAGC+4AAwaCAAAAHwAAAHMAAADlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADaAAAAYgAAACQABAaSAAcM9gD//wAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwADBnUAAAAgAAAAfwAAAO0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADjAAAAbwAAACAAAgSFAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAD//0UfqzzqnnycAAAAAElFTkSuQmCC) no-repeat}.headsapp .headsapp-review-stars{*zoom:1;position:relative;float:left;margin-top:10px}.headsapp .headsapp-review-stars input{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=0);opacity:0;width:31px;height:35px;position:absolute;top:0;z-index:0}.headsapp .headsapp-review-stars input:checked ~ label{background-position:0 -33px;height:34px;width:32px}.headsapp .headsapp-review-stars label{background-position:0 0;height:33px;width:32px;float:right;cursor:pointer;padding-right:10px;position:relative;z-index:1;margin-top:5px}.headsapp .headsapp-review-stars label:hover,.headsapp .headsapp-review-stars label:hover ~ label{background-position:0 -33px;height:34px;width:32px}.headsapp .headsapp-review-stars #headsapp-star-0{left:0}.headsapp .headsapp-review-stars #headsapp-star-1{left:53px}.headsapp .headsapp-review-stars #headsapp-star-2{left:106px}.headsapp .headsapp-review-stars #headsapp-star-3{left:159px}.headsapp .headsapp-review-stars #headsapp-star-4{left:170px}body .headsapp .headsapp-your-message-sent-text{padding-bottom:0;text-align:center;transition:margin .5s;font-size:20px}body .headsapp .headsapp-message-sent-icon{text-align:center;margin-bottom:20px}body .headsapp-wrapper div.headsapp-toggle i svg,body .headsapp-wrapper div.headsapp-toggle i img{height:23px;position:absolute;top:50%;left:50%;margin-top:-11px;margin-left:-11px;transition:all .3s}body .headsapp-wrapper[data-container-open="true"] .headsapp-toggle .is-close-icon{width:40px;height:40px;font-size:24px;font-weight:100;line-height:38px;right:-10px;bottom:-10px}body .headsapp-wrapper[data-container-open="true"] div.headsapp-toggle i .x-icon{transition:opacity .3s;transition-delay:.3s}body .headsapp-wrapper[data-container-open="true"] div.headsapp-toggle i svg,body .headsapp-wrapper[data-container-open="true"] div.headsapp-toggle i img{opacity:0}body .headsapp-wrapper[data-container-open="false"] div.headsapp-toggle i svg,body .headsapp-wrapper[data-container-open="false"] div.headsapp-toggle i img{transition:opacity .3s;transition-delay:.3s}body .headsapp-wrapper[data-container-open="false"] div.headsapp-toggle i .x-icon{transition:opacity .3s;opacity:0}body .headsapp .headsapp-rate{width:80vw}body .headsapp .headsapp-name-email p{margin-bottom:5px}.headsapp-toggle{position:relative;margin-left:30px}.headsapp .headsapp-container{display:table;width:100%;margin-top:20px;cursor:pointer}.headsapp[data-is_open="false"] .headsapp-container{margin-top:0;transition:margin-top .4s}.headsapp[data-is_open="false"]{opacity:0;transition:opacity 0.3s,max-height .5s;max-height:0}.headsapp[data-is_open="true"]{opacity:1;transition:all .3s;max-height:10000px;box-shadow:0 0 10px #aaa}.headsapp[data-maximized="false"] .headsapp-body{height:22px}.headsapp[data-maximized="true"] .headsapp-body{height:350px}.headsapp[data-show_content="false"] .headsapp-container{display:none}.headsapp-wrapper{position:fixed;right:30px;bottom:30px;transition:opacity .3s;display:none;opacity:0;z-index:9999999;line-height:initial}</style> <div class="headsapp-toggle"> <i class="is-close-icon" aria-hidden="true"><span class="x-icon"><img src="data:image/png;base64,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"></span> <img height="22" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEJmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MTwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+OTY8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjk2PC90aWZmOllSZXNvbHV0aW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTAwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBp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"> </i> </div>';
})();