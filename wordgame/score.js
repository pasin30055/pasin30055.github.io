function compute_score(puzzle) {
	if (solution) {
		return 0;
	}
	update_word_interface(puzzle);
	var current_score = parseInt($('#score').attr("score"));
	var total_score = parseInt(getCookie("total_score"));
	total_score -= current_score;
	var score = 0;
	var full_score = 0;
	for (var i = 0 ; i < puzzle.categories.length ; i ++) {
		var category = puzzle.categories[i];
		var s = "";
		for (var j = 0 ; j < category.links.length ; j ++) {
			var c = $('#input-' + category.links[j]).val();
			if (c) {
				s += c;
			} else {
				s += " ";
			}
		}
		var nearest = nearest_word(s, category.category);
		var left_word = "";
		for (var j = 0 ; j  < category.links.length ; j ++) {
			var c = $('#word-' + i + '-' + j).val();
			if (c) {
				left_word += c;
			} else {
				left_word += " ";
			}
		}
		if (nearest.word == left_word) {
			score += nearest.score;
		}
		full_score += category.links.length
	}
	total_score += score;
	setCookie("total_score", total_score, 365);
	$('#total_score').html("Total Score: " + total_score);
	if (score == full_score) {
		$( "#dialog-message" ).dialog({
	      modal: true,
	      buttons: {
	        Ok: function() {
	          	$(this).dialog("close");
	          	$('#score').attr("score", 0);
				$('#score').html("Score: " + score + "/" + full_score);
				clear_puzzle();
				load_puzzle();
	        }
	      }
	    });
	} else {
		$('#score').attr("score", score);
		$('#score').html("Score: " + score + "/" + full_score);
	}
}

function nearest_word(s, category) {
	var best_score = -1;
	var best_word = "";
	for (var i = 0 ; i < dict[category].length ; i ++) {
		if (score(s, dict[category][i]) > best_score) {
			best_score = score(s, dict[category][i]);
			best_word = dict[category][i];
		}
	}
	return {
		"score": best_score,
		"word": best_word,
	};
}

function score(s1, s2) {
	if (s1.length != s2.length) return -1;
	var score = 0;
	for (var i = 0 ; i < s1.length ; i ++) {
		if (s1[i] == s2[i]) score ++;
	}
	return score;
}

function update_word(input_word, nearest_word, ind) {
	for (var i = 0 ; i < nearest_word.length ; i ++) {
		$('#word-' + ind + '-' + i).val(nearest_word[i]);
		if (input_word[i] != nearest_word[i]) {
			$('#word-' + ind + '-' + i).addClass('char-box-wrong');
		} else {
			$('#word-' + ind + '-' + i).removeClass('char-box-wrong')
		}
	}
}

function update_word_interface(puzzle) {
	for (var i = 0 ; i < puzzle.categories.length ; i ++) {
		var s = '';
		for (var j = 0 ; j < puzzle.categories[i].links.length ; j ++) {
			var c = $('#word-' + i + '-' + j).val();
			if (c) {
				s += c;
			} else {
				s += " ";
			}
			if ($('#word-' + i + '-' + j).val() == $('#input-' + puzzle.categories[i].links[j]).val()) {
				$('#word-' + i + '-' + j).removeClass('char-box-wrong');
			} else {
				$('#word-' + i + '-' + j).addClass('char-box-wrong');
			}
		}
		if ($.inArray(s, dict[puzzle.categories[i].category]) != -1) {
			$('#category-' + i).addClass('category-word-correct');
			for (var j = 0 ; j < puzzle.categories[i].links.length ; j ++) {
				$('#word-' + i + '-' + j).addClass('char-box-correct-category');
			}
		} else {
			$('#category-' + i).removeClass('category-word-correct');
			for (var j = 0 ; j < puzzle.categories[i].links.length ; j ++) {
				$('#word-' + i + '-' + j).removeClass('char-box-correct-category');
			}
		}
	}
}