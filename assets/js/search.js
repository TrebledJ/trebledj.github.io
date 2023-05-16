$(async function () {
  const store = await (await fetch('/search.json')).json();
  const idx = lunr(function () {
    this.ref('id');
    this.field('title', { boost: 200 });
    this.field('description', { boost: 5 });
    this.field('keywords');
    this.field('tags', { boost: 100 });
    this.pipeline.remove(lunr.trimmer);
    this.pipeline.remove(lunr.stopWordFilter);
    for (const i in store) {
      this.add({
        id: i,
        title: store[i].title,
        description: store[i].description,
        keywords: store[i].keywords,
        tags: store[i].tags,
      });
    }
  });

  lunr.tokenizer.separator = /\s*,\s*/g;

  const resultdiv = $('#search-results-list');
  const searchBox = $('input#search-box');

  function getItemParams(idx) {
    const item = store[idx];
    switch (item.type) {
      case "tag":
        return {
          icon: "fa fa-tag",
          head: `<a class="post-tags tag" href="${item.url}">${item.title}</a>`,
          desc: item.description,
        };
      case "post":
        var tags = item.tags;
        var head = `<a href="${item.url}">${item.title}</a>
                  <a class="post-tags tag ms-2" href="/tags/${tags[0]}">${tags[0]}</a>`;
        var desc = item.description;

        if (tags.includes("project")) {
          return { icon: "fa fa-cube", head, desc };
        } else if (tags.includes("experience")) {
          return { icon: "fa fa-star", head, desc };
        } else if (tags.includes("ctf")) {
          return { icon: "fa fa-flag", head, desc };
        } else if (tags.includes("composition")) {
          return { icon: "fa fa-music", head, desc };
        } else if (tags.includes("programming")) {
          return { icon: "fa fa-laptop", head, desc };
        } else {
          return { icon: "fa fa-book", head, desc };
        }
    }
  }

  function addResults(result) {
    resultdiv.empty();
    resultdiv.prepend(`<p class="search-results-list__count ps-1">${result.length} result(s) found</p>`);

    for (const item in result) {
      const idx = result[item].ref;
      const { icon, head, desc } = getItemParams(idx);

      const child = $(`
      <div class="d-flex flex-row align-items-center p-2 border-bottom search-results-list__item">
          <i class="${icon} fs-5"></i>
          <div class="d-flex flex-column ms-3">
              <h6 class="d-flex align-items-center mb-0">${head}</h6>
              <span>${desc}</span>
          </div>
      </div>
      `);
      child.appendTo(resultdiv);
    }
  }

  searchBox.on('keyup', function () {
    const query = $(this).val().toLowerCase();
    if (!query.trim())
      return;

    const result = idx.search(query);
    addResults(result);
  });

  $('.modal').on('shown.bs.modal', function () {
    $(this).find('[autofocus]').focus();
  });
});
