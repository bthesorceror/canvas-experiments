import square from '../entities/square'
import UserMovement from '../updaters/user_movement'
import PlayerRotation from '../updaters/player_rotation'
import Rotation from '../updaters/rotation'
import Growing from '../updaters/growing'

export default function () {
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

  return [
    square1,
    square2,
    square3,
    square4,
    square5
  ]
}
