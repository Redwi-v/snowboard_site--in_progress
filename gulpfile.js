let project_folder = require('path').basename(__dirname);
let fs = require('fs');
const webpack = require('webpack-stream');

let source_folder = '#src';

const webpackConfig = {
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime'],
					},
				},
			},
		],
	},
};

//пути
let path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css/',
		js: project_folder + '/js/',
		img: project_folder + '/img/',
		fonts: project_folder + '/fonts/',
	},
	src: {
		html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
		css: source_folder + '/scss/style.scss',
		js: source_folder + '/js/main.js',
		img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
		fonts: source_folder + '/fonts/*.ttf',
		icons: source_folder + '/iconsprite/*.svg',
	},
	watch: {
		html: source_folder + '/**/*.html',
		css: source_folder + '/scss/**/*.scss',
		js: source_folder + '/js/**/*.js',
		img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
	},
	clean: './' + project_folder + '/',
};
//plagins
let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	sсss = require('gulp-sass')(require('sass')),
	autoprefixer = require('gulp-autoprefixer'),
	group_media = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require('gulp-webpcss'),
	svgSprite = require('gulp-svg-sprite'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter');

//запускает браузер
function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: './' + project_folder + '/',
		},
		port: 3000,
		notify: false,
	});
}

//обновляет браузер
function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
}

//компилятор
function css() {
	return src(path.src.css)
		.pipe(
			sсss({
				outputStyle: 'expanded',
			}),
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 5 versions'],
				cascade: true,
			}),
		)
		.pipe(webpcss({ webpClass: '.webp', noWebpClass: '.no-webp' }))
		.pipe(dest(path.build.css)) //выгрузка файла в dist
		.pipe(clean_css())
		.pipe(
			rename({
				extname: '.min.css',
			}),
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream());
}

function js() {
	return src(path.src.js)
		.pipe(webpack(webpackConfig))
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream());
}

function images() {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70,
			}),
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(
			imagemin({
				progressive: true,
				svgPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3,
			}),
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream());
}

function fonts() {
	src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
	return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function () {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(
			fonter({
				formats: ['ttf'],
			}),
		)
		.pipe(dest(source_folder + '/fonts/'));
});

// no work, i don't know
gulp.task('svgssss', function () {
	return src([source_folder + '/iconsprite/*.svg'])
		.pipe(
			svgSprite({
				node: {
					stack: {
						sprite: '../icons/icons.svg',
						example: true,
					},
				},
			}),
		)
		.pipe(dest(path.build.img));
});

function fontsStyle(params) {
	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(
							source_folder + '/scss/fonts.scss',
							'@include font("' +
								fontname +
								'", "' +
								fontname +
								'", "400", "normal");\r\n',
							cb,
						);
					}
					c_fontname = fontname;
				}
			}
		});
	}
}

function cb() {}

//смотрит за обновлениями файлов
function watchFiles(params) {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
}
//удаляет папку dist для отчистки ненужных файлов
function clean() {
	return del(path.clean);
}

//серия выполняемых функций
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
