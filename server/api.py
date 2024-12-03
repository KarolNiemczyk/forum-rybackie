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
def get_wedki():
    wedki = mongo.db.wedki.find()
    results = []
    for wedka in wedki:
        results.append({
            'id': str(wedka.get('_id')),  # Konwersja ObjectId na string
            'name': wedka.get('name'),
            'price': wedka.get('price'),
            'image': wedka.get('image')
        })
    return jsonify(results), 200

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
# @app.route('/users/<userslogin>/login', methods=['PUT'])
# def update_user_login(userslogin):
#     try:
#         # Retrieve JSON payload
#         data = request.get_json()
#         new_login = data.get('login')

#         # Validate the new login
#         if not new_login or not isinstance(new_login, str):
#             return jsonify({'error': 'Nieprawidłowy login'}), 400

#         # Update the user's login in the database
#         result = mongo.db.wedki.update_one({'login': userslogin}, {'$set': {'login': new_login}})
        
#         # Check if the document was updated
#         if result.modified_count == 0:
#             return jsonify({'error': 'Login nie został zmieniony lub użytkownik nie istnieje.'}), 404

#         # Return success message
#         return jsonify({'message': 'Login zaaktualizowany pomyślnie.'}), 200
#     except Exception as e:
#         print(f"Błąd serwera: {e}")  # Log the error
#         return jsonify({'error': f'Nie udało się zaktualizować loginu: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)