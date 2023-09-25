// ---------------Target Variables------------------

const searchText = $("#input");
const searchButton = $("#search");
const generateAuthorList = $("#generateAuthorList");
const contentArea = $("#contentArea");
const favorites = $("#favorite-items");
const favoriteItem = $(".favoritesItem");
const favTitle = $("#favoritesTitle");
const emptyFavorites = $("#emptyFavorites");
const hideFavoritesButton = $("#hideFavoritesButton");

// Used in the author list button
let authorsApi = 'https://poetrydb.org/author'

// Used for on-click and wiki buttons
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

// ------------------------------------------------


// -------------- Author List -----------------

// AUTHOR LIST BUTTON 
// Runs functinon to generate list on click
$(generateAuthorList).on("click", function(event) {
    event.preventDefault();

    contentArea.empty();
    getAuthorList(authorsApi);
})

// AUTHOR LIST GENERATION
// Api Call generates list of authors to contentArea section
function getAuthorList(url) {

    fetch(url)
        .then(function (response) {
            return response.json();
         })
        .then(function (data) {
            console.log(data);

            let authorName = data.authors;
            let currentName ;

            let authorListMessage = $('<h3 class="col-12 authorListMessage">Here are all available Authors</h3>')
            $("#contentArea").append(authorListMessage);

            let authorListContainer = $('<div class="container-fluid authorListContainer"></div>')
            $("#contentArea").append(authorListContainer);

            let rowDisplay = $('<div class="row"></div>')
            $(authorListContainer).append(rowDisplay);

            for (let i = 0; i < authorName.length; i++) {
                currentName = document.createElement("p");
                currentName.textContent = authorName[i];
                $(currentName).addClass("poemListName col-sm-3");
                $(rowDisplay).append(currentName);
              }
        })
}

// -------------- Poet Search - Generate a List of Titles from a Searched Author -----------------

// AUTHOR SEARCH BUTTON
// On click, creates correctly formatted api input for authorSearch and runs that function
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

// On enter, creates correctly formatted api input for authorSearch and runs that function
$(searchText).keypress(function(e) {
    if(e.which == 13) {
        userInput = searchText.val();

        let searchAuthorApi = 'https://poetrydb.org/author/' + userInput;
        let trimmedAuthor = searchAuthorApi.split(" ").join("%20");

        contentArea.empty();
        authorSearch(trimmedAuthor);
    }
});
// CREDIT: jquery search on keypress from user Ian Roke at https://stackoverflow.com/questions/979662/how-can-i-detect-pressing-enter-on-the-keyboard-using-jquery

// ***** AUTHOR SEARCH FUNCTION *****
// API call for author based on search button / submit input value and generates a list of works to the page
// Each generated title is generated with an on-click event listener that runs the onClick function
// If no authors are found, the catch performs an new api call using the input to search for a poem title
function authorSearch(url) {

    fetch(url)
        .then(function (response) {
            return response.json();
         })
        .then(function (data) {

            let authorTitles = [];
            currentAuthor = data[0].author;

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

// Takes clicked on title and author name then formats them to a suitable api call format to search for that poem
function onClick() {

    clickableClicked = this.innerHTML;
    let untrimmedSearch = "https://poetrydb.org/author,title/" + currentAuthor + ";" + clickableClicked;
    let currentPoemSearch = untrimmedSearch.split(" ").join("%20");
    console.log(currentPoemSearch);

    contentArea.empty();
    loadPoem(currentPoemSearch);
}

// -------------- Poem Loading --------------

// POEM LOADING FUNCTION
// Api call loads author name, poem title, poem lines, favorites button, and wikipedia link to page
function loadPoem(url) {

    fetch(url)
        .then(function (response) {
            return response.json();
         })
        .then(function (data) {

            if (data.status == 404) throw "Author not found";

            let wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=' + data[0].author + '&formatversion=2&limit=1';

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

            // wiki link and favorites button V

            let contentButtons = $('<div id="contentButtons" class="container-fluid text-center"></div>')
            $("#contentArea").append(contentButtons);

            let favoritesButton = $('<button class="favoritesButton col-12 text-center"></button>').text("Add to Favorites!")
            $(favoritesButton).on("click", saveToFavorites);
            $("#contentButtons").append(favoritesButton);

            wikiApiCall(wikiUrl);

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

// Takes author from PoetryDB api data and searches wikipedia for someone of that name
// Assigns result as href to anchor tag
function wikiApiCall(url) {

    fetch(url)
        .then(function (response) {
            return response.json();
         })
        .then(function (data) {

            let wikiLink = $('<a href="" class="col-12 wikiLink" target="_blank">More Info on this Artist</a>');
            $("#wikiLinkTarget").attr("href", data[3][0]);
            $("#contentButtons").append(wikiLink);

        })

}

// -------------- Favorites --------------

// Runs when favorite list button is clicked, stores data and loads stored data
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

// Loaded favorites data is displayed in the favorites section
// Favorites list has a max of 10 items, adding an 11th pushes out the oldest item
// The empty favorites button is only displayed when there is 1 or more favoriteList items
function loadFavorites() {
    favorites.empty();
    favoriteList = JSON.parse(localStorage.getItem("favorites"));

    if (favoriteList === null) {
        favoriteList = [];
    }

    if (favoriteList.length > 0) {
        emptyFavorites.css("display","initial");
    } else {
        emptyFavorites.css("display","none");
    }

    for ( i = 10; favoriteList.length > i;) {
        favoriteList.pop();
    }

    for (let i = 0; i < favoriteList.length; i++) {
        let favoritesItem = $('<p class="favoritesItemTitle col-md-12"></p>').text(favoriteList[i][0])
        let favoritesItemAuthor = $('<p class="favoritesItemAuthor col-md-12"></p>').text(' by ' + favoriteList[i][1])
        $(favoritesItem).data('title', favoriteList[i][0])
        $(favoritesItemAuthor).data('author', favoriteList[i][1])
        $("#favorite-items").append(favoritesItem);
        $("#favorite-items").append(favoritesItemAuthor);

    }
}

// FAVORITES LIST EXPAND
// If below 767 px, clicking on favoritesTitle will cause the favorites list to expand or retract
$(favTitle).on("click", function() {

    let media = window.matchMedia("(max-width: 767px)")

    if (media.matches) {

        if (toggle === 0) {
            favorites.css("display", "inline");
            emptyFavorites.css("display", "block");
            hideFavoritesButton.css("display", "initial");
            toggle = 1 
        } else {
            favorites.css("display", "none");
            emptyFavorites.css("display", "none");
            hideFavoritesButton.css("display", "none");
            toggle = 0
        }

        loadFavorites();
    }
})

// On Resize, set favorites toggle to display all hidden items
$(window).resize(function(){

    let mediaResizeLg = window.matchMedia("(min-width: 768px)");

    if (mediaResizeLg.matches) {
        favorites.css("display", "inline");
        hideFavoritesButton.css("display", "initial");
        toggle = 1;

        if (favoriteList.length > 1) {
            emptyFavorites.css("display", "block");
        }
    }
})

// EMPTY FAVORITES BUTTON - Empties favorites list, sets favoriteList value to empty, reloads favorites
$(emptyFavorites).on("click", function(event) {
    event.preventDefault();

    favoriteList = [];

    storeFavorite();
    loadFavorites();

})

loadFavorites();
