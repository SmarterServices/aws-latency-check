var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    request = require('request'),
    async = require('async'),
    _ = require('lodash');


executeRequest = function(endpoint, callback){
    var options = {
        url: endpoint,
        time: true,
        timeout : this.http_timeout
    };
    request(options, function(error, response, body){
        var retObj = {
            status_code: null,
            latency : null
        };
        if(!error){
            retObj.status_code = response.statusCode;
            retObj.latency = response.elapsedTime;
        }
        callback(null, retObj);
    });
};

function LatencyCheck(regions, opts){
    if(!_.isObject(opts)){
        opts = {};
    }

    this.regions = regions;
    this.http_timeout = opts.timeout || 4000;

    return this;
}

util.inherits(LatencyCheck, EventEmitter);

LatencyCheck.prototype.begin = function(){

    var retArr = [];
    var _this = this;

    async.forEachOfSeries(this.regions, function(endpoint, region, callback) {
        // perform the actual request now...
        executeRequest('http://' + endpoint + '/ping', function(err, results){
            var region_info = {
                region: region,
                latency: null
            };

            if(!err && results.status_code === 200){
                region_info.latency = results.latency;
            }

            retArr.push(region_info);
            _this.emit('region_complete', Math.round((retArr.length / _.size(_this.regions))*100), region_info);

            callback(null);
        });
    }, function(err){
        if( err ) {
            _this.emit('error', err);
        } else {
            retArr = _.orderBy(retArr, ['latency'], ['asc']);
            _this.emit('check_complete', retArr);
        }
    });
};

module.exports = LatencyCheck;