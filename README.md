#### Group members
- Sean Brzoska
- Tristan Digert
- Eric Clark

#### ALB Link
https://blogapploadbalancer-386445765.us-west-2.elb.amazonaws.com/

#### DockerHub image
https://hub.docker.com/repository/docker/clarkeb/597ua3g3

#### Challenges
We had some challenges with SQS, lambda, and removing redis when converting our code over. Another issue that took a while was getting docker to connect to everything that was already running in AWS. Getting names, region, keys, and secrets set. We later decided to use the assignment 1 with mongodb instead of stripping our code out for redis, since that was giving issues. Once mongodb was setup we followed the lab9 example. DyanmoDB connection from the app took a little while to figure out, but the documentation online for how to connect helped a lot.

#### Features
From what we've tested, all features are working as intended.

# USING 1 SLIP DAY
