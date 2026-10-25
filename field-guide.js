(() => {
  let dialog;
  let opener;
  let destination;

  function createDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "outbound-dialog";
    dialog.setAttribute("aria-labelledby", "outbound-question");

    const question = document.createElement("h2");
    question.id = "outbound-question";
    dialog.append(question);

    const actions = document.createElement("div");
    actions.className = "actions";
    const yes = document.createElement("button");
    yes.type = "button";
    yes.className = "button";
    yes.textContent = "Yes";
    yes.addEventListener("click", () => {
      window.open(destination, "_blank", "noopener,noreferrer");
      dialog.close();
    });
    const decline = document.createElement("button");
    decline.type = "button";
    decline.className = "button decline";
    decline.textContent = "Decline";
    decline.addEventListener("click", () => dialog.close());
    actions.append(yes, decline);
    dialog.append(actions);

    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.x || event.clientX > bounds.x + bounds.width ||
          event.clientY < bounds.y || event.clientY > bounds.y + bounds.height) dialog.close();
    });
    dialog.addEventListener("close", () => opener?.focus());
    document.body.append(dialog);
  }

  document.querySelectorAll("[data-external]").forEach(button => {
    button.addEventListener("click", () => {
      if (!dialog) createDialog();
      opener = button;
      destination = button.dataset.external;
      dialog.querySelector("h2").textContent = `Open ${button.dataset.site} in a new tab?`;
      dialog.showModal();
    });
  });

  const prefetched = new Set([...document.querySelectorAll('link[rel="prefetch"]')].map(link => link.href));
  const prefetch = link => {
    if (prefetched.has(link.href)) return;
    prefetched.add(link.href);
    const hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.href = link.href;
    document.head.append(hint);
  };
  const links = document.querySelectorAll("a[data-prefetch]");
  if ("IntersectionObserver" in window) {
    const visible = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        prefetch(entry.target);
        visible.unobserve(entry.target);
      });
    });
    links.forEach(link => visible.observe(link));
  } else {
    links.forEach(prefetch);
  }
})();
