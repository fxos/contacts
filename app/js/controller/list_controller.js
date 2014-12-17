import DetailController from 'dist/controller/detail_controller.js';

import ListModel from 'dist/model/list_model.js';
import ListView from 'dist/view/list_view.js';

export default class ListController {
	constructor() {
		this.model = new ListModel();
		this.view = new ListView(this);
	}

	main() {
		this.model.getAll().then(results => {
			this.view.render(results);
		});
	}

	itemTapped(contact) {
		var detailController = new DetailController(contact);
		detailController.main();
	}
}
