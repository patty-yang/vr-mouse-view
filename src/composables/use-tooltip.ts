import type { TooltipContent, TooltipPoint } from '../types'
import * as THREE from 'three'
import { onMounted, onUnmounted, reactive } from 'vue'

interface IProps {
  scene: THREE.Scene
  camera: THREE.Camera
  points: TooltipPoint[]
  domElement: HTMLCanvasElement
}

interface TooltipSpriteEntity {
  material: THREE.SpriteMaterial
  sprite: THREE.Sprite
  texture: THREE.Texture
}

interface TooltipState {
  content: TooltipContent | null
  visible: boolean
  x: number
  y: number
}

function createTooltipSprite(scene: THREE.Scene, { position, url, userData }: TooltipPoint): TooltipSpriteEntity {
  const texture = new THREE.TextureLoader().load(url)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })

  const sprite = new THREE.Sprite(material)
  sprite.position.copy(position)
  sprite.scale.set(0.2, 0.2, 0.2)
  sprite.userData = userData

  scene.add(sprite)

  return {
    texture,
    material,
    sprite,
  }
}

export function useTooltip(props: IProps) {
  const { scene, points, domElement, camera } = props
  const tooltipSpriteList = points.map(item => createTooltipSprite(scene, item))
  const pointer = new THREE.Vector2()
  const projectedPosition = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()

  const tooltip = reactive<TooltipState>({
    content: null,
    visible: false,
    x: 0,
    y: 0,
  })

  function clearTooltip() {
    tooltip.content = null
    tooltip.visible = false
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

    const rect = domElement.getBoundingClientRect()
    camera.updateMatrixWorld()
    projectedPosition.copy(intersection.object.position).project(camera)

    tooltip.content = intersection.object.userData as TooltipContent
    tooltip.x = ((projectedPosition.x + 1) / 2) * rect.width
    tooltip.y = ((-projectedPosition.y + 1) / 2) * rect.height
    tooltip.visible = true
  }

  function updatePointer(event: MouseEvent) {
    const rect = domElement.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0)
      return false

    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )
    return true
  }

  onMounted(() => {
    domElement.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    domElement.removeEventListener('click', handleClick)
    clearTooltip()
    tooltipSpriteList.forEach(({ sprite, texture, material }) => {
      sprite.parent?.remove(sprite)
      texture.dispose()
      material.dispose()
    })
  })

  return {
    tooltip,
  }
}
