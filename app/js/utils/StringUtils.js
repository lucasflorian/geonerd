class StringUtils {
	static similarity(a, b) {
		a = this.sanitize(a);
		a = this.prep(a);
		b = this.prep(b);
		const bg1 = this.bigrams(a);
		const bg2 = this.bigrams(b);
		const c1 = this.count(bg1);
		const c2 = this.count(bg2);
		const combined = this.uniq([...bg1, ...bg2])
			.reduce((t, k) => t + (Math.min(c1 [k] || 0, c2 [k] || 0)), 0);
		return 2 * combined / (bg1.length + bg2.length);
	}

	static prep(str) {
		return str.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
	}

	static bigrams(str) {
		return [...str].slice(0, -1).map((c, i) => c + str [i + 1]);
	}

	static count(xs) {
		return xs.reduce(function(a, x) {
			a [x] = (a [x] || 0) + 1;
			return a;
			}, {});
	}

	static uniq(xs) {
		return [...new Set(xs)];
	}

	static sanitize(value) {
		return value.toLowerCase().normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/-/g, "")
			.replace(/'/g, "")
			.replace(/ /g, "")
			.replace(/’/g, "");
	}
}
