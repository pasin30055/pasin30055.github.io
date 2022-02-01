$(document).ready(function() {
	load_puzzle();
});

function load_puzzle() {
	puzzle = generate_puzzle_hardcoded();

	if (puzzle.categories.length < 8) {
		VERTICAL_SPACE = VERTICAL_SPACE_DEFAULT;
	} else {
		VERTICAL_SPACE = VERTICAL_SPACE_DEFAULT / 2;
	}

	top_offset = (CANVAS_HEIGHT - puzzle.categories.length * BOX_HEIGHT
		- (puzzle.categories.length - 1) * VERTICAL_SPACE) / 2;

	for (var i = 0 ; i < puzzle.categories.length ; i ++) {
		num_box = puzzle.categories[i].links.length;
		left_offset = WORD_WIDTH - num_box * BOX_WIDTH;
		// Generate Boxes
		for (var j = 0 ; j < num_box ; j ++) {
			$('#mycontainer').append(
				'<input type="text" class="char-box" maxlength=1 id="word-'
				+ i + '-' + j
				+ '" category_ind=' + i + ' box_ind=' + j
				+ ' style="position:absolute;top:'
				+ (top_offset + i * (BOX_HEIGHT + VERTICAL_SPACE))
				+ 'px;left:'
				+ (left_offset + j * (BOX_WIDTH + BORDER_WIDTH))
				+ 'px">'
				+ '</input>'
			);

			// Register handler
			$('#word-' + i + '-' + j).keyup(function(){
				$(this).val($(this).val().toUpperCase());
				compute_score(puzzle);
			});

			$('#word-' + i + '-' + j).keydown(function(eventObj){
				var category_ind = parseInt($(this).attr('category_ind'));
				var box_ind = parseInt($(this).attr('box_ind'));
				switch (eventObj.which) {
					case RIGHT_KEY:
						if (box_ind + 1 < puzzle.categories[category_ind].links.length) {
							$('#word-' + category_ind + '-' + (box_ind + 1)).focus();
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
							$('#input-' + best_ind).focus();
						}
						break;

					case DOWN_KEY:
						if (category_ind < puzzle.categories.length) {
							$('#word-' + (category_ind + 1) + '-' + box_ind).focus();
						}
						break;

					case LEFT_KEY:
						if (box_ind > 0) {
							$('#word-' + category_ind + '-' + (box_ind - 1)).focus();
						}
						break;

					case UP_KEY:
						if (category_ind > 0) {
							$('#word-' + (category_ind - 1) + '-' + box_ind).focus();
						}
						break;
				}
			});
		}
		
		// Generate Categories
		left_offset = WORD_WIDTH + CATEGORY_WIDTH - CATEGORY_WORD_WIDTH - EPSILON;
		$('#mycontainer').append(
			'<div class="category-word" id="category-'
			+ i
			+ '" ind='
			+ i
			+ ' style="position:absolute;top:'
			+ (top_offset + i * (BOX_HEIGHT + VERTICAL_SPACE))
			+ 'px;left:'
			+ left_offset
			+ 'px">'
			+ puzzle.categories[i].category
			+ '</div>'
			);

		// When hovered on, highlight the input boxes and word boxes.
		$('#category-' + i).hover(function(eventObj) {
			// highlight
			var ind = $('#' + eventObj.target.id).attr("ind");
			highlight_category(puzzle, ind);
		}, function(eventObj) {
			var ind = $('#' + eventObj.target.id).attr("ind");
			// unhighlight
			unhighlight_category(puzzle, ind);

			if (highlighted_category != -1) {
				// highlight back the clicked category
				highlight_category(puzzle, highlighted_category);
			}
		});

		// When clicked, highlight/unhighlight the the input boxes and word boxes.
		$('#category-' + i).click(function(eventObj) {
			if (highlighted_category != -1) {
				// unhilight the hilighted category.
				unhighlight_category(puzzle, highlighted_category);
			}

			var ind = $('#' + eventObj.target.id).attr("ind");
			if (highlighted_category != ind) {
				// only highlight if targeted category was not highlighted before.
				highlight_category(puzzle, ind);
				highlighted_category = ind;
			} else {
				highlighted_category = -1;
			}
		});

		// When double-clicked, fill in the word based on input on right hand side.
		$('#category-' + i).dblclick(function(eventObj) {
			var ind = $('#' + eventObj.target.id).attr("ind");
			for (var i = 0 ; i < puzzle.categories[ind].links.length ; i ++) {
				$('#word-' + ind + '-' + i).val($('#input-' + puzzle.categories[ind].links[i]).val());
    		}
    		compute_score(puzzle);
		});
	}

	// Generate Empty Text Inputs
	left_offset_inp = CANVAS_WIDTH - RIGHT_SPACE - INPBOX_WIDTH;
	top_offset_inp = (CANVAS_HEIGHT - puzzle.ans.length * INPBOX_WIDTH
		- (puzzle.ans.length + 1) * BORDER_WIDTH) / 2;
	for (var i = 0 ; i < puzzle.ans.length ; i ++) {
		$('#mycontainer').append(
		'<input type="text" class="empt-box" maxlength=1 id="input-'
		+ i
		+ '" ind='
		+ i
		+ ' style="position:absolute;top:'
		+ (top_offset_inp + i * (INPBOX_WIDTH + BORDER_WIDTH))
		+ 'px;left:'
		+ left_offset_inp
		+ 'px">'
		+ '</input>'
		);
		
		// Register handler
		$('#input-' + i).keyup(function(){
			$(this).val($(this).val().toUpperCase());
			compute_score(puzzle);
		});

		$('#input-' + i).keydown(function(eventObj){
			var ind = parseInt($(this).attr('ind'));
			switch (eventObj.which) {
				case DOWN_KEY:
					if (ind + 1 < puzzle.ans.length) {
						$('#input-' + (ind + 1)).focus();
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
					$('#word-' + best_ind + '-' + (puzzle.categories[best_ind].links.length - 1)).focus();
					break;

				case UP_KEY:
					if (ind > 0) {
						$('#input-' + (ind - 1)).focus();
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
	$('#clear-button').click(function() {
		$('.empt-box').val("");
		$('.empt-box-h').val("");
		compute_score(puzzle);
	});
	$('#new-button').click(function() {
		$('#solution-button').show();
		$('#clear-button').show();
		clear_puzzle();
		load_puzzle();
	});
	$('#solution-button').click(function() {
		solution = true;
		$('#solution-button').hide();
		$('#clear-button').hide();
		for (var i = 0 ; i < puzzle.ans.length ; i ++) {
			$('#input-' + i).val(puzzle.ans[i]);
			$('#input-' + i).attr('readonly', true);
		}
		for (var i = 0 ; i < puzzle.categories.length ; i ++) {
			for (var j = 0 ; j < puzzle.categories[i].links.length ; j ++) {
				$('#word-' + i + '-' + j).val(puzzle.ans[puzzle.categories[i].links[j]]);
				$('#word-' + i + '-' + j).attr('readonly', true);
			}
		}
		// update_word_interface(puzzle);
	});
}
