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
		answer = GeoNerdApp.sanitize(answer);
		let win = false;
		geoNerdApp.countriesByLetter[this.currentLetter].forEach(country => {
			const similarity = this.stringSimilarity(answer, country.sanitize);
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

	stringSimilarity = (a, b) => {
		a = this.prep(a);
		b = this.prep(b);
		const bg1 = this.bigrams(a)
		const bg2 = this.bigrams(b)
		const c1 = this.count(bg1)
		const c2 = this.count(bg2)
		const combined = this.uniq([...bg1, ...bg2])
			.reduce((t, k) => t + (Math.min(c1 [k] || 0, c2 [k] || 0)), 0)
		return 2 * combined / (bg1.length + bg2.length)
	}

	prep = (str) =>
		str.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ')

	bigrams = (str) =>
		[...str].slice(0, -1).map((c, i) => c + str [i + 1])

	count = (xs) =>
		xs.reduce((a, x) => ((a [x] = (a [x] || 0) + 1), a), {})

	uniq = (xs) =>
		[...new Set(xs)]

}
