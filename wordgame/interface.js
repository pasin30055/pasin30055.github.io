var tour_timeouts = [];

function clear_tour_timeouts() {
	while (tour_timeouts.length > 0) {
		clearTimeout(tour_timeouts.pop());
	}
}

function add_tour_timeout(fn, delay) {
	var id = setTimeout(fn, delay);
	tour_timeouts.push(id);
	return id;
}

function strip_quotes(str) {
	return String(str).replace(/^"|"$/g, '');
}

$(function() {
	var table = document.getElementById('wordlisttable');
	if (table) {
		var tbody = document.createElement('tbody');
		for (var category in dict) {
			if (!Object.prototype.hasOwnProperty.call(dict, category)) continue;
			var words = dict[category].join(', ');
			var tr = document.createElement('tr');
			var tdCat = document.createElement('td');
			tdCat.textContent = category;
			var tdWords = document.createElement('td');
			tdWords.textContent = words;
			tr.appendChild(tdCat);
			tr.appendChild(tdWords);
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
	}

	$('#tablecontainer').hide();
	$('#contacttextcontainer').hide();
	$('#abouttextcontainer').hide();

	load_puzzle();

	$('#main-button').on('click', function(e) {
		e.preventDefault();
		hide_all();
		$('#mycontainer').show();
		$('#bottomdiv').show();
		$('#main-button').addClass('active');
	});

	$('#wordlist-button').on('click', function(e) {
		e.preventDefault();
		hide_all();
		$('#tablecontainer').show();
		$('#wordlist-button').addClass('active');
	});

	$('#contact-button').on('click', function(e) {
		e.preventDefault();
		hide_all();
		$('#contacttextcontainer').show();
		$('#contact-button').addClass('active');
	});

	$('#about-button').on('click', function(e) {
		e.preventDefault();
		hide_all();
		$('#abouttextcontainer').show();
		$('#about-button').addClass('active');
	});

	$('#howto-button').on('click', function(e) {
		e.preventDefault();
		hide_all();
		$('#mycontainer').show();
		$('#bottomdiv').show();
		$('#main-button').addClass('active');
		show_tour();
	});
});

function show_tour() {
	clear_puzzle();
	var introjs = load_puzzle(true);
	introjs.start();
}

function load_puzzle(skipAutoIntro) {
	// puzzle = generate_puzzle_hardcoded();
	puzzle = generate_puzzle();

	if (puzzle.categories.length < 8) {
		VERTICAL_SPACE = VERTICAL_SPACE_DEFAULT;
	} else {
		VERTICAL_SPACE = VERTICAL_SPACE_DEFAULT / 2;
	}

	top_offset = (CANVAS_HEIGHT - puzzle.categories.length * BOX_HEIGHT
		- (puzzle.categories.length - 1) * VERTICAL_SPACE) / 2;

	var container = document.getElementById('mycontainer');

	for (var i = 0 ; i < puzzle.categories.length ; i ++) {
		num_box = puzzle.categories[i].links.length;
		left_offset = WORD_WIDTH - num_box * (BOX_WIDTH + BORDER_WIDTH);
		// Generate Boxes
		for (var j = 0 ; j < num_box ; j ++) {
			var wordInput = document.createElement('input');
			wordInput.type = 'text';
			wordInput.className = 'char-box';
			wordInput.maxLength = 1;
			wordInput.id = 'word-' + i + '-' + j;
			wordInput.setAttribute('category_ind', String(i));
			wordInput.setAttribute('box_ind', String(j));
			wordInput.style.position = 'absolute';
			wordInput.style.top = (top_offset + i * (BOX_HEIGHT + VERTICAL_SPACE)) + 'px';
			wordInput.style.left = (left_offset + j * (BOX_WIDTH + BORDER_WIDTH)) + 'px';

			if (i == 0 && j == 0) {
				wordInput.setAttribute('data-step', '2');
				wordInput.setAttribute('data-intro', strip_quotes(INTRO_STEP_TWO));
			} else if (i == 0 && j == 1) {
				wordInput.setAttribute('data-step', '5');
				wordInput.setAttribute('data-intro', strip_quotes(INTRO_STEP_FIVE));
			}

			container.appendChild(wordInput);

			// Register handler
			$('#word-' + i + '-' + j).on('keyup input', function() {
				$(this).val($(this).val().toUpperCase());
				compute_score(puzzle);
			});

			$('#word-' + i + '-' + j).on('keydown', function(eventObj) {
				var category_ind = parseInt($(this).attr('category_ind'), 10);
				var box_ind = parseInt($(this).attr('box_ind'), 10);
				var keyCode = eventObj.which || eventObj.keyCode;
				switch (keyCode) {
					case RIGHT_KEY:
						if (box_ind + 1 < puzzle.categories[category_ind].links.length) {
							$('#word-' + category_ind + '-' + (box_ind + 1)).trigger('focus');
						} else {
							var best_ind = 0;
							var max_intersection = -1;
							for (var input_ind = 0 ; input_ind < puzzle.ans.length ; input_ind ++) {
								var intersection = box_intersection(category_ind, input_ind);
								if (intersection > max_intersection) {
									max_intersection = intersection;
									best_ind = input_ind;
								}
							}
							$('#input-' + best_ind).trigger('focus');
						}
						break;

					case DOWN_KEY:
						if (category_ind + 1 < puzzle.categories.length) {
							var curr_len = puzzle.categories[category_ind].links.length;
							var next_len = puzzle.categories[category_ind + 1].links.length;
							var next_box = Math.max(0, Math.min(next_len - 1, box_ind + (next_len - curr_len)));
							$('#word-' + (category_ind + 1) + '-' + next_box).trigger('focus');
						}
						break;

					case LEFT_KEY:
						if (box_ind > 0) {
							$('#word-' + category_ind + '-' + (box_ind - 1)).trigger('focus');
						}
						break;

					case UP_KEY:
						if (category_ind > 0) {
							var curr_len_up = puzzle.categories[category_ind].links.length;
							var prev_len = puzzle.categories[category_ind - 1].links.length;
							var prev_box = Math.max(0, Math.min(prev_len - 1, box_ind + (prev_len - curr_len_up)));
							$('#word-' + (category_ind - 1) + '-' + prev_box).trigger('focus');
						}
						break;
				}
			});
		}
		
		// Generate Categories
		left_offset = WORD_WIDTH + CATEGORY_WIDTH - CATEGORY_WORD_WIDTH - EPSILON;
		var catDiv = document.createElement('div');
		catDiv.className = 'category-word';
		catDiv.id = 'category-' + i;
		catDiv.setAttribute('ind', String(i));
		catDiv.style.position = 'absolute';
		catDiv.style.top = (top_offset + i * (BOX_HEIGHT + VERTICAL_SPACE)) + 'px';
		catDiv.style.left = left_offset + 'px';
		catDiv.textContent = puzzle.categories[i].category;

		if (i == 0) {
			catDiv.setAttribute('data-step', '3');
			catDiv.setAttribute('data-intro', strip_quotes(INTRO_STEP_THREE));
		} else if (i == 1) {
			catDiv.setAttribute('data-step', '7');
			catDiv.setAttribute('data-intro', strip_quotes(INTRO_STEP_SEVEN));
		} else if (i == 2) {
			catDiv.setAttribute('data-step', '8');
			catDiv.setAttribute('data-intro', strip_quotes(INTRO_STEP_EIGHT));
		}

		container.appendChild(catDiv);

		// When hovered on, highlight the input boxes and word boxes.
		$('#category-' + i).on('mouseenter', function() {
			var ind = parseInt($(this).attr("ind"), 10);
			highlight_category(puzzle, ind);
		}).on('mouseleave', function() {
			var ind = parseInt($(this).attr("ind"), 10);
			unhighlight_category(puzzle, ind);

			if (highlighted_category != -1) {
				// highlight back the clicked category
				highlight_category(puzzle, highlighted_category);
			}
		});

		// When clicked, highlight/unhighlight the input boxes and word boxes.
		$('#category-' + i).on('click', function() {
			if (highlighted_category != -1) {
				// unhighlight the highlighted category.
				unhighlight_category(puzzle, highlighted_category);
			}

			var ind = parseInt($(this).attr("ind"), 10);
			if (highlighted_category != ind) {
				// only highlight if targeted category was not highlighted before.
				highlight_category(puzzle, ind);
				highlighted_category = ind;
			} else {
				highlighted_category = -1;
			}
		});

		// When double-clicked, fill in the word based on input on right hand side.
		$('#category-' + i).on('dblclick', function() {
			var ind = parseInt($(this).attr("ind"), 10);
			for (var k = 0 ; k < puzzle.categories[ind].links.length ; k ++) {
				$('#word-' + ind + '-' + k).val($('#input-' + puzzle.categories[ind].links[k]).val());
			}
			compute_score(puzzle);
		});
	}

	// Generate Empty Text Inputs
	if (puzzle.ans.length <= 9) {
		INPBOX_WIDTH = INPBOX_WIDTH_DEFAULT;
	} else if (puzzle.ans.length == 10) {
		INPBOX_WIDTH = 52;
	} else {
		INPBOX_WIDTH = 47;
	}
	left_offset_inp = CANVAS_WIDTH - RIGHT_SPACE - INPBOX_WIDTH;
	top_offset_inp = (CANVAS_HEIGHT - puzzle.ans.length * INPBOX_WIDTH
		- (puzzle.ans.length + 1) * BORDER_WIDTH) / 2;
	for (var i = 0 ; i < puzzle.ans.length ; i ++) {
		var inpBox = document.createElement('input');
		inpBox.type = 'text';
		inpBox.className = 'empt-box';
		inpBox.maxLength = 1;
		inpBox.id = 'input-' + i;
		inpBox.setAttribute('ind', String(i));
		inpBox.style.position = 'absolute';
		inpBox.style.width = INPBOX_WIDTH + 'px';
		inpBox.style.height = INPBOX_WIDTH + 'px';
		inpBox.style.top = (top_offset_inp + i * (INPBOX_WIDTH + BORDER_WIDTH)) + 'px';
		inpBox.style.left = left_offset_inp + 'px';

		if (i == puzzle.categories[0].links[0]) {
			inpBox.setAttribute('data-step', '4');
			inpBox.setAttribute('data-intro', strip_quotes(INTRO_STEP_FOUR));
		}

		container.appendChild(inpBox);
		
		// Register handler
		$('#input-' + i).on('keyup input', function() {
			$(this).val($(this).val().toUpperCase());
			compute_score(puzzle);
		});

		$('#input-' + i).on('keydown', function(eventObj) {
			var ind = parseInt($(this).attr('ind'), 10);
			var keyCode = eventObj.which || eventObj.keyCode;
			switch (keyCode) {
				case DOWN_KEY:
					if (ind + 1 < puzzle.ans.length) {
						$('#input-' + (ind + 1)).trigger('focus');
					}
					break;

				case LEFT_KEY:
					var best_ind = 0;
					var max_intersection = -1;
					for (var category_ind = 0 ; category_ind < puzzle.categories.length ; category_ind ++) {
						var intersection = box_intersection(category_ind, ind);
						if (intersection > max_intersection) {
							max_intersection = intersection;
							best_ind = category_ind;
						}
					}
					$('#word-' + best_ind + '-' + (puzzle.categories[best_ind].links.length - 1)).trigger('focus');
					break;

				case UP_KEY:
					if (ind > 0) {
						$('#input-' + (ind - 1)).trigger('focus');
					}
					break;
			}
		});
	}

	// Draw lines
	draw_canvas(puzzle, []);

	// Put in score = 0
	compute_score(puzzle);

	// Initiate Buttons
	$('#clear-button').on('click', function() {
		$('.empt-box').val("");
		$('.empt-box-h').val("");
		$('.char-box').val("");
		$('.char-box-h').val("");
		$('.char-box-wrong').val("");
		$('.char-box-h-wrong').val("");
		compute_score(puzzle);
	});
	$('#new-button').on('click', function() {
		$('#solution-button').show();
		$('#clear-button').show();
		clear_puzzle();
		load_puzzle(true);
	});
	$('#solution-button').on('click', function() {
		solution = true;
		$('#solution-button').hide();
		$('#clear-button').hide();
		for (var i = 0 ; i < puzzle.ans.length ; i ++) {
			$('#input-' + i).val(puzzle.ans[i]);
			$('#input-' + i).prop('readonly', true);
		}
		for (var i = 0 ; i < puzzle.categories.length ; i ++) {
			for (var j = 0 ; j < puzzle.categories[i].links.length ; j ++) {
				$('#word-' + i + '-' + j).val(puzzle.ans[puzzle.categories[i].links[j]]);
				$('#word-' + i + '-' + j).prop('readonly', true);
			}
		}
		update_word_interface(puzzle);
	});

	var introjs = introJs();
	introjs.onchange(function(targetElement) {
		clear_tour_timeouts();
		switch (targetElement.id) { 
			case "header":
				break;
			case "word-0-0": 
				add_tour_timeout(function() {
					$('#word-0-0').val(puzzle.ans[puzzle.categories[0].links[0]]);
					compute_score(puzzle);
				}, 700);
				break;
			case "category-0":
				add_tour_timeout(function() {
					for (var k = 1; k < puzzle.categories[0].links.length; k++) {
						$('#word-0-' + k).val(puzzle.ans[puzzle.categories[0].links[k]]);
					}
					compute_score(puzzle);
				}, 700);
				break;
			case "input-" + puzzle.categories[0].links[0]:
				add_tour_timeout(function() {
					$('#input-' + puzzle.categories[0].links[0]).val(puzzle.ans[puzzle.categories[0].links[0]]);
					compute_score(puzzle);
				}, 700);
				break;
			case "word-0-1": 
				add_tour_timeout(function() {
					$('#input-' + puzzle.categories[0].links[1]).val(puzzle.ans[puzzle.categories[0].links[1]]);
					compute_score(puzzle);
				}, 700);
				break;
			case "category-1":
				add_tour_timeout(function() {
					$('#category-1').trigger('click');
					compute_score(puzzle);
				}, 700);
				break;
			case "category-2":
				if (highlighted_category == 1) {
					$('#category-1').trigger('click');
				}
				add_tour_timeout(function() {
					for (var k = 0; k < puzzle.categories[2].links.length; k++) {
						$('#input-' + puzzle.categories[2].links[k]).val(puzzle.ans[puzzle.categories[2].links[k]]);
					}
					add_tour_timeout(function() {
						$('#category-2').trigger('dblclick');
						compute_score(puzzle);
					}, 500);
				}, 700);
				break;
			default:
				break;
		}
	});

	function finish_tour() {
		clear_tour_timeouts();
		var total = parseInt(getCookie("total_score"), 10) || 0;
		var curr = parseInt($('#score').attr("score"), 10) || 0;
		setCookie("total_score", total - curr, 365);
		clear_puzzle();
		load_puzzle(true);
	}

	introjs.onexit(function() {
		finish_tour();
	});

	introjs.oncomplete(function() {
		finish_tour();
	});

	var intro = parseInt(getCookie("intro"), 10) || 0;
	if (intro == 0 && !skipAutoIntro) {
		setCookie("intro", 1, 365);
		introjs.start();
	}

	return introjs;
}
