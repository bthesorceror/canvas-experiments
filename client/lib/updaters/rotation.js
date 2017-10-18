import Spin from '../helpers/spin'

export default function (dt, state) {
  let { rotationSpeed, rotation } = state

  rotation = Spin(dt, rotation, rotationSpeed)

  return { rotation }
}
