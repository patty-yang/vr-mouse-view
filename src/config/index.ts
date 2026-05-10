import type { NavigationHotspot, TooltipHotspot, Vector3Coordinates } from '../types'
import * as THREE from 'three'

// 未显式指定目标点时，相机默认回到当前房间的中心观察方向。
export const defaultCameraTarget: Vector3Coordinates = [0, 0, 0]

export const navigationPoints: NavigationHotspot[] = [
  {
    // 从客厅跳到阳台。
    label: '阳台',
    position: new THREE.Vector3(0, 0, -4),
    cameraTarget: [0, 0, -10]
  },
  {
    // 阳台回到客厅。
    label: '客厅',
    position: new THREE.Vector3(1, 0, -6)
  },
  {
    // 从客厅跳到厨房。
    label: '厨房',
    position: new THREE.Vector3(1.5, 0, 4),
    cameraTarget: [2, 0, 10]
  },
  {
    // 厨房回到客厅。
    label: '客厅',
    position: new THREE.Vector3(1, 0, 6)
  }
]

// 提示点同样走配置，位置决定它在 3D 空间中的锚点，content 决定浮层文案。
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
