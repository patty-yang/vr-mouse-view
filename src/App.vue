<script setup lang="ts">
import { gsap } from 'gsap'
import * as THREE from 'three'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import { PositionSprite, Room } from './utils'

const container = useTemplateRef<HTMLDivElement>('container')
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

let room: Room | null = null
let balconyRoom: Room | null = null

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

onMounted(() => {
  room = new Room('客厅', 'living', '/images/livingRoom/', scene)
  balconyRoom = new Room('阳台', 'balcony', '/images/balcony/', scene, new THREE.Vector3(0, 0, -10))

  const balconySprite = new PositionSprite(
    '阳台',
    new THREE.Vector3(0, 0, -4),
    scene,
    camera,
    renderer.domElement,
  )
  sprites.push(balconySprite)

  balconySprite.onClick(() => {
    gsap.to(camera.position, {
      duration: 1,
      x: 0,
      y: 0,
      z: -10,
    })
  })

  const balconyBackSprite = new PositionSprite(
    '客厅',
    new THREE.Vector3(1, 0, -6),
    scene,
    camera,
    renderer.domElement,
  )
  sprites.push(balconyBackSprite)
  balconyBackSprite.onClick(() => {
    gsap.to(camera.position, {
      duration: 1,
      x: 0,
      y: 0,
      z: 0,
    })
  })

  if (container.value) {
    mountedContainer = container.value
    mountedContainer.appendChild(renderer.domElement)
    resizeRenderer()
    window.addEventListener('resize', resizeRenderer)
    renderLoop()

    mountedContainer.addEventListener('mousedown', handleDragStart, false)
    mountedContainer.addEventListener('mouseup', handleDragEnd, false)
    mountedContainer.addEventListener('mouseout', handleDragEnd, false)
    mountedContainer.addEventListener('mousemove', handleDragMove, false)
  }
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

  if (mountedContainer) {
    mountedContainer.removeEventListener('mousedown', handleDragStart, false)
    mountedContainer.removeEventListener('mouseup', handleDragEnd, false)
    mountedContainer.removeEventListener('mouseout', handleDragEnd, false)
    mountedContainer.removeEventListener('mousemove', handleDragMove, false)
  }

  const containerElement = mountedContainer
  if (containerElement && renderer.domElement.parentElement === containerElement)
    containerElement.removeChild(renderer.domElement)
  mountedContainer = null
  renderer.dispose()
})
</script>

<template>
  <div ref="container" class="container" />
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
</style>
