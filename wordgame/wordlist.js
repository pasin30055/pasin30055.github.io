$(function() {
	var table = document.getElementById('wordlisttable');
	if (!table) return;
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
});
