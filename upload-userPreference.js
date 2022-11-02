const fs = require("fs");
const filePath =
  // '/hubspot-properties-export-properties-export-2022-09-15 (1).xlsx';
  "/Client Personal Maping & Hubspot Fileds or Questions.xlsx";
var xlsx = require("node-xlsx");
var got = require("axios");
var obj = xlsx.parse(__dirname + filePath); // parses a file

const post = async function (body) {
  const url = "http://localhost:1337/api/questionnaires";
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

const data = obj[0].data;
const promises = [];
const categoryData = {
  Dining: 1,
};
categoryData["Experience"] = 2;
categoryData["Luxury Goods"] = 3;
categoryData["Travel"] = 4;
categoryData["Special Request"] = 5;
async function createQuestionnaire(data) {
  for (let index = 1; index < data.length; index++) {
    const element = data[index];
    if (element[5]) {
      const info = {
        // question: element[1],
        // questionnaireType: "default_preference",
        // answerType: element[3] ?? "text",
        // hubspotKey: element[5],
        // isActive: true,
        // category: categoryData[element[2]] ?? 0,
        customerPreferenceId: 0,
        question: "string",
        answers: ["string"],
        otherAnswer: "string",
        type: "default_preference",
        userId: 0,
        agentId: 0,
        createdAt: "2022-11-02T06:32:52.603Z",
        updatedAt: "2022-11-02T06:32:52.603Z",
        conversationId: 0,
        ticketId: 0,
      };
      // console.log('info : ', info, index);
      await post(info);
      // promises.push(post(info));
      // }, 300);
    }
  }
}
createQuestionnaire(data);

Promise.all(promises)
  .then((resp) => {
    console.log("success");
  })
  .catch((err) => {
    console.log("failed");
  });
