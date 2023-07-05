let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 560,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let snake, food, grass;
let cursors;
let gameOverImg, gameStartImg;

//  Direction consts
let UP = 'up';
let DOWN = 'down';
let LEFT = 'left';
let RIGHT = 'right';

let game = new Phaser.Game(config);

function preload() {
  this.load.script(
    'webfont',
    'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
  );

  this.load.image('ground', 'assets/ground.png');
  this.load.image('grass', 'assets/grass.png');

  this.load.image('cherry', 'assets/cherry.png');
  this.load.image('apple', 'assets/apple.png');

  this.load.image('body', 'assets/body.png');
  this.load.spritesheet('head-sprite', 'assets/head-sprite.png', {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.image('game-over', 'assets/game-over.png');
  this.load.image('game-start', 'assets/game-start.jpg');

  this.load.audio('sfx', ['assets/sf_mix.ogg', 'assets/sf_mix.mp3']);
}

const markers = [
  { name: 'turn', start: 9, duration: 0.1, config: {} },
  { name: 'death', start: 17, duration: 1.0, config: {} },
  { name: 'eat', start: 19, duration: 0.3, config: {} },
];

function create() {
  this.add.image(320, 280, 'ground');

  grass = this.add.image(320, 240, 'grass');

  const Food = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,

    initialize: function Food(scene, x, y) {
      Phaser.GameObjects.Image.call(this, scene);

      this.setTexture('cherry');

      this.setPosition(x * 16, y * 16);
      this.setOrigin(0);

      this.total = 0;
      this.points = 0;

      scene.children.add(this);
    },

    eat: function () {
      //this.sound.play('sfx', markers['eat']);

      this.total++;

      //every 5th piece of food brings 3 points instead of 1
      if (this.total % 5 === 0) {
        this.points += 3;
      } else this.points++;

      // score == points * 10
      scoreText.setText('Score: ' + this.points * 10);
    },
  });

  const Snake = new Phaser.Class({
    initialize: function Snake(scene, x, y) {
      this.headPosition = new Phaser.Geom.Point(x, y);

      this.body = scene.add.group();

      // this.head = this.body.create(x * 16, y * 16, 'head');
      this.head = scene.add.sprite(x * 16, y * 16, 'head-sprite');
      this.head.setFrame(1);

      this.body.add(this.head);

      this.head.setOrigin(0);

      this.alive = true;

      this.speed = 120;

      this.moveTime = 0;

      this.tail = new Phaser.Geom.Point(x, y);

      this.heading = RIGHT;
      this.direction = RIGHT;
    },

    update: function (time) {
      if (time >= this.moveTime) {
        return this.move(time);
      }
    },

    faceLeft: function () {
      if (this.direction === UP || this.direction === DOWN) {
        this.heading = LEFT;
        this.head.setFrame(0);
      }
    },

    faceRight: function () {
      if (this.direction === UP || this.direction === DOWN) {
        this.heading = RIGHT;
        this.head.setFrame(1);
      }
    },

    faceUp: function () {
      if (this.direction === LEFT || this.direction === RIGHT) {
        this.heading = UP;
        this.head.setFrame(2);
      }
    },

    faceDown: function () {
      if (this.direction === LEFT || this.direction === RIGHT) {
        this.heading = DOWN;
        this.head.setFrame(3);
      }
    },

    move: function (time) {
      //
      //  * Based on the heading property (which is the direction the pgroup pressed)
      //  * we update the headPosition value accordingly.
      //  *
      //  * The Math.wrap call allow the snake to wrap around the screen, so when
      //  * it goes off any of the sides it re-appears on the other.
      //
      switch (this.heading) {
        case LEFT:
          this.headPosition.x = Phaser.Math.Wrap(
            this.headPosition.x - 1,
            0,
            40
          );
          break;

        case RIGHT:
          this.headPosition.x = Phaser.Math.Wrap(
            this.headPosition.x + 1,
            0,
            40
          );
          break;

        case UP:
          this.headPosition.y = Phaser.Math.Wrap(
            this.headPosition.y - 1,
            0,
            30
          );
          break;

        case DOWN:
          this.headPosition.y = Phaser.Math.Wrap(
            this.headPosition.y + 1,
            0,
            30
          );
          break;
      }

      this.direction = this.heading;

      //  Update the body segments and place the last coordinate into this.tail
      Phaser.Actions.ShiftPosition(
        this.body.getChildren(),
        this.headPosition.x * 16,
        this.headPosition.y * 16,
        1,
        this.tail
      );

      //  Check to see if any of the body pieces have the same x/y as the head
      //  If they do, the head ran into the body
      let hitBody = Phaser.Actions.GetFirst(
        this.body.getChildren(),
        { x: this.head.x, y: this.head.y },
        1
      );

      if (hitBody) {
        this.alive = false;

        return false;
      } else {
        //  Update the timer ready for the next movement
        this.moveTime = time + this.speed;

        return true;
      }
    },

    grow: function (count = 1) {
      for (let i = 0; i < count; i++) {
        const newPart = this.body.create(this.tail.x, this.tail.y, 'body');

        newPart.setOrigin(0);
      }
    },

    collideWithFood: function (food) {
      if (this.head.x === food.x && this.head.y === food.y) {
        this.grow(5);

        food.eat();

        //  For every 5 items of food eaten we'll increase the snake speed a little
        if (this.speed > 20 && food.total % 5 === 0) {
          this.speed -= 20;
          currentSpeed.setText('Speed: ' + ((120 - this.speed) / 20 + 1));
        }

        return true;
      } else {
        return false;
      }
    },

    updateGrid: function (grid) {
      //  Remove all body pieces from valid positions list
      this.body.children.each(function (segment) {
        let bx = segment.x / 16;
        let by = segment.y / 16;

        grid[by][bx] = false;
      });

      return grid;
    },

    dead: function () {
      this.body.children.each(segment => segment.setTint(0xff0000));
    },
  });

  food = new Food(
    this,
    Phaser.Math.RND.between(0, 39),
    Phaser.Math.RND.between(0, 29)
  );

  snake = new Snake(
    this,
    Phaser.Math.RND.between(0, 39),
    Phaser.Math.RND.between(0, 29)
  );

  //  Create our keyboard controls
  cursors = this.input.keyboard.createCursorKeys();

  const scene = this.add;

  WebFont.load({
    google: {
      families: ['Orbitron'],
    },
    active: function () {
      const scoreStyle = {
        fontFamily: 'Orbitron',
        fontSize: 25,
        color: '#000000',
      };
      const loaderStyle = {
        fontFamily: 'Orbitron',
        fontSize: 45,
        color: '#000000',
        align: 'center',
      };
      const prevScore = localStorage.getItem('maxScore') || 0;

      startingText = scene.text(
        120,
        150,
        `Snake \n The Fruiteater`,
        loaderStyle
      );
      startingText2 = scene.text(
        100,
        320,
        `Press any key to start the game`,
        scoreStyle
      );

      scoreText = scene.text(10, 490, `Score: 0`, scoreStyle);
      maxScore = scene.text(10, 520, `Max score: ` + prevScore, scoreStyle);
      currentSpeed = scene.text(490, 490, `Speed: 1`, scoreStyle);
    },
  });

  const startImgDestroyed = () => {
    if (gameStartImg) {
      gameStartImg.destroy();
      gameStartImg = null;

      startingText.destroy();
      startingText = null;

      startingText2.destroy();
      startingText2 = null;
    }
  };

  // lets start with a little bit longer snake
  snake.grow(2);

  // add cover image before game starts
  gameStartImg = this.add.image(320, 240, 'game-start');

  // press any key or mouse button to remove the start image
  this.input.on('pointerdown', startImgDestroyed);
  this.input.keyboard.on('keydown', startImgDestroyed);

  // press any key to restart the game
  this.input.keyboard.on('keydown', function () {
    if (!snake.alive) {
      restartGame();
    }
  });
}

function update(time) {
  if (!snake.alive) {
    snake.dead();

    snake.gameOverImg = this.add.image(320, 240, 'game-over');

    storeResultInLocalStorage(food.points * 10);

    return;
  }

  //
  //  * Check which key is pressed, and then change the direction the snake
  //  * is heading based on that. The checks ensure you don't double-back
  //  * on yourself, for example if you're moving to the right and you press
  //  * the LEFT cursor, it ignores it, because the only valid directions you
  //  * can move in at that time is up and down.

  if (cursors.left.isDown) {
    snake.faceLeft();
  } else if (cursors.right.isDown) {
    snake.faceRight();
  } else if (cursors.up.isDown) {
    snake.faceUp();
  } else if (cursors.down.isDown) {
    snake.faceDown();
  }

  if (snake.update(time)) {
    //  If the snake updated, we need to check for collision against food
    if (snake.collideWithFood(food)) {
      repositionFood();
    }
  }
}

//
//  * We can place the food anywhere in our 40x30 grid
//  * *except* on-top of the snake, so we need
//  * to filter those out of the possible food locations.
//  * If there aren't any locations left, they've won!
//  *
//  * @method repositionFood
//  * @return {boolean} true if the food was placed, otherwise false

function repositionFood() {
  //  First create an array that assumes all positions
  //  are valid for the new piece of food

  //  A Grid we'll use to reposition the food each time it's eaten
  let testGrid = [];

  for (let y = 0; y < 30; y++) {
    testGrid[y] = [];

    for (let x = 0; x < 40; x++) {
      testGrid[y][x] = true;
    }
  }

  snake.updateGrid(testGrid);

  //  Purge out false positions
  let validLocations = [];

  for (let y = 0; y < 30; y++) {
    for (let x = 0; x < 40; x++) {
      if (testGrid[y][x] === true) {
        //  Is this position valid for food? If so, add it here ...
        validLocations.push({ x: x, y: y });
      }
    }
  }

  if (validLocations.length > 0) {
    //  Use the RND to pick a random food position
    let pos = Phaser.Math.RND.pick(validLocations);

    // every 5th piece of food is an apple
    if ((food.total + 1) % 5 === 0) {
      food.setTexture('apple');
    } else {
      food.setTexture('cherry');
    }

    //  And place it
    food.setPosition(pos.x * 16, pos.y * 16);

    return true;
  } else {
    return false;
  }
}

function storeResultInLocalStorage(score) {
  const prevScore = localStorage.getItem('maxScore');

  if (score > prevScore || prevScore === null) {
    localStorage.setItem('maxScore', score);
    maxScore.setText('Max score: ' + score);
  }
}

function restartGame() {
  game.destroy(true);
  game = new Phaser.Game(config);
}
