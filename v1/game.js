const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: true
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
    this.load.image('bird', 'https://i.imgur.com/6upGd3B.png');
    this.load.image('block', 'https://i.imgur.com/kyPl9L1.png');
    this.load.image('background', 'https://i.imgur.com/lM1IHGf.png');
}

function create() {
    // Background
    this.add.image(400, 300, 'background');

    // Create a bird
    bird = this.matter.add.image(150, 450, 'bird').setCircle().setBounce(0.5).setInteractive();
    
    // Disable bird's gravity until it's launched
    bird.body.ignoreGravity = true;

    // Create the slingshot constraint
    slingPoint = { x: 150, y: 450 };
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
        { x: 600, y: 500 },
        { x: 650, y: 500 },
        { x: 625, y: 450 },
    ];

    blockPositions.forEach(pos => {
        scene.matter.add.image(pos.x, pos.y, 'block').setStatic(true);
    });
}

function update() {
    // Check if the bird has fallen off the screen
    if (bird.y > config.height + 100) {
        resetBird();
    }
}

function resetBird() {
    bird.setPosition(150, 450);
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
