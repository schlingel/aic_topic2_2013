#Dependencies
Dependencies are managed by NPM. Further information on which modules are used are found in the package.json files of the csplatform and the sentiment projects.

##Windows Installation
In case you want to run the node in a Windows setup install first following applications:
* (Python 2.*)[http://www.python.org/]
* (Visual Studio)[http://www.microsoft.com/visualstudio/deu/downloads#d-2010-express]

To avoid problems with AMD 64 builds install the x86 version of node. If NPM isn't delivered by the default installation install it manually.

##Setup steps

In both the csplatform and sentiment directory run
>$ npm install

to install all the modules.

To get some articles, split them up and put them into the DB:
> sentiment$ grunt tasks

> sentiment$ grunt jobs

To start the websites and REST services:
> sentiment$ grunt

> csplatform$ grunt

If grunt complains about missing plugins, just install them with
> npm install

#Usage
## Creating DB
To use the crowd sourcing plattform a DB with basic data has to be created. Currently there's a test DB included with dummy values. To add further entries run
the tasks jobs. Thes job fetches the latest RSS feeds and inserts the article links into the DB. Afterwards, e.g. after 10 minutes, run the
jobs tasks to split the articles into processable chunks.

Both of these are endless jobs which have to be stopped manually (Ctrl+C).

## Process Tasks
Setup the project with the default tasks in csplatform and sentiment:

> sentiment$ grunt
> csplatform$ grunt

When both process run following URLs are available:
* The sentiment analysis admin website. http://127.0.0.1:9123
* The actually sentiment analysis search page. http://127.0.0.1:8080
* The crowd sourcing admin page. http://127.0.0.1:9321

First of all create Crowd Sourcing Analysis Tasks. Goto the sentiment analysis page, choose the article and create Jobs. At the Jobs page tasks can be send to the CS plattform. Now change to the crowd sourcing analysis page and send results to the sentiment analysis page. Afterwards the sentiment analysis service starts fetching the results from the CS plattform. Now the results are available on the search page.

#Task Management
Tasks are handled in Trello. (https://trello.com/b/0Gj6PL1t/advanced-internet-computing)
