from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import bcrypt

app = Flask(__name__)
CORS(app)  # Zezwalaj na zapytania z innych źródeł

# Konfiguracja połączenia z MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/Forum-wedkarskie"
mongo = PyMongo(app)

@app.route('/wedki', methods=['POST'])
def add_wedka():
    data = request.get_json()  # Odbieramy dane w formacie JSON
    
    if not data or not data.get('name') or data.get('price') is None:
        return jsonify({'error': 'Brak wymaganych danych: name, price'}), 400

    wedka = {
        "name": data['name'],
        "price": data['price'],
        "image": data['image']
    }

    wedka_id = mongo.db.wedki.insert_one(wedka).inserted_id

    return jsonify({'message': f'Wędka została dodana z ID: {str(wedka_id)}'}), 201
@app.route('/wedki', methods=['GET'])
def get_products():
    try:
        search_query = request.args.get('search', '').lower()
        sort_order = request.args.get('sort', 'default')

        query = {}
        if search_query:
            query['name'] = {'$regex': search_query, '$options': 'i'} 

        products = mongo.db.wedki.find(query)

        # Sortowanie
        if sort_order == 'priceAsc':
            products = products.sort('price', 1)  # Sortowanie rosnące
        elif sort_order == 'priceDesc':
            products = products.sort('price', -1)  # Sortowanie malejące

        # Przekształcenie wyników na listę
        products_list = list(products)
        for product in products_list:
            product['_id'] = str(product['_id'])  # Konwersja ObjectId na string

        return jsonify(products_list), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Nie udało się pobrać produktów.'}), 500

@app.route('/wedki', methods=['DELETE'])
def del_all_wedki():
    mongo.db.wedki.delete_many({})
    return jsonify({'message': 'Kolekcja jest teraz pusta.'}), 200

@app.route('/wedki/<wedka_id>', methods=['DELETE'])
def del_single_wedka(wedka_id):
    try:
        result = mongo.db.wedki.delete_one({'_id': ObjectId(wedka_id)})
        
        if result.deleted_count == 0:
            return jsonify({'message': 'Wędka o podanym ID nie istnieje.'}), 404

        return jsonify({'message': 'Wędka została usunięta.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się usunąć wędki: {str(e)}'}), 400
@app.route('/users', methods=['POST'])
def register_user():
    data = request.get_json()
    if not data or not data.get('login') or not data.get('password'):
        return jsonify({'error': 'Brak wymaganych danych: login, password'}), 400

    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    user = {
        "login": data['login'],
        "password": hashed_password.decode('utf-8')
    }

    user_id = mongo.db.users.insert_one(user).inserted_id

    return jsonify({'message': f'Użytkownik został zarejestrowany z ID: {str(user_id)}'}), 201


# Logowanie użytkownika
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    if not data or not data.get('login') or not data.get('password'):
        return jsonify({'error': 'Brak wymaganych danych: login, password'}), 400

    user = mongo.db.users.find_one({'login': data['login']})

    if user:
        if bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'message': 'Zalogowano pomyślnie'}), 200
        else:
            return jsonify({'error': 'Niepoprawne hasło'}), 400
    else:
        return jsonify({'error': 'Niepoprawny login'}), 400
@app.route('/wedki/<wedka_id>/name', methods=['PUT'])
def update_wedka_name(wedka_id):
    try:
        data = request.get_json()
        new_name = data.get('name')
        if not new_name:
            return jsonify({'error': 'Brak wymaganej nazwy'}), 400

        result = mongo.db.wedki.update_one({'_id': ObjectId(wedka_id)}, {'$set': {'name': new_name}})
        if result.matched_count == 0:
            return jsonify({'message': 'Wędka o podanym ID nie istnieje.'}), 404

        return jsonify({'message': 'Nazwa wędki została zaktualizowana.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się zaktualizować nazwy: {str(e)}'}), 400

@app.route('/wedki/<wedka_id>/price', methods=['PUT'])
def update_wedka_price(wedka_id):
    try:
        data = request.get_json()
        new_price = data.get('price')
        if new_price is None:
            return jsonify({'error': 'Brak wymaganej ceny'}), 400

        result = mongo.db.wedki.update_one({'_id': ObjectId(wedka_id)}, {'$set': {'price': new_price}})
        if result.matched_count == 0:
            return jsonify({'message': 'Wędka o podanym ID nie istnieje.'}), 404

        return jsonify({'message': 'Cena wędki została zaktualizowana.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się zaktualizować ceny: {str(e)}'}), 400

@app.route('/wedki/<wedka_id>/image', methods=['PUT'])
def update_wedka_image(wedka_id):
    try:
        data = request.get_json()
        new_image = data.get('image')
        if not new_image:
            return jsonify({'error': 'Brak wymaganego URL do zdjęcia'}), 400

        result = mongo.db.wedki.update_one({'_id': ObjectId(wedka_id)}, {'$set': {'image': new_image}})
        if result.matched_count == 0:
            return jsonify({'message': 'Wędka o podanym ID nie istnieje.'}), 404

        return jsonify({'message': 'Zdjęcie wędki zostało zaktualizowane.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się zaktualizować zdjęcia: {str(e)}'}), 400
@app.route('/users/<userslogin>/login', methods=['PUT'])
def update_user_login(userslogin):
    try:
        data = request.get_json()
        new_login = data.get('login')

        if not new_login or not isinstance(new_login, str):
            return jsonify({'error': 'Nieprawidłowy login'}), 400

        mongo.db.users.update_one({'login': userslogin}, {'$set': {'login': new_login}})

        return jsonify({'message': 'Login zaaktualizowany pomyślnie.'}), 200
    except Exception as e:
        print(f"Błąd serwera: {e}")  # Log the error
        return jsonify({'error': f'Nie udało się zaktualizować loginu: {str(e)}'}), 500
@app.route('/users/<userslogin>/password', methods=['PUT'])
def update_user_password(userslogin):
    try:
        # Pobierz dane z zapytania
        data = request.get_json()
        first_password = data.get('password')

        # Walidacja hasła
        if not first_password or not isinstance(first_password, str):
            return jsonify({'error': 'Nieprawidłowe hasło. Hasło musi mieć co najmniej 6 znaków.'}), 400

        # Haszowanie hasła
        hashed_password = bcrypt.hashpw(first_password.encode('utf-8'), bcrypt.gensalt())

        # Aktualizacja hasła użytkownika w bazie
        result = mongo.db.users.update_one(
            {'login': userslogin},  # Znajdź użytkownika po loginie
            {'$set': {'password': hashed_password.decode('utf-8')}}  # Przechowuj hasz w postaci stringa
        )

        return jsonify({'message': 'haslo zaaktualizowana pomyślnie.'}), 200
    except Exception as e:
        print(f"Błąd serwera: {e}")  # Log the error
        return jsonify({'error': f'Nie udało się zaktualizować hasła: {str(e)}'}), 500
@app.route('/users/<login>', methods=['DELETE'])
def del_my_acc(login):
    try:
        mongo.db.users.delete_one({'login': login})

        return jsonify({'message': 'Wędka została usunięta.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się usunąć uzytkownika: {str(e)}'}), 400
    
@app.route('/pokoje', methods=['POST'])
def add_room():
    data = request.get_json()  # Odbieramy dane w formacie JSON
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Brak wymaganych danych: name'}), 400

    room = {
        "name": data['name'],
    }

    room_id = mongo.db.pokoje.insert_one(room).inserted_id

    return jsonify({'message': f'pokoj został dodany z ID: {str(room_id)}'}), 201


@app.route('/pokoje', methods=['GET'])
def get_rooms():
    try:
        rooms = mongo.db.pokoje.find()

        # Przekształcenie wyników na listę
        rooms_list = list(rooms)
        for room in rooms_list:
            room['_id'] = str(room['_id'])  # Konwersja ObjectId na string

        return jsonify(rooms_list), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Nie udało się pobrać pokoi.'}), 500
@app.route('/chaty', methods=['POST'])
def add_chat():
    data = request.get_json()  # Odbieramy dane w formacie JSON
    
    if not data or not data.get('name') or not data.get('room'):
        return jsonify({'error': 'Brak wymaganych danych: name'}), 400

    chat = {
        "name": data['name'],
        "room": data['room'],
    }

    room_id = mongo.db.chaty.insert_one(chat).inserted_id

    return jsonify({'message': f'pokoj został dodany z ID: {str(room_id)}'}), 201
if __name__ == '__main__':
    app.run(debug=True)