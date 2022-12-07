const fs = require("fs");
const filePath =
  // '/hubspot-properties-export-properties-export-2022-09-15 (1).xlsx';
  "/Indulge Client Persona 02 Nov 2022 (5).xlsx";
//   "/Indulge Client Persons 02 Nov 2022[1].xlsx";
var xlsx = require("node-xlsx");
var got = require("axios");
var obj = xlsx.parse(__dirname + filePath); // parses a file

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
async function userOnboard(data) {
  for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
    let newCreatedUser;
    let userDetails;
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
    //if the user not exist in out db ,here i am creating new user
    if (!userExist?.data[0]) {
      let dobSerial = String(data[rowIndex + 1][10]);
      let formattedDateOfBirth = new Date(
        (dobSerial - (25567 + 2)) * 86400 * 1000
      );
      userDetails = {
        dateOfBirth: formattedDateOfBirth,
        gender: data[rowIndex + 1][4],
        username: data[rowIndex + 1][1],
        firstName: data[rowIndex + 1][5],
        lastName: data[rowIndex + 1][6],
        email: data[rowIndex + 1][2],
        phone: String(data[rowIndex + 1][3]),
        paymentGatewayId: data[rowIndex + 1][7],
        // paymentGatewayId: "cust_KoekM0hJ9djJOd",
        countryCode: String("+" + data[rowIndex + 1][8]),
      };
      newCreatedUser = await createUser(userDetails);
      console.log("info : ", newCreatedUser?.data, rowIndex);
      //   console.log("info : ", userDetails);
    }
  }
}
// }
userOnboard(data);
Promise.all(promises)
  .then((resp) => {
    console.log("success");
  })
  .catch((err) => {
    console.log("failed");
  });
