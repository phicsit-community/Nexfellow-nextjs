"use client";

export default function TestPage() {
    console.log("TestPage rendered");
    return (
        <div style={{ padding: "50px" }}>
            <h1>Test Page</h1>
            <p>If this page doesn't loop, the issue is in the Login page.</p>
        </div>
    );
}
