export const normalize = (str: string | null | undefined = ""): string =>
  (str ?? "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");


