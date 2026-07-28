const axios = require('axios');

const testReset = async () => {
    try {
        const email = 'gkgudd860@gmail.com';
        console.log(`Testing reset for: ${email}`);

        const res = await axios.post('http://localhost:5000/api/users/forgotpassword', {
            email
        });

        console.log('Response Status:', res.status);
        console.log('Response Data:', res.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testReset();
