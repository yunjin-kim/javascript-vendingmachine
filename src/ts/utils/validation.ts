import { PRODUCT, CHARGE, specialSymbolAsc, numberAsc, upperCaseAsc, lowerCaseAsc } from "./constants";
import { EditInsertMoneyProps, ValidateCheckerProps, ValidateEmailInfoProps, ValidateNameInfoProps, ValidatePasswordConfirmInfoProps, ValidatePasswordInfoProps } from "./interface";

const validater = (condition: ValidateCheckerProps[]) => {
  condition.forEach(({ checker, errorMsg }) => {
    if (checker()) {
      throw new Error(errorMsg);
    }
  })
}

const validateProductName = (productName: string | null) => {
  validater([
    {
      checker: () => productName.trim() === "",
      errorMsg: "상품명을 입력해주세요.",
    },
    {
      checker: () => productName.length > PRODUCT.MAX_LENGTH,
      errorMsg: `상품명은 최대 ${PRODUCT.MAX_LENGTH}글자까지 입력 가능합니다.`,
    },
  ])
};

const validateProductPrice = (productPrice: number | null) => {
  validater([
    {
      checker: () => typeof productPrice !== "number",
      errorMsg: "값을 모두 입력해주세요.",
    },
    {
      checker: () => productPrice < PRODUCT.MIN_PRICE || productPrice > PRODUCT.MAX_PRICE,
      errorMsg: `상품 가격은 ${PRODUCT.MIN_PRICE}원부터, 최대 ${PRODUCT.MAX_PRICE}원까지 가능합니다.`,
    },
    {
      checker: () => productPrice % PRODUCT.UNIT !== 0,
      errorMsg: `상품 가격은 ${PRODUCT.UNIT}원으로 나누어 떨어져야합니다.`,
    },
  ])
};

const valudateProductQuantity = (productQuantity: number | null) => {
  validater([
    {
      checker: () => productQuantity > PRODUCT.MAX_QUANTITY || productQuantity < PRODUCT.MIN_QUANTITY,
      errorMsg: `제품당 수량은 최소 ${PRODUCT.MIN_QUANTITY}개부터 최대 ${PRODUCT.MAX_QUANTITY}개까지 가능합니다.`,
    },
    {
      checker: () => productQuantity - Math.floor(productQuantity),
      errorMsg: "제품의 수량은 소수점으로 입력할 수 없습니다.",
    },
  ])
};

const validateSameProductName = (productName: string, productNameList: string[]) => {
  validater([
    {
      checker: () => productNameList.includes(productName),
      errorMsg: "같은 이름의 제품은 등록할 수 없습니다.",
    },
  ])
};

const validateCharge = (charge: number | null) => {
  validater([
    {
      checker: () => charge < CHARGE.MIN_PRICE || charge > CHARGE.MAX_PRICE,
      errorMsg: `최소 ${CHARGE.MIN_PRICE}원, 최대 ${CHARGE.MAX_PRICE}원까지 투입할 수 있습니다.`,
    },
    {
      checker: () => charge % CHARGE.UNIT !== 0,
      errorMsg: `잔돈은 ${CHARGE.UNIT}원으로 나누어 떨어지는 금액만 투입할 수 있습니다.`,
    },
    {
      checker: () => !charge,
      errorMsg: "금액을 입력해주세요.",
    },
  ])
};

const validatePossiblePurchaseProduct = ({ totalMoney, productPrice }: EditInsertMoneyProps) => {
  validater([
    {
      checker: () => totalMoney < productPrice,
      errorMsg: "보유한 금액이 부족합니다. 구매를 원하시면 금액을 더 투입해주세요.",
    },
  ])
};

const validateEmailInfo = ({ emailInputValue, emailInfoMessage }: ValidateEmailInfoProps): Boolean => {
  const emailInfoSplit = emailInputValue.split("");
  const emailInfoSplitAt = emailInputValue.split("@");
  const emailName = emailInfoSplitAt[0];
  const emailDomain = emailInfoSplitAt[1];

  try {
    validater([
      {
        checker: () => !emailInputValue,
        errorMsg: "필수 정보입니다.",
      },
      {
        checker: () => !emailInfoSplit.includes("@"),
        errorMsg: "이메일 입력값에는 @가 필수입니다.",
      },
      {
        checker: () => emailInfoSplit.filter((text) => text === "@").length > 1,
        errorMsg: "@ 다음 부분에 @기호를 포함할 수 없습니다.",
      },
      {
        checker: () => emailName.length === 0,
        errorMsg: "@ 앞부분을 입력해주세요.",
      },
      {
        checker: () => emailDomain.length < 1,
        errorMsg: "@ 뒷부분을 입력해주세요.",
      },
      {
        checker: () => emailInfoSplit.find((text) => text === " "),
        errorMsg: "이메일에 공백을 포함할 수 없습니다.",
      },
    ])

    return true;
  } catch ({ message }) {
    emailInfoMessage.textContent = `${message}`;

    return false;
  }
};

const validateNameInfo = ({ nameInputValue, nameInfoMessage }: ValidateNameInfoProps): Boolean => {
  const numberInputValueSplit = nameInputValue.split("");

  try {
    validater([
    {
      checker: () => !nameInputValue,
      errorMsg: "필수 정보입니다.",
    },
    {
      checker: () => numberInputValueSplit.find((_, index: number) => specialSymbolAsc.includes(nameInputValue.charCodeAt(index))),
      errorMsg: "한글과 영문을 입력해주세요. (특수기호, 숫자, 공백 사용 불가)",
    },
    {
      checker: () => numberInputValueSplit.find((_, index: number) => numberAsc.includes(nameInputValue.charCodeAt(index))),
      errorMsg: "한글과 영문을 입력해주세요. (특수기호, 숫자, 공백 사용 불가)",
    },
    {
      checker: () => numberInputValueSplit.find((text: string) => text === " "),
      errorMsg: "한글과 영문을 입력해주세요. (특수기호, 숫자, 공백 사용 불가)",
    },
  ])

    return true;
  } catch ({ message }) {
    nameInfoMessage.textContent = `${message}`;

    return false;
  }
};

const validatePasswordInfo = ({ passwordInputValue, passwordInfoMessage }: ValidatePasswordInfoProps): Boolean => {
  const validatePasswordInfoSplit = passwordInputValue.split("");

  try {
    validater([
      {
        checker: () => !passwordInputValue,
        errorMsg: "필수 정보입니다.",
      },
      {
        checker: () => validatePasswordInfoSplit.find((text) => text === " "),
        errorMsg: "비밀번호에 공백을 포함할 수 없습니다.",
      },
      {
        checker: () => !validatePasswordInfoSplit.find((_, index) => specialSymbolAsc.includes(passwordInputValue.charCodeAt(index))),
        errorMsg: "8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.",
      },
      {
        checker: () => !validatePasswordInfoSplit.find((_, index) => upperCaseAsc.includes(passwordInputValue.charCodeAt(index))),
        errorMsg: "8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.",
      },
      {
        checker: () => !validatePasswordInfoSplit.find((_, index) => lowerCaseAsc.includes(passwordInputValue.charCodeAt(index))),
        errorMsg: "8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.",
      },
      {
        checker: () => !validatePasswordInfoSplit.find((_, index) => numberAsc.includes(passwordInputValue.charCodeAt(index))),
        errorMsg: "8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.",
      },
    ])

    return true;
  } catch ({ message }) {
    passwordInfoMessage.textContent = `${message}`;

    return false;
  }
};

const validatePasswordConfirmInfo = ({ passwordConfirmInputValue, passwordInputValue, passwordConfirmInfoMessage }: ValidatePasswordConfirmInfoProps): Boolean => {
  try {
    validater([
      {
        checker: () => !passwordConfirmInputValue,
        errorMsg: "필수 정보입니다.",
      },
      {
        checker: () => passwordInputValue !== passwordConfirmInputValue,
        errorMsg: "비밀번호가 일치하지 않습니다.",
      },
    ])

    return true;
  } catch ({ message }) {
    passwordConfirmInfoMessage.textContent = `${message}`;

    return false;
  }
};

const validateLoginEmail = ({ emailInputValue, loginErrorMessage }) => {
  try {
    validater([
      {
        checker: () => emailInputValue.trim() === "",
        errorMsg: "이메일을 입력해주세요.",
      },
    ])

    return true;
  } catch ({ message }) {
    loginErrorMessage.textContent = `${message}`;

    return false;
  }
};

const validateLoginPassword = ({ passwordValue, loginErrorMessage }) => {
  try {
    validater([
      {
        checker: () => passwordValue.trim() === "",
        errorMsg: "비밀번호를 입력해주세요.",
      },
    ])

    return true;
  } catch ({ message }) {
    loginErrorMessage.textContent = `${message}`;

    return false;
  }
};

export { 
  validateProductName,
  validateProductPrice,
  valudateProductQuantity,
  validateSameProductName,
  validateCharge,
  validatePossiblePurchaseProduct,
  validateEmailInfo,
  validateNameInfo,
  validatePasswordInfo,
  validatePasswordConfirmInfo,
  validateLoginEmail,
  validateLoginPassword,
};
