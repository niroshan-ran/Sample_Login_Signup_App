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
import {RSA} from "hybrid-crypto-js";
import axios from "axios";
import {decrypt_message, encrypt_message} from "../cryptography/EncryptDecrypt";
import {Backdrop, CircularProgress, Snackbar} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://material-ui.com/">
                Material UI
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
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
}));

export default function SignIn() {

    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [key, setKey] = useState({
        public_key: null,
        private_key: null
    });
    let [status, setStatus] = useState(false);
    const [open, setOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("Login Success");
    const [errorMessage, setErrorMessage] = useState("Unknown Error Occurred");
    const classes = useStyles();

    const handleSuccessClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessOpen(false);
    };

    const handleErrorClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorOpen(false);
    };

    const handleToggle = () => {
        setOpen(!open);
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

    let generateKeys = async () => {

        let rsa = new RSA();

        await rsa.generateKeyPair(function (keyPair) {
            setKey({
                public_key: keyPair.publicKey,
                private_key: keyPair.privateKey
            });
        }, 2048);
    }

    let resetDetails = () => {
        setEmail("");
        setPassword("");
    }

    let singInUser = (event) => {
        handleToggle();
        event.preventDefault();
        generateKeys().then(() => setStatus(true));
    }


    useEffect(() => {
        if (open === true && status === true && key.private_key !== null && key.public_key !== null && email !== "" && password !== "") {

            try {

                axios.get("http://127.0.0.1:5000/get_server_public_key_for_sign_in").then((result) => {


                    if (result.status === 200) {

                        let server_public_key_1 = result.data.server_public_key_1;

                        let user = {
                            email: encrypt_message(email, server_public_key_1),
                            password: encrypt_message(password, server_public_key_1),
                            client_public_key: key.public_key
                        }
                        axios.post("http://127.0.0.1:5000/sign_in", user).then((result) => {
                            if (result.status === 200) {
                                let data = result.data;
                                let emailStatus = data.email_status
                                let passwordStatus = data.password_status

                                if (emailStatus === true && passwordStatus === true) {
                                    let message = decrypt_message(data.message, key.private_key)
                                    setSuccessMessage(message);
                                    resetDetails();
                                    handleToggle();
                                    setSuccessOpen(true);
                                    setStatus(false);
                                } else if (emailStatus === true && passwordStatus === false) {
                                    handleToggle();
                                    setErrorMessage("Incorrect Password");
                                    setErrorOpen(true);
                                    setStatus(false);
                                } else if (emailStatus === false) {
                                    handleToggle();
                                    setErrorMessage("There is no Account associated with this email");
                                    setErrorOpen(true);
                                    setStatus(false);
                                } else {
                                    handleToggle();
                                    setErrorMessage("Login Failed");
                                    setErrorOpen(true);
                                    setStatus(false);
                                }


                            } else {
                                handleToggle();
                                setErrorMessage("Login Failed");
                                setErrorOpen(true);
                                setStatus(false);

                            }
                        });

                    } else {
                        handleToggle();
                        setErrorMessage("Login Failed");
                        setErrorOpen(true);
                        setStatus(false);
                    }


                });


            } catch (e) {
                handleToggle();
                setErrorMessage("Unexpected Error Occurred!!");
                setErrorOpen(true);
                setStatus(false);
            }
        }
    }, [key.private_key, key.public_key, email, password, status, open])


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
                        <form className={classes.form} onSubmit={event => singInUser(event)}>
                            <TextField
                                type="email"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                onChange={event => updateValues(event)}
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                onChange={event => updateValues(event)}
                                autoComplete="current-password"
                            />
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
                                    <Link href="/signup" variant="body2">
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
            <Backdrop className={classes.backdrop} open={open}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <Snackbar open={successOpen} autoHideDuration={6000} onClose={handleSuccessClose}>
                <Alert onClose={handleSuccessClose} severity="success">{successMessage}</Alert>
            </Snackbar>
            <Snackbar open={errorOpen} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert onClose={handleErrorClose} severity="error">{errorMessage}</Alert>
            </Snackbar>
        </div>
    );
}