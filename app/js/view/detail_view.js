export default class DetailView {
	constructor(model) {
		this.element = document.body;
		this.model = model;
	}

	render() {
		var firstName = this.model.givenName[0];
		var lastName = this.model.familyName[0];

		this.element.innerHTML = `
			<h1>Contact Details</h1>
			${firstName} ${lastName}
		`;
	}
}
