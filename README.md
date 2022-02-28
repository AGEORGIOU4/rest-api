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
- Concurrency: Elimination of concurrent transactions when updating a LOAN is achieved using sequelize managed transactions. 



