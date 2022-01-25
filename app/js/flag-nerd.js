class FlagNerd {
	constructor() {
		const flagsContainer = document.querySelector(".flags-container");
		geoNerdApp.letters.forEach(letter => {
			geoNerdApp.countries[letter].forEach(country => {
				flagsContainer.insertAdjacentHTML("afterbegin", `<span class="flag ${country.code}"></span>`);
			});
		});

	}
}
