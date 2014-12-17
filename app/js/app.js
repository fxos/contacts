var allContacts = navigator.mozContacts.getAll({
	sortBy: 'familyName',
	sortOrder: 'ascending'
});

allContacts.onsuccess = function(event) {
	var cursor = event.target;
	if (!cursor.result) {
		return;
	}
	addContact(cursor.result);
	cursor.continue();
};

function addContact(contact) {
	var firstName = contact.givenName[0];
	var lastName = contact.familyName[0];

	document.body.innerHTML += `${firstName} ${lastName}<br>`;
}
