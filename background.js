// Local vars
var _remoteActions = {
    'getExchange': getExchange,
    'getSettings': getSettings,
    'setSettings': setSettings
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

// Remote actions
function getExchange(cb, renew) {
    if (!renew) {
        chrome.storage.sync.get('exchange', function (items) {
            if (!items || !items.exchange) {
                getExchange(cb, true);
            } else {
                var v = items.exchange;
                if (v.lastUpdate && v.lastCheck) {
                    if (!needUpdate(v)) {
                        //console.log('NO UPDATE');
                        cb(v);
                    } else {
                        //console.log('UPDATING');
                        getExchange(cb, true);
                    }
                } else {
                    getExchange(cb, true);
                }
            }
        });
    } else {
        jx('http://www.boi.org.il/currency.xml', true, function (resp) {
            var now = new Date();
            var obj = {
                lastUpdate: new Date(resp.getElementsByTagName('LAST_UPDATE')[0].textContent + ' ' + now.getHours() + ':' + now.getMinutes()).getTime(),
                lastCheck: now.getTime(),
                ILS: {
                    name: 'Israeli New Shekel',
                    value: 1,
                    unit: 1
                }
            };
            var elements = resp.getElementsByTagName('CURRENCY');
            for (var i = 0; i < elements.length; i++) {
                var e = new XmlElementParser(elements[i]);
                obj[e.getNodeValue('CURRENCYCODE')] = {
                    name: e.getNodeValue('NAME'),
                    value: +e.getNodeValue('RATE'),
                    unit: +e.getNodeValue('UNIT')
                };
            }
            //console.log('NEW: ', obj);
            chrome.storage.sync.set({ 'exchange': obj }, function () {
                cb(obj);
            });
        });
    }
}

function XmlElementParser(xmlElement) {
    this.xmlElement = xmlElement;
}

XmlElementParser.prototype.getNodeValue = function (nodeName) {
    var e = this.xmlElement.getElementsByTagName(nodeName);
    if (e && e.length > 0) {
        return e[0].textContent;
    } else {
        return null;
    }
};

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