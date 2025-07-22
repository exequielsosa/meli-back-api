import fs from "fs";
import path from "path";

export const readJSON = (filePath: string): any => {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

export const itemExists = (id: string): boolean => {
  const itemPath = path.join(__dirname, "../../mocks/items", `${id}.json`);
  return fs.existsSync(itemPath);
};
