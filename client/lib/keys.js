import ArcadeKeys from 'arcade_keys'
import _ from 'lodash'

export default (function () {
  let keys = ArcadeKeys()

  function isDown (key) {
    let appliable = {
      left: [ArcadeKeys.keys.left, ArcadeKeys.keys.a],
      right: [ArcadeKeys.keys.right, ArcadeKeys.keys.d],
      down: [ArcadeKeys.keys.down, ArcadeKeys.keys.s],
      up: [ArcadeKeys.keys.up, ArcadeKeys.keys.w],
      space: [ArcadeKeys.keys.space]
    }[key] || []

    return _.some(
      appliable,
      _.bind(keys.isPressed, keys)
    )
  }

  function allDown (...list) {
    return _.every(list, isDown)
  }

  return {
    isDown,
    allDown
  }
})()
