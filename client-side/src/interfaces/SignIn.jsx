import React, {useEffect, useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import axios from "axios";
import {Backdrop, CircularProgress, Snackbar} from "@material-ui/core";
import {BlogRoute, DashBoardRoute, SignInURL, SignUpRoute} from "../utils/Constants";
import {Alert} from "./Alert";
import {Copyright} from "./Copyright";


const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    root2: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    image: {
        backgroundImage: 'url(https://source.unsplash.com/random)',
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

export default function SignIn() {

    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [status, setStatus] = useState(false);
    const [backDropOpen, setBackDropOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState("error")
    const [alertMessage, setAlertMessage] = useState("Unknown Error Occurred");

    const classes = useStyles();

    axios.defaults.headers.common["X-CSRFToken"] = window.token;

    const openAlert = (message, severity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    }

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setAlertOpen(false);
    };


    let updateValues = (event) => {
        switch (event.target.id) {
            case "email":
                setStatus(false);
                setEmail(event.target.value)
                break;
            case "password":
                setStatus(false);
                setPassword(event.target.value)
                break;
            default:
                setStatus(false);
                console.log("None")
                break;
        }
    }



    let resetDetails = () => {
        setEmail("");
        setPassword("");
    }

    let singInUser = (event) => {
        event.preventDefault();
        setBackDropOpen(!backDropOpen);
        setStatus(true);
    }

    let loginToAdmin = () => {
        window.location = DashBoardRoute;
    }

    let loginToBlog = () => {
        window.location = BlogRoute;
    }



    useEffect(() => {
        if (backDropOpen === true && status === true && email !== "" && password !== "") {


            let user = {
                email: email,
                password: password
            }

            axios.post(SignInURL, user).then((result) => {
                if (result.status === 200) {
                    let data = result.data;
                    let emailStatus = data.email_status;
                    let passwordStatus = data.password_status;

                    if (emailStatus === true && passwordStatus === true) {
                        let message = data.message;
                        let userEmail = data.user_email;
                        let userFistName = data.user_firstname;
                        let userLastName = data.user_lastname;
                        let isGeneralUser = data.is_general_user;
                        openAlert(message, "success");
                        setBackDropOpen(!backDropOpen);
                        setStatus(false);
                        localStorage.setItem("userFirstName", userFistName);
                        localStorage.setItem("userLastName", userLastName);
                        localStorage.setItem("userEmail", userEmail);


                        if (isGeneralUser === true) {
                            loginToBlog();
                            localStorage.setItem("isGeneralUser", "Yes");
                        } else {
                            loginToAdmin();
                            localStorage.setItem("isGeneralUser", "No");
                        }


                    } else if (emailStatus === true && passwordStatus === false) {
                        setBackDropOpen(!backDropOpen);
                        openAlert("Incorrect Password", "warning");
                        setStatus(false);
                    } else if (emailStatus === false) {
                        setBackDropOpen(!backDropOpen);
                        openAlert("There is no Account associated with this email", "warning");
                        setStatus(false);
                    } else {
                        setBackDropOpen(!backDropOpen);
                        openAlert("Login Failed!!", "warning");
                        setStatus(false);
                    }


                } else {
                    setBackDropOpen(!backDropOpen);
                    openAlert("Login Failed!!", "warning");
                    setStatus(false);

                }
            }).catch(() => {
                setBackDropOpen(!backDropOpen);
                openAlert("Unexpected Error Occurred!!", "error");
                setStatus(false);
            });

            resetDetails();

        }
    }, [email, password, status, backDropOpen])

    if (localStorage.getItem("userEmail") !== null) {
        window.location = BlogRoute
    }

    return (
        <div>
            <Grid container component="main" className={classes.root}>
                <CssBaseline/>
                <Grid item xs={false} sm={4} md={7} className={classes.image}/>
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <div className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <LockOutlinedIcon/>
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <form method="post" className={classes.form} onSubmit={event => singInUser(event)}>
                            <TextField
                                autoFocus
                                type="email"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                placeholder="Your Registered Email Address"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={event => updateValues(event)}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                placeholder="Your Current Password"
                                type="password"
                                autoComplete="current-password"
                                id="password"
                                value={password}
                                onChange={event => updateValues(event)}
                            />
                            <input type="hidden" name="csrf_token" value={window.token}/>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item>
                                    <Link href={SignUpRoute} variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                            <Box mt={5}>
                                <Copyright/>
                            </Box>
                        </form>
                    </div>
                </Grid>
            </Grid>
            <Backdrop className={classes.backdrop} open={backDropOpen}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <div className={classes.root2}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "left"}} open={alertOpen}
                          autoHideDuration={6000} onClose={handleAlertClose}>
                    <Alert onClose={handleAlertClose} severity={String(alertSeverity)}>{alertMessage}</Alert>
                </Snackbar>
            </div>
        </div>
    );
}