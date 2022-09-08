<template>
  <div id="globaltips" style="position: absolute; z-index: 1000; left: 100px; top: 100px; width: 200px; border-radius: 5px; height: 20px; font-size: 12px; background: #666666f0; color: #fff; padding: 4px 8px; line-height: 12px; vertical-align: middle">12121</div>
  <div class="wrap">
    <header class="toolbar">
      <div class="logo">MapEditor</div>
      <div class="toolbar">
        <div class="toolbar_item" @click="startDraw('polygon')">多边形</div>
        <el-button size="small" @click="canvasZoomIn">缩小</el-button>
        {{ zoom }}% <el-button size="small" @click="canvasZoomOut">放大</el-button>
      </div>
    </header>
    <div class="content">
      <div class="layer-wrap">sdfsdfsdfsfd</div>
      <div class="content-wrap">
        <el-scrollbar>
          <div class="svg-wrap" id="svg"></div>
        </el-scrollbar>
      </div>
      <div class="sider-wrap"></div>
    </div>
    <footer>
      <div style="width: 200px">
        <span>Mouse Coords: </span><el-tag round type="info" class="mx-3">{{ Math.floor(mouseCoords.x) }},{{ Math.floor(mouseCoords.y) }}</el-tag>
      </div>
      <div style="width: 300px">
        <span>Selected el: </span><el-tag round type="info" class="mx-3">&nbsp;{{ mouseCoords.el }}&nbsp;</el-tag>
      </div>
      <div style="width: 400px">
        <span>Hotkey: </span><el-tag round type="info" class="mx-3">&nbsp;{{ hotkey }}&nbsp;</el-tag>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Shortcuts } from 'shortcuts'
import { onMounted, ref } from 'vue'
import { SVG } from '@svgdotjs/svg.js'
import mouse from '../js/mouse'
import keyboard from '../js/keyboard'
import { nanoid } from 'nanoid'
import { transformOn } from '@vue/compiler-core'

let canvas
let workarea
let background
let workMode
let drawingEl
const canvasSize = { width: 640, height: 480 }
// let editMode = null
const zoom = ref(100)
const mouseCoords = ref({ x: 0, y: 0, el: null })
const selectedId = ref('')
const hotkey = ref('')
const POINT_SIZE = 10
// let editMode = ''

onMounted(() => {
  document.addEventListener('mousemove', function () {
    var coords = getMouseSvgCoords()
    mouseCoords.value.x = coords.x
    mouseCoords.value.y = coords.y
    mouseCoords.value.el = selectedId.value
  })

  const shortcuts = new Shortcuts()
  shortcuts.add([
    // Adding some shortcuts
    {
      shortcut: 'CmdOrCtrl+A',
      handler: (event) => {
        event.preventDefault()
        return true // Returning true because we don't want other handlers for the same shortcut to be called later
      },
    },
    {
      shortcut: 'CmdOrCtrl+-',
      handler: (event) => {
        // Doing something...
        event.preventDefault()
        canvasZoomIn()
        return true // Returning true because we don't want other handlers for the same shortcut to be called later
      },
    },
    {
      shortcut: 'CmdOrCtrl+=',
      handler: (event) => {
        console.log(event.type)

        // Doing something...
        event.preventDefault()
        canvasZoomOut()
        return true // Returning true because we don't want other handlers for the same shortcut to be called later
      },
    },
  ])
  /*
  canvas structure:
  ----------------------------
  svg:s_workarea
    |-- svg:s_background
    |-- svg:s_canvas
      |-- element(s):editable_{nanoid}
      |-- g:control_group_{nanoid}
      |-- rect:boundrect_{nanoid}
      |-- g:group_points_{nanoid}
  ----------------------------
  */

  // init canvas structure
  workarea = SVG().id('s_workarea').addTo('#svg').size(2048, 1440).viewbox(0, 0, 2048, 1440)
  background = SVG().id('s_background').addTo('#s_workarea').size(canvasSize.width, canvasSize.height).viewbox(0, 0, canvasSize.width, canvasSize.height).rect('100%', '100%').id('bgrect').fill('#fff')
  canvas = SVG().id('s_canvas').addTo('#s_workarea').size(2048, 1440).viewbox(0, 0, 2048, 1440)
  //---------------

  document.addEventListener('keydown', onKeyDown, false)
  function onKeyDown(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    let key = keyboard.getKeyCombo(ev)
    hotkey.value = key.symbol
  }

  document.addEventListener('keyup', onKeyUp, false)
  function onKeyUp(ev) {
    ev.preventDefault()
    keyboard.clearKeyCombo()
    hotkey.value = ''
  }

  // sample data
  canvas
    .rect(100, 50)
    .id('editable_' + nanoid())
    .move(150, 150)
    .fill('red')
    .rotate(60)
    .attr({ stroke: '#000', 'stroke-width': '1', 'vector-effect': 'non-scaling-stroke' })
  canvas
    .rect(20, 100)
    .id('editable_' + nanoid())
    .move(300, 200)
    .fill('red')
    .attr({ stroke: '#000', 'stroke-width': '1', 'vector-effect': 'non-scaling-stroke' })
  //---------------
  canvas
    .polyline([
      [0, 0],
      [100, 50],
      [50, 100],
    ])
    .id('editable_' + nanoid())
    .x(120)
    .y(200)

  workarea.on(
    'click',
    (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      // console.log(workMode)
      // if (workMode) return
      ev.preventDefault()
      // ev.stopPropagation()
      console.log('workarea_click:', ev.target.id)

      // if click in blank area and no element is selected, remove the control point layer
      if (ev.target.id == 'bgrect' && selectedId.value) {
        console.log('canvas_mouseup')
        SVG('#control_group_' + selectedId.value).remove()
        selectedId.value = ''
      }
    },
    false
  )

  canvas.on('mousedown', (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    let dx, dy
    console.log('mousedown')
    if (ev.target.id.includes('editable')) {
      const svgEl = SVG(ev.target)
      const coords = getMouseSvgCoords(svgEl)
      dx = coords.x - svgEl.x()
      dy = coords.y - svgEl.y()
      document.addEventListener('mousemove', mouseMove, false)
      document.addEventListener('mouseup', mouseUp, false)
    }
    function mouseMove() {
      ev.preventDefault()
      ev.stopPropagation()
      console.log('mouseMove:', ev.target.id)
      const svgEl = SVG(ev.target)
      const coords = getMouseSvgCoords(svgEl)
      // const sCoords = mouse.getScreenCoords()
      // console.log(document.querySelector('#globaltips'))
      // document.querySelector('#globaltips').style.left = sCoords.x + 'px'
      // document.querySelector('#globaltips').style.top = sCoords.y + 'px'
      svgEl.x(coords.x - dx).y(coords.y - dy)
      if (ev.metaKey) hotkey.value = 'cmd'
      removeControlGroup()
    }
    function mouseUp() {
      ev.preventDefault()
      ev.stopPropagation()
      console.log('mouse up:', ev.target.id)
      // triggered by editable element
      if (selectedId.value) {
        SVG('#control_group_' + selectedId.value).remove()
      }
      addControl(ev.target)
      console.log('sele val:', selectedId.value, 'ev.target.id:', ev.target.id.slice(9))
      document.removeEventListener('mousemove', mouseMove, false)
      document.removeEventListener('mouseup', mouseUp, false)
    }
  })

  document.addEventListener('dblclick', onDblClick, false)

  function onDblClick(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    if (ev.target.id.includes('editable')) {
      console.log('********dblClick********')
      const editableId = ev.target.id.slice(9)
      const controlGroup = SVG('#control_group_' + editableId)
      controlGroup.removeClass('grip_points').addClass('grip_points_editmode')
    }
  }
})

function removeControlGroup() {
  let controlGroup = SVG('#control_group_' + selectedId.value)
  if (controlGroup) controlGroup.hide()
}

function startDraw(elType) {
  let plots
  switch (elType) {
    case 'polygon':
      document.addEventListener('click', mouseClick, false)
      workMode = 'startdraw'
      break
  }
  function mouseClick(ev) {
    ev.stopPropagation()
    ev.preventDefault()
    let coords = getMouseSvgCoords(canvas)
    console.log('drawEl:mouseClick')
    switch (elType) {
      case 'polygon':
        if (workMode == 'startdraw') {
          console.log('startdraw')
          plots = []
          if (!drawingEl) return
          drawingEl = canvas
            .polygon()
            .id('editable' + nanoid())
            .addClass('polygon')
          plots.push([coords.x, coords.y])
          workMode = 'drawing'
          return
        } else if (workMode == 'drawing') {
          plots.push([coords.x, coords.y])
          console.log(drawingEl)
          drawingEl.plot([plots])
        }

        break
    }
  }
}

// function snapToEl() {}
// function snapToGrid() {}

function addControl(el) {
  const editableEl = SVG(el)
  const editableId = el.id.slice(9)
  selectedId.value = editableId
  console.log('add contorl selecv:', selectedId.value)
  const controlGroup = canvas.group().id('control_group_' + selectedId.value)
  const bound = editableEl.bbox(canvas)
  console.log(bound)
  // render bound rect
  const boundEl = controlGroup
    .rect(bound.w, bound.h)
    .id('boundrect_' + selectedId.value)
    .addClass('boundrect')
    .x(bound.x)
    .y(bound.y)

  const gripPointGroup = controlGroup.group().id('grip_points_' + selectedId.value)

  const gripPoints = {
    n: { x: bound.x + bound.w / 2, y: bound.y },
    ne: { x: bound.x + bound.w, y: bound.y },
    e: { x: bound.x + bound.w, y: bound.y + bound.h / 2 },
    se: { x: bound.x + bound.w, y: bound.y + bound.h },
    s: { x: bound.x + bound.w / 2, y: bound.y + bound.h },
    sw: { x: bound.x, y: bound.y + bound.h },
    w: { x: bound.x, y: bound.y + bound.h / 2 },
    nw: { x: bound.x, y: bound.y },
  }
  const size = (100 / zoom.value) * POINT_SIZE
  Object.entries(gripPoints).forEach(([direction, coords]) => {
    gripPointGroup
      .circle(size, size)
      .addClass('grip_point')
      .attr({ name: direction, style: 'cursor:' + direction + '-resize' })
      .cx(coords.x)
      .cy(coords.y)
      .on('mousedown', (ev) => {
        console.log('mousedown')
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
        const bd = { x: boundEl.x(), y: boundEl.y(), cx: boundEl.cx(), cy: boundEl.cy(), w: boundEl.width(), h: boundEl.height() }

        // triggered by mouse move
        function mouseMove() {
          const el = SVG(ev.target)
          const coords = getMouseSvgCoords(el)
          const elName = el.attr('name')

          if (keyboard.cmdOrCtrlPressed()) {
            // rotate mode
            // console.log('rotate')
            const deg1 = Math.atan2(coords.y - boundEl.cy(), coords.x - boundEl.cx())
            const deg2 = Math.atan2(el.cy() - boundEl.cy(), el.cx() - boundEl.cx())
            const deg_delta = ((deg1 - deg2) * 180) / Math.PI
            // console.log('deg_delta:', deg_delta)
            editableEl.rotate(deg_delta)
            controlGroup.rotate(deg_delta)

            updateGripPoints(editableId)
          } else {
            // strech mode
            if (elName == 'n' || elName == 'ne' || elName == 'nw') {
              el.cy(coords.y)
              const dy = bd.y + bd.h
              if (coords.y <= dy) {
                boundEl.y(coords.y).height(Math.abs(coords.y - dy))
                editableEl.y(coords.y).height(Math.abs(coords.y - dy))
              } else {
                boundEl.y(dy).height(coords.y - dy)
                editableEl.y(dy).height(coords.y - dy)
              }
            }
            if (elName == 's' || elName === 'se' || elName == 'sw') {
              el.cy(coords.y)
              const dy = coords.y - bd.y
              if (coords.y >= bd.y) {
                boundEl.y(bd.y).height(dy)
                editableEl.y(bd.y).height(dy)
              } else {
                editableEl.y(coords.y).height(Math.abs(dy))
                boundEl.y(coords.y).height(Math.abs(dy))
              }
            }
            if (elName == 'w' || elName == 'nw' || elName == 'sw') {
              el.cx(coords.x)
              const dx = bd.x + bd.w
              if (coords.x <= dx) {
                boundEl.x(coords.x).width(Math.abs(coords.x - dx))
                editableEl.x(coords.x).width(Math.abs(coords.x - dx))
              } else {
                boundEl.x(dx).width(coords.x - dx)
                editableEl.x(dx).width(coords.x - dx)
              }
            }
            if (elName == 'e' || elName == 'ne' || elName == 'se') {
              el.cx(coords.x)
              const dx = coords.x - bd.x
              if (coords.x >= bd.x) {
                boundEl.x(bd.x).width(dx)
                editableEl.x(bd.x).width(dx)
              } else {
                editableEl.x(coords.x).width(Math.abs(dx))
                boundEl.x(coords.x).width(Math.abs(dx))
              }
            }
            updateGripPoints(editableId)
          }
        }
        // triggered by mouse up
        function mouseUp() {
          document.removeEventListener('mousemove', mouseMove)
          document.removeEventListener('mouseup', mouseUp)
        }
      })
  })
  controlGroup.transform(editableEl.transform())
}

function updateGripPoints(editableId) {
  const controlGroup = SVG('#control_group_' + editableId)
  if (!controlGroup) return
  const bound = SVG('#boundrect_' + editableId).bbox()
  const gp = SVG('#grip_points_' + editableId).children()
  const gripPoints = {
    n: { x: bound.x + bound.w / 2, y: bound.y },
    ne: { x: bound.x + bound.w, y: bound.y },
    e: { x: bound.x + bound.w, y: bound.y + bound.h / 2 },
    se: { x: bound.x + bound.w, y: bound.y + bound.h },
    s: { x: bound.x + bound.w / 2, y: bound.y + bound.h },
    sw: { x: bound.x, y: bound.y + bound.h },
    w: { x: bound.x, y: bound.y + bound.h / 2 },
    nw: { x: bound.x, y: bound.y },
  }
  Object.entries(gripPoints).forEach(([, coords], index) => {
    const size = (100 / zoom.value) * POINT_SIZE
    gp[index].size(size).cx(coords.x).cy(coords.y)
  })
}

function getMouseSvgCoords(svgEl) {
  let el = null
  let pt = null

  if (svgEl) {
    el = svgEl
  } else {
    el = canvas
  }
  pt = el.point()
  const coords = mouse.getScreenCoords()
  pt.x = coords.x
  pt.y = coords.y
  return pt.transform(el.node.getScreenCTM().inverse())
}

function canvasZoomIn() {
  if (zoom.value > 25) {
    zoom.value -= 25
  } else if (zoom.value > 1) {
    zoom.value = Math.floor(zoom.value / 2)
  }
  changeCanvasSize()
  updateGripPoints(selectedId.value)
}

function canvasZoomOut() {
  if (zoom.value <= 25) {
    zoom.value = Math.floor(zoom.value * 2)
  } else if (zoom.value > 66 && zoom.value < 100) {
    zoom.value = 100
  } else if (zoom.value <= 475) {
    zoom.value += 25
  }
  changeCanvasSize()
  updateGripPoints(selectedId.value)
}

function changeCanvasSize() {
  const viewBox = canvas.viewbox()
  canvas.size(viewBox.width * (zoom.value / 100), viewBox.height * (zoom.value / 100))
}
</script>

<style lang="scss">
.wrap {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: #fff;
}
header,
footer {
  flex: 0 0 auto;
}

header {
  display: flex;
  height: 40px;
  border-bottom: 1px solid #cccccc;
  flex-direction: row;
  align-items: center;
  box-shadow: 0 3px 5px #f7f7f7;
}
footer {
  height: 40px;
  border-top: 1px solid #cccccc;
  display: flex;
  align-items: center;
  padding-left: 12px;
  span {
    font-size: 10px;
    color: #333;
  }
}
.content {
  flex: 1 0;
  display: flex;
  flex-direction: row;
  background: #f7f7f7;
}

.content-wrap {
  flex: 1 0;
  overflow: auto;
  // border: 1px solid #cccccc;
}
.svg-wrap {
  position: absolute;
  // border: 1px solid #cccccc;
  background: #f7f7f7;
  overflow: hidden;
  // box-shadow: 3px 3px 8px #cccccc;
}
.sider-wrap {
  flex: 0 0 auto;
  width: 240px;
  background: #ffffff;
  border-left: 1px solid #cccccc;
}
.layer-wrap {
  flex: 0 0 auto;
  width: 230px;
  background: #ffffff;
  border-right: 1px solid #cccccc;
}
.logo {
  display: flex;
  width: 200px;
  padding: 0 12px;
}
.toolbar {
  display: flex;
  flex-direction: row;
}
.cursor_pen {
  cursor: url(../assets/cursors/pen.png);
}
</style>

<style>
/* SVG Styles */
.grip_point {
  fill: #fff;
  stroke: #dcdcdc;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.polygon {
  stroke: #006600;
  fill: #33cc33;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

/* .grip_point_vetoredit {
  fill: #333;
  stroke-width: none;
  vector-effect: non-scaling-stroke;
} */

.boundrect {
  pointer-events: none;
  stroke: #dcdcdc;
  fill: none;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
</style>
