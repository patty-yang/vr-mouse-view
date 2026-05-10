# 时序图

本文档基于当前项目实现整理，拆成两张 Mermaid 时序图：

- 初始化时序图：描述 Vue 组件挂载后，Three.js 场景、房间、导航热点和提示点如何初始化。
- 交互时序图：描述拖拽视角、点击导航热点、点击提示点时的运行链路。

对应实现主要分布在：

- [App.vue](../src/App.vue)
- [use-three-core.ts](../src/composables/use-three-core.ts)
- [use-room.ts](../src/composables/use-room.ts)
- [use-navigation.ts](../src/composables/use-navigation.ts)
- [use-tooltip.ts](../src/composables/use-tooltip.ts)
- [use-scene-event.ts](../src/composables/use-scene-event.ts)
- [config/index.ts](../src/config/index.ts)

## 初始化时序图

```mermaid
sequenceDiagram
    autonumber
    actor User as 用户
    participant App as App.vue
    participant Core as useThreeCore
    participant Room as useRoom
    participant Events as useSceneEvents
    participant Nav as useNavigationSprite
    participant Tip as useTooltip
    participant Scene as THREE.Scene
    participant Camera as THREE.Camera
    participant Renderer as WebGLRenderer
    participant Canvas as renderer.domElement

    User->>App: 打开页面
    App->>Core: useThreeCore(container)
    Core->>Scene: new Scene()
    Core->>Camera: new PerspectiveCamera()
    Core->>Renderer: new WebGLRenderer()
    Core-->>App: 返回 scene / camera / renderer

    App->>Room: useRoom(scene)
    App->>Events: useSceneEvents(camera, container)

    loop 遍历 navigationPoints
        App->>Nav: useNavigationSprite(...)
        Nav->>Scene: add(navigation sprite)
    end

    App->>Tip: useTooltip(scene, camera, points, domElement)
    loop 遍历 tooltipPoints
        Tip->>Scene: add(tooltip sprite)
    end
    Tip-->>App: 返回 reactive tooltip

    Note over App,Tip: 组件 mounted 后执行各 composable 注册的 onMounted

    App->>Core: mountScene()
    Core->>Canvas: appendChild(renderer.domElement)
    Core->>Renderer: setSize(width, height)
    Core->>Core: 绑定 window resize

    loop 渲染循环
        Core->>Renderer: render(scene, camera)
        Core->>Core: requestAnimationFrame(renderLoop)
    end

    App->>Room: onMounted()
    loop 遍历 roomConfigs
        Room->>Scene: 创建 room mesh
        Room->>Scene: add(room mesh)
    end

    App->>Events: onMounted()
    Events->>App: 绑定 mousedown / mouseup / mouseleave / mousemove

    loop 每个导航热点
        App->>Nav: onMounted()
        Nav->>Canvas: 绑定 click
    end

    App->>Tip: onMounted()
    Tip->>Canvas: 绑定 click
    loop tooltip 位置跟踪
        Tip->>Tip: updateTooltipPosition()
        Tip->>Tip: requestAnimationFrame(updateTooltipPosition)
    end
```

## 交互时序图

```mermaid
sequenceDiagram
    autonumber
    actor User as 用户
    participant App as App.vue
    participant Events as useSceneEvents
    participant Nav as useNavigationSprite
    participant Tip as useTooltip
    participant Camera as THREE.Camera
    participant Canvas as renderer.domElement
    participant Raycaster as THREE.Raycaster
    participant GSAP as GSAP
    participant Overlay as tooltip reactive state
    participant Renderer as WebGLRenderer

    alt 拖拽查看场景
        User->>App: mousedown
        App->>Events: handleDragStart()
        Events->>Events: isDragging = true

        User->>App: mousemove
        App->>Events: handleDragMove(event)
        Events->>Camera: 更新 rotation.x
        Events->>Camera: 更新 rotation.y
        Renderer-->>User: 下一帧渲染新视角

        User->>App: mouseup / mouseleave
        App->>Events: handleDragEnd()
        Events->>Events: isDragging = false
    else 点击导航热点
        User->>Canvas: click
        Canvas->>Nav: handleClick(event)
        Nav->>Nav: 计算 pointer
        Nav->>Raycaster: setFromCamera(pointer, camera)
        Nav->>Raycaster: intersectObject(sprite)

        alt 命中导航 sprite
            Nav->>App: onClick()
            App->>GSAP: gsap.to(camera.position, target)
            GSAP->>Camera: 1s 内补间 x / y / z
            Renderer-->>User: 连续渲染相机移动
        else 未命中
            Nav-->>User: 无状态变化
        end
    else 点击提示点
        User->>Canvas: click
        Canvas->>Tip: handleClick(event)
        Tip->>Tip: updatePointer(event)
        Tip->>Raycaster: setFromCamera(pointer, camera)
        Tip->>Raycaster: intersectObjects(tooltip sprites)

        alt 命中 tooltip sprite
            Tip->>Tip: activeSprite = intersection.object
            Tip->>Tip: calculateTooltipState()
            Tip->>Overlay: 更新 content / visible / x / y
            App-->>User: 显示 tooltip 浮层

            loop 后续每一帧
                Tip->>Tip: calculateTooltipState(activeSprite, camera, domElement)
                Tip->>Overlay: 同步 tooltip 屏幕位置
            end
        else 未命中
            Tip->>Overlay: clearTooltip()
            App-->>User: 隐藏 tooltip 浮层
        end
    end
```

## 备注

- 当前房间不是按点击动态加载，而是在初始化阶段一次性把 `living`、`balcony`、`kitchen` 三个盒子空间加入同一个 `Scene`。
- 导航热点和提示点都监听 `renderer.domElement` 上的 `click` 事件，各自独立完成射线检测和后续处理。
