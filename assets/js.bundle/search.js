/* global site, lunr */
// Use a modified `lunr.Builder.add` which accepts run-length-encoded
// text, so that we can pack our JSON a bit tighter.
lunr.Builder.prototype.addEncoded = function (ref, fieldName, field) {
  const docRef = ref;
  const fields = Object.keys(this._fields);

  const tokens = this.tokenizer(field, {
    fields: [fieldName],
  });
  const terms = this.pipeline.run(tokens);
  const fieldRef = new lunr.FieldRef(docRef, fieldName);
  const fieldTerms = Object.create(null);

  this.fieldTermFrequencies[fieldRef] = fieldTerms;
  this.fieldLengths[fieldRef] = 0;

  // store the length of this field for this document
  this.fieldLengths[fieldRef] += terms.length;

  // calculate term frequencies for this field
  for (let j = 0; j < terms.length; j++) {
    let term = terms[j];
    const count = Number.parseInt(term.str.slice(0, 2), 10);
    term = term.str.slice(2);

    fieldTerms[term] = count;

    // add to inverted index
    // create an initial posting if one doesn't exist
    if (this.invertedIndex[term] === undefined) {
      const posting = Object.create(null);
      posting._index = this.termIndex;
      this.termIndex += 1;

      for (let k = 0; k < fields.length; k++) {
        posting[fields[k]] = Object.create(null);
      }

      this.invertedIndex[term] = posting;
    }

    // add an entry for this term/fieldName/docRef to the invertedIndex
    if (this.invertedIndex[term][fieldName][docRef] === undefined) {
      this.invertedIndex[term][fieldName][docRef] = Object.create(null);
    }

    // store all whitelisted metadata about this token in the
    // inverted index
    for (let l = 0; l < this.metadataWhitelist.length; l++) {
      const metadataKey = this.metadataWhitelist[l];
      const metadata = term.metadata[metadataKey];

      if (this.invertedIndex[term][fieldName][docRef][metadataKey] === undefined) {
        this.invertedIndex[term][fieldName][docRef][metadataKey] = [];
      }

      this.invertedIndex[term][fieldName][docRef][metadataKey].push(metadata);
    }
  }
};

const searchResultIcons = site.search.resultIcons;
const searchResultDefaultIcon = site.search.resultDefaultIcon;

async function loadSearch(searchBox, resultDiv) {
  const store = await (await fetch('/search.json')).json();
  const idx = lunr(function () {
    this.ref('id');
    this.field('title', { boost: 50 });
    this.field('keywords', { boost: 1 });
    this.field('tags', { boost: 20 });
    this.pipeline.remove(lunr.trimmer);
    this.pipeline.remove(lunr.stopWordFilter);
    this.pipeline.remove(lunr.stemmer);
    for (const i in store) {
      this.add({
        id: i,
        title: store[i].title,
        tags: store[i].tags,
      });
      this.addEncoded(i, 'keywords', store[i].keywords);
    }
  });

  function getItemParams(i) {
    const item = store[i];
    switch (item.type) {
      case 'tag': {
        return {
          icon: 'fas fa-tag',
          head: `<a class="jtag" href="${item.url}">${item.title}</a>`,
          desc: item.excerpt,
        };
      }
      case 'post': {
        const tags = item.tags;
        const head = `<a href="${item.url}">${item.title}</a>
                  <a class="jtag ms-2" href="/tags/${tags[0]}/">${tags[0]}</a>`;
        const desc = item.excerpt;

        for (const { tag, icon } of searchResultIcons) {
          if (tags.includes(tag))
            return { icon, head, desc };
        }

        return { icon: searchResultDefaultIcon, head, desc };
      }
      default:
        console.error(`unknown item type: ${item.type}`);
        return null;
    }
  }

  function addResults(result) {
    const maxResults = site.search.maxResults;

    resultDiv.empty();
    // eslint-disable-next-line max-len
    resultDiv.prepend(`<p class="search-results-list__count ps-1">${result.length > maxResults ? `${maxResults}<sup>+</sup>` : result.length} result(s) found</p>`);

    let count = 0;
    for (const item in result) {
      const i = result[item].ref;
      const { icon, head, desc } = getItemParams(i);

      const child = $(`
      <div class="d-flex flex-row align-items-center p-2 border-bottom search-results-list__item">
          <i class="${icon} fs-5"></i>
          <div class="d-flex flex-column ms-3">
              <h6 class="d-flex align-items-center mb-0">${head}</h6>
              <span>${desc}</span>
          </div>
      </div>
      `);
      child.appendTo(resultDiv);

      count++;
      if (count > maxResults) {
        break;
      }
    }
  }

  searchBox.on('keyup', function () {
    const query = $(this).val().toLowerCase();

    // if (!query.trim())
    //   return; // Ignore empty input.

    const result = idx.query(function (q) {
      query.split(lunr.tokenizer.separator).forEach(term => {
        if (!term.trim())
          return;

        q.term(term, { boost: 1 }); // With stemmer, resolve to similar word.

        if (query[query.length - 1] !== ' ') {
          // Handle continuing words.
          q.term(term, { usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 });
        }

        // Handle possible typos or near words.
        const d = (term.length >= 8 ? 2 : (term.length >= 5 ? 1 : 0));
        q.term(term, { usePipeline: false, editDistance: d, boost: 1 });
      });
    });

    addResults(result);
  });

  searchBox.trigger('keyup'); // Trigger a search and pre-fill results.
}

$(() => {
  const searchBox = $('input#search-box');
  const resultDiv = $('#search-results-list');

  $('.modal').on('shown.bs.modal', async function () {
    $(this).find('[autofocus]').trigger('focus');
    await loadSearch(searchBox, resultDiv);
  });
});
