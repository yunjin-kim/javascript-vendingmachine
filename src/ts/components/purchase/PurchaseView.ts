import { selectDom, selectDomAll } from "../../utils/dom";
import { EditInsertMoneyProps, ProductProps } from "../../utils/interface";
import { purchasePossibleProductTemplate, purchaseTemplate } from "./purchaseTemplate";

class PurchaseView {
  vendingmachineFunctionWrap: HTMLElement;

  constructor() {
    this.vendingmachineFunctionWrap = selectDom(".main");

  }

  showInsertMoney(totalMoney: number) {
    const insertMoneyText = selectDom("#insert-money-text");
    insertMoneyText.textContent = `${totalMoney}`;
  }

  showPurchasePossibleProduct(productList: ProductProps[]) {
    const purchasePossibleProductTable = selectDom("#purchase-possible-product-table");
    purchasePossibleProductTable.insertAdjacentHTML(
      "beforeend",
      productList.map((product) => purchasePossibleProductTemplate(product)).join(" ")
    );
  }

  editPurchaseProductQuantity(productName: string) {
    const [, , productQuantity, purchaseButton] = Array.from(
      selectDomAll(".product-name")
        .find((productNameTd) => productNameTd.textContent === productName)
        .closest("tr")
        .children)
      productQuantity.textContent = `${+productQuantity.textContent - 1}`;

    if (+productQuantity.textContent === 0) {
      purchaseButton.textContent = "품절";
    }
  }

  renderPurchaseView() {
    this.vendingmachineFunctionWrap.replaceChildren();
    this.vendingmachineFunctionWrap.insertAdjacentHTML("beforeend", purchaseTemplate);
  }
}

export default PurchaseView;