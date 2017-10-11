const domready = require('domready')
const gameloop = require('gameloop')
const _ = require('lodash')

class Entity {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.updaters = []
    this.renderers = []
  }

  update (dt) {
    _.each(
      this.updaters,
      (updater) => updater(this, dt)
    )
  }

  draw (context) {
    _.each(this.renderers, (renderer) => {
      context.save()
      context.translate(
        this.x - this.width / 2.0,
        this.y - this.height / 2.0
      )
      renderer(this, context)
      context.restore()
    })
  }
}

const Rotation = (entity, rotationSpeed) => {
  entity.rotation = 0

  return (entity, dt) => {
    let rotation = rotationSpeed * dt

    entity.rotation += rotation
    entity.rotation = entity.rotation % (2 * Math.PI)
  }
}

const Falling = (fallingSpeed) => {
  return (entity, dt) => {
    entity.y += (fallingSpeed * dt)
  }
}

const SquareRenderer = (color) => {
  return (entity, context) => {
    context.rotate(entity.rotation)
    context.fillStyle = color
    context.beginPath()
    context.moveTo(
      -entity.width / 2.0,
      -entity.height / 2.0
    )
    context.lineTo(
      entity.width / 2.0,
      -entity.height / 2.0
    )
    context.lineTo(
      entity.width / 2.0,
      entity.height / 2.0
    )
    context.lineTo(
      -entity.width / 2.0,
      entity.height / 2.0
    )
    context.closePath()
    context.fill()
  }
}

class Square extends Entity {
  constructor (x, y, width, height, options = {}) {
    super(x, y, 2)

    options = _.defaults(options, {
      color: '#FFFFFF',
      fallingSpeed: 40,
      rotationSpeed: 5
    })

    this.width = width
    this.height = height

    this.renderers = [
      SquareRenderer(options.color)
    ]

    this.updaters = [
      Rotation(this, options.rotationSpeed),
      Falling(options.fallingSpeed)
    ]
  }
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
  let context = canvas.getContext('2d')
  let gamescreen = createCanvas(800, 600)

  let game = gameloop({ renderer: context })
  let square1 = new Square(400, 300, 40, 40, { rotationSpeed: -25, fallingSpeed: -80 })
  let square2 = new Square(200, 100, 40, 40, { color: '#FF00FF', rotationSpeed: 15 })

  game.on('update', (dt) => {
    square1.update(dt)
    square2.update(dt)
  })

  function clear () {
    context.save()

    context.fillStyle = '#000000'
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.restore()
  }

  function copy () {
    let gameContext = gamescreen.getContext('2d')
    let image = context.getImageData(0, 0, 800, 600)

    gameContext.putImageData(image, 0, 0)
  }

  game.on('draw', (context) => {
    clear()
    square1.draw(context)
    square2.draw(context)
    copy()
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
