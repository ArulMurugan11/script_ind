const fs = require("fs");
const filePath =
  // '/hubspot-properties-export-properties-export-2022-09-15 (1).xlsx';
  "/test customer data.xlsx";
var xlsx = require("node-xlsx");
var got = require("axios");
var obj = xlsx.parse(__dirname + filePath); // parses a file

//create UserPreference post method
const postCustomerPreference = async function (body) {
  const url = "http://localhost:4002/api/customer-preferences/bulk";
  return got({
    url,
    data: {
      data: body,
    },
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer bbe8727281d96d8bec720d315559d548d4260e23d87ffde674f42f1e323af3befa875beaefd5722a6c9ec030d4aeacc3a3ace232e416469c3f6d4ee9a906350391c79f58bb81bb2be03bac7967bc8fc8b2d752fd3e0d4530bde27a79d3af4e3f35128875f5ea54cbc4aa166cafea751638fa7c0347c5cdece84ef16165a3cce9",
    },
  });
};

//get user from 4001
const getUser = async function (params = {}) {
  const url = "http://localhost:4001/api/users";
  return got({
    url,
    params,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQiLCJuYW1lIjoiYXJ1bCIsImVtYWlsIjoiYXJ1bG11cnVnYW4uc0BiYWh3YW5jeWJlcnRlay5jb20iLCJpYXQiOjE2Njc0NzkyNjUsImV4cCI6MTY2NzY1MjA2NX0.80AhOpDT4ITgWEKTM5kHMhMxkkRj31HxAEtRpsyVGuc",
    },
  });
};
const filter = {
  where: {
    or: [
      { phone: "8220908502" },
      { email: "arulmurugan.s@bahwancybertek.com" },
    ],
  },
};

//create User post method
const createUser = async function (body) {
  const url = "http://localhost:4001/api/users/signup/customer";
  return got({
    url,
    data: {
      data: body,
    },
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "cred_9LLgcmpVv70r9Snw5cLBLCw2",
    },
  });
};

const data = obj[0].data;
const promises = [];
// const questions = data[0];
// for (let index = 4; index < questions.length; index++) {
//   console.log(hubspotKey[index]);
// }
async function createUserPreference(data) {
  for (let columnIndex = 0; columnIndex < 36; columnIndex++) {
    for (let rowIndex = 4; rowIndex < data[0].length; rowIndex++) {
      // columnIndex++;
      const info = {
        question: data[0][rowIndex],
        name: data[columnIndex + 1][1],
        answers: data[columnIndex + 1][rowIndex], //data 14 data15 data16
        otherAnswer: ["-2"],
        type: "default_preference",
        userId: 0,
        agentId: 0,
        conversationId: 0,
        ticketId: 0,
      };
      // columnIndex--;
      console.log("info : ", info, columnIndex);
    }
  }
  //   await post(info);
  // promises.push(post(info));
  // }, 300);
  // }
}

// use cases
// const username = getUser({
//   filter: JSON.stringify(filter),
// });
// username.then(function (result) {
//   console.log(result.data); // "Some User token"
// });
createUserPreference(data);

Promise.all(promises)
  .then((resp) => {
    console.log("success");
  })
  .catch((err) => {
    console.log("failed");
  });
