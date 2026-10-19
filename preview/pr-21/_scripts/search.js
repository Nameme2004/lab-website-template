/*
  filters elements on page based on url or search box.
  syntax: term1 term2 "full phrase 1" "full phrase 2" "tag: tag 1"
  match if: all terms AND at least one phrase AND at least one tag
*/
{
  // elements to filter
  const elementSelector = ".card, .citation, .post-excerpt";
  // search box element
  const searchBoxSelector = ".search-box";
  // results info box element
  const infoBoxSelector = ".search-info";
  // tags element
  const tagSelector = ".tag";

  // split search query into terms, phrases, and tags
  const splitQuery = (query) => {
    // split into parts, preserve quotes
    const parts = query.match(/"[^"]*"|\S+/g) || [];

    // bins
    const terms = [];
    const phrases = [];
    const tags = [];

    // put parts into bins
    for (let part of parts) {
      if (part.startsWith('"')) {
        part = part.replaceAll('"', "").trim();
        if (part.startsWith("tag:"))
          tags.push(normalizeTag(part.replace(/tag:\s*/, "")));
        else phrases.push(part.toLowerCase());
      } else terms.push(part.toLowerCase());
    }

    return { terms, phrases, tags };
  };

  // normalize tag string for comparison
  window.normalizeTag = (tag) =>
    tag.trim().toLowerCase().replaceAll(/\s+/g, "-");

  // get data attribute contents of element and children
  const getAttr = (element, attr) =>
    [element, ...element.querySelectorAll(`[data-${attr}]`)]
      .map((element) => element.dataset[attr])
      .join(" ");

  // determine if element should show up in results based on query
  const elementMatches = (element, { terms, phrases, tags }) => {
    // tag elements within element
    const tagElements = [...element.querySelectorAll(".tag")];

    // check if text content exists in element
    const normalizeText = (value) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ");
    const hasText = (string) => {
      // A standalone year on a citation means its publication year, not a correction mentioned in its description.
      if (/^\d{4}$/.test(string) && element.dataset.publicationYear)
        return element.dataset.publicationYear === string;
      return normalizeText(
        element.textContent +
        getAttr(element, "tooltip") +
        getAttr(element, "search")
      ).includes(normalizeText(string));
    };
    // check if text matches a tag in element
    const hasTag = (string) =>
      tagElements.some((tag) => normalizeTag(tag.innerText) === string);

    // match logic
    return (
      (terms.every(hasText) || !terms.length) &&
      (phrases.some(hasText) || !phrases.length) &&
      (tags.some(hasTag) || !tags.length)
    );
  };

  // loop through elements, hide/show based on query, and return results info
  const filterElements = (parts) => {
    let elements = document.querySelectorAll(elementSelector);

    // results info
    let x = 0;
    let n = elements.length;
    let tags = parts.tags;

    // filter elements
    for (const element of elements) {
      if (elementMatches(element, parts)) {
        element.style.display = "";
        x++;
      } else element.style.display = "none";
    }

    return [x, n, tags];
  };

  // highlight search terms
  const highlightMatches = async ({ terms, phrases }) => {
    // make sure Mark library available
    if (typeof Mark === "undefined") return;

    // reset
    new Mark(document.body).unmark();

    // limit number of highlights to avoid slowdown
    let counter = 0;
    const filter = () => counter++ < 100;

    // highlight terms and phrases
    new Mark(elementSelector)
      .mark(terms, { separateWordSearch: true, filter })
      .mark(phrases, { separateWordSearch: false, filter });
  };

  // update search box based on query
  const updateSearchBox = (query = "") => {
    const boxes = document.querySelectorAll(searchBoxSelector);

    for (const box of boxes) {
      const input = box.querySelector("input");
      const button = box.querySelector("button");
      const icon = box.querySelector("button i");
      if (input.value !== query) input.value = query;
      icon.className = input.value.length
        ? "icon fa-solid fa-xmark"
        : "icon fa-solid fa-magnifying-glass";
      button.disabled = input.value.length ? false : true;
    }
  };

  // update info box based on query and results
  const updateInfoBox = (query, x, n) => {
    const boxes = document.querySelectorAll(infoBoxSelector);

    if (query.trim() || [...boxes].some((el) => el.hasAttribute("data-show-count"))) {
      // show all info boxes
      boxes.forEach((info) => (info.style.display = ""));

      const language = document.documentElement.lang.startsWith("zh") ? "Zh" : "En";
      boxes.forEach((el) => {
        const message = (el.dataset["results" + language] || "Showing {x} of {n} results")
          .replace("{x}", x.toLocaleString()).replace("{n}", n.toLocaleString());
        el.replaceChildren(document.createTextNode(message));
        const empty = el.dataset["empty" + language];
        if (!x && empty) el.append(document.createElement("br"), document.createTextNode(empty));
        if (!query.trim()) return;
        const clear = document.createElement("a");
        clear.href = "./";
        clear.textContent = el.dataset["clear" + language] || "Clear search";
        el.append(document.createElement("br"), clear);
      });
    }
    // if nothing searched
    else {
      // hide all info boxes
      boxes.forEach((info) => (info.style.display = "none"));
    }
  };

  // update tags based on query
  const updateTags = (query) => {
    const { tags } = splitQuery(query);
    document.querySelectorAll(tagSelector).forEach((tag) => {
      // set active if tag is in query
      if (tags.includes(normalizeTag(tag.innerText)))
        tag.setAttribute("data-active", "");
      else tag.removeAttribute("data-active");
    });
  };

  // run search with query
  const runSearch = (query = "") => {
    const parts = splitQuery(query);
    const [x, n] = filterElements(parts);
    updateSearchBox(query);
    updateInfoBox(query, x, n);
    updateTags(query);
    highlightMatches(parts);
  };

  // update url based on query
  const updateUrl = (query = "") => {
    const url = new URL(window.location);
    let params = new URLSearchParams(url.search);
    params.set("search", query);
    url.search = params.toString();
    window.history.replaceState(null, null, url);
  };

  // search based on url param
  const searchFromUrl = () => {
    const language = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
    document.querySelectorAll(searchBoxSelector).forEach((box) => {
      const input = box.querySelector("input");
      const button = box.querySelector("button");
      input.placeholder = input.dataset[language === "zh" ? "placeholderZh" : "placeholderEn"] || "Search items on this page";
      input.setAttribute("aria-label", input.placeholder);
      const label = button.dataset[language === "zh" ? "labelZh" : "labelEn"] || "Clear search";
      button.setAttribute("aria-label", label);
      button.setAttribute("data-tooltip", label);
      if (button._tippy) button._tippy.setContent(label);
    });
    const query =
      new URLSearchParams(window.location.search).get("search") || "";
    runSearch(query);
  };

  // return func that runs after delay
  const debounce = (callback, delay = 250) => {
    let timeout;
    return (...args) => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => callback(...args), delay);
    };
  };

  // when user types into search box
  const debouncedRunSearch = debounce(runSearch, 1000);
  window.onSearchInput = (target) => {
    if (target.closest("[data-search-live]")) runSearch(target.value);
    else debouncedRunSearch(target.value);
    updateUrl(target.value);
  };

  // when user clears search box with button
  window.onSearchClear = () => {
    runSearch();
    updateUrl();
  };

  // after page loads
  window.addEventListener("load", searchFromUrl);
  // after tags load
  window.addEventListener("tagsfetched", searchFromUrl);
  window.addEventListener("languagechange", searchFromUrl);
}
