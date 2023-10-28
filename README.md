# Initialization for development
Steps:\
1.) Clone the repository\
2.) Install the node packages\
3.) Create a .env in the root directory, add the following variables\
`DB_HOST`="localhost"\
`DB_NAME`="Name of the database you've created in PostgreSQL"\
`DB_PASSWORD`="Your PostgreSQL account password"\
`SECRET`="Some long complicated string"\
`PORT`=Any post other than the one the client side code is running on (3000 by default)\
`NODE_ENV`="development"

Note #1: This was made for windows users, the account name is hard-coded to `postgres`, change this if you are on macOS.\
Note #2: User input validation and sanitization is basic, modify as needed.\
Note #3: Designed on node version "14.17.5"

# Deployment
Steps:\
1.) Make sure to install the postgress addon for Heroku. \
2.) Connect the git repository, add `SECRET` env variable, deploy.

Note #4: The env var `NODE_ENV` must be `production` when deploying (default on Heroku), modify the code if setting as something different.


