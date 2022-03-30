interface productProps {
  productName: string;
  productPrice: number;
  productQuantity: number;
};

interface changeEditProductInfoProps {
  target: HTMLElement;
  productName: string;
  productPrice: number;
  productQuantity: number;
}

interface CoinType {
  10: number;
  50: number;
  100: number;
  500: number;
}

export { productProps, changeEditProductInfoProps, CoinType };