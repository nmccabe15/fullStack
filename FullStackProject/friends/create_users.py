from pymongo import MongoClient
import bcrypt
from bson import ObjectId

client = MongoClient("mongodb://127.0.0.1:27017")
db = client.friendsDB
users = db.users

data = [
            { 
              "_id" : str(ObjectId()),
              "name" : "Nicola McCabe",
              "username" : "nmccabe",
              "password" : b"password",
              "email" : "nmccabe@google.net",
              "admin" : True
            },
            { 
              "_id" : str(ObjectId()),
              "name" : "Louise McCabe",
              "username" : "lmccabe",
              "password" : b"password",
              "email" : "lmccabe@google.net",
              "admin" : False
            }
        ]

for new_user in data:
    new_user["password"] = bcrypt.hashpw(new_user["password"], bcrypt.gensalt())
    users.insert_one(new_user)

