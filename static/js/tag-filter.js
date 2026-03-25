document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-tag-filter-root]");
  if (!root) return;

  const chips = [...root.querySelectorAll("[data-tag-filter-chip]")];
  const status = root.querySelector("[data-tag-filter-status]");
  const range = root.querySelector("[data-tag-filter-range]");
  const empty = root.querySelector("[data-tag-filter-empty]");
  const results = root.querySelector("[data-tag-filter-results]");
  const dataNode = root.querySelector("[data-tag-filter-data]");
  const allButton = root.querySelector("[data-tag-filter-action='all']");
  const clearButton = root.querySelector("[data-tag-filter-action='clear']");
  const modeButtons = [...root.querySelectorAll("[data-tag-filter-mode]")];
  const pagination = root.querySelector("[data-tag-filter-pagination]");
  const pageStatus = root.querySelector("[data-tag-filter-page-status]");
  const prevButton = root.querySelector("[data-tag-filter-page='prev']");
  const nextButton = root.querySelector("[data-tag-filter-page='next']");

  const posts = dataNode ? JSON.parse(dataNode.textContent) : [];
  const pageSize = parseInt(results.dataset.tagFilterPageSize, 10) || 15;
  const selected = new Set();
  let mode = "or";
  let page = 0;

  const escapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  const normalize = (value) => String(value || "").toLowerCase();

  const getVisiblePosts = () => {
    const activeTags = [...selected];
    if (activeTags.length === 0) return posts;
    return posts.filter((post) => {
      const normalizedTags = (post.tags || []).map((tag) => normalize(tag.name));
      return mode === "and"
        ? activeTags.every((tag) => normalizedTags.includes(tag))
        : activeTags.some((tag) => normalizedTags.includes(tag));
    });
  };

  const renderPost = (post) => {
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const tagLinks = tags.map((tag) => `<a href="${escapeHtml(tag.url)}" class="tag">${escapeHtml(tag.label || tag.name)}</a>`).join(", ");
    return `
      <li class="post-list-item">
        <h2 class="post-list-item__title"><a href="${escapeHtml(post.uri)}">${escapeHtml(post.title)}</a></h2>
        <div class="post-meta">
          <span class="post-meta__item"><time datetime="${escapeHtml(post.datetime)}">${escapeHtml(post.date)}</time></span>
          ${tagLinks ? `<span class="post-meta__item post-meta__item--tags">${tagLinks}</span>` : ""}
        </div>
        <p class="post-list-item__summary">${escapeHtml(post.excerpt)}</p>
      </li>
    `;
  };

  const sync = () => {
    const filtering = selected.size > 0;

    chips.forEach((chip) => {
      const active = selected.has(chip.dataset.tagName);
      chip.classList.toggle("is-selected", active);
      chip.classList.toggle("is-muted", filtering && !active);
    });

    modeButtons.forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.tagFilterMode === mode);
    });

    const visiblePosts = getVisiblePosts();
    const totalPages = Math.ceil(visiblePosts.length / pageSize);
    page = Math.max(0, Math.min(page, totalPages - 1));

    const start = page * pageSize;
    const end = start + pageSize;
    const pagePosts = visiblePosts.slice(start, end);

    results.innerHTML = pagePosts.map(renderPost).join("");

    if (status) {
      status.textContent = filtering
        ? `${visiblePosts.length} post${visiblePosts.length === 1 ? "" : "s"} match ${mode.toUpperCase()} filter`
        : `${visiblePosts.length} post${visiblePosts.length === 1 ? "" : "s"}`;
    }

    if (range) {
      if (visiblePosts.length > pageSize) {
        range.textContent = `Showing ${start + 1}–${Math.min(end, visiblePosts.length)} of ${visiblePosts.length}`;
      } else {
        range.textContent = visiblePosts.length > 0 ? `${visiblePosts.length} post${visiblePosts.length === 1 ? "" : "s"}` : "";
      }
    }

    if (pagination) {
      pagination.hidden = visiblePosts.length <= pageSize;
    }
    if (prevButton) {
      prevButton.classList.toggle("is-disabled", page === 0);
    }
    if (nextButton) {
      nextButton.classList.toggle("is-disabled", page >= totalPages - 1);
    }
    if (pageStatus) {
      pageStatus.textContent = totalPages > 1 ? `Page ${page + 1} of ${totalPages}` : "";
    }

    if (empty) {
      empty.hidden = visiblePosts.length > 0;
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const tag = chip.dataset.tagName;
      if (selected.has(tag)) {
        selected.delete(tag);
      } else {
        selected.add(tag);
      }
      page = 0;
      sync();
    });
  });

  allButton?.addEventListener("click", () => {
    chips.forEach((chip) => selected.add(chip.dataset.tagName));
    page = 0;
    sync();
  });

  clearButton?.addEventListener("click", () => {
    selected.clear();
    page = 0;
    sync();
  });

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.tagFilterMode;
      page = 0;
      sync();
    });
  });

  prevButton?.addEventListener("click", () => {
    if (page > 0) {
      page--;
      sync();
    }
  });

  nextButton?.addEventListener("click", () => {
    const totalPages = Math.ceil(getVisiblePosts().length / pageSize);
    if (page < totalPages - 1) {
      page++;
      sync();
    }
  });

  sync();
});
