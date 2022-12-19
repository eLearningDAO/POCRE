# Contributing to POCRE
Welcome! Thanks for checking out POCRE and for taking the time to contribute!

## Getting Started
Clone the repo
```
git clone https://github.com/e-Learning-DAO/POCRE.git
```

## Folder structure
```
\
 |--app\                    # Contains all source code
 |--app\api                 # Source code for api
 |--app\web-frontend        # Source code for frontend
 |--*                       # Non-source code files
```

## API
The api is build with NodeJS/Typescript using Postgresql as DB follwing RESTful architecture. 

The source code is located at [/app/api](/app/api/). Please read the [README](/app/api/README.md) on how to set it up locally.

### DOCS
We have swagger docs for api available at [https://pocre-api.herokuapp.com/v1/docs](https://pocre-api.herokuapp.com/v1/docs).

### CI/CD
Automatic CD/CD for api is done via [heroku](https://heroku.com). It uses the [api branch](https://github.com/e-Learning-DAO/POCRE/tree/api) to deploy new changes.

### How to contribute
If you are looking to contribute to `API`, please follow this workflow

1. Create a new branch based off of [main](https://github.com/e-Learning-DAO/POCRE/tree/main) branch
2. Make your changes and create a PR to merge your changes in the [main](https://github.com/e-Learning-DAO/POCRE/tree/main) branch
3. Once your changes are merged to [main](https://github.com/e-Learning-DAO/POCRE/tree/main) branch, they will be deployed to live api.

## Frontend
The frontend is build with ReactJS.

The source code is located at [/app/web-frontend](/app/web-frontend/). Please read the [README](/app/web-frontend/README.md) on how to set it up locally.

### CI/CD
Automatic CD/CD for api is done via [netlify](https://netlify.com). It uses the [web-frontend branch](https://github.com/e-Learning-DAO/POCRE/tree/web-frontend) to deploy new changes. The live site is accessible at [https://pocre.netlify.app/](https://pocre.netlify.app/).

### How to contribute
If you are looking to contribute to `Frontend`, please follow this workflow

1. Create a new branch based off of [main](https://github.com/e-Learning-DAO/POCRE/tree/main) branch
2. Make your changes and create a PR to merge your changes in the [main](https://github.com/e-Learning-DAO/POCRE/tree/main) branch
3. Once your changes are merged to [main](https://github.com/e-Learning-DAO/POCRE/tree/main) branch, they will be deployed to live site.