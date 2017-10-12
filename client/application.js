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

    return _.some(appliable, (k) => keys.isPressed(k))
  }

  return {
    isDown
  }
})()

const userMover = (rotationSpeed) => {
  return (entity, dt) => {
    if (!_.hasIn(entity, 'rotation')) {
      entity.rotation = 0
    }

    let multiplier = 70

    if (Keys.isDown('left')) {
      entity.x -= (dt * multiplier)
    }

    if (Keys.isDown('right')) {
      entity.x += (dt * multiplier)
    }

    if (Keys.isDown('up')) {
      entity.y -= (dt * multiplier)
    }

    if (Keys.isDown('down')) {
      entity.y += (dt * multiplier)
    }

    if (Keys.isDown('space') && Keys.isDown('right')) {
      let rotation = rotationSpeed * dt

      entity.rotation -= rotation
      entity.rotation = entity.rotation % (2 * Math.PI)
    }

    if (Keys.isDown('space') && Keys.isDown('left')) {
      let rotation = rotationSpeed * dt

      entity.rotation += rotation
      entity.rotation = entity.rotation % (2 * Math.PI)
    }
  }
}

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

const Rotation = (rotationSpeed) => {
  return (entity, dt) => {
    if (!_.hasIn(entity, 'rotation')) {
      entity.rotation = 0
    }

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

    this.renderers = options.renderers || [
      SquareRenderer(options.color)
    ]

    this.updaters = options.updaters || [
      Rotation(options.rotationSpeed),
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
  let gamescreen = createCanvas(800, 600)
  let context = canvas.getContext('2d')
  let game = gameloop({ renderer: context })

  let square1 = new Square(400, 300, 50, 50, {
    rotationSpeed: -25,
    fallingSpeed: -80
  })

  let square2 = new Square(200, 100, 40, 40, {
    color: '#FF00FF',
    rotationSpeed: 15
  })

  let square3 = new Square(100, 500, 40, 40, {
    color: '#FF0000',
    updaters: [userMover(10)]
  })

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
    square1.update(dt)
    square2.update(dt)
    square3.update(dt)
  })

  game.on('draw', (context) => {
    clearCanvas()
    square1.draw(context)
    square2.draw(context)
    square3.draw(context)
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
