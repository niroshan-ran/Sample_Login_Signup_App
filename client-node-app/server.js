const express = require('express');
const path = require('path');

const app = express();
const port = 8089;

app.use(express.static(path.join(__dirname, "../client-side/build")));
// sendFile will go here
app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../client-side/build/index.html")
    );
});

app.listen(port);
console.log('Server started at http://localhost:' + port);