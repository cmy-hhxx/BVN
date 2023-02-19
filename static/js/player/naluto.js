import { Player } from '/static/js/player/player.js';
import { GIF } from '/static/js/utils/gif.js';

export class Naluto extends Player {
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    init_animations() {
        let outer = this;

        let offsets = [0, 45, -26, 0, 0, 0, 60];
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/naluto/${i}.gif`);
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0,
                frame_rate: 5,
                offset_y: offsets[i],
                loaded: false,
                scale: 3,
            });

            gif.onload = function () {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;

                if (i == 4) {
                    obj.frame_rate = 8;
                }
                if (i == 3) {
                    obj.frame_rate = 2;
                }
            }
        }
    }
}