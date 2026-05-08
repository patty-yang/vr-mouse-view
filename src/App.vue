<script setup lang="ts">
import { onMounted, reactive, ref, useTemplateRef, type Ref } from 'vue'
import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/Addons.js'
import gsap from 'gsap'
import { clipping } from 'three/src/nodes/accessors/ClippingNode.js'

const scene = new THREE.Scene()  // 初始化一个场景

const container = useTemplateRef('container')
const toolTipContainer = useTemplateRef('toolTipContainer')
const toolTipContent: Ref<Record<string, any>> = ref({
  name: '',
  type: '',
  description: ''
})
const toolipPosition = ref({
  left: '-100%',
  top: '-100%'
})

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近的一面 
  1000 // 远的一面
)

// 设计相机的位置
// camera.position.z = 30
camera.position.set(0, 0, .1)
// let controls: OrbitControls

const renderer = new THREE.WebGLRenderer() // 创建渲染器
renderer.setSize(window.innerWidth, window.innerHeight) // 设置渲染器的大小

// 创建球体
// const geometry = new THREE.SphereGeometry(10, 32, 32) // 球体几何体
// const material = new THREE.MeshBasicMaterial(
// {
//   color: 0x0000ff, //设置材质颜色
//   transparent: true,//开启透明
//   opacity: 0.5,//设置透明度
// }
// )

const geometry = new THREE.BoxGeometry(10, 10, 10)
// 创建材质
// const material = new THREE.MeshBasicMaterial(
//   {
//     color: 0x0000ff, //设置材质颜色
//     transparent: true,//开启透明
//     opacity: 0.5,//设置透明度
//   }
// )

const materials: THREE.MeshBasicMaterial[] = []

const texture_right = new THREE.TextureLoader().load('./images/livingRoom/living_r.jpg')
materials.push(new THREE.MeshBasicMaterial({ map: texture_right }))

const texture_left = new THREE.TextureLoader().load('./images/livingRoom/living_l.jpg')
materials.push(new THREE.MeshBasicMaterial({ map: texture_left }))

const texture_up = new THREE.TextureLoader().load('./images/livingRoom/living_u.jpg')
materials.push(new THREE.MeshBasicMaterial({ map: texture_up }))

const texture_down = new THREE.TextureLoader().load('./images/livingRoom/living_d.jpg')
materials.push(new THREE.MeshBasicMaterial({ map: texture_down }))

const texture_front = new THREE.TextureLoader().load('./images/livingRoom/living_f.jpg')
materials.push(new THREE.MeshBasicMaterial({ map: texture_front }))

const texture_back = new THREE.TextureLoader().load('./images/livingRoom/living_b.jpg')
materials.push(new THREE.MeshBasicMaterial({ map: texture_back }))


const canvas = document.createElement('canvas')
canvas.width = 1024
canvas.height = 1024
const context = canvas.getContext('2d')!
context.fillStyle = "rgba(100,100,100,.7)"
context.fillRect(0, 256, canvas.width, canvas.height / 2)
context.textAlign = 'center'
context.textBaseline = 'middle'
context.font = 'bold 200px arial'
context.fillStyle = 'white'
context.fillText('阳台', canvas.width / 2, canvas.height / 2)

const balconySpriteTexture = new THREE.CanvasTexture(canvas)
// 创建阳台的导航
const balconySpriteMaterial = new THREE.SpriteMaterial({ map: balconySpriteTexture, transparent: true })
const balconySprite = new THREE.Sprite(balconySpriteMaterial)
balconySprite.position.set(0, 0, -4)


// 阳台立方体
const roomPrefix = "balcony"
const arr = [
  `${roomPrefix}_r`,
  `${roomPrefix}_l`,
  `${roomPrefix}_u`,
  `${roomPrefix}_d`,
  `${roomPrefix}_f`,
  `${roomPrefix}_b`
]
const balconyGeometry = new THREE.BoxGeometry(10, 10, 10)
const balconyMaterials: THREE.MeshBasicMaterial[] = []
arr.forEach((item) => {
  const texture = new THREE.TextureLoader().load(`./images/balcony/${item}.jpg`)
  balconyMaterials.push(new THREE.MeshBasicMaterial({ map: texture }))
})
const balconyBox = new THREE.Mesh(balconyGeometry, balconyMaterials)
balconyBox.geometry.scale(1, 1, -1)
balconyBox.position.set(0, 0, -10)


// 创建信息点
const informationTexture = new THREE.TextureLoader().load("./images/dot.png")
const informationSpriteMaterial = new THREE.SpriteMaterial({
  map: informationTexture,
  transparent: true,
})
const informationSprite = new THREE.Sprite(informationSpriteMaterial)
informationSprite.position.set(1.5, -0.1, -3)
informationSprite.scale.set(0.2, 0.2, 0.2)
informationSprite.userData = {
  type: "information",
  name: "信息点",
  description: "这是一个信息点",
}


const sphere = new THREE.Mesh(geometry, materials) // 创建球体网格
sphere.geometry.scale(1, 1, -1)
scene.add(sphere) // 将球体添加到场景中
scene.add(balconyBox)
scene.add(balconySprite)
scene.add(informationSprite)


// 添加坐标辅助器
// const axesHelper = new THREE.AxesHelper(150)
// scene.add(axesHelper)

const render = () => {
  requestAnimationFrame(render)
  renderer.render(scene, camera) //执行渲染操作
}

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const poiObjects: THREE.Sprite[] = []
poiObjects.push(balconySprite)
poiObjects.push(informationSprite)


window.addEventListener('click', (event: MouseEvent) => {
  event.preventDefault()
  // 获取到当前鼠标位置
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

  // 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(pointer, camera)
  // 计算物体和射线的交点
  const intersects = raycaster.intersectObjects(poiObjects)
  if (intersects.length > 0) {
    gsap.to(camera.position, {
      duration: 1,
      x: 0,
      y: 0,
      z: -10
    })
  }
})


const tooltipShow = (event: MouseEvent) => {
  event.preventDefault()
  // 获取到当前鼠标位置
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

  // 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(pointer, camera)
  // 计算物体和射线的交点
  const intersects = raycaster.intersectObjects(poiObjects)
  if (intersects.length && intersects[0].object.userData.type === 'information') {
    // 要设置鼠标的 left 和 top 就需要获取鼠标所在的位置
    // 获取所在的位置就需要将三维的坐标转换为二维的坐标
    // Vector3 对象的 project 方法可以将三维坐标转为 NDC 坐标
    // const vector = new THREE.Vector3(10, 20, 30)
    // vector.project(camera)
    // 通过固定的公式可以将 NDC 坐标转换为屏幕坐标
    // x = (vector.x + 1) * (width / 2)
    // y = (vector.y + 1) * (height / 2)
    const element = event.target as HTMLElement
    const elementWidth = element.clientWidth / 2
    const elementHeight = element.clientHeight / 2
    const vector = new THREE.Vector3(intersects[0].object.position.x, intersects[0].object.position.y, intersects[0].object.position.z)
    const position = vector.project(camera)

    let left = Math.round(
      elementWidth * position.x +
      elementWidth -
      toolTipContainer.value!.clientWidth / 2
    );

    let top = Math.round(
      -elementHeight * position.y +
      elementHeight -
      toolTipContainer.value!.clientHeight / 2
    );

    toolipPosition.value = {
      left: `${left}px`,
      top: `${top}px`,
    };

    toolTipContent.value = intersects[0].object.userData;
  } else {
    tootipHide(event)
  }
}

const tootipHide = (event: MouseEvent) => {
  event.preventDefault()
  toolipPosition.value = {
    left: '-100%',
    top: '-100%'
  }
  toolTipContent.value = {
    name: '',
    type: '',
    description: ''
  }
}


onMounted(() => {
  if (container.value) {
    // 添加轨道控制器
    // controls = new OrbitControls(camera, renderer.domElement)

    container.value.appendChild(renderer.domElement)
    render()

    let isMouseDown = false
    container.value.addEventListener("mousedown", () => {
      isMouseDown = true
    }, false)
    container.value.addEventListener("mouseup", () => {
      isMouseDown = false
    }, false)
    container.value.addEventListener("mouseout", () => {
      isMouseDown = false
    }, false)

    container.value.addEventListener("mousemove", (event) => {
      if (isMouseDown) {
        camera.rotation.x += event.movementY * 0.01
        camera.rotation.y += event.movementX * 0.01
        camera.rotation.order = "YXZ"
      }
    })


    renderer.domElement.addEventListener('mousemove', tooltipShow)
    toolTipContainer.value!.addEventListener('mouseleave', tootipHide)
  }
})
</script>

<template>
  <div class="container" ref="container"></div>
  <div class="tooltip" :style="toolipPosition" ref="toolTipContainer">
    <div>{{ toolTipContent.name }}</div>
    <div>{{ toolTipContent.description }}</div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  width: 100vw;
  height: 100vh;
}

.tooltip {
  position: absolute;
  padding: 0px 0px 40px 0px;
  line-height: 30px;
  border-radius: 4px;
  color: #fff;
  z-index: 100;
  cursor: pointer;
  /* .wrapper {
    position: relative;
    width: 240px;
    max-height: 200px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.6);
    .name {
      width: 100%;
      padding: 6px 0;
    }
    .description {
      width: 100%;
      max-height: 100px;
      font-size: 14px;
      overflow-y: auto;
    }
  } */
}
</style>
