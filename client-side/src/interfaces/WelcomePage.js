import React from "react";
import Blog from "./blog/Blog";
import {RegularRoute} from "../utils/Constants";

export default function WelcomePage() {
    return (
        <div>
            {
                window.location.pathname === RegularRoute ?

                    <Blog/>
                    :
                    <h1>&nbsp;&nbsp;Page Not Found (404 Error)</h1>
            }
        </div>
    );
}