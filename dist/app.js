class GeoNerdApp {
	constructor(props) {
		document.addEventListener("DOMContentLoaded", () => {
			this.countries = [];
			this.countriesByLetter = {};
			this.letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "y", "z"];
			this.loadCountries(() => {
				new GeoNerdNavigation();
				new HomeCards();
				new CapitalNerdClassic();
				new CapitalNerdHard();
				new CountryNerd();
				new FlagNerdClassic();
				new FlagNerdHard();
			});
			new Settings();
		});
	}

	loadCountries(callback) {
		const request = new XMLHttpRequest();
		request.overrideMimeType("application/json");
		request.open('GET', '/data/countries-fr.json', true);
		request.onreadystatechange = () => {
			if (request.readyState === 4 && request.status === 200) {
				JSON.parse(request.responseText).forEach(country => {
					const letter = StringUtils.sanitize(country.name.substr(0, 1));
					if (!this.countriesByLetter[letter]) {
						this.countriesByLetter[letter] = [];
					}
					this.countriesByLetter[letter].push({
						sanitize: StringUtils.sanitize(country.name),
						name: country.name,
						code: country.code,
						capital: country.capital
					});
					this.countries.push({
						sanitize: StringUtils.sanitize(country.name),
						name: country.name,
						code: country.code,
						capital: country.capital
					});
				});
				callback();
			}
		};
		request.send(null);
	}

}

const geoNerdApp = new GeoNerdApp();

class CapitalNerdClassic {
	constructor() {
		this.flagContainer = document.querySelector(".capital-nerd-classic .flag-container");
		this.answerContainer = document.querySelector(".capital-nerd-classic .answer-container");
		this.winMessage = document.querySelector(".capital-nerd-classic .win-message");
		this.looseMessage = document.querySelector(".capital-nerd-classic .loose-message");
		this.lifes = parseInt(localStorage.getItem("capitalnerd.lifes")) || 3;
		this.life3 = document.querySelector(".capital-nerd-classic .heart-3");
		this.life2 = document.querySelector(".capital-nerd-classic .heart-2");
		this.life1 = document.querySelector(".capital-nerd-classic .heart-1");
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
					this.toDataURL(`/img/flags/${country.code}.svg`, (dataUrl) => {
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
			this.shuffle(proposals);
			proposals.forEach(proposal => {
				this.answerContainer.insertAdjacentHTML("beforeend", `<div class="country" data-country-code="${proposal.code}">${proposal.capital}</div>`);
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
		document.querySelectorAll(".capital-nerd-classic .country").forEach(guess => {
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
		localStorage.setItem("capitalnerd.countriesleft", JSON.stringify(this.countriesLeft));
	}

	updateProgress() {
		document.querySelector(".capital-nerd-classic .progress .found").innerHTML = (geoNerdApp.countries.length - this.countriesLeft.length).toString();
		document.querySelector(".capital-nerd-classic .progress .best .value").innerHTML = localStorage.getItem("capitalnerd.best") || 0;
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

	toDataURL(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.onload = () => {
			const reader = new FileReader();
			reader.onloadend = () => {
				callback(reader.result);
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	}
}

class CapitalNerdHard {
	constructor() {
		this.flagContainer = document.querySelector(".capital-nerd-hard .flag-container");
		this.answerContainer = document.querySelector(".capital-nerd-hard .answer-container");
		this.winMessage = document.querySelector(".capital-nerd-hard .win-message");
		this.looseMessage = document.querySelector(".capital-nerd-hard .loose-message");
		this.lifes = parseInt(localStorage.getItem("capitalnerdhard.lifes")) || 3;
		this.life3 = document.querySelector(".capital-nerd-hard .heart-3");
		this.life2 = document.querySelector(".capital-nerd-hard .heart-2");
		this.life1 = document.querySelector(".capital-nerd-hard .heart-1");
		this.countriesLeft = JSON.parse(localStorage.getItem("capitalnerdhard.countriesleft"));
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
			localStorage.setItem("capitalnerdhard.best", geoNerdApp.countries.length.toString());
		} else {
			this.rightAnswer = this.countriesLeft[Math.floor(Math.random() * this.countriesLeft.length)];
			const proposals = [];
			geoNerdApp.countries.forEach(country => {
				if (country.code === this.rightAnswer.code) {
					proposals.push({"code": country.code, "name": country.name, "capital": country.capital});
					this.toDataURL(`/img/flags/${country.code}.svg`, (dataUrl) => {
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
			this.shuffle(proposals);
			proposals.forEach(proposal => {
				this.answerContainer.insertAdjacentHTML("beforeend", `<div class="country" data-country-code="${proposal.code}">${proposal.capital}</div>`);
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
		document.querySelectorAll(".capital-nerd-hard .country").forEach(guess => {
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
		localStorage.setItem("capitalnerdhard.countriesleft", JSON.stringify(this.countriesLeft));
	}

	updateProgress() {
		document.querySelector(".capital-nerd-hard .progress .found").innerHTML = (geoNerdApp.countries.length - this.countriesLeft.length).toString();
		document.querySelector(".capital-nerd-hard .progress .best .value").innerHTML = localStorage.getItem("capitalnerdhard.best") || 0;
	}

	updateLife(decrease) {
		if (decrease) {
			this.lifes--;
		}
		if (this.lifes === 0) {
			this.life1.classList.add("loose");
			this.life2.classList.add("loose");
			this.life3.classList.add("loose");
			localStorage.removeItem("capitalnerdhard.countriesleft");
			localStorage.removeItem("capitalnerdhard.lifes");
			const currentBest = localStorage.getItem("capitalnerdhard.best") || 0;
			const currentScore = geoNerdApp.countries.length - this.countriesLeft.length;
			if (currentScore > currentBest) {
				localStorage.setItem("capitalnerdhard.best", currentScore.toString());
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
			localStorage.setItem("capitalnerdhard.lifes", this.lifes);
		}
		this.updateProgress();
	}

	toDataURL(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.onload = () => {
			const reader = new FileReader();
			reader.onloadend = () => {
				callback(reader.result);
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	}
}

class CountryNerd {
	constructor() {
		this.currentLetter = "a";
		this.countriesFound = 0;
		this.loadCountries();

		this.firstAnswer = document.querySelector(".country-nerd .answers .answer");
		this.answers = document.querySelector(".country-nerd .answers");
		this.answerContainer = document.querySelector(".country-nerd .answer-container");
		this.answerInput = document.querySelector("#country-answer-input");
		this.answerButton = document.querySelector("#country-answer-validate");
		this.letters = document.querySelectorAll(".country-nerd .letter");
		this.wonLink = document.querySelector(".country-nerd .won-link");
		this.tipCurrent = document.querySelector(".country-nerd .tip .found");
		this.tipTotal = document.querySelector(".country-nerd .tip .total");

		this.buildLetters();
		this.buildInputs();
	}

	buildLetters() {
		const letterPlaceholder = document.querySelector(".letter-placeholder");
		const mainTitle = document.querySelector(".country-nerd h1");
		const gameTitle = document.querySelector(".game-title");
		const lettersContainer = document.querySelector(".letters");

		this.letters.forEach(letter => {
			const letterText = letter.innerHTML.toLowerCase();
			if (localStorage.getItem("countrynerd.letter." + letterText) === "true") {
				letter.classList.add("completed");
			}
			letter.addEventListener("click", () => {
				this.currentLetter = letterText;
				// location.hash = "#country-nerd-" + letterText;
				lettersContainer.classList.add("hide");
				gsap.to(mainTitle, {
					opacity: 0,
					pointerEvents: "none",
					delay: 0.2
				});
				gsap.to(gameTitle, {
					opacity: 1,
					delay: 0.5
				});
				letterPlaceholder.innerHTML = letterText;
				this.tipTotal.innerHTML = geoNerdApp.countriesByLetter[this.currentLetter].length;
				this.firstAnswer.innerHTML = letterText;
				setTimeout(() => {
					lettersContainer.style.display = "none";
					this.answerContainer.style.display = "flex";
					gsap.to(this.answerContainer, {
						opacity: 1,
						delay: 0.1
					});
					this.answerInput.focus();
				}, 400);
			});
		});
	}

	loadCountries() {

	}

	buildInputs() {
		this.answerInput.addEventListener("change", e => {
			this.validateAnswer(e.target.value);
		});
		this.answerButton.addEventListener("click", e => {
			this.validateAnswer(this.answerInput.value);
		});
	}

	validateAnswer(answer) {
		let win = false;
		geoNerdApp.countriesByLetter[this.currentLetter].forEach(country => {
			const similarity = StringUtils.similarity(answer, country.sanitize);
			if (similarity > 0.85) {
				// if (answer === country.sanitize && !country.found) {
				win = true;
				this.answerInput.value = "";
				country.found = true;
				const rightAnswer = document.querySelector(".answers .answer:first-child");
				rightAnswer.innerHTML = `${country.name}<span class="flag ${country.code}"></span>`;
				rightAnswer.classList.add("valid");
				this.countriesFound++;
				this.tipCurrent.innerHTML = this.countriesFound;
				if (this.countriesFound === geoNerdApp.countriesByLetter[this.currentLetter].length) {
					this.finished = true;
				}
				gsap.to(this.answerInput, {
					backgroundColor: "#25961c",
					duration: 0.2,
					onComplete: () => {
						gsap.to(this.answerInput, {
							backgroundColor: "white",
							duration: 0.2
						});
					}
				});
			}
		});
		if (win) {
			if (this.finished) {
				this.wonLink.classList.add("show");
				this.answerContainer.classList.add("win");
				localStorage.setItem("countrynerd.letter." + this.currentLetter, "true");
			} else {
				this.answers.insertAdjacentHTML("afterbegin", `<div class="answer">${this.currentLetter}</div>`);
			}
		} else {

			gsap.to(this.answerInput, {
				backgroundColor: "#F05050",
				duration: 0.2,
				onComplete: () => {
					gsap.to(this.answerInput, {
						backgroundColor: "white",
						duration: 0.2
					});
				}
			});
			this.answerInput.value = "";
		}
	}
}

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
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	}
}

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
		// this.answerButton.addEventListener("click", e => {
		// 	this.validateAnswer(this.answerInput.value);
		// });
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
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	}
}

class HomeCards {
	constructor() {
		this.cards = document.querySelectorAll(".game-card.has-levels");
		document.querySelectorAll(".game-card.has-levels").forEach(card => {
			card.querySelector(".card-first-step").addEventListener("click", () => {
				this.closeCards();
				card.classList.add("show-second-step");
			});
		});
	}

	closeCards() {
		this.cards.forEach(card => {
			card.classList.remove("show-second-step");
		})
	}
}

class GeoNerdNavigation {
	constructor() {
		this.pages = document.querySelectorAll(".pages .page");

		this.changePage();

		window.addEventListener("hashchange", e => {
			this.changePage();
		});

		document.querySelectorAll(".reload").forEach(elem => {
			elem.addEventListener("click", ()=>{
				localStorage.removeItem("flagnerd.countriesleft");
				window.location.reload();
			});
		});
	}

	changePage() {
		let navTo = location.hash;
		if (!navTo){
			navTo = "#home";
		}
		const nextPage = document.querySelector(navTo);
		if (nextPage) {
			this.pages.forEach(page => {
				page.classList.remove("active");
			});
			nextPage.classList.add("active");
		}
	}
}

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

class StringUtils {
	static similarity(a, b) {
		a = this.sanitize(a);
		a = this.prep(a);
		b = this.prep(b);
		const bg1 = this.bigrams(a);
		const bg2 = this.bigrams(b);
		const c1 = this.count(bg1);
		const c2 = this.count(bg2);
		const combined = this.uniq([...bg1, ...bg2])
			.reduce((t, k) => t + (Math.min(c1 [k] || 0, c2 [k] || 0)), 0);
		return 2 * combined / (bg1.length + bg2.length);
	}

	static prep(str) {
		return str.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
	}

	static bigrams(str) {
		return [...str].slice(0, -1).map((c, i) => c + str [i + 1]);
	}

	static count(xs) {
		return xs.reduce(function(a, x) {
			a [x] = (a [x] || 0) + 1;
			return a;
			}, {});
	}

	static uniq(xs) {
		return [...new Set(xs)];
	}

	static sanitize(value) {
		return value.toLowerCase().normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/-/g, "")
			.replace(/'/g, "")
			.replace(/ /g, "")
			.replace(/’/g, "");
	}
}
//# sourceMappingURL=app.js.map
