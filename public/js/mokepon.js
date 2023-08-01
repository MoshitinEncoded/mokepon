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
                position: player.position
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
     * @param {(enemyPlayersData: *[]) => void} onCollision Callback to execute when the player has collided with another player.
     */
    updatePlayerPosition(player, onCollision) {
        fetch(`${this.root}/mokepon/${player.id}/position`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                position: player.position,
                size: player.size
            })
        }).then(res => {
            if (res.ok) {
                res.json().then( ({ collidedEnemy }) => onCollision(collidedEnemy) );
            } else {
                console.error('Could not post the player position.');
            }
        });
    }

    /**
     * Returns the enemies data through a callback.
     * @param {*} playerId Player which enemies you want to get.
     * @param {(enemiesData: *[]) => void} callback Callback to pass the data.
     */
    getEnemiesData(playerId, callback) {
        fetch(`${this.root}/mokepon/${playerId}/enemiesData`).then(res => {
            if (res.ok) {
                res.json().then( ({ enemiesData }) => callback(enemiesData) );
            }
        })
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

HTMLMediaElement.prototype.stop = function() {
    this.pause();
    this.currentTime = 0;
}

const SERVER_ROOT = location.href.slice(0, -1);
const SERVER = new Server(SERVER_ROOT);

// Background
const BACKGROUND_COLOR = document.getElementById('background-color');

// Main Title
const TITLE_SECTION = document.getElementById('title-section');

// Pet selection
const PET_SELECTION = document.getElementById('pet-selection');
const PET_SELECT_BUTTON = document.getElementById('pet-select-button');
const PET_CARDS = document.getElementById('pet-cards');

const LOADING_TRANSITION = document.getElementById('loading-transition');
const LOADING_TITLE = document.getElementById('loading-title');

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
const PLAYER_BATTLE_WINS = document.getElementById('player-victories');
const ENEMY_PET_NAME = document.getElementById('enemy-pet-name');
const ENEMY_PET_IMAGE = document.getElementById('enemy-pet-image');
const ENEMY_BATTLE_WINS = document.getElementById('enemy-victories');
const BATTLE_RESULT = document.getElementById('battle-result');

// Battle history
const PLAYER_BATTLE_HISTORY = document.getElementById('player-battle-history');
const ENEMY_BATTLE_HISTORY = document.getElementById('enemy-battle-history');

// Battle end buttons
const END_BATTLE_BUTTONS = document.getElementById('end-battle-buttons');
const CONTINUE_BUTTON = document.getElementById('continue-button');
const RESTART_BUTTON = document.getElementById('restart-button');

const HELP_SECTION = document.getElementById('help-section');
const HELP_CLOSE_BUTTON = document.getElementById('help-close-button');

// Elements
const FIRE = '🔥';
const WATER = '💧';
const PLANT = '🌱';

// Audios
const MAP_MUSIC = new Audio("./assets/map_music.mp3");
MAP_MUSIC.loop = true;
MAP_MUSIC.volume = 0.6;

const BATTLE_MUSIC = new Audio("./assets/battle_music.mp3");
BATTLE_MUSIC.loop = true;
BATTLE_MUSIC.volume = 0.2;

const BUTTON_SELECT_SOUND = new Audio("./assets/button_select.mp3");
BUTTON_SELECT_SOUND.volume = 0.4;
const BUTTON_CLICK_SOUND = new Audio("./assets/button_click.mp3");
BUTTON_CLICK_SOUND.volume = 0.4;

const GAME_START_SOUND = new Audio("./assets/game_start.mp3");

const BATTLE_WIN_SOUND = new Audio("./assets/battle_win.mp3");
BATTLE_WIN_SOUND.volume = 0.3;
const BATTLE_LOSE_SOUND = new Audio("./assets/battle_lose.mp3");
BATTLE_LOSE_SOUND.volume = 0.3;

// Battle results
let win;
let tie;
let lose;

const PLAYER = new Player();
let enemyPlayer = new Player();

let waterAttacks;
let plantAttacks;
let fireAttacks;

let mokepons;

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

let language;
function setLanguage() {
    fetch("/languages/"+getUserLanguage()+".json").then(res => {
        if (res.ok) {
            res.json().then(data => {
                language = data;
                initializeGame();
            })
        }
    })
}

function getUserLanguage() {
    const userLocale =
        (navigator.languages && navigator.languages.length > 0)
            ? navigator.languages[0]
            : navigator.language;

    return userLocale.split("-")[0];
}

function initializeGame() {

    win = language.win;
    tie = language.tie;
    lose = language.lose;

    waterAttacks = [
        { type: WATER, name: language.waterAttack1, id: 'water-attack-1-button' },
        { type: WATER, name: language.waterAttack2, id: 'water-attack-2-button' },
        { type: WATER, name: language.waterAttack3, id: 'water-attack-3-button' },
        { type: FIRE, name: language.fireAttack1, id: 'fire-attack-1-button' },
        { type: PLANT, name: language.plantAttack1, id: 'plant-attack-1-button' }
    ]

    plantAttacks = [
        { type: PLANT, name: language.plantAttack1, id: 'plant-attack-1-button' },
        { type: PLANT, name: language.plantAttack2, id: 'plant-attack-2-button' },
        { type: PLANT, name: language.plantAttack3, id: 'plant-attack-3-button' },
        { type: FIRE, name: language.fireAttack1, id: 'fire-attack-1-button' },
        { type: WATER, name: language.waterAttack1, id: 'water-attack-1-button' }
    ]

    fireAttacks = [
        { type: FIRE, name: language.fireAttack1, id: 'fire-attack-1-button' },
        { type: FIRE, name: language.fireAttack2, id: 'fire-attack-2-button' },
        { type: FIRE, name: language.fireAttack3, id: 'fire-attack-3-button' },
        { type: WATER, name: language.waterAttack1, id: 'water-attack-1-button' },
        { type: PLANT, name: language.plantAttack1, id: 'plant-attack-1-button' }
    ]

    mokepons = [
        new Mokepon('Hipodoge', WATER, waterAttacks, language.hipodogeDescription, './assets/mokepons_mokepon_hipodoge_attack.png', './assets/hipodoge.png'),
        new Mokepon('Capipepo', PLANT, plantAttacks, language.capipepoDescription, './assets/mokepons_mokepon_capipepo_attack.png', './assets/capipepo.png'),
        new Mokepon('Ratigueya', FIRE, fireAttacks, language.ratigueyaDescription, './assets/mokepons_mokepon_ratigueya_attack.png', './assets/ratigueya.png'),
        new Mokepon('Pydos', WATER, waterAttacks, language.pydosDescription, './assets/mokepons_mokepon_pydos_attack.png','./assets/mokepons_mokepon_pydos_attack.png'),
        new Mokepon('Tucapalma', PLANT, plantAttacks, language.tucapalmaDescription, './assets/mokepons_mokepon_tucapalma_attack.png','./assets/mokepons_mokepon_tucapalma_attack.png'),
        new Mokepon('Langostelvis', FIRE, fireAttacks, language.langostelvisDescription, './assets/mokepons_mokepon_langostelvis_attack.png','./assets/mokepons_mokepon_langostelvis_attack.png')
    ];

    document.getElementById('title').innerHTML = language.title;
    document.getElementById('subtitle1').innerHTML = language.subtitle1;
    document.getElementById('subtitle2').innerHTML = language.subtitle2;
    document.getElementById('subtitle3').innerHTML = language.subtitle3;

    const helpOpenButtons = document.getElementsByClassName('help-open-button');
    for (var i = 0; i < helpOpenButtons.length; i++) {
        helpOpenButtons[i].innerHTML = language.howToPlay;
        helpOpenButtons[i].addEventListener('click', openHelpPanel);
    }

    document.getElementById('how-to-play').innerHTML = language.howToPlay;

    document.getElementById('help-title-1').innerHTML = language.helpTitle1;
    document.getElementById('help-text-1').innerHTML = language.helpText1;

    document.getElementById('help-title-2').innerHTML = language.helpTitle2;
    document.getElementById('help-text-2').innerHTML = language.helpText2;

    document.getElementById('help-title-3').innerHTML = language.helpTitle3;
    document.getElementById('help-text-3').innerHTML = language.helpText3;

    document.getElementById('help-title-4').innerHTML = language.helpTitle4;
    document.getElementById('help-text-4-1').innerHTML = language.helpText41;
    document.getElementById('help-text-4-2').innerHTML = language.helpText42;
    document.getElementById('help-text-4-3').innerHTML = language.helpText43;

    HELP_CLOSE_BUTTON.innerHTML = language.close;

    document.getElementById('pet-select-title').innerHTML = language.petSelect;
    PET_SELECT_BUTTON.innerHTML = language.continue;
    LOADING_TITLE.innerHTML = language.loading;
    BATTLE_TITLE.innerHTML = language.battleShout;
    CONTINUE_BUTTON.innerHTML = language.continue;
    RESTART_BUTTON.innerHTML = language.restart;
    document.getElementById('player-title').innerHTML = language.player;
    document.getElementById('enemy-title').innerHTML = language.enemy;
    document.getElementById('attacks-select-title').innerHTML = language.attacksSelect;
    PLAYER_BATTLE_WINS.innerHTML = language.victories + ": 0";
    ENEMY_BATTLE_WINS.innerHTML = language.victories + ": 0";

    const buttons = document.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('mouseenter', playButtonSelectSound);

        if (buttons[i].id === PET_SELECT_BUTTON.id) {
            continue;
        }
        
        buttons[i].addEventListener('click', playButtonClickSound);
    }

    PET_SELECT_BUTTON.addEventListener('click', () => { confirmPlayerPet(); });
    CONTINUE_BUTTON.addEventListener('click', () => { unloadBattle(); loadMap(); });
    RESTART_BUTTON.addEventListener('click', () => { leaveParty(); location.reload(); });

    MOVE_CONTROLLS.addEventListener('touchstart', handleTouchpadStart);
    MOVE_CONTROLLS.addEventListener('touchend', handleTouchpadEnd);
    MOVE_CONTROLLS.addEventListener('touchmove', handleTouchpadMove);
    MOVE_CONTROLLS.addEventListener('touchcancel', handleTouchpadEnd);

    document.addEventListener('touchstart', () => isTouchDevice = true );

    HELP_CLOSE_BUTTON.addEventListener('click', closeHelpPanel);

    startGame();
}

function startGame() {
    HELP_SECTION.style.display = 'none';
    MAP_SECTION.style.display = 'none';
    BATTLE_SECTION.style.display = 'none';
    END_BATTLE_BUTTONS.style.display = 'none';

    addPetCards()
}

/** Adds the pet cards for pet selection to the DOM. */
function addPetCards() {

    mokepons.forEach((mokepon) => {
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

    PET_CARDS.addEventListener('change', selectPlayerPet);

    const petCardElements = PET_CARDS.getElementsByClassName('pet-card');
    for(var i = 0; i < petCardElements.length; i++) {
        petCardElements[i].addEventListener('mouseenter', playButtonSelectSound);
    }
}

/**
 * Sets the player pet from the pet card selected.
 * @param {Event} e Pet card selected event.
 */
function selectPlayerPet(e) {
    const petSelectedInput = e.target;
    PLAYER.pet = mokepons.find(mokepon => `radio-${mokepon.name.toLowerCase()}` == petSelectedInput.id);
    playButtonClickSound();
}

/** Confirms the player pet selected. */
function confirmPlayerPet() {

    if (PLAYER.pet == undefined) {
        alert('Selecciona una mascota antes de continuar.');
        return;
    }

    PLAYER_PET_NAME.innerHTML = PLAYER.pet.name;
    PLAYER_PET_IMAGE.src = PLAYER.pet.imageURL;

    GAME_START_SOUND.play();

    joinOnlineParty();
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

        attackButton.addEventListener('mouseenter', playButtonSelectSound);
        attackButton.addEventListener('click', () => {
            PLAYER.attackSequence.push(attack)
            attackButton.disabled = true
            playButtonClickSound();

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

    // Resets animations
    LOADING_TRANSITION.style.animation = 'none';
    LOADING_TITLE.style.animation = 'none';
    LOADING_TRANSITION.offsetHeight;

    // Starts loading transition
    let loadingTransitionDuration = 3;
    LOADING_TRANSITION.style.animation = 'loading-transition-start ' + loadingTransitionDuration*0.5+'s forwards';
    LOADING_TITLE.style.animation = 'loading-title-start ' + loadingTransitionDuration*0.5+'s forwards';

    setTimeout(() => setCanBattle(PLAYER, false, () => {

        MAP_SECTION.style.display = 'flex';
        BACKGROUND_COLOR.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

        // Ends the loading transition
        LOADING_TRANSITION.style.animation = 'loading-transition-end ' + loadingTransitionDuration*0.5+'s';
        LOADING_TITLE.style.animation = 'loading-title-end ' + loadingTransitionDuration*0.5+'s';

        MAP_MUSIC.play();

        window.addEventListener('keydown', updateMovementKeyPressed);
        window.addEventListener('keyup', updateMovementKeyReleased);

        gameLoopInterval = setInterval(updateMap, 1000/60);
        setTimeout(() => setCanBattle(PLAYER, true), 3000);
    }), 1000*loadingTransitionDuration*0.5);
}

/** Updates the map and the players. */
function updateMap() {

    PLAYER.updatePosition();
    SERVER.updatePlayerPosition(PLAYER, checkCollision);
    SERVER.getEnemiesData(PLAYER.id, updateEnemies)
    
    MAP.clearContext();
    MAP.drawBackground();

    enemyPlayers.forEach(enemyPlayer => {
        enemyPlayer.drawPlayer();
    })

    PLAYER.drawPlayer();
}

function checkCollision(enemyData) {
    if (enemyData === null || !PLAYER.canBattle()) {
        return;
    }

    const enemy = enemyPlayers.find(player => player.id === enemyData.id);

    stopMovement();
    clearInterval(gameLoopInterval);
    selectEnemy(enemy);
    PLAYER.battleEnemy = enemy.id;
    enemy.battleEnemy = PLAYER.id;

    unloadMap();
    loadBattle();
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
 * @param {*[]} enemiesData Enemies data.
 */
function updateEnemies(enemiesData) {
    
    enemyPlayers = enemiesData.reduce((enemyPlayers, enemyData) => {

        const enemyPetName = enemyData.mokepon.name || '';

        if (enemyPetName === '') {
            return enemyPlayers;
        }

        let enemyPlayer = new Player();
        enemyPlayer.id = enemyData.id;
        enemyPlayer.pet = mokepons.find(mokepon => mokepon.name === enemyPetName);
        enemyPlayer.position = enemyData.position;
        enemyPlayer.battleEnemy = enemyData.battleEnemy;
        enemyPlayer.isActive = enemyData.isActive;
        enemyPlayer.battleVictories = enemyData.battleVictories;
        enemyPlayers.push(enemyPlayer);
        
        return enemyPlayers;
    }, []);
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
    MAP_MUSIC.stop();
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

    BATTLE_MUSIC.play();

    // Show battle section
    setTimeout(() => {

        BATTLE_RESULT.innerHTML = '';
        END_BATTLE_BUTTONS.style.display = 'none';
        PLAYER_BATTLE_WINS.innerHTML = language.victories+": 0";
        PLAYER_BATTLE_HISTORY.innerHTML = '';
        ENEMY_BATTLE_WINS.innerHTML = language.victories+": 0";
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
        fightResult = tie
    } else if (
        playerAttack.type == FIRE && enemyAttack.type == PLANT || 
        playerAttack.type == WATER && enemyAttack.type == FIRE || 
        playerAttack.type == PLANT && enemyAttack.type == WATER) {
            PLAYER.battleWins++
            fightResult =  win
    } else {
        enemyPlayer.battleWins++
        fightResult =  lose
    }

    displayFightResult(playerAttack, enemyAttack, fightResult)
}

/** Displays the fight result in the battle history. */
function displayFightResult(playerAttack, enemyAttack, fightResult) {
    insertBattleHistoryMessage(PLAYER_BATTLE_HISTORY, playerAttack, fightResult == win)
    insertBattleHistoryMessage(ENEMY_BATTLE_HISTORY, enemyAttack, fightResult == lose)
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
    PLAYER_BATTLE_WINS.innerHTML = language.victories+": "+PLAYER.battleWins;
    ENEMY_BATTLE_WINS.innerHTML = language.victories+": "+enemyPlayer.battleWins;
}

/** Ends the battle, displaying the battle result in the DOM. */
function endBattle() {

    if (enemyPlayer.isActive === false) {
        BATTLE_RESULT.innerHTML = language.enemyDisconnected+', '+win;
        addVictory(PLAYER);
    } else if (PLAYER.battleWins == enemyPlayer.battleWins) {
        BATTLE_RESULT.innerHTML = tie
    } else if (PLAYER.battleWins > enemyPlayer.battleWins) {
        BATTLE_RESULT.innerHTML = win
        addVictory(PLAYER);
        BATTLE_WIN_SOUND.play();
    } else {
        BATTLE_RESULT.innerHTML = lose
        BATTLE_LOSE_SOUND.play();
    }

    BATTLE_MUSIC.stop();

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

function openHelpPanel() {
    HELP_SECTION.style.display = 'block';
}

function closeHelpPanel() {
    HELP_SECTION.style.display = 'none';
}

/** Plays the button select sound (PC only). */
function playButtonSelectSound() {
    if (isTouchDevice) {
        return;
    }

    BUTTON_SELECT_SOUND.stop();
    BUTTON_SELECT_SOUND.play();
}

/** Plays the button clicked sound. */
function playButtonClickSound() {
    BUTTON_CLICK_SOUND.stop();
    BUTTON_CLICK_SOUND.play();
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

window.addEventListener('load', setLanguage);
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