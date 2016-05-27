import CanvasDrawing from "qrcode/drawing/canvas";
import SvgDrawing from "qrcode/drawing/svg";
import HtmlDrawing from "qrcode/drawing/html";

function _isSupportCanvas() {
	return typeof CanvasRenderingContext2D != "undefined";
}

var useSVG = document.documentElement.tagName.toLowerCase() === "svg";

export default useSVG ? SvgDrawing : !_isSupportCanvas() ? HtmlDrawing : CanvasDrawing;
