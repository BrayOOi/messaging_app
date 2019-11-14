// Always return a username string
function UsernameWarning(toggle, status="") {
  const warningText = document.querySelector("#Index-PopUp .help");
  const warningBlock = document.querySelector("#Index-PopUp input");

  warningManager(warningBlock, warningText, toggle, status);
}


function SearchBarWarning(toggle, status="") {
  const searchBar = document.querySelector("#Menu-Channels .input");
  const searchWarning = document.querySelector("#Menu-Channels p");

  warningManager(searchBar, searchWarning, toggle, status);
}


function warningManager(warningNode, warningText, toggle, status) {
  // Clean up prior errors
  warningNode.classList.remove("is-danger");
  warningText.textContent = "";

  if (toggle) {
    warningNode.classList.add("is-danger");
  } else {
    // turn off the warning
    warningNode.classList.remove("is-danger");
  }
  warningText.textContent = status;
}


function usernameModalManager(user) {
  const usernameModal = document.querySelector("#Template-Modal").innerHTML;

  // Force pop up
  document.querySelector("main").innerHTML += usernameModal;

  // get unvalidated username
  document.querySelector("#Index-PopUp button")
    .addEventListener("click", function(event) {
      event.preventDefault();

      modalHandler(user);
    }
  );

  document.querySelector("#Index-PopUp input")
    .addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.code == "Enter") {
        modalHandler(user);
      }
    }
  );

  function modalHandler(user) {
    // Remove prior errors if any
    UsernameWarning(false);

    // retrieve raw value
    const unvalidatedUsername = document.querySelector("#Index-PopUp input").value;
    
    // Client side validation
    if (!unvalidatedUsername) {
      UsernameWarning(true, "Please enter a valid name");

    } else {
      // pass the username to User Object to validate with server
      let serverValidateResult = new Promise((resolve, reject) => 
        resolve(user.getUsername(unvalidatedUsername)));
    
      serverValidateResult.then(validatedUsername => {

        document.querySelector("#Index-PopUp").classList.remove("is-active");

        // update data and sync to server
        user.dataUpdate();

        document.querySelector("#Layout-Greeting").innerHTML = 
          templateFn({"comment": `Hi, ${validatedUsername}`});

        return;
        })
      .catch(error => UsernameWarning(true, error ||"Please refresh the page and try again!"));
    }
  }
}