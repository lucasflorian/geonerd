class FlagNerd {
	constructor() {
		this.flagContainer = document.querySelector(".flag-nerd .flag-container");
		this.answerContainer = document.querySelector(".flag-nerd .answer-container");
		this.attempts = parseInt(localStorage.getItem("flagnerd.attempts")) || 0;
		this.countriesLeft = JSON.parse(localStorage.getItem("flagnerd.countriesleft"));
		if (this.countriesLeft) {

			if (this.countriesLeft.length === 0 ){
				document.querySelector(".flag-nerd .win").classList.add("show");
				this.updateProgress();
				this.updateAttempts();
				return
			}
		} else {
			this.countriesLeft = [];
			geoNerdApp.countries.forEach(country => {
				this.countriesLeft.push(country);
			});
		}
		this.updateStorage();
		this.updateAttempts();
		this.guessFlag();
	}

	guessFlag() {
		this.updateProgress();
		this.rightAnswer = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
		const proposals = [];
		geoNerdApp.countries.forEach(country => {
			if (country.code === this.rightAnswer.code) {
				this.flagContainer.insertAdjacentHTML("afterbegin", `<span class="flag ${country.code}"></span>`);
				proposals.push({"code": country.code, "name": country.name});
			}
		});
		const maxLength = this.countriesLeft.length < 4 ? this.countriesLeft.length : 4;
		while (proposals.length < maxLength) {
			const proposal = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
			if (proposal.code !== this.rightAnswer.code) {
				let duplicate = false;
				proposals.forEach(prop => {
					if(prop.code === proposal.code){
						duplicate = true;
					}
				});
				if(!duplicate){
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

	shuffle(array) {
		let currentIndex = array.length, randomIndex;
		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex], array[currentIndex]];
		}
		return array;
	}

	guess() {
		this.answerContainer.style.pointerEvents = "initial";
		document.querySelectorAll(".flag-nerd .country").forEach(guess => {
			guess.addEventListener("click", () => {
				this.updateAttempts(true);
				if (guess.dataset.countryCode === this.rightAnswer.code) {
					guess.classList.add("valid");
					this.countriesLeft = this.countriesLeft.filter(elem => elem.code !== this.rightAnswer.code);
					this.updateStorage();
				} else {
					document.querySelector(`[data-country-code="${this.rightAnswer.code}"]`).classList.add("valid");
					guess.classList.add("invalid");
				}
				this.answerContainer.style.pointerEvents = "none";
				setTimeout(() => {
					gsap.to(this.flagContainer, {
						opacity: 0,
						onComplete: () => {
							this.flagContainer.innerHTML = "";
							this.flagContainer.style.opacity = "1";
						}
					});
					gsap.to(this.answerContainer, {
						opacity: 0,
						onComplete: () => {
							this.answerContainer.innerHTML = "";
							this.answerContainer.style.opacity = "1";
							this.guessFlag();
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
		document.querySelector(".flag-nerd .progress .found").innerHTML = (geoNerdApp.countries.length - this.countriesLeft.length).toString();
		document.querySelector(".flag-nerd .progress .total").innerHTML = geoNerdApp.countries.length.toString();
	}

	updateAttempts(increase) {
		if (increase) {
			this.attempts++;
		}
		document.querySelector(".flag-nerd .attempts .number").innerHTML = this.attempts;
		localStorage.setItem("flagnerd.attempts", this.attempts);
	}

	increaseAttempts() {

	}
}

