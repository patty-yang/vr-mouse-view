import type { Ref } from 'vue'
import * as THREE from 'three'
import { onMounted, onUnmounted } from 'vue'

// 接近正上方/正下方时如果继续旋转，视角会产生“翻过去”的不适感，所以留一点余量。
const MAX_PITCH = Math.PI / 2 - 0.01
// 鼠标每移动 1px 对应的旋转增量。
const ROTATE_SPEED = 0.01

export function useSceneEvents(camera: THREE.Camera, target: Ref<HTMLDivElement | null>) {
  let isDragging = false
  let mountedTarget: HTMLDivElement | null = null

  function handleDragStart() {
    isDragging = true
  }

  function handleDragEnd() {
    isDragging = false
  }

  function handleDragMove(event: MouseEvent) {
    if (!isDragging)
      return

    // 上下拖动对应 pitch（抬头/低头），左右拖动对应 yaw（向左/向右转头）。
    camera.rotation.x = THREE.MathUtils.clamp(
      camera.rotation.x + event.movementY * ROTATE_SPEED,
      -MAX_PITCH,
      MAX_PITCH
    )
    camera.rotation.y += event.movementX * ROTATE_SPEED
  }

  function bindSceneEvents(element: HTMLDivElement) {
    element.addEventListener('mousedown', handleDragStart)
    element.addEventListener('mouseup', handleDragEnd)
    element.addEventListener('mouseleave', handleDragEnd)
    element.addEventListener('mousemove', handleDragMove)
  }

  function unbindSceneEvents(element: HTMLDivElement) {
    element.removeEventListener('mousedown', handleDragStart)
    element.removeEventListener('mouseup', handleDragEnd)
    element.removeEventListener('mouseleave', handleDragEnd)
    element.removeEventListener('mousemove', handleDragMove)
  }

  onMounted(() => {
    if (!target.value)
      return

    mountedTarget = target.value
    bindSceneEvents(mountedTarget)
  })

  onUnmounted(() => {
    handleDragEnd()

    if (mountedTarget)
      unbindSceneEvents(mountedTarget)

    mountedTarget = null
  })
}
