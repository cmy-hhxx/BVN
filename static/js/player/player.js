import { GameObject } from "/static/js/game_object/base.js";

export class Player extends GameObject {
    constructor(root, info) {
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;

        this.color = info.color;
        this.vx = 0;
        this.vy = 0;

        this.gravity = 50;

        this.speedx = 400;
        this.speedy = 1000;

        this.ctx = this.root.game_map.ctx;

    }
    start() {

    }

    move() {
        this.vy += this.gravity;

        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
        }
    }

    update() {

        this.move();

        this.render();


    }

    render() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
