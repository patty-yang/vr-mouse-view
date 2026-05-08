import * as THREE from 'three'

export class Room {
  public readonly box: THREE.Mesh

  private readonly geometry: THREE.BoxGeometry
  private readonly materials: THREE.MeshBasicMaterial[]

  constructor(
    public name: string,
    public roomPrefix: string,
    public textureUrl: string,
    public scene: THREE.Scene,
    public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    public euler: THREE.Euler = new THREE.Euler(0, 0, 0),
  ) {
    // 创建立方体
    this.geometry = new THREE.BoxGeometry(10, 10, 10)
    this.geometry.scale(1, 1, -1)

    const arr = [
      `${roomPrefix}_r`,
      `${roomPrefix}_l`,
      `${roomPrefix}_u`,
      `${roomPrefix}_d`,
      `${roomPrefix}_f`,
      `${roomPrefix}_b`,
    ]
    const textureLoader = new THREE.TextureLoader()
    this.materials = arr.map((item) => {
      const texture = textureLoader.load(`${textureUrl + item}.jpg`)
      return new THREE.MeshBasicMaterial({ map: texture })
    })

    this.box = new THREE.Mesh(this.geometry, this.materials)
    this.box.position.copy(position)
    this.box.rotation.copy(euler)
    scene.add(this.box)
  }

  dispose() {
    this.scene.remove(this.box)
    this.geometry.dispose()
    this.materials.forEach((material) => {
      material.map?.dispose()
      material.dispose()
    })
  }
}
