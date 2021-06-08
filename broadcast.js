#!/usr/bin/env node
const program = require('commander');
const csv = require("csv")
const fs=require('fs')
const inquirer=require('inquirer');
const chalk=require('chalk');
const async=require('async');
const sg=require('@sendgrid/mail');
program
  .version('0.0.1')
  .option('-l, --list [list]', 'list of customers in CSV file')
  .parse(process.argv)



    let questions=[
    {
      type:"input",
      name:"sender.email",
      message:"Sender's email address-"
    },
    {
      type:"input",
      name:"sender.name",
      message:"Sender's name-"
    },
    {
      type:"input",
      name:"subject",
      message:"email's subject-"
    }
   ];

let contactList=[];
let parse=csv.parse;
let stream = fs.createReadStream(program.list)
  .pipe(parse({ delimiter : ',' }));
  sg.setApiKey(process.env.SENDGRID_API_KEY);
  let __sendEmail = function (to, from, subject) {

  const msg={
    to : to.email,
    from : from.email,
    subject : subject,
    text : "yo"
  };
  console.log(msg);
  sg
  .send(msg)
  .catch((error) => {
   console.error(error);
 })


};

stream
  .on("error", function (err) {
    return console.error(err.response);
  })
  .on("data", function (data) {
    let name = data[0] + " " + data[1];
    let email = data[2];
    contactList.push({ name : name, email : email });
  })
  .on("end", function () {

    inquirer.prompt(questions).then(function (ans) {
      async.each(contactList, function (recipient) {

        __sendEmail(recipient, ans.sender, ans.subject);
      });
      console.log(chalk.green('Success'));
    });
  });
