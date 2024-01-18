const urlParams = new URLSearchParams(window.location.search);
const keyword = urlParams.get('category');

// localStorage anahtarları
var LATITUDE_KEY = 'latitude';
var LONGITUDE_KEY = 'longitude';

const savedLatitude = localStorage.getItem(LATITUDE_KEY);
const savedLongitude = localStorage.getItem(LONGITUDE_KEY);

var selectedDistance = localStorage.getItem("selectedDistance");

function initMap() {
  const { Map, InfoWindow } = google.maps;
  const userLocation = new google.maps.LatLng(parseFloat(savedLatitude),parseFloat(savedLongitude));
  const map = new Map(document.getElementById('map'), {
    zoom: 15,
    center: userLocation, //Central Park
    mapId: '4504f8b37365c3d0',
  });

  // Tek bir InfoWindow nesnesi oluştur
  const infoWindow = new InfoWindow();

  // Çevredeki lokantaları bulmak için Places Service oluştur
  const placesService = new google.maps.places.PlacesService(map);

  // Yakındaki lokantaları sorgula
  const placesRequest = {
    location: map.getCenter(),
    radius: parseInt(selectedDistance), // Metre cinsinden yarıçap
    keyword: keyword || 'restoran', // Sadece restoranları getir
  };

  placesService.nearbySearch(placesRequest, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        const place = results[i];

        // Renk skalası oluşturun
        const colorScale = d3.scaleLinear()
          .domain([1, 3, 5])  // Minimum puan 1, maksimum puan 5
          .range(['darkblue', 'yellow', 'red']);  // Renk skalası: lacivert -> sarı -> kırmızı

        // Lokantanın detaylarını almak için Place Details API kullan,
        const detailsRequest = {
          placeId: place.place_id,
          fields: ['name', 'rating', 'reviews'],
        };

        placesService.getDetails(detailsRequest, (details, detailsStatus) => {
          if (detailsStatus === google.maps.places.PlacesServiceStatus.OK) {
            // Restoranın ortalama puanı ve yorum sayısını al,
            const rating = details.rating || 'No Info';
            const reviews = details.reviews || [];
            const reviewSummary = reviews.length > 0
              ? reviews.length + ' Reviews<br>Average Score: <strong>' + rating + '</strong>'
              : 'No Reviews';

            // Puanı renk skalası ile eşleştirerek arka plan rengini belirle,
            const backgroundColor = colorScale(rating);

            // Kullanıcının konumunu göstermek için Marker oluştur
            const userMarker = new google.maps.Marker({
              map,
              position: userLocation,
              title: 'You are here!',
              label: {
                text: 'You are here!',
                color: 'black',
              },
              icon: {
                path: google.maps.SymbolPath.CONE,
                scale: 10,
              },
              animation: google.maps.Animation.BOUNCE,
            });

            // Lokantaları haritaya eklemek için Marker oluşturduk
            const marker = new google.maps.Marker({
              map,
              position: place.geometry.location,
              title: place.name,
              label: {
                text: place.name,
                color: 'black',
              },
              icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                fillColor: backgroundColor,
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 10,
              },
            });

            // Marker üzerine tıklandığında info window göster
            marker.addListener('click', () => {
              // Kullanıcı yorumlarını işle
              let userReviewsHTML = '';
              if (reviews.length > 0) {
                userReviewsHTML = '<ul>';
                reviews.forEach((review) => {
                  userReviewsHTML += `<li><br>${review.text}</li>`;
                });
                userReviewsHTML += '</ul>';
              } else {
                userReviewsHTML = 'No Reviews';
              }

              // InfoWindow içeriğini ayarla
              const contentHTML = `<strong>${place.name}</strong><br>${reviewSummary}<br><br><strong>User Reviews:</strong><br>${userReviewsHTML}`;
              infoWindow.setContent(contentHTML);
              infoWindow.setPosition(place.geometry.location);
              infoWindow.open(map, marker);
              
            });
          }
        });
      }
    }
  });

  // Harita üzerinde herhangi bir yere tıklandığında InfoWindow'u kapat
  map.addListener('click', () => {
    infoWindow.close();
  });
}

initMap();