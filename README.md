# Pathize 📊

_Long COVID management and insights._

## Getting started for developers 🛠

### Quick links to the tools we use

- [Turbo](https://turborepo.org/)
- [Node](https://nodejs.org/en/)
  - Specifically, LTS
- [Fastify](https://www.fastify.io/)
- [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

### Before cloning

- We use Node LTS. Please make sure you are running the same version of Node as specified in `.nvmrc`. This can be checked with running the command `node --version`. For Mac users, this can be done easily with the [node version manager](https://github.com/nvm-sh/nvm#installing-and-updating).
- Make sure the `yarn` package manager is installed globally. Navigate [here](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) and follow the installation instructions for your machine. Installation can be confirmed running the command `yarn -v`.

- Make sure the `turbo` package is installed globally. This can be checked with running the command `turbo --version`

```bash
yarn --global add turbo
```

### Speedrun

- Clone the repository with `SSH` instead of `HTTPS`
- `cd` into the directory
- Run `yarn install`
- Open the project in your code editor. Navigate into `/apps/api`, and create an `.env` file. Copy what's inside of `.env.template` into `.env`. Connect with your CTO to get the correct port number.
  - While `PORT` isn't a secret key (we'll eventually get a secret manager, such as [1password](https://1password.com/), where you'll retrieve such keys), you'll be getting this kind of information from your CTO over the phone (not in writing)
- Run `yarn dev`
- You should be serving both `api` and `demo` concurrently. And, you should be able to view both projects

### Running workspaces independently

We utilize `yarn` workspaces, as defined in `package.json`. To run a command on an individual app, preface the command with the following:

- `yarn workspace @pathize/mobile < ios, start, android, etc.>`
- `yarn workspace @pathize/api ...`

To install a `dev` dependency (for example):

- `yarn workspace @pathize/api add @types/fhir -D`

To install a normal dependency (for example):

- `yarn workspace @pathize/api add @types/fhir`

### Troubleshooting

- Make sure that installing packages with `yarn add` doesn't modify any existing files. If they do, it is likely you aren't using the same version of node specified in `.nvmrc`
- Make sure that `turbo` is installed globally with `yarn add --global turbo`
- Run `git pull` on master occasionally to make sure you're always running the most up-to-date codebase
  - And, be sure you do this before making a new branch
- For added security, we use SSH for cloning and signing commits. More information on this can be seen below:
  - [Check for existing SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys)
  - [Generating new SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
  - [Adding a new SSH key to your Github account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
