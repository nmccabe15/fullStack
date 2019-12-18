
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import jwt
import datetime
import bcrypt
from functools import wraps
import json
from bson import ObjectId


app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'mysecret'

#mongoimport --db friendsDB --collection episodes --file friends.json --jsonArray
#write a put to delete all id fields 
client = MongoClient("mongodb://127.0.0.1:27017")
db = client.friendsDB # select the database
episodes = db.episodes # select the collection
users = db.users
blacklist = db.blacklist

def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify( {'message' : 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
        except:
            return jsonify( {'message' : 'Token is invalid'}), 401

        bl_token = blacklist.find_one({"token":token})
        if bl_token is not None:
            return make_response(jsonify( {'message' : 'Token has been cancelled'}), 401)
        return func(*args, **kwargs)
    return jwt_required_wrapper

def admin_required(func):
    @wraps(func)
    def admin_required_wrapper(*args, **kwargs):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'])

        if data["admin"]:
            return func(*args, **kwargs)
        else:
            return make_response(jsonify( {'message' : 'Admin access required'}), 401)
    return admin_required_wrapper

@app.route('/api/v1.0/login', methods=['GET'])
def login():
    auth = request.authorization
    if auth:
        user = users.find_one({'username':auth.username})
        if user is not None:
            if bcrypt.checkpw(bytes(auth.password, 'UTF-8'), user["password"]):
                token = jwt.encode( {'user' : auth.username,
                                     'admin' : user['admin'],
                                     'exp' : datetime.datetime.utcnow() + \
                                             datetime.timedelta(minutes=30)
                                    }, app.config['SECRET_KEY'])
                return make_response(jsonify( {'token':token.decode('UTF-8')}), 200)
            else:
                return make_response(jsonify( {'message':'Bad password'}), 401)
        else:
            return make_response(jsonify( {'message':'Bad username'}), 401)
    return make_response(jsonify({'message':'Authentication required'}), 401)

@app.route('/api/v1.0/logout', methods=["GET"])
@jwt_required
def logout():
    token = None
    if 'x-access-token' in request.headers:
        token = request.headers['x-access-token']
    if not token:
        return make_response(jsonify( {'message' : 'Token is missing'}), 401)
    else:
        blacklist.insert_one({"token":token})
        return make_response(jsonify( {'message' : 'Logout successful'}), 200)

@app.route("/api/v1.0/episodes", methods=["GET"])
def show_all_episodes():
    page_num, page_size = 1, 25
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    data_to_return = []
    for episode in episodes.find().skip(page_start).limit(page_size):
        episode['_id'] = str(episode['_id'])
        for review in episode['reviews']:
            review['_id'] = str(review['_id'])
        data_to_return.append(episode)
    return make_response( jsonify(data_to_return), 200 )

@app.route("/api/v1.0/episodes/<string:id>", methods=["GET"])
def show_one_episode(id):
    episode = episodes.find_one({'_id':ObjectId(id)})
    if episode is not None:
        episode['_id'] = str(episode['_id'])
        for review in episode['reviews']:
            review['_id'] = str(review['_id'])
        return make_response( jsonify( episode ), 200 )
    else:
        return make_response( jsonify( {"error" : "Invalid episode ID"} ), 404 )

@app.route("/api/v1.0/episodes/season/<int:season>", methods=["GET"])
def show_one_season(season):
    data_to_return = []
    for episode in episodes.find({'season': season}).sort("number", 1):
        if episode is not None:
            episode['_id'] = str(episode['_id'])
            for review in episode['reviews']:
                review['_id'] = str(review['_id'])
            data_to_return.append(episode)
        else:
            return make_response( jsonify( {"error" : "Invalid season number"} ), 404 )
    return make_response( jsonify(data_to_return), 200 ) 

@app.route("/api/v1.0/episodes/search/<int:season>/<int:number>", methods=["GET"])
def search_episode(season, number):
    data_to_return = []
    for episode in episodes.find({'season': season, 'number': number}):
        if episode is not None:
            episode['_id'] = str(episode['_id'])
            for review in episode['reviews']:
                review['_id'] = str(review['_id'])
            data_to_return.append(episode)
        else:
            return make_response( jsonify( {"error" : "Invalid"} ), 404 )
    return make_response( jsonify(data_to_return), 200 ) 

# reviews
@app.route("/api/v1.0/episodes/<string:bid>/reviews", methods=["POST"])
#@jwt_required
def add_new_review(bid):
    new_review = {
        "_id" : ObjectId(),
        "username" : request.form["username"],
        "comment" : request.form["comment"],
        "rating" : request.form["rating"]
    }
    episodes.update_one( { "_id" : ObjectId(bid) }, { "$push": { "reviews" : new_review } } )
    new_review_link ="http://localhost:5000/api/v1.0/episodes/" + bid + "/reviews/" + str(new_review['_id'])
    return make_response( jsonify( { "url" : new_review_link } ), 201 )

@app.route("/api/v1.0/episodes/<string:id>/reviews", methods=["GET"])
def fetch_all_reviews(id):
    data_to_return = []
    episode = episodes.find_one( { "_id" : ObjectId(id) }, { "reviews" : 1, "_id" : 0 } )
    for review in episode["reviews"]:
        review["_id"] = str(review["_id"])
        data_to_return.append(review)
    return make_response( jsonify(data_to_return ), 200 )

@app.route("/api/v1.0/episodes/<string:id>/reviews/<string:rid>", methods=["GET"])
def fetch_one_review(id, rid):
    episode = episodes.find_one( { "reviews._id" : ObjectId(rid) }, { "_id" : 0, "reviews.$": 1} )
    if episode is None:
        return make_response( jsonify( {"error" : "Invalid episode ID or review ID"} ), 404 )
    episode['reviews'][0]['_id'] = str(episode['reviews'][0]['_id'])
    return make_response( jsonify(episode['reviews'][0] ), 200 )

@app.route("/api/v1.0/episodes/<bid>/reviews/<rid>", methods=["PUT"])
def edit_review(bid, rid):
    edited_review = {
        "reviews.$.username" : request.form["username"],
        "reviews.$.comment" : request.form["comment"],
        "reviews.$.rating" : request.form['rating']
    }
    episodes.update_one( { "reviews._id" : ObjectId(rid) }, { "$set" : edited_review } )
    edit_review_url = "http://localhost:5000/api/v1.0/episodes/" + bid + "/reviews/" + rid
    return make_response( jsonify( {"url":edit_review_url} ), 200)

@app.route("/api/v1.0/episodes/<bid>/reviews/<rid>", methods=["DELETE"])
def delete_review(bid, rid):
    episodes.update_one( \
        { "_id" : ObjectId(bid) }, \
        { "$pull" : { "reviews" : \
                    { "_id" : ObjectId(rid) } } } )
    return make_response( jsonify( {} ), 204)


@app.route("/api/v1.0/episodes/reviews/<string:username>", methods=["GET"])
def show_reviews_by_username(username):
    data_to_return = []
    for episode in episodes.find({'reviews.username:': username}):
        if episode is not None:
            episode['_id'] = str(episode['_id'])
            for review in episode['reviews']:
                review['_id'] = str(review['_id'])
                data_to_return.append(review)
            else:
                return make_response( jsonify( {"error" : "Invalid username"} ), 404 )
            data_to_return.append(episode)
        else:
            return make_response( jsonify( {"error" : "Invalid season number"} ), 404 )
    return make_response( jsonify(data_to_return), 200 ) 

#users
@app.route("/api/v1.0/users", methods=["GET"])
def show_all_users():
    data_to_return = []
    for user in users.find({},{"password":0}):
        if user is not None:
            user['_id'] = str(user['_id'])
            data_to_return.append(user)
        else:
            return make_response( jsonify( {"error" : "No users found"} ), 404 )
    return make_response( jsonify(data_to_return), 200 )

if __name__ == "__main__":
    app.run(debug=True)