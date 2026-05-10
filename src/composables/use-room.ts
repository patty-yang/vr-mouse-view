import * as THREE from 'three'
import { onMounted, onUnmounted } from 'vue'

interface RoomConfig {
  // 文件名前缀，例如 living 对应 living_r.jpg / living_l.jpg 等六张图。
  roomPrefix: string
  textureUrl: string
  position?: THREE.Vector3
  euler?: THREE.Euler
}

interface RoomEntity {
  dispose: () => void
}

const ROOM_SIZE = 10
// 顺序要和 BoxGeometry 六个面的材质顺序一致：右、左、上、下、前、后。
const ROOM_TEXTURE_SUFFIXES = ['r', 'l', 'u', 'd', 'f', 'b'] as const
const textureLoader = new THREE.TextureLoader()

const roomConfigs: RoomConfig[] = [
  // 客厅放在原点，其他房间沿 z 轴前后摆放，形成可跳转的空间关系。
  { roomPrefix: 'living', textureUrl: '/images/livingRoom/' },
  { roomPrefix: 'balcony', textureUrl: '/images/balcony/', position: new THREE.Vector3(2, 0, -10) },
  { roomPrefix: 'kitchen', textureUrl: '/images/kitchen/', position: new THREE.Vector3(0, 0, 10) }
]

function createRoom(scene: THREE.Scene, { roomPrefix, textureUrl, position, euler }: RoomConfig) {
  const geometry = new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, ROOM_SIZE)
  // 立方体默认朝外可见；这里把法线翻转，才能从盒子内部看到全景贴图。
  geometry.scale(1, 1, -1)

  const materials = ROOM_TEXTURE_SUFFIXES.map(suffix =>
    new THREE.MeshBasicMaterial({
      map: textureLoader.load(`${textureUrl}${roomPrefix}_${suffix}.jpg`)
    })
  )

  const box = new THREE.Mesh(geometry, materials)
  if (position)
    box.position.copy(position)
  if (euler)
    box.rotation.copy(euler)
  scene.add(box)

  return {
    dispose() {
      // 房间切走或页面销毁时，需要同时释放几何体和贴图，避免 WebGL 内存泄漏。
      scene.remove(box)
      geometry.dispose()
      materials.forEach((material) => {
        material.map?.dispose()
        material.dispose()
      })
    }
  }
}

export function useRoom(scene: THREE.Scene) {
  const rooms: RoomEntity[] = []

  onMounted(() => {
    // 逐个创建房间实体，方便后续统一销毁。
    roomConfigs.forEach((config) => {
      rooms.push(createRoom(scene, config))
    })
  })

  onUnmounted(() => {
    rooms.forEach(room => room.dispose())
    rooms.length = 0
  })
}
