class GeoNerdApp {
	constructor() {
		document.addEventListener("DOMContentLoaded", () => {
			this.countries = [];
			this.easyCountries = [];
			this.countriesByLetter = {};
			this.letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "y", "z"];
			this.loadCountries(() => {
				new GeoNerdNavigation();
				new HomeCards();
				new CapitalNerdClassic();
				new CapitalNerdHard();
				new CountryNerd();
				new FlagNerdClassic();
				new FlagNerdHard();
			});
			this.loadEasyCountries(() => {
				// new MapNerdClassic();
			});
			new Settings();
		});
	}

	loadCountries(callback) {
		const request = new XMLHttpRequest();
		request.overrideMimeType("application/json");
		request.open('GET', '/data/countries-fr.json', true);
		request.onreadystatechange = () => {
			if (request.readyState === 4 && request.status === 200) {
				JSON.parse(request.responseText).forEach(country => {
					const letter = StringUtils.sanitize(country.name.substr(0, 1));
					if (!this.countriesByLetter[letter]) {
						this.countriesByLetter[letter] = [];
					}
					this.countriesByLetter[letter].push({
						sanitize: StringUtils.sanitize(country.name),
						name: country.name,
						code: country.code,
						capital: country.capital
					});
					this.countries.push({
						sanitize: StringUtils.sanitize(country.name),
						name: country.name,
						code: country.code,
						capital: country.capital
					});
				});
				callback();
			}
		};
		request.send(null);
	}

	loadEasyCountries(callback) {
		const request = new XMLHttpRequest();
		request.overrideMimeType("application/json");
		request.open('GET', '/data/countries-easy-fr.json', true);
		request.onreadystatechange = () => {
			if (request.readyState === 4 && request.status === 200) {
				JSON.parse(request.responseText).forEach(country => {
					this.easyCountries.push({
						sanitize: StringUtils.sanitize(country.name),
						name: country.name,
						code: country.code,
						capital: country.capital
					});
				});
				callback();
			}
		};
		request.send(null);
	}
}

const geoNerdApp = new GeoNerdApp();
