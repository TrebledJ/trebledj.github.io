#!/bin/bash
lychee --base https://trebledj.me --user-agent 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' --no-progress --accept '200,201,202,203,204,403,429' --include-verbatim --exclude-mail --exclude-path _site/404.html _site
