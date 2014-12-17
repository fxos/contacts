import DetailView from 'dist/view/detail_view.js';

export default class DetailController {
	constructor(record) {
		this.record = record;
		this.view = new DetailView(record);
	}

	main() {
		this.view.render(this.record);
	}
}
