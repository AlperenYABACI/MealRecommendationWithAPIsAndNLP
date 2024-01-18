import requests
from google.cloud import language_v1
from google.oauth2 import service_account
import os

# Dosyadan konum bilgisi, latitude ve longitude, radius okuma
with open('C:\\Users\\90531\\Downloads\\location_info.txt', 'r') as loc_file:
    lines = loc_file.readlines()
    latitude = lines[0].strip()
    longitude = lines[1].strip()
    radius = int(lines[2].strip())

# Google Places API anahtarı
places_api_key = ''

# Google Places API ile restoranları çekme
places_url = f'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&radius={radius}&types=restaurant&key={places_api_key}'
places_response = requests.get(places_url)
places_data = places_response.json()

# Hizmet hesabı kimlik bilgileri
service_account_key_path = ''
credentials = service_account.Credentials.from_service_account_file(
    service_account_key_path,
    scopes=['https://www.googleapis.com/auth/cloud-platform'],
)

# Yemek ve memnuniyet bilgileri için sözlük oluştur
yemekler = {}

# Google Cloud NLP client oluştur
client = language_v1.LanguageServiceClient(credentials=credentials)

# Her restoranın yorumlarını çekme ve yemek bilgilerini toplama
for place in places_data.get('results', []):
    place_id = place.get('place_id')

    # Restoranın yorumlarını çekme
    reviews_url = f'https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,reviews&key={places_api_key}'
    reviews_response = requests.get(reviews_url)
    reviews_data = reviews_response.json()

    for review in reviews_data.get('result', {}).get('reviews', []):
        text_content = review.get('text')
        rating = review.get('rating')

        # Yorumdaki her yemeği bulma
        for word in text_content.split():
            # Eğer kelime bir yemek adı ise, o yemeğin memnuniyet puanını toplama
            if word.lower() in ['pizza', 'hot dog', 'hamburger', 'burrito', 'cheesecake', 'donut', 'ice cream', 'Waffle', 'coffee', 'wine', 'fruit juice', 'cocktail']:
                if word not in yemekler:
                    yemekler[word] = {
                        'toplam_memnuniyet_puani': 0,
                        'kisi_sayisi': 0
                    }
                
                # Google Cloud NLP ile duygu analizi yapma
                document = language_v1.Document(content=text_content, type_=language_v1.Document.Type.PLAIN_TEXT, language='en')
                sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
                
                yemekler[word]['toplam_memnuniyet_puani'] += rating * sentiment.score
                yemekler[word]['kisi_sayisi'] += 1

# Sıralama yapma (memnuniyet puanı çarpı kişi sayısına göre)
sirali_yemekler = sorted(yemekler.items(), key=lambda x: x[1]['toplam_memnuniyet_puani'] * x[1]['kisi_sayisi'], reverse=True)

# Dosyayı yazma işlemi
with open('populer_yemekler.txt', 'w') as dosya:
    for yemek, bilgi in sirali_yemekler[:]:  # Sadece ilk 3 yemeği al
        dosya.write(f'{yemek.capitalize()}: {bilgi["toplam_memnuniyet_puani"]}\n')
    print("Yazıldı")

# Dosyayı silme işlemi
try:
    os.remove('C:\\Users\\90531\\Downloads\\location_info.txt')
    print("Dosya silindi.")
except OSError as hata:
    print(f"Dosya silinirken bir hata oluştu: {hata}")
