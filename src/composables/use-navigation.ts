import * as THREE from 'three'
import { onMounted, onUnmounted } from 'vue'

interface IProps {
  scene: THREE.Scene // 场景
  camera: THREE.Camera // 相机
  domElement: HTMLCanvasElement // 渲染 canvas
  position: THREE.Vector3 // 位置
  text: string // 文本
  cb: () => void // 回调函数
}

type Create = Omit<IProps, 'text'> & {
  canvas: HTMLCanvasElement
}

function createCanvas(text: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 716
  canvas.height = 310
  const context = canvas.getContext('2d')!
  const cardW = 620
  const cardH = 230
  const cardX = (canvas.width - cardW) / 2
  const cardY = (canvas.height - cardH) / 2

  context.shadowColor = 'rgba(0,0,0,.32)'
  context.shadowBlur = 24
  context.shadowOffsetY = 8
  context.fillStyle = 'rgba(0,0,0,.82)'
  context.beginPath()
  context.roundRect(cardX, cardY, cardW, cardH, 44)
  context.fill()
  context.shadowColor = 'transparent'
  context.shadowBlur = 0
  context.shadowOffsetY = 0

  context.strokeStyle = 'rgba(255,255,255,.18)'
  context.lineWidth = 2
  context.stroke()

  context.fillStyle = 'rgba(255,255,255,.08)'
  context.beginPath()
  context.roundRect(
    cardX + 16,
    cardY + 14,
    cardW - 32,
    56,
    28,
  )
  context.fill()

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '700 128px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  context.fillStyle = 'rgba(255,255,255,.96)'
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  return canvas
}

function createSprite(props: Create) {
  const { scene, camera, domElement, canvas, position, cb } = props
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  })
  const sprite = new THREE.Sprite(material)
  const raycaster = new THREE.Raycaster()
  sprite.position.copy(position)
  sprite.scale.set(
    canvas.width / 1024,
    canvas.height / 1024,
    1,
  )
  scene.add(sprite)

  function handleClick(event: MouseEvent) {
    const rect = domElement.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0)
      return

    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )

    raycaster.setFromCamera(pointer, camera)

    if (raycaster.intersectObject(sprite).length > 0)
      cb()
  }

  onMounted(() => {
    domElement.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    domElement.removeEventListener('click', handleClick)
    sprite.parent?.remove(sprite)
    texture.dispose()
    material.dispose()
  })

  return sprite
}

export function useNavigationSprite(props: IProps) {
  const { scene, camera, domElement, position, text, cb } = props
  const canvas = createCanvas(text)
  return createSprite({ scene, camera, domElement, position, canvas, cb })
}
