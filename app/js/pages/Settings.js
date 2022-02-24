class Settings {
	constructor() {
		this.settingPage = document.querySelector(".page.settings");
		this.clearCountryNerd();
		this.clearFlagNerdClassic();
		this.clearFlagNerdHard();
		this.clearCapitalNerdClassic();
		this.clearCapitalNerdHard();
	}

	clearCountryNerd() {
		this.settingPage.querySelector(".clear-country-nerd").addEventListener("click", e => {
			geoNerdApp.letters.forEach(letter => {
				localStorage.removeItem("countrynerd.letter." + letter);
			});
			e.target.classList.add("done");
		});
	}

	clearFlagNerdClassic() {
		this.settingPage.querySelector(".clear-flag-nerd-classic").addEventListener("click", e => {
			localStorage.removeItem("flagnerd.countriesleft");
			localStorage.removeItem("flagnerd.best");
			localStorage.removeItem("flagnerd.lifes");
			e.target.classList.add("done");
		});
	}

	clearFlagNerdHard() {
		this.settingPage.querySelector(".clear-flag-nerd-hard").addEventListener("click", e => {
			localStorage.removeItem("flagnerdhard.countriesleft");
			localStorage.removeItem("flagnerdhard.best");
			localStorage.removeItem("flagnerdhard.lifes");
			e.target.classList.add("done");
		});
	}

	clearCapitalNerdClassic() {
		this.settingPage.querySelector(".clear-capital-nerd-classic").addEventListener("click", e => {
			localStorage.removeItem("capitalnerd.countriesleft");
			localStorage.removeItem("capitalnerd.best");
			localStorage.removeItem("capitalnerd.lifes");
			e.target.classList.add("done");
		});
	}

	clearCapitalNerdHard() {
		this.settingPage.querySelector(".clear-capital-nerd-hard").addEventListener("click", e => {
			localStorage.removeItem("capitalnerdhard.countriesleft");
			localStorage.removeItem("capitalnerdhard.best");
			localStorage.removeItem("capitalnerdhard.lifes");
			e.target.classList.add("done");
		});
	}
}
