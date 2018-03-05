var _exchange = null;
var _formats = {"USD":{"name":"US Dollar","fractionSize":2,"symbol":{"grapheme":"$","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"$","template":"$1","rtl":false}},"AUD":{"name":"Australian Dollar","fractionSize":2,"symbol":{"grapheme":"$","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"A$","template":"$1","rtl":false}},"BGN":{"name":"Bulgarian Lev","fractionSize":2,"symbol":{"grapheme":"лв","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"лв","template":"$1","rtl":false}},"BRL":{"name":"Brazilian Real","fractionSize":2,"symbol":{"grapheme":"R$","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"R$","template":"$1","rtl":false}},"CAD":{"name":"Canadian Dollar","fractionSize":2,"symbol":{"grapheme":"$","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"CA$","template":"$1","rtl":false}},"CHF":{"name":"Swiss Franc","fractionSize":2,"symbol":null,"uniqSymbol":null},"CNY":{"name":"Yuan Renminbi","fractionSize":2,"symbol":{"grapheme":"元","template":"1 $","rtl":false},"uniqSymbol":{"grapheme":"元","template":"1 $","rtl":false}},"CZK":{"name":"Czech Koruna","fractionSize":2,"symbol":{"grapheme":"Kč","template":"1 $","rtl":false},"uniqSymbol":{"grapheme":"Kč","template":"1 $","rtl":false}},"DKK":{"name":"Danish Krone","fractionSize":2,"symbol":{"grapheme":"kr","template":"1 $","rtl":false},"uniqSymbol":null},"EUR":{"name":"Euro","fractionSize":2,"symbol":{"grapheme":"€","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"€","template":"$1","rtl":false}},"GBP":{"name":"Pound Sterling","fractionSize":2,"symbol":{"grapheme":"£","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"£","template":"$1","rtl":false}},"HKD":{"name":"Hong Kong Dollar","fractionSize":2,"symbol":{"grapheme":"$","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"HK$","template":"$1","rtl":false}},"HRK":{"name":"Croatian Kuna","fractionSize":2,"symbol":{"grapheme":"kn","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"kn","template":"$1","rtl":false}},"HUF":{"name":"Forint","fractionSize":0,"symbol":{"grapheme":"Ft","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"Ft","template":"$1","rtl":false}},"IDR":{"name":"Rupiah","fractionSize":2,"symbol":{"grapheme":"Rp","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"Rp","template":"$1","rtl":false}},"ILS":{"name":"New Israeli Sheqel","fractionSize":2,"symbol":{"grapheme":"₪","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"₪","template":"$1","rtl":false}},"INR":{"name":"Indian Rupee","fractionSize":2,"symbol":{"grapheme":"₹","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"₹","template":"$1","rtl":false}},"ISK":{"name":"Iceland Krona","fractionSize":2,"symbol":{"grapheme":"kr","template":"$1","rtl":false},"uniqSymbol":null},"JPY":{"name":"Yen","fractionSize":0,"symbol":{"grapheme":"¥","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"¥","template":"$1","rtl":false}},"KRW":{"name":"Won","fractionSize":0,"symbol":{"grapheme":"₩","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"₩","template":"$1","rtl":false}},"MXN":{"name":"Mexican Peso","fractionSize":2,"symbol":{"grapheme":"$","template":"$1","rtl":false},"uniqSymbol":null},"MYR":{"name":"Malaysian Ringgit","fractionSize":2,"symbol":{"grapheme":"RM","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"RM","template":"$1","rtl":false}},"NOK":{"name":"Norwegian Krone","fractionSize":2,"symbol":{"grapheme":"kr","template":"1 $","rtl":false},"uniqSymbol":null},"NZD":{"name":"New Zealand Dollar","fractionSize":2,"symbol":{"grapheme":"$","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"NZ$","template":"$1","rtl":false}},"PHP":{"name":"Philippine Peso","fractionSize":2,"symbol":{"grapheme":"₱","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"₱","template":"$1","rtl":false}},"PLN":{"name":"Zloty","fractionSize":2,"symbol":{"grapheme":"zł","template":"1 $","rtl":false},"uniqSymbol":{"grapheme":"zł","template":"1 $","rtl":false}},"RON":{"name":"New Romanian Leu","fractionSize":2,"symbol":{"grapheme":"lei","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"lei","template":"$1","rtl":false}},"RUB":{"name":"Russian Ruble","fractionSize":2,"symbol":{"grapheme":"₽","template":"1 $","rtl":false},"uniqSymbol":{"grapheme":"₽","template":"1 $","rtl":false}},"SEK":{"name":"Swedish Krona","fractionSize":2,"symbol":{"grapheme":"kr","template":"1 $","rtl":false},"uniqSymbol":null},"SGD":{"name":"Singapore Dollar","fractionSize":2,"symbol":{"grapheme":"$","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"S$","template":"$1","rtl":false}},"THB":{"name":"Baht","fractionSize":2,"symbol":{"grapheme":"฿","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"฿","template":"$1","rtl":false}},"TRY":{"name":"Turkish Lira","fractionSize":2,"symbol":{"grapheme":"₺","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"₺","template":"$1","rtl":false}},"ZAR":{"name":"Rand","fractionSize":2,"symbol":{"grapheme":"R","template":"$1","rtl":false},"uniqSymbol":{"grapheme":"R","template":"$1","rtl":false}}};
var _myCurrency = null;
var _handlingPage = false;
var _ourDataAttribute = 'data-price-convert';
var _keyByGrapheme = { '$': 'USD' };
var _currencyRegex = [];
for (var format in _formats) {
    if (!_formats.hasOwnProperty(format)) {
        continue;
    }
    if (_currencyRegex.indexOf(format) === -1) {
        _currencyRegex.push(format);
        _keyByGrapheme[format] = format;
    }
    if (_formats[format].symbol) {
        var g = _formats[format].symbol.grapheme;
        if (!/\w/.test(g) && _currencyRegex.indexOf(g) === -1) {
            _currencyRegex.push('\\' + g);
            if (g !== '$') {
                _keyByGrapheme[g] = format;
            }
        }
    }
}
_currencyRegex = new RegExp(_currencyRegex.join('|'));

var _checks = [
    { check: getTotalPageElement, cb: handleTotalPage },
    { check: getSearchPageElement, cb: handleSearchPage },
    { check: getItemPageElement, cb: handleItemPage }
];

(function checkElements() {
    var cb = null;
    for (var i = 0; i < _checks.length && !_handlingPage && !cb; i++) {
        var result = _checks[i].check.apply(null);
        if (result) {
            cb = _checks[i].cb;
        }
    }

    if (cb !== null) {
        _handlingPage = true;
        getSettings(function () {
            cb.apply(null, [ result ]);
        });
    }

    setTimeout(function () {
        checkElements();
    }, 800);
})();

function getTotalPageElement() {
    var selectors = ['.order-summary-grand-total + tr:last-child td:last-child strong', '#subtotals table tr:last-of-type td.a-text-bold:last-child'];
    for (var i = 0; i < selectors.length; i++) {
        var e = document.querySelector(selectors[i]);
        if (e) {
            return e;
        }
    }
    return null;
}

function getSearchPageElement() {
    var selectors = ['.s-result-item .s-price', '.sx-price'];
    for (var i = 0; i < selectors.length; i++) {
        var e = document.querySelectorAll(selectors[i]);
        if (e.length > 0) {
            return e;
        }
    }
    return null;
}

function getItemPageElement() {
    var selectors = ['priceblock_ourprice', 'priceblock_dealprice', 'priceblock_saleprice'];
    for (var i = 0; i < selectors.length; i++) {
        var e = document.getElementById(selectors[i]);
        if (e) {
            return e;
        }
    }
    return null;
}

function handleTotalPage(e) {
    if (!elementHandled(e)) {
        var row = getParentElement(e, 'tr');
        var price = extractPrice(e);
        if (row && price) {
            var exchage = getExchangeByCurrency(price.currency);
            var newRow = document.createElement('tr');
            var valueCell = document.createElement('td');
            valueCell.setAttribute('colspan', '2');
            valueCell.style = 'color: #505050; font-weight: bold; text-align: right;';
            valueCell.innerHTML = formatPrice(price.value * exchage);
            newRow.appendChild(valueCell);
            row.parentElement.appendChild(newRow);
        }
    }
    _handlingPage = false;
}

function handleSearchPage(e) {
    for (var i = 0; i < e.length; i++) {
        if (elementHandled(e[i])) {
            continue;
        }
        var price = extractPrice(e[i]);
        var parent = getParentElement(e[i], 'div');
        if (price && parent) {
            var exchange = getExchangeByCurrency(price.currency);
            var newDiv = document.createElement('div');
            newDiv.style = 'color: #656565; font-weight: bold; padding: 3px 0;';
            newDiv.innerHTML = formatPrice(price.value * exchange);
            parent.appendChild(newDiv);
        }
    }
    _handlingPage = false;
}

function handleItemPage(e) {
    if (!elementHandled(e)) {
        var row = null;
        var row = getParentElement(e, 'tr');

        if (row) {
            var mainPrice = extractPrice(e);
            var shippingPrice = null;
            var shipping = row.querySelector('span.a-size-base.a-color-secondary');
            if (shipping) {
                shippingPrice = extractPrice(shipping);
            }

            // Create row
            var rowSpace = document.createElement('tr');
            rowSpace.style = 'height: 5px;';
            var newRow = document.createElement('tr');
            var cell = document.createElement('td');
            cell.innerHTML = '<span class="a-color-secondary a-size-base a-text-right a-nowrap">' + _myCurrency + ':</span>';
            cell.style = 'padding: 5px 0;';
            var cell2 = document.createElement('td');
            cell2.setAttribute('colspan', '2');
            cell2.style = 'padding: 5px 0; padding-left: 3px;';
            newRow.appendChild(cell);
            newRow.appendChild(cell2);
            row.parentElement.insertBefore(newRow, row.nextSibling);

            var exchange = getExchangeByCurrency(mainPrice.currency);
            var mainPriceConverted = exchange * mainPrice.value;
            var shippingPriceConverted = null;
        
            if (shippingPrice) {
                var ex = getExchangeByCurrency(shippingPrice.currency);
                shippingPriceConverted = ex * shippingPrice.value;
            }

            var convertedPrice = document.createElement('span');
            convertedPrice.innerHTML = '' + formatPrice(mainPriceConverted);
            if (shippingPriceConverted) {
                convertedPrice.innerHTML += ' + ' + formatPrice(shippingPriceConverted)
                    + ' = ' + formatPrice(mainPriceConverted + shippingPriceConverted);
            }
            convertedPrice.style = 'color: #505050; font-weight: bold;';
            cell2.appendChild(convertedPrice);
        }
    }

    _handlingPage = false;
}

function elementHandled(e) {
    if (e.getAttribute(_ourDataAttribute) === 'yes') {
        return true;
    } else {
        e.setAttribute(_ourDataAttribute, 'yes');
        return false;
    }
}

function getParentElement(child, parentTag) {
    if (!child.parentElement) {
        return null;
    } else if (child.parentElement.tagName.toLowerCase() === parentTag.toLowerCase()) {
        return child.parentElement;
    } else {
        return getParentElement(child.parentElement, parentTag);
    }
}

function getSettings(then) {
    if (!_myCurrency) {
        chrome.runtime.sendMessage({ action: 'getSettings' }, function(v) {
            _myCurrency = v;
            getSettings.apply(this, [ then ]);
        });
        return;
    }

    if (!_exchange) {
        chrome.runtime.sendMessage({ action: 'getExchange' }, function(v) {
            _exchange = v;
            getSettings.apply(this, [ then ]);
        });
        return;
    }

    then.apply(null);
}

function getExchangeByCurrency(currency) {
    var key = _keyByGrapheme[currency];
    var ex = _exchange.rates[_myCurrency];
    if (key !== 'USD') {
        ex /= _exchange.rates[key];
    }
    return ex;
}

function extractPrice(element) {
    var price = element.innerHTML.match(/[\d,.]+/g).join('.');
    var format = _currencyRegex.exec(element.innerHTML);
    if (!format || format.length === 0) {
        return null;
    }
    var newPrice = null;
    if (price.indexOf('.') < price.indexOf(',')) {
        newPrice = price.replace('.', '').replace(',', '.');
    } else {
        newPrice = price.replace(',', '');
    }
    newPrice = +newPrice;
    if (isNaN(newPrice)) {
        return null;
    }
    return { value: newPrice, currency: format[0] };
}

function formatPrice(price) {
    var format = _formats[_myCurrency];
    var template = '1$';
    var symbol = _myCurrency;
    if (format.symbol) {
        template = format.symbol.template;
        symbol = format.symbol.grapheme;
    }
    var t = template.replace('$', symbol);
    var p = price.toFixed(format.fractionSize || 2);
    var pSplit = p.split('.');
    pSplit[0] = pSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return t.replace('1', pSplit.join('.'));
}