import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { useState } from "react";
import { TableFooter } from "@material-ui/core";

const PLAYERS = 5;

const names = ['Player 1', 'GD Bruce', 'Fuzzy', 'Does he?', 'Tigger', 'Tiger', 'Wes', 'Kasp'];

const yieldSuit = () => {
    var suits = 'SDHCN';
    var start = 13;
    var ordering = [];
    for (var count = 0; count < start; count++) {
        var suit = suits[count % suits.length]; // index out of bounds
        var round = (start - count) + suit;
        ordering.push(round);
    }
    return ordering;
};

const LAST_6 = [6,1,2,3,4,5,6,1,2,3,4,5,6];
const LAST_5 = [5,1,2,3,4,5,1,2,3,4,5,1,2];
const LAST = [4,1,2,3,4,1,2,3,4,1,2,3,4] ;  // TO DO 

const rows = yieldSuit().map((hand, i) => {
    return {
        [hand]: {
            last: LAST_5[i], // PLAYERS === 4 ? LAST[i] : LAST_6[i],
            totalSoFar: 0,
            roundOver: false,
            bets: [...Array(PLAYERS).fill(undefined)],
            gets: [...Array(PLAYERS).fill(undefined)],
            scores: [...Array(PLAYERS).fill(undefined)]
        }
    };
});

const BasicTable = () => {
    const [rounds, setRounds] = useState(rows);

    const calculateScore = (playerId, roundId) => {
        const round = rounds.find(round => round[roundId]);
        let roundOver = round[roundId].roundOver;
        if (!roundOver) { return }
        let bet = round[roundId].bets[playerId-1];
        let get = round[roundId].gets[playerId-1];
        let score = (bet === get) ? bet + 10: get;
        round[roundId].scores[playerId-1] = score;
        setRounds(rounds);
    };

    const submitBet = (event) => { // populate Bets array for this round
        console.log(event.target.parentNode.id) // playerId
        const playerId = event.target.parentNode.id;
        console.log(event.target.parentNode.parentNode.id) // roundId
        const roundId = event.target.parentNode.parentNode.id;
        
        let bet = +event.target.value;
        let round = rounds.find(round => round[roundId]);
        const LAST_PLAYER = round[roundId].last;

        // let totalSoFar = round[roundId].bets.filter(bet => bet !== undefined)
        //                                     .reduce((prev, curr) => prev + curr,0);
        console.log(LAST_PLAYER, playerId, round[roundId].totalSoFar)

        const hands = parseInt(roundId.replace(/[a-z]/i,''));
        // eslint-disable-next-line
        if (LAST_PLAYER == playerId) {
            if (round[roundId].totalSoFar + bet === hands) {
                alert('Invalid bet, try again!');
                event.target.value = '';
                return;
            }
            event.target.parentNode.querySelector('p.message').innerText = '';
            round[roundId].roundOver = true;
        }

        console.log(round, round[roundId].bets);
        if (round) {
            round[roundId].bets[playerId-1] = bet; // must be a number
            round[roundId].totalSoFar += bet;
        } // ROUND MUST EXISt

        if (round[roundId].bets.filter(bet => bet === undefined).length === 1) {
            const parent = event.target.parentNode.parentNode;
            for (let child of parent.children) {
                let text;
                let remaining = hands-round[roundId].totalSoFar;
                // eslint-disable-next-line
                if (child.id == LAST_PLAYER) {
                    if (remaining < 0) {
                        text = 'Bet whatever, we are over!'
                    } else {
                        text = `Can't bet ${remaining}`;
                    }
                    child.querySelector('p.message').innerText = text;
                }
            }
        }

        setRounds(rounds);
        console.log(`bet ${event.target.value} was submitted`)
    };

    const sumScore = (playerId) => {
        let scores = document.querySelectorAll(`.score${playerId}`);
        let total = 0;
        scores.forEach(score => {
            let handScore = parseInt(score.innerText);
            if (Number.isInteger(handScore)) {
                total += handScore;
            };
        });
        const p = document.getElementById(`score${playerId}`)
        p.innerText = total;
    }

    const submitGet = (event) => { // populate Bets array for this round
        console.log(event.target.parentNode.id) // playerId
        const playerId = event.target.parentNode.id;
        console.log(event.target.parentNode.parentNode.id) // roundId
        const roundId = event.target.parentNode.parentNode.id;
        
        let round = rounds.find(round => round[roundId]);
        let roundOver = round[roundId].roundOver;

        if (!roundOver) {
            alert("Finish entering bets");
            event.target.value = '';
            return;
        }
        
        console.log(round, round[roundId].gets);

        if (round) {
            round[roundId].gets[playerId-1] = +event.target.value; // must be a number
        } // ROUND MUST EXISt

        const LAST_PLAYER = round[roundId].last;
        // eslint-disable-next-line
        if (LAST_PLAYER == playerId) {
            let totalSoFar = round[roundId].gets.reduce((prev, curr) => prev + curr, 0);
            if (totalSoFar !== parseInt(roundId.replace(/[a-z]/i,''))) {
                alert('Someone reported invalid gets, please revise!');
                event.target.value = '';
                return
            }
        }
        setRounds(rounds);
        console.log(`get ${event.target.value} was submitted`)
        calculateScore(playerId, roundId);

        const p = event.target.nextElementSibling;
        p.innerText = '   ' + round[roundId].scores[playerId-1];
        // calculateScore -> get nextElementSibling, changeInnerText
        sumScore(playerId);
    };

    const lastStyle = {border: "2px dashed red"};

    const isLast = (hand, playerId) => {
        let round = rounds.find(round => round[hand]);
        // eslint-disable-next-line
        return (round[hand].last == playerId);
    }; 

    return (
        <TableContainer component={Paper} sx={{maxHeight: 600}}>
            <Table aria-label="simple table" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Hand</TableCell>
                        {[...Array(PLAYERS)].map((_, i) => (
                            <TableCell>
                                <input type="text" placeholder={names[i]} style={{width: "80px"}}></input>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {yieldSuit().map((row) => (
                        <TableRow key={row} id={row}>
                            <TableCell component="th" scope="row">
                                {row}
                            </TableCell>
                            {[...Array(PLAYERS)].map((_, i) => (
                                <TableCell id={i+1} style={isLast(row, i+1) ? lastStyle : {}}>
                                    <input type="text" onBlur={submitBet} placeholder="bet" style={{width: "25px", marginRight: "3px"}}></input>
                                    <input type="text" onBlur={submitGet} placeholder="get" style={{width: "25px"}}></input>
                                    <p className={"score"+(i+1)} style={{fontSize: "20px"}}>Score</p>
                                    <p className="message" style={{color: "red"}}></p>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Totals</TableCell>
                        {[...Array(PLAYERS)].map((_, i) => (
                                <TableCell id={i+1}>
                                    <p id={"score"+(i+1)}></p>
                                </TableCell>
                        ))}
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    )
};

export default BasicTable;