/* ============================================
   RESERVATIONS — book a table
   Phone placeholder updated to 072 924 2639
   ============================================ */

(function () {
  "use strict";

  const KEY = "hm_cafe_reservations";

  function getReservations() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveReservations(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  function initForm() {
    const form = document.getElementById("reserveForm");
    if (!form) return;

    // Set min date to today
    const dateInput = form.querySelector("input[type='date']");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.min = today;
      dateInput.value = today;
    }

    // Set phone placeholder
    const phoneInput = form.querySelector("input[name='phone']");
    if (phoneInput && !phoneInput.placeholder) {
      phoneInput.placeholder = "072 924 2639";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = new FormData(form);
      const reservation = {
        id: "RES" + Date.now().toString(36).toUpperCase(),
        date: data.get("date"),
        time: data.get("time"),
        guests: parseInt(data.get("guests"), 10),
        name: data.get("name"),
        phone: data.get("phone"),
        notes: data.get("notes") || "",
        created: new Date().toISOString(),
        status: "confirmed",
      };

      if (!reservation.name || !reservation.phone) {
        alert("Please fill in your name and phone.");
        return;
      }

      const all = getReservations();
      all.unshift(reservation);
      saveReservations(all);

      form.style.display = "none";
      const confirm = document.getElementById("reserveConfirm");
      if (confirm) {
        confirm.classList.add("show");
        confirm.querySelector(".rc-id").textContent = reservation.id;
        confirm.querySelector(".rc-date").textContent = new Date(
          reservation.date,
        ).toLocaleDateString("en-ZA", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        confirm.querySelector(".rc-time").textContent = reservation.time;
        confirm.querySelector(".rc-guests").textContent = reservation.guests;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initForm);
  window.HMReservations = { getReservations };
})();
