;(function (window, document, undefined) {

	var defaults = {
		cond: 'mobile',
		url: '#',
		history: false,
		cookieName: 'ua-redirector-ua',
		cookieExpires: 1,
		cookiePath: '/',
		cookieDomain: ''
	};

	var extend = function (defaults, options) {
		var extended = {};
		var prop;
		for (prop in defaults) {
			if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
				extended[prop] = defaults[prop];
			}
		}
		for (prop in options) {
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				extended[prop] = options[prop];
			}
		}
		return extended;
	};

	var getUA = function () {
		var u = window.navigator.userAgent.toLowerCase();
		var ua = {
			tablet:
				(u.indexOf("windows") != -1 && u.indexOf("touch") != -1) ||
				u.indexOf("ipad") != -1 ||
				(u.indexOf("android") != -1 && u.indexOf("mobile") == -1) ||
				(u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1) ||
				u.indexOf("kindle") != -1 || u.indexOf("silk") != -1 ||
				u.indexOf("playbook") != -1,
			mobile:
				(u.indexOf("windows") != -1 && u.indexOf("phone") != -1) ||
				u.indexOf("iphone") != -1 ||
				u.indexOf("ipod") != -1 ||
				(u.indexOf("android") != -1 && u.indexOf("mobile") != -1) ||
				(u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1) ||
				u.indexOf("blackberry") != -1,
			pc: true
		};
		if (ua.tablet || ua.mobile) {
			ua.pc = false;
		}
		return ua;
	};

	var CookieUtil = {
		'get': function (name) {
			var start = document.cookie.indexOf(name + '='),
				l = start + name.length + 1;
			if ((!start) && (name != document.cookie.substring(0, name.length))) {
				return null;
			}
			if (start == -1) {
				return null;
			}
			var end = document.cookie.indexOf(';', l);
			if (end == -1) {
				end = document.cookie.length;
			}
			return decodeURIComponent(document.cookie.substring(l, end));
		},
		'set': function (name, value, expires, path, domain, secure) {
			var today = new Date();
			today.setTime(today.getTime());
			if (expires) {
				expires = expires * 1000 * 60 * 60 * 24;
			}
			var expiresDate = new Date(today.getTime() + (expires));
			document.cookie = name + '=' + escape(value) +
				((expires) ? ';expires=' + expiresDate.toGMTString() : '') +
				((path) ? ';path=' + path : '') +
				((domain) ? ';domain=' + domain : '') +
				((secure) ? ';secure' : '');
		},
		reset: function (name, path, domain) {
			if (this.get(name)) {
				document.cookie = name + '=' +
				((path) ? ';path=' + path : '') +
				((domain) ? ';domain=' + domain : '') +
				';expires=Thu, 01-Jan-1970 00:00:01 GMT';
			}
		}
	};

	var redirect = function (options) {
		if (options.history) {
			window.location.href = options.url;
		} else {
			window.location.replace(options.url);
		}
	};

	var UARedirector = function (options) {

		if (!(this instanceof UARedirector)) {
			return new UARedirector(options);
		}

		this.options = extend(defaults, options);

		this.ua = {
			tablet: false,
			mobile: false,
			pc: false
		};

		if (!!(CookieUtil.get(this.options.cookieName))) {
			// fixUA()でUAが強制されている場合、UAを偽装する。
			this.ua[CookieUtil.get(this.options.cookieName)] = true;
		} else {
			// UAを取得する。
			this.ua = getUA();
		}
	};

	// Public Methods

	// リダイレクトする。
	UARedirector.prototype.redirect = function () {
		if (typeof this.options.cond === 'string' && this.ua[this.options.cond]) {
			redirect(this.options);
		} else if (typeof this.options.cond !== 'string' && !!(this.options.cond)) {
			redirect(this.options);
		}
	};

	// UAを固定化する。
	UARedirector.prototype.fixUA = function (ua) {
		CookieUtil.set(this.options.cookieName, ua, this.options.cookieExpires, this.options.cookiePath, this.options.cookieDomain);
	};

	// 固定化したUAを解除する。
	UARedirector.prototype.resetUA = function () {
		CookieUtil.reset(this.options.cookieName, this.options.cookiePath);
	};

	window.UARedirector = UARedirector;

}(window, document));