
async function check() {
    try {
        console.log('Pinging backend at http://localhost:3001/ ...');
        const res = await fetch('http://localhost:3001/');
        if (res.ok) {
            const json = await res.json();
            console.log('✅ Backend is UP:', json);
        } else {
            console.error('❌ Backend returned status:', res.status);
        }
    } catch (error) {
        console.error('❌ Backend check failed:', error.message);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
    }
}

check();
