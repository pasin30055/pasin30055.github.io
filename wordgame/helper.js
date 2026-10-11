var memoryStorage = {};

function setCookie(name, value, days) {
    var strVal = String(value);
    memoryStorage[name] = strVal;
    try {
        if (window.localStorage) {
            window.localStorage.setItem("wordgame_" + name, strVal);
        }
    } catch (e) {
        // Ignore localStorage errors on restricted origins
    }
    try {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + encodeURIComponent(strVal) + expires + "; path=/; SameSite=Lax";
    } catch (e) {
        // Ignore cookie errors on file:// origins
    }
}

function getCookie(name) {
    try {
        if (window.localStorage) {
            var stored = window.localStorage.getItem("wordgame_" + name);
            if (stored !== null) {
                return stored;
            }
        }
    } catch (e) {
        // Ignore localStorage errors
    }
    if (Object.prototype.hasOwnProperty.call(memoryStorage, name)) {
        return memoryStorage[name];
    }
    try {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    } catch (e) {
        // Ignore cookie errors
    }
    return "0";
}

function hide_all() {
    $('#tablecontainer').hide();
    $('#contacttextcontainer').hide();
    $('#abouttextcontainer').hide();
    $('#mycontainer').hide();
    $('#bottomdiv').hide();
    $('.active').removeClass('active');
}

function clear_puzzle() {
    solution = false;
    highlighted_category = -1;
    if (typeof clear_tour_timeouts === 'function') {
        clear_tour_timeouts();
    }
    $('.empt-box').remove();
    $('.empt-box-h').remove();
    $('.char-box').remove();
    $('.char-box-h').remove();
    $('.char-box-wrong').remove();
    $('.char-box-h-wrong').remove();
    $('.category-word').remove();
    $('#clear-button').off();
    $('#new-button').off();
    $('#solution-button').off();
    $('#score').attr("score", 0);
    clear_canvas();
}

function clear_canvas() {
    var canvas = $('#link-canvas')[0];
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SCALE * CANVAS_WIDTH, SCALE * CANVAS_HEIGHT);
}

function draw_canvas(puzzle, highlighted_categories) {
    var canvas = $('#link-canvas')[0];
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var normalized_highlighted = [];
    for (var h = 0; h < highlighted_categories.length; h++) {
        var hc = Number(highlighted_categories[h]);
        if (!isNaN(hc) && hc >= 0 && hc < puzzle.categories.length) {
            normalized_highlighted.push(hc);
        }
    }

    // Draw lines for unhighlighted categories
    ctx.lineWidth = 8;
    for (var i = 0; i < puzzle.categories.length; i++) {
        if (normalized_highlighted.indexOf(i) !== -1) {
            continue;
        }
        ctx.strokeStyle = normalized_highlighted.length === 0 ? COLORS[i] : UNHIGHLIGHTED_COLORS[i];
        for (var j = 0; j < puzzle.categories[i].links.length; j++) {
            ctx.beginPath();
            ctx.moveTo(
                SCALE * (WORD_WIDTH + CATEGORY_WIDTH),
                SCALE * (top_offset + i * (BOX_HEIGHT + VERTICAL_SPACE) + BOX_HEIGHT / 2)
            );
            var k = puzzle.categories[i].links[j];
            ctx.lineTo(
                SCALE * left_offset_inp,
                SCALE * (top_offset_inp + k * (INPBOX_WIDTH + BORDER_WIDTH) + INPBOX_WIDTH / 2)
            );
            ctx.stroke();
        }
    }

    // Draw lines for highlighted categories
    ctx.lineWidth = 12;
    for (var i = 0; i < normalized_highlighted.length; i++) {
        var category = normalized_highlighted[i];
        ctx.strokeStyle = COLORS[category];
        for (var j = 0; j < puzzle.categories[category].links.length; j++) {
            ctx.beginPath();
            ctx.moveTo(
                SCALE * (WORD_WIDTH + CATEGORY_WIDTH),
                SCALE * (top_offset + category * (BOX_HEIGHT + VERTICAL_SPACE) + BOX_HEIGHT / 2)
            );
            var k = puzzle.categories[category].links[j];
            ctx.lineTo(
                SCALE * left_offset_inp,
                SCALE * (top_offset_inp + k * (INPBOX_WIDTH + BORDER_WIDTH) + INPBOX_WIDTH / 2)
            );
            ctx.stroke();
        }
    }
}

function highlight_category(puzzle, category_ind) {
    category_ind = Number(category_ind);
    if (isNaN(category_ind) || category_ind < 0 || category_ind >= puzzle.categories.length) {
        return;
    }
    for (var i = 0; i < puzzle.categories[category_ind].links.length; i++) {
        $('#input-' + puzzle.categories[category_ind].links[i]).css('background-color', UNHIGHLIGHTED_COLORS[category_ind]);
        $('#word-' + category_ind + '-' + i).css('background-color', UNHIGHLIGHTED_COLORS[category_ind]);
    }
    clear_canvas();
    draw_canvas(puzzle, [Number(highlighted_category), category_ind]);
}

function unhighlight_category(puzzle, category_ind) {
    category_ind = Number(category_ind);
    if (isNaN(category_ind) || category_ind < 0 || category_ind >= puzzle.categories.length) {
        return;
    }
    for (var i = 0; i < puzzle.categories[category_ind].links.length; i++) {
        $('#input-' + puzzle.categories[category_ind].links[i]).css('background-color', BOX_BACKGROUND_COLOR);
        $('#word-' + category_ind + '-' + i).css('background-color', BOX_BACKGROUND_COLOR);
    }
    if (category_ind === Number(highlighted_category) || Number(highlighted_category) === -1) {
        clear_canvas();
        draw_canvas(puzzle, []);
    } else {
        clear_canvas();
        draw_canvas(puzzle, [Number(highlighted_category)]);
    }
}

function box_intersection(word_ind, input_ind) {
    var input_offset = top_offset_inp + input_ind * (INPBOX_WIDTH + BORDER_WIDTH);
    var word_offset = top_offset + word_ind * (BOX_HEIGHT + VERTICAL_SPACE);
    return Math.min(input_offset + INPBOX_WIDTH, word_offset + BOX_HEIGHT) - Math.max(input_offset, word_offset);
}

function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}