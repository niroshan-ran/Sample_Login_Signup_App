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
import Container from '@material-ui/core/Container';
import axios from "axios";
import Forge from "node-forge";
import {RSA} from 'hybrid-crypto-js';


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


let encrypt_message = (a_message, pubkey) => {


    let publicKey = Forge.pki.publicKeyFromPem(pubkey);
    let encrypted = publicKey.encrypt(a_message, "RSA-OAEP", {
        md: Forge.md.sha256.create(),
        mgf1: Forge.mgf1.create()
    });
    return Forge.util.encode64(encrypted);

}

let decrypt_message = (encrypted_msg, rsakey) => {

    let privateKey = Forge.pki.privateKeyFromPem(rsakey);
    return privateKey.decrypt(Forge.util.decode64(encrypted_msg), "RSA-OAEP", {
        md: Forge.md.sha256.create(),
        mgf1: Forge.mgf1.create()
    });

}

export default function SignUp() {

    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [key, setKey] = useState({
        public_key: null,
        private_key: null
    });
    let [status, setStatus] = useState(false);

    const classes = useStyles();

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
        event.preventDefault();
        generateKeys().then(()=>setStatus(true));
    }


    useEffect(() => {
        if (status === true && key.private_key !== null && key.public_key !== null && email !== "" && password !== "") {


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


                            console.log(rowcount)



                        } else {
                            console.log("Unknown Error Occurred")
                        }
                    });

                } else {
                    console.log("Unknown Error Occurred")
                }


            })
            setStatus(false);
        }
    }, [key.private_key,key.public_key, email, password, status])


    return (
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
    );
}