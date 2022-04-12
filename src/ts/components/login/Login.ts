import { addEvent, selectDom, selectDomAll } from "../../utils/dom";
import { ConvertTemplate } from "../../utils/interface";
import { validateLoginEmail, validateLoginPassword } from "../../utils/validation";
import { showSnackbar } from "../snackbar/snackbar";
import { loginTemplate } from "./loginTemplate";

class Login {
  loginDebounce: Boolean;
  vendingmachineFunctionWrap: HTMLElement;
  loginErrorMessage: HTMLElement;

  constructor(readonly convertTemplate: ConvertTemplate) {
    this.convertTemplate = convertTemplate;
    this.loginDebounce = false;
    this.vendingmachineFunctionWrap = selectDom(".main");
  }

  bindLoginDom() {
    const signupText = selectDom(".signup-text");
    const loginForm = selectDom("#login-form");
    this.loginErrorMessage = selectDom("#login-error-message");

    addEvent(signupText, "click", this.handleSignupText);
    addEvent(loginForm, "submit", this.handleLoginForm);
  }

  handleLoginForm = async (event: Event) => {
    event.preventDefault();

    if (this.loginDebounce) {
      return;
    }

    this.loginDebounce = true;

    const [emailInput, passwordInput] = selectDomAll(".member-info-input");
    const emailInputValue = (emailInput as HTMLInputElement).value;
    const passwordValue = (passwordInput as HTMLInputElement).value;

    if (
      !validateLoginEmail({ emailInputValue, loginErrorMessage: this.loginErrorMessage }) ||
      !validateLoginPassword({ passwordValue, loginErrorMessage: this.loginErrorMessage })
    ) {
      this.loginDebounce = false;
      return;
    }
    
    try {
      const response = await fetch("https://vendingdb.herokuapp.com/login", {
        method: "POST",
        body: JSON.stringify({
          email: emailInputValue,
          password: passwordValue,
        }),
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (Math.floor(response.status/100) !== 2) {
        throw Error("가입된 계정이 없습니다.");
      }
      
      const { accessToken, user } = await response.json();
  
      localStorage.setItem("ACCESS_TOKEN", JSON.stringify(accessToken));
      localStorage.setItem("USER_ID", JSON.stringify(user.id));
      localStorage.setItem("USER_NAME", JSON.stringify(user.name));

      history.pushState({ path: "#product" }, null, "#product");
      this.convertTemplate("#product");
      this.loginDebounce = false;
    } catch ({ message }) {
      showSnackbar(message);
      (passwordInput as HTMLInputElement).value = "";
      this.loginErrorMessage.textContent = "";
      this.loginDebounce = false;
      return;
    }
  }

  handleSignupText = () => {
    history.pushState({ path: "#signup" }, null, "#signup");
    this.convertTemplate("#signup");
  };

  render() {
    this.vendingmachineFunctionWrap.replaceChildren();
    this.vendingmachineFunctionWrap.insertAdjacentHTML("beforeend", loginTemplate);
    this.bindLoginDom();
  }
}

export default Login;
