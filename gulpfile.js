/* ========================
 * RENSEIGNER LE VHOST ICI
 * ======================== */
var vhostName = 'geonerd' + '.husk.d3v';

/* ========================
 * NE RIEN CHANGER A PARTIR DE CETTE LIGNE
 * ======================== */
const {src, dest, task, watch, series, parallel} = require('gulp');
const gulpSass = require('gulp-sass');
const dartSass = require('sass');
const sass = gulpSass(dartSass);
const autoprefixer = require('gulp-autoprefixer');
const jshint = require('gulp-jshint');
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const del = require('del');

const appDir = 'app/';
const distDir = 'dist/';

const paths = {
	js: {
		src: appDir + 'js/**/*.js'
	},
	css: {
		src: appDir + 'scss/**/*.scss',
	}
};

function initBrowserSync(cb){
	browserSync.init({
		proxy: vhostName,
		ghostMode: false,
		open: false,
		logPrefix: vhostName,
		snippetOptions: {
			rule: {
				match: /<\/head>/u,
				fn(snippet, match) {
					const {
						groups: {src}
					} = /src='(?<src>[^']+)'/u.exec(snippet);

					return `<script src="${src}" async></script>${match}`;
				}
			}
		}
	});
	cb();
}

function reload(cb){
	browserSync.reload();
	cb();
}

function reset() {
	return del([
		distDir + "/app.js",
		distDir + "/app.css",
	]);
}

function css() {
	return src(paths.css.src, { sourcemaps: true })
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer('last 4 versions'))
		.pipe(dest(distDir, { sourcemaps: '.' }))
		.pipe(browserSync.reload({stream: true}));
}

function lint(cb) {
	return src(paths.js.src)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
}

function js() {
	return src(paths.js.src, { sourcemaps: true })
		.pipe(concat('app.js'))
		.pipe(dest(distDir, { sourcemaps: '.' }));
}

function initWatch() {
	watch("index.html", series(reload));
	watch(paths.css.src, series(css));
	watch(paths.js.src, series(lint, js, reload));
}

const buildScripts = series(
	lint,
	parallel(js)
);

module.build = task('build', series(
	reset,
	parallel(
		css,
		buildScripts
	)
));

// Available Gulp Commands
module.default = task('default', series(
	reset,
	parallel(
		css,
		buildScripts
	),
	parallel(
		initBrowserSync,
		initWatch
	)
));
