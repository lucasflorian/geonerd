class GeoNerdApp {
	constructor(props) {
		document.addEventListener("DOMContentLoaded", () => {
			this.countries = [];
			this.countriesByLetter = {};
			this.letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "y", "z"];
			this.loadCountries(() => {
				new GeoNerdNavigation();
				this.countryNerd = new CountryNerd();
				this.flagNerd = new FlagNerd();
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
					const letter = GeoNerdApp.sanitize(country.name.substr(0, 1));
					if (!this.countriesByLetter[letter]) {
						this.countriesByLetter[letter] = [];
					}
					this.countriesByLetter[letter].push({
						sanitize: GeoNerdApp.sanitize(country.name),
						name: country.name,
						code: country.code
					});
					this.countries.push({
						sanitize: GeoNerdApp.sanitize(country.name),
						name: country.name,
						code: country.code
					});
				});
				callback();
			}
		};
		request.send(null);
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

const geoNerdApp = new GeoNerdApp();
