// These variables target Ids on the index page.
// #input is for user text input
// #search is the button that performs a search
// #generateAuthorList is used for a button that lists authors
// #contentArea is where poems / poem titles / authors appear
const searchText = $("#input");
const searchButton = $("#search");
const generateAuthorList = $("#generateAuthorList");
const contentArea = $("#contentArea");
const favorites = $("#favorite-items");
const favTitle = $("#favoritesTitle");
const emptyFavorites = $("#emptyFavorites");

// This variable is used in the author list button
let authorsApi = 'https://poetrydb.org/author'

// These variables are used in below functions and need to be declared globally first
let userInput = "";
let clickableClicked = "";
let wikiButton = "";

// Used for favorites button and favorites list
let currentTitle = "";
let currentAuthor = "";
let favoriteList = [];
let viewedHistory = [];
let untrimmedFavTitle = "";
let untrimmedFavAuthor = "";
let toggle = 0;

// -------------- Author List -----------------

// Get the Author List with an api call - this function is ran when the author list button is clicked
// After api call is done, the authors from the data is saved to authorName as an array
// For loop: currentName variable created a paragraph element when called.
// The text content of currentName is equal to authorName array, index i (current loop number) - keep in mind authorName is an array listing all authors from the api call
// Class of poetListName is then added to the created p element
// Created p element is then appended to the id of #contentArea

function getAuthorList(url) {

    fetch(url)
        .then(function (response) {
            return response.json();
         })
        .then(function (data) {
            console.log(data);

            let authorName = data.authors;
            let currentName ;

            let authorListMessage = $('<h3 class="col-12 authorListMessage">Here are all available authors</h3>')
            $("#contentArea").append(authorListMessage);

            let authorListContainer = $('<div class="container-fluid authorListContainer"></div>')
            $("#contentArea").append(authorListContainer);

            let rowDisplay = $('<div class="row"></div>')
            $(authorListContainer).append(rowDisplay);

            for (let i = 0; i < authorName.length; i++) {
                currentName = document.createElement("p");
                currentName.textContent = authorName[i];
                $(currentName).addClass("poetListName col-md-3");
                $(rowDisplay).append(currentName);
              }
        })
}

// Author List button 
// when you click on #generateAuthorList class variable, empty out the contentArea and run function
// getAuthorlist is ran with authorsApi as its input (see 'url' in the above function)
$(generateAuthorList).on("click", function(event) {
    event.preventDefault();

    contentArea.empty();
    getAuthorList(authorsApi);
})

// -------------- Poet Search - Generate a List of Titles from a Searched Author -----------------

// 'this' would refer to the element you just clicked on, and clickableClicked's value is equal to that element's html content
// The text of that element is then split to remove spaces, and rejoined using %20 where spaces were
// %20 is used instead of spaces in the poetrydb api syntax
// currentPoemSearch is then set to a title api call + the trimmed user input that was split and joined
// The content area is then emptied and function loadPoem is ran using currentPoemSearch as the api input
function onClick() {

    clickableClicked = this.innerHTML;
    let trimmedTitle = clickableClicked.split(" ").join("%20");
    let currentPoemSearch = "https://poetrydb.org/title/" + trimmedTitle;
    console.log(currentPoemSearch);

    contentArea.empty();
    loadPoem(currentPoemSearch);
}

// saveToFavorites happens when you click the favorite button
// It adds the current poem title and name to the first slot in the favoited array, then stores it to local storage and loads local storage
function saveToFavorites() {

    let favorited = [currentTitle, currentAuthor]

    favoriteList.unshift(favorited);
    console.log(favoriteList);
    storeFavorite();
    loadFavorites();
}

// Stores current value of favoriteList to local storage
function storeFavorite() {
    localStorage.setItem("favorites", JSON.stringify(favoriteList));
}

// Empties the favorites list section on the html, loads the stored favorite list
// Then generates an item for each item in the favoriteList array oh the favorites section of the page
// The favorite list has a maximum of 6 favorites
function loadFavorites() {
    favorites.empty();
    favoriteList = JSON.parse(localStorage.getItem("favorites"));

    for ( i = 10; favoriteList.length > i;) {
        favoriteList.pop();
    }

    for (let i = 0; i < favoriteList.length; i++) {
        let favoritesItem = $('<p class="favoritesItem col-md-12"></p>').text('"'+ favoriteList[i][0] + '"' + ' by ' + favoriteList[i][1])
        $(favoritesItem).data('title', favoriteList[i][0])
        $(favoritesItem).data('author', favoriteList[i][1])
        $("#favorite-items").append(favoritesItem);
    }
}

// FAVORITES LIST EXPAND - FOR SMALLER SCREENS
// If below 767 px, clicking on favoritesTitle will cause the favorites list to expand or retract
$(favTitle).on("click", function() {

    var media = window.matchMedia("(max-width: 767px)")

    if (media.matches) {

        if (toggle === 0) {
            favorites.css("display", "inline");
            emptyFavorites.css("display", "block")
            toggle = 1 } 
        else {
            favorites.css("display", "none");
            emptyFavorites.css("display", "none")
            toggle = 0
        }

        loadFavorites();
    }
})

// authorSearch is an api call and is the most complex of the api calls
// First for loop fills up authorTitles with the title of each work the searched author has created
// Second for loop then cycles through each title, creates a p element, sets its text content to the title in the current index ->
// <- set class to poemTitle, and adds an event listener to each created element that performs the function onClick when clicked
// each title is also appended to the content area
// If an author is not found, the throw and catch runs a different api search to see if the entered item is the title of a work
function authorSearch(url) {

    fetch(url)
        .then(function (response) {
            return response.json();
         })
        .then(function (data) {
            let authorTitles = [];

            if (data.status == 404) throw "Author not found";
            let authorWorksMessage = document.createElement("h3");
            authorWorksMessage.textContent = "Works by " + data[0].author;
                $(authorWorksMessage).addClass("authorWorksMessage");
                $("#contentArea").append(authorWorksMessage);

            for (let i = 0; i < data.length; i++) {
                authorTitles.push(data[i].title);
              }
                let currentTitle ;
            for (let i = 0; i < data.length; i++) {
                currentTitle = document.createElement("p");
                currentTitle.textContent = authorTitles[i];
                $(currentTitle).addClass("poemTitle col-12");
                $(currentTitle).on("click", onClick);
                $("#contentArea").append(currentTitle);
              }
        })
        .catch(function () {
            let splitting = url.split("/");
            console.log(splitting);
            let titleUrl = splitting[4];
            loadPoem("https://poetrydb.org/title/" + titleUrl);
        })
}

// Author Search Button
// When you click on this button, it takes the value from the searchbox using the #input Id and trims it to fit in a poetrydb api call for an author's works
// it then runs authorSearch using the trimmed api input
$(searchButton).on("click", function(event) {
    event.preventDefault();
    userInput = searchText.val();

    let searchAuthorApi = 'https://poetrydb.org/author/' + userInput;
    let trimmedAuthor = searchAuthorApi.split(" ").join("%20");

    contentArea.empty();
    authorSearch(trimmedAuthor);
})
// CREDIT: solution for replacing blank spaces using split and join: https://www.geeksforgeeks.org/how-to-remove-spaces-from-a-string-using-javascript/
// CREDIT: solution to replacing spaces with a specific string: http://dotnet-concept.com/Tips/2015/3/5798821/How-to-replace-Space-with-Dash-or-Underscore-in-JQuery

// --------------------- Click on a Generated Poem Title from the Search Function to Load that Poem----------------------------

// loadPoem takes a url input for an api call to search for a specific poem and load it to the contentArea
// loadPoem has a 404 throw - if the call does not work and returns a 404 error, the catch is called
// The catch creates a paragraph element with the text of "Poem not found" into the contentArea

// If the call does function and returns a result....
// wikiUrl is used for the mediawiki api call and uses the author of the clicked on / loaded poem in the search - data[0].author
// contentTitle is a h3 element with the title of the current poem, has a class of contentTitle, and is appended to the contentArea first
// contenAuthor is a h5 element with the author of the current poem, has a class of contentAuthor, and is appended to the contentArea second
// FOR LOOP: Loops through each line of currently selected poem and creates a p element, appending it to the page
// For loop runs until all lines of the poem are loaded, each line has a class of poemLine
// Finally, wikiApiCall function is ran using wikiUrl variable
// This function is called within the onClick function
function loadPoem(url) {

    fetch(url)
        .then(function (response) {
            return response.json();
         })
        .then(function (data) {

            if (data.status == 404) throw "Author not found";

            let wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=' + data[0].author + '&formatversion=2&limit=1';

            let contentTitle = $("<h3></h3>").text(data[0].title)
            $(contentTitle).addClass("contentTitle col-md-12");
            $("#contentArea").append(contentTitle);

            let contentAuthor = $("<h5></h5>").text("by " + data[0].author)
            $(contentAuthor).addClass("contentAuthor col-md-12");
            $("#contentArea").append(contentAuthor);

            for (let i = 0; i < data[0].lines.length; i++) {
                let poemLine = $("<p></p>").text(data[0].lines[i])
                $(poemLine).addClass("poemLine");
                $("#contentArea").append(poemLine);
              }

            let contentButtons = $('<div id="contentButtons" class="container-fluid text-center"></div>')
            $("#contentArea").append(contentButtons);

            wikiApiCall(wikiUrl);

            // favorites / history

            let favoritesButton = $('<button class="favoritesButton col-12 text-center"></button>').text("Add to Favorites!")
            $(favoritesButton).on("click", saveToFavorites);
            $("#contentButtons").append(favoritesButton);

            currentAuthor = data[0].author;
            currentTitle = data[0].title;

        })
        .catch(function (error) {
            let notFound = document.createElement("p");
            notFound.innerHTML = "Poetry not found";
            $("#contentArea").append(notFound);
            console.log(error);
        })
}

// wikiApiCall uses the title input from loadPoem to perform an api call
// When the call is ran, wikiButton, an anchor tag with the target of _blank, is generated and appended to the bottom of the content area (loaded last)
// This a tag has a class of wikiLink, and an href attribut of data[3][0]
// From this api call, data[3][0] is the url generated by the mediaWiki api, which should be a href to the author of this poem's wikipedia page
// _blank causes a link to open in a new tab
function wikiApiCall(url) {

    fetch(url)
        .then(function (response) {
            return response.json();
         })
        .then(function (data) {

            let wikiLink = $('<a href="" class="col-12 wikiLink" target="_blank"</a>').text("More Info on this Artist");
            $("#contentButtons").append(wikiLink);
            $(wikiLink).attr("href", data[3][0]);
        })

}

loadFavorites();

// For opensearch api:
// https://www.mediawiki.org/wiki/API:Opensearch
// https://www.mediawiki.org/wiki/API:Get_the_contents_of_a_page
