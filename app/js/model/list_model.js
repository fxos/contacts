export default class ListModel {
	constructor() {}

	getAll() {
		var getAll = navigator.mozContacts.getAll({
			sortBy: 'familyName',
			sortOrder: 'ascending'
		});
		var allRecords = [];

		return new Promise(resolve => {
			getAll.onsuccess = function(event) {
				var cursor = event.target;
				if (!cursor.result) {
					resolve(allRecords);
					return;
				}
				allRecords.push(cursor.result);
				cursor.continue();
			};
		});
	}
}
