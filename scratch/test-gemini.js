const apiKey = "AQ.Ab8RN6L-i7KoQ9RQHbxybqtj370Eit5P7t3Y1g2iPii_rlzbZQ";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function test() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hello! Are you online?" }] }]
      })
    });

    const status = response.status;
    const body = await response.text();
    console.log("Status Code:", status);
    console.log("Response Body:", body);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

test();
