import _ from 'lodash'
import { fromJS } from 'immutable'

function defaultBoundingBox (state) {
  let { x, y, width, height } = state

  return {
    x: x - (width / 2.0),
    y: y - (height / 2.0),
    width: width,
    height: height
  }
}

function drawBoundingBox (context) {
  if (this.state.get('renderBoundingBox')) {
    let { x, y, width, height } = this.boundingBox

    context.save()
    context.strokeStyle = '#FF0000'
    context.lineWidth = 5
    context.strokeRect(x, y, width, height)
    context.restore()
  }
}

export default class Entity {
  constructor (props = {}, initialState = {}) {
    this.state = fromJS({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      renderBoundingBox: false
    }).merge(initialState)

    this.props = fromJS({
      updaters: [],
      renderers: [],
      boundingBox: defaultBoundingBox
    }).merge(props)
  }

  get x () {
    return this.state.get('x')
  }

  get y () {
    return this.state.get('y')
  }

  get height () {
    return this.state.get('height')
  }

  get width () {
    return this.state.get('width')
  }

  get updaters () {
    return this.getProp('updaters', [])
  }

  get boundingBox () {
    return this.getProp(
      'boundingBox',
      defaultBoundingBox
    )(this.state.toJS())
  }

  get renderers () {
    return this.getProp('renderers', [])
  }

  getProp (key, defaultValue = null) {
    let prop = this.props.get(key)

    if (prop && prop.toJS) {
      return prop.toJS()
    } else if (prop) {
      return prop
    } else {
      return defaultValue
    }
  }

  updateState (attributes = {}) {
    this.state = this.state.merge(attributes)
    return this.state
  }

  update (dt) {
    let ups = _.map(this.updaters, (fn) => {
      return (state) => {
        let result = fn(dt, state.toJS())

        return this.updateState(result)
      }
    })

    this.state = _.flow(ups)(this.state)
  }

  draw (context) {
    _.each(this.renderers, (renderer) => {
      context.save()
      context.translate(this.x, this.y)
      renderer(context, this.state.toJS())
      context.restore()
    })

    drawBoundingBox.call(this, context)
  }
}
