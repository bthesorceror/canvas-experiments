import _ from 'lodash'
import SquareRenderer from '../renderers/square'
import Rotation from '../updaters/rotation'
import Falling from '../updaters/falling'
import Entity from '../entity'

export default function (x, y, props = {}, state = {}) {
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
