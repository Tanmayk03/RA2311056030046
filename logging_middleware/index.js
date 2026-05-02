let ACCESS_TOKEN = null;
let tokenExpiresAt = 0;

export async function getToken() {
    if (ACCESS_TOKEN && Date.now() < tokenExpiresAt) {
        return ACCESS_TOKEN;
    }
    try {
        const response = await fetch('http://20.207.122.201/evaluation-service/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'tk5996@srmist.edu.in',
                name: 'tanmay kapoor',
                rollNo: 'ra2311056030046',
                accessCode: 'QkbpxH',
                clientID: 'a9548562-6f30-4ffc-ac09-27e161dcb9dd',
                clientSecret: 'FsRBnWAQNtnaAwdS'
            })
        });
        const data = await response.json();
        ACCESS_TOKEN = data.access_token;
        tokenExpiresAt = Date.now() + 14 * 60 * 1000; // 14 mins
        return ACCESS_TOKEN;
    } catch (e) {
        console.error("Token fetch error", e);
        return null;
    }
}

export async function Log(stack, level, package_name, message) {
    try {
        const token = await getToken();
        if (!token) return;
        
        const response = await fetch("http://20.207.122.201/evaluation-service/logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                stack: stack.toLowerCase(),
                level: level.toLowerCase(),
                package: package_name.toLowerCase(),
                message: message
            })
        });
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Log error", e);
    }
}
