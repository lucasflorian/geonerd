class GeoNerdApp {
	constructor(props) {
		document.addEventListener("DOMContentLoaded", () => {
			this.countries = [];
			this.countriesByLetter = {};
			this.letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "y", "z"];
			this.loadCountries(() => {
				new GeoNerdNavigation();
				new CountryNerd();
				new FlagNerd();
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
					const letter = GeoNerdApp.sanitize(country.name.substr(0, 1));
					if (!this.countriesByLetter[letter]) {
						this.countriesByLetter[letter] = [];
					}
					this.countriesByLetter[letter].push({
						sanitize: GeoNerdApp.sanitize(country.name),
						name: country.name,
						code: country.code
					});
					this.countries.push({
						sanitize: GeoNerdApp.sanitize(country.name),
						name: country.name,
						code: country.code
					});
				});
				callback();
			}
		};
		request.send(null);
	}

	static sanitize(value) {
		return value.toLowerCase().normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/-/g, " ")
			.replace(/'/g, " ")
			.replace(/’/g, " ");
	}
}

const geoNerdApp = new GeoNerdApp();

class CountryNerd {
	constructor() {
		this.currentLetter = "a";
		this.countriesFound = 0;
		this.loadCountries();

		this.firstAnswer = document.querySelector(".answers .answer");
		this.answers = document.querySelector(".answers");
		this.answerContainer = document.querySelector(".answer-container");
		this.answerInput = document.querySelector("#country-answer-input");
		this.answerButton = document.querySelector("#country-answer-validate");
		this.letters = document.querySelectorAll(".letter");
		this.wonLink = document.querySelector(".won-link");
		this.tipCurrent = document.querySelector(".tip .found");
		this.tipTotal = document.querySelector(".tip .total");

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
				location.hash = "#country-nerd-" + letterText;
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
		answer = GeoNerdApp.sanitize(answer);
		let win = false;
		geoNerdApp.countriesByLetter[this.currentLetter].forEach(country => {
			if (answer === country.sanitize && !country.found) {
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
				gsap.to(this.answerInput,{
					backgroundColor: "#25961c",
					duration: 0.2,
					onComplete: ()=>{
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

			gsap.to(this.answerInput,{
				backgroundColor: "#F05050",
				duration: 0.2,
				onComplete: ()=>{
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


class GeoNerdNavigation {
	constructor() {
		this.pages = document.querySelectorAll(".pages .page");

		this.changePage();

		window.addEventListener("hashchange", e => {
			this.changePage();
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
//# sourceMappingURL=app.js.map
