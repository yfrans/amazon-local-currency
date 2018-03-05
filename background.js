// Local vars
var _remoteActions = {
    'getExchange': getExchange,
    'getSettings': getSettings,
    'setSettings': setSettings
};

// Helpers
function jx(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function needUpdate(date) {
    var today = new Date();
    date.setHours(16, 0, 0, 0);
    return today < date || (today - date) / 1000 / 60 / 60 > 24;
}
// --

// Remote actions
function getExchange(cb, renew) {
    if (!renew) {
        chrome.storage.sync.get('exchange', function (items) {
            if (!items || !items.exchange) {
                getExchange(cb, true);
            } else {
                var v = items.exchange;
                if (v.date) {
                    if (!needUpdate(new Date(v.date))) {
                        cb(v);
                    } else {
                        getExchange(cb, true);
                    }
                } else {
                    getExchange(cb, true);
                }
            }
        });
    } else {
        jx('https://api.fixer.io/latest?base=USD', function (resp) {
            var obj = JSON.parse(resp);
            chrome.storage.sync.set({ 'exchange': obj }, function () {
                cb(obj);
            });
        });
    }
}

function getSettings(cb) {
    chrome.storage.sync.get('settings', function (items) {
        if (!items.settings) {
            cb('ILS');
        } else {
            cb(items.settings);
        }
    });
}

function setSettings(cb, settings) {
    chrome.storage.sync.set({ 'settings': settings }, function () {
        cb(true);
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, cb) {
    if (!message) {
        cb(null);
        return;
    }

    if (_remoteActions[message.action]) {
        var params = message.params || [];
        params.splice(0, 0, cb);
        _remoteActions[message.action].apply(null, params);
    } else {
        cb(null);
    }
    return true;
});
// --