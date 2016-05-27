//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
import QRErrorCorrectLevel from "qrcode/qr_error_correct_level";
import QRCodeLimitLength from "qrcode/qr_code_limit_length";
import QRCodeModel from "qrcode/qr_code_model";
import Drawing from "qrcode/drawing";
import SvgDrawing from "qrcode/drawing/svg";
import { getAndroidVersion as _getAndroid } from "qrcode/platform";

function _getUTF8Length(sText) {
	var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
	return replacedText.length + (replacedText.length != sText ? 3 : 0);
}

/**
 * Get the type by string length
 *
 * @private
 * @param {String} sText
 * @param {Number} nCorrectLevel
 * @return {Number} type
 */
function _getTypeNumber(sText, nCorrectLevel) {
	var nType = 1;
	var length = _getUTF8Length(sText);

	for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
		var nLimit = 0;

		switch (nCorrectLevel) {
			case QRErrorCorrectLevel.L:
				nLimit = QRCodeLimitLength[i][0];
				break;
			case QRErrorCorrectLevel.M:
				nLimit = QRCodeLimitLength[i][1];
				break;
			case QRErrorCorrectLevel.Q:
				nLimit = QRCodeLimitLength[i][2];
				break;
			case QRErrorCorrectLevel.H:
				nLimit = QRCodeLimitLength[i][3];
				break;
		}

		if (length <= nLimit) {
			break;
		} else {
			nType++;
		}
	}

	if (nType > QRCodeLimitLength.length) {
		throw new Error("Too long data");
	}

	return nType;
}

interface IQRCodeOptions {
	width?: number;
	height?: number;
	typeNumber?: number;
	colorDark?: string;
	colorLight?: string;
	correctLevel?: number;
	useSVG?: boolean;
	text?: string;
};

/**
 * @class QRCode
 * @constructor
 * @example
 * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
 *
 * @example
 * var oQRCode = new QRCode("test", {
 *    text : "http://naver.com",
 *    width : 128,
 *    height : 128
 * });
 *
 * oQRCode.clear(); // Clear the QRCode.
 * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
 */
export default class QRCode {
	/**
	 * @name QRCode.CorrectLevel
	 */
	public static CorrectLevel = QRErrorCorrectLevel;

	public _htOption: IQRCodeOptions = {
		width: 256,
		height: 256,
		typeNumber: 4,
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: QRErrorCorrectLevel.H,
	};
	private _el: HTMLElement;
	private drawing: any = Drawing;
	private _oDrawing;
	private _android: boolean|number;
	private _oQRCode: QRCodeModel = null;

	/**
	 * @param {HTMLElement|String} el target element or 'id' attribute of element.
	 * @param {Object|String} vOption
	 * @param {String} vOption.text QRCode link data
	 * @param {Number} [vOption.width=256]
	 * @param {Number} [vOption.height=256]
	 * @param {String} [vOption.colorDark="#000000"]
	 * @param {String} [vOption.colorLight="#ffffff"]
	 * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
	 */
	constructor(el, vOption: any) {
		if (typeof vOption === 'string') {
			vOption = {
				text: vOption
			};
		}

		// Overwrites options
		if (vOption) {
			for (let key in vOption) {
				this._htOption[key] = vOption[key];
			}
		}

		if (typeof el == "string") {
			el = document.getElementById(el);
		}

		if (this._htOption.useSVG) {
			this.drawing = SvgDrawing;
		}

		this._android = _getAndroid();
		this._el = el;
		this._oDrawing = new this.drawing(this._el, this._htOption);

		if (this._htOption.text) {
			this.makeCode(this._htOption.text);
		}
	};

	/**
	 * Make the QRCode
	 *
	 * @param {String} text link data
	 */
	public makeCode(text: string) {
		this._oQRCode = new QRCodeModel(_getTypeNumber(text, this._htOption.correctLevel), this._htOption.correctLevel);
		this._oQRCode.addData(text);
		this._oQRCode.make();
		this._el.title = text;
		this._oDrawing.draw(this._oQRCode);
		this.makeImage();
	}

	/**
	 * Make the Image from Canvas element
	 * - It occurs automatically
	 * - Android below 3 doesn't support Data-URI spec.
	 *
	 * @private
	 */
	public makeImage() {
		if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
			this._oDrawing.makeImage();
		}
	}

	/**
	 * Clear the QRCode
	 */
	public clear() {
		this._oDrawing.clear();
	}
}
