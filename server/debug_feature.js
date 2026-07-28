const axios = require('axios');

const API_URL = 'http://localhost:5000/api/categories';
// We need to login as admin first to get a token, but let's check if the get endpoint is protected. 
// Looking at routes: router.get('/', ...) is Public.
// router.put('/:id', protect, admin, ...) is Private/Admin.

// Need to login first.
const LOGIN_URL = 'http://localhost:5000/api/users/login';
const ADMIN_EMAIL = 'admin@example.com'; // Assuming default seeder admin, if this fails I'll need to check seeder
const ADMIN_PASSWORD = '123456'; // Assuming default seeder password

async function main() {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await axios.post(LOGIN_URL, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        console.log("   Login successful. Token obtained.");

        console.log("2. Fetching Categories...");
        const catsRes = await axios.get(API_URL);
        const categories = catsRes.data;

        if (categories.length === 0) {
            console.log("   No categories found. Creating a test featured category...");
            const newCat = await axios.post(API_URL, {
                name: 'Test Featured Category',
                image: 'https://via.placeholder.com/150',
                description: 'Created by debug script',
                isFeatured: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("   Category Created:", newCat.data);
        } else {
            console.log(`   Found ${categories.length} categories.`);
            // Flatten if hierarchical
            const allHelper = (cats) => cats.flatMap(c => [c, ...(c.subcategories ? allHelper(c.subcategories) : [])]);
            const allCats = allHelper(categories);

            const target = allCats[0];
            console.log(`   Updating category '${target.name}' (ID: ${target._id}) to be featured...`);

            const updateRes = await axios.put(`${API_URL}/${target._id}`, {
                isFeatured: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("   Update Success:", updateRes.data);
            console.log("   'isFeatured' is now:", updateRes.data.isFeatured);
        }

        console.log("Done. Check Home Page now.");

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

main();
