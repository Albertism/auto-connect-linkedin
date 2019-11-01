let connectSessionLock = false;
let totalConnectionSent = 0;
let completeSession = false;
let profileList = $('.org-people-profiles-module__profile-item');
let filteredList = [];
let collegeNameOnThePage = $('.org-top-card-summary__title')[0].title;
let collegeLocationCity = getCollegeLocationsArray()[0].replace(' ', '');
let collegeLocationState = getCollegeLocationsArray()[1].replace(' ', '');
let prospectCSVString = '';
let todayDate = getToday();

function getCollegeLocationsArray() {
	let collegeLocation = $('.org-top-card-summary__headquarter')[0].innerText.replace(' ', '');
	return collegeLocation.split(',');
}

function getToday() {
    let newDate = new Date();
    let dd = String(newDate.getDate()).padStart(2, '0');
    let mm = String(newDate.getMonth() + 1).padStart(2, '0'); //January is 0 	
    let yyyy = newDate.getFullYear();

    return mm + '/' + dd + '/' + yyyy;
}

function sendConnection (totalConnection) {
	if (!totalConnection) {
		console.error('Error: Can\'t start the session! Please specify number of connections in the parameter!');
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

	while(totalConnectionSent < totalConnection) {
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
				  addCSVentryForProspect(value);
				  let connectButton = $(value).find('.artdeco-button');
				  connectButton.click();
				  this.connectSessionLock = true;
				  clickConfirmation();
			    }
			}
		});
	}
	
	console.log('Session Finished, resetting session...');
	copyToClipboard(prospectCSVString);
	alert('Successfully sent invites to ' + totalConnection + ' total prospects!\nProspects are copied to the clipboard.');
	console.log(prospectCSVString);
	resetSession();
}

function addCSVentryForProspect(profileCardDiv) {
	let prospectNameField = $(profileCardDiv).find('.org-people-profile-card__profile-title');
	let prospectName;
	if (prospectNameField && prospectNameField.length > 0) {
		prospectName = prospectNameField[0].innerText;
		prospectName = prospectName.replace(',', '.');
	}
	let fullProfileUrl;
	let profileUrl = $(profileCardDiv).find('a');
	if (profileUrl && profileUrl.length > 0) {
		fullProfileUrl = profileUrl[0].href;
	}

	let commaSeparatedEntry = ''
	commaSeparatedEntry = prospectName + ',' + collegeNameOnThePage + ',' + collegeLocationCity + ',' + collegeLocationState + ',' + todayDate + ',' + fullProfileUrl + '\r\n';
	prospectCSVString += commaSeparatedEntry;
}

function clickConfirmation() {
	const sendNowButton = $('.artdeco-button--primary');
	sendNowButton.click();
	totalConnectionSent++;
	connectSessionLock = false;
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
	completeSession = false;
	console.log('Session is reset... Safe to relaunch a new session');
}

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};