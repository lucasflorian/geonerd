class CapitalNerdClassic {
	constructor() {
		this.page = document.querySelector(".capital-nerd-classic");
		this.flagContainer = this.page.querySelector(".flag-container");
		this.answerContainer = this.page.querySelector(".answer-container");
		this.winMessage = this.page.querySelector(".win-message");
		this.looseMessage = this.page.querySelector(".loose-message");
		this.lifes = parseInt(localStorage.getItem("capitalnerd.lifes")) || 3;
		this.life3 = this.page.querySelector(".heart-3");
		this.life2 = this.page.querySelector(".heart-2");
		this.life1 = this.page.querySelector(".heart-1");

		this.reloadButton();

		this.countriesLeft = JSON.parse(localStorage.getItem("capitalnerd.countriesleft"));
		if (this.countriesLeft) {
			if (this.countriesLeft.length === 0) {
				this.winMessage.classList.add("show");
				this.updateProgress();
				return;
			}
		} else {
			this.countriesLeft = [];
			geoNerdApp.countries.forEach(country => {
				this.countriesLeft.push(country);
			});
		}
		this.updateStorage();
		this.updateLife();
	}

	guessFlag() {
		this.updateStorage();
		this.updateProgress();
		if (this.countriesLeft.length === 0) {
			this.winMessage.classList.add("show");
			localStorage.setItem("capitalnerd.best", geoNerdApp.countries.length.toString());
		} else {
			this.rightAnswer = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
			const proposals = [];
			geoNerdApp.countries.forEach(country => {
				if (country.code === this.rightAnswer.code) {
					proposals.push({"code": country.code, "name": country.name, "capital": country.capital});
					FileUtils.toDataURL(`/img/flags/${country.code}.svg`, (dataUrl) => {
						this.flagContainer.insertAdjacentHTML("afterbegin", `<div class="name" >${country.name}</div>`);
						this.flagContainer.insertAdjacentHTML("afterbegin", `<div class="flag" style="background-image: url(${dataUrl})"></div>`);
					});
				}
			});
			const maxLength = this.countriesLeft.length < 4 ? this.countriesLeft.length : 4;
			while (proposals.length < maxLength) {
				const proposal = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
				if (proposal.code !== this.rightAnswer.code) {
					let duplicate = false;
					for (let prop of proposals) {
						if (prop.code === proposal.code) {
							duplicate = true;
						}
					}
					if (!duplicate) {
						proposals.push({"code": proposal.code, "name": proposal.name, "capital": proposal.capital});
					}
				}
			}
			ArrayUtils.shuffle(proposals);
			proposals.forEach(proposal => {
				this.answerContainer.insertAdjacentHTML("beforeend", `<div class="country" data-country-code="${proposal.code}">${proposal.capital}</div>`);
			});
			this.guess();
		}
	}

	guess() {
		this.answerContainer.style.pointerEvents = "initial";
		this.page.querySelectorAll(".country").forEach(guess => {
			guess.addEventListener("click", () => {
				let decreaseLife = false;
				if (guess.dataset.countryCode === this.rightAnswer.code) {
					guess.classList.add("valid");
					this.countriesLeft = this.countriesLeft.filter(elem => elem.code !== this.rightAnswer.code);
					this.updateStorage();
				} else {
					this.page.querySelector(`[data-country-code="${this.rightAnswer.code}"]`).classList.add("valid");
					guess.classList.add("invalid");
					decreaseLife = true;
				}
				this.answerContainer.style.pointerEvents = "none";
				setTimeout(() => {
					gsap.to(this.flagContainer, {
						opacity: 0,
					});
					gsap.to(this.answerContainer, {
						opacity: 0,
						onComplete: () => {
							this.updateLife(decreaseLife);
						}
					});
				}, 700);
			});
		});
	}

	updateStorage() {
		localStorage.setItem("capitalnerd.countriesleft", JSON.stringify(this.countriesLeft));
	}

	updateProgress() {
		this.page.querySelector(".progress .found").innerHTML = (geoNerdApp.countries.length - this.countriesLeft.length).toString();
		this.page.querySelector(".progress .best .value").innerHTML = localStorage.getItem("capitalnerd.best") || 0;
	}

	updateLife(decrease) {
		if (decrease) {
			this.lifes--;
		}
		if (this.lifes === 0) {
			this.life1.classList.add("loose");
			this.life2.classList.add("loose");
			this.life3.classList.add("loose");
			localStorage.removeItem("capitalnerd.countriesleft");
			localStorage.removeItem("capitalnerd.lifes");
			const currentBest = localStorage.getItem("capitalnerd.best") || 0;
			const currentScore = geoNerdApp.countries.length - this.countriesLeft.length;
			if (currentScore > currentBest) {
				localStorage.setItem("capitalnerd.best", currentScore.toString());
			}
			gsap.to(this.flagContainer, {
				opacity: 0,
			});
			gsap.to(this.answerContainer, {
				opacity: 0,
				onComplete: () => {
					this.looseMessage.classList.add("show");
				}
			});
		} else {

			this.flagContainer.innerHTML = "";
			this.flagContainer.style.opacity = "1";

			this.answerContainer.innerHTML = "";
			this.answerContainer.style.opacity = "1";

			switch (this.lifes) {
				case 3:
					this.life1.classList.remove("loose");
					this.life2.classList.remove("loose");
					this.life3.classList.remove("loose");
					break;
				case 2:
					this.life1.classList.remove("loose");
					this.life2.classList.remove("loose");
					this.life3.classList.add("loose");
					break;
				case 1:
					this.life1.classList.remove("loose");
					this.life2.classList.add("loose");
					this.life3.classList.add("loose");
					break;
				default:
					break;
			}
			this.guessFlag();
			localStorage.setItem("capitalnerd.lifes", this.lifes);
		}
		this.updateProgress();
	}

	reloadButton() {
		this.page.querySelectorAll(".reload").forEach(button => {
			button.addEventListener("click", () => {
				localStorage.removeItem("capitalnerd.countriesleft");
				window.location.reload();
			});
		});
	}
}
