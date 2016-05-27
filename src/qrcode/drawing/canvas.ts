import { getAndroidVersion as _getAndroid } from "qrcode/platform";

function _onMakeImage() {
	this._elImage.src = this._elCanvas.toDataURL("image/png");
	this._elImage.style.display = "block";
	this._elCanvas.style.display = "none";
}

// Android 2.1 bug workaround
// http://code.google.com/p/android/issues/detail?id=5141
if (this._android && this._android <= 2.1) {
	const factor = 1 / window.devicePixelRatio;
	const drawImage = CanvasRenderingContext2D.prototype.drawImage;
	CanvasRenderingContext2D.prototype.drawImage = function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
		if (("nodeName" in image) && /img/i.test(image.nodeName)) {
			for (let i = arguments.length - 1; i >= 1; i--) {
				arguments[i] = arguments[i] * factor;
			}
		} else if (typeof dw == "undefined") {
			arguments[1] *= factor;
			arguments[2] *= factor;
			arguments[3] *= factor;
			arguments[4] *= factor;
		}

		drawImage.apply(this, arguments);
	};
}

/**
 * Check whether the user's browser supports Data URI or not
 *
 * @private
 * @param {Function} fSuccess Occurs if it supports Data URI
 * @param {Function} fFail Occurs if it doesn't support Data URI
 */
function _safeSetDataURI(fSuccess, fFail) {
	const self = this;
	self._fFail = fFail;
	self._fSuccess = fSuccess;

	// Check it just once
	if (self._bSupportDataURI === null) {
		let el = document.createElement("img");
		let fOnError = function() {
			self._bSupportDataURI = false;

			if (self._fFail) {
				self._fFail.call(self);
			}
		};
		let fOnSuccess = function() {
			self._bSupportDataURI = true;

			if (self._fSuccess) {
				self._fSuccess.call(self);
			}
		};

		el.onabort = fOnError;
		el.onerror = fOnError;
		el.onload = fOnSuccess;
		el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
		return;
	} else if (self._bSupportDataURI === true && self._fSuccess) {
		self._fSuccess.call(self);
	} else if (self._bSupportDataURI === false && self._fFail) {
		self._fFail.call(self);
	}
};

export default class CanvasDrawing {
	private _bIsPainted: boolean = false;
	private _bSupportDataURI: boolean = null;
	private _android: boolean|number = _getAndroid();
	private _el: HTMLElement;
	private _elCanvas: HTMLCanvasElement;
	private _elImage: HTMLImageElement;
	private _oContext: any;
	private _htOption;

	/**
	 * Drawing QRCode by using canvas
	 *
	 * @constructor
	 * @param {HTMLElement} el
	 * @param {Object} htOption QRCode Options
	 */
	constructor(el, htOption) {
		this._htOption = htOption;
		this._elCanvas = document.createElement("canvas");
		this._elCanvas.width = htOption.width;
		this._elCanvas.height = htOption.height;
		el.appendChild(this._elCanvas);
		this._el = el;
		this._oContext = this._elCanvas.getContext("2d");
		this._bIsPainted = false;
		this._elImage = document.createElement("img");
		this._elImage.alt = "Scan me!";
		this._elImage.style.display = "none";
		this._el.appendChild(this._elImage);
		this._bSupportDataURI = null;
	};

	/**
	 * Draw the QRCode
	 *
	 * @param {QRCode} oQRCode
	 */
	public draw(oQRCode) {
		const _elImage = this._elImage;
		const _oContext = this._oContext;
		const _htOption = this._htOption;

		const nCount = oQRCode.getModuleCount();
		const nWidth = _htOption.width / nCount;
		const nHeight = _htOption.height / nCount;
		const nRoundedWidth = Math.round(nWidth);
		const nRoundedHeight = Math.round(nHeight);

		_elImage.style.display = "none";
		this.clear();

		for (let row = 0; row < nCount; row++) {
			for (let col = 0; col < nCount; col++) {
				const bIsDark = oQRCode.isDark(row, col);
				const nLeft = col * nWidth;
				const nTop = row * nHeight;
				_oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
				_oContext.lineWidth = 1;
				_oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
				_oContext.fillRect(nLeft, nTop, nWidth, nHeight);

				// 안티 앨리어싱 방지 처리
				_oContext.strokeRect(
					Math.floor(nLeft) + 0.5,
					Math.floor(nTop) + 0.5,
					nRoundedWidth,
					nRoundedHeight
				);

				_oContext.strokeRect(
					Math.ceil(nLeft) - 0.5,
					Math.ceil(nTop) - 0.5,
					nRoundedWidth,
					nRoundedHeight
				);
			}
		}

		this._bIsPainted = true;
	};

	/**
	 * Make the image from Canvas if the browser supports Data URI.
	 */
	public makeImage() {
		if (this._bIsPainted) {
			_safeSetDataURI.call(this, _onMakeImage);
		}
	};

	/**
	 * Return whether the QRCode is painted or not
	 *
	 * @return {Boolean}
	 */
	public isPainted() {
		return this._bIsPainted;
	};

	/**
	 * Clear the QRCode
	 */
	public clear() {
		this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
		this._bIsPainted = false;
	};

	/**
	 * @private
	 * @param {Number} nNumber
	 */
	public round(nNumber) {
		if (!nNumber) {
			return nNumber;
		}

		return Math.floor(nNumber * 1000) / 1000;
	};
}
