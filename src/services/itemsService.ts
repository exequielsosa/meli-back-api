import path from "path";
import fs from "fs";

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
  seller?: String;
};

const readJSON = (filePath: string): any => {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

const normalize = (str: string | null | undefined = ""): string =>
  (str ?? "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const itemExists = (id: string): boolean => {
  const itemPath = path.join(__dirname, "../../mocks/items", `${id}.json`);
  return fs.existsSync(itemPath);
};

export const fetchItems = (
  query: string,
  offset: number = 0
): { categories: string[]; items: ItemSummary[] } => {
  const folderPath = path.join(__dirname, "../../mocks/search");
  const files = fs.readdirSync(folderPath);
  const normalizedTokens = normalize(query).split(/\s+/).filter(Boolean);

  const matchesTokens = (text: string) =>
    normalizedTokens.some((token) => text.includes(token));

  let allResults: any[] = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const data = readJSON(filePath);

    if (Array.isArray(data.results)) {
      data.results.forEach((item: any) => {
        allResults.push(item);

        if (item.variations && typeof item.variations === "object") {
          Object.values(item.variations).forEach((variation: any) => {
            allResults.push({
              id: variation.user_product_id,
              title: variation.name,
              thumbnail: variation.thumbnail,
              price: variation.price,
              condition: item.condition || "unknown",
              attributes: variation.attributes || [],
              attribute_combinations: variation.attribute_combinations || [],
              shipping: { free_shipping: false },
              installments: { quantity: 6 },
              seller: { nickname: "Desconocido" },
            });
          });
        }
      });
    }
  }

  const filtered = allResults.filter((item) => {
    const title = normalize(item.title ?? "");
    const attributes = item.attributes || [];
    const combinations = item.attribute_combinations || [];

    const brand = normalize(attributes.find((a: any) => a.id === "BRAND")?.value_name || "");
    const model = normalize(attributes.find((a: any) => a.id === "MODEL")?.value_name || "");

    const attributeValues = [
      ...attributes.map((a: any) => normalize(a.value_name || "")),
      ...combinations.map((c: any) => normalize(c.value_name || ""))
    ];

    return (
      matchesTokens(title) ||
      matchesTokens(brand) ||
      matchesTokens(model) ||
      attributeValues.some((val) => matchesTokens(val))
    );
  });

  const resultsToUse = filtered.length > 0 ? filtered : allResults;

  const resultsWithDetail = resultsToUse.filter((item) => itemExists(item.id));

  const mappedItems: ItemSummary[] = resultsWithDetail.map((item: any) => {
    const isRefurbished = item.attributes?.some(
      (attr: any) => normalize(attr.value_name) === "reacondicionado"
    );

    const rawPrice = typeof item.price === "number" ? Number(item.price.toFixed(2)) : 0;
    const decimals = parseInt((rawPrice % 1).toFixed(2).split(".")[1]);

    let sellerName = "Desconocido";
    if (item.official_store_name) {
      sellerName = item.official_store_name;
    } else if (item.seller?.nickname) {
      sellerName = item.seller.nickname;
    }

    return {
      id: item.id,
      title: item.title || "Sin título",
      price: {
        currency: item.currency_id || "ARS",
        amount: rawPrice,
        decimals,
        regular_amount: item.original_price
          ? Number(item.original_price.toFixed(2))
          : null,
      },
      picture: item.thumbnail || "",
      condition: item.condition || "unknown",
      free_shipping: item.shipping?.free_shipping || false,
      installments: `${item.installments?.quantity || 1}`,
      seller: sellerName,
      is_refurbished: isRefurbished,
    };
  });

  return {
    categories: [],
    items: mappedItems.slice(offset, offset + 50),
  };
};



export const fetchItemDetail = (id: string): { item: ItemDetail } => {
  const itemPath = path.join(__dirname, "../../mocks/items", `${id}.json`);
  const descPath = path.join(__dirname, "../../mocks/descriptions", `${id}.json`);
  const catPath = path.join(__dirname, "../../mocks/categories", `${id}.json`);

  const item = readJSON(itemPath);
  const description = readJSON(descPath);
  const category = readJSON(catPath);

  const searchFolder = path.join(__dirname, "../../mocks/search");
  const searchFiles = fs.readdirSync(searchFolder);

  let installmentsText = "1 cuota";
  let sellerName = "Desconocido";
  let soldQuantity = item.sold_quantity ?? 0;

  let priceAmount = item.price;
  let regularAmount = item.original_price || null;

  for (const file of searchFiles) {
    const filePath = path.join(searchFolder, file);
    const data = readJSON(filePath);
    const result = data.results.find((entry: any) => entry.id === id);

    if (result) {
      if (result.installments?.quantity > 1) {
        installmentsText = `${result.installments.quantity}`;
      }

      if (result.official_store_name) {
        sellerName = result.official_store_name;
      } else if (result.seller?.nickname) {
        sellerName = result.seller.nickname;
      }

      if (typeof result.sold_quantity === "number") {
        soldQuantity = result.sold_quantity;
      }

      // Tomar precio desde search
      if (typeof result.price === "number") {
        priceAmount = Number(result.price.toFixed(2));
      }

      if (typeof result.original_price === "number") {
        regularAmount = Number(result.original_price.toFixed(2));
      }

      break;
    }
  }

  const amount = Number(priceAmount.toFixed(2));
  const decimals = Number((amount % 1).toFixed(2).split(".")[1]);

  const detail: ItemDetail = {
    id: item.id,
    title: item.title,
    price: {
      currency: item.currency_id,
      amount,
      decimals,
      regular_amount: regularAmount,
    },
    pictures: item.pictures.map((pic: any) => pic.url),
    condition: item.condition,
    free_shipping: item.shipping?.free_shipping || false,
    sold_quantity: soldQuantity,
    installments: installmentsText,
    description: description.plain_text,
    attributes: item.attributes.map((attr: any) => ({
      id: attr.id,
      name: attr.name,
      value_name: attr.value_name,
    })),
    category_path_from_root: category.path_from_root.map((cat: any) => cat.name),
    seller: sellerName,
  };

  return { item: detail };
};


