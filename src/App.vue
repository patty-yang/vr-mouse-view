<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

const scene = new THREE.Scene()  // 初始化一个场景

const container = useTemplateRef('container')

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近的一面 
  1000 // 远的一面
)

// 设计相机的位置
// camera.position.z = 30
camera.position.set(0, 0, .1)
let controls: OrbitControls
// 创建球体
// const geometry = new THREE.SphereGeometry(10, 32, 32); // 球体几何体
// const material = new THREE.MeshBasicMaterial(
// {
//   color: 0x0000ff, //设置材质颜色
//   transparent: true,//开启透明
//   opacity: 0.5,//设置透明度
// }
// )

const geometry = new THREE.BoxGeometry(10, 10, 10);
// 创建材质
const material = new THREE.MeshBasicMaterial(
  {
    color: 0x0000ff, //设置材质颜色
    transparent: true,//开启透明
    opacity: 0.5,//设置透明度
  }
);

const materials: THREE.MeshBasicMaterial[] = []

const texture_right = new THREE.TextureLoader().load('./images/livingRoom/living_r.jpg');
materials.push(new THREE.MeshBasicMaterial({ map: texture_right }));

const texture_left = new THREE.TextureLoader().load('./images/livingRoom/living_l.jpg');
materials.push(new THREE.MeshBasicMaterial({ map: texture_left }));

const texture_up = new THREE.TextureLoader().load('./images/livingRoom/living_u.jpg');
materials.push(new THREE.MeshBasicMaterial({ map: texture_up }));

const texture_down = new THREE.TextureLoader().load('./images/livingRoom/living_d.jpg');
materials.push(new THREE.MeshBasicMaterial({ map: texture_down }));

const texture_front = new THREE.TextureLoader().load('./images/livingRoom/living_f.jpg');
materials.push(new THREE.MeshBasicMaterial({ map: texture_front }));

const texture_back = new THREE.TextureLoader().load('./images/livingRoom/living_b.jpg');
materials.push(new THREE.MeshBasicMaterial({ map: texture_back }));


const sphere = new THREE.Mesh(geometry, materials); // 创建球体网格
sphere.geometry.scale(1, 1, -1)
scene.add(sphere); // 将球体添加到场景中

// 添加坐标辅助器
const axesHelper = new THREE.AxesHelper(150);
scene.add(axesHelper);


const renderer = new THREE.WebGLRenderer() // 创建渲染器
renderer.setSize(window.innerWidth, window.innerHeight) // 设置渲染器的大小


const render = () => {
  renderer.render(scene, camera); //执行渲染操作
  requestAnimationFrame(render)
}

onMounted(() => {
  if (container.value) {
    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    controls.update();

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
