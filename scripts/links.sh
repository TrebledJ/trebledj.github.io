#!/bin/bash
lychee --base _site --accept 100..=103,200..=299,403,429 --user-agent 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' --no-progress --include-verbatim --include-fragments --exclude-path _site/404.html _site
