(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UIL = {}));
}(this, (function (exports) { 'use strict';

	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	var runtime = function (exports) {

		var Op = Object.prototype;
		var hasOwn = Op.hasOwnProperty;
		var undefined$1; // More compressible than void 0.

		var $Symbol = typeof Symbol === "function" ? Symbol : {};
		var iteratorSymbol = $Symbol.iterator || "@@iterator";
		var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
		var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

		function define(obj, key, value) {
			Object.defineProperty(obj, key, {
				value: value,
				enumerable: true,
				configurable: true,
				writable: true
			});
			return obj[key];
		}

		try {
			// IE 8 has a broken Object.defineProperty that only works on DOM objects.
			define({}, "");
		} catch (err) {
			define = function define(obj, key, value) {
				return obj[key] = value;
			};
		}

		function wrap(innerFn, outerFn, self, tryLocsList) {
			// If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
			var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
			var generator = Object.create(protoGenerator.prototype);
			var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
			// .throw, and .return methods.

			generator._invoke = makeInvokeMethod(innerFn, self, context);
			return generator;
		}

		exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
		// record like context.tryEntries[i].completion. This interface could
		// have been (and was previously) designed to take a closure to be
		// invoked without arguments, but in all the cases we care about we
		// already have an existing method we want to call, so there's no need
		// to create a new function object. We can even get away with assuming
		// the method takes exactly one argument, since that happens to be true
		// in every case, so we don't have to touch the arguments object. The
		// only additional allocation required is the completion record, which
		// has a stable shape and so hopefully should be cheap to allocate.

		function tryCatch(fn, obj, arg) {
			try {
				return {
					type: "normal",
					arg: fn.call(obj, arg)
				};
			} catch (err) {
				return {
					type: "throw",
					arg: err
				};
			}
		}

		var GenStateSuspendedStart = "suspendedStart";
		var GenStateSuspendedYield = "suspendedYield";
		var GenStateExecuting = "executing";
		var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
		// breaking out of the dispatch switch statement.

		var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
		// .constructor.prototype properties for functions that return Generator
		// objects. For full spec compliance, you may wish to configure your
		// minifier not to mangle the names of these two functions.

		function Generator() {}

		function GeneratorFunction() {}

		function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
		// don't natively support it.


		var IteratorPrototype = {};

		IteratorPrototype[iteratorSymbol] = function () {
			return this;
		};

		var getProto = Object.getPrototypeOf;
		var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

		if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
			// This environment has a native %IteratorPrototype%; use it instead
			// of the polyfill.
			IteratorPrototype = NativeIteratorPrototype;
		}

		var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
		GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
		GeneratorFunctionPrototype.constructor = GeneratorFunction;
		GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
		// Iterator interface in terms of a single ._invoke method.

		function defineIteratorMethods(prototype) {
			["next", "throw", "return"].forEach(function (method) {
				define(prototype, method, function (arg) {
					return this._invoke(method, arg);
				});
			});
		}

		exports.isGeneratorFunction = function (genFun) {
			var ctor = typeof genFun === "function" && genFun.constructor;
			return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
			// do is to check its .name property.
			(ctor.displayName || ctor.name) === "GeneratorFunction" : false;
		};

		exports.mark = function (genFun) {
			if (Object.setPrototypeOf) {
				Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
			} else {
				genFun.__proto__ = GeneratorFunctionPrototype;
				define(genFun, toStringTagSymbol, "GeneratorFunction");
			}

			genFun.prototype = Object.create(Gp);
			return genFun;
		}; // Within the body of any async function, `await x` is transformed to
		// `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
		// `hasOwn.call(value, "__await")` to determine if the yielded value is
		// meant to be awaited.


		exports.awrap = function (arg) {
			return {
				__await: arg
			};
		};

		function AsyncIterator(generator, PromiseImpl) {
			function invoke(method, arg, resolve, reject) {
				var record = tryCatch(generator[method], generator, arg);

				if (record.type === "throw") {
					reject(record.arg);
				} else {
					var result = record.arg;
					var value = result.value;

					if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
						return PromiseImpl.resolve(value.__await).then(function (value) {
							invoke("next", value, resolve, reject);
						}, function (err) {
							invoke("throw", err, resolve, reject);
						});
					}

					return PromiseImpl.resolve(value).then(function (unwrapped) {
						// When a yielded Promise is resolved, its final value becomes
						// the .value of the Promise<{value,done}> result for the
						// current iteration.
						result.value = unwrapped;
						resolve(result);
					}, function (error) {
						// If a rejected Promise was yielded, throw the rejection back
						// into the async generator function so it can be handled there.
						return invoke("throw", error, resolve, reject);
					});
				}
			}

			var previousPromise;

			function enqueue(method, arg) {
				function callInvokeWithMethodAndArg() {
					return new PromiseImpl(function (resolve, reject) {
						invoke(method, arg, resolve, reject);
					});
				}

				return previousPromise = // If enqueue has been called before, then we want to wait until
				// all previous Promises have been resolved before calling invoke,
				// so that results are always delivered in the correct order. If
				// enqueue has not been called before, then it is important to
				// call invoke immediately, without waiting on a callback to fire,
				// so that the async generator function has the opportunity to do
				// any necessary setup in a predictable way. This predictability
				// is why the Promise constructor synchronously invokes its
				// executor callback, and why async functions synchronously
				// execute code before the first await. Since we implement simple
				// async functions in terms of async generators, it is especially
				// important to get this right, even though it requires care.
				previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
				// invocations of the iterator.
				callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
			} // Define the unified helper method that is used to implement .next,
			// .throw, and .return (see defineIteratorMethods).


			this._invoke = enqueue;
		}

		defineIteratorMethods(AsyncIterator.prototype);

		AsyncIterator.prototype[asyncIteratorSymbol] = function () {
			return this;
		};

		exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
		// AsyncIterator objects; they just return a Promise for the value of
		// the final result produced by the iterator.

		exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
			if (PromiseImpl === void 0) PromiseImpl = Promise;
			var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
			return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
			: iter.next().then(function (result) {
				return result.done ? result.value : iter.next();
			});
		};

		function makeInvokeMethod(innerFn, self, context) {
			var state = GenStateSuspendedStart;
			return function invoke(method, arg) {
				if (state === GenStateExecuting) {
					throw new Error("Generator is already running");
				}

				if (state === GenStateCompleted) {
					if (method === "throw") {
						throw arg;
					} // Be forgiving, per 25.3.3.3.3 of the spec:
					// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


					return doneResult();
				}

				context.method = method;
				context.arg = arg;

				while (true) {
					var delegate = context.delegate;

					if (delegate) {
						var delegateResult = maybeInvokeDelegate(delegate, context);

						if (delegateResult) {
							if (delegateResult === ContinueSentinel) continue;
							return delegateResult;
						}
					}

					if (context.method === "next") {
						// Setting context._sent for legacy support of Babel's
						// function.sent implementation.
						context.sent = context._sent = context.arg;
					} else if (context.method === "throw") {
						if (state === GenStateSuspendedStart) {
							state = GenStateCompleted;
							throw context.arg;
						}

						context.dispatchException(context.arg);
					} else if (context.method === "return") {
						context.abrupt("return", context.arg);
					}

					state = GenStateExecuting;
					var record = tryCatch(innerFn, self, context);

					if (record.type === "normal") {
						// If an exception is thrown from innerFn, we leave state ===
						// GenStateExecuting and loop back for another invocation.
						state = context.done ? GenStateCompleted : GenStateSuspendedYield;

						if (record.arg === ContinueSentinel) {
							continue;
						}

						return {
							value: record.arg,
							done: context.done
						};
					} else if (record.type === "throw") {
						state = GenStateCompleted; // Dispatch the exception by looping back around to the
						// context.dispatchException(context.arg) call above.

						context.method = "throw";
						context.arg = record.arg;
					}
				}
			};
		} // Call delegate.iterator[context.method](context.arg) and handle the
		// result, either by returning a { value, done } result from the
		// delegate iterator, or by modifying context.method and context.arg,
		// setting context.delegate to null, and returning the ContinueSentinel.


		function maybeInvokeDelegate(delegate, context) {
			var method = delegate.iterator[context.method];

			if (method === undefined$1) {
				// A .throw or .return when the delegate iterator has no .throw
				// method always terminates the yield* loop.
				context.delegate = null;

				if (context.method === "throw") {
					// Note: ["return"] must be used for ES3 parsing compatibility.
					if (delegate.iterator["return"]) {
						// If the delegate iterator has a return method, give it a
						// chance to clean up.
						context.method = "return";
						context.arg = undefined$1;
						maybeInvokeDelegate(delegate, context);

						if (context.method === "throw") {
							// If maybeInvokeDelegate(context) changed context.method from
							// "return" to "throw", let that override the TypeError below.
							return ContinueSentinel;
						}
					}

					context.method = "throw";
					context.arg = new TypeError("The iterator does not provide a 'throw' method");
				}

				return ContinueSentinel;
			}

			var record = tryCatch(method, delegate.iterator, context.arg);

			if (record.type === "throw") {
				context.method = "throw";
				context.arg = record.arg;
				context.delegate = null;
				return ContinueSentinel;
			}

			var info = record.arg;

			if (!info) {
				context.method = "throw";
				context.arg = new TypeError("iterator result is not an object");
				context.delegate = null;
				return ContinueSentinel;
			}

			if (info.done) {
				// Assign the result of the finished delegate to the temporary
				// variable specified by delegate.resultName (see delegateYield).
				context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

				context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
				// exception, let the outer generator proceed normally. If
				// context.method was "next", forget context.arg since it has been
				// "consumed" by the delegate iterator. If context.method was
				// "return", allow the original .return call to continue in the
				// outer generator.

				if (context.method !== "return") {
					context.method = "next";
					context.arg = undefined$1;
				}
			} else {
				// Re-yield the result returned by the delegate method.
				return info;
			} // The delegate iterator is finished, so forget it and continue with
			// the outer generator.


			context.delegate = null;
			return ContinueSentinel;
		} // Define Generator.prototype.{next,throw,return} in terms of the
		// unified ._invoke helper method.


		defineIteratorMethods(Gp);
		define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
		// @@iterator function is called on it. Some browsers' implementations of the
		// iterator prototype chain incorrectly implement this, causing the Generator
		// object to not be returned from this call. This ensures that doesn't happen.
		// See https://github.com/facebook/regenerator/issues/274 for more details.

		Gp[iteratorSymbol] = function () {
			return this;
		};

		Gp.toString = function () {
			return "[object Generator]";
		};

		function pushTryEntry(locs) {
			var entry = {
				tryLoc: locs[0]
			};

			if (1 in locs) {
				entry.catchLoc = locs[1];
			}

			if (2 in locs) {
				entry.finallyLoc = locs[2];
				entry.afterLoc = locs[3];
			}

			this.tryEntries.push(entry);
		}

		function resetTryEntry(entry) {
			var record = entry.completion || {};
			record.type = "normal";
			delete record.arg;
			entry.completion = record;
		}

		function Context(tryLocsList) {
			// The root entry object (effectively a try statement without a catch
			// or a finally block) gives us a place to store values thrown from
			// locations where there is no enclosing try statement.
			this.tryEntries = [{
				tryLoc: "root"
			}];
			tryLocsList.forEach(pushTryEntry, this);
			this.reset(true);
		}

		exports.keys = function (object) {
			var keys = [];

			for (var key in object) {
				keys.push(key);
			}

			keys.reverse(); // Rather than returning an object with a next method, we keep
			// things simple and return the next function itself.

			return function next() {
				while (keys.length) {
					var key = keys.pop();

					if (key in object) {
						next.value = key;
						next.done = false;
						return next;
					}
				} // To avoid creating an additional object, we just hang the .value
				// and .done properties off the next function object itself. This
				// also ensures that the minifier will not anonymize the function.


				next.done = true;
				return next;
			};
		};

		function values(iterable) {
			if (iterable) {
				var iteratorMethod = iterable[iteratorSymbol];

				if (iteratorMethod) {
					return iteratorMethod.call(iterable);
				}

				if (typeof iterable.next === "function") {
					return iterable;
				}

				if (!isNaN(iterable.length)) {
					var i = -1,
							next = function next() {
						while (++i < iterable.length) {
							if (hasOwn.call(iterable, i)) {
								next.value = iterable[i];
								next.done = false;
								return next;
							}
						}

						next.value = undefined$1;
						next.done = true;
						return next;
					};

					return next.next = next;
				}
			} // Return an iterator with no values.


			return {
				next: doneResult
			};
		}

		exports.values = values;

		function doneResult() {
			return {
				value: undefined$1,
				done: true
			};
		}

		Context.prototype = {
			constructor: Context,
			reset: function reset(skipTempReset) {
				this.prev = 0;
				this.next = 0; // Resetting context._sent for legacy support of Babel's
				// function.sent implementation.

				this.sent = this._sent = undefined$1;
				this.done = false;
				this.delegate = null;
				this.method = "next";
				this.arg = undefined$1;
				this.tryEntries.forEach(resetTryEntry);

				if (!skipTempReset) {
					for (var name in this) {
						// Not sure about the optimal order of these conditions:
						if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
							this[name] = undefined$1;
						}
					}
				}
			},
			stop: function stop() {
				this.done = true;
				var rootEntry = this.tryEntries[0];
				var rootRecord = rootEntry.completion;

				if (rootRecord.type === "throw") {
					throw rootRecord.arg;
				}

				return this.rval;
			},
			dispatchException: function dispatchException(exception) {
				if (this.done) {
					throw exception;
				}

				var context = this;

				function handle(loc, caught) {
					record.type = "throw";
					record.arg = exception;
					context.next = loc;

					if (caught) {
						// If the dispatched exception was caught by a catch block,
						// then let that catch block handle the exception normally.
						context.method = "next";
						context.arg = undefined$1;
					}

					return !!caught;
				}

				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];
					var record = entry.completion;

					if (entry.tryLoc === "root") {
						// Exception thrown outside of any try block that could handle
						// it, so set the completion value of the entire function to
						// throw the exception.
						return handle("end");
					}

					if (entry.tryLoc <= this.prev) {
						var hasCatch = hasOwn.call(entry, "catchLoc");
						var hasFinally = hasOwn.call(entry, "finallyLoc");

						if (hasCatch && hasFinally) {
							if (this.prev < entry.catchLoc) {
								return handle(entry.catchLoc, true);
							} else if (this.prev < entry.finallyLoc) {
								return handle(entry.finallyLoc);
							}
						} else if (hasCatch) {
							if (this.prev < entry.catchLoc) {
								return handle(entry.catchLoc, true);
							}
						} else if (hasFinally) {
							if (this.prev < entry.finallyLoc) {
								return handle(entry.finallyLoc);
							}
						} else {
							throw new Error("try statement without catch or finally");
						}
					}
				}
			},
			abrupt: function abrupt(type, arg) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];

					if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
						var finallyEntry = entry;
						break;
					}
				}

				if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
					// Ignore the finally entry if control is not jumping to a
					// location outside the try/catch block.
					finallyEntry = null;
				}

				var record = finallyEntry ? finallyEntry.completion : {};
				record.type = type;
				record.arg = arg;

				if (finallyEntry) {
					this.method = "next";
					this.next = finallyEntry.finallyLoc;
					return ContinueSentinel;
				}

				return this.complete(record);
			},
			complete: function complete(record, afterLoc) {
				if (record.type === "throw") {
					throw record.arg;
				}

				if (record.type === "break" || record.type === "continue") {
					this.next = record.arg;
				} else if (record.type === "return") {
					this.rval = this.arg = record.arg;
					this.method = "return";
					this.next = "end";
				} else if (record.type === "normal" && afterLoc) {
					this.next = afterLoc;
				}

				return ContinueSentinel;
			},
			finish: function finish(finallyLoc) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];

					if (entry.finallyLoc === finallyLoc) {
						this.complete(entry.completion, entry.afterLoc);
						resetTryEntry(entry);
						return ContinueSentinel;
					}
				}
			},
			"catch": function _catch(tryLoc) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];

					if (entry.tryLoc === tryLoc) {
						var record = entry.completion;

						if (record.type === "throw") {
							var thrown = record.arg;
							resetTryEntry(entry);
						}

						return thrown;
					}
				} // The context.catch method must only be called with a location
				// argument that corresponds to a known catch block.


				throw new Error("illegal catch attempt");
			},
			delegateYield: function delegateYield(iterable, resultName, nextLoc) {
				this.delegate = {
					iterator: values(iterable),
					resultName: resultName,
					nextLoc: nextLoc
				};

				if (this.method === "next") {
					// Deliberately forget the last sent value so that we don't
					// accidentally pass it on to the delegate.
					this.arg = undefined$1;
				}

				return ContinueSentinel;
			}
		}; // Regardless of whether this script is executing as a CommonJS module
		// or not, return the runtime object so that we can declare the variable
		// regeneratorRuntime in the outer scope, which allows this module to be
		// injected easily by `bin/regenerator --include-runtime script.js`.

		return exports;
	}( // If this script is executing as a CommonJS module, use module.exports
	// as the regeneratorRuntime namespace. Otherwise create a new empty
	// object. Either way, the resulting object will be used to initialize
	// the regeneratorRuntime variable at the top of this file.
	typeof module === "object" ? module.exports : {});

	try {
		regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
		// This module should not be running in strict mode, so the above
		// assignment should always work unless something is misconfigured. Just
		// in case runtime.js accidentally runs in strict mode, we can escape
		// strict mode using a global Function call. This could conceivably fail
		// if a Content Security Policy forbids using Function, but in that case
		// the proper solution is to fix the accidental strict mode problem. If
		// you've misconfigured your bundler to force strict mode and applied a
		// CSP to forbid Function, and you're not willing to fix either of those
		// problems, please detail your unique predicament in a GitHub issue.
		Function("r", "regeneratorRuntime = r")(runtime);
	}

	/**
	 * @author lth / https://github.com/lo-th
	 */
	var T = {
		frag: document.createDocumentFragment(),
		colorRing: null,
		joystick_0: null,
		joystick_1: null,
		circular: null,
		knob: null,
		svgns: "http://www.w3.org/2000/svg",
		links: "http://www.w3.org/1999/xlink",
		htmls: "http://www.w3.org/1999/xhtml",
		DOM_SIZE: ['height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'],
		SVG_TYPE_D: ['pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient', 'animateMotion', 'use', 'filter', 'feColorMatrix'],
		SVG_TYPE_G: ['svg', 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject'],
		PI: Math.PI,
		TwoPI: Math.PI * 2,
		pi90: Math.PI * 0.5,
		pi60: Math.PI / 3,
		torad: Math.PI / 180,
		todeg: 180 / Math.PI,
		clamp: function clamp(v, min, max) {
			v = v < min ? min : v;
			v = v > max ? max : v;
			return v;
		},
		size: {
			w: 240,
			h: 20,
			p: 30,
			s: 8
		},
		// ----------------------
		//	 COLOR
		// ----------------------
		colors: {
			text: '#dcdcdc',
			textOver: '#FFFFFF',
			txtselectbg: 'none',
			background: 'rgba(50,50,50,0.5)',
			//'rgba(44,44,44,0.3)',
			backgroundOver: 'rgba(50,50,50,0.5)',
			//'rgba(11,11,11,0.5)',
			//input: '#005AAA',
			inputBorder: '#454545',
			inputHolder: '#808080',
			inputBorderSelect: '#005AAA',
			inputBg: 'rgba(0,0,0,0.1)',
			inputOver: 'rgba(0,0,0,0.2)',
			// input border
			border: '#454545',
			borderOver: '#5050AA',
			borderSelect: '#308AFF',
			button: '#3c3c3c',
			//'#404040',
			boolbg: '#181818',
			boolon: '#C0C0C0',
			select: '#308AFF',
			moving: '#03afff',
			down: '#024699',
			over: '#024699',
			action: '#FF3300',
			stroke: 'rgba(11,11,11,0.5)',
			scroll: '#333333',
			scrollback: 'rgba(44,44,44,0.2)',
			scrollbackover: 'rgba(44,44,44,0.2)',
			hide: 'rgba(0,0,0,0)',
			groupBorder: '#3e3e3e',
			//'none',
			buttonBorder: '#4a4a4a',
			//'none',
			fontFamily: 'Tahoma',
			fontShadow: 'none',
			fontSize: 11,
			radius: 4
		},
		// style css
		css: {
			//unselect: '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;', 
			basic: 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; overflow:hidden; ' + '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;',
			button: 'display:flex; justify-content:center; align-items:center; text-align:center;'
			/*txt: T.css.basic + 'font-family:'+ T.colors.fontFamily +'; font-size:'+T.colors.fontSize+'px; color:'+T.colors.text+'; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;',
			txtselect:	T.css.txt + 'display:flex; justify-content:left; align-items:center; text-align:left;' +'padding:2px 5px; border:1px dashed ' + T.colors.border + '; background:'+ T.colors.txtselectbg+';',
			item: T.css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px;',*/

		},
		// svg path
		svgs: {
			group: 'M 7 7 L 7 8 8 8 8 7 7 7 M 5 7 L 5 8 6 8 6 7 5 7 M 3 7 L 3 8 4 8 4 7 3 7 M 7 5 L 7 6 8 6 8 5 7 5 M 6 6 L 6 5 5 5 5 6 6 6 M 7 3 L 7 4 8 4 8 3 7 3 M 6 4 L 6 3 5 3 5 4 6 4 M 3 5 L 3 6 4 6 4 5 3 5 M 3 3 L 3 4 4 4 4 3 3 3 Z',
			arrow: 'M 3 8 L 8 5 3 2 3 8 Z',
			arrowDown: 'M 5 8 L 8 3 2 3 5 8 Z',
			arrowUp: 'M 5 2 L 2 7 8 7 5 2 Z',
			solid: 'M 13 10 L 13 1 4 1 1 4 1 13 10 13 13 10 M 11 3 L 11 9 9 11 3 11 3 5 5 3 11 3 Z',
			body: 'M 13 10 L 13 1 4 1 1 4 1 13 10 13 13 10 M 11 3 L 11 9 9 11 3 11 3 5 5 3 11 3 M 5 4 L 4 5 4 10 9 10 10 9 10 4 5 4 Z',
			vehicle: 'M 13 6 L 11 1 3 1 1 6 1 13 3 13 3 11 11 11 11 13 13 13 13 6 M 2.4 6 L 4 2 10 2 11.6 6 2.4 6 M 12 8 L 12 10 10 10 10 8 12 8 M 4 8 L 4 10 2 10 2 8 4 8 Z',
			articulation: 'M 13 9 L 12 9 9 2 9 1 5 1 5 2 2 9 1 9 1 13 5 13 5 9 4 9 6 5 8 5 10 9 9 9 9 13 13 13 13 9 Z',
			character: 'M 13 4 L 12 3 9 4 5 4 2 3 1 4 5 6 5 8 4 13 6 13 7 9 8 13 10 13 9 8 9 6 13 4 M 6 1 L 6 3 8 3 8 1 6 1 Z',
			terrain: 'M 13 8 L 12 7 Q 9.06 -3.67 5.95 4.85 4.04 3.27 2 7 L 1 8 7 13 13 8 M 3 8 Q 3.78 5.420 5.4 6.6 5.20 7.25 5 8 L 7 8 Q 8.39 -0.16 11 8 L 7 11 3 8 Z',
			joint: 'M 7.7 7.7 Q 8 7.45 8 7 8 6.6 7.7 6.3 7.45 6 7 6 6.6 6 6.3 6.3 6 6.6 6 7 6 7.45 6.3 7.7 6.6 8 7 8 7.45 8 7.7 7.7 M 3.35 8.65 L 1 11 3 13 5.35 10.65 Q 6.1 11 7 11 8.28 11 9.25 10.25 L 7.8 8.8 Q 7.45 9 7 9 6.15 9 5.55 8.4 5 7.85 5 7 5 6.54 5.15 6.15 L 3.7 4.7 Q 3 5.712 3 7 3 7.9 3.35 8.65 M 10.25 9.25 Q 11 8.28 11 7 11 6.1 10.65 5.35 L 13 3 11 1 8.65 3.35 Q 7.9 3 7 3 5.7 3 4.7 3.7 L 6.15 5.15 Q 6.54 5 7 5 7.85 5 8.4 5.55 9 6.15 9 7 9 7.45 8.8 7.8 L 10.25 9.25 Z',
			ray: 'M 9 11 L 5 11 5 12 9 12 9 11 M 12 5 L 11 5 11 9 12 9 12 5 M 11.5 10 Q 10.9 10 10.45 10.45 10 10.9 10 11.5 10 12.2 10.45 12.55 10.9 13 11.5 13 12.2 13 12.55 12.55 13 12.2 13 11.5 13 10.9 12.55 10.45 12.2 10 11.5 10 M 9 10 L 10 9 2 1 1 2 9 10 Z',
			collision: 'M 11 12 L 13 10 10 7 13 4 11 2 7.5 5.5 9 7 7.5 8.5 11 12 M 3 2 L 1 4 4 7 1 10 3 12 8 7 3 2 Z',
			map: 'M 13 1 L 1 1 1 13 13 13 13 1 M 12 2 L 12 7 7 7 7 12 2 12 2 7 7 7 7 2 12 2 Z',
			material: 'M 13 1 L 1 1 1 13 13 13 13 1 M 12 2 L 12 7 7 7 7 12 2 12 2 7 7 7 7 2 12 2 Z',
			texture: 'M 13 4 L 13 1 1 1 1 4 5 4 5 13 9 13 9 4 13 4 Z',
			object: 'M 10 1 L 7 4 4 1 1 1 1 13 4 13 4 5 7 8 10 5 10 13 13 13 13 1 10 1 Z',
			none: 'M 9 5 L 5 5 5 9 9 9 9 5 Z',
			cursor: 'M 4 7 L 1 10 1 12 2 13 4 13 7 10 9 14 14 0 0 5 4 7 Z'
		},
		setStyle: function setStyle(data) {
			for (var o in data) {
				if (T.colors[o]) T.colors[o] = data[o];
			}

			T.setText();
		},
		// ----------------------
		// custom text
		// ----------------------
		setText: function setText(size, color, font, shadow) {
			var c = T.colors;
			if (font !== undefined) c.fontFamily = font;
			if (color !== undefined) c.text = color;
			if (size !== undefined) c.fontSize = size;
			T.css.txt = T.css.basic + 'font-family:' + c.fontFamily + '; font-size:' + c.fontSize + 'px; color:' + c.text + '; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';
			if (shadow !== undefined) T.css.txt += ' text-shadow:' + shadow + '; '; //"1px 1px 1px #ff0000";

			if (c.fontShadow !== 'none') T.css.txt += ' text-shadow: 1px 1px 1px ' + c.fontShadow + ';';
			T.css.txtselect = T.css.txt + 'display:flex; justify-content:left; align-items:center; text-align:left;' + 'padding:2px 5px; border:1px dashed ' + c.border + '; background:' + c.txtselectbg + ';';
			T.css.item = T.css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px;';
		},
		// intern function
		cloneColor: function cloneColor() {
			var cc = Object.assign({}, T.colors);
			return cc;
		},
		cloneCss: function cloneCss() {
			var cc = Object.assign({}, T.css);
			return cc;
		},
		clone: function clone(o) {
			return o.cloneNode(true);
		},
		setSvg: function setSvg(dom, type, value, id, id2) {
			if (id === -1) dom.setAttributeNS(null, type, value);else if (id2 !== undefined) dom.childNodes[id || 0].childNodes[id2 || 0].setAttributeNS(null, type, value);else dom.childNodes[id || 0].setAttributeNS(null, type, value);
		},
		setCss: function setCss(dom, css) {
			for (var r in css) {
				if (T.DOM_SIZE.indexOf(r) !== -1) dom.style[r] = css[r] + 'px';else dom.style[r] = css[r];
			}
		},
		set: function set(g, o) {
			for (var att in o) {
				if (att === 'txt') g.textContent = o[att];
				if (att === 'link') g.setAttributeNS(T.links, 'xlink:href', o[att]);else g.setAttributeNS(null, att, o[att]);
			}
		},
		get: function get(dom, id) {
			if (id === undefined) return dom; // root
			else if (!isNaN(id)) return dom.childNodes[id]; // first child
				else if (id instanceof Array) {
						if (id.length === 2) return dom.childNodes[id[0]].childNodes[id[1]];
						if (id.length === 3) return dom.childNodes[id[0]].childNodes[id[1]].childNodes[id[2]];
					}
		},
		dom: function dom(type, css, obj, _dom, id) {
			type = type || 'div';

			if (T.SVG_TYPE_D.indexOf(type) !== -1 || T.SVG_TYPE_G.indexOf(type) !== -1) {
				// is svg element
				if (type === 'svg') {
					_dom = document.createElementNS(T.svgns, 'svg');
					T.set(_dom, obj);
					/*	} else if ( type === 'use' ) {
									dom = document.createElementNS( T.svgns, 'use' );
								T.set( dom, obj );
					*/
				} else {
					// create new svg if not def
					if (_dom === undefined) _dom = document.createElementNS(T.svgns, 'svg');
					T.addAttributes(_dom, type, obj, id);
				}
			} else {
				// is html element
				if (_dom === undefined) _dom = document.createElementNS(T.htmls, type);else _dom = _dom.appendChild(document.createElementNS(T.htmls, type));
			}

			if (css) _dom.style.cssText = css;
			if (id === undefined) return _dom;else return _dom.childNodes[id || 0];
		},
		addAttributes: function addAttributes(dom, type, o, id) {
			var g = document.createElementNS(T.svgns, type);
			T.set(g, o);
			T.get(dom, id).appendChild(g);
			if (T.SVG_TYPE_G.indexOf(type) !== -1) g.style.pointerEvents = 'none';
			return g;
		},
		clear: function clear(dom) {
			T.purge(dom);

			while (dom.firstChild) {
				if (dom.firstChild.firstChild) T.clear(dom.firstChild);
				dom.removeChild(dom.firstChild);
			}
		},
		purge: function purge(dom) {
			var a = dom.attributes,
					i,
					n;

			if (a) {
				i = a.length;

				while (i--) {
					n = a[i].name;
					if (typeof dom[n] === 'function') dom[n] = null;
				}
			}

			a = dom.childNodes;

			if (a) {
				i = a.length;

				while (i--) {
					T.purge(dom.childNodes[i]);
				}
			}
		},
		// ----------------------
		//	 Color function
		// ----------------------
		ColorLuma: function ColorLuma(hex, l) {
			if (hex === 'n') hex = '#000'; // validate hex string

			hex = String(hex).replace(/[^0-9a-f]/gi, '');

			if (hex.length < 6) {
				hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
			}

			l = l || 0; // convert to decimal and change luminosity

			var rgb = "#",
					c,
					i;

			for (i = 0; i < 3; i++) {
				c = parseInt(hex.substr(i * 2, 2), 16);
				c = Math.round(Math.min(Math.max(0, c + c * l), 255)).toString(16);
				rgb += ("00" + c).substr(c.length);
			}

			return rgb;
		},
		findDeepInver: function findDeepInver(c) {
			return c[0] * 0.3 + c[1] * .59 + c[2] * .11 <= 0.6;
		},
		hexToHtml: function hexToHtml(v) {
			v = v === undefined ? 0x000000 : v;
			return "#" + ("000000" + v.toString(16)).substr(-6);
		},
		htmlToHex: function htmlToHex(v) {
			return v.toUpperCase().replace("#", "0x");
		},
		u255: function u255(c, i) {
			return parseInt(c.substring(i, i + 2), 16) / 255;
		},
		u16: function u16(c, i) {
			return parseInt(c.substring(i, i + 1), 16) / 15;
		},
		unpack: function unpack(c) {
			if (c.length == 7) return [T.u255(c, 1), T.u255(c, 3), T.u255(c, 5)];else if (c.length == 4) return [T.u16(c, 1), T.u16(c, 2), T.u16(c, 3)];
		},
		htmlRgb: function htmlRgb(c) {
			return 'rgb(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ')';
		},
		pad: function pad(n) {
			if (n.length == 1) n = '0' + n;
			return n;
		},
		rgbToHex: function rgbToHex(c) {
			var r = Math.round(c[0] * 255).toString(16);
			var g = Math.round(c[1] * 255).toString(16);
			var b = Math.round(c[2] * 255).toString(16);
			return '#' + T.pad(r) + T.pad(g) + T.pad(b); // return '#' + ( '000000' + ( ( c[0] * 255 ) << 16 ^ ( c[1] * 255 ) << 8 ^ ( c[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );
		},
		hueToRgb: function hueToRgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
			return p;
		},
		rgbToHsl: function rgbToHsl(c) {
			var r = c[0],
					g = c[1],
					b = c[2],
					min = Math.min(r, g, b),
					max = Math.max(r, g, b),
					delta = max - min,
					h = 0,
					s = 0,
					l = (min + max) / 2;
			if (l > 0 && l < 1) s = delta / (l < 0.5 ? 2 * l : 2 - 2 * l);

			if (delta > 0) {
				if (max == r && max != g) h += (g - b) / delta;
				if (max == g && max != b) h += 2 + (b - r) / delta;
				if (max == b && max != r) h += 4 + (r - g) / delta;
				h /= 6;
			}

			return [h, s, l];
		},
		hslToRgb: function hslToRgb(c) {
			var p,
					q,
					h = c[0],
					s = c[1],
					l = c[2];
			if (s === 0) return [l, l, l];else {
				q = l <= 0.5 ? l * (s + 1) : l + s - l * s;
				p = l * 2 - q;
				return [T.hueToRgb(p, q, h + 0.33333), T.hueToRgb(p, q, h), T.hueToRgb(p, q, h - 0.33333)];
			}
		},
		// ----------------------
		//	 SVG MODEL
		// ----------------------
		makeGradiant: function makeGradiant(type, settings, parent, colors) {
			T.dom(type, null, settings, parent, 0);
			var n = parent.childNodes[0].childNodes.length - 1,
					c;

			for (var i = 0; i < colors.length; i++) {
				c = colors[i]; //T.dom( 'stop', null, { offset:c[0]+'%', style:'stop-color:'+c[1]+'; stop-opacity:'+c[2]+';' }, parent, [0,n] );

				T.dom('stop', null, {
					offset: c[0] + '%',
					'stop-color': c[1],
					'stop-opacity': c[2]
				}, parent, [0, n]);
			}
		},

		/*makeGraph: function () {
					let w = 128;
				let radius = 34;
				let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
				T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'butt' }, svg );//0
				//T.dom( 'rect', '', { x:10, y:10, width:108, height:108, stroke:'rgba(0,0,0,0.3)', 'stroke-width':2 , fill:'none'}, svg );//1
				//T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
				
				//T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.3)', 'stroke-width':7 , fill:'none'}, svg );//2
				//T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
				T.graph = svg;
			},*/
		makeKnob: function makeKnob(model) {
			var w = 128;
			var radius = 34;
			var svg = T.dom('svg', T.css.basic, {
				viewBox: '0 0 ' + w + ' ' + w,
				width: w,
				height: w,
				preserveAspectRatio: 'none'
			});
			T.dom('circle', '', {
				cx: 64,
				cy: 64,
				r: radius,
				fill: T.colors.button,
				stroke: 'rgba(0,0,0,0.3)',
				'stroke-width': 8
			}, svg); //0

			T.dom('path', '', {
				d: '',
				stroke: T.colors.text,
				'stroke-width': 4,
				fill: 'none',
				'stroke-linecap': 'round'
			}, svg); //1

			T.dom('circle', '', {
				cx: 64,
				cy: 64,
				r: radius + 7,
				stroke: 'rgba(0,0,0,0.1)',
				'stroke-width': 7,
				fill: 'none'
			}, svg); //2

			T.dom('path', '', {
				d: '',
				stroke: 'rgba(255,255,255,0.3)',
				'stroke-width': 2,
				fill: 'none',
				'stroke-linecap': 'round',
				'stroke-opacity': 0.5
			}, svg); //3

			T.knob = svg;
		},
		makeCircular: function makeCircular(model) {
			var w = 128;
			var radius = 40;
			var svg = T.dom('svg', T.css.basic, {
				viewBox: '0 0 ' + w + ' ' + w,
				width: w,
				height: w,
				preserveAspectRatio: 'none'
			});
			T.dom('circle', '', {
				cx: 64,
				cy: 64,
				r: radius,
				stroke: 'rgba(0,0,0,0.1)',
				'stroke-width': 10,
				fill: 'none'
			}, svg); //0

			T.dom('path', '', {
				d: '',
				stroke: T.colors.text,
				'stroke-width': 7,
				fill: 'none',
				'stroke-linecap': 'butt'
			}, svg); //1

			T.circular = svg;
		},
		makeJoystick: function makeJoystick(model) {
			//+' background:#f00;'
			var w = 128,
					ccc;
			var radius = Math.floor((w - 30) * 0.5);
			var innerRadius = Math.floor(radius * 0.6);
			var svg = T.dom('svg', T.css.basic, {
				viewBox: '0 0 ' + w + ' ' + w,
				width: w,
				height: w,
				preserveAspectRatio: 'none'
			});
			T.dom('defs', null, {}, svg);
			T.dom('g', null, {}, svg);

			if (model === 0) {
				// gradian background
				ccc = [[40, 'rgb(0,0,0)', 0.3], [80, 'rgb(0,0,0)', 0], [90, 'rgb(50,50,50)', 0.4], [100, 'rgb(50,50,50)', 0]];
				T.makeGradiant('radialGradient', {
					id: 'grad',
					cx: '50%',
					cy: '50%',
					r: '50%',
					fx: '50%',
					fy: '50%'
				}, svg, ccc); // gradian shadow

				ccc = [[60, 'rgb(0,0,0)', 0.5], [100, 'rgb(0,0,0)', 0]];
				T.makeGradiant('radialGradient', {
					id: 'gradS',
					cx: '50%',
					cy: '50%',
					r: '50%',
					fx: '50%',
					fy: '50%'
				}, svg, ccc); // gradian stick

				var cc0 = ['rgb(40,40,40)', 'rgb(48,48,48)', 'rgb(30,30,30)'];
				var cc1 = ['rgb(1,90,197)', 'rgb(3,95,207)', 'rgb(0,65,167)'];
				ccc = [[30, cc0[0], 1], [60, cc0[1], 1], [80, cc0[1], 1], [100, cc0[2], 1]];
				T.makeGradiant('radialGradient', {
					id: 'gradIn',
					cx: '50%',
					cy: '50%',
					r: '50%',
					fx: '50%',
					fy: '50%'
				}, svg, ccc);
				ccc = [[30, cc1[0], 1], [60, cc1[1], 1], [80, cc1[1], 1], [100, cc1[2], 1]];
				T.makeGradiant('radialGradient', {
					id: 'gradIn2',
					cx: '50%',
					cy: '50%',
					r: '50%',
					fx: '50%',
					fy: '50%'
				}, svg, ccc); // graph

				T.dom('circle', '', {
					cx: 64,
					cy: 64,
					r: radius,
					fill: 'url(#grad)'
				}, svg); //2

				T.dom('circle', '', {
					cx: 64 + 5,
					cy: 64 + 10,
					r: innerRadius + 10,
					fill: 'url(#gradS)'
				}, svg); //3

				T.dom('circle', '', {
					cx: 64,
					cy: 64,
					r: innerRadius,
					fill: 'url(#gradIn)'
				}, svg); //4

				T.joystick_0 = svg;
			} else {
				// gradian shadow
				ccc = [[69, 'rgb(0,0,0)', 0], [70, 'rgb(0,0,0)', 0.3], [100, 'rgb(0,0,0)', 0]];
				T.makeGradiant('radialGradient', {
					id: 'gradX',
					cx: '50%',
					cy: '50%',
					r: '50%',
					fx: '50%',
					fy: '50%'
				}, svg, ccc);
				T.dom('circle', '', {
					cx: 64,
					cy: 64,
					r: radius,
					fill: 'none',
					stroke: 'rgba(100,100,100,0.25)',
					'stroke-width': '4'
				}, svg); //2

				T.dom('circle', '', {
					cx: 64,
					cy: 64,
					r: innerRadius + 14,
					fill: 'url(#gradX)'
				}, svg); //3

				T.dom('circle', '', {
					cx: 64,
					cy: 64,
					r: innerRadius,
					fill: 'none',
					stroke: 'rgb(100,100,100)',
					'stroke-width': '4'
				}, svg); //4

				T.joystick_1 = svg;
			}
		},
		makeColorRing: function makeColorRing() {
			var w = 256;
			var svg = T.dom('svg', T.css.basic, {
				viewBox: '0 0 ' + w + ' ' + w,
				width: w,
				height: w,
				preserveAspectRatio: 'none'
			});
			T.dom('defs', null, {}, svg);
			T.dom('g', null, {}, svg);
			var s = 30; //stroke

			var r = (w - s) * 0.5;
			var mid = w * 0.5;
			var n = 24,
					nudge = 8 / r / n * Math.PI,
					a1 = 0;
			var am, tan, d2, a2, ar, i, j, path, ccc;
			var color = [];

			for (i = 0; i <= n; ++i) {
				d2 = i / n;
				a2 = d2 * T.TwoPI;
				am = (a1 + a2) * 0.5;
				tan = 1 / Math.cos((a2 - a1) * 0.5);
				ar = [Math.sin(a1), -Math.cos(a1), Math.sin(am) * tan, -Math.cos(am) * tan, Math.sin(a2), -Math.cos(a2)];
				color[1] = T.rgbToHex(T.hslToRgb([d2, 1, 0.5]));

				if (i > 0) {
					j = 6;

					while (j--) {
						ar[j] = (ar[j] * r + mid).toFixed(2);
					}

					path = ' M' + ar[0] + ' ' + ar[1] + ' Q' + ar[2] + ' ' + ar[3] + ' ' + ar[4] + ' ' + ar[5];
					ccc = [[0, color[0], 1], [100, color[1], 1]];
					T.makeGradiant('linearGradient', {
						id: 'G' + i,
						x1: ar[0],
						y1: ar[1],
						x2: ar[4],
						y2: ar[5],
						gradientUnits: "userSpaceOnUse"
					}, svg, ccc);
					T.dom('path', '', {
						d: path,
						'stroke-width': s,
						stroke: 'url(#G' + i + ')',
						'stroke-linecap': "butt"
					}, svg, 1);
				}

				a1 = a2 - nudge;
				color[0] = color[1];
			}
			var tw = 84.90; // black / white

			ccc = [[0, '#FFFFFF', 1], [50, '#FFFFFF', 0], [50, '#000000', 0], [100, '#000000', 1]];
			T.makeGradiant('linearGradient', {
				id: 'GL0',
				x1: 0,
				y1: mid - tw,
				x2: 0,
				y2: mid + tw,
				gradientUnits: "userSpaceOnUse"
			}, svg, ccc);
			ccc = [[0, '#7f7f7f', 1], [50, '#7f7f7f', 0.5], [100, '#7f7f7f', 0]];
			T.makeGradiant('linearGradient', {
				id: 'GL1',
				x1: mid - 49.05,
				y1: 0,
				x2: mid + 98,
				y2: 0,
				gradientUnits: "userSpaceOnUse"
			}, svg, ccc);
			T.dom('g', null, {
				'transform-origin': '128px 128px',
				'transform': 'rotate(0)'
			}, svg); //2

			T.dom('polygon', '', {
				points: '78.95 43.1 78.95 212.85 226 128',
				fill: 'red'
			}, svg, 2); // 2,0

			T.dom('polygon', '', {
				points: '78.95 43.1 78.95 212.85 226 128',
				fill: 'url(#GL1)',
				'stroke-width': 1,
				stroke: 'url(#GL1)'
			}, svg, 2); //2,1

			T.dom('polygon', '', {
				points: '78.95 43.1 78.95 212.85 226 128',
				fill: 'url(#GL0)',
				'stroke-width': 1,
				stroke: 'url(#GL0)'
			}, svg, 2); //2,2

			T.dom('path', '', {
				d: 'M 255.75 136.5 Q 256 132.3 256 128 256 123.7 255.75 119.5 L 241 128 255.75 136.5 Z',
				fill: 'none',
				'stroke-width': 2,
				stroke: '#000'
			}, svg, 2); //2,3
			//T.dom( 'circle', '', { cx:128+113, cy:128, r:6, 'stroke-width':3, stroke:'#000', fill:'none' }, svg, 2 );//2.3

			T.dom('circle', '', {
				cx: 128,
				cy: 128,
				r: 6,
				'stroke-width': 2,
				stroke: '#000',
				fill: 'none'
			}, svg); //3

			T.colorRing = svg;
		},
		icon: function icon(type, color, w) {
			w = w || 40;
			color = color || '#DEDEDE';
			var viewBox = '0 0 256 256';
			var t = ["<svg xmlns='" + T.svgns + "' version='1.1' xmlns:xlink='" + T.htmls + "' style='pointer-events:none;' preserveAspectRatio='xMinYMax meet' x='0px' y='0px' width='" + w + "px' height='" + w + "px' viewBox='" + viewBox + "'><g>"];

			switch (type) {
				case 'logo':
					t[1] = "<path id='logoin' fill='" + color + "' stroke='none' d='" + T.logoFill_d + "'/>";
					break;

				case 'save':
					t[1] = "<path stroke='" + color + "' stroke-width='4' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 26.125 17 L 20 22.95 14.05 17 M 20 9.95 L 20 22.95'/><path stroke='" + color;
					t[1] += "' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 32.6 23 L 32.6 25.5 Q 32.6 28.5 29.6 28.5 L 10.6 28.5 Q 7.6 28.5 7.6 25.5 L 7.6 23'/>";
					break;
			}

			t[2] = "</g></svg>";
			return t.join("\n");
		},
		logoFill_d: ["M 171 150.75 L 171 33.25 155.5 33.25 155.5 150.75 Q 155.5 162.2 147.45 170.2 139.45 178.25 128 178.25 116.6 178.25 108.55 170.2 100.5 162.2 100.5 150.75 ", "L 100.5 33.25 85 33.25 85 150.75 Q 85 168.65 97.55 181.15 110.15 193.75 128 193.75 145.9 193.75 158.4 181.15 171 168.65 171 150.75 ", "M 200 33.25 L 184 33.25 184 150.8 Q 184 174.1 167.6 190.4 151.3 206.8 128 206.8 104.75 206.8 88.3 190.4 72 174.1 72 150.8 L 72 33.25 56 33.25 56 150.75 ", "Q 56 180.55 77.05 201.6 98.2 222.75 128 222.75 157.8 222.75 178.9 201.6 200 180.55 200 150.75 L 200 33.25 Z"].join('\n')
	};
	T.setText();
	var Tools = T;

	/**
	 * @author lth / https://github.com/lo-th
	 */
	// INTENAL FUNCTION
	var R = {
		ui: [],
		ID: null,
		lock: false,
		wlock: false,
		current: -1,
		needReZone: true,
		isEventsInit: false,
		prevDefault: ['contextmenu', 'mousedown', 'mousemove', 'mouseup'],
		pointerEvent: ['pointerdown', 'pointermove', 'pointerup'],
		xmlserializer: new XMLSerializer(),
		tmpTime: null,
		tmpImage: null,
		oldCursor: 'auto',
		input: null,
		parent: null,
		firstImput: true,
		//callbackImput: null,
		hiddenImput: null,
		hiddenSizer: null,
		hasFocus: false,
		startInput: false,
		inputRange: [0, 0],
		cursorId: 0,
		str: '',
		pos: 0,
		startX: -1,
		moveX: -1,
		debugInput: false,
		isLoop: false,
		listens: [],
		e: {
			type: null,
			clientX: 0,
			clientY: 0,
			keyCode: NaN,
			key: null,
			delta: 0
		},
		isMobile: false,
		add: function add(o) {
			R.ui.push(o);
			R.getZone(o);
			if (!R.isEventsInit) R.initEvents();
		},
		testMobile: function testMobile() {
			var n = navigator.userAgent;
			if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;else return false;
		},
		remove: function remove(o) {
			var i = R.ui.indexOf(o);

			if (i !== -1) {
				R.removeListen(o);
				R.ui.splice(i, 1);
			}

			if (R.ui.length === 0) {
				R.removeEvents();
			}
		},
		// ----------------------
		//	 EVENTS
		// ----------------------
		initEvents: function initEvents() {
			if (R.isEventsInit) return;
			var dom = document.body;
			R.isMobile = R.testMobile();

			if (R.isMobile) {
				dom.addEventListener('touchstart', R, false);
				dom.addEventListener('touchend', R, false);
				dom.addEventListener('touchmove', R, false);
			} else {
				dom.addEventListener('contextmenu', R, false);
				dom.addEventListener('wheel', R, false);
				document.addEventListener('click', R, false);
				/*dom.addEventListener( 'mousedown', R, false );
				document.addEventListener( 'mousemove', R, false );
				document.addEventListener( 'mouseup', R, false );*/

				dom.addEventListener('pointerdown', R, false);
				document.addEventListener('pointermove', R, false);
				document.addEventListener('pointerup', R, false);
			}

			window.addEventListener('keydown', R, false);
			window.addEventListener('keyup', R, false);
			window.addEventListener('resize', R.resize, false); //window.onblur = R.out;
			//window.onfocus = R.in;

			R.isEventsInit = true;
		},
		removeEvents: function removeEvents() {
			if (!R.isEventsInit) return;
			var dom = document.body;

			if (R.isMobile) {
				dom.removeEventListener('touchstart', R, false);
				dom.removeEventListener('touchend', R, false);
				dom.removeEventListener('touchmove', R, false);
			} else {
				dom.removeEventListener('contextmenu', R, false);
				dom.removeEventListener('wheel', R, false);
				document.removeEventListener('click', R, false);
				/*dom.removeEventListener( 'mousedown', R, false );
				document.removeEventListener( 'mousemove', R, false );
				document.removeEventListener( 'mouseup', R, false );*/

				dom.removeEventListener('pointerdown', R, false);
				document.removeEventListener('pointermove', R, false);
				document.removeEventListener('pointerup', R, false);
			}

			window.removeEventListener('keydown', R);
			window.removeEventListener('keyup', R);
			window.removeEventListener('resize', R.resize);
			R.isEventsInit = false;
		},
		resize: function resize() {
			R.needReZone = true;
			var i = R.ui.length,
					u;

			while (i--) {
				u = R.ui[i];
				if (u.isGui && !u.isCanvasOnly && u.autoResize) u.setHeight();
			}
		},
		out: function out() {
			console.log('im am out');
			R.clearOldID();
		},
		in: function _in() {
			console.log('im am in'); //	R.clearOldID();
		},
		// ----------------------
		//	 HANDLE EVENTS
		// ----------------------
		handleEvent: function handleEvent(event) {
			//if(!event.type) return;
			//	console.log( event.type )
			if (event.type.indexOf(R.prevDefault) !== -1) event.preventDefault();

			if (event.type.indexOf(R.pointerEvent) !== -1) {
				if (event.pointerType !== 'mouse' || event.pointerType !== 'pen') return;
			}

			if (event.type === 'contextmenu') return; //if( event.type === 'keydown'){ R.editText( event ); return;}
			//if( event.type !== 'keydown' && event.type !== 'wheel' ) event.preventDefault();
			//event.stopPropagation();

			R.findZone();
			var e = R.e;
			if (event.type === 'keydown') R.keydown(event);
			if (event.type === 'keyup') R.keyup(event);
			if (event.type === 'wheel') e.delta = event.deltaY > 0 ? 1 : -1;else e.delta = 0;
			e.clientX = event.clientX || 0;
			e.clientY = event.clientY || 0;
			e.type = event.type; // mobile

			if (R.isMobile) {
				if (event.touches && event.touches.length > 0) {
					e.clientX = event.touches[0].clientX || 0;
					e.clientY = event.touches[0].clientY || 0;
				}

				if (event.type === 'touchstart') e.type = 'mousedown';
				if (event.type === 'touchend') e.type = 'mouseup';
				if (event.type === 'touchmove') e.type = 'mousemove';
			}

			if (event.type === 'pointerdown') e.type = 'mousedown';
			if (event.type === 'pointerup') e.type = 'mouseup';
			if (event.type === 'pointermove') e.type = 'mousemove'; //if( 'pointerdown' 'pointermove', 'pointerup')

			/*
			if( event.type === 'touchstart'){ e.type = 'mousedown'; R.findID( e ); }
			if( event.type === 'touchend'){ e.type = 'mouseup';	if( R.ID !== null ) R.ID.handleEvent( e ); R.clearOldID(); }
			if( event.type === 'touchmove'){ e.type = 'mousemove';	}
			*/

			if (e.type === 'mousedown') R.lock = true;
			if (e.type === 'mouseup') R.lock = false;
			if (R.isMobile && e.type === 'mousedown') R.findID(e);
			if (e.type === 'mousemove' && !R.lock) R.findID(e);

			if (R.ID !== null) {
				if (R.ID.isCanvasOnly) {
					e.clientX = R.ID.mouse.x;
					e.clientY = R.ID.mouse.y;
				}

				R.ID.handleEvent(e);
			}

			if (R.isMobile && e.type === 'mouseup') R.clearOldID();
		},
		// ----------------------
		//	 ID
		// ----------------------
		findID: function findID(e) {
			var i = R.ui.length,
					next = -1,
					u,
					x,
					y;

			while (i--) {
				u = R.ui[i];

				if (u.isCanvasOnly) {
					x = u.mouse.x;
					y = u.mouse.y;
				} else {
					x = e.clientX;
					y = e.clientY;
				}

				if (R.onZone(u, x, y)) {
					next = i;

					if (next !== R.current) {
						R.clearOldID();
						R.current = next;
						R.ID = u;
					}

					break;
				}
			}

			if (next === -1) R.clearOldID();
		},
		clearOldID: function clearOldID() {
			if (!R.ID) return;
			R.current = -1;
			R.ID.reset();
			R.ID = null;
			R.cursor();
		},
		// ----------------------
		//	 GUI / GROUP FUNCTION
		// ----------------------
		calcUis: function calcUis(uis, zone, py) {
			var lng = uis.length,
					u,
					i,
					px = 0,
					my = 0;

			for (i = 0; i < lng; i++) {
				u = uis[i];
				u.zone.w = u.w;
				u.zone.h = u.h;

				if (!u.autoWidth) {
					if (px === 0) py += u.h + 1;
					u.zone.x = zone.x + px;
					u.zone.y = px === 0 ? py - u.h : my;
					my = u.zone.y;
					px += u.w;
					if (px + u.w > zone.w) px = 0;
				} else {
					u.zone.x = zone.x;
					u.zone.y = py;
					py += u.h + 1;
				}

				if (u.isGroup) u.calcUis();
			}
		},
		findTarget: function findTarget(uis, e) {
			var i = uis.length;

			while (i--) {
				if (R.onZone(uis[i], e.clientX, e.clientY)) return i;
			}

			return -1;
		},
		// ----------------------
		//	 ZONE
		// ----------------------
		findZone: function findZone(force) {
			if (!R.needReZone && !force) return;
			var i = R.ui.length,
					u;

			while (i--) {
				u = R.ui[i];
				R.getZone(u);
				if (u.isGui) u.calcUis();
			}

			R.needReZone = false;
		},
		onZone: function onZone(o, x, y) {
			if (x === undefined || y === undefined) return false;
			var z = o.zone;
			var mx = x - z.x;
			var my = y - z.y;
			var over = mx >= 0 && my >= 0 && mx <= z.w && my <= z.h;
			if (over) o.local.set(mx, my);else o.local.neg();
			return over;
		},
		getZone: function getZone(o) {
			if (o.isCanvasOnly) return;
			var r = o.getDom().getBoundingClientRect();
			o.zone = {
				x: r.left,
				y: r.top,
				w: r.width,
				h: r.height
			};
		},
		// ----------------------
		//	 CURSOR
		// ----------------------
		cursor: function cursor(name) {
			name = name ? name : 'auto';

			if (name !== R.oldCursor) {
				document.body.style.cursor = name;
				R.oldCursor = name;
			}
		},
		// ----------------------
		//	 CANVAS
		// ----------------------
		toCanvas: function toCanvas(o, w, h, force) {
			// prevent exesive redraw
			if (force && R.tmpTime !== null) {
				clearTimeout(R.tmpTime);
				R.tmpTime = null;
			}

			if (R.tmpTime !== null) return;
			if (R.lock) R.tmpTime = setTimeout(function () {
				R.tmpTime = null;
			}, 10); ///

			var isNewSize = false;
			if (w !== o.canvas.width || h !== o.canvas.height) isNewSize = true;
			if (R.tmpImage === null) R.tmpImage = new Image();
			var img = R.tmpImage; //new Image();

			var htmlString = R.xmlserializer.serializeToString(o.content);
			var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><foreignObject style="pointer-events: none; left:0;" width="100%" height="100%">' + htmlString + '</foreignObject></svg>';

			img.onload = function () {
				var ctx = o.canvas.getContext("2d");

				if (isNewSize) {
					o.canvas.width = w;
					o.canvas.height = h;
				} else {
					ctx.clearRect(0, 0, w, h);
				}

				ctx.drawImage(this, 0, 0);
				o.onDraw();
			};

			img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); //img.src = 'data:image/svg+xml;base64,'+ window.btoa( svg );

			img.crossOrigin = '';
		},
		// ----------------------
		//	 INPUT
		// ----------------------
		setHidden: function setHidden() {
			if (R.hiddenImput === null) {
				var hide = R.debugInput ? '' : 'opacity:0; zIndex:0;';
				var css = R.parent.css.txt + 'padding:0; width:auto; height:auto; text-shadow:none;';
				css += 'left:10px; top:auto; border:none; color:#FFF; background:#000;' + hide;
				R.hiddenImput = document.createElement('input');
				R.hiddenImput.type = 'text';
				R.hiddenImput.style.cssText = css + 'bottom:30px;' + (R.debugInput ? '' : 'transform:scale(0);');
				R.hiddenSizer = document.createElement('div');
				R.hiddenSizer.style.cssText = css + 'bottom:60px;';
				document.body.appendChild(R.hiddenImput);
				document.body.appendChild(R.hiddenSizer);
			}

			R.hiddenImput.style.width = R.input.clientWidth + 'px';
			R.hiddenImput.value = R.str;
			R.hiddenSizer.innerHTML = R.str;
			R.hasFocus = true;
		},
		clearHidden: function clearHidden(p) {
			if (R.hiddenImput === null) return;
			R.hasFocus = false;
		},
		clickPos: function clickPos(x) {
			var i = R.str.length,
					l = 0,
					n = 0;

			while (i--) {
				l += R.textWidth(R.str[n]);
				if (l >= x) break;
				n++;
			}

			return n;
		},
		upInput: function upInput(x, down) {
			if (R.parent === null) return false;
			var up = false;

			if (down) {
				var id = R.clickPos(x);
				R.moveX = id;

				if (R.startX === -1) {
					R.startX = id;
					R.cursorId = id;
					R.inputRange = [R.startX, R.startX];
				} else {
					var isSelection = R.moveX !== R.startX;

					if (isSelection) {
						if (R.startX > R.moveX) R.inputRange = [R.moveX, R.startX];else R.inputRange = [R.startX, R.moveX];
					}
				}

				up = true;
			} else {
				if (R.startX !== -1) {
					R.hasFocus = true;
					R.hiddenImput.focus();
					R.hiddenImput.selectionStart = R.inputRange[0];
					R.hiddenImput.selectionEnd = R.inputRange[1];
					R.startX = -1;
					up = true;
				}
			}

			if (up) R.selectParent();
			return up;
		},
		selectParent: function selectParent() {
			var c = R.textWidth(R.str.substring(0, R.cursorId));
			var e = R.textWidth(R.str.substring(0, R.inputRange[0]));
			var s = R.textWidth(R.str.substring(R.inputRange[0], R.inputRange[1]));
			R.parent.select(c, e, s);
		},
		textWidth: function textWidth(text) {
			if (R.hiddenSizer === null) return 0;
			text = text.replace(/ /g, '&nbsp;');
			R.hiddenSizer.innerHTML = text;
			return R.hiddenSizer.clientWidth;
		},
		clearInput: function clearInput() {
			if (R.parent === null) return;
			if (!R.firstImput) R.parent.validate(true);
			R.clearHidden();
			R.parent.unselect(); //R.input.style.background = 'none';

			R.input.style.background = R.parent.colors.inputBg;
			R.input.style.borderColor = R.parent.colors.inputBorder;
			R.parent.isEdit = false;
			R.input = null;
			R.parent = null;
			R.str = '', R.firstImput = true;
		},
		setInput: function setInput(Input, parent) {
			R.clearInput();
			R.input = Input;
			R.parent = parent;
			R.input.style.background = R.parent.colors.inputOver;
			R.input.style.borderColor = R.parent.colors.inputBorderSelect;
			R.str = R.input.textContent;
			R.setHidden();
		},

		/*select: function () {
					document.execCommand( "selectall", null, false );
			},*/
		keydown: function keydown(e) {
			if (R.parent === null) return;
			var keyCode = e.which;
					e.shiftKey; //console.log( keyCode )

			R.firstImput = false;

			if (R.hasFocus) {
				// hack to fix touch event bug in iOS Safari
				window.focus();
				R.hiddenImput.focus();
			}

			R.parent.isEdit = true; // e.preventDefault();
			// add support for Ctrl/Cmd+A selection
			//if ( keyCode === 65 && (e.ctrlKey || e.metaKey )) {
			//R.selectText();
			//e.preventDefault();
			//return self.render();
			//}

			if (keyCode === 13) {
				//enter
				R.clearInput(); //} else if( keyCode === 9 ){ //tab key
				// R.input.textContent = '';
			} else {
				if (R.input.isNum) {
					if (e.keyCode > 47 && e.keyCode < 58 || e.keyCode > 95 && e.keyCode < 106 || e.keyCode === 190 || e.keyCode === 110 || e.keyCode === 8 || e.keyCode === 109) {
						R.hiddenImput.readOnly = false;
					} else {
						R.hiddenImput.readOnly = true;
					}
				} else {
					R.hiddenImput.readOnly = false;
				}
			}
		},
		keyup: function keyup(e) {
			if (R.parent === null) return;
			R.str = R.hiddenImput.value;
			if (R.parent.allEqual) R.parent.sameStr(R.str); // numeric samùe value
			else R.input.textContent = R.str;
			R.cursorId = R.hiddenImput.selectionStart;
			R.inputRange = [R.hiddenImput.selectionStart, R.hiddenImput.selectionEnd];
			R.selectParent(); //if( R.parent.allway ) 

			R.parent.validate();
		},
		// ----------------------
		//
		//	 LISTENING
		//
		// ----------------------
		loop: function loop() {
			if (R.isLoop) requestAnimationFrame(R.loop);
			R.update();
		},
		update: function update() {
			var i = R.listens.length;

			while (i--) {
				R.listens[i].listening();
			}
		},
		removeListen: function removeListen(proto) {
			var id = R.listens.indexOf(proto);
			if (id !== -1) R.listens.splice(id, 1);
			if (R.listens.length === 0) R.isLoop = false;
		},
		addListen: function addListen(proto) {
			var id = R.listens.indexOf(proto);
			if (id !== -1) return false;
			R.listens.push(proto);

			if (!R.isLoop) {
				R.isLoop = true;
				R.loop();
			}

			return true;
		}
	};
	var Roots = R;

	function _inheritsLoose(subClass, superClass) {
		subClass.prototype = Object.create(superClass.prototype);
		subClass.prototype.constructor = subClass;

		_setPrototypeOf(subClass, superClass);
	}

	function _setPrototypeOf(o, p) {
		_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
			o.__proto__ = p;
			return o;
		};

		return _setPrototypeOf(o, p);
	}

	var V2 = /*#__PURE__*/function () {
		function V2(x, y) {
			if (x === void 0) {
				x = 0;
			}

			if (y === void 0) {
				y = 0;
			}

			this.x = x;
			this.y = y;
		}

		var _proto = V2.prototype;

		_proto.set = function set(x, y) {
			this.x = x;
			this.y = y;
			return this;
		};

		_proto.divide = function divide(v) {
			this.x /= v.x;
			this.y /= v.y;
			return this;
		};

		_proto.multiply = function multiply(v) {
			this.x *= v.x;
			this.y *= v.y;
			return this;
		};

		_proto.multiplyScalar = function multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			return this;
		};

		_proto.divideScalar = function divideScalar(scalar) {
			return this.multiplyScalar(1 / scalar);
		};

		_proto.length = function length() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		};

		_proto.angle = function angle() {
			// computes the angle in radians with respect to the positive x-axis
			var angle = Math.atan2(this.y, this.x);
			if (angle < 0) angle += 2 * Math.PI;
			return angle;
		};

		_proto.addScalar = function addScalar(s) {
			this.x += s;
			this.y += s;
			return this;
		};

		_proto.negate = function negate() {
			this.x *= -1;
			this.y *= -1;
			return this;
		};

		_proto.neg = function neg() {
			this.x = -1;
			this.y = -1;
			return this;
		};

		_proto.isZero = function isZero() {
			return this.x === 0 && this.y === 0;
		};

		_proto.copy = function copy(v) {
			this.x = v.x;
			this.y = v.y;
			return this;
		};

		_proto.equals = function equals(v) {
			return v.x === this.x && v.y === this.y;
		};

		_proto.nearEquals = function nearEquals(v, n) {
			return v.x.toFixed(n) === this.x.toFixed(n) && v.y.toFixed(n) === this.y.toFixed(n);
		};

		_proto.lerp = function lerp(v, alpha) {
			if (v === null) {
				this.x -= this.x * alpha;
				this.y -= this.y * alpha;
			} else {
				this.x += (v.x - this.x) * alpha;
				this.y += (v.y - this.y) * alpha;
			}

			return this;
		};

		return V2;
	}();

	/**
	 * @author lth / https://github.com/lo-th
	 */

	var Proto = /*#__PURE__*/function () {
		function Proto(o) {
			if (o === void 0) {
				o = {};
			}

			// if is on gui or group
			this.main = o.main || null;
			this.isUI = o.isUI || false;
			this.group = null;
			this.isListen = false; //this.parentGroup = null;

			this.ontop = o.ontop ? o.ontop : false; // 'beforebegin' 'afterbegin' 'beforeend' 'afterend'

			this.css = this.main ? this.main.css : Tools.css;
			this.colors = this.main ? this.main.colors : Tools.colors;
			this.defaultBorderColor = this.colors.border;
			this.svgs = Tools.svgs; // only space 

			this.isSpace = o.isSpace || false;
			this.zone = {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			};
			this.local = new V2().neg();
			this.isCanvasOnly = false;
			this.isSelect = false; // percent of title

			this.p = o.p !== undefined ? o.p : Tools.size.p;
			this.w = this.isUI ? this.main.size.w : Tools.size.w;
			if (o.w !== undefined) this.w = o.w;
			this.h = this.isUI ? this.main.size.h : Tools.size.h;
			if (o.h !== undefined) this.h = o.h;
			if (!this.isSpace) this.h = this.h < 11 ? 11 : this.h; // if need resize width

			this.autoWidth = o.auto || true; // open statu

			this.isOpen = false; // radius for toolbox

			this.radius = o.radius || this.colors.radius; // only for number

			this.isNumber = false;
			this.noNeg = o.noNeg || false;
			this.allEqual = o.allEqual || false; // only most simple 

			this.mono = false; // stop listening for edit slide text

			this.isEdit = false; // no title 

			this.simple = o.simple || false;
			if (this.simple) this.sa = 0; // define obj size

			this.setSize(this.w); // title size

			if (o.sa !== undefined) this.sa = o.sa;
			if (o.sb !== undefined) this.sb = o.sb;
			if (this.simple) this.sb = this.w - this.sa; // last number size for slide

			this.sc = o.sc === undefined ? 47 : o.sc; // for listening object

			this.objectLink = null;
			this.isSend = false;
			this.val = null; // Background

			this.bg = this.colors.background;
			this.bgOver = this.colors.backgroundOver;

			if (o.bg !== undefined) {
				this.bg = o.bg;
				this.bgOver = o.bg;
			}

			if (o.bgOver !== undefined) {
				this.bgOver = o.bgOver;
			} // Font Color;


			this.titleColor = o.titleColor || this.colors.text;
			this.fontColor = o.fontColor || this.colors.text;
			this.fontSelect = o.fontSelect || this.colors.textOver;
			if (o.color !== undefined) this.fontColor = o.color;
			/*{ 
				if(o.color === 'n') o.color = '#ff0000';
				if( o.color !== 'no' ) {
					if( !isNaN(o.color) ) this.fontColor = Tools.hexToHtml(o.color);
					else this.fontColor = o.color;
					this.titleColor = this.fontColor;
			}
			
			}*/

			/*if( o.color !== undefined ){ 
					if( !isNaN(o.color) ) this.fontColor = Tools.hexToHtml(o.color);
					else this.fontColor = o.color;
					this.titleColor = this.fontColor;
			}*/

			this.colorPlus = Tools.ColorLuma(this.fontColor, 0.3);
			this.txt = o.name || '';
			this.rename = o.rename || '';
			this.target = o.target || null;
			this.callback = o.callback === undefined ? null : o.callback;
			this.endCallback = null;
			if (this.callback === null && this.isUI && this.main.callback !== null) this.callback = this.main.callback; // elements

			this.c = []; // style 

			this.s = [];
			this.c[0] = Tools.dom('div', this.css.basic + 'position:relative; height:20px; float:left; overflow:hidden;');
			this.s[0] = this.c[0].style;
			if (this.isUI) this.s[0].marginBottom = '1px'; // with title

			if (!this.simple) {
				this.c[1] = Tools.dom('div', this.css.txt);
				this.s[1] = this.c[1].style;
				this.c[1].textContent = this.rename === '' ? this.txt : this.rename;
				this.s[1].color = this.titleColor;
			}

			if (o.pos) {
				this.s[0].position = 'absolute';

				for (var p in o.pos) {
					this.s[0][p] = o.pos[p];
				}

				this.mono = true;
			}

			if (o.css) this.s[0].cssText = o.css;
		} // ----------------------
		// make the node
		// ----------------------


		var _proto = Proto.prototype;

		_proto.init = function init() {
			this.zone.h = this.h;
			var s = this.s; // style cache

			var c = this.c; // div cach

			s[0].height = this.h + 'px';
			if (this.isUI) s[0].background = this.bg; //if( this.isSpace	) s[0].background = 'none';
			//if( this.autoHeight ) s[0].transition = 'height 0.01s ease-out';

			if (c[1] !== undefined && this.autoWidth) {
				s[1] = c[1].style;
				s[1].height = this.h - 4 + 'px';
				s[1].lineHeight = this.h - 8 + 'px';
			}

			var frag = Tools.frag;

			for (var i = 1, lng = c.length; i !== lng; i++) {
				if (c[i] !== undefined) {
					frag.appendChild(c[i]);
					s[i] = c[i].style;
				}
			}

			var pp = this.target !== null ? this.target : this.isUI ? this.main.inner : document.body;
			if (this.ontop) pp.insertAdjacentElement('afterbegin', c[0]);else pp.appendChild(c[0]);
			/*if( this.target !== null ){ 
					this.target.appendChild( c[0] );
			} else {
					if( this.isUI ) this.main.inner.appendChild( c[0] );
					else document.body.appendChild( c[0] );
			}*/

			c[0].appendChild(frag);
			this.rSize(); // ! solo proto

			if (!this.isUI) {
				this.c[0].style.pointerEvents = 'auto';
				Roots.add(this);
			}
		} // from Tools
		;

		_proto.dom = function dom(type, css, obj, _dom, id) {
			return Tools.dom(type, css, obj, _dom, id);
		};

		_proto.setSvg = function setSvg(dom, type, value, id, id2) {
			Tools.setSvg(dom, type, value, id, id2);
		};

		_proto.setCss = function setCss(dom, css) {
			Tools.setCss(dom, css);
		};

		_proto.clamp = function clamp(value, min, max) {
			return Tools.clamp(value, min, max);
		};

		_proto.getColorRing = function getColorRing() {
			if (!Tools.colorRing) Tools.makeColorRing();
			return Tools.clone(Tools.colorRing);
		};

		_proto.getJoystick = function getJoystick(model) {
			if (!Tools['joystick_' + model]) Tools.makeJoystick(model);
			return Tools.clone(Tools['joystick_' + model]);
		};

		_proto.getCircular = function getCircular(model) {
			if (!Tools.circular) Tools.makeCircular(model);
			return Tools.clone(Tools.circular);
		};

		_proto.getKnob = function getKnob(model) {
			if (!Tools.knob) Tools.makeKnob(model);
			return Tools.clone(Tools.knob);
		} // from Roots
		;

		_proto.cursor = function cursor(name) {
			Roots.cursor(name);
		} /////////
		;

		_proto.update = function update() {};

		_proto.reset = function reset() {} /////////
		;

		_proto.getDom = function getDom() {
			return this.c[0];
		};

		_proto.uiout = function uiout() {
			if (this.isSpace) return;
			if (this.s) this.s[0].background = this.bg;
		};

		_proto.uiover = function uiover() {
			if (this.isSpace) return;
			if (this.s) this.s[0].background = this.bgOver;
		};

		_proto.rename = function rename(s) {
			if (this.c[1] !== undefined) this.c[1].textContent = s;
		};

		_proto.listen = function listen() {
			this.isListen = Roots.addListen(this);
			return this;
		};

		_proto.listening = function listening() {
			if (this.objectLink === null) return;
			if (this.isSend) return;
			if (this.isEdit) return;
			this.setValue(this.objectLink[this.val]);
		};

		_proto.setValue = function setValue(v) {
			if (this.isNumber) this.value = this.numValue(v); //else if( v instanceof Array && v.length === 1 ) v = v[0];
			else this.value = v;
			this.update();
		} // ----------------------
		// update every change
		// ----------------------
		;

		_proto.onChange = function onChange(f) {
			if (this.isSpace) return;
			this.callback = f || null;
			return this;
		} // ----------------------
		// update only on end
		// ----------------------
		;

		_proto.onFinishChange = function onFinishChange(f) {
			if (this.isSpace) return;
			this.callback = null;
			this.endCallback = f;
			return this;
		};

		_proto.send = function send(v) {
			v = v || this.value;
			if (v instanceof Array && v.length === 1) v = v[0];
			this.isSend = true;
			if (this.objectLink !== null) this.objectLink[this.val] = v;
			if (this.callback) this.callback(v, this.val);
			this.isSend = false;
		};

		_proto.sendEnd = function sendEnd(v) {
			v = v || this.value;
			if (v instanceof Array && v.length === 1) v = v[0];
			if (this.endCallback) this.endCallback(v);
			if (this.objectLink !== null) this.objectLink[this.val] = v;
		} // ----------------------
		// clear node
		// ----------------------
		;

		_proto.clear = function clear(nofull) {
			if (this.isListen) Roots.removeListen(this);
			Tools.clear(this.c[0]);

			if (!nofull) {
				if (this.target !== null) {
					if (this.group !== null) this.group.clearOne(this);else this.target.removeChild(this.c[0]);
				} else {
					if (this.isUI) this.main.clearOne(this);else document.body.removeChild(this.c[0]);
				}

				if (!this.isUI) Roots.remove(this);
			}

			this.c = null;
			this.s = null;
			this.callback = null;
			this.target = null;
			this.isListen = false;
		} // ----------------------
		// change size 
		// ----------------------
		;

		_proto.setSize = function setSize(sx) {
			if (!this.autoWidth) return;
			this.w = sx;

			if (this.simple) {
				this.sb = this.w - this.sa;
			} else {
				var pp = this.w * (this.p / 100);
				this.sa = Math.floor(pp + 10);
				this.sb = Math.floor(this.w - pp - 20);
			}
		};

		_proto.rSize = function rSize() {
			if (!this.autoWidth) return;
			this.s[0].width = this.w + 'px';
			if (!this.simple) this.s[1].width = this.sa + 'px';
		} // ----------------------
		// for numeric value
		// ----------------------
		;

		_proto.setTypeNumber = function setTypeNumber(o) {
			this.isNumber = true;
			this.value = 0;

			if (o.value !== undefined) {
				if (typeof o.value === 'string') this.value = o.value * 1;else this.value = o.value;
			}

			this.min = o.min === undefined ? -Infinity : o.min;
			this.max = o.max === undefined ? Infinity : o.max;
			this.precision = o.precision === undefined ? 2 : o.precision;
			var s;

			switch (this.precision) {
				case 0:
					s = 1;
					break;

				case 1:
					s = 0.1;
					break;

				case 2:
					s = 0.01;
					break;

				case 3:
					s = 0.001;
					break;

				case 4:
					s = 0.0001;
					break;

				case 5:
					s = 0.00001;
					break;
			}

			this.step = o.step === undefined ? s : o.step;
			this.range = this.max - this.min;
			this.value = this.numValue(this.value);
		};

		_proto.numValue = function numValue(n) {
			if (this.noNeg) n = Math.abs(n);
			return Math.min(this.max, Math.max(this.min, n)).toFixed(this.precision) * 1;
		} // ----------------------
		//	 EVENTS DEFAULT
		// ----------------------
		;

		_proto.handleEvent = function handleEvent(e) {
			if (this.isSpace) return;
			return this[e.type](e);
		};

		_proto.wheel = function wheel(e) {
			return false;
		};

		_proto.mousedown = function mousedown(e) {
			return false;
		};

		_proto.mousemove = function mousemove(e) {
			return false;
		};

		_proto.mouseup = function mouseup(e) {
			return false;
		};

		_proto.keydown = function keydown(e) {
			return false;
		};

		_proto.click = function click(e) {
			return false;
		};

		_proto.keyup = function keyup(e) {
			return false;
		} // ----------------------
		// object referency
		// ----------------------
		;

		_proto.setReferency = function setReferency(obj, val) {
			this.objectLink = obj;
			this.val = val;
		};

		_proto.display = function display(v) {
			v = v || false;
			this.s[0].display = v ? 'block' : 'none'; //this.isReady = v ? false : true;
		} // ----------------------
		// resize height 
		// ----------------------
		;

		_proto.open = function open() {
			if (this.isOpen) return;
			this.isOpen = true;
		};

		_proto.close = function close() {
			if (!this.isOpen) return;
			this.isOpen = false;
		};

		_proto.needZone = function needZone() {
			Roots.needReZone = true;
		};

		_proto.rezone = function rezone() {
			Roots.needReZone = true;
		} // ----------------------
		//	INPUT
		// ----------------------
		;

		_proto.select = function select() {};

		_proto.unselect = function unselect() {};

		_proto.setInput = function setInput(Input) {
			Roots.setInput(Input, this);
		};

		_proto.upInput = function upInput(x, down) {
			return Roots.upInput(x, down);
		} // ----------------------
		// special item 
		// ----------------------
		;

		_proto.selected = function selected(b) {
			this.isSelect = b || false;
		};

		return Proto;
	}();

	var Bool = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Bool, _Proto);

		function Bool(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.value = o.value || false;
			_this.buttonColor = o.bColor || _this.colors.button;
			_this.inh = o.inh || Math.floor(_this.h * 0.8);
			_this.inw = o.inw || 36;
			var t = Math.floor(_this.h * 0.5) - (_this.inh - 2) * 0.5;
			_this.c[2] = _this.dom('div', _this.css.basic + 'background:' + _this.colors.boolbg + '; height:' + (_this.inh - 2) + 'px; width:' + _this.inw + 'px; top:' + t + 'px; border-radius:10px; border:2px solid ' + _this.boolbg);
			_this.c[3] = _this.dom('div', _this.css.basic + 'height:' + (_this.inh - 6) + 'px; width:16px; top:' + (t + 2) + 'px; border-radius:10px; background:' + _this.buttonColor + ';');

			_this.init();

			_this.update();

			return _this;
		} // ----------------------
		//	 EVENTS
		// ----------------------


		var _proto = Bool.prototype;

		_proto.mousemove = function mousemove(e) {
			this.cursor('pointer');
		};

		_proto.mousedown = function mousedown(e) {
			this.value = this.value ? false : true;
			this.update();
			this.send();
			return true;
		} // ----------------------
		;

		_proto.update = function update() {
			var s = this.s;

			if (this.value) {
				s[2].background = this.colors.boolon;
				s[2].borderColor = this.colors.boolon;
				s[3].marginLeft = '17px';
			} else {
				s[2].background = this.colors.boolbg;
				s[2].borderColor = this.colors.boolbg;
				s[3].marginLeft = '2px';
			}
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			var s = this.s;
			var w = this.w - 10 - this.inw;
			s[2].left = w + 'px';
			s[3].left = w + 'px';
		};

		return Bool;
	}(Proto);

	var Button = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Button, _Proto);

		function Button(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.value = false;
			_this.values = o.value || _this.txt;
			_this.onName = o.onName || '';
			_this.on = false;
			if (typeof _this.values === 'string') _this.values = [_this.values]; //this.selected = null;

			_this.isDown = false;
			_this.isLink = o.link || false; // custom color

			_this.cc = [_this.colors.button, _this.colors.select, _this.colors.down];
			if (o.cBg !== undefined) _this.cc[0] = o.cBg;
			if (o.bColor !== undefined) _this.cc[0] = o.bColor;
			if (o.cSelect !== undefined) _this.cc[1] = o.cSelect;
			if (o.cDown !== undefined) _this.cc[2] = o.cDown;
			_this.isLoadButton = o.loader || false;
			_this.isDragButton = o.drag || false;
			if (_this.isDragButton) _this.isLoadButton = true;
			_this.lng = _this.values.length;
			_this.tmp = [];
			_this.stat = [];

			for (var i = 0; i < _this.lng; i++) {
				_this.c[i + 2] = _this.dom('div', _this.css.txt + _this.css.button + 'top:1px; background:' + _this.cc[0] + '; height:' + (_this.h - 2) + 'px; border:' + _this.colors.buttonBorder + '; border-radius:' + _this.radius + 'px;');
				_this.c[i + 2].style.color = _this.fontColor;
				_this.c[i + 2].innerHTML = _this.values[i];
				_this.stat[i] = 1;
			}

			if (_this.c[1] !== undefined) _this.c[1].textContent = '';
			if (_this.isLoadButton) _this.initLoader();

			if (_this.isDragButton) {
				_this.lng++;

				_this.initDrager();
			}

			_this.init();

			return _this;
		}

		var _proto = Button.prototype;

		_proto.onOff = function onOff() {
			this.on = !this.on;
			this.c[2].innerHTML = this.on ? this.onName : this.values[0];
		};

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			var i = this.lng;
			var t = this.tmp;

			while (i--) {
				if (l.x > t[i][0] && l.x < t[i][2]) return i + 2;
			}

			return '';
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.click = function click(e) {
			if (this.onName !== '') this.onOff();

			if (this.isLink) {
				var name = this.testZone(e);
				if (!name) return false;
				this.value = this.values[name - 2];
				this.send();
				return this.reset();
			}
		};

		_proto.mouseup = function mouseup(e) {
			if (this.isDown) {
				this.value = false;
				this.isDown = false; //this.send();

				return this.mousemove(e);
			}

			return false;
		};

		_proto.mousedown = function mousedown(e) {
			if (this.isLink) return false;
			var name = this.testZone(e);
			if (!name) return false;
			this.isDown = true;
			this.value = this.values[name - 2];
			if (!this.isLoadButton) this.send(); //else this.fileSelect( e.target.files[0] );

			return this.mousemove(e); // true;
		};

		_proto.mousemove = function mousemove(e) {
			var up = false;
			var name = this.testZone(e); // console.log(name)

			if (name !== '') {
				this.cursor('pointer');
				up = this.modes(this.isDown ? 3 : 2, name);
			} else {
				up = this.reset();
			} //console.log(up)


			return up;
		} // ----------------------
		;

		_proto.modes = function modes(n, name) {
			var v,
					r = false;

			for (var i = 0; i < this.lng; i++) {
				if (i === name - 2) v = this.mode(n, i + 2);else v = this.mode(1, i + 2);
				if (v) r = true;
			}

			return r;
		};

		_proto.mode = function mode(n, name) {
			var change = false;
			var i = name - 2;

			if (this.stat[i] !== n) {
				switch (n) {
					case 1:
						this.stat[i] = 1;
						this.s[i + 2].color = this.fontColor;
						this.s[i + 2].background = this.cc[0];
						break;

					case 2:
						this.stat[i] = 2;
						this.s[i + 2].color = this.fontSelect;
						this.s[i + 2].background = this.cc[1];
						break;

					case 3:
						this.stat[i] = 3;
						this.s[i + 2].color = this.fontSelect;
						this.s[i + 2].background = this.cc[2];
						break;
				}

				change = true;
			}

			return change;
		} // ----------------------
		;

		_proto.reset = function reset() {
			this.cursor();
			/*let v, r = false;
				for( let i = 0; i < this.lng; i++ ){
					v = this.mode( 1, i+2 );
					if(v) r = true;
			}*/

			return this.modes(1, 2);
			/*if( this.selected ){
				this.s[ this.selected ].color = this.fontColor;
						 this.s[ this.selected ].background = this.buttonColor;
						 this.selected = null;
						 
						 return true;
			}
				 return false;*/
		} // ----------------------
		;

		_proto.dragover = function dragover(e) {
			e.preventDefault();
			this.s[4].borderColor = this.colors.select;
			this.s[4].color = this.colors.select;
		};

		_proto.dragend = function dragend(e) {
			e.preventDefault();
			this.s[4].borderColor = this.fontColor;
			this.s[4].color = this.fontColor;
		};

		_proto.drop = function drop(e) {
			e.preventDefault();
			this.dragend(e);
			this.fileSelect(e.dataTransfer.files[0]);
		};

		_proto.initDrager = function initDrager() {
			this.c[4] = this.dom('div', this.css.txt + ' text-align:center; line-height:' + (this.h - 8) + 'px; border:1px dashed ' + this.fontColor + '; top:2px;	height:' + (this.h - 4) + 'px; border-radius:' + this.radius + 'px; pointer-events:auto;'); // cursor:default;

			this.c[4].textContent = 'DRAG';
			this.c[4].addEventListener('dragover', function (e) {
				this.dragover(e);
			}.bind(this), false);
			this.c[4].addEventListener('dragend', function (e) {
				this.dragend(e);
			}.bind(this), false);
			this.c[4].addEventListener('dragleave', function (e) {
				this.dragend(e);
			}.bind(this), false);
			this.c[4].addEventListener('drop', function (e) {
				this.drop(e);
			}.bind(this), false); //this.c[2].events = [	];
			//this.c[4].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];
		};

		_proto.initLoader = function initLoader() {
			this.c[3] = this.dom('input', this.css.basic + 'top:0px; opacity:0; height:' + this.h + 'px; pointer-events:auto; cursor:pointer;'); //

			this.c[3].name = 'loader';
			this.c[3].type = "file";
			this.c[3].addEventListener('change', function (e) {
				this.fileSelect(e.target.files[0]);
			}.bind(this), false); //this.c[3].addEventListener( 'mousedown', function(e){	}.bind(this), false );
			//this.c[2].events = [	];
			//this.c[3].events = [ 'change', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];
			//this.hide = document.createElement('input');
		};

		_proto.fileSelect = function fileSelect(file) {
			var dataUrl = ['png', 'jpg', 'mp4', 'webm', 'ogg'];
			var dataBuf = ['sea', 'z', 'hex', 'bvh', 'BVH', 'glb']; //if( ! e.target.files ) return;
			//let file = e.target.files[0];
			//this.c[3].type = "null";
			// console.log( this.c[4] )

			if (file === undefined) return;
			var reader = new FileReader();
			var fname = file.name;
			var type = fname.substring(fname.lastIndexOf('.') + 1, fname.length);
			if (dataUrl.indexOf(type) !== -1) reader.readAsDataURL(file);else if (dataBuf.indexOf(type) !== -1) reader.readAsArrayBuffer(file); //reader.readAsArrayBuffer( file );
			else reader.readAsText(file); // if( type === 'png' || type === 'jpg' || type === 'mp4' || type === 'webm' || type === 'ogg' ) reader.readAsDataURL( file );
			//else if( type === 'z' ) reader.readAsBinaryString( file );
			//else if( type === 'sea' || type === 'bvh' || type === 'BVH' || type === 'z') reader.readAsArrayBuffer( file );
			//else if(	) reader.readAsArrayBuffer( file );
			//else reader.readAsText( file );

			reader.onload = function (e) {
				if (this.callback) this.callback(e.target.result, fname, type); //this.c[3].type = "file";
				//this.send( e.target.result ); 
			}.bind(this);
		};

		_proto.label = function label(string, n) {
			n = n || 2;
			this.c[n].textContent = string;
		};

		_proto.icon = function icon(string, y, n) {
			n = n || 2;
			this.s[n].padding = (y || 0) + 'px 0px';
			this.c[n].innerHTML = string;
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			var s = this.s;
			var w = this.sb;
			var d = this.sa;
			var i = this.lng;
			var dc = 3;
			var size = Math.floor((w - dc * (i - 1)) / i);

			while (i--) {
				this.tmp[i] = [Math.floor(d + size * i + dc * i), size];
				this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
				s[i + 2].left = this.tmp[i][0] + 'px';
				s[i + 2].width = this.tmp[i][1] + 'px';
			}

			if (this.isDragButton) {
				s[4].left = d + size + dc + 'px';
				s[4].width = size + 'px';
			}

			if (this.isLoadButton) {
				s[3].left = d + 'px';
				s[3].width = size + 'px';
			}
		};

		return Button;
	}(Proto);

	var Circular = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Circular, _Proto);

		function Circular(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.autoWidth = false;
			_this.buttonColor = _this.colors.button;

			_this.setTypeNumber(o);

			_this.radius = _this.w * 0.5; //Math.floor((this.w-20)*0.5);

			_this.twoPi = Math.PI * 2;
			_this.pi90 = Math.PI * 0.5;
			_this.offset = new V2();
			_this.h = o.h || _this.w + 10;
			_this.top = 0;
			_this.c[0].style.width = _this.w + 'px';

			if (_this.c[1] !== undefined) {
				_this.c[1].style.width = _this.w + 'px';
				_this.c[1].style.textAlign = 'center';
				_this.top = 10;
				_this.h += 10;
			}

			_this.percent = 0;
			_this.cmode = 0;
			_this.c[2] = _this.dom('div', _this.css.txt + 'text-align:center; top:' + (_this.h - 20) + 'px; width:' + _this.w + 'px; color:' + _this.fontColor);
			_this.c[3] = _this.getCircular();

			_this.setSvg(_this.c[3], 'd', _this.makePath(), 1);

			_this.setSvg(_this.c[3], 'stroke', _this.fontColor, 1);

			_this.setSvg(_this.c[3], 'viewBox', '0 0 ' + _this.w + ' ' + _this.w);

			_this.setCss(_this.c[3], {
				width: _this.w,
				height: _this.w,
				left: 0,
				top: _this.top
			});

			_this.init();

			_this.update();

			return _this;
		}

		var _proto = Circular.prototype;

		_proto.mode = function mode(_mode) {
			if (this.cmode === _mode) return false;

			switch (_mode) {
				case 0:
					// base
					this.s[2].color = this.fontColor;
					this.setSvg(this.c[3], 'stroke', 'rgba(0,0,0,0.1)', 0);
					this.setSvg(this.c[3], 'stroke', this.fontColor, 1);
					break;

				case 1:
					// over
					this.s[2].color = this.colorPlus;
					this.setSvg(this.c[3], 'stroke', 'rgba(0,0,0,0.3)', 0);
					this.setSvg(this.c[3], 'stroke', this.colorPlus, 1);
					break;
			}

			this.cmode = _mode;
			return true;
		};

		_proto.reset = function reset() {
			this.isDown = false;
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			this.isDown = false;
			this.sendEnd();
			return this.mode(0);
		};

		_proto.mousedown = function mousedown(e) {
			this.isDown = true;
			this.old = this.value;
			this.oldr = null;
			this.mousemove(e);
			return this.mode(1);
		};

		_proto.mousemove = function mousemove(e) {
			//this.mode(1);
			if (!this.isDown) return;
			var off = this.offset;
			off.x = this.radius - (e.clientX - this.zone.x);
			off.y = this.radius - (e.clientY - this.zone.y - this.top);
			this.r = off.angle() - this.pi90;
			this.r = (this.r % this.twoPi + this.twoPi) % this.twoPi;

			if (this.oldr !== null) {
				var dif = this.r - this.oldr;
				this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;
				if (dif > 6) this.r = 0;
				if (dif < -6) this.r = this.twoPi;
			}

			var steps = 1 / this.twoPi;
			var value = this.r * steps;
			var n = this.range * value + this.min - this.old;

			if (n >= this.step || n <= this.step) {
				n = ~~(n / this.step);
				this.value = this.numValue(this.old + n * this.step);
				this.update(true);
				this.old = this.value;
				this.oldr = this.r;
			}
		} // ----------------------
		;

		_proto.makePath = function makePath() {
			var r = 40;
			var d = 24;
			var a = this.percent * this.twoPi - 0.001;
			var x2 = r + r * Math.sin(a) + d;
			var y2 = r - r * Math.cos(a) + d;
			var big = a > Math.PI ? 1 : 0;
			return "M " + (r + d) + "," + d + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2;
		};

		_proto.update = function update(up) {
			this.c[2].textContent = this.value;
			this.percent = (this.value - this.min) / this.range;
			this.setSvg(this.c[3], 'd', this.makePath(), 1);
			if (up) this.send();
		};

		return Circular;
	}(Proto);

	var Color = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Color, _Proto);

		function Color(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this; //this.autoHeight = true;

			_this.ctype = o.ctype || 'hex';
			_this.wfixe = 256;
			_this.cw = _this.sb > 256 ? 256 : _this.sb;
			if (o.cw != undefined) _this.cw = o.cw; // color up or down

			_this.side = o.side || 'down';
			_this.up = _this.side === 'down' ? 0 : 1;
			_this.baseH = _this.h;
			_this.offset = new V2();
			_this.decal = new V2();
			_this.pp = new V2();
			_this.c[2] = _this.dom('div', _this.css.txt + 'height:' + (_this.h - 4) + 'px;' + 'border-radius:' + _this.radius + 'px; line-height:' + (_this.h - 8) + 'px;');
			_this.s[2] = _this.c[2].style;

			if (_this.up) {
				_this.s[2].top = 'auto';
				_this.s[2].bottom = '2px';
			}

			_this.c[3] = _this.getColorRing();
			_this.c[3].style.visibility = 'hidden';
			_this.hsl = null;
			_this.value = '#ffffff';

			if (o.value !== undefined) {
				if (o.value instanceof Array) _this.value = Tools.rgbToHex(o.value);else if (!isNaN(o.value)) _this.value = Tools.hexToHtml(o.value);else _this.value = o.value;
			}

			_this.bcolor = null;
			_this.isDown = false;
			_this.fistDown = false;
			_this.tr = 98;
			_this.tsl = Math.sqrt(3) * _this.tr;
			_this.hue = 0;
			_this.d = 256;

			_this.setColor(_this.value);

			_this.init();

			if (o.open !== undefined) _this.open();
			return _this;
		}

		var _proto = Color.prototype;

		_proto.testZone = function testZone(mx, my) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';

			if (this.up && this.isOpen) {
				if (l.y > this.wfixe) return 'title';else return 'color';
			} else {
				if (l.y < this.baseH + 2) return 'title';else if (this.isOpen) return 'color';
			}
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			this.isDown = false;
			this.d = 256;
		};

		_proto.mousedown = function mousedown(e) {
			var name = this.testZone(e.clientX, e.clientY); //if( !name ) return;

			if (name === 'title') {
				if (!this.isOpen) this.open();else this.close();
				return true;
			}

			if (name === 'color') {
				this.isDown = true;
				this.fistDown = true;
				this.mousemove(e);
			}
		};

		_proto.mousemove = function mousemove(e) {
			var name = this.testZone(e.clientX, e.clientY);
			var off,
					d,
					hue,
					sat,
					lum,
					rad,
					x,
					y,
					rr,
					T = Tools;
			if (name === 'title') this.cursor('pointer');

			if (name === 'color') {
				off = this.offset;
				off.x = e.clientX - (this.zone.x + this.decal.x + this.mid);
				off.y = e.clientY - (this.zone.y + this.decal.y + this.mid);
				d = off.length() * this.ratio;
				rr = off.angle();
				if (rr < 0) rr += 2 * T.PI;
				if (d < 128) this.cursor('crosshair');else if (!this.isDown) this.cursor();

				if (this.isDown) {
					if (this.fistDown) {
						this.d = d;
						this.fistDown = false;
					}

					if (this.d < 128) {
						if (this.d > this.tr) {
							// outside hue
							hue = (rr + T.pi90) / T.TwoPI;
							this.hue = (hue + 1) % 1;
							this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);
						} else {
							// triangle
							x = off.x * this.ratio;
							y = off.y * this.ratio;

							var _rr = this.hue * T.TwoPI + T.PI;

							if (_rr < 0) _rr += 2 * T.PI;
							rad = Math.atan2(-y, x);
							if (rad < 0) rad += 2 * T.PI;
							var rad0 = (rad + T.pi90 + T.TwoPI + _rr) % T.TwoPI,
									rad1 = rad0 % (2 / 3 * T.PI) - T.pi60,
									a = 0.5 * this.tr,
									b = Math.tan(rad1) * a,
									r = Math.sqrt(x * x + y * y),
									maxR = Math.sqrt(a * a + b * b);

							if (r > maxR) {
								var dx = Math.tan(rad1) * r;
								var rad2 = Math.atan(dx / maxR);
								if (rad2 > T.pi60) rad2 = T.pi60;else if (rad2 < -T.pi60) rad2 = -T.pi60;
								rad += rad2 - rad1;
								rad0 = (rad + T.pi90 + T.TwoPI + _rr) % T.TwoPI, rad1 = rad0 % (2 / 3 * T.PI) - T.pi60;
								b = Math.tan(rad1) * a;
								r = maxR = Math.sqrt(a * a + b * b);
							}

							lum = Math.sin(rad0) * r / this.tsl + 0.5;
							var w = 1 - Math.abs(lum - 0.5) * 2;
							sat = (Math.cos(rad0) * r + this.tr / 2) / (1.5 * this.tr) / w;
							sat = T.clamp(sat, 0, 1);
							this.setHSL([this.hsl[0], sat, lum]);
						}
					}
				}
			}
		} // ----------------------
		;

		_proto.setHeight = function setHeight() {
			this.h = this.isOpen ? this.wfixe + this.baseH + 5 : this.baseH;
			this.s[0].height = this.h + 'px';
			this.zone.h = this.h;
		};

		_proto.parentHeight = function parentHeight(t) {
			if (this.group !== null) this.group.calc(t);else if (this.isUI) this.main.calc(t);
		};

		_proto.open = function open() {
			_Proto.prototype.open.call(this);

			this.setHeight();
			if (this.up) this.zone.y -= this.wfixe + 5;
			var t = this.h - this.baseH;
			this.s[3].visibility = 'visible'; //this.s[3].display = 'block';

			this.parentHeight(t);
		};

		_proto.close = function close() {
			_Proto.prototype.close.call(this);

			if (this.up) this.zone.y += this.wfixe + 5;
			var t = this.h - this.baseH;
			this.setHeight();
			this.s[3].visibility = 'hidden'; //this.s[3].display = 'none';

			this.parentHeight(-t);
		};

		_proto.update = function update(up) {
			var cc = Tools.rgbToHex(Tools.hslToRgb([this.hsl[0], 1, 0.5]));
			this.moveMarkers();
			this.value = this.bcolor;
			this.setSvg(this.c[3], 'fill', cc, 2, 0);
			this.s[2].background = this.bcolor;
			this.c[2].textContent = Tools.htmlToHex(this.bcolor);
			this.invert = Tools.findDeepInver(this.rgb);
			this.s[2].color = this.invert ? '#fff' : '#000';
			if (!up) return;
			if (this.ctype === 'array') this.send(this.rgb);
			if (this.ctype === 'rgb') this.send(Tools.htmlRgb(this.rgb));
			if (this.ctype === 'hex') this.send(Tools.htmlToHex(this.value));
			if (this.ctype === 'html') this.send();
		};

		_proto.setColor = function setColor(color) {
			var unpack = Tools.unpack(color);

			if (this.bcolor != color && unpack) {
				this.bcolor = color;
				this.rgb = unpack;
				this.hsl = Tools.rgbToHsl(this.rgb);
				this.hue = this.hsl[0];
				this.update();
			}

			return this;
		};

		_proto.setHSL = function setHSL(hsl) {
			this.hsl = hsl;
			this.rgb = Tools.hslToRgb(hsl);
			this.bcolor = Tools.rgbToHex(this.rgb);
			this.update(true);
			return this;
		};

		_proto.moveMarkers = function moveMarkers() {
			var p = this.pp;
			var T = Tools;
			this.invert ? '#fff' : '#000';
			var a = this.hsl[0] * T.TwoPI;
			var third = 2 / 3 * T.PI;
			var r = this.tr;
			var h = this.hsl[0];
			var s = this.hsl[1];
			var l = this.hsl[2];
			var angle = (a - T.pi90) * T.todeg;
			h = -a + T.pi90;
			var hx = Math.cos(h) * r;
			var hy = -Math.sin(h) * r;
			var sx = Math.cos(h - third) * r;
			var sy = -Math.sin(h - third) * r;
			var vx = Math.cos(h + third) * r;
			var vy = -Math.sin(h + third) * r;
			var mx = (sx + vx) / 2,
					my = (sy + vy) / 2;
			a = (1 - 2 * Math.abs(l - .5)) * s;
			var x = sx + (vx - sx) * l + (hx - mx) * a;
			var y = sy + (vy - sy) * l + (hy - my) * a;
			p.set(x, y).addScalar(128); //let ff = (1-l)*255;
			// this.setSvg( this.c[3], 'stroke', 'rgb('+ff+','+ff+','+ff+')', 3 );

			this.setSvg(this.c[3], 'transform', 'rotate(' + angle + ' )', 2);
			this.setSvg(this.c[3], 'cx', p.x, 3);
			this.setSvg(this.c[3], 'cy', p.y, 3);
			this.setSvg(this.c[3], 'stroke', this.invert ? '#fff' : '#000', 2, 3);
			this.setSvg(this.c[3], 'stroke', this.invert ? '#fff' : '#000', 3);
			this.setSvg(this.c[3], 'fill', this.bcolor, 3);
		};

		_proto.rSize = function rSize() {
			//Proto.prototype.rSize.call( this );
			_Proto.prototype.rSize.call(this);

			var s = this.s;
			s[2].width = this.sb + 'px';
			s[2].left = this.sa + 'px';
			this.rSizeColor(this.cw);
			this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);
			s[3].left = this.decal.x + 'px';
		};

		_proto.rSizeColor = function rSizeColor(w) {
			if (w === this.wfixe) return;
			this.wfixe = w;
			var s = this.s; //this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);

			this.decal.y = this.side === 'up' ? 2 : this.baseH + 2;
			this.mid = Math.floor(this.wfixe * 0.5);
			this.setSvg(this.c[3], 'viewBox', '0 0 ' + this.wfixe + ' ' + this.wfixe);
			s[3].width = this.wfixe + 'px';
			s[3].height = this.wfixe + 'px'; //s[3].left = this.decal.x + 'px';

			s[3].top = this.decal.y + 'px';
			this.ratio = 256 / this.wfixe;
			this.square = 1 / (60 * (this.wfixe / 256));
			this.setHeight();
		};

		return Color;
	}(Proto);

	var Fps = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Fps, _Proto);

		function Fps(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.round = Math.round; //this.autoHeight = true;

			_this.baseH = _this.h;
			_this.hplus = o.hplus || 50;
			_this.res = o.res || 40;
			_this.l = 1;
			_this.precision = o.precision || 0;
			_this.custom = o.custom || false;
			_this.names = o.names || ['FPS', 'MS'];
			var cc = o.cc || ['220,220,220', '255,255,0']; // this.divid = [ 100, 100, 100 ];
			// this.multy = [ 30, 30, 30 ];

			_this.adding = o.adding || false;
			_this.range = o.range || [165, 100, 100];
			_this.alpha = o.alpha || 0.25;
			_this.values = [];
			_this.points = [];
			_this.textDisplay = [];

			if (!_this.custom) {
				_this.now = self.performance && self.performance.now ? self.performance.now.bind(performance) : Date.now;
				_this.startTime = 0; //this.now()

				_this.prevTime = 0; //this.startTime;

				_this.frames = 0;
				_this.ms = 0;
				_this.fps = 0;
				_this.mem = 0;
				_this.mm = 0;
				_this.isMem = self.performance && self.performance.memory ? true : false; // this.divid = [ 100, 200, 1 ];
				// this.multy = [ 30, 30, 30 ];

				if (_this.isMem) {
					_this.names.push('MEM');

					cc.push('0,255,255');
				}

				_this.txt = o.name || 'Fps';
			}

			var fltop = Math.floor(_this.h * 0.5) - 6;
			_this.c[1].textContent = _this.txt;
			_this.c[0].style.cursor = 'pointer';
			_this.c[0].style.pointerEvents = 'auto';
			var panelCss = 'display:none; left:10px; top:' + _this.h + 'px; height:' + (_this.hplus - 8) + 'px; box-sizing:border-box; background: rgba(0, 0, 0, 0.2); border:' + (_this.colors.groupBorder !== 'none' ? _this.colors.groupBorder + ';' : '1px solid rgba(255, 255, 255, 0.2);');
			if (_this.radius !== 0) panelCss += 'border-radius:' + _this.radius + 'px;';
			_this.c[2] = _this.dom('path', _this.css.basic + panelCss, {});

			_this.c[2].setAttribute('viewBox', '0 0 ' + _this.res + ' 50');

			_this.c[2].setAttribute('height', '100%');

			_this.c[2].setAttribute('width', '100%');

			_this.c[2].setAttribute('preserveAspectRatio', 'none'); //this.dom( 'path', null, { fill:'rgba(255,255,0,0.3)', 'stroke-width':1, stroke:'#FF0', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
			//this.dom( 'path', null, { fill:'rgba(0,255,255,0.3)', 'stroke-width':1, stroke:'#0FF', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
			// arrow


			_this.c[3] = _this.dom('path', _this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:' + fltop + 'px;', {
				d: _this.svgs.arrow,
				fill: _this.fontColor,
				stroke: 'none'
			}); // result test

			_this.c[4] = _this.dom('div', _this.css.txt + 'position:absolute; left:10px; top:' + (_this.h + 2) + 'px; display:none; width:100%; text-align:center;'); // bottom line

			if (o.bottomLine) _this.c[4] = _this.dom('div', _this.css.basic + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');
			_this.isShow = false;
			var s = _this.s;
			s[1].marginLeft = '10px';
			s[1].lineHeight = _this.h - 4;
			s[1].color = _this.fontColor;
			s[1].fontWeight = 'bold';
			if (_this.radius !== 0) s[0].borderRadius = _this.radius + 'px';
			s[0].border = _this.colors.groupBorder;
			var j = 0;

			for (j = 0; j < _this.names.length; j++) {
				var base = [];
				var i = _this.res + 1;

				while (i--) {
					base.push(50);
				}

				_this.range[j] = 1 / _this.range[j] * 49;

				_this.points.push(base);

				_this.values.push(0); //	this.dom( 'path', null, { fill:'rgba('+cc[j]+',0.5)', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );


				_this.textDisplay.push("<span style='color:rgb(" + cc[j] + ")'> " + _this.names[j] + " ");
			}

			j = _this.names.length;

			while (j--) {
				_this.dom('path', null, {
					fill: 'rgba(' + cc[j] + ',' + _this.alpha + ')',
					'stroke-width': 1,
					stroke: 'rgba(' + cc[j] + ',1)',
					'vector-effect': 'non-scaling-stroke'
				}, _this.c[2]);
			}

			_this.init(); //if( this.isShow ) this.show();


			return _this;
		} // ----------------------
		//	 EVENTS
		// ----------------------


		var _proto = Fps.prototype;

		_proto.mousedown = function mousedown(e) {
			if (this.isShow) this.close();else this.open();
		} // ----------------------

		/*mode: function ( mode ) {
					let s = this.s;
					switch(mode){
						case 0: // base
								s[1].color = this.fontColor;
								//s[1].background = 'none';
						break;
						case 1: // over
								s[1].color = '#FFF';
								//s[1].background = UIL.SELECT;
						break;
						case 2: // edit / down
								s[1].color = this.fontColor;
								//s[1].background = UIL.SELECTDOWN;
						break;
					}
		},*/
		;

		_proto.tick = function tick(v) {
			this.values = v;
			if (!this.isShow) return;
			this.drawGraph();
			this.upText();
		};

		_proto.makePath = function makePath(point) {
			var p = '';
			p += 'M ' + -1 + ' ' + 50;

			for (var i = 0; i < this.res + 1; i++) {
				p += ' L ' + i + ' ' + point[i];
			}

			p += ' L ' + (this.res + 1) + ' ' + 50;
			return p;
		};

		_proto.upText = function upText(val) {
			var v = val || this.values,
					t = '';

			for (var j = 0, lng = this.names.length; j < lng; j++) {
				t += this.textDisplay[j] + v[j].toFixed(this.precision) + '</span>';
			}

			this.c[4].innerHTML = t;
		};

		_proto.drawGraph = function drawGraph() {
			var svg = this.c[2];
			var i = this.names.length,
					v,
					old = 0,
					n = 0;

			while (i--) {
				if (this.adding) v = (this.values[n] + old) * this.range[n];else v = this.values[n] * this.range[n];
				this.points[n].shift();
				this.points[n].push(50 - v);
				this.setSvg(svg, 'd', this.makePath(this.points[n]), i + 1);
				old += this.values[n];
				n++;
			}
		};

		_proto.open = function open() {
			_Proto.prototype.open.call(this);

			this.h = this.hplus + this.baseH;
			this.setSvg(this.c[3], 'd', this.svgs.arrowDown);

			if (this.group !== null) {
				this.group.calc(this.hplus);
			} else if (this.isUI) this.main.calc(this.hplus);

			this.s[0].height = this.h + 'px';
			this.s[2].display = 'block';
			this.s[4].display = 'block';
			this.isShow = true;
			if (!this.custom) Roots.addListen(this);
		};

		_proto.close = function close() {
			_Proto.prototype.close.call(this);

			this.h = this.baseH;
			this.setSvg(this.c[3], 'd', this.svgs.arrow);

			if (this.group !== null) {
				this.group.calc(-this.hplus);
			} else if (this.isUI) this.main.calc(-this.hplus);

			this.s[0].height = this.h + 'px';
			this.s[2].display = 'none';
			this.s[4].display = 'none';
			this.isShow = false;
			if (!this.custom) Roots.removeListen(this);
			this.c[4].innerHTML = '';
		} ///// AUTO FPS //////
		;

		_proto.begin = function begin() {
			this.startTime = this.now();
		};

		_proto.end = function end() {
			var time = this.now();
			this.ms = time - this.startTime;
			this.frames++;

			if (time > this.prevTime + 1000) {
				this.fps = this.round(this.frames * 1000 / (time - this.prevTime));
				this.prevTime = time;
				this.frames = 0;

				if (this.isMem) {
					var heapSize = performance.memory.usedJSHeapSize;
					var heapSizeLimit = performance.memory.jsHeapSizeLimit;
					this.mem = this.round(heapSize * 0.000000954);
					this.mm = heapSize / heapSizeLimit;
				}
			}

			this.values = [this.fps, this.ms, this.mm];
			this.drawGraph();
			this.upText([this.fps, this.ms, this.mem]);
			return time;
		};

		_proto.listening = function listening() {
			if (!this.custom) this.startTime = this.end();
		};

		_proto.rSize = function rSize() {
			var s = this.s;
			var w = this.w;
			s[0].width = w + 'px';
			s[1].width = w + 'px';
			s[2].left = 10 + 'px';
			s[2].width = w - 20 + 'px';
			s[4].width = w - 20 + 'px';
		};

		return Fps;
	}(Proto);

	var Graph = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Graph, _Proto);

		function Graph(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.value = o.value !== undefined ? o.value : [0, 0, 0];
			_this.lng = _this.value.length;
			_this.precision = o.precision !== undefined ? o.precision : 2;
			_this.multiplicator = o.multiplicator || 1;
			_this.neg = o.neg || false;
			_this.line = o.line !== undefined ? o.line : true; //if(this.neg)this.multiplicator*=2;

			_this.autoWidth = o.autoWidth !== undefined ? o.autoWidth : true;
			_this.isNumber = false;
			_this.isDown = false;
			_this.h = o.h || 128 + 10;
			_this.rh = _this.h - 10;
			_this.top = 0;
			_this.c[0].style.width = _this.w + 'px';

			if (_this.c[1] !== undefined) {
				// with title
				_this.c[1].style.width = _this.w + 'px'; //this.c[1].style.background = '#ff0000';
				//this.c[1].style.textAlign = 'center';

				_this.top = 10;
				_this.h += 10;
			}

			_this.gh = _this.rh - 28;
			_this.gw = _this.w - 28;
			_this.c[2] = _this.dom('div', _this.css.txt + 'text-align:center; top:' + (_this.h - 20) + 'px; width:' + _this.w + 'px; color:' + _this.fontColor);
			_this.c[2].textContent = _this.value;

			var svg = _this.dom('svg', _this.css.basic, {
				viewBox: '0 0 ' + _this.w + ' ' + _this.rh,
				width: _this.w,
				height: _this.rh,
				preserveAspectRatio: 'none'
			});

			_this.setCss(svg, {
				width: _this.w,
				height: _this.rh,
				left: 0,
				top: _this.top
			});

			_this.dom('path', '', {
				d: '',
				stroke: _this.colors.text,
				'stroke-width': 2,
				fill: 'none',
				'stroke-linecap': 'butt'
			}, svg);

			_this.dom('rect', '', {
				x: 10,
				y: 10,
				width: _this.gw + 8,
				height: _this.gh + 8,
				stroke: 'rgba(0,0,0,0.3)',
				'stroke-width': 1,
				fill: 'none'
			}, svg);

			_this.iw = (_this.gw - 4 * (_this.lng - 1)) / _this.lng;
			var t = [];
			_this.cMode = [];
			_this.v = [];

			for (var i = 0; i < _this.lng; i++) {
				t[i] = [14 + i * _this.iw + i * 4, _this.iw];
				t[i][2] = t[i][0] + t[i][1];
				_this.cMode[i] = 0;
				if (_this.neg) _this.v[i] = (1 + _this.value[i] / _this.multiplicator) * 0.5;else _this.v[i] = _this.value[i] / _this.multiplicator;

				_this.dom('rect', '', {
					x: t[i][0],
					y: 14,
					width: t[i][1],
					height: 1,
					fill: _this.fontColor,
					'fill-opacity': 0.3
				}, svg);
			}

			_this.tmp = t;
			_this.c[3] = svg; //console.log(this.w)

			_this.init();

			if (_this.c[1] !== undefined) {
				_this.c[1].style.top = 0 + 'px';
				_this.c[1].style.height = 20 + 'px';
				_this.s[1].lineHeight = 20 - 5 + 'px';
			}

			_this.update(false);

			return _this;
		}

		var _proto = Graph.prototype;

		_proto.updateSVG = function updateSVG() {
			if (this.line) this.setSvg(this.c[3], 'd', this.makePath(), 0);

			for (var i = 0; i < this.lng; i++) {
				this.setSvg(this.c[3], 'height', this.v[i] * this.gh, i + 2);
				this.setSvg(this.c[3], 'y', 14 + (this.gh - this.v[i] * this.gh), i + 2);
				if (this.neg) this.value[i] = ((this.v[i] * 2 - 1) * this.multiplicator).toFixed(this.precision) * 1;else this.value[i] = (this.v[i] * this.multiplicator).toFixed(this.precision) * 1;
			}

			this.c[2].textContent = this.value;
		};

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			var i = this.lng;
			var t = this.tmp;

			if (l.y > this.top && l.y < this.h - 20) {
				while (i--) {
					if (l.x > t[i][0] && l.x < t[i][2]) return i;
				}
			}

			return '';
		};

		_proto.mode = function mode(n, name) {
			if (n === this.cMode[name]) return false;
			var a;

			switch (n) {
				case 0:
					a = 0.3;
					break;

				case 1:
					a = 0.6;
					break;

				case 2:
					a = 1;
					break;
			}

			this.reset();
			this.setSvg(this.c[3], 'fill-opacity', a, name + 2);
			this.cMode[name] = n;
			return true;
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.reset = function reset() {
			var nup = false; //this.isDown = false;

			var i = this.lng;

			while (i--) {
				if (this.cMode[i] !== 0) {
					this.cMode[i] = 0;
					this.setSvg(this.c[3], 'fill-opacity', 0.3, i + 2);
					nup = true;
				}
			}

			return nup;
		};

		_proto.mouseup = function mouseup(e) {
			this.isDown = false;
			if (this.current !== -1) return this.reset();
		};

		_proto.mousedown = function mousedown(e) {
			this.isDown = true;
			return this.mousemove(e);
		};

		_proto.mousemove = function mousemove(e) {
			var nup = false;
			var name = this.testZone(e);

			if (name === '') {
				nup = this.reset(); //this.cursor();
			} else {
				nup = this.mode(this.isDown ? 2 : 1, name); //this.cursor( this.current !== -1 ? 'move' : 'pointer' );

				if (this.isDown) {
					this.v[name] = this.clamp(1 - (e.clientY - this.zone.y - this.top - 10) / this.gh, 0, 1);
					this.update(true);
				}
			}

			return nup;
		} // ----------------------
		;

		_proto.update = function update(up) {
			this.updateSVG();
			if (up) this.send();
		};

		_proto.makePath = function makePath() {
			var p = "",
					h,
					w,
					wn,
					wm,
					ow,
					oh; //let g = this.iw*0.5

			for (var i = 0; i < this.lng; i++) {
				h = 14 + (this.gh - this.v[i] * this.gh);
				w = 14 + i * this.iw + i * 4;
				wm = w + this.iw * 0.5;
				wn = w + this.iw;
				if (i === 0) p += 'M ' + w + ' ' + h + ' T ' + wm + ' ' + h;else p += ' C ' + ow + ' ' + oh + ',' + w + ' ' + h + ',' + wm + ' ' + h;
				if (i === this.lng - 1) p += ' T ' + wn + ' ' + h;
				ow = wn;
				oh = h;
			}

			return p;
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			var s = this.s;
			if (this.c[1] !== undefined) s[1].width = this.w + 'px';
			s[2].width = this.w + 'px';
			s[3].width = this.w + 'px';
			var gw = this.w - 28;
			var iw = (gw - 4 * (this.lng - 1)) / this.lng;
			var t = [];

			for (var i = 0; i < this.lng; i++) {
				t[i] = [14 + i * iw + i * 4, iw];
				t[i][2] = t[i][0] + t[i][1];
			}

			this.tmp = t;
		};

		return Graph;
	}(Proto);

	var Group = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Group, _Proto);

		function Group(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.ADD = o.add;
			_this.uis = [];
			_this.isEmpty = true;
			_this.autoHeight = true;
			_this.current = -1;
			_this.target = null;
			_this.decal = 0;
			_this.baseH = _this.h;
			var fltop = Math.floor(_this.h * 0.5) - 6;
			_this.isLine = o.line !== undefined ? o.line : false;
			_this.c[2] = _this.dom('div', _this.css.basic + 'width:100%; left:0; height:auto; overflow:hidden; top:' + _this.h + 'px');
			_this.c[3] = _this.dom('path', _this.css.basic + 'position:absolute; width:10px; height:10px; left:0; top:' + fltop + 'px;', {
				d: _this.svgs.group,
				fill: _this.fontColor,
				stroke: 'none'
			});
			_this.c[4] = _this.dom('path', _this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:' + fltop + 'px;', {
				d: _this.svgs.arrow,
				fill: _this.fontColor,
				stroke: 'none'
			}); // bottom line

			if (_this.isLine) _this.c[5] = _this.dom('div', _this.css.basic + 'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');
			var s = _this.s;
			s[0].height = _this.h + 'px';
			s[1].height = _this.h + 'px';
			_this.c[1].name = 'group';
			s[1].marginLeft = '10px';
			s[1].lineHeight = _this.h - 4;
			s[1].color = _this.fontColor;
			s[1].fontWeight = 'bold';
			if (_this.radius !== 0) s[0].borderRadius = _this.radius + 'px';
			s[0].border = _this.colors.groupBorder;

			_this.init(); //if( o.bg !== undefined ) this.setBG(o.bg);


			_this.setBG(_this.bg);

			if (o.open !== undefined) _this.open(); //s[0].background = this.bg;

			return _this;
		}

		var _proto = Group.prototype;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			var name = '';
			if (l.y < this.baseH) name = 'title';else {
				if (this.isOpen) name = 'content';
			}
			return name;
		};

		_proto.clearTarget = function clearTarget() {
			if (this.current === -1) return false; // if(!this.target) return;

			this.target.uiout();
			this.target.reset();
			this.current = -1;
			this.target = null;
			this.cursor();
			return true;
		};

		_proto.reset = function reset() {
			this.clearTarget();
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.handleEvent = function handleEvent(e) {
			var type = e.type;
			var change = false;
			var targetChange = false;
			var name = this.testZone(e);
			if (!name) return;

			switch (name) {
				case 'content':
					this.cursor();
					if (Roots.isMobile && type === 'mousedown') this.getNext(e, change);
					if (this.target) targetChange = this.target.handleEvent(e); //if( type === 'mousemove' ) change = this.styles('def');

					if (!Roots.lock) this.getNext(e, change);
					break;

				case 'title':
					this.cursor('pointer');

					if (type === 'mousedown') {
						if (this.isOpen) this.close();else this.open();
					}

					break;
			}

			if (this.isDown) change = true;
			if (targetChange) change = true;
			return change;
		};

		_proto.getNext = function getNext(e, change) {
			var next = Roots.findTarget(this.uis, e);

			if (next !== this.current) {
				this.clearTarget();
				this.current = next;
			}

			if (next !== -1) {
				this.target = this.uis[this.current];
				this.target.uiover();
			}
		} // ----------------------
		;

		_proto.calcH = function calcH() {
			var lng = this.uis.length,
					i,
					u,
					h = 0,
					px = 0,
					tmph = 0;

			for (i = 0; i < lng; i++) {
				u = this.uis[i];

				if (!u.autoWidth) {
					if (px === 0) h += u.h + 1;else {
						if (tmph < u.h) h += u.h - tmph;
					}
					tmph = u.h; //tmph = tmph < u.h ? u.h : tmph;

					px += u.w;
					if (px + u.w > this.w) px = 0;
				} else h += u.h + 1;
			}

			return h;
		};

		_proto.calcUis = function calcUis() {
			if (!this.isOpen) return;
			Roots.calcUis(this.uis, this.zone, this.zone.y + this.baseH);
		};

		_proto.setBG = function setBG(c) {
			this.s[0].background = c;
			var i = this.uis.length;

			while (i--) {
				this.uis[i].setBG(c);
			}
		};

		_proto.add = function add() {
			var a = arguments;

			if (typeof a[1] === 'object') {
				a[1].isUI = this.isUI;
				a[1].target = this.c[2];
				a[1].main = this.main;
			} else if (typeof arguments[1] === 'string') {
				if (a[2] === undefined) [].push.call(a, {
					isUI: true,
					target: this.c[2],
					main: this.main
				});else {
					a[2].isUI = true;
					a[2].target = this.c[2];
					a[2].main = this.main;
				}
			} //let n = add.apply( this, a );


			var u = this.ADD.apply(this, a);
			this.uis.push(u); //if( u.autoHeight ) u.parentGroup = this;
			//if( u.isGroup ) 

			u.group = this;
			this.isEmpty = false;
			return u;
		} // remove one node
		;

		_proto.remove = function remove(n) {
			if (n.clear) n.clear();
		} // clear all iner 
		;

		_proto.empty = function empty() {
			this.close();
			var i = this.uis.length,
					item;

			while (i--) {
				item = this.uis.pop();
				this.c[2].removeChild(item.c[0]);
				item.clear(true); //this.uis[i].clear()
			}

			this.isEmpty = true;
			this.h = this.baseH;
		} // clear one element
		;

		_proto.clearOne = function clearOne(n) {
			var id = this.uis.indexOf(n);

			if (id !== -1) {
				this.calc(-(this.uis[id].h + 1));
				this.c[2].removeChild(this.uis[id].c[0]);
				this.uis.splice(id, 1);

				if (this.uis.length === 0) {
					this.isEmpty = true;
					this.close();
				}
			}
		};

		_proto.parentHeight = function parentHeight(t) {
			//if ( this.parentGroup !== null ) this.parentGroup.calc( t );
			if (this.group !== null) this.group.calc(t);else if (this.isUI) this.main.calc(t);
		};

		_proto.open = function open() {
			_Proto.prototype.open.call(this);

			this.setSvg(this.c[4], 'd', this.svgs.arrowDown);
			this.rSizeContent();
			var t = this.h - this.baseH;
			this.parentHeight(t); //console.log( this.uis );
		};

		_proto.close = function close() {
			_Proto.prototype.close.call(this);

			var t = this.h - this.baseH;
			this.setSvg(this.c[4], 'd', this.svgs.arrow);
			this.h = this.baseH;
			this.s[0].height = this.h + 'px';
			this.parentHeight(-t); //console.log( this.uis );
		};

		_proto.clear = function clear() {
			this.empty();
			if (this.isUI) this.main.calc(-(this.h + 1));
			Proto.prototype.clear.call(this);
		};

		_proto.clearGroup = function clearGroup() {
			this.empty();
			/*this.close();
				let i = this.uis.length;
			while(i--){
					this.uis[i].clear();	 
			}
			this.uis = [];
			this.h = this.baseH;*/
		};

		_proto.calc = function calc(y) {
			if (!this.isOpen) return;

			if (y !== undefined) {
				this.h += y;
				if (this.isUI) this.main.calc(y);
			} else {
				this.h = this.calcH() + this.baseH;
			}

			this.s[0].height = this.h + 'px'; //if(this.isOpen) this.calcUis();
		};

		_proto.rSizeContent = function rSizeContent() {
			var i = this.uis.length;

			while (i--) {
				this.uis[i].setSize(this.w);
				this.uis[i].rSize();
			}

			this.calc();
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			var s = this.s;
			s[3].left = this.sa + this.sb - 17 + 'px';
			s[1].width = this.w + 'px';
			s[2].width = this.w + 'px';
			if (this.isOpen) this.rSizeContent();
		};

		return Group;
	}(Proto);
	Group.prototype.isGroup = true;

	var Joystick = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Joystick, _Proto);

		function Joystick(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.autoWidth = false;
			_this.value = [0, 0];
			_this.joyType = 'analogique';
			_this.model = o.mode !== undefined ? o.mode : 0;
			_this.precision = o.precision || 2;
			_this.multiplicator = o.multiplicator || 1;
			_this.pos = new V2();
			_this.tmp = new V2();
			_this.interval = null;
			_this.radius = _this.w * 0.5;
			_this.distance = _this.radius * 0.25;
			_this.h = o.h || _this.w + 10;
			_this.top = 0;
			_this.c[0].style.width = _this.w + 'px';

			if (_this.c[1] !== undefined) {
				// with title
				_this.c[1].style.width = _this.w + 'px';
				_this.c[1].style.textAlign = 'center';
				_this.top = 10;
				_this.h += 10;
			}

			_this.c[2] = _this.dom('div', _this.css.txt + 'text-align:center; top:' + (_this.h - 20) + 'px; width:' + _this.w + 'px; color:' + _this.fontColor);
			_this.c[2].textContent = _this.value;
			_this.c[3] = _this.getJoystick(_this.model);

			_this.setSvg(_this.c[3], 'viewBox', '0 0 ' + _this.w + ' ' + _this.w);

			_this.setCss(_this.c[3], {
				width: _this.w,
				height: _this.w,
				left: 0,
				top: _this.top
			});

			_this.ratio = 128 / _this.w;

			_this.init();

			_this.update(false);

			return _this;
		}

		var _proto = Joystick.prototype;

		_proto.mode = function mode(_mode) {
			switch (_mode) {
				case 0:
					// base
					if (this.model === 0) {
						this.setSvg(this.c[3], 'fill', 'url(#gradIn)', 4);
						this.setSvg(this.c[3], 'stroke', '#000', 4);
					} else {
						this.setSvg(this.c[3], 'stroke', 'rgba(100,100,100,0.25)', 2); //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.1)', 3 );

						this.setSvg(this.c[3], 'stroke', '#666', 4);
						this.setSvg(this.c[3], 'fill', 'none', 4);
					}

					break;

				case 1:
					// over
					if (this.model === 0) {
						this.setSvg(this.c[3], 'fill', 'url(#gradIn2)', 4);
						this.setSvg(this.c[3], 'stroke', 'rgba(0,0,0,0)', 4);
					} else {
						this.setSvg(this.c[3], 'stroke', 'rgba(48,138,255,0.25)', 2); //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.3)', 3 );

						this.setSvg(this.c[3], 'stroke', this.colors.select, 4);
						this.setSvg(this.c[3], 'fill', 'rgba(48,138,255,0.25)', 4);
					}

					break;
			}
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.addInterval = function addInterval() {
			if (this.interval !== null) this.stopInterval();
			if (this.pos.isZero()) return;
			this.interval = setInterval(function () {
				this.update();
			}.bind(this), 10);
		};

		_proto.stopInterval = function stopInterval() {
			if (this.interval === null) return;
			clearInterval(this.interval);
			this.interval = null;
		};

		_proto.reset = function reset() {
			this.addInterval();
			this.mode(0);
		};

		_proto.mouseup = function mouseup(e) {
			this.addInterval();
			this.isDown = false;
		};

		_proto.mousedown = function mousedown(e) {
			this.isDown = true;
			this.mousemove(e);
			this.mode(2);
		};

		_proto.mousemove = function mousemove(e) {
			this.mode(1);
			if (!this.isDown) return;
			this.tmp.x = this.radius - (e.clientX - this.zone.x);
			this.tmp.y = this.radius - (e.clientY - this.zone.y - this.top);
			var distance = this.tmp.length();

			if (distance > this.distance) {
				var angle = Math.atan2(this.tmp.x, this.tmp.y);
				this.tmp.x = Math.sin(angle) * this.distance;
				this.tmp.y = Math.cos(angle) * this.distance;
			}

			this.pos.copy(this.tmp).divideScalar(this.distance).negate();
			this.update();
		};

		_proto.setValue = function setValue(v) {
			if (v === undefined) v = [0, 0];
			this.pos.set(v[0] || 0, v[1] || 0);
			this.updateSVG();
		};

		_proto.update = function update(up) {
			if (up === undefined) up = true;

			if (this.interval !== null) {
				if (!this.isDown) {
					this.pos.lerp(null, 0.3);
					this.pos.x = Math.abs(this.pos.x) < 0.01 ? 0 : this.pos.x;
					this.pos.y = Math.abs(this.pos.y) < 0.01 ? 0 : this.pos.y;
					if (this.isUI && this.main.isCanvas) this.main.draw();
				}
			}

			this.updateSVG();
			if (up) this.send();
			if (this.pos.isZero()) this.stopInterval();
		};

		_proto.updateSVG = function updateSVG() {
			var x = this.radius - -this.pos.x * this.distance;
			var y = this.radius - -this.pos.y * this.distance;

			if (this.model === 0) {
				var sx = x + this.pos.x * 5 + 5;
				var sy = y + this.pos.y * 5 + 10;
				this.setSvg(this.c[3], 'cx', sx * this.ratio, 3);
				this.setSvg(this.c[3], 'cy', sy * this.ratio, 3);
			} else {
				this.setSvg(this.c[3], 'cx', x * this.ratio, 3);
				this.setSvg(this.c[3], 'cy', y * this.ratio, 3);
			}

			this.setSvg(this.c[3], 'cx', x * this.ratio, 4);
			this.setSvg(this.c[3], 'cy', y * this.ratio, 4);
			this.value[0] = (this.pos.x * this.multiplicator).toFixed(this.precision) * 1;
			this.value[1] = (this.pos.y * this.multiplicator).toFixed(this.precision) * 1;
			this.c[2].textContent = this.value;
		};

		_proto.clear = function clear() {
			this.stopInterval();

			_Proto.prototype.clear.call(this);
		};

		return Joystick;
	}(Proto);

	var Knob = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Knob, _Proto);

		function Knob(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.autoWidth = false;
			_this.buttonColor = _this.colors.button;

			_this.setTypeNumber(o);

			_this.mPI = Math.PI * 0.8;
			_this.toDeg = 180 / Math.PI;
			_this.cirRange = _this.mPI * 2;
			_this.offset = new V2();
			_this.radius = _this.w * 0.5; //Math.floor((this.w-20)*0.5);
			//this.ww = this.height = this.radius * 2;

			_this.h = o.h || _this.w + 10;
			_this.top = 0;
			_this.c[0].style.width = _this.w + 'px';

			if (_this.c[1] !== undefined) {
				_this.c[1].style.width = _this.w + 'px';
				_this.c[1].style.textAlign = 'center';
				_this.top = 10;
				_this.h += 10;
			}

			_this.percent = 0;
			_this.cmode = 0;
			_this.c[2] = _this.dom('div', _this.css.txt + 'text-align:center; top:' + (_this.h - 20) + 'px; width:' + _this.w + 'px; color:' + _this.fontColor);
			_this.c[3] = _this.getKnob();

			_this.setSvg(_this.c[3], 'stroke', _this.fontColor, 1);

			_this.setSvg(_this.c[3], 'stroke', _this.fontColor, 3);

			_this.setSvg(_this.c[3], 'd', _this.makeGrad(), 3);

			_this.setSvg(_this.c[3], 'viewBox', '0 0 ' + _this.ww + ' ' + _this.ww);

			_this.setCss(_this.c[3], {
				width: _this.w,
				height: _this.w,
				left: 0,
				top: _this.top
			});

			_this.r = 0;

			_this.init();

			_this.update();

			return _this;
		}

		var _proto = Knob.prototype;

		_proto.mode = function mode(_mode) {
			if (this.cmode === _mode) return false;

			switch (_mode) {
				case 0:
					// base
					this.s[2].color = this.fontColor;
					this.setSvg(this.c[3], 'fill', this.colors.button, 0); //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.2)', 2);

					this.setSvg(this.c[3], 'stroke', this.fontColor, 1);
					break;

				case 1:
					// over
					this.s[2].color = this.colorPlus;
					this.setSvg(this.c[3], 'fill', this.colors.select, 0); //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.6)', 2);

					this.setSvg(this.c[3], 'stroke', this.colorPlus, 1);
					break;
			}

			this.cmode = _mode;
			return true;
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			this.isDown = false;
			this.sendEnd();
			return this.mode(0);
		};

		_proto.mousedown = function mousedown(e) {
			this.isDown = true;
			this.old = this.value;
			this.oldr = null;
			this.mousemove(e);
			return this.mode(1);
		};

		_proto.mousemove = function mousemove(e) {
			//this.mode(1);
			if (!this.isDown) return;
			var off = this.offset;
			off.x = this.radius - (e.clientX - this.zone.x);
			off.y = this.radius - (e.clientY - this.zone.y - this.top);
			this.r = -Math.atan2(off.x, off.y);
			if (this.oldr !== null) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;
			this.r = this.r > this.mPI ? this.mPI : this.r;
			this.r = this.r < -this.mPI ? -this.mPI : this.r;
			var steps = 1 / this.cirRange;
			var value = (this.r + this.mPI) * steps;
			var n = this.range * value + this.min - this.old;

			if (n >= this.step || n <= this.step) {
				n = Math.floor(n / this.step);
				this.value = this.numValue(this.old + n * this.step);
				this.update(true);
				this.old = this.value;
				this.oldr = this.r;
			}
		};

		_proto.makeGrad = function makeGrad() {
			var d = '',
					step,
					range,
					a,
					x,
					y,
					x2,
					y2,
					r = 64;
			var startangle = Math.PI + this.mPI;
			var endangle = Math.PI - this.mPI; //let step = this.step>5 ? this.step : 1;

			if (this.step > 5) {
				range = this.range / this.step;
				step = (startangle - endangle) / range;
			} else {
				step = (startangle - endangle) / r * 2;
				range = r * 0.5;
			}

			for (var i = 0; i <= range; ++i) {
				a = startangle - step * i;
				x = r + Math.sin(a) * (r - 20);
				y = r + Math.cos(a) * (r - 20);
				x2 = r + Math.sin(a) * (r - 24);
				y2 = r + Math.cos(a) * (r - 24);
				d += 'M' + x + ' ' + y + ' L' + x2 + ' ' + y2 + ' ';
			}

			return d;
		};

		_proto.update = function update(up) {
			this.c[2].textContent = this.value;
			this.percent = (this.value - this.min) / this.range; // let r = 50;
			// let d = 64; 

			var r = this.percent * this.cirRange - this.mPI; //* this.toDeg;

			var sin = Math.sin(r);
			var cos = Math.cos(r);
			var x1 = 25 * sin + 64;
			var y1 = -(25 * cos) + 64;
			var x2 = 20 * sin + 64;
			var y2 = -(20 * cos) + 64; //this.setSvg( this.c[3], 'cx', x, 1 );
			//this.setSvg( this.c[3], 'cy', y, 1 );

			this.setSvg(this.c[3], 'd', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2, 1); //this.setSvg( this.c[3], 'transform', 'rotate('+ r +' '+64+' '+64+')', 1 );

			if (up) this.send();
		};

		return Knob;
	}(Proto);

	var List = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(List, _Proto);

		function List(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this; // images

			_this.path = o.path || '';
			_this.format = o.format || '';
			_this.imageSize = o.imageSize || [20, 20];
			_this.isWithImage = _this.path !== '' ? true : false;
			_this.preLoadComplete = false;
			_this.tmpImage = {};
			_this.tmpUrl = []; //this.autoHeight = false;

			var align = o.align || 'center';
			_this.sMode = 0;
			_this.tMode = 0;
			_this.listOnly = o.listOnly || false;
			if (_this.txt === '') _this.p = 0;
			_this.buttonColor = o.bColor || _this.colors.button;
			var fltop = Math.floor(_this.h * 0.5) - 5;
			_this.c[2] = _this.dom('div', _this.css.basic + 'top:0; display:none;');
			_this.c[3] = _this.dom('div', _this.css.txt + 'text-align:' + align + '; line-height:' + (_this.h - 4) + 'px; top:1px; background:' + _this.buttonColor + '; height:' + (_this.h - 2) + 'px; border-radius:' + _this.radius + 'px;');
			_this.c[4] = _this.dom('path', _this.css.basic + 'position:absolute; width:10px; height:10px; top:' + fltop + 'px;', {
				d: _this.svgs.arrow,
				fill: _this.fontColor,
				stroke: 'none'
			});
			_this.scroller = _this.dom('div', _this.css.basic + 'right:5px;	width:10px; background:#666; display:none;');
			_this.c[3].style.color = _this.fontColor;
			_this.list = o.list || [];
			_this.items = [];
			_this.prevName = '';
			_this.baseH = _this.h;
			_this.itemHeight = o.itemHeight || _this.h - 3; // force full list 

			_this.full = o.full || false;
			_this.py = 0;
			_this.ww = _this.sb;
			_this.scroll = false;
			_this.isDown = false;
			_this.current = null; // list up or down

			_this.side = o.side || 'down';
			_this.up = _this.side === 'down' ? 0 : 1;

			if (_this.up) {
				_this.c[2].style.top = 'auto';
				_this.c[3].style.top = 'auto';
				_this.c[4].style.top = 'auto'; //this.c[5].style.top = 'auto';

				_this.c[2].style.bottom = _this.h - 2 + 'px';
				_this.c[3].style.bottom = '1px';
				_this.c[4].style.bottom = fltop + 'px';
			} else {
				_this.c[2].style.top = _this.baseH + 'px';
			}

			_this.listIn = _this.dom('div', _this.css.basic + 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2);');
			_this.listIn.name = 'list';
			_this.topList = 0;

			_this.c[2].appendChild(_this.listIn);

			_this.c[2].appendChild(_this.scroller);

			if (o.value !== undefined) {
				if (!isNaN(o.value)) _this.value = _this.list[o.value];else _this.value = o.value;
			} else {
				_this.value = _this.list[0];
			}

			_this.isOpenOnStart = o.open || false;

			if (_this.listOnly) {
				_this.baseH = 5;
				_this.c[3].style.display = 'none';
				_this.c[4].style.display = 'none';
				_this.c[2].style.top = _this.baseH + 'px';
				_this.isOpenOnStart = true;
			} //this.c[0].style.background = '#FF0000'


			if (_this.isWithImage) _this.preloadImage(); // } else {
			// populate list

			_this.setList(_this.list);

			_this.init();

			if (_this.isOpenOnStart) _this.open(true); // }

			return _this;
		} // image list


		var _proto = List.prototype;

		_proto.preloadImage = function preloadImage() {
			this.preLoadComplete = false;
			this.tmpImage = {};

			for (var i = 0; i < this.list.length; i++) {
				this.tmpUrl.push(this.list[i]);
			}

			this.loadOne();
		};

		_proto.nextImg = function nextImg() {
			this.tmpUrl.shift();

			if (this.tmpUrl.length === 0) {
				this.preLoadComplete = true;
				this.addImages();
				/*this.setList( this.list );
				this.init();
				if( this.isOpenOnStart ) this.open();*/
			} else this.loadOne();
		};

		_proto.loadOne = function loadOne() {
			var self = this;
			var name = this.tmpUrl[0];
			var img = document.createElement('img');
			img.style.cssText = 'position:absolute; width:' + self.imageSize[0] + 'px; height:' + self.imageSize[1] + 'px';
			img.setAttribute('src', this.path + name + this.format);
			img.addEventListener('load', function () {
				self.imageSize[2] = img.width;
				self.imageSize[3] = img.height;
				self.tmpImage[name] = img;
				self.nextImg();
			});
		} //
		;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';

			if (this.up && this.isOpen) {
				if (l.y > this.h - this.baseH) return 'title';else {
					if (this.scroll && l.x > this.sa + this.sb - 20) return 'scroll';
					if (l.x > this.sa) return this.testItems(l.y - this.baseH);
				}
			} else {
				if (l.y < this.baseH + 2) return 'title';else {
					if (this.isOpen) {
						if (this.scroll && l.x > this.sa + this.sb - 20) return 'scroll';
						if (l.x > this.sa) return this.testItems(l.y - this.baseH);
					}
				}
			}

			return '';
		};

		_proto.testItems = function testItems(y) {
			var name = '';
			var i = this.items.length,
					item,
					a,
					b;

			while (i--) {
				item = this.items[i];
				a = item.posy + this.topList;
				b = item.posy + this.itemHeight + 1 + this.topList;

				if (y >= a && y <= b) {
					name = 'item' + i;
					this.unSelected();
					this.current = item;
					this.selected();
					return name;
				}
			}

			return name;
		};

		_proto.unSelected = function unSelected() {
			if (this.current) {
				this.current.style.background = 'rgba(0,0,0,0.2)';
				this.current.style.color = this.fontColor;
				this.current = null;
			}
		};

		_proto.selected = function selected() {
			this.current.style.background = this.colors.select;
			this.current.style.color = '#FFF';
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			this.isDown = false;
		};

		_proto.mousedown = function mousedown(e) {
			var name = this.testZone(e);
			if (!name) return false;

			if (name === 'scroll') {
				this.isDown = true;
				this.mousemove(e);
			} else if (name === 'title') {
				this.modeTitle(2);

				if (!this.listOnly) {
					if (!this.isOpen) this.open();else this.close();
				}
			} else {
				if (this.current) {
					this.value = this.list[this.current.id]; //this.value = this.current.textContent;

					this.send();

					if (!this.listOnly) {
						this.close();
						this.setTopItem();
					}
				}
			}

			return true;
		};

		_proto.mousemove = function mousemove(e) {
			var nup = false;
			var name = this.testZone(e);
			if (!name) return nup;

			if (name === 'title') {
				this.unSelected();
				this.modeTitle(1);
				this.cursor('pointer');
			} else if (name === 'scroll') {
				this.cursor('s-resize');
				this.modeScroll(1);

				if (this.isDown) {
					this.modeScroll(2);
					var top = this.zone.y + this.baseH - 2;
					this.update(e.clientY - top - this.sh * 0.5);
				} //if(this.isDown) this.listmove(e);

			} else {
				// is item
				this.modeTitle(0);
				this.modeScroll(0);
				this.cursor('pointer');
			}

			if (name !== this.prevName) nup = true;
			this.prevName = name;
			return nup;
		};

		_proto.wheel = function wheel(e) {
			var name = this.testZone(e);
			if (name === 'title') return false;
			this.py += e.delta * 10;
			this.update(this.py);
			return true;
		} // ----------------------
		;

		_proto.reset = function reset() {
			this.prevName = '';
			this.unSelected();
			this.modeTitle(0);
			this.modeScroll(0);
		};

		_proto.modeScroll = function modeScroll(mode) {
			if (mode === this.sMode) return;

			switch (mode) {
				case 0:
					// base
					this.scroller.style.background = this.buttonColor;
					break;

				case 1:
					// over
					this.scroller.style.background = this.colors.select;
					break;

				case 2:
					// edit / down
					this.scroller.style.background = this.colors.down;
					break;
			}

			this.sMode = mode;
		};

		_proto.modeTitle = function modeTitle(mode) {
			if (mode === this.tMode) return;
			var s = this.s;

			switch (mode) {
				case 0:
					// base
					s[3].color = this.fontColor;
					s[3].background = this.buttonColor;
					break;

				case 1:
					// over
					s[3].color = '#FFF';
					s[3].background = this.colors.select;
					break;

				case 2:
					// edit / down
					s[3].color = this.fontColor;
					s[3].background = this.colors.down;
					break;
			}

			this.tMode = mode;
		};

		_proto.clearList = function clearList() {
			while (this.listIn.children.length) {
				this.listIn.removeChild(this.listIn.lastChild);
			}

			this.items = [];
		};

		_proto.setList = function setList(list) {
			this.clearList();
			this.list = list;
			this.length = this.list.length;
			this.maxItem = this.full ? this.length : 5;
			this.maxItem = this.length < this.maxItem ? this.length : this.maxItem;
			this.maxHeight = this.maxItem * (this.itemHeight + 1) + 2;
			this.max = this.length * (this.itemHeight + 1) + 2;
			this.ratio = this.maxHeight / this.max;
			this.sh = this.maxHeight * this.ratio;
			this.range = this.maxHeight - this.sh;
			this.c[2].style.height = this.maxHeight + 'px';
			this.scroller.style.height = this.sh + 'px';

			if (this.max > this.maxHeight) {
				this.ww = this.sb - 20;
				this.scroll = true;
			}

			var item, n; //, l = this.sb;

			for (var i = 0; i < this.length; i++) {
				n = this.list[i];
				item = this.dom('div', this.css.item + 'width:' + this.ww + 'px; height:' + this.itemHeight + 'px; line-height:' + (this.itemHeight - 5) + 'px; color:' + this.fontColor + ';');
				item.name = 'item' + i;
				item.id = i;
				item.posy = (this.itemHeight + 1) * i;
				this.listIn.appendChild(item);
				this.items.push(item); //if( this.isWithImage ) item.appendChild( this.tmpImage[n] );

				if (!this.isWithImage) item.textContent = n;
			}

			this.setTopItem();
		};

		_proto.addImages = function addImages() {
			var lng = this.list.length;

			for (var i = 0; i < lng; i++) {
				this.items[i].appendChild(this.tmpImage[this.list[i]]);
			}

			this.setTopItem();
		};

		_proto.setTopItem = function setTopItem() {
			if (this.isWithImage) {
				if (!this.preLoadComplete) return;

				if (!this.c[3].children.length) {
					this.canvas = document.createElement('canvas');
					this.canvas.width = this.imageSize[0];
					this.canvas.height = this.imageSize[1];
					this.canvas.style.cssText = 'position:absolute; top:0px; left:0px;';
					this.ctx = this.canvas.getContext("2d");
					this.c[3].appendChild(this.canvas);
				}

				this.tmpImage[this.value];
				this.ctx.drawImage(this.tmpImage[this.value], 0, 0, this.imageSize[2], this.imageSize[3], 0, 0, this.imageSize[0], this.imageSize[1]);
			} else this.c[3].textContent = this.value;
		} // ----- LIST
		;

		_proto.update = function update(y) {
			if (!this.scroll) return;
			y = y < 0 ? 0 : y;
			y = y > this.range ? this.range : y;
			this.topList = -Math.floor(y / this.ratio);
			this.listIn.style.top = this.topList + 'px';
			this.scroller.style.top = Math.floor(y) + 'px';
			this.py = y;
		};

		_proto.parentHeight = function parentHeight(t) {
			if (this.group !== null) this.group.calc(t);else if (this.isUI) this.main.calc(t);
		};

		_proto.open = function open(first) {
			_Proto.prototype.open.call(this);

			this.update(0);
			this.h = this.maxHeight + this.baseH + 5;

			if (!this.scroll) {
				this.topList = 0;
				this.h = this.baseH + 5 + this.max;
				this.scroller.style.display = 'none';
			} else {
				this.scroller.style.display = 'block';
			}

			this.s[0].height = this.h + 'px';
			this.s[2].display = 'block';

			if (this.up) {
				this.zone.y -= this.h - (this.baseH - 10);
				this.setSvg(this.c[4], 'd', this.svgs.arrowUp);
			} else {
				this.setSvg(this.c[4], 'd', this.svgs.arrowDown);
			}

			this.rSizeContent();
			var t = this.h - this.baseH;
			this.zone.h = this.h;
			if (!first) this.parentHeight(t);
		};

		_proto.close = function close() {
			_Proto.prototype.close.call(this);

			if (this.up) this.zone.y += this.h - (this.baseH - 10);
			var t = this.h - this.baseH;
			this.h = this.baseH;
			this.s[0].height = this.h + 'px';
			this.s[2].display = 'none';
			this.setSvg(this.c[4], 'd', this.svgs.arrow);
			this.zone.h = this.h;
			this.parentHeight(-t);
		} // -----
		;

		_proto.text = function text(txt) {
			this.c[3].textContent = txt;
		};

		_proto.rSizeContent = function rSizeContent() {
			var i = this.length;

			while (i--) {
				this.listIn.children[i].style.width = this.ww + 'px';
			}
		};

		_proto.rSize = function rSize() {
			Proto.prototype.rSize.call(this);
			var s = this.s;
			var w = this.sb;
			var d = this.sa;
			if (s[2] === undefined) return;
			s[2].width = w + 'px';
			s[2].left = d + 'px';
			s[3].width = w + 'px';
			s[3].left = d + 'px';
			s[4].left = d + w - 17 + 'px';
			this.ww = w;
			if (this.max > this.maxHeight) this.ww = w - 20;
			if (this.isOpen) this.rSizeContent();
		};

		return List;
	}(Proto);

	var Numeric = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Numeric, _Proto);

		function Numeric(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;

			_this.setTypeNumber(o);

			_this.allway = o.allway || false;
			_this.isDown = false;
			_this.value = [0];
			_this.multy = 1;
			_this.invmulty = 1;
			_this.isSingle = true;
			_this.isAngle = false;
			_this.isVector = false;

			if (o.isAngle) {
				_this.isAngle = true;
				_this.multy = Tools.torad;
				_this.invmulty = Tools.todeg;
			}

			_this.isDrag = o.drag || false;

			if (o.value !== undefined) {
				if (!isNaN(o.value)) {
					_this.value = [o.value];
				} else if (o.value instanceof Array) {
					_this.value = o.value;
					_this.isSingle = false;
				} else if (o.value instanceof Object) {
					_this.value = [];
					if (o.value.x !== undefined) _this.value[0] = o.value.x;
					if (o.value.y !== undefined) _this.value[1] = o.value.y;
					if (o.value.z !== undefined) _this.value[2] = o.value.z;
					if (o.value.w !== undefined) _this.value[3] = o.value.w;
					_this.isVector = true;
					_this.isSingle = false;
				}
			}

			_this.lng = _this.value.length;
			_this.tmp = [];
			_this.current = -1;
			_this.prev = {
				x: 0,
				y: 0,
				d: 0,
				v: 0
			}; // bg

			_this.c[2] = _this.dom('div', _this.css.basic + ' background:' + _this.colors.select + '; top:4px; width:0px; height:' + (_this.h - 8) + 'px;');
			_this.cMode = [];
			var i = _this.lng;

			while (i--) {
				if (_this.isAngle) _this.value[i] = (_this.value[i] * 180 / Math.PI).toFixed(_this.precision);
				_this.c[3 + i] = _this.dom('div', _this.css.txtselect + ' height:' + (_this.h - 4) + 'px; background:' + _this.colors.inputBg + '; borderColor:' + _this.colors.inputBorder + '; border-radius:' + _this.radius + 'px;');
				if (o.center) _this.c[2 + i].style.textAlign = 'center';
				_this.c[3 + i].textContent = _this.value[i];
				_this.c[3 + i].style.color = _this.fontColor;
				_this.c[3 + i].isNum = true;
				_this.cMode[i] = 0;
			} // cursor


			_this.cursorId = 3 + _this.lng;
			_this.c[_this.cursorId] = _this.dom('div', _this.css.basic + 'top:4px; height:' + (_this.h - 8) + 'px; width:0px; background:' + _this.fontColor + ';');

			_this.init();

			return _this;
		}

		var _proto = Numeric.prototype;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			var i = this.lng;
			var t = this.tmp;

			while (i--) {
				if (l.x > t[i][0] && l.x < t[i][2]) return i;
			}

			return '';
		}
		/* mode: function ( n, name ) {
					 if( n === this.cMode[name] ) return false;
					 //let m;
					 /*switch(n){
							 case 0: m = this.colors.border; break;
						 case 1: m = this.colors.borderOver; break;
						 case 2: m = this.colors.borderSelect;	break;
					 }*/

		/*		 this.reset();
				 //this.c[name+2].style.borderColor = m;
				 this.cMode[name] = n;
					 return true;
			 },*/
		// ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mousedown = function mousedown(e) {
			var name = this.testZone(e);

			if (!this.isDown) {
				this.isDown = true;

				if (name !== '') {
					this.current = name;
					this.prev = {
						x: e.clientX,
						y: e.clientY,
						d: 0,
						v: this.isSingle ? parseFloat(this.value) : parseFloat(this.value[this.current])
					};
					this.setInput(this.c[3 + this.current]);
				}

				return this.mousemove(e);
			}

			return false;
			/*
				if( name === '' ) return false;
					this.current = name;
			this.isDown = true;
				this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] )	};
					return this.mode( 2, name );*/
		};

		_proto.mouseup = function mouseup(e) {
			if (this.isDown) {
				this.isDown = false; //this.current = -1;

				this.prev = {
					x: 0,
					y: 0,
					d: 0,
					v: 0
				};
				return this.mousemove(e);
			}

			return false;
			/*let name = this.testZone( e );
			this.isDown = false;
				if( this.current !== -1 ){ 
						//let tm = this.current;
					let td = this.prev.d;
						this.current = -1;
					this.prev = { x:0, y:0, d:0, v:0 };
						if( !td ){
								this.setInput( this.c[ 3 + name ] );
							return true;//this.mode( 2, name );
						} else {
							return this.reset();//this.mode( 0, tm );
					}
				}*/
		};

		_proto.mousemove = function mousemove(e) {
			var nup = false;
			var x = 0;
			var name = this.testZone(e);
			if (name === '') this.cursor();else {
				if (!this.isDrag) this.cursor('text');else this.cursor(this.current !== -1 ? 'move' : 'pointer');
			}

			if (this.isDrag) {
				if (this.current !== -1) {
					this.prev.d += e.clientX - this.prev.x - (e.clientY - this.prev.y);
					var n = this.prev.v + this.prev.d * this.step;
					this.value[this.current] = this.numValue(n);
					this.c[3 + this.current].textContent = this.value[this.current];
					this.validate();
					this.prev.x = e.clientX;
					this.prev.y = e.clientY;
					nup = true;
				}
			} else {
				if (this.isDown) x = e.clientX - this.zone.x - 3;
				if (this.current !== -1) x -= this.tmp[this.current][0];
				return this.upInput(x, this.isDown);
			}

			return nup;
		} //keydown: function ( e ) { return true; },
		// ----------------------
		;

		_proto.reset = function reset() {
			var nup = false; //this.isDown = false;
			//this.current = 0;

			/* let i = this.lng;
			 while(i--){ 
					 if(this.cMode[i]!==0){
							 this.cMode[i] = 0;
							 //this.c[2+i].style.borderColor = this.colors.border;
							 nup = true;
					 }
			 }*/

			return nup;
		};

		_proto.setValue = function setValue(v) {
			if (this.isVector) {
				if (v.x !== undefined) this.value[0] = v.x;
				if (v.y !== undefined) this.value[1] = v.y;
				if (v.z !== undefined) this.value[2] = v.z;
				if (v.w !== undefined) this.value[3] = v.w;
			} else {
				this.value = v;
			}

			this.update(); //let i = this.value.length;

			/*n = n || 0;
			this.value[n] = this.numValue( v );
			this.c[ 3 + n ].textContent = this.value[n];*/
		};

		_proto.sameStr = function sameStr(str) {
			var i = this.value.length;

			while (i--) {
				this.c[3 + i].textContent = str;
			}
		};

		_proto.update = function update(up) {
			var i = this.value.length;

			while (i--) {
				this.value[i] = this.numValue(this.value[i] * this.invmulty);
				this.c[3 + i].textContent = this.value[i];
			}

			if (up) this.send();
		};

		_proto.send = function send(v) {
			v = v || this.value;
			this.isSend = true;

			if (this.objectLink !== null) {
				if (this.isVector) {
					this.objectLink[this.val].fromArray(v);
					/*this.objectLink[ this.val ].x = v[0];
					this.objectLink[ this.val ].y = v[1];
					this.objectLink[ this.val ].z = v[2];
					if( v[3] ) this.objectLink[ this.val ].w = v[3];*/
				} else {
					this.objectLink[this.val] = v;
				}
			}

			if (this.callback) this.callback(v, this.val);
			this.isSend = false;
		} // ----------------------
		//	 INPUT
		// ----------------------
		;

		_proto.select = function select(c, e, w) {
			var s = this.s;
			var d = this.current !== -1 ? this.tmp[this.current][0] + 5 : 0;
			s[this.cursorId].width = '1px';
			s[this.cursorId].left = d + c + 'px';
			s[2].left = d + e + 'px';
			s[2].width = w + 'px';
		};

		_proto.unselect = function unselect() {
			var s = this.s;
			if (!s) return;
			s[2].width = 0 + 'px';
			s[this.cursorId].width = 0 + 'px';
		};

		_proto.validate = function validate(force) {
			var ar = [];
			var i = this.lng;
			if (this.allway) force = true;

			while (i--) {
				if (!isNaN(this.c[3 + i].textContent)) {
					var nx = this.numValue(this.c[3 + i].textContent);
					this.c[3 + i].textContent = nx;
					this.value[i] = nx;
				} else {
					// not number
					this.c[3 + i].textContent = this.value[i];
				}

				ar[i] = this.value[i] * this.multy;
			}

			if (!force) return;
			if (this.isSingle) this.send(ar[0]);else this.send(ar);
		} // ----------------------
		//	 REZISE
		// ----------------------
		;

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			var w = Math.floor((this.sb + 5) / this.lng) - 5;
			var s = this.s;
			var i = this.lng;

			while (i--) {
				this.tmp[i] = [Math.floor(this.sa + w * i + 5 * i), w];
				this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
				s[3 + i].left = this.tmp[i][0] + 'px';
				s[3 + i].width = this.tmp[i][1] + 'px';
			}
		};

		return Numeric;
	}(Proto);

	var Slide = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Slide, _Proto);

		function Slide(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;

			_this.setTypeNumber(o);

			_this.model = o.stype || 0;
			if (o.mode !== undefined) _this.model = o.mode;
			_this.buttonColor = o.bColor || _this.colors.button;
			_this.defaultBorderColor = _this.colors.hide;
			_this.isDown = false;
			_this.isOver = false;
			_this.allway = o.allway || false;
			_this.isDeg = o.isDeg || false;
			_this.firstImput = false; //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.fontColor );
			//this.c[2] = this.dom( 'div', this.css.txtselect + 'text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.fontColor );

			_this.c[2] = _this.dom('div', _this.css.txtselect + 'border:none; width:47px; color:' + _this.fontColor); //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; color:'+ this.fontColor );

			_this.c[3] = _this.dom('div', _this.css.basic + ' top:0; height:' + _this.h + 'px;');
			_this.c[4] = _this.dom('div', _this.css.basic + 'background:' + _this.colors.scrollback + '; top:2px; height:' + (_this.h - 4) + 'px;');
			_this.c[5] = _this.dom('div', _this.css.basic + 'left:4px; top:5px; height:' + (_this.h - 10) + 'px; background:' + _this.fontColor + ';');
			_this.c[2].isNum = true; //this.c[2].style.height = (this.h-4) + 'px';
			//this.c[2].style.lineHeight = (this.h-8) + 'px';

			_this.c[2].style.height = _this.h - 2 + 'px';
			_this.c[2].style.lineHeight = _this.h - 10 + 'px';

			if (_this.model !== 0) {
				var h1 = 4,
						h2 = 8,
						ww = _this.h - 4,
						ra = 20;

				if (_this.model === 2) {
					h1 = 4; //2

					h2 = 8;
					ra = 2;
					ww = (_this.h - 4) * 0.5;
				}

				if (_this.model === 3) _this.c[5].style.visible = 'none';
				_this.c[4].style.borderRadius = h1 + 'px';
				_this.c[4].style.height = h2 + 'px';
				_this.c[4].style.top = _this.h * 0.5 - h1 + 'px';
				_this.c[5].style.borderRadius = h1 * 0.5 + 'px';
				_this.c[5].style.height = h1 + 'px';
				_this.c[5].style.top = _this.h * 0.5 - h1 * 0.5 + 'px';
				_this.c[6] = _this.dom('div', _this.css.basic + 'border-radius:' + ra + 'px; margin-left:' + -ww * 0.5 + 'px; border:1px solid ' + _this.colors.border + '; background:' + _this.buttonColor + '; left:4px; top:2px; height:' + (_this.h - 4) + 'px; width:' + ww + 'px;');
			}

			_this.init();

			return _this;
		}

		var _proto = Slide.prototype;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			if (l.x >= this.txl) return 'text';else if (l.x >= this.sa) return 'scroll';else return '';
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			if (this.isDown) this.isDown = false;
		};

		_proto.mousedown = function mousedown(e) {
			var name = this.testZone(e);
			if (!name) return false;

			if (name === 'scroll') {
				this.isDown = true;
				this.old = this.value;
				this.mousemove(e);
			}
			/*if( name === 'text' ){
					this.setInput( this.c[2], function(){ this.validate() }.bind(this) );
			}*/


			return true;
		};

		_proto.mousemove = function mousemove(e) {
			var nup = false;
			var name = this.testZone(e);

			if (name === 'scroll') {
				this.mode(1);
				this.cursor('w-resize'); //} else if(name === 'text'){ 
				//this.cursor('pointer');
			} else {
				this.cursor();
			}

			if (this.isDown) {
				var n = (e.clientX - (this.zone.x + this.sa) - 3) / this.ww * this.range + this.min - this.old;

				if (n >= this.step || n <= this.step) {
					n = Math.floor(n / this.step);
					this.value = this.numValue(this.old + n * this.step);
					this.update(true);
					this.old = this.value;
				}

				nup = true;
			}

			return nup;
		} //keydown: function ( e ) { return true; },
		// ----------------------
		;

		_proto.validate = function validate() {
			var n = this.c[2].textContent;

			if (!isNaN(n)) {
				this.value = this.numValue(n);
				this.update(true);
			} else this.c[2].textContent = this.value + (this.isDeg ? '°' : '');
		};

		_proto.reset = function reset() {
			//this.clearInput();
			this.isDown = false;
			this.mode(0);
		};

		_proto.mode = function mode(_mode) {
			var s = this.s;

			switch (_mode) {
				case 0:
					// base
					// s[2].border = '1px solid ' + this.colors.hide;
					s[2].color = this.fontColor;
					s[4].background = this.colors.scrollback;
					s[5].background = this.fontColor;
					break;

				case 1:
					// scroll over
					//s[2].border = '1px dashed ' + this.colors.hide;
					s[2].color = this.colorPlus;
					s[4].background = this.colors.scrollbackover;
					s[5].background = this.colorPlus;
					break;

				/* case 2: 
						 s[2].border = '1px solid ' + this.colors.borderSelect;
				 break;
				 case 3: 
						 s[2].border = '1px dashed ' + this.fontColor;//this.colors.borderSelect;
				 break;
				 case 4: 
						 s[2].border = '1px dashed ' + this.colors.hide;
				 break;*/
			}
		};

		_proto.update = function update(up) {
			var ww = Math.floor(this.ww * ((this.value - this.min) / this.range));
			if (this.model !== 3) this.s[5].width = ww + 'px';
			if (this.s[6]) this.s[6].left = this.sa + ww + 3 + 'px';
			this.c[2].textContent = this.value + (this.isDeg ? '°' : '');
			if (up) this.send();
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			var w = this.sb - this.sc;
			this.ww = w - 6;
			var tx = this.sc;
			if (this.isUI || !this.simple) tx = this.sc + 10;
			this.txl = this.w - tx + 2; //let ty = Math.floor(this.h * 0.5) - 8;

			var s = this.s;
			s[2].width = this.sc - 6 + 'px';
			s[2].left = this.txl + 4 + 'px'; //s[2].top = ty + 'px';

			s[3].left = this.sa + 'px';
			s[3].width = w + 'px';
			s[4].left = this.sa + 'px';
			s[4].width = w + 'px';
			s[5].left = this.sa + 3 + 'px';
			this.update();
		};

		return Slide;
	}(Proto);

	var TextInput = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(TextInput, _Proto);

		function TextInput(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.cmode = 0;
			_this.value = o.value || '';
			_this.placeHolder = o.placeHolder || '';
			_this.allway = o.allway || false;
			_this.editable = o.edit !== undefined ? o.edit : true;
			_this.isDown = false; // bg

			_this.c[2] = _this.dom('div', _this.css.basic + ' background:' + _this.colors.select + '; top:4px; width:0px; height:' + (_this.h - 8) + 'px;');
			_this.c[3] = _this.dom('div', _this.css.txtselect + 'height:' + (_this.h - 4) + 'px; background:' + _this.colors.inputBg + '; borderColor:' + _this.colors.inputBorder + '; border-radius:' + _this.radius + 'px;');
			_this.c[3].textContent = _this.value; // cursor

			_this.c[4] = _this.dom('div', _this.css.basic + 'top:4px; height:' + (_this.h - 8) + 'px; width:0px; background:' + _this.fontColor + ';'); // fake

			_this.c[5] = _this.dom('div', _this.css.txtselect + 'height:' + (_this.h - 4) + 'px; justify-content: center; font-style: italic; color:' + _this.colors.inputHolder + ';');
			if (_this.value === '') _this.c[5].textContent = _this.placeHolder;

			_this.init();

			return _this;
		}

		var _proto = TextInput.prototype;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			if (l.x >= this.sa) return 'text';
			return '';
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			if (!this.editable) return;

			if (this.isDown) {
				this.isDown = false;
				return this.mousemove(e);
			}

			return false;
		};

		_proto.mousedown = function mousedown(e) {
			if (!this.editable) return;
			var name = this.testZone(e);

			if (!this.isDown) {
				this.isDown = true;
				if (name === 'text') this.setInput(this.c[3]);
				return this.mousemove(e);
			}

			return false;
		};

		_proto.mousemove = function mousemove(e) {
			if (!this.editable) return;
			var name = this.testZone(e); //let l = this.local;
			//if( l.x === -1 && l.y === -1 ){ return;}
			//if( l.x >= this.sa ) this.cursor('text');
			//else this.cursor();

			var x = 0;
			if (name === 'text') this.cursor('text');else this.cursor();
			if (this.isDown) x = e.clientX - this.zone.x;
			return this.upInput(x - this.sa - 3, this.isDown);
		};

		_proto.update = function update() {
			this.c[3].textContent = this.value;
		} // ----------------------
		;

		_proto.render = function render(c, e, s) {
			this.s[4].width = '1px';
			this.s[4].left = this.sa + c + 5 + 'px';
			this.s[2].left = this.sa + e + 5 + 'px';
			this.s[2].width = s + 'px';
		};

		_proto.reset = function reset() {
			this.cursor();
		} // ----------------------
		//	 INPUT
		// ----------------------
		;

		_proto.select = function select(c, e, w) {
			var s = this.s;
			var d = this.sa + 5;
			s[4].width = '1px';
			s[4].left = d + c + 'px';
			s[2].left = d + e + 'px';
			s[2].width = w + 'px';
		};

		_proto.unselect = function unselect() {
			var s = this.s;
			if (!s) return;
			s[2].width = 0 + 'px';
			s[4].width = 0 + 'px';
		};

		_proto.validate = function validate(force) {
			if (this.allway) force = true;
			this.value = this.c[3].textContent;
			if (this.value !== '') this.c[5].textContent = '';else this.c[5].textContent = this.placeHolder;
			if (!force) return;
			this.send();
		} // ----------------------
		//	 REZISE
		// ----------------------
		;

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			var s = this.s;
			s[3].left = this.sa + 'px';
			s[3].width = this.sb + 'px';
			s[5].left = this.sa + 'px';
			s[5].width = this.sb + 'px';
		};

		return TextInput;
	}(Proto);

	var Title = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Title, _Proto);

		function Title(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			var prefix = o.prefix || '';
			_this.c[2] = _this.dom('div', _this.css.txt + 'text-align:right; width:60px; line-height:' + (_this.h - 8) + 'px; color:' + _this.fontColor);

			if (_this.h === 31) {
				_this.s[0].height = _this.h + 'px';
				_this.s[1].top = 8 + 'px';
				_this.c[2].style.top = 8 + 'px';
			}

			var s = _this.s;
			s[1].textAlign = o.align || 'left';
			s[1].fontWeight = o.fontWeight || 'bold';
			_this.c[1].textContent = _this.txt.substring(0, 1).toUpperCase() + _this.txt.substring(1).replace("-", " ");
			_this.c[2].textContent = prefix;

			_this.init();

			return _this;
		}

		var _proto = Title.prototype;

		_proto.text = function text(txt) {
			this.c[1].textContent = txt;
		};

		_proto.text2 = function text2(txt) {
			this.c[2].textContent = txt;
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			this.s[1].width = this.w + 'px'; //- 50 + 'px';

			this.s[2].left = this.w + 'px'; //- ( 50 + 26 ) + 'px';
		};

		return Title;
	}(Proto);

	var Select = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Select, _Proto);

		function Select(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.value = o.value || '';
			_this.isDown = false;

			_this.onActif = o.onActif || function () {};

			_this.buttonColor = o.bColor || _this.colors.button;
			_this.buttonOver = o.bOver || _this.colors.over;
			_this.buttonDown = o.bDown || _this.colors.select;
			_this.buttonAction = o.bAction || _this.colors.action;
			o.prefix || '';
			_this.c[2] = _this.dom('div', _this.css.txt + _this.css.button + ' top:1px; background:' + _this.buttonColor + '; height:' + (_this.h - 2) + 'px; border:' + _this.colors.buttonBorder + '; border-radius:15px; width:30px; left:10px;');
			_this.c[2].style.color = _this.fontColor;
			_this.c[3] = _this.dom('div', _this.css.txtselect + 'height:' + (_this.h - 4) + 'px; background:' + _this.colors.inputBg + '; borderColor:' + _this.colors.inputBorder + '; border-radius:' + _this.radius + 'px;');
			_this.c[3].textContent = _this.value;
			var fltop = Math.floor(_this.h * 0.5) - 7;
			_this.c[4] = _this.dom('path', _this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:' + fltop + 'px;', {
				d: _this.svgs['cursor'],
				fill: _this.fontColor,
				stroke: 'none'
			});
			_this.stat = 1;
			_this.isActif = false;

			_this.init();

			return _this;
		}

		var _proto = Select.prototype;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			if (l.x > this.sa && l.x < this.sa + 30) return 'over';
			return '0';
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			if (this.isDown) {
				//this.value = false;
				this.isDown = false; //this.send();

				return this.mousemove(e);
			}

			return false;
		};

		_proto.mousedown = function mousedown(e) {
			var name = this.testZone(e);
			if (!name) return false;
			this.isDown = true; //this.value = this.values[ name-2 ];
			//this.send();

			return this.mousemove(e);
		};

		_proto.mousemove = function mousemove(e) {
			var up = false;
			var name = this.testZone(e); //let sel = false;
			//console.log(name)

			if (name === 'over') {
				this.cursor('pointer');
				up = this.mode(this.isDown ? 3 : 2);
			} else {
				up = this.reset();
			}

			return up;
		} // ----------------------
		;

		_proto.apply = function apply(v) {
			v = v || '';

			if (v !== this.value) {
				this.value = v;
				this.c[3].textContent = this.value;
				this.send();
			}

			this.mode(1);
		};

		_proto.update = function update() {
			this.mode(3);
		};

		_proto.mode = function mode(n) {
			var change = false;

			if (this.stat !== n) {
				if (n === 1) this.isActif = false;

				if (n === 3) {
					if (!this.isActif) {
						this.isActif = true;
						n = 4;
						this.onActif(this);
					} else {
						this.isActif = false;
					}
				}

				if (n === 2 && this.isActif) n = 4;

				switch (n) {
					case 1:
						this.stat = 1;
						this.s[2].color = this.fontColor;
						this.s[2].background = this.buttonColor;
						break;
					// base

					case 2:
						this.stat = 2;
						this.s[2].color = this.fontSelect;
						this.s[2].background = this.buttonOver;
						break;
					// over

					case 3:
						this.stat = 3;
						this.s[2].color = this.fontSelect;
						this.s[2].background = this.buttonDown;
						break;
					// down

					case 4:
						this.stat = 4;
						this.s[2].color = this.fontSelect;
						this.s[2].background = this.buttonAction;
						break;
					// actif
				}

				change = true;
			}

			return change;
		};

		_proto.reset = function reset() {
			this.cursor();
			return this.mode(this.isActif ? 4 : 1);
		};

		_proto.text = function text(txt) {
			this.c[3].textContent = txt;
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			var s = this.s;
			s[2].left = this.sa + 'px';
			s[3].left = this.sa + 40 + 'px';
			s[3].width = this.sb - 40 + 'px';
			s[4].left = this.sa + 8 + 'px';
		};

		return Select;
	}(Proto);

	var Selector = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Selector, _Proto);

		function Selector(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.values = o.values;
			if (typeof _this.values === 'string') _this.values = [_this.values];
			_this.value = o.value || _this.values[0]; //this.selected = null;

			_this.isDown = false;
			_this.buttonColor = o.bColor || _this.colors.button;
			_this.buttonOver = o.bOver || _this.colors.over;
			_this.buttonDown = o.bDown || _this.colors.select;
			_this.lng = _this.values.length;
			_this.tmp = [];
			_this.stat = [];
			var sel;

			for (var i = 0; i < _this.lng; i++) {
				sel = false;
				if (_this.values[i] === _this.value) sel = true;
				_this.c[i + 2] = _this.dom('div', _this.css.txt + _this.css.button + ' top:1px; background:' + (sel ? _this.buttonDown : _this.buttonColor) + '; height:' + (_this.h - 2) + 'px; border:' + _this.colors.buttonBorder + '; border-radius:' + _this.radius + 'px;');
				_this.c[i + 2].style.color = sel ? _this.fontSelect : _this.fontColor;
				_this.c[i + 2].innerHTML = _this.values[i];
				_this.stat[i] = sel ? 3 : 1;
			}

			_this.init();

			return _this;
		}

		var _proto = Selector.prototype;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			var i = this.lng;
			var t = this.tmp;

			while (i--) {
				if (l.x > t[i][0] && l.x < t[i][2]) return i + 2;
			}

			return '';
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			if (this.isDown) {
				//this.value = false;
				this.isDown = false; //this.send();

				return this.mousemove(e);
			}

			return false;
		};

		_proto.mousedown = function mousedown(e) {
			var name = this.testZone(e);
			if (!name) return false;
			this.isDown = true;
			this.value = this.values[name - 2];
			this.send();
			return this.mousemove(e); // true;
		};

		_proto.mousemove = function mousemove(e) {
			var up = false;
			var name = this.testZone(e); //let sel = false;
			//console.log(name)

			if (name !== '') {
				this.cursor('pointer');
				up = this.modes(this.isDown ? 3 : 2, name);
			} else {
				up = this.reset();
			}

			return up;
		} // ----------------------
		;

		_proto.modes = function modes(n, name) {
			var v,
					r = false;

			for (var i = 0; i < this.lng; i++) {
				if (i === name - 2 && this.values[i] !== this.value) v = this.mode(n, i + 2);else {
					if (this.values[i] === this.value) v = this.mode(3, i + 2);else v = this.mode(1, i + 2);
				}
				if (v) r = true;
			}

			return r;
		};

		_proto.mode = function mode(n, name) {
			var change = false;
			var i = name - 2;

			if (this.stat[i] !== n) {
				switch (n) {
					case 1:
						this.stat[i] = 1;
						this.s[i + 2].color = this.fontColor;
						this.s[i + 2].background = this.buttonColor;
						break;

					case 2:
						this.stat[i] = 2;
						this.s[i + 2].color = this.fontSelect;
						this.s[i + 2].background = this.buttonOver;
						break;

					case 3:
						this.stat[i] = 3;
						this.s[i + 2].color = this.fontSelect;
						this.s[i + 2].background = this.buttonDown;
						break;
				}

				change = true;
			}

			return change;
		} // ----------------------
		;

		_proto.reset = function reset() {
			this.cursor();
			var v,
					r = false;

			for (var i = 0; i < this.lng; i++) {
				if (this.values[i] === this.value) v = this.mode(3, i + 2);else v = this.mode(1, i + 2);
				if (v) r = true;
			}

			return r; //this.modes( 1 , 2 );

			/*if( this.selected ){
				this.s[ this.selected ].color = this.fontColor;
						 this.s[ this.selected ].background = this.buttonColor;
						 this.selected = null;
						 
						 return true;
			}
				 return false;*/
		};

		_proto.label = function label(string, n) {
			n = n || 2;
			this.c[n].textContent = string;
		};

		_proto.icon = function icon(string, y, n) {
			n = n || 2;
			this.s[n].padding = (y || 0) + 'px 0px';
			this.c[n].innerHTML = string;
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);
			var s = this.s;
			var w = this.sb;
			var d = this.sa;
			var i = this.lng;
			var dc = 3;
			var size = Math.floor((w - dc * (i - 1)) / i);

			while (i--) {
				this.tmp[i] = [Math.floor(d + size * i + dc * i), size];
				this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
				s[i + 2].left = this.tmp[i][0] + 'px';
				s[i + 2].width = this.tmp[i][1] + 'px';
			}
		};

		return Selector;
	}(Proto);

	var Empty = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Empty, _Proto);

		function Empty(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			o.simple = true;
			o.isSpace = true;
			_this = _Proto.call(this, o) || this;

			_this.init();

			return _this;
		}

		return Empty;
	}(Proto);

	var Item = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Item, _Proto);

		function Item(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.p = 100;
			_this.value = _this.txt;
			_this.status = 1;
			_this.itype = o.itype || 'none';
			_this.val = _this.itype;
			_this.graph = _this.svgs[_this.itype];
			var fltop = Math.floor(_this.h * 0.5) - 7;
			_this.c[2] = _this.dom('path', _this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:' + fltop + 'px;', {
				d: _this.graph,
				fill: _this.fontColor,
				stroke: 'none'
			});
			_this.s[1].marginLeft = 20 + 'px';

			_this.init();

			return _this;
		} // ----------------------
		//	 EVENTS
		// ----------------------


		var _proto = Item.prototype;

		_proto.mousemove = function mousemove(e) {
			this.cursor('pointer'); //up = this.modes( this.isDown ? 3 : 2, name );
		};

		_proto.mousedown = function mousedown(e) {
			if (this.isUI) this.main.resetItem();
			this.selected(true);
			this.send();
			return true;
		};

		_proto.uiout = function uiout() {
			if (this.isSelect) this.mode(3);else this.mode(1);
		};

		_proto.uiover = function uiover() {
			if (this.isSelect) this.mode(4);else this.mode(2);
		};

		_proto.update = function update() {}
		/*rSize () {
				
				super.rSize();
			}*/
		;

		_proto.mode = function mode(n) {
			var change = false;

			if (this.status !== n) {
				this.status = n;

				switch (n) {
					case 1:
						this.status = 1;
						this.s[1].color = this.fontColor;
						this.s[0].background = 'none';
						break;

					case 2:
						this.status = 2;
						this.s[1].color = this.fontColor;
						this.s[0].background = this.bgOver;
						break;

					case 3:
						this.status = 3;
						this.s[1].color = '#FFF';
						this.s[0].background = this.colors.select;
						break;

					case 4:
						this.status = 4;
						this.s[1].color = '#FFF';
						this.s[0].background = this.colors.down;
						break;
				}

				change = true;
			}

			return change;
		};

		_proto.reset = function reset() {
			this.cursor(); // return this.mode( 1 );
		};

		_proto.selected = function selected(b) {
			if (this.isSelect) this.mode(1);
			this.isSelect = b || false;
			if (this.isSelect) this.mode(3);
		};

		return Item;
	}(Proto);

	var Grid = /*#__PURE__*/function (_Proto) {
		_inheritsLoose(Grid, _Proto);

		function Grid(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Proto.call(this, o) || this;
			_this.value = false;
			_this.values = o.values || [];
			if (typeof _this.values === 'string') _this.values = [_this.values]; //this.selected = null;

			_this.isDown = false;
			_this.buttonColor = o.bColor || _this.colors.button;
			_this.buttonOver = o.bOver || _this.colors.over;
			_this.buttonDown = o.bDown || _this.colors.select;
			_this.spaces = o.spaces || [10, 3];
			_this.bsize = o.bsize || [100, 20];
			_this.bsizeMax = _this.bsize[0];
			_this.lng = _this.values.length;
			_this.tmp = [];
			_this.stat = [];
			_this.grid = [2, Math.round(_this.lng * 0.5)];
			_this.h = _this.grid[1] * (_this.bsize[1] + _this.spaces[1]) + _this.spaces[1];
			_this.c[1].textContent = '';
			_this.c[2] = _this.dom('table', _this.css.basic + 'width:100%; top:' + (_this.spaces[1] - 2) + 'px; height:auto; border-collapse:separate; border:none; border-spacing: ' + (_this.spaces[0] - 2) + 'px ' + (_this.spaces[1] - 2) + 'px;');
			var n = 0,
					b,
					td,
					tr;
			_this.buttons = [];
			_this.stat = [];
			_this.tmpX = [];
			_this.tmpY = [];

			for (var i = 0; i < _this.grid[1]; i++) {
				tr = _this.c[2].insertRow();
				tr.style.cssText = 'pointer-events:none;';

				for (var j = 0; j < _this.grid[0]; j++) {
					td = tr.insertCell();
					td.style.cssText = 'pointer-events:none;';

					if (_this.values[n]) {
						b = document.createElement('div');
						b.style.cssText = _this.css.txt + _this.css.button + 'position:static; width:' + _this.bsize[0] + 'px; height:' + _this.bsize[1] + 'px; border:' + _this.colors.buttonBorder + '; left:auto; right:auto; background:' + _this.buttonColor + ';	border-radius:' + _this.radius + 'px;';
						b.innerHTML = _this.values[n];
						td.appendChild(b);

						_this.buttons.push(b);

						_this.stat.push(1);
					} else {
						b = document.createElement('div');
						b.style.cssText = _this.css.txt + 'position:static; width:' + _this.bsize[0] + 'px; height:' + _this.bsize[1] + 'px; text-align:center;	left:auto; right:auto; background:none;';
						td.appendChild(b);
					}

					if (j === 0) b.style.cssText += 'float:right;';else b.style.cssText += 'float:left;';
					n++;
				}
			}

			_this.init();

			return _this;
		}

		var _proto = Grid.prototype;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return -1;
			var tx = this.tmpX;
			var ty = this.tmpY;
			var id = -1;
			var c = -1;
			var line = -1;
			var i = this.grid[0];

			while (i--) {
				if (l.x > tx[i][0] && l.x < tx[i][1]) c = i;
			}

			i = this.grid[1];

			while (i--) {
				if (l.y > ty[i][0] && l.y < ty[i][1]) line = i;
			}

			if (c !== -1 && line !== -1) {
				id = c + line * 2;
				if (id > this.lng - 1) id = -1;
			}

			return id;
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.mouseup = function mouseup(e) {
			if (this.isDown) {
				this.value = false;
				this.isDown = false; //this.send();

				return this.mousemove(e);
			}

			return false;
		};

		_proto.mousedown = function mousedown(e) {
			var id = this.testZone(e);
			if (id < 0) return false;
			this.isDown = true;
			this.value = this.values[id];
			this.send();
			return this.mousemove(e);
		};

		_proto.mousemove = function mousemove(e) {
			var up = false;
			var id = this.testZone(e);

			if (id !== -1) {
				this.cursor('pointer');
				up = this.modes(this.isDown ? 3 : 2, id);
			} else {
				up = this.reset();
			}

			return up;
		} // ----------------------
		;

		_proto.modes = function modes(n, id) {
			var v,
					r = false;

			for (var i = 0; i < this.lng; i++) {
				if (i === id) v = this.mode(n, i);else v = this.mode(1, i);
				if (v) r = true;
			}

			return r;
		};

		_proto.mode = function mode(n, id) {
			var change = false;
			var i = id;

			if (this.stat[i] !== n) {
				switch (n) {
					case 1:
						this.stat[i] = 1;
						this.buttons[i].style.color = this.fontColor;
						this.buttons[i].style.background = this.buttonColor;
						break;

					case 2:
						this.stat[i] = 2;
						this.buttons[i].style.color = this.fontSelect;
						this.buttons[i].style.background = this.buttonOver;
						break;

					case 3:
						this.stat[i] = 3;
						this.buttons[i].style.color = this.fontSelect;
						this.buttons[i].style.background = this.buttonDown;
						break;
				}

				change = true;
			}

			return change;
		} // ----------------------
		;

		_proto.reset = function reset() {
			this.cursor();
			return this.modes(1, 0);
		};

		_proto.label = function label(string, n) {
			this.buttons[n].textContent = string;
		};

		_proto.icon = function icon(string, y, n) {
			this.buttons[n].style.padding = (y || 0) + 'px 0px';
			this.buttons[n].innerHTML = string;
		};

		_proto.testW = function testW() {
			var vw = this.spaces[0] * 3 + this.bsizeMax * 2,
					rz = false;

			if (vw > this.w) {
				this.bsize[0] = (this.w - this.spaces[0] * 3) * 0.5;
				rz = true;
			} else {
				if (this.bsize[0] !== this.bsizeMax) {
					this.bsize[0] = this.bsizeMax;
					rz = true;
				}
			}

			if (!rz) return;
			var i = this.buttons.length;

			while (i--) {
				this.buttons[i].style.width = this.bsize[0] + 'px';
			}
		};

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

			this.testW();
			var mid;
			this.tmpX = [];
			this.tmpY = [];

			for (var j = 0; j < this.grid[0]; j++) {
				if (j === 0) {
					mid = this.w * 0.5 - this.spaces[0] * 0.5;
					this.tmpX.push([mid - this.bsize[0], mid]);
				} else {
					mid = this.w * 0.5 + this.spaces[0] * 0.5;
					this.tmpX.push([mid, mid + this.bsize[0]]);
				}
			}

			mid = this.spaces[1];

			for (var i = 0; i < this.grid[1]; i++) {
				this.tmpY.push([mid, mid + this.bsize[1]]);
				mid += this.bsize[1] + this.spaces[1];
			}
		};

		return Grid;
	}(Proto);

	var add = function add() {
		var a = arguments;
		var type,
				o,
				ref = false,
				n = null;

		if (typeof a[0] === 'string') {
			type = a[0];
			o = a[1] || {};
		} else if (typeof a[0] === 'object') {
			// like dat gui
			ref = true;
			if (a[2] === undefined) [].push.call(a, {});
			type = a[2].type ? a[2].type : 'slide'; //autoType.apply( this, a );

			o = a[2];
			o.name = a[1];
			o.value = a[0][a[1]];
		}

		var name = type.toLowerCase();
		if (name === 'group') o.add = add;

		switch (name) {
			case 'bool':
				n = new Bool(o);
				break;

			case 'button':
				n = new Button(o);
				break;

			case 'circular':
				n = new Circular(o);
				break;

			case 'color':
				n = new Color(o);
				break;

			case 'fps':
				n = new Fps(o);
				break;

			case 'graph':
				n = new Graph(o);
				break;

			case 'group':
				n = new Group(o);
				break;

			case 'joystick':
				n = new Joystick(o);
				break;

			case 'knob':
				n = new Knob(o);
				break;

			case 'list':
				n = new List(o);
				break;

			case 'numeric':
			case 'number':
				n = new Numeric(o);
				break;

			case 'slide':
				n = new Slide(o);
				break;

			case 'textInput':
			case 'string':
				n = new TextInput(o);
				break;

			case 'title':
				n = new Title(o);
				break;

			case 'select':
				n = new Select(o);
				break;

			case 'selector':
				n = new Selector(o);
				break;

			case 'empty':
			case 'space':
				n = new Empty(o);
				break;

			case 'item':
				n = new Item(o);
				break;

			case 'grid':
				n = new Grid(o);
				break;
		}

		if (n !== null) {
			if (ref) n.setReferency(a[0], a[1]);
			return n;
		}
	};

	/**
	 * @author lth / https://github.com/lo-th
	 */

	var Gui = /*#__PURE__*/function () {
		function Gui(o) {
			if (o === void 0) {
				o = {};
			}

			this.canvas = null;
			this.isEmpty = true; // color

			this.colors = Tools.cloneColor();
			this.css = Tools.cloneCss();
			if (o.config) this.setConfig(o.config);
			this.bg = o.bg || this.colors.background;

			if (o.transparent !== undefined) {
				this.colors.background = 'none';
				this.colors.backgroundOver = 'none';
			} //if( o.callback ) this.callback =	o.callback;


			this.isReset = true;
			this.tmpAdd = null;
			this.tmpH = 0;
			this.isCanvas = o.isCanvas || false;
			this.isCanvasOnly = false;
			this.cssGui = o.css !== undefined ? o.css : '';
			this.callback = o.callback === undefined ? null : o.callback;
			this.forceHeight = o.maxHeight || 0;
			this.lockHeight = o.lockHeight || false;
			this.isItemMode = o.itemMode !== undefined ? o.itemMode : false;
			this.cn = ''; // size define

			this.size = Tools.size;
			if (o.p !== undefined) this.size.p = o.p;
			if (o.w !== undefined) this.size.w = o.w;
			if (o.h !== undefined) this.size.h = o.h;
			if (o.s !== undefined) this.size.s = o.s;
			this.size.h = this.size.h < 11 ? 11 : this.size.h; // local mouse and zone

			this.local = new V2().neg();
			this.zone = {
				x: 0,
				y: 0,
				w: this.size.w,
				h: 0
			}; // virtual mouse

			this.mouse = new V2().neg();
			this.h = 0;
			this.prevY = -1;
			this.sw = 0; // bottom and close height

			this.isWithClose = o.close !== undefined ? o.close : true;
			this.bh = !this.isWithClose ? 0 : this.size.h;
			this.autoResize = o.autoResize === undefined ? true : o.autoResize;
			this.isCenter = o.center || false;
			this.isOpen = true;
			this.isDown = false;
			this.isScroll = false;
			this.uis = [];
			this.current = -1;
			this.target = null;
			this.decal = 0;
			this.ratio = 1;
			this.oy = 0;
			this.isNewTarget = false;
			this.content = Tools.dom('div', this.css.basic + ' width:0px; height:auto; top:0px; ' + this.cssGui);
			this.innerContent = Tools.dom('div', this.css.basic + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
			this.content.appendChild(this.innerContent);
			this.inner = Tools.dom('div', this.css.basic + 'width:100%; left:0; ');
			this.innerContent.appendChild(this.inner); // scroll

			this.scrollBG = Tools.dom('div', this.css.basic + 'right:0; top:0; width:' + (this.size.s - 1) + 'px; height:10px; display:none; background:' + this.bg + ';');
			this.content.appendChild(this.scrollBG);
			this.scroll = Tools.dom('div', this.css.basic + 'background:' + this.colors.scroll + '; right:2px; top:0; width:' + (this.size.s - 4) + 'px; height:10px;');
			this.scrollBG.appendChild(this.scroll); // bottom button

			var r = o.radius || this.colors.radius;
			this.bottom = Tools.dom('div', this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:' + r + 'px;	border-bottom-left-radius:' + r + 'px; text-align:center; height:' + this.bh + 'px; line-height:' + (this.bh - 5) + 'px;'); // border-top:1px solid '+Tools.colors.stroke+';');

			this.content.appendChild(this.bottom);
			this.bottom.textContent = 'Close';
			this.bottom.style.background = this.bg; //

			this.parent = o.parent !== undefined ? o.parent : null;
			this.parent = o.target !== undefined ? o.target : this.parent;

			if (this.parent === null && !this.isCanvas) {
				this.parent = document.body; // default position

				if (!this.isCenter) this.content.style.right = '10px';
			}

			if (this.parent !== null) this.parent.appendChild(this.content);
			if (this.isCanvas && this.parent === null) this.isCanvasOnly = true;
			if (!this.isCanvasOnly) this.content.style.pointerEvents = 'auto';
			this.setWidth();
			if (this.isCanvas) this.makeCanvas();
			Roots.add(this);
		}

		var _proto = Gui.prototype;

		_proto.setTop = function setTop(t, h) {
			this.content.style.top = t + 'px';
			if (h !== undefined) this.forceHeight = h;
			this.setHeight();
			Roots.needReZone = true;
		} //callback: function () {},
		;

		_proto.dispose = function dispose() {
			this.clear();
			if (this.parent !== null) this.parent.removeChild(this.content);
			Roots.remove(this);
		} // ----------------------
		//	 CANVAS
		// ----------------------
		;

		_proto.onDraw = function onDraw() {};

		_proto.makeCanvas = function makeCanvas() {
			this.canvas = document.createElementNS('http://www.w3.org/1999/xhtml', "canvas");
			this.canvas.width = this.zone.w;
			this.canvas.height = this.forceHeight ? this.forceHeight : this.zone.h;
		};

		_proto.draw = function draw(force) {
			if (this.canvas === null) return;
			var w = this.zone.w;
			var h = this.forceHeight ? this.forceHeight : this.zone.h;
			Roots.toCanvas(this, w, h, force);
		} //////
		;

		_proto.getDom = function getDom() {
			return this.content;
		};

		_proto.setMouse = function setMouse(m) {
			this.mouse.set(m.x, m.y);
		};

		_proto.setConfig = function setConfig(o) {
			this.setColors(o);
			this.setText(o.fontSize, o.text, o.font, o.shadow);
		};

		_proto.setColors = function setColors(o) {
			for (var c in o) {
				if (this.colors[c]) this.colors[c] = o[c];
			}
		};

		_proto.setText = function setText(size, color, font, shadow) {
			Tools.setText(size, color, font, shadow, this.colors, this.css);
		};

		_proto.hide = function hide(b) {
			this.content.style.display = b ? 'none' : 'block';
		};

		_proto.onChange = function onChange(f) {
			this.callback = f || null;
			return this;
		} // ----------------------
		//	 STYLES
		// ----------------------
		;

		_proto.mode = function mode(n) {
			var needChange = false;

			if (n !== this.cn) {
				this.cn = n;

				switch (n) {
					case 'def':
						this.scroll.style.background = this.colors.scroll;
						this.bottom.style.background = this.colors.background;
						this.bottom.style.color = this.colors.text;
						break;
					//case 'scrollDef': this.scroll.style.background = this.colors.scroll; break;

					case 'scrollOver':
						this.scroll.style.background = this.colors.select;
						break;

					case 'scrollDown':
						this.scroll.style.background = this.colors.down;
						break;
					//case 'bottomDef': this.bottom.style.background = this.colors.background; break;

					case 'bottomOver':
						this.bottom.style.background = this.colors.backgroundOver;
						this.bottom.style.color = '#FFF';
						break;
					//case 'bottomDown': this.bottom.style.background = this.colors.select; this.bottom.style.color = '#000'; break;
				}

				needChange = true;
			}

			return needChange;
		} // ----------------------
		//	 TARGET
		// ----------------------
		;

		_proto.clearTarget = function clearTarget() {
			if (this.current === -1) return false; //if(!this.target) return;

			this.target.uiout();
			this.target.reset();
			this.target = null;
			this.current = -1; ///console.log(this.isDown)//if(this.isDown)Roots.clearInput();

			Roots.cursor();
			return true;
		} // ----------------------
		//	 ZONE TEST
		// ----------------------
		;

		_proto.testZone = function testZone(e) {
			var l = this.local;
			if (l.x === -1 && l.y === -1) return '';
			this.isReset = false;
			var name = '';
			var s = this.isScroll ? this.zone.w - this.size.s : this.zone.w;
			if (l.y > this.zone.h - this.bh && l.y < this.zone.h) name = 'bottom';else name = l.x > s ? 'scroll' : 'content';
			return name;
		} // ----------------------
		//	 EVENTS
		// ----------------------
		;

		_proto.handleEvent = function handleEvent(e) {
			var type = e.type;
			var change = false;
			var targetChange = false;
			var name = this.testZone(e);
			if (type === 'mouseup' && this.isDown) this.isDown = false;
			if (type === 'mousedown' && !this.isDown) this.isDown = true;

			if (this.isDown && this.isNewTarget) {
				Roots.clearInput();
				this.isNewTarget = false;
			}

			if (!name) return;

			switch (name) {
				case 'content':
					e.clientY = this.isScroll ? e.clientY + this.decal : e.clientY;
					if (Roots.isMobile && type === 'mousedown') this.getNext(e, change);
					if (this.target) targetChange = this.target.handleEvent(e);
					if (type === 'mousemove') change = this.mode('def');
					if (type === 'wheel' && !targetChange && this.isScroll) change = this.onWheel(e);

					if (!Roots.lock) {
						this.getNext(e, change);
					}

					break;

				case 'bottom':
					this.clearTarget();
					if (type === 'mousemove') change = this.mode('bottomOver');

					if (type === 'mousedown') {
						this.isOpen = this.isOpen ? false : true;
						this.bottom.textContent = this.isOpen ? 'Close' : 'Open';
						this.setHeight();
						this.mode('def');
						change = true;
					}

					break;

				case 'scroll':
					this.clearTarget();
					if (type === 'mousemove') change = this.mode('scrollOver');
					if (type === 'mousedown') change = this.mode('scrollDown');
					if (type === 'wheel') change = this.onWheel(e);
					if (this.isDown) this.update(e.clientY - this.zone.y - this.sh * 0.5);
					break;
			}

			if (this.isDown) change = true;
			if (targetChange) change = true;
			if (type === 'keyup') change = true;
			if (type === 'keydown') change = true;
			if (change) this.draw();
		};

		_proto.getNext = function getNext(e, change) {
			var next = Roots.findTarget(this.uis, e);

			if (next !== this.current) {
				this.clearTarget();
				this.current = next;
				this.isNewTarget = true;
			}

			if (next !== -1) {
				this.target = this.uis[this.current];
				this.target.uiover();
			}
		};

		_proto.onWheel = function onWheel(e) {
			this.oy += 20 * e.delta;
			this.update(this.oy);
			return true;
		} // ----------------------
		//	 RESET
		// ----------------------
		;

		_proto.reset = function reset(force) {
			if (this.isReset) return; //this.resetItem();

			this.mouse.neg();
			this.isDown = false; //Roots.clearInput();

			var r = this.mode('def');
			var r2 = this.clearTarget();
			if (r || r2) this.draw(true);
			this.isReset = true; //Roots.lock = false;
		} // ----------------------
		//	 ADD NODE
		// ----------------------
		;

		_proto.add = function add$1() {
			var a = arguments;
			var ontop = false;

			if (typeof a[1] === 'object') {
				a[1].isUI = true;
				a[1].main = this;
				ontop = a[1].ontop ? a[1].ontop : false;
			} else if (typeof a[1] === 'string') {
				if (a[2] === undefined) [].push.call(a, {
					isUI: true,
					main: this
				});else {
					a[2].isUI = true;
					a[2].main = this;
					ontop = a[1].ontop ? a[1].ontop : false;
				}
			}

			var u = add.apply(this, a);

			if (u === null) return;
			if (ontop) this.uis.unshift(u);else this.uis.push(u);

			if (!u.autoWidth) {
				var y = u.c[0].getBoundingClientRect().top;

				if (this.prevY !== y) {
					this.calc(u.h + 1);
					this.prevY = y;
				}
			} else {
				this.prevY = 0; //-1;

				this.calc(u.h + 1);
			}

			this.isEmpty = false;
			return u;
		};

		_proto.applyCalc = function applyCalc() {
			//console.log(this.uis.length, this.tmpH )
			this.calc(this.tmpH); //this.tmpH = 0;

			this.tmpAdd = null;
		};

		_proto.calcUis = function calcUis() {
			Roots.calcUis(this.uis, this.zone, this.zone.y);
		} // remove one node
		;

		_proto.remove = function remove(n) {
			if (n.clear) n.clear();
		} // call after uis clear
		;

		_proto.clearOne = function clearOne(n) {
			var id = this.uis.indexOf(n);

			if (id !== -1) {
				this.calc(-(this.uis[id].h + 1));
				this.inner.removeChild(this.uis[id].c[0]);
				this.uis.splice(id, 1);
			}
		} // clear all gui
		;

		_proto.empty = function empty() {
			//this.close();
			var i = this.uis.length,
					item;

			while (i--) {
				item = this.uis.pop();
				this.inner.removeChild(item.c[0]);
				item.clear(true); //this.uis[i].clear()
			}

			this.isEmpty = true; //Roots.listens = [];

			this.calc(-this.h);
		};

		_proto.clear = function clear() {
			this.empty(); //this.callback = null;

			/*let i = this.uis.length;
			while( i-- ) this.uis[i].clear();
				this.uis = [];
			Roots.listens = [];
				this.calc( -this.h );*/
		} // ----------------------
		//	 ITEMS SPECIAL
		// ----------------------
		;

		_proto.resetItem = function resetItem() {
			if (!this.isItemMode) return;
			var i = this.uis.length;

			while (i--) {
				this.uis[i].selected();
			}
		};

		_proto.setItem = function setItem(name) {
			if (!this.isItemMode) return;
			name = name || '';
			this.resetItem();

			if (!name) {
				this.update(0);
				return;
			}

			var i = this.uis.length;

			while (i--) {
				if (this.uis[i].value === name) {
					this.uis[i].selected(true);
					if (this.isScroll) this.update(i * (this.uis[i].h + 1) * this.ratio);
				}
			}
		} // ----------------------
		//	 SCROLL
		// ----------------------
		;

		_proto.upScroll = function upScroll(b) {
			this.sw = b ? this.size.s : 0;
			this.oy = b ? this.oy : 0;
			this.scrollBG.style.display = b ? 'block' : 'none';

			if (b) {
				this.total = this.h;
				this.maxView = this.maxHeight;
				this.ratio = this.maxView / this.total;
				this.sh = this.maxView * this.ratio; //if( this.sh < 20 ) this.sh = 20;

				this.range = this.maxView - this.sh;
				this.oy = Tools.clamp(this.oy, 0, this.range);
				this.scrollBG.style.height = this.maxView + 'px';
				this.scroll.style.height = this.sh + 'px';
			}

			this.setItemWidth(this.zone.w - this.sw);
			this.update(this.oy);
		};

		_proto.update = function update(y) {
			y = Tools.clamp(y, 0, this.range);
			this.decal = Math.floor(y / this.ratio);
			this.inner.style.top = -this.decal + 'px';
			this.scroll.style.top = Math.floor(y) + 'px';
			this.oy = y;
		} // ----------------------
		//	 RESIZE FUNCTION
		// ----------------------
		;

		_proto.calc = function calc(y) {
			this.h += y;
			clearTimeout(this.tmp);
			this.tmp = setTimeout(this.setHeight.bind(this), 10);
		};

		_proto.setHeight = function setHeight() {
			if (this.tmp) clearTimeout(this.tmp); //console.log(this.h )

			this.zone.h = this.bh;
			this.isScroll = false;

			if (this.isOpen) {
				var hhh = this.forceHeight ? this.forceHeight + this.zone.y : window.innerHeight;
				this.maxHeight = hhh - this.zone.y - this.bh;
				var diff = this.h - this.maxHeight;

				if (diff > 1) {
					//this.h > this.maxHeight ){
					this.isScroll = true;
					this.zone.h = this.maxHeight + this.bh;
				} else {
					this.zone.h = this.h + this.bh;
				}
			}

			this.upScroll(this.isScroll);
			this.innerContent.style.height = this.zone.h - this.bh + 'px';
			this.content.style.height = this.zone.h + 'px';
			this.bottom.style.top = this.zone.h - this.bh + 'px';
			if (this.forceHeight && this.lockHeight) this.content.style.height = this.forceHeight + 'px';
			if (this.isOpen) this.calcUis();
			if (this.isCanvas) this.draw(true);
		};

		_proto.rezone = function rezone() {
			Roots.needReZone = true;
		};

		_proto.setWidth = function setWidth(w) {
			if (w) this.zone.w = w;
			this.content.style.width = this.zone.w + 'px';
			if (this.isCenter) this.content.style.marginLeft = -Math.floor(this.zone.w * 0.5) + 'px';
			this.setItemWidth(this.zone.w - this.sw);
			this.setHeight();
			if (!this.isCanvasOnly) Roots.needReZone = true; //this.resize();
		};

		_proto.setItemWidth = function setItemWidth(w) {
			var i = this.uis.length;

			while (i--) {
				this.uis[i].setSize(w);
				this.uis[i].rSize();
			}
		};

		return Gui;
	}();
	Gui.prototype.isGui = true;

	var REVISION = '3.0';

	exports.Bool = Bool;
	exports.Button = Button;
	exports.Circular = Circular;
	exports.Color = Color;
	exports.Fps = Fps;
	exports.Group = Group;
	exports.Gui = Gui;
	exports.Joystick = Joystick;
	exports.Knob = Knob;
	exports.List = List;
	exports.Numeric = Numeric;
	exports.Proto = Proto;
	exports.REVISION = REVISION;
	exports.Slide = Slide;
	exports.TextInput = TextInput;
	exports.Title = Title;
	exports.Tools = Tools;
	exports.add = add;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlsLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwiLi4vc3JjL2NvcmUvVG9vbHMuanMiLCIuLi9zcmMvY29yZS9Sb290cy5qcyIsIi4uL3NyYy9jb3JlL1YyLmpzIiwiLi4vc3JjL2NvcmUvUHJvdG8uanMiLCIuLi9zcmMvcHJvdG8vQm9vbC5qcyIsIi4uL3NyYy9wcm90by9CdXR0b24uanMiLCIuLi9zcmMvcHJvdG8vQ2lyY3VsYXIuanMiLCIuLi9zcmMvcHJvdG8vQ29sb3IuanMiLCIuLi9zcmMvcHJvdG8vRnBzLmpzIiwiLi4vc3JjL3Byb3RvL0dyYXBoLmpzIiwiLi4vc3JjL3Byb3RvL0dyb3VwLmpzIiwiLi4vc3JjL3Byb3RvL0pveXN0aWNrLmpzIiwiLi4vc3JjL3Byb3RvL0tub2IuanMiLCIuLi9zcmMvcHJvdG8vTGlzdC5qcyIsIi4uL3NyYy9wcm90by9OdW1lcmljLmpzIiwiLi4vc3JjL3Byb3RvL1NsaWRlLmpzIiwiLi4vc3JjL3Byb3RvL1RleHRJbnB1dC5qcyIsIi4uL3NyYy9wcm90by9UaXRsZS5qcyIsIi4uL3NyYy9wcm90by9TZWxlY3QuanMiLCIuLi9zcmMvcHJvdG8vU2VsZWN0b3IuanMiLCIuLi9zcmMvcHJvdG8vRW1wdHkuanMiLCIuLi9zcmMvcHJvdG8vSXRlbS5qcyIsIi4uL3NyYy9wcm90by9HcmlkLmpzIiwiLi4vc3JjL2NvcmUvYWRkLmpzIiwiLi4vc3JjL2NvcmUvR3VpLmpzIiwiLi4vc3JjL1VpbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gZGVmaW5lKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIG9ialtrZXldO1xuICB9XG4gIHRyeSB7XG4gICAgLy8gSUUgOCBoYXMgYSBicm9rZW4gT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoYXQgb25seSB3b3JrcyBvbiBET00gb2JqZWN0cy5cbiAgICBkZWZpbmUoe30sIFwiXCIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBkZWZpbmUgPSBmdW5jdGlvbihvYmosIGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XSA9IHZhbHVlO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IGRlZmluZShcbiAgICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSxcbiAgICB0b1N0cmluZ1RhZ1N5bWJvbCxcbiAgICBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgKTtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBkZWZpbmUocHJvdG90eXBlLCBtZXRob2QsIGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBkZWZpbmUoZ2VuRnVuLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JGdW5jdGlvblwiKTtcbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yLCBQcm9taXNlSW1wbCkge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlSW1wbChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QsIFByb21pc2VJbXBsKSB7XG4gICAgaWYgKFByb21pc2VJbXBsID09PSB2b2lkIDApIFByb21pc2VJbXBsID0gUHJvbWlzZTtcblxuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSxcbiAgICAgIFByb21pc2VJbXBsXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBkZWZpbmUoR3AsIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvclwiKTtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiIsIi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmNvbnN0IFQgPSB7XHJcblxyXG4gICAgZnJhZzogZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxyXG5cclxuICAgIGNvbG9yUmluZzogbnVsbCxcclxuICAgIGpveXN0aWNrXzA6IG51bGwsXHJcbiAgICBqb3lzdGlja18xOiBudWxsLFxyXG4gICAgY2lyY3VsYXI6IG51bGwsXHJcbiAgICBrbm9iOiBudWxsLFxyXG5cclxuICAgIHN2Z25zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXHJcbiAgICBsaW5rczogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsXHJcbiAgICBodG1sczogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXHJcblxyXG4gICAgRE9NX1NJWkU6IFsgJ2hlaWdodCcsICd3aWR0aCcsICd0b3AnLCAnbGVmdCcsICdib3R0b20nLCAncmlnaHQnLCAnbWFyZ2luLWxlZnQnLCAnbWFyZ2luLXJpZ2h0JywgJ21hcmdpbi10b3AnLCAnbWFyZ2luLWJvdHRvbSddLFxyXG4gICAgU1ZHX1RZUEVfRDogWyAncGF0dGVybicsICdkZWZzJywgJ3RyYW5zZm9ybScsICdzdG9wJywgJ2FuaW1hdGUnLCAncmFkaWFsR3JhZGllbnQnLCAnbGluZWFyR3JhZGllbnQnLCAnYW5pbWF0ZU1vdGlvbicsICd1c2UnLCAnZmlsdGVyJywgJ2ZlQ29sb3JNYXRyaXgnIF0sXHJcbiAgICBTVkdfVFlQRV9HOiBbICdzdmcnLCAncmVjdCcsICdjaXJjbGUnLCAncGF0aCcsICdwb2x5Z29uJywgJ3RleHQnLCAnZycsICdsaW5lJywgJ2ZvcmVpZ25PYmplY3QnIF0sXHJcblxyXG4gICAgUEk6IE1hdGguUEksXHJcbiAgICBUd29QSTogTWF0aC5QSSoyLFxyXG4gICAgcGk5MDogTWF0aC5QSSAqIDAuNSxcclxuICAgIHBpNjA6IE1hdGguUEkvMyxcclxuICAgIFxyXG4gICAgdG9yYWQ6IE1hdGguUEkgLyAxODAsXHJcbiAgICB0b2RlZzogMTgwIC8gTWF0aC5QSSxcclxuXHJcbiAgICBjbGFtcDogZnVuY3Rpb24gKHYsIG1pbiwgbWF4KSB7XHJcblxyXG4gICAgICAgIHYgPSB2IDwgbWluID8gbWluIDogdjtcclxuICAgICAgICB2ID0gdiA+IG1heCA/IG1heCA6IHY7XHJcbiAgICAgICAgcmV0dXJuIHY7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzaXplOiB7ICB3OiAyNDAsIGg6IDIwLCBwOiAzMCwgczogOCB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ09MT1JcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjb2xvcnM6IHtcclxuXHJcbiAgICAgICAgdGV4dCA6ICcjZGNkY2RjJyxcclxuICAgICAgICB0ZXh0T3ZlciA6ICcjRkZGRkZGJyxcclxuICAgICAgICB0eHRzZWxlY3RiZyA6ICdub25lJyxcclxuXHJcbiAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoNTAsNTAsNTAsMC41KScsLy8ncmdiYSg0NCw0NCw0NCwwLjMpJyxcclxuICAgICAgICBiYWNrZ3JvdW5kT3ZlcjogJ3JnYmEoNTAsNTAsNTAsMC41KScsLy8ncmdiYSgxMSwxMSwxMSwwLjUpJyxcclxuXHJcbiAgICAgICAgLy9pbnB1dDogJyMwMDVBQUEnLFxyXG5cclxuICAgICAgICBpbnB1dEJvcmRlcjogJyM0NTQ1NDUnLFxyXG4gICAgICAgIGlucHV0SG9sZGVyOiAnIzgwODA4MCcsXHJcbiAgICAgICAgaW5wdXRCb3JkZXJTZWxlY3Q6ICcjMDA1QUFBJyxcclxuICAgICAgICBpbnB1dEJnOiAncmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICBpbnB1dE92ZXI6ICdyZ2JhKDAsMCwwLDAuMiknLFxyXG5cclxuICAgICAgICAvLyBpbnB1dCBib3JkZXJcclxuICAgICAgICBib3JkZXIgOiAnIzQ1NDU0NScsXHJcbiAgICAgICAgYm9yZGVyT3ZlciA6ICcjNTA1MEFBJyxcclxuICAgICAgICBib3JkZXJTZWxlY3QgOiAnIzMwOEFGRicsXHJcblxyXG4gICAgICAgIGJ1dHRvbiA6ICcjM2MzYzNjJywgLy8nIzQwNDA0MCcsXHJcbiAgICAgICAgYm9vbGJnIDogJyMxODE4MTgnLFxyXG4gICAgICAgIGJvb2xvbiA6ICcjQzBDMEMwJyxcclxuXHJcbiAgICAgICAgc2VsZWN0IDogJyMzMDhBRkYnLFxyXG4gICAgICAgIG1vdmluZyA6ICcjMDNhZmZmJyxcclxuICAgICAgICBkb3duIDogJyMwMjQ2OTknLFxyXG4gICAgICAgIG92ZXIgOiAnIzAyNDY5OScsXHJcbiAgICAgICAgYWN0aW9uOiAnI0ZGMzMwMCcsXHJcblxyXG4gICAgICAgIHN0cm9rZTogJ3JnYmEoMTEsMTEsMTEsMC41KScsXHJcblxyXG4gICAgICAgIHNjcm9sbDogJyMzMzMzMzMnLFxyXG4gICAgICAgIHNjcm9sbGJhY2s6J3JnYmEoNDQsNDQsNDQsMC4yKScsXHJcbiAgICAgICAgc2Nyb2xsYmFja292ZXI6J3JnYmEoNDQsNDQsNDQsMC4yKScsXHJcblxyXG4gICAgICAgIGhpZGU6ICdyZ2JhKDAsMCwwLDApJyxcclxuXHJcbiAgICAgICAgZ3JvdXBCb3JkZXI6ICcjM2UzZTNlJywgLy8nbm9uZScsXHJcbiAgICAgICAgYnV0dG9uQm9yZGVyOiAnIzRhNGE0YScsLy8nbm9uZScsXHJcblxyXG4gICAgICAgIGZvbnRGYW1pbHk6ICdUYWhvbWEnLFxyXG4gICAgICAgIGZvbnRTaGFkb3c6ICdub25lJyxcclxuICAgICAgICBmb250U2l6ZToxMSxcclxuXHJcbiAgICAgICAgcmFkaXVzOjQsXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBzdHlsZSBjc3NcclxuXHJcbiAgICBjc3MgOiB7XHJcbiAgICAgICAgLy91bnNlbGVjdDogJy1vLXVzZXItc2VsZWN0Om5vbmU7IC1tcy11c2VyLXNlbGVjdDpub25lOyAta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTsgLXdlYmtpdC11c2VyLXNlbGVjdDpub25lOyAtbW96LXVzZXItc2VsZWN0Om5vbmU7JywgXHJcbiAgICAgICAgYmFzaWM6ICdwb3NpdGlvbjphYnNvbHV0ZTsgcG9pbnRlci1ldmVudHM6bm9uZTsgYm94LXNpemluZzpib3JkZXItYm94OyBtYXJnaW46MDsgcGFkZGluZzowOyBvdmVyZmxvdzpoaWRkZW47ICcgKyAnLW8tdXNlci1zZWxlY3Q6bm9uZTsgLW1zLXVzZXItc2VsZWN0Om5vbmU7IC1raHRtbC11c2VyLXNlbGVjdDpub25lOyAtd2Via2l0LXVzZXItc2VsZWN0Om5vbmU7IC1tb3otdXNlci1zZWxlY3Q6bm9uZTsnLFxyXG4gICAgICAgIGJ1dHRvbjonZGlzcGxheTpmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBhbGlnbi1pdGVtczpjZW50ZXI7IHRleHQtYWxpZ246Y2VudGVyOycsXHJcblxyXG4gICAgICAgIC8qdHh0OiBULmNzcy5iYXNpYyArICdmb250LWZhbWlseTonKyBULmNvbG9ycy5mb250RmFtaWx5ICsnOyBmb250LXNpemU6JytULmNvbG9ycy5mb250U2l6ZSsncHg7IGNvbG9yOicrVC5jb2xvcnMudGV4dCsnOyBwYWRkaW5nOjJweCAxMHB4OyBsZWZ0OjA7IHRvcDoycHg7IGhlaWdodDoxNnB4OyB3aWR0aDoxMDBweDsgb3ZlcmZsb3c6aGlkZGVuOyB3aGl0ZS1zcGFjZTogbm93cmFwOycsXHJcbiAgICAgICAgdHh0c2VsZWN0OiAgVC5jc3MudHh0ICsgJ2Rpc3BsYXk6ZmxleDsganVzdGlmeS1jb250ZW50OmxlZnQ7IGFsaWduLWl0ZW1zOmNlbnRlcjsgdGV4dC1hbGlnbjpsZWZ0OycgKydwYWRkaW5nOjJweCA1cHg7IGJvcmRlcjoxcHggZGFzaGVkICcgKyBULmNvbG9ycy5ib3JkZXIgKyAnOyBiYWNrZ3JvdW5kOicrIFQuY29sb3JzLnR4dHNlbGVjdGJnKyc7JyxcclxuICAgICAgICBpdGVtOiBULmNzcy50eHQgKyAncG9zaXRpb246cmVsYXRpdmU7IGJhY2tncm91bmQ6cmdiYSgwLDAsMCwwLjIpOyBtYXJnaW4tYm90dG9tOjFweDsnLCovXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHN2ZyBwYXRoXHJcblxyXG4gICAgc3Znczoge1xyXG5cclxuICAgICAgICBncm91cDonTSA3IDcgTCA3IDggOCA4IDggNyA3IDcgTSA1IDcgTCA1IDggNiA4IDYgNyA1IDcgTSAzIDcgTCAzIDggNCA4IDQgNyAzIDcgTSA3IDUgTCA3IDYgOCA2IDggNSA3IDUgTSA2IDYgTCA2IDUgNSA1IDUgNiA2IDYgTSA3IDMgTCA3IDQgOCA0IDggMyA3IDMgTSA2IDQgTCA2IDMgNSAzIDUgNCA2IDQgTSAzIDUgTCAzIDYgNCA2IDQgNSAzIDUgTSAzIDMgTCAzIDQgNCA0IDQgMyAzIDMgWicsXHJcbiAgICAgICAgYXJyb3c6J00gMyA4IEwgOCA1IDMgMiAzIDggWicsXHJcbiAgICAgICAgYXJyb3dEb3duOidNIDUgOCBMIDggMyAyIDMgNSA4IFonLFxyXG4gICAgICAgIGFycm93VXA6J00gNSAyIEwgMiA3IDggNyA1IDIgWicsXHJcblxyXG4gICAgICAgIHNvbGlkOidNIDEzIDEwIEwgMTMgMSA0IDEgMSA0IDEgMTMgMTAgMTMgMTMgMTAgTSAxMSAzIEwgMTEgOSA5IDExIDMgMTEgMyA1IDUgMyAxMSAzIFonLFxyXG4gICAgICAgIGJvZHk6J00gMTMgMTAgTCAxMyAxIDQgMSAxIDQgMSAxMyAxMCAxMyAxMyAxMCBNIDExIDMgTCAxMSA5IDkgMTEgMyAxMSAzIDUgNSAzIDExIDMgTSA1IDQgTCA0IDUgNCAxMCA5IDEwIDEwIDkgMTAgNCA1IDQgWicsXHJcbiAgICAgICAgdmVoaWNsZTonTSAxMyA2IEwgMTEgMSAzIDEgMSA2IDEgMTMgMyAxMyAzIDExIDExIDExIDExIDEzIDEzIDEzIDEzIDYgTSAyLjQgNiBMIDQgMiAxMCAyIDExLjYgNiAyLjQgNiBNIDEyIDggTCAxMiAxMCAxMCAxMCAxMCA4IDEyIDggTSA0IDggTCA0IDEwIDIgMTAgMiA4IDQgOCBaJyxcclxuICAgICAgICBhcnRpY3VsYXRpb246J00gMTMgOSBMIDEyIDkgOSAyIDkgMSA1IDEgNSAyIDIgOSAxIDkgMSAxMyA1IDEzIDUgOSA0IDkgNiA1IDggNSAxMCA5IDkgOSA5IDEzIDEzIDEzIDEzIDkgWicsXHJcbiAgICAgICAgY2hhcmFjdGVyOidNIDEzIDQgTCAxMiAzIDkgNCA1IDQgMiAzIDEgNCA1IDYgNSA4IDQgMTMgNiAxMyA3IDkgOCAxMyAxMCAxMyA5IDggOSA2IDEzIDQgTSA2IDEgTCA2IDMgOCAzIDggMSA2IDEgWicsXHJcbiAgICAgICAgdGVycmFpbjonTSAxMyA4IEwgMTIgNyBRIDkuMDYgLTMuNjcgNS45NSA0Ljg1IDQuMDQgMy4yNyAyIDcgTCAxIDggNyAxMyAxMyA4IE0gMyA4IFEgMy43OCA1LjQyMCA1LjQgNi42IDUuMjAgNy4yNSA1IDggTCA3IDggUSA4LjM5IC0wLjE2IDExIDggTCA3IDExIDMgOCBaJyxcclxuICAgICAgICBqb2ludDonTSA3LjcgNy43IFEgOCA3LjQ1IDggNyA4IDYuNiA3LjcgNi4zIDcuNDUgNiA3IDYgNi42IDYgNi4zIDYuMyA2IDYuNiA2IDcgNiA3LjQ1IDYuMyA3LjcgNi42IDggNyA4IDcuNDUgOCA3LjcgNy43IE0gMy4zNSA4LjY1IEwgMSAxMSAzIDEzIDUuMzUgMTAuNjUgUSA2LjEgMTEgNyAxMSA4LjI4IDExIDkuMjUgMTAuMjUgTCA3LjggOC44IFEgNy40NSA5IDcgOSA2LjE1IDkgNS41NSA4LjQgNSA3Ljg1IDUgNyA1IDYuNTQgNS4xNSA2LjE1IEwgMy43IDQuNyBRIDMgNS43MTIgMyA3IDMgNy45IDMuMzUgOC42NSBNIDEwLjI1IDkuMjUgUSAxMSA4LjI4IDExIDcgMTEgNi4xIDEwLjY1IDUuMzUgTCAxMyAzIDExIDEgOC42NSAzLjM1IFEgNy45IDMgNyAzIDUuNyAzIDQuNyAzLjcgTCA2LjE1IDUuMTUgUSA2LjU0IDUgNyA1IDcuODUgNSA4LjQgNS41NSA5IDYuMTUgOSA3IDkgNy40NSA4LjggNy44IEwgMTAuMjUgOS4yNSBaJyxcclxuICAgICAgICByYXk6J00gOSAxMSBMIDUgMTEgNSAxMiA5IDEyIDkgMTEgTSAxMiA1IEwgMTEgNSAxMSA5IDEyIDkgMTIgNSBNIDExLjUgMTAgUSAxMC45IDEwIDEwLjQ1IDEwLjQ1IDEwIDEwLjkgMTAgMTEuNSAxMCAxMi4yIDEwLjQ1IDEyLjU1IDEwLjkgMTMgMTEuNSAxMyAxMi4yIDEzIDEyLjU1IDEyLjU1IDEzIDEyLjIgMTMgMTEuNSAxMyAxMC45IDEyLjU1IDEwLjQ1IDEyLjIgMTAgMTEuNSAxMCBNIDkgMTAgTCAxMCA5IDIgMSAxIDIgOSAxMCBaJyxcclxuICAgICAgICBjb2xsaXNpb246J00gMTEgMTIgTCAxMyAxMCAxMCA3IDEzIDQgMTEgMiA3LjUgNS41IDkgNyA3LjUgOC41IDExIDEyIE0gMyAyIEwgMSA0IDQgNyAxIDEwIDMgMTIgOCA3IDMgMiBaJyxcclxuICAgICAgICBtYXA6J00gMTMgMSBMIDEgMSAxIDEzIDEzIDEzIDEzIDEgTSAxMiAyIEwgMTIgNyA3IDcgNyAxMiAyIDEyIDIgNyA3IDcgNyAyIDEyIDIgWicsXHJcbiAgICAgICAgbWF0ZXJpYWw6J00gMTMgMSBMIDEgMSAxIDEzIDEzIDEzIDEzIDEgTSAxMiAyIEwgMTIgNyA3IDcgNyAxMiAyIDEyIDIgNyA3IDcgNyAyIDEyIDIgWicsXHJcbiAgICAgICAgdGV4dHVyZTonTSAxMyA0IEwgMTMgMSAxIDEgMSA0IDUgNCA1IDEzIDkgMTMgOSA0IDEzIDQgWicsXHJcbiAgICAgICAgb2JqZWN0OidNIDEwIDEgTCA3IDQgNCAxIDEgMSAxIDEzIDQgMTMgNCA1IDcgOCAxMCA1IDEwIDEzIDEzIDEzIDEzIDEgMTAgMSBaJyxcclxuICAgICAgICBub25lOidNIDkgNSBMIDUgNSA1IDkgOSA5IDkgNSBaJyxcclxuICAgICAgICBjdXJzb3I6J00gNCA3IEwgMSAxMCAxIDEyIDIgMTMgNCAxMyA3IDEwIDkgMTQgMTQgMCAwIDUgNCA3IFonLFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0U3R5bGUgOiBmdW5jdGlvbiAoIGRhdGEgKXtcclxuXHJcbiAgICAgICAgZm9yICggdmFyIG8gaW4gZGF0YSApe1xyXG4gICAgICAgICAgICBpZiggVC5jb2xvcnNbb10gKSBULmNvbG9yc1tvXSA9IGRhdGFbb107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBULnNldFRleHQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGN1c3RvbSB0ZXh0XHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0VGV4dCA6IGZ1bmN0aW9uKCBzaXplLCBjb2xvciwgZm9udCwgc2hhZG93ICl7XHJcblxyXG4gICAgICAgIGxldCBjID0gVC5jb2xvcnM7XHJcblxyXG4gICAgICAgIGlmKCBmb250ICE9PSB1bmRlZmluZWQgKSBjLmZvbnRGYW1pbHkgPSBmb250O1xyXG4gICAgICAgIGlmKCBjb2xvciAhPT0gdW5kZWZpbmVkICkgYy50ZXh0ID0gY29sb3I7XHJcbiAgICAgICAgaWYoIHNpemUgIT09IHVuZGVmaW5lZCApIGMuZm9udFNpemUgPSBzaXplO1xyXG5cclxuICAgICAgICBULmNzcy50eHQgPSBULmNzcy5iYXNpYyArICdmb250LWZhbWlseTonKyBjLmZvbnRGYW1pbHkgKyc7IGZvbnQtc2l6ZTonK2MuZm9udFNpemUrJ3B4OyBjb2xvcjonK2MudGV4dCsnOyBwYWRkaW5nOjJweCAxMHB4OyBsZWZ0OjA7IHRvcDoycHg7IGhlaWdodDoxNnB4OyB3aWR0aDoxMDBweDsgb3ZlcmZsb3c6aGlkZGVuOyB3aGl0ZS1zcGFjZTogbm93cmFwOyc7XHJcbiAgICAgICAgaWYoIHNoYWRvdyAhPT0gdW5kZWZpbmVkICkgVC5jc3MudHh0ICs9ICcgdGV4dC1zaGFkb3c6Jysgc2hhZG93ICsgJzsgJzsgLy9cIjFweCAxcHggMXB4ICNmZjAwMDBcIjtcclxuICAgICAgICBpZiggYy5mb250U2hhZG93ICE9PSAnbm9uZScgKSBULmNzcy50eHQgKz0gJyB0ZXh0LXNoYWRvdzogMXB4IDFweCAxcHggJytjLmZvbnRTaGFkb3crJzsnO1xyXG4gICAgICAgIFQuY3NzLnR4dHNlbGVjdCA9IFQuY3NzLnR4dCArICdkaXNwbGF5OmZsZXg7IGp1c3RpZnktY29udGVudDpsZWZ0OyBhbGlnbi1pdGVtczpjZW50ZXI7IHRleHQtYWxpZ246bGVmdDsnICsncGFkZGluZzoycHggNXB4OyBib3JkZXI6MXB4IGRhc2hlZCAnICsgYy5ib3JkZXIgKyAnOyBiYWNrZ3JvdW5kOicrIGMudHh0c2VsZWN0YmcrJzsnO1xyXG4gICAgICAgIFQuY3NzLml0ZW0gPSBULmNzcy50eHQgKyAncG9zaXRpb246cmVsYXRpdmU7IGJhY2tncm91bmQ6cmdiYSgwLDAsMCwwLjIpOyBtYXJnaW4tYm90dG9tOjFweDsnO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIC8vIGludGVybiBmdW5jdGlvblxyXG5cclxuICAgIGNsb25lQ29sb3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGNjID0gT2JqZWN0LmFzc2lnbih7fSwgVC5jb2xvcnMgKTtcclxuICAgICAgICByZXR1cm4gY2M7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZUNzczogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgY2MgPSBPYmplY3QuYXNzaWduKHt9LCBULmNzcyApO1xyXG4gICAgICAgIHJldHVybiBjYztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsb25lOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBvLmNsb25lTm9kZSggdHJ1ZSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0U3ZnOiBmdW5jdGlvbiggZG9tLCB0eXBlLCB2YWx1ZSwgaWQsIGlkMiApe1xyXG5cclxuICAgICAgICBpZiggaWQgPT09IC0xICkgZG9tLnNldEF0dHJpYnV0ZU5TKCBudWxsLCB0eXBlLCB2YWx1ZSApO1xyXG4gICAgICAgIGVsc2UgaWYoIGlkMiAhPT0gdW5kZWZpbmVkICkgZG9tLmNoaWxkTm9kZXNbIGlkIHx8IDAgXS5jaGlsZE5vZGVzWyBpZDIgfHwgMCBdLnNldEF0dHJpYnV0ZU5TKCBudWxsLCB0eXBlLCB2YWx1ZSApO1xyXG4gICAgICAgIGVsc2UgZG9tLmNoaWxkTm9kZXNbIGlkIHx8IDAgXS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENzczogZnVuY3Rpb24oIGRvbSwgY3NzICl7XHJcblxyXG4gICAgICAgIGZvciggbGV0IHIgaW4gY3NzICl7XHJcbiAgICAgICAgICAgIGlmKCBULkRPTV9TSVpFLmluZGV4T2YocikgIT09IC0xICkgZG9tLnN0eWxlW3JdID0gY3NzW3JdICsgJ3B4JztcclxuICAgICAgICAgICAgZWxzZSBkb20uc3R5bGVbcl0gPSBjc3Nbcl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0OiBmdW5jdGlvbiggZywgbyApe1xyXG5cclxuICAgICAgICBmb3IoIGxldCBhdHQgaW4gbyApe1xyXG4gICAgICAgICAgICBpZiggYXR0ID09PSAndHh0JyApIGcudGV4dENvbnRlbnQgPSBvWyBhdHQgXTtcclxuICAgICAgICAgICAgaWYoIGF0dCA9PT0gJ2xpbmsnICkgZy5zZXRBdHRyaWJ1dGVOUyggVC5saW5rcywgJ3hsaW5rOmhyZWYnLCBvWyBhdHQgXSApO1xyXG4gICAgICAgICAgICBlbHNlIGcuc2V0QXR0cmlidXRlTlMoIG51bGwsIGF0dCwgb1sgYXR0IF0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIGdldDogZnVuY3Rpb24oIGRvbSwgaWQgKXtcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSB1bmRlZmluZWQgKSByZXR1cm4gZG9tOyAvLyByb290XHJcbiAgICAgICAgZWxzZSBpZiggIWlzTmFOKCBpZCApICkgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZCBdOyAvLyBmaXJzdCBjaGlsZFxyXG4gICAgICAgIGVsc2UgaWYoIGlkIGluc3RhbmNlb2YgQXJyYXkgKXtcclxuICAgICAgICAgICAgaWYoaWQubGVuZ3RoID09PSAyKSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkWzBdIF0uY2hpbGROb2Rlc1sgaWRbMV0gXTtcclxuICAgICAgICAgICAgaWYoaWQubGVuZ3RoID09PSAzKSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkWzBdIF0uY2hpbGROb2Rlc1sgaWRbMV0gXS5jaGlsZE5vZGVzWyBpZFsyXSBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGRvbSA6IGZ1bmN0aW9uICggdHlwZSwgY3NzLCBvYmosIGRvbSwgaWQgKSB7XHJcblxyXG4gICAgICAgIHR5cGUgPSB0eXBlIHx8ICdkaXYnO1xyXG5cclxuICAgICAgICBpZiggVC5TVkdfVFlQRV9ELmluZGV4T2YodHlwZSkgIT09IC0xIHx8IFQuU1ZHX1RZUEVfRy5pbmRleE9mKHR5cGUpICE9PSAtMSApeyAvLyBpcyBzdmcgZWxlbWVudFxyXG5cclxuICAgICAgICAgICAgaWYoIHR5cGUgPT09J3N2ZycgKXtcclxuXHJcbiAgICAgICAgICAgICAgICBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsICdzdmcnICk7XHJcbiAgICAgICAgICAgICAgICBULnNldCggZG9tLCBvYmogKTtcclxuXHJcbiAgICAgICAgICAvKiAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ3VzZScgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCAndXNlJyApO1xyXG4gICAgICAgICAgICAgICAgVC5zZXQoIGRvbSwgb2JqICk7XHJcbiovXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbmV3IHN2ZyBpZiBub3QgZGVmXHJcbiAgICAgICAgICAgICAgICBpZiggZG9tID09PSB1bmRlZmluZWQgKSBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsICdzdmcnICk7XHJcbiAgICAgICAgICAgICAgICBULmFkZEF0dHJpYnV0ZXMoIGRvbSwgdHlwZSwgb2JqLCBpZCApO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9IGVsc2UgeyAvLyBpcyBodG1sIGVsZW1lbnRcclxuXHJcbiAgICAgICAgICAgIGlmKCBkb20gPT09IHVuZGVmaW5lZCApIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5odG1scywgdHlwZSApO1xyXG4gICAgICAgICAgICBlbHNlIGRvbSA9IGRvbS5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULmh0bWxzLCB0eXBlICkgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggY3NzICkgZG9tLnN0eWxlLmNzc1RleHQgPSBjc3M7IFxyXG5cclxuICAgICAgICBpZiggaWQgPT09IHVuZGVmaW5lZCApIHJldHVybiBkb207XHJcbiAgICAgICAgZWxzZSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkIHx8IDAgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZEF0dHJpYnV0ZXMgOiBmdW5jdGlvbiggZG9tLCB0eXBlLCBvLCBpZCApe1xyXG5cclxuICAgICAgICBsZXQgZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgdHlwZSApO1xyXG4gICAgICAgIFQuc2V0KCBnLCBvICk7XHJcbiAgICAgICAgVC5nZXQoIGRvbSwgaWQgKS5hcHBlbmRDaGlsZCggZyApO1xyXG4gICAgICAgIGlmKCBULlNWR19UWVBFX0cuaW5kZXhPZih0eXBlKSAhPT0gLTEgKSBnLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcbiAgICAgICAgcmV0dXJuIGc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhciA6IGZ1bmN0aW9uKCBkb20gKXtcclxuXHJcbiAgICAgICAgVC5wdXJnZSggZG9tICk7XHJcbiAgICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgIGlmICggZG9tLmZpcnN0Q2hpbGQuZmlyc3RDaGlsZCApIFQuY2xlYXIoIGRvbS5maXJzdENoaWxkICk7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDaGlsZCggZG9tLmZpcnN0Q2hpbGQgKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcHVyZ2UgOiBmdW5jdGlvbiAoIGRvbSApIHtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBkb20uYXR0cmlidXRlcywgaSwgbjtcclxuICAgICAgICBpZiAoYSkge1xyXG4gICAgICAgICAgICBpID0gYS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgICAgICBuID0gYVtpXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkb21bbl0gPT09ICdmdW5jdGlvbicpIGRvbVtuXSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYSA9IGRvbS5jaGlsZE5vZGVzO1xyXG4gICAgICAgIGlmIChhKSB7XHJcbiAgICAgICAgICAgIGkgPSBhLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgICAgICBULnB1cmdlKCBkb20uY2hpbGROb2Rlc1tpXSApOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ29sb3IgZnVuY3Rpb25cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBDb2xvckx1bWEgOiBmdW5jdGlvbiAoIGhleCwgbCApIHtcclxuXHJcbiAgICAgICAgaWYoIGhleCA9PT0gJ24nICkgaGV4ID0gJyMwMDAnO1xyXG5cclxuICAgICAgICAvLyB2YWxpZGF0ZSBoZXggc3RyaW5nXHJcbiAgICAgICAgaGV4ID0gU3RyaW5nKGhleCkucmVwbGFjZSgvW14wLTlhLWZdL2dpLCAnJyk7XHJcbiAgICAgICAgaWYgKGhleC5sZW5ndGggPCA2KSB7XHJcbiAgICAgICAgICAgIGhleCA9IGhleFswXStoZXhbMF0raGV4WzFdK2hleFsxXStoZXhbMl0raGV4WzJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsID0gbCB8fCAwO1xyXG5cclxuICAgICAgICAvLyBjb252ZXJ0IHRvIGRlY2ltYWwgYW5kIGNoYW5nZSBsdW1pbm9zaXR5XHJcbiAgICAgICAgbGV0IHJnYiA9IFwiI1wiLCBjLCBpO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuICAgICAgICAgICAgYyA9IHBhcnNlSW50KGhleC5zdWJzdHIoaSoyLDIpLCAxNik7XHJcbiAgICAgICAgICAgIGMgPSBNYXRoLnJvdW5kKE1hdGgubWluKE1hdGgubWF4KDAsIGMgKyAoYyAqIGwpKSwgMjU1KSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICByZ2IgKz0gKFwiMDBcIitjKS5zdWJzdHIoYy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJnYjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGZpbmREZWVwSW52ZXI6IGZ1bmN0aW9uICggYyApIHsgXHJcblxyXG4gICAgICAgIHJldHVybiAoY1swXSAqIDAuMyArIGNbMV0gKiAuNTkgKyBjWzJdICogLjExKSA8PSAwLjY7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICBoZXhUb0h0bWw6IGZ1bmN0aW9uICggdiApIHsgXHJcbiAgICAgICAgdiA9IHYgPT09IHVuZGVmaW5lZCA/IDB4MDAwMDAwIDogdjtcclxuICAgICAgICByZXR1cm4gXCIjXCIgKyAoXCIwMDAwMDBcIiArIHYudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBodG1sVG9IZXg6IGZ1bmN0aW9uICggdiApIHsgXHJcblxyXG4gICAgICAgIHJldHVybiB2LnRvVXBwZXJDYXNlKCkucmVwbGFjZShcIiNcIiwgXCIweFwiKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHUyNTU6IGZ1bmN0aW9uIChjLCBpKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZUludChjLnN1YnN0cmluZyhpLCBpICsgMiksIDE2KSAvIDI1NTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHUxNjogZnVuY3Rpb24gKCBjLCBpICkge1xyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoYy5zdWJzdHJpbmcoaSwgaSArIDEpLCAxNikgLyAxNTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVucGFjazogZnVuY3Rpb24oIGMgKXtcclxuXHJcbiAgICAgICAgaWYgKGMubGVuZ3RoID09IDcpIHJldHVybiBbIFQudTI1NShjLCAxKSwgVC51MjU1KGMsIDMpLCBULnUyNTUoYywgNSkgXTtcclxuICAgICAgICBlbHNlIGlmIChjLmxlbmd0aCA9PSA0KSByZXR1cm4gWyBULnUxNihjLDEpLCBULnUxNihjLDIpLCBULnUxNihjLDMpIF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBodG1sUmdiOiBmdW5jdGlvbiggYyApe1xyXG5cclxuICAgICAgICByZXR1cm4gJ3JnYignICsgTWF0aC5yb3VuZChjWzBdICogMjU1KSArICcsJysgTWF0aC5yb3VuZChjWzFdICogMjU1KSArICcsJysgTWF0aC5yb3VuZChjWzJdICogMjU1KSArICcpJztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHBhZDogZnVuY3Rpb24oIG4gKXtcclxuICAgICAgICBpZihuLmxlbmd0aCA9PSAxKW4gPSAnMCcgKyBuO1xyXG4gICAgICAgIHJldHVybiBuO1xyXG4gICAgfSxcclxuXHJcbiAgICByZ2JUb0hleCA6IGZ1bmN0aW9uKCBjICl7XHJcblxyXG4gICAgICAgIGxldCByID0gTWF0aC5yb3VuZChjWzBdICogMjU1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgbGV0IGcgPSBNYXRoLnJvdW5kKGNbMV0gKiAyNTUpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICBsZXQgYiA9IE1hdGgucm91bmQoY1syXSAqIDI1NSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgIHJldHVybiAnIycgKyBULnBhZChyKSArIFQucGFkKGcpICsgVC5wYWQoYik7XHJcblxyXG4gICAgICAgLy8gcmV0dXJuICcjJyArICggJzAwMDAwMCcgKyAoICggY1swXSAqIDI1NSApIDw8IDE2IF4gKCBjWzFdICogMjU1ICkgPDwgOCBeICggY1syXSAqIDI1NSApIDw8IDAgKS50b1N0cmluZyggMTYgKSApLnNsaWNlKCAtIDYgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGh1ZVRvUmdiOiBmdW5jdGlvbiggcCwgcSwgdCApe1xyXG5cclxuICAgICAgICBpZiAoIHQgPCAwICkgdCArPSAxO1xyXG4gICAgICAgIGlmICggdCA+IDEgKSB0IC09IDE7XHJcbiAgICAgICAgaWYgKCB0IDwgMSAvIDYgKSByZXR1cm4gcCArICggcSAtIHAgKSAqIDYgKiB0O1xyXG4gICAgICAgIGlmICggdCA8IDEgLyAyICkgcmV0dXJuIHE7XHJcbiAgICAgICAgaWYgKCB0IDwgMiAvIDMgKSByZXR1cm4gcCArICggcSAtIHAgKSAqIDYgKiAoIDIgLyAzIC0gdCApO1xyXG4gICAgICAgIHJldHVybiBwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmdiVG9Ic2w6IGZ1bmN0aW9uICggYyApIHtcclxuXHJcbiAgICAgICAgbGV0IHIgPSBjWzBdLCBnID0gY1sxXSwgYiA9IGNbMl0sIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLCBtYXggPSBNYXRoLm1heChyLCBnLCBiKSwgZGVsdGEgPSBtYXggLSBtaW4sIGggPSAwLCBzID0gMCwgbCA9IChtaW4gKyBtYXgpIC8gMjtcclxuICAgICAgICBpZiAobCA+IDAgJiYgbCA8IDEpIHMgPSBkZWx0YSAvIChsIDwgMC41ID8gKDIgKiBsKSA6ICgyIC0gMiAqIGwpKTtcclxuICAgICAgICBpZiAoZGVsdGEgPiAwKSB7XHJcbiAgICAgICAgICAgIGlmIChtYXggPT0gciAmJiBtYXggIT0gZykgaCArPSAoZyAtIGIpIC8gZGVsdGE7XHJcbiAgICAgICAgICAgIGlmIChtYXggPT0gZyAmJiBtYXggIT0gYikgaCArPSAoMiArIChiIC0gcikgLyBkZWx0YSk7XHJcbiAgICAgICAgICAgIGlmIChtYXggPT0gYiAmJiBtYXggIT0gcikgaCArPSAoNCArIChyIC0gZykgLyBkZWx0YSk7XHJcbiAgICAgICAgICAgIGggLz0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFsgaCwgcywgbCBdO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaHNsVG9SZ2I6IGZ1bmN0aW9uICggYyApIHtcclxuXHJcbiAgICAgICAgbGV0IHAsIHEsIGggPSBjWzBdLCBzID0gY1sxXSwgbCA9IGNbMl07XHJcblxyXG4gICAgICAgIGlmICggcyA9PT0gMCApIHJldHVybiBbIGwsIGwsIGwgXTtcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcSA9IGwgPD0gMC41ID8gbCAqIChzICsgMSkgOiBsICsgcyAtICggbCAqIHMgKTtcclxuICAgICAgICAgICAgcCA9IGwgKiAyIC0gcTtcclxuICAgICAgICAgICAgcmV0dXJuIFsgVC5odWVUb1JnYihwLCBxLCBoICsgMC4zMzMzMyksIFQuaHVlVG9SZ2IocCwgcSwgaCksIFQuaHVlVG9SZ2IocCwgcSwgaCAtIDAuMzMzMzMpIF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBTVkcgTU9ERUxcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtYWtlR3JhZGlhbnQ6IGZ1bmN0aW9uICggdHlwZSwgc2V0dGluZ3MsIHBhcmVudCwgY29sb3JzICkge1xyXG5cclxuICAgICAgICBULmRvbSggdHlwZSwgbnVsbCwgc2V0dGluZ3MsIHBhcmVudCwgMCApO1xyXG5cclxuICAgICAgICBsZXQgbiA9IHBhcmVudC5jaGlsZE5vZGVzWzBdLmNoaWxkTm9kZXMubGVuZ3RoIC0gMSwgYztcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBjb2xvcnMubGVuZ3RoOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIGMgPSBjb2xvcnNbaV07XHJcbiAgICAgICAgICAgIC8vVC5kb20oICdzdG9wJywgbnVsbCwgeyBvZmZzZXQ6Y1swXSsnJScsIHN0eWxlOidzdG9wLWNvbG9yOicrY1sxXSsnOyBzdG9wLW9wYWNpdHk6JytjWzJdKyc7JyB9LCBwYXJlbnQsIFswLG5dICk7XHJcbiAgICAgICAgICAgIFQuZG9tKCAnc3RvcCcsIG51bGwsIHsgb2Zmc2V0OmNbMF0rJyUnLCAnc3RvcC1jb2xvcic6Y1sxXSwgICdzdG9wLW9wYWNpdHknOmNbMl0gfSwgcGFyZW50LCBbMCxuXSApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKm1ha2VHcmFwaDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgdyA9IDEyODtcclxuICAgICAgICBsZXQgcmFkaXVzID0gMzQ7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOlQuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOjQsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOididXR0JyB9LCBzdmcgKTsvLzBcclxuICAgICAgICAvL1QuZG9tKCAncmVjdCcsICcnLCB7IHg6MTAsIHk6MTAsIHdpZHRoOjEwOCwgaGVpZ2h0OjEwOCwgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoyICwgZmlsbDonbm9uZSd9LCBzdmcgKTsvLzFcclxuICAgICAgICAvL1QuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDpULmNvbG9ycy5idXR0b24sIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6OCB9LCBzdmcgKTsvLzBcclxuICAgICAgICBcclxuICAgICAgICAvL1QuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cys3LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjcgLCBmaWxsOidub25lJ30sIHN2ZyApOy8vMlxyXG4gICAgICAgIC8vVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOidyZ2JhKDI1NSwyNTUsMjU1LDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoyLCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzoncm91bmQnLCAnc3Ryb2tlLW9wYWNpdHknOjAuNSB9LCBzdmcgKTsvLzNcclxuICAgICAgICBULmdyYXBoID0gc3ZnO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICBtYWtlS25vYjogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjg7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IDM0O1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDpULmNvbG9ycy5idXR0b24sIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6OCB9LCBzdmcgKTsvLzBcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6VC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6NCwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J3JvdW5kJyB9LCBzdmcgKTsvLzFcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMrNywgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMSknLCAnc3Ryb2tlLXdpZHRoJzo3ICwgZmlsbDonbm9uZSd9LCBzdmcgKTsvLzJcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6J3JnYmEoMjU1LDI1NSwyNTUsMC4zKScsICdzdHJva2Utd2lkdGgnOjIsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcsICdzdHJva2Utb3BhY2l0eSc6MC41IH0sIHN2ZyApOy8vM1xyXG4gICAgICAgIFQua25vYiA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VDaXJjdWxhcjogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjg7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IDQwO1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMSknLCAnc3Ryb2tlLXdpZHRoJzoxMCwgZmlsbDonbm9uZScgfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOlQuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOjcsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOididXR0JyB9LCBzdmcgKTsvLzFcclxuICAgICAgICBULmNpcmN1bGFyID0gc3ZnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbWFrZUpveXN0aWNrOiBmdW5jdGlvbiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICAvLysnIGJhY2tncm91bmQ6I2YwMDsnXHJcblxyXG4gICAgICAgIGxldCB3ID0gMTI4LCBjY2M7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IE1hdGguZmxvb3IoKHctMzApKjAuNSk7XHJcbiAgICAgICAgbGV0IGlubmVyUmFkaXVzID0gTWF0aC5mbG9vcihyYWRpdXMqMC42KTtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2RlZnMnLCBudWxsLCB7fSwgc3ZnICk7XHJcbiAgICAgICAgVC5kb20oICdnJywgbnVsbCwge30sIHN2ZyApO1xyXG5cclxuICAgICAgICBpZiggbW9kZWwgPT09IDAgKXtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIGJhY2tncm91bmRcclxuICAgICAgICAgICAgY2NjID0gWyBbNDAsICdyZ2IoMCwwLDApJywgMC4zXSwgWzgwLCAncmdiKDAsMCwwKScsIDBdLCBbOTAsICdyZ2IoNTAsNTAsNTApJywgMC40XSwgWzEwMCwgJ3JnYig1MCw1MCw1MCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZCcsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIHNoYWRvd1xyXG4gICAgICAgICAgICBjY2MgPSBbIFs2MCwgJ3JnYigwLDAsMCknLCAwLjVdLCBbMTAwLCAncmdiKDAsMCwwKScsIDBdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkUycsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIHN0aWNrXHJcbiAgICAgICAgICAgIGxldCBjYzAgPSBbJ3JnYig0MCw0MCw0MCknLCAncmdiKDQ4LDQ4LDQ4KScsICdyZ2IoMzAsMzAsMzApJ107XHJcbiAgICAgICAgICAgIGxldCBjYzEgPSBbJ3JnYigxLDkwLDE5NyknLCAncmdiKDMsOTUsMjA3KScsICdyZ2IoMCw2NSwxNjcpJ107XHJcblxyXG4gICAgICAgICAgICBjY2MgPSBbIFszMCwgY2MwWzBdLCAxXSwgWzYwLCBjYzBbMV0sIDFdLCBbODAsIGNjMFsxXSwgMV0sIFsxMDAsIGNjMFsyXSwgMV0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRJbicsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICBjY2MgPSBbIFszMCwgY2MxWzBdLCAxXSwgWzYwLCBjYzFbMV0sIDFdLCBbODAsIGNjMVsxXSwgMV0sIFsxMDAsIGNjMVsyXSwgMV0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRJbjInLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhcGhcclxuXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDondXJsKCNncmFkKScgfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQrNSwgY3k6NjQrMTAsIHI6aW5uZXJSYWRpdXMrMTAsIGZpbGw6J3VybCgjZ3JhZFMpJyB9LCBzdmcgKTsvLzNcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMsIGZpbGw6J3VybCgjZ3JhZEluKScgfSwgc3ZnICk7Ly80XHJcblxyXG4gICAgICAgICAgICBULmpveXN0aWNrXzAgPSBzdmc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAvLyBncmFkaWFuIHNoYWRvd1xyXG4gICAgICAgICAgICBjY2MgPSBbIFs2OSwgJ3JnYigwLDAsMCknLCAwXSxbNzAsICdyZ2IoMCwwLDApJywgMC4zXSwgWzEwMCwgJ3JnYigwLDAsMCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZFgnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOidub25lJywgc3Ryb2tlOidyZ2JhKDEwMCwxMDAsMTAwLDAuMjUpJywgJ3N0cm9rZS13aWR0aCc6JzQnIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjppbm5lclJhZGl1cysxNCwgZmlsbDondXJsKCNncmFkWCknIH0sIHN2ZyApOy8vM1xyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjppbm5lclJhZGl1cywgZmlsbDonbm9uZScsIHN0cm9rZToncmdiKDEwMCwxMDAsMTAwKScsICdzdHJva2Utd2lkdGgnOic0JyB9LCBzdmcgKTsvLzRcclxuXHJcbiAgICAgICAgICAgIFQuam95c3RpY2tfMSA9IHN2ZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbWFrZUNvbG9yUmluZzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgdyA9IDI1NjtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2RlZnMnLCBudWxsLCB7fSwgc3ZnICk7XHJcbiAgICAgICAgVC5kb20oICdnJywgbnVsbCwge30sIHN2ZyApO1xyXG5cclxuICAgICAgICBsZXQgcyA9IDMwOy8vc3Ryb2tlXHJcbiAgICAgICAgbGV0IHIgPSggdy1zICkqMC41O1xyXG4gICAgICAgIGxldCBtaWQgPSB3KjAuNTtcclxuICAgICAgICBsZXQgbiA9IDI0LCBudWRnZSA9IDggLyByIC8gbiAqIE1hdGguUEksIGExID0gMCwgZDE7XHJcbiAgICAgICAgbGV0IGFtLCB0YW4sIGQyLCBhMiwgYXIsIGksIGosIHBhdGgsIGNjYztcclxuICAgICAgICBsZXQgY29sb3IgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8PSBuOyArK2kpIHtcclxuXHJcbiAgICAgICAgICAgIGQyID0gaSAvIG47XHJcbiAgICAgICAgICAgIGEyID0gZDIgKiBULlR3b1BJO1xyXG4gICAgICAgICAgICBhbSA9IChhMSArIGEyKSAqIDAuNTtcclxuICAgICAgICAgICAgdGFuID0gMSAvIE1hdGguY29zKChhMiAtIGExKSAqIDAuNSk7XHJcblxyXG4gICAgICAgICAgICBhciA9IFtcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGExKSwgLU1hdGguY29zKGExKSwgXHJcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihhbSkgKiB0YW4sIC1NYXRoLmNvcyhhbSkgKiB0YW4sIFxyXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oYTIpLCAtTWF0aC5jb3MoYTIpXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb2xvclsxXSA9IFQucmdiVG9IZXgoIFQuaHNsVG9SZ2IoW2QyLCAxLCAwLjVdKSApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaiA9IDY7XHJcbiAgICAgICAgICAgICAgICB3aGlsZShqLS0pe1xyXG4gICAgICAgICAgICAgICAgICAgYXJbal0gPSAoKGFyW2pdKnIpK21pZCkudG9GaXhlZCgyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwYXRoID0gJyBNJyArIGFyWzBdICsgJyAnICsgYXJbMV0gKyAnIFEnICsgYXJbMl0gKyAnICcgKyBhclszXSArICcgJyArIGFyWzRdICsgJyAnICsgYXJbNV07XHJcblxyXG4gICAgICAgICAgICAgICAgY2NjID0gWyBbMCxjb2xvclswXSwxXSwgWzEwMCxjb2xvclsxXSwxXSBdO1xyXG4gICAgICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdsaW5lYXJHcmFkaWVudCcsIHsgaWQ6J0cnK2ksIHgxOmFyWzBdLCB5MTphclsxXSwgeDI6YXJbNF0sIHkyOmFyWzVdLCBncmFkaWVudFVuaXRzOlwidXNlclNwYWNlT25Vc2VcIiB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6cGF0aCwgJ3N0cm9rZS13aWR0aCc6cywgc3Ryb2tlOid1cmwoI0cnK2krJyknLCAnc3Ryb2tlLWxpbmVjYXAnOlwiYnV0dFwiIH0sIHN2ZywgMSApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYTEgPSBhMiAtIG51ZGdlOyBcclxuICAgICAgICAgICAgY29sb3JbMF0gPSBjb2xvclsxXTtcclxuICAgICAgICAgICAgZDEgPSBkMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBiciA9ICgxMjggLSBzICkgKyAyO1xyXG4gICAgICAgIGxldCBidyA9IDYwO1xyXG5cclxuICAgICAgICBsZXQgdHcgPSA4NC45MDtcclxuXHJcbiAgICAgICAgLy8gYmxhY2sgLyB3aGl0ZVxyXG4gICAgICAgIGNjYyA9IFsgWzAsICcjRkZGRkZGJywgMV0sIFs1MCwgJyNGRkZGRkYnLCAwXSwgWzUwLCAnIzAwMDAwMCcsIDBdLCBbMTAwLCAnIzAwMDAwMCcsIDFdIF07XHJcbiAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdsaW5lYXJHcmFkaWVudCcsIHsgaWQ6J0dMMCcsIHgxOjAsIHkxOm1pZC10dywgeDI6MCwgeTI6bWlkK3R3LCBncmFkaWVudFVuaXRzOlwidXNlclNwYWNlT25Vc2VcIiB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICBjY2MgPSBbIFswLCAnIzdmN2Y3ZicsIDFdLCBbNTAsICcjN2Y3ZjdmJywgMC41XSwgWzEwMCwgJyM3ZjdmN2YnLCAwXSBdO1xyXG4gICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHTDEnLCB4MTptaWQtNDkuMDUsIHkxOjAsIHgyOm1pZCs5OCwgeTI6MCwgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgVC5kb20oICdnJywgbnVsbCwgeyAndHJhbnNmb3JtLW9yaWdpbic6ICcxMjhweCAxMjhweCcsICd0cmFuc2Zvcm0nOidyb3RhdGUoMCknIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgIFQuZG9tKCAncG9seWdvbicsICcnLCB7IHBvaW50czonNzguOTUgNDMuMSA3OC45NSAyMTIuODUgMjI2IDEyOCcsICBmaWxsOidyZWQnICB9LCBzdmcsIDIgKTsvLyAyLDBcclxuICAgICAgICBULmRvbSggJ3BvbHlnb24nLCAnJywgeyBwb2ludHM6Jzc4Ljk1IDQzLjEgNzguOTUgMjEyLjg1IDIyNiAxMjgnLCAgZmlsbDondXJsKCNHTDEpJywnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6J3VybCgjR0wxKScgIH0sIHN2ZywgMiApOy8vMiwxXHJcbiAgICAgICAgVC5kb20oICdwb2x5Z29uJywgJycsIHsgcG9pbnRzOic3OC45NSA0My4xIDc4Ljk1IDIxMi44NSAyMjYgMTI4JywgIGZpbGw6J3VybCgjR0wwKScsJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOid1cmwoI0dMMCknICB9LCBzdmcsIDIgKTsvLzIsMlxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6J00gMjU1Ljc1IDEzNi41IFEgMjU2IDEzMi4zIDI1NiAxMjggMjU2IDEyMy43IDI1NS43NSAxMTkuNSBMIDI0MSAxMjggMjU1Ljc1IDEzNi41IFonLCAgZmlsbDonbm9uZScsJ3N0cm9rZS13aWR0aCc6Miwgc3Ryb2tlOicjMDAwJyAgfSwgc3ZnLCAyICk7Ly8yLDNcclxuICAgICAgICAvL1QuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MTI4KzExMywgY3k6MTI4LCByOjYsICdzdHJva2Utd2lkdGgnOjMsIHN0cm9rZTonIzAwMCcsIGZpbGw6J25vbmUnIH0sIHN2ZywgMiApOy8vMi4zXHJcblxyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MTI4LCBjeToxMjgsIHI6NiwgJ3N0cm9rZS13aWR0aCc6Miwgc3Ryb2tlOicjMDAwJywgZmlsbDonbm9uZScgfSwgc3ZnICk7Ly8zXHJcblxyXG4gICAgICAgIFQuY29sb3JSaW5nID0gc3ZnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaWNvbjogZnVuY3Rpb24gKCB0eXBlLCBjb2xvciwgdyApe1xyXG5cclxuICAgICAgICB3ID0gdyB8fCA0MDtcclxuICAgICAgICBjb2xvciA9IGNvbG9yIHx8ICcjREVERURFJztcclxuICAgICAgICBsZXQgdmlld0JveCA9ICcwIDAgMjU2IDI1Nic7XHJcbiAgICAgICAgbGV0IHQgPSBbXCI8c3ZnIHhtbG5zPSdcIitULnN2Z25zK1wiJyB2ZXJzaW9uPScxLjEnIHhtbG5zOnhsaW5rPSdcIitULmh0bWxzK1wiJyBzdHlsZT0ncG9pbnRlci1ldmVudHM6bm9uZTsnIHByZXNlcnZlQXNwZWN0UmF0aW89J3hNaW5ZTWF4IG1lZXQnIHg9JzBweCcgeT0nMHB4JyB3aWR0aD0nXCIrdytcInB4JyBoZWlnaHQ9J1wiK3crXCJweCcgdmlld0JveD0nXCIrdmlld0JveCtcIic+PGc+XCJdO1xyXG4gICAgICAgIHN3aXRjaCh0eXBlKXtcclxuICAgICAgICAgICAgY2FzZSAnbG9nbyc6XHJcbiAgICAgICAgICAgIHRbMV09XCI8cGF0aCBpZD0nbG9nb2luJyBmaWxsPSdcIitjb2xvcitcIicgc3Ryb2tlPSdub25lJyBkPSdcIitULmxvZ29GaWxsX2QrXCInLz5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggc3Ryb2tlPSdcIitjb2xvcitcIicgc3Ryb2tlLXdpZHRoPSc0JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIGZpbGw9J25vbmUnIGQ9J00gMjYuMTI1IDE3IEwgMjAgMjIuOTUgMTQuMDUgMTcgTSAyMCA5Ljk1IEwgMjAgMjIuOTUnLz48cGF0aCBzdHJva2U9J1wiK2NvbG9yO1xyXG4gICAgICAgICAgICB0WzFdKz1cIicgc3Ryb2tlLXdpZHRoPScyLjUnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgZmlsbD0nbm9uZScgZD0nTSAzMi42IDIzIEwgMzIuNiAyNS41IFEgMzIuNiAyOC41IDI5LjYgMjguNSBMIDEwLjYgMjguNSBRIDcuNiAyOC41IDcuNiAyNS41IEwgNy42IDIzJy8+XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0WzJdID0gXCI8L2c+PC9zdmc+XCI7XHJcbiAgICAgICAgcmV0dXJuIHQuam9pbihcIlxcblwiKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGxvZ29GaWxsX2Q6IFtcclxuICAgIFwiTSAxNzEgMTUwLjc1IEwgMTcxIDMzLjI1IDE1NS41IDMzLjI1IDE1NS41IDE1MC43NSBRIDE1NS41IDE2Mi4yIDE0Ny40NSAxNzAuMiAxMzkuNDUgMTc4LjI1IDEyOCAxNzguMjUgMTE2LjYgMTc4LjI1IDEwOC41NSAxNzAuMiAxMDAuNSAxNjIuMiAxMDAuNSAxNTAuNzUgXCIsXHJcbiAgICBcIkwgMTAwLjUgMzMuMjUgODUgMzMuMjUgODUgMTUwLjc1IFEgODUgMTY4LjY1IDk3LjU1IDE4MS4xNSAxMTAuMTUgMTkzLjc1IDEyOCAxOTMuNzUgMTQ1LjkgMTkzLjc1IDE1OC40IDE4MS4xNSAxNzEgMTY4LjY1IDE3MSAxNTAuNzUgXCIsXHJcbiAgICBcIk0gMjAwIDMzLjI1IEwgMTg0IDMzLjI1IDE4NCAxNTAuOCBRIDE4NCAxNzQuMSAxNjcuNiAxOTAuNCAxNTEuMyAyMDYuOCAxMjggMjA2LjggMTA0Ljc1IDIwNi44IDg4LjMgMTkwLjQgNzIgMTc0LjEgNzIgMTUwLjggTCA3MiAzMy4yNSA1NiAzMy4yNSA1NiAxNTAuNzUgXCIsXHJcbiAgICBcIlEgNTYgMTgwLjU1IDc3LjA1IDIwMS42IDk4LjIgMjIyLjc1IDEyOCAyMjIuNzUgMTU3LjggMjIyLjc1IDE3OC45IDIwMS42IDIwMCAxODAuNTUgMjAwIDE1MC43NSBMIDIwMCAzMy4yNSBaXCIsXHJcbiAgICBdLmpvaW4oJ1xcbicpLFxyXG5cclxufVxyXG5cclxuVC5zZXRUZXh0KCk7XHJcblxyXG5leHBvcnQgY29uc3QgVG9vbHMgPSBUOyIsIlxyXG4vKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG4vLyBJTlRFTkFMIEZVTkNUSU9OXHJcblxyXG5jb25zdCBSID0ge1xyXG5cclxuXHR1aTogW10sXHJcblxyXG5cdElEOiBudWxsLFxyXG4gICAgbG9jazpmYWxzZSxcclxuICAgIHdsb2NrOmZhbHNlLFxyXG4gICAgY3VycmVudDotMSxcclxuXHJcblx0bmVlZFJlWm9uZTogdHJ1ZSxcclxuXHRpc0V2ZW50c0luaXQ6IGZhbHNlLFxyXG5cclxuICAgIHByZXZEZWZhdWx0OiBbJ2NvbnRleHRtZW51JywgJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCddLFxyXG4gICAgcG9pbnRlckV2ZW50OiBbJ3BvaW50ZXJkb3duJywgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCddLFxyXG5cclxuXHR4bWxzZXJpYWxpemVyOiBuZXcgWE1MU2VyaWFsaXplcigpLFxyXG5cdHRtcFRpbWU6IG51bGwsXHJcbiAgICB0bXBJbWFnZTogbnVsbCxcclxuXHJcbiAgICBvbGRDdXJzb3I6J2F1dG8nLFxyXG5cclxuICAgIGlucHV0OiBudWxsLFxyXG4gICAgcGFyZW50OiBudWxsLFxyXG4gICAgZmlyc3RJbXB1dDogdHJ1ZSxcclxuICAgIC8vY2FsbGJhY2tJbXB1dDogbnVsbCxcclxuICAgIGhpZGRlbkltcHV0Om51bGwsXHJcbiAgICBoaWRkZW5TaXplcjpudWxsLFxyXG4gICAgaGFzRm9jdXM6ZmFsc2UsXHJcbiAgICBzdGFydElucHV0OmZhbHNlLFxyXG4gICAgaW5wdXRSYW5nZSA6IFswLDBdLFxyXG4gICAgY3Vyc29ySWQgOiAwLFxyXG4gICAgc3RyOicnLFxyXG4gICAgcG9zOjAsXHJcbiAgICBzdGFydFg6LTEsXHJcbiAgICBtb3ZlWDotMSxcclxuXHJcbiAgICBkZWJ1Z0lucHV0OmZhbHNlLFxyXG5cclxuICAgIGlzTG9vcDogZmFsc2UsXHJcbiAgICBsaXN0ZW5zOiBbXSxcclxuXHJcbiAgICBlOntcclxuICAgICAgICB0eXBlOm51bGwsXHJcbiAgICAgICAgY2xpZW50WDowLFxyXG4gICAgICAgIGNsaWVudFk6MCxcclxuICAgICAgICBrZXlDb2RlOk5hTixcclxuICAgICAgICBrZXk6bnVsbCxcclxuICAgICAgICBkZWx0YTowLFxyXG4gICAgfSxcclxuXHJcbiAgICBpc01vYmlsZTogZmFsc2UsXHJcblxyXG4gICAgXHJcblxyXG5cdGFkZDogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICBSLnVpLnB1c2goIG8gKTtcclxuICAgICAgICBSLmdldFpvbmUoIG8gKTtcclxuXHJcbiAgICAgICAgaWYoICFSLmlzRXZlbnRzSW5pdCApIFIuaW5pdEV2ZW50cygpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdGVzdE1vYmlsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgbiA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XHJcbiAgICAgICAgaWYgKG4ubWF0Y2goL0FuZHJvaWQvaSkgfHwgbi5tYXRjaCgvd2ViT1MvaSkgfHwgbi5tYXRjaCgvaVBob25lL2kpIHx8IG4ubWF0Y2goL2lQYWQvaSkgfHwgbi5tYXRjaCgvaVBvZC9pKSB8fCBuLm1hdGNoKC9CbGFja0JlcnJ5L2kpIHx8IG4ubWF0Y2goL1dpbmRvd3MgUGhvbmUvaSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIGZhbHNlOyAgXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBSLnVpLmluZGV4T2YoIG8gKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIGkgIT09IC0xICkge1xyXG4gICAgICAgICAgICBSLnJlbW92ZUxpc3RlbiggbyApO1xyXG4gICAgICAgICAgICBSLnVpLnNwbGljZSggaSwgMSApOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBSLnVpLmxlbmd0aCA9PT0gMCApe1xyXG4gICAgICAgICAgICBSLnJlbW92ZUV2ZW50cygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaW5pdEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggUi5pc0V2ZW50c0luaXQgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBkb20gPSBkb2N1bWVudC5ib2R5O1xyXG5cclxuICAgICAgICBSLmlzTW9iaWxlID0gUi50ZXN0TW9iaWxlKCk7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICl7XHJcbiAgICAgICAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBSLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAgICAgLypkb20uYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIFIsIGZhbHNlICk7Ki9cclxuXHJcbiAgICAgICAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgUiwgZmFsc2UgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBSLnJlc2l6ZSAsIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vd2luZG93Lm9uYmx1ciA9IFIub3V0O1xyXG4gICAgICAgIC8vd2luZG93Lm9uZm9jdXMgPSBSLmluO1xyXG5cclxuICAgICAgICBSLmlzRXZlbnRzSW5pdCA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoICFSLmlzRXZlbnRzSW5pdCApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGRvbSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICl7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIFIsIGZhbHNlICk7XHJcblxyXG4gICAgICAgICAgICAvKmRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgUiwgZmFsc2UgKTsqL1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCBSLCBmYWxzZSApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIFIgKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgUiApO1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncmVzaXplJywgUi5yZXNpemUgICk7XHJcblxyXG4gICAgICAgIFIuaXNFdmVudHNJbml0ID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZXNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUi5uZWVkUmVab25lID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBSLnVpLmxlbmd0aCwgdTtcclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgICAgICB1ID0gUi51aVtpXTtcclxuICAgICAgICAgICAgaWYoIHUuaXNHdWkgJiYgIXUuaXNDYW52YXNPbmx5ICYmIHUuYXV0b1Jlc2l6ZSApIHUuc2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgb3V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdpbSBhbSBvdXQnKVxyXG4gICAgICAgIFIuY2xlYXJPbGRJRCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaW46IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ2ltIGFtIGluJylcclxuICAgICAgLy8gIFIuY2xlYXJPbGRJRCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBIQU5ETEUgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBcclxuXHJcbiAgICBoYW5kbGVFdmVudDogZnVuY3Rpb24gKCBldmVudCApIHtcclxuXHJcbiAgICAgICAgLy9pZighZXZlbnQudHlwZSkgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gIGNvbnNvbGUubG9nKCBldmVudC50eXBlIClcclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUuaW5kZXhPZiggUi5wcmV2RGVmYXVsdCApICE9PSAtMSApIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IFxyXG5cclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUuaW5kZXhPZiggUi5wb2ludGVyRXZlbnQgKSAhPT0gLTEgKSB7XHJcblxyXG4gICAgICAgICAgICBpZiggZXZlbnQucG9pbnRlclR5cGUhPT0nbW91c2UnIHx8IGV2ZW50LnBvaW50ZXJUeXBlIT09J3BlbicgKSByZXR1cm47XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdjb250ZXh0bWVudScgKSByZXR1cm47IFxyXG5cclxuICAgICAgICAvL2lmKCBldmVudC50eXBlID09PSAna2V5ZG93bicpeyBSLmVkaXRUZXh0KCBldmVudCApOyByZXR1cm47fVxyXG5cclxuICAgICAgICAvL2lmKCBldmVudC50eXBlICE9PSAna2V5ZG93bicgJiYgZXZlbnQudHlwZSAhPT0gJ3doZWVsJyApIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgLy9ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgUi5maW5kWm9uZSgpO1xyXG4gICAgICAgXHJcbiAgICAgICAgbGV0IGUgPSBSLmU7XHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAna2V5ZG93bicpIFIua2V5ZG93biggZXZlbnQgKTtcclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2tleXVwJykgUi5rZXl1cCggZXZlbnQgKTtcclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd3aGVlbCcgKSBlLmRlbHRhID0gZXZlbnQuZGVsdGFZID4gMCA/IDEgOiAtMTtcclxuICAgICAgICBlbHNlIGUuZGVsdGEgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGUuY2xpZW50WCA9IGV2ZW50LmNsaWVudFggfHwgMDtcclxuICAgICAgICBlLmNsaWVudFkgPSBldmVudC5jbGllbnRZIHx8IDA7XHJcbiAgICAgICAgZS50eXBlID0gZXZlbnQudHlwZTtcclxuXHJcbiAgICAgICAgLy8gbW9iaWxlXHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICl7XHJcblxyXG4gICAgICAgICAgICBpZiggZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzLmxlbmd0aCA+IDAgKXtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5jbGllbnRYIHx8IDA7XHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFkgPSBldmVudC50b3VjaGVzWyAwIF0uY2xpZW50WSB8fCAwO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0JykgZS50eXBlID0gJ21vdXNlZG93bic7XHJcbiAgICAgICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hlbmQnKSBlLnR5cGUgPSAnbW91c2V1cCdcclxuICAgICAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKSBlLnR5cGUgPSAnbW91c2Vtb3ZlJztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3BvaW50ZXJkb3duJykgZS50eXBlID0gJ21vdXNlZG93bic7XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdwb2ludGVydXAnKSBlLnR5cGUgPSAnbW91c2V1cCc7XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdwb2ludGVybW92ZScpIGUudHlwZSA9ICdtb3VzZW1vdmUnO1xyXG5cclxuICAgICAgIC8vaWYoICdwb2ludGVyZG93bicgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcpXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLypcclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKXsgZS50eXBlID0gJ21vdXNlZG93bic7IFIuZmluZElEKCBlICk7IH1cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNoZW5kJyl7IGUudHlwZSA9ICdtb3VzZXVwJzsgIGlmKCBSLklEICE9PSBudWxsICkgUi5JRC5oYW5kbGVFdmVudCggZSApOyBSLmNsZWFyT2xkSUQoKTsgfVxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2htb3ZlJyl7IGUudHlwZSA9ICdtb3VzZW1vdmUnOyAgfVxyXG4gICAgICAgICovXHJcblxyXG5cclxuICAgICAgICBpZiggZS50eXBlID09PSAnbW91c2Vkb3duJyApIFIubG9jayA9IHRydWU7XHJcbiAgICAgICAgaWYoIGUudHlwZSA9PT0gJ21vdXNldXAnICkgUi5sb2NrID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICYmIGUudHlwZSA9PT0gJ21vdXNlZG93bicgKSBSLmZpbmRJRCggZSApO1xyXG4gICAgICAgIGlmKCBlLnR5cGUgPT09ICdtb3VzZW1vdmUnICYmICFSLmxvY2sgKSBSLmZpbmRJRCggZSApO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBpZiggUi5JRCAhPT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuSUQuaXNDYW52YXNPbmx5ICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WCA9IFIuSUQubW91c2UueDtcclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WSA9IFIuSUQubW91c2UueTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIFIuSUQuaGFuZGxlRXZlbnQoIGUgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSAmJiBlLnR5cGUgPT09ICdtb3VzZXVwJyApIFIuY2xlYXJPbGRJRCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJRFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGZpbmRJRDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IFIudWkubGVuZ3RoLCBuZXh0ID0gLTEsIHUsIHgsIHk7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuXHJcbiAgICAgICAgICAgIHUgPSBSLnVpW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYoIHUuaXNDYW52YXNPbmx5ICkge1xyXG5cclxuICAgICAgICAgICAgICAgIHggPSB1Lm1vdXNlLng7XHJcbiAgICAgICAgICAgICAgICB5ID0gdS5tb3VzZS55O1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICB4ID0gZS5jbGllbnRYO1xyXG4gICAgICAgICAgICAgICAgeSA9IGUuY2xpZW50WTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCBSLm9uWm9uZSggdSwgeCwgeSApICl7IFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuZXh0ID0gaTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYoIG5leHQgIT09IFIuY3VycmVudCApe1xyXG4gICAgICAgICAgICAgICAgICAgIFIuY2xlYXJPbGRJRCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFIuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5JRCA9IHU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmV4dCA9PT0gLTEgKSBSLmNsZWFyT2xkSUQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyT2xkSUQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoICFSLklEICkgcmV0dXJuO1xyXG4gICAgICAgIFIuY3VycmVudCA9IC0xO1xyXG4gICAgICAgIFIuSUQucmVzZXQoKTtcclxuICAgICAgICBSLklEID0gbnVsbDtcclxuICAgICAgICBSLmN1cnNvcigpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBHVUkgLyBHUk9VUCBGVU5DVElPTlxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNhbGNVaXM6IGZ1bmN0aW9uICggdWlzLCB6b25lLCBweSApIHtcclxuXHJcbiAgICAgICAgbGV0IGxuZyA9IHVpcy5sZW5ndGgsIHUsIGksIHB4ID0gMCwgbXkgPSAwO1xyXG5cclxuICAgICAgICBmb3IoIGkgPSAwOyBpIDwgbG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHUgPSB1aXNbaV07XHJcblxyXG4gICAgICAgICAgICB1LnpvbmUudyA9IHUudztcclxuICAgICAgICAgICAgdS56b25lLmggPSB1Lmg7XHJcblxyXG4gICAgICAgICAgICBpZiggIXUuYXV0b1dpZHRoICl7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHB4ID09PSAwICkgcHkgKz0gdS5oICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB1LnpvbmUueCA9IHpvbmUueCArIHB4O1xyXG4gICAgICAgICAgICAgICAgdS56b25lLnkgPSBweCA9PT0gMCA/IHB5IC0gdS5oIDogbXk7XHJcblxyXG4gICAgICAgICAgICAgICAgbXkgPSB1LnpvbmUueTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcHggKz0gdS53O1xyXG4gICAgICAgICAgICAgICAgaWYoIHB4ICsgdS53ID4gem9uZS53ICkgcHggPSAwO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICB1LnpvbmUueCA9IHpvbmUueDtcclxuICAgICAgICAgICAgICAgIHUuem9uZS55ID0gcHk7XHJcbiAgICAgICAgICAgICAgICBweSArPSB1LmggKyAxO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIHUuaXNHcm91cCApIHUuY2FsY1VpcygpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG5cdGZpbmRUYXJnZXQ6IGZ1bmN0aW9uICggdWlzLCBlICkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHVpcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaWYoIFIub25ab25lKCB1aXNbaV0sIGUuY2xpZW50WCwgZS5jbGllbnRZICkgKSByZXR1cm4gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAtMTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgWk9ORVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGZpbmRab25lOiBmdW5jdGlvbiAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBpZiggIVIubmVlZFJlWm9uZSAmJiAhZm9yY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBpID0gUi51aS5sZW5ndGgsIHU7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXsgXHJcblxyXG4gICAgICAgICAgICB1ID0gUi51aVtpXTtcclxuICAgICAgICAgICAgUi5nZXRab25lKCB1ICk7XHJcbiAgICAgICAgICAgIGlmKCB1LmlzR3VpICkgdS5jYWxjVWlzKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUi5uZWVkUmVab25lID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBvblpvbmU6IGZ1bmN0aW9uICggbywgeCwgeSApIHtcclxuXHJcbiAgICAgICAgaWYoIHggPT09IHVuZGVmaW5lZCB8fCB5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCB6ID0gby56b25lO1xyXG4gICAgICAgIGxldCBteCA9IHggLSB6Lng7XHJcbiAgICAgICAgbGV0IG15ID0geSAtIHoueTtcclxuXHJcbiAgICAgICAgbGV0IG92ZXIgPSAoIG14ID49IDAgKSAmJiAoIG15ID49IDAgKSAmJiAoIG14IDw9IHoudyApICYmICggbXkgPD0gei5oICk7XHJcblxyXG4gICAgICAgIGlmKCBvdmVyICkgby5sb2NhbC5zZXQoIG14LCBteSApO1xyXG4gICAgICAgIGVsc2Ugby5sb2NhbC5uZWcoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG92ZXI7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRab25lOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIGlmKCBvLmlzQ2FudmFzT25seSApIHJldHVybjtcclxuICAgICAgICBsZXQgciA9IG8uZ2V0RG9tKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgby56b25lID0geyB4OnIubGVmdCwgeTpyLnRvcCwgdzpyLndpZHRoLCBoOnIuaGVpZ2h0IH07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENVUlNPUlxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGN1cnNvcjogZnVuY3Rpb24gKCBuYW1lICkge1xyXG5cclxuICAgICAgICBuYW1lID0gbmFtZSA/IG5hbWUgOiAnYXV0byc7XHJcbiAgICAgICAgaWYoIG5hbWUgIT09IFIub2xkQ3Vyc29yICl7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gbmFtZTtcclxuICAgICAgICAgICAgUi5vbGRDdXJzb3IgPSBuYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ0FOVkFTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdG9DYW52YXM6IGZ1bmN0aW9uICggbywgdywgaCwgZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIC8vIHByZXZlbnQgZXhlc2l2ZSByZWRyYXdcclxuXHJcbiAgICAgICAgaWYoIGZvcmNlICYmIFIudG1wVGltZSAhPT0gbnVsbCApIHsgY2xlYXJUaW1lb3V0KFIudG1wVGltZSk7IFIudG1wVGltZSA9IG51bGw7ICB9XHJcblxyXG4gICAgICAgIGlmKCBSLnRtcFRpbWUgIT09IG51bGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCBSLmxvY2sgKSBSLnRtcFRpbWUgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpeyBSLnRtcFRpbWUgPSBudWxsOyB9LCAxMCApO1xyXG5cclxuICAgICAgICAvLy9cclxuXHJcbiAgICAgICAgbGV0IGlzTmV3U2l6ZSA9IGZhbHNlO1xyXG4gICAgICAgIGlmKCB3ICE9PSBvLmNhbnZhcy53aWR0aCB8fCBoICE9PSBvLmNhbnZhcy5oZWlnaHQgKSBpc05ld1NpemUgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggUi50bXBJbWFnZSA9PT0gbnVsbCApIFIudG1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGltZyA9IFIudG1wSW1hZ2U7IC8vbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIGxldCBodG1sU3RyaW5nID0gUi54bWxzZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKCBvLmNvbnRlbnQgKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3ZnID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiJyt3KydcIiBoZWlnaHQ9XCInK2grJ1wiPjxmb3JlaWduT2JqZWN0IHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmU7IGxlZnQ6MDtcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+JysgaHRtbFN0cmluZyArJzwvZm9yZWlnbk9iamVjdD48L3N2Zz4nO1xyXG5cclxuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3R4ID0gby5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYoIGlzTmV3U2l6ZSApeyBcclxuICAgICAgICAgICAgICAgIG8uY2FudmFzLndpZHRoID0gdztcclxuICAgICAgICAgICAgICAgIG8uY2FudmFzLmhlaWdodCA9IGhcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBjdHguY2xlYXJSZWN0KCAwLCAwLCB3LCBoICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSggdGhpcywgMCwgMCApO1xyXG5cclxuICAgICAgICAgICAgby5vbkRyYXcoKTtcclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoc3ZnKTtcclxuICAgICAgICAvL2ltZy5zcmMgPSAnZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwnKyB3aW5kb3cuYnRvYSggc3ZnICk7XHJcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJyc7XHJcblxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNldEhpZGRlbjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggUi5oaWRkZW5JbXB1dCA9PT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGhpZGUgPSBSLmRlYnVnSW5wdXQgPyAnJyA6ICdvcGFjaXR5OjA7IHpJbmRleDowOyc7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3NzID0gUi5wYXJlbnQuY3NzLnR4dCArICdwYWRkaW5nOjA7IHdpZHRoOmF1dG87IGhlaWdodDphdXRvOyB0ZXh0LXNoYWRvdzpub25lOydcclxuICAgICAgICAgICAgY3NzICs9ICdsZWZ0OjEwcHg7IHRvcDphdXRvOyBib3JkZXI6bm9uZTsgY29sb3I6I0ZGRjsgYmFja2dyb3VuZDojMDAwOycgKyBoaWRlO1xyXG5cclxuICAgICAgICAgICAgUi5oaWRkZW5JbXB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQudHlwZSA9ICd0ZXh0JztcclxuICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5zdHlsZS5jc3NUZXh0ID0gY3NzICsgJ2JvdHRvbTozMHB4OycgKyAoUi5kZWJ1Z0lucHV0ID8gJycgOiAndHJhbnNmb3JtOnNjYWxlKDApOycpOztcclxuXHJcbiAgICAgICAgICAgIFIuaGlkZGVuU2l6ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgUi5oaWRkZW5TaXplci5zdHlsZS5jc3NUZXh0ID0gY3NzICsgJ2JvdHRvbTo2MHB4Oyc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBSLmhpZGRlbkltcHV0ICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIFIuaGlkZGVuU2l6ZXIgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSLmhpZGRlbkltcHV0LnN0eWxlLndpZHRoID0gUi5pbnB1dC5jbGllbnRXaWR0aCArICdweCc7XHJcbiAgICAgICAgUi5oaWRkZW5JbXB1dC52YWx1ZSA9IFIuc3RyO1xyXG4gICAgICAgIFIuaGlkZGVuU2l6ZXIuaW5uZXJIVE1MID0gUi5zdHI7XHJcblxyXG4gICAgICAgIFIuaGFzRm9jdXMgPSB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJIaWRkZW46IGZ1bmN0aW9uICggcCApIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaGlkZGVuSW1wdXQgPT09IG51bGwgKSByZXR1cm47XHJcbiAgICAgICAgUi5oYXNGb2N1cyA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xpY2tQb3M6IGZ1bmN0aW9uKCB4ICl7XHJcblxyXG4gICAgICAgIGxldCBpID0gUi5zdHIubGVuZ3RoLCBsID0gMCwgbiA9IDA7XHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBsICs9IFIudGV4dFdpZHRoKCBSLnN0cltuXSApO1xyXG4gICAgICAgICAgICBpZiggbCA+PSB4ICkgYnJlYWs7XHJcbiAgICAgICAgICAgIG4rKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG47XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cElucHV0OiBmdW5jdGlvbiAoIHgsIGRvd24gKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudCA9PT0gbnVsbCApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHVwID0gZmFsc2U7XHJcbiAgICAgXHJcbiAgICAgICAgaWYoIGRvd24gKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBpZCA9IFIuY2xpY2tQb3MoIHggKTtcclxuXHJcbiAgICAgICAgICAgIFIubW92ZVggPSBpZDtcclxuXHJcbiAgICAgICAgICAgIGlmKCBSLnN0YXJ0WCA9PT0gLTEgKXsgXHJcblxyXG4gICAgICAgICAgICAgICAgUi5zdGFydFggPSBpZDtcclxuICAgICAgICAgICAgICAgIFIuY3Vyc29ySWQgPSBpZDtcclxuICAgICAgICAgICAgICAgIFIuaW5wdXRSYW5nZSA9IFsgUi5zdGFydFgsIFIuc3RhcnRYIF07XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBpc1NlbGVjdGlvbiA9IFIubW92ZVggIT09IFIuc3RhcnRYO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBpc1NlbGVjdGlvbiApe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCBSLnN0YXJ0WCA+IFIubW92ZVggKSBSLmlucHV0UmFuZ2UgPSBbIFIubW92ZVgsIFIuc3RhcnRYIF07XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBSLmlucHV0UmFuZ2UgPSBbIFIuc3RhcnRYLCBSLm1vdmVYIF07ICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1cCA9IHRydWU7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBpZiggUi5zdGFydFggIT09IC0xICl7XHJcblxyXG4gICAgICAgICAgICAgICAgUi5oYXNGb2N1cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0ID0gUi5pbnB1dFJhbmdlWzBdO1xyXG4gICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25FbmQgPSBSLmlucHV0UmFuZ2VbMV07XHJcbiAgICAgICAgICAgICAgICBSLnN0YXJ0WCA9IC0xO1xyXG5cclxuICAgICAgICAgICAgICAgIHVwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdXAgKSBSLnNlbGVjdFBhcmVudCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdXA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZWxlY3RQYXJlbnQ6IGZ1bmN0aW9uICgpe1xyXG5cclxuICAgICAgICB2YXIgYyA9IFIudGV4dFdpZHRoKCBSLnN0ci5zdWJzdHJpbmcoIDAsIFIuY3Vyc29ySWQgKSk7XHJcbiAgICAgICAgdmFyIGUgPSBSLnRleHRXaWR0aCggUi5zdHIuc3Vic3RyaW5nKCAwLCBSLmlucHV0UmFuZ2VbMF0gKSk7XHJcbiAgICAgICAgdmFyIHMgPSBSLnRleHRXaWR0aCggUi5zdHIuc3Vic3RyaW5nKCBSLmlucHV0UmFuZ2VbMF0sICBSLmlucHV0UmFuZ2VbMV0gKSk7XHJcblxyXG4gICAgICAgIFIucGFyZW50LnNlbGVjdCggYywgZSwgcyApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdGV4dFdpZHRoOiBmdW5jdGlvbiAoIHRleHQgKXtcclxuXHJcbiAgICAgICAgaWYoIFIuaGlkZGVuU2l6ZXIgPT09IG51bGwgKSByZXR1cm4gMDtcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2csICcmbmJzcDsnKTtcclxuICAgICAgICBSLmhpZGRlblNpemVyLmlubmVySFRNTCA9IHRleHQ7XHJcbiAgICAgICAgcmV0dXJuIFIuaGlkZGVuU2l6ZXIuY2xpZW50V2lkdGg7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgY2xlYXJJbnB1dDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQgPT09IG51bGwgKSByZXR1cm47XHJcbiAgICAgICAgaWYoICFSLmZpcnN0SW1wdXQgKSBSLnBhcmVudC52YWxpZGF0ZSggdHJ1ZSApO1xyXG5cclxuICAgICAgICBSLmNsZWFySGlkZGVuKCk7XHJcbiAgICAgICAgUi5wYXJlbnQudW5zZWxlY3QoKTtcclxuXHJcbiAgICAgICAgLy9SLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgUi5pbnB1dC5zdHlsZS5iYWNrZ3JvdW5kID0gUi5wYXJlbnQuY29sb3JzLmlucHV0Qmc7XHJcbiAgICAgICAgUi5pbnB1dC5zdHlsZS5ib3JkZXJDb2xvciA9IFIucGFyZW50LmNvbG9ycy5pbnB1dEJvcmRlcjtcclxuICAgICAgICBSLnBhcmVudC5pc0VkaXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgUi5pbnB1dCA9IG51bGw7XHJcbiAgICAgICAgUi5wYXJlbnQgPSBudWxsO1xyXG4gICAgICAgIFIuc3RyID0gJycsXHJcbiAgICAgICAgUi5maXJzdEltcHV0ID0gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldElucHV0OiBmdW5jdGlvbiAoIElucHV0LCBwYXJlbnQgKSB7XHJcblxyXG4gICAgICAgIFIuY2xlYXJJbnB1dCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFIuaW5wdXQgPSBJbnB1dDtcclxuICAgICAgICBSLnBhcmVudCA9IHBhcmVudDtcclxuXHJcbiAgICAgICAgUi5pbnB1dC5zdHlsZS5iYWNrZ3JvdW5kID0gUi5wYXJlbnQuY29sb3JzLmlucHV0T3ZlcjtcclxuICAgICAgICBSLmlucHV0LnN0eWxlLmJvcmRlckNvbG9yID0gUi5wYXJlbnQuY29sb3JzLmlucHV0Qm9yZGVyU2VsZWN0O1xyXG4gICAgICAgIFIuc3RyID0gUi5pbnB1dC50ZXh0Q29udGVudDtcclxuXHJcbiAgICAgICAgUi5zZXRIaWRkZW4oKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qc2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCBcInNlbGVjdGFsbFwiLCBudWxsLCBmYWxzZSApO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICBrZXlkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudCA9PT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGtleUNvZGUgPSBlLndoaWNoLCBpc1NoaWZ0ID0gZS5zaGlmdEtleTtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZygga2V5Q29kZSApXHJcblxyXG4gICAgICAgIFIuZmlyc3RJbXB1dCA9IGZhbHNlO1xyXG5cclxuXHJcbiAgICAgICAgaWYgKFIuaGFzRm9jdXMpIHtcclxuICAgICAgICAgICAgLy8gaGFjayB0byBmaXggdG91Y2ggZXZlbnQgYnVnIGluIGlPUyBTYWZhcmlcclxuICAgICAgICAgICAgd2luZG93LmZvY3VzKCk7XHJcbiAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgUi5wYXJlbnQuaXNFZGl0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAvLyBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBzdXBwb3J0IGZvciBDdHJsL0NtZCtBIHNlbGVjdGlvblxyXG4gICAgICAgIC8vaWYgKCBrZXlDb2RlID09PSA2NSAmJiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSApKSB7XHJcbiAgICAgICAgICAgIC8vUi5zZWxlY3RUZXh0KCk7XHJcbiAgICAgICAgICAgIC8vZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAvL3JldHVybiBzZWxmLnJlbmRlcigpO1xyXG4gICAgICAgIC8vfVxyXG5cclxuICAgICAgICBpZigga2V5Q29kZSA9PT0gMTMgKXsgLy9lbnRlclxyXG5cclxuICAgICAgICAgICAgUi5jbGVhcklucHV0KCk7XHJcblxyXG4gICAgICAgIC8vfSBlbHNlIGlmKCBrZXlDb2RlID09PSA5ICl7IC8vdGFiIGtleVxyXG5cclxuICAgICAgICAgICAvLyBSLmlucHV0LnRleHRDb250ZW50ID0gJyc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBpZiggUi5pbnB1dC5pc051bSApe1xyXG4gICAgICAgICAgICAgICAgaWYgKCAoKGUua2V5Q29kZSA+IDQ3KSAmJiAoZS5rZXlDb2RlIDwgNTgpKSB8fCAoKGUua2V5Q29kZSA+IDk1KSAmJiAoZS5rZXlDb2RlIDwgMTA2KSkgfHwgZS5rZXlDb2RlID09PSAxOTAgfHwgZS5rZXlDb2RlID09PSAxMTAgfHwgZS5rZXlDb2RlID09PSA4IHx8IGUua2V5Q29kZSA9PT0gMTA5ICl7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5yZWFkT25seSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQucmVhZE9ubHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBrZXl1cDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQgPT09IG51bGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIFIuc3RyID0gUi5oaWRkZW5JbXB1dC52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50LmFsbEVxdWFsICkgUi5wYXJlbnQuc2FtZVN0ciggUi5zdHIgKTsvLyBudW1lcmljIHNhbcO5ZSB2YWx1ZVxyXG4gICAgICAgIGVsc2UgUi5pbnB1dC50ZXh0Q29udGVudCA9IFIuc3RyO1xyXG5cclxuICAgICAgICBSLmN1cnNvcklkID0gUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICBSLmlucHV0UmFuZ2UgPSBbIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQsIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uRW5kIF07XHJcblxyXG4gICAgICAgIFIuc2VsZWN0UGFyZW50KCk7XHJcblxyXG4gICAgICAgIC8vaWYoIFIucGFyZW50LmFsbHdheSApIFxyXG4gICAgICAgIFIucGFyZW50LnZhbGlkYXRlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvL1xyXG4gICAgLy8gICBMSVNURU5JTkdcclxuICAgIC8vXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbG9vcDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggUi5pc0xvb3AgKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIFIubG9vcCApO1xyXG4gICAgICAgIFIudXBkYXRlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBSLmxpc3RlbnMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKSBSLmxpc3RlbnNbaV0ubGlzdGVuaW5nKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVMaXN0ZW46IGZ1bmN0aW9uICggcHJvdG8gKSB7XHJcblxyXG4gICAgICAgIGxldCBpZCA9IFIubGlzdGVucy5pbmRleE9mKCBwcm90byApO1xyXG4gICAgICAgIGlmKCBpZCAhPT0gLTEgKSBSLmxpc3RlbnMuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICBpZiggUi5saXN0ZW5zLmxlbmd0aCA9PT0gMCApIFIuaXNMb29wID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRMaXN0ZW46IGZ1bmN0aW9uICggcHJvdG8gKSB7XHJcblxyXG4gICAgICAgIGxldCBpZCA9IFIubGlzdGVucy5pbmRleE9mKCBwcm90byApO1xyXG5cclxuICAgICAgICBpZiggaWQgIT09IC0xICkgcmV0dXJuIGZhbHNlOyBcclxuXHJcbiAgICAgICAgUi5saXN0ZW5zLnB1c2goIHByb3RvICk7XHJcblxyXG4gICAgICAgIGlmKCAhUi5pc0xvb3AgKXtcclxuICAgICAgICAgICAgUi5pc0xvb3AgPSB0cnVlO1xyXG4gICAgICAgICAgICBSLmxvb3AoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUm9vdHMgPSBSOyIsImV4cG9ydCBjbGFzcyBWMiB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCB4ID0gMCwgeSA9IDAgKSB7XHJcblxyXG5cdFx0dGhpcy54ID0geDtcclxuXHRcdHRoaXMueSA9IHk7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0ICggeCwgeSApIHtcclxuXHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdFx0dGhpcy55ID0geTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpdmlkZSAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54IC89IHYueDtcclxuXHRcdHRoaXMueSAvPSB2Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRtdWx0aXBseSAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54ICo9IHYueDtcclxuXHRcdHRoaXMueSAqPSB2Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRtdWx0aXBseVNjYWxhciAoIHNjYWxhciApIHtcclxuXHJcblx0XHR0aGlzLnggKj0gc2NhbGFyO1xyXG5cdFx0dGhpcy55ICo9IHNjYWxhcjtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpdmlkZVNjYWxhciAoIHNjYWxhciApIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggMSAvIHNjYWxhciApO1xyXG5cclxuXHR9XHJcblxyXG5cdGxlbmd0aCAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICk7XHJcblxyXG5cdH1cclxuXHJcblx0YW5nbGUgKCkge1xyXG5cclxuXHRcdC8vIGNvbXB1dGVzIHRoZSBhbmdsZSBpbiByYWRpYW5zIHdpdGggcmVzcGVjdCB0byB0aGUgcG9zaXRpdmUgeC1heGlzXHJcblxyXG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMiggdGhpcy55LCB0aGlzLnggKTtcclxuXHJcblx0XHRpZiAoIGFuZ2xlIDwgMCApIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xyXG5cclxuXHRcdHJldHVybiBhbmdsZTtcclxuXHJcblx0fVxyXG5cclxuXHRhZGRTY2FsYXIgKCBzICkge1xyXG5cclxuXHRcdHRoaXMueCArPSBzO1xyXG5cdFx0dGhpcy55ICs9IHM7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRuZWdhdGUgKCkge1xyXG5cclxuXHRcdHRoaXMueCAqPSAtMTtcclxuXHRcdHRoaXMueSAqPSAtMTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdG5lZyAoKSB7XHJcblxyXG5cdFx0dGhpcy54ID0gLTE7XHJcblx0XHR0aGlzLnkgPSAtMTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGlzWmVybyAoKSB7XHJcblxyXG5cdFx0cmV0dXJuICggdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMCApO1xyXG5cclxuXHR9XHJcblxyXG5cdGNvcHkgKCB2ICkge1xyXG5cclxuXHRcdHRoaXMueCA9IHYueDtcclxuXHRcdHRoaXMueSA9IHYueTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRlcXVhbHMgKCB2ICkge1xyXG5cclxuXHRcdHJldHVybiAoICggdi54ID09PSB0aGlzLnggKSAmJiAoIHYueSA9PT0gdGhpcy55ICkgKTtcclxuXHJcblx0fVxyXG5cclxuXHRuZWFyRXF1YWxzICggdiwgbiApIHtcclxuXHJcblx0XHRyZXR1cm4gKCAoIHYueC50b0ZpeGVkKG4pID09PSB0aGlzLngudG9GaXhlZChuKSApICYmICggdi55LnRvRml4ZWQobikgPT09IHRoaXMueS50b0ZpeGVkKG4pICkgKTtcclxuXHJcblx0fVxyXG5cclxuXHRsZXJwICggdiwgYWxwaGEgKSB7XHJcblxyXG5cdFx0aWYoIHYgPT09IG51bGwgKXtcclxuXHRcdFx0dGhpcy54IC09IHRoaXMueCAqIGFscGhhO1xyXG5cdFx0ICAgIHRoaXMueSAtPSB0aGlzLnkgKiBhbHBoYTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMueCArPSAoIHYueCAtIHRoaXMueCApICogYWxwaGE7XHJcblx0XHQgICAgdGhpcy55ICs9ICggdi55IC0gdGhpcy55ICkgKiBhbHBoYTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4vUm9vdHMnO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4vVG9vbHMnO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4vVjInO1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuY2xhc3MgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIGlzIG9uIGd1aSBvciBncm91cFxyXG4gICAgICAgIHRoaXMubWFpbiA9IG8ubWFpbiB8fCBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNVSSA9IG8uaXNVSSB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5pc0xpc3RlbiA9IGZhbHNlO1xyXG4gICAgICAgIC8vdGhpcy5wYXJlbnRHcm91cCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMub250b3AgPSBvLm9udG9wID8gby5vbnRvcCA6IGZhbHNlOyAvLyAnYmVmb3JlYmVnaW4nICdhZnRlcmJlZ2luJyAnYmVmb3JlZW5kJyAnYWZ0ZXJlbmQnXHJcblxyXG4gICAgICAgIHRoaXMuY3NzID0gdGhpcy5tYWluID8gdGhpcy5tYWluLmNzcyA6IFRvb2xzLmNzcztcclxuICAgICAgICB0aGlzLmNvbG9ycyA9IHRoaXMubWFpbiA/IHRoaXMubWFpbi5jb2xvcnMgOiBUb29scy5jb2xvcnM7XHJcblxyXG4gICAgICAgIHRoaXMuZGVmYXVsdEJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9yZGVyO1xyXG4gICAgICAgIHRoaXMuc3ZncyA9IFRvb2xzLnN2Z3M7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgc3BhY2UgXHJcbiAgICAgICAgdGhpcy5pc1NwYWNlID0gby5pc1NwYWNlIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnpvbmUgPSB7IHg6MCwgeTowLCB3OjAsIGg6MCB9O1xyXG4gICAgICAgIHRoaXMubG9jYWwgPSBuZXcgVjIoKS5uZWcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0NhbnZhc09ubHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbGVjdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBwZXJjZW50IG9mIHRpdGxlXHJcbiAgICAgICAgdGhpcy5wID0gby5wICE9PSB1bmRlZmluZWQgPyBvLnAgOiBUb29scy5zaXplLnA7XHJcblxyXG4gICAgICAgIHRoaXMudyA9IHRoaXMuaXNVSSA/IHRoaXMubWFpbi5zaXplLncgOiBUb29scy5zaXplLnc7XHJcbiAgICAgICAgaWYoIG8udyAhPT0gdW5kZWZpbmVkICkgdGhpcy53ID0gby53O1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmlzVUkgPyB0aGlzLm1haW4uc2l6ZS5oIDogVG9vbHMuc2l6ZS5oO1xyXG4gICAgICAgIGlmKCBvLmggIT09IHVuZGVmaW5lZCApIHRoaXMuaCA9IG8uaDtcclxuICAgICAgICBpZiggIXRoaXMuaXNTcGFjZSApIHRoaXMuaCA9IHRoaXMuaCA8IDExID8gMTEgOiB0aGlzLmg7XHJcblxyXG4gICAgICAgIC8vIGlmIG5lZWQgcmVzaXplIHdpZHRoXHJcbiAgICAgICAgdGhpcy5hdXRvV2lkdGggPSBvLmF1dG8gfHwgdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gb3BlbiBzdGF0dVxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHJhZGl1cyBmb3IgdG9vbGJveFxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gby5yYWRpdXMgfHwgdGhpcy5jb2xvcnMucmFkaXVzO1xyXG5cclxuICAgICAgICAvLyBvbmx5IGZvciBudW1iZXJcclxuICAgICAgICB0aGlzLmlzTnVtYmVyID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ub05lZyA9IG8ubm9OZWcgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hbGxFcXVhbCA9IG8uYWxsRXF1YWwgfHwgZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gb25seSBtb3N0IHNpbXBsZSBcclxuICAgICAgICB0aGlzLm1vbm8gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gc3RvcCBsaXN0ZW5pbmcgZm9yIGVkaXQgc2xpZGUgdGV4dFxyXG4gICAgICAgIHRoaXMuaXNFZGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIG5vIHRpdGxlIFxyXG4gICAgICAgIHRoaXMuc2ltcGxlID0gby5zaW1wbGUgfHwgZmFsc2U7XHJcbiAgICAgICAgaWYoIHRoaXMuc2ltcGxlICkgdGhpcy5zYSA9IDA7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvLyBkZWZpbmUgb2JqIHNpemVcclxuICAgICAgICB0aGlzLnNldFNpemUoIHRoaXMudyApO1xyXG5cclxuICAgICAgICAvLyB0aXRsZSBzaXplXHJcbiAgICAgICAgaWYoby5zYSAhPT0gdW5kZWZpbmVkICkgdGhpcy5zYSA9IG8uc2E7XHJcbiAgICAgICAgaWYoby5zYiAhPT0gdW5kZWZpbmVkICkgdGhpcy5zYiA9IG8uc2I7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnNpbXBsZSApIHRoaXMuc2IgPSB0aGlzLncgLSB0aGlzLnNhO1xyXG5cclxuICAgICAgICAvLyBsYXN0IG51bWJlciBzaXplIGZvciBzbGlkZVxyXG4gICAgICAgIHRoaXMuc2MgPSBvLnNjID09PSB1bmRlZmluZWQgPyA0NyA6IG8uc2M7XHJcblxyXG4gICAgICAgIC8vIGZvciBsaXN0ZW5pbmcgb2JqZWN0XHJcbiAgICAgICAgdGhpcy5vYmplY3RMaW5rID0gbnVsbDtcclxuICAgICAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudmFsID0gbnVsbDtcclxuICAgICAgICBcclxuICAgICAgICAvLyBCYWNrZ3JvdW5kXHJcbiAgICAgICAgdGhpcy5iZyA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7XHJcbiAgICAgICAgdGhpcy5iZ092ZXIgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kT3ZlcjtcclxuICAgICAgICBpZiggby5iZyAhPT0gdW5kZWZpbmVkICl7IHRoaXMuYmcgPSBvLmJnOyB0aGlzLmJnT3ZlciA9IG8uYmc7IH1cclxuICAgICAgICBpZiggby5iZ092ZXIgIT09IHVuZGVmaW5lZCApeyB0aGlzLmJnT3ZlciA9IG8uYmdPdmVyOyB9XHJcblxyXG4gICAgICAgIC8vIEZvbnQgQ29sb3I7XHJcbiAgICAgICAgdGhpcy50aXRsZUNvbG9yID0gby50aXRsZUNvbG9yIHx8IHRoaXMuY29sb3JzLnRleHQ7XHJcbiAgICAgICAgdGhpcy5mb250Q29sb3IgPSBvLmZvbnRDb2xvciB8fCB0aGlzLmNvbG9ycy50ZXh0O1xyXG4gICAgICAgIHRoaXMuZm9udFNlbGVjdCA9IG8uZm9udFNlbGVjdCB8fCB0aGlzLmNvbG9ycy50ZXh0T3ZlcjtcclxuXHJcbiAgICAgICAgaWYoIG8uY29sb3IgIT09IHVuZGVmaW5lZCApIHRoaXMuZm9udENvbG9yID0gby5jb2xvcjtcclxuICAgICAgICAgICAgLyp7IFxyXG5cclxuICAgICAgICAgICAgaWYoby5jb2xvciA9PT0gJ24nKSBvLmNvbG9yID0gJyNmZjAwMDAnO1xyXG5cclxuICAgICAgICAgICAgaWYoIG8uY29sb3IgIT09ICdubycgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiggIWlzTmFOKG8uY29sb3IpICkgdGhpcy5mb250Q29sb3IgPSBUb29scy5oZXhUb0h0bWwoby5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHRoaXMuZm9udENvbG9yID0gby5jb2xvcjtcclxuICAgICAgICAgICAgICAgIHRoaXMudGl0bGVDb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0qL1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8qaWYoIG8uY29sb3IgIT09IHVuZGVmaW5lZCApeyBcclxuICAgICAgICAgICAgaWYoICFpc05hTihvLmNvbG9yKSApIHRoaXMuZm9udENvbG9yID0gVG9vbHMuaGV4VG9IdG1sKG8uY29sb3IpO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMuZm9udENvbG9yID0gby5jb2xvcjtcclxuICAgICAgICAgICAgdGhpcy50aXRsZUNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIHRoaXMuY29sb3JQbHVzID0gVG9vbHMuQ29sb3JMdW1hKCB0aGlzLmZvbnRDb2xvciwgMC4zICk7XHJcblxyXG4gICAgICAgIHRoaXMudHh0ID0gby5uYW1lIHx8ICcnO1xyXG4gICAgICAgIHRoaXMucmVuYW1lID0gby5yZW5hbWUgfHwgJyc7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBvLnRhcmdldCB8fCBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gby5jYWxsYmFjayA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG8uY2FsbGJhY2s7XHJcbiAgICAgICAgdGhpcy5lbmRDYWxsYmFjayA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrID09PSBudWxsICYmIHRoaXMuaXNVSSAmJiB0aGlzLm1haW4uY2FsbGJhY2sgIT09IG51bGwgKSB0aGlzLmNhbGxiYWNrID0gdGhpcy5tYWluLmNhbGxiYWNrO1xyXG5cclxuICAgICAgICAvLyBlbGVtZW50c1xyXG4gICAgICAgIHRoaXMuYyA9IFtdO1xyXG5cclxuICAgICAgICAvLyBzdHlsZSBcclxuICAgICAgICB0aGlzLnMgPSBbXTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY1swXSA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOyBoZWlnaHQ6MjBweDsgZmxvYXQ6bGVmdDsgb3ZlcmZsb3c6aGlkZGVuOycpO1xyXG4gICAgICAgIHRoaXMuc1swXSA9IHRoaXMuY1swXS5zdHlsZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMuc1swXS5tYXJnaW5Cb3R0b20gPSAnMXB4JztcclxuICAgICAgICBcclxuICAgICAgICAvLyB3aXRoIHRpdGxlXHJcbiAgICAgICAgaWYoICF0aGlzLnNpbXBsZSApeyBcclxuICAgICAgICAgICAgdGhpcy5jWzFdID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICk7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXSA9IHRoaXMuY1sxXS5zdHlsZTtcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy5yZW5hbWUgPT09ICcnID8gdGhpcy50eHQgOiB0aGlzLnJlbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5zWzFdLmNvbG9yID0gdGhpcy50aXRsZUNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG8ucG9zICl7XHJcbiAgICAgICAgICAgIHRoaXMuc1swXS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgICAgIGZvcihsZXQgcCBpbiBvLnBvcyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMF1bcF0gPSBvLnBvc1twXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm1vbm8gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG8uY3NzICkgdGhpcy5zWzBdLmNzc1RleHQgPSBvLmNzczsgXHJcbiAgICAgICAgXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIG1ha2UgdGhlIG5vZGVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIFxyXG4gICAgaW5pdCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMuczsgLy8gc3R5bGUgY2FjaGVcclxuICAgICAgICBsZXQgYyA9IHRoaXMuYzsgLy8gZGl2IGNhY2hcclxuXHJcbiAgICAgICAgc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1VJICApIHNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcbiAgICAgICAgLy9pZiggdGhpcy5pc1NwYWNlICApIHNbMF0uYmFja2dyb3VuZCA9ICdub25lJztcclxuXHJcbiAgICAgICAgLy9pZiggdGhpcy5hdXRvSGVpZ2h0ICkgc1swXS50cmFuc2l0aW9uID0gJ2hlaWdodCAwLjAxcyBlYXNlLW91dCc7XHJcbiAgICAgICAgaWYoIGNbMV0gIT09IHVuZGVmaW5lZCAmJiB0aGlzLmF1dG9XaWR0aCApe1xyXG4gICAgICAgICAgICBzWzFdID0gY1sxXS5zdHlsZTtcclxuICAgICAgICAgICAgc1sxXS5oZWlnaHQgPSAodGhpcy5oLTQpICsgJ3B4JztcclxuICAgICAgICAgICAgc1sxXS5saW5lSGVpZ2h0ID0gKHRoaXMuaC04KSArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZnJhZyA9IFRvb2xzLmZyYWc7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAxLCBsbmcgPSBjLmxlbmd0aDsgaSAhPT0gbG5nOyBpKysgKXtcclxuICAgICAgICAgICAgaWYoIGNbaV0gIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoIGNbaV0gKTtcclxuICAgICAgICAgICAgICAgIHNbaV0gPSBjW2ldLnN0eWxlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcHAgPSB0aGlzLnRhcmdldCAhPT0gbnVsbCA/IHRoaXMudGFyZ2V0IDogKHRoaXMuaXNVSSA/IHRoaXMubWFpbi5pbm5lciA6IGRvY3VtZW50LmJvZHkpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vbnRvcCApIHBwLmluc2VydEFkamFjZW50RWxlbWVudCggJ2FmdGVyYmVnaW4nLCBjWzBdICk7XHJcbiAgICAgICAgZWxzZSBwcC5hcHBlbmRDaGlsZCggY1swXSApO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLyppZiggdGhpcy50YXJnZXQgIT09IG51bGwgKXsgXHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LmFwcGVuZENoaWxkKCBjWzBdICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5pbm5lci5hcHBlbmRDaGlsZCggY1swXSApO1xyXG4gICAgICAgICAgICBlbHNlIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGNbMF0gKTtcclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgY1swXS5hcHBlbmRDaGlsZCggZnJhZyApO1xyXG5cclxuICAgICAgICB0aGlzLnJTaXplKCk7XHJcblxyXG4gICAgICAgIC8vICEgc29sbyBwcm90b1xyXG4gICAgICAgIGlmKCAhdGhpcy5pc1VJICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMF0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuICAgICAgICAgICAgUm9vdHMuYWRkKCB0aGlzICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZnJvbSBUb29sc1xyXG5cclxuICAgIGRvbSAoIHR5cGUsIGNzcywgb2JqLCBkb20sIGlkICkge1xyXG5cclxuICAgICAgICByZXR1cm4gVG9vbHMuZG9tKCB0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRTdmcgKCBkb20sIHR5cGUsIHZhbHVlLCBpZCwgaWQyICkge1xyXG5cclxuICAgICAgICBUb29scy5zZXRTdmcoIGRvbSwgdHlwZSwgdmFsdWUsIGlkLCBpZDIgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q3NzICggZG9tLCBjc3MgKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLnNldENzcyggZG9tLCBjc3MgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAgKCB2YWx1ZSwgbWluLCBtYXggKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBUb29scy5jbGFtcCggdmFsdWUsIG1pbiwgbWF4ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldENvbG9yUmluZyAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHMuY29sb3JSaW5nICkgVG9vbHMubWFrZUNvbG9yUmluZygpO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHMuY29sb3JSaW5nICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldEpveXN0aWNrICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHNbICdqb3lzdGlja18nKyBtb2RlbCBdICkgVG9vbHMubWFrZUpveXN0aWNrKCBtb2RlbCApO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHNbICdqb3lzdGlja18nKyBtb2RlbCBdICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldENpcmN1bGFyICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHMuY2lyY3VsYXIgKSBUb29scy5tYWtlQ2lyY3VsYXIoIG1vZGVsICk7XHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmNsb25lKCBUb29scy5jaXJjdWxhciApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXRLbm9iICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHMua25vYiApIFRvb2xzLm1ha2VLbm9iKCBtb2RlbCApO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHMua25vYiApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBmcm9tIFJvb3RzXHJcblxyXG4gICAgY3Vyc29yICggbmFtZSApIHtcclxuXHJcbiAgICAgICAgIFJvb3RzLmN1cnNvciggbmFtZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICAvLy8vLy8vLy9cclxuXHJcbiAgICB1cGRhdGUgKCkge31cclxuXHJcbiAgICByZXNldCAoKSB7fVxyXG5cclxuICAgIC8vLy8vLy8vL1xyXG5cclxuICAgIGdldERvbSAoKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmNbMF07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3V0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTcGFjZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYodGhpcy5zKSB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3ZlciAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU3BhY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKHRoaXMucykgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnT3ZlcjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVuYW1lICggcyApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkKSB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSBzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW4gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmlzTGlzdGVuID0gUm9vdHMuYWRkTGlzdGVuKCB0aGlzICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbmluZyAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdExpbmsgPT09IG51bGwgKSByZXR1cm47XHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZW5kICkgcmV0dXJuO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzRWRpdCApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSggdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFZhbHVlICggdiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNOdW1iZXIgKSB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdiApO1xyXG4gICAgICAgIC8vZWxzZSBpZiggdiBpbnN0YW5jZW9mIEFycmF5ICYmIHYubGVuZ3RoID09PSAxICkgdiA9IHZbMF07XHJcbiAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gdjtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gdXBkYXRlIGV2ZXJ5IGNoYW5nZVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9uQ2hhbmdlICggZiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTcGFjZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGYgfHwgbnVsbDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gdXBkYXRlIG9ubHkgb24gZW5kXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgb25GaW5pc2hDaGFuZ2UgKCBmICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NwYWNlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVuZENhbGxiYWNrID0gZjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VuZCAoIHYgKSB7XHJcblxyXG4gICAgICAgIHYgPSB2IHx8IHRoaXMudmFsdWU7XHJcbiAgICAgICAgaWYoIHYgaW5zdGFuY2VvZiBBcnJheSAmJiB2Lmxlbmd0aCA9PT0gMSApIHYgPSB2WzBdO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VuZCA9IHRydWU7XHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCApIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSA9IHY7XHJcbiAgICAgICAgaWYoIHRoaXMuY2FsbGJhY2sgKSB0aGlzLmNhbGxiYWNrKCB2LCB0aGlzLnZhbCApO1xyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbmRFbmQgKCB2ICkge1xyXG5cclxuICAgICAgICB2ID0gdiB8fCB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGlmKCB2IGluc3RhbmNlb2YgQXJyYXkgJiYgdi5sZW5ndGggPT09IDEgKSB2ID0gdlswXTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuZW5kQ2FsbGJhY2sgKSB0aGlzLmVuZENhbGxiYWNrKCB2ICk7XHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCApIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSA9IHY7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGNsZWFyIG5vZGVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIFxyXG4gICAgY2xlYXIgKCBub2Z1bGwgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzTGlzdGVuICkgUm9vdHMucmVtb3ZlTGlzdGVuKCB0aGlzICk7XHJcblxyXG4gICAgICAgIFRvb2xzLmNsZWFyKCB0aGlzLmNbMF0gKTtcclxuXHJcbiAgICAgICAgaWYoICFub2Z1bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnRhcmdldCAhPT0gbnVsbCApeyBcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5ncm91cCAhPT0gbnVsbCAgKSB0aGlzLmdyb3VwLmNsZWFyT25lKCB0aGlzICk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHRoaXMudGFyZ2V0LnJlbW92ZUNoaWxkKCB0aGlzLmNbMF0gKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jbGVhck9uZSggdGhpcyApO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCB0aGlzLmNbMF0gKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5pc1VJICkgUm9vdHMucmVtb3ZlKCB0aGlzICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jID0gbnVsbDtcclxuICAgICAgICB0aGlzLnMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmlzTGlzdGVuID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGNoYW5nZSBzaXplIFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNldFNpemUgKCBzeCApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmF1dG9XaWR0aCApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy53ID0gc3g7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnNpbXBsZSApe1xyXG4gICAgICAgICAgICB0aGlzLnNiID0gdGhpcy53IC0gdGhpcy5zYTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgcHAgPSB0aGlzLncgKiAoIHRoaXMucCAvIDEwMCApO1xyXG4gICAgICAgICAgICB0aGlzLnNhID0gTWF0aC5mbG9vciggcHAgKyAxMCApO1xyXG4gICAgICAgICAgICB0aGlzLnNiID0gTWF0aC5mbG9vciggdGhpcy53IC0gcHAgLSAyMCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuYXV0b1dpZHRoICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuc1swXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcbiAgICAgICAgaWYoICF0aGlzLnNpbXBsZSApIHRoaXMuc1sxXS53aWR0aCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gZm9yIG51bWVyaWMgdmFsdWVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRUeXBlTnVtYmVyICggbyApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc051bWJlciA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSAwO1xyXG4gICAgICAgIGlmKG8udmFsdWUgIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGlmKCB0eXBlb2Ygby52YWx1ZSA9PT0gJ3N0cmluZycgKSB0aGlzLnZhbHVlID0gby52YWx1ZSAqIDE7XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IG8udmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1pbiA9IG8ubWluID09PSB1bmRlZmluZWQgPyAtSW5maW5pdHkgOiBvLm1pbjtcclxuICAgICAgICB0aGlzLm1heCA9IG8ubWF4ID09PSB1bmRlZmluZWQgPyAgSW5maW5pdHkgOiBvLm1heDtcclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uID09PSB1bmRlZmluZWQgPyAyIDogby5wcmVjaXNpb247XHJcblxyXG4gICAgICAgIGxldCBzO1xyXG5cclxuICAgICAgICBzd2l0Y2godGhpcy5wcmVjaXNpb24pe1xyXG4gICAgICAgICAgICBjYXNlIDA6IHMgPSAxOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiBzID0gMC4xOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiBzID0gMC4wMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzogcyA9IDAuMDAxOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OiBzID0gMC4wMDAxOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA1OiBzID0gMC4wMDAwMTsgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnN0ZXAgPSBvLnN0ZXAgPT09IHVuZGVmaW5lZCA/ICBzIDogby5zdGVwO1xyXG4gICAgICAgIHRoaXMucmFuZ2UgPSB0aGlzLm1heCAtIHRoaXMubWluO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB0aGlzLnZhbHVlICk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgbnVtVmFsdWUgKCBuICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5ub05lZyApIG4gPSBNYXRoLmFicyggbiApO1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbiggdGhpcy5tYXgsIE1hdGgubWF4KCB0aGlzLm1pbiwgbiApICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UUyBERUZBVUxUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaGFuZGxlRXZlbnQgKCBlICl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU3BhY2UgKSByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbZS50eXBlXShlKTtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsICggZSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIGtleWRvd24gKCBlICkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICBjbGljayAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIGtleXVwICggZSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIG9iamVjdCByZWZlcmVuY3lcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRSZWZlcmVuY3kgKCBvYmosIHZhbCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5vYmplY3RMaW5rID0gb2JqO1xyXG4gICAgICAgIHRoaXMudmFsID0gdmFsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkaXNwbGF5ICggdiApIHtcclxuICAgICAgICBcclxuICAgICAgICB2ID0gdiB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLnNbMF0uZGlzcGxheSA9IHYgPyAnYmxvY2snIDogJ25vbmUnO1xyXG4gICAgICAgIC8vdGhpcy5pc1JlYWR5ID0gdiA/IGZhbHNlIDogdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gcmVzaXplIGhlaWdodCBcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvcGVuICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG5lZWRab25lICgpIHtcclxuXHJcbiAgICAgICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlem9uZSAoKSB7XHJcblxyXG4gICAgICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3QgKCkge1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgdW5zZWxlY3QgKCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRJbnB1dCAoIElucHV0ICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIFJvb3RzLnNldElucHV0KCBJbnB1dCwgdGhpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cElucHV0ICggeCwgZG93biApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFJvb3RzLnVwSW5wdXQoIHgsIGRvd24gKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gc3BlY2lhbCBpdGVtIFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdGVkICggYiApe1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VsZWN0ID0gYiB8fCBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCB7IFByb3RvIH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCb29sIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgICAgIHRoaXMuaW5oID0gby5pbmggfHwgTWF0aC5mbG9vciggdGhpcy5oKjAuOCApO1xyXG4gICAgICAgIHRoaXMuaW53ID0gby5pbncgfHwgMzY7XHJcblxyXG4gICAgICAgIGxldCB0ID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS0oKHRoaXMuaW5oLTIpKjAuNSk7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYmFja2dyb3VuZDonKyB0aGlzLmNvbG9ycy5ib29sYmcgKyc7IGhlaWdodDonKyh0aGlzLmluaC0yKSsncHg7IHdpZHRoOicrdGhpcy5pbncrJ3B4OyB0b3A6Jyt0KydweDsgYm9yZGVyLXJhZGl1czoxMHB4OyBib3JkZXI6MnB4IHNvbGlkICcrdGhpcy5ib29sYmcgKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2hlaWdodDonKyh0aGlzLmluaC02KSsncHg7IHdpZHRoOjE2cHg7IHRvcDonKyh0KzIpKydweDsgYm9yZGVyLXJhZGl1czoxMHB4OyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSA/IGZhbHNlIDogdHJ1ZTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdXBkYXRlICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnZhbHVlICl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzWzJdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5ib29sb247XHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5ib29sb247XHJcbiAgICAgICAgICAgIHNbM10ubWFyZ2luTGVmdCA9ICcxN3B4JztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHNbMl0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJvb2xiZztcclxuICAgICAgICAgICAgc1syXS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmJvb2xiZztcclxuICAgICAgICAgICAgc1szXS5tYXJnaW5MZWZ0ID0gJzJweCc7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gKHRoaXMudyAtIDEwICkgLSB0aGlzLmludztcclxuICAgICAgICBzWzJdLmxlZnQgPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSB3ICsgJ3B4JztcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBvLnZhbHVlIHx8IHRoaXMudHh0O1xyXG5cclxuICAgICAgICB0aGlzLm9uTmFtZSA9IG8ub25OYW1lIHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLm9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgdGhpcy52YWx1ZXMgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZXMgPSBbIHRoaXMudmFsdWVzIF07XHJcblxyXG4gICAgICAgIC8vdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0xpbmsgPSBvLmxpbmsgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIGN1c3RvbSBjb2xvclxyXG4gICAgICAgIHRoaXMuY2MgPSBbIHRoaXMuY29sb3JzLmJ1dHRvbiwgdGhpcy5jb2xvcnMuc2VsZWN0LCB0aGlzLmNvbG9ycy5kb3duIF07XHJcblxyXG4gICAgICAgIGlmKCBvLmNCZyAhPT0gdW5kZWZpbmVkICkgdGhpcy5jY1swXSA9IG8uY0JnO1xyXG4gICAgICAgIGlmKCBvLmJDb2xvciAhPT0gdW5kZWZpbmVkICkgdGhpcy5jY1swXSA9IG8uYkNvbG9yO1xyXG4gICAgICAgIGlmKCBvLmNTZWxlY3QgIT09IHVuZGVmaW5lZCApIHRoaXMuY2NbMV0gPSBvLmNTZWxlY3Q7XHJcbiAgICAgICAgaWYoIG8uY0Rvd24gIT09IHVuZGVmaW5lZCApIHRoaXMuY2NbMl0gPSBvLmNEb3duO1xyXG5cclxuICAgICAgICB0aGlzLmlzTG9hZEJ1dHRvbiA9IG8ubG9hZGVyIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNEcmFnQnV0dG9uID0gby5kcmFnIHx8IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRHJhZ0J1dHRvbiApIHRoaXMuaXNMb2FkQnV0dG9uID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlcy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy50bXAgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXQgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MuYnV0dG9uICsgJ3RvcDoxcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmNjWzBdKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXI6Jyt0aGlzLmNvbG9ycy5idXR0b25Cb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRbaV0gPSAxO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9ICcnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0xvYWRCdXR0b24gKSB0aGlzLmluaXRMb2FkZXIoKTtcclxuICAgICAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKXsgXHJcbiAgICAgICAgICAgIHRoaXMubG5nICsrO1xyXG4gICAgICAgICAgICB0aGlzLmluaXREcmFnZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBvbk9mZiAoICl7XHJcblxyXG4gICAgICAgIHRoaXMub24gPSAhdGhpcy5vbjtcclxuICAgICAgICB0aGlzLmNbMl0uaW5uZXJIVE1MID0gdGhpcy5vbiA/IHRoaXMub25OYW1lIDogdGhpcy52YWx1ZXNbMF07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgXHRpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaSsyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2xpY2sgKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vbk5hbWUhPT0gJycgKSB0aGlzLm9uT2ZmKCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzTGluayApe1xyXG5cclxuICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1tuYW1lLTJdXHJcbiAgICAgICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcbiAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNMaW5rICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbbmFtZS0yXVxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0xvYWRCdXR0b24gKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICAvL2Vsc2UgdGhpcy5maWxlU2VsZWN0KCBlLnRhcmdldC5maWxlc1swXSApO1xyXG4gICAgXHRyZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuIFxyXG4gICAgICAgIC8vIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAvLyBjb25zb2xlLmxvZyhuYW1lKVxyXG5cclxuICAgICAgICBpZiggbmFtZSAhPT0gJycgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBuYW1lICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh1cClcclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZXMgKCBuLCBuYW1lICkge1xyXG5cclxuICAgICAgICBsZXQgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09PSBuYW1lLTIgKSB2ID0gdGhpcy5tb2RlKCBuLCBpKzIgKTtcclxuICAgICAgICAgICAgZWxzZSB2ID0gdGhpcy5tb2RlKCAxLCBpKzIgKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgbW9kZSAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBuYW1lIC0gMjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpXSAhPT0gbiApe1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdFtpXSA9IDE7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5jY1swXTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdFtpXSA9IDI7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuY2NbMV07IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXRbaV0gPSAzOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmNjWzJdOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgLypsZXQgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuICAgICAgICAgICAgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlcyggMSAsIDIgKTtcclxuXHJcbiAgICBcdC8qaWYoIHRoaXMuc2VsZWN0ZWQgKXtcclxuICAgIFx0XHR0aGlzLnNbIHRoaXMuc2VsZWN0ZWQgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnNbIHRoaXMuc2VsZWN0ZWQgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIFx0fVxyXG4gICAgICAgIHJldHVybiBmYWxzZTsqL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZHJhZ292ZXIgKCBlICkge1xyXG5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICB0aGlzLnNbNF0uY29sb3IgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRyYWdlbmQgKCBlICkge1xyXG5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS5ib3JkZXJDb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHRoaXMuc1s0XS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkcm9wICggZSApIHtcclxuXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICB0aGlzLmRyYWdlbmQoZSk7XHJcbiAgICAgICAgdGhpcy5maWxlU2VsZWN0KCBlLmRhdGFUcmFuc2Zlci5maWxlc1swXSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpbml0RHJhZ2VyICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKycgdGV4dC1hbGlnbjpjZW50ZXI7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC04KSsncHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5mb250Q29sb3IrJzsgdG9wOjJweDsgIGhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OyBwb2ludGVyLWV2ZW50czphdXRvOycgKTsvLyBjdXJzb3I6ZGVmYXVsdDtcclxuICAgICAgICB0aGlzLmNbNF0udGV4dENvbnRlbnQgPSAnRFJBRyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1s0XS5hZGRFdmVudExpc3RlbmVyKCAnZHJhZ292ZXInLCBmdW5jdGlvbihlKXsgdGhpcy5kcmFnb3ZlcihlKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG4gICAgICAgIHRoaXMuY1s0XS5hZGRFdmVudExpc3RlbmVyKCAnZHJhZ2VuZCcsIGZ1bmN0aW9uKGUpeyB0aGlzLmRyYWdlbmQoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpeyB0aGlzLmRyYWdlbmQoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2Ryb3AnLCBmdW5jdGlvbihlKXsgdGhpcy5kcm9wKGUpOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdLmV2ZW50cyA9IFsgIF07XHJcbiAgICAgICAgLy90aGlzLmNbNF0uZXZlbnRzID0gWyAnZHJhZ292ZXInLCAnZHJhZ2VuZCcsICdkcmFnbGVhdmUnLCAnZHJvcCcgXTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGluaXRMb2FkZXIgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2lucHV0JywgdGhpcy5jc3MuYmFzaWMgKyd0b3A6MHB4OyBvcGFjaXR5OjA7IGhlaWdodDonKyh0aGlzLmgpKydweDsgcG9pbnRlci1ldmVudHM6YXV0bzsgY3Vyc29yOnBvaW50ZXI7JyApOy8vXHJcbiAgICAgICAgdGhpcy5jWzNdLm5hbWUgPSAnbG9hZGVyJztcclxuICAgICAgICB0aGlzLmNbM10udHlwZSA9IFwiZmlsZVwiO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10uYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsIGZ1bmN0aW9uKGUpeyB0aGlzLmZpbGVTZWxlY3QoIGUudGFyZ2V0LmZpbGVzWzBdICk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICAvL3RoaXMuY1szXS5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSl7ICB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdLmV2ZW50cyA9IFsgIF07XHJcbiAgICAgICAgLy90aGlzLmNbM10uZXZlbnRzID0gWyAnY2hhbmdlJywgJ21vdXNlb3ZlcicsICdtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW91dCcgXTtcclxuXHJcbiAgICAgICAgLy90aGlzLmhpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmaWxlU2VsZWN0ICggZmlsZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGRhdGFVcmwgPSBbICdwbmcnLCAnanBnJywgJ21wNCcsICd3ZWJtJywgJ29nZycgXTtcclxuICAgICAgICBsZXQgZGF0YUJ1ZiA9IFsgJ3NlYScsICd6JywgJ2hleCcsICdidmgnLCAnQlZIJywgJ2dsYicgXTtcclxuXHJcbiAgICAgICAgLy9pZiggISBlLnRhcmdldC5maWxlcyApIHJldHVybjtcclxuXHJcbiAgICAgICAgLy9sZXQgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xyXG4gICAgICAgXHJcbiAgICAgICAgLy90aGlzLmNbM10udHlwZSA9IFwibnVsbFwiO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCB0aGlzLmNbNF0gKVxyXG5cclxuICAgICAgICBpZiggZmlsZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICBsZXQgZm5hbWUgPSBmaWxlLm5hbWU7XHJcbiAgICAgICAgbGV0IHR5cGUgPSBmbmFtZS5zdWJzdHJpbmcoZm5hbWUubGFzdEluZGV4T2YoJy4nKSsxLCBmbmFtZS5sZW5ndGggKTtcclxuXHJcbiAgICAgICAgaWYoIGRhdGFVcmwuaW5kZXhPZiggdHlwZSApICE9PSAtMSApIHJlYWRlci5yZWFkQXNEYXRhVVJMKCBmaWxlICk7XHJcbiAgICAgICAgZWxzZSBpZiggZGF0YUJ1Zi5pbmRleE9mKCB0eXBlICkgIT09IC0xICkgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlICk7Ly9yZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTtcclxuICAgICAgICBlbHNlIHJlYWRlci5yZWFkQXNUZXh0KCBmaWxlICk7XHJcblxyXG4gICAgICAgIC8vIGlmKCB0eXBlID09PSAncG5nJyB8fCB0eXBlID09PSAnanBnJyB8fCB0eXBlID09PSAnbXA0JyB8fCB0eXBlID09PSAnd2VibScgfHwgdHlwZSA9PT0gJ29nZycgKSByZWFkZXIucmVhZEFzRGF0YVVSTCggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSBpZiggdHlwZSA9PT0gJ3onICkgcmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSBpZiggdHlwZSA9PT0gJ3NlYScgfHwgdHlwZSA9PT0gJ2J2aCcgfHwgdHlwZSA9PT0gJ0JWSCcgfHwgdHlwZSA9PT0gJ3onKSByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoICApIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSByZWFkZXIucmVhZEFzVGV4dCggZmlsZSApO1xyXG5cclxuICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayggZS50YXJnZXQucmVzdWx0LCBmbmFtZSwgdHlwZSApO1xyXG4gICAgICAgICAgICAvL3RoaXMuY1szXS50eXBlID0gXCJmaWxlXCI7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCBlLnRhcmdldC5yZXN1bHQgKTsgXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsYWJlbCAoIHN0cmluZywgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMjtcclxuICAgICAgICB0aGlzLmNbbl0udGV4dENvbnRlbnQgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGljb24gKCBzdHJpbmcsIHksIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5zW25dLnBhZGRpbmcgPSAoIHkgfHwgMCApICsncHggMHB4JztcclxuICAgICAgICB0aGlzLmNbbl0uaW5uZXJIVE1MID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy5zYjtcclxuICAgICAgICBsZXQgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IGRjID0gIDM7XHJcbiAgICAgICAgbGV0IHNpemUgPSBNYXRoLmZsb29yKCAoIHctKGRjKihpLTEpKSApIC8gaSApO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgIFx0dGhpcy50bXBbaV0gPSBbIE1hdGguZmxvb3IoIGQgKyAoIHNpemUgKiBpICkgKyAoIGRjICogaSApKSwgc2l6ZSBdO1xyXG4gICAgICAgIFx0dGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG5cclxuICAgICAgICAgICAgc1tpKzJdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCc7XHJcbiAgICAgICAgICAgIHNbaSsyXS53aWR0aCA9IHRoaXMudG1wW2ldWzFdICsgJ3B4JztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKXsgXHJcbiAgICAgICAgICAgIHNbNF0ubGVmdCA9IChkK3NpemUrZGMpICsgJ3B4JztcclxuICAgICAgICAgICAgc1s0XS53aWR0aCA9IHNpemUgKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNMb2FkQnV0dG9uICl7XHJcbiAgICAgICAgICAgIHNbM10ubGVmdCA9IGQgKyAncHgnO1xyXG4gICAgICAgICAgICBzWzNdLndpZHRoID0gc2l6ZSArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZXhwb3J0IGNsYXNzIENpcmN1bGFyIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VHlwZU51bWJlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHRoaXMudyAqIDAuNTsvL01hdGguZmxvb3IoKHRoaXMudy0yMCkqMC41KTtcclxuXHJcbiAgICAgICAgdGhpcy50d29QaSA9IE1hdGguUEkgKiAyO1xyXG4gICAgICAgIHRoaXMucGk5MCA9IE1hdGguUEkgKiAwLjU7XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gbmV3IFYyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMDtcclxuICAgICAgICB0aGlzLnRvcCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICAgICAgaWYodGhpcy5jWzFdICE9PSB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmdldENpcmN1bGFyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAxICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnK3RoaXMudysnICcrdGhpcy53ICk7XHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLncsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY21vZGUgPT09IG1vZGUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIHN3aXRjaCggbW9kZSApe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC4xKScsIDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuY29sb3JQbHVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC4zKScsIDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuY29sb3JQbHVzLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IG1vZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zZW5kRW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLm9sZHIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgLy90aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBvZmYgPSB0aGlzLm9mZnNldDtcclxuXHJcbiAgICAgICAgb2ZmLnggPSB0aGlzLnJhZGl1cyAtIChlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIG9mZi55ID0gdGhpcy5yYWRpdXMgLSAoZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCApO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSBvZmYuYW5nbGUoKSAtIHRoaXMucGk5MDtcclxuICAgICAgICB0aGlzLnIgPSAoKCh0aGlzLnIldGhpcy50d29QaSkrdGhpcy50d29QaSkldGhpcy50d29QaSk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9sZHIgIT09IG51bGwgKXsgXHJcblxyXG4gICAgICAgICAgICB2YXIgZGlmID0gdGhpcy5yIC0gdGhpcy5vbGRyO1xyXG4gICAgICAgICAgICB0aGlzLnIgPSBNYXRoLmFicyhkaWYpID4gTWF0aC5QSSA/IHRoaXMub2xkciA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgICAgIGlmKCBkaWYgPiA2ICkgdGhpcy5yID0gMDtcclxuICAgICAgICAgICAgaWYoIGRpZiA8IC02ICkgdGhpcy5yID0gdGhpcy50d29QaTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc3RlcHMgPSAxIC8gdGhpcy50d29QaTtcclxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnIgKiBzdGVwcztcclxuXHJcbiAgICAgICAgdmFyIG4gPSAoICggdGhpcy5yYW5nZSAqIHZhbHVlICkgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcblxyXG4gICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgIG4gPSB+fiAoIG4gLyB0aGlzLnN0ZXAgKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHRoaXMub2xkICsgKCBuICogdGhpcy5zdGVwICkgKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm9sZHIgPSB0aGlzLnI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbWFrZVBhdGggKCkge1xyXG5cclxuICAgICAgICB2YXIgciA9IDQwO1xyXG4gICAgICAgIHZhciBkID0gMjQ7XHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLnBlcmNlbnQgKiB0aGlzLnR3b1BpIC0gMC4wMDE7XHJcbiAgICAgICAgdmFyIHgyID0gKHIgKyByICogTWF0aC5zaW4oYSkpICsgZDtcclxuICAgICAgICB2YXIgeTIgPSAociAtIHIgKiBNYXRoLmNvcyhhKSkgKyBkO1xyXG4gICAgICAgIHZhciBiaWcgPSBhID4gTWF0aC5QSSA/IDEgOiAwO1xyXG4gICAgICAgIHJldHVybiBcIk0gXCIgKyAocitkKSArIFwiLFwiICsgZCArIFwiIEEgXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCBcIiArIGJpZyArIFwiIDEgXCIgKyB4MiArIFwiLFwiICsgeTI7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMucGVyY2VudCA9ICggdGhpcy52YWx1ZSAtIHRoaXMubWluICkgLyB0aGlzLnJhbmdlO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMSApO1xyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi4vY29yZS9Ub29scyc7XHJcbmltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sb3IgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcblx0ICAgIC8vdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuXHJcblx0ICAgIHRoaXMuY3R5cGUgPSBvLmN0eXBlIHx8ICdoZXgnO1xyXG5cclxuXHQgICAgdGhpcy53Zml4ZSA9IDI1NjtcclxuXHJcblx0ICAgIHRoaXMuY3cgPSB0aGlzLnNiID4gMjU2ID8gMjU2IDogdGhpcy5zYjtcclxuXHQgICAgaWYoby5jdyAhPSB1bmRlZmluZWQgKSB0aGlzLmN3ID0gby5jdztcclxuXHJcblx0ICAgIC8vIGNvbG9yIHVwIG9yIGRvd25cclxuXHQgICAgdGhpcy5zaWRlID0gby5zaWRlIHx8ICdkb3duJztcclxuXHQgICAgdGhpcy51cCA9IHRoaXMuc2lkZSA9PT0gJ2Rvd24nID8gMCA6IDE7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuXHQgICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuXHQgICAgdGhpcy5kZWNhbCA9IG5ldyBWMigpO1xyXG5cdCAgICB0aGlzLnBwID0gbmV3IFYyKCk7XHJcblxyXG5cdCAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdoZWlnaHQ6JysodGhpcy5oLTQpKydweDsnICsgJ2JvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC04KSsncHg7JyApO1xyXG5cdCAgICB0aGlzLnNbMl0gPSB0aGlzLmNbMl0uc3R5bGU7XHJcblxyXG5cdCAgICBpZiggdGhpcy51cCApe1xyXG5cdCAgICAgICAgdGhpcy5zWzJdLnRvcCA9ICdhdXRvJztcclxuXHQgICAgICAgIHRoaXMuc1syXS5ib3R0b20gPSAnMnB4JztcclxuXHQgICAgfVxyXG5cclxuXHQgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRDb2xvclJpbmcoKTtcclxuXHQgICAgdGhpcy5jWzNdLnN0eWxlLnZpc2liaWxpdHkgID0gJ2hpZGRlbic7XHJcblxyXG5cdCAgICB0aGlzLmhzbCA9IG51bGw7XHJcblx0ICAgIHRoaXMudmFsdWUgPSAnI2ZmZmZmZic7XHJcblx0ICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuXHQgICAgICAgIGlmKCBvLnZhbHVlIGluc3RhbmNlb2YgQXJyYXkgKSB0aGlzLnZhbHVlID0gVG9vbHMucmdiVG9IZXgoIG8udmFsdWUgKTtcclxuXHQgICAgICAgIGVsc2UgaWYoIWlzTmFOKG8udmFsdWUpKSB0aGlzLnZhbHVlID0gVG9vbHMuaGV4VG9IdG1sKCBvLnZhbHVlICk7XHJcblx0ICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSBvLnZhbHVlO1xyXG5cdCAgICB9XHJcblxyXG5cdCAgICB0aGlzLmJjb2xvciA9IG51bGw7XHJcblx0ICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblx0ICAgIHRoaXMuZmlzdERvd24gPSBmYWxzZTtcclxuXHJcblx0ICAgIHRoaXMudHIgPSA5ODtcclxuXHQgICAgdGhpcy50c2wgPSBNYXRoLnNxcnQoMykgKiB0aGlzLnRyO1xyXG5cclxuXHQgICAgdGhpcy5odWUgPSAwO1xyXG5cdCAgICB0aGlzLmQgPSAyNTY7XHJcblxyXG5cdCAgICB0aGlzLnNldENvbG9yKCB0aGlzLnZhbHVlICk7XHJcblxyXG5cdCAgICB0aGlzLmluaXQoKTtcclxuXHJcblx0ICAgIGlmKCBvLm9wZW4gIT09IHVuZGVmaW5lZCApIHRoaXMub3BlbigpO1xyXG5cclxuXHR9XHJcblxyXG5cdHRlc3Rab25lICggbXgsIG15ICkge1xyXG5cclxuXHRcdGxldCBsID0gdGhpcy5sb2NhbDtcclxuXHRcdGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG5cclxuXHJcblx0XHRpZiggdGhpcy51cCAmJiB0aGlzLmlzT3BlbiApe1xyXG5cclxuXHRcdFx0aWYoIGwueSA+IHRoaXMud2ZpeGUgKSByZXR1cm4gJ3RpdGxlJztcclxuXHRcdCAgICBlbHNlIHJldHVybiAnY29sb3InO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiggbC55IDwgdGhpcy5iYXNlSCsyICkgcmV0dXJuICd0aXRsZSc7XHJcblx0ICAgIFx0ZWxzZSBpZiggdGhpcy5pc09wZW4gKSByZXR1cm4gJ2NvbG9yJztcclxuXHJcblxyXG5cdFx0fVxyXG5cclxuICAgIH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0bW91c2V1cCAoIGUgKSB7XHJcblxyXG5cdCAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cdCAgICB0aGlzLmQgPSAyNTY7XHJcblxyXG5cdH1cclxuXHJcblx0bW91c2Vkb3duICggZSApIHtcclxuXHJcblxyXG5cdFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlLmNsaWVudFgsIGUuY2xpZW50WSApO1xyXG5cclxuXHJcblx0XHQvL2lmKCAhbmFtZSApIHJldHVybjtcclxuXHRcdGlmKG5hbWUgPT09ICd0aXRsZScpe1xyXG5cdFx0XHRpZiggIXRoaXMuaXNPcGVuICkgdGhpcy5vcGVuKCk7XHJcblx0ICAgICAgICBlbHNlIHRoaXMuY2xvc2UoKTtcclxuXHQgICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRpZiggbmFtZSA9PT0gJ2NvbG9yJyApe1xyXG5cclxuXHRcdFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG5cdFx0XHR0aGlzLmZpc3REb3duID0gdHJ1ZVxyXG5cdFx0XHR0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0bW91c2Vtb3ZlICggZSApIHtcclxuXHJcblx0ICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZS5jbGllbnRYLCBlLmNsaWVudFkgKTtcclxuXHJcblx0ICAgIGxldCBvZmYsIGQsIGh1ZSwgc2F0LCBsdW0sIHJhZCwgeCwgeSwgcnIsIFQgPSBUb29scztcclxuXHJcblx0ICAgIGlmKCBuYW1lID09PSAndGl0bGUnICkgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcblx0ICAgIGlmKCBuYW1lID09PSAnY29sb3InICl7XHJcblxyXG5cdCAgICBcdG9mZiA9IHRoaXMub2Zmc2V0O1xyXG5cdFx0ICAgIG9mZi54ID0gZS5jbGllbnRYIC0gKCB0aGlzLnpvbmUueCArIHRoaXMuZGVjYWwueCArIHRoaXMubWlkICk7XHJcblx0XHQgICAgb2ZmLnkgPSBlLmNsaWVudFkgLSAoIHRoaXMuem9uZS55ICsgdGhpcy5kZWNhbC55ICsgdGhpcy5taWQgKTtcclxuXHRcdFx0ZCA9IG9mZi5sZW5ndGgoKSAqIHRoaXMucmF0aW87XHJcblx0XHRcdHJyID0gb2ZmLmFuZ2xlKCk7XHJcblx0XHRcdGlmKHJyIDwgMCkgcnIgKz0gMiAqIFQuUEk7XHJcblx0XHRcdFx0XHRcdFxyXG5cclxuXHQgICAgXHRpZiAoIGQgPCAxMjggKSB0aGlzLmN1cnNvcignY3Jvc3NoYWlyJyk7XHJcblx0ICAgIFx0ZWxzZSBpZiggIXRoaXMuaXNEb3duICkgdGhpcy5jdXJzb3IoKVxyXG5cclxuXHQgICAgXHRpZiggdGhpcy5pc0Rvd24gKXtcclxuXHJcblx0XHRcdCAgICBpZiggdGhpcy5maXN0RG93biApe1xyXG5cdFx0XHQgICAgXHR0aGlzLmQgPSBkO1xyXG5cdFx0XHQgICAgXHR0aGlzLmZpc3REb3duID0gZmFsc2U7XHJcblx0XHRcdCAgICB9XHJcblxyXG5cdFx0XHQgICAgaWYgKCB0aGlzLmQgPCAxMjggKSB7XHJcblxyXG5cdFx0XHRcdCAgICBpZiAoIHRoaXMuZCA+IHRoaXMudHIgKSB7IC8vIG91dHNpZGUgaHVlXHJcblxyXG5cdFx0XHRcdCAgICAgICAgaHVlID0gKCByciArIFQucGk5MCApIC8gVC5Ud29QSTtcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuaHVlID0gKGh1ZSArIDEpICUgMTtcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuc2V0SFNMKFsoaHVlICsgMSkgJSAxLCB0aGlzLmhzbFsxXSwgdGhpcy5oc2xbMl1dKTtcclxuXHJcblx0XHRcdFx0ICAgIH0gZWxzZSB7IC8vIHRyaWFuZ2xlXHJcblxyXG5cdFx0XHRcdCAgICBcdHggPSBvZmYueCAqIHRoaXMucmF0aW87XHJcblx0XHRcdFx0ICAgIFx0eSA9IG9mZi55ICogdGhpcy5yYXRpbztcclxuXHJcblx0XHRcdFx0ICAgIFx0bGV0IHJyID0gKHRoaXMuaHVlICogVC5Ud29QSSkgKyBULlBJO1xyXG5cdFx0XHRcdCAgICBcdGlmKHJyIDwgMCkgcnIgKz0gMiAqIFQuUEk7XHJcblxyXG5cdFx0XHRcdCAgICBcdHJhZCA9IE1hdGguYXRhbjIoLXksIHgpO1xyXG5cdFx0XHRcdCAgICBcdGlmKHJhZCA8IDApIHJhZCArPSAyICogVC5QSTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0ICAgIFx0bGV0IHJhZDAgPSAoIHJhZCArIFQucGk5MCArIFQuVHdvUEkgKyByciApICUgKFQuVHdvUEkpLFxyXG5cdFx0XHRcdCAgICBcdHJhZDEgPSByYWQwICUgKCgyLzMpICogVC5QSSkgLSAoVC5waTYwKSxcclxuXHRcdFx0XHQgICAgXHRhICAgID0gMC41ICogdGhpcy50cixcclxuXHRcdFx0XHQgICAgXHRiICAgID0gTWF0aC50YW4ocmFkMSkgKiBhLFxyXG5cdFx0XHRcdCAgICBcdHIgICAgPSBNYXRoLnNxcnQoeCp4ICsgeSp5KSxcclxuXHRcdFx0XHQgICAgXHRtYXhSID0gTWF0aC5zcXJ0KGEqYSArIGIqYik7XHJcblxyXG5cdFx0XHRcdCAgICBcdGlmKCByID4gbWF4UiApIHtcclxuXHRcdFx0XHRcdFx0XHRsZXQgZHggPSBNYXRoLnRhbihyYWQxKSAqIHI7XHJcblx0XHRcdFx0XHRcdFx0bGV0IHJhZDIgPSBNYXRoLmF0YW4oZHggLyBtYXhSKTtcclxuXHRcdFx0XHRcdFx0XHRpZihyYWQyID4gVC5waTYwKSAgcmFkMiA9IFQucGk2MDtcclxuXHRcdFx0XHRcdFx0ICAgIGVsc2UgaWYoIHJhZDIgPCAtVC5waTYwICkgcmFkMiA9IC1ULnBpNjA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHJhZCArPSByYWQyIC0gcmFkMTtcclxuXHJcblx0XHRcdFx0XHRcdFx0cmFkMCA9IChyYWQgKyBULnBpOTAgICsgVC5Ud29QSSArIHJyKSAlIChULlR3b1BJKSxcclxuXHRcdFx0XHRcdFx0XHRyYWQxID0gcmFkMCAlICgoMi8zKSAqIFQuUEkpIC0gKFQucGk2MCk7XHJcblx0XHRcdFx0XHRcdFx0YiA9IE1hdGgudGFuKHJhZDEpICogYTtcclxuXHRcdFx0XHRcdFx0XHRyID0gbWF4UiA9IE1hdGguc3FydChhKmEgKyBiKmIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRsdW0gPSAoKE1hdGguc2luKHJhZDApICogcikgLyB0aGlzLnRzbCkgKyAwLjU7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGxldCB3ID0gMSAtIChNYXRoLmFicyhsdW0gLSAwLjUpICogMik7XHJcblx0XHRcdFx0XHRcdHNhdCA9ICgoKE1hdGguY29zKHJhZDApICogcikgKyAodGhpcy50ciAvIDIpKSAvICgxLjUgKiB0aGlzLnRyKSkgLyB3O1xyXG5cdFx0XHRcdFx0XHRzYXQgPSBULmNsYW1wKCBzYXQsIDAsIDEgKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0ICAgICAgICB0aGlzLnNldEhTTChbdGhpcy5oc2xbMF0sIHNhdCwgbHVtXSk7XHJcblxyXG5cdFx0XHRcdCAgICB9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRzZXRIZWlnaHQgKCkge1xyXG5cclxuXHRcdHRoaXMuaCA9IHRoaXMuaXNPcGVuID8gdGhpcy53Zml4ZSArIHRoaXMuYmFzZUggKyA1IDogdGhpcy5iYXNlSDtcclxuXHRcdHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cdFx0dGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG5cdH1cclxuXHJcblx0cGFyZW50SGVpZ2h0ICggdCApIHtcclxuXHJcblx0XHRpZiAoIHRoaXMuZ3JvdXAgIT09IG51bGwgKSB0aGlzLmdyb3VwLmNhbGMoIHQgKTtcclxuXHQgICAgZWxzZSBpZiAoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB0ICk7XHJcblxyXG5cdH1cclxuXHJcblx0b3BlbiAoKSB7XHJcblxyXG5cdFx0c3VwZXIub3BlbigpO1xyXG5cclxuXHRcdHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG5cdFx0aWYoIHRoaXMudXAgKSB0aGlzLnpvbmUueSAtPSB0aGlzLndmaXhlICsgNTtcclxuXHJcblx0XHRsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG5cdCAgICB0aGlzLnNbM10udmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcclxuXHQgICAgLy90aGlzLnNbM10uZGlzcGxheSA9ICdibG9jayc7XHJcblx0ICAgIHRoaXMucGFyZW50SGVpZ2h0KCB0ICk7XHJcblxyXG5cdH1cclxuXHJcblx0Y2xvc2UgKCkge1xyXG5cclxuXHRcdHN1cGVyLmNsb3NlKCk7XHJcblxyXG5cdFx0aWYoIHRoaXMudXAgKSB0aGlzLnpvbmUueSArPSB0aGlzLndmaXhlICsgNTtcclxuXHJcblx0XHRsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG5cdFx0dGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcblx0ICAgIHRoaXMuc1szXS52aXNpYmlsaXR5ICA9ICdoaWRkZW4nO1xyXG5cdCAgICAvL3RoaXMuc1szXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cdCAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcblx0fVxyXG5cclxuXHR1cGRhdGUgKCB1cCApIHtcclxuXHJcblx0ICAgIGxldCBjYyA9IFRvb2xzLnJnYlRvSGV4KCBUb29scy5oc2xUb1JnYihbIHRoaXMuaHNsWzBdLCAxLCAwLjUgXSkgKTtcclxuXHJcblx0ICAgIHRoaXMubW92ZU1hcmtlcnMoKTtcclxuXHQgICAgXHJcblx0ICAgIHRoaXMudmFsdWUgPSB0aGlzLmJjb2xvcjtcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2MsIDIsIDAgKTtcclxuXHJcblxyXG5cdCAgICB0aGlzLnNbMl0uYmFja2dyb3VuZCA9IHRoaXMuYmNvbG9yO1xyXG5cdCAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSBUb29scy5odG1sVG9IZXgoIHRoaXMuYmNvbG9yICk7XHJcblxyXG5cdCAgICB0aGlzLmludmVydCA9IFRvb2xzLmZpbmREZWVwSW52ZXIoIHRoaXMucmdiICk7XHJcblx0ICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnO1xyXG5cclxuXHQgICAgaWYoIXVwKSByZXR1cm47XHJcblxyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ2FycmF5JyApIHRoaXMuc2VuZCggdGhpcy5yZ2IgKTtcclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdyZ2InICkgdGhpcy5zZW5kKCBUb29scy5odG1sUmdiKCB0aGlzLnJnYiApICk7XHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAnaGV4JyApIHRoaXMuc2VuZCggVG9vbHMuaHRtbFRvSGV4KCB0aGlzLnZhbHVlICkgKTtcclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdodG1sJyApIHRoaXMuc2VuZCgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldENvbG9yICggY29sb3IgKSB7XHJcblxyXG5cdCAgICBsZXQgdW5wYWNrID0gVG9vbHMudW5wYWNrKGNvbG9yKTtcclxuXHQgICAgaWYgKHRoaXMuYmNvbG9yICE9IGNvbG9yICYmIHVucGFjaykge1xyXG5cclxuXHQgICAgICAgIHRoaXMuYmNvbG9yID0gY29sb3I7XHJcblx0ICAgICAgICB0aGlzLnJnYiA9IHVucGFjaztcclxuXHQgICAgICAgIHRoaXMuaHNsID0gVG9vbHMucmdiVG9Ic2woIHRoaXMucmdiICk7XHJcblxyXG5cdCAgICAgICAgdGhpcy5odWUgPSB0aGlzLmhzbFswXTtcclxuXHJcblx0ICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldEhTTCAoIGhzbCApIHtcclxuXHJcblx0ICAgIHRoaXMuaHNsID0gaHNsO1xyXG5cdCAgICB0aGlzLnJnYiA9IFRvb2xzLmhzbFRvUmdiKCBoc2wgKTtcclxuXHQgICAgdGhpcy5iY29sb3IgPSBUb29scy5yZ2JUb0hleCggdGhpcy5yZ2IgKTtcclxuXHQgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuXHQgICAgcmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bW92ZU1hcmtlcnMgKCkge1xyXG5cclxuXHRcdGxldCBwID0gdGhpcy5wcDtcclxuXHRcdGxldCBUID0gVG9vbHM7XHJcblxyXG5cdCAgICBsZXQgYzEgPSB0aGlzLmludmVydCA/ICcjZmZmJyA6ICcjMDAwJztcclxuXHQgICAgbGV0IGEgPSB0aGlzLmhzbFswXSAqIFQuVHdvUEk7XHJcblx0ICAgIGxldCB0aGlyZCA9ICgyLzMpICogVC5QSTtcclxuXHQgICAgbGV0IHIgPSB0aGlzLnRyO1xyXG5cdCAgICBsZXQgaCA9IHRoaXMuaHNsWzBdO1xyXG5cdCAgICBsZXQgcyA9IHRoaXMuaHNsWzFdO1xyXG5cdCAgICBsZXQgbCA9IHRoaXMuaHNsWzJdO1xyXG5cclxuXHQgICAgbGV0IGFuZ2xlID0gKCBhIC0gVC5waTkwICkgKiBULnRvZGVnO1xyXG5cclxuXHQgICAgaCA9IC0gYSArIFQucGk5MDtcclxuXHJcblx0XHRsZXQgaHggPSBNYXRoLmNvcyhoKSAqIHI7XHJcblx0XHRsZXQgaHkgPSAtTWF0aC5zaW4oaCkgKiByO1xyXG5cdFx0bGV0IHN4ID0gTWF0aC5jb3MoaCAtIHRoaXJkKSAqIHI7XHJcblx0XHRsZXQgc3kgPSAtTWF0aC5zaW4oaCAtIHRoaXJkKSAqIHI7XHJcblx0XHRsZXQgdnggPSBNYXRoLmNvcyhoICsgdGhpcmQpICogcjtcclxuXHRcdGxldCB2eSA9IC1NYXRoLnNpbihoICsgdGhpcmQpICogcjtcclxuXHRcdGxldCBteCA9IChzeCArIHZ4KSAvIDIsIG15ID0gKHN5ICsgdnkpIC8gMjtcclxuXHRcdGEgID0gKDEgLSAyICogTWF0aC5hYnMobCAtIC41KSkgKiBzO1xyXG5cdFx0bGV0IHggPSBzeCArICh2eCAtIHN4KSAqIGwgKyAoaHggLSBteCkgKiBhO1xyXG5cdFx0bGV0IHkgPSBzeSArICh2eSAtIHN5KSAqIGwgKyAoaHkgLSBteSkgKiBhO1xyXG5cclxuXHQgICAgcC5zZXQoIHgsIHkgKS5hZGRTY2FsYXIoMTI4KTtcclxuXHJcblx0ICAgIC8vbGV0IGZmID0gKDEtbCkqMjU1O1xyXG5cdCAgICAvLyB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYignK2ZmKycsJytmZisnLCcrZmYrJyknLCAzICk7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndHJhbnNmb3JtJywgJ3JvdGF0ZSgnK2FuZ2xlKycgKScsIDIgKTtcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHAueCwgMyApO1xyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCBwLnksIDMgKTtcclxuXHQgICAgXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmludmVydCA/ICcjZmZmJyA6ICcjMDAwJywgMiwgMyApO1xyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCcsIDMgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLHRoaXMuYmNvbG9yLCAzICk7XHJcblxyXG5cdH1cclxuXHJcblx0clNpemUgKCkge1xyXG5cclxuXHQgICAgLy9Qcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG5cdCAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuXHQgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG5cdCAgICBzWzJdLndpZHRoID0gdGhpcy5zYiArICdweCc7XHJcblx0ICAgIHNbMl0ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG5cclxuXHQgICAgdGhpcy5yU2l6ZUNvbG9yKCB0aGlzLmN3ICk7XHJcblxyXG5cdCAgICB0aGlzLmRlY2FsLnggPSBNYXRoLmZsb29yKCh0aGlzLncgLSB0aGlzLndmaXhlKSAqIDAuNSk7XHJcblx0ICAgIHNbM10ubGVmdCA9IHRoaXMuZGVjYWwueCArICdweCc7XHJcblx0ICAgIFxyXG5cdH1cclxuXHJcblx0clNpemVDb2xvciAoIHcgKSB7XHJcblxyXG5cdFx0aWYoIHcgPT09IHRoaXMud2ZpeGUgKSByZXR1cm47XHJcblxyXG5cdFx0dGhpcy53Zml4ZSA9IHc7XHJcblxyXG5cdFx0bGV0IHMgPSB0aGlzLnM7XHJcblxyXG5cdFx0Ly90aGlzLmRlY2FsLnggPSBNYXRoLmZsb29yKCh0aGlzLncgLSB0aGlzLndmaXhlKSAqIDAuNSk7XHJcblx0ICAgIHRoaXMuZGVjYWwueSA9IHRoaXMuc2lkZSA9PT0gJ3VwJyA/IDIgOiB0aGlzLmJhc2VIICsgMjtcclxuXHQgICAgdGhpcy5taWQgPSBNYXRoLmZsb29yKCB0aGlzLndmaXhlICogMC41ICk7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJysgdGhpcy53Zml4ZSArICcgJysgdGhpcy53Zml4ZSApO1xyXG5cdCAgICBzWzNdLndpZHRoID0gdGhpcy53Zml4ZSArICdweCc7XHJcblx0ICAgIHNbM10uaGVpZ2h0ID0gdGhpcy53Zml4ZSArICdweCc7XHJcbiAgICBcdC8vc1szXS5sZWZ0ID0gdGhpcy5kZWNhbC54ICsgJ3B4JztcclxuXHQgICAgc1szXS50b3AgPSB0aGlzLmRlY2FsLnkgKyAncHgnO1xyXG5cclxuXHQgICAgdGhpcy5yYXRpbyA9IDI1NiAvIHRoaXMud2ZpeGU7XHJcblx0ICAgIHRoaXMuc3F1YXJlID0gMSAvICg2MCoodGhpcy53Zml4ZS8yNTYpKTtcclxuXHQgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcblx0fVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBSb290cyB9IGZyb20gJy4uL2NvcmUvUm9vdHMnO1xyXG5pbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZwcyBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnJvdW5kID0gTWF0aC5yb3VuZDtcclxuXHJcbiAgICAgICAgLy90aGlzLmF1dG9IZWlnaHQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG4gICAgICAgIHRoaXMuaHBsdXMgPSBvLmhwbHVzIHx8IDUwO1xyXG5cclxuICAgICAgICB0aGlzLnJlcyA9IG8ucmVzIHx8IDQwO1xyXG4gICAgICAgIHRoaXMubCA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gfHwgMDtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5jdXN0b20gPSBvLmN1c3RvbSB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLm5hbWVzID0gby5uYW1lcyB8fCBbJ0ZQUycsICdNUyddO1xyXG4gICAgICAgIGxldCBjYyA9IG8uY2MgfHwgWycyMjAsMjIwLDIyMCcsICcyNTUsMjU1LDAnXTtcclxuXHJcbiAgICAgICAvLyB0aGlzLmRpdmlkID0gWyAxMDAsIDEwMCwgMTAwIF07XHJcbiAgICAgICAvLyB0aGlzLm11bHR5ID0gWyAzMCwgMzAsIDMwIF07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkaW5nID0gby5hZGRpbmcgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucmFuZ2UgPSBvLnJhbmdlIHx8IFsgMTY1LCAxMDAsIDEwMCBdO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gby5hbHBoYSB8fCAwLjI1O1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XHJcbiAgICAgICAgdGhpcy50ZXh0RGlzcGxheSA9IFtdO1xyXG5cclxuICAgICAgICBpZighdGhpcy5jdXN0b20pe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ub3cgPSAoIHNlbGYucGVyZm9ybWFuY2UgJiYgc2VsZi5wZXJmb3JtYW5jZS5ub3cgKSA/IHNlbGYucGVyZm9ybWFuY2Uubm93LmJpbmQoIHBlcmZvcm1hbmNlICkgOiBEYXRlLm5vdztcclxuICAgICAgICAgICAgdGhpcy5zdGFydFRpbWUgPSAwOy8vdGhpcy5ub3coKVxyXG4gICAgICAgICAgICB0aGlzLnByZXZUaW1lID0gMDsvL3RoaXMuc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lcyA9IDA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1zID0gMDtcclxuICAgICAgICAgICAgdGhpcy5mcHMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLm1lbSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubW0gPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc01lbSA9ICggc2VsZi5wZXJmb3JtYW5jZSAmJiBzZWxmLnBlcmZvcm1hbmNlLm1lbW9yeSApID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAvLyB0aGlzLmRpdmlkID0gWyAxMDAsIDIwMCwgMSBdO1xyXG4gICAgICAgICAgIC8vIHRoaXMubXVsdHkgPSBbIDMwLCAzMCwgMzAgXTtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzTWVtICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lcy5wdXNoKCdNRU0nKTtcclxuICAgICAgICAgICAgICAgIGNjLnB1c2goJzAsMjU1LDI1NScpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy50eHQgPSBvLm5hbWUgfHwgJ0ZwcydcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS02O1xyXG5cclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0aGlzLnR4dDtcclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICBsZXQgcGFuZWxDc3MgPSAnZGlzcGxheTpub25lOyBsZWZ0OjEwcHg7IHRvcDonKyB0aGlzLmggKyAncHg7IGhlaWdodDonKyh0aGlzLmhwbHVzIC0gOCkrJ3B4OyBib3gtc2l6aW5nOmJvcmRlci1ib3g7IGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4yKTsgYm9yZGVyOicgKyAodGhpcy5jb2xvcnMuZ3JvdXBCb3JkZXIgIT09ICdub25lJz8gdGhpcy5jb2xvcnMuZ3JvdXBCb3JkZXIrJzsnIDogJzFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7Jyk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApIHBhbmVsQ3NzICs9ICdib3JkZXItcmFkaXVzOicgKyB0aGlzLnJhZGl1cysncHg7JzsgXHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgcGFuZWxDc3MgLCB7fSApO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgJzAgMCAnK3RoaXMucmVzKycgNTAnICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgJzEwMCUnICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAnMTAwJScgKTtcclxuICAgICAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJywgJ25vbmUnICk7XHJcblxyXG5cclxuICAgICAgICAvL3RoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgyNTUsMjU1LDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTonI0ZGMCcsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICAvL3RoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgwLDI1NSwyNTUsMC4zKScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTonIzBGRicsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBhcnJvd1xyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxMHB4OyBoZWlnaHQ6MTBweDsgbGVmdDo0cHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmFycm93LCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgICAgIC8vIHJlc3VsdCB0ZXN0XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAncG9zaXRpb246YWJzb2x1dGU7IGxlZnQ6MTBweDsgdG9wOicrKHRoaXMuaCsyKSArJ3B4OyBkaXNwbGF5Om5vbmU7IHdpZHRoOjEwMCU7IHRleHQtYWxpZ246Y2VudGVyOycgKTtcclxuXHJcbiAgICAgICAgLy8gYm90dG9tIGxpbmVcclxuICAgICAgICBpZiggby5ib3R0b21MaW5lICkgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBib3R0b206MHB4OyBoZWlnaHQ6MXB4OyBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTaG93ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzWzFdLm1hcmdpbkxlZnQgPSAnMTBweCc7XHJcbiAgICAgICAgc1sxXS5saW5lSGVpZ2h0ID0gdGhpcy5oLTQ7XHJcbiAgICAgICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHNbMV0uZm9udFdlaWdodCA9ICdib2xkJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucmFkaXVzICE9PSAwICkgIHNbMF0uYm9yZGVyUmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4JzsgXHJcbiAgICAgICAgc1swXS5ib3JkZXIgPSB0aGlzLmNvbG9ycy5ncm91cEJvcmRlcjtcclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgbGV0IGogPSAwO1xyXG5cclxuICAgICAgICBmb3IoIGo9MDsgajx0aGlzLm5hbWVzLmxlbmd0aDsgaisrICl7XHJcblxyXG4gICAgICAgICAgICBsZXQgYmFzZSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMucmVzKzE7XHJcbiAgICAgICAgICAgIHdoaWxlKCBpLS0gKSBiYXNlLnB1c2goNTApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yYW5nZVtqXSA9ICggMSAvIHRoaXMucmFuZ2Vbal0gKSAqIDQ5O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5wb2ludHMucHVzaCggYmFzZSApO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlcy5wdXNoKDApO1xyXG4gICAgICAgICAgIC8vICB0aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoJytjY1tqXSsnLDAuNSknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6J3JnYmEoJytjY1tqXSsnLDEpJywgJ3ZlY3Rvci1lZmZlY3QnOidub24tc2NhbGluZy1zdHJva2UnIH0sIHRoaXMuY1syXSApO1xyXG4gICAgICAgICAgICB0aGlzLnRleHREaXNwbGF5LnB1c2goIFwiPHNwYW4gc3R5bGU9J2NvbG9yOnJnYihcIitjY1tqXStcIiknPiBcIiArIHRoaXMubmFtZXNbal0gK1wiIFwiKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBqID0gdGhpcy5uYW1lcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoai0tKXtcclxuICAgICAgICAgICAgdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKCcrY2Nbal0rJywnK3RoaXMuYWxwaGErJyknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6J3JnYmEoJytjY1tqXSsnLDEpJywgJ3ZlY3Rvci1lZmZlY3QnOidub24tc2NhbGluZy1zdHJva2UnIH0sIHRoaXMuY1syXSApO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgICAgICAvL2lmKCB0aGlzLmlzU2hvdyApIHRoaXMuc2hvdygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2hvdyApIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICBlbHNlIHRoaXMub3BlbigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLyptb2RlOiBmdW5jdGlvbiAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgLy9zWzFdLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHNbMV0uY29sb3IgPSAnI0ZGRic7XHJcbiAgICAgICAgICAgICAgICAvL3NbMV0uYmFja2dyb3VuZCA9IFVJTC5TRUxFQ1Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICAvL3NbMV0uYmFja2dyb3VuZCA9IFVJTC5TRUxFQ1RET1dOO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfSwqL1xyXG5cclxuICAgIHRpY2sgKCB2ICkge1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IHY7XHJcbiAgICAgICAgaWYoICF0aGlzLmlzU2hvdyApIHJldHVybjtcclxuICAgICAgICB0aGlzLmRyYXdHcmFwaCgpO1xyXG4gICAgICAgIHRoaXMudXBUZXh0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1ha2VQYXRoICggcG9pbnQgKSB7XHJcblxyXG4gICAgICAgIGxldCBwID0gJyc7XHJcbiAgICAgICAgcCArPSAnTSAnICsgKC0xKSArICcgJyArIDUwO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucmVzICsgMTsgaSArKyApIHsgcCArPSAnIEwgJyArIGkgKyAnICcgKyBwb2ludFtpXTsgfVxyXG4gICAgICAgIHAgKz0gJyBMICcgKyAodGhpcy5yZXMgKyAxKSArICcgJyArIDUwO1xyXG4gICAgICAgIHJldHVybiBwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cFRleHQgKCB2YWwgKSB7XHJcblxyXG4gICAgICAgIGxldCB2ID0gdmFsIHx8IHRoaXMudmFsdWVzLCB0ID0gJyc7XHJcbiAgICAgICAgZm9yKCBsZXQgaj0wLCBsbmcgPXRoaXMubmFtZXMubGVuZ3RoOyBqPGxuZzsgaisrICkgdCArPSB0aGlzLnRleHREaXNwbGF5W2pdICsgKHZbal0pLnRvRml4ZWQodGhpcy5wcmVjaXNpb24pICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgIHRoaXMuY1s0XS5pbm5lckhUTUwgPSB0O1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0dyYXBoICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHN2ZyA9IHRoaXMuY1syXTtcclxuICAgICAgICBsZXQgaSA9IHRoaXMubmFtZXMubGVuZ3RoLCB2LCBvbGQgPSAwLCBuID0gMDtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggdGhpcy5hZGRpbmcgKSB2ID0gKHRoaXMudmFsdWVzW25dK29sZCkgKiB0aGlzLnJhbmdlW25dO1xyXG4gICAgICAgICAgICBlbHNlICB2ID0gKHRoaXMudmFsdWVzW25dICogdGhpcy5yYW5nZVtuXSk7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzW25dLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzW25dLnB1c2goIDUwIC0gdiApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2Zyggc3ZnLCAnZCcsIHRoaXMubWFrZVBhdGgoIHRoaXMucG9pbnRzW25dICksIGkrMSApO1xyXG4gICAgICAgICAgICBvbGQgKz0gdGhpcy52YWx1ZXNbbl07XHJcbiAgICAgICAgICAgIG4rKztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBvcGVuICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIub3BlbigpO1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmhwbHVzICsgdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3dEb3duICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmdyb3VwICE9PSBudWxsICl7IHRoaXMuZ3JvdXAuY2FsYyggdGhpcy5ocGx1cyApO31cclxuICAgICAgICBlbHNlIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdGhpcy5ocGx1cyApO1xyXG5cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ2Jsb2NrJzsgXHJcbiAgICAgICAgdGhpcy5zWzRdLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIHRoaXMuaXNTaG93ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1c3RvbSApIFJvb3RzLmFkZExpc3RlbiggdGhpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5zdmdzLmFycm93ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmdyb3VwICE9PSBudWxsICl7IHRoaXMuZ3JvdXAuY2FsYyggLXRoaXMuaHBsdXMgKTt9XHJcbiAgICAgICAgZWxzZSBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIC10aGlzLmhwbHVzICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLnNbNF0uZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLmlzU2hvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VzdG9tICkgUm9vdHMucmVtb3ZlTGlzdGVuKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHRoaXMuY1s0XS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8vLy8gQVVUTyBGUFMgLy8vLy8vXHJcblxyXG4gICAgYmVnaW4gKCkge1xyXG5cclxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMubm93KCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgZW5kICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHRpbWUgPSB0aGlzLm5vdygpO1xyXG4gICAgICAgIHRoaXMubXMgPSB0aW1lIC0gdGhpcy5zdGFydFRpbWU7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVzICsrO1xyXG5cclxuICAgICAgICBpZiAoIHRpbWUgPiB0aGlzLnByZXZUaW1lICsgMTAwMCApIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZnBzID0gdGhpcy5yb3VuZCggKCB0aGlzLmZyYW1lcyAqIDEwMDAgKSAvICggdGltZSAtIHRoaXMucHJldlRpbWUgKSApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmV2VGltZSA9IHRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICggdGhpcy5pc01lbSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaGVhcFNpemUgPSBwZXJmb3JtYW5jZS5tZW1vcnkudXNlZEpTSGVhcFNpemU7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVhcFNpemVMaW1pdCA9IHBlcmZvcm1hbmNlLm1lbW9yeS5qc0hlYXBTaXplTGltaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW0gPSB0aGlzLnJvdW5kKCBoZWFwU2l6ZSAqIDAuMDAwMDAwOTU0ICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1tID0gaGVhcFNpemUgLyBoZWFwU2l6ZUxpbWl0O1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gWyB0aGlzLmZwcywgdGhpcy5tcyAsIHRoaXMubW0gXTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3R3JhcGgoKTtcclxuICAgICAgICB0aGlzLnVwVGV4dCggWyB0aGlzLmZwcywgdGhpcy5tcywgdGhpcy5tZW0gXSApO1xyXG5cclxuICAgICAgICByZXR1cm4gdGltZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuaW5nICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1c3RvbSApIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5lbmQoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy53O1xyXG5cclxuICAgICAgICBzWzBdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1sxXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IDEwICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gKHctMjApICsgJ3B4JztcclxuICAgICAgICBzWzRdLndpZHRoID0gKHctMjApICsgJ3B4JztcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBHcmFwaCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgIFx0dGhpcy52YWx1ZSA9IG8udmFsdWUgIT09IHVuZGVmaW5lZCA/IG8udmFsdWUgOiBbMCwwLDBdO1xyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gIT09IHVuZGVmaW5lZCA/IG8ucHJlY2lzaW9uIDogMjtcclxuICAgICAgICB0aGlzLm11bHRpcGxpY2F0b3IgPSBvLm11bHRpcGxpY2F0b3IgfHwgMTtcclxuICAgICAgICB0aGlzLm5lZyA9IG8ubmVnIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmxpbmUgPSBvLmxpbmUgIT09IHVuZGVmaW5lZCA/ICBvLmxpbmUgOiB0cnVlO1xyXG5cclxuICAgICAgICAvL2lmKHRoaXMubmVnKXRoaXMubXVsdGlwbGljYXRvcio9MjtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvV2lkdGggPSBvLmF1dG9XaWR0aCAhPT0gdW5kZWZpbmVkID8gby5hdXRvV2lkdGggOiB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNOdW1iZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gby5oIHx8IDEyOCArIDEwO1xyXG4gICAgICAgIHRoaXMucmggPSB0aGlzLmggLSAxMDtcclxuICAgICAgICB0aGlzLnRvcCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgeyAvLyB3aXRoIHRpdGxlXHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy90aGlzLmNbMV0uc3R5bGUuYmFja2dyb3VuZCA9ICcjZmYwMDAwJztcclxuICAgICAgICAgICAgLy90aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdoID0gdGhpcy5yaCAtIDI4O1xyXG4gICAgICAgIHRoaXMuZ3cgPSB0aGlzLncgLSAyODtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6Jyt0aGlzLncrJ3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIGxldCBzdmcgPSB0aGlzLmRvbSggJ3N2ZycsIHRoaXMuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt0aGlzLncrJyAnK3RoaXMucmgsIHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMucmgsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICB0aGlzLnNldENzcyggc3ZnLCB7IHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMucmgsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6dGhpcy5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApO1xyXG4gICAgICAgIHRoaXMuZG9tKCAncmVjdCcsICcnLCB7IHg6MTAsIHk6MTAsIHdpZHRoOnRoaXMuZ3crOCwgaGVpZ2h0OnRoaXMuZ2grOCwgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoxICwgZmlsbDonbm9uZSd9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pdyA9ICgodGhpcy5ndy0oNCoodGhpcy5sbmctMSkpKS90aGlzLmxuZyk7XHJcbiAgICAgICAgbGV0IHQgPSBbXTtcclxuICAgICAgICB0aGlzLmNNb2RlID0gW107XHJcblxyXG4gICAgICAgIHRoaXMudiA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgXHR0W2ldID0gWyAxNCArIChpKnRoaXMuaXcpICsgKGkqNCksIHRoaXMuaXcgXTtcclxuICAgICAgICBcdHRbaV1bMl0gPSB0W2ldWzBdICsgdFtpXVsxXTtcclxuICAgICAgICBcdHRoaXMuY01vZGVbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMubmVnICkgdGhpcy52W2ldID0gKCgxKyh0aGlzLnZhbHVlW2ldIC8gdGhpcy5tdWx0aXBsaWNhdG9yKSkqMC41KTtcclxuICAgICAgICBcdGVsc2UgdGhpcy52W2ldID0gdGhpcy52YWx1ZVtpXSAvIHRoaXMubXVsdGlwbGljYXRvcjtcclxuXHJcbiAgICAgICAgXHR0aGlzLmRvbSggJ3JlY3QnLCAnJywgeyB4OnRbaV1bMF0sIHk6MTQsIHdpZHRoOnRbaV1bMV0sIGhlaWdodDoxLCBmaWxsOnRoaXMuZm9udENvbG9yLCAnZmlsbC1vcGFjaXR5JzowLjMgfSwgc3ZnICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50bXAgPSB0O1xyXG4gICAgICAgIHRoaXMuY1szXSA9IHN2ZztcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLncpXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLnRvcCA9IDAgKydweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS5oZWlnaHQgPSAyMCArJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5zWzFdLmxpbmVIZWlnaHQgPSAoMjAtNSkrJ3B4J1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoIGZhbHNlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNWRyAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmxpbmUgKSB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMCApO1xyXG5cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpPHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnaGVpZ2h0JywgdGhpcy52W2ldKnRoaXMuZ2gsIGkrMiApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAneScsIDE0ICsgKHRoaXMuZ2ggLSB0aGlzLnZbaV0qdGhpcy5naCksIGkrMiApO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5uZWcgKSB0aGlzLnZhbHVlW2ldID0gKCAoKHRoaXMudltpXSoyKS0xKSAqIHRoaXMubXVsdGlwbGljYXRvciApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMudmFsdWVbaV0gPSAoICh0aGlzLnZbaV0gKiB0aGlzLm11bHRpcGxpY2F0b3IpICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgdCA9IHRoaXMudG1wO1xyXG4gICAgICAgIFxyXG5cdCAgICBpZiggbC55PnRoaXMudG9wICYmIGwueTx0aGlzLmgtMjAgKXtcclxuXHQgICAgICAgIHdoaWxlKCBpLS0gKXtcclxuXHQgICAgICAgICAgICBpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaTtcclxuXHQgICAgICAgIH1cclxuXHQgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgXHRpZiggbiA9PT0gdGhpcy5jTW9kZVtuYW1lXSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdGxldCBhO1xyXG5cclxuICAgICAgICBzd2l0Y2gobil7XHJcbiAgICAgICAgICAgIGNhc2UgMDogYT0wLjM7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IGE9MC42OyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiBhPTE7IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbC1vcGFjaXR5JywgYSwgbmFtZSArIDIgKTtcclxuICAgICAgICB0aGlzLmNNb2RlW25hbWVdID0gbjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgXHRsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgLy90aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICBpZiggdGhpcy5jTW9kZVtpXSAhPT0gMCApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbC1vcGFjaXR5JywgMC4zLCBpICsgMiApO1xyXG4gICAgICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCAhPT0gLTEgKSByZXR1cm4gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgXHRsZXQgbnVwID0gZmFsc2U7XHJcblxyXG4gICAgXHRsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoZSk7XHJcblxyXG4gICAgXHRpZiggbmFtZSA9PT0gJycgKXtcclxuXHJcbiAgICAgICAgICAgIG51cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICB9IGVsc2UgeyBcclxuXHJcbiAgICAgICAgICAgIG51cCA9IHRoaXMubW9kZSggdGhpcy5pc0Rvd24gPyAyIDogMSwgbmFtZSApO1xyXG4gICAgICAgICAgICAvL3RoaXMuY3Vyc29yKCB0aGlzLmN1cnJlbnQgIT09IC0xID8gJ21vdmUnIDogJ3BvaW50ZXInICk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEb3duKXtcclxuICAgICAgICAgICAgXHR0aGlzLnZbbmFtZV0gPSB0aGlzLmNsYW1wKCAxIC0gKCggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCAtIDEwICkgLyB0aGlzLmdoKSAsIDAsIDEgKTtcclxuICAgICAgICAgICAgXHR0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgIFx0dGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1ha2VQYXRoICgpIHtcclxuXHJcbiAgICBcdGxldCBwID0gXCJcIiwgaCwgdywgd24sIHdtLCBvdywgb2g7XHJcbiAgICBcdC8vbGV0IGcgPSB0aGlzLml3KjAuNVxyXG5cclxuICAgIFx0Zm9yKGxldCBpID0gMDsgaTx0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgXHRcdGggPSAxNCArICh0aGlzLmdoIC0gdGhpcy52W2ldKnRoaXMuZ2gpO1xyXG4gICAgXHRcdHcgPSAoMTQgKyAoaSp0aGlzLml3KSArIChpKjQpKTtcclxuXHJcbiAgICBcdFx0d20gPSB3ICsgdGhpcy5pdyowLjU7XHJcbiAgICBcdFx0d24gPSB3ICsgdGhpcy5pdztcclxuXHJcbiAgICBcdFx0aWYoaT09PTApIHArPSdNICcrdysnICcrIGggKyAnIFQgJyArIHdtICsnICcrIGg7XHJcbiAgICBcdFx0ZWxzZSBwICs9ICcgQyAnICsgb3cgKycgJysgb2ggKyAnLCcgKyB3ICsnICcrIGggKyAnLCcgKyB3bSArJyAnKyBoO1xyXG4gICAgXHRcdGlmKGkgPT09IHRoaXMubG5nLTEpIHArPScgVCAnICsgd24gKycgJysgaDtcclxuXHJcbiAgICBcdFx0b3cgPSB3blxyXG4gICAgXHRcdG9oID0gaCBcclxuXHJcbiAgICBcdH1cclxuXHJcbiAgICBcdHJldHVybiBwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHNbMV0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG5cclxuICAgICAgICBsZXQgZ3cgPSB0aGlzLncgLSAyODtcclxuICAgICAgICBsZXQgaXcgPSAoKGd3LSg0Kih0aGlzLmxuZy0xKSkpL3RoaXMubG5nKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB0W2ldID0gWyAxNCArIChpKml3KSArIChpKjQpLCBpdyBdO1xyXG4gICAgICAgICAgICB0W2ldWzJdID0gdFtpXVswXSArIHRbaV1bMV07XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50bXAgPSB0O1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJcclxuaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuLi9jb3JlL1Jvb3RzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLkFERCA9IG8uYWRkO1xyXG5cclxuICAgICAgICB0aGlzLnVpcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9IZWlnaHQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5kZWNhbCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNjtcclxuXHJcbiAgICAgICAgdGhpcy5pc0xpbmUgPSBvLmxpbmUgIT09IHVuZGVmaW5lZCA/IG8ubGluZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IGxlZnQ6MDsgaGVpZ2h0OmF1dG87IG92ZXJmbG93OmhpZGRlbjsgdG9wOicrdGhpcy5oKydweCcpO1xyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxMHB4OyBoZWlnaHQ6MTBweDsgbGVmdDowOyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5ncm91cCwgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxMHB4OyBoZWlnaHQ6MTBweDsgbGVmdDo0cHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmFycm93LCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcbiAgICAgICAgLy8gYm90dG9tIGxpbmVcclxuICAgICAgICBpZiggdGhpcy5pc0xpbmUgKSB0aGlzLmNbNV0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgICdiYWNrZ3JvdW5kOnJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTsgd2lkdGg6MTAwJTsgbGVmdDowOyBoZWlnaHQ6MXB4OyBib3R0b206MHB4Jyk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICBzWzFdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzFdLm5hbWUgPSAnZ3JvdXAnO1xyXG5cclxuICAgICAgICBzWzFdLm1hcmdpbkxlZnQgPSAnMTBweCc7XHJcbiAgICAgICAgc1sxXS5saW5lSGVpZ2h0ID0gdGhpcy5oLTQ7XHJcbiAgICAgICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHNbMV0uZm9udFdlaWdodCA9ICdib2xkJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucmFkaXVzICE9PSAwICkgc1swXS5ib3JkZXJSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnOyBcclxuICAgICAgICBzWzBdLmJvcmRlciA9IHRoaXMuY29sb3JzLmdyb3VwQm9yZGVyO1xyXG5cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgLy9pZiggby5iZyAhPT0gdW5kZWZpbmVkICkgdGhpcy5zZXRCRyhvLmJnKTtcclxuICAgICAgICB0aGlzLnNldEJHKCB0aGlzLmJnICk7XHJcbiAgICAgICAgaWYoIG8ub3BlbiAhPT0gdW5kZWZpbmVkICkgdGhpcy5vcGVuKCk7XHJcblxyXG5cclxuICAgICAgICAvL3NbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGlmKCBsLnkgPCB0aGlzLmJhc2VIICkgbmFtZSA9ICd0aXRsZSc7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIG5hbWUgPSAnY29udGVudCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJUYXJnZXQgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ID09PSAtMSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAvLyBpZighdGhpcy50YXJnZXQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnRhcmdldC51aW91dCgpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50ICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHR5cGUgPSBlLnR5cGU7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICBsZXQgdGFyZ2V0Q2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHN3aXRjaCggbmFtZSApe1xyXG5cclxuICAgICAgICAgICAgY2FzZSAnY29udGVudCc6XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgICAgICBpZiggUm9vdHMuaXNNb2JpbGUgJiYgdHlwZSA9PT0gJ21vdXNlZG93bicgKSB0aGlzLmdldE5leHQoIGUsIGNoYW5nZSApO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMudGFyZ2V0ICkgdGFyZ2V0Q2hhbmdlID0gdGhpcy50YXJnZXQuaGFuZGxlRXZlbnQoIGUgKTtcclxuXHJcbiAgICAgICAgICAgIC8vaWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5zdHlsZXMoJ2RlZicpO1xyXG5cclxuICAgICAgICAgICAgaWYoICFSb290cy5sb2NrICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0aXRsZSc6XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyApe1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLm9wZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICBpZiggdGFyZ2V0Q2hhbmdlICkgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TmV4dCAoIGUsIGNoYW5nZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5leHQgPSBSb290cy5maW5kVGFyZ2V0KCB0aGlzLnVpcywgZSApO1xyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gdGhpcy5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV4dDtcclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSAtMSApeyBcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnVpc1sgdGhpcy5jdXJyZW50IF07XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnVpb3ZlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNhbGNIICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGxuZyA9IHRoaXMudWlzLmxlbmd0aCwgaSwgdSwgIGg9MCwgcHg9MCwgdG1waD0wO1xyXG4gICAgICAgIGZvciggaSA9IDA7IGkgPCBsbmc7IGkrKyl7XHJcbiAgICAgICAgICAgIHUgPSB0aGlzLnVpc1tpXTtcclxuICAgICAgICAgICAgaWYoICF1LmF1dG9XaWR0aCApe1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHB4PT09MCkgaCArPSB1LmgrMTtcclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRtcGg8dS5oKSBoICs9IHUuaC10bXBoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdG1waCA9IHUuaDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL3RtcGggPSB0bXBoIDwgdS5oID8gdS5oIDogdG1waDtcclxuICAgICAgICAgICAgICAgIHB4ICs9IHUudztcclxuICAgICAgICAgICAgICAgIGlmKCBweCt1LncgPiB0aGlzLncgKSBweCA9IDA7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaCArPSB1LmgrMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBoO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVaXMgKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBSb290cy5jYWxjVWlzKCB0aGlzLnVpcywgdGhpcy56b25lLCB0aGlzLnpvbmUueSArIHRoaXMuYmFzZUggKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNldEJHICggYyApIHtcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmJhY2tncm91bmQgPSBjO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRCRyggYyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgYWRkICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBhcmd1bWVudHM7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgYVsxXSA9PT0gJ29iamVjdCcgKXsgXHJcbiAgICAgICAgICAgIGFbMV0uaXNVSSA9IHRoaXMuaXNVSTtcclxuICAgICAgICAgICAgYVsxXS50YXJnZXQgPSB0aGlzLmNbMl07XHJcbiAgICAgICAgICAgIGFbMV0ubWFpbiA9IHRoaXMubWFpbjtcclxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdzdHJpbmcnICl7XHJcbiAgICAgICAgICAgIGlmKCBhWzJdID09PSB1bmRlZmluZWQgKSBbXS5wdXNoLmNhbGwoIGEsIHsgaXNVSTp0cnVlLCB0YXJnZXQ6dGhpcy5jWzJdLCBtYWluOnRoaXMubWFpbiB9KTtcclxuICAgICAgICAgICAgZWxzZXsgXHJcbiAgICAgICAgICAgICAgICBhWzJdLmlzVUkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYVsyXS50YXJnZXQgPSB0aGlzLmNbMl07XHJcbiAgICAgICAgICAgICAgICBhWzJdLm1haW4gPSB0aGlzLm1haW47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vbGV0IG4gPSBhZGQuYXBwbHkoIHRoaXMsIGEgKTtcclxuICAgICAgICBsZXQgdSA9IHRoaXMuQURELmFwcGx5KCB0aGlzLCBhICk7XHJcblxyXG4gICAgICAgIHRoaXMudWlzLnB1c2goIHUgKTtcclxuXHJcbiAgICAgICAgLy9pZiggdS5hdXRvSGVpZ2h0ICkgdS5wYXJlbnRHcm91cCA9IHRoaXM7XHJcbiAgICAgICAgLy9pZiggdS5pc0dyb3VwICkgXHJcblxyXG4gICAgICAgIHUuZ3JvdXAgPSB0aGlzO1xyXG5cclxuICAgICAgICB0aGlzLmlzRW1wdHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSBvbmUgbm9kZVxyXG5cclxuICAgIHJlbW92ZSAoIG4gKSB7XHJcblxyXG4gICAgICAgIGlmKCBuLmNsZWFyICkgbi5jbGVhcigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBjbGVhciBhbGwgaW5lciBcclxuXHJcbiAgICBlbXB0eSAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGgsIGl0ZW07XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaXRlbSA9IHRoaXMudWlzLnBvcCgpO1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0ucmVtb3ZlQ2hpbGQoIGl0ZW0uY1swXSApO1xyXG4gICAgICAgICAgICBpdGVtLmNsZWFyKCB0cnVlICk7XHJcblxyXG4gICAgICAgICAgICAvL3RoaXMudWlzW2ldLmNsZWFyKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYXIgb25lIGVsZW1lbnRcclxuXHJcbiAgICBjbGVhck9uZSAoIG4gKSB7IFxyXG5cclxuICAgICAgICBsZXQgaWQgPSB0aGlzLnVpcy5pbmRleE9mKCBuICk7XHJcblxyXG4gICAgICAgIGlmICggaWQgIT09IC0xICkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGMoIC0gKCB0aGlzLnVpc1sgaWQgXS5oICsgMSApICk7XHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5yZW1vdmVDaGlsZCggdGhpcy51aXNbIGlkIF0uY1swXSApO1xyXG4gICAgICAgICAgICB0aGlzLnVpcy5zcGxpY2UoIGlkLCAxICk7IFxyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMudWlzLmxlbmd0aCA9PT0gMCApeyBcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhcmVudEhlaWdodCAoIHQgKSB7XHJcblxyXG4gICAgICAgIC8vaWYgKCB0aGlzLnBhcmVudEdyb3VwICE9PSBudWxsICkgdGhpcy5wYXJlbnRHcm91cC5jYWxjKCB0ICk7XHJcbiAgICAgICAgaWYgKCB0aGlzLmdyb3VwICE9PSBudWxsICkgdGhpcy5ncm91cC5jYWxjKCB0ICk7XHJcbiAgICAgICAgZWxzZSBpZiAoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB0ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG9wZW4gKCkge1xyXG5cclxuICAgICAgICBzdXBlci5vcGVuKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93RG93biApO1xyXG4gICAgICAgIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgICAgIGxldCB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnRIZWlnaHQoIHQgKTtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyggdGhpcy51aXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG5cclxuICAgICAgICBsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93ICk7XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnRIZWlnaHQoIC10ICk7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coIHRoaXMudWlzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbXB0eSgpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggLSggdGhpcy5oICsgMSApKTtcclxuICAgICAgICBQcm90by5wcm90b3R5cGUuY2xlYXIuY2FsbCggdGhpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbGVhckdyb3VwICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvKnRoaXMuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uY2xlYXIoKTsgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51aXMgPSBbXTtcclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIOyovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNhbGMgKCB5ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiggeSAhPT0gdW5kZWZpbmVkICl7IFxyXG4gICAgICAgICAgICB0aGlzLmggKz0geTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB5ICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oID0gdGhpcy5jYWxjSCgpICsgdGhpcy5iYXNlSDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcblxyXG4gICAgICAgIC8vaWYodGhpcy5pc09wZW4pIHRoaXMuY2FsY1VpcygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZUNvbnRlbnQgKCkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRTaXplKCB0aGlzLncgKTtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uclNpemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHNbM10ubGVmdCA9ICggdGhpcy5zYSArIHRoaXMuc2IgLSAxNyApICsgJ3B4JztcclxuICAgICAgICBzWzFdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgdGhpcy5yU2l6ZUNvbnRlbnQoKTtcclxuXHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5Hcm91cC5wcm90b3R5cGUuaXNHcm91cCA9IHRydWU7IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBKb3lzdGljayBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gWzAsMF07XHJcblxyXG4gICAgICAgIHRoaXMuam95VHlwZSA9ICdhbmFsb2dpcXVlJztcclxuICAgICAgICB0aGlzLm1vZGVsID0gby5tb2RlICE9PSB1bmRlZmluZWQgPyBvLm1vZGUgOiAwO1xyXG5cclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uIHx8IDI7XHJcbiAgICAgICAgdGhpcy5tdWx0aXBsaWNhdG9yID0gby5tdWx0aXBsaWNhdG9yIHx8IDE7XHJcblxyXG4gICAgICAgIHRoaXMucG9zID0gbmV3IFYyKCk7XHJcbiAgICAgICAgdGhpcy50bXAgPSBuZXcgVjIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gdGhpcy53ICogMC41O1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2UgPSB0aGlzLnJhZGl1cyowLjI1O1xyXG5cclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgdGhpcy53ICsgMTA7XHJcbiAgICAgICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHsgLy8gd2l0aCB0aXRsZVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOmNlbnRlcjsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyB3aWR0aDonK3RoaXMudysncHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRKb3lzdGljayggdGhpcy5tb2RlbCApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnK3RoaXMudysnICcrdGhpcy53ICk7XHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLncsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IDEyOC90aGlzLnc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZShmYWxzZSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm1vZGVsPT09MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAndXJsKCNncmFkSW4pJywgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAnIzAwMCcsIDQgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2JhKDEwMCwxMDAsMTAwLDAuMjUpJywgMiApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2IoMCwwLDAsMC4xKScsIDMgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJyM2NjYnLCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAnbm9uZScsIDQgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm1vZGVsPT09MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAndXJsKCNncmFkSW4yKScsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYmEoMCwwLDAsMCknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiYSg0OCwxMzgsMjU1LDAuMjUpJywgMiApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2IoMCwwLDAsMC4zKScsIDMgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5jb2xvcnMuc2VsZWN0LCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAncmdiYSg0OCwxMzgsMjU1LDAuMjUpJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhZGRJbnRlcnZhbCAoKXtcclxuICAgICAgICBpZiggdGhpcy5pbnRlcnZhbCAhPT0gbnVsbCApIHRoaXMuc3RvcEludGVydmFsKCk7XHJcbiAgICAgICAgaWYoIHRoaXMucG9zLmlzWmVybygpICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggZnVuY3Rpb24oKXsgdGhpcy51cGRhdGUoKTsgfS5iaW5kKHRoaXMpLCAxMCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzdG9wSW50ZXJ2YWwgKCl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoIHRoaXMuaW50ZXJ2YWwgKTtcclxuICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmFkZEludGVydmFsKCk7XHJcbiAgICAgICAgdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRJbnRlcnZhbCgpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB0aGlzLm1vZGUoIDIgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnRtcC54ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgdGhpcy50bXAueSA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wICk7XHJcblxyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHRoaXMudG1wLmxlbmd0aCgpO1xyXG5cclxuICAgICAgICBpZiAoIGRpc3RhbmNlID4gdGhpcy5kaXN0YW5jZSApIHtcclxuICAgICAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLnRtcC54LCB0aGlzLnRtcC55KTtcclxuICAgICAgICAgICAgdGhpcy50bXAueCA9IE1hdGguc2luKCBhbmdsZSApICogdGhpcy5kaXN0YW5jZTtcclxuICAgICAgICAgICAgdGhpcy50bXAueSA9IE1hdGguY29zKCBhbmdsZSApICogdGhpcy5kaXN0YW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9zLmNvcHkoIHRoaXMudG1wICkuZGl2aWRlU2NhbGFyKCB0aGlzLmRpc3RhbmNlICkubmVnYXRlKCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFZhbHVlICggdiApIHtcclxuXHJcbiAgICAgICAgaWYodj09PXVuZGVmaW5lZCkgdj1bMCwwXTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3Muc2V0KCB2WzBdIHx8IDAsIHZbMV0gIHx8IDAgKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNWRygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgaWYoIHVwID09PSB1bmRlZmluZWQgKSB1cCA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsICE9PSBudWxsICl7XHJcblxyXG4gICAgICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MubGVycCggbnVsbCwgMC4zICk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MueCA9IE1hdGguYWJzKCB0aGlzLnBvcy54ICkgPCAwLjAxID8gMCA6IHRoaXMucG9zLng7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy55ID0gTWF0aC5hYnMoIHRoaXMucG9zLnkgKSA8IDAuMDEgPyAwIDogdGhpcy5wb3MueTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc1VJICYmIHRoaXMubWFpbi5pc0NhbnZhcyApIHRoaXMubWFpbi5kcmF3KCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnBvcy5pc1plcm8oKSApIHRoaXMuc3RvcEludGVydmFsKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNWRyAoKSB7XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgLSAoIC10aGlzLnBvcy54ICogdGhpcy5kaXN0YW5jZSApO1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgLSAoIC10aGlzLnBvcy55ICogdGhpcy5kaXN0YW5jZSApO1xyXG5cclxuICAgICAgICAgaWYodGhpcy5tb2RlbCA9PT0gMCl7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3ggPSB4ICsgKCh0aGlzLnBvcy54KSo1KSArIDU7XHJcbiAgICAgICAgICAgIGxldCBzeSA9IHkgKyAoKHRoaXMucG9zLnkpKjUpICsgMTA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCBzeCp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHN5KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCB4KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgeSp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgeCp0aGlzLnJhdGlvLCA0ICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgeSp0aGlzLnJhdGlvLCA0ICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVbMF0gPSAgKCB0aGlzLnBvcy54ICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcbiAgICAgICAgdGhpcy52YWx1ZVsxXSA9ICAoIHRoaXMucG9zLnkgKiB0aGlzLm11bHRpcGxpY2F0b3IgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIgKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3RvcEludGVydmFsKCk7XHJcbiAgICAgICAgc3VwZXIuY2xlYXIoKTtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBLbm9iIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VHlwZU51bWJlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLm1QSSA9IE1hdGguUEkgKiAwLjg7XHJcbiAgICAgICAgdGhpcy50b0RlZyA9IDE4MCAvIE1hdGguUEk7XHJcbiAgICAgICAgdGhpcy5jaXJSYW5nZSA9IHRoaXMubVBJICogMjtcclxuXHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSB0aGlzLncgKiAwLjU7Ly9NYXRoLmZsb29yKCh0aGlzLnctMjApKjAuNSk7XHJcblxyXG4gICAgICAgIC8vdGhpcy53dyA9IHRoaXMuaGVpZ2h0ID0gdGhpcy5yYWRpdXMgKiAyO1xyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMDtcclxuICAgICAgICB0aGlzLnRvcCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICAgICAgaWYodGhpcy5jWzFdICE9PSB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRLbm9iKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAzICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLm1ha2VHcmFkKCksIDMgKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy53dysnICcrdGhpcy53dyApO1xyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCB0aGlzLmNbM10sIHsgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy53LCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jbW9kZSA9PT0gbW9kZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLHRoaXMuY29sb3JzLmJ1dHRvbiwgMCk7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuMiknLCAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmZvbnRDb2xvciwgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmNvbG9yUGx1cztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJyx0aGlzLmNvbG9ycy5zZWxlY3QsIDApO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywncmdiYSgwLDAsMCwwLjYpJywgMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5jb2xvclBsdXMsIDEgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gbW9kZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNlbmRFbmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMub2xkciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICAvL3RoaXMubW9kZSgxKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IG9mZiA9IHRoaXMub2Zmc2V0O1xyXG5cclxuICAgICAgICBvZmYueCA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIG9mZi55ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3AgKTtcclxuXHJcbiAgICAgICAgdGhpcy5yID0gLSBNYXRoLmF0YW4yKCBvZmYueCwgb2ZmLnkgKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub2xkciAhPT0gbnVsbCApIHRoaXMuciA9IE1hdGguYWJzKHRoaXMuciAtIHRoaXMub2xkcikgPiBNYXRoLlBJID8gdGhpcy5vbGRyIDogdGhpcy5yO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSB0aGlzLnIgPiB0aGlzLm1QSSA/IHRoaXMubVBJIDogdGhpcy5yO1xyXG4gICAgICAgIHRoaXMuciA9IHRoaXMuciA8IC10aGlzLm1QSSA/IC10aGlzLm1QSSA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgbGV0IHN0ZXBzID0gMSAvIHRoaXMuY2lyUmFuZ2U7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gKHRoaXMuciArIHRoaXMubVBJKSAqIHN0ZXBzO1xyXG5cclxuICAgICAgICBsZXQgbiA9ICggKCB0aGlzLnJhbmdlICogdmFsdWUgKSArIHRoaXMubWluICkgLSB0aGlzLm9sZDtcclxuXHJcbiAgICAgICAgaWYobiA+PSB0aGlzLnN0ZXAgfHwgbiA8PSB0aGlzLnN0ZXApeyBcclxuICAgICAgICAgICAgbiA9IE1hdGguZmxvb3IoIG4gLyB0aGlzLnN0ZXAgKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHRoaXMub2xkICsgKCBuICogdGhpcy5zdGVwICkgKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm9sZHIgPSB0aGlzLnI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtYWtlR3JhZCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBkID0gJycsIHN0ZXAsIHJhbmdlLCBhLCB4LCB5LCB4MiwgeTIsIHIgPSA2NDtcclxuICAgICAgICBsZXQgc3RhcnRhbmdsZSA9IE1hdGguUEkgKyB0aGlzLm1QSTtcclxuICAgICAgICBsZXQgZW5kYW5nbGUgPSBNYXRoLlBJIC0gdGhpcy5tUEk7XHJcbiAgICAgICAgLy9sZXQgc3RlcCA9IHRoaXMuc3RlcD41ID8gdGhpcy5zdGVwIDogMTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5zdGVwPjUpe1xyXG4gICAgICAgICAgICByYW5nZSA9ICB0aGlzLnJhbmdlIC8gdGhpcy5zdGVwO1xyXG4gICAgICAgICAgICBzdGVwID0gKCBzdGFydGFuZ2xlIC0gZW5kYW5nbGUgKSAvIHJhbmdlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0ZXAgPSAoKCBzdGFydGFuZ2xlIC0gZW5kYW5nbGUgKSAvIHIpKjI7XHJcbiAgICAgICAgICAgIHJhbmdlID0gciowLjU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPD0gcmFuZ2U7ICsraSApIHtcclxuXHJcbiAgICAgICAgICAgIGEgPSBzdGFydGFuZ2xlIC0gKCBzdGVwICogaSApO1xyXG4gICAgICAgICAgICB4ID0gciArIE1hdGguc2luKCBhICkgKiAoIHIgLSAyMCApO1xyXG4gICAgICAgICAgICB5ID0gciArIE1hdGguY29zKCBhICkgKiAoIHIgLSAyMCApO1xyXG4gICAgICAgICAgICB4MiA9IHIgKyBNYXRoLnNpbiggYSApICogKCByIC0gMjQgKTtcclxuICAgICAgICAgICAgeTIgPSByICsgTWF0aC5jb3MoIGEgKSAqICggciAtIDI0ICk7XHJcbiAgICAgICAgICAgIGQgKz0gJ00nICsgeCArICcgJyArIHkgKyAnIEwnICsgeDIgKyAnICcreTIgKyAnICc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMucGVyY2VudCA9ICh0aGlzLnZhbHVlIC0gdGhpcy5taW4pIC8gdGhpcy5yYW5nZTtcclxuXHJcbiAgICAgICAvLyBsZXQgciA9IDUwO1xyXG4gICAgICAgLy8gbGV0IGQgPSA2NDsgXHJcbiAgICAgICAgbGV0IHIgPSAoICh0aGlzLnBlcmNlbnQgKiB0aGlzLmNpclJhbmdlKSAtICh0aGlzLm1QSSkpLy8qIHRoaXMudG9EZWc7XHJcblxyXG4gICAgICAgIGxldCBzaW4gPSBNYXRoLnNpbihyKTtcclxuICAgICAgICBsZXQgY29zID0gTWF0aC5jb3Mocik7XHJcblxyXG4gICAgICAgIGxldCB4MSA9ICgyNSAqIHNpbikgKyA2NDtcclxuICAgICAgICBsZXQgeTEgPSAtKDI1ICogY29zKSArIDY0O1xyXG4gICAgICAgIGxldCB4MiA9ICgyMCAqIHNpbikgKyA2NDtcclxuICAgICAgICBsZXQgeTIgPSAtKDIwICogY29zKSArIDY0O1xyXG5cclxuICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHgsIDEgKTtcclxuICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHksIDEgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCAnTSAnICsgeDEgKycgJyArIHkxICsgJyBMICcgKyB4MiArJyAnICsgeTIsIDEgKTtcclxuXHJcbiAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndHJhbnNmb3JtJywgJ3JvdGF0ZSgnKyByICsnICcrNjQrJyAnKzY0KycpJywgMSApO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIExpc3QgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgLy8gaW1hZ2VzXHJcbiAgICAgICAgdGhpcy5wYXRoID0gby5wYXRoIHx8ICcnO1xyXG4gICAgICAgIHRoaXMuZm9ybWF0ID0gby5mb3JtYXQgfHwgJyc7XHJcbiAgICAgICAgdGhpcy5pbWFnZVNpemUgPSBvLmltYWdlU2l6ZSB8fCBbMjAsMjBdO1xyXG5cclxuICAgICAgICB0aGlzLmlzV2l0aEltYWdlID0gdGhpcy5wYXRoICE9PSAnJyA/IHRydWU6ZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBJbWFnZSA9IHt9O1xyXG4gICAgICAgIHRoaXMudG1wVXJsID0gW107XHJcblxyXG4gICAgICAgIC8vdGhpcy5hdXRvSGVpZ2h0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBhbGlnbiA9IG8uYWxpZ24gfHwgJ2NlbnRlcic7XHJcblxyXG4gICAgICAgIHRoaXMuc01vZGUgPSAwO1xyXG4gICAgICAgIHRoaXMudE1vZGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RPbmx5ID0gby5saXN0T25seSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudHh0ID09PSAnJyApIHRoaXMucCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6MDsgZGlzcGxheTpub25lOycgKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOicrYWxpZ24rJzsgbGluZS1oZWlnaHQ6JysodGhpcy5oLTQpKydweDsgdG9wOjFweDsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxMHB4OyBoZWlnaHQ6MTBweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuYXJyb3csIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxlciA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncmlnaHQ6NXB4OyAgd2lkdGg6MTBweDsgYmFja2dyb3VuZDojNjY2OyBkaXNwbGF5Om5vbmU7Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3QgPSBvLmxpc3QgfHwgW107XHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnByZXZOYW1lID0gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIHRoaXMuaXRlbUhlaWdodCA9IG8uaXRlbUhlaWdodCB8fCAodGhpcy5oLTMpO1xyXG5cclxuICAgICAgICAvLyBmb3JjZSBmdWxsIGxpc3QgXHJcbiAgICAgICAgdGhpcy5mdWxsID0gby5mdWxsIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnB5ID0gMDtcclxuICAgICAgICB0aGlzLnd3ID0gdGhpcy5zYjtcclxuICAgICAgICB0aGlzLnNjcm9sbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIGxpc3QgdXAgb3IgZG93blxyXG4gICAgICAgIHRoaXMuc2lkZSA9IG8uc2lkZSB8fCAnZG93bic7XHJcbiAgICAgICAgdGhpcy51cCA9IHRoaXMuc2lkZSA9PT0gJ2Rvd24nID8gMCA6IDE7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICAvL3RoaXMuY1s1XS5zdHlsZS50b3AgPSAnYXV0byc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUuYm90dG9tID0gdGhpcy5oLTIgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUuYm90dG9tID0gJzFweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS5ib3R0b20gPSBmbHRvcCArICdweCc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5zdHlsZS50b3AgPSB0aGlzLmJhc2VIICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubGlzdEluID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdsZWZ0OjA7IHRvcDowOyB3aWR0aDoxMDAlOyBiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsMC4yKTsnKTtcclxuICAgICAgICB0aGlzLmxpc3RJbi5uYW1lID0gJ2xpc3QnO1xyXG5cclxuICAgICAgICB0aGlzLnRvcExpc3QgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY1syXS5hcHBlbmRDaGlsZCggdGhpcy5saXN0SW4gKTtcclxuICAgICAgICB0aGlzLmNbMl0uYXBwZW5kQ2hpbGQoIHRoaXMuc2Nyb2xsZXIgKTtcclxuXHJcbiAgICAgICAgaWYoIG8udmFsdWUgIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgICAgICBpZighaXNOYU4oby52YWx1ZSkpIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbIG8udmFsdWUgXTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gby52YWx1ZTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubGlzdFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNPcGVuT25TdGFydCA9IG8ub3BlbiB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubGlzdE9ubHkgKXtcclxuICAgICAgICAgICAgdGhpcy5iYXNlSCA9IDU7XHJcbiAgICAgICAgICAgIHRoaXMuY1szXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9IHRoaXMuYmFzZUgrJ3B4J1xyXG4gICAgICAgICAgICB0aGlzLmlzT3Blbk9uU3RhcnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzBdLnN0eWxlLmJhY2tncm91bmQgPSAnI0ZGMDAwMCdcclxuICAgICAgICBpZiggdGhpcy5pc1dpdGhJbWFnZSApIHRoaXMucHJlbG9hZEltYWdlKCk7XHJcbiAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBwb3B1bGF0ZSBsaXN0XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGlzdCggdGhpcy5saXN0ICk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW5PblN0YXJ0ICkgdGhpcy5vcGVuKCB0cnVlICk7XHJcbiAgICAgICAvLyB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGltYWdlIGxpc3RcclxuXHJcbiAgICBwcmVsb2FkSW1hZ2UgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnRtcEltYWdlID0ge307XHJcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPHRoaXMubGlzdC5sZW5ndGg7IGkrKyApIHRoaXMudG1wVXJsLnB1c2goIHRoaXMubGlzdFtpXSApO1xyXG4gICAgICAgIHRoaXMubG9hZE9uZSgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG5leHRJbWcgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnRtcFVybC5zaGlmdCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLnRtcFVybC5sZW5ndGggPT09IDAgKXsgXHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZEltYWdlcygpO1xyXG4gICAgICAgICAgICAvKnRoaXMuc2V0TGlzdCggdGhpcy5saXN0ICk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW5PblN0YXJ0ICkgdGhpcy5vcGVuKCk7Ki9cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgdGhpcy5sb2FkT25lKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxvYWRPbmUoKXtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRtcFVybFswXTtcclxuICAgICAgICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgaW1nLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOicrc2VsZi5pbWFnZVNpemVbMF0rJ3B4OyBoZWlnaHQ6JytzZWxmLmltYWdlU2l6ZVsxXSsncHgnO1xyXG4gICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIHRoaXMucGF0aCArIG5hbWUgKyB0aGlzLmZvcm1hdCApO1xyXG5cclxuICAgICAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbWFnZVNpemVbMl0gPSBpbWcud2lkdGg7XHJcbiAgICAgICAgICAgIHNlbGYuaW1hZ2VTaXplWzNdID0gaW1nLmhlaWdodDtcclxuICAgICAgICAgICAgc2VsZi50bXBJbWFnZVtuYW1lXSA9IGltZztcclxuICAgICAgICAgICAgc2VsZi5uZXh0SW1nKCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL1xyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICYmIHRoaXMuaXNPcGVuICl7XHJcbiAgICAgICAgICAgIGlmKCBsLnkgPiB0aGlzLmggLSB0aGlzLmJhc2VIICkgcmV0dXJuICd0aXRsZSc7XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5zY3JvbGwgJiYgKCBsLnggPiAodGhpcy5zYSt0aGlzLnNiLTIwKSkgKSByZXR1cm4gJ3Njcm9sbCc7XHJcbiAgICAgICAgICAgICAgICBpZihsLnggPiB0aGlzLnNhKSByZXR1cm4gdGhpcy50ZXN0SXRlbXMoIGwueS10aGlzLmJhc2VIICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIGwueSA8IHRoaXMuYmFzZUgrMiApIHJldHVybiAndGl0bGUnO1xyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuICl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuc2Nyb2xsICYmICggbC54ID4gKHRoaXMuc2ErdGhpcy5zYi0yMCkpICkgcmV0dXJuICdzY3JvbGwnO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGwueCA+IHRoaXMuc2EpIHJldHVybiB0aGlzLnRlc3RJdGVtcyggbC55LXRoaXMuYmFzZUggKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdEl0ZW1zICggeSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSAnJztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLml0ZW1zLmxlbmd0aCwgaXRlbSwgYSwgYjtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuICAgICAgICAgICAgYSA9IGl0ZW0ucG9zeSArIHRoaXMudG9wTGlzdDtcclxuICAgICAgICAgICAgYiA9IGl0ZW0ucG9zeSArIHRoaXMuaXRlbUhlaWdodCArIDEgKyB0aGlzLnRvcExpc3Q7XHJcbiAgICAgICAgICAgIGlmKCB5ID49IGEgJiYgeSA8PSBiICl7IFxyXG4gICAgICAgICAgICAgICAgbmFtZSA9ICdpdGVtJyArIGk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuU2VsZWN0ZWQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuYW1lO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1blNlbGVjdGVkICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuMiknO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdGVkICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmNvbG9yID0gJyNGRkYnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3Njcm9sbCcgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lID09PSAndGl0bGUnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgyKTtcclxuICAgICAgICAgICAgaWYoICF0aGlzLmxpc3RPbmx5ICl7XHJcbiAgICAgICAgICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbdGhpcy5jdXJyZW50LmlkXVxyXG4gICAgICAgICAgICAgICAgLy90aGlzLnZhbHVlID0gdGhpcy5jdXJyZW50LnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgICAgICBpZiggIXRoaXMubGlzdE9ubHkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBudXAgPSBmYWxzZTtcclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIG51cDtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0aXRsZScgKXtcclxuICAgICAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDEpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYoIG5hbWUgPT09ICdzY3JvbGwnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncy1yZXNpemUnKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDEpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZVNjcm9sbCgyKTtcclxuICAgICAgICAgICAgICAgIGxldCB0b3AgPSB0aGlzLnpvbmUueSt0aGlzLmJhc2VILTI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSggKCBlLmNsaWVudFkgLSB0b3AgICkgLSAoIHRoaXMuc2gqMC41ICkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2lmKHRoaXMuaXNEb3duKSB0aGlzLmxpc3Rtb3ZlKGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpcyBpdGVtXHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDApO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmFtZSAhPT0gdGhpcy5wcmV2TmFtZSApIG51cCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0aXRsZScgKSByZXR1cm4gZmFsc2U7IFxyXG4gICAgICAgIHRoaXMucHkgKz0gZS5kZWx0YSoxMDtcclxuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnB5KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnByZXZOYW1lID0gJyc7XHJcbiAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgdGhpcy5tb2RlVGl0bGUoMCk7XHJcbiAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDApO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vZGVTY3JvbGwgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggbW9kZSA9PT0gdGhpcy5zTW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdCAvIGRvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc01vZGUgPSBtb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIG1vZGVUaXRsZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBtb2RlID09PSB0aGlzLnRNb2RlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHNbM10uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSAnI0ZGRic7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRNb2RlID0gbW9kZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJMaXN0ICgpIHtcclxuXHJcbiAgICAgICAgd2hpbGUgKCB0aGlzLmxpc3RJbi5jaGlsZHJlbi5sZW5ndGggKSB0aGlzLmxpc3RJbi5yZW1vdmVDaGlsZCggdGhpcy5saXN0SW4ubGFzdENoaWxkICk7XHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRMaXN0ICggbGlzdCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ID0gbGlzdDtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGlzdC5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SXRlbSA9IHRoaXMuZnVsbCA/IHRoaXMubGVuZ3RoIDogNTtcclxuICAgICAgICB0aGlzLm1heEl0ZW0gPSB0aGlzLmxlbmd0aCA8IHRoaXMubWF4SXRlbSA/IHRoaXMubGVuZ3RoIDogdGhpcy5tYXhJdGVtO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlaWdodCA9IHRoaXMubWF4SXRlbSAqICh0aGlzLml0ZW1IZWlnaHQrMSkgKyAyO1xyXG5cclxuICAgICAgICB0aGlzLm1heCA9IHRoaXMubGVuZ3RoICogKHRoaXMuaXRlbUhlaWdodCsxKSArIDI7XHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IHRoaXMubWF4SGVpZ2h0IC8gdGhpcy5tYXg7XHJcbiAgICAgICAgdGhpcy5zaCA9IHRoaXMubWF4SGVpZ2h0ICogdGhpcy5yYXRpbztcclxuICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXhIZWlnaHQgLSB0aGlzLnNoO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5tYXhIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaCArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm1heCA+IHRoaXMubWF4SGVpZ2h0ICl7IFxyXG4gICAgICAgICAgICB0aGlzLnd3ID0gdGhpcy5zYiAtIDIwO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaXRlbSwgbjsvLywgbCA9IHRoaXMuc2I7XHJcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPHRoaXMubGVuZ3RoOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIG4gPSB0aGlzLmxpc3RbaV07XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLml0ZW0gKyAnd2lkdGg6Jyt0aGlzLnd3KydweDsgaGVpZ2h0OicrdGhpcy5pdGVtSGVpZ2h0KydweDsgbGluZS1oZWlnaHQ6JysodGhpcy5pdGVtSGVpZ2h0LTUpKydweDsgY29sb3I6Jyt0aGlzLmZvbnRDb2xvcisnOycgKTtcclxuICAgICAgICAgICAgaXRlbS5uYW1lID0gJ2l0ZW0nK2k7XHJcbiAgICAgICAgICAgIGl0ZW0uaWQgPSBpO1xyXG4gICAgICAgICAgICBpdGVtLnBvc3kgPSAodGhpcy5pdGVtSGVpZ2h0KzEpKmk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdEluLmFwcGVuZENoaWxkKCBpdGVtICk7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaCggaXRlbSApO1xyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5pc1dpdGhJbWFnZSApIGl0ZW0uYXBwZW5kQ2hpbGQoIHRoaXMudG1wSW1hZ2Vbbl0gKTtcclxuICAgICAgICAgICAgaWYoICF0aGlzLmlzV2l0aEltYWdlICkgaXRlbS50ZXh0Q29udGVudCA9IG47XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgYWRkSW1hZ2VzICgpe1xyXG4gICAgICAgIGxldCBsbmcgPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG4gICAgICAgIGZvciggbGV0IGk9MDsgaTxsbmc7IGkrKyApe1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmFwcGVuZENoaWxkKCB0aGlzLnRtcEltYWdlW3RoaXMubGlzdFtpXV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VG9wSXRlbSAoKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKXsgXHJcblxyXG4gICAgICAgICAgICBpZiggIXRoaXMucHJlTG9hZENvbXBsZXRlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaWYoIXRoaXMuY1szXS5jaGlsZHJlbi5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5pbWFnZVNpemVbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmltYWdlU2l6ZVsxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7IHRvcDowcHg7IGxlZnQ6MHB4OydcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzNdLmFwcGVuZENoaWxkKCB0aGlzLmNhbnZhcyApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1nID0gdGhpcy50bXBJbWFnZVsgdGhpcy52YWx1ZSBdO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoIHRoaXMudG1wSW1hZ2VbIHRoaXMudmFsdWUgXSwgMCwgMCwgdGhpcy5pbWFnZVNpemVbMl0sIHRoaXMuaW1hZ2VTaXplWzNdLCAwLDAsIHRoaXMuaW1hZ2VTaXplWzBdLCB0aGlzLmltYWdlU2l6ZVsxXSApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0gTElTVFxyXG5cclxuICAgIHVwZGF0ZSAoIHkgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5zY3JvbGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHkgPSB5IDwgMCA/IDAgOiB5O1xyXG4gICAgICAgIHkgPSB5ID4gdGhpcy5yYW5nZSA/IHRoaXMucmFuZ2UgOiB5O1xyXG5cclxuICAgICAgICB0aGlzLnRvcExpc3QgPSAtTWF0aC5mbG9vciggeSAvIHRoaXMucmF0aW8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0SW4uc3R5bGUudG9wID0gdGhpcy50b3BMaXN0KydweCc7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS50b3AgPSBNYXRoLmZsb29yKCB5ICkgICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5weSA9IHk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhcmVudEhlaWdodCAoIHQgKSB7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5ncm91cCAhPT0gbnVsbCApIHRoaXMuZ3JvdXAuY2FsYyggdCApO1xyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBvcGVuICggZmlyc3QgKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLm9wZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoIDAgKTtcclxuICAgICAgICB0aGlzLmggPSB0aGlzLm1heEhlaWdodCArIHRoaXMuYmFzZUggKyA1O1xyXG4gICAgICAgIGlmKCAhdGhpcy5zY3JvbGwgKXtcclxuICAgICAgICAgICAgdGhpcy50b3BMaXN0ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSCArIDUgKyB0aGlzLm1heDtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudXAgKXsgXHJcbiAgICAgICAgICAgIHRoaXMuem9uZS55IC09IHRoaXMuaCAtICh0aGlzLmJhc2VILTEwKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3dVcCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93RG93biApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yU2l6ZUNvbnRlbnQoKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgaWYoIWZpcnN0KSB0aGlzLnBhcmVudEhlaWdodCggdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgKz0gdGhpcy5oIC0gKHRoaXMuYmFzZUgtMTApO1xyXG5cclxuICAgICAgICBsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3cgKTtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCAtdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLVxyXG5cclxuICAgIHRleHQgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemVDb250ZW50ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMubGlzdEluLmNoaWxkcmVuW2ldLnN0eWxlLndpZHRoID0gdGhpcy53dyArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLnNiO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgaWYoc1syXT09PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IGQgKydweCc7XHJcblxyXG4gICAgICAgIHNbM10ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSBkICsgJ3B4JztcclxuXHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gZCArIHcgLSAxNyArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMud3cgPSB3O1xyXG4gICAgICAgIGlmKCB0aGlzLm1heCA+IHRoaXMubWF4SGVpZ2h0ICkgdGhpcy53dyA9IHctMjA7XHJcbiAgICAgICAgaWYodGhpcy5pc09wZW4pIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi4vY29yZS9Ub29scyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnVtZXJpYyBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbGx3YXkgPSBvLmFsbHdheSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IFswXTtcclxuICAgICAgICB0aGlzLm11bHR5ID0gMTtcclxuICAgICAgICB0aGlzLmludm11bHR5ID0gMTtcclxuICAgICAgICB0aGlzLmlzU2luZ2xlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzQW5nbGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmVjdG9yID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBvLmlzQW5nbGUgKXtcclxuICAgICAgICAgICAgdGhpcy5pc0FuZ2xlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5tdWx0eSA9IFRvb2xzLnRvcmFkO1xyXG4gICAgICAgICAgICB0aGlzLmludm11bHR5ID0gVG9vbHMudG9kZWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzRHJhZyA9IG8uZHJhZyB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIG8udmFsdWUgIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgICAgICBpZighaXNOYU4oby52YWx1ZSkpeyBcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbby52YWx1ZV07XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiggby52YWx1ZSBpbnN0YW5jZW9mIEFycmF5ICl7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWU7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NpbmdsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIG8udmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gW107XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS54ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzBdID0gby52YWx1ZS54O1xyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUueSAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsxXSA9IG8udmFsdWUueTtcclxuICAgICAgICAgICAgICAgIGlmKCBvLnZhbHVlLnogIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMl0gPSBvLnZhbHVlLno7XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS53ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzNdID0gby52YWx1ZS53O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1ZlY3RvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2luZ2xlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy50bXAgPSBbXTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgIHRoaXMucHJldiA9IHsgeDowLCB5OjAsIGQ6MCwgdjowIH07XHJcblxyXG4gICAgICAgIC8vIGJnXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcnMuc2VsZWN0ICsgJzsgdG9wOjRweDsgd2lkdGg6MHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7JyApO1xyXG5cclxuICAgICAgICB0aGlzLmNNb2RlID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5pc0FuZ2xlKSB0aGlzLnZhbHVlW2ldID0gKHRoaXMudmFsdWVbaV0gKiAxODAgLyBNYXRoLlBJKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApO1xyXG4gICAgICAgICAgICB0aGlzLmNbMytpXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJyBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsgYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcnMuaW5wdXRCZyArICc7IGJvcmRlckNvbG9yOicgKyB0aGlzLmNvbG9ycy5pbnB1dEJvcmRlcisnOyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycpO1xyXG4gICAgICAgICAgICBpZihvLmNlbnRlcikgdGhpcy5jWzIraV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVtpXTtcclxuICAgICAgICAgICAgdGhpcy5jWzMraV0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5jWzMraV0uaXNOdW0gPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY3Vyc29yXHJcbiAgICAgICAgdGhpcy5jdXJzb3JJZCA9IDMgKyB0aGlzLmxuZztcclxuICAgICAgICB0aGlzLmNbIHRoaXMuY3Vyc29ySWQgXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjRweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OyB3aWR0aDowcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmZvbnRDb2xvcisnOycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgdCA9IHRoaXMudG1wO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgIC8qIG1vZGU6IGZ1bmN0aW9uICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgaWYoIG4gPT09IHRoaXMuY01vZGVbbmFtZV0gKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vbGV0IG07XHJcblxyXG4gICAgICAgIC8qc3dpdGNoKG4pe1xyXG5cclxuICAgICAgICAgICAgY2FzZSAwOiBtID0gdGhpcy5jb2xvcnMuYm9yZGVyOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiBtID0gdGhpcy5jb2xvcnMuYm9yZGVyT3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogbSA9IHRoaXMuY29sb3JzLmJvcmRlclNlbGVjdDsgIGJyZWFrO1xyXG5cclxuICAgICAgICB9Ki9cclxuXHJcbiAgIC8qICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgLy90aGlzLmNbbmFtZSsyXS5zdHlsZS5ib3JkZXJDb2xvciA9IG07XHJcbiAgICAgICAgdGhpcy5jTW9kZVtuYW1lXSA9IG47XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYoIG5hbWUgIT09ICcnICl7IFxyXG4gICAgICAgICAgICBcdHRoaXMuY3VycmVudCA9IG5hbWU7XHJcbiAgICAgICAgICAgIFx0dGhpcy5wcmV2ID0geyB4OmUuY2xpZW50WCwgeTplLmNsaWVudFksIGQ6MCwgdjogdGhpcy5pc1NpbmdsZSA/IHBhcnNlRmxvYXQodGhpcy52YWx1ZSkgOiBwYXJzZUZsb2F0KCB0aGlzLnZhbHVlWyB0aGlzLmN1cnJlbnQgXSApICB9O1xyXG4gICAgICAgICAgICBcdHRoaXMuc2V0SW5wdXQoIHRoaXMuY1sgMyArIHRoaXMuY3VycmVudCBdICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLypcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICcnICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmFtZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMucHJldiA9IHsgeDplLmNsaWVudFgsIHk6ZS5jbGllbnRZLCBkOjAsIHY6IHRoaXMuaXNTaW5nbGUgPyBwYXJzZUZsb2F0KHRoaXMudmFsdWUpIDogcGFyc2VGbG9hdCggdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gKSAgfTtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoIDIsIG5hbWUgKTsqL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICBcdGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5wcmV2ID0geyB4OjAsIHk6MCwgZDowLCB2OjAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAvKmxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICl7IFxyXG5cclxuICAgICAgICAgICAgLy9sZXQgdG0gPSB0aGlzLmN1cnJlbnQ7XHJcbiAgICAgICAgICAgIGxldCB0ZCA9IHRoaXMucHJldi5kO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMucHJldiA9IHsgeDowLCB5OjAsIGQ6MCwgdjowIH07XHJcblxyXG4gICAgICAgICAgICBpZiggIXRkICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRJbnB1dCggdGhpcy5jWyAzICsgbmFtZSBdICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsvL3RoaXMubW9kZSggMiwgbmFtZSApO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc2V0KCk7Ly90aGlzLm1vZGUoIDAsIHRtICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBudXAgPSBmYWxzZTtcclxuICAgICAgICBsZXQgeCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJycgKSB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIGVsc2V7IFxyXG4gICAgICAgIFx0aWYoIXRoaXMuaXNEcmFnKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIFx0ZWxzZSB0aGlzLmN1cnNvciggdGhpcy5jdXJyZW50ICE9PSAtMSA/ICdtb3ZlJyA6ICdwb2ludGVyJyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRHJhZyApe1xyXG5cclxuICAgICAgICBcdGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICl7XHJcblxyXG4gICAgICAgICAgICBcdHRoaXMucHJldi5kICs9ICggZS5jbGllbnRYIC0gdGhpcy5wcmV2LnggKSAtICggZS5jbGllbnRZIC0gdGhpcy5wcmV2LnkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbiA9IHRoaXMucHJldi52ICsgKCB0aGlzLnByZXYuZCAqIHRoaXMuc3RlcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gPSB0aGlzLm51bVZhbHVlKG4pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWyAzICsgdGhpcy5jdXJyZW50IF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW3RoaXMuY3VycmVudF07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucHJldi54ID0gZS5jbGllbnRYO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2LnkgPSBlLmNsaWVudFk7XHJcblxyXG4gICAgICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgXHRpZiggdGhpcy5pc0Rvd24gKSB4ID0gZS5jbGllbnRYIC0gdGhpcy56b25lLnggLTM7XHJcbiAgICAgICAgXHRpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApIHggLT0gdGhpcy50bXBbdGhpcy5jdXJyZW50XVswXVxyXG4gICAgICAgIFx0cmV0dXJuIHRoaXMudXBJbnB1dCggeCwgdGhpcy5pc0Rvd24gKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8va2V5ZG93bjogZnVuY3Rpb24gKCBlICkgeyByZXR1cm4gdHJ1ZTsgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgLy90aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL3RoaXMuY3VycmVudCA9IDA7XHJcblxyXG4gICAgICAgLyogbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICAgICAgaWYodGhpcy5jTW9kZVtpXSE9PTApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuY1syK2ldLnN0eWxlLmJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9yZGVyO1xyXG4gICAgICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgc2V0VmFsdWUgKCB2ICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1ZlY3RvciApe1xyXG5cclxuICAgICAgICAgICAgaWYoIHYueCAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVswXSA9IHYueDtcclxuICAgICAgICAgICAgaWYoIHYueSAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsxXSA9IHYueTtcclxuICAgICAgICAgICAgaWYoIHYueiAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsyXSA9IHYuejtcclxuICAgICAgICAgICAgaWYoIHYudyAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVszXSA9IHYudztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAvL2xldCBpID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8qbiA9IG4gfHwgMDtcclxuICAgICAgICB0aGlzLnZhbHVlW25dID0gdGhpcy5udW1WYWx1ZSggdiApO1xyXG4gICAgICAgIHRoaXMuY1sgMyArIG4gXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbbl07Ki9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2FtZVN0ciAoIHN0ciApe1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gc3RyO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnZhbHVlLmxlbmd0aDtcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgIHRoaXMudmFsdWVbaV0gPSB0aGlzLm51bVZhbHVlKCB0aGlzLnZhbHVlW2ldICogdGhpcy5pbnZtdWx0eSApO1xyXG4gICAgICAgICAgICAgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVtpXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZW5kICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rICE9PSBudWxsICl7IFxyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNWZWN0b3IgKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0uZnJvbUFycmF5KCB2ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLyp0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0ueCA9IHZbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0ueSA9IHZbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0ueiA9IHZbMl07XHJcbiAgICAgICAgICAgICAgICBpZiggdlszXSApIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXS53ID0gdlszXTsqL1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSA9IHY7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2soIHYsIHRoaXMudmFsICk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElOUFVUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2VsZWN0ICggYywgZSwgdyApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLmN1cnJlbnQgIT09IC0xID8gdGhpcy50bXBbdGhpcy5jdXJyZW50XVswXSArIDUgOiAwO1xyXG4gICAgICAgIHNbdGhpcy5jdXJzb3JJZF0ud2lkdGggPSAnMXB4JztcclxuICAgICAgICBzW3RoaXMuY3Vyc29ySWRdLmxlZnQgPSAoIGQgKyBjICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICggZCArIGUgKSArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgdW5zZWxlY3QgKCkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBpZighcykgcmV0dXJuO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAwICsgJ3B4JztcclxuICAgICAgICBzW3RoaXMuY3Vyc29ySWRdLndpZHRoID0gMCArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGxldCBhciA9IFtdO1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmFsbHdheSApIGZvcmNlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICBcdGlmKCFpc05hTiggdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ICkpeyBcclxuICAgICAgICAgICAgICAgIGxldCBueCA9IHRoaXMubnVtVmFsdWUoIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gbng7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlW2ldID0gbng7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIG5vdCBudW1iZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbaV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgXHRhcltpXSA9IHRoaXMudmFsdWVbaV0gKiB0aGlzLm11bHR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoICFmb3JjZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTaW5nbGUgKSB0aGlzLnNlbmQoIGFyWzBdICk7XHJcbiAgICAgICAgZWxzZSB0aGlzLnNlbmQoIGFyICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVaSVNFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgdyA9IE1hdGguZmxvb3IoICggdGhpcy5zYiArIDUgKSAvIHRoaXMubG5nICktNTtcclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldID0gWyBNYXRoLmZsb29yKCB0aGlzLnNhICsgKCB3ICogaSApKyggNSAqIGkgKSksIHcgXTtcclxuICAgICAgICAgICAgdGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG4gICAgICAgICAgICBzWyAzICsgaSBdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCc7XHJcbiAgICAgICAgICAgIHNbIDMgKyBpIF0ud2lkdGggPSB0aGlzLnRtcFtpXVsxXSArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBTbGlkZSBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMubW9kZWwgPSBvLnN0eXBlIHx8IDA7XHJcbiAgICAgICAgaWYoIG8ubW9kZSAhPT0gdW5kZWZpbmVkICkgdGhpcy5tb2RlbCA9IG8ubW9kZTtcclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLmRlZmF1bHRCb3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmhpZGU7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc092ZXIgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRGVnID0gby5pc0RlZyB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5maXJzdEltcHV0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnbGV0dGVyLXNwYWNpbmc6LTFweDsgdGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgYm9yZGVyOjFweCBkYXNoZWQgJyt0aGlzLmRlZmF1bHRCb3JkZXJDb2xvcisnOyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAndGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgYm9yZGVyOjFweCBkYXNoZWQgJyt0aGlzLmRlZmF1bHRCb3JkZXJDb2xvcisnOyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2JvcmRlcjpub25lOyB3aWR0aDo0N3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnbGV0dGVyLXNwYWNpbmc6LTFweDsgdGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJyB0b3A6MDsgaGVpZ2h0OicrdGhpcy5oKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcnMuc2Nyb2xsYmFjaysnOyB0b3A6MnB4OyBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzVdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdsZWZ0OjRweDsgdG9wOjVweDsgaGVpZ2h0OicrKHRoaXMuaC0xMCkrJ3B4OyBiYWNrZ3JvdW5kOicgKyB0aGlzLmZvbnRDb2xvciArJzsnICk7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS5pc051bSA9IHRydWU7XHJcbiAgICAgICAgLy90aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gKHRoaXMuaC00KSArICdweCc7XHJcbiAgICAgICAgLy90aGlzLmNbMl0uc3R5bGUubGluZUhlaWdodCA9ICh0aGlzLmgtOCkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1syXS5zdHlsZS5oZWlnaHQgPSAodGhpcy5oLTIpICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUubGluZUhlaWdodCA9ICh0aGlzLmgtMTApICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYodGhpcy5tb2RlbCAhPT0gMCl7XHJcblxyXG4gICAgICAgICAgICBsZXQgaDEgPSA0LCBoMiA9IDgsIHd3ID0gdGhpcy5oLTQsIHJhID0gMjA7XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5tb2RlbCA9PT0gMiApe1xyXG4gICAgICAgICAgICAgICAgaDEgPSA0Oy8vMlxyXG4gICAgICAgICAgICAgICAgaDIgPSA4O1xyXG4gICAgICAgICAgICAgICAgcmEgPSAyO1xyXG4gICAgICAgICAgICAgICAgd3cgPSAodGhpcy5oLTQpKjAuNVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsID09PSAzKSB0aGlzLmNbNV0uc3R5bGUudmlzaWJsZSA9ICdub25lJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS5ib3JkZXJSYWRpdXMgPSBoMSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS5oZWlnaHQgPSBoMiArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS50b3AgPSAodGhpcy5oKjAuNSkgLSBoMSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s1XS5zdHlsZS5ib3JkZXJSYWRpdXMgPSAoaDEqMC41KSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s1XS5zdHlsZS5oZWlnaHQgPSBoMSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s1XS5zdHlsZS50b3AgPSAodGhpcy5oKjAuNSktKGgxKjAuNSkgKyAncHgnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzZdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdib3JkZXItcmFkaXVzOicrcmErJ3B4OyBtYXJnaW4tbGVmdDonKygtd3cqMC41KSsncHg7IGJvcmRlcjoxcHggc29saWQgJyt0aGlzLmNvbG9ycy5ib3JkZXIrJzsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsgbGVmdDo0cHg7IHRvcDoycHg7IGhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OyB3aWR0aDonK3d3KydweDsnICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuICAgICAgICBcclxuICAgICAgICBpZiggbC54ID49IHRoaXMudHhsICkgcmV0dXJuICd0ZXh0JztcclxuICAgICAgICBlbHNlIGlmKCBsLnggPj0gdGhpcy5zYSApIHJldHVybiAnc2Nyb2xsJztcclxuICAgICAgICBlbHNlIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKSB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApeyBcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyppZiggbmFtZSA9PT0gJ3RleHQnICl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1syXSwgZnVuY3Rpb24oKXsgdGhpcy52YWxpZGF0ZSgpIH0uYmluZCh0aGlzKSApO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG51cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdzY3JvbGwnICkge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGUoMSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCd3LXJlc2l6ZScpO1xyXG4gICAgICAgIC8vfSBlbHNlIGlmKG5hbWUgPT09ICd0ZXh0Jyl7IFxyXG4gICAgICAgICAgICAvL3RoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG5cclxuICAgICAgICAgICAgbGV0IG4gPSAoKCggZS5jbGllbnRYIC0gKHRoaXMuem9uZS54K3RoaXMuc2EpIC0gMyApIC8gdGhpcy53dyApICogdGhpcy5yYW5nZSArIHRoaXMubWluICkgLSB0aGlzLm9sZDtcclxuICAgICAgICAgICAgaWYobiA+PSB0aGlzLnN0ZXAgfHwgbiA8PSB0aGlzLnN0ZXApeyBcclxuICAgICAgICAgICAgICAgIG4gPSBNYXRoLmZsb29yKCBuIC8gdGhpcy5zdGVwICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBudXAgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9rZXlkb3duOiBmdW5jdGlvbiAoIGUgKSB7IHJldHVybiB0cnVlOyB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB2YWxpZGF0ZSAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG4gPSB0aGlzLmNbMl0udGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIGlmKCFpc05hTiggbiApKXsgXHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCBuICk7IFxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbHNlIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWUgKyAodGhpcy5pc0RlZyA/ICfCsCc6JycpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICAvL3RoaXMuY2xlYXJJbnB1dCgpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgIC8vIHNbMl0uYm9yZGVyID0gJzFweCBzb2xpZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICAgICAgICAgIHNbMl0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbGJhY2s7XHJcbiAgICAgICAgICAgICAgICBzWzVdLmJhY2tncm91bmQgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gc2Nyb2xsIG92ZXJcclxuICAgICAgICAgICAgICAgIC8vc1syXS5ib3JkZXIgPSAnMXB4IGRhc2hlZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICAgICAgICAgIHNbMl0uY29sb3IgPSB0aGlzLmNvbG9yUGx1cztcclxuICAgICAgICAgICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbGJhY2tvdmVyO1xyXG4gICAgICAgICAgICAgICAgc1s1XS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvclBsdXM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgIC8qIGNhc2UgMjogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggc29saWQgJyArIHRoaXMuY29sb3JzLmJvcmRlclNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggZGFzaGVkICcgKyB0aGlzLmZvbnRDb2xvcjsvL3RoaXMuY29sb3JzLmJvcmRlclNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggZGFzaGVkICcgKyB0aGlzLmNvbG9ycy5oaWRlO1xyXG4gICAgICAgICAgICBicmVhazsqL1xyXG5cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgICAgICBsZXQgd3cgPSBNYXRoLmZsb29yKCB0aGlzLnd3ICogKCggdGhpcy52YWx1ZSAtIHRoaXMubWluICkgLyB0aGlzLnJhbmdlICkpO1xyXG4gICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5tb2RlbCAhPT0gMykgdGhpcy5zWzVdLndpZHRoID0gd3cgKyAncHgnO1xyXG4gICAgICAgIGlmKHRoaXMuc1s2XSkgdGhpcy5zWzZdLmxlZnQgPSAoIHRoaXMuc2EgKyB3dyArIDMgKSArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZSArICh0aGlzLmlzRGVnID8gJ8KwJzonJyk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCB3ID0gdGhpcy5zYiAtIHRoaXMuc2M7XHJcbiAgICAgICAgdGhpcy53dyA9IHcgLSA2O1xyXG5cclxuICAgICAgICBsZXQgdHggPSB0aGlzLnNjO1xyXG4gICAgICAgIGlmKHRoaXMuaXNVSSB8fCAhdGhpcy5zaW1wbGUpIHR4ID0gdGhpcy5zYysxMDtcclxuICAgICAgICB0aGlzLnR4bCA9IHRoaXMudyAtIHR4ICsgMjtcclxuXHJcbiAgICAgICAgLy9sZXQgdHkgPSBNYXRoLmZsb29yKHRoaXMuaCAqIDAuNSkgLSA4O1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc1syXS53aWR0aCA9ICh0aGlzLnNjIC02ICkrICdweCc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gKHRoaXMudHhsICs0KSArICdweCc7XHJcbiAgICAgICAgLy9zWzJdLnRvcCA9IHR5ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzNdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbNV0ubGVmdCA9ICh0aGlzLnNhICsgMykgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRleHRJbnB1dCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgJyc7XHJcbiAgICAgICAgdGhpcy5wbGFjZUhvbGRlciA9IG8ucGxhY2VIb2xkZXIgfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMuYWxsd2F5ID0gby5hbGx3YXkgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lZGl0YWJsZSA9IG8uZWRpdCAhPT0gdW5kZWZpbmVkID8gby5lZGl0IDogdHJ1ZTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIGJnXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcnMuc2VsZWN0ICsgJzsgdG9wOjRweDsgd2lkdGg6MHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7JyApO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdoZWlnaHQ6JyArICh0aGlzLmgtNCkgKyAncHg7IGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLmlucHV0QmcgKyAnOyBib3JkZXJDb2xvcjonICsgdGhpcy5jb2xvcnMuaW5wdXRCb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gY3Vyc29yXHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6NHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7IHdpZHRoOjBweDsgYmFja2dyb3VuZDonK3RoaXMuZm9udENvbG9yKyc7JyApO1xyXG5cclxuICAgICAgICAvLyBmYWtlXHJcbiAgICAgICAgdGhpcy5jWzVdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZm9udC1zdHlsZTogaXRhbGljOyBjb2xvcjonK3RoaXMuY29sb3JzLmlucHV0SG9sZGVyKyc7JyApO1xyXG4gICAgICAgIGlmKCB0aGlzLnZhbHVlID09PSAnJyApIHRoaXMuY1s1XS50ZXh0Q29udGVudCA9IHRoaXMucGxhY2VIb2xkZXI7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuICAgICAgICBpZiggbC54ID49IHRoaXMuc2EgKSByZXR1cm4gJ3RleHQnO1xyXG4gICAgICAgIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZWRpdGFibGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZighdGhpcy5lZGl0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKCBuYW1lID09PSAndGV4dCcgKSB0aGlzLnNldElucHV0KCB0aGlzLmNbM10gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmVkaXRhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICAvL2xldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICAvL2lmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKXsgcmV0dXJuO31cclxuXHJcbiAgICAgICAgLy9pZiggbC54ID49IHRoaXMuc2EgKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIC8vZWxzZSB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICBsZXQgeCA9IDA7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGV4dCcgKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgeCA9IGUuY2xpZW50WCAtIHRoaXMuem9uZS54O1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy51cElucHV0KCB4IC0gdGhpcy5zYSAtMywgdGhpcy5pc0Rvd24gKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlbmRlciAoIGMsIGUsIHMgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS53aWR0aCA9ICcxcHgnO1xyXG4gICAgICAgIHRoaXMuc1s0XS5sZWZ0ID0gKHRoaXMuc2EgKyBjKzUpICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5zWzJdLmxlZnQgPSAodGhpcy5zYSArIGUrNSkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS53aWR0aCA9IHMrJ3B4JztcclxuICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3QgKCBjLCBlLCB3ICkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgZCA9IHRoaXMuc2EgKyA1O1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSAnMXB4JztcclxuICAgICAgICBzWzRdLmxlZnQgPSAoIGQgKyBjICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICggZCArIGUgKSArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgdW5zZWxlY3QgKCkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBpZighcykgcmV0dXJuO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAwICsgJ3B4JztcclxuICAgICAgICBzWzRdLndpZHRoID0gMCArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmFsbHdheSApIGZvcmNlID0gdHJ1ZTsgXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmNbM10udGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIGlmKHRoaXMudmFsdWUgIT09ICcnKSB0aGlzLmNbNV0udGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICBlbHNlIHRoaXMuY1s1XS50ZXh0Q29udGVudCA9IHRoaXMucGxhY2VIb2xkZXI7XHJcblxyXG4gICAgICAgIGlmKCAhZm9yY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFWklTRVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG5cclxuICAgICAgICBzWzVdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzVdLndpZHRoID0gdGhpcy5zYiArICdweCc7XHJcbiAgICAgXHJcbiAgICB9XHJcblxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRpdGxlIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIGxldCBwcmVmaXggPSBvLnByZWZpeCB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NjBweDsgbGluZS1oZWlnaHQ6JysgKHRoaXMuaC04KSArICdweDsgY29sb3I6JyArIHRoaXMuZm9udENvbG9yICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmggPT09IDMxICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5zWzFdLnRvcCA9IDggKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gOCArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHNbMV0udGV4dEFsaWduID0gby5hbGlnbiB8fCAnbGVmdCc7XHJcbiAgICAgICAgc1sxXS5mb250V2VpZ2h0ID0gby5mb250V2VpZ2h0IHx8ICdib2xkJztcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHRoaXMudHh0LnN1YnN0cmluZygwLDEpLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnR4dC5zdWJzdHJpbmcoMSkucmVwbGFjZShcIi1cIiwgXCIgXCIpO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHByZWZpeDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRleHQgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGV4dDIgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG4gICAgICAgIHRoaXMuc1sxXS53aWR0aCA9IHRoaXMudyArICdweCc7IC8vLSA1MCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmxlZnQgPSB0aGlzLncgKyAncHgnOy8vLSAoIDUwICsgMjYgKSArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgU2VsZWN0IGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm9uQWN0aWYgPSBvLm9uQWN0aWYgfHwgZnVuY3Rpb24oKXt9O1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uT3ZlciA9IG8uYk92ZXIgfHwgdGhpcy5jb2xvcnMub3ZlcjtcclxuICAgICAgICB0aGlzLmJ1dHRvbkRvd24gPSBvLmJEb3duIHx8IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICB0aGlzLmJ1dHRvbkFjdGlvbiA9IG8uYkFjdGlvbiB8fCB0aGlzLmNvbG9ycy5hY3Rpb247XHJcblxyXG4gICAgICAgIGxldCBwcmVmaXggPSBvLnByZWZpeCB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAnIHRvcDoxcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXI6Jyt0aGlzLmNvbG9ycy5idXR0b25Cb3JkZXIrJzsgYm9yZGVyLXJhZGl1czoxNXB4OyB3aWR0aDozMHB4OyBsZWZ0OjEwcHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1syXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdoZWlnaHQ6JyArICh0aGlzLmgtNCkgKyAncHg7IGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLmlucHV0QmcgKyAnOyBib3JkZXJDb2xvcjonICsgdGhpcy5jb2xvcnMuaW5wdXRCb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS03O1xyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxNHB4OyBoZWlnaHQ6MTRweDsgbGVmdDo1cHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzWyAnY3Vyc29yJyBdLCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdCA9IDE7XHJcbiAgICAgICAgdGhpcy5pc0FjdGlmID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG4gICAgICAgIGlmKCBsLnggPiB0aGlzLnNhICYmIGwueCA8IHRoaXMuc2ErMzAgKSByZXR1cm4gJ292ZXInO1xyXG4gICAgICAgIHJldHVybiAnMCdcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICAvL3RoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAvL3RoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1sgbmFtZS0yIF07XHJcbiAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHVwID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG4gICAgICAgIC8vbGV0IHNlbCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhuYW1lKVxyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ292ZXInICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlKCB0aGlzLmlzRG93biA/IDMgOiAyICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhcHBseSAoIHYgKSB7XHJcblxyXG4gICAgICAgIHYgPSB2IHx8ICcnO1xyXG5cclxuICAgICAgICBpZiggdiAhPT0gdGhpcy52YWx1ZSApIHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHY7XHJcbiAgICAgICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZSggMyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbiApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0ICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgICBpZiggbj09PTEgKSB0aGlzLmlzQWN0aWYgPSBmYWxzZTs7XHJcblxyXG4gICAgICAgICAgICBpZiggbj09PTMgKXsgXHJcbiAgICAgICAgICAgICAgICBpZiggIXRoaXMuaXNBY3RpZiApeyB0aGlzLmlzQWN0aWYgPSB0cnVlOyBuPTQ7IHRoaXMub25BY3RpZiggdGhpcyApOyB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHsgdGhpcy5pc0FjdGlmID0gZmFsc2U7IH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIG49PT0yICYmIHRoaXMuaXNBY3RpZiApIG4gPSA0O1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnN0YXQgPSAxOyB0aGlzLnNbIDIgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyAgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7IGJyZWFrOyAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdCA9IDI7IHRoaXMuc1sgMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIDIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25PdmVyOyBicmVhazsgLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXQgPSAzOyB0aGlzLnNbIDIgXS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uRG93bjsgYnJlYWs7IC8vIGRvd25cclxuICAgICAgICAgICAgICAgIGNhc2UgNDogdGhpcy5zdGF0ID0gNDsgdGhpcy5zWyAyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkFjdGlvbjsgYnJlYWs7IC8vIGFjdGlmXHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoIHRoaXMuaXNBY3RpZiA/IDQgOiAxICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRleHQgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSAodGhpcy5zYSArIDQwKSArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9ICh0aGlzLnNiIC0gNDApICsgJ3B4JztcclxuICAgICAgICBzWzRdLmxlZnQgPSAodGhpcy5zYSs4KSArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgU2VsZWN0b3IgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBvLnZhbHVlcztcclxuICAgICAgICBpZih0eXBlb2YgdGhpcy52YWx1ZXMgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZXMgPSBbIHRoaXMudmFsdWVzIF07XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8IHRoaXMudmFsdWVzWzBdO1xyXG5cclxuXHJcblxyXG4gICAgICAgIC8vdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuICAgICAgICB0aGlzLmJ1dHRvbk92ZXIgPSBvLmJPdmVyIHx8IHRoaXMuY29sb3JzLm92ZXI7XHJcbiAgICAgICAgdGhpcy5idXR0b25Eb3duID0gby5iRG93biB8fCB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZXMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMudG1wID0gW107XHJcbiAgICAgICAgdGhpcy5zdGF0ID0gW107XHJcblxyXG4gICAgICAgIGxldCBzZWw7XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrKXtcclxuXHJcbiAgICAgICAgICAgIHNlbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiggdGhpcy52YWx1ZXNbaV0gPT09IHRoaXMudmFsdWUgKSBzZWwgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jW2krMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLmJ1dHRvbiArICcgdG9wOjFweDsgYmFja2dyb3VuZDonKyhzZWw/IHRoaXMuYnV0dG9uRG93biA6IHRoaXMuYnV0dG9uQ29sb3IpKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXI6Jyt0aGlzLmNvbG9ycy5idXR0b25Cb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdLnN0eWxlLmNvbG9yID0gc2VsID8gdGhpcy5mb250U2VsZWN0IDogdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW2ldO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5zdGF0W2ldID0gc2VsID8gMzoxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgdCA9IHRoaXMudG1wO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICBcdGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpKzI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICAvL3RoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgXHRsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1sgbmFtZS0yIF07XHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICBcdHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gXHJcbiAgICAgICAgLy8gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHVwID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG4gICAgICAgIC8vbGV0IHNlbCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhuYW1lKVxyXG5cclxuICAgICAgICBpZiggbmFtZSAhPT0gJycgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBuYW1lICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZXMgKCBuLCBuYW1lICkge1xyXG5cclxuICAgICAgICBsZXQgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09PSBuYW1lLTIgJiYgdGhpcy52YWx1ZXNbIGkgXSAhPT0gdGhpcy52YWx1ZSApIHYgPSB0aGlzLm1vZGUoIG4sIGkrMiApO1xyXG4gICAgICAgICAgICBlbHNleyBcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy52YWx1ZXNbIGkgXSA9PT0gdGhpcy52YWx1ZSApIHYgPSB0aGlzLm1vZGUoIDMsIGkrMiApO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB2ID0gdGhpcy5tb2RlKCAxLCBpKzIgKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgaSA9IG5hbWUgLSAyO1xyXG5cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpXSAhPT0gbiApe1xyXG5cclxuICAgICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnN0YXRbaV0gPSAxOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7ICB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zdGF0W2ldID0gMjsgdGhpcy5zWyBpKzIgXS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25PdmVyOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0W2ldID0gMzsgdGhpcy5zWyBpKzIgXS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Eb3duOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgbGV0IHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy52YWx1ZXNbIGkgXSA9PT0gdGhpcy52YWx1ZSApIHYgPSB0aGlzLm1vZGUoIDMsIGkrMiApO1xyXG4gICAgICAgICAgICBlbHNlIHYgPSB0aGlzLm1vZGUoIDEsIGkrMiApO1xyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByOy8vdGhpcy5tb2RlcyggMSAsIDIgKTtcclxuXHJcbiAgICBcdC8qaWYoIHRoaXMuc2VsZWN0ZWQgKXtcclxuICAgIFx0XHR0aGlzLnNbIHRoaXMuc2VsZWN0ZWQgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnNbIHRoaXMuc2VsZWN0ZWQgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIFx0fVxyXG4gICAgICAgIHJldHVybiBmYWxzZTsqL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsYWJlbCAoIHN0cmluZywgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMjtcclxuICAgICAgICB0aGlzLmNbbl0udGV4dENvbnRlbnQgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGljb24gKCBzdHJpbmcsIHksIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5zW25dLnBhZGRpbmcgPSAoIHkgfHwgMCApICsncHggMHB4JztcclxuICAgICAgICB0aGlzLmNbbl0uaW5uZXJIVE1MID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7O1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgdyA9IHRoaXMuc2I7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLnNhO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIGxldCBkYyA9ICAzO1xyXG4gICAgICAgIGxldCBzaXplID0gTWF0aC5mbG9vciggKCB3LShkYyooaS0xKSkgKSAvIGkgKTtcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuXHJcbiAgICAgICAgXHR0aGlzLnRtcFtpXSA9IFsgTWF0aC5mbG9vciggZCArICggc2l6ZSAqIGkgKSArICggZGMgKiBpICkpLCBzaXplIF07XHJcbiAgICAgICAgXHR0aGlzLnRtcFtpXVsyXSA9IHRoaXMudG1wW2ldWzBdICsgdGhpcy50bXBbaV1bMV07XHJcbiAgICAgICAgICAgIHNbaSsyXS5sZWZ0ID0gdGhpcy50bXBbaV1bMF0gKyAncHgnO1xyXG4gICAgICAgICAgICBzW2krMl0ud2lkdGggPSB0aGlzLnRtcFtpXVsxXSArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBFbXB0eSBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuXHQgICAgby5zaW1wbGUgPSB0cnVlO1xyXG5cdCAgICBvLmlzU3BhY2UgPSB0cnVlO1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuICAgIFxyXG59XHJcbiIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgSXRlbSBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnAgPSAxMDA7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudHh0O1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5pdHlwZSA9IG8uaXR5cGUgfHwgJ25vbmUnO1xyXG4gICAgICAgIHRoaXMudmFsID0gdGhpcy5pdHlwZTtcclxuXHJcbiAgICAgICAgdGhpcy5ncmFwaCA9IHRoaXMuc3Znc1sgdGhpcy5pdHlwZSBdO1xyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTc7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxNHB4OyBoZWlnaHQ6MTRweDsgbGVmdDo1cHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5ncmFwaCwgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgICAgICB0aGlzLnNbMV0ubWFyZ2luTGVmdCA9IDIwICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcbiAgICAgICAgLy91cCA9IHRoaXMubW9kZXMoIHRoaXMuaXNEb3duID8gMyA6IDIsIG5hbWUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5yZXNldEl0ZW0oKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCggdHJ1ZSApO1xyXG5cclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3V0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMyk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3ZlciAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDQpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5tb2RlKDIpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCkge1xyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICAvKnJTaXplICgpIHtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgIH0qL1xyXG5cclxuICAgIG1vZGUgKCBuICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXR1cyAhPT0gbiApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBuO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdHVzID0gMTsgdGhpcy5zWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7IHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gJ25vbmUnOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zdGF0dXMgPSAyOyB0aGlzLnNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnT3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdHVzID0gMzsgdGhpcy5zWzFdLmNvbG9yID0gJyNGRkYnOyAgICAgICAgIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0OyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogdGhpcy5zdGF0dXMgPSA0OyB0aGlzLnNbMV0uY29sb3IgPSAnI0ZGRic7ICAgICAgICAgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgLy8gcmV0dXJuIHRoaXMubW9kZSggMSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RlZCAoIGIgKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZWxlY3QgPSBiIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSgzKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IG8udmFsdWVzIHx8IFtdO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIHRoaXMudmFsdWVzID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWVzID0gWyB0aGlzLnZhbHVlcyBdO1xyXG5cclxuICAgICAgICAvL3RoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcbiAgICAgICAgdGhpcy5idXR0b25PdmVyID0gby5iT3ZlciB8fCB0aGlzLmNvbG9ycy5vdmVyO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uRG93biA9IG8uYkRvd24gfHwgdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG5cclxuICAgICAgICB0aGlzLnNwYWNlcyA9IG8uc3BhY2VzIHx8IFsxMCwzXTtcclxuICAgICAgICB0aGlzLmJzaXplID0gby5ic2l6ZSB8fCBbMTAwLDIwXTtcclxuXHJcbiAgICAgICAgdGhpcy5ic2l6ZU1heCA9IHRoaXMuYnNpemVbMF07XHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZXMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMudG1wID0gW107XHJcbiAgICAgICAgdGhpcy5zdGF0ID0gW107XHJcbiAgICAgICAgdGhpcy5ncmlkID0gWyAyLCBNYXRoLnJvdW5kKCB0aGlzLmxuZyAqIDAuNSApIF07XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5ncmlkWzFdICogKCB0aGlzLmJzaXplWzFdICsgdGhpcy5zcGFjZXNbMV0gKSArIHRoaXMuc3BhY2VzWzFdO1xyXG5cclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSAnJztcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICd0YWJsZScsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IHRvcDonKyh0aGlzLnNwYWNlc1sxXS0yKSsncHg7IGhlaWdodDphdXRvOyBib3JkZXItY29sbGFwc2U6c2VwYXJhdGU7IGJvcmRlcjpub25lOyBib3JkZXItc3BhY2luZzogJysodGhpcy5zcGFjZXNbMF0tMikrJ3B4ICcrKHRoaXMuc3BhY2VzWzFdLTIpKydweDsnICk7XHJcblxyXG4gICAgICAgIGxldCBuID0gMCwgYiwgbWlkLCB0ZCwgdHI7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9ucyA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3RhdCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZFsxXTsgaSsrICl7XHJcbiAgICAgICAgICAgIHRyID0gdGhpcy5jWzJdLmluc2VydFJvdygpO1xyXG4gICAgICAgICAgICB0ci5zdHlsZS5jc3NUZXh0ID0gJ3BvaW50ZXItZXZlbnRzOm5vbmU7JztcclxuICAgICAgICAgICAgZm9yKCBsZXQgaiA9IDA7IGogPCB0aGlzLmdyaWRbMF07IGorKyApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRkID0gdHIuaW5zZXJ0Q2VsbCgpO1xyXG4gICAgICAgICAgICAgICAgdGQuc3R5bGUuY3NzVGV4dCA9ICdwb2ludGVyLWV2ZW50czpub25lOyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzW25dICl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuc3R5bGUuY3NzVGV4dCA9IHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLmJ1dHRvbiArICdwb3NpdGlvbjpzdGF0aWM7IHdpZHRoOicrdGhpcy5ic2l6ZVswXSsncHg7IGhlaWdodDonK3RoaXMuYnNpemVbMV0rJ3B4OyBib3JkZXI6Jyt0aGlzLmNvbG9ycy5idXR0b25Cb3JkZXIrJzsgbGVmdDphdXRvOyByaWdodDphdXRvOyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOyAgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuaW5uZXJIVE1MID0gdGhpcy52YWx1ZXNbbl07XHJcbiAgICAgICAgICAgICAgICAgICAgdGQuYXBwZW5kQ2hpbGQoIGIgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b25zLnB1c2goYik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0LnB1c2goMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICAgICAgICAgICAgICAgICAgYi5zdHlsZS5jc3NUZXh0ID0gdGhpcy5jc3MudHh0ICsgJ3Bvc2l0aW9uOnN0YXRpYzsgd2lkdGg6Jyt0aGlzLmJzaXplWzBdKydweDsgaGVpZ2h0OicrdGhpcy5ic2l6ZVsxXSsncHg7IHRleHQtYWxpZ246Y2VudGVyOyAgbGVmdDphdXRvOyByaWdodDphdXRvOyBiYWNrZ3JvdW5kOm5vbmU7JztcclxuICAgICAgICAgICAgICAgICAgICB0ZC5hcHBlbmRDaGlsZCggYiApO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihqPT09MCkgYi5zdHlsZS5jc3NUZXh0ICs9ICdmbG9hdDpyaWdodDsnO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBiLnN0eWxlLmNzc1RleHQgKz0gJ2Zsb2F0OmxlZnQ7JztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuKys7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAtMTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHggPSB0aGlzLnRtcFg7XHJcbiAgICAgICAgbGV0IHR5ID0gdGhpcy50bXBZO1xyXG5cclxuICAgICAgICBsZXQgaWQgPSAtMTtcclxuICAgICAgICBsZXQgYyA9IC0xO1xyXG4gICAgICAgIGxldCBsaW5lID0gLTE7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmdyaWRbMF07XHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgIFx0aWYoIGwueCA+IHR4W2ldWzBdICYmIGwueCA8IHR4W2ldWzFdICkgYyA9IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gdGhpcy5ncmlkWzFdO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaWYoIGwueSA+IHR5W2ldWzBdICYmIGwueSA8IHR5W2ldWzFdICkgbGluZSA9IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihjIT09LTEgJiYgbGluZSE9PS0xKXtcclxuICAgICAgICAgICAgaWQgPSBjICsgKGxpbmUqMik7XHJcbiAgICAgICAgICAgIGlmKGlkPnRoaXMubG5nLTEpIGlkID0gLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaWQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcbiAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICBcdGxldCBpZCA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIGlkIDwgMCApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbaWRdO1xyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgXHRyZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHVwID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBpZCA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIGlkICE9PSAtMSApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMubW9kZXMoIHRoaXMuaXNEb3duID8gMyA6IDIsIGlkICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZXMgKCBuLCBpZCApIHtcclxuXHJcbiAgICAgICAgbGV0IHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PT0gaWQgKSB2ID0gdGhpcy5tb2RlKCBuLCBpICk7XHJcbiAgICAgICAgICAgIGVsc2UgdiA9IHRoaXMubW9kZSggMSwgaSApO1xyXG5cclxuICAgICAgICAgICAgaWYodikgciA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBuLCBpZCApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgaSA9IGlkO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0W2ldICE9PSBuICl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0W2ldID0gMTsgdGhpcy5idXR0b25zWyBpIF0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgIHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zdGF0W2ldID0gMjsgdGhpcy5idXR0b25zWyBpIF0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbk92ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXRbaV0gPSAzOyB0aGlzLmJ1dHRvbnNbIGkgXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5idXR0b25zWyBpIF0uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uRG93bjsgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZXMoIDEgLCAwICk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGxhYmVsICggc3RyaW5nLCBuICkge1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbnNbbl0udGV4dENvbnRlbnQgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGljb24gKCBzdHJpbmcsIHksIG4gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uc1tuXS5zdHlsZS5wYWRkaW5nID0gKCB5IHx8IDAgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5idXR0b25zW25dLmlubmVySFRNTCA9IHN0cmluZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFcgKCkge1xyXG5cclxuICAgICAgICBsZXQgdncgPSB0aGlzLnNwYWNlc1swXSozICsgdGhpcy5ic2l6ZU1heCoyLCByeiA9IGZhbHNlO1xyXG4gICAgICAgIGlmKCB2dyA+IHRoaXMudyApIHtcclxuICAgICAgICAgICAgdGhpcy5ic2l6ZVswXSA9ICggdGhpcy53LSh0aGlzLnNwYWNlc1swXSozKSApICogMC41O1xyXG4gICAgICAgICAgICByeiA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIHRoaXMuYnNpemVbMF0gIT09IHRoaXMuYnNpemVNYXggKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJzaXplWzBdID0gdGhpcy5ic2l6ZU1heDtcclxuICAgICAgICAgICAgICAgIHJ6ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoICFyeiApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmJ1dHRvbnMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy5idXR0b25zW2ldLnN0eWxlLndpZHRoID0gdGhpcy5ic2l6ZVswXSArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXN0VygpO1xyXG5cclxuICAgICAgICBsZXQgbiA9IDAsIGIsIG1pZDtcclxuXHJcbiAgICAgICAgdGhpcy50bXBYID0gW107XHJcbiAgICAgICAgdGhpcy50bXBZID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGogPSAwOyBqIDwgdGhpcy5ncmlkWzBdOyBqKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKGo9PT0wKXtcclxuICAgICAgICAgICAgICAgIG1pZCA9ICggdGhpcy53KjAuNSApIC0gKCB0aGlzLnNwYWNlc1swXSowLjUgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudG1wWC5wdXNoKCBbIG1pZC10aGlzLmJzaXplWzBdLCBtaWQgXSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWlkID0gKCB0aGlzLncqMC41ICkgKyAoIHRoaXMuc3BhY2VzWzBdKjAuNSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50bXBYLnB1c2goIFsgbWlkLCBtaWQrdGhpcy5ic2l6ZVswXSBdICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtaWQgPSB0aGlzLnNwYWNlc1sxXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRbMV07IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy50bXBZLnB1c2goIFsgbWlkLCBtaWQgKyB0aGlzLmJzaXplWzFdIF0gKTtcclxuICAgICAgICAgICAgbWlkICs9IHRoaXMuYnNpemVbMV0gKyB0aGlzLnNwYWNlc1sxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJcclxuaW1wb3J0IHsgQm9vbCB9IGZyb20gJy4uL3Byb3RvL0Jvb2wuanMnO1xyXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9wcm90by9CdXR0b24uanMnO1xyXG5pbXBvcnQgeyBDaXJjdWxhciB9IGZyb20gJy4uL3Byb3RvL0NpcmN1bGFyLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi9wcm90by9Db2xvci5qcyc7XHJcbmltcG9ydCB7IEZwcyB9IGZyb20gJy4uL3Byb3RvL0Zwcy5qcyc7XHJcbmltcG9ydCB7IEdyYXBoIH0gZnJvbSAnLi4vcHJvdG8vR3JhcGguanMnO1xyXG5pbXBvcnQgeyBHcm91cCAgfSBmcm9tICcuLi9wcm90by9Hcm91cC5qcyc7XHJcbmltcG9ydCB7IEpveXN0aWNrIH0gZnJvbSAnLi4vcHJvdG8vSm95c3RpY2suanMnO1xyXG5pbXBvcnQgeyBLbm9iIH0gZnJvbSAnLi4vcHJvdG8vS25vYi5qcyc7XHJcbmltcG9ydCB7IExpc3QgfSBmcm9tICcuLi9wcm90by9MaXN0LmpzJztcclxuaW1wb3J0IHsgTnVtZXJpYyB9IGZyb20gJy4uL3Byb3RvL051bWVyaWMuanMnO1xyXG5pbXBvcnQgeyBTbGlkZSB9IGZyb20gJy4uL3Byb3RvL1NsaWRlLmpzJztcclxuaW1wb3J0IHsgVGV4dElucHV0IH0gZnJvbSAnLi4vcHJvdG8vVGV4dElucHV0LmpzJztcclxuaW1wb3J0IHsgVGl0bGUgfSBmcm9tICcuLi9wcm90by9UaXRsZS5qcyc7XHJcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL3Byb3RvL1NlbGVjdC5qcyc7XHJcbmltcG9ydCB7IFNlbGVjdG9yIH0gZnJvbSAnLi4vcHJvdG8vU2VsZWN0b3IuanMnO1xyXG5pbXBvcnQgeyBFbXB0eSB9IGZyb20gJy4uL3Byb3RvL0VtcHR5LmpzJztcclxuaW1wb3J0IHsgSXRlbSB9IGZyb20gJy4uL3Byb3RvL0l0ZW0uanMnO1xyXG5pbXBvcnQgeyBHcmlkIH0gZnJvbSAnLi4vcHJvdG8vR3JpZC5qcyc7XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IGFkZCA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBhcmd1bWVudHM7IFxyXG5cclxuICAgICAgICBsZXQgdHlwZSwgbywgcmVmID0gZmFsc2UsIG4gPSBudWxsO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIGFbMF0gPT09ICdzdHJpbmcnICl7IFxyXG5cclxuICAgICAgICAgICAgdHlwZSA9IGFbMF07XHJcbiAgICAgICAgICAgIG8gPSBhWzFdIHx8IHt9O1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2YgYVswXSA9PT0gJ29iamVjdCcgKXsgLy8gbGlrZSBkYXQgZ3VpXHJcblxyXG4gICAgICAgICAgICByZWYgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHt9KTtcclxuXHJcbiAgICAgICAgICAgIHR5cGUgPSBhWzJdLnR5cGUgPyBhWzJdLnR5cGUgOiAnc2xpZGUnOy8vYXV0b1R5cGUuYXBwbHkoIHRoaXMsIGEgKTtcclxuXHJcbiAgICAgICAgICAgIG8gPSBhWzJdO1xyXG4gICAgICAgICAgICBvLm5hbWUgPSBhWzFdO1xyXG4gICAgICAgICAgICBvLnZhbHVlID0gYVswXVthWzFdXTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdncm91cCcgKSBvLmFkZCA9IGFkZDtcclxuXHJcbiAgICAgICAgc3dpdGNoKCBuYW1lICl7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdib29sJzogbiA9IG5ldyBCb29sKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYnV0dG9uJzogbiA9IG5ldyBCdXR0b24obyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjaXJjdWxhcic6IG4gPSBuZXcgQ2lyY3VsYXIobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjb2xvcic6IG4gPSBuZXcgQ29sb3Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdmcHMnOiBuID0gbmV3IEZwcyhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dyYXBoJzogbiA9IG5ldyBHcmFwaChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dyb3VwJzogbiA9IG5ldyBHcm91cChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2pveXN0aWNrJzogbiA9IG5ldyBKb3lzdGljayhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2tub2InOiBuID0gbmV3IEtub2Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsaXN0JzogbiA9IG5ldyBMaXN0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbnVtZXJpYyc6IGNhc2UgJ251bWJlcic6IG4gPSBuZXcgTnVtZXJpYyhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NsaWRlJzogbiA9IG5ldyBTbGlkZShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RleHRJbnB1dCc6IGNhc2UgJ3N0cmluZyc6IG4gPSBuZXcgVGV4dElucHV0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAndGl0bGUnOiBuID0gbmV3IFRpdGxlKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzogbiA9IG5ldyBTZWxlY3Qobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzZWxlY3Rvcic6IG4gPSBuZXcgU2VsZWN0b3Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdlbXB0eSc6IGNhc2UgJ3NwYWNlJzogbiA9IG5ldyBFbXB0eShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2l0ZW0nOiBuID0gbmV3IEl0ZW0obyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdncmlkJzogbiA9IG5ldyBHcmlkKG8pOyBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbiAhPT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgaWYoIHJlZiApIG4uc2V0UmVmZXJlbmN5KCBhWzBdLCBhWzFdICk7XHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG5cclxuICAgICAgICB9XHJcblxyXG59IiwiXHJcbmltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi9Sb290cyc7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi9Ub29scyc7XHJcbmltcG9ydCB7IGFkZCB9IGZyb20gJy4vYWRkJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuL1YyJztcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBHdWkge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gY29sb3JcclxuICAgICAgICB0aGlzLmNvbG9ycyA9IFRvb2xzLmNsb25lQ29sb3IoKTtcclxuICAgICAgICB0aGlzLmNzcyA9IFRvb2xzLmNsb25lQ3NzKCk7XHJcblxyXG5cclxuICAgICAgICBpZiggby5jb25maWcgKSB0aGlzLnNldENvbmZpZyggby5jb25maWcgKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuYmcgPSBvLmJnIHx8IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7XHJcblxyXG4gICAgICAgIGlmKCBvLnRyYW5zcGFyZW50ICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgdGhpcy5jb2xvcnMuYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgICAgICAgICAgdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXIgPSAnbm9uZSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2lmKCBvLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayA9ICBvLmNhbGxiYWNrO1xyXG5cclxuICAgICAgICB0aGlzLmlzUmVzZXQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnRtcEFkZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50bXBIID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5pc0NhbnZhcyA9IG8uaXNDYW52YXMgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc0NhbnZhc09ubHkgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNzc0d1aSA9IG8uY3NzICE9PSB1bmRlZmluZWQgPyBvLmNzcyA6ICcnO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBvLmNhbGxiYWNrICA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG8uY2FsbGJhY2s7XHJcblxyXG4gICAgICAgIHRoaXMuZm9yY2VIZWlnaHQgPSBvLm1heEhlaWdodCB8fCAwO1xyXG4gICAgICAgIHRoaXMubG9ja0hlaWdodCA9IG8ubG9ja0hlaWdodCB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0l0ZW1Nb2RlID0gby5pdGVtTW9kZSAhPT0gdW5kZWZpbmVkID8gby5pdGVtTW9kZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmNuID0gJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gc2l6ZSBkZWZpbmVcclxuICAgICAgICB0aGlzLnNpemUgPSBUb29scy5zaXplO1xyXG4gICAgICAgIGlmKCBvLnAgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS5wID0gby5wO1xyXG4gICAgICAgIGlmKCBvLncgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS53ID0gby53O1xyXG4gICAgICAgIGlmKCBvLmggIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS5oID0gby5oO1xyXG4gICAgICAgIGlmKCBvLnMgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS5zID0gby5zO1xyXG5cclxuICAgICAgICB0aGlzLnNpemUuaCA9IHRoaXMuc2l6ZS5oIDwgMTEgPyAxMSA6IHRoaXMuc2l6ZS5oO1xyXG5cclxuICAgICAgICAvLyBsb2NhbCBtb3VzZSBhbmQgem9uZVxyXG4gICAgICAgIHRoaXMubG9jYWwgPSBuZXcgVjIoKS5uZWcoKTtcclxuICAgICAgICB0aGlzLnpvbmUgPSB7IHg6MCwgeTowLCB3OnRoaXMuc2l6ZS53LCBoOjAgfTtcclxuXHJcbiAgICAgICAgLy8gdmlydHVhbCBtb3VzZVxyXG4gICAgICAgIHRoaXMubW91c2UgPSBuZXcgVjIoKS5uZWcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gMDtcclxuICAgICAgICB0aGlzLnByZXZZID0gLTE7XHJcbiAgICAgICAgdGhpcy5zdyA9IDA7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvLyBib3R0b20gYW5kIGNsb3NlIGhlaWdodFxyXG4gICAgICAgIHRoaXMuaXNXaXRoQ2xvc2UgPSBvLmNsb3NlICE9PSB1bmRlZmluZWQgPyBvLmNsb3NlIDogdHJ1ZTtcclxuICAgICAgICB0aGlzLmJoID0gIXRoaXMuaXNXaXRoQ2xvc2UgPyAwIDogdGhpcy5zaXplLmg7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1Jlc2l6ZSA9IG8uYXV0b1Jlc2l6ZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IG8uYXV0b1Jlc2l6ZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlzQ2VudGVyID0gby5jZW50ZXIgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1Njcm9sbCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnVpcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5kZWNhbCA9IDA7XHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IDE7XHJcbiAgICAgICAgdGhpcy5veSA9IDA7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5pc05ld1RhcmdldCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgd2lkdGg6MHB4OyBoZWlnaHQ6YXV0bzsgdG9wOjBweDsgJyArIHRoaXMuY3NzR3VpICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5uZXJDb250ZW50ID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgdG9wOjA7IGxlZnQ6MDsgaGVpZ2h0OmF1dG87IG92ZXJmbG93OmhpZGRlbjsnKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuaW5uZXJDb250ZW50ICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5uZXIgPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBsZWZ0OjA7ICcpO1xyXG4gICAgICAgIHRoaXMuaW5uZXJDb250ZW50LmFwcGVuZENoaWxkKHRoaXMuaW5uZXIpO1xyXG5cclxuICAgICAgICAvLyBzY3JvbGxcclxuICAgICAgICB0aGlzLnNjcm9sbEJHID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncmlnaHQ6MDsgdG9wOjA7IHdpZHRoOicrICh0aGlzLnNpemUucyAtIDEpICsncHg7IGhlaWdodDoxMHB4OyBkaXNwbGF5Om5vbmU7IGJhY2tncm91bmQ6Jyt0aGlzLmJnKyc7Jyk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbEJHICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYmFja2dyb3VuZDonK3RoaXMuY29sb3JzLnNjcm9sbCsnOyByaWdodDoycHg7IHRvcDowOyB3aWR0aDonKyh0aGlzLnNpemUucy00KSsncHg7IGhlaWdodDoxMHB4OycpO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsQkcuYXBwZW5kQ2hpbGQoIHRoaXMuc2Nyb2xsICk7XHJcblxyXG4gICAgICAgIC8vIGJvdHRvbSBidXR0b25cclxuXHJcbiAgICAgICAgbGV0IHIgPSBvLnJhZGl1cyB8fCB0aGlzLmNvbG9ycy5yYWRpdXM7XHJcbiAgICAgICAgdGhpcy5ib3R0b20gPSBUb29scy5kb20oICdkaXYnLCAgdGhpcy5jc3MudHh0ICsgJ3dpZHRoOjEwMCU7IHRvcDphdXRvOyBib3R0b206MDsgbGVmdDowOyBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czonK3IrJ3B4OyAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czonK3IrJ3B4OyB0ZXh0LWFsaWduOmNlbnRlcjsgaGVpZ2h0OicrdGhpcy5iaCsncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuYmgtNSkrJ3B4OycpOy8vIGJvcmRlci10b3A6MXB4IHNvbGlkICcrVG9vbHMuY29sb3JzLnN0cm9rZSsnOycpO1xyXG4gICAgICAgIHRoaXMuY29udGVudC5hcHBlbmRDaGlsZCggdGhpcy5ib3R0b20gKTtcclxuICAgICAgICB0aGlzLmJvdHRvbS50ZXh0Q29udGVudCA9ICdDbG9zZSc7XHJcbiAgICAgICAgdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcblxyXG4gICAgICAgIC8vXHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gby5wYXJlbnQgIT09IHVuZGVmaW5lZCA/IG8ucGFyZW50IDogbnVsbDtcclxuICAgICAgICB0aGlzLnBhcmVudCA9IG8udGFyZ2V0ICE9PSB1bmRlZmluZWQgPyBvLnRhcmdldCA6IHRoaXMucGFyZW50O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLnBhcmVudCA9PT0gbnVsbCAmJiAhdGhpcy5pc0NhbnZhcyApeyBcclxuICAgICAgICBcdHRoaXMucGFyZW50ID0gZG9jdW1lbnQuYm9keTtcclxuICAgICAgICAgICAgLy8gZGVmYXVsdCBwb3NpdGlvblxyXG4gICAgICAgIFx0aWYoICF0aGlzLmlzQ2VudGVyICkgdGhpcy5jb250ZW50LnN0eWxlLnJpZ2h0ID0gJzEwcHgnOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnBhcmVudCAhPT0gbnVsbCApIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKCB0aGlzLmNvbnRlbnQgKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNDYW52YXMgJiYgdGhpcy5wYXJlbnQgPT09IG51bGwgKSB0aGlzLmlzQ2FudmFzT25seSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0NhbnZhc09ubHkgKSB0aGlzLmNvbnRlbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuXHJcblxyXG4gICAgICAgIHRoaXMuc2V0V2lkdGgoKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNDYW52YXMgKSB0aGlzLm1ha2VDYW52YXMoKTtcclxuXHJcbiAgICAgICAgUm9vdHMuYWRkKCB0aGlzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFRvcCAoIHQsIGggKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS50b3AgPSB0ICsgJ3B4JztcclxuICAgICAgICBpZiggaCAhPT0gdW5kZWZpbmVkICkgdGhpcy5mb3JjZUhlaWdodCA9IGg7XHJcbiAgICAgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHt9LFxyXG5cclxuICAgIGRpc3Bvc2UgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICAgICAgaWYoIHRoaXMucGFyZW50ICE9PSBudWxsICkgdGhpcy5wYXJlbnQucmVtb3ZlQ2hpbGQoIHRoaXMuY29udGVudCApO1xyXG4gICAgICAgIFJvb3RzLnJlbW92ZSggdGhpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENBTlZBU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9uRHJhdyAoKSB7fVxyXG5cclxuICAgIG1ha2VDYW52YXMgKCkge1xyXG5cclxuICAgIFx0dGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgXCJjYW52YXNcIiApO1xyXG4gICAgXHR0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuem9uZS53O1xyXG4gICAgXHR0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmZvcmNlSGVpZ2h0ID8gdGhpcy5mb3JjZUhlaWdodCA6IHRoaXMuem9uZS5oO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkcmF3ICggZm9yY2UgKSB7XHJcblxyXG4gICAgXHRpZiggdGhpcy5jYW52YXMgPT09IG51bGwgKSByZXR1cm47XHJcblxyXG4gICAgXHRsZXQgdyA9IHRoaXMuem9uZS53O1xyXG4gICAgXHRsZXQgaCA9IHRoaXMuZm9yY2VIZWlnaHQgPyB0aGlzLmZvcmNlSGVpZ2h0IDogdGhpcy56b25lLmg7XHJcbiAgICBcdFJvb3RzLnRvQ2FudmFzKCB0aGlzLCB3LCBoLCBmb3JjZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLy8vLy9cclxuXHJcbiAgICBnZXREb20gKCkge1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRNb3VzZSAoIG0gKSB7XHJcblxyXG4gICAgICAgIHRoaXMubW91c2Uuc2V0KCBtLngsIG0ueSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRDb25maWcgKCBvICkge1xyXG5cclxuICAgICAgICB0aGlzLnNldENvbG9ycyggbyApO1xyXG4gICAgICAgIHRoaXMuc2V0VGV4dCggby5mb250U2l6ZSwgby50ZXh0LCBvLmZvbnQsIG8uc2hhZG93ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldENvbG9ycyAoIG8gKSB7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGMgaW4gbyApe1xyXG4gICAgICAgICAgICBpZiggdGhpcy5jb2xvcnNbY10gKSB0aGlzLmNvbG9yc1tjXSA9IG9bY107XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRUZXh0ICggc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdyApIHtcclxuXHJcbiAgICAgICAgVG9vbHMuc2V0VGV4dCggc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdywgdGhpcy5jb2xvcnMsIHRoaXMuY3NzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGhpZGUgKCBiICkge1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnQuc3R5bGUuZGlzcGxheSA9IGIgPyAnbm9uZScgOiAnYmxvY2snO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG9uQ2hhbmdlICggZiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGYgfHwgbnVsbDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBTVFlMRVNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb2RlICggbiApIHtcclxuXHJcbiAgICBcdGxldCBuZWVkQ2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgXHRpZiggbiAhPT0gdGhpcy5jbiApe1xyXG5cclxuXHQgICAgXHR0aGlzLmNuID0gbjtcclxuXHJcblx0ICAgIFx0c3dpdGNoKCBuICl7XHJcblxyXG5cdCAgICBcdFx0Y2FzZSAnZGVmJzogXHJcblx0ICAgIFx0XHQgICB0aGlzLnNjcm9sbC5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2Nyb2xsOyBcclxuXHQgICAgXHRcdCAgIHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kO1xyXG5cdCAgICBcdFx0ICAgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSB0aGlzLmNvbG9ycy50ZXh0O1xyXG5cdCAgICBcdFx0YnJlYWs7XHJcblxyXG5cdCAgICBcdFx0Ly9jYXNlICdzY3JvbGxEZWYnOiB0aGlzLnNjcm9sbC5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2Nyb2xsOyBicmVhaztcclxuXHQgICAgXHRcdGNhc2UgJ3Njcm9sbE92ZXInOiB0aGlzLnNjcm9sbC5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0OyBicmVhaztcclxuXHQgICAgXHRcdGNhc2UgJ3Njcm9sbERvd24nOiB0aGlzLnNjcm9sbC5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuZG93bjsgYnJlYWs7XHJcblxyXG5cdCAgICBcdFx0Ly9jYXNlICdib3R0b21EZWYnOiB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDsgYnJlYWs7XHJcblx0ICAgIFx0XHRjYXNlICdib3R0b21PdmVyJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmRPdmVyOyB0aGlzLmJvdHRvbS5zdHlsZS5jb2xvciA9ICcjRkZGJzsgYnJlYWs7XHJcblx0ICAgIFx0XHQvL2Nhc2UgJ2JvdHRvbURvd24nOiB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0OyB0aGlzLmJvdHRvbS5zdHlsZS5jb2xvciA9ICcjMDAwJzsgYnJlYWs7XHJcblxyXG5cdCAgICBcdH1cclxuXHJcblx0ICAgIFx0bmVlZENoYW5nZSA9IHRydWU7XHJcblxyXG5cdCAgICB9XHJcblxyXG4gICAgXHRyZXR1cm4gbmVlZENoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBUQVJHRVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjbGVhclRhcmdldCAoKSB7XHJcblxyXG4gICAgXHRpZiggdGhpcy5jdXJyZW50ID09PSAtMSApIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvL2lmKCF0aGlzLnRhcmdldCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnVpb3V0KCk7XHJcbiAgICAgICAgdGhpcy50YXJnZXQucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcblxyXG4gICAgICAgIC8vL2NvbnNvbGUubG9nKHRoaXMuaXNEb3duKS8vaWYodGhpcy5pc0Rvd24pUm9vdHMuY2xlYXJJbnB1dCgpO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgUm9vdHMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgWk9ORSBURVNUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgdGhpcy5pc1Jlc2V0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5pc1Njcm9sbCA/ICB0aGlzLnpvbmUudyAgLSB0aGlzLnNpemUucyA6IHRoaXMuem9uZS53O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCBsLnkgPiB0aGlzLnpvbmUuaCAtIHRoaXMuYmggJiYgIGwueSA8IHRoaXMuem9uZS5oICkgbmFtZSA9ICdib3R0b20nO1xyXG4gICAgICAgIGVsc2UgbmFtZSA9IGwueCA+IHMgPyAnc2Nyb2xsJyA6ICdjb250ZW50JztcclxuXHJcbiAgICAgICAgcmV0dXJuIG5hbWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaGFuZGxlRXZlbnQgKCBlICkge1xyXG5cclxuICAgIFx0bGV0IHR5cGUgPSBlLnR5cGU7XHJcblxyXG4gICAgXHRsZXQgY2hhbmdlID0gZmFsc2U7XHJcbiAgICBcdGxldCB0YXJnZXRDaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICBcdGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICBcdGlmKCB0eXBlID09PSAnbW91c2V1cCcgJiYgdGhpcy5pc0Rvd24gKSB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgXHRpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgJiYgIXRoaXMuaXNEb3duICkgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gJiYgdGhpcy5pc05ld1RhcmdldCApeyBSb290cy5jbGVhcklucHV0KCk7IHRoaXMuaXNOZXdUYXJnZXQ9ZmFsc2U7IH1cclxuXHJcbiAgICBcdGlmKCAhbmFtZSApIHJldHVybjtcclxuXHJcbiAgICBcdHN3aXRjaCggbmFtZSApe1xyXG5cclxuICAgIFx0XHRjYXNlICdjb250ZW50JzpcclxuXHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFkgPSB0aGlzLmlzU2Nyb2xsID8gIGUuY2xpZW50WSArIHRoaXMuZGVjYWwgOiBlLmNsaWVudFk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIFJvb3RzLmlzTW9iaWxlICYmIHR5cGUgPT09ICdtb3VzZWRvd24nICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKTtcclxuXHJcblx0ICAgIFx0XHRpZiggdGhpcy50YXJnZXQgKSB0YXJnZXRDaGFuZ2UgPSB0aGlzLnRhcmdldC5oYW5kbGVFdmVudCggZSApO1xyXG5cclxuXHQgICAgXHRcdGlmKCB0eXBlID09PSAnbW91c2Vtb3ZlJyApIGNoYW5nZSA9IHRoaXMubW9kZSgnZGVmJyk7XHJcbiAgICAgICAgICAgICAgICBpZiggdHlwZSA9PT0gJ3doZWVsJyAmJiAhdGFyZ2V0Q2hhbmdlICYmIHRoaXMuaXNTY3JvbGwgKSBjaGFuZ2UgPSB0aGlzLm9uV2hlZWwoIGUgKTtcclxuICAgICAgICAgICAgICAgXHJcblx0ICAgIFx0XHRpZiggIVJvb3RzLmxvY2sgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICBcdFx0YnJlYWs7XHJcbiAgICBcdFx0Y2FzZSAnYm90dG9tJzpcclxuXHJcblx0ICAgIFx0XHR0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlbW92ZScgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ2JvdHRvbU92ZXInKTtcclxuXHQgICAgXHRcdGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyApIHtcclxuXHQgICAgXHRcdFx0dGhpcy5pc09wZW4gPSB0aGlzLmlzT3BlbiA/IGZhbHNlIDogdHJ1ZTtcclxuXHRcdCAgICAgICAgICAgIHRoaXMuYm90dG9tLnRleHRDb250ZW50ID0gdGhpcy5pc09wZW4gPyAnQ2xvc2UnIDogJ09wZW4nO1xyXG5cdFx0ICAgICAgICAgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHRcdCAgICAgICAgICAgIHRoaXMubW9kZSgnZGVmJyk7XHJcblx0XHQgICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cdCAgICBcdFx0fVxyXG5cclxuICAgIFx0XHRicmVhaztcclxuICAgIFx0XHRjYXNlICdzY3JvbGwnOlxyXG5cclxuXHQgICAgXHRcdHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHQgICAgXHRcdGlmKCB0eXBlID09PSAnbW91c2Vtb3ZlJyApIGNoYW5nZSA9IHRoaXMubW9kZSgnc2Nyb2xsT3ZlcicpO1xyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZWRvd24nICkgY2hhbmdlID0gdGhpcy5tb2RlKCdzY3JvbGxEb3duJyk7IFxyXG4gICAgICAgICAgICAgICAgaWYoIHR5cGUgPT09ICd3aGVlbCcgKSBjaGFuZ2UgPSB0aGlzLm9uV2hlZWwoIGUgKTsgXHJcblx0ICAgIFx0XHRpZiggdGhpcy5pc0Rvd24gKSB0aGlzLnVwZGF0ZSggKGUuY2xpZW50WS10aGlzLnpvbmUueSktKHRoaXMuc2gqMC41KSApO1xyXG5cclxuICAgIFx0XHRicmVhaztcclxuXHJcblxyXG4gICAgXHR9XHJcblxyXG4gICAgXHRpZiggdGhpcy5pc0Rvd24gKSBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgXHRpZiggdGFyZ2V0Q2hhbmdlICkgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIHR5cGUgPT09ICdrZXl1cCcgKSBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIGlmKCB0eXBlID09PSAna2V5ZG93bicgKSBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgIFx0aWYoIGNoYW5nZSApIHRoaXMuZHJhdygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXROZXh0ICggZSwgY2hhbmdlICkge1xyXG5cclxuXHJcblxyXG4gICAgICAgIGxldCBuZXh0ID0gUm9vdHMuZmluZFRhcmdldCggdGhpcy51aXMsIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IHRoaXMuY3VycmVudCApe1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzTmV3VGFyZ2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gLTEgKXsgXHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy51aXNbIHRoaXMuY3VycmVudCBdO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC51aW92ZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG9uV2hlZWwgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLm95ICs9IDIwKmUuZGVsdGE7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoIHRoaXMub3kgKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVNFVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzUmVzZXQgKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vdGhpcy5yZXNldEl0ZW0oKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3VzZS5uZWcoKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL1Jvb3RzLmNsZWFySW5wdXQoKTtcclxuICAgICAgICBsZXQgciA9IHRoaXMubW9kZSgnZGVmJyk7XHJcbiAgICAgICAgbGV0IHIyID0gdGhpcy5jbGVhclRhcmdldCgpO1xyXG5cclxuICAgICAgICBpZiggciB8fCByMiApIHRoaXMuZHJhdyggdHJ1ZSApO1xyXG5cclxuICAgICAgICB0aGlzLmlzUmVzZXQgPSB0cnVlO1xyXG5cclxuICAgICAgICAvL1Jvb3RzLmxvY2sgPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBBREQgTk9ERVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFkZCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICBsZXQgb250b3AgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiBhWzFdID09PSAnb2JqZWN0JyApeyBcclxuXHJcbiAgICAgICAgICAgIGFbMV0uaXNVSSA9IHRydWU7XHJcbiAgICAgICAgICAgIGFbMV0ubWFpbiA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBvbnRvcCA9IGFbMV0ub250b3AgPyBhWzFdLm9udG9wIDogZmFsc2U7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGFbMV0gPT09ICdzdHJpbmcnICl7XHJcblxyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHsgaXNVSTp0cnVlLCBtYWluOnRoaXMgfSk7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYVsyXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGFbMl0ubWFpbiA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAgICAgb250b3AgPSBhWzFdLm9udG9wID8gYVsxXS5vbnRvcCA6IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIGxldCB1ID0gYWRkLmFwcGx5KCB0aGlzLCBhICk7XHJcblxyXG4gICAgICAgIGlmKCB1ID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZihvbnRvcCkgdGhpcy51aXMudW5zaGlmdCggdSApO1xyXG4gICAgICAgIGVsc2UgdGhpcy51aXMucHVzaCggdSApO1xyXG5cclxuICAgICAgICBpZiggIXUuYXV0b1dpZHRoICl7XHJcbiAgICAgICAgICAgIGxldCB5ID0gdS5jWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICAgICAgaWYoIHRoaXMucHJldlkgIT09IHkgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FsYyggdS5oICsgMSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2WSA9IHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5wcmV2WSA9IDA7Ly8tMTtcclxuICAgICAgICAgICAgdGhpcy5jYWxjKCB1LmggKyAxICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzRW1wdHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5Q2FsYyAoKSB7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy51aXMubGVuZ3RoLCB0aGlzLnRtcEggKVxyXG5cclxuICAgICAgICB0aGlzLmNhbGMoIHRoaXMudG1wSCApO1xyXG4gICAgICAgIC8vdGhpcy50bXBIID0gMDtcclxuICAgICAgICB0aGlzLnRtcEFkZCA9IG51bGw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVaXMgKCkge1xyXG5cclxuICAgICAgICBSb290cy5jYWxjVWlzKCB0aGlzLnVpcywgdGhpcy56b25lLCB0aGlzLnpvbmUueSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgb25lIG5vZGVcclxuXHJcbiAgICByZW1vdmUgKCBuICkge1xyXG5cclxuICAgICAgICBpZiggbi5jbGVhciApIG4uY2xlYXIoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FsbCBhZnRlciB1aXMgY2xlYXJcclxuXHJcbiAgICBjbGVhck9uZSAoIG4gKSB7IFxyXG5cclxuICAgICAgICBsZXQgaWQgPSB0aGlzLnVpcy5pbmRleE9mKCBuICk7IFxyXG4gICAgICAgIGlmICggaWQgIT09IC0xICkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGMoIC0gKHRoaXMudWlzWyBpZCBdLmggKyAxICkgKTtcclxuICAgICAgICAgICAgdGhpcy5pbm5lci5yZW1vdmVDaGlsZCggdGhpcy51aXNbIGlkIF0uY1swXSApO1xyXG4gICAgICAgICAgICB0aGlzLnVpcy5zcGxpY2UoIGlkLCAxICk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYXIgYWxsIGd1aVxyXG5cclxuICAgIGVtcHR5ICgpIHtcclxuXHJcbiAgICAgICAgLy90aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoLCBpdGVtO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLnVpcy5wb3AoKTtcclxuICAgICAgICAgICAgdGhpcy5pbm5lci5yZW1vdmVDaGlsZCggaXRlbS5jWzBdICk7XHJcbiAgICAgICAgICAgIGl0ZW0uY2xlYXIoIHRydWUgKTtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy51aXNbaV0uY2xlYXIoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gdHJ1ZTtcclxuICAgICAgICAvL1Jvb3RzLmxpc3RlbnMgPSBbXTtcclxuICAgICAgICB0aGlzLmNhbGMoIC10aGlzLmggKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmVtcHR5KCk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcblxyXG4gICAgICAgIC8qbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoIGktLSApIHRoaXMudWlzW2ldLmNsZWFyKCk7XHJcblxyXG4gICAgICAgIHRoaXMudWlzID0gW107XHJcbiAgICAgICAgUm9vdHMubGlzdGVucyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGMoIC10aGlzLmggKTsqL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElURU1TIFNQRUNJQUxcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgcmVzZXRJdGVtICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzSXRlbU1vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy51aXNbaV0uc2VsZWN0ZWQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0SXRlbSAoIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0l0ZW1Nb2RlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5yZXNldEl0ZW0oKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICl7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKDApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnVpc1tpXS52YWx1ZSA9PT0gbmFtZSApeyBcclxuICAgICAgICAgICAgICAgIHRoaXMudWlzW2ldLnNlbGVjdGVkKCB0cnVlICk7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc1Njcm9sbCApIHRoaXMudXBkYXRlKCAoIGkqKHRoaXMudWlzW2ldLmgrMSkgKSp0aGlzLnJhdGlvICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBTQ1JPTExcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB1cFNjcm9sbCAoIGIgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc3cgPSBiID8gdGhpcy5zaXplLnMgOiAwO1xyXG4gICAgICAgIHRoaXMub3kgPSBiID8gdGhpcy5veSA6IDA7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxCRy5zdHlsZS5kaXNwbGF5ID0gYiA/ICdibG9jaycgOiAnbm9uZSc7XHJcblxyXG4gICAgICAgIGlmKCBiICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRvdGFsID0gdGhpcy5oO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tYXhWaWV3ID0gdGhpcy5tYXhIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhdGlvID0gdGhpcy5tYXhWaWV3IC8gdGhpcy50b3RhbDtcclxuICAgICAgICAgICAgdGhpcy5zaCA9IHRoaXMubWF4VmlldyAqIHRoaXMucmF0aW87XHJcblxyXG4gICAgICAgICAgICAvL2lmKCB0aGlzLnNoIDwgMjAgKSB0aGlzLnNoID0gMjA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXhWaWV3IC0gdGhpcy5zaDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub3kgPSBUb29scy5jbGFtcCggdGhpcy5veSwgMCwgdGhpcy5yYW5nZSApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxCRy5zdHlsZS5oZWlnaHQgPSB0aGlzLm1heFZpZXcgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbC5zdHlsZS5oZWlnaHQgPSB0aGlzLnNoICsgJ3B4JztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNldEl0ZW1XaWR0aCggdGhpcy56b25lLncgLSB0aGlzLnN3ICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoIHRoaXMub3kgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggeSApIHtcclxuXHJcbiAgICAgICAgeSA9IFRvb2xzLmNsYW1wKCB5LCAwLCB0aGlzLnJhbmdlICk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVjYWwgPSBNYXRoLmZsb29yKCB5IC8gdGhpcy5yYXRpbyApO1xyXG4gICAgICAgIHRoaXMuaW5uZXIuc3R5bGUudG9wID0gLSB0aGlzLmRlY2FsICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNjcm9sbC5zdHlsZS50b3AgPSBNYXRoLmZsb29yKCB5ICkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMub3kgPSB5O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFU0laRSBGVU5DVElPTlxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNhbGMgKCB5ICkge1xyXG5cclxuICAgICAgICB0aGlzLmggKz0geTtcclxuICAgICAgICBjbGVhclRpbWVvdXQoIHRoaXMudG1wICk7XHJcbiAgICAgICAgdGhpcy50bXAgPSBzZXRUaW1lb3V0KCB0aGlzLnNldEhlaWdodC5iaW5kKHRoaXMpLCAxMCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRIZWlnaHQgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy50bXAgKSBjbGVhclRpbWVvdXQoIHRoaXMudG1wICk7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5oIClcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmJoO1xyXG4gICAgICAgIHRoaXMuaXNTY3JvbGwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNPcGVuICl7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGhoID0gdGhpcy5mb3JjZUhlaWdodCA/IHRoaXMuZm9yY2VIZWlnaHQgKyB0aGlzLnpvbmUueSA6IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWF4SGVpZ2h0ID0gaGhoIC0gdGhpcy56b25lLnkgLSB0aGlzLmJoO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRpZmYgPSB0aGlzLmggLSB0aGlzLm1heEhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmKCBkaWZmID4gMSApeyAvL3RoaXMuaCA+IHRoaXMubWF4SGVpZ2h0ICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1Njcm9sbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMubWF4SGVpZ2h0ICsgdGhpcy5iaDtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmggKyB0aGlzLmJoO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwU2Nyb2xsKCB0aGlzLmlzU2Nyb2xsICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5uZXJDb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuem9uZS5oIC0gdGhpcy5iaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuem9uZS5oICsgJ3B4JztcclxuICAgICAgICB0aGlzLmJvdHRvbS5zdHlsZS50b3AgPSB0aGlzLnpvbmUuaCAtIHRoaXMuYmggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5mb3JjZUhlaWdodCAmJiB0aGlzLmxvY2tIZWlnaHQgKSB0aGlzLmNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5mb3JjZUhlaWdodCArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHRoaXMuY2FsY1VpcygpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzQ2FudmFzICkgdGhpcy5kcmF3KCB0cnVlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlem9uZSAoKSB7XHJcbiAgICAgICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0V2lkdGggKCB3ICkge1xyXG5cclxuICAgICAgICBpZiggdyApIHRoaXMuem9uZS53ID0gdztcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50LnN0eWxlLndpZHRoID0gdGhpcy56b25lLncgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0NlbnRlciApIHRoaXMuY29udGVudC5zdHlsZS5tYXJnaW5MZWZ0ID0gLShNYXRoLmZsb29yKHRoaXMuem9uZS53KjAuNSkpICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5zZXRJdGVtV2lkdGgoIHRoaXMuem9uZS53IC0gdGhpcy5zdyApO1xyXG5cclxuICAgICAgICB0aGlzLnNldEhlaWdodCgpO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNDYW52YXNPbmx5ICkgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcbiAgICAgICAgLy90aGlzLnJlc2l6ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRJdGVtV2lkdGggKCB3ICkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRTaXplKCB3ICk7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnJTaXplKClcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuR3VpLnByb3RvdHlwZS5pc0d1aSA9IHRydWU7IiwiLy9pbXBvcnQgJy4vcG9seWZpbGxzLmpzJztcclxuXHJcbmV4cG9ydCBjb25zdCBSRVZJU0lPTiA9ICczLjAnO1xyXG5cclxuZXhwb3J0IHsgVG9vbHMgfSBmcm9tICcuL2NvcmUvVG9vbHMuanMnO1xyXG5leHBvcnQgeyBHdWkgfSBmcm9tICcuL2NvcmUvR3VpLmpzJztcclxuZXhwb3J0IHsgUHJvdG8gfSBmcm9tICcuL2NvcmUvUHJvdG8uanMnO1xyXG5leHBvcnQgeyBhZGQgfSBmcm9tICcuL2NvcmUvYWRkLmpzJztcclxuLy9cclxuZXhwb3J0IHsgQm9vbCB9IGZyb20gJy4vcHJvdG8vQm9vbC5qcyc7XHJcbmV4cG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vcHJvdG8vQnV0dG9uLmpzJztcclxuZXhwb3J0IHsgQ2lyY3VsYXIgfSBmcm9tICcuL3Byb3RvL0NpcmN1bGFyLmpzJztcclxuZXhwb3J0IHsgQ29sb3IgfSBmcm9tICcuL3Byb3RvL0NvbG9yLmpzJztcclxuZXhwb3J0IHsgRnBzIH0gZnJvbSAnLi9wcm90by9GcHMuanMnO1xyXG5leHBvcnQgeyBHcm91cCB9IGZyb20gJy4vcHJvdG8vR3JvdXAuanMnO1xyXG5leHBvcnQgeyBKb3lzdGljayB9IGZyb20gJy4vcHJvdG8vSm95c3RpY2suanMnO1xyXG5leHBvcnQgeyBLbm9iIH0gZnJvbSAnLi9wcm90by9Lbm9iLmpzJztcclxuZXhwb3J0IHsgTGlzdCB9IGZyb20gJy4vcHJvdG8vTGlzdC5qcyc7XHJcbmV4cG9ydCB7IE51bWVyaWMgfSBmcm9tICcuL3Byb3RvL051bWVyaWMuanMnO1xyXG5leHBvcnQgeyBTbGlkZSB9IGZyb20gJy4vcHJvdG8vU2xpZGUuanMnO1xyXG5leHBvcnQgeyBUZXh0SW5wdXQgfSBmcm9tICcuL3Byb3RvL1RleHRJbnB1dC5qcyc7XHJcbmV4cG9ydCB7IFRpdGxlIH0gZnJvbSAnLi9wcm90by9UaXRsZS5qcyc7Il0sIm5hbWVzIjpbInJ1bnRpbWUiLCJleHBvcnRzIiwiT2JqZWN0IiwidmFsdWUiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJkZWZpbmUiLCJvYmoiLCJrZXkiLCJnZW5lcmF0b3IiLCJ0eXBlIiwiYXJnIiwiY2FsbCIsIkl0ZXJhdG9yUHJvdG90eXBlIiwiR2VuZXJhdG9yRnVuY3Rpb24iLCJHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSIsImdlbkZ1biIsIkdwIiwiX19hd2FpdCIsInJlamVjdCIsInRoZW4iLCJpbnZva2UiLCJlcnIiLCJyZXN1bHQiLCJyZXNvbHZlIiwiZXJyb3IiLCJwcmV2aW91c1Byb21pc2UiLCJjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyIsImRlZmluZUl0ZXJhdG9yTWV0aG9kcyIsIkFzeW5jSXRlcmF0b3IiLCJjb250ZXh0IiwiX3NlbnQiLCJzdGF0ZSIsInNlbGYiLCJyZWNvcmQiLCJkb25lIiwibWF5YmVJbnZva2VEZWxlZ2F0ZSIsInRyeUxvYyIsImVudHJ5IiwidHJ5TG9jc0xpc3QiLCJrZXlzIiwibmV4dCIsImkiLCJoYXNPd24iLCJDb250ZXh0IiwiY29uc3RydWN0b3IiLCJyZXNldCIsInVuZGVmaW5lZCIsIm5hbWUiLCJpc05hTiIsInNsaWNlIiwic3RvcCIsImRpc3BhdGNoRXhjZXB0aW9uIiwibG9jIiwicHJldiIsImhhbmRsZSIsIkVycm9yIiwiYWJydXB0IiwiZmluYWxseUVudHJ5IiwiY29tcGxldGUiLCJydmFsIiwiZmluaXNoIiwicmVzZXRUcnlFbnRyeSIsInRocm93biIsImRlbGVnYXRlWWllbGQiLCJpdGVyYXRvciIsInJlc3VsdE5hbWUiLCJuZXh0TG9jIiwibW9kdWxlIiwicmVnZW5lcmF0b3JSdW50aW1lIiwiYWNjaWRlbnRhbFN0cmljdE1vZGUiLCJGdW5jdGlvbiIsIlQiLCJmcmFnIiwiY29sb3JSaW5nIiwiam95c3RpY2tfMCIsImpveXN0aWNrXzEiLCJjaXJjdWxhciIsImtub2IiLCJzdmducyIsImxpbmtzIiwiaHRtbHMiLCJET01fU0laRSIsIlNWR19UWVBFX0QiLCJTVkdfVFlQRV9HIiwiUEkiLCJUd29QSSIsInBpOTAiLCJwaTYwIiwidG9yYWQiLCJ0b2RlZyIsImNsYW1wIiwidiIsInNpemUiLCJ3IiwiaCIsInAiLCJzIiwiY29sb3JzIiwidGV4dCIsInRleHRPdmVyIiwidHh0c2VsZWN0YmciLCJiYWNrZ3JvdW5kIiwiYmFja2dyb3VuZE92ZXIiLCJpbnB1dEJvcmRlciIsImlucHV0SG9sZGVyIiwiaW5wdXRCb3JkZXJTZWxlY3QiLCJpbnB1dEJnIiwiaW5wdXRPdmVyIiwiYm9yZGVyIiwiYm9yZGVyT3ZlciIsImJvcmRlclNlbGVjdCIsImJ1dHRvbiIsImJvb2xiZyIsImJvb2xvbiIsInNlbGVjdCIsIm1vdmluZyIsImRvd24iLCJvdmVyIiwiYWN0aW9uIiwic3Ryb2tlIiwic2Nyb2xsIiwic2Nyb2xsYmFjayIsInNjcm9sbGJhY2tvdmVyIiwiaGlkZSIsImdyb3VwQm9yZGVyIiwiYnV0dG9uQm9yZGVyIiwiZm9udEZhbWlseSIsImZvbnRTaGFkb3ciLCJmb250U2l6ZSIsInJhZGl1cyIsImNzcyIsImJhc2ljIiwic3ZncyIsImdyb3VwIiwiYXJyb3ciLCJhcnJvd0Rvd24iLCJhcnJvd1VwIiwic29saWQiLCJib2R5IiwidmVoaWNsZSIsImFydGljdWxhdGlvbiIsImNoYXJhY3RlciIsInRlcnJhaW4iLCJqb2ludCIsInJheSIsImNvbGxpc2lvbiIsIm1hcCIsIm1hdGVyaWFsIiwidGV4dHVyZSIsIm9iamVjdCIsIm5vbmUiLCJjdXJzb3IiLCJzZXRTdHlsZSIsIm8iLCJzZXRUZXh0IiwiYyIsImNsb25lQ29sb3IiLCJjYyIsImNsb25lQ3NzIiwiY2xvbmUiLCJzZXRTdmciLCJpZCIsInNldENzcyIsImRvbSIsInIiLCJzZXQiLCJnIiwiYXR0IiwiZ2V0IiwiYWRkQXR0cmlidXRlcyIsImNsZWFyIiwicHVyZ2UiLCJuIiwiYSIsIkNvbG9yTHVtYSIsImwiLCJoZXgiLCJtaW4iLCJtYXgiLCJyZ2IiLCJmaW5kRGVlcEludmVyIiwiaGV4VG9IdG1sIiwiaHRtbFRvSGV4IiwidTI1NSIsInUxNiIsInVucGFjayIsImh0bWxSZ2IiLCJwYWQiLCJyZ2JUb0hleCIsImIiLCJodWVUb1JnYiIsInEiLCJ0IiwicmdiVG9Ic2wiLCJNYXRoIiwiaHNsVG9SZ2IiLCJtYWtlR3JhZGlhbnQiLCJvZmZzZXQiLCJtYWtlS25vYiIsInZpZXdCb3giLCJ3aWR0aCIsImhlaWdodCIsInByZXNlcnZlQXNwZWN0UmF0aW8iLCJjeCIsImN5IiwiZmlsbCIsImQiLCJtYWtlQ2lyY3VsYXIiLCJtYWtlSm95c3RpY2siLCJjY2MiLCJmeCIsImZ5Iiwic3ZnIiwiY2MwIiwiY2MxIiwibWFrZUNvbG9yUmluZyIsImFtIiwiZDIiLCJhMiIsImFyIiwidGFuIiwiY29zIiwic2luIiwiYTEiLCJjb2xvciIsImoiLCJtaWQiLCJwYXRoIiwieDEiLCJ5MSIsIngyIiwieTIiLCJncmFkaWVudFVuaXRzIiwidHciLCJwb2ludHMiLCJpY29uIiwibG9nb0ZpbGxfZCIsIlRvb2xzIiwiUiIsInVpIiwiSUQiLCJsb2NrIiwid2xvY2siLCJjdXJyZW50IiwibmVlZFJlWm9uZSIsImlzRXZlbnRzSW5pdCIsInByZXZEZWZhdWx0IiwicG9pbnRlckV2ZW50IiwieG1sc2VyaWFsaXplciIsInRtcFRpbWUiLCJ0bXBJbWFnZSIsIm9sZEN1cnNvciIsImlucHV0IiwicGFyZW50IiwiZmlyc3RJbXB1dCIsImhpZGRlbkltcHV0IiwiaGlkZGVuU2l6ZXIiLCJoYXNGb2N1cyIsInN0YXJ0SW5wdXQiLCJpbnB1dFJhbmdlIiwiY3Vyc29ySWQiLCJzdHIiLCJwb3MiLCJzdGFydFgiLCJtb3ZlWCIsImRlYnVnSW5wdXQiLCJpc0xvb3AiLCJsaXN0ZW5zIiwiZSIsImNsaWVudFgiLCJjbGllbnRZIiwia2V5Q29kZSIsImRlbHRhIiwiaXNNb2JpbGUiLCJhZGQiLCJ0ZXN0TW9iaWxlIiwicmVtb3ZlIiwiaW5pdEV2ZW50cyIsImRvY3VtZW50Iiwid2luZG93IiwicmVtb3ZlRXZlbnRzIiwicmVzaXplIiwidSIsIm91dCIsImNvbnNvbGUiLCJpbiIsImhhbmRsZUV2ZW50IiwiZmluZElEIiwieCIsInkiLCJjbGVhck9sZElEIiwiY2FsY1VpcyIsInVpcyIsInpvbmUiLCJteSIsInB4IiwicHkiLCJmaW5kVGFyZ2V0IiwiZmluZFpvbmUiLCJvblpvbmUiLCJteCIsInoiLCJnZXRab25lIiwidG9wIiwidG9DYW52YXMiLCJjbGVhclRpbWVvdXQiLCJpbWciLCJjdHgiLCJzZXRIaWRkZW4iLCJ0eHQiLCJjbGVhckhpZGRlbiIsImNsaWNrUG9zIiwidXBJbnB1dCIsInVwIiwic2VsZWN0UGFyZW50IiwidGV4dFdpZHRoIiwiY2xlYXJJbnB1dCIsInNldElucHV0Iiwia2V5ZG93biIsImtleXVwIiwibG9vcCIsInVwZGF0ZSIsInJlbW92ZUxpc3RlbiIsImFkZExpc3RlbiIsIlJvb3RzIiwiVjIiLCJQcm90byIsInNhIiwic2IiLCJzYyIsImJnIiwicHAiLCJmIiwiaXNVSSIsIm1haW4iLCJzeCIsIkJvb2wiLCJCdXR0b24iLCJvbiIsImxuZyIsInN0YXQiLCJjaGFuZ2UiLCJyZWFkZXIiLCJkYyIsInRtcCIsIkNpcmN1bGFyIiwibGVmdCIsIm9mZiIsImRpZiIsImFicyIsIm9sZCIsIkNvbG9yIiwiY3ciLCJ0ciIsInJyIiwiaHVlIiwic2V0SFNMIiwiaHNsIiwicmF0aW8iLCJyYWQiLCJhdGFuMiIsInJhZDAiLCJyYWQxIiwibWF4UiIsInJhZDIiLCJhdGFuIiwibHVtIiwidHNsIiwic2F0IiwiaHgiLCJoeSIsInN5IiwidngiLCJ2eSIsIkZwcyIsIm5vdyIsImZwcyIsIm1lbSIsInB1c2giLCJyZXMiLCJiYXNlIiwibXMiLCJtbSIsIkdyYXBoIiwicmgiLCJnaCIsImd3IiwiaXciLCJuZWciLCJudXAiLCJ3bSIsInduIiwib3ciLCJvaCIsIkdyb3VwIiwiY2xvc2UiLCJ0bXBoIiwidGFyZ2V0IiwiaXRlbSIsInBvcCIsInByb3RvdHlwZSIsImlzR3JvdXAiLCJKb3lzdGljayIsImNsZWFySW50ZXJ2YWwiLCJsZXJwIiwiZHJhdyIsIktub2IiLCJ3dyIsInN0ZXAiLCJyYW5nZSIsIkxpc3QiLCJiYXNlSCIsIm9wZW4iLCJsaXN0Iiwic2VuZCIsInNoIiwiTnVtZXJpYyIsInZhbCIsIlNsaWRlIiwiaDIiLCJyYSIsImgxIiwidHgiLCJUZXh0SW5wdXQiLCJUaXRsZSIsIlNlbGVjdCIsIlNlbGVjdG9yIiwic2VsIiwibW9kZSIsIkVtcHR5IiwiSXRlbSIsIkdyaWQiLCJ0ZCIsInN0eWxlIiwiYnNpemUiLCJ0eSIsInZ3IiwicnoiLCJ0bXBYIiwicmVmIiwiR3VpIiwiY24iLCJzdyIsImJoIiwib3kiLCJtIiwibmVlZENoYW5nZSIsInIyIiwib250b3AiLCJjYWxjIiwiaGhoIiwiaXNHdWkiLCJSRVZJU0lPTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0NBQUE7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtD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
