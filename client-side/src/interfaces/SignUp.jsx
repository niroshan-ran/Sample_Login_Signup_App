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
import MuiAlert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import axios from "axios";
import {RSA} from 'hybrid-crypto-js';
import {decrypt_message, encrypt_message} from "../cryptography/encrypt-decrypt";
import {Backdrop, CircularProgress, Snackbar} from "@material-ui/core";


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
}));

export default function SignUp() {

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
        }, 1024);
    }

    let singUpUser = (event) => {
        handleToggle();
        event.preventDefault();
        generateKeys().then(() => setStatus(true));
    }


    useEffect(() => {
        if (open === true && status === true && key.private_key !== null && key.public_key !== null && email !== "" && password !== "") {

            try {

                axios.get("http://127.0.0.1:5000/get_server_public_key").then((result) => {


                    if (result.status === 200) {

                        let server_public_key_1 = result.data.server_public_key_1;

                        let user = {
                            email: encrypt_message(email, server_public_key_1),
                            password: encrypt_message(password, server_public_key_1),
                            client_public_key: key.public_key
                        }
                        axios.post("http://127.0.0.1:5000/sign_up", user).then((result) => {
                            if (result.status === 200) {
                                let data = result.data;

                                let rowcount = decrypt_message(data.row_count, key.private_key)

                                console.log(rowcount);

                                handleToggle();
                                setSuccessOpen(true);
                                setStatus(false);


                            } else {
                                handleToggle();
                                setErrorMessage("Registration Failed");
                                setErrorOpen(true);
                                setStatus(false);

                            }
                        });

                    } else {
                        handleToggle();
                        setErrorMessage("Registration Failed");
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
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <form className={classes.form} onSubmit={event => singUpUser(event)}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    type="email"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    onChange={event => updateValues(event)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    onChange={event => updateValues(event)}
                                />
                            </Grid>

                        </Grid>
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
                                <Link to="/" href="/" variant="body2">
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
            <Backdrop className={classes.backdrop} open={open}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <Snackbar open={successOpen} autoHideDuration={6000} onClose={handleSuccessClose}>
                <Alert onClose={handleSuccessClose} severity="success">Registration Success! Please Login Again</Alert>
            </Snackbar>
            <Snackbar open={errorOpen} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert onClose={handleErrorClose} severity="error">{errorMessage}</Alert>
            </Snackbar>
        </div>
    );
}