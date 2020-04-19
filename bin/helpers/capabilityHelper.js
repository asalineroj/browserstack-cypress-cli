const logger = require("./logger"),
  Constants = require('./constants'),
  glob = require("glob");

const caps = (bsConfig, zip) => {
  return new Promise(function (resolve, reject) {
    let user = bsConfig.auth.username
    let password =  bsConfig.auth.access_key

    if (!user || !password) reject(Constants.validationMessages.INCORRECT_AUTH_PARAMS);

    var obj = new Object();

    // Browser list
    let osBrowserArray = [];
    bsConfig.browsers.forEach(element => {
      osBrowser = element.os + "-" + element.browser
      element.versions.forEach(version => {
        osBrowserArray.push(osBrowser + version);
      });
    });
    obj.devices = osBrowserArray
    if (obj.devices.length == 0) reject(Constants.validationMessages.EMPTY_BROWSER_LIST);
    logger.log(`Browser list: ${osBrowserArray.toString()}`);

    // Test suite
    obj.test_suite = zip.zip_url.split("://")[1]
    if (!obj.test_suite || 0 === obj.test_suite.length) reject("Test suite is empty");
    logger.log(`Test suite: bs://${obj.test_suite}`);

    // Local
    obj.local = false;
    if (bsConfig.connection_settings.local === true) obj.local = true;
    logger.log(`Local is set to: ${obj.local}`);

    // Project name
    obj.project = bsConfig.run_settings.project
    if (!obj.project) logger.log(`Project name is: ${obj.project}`);

    // Base url
    obj.base_url = bsConfig.run_settings.baseUrl
    if (obj.base_url) logger.log(`Base url is : ${obj.base_url}`);

    // Build name
    obj.customBuildName = bsConfig.run_settings.customBuildName
    if (obj.customBuildName) logger.log(`Build name is: ${obj.customBuildName}`);

    //callback url
    obj.callbackURL = bsConfig.run_settings.callback_url
    if (obj.callbackURL) logger.log(`callback url is : ${obj.callbackURL}`);

    //projectNotifyURL
    obj.projectNotifyURL = bsConfig.run_settings.project_notify_URL
    if (obj.projectNotifyURL) logger.log(`Project notify URL is: ${obj.projectNotifyURL}`);

    var data = JSON.stringify(obj);
    resolve(data);
  })
}

const validate = (bsConfig) => {
  return new Promise(function(resolve, reject){
    if (!bsConfig) reject(Constants.validationMessages.EMPTY_BROWSERSTACK_JSON);

    if (!bsConfig.auth) reject(Constants.validationMessages.INCORRECT_AUTH_PARAMS);

    if (!bsConfig.browsers || bsConfig.browsers.length === 0) reject(Constants.validationMessages.EMPTY_BROWSER_LIST);

    if (!bsConfig.run_settings) reject(Constants.validationMessages.EMPTY_RUN_SETTINGS);

    if(!bsConfig.run_settings.cypress_proj_dir) reject(Constants.validationMessages.EMPTY_SPEC_FILES);

    if(invalidFiles(bsConfig.run_settings.cypress_proj_dir)) reject(Constants.validationMessages.INVALID_EXTENSION);

    resolve(Constants.validationMessages.VALIDATED);
  });
}

const invalidFiles = (testFolder)=> {
  var options = {
    dot: true
  }
  files  = glob.sync(testFolder + "/**/*", options)
  var invalidFiles = []
  files.forEach(file => {
    if(isHiddenPath(file) || invalidExtension(file)){
      invalidFiles.push(file)
    }
  });

  if(invalidFiles.length > 0) {
    logger.log("These files are not valid: " + invalidFiles.toString())
    return true
  } else {
    return false
  }
}

var isHiddenPath = (path) => {
  return (/(^|\/)\.[^\/\.]/g).test(path);
};

var invalidExtension = (file) => {
  let ext = file.split('.').pop();
  if (isFile(file) && !["js", "json", "txt"].includes(ext)) {
    return true;
  }

  return false;
}

var isFile = (path) => {
  return path.split('/').pop().indexOf('.') > -1;
}

module.exports = {
  caps,
  validate
}
