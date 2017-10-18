export default function (context, state) {
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
