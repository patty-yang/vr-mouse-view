import type {
  TooltipContent,
  TooltipHotspot,
  TooltipOverlayState,
  TooltipSpriteResources,
  UseTooltipOptions
} from '../types'
import * as THREE from 'three'
import { onMounted, onUnmounted, reactive } from 'vue'

function createTooltipSprite(scene: THREE.Scene, { position, textureUrl, content }: TooltipHotspot): TooltipSpriteResources {
  const texture = new THREE.TextureLoader().load(textureUrl)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })

  const sprite = new THREE.Sprite(material)
  sprite.position.copy(position)
  sprite.scale.set(0.2, 0.2, 0.2)
  // 把浮层要展示的数据直接挂在 sprite 上，拾取到对象后就能立刻拿到文案。
  sprite.userData = content

  scene.add(sprite)

  return {
    texture,
    material,
    sprite
  }
}

function calculateTooltipState(sprite: THREE.Sprite, camera: THREE.Camera, domElement: HTMLCanvasElement): TooltipOverlayState | null {
  const rect = domElement.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0)
    return null

  // 把 3D 世界坐标投影到屏幕平面，得到 DOM 浮层应该出现的位置。
  const projectedPosition = sprite.position.clone()
  camera.updateMatrixWorld()
  projectedPosition.project(camera)

  return {
    content: sprite.userData as TooltipContent,
    visible: true,
    x: ((projectedPosition.x + 1) / 2) * rect.width,
    y: ((-projectedPosition.y + 1) / 2) * rect.height
  }
}

export function useTooltip(props: UseTooltipOptions) {
  const { scene, points, domElement, camera } = props
  const tooltipSpriteList = points.map(item => createTooltipSprite(scene, item))
  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  // 当前被选中的点位。相机继续移动时，tooltip 要跟着它实时更新位置。
  let activeSprite: THREE.Sprite | null = null
  let animationFrameId = 0

  const tooltip = reactive<TooltipOverlayState>({
    content: null,
    visible: false,
    x: 0,
    y: 0
  })

  function clearTooltip() {
    activeSprite = null
    tooltip.content = null
    tooltip.visible = false
  }

  function updateTooltipPosition() {
    if (activeSprite) {
      // tooltip 是 DOM，不会自动跟着 Three.js 相机变化，所以每帧都要重新计算位置。
      const nextTooltipState = calculateTooltipState(activeSprite, camera, domElement)
      if (nextTooltipState)
        Object.assign(tooltip, nextTooltipState)
      else
        clearTooltip()
    }

    animationFrameId = requestAnimationFrame(updateTooltipPosition)
  }

  function handleClick(event: MouseEvent) {
    if (!updatePointer(event))
      return

    raycaster.setFromCamera(pointer, camera)
    // 只要点击没有命中任何提示点，就关闭当前 tooltip。
    const [intersection] = raycaster.intersectObjects(tooltipSpriteList.map(({ sprite }) => sprite))
    if (!(intersection?.object instanceof THREE.Sprite)) {
      clearTooltip()
      return
    }

    activeSprite = intersection.object
    const nextTooltipState = calculateTooltipState(intersection.object, camera, domElement)
    if (!nextTooltipState) {
      clearTooltip()
      return
    }

    Object.assign(tooltip, nextTooltipState)
  }

  function updatePointer(event: MouseEvent) {
    const rect = domElement.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0)
      return false

    // Three.js 射线拾取统一使用标准化设备坐标，所以这里做一次像素坐标转换。
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    return true
  }

  onMounted(() => {
    domElement.addEventListener('click', handleClick)
    updateTooltipPosition()
  })

  onUnmounted(() => {
    domElement.removeEventListener('click', handleClick)
    if (animationFrameId)
      cancelAnimationFrame(animationFrameId)
    clearTooltip()
    // 手动创建的 sprite / texture / material 都不受 Vue 管理，离开页面时要主动清理。
    tooltipSpriteList.forEach(({ sprite, texture, material }) => {
      sprite.parent?.remove(sprite)
      texture.dispose()
      material.dispose()
    })
  })

  return {
    tooltip
  }
}
