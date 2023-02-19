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

        this.speedx = 600;
        this.speedy = -1200;

        this.ctx = this.root.game_map.ctx;

        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        this.status = 0;  // 0 站立 1 前进 2 后退 3 攻击 4 跳跃 5 挨打 6 死亡

        this.animations = new Map();

        this.direction = 1;

        this.frame_current_cnt = 0;

    }
    start() {

    }

    update_control() {
        let w, a, d, space;

        if (this.id == 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        if (this.status === 0 || this.status === 1) {
            if (space) {
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (w) {
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 4;
                this.frame_current_cnt = 0;
            } else if (d) {
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {
                this.vx = -this.speedx;
                this.status = 1;
            } else {
                this.vx = 0;
                this.status = 0;
            }
        }

    }

    update_move() {
        this.vy += this.gravity;

        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            if (this.status == 4) this.status = 0;
        }

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }

    update() {
        this.update_control();

        this.update_move();

        this.render();


    }

    render() {
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);
        let status = this.status;

        if (this.status === 1 && this.direction * this.vx < 0) status = 2;

        let obj = this.animations.get(status);
        if (obj && obj.loaded) {
            let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
            let image = obj.gif.frames[k].image;
            this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
        }

        this.frame_current_cnt++;
    }
}
