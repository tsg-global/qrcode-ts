export default class QRMath {
	public static EXP_TABLE = new Array<number>(256);
	public static LOG_TABLE = new Array<number>(256);

	public static glog(n: number) {
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		return this.LOG_TABLE[n];
	}

	public static gexp(n: number) {
		while (n < 0) { n += 255; }
		while (n >= 256) { n -= 255; }
		return this.EXP_TABLE[n];
	}
};

for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}

for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
}
