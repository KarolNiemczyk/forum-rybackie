from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import bcrypt
import datetime
from flask_mail import Mail, Message
app = Flask(__name__)
CORS(app)  

app.config["MONGO_URI"] = "mongodb://localhost:27017/Forum-wedkarskie"
mongo = PyMongo(app)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'forumrybackie@gmail.com'  
app.config['MAIL_PASSWORD'] = 'dmwv chfm rifx gbco' 

mail = Mail(app)
@app.route('/orders', methods=['GET'])
def get_orders():
    try:
        # Pobranie wszystkich zamówień z bazy danych
        orders = list(mongo.db.orders.find())
        
        # Konwersja ObjectId na string oraz formatowanie daty
        for order in orders:
            order['_id'] = str(order['_id'])
            if 'createdAt' in order:
                order['createdAt'] = order['createdAt'].isoformat()

        return jsonify(orders), 200
    except Exception as e:
        print("Błąd przy pobieraniu zamówień:", e)
        return jsonify({'error': 'Wystąpił błąd przy pobieraniu zamówień.'}), 500
@app.route('/orders', methods=['POST'])
def add_order():
    data = request.get_json()

    # Walidacja pól
    required_fields = ['shippingAddress', 'paymentMethod', 'contactInfo', 'cartProducts']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        return jsonify({'error': f'Brak wymaganych pól: {", ".join(missing_fields)}'}), 400

    # Tworzenie obiektu zamówienia
    order = {
        "shippingAddress": data['shippingAddress'],
        "paymentMethod": data['paymentMethod'],
        "contactInfo": data['contactInfo'],
        "cartProducts": data['cartProducts'],
        "createdAt": datetime.datetime.now()
    }

    # Zapisanie zamówienia w bazie danych
    order_id = mongo.db.orders.insert_one(order).inserted_id

    # Wysyłanie e-maila
    try:
        msg = Message(
            "Potwierdzenie zamówienia",
            sender="forumrybackie@gmail.com",
            recipients=[data['contactInfo']]
        )
        msg.body = f"Dziękujemy za zamówienie! Szczegóły:\n{order}"
        mail.send(msg)
    except Exception as e:
        print("Błąd przy wysyłaniu e-maila:", e)

    return jsonify({'message': 'Zamówienie zostało złożone.', 'orderId': str(order_id)}), 200

@app.route('/wedki', methods=['POST'])
def add_wedka():
    data = request.get_json()
    required_fields = ['name', 'price', 'image', 'categories', 'description', 'size']
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    if missing_fields:
        return jsonify({'error': f'Brak wymaganych danych: {", ".join(missing_fields)}'}), 400

    existing_wedka = mongo.db.wedki.find_one({'name': data['name']})
    if existing_wedka:
        return jsonify({'error': 'Wędka o tej nazwie już istnieje.'}), 400

    wedka = {
        "name": data['name'],
        "price": data['price'],
        "image": data['image'],
        "categories": data['categories'],
        "description": data['description'],
        "size": data['size'],
        "review": data.get('review', []),
    }
    wedka_id = mongo.db.wedki.insert_one(wedka).inserted_id
    return jsonify({'message': f'Wędka została dodana z ID: {str(wedka_id)}'}), 201




@app.route('/wedki/<wedka_name>', methods=['PUT'])
def add_review(wedka_name):
    try:
        data = request.get_json()
        new_review = data.get('review')
        if not new_review:
            return jsonify({'error': 'Brak oceny'}), 400

        # Dodanie nowej opinii do istniejącej listy 'review', szukamy po nazwie wędki
        result = mongo.db.wedki.update_one(
            {'name': wedka_name},  # Zmieniamy z _id na name
            {'$push': {'review': new_review}}
        )
        if result.matched_count == 0:
            return jsonify({'message': 'Wędka o podanej nazwie nie istnieje.'}), 404

        return jsonify({'message': 'Nowa opinia dodana.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się dodać opinii: {str(e)}'}), 400


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
@app.route('/wedki/name/<name>', methods=['DELETE'])
def del_single_wedka_by_name(name):
    try:
        result = mongo.db.wedki.delete_one({'name': name})
        if result.deleted_count == 0:
            return jsonify({'message': 'Wędka o podanej nazwie nie istnieje.'}), 404

        return jsonify({'message': 'Wędka została usunięta.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się usunąć wędki: {str(e)}'}), 400


@app.route('/users', methods=['POST'])
def register_user():
    data = request.get_json()
    if not data or not data.get('login') or not data.get('password') or not data.get('mail'):
        return jsonify({'error': 'Brak wymaganych danych: login, password'}), 400

    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    user = {
        "login": data['login'],
        "mail":data['mail'],
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
@app.route('/wedki/<wedka_name>/name', methods=['PUT'])
def update_wedka_name(wedka_name):
    try:
        data = request.get_json()
        new_name = data.get('name')
        if not new_name:
            return jsonify({'error': 'Brak wymaganej nazwy'}), 400

        # Sprawdzenie, czy nowa nazwa już istnieje
        existing_wedka = mongo.db.wedki.find_one({'name': new_name})
        if existing_wedka:
            return jsonify({'error': 'Wędka o tej nazwie już istnieje.'}), 400

        result = mongo.db.wedki.update_one({'name': wedka_name}, {'$set': {'name': new_name}})
        if result.matched_count == 0:
            return jsonify({'message': 'Wędka o podanym ID nie istnieje.'}), 404

        return jsonify({'message': 'Nazwa wędki została zaktualizowana.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się zaktualizować nazwy: {str(e)}'}), 400


@app.route('/wedki/<wedka_name>/price', methods=['PUT'])
def update_wedka_price_by_name(wedka_name):
    try:
        data = request.get_json()
        new_price = data.get('price')
        if new_price is None:
            return jsonify({'error': 'Brak wymaganej ceny'}), 400

        result = mongo.db.wedki.update_one({'name': wedka_name}, {'$set': {'price': new_price}})
        if result.matched_count == 0:
            return jsonify({'message': f'Wędka o nazwie "{wedka_name}" nie istnieje.'}), 404

        return jsonify({'message': f'Cena wędki "{wedka_name}" została zaktualizowana.'}), 200
    except Exception as e:
        return jsonify({'error': f'Nie udało się zaktualizować ceny: {str(e)}'}), 400

@app.route('/wedki/<wedka_name>/image', methods=['PUT'])
def update_wedka_image_by_name(wedka_name):
    try:
        data = request.get_json()
        new_image = data.get('image')
        if not new_image:
            return jsonify({'error': 'Brak wymaganego URL do zdjęcia'}), 400

        result = mongo.db.wedki.update_one({'name': wedka_name}, {'$set': {'image': new_image}})
        if result.matched_count == 0:
            return jsonify({'message': f'Wędka o nazwie "{wedka_name}" nie istnieje.'}), 404

        return jsonify({'message': f'Zdjęcie wędki "{wedka_name}" zostało zaktualizowane.'}), 200
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
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('user') or not data.get('name') or not data.get('room') or not data.get('rating'):
        return jsonify({'error': 'Brak wymaganych danych: user, name, room, rating'}), 400

    # Add chat to the database
    chat = {
        "user": data["user"],
        "name": data['name'],
        "room": data['room'],
        "rating": data['rating'],
    }

    try:
        room_id = mongo.db.chaty.insert_one(chat).inserted_id
        return jsonify({'message': f'Chat został dodany z ID: {str(room_id)}'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chaty/<room>', methods=['GET'])
def get_chats(room):
    try:
        chats = mongo.db.chaty.find({"room": room})
        chats_list = list(chats)
        
        if not chats_list:
            return jsonify({'error': 'Brak wiadomości w tym pokoju'}), 404

        # Convert ObjectId to string for JSON compatibility
        for chat in chats_list:
            chat['_id'] = str(chat['_id'])

        return jsonify(chats_list), 200
    except Exception as e:
        print(f"Error fetching chats: {e}")
        return jsonify({'error': 'Nie udało się pobrać pokoi.'}), 500@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.json  # Odbierz dane z frontendu
    recipient = data.get('email')  # Adres e-mail odbiorcy

    if not recipient:
        return jsonify({"error": "Adres e-mail jest wymagany"}), 400

    try:
        # Tworzenie wiadomości e-mail
        msg = Message(
            subject="Zamówienie złożone",
            sender=app.config['MAIL_USERNAME'],
            recipients=[recipient],
            body="Twoje zamówienie zostało złożone. Dziękujemy za zakupy!"
        )
        mail.send(msg)
        return jsonify({"message": "E-mail został wysłany"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)