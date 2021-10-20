import React, {useEffect, useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import {Alert} from "./Alert";
import Container from '@material-ui/core/Container';
import axios from "axios";
import {Backdrop, CircularProgress, Snackbar} from "@material-ui/core";
import {BlogRoute, SignInRoute, SignUpURL} from "../utils/Constants";
import {Copyright} from "./Copyright";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    paper: {
        marginTop: theme.spacing(8),
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
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

export default function SignUp() {

    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [firstName, setFirstName] = useState("");
    let [lastName, setLastName] = useState("");

    let [status, setStatus] = useState(false);
    const [backDropOpen, setBackDropOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState("error")
    const [alertMessage, setAlertMessage] = useState("Unknown Error Occurred");
    const classes = useStyles();


    const openAlert = (message, severity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    }

    axios.defaults.headers.common["X-CSRFToken"] = window.token;

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setAlertOpen(false);
    };

    let resetDetails = () => {
        setEmail("");
        setPassword("");
        setLastName("");
        setFirstName("");
    }


    let updateValues = (event) => {
        setStatus(false);
        switch (event.target.id) {
            case "firstName":
                setFirstName(event.target.value);
                break;
            case "lastName":
                setLastName(event.target.value);
                break;
            case "email":
                setEmail(event.target.value)
                break;
            case "password":
                setPassword(event.target.value)
                break;
            default:
                resetDetails();
                break;

        }
    }

    let singUpUser = (event) => {
        event.preventDefault();
        setBackDropOpen(!backDropOpen);
        setStatus(true);
    }

    useEffect(() => {
        if (firstName !== "" && lastName !== "" && backDropOpen === true && status === true && email !== "" && password !== "") {




            let user = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            }


            axios.post(SignUpURL, user).then((result) => {
                if (result.status === 200) {
                    let data = result.data;

                    let emailStatus = data.email_status;



                    if (emailStatus === true) {

                        setBackDropOpen(!backDropOpen);
                        openAlert("Email Address already Registered", "warning");
                        setStatus(false);
                    } else {


                        let message = data.message
                        resetDetails();
                        setBackDropOpen(!backDropOpen);
                        openAlert(message, "success");
                        setStatus(false);
                    }


                } else {
                    setBackDropOpen(!backDropOpen);
                    openAlert("Registration Failed", "warning");
                    setStatus(false);

                }
            }).catch(() => {
                setBackDropOpen(!backDropOpen);
                openAlert("Unexpected Error Occurred!!", "error");
                setStatus(false);
            });


            resetDetails();
        }
    }, [email, password, status, backDropOpen, firstName, lastName])


    if (localStorage.getItem("userEmail") !== null) {
        window.location = BlogRoute
    }

    return (
        <div>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <form method="post" className={classes.form} onSubmit={event => singUpUser(event)}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoFocus
                                    name="firstName"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    value={firstName}
                                    placeholder="First Name"
                                    onChange={event => updateValues(event)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={event => updateValues(event)}

                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    type="email"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    placeholder="Your Email Address"
                                    autoComplete="email"
                                    name="email"
                                    value={email}
                                    onChange={event => updateValues(event)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    name="password"
                                    label="New Password"
                                    placeholder="Your New Password"
                                    type="password"
                                    value={password}
                                    autoComplete="new-password"
                                    id="password"
                                    onChange={event => updateValues(event)}
                                />
                            </Grid>

                        </Grid>
                        <input type="hidden" name="csrf_token" value={window.token}/>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href={SignInRoute} variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </div>
                <Box mt={5}>
                    <Copyright/>
                </Box>
            </Container>
            <Backdrop className={classes.backdrop} open={backDropOpen}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <div className={classes.root}>
                <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
                    <Alert onClose={handleAlertClose} severity={String(alertSeverity)}>{alertMessage}</Alert>
                </Snackbar>
            </div>
        </div>
    );
}