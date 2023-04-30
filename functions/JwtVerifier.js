const axios = require('axios');

async function teacher(jwt) {
  try {
    const url = 'http://localhost:8080/api/v1/teacher'
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    return response.data;
  } catch (error) {

    throw new Error(error);
    // Handle error here
  }
}
async function student(jwt) {
    try {
      const url = 'http://localhost:8080/api/v1/student'
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
  
      return response.data;
    } catch (error) {
        throw new Error(error);
      // Handle error here
    }
  }
  async function any(jwt) {
    try {
      const url = 'http://localhost:8080/api/v1/any'
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
  
      return response.data;
    } catch (error) {
        throw new Error(error);
      // Handle error here
    }
  }

module.exports = {
    teacher,
    student,
    any
};

