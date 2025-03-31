fetch("https://eduStreakz-backend.vercel.app/api/progress", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
})
.then(res => res.json())
.then(data => console.log("Progress Data:", data))
.catch(error => console.error("Error:", error));