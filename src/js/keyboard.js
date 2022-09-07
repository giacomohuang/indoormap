const IS_MAC = navigator.userAgent.includes('Mac')

let keyboard = {
  key: {},
  getKeyCombo(ev) {
    this.key.symbol = ''
    if (ev.metaKey) {
      this.key.symbol = '⌘+'
      this.key.fn = 'cmd'
    }
    if (ev.ctrlKey) {
      this.key.symbol += IS_MAC ? '⌃+' : 'ctrl+'
      this.key.fn = 'ctrl'
    }
    if (ev.altKey) {
      this.key.symbol += IS_MAC ? '⌥+' : 'alt+'
      this.key.fn = 'alt'
    }

    if (ev.shiftKey) {
      this.key.symbol += IS_MAC ? '⇧+' : 'shift+'
      this.key.fn = 'shift'
    }
    if (ev.keyCode >= 49 && ev.keyCode <= 90) {
      this.key.symbol += String.fromCharCode(ev.keyCode)
      this.key.name = ev.key
    }
    if (this.key.symbol.charAt(this.key.symbol.length - 1) == '+') {
      this.key.symbol = this.key.symbol.slice(0, this.key.symbol.length - 1)
    }
    return this.key
  },
  clearKeyCombo() {
    this.key = {}
  },
  cmdOrCtrlPressed() {
    let ret
    if (IS_MAC) {
      ret = this.key.fn === 'cmd'
    } else {
      ret = this.key.fn === 'ctrl'
    }
    return ret
  },
}

let codeEnum = {
  // numberic key
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  // alphabet key
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  // punctuation key
  // ;
  semicolon: 186,
  // =
  is_equal_to: 187,
  // ,
  comma: 188,
  // _
  underscore: 189,
  // .
  period: 190,
  // /
  slash: 191,
  // `
  grave_accent: 192,
  // [
  open_bracket: 219,
  // |
  vertical_bar: 220,
  // ]
  close_bracket: 221,
  // '
  apostrophe: 222,
  // control key
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  shift: 16,
  cotrol: 17,
  alt: 18,
  capslock: 20,
  esc: 27,
  spacebar: 32,
  page_up: 33,
  page_down: 34,
  end: 35,
  home: 36,
  left_arrow: 37,
  up_arrow: 38,
  right_arrow: 39,
  down_arrow: 40,
  insert: 45,
  delete: 46,
  num_lock: 144,
}
export default keyboard
