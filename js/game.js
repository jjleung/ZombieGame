(Phaser => {
  console.log(Phaser);
  const GAME_WIDTH = window.innerWidth;
  const GAME_HEIGHT = window.innerHeight;
  const GAME_CONTAINER_ID = 'game';
  const GFX = 'gfx';
  const ZOMBIES = 'zombies';
  const INITIAL_MOVESPEED = 4;
  const PLAYER_BULLET_SPEED = 6;
  const ENEMY_SPAWN_FREQ = 600;
  const ZOMBIE_SPAWN_FREQ = 5000;
  const ENEMY_SPEED = 4.5;
  const ENEMY_FIRE_FREQ = 30;
  const ENEMY_MOVE_ACCEL = 20;
  const SQRT_TWO = Math.sqrt(2);
  const randomGenerator = new Phaser.RandomDataGenerator();

  
  const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, GAME_CONTAINER_ID, {preload, create, update});

  let player;
  let cursors;
  let playerBullets;
  let enemies;
  let zombies;
  let frameNames;

  function preload(){
    game.load.spritesheet(GFX, '../assets/shmup-spritesheet-140x56-28x28-tile.png', 28, 28);
    game.load.spritesheet(ZOMBIES, '../assets/tiny-zombies.png', 30, 33, 96)
  };

  function create(){
    game.physics.startSystem(Phaser.Physics.ARCADE);

    cursors = game.input.keyboard.createCursorKeys();
    cursors.fire = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    cursors.fire.onUp.add( handlePlayerFire );

    player = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GFX,8);
    player.moveSpeed = INITIAL_MOVESPEED;
    player.anchor.setTo(0.5,0.5);
    playerBullets = game.add.group();

    enemies = game.add.group();
    enemies.enableBody = true;
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;

  };

  function update(){
    handlePlayerMovement();
    handleBulletAnimations();
    cleanup();
    randomlySpawnEnemy();
    handleEnemyActions();
    handleCollisions();
    zombieAnimations();
  };

  //handler functions

  function zombieAnimations() {
    zombies = game.add.group();
    for (var i = 0; i < 25; i++){
      if (randomGenerator.between(0, ZOMBIE_SPAWN_FREQ) === 0) {
        let randomY = randomGenerator.between(0, GAME_HEIGHT);
        let randomX = randomGenerator.between(0, GAME_WIDTH);
        zombies.create(randomX, randomY, ZOMBIES, 0);
      }
      zombies.callAll('animations.add', 'animations', 'walk', [0, 1, 2], 5, true);
      zombies.callAll('animations.play', 'animations', 'walk');
    }
}


  function handlePlayerMovement() {
    let movingH = SQRT_TWO;
    let movingV = SQRT_TWO;
    if( cursors.up.isDown || cursors.down.isDown){
      movingH = 1; // slow down diagonal movement
    }
    if( cursors.left.isDown || cursors.right.isDown){
      movingV = 1; // slow down diagonal movement
    }
    switch( true ){
      case cursors.left.isDown:
        player.angle += -4;
        break;
      case cursors.right.isDown:
        player.angle += 4;
        break;
    }
  };

  function radians(degrees){
    return degrees * Math.PI /180;
  }

  function handlePlayerFire() {
    playerBullets.add(game.add.sprite(player.x, player.y, GFX, 7));
  };

  function handleBulletAnimations(){
    playerBullets.children.forEach( (bullet, index, array) => {
      if(index === array.length - 1){
         bullet.x -= Math.cos(radians(player.angle+90))*PLAYER_BULLET_SPEED;
        bullet.y -= Math.sin(radians(player.angle+90))*PLAYER_BULLET_SPEED;
      }
      
    } );
  }

  function handlePlayerHit() {
    gameOver();
  };

  function handleCollisions() {
    // check if any bullets touch any enemies
    let enemiesHit = enemies.children
      .filter( enemy => enemy.alive )
      .filter( enemy => 
        playerBullets.children.some( 
          bullet => enemy.overlap(bullet) 
        ) 
      );

    if( enemiesHit.length ){
      // clean up bullets that land
      playerBullets.children
        .filter( bullet => bullet.overlap(enemies) )
        .forEach( removeBullet );

      enemiesHit.forEach( destroyEnemy );
    }
      // check if enemies hit the player
      enemiesHit = enemies.children
      .filter( enemy => enemy.overlap(player) );
  
    if( enemiesHit.length){
      handlePlayerHit();

      enemiesHit.forEach( destroyEnemy );
    }
  };

  //behavior functions
  function randomlySpawnEnemy() {
    if(randomGenerator.between(0, ENEMY_SPAWN_FREQ) === 0) {
      let randomX = randomGenerator.between(0, GAME_WIDTH);
      enemies.add( game.add.sprite(randomX, -24, ZOMBIES, 0));
    }
    if(randomGenerator.between(0, ENEMY_SPAWN_FREQ) === 0) {
      let randomX = randomGenerator.between(0, GAME_WIDTH);
      enemies.add( game.add.sprite(randomX, GAME_HEIGHT +24, ZOMBIES, 0) );
      

    }
    if(randomGenerator.between(0, ENEMY_SPAWN_FREQ) === 0) {
      let randomY = randomGenerator.between(0, GAME_HEIGHT);
      enemies.add( game.add.sprite(-24, randomY, ZOMBIES, 0));
    }
    if(randomGenerator.between(0, ENEMY_SPAWN_FREQ) === 0) {
      let randomY = randomGenerator.between(0, GAME_HEIGHT);
      enemies.add( game.add.sprite(GAME_WIDTH+24, randomY, ZOMBIES, 0));
    }
  }

  function handleEnemyActions() {
    enemies.children.forEach( zombie => {
      game.physics.arcade.accelerateToObject(zombie, player, ENEMY_MOVE_ACCEL);
    });
  }


  //utility functions
  function cleanup() {
    playerBullets.children
      .filter( bullet => bullet.y < -14 )
      .forEach( bullet => bullet.destroy() );
  };

  function removeBullet(bullet) {
    bullet.destroy();
  }

  function destroyEnemy(enemy) {
    enemy.kill();
  }

  function gameOver() {
    game.state.destroy();
    game.add.text(GAME_WIDTH/2 , 200, 'YOUR HEAD ASPLODE', { fill: '#FFFFFF' });
    let playAgain = game.add.text(GAME_WIDTH/2, 300, `Play Again`, { fill: `#FFFFFF` });
    playAgain.inputEnabled = true;
    playAgain.events.onInputUp.add(() => window.location.reload());
  }

})(window.Phaser);