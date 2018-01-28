(Phaser => {
  console.log(Phaser);
  const GAME_WIDTH = window.innerWidth;
  const GAME_HEIGHT = window.innerHeight;
  const GAME_CONTAINER_ID = 'game';
  const GFX = 'gfx';
  const INITIAL_MOVESPEED = 4;
  const SQRT_TWO = Math.sqrt(2);
  const PLAYER_BULLET_SPEED = 8;
  const ENEMY_SPAWN_FREQ = 100;
  const randomGenerator = new Phaser.RandomDataGenerator();
  const ENEMY_SPEED = 4.5;
  
  const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, GAME_CONTAINER_ID, {preload, create, update});

  let player;
  let cursors;
  let playerBullets;
  let enemies;
  let wKey;
  let aKey;
  let sKey;
  let dKey;

  function preload(){
    game.load.spritesheet(GFX, '../assets/shmup-spritesheet-140x56-28x28-tile.png', 28, 28);
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
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    cursors._up = wKey;
    cursors._left = aKey;
    cursors._down = sKey;
    cursors._right = dKey;
    enemies.enableBody = true;
  };

  function update(){
    handlePlayerMovement();
    handleBulletAnimations();
    cleanup();
    randomlySpawnEnemy();
    handleEnemyActions();
    handleCollisions();
  };

  //handler functions


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
    switch( true ){
      case cursors._down.isDown:
        player.y += player.moveSpeed;
        break;
      case cursors._up.isDown:
        player.y -= player.moveSpeed;
        break;
    }
  };

  function radians(degrees){
    return degrees * Math.PI /180;
  }

  function handlePlayerFire() {
    if(playerBullets.children.length <6){
      playerBullets.add(game.add.sprite(player.x, player.y, GFX, 7));
    }
    
   };

  function handleBulletAnimations(){
    playerBullets.children.forEach( (bullet, index, array) => {
        bullet.x -= Math.cos(radians(player.angle+90))*PLAYER_BULLET_SPEED;
        bullet.y -= Math.sin(radians(player.angle+90))*PLAYER_BULLET_SPEED;
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
      enemies.add( game.add.sprite(randomX, -24, GFX, 0));
    }
  }

  function handleEnemyActions() {
    enemies.children.forEach( enemy => enemy.y += ENEMY_SPEED );
  };

  //utility functions
  function cleanup() {
    playerBullets.children
      .filter( bullet => bullet.y < 0 )
      .forEach( bullet => bullet.destroy() );
    playerBullets.children
      .filter( bullet => bullet.x < 0 )
      .forEach( bullet => bullet.destroy() );
    playerBullets.children
    .filter( bullet => bullet.x > GAME_WIDTH )
    .forEach( bullet => bullet.destroy() );
    playerBullets.children
      .filter( bullet => bullet.y > GAME_HEIGHT )
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
    game.add.text(GAME_WIDTH/2 , 200, 'YOU HAVE BEEN EATED', { fill: '#FFFFFF' });
    let playAgain = game.add.text(GAME_WIDTH/2, 300, `Play Again`, { fill: `#FFFFFF` });
    playAgain.inputEnabled = true;
    playAgain.events.onInputUp.add(() => window.location.reload());
  }

})(window.Phaser);