#!/bin/bash
lychee --base https://trebledj.me --no-progress --accept '200,201,202,203,204,403,429' --include-verbatim --exclude-mail --exclude-path _site/404.html _site
