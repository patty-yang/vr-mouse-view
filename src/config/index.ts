import type { NavigationHotspot, TooltipHotspot, Vector3Coordinates } from '../types'
import * as THREE from 'three'

export const defaultCameraTarget: Vector3Coordinates = [0, 0, 0]

export const navigationPoints: NavigationHotspot[] = [
  {
    label: '阳台',
    position: new THREE.Vector3(0, 0, -4),
    cameraTarget: [0, 0, -10]
  },
  {
    label: '客厅',
    position: new THREE.Vector3(1, 0, -6)
  },
  {
    label: '厨房',
    position: new THREE.Vector3(1.5, 0, 4),
    cameraTarget: [2, 0, 10]
  },
  {
    label: '客厅',
    position: new THREE.Vector3(1, 0, 6)
  }
]

export const tooltipPoints: TooltipHotspot[] = [
  {
    textureUrl: '/images/dot.png',
    position: new THREE.Vector3(3, 1, 2),
    content: {
      name: '无题构成',
      description: '像被截取的一段感知，色块与留白在视线里维持着微妙的张力',
      type: 'information'
    }
  },
  {
    textureUrl: '/images/dot.png',
    position: new THREE.Vector3(-2.5, -0.1, -3),
    content: {
      name: '时间的纹理',
      description: '木质的肌理被缓慢转译成记忆的痕迹，在静默中保留手作的呼吸',
      type: 'information'
    }
  },
  {
    textureUrl: '/images/dot.png',
    position: new THREE.Vector3(1.5, -0.1, -3),
    content: {
      name: '漂移的边界',
      description: '形体与意象在这里轻微错位，像现实表面浮起的一层回声',
      type: 'information'
    }
  }
]
