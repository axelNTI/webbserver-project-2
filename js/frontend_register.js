document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();

  let name = document.querySelector("#name-reg").value;
  let email = document.querySelector("#email-reg").value;
  let password = document.querySelector("#password-reg").value;
  let password_confirm = document.querySelector("#password-conf-reg").value;

  const emailRegex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,35}$/;

  const messageContent = document.querySelector(".alert-danger");

  if (!name || !email || !password || !password_confirm) {
    messageContent.textContent = "Fyll i all fält";
    return;
  }
  if (password !== password_confirm) {
    messageContent.textContent = "Lösenorden matchar inte";
    return;
  }
  if (!emailRegex.test(email)) {
    messageContent.textContent = "Ogiltig epostadress";
    return;
  }
  if (emailRegex.test(name)) {
    messageContent.textContent = "Användarnamn får inte vara en epostadress";
    return;
  }
  if (!passwordRegex.test(password)) {
    messageContent.textContent =
      "Lösenordet måste innehålla mellan 8 och 35 tecken, varav minst en siffra, en stor bokstav och en liten bokstav";
    return;
  }

  if (checksPass) {
    fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        password_confirm: password_confirm,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
