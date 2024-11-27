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

if __name__ == '__main__':
    app.run(debug=True)
