async function testSettings() {
    try {
        // 1. Login as Admin
        const loginPayload = {
            email: 'gkgudd860@gmail.com',
            password: 'Gkgp@0504'
        };

        const loginRes = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful, token received.');

        // 2. GET Settings
        console.log('Fetching settings...');
        const getRes = await fetch('http://localhost:5000/api/settings', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!getRes.ok) {
            console.log('GET Settings failed (might be 404 if empty and not auto-created):', getRes.status);
        } else {
            const getData = await getRes.json();
            console.log('Current Settings:', getData);
        }

        // 3. PUT Settings (Update)
        console.log('Updating settings...');
        const updateData = {
            storeName: "Test Store Fetch " + Date.now(),
            email: "admin@example.com",
            contactNumber: "+91 98765 43210",
            address: "Test Address Fetch",
            currency: "₹",
            taxRate: 5,
            shippingCharge: 10,
            freeShippingThreshold: 500,
            siteDescription: "Updated description fetch",
            aboutUsSnippet: "Updated snippet fetch"
        };

        const putRes = await fetch('http://localhost:5000/api/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (!putRes.ok) {
            const errText = await putRes.text();
            throw new Error(`Update failed: ${putRes.status} - ${errText}`);
        }

        const putData = await putRes.json();
        console.log('Update Response:', putData);

        if (putData.storeName === updateData.storeName) {
            console.log('SUCCESS: Settings updated successfully.');
        } else {
            console.log('FAILURE: Settings mismatch.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSettings();
