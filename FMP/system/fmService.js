var log = require('../system/fmLog');
var car  = require('../system/fmCar');
var HashMap = require('hashmap');
var ArrayList = require('arraylist');

function fmService(x,y,p,address){
    //geo x , geo y , service radius
    this.carsHash = new HashMap();
    this.x = x;
    this.y = y;
    this.p = p;
    this.address = address;
}

fmService.prototype.processCar = function (requester) {
    var tempID = requester.id.toUpperCase();
    var t;
    if (t = this.carsHash.get(tempID)){
        log(tempID + " updating");
        t.set(requester.x,requester.y);
    }
    else{
        log(tempID + " creating");
        this.carsHash.set(tempID,new car(tempID,requester.x,requester.y))
    }
};

fmService.prototype.getCars = function (id) {
    var res = new ArrayList();
    var temp;
    this.carsHash.forEach(function (c,i) {
        if ((temp = c.get()).id !== id)
            res.add(temp);
        //res.add(c.id,)
    });
    return res;
};


module.exports = fmService;
