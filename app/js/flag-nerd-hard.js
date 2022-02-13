class FlagNerdHard {
	constructor() {
		this.flagContainer = document.querySelector(".flag-nerd-hard .flag-container");
		this.answerContainer = document.querySelector(".flag-nerd-hard .answer-container");
		this.answerInput = this.answerContainer.querySelector(".answer-input");
		this.answerButton = this.answerContainer.querySelector(".validate-input");
		this.winMessage = document.querySelector(".flag-nerd-hard .win-message");
		this.looseMessage = document.querySelector(".flag-nerd-hard .loose-message");
		this.lifes = parseInt(localStorage.getItem("flagnerdhard.lifes")) || 3;
		this.life3 = document.querySelector(".flag-nerd-hard .heart-3");
		this.life2 = document.querySelector(".flag-nerd-hard .heart-2");
		this.life1 = document.querySelector(".flag-nerd-hard .heart-1");
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
	}

	guessFlag() {
		this.updateStorage();
		this.updateProgress();
		if (this.countriesLeft.length === 0) {
			this.winMessage.classList.add("show");
			localStorage.setItem("flagnerdhard.best", geoNerdApp.countries.length.toString());
		} else {
			this.rightAnswer = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
			this.toDataURL(`/img/flags/${this.rightAnswer.code}.svg`, (dataUrl) => {
				this.flagContainer.insertAdjacentHTML("afterbegin", `<img src="${dataUrl}"/>`);
			})
		}
	}


	buildEvents() {
		this.answerInput.addEventListener("change", e => {
			this.validateAnswer(e.target.value);
		});
		this.answerButton.addEventListener("click", e => {
			this.validateAnswer(this.answerInput.value);
		});
	}

	validateAnswer(answer) {
		let decreaseLife = false;
		let found = false;
		this.countriesLeft.forEach(country => {
			const similarity = StringUtils.similarity(answer, country.sanitize);
			if (similarity > 0.85) {
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
		document.querySelector(".flag-nerd-hard .progress .found").innerHTML = (geoNerdApp.countries.length - this.countriesLeft.length).toString();
		document.querySelector(".flag-nerd-hard .progress .best .value").innerHTML = localStorage.getItem("flagnerdhard.best") || 0;
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