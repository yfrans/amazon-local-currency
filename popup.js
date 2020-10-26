var _currencies = null;
var _settings = null;
var _messageHidingInterval = null;

chrome.runtime.sendMessage({ action: 'getAllCurrencies' }, function(v) {
    _currencies = v;
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
    if (!_currencies || !_settings) {
        return;
    }

    _currencies.forEach(c => {
        var opt = document.createElement('option');
        opt.setAttribute('value', c.currency_code);
        opt.innerHTML = `${c.currency_code} (${c.currency_name})`;
        if (_settings === c.currency_code) {
            opt.setAttribute('selected', 'selected');
        }
        document.getElementById('currency').appendChild(opt);
    });
}