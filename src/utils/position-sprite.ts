import * as THREE from 'three'

function createCanvas(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
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
  context.roundRect(cardX + 16, cardY + 14, cardW - 32, 56, 28)
  context.fill()

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '700 128px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  context.fillStyle = 'rgba(255,255,255,.96)'
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  return canvas
}

export class PositionSprite {
  public readonly sprite: THREE.Sprite

  private readonly material: THREE.SpriteMaterial
  private readonly texture: THREE.CanvasTexture
  private readonly callbacks: Array<() => void> = []
  private readonly clickHandler: (event: MouseEvent) => void

  constructor(
    text: string,
    position: THREE.Vector3,
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
  ) {
    const canvas = createCanvas(text)

    this.texture = new THREE.CanvasTexture(canvas)
    this.material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
    })

    this.sprite = new THREE.Sprite(this.material)
    this.sprite.position.copy(position)
    scene.add(this.sprite)

    const pointer = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()

    this.clickHandler = (event: MouseEvent) => {
      const rect = domElement.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0)
        return

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObject(this.sprite)
      if (intersects.length > 0) {
        this.callbacks.forEach((callback) => {
          callback()
        })
      }
    }

    window.addEventListener('click', this.clickHandler)
  }

  onClick(callback: () => void) {
    this.callbacks.push(callback)
  }

  dispose() {
    window.removeEventListener('click', this.clickHandler)
    this.sprite.parent?.remove(this.sprite)
    this.material.map?.dispose()
    this.material.dispose()
    this.callbacks.length = 0
  }
}
