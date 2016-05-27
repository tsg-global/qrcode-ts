// android 2.x doesn't support Data-URI spec
export function getAndroidVersion() {
	let android: boolean | number = false;
	var sAgent = navigator.userAgent;

	if (/android/i.test(sAgent)) { // android
		android = true;
		const aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);

		if (aMat && aMat[1]) {
			android = parseFloat(aMat[1]);
		}
	}

	return android;
};
