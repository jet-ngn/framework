function generateCharArray (start, end) {
  const chars = []

  for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
    chars.push(String.fromCharCode(i))
  }

  return chars
}

function generateDigits () {
  let digits = {}

  for (let i = 0; i < 10; i++) {
    digits[i] = `Digit${i}`
  }

  return digits
}

export default {
  ...generateCharArray('a', 'z').reduce((chars, char) => {
    chars[char] = `Key${char.toUpperCase()}`
    return chars
  }, {}),

  ...generateDigits(),

  alt: 'Alt',

  again: 'Again',

  down: 'ArrowDown',
  arrowdown: 'ArrowDown',

  left: 'ArrowLeft',
  arrowleft: 'ArrowLeft',

  right: 'ArrowRight',
  arrowright: 'ArrowRight',

  up: 'ArrowUp',
  arrowup: 'ArrowUp',

  audiovolumedown: 'AudioVolumeDown',
  audiovolumemute: 'AudioVolumeMute',
  audiovolumeup: 'AudioVolumeUp',

  '`': 'Backquote',
  backquote: 'Backquote',

  '\\': 'Backslash',
  backslash: 'Backslash',

  backspace: 'Backspace',
  bracketleft: 'BracketLeft',
  bracketright: 'BracketRight',
  browserback: 'BrowserBack',
  browserfavorites: 'BrowserFavorites',
  browserforward: 'BrowserForward',
  browserhome: 'BrowserHome',
  browserrefresh: 'BrowserRefresh',
  browsersearch: 'BrowserSearch',
  browserstop: 'BrowserStop',

  caps: 'CapsLock',
  capslock: 'CapsLock',

  ctrl: 'Control',
  control: 'Control',

  convert: 'Convert',

  ',': 'Comma',
  comma: 'Comma',

  command: 'Command',
  cmd: 'Command',

  contextmenu: 'Contextmenu',
  copy: 'Copy',
  cut: 'Cut',

  del: 'Delete',
  delete: 'Delete',

  eject: 'Eject',
  end: 'End',
  enter: 'Enter',

  '=': 'Equal',
  'equal': 'Equal',

  esc: 'Escape',
  escape: 'Escape',

  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',
  f13: 'F13',
  f14: 'F14',
  f15: 'F15',
  f16: 'F16',
  f17: 'F17',
  f18: 'F18',
  f19: 'F19',
  f20: 'F20',
  f21: 'F21',
  f22: 'F22',
  f23: 'F23',
  f24: 'F24',
  find: 'Find',
  fn: 'Fn',
  help: 'Help',
  home: 'Home',
  insert: 'Insert',
  intlbackslash: 'IntlBackslash',
  intlro: 'IntlRo',
  intlyen: 'IntlYen',
  kanamode: 'KanaMode',
  lang1: 'Lang1',
  lang2: 'Lang2',
  launchapp1: 'LaunchApp1',
  mediaplaypause: 'MediaPlayPause',
  mediastop: 'MediaStop',
  mediatracknext: 'MediaTrackNext',
  mediatrackprevious: 'MediaTrackPrevious',
  metaleft: 'MetaLeft',
  metaright: 'MetaRight',

  '-': 'Minus',
  'minus': 'Minus',

  nonconvert: 'NonConvert',
  numlock: 'NumLock',
  numpad0: 'Numpad0',
  numpad1: 'Numpad1',
  numpad2: 'Numpad2',
  numpad3: 'Numpad3',
  numpad4: 'Numpad4',
  numpad5: 'Numpad5',
  numpad6: 'Numpad6',
  numpad7: 'Numpad7',
  numpad8: 'Numpad8',
  numpad9: 'Numpad9',
  numpadadd: 'NumpadAdd',
  numpadcomma: 'NumpadComma',
  numpaddecimal: 'NumpadDecimal',
  numpaddivide: 'NumpadDivide',
  numpadenter: 'NumpadEnter',

  '*': 'NumpadMultiply',
  numpadmultiply: 'NumpadMultiply',

  numpadsubtract: 'NumpadSubtract',
  open: 'Open',

  opt: 'Alt',
  option: 'Alt',

  osleft: 'OSLeft',
  osright: 'OSRight',
  pagedown: 'PageDown',
  pageup: 'PageUp',
  paste: 'Paste',
  pause: 'Pause',

  '.': 'Period',
  period: 'Period',

  power: 'Power',
  printscreen: 'PrintScreen',
  props: 'Props',

  '"': 'Quote',
  quote: 'Quote',

  scrolllock: 'ScrollLock',
  select: 'Select',

  ';': 'Semicolon',
  semicolon: 'Semicolon',

  shift: 'Shift',

  '/': 'Slash',
  slash: 'Slash',

  sleep: 'Sleep',

  ' ': 'Space',
  space: 'Space',

  undo: 'Undo',
  wakeup: 'WakeUp'
}
