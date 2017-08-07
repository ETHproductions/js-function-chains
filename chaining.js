// The basic code
var makeFunctional = function(func) {
    return new Proxy (func, {
        get: function (target, name) {
            if (name === "_") {
                return function(...args) {
                    return makeFunctional(function(x) {
                        return target(x, ...args);
                    });
                };
            }
            if (!/^(?!\d)[\w$]+$/.test(name))
                return target[name];
            var existing;
            try {
                existing = eval(name);
            } catch (e) { }
            if (typeof existing === "function" && !target.__proto__.hasOwnProperty(name))
                return makeFunctional((function(func, existing) {
                    return function(x, ...args) {
                        return existing(func(x), ...args);
                    };
                })(func, existing));
            return target[name];
        }
    });
};

// Extra code to apply makeFunctional() to existing functions
for (var key of Object.getOwnPropertyNames(window)) {
    if (!/Storage$|^Window$|^Object$/.test(key) && window[key] !== window && window[key] != null) {
        
        // Make existing prototype functions global
        if (window[key].hasOwnProperty("prototype")) {
            for (var key2 of Object.getOwnPropertyNames(window[key].prototype)) if (!/^__|constructor|propertyIsEnumerable/.test(key2)) try {
                var func = window[key].prototype[key2];
                if (typeof func === "function") {
                    if (typeof window[key2] === "undefined") {
                        window[key2] = makeFunctional(
                            (function(key) {
                                return function(obj, ...args) {
                                    throw new TypeError(key + "() has no behavior for type " + obj.constructor.name);
                                };
                            })(key2)
                        );
                    }
                    if (typeof window[key2] === "function") {
                        window[key2] = makeFunctional(
                            (function(key, func, proto, original) {
                                return function(obj, ...args) {
                                    for (var i = 100, q = obj; i-- && q; q = q.__proto__)
                                        if (q.constructor === proto)
                                            return func.apply(obj, args);
                                    return original(obj, ...args);
                                };
                            })(key, func, window[key], window[key2])
                        );
                    }
                }
            } catch (e) { }
        }
        
        // Map existing functions through makeFunctional()
        if (typeof window[key] === "function") {
            window[key] = makeFunctional(window[key]);
        }
    }
}
