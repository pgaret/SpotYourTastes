function generateRandomString(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function handleSpotify(){
	var state_key = 'spotify_auth_state'

	var client_id = '989f3f3de3af4e5796d9b5e15bc87aeb'
	var redirect_uri = 'https://pgaret.github.io/SpotYourTastes/music'
	var state = generateRandomString(16)

	localStorage.setItem(state_key, state)
	var scope = 'user-read-email user-top-read user-library-read user-follow-read user-read-recently-played'

	var url = 'https://accounts.spotify.com/authorize?response_type=token'
	url += '&client_id='+encodeURIComponent(client_id)
	url += '&scope=' + encodeURIComponent(scope);
	url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
	url += '&state=' + encodeURIComponent(state);

	window.location = url
}

function getHashParams() {
	var hashParams = {};
	var e, r = /([^&;=]+)=?([^&;]*)/g,
			q = window.location.hash.substring(1);
	while ( e = r.exec(q)) {
		 hashParams[e[1]] = decodeURIComponent(e[2]);
	}
	return hashParams;
}

function getMusicInfo(){
	var params = getHashParams()
	var access_token = params.access_token
	var state = params.state
	var stored_state = localStorage.getItem('spotify_auth_state')

	if (access_token && (state == null || state !== stored_state)){
		alert("Authorization failed")
	} else {
		localStorage.removeItem('spotify_auth_state')
		if (access_token){
			$.ajax({
					url: 'https://api.spotify.com/v1/me',
					headers: {
						'Authorization': 'Bearer ' + access_token
					},
					success: function(response) {
            console.log(response)
						var body = document.getElementsByTagName('body')[0]
            let h1 = document.createElement('h1')
            let t = document.createTextNode(response.id+"'s Taste")
            h1.append(t)
            body.append(h1)
					}
			});
      $.ajax({
          url: 'https://api.spotify.com/v1/me/top/artists',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log(response)
            var body = document.getElementsByTagName('body')[0]
            for (let i = 0; i < response.items.length; i++){
              let span = document.createElement('span')
              span.className = 'top_artist'
              let t = document.createTextNode(response.items[i].name)
              if (response.items[i].images.length > 0){
                let img = document.createElement('img')
                img.src = response.items[i].images[0].url
                img.className = 'top_artist-image'
                span.append(img)
                span.append(document.createElement('br'))
              }
              span.append(t)
              body.append(span)
            }
          }
      });
      $.ajax({
          url: 'https://api.spotify.com/v1/me/player/recently-played',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log(response)
          }
      });
		} else {
				console.log("Fail")
		}
	}
}
