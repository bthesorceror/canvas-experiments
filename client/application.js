const domready = require('domready')

domready(() => {
  let root = document.querySelector('#content')
  let canvas = document.createElement('canvas')

  canvas.width = 800
  canvas.height = 600

  root.appendChild(canvas)

  let context = canvas.getContext('2d')
  context.fillStyle = '#000000'
  context.fillRect(0, 0, 800, 600)
})
