import { GameMap } from '/static/js/game_map/base.js';
import { Naluto } from '/static/js/player/naluto.js';

class KOF {
    constructor(id) {
        this.$kof = $('#' + id);

        this.game_map = new GameMap(this);
        this.players = [
            new Naluto(this, {
                id: 0,
                x: 200,
                y: 0,
                width: 100,
                height: 200,
                color: 'blue',
            }),
            new Naluto(this, {
                id: 1,
                x: 900,
                y: 0,
                width: 100,
                height: 200,
                color: 'red',
            }),
        ]
    }
}

export {
    KOF
}