class CountryNerd {
	constructor() {
		this.letterPlaceholder = document.querySelector(".letter-placeholder");
		this.mainTitle = document.querySelector(".country-nerd h1");
		this.gameTitle = document.querySelector(".game-title");
		this.letters = document.querySelectorAll(".letter");
		this.letters.forEach(letter => {
			letter.addEventListener("click", () => {
				letter.classList.add("active");
				const otherLetters = document.querySelectorAll(".letter:not(.active)");
				console.log(this.letterPlaceholder.getBoundingClientRect())
				console.log(letter.getBoundingClientRect());
				gsap.to(otherLetters, {
					opacity: 0,
					pointerEvents: "none",
					onComplete: () => {
						const placeHolderX = this.letterPlaceholder.getBoundingClientRect().x;
						const letterX = letter.getBoundingClientRect().x;
						const placeHolderY = this.letterPlaceholder.getBoundingClientRect().y;
						const letterY = letter.getBoundingClientRect().y;


						gsap.to(letter, {
							x: placeHolderX - letterX,
							y: (letterY - placeHolderY) * -1,
							ease: "power2.inOut"
						})
					}
				});
				gsap.to(this.mainTitle, {
					opacity: 0,
					pointerEvents: "none",
					delay: 0.2
				});
				gsap.to(this.gameTitle, {
					opacity: 1,
					delay: 0.5
				});
			});
		});
	}
}
