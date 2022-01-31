class Settings {
	constructor() {
		this.settingPage = document.querySelector(".page.settings");
		this.clearCountryNerd();
		this.clearFlagNerd();
	}

	clearCountryNerd() {
		this.settingPage.querySelector(".clear-country-nerd").addEventListener("click", e => {
			geoNerdApp.letters.forEach(letter => {
				localStorage.removeItem("countrynerd.letter." + letter);
			});
			e.target.classList.add("done");
		});
	}

	clearFlagNerd() {
		this.settingPage.querySelector(".clear-flag-nerd").addEventListener("click", e => {
			localStorage.removeItem("flagnerd.countriesleft");
			localStorage.removeItem("flagnerd.attempts");
			e.target.classList.add("done");
		});
	}
}
