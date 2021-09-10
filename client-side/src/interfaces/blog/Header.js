import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles((theme) => ({
    toolbar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbarTitle: {
        flex: 1,
    },
    toolbarSecondary: {
        justifyContent: 'space-between',
        overflowX: 'auto',
    },
    toolbarLink: {
        padding: theme.spacing(1),
        flexShrink: 0,
    },
}));

export default function Header(props) {
    const classes = useStyles();
    const {sections, title} = props;
    return (
        <React.Fragment>
            <Toolbar className={classes.toolbar}>
                {(localStorage.getItem("userFirstName") !== null) ?
                    <Button
                        size="small">{localStorage.getItem("userFirstName").concat(" ").concat(localStorage.getItem("userLastName"))}</Button>
                    : <span/>}
                <Typography
                    component="h2"
                    variant="h5"
                    color="inherit"
                    align="center"
                    noWrap
                    className={classes.toolbarTitle}
                >
                    {title}
                </Typography>
                <IconButton>
                    <SearchIcon/>
                </IconButton>
                {(localStorage.getItem("isGeneralUser") === "Yes") ?
                    <Button onClick={() => {
                        localStorage.clear();
                        window.location = '/';
                    }} variant="outlined" size="small">
                        Logout
                    </Button> :
                    <Button href="/sign_in_page" variant="outlined" size="small">
                        Sign in
                    </Button>
                }

            </Toolbar>
            <Toolbar component="nav" variant="dense" className={classes.toolbarSecondary}>
                {sections.map((section, index) => (
                    <Link
                        color="inherit"
                        noWrap
                        key={"Toolbar" + index}
                        variant="body2"
                        href={section.url}
                        className={classes.toolbarLink}
                    >
                        {section.title}
                    </Link>
                ))}
            </Toolbar>
        </React.Fragment>
    );

}

Header.propTypes = {
    sections: PropTypes.array,
    title: PropTypes.string,
};