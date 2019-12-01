const gulp = require("gulp");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const minify = require("gulp-clean-css");

/**
 * Build the `github` theme from the CSS provided by
 * the github-markdown-css npm package.
 */
function buildGitHubTheme() {
  return gulp
    .src("node_modules/github-markdown-css/github-markdown.css")
    .pipe(replace(/\.markdown-body/g, "body"))
    .pipe(replace(/(list-style-type: lower-.*;)/g, "/* $1 */"))
    .pipe(replace("\n  padding: 16px;\n}", "\n  padding: 16px !important;\n}"))
    .pipe(minify())
    .pipe(rename("github.min.css"))
    .pipe(gulp.dest("assets/themes/"));
}

exports.buildGitHubTheme = buildGitHubTheme;
exports.default = gulp.series(buildGitHubTheme);
