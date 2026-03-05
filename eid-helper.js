/**
 * e-ID app helper
 *
 * Takes card content from URL hash as encoded JSON
 * The data is saved in LocalStorage and made available to a callback function
 * You can't recover data sent to another domain
 *
 * Callback may not activate the correct tab, notification can be used
 * to alert the user and focus the corresponding tab
 * Add data-alert attribute to the link to activate this feature
 *
 * Page content is hidden on loading and replaced with a loading indicator
 * if card content is found on the URL hash
 *
 * URLs starting with eid-app: are automatically connected to the helper
 * e.g. <a id="register" href="eid-app:">Register using e-ID card</a>
 *
 * Usage: document.querySelector('#register').read = function(data) {
 *      console.log(data);
 * };
 */

var css = document.createElement('style');
css.setAttribute('content', 'text/css');
css.innerText = ' \
body { \
    visibility: hidden; \
} \
.loader { \
    position: fixed; \
    left: 50%; \
    top: 50%; \
    margin-left: -24px; \
    margin-top: -24px; \
    visibility: visible; \
    width: 48px; \
    height: 48px; \
    display: inline-block; \
} \
.loader::after, .loader::before { \
    content: \'\'; \
    box-sizing: border-box; \
    width: 48px; \
    height: 48px; \
    border-radius: 50%; \
    border: 2px solid rgba(0, 0, 0, .5); \
    position: absolute; \
    left: 0; \
    top: 0; \
    animation: animloader 2s linear infinite; \
} \
.loader::after { \
    animation-delay: 1s; \
} \
@keyframes animloader { \
    0% { \
        transform: scale(0); \
        opacity: 1; \
    } \
    100% { \
        transform: scale(1); \
        opacity: 0; \
    } \
} \
';
document.querySelector('head').appendChild(css);

var eidHelper = {};
eidHelper.permission = null;
eidHelper.notification = null;
eidHelper.on = null;
eidHelper.patchLinks = function() {
    var links = document.querySelectorAll('a[href^="eid-app:"]');
    Array.prototype.forEach.call(links, function (link) {
        if ('eid-app:' === link.href) {
            link.href = 'eid-app://';
        }
        if ('eid-app://' === link.href) {
            var href = new String(location);
            if ('' === location.hash) {
                href += '#';
            }
            href = 'eid-app:' + href.substring(location.protocol.length);
            link.href = href;
        }
        if (!link.hasAttribute('id')) {
            link.setAttribute('id', 'eid-app-' + new Date().getTime());
        }
        if (link.hasAttribute('data-alert')) {
            if (null === eidHelper.permission) {
                eidHelper.permission = Notification.permission;
                if ('granted' !== eidHelper.permission) {
                    Notification.requestPermission();
                }
            }
        }
        link.addEventListener('click', function() {
            eidHelper.on = link.id;
        })
    });
}
eidHelper.bindData = function() {
    var h = decodeURIComponent(location.hash.substring(1));
    if ('' === h) {
        h = 'null';
    }
    var data = null;
    try {
        data = JSON.parse(h);
    } catch(e) {
        console.log(e);
        data = null;
    }
    if (null === data || 'object' !== typeof data) {
        document.body.style.visibility = 'visible';
        window.addEventListener('storage', function(storageEvent) {
            if ('eid-app' !== storageEvent.key || null === storageEvent.newValue) {
                return;
            }
            var link = document.getElementById(eidHelper.on);
            var callback = 'read' in link ? link.read : function(data) {
                console.log(data);
            };
            eidHelper.on = null;
            var data = JSON.parse(storageEvent.newValue);
            if (link.hasAttribute('data-alert') && 'granted' === eidHelper.permission) {
                eidHelper.notification = new Notification('eid-app', {
                    body: 'Card data received. Click to view.'
                });
                eidHelper.notification.onclick = function () {
                    parent.focus();
                    window.focus();
                    eidHelper.notification.close();
                    eidHelper.notification = null;
                };
            }
            window.localStorage.removeItem('eid-app');
            setTimeout(function() {
                callback(data);
            }, 1000);
        });
        return;
    }
    var loader = document.createElement('div');
    loader.setAttribute('class', 'loader');
    document.body.appendChild(loader);
    window.localStorage.setItem('eid-app', h);
    setTimeout(function() {
        window.close();
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    eidHelper.patchLinks();
    eidHelper.bindData();
});

window.addEventListener('focus', function() {
    if (null !== eidHelper.notification) {
        eidHelper.notification.close();
        eidHelper.notification = null;
    }
});
