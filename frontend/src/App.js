import React, { Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import HeaderNav from './shared/components/Navigation/HeaderNav';
import Footer from './shared/components/Navigation/Footer';
import Home from './main/pages/Home';
import { useAuth } from './shared/hooks/auth-hook';
import { AuthContext } from './shared/context/auth-context';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

// Below syntax is used instead of above so that React instantiates these components LAZILY (Code Splitting). I.e. the below will not load with App by default, but are called on demand
const Signup = React.lazy(() => import('./vendors/pages/Signup'));
const Login = React.lazy(() => import('./vendors/pages/Login'));
const Events = React.lazy(() => import('./main/pages/Events'));
const Event = React.lazy(() => import('./main/pages/Event'));
const Vendor = React.lazy(() => import('./main/pages/Vendor'));
const CreateEvent = React.lazy(() => import('./vendors/pages/CreateEvent'));
const EditEvent = React.lazy(() => import('./vendors/pages/EditEvent'));
const EditVendor = React.lazy(() => import('./vendors/pages/EditVendor'));

const App = () => {

  const { token, login, logout, userId, userAddress, userPostcode } = useAuth();

  let routes;

  // if token exists on useAuth call above, user is logged in
  if (token) {
    // <Switch> syntax is used below to tell React to return a component once the given route has been found. Without this syntax, React will continue parsing the URL at runtime and end up returning a different component
    routes = (
      <Switch>
        <Route path='/' exact> <Home /> </Route>
        <Route path='/events' exact> <Events /> </Route>
        <Route path='/event/:id' exact> <Event /> </Route>
        <Route path='/vendor/:vid' exact> <Vendor /> </Route>
        <Route path='/create' exact> <CreateEvent /> </Route>
        <Route path='/edit-event/:id' exact> <EditEvent /> </Route>
        <Route path='/edit-vendor/:id' exact> <EditVendor /> </Route>
        <Redirect to='/' />
      </Switch>
    )
  } else {
    routes = (
      <Switch>
          <Route path='/' exact> <Home /> </Route>
          <Route path='/advertise' exact> <Signup /> </Route>
          <Route path='/login' exact> <Login /> </Route>
          <Route path='/events' exact> <Events /> </Route>
          <Route path='/event/:id' exact> <Event /> </Route>
          <Route path='/vendor/:vid' exact> <Vendor /> </Route>
          <Redirect to='/login' />
      </Switch>
    )
  }

  return (
    // the Context.Provider provides a value prop. This is ensures that all components listening to it will be re-rendered when the Context.Provider value changes
    <AuthContext.Provider value={{
      isLoggedIn: !!token,
      token: token,
      userId: userId,
      userPostcode: userPostcode,
      userAddress: userAddress,
      login: login,
      logout: logout
    }}>
      <Router>
        <HeaderNav />
        <main className='main'>
          <Suspense fallback={
            <div className='loading'>
              <LoadingSpinner asOverlay />
            </div>
          }>
            {routes}
          </Suspense>
        </main>
        <Footer />
      </Router>
    </AuthContext.Provider>
  )
}

export default App;
