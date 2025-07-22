export type Price = {
  currency: string;
  amount: number;
  decimals: number;
  regular_amount: number | null;
};

export type ItemSummary = {
  id: string;
  title: string;
  price: Price;
  picture: string;
  condition: string;
  free_shipping: boolean;
  installments: string;
  seller: string;
  is_refurbished?: boolean;
};

export type ItemDetail = {
  id: string;
  title: string;
  price: Price;
  pictures: string[];
  condition: string;
  free_shipping: boolean;
  sold_quantity: number;
  installments: string;
  description: string;
  attributes: { id: string; name: string; value_name: string }[];
  category_path_from_root: string[];
  seller?: string;
   warranty?: string | null;
};
