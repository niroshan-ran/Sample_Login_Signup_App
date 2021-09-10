import React from 'react';
import SignIn from "./interfaces/SignIn";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import SignUp from "./interfaces/SignUp";
import Dashboard from "./interfaces/dashboard/Dashboard";
import Blog from "./interfaces/blog/Blog";

function App() {
    return <div>
        <BrowserRouter>

            <Switch>
                <Route path="/sign_up_page">
                    <SignUp/>
                </Route>
                <Route path="/dashboard">
                    <Dashboard/>
                </Route>
                <Route path="/sign_in_page">
                    <SignIn/>
                </Route>
                <Route path="/">
                    <Blog/>
                </Route>
            </Switch>
        </BrowserRouter>

    </div>;
}

export default App;
