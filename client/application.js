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
    _.each(this.updaters, (updater) => {
      updater(this, dt)
    })
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
  constructor (x, y, width, height, color = '#FFFFFF') {
    super(x, y, 2)
    this.width = width
    this.height = height

    this.renderers = [
      SquareRenderer(color)
    ]

    this.updaters = [
      Rotation(this, 5),
      Falling(20)
    ]
  }
}

domready(() => {
  let root = document.querySelector('#content')
  let canvas = document.createElement('canvas')

  canvas.width = 800
  canvas.height = 600

  root.appendChild(canvas)

  let context = canvas.getContext('2d')
  let game = gameloop({ renderer: context })
  let square1 = new Square(400, 300, 40, 40)
  let square2 = new Square(200, 100, 40, 40, '#FF00FF')

  game.on('update', (dt) => {
    square1.update(dt)
    square2.update(dt)
  })

  game.on('draw', (context) => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#000000'
    context.fillRect(0, 0, canvas.width, canvas.height)
    square1.draw(context)
    square2.draw(context)
  })

  window.addEventListener('blur', () => {
    game.pause()
  })

  window.addEventListener('focus', () => {
    game.resume()
  })

  game.start()
})
