import random

from flask import Flask

from flask import request
from flask import abort
from flask import render_template

from pymongo import MongoClient

# Connect with database
database_url = "localhost:27017"
database = MongoClient(database_url)
collection = database["user_study"]["jmlr20"]

app = Flask(__name__)

pieces = ["audio/piece1.mp3",
          "audio/piece1.mp3",
          "audio/piece2.mp3",
          "audio/piece3.mp3",
          "audio/piece4.mp3",
          "audio/piece5.mp3"]

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route('/')
def index():
    # Create evaluation sequence
    piece_sequence = [i+1 for i in range(len(pieces) - 1)]
    random.shuffle(piece_sequence)
    piece_sequence.insert(0, 0)

    piece_sequence = ",".join([str(i) for i in piece_sequence])
    return render_template('index.html', piece_sequence=piece_sequence,
                                           total_pieces=len(pieces))

@app.route('/tutorial')
def tutorial():
    return render_template('tutorial.html', piece_number=0,
                                              piece_name=pieces[0],
                                            total_pieces=len(pieces))

@app.route('/evaluate/<int:piece_number>')
def evaluate(piece_number):
    if piece_number > 0 and piece_number < len(pieces):
        return render_template('evaluate.html', piece_number=piece_number,
                                                  piece_name=pieces[piece_number],
                                                total_pieces=len(pieces))
    else:
        abort(404)

@app.route('/profile')
def profile():
    return render_template('profile.html', piece_number=0,
                                           total_pieces=len(pieces))

@app.route('/end')
def end():
    evaluation = {}
    for i in range(len(pieces)):
        piece_id = str(i)
        evaluation["p_" + piece_id] = request.args.get("p_" + piece_id)
        evaluation["emotion1_" + piece_id] = request.args.get("emotion1_" + piece_id)
        evaluation["emotion2_" + piece_id] = request.args.get("emotion2_" + piece_id)
        evaluation["quality_" + piece_id]  = request.args.get("quality_" + piece_id)
        evaluation["playCount_" + piece_id] = request.args.get("playCount_" + piece_id)
        evaluation["playCompleteCount_" + piece_id] = request.args.get("playCompleteCount_" + piece_id)

    evaluation["language"] = request.args.get('language')
    evaluation["year"] = request.args.get('year')
    evaluation["gender"] = request.args.get('gender')
    evaluation["xp"] = request.args.get('xp')
    evaluation["comments"] = request.args.get('comments')

    insert_result = collection.insert_one(evaluation);
    print(insert_result.inserted_id)
    return render_template('end.html', evaluation_id=insert_result.inserted_id)
