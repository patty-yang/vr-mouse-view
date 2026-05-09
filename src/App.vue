<script setup lang="ts">
import type { Vector3Coordinates } from './types'
import { gsap } from 'gsap'

import { useTemplateRef } from 'vue'
import { useNavigationSprite, useRoom, useSceneEvents, useThreeCore, useTooltip } from './composables'
import { defaultCameraTarget, navigationPoints, tooltipPoints } from './config'

const container = useTemplateRef<HTMLDivElement>('container')

const { scene, camera, renderer } = useThreeCore(container)

useRoom(scene)

useSceneEvents(camera, container)

navigationPoints.forEach(({ label, position, cameraTarget = defaultCameraTarget }) => {
  useNavigationSprite({
    scene,
    camera,
    domElement: renderer.domElement,
    position,
    label,
    onClick: () => animateCameraTo(cameraTarget)
  })
})

const { tooltip } = useTooltip({
  scene,
  camera,
  points: tooltipPoints,
  domElement: renderer.domElement
})

function animateCameraTo([x, y, z]: Vector3Coordinates = defaultCameraTarget) {
  gsap.to(camera.position, {
    duration: 1,
    x,
    y,
    z
  })
}
</script>

<template>
  <div ref="container" class="container">
    <div
      v-if="tooltip.visible && tooltip.content"
      class="tooltip"
      :style="{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }"
    >
      <div>{{ tooltip.content.name }}</div>
      <div>{{ tooltip.content.type }}</div>
      <div>{{ tooltip.content.description }}</div>
    </div>
  </div>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.tooltip {
  position: absolute;
  max-width: 240px;
  padding: 12px;
  line-height: 30px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.72);
  color: #fff;
  z-index: 100;
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 12px));
}
</style>
