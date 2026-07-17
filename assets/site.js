/* ============================================================
   Bagdit site JS — waitlist forms + scroll reveal
   ============================================================

   ┌─────────────────────────────────────────────────────────┐
   │  PASTE YOUR FORMSPREE IDs HERE                          │
   │                                                         │
   │  1. Create a free account at https://formspree.io       │
   │  2. Make TWO forms: "Creator waitlist" and              │
   │     "Business waitlist"                                 │
   │  3. Each form has an ID like "mgvkzyqw" (the part       │
   │     after /f/ in its endpoint URL)                      │
   │  4. Replace the placeholders below                      │
   └─────────────────────────────────────────────────────────┘ */
var FORMSPREE = {
  creator:  "YOUR_CREATOR_FORM_ID",   // ← paste creator form ID
  business: "YOUR_BUSINESS_FORM_ID"   // ← paste business form ID
};

/* ---------------- waitlist forms ---------------- */
document.querySelectorAll("form[data-waitlist]").forEach(function (form) {
  var kind = form.getAttribute("data-waitlist"); // "creator" | "business"
  var msg = document.getElementById(form.getAttribute("data-msg"));
  var btn = form.querySelector("button");

  function show(ok, text) {
    if (ok) form.style.display = "none";
    msg.textContent = text;
    msg.className = "form-msg " + (ok ? "ok" : "err");
    msg.style.display = "block";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = FORMSPREE[kind];
    if (!id || id.indexOf("YOUR_") === 0) {
      show(false, "Form isn't connected yet — paste your Formspree ID at the top of assets/site.js.");
      return;
    }
    btn.disabled = true;
    var original = btn.textContent;
    btn.textContent = "Sending…";
    fetch("https://formspree.io/f/" + id, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (r) {
        if (r.ok) {
          show(true, kind === "creator"
            ? "You're in. We'll email you when your city opens."
            : "Got it — we'll reach out before we open your city.");
        } else {
          throw new Error("bad status");
        }
      })
      .catch(function () {
        show(false, "Something went wrong — please try again in a minute.");
        btn.disabled = false;
        btn.textContent = original;
      });
  });
});

/* ---------------- scroll reveal ---------------- */
if ("IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  // Safety net: if the observer never fires (throttled webviews), show everything.
  setTimeout(function () {
    if (!document.querySelector(".reveal.in")) {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    }
  }, 1500);
} else {
  document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
}
