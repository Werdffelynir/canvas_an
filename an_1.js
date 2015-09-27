
/*
var an = new An({
    id:'container',
    width:600,
    height:400,
    isClear:true,
    isSave:false,
    isRestore:false,
    isSorted:true,
    ftp:60
});

 */
//id,width,height,isClear,isSave,isRestore,isSorted,ftp
function An(obj) {
    //'use strict';
    if(!(this instanceof An)) return new An(obj);
    if(!(typeof obj == 'object') || !obj.id) {
        console.error('Wrong options!');
        return;
    }

    var canvas = document.getElementById(obj.id);
    canvas.width = obj.width || 600;
    canvas.height = obj.height || 400;
    var ctx = canvas.getContext('2d');

    if(!(ctx instanceof CanvasRenderingContext2D)){
        console.error(obj.id + ' is not canvas. Error get CanvasRenderingContext2D!');
        return;
    }

    var tm,
        an = {};

    an.ctx = ctx;
    an.canvas = canvas;
    an.width = canvas.width;
    an.height = canvas.height;
    an.ftp = obj.ftp || false;
    an.isClear = obj.isClear || true;
    an.isSave = obj.isSave || false;
    an.isRestore = obj.isRestore || false;
    an.isSorted = obj.isSorted || true;
    an.global = {};
    an.drawStack = [];

    an.render = function(){
        if(an.ftp) tm = setInterval(an.update ,1000/an.ftp);
        else an.update();
    };
    /*
     an.draw = function(obj){
     this.drawStack.push(obj);
     };*/

    /**
     *
     * @param width
     * @param height
     * @param func
     * @returns {HTMLCanvasElement}
     */
    an.shape = function(width, height, func){
        var c = document.createElement('canvas');
        c.width = width || 100;
        c.height = height || 100;
        var _ctx = c.getContext("2d");
        func.call(func, _ctx);
        return _ctx.canvas;
    };

    /**
     * Create new frame end draw inside source
     * @param source
     * @param x
     * @param y
     * @param dWidth
     * @param dHeight
     */
    an.draw = function(source, x, y, dWidth, dHeight) {
        x = x || 0;
        y = y || 0;
        dWidth = dWidth || source.width;
        dHeight = dHeight || source.height;

        an.frame({run:function(ctx){
            ctx.drawImage(source, x, y, dWidth, dHeight);
        }});
    };

    /**
     * Рисует прямоугольник с закругленными углами
     * в позиции (x, y), c высотойи ширеной (w, h) и радиусом (r)
     * @param x
     * @param y
     * @param w
     * @param h
     * @param r
     */
    an.roundRect = function(x, y, w, h, r){
        ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y, x+w, y+h, r);
        ctx.arcTo(x+w, y+h, x, y+h, r);
        ctx.arcTo(x, y+h, x, y, r);
        ctx.arcTo(x, y, x+w, y, r);
    };

    an.clear = function(){
        ctx.clearRect(0,0,an.width,an.height);
    };

    an.clearShadow = function(){
        An.u.clearShadow(ctx);
    };
    

    an.frameCurrent = 0;
    an.frames = [];

    /**
     * Create new frame.
     * @param obj
     * @returns {*}
     */
    an.frame = function(obj){
        if(an.frameByName(obj.name) === false){
            obj = an.mergeSceneProperty(obj);
            an.frames.push(obj);
            return obj;
        }
        return false;
    };
    an.mergeSceneProperty = function(prop){
        var dp = {deep:100, delay:0, expire:0, visibly:true, name:'farme_'+an.frames.length};
        for(var key in dp){
            if(prop[key] === undefined) prop[key] = dp[key];
        }
        return prop;
    };
    an.frameByName = function (name){
        for(var i=0; i<an.frames.length; i++){
            if(an.frames[i].name !== undefined && an.frames[i].name === name) {
                return an.frames[i];
            }
        }
        return false;
    };
    an.sortByDeeps = function(){
        an.frames.sort(function(a, b){
            return (a.deep > b.deep) ? 1 : -1;
        });
    };
    an.update = function(){
        an.frameCurrent ++;
        if(an.isClear) an.clear();
        if(an.isSorted) an.sortByDeeps();
        for(var i=0; i < an.frames.length; i++)
        {
            if(typeof an.frames[i].run == 'function' && an.frameCurrent > an.frames[i].delay)
            {
                if(an.frames[i].expire != 0 && an.frames[i].expire < an.frameCurrent) continue;

                if(an.isSave) ctx.save();
                an.frames[i].run.call(an.frames[i], ctx);
                if(an.isRestore) ctx.restore();
            }
        }
    };

    return an;
}



An.u = {

    cloneObject: function (obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        var temp = obj.constructor(); // give temp the original obj's constructor
        for (var key in obj)
            temp[key] = An.u.cloneObject(obj[key]);
        return temp;
    },

    randomColor: function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    rand: function(min,max){
        return Math.floor(Math.random() * max) + min;
    },

    randomNumber: function(min,max){
        min = min||0;
        max = max||100;
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    degreesToRadians: function(deg){
        return (deg * Math.PI) / 180;
    },

    radiansToDegrees: function(rad){
        return (rad * 180) / Math.PI;
    },
    
    clearShadow: function(context){
        context.shadowOffsetX = context.shadowOffsetY = context.shadowBlur = 0;
    },

    /**
     * @param event
     * @param element
     * @returns {{x: number, y: number}}
     */
    getCoordinates: function (event, element){
        var x = event.pageX - element.offsetLeft;
        var y = event.pageY - element.offsetTop;
        return {x:x,y:y};
    },


    getMousetCoordinates: function (canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
}
};


