/* eslint-disable */

// Add "Copy" buttons
document.querySelectorAll("pre.hljs").forEach(function(codeBlock) {
  // Wrap the <pre> tag with a <div>
  var container = document.createElement("div");
  container.classList = "code-container";
  codeBlock.parentNode.insertBefore(container, codeBlock);
  container.appendChild(codeBlock);
  // Get the id of the textarea containing text to copy
  var textarea = codeBlock.querySelector("textarea");
  if (textarea) {
    // Create the "Copy" button
    var button = document.createElement("button");
    button.classList = "btn-copy";
    button.setAttribute("data-clipboard-target", "#" + textarea.id);
    button.setAttribute("title", "Copy code block content");
    button.innerText = "Copy";
    container.appendChild(button);
  }
});

// Initialize Clipboard.js
var clipboard = new ClipboardJS(".btn-copy");

// Copy callback
clipboard.on("success", function(e) {
  e.trigger.innerText = "Copied!";
  setTimeout(function() {
    e.trigger.innerText = "Copy";
  }, 2000);
  e.clearSelection();
});
