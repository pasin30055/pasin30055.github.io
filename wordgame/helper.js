function setCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return "0";
}

function clear_puzzle() {
    solution = false;
	$('.empt-box').remove();
	$('.empt-box-h').remove();
	$('.char-box').remove();
	$('.char-box-h').remove();
	$('.char-box-wrong').remove();
	$('.char-box-h-wrong').remove();
	$('.category-word').remove();
    $('#score').attr("score", 0);
    clear_canvas();
}

function clear_canvas() {
    var ctx = $('#link-canvas')[0].getContext('2d');
    ctx.clearRect(0, 0, SCALE * CANVAS_WIDTH - 1, SCALE * CANVAS_HEIGHT - 1);
}

function draw_canvas(puzzle, highlighted_categories) {
    //alert(highlighted_categories);
    var ctx = $('#link-canvas')[0].getContext('2d');

    // Draw lines for unhighlighted categories
    ctx.lineWidth = 8;
    for (var i = 0 ; i < puzzle.categories.length ; i ++) {
        //alert(i);
        //alert($.inArray(i, highlighted_categories));
        if ($.inArray(i, highlighted_categories) != -1) {
            //alert(i);
            continue;
        }
        ctx.strokeStyle = highlighted_categories.length == 0 ? COLORS[i] : UNHIGHLIGHTED_COLORS[i];
        for (var j = 0 ; j < puzzle.categories[i].links.length ; j ++) {
            ctx.beginPath();
            ctx.moveTo(
                SCALE * (WORD_WIDTH + CATEGORY_WIDTH),
                SCALE * (top_offset + i * (BOX_HEIGHT + VERTICAL_SPACE) + BOX_HEIGHT / 2)
                );
            k = puzzle.categories[i].links[j];
            ctx.lineTo(
                SCALE * left_offset_inp,
                SCALE * (top_offset_inp + k * (INPBOX_WIDTH + BORDER_WIDTH) + INPBOX_WIDTH / 2)
                );
            ctx.stroke();
        }
    }

    // Draw lines for highlighted categories
    ctx.lineWidth = 12;
    for (var i = 0 ; i < highlighted_categories.length ; i ++) {
        var category = highlighted_categories[i];
        if (category == -1) {
            continue;
        }
        ctx.strokeStyle = COLORS[category];
        for (var j = 0 ; j < puzzle.categories[category].links.length ; j ++) {
            ctx.beginPath();
            ctx.moveTo(
                SCALE * (WORD_WIDTH + CATEGORY_WIDTH),
                SCALE * (top_offset + category * (BOX_HEIGHT + VERTICAL_SPACE) + BOX_HEIGHT / 2)
                );
            k = puzzle.categories[category].links[j];
            ctx.lineTo(
                SCALE * left_offset_inp,
                SCALE * (top_offset_inp + k * (INPBOX_WIDTH + BORDER_WIDTH) + INPBOX_WIDTH / 2)
                );
            ctx.stroke();
        }
    }
}

function highlight_category(puzzle, category_ind) {
    for (var i = 0 ; i < puzzle.categories[category_ind].links.length ; i ++) {
        $('#input-' + puzzle.categories[category_ind].links[i]).addClass('empt-box-h');
        $('#word-' + category_ind + '-' + i).addClass('char-box-h');
    }
    clear_canvas();
    draw_canvas(puzzle, [Number(highlighted_category), Number(category_ind)]);
}

function unhighlight_category(puzzle, category_ind) {
    for (var i = 0 ; i < puzzle.categories[category_ind].links.length ; i ++) {
        $('#input-' + puzzle.categories[category_ind].links[i]).removeClass('empt-box-h');
        $('#word-' + category_ind + '-' + i).removeClass('char-box-h');
    }
    if (category_ind == highlighted_category || highlighted_category == -1) {
        clear_canvas();
        draw_canvas(puzzle, []);
    } else {
        clear_canvas();
        draw_canvas(puzzle, [highlighted_category]);
    }
}

function box_intersection(word_ind, input_ind) {
    var input_offset = top_offset_inp + input_ind * (INPBOX_WIDTH + BORDER_WIDTH);
    var word_offset = top_offset + word_ind * (BOX_HEIGHT + VERTICAL_SPACE);
    return Math.min(input_offset + INPBOX_WIDTH, word_offset + BOX_HEIGHT) - Math.max(input_offset, word_offset);
}