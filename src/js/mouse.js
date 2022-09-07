let mouse = {
  getScreenCoords() {
    let x = 0,
      y = 0
    let e = window.event
    if (e.pageX) {
      x = e.pageX
      y = e.pageY
    } else {
      x = e.clientX + document.body.scrollLeft - document.body.clientLeft
      y = e.clientY + document.body.scrollTop - document.body.clientTop
    }
    return { x: x, y: y }
  },

  isIn(el) {
    const elPos = this.getHtmlElementCoords(el)
    const mousePos = this.getScreenCoords()
    if (mousePos.x > elPos.left + el.offsetWidth || mousePos.x < elPos.left || mousePos.y > elPos.top + el.offsetHeight || mousePos.y < elPos.top) {
      return false
    } else {
      return true
    }
  },

  getHtmlElementCoords(el) {
    let Box = el.getBoundingClientRect(),
      doc = el.ownerDocument,
      body = doc.body,
      html = doc.documentElement,
      clientTop = html.clientTop || body.clientTop || 0,
      clientLeft = html.clientLeft || body.clientLeft || 0,
      top = Box.top + (self.pageYOffset || html.scrollTop || body.scrollTop) - clientTop,
      left = Box.left + (self.pageXOffset || html.scrollLeft || body.scrollLeft) - clientLeft
    return { top: top, left: left }
  },
}
export default mouse
