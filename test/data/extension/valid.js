export function preRender(data) {
  return { ...data, title: `${data.title} + preRender` };
}

export function preInline(data) {
  return { ...data, html: data.html.replace(/(<\/title>)/g, " + preInline$1") };
}

export function preWrite(data) {
  return { ...data, html: data.html.replace(/(<\/title>)/g, " + preWrite$1") };
}
