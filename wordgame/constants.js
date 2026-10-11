BOX_WIDTH = 50;
BOX_HEIGHT = 50;
CANVAS_WIDTH = 900;
CANVAS_HEIGHT = 600;
WORD_WIDTH = 230;
CATEGORY_WIDTH = 265;
RIGHT_SPACE = (CANVAS_WIDTH - WORD_WIDTH - CATEGORY_WIDTH) * 0.2;
CATEGORY_WORD_WIDTH = 220;
EPSILON = 10;
VERTICAL_SPACE_DEFAULT = BOX_HEIGHT * 2 / 3;
VERTICAL_SPACE = VERTICAL_SPACE_DEFAULT;
BORDER_WIDTH = 3;
INPBOX_WIDTH_DEFAULT = 60;
INPBOX_WIDTH = INPBOX_WIDTH_DEFAULT;
SCALE = 2;
LOWERCASE = [
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
	'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
	'u', 'v', 'w', 'x', 'y', 'z'
	];
UPPERCASE = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
	'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
	'U', 'V', 'W', 'X', 'Y', 'Z'
	];
INF = 1000000000;
LEFT_KEY = 37;
UP_KEY = 38;
RIGHT_KEY = 39;
DOWN_KEY = 40;
COLORS = ["#FF0000", "#33CC33", "#0066CC", "#9900CC", "#669999", "#666666", "#FFFF00", "#990033"];
HIGHLIGHTED_COLORS = ["#E60000", "#2EB82E", "#005CB8", "#8A00B8", "#5C8A8A", "#4C4C4C", "#E6E600", "#8A002E"];
// UNHIGHLIGHTED_COLORS = ["#FF9999", "#85E085", "#80B2E6", "#CC80E6", "#B2CCCC", "#E6E6E6", "#FFFF80", "#CC8099"];
// UNHIGHLIGHTED_COLORS = ["#FFB2B2", "#99E699", "#99C2EB", "#D699EB", "#C2D6D6", "#D1D1D1", "#FFFF99", "#D699AD"];
UNHIGHLIGHTED_COLORS = ["#FF9494", "#B8EEB8", "#B8D4F1", "#E2B8F1", "#BED0D0", "#C9C9C9", "#FFFFB8", "#E2B8C6"];
BOX_BACKGROUND_COLOR = "#EEEEEE";
CATEGORY_LIMIT = 1;
INTRO_STEP_TWO = '"Each box on the left should be filled with a character so that the formed word corresponds to the category indicated in the middle."';
INTRO_STEP_THREE = '"When the word formed on the left indeed belongs to the category, the category\'s color will become green."';
INTRO_STEP_FOUR = '"Each box on the right should be filled with a character that matches with the corresponding box on the left."';
INTRO_STEP_FIVE = '"When the corresponding box on the right is filled with the same character as that on the left, the character on the left will turn green."';
INTRO_STEP_SEVEN = '"Additional Tip: Click on a category to highlight corresponding boxes on the left and right."';
INTRO_STEP_EIGHT = '"Additional Tip: Double-click on a category to auto-fill boxes on the left according to filled boxes on the right."';
INTRO_STEP_NINE = '"The list of valid words in each category can be found here."';
INTRO_STEP_TEN = '"We would love to hear how you think about the game. If you have any comments, please let us know."';
var solution = false;
var puzzle;
var highlighted_category = -1;