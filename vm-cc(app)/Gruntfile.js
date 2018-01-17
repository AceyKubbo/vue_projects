module.exports = function(grunt) {
    //构建变量
    var pkg = grunt.file.readJSON('package.json');
    var build = grunt.file.readJSON('build.json');
    var buildDir = pkg.name + '-' + build.templateName;
    var styleName = "style-" + pkg.version;
    var jsName = "biz-" + pkg.version;
    var jsRoot = "src/js/";
    // 初始化目录
    if (build.mode == 'dev') {
        if(!grunt.file.exists("src/css/lib")){
            grunt.file.mkdir("src/css/lib");
        }
        if(!grunt.file.exists("src/css/" + buildDir)){
            grunt.file.mkdir("src/css/" + buildDir);
        }
        if(!grunt.file.exists(jsRoot+ buildDir)){
            grunt.file.mkdir(jsRoot + buildDir);
            grunt.file.mkdir(jsRoot + buildDir+"/mods");
            grunt.file.mkdir(jsRoot + buildDir+"/layout");
        }
        if(!grunt.file.exists(jsRoot + "lib")){
            grunt.file.mkdir(jsRoot + "lib");
        }
        if(!grunt.file.exists("src/html/" + buildDir)){
            grunt.file.mkdir("src/html/" + buildDir);
            grunt.file.mkdir("src/html/" + buildDir+"/mods");
            grunt.file.mkdir("src/html/" + buildDir+"/layout");
        }
    }
    //---->begin css样式配置
    var styleBundle = [];
    if (build.mode == 'dev') {
        if(grunt.file.exists("dist/css/lib")){
            // grunt.file.recurse("dist/css/lib", function (abspath, rootdir, subdir, filename) {
            //     styleBundle.push('dist/css/lib/' + filename)
            // });
        }else{
            grunt.file.mkdir("dist/css/lib");
        }
        if(grunt.file.exists("dist/css/" + buildDir)){// 针对第一次创建项目没有生成对应的目录的判断,创建相应的目录
            grunt.file.recurse("dist/css/" + buildDir, function (abspath, rootdir, subdir, filename) {
                if (filename.indexOf('\.min\.css') == -1) {
                    styleBundle.push('dist/css/' + buildDir + "/" + filename)
                }
            });
        }else{
            grunt.file.mkdir("dist/css/" + buildDir);
        }
    } else {
        if(grunt.file.exists("dist/css/lib")){
            // grunt.file.recurse("dist/css/lib", function (abspath, rootdir, subdir, filename) {
            //     styleBundle.push('dist/css/lib/' + filename)
            // });
        }
        styleBundle.push('dist/css/' + buildDir + '/' + styleName + '.min.css')
    }
    //>---->end

    //---->begin htmlbuild 模块配置
    var htmlbuildConfig = {};
    htmlbuildConfig[build.templateName] = {
        src: 'src/html/template/' + build.templateName + '.html',
        dest: 'dist/',
        options: {
            beautify: true,
            sections: {
                views: 'src/html/' + buildDir + '/mods/**/*.html',
                layout: {
                    header: 'src/html/' + buildDir + '/layout/header.html',
                    slider: 'src/html/' + buildDir + '/layout/slider.html',
                    footer: 'src/html/' + buildDir + '/layout/footer.html'
                }
            },
            styles: {
                bundle: styleBundle
            },
            data: {
                appMain: buildDir + '/' + jsName
            }
        }
    }
    //>---->end

    //---->begin requirejs 模块配置
    var paths = {};
    ['lib'].forEach(function(jsLibDir){
        grunt.file.recurse(jsRoot+jsLibDir,function(abspath, rootdir, subdir, filename){
            var index = filename.lastIndexOf('\.js');
            if(index != -1) {
                var jsLibName = filename.substr(0,index);
                paths[jsLibName] = jsLibDir + "/" + jsLibName;
            }
        });
    })
    //---->end
    grunt.initConfig({
      pkg : pkg,
      build : build,
      concat: {
          javascript: {
              src: [jsRoot + buildDir + '/main.js',jsRoot + buildDir + '/layout/*.js',jsRoot + buildDir + '/mods/*.js'],
              dest: 'dist/js/' + buildDir + '/'+jsName+'.js'
          },
          css : {
              src: ['src/css/' + buildDir + '/*.css'],
              dest: 'dist/css/' + buildDir + '/' + styleName + '.min.css'
          }
      },
      cssmin:{
          css: {
              files: [
                  {expand: true,cwd: 'dist/css/'+buildDir,src: ['**/*.min.css'],dest: 'dist/css/'+buildDir}
              ]
          }
      },
      copy: {
          deployAll: {
            files: [
                {expand: true, cwd: 'dist/css',src: ['**'], dest: build.deployDir+"/css"},
                {expand: true, cwd: 'dist/js',src: ['**'], dest: build.deployDir+"/js"},
                {expand: true, cwd: 'dist/img',src: ['**'], dest: build.deployDir+"/img"},
                {expand: true, cwd: 'dist/plugins',src: ['**'], dest: build.deployDir+"/plugins"},
                {expand: true, cwd: 'dist/fonts',src: ['**'], dest: build.deployDir+"/fonts"},
                {expand: true, cwd: 'dist/',src: ['*.html'], dest: build.deployDir}
            ]
          },
          deployPlugins:{
              files: [
                  {expand: true, cwd: 'plugins',src: ['**'], dest: 'dist/plugins'}
              ]
          },
          javascript:{
              files:[
                  {expand: true, cwd: jsRoot+'lib',src: ['**'], dest: 'dist/js/lib'},
              ]
          },
          static:{
              files:[
                  {expand: true, cwd: 'src/css/lib',src: ['**'], dest: 'dist/css/lib'},
                  {expand: true, cwd: 'src/img',src: ['**'], dest: 'dist/img/'},
                  {expand: true, cwd: 'src/fonts',src: ['**'], dest: 'dist/fonts/'}
              ]
          }
      },
      htmlbuild: htmlbuildConfig,
      watch: {
          javascriptSource: {
              files: [
                  'src/html/**/*.html',
                  jsRoot+'**/*.js'
              ],
              tasks: ['js-build-deploy']
          },
          staticSource: {
              files: [
                  'src/html/**/*.html',
                  'src/img/**/*.*',
                  'src/fonts/**/*.*',
                  'src/css/**/*.css',
              ],
              tasks: ['static-build-deploy']
          },
          pluginsSource: {
              files: [
                  'plugins/**/*.*'
              ],
              tasks: ['plugins-build-deploy']
          }
      }
    });
    //监听文件变更时间
    grunt.event.on('watch', function(action, filepath, target) {
        //source: src\html\views\PassagewaySet.html has changed
        if(filepath.lastIndexOf('\.html') != -1 ){
            if(filepath.lastIndexOf('\\template\\') == -1) {
                var jsFilePath = filepath.replace('src\\html', 'src\\js').replace('\.html', '\.js');
                if (!grunt.file.exists(jsFilePath)) {
                    var fileName = filepath.substring(filepath.lastIndexOf("\\") + 1);
                    grunt.file.write(jsFilePath,
                        grunt.template.process(grunt.file.read(jsRoot+'template/blankTemplate.js'), {
                            data: {
                                pageName: fileName
                            }
                        })
                    );
                }
            } else {
                //
                var fileName = filepath.substring(filepath.lastIndexOf("\\") + 1).replace("\.html","");
                var cssDir = "src/css/" + buildDir;
                if (!grunt.file.exists(cssDir)) {
                    grunt.file.mkdir(cssDir);
                }
                //
                var jsDir = jsRoot + buildDir;
                if (!grunt.file.exists(jsDir)) {
                    grunt.file.mkdir(jsDir);
                    grunt.file.write(jsDir+"/main.js",
                        grunt.template.process(grunt.file.read(jsRoot+'template/mainTemplate.js'), {
                            data: {
                            }
                        })
                    );
                }
                //
                var htmlDir = "src/html/" + buildDir +"/mods";
                if (!grunt.file.exists(htmlDir)) {
                    grunt.file.mkdir(htmlDir);
                }
            }
        }
    });

    //---->begin 注册Grunt插件
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    //>---->end

    //---->begin 编排JS构建任务
    var buildTasks = ['concat:javascript',"copy:javascript"];
    buildTasks.push("htmlbuild:" + build.templateName,"copy:deployAll");
    grunt.registerTask('js-build-deploy',buildTasks);
    //>----->end

    //---->begin 编排css构建任务
    buildTasks = ["copy:static"];
    buildTasks.push("concat:css");
    if(build.mode == 'pro'){//如果是生产环境则需要进行cssconcat,cssmin优化
        buildTasks.push('cssmin:css');
    }
    buildTasks.push("htmlbuild:" + build.templateName,"copy:deployAll");
    grunt.registerTask('static-build-deploy',buildTasks);
    //>----->end

    //---->begin 导入插件
    buildTasks.push("copy:deployPlugins");
    grunt.registerTask('plugins-build-deploy',buildTasks);
    //>----->end


    //默认任务
    grunt.registerTask('default','watch:' + (build.defaultTask == 'js-build-deploy' ? 'javascriptSource' : 'staticSource'));
    grunt.log.ok("版 本 号:" + pkg.version);
    grunt.log.ok("编译模式:" + build.mode);
    grunt.log.ok("部署路径:" + build.deployDir);
    grunt.log.ok("编译模版:" + build.templateName);
    grunt.log.ok("监控任务:" + build.defaultTask);
}
