# 死神vs火影 Web版

基于Canvas和原生JavaScript实现的2D格斗游戏，重现经典的死神vs火影游戏体验。

## 功能特性

- **角色控制**：流畅的移动、跳跃、攻击操作
- **战斗系统**：碰撞检测、血量扣减、状态管理
- **视觉效果**：GIF动画渲染、血量条动画、计时器
- **双人对战**：支持同屏双人游戏

## 项目架构

```
BVN/
├── static/
│   ├── css/           # 样式文件
│   ├── images/        # 游戏素材
│   └── js/
│       ├── base.js         # 游戏主类
│       ├── controller/     # 输入控制
│       ├── game_map/       # 地图管理
│       ├── game_object/    # 基础游戏对象
│       ├── player/         # 角色逻辑
│       └── utils/          # GIF处理工具
└── templates/
    └── index.html     # 游戏入口
```

![项目结构](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220114905709.png)

![整体架构](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220114040474.png)

## 核心技术实现

### 游戏循环与对象管理

采用`requestAnimationFrame`实现60fps的游戏循环，通过`GAME_OBJECTS`数组统一管理所有游戏对象：

```javascript
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
```

### 状态机设计

角色行为通过状态机控制，包含7种状态：

| 状态 | 描述 | 可转换状态 |
|------|------|------------|
| 0 | 静止 | 1,2,3,4 |
| 1 | 前进 | 0,2,3,4 |
| 2 | 后退 | 0,1,3,4 |
| 3 | 攻击 | 0,1,2 |
| 4 | 跳跃 | 0,1,2 |
| 5 | 受击 | 0,6 |
| 6 | 死亡 | 终态 |

![状态机图](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122043080.png)

### 输入处理

使用Set结构实时记录按键状态，支持组合键操作：

```javascript
// 玩家1: WASD + 空格
// 玩家2: 方向键 + 回车
this.pressed_keys.add(e.key);  // 按下时添加
this.pressed_keys.delete(e.key);  // 松开时删除
```

### 碰撞检测

基于AABB包围盒算法实现攻击判定：

```javascript
is_collided(r1, r2) {
    if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) return false;
    if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) return false;
    return true;
}
```

![碰撞检测示意图](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220123007438.png)

### GIF动画渲染

使用第三方库解析GIF帧，实现流畅的角色动画：

```javascript
let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
let image = obj.gif.frames[k].image;
this.ctx.drawImage(image, this.x, this.y + obj.offset_y, 
                  image.width * obj.scale, image.height * obj.scale);
```

游戏效果展示：

![游戏截图1](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122548595.png)

![游戏截图2](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122647690.png)

![游戏截图3](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122701121.png)

![游戏截图4](https://raw.githubusercontent.com/cmy-hhxx/cloudpic/main/img/image-20230220122715964.png)

## 控制说明

| 操作 | 玩家1 | 玩家2 |
|------|-------|-------|
| 移动 | A/D | ←/→ |
| 跳跃 | W | ↑ |
| 攻击 | 空格 | 回车 |

## 开发要点

1. **模块化设计**：按功能拆分JS文件，提高代码可维护性
2. **面向对象**：合理使用继承，`Player`类继承`GameObject`基类
3. **性能优化**：避免频繁DOM操作，使用Canvas渲染提升性能
4. **边界处理**：完善的边界碰撞检测，防止角色越界



## 快速开始

1. 克隆项目到本地
2. 使用本地服务器运行（如Live Server、Python http.server等）
3. 访问`index.html`开始游戏

> **注意**：由于使用ES6模块，需要通过HTTP服务器访问，不能直接双击打开HTML文件

## 技术栈
- **前端**：原生JavaScript (ES6)、HTML5 Canvas、CSS3
- **动画**：GIF解析与渲染
- **架构**：面向对象编程、状态机模式