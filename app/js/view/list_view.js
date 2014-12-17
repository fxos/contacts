export default class ListView {
	constructor(controller) {
		this.controller = controller;
		this.element = document.body;
		this.map = new WeakMap();
		this.element.addEventListener('click', this.loadDetails.bind(this));
	}

	render(results) {
		this.element.innerHTML = '';

		results.forEach(contact => {
			var firstName = contact.givenName[0];
			var lastName = contact.familyName[0];

			var element = document.createElement('div');
			element.innerHTML = `
				${firstName} ${lastName}
			`;
			this.map.set(element, contact);

			this.element.appendChild(element);
		});
	}

	loadDetails(e) {
		var contact = this.map.get(e.target);
		if (!contact) {
			return;
		}
		// XXX: Some event?
		this.controller.itemTapped(contact);
	}
}
