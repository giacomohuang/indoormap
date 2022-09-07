//计算任意多边形的面积，顶点按照顺时针或者逆时针方向排列
// points[{x:1,y:1},{x:2},{y:3}]
export function polygonArea(points) {
  const point_num = points.length()
  if (point_num < 3) return 0.0
  let s = points[0].y * (points[point_num - 1].x - points[1].x)
  for (let i = 1; i < point_num; ++i) {
    s += points[i].y * (points[i - 1].x - points[(i + 1) % point_num].x)
  }
  return Math.abs(s / 2.0)
}

export function getAngle(po, pa, pb) {
  const oa = { x: pa.x - po.x, y: pa.y - po.y }
  const ob = { x: pb.x - po.x, y: pb.y - po.y }
  const oa_len = Math.sqrt(oa.x * oa.x + oa.y * oa.y)
  const ob_len = Math.sqrt(ob.x * ob.x + ob.y * ob.y)
  const product = oa.x * ob.x + oa.y * ob.y
  const cos = (Math.acos(product / (oa_len * ob_len)) * 180) / Math.PI
  console.log(cos)
  return cos
}

export function getAngle2(pa, pb) {
  const dot = pa.x * pb.x + pa.y + pb.y
  const det = pa.x * pb.x - pa.y + pb.y
  const angle = (Math.atan2(det, dot) / Math.PI) * 180
  return (angle + 360) % 360
}
