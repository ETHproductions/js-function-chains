# js-function-chains
A really hacky half-baked method of creating function chains in JavaScript ES6.

### How to use
Currently the code is only set up for use in the browser console. You'll need a modern browser, one that supports [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) anyway.

To use the basic code, paste the first function (the first 27 lines) into the console. This will create a function `makeFunctional()`. To make a function "chainable", simply wrap the `function(){}` (or `(x,y,z)=>{}`) with this function, like so:

    var plus1 = makeFunctional(function (n) { return n + 1; });
    var times2 = makeFunctional(n => n * 2);
    
    console.log(plus1(5));  //  6
    console.log(times2(5)); // 10

To create a chain of these functions, simply enter them in the desired order, separated by periods:

    var plus2 = plus1 . plus1;
    var times8 = times2 . times2 . times2;
    var times4plus3 = times2 . plus1 . times2 . plus1;
    
    console.log(plus2(5));       //  7
    console.log(times8(5));      // 40
    console.log(times4plus3(5)); // 23

This works if you just want to call each function in the chain (except the first) with 1 input, but what about functions with 2 or more inputs? At the moment, you can place `._(args)` after a function to call the function with secondary arguments. For example:

    var plus = makeFunctional((x, y) => x + y);
    var times = makeFunctional((x, y) => x * y);
    
    var times3minus1 = times._(3) . plus._(-1);
    console.log(times3minus1(5)); // 14

Note that chainable functions can only access variables from the scope that `makeFunctional` was declared in. For example, this won't work:

    var makeFunctional = function(func) { ... };
    var plus1 = makeFunctional(x => x + 1);
    var test = function(x) {
      var times2 = makeFunctional(z => z * 2);
      return x . times2;
    };
    console.log(test(plus1)); // undefined, because makeFunctional can't access times2 and plus1 has no times2 property

#### What's the rest of the code for?
It's only for the most daring of JS coders. Lines 63-66 map all global functions through `makeFunctional`. This allows you to do e.g.

    var myFunc = prompt . Number . plus1 . alert;
    myFunc("Enter a number:");

The other part takes all *prototype* functions and turns those into global functions. Combined with the above, this allows you to chain prototype functions just like regular ones:

    var myFunc = split._(" ") . reverse . join._(" ") . toUpperCase;
    myFunc("Hello, JavaScript world!"); // "WORLD! JAVASCRIPT HELLO,"

Note that this code only works once per environment, though of course you can manually map new functions through `makeFunctional`. In the future I hope to find a way to automatically make any new functions created functional.
