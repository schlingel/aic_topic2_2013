#Dependencies
To run the application you have to install the following nodejs modules first.
* restify
* request
* jquery
* underscore
* sequelize

To install a module use npm:
> npm install module-name

We use grunt to automize some tasks
> npm install -g grunt

##Windows Installation

In case you want to run the node in a Windows setup install first following applications:
* (Python 2.*)[http://www.python.org/]
* (Visual Studio)[http://www.microsoft.com/visualstudio/deu/downloads#d-2010-express]

To avoid problems with AMD 64 builds install the x86 version of node.

##Setup steps

In both the csplatform and sentiment directory run
>$npm install
to install all the modules.

To get some articles, split them up and put them into the DB:
> sentiment$ node scrapper.js
> sentiment$ node jobfacrory.js

To start the websites and REST services:
> sentiment$ grunt
> csplatform$ grunt

If grunt complains about missing plugins, just install them with
>npm install


#Task Management
Tasks are handled in Trello. (https://trello.com/b/0Gj6PL1t/advanced-internet-computing)
