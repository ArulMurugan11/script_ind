const fs = require("fs");
const filePath =
  // '/hubspot-properties-export-properties-export-2022-09-15 (1).xlsx';
  "/Indulge Client Persona 02 Nov 2022 (5).xlsx";
var xlsx = require("node-xlsx");
var got = require("axios");
var obj = xlsx.parse(__dirname + filePath); // parses a file

//create UserPreference post method
const postCustomerPreference = async function (body) {
  const url = "http://localhost:4002/api/customer-preferences/bulk";
  return got({
    url,
    data: body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJuYW1lIjoic2VsdmEiLCJlbWFpbCI6InNlbHZhbmF0aGFhbkBnbWFpbC5jb20iLCJpYXQiOjE2NjczODU4NTUsImV4cCI6MTk4Mjc0NTg1NX0.5Ti-0mdgfriUfT0NCUkSClq82P4jDc4H6FdoTFe9jVE",
    },
  });
};

const createQuestionnaire = async function (body) {
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
        "Bearer 6f04630799bfdddbaa767d4d6dda19208a1e3d9cda87698889e9136076159084ec3a28dee4fdc4de70b2e6f09e43b487d9ffb9179a9266c9f503bce09e497294e3bf10b1326b77826ec394cbf2d5d127b363b664a97a29076f91ad136417822eb30a88c590fd9c014819362759ced6c9e6129d9275c0305b058b9dc2a2b1c443",
    },
  });
};
//get questionnaires method
const getQuestionnaire = async function (
  params = {
    pagination: {
      pageSize: 100,
    },
    populate: ["options"],
  }
) {
  const url = "http://localhost:1337/api/questionnaires";
  return got({
    url,
    params,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer 6f04630799bfdddbaa767d4d6dda19208a1e3d9cda87698889e9136076159084ec3a28dee4fdc4de70b2e6f09e43b487d9ffb9179a9266c9f503bce09e497294e3bf10b1326b77826ec394cbf2d5d127b363b664a97a29076f91ad136417822eb30a88c590fd9c014819362759ced6c9e6129d9275c0305b058b9dc2a2b1c443",
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
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJuYW1lIjoic2VsdmEiLCJlbWFpbCI6InNlbHZhbmF0aGFhbkBnbWFpbC5jb20iLCJpYXQiOjE2NjczODU4NTUsImV4cCI6MTk4Mjc0NTg1NX0.5Ti-0mdgfriUfT0NCUkSClq82P4jDc4H6FdoTFe9jVE",
    },
  });
};
const data = obj[0].data;
const promises = [];
async function createUserPreference(data) {
  //here i am getting all cms questionnaires
  for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
    for (let columnIndex = 9; columnIndex < data[0].length; columnIndex++) {
      //here i am checking the user is exist or not
      const userServiceFilter = {
        where: {
          or: [
            { phone: data[rowIndex + 1][3] },
            { email: data[rowIndex + 1][2] },
          ],
        },
      };
      const userExist = await getUser({
        filter: JSON.stringify(userServiceFilter),
      });
      const questionnaire = await getQuestionnaire();
      const questionData = questionnaire?.data?.data;
      let questionNumber;
      let questionType = "custom_preference";
      let answer;
      let otherAnswerd = "";
      questionData.forEach((element) => {
        const cmsQuestion = element?.attributes?.question;
        const cmsOptions = element?.attributes?.options;
        const oldAnswerType = element?.attributes?.answerType;
        if (cmsQuestion === data[0][columnIndex]) {
          questionNumber = element?.id;
          questionType = "default_preference";
          switch (oldAnswerType) {
            case "multi":
              cmsOptions.forEach((option) => {
                if (option.label === String(data[rowIndex + 1][columnIndex])) {
                  answer = [`${String(option.id)}`];
                }
              });
              break;
            case "single":
              answer = [`${String(cmsOptions[0]?.id)}`];
              if (
                cmsOptions[1]?.label === String(data[rowIndex + 1][columnIndex])
              ) {
                answer = [`${String(cmsOptions[1]?.id)}`];
              }
              break;
            case "text":
              answer = ["-2"];
              otherAnswerd = String(data[rowIndex + 1][columnIndex]);
              break;
            case "date":
              answer = ["-3"];
              otherAnswerd = new Date(
                (String(data[rowIndex + 1][columnIndex]) - (25567 + 2)) *
                  86400 *
                  1000
              );
              break;
            default:
              break;
          }
        }
      });
      if (!questionNumber) {
        const customerPreferenceInfo = {
          question: data[0][columnIndex],
          questionnaireType: questionType,
          answerType: "text",
          // hubspotKey: element[5],
          isActive: true,
          category: 2,
        };
        const createdQuestion = await createQuestionnaire(
          customerPreferenceInfo
        );
        questionNumber = createdQuestion?.data?.data?.id;
      }

      // constructing payload for create userPreference
      let customerPreferenceData = [];
      if (data[rowIndex + 1][columnIndex]) {
        // here i am checking the otherAnswer field is not empty
        if (userExist?.data[0]) {
          const info = {
            question: String(questionNumber),
            answers: answer ?? ["-2"],
            otherAnswer:
              otherAnswerd ?? String(data[columnIndex + 1][rowIndex]), //data[1][9] data[1][10] data[1][11]
            type: questionType,
            userId: Number(userExist?.data[0]?.userId),
          };
          customerPreferenceData.push(info);
          // console.log(customerPreferenceData);
          postCustomerPreference(customerPreferenceData);
          // console.log("info : ", customerPreferenceData, rowIndex);
        }
      }
    }
  }
}
createUserPreference(data);
Promise.all(promises)
  .then((resp) => {
    console.log("success");
  })
  .catch((err) => {
    console.log("failed");
  });
