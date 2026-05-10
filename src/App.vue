<script setup lang="ts">
import type { Vector3Coordinates } from './types'
import { gsap } from 'gsap'

import { useTemplateRef } from 'vue'
import { useNavigationSprite, useRoom, useSceneEvents, useThreeCore, useTooltip } from './composables'
import { defaultCameraTarget, navigationPoints, tooltipPoints } from './config'

const container = useTemplateRef<HTMLDivElement>('container')

// 统一在这里拿到场景、相机和渲染器，其他能力都围绕这三个核心对象展开。
const { scene, camera, renderer } = useThreeCore(container)

// 房间本质上是几个贴了全景图的立方体，用不同坐标拼出可切换的空间。
useRoom(scene)

// 鼠标拖拽只负责转动视角，不负责相机位移。
useSceneEvents(camera, container)

// 导航点完全由配置驱动，新增房间入口时通常只需要补配置。
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

// tooltip 状态由 Three.js 场景中的点位驱动，但最终渲染仍交给 DOM
const { tooltip } = useTooltip({
  scene,
  camera,
  points: tooltipPoints,
  domElement: renderer.domElement
})

function animateCameraTo([x, y, z]: Vector3Coordinates = defaultCameraTarget) {
  // 平滑移动相机位置，让“跳转房间”看起来像一次过渡，而不是瞬移。
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
    <!-- 提示框是普通 DOM 覆盖层，位置来自 3D 点投影后的屏幕坐标。 -->
    <div
      v-if="tooltip.visible && tooltip.content"
      class="tooltip"
      :style="{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }"
    >
      <div>{{ tooltip.content.name }}</div>
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
