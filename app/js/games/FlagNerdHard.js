class FlagNerdHard {
	constructor() {
		this.page = document.querySelector(".flag-nerd-hard");
		this.flagContainer = this.page.querySelector(".flag-container");
		this.answerContainer = this.page.querySelector(".answer-container");
		this.answerInput = this.answerContainer.querySelector(".answer-input");
		this.winMessage = this.page.querySelector(".win-message");
		this.looseMessage = this.page.querySelector(".loose-message");
		this.lifes = parseInt(localStorage.getItem("flagnerdhard.lifes")) || 3;
		this.life3 = this.page.querySelector(".heart-3");
		this.life2 = this.page.querySelector(".heart-2");
		this.life1 = this.page.querySelector(".heart-1");
		this.countriesLeft = JSON.parse(localStorage.getItem("flagnerdhard.countriesleft"));
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
		this.buildEvents();
		this.reloadButton();
	}

	guessFlag() {
		this.updateStorage();
		this.updateProgress();
		if (this.countriesLeft.length === 0) {
			this.winMessage.classList.add("show");
			localStorage.setItem("flagnerdhard.best", geoNerdApp.countries.length.toString());
		} else {
			this.rightAnswer = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
			FileUtils.toDataURL(`/img/flags/${this.rightAnswer.code}.svg`, (dataUrl) => {
				this.flagContainer.innerHTML = "";
				this.flagContainer.insertAdjacentHTML("afterbegin", `<div class="flag" style="background-image: url(${dataUrl})"></div>`);
				this.answerInput.focus();
			});
		}
	}


	buildEvents() {
		this.answerInput.addEventListener("change", e => {
			this.validateAnswer(e.target.value);
		});
	}

	validateAnswer(answer) {
		let decreaseLife = false;
		let found = false;
		this.countriesLeft.forEach(country => {
			const similarity = StringUtils.similarity(answer, country.sanitize);
			if (similarity > 0.85 && country.code === this.rightAnswer.code) {
				found = true;
			}
		});
		if (found) {
			this.countriesLeft = this.countriesLeft.filter(elem => elem.code !== this.rightAnswer.code);
			this.updateStorage();
			gsap.to(this.answerInput, {
				backgroundColor: "#33ce29",
				color: "white",
				duration: 0.3,
				onComplete: () => {
					gsap.set(this.answerInput, {
						backgroundColor: "white",
						color: "black",
						delay: 0.8
					});
				}
			});
		} else {
			decreaseLife = true;
			gsap.to(this.answerInput, {
				backgroundColor: "#F05050",
				color: "white",
				duration: 0.3,
				onComplete: () => {
					gsap.set(this.answerInput, {
						backgroundColor: "white",
						color: "black",
						delay: 0.8
					});
				}
			});
		}
		setTimeout(() => {
			gsap.to(this.flagContainer, {
				opacity: 0,
			});
			gsap.to(this.answerContainer, {
				opacity: 0,
				onComplete: () => {
					this.answerInput.value = "";
					this.updateLife(decreaseLife);
				}
			});
		}, 700);
	}

	updateStorage() {
		localStorage.setItem("flagnerdhard.countriesleft", JSON.stringify(this.countriesLeft));
	}

	updateProgress() {
		this.page.querySelector(".progress .found").innerHTML = (geoNerdApp.countries.length - this.countriesLeft.length).toString();
		this.page.querySelector(".progress .best .value").innerHTML = localStorage.getItem("flagnerdhard.best") || 0;
	}

	updateLife(decrease) {
		if (decrease) {
			this.lifes--;
		}
		if (this.lifes === 0) {
			this.life1.classList.add("loose");
			this.life2.classList.add("loose");
			this.life3.classList.add("loose");
			localStorage.removeItem("flagnerdhard.countriesleft");
			localStorage.removeItem("flagnerdhard.lifes");
			const currentBest = localStorage.getItem("flagnerdhard.best") || 0;
			const currentScore = geoNerdApp.countries.length - this.countriesLeft.length;
			if (currentScore > currentBest) {
				localStorage.setItem("flagnerdhard.best", currentScore.toString());
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

			// this.answerContainer.innerHTML = "";
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
			localStorage.setItem("flagnerdhard.lifes", this.lifes);
		}
		this.updateProgress();
	}

	reloadButton() {
		this.page.querySelectorAll(".reload").forEach(button => {
			button.addEventListener("click", () => {
				localStorage.removeItem("flagnerd.countriesleft");
				window.location.reload();
			});
		});
	}
}
