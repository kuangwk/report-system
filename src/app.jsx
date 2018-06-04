import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom'

import LoginPage from './components/login-page'
import HomePage from './components/home-page'
import ProjectPage from './components/project-page'
import NotFoundPage from './components/notfound-page'

export default class App extends Component {
  render () {
    return (
      <div>
        <Switch>
          <Route exact path='/' component={HomePage} />
          <Route path='/login' component={LoginPage} />
          <Route path='/project/:appId' component={ProjectPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    )
  }
}
