// Local vars
var _remoteActions = {
    'getExchange': getExchange,
    'getSettings': getSettings,
    'setSettings': setSettings,
    'getAllCurrencies': getAllCurrencies
};

async function getExchangeValues() {
    return new Promise((resolve) => {
        chrome.storage.local.get('exchange_data', async function (exchange) {
            console.log('storage: ', exchange);
            if (!exchange || isNaN(exchange.last_update) || (new Date() - exchange.last_update) >= 1000 * 60 * 60) {
                try {
                    let resp = await fetch('https://amazon-local-currency.herokuapp.com/').then();
                    exchange.last_update = new Date();
                    exchange.rates = await resp.json();
                    chrome.storage.local.set({ exchange_data: exchange }, function () {});
                } catch (ex) {
                    console.log('Error while fetching currencies', ex);
                }
            }
            resolve(exchange);
        });
    });
}

function getAllCurrencies(cb) {
    console.log('Get all currencies');
    getExchangeValues().then(v => cb(v.rates));
}

function getExchange(cb, from, to) {
    getExchangeValues().then(exchange => {
        console.log('Last exchange update: ', exchange.last_update);
        let from_exchange = { rate: 1 };
        if (from !== 'USD') {
            from_exchange = exchange.rates.find(x => x.currency_code === from);
        }
        let to_exchange = exchange.rates.find(x => x.currency_code === to);

        if (!from_exchange) {
            console.log(`Exchange ${from} not found!`);
            return;
        }
        if (!to_exchange) {
            console.log(`Exchange ${to} not found!`);
            return;
        }

        console.log(`From ${from} = ${from_exchange.rate}`);
        console.log(`To ${to} = ${to_exchange.rate}`);
        
        let v = to_exchange.rate / from_exchange.rate;
        console.log(`Exchange for ${from}-${to} is ${v}`);
        cb(v);
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