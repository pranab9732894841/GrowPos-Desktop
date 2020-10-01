import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom"
import './scss/style.scss';
import './App.css';
import { connect } from 'react-redux'
import { getProfileFetch } from './store/action/Auth';
// import { Ripple } from 'react-preloaders';
import Login from './views/Auth/login/Login'
import TheLayout from './containers/TheLayout'
import LogInRoute from './views/Auth/LogInRoute'
import RegisterRoute from './views/Auth/LogInRoute'
import Register from './views/Auth/register/Register'
import DataProvider from './LocalDB'
import ShopProvider from './LocalDB/ShopDB'

const App = (props) => {
  return (
    <DataProvider>
      <ShopProvider>
        <BrowserRouter>
          <Switch>
            <LogInRoute path="/login" name="login" component={Login} />
            <RegisterRoute path="/Register" name="Register" component={Register} />
            <Route path="/" name="Home" component={TheLayout} />
            <Redirect from="*" to='/' />
          </Switch>
        </BrowserRouter>
      </ShopProvider>
    </DataProvider>
  )
}

const mapStateToProps = (state) => {
  return {
    Auth: state.Auth,
  }
}
export default connect(mapStateToProps, { getProfileFetch })(App);






