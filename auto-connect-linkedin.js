let connectSessionLock = false;
let totalConnectionSent = 0;
let cancelSession = false;

	$('body').on('keydown', function(event) {
		if (event.keyCode === 67) { //keyboard C
			alert('Sending stopped');
			cancelSession = true;
			connectSessionLock = false;
		    totalConnectionSent = 0;
		}
	});

function sendConnection (totalConnection) {
	let profileList = $('.org-people-profiles-module__profile-item');
	let filteredList = [];

	// Make sure to scroll to get full list
	while (filteredList.length <= totalConnection) {
		for (let i = 0; i < 3; i++) {
			// scroll 3 times
			setTimeOut(scrollDownToBottom(), 2000); 
		}
		profileList = $('.org-people-profiles-module__profile-item');
		filteredList = profileList;
		filteredList = filterProspects(profileList);
	}

	while(totalConnectionSent <= totalConnection && !cancelSession) {
		$.each(filteredList, function(index, value) {
			while(connectSessionLock) {
				setTimeout(function() {
					console.log('Connect dialog in progress, trying 1 second later..')
				}, 1000);
			}
			let connectionInfo = $(value).find('.artdeco-button__text')[0].innerHTML;

			if (connectionInfo.indexOf('Connect') > -1) {
			  let connectButton = $(value).find('.artdeco-button');
			  connectButton.click();
			  this.connectSessionLock = true;
			  clickConfirmation();
			}
		});
	}
}

function clickConfirmation() {
	const sendNowButton = $($('.send-invite__actions').children('.artdeco-button')[1]);
	sendNowButton.click();
	totalConnectionSent++;
	connectSessionLock = false;
}

function scrollDownToBottom() {
	window.scrollTo(0,document.body.scrollHeight);
}

function filterProspects(array) {
	return $.grep(array, function(value) {
		if ($(value).find('.artdeco-inline-feedback__message').length > 0) {
			// This is invitation pending button
			return false;
		}
		let connectionInfo;
		if ($(value).find('.artdeco-button__text').length > 0) {
			connectionInfo = $(value).find('.artdeco-button__text')[0].innerHTML;
            return connectionInfo.indexOf('Connect') > -1;
		}
	});
}
