import path from "path";
import fs from "fs";
import { readJSON, itemExists } from "../utils/file";
import { normalize } from "../utils/normailize";
import { formatPrice } from "../utils/price";
import {ItemSummary, ItemDetail} from "../types/itemsServiceTypes";

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
    const data = readJSON(path.join(folderPath, file));

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

    const { amount, decimals } = formatPrice(item.price ?? 0);
    const regularAmount = item.original_price
      ? formatPrice(item.original_price).amount
      : null;

    const seller =
      item.official_store_name || item.seller?.nickname || "Desconocido";

    return {
      id: item.id,
      title: item.title || "Sin título",
      price: {
        currency: item.currency_id || "ARS",
        amount,
        decimals,
        regular_amount: regularAmount,
      },
      picture: item.thumbnail || "",
      condition: item.condition || "unknown",
      free_shipping: item.shipping?.free_shipping || false,
      installments: `${item.installments?.quantity || 1}`,
      seller,
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

  let installmentsText = "1";
  let sellerName = "Desconocido";
  let soldQuantity = item.sold_quantity ?? 0;
  let priceAmount = item.price;
  let regularAmount = item.original_price || null;

  for (const file of searchFiles) {
    const data = readJSON(path.join(searchFolder, file));
    const result = data.results.find((entry: any) => entry.id === id);

    if (result) {
      if (result.installments?.quantity > 1) {
        installmentsText = `${result.installments.quantity}`;
      }

      sellerName =
        result.official_store_name || result.seller?.nickname || sellerName;

      if (typeof result.sold_quantity === "number") {
        soldQuantity = result.sold_quantity;
      }

      if (typeof result.price === "number") {
        priceAmount = result.price;
      }

      if (typeof result.original_price === "number") {
        regularAmount = result.original_price;
      }

      break;
    }
  }

  const { amount, decimals } = formatPrice(priceAmount);

  return {
    item: {
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount,
        decimals,
        regular_amount: regularAmount
          ? formatPrice(regularAmount).amount
          : null,
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
    }
  };
};
