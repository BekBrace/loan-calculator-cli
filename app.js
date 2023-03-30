/**
 * created by Amir Bekhit
 * Programmed in Node.js
 * This application allows you to enter the amount of loan you desire, the number of months you want then the app will calculate how much installement payable per month.
 * Version 1.0.0
 */

import inquirer from "inquirer";
import sqlite3 from "sqlite3";
import chalk from "chalk";

//create or open the database
const db = new sqlite3.Database('loans.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    // console.log('Connected to the loans database')
});

// Create the loans table if it does not exist
db.run(`CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    months INTEGER NOT NULL
)`);


// Define the questions to prompt the user
const questions = [
    //name of the user
    {
        type: 'input',
        name: 'name',
        message: 'What is your name?',
        validate: function(value) {
            if (value.length){
                return true;
            } else {
                return 'Please enter your name';
            }
        },
    },
    //amount
    {
        type: 'input',
        name: 'amount',
        message: 'How much is the loan amount in PLN',
        validate: function(value) {
            const isValid = /^\d+$/.test(value)
            if (isValid){
                return true;
            } else {
                return 'Please enter a valid loan amount';
            }
        },
    },
    //months
    {
        type: 'input',
        name: 'months',
        message: 'How many months you want to pay back the loan',
        validate: function(value) {
            const isValid = /^\d+$/.test(value)
            if (isValid){
                return true;
            } else {
                return 'Please enter a valid number of months';
            }
        },
    },
]


// Define the main function that prompts the user
// Also to calculate the loan and saves data to the database.
// async/await
// Async keyword returns a promise
// and turns the function to an asynchronous function.
// await keyword pauses the execution of the asynchr. function
// till the promise is whether resolved or rejected.
// Add a new loan function
async function addLoan() {
    console.log(chalk.blue.bold('Welcome to the loan calculator!'));
    const answers = await inquirer.prompt(questions);
    const name =  answers.name;
    const amount = parseInt(answers.amount);
    const months =  parseInt(answers.months);
    const interestRate =  0.035; // 3.5 % interest rate acc to polish CB
    const installement =  Math.ceil((amount * ((1 + interestRate)/months)));
    console.log(chalk.green.bold(`Your monthly installement is ${installement} PLN`));

    db.run(
        'INSERT INTO loans (name, amount, months) VALUES (?,?,?)',
        [name, amount, months],
        function(err) {
            if (err) {
                console.error(err.message);
            }
            console.log(
                chalk.yellow.bold(`Your loan details have been saved with ID ${this.lastID}`
                ));
            promptMainMenu();
        });
}


// Function to view all loans
function viewAllLoans() {
    db.all('SELECT * FROM loans', (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        console.log(chalk.yellow.bold('All loans: '));
        rows.forEach((row) =>{
            console.log(`ID: ${row.id}, Name: ${row.name}, Amount: ${row.amount} PLN, Months: ${row.months}`);
        });
        promptMainMenu();
    });
}

// Function to update a loan
function updateLoan() {
    inquirer.prompt([
        //Enter ID of loan to update
        {
            input: 'input',
            name: 'id',
            message: 'Enter the ID of the loan you want to update:',
            validate: function (value) {
                const isValid = /^\d+$/.test(value);
                if (isValid) {
                    return true;
                } else {
                    return 'Please enter a valid ID number'
                }
            },            
        },
        {
            input: 'input',
            name: 'amount',
            message: 'Enter the amount that you wish to update:',
            validate: function (value) {
                const isValid = /^\d+$/.test(value);
                if (isValid) {
                    return true;
                } else {
                    return 'Please enter a valid amount'
                }
            },            
        },
        {
            input: 'input',
            name: 'months',
            message: 'Enter the updated number of months:',
            validate: function (value) {
                const isValid = /^\d+$/.test(value);
                if (isValid) {
                    return true;
                } else {
                    return 'Please enter a valid number of months'
                }
            },            
        },
    ])
        .then((choices) => {
            const id = parseInt(choices.id);
            const amount = parseInt(choices.amount);
            const months = parseInt(choices.months);
        
    // Updating the database
        db.run(
            'UPDATE loans SET amount = ?, months = ? WHERE id = ?',
            [amount, months, id],
            function (err) {
                if (err) {
                    console.error (err.message);
                }
                console.log(chalk.yellow.bold (
                    `Loan with ID ${id} has been updated. Row affected: ${this.changes}`
               )
            );
          promptMainMenu();
        }
       );
   });
}

// Define the main function that prompts the main menu to the user
function promptMainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices : ['View All Loans', 'Update Loan', 'Add a new loan', 'Exit']
        },
    ])

    .then((choices) => {
        switch (choices.choice) {
            case 'View All Loans':
                viewAllLoans();
                break;
            case 'Update Loan':
                updateLoan();
                break;
            case 'Add a new loan':
                addLoan();
                break;
            case 'Exit':
                console.log(chalk.bgMagentaBright.bold('Thank you for using our software!'))
                db.close();
                break;
        }
    });
}  
promptMainMenu();