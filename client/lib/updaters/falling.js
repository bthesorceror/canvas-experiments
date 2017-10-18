export default function (dt, state) {
  let { fallingSpeed, y } = state

  y += (fallingSpeed * dt)

  return { y }
}
