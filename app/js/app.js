class GeoNerdApp {
	constructor(props) {
		document.addEventListener("DOMContentLoaded", () => {
			this.countries = {};
			this.letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","y","z"];
			this.loadCountries(() => {
				new GeoNerdNavigation();
				new CountryNerd();
				new FlagNerd();
			});
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
					if (!this.countries[letter]) {
						this.countries[letter] = [];
					}
					this.countries[letter].push({
						sanitize: GeoNerdApp.sanitize(country.name),
						name: country.name,
						code: country.code
					});
				});
				console.log("countries loaded");
				callback();
			}
		};
		request.send(null);
	}

	static sanitize(value) {
		return value.toLowerCase().normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/-/g, " ")
			.replace(/'/g, " ")
			.replace(/’/g, " ");
	}
}

const geoNerdApp = new GeoNerdApp();
