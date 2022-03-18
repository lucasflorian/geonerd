class MapNerdClassic {
	constructor() {
		this.buildZoom();
		this.page = document.querySelector(".map-nerd-classic");
		this.map = document.querySelector(".map-container svg");
		this.countryToGuess = document.querySelector(".country-to-guess");
		this.countryToGuessName = document.querySelector(".country-to-guess .name");
		this.countryToGuessFlag = document.querySelector(".country-to-guess .flag-container");
		this.countries = this.map.querySelectorAll("path");
		this.winMessage = this.page.querySelector(".win-message");

		this.buildClickEvent();
		this.initCountries();
		this.newProposal();
		this.reloadButton();
	}

	buildClickEvent() {
		this.countries.forEach(country => {
			country.addEventListener("click", () => {
				this.guess(country.id);
			});
		});
	}

	initCountries() {
		this.countriesLeft = JSON.parse(localStorage.getItem("mapnerdclassic.countriesleft"));
		if (this.countriesLeft) {
			if (this.countriesLeft.length === 0) {
				this.countryToGuess.remove();
				this.winMessage.classList.add("show");
				return;
			}
		} else {
			this.countriesLeft = [];
			geoNerdApp.easyCountries.forEach(country => {
				this.countriesLeft.push(country);
			});
		}
	}

	newProposal() {
		gsap.to(this.countryToGuess, {
			opacity: 1
		});
		this.countryToGuess.classList.remove("valid");
		this.countryToGuess.classList.remove("invalid");
		if (this.countriesLeft.length === 0) {
			this.countryToGuess.remove();
			this.winMessage.classList.add("show");
			localStorage.setItem("mapnerdclassic.best", geoNerdApp.easyCountries.length.toString());
		} else {
			let current = JSON.parse(localStorage.getItem("mapnerdclassic.current"));
			if (!current || current.found) {
				this.rightAnswer = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
			} else {
				this.rightAnswer = JSON.parse(localStorage.getItem("mapnerdclassic.current"));
			}
			localStorage.setItem("mapnerdclassic.current", JSON.stringify(this.rightAnswer));

			this.countryToGuessName.innerHTML = "";
			this.countryToGuessFlag.innerHTML = "";
			this.countryToGuessName.insertAdjacentHTML("beforeend", `${this.rightAnswer.name}`);
			FileUtils.toDataURL(`/img/flags/${this.rightAnswer.code}.svg`, (dataUrl) => {
				this.countryToGuessFlag.insertAdjacentHTML("afterbegin", `<div class="flag" style="background-image: url(${dataUrl})"></div>`);
			});
		}
	}

	updateStorage() {
		localStorage.setItem("mapnerdclassic.countriesleft", JSON.stringify(this.countriesLeft));
	}

	guess(countryCode) {
		if (countryCode === this.rightAnswer.code) {
			this.countryToGuess.classList.add("valid");
			this.countriesLeft = this.countriesLeft.filter(elem => elem.code !== this.rightAnswer.code);
			localStorage.setItem("mapnerdclassic.current", JSON.stringify({found: true}));
			this.updateStorage();
			setTimeout(() => {
				gsap.to(this.countryToGuess, {
					opacity: 0,
					onComplete: () => {
						this.newProposal();
					}
				});
			}, 1000);
		} else {
			this.countryToGuess.classList.add("invalid");
			setTimeout(() => {
				this.newProposal();
			}, 1000);
		}
	}

	buildZoom() {
		zoom({
			active: "zoom-active", // Class added to container when it is zoomed
			transition: "zoom-transition", // Class added to images when they are being animated, class is removed after animation is finished
			visible: "visible", // Class added to images after they are loaded,
			zoom: "map-container" // Image container class
		}, {
			scaleDefault: 2, // Used on doubleclick, doubletap and resize
			scaleDifference: 0.5, // Used on wheel zoom
			scaleMax: 100, // Maximum zoom
			scaleMin: 1, // Minimum zoom
			scrollDisable: true, // Disable page scrolling when zooming an image
			transitionDuration: 200, // This should correspond with zoom-transition transition duration
			doubleclickDelay: 300 // // Delay between clicks - used when scripts decides if user performed doubleclick or not
		});
	}

	reloadButton() {
		this.page.querySelectorAll(".reload").forEach(button => {
			button.addEventListener("click", () => {
				localStorage.removeItem("mapnerdclassic.countriesleft");
				localStorage.removeItem("mapnerdclassic.current");
				window.location.reload();
			});
		});
	}
}
