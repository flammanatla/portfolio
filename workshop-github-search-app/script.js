'use strict';

class Github {
  constructor() {
    this.clientId = '0288f9afa5c6faedcc5e';
    this.clientSecret = '97fb5d699397ceb72fd513825ef0d04c75510e5e';
  }

  async getUser(userName) {
    const data = await fetch(
      `https://api.github.com/users/${userName}?client_id=${this.clientId}&client_secret=${this.clientSecret}`
    );
    const profile = await data.json();
    return profile;
  }

  async getRepo(userName) {
    const reposReq = await fetch(
      `https://api.github.com/users/${userName}/repos?client_id=${this.clientId}&client_secret=${this.clientSecret}&per_page=5&sort=updated`
    );
    const repos = await reposReq.json();
    return repos;
  }
}

class UI {
  constructor() {
    this.profile = document.querySelector(`.profile`);
    this.repos = document.querySelector(`.repos`);
  }

  showProfile(user) {
    this.profile.innerHTML = `
    <div class="card card-body mb-3">
      <div class="row">
        <div class="col-md-3">
          <img class="img-fluid mb-2" src="${user.avatar_url}">
          <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
        </div>
        <div class="col-md-9">
          <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
          <span class="badge badge-secondary">Public Gists: ${user.public_gists}</span>
          <span class="badge badge-success">Followers: ${user.followers}</span>
          <span class="badge badge-info">Following: ${user.following}</span>
          <br><br>
          <ul class="list-group">
            <li class="list-group-item">Company: ${user.company}</li>
            <li class="list-group-item">Website/Blog: ${user.blog}</li>
            <li class="list-group-item">Location: ${user.location}</li>
            <li class="list-group-item">Member Since: ${user.created_at}</li>
          </ul>
        </div>
      </div>
    </div>
    <h3 class="page-heading mb-3">Latest Repos</h3>
  `;
  }

  showRepos(repo, index) {
    const repoCard = document.createElement('div');

    repoCard.innerHTML = `
    <div class="repos">
      <div class="card card-body mb-3">
        <div class="row">
            <div class="col-md-3">
              <span class="h2">${index + 1}<span>
            </div>
            <div class="col-md-9">
              <ul class="list-group">
                <li class="list-group-item">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="h3"><a href=${repo.html_url}>${
      repo.name
    }</a></div> 
                    <div class="badge badge-primary">${repo.visibility}</div> 
                  </div>
                  <div>${repo.description}</div>
                  <br>
                  <div>Last Updated: ${repo.updated_at}</div>
                </li>
              </ul>
            </div>
        </div>
      </div>
    </div>
    `;
    this.repos.appendChild(repoCard);
  }

  showAlert(message, className) {
    this.clearAlert();
    const div = document.createElement('div');
    div.className = className;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector('.searchContainer');
    const search = document.querySelector('.search');

    container.insertBefore(div, search);

    // setTimeout(() => {
    //   this.clearAlert();
    // }, 3000);
  }

  clearAlert() {
    const alertBlock = document.querySelector('.alert');
    if (alertBlock) {
      alertBlock.remove();
    }
  }

  clearProfile() {
    this.profile.innerHTML = '';
  }

  clearRepos() {
    this.repos.innerHTML = '';
  }
}

const github = new Github();
const ui = new UI();

const searchUser = document.querySelector(`.searchUser`);

let timeoutId;

searchUser.addEventListener(`keyup`, e => {
  const userText = e.target.value;
  console.log(ui);

  // if there is timeout already running, need to kill it before creating a new one
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  ui.clearAlert();
  if (userText.trim() !== '') {
    timeoutId = setTimeout(() => {
      github.getUser(userText).then(data => {
        if (data.message === 'Not Found') {
          //show error alert
          ui.showAlert('User not found', 'alert alert-danger');
          ui.clearProfile();
        } else {
          ui.showProfile(data);
        }
      });
    }, 500);

    github.getRepo(userText).then(repos => {
      ui.clearRepos();
      for (let i = 0; i < repos.length; i++) {
        ui.showRepos(repos[i], i);
      }
    });
  } else {
    ui.clearProfile();
    ui.clearRepos();
  }
});
