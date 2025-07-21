import path from 'path';
import fs from 'fs';

type Price = {
  currency: string;
  amount: number;
  decimals: number;
  regular_amount: number | null;
};

type ItemSummary = {
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

type ItemDetail = {
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
};

const readJSON = (filePath: string): any => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

export const fetchItems = (query: string, offset: number = 0): { categories: string[]; items: ItemSummary[] } => {
  const filePath = path.join(__dirname, '../../mocks/search', `${query}.json`);
  const rawData = readJSON(filePath);

  const categories: string[] =
    rawData.filters?.find((f: any) => f.id === 'category')?.values[0]?.path_from_root.map((cat: any) => cat.name) ||
    [];

  const items: ItemSummary[] = rawData.results.map((item: any) => {
    const isRefurbished = item.attributes?.some(
      (attr: any) => attr.value_name?.toLowerCase() === "reacondicionado"
    );

    return {
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount: Math.floor(item.price),
        decimals: parseInt((item.price % 1).toFixed(2).split('.')[1]),
        regular_amount: item.original_price || null,
      },
      picture: item.thumbnail,
      condition: item.condition,
      free_shipping: item.shipping?.free_shipping || false,
      installments: `${item.installments?.quantity} cuotas`,
      seller: item.seller?.nickname || "Desconocido",
      is_refurbished: isRefurbished, 
    };
  });

  return { categories, items };
};


export const fetchItemDetail = (id: string): { item: ItemDetail } => {
  const itemPath = path.join(__dirname, '../../mocks/items', `${id}.json`);
  const descPath = path.join(__dirname, '../../mocks/descriptions', `${id}.json`);
  const catPath = path.join(__dirname, '../../mocks/categories', `${id}.json`);

  const item = readJSON(itemPath);
  const description = readJSON(descPath);
  const category = readJSON(catPath);

  const detail: ItemDetail = {
    id: item.id,
    title: item.title,
    price: {
      currency: item.currency_id,
      amount: Math.floor(item.price),
      decimals: parseInt((item.price % 1).toFixed(2).split('.')[1]),
      regular_amount: item.original_price || null,
    },
    pictures: item.pictures.map((pic: any) => pic.url),
    condition: item.condition,
    free_shipping: item.shipping?.free_shipping || false,
    sold_quantity: item.sold_quantity,
    installments: `${item.installments?.quantity} cuotas`,
    description: description.plain_text,
    attributes: item.attributes.map((attr: any) => ({
      id: attr.id,
      name: attr.name,
      value_name: attr.value_name,
    })),
    category_path_from_root: category.path_from_root.map((cat: any) => cat.name),
  };

  return { item: detail };
};
