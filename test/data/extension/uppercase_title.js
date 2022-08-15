export function preRender(data) {
  return { ...data, title: data.title.toUpperCase() };
}
