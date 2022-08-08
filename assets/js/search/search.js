var idx = lunr(function () {
  this.field('title');
  this.field('description');
  this.field('content');
  this.field('tags', { boost: 5 });
  this.ref('id');

  this.pipeline.remove(lunr.trimmer);

  for (var item in store) {
    this.add({
      title: store[item].title,
      description: store[item].description,
      content: store[item].content,
      tags: store[item].tags,
      id: item,
    });
  }
});

$(document).ready(function() {
  $('input#search-box').on('keyup', function () {
    var resultdiv = $('#search-results-list');
    var query = $(this).val().toLowerCase();
    var result =
      idx.query(function (q) {
        query.split(lunr.tokenizer.separator).forEach(function (term) {
          q.term(term, { boost: 100 })
          if(query.lastIndexOf(" ") != query.length-1){
            q.term(term, {  usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 })
          }
          if (term != ""){
            q.term(term, {  usePipeline: false, editDistance: 1, boost: 1 })
          }
        })
      });
    resultdiv.empty();
    resultdiv.prepend(`<p class="search-results-list__count ps-1">${result.length} result(s) found</p>`);
    for (var item in result) {
      var ref = result[item].ref;
      if (store[ref].type === "tag") {
        var icon = "fas fa-tag";
        var head = `<a class="post-tags tag" href="${store[ref].url}">${store[ref].title}</a>`;
        var desc = store[ref].content;
        var words = desc.split(" ");
        if (words.length > 15) {
          words = words.splice(0, 15);
          var end = words[words.length - 1].endsWith('.') ? '' : '...';
          desc = words.join(" ") + end;
        }
      } else {
        var icon = "fas fa-book-open";
        var tags = store[ref].tags;
        if (tags.includes("project")) {
          icon = "fas fa-cube";
        } else if (tags.includes("experience")) {
          icon = "fas fa-star";
        } else if (tags.includes("music")) {
          icon = "fas fa-music";
        }
        var head = `<a href="${store[ref].url}">${store[ref].title}</a>
                    <a class="post-tags tag ms-2" href="${base_url}/tags/${tags[0]}">${tags[0]}</a>`;
        var desc = store[ref].description;
      }
      
      var child = $(`
      <div class="d-flex flex-row align-items-center p-2 border-bottom search-results-list__item">
          <i class="${icon} fs-5"></i>
          <div class="d-flex flex-column ms-3">
              <h6 class="d-flex align-items-center mb-0">${head}</h6>
              <span>${desc}</span>
          </div>
      </div>
      `);
      child.appendTo("#search-results-list");
    }
  });

  $('.modal').on('shown.bs.modal', function() {
    $(this).find('[autofocus]').focus();
  });
});
