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
