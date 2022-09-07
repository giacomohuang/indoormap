<template>
  <div id="map_container"></div>
</template>
<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
console.log('hellow world')
let scene = null
let camera = null
let renderer = null
let mesh = null
onMounted(() => {
  init()
  window.addEventListener('resize', onWindowResize, false)
  window.addEventListener('click', onMouseDblclick, false)
})

function init() {
  // 创建场景
  scene = new THREE.Scene()
  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5
  camera.position.x = 0
  createGeometry()
  createRender()
  animate()
}

function createGeometry() {
  let geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
  let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}
//创建渲染器
function createRender() {
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0xb9d3ff, 1) //设置背景颜色
  // 这里和官网不同，是因为我想在canvas内部添加元素 ，用position：absolute  就可以 是的元素和     three.js得模型对象共存一个画布了
  let container = document.getElementById('map_container')
  container.appendChild(renderer.domElement)
}
// 渲染场景
function animate() {
  requestAnimationFrame(animate)
  render()
}
// 设置物体行为
function render() {
  mesh.rotation.x += 0.01
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
}
// 窗口变动触发的方法
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMouseDblclick(event) {
  // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
  var intersects = getIntersects(event)
  // 获取选中最近的 Mesh 对象
  if (intersects.length != 0 && intersects[0].object instanceof THREE.Mesh) {
    console.log('click')
    // .$router.push({ name: 'test' })
  }
}
// 获取与射线相交的对象数组
function getIntersects(event) {
  event.preventDefault()
  // 声明 raycaster 和 mouse 变量
  var raycaster = new THREE.Raycaster()
  var mouse = new THREE.Vector2()

  // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
  raycaster.setFromCamera(mouse, camera)

  // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
  var intersects = raycaster.intersectObjects(scene.children)

  //返回选中的对象
  return intersects
}
</script>
