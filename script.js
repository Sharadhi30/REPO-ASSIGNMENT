// script.js

let currentPage = 1;
let user; // Define user variable in the outer scope

function loadUserData() {
    const username = document.getElementById("username").value;
    const profileContainer = document.getElementById("profile");
    const repositoriesContainer = document.getElementById("repositories");
    const loader = document.getElementById("loader");
    const pageSlider = document.getElementById("page-slider");

    // Clear previous results
    profileContainer.innerHTML = "";
    repositoriesContainer.innerHTML = "";
    pageSlider.innerHTML = "";

    // Display loader while API calls are in progress
    loader.style.display = "block";

    // GitHub API endpoint for user details
    const userUrl = `https://api.github.com/users/${username}`;
    
    // Read the selected number of repositories per page from the dropdown
    const reposPerPageSelect = document.getElementById("repos-per-page");
    const reposPerPage = reposPerPageSelect.value;

    const reposUrl = `https://api.github.com/users/${username}/repos?per_page=${reposPerPage}&page=${currentPage}`;

    // Fetch user details
    fetch(userUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch user data for ${username}.`);
            }
            return response.json();
        })
        .then(userData => {
            // Assign user data to the user variable
            user = userData;

            // Display user profile
            const profileElement = document.createElement("div");
            profileElement.className = "profile";
            profileElement.innerHTML = `
                <img src="${user.avatar_url}" alt="${username}'s Profile Photo" class="profile-photo">
                <p class="full-name">${user.name || 'Full Name: Not available'}</p>
                <p class="username">${username}</p>
                <p class="bio">${user.bio || 'Not available'}</p>
                <p class="location"><img src="./images/location.png"> ${user.location || 'Not available'}</p>
                <p class="twitter"><img src="./images/twitter.png">: ${user.twitter_username ? `<a href="https://twitter.com/${user.twitter_username}" target="_blank">${user.twitter_username}</a>` : 'Not available'}</p>
                <p class="github"><img src="./images/github.png"> ${user.html_url}</p>
            `;
            profileContainer.appendChild(profileElement);

            // Fetch user repositories
            return fetch(reposUrl);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch repositories for ${username}.`);
            }
            return response.json();
        })
        .then(repositories => {
            // Hide loader when API calls are completed
            loader.style.display = "none";

            // Display repositories in a grid
            repositories.forEach(repo => {
                const repoCard = createRepoCard(repo);
                repositoriesContainer.appendChild(repoCard);
            });

            // Calculate total pages based on the number of repositories
            const totalPages = Math.ceil(user.public_repos / reposPerPage);
            createPaginationSlider(totalPages);
        })
        .catch(error => {
            // Hide loader on error
            loader.style.display = "none";

            // Display error message
            repositoriesContainer.innerHTML = `<p class="error">${error.message}</p>`;
        });
}

function createRepoCard(repo) {
    const card = document.createElement("div");
    card.className = "col-md-6 mb-4";

    card.innerHTML = `
        <div class="card">
            <div class="card-body">
                <p class="card-text"><strong>Repo Name: ${repo.name}</strong></p>
                <p class="card-text"><strong>Repo Desc: </strong>${repo.description || 'No description available'}</p>
                <p class="card-text"><strong>Topics:</strong> ${repo.language || 'Not available'}</p>
                <a href="${repo.html_url}" target="_blank" class="btn btn-primary">Repo Link</a>
            </div>
        </div>
    `;

    return card;
}

function createPaginationSlider(totalPages) {
    const pageSlider = document.getElementById("page-slider");

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.addEventListener("click", () => {
            currentPage = i;
            loadUserData();
        });
        pageSlider.appendChild(pageButton);
    }
}
