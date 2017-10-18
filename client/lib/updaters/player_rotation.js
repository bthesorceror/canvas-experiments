import Keys from '../keys'
import Spin from '../helpers/spin'

export default function (dt, state) {
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
