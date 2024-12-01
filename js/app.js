const sidebar = document.getElementById("sidebar");
const toggleButton = document.getElementById("toggle-sidebar");
const contentArea = document.getElementById("content-area");
const markdownIt = window.markdownit({
  html: true, // Allow raw HTML in Markdown
  highlight: (str, lang) => {
    if (lang && window.hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          window.hljs.highlight(str, { language: lang }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }
    return (
      '<pre class="hljs"><code>' +
      markdownIt.utils.escapeHtml(str) +
      "</code></pre>"
    );
  },
});

// Initialize Highlight.js
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre code").forEach((block) => {
    window.hljs.highlightElement(block);
  });
});

const addCopyButtons = () => {
  const codeBlocks = document.querySelectorAll("pre code");

  codeBlocks.forEach((block) => {
    // Check if the button already exists to avoid duplicates
    if (block.parentElement.querySelector(".copy-btn")) return;

    // Wrap the pre element to position the button
    const pre = block.parentElement;
    const wrapper = document.createElement("div");
    wrapper.classList.add("code-wrapper");
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // Create the "Copy" button
    const copyButton = document.createElement("button");
    copyButton.innerText = "Copy";
    copyButton.classList.add("copy-btn");
    wrapper.appendChild(copyButton);

    // Add click event to the button
    copyButton.addEventListener("click", () => {
      navigator.clipboard
        .writeText(block.innerText)
        .then(() => {
          copyButton.innerText = "Copied!";
          setTimeout(() => (copyButton.innerText = "Copy"), 2000); // Reset text after 2 seconds
        })
        .catch(() => {
          copyButton.innerText = "Failed";
          setTimeout(() => (copyButton.innerText = "Copy"), 2000); // Reset text after 2 seconds
        });
    });
  });
};

const routes = {
  about: "content/about.md",
  contact: "content/contact.md",
  projects: "content/projects.md",
  blog: "content/blog.md",
};

// Function to fetch and render markdown

const loadContent = async (hash) => {
  const section = hash.replace("#", "") || "about";
  const file = routes[section] || routes["about"];
  try {
    const response = await fetch(file);
    const markdown = await response.text();
    contentArea.innerHTML = markdownIt.render(markdown);

    // Add "Copy" buttons to code blocks after rendering
    addCopyButtons();
  } catch (error) {
    contentArea.innerHTML =
      "<p>Error loading content. Please try again later.</p>";
  }
};

const adjustToggleButtonPosition = () => {
  if (sidebar.classList.contains("collapsed")) {
    toggleButton.innerHTML = "❯"; // Arrow pointing right when collapsed
    toggleButton.style.left = "10px"; // Adjust button position
  } else {
    toggleButton.innerHTML = "❮"; // Arrow pointing left when expanded
    toggleButton.style.left = "255px"; // Adjust button position
  }
};

// Handle manual toggle of the sidebar
toggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  adjustToggleButtonPosition();
});

// Automatically collapse or expand the sidebar based on screen width
const handleResize = () => {
  if (window.innerWidth <= 768) {
    // Collapse sidebar on small screens
    sidebar.classList.add("collapsed");
  } else {
    // Expand sidebar on larger screens
    sidebar.classList.remove("collapsed");
  }
  adjustToggleButtonPosition();
};


// Select the dark mode toggle button
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Function to enable/disable dark mode
const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    // Save preference to localStorage
    localStorage.setItem("dark-mode", isDarkMode ? "enabled" : "disabled");
    // Update the button text/icon
    darkModeToggle.innerText = isDarkMode ? "☀️" : "🌙";
};

// Event listener for the toggle button
darkModeToggle.addEventListener("click", toggleDarkMode);

// Check user preference on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedDarkMode = localStorage.getItem("dark-mode");
    if (savedDarkMode === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.innerText = "☀️";
    } else {
        darkModeToggle.innerText = "🌙";
    }
});

// Attach resize event listener
window.addEventListener("resize", handleResize);

// Event listener for hash change
window.addEventListener("hashchange", () => loadContent(window.location.hash));

// Initial setup
loadContent(window.location.hash);
handleResize(); // Ensure sidebar starts in the correct state
adjustToggleButtonPosition();
