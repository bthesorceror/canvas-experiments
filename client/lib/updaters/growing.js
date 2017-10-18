export default function (dt, state) {
  let { width, height, growthRate } = state

  if (width >= 200 || height >= 200 || width <= 20 || height <= 20) {
    growthRate *= -1
  }

  width += (dt * growthRate)
  height += (dt * growthRate)

  return { width, height, growthRate }
}
