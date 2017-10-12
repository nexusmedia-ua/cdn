(function () {

    // const BASEURL = "http://dev.nexusmedia-ua.com/api/public";
    // const CONFIG_URL = BASEURL + "/config";
    let container = null;
    const userdata = document.currentScript.dataset;

    function apiRequest(handler, type, data) {
        const request = new XMLHttpRequest();
        request.addEventListener("load", handler);
        request.open("POST", type);
        request.send(JSON.stringify(data));
    }

    function setContainerHandler(container) {
        const toggler = container.querySelector('.easybot-toggle');
        toggler.addEventListener('click', function () {
            if (container.getAttribute('data-container-open') == 'true') {
                    closeContainer(container);
                } else {
                    openContainer(container);
                }
            }
        );
    }

    function openContainer(container) {
        container.setAttribute('data-container-open', true);
        const easybots = container.querySelectorAll('.easybot');
        for (let i = 0; i < easybots.length; i++) {
            const easybot = easybots[i];
            openPopup(easybot, true);
            if (easybot.style.display == 'none') {
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
    }

    const b = document.getElementsByName('body');
    if (typeof b === 'undefined' || b === null || b.length === 0) {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    function createMessagesWrapper() {
        let newContainer = document.createElement('div');
        newContainer.id = 'easybot-wrapper';
        openContainer(newContainer);
        newContainer.className = 'easybot-wrapper';
        document.querySelector('body').appendChild(newContainer);
        newContainer.innerHTML = wrapperHtml;
        let newMainContainer = document.createElement('div');
        newMainContainer.className = 'easybot-wrapper-main';
        newContainer.insertBefore(newMainContainer, newContainer.firstChild);
        return newContainer;
    }

    function run() {
        if (userdata['fbPageUrl'] !== undefined) {
            container = createMessagesWrapper();
            setContainerHandler(container);
            renderMessages();
        }
        else {
            console.error('data-fb-page-url not found')
        }
        document.addEventListener('click', function (event) {
            if (event.target.closest('.easybot-wrapper') == null) {
            }
        })
    }

    function renderMessages() {
        setFbChat();
        document.querySelector('.easybot-wrapper').style.display = 'block';
        setTimeout(function () {
            document.querySelector('.easybot-wrapper').style.opacity = 1;
        },200);
    }

    function setFbChat() {
        setTemplate();
        getUserDataFb();
        closeFbChat();
    }

    function closeFbChat () {
        var button = document.querySelector(".close-fbchat");
        button.addEventListener("click", function() {
            document.querySelector('.easybot_messenger_box').setAttribute('data-is_open', 'false');
            document.querySelector('.easybot-wrapper').setAttribute('data-container-open', 'false');
        });
    }

    function setTemplate() {
        document.querySelector('.easybot-wrapper-main').innerHTML = getTmpl('fbchat');
        document.querySelector('.easybot-wrapper').setAttribute('data-container-open', 'false');
    }
    var UrlObj = {};
    function connectionUrl() {
        let fbPageUrl = userdata['fbPageUrl'];
        let fbUrl = 'https://www.facebook.com/plugins/page.php?href=';
        let fbUrlEnd = '&tabs=messages&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId=1262045467217804';
        UrlObj.urlTrue = fbUrl + fbPageUrl + fbUrlEnd;
    }

    function getUserDataFb() {
        connectionUrl();
        let urlTrue = UrlObj.urlTrue;

        let borderColor = userdata['borderColor'];
        if(borderColor !== undefined) {
            document.querySelector('.easybot_messenger_button').style.borderColor = borderColor;
        }
        else {
            document.querySelector('.easybot_messenger_button').style.borderColor = '';
        }

        let title = userdata['title'];
        if(title !== undefined) {
            document.querySelector('.easybot_messenger_header_title').innerHTML = title;
        }
        else {
            document.querySelector('.easybot_messenger_header_title').innerHTML = '';
        }

        if (!userdata['small_icon']) {
            document.querySelector('.easybot_messenger_icon').style.display = 'none';
        }

        let icon = userdata['icon'];
        if(icon !== undefined) {
            document.querySelector('.easybot_messenger_icon_tag').setAttribute('src', icon);
        }
        else {
            let standartImg = document.querySelector('.easybot_messenger_icon').getAttribute('src');
            document.querySelector('.easybot_messenger_icon_tag').setAttribute('src', standartImg);
        }

        let hash = userdata['hash'];
        if(hash !== undefined) {
            if(hash.charAt(0) == 1) {
                document.querySelector('.easybot_messenger_footer').style.display = 'none';
                document.querySelector('.easybot_messenger_footer').style.height = 0+'px';
            }
        }

        let height = +window.innerHeight - document.querySelector('.easybot_messenger_header').offsetHeight - document.querySelector('.easybot_messenger_footer').offsetHeight;
        let width = document.querySelector('.easybot_messenger_box').offsetWidth;
        let urlWithHeightAndWidth = urlTrue + '&height=' + height + '&width=' + width;
        document.querySelector('.easybot_messenger_box iframe').setAttribute('height', height);
        document.querySelector('.easybot_messenger_box iframe').setAttribute('width', width);
        document.querySelector('.easybot_messenger_box iframe').setAttribute('src', urlTrue + urlWithHeightAndWidth);

        if (userdata['position'] === 'top') {
            document.querySelector('.easybot_messenger_button_wrapper').style.bottom = document.documentElement.offsetHeight - document.querySelector('.easybot_messenger_header').offsetHeight * 2 +'px';
        }
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
                return `
                <div class="easybot_messenger_box easybot" data-is_open="false">
                    <div class="easybot_messenger_header"><div class="easybot_messenger_header_title"></div><span class="close-fbchat">&times;</span></div>
                        <iframe data-width="100%" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>
                    <div class="easybot_messenger_footer">Powered with <a href="https://apps.shopify.com/easybot-messenger-live-chat-bot" target="_blank">EasyBot</a></div>
                    </div>
                `;
            }
        }
    }

    const wrapperHtml = `<style>
    .easybot-wrapper {
    z-index: 999999999;
    }
    
    .easybot-wrapper[data-container-open="false"] {
    padding-bottom: 0 !important;
    transition: all 0.3s;
    }
    
    .easybot-wrapper[data-container-open="true"] .easybot-toggle {
    display: none;
    }
    
    .easybot-wrapper[data-container-open="true"] {
    top: 0;
    }

    @media screen and (max-width: 740px), (max-device-width: 740px) {

    }
    
    @media screen and (max-width:480px) {
    .easybot-wrapper-main .easybot_messenger_box {
    width: 100%;
    }
    .easybot-wrapper {
    width: 100%;
    }
    }

.easybot-toggle {
    position: relative;
    margin-left: 30px;
}

.easybot[data-is_open="false"] {
    opacity: 0;
    transition: opacity 0.3s, max-height 0.5s;
    max-height: 0;
}

.easybot[data-is_open="true"] {
    opacity: 1;
    transition: all 0.3s;
    max-height: 10000px;
}

.easybot-wrapper {
    position: fixed;
    right: 0;
    bottom: 0;
    transition: opacity 0.3s;
}

.easybot_messenger_box {
	top:0;
	right:0;
	bottom:0;
	width:380px;
	margin:0;
	padding:0;
	border-left: 1px #e9ebee solid;
	box-sizing: border-box;
}
.easybot_messenger_box iframe { 
    margin-top: 50px; 
    margin-left: -1px;
    padding-top: 1px;
}
.easybot_messenger_header {
	border: 1px #e9ebee solid;
	margin:0;
	padding:0;
	height: 49px;
	top: 0; 
	left: 0;
	right: 0;
	background: #fff;
	font-family: sans-serif;
	line-height: 50px;
	font-size: 18px;
	color: #39515c;
	text-align: center;
	font-weight: bold;
	position: absolute;
}
.easybot_messenger_header span {
	position: absolute;
    right: 14px;
    font-weight: normal;
    font-size: 30px;
    cursor: pointer;
    color: #69818c;
    top: -2px;
}
.easybot_messenger_header span:hover {
    color: #39515c;
} 
.easybot_messenger_footer {
	position: absolute;
	background: #e9ebee;
	bottom: 0;
	left: 0;
	right: 0;
	font-size: 11px;
	font-family: sans-serif;
	line-height: 22px;
	text-align: center;
	color: #999;
}
.easybot_messenger_button_wrapper {
	position:absolute; 	
	right:20px;
	bottom:20px;
	width:64px;
	height:64px;
	margin:0;
	padding:0;
	box-sizing: border-box;
	cursor:pointer;
	z-index: 999999999;
}
.easybot_messenger_button {
	width:64px;
	height:64px;
	margin:0;
	padding:0;
	border: 3px #06a8f3 solid;
	box-sizing: border-box;
	overflow: hidden;
	border-radius: 100%;
}
.easybot_messenger_button img {
	max-width: 100%;
    object-fit: cover;
    width: 100%;
    height: 100%;
}
.easybot_messenger_button .easybot_messenger_icon {
	width: 20px;
	height: 20px;
	border: 3px #fff solid;
	position: absolute;
	bottom: -3px;
	right: -3px;
	border-radius: 100%;
	box-shadow: 0px 0px 3px #777;
}
.easybot_messenger_footer a, .easybot_messenger_footer a:hover, .easybot_messenger_footer a:visited { color: #999; text-decoration: underline;  }

            </style>
<div class="easybot-toggle">
            <div class="easybot_messenger_button_wrapper">
  <div class="easybot_messenger_button">
    <img class="easybot_messenger_icon_tag" src="">
    <img class="easybot_messenger_icon" src="data:image/png;base64,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" />
  </div>
</div>
            </div>`;


})();

