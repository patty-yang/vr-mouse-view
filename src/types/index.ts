import type * as THREE from 'three'

export type Vector3Tuple = [number, number, number]

export interface NavigationPoint {
  text: string
  position: THREE.Vector3
  target?: Vector3Tuple
}

export interface TooltipContent {
  name: string
  type: string
  description: string
}

export interface TooltipPoint {
  url: string
  position: THREE.Vector3
  userData: TooltipContent
}
