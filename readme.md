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