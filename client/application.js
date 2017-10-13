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
    this.state = fromJS(_.defaults(initialState, { x: 0, y: 0 }))

    this.props = fromJS(_.defaults(props, {
      width: 0,
      height: 0,
      updaters: [],
      renderers: []
    }))
  }

  get x () {
    return this.state.get('x')
  }

  get y () {
    return this.state.get('y')
  }

  update (dt) {
    let props = this.props.toJS()
    let { updaters } = props

    let ups = _.map(updaters, (fn) => {
      return function (state) {
        return fn(dt, props, state)
      }
    })

    this.state = fromJS(_.flow(ups)(this.state))
  }

  draw (context) {
    let { renderers } = this.props.toJS()

    _.each(renderers, (renderer) => {
      context.save()
      context.translate(
        this.x,
        this.y
      )
      renderer(
        context,
        this.props.toJS(),
        this.state.toJS()
      )
      context.restore()
    })
  }
}

function spin (dt, state, rotationSpeed) {
  let { rotation } = state.toJS()
  let newRotation = rotationSpeed * dt

  rotation = rotation || 0

  rotation += newRotation
  rotation = rotation % (2 * Math.PI)

  return { rotation }
}

function playerRotations (dt, props, state) {
  let { rotationSpeed } = props

  if (Keys.allDown('space', 'right')) {
    state = state.merge(spin(dt, state, -rotationSpeed))
  }

  if (Keys.allDown('space', 'left')) {
    state = state.merge(spin(dt, state, rotationSpeed))
  }

  return state
}

function userMover (dt, props, state) {
  let multiplier = 70
  let { x, y } = state.toJS()

  if (Keys.isDown('left')) {
    x -= (dt * multiplier)
  }

  if (Keys.isDown('right')) {
    x += (dt * multiplier)
  }

  if (Keys.isDown('up')) {
    y -= (dt * multiplier)
  }

  if (Keys.isDown('down')) {
    y += (dt * multiplier)
  }

  return state.merge({ x, y })
}

function Rotation (dt, props, state) {
  let { rotationSpeed } = props

  return state.merge(
    spin(dt, state, rotationSpeed)
  )
}

function Falling (dt, props, state) {
  let { fallingSpeed } = props
  let { y } = state.toJS()

  y += (fallingSpeed * dt)

  return state.merge({ y })
}

function SquareRenderer (context, props, state) {
  let { color, width, height } = props
  let { rotation } = state

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

function square (x, y, options = {}) {
  return new Entity(_.defaults(options, {
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
  }), {
    rotation: 0,
    x: x,
    y: y
  })
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
