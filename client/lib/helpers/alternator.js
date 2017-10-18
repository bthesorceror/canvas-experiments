export default function (entities) {
  let index = 0

  entities[index].updateState({ active: true })

  return function () {
    entities[index].updateState({ active: false })
    index = ((index + 1) % entities.length)
    entities[index].updateState({ active: true })
  }
}
