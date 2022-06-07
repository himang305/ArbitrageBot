const express = require("express");
const app = express();
  
app.get("/", (req, res) => {
  res.send("Hello World!");

const { exec } = require("child_process");

exec("node index.js >log-file.txt 2>error-file.txt", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

});

const PORT = process.env.PORT || 8080;
  
app.listen(PORT, console.log(`Server started on port ${PORT}`));




