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
import {decrypt_message, encrypt_message} from "../cryptography/EncryptDecrypt";
import {Backdrop, CircularProgress, Snackbar} from "@material-ui/core";
import {BlogRoute, PublicKeyURL, SignInRoute, SignUpURL} from "../utils/Constants";
import {Copyright} from "./Copyright";
import forge from "node-forge";

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
    let [key, setKey] = useState({
        public_key: null,
        private_key: null
    });
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

    let generateKeys = async () => {

        let rsa = forge.pki.rsa;

        await rsa.generateKeyPair({bits: 2048, workers: 2}, (err, keyPair) => {
            setKey({
                public_key: forge.pki.publicKeyToPem(keyPair.publicKey),
                private_key: forge.pki.privateKeyToPem(keyPair.privateKey)
            });
        });
    }

    let singUpUser = (event) => {
        setBackDropOpen(!backDropOpen);
        event.preventDefault();
        generateKeys().then(() => setStatus(true));
    }


    useEffect(() => {
        if (firstName !== "" && lastName !== "" && backDropOpen === true && status === true && key.private_key !== null && key.public_key !== null && email !== "" && password !== "") {


            axios.post(PublicKeyURL).then((result) => {


                if (result.status === 200) {

                    let server_public_key_1 = result.data.server_public_key_1;

                    let user = {
                        firstName: encrypt_message(firstName, server_public_key_1),
                        lastName: encrypt_message(lastName, server_public_key_1),
                        email: encrypt_message(email, server_public_key_1),
                        password: encrypt_message(password, server_public_key_1),
                        client_public_key: key.public_key
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


                                let message = decrypt_message(data.message, key.private_key)
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
    }, [key.private_key, key.public_key, email, password, status, backDropOpen, firstName, lastName])


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