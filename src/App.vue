<script setup lang="ts">
import {onMounted, ref} from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
// 初始化场景
const scene = new THREE.Scene()
// 初始化相机
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

// 设置一个相机的位置
camera.position.set(0, 0, 10)
const useBox = () => {
  // 上下左右前后四个面贴图
  const materials: THREE.MeshBasicMaterial[] = []

  const texture_right = new THREE.TextureLoader().load(
      './images/livingRoom/living_r.jpg'
  )
  materials.push(new THREE.MeshBasicMaterial({map: texture_right}))

  const texture_left = new THREE.TextureLoader().load(
      './images/livingRoom/living_l.jpg'
  )
  materials.push(new THREE.MeshBasicMaterial({map: texture_left}))

  const texture_up = new THREE.TextureLoader().load(
      './images/livingRoom/living_u.jpg'
  )
  materials.push(new THREE.MeshBasicMaterial({map: texture_up}))

  const texture_down = new THREE.TextureLoader().load(
      './images/livingRoom/living_d.jpg'
  )
  materials.push(new THREE.MeshBasicMaterial({map: texture_down}))

  const texture_front = new THREE.TextureLoader().load(
      './images/livingRoom/living_f.jpg'
  )
  materials.push(new THREE.MeshBasicMaterial({map: texture_front}))

  const texture_back = new THREE.TextureLoader().load(
      './images/livingRoom/living_b.jpg'
  )
  materials.push(new THREE.MeshBasicMaterial({map: texture_back}))
  // 根据几何体和材质创建物体
  const cube = new THREE.Mesh(geometry, materials)
  // 将墙纸放到哪层
  cube.geometry.scale(1, 1, -1)
  // 将几何体添加到场景中
  scene.add(cube)
}

const useSphere = () => {
  const geometry = new THREE.SphereGeometry(1, 50, 50)
  geometry.scale(1, 1, -1)
  const texture = new THREE.TextureLoader().load('./images/scene.jpeg')
  const material = new THREE.MeshBasicMaterial({map: texture})
  const sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)
}
// 创建几何体
const geometry = new THREE.BoxGeometry(10, 10, 10)
// 创建材质
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
// 添加坐标轴辅助器
// const axesHelper = new THREE.AxesHelper(20)
// scene.add(axesHelper)

// useBox()
useSphere()

window.addEventListener('resize', () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight
  // 更新摄像机的投影矩阵
  camera.updateProjectionMatrix()
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio)
})
// 初始化渲染器
const renderer = new THREE.WebGLRenderer()
// 设置渲染器的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
// 将webgl渲染的canvas内容添加到body上
const container = ref<HTMLDivElement | null>(null)

const render = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

onMounted(() => {
  if (container.value) {
    // 创建轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    // 设置控制器阻尼，让控制器更有真实效果,必须在动画循环里调用.update()。
    controls.enableDamping = true
    controls.update()

    // 将渲染器添加到页面上
    container.value.appendChild(renderer.domElement)
    render()
  }
})
</script>

<template>
  <div class="container" ref="container"></div>
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
</style>
