from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS 
app = Flask(__name__)
CORS(app)  # Zezwalaj na zapytania z innych źróde

# Konfiguracja połączenia z MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/Forum-wedkarskie"  # URL do MongoDB

# Tworzymy obiekt PyMongo, który będzie obsługiwał połączenie z bazą danych
mongo = PyMongo(app)

# Punkt końcowy: Dodanie nowej osoby do bazy
@app.route('/wedki', methods=['POST'])
def add_Wedka():
    data = request.get_json()  # Odbieramy dane w formacie JSON
    
    if not data or not data.get('name') or data.get('price') is None:
        return jsonify({'error': 'Brak wymaganych danych: name, price'}), 400

    # Tworzymy dokument osoby       
    wedka = {
    "name": data['name'],
    "price": data['price'],
    "image": data['image']
}


    # Wstawiamy dokument do kolekcji 'persons' w bazie danych
    wedka_id = mongo.db.wedki.insert_one(wedka).inserted_id

    return jsonify({'message': f'wedka została dodana z ID: {wedka_id}'}), 201

# Punkt końcowy: Odczytanie osoby z bazy po ID
@app.route('/wedki', methods=['GET'])
def get_wedki():
    wedki = mongo.db.wedki.find()
    results = []
    for wedka in wedki:
        results.append({
            'name': wedka.get('name'),
            'price': wedka.get('price'),
            'image': wedka.get('image')
        })
    return jsonify(results), 200
@app.route('/wedki', methods=['DELETE'])
def del_all_wedki():
    mongo.db.wedki.delete_many({})
    return jsonify({'message': 'Kolekcja jest teraz pusta.'}), 200
from bson.objectid import ObjectId

@app.route('/wedki/<wedka_id>', methods=['DELETE'])
def del_single_wedka(wedka_id):
    try:
        # Usunięcie wędki na podstawie unikalnego identyfikatora
        result = mongo.db.wedki.delete_one({'_id': ObjectId(wedka_id)})
        
        if result.deleted_count == 0:
            return jsonify({'message': 'Wędka o podanym ID nie istnieje.'}), 404

        return jsonify({'message': 'Wędka została usunięta.'}), 200
    except Exception as e:
        # Obsługa błędów, np. jeśli ID nie jest poprawnym ObjectId
        return jsonify({'error': f'Nie udało się usunąć wędki: {str(e)}'}), 400

if __name__ == '__main__':
    app.run(debug=True)
