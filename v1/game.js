const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#87CEEB', // Light blue background
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let bird, sling, slingPoint, isDragging = false;

function preload() {
    // Using placeholder images from a reliable source
    this.load.image('bird', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Angry_Bird.svg/1200px-Angry_Bird.svg.png');
    this.load.image('block', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/1x1.png/600px-1x1.png');
    this.load.image('background', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Sky_background.svg/1920px-Sky_background.svg.png');
}

function create() {
    // Background
    this.add.image(config.width / 2, config.height / 2, 'background').setDisplaySize(config.width, config.height);

    // Create a bird
    bird = this.matter.add.image(150, config.height - 150, 'bird').setCircle().setBounce(0.5).setScale(0.1).setInteractive();
    
    // Disable bird's gravity until it's launched
    bird.body.ignoreGravity = true;

    // Create the slingshot constraint
    slingPoint = { x: 150, y: config.height - 150 };
    sling = this.matter.add.constraint(bird, slingPoint, 0, 1, {
        pointA: { x: 0, y: 0 },
        pointB: { x: 0, y: 0 },
    });

    // Blocks for the level
    createLevel(this);

    // Mouse drag functionality for the bird
    this.input.on('pointerdown', (pointer) => {
        if (Phaser.Geom.Intersects.RectangleToRectangle(pointer, bird.getBounds())) {
            isDragging = true;
            bird.body.ignoreGravity = true;
        }
    });

    this.input.on('pointermove', (pointer) => {
        if (isDragging) {
            bird.setPosition(pointer.x, pointer.y);
        }
    });

    this.input.on('pointerup', (pointer) => {
        if (isDragging) {
            isDragging = false;
            this.matter.world.remove(sling);
            bird.body.ignoreGravity = false;

            // Add a slight delay to apply force for a realistic launch
            this.time.delayedCall(50, () => {
                let angle = Phaser.Math.Angle.Between(bird.x, bird.y, slingPoint.x, slingPoint.y);
                let distance = Phaser.Math.Distance.Between(bird.x, bird.y, slingPoint.x, slingPoint.y);
                bird.setVelocity(Math.cos(angle) * distance * 0.1, Math.sin(angle) * distance * 0.1);
            }, null, this);
        }
    });
}

function createLevel(scene) {
    let blockPositions = [
        { x: config.width - 200, y: config.height - 100 },
        { x: config.width - 150, y: config.height - 100 },
        { x: config.width - 175, y: config.height - 150 },
    ];

    blockPositions.forEach(pos => {
        scene.matter.add.image(pos.x, pos.y, 'block').setScale(2, 0.5).setStatic(true);
    });
}

function update() {
    // Check if the bird has fallen off the screen
    if (bird.y > config.height + 100) {
        resetBird();
    }
}

function resetBird() {
    bird.setPosition(150, config.height - 150);
    bird.setVelocity(0, 0);
    bird.setAngularVelocity(0);
    bird.setAngle(0);

    bird.body.ignoreGravity = true;

    // Reattach the bird to the slingshot
    sling = game.scene.scenes[0].matter.add.constraint(bird, slingPoint, 0, 1, {
        pointA: { x: 0, y: 0 },
        pointB: { x: 0, y: 0 },
    });
}
