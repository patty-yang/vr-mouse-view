import * as THREE from 'three'
import { onMounted, onUnmounted } from 'vue'

interface RoomConfig {
  roomPrefix: string
  textureUrl: string
  position?: THREE.Vector3
  euler?: THREE.Euler
}

interface RoomEntity {
  dispose: () => void
}

const ROOM_SIZE = 10
const ROOM_TEXTURE_SUFFIXES = ['r', 'l', 'u', 'd', 'f', 'b'] as const
const textureLoader = new THREE.TextureLoader()

const roomConfigs: RoomConfig[] = [
  { roomPrefix: 'living', textureUrl: '/images/livingRoom/' },
  { roomPrefix: 'balcony', textureUrl: '/images/balcony/', position: new THREE.Vector3(2, 0, -10) },
  { roomPrefix: 'kitchen', textureUrl: '/images/kitchen/', position: new THREE.Vector3(0, 0, 10) },
]

function createRoom(scene: THREE.Scene, { roomPrefix, textureUrl, position, euler }: RoomConfig) {
  const geometry = new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, ROOM_SIZE)
  geometry.scale(1, 1, -1)

  const materials = ROOM_TEXTURE_SUFFIXES.map(suffix =>
    new THREE.MeshBasicMaterial({
      map: textureLoader.load(`${textureUrl}${roomPrefix}_${suffix}.jpg`),
    }),
  )

  const box = new THREE.Mesh(geometry, materials)
  if (position)
    box.position.copy(position)
  if (euler)
    box.rotation.copy(euler)
  scene.add(box)

  return {
    dispose() {
      scene.remove(box)
      geometry.dispose()
      materials.forEach((material) => {
        material.map?.dispose()
        material.dispose()
      })
    },
  }
}

export function useRoom(scene: THREE.Scene) {
  const rooms: RoomEntity[] = []

  onMounted(() => {
    roomConfigs.forEach((config) => {
      rooms.push(createRoom(scene, config))
    })
  })

  onUnmounted(() => {
    rooms.forEach(room => room.dispose())
    rooms.length = 0
  })
}
