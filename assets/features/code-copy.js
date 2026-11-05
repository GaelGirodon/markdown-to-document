/* eslint-disable */

// Add "Copy" buttons
document.querySelectorAll("pre.code-block").forEach(function (codeBlock) {
  // Wrap the <pre> tag with a <div>
  const container = document.createElement("div");
  container.className = "code-container";
  codeBlock.parentNode.insertBefore(container, codeBlock);
  container.appendChild(codeBlock);
  // Get the id of the textarea containing text to copy
  const textarea = codeBlock.querySelector("textarea");
  if (textarea) {
    // Create the "Copy" button
    const button = document.createElement("button");
    button.className = "btn-copy";
    button.setAttribute("data-clipboard-target", "#" + textarea.id);
    button.setAttribute("title", "Copy code block content");
    button.innerText = "Copy";
    container.appendChild(button);
  }
});

// Initialize Clipboard.js
const clipboard = new ClipboardJS(".btn-copy");

// Copy callback
clipboard.on("success", function (e) {
  e.trigger.innerText = "Copied!";
  setTimeout(function () {
    e.trigger.innerText = "Copy";
  }, 2000);
  e.clearSelection();
});
