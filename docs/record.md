1. 下载 安装 引入

```shell
npm install three
```

2. 初始化一个场景(scene)和相机(scamera)

```ts
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近的一面
  1000 // 远的一面
)
camera.position.z = 30
```

3. 创建渲染器

```ts
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
```

4. 挂载到 页面

```vue
<script>
function render() {
  renderer.render(scene, camera) // 执行渲染操作
  requestAnimationFrame(render)
}

onMounted(() => {
  if (container.value) {
    container.value.appendChild(renderer.domElement)
    render()
  }
})
</script>

<template>
  <div class="container" />
</template>
```

5. 因为没有东西 所有什么也看不到 所以创建一个集合体

```ts
const geometry = new THREE.SphereGeometry(10, 32, 32) // 创建结合体
const material = new THREE.MeshBasicMaterial({ color: 0x0077FF }) // 创建材质
const sphere = new THREE.Mesh(geometry, material) // 创建球体网格
scene.add(sphere) // 将球体添加到场景中
```

6. 这样的话就能看到东西了

7. 如何能做到让他动起来呢: 控制器

```ts
onMounted(() => {
  let controls: OrbitControls

  if (container.value) {
    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.update()

    container.value.appendChild(renderer.domElement)
    render()
  }
})
```

之前的集合体是球形的 怎么看都看不出来 所以换一个立方体

```js
const geometry = new THREE.BoxGeometry(10, 10, 10)
// 创建材质
const material = new THREE.MeshBasicMaterial(
  {
    color: 0x0000FF, // 设置材质颜色
    transparent: true, // 开启透明
    opacity: 0.5 // 设置透明度
  }
)
```

这时候就能通过鼠标拖动了

8. 再来创建一个坐标辅助器, 来辅助看一下坐标

```js
const axesHelper = new THREE.AxesHelper(150)
scene.add(axesHelper)
```

9. 如何做一个 VR 看房呢

> 现在立方体都有了 想 VR 看房把图纸贴到墙上活动眼珠子不就能看了

```ts
const materials: THREE.MeshBasicMaterial[] = []
const texture_right = new THREE.TextureLoader().load('')
materials.push(new THREE.MeshBasicMaterial({ map: texture_right }))

const texture_left = new THREE.TextureLoader().load('')
materials.push(new THREE.MeshBasicMaterial({ map: texture_left }))

const texture_up = new THREE.TextureLoader().load('')
materials.push(new THREE.MeshBasicMaterial({ map: texture_up }))

const texture_down = new THREE.TextureLoader().load('')
materials.push(new THREE.MeshBasicMaterial({ map: texture_down }))

const texture_front = new THREE.TextureLoader().load('')
materials.push(new THREE.MeshBasicMaterial({ map: texture_front }))

const texture_back = new THREE.TextureLoader().load('')
materials.push(new THREE.MeshBasicMaterial({ map: texture_back }))
```

这样的话墙纸是贴在外面的 怎么能放在里面呢

```ts
sphere.geometry.scale(1, 1, -1)
```

这样的话视角有点问题，调整一下视角

```ts
camera.position.set(0, 0, 0.1)
```
