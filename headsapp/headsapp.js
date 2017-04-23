(function () {

    const BASEURL = "http://dev.nexusmedia-ua.com/headsappapi/public";
    const CONFIG_URL = BASEURL + "/config";
    const PING_URL = BASEURL + "/ping";
    const EMAIL_URL = BASEURL + "/mail";
    const STARS_URL = BASEURL + "/stars";

    const CLOSED_MESSAGES_COOKIE = "headsapp-closed-messages";
    const USERDATA_COOKIE = "headsapp-userdata";

    let container = null;

    const userdata = document.currentScript.dataset;
    let cookieData = getUserData();
    userdata.user_id = cookieData.user_id;
    userdata.user_first_time = cookieData.user_first_time;

    function apiRequest(handler, type, data) {
        const request = new XMLHttpRequest();
        request.addEventListener("load", handler);
        request.open("POST", type);
        request.send(JSON.stringify(data));
    }

    function getTimestamp(){
        return Math.floor(Date.now() / 1000);
    }

    function setUserData() {
        let user_id = Math.random().toString(36).substr(2, 9);
        let user_first_time = getTimestamp();
        setCookie(USERDATA_COOKIE, {"user_id": user_id, "user_first_time": user_first_time});
    }

    function getUserData() {
        let userdata = getCookie(USERDATA_COOKIE);
        if (userdata) {
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
        var parts = value.split("; "+cookieName+"=");
        if (parts.length == 2) {
            let cookie = parts.pop().split(";").shift();
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
        } else if (headsapp.getAttribute('data-display') !== 'default') {
            let closedIds = getCookie(CLOSED_MESSAGES_COOKIE);
            if (!closedIds) {
                closedIds = [];
            }
            closedIds.push(id);
            setCookie(CLOSED_MESSAGES_COOKIE, closedIds);

        }
    }

    function setIdForMessage(id, headsapp) {
        headsapp.setAttribute('data-server-message-id', id);
    }
    
    function setMessage(headsapp, message) {
        let messageItem = headsapp.querySelector('.headsapp-message');
        messageItem.innerText = message;
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
    }

    function setPopupHandler(headsapp) {
        headsapp.querySelector('.headsapp-close').addEventListener('click', function (e) {
            e.stopPropagation();
            if (headsapp.getAttribute('data-display') != 'default') {
                setFadeEffectToBlock(headsapp);
                checkingIfAllMessagesClosed(headsapp);
                closePopup(headsapp, true);
            }
            else {
                hidePopupWhenDefault(headsapp);
            }
            if(isAllMessagesClosed(container, headsapp, true)) {
                hideIcon();
            }
            saveToCookieDeletedMessage(headsapp);
        });
        headsapp.addEventListener('click', choosePopup);
    }

    function checkingIfAllMessagesClosed(headsapp) {
        container = document.querySelector('.headsapp-wrapper');
        const headsapps = container.querySelectorAll('.headsapp');
        for (let i = 0; i < headsapps.length; i++) {
            const headsapp = headsapps[i];
            if(headsapp.getAttribute('data-is_open') === 'false') {
                container.setAttribute('data-container-open', 'false');
            }
        }
    }

    function setFadeEffectToBlock(headsapp) {
        if(headsapp.classList.contains('headsapp-blur')){
            headsapp.style.filter = 'blur(2px)';
        }
        if(headsapp.classList.contains('headsapp-darken')){
            headsapp.style.filter = 'contrast(30%)';
        }
    }

    function hidePopupWhenDefault(headsapp) {
        setFadeEffectToBlock(headsapp);
        setTimeout(function () {
            headsapp.style.opacity = 0;
            setTimeout(function () {
                headsapp.style.display = 'none';
                headsapp.style.filter = '';
            }, 500)
        },1000);
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
        },1000);
    }

    function isAllMessagesClosed(headsapp){
        let lengthHeadsapps = document.querySelector('.headsapp-wrapper-main').children.length;
        let lengthDefaultHeadsapps = document.querySelectorAll('.headsapp[data-display="default"]').length;
        if (lengthHeadsapps <= 1 && lengthDefaultHeadsapps === 0){
            return true;
        }
        else if ((lengthHeadsapps - 1) === lengthDefaultHeadsapps || (lengthHeadsapps <= 1 && lengthDefaultHeadsapps !== 0)) {
            changeIconToMail();
        }
    }

    function setContainerHandler(container) {
        const toggler = container.querySelector('.headsapp-toggle');
        toggler.addEventListener('click', function () {
            if (container.getAttribute('data-container-open') == 'true') {
                    closeContainer(container);
                } else {
                    openContainer(container);
                }
            }
        );
    }

    function closeContainer(container) {
        container.setAttribute('data-container-open', false);
        const headsapps = container.querySelectorAll('.headsapp');
        for (let i = 0; i < headsapps.length; i++) {
            const headsapp = headsapps[i];
            closePopup(headsapp);
            if(headsapp.getAttribute('data-maximized') === 'true'){
                headsapp.querySelector('.headsapp-close').click();
            }
        }
    }

    function openContainer(container) {
        container.setAttribute('data-container-open', true);
        const headsapps = container.querySelectorAll('.headsapp');
        for (let i = 0; i < headsapps.length; i++) {
            const headsapp = headsapps[i];
            openPopup(headsapp, true);
            if (headsapp.style.display == 'none') {
                headsapp.style.display = 'block';
                setTimeout(function () {
                    headsapp.style.opacity = '';
                }, 500);
            }
            setTimeout(setScrollWhenScreenSmall, 100);
        }
    }

    function closePopup(headsapp, remove) {
        setTimeout(function () {
            let openconatiner = remove && headsapp.getAttribute('data-maximized');
            document.querySelector('.headsapp-wrapper-main').style.height = '';
            headsapp.setAttribute('data-is_open', false);
            setTimeout(setAttrAfterTimeout, 400, headsapp, remove, openconatiner);
        },500);
    }

    function openPopup(headsapp) {
        headsapp.setAttribute('data-is_open', true);
        headsapp.setAttribute('data-show_content', true);
    }

    function maximizePopup(headsapp) {
        pingOpen(headsapp);
        headsapp.setAttribute('data-maximized', true);
        document.querySelector('.headsapp-wrapper-main').style.height = '';
        const el = headsapp.querySelector('.headsapp-message');
        if(el){
            if (headsapp.querySelector('.headsapp-message').offsetHeight && headsapp.querySelector('.headsapp-message').offsetHeight > 100) {
                headsapp.querySelector('.headsapp-body').style.height = document.documentElement.clientHeight - 300 + 'px';
                headsapp.querySelector('.headsapp-body').style.overflowY = 'scroll';
                headsapp.querySelector('.headsapp-body').style.marginRight = 15 + 'px';
                headsapp.querySelector('.headsapp-body').style.paddingRight = 15 + 'px';
            }
            else {
                headsapp.querySelector('.headsapp-body').style.height = getHeight(headsapp.querySelector('.headsapp-body-wrapper')) + 'px';
            }
        }
        const en = headsapp.querySelector('.headsapp-body-wrapper-success');
        if (en){
            headsapp.querySelector('.headsapp-message-sent-icon').style.display = 'block';
            setTimeout(function () {
                headsapp.querySelector('.headsapp-message-sent-icon').style.opacity = 1;
                headsapp.querySelector('.headsapp-message-sent-icon').style.transition = 'opacity 0.5s';
            },100);
            headsapp.querySelector('.headsapp-body').style.height = headsapp.querySelector('.headsapp-body-wrapper-success').offsetHeight + 'px';
        }
        const er = headsapp.querySelector('.headsapp-body-stars-block');
        if (er) {
            headsapp.querySelector('.headsapp-body-stars-block').style.overflowY = '';
            headsapp.querySelector('.headsapp-body-stars-block').style.marginRight = '';
            headsapp.querySelector('.headsapp-body-stars-block').style.paddingRight = '';
            if(document.querySelector('.headsapp-form-contact').style.display == 'none'){
                headsapp.querySelector('.headsapp-body-stars-block').style.height = headsapp.querySelector('.headsapp-body-wrapper').offsetHeight + 'px';
            }
            else {
                const we = headsapp.querySelector('.headsapp-body-wrapper');
                if(we) {
                    headsapp.querySelector('.headsapp-body-stars-block').style.height = headsapp.querySelector('.headsapp-body-wrapper').offsetHeight + 'px';
                }
                else{
                    headsapp.querySelector('.headsapp-body-stars-block').style.height = headsapp.querySelector('.headsapp-body-wrapper-success').offsetHeight + 'px';
                }
            }
        }
        const eq = headsapp.querySelector('.headsapp-message-long');
        if(eq){
            if(getHeight(headsapp.querySelector('.headsapp-body-wrapper')) < document.documentElement.clientHeight) {
                headsapp.querySelector('.headsapp-body').style.height = getHeight(headsapp.querySelector('.headsapp-body-wrapper')) + 'px';
                headsapp.querySelector('.headsapp-body').style.overflowY = '';
                headsapp.querySelector('.headsapp-body').style.marginRight = '';
                headsapp.querySelector('.headsapp-body').style.paddingRight = '';
            }
        }
        if (window.matchMedia('(max-device-width: 740px)').matches || window.matchMedia('(max-width: 740px)').matches) {
            var mql = window.matchMedia("(orientation: portrait)");

            if(mql.matches) {
                console.log('Портретная ориентация');
            } else {
                const el = headsapp.querySelector('.headsapp-form-contact');
                if(el){
                    headsapp.querySelector('.headsapp-body').style.height = document.documentElement.clientHeight - 290 + 'px';
                    headsapp.querySelector('.headsapp-body').style.overflowY = 'auto';

                }
            }
        }
    }

    function choosePopup(event) {
        let headsapp = event.target.closest('.headsapp');
        if (headsapp.getAttribute('data-maximized') == 'false') {
            let id = headsapp.id;
            const popups = container.querySelectorAll('.headsapp');
            for (let i = 0; i < popups.length; i++) {
                if (popups[i].id !== id) {
                    closePopup(popups[i]);
                }
            }
            setTimeout(maximizePopup, 1200, headsapp);
        }
    }

    const b = document.getElementsByName('body');
    if (typeof b === 'undefined' || b === null || b.length === 0) {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    function createMessagesWrapper() {
        let newContainer = document.createElement('div');
        newContainer.id = 'headsapp-wrapper';
        openContainer(newContainer);
        newContainer.className = 'headsapp-wrapper';
        document.querySelector('body').appendChild(newContainer);
        newContainer.innerHTML = wrapperHtml;
        let newMainContainer = document.createElement('div');
        newMainContainer.className = 'headsapp-wrapper-main';
        newContainer.insertBefore(newMainContainer, newContainer.firstChild);
        setTimeout(setScrollWhenScreenSmall, 600);
        return newContainer;
    }

    function setScrollWhenScreenSmall () {
        setTimeout(function () {
            let newMainContainer = document.querySelector('.headsapp-wrapper-main');
            if (newMainContainer.offsetHeight > document.documentElement.clientHeight){
                newMainContainer.style.height = document.documentElement.clientHeight - 40 +'px';
                newMainContainer.style.overflowY = 'auto';
                newMainContainer.scrollTop = newMainContainer.scrollHeight - newMainContainer.clientHeight;
            }
        },500);

    }
    window.onresize = setScrollWhenScreenSmall;

    function run() {
        container = createMessagesWrapper();
        setContainerHandler(container);
        apiRequest(renderMessages, CONFIG_URL, userdata);
        document.addEventListener('click', function (event) {
            if (event.target.closest('.headsapp-wrapper') == null) {
                minimizePopups();
            }
        })
    }

    function renderMessages() {
        let config = JSON.parse(this.responseText);
        let messages = config.messages;
        // hideIconWhenNoMessage();
        if (config.messages){
            document.querySelector('.headsapp-wrapper').style.display = 'block';
            setTimeout(function () {
                document.querySelector('.headsapp-wrapper').style.opacity = 1;
            },200);
            if (messages) {
                for (let i = 0; i < messages.length; i++) {
                    renderMessage(messages[i]);
                }
            }
        }
    }

    function isMessageValid(item){
      return typeof item !== 'undefined'
            && typeof item.text !== 'undefined'
            && typeof item.staff_icon !== 'undefined'
            && typeof item.staff_name !== 'undefined'
        && typeof item.staff_title !== 'undefined';
    }

    function isMessageForShow(item){
        return !isMessageWasClosedByUser(item) && isMessageForShowAfterDelay(item) && isMessageInDisplayInterval(item) && !isDisplayAttribute(item);
    }

    function isDisplayAttribute(item) {
        if (typeof item.display_attribute !== 'undefined' && typeof item.dispaly_attribute_value !== 'undefined') {
            if(userdata[item.display_attribute] != item.dispaly_attribute_value) {
                hideIconWhenDelay();
                return true;
            }
        }
        return false;
    }

    function isMessageInDisplayInterval(item){
        if (typeof item.display_interval != 'undefined') {
            let lastClose = getCookie('headsapp-closed-time-' + item.id);
            if (lastClose) {
                if ( (lastClose + item.display_interval * 60) > getTimestamp()) {
                    hideIconWhenNoMessage();
                    return false;
                }
            }
        }
        return true
    }

    function hideIconWhenNoMessage() {
        setTimeout(function () {
            let lengthHeadsapps = document.querySelector('.headsapp-wrapper-main').children.length;
            if(lengthHeadsapps === 0){
                hideIconWhenDelay();
            }
        }, 100);
    }

    function isMessageForShowAfterDelay(item) {
        if (typeof item.delay !== 'undefined') {
            let now = getTimestamp();
            if (+(+userdata.user_first_time + +(item.delay * 60)) > now) {
                hideIconWhenNoMessage();
                console.log('no show');
                return false;
            }
        }
        return true;
    }

    function hideIconWhenDelay() {
        document.querySelector('.headsapp-wrapper').style.display = 'none';
    }

    function isMessageWasClosedByUser(item) {
        let closedMessages = getCookie('headsapp-closed-messages');
        if (closedMessages != null) {
            if (closedMessages.indexOf('' + item.id) != -1) {
                return true;
            }
        }
        return false;
    }

    function renderMessage(item) {
        if (isMessageValid(item) && isMessageForShow(item)) {

            let type = 'notification';
            const headsapp = createPopup();//new popup for each message
            if (typeof typeof item.type !== 'undefined' && item.type == "notification") {
                if (typeof typeof item.action_type !== 'undefined') {
                    type = setActionTemplate(headsapp, item.action_type);
                }
            } else if (typeof typeof item.type !== 'undefined' && item.type == "stars") {
                type = setActionTemplate(headsapp, item.type);
                starsBlock(headsapp);
            }

            setMessage(headsapp, item.text);
            setAvatar(headsapp, item.staff_icon);
            setName(headsapp, item.staff_name);
            setTitle(headsapp, item.staff_title);
            openPopup(headsapp);
            if (type == 'contact') {
                setContactHandler(headsapp);
            }

            if (type == 'stars') {
                setRateHandler(headsapp);
                setContactHandler(headsapp);
                setFormText(headsapp, item.text);
                setStarsText(headsapp, item.stars_text);
                setFormTextStar(headsapp, item.form_text);
                setHeightStarsBlock();
            }

            if (typeof item.button_background_color !== 'undefined'
                ) {
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
            if (typeof item.text !== 'undefined') {
                getLength(item.text);
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
                headsapp.style.display = 'none';
                if(isAllMessagesClosed (container, headsapp, true)) {
                    changeIconToMail();
                }
            }
        }
    }

    function setFormTextStar(headsapp, form_text) {
        const el = headsapp.querySelector('.headsapp-message');
        if(el){
            el.innerHTML = form_text;
        }
    }

    function setStarsText(headsapp, stars_text) {
        const el = headsapp.querySelector('.headsapp-question');
        if(el){
            el.innerHTML = stars_text;
        }
    }

    function setFormText(headsapp, text) {
        let messageItem = headsapp.querySelector('.headsapp-message-gorgeous');
        messageItem.innerText = text;
    }


    function setFadeEffect(headsapp, fade) {
        headsapp.classList.add('headsapp-'+fade);
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
        let sliced = text.slice(0, 100);
        if (sliced.length < text.length) {
            const words = sliced.split(' ');
            words.pop();
            sliced = words.join(' ');
            sliced = sliced.replace(/[,\!\?\:\;\.]$/, '');
            sliced += '...';
            const el = document.querySelector('#headsapp-star-block');
            if (el) {}
            else {
                let shortMessageBlock = document.createElement('div');
                shortMessageBlock.className = "headsapp-message-short";
                shortMessageBlock.innerHTML = sliced;
                let headsappBodyWrapper = document.querySelector('.headsapp-body-wrapper');
                headsappBodyWrapper.appendChild(shortMessageBlock);
                let heightShortMessageBlock = shortMessageBlock.offsetHeight;
                document.querySelector('.headsapp-body').style.height = heightShortMessageBlock + "px";
                document.querySelector('.headsapp-message').classList.add("headsapp-message-long");
            }
        }
        else {
            document.querySelector('.headsapp-message').style.display = "block";
        }
    }

    function minimizePopups() {
        container = document.querySelector('.headsapp-wrapper');
        if (container.getAttribute('data-container-open') == 'true') {
            const popups = container.querySelectorAll('.headsapp');
            for (let i = 0; i < popups.length; i++) {
                openPopup(popups[i]);
                popups[i].setAttribute('data-maximized', false);
                popups[i].querySelector('.headsapp-body').style.height = '';
                setTimeout(setScrollWhenScreenSmall ,600);
                document.querySelector('.headsapp-wrapper-main').scrollTop = document.querySelector('.headsapp-wrapper-main').scrollHeight;

                const el = popups[i].querySelector('.headsapp-message-short');
                if(el){
                    setTimeout(function () {
                        popups[i].querySelector('.headsapp-body').style.height = popups[i].querySelector('.headsapp-message-short').offsetHeight + 'px';
                    }, 1);
                    popups[i].querySelector('.headsapp-body').style.overflowY = '';
                    popups[i].querySelector('.headsapp-body').style.marginRight = '';
                    popups[i].querySelector('.headsapp-body').style.paddingRight = '';
                }

                const en = popups[i].querySelector('.headsapp-body-wrapper-success');
                if (en){
                    popups[i].querySelector('.headsapp-body').style.height = popups[i].querySelector('.headsapp-your-message-sent-text').offsetHeight+'px';
                    popups[i].querySelector('.headsapp-message-sent-icon').style.opacity = 0;
                    popups[i].querySelector('.headsapp-message-sent-icon').style.transition = 'opacity 0.5s';
                    setTimeout(function () {
                        popups[i].querySelector('.headsapp-message-sent-icon').style.display = 'none';
                    },500);
                }
                const er = container.querySelector('.headsapp-body-stars-block');
                if (er) {
                    const qw = container.querySelector('.headsapp-body-wrapper');
                    if(qw) {
                        if(container.querySelector('.headsapp-form-contact').style.display === 'block') {
                            container.querySelector('.headsapp-body-stars-block').style.height = container.querySelector('.headsapp-message-text').offsetHeight + 'px';
                        }
                        else {
                            setHeightStarsBlock();
                        }
                        const gorgeous = container.querySelector('.headsapp-message-gorgeous');
                        if(gorgeous){
                            if(gorgeous.style.display === 'block') {
                                container.querySelector('.headsapp-body-stars-block').style.height = gorgeous.offsetHeight + 'px';
                            }
                        }
                    }
                }
            }
        }
    }

    function setHeightStarsBlock() {
        const q = document.querySelector('.headsapp-body-wrapper-success');
        if(!q) {
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
        let elHeight = el.offsetHeight;
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
            let headsapp = getPopupByinternalNode(event.target);
            headsapp.querySelector('.headsapp-question').style.display = 'none';
            headsapp.querySelector('.headsapp-review-stars').style.display = 'none';
            headsapp.querySelector('.headsapp-message').style.display = 'inline';
            setTimeout(function () {
                headsapp.querySelector('.headsapp-body').style.height = headsapp.querySelector('#headsapp-star-block').offsetHeight+'px';
            },100);

            if (event.target.title == 'gorgeous') {
                headsapp.querySelector('.headsapp-btn-send').style.display = 'block';
                headsapp.querySelector('.headsapp-message-gorgeous').style.display = 'block';
                headsapp.querySelector('.headsapp-message').style.display = 'none';
            } else {
                headsapp.querySelector('.headsapp-form-contact').style.display = 'block';
            }
            apiRequest(function () {
            }, STARS_URL, {"rate": event.target.title});
        }, 1200);
    }

    function setRateHandler(headsapp) {
        const labels = headsapp.querySelectorAll('label');
        for (let i = 0; i < labels.length; i++) {
            labels[i].addEventListener('click', clickRate);
        }
    }

    function sendContactForm(event) {

        event.preventDefault();
        const headsapp = getPopupByinternalNode(event.target);
        removeTooltips(headsapp);

        const data = {};
        data.type = 'contact';
        data.id = headsapp.id;

        const inputs = headsapp.querySelectorAll('input, textarea');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].style.borderColor = '#eeeeee';
        }

        let userNameField = headsapp.querySelector('input[name="user_name"]');
        let userEmailField = headsapp.querySelector('input[name="user_email"]');
        let userMessageField = headsapp.querySelector('textarea[name="message"]');

        let isFormValid = true;

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
            let data = {};
            data.id = headsapp.id;
            data.user_name = userNameField.value;
            data.user_email = userEmailField.value;
            data.message = userMessageField.value;
            headsapp.querySelector('.headsapp-loader-main').style.opacity = 1;
            headsapp.querySelector('.headsapp-loader-main').style.transition = 'opacity 0.5s';
            headsapp.querySelector('.headsapp-loader-main').style.zIndex = 1;
            apiRequest(contactAfter, EMAIL_URL, data);
        }
    }

    function removeTooltips(headsapp) {
        headsapp.querySelectorAll('.headsapp-tooltiptext').forEach(function (item) {
            item.parentNode.removeChild(item)
        });
        const inputs = headsapp.querySelectorAll('input, textarea');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].oninput = function () {
                inputs[i].style.borderColor = '';
                inputs[i].parentNode.querySelectorAll('.headsapp-tooltiptext').forEach(function (item) {
                    item.parentNode.removeChild(item)
                });
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
            addTooltip(field,  'Email is require');
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
        let resp = JSON.parse(this.responseText);
        if (resp.success) {
            getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body-wrapper').style.opacity = 0;
            getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body-wrapper').style.transition = 'opacity 0.5s';
            setTimeout(function () {
                getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body').innerHTML = getTmpl('success');
                getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body').style.height = 100 + 'px';
                getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body-wrapper-success').style.opacity = 1;
                getPopupByinternalNode(document.getElementById(resp.id)).querySelector('.headsapp-body-wrapper-success').style.transition = 'opacity 1s';
            },200);

        }
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
                return `<div class="headsapp-loader-main">
                            <div class="headsapp-loader">
                                <div class="headsapp-next-spinner">
                                    <svg class="headsapp-next-icon headsapp-next-icon--40" preserveAspectRatio="xMinYMin"><circle class="headsapp-next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg>
                                </div>
                            </div>
                        </div>
                    <div id="headsapp-star-block">
                        <div class="headsapp-question"></div>
                        <div class="headsapp-message-gorgeous" style="display: none;"></div>
                        <div class="headsapp-message headsapp-message-text" style="display: none;"></div>
                        <div class="headsapp-review-stars">
                            <input id="headsapp-star-4" type="radio" name="reviewStars">
                            <label title="gorgeous" for="headsapp-star-4"></label>
                            <input id="headsapp-star-3" type="radio" name="reviewStars">
                            <label title="good" for="headsapp-star-3"></label>
                            <input id="headsapp-star-2" type="radio" name="reviewStars">
                            <label title="regular" for="headsapp-star-2"></label>
                            <input id="headsapp-star-1" type="radio" name="reviewStars">
                            <label title="poor" for="headsapp-star-1"></label>
                            <input id="headsapp-star-0" type="radio" name="reviewStars">
                            <label title="bad" for="headsapp-star-0"></label>
                        </div>
                        <div class="headsapp-btn-send" style="display: none">
                            <form class="headsapp-url-action">
                                <button class="headsapp-button-send type="submit">URL</button>
                            </form>
                        </div>
                        <form class="headsapp-form-contact" style="display: none;" action="">
                        <div class="headsapp-name headsapp-input">Name<input class="headsapp-input-field" maxlength="30" type="text" name="user_name" value="">
                        </div>
                        <div class="headsapp-name-email headsapp-input">Email<input class="headsapp-input-field" type="text" name="user_email" value="" type="email">
                        </div>
                        <div class="headsapp-name-message headsapp-input"> Message<textarea name="message" contenteditable="" class="headsapp-message-editor"></textarea>
                        </div>
                        <div class="headsapp-btn-send">
                            <button class="headsapp-button-send" type="submit">Send</button>
                        </div>
                    </form>
                        <div style="clear:both;"></div>
                    </div>
                `;

            }
            case ("contact"): {
                return `<div class="headsapp-loader-main">
                            <div class="headsapp-loader">
                                <div class="headsapp-next-spinner">
                                    <svg class="headsapp-next-icon headsapp-next-icon--40" preserveAspectRatio="xMinYMin"><circle class="headsapp-next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg>
                                </div>
                            </div>
                        </div>
                    <div class="headsapp-message"></div>
                    <form class="headsapp-form-contact" action="">
                        <div class="headsapp-name headsapp-input">
                            <span class="headsapp-input-title">Name</span><input class="headsapp-input-field" maxlength="30" type="text" name="user_name" value="">
                        </div>
                        <div class="headsapp-name-email headsapp-input">
                            <span class="headsapp-input-title">Email</span><input class="headsapp-input-field" type="text" name="user_email" type="email" value="">
                        </div>
                        <div class="headsapp-name-message headsapp-input">
                            <span class="headsapp-input-title">Message</span><textarea name="message" contenteditable="" class="headsapp-message-editor"></textarea>
                        </div>
                        <div class="headsapp-btn-send">
                            <button class="headsapp-button-send" type="submit">Send</button>
                        </div>
                    </form>
                `;

            }
            case ( "url"): {
                return `<span class="headsapp-message"></span>
                    <div class="headsapp-btn-send">
                        <form>
                            <button class="headsapp-button-send type="submit">URL</button>
                        </form>
                    </div>
                `;

            }
            case ( "success"): {
                return `
                <div class="headsapp-body-wrapper-success">
                <div class="headsapp-message-sent-icon">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDoAABSCAABFVgAADqXAAAXb9daH5AAACRASURBVHgBADAkz9sBdvMiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWAAAAQQAAADgAAAAoAAAAIQAAABUAAAALAAAAAAAAAPUAAADrAAAA3wAAANcAAADJAAAAvwAAAOoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEwAAAF4AAABaAAAAMwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAEgAAACcAAABIAAAAAAAAAP8AAADNAAAApgAAAKIAAADtAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF28yIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZAAAAdAAAAGcAAAALAAAAAAAAAPUAAADEAAAAwQAAANYAAADaAAAA6QAAAPQAAAAAAAAADAAAABcAAAAmAAAAKgAAAD4AAAA9AAAACwAAAAAAAAD2AAAAngAAAIYAAADnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABdvMiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAABxAAAAfgAAAAwAAAD/AAAAuQAAAJ8AAACzAAAA9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAE0AAABhAAAARwAAAAEAAAD0AAAAggAAAI8AAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXbzIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACUAAACpAAAAMQAAAAAAAACuAAAAggAAANEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC8AAACAAAAAUAAAAAAAAADQAAAAWwAAANYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8AAADMAAAAMQAAAN0AAABGAAAAUwAAANEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADRAAAAUQAAAEYAAADdAAAAMAAAAMkAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGYAAACtAAAADgAAAKkAAAAyAAAAuwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC7AAAAMgAAAKgAAAAMAAAArAAAAGYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGkAAACZAAAAAgAAAHwAAABYAAAA8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPIAAABZAAAAfAAAAAIAAACPAAAAHQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE4AAACTAAAA/wAAAG0AAACVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIUAAADqAAAA3wAAAOMAAAAAAAAAAAAAAAoAAAA1AAAAwQAAAAACAAAAAAAAAAAAAAAAAAAAAAAAACkAAAClAAAAAwAAAHoAAACVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmwAAALwAAAAAAAAAAAAAAAoAAACxAAAAugAAAE4AAAAABAAAAAAAAAAAAAAAAAAAAAUAAACnAAAADAAAAKgAAACIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAC5AAAALQAAAOcAAADaAAAAAAIAAAAAAAAAAAAAAAAAAABwAAAALwAAAN0AAABnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAC5AAAALQAAAOsAAABCAAAA2AAAAAACAAAAAAAAAAAAAAAaAAAAfgAAAAAAAABpAAAA8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAALQAAAPYAAABaAAAA2AAAAAAAAAAAAgAAAAAAAAAAAAAAegAAAAwAAACuAAAAuwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABDAAAAvAAAAAAAAAAAAAAAAAQAAAAAAAAAFAAAAGIAAAD/AAAAggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAFwAAAAJAAAAugAAANEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAGQAAAFIAAAAABAAAAAAAAABcAAAAAAAAAJ8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAEQAAAL4AAAD0AAAArgQAAAAWAAAAMgAAAPUAAACxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAPcAAAAdAAAACgAAABoCAAAAQgAAAAEAAADEAAAA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAxAAAAAEAAABBAgAAADcAAAAAAAAAwQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAzwAAAIcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMEAAAAAAAAANAIAAAAoAAAAAAAAANQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJwAAABMAAAB4AAAAhwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUAAAAAAAAACcCAAAAJAAAAAAAAADbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALEAAABaAAAA+gAAAHgAAACHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2wAAAAAAAAAlAgAAABcAAAAAAAAA6wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArQAAAFoAAAD6AAAAeAAAAIcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOsAAAAAAAAAFwIAAAANAAAAAAAAAPMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACtAAAAWgAAAPoAAAB4AAAAhwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADzAAAAAAAAAA0CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK0AAABaAAAA+gAAAHgAAACHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD6AgAAAPMAAAAAAAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArQAAAFoAAAD6AAAAeAAAAIcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABCAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0AAAAAAAAA8wIAAADpAAAAAAAAABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACtAAAAWQAAAPoAAAB4AAAAhwAAAAAAAAAAAAAAAAAAAAoAAACxAAAARAAAAOcAAABBAAAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVAAAAAAAAAO8CAAAA3AAAAAAAAAAlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK4AAABZAAAA+gAAAHgAAACHAAAAAAAAAAoAAACxAAAARAAAAOcAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJQAAAAAAAADbAgAAANgAAAAAAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArgAAAFkAAAD6AAAAeAAAAIsAAACxAAAARAAAAOcAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAAAAA2QIAAADJAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACuAAAAWQAAAPoAAAB0AAAARAAAAOcAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAM0CAAAAvwAAAP8AAAA9AAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK4AAABaAAAA+gAAAOcAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAPQAAAP8AAAC+AgAAAOkAAADOAAAACwAAAE8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArQAAAFUAAABBAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATgAAAAsAAADOAAAA5gIAAAAAAAAApAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyAAAA2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAApgAAAAACAAAAAAAAAKQAAAD3AAAARwAAAC4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4AAABIAAAA9wAAAKIAAAAAAgAAAAAAAADsAAAAnwAAAAEAAAB/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAQAAAJ8AAADsAAAAAAIAAAAAAAAAAAAAAIUAAAD0AAAAUgAAAEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAAUwAAAPQAAACFAAAAAAAAAAACAAAAAAAAAAAAAADmAAAAggAAAAAAAACXAAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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">
                </div>
                <div class="headsapp-your-message-sent-text">
                        Your message has been sent!
                    </div>
                </div>
                `;

            }
            default: {
                return `<span class="headsapp-message"></span>`;
            }
        }
    }

    function createPopup() {
        const id = Math.random().toString(36).substr(2, 9);
        let child = document.createElement('div');
        child.innerHTML = `<div id="` + id + `" class="headsapp" data-is_open="false" data-show_content="false" data-maximized="false">
            <div class="headsapp-container">
                <div class="headsapp-header">
                    <div class="headsapp-close">
                        <i aria-hidden="true">×</i>
                    </div>
                    <div class="headsapp-userdata">
                        <img class="headsapp-avatar" src="" alt="avatar">
                        <div class="headsapp-userinfo">
                            <span class="headsapp-name"></span>
                            <span class="headsapp-title"></span>
                        </div>
                    </div>

                    <div class="headsapp-clear"></div>
                </div>
                <div class="headsapp-body">
                    <div class="headsapp-body-wrapper">
                    </div>
                </div>
            </div>
        </div>`;
        headsapp = child.firstChild;
        container = document.querySelector('.headsapp-wrapper-main');
        container.insertBefore(headsapp, container.querySelector('div'));
        setPopupHandler(headsapp);
        return headsapp;
    }

    const wrapperHtml = `<style>
    @media screen and (max-width: 740px), (max-device-width: 740px) 
    //  {
    // .headsapp-wrapper-main {
    // margin: 3rem;
    // }
    //
    // body #headsapp-wrapper .headsapp-your-message-sent-text {
    //     font-size: 3rem;
    // }
    //
    // body .headsapp-wrapper .headsapp-btn-send {
    // margin-top: 40px;
    // }
    //
    // body .headsapp-wrapper .headsapp .headsapp-header:before {
    // left: 14%;
    // transform: scale(2.5);
    // bottom: 24px;
    // }
    //
    // body .headsapp-wrapper .headsapp-name-message .headsapp-message-editor {
    // font-size: 1rem;
    // font-weight: 400;
    // }
    //
    // body .headsapp-review-stars {
    // transform: scale(3);
    // margin-left: 14rem;
    // margin-top: 4rem;
    // margin-bottom: 4rem;
    // }
    //
    // body .headsapp-wrapper .headsapp-input {
    // font-size: 2.5rem;
    // }
    //
    // body .headsapp-wrapper .headsapp-name-email input, body .headsapp-wrapper .headsapp-name input {
    // font-size: 2.5rem;
    // }
    //
    // .headsapp-wrapper .headsapp[data-is_open="true"] {
    // max-height: 1700px;
    // }
    //
    //  body .headsapp-wrapper .headsapp-name-email input, body .mobile .headsapp-name input {
    //  font-size: 90%;
    //  }
    //
    // .headsapp-wrapper .headsapp-btn-send button {
    // font-size: 3rem;
    // padding: 2% 5%;
    // }
    //
    // .headsapp-wrapper #headsapp-star-block .headsapp-question {
    // display: block;
    // font-size: 3rem;
    // }
    //
    // body .headsapp-wrapper .headsapp .headsapp-body {
    // margin: 7%;
    // }
    //
    // body .headsapp-wrapper {
    // width: 100%;
    // right: 0;
    // bottom: 0;
    // }
    
    #headsapp-wrapper {
    width: 85%;
    right: 0;
    margin-right: 31px;
    }
    
    body #headsapp-wrapper .headsapp-toggle .is-close-icon {
    right: -15px;
    bottom: -24px;
    }
    
    body .headsapp .headsapp-name {
    width: 125px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    }

    .headsapp-wrapper .headsapp {
    width: 100%;
    }
    //
    // body .headsapp-wrapper .headsapp .headsapp-header {
    // border-top-left-radius: 0.8rem;
    // border-top-right-radius: 0.8rem;
    // }
    //
    // body .headsapp-wrapper[data-container-open="true"] .headsapp-toggle i.is-close-icon {
    // right: 60px;
    // bottom: 60px;
    // transform: scale(3);
    // }
    //
    // body .headsapp-wrapper[data-container-open="false"] .headsapp-toggle i.is-close-icon {
    // right: 60px;
    // bottom: 60px;
    // transform: scale(3.1);
    // }
    //
    // .headsapp-wrapper .headsapp .headsapp-close {
    // font-size: 5rem;
    // top: 2.5rem;
    // right: 4rem;
    // }
    //
    // body #headsapp-wrapper .headsapp .headsapp-avatar {
    // max-height: 8rem;
    // max-width: 8rem;
    // margin: 25px;
    // }
    //
    // .headsapp-wrapper .headsapp-name {
    // font-size: 2.5rem;
    // }
    //
    // body #headsapp-wrapper .headsapp .headsapp-userinfo {
    // margin-top: 2.7rem;
    // }
    //
    // .headsapp-wrapper .headsapp .headsapp-title {
    // font-size: 2.1rem;
    // line-height: 3rem;
    // }
    //
    // .headsapp-wrapper .headsapp-message-short {
    // font-size: 3rem;
    // line-height: 4rem;
    // }
    //
    // body .headsapp-container {
    // margin-top: 3rem;
    // }
    //
    // .headsapp-wrapper .headsapp[data-maximized="false"] .headsapp-message, .headsapp[data-maximized="true"] .headsapp-message  {
    //     font-size: 3.5em;
    // }
    //
    // body .headsapp-wrapper .headsapp-wrapper-main .headsapp .headsapp-message-long {
    //     line-height: 3rem;
    //         font-size: 2rem;
    // }
    //
    // .headsapp-wrapper .headsapp[data-maximized="false"] .headsapp-body {
    // height: 3rem;
    // }
    //
    // body .headsapp-message-gorgeous {
    // font-size: 3rem;
    // }
}

    .headsapp .headsapp-name {
     display: block;
     font-weight: 400;
    }

    .headsapp .headsapp-message-gorgeous {
    font-size: 19px;
    }

    body .headsapp-wrapper .headsapp .headsapp-message-long {
    font-size: 17px;
    line-height: 23px;
    }
    
    .headsapp-wrapper-main::-webkit-scrollbar { 
    width: 0; 
    }

    .headsapp-wrapper-main { 
    -ms-overflow-style: none; 
    }

    .headsapp-wrapper-main { 
    overflow: -moz-scrollbars-none; 
    }

    @-moz-document url-prefix() {
        body .headsapp-wrapper .headsapp-toggle .is-close-icon .x-icon {
        line-height: 40px;
        }
    }

    .headsapp .headsapp-input {
    position: relative;
    font-size: 15px;
    font-weight: inherit;
    margin-top: 1em;
    margin-bottom: 1em;
    }

    .headsapp .headsapp-tooltiptext {
    background-color: red;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 10px;
    position: absolute;
    left: 50%;
    top: 7px;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    }

    .headsapp .headsapp-tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: red transparent transparent transparent;
}

    .headsapp .headsapp-loader-main {
    z-index: -1;
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    opacity: 0;
    }

    .headsapp .headsapp-loader{
    width: 40px;
    height: 30px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -20px 0 0 -15px;
    }

    .headsapp .headsapp-loader .headsapp-next-spinner {
     display: inline-block;
     -webkit-animation: headsapp-next-spinner-rotate 600ms linear infinite;
     animation: headsapp-next-spinner-rotate 600ms linear infinite;
     position: relative;
     line-height: 0;
    }

    .headsapp .headsapp-loader .headsapp-next-spinner>.headsapp-next-icon {
     position: static;
     width: 40px;
     height: 40px;
     background-size: contain;
     background-position: center;
     background-repeat: no-repeat;
     top: -0.15em;
     display: inline-block;
    }

    .headsapp .headsapp-loader .headsapp-next-spinner .headsapp-next-spinner__ring {
     stroke: #479ccf;
     stroke-dasharray: 100%;
     stroke-width: 2px;
     stroke-linecap: round;
     fill: none;
    }

    @-webkit-keyframes
    headsapp-next-spinner-rotate{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}
    @keyframes
    headsapp-next-spinner-rotate{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}

    .headsapp .headsapp-body-wrapper-success {
    opacity: 0;
    }

    .headsapp .headsapp-body-stars-block .headsapp-message {
    font-size: 19px;
    }

    .headsapp[data-maximized="false"] .headsapp-message {
    display: none;
    }

    .headsapp[data-maximized="true"] .headsapp-body {
    cursor: default;
    }

    .headsapp[data-maximized="true"] .headsapp-message-short {
    display: none;
    }

    .headsapp .headsapp-message-short {
    font-size: 19px;
    line-height: 25px;
    }

    .headsapp {
    font-family: sans-serif;
    bottom: 40px;
    right: 40px;
    background-color: #fffeff;
    box-shadow: 0px 0px 8px -4px #000000 inset;
    font-size: 13px;
    font-weight: 100;
    width: 400px;
    border-radius: 5px;
    color: #3b4347;
}

.headsapp .headsapp-avatar {
    display: inline-block;
    max-height: 50px;
    max-width: 50px;
    border-radius: 50%;
    margin: 9px 6px 5px 6px;
}

.headsapp .headsapp-userinfo {
    float: right;
    margin: 16px 13px 13px 13px;
    color: #373737;
    font-size: initial;
}

.headsapp .headsapp-userdata {
    display: inline-block;
}

.headsapp .headsapp-close {
    font-size: 30px;
    right: 30px;
    top: 16px;
    font-family: sans-serif;
    position: absolute;
    cursor: pointer;
}

.headsapp .headsapp-clear {
    clear: both;
}

body .headsapp-wrapper div.headsapp-toggle i {
    height: 56px;
    width: 56px;
    line-height: 53px;
    font-size: 30px;
    right: -28px;
    bottom: -28px;
    font-family: sans-serif;
    transition: all 0.3s;
    cursor: pointer;
    opacity: 1;
    float: right;
    position: absolute;
    background-color: #03a9f4;
    border-radius: 50%;
    color: white;
    text-align: center;
    box-shadow: 0 0 2px #535353;
    text-decoration: none;
    font-style: normal;
}

.headsapp-wrapper div.headsapp-toggle:hover i{
    background-color: #0a8cd1;
    color: #f9fcfd;
}

.headsapp-wrapper .headsapp i {
    text-decoration: none;
    font-style: normal;
}

.headsapp .headsapp-title {
    font-size: 12px;
    line-height: 1.3rem;
    clear: both;
}

.headsapp .headsapp-message, .headsapp .headsapp-question {
    font-size: 19px;
    display: block;
}

body .headsapp .headsapp-name-email input.headsapp-input-field, body .headsapp .headsapp-name input.headsapp-input-field {
    border-left: 0;
    border-right: 0;
    border-top: 0;
    outline: none;
    width: 100%;
    line-height: 34px;
    font-size: 16px;
    color: inherit;
    background-color: transparent;
    transition: border-color 0.5s;
    height: initial;
    padding: 0;
    border-bottom: 2px solid #eeeeee;
    box-shadow: none;
    border-radius: 0;
}

body .headsapp .headsapp-head-email {
    font-size: 20px;
    padding-bottom: 10px;
}

body .headsapp .headsapp-body {
    margin: 30px;
    position: relative;
    cursor: pointer;
    -webkit-overflow-scrolling: touch;
    transition: height 0.3s ease-out;
    overflow: hidden;
}

body .headsapp .headsapp-name-message .headsapp-message-editor {
    border-left: 0;
    border-right: 0;
    border-top: 0;
    border-bottom: 2px solid #eeeeee;
    outline: none;
    width: 100%;
    line-height: 25px;
    font-size: 16px;
    color: inherit;
    font-weight: inherit;
    padding-bottom: 10px;
    cursor: auto;
    transition: border-color 0.5s;
    min-height: initial;
    height: initial;
    padding: initial;
    box-shadow: none;
    border-radius: 0;
}

body .headsapp .headsapp-btn-send {
    text-align: center;
    margin-top: 10px;
}

.headsapp .headsapp-btn-send button.headsapp-button-send {
    border: 0;
    border-radius: 4px;
    background-color: #00a1f5;
    color: white;
    font-size: 16px;
    outline: none;
    cursor: pointer;
    padding: 12px 15px;
    font-weight: 500;
}

.headsapp .headsapp-btn-send button.headsapp-button-send:active {
    opacity: 0.9;
}

body .headsapp .headsapp-wrapper div.headsapp-toggle i {
    height: 56px;
    width: 56px;
    line-height: 53px;
    font-size: 30px;
    right: -28px;
    bottom: -28px;
    font-family: sans-serif;
    transition: all 0.3s;
    cursor: pointer;
    opacity: 1;
    text-align: center;
}

body .headsapp .headsapp-header {
    box-shadow: inset 0 -8px 15px -15px #000;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    padding: 2px 13px;
    position: relative;
    background-color: rgb(241, 241, 241);
}

body .headsapp .headsapp-incomin-message {
    background-color: #f1f1f1;
    border: 1px solid #e7e7e7;
    border-radius: 5px;
    padding: 10px;
    color: #2e393d;
    font-weight: 400;
    line-height: 23px;
    float: left;
    margin: 10px 0;
}

body .headsapp .headsapp-outgoing-message {
    float: right;
    margin-right: 10px;
    background-color: #00a1f5;
    color: white;
    position: relative;
}

body .headsapp .headsapp-outgoing-message:after {
    position: absolute;
    right: 0;
    content: '';
    border-right: 45px solid #00a1f5;
    border-bottom: 44px solid transparent;
}

body .headsapp .headsapp-header:before {
    content: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAYCAYAAAB0kZQKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDoAABSCAABFVgAADqXAAAXb9daH5AAAALgSURBVHjaxJZBaxNBGIa/b3bTya5Z4xpSJVBICLZpFdI0u9A0TdIiJAcRLBowS7x4iL0V+gMEDy1407teRG/+hP6IFk2h6tJ6iI2QUluNNjbZ9ZIN0yVtTNvVvXwz7MD38M7MOy+apgn/+8P5+fnOuMv/f0LIM83Zav5LGJ5pTNoVmcZGuzoKQRgAbnp6WlxeXr4NAK42IGcDcwzCqpzf75e8Xu/TWCx2EQAGGBjiJMgRJfb39wcIIWFN0x4DgBsAaBvEUUUIcya4RqPBAwB4PJ5Hi4uLWQAQ2iCObg0LQTY3N5vWPBwOP5+bm4swII4pQthxpVJpdSaEyLOzsy9UVQ0AgOgkCLGbl2EYdWvicrmCmqa9HBsbu+IkCLGbkWEY39kFbrf7RqlUeqUoiqWIu31zzu3WsEoYAACtVmvHvohSer1YLL5Op9PBY0DOBEMYRzQBwDg8PKx2W0gpHc7n828LhYICABfO88Cy22ECgHFwcPD5WI/n+aupVOrNwsLCHQDwMKrYTQ1Pq4QBAEa9XtdPfHYRxUgk8mxpaemJz+e71EUVvl8QTlGUjmMCAB8IBLhQKKT1igCCIESTyeRNSZLera+vf2Ma960EpyhKxzEBwKXr+o9sNvsQEQd6PsE87w8Gg/fi8Tiurq6WG40G2CDwhKzSFYIAANdsNvmZmZkYpTT8V6kIkZMkKZFKpbKDg4Mf19bWdmxnA3vBsBCWGtz4+Lggy3Kur2DC876hoaG76XT6GsdxH3Rd/2m7vsfCWBBH1Njd3f2qquoDRKT9xkVK6fDIyEhhcnJSqlar72u1WrNXbLRDIACQWq1mTE1NXRZFMX6q4IrIi6KoqKp6P5FIuPb29ja2t7d/2zypA2OH6GQM0zQ/jY6O5hFROHWKRhREUUxOTEwUM5mMIMvyRrlcrtsjIwtxBGZra+tXNBqter3eW2eO9IhuSmkyFAqVcrlcOJPJfFlZWalYIH8GAK7nwS6rWCe6AAAAAElFTkSuQmCC');
    bottom: 4px;
    left: 50px;
    border: 0;
    width: 26px;
    height: 20px;
    position: absolute;
}

body .headsapp .headsapp-btn-send-chat {
    padding-bottom: 34px;
    padding-top: 20px;
    width: 100%;
    border-top: 2px solid #eeeeee;
    margin-top: 10px;
}

body .headsapp .headsapp-btn-send-chat-text {
    width: 80%;
    float: left;
    font-size: 15px;
    line-height: 22px;
    font-weight: 400;
}

body .headsapp .headsapp-btn-send-chat button {
    border-radius: 4px;
    background-color: transparent;
    border: 2px solid #00a1f5;
    color: #00a1f5;
    padding: 10px 17px;
    font-size: 15px;
    outline: none;
    cursor: pointer;
    float: right;
}

body .headsapp .headsapp-btn-send-chat button:active {
    opacity: 0.7;
}

body .headsapp .headsapp-btn-send-chat-text .headsapp-message-editor {
    outline: none;
    padding-bottom: 20px;
}

body .headsapp .headsapp-chat {
    max-height: 400px;
    float: left;
    overflow-y: scroll;
    position: absolute;
    right: -24px;
}

body .headsapp .headsapp-chat-main {
    height: 440px;
}

 .headsapp.headsapp-review-stars input:checked ~ label, .headsapp .headsapp-review-stars label, .headsapp .headsapp-review-stars label:hover, .headsapp .headsapp-review-stars label:hover ~ label {
    background: url('data:image/png;base64,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AHwABQgAAAUJAAAAAIgAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHQABgoWAAEDAAADBQAABQgsAAAAXwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAABzAAUIAAAA/wAAAP8AAAUIAAAAAIEAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBAAYKCgAAAQAA//8AAP//AAABAwAABQgcAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApAAAAYQAFCAAAAP8AAAD/AAAA/wAAAP8AAAUIAAAAAHcAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhgAGCgQA//8AAP//AAD//wAA//8AAP//AAAAAQAABQgPAAAAewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAACBFAAAwUAAP/+AAD//gAA//4AAP/+AAD//gAA//4AAAQHAAAAAGoAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABUAAAAyAAAAMQAAAGAAAwUAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAgGAPz4pwAAAKoAAADNAAAA0AAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAHQAAADEAAAAyAAAAMQAAADIAAQEcAAEDAAACAgAAAwUAAAECAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFAAACAjYA/vw2AP79AAD//gAA///dAAAAzwAAAM4AAADPAAAAzQAAAOsAAAAAAAAAAAAAAAAB/9BGBgAAAH4AAAA0AAAAMgABARUAAQIAAAIDAAABAgAAAQIAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/+AAD//gAA/v4AAP/+AAD//gAA///lAAAAzQAAAMMAAACNBAAAAPoAAADYAAAAegAFCQEAAQEAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAQMAAAMDAAAAAAAAAAAAAP79GwD8+RUAAACRAC+5/wQAAAAAAAAApAAAABQA/fuPAAMEAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/+AAD8+f0AAABYAC+5vgAAAAAEAAAAAAAAAAAAAACQAP78FAAA/3sAAgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD8+v8AAABnAC+5rwAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAHwA/v0SAAAAaQACAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/AAAAAB5AC+5nQAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAbQD+/Q8A//9aAAECAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAA//6IAAAAiQAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAP0AAABhAP/+EgAA/0gAAQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAA//+bAAAAegAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+gAAAFMA///IAP79AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD//gAA//4AAP/+AAD+/QAA//+uAAAAaQAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2AAAASAAAANMA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAAAAC+AAAAWQAAAP0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPEAAAByAAAAAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAAAAAAAAAAZQAAAPoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFgD//wAA//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAECAAAAARgAAADeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAD/AAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAP//AAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf8AAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAD//gAA//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8BAAABAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAA//4AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/gAAAgAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAP/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBAAAAgMAAAAAAAD+/AAA/v0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAP//CAD//wAA//8AAP//AAD//wAA//8AAAIDAAAFCf0AAwWoAAECMAABAj8AAwa3AAQHAAABAwAA//8AAP//AAD//wAA//8AAP7+AAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAA/wAAAP8AAAD/AAAA/wAAAwQAAAYK+gADBpsAAAAoAAAAWQAAANEAAADCAAAASgABAjIABAarAAYK/gADBAAAAP8AAAD/AAAA/wAA//8JAAAAFgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAA//4AAAAAAAADBQAABgv1AAMGjgAAACIAAABmAAAA3AAAAAAAAAAAAAAAAAAAAAAAAADPAAAAVgAAACkAAwafAAYL+gACBQAA//8AAAD+AAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAP/+AAAGC+4AAwaCAAAAHwAAAHMAAADlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADaAAAAYgAAACQABAaSAAcM9gD//wAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwADBnUAAAAgAAAAfwAAAO0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADjAAAAbwAAACAAAgSFAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAD//0UfqzzqnnycAAAAAElFTkSuQmCC') no-repeat;
}

 .headsapp .headsapp-review-stars {
    *zoom: 1;
    position: relative;
    float: left;
    margin-top: 10px;
}

.headsapp .headsapp-review-stars input {
    filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=0);
    opacity: 0;
    width: 34px;
    height: 35px;
    position: absolute;
    top: 0;
    z-index: 0;
}

.headsapp .headsapp-review-stars input:checked ~ label {
    background-position: 0 -33px;
    height: 34px;
    width: 35px;
}

.headsapp .headsapp-review-stars label {
    background-position: 0 0;
    height: 33px;
    width: 35px;
    float: right;
    cursor: pointer;
    padding-right: 10px;
    position: relative;
    z-index: 1; 
    margin-top: 5px;
}

.headsapp .headsapp-review-stars label:hover, .headsapp .headsapp-review-stars label:hover ~ label {
    background-position: 0 -33px;
    height: 34px;
    width: 35px;
}

.headsapp .headsapp-review-stars #headsapp-star-0 {
    left: 0;
}

.headsapp .headsapp-review-stars #headsapp-star-1 {
    left: 53px;
}

.headsapp .headsapp-review-stars #headsapp-star-2 {
    left: 106px;
}

.headsapp .headsapp-review-stars #headsapp-star-3 {
    left: 159px;
}

.headsapp .headsapp-review-stars #headsapp-star-4 {
    left: 212px;
}

body .headsapp .headsapp-your-message-sent-text {
    padding-bottom: 0;
    text-align: center;
    transition: margin 0.5s;
    font-size: 20px;
}

body .headsapp .headsapp-message-sent-icon {
    text-align: center;
    margin-bottom: 20px;
}

body .headsapp-wrapper div.headsapp-toggle i img {
    height: 23px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -11px;
    margin-left: -11px;
    transition: all 0.3s;
}

body .headsapp-wrapper[data-container-open="true"] .headsapp-toggle .is-close-icon {
    width: 40px;
    height: 40px;
    font-size: 24px;
    font-weight: 100;
    line-height: 40px;
    right: -20px;
    bottom: -20px;
}

body .headsapp-wrapper[data-container-open="true"] div.headsapp-toggle i .x-icon {
    transition: opacity 0.3s;
    transition-delay: 0.3s;
}

body .headsapp-wrapper[data-container-open="true"] div.headsapp-toggle i img  {
    opacity: 0;
}

body .headsapp-wrapper[data-container-open="false"] div.headsapp-toggle i img  {
    transition: opacity 0.3s;
    transition-delay: 0.3s;
}

body .headsapp-wrapper[data-container-open="false"] div.headsapp-toggle i .x-icon  {
    transition: opacity 0.3s;
    opacity: 0;
}

body .headsapp .headsapp-rate {
    width: 80vw;
}

body .headsapp .headsapp-name-email p {
    margin-bottom: 5px;
}

.headsapp-toggle {
    position: relative;
    margin-left: 30px;
}

.headsapp .headsapp-container {
    display: table;
    width: 100%;
    margin-top: 20px;
    cursor: pointer;
}

.headsapp[data-is_open="false"] .headsapp-container {
    margin-top: 0;
    transition: margin-top 0.4s;
}

.headsapp[data-is_open="false"] {
    opacity: 0;
    transition: opacity 0.3s, max-height 0.5s;
    max-height: 0;
}

.headsapp[data-is_open="true"] {
    opacity: 1;
    transition: all 0.3s;
    max-height: 1700px;
}

.headsapp[data-maximized="false"] .headsapp-body {
    height:23px;
}

.headsapp[data-maximized="true"] .headsapp-body {
    height: 350px;
}

.headsapp[data-show_content="false"] .headsapp-container {
    display: none;
}

.headsapp-wrapper {
    position: fixed;
    right: 40px;
    bottom: 40px;
    transition: opacity 0.3s;
    display: none;
    opacity: 0;
    z-index: 9999999;
    line-height: initial;
}

            </style>
<div class="headsapp-toggle">
            <i class="is-close-icon" aria-hidden="true"><span class="x-icon">×</span><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIyNHB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0ibWl1IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgaWQ9IkFydGJvYXJkLTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMTUuMDAwMDAwLCAtMzM1LjAwMDAwMCkiPjxnIGlkPSJzbGljZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjE1LjAwMDAwMCwgMTE5LjAwMDAwMCkiLz48cGF0aCBkPSJNMjM3LDM0MS4wMjA1NjggTDIzNywzNDAgTDIxNywzNDAgTDIxNywzNDEuMDIwNTY4IEwyMjcsMzQ4LjY4NzQxIEwyMzcsMzQxLjAyMDU2OCBaIE0yMzcsMzQyLjI3NzQyMSBMMjM3LDM1My4yOTI1OTIgTDIzMC43NjE2NTcsMzQ3LjA1MTExMiBMMjM3LDM0Mi4yNzc0MjEgWiBNMjM2LjI5MzE5NCwzNTQgTDIxNy43MTA0NDgsMzU0IEwyMjQuMDQxNTM1LDM0Ny42NjU3MjggTDIyNywzNDkuOTI5NTk4IEwyMjkuOTYwNTI4LDM0Ny42NjQxNDkgTDIzNi4yOTMxOTQsMzU0IFogTTIxNywzNTMuMjk2MjM2IEwyMTcsMzQyLjI3NzQyMSBMMjIzLjI0MDQwNywzNDcuMDUyNjkxIEwyMTcsMzUzLjI5NjIzNiBaIE0yMTYsMzM5IEwyMzgsMzM5IEwyMzgsMzU1IEwyMTYsMzU1IEwyMTYsMzM5IFoiIGZpbGw9IiNmZmZmZmYiIGlkPSJjb21tb24tZW1haWwtZW52ZWxvcGUtbWFpbC1vdXRsaW5lLXN0cm9rZSIvPjwvZz48L2c+PC9zdmc+" alt="New message"></i>
            </div>`;


})();