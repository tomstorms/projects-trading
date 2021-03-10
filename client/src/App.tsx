import React, { useContext } from 'react';
import NavBar from './Components/NavBar';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import AdminPage from './Pages/AdminPage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import NotFoundPage from './Pages/NotFoundPage';
import ProfilePage from './Pages/ProfilePage';
import './Styles/main.scss';
import { myContext } from './Context/Context';

function App() {
    const ctx = useContext(myContext);

    return (
        <BrowserRouter>
            <NavBar />
            <Switch>
                <Route path='/' exact component={HomePage}></Route>
                {ctx ? (
                    <>
                        {(ctx.userLevel === 9) ? <Route path='/admin' component={AdminPage}></Route> : null }
                        <Route path='/profile' component={ProfilePage}></Route>
                    </>
                    ) : (
                    <>
                        <Route path='/login' component={LoginPage}></Route>
                        <Route path='/register' component={RegisterPage}></Route>
                    </>
                )}
                <Route path="/404" component={NotFoundPage}/>
                <Route component={NotFoundPage} />
            </Switch>
          </BrowserRouter>
      );
}

export default App;
