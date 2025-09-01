//--------------------------------DEV-MODE---------------------------
let testmode = false;
//--------------------------------DEV-MODE---------------------------
let gameIsRunning = false;

function generateSecretCode() {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const secretCodeArray = [];

    for (let i = 0; i < 4; i++) {
        const index = Math.floor(Math.random() * digits.length);
        secretCodeArray.push(digits[index]);
        digits.splice(index, 1);
    }
    return secretCodeArray;
}

const secretCodeArray = generateSecretCode();

if (testmode) {

    console.log("Secret code:", secretCodeArray);
}



function startGame() {
    if (confirm("Start the Bulls & Cows game?")) {

        gameIsRunning = true;

        let userTries = 0;

        while (true) {

            const userNumber = prompt("Enter your guess (4 unique digits):");


            const result = checkGuess(userNumber);

            if (result === 0) {

                alert("Game cancelled.");

                gameIsRunning = false;

                userTries = 0;

                break;

            } else if (result === 1) {

                alert("Invalid number. Please enter 4 unique digits.");


            } else if (result === 2) {
                userTries++;
                alert(` VICTORY, afther ${userTries}, you guessed the secret code:  ${secretCodeArray.join("-")}`);
                
                console.log("------------------------------")
                console.log(`Final score: ${userTries}`);

                console.log("------------------------------")

                gameIsRunning = false;

                // parse usertries to json and store in localstorage

                break;

            } else {

                userTries++;

                console.log(`Failed attempts: ${userTries}`);

                alert('try again');
            }
        }
    }
}

document.getElementById("startButton").addEventListener("click", startGame);
//-------------- bull & cows test

function checkGuess(userString,) {

    if (userString == null) return 0;

    if (userString === "sv_cheats") return console.log("Secret code:", secretCodeArray);;

    // isnan no se uso, por el echo de que acepta numeros como 4e3
    if (userString.length !== 4 || !/^\d+$/.test(userString) || new Set(userString).size !== 4) {

        return 1;
    }

    const userArray = userString.split("").map(Number);


    let bulls = 0, cows = 0;

    userArray.forEach((digit, index) => {

        if (digit === secretCodeArray[index]) {

            bulls++;

        } else if (secretCodeArray.includes(digit)) {

            cows++;
        }
    });

    if (bulls === 4) {

        return 2;
    }

    return (

        console.log(`User guess: ${userArray.join("-")}`),

        console.log(`Bulls: ${bulls}, Cows: ${cows}`),

        console.log("------------------------------")
    )
}

