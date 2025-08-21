const generateBtn = document.getElementById("generateBtn");
const mainDesc = document.getElementById("mainDescription");
const result = document.getElementById("result");
const countdown = document.getElementById("countdown");
const aiImage = document.getElementById("aiImage");

generateBtn.addEventListener("click", async () => {
  const desc = mainDesc.value;
  if (!desc) return alert("Wpisz opis!");

  result.textContent = "";
  aiImage.src = "";

  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc })
    });

    const data = await res.json();

    if (data.error === "Limit 429") {
      let reset = parseInt(data.resetTime);
      countdown.textContent = `Limit API osiągnięty. Odnowienie za ${reset} sekund`;
      const interval = setInterval(() => {
        reset--;
        countdown.textContent = `Limit API osiągnięty. Odnowienie za ${reset} sekund`;
        if (reset <= 0) clearInterval(interval);
      }, 1000);
    } else {
      countdown.textContent = "";
      result.textContent = JSON.stringify(data.posts, null, 2);

      // generowanie obrazu AI
      const imgRes = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: desc })
      });
      const imgData = await imgRes.json();
      if (imgData.image) aiImage.src = imgData.image;
    }
  } catch (err) {
    result.textContent = err.message;
  }
});
