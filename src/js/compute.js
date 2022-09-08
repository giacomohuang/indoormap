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
