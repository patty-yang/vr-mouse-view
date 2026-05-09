import type * as THREE from 'three'

/**
 * 三维坐标基础类型。
 * 用于描述相机移动和场景配置里复用的 xyz 坐标元组。
 */
export type Vector3Coordinates = [x: number, y: number, z: number]

/**
 * 场景导航热点类型。
 * 用于定义导航标记的文案、所在位置，以及点击后可选的相机目标点。
 */
export interface NavigationHotspot {
  label: string
  position: THREE.Vector3
  cameraTarget?: Vector3Coordinates
}

/**
 * 导航精灵运行时类型。
 * 用于约束 useNavigationSprite 的参数，以及精灵创建阶段依赖的 canvas 数据。
 */
export interface UseNavigationSpriteOptions {
  scene: THREE.Scene
  camera: THREE.Camera
  domElement: HTMLCanvasElement
  position: THREE.Vector3
  label: string
  onClick: () => void
}

export interface CreateNavigationSpriteOptions extends Omit<UseNavigationSpriteOptions, 'label'> {
  canvas: HTMLCanvasElement
}

/**
 * 提示热点内容类型。
 * 用于描述场景提示点本身，以及提示框里要展示的文案数据。
 */
export interface TooltipContent {
  name: string
  type: string
  description: string
}

export interface TooltipHotspot {
  textureUrl: string
  position: THREE.Vector3
  content: TooltipContent
}

/**
 * 提示功能运行时类型。
 * 用于约束 useTooltip 里的参数、精灵资源，以及页面提示层的状态结构。
 */
export interface UseTooltipOptions {
  scene: THREE.Scene
  camera: THREE.Camera
  points: TooltipHotspot[]
  domElement: HTMLCanvasElement
}

export interface TooltipSpriteResources {
  material: THREE.SpriteMaterial
  sprite: THREE.Sprite
  texture: THREE.Texture
}

export interface TooltipOverlayState {
  content: TooltipContent | null
  visible: boolean
  x: number
  y: number
}
