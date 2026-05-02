export const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0azU5OTZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMTY1MCwiaWF0IjoxNzc3NzAwNzUwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNjI3YjgzYjQtMjNhZC00MWIwLTljNjgtZjM1NDE5ZWIxZDM1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoidGFubWF5IGthcG9vciIsInN1YiI6ImE5NTQ4NTYyLTZmMzAtNGZmYy1hYzA5LTI3ZTE2MWRjYjlkZCJ9LCJlbWFpbCI6InRrNTk5NkBzcm1pc3QuZWR1LmluIiwibmFtZSI6InRhbm1heSBrYXBvb3IiLCJyb2xsTm8iOiJyYTIzMTEwNTYwMzAwNDYiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiJhOTU0ODU2Mi02ZjMwLTRmZmMtYWMwOS0yN2UxNjFkY2I5ZGQiLCJjbGllbnRTZWNyZXQiOiJGc1JCbldBUU50bmFBd2RTIn0.lIhmjlZKid3lb8hQ970qIT2bU4ptMWkemMkQ0daHoIU";

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
