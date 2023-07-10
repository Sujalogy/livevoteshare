const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const ejs = require('ejs');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set('view engine', "ejs");
app.use(express.static("public"));

// Initialize vote counts

let voteCounts = [
    {party: "A", count: 0},
    {party: "B", count: 0},
    {party: "C", count: 0}
]

app.get("/", (req, res) => {
    res.render("index", {voteCounts: voteCounts, parties: getParties()});
})

io.on("connection",(socket) => {
    socket.emit('initialVoteCounts', voteCounts);

    let votedIDs = [];

    socket.on("vote", (voterID, party) => {
        if(!voterID) {
            socket.emit("voteError", "Voter ID is required.");
            return;
        }

        if(votedIDs.includes(voterID)) {
            socket.emit("voteError", "You have already voted");
            return;
        }

        voteCounts.forEach((vote) => {
            if(vote.party === party) {
                vote.count++;
            }
        });

        votedIDs.push(voterID);

        io.emit("updatedVoteCounts", voteCounts);
    });
});

server.listen(3000, ()=> {
    console.log("server is running");
    console.log("Connection has been established...");
})

function getParties() {
    return voteCounts.map(vote => vote.party);
}