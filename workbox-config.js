module.exports = {
  "globDirectory": "website/",
  "globPatterns": [
    "**/*.css",
    "index.html"
  ],
  "swSrc": "src/sw.js",
  "swDest": "website/sw.js",
  "globIgnores": [
    "../workbox-config.js"
  ]
};