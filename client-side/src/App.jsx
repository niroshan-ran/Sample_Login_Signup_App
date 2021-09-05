import React from 'react';
import SignIn from "./interfaces/SignIn";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import SignUp from "./interfaces/SignUp";

function App() {
    return <div>
        <BrowserRouter>

            <Switch>
                <Route path="/sign_up_page">
                    <SignUp/>
                </Route>
                <Route path="/">
                    <SignIn/>
                </Route>
            </Switch>
        </BrowserRouter>

    </div>;
}

export default App;
