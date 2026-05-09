import type { Ref } from 'vue'
import * as THREE from 'three'
import { onMounted, onUnmounted } from 'vue'

export function useThreeCore(container: Ref<HTMLDivElement | null>) {
  let animationFrameId = 0
  let mountedContainer: HTMLDivElement | null = null

  /**
   * 初始化场景
   */
  const scene = new THREE.Scene()

  /**
   * 初始化相机
   */
  const camera = new THREE.PerspectiveCamera(
    75,
    1, // 宽高比
    0.1, // 近的一面
    1000, // 远的一面
  )

  /**
   * 初始化相机位置
   */
  // camera.position.z = 30
  camera.position.set(0, 0, 0.01)
  camera.rotation.order = 'YXZ'

  /**
   * 初始化渲染器
   */
  const renderer = new THREE.WebGLRenderer()

  function resizeRenderer() {
    const target = mountedContainer ?? container.value
    const width = target?.clientWidth ?? window.innerWidth
    const height = target?.clientHeight ?? window.innerHeight
    if (width <= 0 || height <= 0)
      return

    // 更新相机的宽高比
    camera.aspect = width / height
    // 更新相机的投影矩阵
    camera.updateProjectionMatrix()
    // 更新渲染器的大小
    renderer.setSize(width, height)
  }

  function renderLoop() {
    renderer.render(scene, camera) // 执行渲染操作
    animationFrameId = requestAnimationFrame(renderLoop)
  }

  function mountScene() {
    if (mountedContainer || !container.value)
      return

    mountedContainer = container.value
    mountedContainer.appendChild(renderer.domElement)
    resizeRenderer()
    window.addEventListener('resize', resizeRenderer)
    renderLoop()
  }

  function unmountScene() {
    if (animationFrameId)
      cancelAnimationFrame(animationFrameId)
    animationFrameId = 0

    window.removeEventListener('resize', resizeRenderer)

    if (mountedContainer && renderer.domElement.parentElement === mountedContainer)
      mountedContainer.removeChild(renderer.domElement)
    mountedContainer = null

    renderer.dispose()
  }

  onMounted(mountScene)
  onUnmounted(unmountScene)

  return {
    scene,
    camera,
    renderer,
  }
}
