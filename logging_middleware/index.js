export const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0azU5OTZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzY5OTM1NCwiaWF0IjoxNzc3Njk4NDU0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiM2U0OGFlYTItNGU4Yy00NGM4LWJhNzItY2U5YWM1ZmQ1ZmY3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoidGFubWF5IGthcG9vciIsInN1YiI6ImE5NTQ4NTYyLTZmMzAtNGZmYy1hYzA5LTI3ZTE2MWRjYjlkZCJ9LCJlbWFpbCI6InRrNTk5NkBzcm1pc3QuZWR1LmluIiwibmFtZSI6InRhbm1heSBrYXBvb3IiLCJyb2xsTm8iOiJyYTIzMTEwNTYwMzAwNDYiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiJhOTU0ODU2Mi02ZjMwLTRmZmMtYWMwOS0yN2UxNjFkY2I5ZGQiLCJjbGllbnRTZWNyZXQiOiJGc1JCbldBUU50bmFBd2RTIn0.rVeecZKql_p0R1dnNTEuqJD8TwbCFGd52mrGql9ukZs";

export async function Log(stack, level, package_name, message) {
    try {
        const response = await fetch("http://20.207.122.201/evaluation-service/logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESS_TOKEN}`
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
