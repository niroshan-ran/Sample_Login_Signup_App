import React from 'react';
import SignIn from "./interfaces/SignIn";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import SignUp from "./interfaces/SignUp";
import Dashboard from "./interfaces/dashboard/Dashboard";
import Blog from "./interfaces/blog/Blog";
import {BlogRoute, DashBoardRoute, RegularRoute, SignInRoute, SignUpRoute} from "./utils/Constants";
import WelcomePage from "./interfaces/WelcomePage";

function App() {
    return <div>
        <BrowserRouter>

            <Switch>
                <Route path={SignUpRoute}>
                    <SignUp/>
                </Route>
                <Route path={DashBoardRoute}>
                    <Dashboard/>
                </Route>
                <Route path={SignInRoute}>
                    <SignIn/>
                </Route>
                <Route path={BlogRoute}>
                    <Blog/>
                </Route>
                <Route path={RegularRoute}>
                    <WelcomePage/>
                </Route>
            </Switch>
        </BrowserRouter>

    </div>;
}

export default App;
