import fetch from 'node-fetch'; // or built-in, but assuming node env
// Note: using built-in fetch if node version supports it, otherwise might need install. 
// Modern node has global fetch.

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log('🚀 Starting Antigravity System Verification...');
    console.log('---------------------------------------------');

    // Helper for requests
    const request = async (method: string, path: string, token?: string, body?: any) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();
        return { status: response.status, data };
    };

    try {
        // 1. Admin Login
        console.log('\n🔐 1. Testing Admin Login...');
        const loginRes = await request('POST', '/auth/login', undefined, {
            username: 'admin',
            password: 'admin123'
        });

        if (loginRes.status !== 200) throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
        const adminToken = loginRes.data.token;
        console.log('✅ Admin Logged In');

        // 2. Create Product
        console.log('\n📦 2. Testing Product Creation (Admin)...');
        const productRes = await request('POST', '/products', adminToken, {
            name: `Test Product ${Date.now()}`,
            sku: `TEST-${Date.now()}`,
            price: 10.99,
            stock: 100,
            category: 'Test',
            description: 'Automated test product',
            is_active: true
        });

        if (productRes.status !== 201) throw new Error(`Create Product failed: ${JSON.stringify(productRes.data)}`);
        const productId = productRes.data.id;
        console.log(`✅ Product Created: ${productId}`);

        // 3. Public Product Access
        console.log('\n🌍 3. Testing Public Product Access (No Auth)...');
        const publicRes = await request('GET', `/products/${productId}`);
        if (publicRes.status !== 200) throw new Error(`Public Access failed: ${JSON.stringify(publicRes.data)}`);
        console.log('✅ Public Product Access Confirmed');

        // 4. Update Product
        console.log('\n✏️  4. Testing Product Update (Admin)...');
        const updateRes = await request('PUT', `/products/${productId}`, adminToken, {
            price: 15.99,
            stock: 50
        });
        if (updateRes.status !== 200) throw new Error(`Update Product failed: ${JSON.stringify(updateRes.data)}`);
        console.log('✅ Product Updated');

        // 5. Inventory Restock
        console.log('\n📈 5. Testing Inventory Restock (Admin)...');
        const restockRes = await request('POST', '/inventory/restock', adminToken, {
            productId,
            quantity: 50,
            reason: 'Test Restock'
        });
        if (restockRes.status !== 200) throw new Error(`Restock failed: ${JSON.stringify(restockRes.data)}`);
        console.log('✅ Inventory Restocked (+50)');

        // 6. Analytics
        console.log('\n📊 6. Testing Analytics (Admin)...');
        const analyticsRes = await request('GET', '/analytics/summary', adminToken);
        if (analyticsRes.status !== 200) throw new Error(`Analytics failed: ${JSON.stringify(analyticsRes.data)}`);
        console.log('✅ Analytics Summary Retrieved');

        // 7. Cashier Login
        console.log('\n👤 7. Testing Cashier Login...');
        const cashierLoginRes = await request('POST', '/auth/login', undefined, {
            username: 'cashier',
            password: 'cashier123'
        });

        if (cashierLoginRes.status !== 200) {
            console.log('⚠️  Cashier seed user might not match. Attempting to create cashier as Admin...');
            // Try to create cashier if login fails
            await request('POST', '/users', adminToken, {
                username: 'cashier',
                password: 'cashier123',
                role: 'cashier'
            });
            // Retry login
            const retryLogin = await request('POST', '/auth/login', undefined, {
                username: 'cashier',
                password: 'cashier123'
            });
            if (retryLogin.status !== 200) throw new Error(`Cashier Login failed after creation attempt: ${JSON.stringify(retryLogin.data)}`);
            // Use new token
            var cashierToken = retryLogin.data.token;
        } else {
            var cashierToken = cashierLoginRes.data.token;
        }
        console.log('✅ Cashier Logged In');

        // 8. Process Sale
        console.log('\n💸 8. Testing Process Sale (Cashier)...');
        const saleRes = await request('POST', '/sales', cashierToken, {
            items: [
                {
                    productId,
                    quantity: 2,
                    priceAtSale: 15.99
                }
            ],
            paymentMethod: 'CASH'
        });

        if (saleRes.status !== 201) throw new Error(`Sale failed: ${JSON.stringify(saleRes.data)}`);
        console.log(`✅ Sale Processed: ${saleRes.data.id}`);

        console.log('\n---------------------------------------------');
        console.log('🎉 ALL AUTOMATED TESTS PASSED!');
        console.log('---------------------------------------------');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    }
}

runTests();
