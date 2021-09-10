import MuiAlert from "@material-ui/lab/Alert";
import React from "react";

export function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}