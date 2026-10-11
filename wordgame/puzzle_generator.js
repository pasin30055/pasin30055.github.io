function generate_puzzle_hardcoded() {
	return puzzles[Math.floor(Math.random() * puzzles.length)];
}

function rand_char() {
	var r = Math.random();
	var last_key = "Z";
	for (var key in freq) {
		last_key = key;
		if (r < freq[key]) {
			return key;
		}
		r -= freq[key];
	}
	return last_key;
}

function rand_puzzle_word(len) {
	var word = "";
	var counts = {};
	var num_pairs = 0;
	for (var i = 0 ; i < len ; i ++) {
		var ch = rand_char();
		var attempts = 0;
		while (attempts < 50) {
			var c = counts[ch] || 0;
			var adj = (i > 0 && word[i - 1] === ch);
			if (!adj && c < 2 && (c === 0 || num_pairs < 2)) {
				break;
			}
			ch = rand_char();
			attempts ++;
		}
		if ((counts[ch] || 0) === 1) {
			num_pairs ++;
		}
		counts[ch] = (counts[ch] || 0) + 1;
		word += ch;
	}
	return word;
}

function is_valid_puzzle_count(count) {
	var cnt_one = 0;
	for (var i = 0 ; i < count.length ; i ++) {
		if (count[i] == 1) {
			cnt_one ++;
		} else if (count[i] > 5 || count[i] == 0) {
			return false;
		}
	}

	return (cnt_one < 4);
}

var GENERIC_CATEGORIES = {
	"noun": 2,
	"verb": 2,
	"adjective": 1,
	"adverb": 1,
	"pronoun": 1,
	"conjunction": 1,
	"interjection": 1
};

function comp_score(cat_used, category, links, count) {
	var min_c = INF;
	var max_c = -1;
	var sum_c = 0;
	var num_zeros = 0;
	for (var i = 0 ; i < links.length ; i ++) {
		var c = count[links[i]];
		if (c === 0) num_zeros ++;
		if (c < min_c) min_c = c;
		if (c > max_c) max_c = c;
		sum_c += c;
	}
	var avg_c = Math.round((sum_c * 10) / links.length);
	var generic_tier = GENERIC_CATEGORIES[category] || 0;
	var short_penalty = (links.length === 2) ? 1 : 0;
	return 8000000 * cat_used + 50000 * min_c - 5000 * num_zeros + 1000 * generic_tier + 200 * short_penalty + 30 * max_c + avg_c;
}

function collect_word_links(category, word, pos, idx, min_pos, current_links, category_links) {
	if (idx === word.length) {
		category_links.push({
			"category": category,
			"links": current_links.slice(),
			"word": word,
		});
		return;
	}
	var positions = pos[word[idx]];
	for (var i = 0 ; i < positions.length ; i ++) {
		if (positions[i] > min_pos) {
			current_links.push(positions[i]);
			collect_word_links(category, word, pos, idx + 1, positions[i], current_links, category_links);
			current_links.pop();
		}
	}
}

function generate_puzzle(target_len) {
	var len = target_len || Math.floor((Math.random() * 5) + 7);
	var min_cats = (len >= 10) ? 7 : 6;
	var target_cats = (len >= 10) ? (Math.floor(Math.random() * 2) + 7) : ((len === 9) ? (Math.floor(Math.random() * 2) + 7) : (Math.floor(Math.random() * 2) + 6));

	while (true) {
		// Random Puzzle Word on the Right
		var puzzle_word = rand_puzzle_word(len);
		var pos = {};
		for (var i = 0 ; i < UPPERCASE.length ; i ++) {
			pos[UPPERCASE[i]] = [];
		}
		for (var i = 0 ; i < len ; i ++) {
			pos[puzzle_word[i]].push(i);
		}

		// Pick Words on the Left
		var category_links = [];

		for (var category in dict) {
			for (var i = 0 ; i < dict[category].length ; i ++) {
				var word = dict[category][i];
				if (word.length < 2 || word.length > 4) continue;
				var possible = true;
				for (var c = 0 ; c < word.length ; c ++) {
					if (!pos[word[c]] || pos[word[c]].length == 0) {
						possible = false;
						break;
					}
				}
				if (!possible) continue;
				collect_word_links(category, word, pos, 0, -1, [], category_links);
			}
		}

		if (category_links.length < target_cats) {
			continue;
		}

		shuffle(category_links);

		var count = Array(len);
		for (var i = 0 ; i < len ; i ++) {
			count[i] = 0;
		}

		var puzzle = {
			"ans": puzzle_word,
			"categories": [],
		};

		var used_words = [], used_cat = {}, num_two_letter = 0;
		while ((!is_valid_puzzle_count(count) || used_words.length < target_cats) && used_words.length < COLORS.length) {
			var score = INF;
			var ind = -1;

			for (var i = 0 ; i < category_links.length ; i ++) {
				if (used_words.indexOf(category_links[i].word) !== -1) continue;
				if (category_links[i].category in used_cat && used_cat[category_links[i].category] > CATEGORY_LIMIT - 1) continue;
				if (category_links[i].word.length == 2 && num_two_letter >= 1) continue;

				var exceeds_limit = false;
				for (var m = 0 ; m < category_links[i].links.length ; m ++) {
					if (count[category_links[i].links[m]] >= 5) {
						exceeds_limit = true;
						break;
					}
				}
				if (exceeds_limit) continue;

				var curr_score = comp_score(
					category_links[i].category in used_cat ? used_cat[category_links[i].category] : 0,
					category_links[i].category,
					category_links[i].links,
					count
				);

				if (curr_score < score) {
					score = curr_score;
					ind = i;
				}
			}

			if (score == INF || ind == -1) {
				break;
			}

			puzzle.categories.push({
				"category": category_links[ind].category,
				"links": category_links[ind].links,
			});
			for (var m = 0 ; m < category_links[ind].links.length ; m ++) {
				count[category_links[ind].links[m]] ++;
			}
			if (category_links[ind].word.length == 2) {
				num_two_letter ++;
			}
			used_words.push(category_links[ind].word);
			if (category_links[ind].category in used_cat) {
				used_cat[category_links[ind].category] ++;
			} else {
				used_cat[category_links[ind].category] = 1;
			}
		}

		// Check Validity of the Instance
		if (is_valid_puzzle_count(count) && used_words.length >= min_cats && used_words.length <= COLORS.length) {
			shuffle(puzzle.categories);
			return puzzle;
		}
	}
}