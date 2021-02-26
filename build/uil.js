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
			s: 20
		},
		// ----------------------
		//	 COLOR
		// ----------------------
		cloneColor: function cloneColor() {
			var cc = Object.assign({}, T.colors);
			return cc;
		},
		cloneCss: function cloneCss() {
			var cc = Object.assign({}, T.css);
			return cc;
		},
		colors: {
			text: '#C0C0C0',
			textOver: '#FFFFFF',
			txtselectbg: 'none',
			background: 'rgba(44,44,44,0.3)',
			backgroundOver: 'rgba(11,11,11,0.5)',
			//input: '#005AAA',
			inputBorder: '#454545',
			inputHolder: '#808080',
			inputBorderSelect: '#005AAA',
			inputBg: 'rgba(0,0,0,0.1)',
			inputOver: 'rgba(0,0,0,0.2)',
			border: '#454545',
			borderOver: '#5050AA',
			borderSelect: '#308AFF',
			scrollback: 'rgba(44,44,44,0.2)',
			scrollbackover: 'rgba(44,44,44,0.2)',
			button: '#404040',
			boolbg: '#181818',
			boolon: '#C0C0C0',
			select: '#308AFF',
			moving: '#03afff',
			down: '#024699',
			over: '#024699',
			action: '#FF3300',
			stroke: 'rgba(11,11,11,0.5)',
			scroll: '#333333',
			hide: 'rgba(0,0,0,0)',
			groupBorder: 'none',
			buttonBorder: 'none'
		},
		// style css
		css: {
			//unselect: '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;', 
			basic: 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; overflow:hidden; ' + '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;',
			button: 'display:flex; justify-content:center; align-items:center; text-align:center;'
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
		// custom text
		setText: function setText(size, color, font, shadow, colors, css) {
			size = size || 13;
			color = color || '#CCC';
			font = font || 'Consolas,monaco,monospace;'; //'Monospace';//'"Consolas", "Lucida Console", Monaco, monospace';

			colors = colors || T.colors;
			css = css || T.css;
			colors.text = color;
			css.txt = css.basic + 'font-family:' + font + '; font-size:' + size + 'px; color:' + color + '; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';
			if (shadow) css.txt += ' text-shadow:' + shadow + '; '; //"1px 1px 1px #ff0000";

			css.txtselect = css.txt + 'display:flex; justify-content:left; align-items:center; text-align:left;' + 'padding:2px 5px; border:1px dashed ' + colors.border + '; background:' + colors.txtselectbg + ';';
			css.item = css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px;';
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
					//t[1]="<path id='logoin' stroke='"+color+"' stroke-width='16' stroke-linejoin='round' stroke-linecap='square' fill='none' d='M 192 44 L 192 148 Q 192 174.5 173.3 193.25 154.55 212 128 212 101.5 212 82.75 193.25 64 174.5 64 148 L 64 44 M 160 44 L 160 148 Q 160 161.25 150.65 170.65 141.25 180 128 180 114.75 180 105.35 170.65 96 161.25 96 148 L 96 44'/>";
					t[1] = "<path id='logoin' fill='" + color + "' stroke='none' d='" + T.logoFill_d + "'/>";
					break;

				case 'save':
					t[1] = "<path stroke='" + color + "' stroke-width='4' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 26.125 17 L 20 22.95 14.05 17 M 20 9.95 L 20 22.95'/><path stroke='" + color + "' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 32.6 23 L 32.6 25.5 Q 32.6 28.5 29.6 28.5 L 10.6 28.5 Q 7.6 28.5 7.6 25.5 L 7.6 23'/>";
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
				dom.addEventListener('mousedown', R, false);
				dom.addEventListener('contextmenu', R, false);
				dom.addEventListener('wheel', R, false);
				document.addEventListener('mousemove', R, false);
				document.addEventListener('mouseup', R, false);
			}

			window.addEventListener('keydown', R, false);
			window.addEventListener('keyup', R, false);
			window.addEventListener('resize', R.resize, false); //window.addEventListener( 'mousedown', R, false );

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
				dom.removeEventListener('mousedown', R, false);
				dom.removeEventListener('contextmenu', R, false);
				dom.removeEventListener('wheel', R, false);
				document.removeEventListener('mousemove', R, false);
				document.removeEventListener('mouseup', R, false);
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
		// ----------------------
		//	 HANDLE EVENTS
		// ----------------------
		handleEvent: function handleEvent(event) {
			//if(!event.type) return;
			//	console.log( event.type )
			if (event.type.indexOf(R.prevDefault) !== -1) event.preventDefault();
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
			if (id !== -1) return;
			R.listens.push(proto);

			if (!R.isLoop) {
				R.isLoop = true;
				R.loop();
			}
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
			this.parentGroup = null;
			this.css = this.main ? this.main.css : Tools.css;
			this.colors = this.main ? this.main.colors : Tools.colors;
			this.defaultBorderColor = this.colors.border;
			this.svgs = Tools.svgs; // only space 

			this.isEmpty = o.isEmpty || false;
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
			if (!this.isEmpty) this.h = this.h < 11 ? 11 : this.h; // if need resize width

			this.autoWidth = o.auto || true; // open statu

			this.isOpen = false; // radius for toolbox

			this.radius = o.radius || 0; // only for number

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

			this.bg = this.colors.background; //this.isUI ? this.main.bg : Tools.colors.background;

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
			this.txt = o.name || 'Proto';
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
			if (this.isUI) s[0].background = this.bg;
			if (this.isEmpty) s[0].background = 'none'; //if( this.autoHeight ) s[0].transition = 'height 0.01s ease-out';

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

			if (this.target !== null) {
				this.target.appendChild(c[0]);
			} else {
				if (this.isUI) this.main.inner.appendChild(c[0]);else document.body.appendChild(c[0]);
			}

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
			if (this.isEmpty) return;
			if (this.s) this.s[0].background = this.bg;
		};

		_proto.uiover = function uiover() {
			if (this.isEmpty) return;
			if (this.s) this.s[0].background = this.bgOver;
		};

		_proto.rename = function rename(s) {
			if (this.c[1] !== undefined) this.c[1].textContent = s;
		};

		_proto.listen = function listen() {
			Roots.addListen(this);
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
			if (this.isEmpty) return;
			this.callback = f || null;
			return this;
		} // ----------------------
		// update only on end
		// ----------------------
		;

		_proto.onFinishChange = function onFinishChange(f) {
			if (this.isEmpty) return;
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

		_proto.clear = function clear() {
			Tools.clear(this.c[0]);

			if (this.target !== null) {
				this.target.removeChild(this.c[0]);
			} else {
				if (this.isUI) this.main.clearOne(this);else document.body.removeChild(this.c[0]);
			}

			if (!this.isUI) Roots.remove(this);
			this.c = null;
			this.s = null;
			this.callback = null;
			this.target = null;
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
			if (this.isEmpty) return;
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
			if (typeof _this.values === 'string') _this.values = [_this.values]; //this.selected = null;

			_this.isDown = false; // custom color

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
				this.value = false;
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
			_this.wfixe = _this.sb > 256 ? 256 : _this.sb;
			if (o.cw != undefined) _this.wfixe = o.cw; // color up or down

			_this.side = o.side || 'down';
			_this.up = _this.side === 'down' ? 0 : 1;
			_this.baseH = _this.h;
			_this.offset = new V2();
			_this.decal = new V2();
			_this.p = new V2();
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
			if (this.parentGroup !== null) this.parentGroup.calc(t);else if (this.isUI) this.main.calc(t);
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
			var p = this.p;
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
			this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);
			this.decal.y = this.side === 'up' ? 2 : this.baseH + 2;
			this.mid = Math.floor(this.wfixe * 0.5);
			this.setSvg(this.c[3], 'viewBox', '0 0 ' + this.wfixe + ' ' + this.wfixe);
			s[3].width = this.wfixe + 'px';
			s[3].height = this.wfixe + 'px';
			s[3].left = this.decal.x + 'px';
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
			_this.round = Math.round;
			_this.autoHeight = true;
			_this.baseH = _this.h;
			_this.hplus = o.hplus || 50;
			_this.res = o.res || 40;
			_this.l = 1;
			_this.precision = o.precision || 0;
			_this.custom = o.custom || false;
			_this.names = o.names || ['FPS', 'MS'];
			var cc = o.cc || ['90,90,90', '255,255,0']; // this.divid = [ 100, 100, 100 ];
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

				_this.txt = 'FPS';
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

			if (this.parentGroup !== null) {
				this.parentGroup.calc(this.hplus);
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

			if (this.parentGroup !== null) {
				this.parentGroup.calc(-this.hplus);
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

			_this.init();

			if (o.bg !== undefined) _this.setBG(o.bg);
			if (o.open !== undefined) _this.open();
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


			var n = this.ADD.apply(this, a);
			this.uis.push(n);
			if (n.autoHeight) n.parentGroup = this;
			return n;
		};

		_proto.parentHeight = function parentHeight(t) {
			if (this.parentGroup !== null) this.parentGroup.calc(t);else if (this.isUI) this.main.calc(t);
		};

		_proto.open = function open() {
			_Proto.prototype.open.call(this);

			this.setSvg(this.c[4], 'd', this.svgs.arrowDown);
			this.rSizeContent();
			var t = this.h - this.baseH;
			this.parentHeight(t);
		};

		_proto.close = function close() {
			_Proto.prototype.close.call(this);

			var t = this.h - this.baseH;
			this.setSvg(this.c[4], 'd', this.svgs.arrow);
			this.h = this.baseH;
			this.s[0].height = this.h + 'px';
			this.parentHeight(-t);
		};

		_proto.clear = function clear() {
			this.clearGroup();
			if (this.isUI) this.main.calc(-(this.h + 1));
			Proto.prototype.clear.call(this);
		};

		_proto.clearGroup = function clearGroup() {
			this.close();
			var i = this.uis.length;

			while (i--) {
				this.uis[i].clear();
				this.uis.pop();
			}

			this.uis = [];
			this.h = this.baseH;
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

	var Knob = /*#__PURE__*/function (_Circular) {
		_inheritsLoose(Knob, _Circular);

		function Knob(o) {
			var _this;

			if (o === void 0) {
				o = {};
			}

			_this = _Circular.call(this, o) || this;
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
	}(Circular);

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
			_this.tmpUrl = [];
			_this.autoHeight = false;
			var align = o.align || 'center';
			_this.sMode = 0;
			_this.tMode = 0;
			_this.listOnly = o.listOnly || false;
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
			if (this.parentGroup !== null) this.parentGroup.calc(t);else if (this.isUI) this.main.calc(t);
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

			this.s[1].width = this.w - 50 + 'px';
			this.s[2].left = this.w - (50 + 26) + 'px';
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
			o.isEmpty = true;
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
			_this.bsize = o.bsize || [90, 20];
			_this.lng = _this.values.length;
			_this.tmp = [];
			_this.stat = [];
			_this.grid = [2, Math.round(_this.lng * 0.5)];
			_this.h = Math.round(_this.lng * 0.5) * (_this.bsize[1] + _this.spaces[1]) + _this.spaces[1];
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

		_proto.rSize = function rSize() {
			_Proto.prototype.rSize.call(this);

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

			this.canvas = null; // color

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

			this.bottom = Tools.dom('div', this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:10px;	border-bottom-left-radius:10px; text-align:center; height:' + this.bh + 'px; line-height:' + (this.bh - 5) + 'px; border-top:1px solid ' + Tools.colors.stroke + ';');
			this.content.appendChild(this.bottom);
			this.bottom.textContent = 'close';
			this.bottom.style.background = this.bg; //

			this.parent = o.parent !== undefined ? o.parent : null;

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
						this.bottom.textContent = this.isOpen ? 'close' : 'open';
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

			if (typeof a[1] === 'object') {
				a[1].isUI = true;
				a[1].main = this;
			} else if (typeof a[1] === 'string') {
				if (a[2] === undefined) [].push.call(a, {
					isUI: true,
					main: this
				});else {
					a[2].isUI = true;
					a[2].main = this;
				}
			}

			var u = add.apply(this, a);

			if (u === null) return; //let n = add.apply( this, a );
			//let n = UIL.add( ...args );

			this.uis.push(u); //n.py = this.h;

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
			var i = this.uis.indexOf(n);
			if (i !== -1) this.uis[i].clear();
		} // call after uis clear
		;

		_proto.clearOne = function clearOne(n) {
			var i = this.uis.indexOf(n);

			if (i !== -1) {
				this.inner.removeChild(this.uis[i].c[0]);
				this.uis.splice(i, 1);
			}
		} // clear all gui
		;

		_proto.clear = function clear() {
			//this.callback = null;
			var i = this.uis.length;

			while (i--) {
				this.uis[i].clear();
			}

			this.uis = [];
			Roots.listens = [];
			this.calc(-this.h);
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

	var REVISION = '2.8';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlsLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwiLi4vc3JjL2NvcmUvVG9vbHMuanMiLCIuLi9zcmMvY29yZS9Sb290cy5qcyIsIi4uL3NyYy9jb3JlL1YyLmpzIiwiLi4vc3JjL2NvcmUvUHJvdG8uanMiLCIuLi9zcmMvcHJvdG8vQm9vbC5qcyIsIi4uL3NyYy9wcm90by9CdXR0b24uanMiLCIuLi9zcmMvcHJvdG8vQ2lyY3VsYXIuanMiLCIuLi9zcmMvcHJvdG8vQ29sb3IuanMiLCIuLi9zcmMvcHJvdG8vRnBzLmpzIiwiLi4vc3JjL3Byb3RvL0dyYXBoLmpzIiwiLi4vc3JjL3Byb3RvL0dyb3VwLmpzIiwiLi4vc3JjL3Byb3RvL0pveXN0aWNrLmpzIiwiLi4vc3JjL3Byb3RvL0tub2IuanMiLCIuLi9zcmMvcHJvdG8vTGlzdC5qcyIsIi4uL3NyYy9wcm90by9OdW1lcmljLmpzIiwiLi4vc3JjL3Byb3RvL1NsaWRlLmpzIiwiLi4vc3JjL3Byb3RvL1RleHRJbnB1dC5qcyIsIi4uL3NyYy9wcm90by9UaXRsZS5qcyIsIi4uL3NyYy9wcm90by9TZWxlY3QuanMiLCIuLi9zcmMvcHJvdG8vU2VsZWN0b3IuanMiLCIuLi9zcmMvcHJvdG8vRW1wdHkuanMiLCIuLi9zcmMvcHJvdG8vSXRlbS5qcyIsIi4uL3NyYy9wcm90by9HcmlkLmpzIiwiLi4vc3JjL2NvcmUvYWRkLmpzIiwiLi4vc3JjL2NvcmUvR3VpLmpzIiwiLi4vc3JjL1VpbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gZGVmaW5lKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIG9ialtrZXldO1xuICB9XG4gIHRyeSB7XG4gICAgLy8gSUUgOCBoYXMgYSBicm9rZW4gT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoYXQgb25seSB3b3JrcyBvbiBET00gb2JqZWN0cy5cbiAgICBkZWZpbmUoe30sIFwiXCIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBkZWZpbmUgPSBmdW5jdGlvbihvYmosIGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XSA9IHZhbHVlO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IGRlZmluZShcbiAgICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSxcbiAgICB0b1N0cmluZ1RhZ1N5bWJvbCxcbiAgICBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgKTtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBkZWZpbmUocHJvdG90eXBlLCBtZXRob2QsIGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBkZWZpbmUoZ2VuRnVuLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JGdW5jdGlvblwiKTtcbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yLCBQcm9taXNlSW1wbCkge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlSW1wbChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QsIFByb21pc2VJbXBsKSB7XG4gICAgaWYgKFByb21pc2VJbXBsID09PSB2b2lkIDApIFByb21pc2VJbXBsID0gUHJvbWlzZTtcblxuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSxcbiAgICAgIFByb21pc2VJbXBsXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBkZWZpbmUoR3AsIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvclwiKTtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiIsIi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmNvbnN0IFQgPSB7XHJcblxyXG4gICAgZnJhZzogZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxyXG5cclxuICAgIGNvbG9yUmluZzogbnVsbCxcclxuICAgIGpveXN0aWNrXzA6IG51bGwsXHJcbiAgICBqb3lzdGlja18xOiBudWxsLFxyXG4gICAgY2lyY3VsYXI6IG51bGwsXHJcbiAgICBrbm9iOiBudWxsLFxyXG5cclxuICAgIHN2Z25zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXHJcbiAgICBsaW5rczogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsXHJcbiAgICBodG1sczogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXHJcblxyXG4gICAgRE9NX1NJWkU6IFsgJ2hlaWdodCcsICd3aWR0aCcsICd0b3AnLCAnbGVmdCcsICdib3R0b20nLCAncmlnaHQnLCAnbWFyZ2luLWxlZnQnLCAnbWFyZ2luLXJpZ2h0JywgJ21hcmdpbi10b3AnLCAnbWFyZ2luLWJvdHRvbSddLFxyXG4gICAgU1ZHX1RZUEVfRDogWyAncGF0dGVybicsICdkZWZzJywgJ3RyYW5zZm9ybScsICdzdG9wJywgJ2FuaW1hdGUnLCAncmFkaWFsR3JhZGllbnQnLCAnbGluZWFyR3JhZGllbnQnLCAnYW5pbWF0ZU1vdGlvbicsICd1c2UnLCAnZmlsdGVyJywgJ2ZlQ29sb3JNYXRyaXgnIF0sXHJcbiAgICBTVkdfVFlQRV9HOiBbICdzdmcnLCAncmVjdCcsICdjaXJjbGUnLCAncGF0aCcsICdwb2x5Z29uJywgJ3RleHQnLCAnZycsICdsaW5lJywgJ2ZvcmVpZ25PYmplY3QnIF0sXHJcblxyXG4gICAgUEk6IE1hdGguUEksXHJcbiAgICBUd29QSTogTWF0aC5QSSoyLFxyXG4gICAgcGk5MDogTWF0aC5QSSAqIDAuNSxcclxuICAgIHBpNjA6IE1hdGguUEkvMyxcclxuICAgIFxyXG4gICAgdG9yYWQ6IE1hdGguUEkgLyAxODAsXHJcbiAgICB0b2RlZzogMTgwIC8gTWF0aC5QSSxcclxuXHJcbiAgICBjbGFtcDogZnVuY3Rpb24gKHYsIG1pbiwgbWF4KSB7XHJcblxyXG4gICAgICAgIHYgPSB2IDwgbWluID8gbWluIDogdjtcclxuICAgICAgICB2ID0gdiA+IG1heCA/IG1heCA6IHY7XHJcbiAgICAgICAgcmV0dXJuIHY7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzaXplOiB7ICB3OiAyNDAsIGg6IDIwLCBwOiAzMCwgczogMjAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENPTE9SXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2xvbmVDb2xvcjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgY2MgPSBPYmplY3QuYXNzaWduKHt9LCBULmNvbG9ycyApO1xyXG4gICAgICAgIHJldHVybiBjYztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsb25lQ3NzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCBjYyA9IE9iamVjdC5hc3NpZ24oe30sIFQuY3NzICk7XHJcbiAgICAgICAgcmV0dXJuIGNjO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY29sb3JzOiB7XHJcblxyXG4gICAgICAgIHRleHQgOiAnI0MwQzBDMCcsXHJcbiAgICAgICAgdGV4dE92ZXIgOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgdHh0c2VsZWN0YmcgOiAnbm9uZScsXHJcblxyXG4gICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDQ0LDQ0LDQ0LDAuMyknLFxyXG4gICAgICAgIGJhY2tncm91bmRPdmVyOiAncmdiYSgxMSwxMSwxMSwwLjUpJyxcclxuXHJcbiAgICAgICAgLy9pbnB1dDogJyMwMDVBQUEnLFxyXG5cclxuICAgICAgICBpbnB1dEJvcmRlcjogJyM0NTQ1NDUnLFxyXG4gICAgICAgIGlucHV0SG9sZGVyOiAnIzgwODA4MCcsXHJcbiAgICAgICAgaW5wdXRCb3JkZXJTZWxlY3Q6ICcjMDA1QUFBJyxcclxuICAgICAgICBpbnB1dEJnOiAncmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICBpbnB1dE92ZXI6ICdyZ2JhKDAsMCwwLDAuMiknLFxyXG5cclxuICAgICAgICBib3JkZXIgOiAnIzQ1NDU0NScsXHJcbiAgICAgICAgYm9yZGVyT3ZlciA6ICcjNTA1MEFBJyxcclxuICAgICAgICBib3JkZXJTZWxlY3QgOiAnIzMwOEFGRicsXHJcblxyXG4gICAgICAgIHNjcm9sbGJhY2s6J3JnYmEoNDQsNDQsNDQsMC4yKScsXHJcbiAgICAgICAgc2Nyb2xsYmFja292ZXI6J3JnYmEoNDQsNDQsNDQsMC4yKScsXHJcblxyXG4gICAgICAgIGJ1dHRvbiA6ICcjNDA0MDQwJyxcclxuICAgICAgICBib29sYmcgOiAnIzE4MTgxOCcsXHJcbiAgICAgICAgYm9vbG9uIDogJyNDMEMwQzAnLFxyXG5cclxuICAgICAgICBzZWxlY3QgOiAnIzMwOEFGRicsXHJcbiAgICAgICAgbW92aW5nIDogJyMwM2FmZmYnLFxyXG4gICAgICAgIGRvd24gOiAnIzAyNDY5OScsXHJcbiAgICAgICAgb3ZlciA6ICcjMDI0Njk5JyxcclxuICAgICAgICBhY3Rpb246ICcjRkYzMzAwJyxcclxuXHJcbiAgICAgICAgc3Ryb2tlOiAncmdiYSgxMSwxMSwxMSwwLjUpJyxcclxuICAgICAgICBzY3JvbGw6ICcjMzMzMzMzJyxcclxuXHJcbiAgICAgICAgaGlkZTogJ3JnYmEoMCwwLDAsMCknLFxyXG5cclxuICAgICAgICBncm91cEJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgIGJ1dHRvbkJvcmRlcjogJ25vbmUnLFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gc3R5bGUgY3NzXHJcblxyXG4gICAgY3NzIDoge1xyXG4gICAgICAgIC8vdW5zZWxlY3Q6ICctby11c2VyLXNlbGVjdDpub25lOyAtbXMtdXNlci1zZWxlY3Q6bm9uZTsgLWtodG1sLXVzZXItc2VsZWN0Om5vbmU7IC13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsgLW1vei11c2VyLXNlbGVjdDpub25lOycsIFxyXG4gICAgICAgIGJhc2ljOiAncG9zaXRpb246YWJzb2x1dGU7IHBvaW50ZXItZXZlbnRzOm5vbmU7IGJveC1zaXppbmc6Ym9yZGVyLWJveDsgbWFyZ2luOjA7IHBhZGRpbmc6MDsgb3ZlcmZsb3c6aGlkZGVuOyAnICsgJy1vLXVzZXItc2VsZWN0Om5vbmU7IC1tcy11c2VyLXNlbGVjdDpub25lOyAta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTsgLXdlYmtpdC11c2VyLXNlbGVjdDpub25lOyAtbW96LXVzZXItc2VsZWN0Om5vbmU7JyxcclxuICAgICAgICBidXR0b246J2Rpc3BsYXk6ZmxleDsganVzdGlmeS1jb250ZW50OmNlbnRlcjsgYWxpZ24taXRlbXM6Y2VudGVyOyB0ZXh0LWFsaWduOmNlbnRlcjsnLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBzdmcgcGF0aFxyXG5cclxuICAgIHN2Z3M6IHtcclxuXHJcbiAgICAgICAgZ3JvdXA6J00gNyA3IEwgNyA4IDggOCA4IDcgNyA3IE0gNSA3IEwgNSA4IDYgOCA2IDcgNSA3IE0gMyA3IEwgMyA4IDQgOCA0IDcgMyA3IE0gNyA1IEwgNyA2IDggNiA4IDUgNyA1IE0gNiA2IEwgNiA1IDUgNSA1IDYgNiA2IE0gNyAzIEwgNyA0IDggNCA4IDMgNyAzIE0gNiA0IEwgNiAzIDUgMyA1IDQgNiA0IE0gMyA1IEwgMyA2IDQgNiA0IDUgMyA1IE0gMyAzIEwgMyA0IDQgNCA0IDMgMyAzIFonLFxyXG4gICAgICAgIGFycm93OidNIDMgOCBMIDggNSAzIDIgMyA4IFonLFxyXG4gICAgICAgIGFycm93RG93bjonTSA1IDggTCA4IDMgMiAzIDUgOCBaJyxcclxuICAgICAgICBhcnJvd1VwOidNIDUgMiBMIDIgNyA4IDcgNSAyIFonLFxyXG5cclxuICAgICAgICBzb2xpZDonTSAxMyAxMCBMIDEzIDEgNCAxIDEgNCAxIDEzIDEwIDEzIDEzIDEwIE0gMTEgMyBMIDExIDkgOSAxMSAzIDExIDMgNSA1IDMgMTEgMyBaJyxcclxuICAgICAgICBib2R5OidNIDEzIDEwIEwgMTMgMSA0IDEgMSA0IDEgMTMgMTAgMTMgMTMgMTAgTSAxMSAzIEwgMTEgOSA5IDExIDMgMTEgMyA1IDUgMyAxMSAzIE0gNSA0IEwgNCA1IDQgMTAgOSAxMCAxMCA5IDEwIDQgNSA0IFonLFxyXG4gICAgICAgIHZlaGljbGU6J00gMTMgNiBMIDExIDEgMyAxIDEgNiAxIDEzIDMgMTMgMyAxMSAxMSAxMSAxMSAxMyAxMyAxMyAxMyA2IE0gMi40IDYgTCA0IDIgMTAgMiAxMS42IDYgMi40IDYgTSAxMiA4IEwgMTIgMTAgMTAgMTAgMTAgOCAxMiA4IE0gNCA4IEwgNCAxMCAyIDEwIDIgOCA0IDggWicsXHJcbiAgICAgICAgYXJ0aWN1bGF0aW9uOidNIDEzIDkgTCAxMiA5IDkgMiA5IDEgNSAxIDUgMiAyIDkgMSA5IDEgMTMgNSAxMyA1IDkgNCA5IDYgNSA4IDUgMTAgOSA5IDkgOSAxMyAxMyAxMyAxMyA5IFonLFxyXG4gICAgICAgIGNoYXJhY3RlcjonTSAxMyA0IEwgMTIgMyA5IDQgNSA0IDIgMyAxIDQgNSA2IDUgOCA0IDEzIDYgMTMgNyA5IDggMTMgMTAgMTMgOSA4IDkgNiAxMyA0IE0gNiAxIEwgNiAzIDggMyA4IDEgNiAxIFonLFxyXG4gICAgICAgIHRlcnJhaW46J00gMTMgOCBMIDEyIDcgUSA5LjA2IC0zLjY3IDUuOTUgNC44NSA0LjA0IDMuMjcgMiA3IEwgMSA4IDcgMTMgMTMgOCBNIDMgOCBRIDMuNzggNS40MjAgNS40IDYuNiA1LjIwIDcuMjUgNSA4IEwgNyA4IFEgOC4zOSAtMC4xNiAxMSA4IEwgNyAxMSAzIDggWicsXHJcbiAgICAgICAgam9pbnQ6J00gNy43IDcuNyBRIDggNy40NSA4IDcgOCA2LjYgNy43IDYuMyA3LjQ1IDYgNyA2IDYuNiA2IDYuMyA2LjMgNiA2LjYgNiA3IDYgNy40NSA2LjMgNy43IDYuNiA4IDcgOCA3LjQ1IDggNy43IDcuNyBNIDMuMzUgOC42NSBMIDEgMTEgMyAxMyA1LjM1IDEwLjY1IFEgNi4xIDExIDcgMTEgOC4yOCAxMSA5LjI1IDEwLjI1IEwgNy44IDguOCBRIDcuNDUgOSA3IDkgNi4xNSA5IDUuNTUgOC40IDUgNy44NSA1IDcgNSA2LjU0IDUuMTUgNi4xNSBMIDMuNyA0LjcgUSAzIDUuNzEyIDMgNyAzIDcuOSAzLjM1IDguNjUgTSAxMC4yNSA5LjI1IFEgMTEgOC4yOCAxMSA3IDExIDYuMSAxMC42NSA1LjM1IEwgMTMgMyAxMSAxIDguNjUgMy4zNSBRIDcuOSAzIDcgMyA1LjcgMyA0LjcgMy43IEwgNi4xNSA1LjE1IFEgNi41NCA1IDcgNSA3Ljg1IDUgOC40IDUuNTUgOSA2LjE1IDkgNyA5IDcuNDUgOC44IDcuOCBMIDEwLjI1IDkuMjUgWicsXHJcbiAgICAgICAgcmF5OidNIDkgMTEgTCA1IDExIDUgMTIgOSAxMiA5IDExIE0gMTIgNSBMIDExIDUgMTEgOSAxMiA5IDEyIDUgTSAxMS41IDEwIFEgMTAuOSAxMCAxMC40NSAxMC40NSAxMCAxMC45IDEwIDExLjUgMTAgMTIuMiAxMC40NSAxMi41NSAxMC45IDEzIDExLjUgMTMgMTIuMiAxMyAxMi41NSAxMi41NSAxMyAxMi4yIDEzIDExLjUgMTMgMTAuOSAxMi41NSAxMC40NSAxMi4yIDEwIDExLjUgMTAgTSA5IDEwIEwgMTAgOSAyIDEgMSAyIDkgMTAgWicsXHJcbiAgICAgICAgY29sbGlzaW9uOidNIDExIDEyIEwgMTMgMTAgMTAgNyAxMyA0IDExIDIgNy41IDUuNSA5IDcgNy41IDguNSAxMSAxMiBNIDMgMiBMIDEgNCA0IDcgMSAxMCAzIDEyIDggNyAzIDIgWicsXHJcbiAgICAgICAgbWFwOidNIDEzIDEgTCAxIDEgMSAxMyAxMyAxMyAxMyAxIE0gMTIgMiBMIDEyIDcgNyA3IDcgMTIgMiAxMiAyIDcgNyA3IDcgMiAxMiAyIFonLFxyXG4gICAgICAgIG1hdGVyaWFsOidNIDEzIDEgTCAxIDEgMSAxMyAxMyAxMyAxMyAxIE0gMTIgMiBMIDEyIDcgNyA3IDcgMTIgMiAxMiAyIDcgNyA3IDcgMiAxMiAyIFonLFxyXG4gICAgICAgIHRleHR1cmU6J00gMTMgNCBMIDEzIDEgMSAxIDEgNCA1IDQgNSAxMyA5IDEzIDkgNCAxMyA0IFonLFxyXG4gICAgICAgIG9iamVjdDonTSAxMCAxIEwgNyA0IDQgMSAxIDEgMSAxMyA0IDEzIDQgNSA3IDggMTAgNSAxMCAxMyAxMyAxMyAxMyAxIDEwIDEgWicsXHJcbiAgICAgICAgbm9uZTonTSA5IDUgTCA1IDUgNSA5IDkgOSA5IDUgWicsXHJcbiAgICAgICAgY3Vyc29yOidNIDQgNyBMIDEgMTAgMSAxMiAyIDEzIDQgMTMgNyAxMCA5IDE0IDE0IDAgMCA1IDQgNyBaJyxcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIGN1c3RvbSB0ZXh0XHJcblxyXG4gICAgc2V0VGV4dCA6IGZ1bmN0aW9uKCBzaXplLCBjb2xvciwgZm9udCwgc2hhZG93LCBjb2xvcnMsIGNzcyApe1xyXG5cclxuICAgICAgICBzaXplID0gc2l6ZSB8fCAxMztcclxuICAgICAgICBjb2xvciA9IGNvbG9yIHx8ICcjQ0NDJztcclxuICAgICAgICBmb250ID0gZm9udCB8fCAnQ29uc29sYXMsbW9uYWNvLG1vbm9zcGFjZTsnOy8vJ01vbm9zcGFjZSc7Ly8nXCJDb25zb2xhc1wiLCBcIkx1Y2lkYSBDb25zb2xlXCIsIE1vbmFjbywgbW9ub3NwYWNlJztcclxuXHJcbiAgICAgICAgY29sb3JzID0gY29sb3JzIHx8IFQuY29sb3JzO1xyXG4gICAgICAgIGNzcyA9IGNzcyB8fCBULmNzcztcclxuXHJcbiAgICAgICAgY29sb3JzLnRleHQgPSBjb2xvcjtcclxuICAgICAgICBjc3MudHh0ID0gY3NzLmJhc2ljICsgJ2ZvbnQtZmFtaWx5OicrZm9udCsnOyBmb250LXNpemU6JytzaXplKydweDsgY29sb3I6Jytjb2xvcisnOyBwYWRkaW5nOjJweCAxMHB4OyBsZWZ0OjA7IHRvcDoycHg7IGhlaWdodDoxNnB4OyB3aWR0aDoxMDBweDsgb3ZlcmZsb3c6aGlkZGVuOyB3aGl0ZS1zcGFjZTogbm93cmFwOyc7XHJcbiAgICAgICAgaWYoIHNoYWRvdyApIGNzcy50eHQgKz0gJyB0ZXh0LXNoYWRvdzonKyBzaGFkb3cgKyAnOyAnOyAvL1wiMXB4IDFweCAxcHggI2ZmMDAwMFwiO1xyXG4gICAgICAgIGNzcy50eHRzZWxlY3QgPSBjc3MudHh0ICsgJ2Rpc3BsYXk6ZmxleDsganVzdGlmeS1jb250ZW50OmxlZnQ7IGFsaWduLWl0ZW1zOmNlbnRlcjsgdGV4dC1hbGlnbjpsZWZ0OycgKydwYWRkaW5nOjJweCA1cHg7IGJvcmRlcjoxcHggZGFzaGVkICcgKyBjb2xvcnMuYm9yZGVyICsgJzsgYmFja2dyb3VuZDonKyBjb2xvcnMudHh0c2VsZWN0YmcrJzsnO1xyXG4gICAgICAgIGNzcy5pdGVtID0gY3NzLnR4dCArICdwb3NpdGlvbjpyZWxhdGl2ZTsgYmFja2dyb3VuZDpyZ2JhKDAsMCwwLDAuMik7IG1hcmdpbi1ib3R0b206MXB4Oyc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZTogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICByZXR1cm4gby5jbG9uZU5vZGUoIHRydWUgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFN2ZzogZnVuY3Rpb24oIGRvbSwgdHlwZSwgdmFsdWUsIGlkLCBpZDIgKXtcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSAtMSApIGRvbS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuICAgICAgICBlbHNlIGlmKCBpZDIgIT09IHVuZGVmaW5lZCApIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF0uY2hpbGROb2Rlc1sgaWQyIHx8IDAgXS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuICAgICAgICBlbHNlIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF0uc2V0QXR0cmlidXRlTlMoIG51bGwsIHR5cGUsIHZhbHVlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDc3M6IGZ1bmN0aW9uKCBkb20sIGNzcyApe1xyXG5cclxuICAgICAgICBmb3IoIGxldCByIGluIGNzcyApe1xyXG4gICAgICAgICAgICBpZiggVC5ET01fU0laRS5pbmRleE9mKHIpICE9PSAtMSApIGRvbS5zdHlsZVtyXSA9IGNzc1tyXSArICdweCc7XHJcbiAgICAgICAgICAgIGVsc2UgZG9tLnN0eWxlW3JdID0gY3NzW3JdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldDogZnVuY3Rpb24oIGcsIG8gKXtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgYXR0IGluIG8gKXtcclxuICAgICAgICAgICAgaWYoIGF0dCA9PT0gJ3R4dCcgKSBnLnRleHRDb250ZW50ID0gb1sgYXR0IF07XHJcbiAgICAgICAgICAgIGlmKCBhdHQgPT09ICdsaW5rJyApIGcuc2V0QXR0cmlidXRlTlMoIFQubGlua3MsICd4bGluazpocmVmJywgb1sgYXR0IF0gKTtcclxuICAgICAgICAgICAgZWxzZSBnLnNldEF0dHJpYnV0ZU5TKCBudWxsLCBhdHQsIG9bIGF0dCBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKCBkb20sIGlkICl7XHJcblxyXG4gICAgICAgIGlmKCBpZCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGRvbTsgLy8gcm9vdFxyXG4gICAgICAgIGVsc2UgaWYoICFpc05hTiggaWQgKSApIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWQgXTsgLy8gZmlyc3QgY2hpbGRcclxuICAgICAgICBlbHNlIGlmKCBpZCBpbnN0YW5jZW9mIEFycmF5ICl7XHJcbiAgICAgICAgICAgIGlmKGlkLmxlbmd0aCA9PT0gMikgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZFswXSBdLmNoaWxkTm9kZXNbIGlkWzFdIF07XHJcbiAgICAgICAgICAgIGlmKGlkLmxlbmd0aCA9PT0gMykgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZFswXSBdLmNoaWxkTm9kZXNbIGlkWzFdIF0uY2hpbGROb2Rlc1sgaWRbMl0gXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkb20gOiBmdW5jdGlvbiAoIHR5cGUsIGNzcywgb2JqLCBkb20sIGlkICkge1xyXG5cclxuICAgICAgICB0eXBlID0gdHlwZSB8fCAnZGl2JztcclxuXHJcbiAgICAgICAgaWYoIFQuU1ZHX1RZUEVfRC5pbmRleE9mKHR5cGUpICE9PSAtMSB8fCBULlNWR19UWVBFX0cuaW5kZXhPZih0eXBlKSAhPT0gLTEgKXsgLy8gaXMgc3ZnIGVsZW1lbnRcclxuXHJcbiAgICAgICAgICAgIGlmKCB0eXBlID09PSdzdmcnICl7XHJcblxyXG4gICAgICAgICAgICAgICAgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICAgICAgICAgICAgVC5zZXQoIGRvbSwgb2JqICk7XHJcblxyXG4gICAgICAgICAgLyogIH0gZWxzZSBpZiAoIHR5cGUgPT09ICd1c2UnICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3VzZScgKTtcclxuICAgICAgICAgICAgICAgIFQuc2V0KCBkb20sIG9iaiApO1xyXG4qL1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBzdmcgaWYgbm90IGRlZlxyXG4gICAgICAgICAgICAgICAgaWYoIGRvbSA9PT0gdW5kZWZpbmVkICkgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICAgICAgICAgICAgVC5hZGRBdHRyaWJ1dGVzKCBkb20sIHR5cGUsIG9iaiwgaWQgKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHsgLy8gaXMgaHRtbCBlbGVtZW50XHJcblxyXG4gICAgICAgICAgICBpZiggZG9tID09PSB1bmRlZmluZWQgKSBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuaHRtbHMsIHR5cGUgKTtcclxuICAgICAgICAgICAgZWxzZSBkb20gPSBkb20uYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5odG1scywgdHlwZSApICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIGNzcyApIGRvbS5zdHlsZS5jc3NUZXh0ID0gY3NzOyBcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSB1bmRlZmluZWQgKSByZXR1cm4gZG9tO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRBdHRyaWJ1dGVzIDogZnVuY3Rpb24oIGRvbSwgdHlwZSwgbywgaWQgKXtcclxuXHJcbiAgICAgICAgbGV0IGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsIHR5cGUgKTtcclxuICAgICAgICBULnNldCggZywgbyApO1xyXG4gICAgICAgIFQuZ2V0KCBkb20sIGlkICkuYXBwZW5kQ2hpbGQoIGcgKTtcclxuICAgICAgICBpZiggVC5TVkdfVFlQRV9HLmluZGV4T2YodHlwZSkgIT09IC0xICkgZy5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG4gICAgICAgIHJldHVybiBnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXIgOiBmdW5jdGlvbiggZG9tICl7XHJcblxyXG4gICAgICAgIFQucHVyZ2UoIGRvbSApO1xyXG4gICAgICAgIHdoaWxlIChkb20uZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICBpZiAoIGRvbS5maXJzdENoaWxkLmZpcnN0Q2hpbGQgKSBULmNsZWFyKCBkb20uZmlyc3RDaGlsZCApO1xyXG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2hpbGQoIGRvbS5maXJzdENoaWxkICk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHB1cmdlIDogZnVuY3Rpb24gKCBkb20gKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gZG9tLmF0dHJpYnV0ZXMsIGksIG47XHJcbiAgICAgICAgaWYgKGEpIHtcclxuICAgICAgICAgICAgaSA9IGEubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICAgICAgbiA9IGFbaV0ubmFtZTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZG9tW25dID09PSAnZnVuY3Rpb24nKSBkb21bbl0gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGEgPSBkb20uY2hpbGROb2RlcztcclxuICAgICAgICBpZiAoYSkge1xyXG4gICAgICAgICAgICBpID0gYS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICAgICAgVC5wdXJnZSggZG9tLmNoaWxkTm9kZXNbaV0gKTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENvbG9yIGZ1bmN0aW9uXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgQ29sb3JMdW1hIDogZnVuY3Rpb24gKCBoZXgsIGwgKSB7XHJcblxyXG4gICAgICAgIGlmKCBoZXggPT09ICduJyApIGhleCA9ICcjMDAwJztcclxuXHJcbiAgICAgICAgLy8gdmFsaWRhdGUgaGV4IHN0cmluZ1xyXG4gICAgICAgIGhleCA9IFN0cmluZyhoZXgpLnJlcGxhY2UoL1teMC05YS1mXS9naSwgJycpO1xyXG4gICAgICAgIGlmIChoZXgubGVuZ3RoIDwgNikge1xyXG4gICAgICAgICAgICBoZXggPSBoZXhbMF0raGV4WzBdK2hleFsxXStoZXhbMV0raGV4WzJdK2hleFsyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbCA9IGwgfHwgMDtcclxuXHJcbiAgICAgICAgLy8gY29udmVydCB0byBkZWNpbWFsIGFuZCBjaGFuZ2UgbHVtaW5vc2l0eVxyXG4gICAgICAgIGxldCByZ2IgPSBcIiNcIiwgYywgaTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICAgICAgICAgIGMgPSBwYXJzZUludChoZXguc3Vic3RyKGkqMiwyKSwgMTYpO1xyXG4gICAgICAgICAgICBjID0gTWF0aC5yb3VuZChNYXRoLm1pbihNYXRoLm1heCgwLCBjICsgKGMgKiBsKSksIDI1NSkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgcmdiICs9IChcIjAwXCIrYykuc3Vic3RyKGMubGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZ2I7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBmaW5kRGVlcEludmVyOiBmdW5jdGlvbiAoIGMgKSB7IFxyXG5cclxuICAgICAgICByZXR1cm4gKGNbMF0gKiAwLjMgKyBjWzFdICogLjU5ICsgY1syXSAqIC4xMSkgPD0gMC42O1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgaGV4VG9IdG1sOiBmdW5jdGlvbiAoIHYgKSB7IFxyXG4gICAgICAgIHYgPSB2ID09PSB1bmRlZmluZWQgPyAweDAwMDAwMCA6IHY7XHJcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgKFwiMDAwMDAwXCIgKyB2LnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgaHRtbFRvSGV4OiBmdW5jdGlvbiAoIHYgKSB7IFxyXG5cclxuICAgICAgICByZXR1cm4gdi50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoXCIjXCIsIFwiMHhcIik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1MjU1OiBmdW5jdGlvbiAoYywgaSkge1xyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoYy5zdWJzdHJpbmcoaSwgaSArIDIpLCAxNikgLyAyNTU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1MTY6IGZ1bmN0aW9uICggYywgaSApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGMuc3Vic3RyaW5nKGksIGkgKyAxKSwgMTYpIC8gMTU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1bnBhY2s6IGZ1bmN0aW9uKCBjICl7XHJcblxyXG4gICAgICAgIGlmIChjLmxlbmd0aCA9PSA3KSByZXR1cm4gWyBULnUyNTUoYywgMSksIFQudTI1NShjLCAzKSwgVC51MjU1KGMsIDUpIF07XHJcbiAgICAgICAgZWxzZSBpZiAoYy5sZW5ndGggPT0gNCkgcmV0dXJuIFsgVC51MTYoYywxKSwgVC51MTYoYywyKSwgVC51MTYoYywzKSBdO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaHRtbFJnYjogZnVuY3Rpb24oIGMgKXtcclxuXHJcbiAgICAgICAgcmV0dXJuICdyZ2IoJyArIE1hdGgucm91bmQoY1swXSAqIDI1NSkgKyAnLCcrIE1hdGgucm91bmQoY1sxXSAqIDI1NSkgKyAnLCcrIE1hdGgucm91bmQoY1syXSAqIDI1NSkgKyAnKSc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwYWQ6IGZ1bmN0aW9uKCBuICl7XHJcbiAgICAgICAgaWYobi5sZW5ndGggPT0gMSluID0gJzAnICsgbjtcclxuICAgICAgICByZXR1cm4gbjtcclxuICAgIH0sXHJcblxyXG4gICAgcmdiVG9IZXggOiBmdW5jdGlvbiggYyApe1xyXG5cclxuICAgICAgICBsZXQgciA9IE1hdGgucm91bmQoY1swXSAqIDI1NSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgIGxldCBnID0gTWF0aC5yb3VuZChjWzFdICogMjU1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgbGV0IGIgPSBNYXRoLnJvdW5kKGNbMl0gKiAyNTUpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICByZXR1cm4gJyMnICsgVC5wYWQocikgKyBULnBhZChnKSArIFQucGFkKGIpO1xyXG5cclxuICAgICAgIC8vIHJldHVybiAnIycgKyAoICcwMDAwMDAnICsgKCAoIGNbMF0gKiAyNTUgKSA8PCAxNiBeICggY1sxXSAqIDI1NSApIDw8IDggXiAoIGNbMl0gKiAyNTUgKSA8PCAwICkudG9TdHJpbmcoIDE2ICkgKS5zbGljZSggLSA2ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBodWVUb1JnYjogZnVuY3Rpb24oIHAsIHEsIHQgKXtcclxuXHJcbiAgICAgICAgaWYgKCB0IDwgMCApIHQgKz0gMTtcclxuICAgICAgICBpZiAoIHQgPiAxICkgdCAtPSAxO1xyXG4gICAgICAgIGlmICggdCA8IDEgLyA2ICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogdDtcclxuICAgICAgICBpZiAoIHQgPCAxIC8gMiApIHJldHVybiBxO1xyXG4gICAgICAgIGlmICggdCA8IDIgLyAzICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogKCAyIC8gMyAtIHQgKTtcclxuICAgICAgICByZXR1cm4gcDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJnYlRvSHNsOiBmdW5jdGlvbiAoIGMgKSB7XHJcblxyXG4gICAgICAgIGxldCByID0gY1swXSwgZyA9IGNbMV0sIGIgPSBjWzJdLCBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSwgbWF4ID0gTWF0aC5tYXgociwgZywgYiksIGRlbHRhID0gbWF4IC0gbWluLCBoID0gMCwgcyA9IDAsIGwgPSAobWluICsgbWF4KSAvIDI7XHJcbiAgICAgICAgaWYgKGwgPiAwICYmIGwgPCAxKSBzID0gZGVsdGEgLyAobCA8IDAuNSA/ICgyICogbCkgOiAoMiAtIDIgKiBsKSk7XHJcbiAgICAgICAgaWYgKGRlbHRhID4gMCkge1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IHIgJiYgbWF4ICE9IGcpIGggKz0gKGcgLSBiKSAvIGRlbHRhO1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IGcgJiYgbWF4ICE9IGIpIGggKz0gKDIgKyAoYiAtIHIpIC8gZGVsdGEpO1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IGIgJiYgbWF4ICE9IHIpIGggKz0gKDQgKyAociAtIGcpIC8gZGVsdGEpO1xyXG4gICAgICAgICAgICBoIC89IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbIGgsIHMsIGwgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGhzbFRvUmdiOiBmdW5jdGlvbiAoIGMgKSB7XHJcblxyXG4gICAgICAgIGxldCBwLCBxLCBoID0gY1swXSwgcyA9IGNbMV0sIGwgPSBjWzJdO1xyXG5cclxuICAgICAgICBpZiAoIHMgPT09IDAgKSByZXR1cm4gWyBsLCBsLCBsIF07XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHEgPSBsIDw9IDAuNSA/IGwgKiAocyArIDEpIDogbCArIHMgLSAoIGwgKiBzICk7XHJcbiAgICAgICAgICAgIHAgPSBsICogMiAtIHE7XHJcbiAgICAgICAgICAgIHJldHVybiBbIFQuaHVlVG9SZ2IocCwgcSwgaCArIDAuMzMzMzMpLCBULmh1ZVRvUmdiKHAsIHEsIGgpLCBULmh1ZVRvUmdiKHAsIHEsIGggLSAwLjMzMzMzKSBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU1ZHIE1PREVMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbWFrZUdyYWRpYW50OiBmdW5jdGlvbiAoIHR5cGUsIHNldHRpbmdzLCBwYXJlbnQsIGNvbG9ycyApIHtcclxuXHJcbiAgICAgICAgVC5kb20oIHR5cGUsIG51bGwsIHNldHRpbmdzLCBwYXJlbnQsIDAgKTtcclxuXHJcbiAgICAgICAgbGV0IG4gPSBwYXJlbnQuY2hpbGROb2Rlc1swXS5jaGlsZE5vZGVzLmxlbmd0aCAtIDEsIGM7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgY29sb3JzLmxlbmd0aDsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBjID0gY29sb3JzW2ldO1xyXG4gICAgICAgICAgICAvL1QuZG9tKCAnc3RvcCcsIG51bGwsIHsgb2Zmc2V0OmNbMF0rJyUnLCBzdHlsZTonc3RvcC1jb2xvcjonK2NbMV0rJzsgc3RvcC1vcGFjaXR5OicrY1syXSsnOycgfSwgcGFyZW50LCBbMCxuXSApO1xyXG4gICAgICAgICAgICBULmRvbSggJ3N0b3AnLCBudWxsLCB7IG9mZnNldDpjWzBdKyclJywgJ3N0b3AtY29sb3InOmNbMV0sICAnc3RvcC1vcGFjaXR5JzpjWzJdIH0sIHBhcmVudCwgWzAsbl0gKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyptYWtlR3JhcGg6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjg7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IDM0O1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo0LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgLy9ULmRvbSggJ3JlY3QnLCAnJywgeyB4OjEwLCB5OjEwLCB3aWR0aDoxMDgsIGhlaWdodDoxMDgsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6VC5jb2xvcnMuYnV0dG9uLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjggfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMrNywgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo3ICwgZmlsbDonbm9uZSd9LCBzdmcgKTsvLzJcclxuICAgICAgICAvL1QuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZToncmdiYSgyNTUsMjU1LDI1NSwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J3JvdW5kJywgJ3N0cm9rZS1vcGFjaXR5JzowLjUgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgVC5ncmFwaCA9IHN2ZztcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgbWFrZUtub2I6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMTI4O1xyXG4gICAgICAgIGxldCByYWRpdXMgPSAzNDtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6VC5jb2xvcnMuYnV0dG9uLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjggfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOlQuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOjQsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcgfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzKzcsIHN0cm9rZToncmdiYSgwLDAsMCwwLjEpJywgJ3N0cm9rZS13aWR0aCc6NyAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOidyZ2JhKDI1NSwyNTUsMjU1LDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoyLCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzoncm91bmQnLCAnc3Ryb2tlLW9wYWNpdHknOjAuNSB9LCBzdmcgKTsvLzNcclxuICAgICAgICBULmtub2IgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlQ2lyY3VsYXI6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMTI4O1xyXG4gICAgICAgIGxldCByYWRpdXMgPSA0MDtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIHN0cm9rZToncmdiYSgwLDAsMCwwLjEpJywgJ3N0cm9rZS13aWR0aCc6MTAsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo3LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgVC5jaXJjdWxhciA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VKb3lzdGljazogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgLy8rJyBiYWNrZ3JvdW5kOiNmMDA7J1xyXG5cclxuICAgICAgICBsZXQgdyA9IDEyOCwgY2NjO1xyXG4gICAgICAgIGxldCByYWRpdXMgPSBNYXRoLmZsb29yKCh3LTMwKSowLjUpO1xyXG4gICAgICAgIGxldCBpbm5lclJhZGl1cyA9IE1hdGguZmxvb3IocmFkaXVzKjAuNik7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdkZWZzJywgbnVsbCwge30sIHN2ZyApO1xyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHt9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgaWYoIG1vZGVsID09PSAwICl7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAgICAgLy8gZ3JhZGlhbiBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzQwLCAncmdiKDAsMCwwKScsIDAuM10sIFs4MCwgJ3JnYigwLDAsMCknLCAwXSwgWzkwLCAncmdiKDUwLDUwLDUwKScsIDAuNF0sIFsxMDAsICdyZ2IoNTAsNTAsNTApJywgMF0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWQnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhZGlhbiBzaGFkb3dcclxuICAgICAgICAgICAgY2NjID0gWyBbNjAsICdyZ2IoMCwwLDApJywgMC41XSwgWzEwMCwgJ3JnYigwLDAsMCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZFMnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhZGlhbiBzdGlja1xyXG4gICAgICAgICAgICBsZXQgY2MwID0gWydyZ2IoNDAsNDAsNDApJywgJ3JnYig0OCw0OCw0OCknLCAncmdiKDMwLDMwLDMwKSddO1xyXG4gICAgICAgICAgICBsZXQgY2MxID0gWydyZ2IoMSw5MCwxOTcpJywgJ3JnYigzLDk1LDIwNyknLCAncmdiKDAsNjUsMTY3KSddO1xyXG5cclxuICAgICAgICAgICAgY2NjID0gWyBbMzAsIGNjMFswXSwgMV0sIFs2MCwgY2MwWzFdLCAxXSwgWzgwLCBjYzBbMV0sIDFdLCBbMTAwLCBjYzBbMl0sIDFdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkSW4nLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgY2NjID0gWyBbMzAsIGNjMVswXSwgMV0sIFs2MCwgY2MxWzFdLCAxXSwgWzgwLCBjYzFbMV0sIDFdLCBbMTAwLCBjYzFbMl0sIDFdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkSW4yJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYXBoXHJcblxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6J3VybCgjZ3JhZCknIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0KzUsIGN5OjY0KzEwLCByOmlubmVyUmFkaXVzKzEwLCBmaWxsOid1cmwoI2dyYWRTKScgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOmlubmVyUmFkaXVzLCBmaWxsOid1cmwoI2dyYWRJbiknIH0sIHN2ZyApOy8vNFxyXG5cclxuICAgICAgICAgICAgVC5qb3lzdGlja18wID0gc3ZnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgLy8gZ3JhZGlhbiBzaGFkb3dcclxuICAgICAgICAgICAgY2NjID0gWyBbNjksICdyZ2IoMCwwLDApJywgMF0sWzcwLCAncmdiKDAsMCwwKScsIDAuM10sIFsxMDAsICdyZ2IoMCwwLDApJywgMF0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRYJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDonbm9uZScsIHN0cm9rZToncmdiYSgxMDAsMTAwLDEwMCwwLjI1KScsICdzdHJva2Utd2lkdGgnOic0JyB9LCBzdmcgKTsvLzJcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMrMTQsIGZpbGw6J3VybCgjZ3JhZFgpJyB9LCBzdmcgKTsvLzNcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMsIGZpbGw6J25vbmUnLCBzdHJva2U6J3JnYigxMDAsMTAwLDEwMCknLCAnc3Ryb2tlLXdpZHRoJzonNCcgfSwgc3ZnICk7Ly80XHJcblxyXG4gICAgICAgICAgICBULmpveXN0aWNrXzEgPSBzdmc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VDb2xvclJpbmc6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAyNTY7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdkZWZzJywgbnVsbCwge30sIHN2ZyApO1xyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHt9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSAzMDsvL3N0cm9rZVxyXG4gICAgICAgIGxldCByID0oIHctcyApKjAuNTtcclxuICAgICAgICBsZXQgbWlkID0gdyowLjU7XHJcbiAgICAgICAgbGV0IG4gPSAyNCwgbnVkZ2UgPSA4IC8gciAvIG4gKiBNYXRoLlBJLCBhMSA9IDAsIGQxO1xyXG4gICAgICAgIGxldCBhbSwgdGFuLCBkMiwgYTIsIGFyLCBpLCBqLCBwYXRoLCBjY2M7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPD0gbjsgKytpKSB7XHJcblxyXG4gICAgICAgICAgICBkMiA9IGkgLyBuO1xyXG4gICAgICAgICAgICBhMiA9IGQyICogVC5Ud29QSTtcclxuICAgICAgICAgICAgYW0gPSAoYTEgKyBhMikgKiAwLjU7XHJcbiAgICAgICAgICAgIHRhbiA9IDEgLyBNYXRoLmNvcygoYTIgLSBhMSkgKiAwLjUpO1xyXG5cclxuICAgICAgICAgICAgYXIgPSBbXHJcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihhMSksIC1NYXRoLmNvcyhhMSksIFxyXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oYW0pICogdGFuLCAtTWF0aC5jb3MoYW0pICogdGFuLCBcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGEyKSwgLU1hdGguY29zKGEyKVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29sb3JbMV0gPSBULnJnYlRvSGV4KCBULmhzbFRvUmdiKFtkMiwgMSwgMC41XSkgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGogPSA2O1xyXG4gICAgICAgICAgICAgICAgd2hpbGUoai0tKXtcclxuICAgICAgICAgICAgICAgICAgIGFyW2pdID0gKChhcltqXSpyKSttaWQpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGF0aCA9ICcgTScgKyBhclswXSArICcgJyArIGFyWzFdICsgJyBRJyArIGFyWzJdICsgJyAnICsgYXJbM10gKyAnICcgKyBhcls0XSArICcgJyArIGFyWzVdO1xyXG5cclxuICAgICAgICAgICAgICAgIGNjYyA9IFsgWzAsY29sb3JbMF0sMV0sIFsxMDAsY29sb3JbMV0sMV0gXTtcclxuICAgICAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHJytpLCB4MTphclswXSwgeTE6YXJbMV0sIHgyOmFyWzRdLCB5Mjphcls1XSwgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOnBhdGgsICdzdHJva2Utd2lkdGgnOnMsIHN0cm9rZTondXJsKCNHJytpKycpJywgJ3N0cm9rZS1saW5lY2FwJzpcImJ1dHRcIiB9LCBzdmcsIDEgKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGExID0gYTIgLSBudWRnZTsgXHJcbiAgICAgICAgICAgIGNvbG9yWzBdID0gY29sb3JbMV07XHJcbiAgICAgICAgICAgIGQxID0gZDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYnIgPSAoMTI4IC0gcyApICsgMjtcclxuICAgICAgICBsZXQgYncgPSA2MDtcclxuXHJcbiAgICAgICAgbGV0IHR3ID0gODQuOTA7XHJcblxyXG4gICAgICAgIC8vIGJsYWNrIC8gd2hpdGVcclxuICAgICAgICBjY2MgPSBbIFswLCAnI0ZGRkZGRicsIDFdLCBbNTAsICcjRkZGRkZGJywgMF0sIFs1MCwgJyMwMDAwMDAnLCAwXSwgWzEwMCwgJyMwMDAwMDAnLCAxXSBdO1xyXG4gICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHTDAnLCB4MTowLCB5MTptaWQtdHcsIHgyOjAsIHkyOm1pZCt0dywgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgY2NjID0gWyBbMCwgJyM3ZjdmN2YnLCAxXSwgWzUwLCAnIzdmN2Y3ZicsIDAuNV0sIFsxMDAsICcjN2Y3ZjdmJywgMF0gXTtcclxuICAgICAgICBULm1ha2VHcmFkaWFudCggJ2xpbmVhckdyYWRpZW50JywgeyBpZDonR0wxJywgeDE6bWlkLTQ5LjA1LCB5MTowLCB4MjptaWQrOTgsIHkyOjAsIGdyYWRpZW50VW5pdHM6XCJ1c2VyU3BhY2VPblVzZVwiIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHsgJ3RyYW5zZm9ybS1vcmlnaW4nOiAnMTI4cHggMTI4cHgnLCAndHJhbnNmb3JtJzoncm90YXRlKDApJyB9LCBzdmcgKTsvLzJcclxuICAgICAgICBULmRvbSggJ3BvbHlnb24nLCAnJywgeyBwb2ludHM6Jzc4Ljk1IDQzLjEgNzguOTUgMjEyLjg1IDIyNiAxMjgnLCAgZmlsbDoncmVkJyAgfSwgc3ZnLCAyICk7Ly8gMiwwXHJcbiAgICAgICAgVC5kb20oICdwb2x5Z29uJywgJycsIHsgcG9pbnRzOic3OC45NSA0My4xIDc4Ljk1IDIxMi44NSAyMjYgMTI4JywgIGZpbGw6J3VybCgjR0wxKScsJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOid1cmwoI0dMMSknICB9LCBzdmcsIDIgKTsvLzIsMVxyXG4gICAgICAgIFQuZG9tKCAncG9seWdvbicsICcnLCB7IHBvaW50czonNzguOTUgNDMuMSA3OC45NSAyMTIuODUgMjI2IDEyOCcsICBmaWxsOid1cmwoI0dMMCknLCdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTondXJsKCNHTDApJyAgfSwgc3ZnLCAyICk7Ly8yLDJcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOidNIDI1NS43NSAxMzYuNSBRIDI1NiAxMzIuMyAyNTYgMTI4IDI1NiAxMjMuNyAyNTUuNzUgMTE5LjUgTCAyNDEgMTI4IDI1NS43NSAxMzYuNSBaJywgIGZpbGw6J25vbmUnLCdzdHJva2Utd2lkdGgnOjIsIHN0cm9rZTonIzAwMCcgIH0sIHN2ZywgMiApOy8vMiwzXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjEyOCsxMTMsIGN5OjEyOCwgcjo2LCAnc3Ryb2tlLXdpZHRoJzozLCBzdHJva2U6JyMwMDAnLCBmaWxsOidub25lJyB9LCBzdmcsIDIgKTsvLzIuM1xyXG5cclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjEyOCwgY3k6MTI4LCByOjYsICdzdHJva2Utd2lkdGgnOjIsIHN0cm9rZTonIzAwMCcsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vM1xyXG5cclxuICAgICAgICBULmNvbG9yUmluZyA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGljb246IGZ1bmN0aW9uICggdHlwZSwgY29sb3IsIHcgKXtcclxuXHJcbiAgICAgICAgdyA9IHcgfHwgNDA7XHJcbiAgICAgICAgY29sb3IgPSBjb2xvciB8fCAnI0RFREVERSc7XHJcbiAgICAgICAgbGV0IHZpZXdCb3ggPSAnMCAwIDI1NiAyNTYnO1xyXG4gICAgICAgIGxldCB0ID0gW1wiPHN2ZyB4bWxucz0nXCIrVC5zdmducytcIicgdmVyc2lvbj0nMS4xJyB4bWxuczp4bGluaz0nXCIrVC5odG1scytcIicgc3R5bGU9J3BvaW50ZXItZXZlbnRzOm5vbmU7JyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSd4TWluWU1heCBtZWV0JyB4PScwcHgnIHk9JzBweCcgd2lkdGg9J1wiK3crXCJweCcgaGVpZ2h0PSdcIit3K1wicHgnIHZpZXdCb3g9J1wiK3ZpZXdCb3grXCInPjxnPlwiXTtcclxuICAgICAgICBzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xvZ28nOlxyXG4gICAgICAgICAgICAvL3RbMV09XCI8cGF0aCBpZD0nbG9nb2luJyBzdHJva2U9J1wiK2NvbG9yK1wiJyBzdHJva2Utd2lkdGg9JzE2JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0nc3F1YXJlJyBmaWxsPSdub25lJyBkPSdNIDE5MiA0NCBMIDE5MiAxNDggUSAxOTIgMTc0LjUgMTczLjMgMTkzLjI1IDE1NC41NSAyMTIgMTI4IDIxMiAxMDEuNSAyMTIgODIuNzUgMTkzLjI1IDY0IDE3NC41IDY0IDE0OCBMIDY0IDQ0IE0gMTYwIDQ0IEwgMTYwIDE0OCBRIDE2MCAxNjEuMjUgMTUwLjY1IDE3MC42NSAxNDEuMjUgMTgwIDEyOCAxODAgMTE0Ljc1IDE4MCAxMDUuMzUgMTcwLjY1IDk2IDE2MS4yNSA5NiAxNDggTCA5NiA0NCcvPlwiO1xyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgZmlsbD0nXCIrY29sb3IrXCInIHN0cm9rZT0nbm9uZScgZD0nXCIrVC5sb2dvRmlsbF9kK1wiJy8+XCI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2F2ZSc6XHJcbiAgICAgICAgICAgIHRbMV09XCI8cGF0aCBzdHJva2U9J1wiK2NvbG9yK1wiJyBzdHJva2Utd2lkdGg9JzQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgZmlsbD0nbm9uZScgZD0nTSAyNi4xMjUgMTcgTCAyMCAyMi45NSAxNC4wNSAxNyBNIDIwIDkuOTUgTCAyMCAyMi45NScvPjxwYXRoIHN0cm9rZT0nXCIrY29sb3IrXCInIHN0cm9rZS13aWR0aD0nMi41JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIGZpbGw9J25vbmUnIGQ9J00gMzIuNiAyMyBMIDMyLjYgMjUuNSBRIDMyLjYgMjguNSAyOS42IDI4LjUgTCAxMC42IDI4LjUgUSA3LjYgMjguNSA3LjYgMjUuNSBMIDcuNiAyMycvPlwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdFsyXSA9IFwiPC9nPjwvc3ZnPlwiO1xyXG4gICAgICAgIHJldHVybiB0LmpvaW4oXCJcXG5cIik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBsb2dvRmlsbF9kOiBbXHJcbiAgICBcIk0gMTcxIDE1MC43NSBMIDE3MSAzMy4yNSAxNTUuNSAzMy4yNSAxNTUuNSAxNTAuNzUgUSAxNTUuNSAxNjIuMiAxNDcuNDUgMTcwLjIgMTM5LjQ1IDE3OC4yNSAxMjggMTc4LjI1IDExNi42IDE3OC4yNSAxMDguNTUgMTcwLjIgMTAwLjUgMTYyLjIgMTAwLjUgMTUwLjc1IFwiLFxyXG4gICAgXCJMIDEwMC41IDMzLjI1IDg1IDMzLjI1IDg1IDE1MC43NSBRIDg1IDE2OC42NSA5Ny41NSAxODEuMTUgMTEwLjE1IDE5My43NSAxMjggMTkzLjc1IDE0NS45IDE5My43NSAxNTguNCAxODEuMTUgMTcxIDE2OC42NSAxNzEgMTUwLjc1IFwiLFxyXG4gICAgXCJNIDIwMCAzMy4yNSBMIDE4NCAzMy4yNSAxODQgMTUwLjggUSAxODQgMTc0LjEgMTY3LjYgMTkwLjQgMTUxLjMgMjA2LjggMTI4IDIwNi44IDEwNC43NSAyMDYuOCA4OC4zIDE5MC40IDcyIDE3NC4xIDcyIDE1MC44IEwgNzIgMzMuMjUgNTYgMzMuMjUgNTYgMTUwLjc1IFwiLFxyXG4gICAgXCJRIDU2IDE4MC41NSA3Ny4wNSAyMDEuNiA5OC4yIDIyMi43NSAxMjggMjIyLjc1IDE1Ny44IDIyMi43NSAxNzguOSAyMDEuNiAyMDAgMTgwLjU1IDIwMCAxNTAuNzUgTCAyMDAgMzMuMjUgWlwiLFxyXG4gICAgXS5qb2luKCdcXG4nKSxcclxuXHJcbn1cclxuXHJcblQuc2V0VGV4dCgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRvb2xzID0gVDsiLCJcclxuLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuLy8gSU5URU5BTCBGVU5DVElPTlxyXG5cclxuY29uc3QgUiA9IHtcclxuXHJcblx0dWk6IFtdLFxyXG5cclxuXHRJRDogbnVsbCxcclxuICAgIGxvY2s6ZmFsc2UsXHJcbiAgICB3bG9jazpmYWxzZSxcclxuICAgIGN1cnJlbnQ6LTEsXHJcblxyXG5cdG5lZWRSZVpvbmU6IHRydWUsXHJcblx0aXNFdmVudHNJbml0OiBmYWxzZSxcclxuXHJcbiAgICBwcmV2RGVmYXVsdDogWydjb250ZXh0bWVudScsICdtb3VzZWRvd24nLCAnbW91c2Vtb3ZlJywgJ21vdXNldXAnXSxcclxuXHJcblx0eG1sc2VyaWFsaXplcjogbmV3IFhNTFNlcmlhbGl6ZXIoKSxcclxuXHR0bXBUaW1lOiBudWxsLFxyXG4gICAgdG1wSW1hZ2U6IG51bGwsXHJcblxyXG4gICAgb2xkQ3Vyc29yOidhdXRvJyxcclxuXHJcbiAgICBpbnB1dDogbnVsbCxcclxuICAgIHBhcmVudDogbnVsbCxcclxuICAgIGZpcnN0SW1wdXQ6IHRydWUsXHJcbiAgICAvL2NhbGxiYWNrSW1wdXQ6IG51bGwsXHJcbiAgICBoaWRkZW5JbXB1dDpudWxsLFxyXG4gICAgaGlkZGVuU2l6ZXI6bnVsbCxcclxuICAgIGhhc0ZvY3VzOmZhbHNlLFxyXG4gICAgc3RhcnRJbnB1dDpmYWxzZSxcclxuICAgIGlucHV0UmFuZ2UgOiBbMCwwXSxcclxuICAgIGN1cnNvcklkIDogMCxcclxuICAgIHN0cjonJyxcclxuICAgIHBvczowLFxyXG4gICAgc3RhcnRYOi0xLFxyXG4gICAgbW92ZVg6LTEsXHJcblxyXG4gICAgZGVidWdJbnB1dDpmYWxzZSxcclxuXHJcbiAgICBpc0xvb3A6IGZhbHNlLFxyXG4gICAgbGlzdGVuczogW10sXHJcblxyXG4gICAgZTp7XHJcbiAgICAgICAgdHlwZTpudWxsLFxyXG4gICAgICAgIGNsaWVudFg6MCxcclxuICAgICAgICBjbGllbnRZOjAsXHJcbiAgICAgICAga2V5Q29kZTpOYU4sXHJcbiAgICAgICAga2V5Om51bGwsXHJcbiAgICAgICAgZGVsdGE6MCxcclxuICAgIH0sXHJcblxyXG4gICAgaXNNb2JpbGU6IGZhbHNlLFxyXG5cclxuICAgIFxyXG5cclxuXHRhZGQ6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgUi51aS5wdXNoKCBvICk7XHJcbiAgICAgICAgUi5nZXRab25lKCBvICk7XHJcblxyXG4gICAgICAgIGlmKCAhUi5pc0V2ZW50c0luaXQgKSBSLmluaXRFdmVudHMoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRlc3RNb2JpbGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IG4gPSBuYXZpZ2F0b3IudXNlckFnZW50O1xyXG4gICAgICAgIGlmIChuLm1hdGNoKC9BbmRyb2lkL2kpIHx8IG4ubWF0Y2goL3dlYk9TL2kpIHx8IG4ubWF0Y2goL2lQaG9uZS9pKSB8fCBuLm1hdGNoKC9pUGFkL2kpIHx8IG4ubWF0Y2goL2lQb2QvaSkgfHwgbi5tYXRjaCgvQmxhY2tCZXJyeS9pKSB8fCBuLm1hdGNoKC9XaW5kb3dzIFBob25lL2kpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBlbHNlIHJldHVybiBmYWxzZTsgIFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gUi51aS5pbmRleE9mKCBvICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCBpICE9PSAtMSApIHtcclxuICAgICAgICAgICAgUi5yZW1vdmVMaXN0ZW4oIG8gKTtcclxuICAgICAgICAgICAgUi51aS5zcGxpY2UoIGksIDEgKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggUi51aS5sZW5ndGggPT09IDAgKXtcclxuICAgICAgICAgICAgUi5yZW1vdmVFdmVudHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGluaXRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNFdmVudHNJbml0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgZG9tID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgICAgICAgUi5pc01vYmlsZSA9IFIudGVzdE1vYmlsZSgpO1xyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSApe1xyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCAnY29udGV4dG1lbnUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ3doZWVsJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgUiwgZmFsc2UgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBSLnJlc2l6ZSAsIGZhbHNlICk7XHJcbiAgICAgICAgLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIFIsIGZhbHNlICk7XHJcblxyXG4gICAgICAgIFIuaXNFdmVudHNJbml0ID0gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZUV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIVIuaXNFdmVudHNJbml0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgZG9tID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNNb2JpbGUgKXtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgUiwgZmFsc2UgKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBSICk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIFIgKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIFIucmVzaXplICApO1xyXG5cclxuICAgICAgICBSLmlzRXZlbnRzSW5pdCA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVzaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFIubmVlZFJlWm9uZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGxldCBpID0gUi51aS5sZW5ndGgsIHU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cclxuICAgICAgICAgICAgdSA9IFIudWlbaV07XHJcbiAgICAgICAgICAgIGlmKCB1LmlzR3VpICYmICF1LmlzQ2FudmFzT25seSAmJiB1LmF1dG9SZXNpemUgKSB1LnNldEhlaWdodCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSEFORExFIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgXHJcblxyXG4gICAgaGFuZGxlRXZlbnQ6IGZ1bmN0aW9uICggZXZlbnQgKSB7XHJcblxyXG4gICAgICAgIC8vaWYoIWV2ZW50LnR5cGUpIHJldHVybjtcclxuXHJcbiAgICAgIC8vICBjb25zb2xlLmxvZyggZXZlbnQudHlwZSApXHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlLmluZGV4T2YoIFIucHJldkRlZmF1bHQgKSAhPT0gLTEgKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBcclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdjb250ZXh0bWVudScgKSByZXR1cm47IFxyXG5cclxuICAgICAgICAvL2lmKCBldmVudC50eXBlID09PSAna2V5ZG93bicpeyBSLmVkaXRUZXh0KCBldmVudCApOyByZXR1cm47fVxyXG5cclxuICAgICAgICAvL2lmKCBldmVudC50eXBlICE9PSAna2V5ZG93bicgJiYgZXZlbnQudHlwZSAhPT0gJ3doZWVsJyApIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgLy9ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgUi5maW5kWm9uZSgpO1xyXG4gICAgICAgXHJcbiAgICAgICAgbGV0IGUgPSBSLmU7XHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAna2V5ZG93bicpIFIua2V5ZG93biggZXZlbnQgKTtcclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2tleXVwJykgUi5rZXl1cCggZXZlbnQgKTtcclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd3aGVlbCcgKSBlLmRlbHRhID0gZXZlbnQuZGVsdGFZID4gMCA/IDEgOiAtMTtcclxuICAgICAgICBlbHNlIGUuZGVsdGEgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGUuY2xpZW50WCA9IGV2ZW50LmNsaWVudFggfHwgMDtcclxuICAgICAgICBlLmNsaWVudFkgPSBldmVudC5jbGllbnRZIHx8IDA7XHJcbiAgICAgICAgZS50eXBlID0gZXZlbnQudHlwZTtcclxuXHJcbiAgICAgICAgLy8gbW9iaWxlXHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICl7XHJcblxyXG4gICAgICAgICAgICBpZiggZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzLmxlbmd0aCA+IDAgKXtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5jbGllbnRYIHx8IDA7XHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFkgPSBldmVudC50b3VjaGVzWyAwIF0uY2xpZW50WSB8fCAwO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0JykgZS50eXBlID0gJ21vdXNlZG93bic7XHJcbiAgICAgICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hlbmQnKSBlLnR5cGUgPSAnbW91c2V1cCdcclxuICAgICAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKSBlLnR5cGUgPSAnbW91c2Vtb3ZlJztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jyl7IGUudHlwZSA9ICdtb3VzZWRvd24nOyBSLmZpbmRJRCggZSApOyB9XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaGVuZCcpeyBlLnR5cGUgPSAnbW91c2V1cCc7ICBpZiggUi5JRCAhPT0gbnVsbCApIFIuSUQuaGFuZGxlRXZlbnQoIGUgKTsgUi5jbGVhck9sZElEKCk7IH1cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNobW92ZScpeyBlLnR5cGUgPSAnbW91c2Vtb3ZlJzsgIH1cclxuICAgICAgICAqL1xyXG5cclxuXHJcbiAgICAgICAgaWYoIGUudHlwZSA9PT0gJ21vdXNlZG93bicgKSBSLmxvY2sgPSB0cnVlO1xyXG4gICAgICAgIGlmKCBlLnR5cGUgPT09ICdtb3VzZXVwJyApIFIubG9jayA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSAmJiBlLnR5cGUgPT09ICdtb3VzZWRvd24nICkgUi5maW5kSUQoIGUgKTtcclxuICAgICAgICBpZiggZS50eXBlID09PSAnbW91c2Vtb3ZlJyAmJiAhUi5sb2NrICkgUi5maW5kSUQoIGUgKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgaWYoIFIuSUQgIT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBSLklELmlzQ2FudmFzT25seSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFggPSBSLklELm1vdXNlLng7XHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFkgPSBSLklELm1vdXNlLnk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBSLklELmhhbmRsZUV2ZW50KCBlICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIFIuaXNNb2JpbGUgJiYgZS50eXBlID09PSAnbW91c2V1cCcgKSBSLmNsZWFyT2xkSUQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSURcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBmaW5kSUQ6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBSLnVpLmxlbmd0aCwgbmV4dCA9IC0xLCB1LCB4LCB5O1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgICAgICB1ID0gUi51aVtpXTtcclxuXHJcbiAgICAgICAgICAgIGlmKCB1LmlzQ2FudmFzT25seSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICB4ID0gdS5tb3VzZS54O1xyXG4gICAgICAgICAgICAgICAgeSA9IHUubW91c2UueTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgeCA9IGUuY2xpZW50WDtcclxuICAgICAgICAgICAgICAgIHkgPSBlLmNsaWVudFk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggUi5vblpvbmUoIHUsIHgsIHkgKSApeyBcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbmV4dCA9IGk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmKCBuZXh0ICE9PSBSLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgICAgICAgICBSLmNsZWFyT2xkSUQoKTtcclxuICAgICAgICAgICAgICAgICAgICBSLmN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIFIuSUQgPSB1O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5leHQgPT09IC0xICkgUi5jbGVhck9sZElEKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhck9sZElEOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhUi5JRCApIHJldHVybjtcclxuICAgICAgICBSLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICBSLklELnJlc2V0KCk7XHJcbiAgICAgICAgUi5JRCA9IG51bGw7XHJcbiAgICAgICAgUi5jdXJzb3IoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgR1VJIC8gR1JPVVAgRlVOQ1RJT05cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjYWxjVWlzOiBmdW5jdGlvbiAoIHVpcywgem9uZSwgcHkgKSB7XHJcblxyXG4gICAgICAgIGxldCBsbmcgPSB1aXMubGVuZ3RoLCB1LCBpLCBweCA9IDAsIG15ID0gMDtcclxuXHJcbiAgICAgICAgZm9yKCBpID0gMDsgaSA8IGxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB1ID0gdWlzW2ldO1xyXG5cclxuICAgICAgICAgICAgdS56b25lLncgPSB1Lnc7XHJcbiAgICAgICAgICAgIHUuem9uZS5oID0gdS5oO1xyXG5cclxuICAgICAgICAgICAgaWYoICF1LmF1dG9XaWR0aCApe1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBweCA9PT0gMCApIHB5ICs9IHUuaCArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdS56b25lLnggPSB6b25lLnggKyBweDtcclxuICAgICAgICAgICAgICAgIHUuem9uZS55ID0gcHggPT09IDAgPyBweSAtIHUuaCA6IG15O1xyXG5cclxuICAgICAgICAgICAgICAgIG15ID0gdS56b25lLnk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHB4ICs9IHUudztcclxuICAgICAgICAgICAgICAgIGlmKCBweCArIHUudyA+IHpvbmUudyApIHB4ID0gMDtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdS56b25lLnggPSB6b25lLng7XHJcbiAgICAgICAgICAgICAgICB1LnpvbmUueSA9IHB5O1xyXG4gICAgICAgICAgICAgICAgcHkgKz0gdS5oICsgMTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCB1LmlzR3JvdXAgKSB1LmNhbGNVaXMoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG5cclxuXHRmaW5kVGFyZ2V0OiBmdW5jdGlvbiAoIHVpcywgZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB1aXMubGVuZ3RoO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCBSLm9uWm9uZSggdWlzW2ldLCBlLmNsaWVudFgsIGUuY2xpZW50WSApICkgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gLTE7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFpPTkVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBmaW5kWm9uZTogZnVuY3Rpb24gKCBmb3JjZSApIHtcclxuXHJcbiAgICAgICAgaWYoICFSLm5lZWRSZVpvbmUgJiYgIWZvcmNlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgaSA9IFIudWkubGVuZ3RoLCB1O1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7IFxyXG5cclxuICAgICAgICAgICAgdSA9IFIudWlbaV07XHJcbiAgICAgICAgICAgIFIuZ2V0Wm9uZSggdSApO1xyXG4gICAgICAgICAgICBpZiggdS5pc0d1aSApIHUuY2FsY1VpcygpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFIubmVlZFJlWm9uZSA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgb25ab25lOiBmdW5jdGlvbiAoIG8sIHgsIHkgKSB7XHJcblxyXG4gICAgICAgIGlmKCB4ID09PSB1bmRlZmluZWQgfHwgeSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgeiA9IG8uem9uZTtcclxuICAgICAgICBsZXQgbXggPSB4IC0gei54O1xyXG4gICAgICAgIGxldCBteSA9IHkgLSB6Lnk7XHJcblxyXG4gICAgICAgIGxldCBvdmVyID0gKCBteCA+PSAwICkgJiYgKCBteSA+PSAwICkgJiYgKCBteCA8PSB6LncgKSAmJiAoIG15IDw9IHouaCApO1xyXG5cclxuICAgICAgICBpZiggb3ZlciApIG8ubG9jYWwuc2V0KCBteCwgbXkgKTtcclxuICAgICAgICBlbHNlIG8ubG9jYWwubmVnKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBvdmVyO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Wm9uZTogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICBpZiggby5pc0NhbnZhc09ubHkgKSByZXR1cm47XHJcbiAgICAgICAgbGV0IHIgPSBvLmdldERvbSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIG8uem9uZSA9IHsgeDpyLmxlZnQsIHk6ci50b3AsIHc6ci53aWR0aCwgaDpyLmhlaWdodCB9O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDVVJTT1JcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjdXJzb3I6IGZ1bmN0aW9uICggbmFtZSApIHtcclxuXHJcbiAgICAgICAgbmFtZSA9IG5hbWUgPyBuYW1lIDogJ2F1dG8nO1xyXG4gICAgICAgIGlmKCBuYW1lICE9PSBSLm9sZEN1cnNvciApe1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IG5hbWU7XHJcbiAgICAgICAgICAgIFIub2xkQ3Vyc29yID0gbmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENBTlZBU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHRvQ2FudmFzOiBmdW5jdGlvbiAoIG8sIHcsIGgsIGZvcmNlICkge1xyXG5cclxuICAgICAgICAvLyBwcmV2ZW50IGV4ZXNpdmUgcmVkcmF3XHJcblxyXG4gICAgICAgIGlmKCBmb3JjZSAmJiBSLnRtcFRpbWUgIT09IG51bGwgKSB7IGNsZWFyVGltZW91dChSLnRtcFRpbWUpOyBSLnRtcFRpbWUgPSBudWxsOyAgfVxyXG5cclxuICAgICAgICBpZiggUi50bXBUaW1lICE9PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiggUi5sb2NrICkgUi50bXBUaW1lID0gc2V0VGltZW91dCggZnVuY3Rpb24oKXsgUi50bXBUaW1lID0gbnVsbDsgfSwgMTAgKTtcclxuXHJcbiAgICAgICAgLy8vXHJcblxyXG4gICAgICAgIGxldCBpc05ld1NpemUgPSBmYWxzZTtcclxuICAgICAgICBpZiggdyAhPT0gby5jYW52YXMud2lkdGggfHwgaCAhPT0gby5jYW52YXMuaGVpZ2h0ICkgaXNOZXdTaXplID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIFIudG1wSW1hZ2UgPT09IG51bGwgKSBSLnRtcEltYWdlID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIGxldCBpbWcgPSBSLnRtcEltYWdlOyAvL25ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICBsZXQgaHRtbFN0cmluZyA9IFIueG1sc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyggby5jb250ZW50ICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN2ZyA9ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIicrdysnXCIgaGVpZ2h0PVwiJytoKydcIj48Zm9yZWlnbk9iamVjdCBzdHlsZT1cInBvaW50ZXItZXZlbnRzOiBub25lOyBsZWZ0OjA7XCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPicrIGh0bWxTdHJpbmcgKyc8L2ZvcmVpZ25PYmplY3Q+PC9zdmc+JztcclxuXHJcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgbGV0IGN0eCA9IG8uY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpc05ld1NpemUgKXsgXHJcbiAgICAgICAgICAgICAgICBvLmNhbnZhcy53aWR0aCA9IHc7XHJcbiAgICAgICAgICAgICAgICBvLmNhbnZhcy5oZWlnaHQgPSBoXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCggMCwgMCwgdywgaCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoIHRoaXMsIDAsIDAgKTtcclxuXHJcbiAgICAgICAgICAgIG8ub25EcmF3KCk7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHN2Zyk7XHJcbiAgICAgICAgLy9pbWcuc3JjID0gJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJysgd2luZG93LmJ0b2EoIHN2ZyApO1xyXG4gICAgICAgIGltZy5jcm9zc09yaWdpbiA9ICcnO1xyXG5cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRIaWRkZW46IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaGlkZGVuSW1wdXQgPT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBoaWRlID0gUi5kZWJ1Z0lucHV0ID8gJycgOiAnb3BhY2l0eTowOyB6SW5kZXg6MDsnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNzcyA9IFIucGFyZW50LmNzcy50eHQgKyAncGFkZGluZzowOyB3aWR0aDphdXRvOyBoZWlnaHQ6YXV0bzsgdGV4dC1zaGFkb3c6bm9uZTsnXHJcbiAgICAgICAgICAgIGNzcyArPSAnbGVmdDoxMHB4OyB0b3A6YXV0bzsgYm9yZGVyOm5vbmU7IGNvbG9yOiNGRkY7IGJhY2tncm91bmQ6IzAwMDsnICsgaGlkZTtcclxuXHJcbiAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0LnR5cGUgPSAndGV4dCc7XHJcbiAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuc3R5bGUuY3NzVGV4dCA9IGNzcyArICdib3R0b206MzBweDsnICsgKFIuZGVidWdJbnB1dCA/ICcnIDogJ3RyYW5zZm9ybTpzY2FsZSgwKTsnKTs7XHJcblxyXG4gICAgICAgICAgICBSLmhpZGRlblNpemVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIFIuaGlkZGVuU2l6ZXIuc3R5bGUuY3NzVGV4dCA9IGNzcyArICdib3R0b206NjBweDsnO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggUi5oaWRkZW5JbXB1dCApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBSLmhpZGRlblNpemVyICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUi5oaWRkZW5JbXB1dC5zdHlsZS53aWR0aCA9IFIuaW5wdXQuY2xpZW50V2lkdGggKyAncHgnO1xyXG4gICAgICAgIFIuaGlkZGVuSW1wdXQudmFsdWUgPSBSLnN0cjtcclxuICAgICAgICBSLmhpZGRlblNpemVyLmlubmVySFRNTCA9IFIuc3RyO1xyXG5cclxuICAgICAgICBSLmhhc0ZvY3VzID0gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFySGlkZGVuOiBmdW5jdGlvbiAoIHAgKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLmhpZGRlbkltcHV0ID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIFIuaGFzRm9jdXMgPSBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsaWNrUG9zOiBmdW5jdGlvbiggeCApe1xyXG5cclxuICAgICAgICBsZXQgaSA9IFIuc3RyLmxlbmd0aCwgbCA9IDAsIG4gPSAwO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgbCArPSBSLnRleHRXaWR0aCggUi5zdHJbbl0gKTtcclxuICAgICAgICAgICAgaWYoIGwgPj0geCApIGJyZWFrO1xyXG4gICAgICAgICAgICBuKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBJbnB1dDogZnVuY3Rpb24gKCB4LCBkb3duICkge1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQgPT09IG51bGwgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG4gICAgIFxyXG4gICAgICAgIGlmKCBkb3duICl7XHJcblxyXG4gICAgICAgICAgICBsZXQgaWQgPSBSLmNsaWNrUG9zKCB4ICk7XHJcblxyXG4gICAgICAgICAgICBSLm1vdmVYID0gaWQ7XHJcblxyXG4gICAgICAgICAgICBpZiggUi5zdGFydFggPT09IC0xICl7IFxyXG5cclxuICAgICAgICAgICAgICAgIFIuc3RhcnRYID0gaWQ7XHJcbiAgICAgICAgICAgICAgICBSLmN1cnNvcklkID0gaWQ7XHJcbiAgICAgICAgICAgICAgICBSLmlucHV0UmFuZ2UgPSBbIFIuc3RhcnRYLCBSLnN0YXJ0WCBdO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgaXNTZWxlY3Rpb24gPSBSLm1vdmVYICE9PSBSLnN0YXJ0WDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggaXNTZWxlY3Rpb24gKXtcclxuICAgICAgICAgICAgICAgICAgICBpZiggUi5zdGFydFggPiBSLm1vdmVYICkgUi5pbnB1dFJhbmdlID0gWyBSLm1vdmVYLCBSLnN0YXJ0WCBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgUi5pbnB1dFJhbmdlID0gWyBSLnN0YXJ0WCwgUi5tb3ZlWCBdOyAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdXAgPSB0cnVlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuc3RhcnRYICE9PSAtMSApe1xyXG5cclxuICAgICAgICAgICAgICAgIFIuaGFzRm9jdXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25TdGFydCA9IFIuaW5wdXRSYW5nZVswXTtcclxuICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uRW5kID0gUi5pbnB1dFJhbmdlWzFdO1xyXG4gICAgICAgICAgICAgICAgUi5zdGFydFggPSAtMTtcclxuXHJcbiAgICAgICAgICAgICAgICB1cCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHVwICkgUi5zZWxlY3RQYXJlbnQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2VsZWN0UGFyZW50OiBmdW5jdGlvbiAoKXtcclxuXHJcbiAgICAgICAgdmFyIGMgPSBSLnRleHRXaWR0aCggUi5zdHIuc3Vic3RyaW5nKCAwLCBSLmN1cnNvcklkICkpO1xyXG4gICAgICAgIHZhciBlID0gUi50ZXh0V2lkdGgoIFIuc3RyLnN1YnN0cmluZyggMCwgUi5pbnB1dFJhbmdlWzBdICkpO1xyXG4gICAgICAgIHZhciBzID0gUi50ZXh0V2lkdGgoIFIuc3RyLnN1YnN0cmluZyggUi5pbnB1dFJhbmdlWzBdLCAgUi5pbnB1dFJhbmdlWzFdICkpO1xyXG5cclxuICAgICAgICBSLnBhcmVudC5zZWxlY3QoIGMsIGUsIHMgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRleHRXaWR0aDogZnVuY3Rpb24gKCB0ZXh0ICl7XHJcblxyXG4gICAgICAgIGlmKCBSLmhpZGRlblNpemVyID09PSBudWxsICkgcmV0dXJuIDA7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvIC9nLCAnJm5ic3A7Jyk7XHJcbiAgICAgICAgUi5oaWRkZW5TaXplci5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgIHJldHVybiBSLmhpZGRlblNpemVyLmNsaWVudFdpZHRoO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIGNsZWFySW5wdXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGlmKCAhUi5maXJzdEltcHV0ICkgUi5wYXJlbnQudmFsaWRhdGUoIHRydWUgKTtcclxuXHJcbiAgICAgICAgUi5jbGVhckhpZGRlbigpO1xyXG4gICAgICAgIFIucGFyZW50LnVuc2VsZWN0KCk7XHJcblxyXG4gICAgICAgIC8vUi5pbnB1dC5zdHlsZS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xyXG4gICAgICAgIFIuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9IFIucGFyZW50LmNvbG9ycy5pbnB1dEJnO1xyXG4gICAgICAgIFIuaW5wdXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBSLnBhcmVudC5jb2xvcnMuaW5wdXRCb3JkZXI7XHJcbiAgICAgICAgUi5wYXJlbnQuaXNFZGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIFIuaW5wdXQgPSBudWxsO1xyXG4gICAgICAgIFIucGFyZW50ID0gbnVsbDtcclxuICAgICAgICBSLnN0ciA9ICcnLFxyXG4gICAgICAgIFIuZmlyc3RJbXB1dCA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRJbnB1dDogZnVuY3Rpb24gKCBJbnB1dCwgcGFyZW50ICkge1xyXG5cclxuICAgICAgICBSLmNsZWFySW5wdXQoKTtcclxuICAgICAgICBcclxuICAgICAgICBSLmlucHV0ID0gSW5wdXQ7XHJcbiAgICAgICAgUi5wYXJlbnQgPSBwYXJlbnQ7XHJcblxyXG4gICAgICAgIFIuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9IFIucGFyZW50LmNvbG9ycy5pbnB1dE92ZXI7XHJcbiAgICAgICAgUi5pbnB1dC5zdHlsZS5ib3JkZXJDb2xvciA9IFIucGFyZW50LmNvbG9ycy5pbnB1dEJvcmRlclNlbGVjdDtcclxuICAgICAgICBSLnN0ciA9IFIuaW5wdXQudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIFIuc2V0SGlkZGVuKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKnNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCggXCJzZWxlY3RhbGxcIiwgbnVsbCwgZmFsc2UgKTtcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAga2V5ZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQgPT09IG51bGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBrZXlDb2RlID0gZS53aGljaCwgaXNTaGlmdCA9IGUuc2hpZnRLZXk7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coIGtleUNvZGUgKVxyXG5cclxuICAgICAgICBSLmZpcnN0SW1wdXQgPSBmYWxzZTtcclxuXHJcblxyXG4gICAgICAgIGlmIChSLmhhc0ZvY3VzKSB7XHJcbiAgICAgICAgICAgIC8vIGhhY2sgdG8gZml4IHRvdWNoIGV2ZW50IGJ1ZyBpbiBpT1MgU2FmYXJpXHJcbiAgICAgICAgICAgIHdpbmRvdy5mb2N1cygpO1xyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIFIucGFyZW50LmlzRWRpdCA9IHRydWU7XHJcblxyXG4gICAgICAgLy8gZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAvLyBhZGQgc3VwcG9ydCBmb3IgQ3RybC9DbWQrQSBzZWxlY3Rpb25cclxuICAgICAgICAvL2lmICgga2V5Q29kZSA9PT0gNjUgJiYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgKSkge1xyXG4gICAgICAgICAgICAvL1Iuc2VsZWN0VGV4dCgpO1xyXG4gICAgICAgICAgICAvL2UucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgLy9yZXR1cm4gc2VsZi5yZW5kZXIoKTtcclxuICAgICAgICAvL31cclxuXHJcbiAgICAgICAgaWYoIGtleUNvZGUgPT09IDEzICl7IC8vZW50ZXJcclxuXHJcbiAgICAgICAgICAgIFIuY2xlYXJJbnB1dCgpO1xyXG5cclxuICAgICAgICAvL30gZWxzZSBpZigga2V5Q29kZSA9PT0gOSApeyAvL3RhYiBrZXlcclxuXHJcbiAgICAgICAgICAgLy8gUi5pbnB1dC50ZXh0Q29udGVudCA9ICcnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuaW5wdXQuaXNOdW0gKXtcclxuICAgICAgICAgICAgICAgIGlmICggKChlLmtleUNvZGUgPiA0NykgJiYgKGUua2V5Q29kZSA8IDU4KSkgfHwgKChlLmtleUNvZGUgPiA5NSkgJiYgKGUua2V5Q29kZSA8IDEwNikpIHx8IGUua2V5Q29kZSA9PT0gMTkwIHx8IGUua2V5Q29kZSA9PT0gMTEwIHx8IGUua2V5Q29kZSA9PT0gOCB8fCBlLmtleUNvZGUgPT09IDEwOSApe1xyXG4gICAgICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQucmVhZE9ubHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5yZWFkT25seSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAga2V5dXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBSLnN0ciA9IFIuaGlkZGVuSW1wdXQudmFsdWU7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudC5hbGxFcXVhbCApIFIucGFyZW50LnNhbWVTdHIoIFIuc3RyICk7Ly8gbnVtZXJpYyBzYW3DuWUgdmFsdWVcclxuICAgICAgICBlbHNlIFIuaW5wdXQudGV4dENvbnRlbnQgPSBSLnN0cjtcclxuXHJcbiAgICAgICAgUi5jdXJzb3JJZCA9IFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgUi5pbnB1dFJhbmdlID0gWyBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0LCBSLmhpZGRlbkltcHV0LnNlbGVjdGlvbkVuZCBdO1xyXG5cclxuICAgICAgICBSLnNlbGVjdFBhcmVudCgpO1xyXG5cclxuICAgICAgICAvL2lmKCBSLnBhcmVudC5hbGx3YXkgKSBcclxuICAgICAgICBSLnBhcmVudC52YWxpZGF0ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy9cclxuICAgIC8vICAgTElTVEVOSU5HXHJcbiAgICAvL1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGxvb3A6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNMb29wICkgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBSLmxvb3AgKTtcclxuICAgICAgICBSLnVwZGF0ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gUi5saXN0ZW5zLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSggaS0tICkgUi5saXN0ZW5zW2ldLmxpc3RlbmluZygpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlTGlzdGVuOiBmdW5jdGlvbiAoIHByb3RvICkge1xyXG5cclxuICAgICAgICBsZXQgaWQgPSBSLmxpc3RlbnMuaW5kZXhPZiggcHJvdG8gKTtcclxuICAgICAgICBpZiggaWQgIT09IC0xICkgUi5saXN0ZW5zLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgaWYoIFIubGlzdGVucy5sZW5ndGggPT09IDAgKSBSLmlzTG9vcCA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkTGlzdGVuOiBmdW5jdGlvbiAoIHByb3RvICkge1xyXG5cclxuICAgICAgICBsZXQgaWQgPSBSLmxpc3RlbnMuaW5kZXhPZiggcHJvdG8gKTtcclxuXHJcbiAgICAgICAgaWYoIGlkICE9PSAtMSApIHJldHVybjsgXHJcblxyXG4gICAgICAgIFIubGlzdGVucy5wdXNoKCBwcm90byApO1xyXG5cclxuICAgICAgICBpZiggIVIuaXNMb29wICl7XHJcbiAgICAgICAgICAgIFIuaXNMb29wID0gdHJ1ZTtcclxuICAgICAgICAgICAgUi5sb29wKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUm9vdHMgPSBSOyIsImV4cG9ydCBjbGFzcyBWMiB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCB4ID0gMCwgeSA9IDAgKSB7XHJcblxyXG5cdFx0dGhpcy54ID0geDtcclxuXHRcdHRoaXMueSA9IHk7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0ICggeCwgeSApIHtcclxuXHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdFx0dGhpcy55ID0geTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpdmlkZSAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54IC89IHYueDtcclxuXHRcdHRoaXMueSAvPSB2Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRtdWx0aXBseSAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54ICo9IHYueDtcclxuXHRcdHRoaXMueSAqPSB2Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRtdWx0aXBseVNjYWxhciAoIHNjYWxhciApIHtcclxuXHJcblx0XHR0aGlzLnggKj0gc2NhbGFyO1xyXG5cdFx0dGhpcy55ICo9IHNjYWxhcjtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpdmlkZVNjYWxhciAoIHNjYWxhciApIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggMSAvIHNjYWxhciApO1xyXG5cclxuXHR9XHJcblxyXG5cdGxlbmd0aCAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICk7XHJcblxyXG5cdH1cclxuXHJcblx0YW5nbGUgKCkge1xyXG5cclxuXHRcdC8vIGNvbXB1dGVzIHRoZSBhbmdsZSBpbiByYWRpYW5zIHdpdGggcmVzcGVjdCB0byB0aGUgcG9zaXRpdmUgeC1heGlzXHJcblxyXG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMiggdGhpcy55LCB0aGlzLnggKTtcclxuXHJcblx0XHRpZiAoIGFuZ2xlIDwgMCApIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xyXG5cclxuXHRcdHJldHVybiBhbmdsZTtcclxuXHJcblx0fVxyXG5cclxuXHRhZGRTY2FsYXIgKCBzICkge1xyXG5cclxuXHRcdHRoaXMueCArPSBzO1xyXG5cdFx0dGhpcy55ICs9IHM7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRuZWdhdGUgKCkge1xyXG5cclxuXHRcdHRoaXMueCAqPSAtMTtcclxuXHRcdHRoaXMueSAqPSAtMTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdG5lZyAoKSB7XHJcblxyXG5cdFx0dGhpcy54ID0gLTE7XHJcblx0XHR0aGlzLnkgPSAtMTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGlzWmVybyAoKSB7XHJcblxyXG5cdFx0cmV0dXJuICggdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMCApO1xyXG5cclxuXHR9XHJcblxyXG5cdGNvcHkgKCB2ICkge1xyXG5cclxuXHRcdHRoaXMueCA9IHYueDtcclxuXHRcdHRoaXMueSA9IHYueTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRlcXVhbHMgKCB2ICkge1xyXG5cclxuXHRcdHJldHVybiAoICggdi54ID09PSB0aGlzLnggKSAmJiAoIHYueSA9PT0gdGhpcy55ICkgKTtcclxuXHJcblx0fVxyXG5cclxuXHRuZWFyRXF1YWxzICggdiwgbiApIHtcclxuXHJcblx0XHRyZXR1cm4gKCAoIHYueC50b0ZpeGVkKG4pID09PSB0aGlzLngudG9GaXhlZChuKSApICYmICggdi55LnRvRml4ZWQobikgPT09IHRoaXMueS50b0ZpeGVkKG4pICkgKTtcclxuXHJcblx0fVxyXG5cclxuXHRsZXJwICggdiwgYWxwaGEgKSB7XHJcblxyXG5cdFx0aWYoIHYgPT09IG51bGwgKXtcclxuXHRcdFx0dGhpcy54IC09IHRoaXMueCAqIGFscGhhO1xyXG5cdFx0ICAgIHRoaXMueSAtPSB0aGlzLnkgKiBhbHBoYTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMueCArPSAoIHYueCAtIHRoaXMueCApICogYWxwaGE7XHJcblx0XHQgICAgdGhpcy55ICs9ICggdi55IC0gdGhpcy55ICkgKiBhbHBoYTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4vUm9vdHMnO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4vVG9vbHMnO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4vVjInO1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuY2xhc3MgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIGlzIG9uIGd1aSBvciBncm91cFxyXG4gICAgICAgIHRoaXMubWFpbiA9IG8ubWFpbiB8fCBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNVSSA9IG8uaXNVSSB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLnBhcmVudEdyb3VwID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5jc3MgPSB0aGlzLm1haW4gPyB0aGlzLm1haW4uY3NzIDogVG9vbHMuY3NzO1xyXG4gICAgICAgIHRoaXMuY29sb3JzID0gdGhpcy5tYWluID8gdGhpcy5tYWluLmNvbG9ycyA6IFRvb2xzLmNvbG9ycztcclxuXHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5ib3JkZXI7XHJcbiAgICAgICAgdGhpcy5zdmdzID0gVG9vbHMuc3ZncztcclxuXHJcbiAgICAgICAgLy8gb25seSBzcGFjZSBcclxuICAgICAgICB0aGlzLmlzRW1wdHkgPSBvLmlzRW1wdHkgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZSA9IHsgeDowLCB5OjAsIHc6MCwgaDowIH07XHJcbiAgICAgICAgdGhpcy5sb2NhbCA9IG5ldyBWMigpLm5lZygpO1xyXG5cclxuICAgICAgICB0aGlzLmlzQ2FudmFzT25seSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VsZWN0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHBlcmNlbnQgb2YgdGl0bGVcclxuICAgICAgICB0aGlzLnAgPSBvLnAgIT09IHVuZGVmaW5lZCA/IG8ucCA6IFRvb2xzLnNpemUucDtcclxuXHJcbiAgICAgICAgdGhpcy53ID0gdGhpcy5pc1VJID8gdGhpcy5tYWluLnNpemUudyA6IFRvb2xzLnNpemUudztcclxuICAgICAgICBpZiggby53ICE9PSB1bmRlZmluZWQgKSB0aGlzLncgPSBvLnc7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuaXNVSSA/IHRoaXMubWFpbi5zaXplLmggOiBUb29scy5zaXplLmg7XHJcbiAgICAgICAgaWYoIG8uaCAhPT0gdW5kZWZpbmVkICkgdGhpcy5oID0gby5oO1xyXG4gICAgICAgIGlmKCF0aGlzLmlzRW1wdHkpIHRoaXMuaCA9IHRoaXMuaCA8IDExID8gMTEgOiB0aGlzLmg7XHJcblxyXG4gICAgICAgIC8vIGlmIG5lZWQgcmVzaXplIHdpZHRoXHJcbiAgICAgICAgdGhpcy5hdXRvV2lkdGggPSBvLmF1dG8gfHwgdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gb3BlbiBzdGF0dVxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHJhZGl1cyBmb3IgdG9vbGJveFxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gby5yYWRpdXMgfHwgMDtcclxuXHJcbiAgICAgICAgLy8gb25seSBmb3IgbnVtYmVyXHJcbiAgICAgICAgdGhpcy5pc051bWJlciA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubm9OZWcgPSBvLm5vTmVnIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWxsRXF1YWwgPSBvLmFsbEVxdWFsIHx8IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIG9ubHkgbW9zdCBzaW1wbGUgXHJcbiAgICAgICAgdGhpcy5tb25vID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHN0b3AgbGlzdGVuaW5nIGZvciBlZGl0IHNsaWRlIHRleHRcclxuICAgICAgICB0aGlzLmlzRWRpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBubyB0aXRsZSBcclxuICAgICAgICB0aGlzLnNpbXBsZSA9IG8uc2ltcGxlIHx8IGZhbHNlO1xyXG4gICAgICAgIGlmKCB0aGlzLnNpbXBsZSApIHRoaXMuc2EgPSAwO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy8gZGVmaW5lIG9iaiBzaXplXHJcbiAgICAgICAgdGhpcy5zZXRTaXplKCB0aGlzLncgKTtcclxuXHJcbiAgICAgICAgLy8gdGl0bGUgc2l6ZVxyXG4gICAgICAgIGlmKG8uc2EgIT09IHVuZGVmaW5lZCApIHRoaXMuc2EgPSBvLnNhO1xyXG4gICAgICAgIGlmKG8uc2IgIT09IHVuZGVmaW5lZCApIHRoaXMuc2IgPSBvLnNiO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zaW1wbGUgKSB0aGlzLnNiID0gdGhpcy53IC0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgLy8gbGFzdCBudW1iZXIgc2l6ZSBmb3Igc2xpZGVcclxuICAgICAgICB0aGlzLnNjID0gby5zYyA9PT0gdW5kZWZpbmVkID8gNDcgOiBvLnNjO1xyXG5cclxuICAgICAgICAvLyBmb3IgbGlzdGVuaW5nIG9iamVjdFxyXG4gICAgICAgIHRoaXMub2JqZWN0TGluayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZhbCA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQmFja2dyb3VuZFxyXG4gICAgICAgIHRoaXMuYmcgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kOy8vdGhpcy5pc1VJID8gdGhpcy5tYWluLmJnIDogVG9vbHMuY29sb3JzLmJhY2tncm91bmQ7XHJcbiAgICAgICAgdGhpcy5iZ092ZXIgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kT3ZlcjtcclxuICAgICAgICBpZiggby5iZyAhPT0gdW5kZWZpbmVkICl7IHRoaXMuYmcgPSBvLmJnOyB0aGlzLmJnT3ZlciA9IG8uYmc7IH1cclxuICAgICAgICBpZiggby5iZ092ZXIgIT09IHVuZGVmaW5lZCApeyB0aGlzLmJnT3ZlciA9IG8uYmdPdmVyOyB9XHJcblxyXG4gICAgICAgIC8vIEZvbnQgQ29sb3I7XHJcbiAgICAgICAgdGhpcy50aXRsZUNvbG9yID0gby50aXRsZUNvbG9yIHx8IHRoaXMuY29sb3JzLnRleHQ7XHJcbiAgICAgICAgdGhpcy5mb250Q29sb3IgPSBvLmZvbnRDb2xvciB8fCB0aGlzLmNvbG9ycy50ZXh0O1xyXG4gICAgICAgIHRoaXMuZm9udFNlbGVjdCA9IG8uZm9udFNlbGVjdCB8fCB0aGlzLmNvbG9ycy50ZXh0T3ZlcjtcclxuXHJcbiAgICAgICAgaWYoIG8uY29sb3IgIT09IHVuZGVmaW5lZCApIHRoaXMuZm9udENvbG9yID0gby5jb2xvcjtcclxuICAgICAgICAgICAgLyp7IFxyXG5cclxuICAgICAgICAgICAgaWYoby5jb2xvciA9PT0gJ24nKSBvLmNvbG9yID0gJyNmZjAwMDAnO1xyXG5cclxuICAgICAgICAgICAgaWYoIG8uY29sb3IgIT09ICdubycgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiggIWlzTmFOKG8uY29sb3IpICkgdGhpcy5mb250Q29sb3IgPSBUb29scy5oZXhUb0h0bWwoby5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHRoaXMuZm9udENvbG9yID0gby5jb2xvcjtcclxuICAgICAgICAgICAgICAgIHRoaXMudGl0bGVDb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0qL1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8qaWYoIG8uY29sb3IgIT09IHVuZGVmaW5lZCApeyBcclxuICAgICAgICAgICAgaWYoICFpc05hTihvLmNvbG9yKSApIHRoaXMuZm9udENvbG9yID0gVG9vbHMuaGV4VG9IdG1sKG8uY29sb3IpO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMuZm9udENvbG9yID0gby5jb2xvcjtcclxuICAgICAgICAgICAgdGhpcy50aXRsZUNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIHRoaXMuY29sb3JQbHVzID0gVG9vbHMuQ29sb3JMdW1hKCB0aGlzLmZvbnRDb2xvciwgMC4zICk7XHJcblxyXG4gICAgICAgIHRoaXMudHh0ID0gby5uYW1lIHx8ICdQcm90byc7XHJcbiAgICAgICAgdGhpcy5yZW5hbWUgPSBvLnJlbmFtZSB8fCAnJztcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG8udGFyZ2V0IHx8IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBvLmNhbGxiYWNrID09PSB1bmRlZmluZWQgPyBudWxsIDogby5jYWxsYmFjaztcclxuICAgICAgICB0aGlzLmVuZENhbGxiYWNrID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY2FsbGJhY2sgPT09IG51bGwgJiYgdGhpcy5pc1VJICYmIHRoaXMubWFpbi5jYWxsYmFjayAhPT0gbnVsbCApIHRoaXMuY2FsbGJhY2sgPSB0aGlzLm1haW4uY2FsbGJhY2s7XHJcblxyXG4gICAgICAgIC8vIGVsZW1lbnRzXHJcbiAgICAgICAgdGhpcy5jID0gW107XHJcblxyXG4gICAgICAgIC8vIHN0eWxlIFxyXG4gICAgICAgIHRoaXMucyA9IFtdO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jWzBdID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246cmVsYXRpdmU7IGhlaWdodDoyMHB4OyBmbG9hdDpsZWZ0OyBvdmVyZmxvdzpoaWRkZW47Jyk7XHJcbiAgICAgICAgdGhpcy5zWzBdID0gdGhpcy5jWzBdLnN0eWxlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5zWzBdLm1hcmdpbkJvdHRvbSA9ICcxcHgnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHdpdGggdGl0bGVcclxuICAgICAgICBpZiggIXRoaXMuc2ltcGxlICl7IFxyXG4gICAgICAgICAgICB0aGlzLmNbMV0gPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKTtcclxuICAgICAgICAgICAgdGhpcy5zWzFdID0gdGhpcy5jWzFdLnN0eWxlO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0aGlzLnJlbmFtZSA9PT0gJycgPyB0aGlzLnR4dCA6IHRoaXMucmVuYW1lO1xyXG4gICAgICAgICAgICB0aGlzLnNbMV0uY29sb3IgPSB0aGlzLnRpdGxlQ29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggby5wb3MgKXtcclxuICAgICAgICAgICAgdGhpcy5zWzBdLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICAgICAgZm9yKGxldCBwIGluIG8ucG9zKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuc1swXVtwXSA9IG8ucG9zW3BdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubW9ubyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggby5jc3MgKSB0aGlzLnNbMF0uY3NzVGV4dCA9IG8uY3NzOyBcclxuICAgICAgICBcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gbWFrZSB0aGUgbm9kZVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgXHJcbiAgICBpbml0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMuczsgLy8gc3R5bGUgY2FjaGVcclxuICAgICAgICBsZXQgYyA9IHRoaXMuYzsgLy8gZGl2IGNhY2hcclxuXHJcbiAgICAgICAgc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1VJICApIHNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSAgKSBzWzBdLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgIC8vaWYoIHRoaXMuYXV0b0hlaWdodCApIHNbMF0udHJhbnNpdGlvbiA9ICdoZWlnaHQgMC4wMXMgZWFzZS1vdXQnO1xyXG4gICAgICAgIGlmKCBjWzFdICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hdXRvV2lkdGggKXtcclxuICAgICAgICAgICAgc1sxXSA9IGNbMV0uc3R5bGU7XHJcbiAgICAgICAgICAgIHNbMV0uaGVpZ2h0ID0gKHRoaXMuaC00KSArICdweCc7XHJcbiAgICAgICAgICAgIHNbMV0ubGluZUhlaWdodCA9ICh0aGlzLmgtOCkgKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZyYWcgPSBUb29scy5mcmFnO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMSwgbG5nID0gYy5sZW5ndGg7IGkgIT09IGxuZzsgaSsrICl7XHJcbiAgICAgICAgICAgIGlmKCBjW2ldICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKCBjW2ldICk7XHJcbiAgICAgICAgICAgICAgICBzW2ldID0gY1tpXS5zdHlsZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5hcHBlbmRDaGlsZCggY1swXSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uaW5uZXIuYXBwZW5kQ2hpbGQoIGNbMF0gKTtcclxuICAgICAgICAgICAgZWxzZSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBjWzBdICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjWzBdLmFwcGVuZENoaWxkKCBmcmFnICk7XHJcblxyXG4gICAgICAgIHRoaXMuclNpemUoKTtcclxuXHJcbiAgICAgICAgLy8gISBzb2xvIHByb3RvXHJcbiAgICAgICAgaWYoICF0aGlzLmlzVUkgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1swXS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICBSb290cy5hZGQoIHRoaXMgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBmcm9tIFRvb2xzXHJcblxyXG4gICAgZG9tICggdHlwZSwgY3NzLCBvYmosIGRvbSwgaWQgKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBUb29scy5kb20oIHR5cGUsIGNzcywgb2JqLCBkb20sIGlkICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFN2ZyAoIGRvbSwgdHlwZSwgdmFsdWUsIGlkLCBpZDIgKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLnNldFN2ZyggZG9tLCB0eXBlLCB2YWx1ZSwgaWQsIGlkMiApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRDc3MgKCBkb20sIGNzcyApIHtcclxuXHJcbiAgICAgICAgVG9vbHMuc2V0Q3NzKCBkb20sIGNzcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCAoIHZhbHVlLCBtaW4sIG1heCApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmNsYW1wKCB2YWx1ZSwgbWluLCBtYXggKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sb3JSaW5nICgpIHtcclxuXHJcbiAgICAgICAgaWYoICFUb29scy5jb2xvclJpbmcgKSBUb29scy5tYWtlQ29sb3JSaW5nKCk7XHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmNsb25lKCBUb29scy5jb2xvclJpbmcgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Sm95c3RpY2sgKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgaWYoICFUb29sc1sgJ2pveXN0aWNrXycrIG1vZGVsIF0gKSBUb29scy5tYWtlSm95c3RpY2soIG1vZGVsICk7XHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmNsb25lKCBUb29sc1sgJ2pveXN0aWNrXycrIG1vZGVsIF0gKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2lyY3VsYXIgKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgaWYoICFUb29scy5jaXJjdWxhciApIFRvb2xzLm1ha2VDaXJjdWxhciggbW9kZWwgKTtcclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xvbmUoIFRvb2xzLmNpcmN1bGFyICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldEtub2IgKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgaWYoICFUb29scy5rbm9iICkgVG9vbHMubWFrZUtub2IoIG1vZGVsICk7XHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmNsb25lKCBUb29scy5rbm9iICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZyb20gUm9vdHNcclxuXHJcbiAgICBjdXJzb3IgKCBuYW1lICkge1xyXG5cclxuICAgICAgICAgUm9vdHMuY3Vyc29yKCBuYW1lICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIFxyXG5cclxuICAgIC8vLy8vLy8vL1xyXG5cclxuICAgIHVwZGF0ZSAoKSB7fVxyXG5cclxuICAgIHJlc2V0ICgpIHt9XHJcblxyXG4gICAgLy8vLy8vLy8vXHJcblxyXG4gICAgZ2V0RG9tICgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY1swXTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdWlvdXQgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0VtcHR5ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZih0aGlzLnMpIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5iZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdWlvdmVyICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYodGhpcy5zKSB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmdPdmVyO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZW5hbWUgKCBzICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQpIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHM7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbiAoKSB7XHJcblxyXG4gICAgICAgIFJvb3RzLmFkZExpc3RlbiggdGhpcyApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5pbmcgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VuZCApIHJldHVybjtcclxuICAgICAgICBpZiggdGhpcy5pc0VkaXQgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSAoIHYgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzTnVtYmVyICkgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHYgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoIHYgaW5zdGFuY2VvZiBBcnJheSAmJiB2Lmxlbmd0aCA9PT0gMSApIHYgPSB2WzBdO1xyXG4gICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IHY7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHVwZGF0ZSBldmVyeSBjaGFuZ2VcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvbkNoYW5nZSAoIGYgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRW1wdHkgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBmIHx8IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHVwZGF0ZSBvbmx5IG9uIGVuZFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9uRmluaXNoQ2hhbmdlICggZiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5lbmRDYWxsYmFjayA9IGY7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbmQgKCB2ICkge1xyXG5cclxuICAgICAgICB2ID0gdiB8fCB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGlmKCB2IGluc3RhbmNlb2YgQXJyYXkgJiYgdi5sZW5ndGggPT09IDEgKSB2ID0gdlswXTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSB0cnVlO1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdExpbmsgIT09IG51bGwgKSB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gPSB2O1xyXG4gICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayggdiwgdGhpcy52YWwgKTtcclxuICAgICAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZW5kRW5kICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgdGhpcy52YWx1ZTtcclxuICAgICAgICBpZiggdiBpbnN0YW5jZW9mIEFycmF5ICYmIHYubGVuZ3RoID09PSAxICkgdiA9IHZbMF07XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmVuZENhbGxiYWNrICkgdGhpcy5lbmRDYWxsYmFjayggdiApO1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdExpbmsgIT09IG51bGwgKSB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gPSB2O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjbGVhciBub2RlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBcclxuICAgIGNsZWFyICgpIHtcclxuXHJcbiAgICAgICAgVG9vbHMuY2xlYXIoIHRoaXMuY1swXSApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy50YXJnZXQgIT09IG51bGwgKXsgXHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbW92ZUNoaWxkKCB0aGlzLmNbMF0gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNsZWFyT25lKCB0aGlzICk7XHJcbiAgICAgICAgICAgIGVsc2UgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggdGhpcy5jWzBdICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNVSSApIFJvb3RzLnJlbW92ZSggdGhpcyApO1xyXG5cclxuICAgICAgICB0aGlzLmMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjaGFuZ2Ugc2l6ZSBcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRTaXplICggc3ggKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5hdXRvV2lkdGggKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMudyA9IHN4O1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zaW1wbGUgKXtcclxuICAgICAgICAgICAgdGhpcy5zYiA9IHRoaXMudyAtIHRoaXMuc2E7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHBwID0gdGhpcy53ICogKCB0aGlzLnAgLyAxMDAgKTtcclxuICAgICAgICAgICAgdGhpcy5zYSA9IE1hdGguZmxvb3IoIHBwICsgMTAgKTtcclxuICAgICAgICAgICAgdGhpcy5zYiA9IE1hdGguZmxvb3IoIHRoaXMudyAtIHBwIC0gMjAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmF1dG9XaWR0aCApIHJldHVybjtcclxuICAgICAgICB0aGlzLnNbMF0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG4gICAgICAgIGlmKCAhdGhpcy5zaW1wbGUgKSB0aGlzLnNbMV0ud2lkdGggPSB0aGlzLnNhICsgJ3B4JztcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGZvciBudW1lcmljIHZhbHVlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0VHlwZU51bWJlciAoIG8gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNOdW1iZXIgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gMDtcclxuICAgICAgICBpZihvLnZhbHVlICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBpZiggdHlwZW9mIG8udmFsdWUgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZSA9IG8udmFsdWUgKiAxO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSBvLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5taW4gPSBvLm1pbiA9PT0gdW5kZWZpbmVkID8gLUluZmluaXR5IDogby5taW47XHJcbiAgICAgICAgdGhpcy5tYXggPSBvLm1heCA9PT0gdW5kZWZpbmVkID8gIEluZmluaXR5IDogby5tYXg7XHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gMiA6IG8ucHJlY2lzaW9uO1xyXG5cclxuICAgICAgICBsZXQgcztcclxuXHJcbiAgICAgICAgc3dpdGNoKHRoaXMucHJlY2lzaW9uKXtcclxuICAgICAgICAgICAgY2FzZSAwOiBzID0gMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogcyA9IDAuMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogcyA9IDAuMDE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6IHMgPSAwLjAwMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDogcyA9IDAuMDAwMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTogcyA9IDAuMDAwMDE7IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zdGVwID0gby5zdGVwID09PSB1bmRlZmluZWQgPyAgcyA6IG8uc3RlcDtcclxuICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXggLSB0aGlzLm1pbjtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy52YWx1ZSApO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG51bVZhbHVlICggbiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubm9OZWcgKSBuID0gTWF0aC5hYnMoIG4gKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oIHRoaXMubWF4LCBNYXRoLm1heCggdGhpcy5taW4sIG4gKSApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFMgREVGQVVMVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50ICggZSApe1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0VtcHR5ICkgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB0aGlzW2UudHlwZV0oZSk7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICB3aGVlbCAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICBrZXlkb3duICggZSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAga2V5dXAgKCBlICkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gb2JqZWN0IHJlZmVyZW5jeVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNldFJlZmVyZW5jeSAoIG9iaiwgdmFsICkge1xyXG5cclxuICAgICAgICB0aGlzLm9iamVjdExpbmsgPSBvYmo7XHJcbiAgICAgICAgdGhpcy52YWwgPSB2YWw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRpc3BsYXkgKCB2ICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHYgPSB2IHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc1swXS5kaXNwbGF5ID0gdiA/ICdibG9jaycgOiAnbm9uZSc7XHJcbiAgICAgICAgLy90aGlzLmlzUmVhZHkgPSB2ID8gZmFsc2UgOiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyByZXNpemUgaGVpZ2h0IFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9wZW4gKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc09wZW4gKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbmVlZFpvbmUgKCkge1xyXG5cclxuICAgICAgICBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV6b25lICgpIHtcclxuXHJcbiAgICAgICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdCAoKSB7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICB1bnNlbGVjdCAoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldElucHV0ICggSW5wdXQgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgUm9vdHMuc2V0SW5wdXQoIElucHV0LCB0aGlzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwSW5wdXQgKCB4LCBkb3duICkge1xyXG5cclxuICAgICAgICByZXR1cm4gUm9vdHMudXBJbnB1dCggeCwgZG93biApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBzcGVjaWFsIGl0ZW0gXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2VsZWN0ZWQgKCBiICl7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZWxlY3QgPSBiIHx8IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IHsgUHJvdG8gfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvb2wgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICAgICAgdGhpcy5pbmggPSBvLmluaCB8fCBNYXRoLmZsb29yKCB0aGlzLmgqMC44ICk7XHJcbiAgICAgICAgdGhpcy5pbncgPSBvLmludyB8fCAzNjtcclxuXHJcbiAgICAgICAgbGV0IHQgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLSgodGhpcy5pbmgtMikqMC41KTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdiYWNrZ3JvdW5kOicrIHRoaXMuY29sb3JzLmJvb2xiZyArJzsgaGVpZ2h0OicrKHRoaXMuaW5oLTIpKydweDsgd2lkdGg6Jyt0aGlzLmludysncHg7IHRvcDonK3QrJ3B4OyBib3JkZXItcmFkaXVzOjEwcHg7IGJvcmRlcjoycHggc29saWQgJyt0aGlzLmJvb2xiZyApO1xyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnaGVpZ2h0OicrKHRoaXMuaW5oLTYpKydweDsgd2lkdGg6MTZweDsgdG9wOicrKHQrMikrJ3B4OyBib3JkZXItcmFkaXVzOjEwcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7JyApO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB1cGRhdGUgKCkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudmFsdWUgKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHNbMl0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJvb2xvbjtcclxuICAgICAgICAgICAgc1syXS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmJvb2xvbjtcclxuICAgICAgICAgICAgc1szXS5tYXJnaW5MZWZ0ID0gJzE3cHgnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc1syXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYm9vbGJnO1xyXG4gICAgICAgICAgICBzWzJdLmJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9vbGJnO1xyXG4gICAgICAgICAgICBzWzNdLm1hcmdpbkxlZnQgPSAnMnB4JztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSAodGhpcy53IC0gMTAgKSAtIHRoaXMuaW53O1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbM10ubGVmdCA9IHcgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBCdXR0b24gZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IG8udmFsdWUgfHwgdGhpcy50eHQ7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgdGhpcy52YWx1ZXMgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZXMgPSBbdGhpcy52YWx1ZXNdO1xyXG5cclxuICAgICAgICAvL3RoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIGN1c3RvbSBjb2xvclxyXG4gICAgICAgIHRoaXMuY2MgPSBbIHRoaXMuY29sb3JzLmJ1dHRvbiwgdGhpcy5jb2xvcnMuc2VsZWN0LCB0aGlzLmNvbG9ycy5kb3duIF07XHJcblxyXG4gICAgICAgIGlmKCBvLmNCZyAhPT0gdW5kZWZpbmVkICkgdGhpcy5jY1swXSA9IG8uY0JnO1xyXG4gICAgICAgIGlmKCBvLmJDb2xvciAhPT0gdW5kZWZpbmVkICkgdGhpcy5jY1swXSA9IG8uYkNvbG9yO1xyXG4gICAgICAgIGlmKCBvLmNTZWxlY3QgIT09IHVuZGVmaW5lZCApIHRoaXMuY2NbMV0gPSBvLmNTZWxlY3Q7XHJcbiAgICAgICAgaWYoIG8uY0Rvd24gIT09IHVuZGVmaW5lZCApIHRoaXMuY2NbMl0gPSBvLmNEb3duO1xyXG5cclxuICAgICAgICB0aGlzLmlzTG9hZEJ1dHRvbiA9IG8ubG9hZGVyIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNEcmFnQnV0dG9uID0gby5kcmFnIHx8IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRHJhZ0J1dHRvbiApIHRoaXMuaXNMb2FkQnV0dG9uID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlcy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy50bXAgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXQgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MuYnV0dG9uICsgJ3RvcDoxcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmNjWzBdKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXI6Jyt0aGlzLmNvbG9ycy5idXR0b25Cb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRbaV0gPSAxO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9ICcnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0xvYWRCdXR0b24gKSB0aGlzLmluaXRMb2FkZXIoKTtcclxuICAgICAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKXsgXHJcbiAgICAgICAgICAgIHRoaXMubG5nICsrO1xyXG4gICAgICAgICAgICB0aGlzLmluaXREcmFnZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIGxldCB0ID0gdGhpcy50bXA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgIFx0aWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGkrMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgXHRsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1tuYW1lLTJdXHJcbiAgICAgICAgaWYoICF0aGlzLmlzTG9hZEJ1dHRvbiApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIC8vZWxzZSB0aGlzLmZpbGVTZWxlY3QoIGUudGFyZ2V0LmZpbGVzWzBdICk7XHJcbiAgICBcdHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gXHJcbiAgICAgICAgLy8gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHVwID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgIC8vIGNvbnNvbGUubG9nKG5hbWUpXHJcblxyXG4gICAgICAgIGlmKCBuYW1lICE9PSAnJyApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMubW9kZXMoIHRoaXMuaXNEb3duID8gMyA6IDIsIG5hbWUgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIFx0dXAgPSB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHVwKVxyXG5cclxuICAgICAgICByZXR1cm4gdXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb2RlcyAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGxldCB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT09IG5hbWUtMiApIHYgPSB0aGlzLm1vZGUoIG4sIGkrMiApO1xyXG4gICAgICAgICAgICBlbHNlIHYgPSB0aGlzLm1vZGUoIDEsIGkrMiApO1xyXG5cclxuICAgICAgICAgICAgaWYodikgciA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBtb2RlICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgaSA9IG5hbWUgLSAyO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0W2ldICE9PSBuICl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0W2ldID0gMTsgdGhpcy5zWyBpKzIgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmNjWzBdOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zdGF0W2ldID0gMjsgdGhpcy5zWyBpKzIgXS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5jY1sxXTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdFtpXSA9IDM7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuY2NbMl07IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICAvKmxldCB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG4gICAgICAgICAgICB2ID0gdGhpcy5tb2RlKCAxLCBpKzIgKTtcclxuICAgICAgICAgICAgaWYodikgciA9IHRydWU7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVzKCAxICwgMiApO1xyXG5cclxuICAgIFx0LyppZiggdGhpcy5zZWxlY3RlZCApe1xyXG4gICAgXHRcdHRoaXMuc1sgdGhpcy5zZWxlY3RlZCBdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuc1sgdGhpcy5zZWxlY3RlZCBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgXHR9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlOyovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBkcmFnb3ZlciAoIGUgKSB7XHJcblxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzRdLmJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG4gICAgICAgIHRoaXMuc1s0XS5jb2xvciA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZHJhZ2VuZCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzRdLmJvcmRlckNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgdGhpcy5zWzRdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRyb3AgKCBlICkge1xyXG5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhZ2VuZChlKTtcclxuICAgICAgICB0aGlzLmZpbGVTZWxlY3QoIGUuZGF0YVRyYW5zZmVyLmZpbGVzWzBdICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGluaXREcmFnZXIgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArJyB0ZXh0LWFsaWduOmNlbnRlcjsgbGluZS1oZWlnaHQ6JysodGhpcy5oLTgpKydweDsgYm9yZGVyOjFweCBkYXNoZWQgJyt0aGlzLmZvbnRDb2xvcisnOyB0b3A6MnB4OyAgaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7IHBvaW50ZXItZXZlbnRzOmF1dG87JyApOy8vIGN1cnNvcjpkZWZhdWx0O1xyXG4gICAgICAgIHRoaXMuY1s0XS50ZXh0Q29udGVudCA9ICdEUkFHJztcclxuXHJcbiAgICAgICAgdGhpcy5jWzRdLmFkZEV2ZW50TGlzdGVuZXIoICdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpeyB0aGlzLmRyYWdvdmVyKGUpOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcbiAgICAgICAgdGhpcy5jWzRdLmFkZEV2ZW50TGlzdGVuZXIoICdkcmFnZW5kJywgZnVuY3Rpb24oZSl7IHRoaXMuZHJhZ2VuZChlKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG4gICAgICAgIHRoaXMuY1s0XS5hZGRFdmVudExpc3RlbmVyKCAnZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSl7IHRoaXMuZHJhZ2VuZChlKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG4gICAgICAgIHRoaXMuY1s0XS5hZGRFdmVudExpc3RlbmVyKCAnZHJvcCcsIGZ1bmN0aW9uKGUpeyB0aGlzLmRyb3AoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuXHJcbiAgICAgICAgLy90aGlzLmNbMl0uZXZlbnRzID0gWyAgXTtcclxuICAgICAgICAvL3RoaXMuY1s0XS5ldmVudHMgPSBbICdkcmFnb3ZlcicsICdkcmFnZW5kJywgJ2RyYWdsZWF2ZScsICdkcm9wJyBdO1xyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaW5pdExvYWRlciAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnaW5wdXQnLCB0aGlzLmNzcy5iYXNpYyArJ3RvcDowcHg7IG9wYWNpdHk6MDsgaGVpZ2h0OicrKHRoaXMuaCkrJ3B4OyBwb2ludGVyLWV2ZW50czphdXRvOyBjdXJzb3I6cG9pbnRlcjsnICk7Ly9cclxuICAgICAgICB0aGlzLmNbM10ubmFtZSA9ICdsb2FkZXInO1xyXG4gICAgICAgIHRoaXMuY1szXS50eXBlID0gXCJmaWxlXCI7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgZnVuY3Rpb24oZSl7IHRoaXMuZmlsZVNlbGVjdCggZS50YXJnZXQuZmlsZXNbMF0gKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG4gICAgICAgIC8vdGhpcy5jWzNdLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBmdW5jdGlvbihlKXsgIH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuXHJcbiAgICAgICAgLy90aGlzLmNbMl0uZXZlbnRzID0gWyAgXTtcclxuICAgICAgICAvL3RoaXMuY1szXS5ldmVudHMgPSBbICdjaGFuZ2UnLCAnbW91c2VvdmVyJywgJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlb3V0JyBdO1xyXG5cclxuICAgICAgICAvL3RoaXMuaGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZpbGVTZWxlY3QgKCBmaWxlICkge1xyXG5cclxuICAgICAgICBsZXQgZGF0YVVybCA9IFsgJ3BuZycsICdqcGcnLCAnbXA0JywgJ3dlYm0nLCAnb2dnJyBdO1xyXG4gICAgICAgIGxldCBkYXRhQnVmID0gWyAnc2VhJywgJ3onLCAnaGV4JywgJ2J2aCcsICdCVkgnLCAnZ2xiJyBdO1xyXG5cclxuICAgICAgICAvL2lmKCAhIGUudGFyZ2V0LmZpbGVzICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL2xldCBmaWxlID0gZS50YXJnZXQuZmlsZXNbMF07XHJcbiAgICAgICBcclxuICAgICAgICAvL3RoaXMuY1szXS50eXBlID0gXCJudWxsXCI7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIHRoaXMuY1s0XSApXHJcblxyXG4gICAgICAgIGlmKCBmaWxlID09PSB1bmRlZmluZWQgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgIGxldCBmbmFtZSA9IGZpbGUubmFtZTtcclxuICAgICAgICBsZXQgdHlwZSA9IGZuYW1lLnN1YnN0cmluZyhmbmFtZS5sYXN0SW5kZXhPZignLicpKzEsIGZuYW1lLmxlbmd0aCApO1xyXG5cclxuICAgICAgICBpZiggZGF0YVVybC5pbmRleE9mKCB0eXBlICkgIT09IC0xICkgcmVhZGVyLnJlYWRBc0RhdGFVUkwoIGZpbGUgKTtcclxuICAgICAgICBlbHNlIGlmKCBkYXRhQnVmLmluZGV4T2YoIHR5cGUgKSAhPT0gLTEgKSByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTsvL3JlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciggZmlsZSApO1xyXG4gICAgICAgIGVsc2UgcmVhZGVyLnJlYWRBc1RleHQoIGZpbGUgKTtcclxuXHJcbiAgICAgICAgLy8gaWYoIHR5cGUgPT09ICdwbmcnIHx8IHR5cGUgPT09ICdqcGcnIHx8IHR5cGUgPT09ICdtcDQnIHx8IHR5cGUgPT09ICd3ZWJtJyB8fCB0eXBlID09PSAnb2dnJyApIHJlYWRlci5yZWFkQXNEYXRhVVJMKCBmaWxlICk7XHJcbiAgICAgICAgLy9lbHNlIGlmKCB0eXBlID09PSAneicgKSByZWFkZXIucmVhZEFzQmluYXJ5U3RyaW5nKCBmaWxlICk7XHJcbiAgICAgICAgLy9lbHNlIGlmKCB0eXBlID09PSAnc2VhJyB8fCB0eXBlID09PSAnYnZoJyB8fCB0eXBlID09PSAnQlZIJyB8fCB0eXBlID09PSAneicpIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSBpZiggICkgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlICk7XHJcbiAgICAgICAgLy9lbHNlIHJlYWRlci5yZWFkQXNUZXh0KCBmaWxlICk7XHJcblxyXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoIHRoaXMuY2FsbGJhY2sgKSB0aGlzLmNhbGxiYWNrKCBlLnRhcmdldC5yZXN1bHQsIGZuYW1lLCB0eXBlICk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jWzNdLnR5cGUgPSBcImZpbGVcIjtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoIGUudGFyZ2V0LnJlc3VsdCApOyBcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxhYmVsICggc3RyaW5nLCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuY1tuXS50ZXh0Q29udGVudCA9IHN0cmluZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWNvbiAoIHN0cmluZywgeSwgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMjtcclxuICAgICAgICB0aGlzLnNbbl0ucGFkZGluZyA9ICggeSB8fCAwICkgKydweCAwcHgnO1xyXG4gICAgICAgIHRoaXMuY1tuXS5pbm5lckhUTUwgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLnNiO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgZGMgPSAgMztcclxuICAgICAgICBsZXQgc2l6ZSA9IE1hdGguZmxvb3IoICggdy0oZGMqKGktMSkpICkgLyBpICk7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuXHJcbiAgICAgICAgXHR0aGlzLnRtcFtpXSA9IFsgTWF0aC5mbG9vciggZCArICggc2l6ZSAqIGkgKSArICggZGMgKiBpICkpLCBzaXplIF07XHJcbiAgICAgICAgXHR0aGlzLnRtcFtpXVsyXSA9IHRoaXMudG1wW2ldWzBdICsgdGhpcy50bXBbaV1bMV07XHJcblxyXG4gICAgICAgICAgICBzW2krMl0ubGVmdCA9IHRoaXMudG1wW2ldWzBdICsgJ3B4JztcclxuICAgICAgICAgICAgc1tpKzJdLndpZHRoID0gdGhpcy50bXBbaV1bMV0gKyAncHgnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRHJhZ0J1dHRvbiApeyBcclxuICAgICAgICAgICAgc1s0XS5sZWZ0ID0gKGQrc2l6ZStkYykgKyAncHgnO1xyXG4gICAgICAgICAgICBzWzRdLndpZHRoID0gc2l6ZSArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0xvYWRCdXR0b24gKXtcclxuICAgICAgICAgICAgc1szXS5sZWZ0ID0gZCArICdweCc7XHJcbiAgICAgICAgICAgIHNbM10ud2lkdGggPSBzaXplICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2lyY3VsYXIgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvV2lkdGggPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gdGhpcy53ICogMC41Oy8vTWF0aC5mbG9vcigodGhpcy53LTIwKSowLjUpO1xyXG5cclxuICAgICAgICB0aGlzLnR3b1BpID0gTWF0aC5QSSAqIDI7XHJcbiAgICAgICAgdGhpcy5waTkwID0gTWF0aC5QSSAqIDAuNTtcclxuXHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArIDEwO1xyXG4gICAgICAgIHRoaXMudG9wID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG5cclxuICAgICAgICBpZih0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6Jyt0aGlzLncrJ3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZ2V0Q2lyY3VsYXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLm1ha2VQYXRoKCksIDEgKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5mb250Q29sb3IsIDEgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy53KycgJyt0aGlzLncgKTtcclxuICAgICAgICB0aGlzLnNldENzcyggdGhpcy5jWzNdLCB7IHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMudywgbGVmdDowLCB0b3A6dGhpcy50b3AgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jbW9kZSA9PT0gbW9kZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgc3dpdGNoKCBtb2RlICl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywncmdiYSgwLDAsMCwwLjEpJywgMCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5mb250Q29sb3IsIDEgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5jb2xvclBsdXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywncmdiYSgwLDAsMCwwLjMpJywgMCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5jb2xvclBsdXMsIDEgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gbW9kZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNlbmRFbmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMub2xkciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICAvL3RoaXMubW9kZSgxKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIG9mZiA9IHRoaXMub2Zmc2V0O1xyXG5cclxuICAgICAgICBvZmYueCA9IHRoaXMucmFkaXVzIC0gKGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgb2ZmLnkgPSB0aGlzLnJhZGl1cyAtIChlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wICk7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IG9mZi5hbmdsZSgpIC0gdGhpcy5waTkwO1xyXG4gICAgICAgIHRoaXMuciA9ICgoKHRoaXMuciV0aGlzLnR3b1BpKSt0aGlzLnR3b1BpKSV0aGlzLnR3b1BpKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub2xkciAhPT0gbnVsbCApeyBcclxuXHJcbiAgICAgICAgICAgIHZhciBkaWYgPSB0aGlzLnIgLSB0aGlzLm9sZHI7XHJcbiAgICAgICAgICAgIHRoaXMuciA9IE1hdGguYWJzKGRpZikgPiBNYXRoLlBJID8gdGhpcy5vbGRyIDogdGhpcy5yO1xyXG5cclxuICAgICAgICAgICAgaWYoIGRpZiA+IDYgKSB0aGlzLnIgPSAwO1xyXG4gICAgICAgICAgICBpZiggZGlmIDwgLTYgKSB0aGlzLnIgPSB0aGlzLnR3b1BpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzdGVwcyA9IDEgLyB0aGlzLnR3b1BpO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuciAqIHN0ZXBzO1xyXG5cclxuICAgICAgICB2YXIgbiA9ICggKCB0aGlzLnJhbmdlICogdmFsdWUgKSArIHRoaXMubWluICkgLSB0aGlzLm9sZDtcclxuXHJcbiAgICAgICAgaWYobiA+PSB0aGlzLnN0ZXAgfHwgbiA8PSB0aGlzLnN0ZXApeyBcclxuICAgICAgICAgICAgbiA9IH5+ICggbiAvIHRoaXMuc3RlcCApO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMub2xkciA9IHRoaXMucjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtYWtlUGF0aCAoKSB7XHJcblxyXG4gICAgICAgIHZhciByID0gNDA7XHJcbiAgICAgICAgdmFyIGQgPSAyNDtcclxuICAgICAgICB2YXIgYSA9IHRoaXMucGVyY2VudCAqIHRoaXMudHdvUGkgLSAwLjAwMTtcclxuICAgICAgICB2YXIgeDIgPSAociArIHIgKiBNYXRoLnNpbihhKSkgKyBkO1xyXG4gICAgICAgIHZhciB5MiA9IChyIC0gciAqIE1hdGguY29zKGEpKSArIGQ7XHJcbiAgICAgICAgdmFyIGJpZyA9IGEgPiBNYXRoLlBJID8gMSA6IDA7XHJcbiAgICAgICAgcmV0dXJuIFwiTSBcIiArIChyK2QpICsgXCIsXCIgKyBkICsgXCIgQSBcIiArIHIgKyBcIixcIiArIHIgKyBcIiAwIFwiICsgYmlnICsgXCIgMSBcIiArIHgyICsgXCIsXCIgKyB5MjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gKCB0aGlzLnZhbHVlIC0gdGhpcy5taW4gKSAvIHRoaXMucmFuZ2U7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAxICk7XHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuLi9jb3JlL1Rvb2xzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xvciBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuXHQgICAgLy90aGlzLmF1dG9IZWlnaHQgPSB0cnVlO1xyXG5cclxuXHQgICAgdGhpcy5jdHlwZSA9IG8uY3R5cGUgfHwgJ2hleCc7XHJcblxyXG5cdCAgICB0aGlzLndmaXhlID0gdGhpcy5zYiA+IDI1NiA/IDI1NiA6IHRoaXMuc2I7XHJcblxyXG5cdCAgICBpZihvLmN3ICE9IHVuZGVmaW5lZCApIHRoaXMud2ZpeGUgPSBvLmN3O1xyXG5cclxuXHQgICAgLy8gY29sb3IgdXAgb3IgZG93blxyXG5cdCAgICB0aGlzLnNpZGUgPSBvLnNpZGUgfHwgJ2Rvd24nO1xyXG5cdCAgICB0aGlzLnVwID0gdGhpcy5zaWRlID09PSAnZG93bicgPyAwIDogMTtcclxuXHQgICAgXHJcblx0ICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcblxyXG5cdCAgICB0aGlzLm9mZnNldCA9IG5ldyBWMigpO1xyXG5cdCAgICB0aGlzLmRlY2FsID0gbmV3IFYyKCk7XHJcblx0ICAgIHRoaXMucCA9IG5ldyBWMigpO1xyXG5cclxuXHQgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCAgdGhpcy5jc3MudHh0ICsgJ2hlaWdodDonKyh0aGlzLmgtNCkrJ3B4OycgKyAnYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsgbGluZS1oZWlnaHQ6JysodGhpcy5oLTgpKydweDsnICk7XHJcblx0ICAgIHRoaXMuc1syXSA9IHRoaXMuY1syXS5zdHlsZTtcclxuXHJcblx0ICAgIGlmKCB0aGlzLnVwICl7XHJcblx0ICAgICAgICB0aGlzLnNbMl0udG9wID0gJ2F1dG8nO1xyXG5cdCAgICAgICAgdGhpcy5zWzJdLmJvdHRvbSA9ICcycHgnO1xyXG5cdCAgICB9XHJcblxyXG5cdCAgICB0aGlzLmNbM10gPSB0aGlzLmdldENvbG9yUmluZygpO1xyXG5cdCAgICB0aGlzLmNbM10uc3R5bGUudmlzaWJpbGl0eSAgPSAnaGlkZGVuJztcclxuXHJcblx0ICAgIHRoaXMuaHNsID0gbnVsbDtcclxuXHQgICAgdGhpcy52YWx1ZSA9ICcjZmZmZmZmJztcclxuXHQgICAgaWYoIG8udmFsdWUgIT09IHVuZGVmaW5lZCApe1xyXG5cdCAgICAgICAgaWYoIG8udmFsdWUgaW5zdGFuY2VvZiBBcnJheSApIHRoaXMudmFsdWUgPSBUb29scy5yZ2JUb0hleCggby52YWx1ZSApO1xyXG5cdCAgICAgICAgZWxzZSBpZighaXNOYU4oby52YWx1ZSkpIHRoaXMudmFsdWUgPSBUb29scy5oZXhUb0h0bWwoIG8udmFsdWUgKTtcclxuXHQgICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IG8udmFsdWU7XHJcblx0ICAgIH1cclxuXHJcblx0ICAgIHRoaXMuYmNvbG9yID0gbnVsbDtcclxuXHQgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHQgICAgdGhpcy5maXN0RG93biA9IGZhbHNlO1xyXG5cclxuXHQgICAgdGhpcy50ciA9IDk4O1xyXG5cdCAgICB0aGlzLnRzbCA9IE1hdGguc3FydCgzKSAqIHRoaXMudHI7XHJcblxyXG5cdCAgICB0aGlzLmh1ZSA9IDA7XHJcblx0ICAgIHRoaXMuZCA9IDI1NjtcclxuXHJcblx0ICAgIHRoaXMuc2V0Q29sb3IoIHRoaXMudmFsdWUgKTtcclxuXHJcblx0ICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuXHQgICAgaWYoIG8ub3BlbiAhPT0gdW5kZWZpbmVkICkgdGhpcy5vcGVuKCk7XHJcblxyXG5cdH1cclxuXHJcblx0dGVzdFpvbmUgKCBteCwgbXkgKSB7XHJcblxyXG5cdFx0bGV0IGwgPSB0aGlzLmxvY2FsO1xyXG5cdFx0aWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcblxyXG5cclxuXHRcdGlmKCB0aGlzLnVwICYmIHRoaXMuaXNPcGVuICl7XHJcblxyXG5cdFx0XHRpZiggbC55ID4gdGhpcy53Zml4ZSApIHJldHVybiAndGl0bGUnO1xyXG5cdFx0ICAgIGVsc2UgcmV0dXJuICdjb2xvcic7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdGlmKCBsLnkgPCB0aGlzLmJhc2VIKzIgKSByZXR1cm4gJ3RpdGxlJztcclxuXHQgICAgXHRlbHNlIGlmKCB0aGlzLmlzT3BlbiApIHJldHVybiAnY29sb3InO1xyXG5cclxuXHJcblx0XHR9XHJcblxyXG4gICAgfVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRtb3VzZXVwICggZSApIHtcclxuXHJcblx0ICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblx0ICAgIHRoaXMuZCA9IDI1NjtcclxuXHJcblx0fVxyXG5cclxuXHRtb3VzZWRvd24gKCBlICkge1xyXG5cclxuXHJcblx0XHRsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUuY2xpZW50WCwgZS5jbGllbnRZICk7XHJcblxyXG5cclxuXHRcdC8vaWYoICFuYW1lICkgcmV0dXJuO1xyXG5cdFx0aWYobmFtZSA9PT0gJ3RpdGxlJyl7XHJcblx0XHRcdGlmKCAhdGhpcy5pc09wZW4gKSB0aGlzLm9wZW4oKTtcclxuXHQgICAgICAgIGVsc2UgdGhpcy5jbG9zZSgpO1xyXG5cdCAgICAgICAgcmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdGlmKCBuYW1lID09PSAnY29sb3InICl7XHJcblxyXG5cdFx0XHR0aGlzLmlzRG93biA9IHRydWU7XHJcblx0XHRcdHRoaXMuZmlzdERvd24gPSB0cnVlXHJcblx0XHRcdHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuXHQgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlLmNsaWVudFgsIGUuY2xpZW50WSApO1xyXG5cclxuXHQgICAgbGV0IG9mZiwgZCwgaHVlLCBzYXQsIGx1bSwgcmFkLCB4LCB5LCByciwgVCA9IFRvb2xzO1xyXG5cclxuXHQgICAgaWYoIG5hbWUgPT09ICd0aXRsZScgKSB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuXHQgICAgaWYoIG5hbWUgPT09ICdjb2xvcicgKXtcclxuXHJcblx0ICAgIFx0b2ZmID0gdGhpcy5vZmZzZXQ7XHJcblx0XHQgICAgb2ZmLnggPSBlLmNsaWVudFggLSAoIHRoaXMuem9uZS54ICsgdGhpcy5kZWNhbC54ICsgdGhpcy5taWQgKTtcclxuXHRcdCAgICBvZmYueSA9IGUuY2xpZW50WSAtICggdGhpcy56b25lLnkgKyB0aGlzLmRlY2FsLnkgKyB0aGlzLm1pZCApO1xyXG5cdFx0XHRkID0gb2ZmLmxlbmd0aCgpICogdGhpcy5yYXRpbztcclxuXHRcdFx0cnIgPSBvZmYuYW5nbGUoKTtcclxuXHRcdFx0aWYocnIgPCAwKSByciArPSAyICogVC5QSTtcclxuXHRcdFx0XHRcdFx0XHJcblxyXG5cdCAgICBcdGlmICggZCA8IDEyOCApIHRoaXMuY3Vyc29yKCdjcm9zc2hhaXInKTtcclxuXHQgICAgXHRlbHNlIGlmKCAhdGhpcy5pc0Rvd24gKSB0aGlzLmN1cnNvcigpXHJcblxyXG5cdCAgICBcdGlmKCB0aGlzLmlzRG93biApe1xyXG5cclxuXHRcdFx0ICAgIGlmKCB0aGlzLmZpc3REb3duICl7XHJcblx0XHRcdCAgICBcdHRoaXMuZCA9IGQ7XHJcblx0XHRcdCAgICBcdHRoaXMuZmlzdERvd24gPSBmYWxzZTtcclxuXHRcdFx0ICAgIH1cclxuXHJcblx0XHRcdCAgICBpZiAoIHRoaXMuZCA8IDEyOCApIHtcclxuXHJcblx0XHRcdFx0ICAgIGlmICggdGhpcy5kID4gdGhpcy50ciApIHsgLy8gb3V0c2lkZSBodWVcclxuXHJcblx0XHRcdFx0ICAgICAgICBodWUgPSAoIHJyICsgVC5waTkwICkgLyBULlR3b1BJO1xyXG5cdFx0XHRcdCAgICAgICAgdGhpcy5odWUgPSAoaHVlICsgMSkgJSAxO1xyXG5cdFx0XHRcdCAgICAgICAgdGhpcy5zZXRIU0woWyhodWUgKyAxKSAlIDEsIHRoaXMuaHNsWzFdLCB0aGlzLmhzbFsyXV0pO1xyXG5cclxuXHRcdFx0XHQgICAgfSBlbHNlIHsgLy8gdHJpYW5nbGVcclxuXHJcblx0XHRcdFx0ICAgIFx0eCA9IG9mZi54ICogdGhpcy5yYXRpbztcclxuXHRcdFx0XHQgICAgXHR5ID0gb2ZmLnkgKiB0aGlzLnJhdGlvO1xyXG5cclxuXHRcdFx0XHQgICAgXHRsZXQgcnIgPSAodGhpcy5odWUgKiBULlR3b1BJKSArIFQuUEk7XHJcblx0XHRcdFx0ICAgIFx0aWYocnIgPCAwKSByciArPSAyICogVC5QSTtcclxuXHJcblx0XHRcdFx0ICAgIFx0cmFkID0gTWF0aC5hdGFuMigteSwgeCk7XHJcblx0XHRcdFx0ICAgIFx0aWYocmFkIDwgMCkgcmFkICs9IDIgKiBULlBJO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHQgICAgXHRsZXQgcmFkMCA9ICggcmFkICsgVC5waTkwICsgVC5Ud29QSSArIHJyICkgJSAoVC5Ud29QSSksXHJcblx0XHRcdFx0ICAgIFx0cmFkMSA9IHJhZDAgJSAoKDIvMykgKiBULlBJKSAtIChULnBpNjApLFxyXG5cdFx0XHRcdCAgICBcdGEgICAgPSAwLjUgKiB0aGlzLnRyLFxyXG5cdFx0XHRcdCAgICBcdGIgICAgPSBNYXRoLnRhbihyYWQxKSAqIGEsXHJcblx0XHRcdFx0ICAgIFx0ciAgICA9IE1hdGguc3FydCh4KnggKyB5KnkpLFxyXG5cdFx0XHRcdCAgICBcdG1heFIgPSBNYXRoLnNxcnQoYSphICsgYipiKTtcclxuXHJcblx0XHRcdFx0ICAgIFx0aWYoIHIgPiBtYXhSICkge1xyXG5cdFx0XHRcdFx0XHRcdGxldCBkeCA9IE1hdGgudGFuKHJhZDEpICogcjtcclxuXHRcdFx0XHRcdFx0XHRsZXQgcmFkMiA9IE1hdGguYXRhbihkeCAvIG1heFIpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKHJhZDIgPiBULnBpNjApICByYWQyID0gVC5waTYwO1xyXG5cdFx0XHRcdFx0XHQgICAgZWxzZSBpZiggcmFkMiA8IC1ULnBpNjAgKSByYWQyID0gLVQucGk2MDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0cmFkICs9IHJhZDIgLSByYWQxO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRyYWQwID0gKHJhZCArIFQucGk5MCAgKyBULlR3b1BJICsgcnIpICUgKFQuVHdvUEkpLFxyXG5cdFx0XHRcdFx0XHRcdHJhZDEgPSByYWQwICUgKCgyLzMpICogVC5QSSkgLSAoVC5waTYwKTtcclxuXHRcdFx0XHRcdFx0XHRiID0gTWF0aC50YW4ocmFkMSkgKiBhO1xyXG5cdFx0XHRcdFx0XHRcdHIgPSBtYXhSID0gTWF0aC5zcXJ0KGEqYSArIGIqYik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGx1bSA9ICgoTWF0aC5zaW4ocmFkMCkgKiByKSAvIHRoaXMudHNsKSArIDAuNTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0bGV0IHcgPSAxIC0gKE1hdGguYWJzKGx1bSAtIDAuNSkgKiAyKTtcclxuXHRcdFx0XHRcdFx0c2F0ID0gKCgoTWF0aC5jb3MocmFkMCkgKiByKSArICh0aGlzLnRyIC8gMikpIC8gKDEuNSAqIHRoaXMudHIpKSAvIHc7XHJcblx0XHRcdFx0XHRcdHNhdCA9IFQuY2xhbXAoIHNhdCwgMCwgMSApO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuc2V0SFNMKFt0aGlzLmhzbFswXSwgc2F0LCBsdW1dKTtcclxuXHJcblx0XHRcdFx0ICAgIH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdHNldEhlaWdodCAoKSB7XHJcblxyXG5cdFx0dGhpcy5oID0gdGhpcy5pc09wZW4gPyB0aGlzLndmaXhlICsgdGhpcy5iYXNlSCArIDUgOiB0aGlzLmJhc2VIO1xyXG5cdFx0dGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcblx0XHR0aGlzLnpvbmUuaCA9IHRoaXMuaDtcclxuXHJcblx0fVxyXG5cclxuXHRwYXJlbnRIZWlnaHQgKCB0ICkge1xyXG5cclxuXHRcdGlmICggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApIHRoaXMucGFyZW50R3JvdXAuY2FsYyggdCApO1xyXG5cdCAgICBlbHNlIGlmICggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHQgKTtcclxuXHJcblx0fVxyXG5cclxuXHRvcGVuICgpIHtcclxuXHJcblx0XHRzdXBlci5vcGVuKCk7XHJcblxyXG5cdFx0dGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcblx0XHRpZiggdGhpcy51cCApIHRoaXMuem9uZS55IC09IHRoaXMud2ZpeGUgKyA1O1xyXG5cclxuXHRcdGxldCB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcblx0ICAgIHRoaXMuc1szXS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xyXG5cdCAgICAvL3RoaXMuc1szXS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHQgICAgdGhpcy5wYXJlbnRIZWlnaHQoIHQgKTtcclxuXHJcblx0fVxyXG5cclxuXHRjbG9zZSAoKSB7XHJcblxyXG5cdFx0c3VwZXIuY2xvc2UoKTtcclxuXHJcblx0XHRpZiggdGhpcy51cCApIHRoaXMuem9uZS55ICs9IHRoaXMud2ZpeGUgKyA1O1xyXG5cclxuXHRcdGxldCB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcblx0XHR0aGlzLnNldEhlaWdodCgpO1xyXG5cclxuXHQgICAgdGhpcy5zWzNdLnZpc2liaWxpdHkgID0gJ2hpZGRlbic7XHJcblx0ICAgIC8vdGhpcy5zWzNdLmRpc3BsYXkgPSAnbm9uZSc7XHJcblx0ICAgIHRoaXMucGFyZW50SGVpZ2h0KCAtdCApO1xyXG5cclxuXHR9XHJcblxyXG5cdHVwZGF0ZSAoIHVwICkge1xyXG5cclxuXHQgICAgbGV0IGNjID0gVG9vbHMucmdiVG9IZXgoIFRvb2xzLmhzbFRvUmdiKFsgdGhpcy5oc2xbMF0sIDEsIDAuNSBdKSApO1xyXG5cclxuXHQgICAgdGhpcy5tb3ZlTWFya2VycygpO1xyXG5cdCAgICBcclxuXHQgICAgdGhpcy52YWx1ZSA9IHRoaXMuYmNvbG9yO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCBjYywgMiwgMCApO1xyXG5cclxuXHJcblx0ICAgIHRoaXMuc1syXS5iYWNrZ3JvdW5kID0gdGhpcy5iY29sb3I7XHJcblx0ICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IFRvb2xzLmh0bWxUb0hleCggdGhpcy5iY29sb3IgKTtcclxuXHJcblx0ICAgIHRoaXMuaW52ZXJ0ID0gVG9vbHMuZmluZERlZXBJbnZlciggdGhpcy5yZ2IgKTtcclxuXHQgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCc7XHJcblxyXG5cdCAgICBpZighdXApIHJldHVybjtcclxuXHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAnYXJyYXknICkgdGhpcy5zZW5kKCB0aGlzLnJnYiApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ3JnYicgKSB0aGlzLnNlbmQoIFRvb2xzLmh0bWxSZ2IoIHRoaXMucmdiICkgKTtcclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdoZXgnICkgdGhpcy5zZW5kKCBUb29scy5odG1sVG9IZXgoIHRoaXMudmFsdWUgKSApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ2h0bWwnICkgdGhpcy5zZW5kKCk7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0Q29sb3IgKCBjb2xvciApIHtcclxuXHJcblx0ICAgIGxldCB1bnBhY2sgPSBUb29scy51bnBhY2soY29sb3IpO1xyXG5cdCAgICBpZiAodGhpcy5iY29sb3IgIT0gY29sb3IgJiYgdW5wYWNrKSB7XHJcblxyXG5cdCAgICAgICAgdGhpcy5iY29sb3IgPSBjb2xvcjtcclxuXHQgICAgICAgIHRoaXMucmdiID0gdW5wYWNrO1xyXG5cdCAgICAgICAgdGhpcy5oc2wgPSBUb29scy5yZ2JUb0hzbCggdGhpcy5yZ2IgKTtcclxuXHJcblx0ICAgICAgICB0aGlzLmh1ZSA9IHRoaXMuaHNsWzBdO1xyXG5cclxuXHQgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblx0ICAgIH1cclxuXHQgICAgcmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0SFNMICggaHNsICkge1xyXG5cclxuXHQgICAgdGhpcy5oc2wgPSBoc2w7XHJcblx0ICAgIHRoaXMucmdiID0gVG9vbHMuaHNsVG9SZ2IoIGhzbCApO1xyXG5cdCAgICB0aGlzLmJjb2xvciA9IFRvb2xzLnJnYlRvSGV4KCB0aGlzLnJnYiApO1xyXG5cdCAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG5cdCAgICByZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRtb3ZlTWFya2VycyAoKSB7XHJcblxyXG5cdFx0bGV0IHAgPSB0aGlzLnA7XHJcblx0XHRsZXQgVCA9IFRvb2xzO1xyXG5cclxuXHQgICAgbGV0IGMxID0gdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCc7XHJcblx0ICAgIGxldCBhID0gdGhpcy5oc2xbMF0gKiBULlR3b1BJO1xyXG5cdCAgICBsZXQgdGhpcmQgPSAoMi8zKSAqIFQuUEk7XHJcblx0ICAgIGxldCByID0gdGhpcy50cjtcclxuXHQgICAgbGV0IGggPSB0aGlzLmhzbFswXTtcclxuXHQgICAgbGV0IHMgPSB0aGlzLmhzbFsxXTtcclxuXHQgICAgbGV0IGwgPSB0aGlzLmhzbFsyXTtcclxuXHJcblx0ICAgIGxldCBhbmdsZSA9ICggYSAtIFQucGk5MCApICogVC50b2RlZztcclxuXHJcblx0ICAgIGggPSAtIGEgKyBULnBpOTA7XHJcblxyXG5cdFx0bGV0IGh4ID0gTWF0aC5jb3MoaCkgKiByO1xyXG5cdFx0bGV0IGh5ID0gLU1hdGguc2luKGgpICogcjtcclxuXHRcdGxldCBzeCA9IE1hdGguY29zKGggLSB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IHN5ID0gLU1hdGguc2luKGggLSB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IHZ4ID0gTWF0aC5jb3MoaCArIHRoaXJkKSAqIHI7XHJcblx0XHRsZXQgdnkgPSAtTWF0aC5zaW4oaCArIHRoaXJkKSAqIHI7XHJcblx0XHRsZXQgbXggPSAoc3ggKyB2eCkgLyAyLCBteSA9IChzeSArIHZ5KSAvIDI7XHJcblx0XHRhICA9ICgxIC0gMiAqIE1hdGguYWJzKGwgLSAuNSkpICogcztcclxuXHRcdGxldCB4ID0gc3ggKyAodnggLSBzeCkgKiBsICsgKGh4IC0gbXgpICogYTtcclxuXHRcdGxldCB5ID0gc3kgKyAodnkgLSBzeSkgKiBsICsgKGh5IC0gbXkpICogYTtcclxuXHJcblx0ICAgIHAuc2V0KCB4LCB5ICkuYWRkU2NhbGFyKDEyOCk7XHJcblxyXG5cdCAgICAvL2xldCBmZiA9ICgxLWwpKjI1NTtcclxuXHQgICAgLy8gdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2IoJytmZisnLCcrZmYrJywnK2ZmKycpJywgMyApO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3RyYW5zZm9ybScsICdyb3RhdGUoJythbmdsZSsnICknLCAyICk7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCBwLngsIDMgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgcC55LCAzICk7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCcsIDIsIDMgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnLCAzICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJyx0aGlzLmJjb2xvciwgMyApO1xyXG5cclxuXHR9XHJcblxyXG5cdHJTaXplICgpIHtcclxuXHJcblx0ICAgIC8vUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHQgICAgc3VwZXIuclNpemUoKTtcclxuXHJcblx0ICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuXHQgICAgc1syXS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG5cdCAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuXHJcblx0ICAgIHRoaXMuZGVjYWwueCA9IE1hdGguZmxvb3IoKHRoaXMudyAtIHRoaXMud2ZpeGUpICogMC41KTtcclxuXHQgICAgdGhpcy5kZWNhbC55ID0gdGhpcy5zaWRlID09PSAndXAnID8gMiA6IHRoaXMuYmFzZUggKyAyO1xyXG5cdCAgICB0aGlzLm1pZCA9IE1hdGguZmxvb3IoIHRoaXMud2ZpeGUgKiAwLjUgKTtcclxuXHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLndmaXhlKycgJyt0aGlzLndmaXhlICk7XHJcblx0ICAgIHNbM10ud2lkdGggPSB0aGlzLndmaXhlICsgJ3B4JztcclxuXHQgICAgc1szXS5oZWlnaHQgPSB0aGlzLndmaXhlICsgJ3B4JztcclxuICAgIFx0c1szXS5sZWZ0ID0gdGhpcy5kZWNhbC54ICsgJ3B4JztcclxuXHQgICAgc1szXS50b3AgPSB0aGlzLmRlY2FsLnkgKyAncHgnO1xyXG5cclxuXHQgICAgdGhpcy5yYXRpbyA9IDI1Ni90aGlzLndmaXhlO1xyXG5cdCAgICB0aGlzLnNxdWFyZSA9IDEgLyAoNjAqKHRoaXMud2ZpeGUvMjU2KSk7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLnNldEhlaWdodCgpO1xyXG5cdCAgICBcclxuXHR9XHJcblxyXG59IiwiaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuLi9jb3JlL1Jvb3RzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGcHMgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5yb3VuZCA9IE1hdGgucm91bmQ7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b0hlaWdodCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcbiAgICAgICAgdGhpcy5ocGx1cyA9IG8uaHBsdXMgfHwgNTA7XHJcblxyXG4gICAgICAgIHRoaXMucmVzID0gby5yZXMgfHwgNDA7XHJcbiAgICAgICAgdGhpcy5sID0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiB8fCAwO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLmN1c3RvbSA9IG8uY3VzdG9tIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubmFtZXMgPSBvLm5hbWVzIHx8IFsnRlBTJywgJ01TJ107XHJcbiAgICAgICAgbGV0IGNjID0gby5jYyB8fCBbJzkwLDkwLDkwJywgJzI1NSwyNTUsMCddO1xyXG5cclxuICAgICAgIC8vIHRoaXMuZGl2aWQgPSBbIDEwMCwgMTAwLCAxMDAgXTtcclxuICAgICAgIC8vIHRoaXMubXVsdHkgPSBbIDMwLCAzMCwgMzAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRpbmcgPSBvLmFkZGluZyB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IG8ucmFuZ2UgfHwgWyAxNjUsIDEwMCwgMTAwIF07XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSBvLmFscGhhIHx8IDAuMjU7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXTtcclxuICAgICAgICB0aGlzLnRleHREaXNwbGF5ID0gW107XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmN1c3RvbSl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5vdyA9ICggc2VsZi5wZXJmb3JtYW5jZSAmJiBzZWxmLnBlcmZvcm1hbmNlLm5vdyApID8gc2VsZi5wZXJmb3JtYW5jZS5ub3cuYmluZCggcGVyZm9ybWFuY2UgKSA6IERhdGUubm93O1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IDA7Ly90aGlzLm5vdygpXHJcbiAgICAgICAgICAgIHRoaXMucHJldlRpbWUgPSAwOy8vdGhpcy5zdGFydFRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzID0gMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubXMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmZwcyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubWVtID0gMDtcclxuICAgICAgICAgICAgdGhpcy5tbSA9IDA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzTWVtID0gKCBzZWxmLnBlcmZvcm1hbmNlICYmIHNlbGYucGVyZm9ybWFuY2UubWVtb3J5ICkgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgICAgIC8vIHRoaXMuZGl2aWQgPSBbIDEwMCwgMjAwLCAxIF07XHJcbiAgICAgICAgICAgLy8gdGhpcy5tdWx0eSA9IFsgMzAsIDMwLCAzMCBdO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNNZW0gKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWVzLnB1c2goJ01FTScpO1xyXG4gICAgICAgICAgICAgICAgY2MucHVzaCgnMCwyNTUsMjU1Jyk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnR4dCA9ICdGUFMnXHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNjtcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy50eHQ7XHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuXHJcbiAgICAgICAgbGV0IHBhbmVsQ3NzID0gJ2Rpc3BsYXk6bm9uZTsgbGVmdDoxMHB4OyB0b3A6JysgdGhpcy5oICsgJ3B4OyBoZWlnaHQ6JysodGhpcy5ocGx1cyAtIDgpKydweDsgYm94LXNpemluZzpib3JkZXItYm94OyBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMik7IGJvcmRlcjonICsgKHRoaXMuY29sb3JzLmdyb3VwQm9yZGVyICE9PSAnbm9uZSc/IHRoaXMuY29sb3JzLmdyb3VwQm9yZGVyKyc7JyA6ICcxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpOycpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5yYWRpdXMgIT09IDAgKSBwYW5lbENzcyArPSAnYm9yZGVyLXJhZGl1czonICsgdGhpcy5yYWRpdXMrJ3B4Oyc7IFxyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArIHBhbmVsQ3NzICwge30gKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgndmlld0JveCcsICcwIDAgJyt0aGlzLnJlcysnIDUwJyApO1xyXG4gICAgICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsICcxMDAlJyApO1xyXG4gICAgICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgJzEwMCUnICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgncHJlc2VydmVBc3BlY3RSYXRpbycsICdub25lJyApO1xyXG5cclxuXHJcbiAgICAgICAgLy90aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoMjU1LDI1NSwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6JyNGRjAnLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAgICAgLy90aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoMCwyNTUsMjU1LDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6JyMwRkYnLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gYXJyb3dcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6NHB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5hcnJvdywgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgICAgICAvLyByZXN1bHQgdGVzdFxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3Bvc2l0aW9uOmFic29sdXRlOyBsZWZ0OjEwcHg7IHRvcDonKyh0aGlzLmgrMikgKydweDsgZGlzcGxheTpub25lOyB3aWR0aDoxMDAlOyB0ZXh0LWFsaWduOmNlbnRlcjsnICk7XHJcblxyXG4gICAgICAgIC8vIGJvdHRvbSBsaW5lXHJcbiAgICAgICAgaWYoIG8uYm90dG9tTGluZSApIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgYm90dG9tOjBweDsgaGVpZ2h0OjFweDsgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpOycpO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2hvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc1sxXS5tYXJnaW5MZWZ0ID0gJzEwcHgnO1xyXG4gICAgICAgIHNbMV0ubGluZUhlaWdodCA9IHRoaXMuaC00O1xyXG4gICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICBzWzFdLmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApICBzWzBdLmJvcmRlclJhZGl1cyA9IHRoaXMucmFkaXVzKydweCc7IFxyXG4gICAgICAgIHNbMF0uYm9yZGVyID0gdGhpcy5jb2xvcnMuZ3JvdXBCb3JkZXI7XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgIGxldCBqID0gMDtcclxuXHJcbiAgICAgICAgZm9yKCBqPTA7IGo8dGhpcy5uYW1lcy5sZW5ndGg7IGorKyApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGJhc2UgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGkgPSB0aGlzLnJlcysxO1xyXG4gICAgICAgICAgICB3aGlsZSggaS0tICkgYmFzZS5wdXNoKDUwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmFuZ2Vbal0gPSAoIDEgLyB0aGlzLnJhbmdlW2pdICkgKiA0OTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzLnB1c2goIGJhc2UgKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMucHVzaCgwKTtcclxuICAgICAgICAgICAvLyAgdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKCcrY2Nbal0rJywwLjUpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOidyZ2JhKCcrY2Nbal0rJywxKScsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0RGlzcGxheS5wdXNoKCBcIjxzcGFuIHN0eWxlPSdjb2xvcjpyZ2IoXCIrY2Nbal0rXCIpJz4gXCIgKyB0aGlzLm5hbWVzW2pdICtcIiBcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaiA9IHRoaXMubmFtZXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGotLSl7XHJcbiAgICAgICAgICAgIHRoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgnK2NjW2pdKycsJyt0aGlzLmFscGhhKycpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOidyZ2JhKCcrY2Nbal0rJywxKScsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgLy9pZiggdGhpcy5pc1Nob3cgKSB0aGlzLnNob3coKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1Nob3cgKSB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm9wZW4oKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8qbW9kZTogZnVuY3Rpb24gKCBtb2RlICkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIC8vc1sxXS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gJyNGRkYnO1xyXG4gICAgICAgICAgICAgICAgLy9zWzFdLmJhY2tncm91bmQgPSBVSUwuU0VMRUNUO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0IC8gZG93blxyXG4gICAgICAgICAgICAgICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgLy9zWzFdLmJhY2tncm91bmQgPSBVSUwuU0VMRUNURE9XTjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH0sKi9cclxuXHJcbiAgICB0aWNrICggdiApIHtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSB2O1xyXG4gICAgICAgIGlmKCAhdGhpcy5pc1Nob3cgKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5kcmF3R3JhcGgoKTtcclxuICAgICAgICB0aGlzLnVwVGV4dCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtYWtlUGF0aCAoIHBvaW50ICkge1xyXG5cclxuICAgICAgICBsZXQgcCA9ICcnO1xyXG4gICAgICAgIHAgKz0gJ00gJyArICgtMSkgKyAnICcgKyA1MDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnJlcyArIDE7IGkgKysgKSB7IHAgKz0gJyBMICcgKyBpICsgJyAnICsgcG9pbnRbaV07IH1cclxuICAgICAgICBwICs9ICcgTCAnICsgKHRoaXMucmVzICsgMSkgKyAnICcgKyA1MDtcclxuICAgICAgICByZXR1cm4gcDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBUZXh0ICggdmFsICkge1xyXG5cclxuICAgICAgICBsZXQgdiA9IHZhbCB8fCB0aGlzLnZhbHVlcywgdCA9ICcnO1xyXG4gICAgICAgIGZvciggbGV0IGo9MCwgbG5nID10aGlzLm5hbWVzLmxlbmd0aDsgajxsbmc7IGorKyApIHQgKz0gdGhpcy50ZXh0RGlzcGxheVtqXSArICh2W2pdKS50b0ZpeGVkKHRoaXMucHJlY2lzaW9uKSArICc8L3NwYW4+JztcclxuICAgICAgICB0aGlzLmNbNF0uaW5uZXJIVE1MID0gdDtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGRyYXdHcmFwaCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBzdmcgPSB0aGlzLmNbMl07XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLm5hbWVzLmxlbmd0aCwgdiwgb2xkID0gMCwgbiA9IDA7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaWYoIHRoaXMuYWRkaW5nICkgdiA9ICh0aGlzLnZhbHVlc1tuXStvbGQpICogdGhpcy5yYW5nZVtuXTtcclxuICAgICAgICAgICAgZWxzZSAgdiA9ICh0aGlzLnZhbHVlc1tuXSAqIHRoaXMucmFuZ2Vbbl0pO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50c1tuXS5zaGlmdCgpO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50c1tuXS5wdXNoKCA1MCAtIHYgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHN2ZywgJ2QnLCB0aGlzLm1ha2VQYXRoKCB0aGlzLnBvaW50c1tuXSApLCBpKzEgKTtcclxuICAgICAgICAgICAgb2xkICs9IHRoaXMudmFsdWVzW25dO1xyXG4gICAgICAgICAgICBuKys7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgb3BlbiAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLm9wZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5ocGx1cyArIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5zdmdzLmFycm93RG93biApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApeyB0aGlzLnBhcmVudEdyb3VwLmNhbGMoIHRoaXMuaHBsdXMgKTt9XHJcbiAgICAgICAgZWxzZSBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHRoaXMuaHBsdXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdibG9jayc7IFxyXG4gICAgICAgIHRoaXMuc1s0XS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB0aGlzLmlzU2hvdyA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXN0b20gKSBSb290cy5hZGRMaXN0ZW4oIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMuc3Zncy5hcnJvdyApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApeyB0aGlzLnBhcmVudEdyb3VwLmNhbGMoIC10aGlzLmhwbHVzICk7fVxyXG4gICAgICAgIGVsc2UgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCAtdGhpcy5ocGx1cyApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKydweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5zWzRdLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5pc1Nob3cgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1c3RvbSApIFJvb3RzLnJlbW92ZUxpc3RlbiggdGhpcyApO1xyXG5cclxuICAgICAgICB0aGlzLmNbNF0uaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLy8vIEFVVE8gRlBTIC8vLy8vL1xyXG5cclxuICAgIGJlZ2luICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLm5vdygpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGVuZCAoKSB7XHJcblxyXG4gICAgICAgIGxldCB0aW1lID0gdGhpcy5ub3coKTtcclxuICAgICAgICB0aGlzLm1zID0gdGltZSAtIHRoaXMuc3RhcnRUaW1lO1xyXG5cclxuICAgICAgICB0aGlzLmZyYW1lcyArKztcclxuXHJcbiAgICAgICAgaWYgKCB0aW1lID4gdGhpcy5wcmV2VGltZSArIDEwMDAgKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZwcyA9IHRoaXMucm91bmQoICggdGhpcy5mcmFtZXMgKiAxMDAwICkgLyAoIHRpbWUgLSB0aGlzLnByZXZUaW1lICkgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJldlRpbWUgPSB0aW1lO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lcyA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoIHRoaXMuaXNNZW0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGhlYXBTaXplID0gcGVyZm9ybWFuY2UubWVtb3J5LnVzZWRKU0hlYXBTaXplO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhlYXBTaXplTGltaXQgPSBwZXJmb3JtYW5jZS5tZW1vcnkuanNIZWFwU2l6ZUxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubWVtID0gdGhpcy5yb3VuZCggaGVhcFNpemUgKiAwLjAwMDAwMDk1NCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tbSA9IGhlYXBTaXplIC8gaGVhcFNpemVMaW1pdDtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFsgdGhpcy5mcHMsIHRoaXMubXMgLCB0aGlzLm1tIF07XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd0dyYXBoKCk7XHJcbiAgICAgICAgdGhpcy51cFRleHQoIFsgdGhpcy5mcHMsIHRoaXMubXMsIHRoaXMubWVtIF0gKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRpbWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbmluZyAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXN0b20gKSB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuZW5kKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgdyA9IHRoaXMudztcclxuXHJcbiAgICAgICAgc1swXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMV0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSAxMCArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9ICh3LTIwKSArICdweCc7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9ICh3LTIwKSArICdweCc7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5leHBvcnQgY2xhc3MgR3JhcGggZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICBcdHRoaXMudmFsdWUgPSBvLnZhbHVlICE9PSB1bmRlZmluZWQgPyBvLnZhbHVlIDogWzAsMCwwXTtcclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uICE9PSB1bmRlZmluZWQgPyBvLnByZWNpc2lvbiA6IDI7XHJcbiAgICAgICAgdGhpcy5tdWx0aXBsaWNhdG9yID0gby5tdWx0aXBsaWNhdG9yIHx8IDE7XHJcbiAgICAgICAgdGhpcy5uZWcgPSBvLm5lZyB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5saW5lID0gby5saW5lICE9PSB1bmRlZmluZWQgPyAgby5saW5lIDogdHJ1ZTtcclxuXHJcbiAgICAgICAgLy9pZih0aGlzLm5lZyl0aGlzLm11bHRpcGxpY2F0b3IqPTI7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gby5hdXRvV2lkdGggIT09IHVuZGVmaW5lZCA/IG8uYXV0b1dpZHRoIDogdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzTnVtYmVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCAxMjggKyAxMDtcclxuICAgICAgICB0aGlzLnJoID0gdGhpcy5oIC0gMTA7XHJcbiAgICAgICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHsgLy8gd2l0aCB0aXRsZVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vdGhpcy5jWzFdLnN0eWxlLmJhY2tncm91bmQgPSAnI2ZmMDAwMCc7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5naCA9IHRoaXMucmggLSAyODtcclxuICAgICAgICB0aGlzLmd3ID0gdGhpcy53IC0gMjg7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICBsZXQgc3ZnID0gdGhpcy5kb20oICdzdmcnLCB0aGlzLmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdGhpcy53KycgJyt0aGlzLnJoLCB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLnJoLCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHN2ZywgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLnJoLCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOnRoaXMuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOjIsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOididXR0JyB9LCBzdmcgKTtcclxuICAgICAgICB0aGlzLmRvbSggJ3JlY3QnLCAnJywgeyB4OjEwLCB5OjEwLCB3aWR0aDp0aGlzLmd3KzgsIGhlaWdodDp0aGlzLmdoKzgsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MSAsIGZpbGw6J25vbmUnfSwgc3ZnICk7XHJcblxyXG4gICAgICAgIHRoaXMuaXcgPSAoKHRoaXMuZ3ctKDQqKHRoaXMubG5nLTEpKSkvdGhpcy5sbmcpO1xyXG4gICAgICAgIGxldCB0ID0gW107XHJcbiAgICAgICAgdGhpcy5jTW9kZSA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnYgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgIFx0dFtpXSA9IFsgMTQgKyAoaSp0aGlzLml3KSArIChpKjQpLCB0aGlzLml3IF07XHJcbiAgICAgICAgXHR0W2ldWzJdID0gdFtpXVswXSArIHRbaV1bMV07XHJcbiAgICAgICAgXHR0aGlzLmNNb2RlW2ldID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLm5lZyApIHRoaXMudltpXSA9ICgoMSsodGhpcy52YWx1ZVtpXSAvIHRoaXMubXVsdGlwbGljYXRvcikpKjAuNSk7XHJcbiAgICAgICAgXHRlbHNlIHRoaXMudltpXSA9IHRoaXMudmFsdWVbaV0gLyB0aGlzLm11bHRpcGxpY2F0b3I7XHJcblxyXG4gICAgICAgIFx0dGhpcy5kb20oICdyZWN0JywgJycsIHsgeDp0W2ldWzBdLCB5OjE0LCB3aWR0aDp0W2ldWzFdLCBoZWlnaHQ6MSwgZmlsbDp0aGlzLmZvbnRDb2xvciwgJ2ZpbGwtb3BhY2l0eSc6MC4zIH0sIHN2ZyApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudG1wID0gdDtcclxuICAgICAgICB0aGlzLmNbM10gPSBzdmc7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy53KVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS50b3AgPSAwICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUuaGVpZ2h0ID0gMjAgKydweCc7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXS5saW5lSGVpZ2h0ID0gKDIwLTUpKydweCdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCBmYWxzZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVTVkcgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5saW5lICkgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLm1ha2VQYXRoKCksIDAgKTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaTx0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2hlaWdodCcsIHRoaXMudltpXSp0aGlzLmdoLCBpKzIgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3knLCAxNCArICh0aGlzLmdoIC0gdGhpcy52W2ldKnRoaXMuZ2gpLCBpKzIgKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMubmVnICkgdGhpcy52YWx1ZVtpXSA9ICggKCh0aGlzLnZbaV0qMiktMSkgKiB0aGlzLm11bHRpcGxpY2F0b3IgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZhbHVlW2ldID0gKCAodGhpcy52W2ldICogdGhpcy5tdWx0aXBsaWNhdG9yKSApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuXHQgICAgaWYoIGwueT50aGlzLnRvcCAmJiBsLnk8dGhpcy5oLTIwICl7XHJcblx0ICAgICAgICB3aGlsZSggaS0tICl7XHJcblx0ICAgICAgICAgICAgaWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGk7XHJcblx0ICAgICAgICB9XHJcblx0ICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBuLCBuYW1lICkge1xyXG5cclxuICAgIFx0aWYoIG4gPT09IHRoaXMuY01vZGVbbmFtZV0gKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHRsZXQgYTtcclxuXHJcbiAgICAgICAgc3dpdGNoKG4pe1xyXG4gICAgICAgICAgICBjYXNlIDA6IGE9MC4zOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiBhPTAuNjsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogYT0xOyBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwtb3BhY2l0eScsIGEsIG5hbWUgKyAyICk7XHJcbiAgICAgICAgdGhpcy5jTW9kZVtuYW1lXSA9IG47XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgIFx0bGV0IG51cCA9IGZhbHNlO1xyXG4gICAgICAgIC8vdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICAgICAgaWYoIHRoaXMuY01vZGVbaV0gIT09IDAgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY01vZGVbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwtb3BhY2l0eScsIDAuMywgaSArIDIgKTtcclxuICAgICAgICAgICAgICAgIG51cCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICkgcmV0dXJuIHRoaXMucmVzZXQoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgIFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgIFx0bGV0IG51cCA9IGZhbHNlO1xyXG5cclxuICAgIFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKGUpO1xyXG5cclxuICAgIFx0aWYoIG5hbWUgPT09ICcnICl7XHJcblxyXG4gICAgICAgICAgICBudXAgPSB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHsgXHJcblxyXG4gICAgICAgICAgICBudXAgPSB0aGlzLm1vZGUoIHRoaXMuaXNEb3duID8gMiA6IDEsIG5hbWUgKTtcclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvciggdGhpcy5jdXJyZW50ICE9PSAtMSA/ICdtb3ZlJyA6ICdwb2ludGVyJyApO1xyXG4gICAgICAgICAgICBpZih0aGlzLmlzRG93bil7XHJcbiAgICAgICAgICAgIFx0dGhpcy52W25hbWVdID0gdGhpcy5jbGFtcCggMSAtICgoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3AgLSAxMCApIC8gdGhpcy5naCkgLCAwLCAxICk7XHJcbiAgICAgICAgICAgIFx0dGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICBcdHRoaXMudXBkYXRlU1ZHKCk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtYWtlUGF0aCAoKSB7XHJcblxyXG4gICAgXHRsZXQgcCA9IFwiXCIsIGgsIHcsIHduLCB3bSwgb3csIG9oO1xyXG4gICAgXHQvL2xldCBnID0gdGhpcy5pdyowLjVcclxuXHJcbiAgICBcdGZvcihsZXQgaSA9IDA7IGk8dGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgIFx0XHRoID0gMTQgKyAodGhpcy5naCAtIHRoaXMudltpXSp0aGlzLmdoKTtcclxuICAgIFx0XHR3ID0gKDE0ICsgKGkqdGhpcy5pdykgKyAoaSo0KSk7XHJcblxyXG4gICAgXHRcdHdtID0gdyArIHRoaXMuaXcqMC41O1xyXG4gICAgXHRcdHduID0gdyArIHRoaXMuaXc7XHJcblxyXG4gICAgXHRcdGlmKGk9PT0wKSBwKz0nTSAnK3crJyAnKyBoICsgJyBUICcgKyB3bSArJyAnKyBoO1xyXG4gICAgXHRcdGVsc2UgcCArPSAnIEMgJyArIG93ICsnICcrIG9oICsgJywnICsgdyArJyAnKyBoICsgJywnICsgd20gKycgJysgaDtcclxuICAgIFx0XHRpZihpID09PSB0aGlzLmxuZy0xKSBwKz0nIFQgJyArIHduICsnICcrIGg7XHJcblxyXG4gICAgXHRcdG93ID0gd25cclxuICAgIFx0XHRvaCA9IGggXHJcblxyXG4gICAgXHR9XHJcblxyXG4gICAgXHRyZXR1cm4gcDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSBzWzFdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuICAgICAgICBzWzNdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuXHJcbiAgICAgICAgbGV0IGd3ID0gdGhpcy53IC0gMjg7XHJcbiAgICAgICAgbGV0IGl3ID0gKChndy0oNCoodGhpcy5sbmctMSkpKS90aGlzLmxuZyk7XHJcblxyXG4gICAgICAgIGxldCB0ID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdFtpXSA9IFsgMTQgKyAoaSppdykgKyAoaSo0KSwgaXcgXTtcclxuICAgICAgICAgICAgdFtpXVsyXSA9IHRbaV1bMF0gKyB0W2ldWzFdO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudG1wID0gdDtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiXHJcbmltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi4vY29yZS9Sb290cyc7XHJcbmltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgR3JvdXAgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5BREQgPSBvLmFkZDtcclxuXHJcbiAgICAgICAgdGhpcy51aXMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuZGVjYWwgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTY7XHJcblxyXG4gICAgICAgIHRoaXMuaXNMaW5lID0gby5saW5lICE9PSB1bmRlZmluZWQgPyBvLmxpbmUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBsZWZ0OjA7IGhlaWdodDphdXRvOyBvdmVyZmxvdzpoaWRkZW47IHRvcDonK3RoaXMuaCsncHgnKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6MDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuZ3JvdXAsIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6NHB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5hcnJvdywgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG4gICAgICAgIC8vIGJvdHRvbSBsaW5lXHJcbiAgICAgICAgaWYodGhpcy5pc0xpbmUpIHRoaXMuY1s1XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAgJ2JhY2tncm91bmQ6cmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpOyB3aWR0aDoxMDAlOyBsZWZ0OjA7IGhlaWdodDoxcHg7IGJvdHRvbTowcHgnKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICBzWzFdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzFdLm5hbWUgPSAnZ3JvdXAnO1xyXG5cclxuICAgICAgICBzWzFdLm1hcmdpbkxlZnQgPSAnMTBweCc7XHJcbiAgICAgICAgc1sxXS5saW5lSGVpZ2h0ID0gdGhpcy5oLTQ7XHJcbiAgICAgICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHNbMV0uZm9udFdlaWdodCA9ICdib2xkJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucmFkaXVzICE9PSAwICkgc1swXS5ib3JkZXJSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnOyBcclxuICAgICAgICBzWzBdLmJvcmRlciA9IHRoaXMuY29sb3JzLmdyb3VwQm9yZGVyO1xyXG5cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgaWYoIG8uYmcgIT09IHVuZGVmaW5lZCApIHRoaXMuc2V0Qkcoby5iZyk7XHJcbiAgICAgICAgaWYoIG8ub3BlbiAhPT0gdW5kZWZpbmVkICkgdGhpcy5vcGVuKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGlmKCBsLnkgPCB0aGlzLmJhc2VIICkgbmFtZSA9ICd0aXRsZSc7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIG5hbWUgPSAnY29udGVudCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJUYXJnZXQgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ID09PSAtMSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAvLyBpZighdGhpcy50YXJnZXQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnRhcmdldC51aW91dCgpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50ICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHR5cGUgPSBlLnR5cGU7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICBsZXQgdGFyZ2V0Q2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHN3aXRjaCggbmFtZSApe1xyXG5cclxuICAgICAgICAgICAgY2FzZSAnY29udGVudCc6XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgICAgICBpZiggUm9vdHMuaXNNb2JpbGUgJiYgdHlwZSA9PT0gJ21vdXNlZG93bicgKSB0aGlzLmdldE5leHQoIGUsIGNoYW5nZSApO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMudGFyZ2V0ICkgdGFyZ2V0Q2hhbmdlID0gdGhpcy50YXJnZXQuaGFuZGxlRXZlbnQoIGUgKTtcclxuXHJcbiAgICAgICAgICAgIC8vaWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5zdHlsZXMoJ2RlZicpO1xyXG5cclxuICAgICAgICAgICAgaWYoICFSb290cy5sb2NrICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0aXRsZSc6XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyApe1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLm9wZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICBpZiggdGFyZ2V0Q2hhbmdlICkgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TmV4dCAoIGUsIGNoYW5nZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5leHQgPSBSb290cy5maW5kVGFyZ2V0KCB0aGlzLnVpcywgZSApO1xyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gdGhpcy5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV4dDtcclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSAtMSApeyBcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnVpc1sgdGhpcy5jdXJyZW50IF07XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnVpb3ZlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNhbGNIICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGxuZyA9IHRoaXMudWlzLmxlbmd0aCwgaSwgdSwgIGg9MCwgcHg9MCwgdG1waD0wO1xyXG4gICAgICAgIGZvciggaSA9IDA7IGkgPCBsbmc7IGkrKyl7XHJcbiAgICAgICAgICAgIHUgPSB0aGlzLnVpc1tpXTtcclxuICAgICAgICAgICAgaWYoICF1LmF1dG9XaWR0aCApe1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHB4PT09MCkgaCArPSB1LmgrMTtcclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRtcGg8dS5oKSBoICs9IHUuaC10bXBoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdG1waCA9IHUuaDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL3RtcGggPSB0bXBoIDwgdS5oID8gdS5oIDogdG1waDtcclxuICAgICAgICAgICAgICAgIHB4ICs9IHUudztcclxuICAgICAgICAgICAgICAgIGlmKCBweCt1LncgPiB0aGlzLncgKSBweCA9IDA7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaCArPSB1LmgrMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBoO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVaXMgKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBSb290cy5jYWxjVWlzKCB0aGlzLnVpcywgdGhpcy56b25lLCB0aGlzLnpvbmUueSArIHRoaXMuYmFzZUggKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNldEJHICggYyApIHtcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmJhY2tncm91bmQgPSBjO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRCRyggYyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgYWRkICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBhcmd1bWVudHM7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgYVsxXSA9PT0gJ29iamVjdCcgKXsgXHJcbiAgICAgICAgICAgIGFbMV0uaXNVSSA9IHRoaXMuaXNVSTtcclxuICAgICAgICAgICAgYVsxXS50YXJnZXQgPSB0aGlzLmNbMl07XHJcbiAgICAgICAgICAgIGFbMV0ubWFpbiA9IHRoaXMubWFpbjtcclxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdzdHJpbmcnICl7XHJcbiAgICAgICAgICAgIGlmKCBhWzJdID09PSB1bmRlZmluZWQgKSBbXS5wdXNoLmNhbGwoYSwgeyBpc1VJOnRydWUsIHRhcmdldDp0aGlzLmNbMl0sIG1haW46dGhpcy5tYWluIH0pO1xyXG4gICAgICAgICAgICBlbHNleyBcclxuICAgICAgICAgICAgICAgIGFbMl0uaXNVSSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBhWzJdLnRhcmdldCA9IHRoaXMuY1syXTtcclxuICAgICAgICAgICAgICAgIGFbMl0ubWFpbiA9IHRoaXMubWFpbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9sZXQgbiA9IGFkZC5hcHBseSggdGhpcywgYSApO1xyXG4gICAgICAgIGxldCBuID0gdGhpcy5BREQuYXBwbHkoIHRoaXMsIGEgKTtcclxuICAgICAgICB0aGlzLnVpcy5wdXNoKCBuICk7XHJcblxyXG4gICAgICAgIGlmKCBuLmF1dG9IZWlnaHQgKSBuLnBhcmVudEdyb3VwID0gdGhpcztcclxuXHJcbiAgICAgICAgcmV0dXJuIG47XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhcmVudEhlaWdodCAoIHQgKSB7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApIHRoaXMucGFyZW50R3JvdXAuY2FsYyggdCApO1xyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBvcGVuICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIub3BlbigpO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5hcnJvd0Rvd24gKTtcclxuICAgICAgICB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgICAgICBsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCB0ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5hcnJvdyApO1xyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCAtdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbGVhciAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJHcm91cCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggLSh0aGlzLmggKzEgKSk7XHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLmNsZWFyLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJHcm91cCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uY2xlYXIoKTtcclxuICAgICAgICAgICAgdGhpcy51aXMucG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWlzID0gW107XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2FsYyAoIHkgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc09wZW4gKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCB5ICE9PSB1bmRlZmluZWQgKXsgXHJcbiAgICAgICAgICAgIHRoaXMuaCArPSB5O1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHkgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmggPSB0aGlzLmNhbGNIKCkgKyB0aGlzLmJhc2VIO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHJcbiAgICAgICAgLy9pZih0aGlzLmlzT3BlbikgdGhpcy5jYWxjVWlzKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplQ29udGVudCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnNldFNpemUoIHRoaXMudyApO1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5yU2l6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGMoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc1szXS5sZWZ0ID0gKCB0aGlzLnNhICsgdGhpcy5zYiAtIDE3ICkgKyAncHgnO1xyXG4gICAgICAgIHNbMV0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKSB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbkdyb3VwLnByb3RvdHlwZS5pc0dyb3VwID0gdHJ1ZTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZXhwb3J0IGNsYXNzIEpveXN0aWNrIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBbMCwwXTtcclxuXHJcbiAgICAgICAgdGhpcy5qb3lUeXBlID0gJ2FuYWxvZ2lxdWUnO1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBvLm1vZGUgIT09IHVuZGVmaW5lZCA/IG8ubW9kZSA6IDA7XHJcblxyXG4gICAgICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gfHwgMjtcclxuICAgICAgICB0aGlzLm11bHRpcGxpY2F0b3IgPSBvLm11bHRpcGxpY2F0b3IgfHwgMTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3MgPSBuZXcgVjIoKTtcclxuICAgICAgICB0aGlzLnRtcCA9IG5ldyBWMigpO1xyXG5cclxuICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSB0aGlzLncgKiAwLjU7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZSA9IHRoaXMucmFkaXVzKjAuMjU7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMDtcclxuICAgICAgICB0aGlzLnRvcCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgeyAvLyB3aXRoIHRpdGxlXHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmdldEpveXN0aWNrKCB0aGlzLm1vZGVsICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy53KycgJyt0aGlzLncgKTtcclxuICAgICAgICB0aGlzLnNldENzcyggdGhpcy5jWzNdLCB7IHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMudywgbGVmdDowLCB0b3A6dGhpcy50b3AgfSk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLnJhdGlvID0gMTI4L3RoaXMudztcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKGZhbHNlKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kZWw9PT0wKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICd1cmwoI2dyYWRJbiknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICcjMDAwJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYmEoMTAwLDEwMCwxMDAsMC4yNSknLCAyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYigwLDAsMCwwLjEpJywgMyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAnIzY2NicsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICdub25lJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kZWw9PT0wKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICd1cmwoI2dyYWRJbjIpJywgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiYSgwLDAsMCwwKScsIDQgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2JhKDQ4LDEzOCwyNTUsMC4yNSknLCAyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYigwLDAsMCwwLjMpJywgMyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmNvbG9ycy5zZWxlY3QsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICdyZ2JhKDQ4LDEzOCwyNTUsMC4yNSknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXRcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFkZEludGVydmFsICgpe1xyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsICE9PSBudWxsICkgdGhpcy5zdG9wSW50ZXJ2YWwoKTtcclxuICAgICAgICBpZiggdGhpcy5wb3MuaXNaZXJvKCkgKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCBmdW5jdGlvbigpeyB0aGlzLnVwZGF0ZSgpOyB9LmJpbmQodGhpcyksIDEwICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN0b3BJbnRlcnZhbCAoKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaW50ZXJ2YWwgPT09IG51bGwgKSByZXR1cm47XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCggdGhpcy5pbnRlcnZhbCApO1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkSW50ZXJ2YWwoKTtcclxuICAgICAgICB0aGlzLm1vZGUoMCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmFkZEludGVydmFsKCk7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIHRoaXMubW9kZSggMiApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMudG1wLnggPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICB0aGlzLnRtcC55ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3AgKTtcclxuXHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gdGhpcy50bXAubGVuZ3RoKCk7XHJcblxyXG4gICAgICAgIGlmICggZGlzdGFuY2UgPiB0aGlzLmRpc3RhbmNlICkge1xyXG4gICAgICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKHRoaXMudG1wLngsIHRoaXMudG1wLnkpO1xyXG4gICAgICAgICAgICB0aGlzLnRtcC54ID0gTWF0aC5zaW4oIGFuZ2xlICkgKiB0aGlzLmRpc3RhbmNlO1xyXG4gICAgICAgICAgICB0aGlzLnRtcC55ID0gTWF0aC5jb3MoIGFuZ2xlICkgKiB0aGlzLmRpc3RhbmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb3MuY29weSggdGhpcy50bXAgKS5kaXZpZGVTY2FsYXIoIHRoaXMuZGlzdGFuY2UgKS5uZWdhdGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmFsdWUgKCB2ICkge1xyXG5cclxuICAgICAgICBpZih2PT09dW5kZWZpbmVkKSB2PVswLDBdO1xyXG5cclxuICAgICAgICB0aGlzLnBvcy5zZXQoIHZbMF0gfHwgMCwgdlsxXSAgfHwgMCApO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU1ZHKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgICAgICBpZiggdXAgPT09IHVuZGVmaW5lZCApIHVwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaW50ZXJ2YWwgIT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy5sZXJwKCBudWxsLCAwLjMgKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy54ID0gTWF0aC5hYnMoIHRoaXMucG9zLnggKSA8IDAuMDEgPyAwIDogdGhpcy5wb3MueDtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zLnkgPSBNYXRoLmFicyggdGhpcy5wb3MueSApIDwgMC4wMSA/IDAgOiB0aGlzLnBvcy55O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzVUkgJiYgdGhpcy5tYWluLmlzQ2FudmFzICkgdGhpcy5tYWluLmRyYXcoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVNWRygpO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucG9zLmlzWmVybygpICkgdGhpcy5zdG9wSW50ZXJ2YWwoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU1ZHICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLnJhZGl1cyAtICggLXRoaXMucG9zLnggKiB0aGlzLmRpc3RhbmNlICk7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLnJhZGl1cyAtICggLXRoaXMucG9zLnkgKiB0aGlzLmRpc3RhbmNlICk7XHJcblxyXG4gICAgICAgICBpZih0aGlzLm1vZGVsID09PSAwKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBzeCA9IHggKyAoKHRoaXMucG9zLngpKjUpICsgNTtcclxuICAgICAgICAgICAgbGV0IHN5ID0geSArICgodGhpcy5wb3MueSkqNSkgKyAxMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHN4KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5Jywgc3kqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHgqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCB5KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCB4KnRoaXMucmF0aW8sIDQgKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCB5KnRoaXMucmF0aW8sIDQgKTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZVswXSA9ICAoIHRoaXMucG9zLnggKiB0aGlzLm11bHRpcGxpY2F0b3IgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuICAgICAgICB0aGlzLnZhbHVlWzFdID0gICggdGhpcy5wb3MueSAqIHRoaXMubXVsdGlwbGljYXRvciApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbGVhciAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zdG9wSW50ZXJ2YWwoKTtcclxuICAgICAgICBzdXBlci5jbGVhcigpO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBDaXJjdWxhciB9IGZyb20gJy4vQ2lyY3VsYXInO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZXhwb3J0IGNsYXNzIEtub2IgZXh0ZW5kcyBDaXJjdWxhciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvV2lkdGggPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMubVBJID0gTWF0aC5QSSAqIDAuODtcclxuICAgICAgICB0aGlzLnRvRGVnID0gMTgwIC8gTWF0aC5QSTtcclxuICAgICAgICB0aGlzLmNpclJhbmdlID0gdGhpcy5tUEkgKiAyO1xyXG5cclxuICAgICAgICB0aGlzLm9mZnNldCA9IG5ldyBWMigpO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHRoaXMudyAqIDAuNTsvL01hdGguZmxvb3IoKHRoaXMudy0yMCkqMC41KTtcclxuXHJcbiAgICAgICAgLy90aGlzLnd3ID0gdGhpcy5oZWlnaHQgPSB0aGlzLnJhZGl1cyAqIDI7XHJcbiAgICAgICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArIDEwO1xyXG4gICAgICAgIHRoaXMudG9wID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG5cclxuICAgICAgICBpZih0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6Jyt0aGlzLncrJ3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmdldEtub2IoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5mb250Q29sb3IsIDEgKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5mb250Q29sb3IsIDMgKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZUdyYWQoKSwgMyApO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLnd3KycgJyt0aGlzLnd3ICk7XHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLncsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNtb2RlID09PSBtb2RlICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsdGhpcy5jb2xvcnMuYnV0dG9uLCAwKTtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC4yKScsIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuY29sb3JQbHVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLHRoaXMuY29sb3JzLnNlbGVjdCwgMCk7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuNiknLCAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmNvbG9yUGx1cywgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSBtb2RlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgLy90aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBvZmYgPSB0aGlzLm9mZnNldDtcclxuXHJcbiAgICAgICAgb2ZmLnggPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICBvZmYueSA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wICk7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IC0gTWF0aC5hdGFuMiggb2ZmLngsIG9mZi55ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9sZHIgIT09IG51bGwgKSB0aGlzLnIgPSBNYXRoLmFicyh0aGlzLnIgLSB0aGlzLm9sZHIpID4gTWF0aC5QSSA/IHRoaXMub2xkciA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgdGhpcy5yID0gdGhpcy5yID4gdGhpcy5tUEkgPyB0aGlzLm1QSSA6IHRoaXMucjtcclxuICAgICAgICB0aGlzLnIgPSB0aGlzLnIgPCAtdGhpcy5tUEkgPyAtdGhpcy5tUEkgOiB0aGlzLnI7XHJcblxyXG4gICAgICAgIGxldCBzdGVwcyA9IDEgLyB0aGlzLmNpclJhbmdlO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9ICh0aGlzLnIgKyB0aGlzLm1QSSkgKiBzdGVwcztcclxuXHJcbiAgICAgICAgbGV0IG4gPSAoICggdGhpcy5yYW5nZSAqIHZhbHVlICkgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcblxyXG4gICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgIG4gPSBNYXRoLmZsb29yKCBuIC8gdGhpcy5zdGVwICk7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB0aGlzLm9sZCArICggbiAqIHRoaXMuc3RlcCApICk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5vbGRyID0gdGhpcy5yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbWFrZUdyYWQgKCkge1xyXG5cclxuICAgICAgICBsZXQgZCA9ICcnLCBzdGVwLCByYW5nZSwgYSwgeCwgeSwgeDIsIHkyLCByID0gNjQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0YW5nbGUgPSBNYXRoLlBJICsgdGhpcy5tUEk7XHJcbiAgICAgICAgbGV0IGVuZGFuZ2xlID0gTWF0aC5QSSAtIHRoaXMubVBJO1xyXG4gICAgICAgIC8vbGV0IHN0ZXAgPSB0aGlzLnN0ZXA+NSA/IHRoaXMuc3RlcCA6IDE7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuc3RlcD41KXtcclxuICAgICAgICAgICAgcmFuZ2UgPSAgdGhpcy5yYW5nZSAvIHRoaXMuc3RlcDtcclxuICAgICAgICAgICAgc3RlcCA9ICggc3RhcnRhbmdsZSAtIGVuZGFuZ2xlICkgLyByYW5nZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGVwID0gKCggc3RhcnRhbmdsZSAtIGVuZGFuZ2xlICkgLyByKSoyO1xyXG4gICAgICAgICAgICByYW5nZSA9IHIqMC41O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDw9IHJhbmdlOyArK2kgKSB7XHJcblxyXG4gICAgICAgICAgICBhID0gc3RhcnRhbmdsZSAtICggc3RlcCAqIGkgKTtcclxuICAgICAgICAgICAgeCA9IHIgKyBNYXRoLnNpbiggYSApICogKCByIC0gMjAgKTtcclxuICAgICAgICAgICAgeSA9IHIgKyBNYXRoLmNvcyggYSApICogKCByIC0gMjAgKTtcclxuICAgICAgICAgICAgeDIgPSByICsgTWF0aC5zaW4oIGEgKSAqICggciAtIDI0ICk7XHJcbiAgICAgICAgICAgIHkyID0gciArIE1hdGguY29zKCBhICkgKiAoIHIgLSAyNCApO1xyXG4gICAgICAgICAgICBkICs9ICdNJyArIHggKyAnICcgKyB5ICsgJyBMJyArIHgyICsgJyAnK3kyICsgJyAnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAodGhpcy52YWx1ZSAtIHRoaXMubWluKSAvIHRoaXMucmFuZ2U7XHJcblxyXG4gICAgICAgLy8gbGV0IHIgPSA1MDtcclxuICAgICAgIC8vIGxldCBkID0gNjQ7IFxyXG4gICAgICAgIGxldCByID0gKCAodGhpcy5wZXJjZW50ICogdGhpcy5jaXJSYW5nZSkgLSAodGhpcy5tUEkpKS8vKiB0aGlzLnRvRGVnO1xyXG5cclxuICAgICAgICBsZXQgc2luID0gTWF0aC5zaW4ocik7XHJcbiAgICAgICAgbGV0IGNvcyA9IE1hdGguY29zKHIpO1xyXG5cclxuICAgICAgICBsZXQgeDEgPSAoMjUgKiBzaW4pICsgNjQ7XHJcbiAgICAgICAgbGV0IHkxID0gLSgyNSAqIGNvcykgKyA2NDtcclxuICAgICAgICBsZXQgeDIgPSAoMjAgKiBzaW4pICsgNjQ7XHJcbiAgICAgICAgbGV0IHkyID0gLSgyMCAqIGNvcykgKyA2NDtcclxuXHJcbiAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCB4LCAxICk7XHJcbiAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCB5LCAxICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgJ00gJyArIHgxICsnICcgKyB5MSArICcgTCAnICsgeDIgKycgJyArIHkyLCAxICk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3RyYW5zZm9ybScsICdyb3RhdGUoJysgciArJyAnKzY0KycgJys2NCsnKScsIDEgKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBMaXN0IGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIC8vIGltYWdlc1xyXG4gICAgICAgIHRoaXMucGF0aCA9IG8ucGF0aCB8fCAnJztcclxuICAgICAgICB0aGlzLmZvcm1hdCA9IG8uZm9ybWF0IHx8ICcnO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VTaXplID0gby5pbWFnZVNpemUgfHwgWzIwLDIwXTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1dpdGhJbWFnZSA9IHRoaXMucGF0aCAhPT0gJycgPyB0cnVlOmZhbHNlO1xyXG4gICAgICAgIHRoaXMucHJlTG9hZENvbXBsZXRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudG1wSW1hZ2UgPSB7fTtcclxuICAgICAgICB0aGlzLnRtcFVybCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9IZWlnaHQgPSBmYWxzZTtcclxuICAgICAgICBsZXQgYWxpZ24gPSBvLmFsaWduIHx8ICdjZW50ZXInO1xyXG5cclxuICAgICAgICB0aGlzLnNNb2RlID0gMDtcclxuICAgICAgICB0aGlzLnRNb2RlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0T25seSA9IG8ubGlzdE9ubHkgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6MDsgZGlzcGxheTpub25lOycgKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOicrYWxpZ24rJzsgbGluZS1oZWlnaHQ6JysodGhpcy5oLTQpKydweDsgdG9wOjFweDsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxMHB4OyBoZWlnaHQ6MTBweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuYXJyb3csIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxlciA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncmlnaHQ6NXB4OyAgd2lkdGg6MTBweDsgYmFja2dyb3VuZDojNjY2OyBkaXNwbGF5Om5vbmU7Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3QgPSBvLmxpc3QgfHwgW107XHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnByZXZOYW1lID0gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIHRoaXMuaXRlbUhlaWdodCA9IG8uaXRlbUhlaWdodCB8fCAodGhpcy5oLTMpO1xyXG5cclxuICAgICAgICAvLyBmb3JjZSBmdWxsIGxpc3QgXHJcbiAgICAgICAgdGhpcy5mdWxsID0gby5mdWxsIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnB5ID0gMDtcclxuICAgICAgICB0aGlzLnd3ID0gdGhpcy5zYjtcclxuICAgICAgICB0aGlzLnNjcm9sbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIGxpc3QgdXAgb3IgZG93blxyXG4gICAgICAgIHRoaXMuc2lkZSA9IG8uc2lkZSB8fCAnZG93bic7XHJcbiAgICAgICAgdGhpcy51cCA9IHRoaXMuc2lkZSA9PT0gJ2Rvd24nID8gMCA6IDE7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICAvL3RoaXMuY1s1XS5zdHlsZS50b3AgPSAnYXV0byc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUuYm90dG9tID0gdGhpcy5oLTIgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUuYm90dG9tID0gJzFweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS5ib3R0b20gPSBmbHRvcCArICdweCc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5zdHlsZS50b3AgPSB0aGlzLmJhc2VIICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubGlzdEluID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdsZWZ0OjA7IHRvcDowOyB3aWR0aDoxMDAlOyBiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsMC4yKTsnKTtcclxuICAgICAgICB0aGlzLmxpc3RJbi5uYW1lID0gJ2xpc3QnO1xyXG5cclxuICAgICAgICB0aGlzLnRvcExpc3QgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY1syXS5hcHBlbmRDaGlsZCggdGhpcy5saXN0SW4gKTtcclxuICAgICAgICB0aGlzLmNbMl0uYXBwZW5kQ2hpbGQoIHRoaXMuc2Nyb2xsZXIgKTtcclxuXHJcbiAgICAgICAgaWYoIG8udmFsdWUgIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgICAgICBpZighaXNOYU4oby52YWx1ZSkpIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbIG8udmFsdWUgXTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gby52YWx1ZTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubGlzdFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNPcGVuT25TdGFydCA9IG8ub3BlbiB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubGlzdE9ubHkgKXtcclxuICAgICAgICAgICAgdGhpcy5iYXNlSCA9IDU7XHJcbiAgICAgICAgICAgIHRoaXMuY1szXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9IHRoaXMuYmFzZUgrJ3B4J1xyXG4gICAgICAgICAgICB0aGlzLmlzT3Blbk9uU3RhcnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzBdLnN0eWxlLmJhY2tncm91bmQgPSAnI0ZGMDAwMCdcclxuICAgICAgICBpZiggdGhpcy5pc1dpdGhJbWFnZSApIHRoaXMucHJlbG9hZEltYWdlKCk7XHJcbiAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBwb3B1bGF0ZSBsaXN0XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGlzdCggdGhpcy5saXN0ICk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW5PblN0YXJ0ICkgdGhpcy5vcGVuKCB0cnVlICk7XHJcbiAgICAgICAvLyB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGltYWdlIGxpc3RcclxuXHJcbiAgICBwcmVsb2FkSW1hZ2UgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnRtcEltYWdlID0ge307XHJcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPHRoaXMubGlzdC5sZW5ndGg7IGkrKyApIHRoaXMudG1wVXJsLnB1c2goIHRoaXMubGlzdFtpXSApO1xyXG4gICAgICAgIHRoaXMubG9hZE9uZSgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG5leHRJbWcgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnRtcFVybC5zaGlmdCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLnRtcFVybC5sZW5ndGggPT09IDAgKXsgXHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZEltYWdlcygpO1xyXG4gICAgICAgICAgICAvKnRoaXMuc2V0TGlzdCggdGhpcy5saXN0ICk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW5PblN0YXJ0ICkgdGhpcy5vcGVuKCk7Ki9cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgdGhpcy5sb2FkT25lKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxvYWRPbmUoKXtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRtcFVybFswXTtcclxuICAgICAgICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgaW1nLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOicrc2VsZi5pbWFnZVNpemVbMF0rJ3B4OyBoZWlnaHQ6JytzZWxmLmltYWdlU2l6ZVsxXSsncHgnO1xyXG4gICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIHRoaXMucGF0aCArIG5hbWUgKyB0aGlzLmZvcm1hdCApO1xyXG5cclxuICAgICAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbWFnZVNpemVbMl0gPSBpbWcud2lkdGg7XHJcbiAgICAgICAgICAgIHNlbGYuaW1hZ2VTaXplWzNdID0gaW1nLmhlaWdodDtcclxuICAgICAgICAgICAgc2VsZi50bXBJbWFnZVtuYW1lXSA9IGltZztcclxuICAgICAgICAgICAgc2VsZi5uZXh0SW1nKCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL1xyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICYmIHRoaXMuaXNPcGVuICl7XHJcbiAgICAgICAgICAgIGlmKCBsLnkgPiB0aGlzLmggLSB0aGlzLmJhc2VIICkgcmV0dXJuICd0aXRsZSc7XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5zY3JvbGwgJiYgKCBsLnggPiAodGhpcy5zYSt0aGlzLnNiLTIwKSkgKSByZXR1cm4gJ3Njcm9sbCc7XHJcbiAgICAgICAgICAgICAgICBpZihsLnggPiB0aGlzLnNhKSByZXR1cm4gdGhpcy50ZXN0SXRlbXMoIGwueS10aGlzLmJhc2VIICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIGwueSA8IHRoaXMuYmFzZUgrMiApIHJldHVybiAndGl0bGUnO1xyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuICl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuc2Nyb2xsICYmICggbC54ID4gKHRoaXMuc2ErdGhpcy5zYi0yMCkpICkgcmV0dXJuICdzY3JvbGwnO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGwueCA+IHRoaXMuc2EpIHJldHVybiB0aGlzLnRlc3RJdGVtcyggbC55LXRoaXMuYmFzZUggKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdEl0ZW1zICggeSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSAnJztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLml0ZW1zLmxlbmd0aCwgaXRlbSwgYSwgYjtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuICAgICAgICAgICAgYSA9IGl0ZW0ucG9zeSArIHRoaXMudG9wTGlzdDtcclxuICAgICAgICAgICAgYiA9IGl0ZW0ucG9zeSArIHRoaXMuaXRlbUhlaWdodCArIDEgKyB0aGlzLnRvcExpc3Q7XHJcbiAgICAgICAgICAgIGlmKCB5ID49IGEgJiYgeSA8PSBiICl7IFxyXG4gICAgICAgICAgICAgICAgbmFtZSA9ICdpdGVtJyArIGk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuU2VsZWN0ZWQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuYW1lO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1blNlbGVjdGVkICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuMiknO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdGVkICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmNvbG9yID0gJyNGRkYnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3Njcm9sbCcgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lID09PSAndGl0bGUnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgyKTtcclxuICAgICAgICAgICAgaWYoICF0aGlzLmxpc3RPbmx5ICl7XHJcbiAgICAgICAgICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbdGhpcy5jdXJyZW50LmlkXVxyXG4gICAgICAgICAgICAgICAgLy90aGlzLnZhbHVlID0gdGhpcy5jdXJyZW50LnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgICAgICBpZiggIXRoaXMubGlzdE9ubHkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBudXAgPSBmYWxzZTtcclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIG51cDtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0aXRsZScgKXtcclxuICAgICAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDEpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYoIG5hbWUgPT09ICdzY3JvbGwnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncy1yZXNpemUnKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDEpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZVNjcm9sbCgyKTtcclxuICAgICAgICAgICAgICAgIGxldCB0b3AgPSB0aGlzLnpvbmUueSt0aGlzLmJhc2VILTI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSggKCBlLmNsaWVudFkgLSB0b3AgICkgLSAoIHRoaXMuc2gqMC41ICkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2lmKHRoaXMuaXNEb3duKSB0aGlzLmxpc3Rtb3ZlKGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpcyBpdGVtXHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDApO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmFtZSAhPT0gdGhpcy5wcmV2TmFtZSApIG51cCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0aXRsZScgKSByZXR1cm4gZmFsc2U7IFxyXG4gICAgICAgIHRoaXMucHkgKz0gZS5kZWx0YSoxMDtcclxuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnB5KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnByZXZOYW1lID0gJyc7XHJcbiAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgdGhpcy5tb2RlVGl0bGUoMCk7XHJcbiAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDApO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vZGVTY3JvbGwgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggbW9kZSA9PT0gdGhpcy5zTW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdCAvIGRvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc01vZGUgPSBtb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIG1vZGVUaXRsZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBtb2RlID09PSB0aGlzLnRNb2RlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHNbM10uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSAnI0ZGRic7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRNb2RlID0gbW9kZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJMaXN0ICgpIHtcclxuXHJcbiAgICAgICAgd2hpbGUgKCB0aGlzLmxpc3RJbi5jaGlsZHJlbi5sZW5ndGggKSB0aGlzLmxpc3RJbi5yZW1vdmVDaGlsZCggdGhpcy5saXN0SW4ubGFzdENoaWxkICk7XHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRMaXN0ICggbGlzdCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ID0gbGlzdDtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGlzdC5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SXRlbSA9IHRoaXMuZnVsbCA/IHRoaXMubGVuZ3RoIDogNTtcclxuICAgICAgICB0aGlzLm1heEl0ZW0gPSB0aGlzLmxlbmd0aCA8IHRoaXMubWF4SXRlbSA/IHRoaXMubGVuZ3RoIDogdGhpcy5tYXhJdGVtO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlaWdodCA9IHRoaXMubWF4SXRlbSAqICh0aGlzLml0ZW1IZWlnaHQrMSkgKyAyO1xyXG5cclxuICAgICAgICB0aGlzLm1heCA9IHRoaXMubGVuZ3RoICogKHRoaXMuaXRlbUhlaWdodCsxKSArIDI7XHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IHRoaXMubWF4SGVpZ2h0IC8gdGhpcy5tYXg7XHJcbiAgICAgICAgdGhpcy5zaCA9IHRoaXMubWF4SGVpZ2h0ICogdGhpcy5yYXRpbztcclxuICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXhIZWlnaHQgLSB0aGlzLnNoO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5tYXhIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaCArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm1heCA+IHRoaXMubWF4SGVpZ2h0ICl7IFxyXG4gICAgICAgICAgICB0aGlzLnd3ID0gdGhpcy5zYiAtIDIwO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaXRlbSwgbjsvLywgbCA9IHRoaXMuc2I7XHJcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPHRoaXMubGVuZ3RoOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIG4gPSB0aGlzLmxpc3RbaV07XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLml0ZW0gKyAnd2lkdGg6Jyt0aGlzLnd3KydweDsgaGVpZ2h0OicrdGhpcy5pdGVtSGVpZ2h0KydweDsgbGluZS1oZWlnaHQ6JysodGhpcy5pdGVtSGVpZ2h0LTUpKydweDsgY29sb3I6Jyt0aGlzLmZvbnRDb2xvcisnOycgKTtcclxuICAgICAgICAgICAgaXRlbS5uYW1lID0gJ2l0ZW0nK2k7XHJcbiAgICAgICAgICAgIGl0ZW0uaWQgPSBpO1xyXG4gICAgICAgICAgICBpdGVtLnBvc3kgPSAodGhpcy5pdGVtSGVpZ2h0KzEpKmk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdEluLmFwcGVuZENoaWxkKCBpdGVtICk7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaCggaXRlbSApO1xyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5pc1dpdGhJbWFnZSApIGl0ZW0uYXBwZW5kQ2hpbGQoIHRoaXMudG1wSW1hZ2Vbbl0gKTtcclxuICAgICAgICAgICAgaWYoICF0aGlzLmlzV2l0aEltYWdlICkgaXRlbS50ZXh0Q29udGVudCA9IG47XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgYWRkSW1hZ2VzICgpe1xyXG4gICAgICAgIGxldCBsbmcgPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG4gICAgICAgIGZvciggbGV0IGk9MDsgaTxsbmc7IGkrKyApe1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmFwcGVuZENoaWxkKCB0aGlzLnRtcEltYWdlW3RoaXMubGlzdFtpXV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VG9wSXRlbSAoKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKXsgXHJcblxyXG4gICAgICAgICAgICBpZiggIXRoaXMucHJlTG9hZENvbXBsZXRlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaWYoIXRoaXMuY1szXS5jaGlsZHJlbi5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5pbWFnZVNpemVbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmltYWdlU2l6ZVsxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7IHRvcDowcHg7IGxlZnQ6MHB4OydcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzNdLmFwcGVuZENoaWxkKCB0aGlzLmNhbnZhcyApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1nID0gdGhpcy50bXBJbWFnZVsgdGhpcy52YWx1ZSBdO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoIHRoaXMudG1wSW1hZ2VbIHRoaXMudmFsdWUgXSwgMCwgMCwgdGhpcy5pbWFnZVNpemVbMl0sIHRoaXMuaW1hZ2VTaXplWzNdLCAwLDAsIHRoaXMuaW1hZ2VTaXplWzBdLCB0aGlzLmltYWdlU2l6ZVsxXSApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0gTElTVFxyXG5cclxuICAgIHVwZGF0ZSAoIHkgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5zY3JvbGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHkgPSB5IDwgMCA/IDAgOiB5O1xyXG4gICAgICAgIHkgPSB5ID4gdGhpcy5yYW5nZSA/IHRoaXMucmFuZ2UgOiB5O1xyXG5cclxuICAgICAgICB0aGlzLnRvcExpc3QgPSAtTWF0aC5mbG9vciggeSAvIHRoaXMucmF0aW8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0SW4uc3R5bGUudG9wID0gdGhpcy50b3BMaXN0KydweCc7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS50b3AgPSBNYXRoLmZsb29yKCB5ICkgICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5weSA9IHk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhcmVudEhlaWdodCAoIHQgKSB7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApIHRoaXMucGFyZW50R3JvdXAuY2FsYyggdCApO1xyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBvcGVuICggZmlyc3QgKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLm9wZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoIDAgKTtcclxuICAgICAgICB0aGlzLmggPSB0aGlzLm1heEhlaWdodCArIHRoaXMuYmFzZUggKyA1O1xyXG4gICAgICAgIGlmKCAhdGhpcy5zY3JvbGwgKXtcclxuICAgICAgICAgICAgdGhpcy50b3BMaXN0ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSCArIDUgKyB0aGlzLm1heDtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudXAgKXsgXHJcbiAgICAgICAgICAgIHRoaXMuem9uZS55IC09IHRoaXMuaCAtICh0aGlzLmJhc2VILTEwKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3dVcCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93RG93biApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yU2l6ZUNvbnRlbnQoKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgaWYoIWZpcnN0KSB0aGlzLnBhcmVudEhlaWdodCggdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgKz0gdGhpcy5oIC0gKHRoaXMuYmFzZUgtMTApO1xyXG5cclxuICAgICAgICBsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3cgKTtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCAtdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLVxyXG5cclxuICAgIHRleHQgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemVDb250ZW50ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMubGlzdEluLmNoaWxkcmVuW2ldLnN0eWxlLndpZHRoID0gdGhpcy53dyArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLnNiO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgaWYoc1syXT09PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IGQgKydweCc7XHJcblxyXG4gICAgICAgIHNbM10ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSBkICsgJ3B4JztcclxuXHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gZCArIHcgLSAxNyArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMud3cgPSB3O1xyXG4gICAgICAgIGlmKCB0aGlzLm1heCA+IHRoaXMubWF4SGVpZ2h0ICkgdGhpcy53dyA9IHctMjA7XHJcbiAgICAgICAgaWYodGhpcy5pc09wZW4pIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi4vY29yZS9Ub29scyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnVtZXJpYyBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbGx3YXkgPSBvLmFsbHdheSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IFswXTtcclxuICAgICAgICB0aGlzLm11bHR5ID0gMTtcclxuICAgICAgICB0aGlzLmludm11bHR5ID0gMTtcclxuICAgICAgICB0aGlzLmlzU2luZ2xlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzQW5nbGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmVjdG9yID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBvLmlzQW5nbGUgKXtcclxuICAgICAgICAgICAgdGhpcy5pc0FuZ2xlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5tdWx0eSA9IFRvb2xzLnRvcmFkO1xyXG4gICAgICAgICAgICB0aGlzLmludm11bHR5ID0gVG9vbHMudG9kZWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzRHJhZyA9IG8uZHJhZyB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIG8udmFsdWUgIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgICAgICBpZighaXNOYU4oby52YWx1ZSkpeyBcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbby52YWx1ZV07XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiggby52YWx1ZSBpbnN0YW5jZW9mIEFycmF5ICl7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWU7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NpbmdsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIG8udmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gW107XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS54ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzBdID0gby52YWx1ZS54O1xyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUueSAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsxXSA9IG8udmFsdWUueTtcclxuICAgICAgICAgICAgICAgIGlmKCBvLnZhbHVlLnogIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMl0gPSBvLnZhbHVlLno7XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS53ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzNdID0gby52YWx1ZS53O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1ZlY3RvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2luZ2xlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy50bXAgPSBbXTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgIHRoaXMucHJldiA9IHsgeDowLCB5OjAsIGQ6MCwgdjowIH07XHJcblxyXG4gICAgICAgIC8vIGJnXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcnMuc2VsZWN0ICsgJzsgdG9wOjRweDsgd2lkdGg6MHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7JyApO1xyXG5cclxuICAgICAgICB0aGlzLmNNb2RlID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5pc0FuZ2xlKSB0aGlzLnZhbHVlW2ldID0gKHRoaXMudmFsdWVbaV0gKiAxODAgLyBNYXRoLlBJKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApO1xyXG4gICAgICAgICAgICB0aGlzLmNbMytpXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJyBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsgYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcnMuaW5wdXRCZyArICc7IGJvcmRlckNvbG9yOicgKyB0aGlzLmNvbG9ycy5pbnB1dEJvcmRlcisnOyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycpO1xyXG4gICAgICAgICAgICBpZihvLmNlbnRlcikgdGhpcy5jWzIraV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVtpXTtcclxuICAgICAgICAgICAgdGhpcy5jWzMraV0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5jWzMraV0uaXNOdW0gPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY3Vyc29yXHJcbiAgICAgICAgdGhpcy5jdXJzb3JJZCA9IDMgKyB0aGlzLmxuZztcclxuICAgICAgICB0aGlzLmNbIHRoaXMuY3Vyc29ySWQgXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjRweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OyB3aWR0aDowcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmZvbnRDb2xvcisnOycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgdCA9IHRoaXMudG1wO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgIC8qIG1vZGU6IGZ1bmN0aW9uICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgaWYoIG4gPT09IHRoaXMuY01vZGVbbmFtZV0gKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vbGV0IG07XHJcblxyXG4gICAgICAgIC8qc3dpdGNoKG4pe1xyXG5cclxuICAgICAgICAgICAgY2FzZSAwOiBtID0gdGhpcy5jb2xvcnMuYm9yZGVyOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiBtID0gdGhpcy5jb2xvcnMuYm9yZGVyT3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogbSA9IHRoaXMuY29sb3JzLmJvcmRlclNlbGVjdDsgIGJyZWFrO1xyXG5cclxuICAgICAgICB9Ki9cclxuXHJcbiAgIC8qICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgLy90aGlzLmNbbmFtZSsyXS5zdHlsZS5ib3JkZXJDb2xvciA9IG07XHJcbiAgICAgICAgdGhpcy5jTW9kZVtuYW1lXSA9IG47XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYoIG5hbWUgIT09ICcnICl7IFxyXG4gICAgICAgICAgICBcdHRoaXMuY3VycmVudCA9IG5hbWU7XHJcbiAgICAgICAgICAgIFx0dGhpcy5wcmV2ID0geyB4OmUuY2xpZW50WCwgeTplLmNsaWVudFksIGQ6MCwgdjogdGhpcy5pc1NpbmdsZSA/IHBhcnNlRmxvYXQodGhpcy52YWx1ZSkgOiBwYXJzZUZsb2F0KCB0aGlzLnZhbHVlWyB0aGlzLmN1cnJlbnQgXSApICB9O1xyXG4gICAgICAgICAgICBcdHRoaXMuc2V0SW5wdXQoIHRoaXMuY1sgMyArIHRoaXMuY3VycmVudCBdICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLypcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICcnICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmFtZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMucHJldiA9IHsgeDplLmNsaWVudFgsIHk6ZS5jbGllbnRZLCBkOjAsIHY6IHRoaXMuaXNTaW5nbGUgPyBwYXJzZUZsb2F0KHRoaXMudmFsdWUpIDogcGFyc2VGbG9hdCggdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gKSAgfTtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoIDIsIG5hbWUgKTsqL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICBcdGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5wcmV2ID0geyB4OjAsIHk6MCwgZDowLCB2OjAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAvKmxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICl7IFxyXG5cclxuICAgICAgICAgICAgLy9sZXQgdG0gPSB0aGlzLmN1cnJlbnQ7XHJcbiAgICAgICAgICAgIGxldCB0ZCA9IHRoaXMucHJldi5kO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMucHJldiA9IHsgeDowLCB5OjAsIGQ6MCwgdjowIH07XHJcblxyXG4gICAgICAgICAgICBpZiggIXRkICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRJbnB1dCggdGhpcy5jWyAzICsgbmFtZSBdICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsvL3RoaXMubW9kZSggMiwgbmFtZSApO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc2V0KCk7Ly90aGlzLm1vZGUoIDAsIHRtICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBudXAgPSBmYWxzZTtcclxuICAgICAgICBsZXQgeCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJycgKSB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIGVsc2V7IFxyXG4gICAgICAgIFx0aWYoIXRoaXMuaXNEcmFnKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIFx0ZWxzZSB0aGlzLmN1cnNvciggdGhpcy5jdXJyZW50ICE9PSAtMSA/ICdtb3ZlJyA6ICdwb2ludGVyJyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRHJhZyApe1xyXG5cclxuICAgICAgICBcdGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICl7XHJcblxyXG4gICAgICAgICAgICBcdHRoaXMucHJldi5kICs9ICggZS5jbGllbnRYIC0gdGhpcy5wcmV2LnggKSAtICggZS5jbGllbnRZIC0gdGhpcy5wcmV2LnkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbiA9IHRoaXMucHJldi52ICsgKCB0aGlzLnByZXYuZCAqIHRoaXMuc3RlcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gPSB0aGlzLm51bVZhbHVlKG4pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWyAzICsgdGhpcy5jdXJyZW50IF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW3RoaXMuY3VycmVudF07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucHJldi54ID0gZS5jbGllbnRYO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2LnkgPSBlLmNsaWVudFk7XHJcblxyXG4gICAgICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgXHRpZiggdGhpcy5pc0Rvd24gKSB4ID0gZS5jbGllbnRYIC0gdGhpcy56b25lLnggLTM7XHJcbiAgICAgICAgXHRpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApIHggLT0gdGhpcy50bXBbdGhpcy5jdXJyZW50XVswXVxyXG4gICAgICAgIFx0cmV0dXJuIHRoaXMudXBJbnB1dCggeCwgdGhpcy5pc0Rvd24gKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8va2V5ZG93bjogZnVuY3Rpb24gKCBlICkgeyByZXR1cm4gdHJ1ZTsgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgLy90aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL3RoaXMuY3VycmVudCA9IDA7XHJcblxyXG4gICAgICAgLyogbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICAgICAgaWYodGhpcy5jTW9kZVtpXSE9PTApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuY1syK2ldLnN0eWxlLmJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9yZGVyO1xyXG4gICAgICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgc2V0VmFsdWUgKCB2ICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1ZlY3RvciApe1xyXG5cclxuICAgICAgICAgICAgaWYoIHYueCAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVswXSA9IHYueDtcclxuICAgICAgICAgICAgaWYoIHYueSAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsxXSA9IHYueTtcclxuICAgICAgICAgICAgaWYoIHYueiAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsyXSA9IHYuejtcclxuICAgICAgICAgICAgaWYoIHYudyAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVszXSA9IHYudztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAvL2xldCBpID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8qbiA9IG4gfHwgMDtcclxuICAgICAgICB0aGlzLnZhbHVlW25dID0gdGhpcy5udW1WYWx1ZSggdiApO1xyXG4gICAgICAgIHRoaXMuY1sgMyArIG4gXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbbl07Ki9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2FtZVN0ciAoIHN0ciApe1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gc3RyO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnZhbHVlLmxlbmd0aDtcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgIHRoaXMudmFsdWVbaV0gPSB0aGlzLm51bVZhbHVlKCB0aGlzLnZhbHVlW2ldICogdGhpcy5pbnZtdWx0eSApO1xyXG4gICAgICAgICAgICAgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVtpXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZW5kICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rICE9PSBudWxsICl7IFxyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNWZWN0b3IgKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0uZnJvbUFycmF5KCB2ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLyp0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0ueCA9IHZbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0ueSA9IHZbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0ueiA9IHZbMl07XHJcbiAgICAgICAgICAgICAgICBpZiggdlszXSApIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXS53ID0gdlszXTsqL1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSA9IHY7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2soIHYsIHRoaXMudmFsICk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElOUFVUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2VsZWN0ICggYywgZSwgdyApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLmN1cnJlbnQgIT09IC0xID8gdGhpcy50bXBbdGhpcy5jdXJyZW50XVswXSArIDUgOiAwO1xyXG4gICAgICAgIHNbdGhpcy5jdXJzb3JJZF0ud2lkdGggPSAnMXB4JztcclxuICAgICAgICBzW3RoaXMuY3Vyc29ySWRdLmxlZnQgPSAoIGQgKyBjICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICggZCArIGUgKSArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgdW5zZWxlY3QgKCkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBpZighcykgcmV0dXJuO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAwICsgJ3B4JztcclxuICAgICAgICBzW3RoaXMuY3Vyc29ySWRdLndpZHRoID0gMCArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGxldCBhciA9IFtdO1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmFsbHdheSApIGZvcmNlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICBcdGlmKCFpc05hTiggdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ICkpeyBcclxuICAgICAgICAgICAgICAgIGxldCBueCA9IHRoaXMubnVtVmFsdWUoIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gbng7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlW2ldID0gbng7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIG5vdCBudW1iZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbaV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgXHRhcltpXSA9IHRoaXMudmFsdWVbaV0gKiB0aGlzLm11bHR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoICFmb3JjZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTaW5nbGUgKSB0aGlzLnNlbmQoIGFyWzBdICk7XHJcbiAgICAgICAgZWxzZSB0aGlzLnNlbmQoIGFyICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVaSVNFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgdyA9IE1hdGguZmxvb3IoICggdGhpcy5zYiArIDUgKSAvIHRoaXMubG5nICktNTtcclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldID0gWyBNYXRoLmZsb29yKCB0aGlzLnNhICsgKCB3ICogaSApKyggNSAqIGkgKSksIHcgXTtcclxuICAgICAgICAgICAgdGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG4gICAgICAgICAgICBzWyAzICsgaSBdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCc7XHJcbiAgICAgICAgICAgIHNbIDMgKyBpIF0ud2lkdGggPSB0aGlzLnRtcFtpXVsxXSArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBTbGlkZSBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMubW9kZWwgPSBvLnN0eXBlIHx8IDA7XHJcbiAgICAgICAgaWYoIG8ubW9kZSAhPT0gdW5kZWZpbmVkICkgdGhpcy5tb2RlbCA9IG8ubW9kZTtcclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLmRlZmF1bHRCb3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmhpZGU7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc092ZXIgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRGVnID0gby5pc0RlZyB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5maXJzdEltcHV0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnbGV0dGVyLXNwYWNpbmc6LTFweDsgdGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgYm9yZGVyOjFweCBkYXNoZWQgJyt0aGlzLmRlZmF1bHRCb3JkZXJDb2xvcisnOyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAndGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgYm9yZGVyOjFweCBkYXNoZWQgJyt0aGlzLmRlZmF1bHRCb3JkZXJDb2xvcisnOyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2JvcmRlcjpub25lOyB3aWR0aDo0N3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnbGV0dGVyLXNwYWNpbmc6LTFweDsgdGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJyB0b3A6MDsgaGVpZ2h0OicrdGhpcy5oKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcnMuc2Nyb2xsYmFjaysnOyB0b3A6MnB4OyBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzVdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdsZWZ0OjRweDsgdG9wOjVweDsgaGVpZ2h0OicrKHRoaXMuaC0xMCkrJ3B4OyBiYWNrZ3JvdW5kOicgKyB0aGlzLmZvbnRDb2xvciArJzsnICk7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS5pc051bSA9IHRydWU7XHJcbiAgICAgICAgLy90aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gKHRoaXMuaC00KSArICdweCc7XHJcbiAgICAgICAgLy90aGlzLmNbMl0uc3R5bGUubGluZUhlaWdodCA9ICh0aGlzLmgtOCkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1syXS5zdHlsZS5oZWlnaHQgPSAodGhpcy5oLTIpICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUubGluZUhlaWdodCA9ICh0aGlzLmgtMTApICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYodGhpcy5tb2RlbCAhPT0gMCl7XHJcblxyXG4gICAgICAgICAgICBsZXQgaDEgPSA0LCBoMiA9IDgsIHd3ID0gdGhpcy5oLTQsIHJhID0gMjA7XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5tb2RlbCA9PT0gMiApe1xyXG4gICAgICAgICAgICAgICAgaDEgPSA0Oy8vMlxyXG4gICAgICAgICAgICAgICAgaDIgPSA4O1xyXG4gICAgICAgICAgICAgICAgcmEgPSAyO1xyXG4gICAgICAgICAgICAgICAgd3cgPSAodGhpcy5oLTQpKjAuNVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLm1vZGVsID09PSAzKSB0aGlzLmNbNV0uc3R5bGUudmlzaWJsZSA9ICdub25lJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS5ib3JkZXJSYWRpdXMgPSBoMSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS5oZWlnaHQgPSBoMiArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS50b3AgPSAodGhpcy5oKjAuNSkgLSBoMSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s1XS5zdHlsZS5ib3JkZXJSYWRpdXMgPSAoaDEqMC41KSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s1XS5zdHlsZS5oZWlnaHQgPSBoMSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s1XS5zdHlsZS50b3AgPSAodGhpcy5oKjAuNSktKGgxKjAuNSkgKyAncHgnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzZdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdib3JkZXItcmFkaXVzOicrcmErJ3B4OyBtYXJnaW4tbGVmdDonKygtd3cqMC41KSsncHg7IGJvcmRlcjoxcHggc29saWQgJyt0aGlzLmNvbG9ycy5ib3JkZXIrJzsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsgbGVmdDo0cHg7IHRvcDoycHg7IGhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OyB3aWR0aDonK3d3KydweDsnICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuICAgICAgICBcclxuICAgICAgICBpZiggbC54ID49IHRoaXMudHhsICkgcmV0dXJuICd0ZXh0JztcclxuICAgICAgICBlbHNlIGlmKCBsLnggPj0gdGhpcy5zYSApIHJldHVybiAnc2Nyb2xsJztcclxuICAgICAgICBlbHNlIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKSB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApeyBcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyppZiggbmFtZSA9PT0gJ3RleHQnICl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1syXSwgZnVuY3Rpb24oKXsgdGhpcy52YWxpZGF0ZSgpIH0uYmluZCh0aGlzKSApO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG51cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdzY3JvbGwnICkge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGUoMSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCd3LXJlc2l6ZScpO1xyXG4gICAgICAgIC8vfSBlbHNlIGlmKG5hbWUgPT09ICd0ZXh0Jyl7IFxyXG4gICAgICAgICAgICAvL3RoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG5cclxuICAgICAgICAgICAgbGV0IG4gPSAoKCggZS5jbGllbnRYIC0gKHRoaXMuem9uZS54K3RoaXMuc2EpIC0gMyApIC8gdGhpcy53dyApICogdGhpcy5yYW5nZSArIHRoaXMubWluICkgLSB0aGlzLm9sZDtcclxuICAgICAgICAgICAgaWYobiA+PSB0aGlzLnN0ZXAgfHwgbiA8PSB0aGlzLnN0ZXApeyBcclxuICAgICAgICAgICAgICAgIG4gPSBNYXRoLmZsb29yKCBuIC8gdGhpcy5zdGVwICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBudXAgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9rZXlkb3duOiBmdW5jdGlvbiAoIGUgKSB7IHJldHVybiB0cnVlOyB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB2YWxpZGF0ZSAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG4gPSB0aGlzLmNbMl0udGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIGlmKCFpc05hTiggbiApKXsgXHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCBuICk7IFxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbHNlIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWUgKyAodGhpcy5pc0RlZyA/ICfCsCc6JycpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICAvL3RoaXMuY2xlYXJJbnB1dCgpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgIC8vIHNbMl0uYm9yZGVyID0gJzFweCBzb2xpZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICAgICAgICAgIHNbMl0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbGJhY2s7XHJcbiAgICAgICAgICAgICAgICBzWzVdLmJhY2tncm91bmQgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gc2Nyb2xsIG92ZXJcclxuICAgICAgICAgICAgICAgIC8vc1syXS5ib3JkZXIgPSAnMXB4IGRhc2hlZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICAgICAgICAgIHNbMl0uY29sb3IgPSB0aGlzLmNvbG9yUGx1cztcclxuICAgICAgICAgICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbGJhY2tvdmVyO1xyXG4gICAgICAgICAgICAgICAgc1s1XS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvclBsdXM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgIC8qIGNhc2UgMjogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggc29saWQgJyArIHRoaXMuY29sb3JzLmJvcmRlclNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggZGFzaGVkICcgKyB0aGlzLmZvbnRDb2xvcjsvL3RoaXMuY29sb3JzLmJvcmRlclNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggZGFzaGVkICcgKyB0aGlzLmNvbG9ycy5oaWRlO1xyXG4gICAgICAgICAgICBicmVhazsqL1xyXG5cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgICAgICBsZXQgd3cgPSBNYXRoLmZsb29yKCB0aGlzLnd3ICogKCggdGhpcy52YWx1ZSAtIHRoaXMubWluICkgLyB0aGlzLnJhbmdlICkpO1xyXG4gICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5tb2RlbCAhPT0gMykgdGhpcy5zWzVdLndpZHRoID0gd3cgKyAncHgnO1xyXG4gICAgICAgIGlmKHRoaXMuc1s2XSkgdGhpcy5zWzZdLmxlZnQgPSAoIHRoaXMuc2EgKyB3dyArIDMgKSArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZSArICh0aGlzLmlzRGVnID8gJ8KwJzonJyk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCB3ID0gdGhpcy5zYiAtIHRoaXMuc2M7XHJcbiAgICAgICAgdGhpcy53dyA9IHcgLSA2O1xyXG5cclxuICAgICAgICBsZXQgdHggPSB0aGlzLnNjO1xyXG4gICAgICAgIGlmKHRoaXMuaXNVSSB8fCAhdGhpcy5zaW1wbGUpIHR4ID0gdGhpcy5zYysxMDtcclxuICAgICAgICB0aGlzLnR4bCA9IHRoaXMudyAtIHR4ICsgMjtcclxuXHJcbiAgICAgICAgLy9sZXQgdHkgPSBNYXRoLmZsb29yKHRoaXMuaCAqIDAuNSkgLSA4O1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc1syXS53aWR0aCA9ICh0aGlzLnNjIC02ICkrICdweCc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gKHRoaXMudHhsICs0KSArICdweCc7XHJcbiAgICAgICAgLy9zWzJdLnRvcCA9IHR5ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzNdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbNV0ubGVmdCA9ICh0aGlzLnNhICsgMykgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRleHRJbnB1dCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgJyc7XHJcbiAgICAgICAgdGhpcy5wbGFjZUhvbGRlciA9IG8ucGxhY2VIb2xkZXIgfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMuYWxsd2F5ID0gby5hbGx3YXkgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lZGl0YWJsZSA9IG8uZWRpdCAhPT0gdW5kZWZpbmVkID8gby5lZGl0IDogdHJ1ZTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIGJnXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcnMuc2VsZWN0ICsgJzsgdG9wOjRweDsgd2lkdGg6MHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7JyApO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdoZWlnaHQ6JyArICh0aGlzLmgtNCkgKyAncHg7IGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLmlucHV0QmcgKyAnOyBib3JkZXJDb2xvcjonICsgdGhpcy5jb2xvcnMuaW5wdXRCb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gY3Vyc29yXHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6NHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7IHdpZHRoOjBweDsgYmFja2dyb3VuZDonK3RoaXMuZm9udENvbG9yKyc7JyApO1xyXG5cclxuICAgICAgICAvLyBmYWtlXHJcbiAgICAgICAgdGhpcy5jWzVdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZm9udC1zdHlsZTogaXRhbGljOyBjb2xvcjonK3RoaXMuY29sb3JzLmlucHV0SG9sZGVyKyc7JyApO1xyXG4gICAgICAgIGlmKCB0aGlzLnZhbHVlID09PSAnJyApIHRoaXMuY1s1XS50ZXh0Q29udGVudCA9IHRoaXMucGxhY2VIb2xkZXI7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuICAgICAgICBpZiggbC54ID49IHRoaXMuc2EgKSByZXR1cm4gJ3RleHQnO1xyXG4gICAgICAgIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZWRpdGFibGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZighdGhpcy5lZGl0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKCBuYW1lID09PSAndGV4dCcgKSB0aGlzLnNldElucHV0KCB0aGlzLmNbM10gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmVkaXRhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICAvL2xldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICAvL2lmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKXsgcmV0dXJuO31cclxuXHJcbiAgICAgICAgLy9pZiggbC54ID49IHRoaXMuc2EgKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIC8vZWxzZSB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICBsZXQgeCA9IDA7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGV4dCcgKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgeCA9IGUuY2xpZW50WCAtIHRoaXMuem9uZS54O1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy51cElucHV0KCB4IC0gdGhpcy5zYSAtMywgdGhpcy5pc0Rvd24gKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlbmRlciAoIGMsIGUsIHMgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS53aWR0aCA9ICcxcHgnO1xyXG4gICAgICAgIHRoaXMuc1s0XS5sZWZ0ID0gKHRoaXMuc2EgKyBjKzUpICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5zWzJdLmxlZnQgPSAodGhpcy5zYSArIGUrNSkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS53aWR0aCA9IHMrJ3B4JztcclxuICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3QgKCBjLCBlLCB3ICkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgZCA9IHRoaXMuc2EgKyA1O1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSAnMXB4JztcclxuICAgICAgICBzWzRdLmxlZnQgPSAoIGQgKyBjICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICggZCArIGUgKSArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgdW5zZWxlY3QgKCkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBpZighcykgcmV0dXJuO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAwICsgJ3B4JztcclxuICAgICAgICBzWzRdLndpZHRoID0gMCArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmFsbHdheSApIGZvcmNlID0gdHJ1ZTsgXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmNbM10udGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIGlmKHRoaXMudmFsdWUgIT09ICcnKSB0aGlzLmNbNV0udGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICBlbHNlIHRoaXMuY1s1XS50ZXh0Q29udGVudCA9IHRoaXMucGxhY2VIb2xkZXI7XHJcblxyXG4gICAgICAgIGlmKCAhZm9yY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFWklTRVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG5cclxuICAgICAgICBzWzVdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzVdLndpZHRoID0gdGhpcy5zYiArICdweCc7XHJcbiAgICAgXHJcbiAgICB9XHJcblxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRpdGxlIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIGxldCBwcmVmaXggPSBvLnByZWZpeCB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NjBweDsgbGluZS1oZWlnaHQ6JysgKHRoaXMuaC04KSArICdweDsgY29sb3I6JyArIHRoaXMuZm9udENvbG9yICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmggPT09IDMxICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5zWzFdLnRvcCA9IDggKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gOCArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy50eHQuc3Vic3RyaW5nKDAsMSkudG9VcHBlckNhc2UoKSArIHRoaXMudHh0LnN1YnN0cmluZygxKS5yZXBsYWNlKFwiLVwiLCBcIiBcIik7XHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gcHJlZml4O1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGV4dCAoIHR4dCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdHh0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0MiAoIHR4dCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdHh0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcbiAgICAgICAgdGhpcy5zWzFdLndpZHRoID0gdGhpcy53IC0gNTAgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5sZWZ0ID0gdGhpcy53IC0gKCA1MCArIDI2ICkgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlbGVjdCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkFjdGlmID0gby5vbkFjdGlmIHx8IGZ1bmN0aW9uKCl7fTtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuICAgICAgICB0aGlzLmJ1dHRvbk92ZXIgPSBvLmJPdmVyIHx8IHRoaXMuY29sb3JzLm92ZXI7XHJcbiAgICAgICAgdGhpcy5idXR0b25Eb3duID0gby5iRG93biB8fCB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgdGhpcy5idXR0b25BY3Rpb24gPSBvLmJBY3Rpb24gfHwgdGhpcy5jb2xvcnMuYWN0aW9uO1xyXG5cclxuICAgICAgICBsZXQgcHJlZml4ID0gby5wcmVmaXggfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MuYnV0dG9uICsgJyB0b3A6MXB4OyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOicrdGhpcy5jb2xvcnMuYnV0dG9uQm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6MTVweDsgd2lkdGg6MzBweDsgbGVmdDoxMHB4OycgKTtcclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9ycy5pbnB1dEJnICsgJzsgYm9yZGVyQ29sb3I6JyArIHRoaXMuY29sb3JzLmlucHV0Qm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNztcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTRweDsgaGVpZ2h0OjE0cHg7IGxlZnQ6NXB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Znc1sgJ2N1cnNvcicgXSwgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXQgPSAxO1xyXG4gICAgICAgIHRoaXMuaXNBY3RpZiA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuICAgICAgICBpZiggbC54ID4gdGhpcy5zYSAmJiBsLnggPCB0aGlzLnNhKzMwICkgcmV0dXJuICdvdmVyJztcclxuICAgICAgICByZXR1cm4gJzAnXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcbiAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgLy90aGlzLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgLy90aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbIG5hbWUtMiBdO1xyXG4gICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICAvL2xldCBzZWwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2cobmFtZSlcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdvdmVyJyApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMubW9kZSggdGhpcy5pc0Rvd24gPyAzIDogMiApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYXBwbHkgKCB2ICkge1xyXG5cclxuICAgICAgICB2ID0gdiB8fCAnJztcclxuXHJcbiAgICAgICAgaWYoIHYgIT09IHRoaXMudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2O1xyXG4gICAgICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCkge1xyXG5cclxuICAgICAgICB0aGlzLm1vZGUoIDMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4gKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdCAhPT0gbiApe1xyXG5cclxuICAgICAgICAgICAgaWYoIG49PT0xICkgdGhpcy5pc0FjdGlmID0gZmFsc2U7O1xyXG5cclxuICAgICAgICAgICAgaWYoIG49PT0zICl7IFxyXG4gICAgICAgICAgICAgICAgaWYoICF0aGlzLmlzQWN0aWYgKXsgdGhpcy5pc0FjdGlmID0gdHJ1ZTsgbj00OyB0aGlzLm9uQWN0aWYoIHRoaXMgKTsgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7IHRoaXMuaXNBY3RpZiA9IGZhbHNlOyB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCBuPT09MiAmJiB0aGlzLmlzQWN0aWYgKSBuID0gNDtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0ID0gMTsgdGhpcy5zWyAyIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgIHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yOyBicmVhazsgLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXQgPSAyOyB0aGlzLnNbIDIgXS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uT3ZlcjsgYnJlYWs7IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0ID0gMzsgdGhpcy5zWyAyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkRvd247IGJyZWFrOyAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHRoaXMuc3RhdCA9IDQ7IHRoaXMuc1sgMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIDIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25BY3Rpb247IGJyZWFrOyAvLyBhY3RpZlxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKCB0aGlzLmlzQWN0aWYgPyA0IDogMSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0ICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gKHRoaXMuc2EgKyA0MCkgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSAodGhpcy5zYiAtIDQwKSArICdweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gKHRoaXMuc2ErOCkgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlbGVjdG9yIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gby52YWx1ZXM7XHJcbiAgICAgICAgaWYodHlwZW9mIHRoaXMudmFsdWVzID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWVzID0gWyB0aGlzLnZhbHVlcyBdO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCB0aGlzLnZhbHVlc1swXTtcclxuXHJcblxyXG5cclxuICAgICAgICAvL3RoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcbiAgICAgICAgdGhpcy5idXR0b25PdmVyID0gby5iT3ZlciB8fCB0aGlzLmNvbG9ycy5vdmVyO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uRG93biA9IG8uYkRvd24gfHwgdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG5cclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWVzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLnRtcCA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3RhdCA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgc2VsO1xyXG5cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyl7XHJcblxyXG4gICAgICAgICAgICBzZWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzW2ldID09PSB0aGlzLnZhbHVlICkgc2VsID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAnIHRvcDoxcHg7IGJhY2tncm91bmQ6Jysoc2VsPyB0aGlzLmJ1dHRvbkRvd24gOiB0aGlzLmJ1dHRvbkNvbG9yKSsnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOicrdGhpcy5jb2xvcnMuYnV0dG9uQm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5zdHlsZS5jb2xvciA9IHNlbCA/IHRoaXMuZm9udFNlbGVjdCA6IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5pbm5lckhUTUwgPSB0aGlzLnZhbHVlc1tpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdFtpXSA9IHNlbCA/IDM6MTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgXHRpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaSsyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcbiAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgLy90aGlzLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgIFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbIG5hbWUtMiBdO1xyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgXHRyZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuIFxyXG4gICAgICAgIC8vIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICAvL2xldCBzZWwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2cobmFtZSlcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgIT09ICcnICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgbmFtZSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHR1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGVzICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PT0gbmFtZS0yICYmIHRoaXMudmFsdWVzWyBpIF0gIT09IHRoaXMudmFsdWUgKSB2ID0gdGhpcy5tb2RlKCBuLCBpKzIgKTtcclxuICAgICAgICAgICAgZWxzZXsgXHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzWyBpIF0gPT09IHRoaXMudmFsdWUgKSB2ID0gdGhpcy5tb2RlKCAzLCBpKzIgKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBuYW1lIC0gMjtcclxuXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXRbaV0gIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0W2ldID0gMTsgdGhpcy5zWyBpKzIgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyAgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdFtpXSA9IDI7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uT3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdFtpXSA9IDM7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uRG93bjsgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIGxldCB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzWyBpIF0gPT09IHRoaXMudmFsdWUgKSB2ID0gdGhpcy5tb2RlKCAzLCBpKzIgKTtcclxuICAgICAgICAgICAgZWxzZSB2ID0gdGhpcy5tb2RlKCAxLCBpKzIgKTtcclxuICAgICAgICAgICAgaWYodikgciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcjsvL3RoaXMubW9kZXMoIDEgLCAyICk7XHJcblxyXG4gICAgXHQvKmlmKCB0aGlzLnNlbGVjdGVkICl7XHJcbiAgICBcdFx0dGhpcy5zWyB0aGlzLnNlbGVjdGVkIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5zWyB0aGlzLnNlbGVjdGVkIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBcdH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7Ki9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGFiZWwgKCBzdHJpbmcsIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5jW25dLnRleHRDb250ZW50ID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpY29uICggc3RyaW5nLCB5LCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuc1tuXS5wYWRkaW5nID0gKCB5IHx8IDAgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5jW25dLmlubmVySFRNTCA9IHN0cmluZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpOztcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLnNiO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgZGMgPSAgMztcclxuICAgICAgICBsZXQgc2l6ZSA9IE1hdGguZmxvb3IoICggdy0oZGMqKGktMSkpICkgLyBpICk7XHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcblxyXG4gICAgICAgIFx0dGhpcy50bXBbaV0gPSBbIE1hdGguZmxvb3IoIGQgKyAoIHNpemUgKiBpICkgKyAoIGRjICogaSApKSwgc2l6ZSBdO1xyXG4gICAgICAgIFx0dGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG4gICAgICAgICAgICBzW2krMl0ubGVmdCA9IHRoaXMudG1wW2ldWzBdICsgJ3B4JztcclxuICAgICAgICAgICAgc1tpKzJdLndpZHRoID0gdGhpcy50bXBbaV1bMV0gKyAncHgnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgRW1wdHkgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcblx0ICAgIG8uc2ltcGxlID0gdHJ1ZTtcclxuXHQgICAgby5pc0VtcHR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcbiAgICBcclxufVxyXG4iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEl0ZW0gZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5wID0gMTAwO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnR4dDtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMuaXR5cGUgPSBvLml0eXBlIHx8ICdub25lJztcclxuICAgICAgICB0aGlzLnZhbCA9IHRoaXMuaXR5cGU7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JhcGggPSB0aGlzLnN2Z3NbIHRoaXMuaXR5cGUgXTtcclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS03O1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTRweDsgaGVpZ2h0OjE0cHg7IGxlZnQ6NXB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuZ3JhcGgsIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzFdLm1hcmdpbkxlZnQgPSAyMCArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG4gICAgICAgIC8vdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBuYW1lICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4ucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQoIHRydWUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW91dCAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDMpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW92ZXIgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSg0KTtcclxuICAgICAgICBlbHNlIHRoaXMubW9kZSgyKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICgpIHtcclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgLypyU2l6ZSAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICB9Ki9cclxuXHJcbiAgICBtb2RlICggbiApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0dXMgIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gbjtcclxuICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnN0YXR1cyA9IDE7IHRoaXMuc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyB0aGlzLnNbMF0uYmFja2dyb3VuZCA9ICdub25lJzsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdHVzID0gMjsgdGhpcy5zWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7IHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5iZ092ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXR1cyA9IDM7IHRoaXMuc1sxXS5jb2xvciA9ICcjRkZGJzsgICAgICAgICB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHRoaXMuc3RhdHVzID0gNDsgdGhpcy5zWzFdLmNvbG9yID0gJyNGRkYnOyAgICAgICAgIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuZG93bjsgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgIC8vIHJldHVybiB0aGlzLm1vZGUoIDEgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0ZWQgKCBiICl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VsZWN0ID0gYiB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMyk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gby52YWx1ZXMgfHwgW107XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgdGhpcy52YWx1ZXMgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZXMgPSBbIHRoaXMudmFsdWVzIF07XHJcblxyXG4gICAgICAgIC8vdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuICAgICAgICB0aGlzLmJ1dHRvbk92ZXIgPSBvLmJPdmVyIHx8IHRoaXMuY29sb3JzLm92ZXI7XHJcbiAgICAgICAgdGhpcy5idXR0b25Eb3duID0gby5iRG93biB8fCB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcblxyXG4gICAgICAgIHRoaXMuc3BhY2VzID0gby5zcGFjZXMgfHwgWzEwLDNdO1xyXG4gICAgICAgIHRoaXMuYnNpemUgPSBvLmJzaXplIHx8IFs5MCwyMF07XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlcy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy50bXAgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXQgPSBbXTtcclxuICAgICAgICB0aGlzLmdyaWQgPSBbMiwgTWF0aC5yb3VuZCggdGhpcy5sbmcgKiAwLjUgKSBdO1xyXG4gICAgICAgIHRoaXMuaCA9IE1hdGgucm91bmQoIHRoaXMubG5nICogMC41ICkgKiAoIHRoaXMuYnNpemVbMV0gKyB0aGlzLnNwYWNlc1sxXSApICsgdGhpcy5zcGFjZXNbMV07IFxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3RhYmxlJywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgdG9wOicrKHRoaXMuc3BhY2VzWzFdLTIpKydweDsgaGVpZ2h0OmF1dG87IGJvcmRlci1jb2xsYXBzZTpzZXBhcmF0ZTsgYm9yZGVyOm5vbmU7IGJvcmRlci1zcGFjaW5nOiAnKyh0aGlzLnNwYWNlc1swXS0yKSsncHggJysodGhpcy5zcGFjZXNbMV0tMikrJ3B4OycgKTtcclxuXHJcbiAgICAgICAgbGV0IG4gPSAwLCBiLCBtaWQsIHRkLCB0cjtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25zID0gW107XHJcbiAgICAgICAgdGhpcy5zdGF0ID0gW107XHJcbiAgICAgICAgdGhpcy50bXBYID0gW107XHJcbiAgICAgICAgdGhpcy50bXBZID0gW107XHJcblxyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZFsxXTsgaSsrICl7XHJcbiAgICAgICAgICAgIHRyID0gdGhpcy5jWzJdLmluc2VydFJvdygpO1xyXG4gICAgICAgICAgICB0ci5zdHlsZS5jc3NUZXh0ID0gJ3BvaW50ZXItZXZlbnRzOm5vbmU7JztcclxuICAgICAgICAgICAgZm9yKCBsZXQgaiA9IDA7IGogPCB0aGlzLmdyaWRbMF07IGorKyApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRkID0gdHIuaW5zZXJ0Q2VsbCgpO1xyXG4gICAgICAgICAgICAgICAgdGQuc3R5bGUuY3NzVGV4dCA9ICdwb2ludGVyLWV2ZW50czpub25lOyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzW25dICl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuc3R5bGUuY3NzVGV4dCA9IHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLmJ1dHRvbiArICdwb3NpdGlvbjpzdGF0aWM7IHdpZHRoOicrdGhpcy5ic2l6ZVswXSsncHg7IGhlaWdodDonK3RoaXMuYnNpemVbMV0rJ3B4OyBib3JkZXI6Jyt0aGlzLmNvbG9ycy5idXR0b25Cb3JkZXIrJzsgbGVmdDphdXRvOyByaWdodDphdXRvOyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOyAgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuaW5uZXJIVE1MID0gdGhpcy52YWx1ZXNbbl07XHJcbiAgICAgICAgICAgICAgICAgICAgdGQuYXBwZW5kQ2hpbGQoIGIgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b25zLnB1c2goYik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0LnB1c2goMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICAgICAgICAgICAgICAgICAgYi5zdHlsZS5jc3NUZXh0ID0gdGhpcy5jc3MudHh0ICsgJ3Bvc2l0aW9uOnN0YXRpYzsgd2lkdGg6Jyt0aGlzLmJzaXplWzBdKydweDsgaGVpZ2h0OicrdGhpcy5ic2l6ZVsxXSsncHg7IHRleHQtYWxpZ246Y2VudGVyOyAgbGVmdDphdXRvOyByaWdodDphdXRvOyBiYWNrZ3JvdW5kOm5vbmU7JztcclxuICAgICAgICAgICAgICAgICAgICB0ZC5hcHBlbmRDaGlsZCggYiApO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihqPT09MCkgYi5zdHlsZS5jc3NUZXh0ICs9ICdmbG9hdDpyaWdodDsnO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBiLnN0eWxlLmNzc1RleHQgKz0gJ2Zsb2F0OmxlZnQ7JztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuKys7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAtMTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHR4ID0gdGhpcy50bXBYO1xyXG4gICAgICAgIGxldCB0eSA9IHRoaXMudG1wWTtcclxuXHJcbiAgICAgICAgbGV0IGlkID0gLTE7XHJcbiAgICAgICAgbGV0IGMgPSAtMTtcclxuICAgICAgICBsZXQgbGluZSA9IC0xO1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5ncmlkWzBdO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICBcdGlmKCBsLnggPiB0eFtpXVswXSAmJiBsLnggPCB0eFtpXVsxXSApIGMgPSBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHRoaXMuZ3JpZFsxXTtcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCBsLnkgPiB0eVtpXVswXSAmJiBsLnkgPCB0eVtpXVsxXSApIGxpbmUgPSBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoYyE9PS0xICYmIGxpbmUhPT0tMSl7XHJcbiAgICAgICAgICAgIGlkID0gYyArIChsaW5lKjIpO1xyXG4gICAgICAgICAgICBpZihpZD50aGlzLmxuZy0xKSBpZCA9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlkO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgXHRsZXQgaWQgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBpZCA8IDAgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzW2lkXTtcclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgIFx0cmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgaWQgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBpZCAhPT0gLTEgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBpZCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHR1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGVzICggbiwgaWQgKSB7XHJcblxyXG4gICAgICAgIGxldCB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT09IGlkICkgdiA9IHRoaXMubW9kZSggbiwgaSApO1xyXG4gICAgICAgICAgICBlbHNlIHYgPSB0aGlzLm1vZGUoIDEsIGkgKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbiwgaWQgKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBpZDtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpXSAhPT0gbiApe1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdFtpXSA9IDE7IHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7ICB0aGlzLmJ1dHRvbnNbIGkgXS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdFtpXSA9IDI7IHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLmJ1dHRvbnNbIGkgXS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25PdmVyOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0W2ldID0gMzsgdGhpcy5idXR0b25zWyBpIF0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkRvd247IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVzKCAxICwgMCApO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBsYWJlbCAoIHN0cmluZywgbiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25zW25dLnRleHRDb250ZW50ID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpY29uICggc3RyaW5nLCB5LCBuICkge1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbnNbbl0uc3R5bGUucGFkZGluZyA9ICggeSB8fCAwICkgKydweCAwcHgnO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uc1tuXS5pbm5lckhUTUwgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IG4gPSAwLCBiLCBtaWQ7XHJcblxyXG4gICAgICAgIHRoaXMudG1wWCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBqID0gMDsgaiA8IHRoaXMuZ3JpZFswXTsgaisrICl7XHJcblxyXG4gICAgICAgICAgICBpZihqPT09MCl7XHJcbiAgICAgICAgICAgICAgICBtaWQgPSAoIHRoaXMudyowLjUgKSAtICggdGhpcy5zcGFjZXNbMF0qMC41ICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRtcFgucHVzaCggWyBtaWQtdGhpcy5ic2l6ZVswXSwgbWlkIF0gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1pZCA9ICggdGhpcy53KjAuNSApICsgKCB0aGlzLnNwYWNlc1swXSowLjUgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudG1wWC5wdXNoKCBbIG1pZCwgbWlkK3RoaXMuYnNpemVbMF0gXSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWlkID0gdGhpcy5zcGFjZXNbMV07XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkWzFdOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudG1wWS5wdXNoKCBbIG1pZCwgbWlkICsgdGhpcy5ic2l6ZVsxXSBdICk7XHJcblxyXG4gICAgICAgICAgICBtaWQgKz0gdGhpcy5ic2l6ZVsxXSArIHRoaXMuc3BhY2VzWzFdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBCb29sIH0gZnJvbSAnLi4vcHJvdG8vQm9vbC5qcyc7XHJcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL3Byb3RvL0J1dHRvbi5qcyc7XHJcbmltcG9ydCB7IENpcmN1bGFyIH0gZnJvbSAnLi4vcHJvdG8vQ2lyY3VsYXIuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uL3Byb3RvL0NvbG9yLmpzJztcclxuaW1wb3J0IHsgRnBzIH0gZnJvbSAnLi4vcHJvdG8vRnBzLmpzJztcclxuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi9wcm90by9HcmFwaC5qcyc7XHJcbmltcG9ydCB7IEdyb3VwICB9IGZyb20gJy4uL3Byb3RvL0dyb3VwLmpzJztcclxuaW1wb3J0IHsgSm95c3RpY2sgfSBmcm9tICcuLi9wcm90by9Kb3lzdGljay5qcyc7XHJcbmltcG9ydCB7IEtub2IgfSBmcm9tICcuLi9wcm90by9Lbm9iLmpzJztcclxuaW1wb3J0IHsgTGlzdCB9IGZyb20gJy4uL3Byb3RvL0xpc3QuanMnO1xyXG5pbXBvcnQgeyBOdW1lcmljIH0gZnJvbSAnLi4vcHJvdG8vTnVtZXJpYy5qcyc7XHJcbmltcG9ydCB7IFNsaWRlIH0gZnJvbSAnLi4vcHJvdG8vU2xpZGUuanMnO1xyXG5pbXBvcnQgeyBUZXh0SW5wdXQgfSBmcm9tICcuLi9wcm90by9UZXh0SW5wdXQuanMnO1xyXG5pbXBvcnQgeyBUaXRsZSB9IGZyb20gJy4uL3Byb3RvL1RpdGxlLmpzJztcclxuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vcHJvdG8vU2VsZWN0LmpzJztcclxuaW1wb3J0IHsgU2VsZWN0b3IgfSBmcm9tICcuLi9wcm90by9TZWxlY3Rvci5qcyc7XHJcbmltcG9ydCB7IEVtcHR5IH0gZnJvbSAnLi4vcHJvdG8vRW1wdHkuanMnO1xyXG5pbXBvcnQgeyBJdGVtIH0gZnJvbSAnLi4vcHJvdG8vSXRlbS5qcyc7XHJcbmltcG9ydCB7IEdyaWQgfSBmcm9tICcuLi9wcm90by9HcmlkLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBhZGQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBhcmd1bWVudHM7IFxyXG5cclxuICAgICAgICBsZXQgdHlwZSwgbywgcmVmID0gZmFsc2UsIG4gPSBudWxsO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIGFbMF0gPT09ICdzdHJpbmcnICl7IFxyXG5cclxuICAgICAgICAgICAgdHlwZSA9IGFbMF07XHJcbiAgICAgICAgICAgIG8gPSBhWzFdIHx8IHt9O1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2YgYVswXSA9PT0gJ29iamVjdCcgKXsgLy8gbGlrZSBkYXQgZ3VpXHJcblxyXG4gICAgICAgICAgICByZWYgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHt9KTtcclxuXHJcbiAgICAgICAgICAgIHR5cGUgPSBhWzJdLnR5cGUgPyBhWzJdLnR5cGUgOiAnc2xpZGUnOy8vYXV0b1R5cGUuYXBwbHkoIHRoaXMsIGEgKTtcclxuXHJcbiAgICAgICAgICAgIG8gPSBhWzJdO1xyXG4gICAgICAgICAgICBvLm5hbWUgPSBhWzFdO1xyXG4gICAgICAgICAgICBvLnZhbHVlID0gYVswXVthWzFdXTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdncm91cCcgKSBvLmFkZCA9IGFkZDtcclxuXHJcbiAgICAgICAgc3dpdGNoKCBuYW1lICl7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdib29sJzogbiA9IG5ldyBCb29sKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYnV0dG9uJzogbiA9IG5ldyBCdXR0b24obyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjaXJjdWxhcic6IG4gPSBuZXcgQ2lyY3VsYXIobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjb2xvcic6IG4gPSBuZXcgQ29sb3Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdmcHMnOiBuID0gbmV3IEZwcyhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dyYXBoJzogbiA9IG5ldyBHcmFwaChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dyb3VwJzogbiA9IG5ldyBHcm91cChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2pveXN0aWNrJzogbiA9IG5ldyBKb3lzdGljayhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2tub2InOiBuID0gbmV3IEtub2Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsaXN0JzogbiA9IG5ldyBMaXN0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbnVtZXJpYyc6IGNhc2UgJ251bWJlcic6IG4gPSBuZXcgTnVtZXJpYyhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NsaWRlJzogbiA9IG5ldyBTbGlkZShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RleHRJbnB1dCc6IGNhc2UgJ3N0cmluZyc6IG4gPSBuZXcgVGV4dElucHV0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAndGl0bGUnOiBuID0gbmV3IFRpdGxlKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzogbiA9IG5ldyBTZWxlY3Qobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzZWxlY3Rvcic6IG4gPSBuZXcgU2VsZWN0b3Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdlbXB0eSc6IGNhc2UgJ3NwYWNlJzogbiA9IG5ldyBFbXB0eShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2l0ZW0nOiBuID0gbmV3IEl0ZW0obyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdncmlkJzogbiA9IG5ldyBHcmlkKG8pOyBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbiAhPT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgaWYoIHJlZiApIG4uc2V0UmVmZXJlbmN5KCBhWzBdLCBhWzFdICk7XHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59IiwiXHJcbmltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi9Sb290cyc7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi9Ub29scyc7XHJcbmltcG9ydCB7IGFkZCB9IGZyb20gJy4vYWRkJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuL1YyJztcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBHdWkge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gY29sb3JcclxuICAgICAgICB0aGlzLmNvbG9ycyA9IFRvb2xzLmNsb25lQ29sb3IoKTtcclxuICAgICAgICB0aGlzLmNzcyA9IFRvb2xzLmNsb25lQ3NzKCk7XHJcblxyXG5cclxuICAgICAgICBpZiggby5jb25maWcgKSB0aGlzLnNldENvbmZpZyggby5jb25maWcgKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuYmcgPSBvLmJnIHx8IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7XHJcblxyXG4gICAgICAgIGlmKCBvLnRyYW5zcGFyZW50ICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgdGhpcy5jb2xvcnMuYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgICAgICAgICAgdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXIgPSAnbm9uZSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2lmKCBvLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayA9ICBvLmNhbGxiYWNrO1xyXG5cclxuICAgICAgICB0aGlzLmlzUmVzZXQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnRtcEFkZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50bXBIID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5pc0NhbnZhcyA9IG8uaXNDYW52YXMgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc0NhbnZhc09ubHkgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNzc0d1aSA9IG8uY3NzICE9PSB1bmRlZmluZWQgPyBvLmNzcyA6ICcnO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBvLmNhbGxiYWNrICA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG8uY2FsbGJhY2s7XHJcblxyXG4gICAgICAgIHRoaXMuZm9yY2VIZWlnaHQgPSBvLm1heEhlaWdodCB8fCAwO1xyXG4gICAgICAgIHRoaXMubG9ja0hlaWdodCA9IG8ubG9ja0hlaWdodCB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0l0ZW1Nb2RlID0gby5pdGVtTW9kZSAhPT0gdW5kZWZpbmVkID8gby5pdGVtTW9kZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmNuID0gJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gc2l6ZSBkZWZpbmVcclxuICAgICAgICB0aGlzLnNpemUgPSBUb29scy5zaXplO1xyXG4gICAgICAgIGlmKCBvLnAgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS5wID0gby5wO1xyXG4gICAgICAgIGlmKCBvLncgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS53ID0gby53O1xyXG4gICAgICAgIGlmKCBvLmggIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS5oID0gby5oO1xyXG4gICAgICAgIGlmKCBvLnMgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS5zID0gby5zO1xyXG5cclxuICAgICAgICB0aGlzLnNpemUuaCA9IHRoaXMuc2l6ZS5oIDwgMTEgPyAxMSA6IHRoaXMuc2l6ZS5oO1xyXG5cclxuICAgICAgICAvLyBsb2NhbCBtb3VzZSBhbmQgem9uZVxyXG4gICAgICAgIHRoaXMubG9jYWwgPSBuZXcgVjIoKS5uZWcoKTtcclxuICAgICAgICB0aGlzLnpvbmUgPSB7IHg6MCwgeTowLCB3OnRoaXMuc2l6ZS53LCBoOjAgfTtcclxuXHJcbiAgICAgICAgLy8gdmlydHVhbCBtb3VzZVxyXG4gICAgICAgIHRoaXMubW91c2UgPSBuZXcgVjIoKS5uZWcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gMDtcclxuICAgICAgICB0aGlzLnByZXZZID0gLTE7XHJcbiAgICAgICAgdGhpcy5zdyA9IDA7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvLyBib3R0b20gYW5kIGNsb3NlIGhlaWdodFxyXG4gICAgICAgIHRoaXMuaXNXaXRoQ2xvc2UgPSBvLmNsb3NlICE9PSB1bmRlZmluZWQgPyBvLmNsb3NlIDogdHJ1ZTtcclxuICAgICAgICB0aGlzLmJoID0gIXRoaXMuaXNXaXRoQ2xvc2UgPyAwIDogdGhpcy5zaXplLmg7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1Jlc2l6ZSA9IG8uYXV0b1Jlc2l6ZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IG8uYXV0b1Jlc2l6ZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlzQ2VudGVyID0gby5jZW50ZXIgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1Njcm9sbCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnVpcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5kZWNhbCA9IDA7XHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IDE7XHJcbiAgICAgICAgdGhpcy5veSA9IDA7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5pc05ld1RhcmdldCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgd2lkdGg6MHB4OyBoZWlnaHQ6YXV0bzsgdG9wOjBweDsgJyArIHRoaXMuY3NzR3VpICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5uZXJDb250ZW50ID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgdG9wOjA7IGxlZnQ6MDsgaGVpZ2h0OmF1dG87IG92ZXJmbG93OmhpZGRlbjsnKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuaW5uZXJDb250ZW50ICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5uZXIgPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBsZWZ0OjA7ICcpO1xyXG4gICAgICAgIHRoaXMuaW5uZXJDb250ZW50LmFwcGVuZENoaWxkKHRoaXMuaW5uZXIpO1xyXG5cclxuICAgICAgICAvLyBzY3JvbGxcclxuICAgICAgICB0aGlzLnNjcm9sbEJHID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncmlnaHQ6MDsgdG9wOjA7IHdpZHRoOicrICh0aGlzLnNpemUucyAtIDEpICsncHg7IGhlaWdodDoxMHB4OyBkaXNwbGF5Om5vbmU7IGJhY2tncm91bmQ6Jyt0aGlzLmJnKyc7Jyk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbEJHICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYmFja2dyb3VuZDonK3RoaXMuY29sb3JzLnNjcm9sbCsnOyByaWdodDoycHg7IHRvcDowOyB3aWR0aDonKyh0aGlzLnNpemUucy00KSsncHg7IGhlaWdodDoxMHB4OycpO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsQkcuYXBwZW5kQ2hpbGQoIHRoaXMuc2Nyb2xsICk7XHJcblxyXG4gICAgICAgIC8vIGJvdHRvbSBidXR0b25cclxuICAgICAgICB0aGlzLmJvdHRvbSA9IFRvb2xzLmRvbSggJ2RpdicsICB0aGlzLmNzcy50eHQgKyAnd2lkdGg6MTAwJTsgdG9wOmF1dG87IGJvdHRvbTowOyBsZWZ0OjA7IGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOjEwcHg7ICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOjEwcHg7IHRleHQtYWxpZ246Y2VudGVyOyBoZWlnaHQ6Jyt0aGlzLmJoKydweDsgbGluZS1oZWlnaHQ6JysodGhpcy5iaC01KSsncHg7IGJvcmRlci10b3A6MXB4IHNvbGlkICcrVG9vbHMuY29sb3JzLnN0cm9rZSsnOycpO1xyXG4gICAgICAgIHRoaXMuY29udGVudC5hcHBlbmRDaGlsZCggdGhpcy5ib3R0b20gKTtcclxuICAgICAgICB0aGlzLmJvdHRvbS50ZXh0Q29udGVudCA9ICdjbG9zZSc7XHJcbiAgICAgICAgdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcblxyXG4gICAgICAgIC8vXHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gby5wYXJlbnQgIT09IHVuZGVmaW5lZCA/IG8ucGFyZW50IDogbnVsbDtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdGhpcy5wYXJlbnQgPT09IG51bGwgJiYgIXRoaXMuaXNDYW52YXMgKXsgXHJcbiAgICAgICAgXHR0aGlzLnBhcmVudCA9IGRvY3VtZW50LmJvZHk7XHJcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgcG9zaXRpb25cclxuICAgICAgICBcdGlmKCAhdGhpcy5pc0NlbnRlciApIHRoaXMuY29udGVudC5zdHlsZS5yaWdodCA9ICcxMHB4JzsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5wYXJlbnQgIT09IG51bGwgKSB0aGlzLnBhcmVudC5hcHBlbmRDaGlsZCggdGhpcy5jb250ZW50ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzQ2FudmFzICYmIHRoaXMucGFyZW50ID09PSBudWxsICkgdGhpcy5pc0NhbnZhc09ubHkgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNDYW52YXNPbmx5ICkgdGhpcy5jb250ZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XHJcblxyXG5cclxuICAgICAgICB0aGlzLnNldFdpZHRoKCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzQ2FudmFzICkgdGhpcy5tYWtlQ2FudmFzKCk7XHJcblxyXG4gICAgICAgIFJvb3RzLmFkZCggdGhpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRUb3AgKCB0LCBoICkge1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnQuc3R5bGUudG9wID0gdCArICdweCc7XHJcbiAgICAgICAgaWYoIGggIT09IHVuZGVmaW5lZCApIHRoaXMuZm9yY2VIZWlnaHQgPSBoO1xyXG4gICAgICAgIHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL2NhbGxiYWNrOiBmdW5jdGlvbiAoKSB7fSxcclxuXHJcbiAgICBkaXNwb3NlICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIGlmKCB0aGlzLnBhcmVudCAhPT0gbnVsbCApIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKCB0aGlzLmNvbnRlbnQgKTtcclxuICAgICAgICBSb290cy5yZW1vdmUoIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDQU5WQVNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvbkRyYXcgKCkge31cclxuXHJcbiAgICBtYWtlQ2FudmFzICgpIHtcclxuXHJcbiAgICBcdHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFwiY2FudmFzXCIgKTtcclxuICAgIFx0dGhpcy5jYW52YXMud2lkdGggPSB0aGlzLnpvbmUudztcclxuICAgIFx0dGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5mb3JjZUhlaWdodCA/IHRoaXMuZm9yY2VIZWlnaHQgOiB0aGlzLnpvbmUuaDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyAoIGZvcmNlICkge1xyXG5cclxuICAgIFx0aWYoIHRoaXMuY2FudmFzID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgIFx0bGV0IHcgPSB0aGlzLnpvbmUudztcclxuICAgIFx0bGV0IGggPSB0aGlzLmZvcmNlSGVpZ2h0ID8gdGhpcy5mb3JjZUhlaWdodCA6IHRoaXMuem9uZS5oO1xyXG4gICAgXHRSb290cy50b0NhbnZhcyggdGhpcywgdywgaCwgZm9yY2UgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8vLy8vXHJcblxyXG4gICAgZ2V0RG9tICgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0TW91c2UgKCBtICkge1xyXG5cclxuICAgICAgICB0aGlzLm1vdXNlLnNldCggbS54LCBtLnkgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29uZmlnICggbyApIHtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRDb2xvcnMoIG8gKTtcclxuICAgICAgICB0aGlzLnNldFRleHQoIG8uZm9udFNpemUsIG8udGV4dCwgby5mb250LCBvLnNoYWRvdyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xvcnMgKCBvICkge1xyXG5cclxuICAgICAgICBmb3IoIGxldCBjIGluIG8gKXtcclxuICAgICAgICAgICAgaWYoIHRoaXMuY29sb3JzW2NdICkgdGhpcy5jb2xvcnNbY10gPSBvW2NdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCAoIHNpemUsIGNvbG9yLCBmb250LCBzaGFkb3cgKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLnNldFRleHQoIHNpemUsIGNvbG9yLCBmb250LCBzaGFkb3csIHRoaXMuY29sb3JzLCB0aGlzLmNzcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBoaWRlICggYiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50LnN0eWxlLmRpc3BsYXkgPSBiID8gJ25vbmUnIDogJ2Jsb2NrJztcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBvbkNoYW5nZSAoIGYgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBmIHx8IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU1RZTEVTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZSAoIG4gKSB7XHJcblxyXG4gICAgXHRsZXQgbmVlZENoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgIFx0aWYoIG4gIT09IHRoaXMuY24gKXtcclxuXHJcblx0ICAgIFx0dGhpcy5jbiA9IG47XHJcblxyXG5cdCAgICBcdHN3aXRjaCggbiApe1xyXG5cclxuXHQgICAgXHRcdGNhc2UgJ2RlZic6IFxyXG5cdCAgICBcdFx0ICAgdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbDsgXHJcblx0ICAgIFx0XHQgICB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDtcclxuXHQgICAgXHRcdCAgIHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gdGhpcy5jb2xvcnMudGV4dDtcclxuXHQgICAgXHRcdGJyZWFrO1xyXG5cclxuXHQgICAgXHRcdC8vY2FzZSAnc2Nyb2xsRGVmJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbDsgYnJlYWs7XHJcblx0ICAgIFx0XHRjYXNlICdzY3JvbGxPdmVyJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgYnJlYWs7XHJcblx0ICAgIFx0XHRjYXNlICdzY3JvbGxEb3duJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247IGJyZWFrO1xyXG5cclxuXHQgICAgXHRcdC8vY2FzZSAnYm90dG9tRGVmJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7IGJyZWFrO1xyXG5cdCAgICBcdFx0Y2FzZSAnYm90dG9tT3Zlcic6IHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kT3ZlcjsgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSAnI0ZGRic7IGJyZWFrO1xyXG5cdCAgICBcdFx0Ly9jYXNlICdib3R0b21Eb3duJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSAnIzAwMCc7IGJyZWFrO1xyXG5cclxuXHQgICAgXHR9XHJcblxyXG5cdCAgICBcdG5lZWRDaGFuZ2UgPSB0cnVlO1xyXG5cclxuXHQgICAgfVxyXG5cclxuICAgIFx0cmV0dXJuIG5lZWRDaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgVEFSR0VUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2xlYXJUYXJnZXQgKCkge1xyXG5cclxuICAgIFx0aWYoIHRoaXMuY3VycmVudCA9PT0gLTEgKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLy9pZighdGhpcy50YXJnZXQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnRhcmdldC51aW91dCgpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG5cclxuICAgICAgICAvLy9jb25zb2xlLmxvZyh0aGlzLmlzRG93bikvL2lmKHRoaXMuaXNEb3duKVJvb3RzLmNsZWFySW5wdXQoKTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIFJvb3RzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFpPTkUgVEVTVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuaXNSZXNldCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9ICcnO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMuaXNTY3JvbGwgPyAgdGhpcy56b25lLncgIC0gdGhpcy5zaXplLnMgOiB0aGlzLnpvbmUudztcclxuICAgICAgICBcclxuICAgICAgICBpZiggbC55ID4gdGhpcy56b25lLmggLSB0aGlzLmJoICYmICBsLnkgPCB0aGlzLnpvbmUuaCApIG5hbWUgPSAnYm90dG9tJztcclxuICAgICAgICBlbHNlIG5hbWUgPSBsLnggPiBzID8gJ3Njcm9sbCcgOiAnY29udGVudCc7XHJcblxyXG4gICAgICAgIHJldHVybiBuYW1lO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50ICggZSApIHtcclxuXHJcbiAgICBcdGxldCB0eXBlID0gZS50eXBlO1xyXG5cclxuICAgIFx0bGV0IGNoYW5nZSA9IGZhbHNlO1xyXG4gICAgXHRsZXQgdGFyZ2V0Q2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgXHRsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgXHRpZiggdHlwZSA9PT0gJ21vdXNldXAnICYmIHRoaXMuaXNEb3duICkgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIFx0aWYoIHR5cGUgPT09ICdtb3VzZWRvd24nICYmICF0aGlzLmlzRG93biApIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICYmIHRoaXMuaXNOZXdUYXJnZXQgKXsgUm9vdHMuY2xlYXJJbnB1dCgpOyB0aGlzLmlzTmV3VGFyZ2V0PWZhbHNlOyB9XHJcblxyXG4gICAgXHRpZiggIW5hbWUgKSByZXR1cm47XHJcblxyXG4gICAgXHRzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICBcdFx0Y2FzZSAnY29udGVudCc6XHJcblxyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRZID0gdGhpcy5pc1Njcm9sbCA/ICBlLmNsaWVudFkgKyB0aGlzLmRlY2FsIDogZS5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBSb290cy5pc01vYmlsZSAmJiB0eXBlID09PSAnbW91c2Vkb3duJyApIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcblxyXG5cdCAgICBcdFx0aWYoIHRoaXMudGFyZ2V0ICkgdGFyZ2V0Q2hhbmdlID0gdGhpcy50YXJnZXQuaGFuZGxlRXZlbnQoIGUgKTtcclxuXHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlbW92ZScgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ2RlZicpO1xyXG4gICAgICAgICAgICAgICAgaWYoIHR5cGUgPT09ICd3aGVlbCcgJiYgIXRhcmdldENoYW5nZSAmJiB0aGlzLmlzU2Nyb2xsICkgY2hhbmdlID0gdGhpcy5vbldoZWVsKCBlICk7XHJcbiAgICAgICAgICAgICAgIFxyXG5cdCAgICBcdFx0aWYoICFSb290cy5sb2NrICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgXHRcdGJyZWFrO1xyXG4gICAgXHRcdGNhc2UgJ2JvdHRvbSc6XHJcblxyXG5cdCAgICBcdFx0dGhpcy5jbGVhclRhcmdldCgpO1xyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5tb2RlKCdib3R0b21PdmVyJyk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKSB7XHJcblx0ICAgIFx0XHRcdHRoaXMuaXNPcGVuID0gdGhpcy5pc09wZW4gPyBmYWxzZSA6IHRydWU7XHJcblx0XHQgICAgICAgICAgICB0aGlzLmJvdHRvbS50ZXh0Q29udGVudCA9IHRoaXMuaXNPcGVuID8gJ2Nsb3NlJyA6ICdvcGVuJztcclxuXHRcdCAgICAgICAgICAgIHRoaXMuc2V0SGVpZ2h0KCk7XHJcblx0XHQgICAgICAgICAgICB0aGlzLm1vZGUoJ2RlZicpO1xyXG5cdFx0ICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHQgICAgXHRcdH1cclxuXHJcbiAgICBcdFx0YnJlYWs7XHJcbiAgICBcdFx0Y2FzZSAnc2Nyb2xsJzpcclxuXHJcblx0ICAgIFx0XHR0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlbW92ZScgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ3Njcm9sbE92ZXInKTtcclxuXHQgICAgXHRcdGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyApIGNoYW5nZSA9IHRoaXMubW9kZSgnc2Nyb2xsRG93bicpOyBcclxuICAgICAgICAgICAgICAgIGlmKCB0eXBlID09PSAnd2hlZWwnICkgY2hhbmdlID0gdGhpcy5vbldoZWVsKCBlICk7IFxyXG5cdCAgICBcdFx0aWYoIHRoaXMuaXNEb3duICkgdGhpcy51cGRhdGUoIChlLmNsaWVudFktdGhpcy56b25lLnkpLSh0aGlzLnNoKjAuNSkgKTtcclxuXHJcbiAgICBcdFx0YnJlYWs7XHJcblxyXG5cclxuICAgIFx0fVxyXG5cclxuICAgIFx0aWYoIHRoaXMuaXNEb3duICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgIFx0aWYoIHRhcmdldENoYW5nZSApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlID09PSAna2V5dXAnICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICBpZiggdHlwZSA9PT0gJ2tleWRvd24nICkgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICBcdGlmKCBjaGFuZ2UgKSB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TmV4dCAoIGUsIGNoYW5nZSApIHtcclxuXHJcblxyXG5cclxuICAgICAgICBsZXQgbmV4dCA9IFJvb3RzLmZpbmRUYXJnZXQoIHRoaXMudWlzLCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc05ld1RhcmdldCA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IC0xICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMudWlzWyB0aGlzLmN1cnJlbnQgXTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQudWlvdmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBvbldoZWVsICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5veSArPSAyMCplLmRlbHRhO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCB0aGlzLm95ICk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVTRVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1Jlc2V0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL3RoaXMucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIHRoaXMubW91c2UubmVnKCk7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy9Sb290cy5jbGVhcklucHV0KCk7XHJcbiAgICAgICAgbGV0IHIgPSB0aGlzLm1vZGUoJ2RlZicpO1xyXG4gICAgICAgIGxldCByMiA9IHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHJcbiAgICAgICAgaWYoIHIgfHwgcjIgKSB0aGlzLmRyYXcoIHRydWUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1Jlc2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy9Sb290cy5sb2NrID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQUREIE5PREVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhZGQgKCkge1xyXG5cclxuICAgICAgICBsZXQgYSA9IGFyZ3VtZW50cztcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiBhWzFdID09PSAnb2JqZWN0JyApeyBcclxuXHJcbiAgICAgICAgICAgIGFbMV0uaXNVSSA9IHRydWU7XHJcbiAgICAgICAgICAgIGFbMV0ubWFpbiA9IHRoaXM7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGFbMV0gPT09ICdzdHJpbmcnICl7XHJcblxyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHsgaXNVSTp0cnVlLCBtYWluOnRoaXMgfSk7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYVsyXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGFbMl0ubWFpbiA9IHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgbGV0IHUgPSBhZGQuYXBwbHkoIHRoaXMsIGEgKTtcclxuXHJcbiAgICAgICAgaWYoIHUgPT09IG51bGwgKSByZXR1cm47XHJcblxyXG5cclxuICAgICAgICAvL2xldCBuID0gYWRkLmFwcGx5KCB0aGlzLCBhICk7XHJcbiAgICAgICAgLy9sZXQgbiA9IFVJTC5hZGQoIC4uLmFyZ3MgKTtcclxuXHJcbiAgICAgICAgdGhpcy51aXMucHVzaCggdSApO1xyXG4gICAgICAgIC8vbi5weSA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgaWYoICF1LmF1dG9XaWR0aCApe1xyXG4gICAgICAgICAgICBsZXQgeSA9IHUuY1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnByZXZZICE9PSB5ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGMoIHUuaCArIDEgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldlkgPSB5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMucHJldlkgPSAwOy8vLTE7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsYyggdS5oICsgMSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5Q2FsYyAoKSB7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy51aXMubGVuZ3RoLCB0aGlzLnRtcEggKVxyXG5cclxuICAgICAgICB0aGlzLmNhbGMoIHRoaXMudG1wSCApO1xyXG4gICAgICAgIC8vdGhpcy50bXBIID0gMDtcclxuICAgICAgICB0aGlzLnRtcEFkZCA9IG51bGw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVaXMgKCkge1xyXG5cclxuICAgICAgICBSb290cy5jYWxjVWlzKCB0aGlzLnVpcywgdGhpcy56b25lLCB0aGlzLnpvbmUueSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgb25lIG5vZGVcclxuXHJcbiAgICByZW1vdmUgKCBuICkgeyBcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5pbmRleE9mKCBuICk7IFxyXG4gICAgICAgIGlmICggaSAhPT0gLTEgKSB0aGlzLnVpc1tpXS5jbGVhcigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBjYWxsIGFmdGVyIHVpcyBjbGVhclxyXG5cclxuICAgIGNsZWFyT25lICggbiApIHsgXHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMuaW5kZXhPZiggbiApOyBcclxuICAgICAgICBpZiAoIGkgIT09IC0xICkge1xyXG4gICAgICAgICAgICB0aGlzLmlubmVyLnJlbW92ZUNoaWxkKCB0aGlzLnVpc1tpXS5jWzBdICk7XHJcbiAgICAgICAgICAgIHRoaXMudWlzLnNwbGljZSggaSwgMSApOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNsZWFyIGFsbCBndWlcclxuXHJcbiAgICBjbGVhciAoKSB7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy51aXNbaV0uY2xlYXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy51aXMgPSBbXTtcclxuICAgICAgICBSb290cy5saXN0ZW5zID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY2FsYyggLXRoaXMuaCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElURU1TIFNQRUNJQUxcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgcmVzZXRJdGVtICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzSXRlbU1vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy51aXNbaV0uc2VsZWN0ZWQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0SXRlbSAoIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0l0ZW1Nb2RlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5yZXNldEl0ZW0oKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICl7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKDApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnVpc1tpXS52YWx1ZSA9PT0gbmFtZSApeyBcclxuICAgICAgICAgICAgICAgIHRoaXMudWlzW2ldLnNlbGVjdGVkKCB0cnVlICk7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc1Njcm9sbCApIHRoaXMudXBkYXRlKCAoIGkqKHRoaXMudWlzW2ldLmgrMSkgKSp0aGlzLnJhdGlvICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBTQ1JPTExcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB1cFNjcm9sbCAoIGIgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc3cgPSBiID8gdGhpcy5zaXplLnMgOiAwO1xyXG4gICAgICAgIHRoaXMub3kgPSBiID8gdGhpcy5veSA6IDA7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxCRy5zdHlsZS5kaXNwbGF5ID0gYiA/ICdibG9jaycgOiAnbm9uZSc7XHJcblxyXG4gICAgICAgIGlmKCBiICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRvdGFsID0gdGhpcy5oO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tYXhWaWV3ID0gdGhpcy5tYXhIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhdGlvID0gdGhpcy5tYXhWaWV3IC8gdGhpcy50b3RhbDtcclxuICAgICAgICAgICAgdGhpcy5zaCA9IHRoaXMubWF4VmlldyAqIHRoaXMucmF0aW87XHJcblxyXG4gICAgICAgICAgICAvL2lmKCB0aGlzLnNoIDwgMjAgKSB0aGlzLnNoID0gMjA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXhWaWV3IC0gdGhpcy5zaDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub3kgPSBUb29scy5jbGFtcCggdGhpcy5veSwgMCwgdGhpcy5yYW5nZSApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxCRy5zdHlsZS5oZWlnaHQgPSB0aGlzLm1heFZpZXcgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbC5zdHlsZS5oZWlnaHQgPSB0aGlzLnNoICsgJ3B4JztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNldEl0ZW1XaWR0aCggdGhpcy56b25lLncgLSB0aGlzLnN3ICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoIHRoaXMub3kgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggeSApIHtcclxuXHJcbiAgICAgICAgeSA9IFRvb2xzLmNsYW1wKCB5LCAwLCB0aGlzLnJhbmdlICk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVjYWwgPSBNYXRoLmZsb29yKCB5IC8gdGhpcy5yYXRpbyApO1xyXG4gICAgICAgIHRoaXMuaW5uZXIuc3R5bGUudG9wID0gLSB0aGlzLmRlY2FsICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNjcm9sbC5zdHlsZS50b3AgPSBNYXRoLmZsb29yKCB5ICkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMub3kgPSB5O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFU0laRSBGVU5DVElPTlxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNhbGMgKCB5ICkge1xyXG5cclxuICAgICAgICB0aGlzLmggKz0geTtcclxuICAgICAgICBjbGVhclRpbWVvdXQoIHRoaXMudG1wICk7XHJcbiAgICAgICAgdGhpcy50bXAgPSBzZXRUaW1lb3V0KCB0aGlzLnNldEhlaWdodC5iaW5kKHRoaXMpLCAxMCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRIZWlnaHQgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy50bXAgKSBjbGVhclRpbWVvdXQoIHRoaXMudG1wICk7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5oIClcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmJoO1xyXG4gICAgICAgIHRoaXMuaXNTY3JvbGwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNPcGVuICl7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGhoID0gdGhpcy5mb3JjZUhlaWdodCA/IHRoaXMuZm9yY2VIZWlnaHQgKyB0aGlzLnpvbmUueSA6IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWF4SGVpZ2h0ID0gaGhoIC0gdGhpcy56b25lLnkgLSB0aGlzLmJoO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRpZmYgPSB0aGlzLmggLSB0aGlzLm1heEhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmKCBkaWZmID4gMSApeyAvL3RoaXMuaCA+IHRoaXMubWF4SGVpZ2h0ICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1Njcm9sbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMubWF4SGVpZ2h0ICsgdGhpcy5iaDtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmggKyB0aGlzLmJoO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwU2Nyb2xsKCB0aGlzLmlzU2Nyb2xsICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5uZXJDb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuem9uZS5oIC0gdGhpcy5iaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuem9uZS5oICsgJ3B4JztcclxuICAgICAgICB0aGlzLmJvdHRvbS5zdHlsZS50b3AgPSB0aGlzLnpvbmUuaCAtIHRoaXMuYmggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5mb3JjZUhlaWdodCAmJiB0aGlzLmxvY2tIZWlnaHQgKSB0aGlzLmNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5mb3JjZUhlaWdodCArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHRoaXMuY2FsY1VpcygpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzQ2FudmFzICkgdGhpcy5kcmF3KCB0cnVlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlem9uZSAoKSB7XHJcbiAgICAgICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0V2lkdGggKCB3ICkge1xyXG5cclxuICAgICAgICBpZiggdyApIHRoaXMuem9uZS53ID0gdztcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50LnN0eWxlLndpZHRoID0gdGhpcy56b25lLncgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0NlbnRlciApIHRoaXMuY29udGVudC5zdHlsZS5tYXJnaW5MZWZ0ID0gLShNYXRoLmZsb29yKHRoaXMuem9uZS53KjAuNSkpICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5zZXRJdGVtV2lkdGgoIHRoaXMuem9uZS53IC0gdGhpcy5zdyApO1xyXG5cclxuICAgICAgICB0aGlzLnNldEhlaWdodCgpO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNDYW52YXNPbmx5ICkgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcbiAgICAgICAgLy90aGlzLnJlc2l6ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRJdGVtV2lkdGggKCB3ICkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRTaXplKCB3ICk7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnJTaXplKClcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuR3VpLnByb3RvdHlwZS5pc0d1aSA9IHRydWU7IiwiLy9pbXBvcnQgJy4vcG9seWZpbGxzLmpzJztcclxuXHJcbmV4cG9ydCBjb25zdCBSRVZJU0lPTiA9ICcyLjgnO1xyXG5cclxuZXhwb3J0IHsgVG9vbHMgfSBmcm9tICcuL2NvcmUvVG9vbHMuanMnO1xyXG5leHBvcnQgeyBHdWkgfSBmcm9tICcuL2NvcmUvR3VpLmpzJztcclxuZXhwb3J0IHsgUHJvdG8gfSBmcm9tICcuL2NvcmUvUHJvdG8uanMnO1xyXG5leHBvcnQgeyBhZGQgfSBmcm9tICcuL2NvcmUvYWRkLmpzJztcclxuLy9cclxuZXhwb3J0IHsgQm9vbCB9IGZyb20gJy4vcHJvdG8vQm9vbC5qcyc7XHJcbmV4cG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vcHJvdG8vQnV0dG9uLmpzJztcclxuZXhwb3J0IHsgQ2lyY3VsYXIgfSBmcm9tICcuL3Byb3RvL0NpcmN1bGFyLmpzJztcclxuZXhwb3J0IHsgQ29sb3IgfSBmcm9tICcuL3Byb3RvL0NvbG9yLmpzJztcclxuZXhwb3J0IHsgRnBzIH0gZnJvbSAnLi9wcm90by9GcHMuanMnO1xyXG5leHBvcnQgeyBHcm91cCB9IGZyb20gJy4vcHJvdG8vR3JvdXAuanMnO1xyXG5leHBvcnQgeyBKb3lzdGljayB9IGZyb20gJy4vcHJvdG8vSm95c3RpY2suanMnO1xyXG5leHBvcnQgeyBLbm9iIH0gZnJvbSAnLi9wcm90by9Lbm9iLmpzJztcclxuZXhwb3J0IHsgTGlzdCB9IGZyb20gJy4vcHJvdG8vTGlzdC5qcyc7XHJcbmV4cG9ydCB7IE51bWVyaWMgfSBmcm9tICcuL3Byb3RvL051bWVyaWMuanMnO1xyXG5leHBvcnQgeyBTbGlkZSB9IGZyb20gJy4vcHJvdG8vU2xpZGUuanMnO1xyXG5leHBvcnQgeyBUZXh0SW5wdXQgfSBmcm9tICcuL3Byb3RvL1RleHRJbnB1dC5qcyc7XHJcbmV4cG9ydCB7IFRpdGxlIH0gZnJvbSAnLi9wcm90by9UaXRsZS5qcyc7Il0sIm5hbWVzIjpbInJ1bnRpbWUiLCJleHBvcnRzIiwiT2JqZWN0IiwidmFsdWUiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJkZWZpbmUiLCJvYmoiLCJrZXkiLCJnZW5lcmF0b3IiLCJ0eXBlIiwiYXJnIiwiY2FsbCIsIkl0ZXJhdG9yUHJvdG90eXBlIiwiR2VuZXJhdG9yRnVuY3Rpb24iLCJHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSIsImdlbkZ1biIsIkdwIiwiX19hd2FpdCIsInJlamVjdCIsInRoZW4iLCJpbnZva2UiLCJlcnIiLCJyZXN1bHQiLCJyZXNvbHZlIiwiZXJyb3IiLCJwcmV2aW91c1Byb21pc2UiLCJjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyIsImRlZmluZUl0ZXJhdG9yTWV0aG9kcyIsIkFzeW5jSXRlcmF0b3IiLCJjb250ZXh0IiwiX3NlbnQiLCJzdGF0ZSIsInNlbGYiLCJyZWNvcmQiLCJkb25lIiwibWF5YmVJbnZva2VEZWxlZ2F0ZSIsInRyeUxvYyIsImVudHJ5IiwidHJ5TG9jc0xpc3QiLCJrZXlzIiwibmV4dCIsImkiLCJoYXNPd24iLCJDb250ZXh0IiwiY29uc3RydWN0b3IiLCJyZXNldCIsInVuZGVmaW5lZCIsIm5hbWUiLCJpc05hTiIsInNsaWNlIiwic3RvcCIsImRpc3BhdGNoRXhjZXB0aW9uIiwibG9jIiwicHJldiIsImhhbmRsZSIsIkVycm9yIiwiYWJydXB0IiwiZmluYWxseUVudHJ5IiwiY29tcGxldGUiLCJydmFsIiwiZmluaXNoIiwicmVzZXRUcnlFbnRyeSIsInRocm93biIsImRlbGVnYXRlWWllbGQiLCJpdGVyYXRvciIsInJlc3VsdE5hbWUiLCJuZXh0TG9jIiwibW9kdWxlIiwicmVnZW5lcmF0b3JSdW50aW1lIiwiYWNjaWRlbnRhbFN0cmljdE1vZGUiLCJGdW5jdGlvbiIsIlQiLCJmcmFnIiwiY29sb3JSaW5nIiwiam95c3RpY2tfMCIsImpveXN0aWNrXzEiLCJjaXJjdWxhciIsImtub2IiLCJzdmducyIsImxpbmtzIiwiaHRtbHMiLCJET01fU0laRSIsIlNWR19UWVBFX0QiLCJTVkdfVFlQRV9HIiwiUEkiLCJUd29QSSIsInBpOTAiLCJwaTYwIiwidG9yYWQiLCJ0b2RlZyIsImNsYW1wIiwidiIsInNpemUiLCJ3IiwiaCIsInAiLCJzIiwiY2xvbmVDb2xvciIsImNjIiwiY2xvbmVDc3MiLCJjb2xvcnMiLCJ0ZXh0IiwidGV4dE92ZXIiLCJ0eHRzZWxlY3RiZyIsImJhY2tncm91bmQiLCJiYWNrZ3JvdW5kT3ZlciIsImlucHV0Qm9yZGVyIiwiaW5wdXRIb2xkZXIiLCJpbnB1dEJvcmRlclNlbGVjdCIsImlucHV0QmciLCJpbnB1dE92ZXIiLCJib3JkZXIiLCJib3JkZXJPdmVyIiwiYm9yZGVyU2VsZWN0Iiwic2Nyb2xsYmFjayIsInNjcm9sbGJhY2tvdmVyIiwiYnV0dG9uIiwiYm9vbGJnIiwiYm9vbG9uIiwic2VsZWN0IiwibW92aW5nIiwiZG93biIsIm92ZXIiLCJhY3Rpb24iLCJzdHJva2UiLCJzY3JvbGwiLCJoaWRlIiwiZ3JvdXBCb3JkZXIiLCJidXR0b25Cb3JkZXIiLCJjc3MiLCJiYXNpYyIsInN2Z3MiLCJncm91cCIsImFycm93IiwiYXJyb3dEb3duIiwiYXJyb3dVcCIsInNvbGlkIiwiYm9keSIsInZlaGljbGUiLCJhcnRpY3VsYXRpb24iLCJjaGFyYWN0ZXIiLCJ0ZXJyYWluIiwiam9pbnQiLCJyYXkiLCJjb2xsaXNpb24iLCJtYXAiLCJtYXRlcmlhbCIsInRleHR1cmUiLCJvYmplY3QiLCJub25lIiwiY3Vyc29yIiwic2V0VGV4dCIsImNvbG9yIiwiZm9udCIsImNsb25lIiwibyIsInNldFN2ZyIsImlkIiwic2V0Q3NzIiwiZG9tIiwiciIsInNldCIsImciLCJhdHQiLCJnZXQiLCJhZGRBdHRyaWJ1dGVzIiwiY2xlYXIiLCJwdXJnZSIsIm4iLCJhIiwiQ29sb3JMdW1hIiwibCIsImhleCIsImMiLCJtaW4iLCJtYXgiLCJyZ2IiLCJmaW5kRGVlcEludmVyIiwiaGV4VG9IdG1sIiwiaHRtbFRvSGV4IiwidTI1NSIsInUxNiIsInVucGFjayIsImh0bWxSZ2IiLCJwYWQiLCJyZ2JUb0hleCIsImIiLCJodWVUb1JnYiIsInEiLCJ0IiwicmdiVG9Ic2wiLCJNYXRoIiwiaHNsVG9SZ2IiLCJtYWtlR3JhZGlhbnQiLCJvZmZzZXQiLCJtYWtlS25vYiIsInZpZXdCb3giLCJ3aWR0aCIsImhlaWdodCIsInByZXNlcnZlQXNwZWN0UmF0aW8iLCJjeCIsImN5IiwiZmlsbCIsImQiLCJtYWtlQ2lyY3VsYXIiLCJtYWtlSm95c3RpY2siLCJjY2MiLCJmeCIsImZ5Iiwic3ZnIiwiY2MwIiwiY2MxIiwibWFrZUNvbG9yUmluZyIsImFtIiwiZDIiLCJhMiIsImFyIiwidGFuIiwiY29zIiwic2luIiwiYTEiLCJqIiwibWlkIiwicGF0aCIsIngxIiwieTEiLCJ4MiIsInkyIiwiZ3JhZGllbnRVbml0cyIsInR3IiwicG9pbnRzIiwiaWNvbiIsImxvZ29GaWxsX2QiLCJUb29scyIsIlIiLCJ1aSIsIklEIiwibG9jayIsIndsb2NrIiwiY3VycmVudCIsIm5lZWRSZVpvbmUiLCJpc0V2ZW50c0luaXQiLCJwcmV2RGVmYXVsdCIsInhtbHNlcmlhbGl6ZXIiLCJ0bXBUaW1lIiwidG1wSW1hZ2UiLCJvbGRDdXJzb3IiLCJpbnB1dCIsInBhcmVudCIsImZpcnN0SW1wdXQiLCJoaWRkZW5JbXB1dCIsImhpZGRlblNpemVyIiwiaGFzRm9jdXMiLCJzdGFydElucHV0IiwiaW5wdXRSYW5nZSIsImN1cnNvcklkIiwic3RyIiwicG9zIiwic3RhcnRYIiwibW92ZVgiLCJkZWJ1Z0lucHV0IiwiaXNMb29wIiwibGlzdGVucyIsImUiLCJjbGllbnRYIiwiY2xpZW50WSIsImtleUNvZGUiLCJkZWx0YSIsImlzTW9iaWxlIiwiYWRkIiwidGVzdE1vYmlsZSIsInJlbW92ZSIsImluaXRFdmVudHMiLCJkb2N1bWVudCIsIndpbmRvdyIsInJlbW92ZUV2ZW50cyIsInJlc2l6ZSIsInUiLCJoYW5kbGVFdmVudCIsImZpbmRJRCIsIngiLCJ5IiwiY2xlYXJPbGRJRCIsImNhbGNVaXMiLCJ1aXMiLCJ6b25lIiwibXkiLCJweCIsInB5IiwiZmluZFRhcmdldCIsImZpbmRab25lIiwib25ab25lIiwibXgiLCJ6IiwiZ2V0Wm9uZSIsInRvcCIsInRvQ2FudmFzIiwiY2xlYXJUaW1lb3V0IiwiaW1nIiwiY3R4Iiwic2V0SGlkZGVuIiwidHh0IiwiY2xlYXJIaWRkZW4iLCJjbGlja1BvcyIsInVwSW5wdXQiLCJ1cCIsInNlbGVjdFBhcmVudCIsInRleHRXaWR0aCIsImNsZWFySW5wdXQiLCJzZXRJbnB1dCIsImtleWRvd24iLCJrZXl1cCIsImxvb3AiLCJ1cGRhdGUiLCJyZW1vdmVMaXN0ZW4iLCJhZGRMaXN0ZW4iLCJSb290cyIsIlYyIiwiUHJvdG8iLCJzYSIsInNiIiwic2MiLCJiZyIsImYiLCJzeCIsIkJvb2wiLCJCdXR0b24iLCJsbmciLCJzdGF0IiwiY2hhbmdlIiwicmVhZGVyIiwiZGMiLCJ0bXAiLCJDaXJjdWxhciIsImxlZnQiLCJvZmYiLCJkaWYiLCJhYnMiLCJvbGQiLCJDb2xvciIsImN3IiwidHIiLCJyciIsImh1ZSIsInNldEhTTCIsImhzbCIsInJhdGlvIiwicmFkIiwiYXRhbjIiLCJyYWQwIiwicmFkMSIsIm1heFIiLCJyYWQyIiwiYXRhbiIsImx1bSIsInRzbCIsInNhdCIsImh4IiwiaHkiLCJzeSIsInZ4IiwidnkiLCJGcHMiLCJub3ciLCJmcHMiLCJtZW0iLCJwdXNoIiwicmVzIiwiYmFzZSIsIm1zIiwibW0iLCJHcmFwaCIsInJoIiwiZ2giLCJndyIsIml3IiwibmVnIiwibnVwIiwid20iLCJ3biIsIm93Iiwib2giLCJHcm91cCIsImNsb3NlIiwidG1waCIsImlzVUkiLCJ0YXJnZXQiLCJtYWluIiwicG9wIiwicHJvdG90eXBlIiwiaXNHcm91cCIsIkpveXN0aWNrIiwiY2xlYXJJbnRlcnZhbCIsImxlcnAiLCJkcmF3IiwiS25vYiIsInd3Iiwic3RlcCIsInJhbmdlIiwiTGlzdCIsImJhc2VIIiwiaXRlbSIsIm9wZW4iLCJsaXN0Iiwic2VuZCIsInNoIiwiTnVtZXJpYyIsInZhbCIsIlNsaWRlIiwiaDIiLCJyYSIsImgxIiwidHgiLCJUZXh0SW5wdXQiLCJUaXRsZSIsIlNlbGVjdCIsIlNlbGVjdG9yIiwic2VsIiwibW9kZSIsIkVtcHR5IiwiSXRlbSIsIkdyaWQiLCJ0ZCIsInN0eWxlIiwiYnNpemUiLCJyYWRpdXMiLCJ0eSIsInRtcFgiLCJyZWYiLCJHdWkiLCJjbiIsInN3IiwiYmgiLCJveSIsIm0iLCJuZWVkQ2hhbmdlIiwicjIiLCJjYWxjIiwiaGhoIiwiaXNHdWkiLCJSRVZJU0lPTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0NBQUE7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBRUEsSUFBSUEsT0FBTyxHQUFJLFVBQVVDLE9BQVYsRUFBbUI7O0NBR2hDLGlCQUFlLFVBQWY7Q0FDQSxpQkFBZSxlQUFmO0NBQ0EsaUJBQUE7O0NBQ0EsMERBQUE7Q0FDQSw4QkFBNEIseUJBQTVCO0NBQ0EsbUNBQWlDLG1DQUFqQztDQUNBLGlDQUErQiwrQkFBL0I7O0NBRUEsaUJBQUE7Q0FDRUMsNkJBQUEsS0FBQTtDQUNFQztDQUNBQztDQUNBQztDQUNBQztDQUo4QixLQUFoQztDQU1BLGtCQUFVO0NBQ1g7O0NBQ0Q7Q0FDRTtDQUNBQyxXQUFPLEVBQUQsRUFBSyxFQUFMO0NBQ1AsR0FIRDtDQUlFQSxnQ0FBUyxLQUFBLE9BQUE7Q0FDUCxhQUFPQyxJQUFJQyxJQUFKO0NBQ1I7Q0FDRjs7Q0FFRCxlQUFBO0NBQ0U7Q0FDQTtDQUNBLDBEQUFnQjtDQUNoQiw2Q0FBeUMsRUFBM0I7Q0FHZDs7Q0FDQUMsZ0RBQW9DLE1BQUEsU0FBQTtDQUVwQztDQUNEOztDQUNEVCxTQUFPLFlBQVA7Q0FHQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7O0NBQ0EsbUJBQUE7Q0FDRTtDQUNFO0NBQVNVLFFBQUFBO0NBQWdCQyxXQUFHLEtBQUtDLElBQUgsTUFBYUQ7Q0FBcEM7Q0FDUixnQkFBQztDQUNBO0NBQVNELFFBQUFBO0NBQWVDO0NBQWpCO0NBQ1I7Q0FDRjs7Q0FFRCwrQ0FBQTtDQUNBLCtDQUFBO0NBQ0EscUNBQUE7Q0FDQSxxQ0FBQTtDQUdBOztDQUNBLDJCQUFBO0NBR0E7Q0FDQTtDQUNBOztDQUNBLHdCQUF1Qjs7Q0FDdkIsZ0NBQStCOztDQUMvQix5Q0FBd0M7Q0FHeEM7OztDQUNBLDRCQUFBOztDQUNBRSxtQkFBaUIsZUFBQTtDQUNmO0NBQ0QsR0FGRDs7Q0FJQSx1QkFBcUIsZUFBckI7Q0FDQSxvREFBa0QsU0FBUyxPQUFPLEdBQUEsQ0FBUCxDQUFULENBQWxEOztDQUNBLHlFQUVVLEtBQU4sd0NBQUE7Q0FDRjtDQUNBO0NBQ0FBO0NBQ0Q7O0NBRUQscUNBQW1DLHNCQUN4QixtQkFBbUIsT0FBTixrQkFBQSxDQUR4QjtDQUVBQyxtQkFBaUIsZUFBZSx5Q0FBaEM7Q0FDQUMsNEJBQTBCLGdDQUExQjtDQUNBRCxtQkFBaUIscUJBQXFCLG1FQUFBLENBQXRDO0NBT0E7O0NBQ0EsZ0NBQUE7Q0FDRSxXQUFBLFNBQUEsVUFBQSwwQkFBb0M7Q0FDbENSLDBDQUFtQ0s7Q0FDakMsZUFBTyxxQkFBcUJBO0NBQzdCO0NBQ0YsS0FKRDtDQUtEOztDQUVEWCxTQUFPO0NBQ0w7Q0FDQTtDQUdJO0NBQ0E7Q0FFTCxHQVJEOztDQVVBQSxTQUFPO0NBQ0wsNkJBQUE7Q0FDRUM7Q0FDRDtDQUNDZSxzQkFBQTtDQUNBVjtDQUNEOztDQUNEVSxxQ0FBaUNDLEVBQWQ7Q0FDbkI7Q0FDRCxHQVREO0NBWUE7Q0FDQTtDQUNBOzs7Q0FDQWpCLFNBQU87Q0FDTDtDQUFTa0IsZUFBU1A7Q0FBWDtDQUNSLEdBRkQ7O0NBSUEsd0JBQUE7Q0FDRSwwQkFBQSxLQUFBLFNBQUEsUUFBQTtDQUNFLGdCQUFVLDRCQUFxQixjQUFxQkE7O0NBQ3BEO0NBQ0VRLHFCQUFhLENBQUNSO0NBQ2Y7Q0FDQywyQkFBbUIsQ0FBQ0E7Q0FDcEI7O0NBQ0EsaUJBQVMsNkJBQUwsV0FFT0M7Q0FDVCxxQ0FBMkJWLGVBQWVrQixlQUFjbEI7Q0FDdERtQixZQUFBQSxPQUFPLHdCQUF3QkY7Q0FDaEMsdUJBQVdHO0NBQ1ZELFlBQUFBLDhCQUE4QkY7Q0FDL0I7Q0FDRjs7Q0FFRCwwQ0FBa0NDO0NBQ2hDO0NBQ0E7Q0FDQTtDQUNBRyxpQkFBT3JCO0NBQ1BzQjtDQUNEO0NBQ0M7Q0FDQTtDQUNBLGlDQUF1QkM7Q0FDeEI7Q0FDRjtDQUNGOztDQUVEOztDQUVBLDJCQUFBLEtBQUE7Q0FDRSx5Q0FBQTtDQUNFLGVBQU87Q0FDTEosdUJBQU0sRUFBU1Y7Q0FDaEI7Q0FDRjs7Q0FFRDtDQUVFO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQWUscUJBQWU7Q0FHYjtDQUNBQyxpQ0FKYSw2QkFLZTtDQUNqQztDQUdEOzs7Q0FDQTtDQUNEOztDQUVEQyx1QkFBcUIsY0FBYyxVQUFkLENBQXJCOztDQUNBQyxlQUFhLFVBQWIsb0JBQUE7Q0FDRTtDQUNELEdBRkQ7O0NBR0E3QixTQUFPLDhCQUFQO0NBR0E7Q0FDQTs7Q0FDQUEsU0FBTztDQUNMLDhCQUFBO0NBRUEsNkNBQ00sU0FBQSxNQUFBLGNBREssYUFBQTtDQUtYO0NBQU8sZUFFSCx3QkFBaUI7Q0FDZix3QkFBTyxlQUFBLFlBQTZCO0NBQ3JDLEtBRkQ7Q0FHTCxHQWJEOztDQWVBLDJCQUFBO0NBQ0U7Q0FFQSxpQ0FBTyxLQUFBO0NBQ0w7Q0FDRSxjQUFNO0NBQ1A7O0NBRUQ7Q0FDRTtDQUNFO0NBQ0Q7Q0FHRDs7O0NBQ0E7Q0FDRDs7Q0FFRDhCLG9CQUFBO0NBQ0FBLGNBQVFuQixHQUFSLEdBQWNBOztDQUVkO0NBQ0U7O0NBQ0E7Q0FDRTs7Q0FDQTtDQUNFO0NBQ0E7Q0FDRDtDQUNGOztDQUVEO0NBQ0U7Q0FDQTtDQUNBbUIsaUJBQU8sZ0JBQWdCQyxlQUFlO0NBRXZDLGVBQU07Q0FDTCxjQUFJQyxLQUFLO0NBQ1BBO0NBQ0E7Q0FDRDs7Q0FFREYsMkNBQWlDLENBQUNuQjtDQUVuQyxlQUFNO0NBQ0xtQiwwQ0FBZ0MsQ0FBQ25CO0NBQ2xDOztDQUVEcUI7Q0FFQSx1Q0FBK0JDOztDQUMvQixtQkFBV3ZCO0NBQ1Q7Q0FDQTtDQUNBc0IsVUFBQUEsZUFBZTs7Q0FJZix3QkFBSTtDQUNGO0NBQ0Q7O0NBRUQ7Q0FDRTlCLG1CQUFPZ0M7Q0FDUEMsWUFBQUE7Q0FGSztDQUtSLGVBQU0sV0FBV3pCO0NBQ2hCc0IsVUFBQUE7Q0FFQTs7Q0FDQUY7Q0FDQUEsOEJBQW9CO0NBQ3JCO0NBQ0Y7Q0FDRjtDQUNGO0NBR0Q7Q0FDQTtDQUNBOzs7Q0FDQSw4QkFBQTtDQUNFLGlEQUFhOztDQUNiLDhCQUFBO0NBQ0U7Q0FDQTtDQUNBQSxzQkFBQTs7Q0FFQTtDQUNFO0NBQ0E7Q0FDRTtDQUNBO0NBQ0FBO0NBQ0FBO0NBQ0FNOztDQUVBLDRCQUFJO0NBQ0Y7Q0FDQTtDQUNBO0NBQ0Q7Q0FDRjs7Q0FFRE47Q0FDQUEsZUFBTyxPQUFPO0NBRWY7O0NBRUQ7Q0FDRDs7Q0FFRCxnQ0FBcUIsbUJBQUEsYUFBQTs7Q0FFckIsK0JBQUE7Q0FDRUEsb0JBQUE7Q0FDQUEsY0FBUW5CLEdBQVIsVUFBcUJBO0NBQ3JCbUIsc0JBQUE7Q0FDQTtDQUNEOztDQUVEOztDQUVBLGFBQUE7Q0FDRUEsb0JBQUE7Q0FDQUEsY0FBUW5CLEdBQVI7Q0FDQW1CLHNCQUFBO0NBQ0E7Q0FDRDs7Q0FFRCxpQkFBQTtDQUNFO0NBQ0E7Q0FDQUEsa0NBQUE7O0NBR0FBLGtCQUFBO0NBR0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTs7Q0FDQTtDQUNFQTtDQUNBQSxlQUFPO0NBQ1I7Q0FFRjtDQUNDO0NBQ0E7Q0FDRDtDQUdEOzs7Q0FDQUE7Q0FDQTtDQUNEO0NBR0Q7OztDQUNBRix1QkFBcUIsR0FBQSxDQUFyQjtDQUVBdEIsUUFBTSxtQ0FBQSxDQUFOO0NBR0E7Q0FDQTtDQUNBO0NBQ0E7O0NBQ0FXLElBQUUsZUFBQTtDQUNBO0NBQ0QsR0FGRDs7Q0FJQUEsSUFBRTtDQUNBO0NBQ0QsR0FGRDs7Q0FJQSx1QkFBQTtDQUNFO0NBQWNvQixrQkFBWTtDQUFkOztDQUVaLGlCQUFBO0NBQ0VDLG9CQUFBLE9BQXFCLENBQUM7Q0FDdkI7O0NBRUQsaUJBQUE7Q0FDRUEsc0JBQUEsT0FBdUIsQ0FBQztDQUN4QkEsb0JBQUEsT0FBcUIsQ0FBQztDQUN2Qjs7Q0FFRCw4QkFBQTtDQUNEOztDQUVELHdCQUFBO0NBQ0UscUNBQWlDO0NBQ2pDSjtDQUNBO0NBQ0FJO0NBQ0Q7O0NBRUQsa0JBQUE7Q0FDRTtDQUNBO0NBQ0E7Q0FDQTtDQUFxQkQ7Q0FBRixLQUFEO0NBQ2xCRSxvQ0FBQSxNQUFBO0NBQ0EsbUJBQUE7Q0FDRDs7Q0FFRHZDLFNBQU87Q0FDTCxlQUFXOztDQUNYLDBCQUFBO0NBQ0V3QyxnQkFBVWhDO0NBQ1g7O0NBQ0RnQyxnQkFBQTtDQUdBOztDQUNBO0NBQ0U7Q0FDRSxrQkFBVUEsSUFBSTs7Q0FDZCxlQUFPO0NBQ0xDLFVBQUFBLEtBQUt2QztDQUNMdUMsVUFBQUEsSUFBSSxRQUFRO0NBQ1osaUJBQU9BO0NBQ1I7Q0FDRjtDQUdEO0NBQ0E7OztDQUNBQSxlQUFBO0NBQ0E7Q0FDRDtDQUNGLEdBekJEOztDQTJCQSxpQkFBQTtDQUNFLGdCQUFBO0NBQ0Usd0JBQWtCOztDQUNsQjtDQUNFLDhCQUFzQjdCO0NBQ3ZCOztDQUVEO0NBQ0U7Q0FDRDs7Q0FFRCxnQ0FBVTtDQUNSLFlBQUk4QixDQUFDO0NBQUw7Q0FDRTtDQUNFLGdCQUFJQyxNQUFNLGNBQU47Q0FDRkY7Q0FDQUEsbUJBQUtOO0NBQ0w7Q0FDRDtDQUNGOztDQUVETSxVQUFBQSxLQUFLdkM7Q0FDTHVDLFVBQUFBLElBQUksUUFBUTtDQUVaLGlCQUFPQTtDQUNSOztDQUVELGVBQU9BLEtBQUtBLE9BQU9BO0NBQ3BCO0NBQ0Y7OztDQUdEO0NBQVNBO0NBQUY7Q0FDUjs7Q0FDRHpDLFNBQU8sZ0JBQVA7O0NBRUE7Q0FDRTtDQUFTRTtDQUFrQmlDO0NBQXBCO0NBQ1I7O0NBRURTLFNBQU87Q0FDTEMsZUFBVztDQUVYQyxTQUFLLDhCQUFFO0NBQ0wsZUFBQTtDQUNBLGVBQUE7Q0FFQTs7Q0FDQSxlQUFBLGFBQVlDO0NBQ1osZUFBQTtDQUNBLG1CQUFBO0NBRUEsaUJBQUE7Q0FDQSxXQUFLcEMsR0FBTG9DO0NBRUE7O0NBRUE7Q0FDRSxhQUFLLElBQUlDLElBQVQsSUFBaUI7Q0FDZjtDQUNBLGNBQUlBLGdDQUNNLENBQUNwQyxJQUFQLE9BQWtCb0MsSUFBbEIsQ0FEQSxLQUVDQyxNQUFNLENBQUNELEtBQUtFLE1BQU07Q0FDckI7Q0FDRDtDQUNGO0NBQ0Y7Q0FDRjtDQUVEQyxRQUFJO0NBQ0YsZUFBQTtDQUVBLG1CQUFhLGtCQUFHLENBQWdCO0NBQ2hDLG9CQUFjOztDQUNkO0NBQ0Usd0JBQWdCLENBQUN4QztDQUNsQjs7Q0FFRDtDQUNEO0NBRUR5QyxxQkFBaUIsc0NBQUU7Q0FDakI7Q0FDRTtDQUNEOztDQUVELGlCQUFXOztDQUNYLHNCQUFnQkM7Q0FDZG5CLGVBQU94QjtDQUNQd0IsY0FBTTtDQUNOSixnQkFBUVcsT0FBT1k7O0NBRWY7Q0FDRTtDQUNBO0NBQ0F2QjtDQUNBQTtDQUNEOztDQUVEO0NBQ0Q7O0NBRUQsZ0JBQVUseUJBQUcsR0FBeUIsQ0FBdEMsT0FBOEMsR0FBRyxFQUFFWTtDQUNqRCxvQkFBWSxlQUFBO0NBQ1o7O0NBRUE7Q0FDRTtDQUNBO0NBQ0E7Q0FDQSx3QkFBYztDQUNmOztDQUVELHdCQUFJLElBQWdCLEtBQUtZO0NBQ3ZCLCtCQUFxQixDQUFDMUMsS0FBSzBCO0NBQzNCLGlDQUF1QixDQUFDMUIsS0FBSzBCOztDQUU3QjtDQUNFLDRCQUFnQkE7Q0FDZCxxQkFBT2lCLE1BQU0sZUFBQTtDQUNkLGFBRkQsc0JBRXVCakI7Q0FDckIscUJBQU9pQixNQUFNO0NBQ2Q7Q0FFRjtDQUNDLDRCQUFnQmpCO0NBQ2QscUJBQU9pQixNQUFNLGVBQUE7Q0FDZDtDQUVGO0NBQ0MsNEJBQWdCakI7Q0FDZCxxQkFBT2lCLE1BQU07Q0FDZDtDQUVGO0NBQ0Msc0JBQVVDO0NBQ1g7Q0FDRjtDQUNGO0NBQ0Y7Q0FFREMsVUFBTSxzQkFBRSxLQUFBO0NBQ04sZ0JBQVUseUJBQUcsR0FBeUIsQ0FBdEMsT0FBOEMsR0FBRyxFQUFFZjtDQUNqRCxvQkFBWSxlQUFBOztDQUNaLHdCQUFJLElBQWdCLEtBQUtZLElBQXJCLFdBQ08xQyx5QkFEUCxJQUVBLEtBQUswQztDQUNQLDZCQUFtQmhCO0NBQ25CO0NBQ0Q7Q0FDRjs7Q0FFRCw4RkFHMkIzQixPQUN2QkE7Q0FDRjtDQUNBO0NBQ0ErQyx1QkFBZTtDQUNoQjs7Q0FFRCxnQkFBVSxlQUFlLDBCQUFBLEdBQTZCO0NBQ3REeEIsaUJBQUE7Q0FDQUEsYUFBT3ZCLEdBQVAsR0FBYUE7O0NBRWI7Q0FDRTtDQUNBLGFBQUs4QjtDQUNMO0NBQ0Q7O0NBRUQ7Q0FDRDtDQUVEa0IsWUFBUSwwQkFBRSxVQUFBO0NBQ1I7Q0FDRSxvQkFBWSxDQUFDaEQ7Q0FDZDs7Q0FFRDtDQUVFLGFBQUs4QixhQUFhLENBQUM5QjtDQUNwQjtDQUNDLGFBQUtpRCxPQUFPLGlCQUFpQixDQUFDakQ7Q0FDOUI7Q0FDQSxhQUFLOEI7Q0FDTjtDQUNDLGFBQUtBO0NBQ047O0NBRUQ7Q0FDRDtDQUVEb0IsVUFBTSw0QkFBRTtDQUNOLGdCQUFVLHlCQUFHLEdBQXlCLENBQXRDLE9BQThDLEdBQUcsRUFBRW5CO0NBQ2pELG9CQUFZLGVBQUE7O0NBQ1o7Q0FDRSx3QkFBY0osa0JBQWtCQTtDQUNoQ3dCLHdCQUFjeEI7Q0FDZDtDQUNEO0NBQ0Y7Q0FDRjtDQUVELG1DQUFTO0NBQ1AsZ0JBQVUseUJBQUcsR0FBeUIsQ0FBdEMsT0FBOEMsR0FBRyxFQUFFSTtDQUNqRCxvQkFBWSxlQUFBOztDQUNaO0NBQ0UsdUJBQWFKOztDQUNiLG9CQUFVLEtBQU47Q0FDRixnQkFBSXlCLFNBQVM3QjtDQUNiNEIseUJBQWEsQ0FBQ3hCO0NBQ2Y7O0NBQ0Q7Q0FDRDtDQUNGO0NBR0Q7OztDQUNBO0NBQ0Q7Q0FFRDBCLGlCQUFhLGlDQUFFLFlBQUEsU0FBQTtDQUNiLG1CQUFBO0NBQ0VDO0NBQ0FDO0NBQ0FDO0NBSGM7O0NBTWhCO0NBQ0U7Q0FDQTtDQUNBO0NBQ0Q7O0NBRUQ7Q0FDRDtDQXJNaUIsR0FBcEI7Q0F5TUE7Q0FDQTtDQUNBOztDQUNBLGdCQUFBO0NBRUQsQ0Evc0JjO0NBaXRCYjtDQUNBO0NBQ0E7Q0FDQSxPQUFPQyxNQUFQLEtBQWtCLFFBQWxCLEdBQTZCQSxNQUFNLENBQUNwRSxPQUFwQyxHQUE4QyxFQXB0QmpDLENBQWY7O0NBdXRCQSxJQUFJO0NBQ0ZxRSw4QkFBQTtDQUNELENBRkQsQ0FFRSxPQUFPQyxvQkFBUCxFQUE2QjtDQUM3QjtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQUMsVUFBUSw4QkFBQSxDQUFSLFFBQUE7Q0FDRDs7Q0MzdUJEO0NBQ0E7Q0FDQTtDQUVBLElBQU1DLENBQUMsR0FBRztDQUVOQyxnQkFBYztDQUVkQztDQUNBQztDQUNBQztDQUNBQztDQUNBQztDQUVBQztDQUNBQztDQUNBQztDQUVBQyxZQUFVLGtIQUFBO0NBQ1ZDLGNBQVkseUlBQUE7Q0FDWkMsY0FBWSxpRkFBQTtDQUVaQyxVQUFRO0NBQ1JDLGFBQVcsTUFBSTtDQUNmQyxZQUFVO0NBQ1ZDLFlBQVUsTUFBSTtDQUVkQyxhQUFXO0NBQ1hDLG1CQUFpQjtDQUVqQkMsd0JBQWlCQztDQUViQSx3QkFBb0JBO0NBQ3BCQSx3QkFBb0JBO0NBQ3BCLFdBQU9BO0NBRVY7Q0FFREM7Q0FBU0MsS0FBQztDQUFPQyxLQUFDLEVBQUU7Q0FBSUMsS0FBQyxFQUFFO0NBQUlDLEtBQUMsRUFBRTtDQUE1QjtDQUVOO0NBQ0E7Q0FDQTtDQUVBQztDQUVJLFFBQUlDLG1CQUFtQixFQUFkLEVBQWtCM0IsUUFBbEI7Q0FDVCxXQUFPMkI7Q0FFVjtDQUVEQztDQUVJLFFBQUlELG1CQUFtQixFQUFkLEVBQWtCM0IsS0FBbEI7Q0FDVCxXQUFPMkI7Q0FFVjtDQUVERTtDQUVJQyxRQUFJO0NBQ0pDLFlBQVE7Q0FDUkMsZUFBVztDQUVYQyxjQUFVO0NBQ1ZDLGtCQUFjO0NBRWQ7Q0FFQUMsZUFBVztDQUNYQyxlQUFXO0NBQ1hDLHFCQUFpQjtDQUNqQkMsV0FBTztDQUNQQyxhQUFTO0NBRVRDLFVBQU07Q0FDTkMsY0FBVTtDQUNWQyxnQkFBWTtDQUVaQyxjQUFVO0NBQ1ZDLGtCQUFjO0NBRWRDLFVBQU07Q0FDTkMsVUFBTTtDQUNOQyxVQUFNO0NBRU5DLFVBQU07Q0FDTkMsVUFBTTtDQUNOQyxRQUFJO0NBQ0pDLFFBQUk7Q0FDSkMsVUFBTTtDQUVOQyxVQUFNO0NBQ05DLFVBQU07Q0FFTkMsUUFBSTtDQUVKQyxlQUFXO0NBQ1hDLGdCQUFZO0NBeENSO0NBNENSO0NBRUFDO0NBQ0k7Q0FDQUMsU0FBSztDQUNMZCxVQUFNO0NBSEo7Q0FNTjtDQUVBZTtDQUVJQyxTQUFLO0NBQ0xDLFNBQUs7Q0FDTEMsYUFBUztDQUNUQyxXQUFPO0NBRVBDLFNBQUs7Q0FDTEMsUUFBSTtDQUNKQyxXQUFPO0NBQ1BDLGdCQUFZO0NBQ1pDLGFBQVM7Q0FDVEMsV0FBTztDQUNQQyxTQUFLO0NBQ0xDLE9BQUc7Q0FDSEMsYUFBUztDQUNUQyxPQUFHO0NBQ0hDLFlBQVE7Q0FDUkMsV0FBTztDQUNQQyxVQUFNO0NBQ05DLFFBQUk7Q0FDSkMsVUFBTTtDQXJCSjtDQXlCTjtDQUVBQztDQUVJM0QsbUJBQWU7Q0FDZjREO0NBQ0FDOztDQUVBckQsdUJBQW1CN0I7Q0FDbkIwRCxpQkFBYTFEO0NBRWI2QjtDQUNBNkI7Q0FDQSxjQUFBOztDQUNBQTtDQUNBQTtDQUVIO0NBRUR5Qix3QkFBa0JDO0NBRWQsV0FBT0EsZ0JBQUE7Q0FFVjtDQUVEQztDQUVJLFFBQUlDLE9BQU8sRUFBWCx5QkFBZ0IsTUFBQSxPQUFBLDRCQUNYLGlCQUF3Q0EsTUFBTSxDQUF0QixvQkFBNkMsQ0FBN0MscUJBQUEsTUFBQSxPQUFBLHNCQUNSQSxNQUFNLENBQXRCLHFCQUFBLE1BQUEsT0FBQTtDQUVSO0NBRURDO0NBRUkscUJBQUE7Q0FDSSw0QkFBSSxTQUEyQixHQUFJQyxTQUFBLE1BQWU5QixHQUFHLEdBQUgsYUFDN0M4QixTQUFBLE1BQWU5QixHQUFHLENBQUMrQjtDQUMzQjtDQUVKO0NBRURDLG9CQUFlQyxHQUFHUDtDQUVkLHFCQUFBO0NBQ0ksVUFBSVEsYUFBSixlQUFvQixLQUFtQkE7Q0FDdkMsVUFBSUEsY0FBSixrQkFBcUIsc0JBQUEsSUFBNENBLEdBQUYsK0JBQ2xDQSxHQUF4QixJQUFnQ0EsR0FBRjtDQUN0QztDQUVKO0NBRURDO0NBRUksUUFBSVAsZ0JBQUo7Q0FBQSxvQkFDaUJBLEdBQVosd0JBQTBDQSxFQUFoQjtDQUExQjtDQUVELHVCQUFHLDZCQUF3QixDQUFnQkEsRUFBRSxlQUFsQixDQUFvQ0EsRUFBRTtDQUNqRSx1QkFBRyw2QkFBd0IsQ0FBZ0JBLEVBQUUsZUFBbEIsQ0FBb0NBLEVBQUUsZUFBdEMsQ0FBd0RBLEVBQUU7Q0FDeEY7Q0FFSjtDQUVERTtDQUVJdEo7O0NBRUEsUUFBSThELCtCQUErQixNQUFNQSwrQkFBK0IsRUFBeEU7Q0FBOEU7Q0FFMUU7Q0FFSXdGLFFBQUFBO0NBQ0F4RixTQUFDLENBQUMwRixJQUFLRixNQUFLeko7Q0FFbEI7Q0FDVjtDQUNBO0NBQ0E7Q0FFYTtDQUNHO0NBQ0EsWUFBSXlKLG9CQUFvQkE7Q0FDeEJ4Rix3QkFBaUJ3RixNQUFLdEosU0FBdEIsRUFBaUNvSjtDQUVwQztDQUVKO0NBQVE7Q0FFTCxrQ0FBMkIsMkJBQUcseUJBQ3RCLDRDQUFvQixjQUFBO0NBRS9COztDQUVELFdBQUE7Q0FFQSxRQUFJQSxnQkFBSiwwQ0FDNEJBLE1BQU0sQ0FBdEI7Q0FFZjtDQUVEUSxtREFBcUNWO0NBRWpDLG9DQUFRLENBQTBCcEYsT0FBMUIsTUFBQTtDQUNSQSxJQUFBQSxLQUFBLEVBQUEsRUFBVW9GLENBQVY7Q0FDQXBGLElBQUFBLFNBQUEsRUFBWXNGLEVBQVosYUFBQSxDQUE4QkssQ0FBOUI7Q0FDQSxRQUFJM0YsK0JBQStCLEVBQW5DLEVBQXdDMkY7Q0FDeEMsV0FBT0E7Q0FFVjtDQUVESTtDQUVJL0YsSUFBQUEsV0FBQTs7Q0FDQSx5QkFBQTtDQUNJLFVBQUt3Rix5QkFBTCxVQUEwQ0E7Q0FDMUNBLE1BQUFBLGdCQUFpQkE7Q0FDcEI7Q0FFSjtDQUVEUTtDQUVJO0NBQUE7Q0FBQTs7Q0FDQSxTQUFBO0NBQ0k5SCxPQUFDOztDQUNELGFBQU1BO0NBQ0YrSCxRQUFBQSxDQUFDLEdBQUdDLENBQUMsSUFBSTFIO0NBQ1QsbUJBQVdnSCx1QkFBdUJBLEtBQUcsSUFBTTtDQUM5QztDQUNKOztDQUNEVTs7Q0FDQSxTQUFBO0NBQ0loSSxPQUFDOztDQUNELGFBQU1BO0NBQ0Y4QixlQUFBLENBQVN3RixjQUFBLENBQWV0SDtDQUMzQjtDQUNKO0NBRUo7Q0FFRDtDQUNBO0NBQ0E7Q0FFQWlJLHFDQUE0QkM7Q0FFeEIsbUJBQUE7O0NBR0FDLG9CQUFZLHVCQUFOLEVBQW1DLEVBQW5DOztDQUNOLHNCQUFBO0NBQ0lBLE1BQUFBLEdBQUcsR0FBR0EsR0FBRyxHQUFILEdBQU9BLEdBQUcsR0FBVixHQUFjQSxHQUFHLEdBQWpCLEdBQXFCQSxHQUFHLEdBQXhCLEdBQTRCQSxHQUFHLEdBQS9CLEdBQW1DQSxHQUFHLENBQUM7Q0FDaEQ7O0NBQ0RELGFBQVM7O0NBR1Q7Q0FBQTtDQUFBOztDQUNBLGNBQUEsT0FBQSxHQUFvQixFQUFwQjtDQUNJRSxPQUFDLFlBQVlELFlBQVksR0FBQyxDQUFiLEdBQUEsR0FBbUI7Q0FDaENDLE9BQUMsbUJBQW1CQyxTQUFTQyxJQUFJLENBQVQsR0FBYSxJQUFLLElBQWxCLEdBQTBCLEdBQW5DLFdBQVgsQ0FBNkQ7Q0FDakVDLE1BQUFBLGVBQWFILFNBQU47Q0FDVjs7Q0FFRDtDQUVIO0NBRURJLHdDQUEwQko7Q0FFdEIsV0FBUUEsQ0FBQyxDQUFDLFdBQVdBLENBQUMsQ0FBQyxXQUFXQSxDQUFDLENBQUM7Q0FFdkM7Q0FHREssZ0NBQXNCdkY7Q0FDbEJBLHFDQUFpQ0E7Q0FDakMsNkJBQXlCQSxXQUFXLEdBQXZCLFFBQUEsQ0FBbUMsQ0FBQyxDQUFwQztDQUVoQjtDQUVEd0YsZ0NBQXNCeEY7Q0FFbEIsV0FBT0EsYUFBQSxjQUFBLE1BQUE7Q0FFVjtDQUVEeUYsc0JBQWdCUCxHQUFHcEk7Q0FFZixtQkFBZSxDQUFDb0ksV0FBQSxFQUFBLE1BQW1CLEVBQXBCLEVBQXdCO0NBRTFDO0NBRURRLG9CQUFnQlIsR0FBR3BJO0NBRWYsbUJBQWUsQ0FBQ29JLFdBQUEsRUFBQSxNQUFtQixFQUFwQixFQUF3QixNQUFNO0NBRWhEO0NBRURTLDBCQUFrQlQ7Q0FFZCxRQUFJQSxhQUFKLFNBQTBCLENBQUV0RyxNQUFBLEVBQUEsRUFBVSxFQUFaLEVBQWdCQSxNQUFBLEVBQUEsRUFBVSxFQUExQixFQUE4QkEsTUFBQSxFQUFBLEVBQVUsQ0FBVixDQUE5QixXQUNqQnNHLGFBQUosU0FBMEIsQ0FBRXRHLEtBQUEsRUFBQSxFQUFRLEVBQVYsRUFBY0EsS0FBQSxFQUFBLEVBQVEsRUFBdEIsRUFBMEJBLEtBQUEsRUFBQSxFQUFRLENBQVIsQ0FBMUI7Q0FFbEM7Q0FFRGdILDRCQUFtQlY7Q0FFZiw4QkFBZ0IsQ0FBV0EsQ0FBQyxDQUFDLDRCQUFpQixDQUFXQSxDQUFDLENBQUMsNEJBQWlCLENBQVdBLENBQUMsQ0FBQztDQUU1RjtDQUVEVyxvQkFBZWhCO0NBQ1gsUUFBR0EsYUFBSCxZQUEyQkE7Q0FDM0IsV0FBT0E7Q0FDVjtDQUVEaUIsOEJBQXFCWjtDQUVqQixzQkFBUSxDQUFXQSxDQUFDLENBQUMsUUFBYixXQUFnQyxFQUFoQztDQUNSLHNCQUFRLENBQVdBLENBQUMsQ0FBQyxRQUFiLFdBQWdDLEVBQWhDO0NBQ1Isc0JBQVEsQ0FBV0EsQ0FBQyxDQUFDLFFBQWIsV0FBZ0MsRUFBaEM7Q0FDUixpQkFBYXRHLEtBQUEsQ0FBTXlGLEtBQUt6RixLQUFBLENBQU0yRixLQUFLM0YsS0FBQSxDQUFNbUgsQ0FBTjtDQUl0QztDQUVEQyw4QkFBb0I1RixHQUFHNkYsR0FBR0M7Q0FFdEIsYUFBQSxPQUFrQjtDQUNsQixhQUFBLE9BQWtCO0NBQ2xCLGlCQUFBLGFBQTRCLGNBQWdCQTtDQUM1QyxpQkFBQSxTQUF3QkQ7Q0FDeEIsaUJBQUEsYUFBNEIsdUJBQTBCQyxDQUExQjtDQUM1QixXQUFPOUY7Q0FFVjtDQUVEK0YsOEJBQXFCakI7Q0FFakIsWUFBUUEsQ0FBQyxDQUFDO0NBQVYsUUFBY1gsQ0FBQyxHQUFHVztDQUFsQixRQUF3QmEsQ0FBQyxHQUFHYjtDQUE1QixjQUF3Q2tCLElBQUksQ0FBQ2pCLEdBQUwsQ0FBU2QsR0FBR0UsQ0FBWjtDQUF4QyxjQUFpRTZCLElBQUksQ0FBQ2hCLEdBQUwsQ0FBU2YsR0FBR0UsQ0FBWjtDQUFqRTtDQUFBLFFBQXVHcEUsQ0FBQztDQUF4RyxRQUE4R0UsQ0FBQztDQUEvRyxRQUFxSDJFLENBQUMsR0FBRyxVQUFBO0NBQ3pILHNCQUFBLHlDQUE4REEsQ0FBakM7O0NBQzdCLGlCQUFBO0NBQ0ksVUFBSUksWUFBWUEsT0FBT2IsQ0FBdkIsU0FBaUM7Q0FDakMsVUFBSWEsWUFBWUEsT0FBT1csQ0FBdkIsYUFBc0M7Q0FDdEMsVUFBSVgsWUFBWUEsT0FBT2YsQ0FBdkIsYUFBc0M7Q0FDdENsRTtDQUNIOztDQUNELFdBQU8sRUFBQSxHQUFBLEVBQVE2RSxDQUFSO0NBRVY7Q0FFRHFCLDhCQUFxQm5CO0NBRWpCO0NBQUE7Q0FBQSxRQUFVL0UsQ0FBQyxHQUFHK0U7Q0FBZCxRQUFvQjdFLENBQUMsR0FBRzZFO0NBQXhCLFFBQThCRixDQUFDLEdBQUdFLENBQUM7Q0FFbkMsZUFBQSxTQUFzQixFQUFBLEdBQUEsRUFBUUYsQ0FBUjtDQUVsQmlCLE9BQUMsUUFBUSxHQUFMLFNBQWlCLEtBQWpCLElBQTBCLElBQUQsSUFBVztDQUN4QzdGLE9BQUMsSUFBSSxJQUFEO0NBQ0osYUFBTyxZQUFhQSxDQUFYLEVBQWM2RixDQUFkLEdBQWtCLFVBQWxCLENBQUYsYUFBNEM3RixDQUFYLEVBQWM2RixDQUFkLEdBQUEsQ0FBakMsYUFBaUU3RixDQUFYLEVBQWM2RixDQUFkLEdBQWtCLFVBQWxCO0NBQ2hFO0NBRUo7Q0FFRDtDQUNBO0NBQ0E7Q0FFQUs7Q0FFSTFILElBQUFBLFVBQUEsTUFBQSxVQUFBLFFBQUEsRUFBcUMsQ0FBckM7Q0FFQSw2QkFBUSxDQUFrQixDQUFsQjtDQUFSOztDQUVBLGtCQUFBLG1CQUFBLEdBQW9DLEVBQXBDO0NBRUlzRyxPQUFDLFNBQVMsQ0FBQ3BJOztDQUVYOEIsUUFBRXdGO0NBQXFCbUMsY0FBTSxFQUFDckIsR0FBQztDQUFTLHNCQUFhQTtDQUFPLHdCQUFlQTtDQUF0RCxlQUFyQixHQUE0RixDQUFELEVBQUdMLENBQUg7Q0FFOUY7Q0FFSjs7Q0FFRDtDQUNKO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FJSTJCO0NBRUk7Q0FDQSxpQkFBYTtDQUNiLGNBQVU1SCxXQUFBLEVBQWNBLFdBQWQ7Q0FBOEI2SCx5QkFBUSxHQUFTLEdBQVQ7Q0FBZ0JDLFdBQUs7Q0FBSUMsWUFBTTtDQUFJQztDQUE3QyxLQUE1QjtDQUNWaEksSUFBQUEsY0FBQSxFQUFpQixFQUFqQjtDQUF1QmlJO0NBQU9DO0NBQU96QyxNQUFBQTtDQUFVMEMsVUFBSTtDQUFrQjlFO0NBQTBCO0NBQTFFLEtBQXJCLEtBQUE7O0NBQ0FyRCxJQUFBQSxZQUFBLEVBQWUsRUFBZjtDQUFxQm9JLE1BQUFBO0NBQU0vRSxZQUFNO0NBQWdCO0NBQWtCOEU7Q0FBYTtDQUE3RCxLQUFuQixLQUFBOztDQUNBbkksSUFBQUEsY0FBQSxFQUFpQixFQUFqQjtDQUF1QmlJO0NBQU9DO0NBQU96QyxNQUFBQSxTQUFRO0NBQUlwQztDQUEwQjtDQUFtQjhFO0NBQXpFLEtBQXJCLEtBQUE7O0NBQ0FuSSxJQUFBQSxZQUFBLEVBQWUsRUFBZjtDQUFxQm9JLE1BQUFBO0NBQU0vRTtDQUFnQztDQUFrQjhFO0NBQWE7Q0FBMEIsd0JBQWlCO0NBQWxILEtBQW5CLEtBQUE7O0NBQ0FuSSxJQUFBQTtDQUVIO0NBRURxSTtDQUVJO0NBQ0EsaUJBQWE7Q0FDYixjQUFVckksV0FBQSxFQUFjQSxXQUFkO0NBQThCNkgseUJBQVEsR0FBUyxHQUFUO0NBQWdCQyxXQUFLO0NBQUlDLFlBQU07Q0FBSUM7Q0FBN0MsS0FBNUI7Q0FDVmhJLElBQUFBLGNBQUEsRUFBaUIsRUFBakI7Q0FBdUJpSTtDQUFPQztDQUFPekMsTUFBQUE7Q0FBVXBDO0NBQTBCO0NBQW1COEU7Q0FBdkUsS0FBckIsS0FBQTs7Q0FDQW5JLElBQUFBLFlBQUEsRUFBZSxFQUFmO0NBQXFCb0ksTUFBQUE7Q0FBTS9FLFlBQU07Q0FBZ0I7Q0FBa0I4RTtDQUFhO0NBQTdELEtBQW5CLEtBQUE7O0NBQ0FuSSxJQUFBQTtDQUVIO0NBRURzSTtDQUVJO0NBRUE7Q0FBQSxRQUFhQztDQUNiLDJCQUFhLENBQVcsS0FBRyxTQUFkO0NBQ2IsNkNBQWtCO0NBQ2xCLGNBQVV2SSxXQUFBLEVBQWNBLFdBQWQ7Q0FBOEI2SCx5QkFBUSxHQUFTLEdBQVQ7Q0FBZ0JDLFdBQUs7Q0FBSUMsWUFBTTtDQUFJQztDQUE3QyxLQUE1QjtDQUNWaEksSUFBQUEsWUFBQSxNQUFBLEVBQXFCLEVBQXJCLEtBQUE7Q0FDQUEsSUFBQUEsU0FBQSxNQUFBLEVBQWtCLEVBQWxCLEtBQUE7O0NBRUEsbUJBQUE7Q0FJSTtDQUNBdUksTUFBQUEsR0FBRyxJQUFLLG1CQUFtQixHQUFuQixDQUFGLEVBQTJCLGlCQUFBLEdBQUEsQ0FBM0IsRUFBa0Qsc0JBQXNCLEdBQXRCLENBQWxELEdBQStFLG9CQUFELEVBQXVCLENBQXZCO0NBQ3BGdkk7Q0FBb0NzRixRQUFBQTtDQUFXMkMsUUFBQUE7Q0FBVUMsUUFBQUE7Q0FBVXpDO0NBQVMrQyxRQUFBQTtDQUFVQyxRQUFBQTtDQUFwRCxTQUFnRUMsS0FBS0g7O0NBR3ZHQSxNQUFBQSxHQUFHLElBQUssbUJBQW1CLEdBQW5CLENBQUYsR0FBNEIsaUJBQUQsRUFBb0IsQ0FBcEI7Q0FDakN2STtDQUFvQ3NGLFFBQUFBO0NBQVkyQyxRQUFBQTtDQUFVQyxRQUFBQTtDQUFVekM7Q0FBUytDLFFBQUFBO0NBQVVDLFFBQUFBO0NBQXJELFNBQWlFQyxLQUFLSDs7Q0FHeEcsVUFBSUksR0FBRztDQUNQLFVBQUlDLEdBQUc7Q0FFUEwsTUFBQUEsR0FBRyxJQUFLLEtBQUtJLEdBQUcsRUFBQSxDQUFSLEdBQUEsQ0FBRixFQUFtQixLQUFLQSxHQUFHLEVBQUEsQ0FBUixHQUFBLENBQW5CLEVBQW9DLEtBQUtBLEdBQUcsRUFBQSxDQUFSLEdBQUEsQ0FBcEMsR0FBc0QsS0FBS0EsR0FBRyxFQUFBLENBQVQsRUFBYyxDQUFkO0NBQzNEM0k7Q0FBb0NzRixRQUFBQTtDQUFhMkMsUUFBQUE7Q0FBVUMsUUFBQUE7Q0FBVXpDO0NBQVMrQyxRQUFBQTtDQUFVQyxRQUFBQTtDQUF0RCxTQUFrRUMsS0FBS0g7Q0FFekdBLE1BQUFBLEdBQUcsSUFBSyxLQUFLSyxHQUFHLEVBQUEsQ0FBUixHQUFBLENBQUYsRUFBbUIsS0FBS0EsR0FBRyxFQUFBLENBQVIsR0FBQSxDQUFuQixFQUFvQyxLQUFLQSxHQUFHLEVBQUEsQ0FBUixHQUFBLENBQXBDLEdBQXNELEtBQUtBLEdBQUcsRUFBQSxDQUFULEVBQWMsQ0FBZDtDQUMzRDVJO0NBQW9Dc0YsUUFBQUE7Q0FBYzJDLFFBQUFBO0NBQVVDLFFBQUFBO0NBQVV6QztDQUFTK0MsUUFBQUE7Q0FBVUMsUUFBQUE7Q0FBdkQsU0FBbUVDLEtBQUtIOztDQUkxR3ZJLFFBQUV3RjtDQUFxQnlDLFFBQUFBLEVBQUU7Q0FBS0MsUUFBQUEsRUFBRTtDQUFLekM7Q0FBVTBDLFFBQUFBO0NBQTFCLFNBQStDTzs7Q0FDcEUxSSxRQUFFd0Y7Q0FBcUJ5QyxRQUFBQSxFQUFFO0NBQU9DLFFBQUFBLEVBQUU7Q0FBUXpDO0NBQWtCMEMsUUFBQUE7Q0FBdkMsU0FBNkRPOztDQUNsRjFJLFFBQUV3RjtDQUFxQnlDLFFBQUFBLEVBQUU7Q0FBS0MsUUFBQUEsRUFBRTtDQUFLekM7Q0FBZTBDLFFBQUFBO0NBQS9CLFNBQXNETzs7Q0FFM0UxSSxrQkFBQSxHQUFlMEk7Q0FFbEI7Q0FDSTtDQUNESCxNQUFBQSxHQUFHLElBQUssaUJBQUEsR0FBQSxDQUFGLEVBQXdCLG1CQUFtQixHQUFuQixDQUF4QixHQUFrRCxpQkFBRCxFQUFvQixDQUFwQjtDQUN2RHZJO0NBQW9Dc0YsUUFBQUE7Q0FBWTJDLFFBQUFBO0NBQVVDLFFBQUFBO0NBQVV6QztDQUFTK0MsUUFBQUE7Q0FBVUMsUUFBQUE7Q0FBckQsU0FBaUVDLEtBQUtIO0NBRXhHdkksUUFBRXdGO0NBQXFCeUMsUUFBQUEsRUFBRTtDQUFLQyxRQUFBQSxFQUFFO0NBQUt6QztDQUFVMEMsUUFBQUE7Q0FBYTlFO0NBQWlDO0NBQXhFLFNBQThGcUY7O0NBQ25IMUksUUFBRXdGO0NBQXFCeUMsUUFBQUEsRUFBRTtDQUFLQyxRQUFBQSxFQUFFO0NBQUt6QztDQUFrQjBDLFFBQUFBO0NBQWxDLFNBQXdETzs7Q0FDN0UxSSxRQUFFd0Y7Q0FBcUJ5QyxRQUFBQSxFQUFFO0NBQUtDLFFBQUFBLEVBQUU7Q0FBS3pDO0NBQWUwQyxRQUFBQTtDQUFhOUU7Q0FBMkI7Q0FBdkUsU0FBNkZxRjs7Q0FFbEgxSSxrQkFBQSxHQUFlMEk7Q0FDbEI7Q0FJSjtDQUVERztDQUVJO0NBQ0EsY0FBVTdJLFdBQUEsRUFBY0EsV0FBZDtDQUE4QjZILHlCQUFRLEdBQVMsR0FBVDtDQUFnQkMsV0FBSztDQUFJQyxZQUFNO0NBQUlDO0NBQTdDLEtBQTVCO0NBQ1ZoSSxJQUFBQSxZQUFBLE1BQUEsRUFBcUIsRUFBckIsS0FBQTtDQUNBQSxJQUFBQSxTQUFBLE1BQUEsRUFBa0IsRUFBbEIsS0FBQTtDQUVBLFlBQVE7O0NBQ1IsWUFBTztDQUNQO0NBQ0EsWUFBUTtDQUFSLGFBQWlCLEdBQUcsSUFBSXlGLENBQUosR0FBUVEsSUFBSXVCLElBQUk7Q0FBcEMsVUFBMkM7Q0FDM0MsUUFBSXNCLEVBQUosS0FBQSxFQUFhQyxFQUFiLEVBQWlCQyxFQUFqQixFQUFxQkMsRUFBckIsR0FBQSxHQUFBLE1BQUE7Q0FDQSxnQkFBWTs7Q0FFWixjQUFBLFFBQUEsRUFBcUIsR0FBckI7Q0FFSUYsUUFBRSxJQUFJO0NBQ05DLFFBQUUsS0FBSztDQUNQRixRQUFFLEdBQUcsR0FBRyxTQUFTO0NBQ2pCSSxNQUFBQSxHQUFHLFlBQVlDLElBQUksR0FBRyxTQUFTO0NBRS9CRixRQUFFLFNBQ09HLEdBQUwsQ0FBU0MsRUFBVCxDQURDLFFBQ21CRixHQUFMLENBQVNFLEVBQVQsUUFDVkQsR0FBTCxDQUFTTixNQUFNSSxHQUZkLFFBRXlCQyxHQUFMLENBQVNMLEdBQVYsR0FBZ0JJLFVBQy9CRSxHQUFMLENBQVNKLEVBQVQsQ0FIQyxRQUdtQkcsR0FBTCxDQUFTSCxFQUFUO0NBR25CL0QsV0FBSyxHQUFMLGFBQVcsWUFBdUIsR0FBQSxFQUFLLEdBQUcsR0FBUixDQUFYOztDQUV2QixXQUFLLEdBQUc7Q0FFSnFFLFFBQUFBLENBQUM7O0NBQ0QsZ0JBQU87Q0FDSkwsVUFBQUEsR0FBR0ssQ0FBRCxJQUFNLENBQUVMLEdBQUdLLENBQUQsUUFBT0M7Q0FDckI7O0NBRURDLFFBQUFBLE9BQU8sT0FBT1AsSUFBRSxVQUFZQSxJQUFFLElBQU0sT0FBT0EsSUFBRSxVQUFZQSxJQUFFLFVBQVlBLElBQUUsVUFBWUEsRUFBRTtDQUV2RlYsV0FBRyxJQUFLLFVBQVMsQ0FBRCxDQUFSLEVBQVksQ0FBWixHQUFnQixZQUFXLENBQUQsQ0FBVixFQUFjO0NBQ3RDdkk7Q0FBb0NzRixZQUFFO0NBQVFtRSxZQUFFLEVBQUNSO0NBQU9TLFlBQUUsRUFBQ1Q7Q0FBT1UsWUFBRSxFQUFDVjtDQUFPVyxZQUFFLEVBQUNYO0NBQU9ZO0NBQXBELGdCQUEyRnRCO0NBRTdIdkksU0FBQyxDQUFDd0YsVUFBRixFQUFlO0NBQU00QztDQUFRO0NBQWtCL0U7Q0FBdUI7Q0FBbkQsY0FBbkI7Q0FFSDs7Q0FDRGdHLFFBQUUsS0FBSztDQUNQcEUsV0FBSyxHQUFMLFFBQWdCLENBQUM7Q0FFcEI7Q0FLRCxRQUFJNkU7O0NBR0p2QixVQUFNLENBQUUsRUFBQSxXQUFBLEVBQWUsRUFBakIsR0FBc0IsRUFBRCxXQUFBLEVBQWdCLEVBQXJDLEdBQTBDLEVBQUQsV0FBQSxFQUFnQixFQUF6RCxNQUE2RCxXQUFBLEVBQWlCLENBQWpCLENBQTdEO0NBQ052SSxJQUFBQSwrQkFBQTtDQUFvQ3NGO0NBQVVtRSxRQUFFO0NBQUlDLFVBQUdILEdBQUc7Q0FBS0ksUUFBRTtDQUFJQyxVQUFHTCxHQUFHO0NBQUtNO0NBQTlDLEtBQWxDLEtBQUEsS0FBQTtDQUVBdEIsVUFBTSxDQUFFLEVBQUEsV0FBQSxFQUFlLEVBQWpCLEdBQXNCLEVBQUQsV0FBQSxNQUFyQixNQUEyQyxXQUFBLEVBQWlCLENBQWpCLENBQTNDO0NBQ052SSxJQUFBQSwrQkFBQTtDQUFvQ3NGO0NBQVVtRSxVQUFHRixHQUFHO0NBQVFHLFFBQUU7Q0FBSUMsVUFBR0osR0FBRztDQUFLSyxRQUFFO0NBQUlDO0NBQWpELEtBQWxDLEtBQUEsS0FBQTtDQUVBN0osSUFBQUEsU0FBQSxNQUFBO0NBQW9CO0NBQW1DO0NBQXJDLEtBQWxCLEtBQUE7O0NBQ0FBLElBQUFBLGVBQUEsRUFBa0IsRUFBbEI7Q0FBd0IrSjtDQUEyQzVCO0NBQTdDLEtBQXRCLEtBQUEsRUFBdUYsQ0FBdkY7O0NBQ0FuSSxJQUFBQSxlQUFBLEVBQWtCLEVBQWxCO0NBQXdCK0o7Q0FBMkM1QjtDQUFpQjtDQUFrQjlFO0NBQWhGLEtBQXRCLEtBQUEsRUFBa0ksQ0FBbEk7O0NBQ0FyRCxJQUFBQSxlQUFBLEVBQWtCLEVBQWxCO0NBQXdCK0o7Q0FBMkM1QjtDQUFpQjtDQUFrQjlFO0NBQWhGLEtBQXRCLEtBQUEsRUFBa0ksQ0FBbEk7O0NBQ0FyRCxJQUFBQSxZQUFBLEVBQWUsRUFBZjtDQUFxQm9JLE1BQUFBO0NBQXlGRDtDQUFZO0NBQWtCOUU7Q0FBekgsS0FBbkIsS0FBQSxFQUFtSyxDQUFuSztDQUNBOztDQUVBckQsSUFBQUEsY0FBQSxFQUFpQixFQUFqQjtDQUF1QmlJLFVBQUc7Q0FBS0MsVUFBRztDQUFLekMsTUFBQUEsQ0FBQztDQUFJO0NBQWtCcEM7Q0FBZThFO0NBQXhELEtBQXJCLEtBQUE7O0NBRUFuSSxJQUFBQTtDQUVIO0NBRURnSyxtQ0FBOEIxSTtDQUUxQkEsYUFBUztDQUNUMkQ7Q0FDQTtDQUNBLDhCQUF3QmpGLDRDQUF3Q0EscUtBQXhEOztDQUNSO0NBQ0k7Q0FDQTtDQUNBc0gsUUFBQUEsR0FBQyw4REFBSTtDQUVMOztDQUNBO0NBQ0FBLFFBQUFBLEdBQUM7Q0FDRDtDQVJKOztDQVVBQSxJQUFBQSxDQUFDLENBQUM7Q0FDRixXQUFPQSxXQUFBO0NBRVY7Q0FFRDJDLGNBQVksOGlCQUFBLE1BQUEsS0FBQTtDQWptQk4sQ0FBVjtDQTBtQkFqSyxDQUFDLENBQUNnRixPQUFGO0tBRWFrRixLQUFLLEdBQUdsSzs7Q0MvbUJyQjtDQUNBO0NBQ0E7Q0FFQTtDQUVBLElBQU1tSyxDQUFDLEdBQUc7Q0FFVEM7Q0FFQUM7Q0FDR0M7Q0FDQUM7Q0FDQUMsV0FBUSxDQUFDO0NBRVpDO0NBQ0FDO0NBRUdDLGVBQWEsbURBQUE7Q0FFaEJDO0NBQ0FDO0NBQ0dDO0NBRUFDO0NBRUFDO0NBQ0FDO0NBQ0FDO0NBQ0E7Q0FDQUM7Q0FDQUM7Q0FDQUM7Q0FDQUM7Q0FDQUMsY0FBYSxDQUFDLEdBQUUsQ0FBSDtDQUNiQyxZQUFXO0NBQ1hDO0NBQ0FDLE9BQUk7Q0FDSkMsVUFBTyxDQUFDO0NBQ1JDLFNBQU0sQ0FBQztDQUVQQztDQUVBQztDQUNBQztDQUVBQyxFQUFBQTtDQUNJOVAsUUFBSTtDQUNKK1AsV0FBTztDQUNQQyxXQUFPO0NBQ1BDLFdBQU87Q0FDUG5RLE9BQUc7Q0FDSG9RLFNBQUs7Q0FOUDtDQVNGQztDQUlIQyxvQkFBZ0JsSDtDQUVUK0UsSUFBQUEsRUFBRUMsT0FBRixDQUFXaEYsQ0FBWDtDQUNBK0UsSUFBQUEsU0FBQSxDQUFXL0UsQ0FBWDtDQUVBLFFBQUksQ0FBQytFLGNBQUwsRUFBc0JBLFlBQUE7Q0FFekI7Q0FFRG9DO0NBRUk7Q0FDQSxRQUFJdEcsdUJBQXVCQSxxQkFBcUJBLHNCQUFzQkEsb0JBQW9CQSxvQkFBb0JBLDBCQUEwQkEseUJBQXhJO0NBR0g7Q0FFRHVHLDBCQUFtQnBIO0NBRWYsWUFBUStFLEVBQUVDLFVBQUYsQ0FBY2hGLENBQWQ7O0NBRVIsY0FBVyxFQUFYO0NBQ0krRSxvQkFBQSxDQUFnQi9FO0NBQ2hCK0UsT0FBQyxDQUFDQyxVQUFXbE0sQ0FBYixFQUFnQjtDQUNuQjs7Q0FFRCxRQUFJaU0sRUFBRUMsZUFBTjtDQUNJRCxvQkFBQTtDQUNIO0NBRUo7Q0FFRDtDQUNBO0NBQ0E7Q0FFQXNDO0NBRUksUUFBSXRDLGNBQUo7Q0FFQTtDQUVBQSxJQUFBQSxhQUFhQSxZQUFBOztDQUViLFFBQUlBLFVBQUo7Q0FDSTNFLE1BQUFBLGlDQUFBLEVBQW9DMkU7Q0FDcEMzRSxNQUFBQSwrQkFBQSxFQUFrQzJFO0NBQ2xDM0UsTUFBQUEsZ0NBQUEsRUFBbUMyRTtDQUN0QztDQUNHM0UsTUFBQUEsZ0NBQUEsRUFBbUMyRTtDQUNuQzNFLE1BQUFBLGtDQUFBLEVBQXFDMkU7Q0FDckMzRSxNQUFBQSw0QkFBQSxFQUErQjJFO0NBQy9CdUMsMkNBQUEsRUFBd0N2QztDQUN4Q3VDLHlDQUFBLEVBQXNDdkM7Q0FDekM7O0NBRUR3QyxxQ0FBQSxHQUFBLE9BQUE7Q0FDQUEsbUNBQUEsR0FBQSxPQUFBO0NBQ0FBLG9DQUFBLEVBQW1DeEMsUUFBbkMsT0FBQTs7Q0FHQUEsSUFBQUE7Q0FFSDtDQUVEeUM7Q0FFSSxRQUFJLENBQUN6QyxjQUFMO0NBRUE7O0NBRUEsUUFBSUEsVUFBSjtDQUNJM0UsTUFBQUEsb0NBQUEsRUFBdUMyRTtDQUN2QzNFLE1BQUFBLGtDQUFBLEVBQXFDMkU7Q0FDckMzRSxNQUFBQSxtQ0FBQSxFQUFzQzJFO0NBQ3pDO0NBQ0czRSxNQUFBQSxtQ0FBQSxFQUFzQzJFO0NBQ3RDM0UsTUFBQUEscUNBQUEsRUFBd0MyRTtDQUN4QzNFLE1BQUFBLCtCQUFBLEVBQWtDMkU7Q0FDbEN1Qyw4Q0FBQSxFQUEyQ3ZDO0NBQzNDdUMsNENBQUEsRUFBeUN2QztDQUM1Qzs7Q0FFRHdDLHdDQUFBLEVBQXVDeEMsQ0FBdkM7Q0FDQXdDLHNDQUFBLEVBQXFDeEMsQ0FBckM7Q0FDQXdDLHVDQUFBLEVBQXNDeEMsUUFBdEM7Q0FFQUEsSUFBQUE7Q0FFSDtDQUVEMEM7Q0FFSTFDLElBQUFBO0NBRUEsWUFBUUEsRUFBRUM7Q0FBVjs7Q0FFQSxZQUFRLEVBQVI7Q0FFSTBDLE9BQUMsSUFBSSxDQUFDMUMsRUFBRixDQUFLbE07Q0FDVCxxQkFBZSwrQkFBZixhQUFpRDtDQUVwRDtDQUVKO0NBRUQ7Q0FDQTtDQUNBO0NBR0E2TztDQUVJO0NBRUY7Q0FFRSwwQkFBSSxDQUFvQjVDLG1CQUFvQixFQUE1QyxzQkFBaUQ7Q0FFakQsb0NBQUE7Q0FJQTtDQUNBOztDQUVBQSxJQUFBQSxVQUFBO0NBRUEsWUFBUUEsQ0FBQyxDQUFDNkI7Q0FFVixnQ0FBQSxFQUE4QjdCLGVBQUE7Q0FDOUIsOEJBQUEsRUFBNEJBLGFBQUE7Q0FFNUIsOEJBQUEsRUFBNkI2QixpQ0FBaUMsQ0FBQyxPQUMxREEsVUFBVTtDQUVmQSxJQUFBQSw2QkFBNkI7Q0FDN0JBLElBQUFBLDZCQUE2QjtDQUM3QkEsSUFBQUE7O0NBSUEsUUFBSTdCLFVBQUo7Q0FFSSwrQ0FBcUIsR0FBdUI7Q0FFeEM2QixpQ0FBWSxXQUFBO0NBQ1pBLGlDQUFZLFdBQUE7Q0FFZjs7Q0FFRCxxQ0FBQSxRQUFpQztDQUNqQyxtQ0FBQSxRQUErQjtDQUMvQixvQ0FBQSxRQUFnQztDQUVuQztDQUdEO0NBQ1I7Q0FDQTtDQUNBO0NBQ0E7OztDQUdRLFFBQUlBLHNCQUFKLEVBQTZCN0I7Q0FDN0IsUUFBSTZCLG9CQUFKLEVBQTJCN0I7Q0FFM0IsUUFBSUEsY0FBYzZCLHNCQUFsQixFQUEyQzdCLFFBQUEsQ0FBVTZCLENBQVY7Q0FDM0MsUUFBSUEsMEJBQTBCLENBQUM3QixNQUEvQixFQUF3Q0EsUUFBQSxDQUFVNkIsQ0FBVjs7Q0FHeEMsUUFBSTdCLEVBQUVFLFdBQU47Q0FFSSxXQUFLLENBQUNBO0NBRUYyQixpQkFBQSxHQUFZN0IsQ0FBQztDQUNiNkIsaUJBQUEsR0FBWTdCLENBQUM7Q0FFaEI7O0NBRURBLE9BQUMsQ0FBQ0UsY0FBRixDQUFrQjJCO0NBRXJCOztDQUVELFFBQUk3QixjQUFjNkIsb0JBQWxCLEVBQXlDN0IsWUFBQTtDQUU1QztDQUVEO0NBQ0E7Q0FDQTtDQUVBNkMsMEJBQW1CaEI7Q0FFZixZQUFRN0IsRUFBRUM7Q0FBVixRQUFxQm5NLElBQUk7Q0FBekI7Q0FBQTtDQUFBOztDQUVBLFlBQVEsRUFBUjtDQUVJNk8sT0FBQyxJQUFJLENBQUMxQyxFQUFGLENBQUtsTTs7Q0FFVDtDQUVJK08sUUFBQUEsQ0FBQztDQUNEQyxRQUFBQSxDQUFDO0NBRUo7Q0FFR0QsUUFBQUEsQ0FBQztDQUNEQyxRQUFBQSxDQUFDO0NBRUo7O0NBRUQsbUJBQWNKLENBQVYsRUFBYUcsQ0FBYixHQUFBO0NBRUFoUCxRQUFBQSxJQUFJOztDQUVKLFlBQUlBO0NBQ0FrTTtDQUNBQSxzQkFBWWxNO0NBQ1prTSxZQUFFRSxFQUFGO0NBQ0g7O0NBQ0Q7Q0FDSDtDQUVKOztDQUVELGlCQUFhLEVBQWIsRUFBa0JGLFlBQUE7Q0FFckI7Q0FFRGdEO0NBRUksUUFBSSxDQUFDaEQsRUFBRUUsRUFBUDtDQUNBRixJQUFBQSxZQUFZLENBQUM7Q0FDYkEsSUFBQUEsRUFBRUUsUUFBRjtDQUNBRixJQUFBQSxFQUFFRTtDQUNGRixJQUFBQSxRQUFBO0NBRUg7Q0FFRDtDQUNBO0NBQ0E7Q0FFQWlEO0NBRUk7Q0FBQTtDQUFBO0NBQUEsVUFBOEI7Q0FBOUIsVUFBc0M7O0NBRXRDLGNBQUEsU0FBQSxHQUFzQixFQUF0QjtDQUVJTixPQUFDLEdBQUdPLEdBQUcsQ0FBQ25QO0NBRVI0TyxjQUFBLEdBQVdBLENBQUM7Q0FDWkEsY0FBQSxHQUFXQSxDQUFDOztDQUVaLFVBQUk7Q0FFQSxvQkFBQSxJQUFpQixNQUFNdkwsQ0FBRjtDQUVyQnVMLFVBQUVRLEtBQUtMLElBQUlLLEtBQUtMO0NBQ2hCSCxVQUFFUSxLQUFLSixXQUFXLE1BQU0sS0FBSzNMO0NBRTdCZ00sVUFBRSxLQUFLRDtDQUVQRSxVQUFFLElBQUlWO0NBQ04sY0FBTSxLQUFLeEwsSUFBSWdNLElBQUksRUFBbkIsSUFBMEI7Q0FFN0I7Q0FFR1IsVUFBRVEsS0FBS0wsSUFBSUs7Q0FDWFIsVUFBRVEsS0FBS0o7Q0FDUE8sVUFBRSxNQUFNbE0sQ0FBRjtDQUVUOztDQUVELG1CQUFBLFdBQWdCO0NBRW5CO0NBRUo7Q0FHSm1NLHVDQUE0QjFCO0NBRXJCOztDQUVBLFlBQVEsRUFBUjtDQUNJLG1CQUFjcUIsR0FBRyxFQUFBLENBQWIsV0FBQSxXQUFBO0NBQ1A7O0NBRUQsV0FBTyxDQUFDO0NBRVg7Q0FFRDtDQUNBO0NBQ0E7Q0FFQU07Q0FFSSxRQUFJLENBQUN4RCxzQkFBTDtDQUVBLFlBQVFBLEVBQUVDO0NBQVY7O0NBRUEsWUFBUSxFQUFSO0NBRUkwQyxPQUFDLElBQUksQ0FBQzFDLEVBQUYsQ0FBS2xNO0NBQ1RpTSxlQUFBLENBQVcyQztDQUNYLGlCQUFBLFdBQWM7Q0FFakI7O0NBRUQzQyxJQUFBQTtDQUVIO0NBRUR5RCwwQkFBbUJ4SSxHQUFHNkgsR0FBR0M7Q0FFckIsMENBQUE7Q0FFQSxZQUFROUg7Q0FDUixRQUFJeUksU0FBU0MsQ0FBQyxDQUFDYjtDQUNmLFFBQUlNLFNBQVNPLENBQUMsQ0FBQ1o7Q0FFZixlQUFhVyxXQUFlTixXQUFlTSxNQUFNQyxDQUFDLE1BQVVQLE1BQU1PLENBQUMsQ0FBQ3ZNO0NBRXBFLFlBQUEsRUFBVzZELFlBQWF5SSxFQUFiLEVBQWlCTixFQUFqQixPQUNObkksV0FBQTtDQUVMO0NBRUg7Q0FFRDJJLDRCQUFvQjNJO0NBRWhCLFFBQUlBLGNBQUo7Q0FDQSxZQUFRQSxRQUFBLHdCQUFBO0NBQ1JBLElBQUFBO0NBQVc2SCxNQUFBQSxDQUFDO0NBQVNDLE1BQUFBLENBQUMsSUFBR2M7Q0FBSzFNLE1BQUFBLENBQUM7Q0FBVUMsTUFBQUEsQ0FBQztDQUFqQztDQUVaO0NBRUQ7Q0FDQTtDQUNBO0NBRUF3RDtDQUVJdkc7O0NBQ0EsaUJBQWEyTCxXQUFiO0NBQ0l1QyxnQ0FBQTtDQUNBdkMsaUJBQUE7Q0FDSDtDQUVKO0NBRUQ7Q0FDQTtDQUNBO0NBRUE4RCw4QkFBcUI3SSxHQUFHOUQsR0FBR0M7Q0FFdkI7Q0FFQSxpQkFBYTRJLGtCQUFiO0NBQW9DK0Qsa0JBQVk7Q0FBYS9ELGVBQUE7Q0FBb0I7O0NBRWpGLFFBQUlBLGtCQUFKO0NBRUEsUUFBSUEsTUFBSixFQUFhQTtDQUFvQ0EsZUFBQTtDQUFtQixLQUFqQyxFQUFtQyxFQUFuQzs7Q0FJbkM7Q0FDQSxjQUFVL0Usd0JBQXdCQSxlQUFsQztDQUVBLFFBQUkrRSxtQkFBSixFQUEwQkEsc0JBQWE7Q0FFdkMsY0FBVUE7O0NBRVYscUJBQWlCQSxpQ0FBQSxDQUFtQy9FLFNBQW5DO0NBRWpCOztDQUVBK0k7Q0FFSSxVQUFJQyxHQUFHOztDQUVQO0NBQ0loSixzQkFBQTtDQUNBQSx1QkFBQTtDQUNIO0NBQ0dnSixRQUFBQSxhQUFBLENBQWUsR0FBRyxHQUFHOU0sQ0FBckI7Q0FDSDs7Q0FDRDhNLE1BQUFBLGtCQUFBLEVBQXFCLENBQXJCLEVBQXdCO0NBRXhCaEosY0FBQTtDQUVIOztDQUVEK0ksMEVBQWtFOztDQUVsRUEsc0JBQWtCO0NBR3JCO0NBRUQ7Q0FDQTtDQUNBO0NBRUFFO0NBRUksUUFBSWxFLHNCQUFKO0NBRUksY0FBUSxlQUFHLEtBQUE7Q0FFWCxVQUFJekcsR0FBRyxZQUFZQSxJQUFJNEssR0FBYjtDQUNWNUssTUFBQUE7Q0FFQXlHLG1CQUFBO0NBQ0FBLHdCQUFBO0NBQ0FBLGlDQUFBLEdBQThCekcsR0FBRyxpQ0FBcUIsS0FBQTtDQUV0RHlHLG1CQUFBO0NBQ0FBLGlDQUFBLEdBQThCekcsR0FBRztDQUVqQ2dKLCtCQUFBO0NBQ0FBLCtCQUFBO0NBRUg7O0NBRUR2QyxJQUFBQSw0QkFBNEJBO0NBQzVCQSxJQUFBQSxzQkFBc0JBO0NBQ3RCQSxJQUFBQSwwQkFBMEJBO0NBRTFCQSxJQUFBQTtDQUVIO0NBRURvRSxvQ0FBd0IvTTtDQUVwQixRQUFJMkksc0JBQUo7Q0FDQUEsSUFBQUE7Q0FFSDtDQUVEcUUsOEJBQW9CdkI7Q0FFaEIsWUFBUTlDO0NBQVIsUUFBc0IvRCxDQUFDO0NBQXZCLFFBQTZCSCxDQUFDOztDQUM5QixZQUFRLEVBQVI7Q0FDSUcsc0JBQUssR0FBZXFGLEdBQUYsQ0FBTXhGLENBQU47Q0FDbEIsZUFBU2dIO0NBQ1RoSCxNQUFBQSxDQUFDO0NBQ0o7O0NBQ0QsV0FBT0E7Q0FFVjtDQUVEd0ksNEJBQW9CeEI7Q0FFaEIsUUFBSTlDLGlCQUFKO0NBRUEsUUFBSXVFOztDQUVKLFlBQUE7Q0FFSSxZQUFNLGFBQUcsQ0FBWXpCO0NBRXJCOUMsYUFBQSxHQUFVN0U7O0NBRVYsd0JBQWtCO0NBRWQ2RTtDQUNBQTtDQUNBQSxvQkFBQSxZQUFlO0NBRWxCO0NBRUcsdUJBQWU7O0NBRWY7Q0FDSSxzQkFBSSxLQUFheUIsbUJBQVEsTUFBbUJBLGlCQUE1QyxpQkFDSyxnQkFBNkJBO0NBQ3JDO0NBQ0o7O0NBRUQ4QyxRQUFFO0NBRUw7Q0FFRyx3QkFBa0I7Q0FFZHZFLHFCQUFhO0NBQ2JBO0NBQ0FBLG9DQUFBLGVBQStCO0NBQy9CQSxrQ0FBQSxlQUE2QjtDQUM3QkEsZ0JBQUE7Q0FFQXVFLGFBQUs7Q0FFUjtDQUVKOztDQUVELFFBQUlBLEVBQUosRUFBU3ZFLGNBQUE7Q0FFVCxXQUFPdUU7Q0FFVjtDQUVEQztDQUVJLFlBQVF4RSxXQUFBLENBQWFBLGVBQUEsRUFBQSxFQUFvQkEsVUFBcEIsQ0FBYjtDQUNSLFlBQVFBLFdBQUEsQ0FBYUEsZUFBQSxFQUFBLEVBQW9CQSxZQUFBLENBQWEsQ0FBYixDQUFwQixDQUFiO0NBQ1IsWUFBUUEsV0FBQSxDQUFhQSxlQUFBLENBQWlCQSxZQUFBLENBQWEsRUFBOUIsRUFBbUNBLFlBQUEsQ0FBYSxDQUFiLENBQW5DLENBQWI7Q0FFUkEsSUFBQUEsZUFBQSxFQUFBLEdBQUEsRUFBdUIxSSxDQUF2QjtDQUVIO0NBRURtTjtDQUVJLFFBQUl6RSxzQkFBSixTQUFvQztDQUNwQ3JJLDRCQUFPLFVBQUE7Q0FDUHFJLElBQUFBO0NBQ0EsV0FBT0E7Q0FFVjtDQUdEMEU7Q0FFSSxRQUFJMUUsaUJBQUo7Q0FDQSxRQUFJLENBQUNBLFlBQUwsRUFBb0JBLHNCQUFBO0NBRXBCQSxJQUFBQSxhQUFBO0NBQ0FBLElBQUFBLGlCQUFBOztDQUdBQSxJQUFBQSwyQkFBMkJBO0NBQzNCQSxJQUFBQSw0QkFBNEJBO0NBQzVCQSxJQUFBQTtDQUVBQSxJQUFBQTtDQUNBQSxJQUFBQTtDQUNBQSxJQUFBQSxRQUFRLEVBQVIsRUFDQUE7Q0FFSDtDQUVEMkU7Q0FFSTNFLElBQUFBLFlBQUE7Q0FFQUEsSUFBQUE7Q0FDQUEsSUFBQUE7Q0FFQUEsSUFBQUEsMkJBQTJCQTtDQUMzQkEsSUFBQUEsNEJBQTRCQTtDQUM1QkEsSUFBQUEsUUFBUUE7Q0FFUkEsSUFBQUEsV0FBQTtDQUVIOztDQUVEO0NBQ0o7Q0FDQTtDQUlJNEUsNEJBQW9CL0M7Q0FFaEIsUUFBSTdCLGlCQUFKO0NBRUEsa0JBQWM2QjtDQUFkLEtBQThCOztDQUk5QjdCLElBQUFBOztDQUdBLFFBQUlBLFVBQUo7Q0FDSTtDQUNBd0Msa0JBQUE7Q0FDQXhDLHlCQUFBO0NBRUg7O0NBR0RBLElBQUFBO0NBSUE7Q0FDQTtDQUNJO0NBQ0E7Q0FDQTtDQUNKOztDQUVBLG9CQUFnQixFQUFoQjtDQUFzQjtDQUVsQkEsa0JBQUE7Q0FJRDtDQUVGO0NBRUc7Q0FDSSwwQkFBTSxrQkFBRCxrQkFBMkMsbUJBQTNDLHFCQUFBLHFCQUFBLG1CQUFBO0NBQ0RBLG1DQUF5QjtDQUM1QjtDQUNHQSxtQ0FBeUI7Q0FDNUI7Q0FDSjtDQUNHQTtDQUNIO0NBRUo7Q0FFSjtDQUVENkUsd0JBQWtCaEQ7Q0FFZCxRQUFJN0IsaUJBQUo7Q0FFQUEsSUFBQUEsUUFBUUE7Q0FFUixRQUFJQSxpQkFBSixFQUF3QkEsZ0JBQUEsQ0FBa0JBLEtBQWxCO0NBQXhCLFNBQ0tBLHNCQUFzQkE7Q0FFM0JBLElBQUFBLGFBQWFBO0NBQ2JBLElBQUFBLGVBQWUsQ0FBRUEsNEJBQUYsRUFBZ0NBLDBCQUFoQztDQUVmQSxJQUFBQSxjQUFBOztDQUdBQSxJQUFBQSxpQkFBQTtDQUVIO0NBRUQ7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUVBOEU7Q0FFSSxRQUFJOUUsUUFBSix1QkFBb0MsQ0FBRUEsTUFBRjtDQUNwQ0EsSUFBQUEsUUFBQTtDQUVIO0NBRUQrRTtDQUVJLFlBQVEvRTs7Q0FDUixZQUFRLEVBQVI7Q0FBYUEsZUFBQSxDQUFVak0sWUFBVjtDQUFiO0NBRUg7Q0FFRGlSO0NBRUksUUFBSTdKLEtBQUs2RSx1QkFBQTtDQUNULFFBQUk3RSxPQUFPLEVBQVgsRUFBZ0I2RSxpQkFBaUI3RSxFQUFqQixFQUFxQixDQUFyQjtDQUNoQixRQUFJNkUsc0JBQUosRUFBNkJBO0NBRWhDO0NBRURpRjtDQUVJLFFBQUk5SixLQUFLNkUsdUJBQUE7Q0FFVCxRQUFJN0UsT0FBTyxFQUFYO0NBRUE2RSxJQUFBQSxvQkFBQTs7Q0FFQSxRQUFJLENBQUNBLFFBQUw7Q0FDSUEsY0FBQTtDQUNBQSxZQUFBO0NBQ0g7Q0FFSjtDQWx1QkssQ0FBVjtDQXN1Qk8sSUFBTWtGLEtBQUssR0FBR2xGLENBQWQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQzd1Qk1tRixFQUFiO0NBRUMsY0FBYXJDLEdBQU9DO0NBQVE7Q0FBZkQsT0FBZTtDQUFBOztDQUFBO0NBQVJDLE9BQVE7Q0FBQTs7Q0FFM0IsYUFBU0Q7Q0FDVCxhQUFTQztDQUVUOztDQVBGOztDQUFBLDRCQVNPRCxHQUFHQztDQUVSLGFBQVNEO0NBQ1QsYUFBU0M7Q0FDVDtDQUVBLEdBZkY7O0NBQUEsa0NBaUJVOUw7Q0FFUixjQUFVQSxDQUFDLENBQUM2TDtDQUNaLGNBQVU3TCxDQUFDLENBQUM4TDtDQUNaO0NBRUEsR0F2QkY7O0NBQUEsc0NBeUJZOUw7Q0FFVixjQUFVQSxDQUFDLENBQUM2TDtDQUNaLGNBQVU3TCxDQUFDLENBQUM4TDtDQUNaO0NBRUEsR0EvQkY7O0NBQUE7Q0FtQ0U7Q0FDQTtDQUNBO0NBRUEsR0F2Q0Y7O0NBQUE7Q0EyQ0UsOEJBQU8sV0FBQTtDQUVQLEdBN0NGOztDQUFBO0NBaURFLHFEQUFrREEsQ0FBM0M7Q0FFUCxHQW5ERjs7Q0FBQTtDQXVERTtDQUVBLGlDQUFZLE9BQXlCRCxDQUF6QjtDQUVaLGlCQUFBLG9CQUFtQ3BNO0NBRW5DO0NBRUEsR0EvREY7O0NBQUEsd0NBaUVhWTtDQUVYLGNBQVVBO0NBQ1YsY0FBVUE7Q0FDVjtDQUVBLEdBdkVGOztDQUFBO0NBMkVFLGNBQVUsQ0FBQztDQUNYLGNBQVUsQ0FBQztDQUNYO0NBRUEsR0EvRUY7O0NBQUE7Q0FtRkUsYUFBUyxDQUFDO0NBQ1YsYUFBUyxDQUFDO0NBQ1Y7Q0FFQSxHQXZGRjs7Q0FBQTtDQTJGRSxzQ0FBb0M7Q0FFcEMsR0E3RkY7O0NBQUEsOEJBK0ZRTDtDQUVOLGFBQVNBLENBQUMsQ0FBQzZMO0NBQ1gsYUFBUzdMLENBQUMsQ0FBQzhMO0NBRVg7Q0FFQSxHQXRHRjs7Q0FBQSxrQ0F3R1U5TDtDQUVSLFdBQVdBLENBQUMsaUJBQXFCQSxDQUFDLFlBQVk4TDtDQUU5QyxHQTVHRjs7Q0FBQSwwQ0E4R2M5TCxHQUFHNkU7Q0FFZixXQUFXN0UsQ0FBQyxDQUFDNkwsU0FBRixDQUFZaEgsWUFBWWdILFNBQUwsQ0FBZWhILE1BQVU3RSxDQUFDLENBQUM4TCxTQUFGLENBQVlqSCxZQUFZaUgsU0FBTCxDQUFlakgsQ0FBZjtDQUUxRSxHQWxIRjs7Q0FBQSw4QkFvSFE3RTtDQUVOLGtCQUFBO0NBQ0Msc0JBQVU7Q0FDUCxzQkFBVTtDQUNiO0NBQ0EsZ0JBQVUsQ0FBRUEsR0FBQTtDQUNULGdCQUFVLENBQUVBLEdBQUE7Q0FDZjs7Q0FFRDtDQUVBLEdBaElGOztDQUFBO0NBQUE7O0NDS0E7Q0FDQTtDQUNBOztLQUVNbU87Q0FFRixpQkFBYW5LO0NBQVM7Q0FBVEEsT0FBUyxHQUFMO0NBQUs7O0NBRWxCO0NBQ0EsZ0JBQVlBO0NBQ1osZ0JBQVlBO0NBQ1o7Q0FFQTtDQUNBO0NBRUE7Q0FDQTs7Q0FHQSxtQkFBZUE7Q0FFZjtDQUFjNkgsTUFBQUEsQ0FBQztDQUFJQyxNQUFBQSxDQUFDO0NBQUk1TCxNQUFBQSxDQUFDO0NBQUlDLE1BQUFBLENBQUM7Q0FBbEI7Q0FDWixxQkFBaUIrTixFQUFKLE1BQUE7Q0FFYjtDQUVBOztDQUdBLGFBQVNsSyxDQUFDLG1CQUFtQkEsQ0FBQyxlQUFLLENBQVc1RDtDQUU5Qyx1Q0FBcUIsZUFBbUIsQ0FBV0Y7Q0FDbkQsUUFBSThELENBQUMsZ0JBQUwsV0FBaUNBLENBQUMsQ0FBQzlEO0NBRW5DLHVDQUFxQixlQUFtQixDQUFXQztDQUNuRCxRQUFJNkQsQ0FBQyxnQkFBTCxXQUFpQ0EsQ0FBQyxDQUFDN0Q7Q0FDbkMscUJBQUEsb0JBQW9DLEtBQUssVUFBVUE7O0NBR25ELHFCQUFpQjZEOztDQUdqQjs7Q0FHQSxrQkFBY0EsWUFBWTs7Q0FHMUI7Q0FDQSxpQkFBYUE7Q0FDYixvQkFBZ0JBOztDQUdoQjs7Q0FHQTs7Q0FHQSxrQkFBY0E7Q0FDZCxtQkFBQSxPQUF1Qm9LLEtBQUs7O0NBSzVCLHNCQUFtQmxPLENBQW5COztDQUdBLFFBQUc4RCxFQUFFb0ssZ0JBQUwsT0FBNkJBLEtBQUtwSyxFQUFFb0s7Q0FDcEMsUUFBR3BLLEVBQUVxSyxnQkFBTCxPQUE2QkEsS0FBS3JLLEVBQUVxSztDQUVwQyxtQkFBQSxPQUF1QkEsbUJBQW1CRDs7Q0FHMUMsU0FBS0UsS0FBS3RLLEVBQUVzSyxtQkFBbUIsS0FBS3RLLEVBQUVzSzs7Q0FHdEM7Q0FDQTtDQUNBOztDQUdBLFNBQUtDOztDQUNMOztDQUNBLFFBQUl2SyxFQUFFdUssZ0JBQU47Q0FBMEIsYUFBQSxJQUFXLENBQUNBO0NBQUksaUJBQUEsSUFBZSxDQUFDQTtDQUFLOztDQUMvRCxRQUFJdkssc0JBQUo7Q0FBOEIsaUJBQUE7Q0FBeUI7OztDQUd2RCxzQkFBa0JBO0NBQ2xCLHFCQUFpQkE7Q0FDakIsc0JBQWtCQTtDQUVsQixRQUFJQSxxQkFBSixtQkFBNkNBO0NBQ3pDO0NBQ1o7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTs7Q0FJUTtDQUNSO0NBQ0E7Q0FDQTtDQUNBOztDQUVRLG1EQUFpQixLQUFBO0NBRWpCLGVBQVdBO0NBQ1gsa0JBQWNBLFlBQVk7Q0FDMUIsa0JBQWNBO0NBRWQsb0JBQWdCQSxrQ0FBa0NBO0NBQ2xEO0NBRUEsMEVBQUE7O0NBR0EsYUFBUzs7Q0FHVCxhQUFTO0NBR1QsU0FBS2tCLENBQUwsQ0FBTyxvQkFBSyxpRkFBQTtDQUNaLFNBQUs3RSxDQUFMLENBQU8sVUFBVTZFLENBQUwsQ0FBTyxDQUFQO0NBRVosaUJBQUEsT0FBcUI3RSxDQUFMLENBQU8sQ0FBUDs7Q0FHaEIsb0JBQUE7Q0FDSSxXQUFLNkUsQ0FBTCxZQUFrQmQsZ0JBQWlCOUIsSUFBSTRLO0NBQ3ZDLFdBQUs3TSxDQUFMLFdBQWlCNkUsQ0FBTCxDQUFPO0NBQ25CLFdBQUtBLENBQUwsQ0FBTyxjQUFQLHFCQUF3QixRQUEwQmdJLEdBQTFCO0NBQ3hCLFdBQUs3TSxDQUFMLENBQU8sUUFBUDtDQUNIOztDQUVELFFBQUkyRCxLQUFKO0NBQ0ksV0FBSzNELENBQUwsQ0FBTyxXQUFQOztDQUNBLHNCQUFlaUs7Q0FDWCxhQUFLakssQ0FBTCxDQUFPLENBQVAsR0FBQSxLQUFnQixDQUFDaUssR0FBRjtDQUNsQjs7Q0FDRCxlQUFBO0NBQ0g7O0NBRUQsUUFBSXRHLEtBQUosT0FBaUIzRCxDQUFMLENBQU8sQ0FBUCxZQUFvQjJEO0NBR25DO0NBR0Q7Q0FDQTs7Ozs7O0NBSUksYUFBQSxVQUFtQjdEO0NBR25CLGlCQUFhRTs7Q0FDYixpQkFBYTZFOztDQUViN0UsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FFRCxpQkFBQSxFQUFpQkEsQ0FBQyxDQUFDLENBQUQsb0JBQXNCa087Q0FDeEMsb0JBQUEsRUFBb0JsTyxDQUFDLENBQUMsQ0FBRDs7Q0FHckIsUUFBSTZFLENBQUMsQ0FBQyxrQ0FBTjtDQUNJN0UsTUFBQUEsQ0FBQyxHQUFELEdBQU82RSxDQUFDLENBQUM7Q0FDVDdFLE1BQUFBLENBQUMsQ0FBQyxTQUFGLFNBQWUsSUFBRDtDQUNkQSxNQUFBQSxDQUFDLENBQUMsYUFBRixTQUFtQixJQUFEO0NBQ3JCOztDQUVEOztDQUVBLGtCQUFLLFFBQWlCNkUsUUFBdEIsV0FBQSxHQUE0QyxFQUE1QztDQUNJLFVBQUlBLENBQUM7Q0FDRHJHLFFBQUFBLGdCQUFBLENBQWtCcUcsQ0FBQyxDQUFDcEk7Q0FDcEJ1RCxRQUFBQSxHQUFDLENBQUQsR0FBTzZFLENBQUM7Q0FDWDtDQUNKOztDQUVELDRCQUFBO0NBQ0ksNkJBQUEsQ0FBeUJBLENBQUMsQ0FBQyxDQUFEO0NBQzdCO0NBQ0csZ0RBQWdCLENBQTZCQSxDQUFDLENBQUMsQ0FBRCxpQ0FDekMsQ0FBMkJBLENBQUMsQ0FBQyxDQUFEO0NBQ3BDOztDQUVEQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxrQkFBRDtDQUVBLGNBQUE7O0NBR0Esa0JBQUE7Q0FFSSxXQUFLQSxDQUFMLENBQU8sc0JBQVA7Q0FDQStJLFlBQU0vQztDQUVUO0NBRUo7Ozs7Q0FNRyx5QkFBTyxLQUFBLEtBQUEsTUFBQSxFQUFnQ2hILEVBQWhDO0NBRVY7OztDQUlHNEUsb0JBQUEsTUFBQSxPQUFBLEVBQWdDNUUsRUFBaEMsS0FBQTtDQUVIOzs7Q0FJRzRFLG9CQUFBLEtBQUE7Q0FFSDs7O0NBSUcsNEJBQU8sS0FBQSxLQUFBO0NBRVY7OztDQUlHLHdCQUFBLHFCQUF1QjtDQUN2QixzQ0FBTztDQUVWOzs7Q0FJRyxtQ0FBQSwwQkFBbUM7Q0FDbkMsZ0RBQXlCLENBQWxCO0NBRVY7OztDQUlHLHVCQUFBLDBCQUFzQjtDQUN0QixxQ0FBTztDQUVWOzs7Q0FJRyxtQkFBQSxzQkFBa0I7Q0FDbEIsaUNBQU87Q0FFVjs7OztDQU1JbUYscUJBQUE7Q0FFSjs7O3NDQU1XOztvQ0FFRDs7OztDQU1QLGdCQUFZL0ksQ0FBTCxDQUFPLENBQVA7Q0FFVjs7O0NBSUcsb0JBQUE7Q0FFQSxjQUFBLE9BQWdCN0UsQ0FBTCxDQUFPLENBQVAsb0JBQTRCa087Q0FFMUM7OztDQUlHLG9CQUFBO0NBRUEsY0FBQSxPQUFnQmxPLENBQUwsQ0FBTyxDQUFQO0NBRWQ7O21DQUVRQTtDQUVMLGFBQVM2RSxDQUFMLENBQU8sZ0JBQVgsT0FBa0NBLENBQUwsQ0FBTyxDQUFQLGdCQUF3QjdFO0NBRXhEOzs7Q0FJRzROLHdCQUFBO0NBQ0E7Q0FFSDs7O0NBSUcsZ0NBQUE7Q0FDQSxtQkFBQTtDQUNBLG1CQUFBO0NBRUEsMENBQWUsQ0FBZjtDQUVIOzt1Q0FFVWpPO0NBRVAscUJBQUEsNEJBQWlDLENBQWVBLENBQWY7Q0FBakMsc0JBRWtCQTtDQUNsQixlQUFBO0NBRUg7Q0FJRDtDQUNBOzs7dUNBRVd3TztDQUVQLG9CQUFBO0NBRUE7Q0FDQTtDQUVIO0NBR0Q7Q0FDQTs7O21EQUVpQkE7Q0FFYixvQkFBQTtDQUVBO0NBQ0EsdUJBQW1CQTtDQUNuQjtDQUVIOzsrQkFFTXhPO0NBRUhBO0NBQ0EsOEJBQTBCQSxjQUExQixNQUErQ0EsQ0FBQyxDQUFDLENBQUQ7Q0FFaEQ7Q0FDQSxnQ0FBQSw4QkFBNkRBO0NBQzdELHFCQUFBLGVBQW9CLEVBQUEsVUFBQTtDQUNwQjtDQUVIOztxQ0FFU0E7Q0FFTkE7Q0FDQSw4QkFBMEJBLGNBQTFCLE1BQStDQSxDQUFDLENBQUMsQ0FBRDtDQUVoRCx3QkFBQSxrQkFBdUIsQ0FBa0JBLENBQWxCO0NBQ3ZCLGdDQUFBLDhCQUE2REE7Q0FFaEU7Q0FHRDtDQUNBOzs7O0NBSUk4SSxxQkFBa0I1RCxDQUFMLENBQU8sQ0FBUCxDQUFiOztDQUVBLDRCQUFBO0NBQ0ksbUNBQThCQSxDQUFMLENBQU8sQ0FBUDtDQUM1QjtDQUNHLGtGQUNxQ0EsQ0FBTCxDQUFPLENBQVA7Q0FDbkM7O0NBRUQsa0JBQUEsbUJBQWlCO0NBRWpCO0NBQ0E7Q0FDQTtDQUNBO0NBRUg7Q0FHRDtDQUNBOzs7O0NBSUksdUJBQUE7Q0FFQSxhQUFTdUo7O0NBRVQsbUJBQUE7Q0FDSSxhQUFBLFNBQVUsUUFBY0w7Q0FDM0I7Q0FDRyxZQUFNLG1CQUFjLEdBQVM7Q0FDN0IsYUFBQSxhQUFVLEdBQWMsR0FBRztDQUMzQixhQUFBLG9CQUFzQixLQUFBLEdBQWM7Q0FDdkM7Q0FFSjs7O0NBSUcsdUJBQUE7Q0FDQSxTQUFLL04sQ0FBTCxDQUFPLENBQVA7Q0FDQSxvQkFBQSxPQUF3QkEsQ0FBTCxDQUFPLENBQVAsZUFBdUIrTjtDQUU3QztDQUdEO0NBQ0E7OztpREFFZ0JwSztDQUVaO0NBRUEsaUJBQWE7O0NBQ2IsUUFBR0EscUJBQUg7Q0FDSSxpREFBa0MsVUFBYSxvQkFDMUM7Q0FDUjs7Q0FFRCxlQUFXQSxrQ0FBa0NBO0NBQzdDLGVBQVdBLGlDQUFrQ0E7Q0FDN0MscUJBQWlCQSxnQ0FBZ0NBO0NBRWpELFFBQUkzRDs7Q0FFSjtDQUNJO0NBQVFBLFFBQUFBLENBQUM7Q0FBTTs7Q0FDZjtDQUFRQSxRQUFBQSxJQUFJO0NBQUs7O0NBQ2pCO0NBQVFBLFFBQUFBLElBQUk7Q0FBTTs7Q0FDbEI7Q0FBUUEsUUFBQUE7Q0FBVzs7Q0FDbkI7Q0FBUUEsUUFBQUE7Q0FBWTs7Q0FDcEI7Q0FBUUEsUUFBQUE7Q0FBYTtDQU56Qjs7Q0FTQSxnQkFBWTJELDJCQUE0QkE7Q0FDeEM7Q0FDQSx5Q0FBYTtDQUVoQjs7dUNBRVVhO0NBRVAsa0JBQUEsY0FBcUIsQ0FBVUEsQ0FBVjtDQUNyQiw0QkFBTyxtQkFBb0IsRUFBb0JBLENBQXBCLENBQXBCLDRCQUEwRTtDQUVwRjtDQUlEO0NBQ0E7Ozs2Q0FFYytGO0NBRVYsb0JBQUE7Q0FDQSxnQkFBWUEsTUFBTCxFQUFhQSxDQUFiO0NBRVY7O2lDQUVPQTtDQUFNO0NBQWU7O3lDQUVqQkE7Q0FBTTtDQUFlOzt5Q0FFckJBO0NBQU07Q0FBZTs7cUNBRXZCQTtDQUFNO0NBQWU7O3FDQUVyQkE7Q0FBTTtDQUFlOztpQ0FFdkJBO0NBQU07Q0FBZTtDQUk3QjtDQUNBOzs7O0NBSUk7Q0FDQTtDQUVIOztxQ0FFUzVLO0NBRU5BO0NBQ0EsU0FBS0ssQ0FBTCxDQUFPLENBQVA7Q0FHSDtDQUdEO0NBQ0E7Ozs7Q0FJSSxtQkFBQTtDQUNBO0NBRUg7OztDQUlHLG9CQUFBO0NBQ0E7Q0FFSDs7O0NBSUc0TjtDQUVIOzs7Q0FJR0E7Q0FFSDtDQUdEO0NBQ0E7OztzQ0FJQzs7MENBSUE7OztDQUlHQSx3QkFBQSxNQUFBO0NBRUg7O3FDQUVTcEM7Q0FFTix3QkFBTyxFQUFBLE1BQUE7Q0FFVjtDQUdEO0NBQ0E7Ozt1Q0FFVzlGO0NBRVA7Q0FFSDs7Ozs7S0M3a0JRMkksSUFBYjtDQUFBOztDQUVJLGdCQUFhMUs7Q0FBUzs7Q0FBQTtDQUFUQSxPQUFTLEdBQUw7Q0FBSzs7Q0FFbEIsOEJBQU9BO0NBRVAsa0JBQWFBO0NBRWIsd0JBQW1CQTtDQUVuQixnQkFBV0EsaUNBQVM7Q0FDcEIsZ0JBQVdBLFNBQVM7Q0FFcEI7Q0FFQSxVQUFLa0IsQ0FBTCxDQUFPLG9CQUFLLHFGQUEyRiwyR0FBM0Y7Q0FDWixVQUFLQSxDQUFMLENBQU8sb0JBQUssNkNBQXNELG1DQUE2QixvRUFBbkY7O0NBRVosY0FBQTs7Q0FDQSxnQkFBQTs7Q0FqQmtCO0NBbUJyQjtDQUdEO0NBQ0E7OztDQXpCSjs7Q0FBQSx3Q0EyQmdCMEY7Q0FFUix5QkFBQTtDQUVILEdBL0JMOztDQUFBLHdDQWlDZ0JBO0NBRVI7Q0FDQSxlQUFBO0NBQ0EsYUFBQTtDQUNBO0NBRUg7Q0F4Q0w7O0NBQUE7Q0E4Q1EsaUJBQWF2Szs7Q0FFYixrQkFBQTtDQUVJQSxNQUFBQSxDQUFDLENBQUMsYUFBRjtDQUNBQSxNQUFBQSxDQUFDLENBQUMsY0FBRjtDQUNBQSxNQUFBQSxDQUFDLENBQUMsYUFBRjtDQUVIO0NBRUdBLE1BQUFBLENBQUMsQ0FBQyxhQUFGO0NBQ0FBLE1BQUFBLENBQUMsQ0FBQyxjQUFGO0NBQ0FBLE1BQUFBLENBQUMsQ0FBQyxhQUFGO0NBRUg7Q0FFSixHQTlETDs7Q0FBQTtDQWtFUTs7Q0FDQSxpQkFBYUE7Q0FDYixxQkFBa0I7Q0FDbEJBLElBQUFBLENBQUMsQ0FBQyxDQUFEO0NBQ0RBLElBQUFBLENBQUMsQ0FBQyxDQUFEO0NBRUosR0F4RUw7O0NBQUE7Q0FBQSxFQUEwQjhOLEtBQTFCOztLQ0NhUSxNQUFiO0NBQUE7O0NBRUksa0JBQWEzSztDQUFTOztDQUFBO0NBQVRBLE9BQVMsR0FBTDtDQUFLOztDQUVsQiw4QkFBT0E7Q0FFUDtDQUVBLG1CQUFjQTtDQUVkLHdDQUFBLDhCQUFvRDs7Q0FHcEQ7O0NBR0EsVUFBS3pELHlCQUFLLHFCQUFBLG1CQUFBO0NBRVYsUUFBSXlELG1CQUFKLFFBQStCekQsRUFBTCxDQUFRLEtBQUt5RDtDQUN2QyxRQUFJQSxzQkFBSixRQUFrQ3pELEVBQUwsQ0FBUSxLQUFLeUQ7Q0FDMUMsUUFBSUEsdUJBQUosUUFBbUN6RCxFQUFMLENBQVEsS0FBS3lEO0NBQzNDLFFBQUlBLHFCQUFKLFFBQWlDekQsRUFBTCxDQUFRLEtBQUt5RDtDQUV6Qyx5QkFBb0JBO0NBQ3BCLHlCQUFvQkE7Q0FFcEIsMEJBQUE7Q0FFQTtDQUNBLGdCQUFXO0NBQ1gsaUJBQVk7O0NBRVosa0JBQUEsZUFBQSxHQUErQixFQUEvQjtDQUVJLFlBQUtrQixHQUFHLGNBQVdkLGlCQUFpQjlCLElBQUk0SyxHQUFULFNBQW9CNUssVUFBcEIseUJBQUEsU0FBNkQvQixFQUFMLEdBQXhELHlCQUFnRixxQkFBaEYsNEJBQUEscUJBQUEsZUFBQTtDQUMvQixZQUFLMkUsR0FBRyxHQUFDLGNBQVQ7Q0FDQSxZQUFLQSxHQUFHLEdBQUMsWUFBVCxlQUF3QixDQUFZcEk7Q0FDcEMsZ0JBQUE7Q0FFSDs7Q0FFRCxjQUFTb0ksQ0FBTCxDQUFPLGdCQUFYLFFBQW1DQSxDQUFMLENBQU8sQ0FBUCxnQkFBd0I7Q0FFdEQsMEJBQUEsa0JBQXdCOztDQUN4QiwwQkFBQTtDQUNJLFlBQUswSixHQUFMOztDQUNBLHNCQUFBO0NBQ0g7O0NBRUQsY0FBQTs7Q0EvQ2tCO0NBaURyQjs7Q0FuREw7O0NBQUEsc0NBcURlaEU7Q0FFUDtDQUNBLFFBQUk1RixDQUFDLE9BQU8sTUFBTUEsQ0FBQyxPQUFPLEVBQTFCLFNBQXNDO0NBRXRDO0NBQ0E7O0NBRUEsWUFBUSxFQUFSO0NBQ0MsVUFBSUEsR0FBQSxHQUFJa0IsQ0FBQyxDQUFDcEosQ0FBRCxDQUFELE9BQVdrSSxHQUFBLEdBQUlrQixDQUFDLENBQUNwSixDQUFELENBQUQsRUFBQSxXQUFrQjtDQUN6Qzs7Q0FFRCxXQUFPO0NBRVY7Q0FHRDtDQUNBO0NBdkVKOztDQUFBLG9DQXlFYzhOO0NBRU4sbUJBQUE7Q0FDSSxnQkFBQTtDQUNBLGlCQUFBOztDQUVBLDJCQUFPLENBQWdCQTtDQUMxQjs7Q0FFRDtDQUVILEdBcEZMOztDQUFBLHdDQXNGZ0JBO0NBRVgsNEJBQVcsQ0FBZUEsQ0FBZjtDQUVSLGFBQUE7Q0FFSDtDQUNHLG9DQUE4QixDQUFqQjtDQUNiLDBCQUFBLFdBQXlCOztDQUU1Qix5QkFBTyxDQUFnQkEsQ0FBaEI7Q0FJUCxHQXBHTDs7Q0FBQSx3Q0FzR2dCQTtDQUVSLFFBQUkwQztDQUVKLDRCQUFXLENBQWUxQyxDQUFmOztDQUlYLGlCQUFhLEVBQWI7Q0FDSTtDQUNBMEMsUUFBRSx5QkFBZSxJQUFBLEdBQWtCO0NBQ3RDO0NBQ0FBLFFBQUUsYUFBRztDQUNMOzs7Q0FJRCxXQUFPQTtDQUVWO0NBekhMOztDQUFBLGdDQTZIWXpJO0NBRUo7Q0FBQSxRQUFPUjs7Q0FFUCxrQkFBQSxjQUFBLEdBQStCLEVBQS9CO0NBRUksb0JBQWMsR0FBQyxDQUFmLEdBQW9CLGFBQWNRLENBQVgsR0FBZSxHQUFDLFNBQ2pDLGFBQWMsQ0FBWCxHQUFlLEdBQUM7Q0FFekIsVUFBRzdFLENBQUgsR0FBTztDQUVWOztDQUVELFdBQU9xRTtDQUVWLEdBNUlMOztDQUFBLDhCQStJV1E7Q0FFSDtDQUVBLG1CQUFlOztDQUVmLGlCQUFJLENBQVUvSCxRQUFkO0NBRUk7Q0FFSTtDQUFRLGVBQUsrUixLQUFLL1IsQ0FBVjtDQUFrQixnQkFBQSxDQUFRQSxDQUFDLE1BQUsrRyxRQUFRO0NBQWdCLGdCQUFBLENBQVEvRyxDQUFDLG1CQUFrQixLQUFLeUQ7Q0FBTzs7Q0FDdkc7Q0FBUSxlQUFLc08sS0FBSy9SLENBQVY7Q0FBa0IsZ0JBQUEsQ0FBUUEsQ0FBQyxNQUFLK0csUUFBUTtDQUFpQixnQkFBQSxDQUFRL0csQ0FBQyxtQkFBa0IsS0FBS3lEO0NBQU87O0NBQ3hHO0NBQVEsZUFBS3NPLEtBQUsvUixDQUFWO0NBQWtCLGdCQUFBLENBQVFBLENBQUMsTUFBSytHLFFBQVE7Q0FBaUIsZ0JBQUEsQ0FBUS9HLENBQUMsbUJBQWtCLEtBQUt5RDtDQUFPO0NBSjVHOztDQVFBdU8sWUFBTTtDQUVUOztDQUdEO0NBRUg7Q0F0S0w7O0NBQUE7Q0E0S1EsZUFBQTtDQUVBO0NBQ1I7Q0FDQTtDQUNBO0NBQ0E7O0NBR1EscUJBQU8sRUFBQSxFQUFnQixDQUFoQjtDQUVWO0NBQ0w7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FFSztDQWhNTDs7Q0FBQSxzQ0FvTWVsRTtDQUVQQSxJQUFBQSxnQkFBQTtDQUVBLFNBQUt2SyxDQUFMLENBQU8sQ0FBUDtDQUNBLFNBQUtBLENBQUwsQ0FBTyxDQUFQO0NBRUgsR0EzTUw7O0NBQUEsb0NBNk1jdUs7Q0FFTkEsSUFBQUEsZ0JBQUE7Q0FFQSxTQUFLdkssQ0FBTCxDQUFPLENBQVA7Q0FDQSxTQUFLQSxDQUFMLENBQU8sQ0FBUDtDQUVILEdBcE5MOztDQUFBLDhCQXNOV3VLO0NBRUhBLElBQUFBLGdCQUFBO0NBRUEsZ0JBQUEsQ0FBYUEsQ0FBYjtDQUNBLG1CQUFBLENBQWlCQSxvQkFBQSxDQUFxQixDQUFyQixDQUFqQjtDQUVILEdBN05MOztDQUFBO0NBaU9RLFNBQUsxRixDQUFMLENBQU8sbUJBQUssZ0VBQTBFLGdGQUFrRSw0QkFBM0gsY0FBQTs7Q0FDN0IsU0FBS0EsQ0FBTCxDQUFPLENBQVA7Q0FFQSxTQUFLQSxDQUFMLENBQU8sQ0FBUCw2QkFBQSxhQUF3QztDQUFhLG1CQUFBLENBQWMwRjtDQUFLLGdCQUF4RSxPQUFBO0NBQ0EsU0FBSzFGLENBQUwsQ0FBTyxDQUFQLDRCQUFBLGFBQXVDO0NBQWEsa0JBQUEsQ0FBYTBGO0NBQUssZ0JBQXRFLE9BQUE7Q0FDQSxTQUFLMUYsQ0FBTCxDQUFPLENBQVAsOEJBQUEsYUFBeUM7Q0FBYSxrQkFBQSxDQUFhMEY7Q0FBSyxnQkFBeEUsT0FBQTtDQUNBLFNBQUsxRixDQUFMLENBQU8sQ0FBUCx5QkFBQSxhQUFvQztDQUFhLGVBQUEsQ0FBVTBGO0NBQUssZ0JBQWhFLE9BQUE7Q0FHQTtDQUdILEdBN09MOztDQUFBO0NBaVBRLFNBQUsxRixDQUFMLENBQU8scUJBQUssc0dBQUE7O0NBQ1osU0FBS0EsQ0FBTCxDQUFPLENBQVA7Q0FDQSxTQUFLQSxDQUFMLENBQU8sQ0FBUDtDQUVBLFNBQUtBLENBQUwsQ0FBTyxDQUFQLDJCQUFBLGFBQXNDO0NBQWEscUJBQUEsZUFBaUIsQ0FBZSxDQUFmO0NBQXNCLGdCQUExRixPQUFBO0NBR0E7Q0FDQTtDQUVBO0NBRUgsR0E3UEw7O0NBQUE7Q0FpUVEsd0JBQWMsT0FBQSxPQUFBLFFBQUEsT0FBQTtDQUNkLHdCQUFjLEtBQUEsT0FBQSxPQUFBLE9BQUEsT0FBQTtDQUlkO0NBRUE7Q0FDQTs7Q0FFQSwwQkFBQTtDQUVBLCtCQUFhO0NBQ2I7Q0FDQSx5REFBVyxjQUFBO0NBRVgsa0NBQWdDLEVBQWhDLDJCQUFxQyxxQ0FDQSxFQUFoQywrQkFBcUM7Q0FBckMsK0JBQ0E7Q0FHTDtDQUNBO0NBQ0E7Q0FDQTs7Q0FFQTZKLCtCQUFnQjtDQUVaLHNDQUFvQjtDQUVwQjtDQUNILGVBTGU7Q0FPbkIsR0FsU0w7O0NBQUEsd0NBb1NvQmxLO0NBRVpBLGFBQVM7Q0FDVCxTQUFLSyxDQUFMLENBQU9MLENBQVA7Q0FFSCxHQXpTTDs7Q0FBQSxzQ0EyU21CaUgsR0FBR2pIO0NBRWRBLGFBQVM7Q0FDVCxTQUFLeEUsQ0FBTCxDQUFPd0UsQ0FBUCxZQUFvQjtDQUNwQixTQUFLSyxDQUFMLENBQU9MLENBQVA7Q0FFSCxHQWpUTDs7Q0FBQTtDQXFUUTs7Q0FFQSxpQkFBYXhFO0NBQ2IsaUJBQWFnTztDQUNiLGlCQUFhRDtDQUViO0NBQ0EsUUFBSVksS0FBTTtDQUNWLHlCQUFXLENBQVksS0FBS0EsVUFBTSxNQUFRbFMsQ0FBL0I7O0NBRVgsWUFBUSxFQUFSO0NBRUMsV0FBS21TLEdBQUwsbUJBQTZCLE9BQVMsSUFBVixLQUF1QixJQUFuQztDQUNoQixXQUFLQSxHQUFMLENBQVNuUyxDQUFULFlBQXNCbVMsR0FBTCxDQUFTblMsQ0FBVCxZQUFzQm1TLEdBQUwsQ0FBU25TLENBQVQsRUFBWTtDQUUzQ3VELE1BQUFBLEdBQUcsR0FBQyxPQUFKLFFBQW1CNE8sR0FBTCxDQUFTblMsQ0FBVDtDQUNkdUQsTUFBQUEsR0FBRyxHQUFDLFFBQUosUUFBb0I0TyxHQUFMLENBQVNuUyxDQUFUO0NBRWxCOztDQUVELHlCQUFBO0NBQ0l1RCxNQUFBQSxDQUFDLENBQUMsT0FBRixJQUFjLE9BQUQsS0FBRDtDQUNaQSxNQUFBQSxDQUFDLENBQUMsUUFBRixPQUFpQjtDQUNwQjs7Q0FFRCx5QkFBQTtDQUNJQSxNQUFBQSxDQUFDLENBQUMsT0FBRixJQUFhO0NBQ2JBLE1BQUFBLENBQUMsQ0FBQyxRQUFGLE9BQWlCO0NBQ3BCO0NBRUosR0FuVkw7O0NBQUE7Q0FBQSxFQUE0QjhOLEtBQTVCOztLQ0FhZSxRQUFiO0NBQUE7O0NBRUksb0JBQWFsTDtDQUFTOztDQUFBO0NBQVRBLE9BQVMsR0FBTDtDQUFLOztDQUVsQiw4QkFBT0E7Q0FFUDtDQUVBOztDQUVBLHVCQUFBLENBQW9CQSxDQUFwQjs7Q0FFQTs7Q0FFQSx1QkFBa0J2RSxLQUFLO0NBQ3ZCLHNCQUFpQkE7Q0FFakIsdUJBQWtCeU8sRUFBSjtDQUVkLGNBQVNsSyxDQUFDLGdCQUFlO0NBQ3pCLGdCQUFXO0NBRVgsVUFBS2tCLENBQUwsQ0FBTyxDQUFQOztDQUVBLGNBQVFBLENBQUwsQ0FBTyxnQkFBVjtDQUVJLFlBQUtBLENBQUwsQ0FBTyxjQUFQLFVBQXdCO0NBQ3hCLFlBQUtBLENBQUwsQ0FBTyxrQkFBUDtDQUNBLFlBQUswSCxHQUFMLEdBQVc7Q0FDWCxpQkFBVTtDQUViOztDQUVELG9CQUFlO0NBRWYsa0JBQWE7Q0FFYixVQUFLMUgsQ0FBTCxDQUFPLG9CQUFLLHlEQUFrRSw2REFBbEU7Q0FDWixVQUFLQSxDQUFMLENBQU8sc0JBQUs7O0NBRVosdUJBQWtCQSxDQUFMLENBQU8sRUFBcEIsS0FBQSxnQkFBNkIsRUFBN0IsRUFBOEMsQ0FBOUM7O0NBQ0EsdUJBQWtCQSxDQUFMLENBQU8sRUFBcEIsVUFBQSxpQkFBQSxFQUFrRCxDQUFsRDs7Q0FFQSx1QkFBa0JBLENBQUwsQ0FBTyxFQUFwQixXQUFBLGlDQUEwRGhGLENBQTFEOztDQUNBLHVCQUFrQmdGLENBQUwsQ0FBTyxFQUFwQjtDQUEwQndCO0NBQWNDO0NBQWV3SSxVQUFJO0NBQUl2QyxNQUFBQSxXQUFTQTtDQUFoRCxLQUF4Qjs7Q0FFQSxjQUFBOztDQUNBLGdCQUFBOztDQTdDa0I7Q0ErQ3JCOztDQWpETDs7Q0FBQTtDQXFEUSw0QkFBQTs7Q0FFQTtDQUNJO0NBQVE7Q0FDSixhQUFLdk0sQ0FBTCxZQUFrQjtDQUNsQixvQkFBYSxLQUFLNkUsRUFBRSwrQkFBcEI7Q0FDQSxvQkFBYSxLQUFLQSxFQUFFLGNBQWMsY0FBbEM7Q0FDSjs7Q0FDQTtDQUFRO0NBQ0osYUFBSzdFLENBQUwsWUFBa0I7Q0FDbEIsb0JBQWEsS0FBSzZFLEVBQUUsK0JBQXBCO0NBQ0Esb0JBQWEsS0FBS0EsRUFBRSxjQUFjLGNBQWxDO0NBQ0o7Q0FWSjs7Q0FhQTtDQUNBO0NBRUgsR0F2RUw7O0NBQUE7Q0E0RVE7Q0FHSDtDQUdEO0NBQ0E7Q0FuRko7O0NBQUEsb0NBcUZjMEY7Q0FFTjtDQUNBLGdCQUFBO0NBQ0Esb0JBQU8sQ0FBVSxDQUFWO0NBRVYsR0EzRkw7O0NBQUEsd0NBNkZnQkE7Q0FFUjtDQUNBO0NBQ0E7Q0FDQSxrQkFBQSxDQUFnQkEsQ0FBaEI7Q0FDQSxvQkFBTyxDQUFVLENBQVY7Q0FFVixHQXJHTDs7Q0FBQSx3Q0F1R2dCQTtDQUVSO0NBRUEsb0JBQUE7Q0FFQTtDQUVBd0UsT0FBRyxvQkFBb0J4RSxxQkFBWSxDQUFVaUIsQ0FBckM7Q0FDUnVELE9BQUcsb0JBQW9CeEUscUJBQVksYUFBM0I7Q0FFUixzQkFBUztDQUNUOztDQUVBLDBCQUFBO0NBRUksVUFBSXlFLEdBQUcsU0FBRztDQUNWLFlBQUEsUUFBY0MsSUFBSUQsV0FBVyxHQUFwQixZQUFBO0NBRVQsVUFBSUEsR0FBRyxHQUFHLFNBQUk7Q0FDZCxVQUFJQSxHQUFHLElBQUksU0FBSTtDQUVsQjs7Q0FFRDtDQUNBO0NBRUE7O0NBRUEsd0NBQUE7Q0FDSXhLLE9BQUMsR0FBRyxDQUFDLEdBQUs7Q0FDVixnQkFBQSxzQkFBaUMwSyxHQUFMLElBQWM7Q0FDMUM7Q0FDQSxXQUFLQSxHQUFMO0NBQ0EsZUFBQTtDQUNIO0NBRUo7Q0E1SUw7O0NBQUE7Q0FrSlEsWUFBUTtDQUNSLFlBQVE7Q0FDUjtDQUNBLFFBQUloSCxxQkFBYyxDQUFTekQsS0FBTWtDO0NBQ2pDLFFBQUl3QixxQkFBYyxDQUFTMUQsS0FBTWtDO0NBQ2pDLHVCQUFtQnZILFNBQVM7Q0FDNUIsdUJBQWlCdUgsMkRBQTJEdUIsV0FBV0M7Q0FFMUYsR0ExSkw7O0NBQUE7Q0E4SlEsU0FBS3RELENBQUwsQ0FBTyxDQUFQO0NBQ0E7Q0FFQSxxQkFBa0JBLENBQUwsQ0FBTyxFQUFwQixLQUFBLGVBQTZCLEVBQTdCLEVBQThDLENBQTlDO0NBQ0EsUUFBSW9JLEVBQUosV0FBUztDQUVaLEdBcEtMOztDQUFBO0NBQUEsRUFBOEJhLEtBQTlCOztLQ0NhcUIsS0FBYjtDQUFBOztDQUVJLGlCQUFheEw7Q0FBUzs7Q0FBQTtDQUFUQSxPQUFTLEdBQUw7Q0FBSzs7Q0FFbEIsOEJBQU9BOztDQUlWLGtCQUFhQTtDQUViLHdCQUFrQnFLLHVCQUFzQkE7Q0FFeEMsUUFBR3JLLEVBQUV5TCxlQUFMLGdCQUFvQ3pMLEVBQUV5TDs7Q0FHdEMsaUJBQVl6TDtDQUNaLFVBQUtzSixpQ0FBZ0M7Q0FFckMsd0JBQWtCbk47Q0FFbEIsdUJBQWtCK04sRUFBSjtDQUNkLHNCQUFpQkEsRUFBSjtDQUNiLGtCQUFhQSxFQUFKO0NBRVQsVUFBS2hKLENBQUwsQ0FBTyxvQkFBSyx5Q0FBbUQsK0VBQW1FLFVBQXRIO0NBQ1osVUFBSzdFLENBQUwsQ0FBTyxXQUFVNkUsQ0FBTCxDQUFPLENBQVA7O0NBRVosY0FBU29JLEVBQVQ7Q0FDSSxZQUFLak4sQ0FBTCxDQUFPLEdBQUd1TSxHQUFWO0NBQ0EsWUFBS3ZNLENBQUwsQ0FBTyxTQUFQO0NBQ0g7O0NBRUQsVUFBSzZFLENBQUwsQ0FBTyx1QkFBSztDQUNaLFVBQUtBLENBQUwsQ0FBTyxDQUFQO0NBRUE7Q0FDQTs7Q0FDQSxRQUFJbEIscUJBQUo7Q0FDSSwrQ0FBK0IsaUJBQWEseUJBQzlCLFFBQUEsY0FBVyxrQkFBYSwwQkFDakM7Q0FDUjs7Q0FFRDtDQUNBO0NBQ0E7Q0FFQSxVQUFLMEwsS0FBSztDQUNWLHlCQUFXLENBQVUsV0FBVUE7Q0FFL0IsZ0JBQVc7Q0FDWDs7Q0FFQSw4QkFBQTs7Q0FFQSxjQUFBOztDQUVBLFFBQUkxTCxvQkFBSixZQUEyQjtDQXZETjtDQXlEeEI7O0NBM0RGOztDQUFBO0NBK0RFO0NBQ0EsUUFBSWdCLENBQUMsT0FBTyxNQUFNQSxDQUFDLE9BQU8sRUFBMUIsU0FBc0M7O0NBSXRDLGFBQVNzSSxpQkFBVDtDQUVDLFVBQUl0SSxHQUFBO0NBR0o7Q0FFQSxVQUFJQSxHQUFBLGFBQU0sR0FBVztDQUlyQjtDQUVFO0NBR0Q7Q0FDQTtDQXJGSjs7Q0FBQSxvQ0F1Rlc0RjtDQUVOO0NBQ0E7Q0FFSCxHQTVGRjs7Q0FBQSx3Q0E4RmFBO0NBR1gsNEJBQVcsQ0FBZUEsU0FBZixFQUEwQkEsU0FBMUI7O0NBSVgsd0JBQUE7Q0FDQyxpQ0FBbUIsa0JBQ1I7Q0FDTDtDQUNOOztDQUdELHdCQUFBO0NBRUMsaUJBQUE7Q0FDQSxtQkFBQTtDQUNBLG9CQUFBLENBQWdCQTtDQUNoQjtDQUNELEdBbEhGOztDQUFBLHdDQW9IYUE7Q0FFUiw0QkFBVyxDQUFlQSxTQUFmLEVBQTBCQSxTQUExQjtDQUVYO0NBQUE7Q0FBQTtDQUFBO0NBQUE7Q0FBQTtDQUFBO0NBQUE7Q0FBQTtDQUFBLFFBQTBDaE07Q0FFMUMsd0JBQUEsdUJBQXVCOztDQUV2Qix3QkFBQTtDQUVDd1EsTUFBQUEsR0FBRztDQUNIQSxNQUFBQSxLQUFBLDJCQUFzQixlQUFBLFFBQWtDakg7Q0FDeERpSCxNQUFBQSxLQUFBLDJCQUFzQixlQUFBLFFBQWtDakg7Q0FDM0RuQixPQUFDLEdBQUdvSTtDQUNKTyxRQUFFLEdBQUdQLFNBQUE7Q0FDTCxZQUFLLEdBQUcsY0FBYyxDQUFDM1A7Q0FHcEIsV0FBTSxHQUFHLGdFQUNlOztDQUV4QjtDQUVDLFlBQUk7Q0FDSCxlQUFLdUgsQ0FBTDtDQUNBLDBCQUFnQjtDQUNoQjs7Q0FFRCxZQUFLLEtBQUtBO0NBRVQsY0FBSyxTQUFTO0NBQVk7Q0FFdEI0SSxZQUFBQSxHQUFHLEdBQUcsQ0FBRUQsS0FBSy9RLE1BQVAsS0FBbUIsQ0FBQ2M7Q0FDMUIsaUJBQUtrUSxPQUFPQSxNQUFNLENBQVA7Q0FDWCxpQkFBS0MsTUFBTCxHQUFjRCxNQUFNLE1BQVIsT0FBcUJFLE1BQXJCLE9BQWtDQSxHQUFMO0NBRTVDO0NBQVE7Q0FFUmpFLGFBQUMsZ0JBQWdCa0U7Q0FDakJqRSxhQUFDLGdCQUFnQmlFOztDQUVqQixnQkFBSUosV0FBV0MsT0FBTzs7Q0FDdEIsZ0JBQUdELEdBQUUsR0FBRyxVQUFTO0NBRWpCSyxZQUFBQSxVQUFVLENBQUNDLEtBQUwsQ0FBVyxDQUFDbkU7Q0FDbEIsZ0JBQUdrRSxHQUFHLEdBQUcsVUFBVTtDQUVuQix3QkFBYUEsTUFBTXBSLFVBQVUsTUFBaEIsTUFBRixLQUFvQztDQUEvQyx1QkFDT3NSLElBQUksSUFBSyxJQUFFLENBQUgsR0FBUXRSLENBQUMsQ0FBQ2E7Q0FEekI7Q0FBQSxnQkFHQXNHLENBQUMsR0FBTUssS0FBSzBCLElBQUlxSTtDQUhoQixnQkFJQTlMLENBQUMsYUFBZ0J3SCxDQUFDLEdBQUNBLENBQUY7Q0FKakIsb0JBS0ksYUFBYS9HLENBQUMsR0FBQ0EsQ0FBRjs7Q0FFakIsb0JBQVFzTDtDQUNWLG9CQUFNO0NBQ04sa0JBQUlDLElBQUksUUFBUUMsT0FBTztDQUN2QixrQkFBR0QsUUFBUSxPQUFRQSxPQUFPelIsZ0JBQ2R5UixPQUFPLEVBQUUsT0FBUUEsT0FBTyxDQUFDelI7Q0FFckNvUixjQUFBQSxPQUFPSyxJQUFJO0NBRVhILGNBQUFBLElBQUksR0FBRyxDQUFDRixRQUFRclEsT0FBUWYsVUFBVStRLE9BQU8vUSxFQUFFYyxPQUMzQ3lRLElBQUksZ0JBQVcsSUFBUyxDQUFDMVEsTUFBT2I7Q0FDaENtSCxlQUFDO0NBQ0QxQixlQUFDLEdBQUcrTCxJQUFJLE9BQU8sT0FBTyxJQUFELEdBQU1ySztDQUMzQjs7Q0FFRHdLLFlBQUFBLGNBQVEsa0JBQTJCQyxHQUE3QjtDQUVOLGlDQUFzQkQsR0FBRyxNQUFaO0NBQ2JFLFlBQUFBLE1BQU8sU0FBRSxrQkFBNEJmLEtBQUssTUFBTyxXQUFXQSxFQUFyRDtDQUNQZSxZQUFBQSxPQUFPLENBQUMxUSxLQUFGLENBQVMwUSxHQUFULEVBQWM7Q0FFZCxpQkFBS1osTUFBTCxDQUFZLE1BQU1DLEtBQUwsTUFBRCxFQUFtQlM7Q0FFbEM7Q0FDSjtDQUNEO0NBQ0Q7Q0FFRDtDQXJNRjs7Q0FBQTtDQTJNRTtDQUNBLFNBQUtsUSxDQUFMLENBQU8sQ0FBUDtDQUNBLGFBQUEsVUFBbUJGO0NBRW5CLEdBL01GOztDQUFBLDhDQWlOZ0IrRjtDQUVkLGlDQUFBLHVCQUFpQyxDQUF1QkEsQ0FBdkIsb0JBQ3pCLGdCQUFpQixDQUFnQkEsQ0FBaEI7Q0FFekIsR0F0TkY7O0NBQUE7Q0EwTkU7O0NBRUEsa0JBQUE7Q0FFQSxhQUFTb0gsRUFBVCxXQUFjLG1CQUE0QjtDQUUxQztDQUVHLFNBQUtqTixDQUFMLENBQU8sQ0FBUDs7Q0FFQSxxQkFBQSxDQUFtQjZGLENBQW5CO0NBRUgsR0F0T0Y7O0NBQUE7Q0EwT0U7O0NBRUEsYUFBU29ILEVBQVQsV0FBYyxtQkFBNEI7Q0FFMUM7Q0FFQSxrQkFBQTtDQUVHLFNBQUtqTixDQUFMLENBQU8sQ0FBUDs7Q0FFQSxxQkFBQSxDQUFtQixDQUFDNkYsQ0FBcEI7Q0FFSCxHQXRQRjs7Q0FBQTtDQTBQSyxRQUFJM0Ysa0NBQXFCLFVBQWlCLENBQVMsRUFBWCxHQUFBLEtBQUEsQ0FBZixDQUFoQjtDQUVULG9CQUFBO0NBRUE7Q0FFQSxxQkFBa0IyRSxDQUFMLENBQU8sRUFBcEIsUUFBQSxFQUFnQzNFLEVBQWhDLEdBQUEsRUFBdUMsQ0FBdkM7Q0FHQSxTQUFLRixDQUFMLENBQU8sQ0FBUDtDQUNBLFNBQUs2RSxDQUFMLENBQU8sQ0FBUCwyQ0FBd0I7Q0FFeEIsOENBQWM7Q0FDZCxTQUFLN0UsQ0FBTCxDQUFPLENBQVA7Q0FFQSxTQUFJaU4sRUFBSjtDQUVBLDhCQUFBLG9CQUE2QjtDQUM3Qiw0QkFBQSxrQ0FBc0MsQ0FBWDtDQUMzQiw0QkFBQSxzQ0FBc0MsQ0FBWDtDQUMzQiw2QkFBQSxXQUE0QjtDQUUvQixHQWhSRjs7Q0FBQTtDQW9SSyxtQ0FBYTs7Q0FDYixzQ0FBQTtDQUVJLGlCQUFBO0NBQ0EsV0FBS2pJLEdBQUw7Q0FDQSxXQUFLeUssR0FBTCx1QkFBZ0N6SztDQUVoQyxXQUFLdUssR0FBTCxRQUFnQkUsR0FBTCxDQUFTO0NBRXBCLGlCQUFBO0NBQ0g7O0NBQ0Q7Q0FFSCxHQWpTRjs7Q0FBQTtDQXFTSztDQUNBLGlDQUFXO0NBQ1gseUNBQWM7Q0FDZCxvQkFBQTtDQUNBO0NBRUgsR0EzU0Y7O0NBQUE7Q0ErU0UsaUJBQWExUDtDQUNiO0NBRUc7Q0FDQSxvQkFBUSxDQUFTLEtBQUt4QjtDQUN0Qix3QkFBb0JBLEVBQUVhO0NBQ3RCLGlCQUFhaVE7Q0FDYixvQkFBUSxDQUFTLENBQVQ7Q0FDUixvQkFBUSxDQUFTLENBQVQ7Q0FDUixvQkFBUSxDQUFTLENBQVQ7Q0FFUixnQkFBWSxLQUFNOVEsVUFBV0E7Q0FFN0J1QixRQUFJLEtBQU12QjtDQUViLFFBQUk4UixhQUFLLENBQVN2USxLQUFLa0U7Q0FDdkIsUUFBSXNNLGNBQU0sQ0FBU3hRLEtBQUtrRTtDQUN4QixRQUFJb0ssYUFBSyxjQUFzQnBLO0NBQy9CLFFBQUl1TSxjQUFNLGNBQXNCdk07Q0FDaEMsUUFBSXdNLGFBQUssY0FBc0J4TTtDQUMvQixRQUFJeU0sY0FBTSxjQUFzQnpNO0NBQ2hDLFFBQUlvSSxNQUFNZ0MsS0FBS29DO0NBQWYsVUFBMEIsV0FBRztDQUM3Qi9MLFFBQUssaUJBQVMsS0FBYSxPQUFPekU7Q0FDbEMsWUFBUW9PLE1BQU1vQyxLQUFLcEMsV0FBV2lDLEtBQUtqRSxNQUFNM0g7Q0FDekMsWUFBUThMLE1BQU1FLEtBQUtGLFdBQVdELEtBQUt4RSxNQUFNckg7Q0FFdEMxRSxJQUFBQSxLQUFBLEVBQUEsRUFBVTBMLENBQVYsZUFBQTtDQUdBOztDQUVBLHFCQUFrQjVHLENBQUwsQ0FBTyxFQUFwQixhQUFBLDBCQUFBLEVBQTJELENBQTNEO0NBRUEscUJBQWtCQSxDQUFMLENBQU8sRUFBcEIsTUFBQSxFQUE4QjlFLENBQUMsRUFBL0IsRUFBbUMsQ0FBbkM7Q0FDQSxxQkFBa0I4RSxDQUFMLENBQU8sRUFBcEIsTUFBQSxFQUE4QjlFLENBQUMsRUFBL0IsRUFBbUMsQ0FBbkM7Q0FFQSxxQkFBa0I4RSxDQUFMLENBQU8sRUFBcEIsVUFBQSwrQkFBQSxHQUFBLEVBQW9FLENBQXBFO0NBQ0EscUJBQWtCQSxDQUFMLENBQU8sRUFBcEIsVUFBQSwrQkFBQSxFQUFpRSxDQUFqRTtDQUNBLHFCQUFrQkEsQ0FBTCxDQUFPLEVBQXBCLFFBQUEsYUFBQSxFQUE0QyxDQUE1QztDQUVILEdBdlZGOztDQUFBO0NBMlZLO0NBQ0E7O0NBRUEsaUJBQWE3RTtDQUViQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxlQUFpQmdPO0NBQ2xCaE8sSUFBQUEsQ0FBQyxDQUFDLENBQUQsY0FBZ0IrTjtDQUVqQixjQUFBLGVBQWUsNEJBQUE7Q0FDZixjQUFBLDJDQUFxRDtDQUNyRCwwQ0FBVztDQUdYLHFCQUFrQmxKLENBQUwsQ0FBTyxFQUFwQixXQUFBLHdDQUFBO0NBQ0E3RSxJQUFBQSxDQUFDLENBQUMsQ0FBRDtDQUNEQSxJQUFBQSxDQUFDLENBQUMsQ0FBRDtDQUNEQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxtQkFBVztDQUNaQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxrQkFBVTtDQUVYO0NBQ0EsdUJBQW1CLHNCQUFBLENBQUw7Q0FFZCxrQkFBQTtDQUVILEdBblhGOztDQUFBO0NBQUEsRUFBMkI4TixLQUEzQjs7S0NEYTRDLEdBQWI7Q0FBQTs7Q0FFSSxlQUFhL007Q0FBUzs7Q0FBQTtDQUFUQSxPQUFTLEdBQUw7Q0FBSzs7Q0FFbEIsOEJBQU9BO0NBRVA7Q0FFQTtDQUVBLHdCQUFrQjdEO0NBQ2xCLGtCQUFhNkQsV0FBVztDQUV4QixnQkFBV0EsU0FBUztDQUNwQixjQUFTO0NBRVQsc0JBQWlCQSxlQUFlO0NBR2hDLG1CQUFjQTtDQUNkLGtCQUFhQSxpQkFBVyxNQUFBO0NBQ3hCLFFBQUl6RCxLQUFLeUQsRUFBRXpELGlCQUFNLGFBQUE7Q0FHbEI7O0NBRUMsbUJBQWN5RDtDQUVkLGtCQUFhQSxlQUFXLEtBQUEsS0FBQTtDQUV4QixrQkFBYUE7Q0FFYixtQkFBYztDQUNkLG1CQUFjO0NBQ2Qsd0JBQW1COztDQUVuQixxQkFBQTtDQUVJLFlBQUtnTixHQUFMLHdDQUFrREEsR0FBdkMsb0JBQWdFQSxxQkFBaEUsUUFBK0ZBO0NBQzFHLHFCQUFBOztDQUNBLG9CQUFBOztDQUNBLGtCQUFBO0NBRUEsY0FBQTtDQUNBLFlBQUtDLEdBQUw7Q0FDQSxZQUFLQyxHQUFMO0NBQ0EsY0FBQTtDQUVBLGlCQUFBLDhDQUFhLE9BQUE7Q0FHZDs7Q0FFQztDQUVJLG9CQUFXQzs7Q0FDWDVRLFdBQUc0UTtDQUVOOztDQUVELFlBQUtqRSxHQUFMO0NBRUg7O0NBR0QsNENBQW1DO0NBRW5DLFVBQUtoSSxDQUFMLENBQU8sQ0FBUDtDQUNBLFVBQUtBLENBQUwsQ0FBTyxDQUFQO0NBQ0EsVUFBS0EsQ0FBTCxDQUFPLENBQVA7Q0FFQSw4RkFBcUYseUxBQXRFO0NBRWYsMEJBQUE7Q0FFQSxVQUFLQSxDQUFMLENBQU8scUJBQUssNEJBQUEsRUFBOEMsRUFBOUM7O0NBRVosVUFBS0EsQ0FBTCxDQUFPLENBQVAsd0JBQUEsNEJBQUE7O0NBQ0EsVUFBS0EsQ0FBTCxDQUFPLENBQVAsdUJBQUEsUUFBQTs7Q0FDQSxVQUFLQSxDQUFMLENBQU8sQ0FBUCxzQkFBQSxRQUFBOztDQUNBLFVBQUtBLENBQUwsQ0FBTyxDQUFQLG9DQUFBLFFBQUE7Q0FJQTtDQUVBOzs7Q0FDQSxVQUFLQSxDQUFMLENBQU8scUJBQUssZ0dBQUE7Q0FBK0c4QixNQUFBQTtDQUFtQkQ7Q0FBcUI5RTtDQUExQyxLQUE3Rzs7Q0FHWixVQUFLaUQsQ0FBTCxDQUFPLG9CQUFLLG9FQUE2RSx1REFBN0U7O0NBR1osUUFBSWxCLFlBQUosUUFBd0JrQixDQUFMLENBQU8sb0JBQUssK0ZBQUE7Q0FFL0I7Q0FFQSxrQkFBYTdFO0NBRWJBLElBQUFBLENBQUMsQ0FBQyxDQUFEO0NBQ0RBLElBQUFBLENBQUMsQ0FBQyxDQUFELHlCQUF3QjtDQUN6QkEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FFRCwwQkFBQSxFQUF5QkEsQ0FBQyxDQUFDLENBQUQ7Q0FDMUJBLElBQUFBLENBQUMsQ0FBQyxDQUFEO0NBS0QsWUFBUTs7Q0FFUixjQUFBLHdCQUFBLEdBQWdDLEVBQWhDO0NBRUksY0FBUSxHQUFHO0NBQ1gsV0FBSyxTQUFRK1EsR0FBTDs7Q0FDUixhQUFPdFU7Q0FBTXVVLFFBQUFBLEtBQUtGLElBQUwsQ0FBVTtDQUF2Qjs7Q0FFQSxpQkFBQSxxQkFBc0IsR0FBTixHQUF3Qjs7Q0FFeEM7O0NBQ0EsdUJBQUEsQ0FBaUI7OztDQUVqQix5REFBaUQ1USxFQUFFLEdBQTVCLFNBQUEsY0FBeUMsR0FBekMsR0FBd0Q7Q0FFbEY7O0NBRUQySDs7Q0FDQSxZQUFPLEVBQVA7Q0FDSSxZQUFLOUQ7Q0FBcUIyQyxRQUFBQSxnQkFBYXhHLElBQUU7Q0FBd0I7Q0FBa0IwQiwwQkFBZTFCLElBQUU7Q0FBVztDQUF2RixlQUFvSTJFLENBQUwsQ0FBTyxDQUFQO0NBQzFKOztDQUdELGNBQUE7OztDQW5Ja0I7Q0F1SXJCO0NBR0Q7Q0FDQTs7O0NBN0lKOztDQUFBLHdDQStJZ0IwRjtDQUVSLG1CQUFBLFlBQWtCLGlCQUNiO0NBRVI7O0NBSUQ7Q0FDSjtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQXhLQTs7Q0FBQSw4QkE2S1c1SztDQUVILGtCQUFjQTtDQUNkLG9CQUFBO0NBQ0Esa0JBQUE7Q0FDQSxlQUFBO0NBRUgsR0FwTEw7O0NBQUE7Q0F3TFEsWUFBUTtDQUNSSSxnQkFBYSxXQUFZOztDQUN6QixrQkFBQSxrQkFBQSxHQUFvQyxFQUFwQztDQUE0Q0Esb0JBQUssR0FBWSxHQUFaLFFBQXVCLENBQUN0RDtDQUFLOztDQUM5RXNELDZCQUF5QixXQUFXO0NBQ3BDLFdBQU9BO0NBRVYsR0E5TEw7O0NBQUE7Q0FrTVE7Q0FBQSxRQUE0QjhGOztDQUM1QixrQkFBSyx5QkFBTCxTQUFBLEdBQThDLEVBQTlDO0NBQW1EQSwyQkFBSyxNQUF1QmxHLENBQUMsQ0FBQ2tJLDBCQUF6QjtDQUF4RDs7Q0FDQSxTQUFLaEQsQ0FBTCxDQUFPLENBQVAsY0FBc0JnQjtDQUV6QixHQXRNTDs7Q0FBQTtDQTBNUSxtQkFBZWhCLENBQUwsQ0FBTyxDQUFQO0NBQ1Y7Q0FBQTtDQUFBLFdBQWlDO0NBQWpDLFFBQXVDTCxDQUFDOztDQUV4QyxZQUFRLEVBQVI7Q0FDSSxxQkFBQSxHQUFtQixlQUFJLE1BQWUwSyxpQkFBTyxDQUFXMUssU0FDakQsY0FBSSxnQkFBaUIsQ0FBV0E7Q0FDdkMsaUJBQUEsQ0FBWUEsUUFBWjtDQUNBLGlCQUFBLENBQVlBLE9BQVosTUFBMEI3RTtDQUMxQixrQkFBYXNILEtBQUssOEJBQW9CLENBQVl6QyxFQUEzQixDQUF2QixHQUF5RCxHQUFDO0NBQzFEMEssTUFBQUEsa0JBQU8sQ0FBWTFLO0NBQ25CQSxNQUFBQSxDQUFDO0NBRUo7Q0FFSixHQXhOTDs7Q0FBQTtDQTROUTs7Q0FFQTtDQUVBLHFCQUFrQkssQ0FBTCxDQUFPLEVBQXBCLEtBQUEscUJBQUE7O0NBRUEsaUNBQUE7Q0FBaUM7Q0FBcUMsd0JBQ2pFLDJCQUFnQjs7Q0FFckIsU0FBSzdFLENBQUwsQ0FBTyxDQUFQO0NBQ0EsU0FBS0EsQ0FBTCxDQUFPLENBQVA7Q0FDQSxTQUFLQSxDQUFMLENBQU8sQ0FBUDtDQUNBO0NBRUEsb0JBQUEsc0JBQW1CO0NBRXRCLEdBNU9MOztDQUFBO0NBZ1BROztDQUVBO0NBRUEscUJBQWtCNkUsQ0FBTCxDQUFPLEVBQXBCLEtBQUEsaUJBQUE7O0NBRUEsaUNBQUE7Q0FBaUM7Q0FBc0Msd0JBQ2xFLGdCQUFnQixZQUFBOztDQUVyQixTQUFLN0UsQ0FBTCxDQUFPLENBQVA7Q0FDQSxTQUFLQSxDQUFMLENBQU8sQ0FBUDtDQUNBLFNBQUtBLENBQUwsQ0FBTyxDQUFQO0NBQ0E7Q0FFQSxvQkFBQSx5QkFBbUI7Q0FFbkIsU0FBSzZFLENBQUwsQ0FBTyxDQUFQLGNBQXNCO0NBRXpCO0NBbFFMOztDQUFBO0NBeVFRLDZCQUFpQjtDQUVwQixHQTNRTDs7Q0FBQTtDQStRUSx1QkFBVztDQUNYLFNBQUtvTTtDQUVMLGVBQUE7O0NBRUEsbUNBQUE7Q0FFSSxXQUFLTCxHQUFMLHlCQUF5QixlQUE2QixnQkFBL0I7Q0FFdkIsbUJBQUE7Q0FDQSxpQkFBQTs7Q0FFQTtDQUVJO0NBQ0E7Q0FFQSxtQkFBVztDQUNYO0NBRUg7Q0FFSjs7Q0FFRCwyQkFBYyxPQUFpQkssRUFBakIsT0FBMkJDLEVBQTNCO0NBRWQsa0JBQUE7Q0FDQSxlQUFBLFVBQWEsT0FBaUJELEVBQWpCLFVBQUEsQ0FBYjtDQUVBO0NBRUgsR0E5U0w7O0NBQUE7Q0FrVFEsb0JBQUEsMkJBQW9DO0NBRXZDLEdBcFRMOztDQUFBO0NBd1RRLGlCQUFhalI7Q0FDYixpQkFBYUg7Q0FFYkcsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQsU0FBVztDQUNaQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxjQUFlO0NBQ2hCQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxjQUFlO0NBRW5CLEdBalVMOztDQUFBO0NBQUEsRUFBeUI4TixLQUF6Qjs7S0NBYXFELEtBQWI7Q0FBQTs7Q0FFSSxpQkFBYXhOO0NBQVM7O0NBQUE7Q0FBVEEsT0FBUyxHQUFMO0NBQUs7O0NBRWxCLDhCQUFPQTtDQUVWLGtCQUFhQSx3QkFBd0JBLFVBQVUsRUFBQSxHQUFBLEVBQUssQ0FBTDtDQUM1QztDQUVBLHNCQUFpQkEsNEJBQTRCQSxjQUFjO0NBQzNELDBCQUFxQkEsbUJBQW1CO0NBQ3hDLGdCQUFXQTtDQUVYLGlCQUFZQSx1QkFBd0JBOztDQUlwQyxzQkFBaUJBLDRCQUE0QkE7Q0FDN0M7Q0FFQTtDQUVBLGNBQVNBLENBQUMsWUFBWTtDQUN0QixVQUFLeU4sZUFBYztDQUNuQixnQkFBVztDQUVYLFVBQUt2TSxDQUFMLENBQU8sQ0FBUDs7Q0FFQSxjQUFTQSxDQUFMLENBQU8sZ0JBQVg7Q0FBZ0M7Q0FFNUIsWUFBS0EsQ0FBTCxDQUFPLGNBQVAsVUFBd0I7Q0FJeEI7O0NBQ0EsWUFBSzBILEdBQUwsR0FBVztDQUNYLGlCQUFVO0NBRWI7O0NBRUQsVUFBSzhFLFdBQVVELEtBQUs7Q0FDcEIsVUFBS0UsZUFBYztDQUVuQixVQUFLek0sQ0FBTCxDQUFPLG9CQUFLLHlEQUFrRSw2REFBbEU7Q0FDWixVQUFLQSxDQUFMLENBQU8sQ0FBUDs7Q0FFQSw2QkFBVSxpQkFBQTtDQUFvQ3VCLCtCQUFRLEdBQWMsR0FBZDtDQUEyQkM7Q0FBY0M7Q0FBZ0JDO0NBQW5FLEtBQWxDOztDQUNWLG9CQUFBO0NBQW9CRjtDQUFjQztDQUFnQndJLFVBQUk7Q0FBSXZDLE1BQUFBLFdBQVNBO0NBQWpELEtBQWxCOztDQUVBLG9CQUFBLEVBQWtCLEVBQWxCO0NBQXdCNUYsTUFBQUE7Q0FBTS9FO0NBQXlCO0NBQWtCOEU7Q0FBYTtDQUFoRSxLQUF0QixLQUFBOztDQUNBLG9CQUFBLEVBQWtCLEVBQWxCO0NBQXdCOEUsTUFBQUE7Q0FBTUMsTUFBQUE7Q0FBTXBGLHFCQUFNO0NBQVdDLHNCQUFPO0NBQVcxRTtDQUEwQjtDQUFtQjhFO0NBQTlGLEtBQXRCLEtBQUE7O0NBRUEsVUFBSzZLLFlBQVlELHNCQUFnQjtDQUNqQyxZQUFRO0NBQ1Isa0JBQWE7Q0FFYixjQUFTOztDQUVULGtCQUFBLGVBQUEsR0FBK0IsRUFBL0I7Q0FFQ3pMLE1BQUFBLENBQUMsR0FBRCxHQUFPLE9BQVMsV0FBUCxJQUFxQixHQUFDLFNBQVMwTDtDQUN4QzFMLE1BQUFBLENBQUMsQ0FBQ3BKLENBQUQsQ0FBRCxNQUFVb0osQ0FBQyxDQUFDcEosQ0FBRCxDQUFELE1BQVVvSixDQUFDLENBQUNwSixDQUFELENBQUQsQ0FBSztDQUN6QixpQkFBQTtDQUVHLGdCQUFTK1UsV0FBVzdSLENBQUwsc0JBQWlCLDZCQUFxQyxlQUM5REEsQ0FBTCxpQkFBWTs7Q0FFakIsWUFBS29FO0NBQW1CeUgsUUFBQUEsQ0FBQyxFQUFDM0YsQ0FBQyxDQUFDcEosQ0FBRDtDQUFRZ1AsU0FBQztDQUFLcEYsYUFBSyxFQUFDUixDQUFDLENBQUNwSixDQUFEO0NBQVE2SjtDQUFVSSxRQUFBQTtDQUFxQjtDQUFqRSxTQUF1Rk87Q0FFN0c7O0NBRUQsZ0JBQVdwQjtDQUNYLFVBQUtoQixDQUFMLENBQU87O0NBSVAsY0FBQTs7Q0FFQSxjQUFTQSxDQUFMLENBQU8sZ0JBQVg7Q0FDSSxZQUFLQSxDQUFMLENBQU8sU0FBUzBILEdBQWhCO0NBQ0EsWUFBSzFILENBQUwsQ0FBTyxlQUFQO0NBQ0EsWUFBSzdFLENBQUwsQ0FBTyxhQUFQLFNBQXVCO0NBQzFCOztDQUVELHNCQUFBOztDQWxGa0I7Q0FvRnJCOztDQXRGTDs7Q0FBQTtDQTBGUSxpQkFBQSxtQkFBa0M2RSxDQUFMLENBQU8sRUFBcEIsS0FBQSxlQUE2QixFQUE3QixFQUE4QyxDQUE5Qzs7Q0FFaEIsa0JBQUEsY0FBQSxHQUE0QixFQUE1QjtDQUdJLHVCQUFrQkEsQ0FBTCxFQUFBLGtCQUEwQmxGLENBQUwsYUFBbEMsR0FBc0QsR0FBQztDQUN2RCx1QkFBa0JrRixDQUFMLEVBQUEsR0FBVyxrQkFBVyxRQUFlbEYsQ0FBTCxXQUFlMFIsRUFBL0IsQ0FBN0IsR0FBa0UsR0FBQztDQUNuRSxlQUFTRyxlQUFNLGFBQXlCN1IsQ0FBTCxPQUFELHVFQUM3QixZQUF3QkEsQ0FBTDtDQUUzQjs7Q0FFRCxTQUFLa0YsQ0FBTCxDQUFPLENBQVA7Q0FFSCxHQXhHTDs7Q0FBQSxzQ0EwR2UwRjtDQUVQO0NBQ0EsUUFBSTVGLENBQUMsT0FBTyxNQUFNQSxDQUFDLE9BQU8sRUFBMUIsU0FBc0M7Q0FFdEM7Q0FDQTs7Q0FFSCxRQUFJQSxDQUFDLGlCQUFlQSxDQUFDLGNBQVUsRUFBL0I7Q0FDSSxhQUFPbEk7Q0FDSCxjQUFNK08sQ0FBRixHQUFJM0YsQ0FBQyxDQUFDcEosQ0FBRCxJQUFMLE1BQWlCK08sQ0FBRixHQUFJM0YsQ0FBQyxDQUFDcEosQ0FBRCxFQUFJO0NBQy9CO0NBQ0o7O0NBRUUsV0FBTztDQUVWLEdBMUhMOztDQUFBLDhCQTRIVytIO0NBRU4sOEJBQUE7Q0FFQSxRQUFJQzs7Q0FFRDtDQUNJO0NBQVFBLFFBQUFBLElBQUU7Q0FBSzs7Q0FDZjtDQUFRQSxRQUFBQSxJQUFFO0NBQUs7O0NBQ2Y7Q0FBUUEsUUFBQUEsQ0FBQztDQUFJO0NBSGpCOztDQU1BLGNBQUE7Q0FFQSxxQkFBa0JJLENBQUwsQ0FBTyxFQUFwQixnQkFBQSxHQUFBLFNBQWtELENBQWxEO0NBQ0EsdUJBQW1CTDtDQUVuQjtDQUlIO0NBR0Q7Q0FDQTtDQXJKSjs7Q0FBQTtDQXlKSzs7Q0FHRzs7Q0FDQSxZQUFPLEVBQVA7Q0FDSSxvQkFBSSxRQUFrQjtDQUNsQixvQkFBQTtDQUNBLG9CQUFhLEtBQUtLLEVBQUUseUJBQXlCcEksQ0FBQztDQUM5Q2dWLGNBQU07Q0FDVDtDQUNKOztDQUVEO0NBRUgsR0F2S0w7O0NBQUEsb0NBeUtjbEg7Q0FFTjtDQUNBLHlCQUFxQixFQUFyQixtQkFBaUM7Q0FFcEMsR0E5S0w7O0NBQUEsd0NBZ0xnQkE7Q0FFWDtDQUNHLHlCQUFPLENBQWdCQSxDQUFoQjtDQUVWLEdBckxMOztDQUFBLHdDQXVMZ0JBO0NBRVg7Q0FFQSw0QkFBVyxDQUFjQSxDQUFkOztDQUVYLGlCQUFhLEVBQWI7Q0FFT2tILE1BQUFBLEdBQUcsYUFBRztDQUdUO0NBRUdBLE1BQUFBLEdBQUcsd0JBQWMsSUFBQSxHQUFrQjs7Q0FFbkM7Q0FDQyxlQUFPMVUsSUFBUCxJQUFlLFdBQVksaUJBQW1CLEtBQUs4TyxLQUFLSixJQUFJLGFBQTVCLElBQThDLEtBQUs0RixJQUFNLENBQTFFO0NBQ2Ysb0JBQWE7Q0FDYjtDQUVKOztDQUVEO0NBRUg7Q0EvTUw7O0NBQUE7Q0FxTkssa0JBQUE7Q0FFRyxRQUFJcEUsRUFBSixXQUFTO0NBRVosR0F6Tkw7O0NBQUE7Q0E2TkssWUFBUTtDQUFSO0NBQUE7Q0FBQTtDQUFBO0NBQUE7Q0FBQTs7Q0FHQSxrQkFBQSxjQUFBLEdBQTRCLEVBQTVCO0NBRUNuTixPQUFDLGdCQUFTLFFBQWVILENBQUwsV0FBZTBSO0NBQ25DeFIsT0FBQyxTQUFXLFVBQVAsSUFBcUI7Q0FFMUI2UixRQUFFLElBQUksVUFBRyxHQUFRO0NBQ2pCQyxRQUFFLElBQUksUUFBUUo7Q0FFZCxnQkFBTyxDQUFQLGVBQWEsR0FBTyxHQUFQLElBQUEsUUFBQSxLQUFBLEdBQTRCLEdBQTVCLHlCQUNILEdBQVksR0FBWixLQUFBLEdBQXNCLEdBQXRCLElBQUEsR0FBK0IsR0FBL0IsSUFBQSxHQUF3QyxHQUF4QyxLQUFBLEdBQWtELEdBQWxEO0NBQ1YscUJBQWNoRCxHQUFMLEdBQVMsQ0FBbEIsaUJBQXdCLEdBQVksR0FBWjtDQUV4QnFELFFBQUUsR0FBR0Q7Q0FDTEUsUUFBRTtDQUVGOztDQUVELFdBQU85UjtDQUVQLEdBblBMOztDQUFBO0NBdVBROztDQUVBLGlCQUFhQztDQUNiLGFBQVM2RSxDQUFMLENBQU8sZ0JBQVgsRUFBOEI3RSxDQUFDLENBQUMsQ0FBRDtDQUMvQkEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FFRCxRQUFJc1IsY0FBYztDQUNsQixRQUFJQyxNQUFPRCxxQkFBZ0I7Q0FFM0IsWUFBUTs7Q0FFUixrQkFBQSxjQUFBLEdBQStCLEVBQS9CO0NBRUl6TCxNQUFBQSxDQUFDLEdBQUQsR0FBTyxPQUFTLEtBQVAsSUFBZ0IsR0FBQyxHQUFJMEw7Q0FDOUIxTCxNQUFBQSxDQUFDLENBQUNwSixDQUFELENBQUQsTUFBVW9KLENBQUMsQ0FBQ3BKLENBQUQsQ0FBRCxNQUFVb0osQ0FBQyxDQUFDcEosQ0FBRCxDQUFELENBQUs7Q0FFNUI7O0NBRUQsZUFBV29KO0NBRWQsR0E1UUw7O0NBQUE7Q0FBQSxFQUEyQmlJLEtBQTNCOztLQ0NhZ0UsS0FBYjtDQUFBOztDQUVJLGlCQUFhbk87Q0FBUzs7Q0FBQTtDQUFUQSxPQUFTLEdBQUw7Q0FBSzs7Q0FFbEIsOEJBQU9BO0NBRVAsZ0JBQVdBO0NBRVgsZ0JBQVc7Q0FFWDtDQUNBLG9CQUFlLENBQUM7Q0FDaEI7Q0FFQSxrQkFBYTtDQUViLHdCQUFrQjdEO0NBRWxCLDRDQUFtQztDQUVuQyxtQkFBYzZELHVCQUF1QkE7Q0FFckMsVUFBS2tCLENBQUwsQ0FBTyxvQkFBSyw2RkFBQTtDQUNaLFVBQUtBLENBQUwsQ0FBTyxxQkFBSyw4RkFBQTtDQUE2RzhCLE1BQUFBO0NBQW1CRDtDQUFxQjlFO0NBQTFDLEtBQTNHO0NBQ1osVUFBS2lELENBQUwsQ0FBTyxxQkFBSyxnR0FBQTtDQUErRzhCLE1BQUFBO0NBQW1CRDtDQUFxQjlFO0NBQTFDLEtBQTdHOztDQUVaLG9CQUFBLFFBQXFCaUQsQ0FBTCxDQUFPLG9CQUFLLHFHQUFBO0NBRTVCLGtCQUFhN0U7Q0FFYkEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDRCxVQUFLNkUsQ0FBTCxDQUFPLENBQVA7Q0FFQTdFLElBQUFBLENBQUMsQ0FBQyxDQUFEO0NBQ0RBLElBQUFBLENBQUMsQ0FBQyxDQUFELHlCQUF3QjtDQUN6QkEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FFRCwwQkFBQSxFQUF3QkEsQ0FBQyxDQUFDLENBQUQ7Q0FDekJBLElBQUFBLENBQUMsQ0FBQyxDQUFEOztDQUdELGNBQUE7O0NBRUEsUUFBSTJELEVBQUV1SyxnQkFBTixhQUF5QixDQUFXdkssRUFBRXVLLEVBQWI7Q0FDekIsUUFBSXZLLG9CQUFKLFlBQTJCO0NBNUNUO0NBOENyQjs7Q0FoREw7O0NBQUEsc0NBa0RlNEc7Q0FFUDtDQUNBLFFBQUk1RixDQUFDLE9BQU8sTUFBTUEsQ0FBQyxPQUFPLEVBQTFCLFNBQXNDO0NBRXRDLGVBQVc7Q0FFWCxRQUFJQSxDQUFDLGVBQUw7Q0FFSSwyQkFBc0I7Q0FDekI7Q0FFRDtDQUVILEdBaEVMOztDQUFBO0NBb0VRLHlCQUFxQixFQUFyQjs7Q0FHQSxxQkFBQTtDQUNBLHFCQUFBO0NBQ0EsbUJBQWUsQ0FBQztDQUNoQjtDQUNBLGVBQUE7Q0FDQTtDQUVILEdBOUVMOztDQUFBO0NBa0ZRLG9CQUFBO0NBRUg7Q0FHRDtDQUNBO0NBeEZKOztDQUFBLDRDQTBGa0I0RjtDQUVWLGVBQVdBO0NBRVg7Q0FDQTtDQUVBLDRCQUFXLENBQWVBLENBQWY7Q0FFWCxhQUFBOztDQUVBO0NBRUk7Q0FDQTtDQUVBLDBCQUFJLElBQWtCOVAsc0JBQXVCLFlBQUE7Q0FFN0MsWUFBSSw0QkFBNkIsdUJBQUE7O0NBSWpDLG1CQUFXb08sTUFBTyxZQUFBO0NBRWxCOztDQUNBO0NBQ0E7O0NBQ0EsWUFBSXBPO0NBQ0EsY0FBSSxhQUFjLEtBQUtzWCxRQUF2QixLQUNLO0NBQ1I7O0NBQ0Q7Q0FwQko7O0NBeUJBLG1CQUFBO0NBQ0Esb0JBQUE7Q0FFQTtDQUVILEdBbklMOztDQUFBLG9DQXFJY3hIO0NBRU4sd0NBQVcsRUFBNEJBLENBQTVCOztDQUVYLDZCQUFBO0NBQ0ksc0JBQUE7Q0FDQSxrQkFBQTtDQUVIOztDQUVELGlCQUFhLEVBQWI7Q0FDSSxpQkFBQSxRQUFtQnFCO0NBQ25CLHdCQUFBO0NBQ0g7Q0FFSjtDQXBKTDs7Q0FBQTtDQTBKUTtDQUFBO0NBQUE7Q0FBQSxRQUFrQzlMLENBQUM7Q0FBbkMsVUFBeUM7Q0FBekMsUUFBNkNrUyxJQUFJOztDQUNqRCxjQUFBLFNBQUEsR0FBc0IsRUFBdEI7Q0FDSTNHLE9BQUMsUUFBUU8sR0FBTCxDQUFTblA7O0NBQ2IsVUFBSTtDQUVBLG1CQUFRLElBQUksTUFBTXFELENBQUY7Q0FFWixrQkFBTyxHQUFDdUwsQ0FBQyxJQUFJdkwsQ0FBQyxLQUFLLEtBQUdrUztDQUN6QjtDQUNEQSxRQUFBQSxJQUFJLEdBQUczRzs7Q0FHUFUsVUFBRSxJQUFJVjtDQUNOLGNBQU0sS0FBR3hMLElBQUksTUFBYixJQUF3QjtDQUUzQixrQkFDU3dMLEdBQUE7Q0FDYjs7Q0FFRCxXQUFPdkw7Q0FDVixHQTlLTDs7Q0FBQTtDQWtMUSxvQkFBQTtDQUVBOE4sMEJBQUEsV0FBQSxXQUFvQyxlQUFwQztDQUVILEdBdExMOztDQUFBLGdDQXlMWS9JO0NBRUosU0FBSzdFLENBQUwsQ0FBTyxDQUFQLGVBQXVCNkU7Q0FFdkI7O0NBQ0EsWUFBTyxFQUFQO0NBQ0ksV0FBSytHLEdBQUwsQ0FBU25QLFFBQVQsQ0FBbUJvSTtDQUN0QjtDQUVKLEdBbE1MOztDQUFBO0NBc01ROztDQUVBLGVBQVdKLENBQUMsQ0FBQyxlQUFiO0NBQ0lBLE1BQUFBLENBQUMsQ0FBQyxPQUFGO0NBQ0FBLE1BQUFBLENBQUMsQ0FBQyxTQUFGLFFBQW1CSSxDQUFMLENBQU87Q0FDckJKLE1BQUFBLENBQUMsQ0FBQyxPQUFGO0NBQ0gsK0JBQTBCLENBQUMsZUFBckI7Q0FDSCxVQUFJQSxDQUFDLG1CQUFvQixhQUFhQTtDQUFLd04sUUFBQUEsTUFBSztDQUFNQyxnQkFBTyxLQUFLck47Q0FBTXNOLFFBQUFBLE1BQUssS0FBS0E7Q0FBekM7Q0FFckMxTixRQUFBQSxDQUFDLElBQUl3TixPQUFPO0NBQ1p4TixRQUFBQSxDQUFDLGFBQWEsS0FBS0ksQ0FBTDtDQUNkSixRQUFBQSxDQUFDLElBQUkwTixPQUFPLEtBQUtBO0NBQ3BCO0NBQ0o7OztDQUdELCtCQUFRLEVBQXNCMU4sQ0FBdEI7Q0FDUixpQkFBQSxDQUFlRCxDQUFmO0NBRUEsUUFBSUEsWUFBSixFQUFtQkE7Q0FFbkIsV0FBT0E7Q0FFVixHQTdOTDs7Q0FBQSw4Q0ErTm1CcUI7Q0FFWCxpQ0FBQSx1QkFBaUMsQ0FBdUJBLENBQXZCLG9CQUM1QixnQkFBaUIsQ0FBZ0JBLENBQWhCO0NBRXpCLEdBcE9MOztDQUFBO0NBd09ROztDQUVBLHFCQUFrQmhCLENBQUwsQ0FBTyxFQUFwQixLQUFBLHFCQUFBO0NBQ0EscUJBQUE7Q0FFQTtDQUVBLHFCQUFBLENBQW1CZ0IsQ0FBbkI7Q0FFSCxHQWpQTDs7Q0FBQTtDQXFQUTs7Q0FFQTtDQUVBLHFCQUFrQmhCLENBQUwsQ0FBTyxFQUFwQixLQUFBLGlCQUFBO0NBQ0E7Q0FDQSxTQUFLN0UsQ0FBTCxDQUFPLENBQVA7Q0FFQSxxQkFBQSxDQUFtQixDQUFDNkYsQ0FBcEI7Q0FFSCxHQS9QTDs7Q0FBQTtDQW1RUSxtQkFBQTtDQUNBLGlCQUFBLGlCQUFnQyxXQUFVLENBQVYsQ0FBaEI7Q0FDaEJpSSxtQ0FBQTtDQUVILEdBdlFMOztDQUFBO0NBMlFRLGNBQUE7Q0FFQTs7Q0FDQSxZQUFPLEVBQVA7Q0FDSSxXQUFLbEMsR0FBTCxDQUFTblAsUUFBVDtDQUNBLFdBQUttUCxJQUFJd0csR0FBVDtDQUNIOztDQUNELGVBQVc7Q0FDWDtDQUVILEdBclJMOztDQUFBLDhCQXVSVzNHO0NBRUgsb0JBQUE7O0NBRUEsdUJBQUE7Q0FDSTtDQUNBLG1DQUFnQixDQUFnQkE7Q0FDbkM7Q0FDRyxZQUFBO0NBQ0g7O0NBQ0QsU0FBS3pMLENBQUwsQ0FBTyxDQUFQO0NBSUgsR0FyU0w7O0NBQUE7Q0F5U1E7O0NBQ0EsWUFBTyxFQUFQO0NBQ0ksV0FBSzRMLEdBQUwsQ0FBU25QLGdCQUFpQm9EO0NBQzFCLFdBQUsrTCxHQUFMLENBQVNuUCxRQUFUO0NBQ0g7O0NBQ0QsYUFBQTtDQUVILEdBaFRMOztDQUFBO0NBb1RROztDQUVBLGlCQUFhdUQ7Q0FFYkEsSUFBQUEsQ0FBQyxDQUFDLENBQUQsY0FBa0IrTixVQUFVQyxLQUFLO0NBQ2xDaE8sSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FFRCxtQkFBQSxtQkFBa0I7Q0FFckIsR0E5VEw7O0NBQUE7Q0FBQSxFQUEyQjhOLEtBQTNCO0NBa1VBZ0UsS0FBSyxDQUFDTyxTQUFOLENBQWdCQyxPQUFoQixHQUEwQixJQUExQjs7S0NuVWFDLFFBQWI7Q0FBQTs7Q0FFSSxvQkFBYTVPO0NBQVM7O0NBQUE7Q0FBVEEsT0FBUyxHQUFMO0NBQUs7O0NBRWxCLDhCQUFPQTtDQUVQO0NBRUEsa0JBQWEsRUFBQSxFQUFHLENBQUg7Q0FFYjtDQUNBLGtCQUFhQSx1QkFBdUJBLFNBQVM7Q0FFN0Msc0JBQWlCQSxlQUFlO0NBQ2hDLDBCQUFxQkEsbUJBQW1CO0NBRXhDLG9CQUFla0ssRUFBSjtDQUNYLG9CQUFlQSxFQUFKO0NBRVg7Q0FFQTtDQUNBO0NBRUEsY0FBU2xLLENBQUMsZ0JBQWU7Q0FDekIsZ0JBQVc7Q0FFWCxVQUFLa0IsQ0FBTCxDQUFPLENBQVA7O0NBRUEsY0FBU0EsQ0FBTCxDQUFPLGdCQUFYO0NBQWdDO0NBRTVCLFlBQUtBLENBQUwsQ0FBTyxjQUFQLFVBQXdCO0NBQ3hCLFlBQUtBLENBQUwsQ0FBTyxrQkFBUDtDQUNBLFlBQUswSCxHQUFMLEdBQVc7Q0FDWCxpQkFBVTtDQUViOztDQUVELFVBQUsxSCxDQUFMLENBQU8sb0JBQUsseURBQWtFLDZEQUFsRTtDQUNaLFVBQUtBLENBQUwsQ0FBTyxDQUFQO0NBRUEsVUFBS0EsQ0FBTCxDQUFPLGtDQUFLOztDQUNaLHVCQUFrQkEsQ0FBTCxDQUFPLEVBQXBCLFdBQUEsaUNBQTBEaEYsQ0FBMUQ7O0NBQ0EsdUJBQWtCZ0YsQ0FBTCxDQUFPLEVBQXBCO0NBQTBCd0I7Q0FBY0M7Q0FBZXdJLFVBQUk7Q0FBSXZDLE1BQUFBLFdBQVNBO0NBQWhELEtBQXhCOztDQUdBLDhCQUFzQjFNOztDQUV0QixjQUFBOztDQUVBLHNCQUFBOztDQWhEa0I7Q0FrRHJCOztDQXBETDs7Q0FBQTtDQXdEUTtDQUNJO0NBQVE7Q0FDSixZQUFHO0NBQ0MscUJBQUEsQ0FBYSxNQUFBLDJCQUFiO0NBQ0EscUJBQUEsQ0FBYSxNQUFBLHFCQUFiO0NBQ0g7Q0FDRyxxQkFBQSxDQUFhLE1BQUEsdUNBQWI7O0NBRUEscUJBQUEsQ0FBYSxNQUFBLHFCQUFiO0NBQ0EscUJBQUEsQ0FBYSxNQUFBLG1CQUFiO0NBQ0g7O0NBRUw7O0NBQ0E7Q0FBUTtDQUNKLFlBQUc7Q0FDQyxxQkFBQSxDQUFhLE1BQUEsNEJBQWI7Q0FDQSxxQkFBQSxDQUFhLE1BQUEsOEJBQWI7Q0FDSDtDQUNHLHFCQUFBLENBQWEsTUFBQSxzQ0FBYjs7Q0FFQSxxQkFBQSxDQUFhLE1BQUEsZUFBcUIsa0JBQWxDO0NBQ0EscUJBQUEsQ0FBYSxNQUFBLG9DQUFiO0NBQ0g7O0NBQ0w7Q0F2Qko7Q0E0Qkg7Q0FHRDtDQUNBO0NBeEZKOztDQUFBO0NBMkZRLDhCQUFBLG1CQUE2QjtDQUM3Qix1QkFBSSxFQUFKO0NBQ0E7Q0FBeUMsaUJBQUE7Q0FBZ0IsZ0JBQTlCLEVBQTJDLEVBQTNDO0NBRTlCLEdBL0ZMOztDQUFBO0NBbUdRLDhCQUFBO0NBQ0EyUywrQkFBYTtDQUNiO0NBRUgsR0F2R0w7O0NBQUE7Q0EyR1Esb0JBQUE7Q0FDQSxhQUFBLENBQVUsQ0FBVjtDQUVILEdBOUdMOztDQUFBLG9DQWdIY2pJO0NBRU4sb0JBQUE7Q0FDQTtDQUVILEdBckhMOztDQUFBLHdDQXVIZ0JBO0NBRVI7Q0FDQSxrQkFBQSxDQUFnQkEsQ0FBaEI7Q0FDQSxhQUFBLENBQVcsQ0FBWDtDQUVILEdBN0hMOztDQUFBLHdDQStIZ0JBO0NBRVIsYUFBQSxDQUFVLENBQVY7Q0FFQSxvQkFBQTtDQUVBLFlBQUEsb0JBQTZCQSxxQkFBWSxDQUFVaUIsQ0FBdEM7Q0FDYixZQUFBLG9CQUE2QmpCLHFCQUFZLGFBQTVCO0NBRWIsa0NBQWU7O0NBRWYsZ0NBQUE7Q0FDSSxlQUFTLG1CQUFtQnFFLElBQUlwRCxRQUFRb0QsR0FBTCxDQUFTbkQ7Q0FDNUMsV0FBS21ELEtBQUwsUUFBa0JqSDtDQUNsQixXQUFLaUgsS0FBTCxRQUFrQmxIO0NBQ3JCOztDQUVELDBCQUFBLDRCQUFBLFFBQUE7Q0FFQSxlQUFBO0NBRUgsR0FwSkw7O0NBQUEsc0NBc0plL0g7Q0FFUCx1QkFBQSxNQUFvQixFQUFBLEVBQUcsQ0FBSDtDQUVwQixnQkFBQSxDQUFjQSxDQUFDLENBQUMsT0FBaEIsRUFBeUJBLENBQUMsQ0FBQyxNQUFPLENBQWxDO0NBQ0Esa0JBQUE7Q0FFSCxHQTdKTDs7Q0FBQTtDQWlLUSxRQUFJc04sZ0JBQUosRUFBdUJBOztDQUV2Qiw4QkFBQTtDQUVJO0NBRUksYUFBS2hELElBQUl3SSxLQUFNLE1BQU07Q0FFckIsYUFBS3hJLElBQUl1QixJQUFJekYsSUFBSSxDQUFDa0osSUFBSyxLQUFLaEYsS0FBZixJQUF5QixJQUF6QixHQUFnQyxJQUFJLEtBQUtBO0NBQ3RELGFBQUtBLElBQUl3QixJQUFJMUYsSUFBSSxDQUFDa0osSUFBSyxLQUFLaEYsS0FBZixJQUF5QixJQUF6QixHQUFnQyxJQUFJLEtBQUtBO0NBRXRELFlBQUksS0FBS2dJLElBQUwsSUFBYSxLQUFLRSxlQUFnQixLQUFLQSxLQUFLTztDQUVuRDtDQUVKOztDQUVELGtCQUFBO0NBRUEsUUFBSXpGLEVBQUosV0FBUztDQUdULHVCQUFJLEVBQUosbUJBQXdCO0NBRTNCLEdBekxMOztDQUFBO0NBNkxRLG1DQUF5QjtDQUN6QixtQ0FBeUI7O0NBRXhCLHdCQUFBO0NBRUcsWUFBTSxJQUFJLFFBQVVoRCxLQUFOLElBQUw7Q0FDVCxZQUFNLElBQUksUUFBVUEsS0FBTixJQUFMLEdBQXVCO0NBRWhDLHVCQUFrQnBGLENBQUwsRUFBQSxXQUFtQixhQUFoQyxFQUE2QztDQUM3Qyx1QkFBa0JBLENBQUwsRUFBQSxXQUFtQixhQUFoQyxFQUE2QztDQUNoRDtDQUNHLHVCQUFrQkEsQ0FBTCxFQUFBLE9BQWIsR0FBK0IsYUFBL0IsRUFBNEM7Q0FDNUMsdUJBQWtCQSxDQUFMLEVBQUEsT0FBYixHQUErQixhQUEvQixFQUE0QztDQUMvQzs7Q0FJRCxxQkFBa0JBLENBQUwsQ0FBTyxFQUFwQixNQUFBLGdCQUFBLEVBQTRDLENBQTVDO0NBQ0EscUJBQWtCQSxDQUFMLENBQU8sRUFBcEIsTUFBQSxnQkFBQSxFQUE0QyxDQUE1QztDQUVBLGNBQUEsQ0FBVyxjQUFRLHVCQUFGLDRCQUFnRTtDQUNqRixjQUFBLENBQVcsY0FBUSx1QkFBRiw0QkFBZ0U7Q0FFakYsU0FBS0EsQ0FBTCxDQUFPLENBQVA7Q0FFSCxHQXROTDs7Q0FBQTtDQTBOUSxxQkFBQTs7Q0FDQTtDQUVILEdBN05MOztDQUFBO0NBQUEsRUFBOEJpSixLQUE5Qjs7S0NDYTZFLElBQWI7Q0FBQTs7Q0FFSSxnQkFBYWhQO0NBQVM7O0NBQUE7Q0FBVEEsT0FBUyxHQUFMO0NBQUs7O0NBRWxCLGlDQUFPQTtDQUVQO0NBRUE7O0NBRUEsdUJBQUEsQ0FBb0JBLENBQXBCOztDQUVBLHFCQUFnQnZFO0NBQ2hCLDZCQUF3QkE7Q0FDeEIsaUNBQTJCO0NBRTNCLHVCQUFrQnlPLEVBQUo7Q0FFZDtDQUVBOztDQUNBLGNBQVNsSyxDQUFDLGdCQUFlO0NBQ3pCLGdCQUFXO0NBRVgsVUFBS2tCLENBQUwsQ0FBTyxDQUFQOztDQUVBLGNBQVFBLENBQUwsQ0FBTyxnQkFBVjtDQUVJLFlBQUtBLENBQUwsQ0FBTyxjQUFQLFVBQXdCO0NBQ3hCLFlBQUtBLENBQUwsQ0FBTyxrQkFBUDtDQUNBLFlBQUswSCxHQUFMLEdBQVc7Q0FDWCxpQkFBVTtDQUViOztDQUVELG9CQUFlO0NBRWYsa0JBQWE7Q0FFYixVQUFLMUgsQ0FBTCxDQUFPLG9CQUFLLHlEQUFrRSw2REFBbEU7Q0FFWixVQUFLQSxDQUFMLENBQU8sa0JBQUs7O0NBRVosdUJBQWtCQSxDQUFMLENBQU8sRUFBcEIsVUFBQSxpQkFBQSxFQUFrRCxDQUFsRDs7Q0FDQSx1QkFBa0JBLENBQUwsQ0FBTyxFQUFwQixVQUFBLGlCQUFBLEVBQWtELENBQWxEOztDQUNBLHVCQUFrQkEsQ0FBTCxDQUFPLEVBQXBCLEtBQUEsZ0JBQTZCLEVBQTdCLEVBQThDLENBQTlDOztDQUdBLHVCQUFrQkEsQ0FBTCxDQUFPLEVBQXBCLFdBQUEsaUJBQStDK04saUJBQVlBLEVBQTNEOztDQUNBLHVCQUFrQi9OLENBQUwsQ0FBTyxFQUFwQjtDQUEwQndCO0NBQWNDO0NBQWV3SSxVQUFJO0NBQUl2QyxNQUFBQSxXQUFTQTtDQUFoRCxLQUF4Qjs7Q0FFQSxjQUFTOztDQUVULGNBQUE7O0NBRUEsZ0JBQUE7O0NBckRrQjtDQXVEckI7O0NBekRMOztDQUFBO0NBNkRRLDRCQUFBOztDQUVBO0NBQ0k7Q0FBUTtDQUNKLGFBQUt2TSxDQUFMLFlBQWtCO0NBQ2xCLG9CQUFhLEtBQUs2RSxFQUFFLFlBQVcsa0JBQS9COztDQUVBLG9CQUFhLEtBQUtBLEVBQUUsY0FBYyxjQUFsQztDQUNKOztDQUNBO0NBQVE7Q0FDSixhQUFLN0UsQ0FBTCxZQUFrQjtDQUNsQixvQkFBYSxLQUFLNkUsRUFBRSxZQUFXLGtCQUEvQjs7Q0FFQSxvQkFBYSxLQUFLQSxFQUFFLGNBQWMsY0FBbEM7Q0FDSjtDQVpKOztDQWVBO0NBQ0E7Q0FFSCxHQWpGTDs7Q0FBQSx3Q0FvRmdCMEY7Q0FFUjtDQUVBLG9CQUFBO0NBRUE7Q0FFQXdFLE9BQUcsb0JBQXFCeEUscUJBQVksQ0FBVWlCLENBQXRDO0NBQ1J1RCxPQUFHLG9CQUFxQnhFLHFCQUFZLGFBQTVCO0NBRVIsNEJBQTBCLEVBQWYsS0FBc0IsQ0FBQ2tCLENBQXZCO0NBRVgsMEJBQUEsK0NBQXNFck0sc0JBQXNCNEU7Q0FFNUYsaURBQTZDQTtDQUM3QyxtREFBK0NBO0NBRS9DO0NBQ0E7Q0FFQTs7Q0FFQSx3Q0FBQTtDQUNJUSxPQUFDLGVBQWdCO0NBQ2pCLGdCQUFBLHNCQUFpQzBLLEdBQUwsSUFBYztDQUMxQztDQUNBLFdBQUtBLEdBQUw7Q0FDQSxlQUFBO0NBQ0g7Q0FFSixHQW5ITDs7Q0FBQTtDQXVIUSxZQUFRO0NBQVIsUUFBWTJEO0NBQVo7Q0FBQTtDQUFBO0NBQUE7Q0FBQTtDQUFBO0NBQUEsUUFBMEM3TztDQUMxQywwQkFBc0I1RTtDQUN0Qix3QkFBb0JBOztDQUdwQixxQkFBQTtDQUNJMFQsV0FBSyxhQUFJO0NBQ1RELFVBQUksY0FBZTtDQUN0QjtDQUNHQSxVQUFJLGNBQWdCLGdCQUFiO0NBQ1BDLFdBQUssSUFBSSxHQUFDO0NBQ2I7O0NBRUQsa0JBQUEsWUFBQSxFQUE2QixHQUE3QjtDQUVJck8sT0FBQyxhQUFhLE9BQVM7Q0FDdkIrRyxPQUFDLElBQUksUUFBUTdELEdBQUwsUUFBbUIsR0FBRztDQUM5QjhELE9BQUMsSUFBSSxRQUFRL0QsR0FBTCxRQUFtQixHQUFHO0NBQzlCUSxRQUFFLElBQUksUUFBUVAsR0FBTCxRQUFtQixHQUFHO0NBQy9CUSxRQUFFLElBQUksUUFBUVQsR0FBTCxRQUFtQixHQUFHO0NBQy9CZixXQUFLLE9BQUEsR0FBVSxHQUFWLElBQUEsT0FBQSxLQUFBLEdBQWdDLEdBQWhDLEtBQUEsR0FBeUM7Q0FFakQ7O0NBRUQsV0FBT0E7Q0FFVixHQWpKTDs7Q0FBQTtDQXFKUSxTQUFLOUIsQ0FBTCxDQUFPLENBQVA7Q0FDQTtDQUdEOztDQUNDOztDQUVBLHNCQUFVLENBQVNiLENBQVQ7Q0FDVixzQkFBVSxDQUFTQSxDQUFUO0NBRVYsUUFBSWdFLEtBQU0sV0FBWTtDQUN0QixRQUFJQyxLQUFLLEVBQUUsWUFBWTtDQUN2QixRQUFJQyxLQUFNLFdBQVk7Q0FDdEIsUUFBSUMsS0FBSyxFQUFFLFlBQVk7Q0FHdkI7O0NBRUEscUJBQWtCdEQsQ0FBTCxDQUFPLEVBQXBCLEtBQUEsU0FBb0NtRCxXQUFVQyxhQUFhQyxXQUFVQyxFQUFyRSxFQUF5RSxDQUF6RTs7Q0FJQSxRQUFJOEUsRUFBSixXQUFTO0NBRVosR0E3S0w7O0NBQUE7Q0FBQSxFQUEwQjRCLFFBQTFCOztLQ0Zha0UsSUFBYjtDQUFBOztDQUVJLGdCQUFhcFA7Q0FBUzs7Q0FBQTtDQUFUQSxPQUFTLEdBQUw7Q0FBSzs7Q0FFbEIsOEJBQU9BOztDQUdQLGlCQUFZQSxVQUFVO0NBQ3RCLG1CQUFjQSxZQUFZO0NBQzFCLHNCQUFpQkEsZ0JBQWdCLEVBQUQsRUFBSSxFQUFKO0NBRWhDLHVDQUFpQztDQUNqQztDQUVBLHFCQUFnQjtDQUNoQixtQkFBYztDQUVkO0NBQ0EsZ0JBQVlBO0NBRVosa0JBQWE7Q0FDYixrQkFBYTtDQUViLHFCQUFnQkE7Q0FFaEIsd0JBQW1CQTtDQUVuQiw0Q0FBbUM7Q0FFbkMsVUFBS2tCLENBQUwsQ0FBTyxvQkFBSywwQ0FBQTtDQUNaLFVBQUtBLENBQUwsQ0FBTyxvQkFBSyx3RUFBNkUsK0VBQW1FLGdEQUFoSjtDQUNaLFVBQUtBLENBQUwsQ0FBTyxxQkFBSyxzRkFBQTtDQUFxRzhCLE1BQUFBO0NBQW1CRDtDQUFxQjlFO0NBQTFDLEtBQW5HO0NBRVosb0NBQWdCO0NBRWhCLFVBQUtpRCxDQUFMLENBQU8sQ0FBUDtDQUVBLGlCQUFZbEIsVUFBVTtDQUN0QixrQkFBYTtDQUViLHFCQUFnQjtDQUVoQix3QkFBa0I3RDtDQUVsQix1QkFBa0I2RCwwQkFBd0I7O0NBRzFDLGlCQUFZQTtDQUVaLFVBQUtxSSxLQUFLO0NBQ1YsVUFBSzRHLFdBQVU1RTtDQUNmO0NBQ0E7Q0FFQTs7Q0FHQSxpQkFBWXJLO0NBQ1osVUFBS3NKLGlDQUFnQzs7Q0FFckMsY0FBU0EsRUFBVDtDQUVJLFlBQUtwSSxDQUFMLENBQU8sU0FBUzBILEdBQWhCO0NBQ0EsWUFBSzFILENBQUwsQ0FBTyxTQUFTMEgsR0FBaEI7Q0FDQSxZQUFLMUgsQ0FBTCxDQUFPLFNBQVMwSCxHQUFoQjs7Q0FHQSxZQUFLMUgsQ0FBTCxDQUFPLGVBQVAsVUFBeUIsSUFBQTtDQUN6QixZQUFLQSxDQUFMLENBQU8sZUFBUDtDQUNBLFlBQUtBLENBQUwsQ0FBTyxlQUFQLFFBQThCO0NBRWpDO0NBQ0csWUFBS0EsQ0FBTCxDQUFPLFNBQVMwSCxHQUFoQixjQUFzQjtDQUN6Qjs7Q0FFRCxrQ0FBYyw0RUFBQTtDQUNkO0NBRUEsb0JBQWU7O0NBRWYsVUFBSzFILENBQUwsQ0FBTyxDQUFQLDBCQUFBOztDQUNBLFVBQUtBLENBQUwsQ0FBTyxDQUFQLDRCQUFBOztDQUVBLFFBQUlsQixxQkFBSjtDQUNJLGdCQUFTLFFBQUEsY0FBVyxhQUFhLDBCQUM1QjtDQUNSO0NBQ0csaUJBQUEsYUFBYSxDQUFVO0NBQzFCOztDQUVELDBCQUFxQkE7O0NBRXJCLHNCQUFBO0NBQ0ksaUJBQUE7Q0FDQSxZQUFLa0IsQ0FBTCxDQUFPLGdCQUFQO0NBQ0EsWUFBS0EsQ0FBTCxDQUFPLGdCQUFQO0NBQ0EsWUFBS0EsQ0FBTCxDQUFPLFNBQVMwSCxHQUFoQixjQUFzQjtDQUN0Qix5QkFBQTtDQUNIOzs7Q0FLRCx5QkFBQSxvQkFBdUI7Q0FFbkI7O0NBQ0EsNEJBQUE7O0NBQ0EsY0FBQTs7Q0FDQSwyQkFBQSxpQkFBeUI7O0NBMUdYO0NBNkdyQjs7O0NBL0dMOztDQUFBO0NBcUhRO0NBRUEsb0JBQWdCOztDQUNoQixrQkFBQSxzQkFBQSxHQUFtQyxFQUFuQztDQUF3QyxnQ0FBa0IsQ0FBVTlQLENBQVY7Q0FBMUQ7O0NBQ0EsZ0JBQUE7Q0FFSCxHQTNITDs7Q0FBQTtDQStIUSxxQkFBQTs7Q0FDQSxnQ0FBQTtDQUVJLDBCQUFBO0NBRUEsb0JBQUE7Q0FDQTtDQUNaO0NBQ0E7Q0FFUyx1QkFDSTtDQUVSLEdBNUlMOztDQUFBO0NBZ0pRO0NBQ0EsMEJBQVcsQ0FBWSxDQUFaO0NBQ1gsMENBQVU7Q0FDVmlRLG9FQUFnRCxDQUFlLG1DQUFpQixDQUFlO0NBQy9GQSwwQkFBQSxnQ0FBQTtDQUVBQSwrQkFBQTtDQUVJMVEsb0JBQUEsTUFBb0IwUTtDQUNwQjFRLG9CQUFBLE1BQW9CMFE7Q0FDcEIxUSw0QkFBc0IwUTtDQUN0QjFRLGtCQUFBO0NBRUgsS0FQRDtDQVNIO0NBL0pMOztDQUFBLHNDQW1LZXVPO0NBRVA7Q0FDQSxRQUFJNUYsQ0FBQyxPQUFPLE1BQU1BLENBQUMsT0FBTyxFQUExQixTQUFzQzs7Q0FFdEMsYUFBU3NJLGlCQUFUO0NBQ0ksVUFBSXRJLEdBQUEsU0FBTTtDQUVOLFlBQUksV0FBQSxNQUFtQjZHLElBQUssVUFBUSxVQUFRO0NBQzVDLGNBQUtBLElBQUksS0FBS3VDLFdBQVcsY0FBQSxHQUFrQnRDLElBQUU7Q0FDaEQ7Q0FFSjtDQUNHLFVBQUk5RyxHQUFBLGFBQU0sR0FBVztDQUVqQixZQUFJO0NBQ0EsY0FBSSxXQUFBLEtBQWtCLEtBQU0sS0FBS29KLEtBQUcsS0FBS0MsRUFBYjtDQUM1QixlQUFJLEtBQUssZ0JBQWdCLGdCQUFpQixLQUFHLEtBQUtnRjtDQUNyRDtDQUNKO0NBRUo7O0NBRUQsV0FBTztDQUVWLEdBNUxMOztDQUFBLHdDQThMZ0J2SDtDQUVSLGVBQVc7Q0FFWDtDQUFBLFFBQTJCd0g7Q0FBM0I7Q0FBQTs7Q0FDQSxZQUFPLEVBQVA7Q0FDSUEsVUFBSSxhQUFHLENBQVd4VztDQUNsQmdJLE9BQUMsWUFBRztDQUNKaUIsT0FBQyxZQUFHLGtCQUFBLElBQUE7O0NBQ0oseUJBQW1CQTtDQUNmM0ksUUFBQUE7Q0FDQTtDQUNBLHVCQUFla1c7Q0FDZjtDQUNBLGVBQU9sVztDQUNWO0NBRUo7O0NBRUQ7Q0FFSCxHQW5OTDs7Q0FBQTtDQXVOUSxvQkFBQTtDQUNJLG1DQUFBO0NBQ0EsOEJBQUE7Q0FDQSxrQkFBQTtDQUNIO0NBRUosR0E3Tkw7O0NBQUE7Q0FpT1E7Q0FDQTtDQUVIO0NBR0Q7Q0FDQTtDQXhPSjs7Q0FBQSxvQ0EwT2N3TjtDQUVOO0NBRUgsR0E5T0w7O0NBQUEsd0NBZ1BnQkE7Q0FFUiw0QkFBVyxDQUFlQSxDQUFmO0NBRVgsYUFBQTs7Q0FFQSx5QkFBQTtDQUVJLGlCQUFBO0NBQ0Esb0JBQUEsQ0FBZ0JBO0NBRW5CLCtCQUFNO0NBRUgsb0JBQUEsQ0FBZTs7Q0FDZjtDQUNJLGFBQUssYUFBYyxLQUFLMkksWUFDbkI7Q0FDUjtDQUNKO0NBQ0c7Q0FDSSxxQkFBYSxLQUFLQyxLQUFLLFlBQUEsQ0FBYXRQOztDQUVwQyxhQUFLdVA7O0NBQ0wsYUFBSztDQUNELGVBQUtyQjtDQUNMO0NBQ0g7Q0FDSjtDQUVKOztDQUVEO0NBRUgsR0FqUkw7O0NBQUEsd0NBbVJnQnhIO0NBRVI7Q0FDQSw0QkFBVyxDQUFlQSxDQUFmO0NBRVgsYUFBQTs7Q0FFQSx3QkFBQTtDQUNJLHFCQUFBO0NBQ0Esb0JBQUEsQ0FBZTtDQUNmO0NBRUgsZ0NBQU07Q0FFSDtDQUNBLHFCQUFBLENBQWdCOztDQUNoQjtDQUNJLHVCQUFBO0NBQ0Esa0JBQVUsS0FBS3NCLEtBQUtKLElBQUUsVUFBWjtDQUNWLHNDQUFzQyxVQUFRO0NBQ2pEOztDQUVKO0NBRUc7Q0FDQSxvQkFBQSxDQUFlO0NBQ2YscUJBQUEsQ0FBZ0I7Q0FDaEI7Q0FFSDs7Q0FFRCw4QkFBQTtDQUNBO0NBRUE7Q0FFSCxHQXZUTDs7Q0FBQSxnQ0F5VFlsQjtDQUVKLDRCQUFXLENBQWVBLENBQWY7Q0FDWCx3QkFBQTtDQUNBLFNBQUt5QixNQUFNekIsVUFBUTtDQUNuQixxQkFBaUJ5QixFQUFqQjtDQUNBO0NBRUg7Q0FqVUw7O0NBQUE7Q0F5VVEsb0JBQWdCO0NBQ2hCLG1CQUFBO0NBQ0Esa0JBQUEsQ0FBZSxDQUFmO0NBQ0EsbUJBQUEsQ0FBZ0IsQ0FBaEI7Q0FFSCxHQTlVTDs7Q0FBQTtDQWtWUSwyQkFBQTs7Q0FFQTtDQUNJO0NBQVE7Q0FDSix5Q0FBaUM7Q0FDckM7O0NBQ0E7Q0FBUTtDQUNKLHlDQUFpQztDQUNyQzs7Q0FDQTtDQUFRO0NBQ0oseUNBQWlDLFlBQVl2SztDQUNqRDtDQVRKOztDQWFBO0NBQ0gsR0FsV0w7O0NBQUE7Q0FzV1EsMkJBQUE7Q0FFQSxpQkFBYXpCOztDQUViO0NBQ0k7Q0FBUTtDQUNKQSxRQUFBQSxDQUFDLFlBQVk7Q0FDYkEsUUFBQUEsQ0FBQyxpQkFBaUI7Q0FDdEI7O0NBQ0E7Q0FBUTtDQUNKQSxRQUFBQSxDQUFDO0NBQ0RBLFFBQUFBLENBQUMsaUJBQWlCO0NBQ3RCOztDQUNBO0NBQVE7Q0FDSkEsUUFBQUEsQ0FBQyxZQUFZO0NBQ2JBLFFBQUFBLENBQUMsaUJBQWlCLFlBQVl5QjtDQUNsQztDQVpKOztDQWdCQTtDQUVILEdBNVhMOztDQUFBO0NBZ1lRLHNDQUFBO0NBQXNDO0NBQXRDOztDQUNBLGlCQUFhO0NBRWhCLEdBbllMOztDQUFBO0NBdVlRLGtCQUFBO0NBRUE7Q0FDQTtDQUVBLDZDQUF5QztDQUN6QztDQUVBLHVEQUFpRCxLQUFLO0NBRXRELGdEQUEwQyxLQUFLO0NBQy9DO0NBQ0EsU0FBSzRSO0NBQ0wsdUNBQW1DQTtDQUVuQyxTQUFLeE8sQ0FBTCxDQUFPLENBQVA7Q0FDQSxzQ0FBa0N3Tzs7Q0FFbEMsaUNBQUE7Q0FDSSxhQUFBLFVBQVUsR0FBVTtDQUNwQixpQkFBQTtDQUNIOztDQUVELFlBQUEsRUFBVTdPOztDQUNWLGtCQUFBLGlCQUFBLEdBQThCLEVBQTlCO0NBRUlBLE9BQUMsWUFBRyxDQUFVL0g7Q0FDZHdXLFVBQUksUUFBUWxQLGdCQUFpQjlCLFFBQUwsV0FBQSxVQUFBLGdCQUFBLGtCQUFBLHdDQUFtRixvQkFBbkYsaUJBQUEsR0FBa0k7Q0FDMUpnUixlQUFBO0NBQ0FBLFVBQUksR0FBSjtDQUNBQSxlQUFBLG1CQUFhO0NBQ2I7Q0FDQTs7Q0FHQSw2Q0FBd0I7Q0FFM0I7O0NBRUQsbUJBQUE7Q0FFSCxHQWhiTDs7Q0FBQTtDQW1iUTs7Q0FDQSxrQkFBQSxTQUFBLEdBQXNCLEVBQXRCO0NBQ0ksZ0JBQUEsQ0FBV3hXLHNDQUE4QixDQUFVQSxDQUFWLENBQWQ7Q0FDOUI7O0NBQ0QsbUJBQUE7Q0FDSCxHQXhiTDs7Q0FBQTtDQTRiUSx3QkFBQTtDQUVJOztDQUVBLGdCQUFTb0ksQ0FBTCxDQUFPO0NBQ1A7Q0FDQSw0QkFBb0IsY0FBQTtDQUNwQiw2QkFBcUIsY0FBQTtDQUNyQjtDQUNBLG1CQUFXLHVCQUF1QjtDQUNsQyxhQUFLQSxDQUFMLGdCQUF1QjtDQUMxQjs7Q0FFRCxHQUFPO0NBQ1AsV0FBSzhILHNDQUFlLENBQXBCLEVBQWlELENBQWpELEVBQW9ELGlCQUFHLEVBQUEsaUJBQW1CLEVBQUEsQ0FBMUUsRUFBNkYsQ0FBN0YsRUFBK0YsaUJBQUcsRUFBQSxpQkFBbUIsQ0FBZSxDQUFmO0NBRXhILGdCQUNTOUgsQ0FBTCxDQUFPLENBQVA7Q0FFUjtDQS9jTDs7Q0FBQSxrQ0FvZGE0RztDQUVMLG9CQUFBO0NBRUFBLG9CQUFnQkE7Q0FDaEJBLHNDQUFrQ0E7Q0FFbEMsOEJBQWdCLGVBQUE7Q0FFaEI7Q0FDQSx3Q0FBMEIsQ0FBWUE7Q0FFdEMsU0FBS08sS0FBS1A7Q0FFYixHQWxlTDs7Q0FBQSw4Q0FvZW1CNUY7Q0FFWCxpQ0FBQSx1QkFBaUMsQ0FBdUJBLENBQXZCLG9CQUM1QixnQkFBaUIsQ0FBZ0JBLENBQWhCO0NBRXpCLEdBemVMOztDQUFBO0NBNmVROztDQUVBLGVBQUEsQ0FBYSxDQUFiO0NBQ0EsMkNBQXVDOztDQUN2QyxvQkFBQTtDQUNJLGtCQUFBO0NBQ0EsWUFBQSxhQUFTLElBQUEsUUFBc0JkO0NBQy9CLGlDQUFBO0NBQ0g7Q0FDRyxpQ0FBQTtDQUNIOztDQUNELFNBQUsvRSxDQUFMLENBQU8sQ0FBUDtDQUNBLFNBQUtBLENBQUwsQ0FBTyxDQUFQOztDQUVBLGFBQVNpTixFQUFUO0NBQ0kseUNBQXlCLEdBQVc7Q0FDcEMsdUJBQWtCcEksQ0FBTCxFQUFBLEdBQVc7Q0FDM0I7Q0FDRyx1QkFBa0JBLENBQUwsRUFBQSxHQUFXO0NBQzNCOztDQUVELHFCQUFBO0NBRUE7Q0FFQSxhQUFBLFVBQW1CL0U7Q0FFbkIsY0FBQSxtQkFBVyxDQUFtQitGLENBQW5CO0NBRWQsR0ExZ0JMOztDQUFBO0NBOGdCUTs7Q0FFQSxhQUFTb0gsRUFBVCxXQUFjLDZCQUFvQyxFQUFyQjtDQUU3QjtDQUVBO0NBQ0EsU0FBS2pOLENBQUwsQ0FBTyxDQUFQO0NBQ0EsU0FBS0EsQ0FBTCxDQUFPLENBQVA7Q0FDQSxxQkFBa0I2RSxDQUFMLENBQU8sRUFBcEIsS0FBQSxpQkFBQTtDQUVBLGFBQUEsVUFBbUIvRTtDQUVuQixxQkFBQSxDQUFtQixDQUFDK0YsQ0FBcEI7Q0FFSDtDQTdoQkw7O0NBQUE7Q0FtaUJRLFNBQUtoQixDQUFMLENBQU8sQ0FBUDtDQUVILEdBcmlCTDs7Q0FBQTtDQXlpQlE7O0NBQ0EsWUFBTyxFQUFQO0NBQVcsMEJBQUEsQ0FBcUJwSSxjQUFyQixVQUFzQztDQUFqRDtDQUVILEdBNWlCTDs7Q0FBQTtDQWdqQlFxUixtQ0FBQTtDQUVBLGlCQUFhOU47Q0FDYixpQkFBYWdPO0NBQ2IsaUJBQWFEO0NBRWIsUUFBRy9OLENBQUMsQ0FBQyxnQkFBTDtDQUVBQSxJQUFBQSxDQUFDLENBQUMsQ0FBRDtDQUNEQSxJQUFBQSxDQUFDLENBQUMsQ0FBRDtDQUVEQSxJQUFBQSxDQUFDLENBQUMsQ0FBRDtDQUNEQSxJQUFBQSxDQUFDLENBQUMsQ0FBRDtDQUVEQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxpQkFBbUI7Q0FFcEIsU0FBSzRTLEtBQUsvUztDQUNWLGlDQUFBLE9BQXFDK1MsU0FBTztDQUM1QyxtQkFBQSxtQkFBZ0I7Q0FFbkIsR0Fwa0JMOztDQUFBO0NBQUEsRUFBMEI5RSxLQUExQjs7S0NDYXdGLE9BQWI7Q0FBQTs7Q0FFSSxtQkFBYTNQO0NBQVM7O0NBQUE7Q0FBVEEsT0FBUyxHQUFMO0NBQUs7O0NBRWxCLDhCQUFPQTs7Q0FFUCx1QkFBQSxDQUFvQkEsQ0FBcEI7O0NBRUEsbUJBQWNBO0NBRWQ7Q0FFQSxrQkFBYSxDQUFDLENBQUQ7Q0FDYixrQkFBYTtDQUNiLHFCQUFnQjtDQUNoQjtDQUNBO0NBQ0E7O0NBRUEsUUFBSUEsU0FBSjtDQUNJLG1CQUFBO0NBQ0EsaUJBQUE7Q0FDQSxvQkFBQTtDQUNIOztDQUVELG1CQUFjQTs7Q0FFZCxRQUFJQSxxQkFBSjtDQUNJLGdCQUFTLFFBQUE7Q0FDTCxtQkFBQTtDQUNIO0NBQ0csbUJBQUE7Q0FDQTtDQUNIO0NBQ0c7Q0FDQSxrREFBOEI7Q0FDOUIsa0RBQThCO0NBQzlCLGtEQUE4QjtDQUM5QixrREFBOEI7Q0FDOUIseUJBQWdCO0NBQ2hCO0NBQ0g7Q0FDSjs7Q0FFRDtDQUNBLGdCQUFXO0NBSVgsb0JBQWUsQ0FBQztDQUNoQjtDQUFjNkgsTUFBQUEsQ0FBQztDQUFJQyxNQUFBQSxDQUFDO0NBQUk5RSxNQUFBQSxDQUFDO0NBQUloSCxNQUFBQSxDQUFDO0NBQWxCOztDQUdaLFVBQUtrRixDQUFMLENBQU8sb0JBQUssd0dBQWtILFVBQWxIO0NBRVosa0JBQWE7Q0FFYjs7Q0FDQSxZQUFPLEVBQVA7Q0FFSSxvQ0FBaUIsa0JBQWlCLE1BQWdCLEdBQWhCLE9BQTBCO0NBQzVELFlBQUtBLGlCQUFjZCxpQkFBaUI5QixhQUFMLHdCQUFpQyx5QkFBakMsdUJBQUEsbUJBQUEsMkJBQUEscUJBQUEsZUFBQTtDQUMvQiwwQkFBa0I0QyxNQUFJcEksa0JBQVQ7Q0FDYixZQUFLb0ksTUFBSXBJLGNBQVQsY0FBMEIsQ0FBV0E7Q0FDckMsWUFBS29JLE1BQUlwSSxjQUFUO0NBQ0EsWUFBS29JLE1BQUlwSSxRQUFUO0NBRUEsaUJBQUE7Q0FFSDs7O0NBR0Q7Q0FDQSxVQUFLb0ksbUNBQXFCLG9EQUErRCx5REFBL0Q7O0NBRTFCLGNBQUE7O0NBekVrQjtDQTBFckI7O0NBNUVMOztDQUFBLHNDQThFZTBGO0NBRVA7Q0FDQSxRQUFJNUYsQ0FBQyxPQUFPLE1BQU1BLENBQUMsT0FBTyxFQUExQixTQUFzQztDQUV0QztDQUNBOztDQUdBLFlBQVEsRUFBUjtDQUNJLFVBQUlBLEdBQUEsR0FBSWtCLENBQUMsQ0FBQ3BKLENBQUQsQ0FBRCxPQUFXa0ksR0FBQSxHQUFJa0IsQ0FBQyxDQUFDcEosQ0FBRCxDQUFELEVBQUE7Q0FDMUI7O0NBRUQsV0FBTztDQUVWO0NBRUY7Q0FDSDtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTs7Q0FPRztDQUNIO0NBQ0E7Q0FDQTtDQUNBO0NBSUk7Q0FDQTtDQUNBO0NBdkhKOztDQUFBLHdDQXlIZ0I4TjtDQUVSLDRCQUFXLENBQWVBLENBQWY7O0NBRVgsb0JBQUE7Q0FDSSxpQkFBQTs7Q0FDQTtDQUNDLHVCQUFleE47Q0FDZixhQUFLTTtDQUFTbU8sVUFBQUE7Q0FBYUMsVUFBQUE7Q0FBYTlFO0NBQUtoSCxhQUFHLDBCQUEwQixDQUFDLEtBQUsxRixtQkFBbUIsQ0FBRSxLQUFLQSxLQUFMLENBQVk7Q0FBckc7Q0FDWixzQkFBZSxPQUFRLElBQUk7Q0FDM0I7O0NBQ0QsMkJBQU8sQ0FBZ0JzUTtDQUMxQjs7Q0FFRDtDQUNBO0NBQ1I7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQVFLLEdBckpMOztDQUFBLG9DQXVKY0E7Q0FFVCxtQkFBQTtDQUVPLGlCQUFBOztDQUVBLGVBQUE7Q0FBY2lCLFFBQUFBO0NBQUtDLFFBQUFBO0NBQUs5RSxRQUFBQTtDQUFLaEgsUUFBQUE7Q0FBakI7Q0FFWiwyQkFBTyxDQUFnQjRLO0NBQzFCOztDQUVEO0NBRUE7Q0FDUjtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQVNLLEdBMUxMOztDQUFBLHdDQTRMZ0JBO0NBRVI7Q0FDQSxZQUFRO0NBRVIsNEJBQVcsQ0FBZUEsQ0FBZjtDQUVYLGlCQUFhLEVBQWIsYUFBa0I7Q0FFakIsZ0ZBQ2tCLFNBQUE7Q0FDbEI7O0NBSUQsbUJBQUE7Q0FFQyw0QkFBc0I7Q0FFbEIsYUFBS2xOLE1BQUwsZ0JBQTZCLEtBQUtBLE1BQW5CLGdCQUE0QyxLQUFLQSxJQUFMO0NBRXhELFlBQUltSCxJQUFJLEtBQUtuSCxLQUFLc0MsSUFBTSxLQUFLdEMsS0FBS3NKLElBQUksS0FBS2tNO0NBRTNDLG1CQUFZLFlBQVosSUFBNkIsYUFBQTtDQUM3QixlQUFRLElBQUksNEJBQTZCLFdBQVc7Q0FFcEQ7Q0FFQSxhQUFLeFYsS0FBS21PLENBQVY7Q0FDQSxhQUFLbk8sS0FBS29PLENBQVY7Q0FFQWdHLGNBQU07Q0FDUjtDQUVMO0NBRUEscUJBQUEsR0FBbUIsWUFBRyxjQUFBO0NBQ3RCLDRCQUFzQixDQUF0QixZQUFvQzdDLGdCQUFMLEVBQXVCO0NBQ3RELDBCQUFxQnBEO0NBRXJCOztDQUtEO0NBRUg7Q0FJRDtDQS9PSjs7Q0FBQTtDQW1QUTtDQUdBOztDQUVEO0NBQ1A7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7O0NBRVE7Q0FFSCxHQW5RTDs7Q0FBQSxzQ0FzUWU3TDtDQUVQLHFCQUFBO0NBRUksVUFBSUEsNkJBQW9CLE1BQWdCQSxDQUFDO0NBQ3pDLFVBQUlBLDZCQUFvQixNQUFnQkEsQ0FBQztDQUN6QyxVQUFJQSw2QkFBb0IsTUFBZ0JBLENBQUM7Q0FDekMsVUFBSUEsNkJBQW9CLE1BQWdCQSxDQUFDO0NBRTVDO0NBQ0csZ0JBQUE7Q0FDSDs7Q0FJRCxlQUFBOztDQUlBO0NBQ1I7Q0FDQTtDQUVLLEdBN1JMOztDQUFBO0NBaVNROztDQUNBLFlBQU8sRUFBUDtDQUFXLFdBQUtrRixNQUFPcEksY0FBWixHQUE4QnVOO0NBQXpDO0NBRUgsR0FwU0w7O0NBQUE7Q0F3U1E7O0NBRUEsWUFBTyxFQUFQO0NBQ0ssZ0JBQUEsOEJBQStCO0NBQy9CLFdBQUtuRixNQUFPcEksY0FBWixhQUE4QixDQUFXQTtDQUM3Qzs7Q0FFRCxRQUFJd1EsRUFBSixXQUFTO0NBRVosR0FqVEw7O0NBQUEsOEJBbVRXdE47Q0FFSEE7Q0FFQTs7Q0FFQSxnQ0FBQTtDQUVJO0NBRUksd0JBQWlCLEtBQUs0VCxjQUF0QjtDQUVBO0NBQ2hCO0NBQ0E7Q0FDQTtDQUVhO0NBQ0csd0JBQWlCLEtBQUtBLEdBQXRCO0NBQ0g7Q0FFSjs7Q0FFRCxxQkFBQSxlQUFvQixFQUFBLFVBQUE7Q0FFcEI7Q0FFSDtDQUlEO0NBQ0E7Q0FuVko7O0NBQUEsa0NBcVZhMU8sR0FBRzBGLEdBQUcxSztDQUVYLGlCQUFhRztDQUNiLDZCQUF5QiwwQkFBSyxFQUF1QixTQUFTO0NBQzlEQSxJQUFBQSxlQUFDO0NBQ0RBLElBQUFBLGVBQUM7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FFSixHQTlWTDs7Q0FBQTtDQWtXUSxpQkFBYUE7Q0FDYixRQUFHLEVBQUg7Q0FDQUEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsZUFBQztDQUVKLEdBdldMOztDQUFBO0NBMldRLFFBQUl3SCxLQUFLO0NBQ1Q7Q0FFQSxtQkFBQTs7Q0FFQSxZQUFPLEVBQVA7Q0FDQyxzQkFBZ0IzQyxNQUFPcEksY0FBZDtDQUNGLGlCQUFTLGNBQWUsT0FBUTtDQUNoQyxlQUFRO0NBQ1Isb0JBQUE7Q0FDSDtDQUFRO0NBQ0wsZUFBUSxxQkFBc0IsVUFBQTtDQUNqQzs7Q0FFSitLLE1BQUFBLEVBQUUsR0FBRixhQUFRO0NBQ1I7O0NBRUQsY0FBQTtDQUVBLHFCQUFBLFlBQStCQSxFQUFFLENBQUMsQ0FBRCxDQUFiLGlCQUNKQSxFQUFYO0NBRVI7Q0FHRDtDQUNBO0NBcllKOztDQUFBO0NBeVlROztDQUVBLHNCQUFRLE9BQW1Cd0csc0JBQXNCO0NBQ2pELGlCQUFhaE87Q0FDYjs7Q0FDQSxZQUFPLEVBQVA7Q0FDSSxXQUFLNE8sR0FBTCx5QkFBNEIsSUFBYSxJQUFiLFFBQVosQ0FBRixFQUE4Qy9PO0NBQzVELFdBQUsrTyxHQUFMLENBQVNuUyxDQUFULFlBQXNCbVMsR0FBTCxDQUFTblMsQ0FBVCxZQUFzQm1TLEdBQUwsQ0FBU25TLENBQVQsRUFBWTtDQUM5Q3VELE1BQUFBLE1BQU92RCxPQUFQLFFBQXVCbVMsR0FBTCxDQUFTblMsQ0FBVDtDQUNsQnVELE1BQUFBLE1BQU92RCxRQUFQLFFBQXdCbVMsR0FBTCxDQUFTblMsQ0FBVDtDQUN0QjtDQUVKLEdBclpMOztDQUFBO0NBQUEsRUFBNkJxUixLQUE3Qjs7S0NBYTBGLEtBQWI7Q0FBQTs7Q0FFSSxpQkFBYTdQO0NBQVM7O0NBQUE7Q0FBVEEsT0FBUyxHQUFMO0NBQUs7O0NBRWxCLDhCQUFPQTs7Q0FFUCx1QkFBQSxDQUFvQkEsQ0FBcEI7O0NBR0Esa0JBQWFBLFdBQVc7Q0FDeEIsUUFBSUEsb0JBQUosZ0JBQXdDQTtDQUN4Qyx3QkFBbUJBO0NBRW5CO0NBRUE7Q0FDQTtDQUNBLG1CQUFjQTtDQUVkLGtCQUFhQTtDQUViO0NBR0E7O0NBQ0EsVUFBS2tCLENBQUwsQ0FBTyxvQkFBSywyRUFBQTs7Q0FFWixVQUFLQSxDQUFMLENBQU8sb0JBQUssdURBQUE7Q0FDWixVQUFLQSxDQUFMLENBQU8sb0JBQUssZ0dBQW9HLFVBQXBHO0NBQ1osVUFBS0EsQ0FBTCxDQUFPLG9CQUFLLDhEQUF1RSwrQ0FBdkU7Q0FFWixVQUFLQSxDQUFMLENBQU8sQ0FBUDtDQUVBOztDQUNBLFVBQUtBLENBQUwsQ0FBTyxDQUFQO0NBQ0EsVUFBS0EsQ0FBTCxDQUFPLENBQVAsK0JBQXFDOztDQUVyQyx5QkFBQTtDQUVJLFlBQU07Q0FBTixVQUFZNE87Q0FBWixVQUFvQmIsS0FBSyxNQUFLOVM7Q0FBOUIsVUFBbUM0VCxFQUFFOztDQUVyQywwQkFBbUI7Q0FDZkMsVUFBRTs7Q0FDRkYsVUFBRTtDQUNGQyxVQUFFO0NBQ0ZkLFVBQUUsVUFBUzlTLENBQUwsSUFBRCxJQUFXO0NBQ25COztDQUVELDBCQUFrQixTQUFRK0UsQ0FBTCxDQUFPLGdCQUFQO0NBRXJCLFlBQUtBLENBQUwsQ0FBTyxxQkFBUCxLQUFpQztDQUNqQyxZQUFLQSxDQUFMLENBQU8sZUFBUCxLQUEyQjtDQUMzQixZQUFLQSxDQUFMLENBQU8sU0FBUzBILEdBQWhCLFVBQXVCLEdBQU8sR0FBUixLQUFBO0NBQ3RCLFlBQUsxSCxDQUFMLENBQU8scUJBQVAsS0FBa0MsR0FBQyxHQUFKO0NBQy9CLFlBQUtBLENBQUwsQ0FBTyxlQUFQLEtBQTJCO0NBQzNCLFlBQUtBLENBQUwsQ0FBTyxTQUFTMEgsR0FBaEIsVUFBdUIsR0FBTyxHQUFSLEtBQWdCLEdBQUMsR0FBakI7Q0FFdEIsWUFBSzFILENBQUwsWUFBaUJkLGlCQUFpQjlCLFNBQUwsbUJBQUEsS0FBQSxxQkFBQSxHQUF5RCxHQUFBLEdBQUksR0FBN0QsMEJBQUEsc0JBQUEsa0JBQUEsb0JBQUEsNENBQThLLG9CQUE5SyxLQUFBO0NBQ2hDOztDQUVELGNBQUE7O0NBMURrQjtDQTREckI7O0NBOURMOztDQUFBLHNDQWdFZXNJO0NBRVA7Q0FDQSxRQUFJNUYsQ0FBQyxPQUFPLE1BQU1BLENBQUMsT0FBTyxFQUExQixTQUFzQztDQUV0QyxRQUFJQSxDQUFDLGNBQUwseUJBQ1NBLENBQUMsV0FBV29KLEVBQWhCLDhCQUNPO0NBRWY7Q0FHRDtDQUNBO0NBN0VKOztDQUFBLG9DQStFY3hEO0NBRU4sbUJBQUE7Q0FFSCxHQW5GTDs7Q0FBQSx3Q0FxRmdCQTtDQUVSLDRCQUFXLENBQWVBLENBQWY7Q0FFWCxhQUFBOztDQUVBLHlCQUFBO0NBQ0ksaUJBQUE7Q0FDQSxXQUFLMkUsR0FBTDtDQUNBLG9CQUFBLENBQWdCM0U7Q0FFbkI7Q0FFRDtDQUNSO0NBQ0E7OztDQUVRO0NBRUgsR0F4R0w7O0NBQUEsd0NBMEdnQkE7Q0FFUjtDQUVBLDRCQUFXLENBQWVBLENBQWY7O0NBRVgseUJBQUE7Q0FDSSxlQUFBLENBQVU7Q0FDVjtDQUVBO0NBQ0g7Q0FDRyxpQkFBQTtDQUNIOztDQUVELG1CQUFBO0NBRUksV0FBSyxHQUFLLHlCQUFlLFFBQWlCd0Qsa0JBQWpDLGFBQUEsUUFBMkVqSixHQUE1RSxRQUF5Rm9LOztDQUNqRztDQUNJMUssUUFBQUEsSUFBSXVCLFdBQVl2QixJQUFJLEtBQUtxTztDQUN6QixxQkFBYSxjQUFlLFFBQUEsR0FBYXJPLElBQUksS0FBS3FPO0NBQ2xELG9CQUFhO0NBQ2IsbUJBQVc7Q0FDZDs7Q0FDRHBCLE1BQUFBLEdBQUc7Q0FDTjs7Q0FFRDtDQUVIO0NBSUQ7Q0EzSUo7O0NBQUE7Q0ErSVEsaUJBQWE1TSxDQUFMLENBQU8sQ0FBUDs7Q0FFUixjQUFTLENBQUVMLEVBQVg7Q0FDSSxnQkFBQSxnQkFBYSxDQUFlQTtDQUM1QjtDQUNILGdCQUVTSyxDQUFMLENBQU8sQ0FBUCxpREFBdUQsRUFBL0I7Q0FFaEMsR0F4Skw7O0NBQUE7Q0E2SlE7Q0FDQTtDQUNBLGFBQUEsQ0FBVSxDQUFWO0NBRUgsR0FqS0w7O0NBQUE7Q0FxS1EsaUJBQWE3RTs7Q0FFYjtDQUNJO0NBQVE7Q0FDTDtDQUNDQSxRQUFBQSxDQUFDLFlBQVk7Q0FDYkEsUUFBQUEsQ0FBQyxpQkFBaUI7Q0FDbEJBLFFBQUFBLENBQUMsaUJBQWlCO0NBQ3RCOztDQUNBO0NBQVE7Q0FDSjtDQUNBQSxRQUFBQSxDQUFDLFlBQVk7Q0FDYkEsUUFBQUEsQ0FBQyxpQkFBaUI7Q0FDbEJBLFFBQUFBLENBQUMsaUJBQWlCO0NBQ3RCOztDQUNEO0NBQ1g7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQXJCUTtDQXlCSCxHQWhNTDs7Q0FBQTtDQW9NUSxRQUFJNFMscUJBQXNCQSwwQ0FBTCxDQUFaO0NBRVQsd0JBQUEsT0FBMEI1UyxDQUFMLENBQU8sQ0FBUCxVQUFrQjRTO0NBQ3ZDLGFBQVE1UyxDQUFMLENBQU8sRUFBVixPQUFtQkEsQ0FBTCxDQUFPLENBQVAsY0FBd0IrTixLQUFLNkU7Q0FDM0MsU0FBSy9OLENBQUwsQ0FBTyxDQUFQLGlEQUF1RCxFQUEvQjtDQUV4QixRQUFJb0ksRUFBSixXQUFTO0NBRVosR0E1TUw7O0NBQUE7Q0FnTlE7O0NBRUEsaUJBQWFlLFVBQVVDO0NBQ3ZCLFNBQUsyRSxTQUFTO0NBRWQsUUFBSWdCLFVBQVUzRjtDQUNkLGlDQUFBLEVBQThCMkYsVUFBVTNGLEtBQUc7Q0FDM0Msd0JBQW9CMkYsS0FBSzs7Q0FJekIsaUJBQWE1VDtDQUViQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxlQUFrQmlPO0NBQ25Cak8sSUFBQUEsQ0FBQyxDQUFDLENBQUQ7O0NBRURBLElBQUFBLENBQUMsQ0FBQyxDQUFELGNBQWdCK047Q0FDakIvTixJQUFBQSxDQUFDLENBQUMsQ0FBRDtDQUNEQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxjQUFnQitOO0NBQ2pCL04sSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQsY0FBaUIrTjtDQUVsQixlQUFBO0NBRUgsR0F4T0w7O0NBQUE7Q0FBQSxFQUEyQkQsS0FBM0I7O0tDRGErRixTQUFiO0NBQUE7O0NBRUkscUJBQWFsUTtDQUFTOztDQUFBO0NBQVRBLE9BQVMsR0FBTDtDQUFLOztDQUVsQiw4QkFBT0E7Q0FFUCxrQkFBYTtDQUViLGtCQUFhQSxXQUFXO0NBQ3hCLHdCQUFtQkEsaUJBQWlCO0NBRXBDLG1CQUFjQTtDQUNkLHFCQUFnQkEsdUJBQXVCQTtDQUd2Qzs7Q0FHQSxVQUFLa0IsQ0FBTCxDQUFPLG9CQUFLLHdHQUFrSCxVQUFsSDtDQUVaLFVBQUtBLENBQUwsQ0FBTyxvQkFBSywrQ0FBMEQsdUlBQTFEO0NBQ1osVUFBS0EsQ0FBTCxDQUFPLENBQVA7O0NBR0EsVUFBS0EsQ0FBTCxDQUFPLG9CQUFLLG9EQUErRCx5REFBL0Q7O0NBR1osVUFBS0EsQ0FBTCxDQUFPLG9CQUFLLCtDQUEwRCwrRkFBMUQ7Q0FDWix3QkFBbUIsRUFBbkIsUUFBNkJBLENBQUwsQ0FBTyxDQUFQOztDQUd4QixjQUFBOztDQTdCa0I7Q0ErQnJCOztDQWpDTDs7Q0FBQSxzQ0FtQ2UwRjtDQUVQO0NBQ0EsUUFBSTVGLENBQUMsT0FBTyxNQUFNQSxDQUFDLE9BQU8sRUFBMUIsU0FBc0M7Q0FDdEMsUUFBSUEsQ0FBQyxXQUFXb0osRUFBaEI7Q0FDQSxXQUFPO0NBRVY7Q0FHRDtDQUNBO0NBOUNKOztDQUFBLG9DQWdEY3hEO0NBRU4sc0JBQUE7O0NBRUEsbUJBQUE7Q0FDSSxpQkFBQTtDQUNBLDJCQUFPLENBQWdCQTtDQUMxQjs7Q0FFRDtDQUVILEdBM0RMOztDQUFBLHdDQTZEZ0JBO0NBRVIsc0JBQUE7Q0FFQSw0QkFBVyxDQUFlQSxDQUFmOztDQUVYLG9CQUFBO0NBQ0ksaUJBQUE7Q0FDQSw4Q0FBMEMxRixDQUFMLENBQU8sQ0FBUDtDQUNyQywyQkFBTyxDQUFnQjBGO0NBQzFCOztDQUVEO0NBRUgsR0EzRUw7O0NBQUEsd0NBNkVnQkE7Q0FFUixzQkFBQTtDQUVBLDRCQUFXLENBQWVBLENBQWY7Q0FHWDtDQUVBO0NBQ0E7O0NBRUEsWUFBUTtDQUVSLHVCQUFBLG9CQUFzQixrQkFDakI7Q0FFTCxtQkFBQSxNQUFzQkEscUJBQVksQ0FBVWlCO0NBRTVDLHVCQUFPLFVBQXVCdUMsTUFBdkIsYUFBQTtDQUVWO0NBbEdMOztDQUFBLGtDQXNHYWxKLEdBQUcwRixHQUFHdks7Q0FFWCxTQUFLQSxDQUFMLENBQU8sQ0FBUDtDQUNBLFNBQUtBLENBQUwsQ0FBTyxDQUFQLGNBQXVCK047Q0FFdkIsU0FBSy9OLENBQUwsQ0FBTyxDQUFQLGNBQXVCK047Q0FDdkIsU0FBSy9OLENBQUwsQ0FBTyxDQUFQO0NBRUgsR0E5R0w7O0NBQUE7Q0FtSFEsZUFBQTtDQUVIO0NBR0Q7Q0FDQTtDQXpISjs7Q0FBQSxrQ0EySGE2RSxHQUFHMEYsR0FBRzFLO0NBRVgsaUJBQWFHO0NBQ2IsaUJBQWErTixLQUFLO0NBQ2xCL04sSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FFSixHQXBJTDs7Q0FBQTtDQXdJUSxpQkFBYUE7Q0FDYixRQUFHLEVBQUg7Q0FDQUEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FDREEsSUFBQUEsQ0FBQyxDQUFDLENBQUQ7Q0FFSixHQTdJTDs7Q0FBQTtDQWlKUSxtQkFBQTtDQUVBLHNCQUFrQjZFLENBQUwsQ0FBTyxDQUFQO0NBRWIsdUJBQWtCLEVBQWxCLE9BQTJCQSxDQUFMLENBQU8sQ0FBUCxnQkFBd0IsYUFDcENBLENBQUwsQ0FBTyxDQUFQO0NBRUwsY0FBQTtDQUVBLGFBQUE7Q0FFSDtDQUdEO0NBQ0E7Q0FoS0o7O0NBQUE7Q0FvS1E7O0NBRUEsaUJBQWE3RTtDQUNiQSxJQUFBQSxDQUFDLENBQUMsQ0FBRCxjQUFnQitOO0NBQ2pCL04sSUFBQUEsQ0FBQyxDQUFDLENBQUQsZUFBaUJnTztDQUVsQmhPLElBQUFBLENBQUMsQ0FBQyxDQUFELGNBQWdCK047Q0FDakIvTixJQUFBQSxDQUFDLENBQUMsQ0FBRCxlQUFpQmdPO0NBRXJCLEdBN0tMOztDQUFBO0NBQUEsRUFBK0JGLEtBQS9COztLQ0NhZ0csS0FBYjtDQUFBOztDQUVJLGlCQUFhblE7Q0FBUzs7Q0FBQTtDQUFUQSxPQUFTLEdBQUw7Q0FBSzs7Q0FFbEIsOEJBQU9BO0NBRVAsaUJBQWFBLFlBQVk7Q0FFekIsVUFBS2tCLENBQUwsQ0FBTyxvQkFBSyw0RUFBc0YsbUNBQXRGOztDQUVaLG9CQUFlLEVBQWY7Q0FFSSxZQUFLN0UsQ0FBTCxDQUFPLFNBQVAsVUFBbUI7Q0FDbkIsWUFBS0EsQ0FBTCxDQUFPLEdBQUd1TSxHQUFWO0NBQ0EsWUFBSzFILENBQUwsQ0FBTyxTQUFTMEgsR0FBaEI7Q0FFSDs7Q0FFRCxVQUFLMUgsQ0FBTCxDQUFPLENBQVAsbUNBQXdCLEVBQUEsRUFBcUIsQ0FBckIsYUFBQSx3QkFBd0MsQ0FBbUIsQ0FBbkIsYUFBQSxLQUFBO0NBQ2hFLFVBQUtBLENBQUwsQ0FBTyxDQUFQOztDQUVBLGNBQUE7O0NBbkJrQjtDQXFCckI7O0NBdkJMOztDQUFBO0NBMkJRLFNBQUtBLENBQUwsQ0FBTyxDQUFQO0NBRUgsR0E3Qkw7O0NBQUE7Q0FpQ1EsU0FBS0EsQ0FBTCxDQUFPLENBQVA7Q0FFSCxHQW5DTDs7Q0FBQTtDQXVDUTs7Q0FDQSxTQUFLN0UsQ0FBTCxDQUFPLENBQVAsbUJBQTJCO0NBQzNCLFNBQUtBLENBQUwsQ0FBTyxDQUFQLG1CQUE0QixLQUFLO0NBRXBDLEdBM0NMOztDQUFBO0NBQUEsRUFBMkI4TixLQUEzQjs7S0NEYWlHLE1BQWI7Q0FBQTs7Q0FFSSxrQkFBYXBRO0NBQVM7O0NBQUE7Q0FBVEEsT0FBUyxHQUFMO0NBQUs7O0NBRWxCLDhCQUFPQTtDQUVQLGtCQUFhQSxXQUFXO0NBRXhCOztDQUVBLG9CQUFlQSx5QkFBdUIsQ0FBRTs7Q0FFeEMsd0JBQW1CQTtDQUNuQix1QkFBa0JBO0NBQ2xCLHVCQUFrQkE7Q0FDbEIseUJBQW9CQTtDQUVwQixJQUFhQTtDQUViLFVBQUtrQixDQUFMLENBQU8sb0JBQUssNEdBQStHLCtGQUEvRztDQUNaLFVBQUtBLENBQUwsQ0FBTyxDQUFQO0NBRUEsVUFBS0EsQ0FBTCxDQUFPLG9CQUFLLCtDQUEwRCx1SUFBMUQ7Q0FDWixVQUFLQSxDQUFMLENBQU8sQ0FBUDtDQUVBLDRDQUFtQztDQUNuQyxVQUFLQSxDQUFMLENBQU8scUJBQUssZ0dBQUE7Q0FBK0c4QixNQUFBQTtDQUF5QkQ7Q0FBcUI5RTtDQUFoRCxLQUE3RztDQUVaLGlCQUFZO0NBQ1o7O0NBRUEsY0FBQTs7Q0E3QmtCO0NBK0JyQjs7Q0FqQ0w7O0NBQUEsc0NBbUNlMkk7Q0FFUDtDQUNBLFFBQUk1RixDQUFDLE9BQU8sTUFBTUEsQ0FBQyxPQUFPLEVBQTFCLFNBQXNDO0NBQ3RDLFFBQUlBLENBQUMsVUFBVW9KLE1BQU1wSixDQUFDLFVBQVVvSixLQUFHLEVBQW5DO0NBQ0E7Q0FFSDtDQUdEO0NBQ0E7Q0E5Q0o7O0NBQUEsb0NBZ0RjeEQ7Q0FFTixtQkFBQTtDQUNJO0NBQ0EsaUJBQUE7O0NBRUEsMkJBQU8sQ0FBZ0JBO0NBQzFCOztDQUVEO0NBRUgsR0EzREw7O0NBQUEsd0NBNkRnQkE7Q0FFUiw0QkFBVyxDQUFlQSxDQUFmO0NBRVgsYUFBQTtDQUVBO0NBRUE7O0NBQ0EseUJBQU8sQ0FBZ0JBLENBQWhCO0NBRVYsR0F4RUw7O0NBQUEsd0NBMEVnQkE7Q0FFUixRQUFJMEM7Q0FFSiw0QkFBVyxDQUFlMUMsQ0FBZjtDQUtYOztDQUVBLHVCQUFBO0NBQ0k7Q0FDQTBDLFFBQUUsd0JBQWMsSUFBQSxHQUFrQjtDQUNyQztDQUNHQSxRQUFFLGFBQUc7Q0FDUjs7Q0FFRCxXQUFPQTtDQUVWO0NBOUZMOztDQUFBLGdDQWtHWXROO0NBRUpBLGFBQVM7O0NBRVQsd0JBQUE7Q0FDSSxnQkFBQTtDQUNBLFdBQUtrRixDQUFMLENBQU8sY0FBUDtDQUNBLGVBQUE7Q0FDSDs7Q0FFRCxhQUFBLENBQVUsQ0FBVjtDQUVILEdBOUdMOztDQUFBO0NBa0hRLGFBQUEsQ0FBVyxDQUFYO0NBRUgsR0FwSEw7O0NBQUEsOEJBc0hXTDtDQUVIOztDQUVBLHVCQUFBO0NBRUksZ0JBQVEsZUFBSTs7Q0FFWixnQkFBUTtDQUNKLGFBQUs7Q0FBZ0IseUJBQWU7Q0FBTUEsVUFBQUEsQ0FBQztDQUFJLHNCQUFBLENBQWM7Q0FBUztDQUMvRCx5QkFBZTtDQUFRO0NBQ2pDOztDQUVELGlDQUFBLEdBQTZCOztDQUU3QjtDQUVJO0NBQVEsbUJBQUE7Q0FBZSxlQUFLeEUsS0FBT3dELFFBQVE7Q0FBaUIsZUFBS3hELGtCQUFvQjtDQUFrQjtDQUFPOztDQUM5RztDQUFRLG1CQUFBO0NBQWUsZUFBS0EsS0FBT3dELFFBQVE7Q0FBaUIsZUFBS3hELGtCQUFvQjtDQUFpQjtDQUFPOztDQUM3RztDQUFRLG1CQUFBO0NBQWUsZUFBS0EsS0FBT3dELFFBQVE7Q0FBaUIsZUFBS3hELGtCQUFvQjtDQUFpQjtDQUFPOztDQUM3RztDQUFRLG1CQUFBO0NBQWUsZUFBS0EsS0FBT3dELFFBQVE7Q0FBaUIsZUFBS3hELGtCQUFvQjtDQUFtQjtDQUFPO0NBTG5IOztDQVNBeU8sWUFBTTtDQUVUOztDQUVEO0NBSUgsR0F0Skw7O0NBQUE7Q0EwSlEsZUFBQTtDQUNBLHdDQUFxQyxDQUE5QjtDQUVWLEdBN0pMOztDQUFBO0NBaUtRLFNBQUs1SixDQUFMLENBQU8sQ0FBUDtDQUVILEdBbktMOztDQUFBO0NBdUtROztDQUVBLGlCQUFhN0U7Q0FDYkEsSUFBQUEsQ0FBQyxDQUFDLENBQUQsY0FBZ0IrTjtDQUNqQi9OLElBQUFBLENBQUMsQ0FBQyxDQUFELGNBQWlCK04sS0FBSztDQUN2Qi9OLElBQUFBLENBQUMsQ0FBQyxDQUFELGVBQWtCZ08sS0FBSztDQUN4QmhPLElBQUFBLENBQUMsQ0FBQyxDQUFELGNBQWlCK047Q0FFckIsR0EvS0w7O0NBQUE7Q0FBQSxFQUE0QkQsS0FBNUI7O0tDQWFrRyxRQUFiO0NBQUE7O0NBRUksb0JBQWFyUTtDQUFTOztDQUFBO0NBQVRBLE9BQVMsR0FBTDtDQUFLOztDQUVsQiw4QkFBT0E7Q0FFUCxtQkFBY0E7Q0FDZCx3Q0FBQSw4QkFBbUQ7Q0FFbkQsa0JBQWFBLHVCQUFXLENBQVksQ0FBWjs7Q0FLeEI7Q0FFQSx3QkFBbUJBO0NBQ25CLHVCQUFrQkE7Q0FDbEIsdUJBQWtCQTtDQUVsQjtDQUNBLGdCQUFXO0NBQ1gsaUJBQVk7Q0FFWjs7Q0FFQSxrQkFBQSxlQUFBLEdBQThCLEVBQTlCO0NBRUlzUSxNQUFBQSxHQUFHO0NBQ0gsc0JBQUkscUJBQWdDQSxHQUFHO0NBRXZDLFlBQUtwUCxHQUFHLGNBQVdkLGlCQUFpQjlCLElBQUk0SyxHQUFULFNBQW9CNUssVUFBcEIsOEJBQTBEZ1MsR0FBRyxtQkFBQSw4Q0FBbUQscUJBQWhILDRCQUFBLHFCQUFBLGVBQUE7Q0FDL0IsWUFBS3BQLEdBQUcsR0FBQyxjQUFULEdBQTBCb1AsR0FBRyxtQkFBQTtDQUM3QixZQUFLcFAsR0FBRyxHQUFDLFlBQVQsZUFBd0IsQ0FBWXBJO0NBRXBDLGdCQUFBLE1BQWV3WCxHQUFHLElBQUE7Q0FDckI7O0NBRUQsY0FBQTs7Q0FwQ2tCO0NBc0NyQjs7Q0F4Q0w7O0NBQUEsc0NBMENlMUo7Q0FFUDtDQUNBLFFBQUk1RixDQUFDLE9BQU8sTUFBTUEsQ0FBQyxPQUFPLEVBQTFCLFNBQXNDO0NBRXRDO0NBQ0E7O0NBRUEsWUFBUSxFQUFSO0NBQ0MsVUFBSUEsR0FBQSxHQUFJa0IsQ0FBQyxDQUFDcEosQ0FBRCxDQUFELE9BQVdrSSxHQUFBLEdBQUlrQixDQUFDLENBQUNwSixDQUFELENBQUQsRUFBQSxXQUFrQjtDQUN6Qzs7Q0FFRCxXQUFPO0NBRVY7Q0FHRDtDQUNBO0NBNURKOztDQUFBLG9DQThEYzhOO0NBRU4sbUJBQUE7Q0FDSTtDQUNBLGlCQUFBOztDQUVBLDJCQUFPLENBQWdCQTtDQUMxQjs7Q0FFRDtDQUVILEdBekVMOztDQUFBLHdDQTJFZ0JBO0NBRVgsNEJBQVcsQ0FBZUEsQ0FBZjtDQUVSLGFBQUE7Q0FFSDtDQUNHLG9DQUErQixDQUFsQjtDQUNiLGFBQUE7Q0FDSCx5QkFBTyxDQUFnQkEsQ0FBaEI7Q0FJUCxHQXhGTDs7Q0FBQSx3Q0EwRmdCQTtDQUVSLFFBQUkwQztDQUVKLDRCQUFXLENBQWUxQyxDQUFmO0NBS1g7O0NBRUEsaUJBQWEsRUFBYjtDQUNJO0NBQ0EwQyxRQUFFLHlCQUFlLElBQUEsR0FBa0I7Q0FDdEM7Q0FDQUEsUUFBRSxhQUFHO0NBQ0w7O0NBRUQsV0FBT0E7Q0FFVjtDQTlHTDs7Q0FBQSxnQ0FrSFl6STtDQUVKO0NBQUEsUUFBT1I7O0NBRVAsa0JBQUEsY0FBQSxHQUErQixFQUEvQjtDQUVJLG9CQUFjLG1CQUFNLGtCQUFwQixHQUF1RCxhQUFjUSxDQUFYLEdBQWUsR0FBQztDQUd0RSxZQUFJLG1CQUFxQixZQUFhN0UsSUFBSSxLQUFLdVUsSUFBTCxDQUFXLEdBQUd6WCxDQUFDLFdBQ3BEa0QsSUFBSSxLQUFLdVUsSUFBTCxDQUFXLEdBQUd6WCxDQUFDO0NBRTNCO0NBRUQsVUFBR2tELENBQUgsR0FBTztDQUVWOztDQUVELFdBQU9xRTtDQUVWLEdBdElMOztDQUFBLDhCQXdJV1E7Q0FFSDtDQUVBLG1CQUFlOztDQUdmLGlCQUFJLENBQVUvSCxRQUFkO0NBSUk7Q0FFSTtDQUFRLGVBQUsrUixLQUFLL1IsQ0FBVjtDQUFrQixnQkFBQSxDQUFRQSxDQUFDLE1BQUsrRyxRQUFRO0NBQWlCLGdCQUFBLENBQVEvRyxDQUFDLG1CQUFrQjtDQUFrQjs7Q0FDOUc7Q0FBUSxlQUFLK1IsS0FBSy9SLENBQVY7Q0FBa0IsZ0JBQUEsQ0FBUUEsQ0FBQyxNQUFLK0csUUFBUTtDQUFpQixnQkFBQSxDQUFRL0csQ0FBQyxtQkFBa0I7Q0FBaUI7O0NBQzdHO0NBQVEsZUFBSytSLEtBQUsvUixDQUFWO0NBQWtCLGdCQUFBLENBQVFBLENBQUMsTUFBSytHLFFBQVE7Q0FBaUIsZ0JBQUEsQ0FBUS9HLENBQUMsbUJBQWtCO0NBQWlCO0NBSmpIOztDQVFBZ1MsWUFBTTtDQUVUOztDQUdEO0NBRUg7Q0FsS0w7O0NBQUE7Q0F3S1EsZUFBQTtDQUVBO0NBQUEsUUFBT3pLOztDQUVQLGtCQUFBLGNBQUEsR0FBK0IsRUFBL0I7Q0FFSSxxQkFBSSxrQkFBSixHQUF1QyxhQUFjLENBQVgsR0FBZSxHQUFDLFNBQ3BELGFBQWMsQ0FBWCxHQUFlLEdBQUM7Q0FDekIsVUFBR3JFLENBQUgsR0FBTztDQUNWOztDQUVELFdBQU9xRTs7Q0FFVjtDQUNMO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBRUssR0E5TEw7O0NBQUEsd0NBZ01vQlE7Q0FFWkEsYUFBUztDQUNULFNBQUtLLENBQUwsQ0FBT0wsQ0FBUDtDQUVILEdBck1MOztDQUFBLHNDQXVNbUJpSCxHQUFHakg7Q0FFZEEsYUFBUztDQUNULFNBQUt4RSxDQUFMLENBQU93RSxDQUFQLFlBQW9CO0NBQ3BCLFNBQUtLLENBQUwsQ0FBT0wsQ0FBUDtDQUVILEdBN01MOztDQUFBO0NBaU5RO0NBRUEsaUJBQWF4RTtDQUNiLGlCQUFhZ087Q0FDYixpQkFBYUQ7Q0FFYjtDQUNBLFFBQUlZLEtBQU07Q0FDVix5QkFBVyxDQUFZLEtBQUtBLFVBQU0sTUFBUWxTLENBQS9COztDQUVYLFlBQU8sRUFBUDtDQUVDLFdBQUttUyxHQUFMLG1CQUE2QixPQUFTLElBQVYsS0FBdUIsSUFBbkM7Q0FDaEIsV0FBS0EsR0FBTCxDQUFTblMsQ0FBVCxZQUFzQm1TLEdBQUwsQ0FBU25TLENBQVQsWUFBc0JtUyxHQUFMLENBQVNuUyxDQUFULEVBQVk7Q0FDM0N1RCxNQUFBQSxHQUFHLEdBQUMsT0FBSixRQUFtQjRPLEdBQUwsQ0FBU25TLENBQVQ7Q0FDZHVELE1BQUFBLEdBQUcsR0FBQyxRQUFKLFFBQW9CNE8sR0FBTCxDQUFTblMsQ0FBVDtDQUVsQjtDQUVKLEdBcE9MOztDQUFBO0NBQUEsRUFBOEJxUixLQUE5Qjs7S0NBYXFHLEtBQWI7Q0FBQTs7Q0FFSSxpQkFBYXhRO0NBQVM7O0NBQUE7Q0FBVEEsT0FBUyxHQUFMO0NBQUs7O0NBRXJCQSxJQUFBQTtDQUNBQSxJQUFBQTtDQUVHLDhCQUFPQTs7Q0FDUCxjQUFBOztDQU5rQjtDQVFyQjs7Q0FWTDtDQUFBLEVBQTJCbUssS0FBM0I7O0tDQWFzRyxJQUFiO0NBQUE7O0NBRUksZ0JBQWF6UTtDQUFTOztDQUFBO0NBQVRBLE9BQVMsR0FBTDtDQUFLOztDQUVsQiw4QkFBT0E7Q0FFUDtDQUNBO0NBQ0EsbUJBQWM7Q0FFZCxrQkFBYUE7Q0FDYjtDQUVBLHdDQUFhO0NBRWIsNENBQW1DO0NBRW5DLFVBQUtrQixDQUFMLENBQU8scUJBQUssZ0dBQUE7Q0FBK0c4QixNQUFBQTtDQUFjRDtDQUFxQjlFO0NBQXJDLEtBQTdHO0NBRVosVUFBSzVCLENBQUwsQ0FBTyxDQUFQLGVBQXVCOztDQUV2QixjQUFBOztDQW5Ca0I7Q0FxQnJCO0NBR0Q7Q0FDQTs7O0NBM0JKOztDQUFBLHdDQTZCZ0J1SztDQUVSLHlCQUFBO0NBSUgsR0FuQ0w7O0NBQUEsd0NBcUNnQkE7Q0FFUixpQkFBQSxxQkFBZ0I7Q0FFaEIsc0JBQUE7Q0FFQSxhQUFBO0NBRUE7Q0FFSCxHQS9DTDs7Q0FBQTtDQW1EUSxxQkFBQSxXQUFvQixDQUFVLENBQVYsZ0JBQ2YsQ0FBVSxDQUFWO0NBRVIsR0F0REw7O0NBQUE7Q0EwRFEscUJBQUEsV0FBb0IsQ0FBVSxDQUFWLGdCQUNmLENBQVUsQ0FBVjtDQUVSLEdBN0RMOztDQUFBLHFDQWlFSztDQUVEO0NBQ0o7Q0FDQTtDQUNBO0NBdEVBOztDQUFBLDhCQXlFVy9GO0NBRUg7O0NBRUEseUJBQUE7Q0FFSSxpQkFBQTs7Q0FFQTtDQUVJO0NBQVEscUJBQUE7Q0FBaUIsZUFBS3hFLEtBQUt3RCxRQUFRO0NBQWdCLGVBQUt4RDtDQUEwQjs7Q0FDMUY7Q0FBUSxxQkFBQTtDQUFpQixlQUFLQSxLQUFLd0QsUUFBUTtDQUFnQixlQUFLeEQsa0JBQWtCO0NBQWE7O0NBQy9GO0NBQVEscUJBQUE7Q0FBaUIsZUFBS0EsS0FBS3dEO0NBQXdCLGVBQUt4RCxrQkFBa0I7Q0FBb0I7O0NBQ3RHO0NBQVEscUJBQUE7Q0FBaUIsZUFBS0EsS0FBS3dEO0NBQXdCLGVBQUt4RCxrQkFBa0IsV0FBQSxDQUFZeUI7Q0FBTTtDQUx4Rzs7Q0FTQWdOLFlBQU07Q0FFVDs7Q0FFRDtDQUVILEdBaEdMOztDQUFBO0NBb0dRLGVBQUE7Q0FHSCxHQXZHTDs7Q0FBQSxzQ0F5R2UvSTtDQUVQLHFCQUFBLFdBQW9CLENBQVUsQ0FBVjtDQUVwQjtDQUVBLHFCQUFBLFdBQW9CLENBQVUsQ0FBVjtDQUV2QixHQWpITDs7Q0FBQTtDQUFBLEVBQTBCb0ksS0FBMUI7O0tDQWF1RyxJQUFiO0NBQUE7O0NBRUksZ0JBQWExUTtDQUFTOztDQUFBO0NBQVRBLE9BQVMsR0FBTDtDQUFLOztDQUVsQiw4QkFBT0E7Q0FFUDtDQUVBLG1CQUFjQSxZQUFZO0NBRTFCLHdDQUFBLDhCQUFvRDs7Q0FHcEQ7Q0FFQSx3QkFBbUJBO0NBQ25CLHVCQUFrQkE7Q0FDbEIsdUJBQWtCQTtDQUVsQixtQkFBY0EsYUFBYSxFQUFELEVBQUksQ0FBSjtDQUMxQixrQkFBYUEsWUFBWSxFQUFELEVBQUksRUFBSjtDQUl4QjtDQUNBLGdCQUFXO0NBQ1gsaUJBQVk7Q0FDWixpQkFBWSxFQUFBLDRCQUFJLENBQUo7Q0FDWix3REFBMEMsQ0FBVyxpQkFBSyxDQUFZLENBQVosaUJBQW1CLENBQVksQ0FBWjtDQUM3RSxVQUFLa0IsQ0FBTCxDQUFPLENBQVAsZ0JBQXdCO0NBRXhCLFVBQUtBLENBQUwsQ0FBTyxzQkFBSyxzREFBd0QsQ0FBWSxLQUFHLCtGQUErRSxDQUFZLEtBQUcsMEJBQVUsQ0FBWSxLQUFHLFVBQTlMO0NBRVosWUFBUTtDQUFSO0NBQUE7Q0FBQTtDQUVBLG9CQUFlO0NBQ2YsaUJBQVk7Q0FDWixpQkFBWTtDQUNaLGlCQUFZOztDQUdaLGtCQUFBLGdCQUFvQixDQUFVLEVBQTlCLEdBQW1DLEVBQW5DO0NBQ0l3SyxRQUFFLFNBQVF4SyxDQUFMLENBQU8sWUFBUDtDQUNMd0ssTUFBQUEsZ0JBQUE7O0NBQ0EsZ0JBQVUsR0FBRyxDQUFiLEdBQWlCLGFBQUcsRUFBQSxDQUFwQixFQUFrQ3hIO0NBRTlCeU07Q0FDQUE7O0NBRUEseUJBQWdCOVA7Q0FFWmtCLHFDQUE0QjtDQUM1QkEsWUFBRTZPLGdCQUFnQixnQkFBZSwrQ0FBNEMsTUFBS0MsTUFBTSxxQkFBaUIsTUFBS0EsTUFBTSxxQkFBaUIscUVBQWdFLDBDQUFxQyxNQUFLQyxTQUFPO0NBQ3RQL08sd0JBQWM7Q0FDZDRPOztDQUVBLHVCQUFBLENBQWF4RDs7Q0FDYixnQkFBS3RDLElBQUwsQ0FBVXNDO0NBRWI7Q0FFR3BMLHFDQUE0QjtDQUM1QkEsWUFBRTZPLGdCQUFnQiw0Q0FBeUMsTUFBS0MsTUFBTSxxQkFBaUIsTUFBS0EsTUFBTTtDQUNsR0Y7Q0FFSDs7Q0FFRCxrQkFBTyxDQUFQLGlCQUFVLHVDQUNMO0NBRUw5UCxRQUFBQTtDQUVIO0NBQ0o7O0NBRUQsY0FBQTs7Q0F6RWtCO0NBMkVyQjs7Q0E3RUw7O0NBQUEsc0NBK0VlK0Y7Q0FFUDtDQUNBLFFBQUk1RixDQUFDLE9BQU8sTUFBTUEsQ0FBQyxPQUFPLEVBQTFCLFNBQXNDLENBQUM7Q0FHdkMsUUFBSWlQO0NBQ0osUUFBSWM7Q0FFSixRQUFJN1EsS0FBSyxDQUFDO0NBQ1YsWUFBUSxDQUFDO0NBQ1QsZUFBVyxDQUFDO0NBQ1oscUJBQVEsQ0FBVSxDQUFWOztDQUNSLFlBQVEsRUFBUjtDQUNDLFVBQUljLEdBQUEsR0FBTWlQLEVBQUUsQ0FBQ25YLENBQUQsQ0FBRixPQUFZa0ksR0FBQSxHQUFNaVAsRUFBRSxDQUFDblgsQ0FBRCxDQUFGLEVBQUEsQ0FBNUIsR0FBd0M7Q0FDeEM7O0NBRURBLGlCQUFJLENBQVUsQ0FBVjs7Q0FDSixZQUFRLEVBQVI7Q0FDSSxVQUFJa0ksR0FBQSxHQUFNK1AsRUFBRSxDQUFDalksQ0FBRCxDQUFGLE9BQVlrSSxHQUFBLEdBQU0rUCxFQUFFLENBQUNqWSxDQUFELENBQUYsRUFBQSxPQUFlO0NBQzlDOztDQUVELGNBQU8sZUFBYSxFQUFwQjtDQUNJb0gsUUFBRSxJQUFJLE9BQVE7Q0FDZCxZQUFLLFFBQU0wSyxHQUFMLEdBQVMsS0FBSyxHQUFHO0NBQzFCOztDQUVELFdBQU8xSztDQUVWO0NBR0Q7Q0FDQTtDQWhISjs7Q0FBQSxvQ0FrSGMwRztDQUVOLG1CQUFBO0NBQ0ksZ0JBQUE7Q0FDQSxpQkFBQTs7Q0FFQSwyQkFBTyxDQUFnQkE7Q0FDMUI7O0NBRUQ7Q0FFSCxHQTdITDs7Q0FBQSx3Q0ErSGdCQTtDQUVYLFFBQUkxRyxrQkFBSyxDQUFlMEcsQ0FBZjtDQUVOLFFBQUkxRyxNQUFKO0NBRUg7Q0FDRyw2QkFBeUJBLEVBQVo7Q0FDYixhQUFBO0NBQ0gseUJBQU8sQ0FBZ0IwRyxDQUFoQjtDQUVQLEdBMUlMOztDQUFBLHdDQTRJZ0JBO0NBRVIsUUFBSTBDO0NBRUosUUFBSXBKLGtCQUFLLENBQWUwRyxDQUFmOztDQUVULFFBQUkxRyxPQUFPLEVBQVg7Q0FDSTtDQUNBb0osUUFBRSx5QkFBZSxJQUFBLEdBQWtCLEdBQUdwSjtDQUN6QztDQUNBb0osUUFBRSxhQUFHO0NBQ0w7O0NBRUQsV0FBT0E7Q0FFVjtDQTNKTDs7Q0FBQSxnQ0ErSll6STtDQUVKO0NBQUEsUUFBT1I7O0NBRVAsa0JBQUEsY0FBQSxHQUErQixFQUEvQjtDQUVJLGtCQUFBLEdBQWdCLGFBQWNRLENBQVgsRUFBYy9ILFNBQzNCLGFBQWMsQ0FBWCxFQUFjQTtDQUV2QixVQUFHa0QsQ0FBSCxHQUFPO0NBRVY7O0NBRUQsV0FBT3FFO0NBRVYsR0E5S0w7O0NBQUEsOEJBZ0xXUTtDQUVIO0NBRUEsWUFBUVg7O0NBRVIsaUJBQUksQ0FBVXBILFFBQWQ7Q0FFSTtDQUVJO0NBQVEsZUFBSytSLEtBQUsvUixDQUFWO0NBQWtCLDBCQUFrQjhYLE1BQU0vUSxRQUFRO0NBQWlCLDBCQUFrQitRLG1CQUFtQjtDQUFrQjs7Q0FDbEk7Q0FBUSxlQUFLL0YsS0FBSy9SLENBQVY7Q0FBa0IsMEJBQWtCOFgsTUFBTS9RLFFBQVE7Q0FBaUIsMEJBQWtCK1EsbUJBQW1CO0NBQWlCOztDQUNqSTtDQUFRLGVBQUsvRixLQUFLL1IsQ0FBVjtDQUFrQiwwQkFBa0I4WCxNQUFNL1EsUUFBUTtDQUFpQiwwQkFBa0IrUSxtQkFBbUI7Q0FBaUI7Q0FKckk7O0NBUUE5RixZQUFNO0NBRVQ7O0NBR0Q7Q0FFSDtDQXZNTDs7Q0FBQTtDQTZNUSxlQUFBO0NBQ0EscUJBQU8sRUFBQSxFQUFnQixDQUFoQjtDQUNWLEdBL01MOztDQUFBLHdDQWtOb0JqSztDQUVaLGdCQUFBLENBQWFBLENBQWI7Q0FFSCxHQXROTDs7Q0FBQSxzQ0F3Tm1CaUgsR0FBR2pIO0NBRWQsZ0JBQUEsQ0FBYUEsQ0FBYixrQkFBZ0M7Q0FDaEMsZ0JBQUEsQ0FBYUEsQ0FBYjtDQUVILEdBN05MOztDQUFBO0NBaU9ROztDQUVBLFVBQWNzRDtDQUVkLGdCQUFZO0NBQ1osZ0JBQVk7O0NBRVosa0JBQUEsZUFBb0IsQ0FBVSxFQUE5QixHQUFtQyxFQUFuQztDQUVJLGdCQUFPO0NBQ0hBLGNBQVEsS0FBS2pJLFVBQVksYUFBQSxJQUFlO0NBQ3hDLGFBQUs4VSxLQUFLN0QsS0FBTSxPQUFNLFdBQVcsSUFBSWhKO0NBQ3hDO0NBQ0dBLGNBQVEsS0FBS2pJLFVBQVksYUFBQSxJQUFlO0NBQ3hDLGFBQUs4VSxLQUFLN0QsS0FBTSxZQUFXLFVBQUEsQ0FBVyxDQUFYO0NBQzlCO0NBRUo7O0NBRURoSixxQkFBTSxDQUFZLENBQVo7O0NBRU4sa0JBQUEsZUFBb0IsQ0FBVSxFQUE5QixHQUFtQyxFQUFuQztDQUVJLHNCQUFrQkEsS0FBS0EsR0FBRyxhQUFHLENBQVcsQ0FBWCxDQUFiO0NBRWhCQSxNQUFBQSxpQkFBTyxpQkFBZ0IsQ0FBWTtDQUV0QztDQUVKLEdBOVBMOztDQUFBO0NBQUEsRUFBMEJnRyxLQUExQjs7S0NtQmFqRCxHQUFiLEdBRUksZUFBZTtDQUVYLE1BQUlwRyxhQUFKO0NBRUE7Q0FBQTtDQUFBLE1BQWFtUSxHQUFHO0NBQWhCLE9BQTJCOztDQUUzQixhQUFXblEsQ0FBQyxDQUFDLENBQUQ7Q0FFUmhLLFdBQU9nSyxDQUFDLENBQUMsQ0FBRDtDQUNSZCxRQUFJYyxDQUFDLENBQUMsTUFBTTtDQUVmLG9CQUFrQkEsQ0FBQyxDQUFDLENBQUQ7Q0FBb0I7Q0FFcENtUTtDQUNBLFFBQUluUSxDQUFDLENBQUMsZ0JBQU4sRUFBeUIsWUFBQSxFQUFBLEVBQWdCLEVBQWhCO0NBRXpCaEssV0FBT2dLLENBQUMsQ0FBQyxDQUFELFNBQVdBLENBQUMsQ0FBQyxDQUFEOztDQUVwQmQsUUFBSWMsQ0FBQyxDQUFDLENBQUQ7Q0FDTGQsSUFBQUEsU0FBU2MsQ0FBQyxDQUFDLENBQUQ7Q0FDVmQsSUFBQUEsVUFBVWMsQ0FBQyxDQUFDLENBQUQsQ0FBRCxDQUFLQSxDQUFDLENBQUMsQ0FBRCxDQUFOO0NBRWI7O0NBRUQsaUJBQWUsY0FBZjtDQUVBLHdCQUF1QmQsQ0FBQyxVQUFEOztDQUV2QjtDQUVJO0NBQWFhLE9BQUMsV0FBRyxDQUFTYjtDQUFJOztDQUM5QjtDQUFlYSxPQUFDLGFBQUcsQ0FBV2I7Q0FBSTs7Q0FDbEM7Q0FBaUJhLE9BQUMsZUFBRyxDQUFhYjtDQUFJOztDQUN0QztDQUFjYSxPQUFDLFlBQUcsQ0FBVWI7Q0FBSTs7Q0FDaEM7Q0FBWWEsT0FBQyxPQUFPa00sR0FBSixDQUFRL007Q0FBSTs7Q0FDNUI7Q0FBY2EsT0FBQyxZQUFHLENBQVViO0NBQUk7O0NBQ2hDO0NBQWNhLE9BQUMsWUFBRyxDQUFVYjtDQUFJOztDQUNoQztDQUFpQmEsT0FBQyxlQUFHLENBQWFiO0NBQUk7O0NBQ3RDO0NBQWFhLE9BQUMsV0FBRyxDQUFTYjtDQUFJOztDQUM5QjtDQUFhYSxPQUFDLFdBQUcsQ0FBU2I7Q0FBSTs7Q0FDOUI7Q0FBZ0I7Q0FBZWEsT0FBQyxjQUFHLENBQVliO0NBQUk7O0NBQ25EO0NBQWNhLE9BQUMsWUFBRyxDQUFVYjtDQUFJOztDQUNoQztDQUFrQjtDQUFlYSxPQUFDLGdCQUFHLENBQWNiO0NBQUk7O0NBQ3ZEO0NBQWNhLE9BQUMsWUFBRyxDQUFVYjtDQUFJOztDQUNoQztDQUFlYSxPQUFDLGFBQUcsQ0FBV2I7Q0FBSTs7Q0FDbEM7Q0FBaUJhLE9BQUMsZUFBRyxDQUFhYjtDQUFJOztDQUN0QztDQUFjO0NBQWNhLE9BQUMsWUFBRyxDQUFVYjtDQUFJOztDQUM5QztDQUFhYSxPQUFDLFdBQUcsQ0FBU2I7Q0FBSTs7Q0FDOUI7Q0FBYWEsT0FBQyxXQUFHLENBQVNiO0NBQUk7Q0FwQmxDOztDQXdCQSxNQUFJYTtDQUVBLFdBQUEsRUFBVUEsY0FBQSxDQUFnQkMsQ0FBQyxDQUFDLEVBQWxCLEVBQXNCQSxDQUFDLENBQUMsQ0FBRCxDQUF2QjtDQUNWLFdBQU9EO0NBRVY7Q0FFSjs7Q0M1RUw7Q0FDQTtDQUNBOztLQUVhcVEsR0FBYjtDQUVJLGVBQWFsUjtDQUFTO0NBQVRBLE9BQVMsR0FBTDtDQUFLOztDQUVsQjs7Q0FHQSxrQ0FBYztDQUNkLDZCQUFXO0NBR1gsUUFBSUEsUUFBSixnQkFBZSxDQUFnQkEsUUFBaEI7Q0FHZixTQUFLdUssS0FBS3ZLLEVBQUV1Szs7Q0FFWixRQUFJdkssMkJBQUo7Q0FDSSw0QkFBQTtDQUNBLGdDQUFBO0NBQ0g7OztDQUlEO0NBRUE7Q0FDQSxnQkFBWTtDQUVaLG9CQUFnQkE7Q0FDaEI7Q0FDQSxrQkFBY0Esc0JBQXNCQSxRQUFRO0NBQzVDLG9CQUFnQkEsa0NBQW1DQTtDQUVuRCx1QkFBbUJBLGVBQWU7Q0FDbEMsc0JBQWtCQTtDQUVsQixzQkFBa0JBLDJCQUEyQkE7Q0FFN0MsU0FBS21SLEtBQUs7O0NBR1Y7Q0FDQSxRQUFJblIsQ0FBQyxnQkFBTCxXQUF3QixLQUFjQSxDQUFDLENBQUM1RDtDQUN4QyxRQUFJNEQsQ0FBQyxnQkFBTCxXQUF3QixLQUFjQSxDQUFDLENBQUM5RDtDQUN4QyxRQUFJOEQsQ0FBQyxnQkFBTCxXQUF3QixLQUFjQSxDQUFDLENBQUM3RDtDQUN4QyxRQUFJNkQsQ0FBQyxnQkFBTCxXQUF3QixLQUFjQSxDQUFDLENBQUMzRDtDQUV4QyxhQUFBLGNBQWMsS0FBYyxLQUFLLGNBQUssQ0FBVUY7O0NBR2hELHFCQUFpQitOLEVBQUosTUFBQTtDQUNiO0NBQWNyQyxNQUFBQSxDQUFDO0NBQUlDLE1BQUFBLENBQUM7Q0FBSTVMLE1BQUFBO0NBQWVDLE1BQUFBLENBQUM7Q0FBNUI7O0NBR1oscUJBQWlCK04sRUFBSixNQUFBO0NBRWIsYUFBUztDQUNULGlCQUFhLENBQUM7Q0FDZCxTQUFLa0gsS0FBSzs7Q0FLVix1QkFBbUJwUix3QkFBd0JBO0NBQzNDLFNBQUtxUixzQ0FBNkIsQ0FBVWxWO0NBRTVDLHNCQUFrQjZELG9DQUFvQ0E7Q0FFdEQsb0JBQWdCQTtDQUNoQjtDQUNBO0NBQ0E7Q0FFQSxlQUFXO0NBRVgsbUJBQWUsQ0FBQztDQUNoQjtDQUNBLGlCQUFhO0NBQ2IsaUJBQWE7Q0FDYixTQUFLc1IsS0FBSztDQUlWO0NBRUEsa0NBQWUscUVBQUE7Q0FFZix1Q0FBb0IsNkVBQUE7Q0FDcEIsOENBQUE7Q0FFQSxnQ0FBYSx5Q0FBQTtDQUNiLDRDQUFBOztDQUdBLG1DQUFnQix3REFBOEQsS0FBYyx5REFBc0QvRyxRQUFsSTtDQUNoQiwwQ0FBQTtDQUVBLGlDQUFjLGlHQUFrRyxLQUFZLHVCQUE5RztDQUNkLHlDQUFBOztDQUdBLGlDQUFjLHVKQUFtQixVQUFBLGdDQUFrTCxtQ0FBbEwsc0JBQUEsR0FBNk87Q0FDOVEsd0NBQUE7Q0FDQTtDQUNBLHdDQUFvQ0E7O0NBSXBDLGtCQUFjdksseUJBQXlCQTs7Q0FFdkMsOENBQUE7Q0FDQyxpQkFBQTs7Q0FFQSxrREFBcUI7Q0FDckI7O0NBRUQsNEJBQUEsc0NBQTJCO0NBRTNCLDZDQUFBO0NBRUEsMEJBQUE7Q0FHQSxpQkFBQTtDQUVBLHFCQUFBLGlCQUFvQjtDQUVwQmlLLGtCQUFBO0NBRUg7O0NBaklMOztDQUFBLGtDQW1JYS9ILEdBQUcvRjtDQUVSO0NBQ0EsdUJBQUEscUJBQXlDQTtDQUN6QyxrQkFBQTtDQUVBOE47Q0FFSDtDQTNJTDs7Q0FBQTtDQWlKUSxjQUFBO0NBQ0EsNEJBQUEsc0NBQTJCO0NBQzNCQSxxQkFBQTtDQUVIO0NBR0Q7Q0FDQTtDQXpKSjs7Q0FBQSxxQ0EySmdCLENBM0poQjs7Q0FBQTtDQStKSyx5RUFBYyxVQUFBO0NBQ2QsaUNBQW9CLENBQVUvTjtDQUM5Qix3RUFBMkQsQ0FBVUM7Q0FFckUsR0FuS0w7O0NBQUE7Q0F1S0ssNEJBQUE7Q0FFQSxxQkFBUSxDQUFVRDtDQUNsQiwyREFBOEMsQ0FBVUM7Q0FDeEQ4Tix1QkFBQSxHQUFBLEdBQUEsT0FBQTtDQUVBO0NBN0tMOztDQUFBO0NBbUxRO0NBRUgsR0FyTEw7O0NBQUEsc0NBdUxlc0g7Q0FFUCxrQkFBQSxDQUFnQkEsQ0FBQyxFQUFqQixFQUFxQkEsQ0FBQyxDQUFDekosQ0FBdkI7Q0FFSCxHQTNMTDs7Q0FBQSx3Q0E2TGdCOUg7Q0FFUixrQkFBQSxDQUFnQkEsQ0FBaEI7Q0FDQSxnQkFBQSxDQUFjQSxVQUFkLEVBQTBCQSxNQUExQixFQUFrQ0EsTUFBbEMsRUFBMENBLFFBQTFDO0NBRUgsR0FsTUw7O0NBQUEsd0NBb01nQkE7Q0FFUixtQkFBQTtDQUNJLHFCQUFJLEVBQUEsY0FBaUIsTUFBaUJBLENBQUMsQ0FBQ2tCO0NBQzNDO0NBRUosR0ExTUw7O0NBQUE7Q0E4TVE0RCxzQkFBQSxPQUFBLE1BQUEsUUFBQSxhQUFBLFVBQUE7Q0FFSCxHQWhOTDs7Q0FBQSw4QkFrTlcvQztDQUVIO0NBRUgsR0F0Tkw7O0NBQUEsc0NBd05leUk7Q0FFUDtDQUNBO0NBRUg7Q0FHRDtDQUNBO0NBak9KOztDQUFBLDhCQW1PVzNKO0NBRU47O0NBRUEsbUJBQWVzUSxFQUFmO0NBRUMsYUFBQTs7Q0FFQTtDQUVDO0NBQ0csc0JBQVlQLG1CQUFtQjtDQUMvQixzQkFBWUEsbUJBQW1CO0NBQy9CLHNCQUFZQSxNQUFNL1EsUUFBUSxXQUFBLENBQVluRDtDQUN6QztDQUVBOztDQUNBO0NBQW1CLHNCQUFZa1UsbUJBQW1CO0NBQW9COztDQUN0RTtDQUFtQixzQkFBWUEsbUJBQW1CLFdBQUEsQ0FBWTlTO0NBQU07Q0FFcEU7O0NBQ0E7Q0FBbUIsc0JBQVk4UyxtQkFBbUI7Q0FBNEIsc0JBQVlBLE1BQU0vUTtDQUFnQjtDQUNoSDtDQWREOztDQWtCQTJSLGdCQUFVO0NBRVY7O0NBRUQ7Q0FFQTtDQUdEO0NBQ0E7Q0F2UUo7O0NBQUE7Q0EyUUsseUJBQXFCLEVBQXJCOztDQUVHLHFCQUFBO0NBQ0EscUJBQUE7Q0FDQTtDQUNBLG1CQUFlLENBQUM7O0NBTWhCdkgsZ0JBQUE7Q0FDQTtDQUVIO0NBR0Q7Q0FDQTtDQTdSSjs7Q0FBQSxzQ0ErUmVyRDtDQUVQO0NBQ0EsUUFBSTVGLENBQUMsT0FBTyxNQUFNQSxDQUFDLE9BQU8sRUFBMUIsU0FBc0M7Q0FFdEM7Q0FFQSxlQUFXO0NBRVgscUNBQXlCLGNBQWUsY0FBYyxDQUFVOUU7Q0FFaEUsUUFBSThFLENBQUMsY0FBSyxVQUFtQnFRLE1BQU9yUSxDQUFDLGNBQUssRUFBMUMsOEJBQ1lBLENBQUM7Q0FFYjtDQUVIO0NBR0Q7Q0FDQTtDQW5USjs7Q0FBQSw0Q0FxVGtCNEY7Q0FFYixlQUFXQTtDQUVYO0NBQ0E7Q0FFQSw0QkFBVyxDQUFlQSxDQUFmO0NBSVgseUNBQUE7Q0FDQSw0Q0FBQTs7Q0FFRyx1Q0FBQTtDQUF1Q3FELHNCQUFBO0NBQW9CLHNCQUFBO0NBQXlCOztDQUV2RixhQUFBOztDQUVBO0NBRUM7Q0FFVXJELG9CQUFZLGFBQUEsZUFBNkIsVUFBN0I7Q0FFWiwwQkFBSSxJQUFrQjlQLHNCQUF1QixZQUFBO0NBRXRELFlBQUksNEJBQTZCLHVCQUFBO0NBRWpDLFlBQUlBLCtCQUFnQyxLQUFLeVo7Q0FDaEMsWUFBSXpaLGdCQUFBLGlCQUFBLElBQXFDLHdCQUF5QixZQUFBOztDQUUzRSxtQkFBV29PO0NBQ0U7Q0FDSDs7Q0FFWDs7Q0FDQTtDQUVDO0NBQ0EsWUFBSXBPLCtCQUFnQyxLQUFLeVo7O0NBQ3pDLFlBQUl6WjtDQUNILHdCQUFjLGNBQWMsUUFBUTtDQUM5QixvQ0FBMEI7Q0FDMUI7Q0FDQSxlQUFLeVosS0FBSztDQUNWekYsbUJBQVM7Q0FDZjs7Q0FFRjs7Q0FDQTtDQUVDO0NBQ0EsWUFBSWhVLCtCQUFnQyxLQUFLeVo7Q0FDekMsWUFBSXpaLCtCQUFnQyxLQUFLeVo7Q0FDaEMsWUFBSXpaLDJCQUE0QixZQUFBO0NBQ3pDLFlBQUksYUFBYyx3QkFBd0IsS0FBS29SLEtBQUtKLElBQUksVUFBUTtDQUVqRTtDQXZDRDs7Q0E0Q0EsbUJBQUE7Q0FDQSxvQkFBQTtDQUVHLHdCQUFBO0NBQ0EsMEJBQUE7Q0FFSCxjQUFBLFdBQWE7Q0FFYixHQTNYTDs7Q0FBQSxvQ0E2WGNsQjtDQUlOLHdDQUFXLEVBQTRCQSxDQUE1Qjs7Q0FFWCw2QkFBQTtDQUNJLHNCQUFBO0NBQ0Esa0JBQUE7Q0FHQSxzQkFBQTtDQUVIOztDQUVELGlCQUFhLEVBQWI7Q0FDSSxpQkFBQSxRQUFtQnFCO0NBQ25CLHdCQUFBO0NBQ0g7Q0FFSixHQWpaTDs7Q0FBQSxvQ0FtWmNyQjtDQUVOLFNBQUswSyxNQUFNLEtBQUcxSztDQUNkLHFCQUFrQjBLLEVBQWxCO0NBQ0E7Q0FFSDtDQUdEO0NBQ0E7Q0E3Wko7O0NBQUE7Q0FpYVEsb0JBQUE7O0NBSUEsa0JBQUE7Q0FDQTs7Q0FHQSwyQkFBUTtDQUNSLFFBQUlHLHFCQUFLO0NBRVQsYUFBU0EsRUFBVCxnQkFBYztDQUVkO0NBSUg7Q0FHRDtDQUNBO0NBdGJKOztDQUFBO0NBMGJROztDQUVBLGVBQVczUSxDQUFDLENBQUMsZUFBYjtDQUVJQSxNQUFBQSxDQUFDLENBQUMsT0FBRjtDQUNBQSxNQUFBQSxDQUFDLENBQUMsT0FBRjtDQUVILHNCQUFpQkEsQ0FBQyxDQUFDLGVBQWI7Q0FFSCxVQUFJQSxDQUFDLG1CQUFvQixhQUFhQTtDQUFLd04sUUFBQUEsTUFBSztDQUFNRSxRQUFBQSxNQUFLO0NBQWxCO0NBRXJDMU4sUUFBQUEsQ0FBQyxJQUFJd04sT0FBTztDQUNaeE4sUUFBQUEsQ0FBQyxJQUFJME4sT0FBTztDQUNmO0NBRUo7O0NBRUQsMEJBQVEsRUFBaUIxTixDQUFqQjs7Q0FFUixrQkFBQTtDQUlBOztDQUVBLGlCQUFBLENBQWU0RyxDQUFmOztDQUdBLFFBQUksQ0FBQ0EsV0FBTDtDQUNJLFdBQUssR0FBR0EsQ0FBQyxDQUFDeEcsQ0FBRixDQUFJLHdCQUFKLEdBQStCMEg7O0NBQ3ZDLHlCQUFtQmQ7Q0FDZixhQUFLNEosSUFBTCxHQUFhdlYsQ0FBRjtDQUNYLGtCQUFBO0NBQ0g7Q0FDSjtDQUNHLGdCQUFBOztDQUNBLGVBQUEsQ0FBV3VMLEdBQUEsR0FBTTtDQUNwQjs7Q0FFRCxXQUFPQTtDQUVWLEdBbmVMOztDQUFBO0NBdWVRO0NBRUEsdUJBQUE7O0NBRUE7Q0FFSCxHQTdlTDs7Q0FBQTtDQWlmUXVDLDBCQUFBLFdBQUEsV0FBb0MsQ0FBVW5DLENBQTlDO0NBRUg7Q0FuZkw7O0NBQUEsa0NBdWZhakg7Q0FFTCw0QkFBUSxDQUFrQkEsQ0FBbEI7Q0FDUixjQUFXLEVBQVgsVUFBZ0IsQ0FBUy9ILENBQVQsT0FBQTtDQUVuQjtDQTVmTDs7Q0FBQSxzQ0FnZ0JlK0g7Q0FFUCw0QkFBUSxDQUFrQkEsQ0FBbEI7O0NBQ1IsY0FBVyxFQUFYO0NBQ0ksa0NBQTZCb0gsR0FBTCxDQUFTblAsQ0FBVCxFQUFZb0ksQ0FBWixDQUFjLENBQWQ7Q0FDeEIsV0FBSytHLFdBQVluUCxDQUFqQixFQUFvQjtDQUN2QjtDQUVKO0NBeGdCTDs7Q0FBQTtDQThnQlE7Q0FFQTs7Q0FDQSxZQUFPLEVBQVA7Q0FBVyxXQUFLbVAsR0FBTCxDQUFTblAsUUFBVDtDQUFYOztDQUVBLGVBQVc7Q0FDWG1SLG9CQUFnQjtDQUVoQixhQUFBLE9BQWlCOU4sQ0FBakI7Q0FFSDtDQUdEO0NBQ0E7Q0E1aEJKOztDQUFBO0NBaWlCUSx3QkFBQTtDQUVBOztDQUNBLFlBQU8sRUFBUDtDQUFXLFdBQUs4TCxHQUFMLENBQVNuUCxXQUFUO0NBQVg7Q0FFSCxHQXRpQkw7O0NBQUE7Q0EwaUJRLHdCQUFBO0NBRUFNLG1CQUFlO0NBRWYsa0JBQUE7O0NBRUEsYUFBQTtDQUNJLGlCQUFBLENBQVk7Q0FDWjtDQUNIOztDQUVEOztDQUNBLFlBQU8sRUFBUDtDQUNJLGVBQVM2TyxHQUFMLENBQVNuUDtDQUNULGFBQUttUCxHQUFMLGFBQXNCO0NBQ3RCLFlBQUksZUFBZ0IsYUFBZ0IsSUFBRSxLQUFLQSxHQUFMLENBQVNuUCxHQUFHcUQsQ0FBWixJQUFGLElBQXFCO0NBQzVEO0NBQ0o7Q0FFSjtDQUtEO0NBQ0E7Q0Fua0JKOztDQUFBLHNDQXFrQmU0RjtDQUVQLFNBQUtxUCxrQkFBUyxLQUFjO0NBQzVCLFNBQUtFLGNBQWNBLEtBQUs7Q0FDeEI7O0NBRUEsU0FBQTtDQUVJLGdCQUFBO0NBRUEsa0JBQUE7Q0FFQSxnQkFBQSxlQUFhO0NBQ2IsYUFBQSxlQUFVOztDQUlWLGdCQUFBLGVBQWEsUUFBb0I1QjtDQUVqQyxhQUFBLHNCQUFVLEVBQXNCO0NBRWhDLGdDQUFBLGVBQTZCO0NBQzdCLDhCQUFBLFVBQTJCO0NBRTlCOztDQUVELCtCQUFtQixVQUFtQjBCLEVBQXRDO0NBQ0EscUJBQWtCRSxFQUFsQjtDQUVILEdBbG1CTDs7Q0FBQSxrQ0FvbUJheEo7Q0FFTEEsbUJBQUksRUFBQSxHQUFBLFlBQUE7Q0FFSiwyQkFBYSxlQUFBO0NBQ2I7Q0FDQSxzQ0FBd0IsQ0FBWUE7Q0FDcEMsU0FBS3dKLEtBQUt4SjtDQUViO0NBR0Q7Q0FDQTtDQWpuQko7O0NBQUEsOEJBbW5CV0E7Q0FFSCxjQUFVQTtDQUNWZ0IseUJBQVk7Q0FDWixtREFBcUIsRUFBNkIsRUFBN0I7Q0FFeEIsR0F6bkJMOztDQUFBO0NBNm5CUSxnQkFBQSx1QkFBMkI7O0NBSTNCLGFBQUEsVUFBbUJ1STtDQUNuQjs7Q0FFQSxtQkFBQTtDQUVJLFVBQUlNLEdBQUcsbUJBQUcsbUJBQW1CLGNBQW5CO0NBRVYsb0JBQUEsR0FBaUJBLEdBQUcsY0FBSCxRQUF5Qk47Q0FFMUMsY0FBUSxTQUFHOztDQUVYLGNBQVEsR0FBRztDQUFLO0NBRVosd0JBQWdCO0NBQ2hCLGFBQUtuSixLQUFLL0wsSUFBSSxpQkFBaUI7Q0FFbEM7Q0FFRyxhQUFLK0wsS0FBSy9MLElBQUksS0FBS0EsSUFBSTtDQUUxQjtDQUVKOztDQUVELCtCQUFBO0NBRUEsOENBQWlDLFVBQW1Ca1Y7Q0FDcEQseUNBQTRCO0NBQzVCLHFDQUF3QixVQUFtQkE7Q0FFM0MsMkNBQUE7Q0FFQSxtQkFBQSxjQUFrQjtDQUNsQixxQkFBQSxnQkFBb0I7Q0FFdkIsR0FwcUJMOztDQUFBO0NBdXFCUXBIO0NBQ0gsR0F4cUJMOztDQUFBLHNDQTBxQmUvTjtDQUVQLFNBQUEsV0FBUSxLQUFjQTtDQUV0Qix3Q0FBMkI7Q0FFM0IscUJBQUEsdURBQWlFO0NBRWpFLCtCQUFtQixVQUFtQmtWLEVBQXRDO0NBRUEsa0JBQUE7Q0FFQSwwQkFBQTtDQUdILEdBenJCTDs7Q0FBQSw4Q0EyckJtQmxWO0NBRVg7O0NBQ0EsWUFBTyxFQUFQO0NBQ0ksV0FBSytMLEdBQUwsQ0FBU25QLFVBQVQsQ0FBcUJvRDtDQUNyQixXQUFLK0wsR0FBTCxDQUFTblAsUUFBVDtDQUNIO0NBRUosR0Fuc0JMOztDQUFBO0NBQUE7Q0F1c0JBb1ksR0FBRyxDQUFDeEMsU0FBSixDQUFja0QsS0FBZCxHQUFzQixJQUF0Qjs7S0M5c0JhQyxRQUFRLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
