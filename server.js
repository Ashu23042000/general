const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);


// app.get("/", (req, res) => {
//     res.sendFile("newPage1.html", { root: __dirname })
// });

// app.get("/other", (req, res) => {
//     res.sendFile("newPage2.html", { root: __dirname })
// });

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: __dirname })
});


app.use(express.static(__dirname));

io.on("connection", (socket) => {
    // console.log("New socket connected " + socket.id);


    socket.emit("me", socket.id);


    // socket.on("callUser", (data) => {
    //     io.to(data.to).emit("callingYou", { from: data.from, offer: data.offer });
    // });


    // socket.on("callReply", (data) => {
    //     io.to(data.to).emit("callReply", { answerOffer: data.answerOffer, answer: data.answer });
    // })


    // socket.once("ice_Candidate", (data) => {
    //     console.log(data);
    //     io.to(data.to).emit("new_ice_candidate", data);
    // });

    socket.on("send", (data) => {
        console.log(data);
        io.to(data.to).emit("send", data);
    });



})


server.listen(3000, () => console.log("Server is running on 3000"));