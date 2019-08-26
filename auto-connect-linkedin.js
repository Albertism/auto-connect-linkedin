let connectSessionLock = false;
let totalConnectionSent = 0;
let cancelSession = false;
let profileList = $('.org-people-profiles-module__profile-item');
let filteredList = [];

	$('body').on('keydown', function(event) {
		if (event.keyCode === 67) { //keyboard C
			alert('Sending stopped');
			cancelSession = true;
			connectSessionLock = false;
		    totalConnectionSent = 0;
		    setTimeout(resetSession(), 3000);
		}
	});

function sendConnection (totalConnection) {
	if (!totalConnection) {
		console.error('Error: Can\'t start the session! Please specify number of connections in the parameter!');
		return;
		
	}
	if (totalConnection > 60) {
		console.error('Error: To ensure to not raise the flag, please keep the invitation sent per session lower than 60');
		return;
	}
	console.log('Initializing Session...');
	// Make sure to scroll to get full list
	if (filteredList.length <= totalConnection) {
		console.log('Not enough prospect in this page, loading more connection...');
		// scroll to load
		loadMoreConnection(totalConnection);
		setTimeout(() => {
			sendConnection(totalConnection);
		}, 2000);
		return;
	}

	if (filteredList.length > totalConnection) {
		filteredList = filteredList.slice(0, totalConnection);	
	}

	console.log('Successfully filtered ' + filteredList.length + ' potential prospects. Sending invites...');

	while(totalConnectionSent <= totalConnection && !cancelSession) {
		$.each(filteredList, function(index, value) {
			while(connectSessionLock) {
				setTimeout(function() {
					console.log('Connect dialog already in progress, trying 1 second later..')
				}, 1000);
			}
			let connectionInfo = $(value).find('.artdeco-button__text');
			if (connectionInfo.length < 1) {
				console.error('Cannot locate the connect button? ' + connectionInfo);
			} else {
				connectionInfo = connectionInfo[0].innerHTML;
				if (connectionInfo.indexOf('Connect') > -1) {
				  let connectButton = $(value).find('.artdeco-button');
				  connectButton.click();
				  this.connectSessionLock = true;
				  clickConfirmation();
			    }
			}
		});
	}
	
	console.log('Session Finished, resetting session...');
	alert('Successfully sent invites to ' + totalConnection + ' total prospects!');
	resetSession();
}

function clickConfirmation() {
	const sendNowButton = $($('.send-invite__actions').children('.artdeco-button')[1]);
	setTimeout(() => {
		sendNowButton.click();
		totalConnectionSent++;
		connectSessionLock = false;
	}, 100);
	
}

function loadMoreConnection(totalConnection) {
	window.scrollTo(0, document.body.scrollHeight);
	setTimeout(() => {
		profileList = $('.org-people-profiles-module__profile-item');
		filteredList = profileList;
		filteredList = filterProspects(profileList);
		console.log('Currently Filtered Prospects: ', filteredList.length, '/', totalConnection);
	}, 2000);
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

function resetSession() {
	connectSessionLock = false;
	totalConnectionSent = 0;
	profileList = [];
	filteredList = [];
	cancelSession = false;
	console.log('Session is reset... Safe to relaunch a new session');
}