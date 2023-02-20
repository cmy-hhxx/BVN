# 死神vs火影复刻

## 项目结构

静态文件放在static目录下

js目录下按照对象命名，用于构建代码逻辑

![image-20230220114905709](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220114905709.png)

html文件放在templates目录下

![structure](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220114040474.png)

## 项目预计实现效果

1. 人物移动、跳跃、攻击
2. 血量条效果
3. 计时器效果

## 项目开发过程

### 页面布局

一个div盒子里，通过canvas来渲染人物动画

### CSS样式

设置盒子尺寸1280px * 720px

添加背景图片，血量条和计时器盒子嵌套在最外层div中

将血量条和计时器的盒子放在game_map目录下的js脚本中

### 角色移动逻辑

使用canvas来渲染角色，起初先使用矩形来模拟人物，动画都是一帧一帧组成的，通过查询requestAnimationFrame的使用方法，传入一个不断递归的函数参数，实现动画的不断刷新。

该函数参数一方面判断有无执行，一方面更新时间戳，进入下一帧。```GAME_OBJECTS```是玩家对象类型的列表，（可以是玩家，也可以是其他类型的游戏对象，后面创建的```Player```类继承这个```GameObject```类） ```has_call_start```缺省值为```false```

```js
let last_timestamp;

let GAME_OBJECTS_FRAME = (timestamp) => {
    for (let obj of GAME_OBJECTS) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;
    requestAnimationFrame(GAME_OBJECTS_FRAME);
}

requestAnimationFrame(GAME_OBJECTS_FRAME);
```

新建```GameMap```类和```Controller```类，作为地图和玩家控制器，为了使地图里的canvas能够接收用户键盘输入，需要在标签上加入```tabindex = 0```的属性

Controller类实现了监听键盘按键的事件，预先定义好一个Set，将key存在set里，如果松开就将key删掉

```js
export class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;

        this.pressed_keys = new Set();
        this.start();
    }

    start() {
        let outer = this;

        this.$canvas.keydown(function (e) {
            outer.pressed_keys.add(e.key);
            console.log(e.key);
        });

        this.$canvas.keyup(function (e) {
            outer.pressed_keys.delete(e.key);
        });
    }
}
```

新建```Player```类，这里存储角色的一切信息（包括出生坐标，水平速度加速度，竖直速度加速度，重力，装填等）和处理逻辑

移动的输入已经可以拿到，要通过这些按键来控制角色的移动，同时还要做边界的特判，防止角色走出地图外部。

```js
 update_control() {
        let w, a, d, space;
		
     	// 拿到输入
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

     	// 做出判断，判定状态
        if (this.status === 0 || this.status === 1) {
            if (space) {
                this.status = 3;
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

        // 角色移动
        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        // 边界碰撞检测
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

```

上述代码中的状态是预先抽象出来的，角色分为7个状态，可以画出角色的状态机。

状态0代表静止，1代表向前移动，2代表向后移动，3代表攻击，4代表跳跃，5代表挨打，6代表死亡。

其中状态0,1,2,3,4,5可以循环，6不能循环，且状态6到任何一个状态没有边

![image-20230220122043080](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122043080.png)

### 用GIF渲染，代替方块

在canvas里渲染gif动图，原理是需要写一个gif处理脚本，将动画一帧一帧的拿出来，再一帧一帧的渲染，为了不重复造轮子，使用了stackoverflow上引用了```Blindman67```的js代码，放在utils类中

```js
let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
let image = obj.gif.frames[k].image;  // 将分割后的每一帧图片拿出来
this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
```

![image-20230220122548595](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122548595.png)

![image-20230220122647690](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122647690.png)

![image-20230220122701121](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122701121.png)

![image-20230220122715964](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122715964.png)

通过状态机和转换，已经可以成功实现前进后退跳跃攻击的渲染了

### 设置攻击和碰撞检测

在出拳的时候检测是否碰撞到对方，如果碰撞到，就扣除能量值。

再次将角色抽象成矩形，拳头抽象成离角色一定距离的小矩形，当小矩形和角色矩形有交集的时候，判定攻击有效。

![image-20230220123007438](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220123007438.png)

```js
this.ctx.fillStyle = this.color;
this.ctx.fillRect(this.x, this.y, this.width, this.height);
let status = this.status;
if (this.direction > 0) {
    this.ctx.fillStyle = 'purple';
    this.ctx.fillRect(this.x + 110, this.y + 20, 60, 30);

} else {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(this.x + this.width - 60 - 60, this.y + 20, 60, 30);
}
```

通过矩形是否重叠来判断攻击是否有效，这里是平面判断，因此只要判断端点即可。```r1 r2```分别代表两个角色，里面存储角色坐标信息。

```js
    is_collided(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))
            return false;
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))
            return false;

        return true;
    }
```

### 实现血条管理

给Player对象添加hp属性，当血量<= 0 时，转化为死亡状态即可。

```js
is_attcked() {
        if (this.status === 6) return;
        this.status = 5;
        this.frame_current_cnt = 0;
        this.hp = Math.max(this.hp - 20, 0);

    	// 血条内部盒子渐变效果-红色
        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 300);
		
    	// 血条内部盒子渐变效果-绿色
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 600);
        if (this.hp <= 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }
```

### 实现计时器

每一帧更新时间即可，在game_map下拿到盒子，修改text。

```js
this.time_left = 60000;
this.$timer = this.root.$kof.find(`.kof-head-timer`);  // 将div找出来


this.time_left -= this.timedelta;  // 剩余时间
if (this.time_left < 0) {
    this.time_left = 0;

    let [a, b] = this.root.players;
    if (a.status !== 6 && b.status !== 6) {
        a.status = b.status = 6;
        a.frame_current_cnt = b.fame_current_cnt = 0;
        a.vx = b.vx = 0;
    }
}

this.$timer.text(parseInt(this.time_left / 1000));
this.render();
```



## 项目总结

逻辑是最重要的，为了避免代码成为屎山，需要提前构思好逻辑，巧妙利用好搜索引擎。