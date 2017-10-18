const domready = require('domready')
const gameloop = require('gameloop')
const _ = require('lodash')
const ArcadeKeys = require('arcade_keys')
const { fromJS } = require('immutable')

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

class Entity {
  constructor (props = {}, initialState = {}) {
    this.state = fromJS({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }).merge(initialState)

    this.props = fromJS({
      updaters: [],
      renderers: []
    }).merge(props)
  }

  get x () {
    return this.state.get('x')
  }

  get y () {
    return this.state.get('y')
  }

  get height () {
    return this.state.get('height')
  }

  get width () {
    return this.state.get('width')
  }

  get updaters () {
    return this.props.get('updaters').toJS()
  }

  get renderers () {
    return this.props.get('renderers').toJS()
  }

  updateState (attributes = {}) {
    this.state = this.state.merge(attributes)
    return this.state
  }

  update (dt) {
    let ups = _.map(this.updaters, (fn) => {
      return (state) => {
        return this.updateState(
          fn(dt, state.toJS())
        )
      }
    })

    this.state = _.flow(ups)(this.state)
  }

  draw (context) {
    _.each(this.renderers, (renderer) => {
      context.save()
      context.translate(this.x, this.y)
      renderer(context, this.state.toJS())
      context.restore()
    })
  }
}

function Spin (dt, rotation, rotationSpeed) {
  let newRotation = rotationSpeed * dt

  rotation = rotation || 0

  rotation += newRotation
  rotation = rotation % (2 * Math.PI)

  return rotation
}

function PlayerRotation (dt, state) {
  let { active, rotationSpeed, rotation } = state

  if (!active) {
    return
  }

  if (Keys.allDown('space', 'right')) {
    rotation = Spin(dt, rotation, -rotationSpeed)
  }

  if (Keys.allDown('space', 'left')) {
    rotation = Spin(dt, rotation, rotationSpeed)
  }

  return { rotation }
}

function UserMovement (dt, state) {
  let { active, movementSpeed, x, y } = state

  if (!active) {
    return
  }

  if (Keys.isDown('left')) {
    x -= (dt * movementSpeed)
  }

  if (Keys.isDown('right')) {
    x += (dt * movementSpeed)
  }

  if (Keys.isDown('up')) {
    y -= (dt * movementSpeed)
  }

  if (Keys.isDown('down')) {
    y += (dt * movementSpeed)
  }

  return { x, y }
}

function Rotation (dt, state) {
  let { rotationSpeed, rotation } = state

  rotation = Spin(dt, rotation, rotationSpeed)

  return { rotation }
}

function Falling (dt, state) {
  let { fallingSpeed, y } = state

  y += (fallingSpeed * dt)

  return { y }
}

function Growing (dt, state) {
  let { width, height, growthRate } = state

  if (width >= 200 || height >= 200 || width <= 20 || height <= 20) {
    growthRate *= -1
  }

  width += (dt * growthRate)
  height += (dt * growthRate)

  return { width, height, growthRate }
}

function SquareRenderer (context, state) {
  let { active, color, width, height, rotation } = state

  if (active) {
    color = '#00FF00'
  }

  context.rotate(rotation)
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

function square (x, y, props = {}, state = {}) {
  return new Entity(_.defaults(props, {
    renderers: [
      SquareRenderer
    ],
    updaters: [
      Rotation,
      Falling
    ]
  }), _.defaults(state, {
    color: '#FFFFFF',
    fallingSpeed: 40,
    rotationSpeed: 5,
    width: 40,
    height: 40,
    rotation: 0,
    x: x,
    y: y
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

  let square1 = square(400, 300, {}, {
    rotationSpeed: -25,
    fallingSpeed: -80,
    width: 50,
    height: 50
  })

  let square2 = square(200, 100, {}, {
    color: '#FF00FF',
    rotationSpeed: 15
  })

  let square3 = square(100, 500, {
    updaters: [UserMovement]
  }, {
    movementSpeed: 70,
    color: '#FF0000'
  })

  let square4 = square(100, 400, {
    updaters: [UserMovement, PlayerRotation]
  }, {
    color: '#FF0000',
    movementSpeed: 180,
    rotationSpeed: 25
  })

  let square5 = square(400, 400, {
    updaters: [Growing, Rotation]
  }, {
    growthRate: 20,
    color: '#FFF030',
    rotationSpeed: -25
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
    _.each(squares, _.method('update', dt))
    squares = _.sortBy(squares, (square) => {
      return square.y + (square.height / 2.0)
    })
  })

  game.on('draw', (context) => {
    clearCanvas()
    _.each(squares, _.method('draw', context))
    copyCanvas()
  })

  const alternator = (function () {
    let index = 0

    let squares = [
      square3,
      square4
    ]

    squares[index].updateState({ active: true })

    return function () {
      squares[index].updateState({ active: false })
      index = ((index + 1) % squares.length)
      squares[index].updateState({ active: true })
    }
  })()

  window.addEventListener('keypress', (evt) => {
    if (evt.key === 't') {
      alternator()
    }
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
