(function($) {
	var vendor = getVendorPrefix().css;

	function animateTo(that, pos) {
		if(getIe()) {
			that.css({
				'left': pos+'px'
			}, 500)
		} else {
			that.css(vendor+"transform", 'translate('+pos+'px, 0px) translateZ(0px)');
		}
	}

	function getVendorPrefix() {
		var styles = window.getComputedStyle(document.documentElement, ''),
			pre = (Array.prototype.slice
					.call(styles)
					.join('')
					.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
			)[1],
			dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];

		dom = dom || "";
		pre = pre || "";

		return {
			dom: dom,
			lowercase: pre,
			css: '-' + pre + '-',
			js: pre[0].toUpperCase() + pre.substr(1)
		};
	}

	function getPosition(handler) {
		var moveStatus;
		if(getIe()) {
			moveStatus = handler.position().left;
		} else {
			var style = window.getComputedStyle(handler.get(0));
			var matrix = new WebKitCSSMatrix(style.transform || style.webkitTransform);
			moveStatus = matrix.m41;
		}
		return moveStatus;
	}

	function getIe() {
		var browser = {
			isIe: function () {
				return navigator.appVersion.indexOf("MSIE") != -1;
			},
			navigator: navigator.appVersion,
			getVersion: function() {
				var version = 999;
				if (navigator.appVersion.indexOf("MSIE") != -1)
					version = parseFloat(navigator.appVersion.split("MSIE")[1]);
				return version;
			}
		};
		return browser.isIe() && browser.getVersion() <= 9;
	}

	$.fn.swipeTo = function(options) {
		var settings = $.extend({
			minSwipe: 100,
			angle: 10,
			wrapScroll: 'body',
			binder: true,
			swipeStart: function() {},
			swipeMove: function() {},
			swipeEnd: function() {}
		}, options );

		var start;
		var moving;
		var res;
		var minSwipe = settings.minSwipe;
		var moveStatus;
		var wrapScroll = $(settings.wrapScroll);
		var handler = this.selector;
		var binder = settings.binder;
		var swipeStart = settings.swipeStart;
		var swipeMove = settings.swipeMove;
		var swipeEnd = settings.swipeEnd;

		$(document.body).on('touchstart', handler, function(ev) {
			var that = $(this);
			var e = ev.originalEvent;
			start = e.touches[0].clientX;
			moveStatus = getPosition(that);
			start = 0 - moveStatus + start;//按钮遮盖层（div.open）停留位置
			if(typeof swipeStart == 'function') {
				swipeStart.call(this);
			}
		});

		$(document.body).on('touchmove', handler, function(ev) {
			var that = $(this);
			var e = ev.originalEvent;

			that.removeClass('swiped');
			that.css(vendor+"transition", "");

			moving = e.changedTouches[0].clientX;
			if ( moving > 0 ) moving = Math.min(moving, that.width());

			res = start - moving;
			var resPx = Math.min(0, 0 - res);
			if( resPx <= 0 ) {
				wrapScroll.addClass('overflow-hidden');
				animateTo(that, resPx);
				if(!that.hasClass('swiping')) {
					that.addClass('swiping');
				}
			}

			if(typeof swipeMove == 'function') {
				swipeMove.call(this);
			}
		});

		$(document.body).on('touchend', handler, function() {
			var that = $(this);
			wrapScroll.removeClass('overflow-hidden');
			that.removeClass('swiping');
			moveStatus = getPosition(that);
			var absMoveStatus = Math.abs(moveStatus);
			that.addClass('swiped');
			that.css(vendor+"transition", vendor+'transform 500ms cubic-bezier(0.1, 0.57, 0.1, 1)');

			if(absMoveStatus < minSwipe) {
				animateTo(that, 0);
				that.removeClass('open');
			} else {
				animateTo(that, 0 - minSwipe);
				that.addClass('open');
			}
			if(typeof swipeEnd == 'function') {
				swipeEnd.call(this);
			}
		});

		if(binder) {
			$(document.body).on('click tap', handler, function(ev) {
				if(moveStatus != 0) {
					var that = $(this);
					var e = ev.originalEvent;
					e.preventDefault();
					that.addClass('swiped');
					animateTo(that, 0);
					that.removeClass('open');
				}

			});
		}
	};
}(Zepto));

