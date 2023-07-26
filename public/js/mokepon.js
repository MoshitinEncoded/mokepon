class Server {
    constructor(root) {
        this.root = root;
    }

    /**
     * Joins the player into the online party with a pre-selected pet.
     * @param {Player} player The player that will join the party.
     * @param {(playerId: String) => void} onJoin Callback to execute when the player joined the party.
     */
    joinParty(player, onJoin) {
        fetch(`${this.root}/mokepon/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mokepon: player.pet.name,
                x: player.position.x,
                y: player.position.y
            })
        }).then(res => {
            if (res.ok) {
                res.text().then(onJoin);
            } else {
                console.error('Failed to join party.');
            }
        });
    }

    /**
     * Returns a boolean through the callback that tells if the player is in the party.
     * @param {String} playerId Player id to check.
     * @param {(playerExist: Boolean) => void} callback Callback to execute when the server responds.
     */
    playerExist(playerId, callback) {
        fetch(`${this.root}/mokepon/${playerId}/exist`).then(res => {
            if (res.ok) {
                res.json().then( ({ playerExist }) => callback(playerExist) );
            } else {
                console.error('Could not confirm if player exists.');
            }
        });
    }

    /**
     * Updates the player position on the server.
     * @param {Player} player Player to update.
     * @param {(enemyPlayersData: *[]) => void} onPositionUpdate Callback to execute when the position has been updated.
     */
    updatePlayerPosition(player, onPositionUpdate) {
        fetch(`${this.root}/mokepon/${player.id}/position`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                x: player.position.x,
                y: player.position.y
            })
        }).then(res => {
            if (res.ok) {
                res.json().then( ({ enemyPlayersData }) => onPositionUpdate(enemyPlayersData) );
            } else {
                console.error('Could not post the player position.');
            }
        });
    }

    /**
     * Sets the player attack sequence on the server.
     * @param {String} playerId Id from the player to update.
     * @param {{type: String, name: String, id: String}[]} attackSequence Attack sequence to set.
     */
    setAttackSequence(playerId, attackSequence) {
        fetch(`${this.root}/mokepon/${playerId}/attackSequence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                attackSequence: attackSequence
            })
        });
    }

    /**
     * Sets the player battle enemy on the server.
     * @param {String} playerId Id from the player to update.
     * @param {String} enemyId Enemy player id to set as battle enemy.
     * @param {() => void} callback Callback to execute when the battle enemy has been setted.
     */
    setBattleEnemy(playerId, enemyId, callback = undefined) {
        fetch(`${this.root}/mokepon/${playerId}/battleEnemy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                battleEnemy: enemyId
            })
        }).then(res => {
            if (res.ok) {
                callback?.call();
            } else {
                console.error('Could not send the battle enemy.')
            }
        })
    }
    
    /**
     * Returns the attack sequence of an enemy through the callback.
     * @param {String} enemyId Player id from the enemy.
     * @param {(attackSequence: {type: String, name: String, id: String}) => void} callback Callback to execute when the server responds.
     */
    getEnemyAttackSequence(enemyId, callback) {
        fetch(`${this.root}/mokepon/${enemyId}/attackSequence`).then(res => {
            if (res.ok) {
                res.json().then( ({ attackSequence }) => callback(attackSequence) );
            } else {
                console.error('Could not get the enemy attack sequence.');
            }
        });
    }

    /**
     * Sets the player active status.
     * @param {String} playerId Id from the player to update.
     * @param {Boolean} isActive Whether the player is active or not.
     */
    setPlayerActive(playerId, isActive) {
        fetch(`${this.root}/mokepon/${playerId}/isActive`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isActive: isActive
            })
        })
    }

    /**
     * Adds a victory to the player on the server.
     * @param {String} playerId Id from the player to update.
     */
    addVictory(playerId) {
        fetch(`${this.root}/mokepon/${playerId}/addVictory`, { method: 'PUT' });
    }

    /**
     * Takes out the player from the online party.
     * @param {String} playerId Id from the player that leaves the party.
     */
    leaveParty(playerId) {
        fetch(`${this.root}/mokepon/${playerId}`, { method: 'DELETE', keepalive: true });
    }
}

class Vector2 {
    /**
     * Represents a two dimensional vector with (0,0) by default.
     * @param {Number} x X component of the vector.
     * @param {Number} y Y component of the vector.
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /** @returns The magnitude/lenght of the vector. */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /** Sets the magnitude to 1 while keeping his direction. */
    normalize() {
        const magnitude = this.magnitude()
        if (magnitude > 0) {
            this.x /= magnitude;
            this.y /= magnitude;
        }
    }
}

class Canvas {
    /**
     * A class to manipulate Canvas elements.
     * @param {String} elementId HTML element id.
     * @param {Number} widthUnits How much units will conform the width of the canvas. Units are a constant metric unit that doesn't care about pixel resolution.
     * @param {String} backgroundUrl Optional background url.
     */
    constructor(elementId, widthUnits = 5, backgroundUrl = '') {
        this.element = document.getElementById(elementId);
        this.rect = this.element.getBoundingClientRect();
        this.context = this.element.getContext('2d');
        this.background = new Image();
        this.background.src = backgroundUrl;
        this.widthUnits = widthUnits;
    }

    /** @returns The height of the canvas in units. */
    getHeightUnits() {
        return this.element.height * this.widthUnits / this.element.width;
    }

    /**
     * @param {Number} units Units to convert.
     * @returns Units converted to pixels.
     */
    convertUnitsToPixels(units) {
        return units / this.widthUnits * this.element.width;
    }

    /**
     * Sets width and height of canvas element.
     * @param {Number} width 
     * @param {Number} height 
     */
    setPixelSize(width, height) {
        const ratio = Math.ceil(window.devicePixelRatio);
        this.element.width = width * ratio;
        this.element.height = height * ratio;
        this.element.style.width = width+'px';
        this.element.style.height = height+'px';
    }

    /** Clears completely the canvas context. */
    clearContext() {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
    }

    /** Draws the default background. */
    drawBackground() {
        this.context.drawImage(
            this.background,
            0,
            0,
            this.element.width,
            this.element.height
        );
    }

    /**
     * Draws an image on the canvas.
     * @param {HTMLImageElement} image Image to draw.
     * @param {Number} x X position in units.
     * @param {Number} y Y position in units.
     * @param {Number} width Width in units.
     * @param {Number} height Height in units.
     * @param {Number} [alpha=1] Alpha of the image from 0 (invisible) to 1 (visible).
     */
    drawImage(image, x, y, width, height, alpha = 1) {
        let previousAlpha = this.context.globalAlpha;
        this.context.globalAlpha = alpha;

        this.context.drawImage(
            image,
            this.convertUnitsToPixels(x),
            this.convertUnitsToPixels(y),
            this.convertUnitsToPixels(width),
            this.convertUnitsToPixels(height)
        );

        this.context.globalAlpha = previousAlpha;
    }
}

class Mokepon {
    /**
     * @param {String} name Name of the mokepon.
     * @param {String} element His element (fire, water or plant).
     * @param {{type: String, name: String, id: String}[]} attacks Attacks this mokepon has.
     * @param {String} description A little random description.
     * @param {String} imageURL URL of the mokepon image to display on battle.
     * @param {String} avatarImageURL URL of the mokepon avatar image to display on the map.
     */
    constructor(name, element, attacks, description, imageURL, avatarImageURL) {
        this.name = name;
        this.element = element;
        this.attacks = attacks;
        this.description = description;
        this.imageURL = imageURL;
        this.avatarImage = new Image();
        this.avatarImage.src = avatarImageURL;
    }

    /**
     * Draws the mokepon on the canvas.
     * @param {{x: Number, y: Number}} position Position on the map in units.
     * @param {{width: Number, height: Number}} size Size in units.
     * @param {Boolean} canBattle 
     */
    drawMokepon(position, size, canBattle) {
        let alpha = canBattle ? 1 : 0.5;
        MAP.drawImage(
            this.avatarImage,
            position.x,
            position.y,
            size.width,
            size.height,
            alpha
        );
    }
}

class Player {
    /**
     * It's a player... A player with a pet...
     */
    constructor() {
        this.id = '';
        this.pet = null;
        this.attackSequence = [];
        this.battleWins = 0;
        this.battleVictories = 0;
        this.battleEnemy = '';
        this.isActive = true;
        
        let size = MAP.widthUnits * 0.1;
        this.size = { width: size, height: size };
        this.position = {
            x: getRandomNumber(0, MAP.widthUnits - this.size.width),
            y: getRandomNumber(0, MAP.getHeightUnits() - this.size.height)
        };
        this.speed = MAP.widthUnits / (60 * 3);
        this.velocity = new Vector2();
    }

    /** Sets the velocity multiplying moveInput with speed.
     *  @param {Vector2} moveInput 
     */
    setVelocityFromInput(moveInput) {
        this.velocity.x = moveInput.x * this.speed;
        this.velocity.y = moveInput.y * this.speed;
    }

    /** Updates the position based on his velocity. */
    updatePosition() {
        this.position.x += this.velocity.x;
        this.position.x = clamp(0, MAP.widthUnits - this.size.width, this.position.x);
        this.position.y += this.velocity.y;
        this.position.y = clamp(0, MAP.getHeightUnits() - this.size.height, this.position.y);
    }

    /** Draws the player pet on the canvas. */
    drawPlayer() {
        this.pet.drawMokepon(this.position, this.size, this.canBattle());
        MAP.context.font = MAP.convertUnitsToPixels(MAP.widthUnits*0.04)+'px sans-serif';
        MAP.context.textAlign = 'center';
        MAP.context.textBaseline = 'top';
        MAP.context.fillText(this.battleVictories+'🏆', MAP.convertUnitsToPixels(this.position.x + this.size.width*0.5), 10);
    }

    /** @returns Whether the player can initiate a battle or not. */
    canBattle() {
        return this.isActive && this.battleEnemy === '';
    }

    /** @returns Whether the attack sequence has been completed. */
    attackSequenceCompleted() {
        return this.attackSequence.length === this.pet.attacks.length;
    }
}

const SERVER = new Server('http://192.168.1.9:8080');

// Background
const BACKGROUND_COLOR = document.getElementById('background-color');

// Main Title
const TITLE_SECTION = document.getElementById('title-section');

// Pet selection
const PET_SELECTION = document.getElementById('pet-selection');
const PET_SELECT_BUTTON = document.getElementById('pet-select-button');
const PET_CARDS = document.getElementById('pet-cards');

const LOADING_SECTION = document.getElementById('loading-section');

// Map section
const MAP_SECTION = document.getElementById('map-section');
const MAP = new Canvas('map', 10, './assets/mokemap.png');
const MAX_MAP_WIDTH = 800;
const MOVE_CONTROLLS = document.getElementById('move-controlls');

// Attack selection
const ATTACK_BUTTONS = document.getElementById('attack-buttons');

const BATTLE_TRANSITION = document.getElementById('battle-transition');
const BATTLE_TITLE = document.getElementById('battle-title');

// Battle section
const BATTLE_SECTION = document.getElementById('battle-section');
const PLAYER_PET_NAME = document.getElementById('player-pet-name');
const PLAYER_PET_IMAGE = document.getElementById('player-pet-image');
const PLAYER_BATTLE_WINS = document.getElementById('player-lifes');
const ENEMY_PET_NAME = document.getElementById('enemy-pet-name');
const ENEMY_PET_IMAGE = document.getElementById('enemy-pet-image');
const ENEMY_BATTLE_WINS = document.getElementById('enemy-lifes');
const BATTLE_RESULT = document.getElementById('battle-result');

// Battle history
const PLAYER_BATTLE_HISTORY = document.getElementById('player-battle-history');
const ENEMY_BATTLE_HISTORY = document.getElementById('enemy-battle-history');

// Battle end buttons
const END_BATTLE_BUTTONS = document.getElementById('end-battle-buttons');
const CONTINUE_BUTTON = document.getElementById('continue-button');
const RESTART_BUTTON = document.getElementById('restart-button');

// Elements
const FIRE = '🔥';
const WATER = '💧';
const PLANT = '🌱';

// Battle results
const WIN = '¡GANASTE! 😎✨';
const TIE = '🤜¡Es un empate!🤛';
const LOSE = 'Lo siento bro, perdiste 😢';

const PLAYER = new Player();
let enemyPlayer = new Player();

const WATER_ATTACKS = [
    { type: WATER, name: 'Disparo', id: 'water-shot-attack-button' },
    { type: WATER, name: 'Chorro', id: 'waterjet-attack-button' },
    { type: WATER, name: 'Balde Helado', id: 'ice-bucket-attack-button' },
    { type: FIRE, name: 'Disparo', id: 'fire-shot-attack-button' },
    { type: PLANT, name: 'Arenizca', id: 'dirty-play-attack-button' }
]

const PLANT_ATTACKS = [
    { type: PLANT, name: 'Arenizca', id: 'dirty-play-attack-button' },
    { type: PLANT, name: 'Bofetada', id: 'punch-attack-button' },
    { type: PLANT, name: 'Temblor', id: 'mini-earthquake-attack-button' },
    { type: FIRE, name: 'Disparo', id: 'fire-shot-attack-button' },
    { type: WATER, name: 'Disparo', id: 'water-shot-attack-button' }
]

const FIRE_ATTACKS = [
    { type: FIRE, name: 'Disparo', id: 'fire-shot-attack-button' },
    { type: FIRE, name: 'Chispas', id: 'sparks-attack-button' },
    { type: FIRE, name: 'Llamarada', id: 'fire-blaze-attack-button' },
    { type: WATER, name: 'Disparo', id: 'water-shot-attack-button' },
    { type: PLANT, name: 'Arenizca', id: 'dirty-play-attack-button' }
]

const MOKEPONS = [
    new Mokepon('Hipodoge', WATER, WATER_ATTACKS, 'Le gusta jugar bromas en baños públicos.', './assets/mokepons_mokepon_hipodoge_attack.png', './assets/hipodoge.png'),
    new Mokepon('Capipepo', PLANT, PLANT_ATTACKS, 'Peleó mano a mano contra una planta y perdió.', './assets/mokepons_mokepon_capipepo_attack.png', './assets/capipepo.png'),
    new Mokepon('Ratigueya', FIRE, FIRE_ATTACKS, 'Le gusta saquear y le gusta el peligro, por eso saquea refrigeradores.', './assets/mokepons_mokepon_ratigueya_attack.png', './assets/ratigueya.png'),
    new Mokepon('Pydos', WATER, WATER_ATTACKS, 'El único mokepón que sí aparece en la serie.', './assets/mokepons_mokepon_pydos_attack.png','./assets/mokepons_mokepon_pydos_attack.png'),
    new Mokepon('Tucapalma', PLANT, PLANT_ATTACKS, 'Casi actuó en Winter, pero un pelícano le robó el papel.', './assets/mokepons_mokepon_tucapalma_attack.png','./assets/mokepons_mokepon_tucapalma_attack.png'),
    new Mokepon('Langostelvis', FIRE, FIRE_ATTACKS, 'Trataron de cocinarlo; ahora es el chef.', './assets/mokepons_mokepon_langostelvis_attack.png','./assets/mokepons_mokepon_langostelvis_attack.png')
];

let innerMoveTouchControl;
let innerMoveTouchControlRect;
let moveTouchControlStyle;
let moveControlSize;

let moveInput = new Vector2();
let moveTouch = null;

let moveKeyInputMap = {
    rightKey: false,
    leftKey: false,
    upKey: false,
    downKey: false
};

let enemyPlayers = [];

let gameLoopInterval;
let battleLoopInterval;

let isTouchDevice = false;

function startGame() {

    PET_SELECT_BUTTON.addEventListener('click', () => { confirmPlayerPet(); joinOnlineParty(); });
    CONTINUE_BUTTON.addEventListener('click', () => { unloadBattle(); loadMap(); });
    RESTART_BUTTON.addEventListener('click', () => { leaveParty(); location.reload(); });

    MOVE_CONTROLLS.addEventListener('touchstart', handleTouchpadStart);
    MOVE_CONTROLLS.addEventListener('touchend', handleTouchpadEnd);
    MOVE_CONTROLLS.addEventListener('touchmove', handleTouchpadMove);
    MOVE_CONTROLLS.addEventListener('touchcancel', handleTouchpadEnd);

    document.addEventListener('touchstart', () => { isTouchDevice = true });

    MAP_SECTION.style.display = 'none';
    BATTLE_SECTION.style.display = 'none';
    END_BATTLE_BUTTONS.style.display = 'none';
    LOADING_SECTION.style.display = 'none';

    addPetCards()
}

/** Adds the pet cards for pet selection to the DOM. */
function addPetCards() {

    MOKEPONS.forEach((mokepon) => {
        PET_CARDS.innerHTML += `
        <input type="radio" name="pet-card" id="radio-${mokepon.name.toLowerCase()}" class="hidden" />
        <label class="pet-card" for="radio-${mokepon.name.toLowerCase()}">
            <div class="pet-card-description">
                <h3>${mokepon.name}</h3>
                <p>${mokepon.description}</p>
            </div>
            
            <img src=${mokepon.imageURL} alt=${mokepon.name}>
        </label>
        `
    })

    PET_CARDS.addEventListener('change', selectPlayerPet)
}

/**
 * Sets the player pet from the pet card selected.
 * @param {Event} e Pet card selected event.
 */
function selectPlayerPet(e) {
    const petSelectedInput = e.target
    PLAYER.pet = MOKEPONS.find(mokepon => `radio-${mokepon.name.toLowerCase()}` == petSelectedInput.id)
}

/** Confirms the player pet selected. */
function confirmPlayerPet() {

    if (PLAYER.pet == undefined) {
        alert('Selecciona una mascota antes de continuar.');
        return;
    }

    PLAYER_PET_NAME.innerHTML = PLAYER.pet.name;
    PLAYER_PET_IMAGE.src = PLAYER.pet.imageURL;
}

/** Joins the player to the online party. */
function joinOnlineParty() {

    addPlayerAttackButtons();

    SERVER.joinParty(PLAYER, playerId => {
        PLAYER.id = playerId;
        unloadPetSelection();
        initializeMap();
    });
}

/** Takes out the player from the online party. */
function leaveParty() {

    if (PLAYER.id !== '') {
        SERVER.leaveParty(PLAYER.id);
        PLAYER.id = '';
    }
}

/** Adds the attack buttons to the DOM */
function addPlayerAttackButtons() {

    PLAYER.pet.attacks.forEach(attack => {

        let attackButton = document.createElement('button')

        attackButton.id = attack.id
        attackButton.className = 'attack-button'
        attackButton.innerHTML = `${attack.name} ${attack.type}`

        attackButton.addEventListener('click', () => {
            PLAYER.attackSequence.push(attack)
            attackButton.disabled = true

            if (PLAYER.attackSequenceCompleted()) {
                SERVER.setAttackSequence(PLAYER.id, PLAYER.attackSequence);
            }
        })

        ATTACK_BUTTONS.append(attackButton)
    })
}

/** Unloads the pet selection section. */
function unloadPetSelection() {
    TITLE_SECTION.style.display = 'none';
    PET_SELECTION.style.display = 'none';
}

function initializeMap() {

    calculateMapSize();    
    moveControlSize = parseInt(MAP.element.style.width) * 0.5;

    if (isTouchDevice) {

        MAP_SECTION.style.marginTop = '40%';
        MOVE_CONTROLLS.innerHTML = `
        <div id='move-controlls-touch' style='width: ${moveControlSize}px; height: ${moveControlSize}px'>
            <div id='inner-move-control-touch' style='width: ${moveControlSize*0.2}px; height: ${moveControlSize*0.2}px'></div>
        </div>`;

        innerMoveTouchControl = document.getElementById('inner-move-control-touch');
        innerMoveTouchControlRect = innerMoveTouchControl.getBoundingClientRect();
        moveTouchControlStyle = getComputedStyle(document.getElementById('move-controlls-touch'));
        drawMoveTouchControl();
    }
    else {
        MOVE_CONTROLLS.innerHTML = 
            "<img src='./assets/WASD-Control.png' alt='ERROR' style='width: "+moveControlSize+"px' id='move-controlls-image'></img>";
    }

    loadMap();
}

/** Calculates and sets the map size. */
function calculateMapSize() {
    let mapWidth = document.documentElement.clientWidth || window.innerWidth;
    mapWidth = clamp(0, MAX_MAP_WIDTH, mapWidth);
    MAP.setPixelSize(mapWidth, mapWidth * 600 / 800);
}

/** Loads the map section. */
function loadMap() {

    LOADING_SECTION.style.display = 'flex';

    setCanBattle(PLAYER, false, () => {

        MAP_SECTION.style.display = 'flex';
        BACKGROUND_COLOR.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        LOADING_SECTION.style.display = 'none';

        window.addEventListener('keydown', updateMovementKeyPressed);
        window.addEventListener('keyup', updateMovementKeyReleased);

        gameLoopInterval = setInterval(updateMap, 1000/60);
        setTimeout(() => setCanBattle(PLAYER, true), 3000);
    });
}

/** Updates the map and the players. */
function updateMap() {

    PLAYER.updatePosition();
    SERVER.updatePlayerPosition(PLAYER, updateEnemies);
    
    MAP.clearContext();
    MAP.drawBackground();

    enemyPlayers.forEach(enemyPlayer => {
        enemyPlayer.drawPlayer();
        checkCollisionWith(enemyPlayer);
    })

    PLAYER.drawPlayer();
}

/**
 * Handles touchstart event.
 * @param {TouchEvent} e 
 */
function handleTouchpadStart(e) {

    e.preventDefault();
    if (moveTouch !== null) {
        return;
    }

    moveTouch = e.changedTouches[0];
    updateMoveInputWithTouch(moveTouch);
}

/**
 * Handles touchmove event.
 * @param {TouchEvent} e 
 */
function handleTouchpadMove(e) {

    e.preventDefault()
    if (moveTouch === null) {
        return
    }

    let movedTouches = e.changedTouches
    for (let i = 0; i < movedTouches.length; i++) {
        if (movedTouches[i].identifier === moveTouch.identifier) {
            updateMoveInputWithTouch(movedTouches[i])
        }
    }
}

/**
 * Handles touchend event.
 * @param {TouchEvent} e 
 */
function handleTouchpadEnd(e) {

    e.preventDefault()
    let endedTouches = e.changedTouches

    for (let i = 0; i < endedTouches.length; i++) {
        if (endedTouches[i].identifier === moveTouch.identifier) {

            moveTouch = null
            moveInput.x = 0;
            moveInput.y = 0;
            drawMoveTouchControl();

            if (PLAYER !== null) {
                PLAYER.velocity.x = 0
                PLAYER.velocity.y = 0
            }
        }
    }
}

/** Updates the move input through the touchpad. */
function updateMoveInputWithTouch(moveTouchTarget) {

    let moveControllsRect = MOVE_CONTROLLS.getBoundingClientRect()
    moveInput.x = moveTouchTarget.clientX - (moveControllsRect.left + moveControllsRect.width / 2)
    moveInput.y = moveTouchTarget.clientY - (moveControllsRect.top + moveControllsRect.height / 2)

    let moveTouchControlRadius = moveControlSize * 0.5 - parseInt(moveTouchControlStyle.borderWidth, 10);
    let innerMoveTouchControlRadius = innerMoveTouchControlRect.width * 0.5;
    let moveControlRadius = moveTouchControlRadius - innerMoveTouchControlRadius;

    moveInput.x /= moveControlRadius;
    moveInput.y /= moveControlRadius;

    if (moveInput.magnitude() > 1) {
        moveInput.normalize()
    }

    if (PLAYER !== null) {
        PLAYER.setVelocityFromInput(moveInput)
    }

    drawMoveTouchControl();
}

/** Adjusts the scale of the touchpad. */
function drawMoveTouchControl() {
    innerMoveTouchControl.style.left = scale(moveInput.x, -1, 1, 0, 80) + '%';
    innerMoveTouchControl.style.top = scale(moveInput.y, -1, 1, 0, 80) + '%';
}

/** Updates the keymap when any key is pressed. */
function updateMovementKeyPressed(e) {

    if (e.repeat !== undefined && e.repeat === true) {
        return
    }

    setMovementKeyState(e.key, true)
}

/** Updates the keymap when any key is released. */
function updateMovementKeyReleased(e) {
    setMovementKeyState(e.key, false)
}

/** Sets the movement key state to pressed (true) or released (false). */
function setMovementKeyState(key, state) {
    switch (key) {
        case 'd':
        case 'ArrowRight':
            moveKeyInputMap.rightKey = state
            updateMoveInputWithKey()
            break;
        case 'a':
        case 'ArrowLeft':
            moveKeyInputMap.leftKey = state
            updateMoveInputWithKey()
            break
        case 'w':
        case 'ArrowUp':
            moveKeyInputMap.upKey = state
            updateMoveInputWithKey()
            break
        case 's':
        case 'ArrowDown':
            moveKeyInputMap.downKey = state
            updateMoveInputWithKey()
            break
        default:
            break;
    }
}

/** Updates the move input through the keyboard. */
function updateMoveInputWithKey() {

    moveInput.x = 0
    moveInput.y = 0

    if (moveKeyInputMap.rightKey) {
        moveInput.x += 1
    }
    if (moveKeyInputMap.leftKey) {
        moveInput.x += -1
    }
    if (moveKeyInputMap.upKey) {
        moveInput.y += -1
    }
    if (moveKeyInputMap.downKey) {
        moveInput.y += 1
    }

    moveInput.normalize()
    if (PLAYER !== null) {
        PLAYER.setVelocityFromInput(moveInput)
    }
}

/**
 * Updates the enemies data from the server.
 * @param {*[]} enemyPlayersData Enemies data.
 */
function updateEnemies(enemyPlayersData) {
    
    enemyPlayers = enemyPlayersData.reduce((enemyPlayers, enemyData) => {

        const enemyPetName = enemyData.mokepon.name || '';

        if (enemyPetName === '') {
            return enemyPlayers;
        }

        let enemyPlayer = new Player();
        enemyPlayer.id = enemyData.id;
        enemyPlayer.pet = MOKEPONS.find(mokepon => mokepon.name === enemyPetName);
        enemyPlayer.position = { x: enemyData.x, y: enemyData.y };
        enemyPlayer.battleEnemy = enemyData.battleEnemy;
        enemyPlayer.isActive = enemyData.isActive;
        enemyPlayer.battleVictories = enemyData.battleVictories;
        enemyPlayers.push(enemyPlayer);
        
        return enemyPlayers;
    }, []);
}

/**
 * Checks for a collision with an enemy player.
 * @param {Player} enemy Enemy player to check collision with.
 */
function checkCollisionWith(enemy) {

    if (
        !PLAYER.canBattle() ||
        !enemy.canBattle() && enemy.battleEnemy != PLAYER.id
    ) {
        return;
    }

    const playerUp = PLAYER.position.y;
    const playerDown = PLAYER.position.y + PLAYER.size.height;
    const playerLeft = PLAYER.position.x;
    const playerRight = PLAYER.position.x + PLAYER.size.width;

    const enemyUp = enemy.position.y;
    const enemyDown = enemy.position.y + enemy.size.height;
    const enemyLeft = enemy.position.x;
    const enemyRight = enemy.position.x + enemy.size.width;

    if (
        playerUp > enemyDown ||
        playerDown < enemyUp ||
        playerLeft > enemyRight ||
        playerRight < enemyLeft
    ) {
        return;
    }
    
    stopMovement();
    clearInterval(gameLoopInterval);
    selectEnemy(enemy);
    setBattleEnemy(PLAYER, enemy.id);
    enemy.battleEnemy = PLAYER.id;

    loadBattle();
}

/** Stops the movement of the player. */
function stopMovement() {
    PLAYER.velocity.x = 0
    PLAYER.velocity.y = 0
}

/**
 * Selects the enemy of the player.
 * @param {Player} enemy Enemy player that the player will battle with.
 */
function selectEnemy(enemy) {

    enemyPlayer = enemy;

    ENEMY_PET_NAME.innerHTML = enemy.pet.name
    ENEMY_PET_IMAGE.src = enemy.pet.imageURL
}

/** Unloads the map section. */
function unloadMap() {
    window.removeEventListener('keydown', updateMovementKeyPressed);
    window.removeEventListener('keyup', updateMovementKeyReleased);
}

/** Loads the battle section. */
function loadBattle() {

    // Resets player attacks
    PLAYER.attackSequence = [];
    SERVER.setAttackSequence(PLAYER.id, []);

    for (let i = 0; i < ATTACK_BUTTONS.childElementCount; i++) {
        ATTACK_BUTTONS.children.item(i).disabled = false;
    }

    // Resets animations
    BATTLE_TRANSITION.style.animation = 'none';
    BATTLE_TITLE.style.animation = 'none';
    BATTLE_TRANSITION.offsetHeight;

    // Transitions to battle
    let battleTransitionDuration = 3;
    BATTLE_TRANSITION.style.animation = 'battle-transition ' + battleTransitionDuration+'s';
    BATTLE_TITLE.style.animation = 'battle-title ' + battleTransitionDuration+'s';

    // Show battle section
    setTimeout(() => {

        BATTLE_RESULT.innerHTML = '';
        END_BATTLE_BUTTONS.style.display = 'none';
        PLAYER_BATTLE_HISTORY.innerHTML = '';
        ENEMY_BATTLE_HISTORY.innerHTML = '';
    
        MAP_SECTION.style.display = 'none';
        BATTLE_SECTION.style.display = 'flex';
        BACKGROUND_COLOR.style.backgroundColor = '#1a397a4a';

        battleLoopInterval = setInterval(battleLoop, 1000/30);
    }, battleTransitionDuration * 1000 * 0.5);
    
}

/** Updates the data relative to the battle. */
function battleLoop() {
    SERVER.playerExist(enemyPlayer.id, playerExist => {
        if (!playerExist) {
            enemyPlayer.isActive = false;
            clearInterval(battleLoopInterval);
            endBattle();
        } else if (PLAYER.attackSequenceCompleted() && enemyPlayer.attackSequenceCompleted()) {
            clearInterval(battleLoopInterval);
            startBattle();
        } else {
            updateEnemyAttackSequence();
        }
    });
}

/** Updates the enemy attack sequence from the server. */
function updateEnemyAttackSequence() {
    SERVER.getEnemyAttackSequence(enemyPlayer.id, attackSequence => {
        enemyPlayer.attackSequence = attackSequence;
    });
}

/** Starts the battle with the attack sequences selected. */
function startBattle() {

    PLAYER.battleWins = 0;

    for (let i = 0; i < PLAYER.attackSequence.length; i++) {
        resolveFight(PLAYER.attackSequence[i], enemyPlayer.attackSequence[i]);
    }

    drawBattleWins();
    endBattle();
}

/** Checks one fight winner and saves the result. */
function resolveFight(playerAttack, enemyAttack) {

    let fightResult

    if (playerAttack.type == enemyAttack.type) {
        fightResult = TIE
    } else if (
        playerAttack.type == FIRE && enemyAttack.type == PLANT || 
        playerAttack.type == WATER && enemyAttack.type == FIRE || 
        playerAttack.type == PLANT && enemyAttack.type == WATER) {
            PLAYER.battleWins++
            fightResult =  WIN
    } else {
        enemyPlayer.battleWins++
        fightResult =  LOSE
    }

    displayFightResult(playerAttack, enemyAttack, fightResult)
}

/** Displays the fight result in the battle history. */
function displayFightResult(playerAttack, enemyAttack, fightResult) {
    insertBattleHistoryMessage(PLAYER_BATTLE_HISTORY, playerAttack, fightResult == WIN)
    insertBattleHistoryMessage(ENEMY_BATTLE_HISTORY, enemyAttack, fightResult == LOSE)
}

/** Inserts one fight result into the battle history of the player. */
function insertBattleHistoryMessage(battleHistory, attack, winCondition) {

    attack = attack.name + attack.type

    let attackMessage = document.createElement('p')
    attackMessage.innerHTML = winCondition ? attack+'🏆' : attack
    battleHistory.insertBefore(attackMessage, battleHistory.firstChild)
}

/** Displays the battle wins in the DOM. */
function drawBattleWins() {
    PLAYER_BATTLE_WINS.innerHTML = PLAYER.battleWins
    ENEMY_BATTLE_WINS.innerHTML = enemyPlayer.battleWins
}

/** Ends the battle, displaying the battle result in the DOM. */
function endBattle() {

    if (enemyPlayer.isActive === false) {
        BATTLE_RESULT.innerHTML = 'Tu oponente se ha desconectado, ' + WIN;
        addVictory(PLAYER);
    } else if (PLAYER.battleWins == enemyPlayer.battleWins) {
        BATTLE_RESULT.innerHTML = TIE
    } else if (PLAYER.battleWins > enemyPlayer.battleWins) {
        BATTLE_RESULT.innerHTML = WIN
        addVictory(PLAYER);
    } else {
        BATTLE_RESULT.innerHTML = LOSE
    }

    END_BATTLE_BUTTONS.style.display = 'flex';
    setCanBattle(PLAYER, false);
}

/**
 * Adds a battle victory to the player.
 * @param {Player} player Player to update.
 */
function addVictory(player) {
    player.battleVictories++;
    SERVER.addVictory(player.id);
}

/** Unloads the battle section. */
function unloadBattle() {
    BATTLE_SECTION.style.display = 'none';
}

/**
 * Sets the player isActive state.
 * @param {Boolean} isActive Whether the player is active or not.
 */
function setPlayerActive(isActive) {
    SERVER.setPlayerActive(PLAYER.id, isActive);
    setCanBattle(PLAYER, isActive);
}

/**
 * Sets whether a player can initiate a battle with another player or not.
 * @param {Player} player Player to modify.
 * @param {Boolean} canBattle Whether the player can initiate a battle or not.
 * @param {() => void} onSetted Callback to execute when canBattle has been setted.
 */
function setCanBattle(player, canBattle, onSetted = undefined) {
    setBattleEnemy(player, canBattle? '' : '-1', onSetted);
}

/**
 * Sets the battle enemy of the player.
 * @param {Player} player Player to update.
 * @param {String} battleEnemy Enemy player id to set as battle enemy.
 * @param {() => void} onSetted Callback to execute when battle enemy has been setted.
 */
function setBattleEnemy(player, battleEnemy, onSetted = undefined) {
    player.battleEnemy = battleEnemy;
    SERVER.setBattleEnemy(PLAYER.id, battleEnemy, onSetted);
}

/**
 * @param {Number} min Minimum value generated.
 * @param {Number} max Maximum value generated. 
 * @returns A value between min (inclusive) and max (inclusive). */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * @param {Number} min Minimum value.
 * @param {Number} max Maximum value.
 * @param {Number} value Value to clamp.
 * @returns The value clamped between min and max values. */
function clamp(min, max, value) {
    if (value < min) {
        value = min
    } else if (value > max) {
        value = max
    }

    return value
}

/**
 * Scales the value from one range to another.
 * @param {Number} value Value to scale.
 * @param {Number} inMin Input range minimum value.
 * @param {Number} inMax Input range maximum value.
 * @param {Number} outMin Output range minimum value.
 * @param {Number} outMax Output range maximum value.
 * @returns The position of the value in the input range on the output range.
 */
function scale (value, inMin, inMax, outMin, outMax) {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}

window.addEventListener('load', startGame);
document.addEventListener('visibilitychange', () => {

    if (PLAYER.id !== '' && !isTouchDevice) {
        SERVER.playerExist(PLAYER.id, playerExist => {
            if (!playerExist) {
                location.reload();
            }
        });
    }

    if (PLAYER.id !== '' && isTouchDevice) {
        if (document.visibilityState === 'hidden') {
            setPlayerActive(false);
        }
        else {
            SERVER.playerExist(PLAYER.id, playerExist => {
                if (playerExist) {
                    setPlayerActive(true);
                } else {
                    location.reload();
                }
            });
        }
    }
})
window.addEventListener('pagehide', () => {
    leaveParty();
})