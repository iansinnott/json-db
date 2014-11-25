# JSON DB

An interface for storing collections as JSON.

## Under Development

This module is very much in alpha stage. What I consider to be the core functionality (CRUD JSON collections) is complete and mostly tested, but there's still a lot of work that that would need to go into this before it is production ready. 

## Purpose

This project was inspired by an [article by the creator of][article] [NomadList][nomadlist]. If JSON is good enough for NomadList and it's traffic then it's viable for most small/medium sized projects. If you building a large web app, my guess is you aren't reading this because you've already decided Postgres/MySQL/Redis/etc.

[article]: https://levels.io/how-i-build-my-minimum-viable-products/
[nomadlist]: https://nomadlist.io/

_So why use JSON to store collections when there are so many free, stable database solutions out there?_

Most web sites & web apps need some means of persisting data. Databases are great, but I don't like writing SQL. This is almost certainly because I don't know it that well, but I also have no desire to really learn it right now.

So, here are a number of reasons I don't _always_ want to use a full-blown database:

* **Configuration**:  Databases require you to setup the database server and pass configuration variables to your app. That's _really_ annoying when all you want to do is build an app.
* **Schemas**: It's not possible to know _exactly_ what information each of your models will need to store unless you're rewriting an old codebase. It's also counterintuitive to try to reason out the necessities of your data before the fact. This is fully reflected in the existence of "migrations", which let you edit your schema after the fact. NoSQL DBs admittedly do not necessarily suffer from this issue.
* **Specific APIs**: Every DB has their own API. Even SQL syntax can differ between different relational databases. Mongo uses JS as it's API (which is great) but you still need to know Mongo to use it, an excellent grasp of JS is not enough. ORMs suffer from the same problem. Learning a new ORM is fine, but it's only a means to an end. I'd rather just use my existing knowledge of JS to write code that does what I want.
* **Overhead**: Running a DB in production uses server resources. If you're running your bootstrapped MVP on a VPS with 512mb of RAM it's great to not have to run a separate process for you Database.

## The case for JSON

_So why JSON?_

In short, it does not have any of the afformentioned issues that "real" databases have.

* No configuration: It's JSON, so all you need to interact with it is the `fs` module. That's not even necessary if you just want to read JSON, in which case you can use Node's `require` function directly.
* No Schemas: Do whatever you want with your data, whenever you want. It won't complain. 
* API? What API?: JSON is basically just a bunch of string representations of JS data structures.
* No Overhead: There is no separate process that needs to run. The "database" is just written directly to disk.

[Local Storage][ls] is also an appealing option for the front-end, but it's browser specific and can be unwittingly wiped by the user. In my mind Local Storage is a great _complement_ to server-side persistence. It allows you to quickly save a users work on the fly without a round-trip to the server. This is great for preserving work that might otherwise have been lost during a browser/computer crash. However, if you're serious about preserving a users data the only option is server-side.

[ls]: https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/Local_Storage

## Docs

There are no docs. As of this writing the source is under 300 LoC and commented so just skim through it and you're good to go.
