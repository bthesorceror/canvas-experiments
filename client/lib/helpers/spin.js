export default function (dt, rotation, rotationSpeed) {
  let newRotation = rotationSpeed * dt

  rotation = rotation || 0

  rotation += newRotation
  rotation = rotation % (2 * Math.PI)

  return rotation
}
