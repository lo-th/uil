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
