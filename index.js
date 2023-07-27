const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

class Player {
    constructor(id) {
        this.id = id;
        this.battleEnemy = '-1';
        this.isActive = true;
        this.battleVictories = 0;
    }

    setMokepon(mokepon) {
        this.mokepon = mokepon;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setAttackSequence(attackSequence) {
        this.attackSequence = attackSequence;
    }
}

class Mokepon {
    constructor(name) {
        this.name = name;
    }
}

const players = [];
let playerTimeouts = {};

/**
 * Creates a new player and joins him to the party.
 * @returns The new player.
 */
function createPlayer() {
    
    let id = `${Math.random()}`;

    while (playerExist(id)) {
        id = `${Math.random()}`;
    }

    const newPlayer = new Player(id);
    players.push(newPlayer);
    return newPlayer;
}

/**
 * Checks if the player exists in the party.
 * @param {String} playerId 
 * @returns Whether the player exists in the party or not.
 */
function playerExist(playerId) {
    return getPlayer(playerId) !== undefined;
}

/**
 * @param {String} playerId 
 * @returns The player if found and undefined otherwise.
 */
function getPlayer(playerId) {
    return players.find(player => player.id === playerId);
}

/**
 * @param {String} playerId 
 * @returns The player index if found and -1 otherwise.
 */
function getPlayerIndex(playerId) {
    return players.findIndex(player => player.id === playerId);
}

app.post('/mokepon/join', (req, res) => {

    const mokeponName = req.body.mokepon || '';
    const x = req.body.x || 0;
    const y = req.body.y || 0;

    if (mokeponName === '') {
        res.end();
    }

    const player = createPlayer();
    player.setMokepon(new Mokepon(mokeponName));
    player.updatePosition(x, y);
    
    res.send(player.id);
})



app.post('/mokepon/:playerId/position', (req, res) => {

    const playerId = req.params.playerId || '';
    const x = req.body.x || 0;
    const y = req.body.y || 0;

    const playerIndex = getPlayerIndex(playerId);

    if (playerIndex >= 0) {
        players[playerIndex].updatePosition(x, y);
    }

    const enemyPlayersData = players.filter(player => player.id !== playerId && player.mokepon !== undefined);

    res.send({ enemyPlayersData });
})

app.post('/mokepon/:playerId/battleEnemy', (req, res) => {

    const playerId = req.params.playerId || '';
    const battleEnemy = req.body.battleEnemy || '';
    const player = getPlayer(playerId);

    if (player !== undefined) {
        player.battleEnemy = battleEnemy;
    }

    res.end();
});

app.get('/mokepon/:playerId/attackSequence', (req, res) => {

    const playerId = req.params.playerId || '';
    const player = getPlayer(playerId);
    const attackSequence = (player !== undefined) ? player.attackSequence : [];
    
    res.send({
        attackSequence: attackSequence || []
    });
})

app.post('/mokepon/:playerId/attackSequence', (req, res) => {

    const playerId = req.params.playerId || '';
    const attackSequence = req.body.attackSequence || [];

    const playerIndex = getPlayerIndex(playerId);

    if (playerIndex >= 0) {
        players[playerIndex].setAttackSequence(attackSequence);
    }

    res.end();
})

app.put('/mokepon/:playerId/isActive', (req, res) => {

    const playerId = req.params.playerId || '';
    const playerIsActive = req.body.isActive;
    
    const playerIndex = getPlayerIndex(playerId);

    if (playerIndex >= 0 && playerIsActive !== undefined) {
        
        const player = players[playerIndex];
        player.isActive = playerIsActive;

        if (!playerIsActive) {
            playerTimeouts[player.id] = setTimeout(() => deletePlayer(playerIndex), 1000*15);
        }
        else {
            clearTimeout(playerTimeouts[player.id]);
        }
    }

    res.end();
})

app.delete('/mokepon/:playerId', (req, res) => {

    const playerId = req.params.playerId || '';
    const playerIndex = getPlayerIndex(playerId);

    deletePlayer(playerIndex);
    res.end();
});

function deletePlayer(playerIndex) {

    if (playerIndex < 0) {
        return;
    }

    players.splice(playerIndex, 1);
}

app.get('/mokepon/:playerId/exist', (req, res) => {
    const playerId = req.params.playerId || '';
    res.send({ playerExist: playerExist(playerId) });
})

app.put('/mokepon/:playerId/addVictory', (req, res) => {

    const playerId = req.params.playerId || '';
    const player = getPlayer(playerId);

    if (player !== undefined) {
        player.battleVictories++;
    }

    res.end();
})

app.listen(8080, () => {
    console.log('Server working!')
})