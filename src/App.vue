<script setup lang="ts">
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useTemplateRef } from 'vue'

import { useNavigationSprite, useRoom, useSceneEvents, useThreeCore } from './composables'

type Vector3Tuple = [number, number, number]

interface NavigationPoint {
  text: string
  position: Vector3Tuple
  target?: Vector3Tuple
}

const container = useTemplateRef<HTMLDivElement>('container')
const defaultCameraTarget: Vector3Tuple = [0, 0, 0]

const navigationPoints: NavigationPoint[] = [
  {
    text: '阳台',
    position: [0, 0, -4],
    target: [0, 0, -10],
  },
  {
    text: '客厅',
    position: [1, 0, -6],
  },
  {
    text: '厨房',
    position: [1.5, 0, 4],
    target: [2, 0, 10],
  },
  {
    text: '客厅',
    position: [1, 0, 6],
  },
]

const { scene, camera } = useThreeCore(container)

useRoom(scene)

useSceneEvents(camera, container)

navigationPoints.forEach(({ text, position, target = defaultCameraTarget }) => {
  useNavigationSprite({
    scene,
    camera,
    position: new THREE.Vector3(...position),
    text,
    cb: () => animateCameraTo(target),
  })
})

function animateCameraTo([x, y, z]: Vector3Tuple = defaultCameraTarget) {
  gsap.to(camera.position, {
    duration: 1,
    x,
    y,
    z,
  })
}
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
