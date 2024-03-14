export function postInit({ mdIt }) {
  const defaultRender = mdIt.renderer.rules.text;
  mdIt.renderer.rules.text = function (tokens, idx, options, env, self) {
    if (tokens[idx].content.endsWith("+ preCompile")) {
      tokens[idx].content += " + postInit";
    }
    return defaultRender(tokens, idx, options, env, self);
  };
  return { mdIt };
}

export function preCompile(data) {
  return { ...data, md: data.md.replace(/^(# .+)\n/, "$1 + preCompile\n") };
}

export function preRender(data) {
  return { ...data, title: `${data.title} + preRender` };
}

export function preInline(data) {
  return { ...data, html: data.html.replace(/(<\/title>)/, " + preInline$1") };
}

export function preWrite(data) {
  return { ...data, html: data.html.replace(/(<\/title>)/, " + preWrite$1") };
}
