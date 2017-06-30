var StatusBar = (function(ui) {
    var self = {};

    var timerHide = null;

    // mode: 0
    // search: 1
    // searchResult: 2
    // proxy: 3
    self.show = function(n, content, duration) {
        if (timerHide) {
            clearTimeout(timerHide);
            timerHide = null;
        }
        var span = ui.find('span');
        if (n < 0) {
            span.html("");
        } else {
            $(span[n]).html("").append(content);
        }
        var lastSpan = -1;
        for (var i = 0; i < span.length; i++) {
            if ($(span[i]).html().length) {
                lastSpan = i;
                $(span[i]).css('padding', '0px 8px');
                $(span[i]).css('border-right', '1px solid #999');
            } else {
                $(span[i]).css('padding', '');
                $(span[i]).css('border-right', '');
            }
        }
        $(span[lastSpan]).css('border-right', '');
        ui.css('display', lastSpan === -1 ? 'none' : 'block');
        Front.flush();
        if (duration) {
            timerHide = setTimeout(function() {
                self.show(n, "");
            }, duration);
        }
    };
    return self;
})(Front.statusBar);

var Find = (function(mode) {
    var self = $.extend({
        name: "Find",
        statusLine: "/",
        frontendOnly: true,
        eventListeners: {}
    }, mode);

    self.addEventListener('keydown', function(event) {
        // prevent this event to be handled by Surfingkeys' other listeners
        event.sk_suppressed = true;
    }).addEventListener('mousedown', function(event) {
        event.sk_suppressed = true;
    });

    var input = $('<input id="sk_find" class="sk_theme"/>');

    function makeTranslator(textBox) {
        const keyPressHandler = function(event) {
            // Prevent the key pressed from being inserted into the textbox
            // normally.
            event.preventDefault();
            if (event.key in self.qwertyToDvorak) {
                textBox.val(textBox.val() + self.qwertyToDvorak[event.key]);
            }

            // Without this the visual highlight won't update immediately.
            Front.visualCommand({
                action: 'visualUpdate',
                query: textBox.val()
            });
        };

        textBox.keypress(keyPressHandler);
    }

    self.qwertyToDvorak = {
        "q": "'",
        "w": ",",
        "e": ".",
        "r": "p",
        "t": "y",
        "y": "f",
        "u": "g",
        "i": "c",
        "o": "r",
        "p": "l",
        "[": "/",
        "]": "=",
        "a": "a",
        "s": "o",
        "d": "e",
        "f": "u",
        "g": "i",
        "h": "d",
        "j": "h",
        "k": "t",
        "l": "n",
        ";": "s",
        "'": "-",
        "z": ";",
        "x": "q",
        "c": "j",
        "v": "k",
        "b": "x",
        "n": "b",
        "m": "m",
        ",": "w",
        ".": "v",
        "/": "z",
        "Q": "\"",
        "W": "<",
        "E": ">",
        "R": "P",
        "T": "Y",
        "Y": "F",
        "U": "G",
        "I": "C",
        "O": "R",
        "P": "L",
        "{": "?",
        "}": "+",
        "A": "A",
        "S": "O",
        "D": "E",
        "F": "U",
        "G": "I",
        "H": "D",
        "J": "H",
        "K": "T",
        "L": "N",
        ":": "S",
        "\"": "_",
        "X": "Q",
        "C": "J",
        "V": "K",
        "B": "X",
        "N": "B",
        "M": "M",
        "<": "W",
        ">": "V",
        "?": "Z",
        "Z": ":",
        "=": "]",
        "+": "}",
        "-": "[",
        "_": "{",
        // Not transformed
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5",
        "6": "6",
        "7": "7",
        "8": "8",
        "9": "9",
        "0": "0",
        "!": "!",
        "@": "@",
        "#": "#",
        "$": "$",
        "%": "%",
        "^": "^",
        "&": "&",
        "*": "*",
        "(": "(",
        ")": ")",
        " ": " "
    };


    var historyInc;
    function reset() {
        input.val('');
        StatusBar.show(1, "");
        self.exit();
    }

    self.open = function() {
        historyInc = -1;
        StatusBar.show(1, input);
        makeTranslator(input);
        // input.on('input', function() {
        //     Front.visualCommand({
        //         action: 'visualUpdate',
        //         query: input.val()
        //     });
        // });
        var findHistory = [];
        runtime.command({
            action: 'getSettings',
            key: 'findHistory'
        }, function(response) {
            findHistory = response.settings.findHistory;
        });
        input[0].onkeydown = function(event) {
            if (Mode.isSpecialKeyOf("<Esc>", event.sk_keyName)) {
                reset();
                Front.visualCommand({
                    action: 'visualClear'
                });
            } else if (event.keyCode === KeyboardUtils.keyCodes.enter) {
                var query = input.val();
                if (query.length > 0) {
                    if (event.ctrlKey) {
                        query = '\\b' + query + '\\b';
                    }
                    reset();
                    runtime.updateHistory('find', query);
                    Front.visualCommand({
                        action: 'visualEnter',
                        query: query
                    });
                }
            } else if (event.keyCode === KeyboardUtils.keyCodes.upArrow || event.keyCode === KeyboardUtils.keyCodes.downArrow) {
                if (findHistory.length) {
                    historyInc = (event.keyCode === KeyboardUtils.keyCodes.upArrow) ? (historyInc + 1) : (historyInc + findHistory.length - 1);
                    historyInc = historyInc % findHistory.length;
                    var query = findHistory[historyInc];
                    input.val(query);
                    Front.visualCommand({
                        action: 'visualUpdate',
                        query: query
                    });
                }
            }
        };
        input.focus();
        self.enter();
    };
    return self;
})(Mode);
