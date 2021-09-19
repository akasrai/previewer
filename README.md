# PReviewer

PReviewer is a Github app build with [Probot](https://github.com/probot/probot) to automate the PR review.

## Features

- [x] Auto request PR review to contributors
- [x] Review PR title formatting
- [x] Review PR checklist

## Installation

**Clone the repo**

```sh
# Clone the repo
git clone git@github.com:akasrai/previewer.git
```

**Install the app**

```sh
# Install dependencies
npm install

# Build the project
npm run build

# Run the bot
npm start
```

**Setup GitHub app**
Navigate to local server (ie. http//locahost:3000) in the browser and follow the steps to setup the github app

**Install bot in the GitHub repo**

- Bot can be installed in the desired GitHub repo from the app settings
- Add configuration file ([previewer.yml](https://github.com/akasrai/previewer/blob/master/.github/previewer.yml)) in .github folder in the root of target GitHub repo

## License

[ISC](LICENSE) © 2021 akash <akasky70@gmail.com>
