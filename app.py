from flask import Flask, render_template, request
import requests, dotenv, os, enum, sqlite3, caribou
dotenv.load_dotenv(".env")
JUSTTCG_KEY = os.getenv("JUSTTCG_KEY")
POKEMONTCG_KEY = os.getenv("POKEMONTCG_KEY")

class Game(enum.Enum):
    MAGIC = 1
    POKEMON = 2
    LORCANA = 3
    FLESHNBLOOD = 4
    YUGIOH = 5
    ONEPIECE = 6
    UNION = 7
    DIGIMON = 8

class Condition(enum.Enum):
    S = 1
    NM = 2
    LP = 3
    MP = 4
    HP = 5
    D = 6

# def fetchNewCardData(game: Game, )
card_id = 201307
print(requests.get(f"https://api.justtcg.com/v1/cards?tcgplayerId={card_id}&include_price_history=false", headers={"X-API-Key": JUSTTCG_KEY, "Content-Type": "application/json"}).content)