#!/bin/bash
npx eslint assets/js/ eleventy/ eleventy.config.js --ignore-pattern='**/third-party/**/*.js' --ignore-pattern='**/rake-js/**' --fix
