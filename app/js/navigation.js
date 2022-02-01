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
