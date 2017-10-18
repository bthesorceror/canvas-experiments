import createCanvas from './lib/helpers/create_canvas'
import Alternator from './lib/helpers/alternator'
import createSquares from './lib/helpers/create_squares'

import domready from 'domready'
import gameloop from 'gameloop'
import _ from 'lodash'

function clearCanvas (context, width, height) {
  context.save()

  context.fillStyle = '#000000'
  context.clearRect(0, 0, width, height)
  context.fillRect(0, 0, width, height)

  context.restore()
}

function copyCanvas (gameScreen, context, width, height) {
  let gameContext = gameScreen.getContext('2d')
  let image = context.getImageData(0, 0, width, height)

  gameContext.putImageData(image, 0, 0)
}

domready(() => {
  let root = document.querySelector('#content')
  let canvas = createCanvas(800, 600)
  let gameScreen = createCanvas(800, 600)
  let game = gameloop({ renderer: canvas.getContext('2d') })

  let squares = createSquares()

  game.on('update', (dt) => {
    _.each(squares, _.method('update', dt))
    squares = _.sortBy(squares, (square) => {
      return square.y + (square.height / 2.0)
    })
  })

  game.on('draw', (context) => {
    clearCanvas(context, canvas.width, canvas.height)
    _.each(squares, _.method('draw', context))
    copyCanvas(gameScreen, context, canvas.width, canvas.height)
  })

  const alternator = Alternator([ squares[2], squares[3] ])

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
  root.appendChild(gameScreen)
})
