import _ from 'lodash'
import { fromJS } from 'immutable'

export default class Entity {
  constructor (props = {}, initialState = {}) {
    this.state = fromJS({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }).merge(initialState)

    this.props = fromJS({
      updaters: [],
      renderers: []
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
  }
}
