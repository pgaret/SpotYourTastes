var tracks
var artists

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
            let h1 = document.createElement('h1')
            let t = document.createTextNode(response.id)
            h1.append(t)
            document.getElementById('title').append(h1)
					}
			});
      $.ajax({
          url: 'https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=long_term',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log(response)
            tracks = response.items
            let h3 = document.createElement('h3')
            let t = document.createTextNode('Top Tracks')
            h3.append(t)
            document.getElementById('top_tracks').append(h3)
            for (let i = 0; i < response.items.length; i++){
              let br = document.createElement('br')
              let br1 = document.createElement('br')
              let br2 = document.createElement('br')
              let span = document.createElement('span')
              span.className = 'list_item'
              let img_url = response.items[i].album.images.length > 0 ? response.items[i].album.images[0].url : 'img/placeholder1.png'
              let t_span = document.createElement('span')
              let t_name = document.createTextNode(response.items[i].name)
              let t_album = document.createTextNode("Album: "+response.items[i].album.name)
              let t_artist = document.createTextNode("Artist: "+response.items[i].artists[0].name)
              let t_pop = document.createTextNode("Global popularity: "+response.items[i].popularity+"/100")
              t_span.className = 'list_item-caption'
              t_span.append(t_name); t_span.append(br); t_span.append(t_artist); t_span.append(br1); t_span.append(t_album); t_span.append(br2); t_span.append(t_pop)
              let img = document.createElement('img')
              img.src = img_url
              img.className = 'list_item-image'
              span.append(img)
              span.append(t_span)
              document.getElementById('top_tracks').append(span)
            }
          }
      });
      $.ajax({
          url: 'https://api.spotify.com/v1/me/top/artists?limit=20&time_range=long_term',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log(response)
            artists = response.items
            let h3 = document.createElement('h3')
            let t = document.createTextNode('Top Artists')
            h3.append(t)
            document.getElementById('top_artists').append(h3)
            for (let i = 0; i < response.items.length; i++){
              let br = document.createElement('br')
              let br1 = document.createElement('br')
              let span = document.createElement('span')
              span.className = 'list_item'
              let img_url = response.items[i].images.length > 0 ? response.items[i].images[0].url : 'img/placeholder1.png'
              let followers = response.items[i].followers.total ? response.items[i].followers.total : "None"
              let t_span = document.createElement('span')
              let t_name = document.createTextNode(response.items[i].name)
              let t_pop = document.createTextNode("Global popularity: "+response.items[i].popularity+"/100")
              let t_foll = document.createTextNode("Followers: "+followers)
              t_span.className = 'list_item-caption'
              t_span.append(t_name); t_span.append(br1); t_span.append(t_pop); t_span.append(br); t_span.append(t_foll)
              let img = document.createElement('img')
              img.src = img_url
              img.className = 'list_item-image'
              span.append(img)
              span.append(t_span)
              document.getElementById('top_artists').append(span)
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
            handleRecentlyPlayed(response)
          }
      });
		} else {
				console.log("Fail")
		}
	}
}

function handleRecentlyPlayed(response){
  if (tracks.length > 0 && artists.length > 0){
    console.log(response)
    let h3 = document.createElement('h3')
    let t = document.createTextNode('Recently Played')
    h3.append(t)
    document.getElementById('recently_played').append(h3)
    for (let i = 0; i < response.items.length; i++){
      let span = document.createElement('span')
      span.className = 'list_item'
      let br = document.createElement('br')
      let top_track = ''; let top_artist = ''
      for (let j = 0; j < tracks.length; j++){
        if (tracks[j].id === response.items[i].track.id){
          top_track = "*"
        }
      }
      for (let j = 0; j < artists.length; j++){
        if (artists[j].id === response.items[i].track.artists[0].id){
          top_artist = "*"
        }
      }
      let t_name = document.createTextNode(response.items[i].track.name+top_track)
      let t_artist = document.createTextNode(response.items[i].track.artists[0].name+top_artist)
      span.append(t_name); span.append(br); span.append(t_artist);
      document.getElementById('recently_played').append(span)
    }
  }
  else {
    setTimeout(handleRecentlyPlayed(response))
  }
}
