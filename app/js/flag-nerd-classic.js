class FlagNerdClassic {
	constructor() {
		this.flagContainer = document.querySelector(".flag-nerd-classic .flag-container");
		this.answerContainer = document.querySelector(".flag-nerd-classic .answer-container");
		this.winMessage = document.querySelector(".flag-nerd-classic .win-message");
		this.looseMessage = document.querySelector(".flag-nerd-classic .loose-message");
		this.lifes = parseInt(localStorage.getItem("flagnerd.lifes")) || 3;
		this.life3 = document.querySelector(".flag-nerd-classic .heart-3");
		this.life2 = document.querySelector(".flag-nerd-classic .heart-2");
		this.life1 = document.querySelector(".flag-nerd-classic .heart-1");
		this.countriesLeft = JSON.parse(localStorage.getItem("flagnerd.countriesleft"));
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
			localStorage.setItem("flagnerd.best", geoNerdApp.countries.length.toString());
		} else {
			this.rightAnswer = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
			const proposals = [];
			geoNerdApp.countries.forEach(country => {
				if (country.code === this.rightAnswer.code) {
					proposals.push({"code": country.code, "name": country.name});
					this.toDataURL(`/img/flags/${country.code}.svg`, (dataUrl) => {
						this.flagContainer.insertAdjacentHTML("afterbegin", `<img src="${dataUrl}"/>`);
					})
				}
			});
			const maxLength = this.countriesLeft.length < 4 ? this.countriesLeft.length : 4;
			while (proposals.length < maxLength) {
				const proposal = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
				if (proposal.code !== this.rightAnswer.code) {
					let duplicate = false;
					proposals.forEach(prop => {
						if (prop.code === proposal.code) {
							duplicate = true;
						}
					});
					if (!duplicate) {
						proposals.push({"code": proposal.code, "name": proposal.name});
					}
				}
			}
			this.shuffle(proposals);
			proposals.forEach(proposal => {
				this.answerContainer.insertAdjacentHTML("beforeend", `<div class="country" data-country-code="${proposal.code}">${proposal.name}</div>`);
			});
			this.guess();
		}
	}

	shuffle(array) {
		let currentIndex = array.length, randomIndex;
		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}
		return array;
	}

	guess() {
		this.answerContainer.style.pointerEvents = "initial";
		document.querySelectorAll(".flag-nerd-classic .country").forEach(guess => {
			guess.addEventListener("click", () => {
				let decreaseLife = false;
				if (guess.dataset.countryCode === this.rightAnswer.code) {
					guess.classList.add("valid");
					this.countriesLeft = this.countriesLeft.filter(elem => elem.code !== this.rightAnswer.code);
					this.updateStorage();
				} else {
					document.querySelector(`[data-country-code="${this.rightAnswer.code}"]`).classList.add("valid");
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
		localStorage.setItem("flagnerd.countriesleft", JSON.stringify(this.countriesLeft));
	}

	updateProgress() {
		document.querySelector(".flag-nerd-classic .progress .found").innerHTML = (geoNerdApp.countries.length - this.countriesLeft.length).toString();
		document.querySelector(".flag-nerd-classic .progress .best .value").innerHTML = localStorage.getItem("flagnerd.best") || 0;
	}

	updateLife(decrease) {
		if (decrease) {
			this.lifes--;
		}
		if (this.lifes === 0) {
			this.life1.classList.add("loose");
			this.life2.classList.add("loose");
			this.life3.classList.add("loose");
			localStorage.removeItem("flagnerd.countriesleft");
			localStorage.removeItem("flagnerd.lifes");
			const currentBest = localStorage.getItem("flagnerd.best") || 0;
			const currentScore = geoNerdApp.countries.length - this.countriesLeft.length;
			if (currentScore > currentBest) {
				localStorage.setItem("flagnerd.best", currentScore.toString());
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
			localStorage.setItem("flagnerd.lifes", this.lifes);
		}
		this.updateProgress();
	}

	toDataURL(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.onload = () => {
			const reader = new FileReader();
			reader.onloadend = () => {
				callback(reader.result);
			}
			reader.readAsDataURL(xhr.response);
		};
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	}
}
