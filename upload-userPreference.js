const fs = require("fs");
const filePath =
  // '/hubspot-properties-export-properties-export-2022-09-15 (1).xlsx';
  "/Indulge Client Persons 02 Nov 2022[1].xlsx";
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
        "Bearer 423332a65b710a0efb420dd22bebffcbf9a5bccd59159a5ee30e2e20895d6e34cca2890225db969769d9183bb81cca306930009af6c5e63022dc5bfde87eca83b55de96efc01de46de5cf5f36f362fb2b23dd989120f1708860dc470f08e5eb85c881ac44170d180eda195ccc465c5dc502ed9e4d118920d8f7fd9d0337834a5",
    },
  });
};
//get questionnaires method
const getQuestionnaire = async function (
  params = {
    pagination: {
      pageSize: 100,
    },
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
        "Bearer 423332a65b710a0efb420dd22bebffcbf9a5bccd59159a5ee30e2e20895d6e34cca2890225db969769d9183bb81cca306930009af6c5e63022dc5bfde87eca83b55de96efc01de46de5cf5f36f362fb2b23dd989120f1708860dc470f08e5eb85c881ac44170d180eda195ccc465c5dc502ed9e4d118920d8f7fd9d0337834a5",
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
//create User post method
const createUser = async function (body) {
  const url = "http://localhost:4001/api/users/signup/customer";
  return got({
    url,
    data: body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "cred_9LLgcmpVv70r9Snw5cLBLCw2",
    },
  });
};

const data = obj[0].data;
const promises = [];
const MONTHS = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};
async function createUserPreference(data) {
  //here i am getting all cms questionnaires
  for (let columnIndex = 0; columnIndex < 2; columnIndex++) {
    for (let rowIndex = 9; rowIndex < data[0].length; rowIndex++) {
      //here i am checking the user is exist or not
      const userServiceFilter = {
        where: {
          or: [
            { phone: data[columnIndex + 1][3] },
            { email: data[columnIndex + 1][2] },
          ],
        },
      };
      const userExist = await getUser({
        filter: JSON.stringify(userServiceFilter),
      });
      //if the user not exist in out db ,here i am creating new user
      let newCreatedUser;
      if (!userExist?.data[0]) {
        let dobSerial = String(data[columnIndex + 1][10]);
        let formattedDateOfBirth = new Date(
          (dobSerial - (25567 + 2)) * 86400 * 1000
        );
        const userDetails = {
          dateOfBirth: formattedDateOfBirth,
          gender: data[columnIndex + 1][4],
          username: data[columnIndex + 1][1],
          firstName: data[columnIndex + 1][5],
          lastName: data[columnIndex + 1][6],
          email: data[columnIndex + 1][2],
          phone: String(data[columnIndex + 1][3]),
          paymentGatewayId: data[columnIndex + 1][7],
          countryCode: String("+" + data[columnIndex + 1][8]),
        };
        newCreatedUser = await createUser(userDetails);
      }
      const questionnaire = await getQuestionnaire();
      const questionData = questionnaire?.data?.data;
      let questionNumber;
      let questionType = "custom_preference";
      questionData.forEach((element) => {
        const cmsQuestion = element?.attributes?.question;
        if (cmsQuestion === data[0][rowIndex]) {
          questionNumber = element?.id;
          questionType = "default_preference";
        }
      });
      if (!questionNumber) {
        const customerPreferenceInfo = {
          question: data[0][rowIndex],
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
      if (data[columnIndex + 1][rowIndex]) {
        // here i am checking the otherAnswer field is not empty
        const info = {
          question: String(questionNumber),
          answers: ["-2"],
          otherAnswer: String(data[columnIndex + 1][rowIndex]), //data[1][9] data[1][10] data[1][11]
          type: questionType,
          userId: Number(
            userExist?.data[0]?.userId ?? newCreatedUser?.data?.userId
          ),
        };
        customerPreferenceData.push(info);
        console.log(customerPreferenceData);
        postCustomerPreference(customerPreferenceData);
        // console.log("info : ", customerPreferenceData, columnIndex);
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
