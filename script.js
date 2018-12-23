var _exchange = null;
var _formats = {'USD':{'name':'US Dollar','fractionSize':2,'symbol':{'grapheme':'$','template':'$1','rtl':false},'uniqSymbol':{'grapheme':'$','template':'$1','rtl':false}},'EUR':{'name':'Euro','fractionSize':2,'symbol':{'grapheme':'€','template':'$1','rtl':false},'uniqSymbol':{'grapheme':'€','template':'$1','rtl':false}},'GBP':{'name':'Pound Sterling','fractionSize':2,'symbol':{'grapheme':'£','template':'$1','rtl':false},'uniqSymbol':{'grapheme':'£','template':'$1','rtl':false}},'ILS':{'name':'New Israeli Sheqel','fractionSize':2,'symbol':{'grapheme':'₪','template':'$1','rtl':false},'uniqSymbol':{'grapheme':'₪','template':'$1','rtl':false}}};
var _myCurrency = null;
var _handlingPage = false;
var _ourDataAttribute = 'data-price-convert';
var _keyByGrapheme = {};//{ '₪': 'ILS', '$': 'USD' };
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
            _keyByGrapheme[g] = format;
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
    var selectors = ['.sx-price', '.s-result-item .s-price'];
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
            getExchangeByCurrency(price.currency, function (exchange) {
                var newRow = document.createElement('tr');
                var valueCell = document.createElement('td');
                valueCell.setAttribute('colspan', '2');
                valueCell.style = 'color: #505050 !important; font-weight: bold !important; text-align: right !important;';
                valueCell.innerHTML = formatPrice(price.value * exchange);
                newRow.appendChild(valueCell);
                row.parentElement.appendChild(newRow);
                _handlingPage = false;
            });
        } else {
            _handlingPage = false;
        }
    } else {
        _handlingPage = false;
    }
}

function handleSearchPage(e) {
    if (e.length === 0) {
        _handlingPage = false;
        return;
    }

    var setHandlingPage = callAfter(e.length, function () {
        _handlingPage = false;
    });

    for (var i = 0; i < e.length; i++) {
        if (elementHandled(e[i])) {
            setHandlingPage();
            continue;
        }
        var price = extractPrice(e[i]);
        var parent = getParentElement(e[i], 'div');
        if (price && parent) {
            (function (price, parent) {
                getExchangeByCurrency(price.currency, function (exchange) {
                    var newDiv = document.createElement('div');
                    newDiv.style = 'color: #656565 !important; font-weight: bold !important; padding: 3px 0 !important;';
                    newDiv.innerHTML = formatPrice(price.value * exchange);
                    parent.appendChild(newDiv);
                    setHandlingPage();
                });
            })(price, parent);
        } else {
            setHandlingPage();
        }
    }
}

function callAfter(times, call) {
    return function() {
        if (--times < 1) {
            return call.apply(this, null);
        }
    };
}

function handleItemPage(e) {
    if (!elementHandled(e)) {
        var row = getParentElement(e, 'tr');
        if (row) {
            var mainPrice = extractPrice(e);
            var shippingPrice = null;
            var shipping = row.querySelector('span.a-size-base.a-color-secondary');
            if (shipping) {
                console.log('found shipping');
                shippingPrice = extractPrice(shipping);
            } else {
                var parentTable = getParentElement(row, 'table');
                shipping = parentTable.querySelector('span.a-size-base.a-color-secondary');
                if (shipping) {
                    console.log('found shipping in parent table');
                    shippingPrice = extractPrice(shipping);
                }
            }

            var cellCount = row.querySelectorAll('td').length;

            // Create row
            var rowSpace = document.createElement('tr');
            rowSpace.style = 'height: 5px !important;';
            
            var newRow = document.createElement('tr');
            var cell = document.createElement('td');

            cell.innerHTML = '<span class="a-color-secondary a-size-base a-text-right a-nowrap">' + _myCurrency + ':</span>';
            cell.style = 'padding: 5px 0 !important;';
            var cell2 = document.createElement('td');
            if (cellCount > 1) {
                cell2.setAttribute('colspan', cellCount + '');
            }
            cell2.style = 'padding: 5px 0 !important; padding-left: 3px !important;';
            
            newRow.appendChild(cell);
            newRow.appendChild(cell2);

            var toInsert = null;
            if (cellCount > 1) {
                toInsert = newRow;
            } else {
                // Only one cell, create container for our row
                var containerRow = document.createElement('tr');
                var containerCell = document.createElement('td');
                var containerTable = document.createElement('table');
                var tableBody = document.createElement('tbody');
                tableBody.appendChild(newRow);
                containerTable.appendChild(tableBody);
                containerCell.appendChild(containerTable);
                containerRow.appendChild(containerCell);
                cell.style.width = '25px';
                toInsert = containerRow;
            }

            row.parentElement.insertBefore(toInsert, row.nextSibling);

            getExchangeByCurrency(mainPrice.currency, function (exchange) {
                var mainPriceConverted = exchange * mainPrice.value;
                var shippingPriceConverted = null;

                if (shippingPrice) {
                    shippingPriceConverted = exchange * shippingPrice.value;
                }
    
                var convertedPrice = document.createElement('span');
                convertedPrice.innerHTML = '' + formatPrice(mainPriceConverted);
                if (shippingPriceConverted) {
                    convertedPrice.innerHTML += ' + ' + formatPrice(shippingPriceConverted) +
                        ' = ' + formatPrice(mainPriceConverted + shippingPriceConverted);
                }
                convertedPrice.style = 'color: #505050; font-weight: bold;';
                cell2.appendChild(convertedPrice);
                _handlingPage = false;
            });
        } else {
            _handlingPage = false;
        }
    } else {
        _handlingPage = false;
    }
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
    then.apply(null);
}

function getExchangeByCurrency(currency, cb) {
    var pageCurrency = _keyByGrapheme[currency];
    var myCurrency = _myCurrency.toUpperCase();

    chrome.runtime.sendMessage({ action: 'getExchange', params: [ pageCurrency, myCurrency ]}, function (result) {
        cb(result);
    });
}

function extractPrice(element) {
    var relevant = element.childElementCount > 0 ?
        element.querySelectorAll(':not(.a-text-strike)') : [ element ];

    var textToMatch = '';
    for (var i = 0; i < relevant.length; i++) {
        textToMatch += ' ' + relevant[i].innerHTML;
    }

    if (textToMatch.trim().length === 0) {
        return null;
    }
    var price = textToMatch.match(/[\d,.]+/g);
    if (!price) {
        return null;
    }
    price = price.join('.');
    var format = _currencyRegex.exec(textToMatch);
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
    var format = _formats[_myCurrency] || {
        symbol: {
            grapheme: _myCurrency,
            template: '1$',
            fractionSize: 2
        }
    };
    var t = format.symbol.template.replace('$', format.symbol.grapheme);
    var p = price.toFixed(format.symbol.fractionSize);
    var pSplit = p.split('.');
    pSplit[0] = pSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return t.replace('1', pSplit.join('.'));
}