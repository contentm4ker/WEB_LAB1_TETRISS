const canvas = document.getElementById('tetris');
var ctx = canvas.getContext('2d');

document.getElementById('player').innerText = 'Player: ' + localStorage["tetris.username"];


function arenaSweep() {
    var rowCount = 1;
    outer: for (var y = arena.length - 1; y > 0; y--) {
        for (var x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        playCompSound();
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function isBorder(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (var y = 0; y < m.length; y++) {
        for (var x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    level: 1,
    deltasc: 50,
    dropInterval: 1000,
}

const colors = [
    'red',
    'blue',
    'violet',
    'green',
    'purple',
    'orange',
    'pink'
];


const SQ = 20;
function drawMatrix(matrix, offset, ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value - 1];
                ctx.strokeStyle = 'black';
                ctx.strokeRect(SQ*(x + offset.x), SQ*(y + offset.y), SQ, SQ);
                ctx.fillRect(SQ*(x + offset.x), SQ*(y + offset.y), SQ, SQ);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2]
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0}, ctx);
    drawMatrix(player.matrix, player.pos, ctx);
}

const pieces = 'ILJOTSZ';
var tmpTime = player.dropInterval;
var next_matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
function playerReset() {
    player.dropInterval = tmpTime;
    player.matrix = next_matrix;
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                    (player.matrix[0].length / 2 | 0);
    if (player.score > player.deltasc) {
        increaseLevel();
        updateLevel();
    }
    if (isBorder(arena, player)) {
        localStorage["tetris.username"] = document.getElementById('player')
                                        .innerHTML.split(' ')[1];
        isContinue = false;
        arena.forEach(row => row.fill(0));
        document.getElementById('tetris').hidden = true;
        document.getElementById('nextf').hidden = true;
        document.getElementById('nextfsign').hidden = true;
        document.getElementById('startbutton').hidden = false;
        document.getElementById('img1').hidden = false;


        var playerName = localStorage['tetris.username'];
        if (localStorage.getItem(playerName) === null) {
            storeScores();
        } else if (Number(localStorage[playerName]) < player.score) {
            storeScores();
        }
        createScoreTable();
    }

    var fig_ind = pieces[pieces.length * Math.random() | 0];
    next_matrix = createPiece(fig_ind);
    updateNextFigureArea(next_matrix, fig_ind);
}

function lvlReset() {
    player.score = 0;
    player.level = 1;
    player.deltasc = 50;
    player.dropInterval = 1000;
    tmpTime = player.dropInterval;
}

function increaseLevel() {
    player.level++;
    player.deltasc += 50;
    player.dropInterval -= 99;
}

function playerMove(direction) {
    player.pos.x += direction;
    if (isBorder(arena, player)) {
        player.pos.x -= direction;
    }
}

function playerRotate(direction) {
    rotateMatrix(player.matrix, direction);

    if (isBorder(arena, player)) {
        rotateMatrix(player.matrix, -direction);
    }

}

function playerDrop() {
    player.pos.y++;
    if (isBorder(arena, player)) {
        player.pos.y--; //player backup
        merge(arena, player);
        playerReset();
        arenaSweep();
        playDropSound();
        updateScore();
    }
    dropCounter = 0;
}

function rotateMatrix(matrix, direction) {
    for (var y = 0; y < matrix.length; y++) {
        for (var x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] =
                [matrix[y][x], matrix[x][y]];
        }
    }

    if (direction > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

var dropCounter = 0;
var lastTime = 0;
var isContinue = true;
function update(time = 0) {
    if (isContinue) {
        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > player.dropInterval) {
            playerDrop();
        }

        draw();
        requestAnimationFrame(update);
    }
}

function updateScore() {
    document.getElementById('score').innerText = 'Количество очков: ' + player.score;
}

function updateLevel() {
    document.getElementById('level').innerText = 'Текущий уровень: ' + player.level;
}

function updateNextFigureArea(figure, fig_ind) {
    const canvas = document.getElementById('nextf');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (fig_ind === 'O') {
        drawMatrix(figure, {x: 4.5, y: 2}, ctx);
    } else if (fig_ind === 'L' || fig_ind === 'J') {
        drawMatrix(figure, {x: 4, y: 1.5}, ctx);
    } else if (fig_ind === 'Z' || fig_ind === 'S') {
        drawMatrix(figure, {x: 4, y: 2}, ctx);
    } else {
        drawMatrix(figure, {x: 4, y: 1}, ctx);
    }
    ctx.strokeStyle = 'black';
    ctx.strokeRect(SQ*3, 0, SQ*5, SQ*6);
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 65) {
        playerMove(-1);
    } else if (event.keyCode === 68) {
        playerMove(1);
    } else if (event.keyCode === 83) {
        playerDrop(); //w/o another drop down
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 69) {
        playerRotate(1);
    } else if (event.keyCode === 32) {
        tmpTime = player.dropInterval;
        player.dropInterval = 10;
    }
    
})

function runTetris() {
    document.getElementById('score').hidden = false;
    document.getElementById('level').hidden = false;
    document.getElementById('nextf').hidden = false;
    document.getElementById('nextfsign').hidden = false;
    document.getElementById('tetris').hidden = false;
    document.getElementById('player').hidden = false;
    document.getElementById('startbutton').hidden = true;
    document.getElementById('img1').hidden = true;
    isContinue = true;
    lvlReset();
    playerReset();
    updateScore();
    updateLevel();
    update();
}

//saving players and their best scores in localStorage
function storeScores() {
    localStorage[localStorage['tetris.username']] = player.score;
}

function createScoreTable() {
    document.getElementById('scoretable').innerText = '';
    var playersAndScores = [];
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i) !== 'tetris.username') {
            var tmp = {};
            tmp['name'] = localStorage.key(i);
            tmp['score'] = Number(localStorage.getItem(localStorage.key(i)));
            playersAndScores.push(tmp)
        }
    }

    playersAndScores.sort(function(a, b) {
        return b.score - a.score;
    });
    playersAndScores.unshift(null);

    var newTable = document.createElement('table');
    var newTitle = newTable.insertRow(0);
    newTitle.insertCell(0).innerHTML = 'Игрок';
    newTitle.insertCell(1).innerHTML = 'Количество очков';


    for (var y = 1; y < localStorage.length; y++) {
        var newRow = newTable.insertRow(y);
        for (var x = 0; x < 2 ; x++) {
            var newCell = newRow.insertCell(x);

            if (x === 0) {
                newCell.innerHTML = playersAndScores[y].name;
            } else {
                newCell.innerHTML = playersAndScores[y].score;
            }
        }
    }
    document.getElementById('scoretable').appendChild(newTable);
}

function playDropSound() {
    document.getElementById("dropaudio").play();
}

function playCompSound() {
    document.getElementById("dropaudio").pause();
    document.getElementById("complaudio").play();
}

createScoreTable();
