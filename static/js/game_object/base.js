let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.timedelta = 0;
        this.has_call_start = false;


    }

    start() {

    }

    update() {

    }

    destory() {
        for (let i in GameObject) {
            if (GameObject[i] == this) {
                GameObject.splice(i, 1);
                break;
            }
        }

    }
}

let last_timestamp;

let GAME_OBJECTS_FRAME = (timestamp) => {
    for (let obj of GameObject) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            obj.timestamp = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(GAME_OBJECTS_FRAME);
}
requestAnimationFrame(GAME_OBJECTS_FRAME);