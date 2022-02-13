class GeoNerdApp {
	constructor(props) {
		document.addEventListener("DOMContentLoaded", () => {
			this.countries = [];
			this.countriesByLetter = {};
			this.letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "y", "z"];
			this.loadCountries(() => {
				new GeoNerdNavigation();
				this.countryNerd = new CountryNerd();
				this.flagNerd = new FlagNerdClassic();
				this.flagNerdHard = new FlagNerdHard();
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
						code: country.code
					});
					this.countries.push({
						sanitize: StringUtils.sanitize(country.name),
						name: country.name,
						code: country.code
					});
				});
				callback();
			}
		};
		request.send(null);
	}

}

const geoNerdApp = new GeoNerdApp();
