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
