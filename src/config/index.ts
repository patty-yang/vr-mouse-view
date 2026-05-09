import type { NavigationPoint, TooltipPoint, Vector3Tuple } from '../types'
import * as THREE from 'three'

export const defaultCameraTarget: Vector3Tuple = [0, 0, 0]

export const navigationPoints: NavigationPoint[] = [
  {
    text: '阳台',
    position: new THREE.Vector3(0, 0, -4),
    target: [0, 0, -10],
  },
  {
    text: '客厅',
    position: new THREE.Vector3(1, 0, -6),
  },
  {
    text: '厨房',
    position: new THREE.Vector3(1.5, 0, 4),
    target: [2, 0, 10],
  },
  {
    text: '客厅',
    position: new THREE.Vector3(1, 0, 6),
  },
]

export const tooltipPoints: TooltipPoint[] = [
  {
    url: '/images/dot.png',
    position: new THREE.Vector3(3, 1, 2),
    userData: {
      name: '艺术画',
      description: '这是一件艺术化的作品，展现了独特的设计理念',
      type: 'information',
    },
  },
  {
    url: '/images/dot.png',
    position: new THREE.Vector3(-2.5, -0.1, -3),
    userData: {
      name: '木雕艺术品',
      description: '这是一件木雕艺术品，展现了精湛的工艺和设计',
      type: 'information',
    },
  },
  {
    url: '/images/dot.png',
    position: new THREE.Vector3(1.5, -0.1, -3),
    userData: {
      name: '工艺画',
      description: '十分抽象的工艺画，给人一种很有艺术感的感觉',
      type: 'information',
    },
  },
]
