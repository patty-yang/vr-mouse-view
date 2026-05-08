import * as THREE from 'three'

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
    // 定义canvas
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const context = canvas.getContext('2d')!
    context.fillStyle = 'rgba(100,100,100,.7)'
    context.fillRect(0, 256, canvas.width, canvas.height / 2)
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = 'bold 200px Arial'
    context.fillStyle = 'white'
    context.fillText(text, canvas.width / 2, canvas.height / 2)

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
