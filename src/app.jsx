import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router-dom'

import LoginPage from './components/login-page'
import HomePage from './components/home-page'

export default class App extends Component {
  render () {
    return (
      <div>
        <Route exact path='/' component={HomePage} />
        <Route path='/login' component={LoginPage} />
      </div>
    )
  }
}
