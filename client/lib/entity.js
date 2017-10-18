const _ = require('lodash')
const { fromJS } = require('immutable')

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
    return this.props.get('updaters').toJS()
  }

  get renderers () {
    return this.props.get('renderers').toJS()
  }

  updateState (attributes = {}) {
    this.state = this.state.merge(attributes)
    return this.state
  }

  update (dt) {
    let ups = _.map(this.updaters, (fn) => {
      return (state) => {
        return this.updateState(
          fn(dt, state.toJS())
        )
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
