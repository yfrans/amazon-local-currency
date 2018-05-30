var _exchange = null;
var _settings = null;
var _messageHidingInterval = null;

chrome.runtime.sendMessage({ action: 'getExchange' }, function(v) {
    _exchange = v;
    ready();
});

chrome.runtime.sendMessage({ action: 'getSettings' }, function (v) {
    _settings = v;
    ready();
});

document.getElementById('save').onclick = function () {
    if (_messageHidingInterval) {
        clearTimeout(_messageHidingInterval);
    }
    var s = document.getElementById('currency');
    var v = s.options[s.selectedIndex].value;
    chrome.runtime.sendMessage({ action: 'setSettings', params: [v] }, function (saved) {
        document.getElementById('message').style = 'display: block;';
        _messageHidingInterval = setTimeout(function () {
            document.getElementById('message').style = 'display: none;';
        }, 2500);
    });
};

function ready() {
    if (!_exchange || !_settings) {
        return;
    }

    for (var currency in _exchange) {
        if (!_exchange.hasOwnProperty(currency) || currency.length !== 3) {
            continue;
        }

        var opt = document.createElement('option');
        opt.setAttribute('value', currency);
        opt.innerHTML = currency;
        if (_settings === currency) {
            opt.setAttribute('selected', 'selected');
        }
        document.getElementById('currency').appendChild(opt);
    }
}