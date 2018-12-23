// Local vars
var _remoteActions = {
    'getExchange': getExchange,
    'getSettings': getSettings,
    'setSettings': setSettings,
    'getAllCurrencies': getAllCurrencies
};

// Helpers
function jx(url, xml, callback) {
    if (typeof xml === 'function') {
        callback = xml;
        xml = false;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xml ? xmlhttp.responseXML : xmlhttp.responseText);
        }
    };
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function jxp(url, params, xml, callback) {
    if (typeof xml === 'function') {
        callback = xml;
        xml = false;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xml ? xmlhttp.responseXML : xmlhttp.responseText);
        }
    };
    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send(params);
}

function needUpdate(value) {
    var lastUpdate = new Date(value.lastUpdate);
    var lastCheck = new Date(value.lastCheck);
    var today = new Date();

    //console.log('check: ', today, lastCheck, lastUpdate);

    if (today < lastUpdate) {
        return true;
    } else {
        var hourDiff = (today - lastCheck) / (60 * 60 * 1000);
        //console.log(hourDiff);
        return hourDiff > 4;
    }
}
// --

function getAllCurrencies(cb) {
    jx('https://free.currencyconverterapi.com/api/v6/currencies', function (resp) {
        cb(JSON.parse(resp).results);
    });
}

function getExchange(cb, from, to) {
    var pair = from.toUpperCase() + '_' + to.toUpperCase();
    var renew = false;
    var key = 'exchange_' + pair;
    chrome.storage.sync.get(key, function (items) {
        console.log('storage items: ', items);
        if (!items || !items[key] || isNaN(items[key].lastCheck)) {
            renew = true;
        } else {
            var v = items[key];
            var today = new Date().getTime();
            console.log('lastcheck: ' + new Date(v.lastCheck));
            console.log('now: ' + new Date(today));
            console.log('diff: ' + (today - v.lastCheck) / (60 * 60 * 1000));
            renew = !v.lastCheck || today < v.lastCheck || (today - v.lastCheck) / (60 * 60 * 1000) >= 1;
        }

        if (renew) {
            console.log('RENEW! (' + pair + ')');
            jx('https://free.currencyconverterapi.com/api/v6/convert?q=' + pair + '&compact=ultra', false, function (resp) {
                var v = JSON.parse(resp)[pair];
                var toSave = {};
                toSave[key] = {
                    lastCheck: new Date().getTime(),
                    value: v
                };
                chrome.storage.sync.set(toSave, function () {
                    cb(v);
                });
            });
        } else {
            console.log('CACHE! (' + pair + ')');
            cb(items[key].value);
        }
    });
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