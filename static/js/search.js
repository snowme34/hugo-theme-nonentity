document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("[data-search-modal]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const openers = document.querySelectorAll("[data-search-open]");
  const closers = document.querySelectorAll("[data-search-close]");
  const indexUrl = modal?.dataset.searchIndexUrl;
  let indexData = null;

  const escapeHtml = (value) => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  const stripHtml = (value) => value.replace(/<[^>]*>/g, " ");
  const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();
  const includesExact = (value, query) => value.toLowerCase().includes(query.toLowerCase());

  const buildSnippet = (item, query) => {
    const text = normalizeWhitespace(
      [item.summary, item.content]
        .filter(Boolean)
        .map(stripHtml)
        .join(" ")
    );
    if (!text) return "";

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
      return `${escapeHtml(text.slice(0, 140))}${text.length > 140 ? "…" : ""}`;
    }

    const start = Math.max(0, index - 45);
    const end = Math.min(text.length, index + query.length + 45);
    const before = escapeHtml(text.slice(start, index));
    const match = escapeHtml(text.slice(index, index + query.length));
    const after = escapeHtml(text.slice(index + query.length, end));

    return `${start > 0 ? "…" : ""}${before}<mark>${match}</mark>${after}${end < text.length ? "…" : ""}`;
  };

  const renderGroup = (title, items) => {
    if (!items.length) return "";
    return `
      <section class="search-results__section">
        <h3>${title}</h3>
        <ul>
          ${items.map((item) => `
            <li>
              <a href="${escapeHtml(item.uri)}">${escapeHtml(item.title)}</a>
              ${item.snippet ? `<p class="search-results__snippet">${item.snippet}</p>` : ""}
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  };

  const performSearch = () => {
    const q = input.value;
    const query = q.trim();
    if (!query || !indexData) {
      results.innerHTML = "";
      return;
    }

    const matchesEntry = (item) => includesExact([item.title, item.summary, item.content].filter(Boolean).join(" "), query);
    const posts = indexData.posts
      .filter(matchesEntry)
      .slice(0, 8)
      .map((item) => ({ ...item, snippet: buildSnippet(item, query) }));
    const pages = (indexData.pages || [])
      .filter(matchesEntry)
      .slice(0, 8)
      .map((item) => ({ ...item, snippet: buildSnippet(item, query) }));
    const categories = indexData.categories
      .filter((item) => includesExact(item.title, query))
      .slice(0, 8);
    const tags = indexData.tags
      .filter((item) => includesExact(item.title, query))
      .slice(0, 8);

    results.innerHTML =
      renderGroup("Posts", posts) +
      renderGroup("Pages", pages) +
      renderGroup("Categories", categories) +
      renderGroup("Tags", tags) ||
      "<p>No results</p>";
  };

  const open = async () => {
    modal.hidden = false;
    input.focus();
    if (!indexData && indexUrl) {
      try {
        const res = await fetch(indexUrl);
        indexData = await res.json();
      } catch {
        results.innerHTML = "<p>Search unavailable.</p>";
        return;
      }
    }
    performSearch();
  };

  const close = () => {
    modal.hidden = true;
    input.value = "";
    results.innerHTML = "";
  };

  openers.forEach((button) => button.addEventListener("click", open));
  closers.forEach((button) => button.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) close();
  });

  input?.addEventListener("input", performSearch);
});
