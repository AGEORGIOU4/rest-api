# rest-api

# To execute run the following commands

1. npm install
2. node .

# The file does not contain a populated db. The db with the tables are created when the program runs for the first time and populated when the API Calls are realized. Follow the instructions below

1. Open Postman
2. Import Collection from Postman folder
3. Open from File -> New Runner Tab
4. Add the collection
5. Run

# Testing (All the tests were held using Postman features)

- The above procedure displays all the tests implemented in every test call (Passed & Failed). 
- CRUD Operations: To test all the functionalities and constraints, every endpoint's operation (Get, Post, Put, Delete) was tested using different parameters.
- Error Handling: Some tests give wrong or faulty data to check if the server or the program crashes. Every operation handles errors and provides meaningful messages.
- Persistence: The program uses sequelize library to create the database and the tables. Every concept has its own dedicated js file to declare the entity along with its attributes and relationships.
- Concurrency: Elimination of concurrent transactions when posting, updating or deleting from an endpoint is achieved using sequelize managed transactions. 

To check concurrent transactions use the following command on terminal:

Books
-----
POST: 
xargs -I % -P 5 curl -X POST -H "Content-Type: application/json" -d '{"authors": "Stephen King","title": "Knightriders","isbn": "921728-34-63-243-0","year": "1981","loanable": "true","quantity": 1 }' "localhost:3000/library/book" \ < <(printf '%s\n' {1..10})

PUT:
xargs -I % -P 5 curl -X PUT -H "Content-Type: application/json" -d '{"title": "Pinoccio"}' "localhost:3000/library/book/1" \ < <(printf '%s\n' {1..10})

Students
--------
POST:
xargs -I % -P 5 curl -X POST -H "Content-Type: application/json" -d '{"name": "Nearchos Paspallis","yob": "30/01/1975"}' "localhost:3000/library/student" \ < <(printf '%s\n' {1..10})

PUT:
xargs -I % -P 5 curl -X PUT -H "Content-Type: application/json" -d '{    "name": "Nearchos Paspallis","yob": 1975}' "localhost:3000/library/student/1" \ < <(printf '%s\n' {1..10})


Loans
-----
POST:
xargs -I % -P 5 curl -X POST -H "Content-Type: application/json" -d '{"bookID": 3,"studentID": 2,"checkout": "04/25/2022","due": "05/25/2022","returned": "false"}' "localhost:3000/library/loan" \ < <(printf '%s\n' {1..10})

PUT: 
xargs -I % -P 5 curl -X PUT -H "Content-Type: application/json" -d '{"returned":"false"}' "localhost:3000/library/loan/1" \ < <(printf '%s\n' {1..10})

Modules
-------
POST:
xargs -I % -P 5 curl -X POST -H "Content-Type: application/json" -d '{"code": "CO1111", "name": "Computing Skills"}' "localhost:3000/library/module" \ < <(printf '%s\n' {1..10})

PUT:
xargs -I % -P 5 curl -X PUT -H "Content-Type: application/json" -d '{"name": "Distributed Enterprise Applications"}' "localhost:3000/library/module/CO2509&Enterprise Applications" \ < <(printf '%s\n' {1..10})

Bibliographies 
--------------
PUT: 
xargs -I % -P 5 curl -X PUT -H "Content-Type: application/json" -d '{}' "localhost:3000/library/bibliography/CO2509/1" \ < <(printf '%s\n' {1..10})

DELETE:
xargs -I % -P 5 curl -X DELETE -H "Content-Type: application/json" -d '{}' "localhost:3000/library/bibliography/CO2509/1" \ < <(printf '%s\n' {1..10})  



