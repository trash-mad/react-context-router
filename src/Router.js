
import React from 'react'
import find from 'lodash.find'
import { createHistory } from 'history'
import pathToRegexp from 'path-to-regexp'

class Router extends React.Component {
  constructor ({ routes, pathname }) {
    super()
    this.state = {
      history: {},
      location: {},
      route: this.getRoute.bind(this)(routes, { pathname })
    }
    this.unlisten = () => {}
    this.getRoute = this.getRoute.bind(this)
  }

  getChildContext () {
    return this.state
  }

  componentDidMount () {
    const history = createHistory()
    const location = history.getCurrentLocation()
    const route = this.getRoute(this.props.routes, location)
    this.setState({
      history,
      location,
      route
    })
    this.unlisten = history.listen(this.handleHistoryChange.bind(this))
  }

  componentWillUnmount () {
    this.unlisten()
  }

  handleHistoryChange (location) {
    const route = this.getRoute(this.props.routes, location)
    this.setState({ location, route })
  }

  getRoute (routes, location) {
    const { pathname } = location
    const keys = []
    const params = {}
    const route = find(routes, ({ path }) => {
      const reg = pathToRegexp(path, keys)
      const match = reg.test(pathname)
      if (match) {
        const tokens = reg.exec(pathname)
        keys.forEach((key, i) => {
          params[key.name] = tokens[i + 1]
        })
      }
      return match
    }) || {}
    route.params = params
    return route
  }

  render () {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

Router.propTypes = {
  pathname: React.PropTypes.string,
  routes: React.PropTypes.array
}

Router.defaultProps = {
  routes: []
}

Router.childContextTypes = {
  history: React.PropTypes.object,
  location: React.PropTypes.object,
  route: React.PropTypes.object
}

export default Router
