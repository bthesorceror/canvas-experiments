const domready = require('domready')
const gameloop = require('gameloop')
const _ = require('lodash')
const ArcadeKeys = require('arcade_keys')

const Keys = (function () {
  let keys = ArcadeKeys()

  function isDown (key) {
    let appliable = {
      left: [ArcadeKeys.keys.left, ArcadeKeys.keys.a],
      right: [ArcadeKeys.keys.right, ArcadeKeys.keys.d],
      down: [ArcadeKeys.keys.down, ArcadeKeys.keys.s],
      up: [ArcadeKeys.keys.up, ArcadeKeys.keys.w],
      space: [ArcadeKeys.keys.space]
    }[key] || []

    return _.some(
      appliable,
      _.bind(keys.isPressed, keys)
    )
  }

  function allDown (...list) {
    return _.every(list, isDown)
  }

  return {
    isDown,
    allDown
  }
})()

function spin (entity, dt, rotationSpeed) {
  let rotation = rotationSpeed * dt
  if (!_.hasIn(entity, 'rotation')) {
    entity.rotation = 0
  }

  entity.rotation += rotation
  entity.rotation = entity.rotation % (2 * Math.PI)
}

function playerRotations (dt) {
  let { rotationSpeed } = this.options

  if (Keys.allDown('space', 'right')) {
    spin(this, dt, -rotationSpeed)
  }

  if (Keys.allDown('space', 'left')) {
    spin(this, dt, rotationSpeed)
  }
}

function userMover (dt) {
  let multiplier = 70

  if (Keys.isDown('left')) {
    this.x -= (dt * multiplier)
  }

  if (Keys.isDown('right')) {
    this.x += (dt * multiplier)
  }

  if (Keys.isDown('up')) {
    this.y -= (dt * multiplier)
  }

  if (Keys.isDown('down')) {
    this.y += (dt * multiplier)
  }
}

class Entity {
  constructor (x, y, options = {}) {
    this.x = x
    this.y = y
    this.options = _.defaults(options, {
      width: 0,
      height: 0,
      updaters: [],
      renderers: []
    })
  }

  update (dt) {
    let { updaters } = this.options
    _.each(updaters, (u) => u.call(this, dt))
  }

  draw (context) {
    let { width, height, renderers } = this.options

    _.each(renderers, (renderer) => {
      context.save()
      context.translate(
        this.x - width / 2.0,
        this.y - height / 2.0
      )
      renderer.call(this, context)
      context.restore()
    })
  }
}

function Rotation (dt) {
  let { rotationSpeed } = this.options

  spin(this, dt, rotationSpeed)
}

function Falling (dt) {
  let { fallingSpeed } = this.options

  this.y += (fallingSpeed * dt)
}

function SquareRenderer (context) {
  let { color, width, height } = this.options

  context.rotate(this.rotation)
  context.fillStyle = color
  context.beginPath()
  context.moveTo(
    -width / 2.0,
    -height / 2.0
  )
  context.lineTo(
    width / 2.0,
    -height / 2.0
  )
  context.lineTo(
    width / 2.0,
    height / 2.0
  )
  context.lineTo(
    -width / 2.0,
    height / 2.0
  )
  context.closePath()
  context.fill()
}

function square (x, y, options = {}) {
  return new Entity(x, y, _.defaults(options, {
    color: '#FFFFFF',
    fallingSpeed: 40,
    rotationSpeed: 5,
    width: 40,
    height: 40,
    renderers: [
      SquareRenderer
    ],
    updaters: [
      Rotation,
      Falling
    ]
  }))
}

function createCanvas (width, height) {
  let canvas = document.createElement('canvas')

  canvas.width = 800
  canvas.height = 600

  return canvas
}

domready(() => {
  let root = document.querySelector('#content')
  let canvas = createCanvas(800, 600)
  let gamescreen = createCanvas(800, 600)
  let context = canvas.getContext('2d')
  let game = gameloop({ renderer: context })

  let square1 = square(400, 300, {
    rotationSpeed: -25,
    fallingSpeed: -80,
    width: 50,
    height: 50
  })

  let square2 = square(200, 100, {
    color: '#FF00FF',
    rotationSpeed: 15
  })

  let square3 = square(100, 500, {
    color: '#FF0000',
    updaters: [userMover]
  })

  let square4 = square(100, 400, {
    color: '#FF0000',
    rotationSpeed: 25,
    updaters: [userMover, playerRotations]
  })

  let square5 = square(400, 400, {
    color: '#FFF030',
    rotationSpeed: 25,
    updaters: []
  })

  let squares = [
    square1,
    square2,
    square3,
    square4,
    square5
  ]

  function clearCanvas () {
    context.save()

    context.fillStyle = '#000000'
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.restore()
  }

  function copyCanvas () {
    let gameContext = gamescreen.getContext('2d')
    let image = context.getImageData(0, 0, 800, 600)

    gameContext.putImageData(image, 0, 0)
  }

  game.on('update', (dt) => {
    _.each(squares, (s) => s.update(dt))
    squares = _.sortBy(squares, _.property('y'))
  })

  game.on('draw', (context) => {
    clearCanvas()
    _.each(squares, (s) => s.draw(context))
    copyCanvas()
  })

  window.addEventListener('blur', () => {
    game.pause()
  })

  window.addEventListener('focus', () => {
    game.resume()
  })

  game.start()

  root.appendChild(gamescreen)
})
