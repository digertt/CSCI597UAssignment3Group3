#### Group members
- Sean Brzoska
- Tristan Digert
- Eric Clark

#### DB
We chose to use MySQL as the database because we already had familiarity with syntax and configuration.
#### Authentication and password handling
Our authentication strategy uses Passport.js and handwritten functions to serialize/deserialize the user's information out of the MySQL db.  
We wrote a password handler to abstract out the creation and validation of paswords and properly hashing and salting them.  
We are using node's crypto library to do PBKDFv2 with a 60 byte key length, hashed with sha512 and 10000 rounds. Salts are 64 bytes.  

#### AWS link
https://54.186.245.96

We are using a self signed cert, and serving on port 443.

#### Most challenging part of assignment
The most challenging part of this assignment was understand the code firstly.  Since only one person in the group really understood nodejs.  Once we understood the code, the final major issue we had was using redisio.  We initally couldn't get it to work with host and port parameters. Then switched to redis, which still had issues. Once we used the URL style of connection for redis it would connect. However, when testing began it would connect to the redis cache, but write no data no matter what we did. Since it could connect we knew the permissions were correct, and testing this on aws confirmed the server was up and could connect via the input URL. Finally switching back to redisio with the URL style connection finally yielded a proper connection. It took us several hours looking over code with trial and error before we solved this issue.

#### Buggy / not implemented features
As far as we can tell, everything in our app is working as intended. User/password/email verification work, posting works, logout/login work, caching works, and the database works.
