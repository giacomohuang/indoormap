import * as THREE from 'three'
export default function showName() {
  const width = window.innerWidth
  const height = window.innerHeight
  let canvas = document.querySelector('#name')
  if (!canvas) return
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  // 新建一个离屏canvas
  const offCanvas = document.createElement('canvas')
  offCanvas.width = width
  offCanvas.height = height
  const ctxOffCanvas = canvas.getContext('2d')
  // 设置canvas字体样式
  ctxOffCanvas.font = '16.5px Arial'
  ctxOffCanvas.strokeStyle = '#FFFFFF'
  ctxOffCanvas.fillStyle = '#000000'
  // texts用来存储显示的名称，重叠的部分就不会放到里面
  const texts = []
  /**
   * 遍历省份数据，有2个核心功能
   * 1. 将3维坐标转化成2维坐标
   * 2. 后面遍历到的数据，要和前面的数据做碰撞对比，重叠的就不绘制
   * */
  this.map.children.forEach((elem, index) => {
    if (!elem.properties._centroid) return
    // 找到中心点
    const y = -elem.properties._centroid[1]
    const x = elem.properties._centroid[0]
    const z = 4
    // 转化为二维坐标
    const vector = new THREE.Vector3(x, y, z)
    const position = vector.project(this.camera)
    // 构建文本的基本属性：名称，left, top, width, height -> 碰撞对比需要这些坐标数据
    const name = elem.properties.name
    const left = ((vector.x + 1) / 2) * width
    const top = (-(vector.y - 1) / 2) * height
    const text = {
      name,
      left,
      top,
      width: ctxOffCanvas.measureText(name).width,
      height: 16.5,
    }
    // 碰撞对比
    let show = true
    for (let i = 0; i < texts.length; i++) {
      if (text.left + text.width < texts[i].left || text.top + text.height < texts[i].top || texts[i].left + texts[i].width < text.left || texts[i].top + texts[i].height < text.top) {
        show = true
      } else {
        show = false
        break
      }
    }
    if (show) {
      texts.push(text)
      ctxOffCanvas.strokeText(name, left, top)
      ctxOffCanvas.fillText(name, left, top)
    }
  })
  // 离屏canvas绘制到canvas中
  ctx.drawImage(offCanvas, 0, 0)
}
