class GeoNerdNavigation {
	constructor() {
		this.pages = document.querySelectorAll(".pages .page");
		window.addEventListener("hashchange", e => {
			this.changePage();
		});
	}

	changePage() {
		console.log("lol");
		const nextPage = document.querySelector(location.hash);
		if (nextPage) {
			this.pages.forEach(page => {
				page.classList.remove("active");
			});
			nextPage.classList.add("active");
		}
	}
}
