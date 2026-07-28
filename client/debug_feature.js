import axios from 'axios';

const API_URL = 'http://localhost:5000/api/categories';
const LOGIN_URL = 'http://localhost:5000/api/users/login';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

async function main() {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await axios.post(LOGIN_URL, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        console.log("   Login successful.");

        console.log("2. Fetching Categories...");
        const catsRes = await axios.get(API_URL);
        const categories = catsRes.data;

        if (categories.length === 0) {
            console.log("   No categories found to update.");
        } else {
            // Flatten if hierarchical to find ALL categories (including subcategories if you want them featured, 
            // but usually Top Categories implies top-level. The previous script logic handled this.
            // Let's stick to top-level for now as "Featured Categories" usually refers to the main ones.
            // If the user meant ALL including subcategories, we can adjust, but usually "Top Categories" section 
            // shows the parent categories. Let's start with just updating the parent categories in the list returned?
            // The API returns hierarchical data: [ { ... subcategories: [] } ]
            // So iterating `categories` iterates only top-level parents. This is correct for "Top Categories".

            console.log(`   Found ${categories.length} top-level categories. Updating them to be featured...`);

            for (const cat of categories) {
                console.log(`   Updating '${cat.name}'...`);
                await axios.put(`${API_URL}/${cat._id}`, {
                    isFeatured: true
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            console.log("   Update Complete! All top-level categories set to Featured.");
        }

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

main();
