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
		});
	}
}
