from flask import Flask, render_template, request
import requests, dotenv, os, enum, sqlite3, caribou, json

dotenv.load_dotenv(".env")
JUSTTCG_KEY = os.getenv("JUSTTCG_KEY")
POKEMONTCG_KEY = os.getenv("POKEMONTCG_KEY")

from flask import Flask, render_template, request
import psycopg2
app = Flask(__name__)

conn = sqlite3.connect('./collection.db')
cursor = conn.cursor()

try:
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_name TEXT NOT NULL,
            card_id TEXT NOT NULL,
            card_data BLOB NOT NULL,
            quantity INTEGER,
            condition INTEGER,
            printing TEXT NOT NULL,
            notes TEXT NOT NULL,
            price_data BLOB NOT NULL,
            last_updated INTEGER,
            last_updated_price INTEGER,
            UNIQUE (card_id, notes, condition, printing)   
        );
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            color TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS assigned_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            linked_card INTEGER REFERENCES cards (id) ON DELETE CASCADE,
            tag_id INTEGER REFERENCES tags (id) ON DELETE CASCADE,
            CONSTRAINT unique_tag UNIQUE (linked_card, tag_id)   
        );
    ''')
    conn.commit()
    print("Tables created successfully.")
except sqlite3.Error as e:
    print(f"Error creating table: {e}")
conn.close()

@app.route('/')
def home():
    return render_template("home.html.jinja")

@app.route('/add_cards', methods=["GET", "POST"])
def add_cards():
    print(request.method)
    if request.method == 'POST':
        print(request.json)
        conn = sqlite3.connect('./collection.db')
        cursor = conn.cursor()
        index = 0
        for i in request.json["card_data"]:
            cursor.execute(f"""
                INSERT INTO cards (card_name, card_id, card_data, quantity, condition, printing, notes, price_data, last_updated, last_updated_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (card_id, notes, condition, printing) DO UPDATE SET quantity = quantity + excluded.quantity;
                """,
                (str(i['name']), str(i['id']), json.dumps(i), request.json["card_quantity"][index], 2, 'Normal', '1', json.dumps({"hi":1}), 0, 0)
            )
            index += 1
        conn.commit()
        return render_template("home.html.jinja")
    return render_template("add_cards.html.jinja")

@app.route('/collection', methods=["GET", "POST"])
def collection():
    conn = sqlite3.connect('./collection.db')
    cursor = conn.cursor()
    cursor.execute("""SELECT * FROM cards""")
    card_data = cursor.fetchall()
    if request.method == 'POST':
            return render_template("submission_success.html")
    conn.close()
    return render_template("collection.html.jinja", card_data=card_data)

# @app.route('/admin')
# def admin():
#     try:
#         connection = psycopg2.connect(host="localhost", database="DB", user="postgres", password="1")
#         print("Connected to PostgreSQL database!")
#     except:
#         return render_template("dbconnect_error.html")
#     cur = connection.cursor()
#     cur.execute("CREATE TABLE IF NOT EXISTS stronger_table (id SERIAL PRIMARY KEY, shutup BOOLEAN DEFAULT FALSE, rust TEXT NOT NULL)")
#     cur.execute(f"SELECT * FROM stronger_table;")
#     data = cur.fetchall()
#     print(data)
#     connection.close()
#     return render_template("admin.html", data=data)

# class Game(enum.Enum):
#     MAGIC = 1
#     POKEMON = 2
#     LORCANA = 3
#     FLESHNBLOOD = 4
#     YUGIOH = 5
#     ONEPIECE = 6
#     UNION = 7
#     DIGIMON = 8

# class Condition(enum.Enum):
#     S = 1
#     NM = 2
#     LP = 3
#     MP = 4
#     HP = 5
#     D = 6

# # def fetchNewCardData(game: Game, )
# card_id = 201307
# print(requests.get(f"https://api.justtcg.com/v1/cards?tcgplayerId={card_id}&include_price_history=false", headers={"X-API-Key": JUSTTCG_KEY, "Content-Type": "application/json"}).content)