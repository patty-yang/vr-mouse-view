<script setup lang="ts">
import type { Ref } from 'vue'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { PositionSprite, Room, TooltipSprite } from './utils'

const container = useTemplateRef<HTMLDivElement>('container')
const toolTipContainer = useTemplateRef<HTMLDivElement>('toolTipContainer')

const toolTipContent: Ref<Record<string, any>> = ref({
  name: '',
  type: '',
  description: '',
})
const toolipPosition = ref({
  left: '-100%',
  top: '-100%',
})

/**
 * 初始化场景
 */
const scene = new THREE.Scene()

/**
 * 初始化相机
 */
const camera = new THREE.PerspectiveCamera(
  75,
  1, // 宽高比
  0.1, // 近的一面
  1000, // 远的一面
)

/**
 * 初始化相机位置
 */
// camera.position.z = 30
camera.position.set(0, 0, 0.01)
camera.rotation.order = 'YXZ'

/**
 * 初始化渲染器
 */
const renderer = new THREE.WebGLRenderer() // 创建渲染器

const spriteList: THREE.Sprite[] = []

spriteList.push(
  new TooltipSprite(
    '/images/dot.png',
    new THREE.Vector3(3, 1, 2),
    scene,
    camera,
    {
      name: '艺术画',
      description: '这是一件艺术化的作品，展现了独特的设计理念',
      type: 'information',
    },
  ).sprite,
  new TooltipSprite(
    './images/dot.png',
    new THREE.Vector3(-2.5, -0.1, -3),
    scene,
    camera,
    {
      name: '木雕艺术品',
      description: '这是一件木雕艺术品，展现了精湛的工艺和设计',
      type: 'information',
    },
  ).sprite,
  new TooltipSprite(
    './images/dot.png',
    new THREE.Vector3(1.5, -0.1, -3),
    scene,
    camera,
    {
      name: '工艺画',
      description: '十分抽象的工艺画，给人一种很有艺术感的感觉',
      type: 'information',
    },
  ).sprite,
)

let room: Room | null = null
let balconyRoom: Room | null = null
let kitchenRoom: Room | null = null

const sprites: PositionSprite[] = []
let animationFrameId: number | null = null
let isMouseDown = false
let mountedContainer: HTMLDivElement | null = null

const maxPitch = Math.PI / 2 - 0.01
const rotateSpeed = 0.01

function resizeRenderer() {
  const width = container.value?.clientWidth ?? window.innerWidth
  const height = container.value?.clientHeight ?? window.innerHeight
  if (width <= 0 || height <= 0)
    return

  // 更新相机的宽高比
  camera.aspect = width / height
  // 更新相机的投影矩阵
  camera.updateProjectionMatrix()
  // 更新渲染器的大小
  renderer.setSize(width, height)
}

function renderLoop() {
  renderer.render(scene, camera) // 执行渲染操作
  animationFrameId = requestAnimationFrame(renderLoop)
}

function handleDragStart() {
  isMouseDown = true
}

function handleDragEnd() {
  isMouseDown = false
}

function handleDragMove(event: MouseEvent) {
  if (!isMouseDown)
    return

  camera.rotation.x = THREE.MathUtils.clamp(
    camera.rotation.x + event.movementY * rotateSpeed,
    -maxPitch,
    maxPitch,
  )
  camera.rotation.y += event.movementX * rotateSpeed
}

function listenerContainerEvents(target: HTMLDivElement) {
  target.addEventListener('mousedown', handleDragStart, false)
  target.addEventListener('mouseup', handleDragEnd, false)
  target.addEventListener('mouseout', handleDragEnd, false)
  target.addEventListener('mousemove', handleDragMove, false)
  renderer.domElement.addEventListener('mousemove', e => tooltipShow(e, spriteList))
  toolTipContainer.value!.addEventListener('mouseleave', tootipHide)
}

function unListenerContainerEvents(target: HTMLDivElement) {
  target.removeEventListener('mousedown', handleDragStart, false)
  target.removeEventListener('mouseup', handleDragEnd, false)
  target.removeEventListener('mouseout', handleDragEnd, false)
  target.removeEventListener('mousemove', handleDragMove, false)
}

function animateCameraTo(x: number = 0, y: number = 0, z: number = 0) {
  gsap.to(camera.position, {
    duration: 1,
    x,
    y,
    z,
  })
}

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function tooltipShow(event: MouseEvent, spriteList: THREE.Sprite[]) {
  event.preventDefault()
  // 获取到当前鼠标位置
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

  // 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(pointer, camera)
  // 计算物体和射线的交点
  const intersects = raycaster.intersectObjects(spriteList)
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

    const left = Math.round(
      elementWidth * position.x
      + elementWidth
      - toolTipContainer.value!.clientWidth / 2,
    )

    const top = Math.round(
      -elementHeight * position.y
      + elementHeight
      - toolTipContainer.value!.clientHeight / 2,
    )

    toolipPosition.value = {
      left: `${left}px`,
      top: `${top}px`,
    }

    toolTipContent.value = intersects[0].object.userData
  }
  else {
    tootipHide(event)
  }
}

function tootipHide(event: MouseEvent) {
  event.preventDefault()
  toolipPosition.value = {
    left: '-100%',
    top: '-100%',
  }
  toolTipContent.value = {
    name: '',
    type: '',
    description: '',
  }
}

function initRooms() {
  room = new Room('客厅', 'living', '/images/livingRoom/', scene)
  balconyRoom = new Room('阳台', 'balcony', '/images/balcony/', scene, new THREE.Vector3(2, 0, -10))
  kitchenRoom = new Room('厨房', 'kitchen', '/images/kitchen/', scene, new THREE.Vector3(0, 0, 10))
}

function initSprites() {
  const balconySprite = new PositionSprite(
    '阳台',
    new THREE.Vector3(0, 0, -4),
    scene,
    camera,
    renderer.domElement,
  )
  sprites.push(balconySprite)

  balconySprite.onClick(() => animateCameraTo(-10))

  const balconyBackSprite = new PositionSprite(
    '客厅',
    new THREE.Vector3(1, 0, -6),
    scene,
    camera,
    renderer.domElement,
  )
  sprites.push(balconyBackSprite)
  balconyBackSprite.onClick(() => animateCameraTo())

  balconySprite.onClick(() => animateCameraTo(0, 0, -10))

  const kitchenSprite = new PositionSprite(
    '厨房',
    new THREE.Vector3(1.5, 0, 4),
    scene,
    camera,
    renderer.domElement,
  )
  sprites.push(kitchenSprite)
  kitchenSprite.onClick(() => animateCameraTo(2, 0, 10))

  const kitchenBackSprite = new PositionSprite(
    '客厅',
    new THREE.Vector3(1, 0, 6),
    scene,
    camera,
    renderer.domElement,
  )
  sprites.push(kitchenBackSprite)
  kitchenBackSprite.onClick(() => animateCameraTo())
}

function mountScene() {
  if (!container.value)
    return

  mountedContainer = container.value
  mountedContainer.appendChild(renderer.domElement)
  resizeRenderer()
  window.addEventListener('resize', resizeRenderer)
  renderLoop()
  listenerContainerEvents(mountedContainer)
}

onMounted(() => {
  initRooms()
  initSprites()
  mountScene()
})

onUnmounted(() => {
  if (animationFrameId !== null)
    cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resizeRenderer)
  room?.dispose()
  room = null
  balconyRoom?.dispose()
  balconyRoom = null
  sprites.forEach(sprite => sprite.dispose())
  sprites.length = 0
  isMouseDown = false

  if (mountedContainer)
    unListenerContainerEvents(mountedContainer)

  const containerElement = mountedContainer
  if (containerElement && renderer.domElement.parentElement === containerElement)
    containerElement.removeChild(renderer.domElement)
  mountedContainer = null
  renderer.dispose()
})
</script>

<template>
  <div ref="container" class="container" />
  <div ref="toolTipContainer" class="tooltip" :style="toolipPosition">
    <div>{{ toolTipContent.name }}</div>
    <div>{{ toolTipContent.description }}</div>
  </div>
</template>

<style lang="scss">
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
}
</style>
