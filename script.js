document.addEventListener('DOMContentLoaded', () => {
    
    /********************************VARIABLES**********************************/
    const url = 'https://api-nba-v1.p.rapidapi.com/' // base url
    const options = { // get options
        method: 'GET',
        headers: {
            'content-type': 'application/octet-stream',
            'X-RapidAPI-Key': apiKEY,
            'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
        }
    }
    
    const cardContainer = document.getElementById('card-container') // div containing all cards
    const personalCollectionDiv = document.getElementById('personal-collection') // variable for personal collection div
    let forGetandPost = false; // var set to false, used for patch validation 

    /**********************FUNCTIONS************************/
    //get request for player info
    function getPlayer (playerLastName) { 
        return fetch(`${url}players?name=${playerLastName}`, options)
        .then(resp => resp.json())
        .then(resp => {
            const playersArray = resp.response // setting const ‘players’ to array response
            cardContainer.innerHTML = '' // Clears out old player cards from previous search
            playersArray.forEach(player => { // sends each player in the array to populatePlayers function
                populatePlayers(player)
                console.log(player)
            })
        })
        .catch(err => console.error(err))
    }
    
    // renders player card on page
    function populatePlayers(player) { 
        const playerId = player.id // sets playerId to the id of the current player
        const season = document.getElementById('season').value // saves value of season text field to variable
        
        const playerCard = document.createElement('div') // player card
        playerCard.setAttribute('class', 'card') // sets id attribute of player card
        const playerName = document.createElement('h1') // creates player name element
        const playerJersey = document.createElement('h2') // creates player jersey no element
        const playerHeight = document.createElement('h4') // creates player height element
        const playerWeight = document.createElement('h4') // creates player weight element
        const playerCollege = document.createElement('h5') // creates player college element
        const playerTeam = document.createElement('h6') // creates player team element
        const teamLogoImg = document.createElement('img') // creates team logo image element
        const seasonLabel = document.createElement('p') // creates season label element
        seasonLabel.innerText = `${season} Season Totals:` // populating season label element
        const playerPoints = document.createElement('h4') // creates player points element
        const playerAssists = document.createElement('h4') // creates player assists element
        const addPlayerBtn = document.createElement('button') // button for adding player to personal collection
        addPlayerBtn.innerText = 'Add Player' // sets text content of addPlayerBtn
        addPlayerBtn.setAttribute('class', 'button') // assigns class to button for styling
        addPlayerBtn.setAttribute('type', 'button') // sets type attribute for add player button
        
        /****************POPULATING PLAYER INFO ELEMENTS************************/
        if (player.leagues.standard.active === true) { // filters only active players
            playerName.innerText = player.firstname + ' ' + player.lastname // populates player name element
            playerJersey.innerText = 'Jersey #:' + ' ' + player.leagues.standard.jersey // populates player jersey element
            playerHeight.innerText = 'Height:'  + ' ' + player.height.feets + 'ft' + ' ' + player.height.inches + 'in' // populates player height element
            playerWeight.innerText = 'Weight:' + ' ' + player.weight.pounds // populates player weight element
            playerCollege.innerText = 'College:' + ' ' + player.college // populates player college element
            
            /***************APPENDING PLAYER INFO ELEMENTS********************/
            playerCard.append( // appends all player info elements to player card
                playerName,
                playerJersey,
                playerHeight,
                playerWeight,
                playerCollege,
                playerTeam,
                teamLogoImg,
                seasonLabel,
                playerPoints,
                playerAssists,
                addPlayerBtn
            )
            cardContainer.append(playerCard) // appends player card to container div
        }
    
        // get player statistics
        fetch(`${url}players/statistics?id=${playerId}&season=${season}`, options)
        .then(resp => resp.json())
        .then(resp => {
            const stats = resp.response // saves response array into a variable
            console.log(stats)
            const teamName = stats[0].team.name // pulls team name from array index 0
            const teamLogo = stats[0].team.logo // pulls team logo img url from array index 0
            playerTeam.innerText = teamName // populates playerTeam var with team name
            teamLogoImg.src = teamLogo // sets img source for teamLogoImg
            // next two lines iterate array and add all assist values together
            const assistValues = stats.map(stats => stats.assists)
            const totalAssists = assistValues.reduce((total, value) => total + value, 0)
            //next two lines iterate array and add all points values together
            const pointsValues = stats.map(stats => stats.points)
            const totalPoints = pointsValues.reduce((total, value) => total + value, 0)
            playerPoints.innerText = 'Points:' + ' ' + totalPoints // sets player points to sum of all points in season
            playerAssists.innerText = 'Assists:' + ' ' + totalAssists // sets player assists to sum of all assists in season
            
            //event listener for add player button
            addPlayerBtn.addEventListener('click', (e) => { //serach button event listener
                e.preventDefault()
                addPlayerBtn.remove() // removes add player button on click 
                playerCard.remove() // removes player card from search div on click 
                // POST to add card to JSON
                fetch(`http://localhost:3000/cards`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: player.firstname + ' ' + player.lastname, // posts player name to json
                        jersey: player.leagues.standard.jersey, // posts player jersey to json
                        height: player.height.feets + 'ft' + ' ' + player.height.inches + 'in', // posts player height to json
                        weight: player.weight.pounds, // posts player weight to json
                        college: player.college, // posts player college to json
                        img: teamLogo, // posts team logo url to json
                        assists: totalAssists, // posts player total assists to json
                        points: totalPoints, // posts player total points to json
                        season: season, // posts season value to json
                        comment : '' // posts comment of empty string to json to be edited later
                    })  
                })
                .then(() => { 
                    forGetandPost = true // sets boolean to true upon post completion
                    if (forGetandPost === true) {
                    getFromJson() // invoke function to posts card to personal collection after post completes
                    forGetandPost = false // sets var back to false
                    }
                })
            })
        })
        .catch(err => console.error(err))
    }

    // get request from json database
    function getFromJson() {
        fetch ('http://localhost:3000/cards')
        .then(resp => resp.json())
        .then(player => {
            populatePersonalCollection(player) // invokes function with response
        })
    }
    
    //populates personal collection from json database
    function populatePersonalCollection (player) {
        personalCollectionDiv.innerHTML = '' // clears out old cards from personal collection upon involaction
        player.forEach(player => { // iterates array of cards in json
            const playerCard = document.createElement('div') // creates player card element
            playerCard.setAttribute('class', 'card') // sets id attribute of player card
            const playerName = document.createElement('h1') // creates player name element
            const playerJersey = document.createElement('h2') // creates player jersey no element
            const playerHeight = document.createElement('h4') // creates player height element
            const playerWeight = document.createElement('h4') // creates player weight element
            const playerCollege = document.createElement('h5') // creates player college element
            const playerTeam = document.createElement('h6') // creates player team element
            const teamLogoImg = document.createElement('img') // creates team logo image element
            const seasonLabel = document.createElement('p') // creates season label element
            const playerPoints = document.createElement('h4') // creates player points element
            const playerAssists = document.createElement('h4') // creates player assists element
            const deletePlayerBtn = document.createElement('button') // creates delete button for player card
            deletePlayerBtn.setAttribute('class', 'card-button') // sets class to button for styling
            deletePlayerBtn.innerText = 'Delete' // sets text content of delete button   
            const commentField = document.createElement('input')//creating comment field
            commentField.setAttribute('type', 'search') // setting attributes for the comment field
            commentField.setAttribute('placeholder', "add comment")
            commentField.setAttribute('maxlength', '50') // setting attributes for the submit button
            commentField.setAttribute('class', 'comment-field')
            const commentSubmit =  document.createElement('button') // creates submit button for comment field
            commentSubmit.setAttribute('type', 'submit') // setting attributes for the submit button
            commentSubmit.setAttribute('class', 'card-button')
            commentSubmit.innerText = 'Submit'
            const commentP =  document.createElement('p') // creates comment field when posted
            commentP.textContent = player.comment // displays comment upon submit
            
            // populaing elements with player info from json
            playerName.innerText = player.name // populates player name element
            playerJersey.innerText = 'Jersey #' + ' ' + player.jersey // populates player jersey element
            playerHeight.innerText = 'Height:'  + ' ' + player.height // populates player height element
            playerWeight.innerText = 'Weight:' + ' ' + player.weight // populates player weight element
            playerCollege.innerText = 'College:' + ' ' + player.college // populates player college element
            seasonLabel.innerText = player.season + ' ' + 'Season Totals:' // populates season label element
            teamLogoImg.src = player.img // sets img source
            playerPoints.innerText = 'Points:' + ' ' + player.points // populates player points element 
            playerAssists.innerText = 'Assists:' + ' ' + player.assists // populates player assists element 
            
            // event listener for comment submit
            commentSubmit.addEventListener('click', (e) => {
                e.preventDefault()
                let commentValue = commentField.value // grabbing comment field value
                commentP.textContent = commentValue // displays comment field value before page refresh
                //patch for comment field
                fetch(`http://localhost:3000/cards/${player.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type' : 'application/json', 
                        'Accept' : 'application/json'
                    } ,
                    body: JSON.stringify({
                        'comment' : commentValue
                    }) 
                })
                commentField.value = ''
            })
            
        /***************APPENDING PLAYER INFO ELEMENTS********************/
            playerCard.append( // appends all player info elements to player card
                playerName,
                playerJersey,
                playerHeight,
                playerWeight,
                playerCollege,
                playerTeam,
                teamLogoImg,
                seasonLabel,
                playerPoints,
                playerAssists,
                commentP,
                commentField,
                commentSubmit,
                deletePlayerBtn
            )

            personalCollectionDiv.append(playerCard)
                        
            deletePlayerBtn.addEventListener('click', e => {
                e.preventDefault()
                //DELETE request 
                fetch(`http://localhost:3000/cards/${player.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },    
                })
                playerCard.remove() // removes player card dom elements
            })
        }
    )}
    
    /***********************EVENT LISTENERS*************************/
    // event listener for from submission
    document.getElementById('player-search').addEventListener("submit", (e) => {
        e.preventDefault(e)
        let playerLastName = document.getElementById('player-name').value // saves value of player input to var
        document.getElementById('player-search').reset()
        getPlayer(playerLastName) // invokes function with playerLastName
        
    })
    
    // Invocation of json get upon page load 
    getFromJson()
})