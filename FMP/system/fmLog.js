var fmTime = require('./fmTime');
function fmLog(data) {
    fmTime(console.log,data);
}

module.exports = fmLog;