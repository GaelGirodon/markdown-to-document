export function valid(data) {
  return data;
}

export const notAFunction = "";

export function functionThrows() {
  throw new Error("Something went wrong");
}

export function returnsNothing() {
  return undefined;
}

export function returnsInvalid() {
  return { anotherKey: "value" };
}
