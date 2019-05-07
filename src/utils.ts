import { stringify } from "querystring";

export const isPlainObject = (o: any) => Object.keys(o).length === 0;

export function createQuery(options: Record<string, any>) {
  const query = Object.keys(options).reduce(
    (ret, key) => {
      const v = options[key];
      if (v !== undefined && v !== null) {
        ret[key] = v;
      }
      return ret;
    },
    {} as Record<string, any>
  );

  if (isPlainObject(query)) return "";

  return `?${stringify(query)}`;
}
