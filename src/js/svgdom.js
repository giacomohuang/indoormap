export default function svg2path(node) {
  // 匹配路径中数值的正则
  var regNumber = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g

  if (!node.tagName) return
  var tagName = String(node.tagName).toLowerCase()
  var path, cx, cy, rx, ry, r, x1, y1, x2, y2
  switch (tagName) {
    case 'path':
      path = node.getAttribute('d')
      break
    case 'rect':
      var x = Number(node.getAttribute('x'))
      var y = Number(node.getAttribute('y'))
      var width = Number(node.getAttribute('width'))
      var height = Number(node.getAttribute('height'))
      /*
       * rx 和 ry 的规则是：
       * 1. 如果其中一个设置为 0 则圆角不生效
       * 2. 如果有一个没有设置则取值为另一个
       * 3.rx 的最大值为 width 的一半, ry 的最大值为 height 的一半
       */
      rx = Number(node.getAttribute('rx')) || Number(node.getAttribute('ry')) || 0
      ry = Number(node.getAttribute('ry')) || Number(node.getAttribute('rx')) || 0

      // 非数值单位计算，如当宽度像100%则移除
      // if (isNaN(x - y + width - height + rx - ry)) return;

      rx = rx > width / 2 ? width / 2 : rx
      ry = ry > height / 2 ? height / 2 : ry

      // 如果其中一个设置为 0 则圆角不生效
      if (rx == 0 || ry == 0) {
        // var path =
        //     'M' + x + ' ' + y +
        //     'H' + (x + width) +
        //     'V' + (y + height) +
        //     'H' + x +
        //     'z';
        path = 'M' + x + ' ' + y + 'h' + width + 'v' + height + 'h' + -width + 'z'
      } else {
        path = 'M' + x + ' ' + (y + ry) + 'a' + rx + ' ' + ry + ' 0 0 1 ' + rx + ' ' + -ry + 'h' + (width - rx - rx) + 'a' + rx + ' ' + ry + ' 0 0 1 ' + rx + ' ' + ry + 'v' + (height - ry - ry) + 'a' + rx + ' ' + ry + ' 0 0 1 ' + -rx + ' ' + ry + 'h' + (rx + rx - width) + 'a' + rx + ' ' + ry + ' 0 0 1 ' + -rx + ' ' + -ry + 'z'
      }

      break

    case 'circle':
      cx = node.getAttribute('cx')
      cy = node.getAttribute('cy')
      r = node.getAttribute('r')
      path = 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0' + 'a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0' + 'z'

      break

    case 'ellipse':
      cx = node.getAttribute('cx') * 1
      cy = node.getAttribute('cy') * 1
      rx = node.getAttribute('rx') * 1
      ry = node.getAttribute('ry') * 1

      if (isNaN(cx - cy + rx - ry)) return
      path = 'M' + (cx - rx) + ' ' + cy + 'a' + rx + ' ' + ry + ' 0 1 0 ' + 2 * rx + ' 0' + 'a' + rx + ' ' + ry + ' 0 1 0 ' + -2 * rx + ' 0' + 'z'

      break

    case 'line':
      x1 = node.getAttribute('x1')
      y1 = node.getAttribute('y1')
      x2 = node.getAttribute('x2')
      y2 = node.getAttribute('y2')
      if (isNaN(x1 - y1 + (x2 - y2))) {
        return
      }

      path = 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2

      break

    case 'polygon':
    case 'polyline':
      // ploygon与polyline是一样的,polygon多边形，polyline折线
      var points = (node.getAttribute('points').match(regNumber) || []).map(Number)
      if (points.length < 4) {
        return
      }
      path = 'M' + points.slice(0, 2).join(' ') + 'L' + points.slice(2).join(' ') + (tagName === 'polygon' ? 'z' : '')

      break
  }
  return path || ''
}
