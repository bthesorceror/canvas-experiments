import Keys from '../keys'

export default function (dt, state) {
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
